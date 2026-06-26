import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/types'

function mapRow(row: Record<string, any>): Service {
  return {
    id: row.id,
    created_at: row.created_at,
    nom: row.name,
    description: row.description ?? undefined,
    prix_base: Number(row.base_price ?? 0),
    unite: row.price_unit ?? 'forfait',
    actif: row.is_active,
    categorie: row.category ?? 'autre',
    duree_jours: row.duration_days ?? undefined,
  }
}

const Q = ['services'] as const

export function useServices() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useServiceStats() {
  return useQuery({
    queryKey: ['service-stats'],
    queryFn: async () => {
      const [qResult, iResult] = await Promise.all([
        supabase.from('quote_items').select('service_id, total_price').not('service_id', 'is', null),
        supabase.from('invoice_items').select('service_id, total_price').not('service_id', 'is', null),
      ])
      const stats: Record<string, { ventes: number; ca: number }> = {}
      for (const item of [...(qResult.data ?? []), ...(iResult.data ?? [])]) {
        if (!item.service_id) continue
        if (!stats[item.service_id]) stats[item.service_id] = { ventes: 0, ca: 0 }
        stats[item.service_id].ventes++
        stats[item.service_id].ca += Number(item.total_price ?? 0)
      }
      return stats
    },
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (s: { nom: string; description?: string; prix_base: number; unite: string; categorie: string; duree_jours?: number }) => {
      const slug = s.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: s.nom, slug,
          description: s.description || null,
          base_price: s.prix_base,
          price_unit: s.unite,
          category: s.categorie,
          is_active: true,
          duration_days: s.duree_jours ?? null,
        }])
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...s }: { id: string; nom?: string; description?: string; prix_base?: number; unite?: string; categorie?: string; actif?: boolean; duree_jours?: number }) => {
      const update: Record<string, any> = {}
      if (s.nom !== undefined) update.name = s.nom
      if (s.description !== undefined) update.description = s.description || null
      if (s.prix_base !== undefined) update.base_price = s.prix_base
      if (s.unite !== undefined) update.price_unit = s.unite
      if (s.categorie !== undefined) update.category = s.categorie
      if (s.actif !== undefined) update.is_active = s.actif
      if (s.duree_jours !== undefined) update.duration_days = s.duree_jours ?? null
      const { data, error } = await supabase.from('services').update(update).eq('id', id).select().single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
