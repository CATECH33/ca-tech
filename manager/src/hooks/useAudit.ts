import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProspectRow } from './useProspects'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export type AuditCategory = 'technique' | 'seo' | 'contact' | 'marketing'

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  technique: 'Technique',
  seo:       'SEO',
  contact:   'Contact',
  marketing: 'Marketing',
}

export const AUDIT_CATEGORY_ORDER: AuditCategory[] = ['technique', 'seo', 'contact', 'marketing']

export interface AuditCheckResult {
  id: string
  label: string
  category: AuditCategory
  weight: number
  value: boolean | null
  detail?: string
}

export interface AuditResult {
  version: 1
  url: string
  final_url?: string
  http_status: number | null
  load_time_ms: number | null
  cms: string | null
  checks: AuditCheckResult[]
  score: number
  audited_at: string
}

export function getAudit(prospect: ProspectRow): AuditResult | null {
  const meta = prospect.metadata as Record<string, unknown> | null
  return (meta?.audit as AuditResult) ?? null
}

export function useRunAudit() {
  return useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/audit-site`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({ url }),
      })
      const data = await res.json() as AuditResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      return data
    },
  })
}

export function useSaveAudit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ prospect, audit }: { prospect: ProspectRow; audit: AuditResult }) => {
      const existingMeta = (prospect.metadata ?? {}) as Record<string, unknown>
      const { error } = await supabase
        .from('prospects')
        .update({ metadata: { ...existingMeta, audit } })
        .eq('id', prospect.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  })
}
