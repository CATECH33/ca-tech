import type { ConnectorId, IConnector, ConnectorMeta } from './types'

// ── ConnectorRegistry ─────────────────────────────────────────────────────────
// Central map of connectorId → IConnector instance.
// Register once at app startup (see src/connectors/index.ts).

class ConnectorRegistry {
  private map = new Map<ConnectorId, IConnector>()

  /**
   * Register a connector. Call this at app startup for each connector.
   * Registering the same id twice replaces the previous instance.
   */
  register(connector: IConnector): void {
    this.map.set(connector.meta.id, connector)
  }

  /** Retrieve a connector by id, or undefined if not registered. */
  get(id: ConnectorId): IConnector | undefined {
    return this.map.get(id)
  }

  /** All registered connector instances. */
  getAll(): IConnector[] {
    return Array.from(this.map.values())
  }

  /** Meta-only list — safe to pass to the UI layer. */
  listMeta(): ConnectorMeta[] {
    return this.getAll().map(c => c.meta)
  }

  has(id: ConnectorId): boolean {
    return this.map.has(id)
  }

  get size(): number {
    return this.map.size
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const connectorRegistry = new ConnectorRegistry()
