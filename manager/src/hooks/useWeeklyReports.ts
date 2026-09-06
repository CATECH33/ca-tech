import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface WeeklySummary {
  ca_total:        number
  payments_count:  number
  devis: {
    envoye:       number
    accepte:      number
    refuse:       number
    totalEnvoye:  number
    totalAccepte: number
  }
  leads: {
    total:    number
    bySource: Record<string, number>
  }
  overdue_count:   number
  overdue_total:   number
  pending_actions: number
  ai_comment:      string
}

export interface WeeklyReport {
  id:                 string
  week_start:         string
  week_end:           string
  generated_at:       string
  pdf_drive_url:      string | null
  pdf_drive_file_id:  string | null
  email_sent_at:      string | null
  summary_json:       WeeklySummary | null
  created_at:         string
}

const QK = 'weekly-reports'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export function useWeeklyReports() {
  return useQuery({
    queryKey: [QK],
    queryFn: async (): Promise<WeeklyReport[]> => {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(20)
      if (error) throw error
      return (data ?? []) as WeeklyReport[]
    },
    staleTime: 5 * 60_000,
  })
}

export function useTriggerWeeklyReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Non authentifié')
      const res = await fetch(`${SUPABASE_URL}/functions/v1/weekly-report-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ manual: true }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Erreur ${res.status}: ${text}`)
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  })
}
