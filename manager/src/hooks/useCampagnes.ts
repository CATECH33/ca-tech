import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { EmailDraftTone } from '@/types'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived'
export type CampaignType   = 'email' | 'phone' | 'linkedin' | 'whatsapp'
export type ProspectCampaignStatus = 'active' | 'paused' | 'completed' | 'unsubscribed'

export interface CampaignStep {
  id: string
  created_at: string
  campaign_id: string
  step_number: number
  delay_days: number
  subject: string
  body: string
  tone: EmailDraftTone
}

export interface ProspectCampaignRow {
  id: string
  created_at: string
  campaign_id: string
  prospect_id: string
  current_step: number
  status: ProspectCampaignStatus
  started_at: string | null
  completed_at: string | null
  prospect: { id: string; company_name: string } | null
}

export interface CampaignBase {
  id:          string
  created_at:  string
  updated_at:  string
  name:        string
  description: string | null
  objective:   string | null
  type:        CampaignType
  status:      CampaignStatus
  emails_sent: number
  replies:     number
  meetings:    number
  clients:     number
  tags:        string[]
  created_by:  string | null
}

export interface CampaignRow extends CampaignBase {
  steps:    CampaignStep[]
  enrolled: ProspectCampaignRow[]
}

/* ─── Query key ──────────────────────────────────────────────────────────── */

const Q = ['campaigns'] as const

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function fetchCampaigns(): Promise<CampaignRow[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      steps:campaign_steps(*),
      enrolled:prospect_campaigns(
        *,
        prospect:prospects!prospect_id(id, company_name)
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CampaignRow[]
}

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

export function useCampaigns() {
  return useQuery({ queryKey: Q, queryFn: fetchCampaigns })
}

export interface CreateCampaignInput {
  name:        string
  description?: string | null
  objective?:  string | null
  type?:       CampaignType
  status?:     CampaignStatus
  tags?:       string[]
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCampaignInput): Promise<CampaignBase> => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name:        input.name,
          description: input.description ?? null,
          objective:   input.objective   ?? null,
          type:        input.type        ?? 'email',
          status:      input.status      ?? 'draft',
          tags:        input.tags        ?? [],
        })
        .select()
        .single()
      if (error) throw error
      return data as CampaignBase
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export interface UpdateCampaignInput {
  id:           string
  name?:        string
  description?: string | null
  objective?:   string | null
  type?:        CampaignType
  status?:      CampaignStatus
  emails_sent?: number
  replies?:     number
  meetings?:    number
  clients?:     number
  tags?:        string[]
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCampaignInput) => {
      const { error } = await supabase
        .from('campaigns')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('prospect_campaigns').delete().eq('campaign_id', id)
      await supabase.from('campaign_steps').delete().eq('campaign_id', id)
      const { error } = await supabase.from('campaigns').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDuplicateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (campaign: CampaignRow): Promise<CampaignBase> => {
      const { data: newCampaign, error: ce } = await supabase
        .from('campaigns')
        .insert({
          name:        `${campaign.name} (copie)`,
          description: campaign.description,
          objective:   campaign.objective,
          type:        campaign.type,
          status:      'draft',
          tags:        campaign.tags,
          emails_sent: 0,
          replies:     0,
          meetings:    0,
          clients:     0,
        })
        .select()
        .single()
      if (ce) throw ce
      if (campaign.steps.length > 0) {
        const steps = [...campaign.steps]
          .sort((a, b) => a.step_number - b.step_number)
          .map(s => ({
            campaign_id: (newCampaign as CampaignBase).id,
            step_number: s.step_number,
            delay_days:  s.delay_days,
            subject:     s.subject,
            body:        s.body,
            tone:        s.tone,
          }))
        const { error: se } = await supabase.from('campaign_steps').insert(steps)
        if (se) throw se
      }
      return newCampaign as CampaignBase
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

/* ─── Steps ──────────────────────────────────────────────────────────────── */

export interface CreateStepInput {
  campaign_id: string
  step_number: number
  delay_days: number
  subject: string
  body: string
  tone: EmailDraftTone
}

export function useCreateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateStepInput) => {
      const { error } = await supabase.from('campaign_steps').insert(input)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export interface UpdateStepInput {
  id: string
  delay_days?: number
  subject?: string
  body?: string
  tone?: EmailDraftTone
}

export function useUpdateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateStepInput) => {
      const { error } = await supabase.from('campaign_steps').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('campaign_steps').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

/* ─── Prospects enrôlés ──────────────────────────────────────────────────── */

export function useEnrollProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ campaign_id, prospect_id }: { campaign_id: string; prospect_id: string }) => {
      const { error } = await supabase.from('prospect_campaigns').insert({
        campaign_id,
        prospect_id,
        status: 'active',
        current_step: 0,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useRemoveProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prospect_campaigns').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
