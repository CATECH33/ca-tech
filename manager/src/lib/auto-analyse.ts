// Auto-analyse pipeline — runs after each prospect import or manual creation.
// Each step is independent and can be extended without modifying others.

import { supabase } from '@/lib/supabase'
import { generateAutoDraft } from '@/lib/auto-draft'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyseResult {
  has_website:           boolean | null
  has_https:             boolean | null
  is_responsive:         boolean | null
  has_meta_title:        boolean | null
  has_meta_description:  boolean | null
  has_sitemap:           boolean | null
  has_robots:            boolean | null
  has_form:              boolean | null
  has_email:             boolean | null
  has_phone:             boolean | null
  has_google_business:   boolean | null
  has_whatsapp:          boolean | null
  has_google_maps_embed: boolean | null
  cms_detected:          string | null
  load_time_ms:          number | null
  social_networks:       Record<string, boolean | null> | null
  details?:              Record<string, unknown>
  error?:                string
}

interface ProspectRow {
  id:           string
  company_name: string
  website:      string | null
  metadata:     Record<string, unknown> | null
  score:        number
}

// ── Score commercial local ────────────────────────────────────────────────────

function computeScore(a: AnalyseResult): number {
  let s = 0
  if (a.has_website)              s += 1.00
  if (a.has_https)                s += 0.75
  if (a.is_responsive)            s += 1.00
  if (a.has_meta_title)           s += 0.50
  if (a.has_meta_description)     s += 0.50
  if (a.has_sitemap)              s += 0.50
  if (a.has_robots)               s += 0.25
  if (a.has_form)                 s += 0.50
  if (a.has_email)                s += 0.50
  if (a.has_phone)                s += 0.50
  if (a.has_google_business)      s += 1.00
  if (a.has_whatsapp)             s += 0.50
  if (a.has_google_maps_embed)    s += 0.50
  if (a.social_networks && Object.values(a.social_networks).some(v => v === true)) s += 0.50
  return Math.round(s * 10) / 10
}

// ── Commentaire automatique ───────────────────────────────────────────────────

function buildAutoComment(a: AnalyseResult, companyName: string): string {
  const score = computeScore(a)
  const lines: string[] = [`Analyse automatique — ${companyName}`]

  if (a.has_website === false) {
    lines.push('Score SEO : 0/10 — Aucun site web détecté')
    lines.push('⚠ Fort potentiel de création de site.')
    return lines.join('\n')
  }

  const level =
    score >= 7 ? 'Bonne présence numérique' :
    score >= 4 ? 'Présence numérique partielle' :
                 'Présence numérique limitée'
  lines.push(`Score SEO : ${score}/10 — ${level}`)

  const positives: string[] = []
  const negatives: string[] = []

  if (a.has_https === true)               positives.push('HTTPS')
  else if (a.has_https === false)         negatives.push('HTTPS absent')
  if (a.is_responsive === true)           positives.push('Responsive')
  else if (a.is_responsive === false)     negatives.push('Non responsive')
  if (a.has_meta_title === true)          positives.push('Meta Title')
  else if (a.has_meta_title === false)    negatives.push('Meta Title absent')
  if (a.has_meta_description === true)    positives.push('Meta Description')
  else if (a.has_meta_description === false) negatives.push('Meta Description absente')
  if (a.has_sitemap === true)             positives.push('Sitemap')
  else if (a.has_sitemap === false)       negatives.push('Sitemap absent')
  if (a.has_robots === true)              positives.push('Robots.txt')
  else if (a.has_robots === false)        negatives.push('Robots.txt absent')
  if (a.has_form === true)                positives.push('Formulaire contact')
  else if (a.has_form === false)          negatives.push('Pas de formulaire')
  if (a.has_email === true)               positives.push('Email visible')
  if (a.has_phone === true)               positives.push('Téléphone visible')
  if (a.has_whatsapp === true)            positives.push('WhatsApp')
  if (a.has_google_maps_embed === true)   positives.push('Google Maps intégré')
  if (a.has_google_business === true)     positives.push('Google Business')
  else if (a.has_google_business === false) negatives.push('Absent de Google Business')

  const socials = a.social_networks
    ? Object.entries(a.social_networks).filter(([, v]) => v === true).map(([k]) => k)
    : []
  if (socials.length) positives.push(`Réseaux : ${socials.join(', ')}`)
  else                negatives.push('Aucun réseau social')

  if (positives.length) lines.push(`✓ ${positives.join(' · ')}`)
  if (negatives.length) lines.push(`✗ ${negatives.join(' · ')}`)

  if (a.cms_detected)           lines.push(`CMS : ${a.cms_detected}`)
  if (a.load_time_ms != null)   lines.push(`Temps de chargement : ${a.load_time_ms}ms`)

  return lines.join('\n')
}

