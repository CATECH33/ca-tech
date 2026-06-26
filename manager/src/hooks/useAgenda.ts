import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Appointment, AppointmentType, AppointmentStatus } from '@/types'

const TYPE_FROM_DB: Record<string, AppointmentType> = {
  meeting: 'meeting', call: 'call', demo: 'demo',
  deadline: 'deadline', reminder: 'reminder', other: 'other',
}
const STATUS_FROM_DB: Record<string, AppointmentStatus> = {
  scheduled: 'scheduled', confirmed: 'confirmed', completed: 'completed',
  cancelled: 'cancelled', no_show: 'no_show',
}

function mapClient(c: Record<string, any>) {
  return {
    id: c.id, created_at: c.created_at, updated_at: c.updated_at,
    nom: c.last_name, prenom: c.first_name, email: c.email,
    telephone: c.phone ?? undefined, entreprise: c.company ?? undefined,
    pays: c.country ?? 'France',
    status: c.status === 'active' ? 'actif' as const
      : c.status === 'inactive' ? 'inactif' as const : 'archive' as const,
    total_ca: 0,
  }
}

function mapRow(r: Record<string, any>): Appointment {
  return {
    id: r.id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    titre: r.title,
    description: r.description ?? undefined,
    type: TYPE_FROM_DB[r.type] ?? 'other',
    start_at: r.start_at,
    end_at: r.end_at ?? undefined,
    lieu: r.location ?? undefined,
    en_ligne: Boolean(r.is_online),
    url_reunion: r.meeting_url ?? undefined,
    client_id: r.client_id ?? undefined,
    client: r.clients ? mapClient(r.clients) : undefined,
    lead_id: r.lead_id ?? undefined,
    project_id: r.project_id ?? undefined,
    assigned_to: r.assigned_to ?? undefined,
    status: STATUS_FROM_DB[r.status] ?? 'scheduled',
  }
}

const Q = ['appointments'] as const

export function useAppointments() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(*)')
        .order('start_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export interface ApptPayload {
  titre: string
  type: AppointmentType
  status: AppointmentStatus
  start_at: string
  end_at?: string | null
  lieu?: string
  en_ligne: boolean
  url_reunion?: string
  client_id?: string | null
  description?: string
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (a: ApptPayload) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          title: a.titre,
          type: a.type,
          status: a.status,
          start_at: a.start_at,
          end_at: a.end_at ?? null,
          location: a.lieu || null,
          is_online: a.en_ligne,
          meeting_url: a.url_reunion || null,
          client_id: a.client_id || null,
          description: a.description || null,
        }])
        .select('*, clients(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...a }: ApptPayload & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          title: a.titre,
          type: a.type,
          status: a.status,
          start_at: a.start_at,
          end_at: a.end_at ?? null,
          location: a.lieu || null,
          is_online: a.en_ligne,
          meeting_url: a.url_reunion || null,
          client_id: a.client_id || null,
          description: a.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, clients(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
