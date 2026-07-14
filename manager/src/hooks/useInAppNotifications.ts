import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface InAppNotification {
  id:          string
  created_at:  string
  title:       string
  message:     string | null
  type:        'info' | 'success' | 'warning' | 'error'
  link:        string | null
  is_read:     boolean
  prospect_id: string | null
  user_id:     string | null
  metadata:    Record<string, unknown>
}

const Q = ['in-app-notifications'] as const

async function fetchNotifications(): Promise<InAppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, created_at, title, message, type, link, is_read, prospect_id, metadata')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as InAppNotification[]
}

export function useInAppNotifications() {
  return useQuery({ queryKey: Q, queryFn: fetchNotifications })
}

export function useUnreadNotificationCount() {
  const { data = [] } = useInAppNotifications()
  return data.filter(n => !n.is_read).length
}

export function useInAppNotificationsRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('in_app_notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' },
        () => qc.invalidateQueries({ queryKey: Q }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
