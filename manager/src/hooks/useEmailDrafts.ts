import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { EmailDraftStatus, EmailDraftTone } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/* ─── Types ───────────────────────────────────────────────────────────────── */

export interface DraftProspect {
  id: string
  company_name: string
  industry?: string
}

export interface DraftContact {
  id: string
  first_name: string
  last_name: string
  email?: string
  job_title?: string
}

export interface DraftRow {
  id: string
  created_at: string
  updated_at: string
  prospect_id: string
  prospect_contact_id: string | null
  subject: string
  body: string
  status: EmailDraftStatus
  tone: EmailDraftTone
  sequence_step: number
  sent_at: string | null
  ai_model: string | null
  metadata: Record<string, unknown>
  created_by: string | null
  prospect: DraftProspect | null
  contact: DraftContact | null
}

export interface CreateDraftInput {
  prospect_id: string
  prospect_contact_id?: string
  subject: string
  body: string
  tone?: EmailDraftTone
  sequence_step?: number
  metadata?: Record<string, unknown>
}

export interface UpdateDraftInput {
  id: string
  subject?: string
  body?: string
  tone?: EmailDraftTone
  sequence_step?: number
}

/* ─── Query key ───────────────────────────────────────────────────────────── */

const Q = ['email-drafts'] as const

/* ─── Fetch ───────────────────────────────────────────────────────────────── */

async function fetchDrafts(): Promise<DraftRow[]> {
  const { data, error } = await supabase
    .from('email_drafts')
    .select(`
      *,
      prospect:prospects!prospect_id(id, company_name, industry),
      contact:prospect_contacts!prospect_contact_id(id, first_name, last_name, email, job_title)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as DraftRow[]
}

/* ─── Hooks ───────────────────────────────────────────────────────────────── */

export function useEmailDrafts(opts?: { refetchInterval?: number }) {
  return useQuery({ queryKey: Q, queryFn: fetchDrafts, ...opts })
}

export function useEmailDraftsRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('email_drafts_realtime_v1')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_drafts' },
        () => qc.invalidateQueries({ queryKey: Q }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])
}

export function useCreateDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateDraftInput) => {
      const { error } = await supabase.from('email_drafts').insert({
        prospect_id: input.prospect_id,
        prospect_contact_id: input.prospect_contact_id ?? null,
        subject: input.subject,
        body: input.body,
        tone: input.tone ?? 'professional',
        sequence_step: input.sequence_step ?? 1,
        status: 'draft',
        metadata: input.metadata ?? {},
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateDraftInput) => {
      const { error } = await supabase
        .from('email_drafts')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useSetDraftStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmailDraftStatus }) => {
      const { error } = await supabase
        .from('email_drafts')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_drafts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export interface SendDraftInput {
  draftId: string
  to: string
  toName?: string
  subject: string
  body: string
}

export interface SendDraftResult {
  messageId: string
  threadId: string
  sentAt: string
  from: string
}

export function useSendDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: SendDraftInput): Promise<SendDraftResult> => {
      // Tente d'abord avec le JWT de session (auth activée), sinon utilise la anon key (mode solo)
      let authToken = SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) authToken = session.access_token

      const res = await fetch(`${SUPABASE_URL}/functions/v1/gmail-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          to: input.to,
          toName: input.toName,
          subject: input.subject,
          body: input.body,
          draftId: input.draftId,
        }),
      })

      const result = await res.json() as SendDraftResult & { error?: string }
      if (!res.ok) throw new Error(result.error ?? 'Erreur envoi Gmail')
      return result
    },
    onSettled: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

/* ─── Générateur IA ──────────────────────────────────────────────────────── */

export type EmailTemplateType = 'vitrine' | 'ecommerce' | 'refonte' | 'seo' | 'maintenance'

export interface GenerateEmailInput {
  prospect_id:   string
  template_type: EmailTemplateType
  tone:          EmailDraftTone
}

export interface GeneratedEmail {
  subject:       string
  body:          string
  ai_model:      string
  template_type: EmailTemplateType
  generated_at:  string
}

