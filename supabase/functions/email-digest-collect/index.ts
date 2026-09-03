import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY        = Deno.env.get('ANTHROPIC_API_KEY')!
const GOOGLE_CLIENT_ID         = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET     = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const CRON_SECRET              = Deno.env.get('CRON_SECRET')!

type Category = 'Prospect' | 'Client' | 'Fournisseur' | 'Administratif' | 'Urgent'
const VALID_CATEGORIES: Category[] = ['Prospect', 'Client', 'Fournisseur', 'Administratif', 'Urgent']

// ─── Google token (auto-refresh) ────────────────────────────────────────────

async function getValidGoogleToken(
  supabase: ReturnType<typeof createClient>,
): Promise<string> {
  const { data: g, error } = await supabase
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at, email')
    .limit(1)
    .single()
  if (error || !g) throw new Error('No Google integration found')

  if (new Date(g.expires_at).getTime() > Date.now() + 5 * 60 * 1000) {
    return g.access_token
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

  return data.access_token
}

// ─── Pre-filter heuristics ──────────────────────────────────────────────────

const SKIP_SENDERS = [
  /noreply/i, /no-reply/i, /donotreply/i, /newsletter/i,
  /notifications?@/i, /mailer-daemon/i, /postmaster/i,
  /updates?@/i, /alerts?@/i,
]

function shouldSkip(from: string, subject: string, snippet: string): boolean {
  if (SKIP_SENDERS.some(p => p.test(from))) return true
  if (/unsubscribe/i.test(snippet))         return true
  if (/\[SPAM\]/i.test(subject))            return true
  return false
}

// ─── Claude Haiku classification ────────────────────────────────────────────

interface Classification {
  category:      Category
  summary:       string
  action_needed: boolean
  action_text:   string | null
}

async function classifyEmail(
  from: string,
  subject: string,
  snippet: string,
): Promise<Classification> {
  const fallback: Classification = {
    category: 'Administratif',
    summary:  snippet.slice(0, 200),
    action_needed: false,
    action_text:   null,
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role:    'user',
          content: `Tu es un assistant de classification d'emails pour CA-TECH, une ESN specialisee en developpement web et IA.

Email a analyser :
De : ${from}
Sujet : ${subject || '(sans objet)'}
Apercu : ${snippet || '(vide)'}

Reponds en JSON strict, sans markdown :
{"category":"Prospect|Client|Fournisseur|Administratif|Urgent","summary":"2-3 phrases","action_needed":true|false,"action_text":"action suggeree ou null"}

Regles :
- Prospect : nouveau contact, demande de devis ou renseignements d'un prospect
- Client : communication d'un client CA-TECH existant (projet, livraison, retour)
- Fournisseur : facture, contrat, prestataire, fournisseur
- Administratif : URSSAF, impots, banque, assurance, courrier officiel
- Urgent : delai < 48h, probleme critique, relance urgente (peut cumuler avec les autres)`,
        }],
      }),
    })

    if (!res.ok) return fallback
    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''
    const parsed = JSON.parse(text)

    return {
      category:      VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Administratif',
      summary:       typeof parsed.summary === 'string' ? parsed.summary : '',
      action_needed: Boolean(parsed.action_needed),
      action_text:   typeof parsed.action_text === 'string' ? parsed.action_text : null,
    }
  } catch {
    return fallback
  }
}

// ─── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const bearer = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  if (bearer !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const startedAt = new Date().toISOString()
  const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  let processed   = 0
  let skipped     = 0
  const errors: string[] = []

  try {
    const accessToken = await getValidGoogleToken(supabase)

    // Cutoff : dernier received_at en base, sinon 24h en arrière
    const { data: lastItem } = await supabase
      .from('email_digest_items')
      .select('received_at')
      .order('received_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const cutoff      = lastItem?.received_at
      ? new Date(lastItem.received_at)
      : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const afterSeconds = Math.floor(cutoff.getTime() / 1000)

    // Liste des messages Gmail (inbox, après cutoff)
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=${encodeURIComponent(`in:inbox after:${afterSeconds}`)}`
    const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`)

    const listData = await listRes.json()
    const messages: { id: string }[] = listData.messages ?? []

    for (const msg of messages) {
      try {
        // Dé-duplication rapide avant appel Gmail
        const { data: existing } = await supabase
          .from('email_digest_items')
          .select('id')
          .eq('gmail_message_id', msg.id)
          .maybeSingle()
        if (existing) { skipped++; continue }

        // Métadonnées du message
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}` +
          `?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        if (!msgRes.ok) { errors.push(`msg ${msg.id}: HTTP ${msgRes.status}`); continue }

        const msgData  = await msgRes.json()
        const headers: { name: string; value: string }[] = msgData.payload?.headers ?? []

        const from     = headers.find(h => h.name === 'From')?.value    ?? ''
        const subject  = headers.find(h => h.name === 'Subject')?.value ?? ''
        const dateHdr  = headers.find(h => h.name === 'Date')?.value
        const receivedAt = dateHdr ? new Date(dateHdr).toISOString() : new Date().toISOString()
        const snippet  = msgData.snippet ?? ''

        // Pre-filtrage (pas de Claude pour les newsletters)
        if (shouldSkip(from, subject, snippet)) { skipped++; continue }

        // Classification Claude Haiku
        const classification = await classifyEmail(from, subject, snippet)

        await supabase.from('email_digest_items').insert({
          gmail_message_id: msg.id,
          from_addr:        from,
          subject,
          category:         classification.category,
          summary:          classification.summary,
          action_needed:    classification.action_needed,
          action_text:      classification.action_text,
          received_at:      receivedAt,
          processed_at:     new Date().toISOString(),
          gmail_link:       `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
          is_processed:     false,
          reported:         false,
        })

        processed++
        await new Promise(r => setTimeout(r, 200)) // anti rate-limit
      } catch (err) {
        errors.push(`msg ${msg.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  } catch (err) {
    errors.push(`fatal: ${err instanceof Error ? err.message : String(err)}`)
  }

  return new Response(
    JSON.stringify({ processed, skipped, errors, startedAt, finishedAt: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
