import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type ChurnEventType = 'payment_failed' | 'payment_recovered' | 'auto_suspended' | 'manually_reactivated'

export interface ChurnEvent {
  id: string
  event_type: ChurnEventType
  consecutive_failures_at_event: number
  metadata: Record<string, unknown> | null
  created_at: string
  subscriptions: {
    id: string
    name: string
    amount: number
    clients: { first_name: string; last_name: string } | null
  } | null
}

export function useChurnEvents(days = 30) {
  return useQuery({
    queryKey: ['churn_events', days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('churn_events')
        .select(`
          id,
          event_type,
          consecutive_failures_at_event,
          metadata,
          created_at,
          subscriptions(
            id, name, amount,
            clients(first_name, last_name)
          )
        `)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as unknown as ChurnEvent[]
    },
  })
}

export function useAutoSuspendSetting() {
  return useQuery({
    queryKey: ['global_settings', 'auto_suspend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'auto_suspend')
        .maybeSingle()
      if (error) throw error
      return (data?.value as boolean) ?? true
    },
  })
}

export function useUpdateAutoSuspend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('global_settings')
        .update({ value: enabled, updated_at: new Date().toISOString() })
        .eq('key', 'auto_suspend')
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['global_settings', 'auto_suspend'] }),
  })
}
