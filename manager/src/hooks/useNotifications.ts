import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface NotificationChannel {
  id: string
  channel: 'email' | 'telegram' | 'whatsapp'
  enabled: boolean
  updated_at: string
}

export interface NotificationLog {
  id: string
  prospect_id: string | null
  type: string
  channel: 'email' | 'telegram' | 'whatsapp'
  provider: string | null
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

const QS = ['notification_settings'] as const

export function useNotificationSettings() {
  return useQuery({
    queryKey: QS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('channel')
      if (error) throw error
      return (data ?? []) as NotificationChannel[]
    },
  })
}

export function useUpdateNotificationChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ channel, enabled }: { channel: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('notification_settings')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('channel', channel)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QS }),
  })
}