export function useGenerateEmailDraft() {
  return useMutation({
    mutationFn: async (input: GenerateEmailInput): Promise<GeneratedEmail> => {
      let authToken = SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) authToken = session.access_token

      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${authToken}`,
          apikey:         SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(input),
      })
      const data = await res.json() as GeneratedEmail & { error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      return data
    },
  })
}

/* ─── Prospects pour le sélecteur ────────────────────────────────────────── */

export interface ProspectOption {
  id: string
  company_name: string
  contacts: Array<{ id: string; first_name: string; last_name: string; email?: string; is_primary: boolean }>
}

export function useProspectsForDraft() {
  return useQuery({
    queryKey: ['prospects-for-draft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select('id, company_name, contacts:prospect_contacts(id, first_name, last_name, email, is_primary)')
        .order('company_name')
      if (error) throw error
      return (data ?? []) as ProspectOption[]
    },
  })
}

/* ─── Relances ───────────────────────────────────────────────────────────── */

export interface RelanceMeta {
  is_relance: true
  relance_day: 3 | 7 | 15
  scheduled_for: string // YYYY-MM-DD
  base_date: string     // YYYY-MM-DD
}

export interface RelanceDraft extends Omit<DraftRow, 'metadata'> {
  metadata: RelanceMeta
}

export function computeRelanceStatus(
  draft: RelanceDraft,
): 'overdue' | 'due_today' | 'pending' | 'sent' {
  if (draft.status === 'sent') return 'sent'
  const today = new Date().toISOString().slice(0, 10)
  const sched = draft.metadata?.scheduled_for ?? ''
  if (!sched) return 'pending'
  if (sched < today) return 'overdue'
  if (sched === today) return 'due_today'
  return 'pending'
}

const QR = ['relance-drafts'] as const

export function useRelanceDrafts() {
  return useQuery({
    queryKey: QR,
    queryFn: async (): Promise<RelanceDraft[]> => {
      const { data, error } = await supabase
        .from('email_drafts')
        .select(`
          *,
          prospect:prospects!prospect_id(id, company_name, industry),
          contact:prospect_contacts!prospect_contact_id(id, first_name, last_name, email, job_title)
        `)
        .filter('metadata->>is_relance', 'eq', 'true')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as RelanceDraft[]
    },
  })
}

export interface GenerateRelancesResult {
  relances: Array<{ day: number; subject: string; body: string }>
  prospect_id: string
  company_name: string
  generated_at: string
}

export function useGenerateRelances() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (prospect_id: string): Promise<GenerateRelancesResult> => {
      let authToken = SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) authToken = session.access_token

      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-relances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${authToken}`,
          apikey:         SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ prospect_id }),
      })
      const result = await res.json() as GenerateRelancesResult & { error?: string }
      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`)

      // Delete existing relances for this prospect before inserting new ones
      await supabase
        .from('email_drafts')
        .delete()
        .eq('prospect_id', prospect_id)
        .filter('metadata->>is_relance', 'eq', 'true')

      const today = new Date().toISOString().slice(0, 10)
      const inserts = result.relances.map(r => {
        const d = new Date()
        d.setDate(d.getDate() + r.day)
        return {
          prospect_id,
          subject: r.subject,
          body: r.body,
          tone: 'professional' as EmailDraftTone,
          sequence_step: r.day,
          status: 'draft',
          ai_model: 'claude-haiku-4-5-20251001',
          metadata: {
            is_relance: true,
            relance_day: r.day,
            scheduled_for: d.toISOString().slice(0, 10),
            base_date: today,
          },
        }
      })

      const { error: insertError } = await supabase.from('email_drafts').insert(inserts)
      if (insertError) throw insertError

      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QR })
      qc.invalidateQueries({ queryKey: Q })
    },
  })
}

export interface ProspectBasic {
  id: string
  company_name: string
  industry?: string | null
}

export function useAllProspects() {
  return useQuery({
    queryKey: ['prospects-basic'],
    queryFn: async (): Promise<ProspectBasic[]> => {
      const { data, error } = await supabase
        .from('prospects')
        .select('id, company_name, industry')
        .order('company_name')
      if (error) throw error
      return (data ?? []) as ProspectBasic[]
    },
  })
}
