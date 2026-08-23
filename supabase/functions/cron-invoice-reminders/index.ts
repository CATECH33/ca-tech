// cron-invoice-reminders — Edge Function Deno
// Planifiée quotidiennement à 8h00 UTC via pg_cron.
// verify_jwt = false (pas de JWT user dans un contexte cron).
// Auth via CRON_SECRET dans le header Authorization.
//
// Flux :
//   1. Scan des factures overdue (status sent|overdue, due_date < today, skip_reminders=false)
//   2. Classement par stade (douce / ferme / mise_en_demeure / escalade)
//   3. Anti-doublon 48h par (invoice_id, stage)
//   4. Génération email via Claude Haiku
//   5. Envoi via Gmail API (tokens lus depuis google_integrations)
//   6. Log dans invoice_reminders
//   7. Stade escalade → notification in-app uniquement

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Env vars ────────────────────────────────────────────────────────────────

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY')!
const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const CRON_SECRET      = Deno.env.get('CRON_SECRET')!

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'douce' | 'ferme' | 'mise_en_demeure' | 'escalade'

interface OverdueInvoice {
  id: string
  invoice_number: string
  total: number
  due_date: string
  client_id: string
  clients: {
    first_name: string
    last_name: string
    email: string
    company: string | null
  }
}

interface GoogleToken {
  id: string
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  email: string
}

interface GeneratedEmail {
  subject: string
  body_html: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function stageFromDays(daysOverdue: number): Stage {
  if (daysOverdue <= 7)  return 'douce'
  if (daysOverdue <= 21) return 'ferme'
  if (daysOverdue <= 45) return 'mise_en_demeure'
  return 'escalade'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
  }).format(n)
}

