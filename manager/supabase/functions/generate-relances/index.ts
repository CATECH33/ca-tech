/**
 * generate-relances — Génère 3 emails de relance (J+3, J+7, J+15) en un seul appel IA
 *
 * Input  : { prospect_id: string }
 * Output : { relances: [{ day: 3|7|15, subject: string, body: string }] }
 *
 * Env vars requises : ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

interface Prospect {
  id: string
  company_name: string
  contact_name?: string | null
  email?: string | null
  city?: string | null
  industry?: string | null
  ai_analysis?: string | null
  commercial_score?: number | null
  notes?: string | null
}

function buildPrompt(prospect: Prospect): string {
  const score = prospect.commercial_score ?? 'N/A'
  const industry = prospect.industry ?? 'secteur non précisé'
  const city = prospect.city ?? 'ville non précisée'
  const contact = prospect.contact_name ?? 'le/la responsable'
  const analysis = prospect.ai_analysis
    ? `\nAnalyse IA : ${prospect.ai_analysis}`
    : ''

  return `Tu es un commercial senior de CA-TECH, agence digitale française spécialisée en :
- Création de sites vitrine et e-commerce
- SEO, logos, identités visuelles, landing pages
- Intelligence artificielle et automatisation

Prospect : ${prospect.company_name}
Contact : ${contact}
Secteur : ${industry}
Ville : ${city}
Score commercial : ${score}/100${analysis}

Tu dois rédiger 3 emails de relance progressifs pour ce prospect. Chaque relance doit être différente, cohérente avec le délai écoulé, et de plus en plus directe.

RELANCE J+3 (3 jours après premier contact) :
- Ton : chaleureux, informatif
- Objectif : rappeler notre offre, proposer une ressource utile (guide, exemple de réalisation dans leur secteur)
- Longueur : 80-120 mots

RELANCE J+7 (7 jours après premier contact) :
- Ton : professionnel, orienté valeur
- Objectif : créer urgence douce, évoquer un résultat concret qu'on a obtenu pour un secteur similaire, proposer un appel de 15 min
- Longueur : 100-130 mots

RELANCE J+15 (15 jours après premier contact) :
- Ton : direct, concis, dernière chance
- Objectif : email court de clôture — si pas de réponse on comprend, mais porte reste ouverte, lien de prise de RDV
- Longueur : 60-80 mots

Règles :
- Vouvoiement
- Signature : [Votre prénom] | CA-TECH
- NE PAS inventer de prix, délais exacts ou références clients nommées
- Adapter le contenu au secteur (${industry}) et à la ville (${city})
- Chaque email doit avoir un objet accrocheur différent

Génère UNIQUEMENT ce JSON valide, sans markdown, sans explication :
{
  "relances": [
    { "day": 3,  "subject": "objet email J+3",  "body": "corps email J+3 avec sauts de ligne \\n" },
    { "day": 7,  "subject": "objet email J+7",  "body": "corps email J+7 avec sauts de ligne \\n" },
    { "day": 15, "subject": "objet email J+15", "body": "corps email J+15 avec sauts de ligne \\n" }
  ]
}

Tout en français, JSON uniquement.`
}

function extractJson(text: string): string {
  const block = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (block) return block[1].trim()
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) return obj[0]
  return text.trim()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  const apiKey     = Deno.env.get('ANTHROPIC_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!apiKey)      return json({ error: 'ANTHROPIC_API_KEY non configurée' }, 503)
  if (!supabaseUrl) return json({ error: 'SUPABASE_URL non configurée' }, 503)
  if (!serviceKey)  return json({ error: 'SUPABASE_SERVICE_ROLE_KEY non configurée' }, 503)

  try {
    const input = await req.json() as { prospect_id?: string }
    if (!input.prospect_id) return json({ error: 'prospect_id manquant' }, 400)

    // Fetch prospect from Supabase
    const res = await fetch(
      `${supabaseUrl}/rest/v1/prospects?id=eq.${input.prospect_id}&select=*&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    )
    if (!res.ok) return json({ error: `Supabase error ${res.status}` }, 502)
    const rows = await res.json() as Prospect[]
    if (!rows.length) return json({ error: 'Prospect introuvable' }, 404)

    const prospect = rows[0]
    const prompt = buildPrompt(prospect)

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      const err = await aiRes.json().catch(() => ({})) as { error?: { message?: string } }
      return json({ error: err.error?.message ?? `Anthropic HTTP ${aiRes.status}` }, aiRes.status)
    }

    const claude  = await aiRes.json() as { content: Array<{ type: string; text: string }> }
    const rawText = claude.content.find(c => c.type === 'text')?.text ?? ''

    let parsed: { relances: Array<{ day: number; subject: string; body: string }> }
    try {
      parsed = JSON.parse(extractJson(rawText))
    } catch {
      return json({ error: 'Réponse IA invalide — réessayez', raw: rawText }, 500)
    }

    if (!parsed.relances?.length) return json({ error: 'Relances manquantes dans la réponse IA' }, 500)

    return json({
      relances:     parsed.relances,
      prospect_id:  prospect.id,
      company_name: prospect.company_name,
      generated_at: new Date().toISOString(),
    })

  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erreur inattendue' }, 500)
  }
})
