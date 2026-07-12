import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const HEADERS = { 'Content-Type': 'application/json', apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
const FN_URL  = `${SUPABASE_URL}/functions/v1/google-sheets-sync`

export interface SyncConfig {
  id: string
  spreadsheet_id: string | null
  spreadsheet_url: string | null
  spreadsheet_name: string | null
  last_sync_at: string | null
  last_sync_direction: string | null
  last_sync_rows: number | null
  last_sync_errors: number | null
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  direction: string
  status: 'success' | 'partial' | 'error'
  rows_exported: number
  rows_imported: number
  rows_created: number
  rows_updated: number
  rows_failed: number
  error_details: { errors: Array<{ row?: number; error: string }> } | null
  spreadsheet_url: string | null
  duration_ms: number | null
  created_at: string
}

export interface SyncResult {
  success: boolean
  status: 'success' | 'partial' | 'error'
  rows_exported: number
  rows_imported: number
  rows_created: number
  rows_updated: number
  rows_failed: number
  spreadsheet_id: string
  spreadsheet_url: string
  duration_ms: number
  errors?: Array<{ row?: number; error: string }>
  error?: string
  scope_missing?: boolean
}

const STATUS_KEY = ['sheets-sync-status'] as const

async function fetchStatus(): Promise<{ config: SyncConfig | null; logs: SyncLog[] }> {
  const r = await fetch(FN_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ action: 'status' }),
  })
  if (!r.ok) throw new Error('Impossible de charger le statut de synchronisation')
  return r.json()
}

export function useSyncStatus() {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: fetchStatus,
    staleTime: 30_000,
  })
}

export type SyncAction = 'sync' | 'export' | 'import'

export function useSyncNow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (action: SyncAction = 'sync'): Promise<SyncResult> => {
      const r = await fetch(FN_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ action }),
      })
      const data = await r.json() as SyncResult & { error?: string }
      if (!r.ok || data.error) throw new Error(data.error ?? 'Synchronisation échouée')
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  })
}
