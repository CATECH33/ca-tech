import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface LoicMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  action?: { type: string; data?: any; reason?: string; items?: any[]; total_ht?: number; tva?: number; total_ttc?: number }
}

export interface AIConversation {
  id: string
  created_at: string
  updated_at: string
  type: 'qualification' | 'devis' | 'support' | 'crm' | 'agenda' | 'general'
  status: 'active' | 'completed' | 'archived'
  messages: LoicMessage[]
  metadata: {
    prenom?: string
    nom?: string
    email?: string
    telephone?: string
    entreprise?: string
    projet?: string
    budget?: number
    lead_created?: boolean
    escalated?: boolean
    source?: string
  }
  lead_id?: string
  client_id?: string
}

const Q = ['loic'] as const

export function useLoicConversations() {
  const qc = useQueryClient()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('loic-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_conversations' },
        () => { qc.invalidateQueries({ queryKey: Q }) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as AIConversation[]
    },
    refetchInterval: 30_000,
  })
}

export function useCreateLoicConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert([{
          type: 'qualification',
          status: 'active',
          messages: [],
          metadata: { source: 'manager' },
          user_id: user?.id ?? null,
        }])
        .select()
        .single()
      if (error) throw error
      return data as AIConversation
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateLoicConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, messages, metadata, status, lead_id }: {
      id: string
      messages?: LoicMessage[]
      metadata?: AIConversation['metadata']
      status?: AIConversation['status']
      lead_id?: string
    }) => {
      const patch: Record<string, any> = { updated_at: new Date().toISOString() }
      if (messages !== undefined) patch.messages = messages
      if (metadata !== undefined) patch.metadata = metadata
      if (status !== undefined) patch.status = status
      if (lead_id !== undefined) patch.lead_id = lead_id
      const { data, error } = await supabase
        .from('ai_conversations')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as AIConversation
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteLoicConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_conversations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
