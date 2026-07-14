import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ApifyClient, TERMINAL_STATUSES } from '../connectors/connectors/apify-client'
import type { ApifyUser, ApifyRun, ApifyActorMeta } from '../connectors/connectors/apify-client'
import { connectorLogger } from '../connectors/logger'
import { mapDatasetItems } from '../connectors/connectors/apify-mappers'
import { bulkImportProspects } from '../lib/prospect-importer'
import type { ImportReport } from '../lib/prospect-importer'
import { runAutoAnalyse } from '../lib/auto-analyse'

export type { ApifyUser, ApifyRun, ApifyActorMeta, ImportReport }

const POLL_INTERVAL_MS = 3000

// ── useApifyConnection ────────────────────────────────────────────────────────

export type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'error'

export function useApifyConnection() {
  const [status, setStatus]   = useState<ConnectionStatus>('idle')
  const [user, setUser]       = useState<ApifyUser | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)

  const test = useCallback(async (apiKey: string) => {
    if (!apiKey.trim()) return
    setStatus('testing')
    setError(null)
    const start = Date.now()
    try {
      const client = new ApifyClient(apiKey)
      const me     = await client.getMe()
      setUser(me)
      setLatency(Date.now() - start)
      setStatus('connected')
    } catch (e) {
      setUser(null)
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Connexion échouée')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setUser(null)
    setError(null)
    setLatency(null)
  }, [])

  return { status, user, error, latency, test, reset }
}

// ── useApifyUserActors ────────────────────────────────────────────────────────

export function useApifyUserActors(apiKey: string) {
  const [actors, setActors]   = useState<ApifyActorMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiKey.trim()) return
    setLoading(true)
    setError(null)
    try {
      const client = new ApifyClient(apiKey)
      setActors(await client.listUserActors())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les actors')
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  return { actors, loading, error, load }
}

// ── useApifyRun ───────────────────────────────────────────────────────────────

export function useApifyRun(apiKey: string) {
  const [run, setRun]           = useState<ApifyRun | null>(null)
  const [isLaunching, setLaunch] = useState(false)
  const [isAborting, setAbort]  = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const logIdRef                = useRef<string | null>(null)

  // Poll while run is in a non-terminal state
  useEffect(() => {
    if (!run || !apiKey) return
    if (TERMINAL_STATUSES.includes(run.status)) {
      // Finalize the log entry when terminal status is reached via polling
      if (logIdRef.current) {
        connectorLogger.complete(
          logIdRef.current,
          run.status === 'SUCCEEDED' ? 'success' : 'error',
          undefined,
          run.status !== 'SUCCEEDED' ? [{
            code:      run.status,
            message:   `L'actor s'est terminé avec le statut ${run.status}`,
            at:        run.finishedAt ?? new Date().toISOString(),
            retryable: run.status === 'TIMED-OUT',
          }] : undefined,
        )
        logIdRef.current = null
      }
      return
    }

    const interval = setInterval(async () => {
      try {
        const client  = new ApifyClient(apiKey)
        const updated = await client.getRun(run.id)
        setRun(updated)
      } catch { /* ignore transient poll errors */ }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [run?.id, run?.status, apiKey])

  const launch = useCallback(async (actorId: string, input?: Record<string, unknown>) => {
    if (!apiKey.trim() || !actorId.trim()) return
    setLaunch(true)
    setError(null)
    setRun(null)

    const logId = connectorLogger.begin('apify', 'import')
    logIdRef.current = logId

    try {
      const client = new ApifyClient(apiKey)
      const r      = await client.startRun(actorId, input)
      setRun(r)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors du lancement'
      setError(msg)
      connectorLogger.fail(logId, [{
        code:      'START_FAILED',
        message:   msg,
        at:        new Date().toISOString(),
        retryable: true,
      }])
      logIdRef.current = null
    } finally {
      setLaunch(false)
    }
  }, [apiKey])

  const abort = useCallback(async () => {
    if (!run || !apiKey) return
    setAbort(true)
    try {
      const client = new ApifyClient(apiKey)
      const updated = await client.abortRun(run.id)
      setRun(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'abandon')
    } finally {
      setAbort(false)
    }
  }, [run, apiKey])

  const reset = useCallback(() => {
    setRun(null)
    setError(null)
    logIdRef.current = null
  }, [])

  const isRunning = run !== null && !TERMINAL_STATUSES.includes(run.status)

  return { run, isLaunching, isAborting, isRunning, error, launch, abort, reset }
}

// ── useApifyImport ────────────────────────────────────────────────────────────
// Fetches dataset items from a completed run and imports them to Supabase.

export type ImportStatus = 'idle' | 'fetching' | 'mapping' | 'writing' | 'done' | 'error'

export function useApifyImport(apiKey: string) {
  const qc                            = useQueryClient()
  const [status, setStatus]           = useState<ImportStatus>('idle')
  const [report, setReport]           = useState<ImportReport | null>(null)
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [error, setError]             = useState<string | null>(null)

  const fetchPreview = useCallback(async (datasetId: string) => {
    if (!apiKey || !datasetId) return
    try {
      const client = new ApifyClient(apiKey)
      // Fetch first item only to get count proxy — Apify returns count in the list
      const items = await client.getDatasetItems(datasetId, 1)
      // items length is just 1; the actual count comes from a separate endpoint
      // We'll show exact count after full fetch
      setPreviewCount(items.length > 0 ? -1 : 0) // -1 = "at least 1"
    } catch { /* ignore */ }
  }, [apiKey])

  const runImport = useCallback(async (datasetId: string, actorId: string) => {
    if (!apiKey || !datasetId) return
    setStatus('fetching')
    setError(null)
    setReport(null)

    try {
      // 1. Fetch items from dataset
      const client = new ApifyClient(apiKey)
      const items  = await client.getDatasetItems(datasetId, 500)
      setPreviewCount(items.length)

      // 2. Map to ProspectImport[]
      setStatus('mapping')
      const prospects = mapDatasetItems(actorId, items)

      // 3. Write to Supabase
      setStatus('writing')
      const result = await bulkImportProspects(prospects)
      setReport(result)
      setStatus('done')

      // 4. Invalidate React Query cache so ProspectionProspects reflects new data
      qc.invalidateQueries({ queryKey: ['prospects'] })

      // 5. Lancer l'analyse IA en arrière-plan pour chaque nouveau prospect
      runAutoAnalyse(result.importedIds)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'import')
      setStatus('error')
    }
  }, [apiKey, qc])

  const reset = useCallback(() => {
    setStatus('idle')
    setReport(null)
    setPreviewCount(null)
    setError(null)
  }, [])

  return { status, report, previewCount, error, fetchPreview, runImport, reset }
}
