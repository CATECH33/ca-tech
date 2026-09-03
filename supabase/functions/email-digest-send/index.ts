import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID          = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET      = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const CRON_SECRET               = Deno.env.get('CRON_SECRET')!

type Category = 'Prospect' | 'Client' | 'Fournisseur' | 'Administratif' | 'Urgent'

interface DigestItem {
  id:           string
  from_addr:    string
  subject:      string | null
  category:     Category
  summary:      string | null
  action_needed: boolean
  action_text:  string | null
  received_at:  string
  gmail_link:   string | null
}

// ─── Google token (auto-refresh) ────────────────────────────────────────────

async function getValidGoogleToken(
  supabase: ReturnType<typeof createClient>,
): Promise<{ token: string; email: string }> {
  const { data: g, error } = await supabase
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at, email')
    .limit(1)
    .single()
  if (error || !g) throw new Error('No Google integration found')

  if (new Date(g.expires_at).getTime() > Date.now() + 5 * 60 * 1000) {
    return { token: g.access_token, email: g.email }
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: g.refresh_token,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`)

  await supabase
    .from('google_integrations')
    .update({
      access_token: data.access_token,
      expires_at:   new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    .eq('email', g.email)

  return { token: data.access_token, email: g.email }
}

// ─── Génération HTML digest ──────────────────────────────────────────────────

const CATEGORY_META: Record<Category, { color: string; dot: string; label: string }> = {
  Urgent:        { color: '#ef4444', dot: '#ef4444', label: 'Urgent' },
  Prospect:      { color: '#0066FF', dot: '#0066FF', label: 'Prospect' },
  Client:        { color: '#10b981', dot: '#10b981', label: 'Client' },
  Fournisseur:   { color: '#8b5cf6', dot: '#8b5cf6', label: 'Fournisseur' },
  Administratif: { color: '#6b7280', dot: '#6b7280', label: 'Administratif' },
}

const CATEGORY_ORDER: Category[] = ['Urgent', 'Prospect', 'Client', 'Fournisseur', 'Administratif']

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function buildDigestHtml(items: DigestItem[], period: string): string {
  const byCategory: Partial<Record<Category, DigestItem[]>> = {}
  for (const item of items) {
    if (!byCategory[item.category]) byCategory[item.category] = []
    byCategory[item.category]!.push(item)
  }

  const urgentCount = items.filter(i => i.action_needed).length
  const catCount    = Object.keys(byCategory).length

  const sectionsHtml = CATEGORY_ORDER
    .filter(cat => byCategory[cat]?.length)
    .map(cat => {
      const meta   = CATEGORY_META[cat]
      const catItems = byCategory[cat]!

      const rowsHtml = catItems.map(item => `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:10px;background:#ffffff;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;color:#0A2540;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${esc(item.subject ?? '(sans objet)')}
              </div>
              <div style="color:#6b7280;font-size:12px;margin-top:2px;">${esc(item.from_addr)}</div>
            </div>
            <div style="font-size:11px;color:#9ca3af;white-space:nowrap;margin-left:12px;flex-shrink:0;">${fmtDate(item.received_at)}</div>
          </div>
          ${item.summary ? `<div style="color:#374151;font-size:13px;line-height:1.5;margin-top:8px;">${esc(item.summary)}</div>` : ''}
          ${item.action_needed && item.action_text ? `
          <div style="margin-top:10px;background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;font-size:12px;color:#92400e;">
            <strong>Action :</strong> ${esc(item.action_text)}
          </div>` : ''}
          ${item.gmail_link ? `
          <div style="margin-top:10px;">
            <a href="${esc(item.gmail_link)}" style="color:#0066FF;font-size:12px;text-decoration:none;">Voir dans Gmail &rarr;</a>
          </div>` : ''}
        </div>
      `).join('')

      return `
        <div style="margin-bottom:28px;">
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${meta.dot};margin-right:8px;flex-shrink:0;"></div>
            <h3 style="margin:0;font-size:15px;font-weight:600;color:#0A2540;">
              ${meta.label}
              <span style="font-weight:400;color:#6b7280;font-size:13px;margin-left:4px;">(${catItems.length})</span>
            </h3>
          </div>
          ${rowsHtml}
        </div>
      `
    }).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Digest CA-TECH</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);border-radius:12px;padding:32px;margin-bottom:24px;text-align:center;">
    <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">CA-TECH</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;">Digest Emails &mdash; ${esc(period)}</div>
  </div>

  <!-- KPIs -->
  <div style="display:flex;gap:12px;margin-bottom:28px;">
    <div style="flex:1;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#0066FF;">${items.length}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">Email${items.length > 1 ? 's' : ''}</div>
    </div>
    <div style="flex:1;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#ef4444;">${urgentCount}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">Action${urgentCount > 1 ? 's' : ''} requise${urgentCount > 1 ? 's' : ''}</div>
    </div>
    <div style="flex:1;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#0066FF;">${catCount}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">Cat&eacute;gorie${catCount > 1 ? 's' : ''}</div>
    </div>
  </div>

  <!-- Sections par catégorie -->
  ${sectionsHtml}

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
    <div style="font-size:12px;color:#9ca3af;">
      CA-TECH &middot; Digest automatique &middot;
      <a href="https://manager.ca-tech.fr/emails-digest" style="color:#0066FF;text-decoration:none;">Voir dans Manager</a>
    </div>
  </div>

</div>
</body>
</html>`
}

// ─── Envoi Gmail API ─────────────────────────────────────────────────────────

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildRFC2822(from: string, to: string, subject: string, bodyHtml: string): string {
  return [
    `From: CA-TECH Manager <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    bodyHtml,
  ].join('\r\n')
}

async function sendGmail(
  accessToken: string,
  from: string,
  to: string,
  subject: string,
  bodyHtml: string,
): Promise<{ id: string }> {
  const raw = toBase64Url(buildRFC2822(from, to, subject, bodyHtml))
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gmail send ${res.status}: ${err}`)
  }
  return res.json()
}

