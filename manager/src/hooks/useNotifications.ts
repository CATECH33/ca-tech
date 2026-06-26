import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface NotificationLog {
  id: string
  prospect_id: string | null
  type: 'email' | 'telegram' | 'whatsapp'
  provider: string
  status: 'sent' | 'failed' | 'skipped'
  recipient: string | null
  message: string | null
  error: string | null
  metadata: Record<string, any>
  created_at: string
}

const Q = ['notifications'] as const

export function useNotifications() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' },
        () => { qc.invalidateQueries({ queryKey: Q }) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return (data ?? []) as NotificationLog[]
    },
    refetchInterval: 30_000,
  })
}
