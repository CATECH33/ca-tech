import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CatalogueCategorie = 'web' | 'ecommerce' | 'seo' | 'ia' | 'branding' | 'application' | 'autre'

/** Shape complète d'un service (migration 009 + champs futurs migration 010). */
export interface CatalogueService {
  id:          string
  created_at:  string
  updated_at:  string
  // ── Migration 009 (existant) ──────────────────────────────────────
  nom:         string
  description: string          // description_courte mappée à la colonne 'description'
  categorie:   CatalogueCategorie
  prix:        number
  visible:     boolean
  ordre:       number
  // ── Migration 010 (à venir) ───────────────────────────────────────
  slug:                 string | null
  description_complete: string | null
  image_url:            string | null
  icone:                string | null
  prix_barre:           number | null
  cta_label:            string | null
  seo_title:            string | null
  seo_description:      string | null
}

/** Payload complet du formulaire → ce que les hooks acceptent. */
export interface CatalogueServicePayload {
  // ── Migration 009 ─────────────────────────────────────────────────
  nom:               string
  description_courte: string
  categorie:         CatalogueCategorie
  prix:              number
  ordre:             number
  visible:           boolean
  // ── Migration 010 ─────────────────────────────────────────────────
  slug:                 string
  description_complete: string
  image_url:            string | null
  icone:                string
  prix_barre:           number | null
  cta_label:            string
  seo_title:            string
  seo_description:      string
}

// ─── Query key ─────────────────────────────────────────────────────────────────

const Q = ['catalogue_services'] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    // Champs migration 010
    slug:                 (r.slug as string | null) ?? null,
    description_complete: (r.description_complete as string | null) ?? null,
    image_url:            (r.image_url as string | null) ?? null,
    icone:                (r.icone as string | null) ?? null,
    prix_barre:           r.prix_barre != null ? Number(r.prix_barre) : null,
    cta_label:            (r.cta_label as string | null) ?? null,
    seo_title:            (r.seo_title as string | null) ?? null,
    seo_description:      (r.seo_description as string | null) ?? null,
  }
}

function toDbRow(p: CatalogueServicePayload) {
  return {
    nom:                  p.nom,
    description:          p.description_courte,
    categorie:            p.categorie,
    prix:                 p.prix,
    ordre:                p.ordre,
    visible:              p.visible,
    slug:                 p.slug || null,
    description_complete: p.description_complete,
    image_url:            p.image_url,
    icone:                p.icone,
    prix_barre:           p.prix_barre,
    cta_label:            p.cta_label,
    seo_title:            p.seo_title,
    seo_description:      p.seo_description,
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

export function useCatalogueServiceById(id: string | undefined) {
  return useQuery({
    queryKey: [...Q, id] as const,
    enabled:  Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue_services')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return mapRow(data)
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
        .insert([toDbRow(p)])
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
        .update(toDbRow(p))
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
