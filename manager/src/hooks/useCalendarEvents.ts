import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/* ─── Types ───────────────────────────────────────────────────────────────── */

export type CalendarEventType   = 'rdv' | 'relance' | 'demo'
export type CalendarEventStatus = 'confirmed' | 'pending' | 'cancelled'

export interface CalendarEvent {
  id: string
  prospect_id: string
  event_type: CalendarEventType
  title: string
  description: string | null
  start_at: string
  end_at: string
  location: string | null
  google_event_id: string | null
  google_calendar_id: string
  status: CalendarEventStatus
  created_at: string
}

export interface CreateCalendarEventInput {
  prospect_id: string
  event_type: CalendarEventType
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
}

/* ─── Auth helper ─────────────────────────────────────────────────────────── */

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? SUPABASE_ANON
  return { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON }
}

/* ─── Hooks ───────────────────────────────────────────────────────────────── */

export function useCalendarEvents(prospectId: string) {
  return useQuery({
    queryKey: ['calendar-events', prospectId],
    queryFn: async () => {
      const headers = await authHeader()
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/google-calendar?prospect_id=${prospectId}`,
        { headers },
      )
      const data = await res.json() as { events?: CalendarEvent[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur chargement événements')
      return data.events ?? []
    },
    enabled: !!prospectId,
    staleTime: 30_000,
  })
}

export function useCreateCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCalendarEventInput) => {
      const headers = await authHeader()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/google-calendar`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json() as { event?: CalendarEvent; google_link?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur création événement')
      return data
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['calendar-events', input.prospect_id] })
    },
  })
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { id: string; googleEventId: string | null; prospectId: string }) => {
      const headers = await authHeader()
      const qs = new URLSearchParams({ event_id: params.id })
      if (params.googleEventId) qs.set('google_event_id', params.googleEventId)
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/google-calendar?${qs}`,
        { method: 'DELETE', headers },
      )
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur suppression')
      return params
    },
    onSuccess: ({ prospectId }) => {
      qc.invalidateQueries({ queryKey: ['calendar-events', prospectId] })
    },
  })
}

export function useSyncCalendarEvents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (prospectId: string) => {
      const headers = await authHeader()
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/google-calendar?action=sync`,
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prospect_id: prospectId }),
        },
      )
      const data = await res.json() as { synced?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur sync')
      return data
    },
    onSuccess: (_, prospectId) => {
      qc.invalidateQueries({ queryKey: ['calendar-events', prospectId] })
    },
  })
}
