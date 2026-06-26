import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Projet, ProjetStatus } from '@/types'

const STATUS_FROM_DB: Record<string, ProjetStatus> = {
  draft: 'planifie', pending: 'planifie', in_progress: 'en_cours',
  review: 'en_cours', completed: 'termine', cancelled: 'annule', on_hold: 'en_pause',
}
const STATUS_TO_DB: Record<ProjetStatus, string> = {
  planifie: 'pending', en_cours: 'in_progress', en_pause: 'on_hold',
  termine: 'completed', annule: 'cancelled',
}

function mapClient(c: Record<string, any>) {
  return {
    id: c.id, created_at: c.created_at, updated_at: c.updated_at,
    nom: c.last_name, prenom: c.first_name, email: c.email,
    telephone: c.phone ?? undefined, entreprise: c.company ?? undefined,
    pays: c.country ?? 'France',
    status: c.status === 'active' ? 'actif' as const : c.status === 'inactive' ? 'inactif' as const : 'archive' as const,
    total_ca: 0,
  }
}

function mapRow(row: Record<string, any>): Projet {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    nom: row.name,
    description: row.description ?? undefined,
    notes: row.notes ?? undefined,
    client_id: row.client_id,
    client: row.clients ? mapClient(row.clients) : undefined,
    status: STATUS_FROM_DB[row.status] ?? 'planifie',
    date_debut: row.start_date ?? undefined,
    date_fin_prevue: row.due_date ?? undefined,
    date_fin_reelle: row.completed_date ?? undefined,
    budget: row.budget ? Number(row.budget) : 0,
    progression: row.progress ?? 0,
    couleur: row.color ?? '#0066FF',
    tags: row.tags ?? [],
  }
}

const Q = ['projets'] as const

export function useProjets() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useCreateProjet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: {
      nom: string; client_id: string; description?: string; notes?: string
      budget?: number; date_debut?: string; date_fin_prevue?: string
      couleur?: string; tags?: string[]
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: p.nom, client_id: p.client_id,
          description: p.description ?? null, notes: p.notes ?? null,
          budget: p.budget ?? null,
          start_date: p.date_debut ?? null, due_date: p.date_fin_prevue ?? null,
          color: p.couleur ?? '#0066FF', tags: p.tags ?? [],
          status: 'pending', progress: 0,
        }])
        .select('*, clients(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateProjet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...p }: {
      id: string; nom?: string; description?: string; notes?: string
      client_id?: string; status?: ProjetStatus; budget?: number
      date_debut?: string; date_fin_prevue?: string; progression?: number
      couleur?: string; tags?: string[]
    }) => {
      const update: Record<string, any> = {}
      if (p.nom !== undefined) update.name = p.nom
      if (p.description !== undefined) update.description = p.description || null
      if (p.notes !== undefined) update.notes = p.notes || null
      if (p.client_id !== undefined) update.client_id = p.client_id
      if (p.status !== undefined) update.status = STATUS_TO_DB[p.status]
      if (p.budget !== undefined) update.budget = p.budget || null
      if (p.date_debut !== undefined) update.start_date = p.date_debut || null
      if (p.date_fin_prevue !== undefined) update.due_date = p.date_fin_prevue || null
      if (p.couleur !== undefined) update.color = p.couleur
      if (p.tags !== undefined) update.tags = p.tags
      if (p.progression !== undefined) {
        update.progress = p.progression
        if (p.progression === 100 && p.status !== 'annule') {
          update.status = 'completed'
          update.completed_date = new Date().toISOString().split('T')[0]
        }
      }
      const { data, error } = await supabase.from('projects').update(update).eq('id', id).select('*, clients(*)').single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateProjetProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, progression }: { id: string; progression: number }) => {
      const update: Record<string, any> = { progress: progression }
      if (progression === 100) { update.status = 'completed'; update.completed_date = new Date().toISOString().split('T')[0] }
      const { data, error } = await supabase.from('projects').update(update).eq('id', id).select('*, clients(*)').single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateProjetStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjetStatus }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ status: STATUS_TO_DB[status] })
        .eq('id', id)
        .select('*, clients(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteProjet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export type ProjetDevis = {
  id: string; numero: string; status: string; total_ttc: number; created_at: string
}
export type ProjetFacture = {
  id: string; numero: string; status: string; total_ttc: number; amount_paid: number; created_at: string
}

export function useProjetDevis(projetId: string | null) {
  return useQuery({
    queryKey: ['projet-devis', projetId],
    enabled: !!projetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, quote_number, status, total, created_at')
        .eq('project_id', projetId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id, numero: r.quote_number,
        status: r.status, total_ttc: Number(r.total), created_at: r.created_at,
      })) as ProjetDevis[]
    },
  })
}

export function useProjetFactures(projetId: string | null) {
  return useQuery({
    queryKey: ['projet-factures', projetId],
    enabled: !!projetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, status, total, amount_paid, created_at')
        .eq('project_id', projetId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id, numero: r.invoice_number,
        status: r.status, total_ttc: Number(r.total),
        amount_paid: Number(r.amount_paid ?? 0), created_at: r.created_at,
      })) as ProjetFacture[]
    },
  })
}
