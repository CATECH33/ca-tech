import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem } from '@/types'

const BUCKET = 'portfolio'
const Q = ['portfolio'] as const

// ─── Map ──────────────────────────────────────────────────────────────────────

function mapRow(r: Record<string, any>): PortfolioItem {
  return {
    id: r.id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    titre: r.title,
    slug: r.slug,
    description: r.description ?? undefined,
    categorie: r.category ?? undefined,
    client_nom: r.client_name ?? undefined,
    service_id: r.service_id ?? undefined,
    thumbnail_url: r.thumbnail_url ?? undefined,
    images: Array.isArray(r.images) ? r.images : [],
    url_projet: r.live_url ?? undefined,
    technologies: Array.isArray(r.technologies) ? r.technologies : [],
    featured: Boolean(r.is_featured),
    publie: Boolean(r.is_published),
    ordre: Number(r.sort_order ?? 0),
    date_livraison: r.delivery_date ?? undefined,
    probleme: r.probleme ?? undefined,
    solution: r.solution ?? undefined,
    resultats: Array.isArray(r.resultats) ? r.resultats : [],
  }
}

function makeSlug(titre: string): string {
  return titre.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-' + Date.now().toString(36)
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function uploadImage(itemId: string, file: File, prefix: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${itemId}/${prefix}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function urlToPath(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/storage\/v1\/object\/public\/portfolio\/(.+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function deleteStorageUrls(urls: string[]) {
  const paths = urls.map(urlToPath).filter(Boolean) as string[]
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths)
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePortfolioItems() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface PortfolioPayload {
  titre: string
  categorie?: string
  client_nom?: string
  description?: string
  date_livraison?: string
  url_projet?: string
  technologies: string[]
  featured: boolean
  publie: boolean
  thumbFile?: File | null
  galleryFiles?: File[]
  removeImages?: string[]
  keepImages?: string[]
  probleme?: string
  solution?: string
  resultats?: Array<{ val: string; lbl: string }>
}

export function useCreatePortfolioItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: PortfolioPayload) => {
      const slug = makeSlug(p.titre)

      const { data: item, error } = await supabase
        .from('portfolio_projects')
        .insert([{
          title: p.titre,
          slug,
          category: p.categorie || null,
          client_name: p.client_nom || null,
          description: p.description || null,
          delivery_date: p.date_livraison || null,
          live_url: p.url_projet || null,
          technologies: p.technologies,
          is_featured: p.featured,
          is_published: p.publie,
          images: [],
          published_at: p.publie ? new Date().toISOString() : null,
          probleme: p.probleme || null,
          solution: p.solution || null,
          resultats: p.resultats ?? [],
        }])
        .select()
        .single()
      if (error) throw error

      const id = item.id
      const updates: Record<string, any> = {}

      if (p.thumbFile) {
        updates.thumbnail_url = await uploadImage(id, p.thumbFile, 'thumb')
      }
      if (p.galleryFiles && p.galleryFiles.length > 0) {
        const urls = await Promise.all(p.galleryFiles.map(f => uploadImage(id, f, 'gallery')))
        updates.images = urls
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from('portfolio_projects').update(updates).eq('id', id)
      }
      return mapRow({ ...item, ...updates })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdatePortfolioItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...p }: PortfolioPayload & { id: string }) => {
      // Delete images marked for removal
      if (p.removeImages && p.removeImages.length > 0) {
        await deleteStorageUrls(p.removeImages)
      }

      const patch: Record<string, any> = {
        title: p.titre,
        category: p.categorie || null,
        client_name: p.client_nom || null,
        description: p.description || null,
        delivery_date: p.date_livraison || null,
        live_url: p.url_projet || null,
        technologies: p.technologies,
        is_featured: p.featured,
        is_published: p.publie,
        published_at: p.publie ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        probleme: p.probleme || null,
        solution: p.solution || null,
        resultats: p.resultats ?? [],
      }

      if (p.thumbFile) {
        patch.thumbnail_url = await uploadImage(id, p.thumbFile, 'thumb')
      }

      const galleryUrls: string[] = [...(p.keepImages ?? [])]
      if (p.galleryFiles && p.galleryFiles.length > 0) {
        const newUrls = await Promise.all(p.galleryFiles.map(f => uploadImage(id, f, 'gallery')))
        galleryUrls.push(...newUrls)
      }
      patch.images = galleryUrls

      const { data, error } = await supabase
        .from('portfolio_projects')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeletePortfolioItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (item: PortfolioItem) => {
      // Remove all storage files for this item
      const allUrls = [item.thumbnail_url, ...item.images].filter(Boolean) as string[]
      await deleteStorageUrls(allUrls)
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useToggleFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('portfolio_projects').update({ is_featured: featured }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useTogglePublished() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, publie }: { id: string; publie: boolean }) => {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ is_published: publie, published_at: publie ? new Date().toISOString() : null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
