import { useState, useEffect, useCallback } from 'react'
import '../connectors/index'  // bootstrap — registers all connectors
import {
  connectorRegistry,
  connectorManager,
  connectorLogger,
} from '../connectors/index'
import type {
  ConnectorId, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
  ConnectorLogEntry,
} from '../connectors/types'

// ── useConnectors — list all registered connectors ───────────────────────────

export function useConnectors(): ConnectorMeta[] {
  return connectorRegistry.listMeta()
}

// ── useConnectorRunning — reactive running state for one connector ────────────

export function useConnectorRunning(id: ConnectorId) {
  const [, tick] = useState(0)

  useEffect(() => {
    return connectorManager.subscribe(() => tick(n => n + 1))
  }, [])

  return {
    isImporting: connectorManager.isRunning(id, 'import'),
    isSyncing:   connectorManager.isRunning(id, 'sync'),
    isUpdating:  connectorManager.isRunning(id, 'update'),
    isTesting:   connectorManager.isRunning(id, 'test'),
    isAnyRunning:
      connectorManager.isRunning(id, 'import') ||
      connectorManager.isRunning(id, 'sync')   ||
      connectorManager.isRunning(id, 'update') ||
      connectorManager.isRunning(id, 'test'),
  }
}

// ── useConnectorLogs — live log entries for one connector (or all) ────────────

export function useConnectorLogs(id?: ConnectorId): ConnectorLogEntry[] {
  const [logs, setLogs] = useState<ConnectorLogEntry[]>(() =>
    id ? connectorLogger.getByConnector(id) : connectorLogger.getAll()
  )

  useEffect(() => {
    const unsub = connectorLogger.subscribe(() => {
      setLogs(id ? connectorLogger.getByConnector(id) : connectorLogger.getAll())
    })
    return unsub
  }, [id])

  return logs
}

// ── useTestConnector ─────────────────────────────────────────────────────────

export function useTestConnector(id: ConnectorId) {
  const [result, setResult] = useState<TestResult | null>(null)

  const test = useCallback(async () => {
    setResult(null)
    try {
      const r = await connectorManager.test(id)
      setResult(r)
      return r
    } catch {
      const r: TestResult = { ok: false, message: 'Erreur inattendue lors du test.' }
      setResult(r)
      return r
    }
  }, [id])

  return { result, test }
}

// ── useRunImport ──────────────────────────────────────────────────────────────

export function useRunImport(id: ConnectorId) {
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError]   = useState<string | null>(null)

  const run = useCallback(async (opts?: ImportOptions) => {
    setResult(null)
    setError(null)
    try {
      const r = await connectorManager.import(id, opts) as ImportResult
      setResult(r)
      return r
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      throw err
    }
  }, [id])

  return { result, error, run }
}

// ── useRunSync ────────────────────────────────────────────────────────────────

export function useRunSync(id: ConnectorId) {
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError]   = useState<string | null>(null)

  const run = useCallback(async (opts?: SyncOptions) => {
    setResult(null)
    setError(null)
    try {
      const r = await connectorManager.sync(id, opts) as SyncResult
      setResult(r)
      return r
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      throw err
    }
  }, [id])

  return { result, error, run }
}

// ── useRunUpdate ──────────────────────────────────────────────────────────────

export function useRunUpdate(id: ConnectorId) {
  const [result, setResult] = useState<UpdateResult | null>(null)
  const [error, setError]   = useState<string | null>(null)

  const run = useCallback(async (opts: UpdateOptions) => {
    setResult(null)
    setError(null)
    try {
      const r = await connectorManager.update(id, opts) as UpdateResult
      setResult(r)
      return r
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      throw err
    }
  }, [id])

  return { result, error, run }
}

// ── useConfigureConnector ─────────────────────────────────────────────────────

export function useConfigureConnector(id: ConnectorId) {
  const [, tick] = useState(0)

  // Subscribe to manager changes so isConfigured re-evaluates after any configure() call
  useEffect(() => {
    return connectorManager.subscribe(() => tick(n => n + 1))
  }, [])

  const configure = useCallback((config: ConnectorConfig) => {
    connectorManager.configure(id, config)
  }, [id])

  const isConfigured = connectorManager.isConfigured(id)

  return { configure, isConfigured }
}
