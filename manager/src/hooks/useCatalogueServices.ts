import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CatalogueCategorie = 'web' | 'ecommerce' | 'seo' | 'ia' | 'branding' | 'application' | 'autre'

export interface CatalogueService {
  id: string
  created_at: string
  updated_at: string
  nom: string
  description: string
  categorie: CatalogueCategorie
  prix: number
  visible: boolean
  ordre: number
}

export interface CatalogueServicePayload {
  nom: string
  description: string
  categorie: CatalogueCategorie
  prix: number
  ordre: number
}

// ─── Query key ─────────────────────────────────────────────────────────────────

const Q = ['catalogue_services'] as const

// ─── Map ──────────────────────────────────────────────────────────────────────

function mapRow(r: Record<string, unknown>): CatalogueService {
  return {
    id:          r.id as string,
    created_at:  r.created_at as string,
    updated_at:  r.updated_at as string,
    nom:         r.nom as string,
    description: (r.description as string) ?? '',
    categorie:   (r.categorie as CatalogueCategorie) ?? 'web',
    prix:        Number(r.prix ?? 0),
    visible:     Boolean(r.visible),
    ordre:       Number(r.ordre ?? 0),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useCatalogueServices() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue_services')
        .select('*')
        .order('ordre', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateCatalogueService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: CatalogueServicePayload) => {
      const { data, error } = await supabase
        .from('catalogue_services')
        .insert([{
          nom:         p.nom,
          description: p.description,
          categorie:   p.categorie,
          prix:        p.prix,
          ordre:       p.ordre,
          visible:     false,
        }])
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateCatalogueService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...p }: CatalogueServicePayload & { id: string }) => {
      const { data, error } = await supabase
        .from('catalogue_services')
        .update({
          nom:         p.nom,
          description: p.description,
          categorie:   p.categorie,
          prix:        p.prix,
          ordre:       p.ordre,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useToggleCatalogueVisible() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from('catalogue_services')
        .update({ visible })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteCatalogueService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalogue_services')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDuplicateCatalogueService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (s: CatalogueService) => {
      const { data: all } = await supabase
        .from('catalogue_services')
        .select('ordre')
        .order('ordre', { ascending: false })
        .limit(1)
      const maxOrdre = (all?.[0]?.ordre as number) ?? 0
      const { data, error } = await supabase
        .from('catalogue_services')
        .insert([{
          nom:         `${s.nom} (copie)`,
          description: s.description,
          categorie:   s.categorie,
          prix:        s.prix,
          ordre:       maxOrdre + 1,
          visible:     false,
        }])
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
