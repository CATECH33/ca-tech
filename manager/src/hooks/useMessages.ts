import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types'

export type MessageRow = Message & { is_archived: boolean; reply_body?: string }

function mapRow(r: Record<string, any>): MessageRow {
  return {
    id: r.id,
    created_at: r.created_at,
    from_name: r.from_name,
    from_email: r.from_email,
    subject: r.subject ?? undefined,
    body: r.body,
    source: r.source,
    lu: Boolean(r.is_read),
    replied: Boolean(r.is_replied),
    client_id: r.client_id ?? undefined,
    lead_id: r.lead_id ?? undefined,
    is_archived: Boolean(r.is_archived),
    reply_body: r.reply_body ?? undefined,
  }
}

const Q = ['messages'] as const

export function useMessages() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useMarkMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase.from('messages').update({ is_read }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('is_read', false)
        .eq('is_archived', false)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useReplyMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reply_body }: { id: string; reply_body: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({
          is_replied: true,
          is_read: true,
          reply_body,
          replied_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useArchiveMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_archived }: { id: string; is_archived: boolean }) => {
      const { error } = await supabase.from('messages').update({ is_archived }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useCreateMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: {
      from_name: string; from_email: string; subject?: string
      body: string; source: string; client_id?: string; lead_id?: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          from_name: m.from_name,
          from_email: m.from_email,
          subject: m.subject || null,
          body: m.body,
          source: m.source,
          client_id: m.client_id || null,
          lead_id: m.lead_id || null,
          is_read: true,
          is_replied: false,
          is_archived: false,
        }])
        .select()
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
