import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Ticket, TicketStatus, TicketPriority, Client } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: 'agent' | 'client' | 'system'
  sender_id?: string
  content: string
  created_at: string
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

const STATUS_FROM_DB: Record<string, TicketStatus> = {
  open: 'ouvert', in_progress: 'en_cours', waiting: 'en_cours',
  resolved: 'resolu', closed: 'ferme',
}
const STATUS_TO_DB: Record<TicketStatus, string> = {
  ouvert: 'open', en_cours: 'in_progress', resolu: 'resolved', ferme: 'closed',
}
const PRIORITY_FROM_DB: Record<string, TicketPriority> = {
  low: 'basse', medium: 'normale', high: 'haute', urgent: 'critique',
}
const PRIORITY_TO_DB: Record<TicketPriority, string> = {
  basse: 'low', normale: 'medium', haute: 'high', critique: 'urgent',
}

function mapClient(c: Record<string, any>): Client {
  return {
    id: c.id, created_at: c.created_at, updated_at: c.updated_at,
    nom: c.last_name, prenom: c.first_name, email: c.email,
    telephone: c.phone ?? undefined, entreprise: c.company ?? undefined,
    pays: c.country ?? 'France',
    status: c.status === 'active' ? 'actif' : c.status === 'inactive' ? 'inactif' : 'archive',
    total_ca: 0,
  }
}

function mapRow(r: Record<string, any>): Ticket {
  return {
    id: r.id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    ticket_number: r.ticket_number ?? undefined,
    sujet: r.subject,
    description: r.description ?? '',
    client_id: r.client_id ?? undefined,
    client: r.clients ? mapClient(r.clients) : undefined,
    status: STATUS_FROM_DB[r.status] ?? 'ouvert',
    priority: PRIORITY_FROM_DB[r.priority] ?? 'normale',
    assigned_to: r.assigned_to ?? undefined,
    resolved_at: r.closed_at ?? undefined,
    tags: r.tags ?? [],
  }
}

const Q = ['tickets'] as const

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTickets() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, clients(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as TicketMessage[]
    },
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (t: {
      sujet: string; description: string; priority: TicketPriority; client_id?: string; tags?: string[]
    }) => {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
      const ticket_number = `TKT-${String((count ?? 0) + 1).padStart(4, '0')}`

      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          ticket_number,
          subject: t.sujet,
          description: t.description,
          status: 'open',
          priority: PRIORITY_TO_DB[t.priority],
          client_id: t.client_id || null,
          tags: t.tags ?? [],
        }])
        .select('*, clients(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...u }: {
      id: string; status?: TicketStatus; priority?: TicketPriority
      sujet?: string; description?: string; tags?: string[]
    }) => {
      const patch: Record<string, any> = { updated_at: new Date().toISOString() }
      if (u.status !== undefined) {
        patch.status = STATUS_TO_DB[u.status]
        patch.closed_at = (u.status === 'resolu' || u.status === 'ferme')
          ? new Date().toISOString()
          : null
      }
      if (u.priority !== undefined) patch.priority = PRIORITY_TO_DB[u.priority]
      if (u.sujet !== undefined) patch.subject = u.sujet
      if (u.description !== undefined) patch.description = u.description
      if (u.tags !== undefined) patch.tags = u.tags

      const { data, error } = await supabase
        .from('tickets')
        .update(patch)
        .eq('id', id)
        .select('*, clients(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useAddTicketMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ticket_id, content, sender_type = 'agent',
    }: {
      ticket_id: string; content: string; sender_type?: 'agent' | 'client' | 'system'
    }) => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{ ticket_id, sender_type, content }])
        .select()
        .single()
      if (error) throw error
      return data as TicketMessage
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ticket-messages', vars.ticket_id] })
      qc.invalidateQueries({ queryKey: Q })
    },
  })
}

export function useDeleteTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tickets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
