// Auto-analyse pipeline — runs after each prospect import or manual creation.
// Each step is independent and can be extended without modifying others.

import { supabase } from '@/lib/supabase'
import { generateAutoDraft } from '@/lib/auto-draft'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyseResult {
  has_website:         boolean | null
  has_https:           boolean | null
  is_responsive:       boolean | null
  has_form:            boolean | null
  has_email:           boolean | null
  has_phone:           boolean | null
  has_google_business: boolean | null
  social_networks:     Record<string, boolean | null> | null
  details?:            Record<string, unknown>
  error?:              string
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
  if (a.has_website)         s += 1.0
  if (a.has_https)           s += 1.5
  if (a.is_responsive)       s += 2.0
  if (a.has_form)            s += 1.0
  if (a.has_email)           s += 0.5
  if (a.has_phone)           s += 0.5
  if (a.has_google_business) s += 1.5
  if (a.social_networks && Object.values(a.social_networks).some(v => v === true)) s += 0.5
  return Math.round(s * 10) / 10
}

// ── Commentaire automatique ───────────────────────────────────────────────────

function buildAutoComment(a: AnalyseResult, companyName: string): string {
  const lines: string[] = [`Analyse automatique — ${companyName}`]

  if (a.has_website === false) {
    lines.push('⚠ Aucun site web détecté. Fort potentiel de création de site.')
    return lines.join('\n')
  }

  const positives: string[] = []
  const negatives: string[] = []

  if (a.has_https === true)           positives.push('site sécurisé HTTPS')
  else if (a.has_https === false)     negatives.push('pas de HTTPS (sécurité)')
  if (a.is_responsive === true)       positives.push('site responsive mobile')
  else if (a.is_responsive === false) negatives.push('site non responsive')
  if (a.has_form === true)            positives.push('formulaire de contact présent')
  else if (a.has_form === false)      negatives.push('pas de formulaire de contact')
  if (a.has_email === true)           positives.push('email visible')
  if (a.has_phone === true)           positives.push('téléphone visible')
  if (a.has_google_business === true) positives.push('présent sur Google Business')
  else if (a.has_google_business === false) negatives.push('absent de Google Business')

  const socials = a.social_networks
    ? Object.entries(a.social_networks).filter(([, v]) => v === true).map(([k]) => k)
    : []
  if (socials.length) positives.push(`réseaux sociaux : ${socials.join(', ')}`)
  else                negatives.push('aucun réseau social détecté')

  if (positives.length) lines.push(`✓ ${positives.join(' · ')}`)
  if (negatives.length) lines.push(`✗ ${negatives.join(' · ')}`)

  const score = computeScore(a)
  lines.push(`Score commercial : ${score}/9`)

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
      version:             1 as const,
      website_url:         prospect.website ?? '',
      has_website:         { value: analyse.has_website,         source: 'auto' as const },
      has_https:           { value: analyse.has_https,           source: 'auto' as const },
      is_responsive:       { value: analyse.is_responsive,       source: 'auto' as const },
      has_form:            { value: analyse.has_form,            source: 'auto' as const },
      has_email:           { value: analyse.has_email,           source: 'auto' as const },
      has_phone:           { value: analyse.has_phone,           source: 'auto' as const },
      has_google_business: { value: analyse.has_google_business, source: 'auto' as const },
      social_networks:     analyse.social_networks ?? {},
      ai_comment:          auto_comment,
      commercial_opportunity: '',
      score,
      analysed_at:         new Date().toISOString(),
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
      has_website:         false,
      has_https:           null,
      is_responsive:       null,
      has_form:            null,
      has_email:           null,
      has_phone:           null,
      has_google_business: null,
      social_networks:     null,
    }
    await saveAnalyse(prospect, noSiteResult)
    await generateAutoDraft(prospect.id, noSiteResult).catch(() => {})
    return
  }

  const analyse = await stepAnalysePresence(prospect.website!, prospect.company_name)
  if (!analyse) return

  await saveAnalyse(prospect, analyse)
  await generateAutoDraft(prospect.id, analyse).catch(() => {})
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