// ─── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const bearer = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  if (bearer !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const startedAt = new Date().toISOString()
  const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Fetch items non encore reportés
    const { data: items, error } = await supabase
      .from('email_digest_items')
      .select('id, from_addr, subject, category, summary, action_needed, action_text, received_at, gmail_link')
      .eq('reported', false)
      .order('received_at', { ascending: false })
    if (error) throw error

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'no unreported items', startedAt, finishedAt: new Date().toISOString() }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const { token: accessToken, email: gmailEmail } = await getValidGoogleToken(supabase)

    // Période (matin / soir)
    const now      = new Date()
    const dateStr  = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const period   = now.getUTCHours() < 12 ? `${dateStr} - Matin` : `${dateStr} - Soir`
    const urgentCount = (items as DigestItem[]).filter(i => i.action_needed).length

    const subjectLine = urgentCount > 0
      ? `Digest CA-TECH - ${items.length} emails dont ${urgentCount} urgents`
      : `Digest CA-TECH - ${items.length} email${items.length > 1 ? 's' : ''}`

    const html = buildDigestHtml(items as DigestItem[], period)

    // Envoi email
    const sent = await sendGmail(accessToken, gmailEmail, gmailEmail, subjectLine, html)

    // Marquer comme reportés
    const ids = (items as DigestItem[]).map(i => i.id)
    await supabase.from('email_digest_items').update({ reported: true }).in('id', ids)

    // Notification in-app
    await supabase.from('notifications').insert({
      type:    'info',
      title:   `Digest Email - ${items.length} emails`,
      message: urgentCount > 0
        ? `${items.length} emails traites dont ${urgentCount} necessitant une action.`
        : `${items.length} emails traites, aucune action urgente.`,
    })

    // Comptage par catégorie pour la réponse
    const byCategory: Record<string, number> = {}
    for (const item of items as DigestItem[]) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1
    }

    return new Response(
      JSON.stringify({ sent: true, total: items.length, byCategory, messageId: sent.id, startedAt, finishedAt: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err), startedAt, finishedAt: new Date().toISOString() }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
