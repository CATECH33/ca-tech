import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const HEADERS = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`,
}

const FN_URL = `${SUPABASE_URL}/functions/v1/integration-health`

// ── Types ─────────────────────────────────────────────────────────────────────

export type ServiceId = 'gmail' | 'calendar' | 'drive' | 'sheets'

export interface ServiceResult {
  ok: boolean
  latency_ms?: number
  error?: string
  needs_reconnect?: boolean
  api_disabled?: boolean
  details?: Record<string, unknown>
}

export interface IntegrationLog {
  id: string
  service: string
  action: string
  status: 'success' | 'error' | 'warning'
  operations_count: number
  error_message: string | null
  details: Record<string, unknown> | null
  duration_ms: number | null
  created_at: string
}

export interface SheetsSyncLog {
  id: string
  direction: string
  status: 'success' | 'partial' | 'error'
  rows_exported: number
  rows_imported: number
  rows_created: number
  rows_updated: number
  rows_failed: number
  duration_ms: number | null
  created_at: string
}

export interface IntegrationStatus {
  logs: IntegrationLog[]
  sheets_logs: SheetsSyncLog[]
  latest_per_service: Record<string, IntegrationLog>
}

export interface HealthResult {
  success: boolean
  email?: string
  results?: Record<ServiceId, ServiceResult>
  error?: string
  needs_reconnect?: boolean
}

export interface FixResult {
  success: boolean
  fixes: string[]
  needs_reconnect: boolean
}

// ── Keys ──────────────────────────────────────────────────────────────────────

const STATUS_KEY = ['integration-status'] as const

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useIntegrationStatus() {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: async (): Promise<IntegrationStatus> => {
      const r = await fetch(FN_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'status' }),
      })
      if (!r.ok) throw new Error('Impossible de charger le statut')
      return r.json()
    },
    staleTime: 30_000,
  })
}

export function useTestConnections() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (service?: ServiceId): Promise<HealthResult> => {
      const action = service ? `test_${service}` : 'test_all'
      const r = await fetch(FN_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action }),
      })
      const data = await r.json() as HealthResult
      if (!r.ok) throw new Error(data.error ?? 'Test échoué')
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  })
}

export function useAutoFix() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<FixResult> => {
      const r = await fetch(FN_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action: 'fix' }),
      })
      const data = await r.json() as FixResult
      if (!r.ok) throw new Error('Auto-fix échoué')
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  })
}
