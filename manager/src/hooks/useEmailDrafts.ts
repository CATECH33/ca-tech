import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { EmailDraftStatus, EmailDraftTone } from '@/types'
import { MAIL_STATUS } from '@/services/mailProvider'

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

export function useEmailDrafts() {
  return useQuery({ queryKey: Q, queryFn: fetchDrafts })
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

/**
 * FUTURE: connecter un MailProvider ici
 * Étapes :
 *   1. Implémenter mailProvider dans src/services/mailProvider.ts
 *   2. Appeler mailProvider.send({ to, subject, body, draftId })
 *   3. Mettre à jour status → 'sent' + sent_at dans Supabase
 *   4. Enregistrer une ProspectActivity 'email_sent'
 */
export function useSendDraft() {
  return useMutation({
    mutationFn: async (_id: string): Promise<never> => {
      if (!MAIL_STATUS.isConnected) {
        throw new Error(MAIL_STATUS.disabledReason)
      }
      throw new Error('Provider non implémenté')
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
