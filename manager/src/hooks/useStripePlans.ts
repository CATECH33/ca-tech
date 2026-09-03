import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface StripePlan {
  id:                string
  stripe_product_id: string
  stripe_price_id:   string
  name:              string
  slug:              string
  amount:            number   // centimes
  currency:          string
  interval:          string
  active:            boolean
  created_at:        string
}

const QK = ['stripe-plans']

export function useStripePlans() {
  return useQuery({
    queryKey: QK,
    queryFn: async (): Promise<StripePlan[]> => {
      const { data, error } = await supabase
        .from('stripe_plans')
        .select('*')
        .order('amount', { ascending: true })
      if (error) throw error
      return (data ?? []) as StripePlan[]
    },
    staleTime: 5 * 60_000,
  })
}

export function useToggleStripePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('stripe_plans')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
