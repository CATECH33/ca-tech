import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProspectRow } from '@/hooks/useProspects'
import { getAudit } from '@/hooks/useAudit'

export type RecommendPriority = 'A' | 'B' | 'C'

export interface Recommendations {
  version: 1
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  recommendation: string
  priority: RecommendPriority
  generated_at: string
}

export function getRecommendations(prospect: ProspectRow): Recommendations | null {
  return (prospect.metadata as Record<string, unknown> | null)?.recommendations as Recommendations ?? null
}

// ── Generate ──────────────────────────────────────────────────────────────────

export function useGenerateRecommendations() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  return useMutation({
    mutationFn: async (prospect: ProspectRow): Promise<Recommendations> => {
      const audit = getAudit(prospect)
      const analyse = (prospect.metadata as Record<string, unknown> | null)?.analyse ?? null

      const res = await fetch(`${SUPABASE_URL}/functions/v1/recommend-prospect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prospect, audit, analyse }),
      })

      const data = await res.json() as Recommendations & { error?: string }
      if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      return data
    },
  })
}

// ── Save ──────────────────────────────────────────────────────────────────────

export function useSaveRecommendations() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ prospectId, reco }: { prospectId: string; reco: Recommendations }) => {
      const { data: current } = await supabase
        .from('prospects')
        .select('metadata')
        .eq('id', prospectId)
        .single()

      const metadata = { ...((current?.metadata as Record<string, unknown>) ?? {}), recommendations: reco }

      const { error } = await supabase
        .from('prospects')
        .update({ metadata })
        .eq('id', prospectId)

      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  })
}