// Encode une chaîne UTF-8 en base64url (requis par Gmail API)
function toBase64Url(str: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Construit un message RFC 2822 encodé pour Gmail API
function buildRFC2822(opts: {
  from: string
  to: string
  toName: string
  subject: string
  bodyHtml: string
}): string {
  const toHeader = opts.toName
    ? `"${opts.toName.replace(/"/g, '')}" <${opts.to}>`
    : opts.to

  const raw = [
    `From: CA-TECH <${opts.from}>`,
    `To: ${toHeader}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    opts.bodyHtml,
  ].join('\r\n')

  return toBase64Url(raw)
}

// ─── Google OAuth token (avec refresh automatique) ───────────────────────────

async function getValidGoogleToken(
  sb: ReturnType<typeof createClient>,
): Promise<{ token: GoogleToken; accessToken: string } | null> {
  const { data: gToken, error } = await sb
    .from('google_integrations')
    .select('id, access_token, refresh_token, expires_at, email')
    .limit(1)
    .maybeSingle()

  if (error || !gToken) {
    console.error('[cron-invoice-reminders] Pas de token Google en base', error)
    return null
  }

  const token = gToken as GoogleToken

  // Token encore valide (marge de 5 min)
  if (token.expires_at) {
    const expiresAt = new Date(token.expires_at)
    const now = new Date()
    if (expiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
      return { token, accessToken: token.access_token }
    }
  }

  // Token expiré — tentative de rafraîchissement
  if (!token.refresh_token) {
    console.error('[cron-invoice-reminders] Pas de refresh_token disponible')
    return null
  }

  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type:    'refresh_token',
    }),
  })

  if (!refreshRes.ok) {
    const errText = await refreshRes.text()
    console.error('[cron-invoice-reminders] Échec refresh token Google', errText)
    return null
  }

  const refreshData = await refreshRes.json()
  const newAccessToken = refreshData.access_token as string
  const newExpiresAt = new Date(
    Date.now() + (refreshData.expires_in ?? 3600) * 1000
  ).toISOString()

  await sb
    .from('google_integrations')
    .update({ access_token: newAccessToken, expires_at: newExpiresAt })
    .eq('id', token.id)

  return { token, accessToken: newAccessToken }
}

// ─── Envoi Gmail API ─────────────────────────────────────────────────────────

async function sendGmailEmail(opts: {
  accessToken: string
  senderEmail: string
  to: string
  toName: string
  subject: string
  bodyHtml: string
}): Promise<{ messageId: string | null; status: number }> {
  const encoded = buildRFC2822({
    from:     opts.senderEmail,
    to:       opts.to,
    toName:   opts.toName,
    subject:  opts.subject,
    bodyHtml: opts.bodyHtml,
  })

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    },
  )

  const data = await res.json()
  if (!res.ok) {
    console.error('[cron-invoice-reminders] Erreur Gmail API', JSON.stringify(data))
  }
  return { messageId: data.id ?? null, status: res.status }
}

// ─── Génération email via Claude Haiku ───────────────────────────────────────

const STAGE_META: Record<Stage, { label: string; tone: string }> = {
  douce: {
    label: 'Premier rappel (relance douce)',
    tone:  'Ton amical et bienveillant. Premier rappel courtois. Rappelle l\'échéance passée et invite le client à régler ou à prendre contact si une difficulté se présente. Ne pas être alarmiste.',
  },
  ferme: {
    label: 'Deuxième relance (ferme)',
    tone:  'Ton ferme mais professionnel. Souligne l\'urgence du règlement. Rappelle que le retard se prolonge et demande un règlement immédiat ou un engagement de date. Rester courtois mais sans ambiguïté sur la gravité.',
  },
  mise_en_demeure: {
    label: 'Mise en demeure',
    tone:  'Ton formel et juridique. Mise en demeure officielle. Exige le règlement intégral sous 8 jours calendaires. Précise que des poursuites judiciaires seront engagées à défaut de paiement. Inclure OBLIGATOIREMENT les mentions légales suivantes dans le corps de l\'email : (1) indemnité forfaitaire de recouvrement de 40 € due de plein droit conformément à l\'article L441-10 du Code de commerce, (2) pénalités de retard au taux de refinancement de la Banque Centrale Européenne majoré de 10 points, calculées sur le montant TTC depuis la date d\'échéance.',
  },
  escalade: { label: '', tone: '' }, // Non utilisé (pas d'email pour l'escalade)
}

// Gabarit HTML de base — couleurs CA-TECH (#0066FF, #0A2540)
function wrapInEmailTemplate(bodyHtml: string, stage: Stage): string {
  const accentColor = stage === 'mise_en_demeure' ? '#C0392B' : '#0066FF'
  const borderTop   = stage === 'mise_en_demeure' ? '#C0392B' : '#0066FF'

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: #0A2540; padding: 24px 32px; border-top: 4px solid ${borderTop}; }
  .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 600; letter-spacing: -0.3px; }
  .header span { color: ${accentColor}; }
  .body { padding: 32px; color: #1a1a2e; font-size: 15px; line-height: 1.7; }
  .body p { margin: 0 0 16px; }
  .invoice-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-left: 4px solid ${accentColor}; border-radius: 6px; padding: 16px 20px; margin: 24px 0; }
  .invoice-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .invoice-box .value { font-size: 16px; font-weight: 600; color: #0A2540; margin-top: 2px; }
  .legal { background: #fff8f0; border: 1px solid #fed7aa; border-radius: 6px; padding: 16px 20px; margin-top: 24px; font-size: 13px; color: #92400e; line-height: 1.6; }
  .footer { background: #f8f9fc; padding: 20px 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><h1>CA<span>-TECH</span></h1></div>
  <div class="body">
    ${bodyHtml}
  </div>
  <div class="footer">
    CA-TECH · ESN spécialisée Web, IA &amp; Automatisation<br>
    contact@ca-tech.fr · ca-tech.fr<br>
    Cet email est automatiquement généré. Pour toute question, répondez directement à ce message.
  </div>
</div>
</body>
</html>`
}

async function generateReminderEmail(
  invoice: OverdueInvoice,
  stage: Stage,
  daysOverdue: number,
): Promise<GeneratedEmail> {
  const meta     = STAGE_META[stage]
  const clientName = `${invoice.clients.first_name} ${invoice.clients.last_name}`
  const companyPart = invoice.clients.company ? ` (${invoice.clients.company})` : ''
  const dueDateFr = formatDate(invoice.due_date)
  const amountFr  = formatAmount(invoice.total)

  const prompt = `Tu génères un email de relance professionnel pour la société CA-TECH (ESN — conseil digital et IA).

CONTEXTE :
- Numéro de facture : ${invoice.invoice_number}
- Montant TTC : ${amountFr}
- Date d'échéance : ${dueDateFr}
- Jours de retard : ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}
- Client : ${clientName}${companyPart}
- Stade : ${meta.label}

INSTRUCTIONS :
${meta.tone}

CONTRAINTES :
- Langue : français professionnel exclusivement
- Longueur : 150 à 250 mots maximum (hors mentions légales si applicable)
- Signature : "Cordialement,\\nL'équipe CA-TECH\\ncontact@ca-tech.fr"
- Ne pas inventer d'informations non fournies
- Le corps HTML doit utiliser des balises <p> pour les paragraphes

Réponds UNIQUEMENT avec un objet JSON valide (sans bloc markdown, sans explication) :
{"subject":"...","body_html":"<p>...</p><p>...</p>"}

L'objet "body_html" est du HTML partiel (sans <html><head><body>) — uniquement le contenu intérieur.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    }

    const data  = await res.json()
    const text  = (data.content?.[0]?.text ?? '').trim()
    const parsed: GeneratedEmail = JSON.parse(text)

    // Encapsuler dans le gabarit HTML CA-TECH
    parsed.body_html = wrapInEmailTemplate(parsed.body_html, stage)
    return parsed

  } catch (err) {
    console.error('[cron-invoice-reminders] Erreur Claude Haiku', err)

    // Fallback : email générique si Claude échoue
    const fallbackBody = stage === 'mise_en_demeure'
      ? `<p>Madame, Monsieur,</p>
<p>Nous vous mettons en demeure de procéder au règlement de la facture ${invoice.invoice_number} d'un montant de ${amountFr} TTC, dont l'échéance était fixée au ${dueDateFr}, soit un retard de ${daysOverdue} jours.</p>
<p>Sans règlement sous 8 jours calendaires, nous nous verrons contraints d'engager des procédures de recouvrement.</p>
<div class="legal"><strong>Mentions légales :</strong> Conformément à l'article L441-10 du Code de commerce, une indemnité forfaitaire de recouvrement de 40 € est due de plein droit. Des pénalités de retard sont applicables au taux directeur de la Banque Centrale Européenne majoré de 10 points, calculées sur le montant TTC depuis la date d'échéance.</div>
<p>Cordialement,<br>L'équipe CA-TECH<br>contact@ca-tech.fr</p>`
      : `<p>Madame, Monsieur,</p>
<p>Sauf erreur ou omission de notre part, la facture ${invoice.invoice_number} d'un montant de ${amountFr} TTC, échue le ${dueDateFr}, reste à ce jour impayée (${daysOverdue} jour${daysOverdue > 1 ? 's' : ''} de retard).</p>
<p>Nous vous serions reconnaissants de bien vouloir procéder au règlement dans les meilleurs délais, ou de nous contacter si vous rencontrez une difficulté.</p>
<p>Cordialement,<br>L'équipe CA-TECH<br>contact@ca-tech.fr</p>`

    return {
      subject:  `${stage === 'mise_en_demeure' ? 'MISE EN DEMEURE' : 'Relance'} · Facture ${invoice.invoice_number} — ${amountFr}`,
      body_html: wrapInEmailTemplate(fallbackBody, stage),
    }
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // ── 1. Vérification CRON_SECRET ──────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[cron-invoice-reminders] Secret invalide ou absent')
    return json({ error: 'Unauthorized' }, 401)
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  const startedAt = new Date().toISOString()
  let processed = 0
  let skipped   = 0
  let errors    = 0

  // ── 2. Récupération du token Google (une seule fois pour tout le batch) ───────
  const googleAuth = await getValidGoogleToken(sb)
  if (!googleAuth) {
    console.error('[cron-invoice-reminders] Impossible d\'obtenir un token Google valide')
    return json({
      error: 'Token Google indisponible — relances interrompues',
      startedAt,
    }, 503)
  }

  const senderEmail = googleAuth.token.email // contact@ca-tech.fr

  // ── 3. Scan des factures impayées ─────────────────────────────────────────────
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD

  const { data: invoices, error: scanErr } = await sb
    .from('invoices')
    .select(`
      id, invoice_number, total, due_date, client_id,
      clients!inner (first_name, last_name, email, company)
    `)
    .in('status', ['sent', 'overdue'])
    .not('due_date', 'is', null)
    .lt('due_date', todayStr)
    .eq('skip_reminders', false)

  if (scanErr) {
    console.error('[cron-invoice-reminders] Erreur scan factures', scanErr)
    return json({ error: 'Erreur lecture factures', detail: scanErr.message }, 500)
  }

  if (!invoices || invoices.length === 0) {
    console.log('[cron-invoice-reminders] Aucune facture impayée trouvée')
    return json({ processed: 0, skipped: 0, errors: 0, startedAt })
  }

  console.log(`[cron-invoice-reminders] ${invoices.length} facture(s) à traiter`)

  // ── 4. Traitement de chaque facture ──────────────────────────────────────────
  for (const rawInvoice of invoices as unknown as OverdueInvoice[]) {
    try {
      const dueDateMs = new Date(rawInvoice.due_date).getTime()
      const daysOverdue = Math.floor((today.getTime() - dueDateMs) / 86_400_000)
      const stage = stageFromDays(daysOverdue)

      // ── Anti-doublon : même stade envoyé dans les 48h ? ─────────────────────
      const cutoff48h = new Date(today.getTime() - 48 * 3_600_000).toISOString()
      const { data: recent } = await sb
        .from('invoice_reminders')
        .select('id')
        .eq('invoice_id', rawInvoice.id)
        .eq('stage', stage)
        .gte('sent_at', cutoff48h)
        .maybeSingle()

      if (recent) {
        console.log(
          `[cron-invoice-reminders] Skip ${rawInvoice.invoice_number} — stade ${stage} déjà envoyé dans les 48h`,
        )
        skipped++
        continue
      }

      // ── Stade escalade : notification in-app uniquement ───────────────────────
      if (stage === 'escalade') {
        const clientName = `${rawInvoice.clients.first_name} ${rawInvoice.clients.last_name}`
        const company    = rawInvoice.clients.company ? ` (${rawInvoice.clients.company})` : ''

        await sb.from('notifications').insert({
          title:      `⚠️ Escalade · Facture ${rawInvoice.invoice_number} — ${daysOverdue} jours de retard`,
          message:    `${clientName}${company} — ${formatAmount(rawInvoice.total)} TTC — Intervention manuelle requise.`,
          type:       'error',
          link:       '/factures',
          is_read:    false,
          prospect_id: null,
          metadata:   {
            invoice_id:     rawInvoice.id,
            invoice_number: rawInvoice.invoice_number,
            client_name:    clientName,
            days_overdue:   daysOverdue,
            stage:          'escalade',
            total:          rawInvoice.total,
          },
        })

        await sb.from('invoice_reminders').insert({
          invoice_id:      rawInvoice.id,
          stage:           'escalade',
          message_id:      null,
          response_status: null,
        })

        console.log(
          `[cron-invoice-reminders] Escalade ${rawInvoice.invoice_number} → notification in-app créée`,
        )
        processed++
        continue
      }

      // ── Génération email via Claude Haiku ────────────────────────────────────
      const email = await generateReminderEmail(rawInvoice, stage, daysOverdue)

      // ── Envoi via Gmail API ──────────────────────────────────────────────────
      const clientName = `${rawInvoice.clients.first_name} ${rawInvoice.clients.last_name}`
      const { messageId, status: gmailStatus } = await sendGmailEmail({
        accessToken: googleAuth.accessToken,
        senderEmail,
        to:          rawInvoice.clients.email,
        toName:      clientName,
        subject:     email.subject,
        bodyHtml:    email.body_html,
      })

      // ── Log dans invoice_reminders ───────────────────────────────────────────
      await sb.from('invoice_reminders').insert({
        invoice_id:      rawInvoice.id,
        stage,
        message_id:      messageId,
        response_status: gmailStatus,
      })

      const success = gmailStatus >= 200 && gmailStatus < 300
      console.log(
        `[cron-invoice-reminders] ${rawInvoice.invoice_number} · stade=${stage} · Gmail=${gmailStatus} · messageId=${messageId ?? 'null'}`,
      )

      if (success) processed++
      else errors++

      // Pause légère entre chaque email (évite rate limiting Gmail)
      await new Promise(r => setTimeout(r, 500))

    } catch (err) {
      console.error(
        `[cron-invoice-reminders] Erreur sur ${rawInvoice.invoice_number}:`,
        err,
      )
      errors++
    }
  }

  console.log(
    `[cron-invoice-reminders] Terminé — processed=${processed} skipped=${skipped} errors=${errors}`,
  )

  return json({ processed, skipped, errors, startedAt, finishedAt: new Date().toISOString() })
})
