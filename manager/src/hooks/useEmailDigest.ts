import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { subDays, startOfDay } from 'date-fns'

export type DigestCategory = 'Prospect' | 'Client' | 'Fournisseur' | 'Administratif' | 'Urgent'

export interface EmailDigestItem {
  id: string
  gmail_message_id: string
  from_addr: string
  subject: string | null
  category: DigestCategory
  summary: string | null
  action_needed: boolean
  action_text: string | null
  received_at: string
  processed_at: string | null
  gmail_link: string | null
  is_processed: boolean
  reported: boolean
  created_at: string
}

export interface DigestFilters {
  category?: DigestCategory | 'all'
  is_processed?: boolean | 'all'
  days?: 1 | 7 | 30
}

export const CATEGORY_META: Record<DigestCategory, {
  label: string
  color: string
  bg: string
  border: string
  dot: string
}> = {
  Urgent:        { label: 'Urgent',        color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-100',    dot: 'bg-red-500'    },
  Prospect:      { label: 'Prospect',      color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-100',   dot: 'bg-blue-500'   },
  Client:        { label: 'Client',        color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-100',dot: 'bg-emerald-500'},
  Fournisseur:   { label: 'Fournisseur',   color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-100', dot: 'bg-violet-500' },
  Administratif: { label: 'Administratif', color: 'text-gray-600',   bg: 'bg-gray-50',    border: 'border-gray-200',   dot: 'bg-gray-400'   },
}

export const CATEGORIES: DigestCategory[] = ['Urgent', 'Prospect', 'Client', 'Fournisseur', 'Administratif']

const QK = 'email-digest-items'

export function useEmailDigestItems(filters: DigestFilters = {}) {
  const { category = 'all', is_processed = 'all', days = 30 } = filters

  return useQuery({
    queryKey: [QK, category, is_processed, days],
    queryFn: async (): Promise<EmailDigestItem[]> => {
      const since = startOfDay(subDays(new Date(), days)).toISOString()

      let q = supabase
        .from('email_digest_items')
        .select('*')
        .gte('received_at', since)
        .order('received_at', { ascending: false })

      if (category !== 'all') q = q.eq('category', category)
      if (is_processed !== 'all') q = q.eq('is_processed', is_processed)

      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as EmailDigestItem[]
    },
    staleTime: 60_000,
  })
}

export function useEmailDigestStats() {
  return useQuery({
    queryKey: [QK, 'stats'],
    queryFn: async () => {
      const since = startOfDay(subDays(new Date(), 30)).toISOString()
      const { data, error } = await supabase
        .from('email_digest_items')
        .select('category, action_needed, is_processed, received_at')
        .gte('received_at', since)
      if (error) throw error
      const items = data ?? []

      const todayCutoff = startOfDay(new Date()).toISOString()

      return {
        total:       items.length,
        today:       items.filter(i => i.received_at >= todayCutoff).length,
        actionCount: items.filter(i => i.action_needed).length,
        unprocessed: items.filter(i => !i.is_processed).length,
        byCategory:  Object.fromEntries(
          CATEGORIES.map(c => [c, items.filter(i => i.category === c).length])
        ) as Record<DigestCategory, number>,
      }
    },
    staleTime: 60_000,
  })
}

export function useMarkDigestItemProcessed() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_digest_items')
        .update({ is_processed: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] })
    },
  })
}
