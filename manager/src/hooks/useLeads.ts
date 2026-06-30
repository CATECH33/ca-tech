import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadStatus } from '@/types'

const STATUS_FROM_DB: Record<string, LeadStatus> = {
  new: 'nouveau', contacted: 'contact', qualified: 'qualifie',
  proposal: 'proposition', negotiation: 'negocie', won: 'gagne', lost: 'perdu',
}
const STATUS_TO_DB: Record<LeadStatus, string> = {
  nouveau: 'new', contact: 'contacted', qualifie: 'qualified',
  proposition: 'proposal', negocie: 'negotiation', gagne: 'won', perdu: 'lost',
}

function mapRow(row: Record<string, any>): Lead {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    nom: row.last_name,
    prenom: row.first_name,
    email: row.email ?? '',
    telephone: row.phone ?? undefined,
    entreprise: row.company ?? undefined,
    source: row.source ?? '',
    status: STATUS_FROM_DB[row.status] ?? 'nouveau',
    budget_estime: row.budget_max ?? row.budget_min ?? undefined,
    besoin: row.notes ?? undefined,
    client_id: row.converted_to_client_id ?? undefined,
  }
}

const Q = ['leads'] as const

export function useLeads() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (l: { prenom: string; nom: string; email: string; telephone?: string; entreprise?: string; source?: string; budget_estime?: number; besoin?: string; status?: LeadStatus }) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          first_name: l.prenom, last_name: l.nom, email: l.email,
          phone: l.telephone || null, company: l.entreprise || null,
          source: l.source || null, budget_max: l.budget_estime || null,
          notes: l.besoin || null,
          status: l.status ? STATUS_TO_DB[l.status] : 'new',
        }])
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...l }: { id: string; prenom?: string; nom?: string; email?: string; telephone?: string; entreprise?: string; source?: string; budget_estime?: number; besoin?: string; status?: LeadStatus }) => {
      const update: Record<string, any> = {}
      if (l.prenom !== undefined) update.first_name = l.prenom
      if (l.nom !== undefined) update.last_name = l.nom
      if (l.email !== undefined) update.email = l.email
      if (l.telephone !== undefined) update.phone = l.telephone || null
      if (l.entreprise !== undefined) update.company = l.entreprise || null
      if (l.source !== undefined) update.source = l.source || null
      if (l.budget_estime !== undefined) update.budget_max = l.budget_estime || null
      if (l.besoin !== undefined) update.notes = l.besoin || null
      if (l.status !== undefined) update.status = STATUS_TO_DB[l.status]
      const { data, error } = await supabase.from('leads').update(update).eq('id', id).select().single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status: STATUS_TO_DB[status] })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useLeadsRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          qc.setQueryData(['leads'], (old: Lead[] | undefined) => {
            const newLead = mapRow(payload.new as Record<string, any>)
            return [newLead, ...(old ?? [])]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])
}

export function useConvertLeadToClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (lead: Lead) => {
      const { data: client, error: ce } = await supabase
        .from('clients')
        .insert([{
          first_name: lead.prenom, last_name: lead.nom, email: lead.email,
          phone: lead.telephone || null, company: lead.entreprise || null,
          country: 'France', status: 'active',
        }])
        .select()
        .single()
      if (ce) throw ce
      const { error: le } = await supabase
        .from('leads')
        .update({ status: 'won', converted_to_client_id: client.id })
        .eq('id', lead.id)
      if (le) throw le
      return client
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: Q })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
