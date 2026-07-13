import type { ProspectRow, ProspectAnalyse, QualCriterion } from '@/hooks/useProspects'
import type { AuditResult } from '@/hooks/useAudit'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CriterionGroup =
  | 'site'
  | 'seo'
  | 'responsive'
  | 'coordonnees'
  | 'google_business'
  | 'social'
  | 'anciennete'
  | 'avis'

export interface CommercialCriterion {
  id: string
  label: string
  group: CriterionGroup
  value: boolean | null   // null = non renseigné
  weight: number
  detail?: string
}

export type Opportunity = 'very_high' | 'medium' | 'low'

export interface ScoreCommercialResult {
  score: number          // 0–10, arrondi à 1 décimale
  stars: number          // 1–5
  opportunity: Opportunity
  criteria: CommercialCriterion[]
  dataQuality: 'full' | 'partial' | 'minimal'  // combien de critères sont connus
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const GROUP_LABELS: Record<CriterionGroup, string> = {
  site:            'Qualité du site',
  seo:             'SEO',
  responsive:      'Responsive mobile',
  coordonnees:     'Présence des coordonnées',
  google_business: 'Google Business',
  social:          'Réseaux sociaux',
  anciennete:      'Ancienneté estimée',
  avis:            'Avis Google',
}

export const GROUP_ORDER: CriterionGroup[] = [
  'site', 'seo', 'responsive', 'coordonnees',
  'google_business', 'social', 'anciennete', 'avis',
]

export const OPPORTUNITY_CONFIG: Record<Opportunity, { label: string; bg: string; text: string; border: string; dot: string }> = {
  very_high: {
    label:  'Très forte opportunité',
    bg:     'bg-emerald-50',
    text:   'text-emerald-700',
    border: 'border-emerald-200',
    dot:    'bg-emerald-500',
  },
  medium: {
    label:  'Bonne opportunité',
    bg:     'bg-amber-50',
    text:   'text-amber-700',
    border: 'border-amber-200',
    dot:    'bg-amber-400',
  },
  low: {
    label:  'Faible opportunité',
    bg:     'bg-slate-50',
    text:   'text-slate-500',
    border: 'border-slate-200',
    dot:    'bg-slate-300',
  },
}

// ── Calculation ───────────────────────────────────────────────────────────────

export function computeScoreCommercial(
  prospect: ProspectRow,
  audit: AuditResult | null,
  analyse: ProspectAnalyse | null,
): ScoreCommercialResult {

  const auditVal = (id: string): boolean | null =>
    audit?.checks.find(c => c.id === id)?.value ?? null

  const analyseVal = (field: keyof Pick<
    ProspectAnalyse,
    'has_website' | 'has_https' | 'is_responsive' | 'has_form' | 'has_email' | 'has_phone' | 'has_google_business'
  >): boolean | null =>
    (analyse?.[field] as QualCriterion | undefined)?.value ?? null

  const socialActive = analyse?.social_networks
    ? Object.entries(analyse.social_networks).filter(([, v]) => v === true).map(([k]) => k)
    : null

  const criteria: CommercialCriterion[] = [

    // ── Qualité du site ────────────────────────────────────────────────────────
    {
      id: 'website',
      label: 'Site web présent',
      group: 'site',
      weight: 0.5,
      value: prospect.website ? true : false,
    },
    {
      id: 'https',
      label: 'HTTPS activé',
      group: 'site',
      weight: 0.75,
      value: auditVal('https') ?? analyseVal('has_https'),
    },
    {
      id: 'load_time',
      label: 'Chargement rapide (< 3 s)',
      group: 'site',
      weight: 0.75,
      value: auditVal('load_time'),
    },

    // ── SEO ───────────────────────────────────────────────────────────────────
    {
      id: 'title',
      label: 'Balise title',
      group: 'seo',
      weight: 0.5,
      value: auditVal('title_tag'),
    },
    {
      id: 'meta',
      label: 'Meta description',
      group: 'seo',
      weight: 0.75,
      value: auditVal('meta_description'),
    },
    {
      id: 'sitemap',
      label: 'Sitemap.xml',
      group: 'seo',
      weight: 0.5,
      value: auditVal('sitemap'),
    },

    // ── Responsive ────────────────────────────────────────────────────────────
    {
      id: 'responsive',
      label: 'Design responsive (mobile)',
      group: 'responsive',
      weight: 1.5,
      value: auditVal('responsive') ?? analyseVal('is_responsive'),
    },

    // ── Coordonnées ───────────────────────────────────────────────────────────
    {
      id: 'email',
      label: 'Email de contact',
      group: 'coordonnees',
      weight: 0.5,
      value: analyseVal('has_email') ?? (prospect.contacts.some(c => c.email) ? true : null),
    },
    {
      id: 'phone',
      label: 'Téléphone',
      group: 'coordonnees',
      weight: 0.5,
      value: analyseVal('has_phone') ?? (prospect.contacts.some(c => c.phone) ? true : null),
    },
    {
      id: 'form',
      label: 'Formulaire de contact',
      group: 'coordonnees',
      weight: 0.75,
      value: auditVal('form') ?? analyseVal('has_form'),
    },

    // ── Google Business ───────────────────────────────────────────────────────
    {
      id: 'google_business',
      label: 'Fiche Google Business',
      group: 'google_business',
      weight: 1.5,
      value: analyseVal('has_google_business'),
    },

    // ── Réseaux sociaux ───────────────────────────────────────────────────────
    {
      id: 'social',
      label: 'Présence réseaux sociaux',
      group: 'social',
      weight: 1.0,
      value: socialActive !== null ? socialActive.length > 0 : null,
      detail: socialActive?.length ? socialActive.join(', ') : undefined,
    },

    // ── Ancienneté (future) ───────────────────────────────────────────────────
    {
      id: 'age',
      label: 'Ancienneté du domaine',
      group: 'anciennete',
      weight: 0.5,
      value: null,
    },

    // ── Avis Google (future) ──────────────────────────────────────────────────
    {
      id: 'reviews',
      label: 'Avis Google',
      group: 'avis',
      weight: 0.5,
      value: null,
    },
  ]

  // Score : critères connus uniquement, normalisé à /10
  const known       = criteria.filter(c => c.value !== null)
  const totalWeight = known.reduce((s, c) => s + c.weight, 0)
  const earned      = known.filter(c => c.value === true).reduce((s, c) => s + c.weight, 0)
  const score       = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100) / 10

  // Étoiles 1–5
  const stars = totalWeight === 0 ? 0 : Math.max(1, Math.round(score / 2))

  // Opportunité commerciale (inverse : faible présence = forte opportunité CA-TECH)
  const opportunity: Opportunity =
    score < 4 ? 'very_high' :
    score < 7 ? 'medium'    :
    'low'

  // Qualité de la donnée disponible
  const knownRatio = known.length / criteria.length
  const dataQuality: ScoreCommercialResult['dataQuality'] =
    knownRatio >= 0.7 ? 'full' :
    knownRatio >= 0.3 ? 'partial' :
    'minimal'

  return { score, stars, opportunity, criteria, dataQuality }
}
