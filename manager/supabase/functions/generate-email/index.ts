/**
 * generate-email — Générateur d'emails de prospection par IA
 *
 * Génère un email personnalisé à partir des données prospect (secteur,
 * ville, analyse IA, score commercial) pour 5 types de services CA-TECH.
 *
 * Env vars requises :
 *   ANTHROPIC_API_KEY         — clé API Anthropic
 *   SUPABASE_URL              — URL du projet Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — clé service role (lecture prospects)
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

// ── Config templates ──────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  vitrine:     'Création de site vitrine',
  ecommerce:   'Création de site e-commerce',
  refonte:     'Refonte de site web',
  seo:         'Référencement naturel (SEO)',
  maintenance: 'Maintenance & support web',
}

const TEMPLATE_PITCH: Record<string, string> = {
  vitrine:     'Mettez en avant la vitrine digitale comme levier de crédibilité et d\'acquisition client.',
  ecommerce:   'Soulignez les bénéfices concrets d\'une boutique en ligne : ventes 24/7, nouveaux marchés, automatisation.',
  refonte:     'Montrez comment un site moderne améliore l\'image, le SEO et le taux de conversion.',
  seo:         'Insistez sur la visibilité Google : plus de trafic qualifié, plus d\'appels entrants.',
  maintenance: 'Proposez la sérénité : mises à jour, sécurité, sauvegardes, support réactif.',
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: 'Ton professionnel et persuasif, orienté résultats business. Vouvoiement.',
  formal:       'Ton formel et courtois, respectueux et structuré. Vouvoiement strict.',
  friendly:     'Ton chaleureux et humain, accessible et bienveillant. Vouvoiement mais détendu.',
  direct:       'Ton direct et percutant, pas de fioritures, aller à l\'essentiel. Vouvoiement.',
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(
  prospect: Record<string, unknown>,
  templateType: string,
  tone: string,
): string {
  const meta    = (prospect.metadata as Record<string, unknown>) ?? {}
  const analyse = (meta.analyse  as Record<string, unknown> | null) ?? null
  const audit   = (meta.audit    as Record<string, unknown> | null) ?? null
  const reco    = (meta.recommendations as Record<string, unknown> | null) ?? null

  const companyName = (prospect.company_name as string) ?? 'votre entreprise'
  const industry    = (prospect.industry     as string) ?? 'votre secteur'
  const city        = (prospect.city         as string) ?? null
  const country     = (prospect.country      as string) ?? null
  const location    = [city, country].filter(Boolean).join(', ') || null
  const website     = (prospect.website      as string) ?? null
  const rawScore    = (prospect.score        as number) ?? 0
  const score       = (rawScore / 10).toFixed(1)

  // Observations IA
  const observations: string[] = []
  const hasWebsite        = (analyse?.has_website         as { value?: boolean })?.value
  const hasHttps          = (analyse?.has_https           as { value?: boolean })?.value
  const hasForm           = (analyse?.has_form            as { value?: boolean })?.value
  const hasGoogleBusiness = (analyse?.has_google_business as { value?: boolean })?.value
  const isResponsive      = (analyse?.is_responsive       as { value?: boolean })?.value
  const commercialOpp     = (analyse?.commercial_opportunity as string) ?? ''
  const auditScore        = (audit?.score  as number) ?? null
  const priority          = (reco?.priority as string) ?? null
  const opportunities     = (reco?.opportunities as string[]) ?? []
  const recommendation    = (reco?.recommendation as string) ?? ''

  if (hasWebsite === false)                          observations.push('Aucun site web — opportunité directe de création')
  if (hasWebsite === true && hasHttps === false)     observations.push('Site sans HTTPS — sécurité insuffisante')
  if (hasWebsite === true && isResponsive === false) observations.push('Site non responsive — mauvaise expérience mobile')
  if (hasWebsite === true && hasForm === false)      observations.push('Aucun formulaire contact — perte de leads')
  if (hasGoogleBusiness === false)                   observations.push('Absent de Google Business — invisible sur Google Maps')
  if (auditScore !== null)                           observations.push(`Score technique : ${auditScore}/10`)
  if (commercialOpp)                                 observations.push(`Opportunité identifiée : ${commercialOpp}`)
  if (priority)                                      observations.push(`Priorité commerciale : ${priority}`)
  if (opportunities.length > 0)                      observations.push(`Services recommandés : ${opportunities.slice(0, 2).join(', ')}`)

  const toneInstruction    = TONE_INSTRUCTIONS[tone]    ?? TONE_INSTRUCTIONS.professional
  const templateLabel      = TEMPLATE_LABELS[templateType]  ?? templateType
  const templatePitch      = TEMPLATE_PITCH[templateType]   ?? ''

  return `Tu es un commercial senior chez CA-TECH, agence digitale française spécialisée en :
- Création de sites vitrine et e-commerce
- SEO, landing pages, identités visuelles, logos
- Intelligence artificielle et automatisation

Rédige un email de prospection commerciale B2B pour proposer : **${templateLabel}**

## Contexte prospect
- Entreprise : ${companyName}
- Secteur : ${industry}
${location ? `- Localisation : ${location}` : ''}
${website ? `- Site actuel : ${website}` : '- Pas de site web'}
- Score commercial IA : ${score}/10
${observations.length > 0 ? `\n## Analyse IA du prospect\n${observations.map(o => `- ${o}`).join('\n')}` : ''}
${recommendation ? `\n## Recommandation IA\n${recommendation}` : ''}

## Pitch du service
${templatePitch}

## Consignes rédaction
- ${toneInstruction}
- Email court et percutant : 180 à 320 mots maximum
- Personnalisé : mentionner le secteur "${industry}"${location ? ` et la ville "${city}"` : ''}
- Axé sur les problèmes concrets détectés et les bénéfices business mesurables
- Appel à l'action clair : proposer un échange de 20 min ou une démonstration gratuite
- Signature : [Votre nom] | CA-TECH
- Un seul placeholder autorisé : [Votre nom] dans la signature

Génère UNIQUEMENT ce JSON valide, sans markdown, sans explication :
{
  "subject": "Objet email (max 65 caractères, accrocheur et personnalisé)",
  "body": "Corps complet de l'email avec sauts de ligne \\n"
}

Tout en français, JSON uniquement.`
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

  const apiKey      = Deno.env.get('ANTHROPIC_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!apiKey)      return json({ error: 'ANTHROPIC_API_KEY non configurée' }, 503)
  if (!supabaseUrl || !serviceRole) return json({ error: 'Variables Supabase manquantes' }, 503)

  try {
    const body = await req.json() as {
      prospect_id:   string
      template_type: string
      tone?:         string
    }

    if (!body.prospect_id)   return json({ error: 'prospect_id manquant' }, 400)
    if (!body.template_type) return json({ error: 'template_type manquant' }, 400)
    if (!TEMPLATE_LABELS[body.template_type]) return json({ error: `template_type invalide : ${body.template_type}` }, 400)

    // ── Fetch prospect ────────────────────────────────────────────────────────
    const prospectRes = await fetch(
      `${supabaseUrl}/rest/v1/prospects?id=eq.${encodeURIComponent(body.prospect_id)}&select=company_name,industry,city,country,website,score,metadata`,
      {
        headers: {
          apikey:        serviceRole,
          Authorization: `Bearer ${serviceRole}`,
        },
      },
    )

    if (!prospectRes.ok) {
      const err = await prospectRes.text().catch(() => '')
      return json({ error: `Erreur lecture prospect : ${err}` }, 500)
    }

    const prospects = await prospectRes.json() as Record<string, unknown>[]
    if (!prospects.length) return json({ error: 'Prospect non trouvé' }, 404)

    const prospect = prospects[0]
    const tone     = body.tone ?? 'professional'
    const prompt   = buildPrompt(prospect, body.template_type, tone)

    // ── Call Claude ───────────────────────────────────────────────────────────
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
      return json({ error: err.error?.message ?? `Anthropic HTTP ${res.status}` }, res.status)
    }

    const claude  = await res.json() as { content: Array<{ type: string; text: string }> }
    const rawText = claude.content.find(c => c.type === 'text')?.text ?? ''

    let parsed: { subject: string; body: string }
    try {
      parsed = JSON.parse(extractJson(rawText))
    } catch {
      return json({ error: 'Réponse IA invalide — réessayez', raw: rawText }, 500)
    }

    if (!parsed.subject || !parsed.body) {
      return json({ error: 'Réponse IA incomplète — réessayez', raw: rawText }, 500)
    }

    return json({
      subject:       parsed.subject.trim(),
      body:          parsed.body.trim(),
      ai_model:      'claude-haiku-4-5-20251001',
      template_type: body.template_type,
      generated_at:  new Date().toISOString(),
    })

  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erreur inattendue' }, 500)
  }
})
