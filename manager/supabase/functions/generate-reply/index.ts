/**
 * generate-reply — Génère une réponse professionnelle à un message entrant
 *
 * Input  : { from_name, from_email, subject?, body, source }
 * Output : { reply: string }
 *
 * Env vars requises : ANTHROPIC_API_KEY
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

function buildPrompt(
  from_name: string,
  from_email: string,
  subject: string | null,
  body: string,
  source: string,
): string {
  return `Tu es un commercial senior de CA-TECH, agence digitale française spécialisée en :
- Création de sites vitrine et e-commerce
- SEO, logos, identités visuelles, landing pages
- Intelligence artificielle et automatisation

Tu as reçu le message entrant suivant (via ${source}) :
- De : ${from_name} <${from_email}>
${subject ? `- Objet : ${subject}` : ''}
- Message :
"""
${body}
"""

Rédige une réponse professionnelle et chaleureuse en français (150 à 250 mots) :
1. Remercie et accuse réception du message
2. Reformule brièvement le besoin exprimé (1 phrase)
3. Présente CA-TECH comme la solution idéale (1-2 phrases concrètes)
4. Propose une prochaine étape claire (appel découverte de 20 min, démonstration gratuite ou envoi de documentation selon le besoin)
5. Indique que tu es disponible en semaine (lundi–vendredi, 9h–18h)
6. Signature : [Votre nom] | CA-TECH

Ton : professionnel, chaleureux, orienté solution.
Vouvoiement.
NE PAS inventer d'informations (prix, délais précis, références clients).

Génère UNIQUEMENT ce JSON valide, sans markdown, sans explication :
{ "reply": "Texte complet de la réponse avec sauts de ligne \\n" }

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

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY non configurée' }, 503)

  try {
    const body = await req.json() as {
      from_name:  string
      from_email: string
      subject?:   string | null
      body:       string
      source?:    string
    }

    if (!body.from_name) return json({ error: 'from_name manquant' }, 400)
    if (!body.body)      return json({ error: 'body manquant' }, 400)

    const prompt = buildPrompt(
      body.from_name,
      body.from_email ?? '',
      body.subject ?? null,
      body.body,
      body.source ?? 'inconnu',
    )

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
      return json({ error: err.error?.message ?? `Anthropic HTTP ${res.status}` }, res.status)
    }

    const claude  = await res.json() as { content: Array<{ type: string; text: string }> }
    const rawText = claude.content.find(c => c.type === 'text')?.text ?? ''

    let parsed: { reply: string }
    try {
      parsed = JSON.parse(extractJson(rawText))
    } catch {
      return json({ error: 'Réponse IA invalide — réessayez', raw: rawText }, 500)
    }

    if (!parsed.reply) return json({ error: 'Réponse IA incomplète — réessayez' }, 500)

    return json({ reply: parsed.reply.trim(), generated_at: new Date().toISOString() })

  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erreur inattendue' }, 500)
  }
})
