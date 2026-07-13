/**
 * recommend-prospect — Moteur de recommandations IA
 *
 * Génère : points forts, points faibles, opportunités,
 *          recommandation commerciale, priorité A/B/C
 *
 * Env vars requises :
 *   ANTHROPIC_API_KEY — clé API Anthropic (console.anthropic.com)
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

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(prospect: Record<string, unknown>, audit: Record<string, unknown> | null, analyse: Record<string, unknown> | null): string {
  const checks = (audit?.checks as Array<{ id: string; value: boolean | null }>) ?? []
  const chk = (id: string) => {
    const c = checks.find(x => x.id === id)
    return c ? (c.value === true ? 'Oui' : c.value === false ? 'Non' : '?') : '?'
  }

  const socials = analyse?.social_networks
    ? Object.entries(analyse.social_networks as Record<string, boolean | null>)
        .filter(([, v]) => v === true).map(([k]) => k).join(', ') || 'Aucun'
    : 'Non analysé'

  const loc = [prospect.city, prospect.country].filter(Boolean).join(', ') || 'Non renseigné'

  return `Tu es un consultant commercial senior chez CA-TECH, agence digitale spécialisée en :
- Création de sites vitrine et e-commerce
- Logos, identités visuelles, flyers, landing pages
- Intelligence artificielle et automatisation SEO

Analyse ce prospect et génère des recommandations commerciales précises et actionnables.

## Entreprise
- Nom : ${prospect.company_name ?? 'N/A'}
- Secteur : ${prospect.industry ?? 'Non renseigné'}
- Taille : ${prospect.company_size ?? 'Non renseigné'}
- Localisation : ${loc}
- Site web : ${prospect.website ?? 'AUCUN SITE WEB'}
- Tags : ${(prospect.tags as string[] | undefined)?.join(', ') || 'Aucun'}

## Audit technique${audit ? ` (score ${audit.score}/10, CMS : ${audit.cms ?? 'non détecté'})` : ' (non effectué)'}
${audit ? `- Site accessible : ${chk('http_ok')}
- HTTPS : ${chk('https')}
- Responsive mobile : ${chk('responsive')}
- Chargement rapide : ${chk('load_time')}${audit.load_time_ms ? ` (${audit.load_time_ms} ms)` : ''}
- Favicon : ${chk('favicon')}
- Balise title : ${chk('title_tag')}
- Meta description : ${chk('meta_description')}
- Sitemap.xml : ${chk('sitemap')}
- Robots.txt : ${chk('robots')}
- Formulaire contact : ${chk('form')}
- Google Maps : ${chk('google_maps')}
- WhatsApp : ${chk('whatsapp')}
- Google Analytics / GTM : ${chk('analytics')}` : 'Non effectué — baser sur les infos disponibles'}

## Présence numérique${analyse ? ` (score ${analyse.score}/10)` : ' (non analysée)'}
${analyse ? `- Réseaux sociaux : ${socials}
- Google Business : ${(analyse.has_google_business as { value?: boolean | null })?.value === true ? 'Oui' : (analyse.has_google_business as { value?: boolean | null })?.value === false ? 'Non' : '?'}
- Opportunité identifiée : ${analyse.commercial_opportunity ?? 'Aucune'}` : 'Non effectuée'}

Génère UNIQUEMENT ce JSON valide, sans markdown, sans explication :
{
  "strengths": ["point fort court 1", "point fort court 2"],
  "weaknesses": ["point faible court 1", "point faible court 2"],
  "opportunities": ["service CA-TECH à proposer 1", "service CA-TECH à proposer 2"],
  "recommendation": "2-3 phrases directes et percutantes pour le commercial.",
  "priority": "A"
}

Règles :
- 2 à 4 items par liste, formulations courtes (< 8 mots) et concrètes
- opportunities = services CA-TECH applicables (site vitrine, refonte, e-commerce, SEO, branding, IA, automatisation…)
- priority A = fort potentiel, contacter sous 48 h | B = potentiel à développer | C = faible potentiel
- Absence de site web → priorité A systématique (opportunité directe)
- Tout en français, JSON uniquement`
}

// ── JSON extractor ────────────────────────────────────────────────────────────

function extractJson(text: string): string {
  const block = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (block) return block[1].trim()
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) return obj[0]
  return text.trim()
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY non configurée — ajoutez-la dans les secrets Supabase' }, 503)

  try {
    const body = await req.json() as {
      prospect?: Record<string, unknown>
      audit?: Record<string, unknown> | null
      analyse?: Record<string, unknown> | null
    }

    if (!body.prospect?.company_name) return json({ error: 'Paramètre prospect.company_name manquant' }, 400)

    const prompt = buildPrompt(body.prospect, body.audit ?? null, body.analyse ?? null)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
      return json({ error: err.error?.message ?? `Anthropic HTTP ${res.status}` }, res.status)
    }

    const claude = await res.json() as { content: Array<{ type: string; text: string }> }
    const rawText = claude.content.find(c => c.type === 'text')?.text ?? ''

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(extractJson(rawText))
    } catch {
      return json({ error: 'Réponse IA invalide — réessayez', raw: rawText }, 500)
    }

    return json({
      version: 1,
      strengths:      (parsed.strengths     as string[]) ?? [],
      weaknesses:     (parsed.weaknesses    as string[]) ?? [],
      opportunities:  (parsed.opportunities as string[]) ?? [],
      recommendation: (parsed.recommendation as string) ?? '',
      priority:       (['A', 'B', 'C'].includes(parsed.priority as string) ? parsed.priority : 'B') as 'A' | 'B' | 'C',
      generated_at:   new Date().toISOString(),
    })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erreur inattendue' }, 500)
  }
})
