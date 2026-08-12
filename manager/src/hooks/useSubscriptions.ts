import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Subscription, SubscriptionPlan } from '@/types'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const Q = ['subscriptions'] as const

function mapRow(row: Record<string, any>): Subscription {
  return {
    id:                        row.id,
    created_at:                row.created_at,
    updated_at:                row.updated_at,
    client_id:                 row.client_id,
    devis_id:                  row.devis_id ?? undefined,
    name:                      row.name,
    amount:                    Number(row.amount),
    currency:                  row.currency ?? 'eur',
    frequency:                 row.frequency ?? 'monthly',
    status:                    row.status,
    stripe_customer_id:        row.stripe_customer_id ?? undefined,
    stripe_subscription_id:    row.stripe_subscription_id ?? undefined,
    stripe_checkout_session_id: row.stripe_checkout_session_id ?? undefined,
    current_period_start:      row.current_period_start ?? undefined,
    current_period_end:        row.current_period_end ?? undefined,
    cancelled_at:              row.cancelled_at ?? undefined,
  }
}

export function useSubscriptions(clientId?: string) {
  return useQuery({
    queryKey: [...Q, clientId ?? 'all'],
    queryFn: async () => {
      let query = supabase.from('subscriptions').select('*')
      if (clientId) query = query.eq('client_id', clientId)
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useCreateSubscriptionCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ client_id, plan, devis_id }: { client_id: string; plan: SubscriptionPlan; devis_id?: string }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? SUPABASE_ANON_KEY
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ client_id, plan, devis_id }),
      })
      const data = await res.json() as { url?: string; session_id?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      if (!data.url) throw new Error('Aucune URL retournée')
      return data.url as string
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? SUPABASE_ANON_KEY
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ subscription_id: id }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
