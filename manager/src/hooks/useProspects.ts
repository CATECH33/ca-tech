import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prospect, ProspectStatus, ProspectSource } from '@/types'

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

export function useProspects() {
  return useQuery({ queryKey: Q, queryFn: fetchProspects })
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
      const { error } = await supabase.from('prospects').insert({
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
      })
      if (error) throw error
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
