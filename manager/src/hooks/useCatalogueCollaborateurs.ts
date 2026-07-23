import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CollaborateurCategorie =
  | 'assistant'
  | 'agent'
  | 'analyste'
  | 'createur'
  | 'automatiseur'
  | 'autre'

export interface FaqItem {
  question: string
  reponse:  string
}

export interface CatalogueCollaborateur {
  id:          string
  created_at:  string
  updated_at:  string
  nom:                  string
  slug:                 string | null
  description:          string
  description_complete: string
  mission:              string
  fonctionnalites:      string[]
  secteurs:             string[]
  outils_compatibles:   string[]
  resultats_attendus:   string[]
  temps_installation:   string
  categorie:            CollaborateurCategorie
  image_url:            string | null
  icone:                string
  prix:                 number
  prix_barre:           number | null
  cta_label:            string
  cta_secondaire:       string
  faq:                  FaqItem[]
  seo_title:            string
  seo_description:      string
  visible:              boolean
  ordre:                number
}

export interface CatalogueCollaborateurPayload {
  nom:                  string
  slug:                 string
  description_courte:   string
  description_complete: string
  mission:              string
  fonctionnalites:      string[]
  secteurs:             string[]
  outils_compatibles:   string[]
  resultats_attendus:   string[]
  temps_installation:   string
  categorie:            CollaborateurCategorie
  image_url:            string | null
  imageFile?:           File | null
  icone:                string
  prix:                 number
  prix_barre:           number | null
  cta_label:            string
  cta_secondaire:       string
  faq:                  FaqItem[]
  seo_title:            string
  seo_description:      string
  visible:              boolean
  ordre:                number
}

// ─── Storage ───────────────────────────────────────────────────────────────────

const BUCKET = 'catalogue'

async function uploadCollabImage(id: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `collaborateurs/${id}/main-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ─── Query key ─────────────────────────────────────────────────────────────────

const Q = ['catalogue_collaborateurs'] as const

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mapRow(r: Record<string, unknown>): CatalogueCollaborateur {
  return {
    id:          r.id as string,
    created_at:  r.created_at as string,
    updated_at:  r.updated_at as string,
    nom:                  (r.nom as string) ?? '',
    slug:                 (r.slug as string | null) ?? null,
    description:          (r.description as string) ?? '',
    description_complete: (r.description_complete as string) ?? '',
    mission:              (r.mission as string) ?? '',
    fonctionnalites:      (r.fonctionnalites as string[]) ?? [],
    secteurs:             (r.secteurs as string[]) ?? [],
    outils_compatibles:   (r.outils_compatibles as string[]) ?? [],
    resultats_attendus:   (r.resultats_attendus as string[]) ?? [],
    temps_installation:   (r.temps_installation as string) ?? '',
    categorie:            ((r.categorie as CollaborateurCategorie) ?? 'assistant'),
    image_url:            (r.image_url as string | null) ?? null,
    icone:                (r.icone as string) ?? '',
    prix:                 Number(r.prix ?? 0),
    prix_barre:           r.prix_barre != null ? Number(r.prix_barre) : null,
    cta_label:            (r.cta_label as string) ?? 'Activer ce collaborateur',
    cta_secondaire:       (r.cta_secondaire as string) ?? '',
    faq:                  (r.faq as FaqItem[]) ?? [],
    seo_title:            (r.seo_title as string) ?? '',
    seo_description:      (r.seo_description as string) ?? '',
    visible:              Boolean(r.visible),
    ordre:                Number(r.ordre ?? 0),
  }
}

function toDbRow(p: CatalogueCollaborateurPayload) {
  return {
    nom:                  p.nom,
    slug:                 p.slug || null,
    description:          p.description_courte,
    description_complete: p.description_complete,
    mission:              p.mission,
    fonctionnalites:      p.fonctionnalites,
    secteurs:             p.secteurs,
    outils_compatibles:   p.outils_compatibles,
    resultats_attendus:   p.resultats_attendus,
    temps_installation:   p.temps_installation,
    categorie:            p.categorie,
    image_url:            p.image_url,
    icone:                p.icone,
    prix:                 p.prix,
    prix_barre:           p.prix_barre,
    cta_label:            p.cta_label,
    cta_secondaire:       p.cta_secondaire,
    faq:                  p.faq,
    seo_title:            p.seo_title,
    seo_description:      p.seo_description,
    visible:              p.visible,
    ordre:                p.ordre,
  }
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export function useCatalogueCollaborateurs() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue_collaborateurs')
        .select('*')
        .order('ordre', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useCatalogueCollaborateurById(id: string | undefined) {
  return useQuery({
    queryKey: [...Q, id] as const,
    enabled:  Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue_collaborateurs')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return mapRow(data)
    },
  })
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateCatalogueCollaborateur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: CatalogueCollaborateurPayload) => {
      const { data, error } = await supabase
        .from('catalogue_collaborateurs')
        .insert([toDbRow(p)])
        .select()
        .single()
      if (error) throw error
      const row = mapRow(data)

      if (p.imageFile) {
        const url = await uploadCollabImage(row.id, p.imageFile)
        const { error: e2 } = await supabase
          .from('catalogue_collaborateurs')
          .update({ image_url: url })
          .eq('id', row.id)
        if (e2) throw e2
        row.image_url = url
      }
      return row
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateCatalogueCollaborateur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...p }: CatalogueCollaborateurPayload & { id: string }) => {
      const dbRow = toDbRow(p)
      if (p.imageFile) {
        dbRow.image_url = await uploadCollabImage(id, p.imageFile)
      }
      const { data, error } = await supabase
        .from('catalogue_collaborateurs')
        .update(dbRow)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useToggleCatalogueCollaborateurVisible() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from('catalogue_collaborateurs')
        .update({ visible })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteCatalogueCollaborateur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalogue_collaborateurs')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDuplicateCatalogueCollaborateur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (c: CatalogueCollaborateur) => {
      const { data: all } = await supabase
        .from('catalogue_collaborateurs')
        .select('ordre')
        .order('ordre', { ascending: false })
        .limit(1)
      const maxOrdre = (all?.[0]?.ordre as number) ?? 0
      const { data, error } = await supabase
        .from('catalogue_collaborateurs')
        .insert([{
          nom:                  `${c.nom} (copie)`,
          slug:                 null,
          description:          c.description,
          description_complete: c.description_complete,
          mission:              c.mission,
          fonctionnalites:      c.fonctionnalites,
          secteurs:             c.secteurs,
          outils_compatibles:   c.outils_compatibles,
          resultats_attendus:   c.resultats_attendus,
          temps_installation:   c.temps_installation,
          categorie:            c.categorie,
          image_url:            c.image_url,
          icone:                c.icone,
          prix:                 c.prix,
          prix_barre:           c.prix_barre,
          cta_label:            c.cta_label,
          cta_secondaire:       c.cta_secondaire,
          faq:                  c.faq,
          seo_title:            '',
          seo_description:      '',
          visible:              false,
          ordre:                maxOrdre + 1,
        }])
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
