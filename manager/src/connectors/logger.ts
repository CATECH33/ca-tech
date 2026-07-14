import type { ConnectorId, ConnectorLogEntry, ConnectorErrorDetail, OperationType, LogStatus } from './types'

// ── ConnectorLogger ───────────────────────────────────────────────────────────
// In-memory log with pub-sub. React components subscribe via useConnectorLogs().
// FUTURE: persist entries to Supabase table `connector_logs` for cross-session history.

class ConnectorLogger {
  private entries: ConnectorLogEntry[] = []
  private listeners = new Set<() => void>()

  // ── Pub-sub ─────────────────────────────────────────────────────────────────

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify() {
    this.listeners.forEach(fn => fn())
  }

  // ── Write ────────────────────────────────────────────────────────────────────

  /**
   * Start a new log entry. Returns the entry id to pass to complete() / fail().
   */
  begin(connectorId: ConnectorId, operation: OperationType | 'test'): string {
    const id = crypto.randomUUID()
    const entry: ConnectorLogEntry = {
      id,
      connector_id: connectorId,
      operation,
      status: 'running',
      started_at: new Date().toISOString(),
    }
    this.entries.unshift(entry)   // prepend — latest first
    if (this.entries.length > 200) this.entries = this.entries.slice(0, 200)
    this.notify()
    return id
  }

  complete(
    id: string,
    status: Omit<LogStatus, 'running'>,
    counts?: { total?: number; ok?: number; failed?: number },
    errors?: ConnectorErrorDetail[],
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.entries.find(e => e.id === id)
    if (!entry) return

    const now = new Date()
    entry.ended_at    = now.toISOString()
    entry.duration_ms = now.getTime() - new Date(entry.started_at).getTime()
    entry.status      = status as LogStatus
    if (counts) {
      entry.items_total  = counts.total
      entry.items_ok     = counts.ok
      entry.items_failed = counts.failed
    }
    if (errors?.length) entry.errors = errors
    if (metadata)       entry.metadata = metadata
    this.notify()
  }

  fail(id: string, errors: ConnectorErrorDetail[]): void {
    this.complete(id, 'error', undefined, errors)
  }

  // ── Read ─────────────────────────────────────────────────────────────────────

  getAll(): ConnectorLogEntry[] {
    return [...this.entries]
  }

  getByConnector(connectorId: ConnectorId): ConnectorLogEntry[] {
    return this.entries.filter(e => e.connector_id === connectorId)
  }

  getLastByConnector(connectorId: ConnectorId): ConnectorLogEntry | undefined {
    return this.entries.find(e => e.connector_id === connectorId)
  }

  clear(connectorId?: ConnectorId): void {
    this.entries = connectorId
      ? this.entries.filter(e => e.connector_id !== connectorId)
      : []
    this.notify()
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const connectorLogger = new ConnectorLogger()
