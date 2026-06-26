import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tache, TacheStatus, TachePriority } from '@/types'

const STATUS_FROM_DB: Record<string, TacheStatus> = {
  todo: 'a_faire', in_progress: 'en_cours', review: 'bloque', done: 'termine',
}
const STATUS_TO_DB: Record<TacheStatus, string> = {
  a_faire: 'todo', en_cours: 'in_progress', bloque: 'review', termine: 'done',
}
const PRIORITY_FROM_DB: Record<string, TachePriority> = {
  low: 'basse', medium: 'normale', high: 'haute', urgent: 'urgente',
}
const PRIORITY_TO_DB: Record<TachePriority, string> = {
  basse: 'low', normale: 'medium', haute: 'high', urgente: 'urgent',
}

const PROJECT_SELECT = 'id, name, client_id, budget, progress, created_at, updated_at, color'
const TASK_SELECT = `*, projects(${PROJECT_SELECT})`

function mapRow(row: Record<string, any>): Tache {
  const p = row.projects
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    titre: row.title,
    description: row.description ?? undefined,
    projet_id: row.project_id ?? undefined,
    projet: p ? {
      id: p.id, created_at: p.created_at, updated_at: p.updated_at,
      nom: p.name, client_id: p.client_id, status: 'en_cours' as const,
      budget: Number(p.budget ?? 0), progression: p.progress ?? 0,
      couleur: p.color ?? '#0066FF',
    } : undefined,
    status: STATUS_FROM_DB[row.status] ?? 'a_faire',
    priority: PRIORITY_FROM_DB[row.priority ?? 'medium'] ?? 'normale',
    date_echeance: row.due_date ?? undefined,
    date_completion: row.status === 'done' ? row.updated_at?.split('T')[0] : undefined,
    tags: row.tags ?? [],
    time_estime: row.time_estime ?? undefined,
    time_log: row.time_log ?? 0,
  }
}

const Q = ['taches'] as const

export function useTaches(projetId?: string) {
  return useQuery({
    queryKey: [...Q, projetId],
    queryFn: async () => {
      let q = supabase
        .from('project_tasks')
        .select(TASK_SELECT)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (projetId) q = q.eq('project_id', projetId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useCreateTache() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (t: {
      titre: string; description?: string; priority: TachePriority
      date_echeance?: string; projet_id?: string; status?: TacheStatus
      tags?: string[]; time_estime?: number
    }) => {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([{
          title: t.titre,
          description: t.description || null,
          priority: PRIORITY_TO_DB[t.priority],
          due_date: t.date_echeance || null,
          project_id: t.projet_id || null,
          status: t.status ? STATUS_TO_DB[t.status] : 'todo',
          tags: t.tags ?? [],
          time_estime: t.time_estime ?? null,
          time_log: 0,
          sort_order: 99,
        }])
        .select(TASK_SELECT)
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateTacheStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TacheStatus }) => {
      const { data, error } = await supabase
        .from('project_tasks')
        .update({ status: STATUS_TO_DB[status] })
        .eq('id', id)
        .select(TASK_SELECT)
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateTache() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...t }: {
      id: string; titre?: string; description?: string
      priority?: TachePriority; date_echeance?: string
      status?: TacheStatus; projet_id?: string
      tags?: string[]; time_estime?: number; time_log?: number
    }) => {
      const update: Record<string, any> = {}
      if (t.titre !== undefined) update.title = t.titre
      if (t.description !== undefined) update.description = t.description || null
      if (t.priority !== undefined) update.priority = PRIORITY_TO_DB[t.priority]
      if (t.date_echeance !== undefined) update.due_date = t.date_echeance || null
      if (t.status !== undefined) update.status = STATUS_TO_DB[t.status]
      if (t.projet_id !== undefined) update.project_id = t.projet_id || null
      if (t.tags !== undefined) update.tags = t.tags
      if (t.time_estime !== undefined) update.time_estime = t.time_estime || null
      if (t.time_log !== undefined) update.time_log = t.time_log
      const { data, error } = await supabase
        .from('project_tasks')
        .update(update)
        .eq('id', id)
        .select(TASK_SELECT)
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteTache() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