// ── Étape 1 : Analyse présence web ───────────────────────────────────────────

async function stepAnalysePresence(
  url: string,
  company_name: string,
): Promise<AnalyseResult | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/analyse-prospect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ url, company_name }),
    })
    if (!res.ok) return null
    return await res.json() as AnalyseResult
  } catch {
    return null
  }
}

// ── Sauvegarde dans Supabase ──────────────────────────────────────────────────

async function saveAnalyse(prospect: ProspectRow, analyse: AnalyseResult): Promise<void> {
  const score        = computeScore(analyse)
  const auto_comment = buildAutoComment(analyse, prospect.company_name)

  const existingMeta = (prospect.metadata ?? {}) as Record<string, unknown>
  const metadata     = {
    ...existingMeta,
    analyse: {
      version:               1 as const,
      website_url:           prospect.website ?? '',
      has_website:           { value: analyse.has_website,           source: 'auto' as const },
      has_https:             { value: analyse.has_https,             source: 'auto' as const },
      is_responsive:         { value: analyse.is_responsive,         source: 'auto' as const },
      has_meta_title:        { value: analyse.has_meta_title,        source: 'auto' as const },
      has_meta_description:  { value: analyse.has_meta_description,  source: 'auto' as const },
      has_sitemap:           { value: analyse.has_sitemap,           source: 'auto' as const },
      has_robots:            { value: analyse.has_robots,            source: 'auto' as const },
      has_form:              { value: analyse.has_form,              source: 'auto' as const },
      has_email:             { value: analyse.has_email,             source: 'auto' as const },
      has_phone:             { value: analyse.has_phone,             source: 'auto' as const },
      has_google_business:   { value: analyse.has_google_business,   source: 'auto' as const },
      has_whatsapp:          { value: analyse.has_whatsapp,          source: 'auto' as const },
      has_google_maps_embed: { value: analyse.has_google_maps_embed, source: 'auto' as const },
      cms_detected:          analyse.cms_detected ?? null,
      load_time_ms:          analyse.load_time_ms ?? null,
      social_networks:       analyse.social_networks ?? {},
      ai_comment:            auto_comment,
      commercial_opportunity: '',
      score,
      analysed_at:           new Date().toISOString(),
    },
  }

  await supabase
    .from('prospects')
    .update({ metadata, score: Math.round(score * 10) })
    .eq('id', prospect.id)
}

// ── Analyse d'un prospect ─────────────────────────────────────────────────────

async function analyseOne(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('prospects')
    .select('id, company_name, website, metadata, score')
    .eq('id', id)
    .single()

  if (error || !data) return

  const prospect = data as ProspectRow

  // Toujours marquer has_website même sans URL
  const hasWebsite = !!(prospect.website?.trim())

  if (!hasWebsite) {
    const noSiteResult: AnalyseResult = {
      has_website:           false,
      has_https:             null,
      is_responsive:         null,
      has_meta_title:        null,
      has_meta_description:  null,
      has_sitemap:           null,
      has_robots:            null,
      has_form:              null,
      has_email:             null,
      has_phone:             null,
      has_google_business:   null,
      has_whatsapp:          null,
      has_google_maps_embed: null,
      cms_detected:          null,
      load_time_ms:          null,
      social_networks:       null,
    }
    await saveAnalyse(prospect, noSiteResult)
    await generateAutoDraft(prospect.id, noSiteResult, prospect.company_name, 0).catch(() => {})
    return
  }

  const analyse = await stepAnalysePresence(prospect.website!, prospect.company_name)
  if (!analyse) return

  await saveAnalyse(prospect, analyse)
  const score = computeScore(analyse)
  await generateAutoDraft(prospect.id, analyse, prospect.company_name, score).catch(() => {})
}

// ── Point d'entrée public ─────────────────────────────────────────────────────

/**
 * Lance l'analyse IA pour une liste de prospect IDs.
 * Fire-and-forget : ne bloque pas l'UI.
 * Extensible : ajouter des étapes dans analyseOne() ou via le pipeline.
 */
export function runAutoAnalyse(prospectIds: string[]): void {
  if (!prospectIds.length) return

  // Traitement séquentiel pour ne pas saturer la Edge Function
  const run = async () => {
    for (const id of prospectIds) {
      await analyseOne(id)
    }
  }

  run().catch(() => { /* silencieux — analyse non critique */ })
}
