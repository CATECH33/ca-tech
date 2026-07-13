import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prospect, ProspectStatus, ProspectSource } from '@/types'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface ProspectContact {
  id: string
  prospect_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  job_title?: string
  linkedin_url?: string
  is_primary: boolean
}

export interface ProspectActivity {
  id: string
  prospect_id: string
  type: string
  description?: string
  created_at: string
}

export type ProspectRow = Omit<Prospect, 'contacts' | 'activities'> & {
  contacts: ProspectContact[]
  activities: ProspectActivity[]
}

const Q = ['prospects'] as const

async function fetchProspects(): Promise<ProspectRow[]> {
  const { data, error } = await supabase
    .from('prospects')
    .select(`
      *,
      contacts:prospect_contacts(id, prospect_id, first_name, last_name, email, phone, job_title, linkedin_url, is_primary),
      activities:prospect_activities(id, prospect_id, type, description, created_at)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ProspectRow[]
}

export function useProspects(opts?: { refetchInterval?: number }) {
  return useQuery({ queryKey: Q, queryFn: fetchProspects, ...opts })
}

export interface CreateProspectInput {
  company_name: string
  website?: string
  industry?: string
  company_size?: string
  country?: string
  city?: string
  status?: ProspectStatus
  score?: number
  source?: ProspectSource
  linkedin_url?: string
  tags?: string[]
}

export function useCreateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProspectInput) => {
      const { data, error } = await supabase.from('prospects').insert({
        company_name: input.company_name,
        website: input.website || null,
        industry: input.industry || null,
        company_size: input.company_size || null,
        country: input.country || null,
        city: input.city || null,
        status: input.status ?? 'new',
        score: input.score ?? 0,
        source: input.source ?? 'manual',
        linkedin_url: input.linkedin_url || null,
        tags: input.tags ?? [],
      }).select('id, company_name').single()
      if (error) throw error

      // Créer automatiquement le dossier Google Drive (sans bloquer)
      // 2e invalidation après création pour que la fiche affiche le lien Drive
      fetch(`${SUPABASE_URL}/functions/v1/google-drive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
        body: JSON.stringify({ prospect_id: data.id, prospect_name: data.company_name }),
      }).then(() => qc.invalidateQueries({ queryKey: Q })).catch(() => { /* silencieux si Google non connecté */ })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export interface UpdateProspectInput extends Partial<CreateProspectInput> {
  id: string
}

