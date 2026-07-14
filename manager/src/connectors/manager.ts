import type {
  ConnectorId, OperationType, ImportOptions, SyncOptions, UpdateOptions,
  OperationResult, TestResult, ConnectorConfig,
} from './types'
import { connectorRegistry } from './registry'
import { connectorLogger } from './logger'
import { ConnectorNotConfiguredError, ConnectorNotImplementedError, toConnectorError } from './errors'

// ── ConnectorManager ──────────────────────────────────────────────────────────
// Orchestrates all connector operations:
//  1. Validates the connector is registered + configured
//  2. Opens a log entry
//  3. Dispatches to the connector's method
//  4. Closes the log entry (success or error)
//  5. Notifies React subscribers (for spinner/button states)

class ConnectorManager {
  // Track which connector:operation pairs are currently running
  private running = new Set<string>()
  private listeners = new Set<() => void>()

  // ── Pub-sub (for React) ──────────────────────────────────────────────────

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify() {
    this.listeners.forEach(fn => fn())
  }

  private key(connectorId: ConnectorId, op: OperationType | 'test'): string {
    return `${connectorId}:${op}`
  }

  isRunning(connectorId: ConnectorId, op: OperationType | 'test'): boolean {
    return this.running.has(this.key(connectorId, op))
  }

  // ── Configure ────────────────────────────────────────────────────────────

  configure(connectorId: ConnectorId, config: ConnectorConfig): void {
    const connector = connectorRegistry.get(connectorId)
    if (!connector) throw new Error(`Connecteur "${connectorId}" introuvable`)
    connector.configure(config)
    this.notify()
  }

  isConfigured(connectorId: ConnectorId): boolean {
    return connectorRegistry.get(connectorId)?.isConfigured() ?? false
  }

  // ── Test ─────────────────────────────────────────────────────────────────

  async test(connectorId: ConnectorId): Promise<TestResult> {
    const connector = connectorRegistry.get(connectorId)
    if (!connector) throw new Error(`Connecteur "${connectorId}" introuvable`)

    const k     = this.key(connectorId, 'test')
    const logId = connectorLogger.begin(connectorId, 'test')
    this.running.add(k)
    this.notify()

    try {
      const result = await connector.test()
      connectorLogger.complete(logId, result.ok ? 'success' : 'error', undefined,
        result.ok ? undefined : [{
          code: 'TEST_FAILED', message: result.message,
          at: new Date().toISOString(), retryable: false,
        }])
      return result
    } catch (err) {
      const e = toConnectorError(connectorId, err)
      connectorLogger.fail(logId, [{ code: e.code, message: e.message, at: new Date().toISOString(), retryable: e.retryable }])
      return { ok: false, message: e.message }
    } finally {
      this.running.delete(k)
      this.notify()
    }
  }

  // ── Import ────────────────────────────────────────────────────────────────

  async import(connectorId: ConnectorId, opts?: ImportOptions): Promise<OperationResult> {
    return this._run(connectorId, 'import', async (connector) => {
      if (!connector.meta.capabilities.includes('import')) {
        throw new ConnectorNotImplementedError(connectorId, 'import')
      }
      if (!connector.isConfigured()) throw new ConnectorNotConfiguredError(connectorId)
      return connector.import(opts)
    })
  }

  // ── Sync ──────────────────────────────────────────────────────────────────

  async sync(connectorId: ConnectorId, opts?: SyncOptions): Promise<OperationResult> {
    return this._run(connectorId, 'sync', async (connector) => {
      if (!connector.meta.capabilities.includes('sync')) {
        throw new ConnectorNotImplementedError(connectorId, 'sync')
      }
      if (!connector.isConfigured()) throw new ConnectorNotConfiguredError(connectorId)
      return connector.sync(opts)
    })
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(connectorId: ConnectorId, opts: UpdateOptions): Promise<OperationResult> {
    return this._run(connectorId, 'update', async (connector) => {
      if (!connector.meta.capabilities.includes('update')) {
        throw new ConnectorNotImplementedError(connectorId, 'update')
      }
      if (!connector.isConfigured()) throw new ConnectorNotConfiguredError(connectorId)
      return connector.update(opts)
    })
  }

  // ── Internal runner ───────────────────────────────────────────────────────

  private async _run(
    connectorId: ConnectorId,
    op: OperationType,
    fn: (c: ReturnType<typeof connectorRegistry.get> & object) => Promise<OperationResult>,
  ): Promise<OperationResult> {
    const connector = connectorRegistry.get(connectorId)
    if (!connector) throw new Error(`Connecteur "${connectorId}" introuvable`)

    const k     = this.key(connectorId, op)
    const logId = connectorLogger.begin(connectorId, op)
    this.running.add(k)
    this.notify()

    try {
      const result = await fn(connector as NonNullable<typeof connector>)

      // Extract counts from the polymorphic result
      const total  = 'total' in result  ? result.total  : 0
      const ok     = 'imported' in result ? result.imported
                   : 'updated' in result  ? result.updated
                   : 'created' in result  ? (result as { created: number }).created
                   : 0
      const failed = result.errors.length

      connectorLogger.complete(
        logId,
        failed > 0 && ok === 0 ? 'error' : failed > 0 ? 'partial' : 'success',
        { total, ok, failed },
        result.errors,
      )

      return result
    } catch (err) {
      const e = toConnectorError(connectorId, err)
      connectorLogger.fail(logId, [{
        code:      e.code,
        message:   e.message,
        at:        new Date().toISOString(),
        retryable: e.retryable,
      }])
      throw e
    } finally {
      this.running.delete(k)
      this.notify()
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const connectorManager = new ConnectorManager()