export function useUpdateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProspectInput) => {
      const { error } = await supabase
        .from('prospects')
        .update({
          ...data,
          website: data.website || null,
          industry: data.industry || null,
          company_size: data.company_size || null,
          country: data.country || null,
          city: data.city || null,
          linkedin_url: data.linkedin_url || null,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prospects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

// ── Analyse IA ────────────────────────────────────────────────────────────────

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok'

export interface ProspectAnalyse {
  version: 1
  website_url: string
  // Présence web
  has_website:         QualCriterion
  has_https:           QualCriterion
  is_responsive:       QualCriterion
  has_form:            QualCriterion
  has_email:           QualCriterion
  has_phone:           QualCriterion
  has_google_business: QualCriterion
  // Réseaux sociaux
  social_networks: Record<SocialNetwork, boolean | null>
  // Texte libre
  ai_comment: string
  commercial_opportunity: string
  // Score calculé
  score: number
  analysed_at: string | null
}

export const SOCIAL_NETWORK_LABELS: Record<SocialNetwork, string> = {
  facebook:  'Facebook',
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
  twitter:   'X / Twitter',
  youtube:   'YouTube',
  tiktok:    'TikTok',
}

const ANALYSE_WEIGHTS = {
  has_website:         1.0,
  has_https:           1.5,
  is_responsive:       2.0,
  has_form:            1.0,
  has_email:           0.5,
  has_phone:           0.5,
  has_google_business: 1.5,
  social:              0.5,
  commercial_opportunity: 1.5,
} as const

export function computeAnalyseScore(a: Partial<ProspectAnalyse>): number {
  let score = 0
  if (a.has_website?.value === true)         score += ANALYSE_WEIGHTS.has_website
  if (a.has_https?.value === true)           score += ANALYSE_WEIGHTS.has_https
  if (a.is_responsive?.value === true)       score += ANALYSE_WEIGHTS.is_responsive
  if (a.has_form?.value === true)            score += ANALYSE_WEIGHTS.has_form
  if (a.has_email?.value === true)           score += ANALYSE_WEIGHTS.has_email
  if (a.has_phone?.value === true)           score += ANALYSE_WEIGHTS.has_phone
  if (a.has_google_business?.value === true) score += ANALYSE_WEIGHTS.has_google_business
  if (a.social_networks && Object.values(a.social_networks).some(v => v === true))
    score += ANALYSE_WEIGHTS.social
  if (a.commercial_opportunity?.trim())      score += ANALYSE_WEIGHTS.commercial_opportunity
  return Math.round(score * 10) / 10
}

export function getAnalyse(prospect: ProspectRow): ProspectAnalyse | null {
  const meta = prospect.metadata as Record<string, unknown> | null
  return (meta?.analyse as ProspectAnalyse) ?? null
}

export function useAnalyseProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      prospect,
      analyse,
    }: {
      prospect: ProspectRow
      analyse: ProspectAnalyse
    }) => {
      const existingMeta = (prospect.metadata ?? {}) as Record<string, unknown>
      const { error } = await supabase
        .from('prospects')
        .update({
          metadata: { ...existingMeta, analyse },
          score: Math.round(analyse.score * 10),
        })
        .eq('id', prospect.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

// ── Qualification IA ──────────────────────────────────────────────────────────

export type QualSource = 'manual' | 'auto'

export interface QualCriterion {
  value: boolean | null
  source: QualSource
}

export interface ProspectQualification {
  version: 1
  website_url: string
  has_https: QualCriterion
  is_responsive: QualCriterion
  has_form: QualCriterion
  has_google_business: QualCriterion
  ai_comment: string
  commercial_opportunity: string
  score: number
  qualified_at: string | null
  qualified_by: QualSource | null
}

const QUAL_WEIGHTS = {
  has_https: 2.0,
  is_responsive: 2.5,
  has_form: 1.5,
  has_google_business: 2.0,
  commercial_opportunity: 2.0,
} as const

export function computeQualScore(q: Partial<ProspectQualification>): number {
  let score = 0
  if (q.has_https?.value === true)          score += QUAL_WEIGHTS.has_https
  if (q.is_responsive?.value === true)      score += QUAL_WEIGHTS.is_responsive
  if (q.has_form?.value === true)           score += QUAL_WEIGHTS.has_form
  if (q.has_google_business?.value === true) score += QUAL_WEIGHTS.has_google_business
  if (q.commercial_opportunity?.trim())     score += QUAL_WEIGHTS.commercial_opportunity
  return Math.round(score * 10) / 10
}

export function getQualification(prospect: ProspectRow): ProspectQualification | null {
  const meta = prospect.metadata as Record<string, unknown> | null
  return (meta?.qualification as ProspectQualification) ?? null
}

/**
 * FUTURE: Brancher les API externes ici
 * - HTTPS        → vérifier le protocole + redirection HTTP→HTTPS
 * - Responsive   → Google PageSpeed Insights API (strategy=mobile)
 * - Formulaire   → scraping HTML, détection <form> / Typeform / HubSpot
 * - Google Biz   → Google Places API (Text Search ou Find Place)
 * - Commentaire  → Anthropic API, prompt de qualification commerciale
 * - Opportunité  → Anthropic API, analyse du secteur + besoins probables
 */
export async function autoQualifyProspect(
  _websiteUrl: string,
): Promise<Partial<ProspectQualification>> {
  // Non connecté — retourne vide pour que l'UI reste inchangée
  return {}
}

export function useQualifyProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      prospect,
      qualification,
    }: {
      prospect: ProspectRow
      qualification: ProspectQualification
    }) => {
      const existingMeta = (prospect.metadata ?? {}) as Record<string, unknown>
      const { error } = await supabase
        .from('prospects')
        .update({
          metadata: { ...existingMeta, qualification },
          score: Math.round(qualification.score * 10),
        })
        .eq('id', prospect.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
