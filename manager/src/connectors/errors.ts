import type { ConnectorId, OperationType } from './types'

// ── Base ──────────────────────────────────────────────────────────────────────

export class ConnectorBaseError extends Error {
  readonly code:      string
  readonly retryable: boolean
  readonly connectorId: ConnectorId

  constructor(connectorId: ConnectorId, code: string, message: string, retryable = false) {
    super(message)
    this.name       = 'ConnectorError'
    this.code       = code
    this.retryable  = retryable
    this.connectorId = connectorId
  }
}

// ── Specific errors ───────────────────────────────────────────────────────────

export class ConnectorNotConfiguredError extends ConnectorBaseError {
  constructor(connectorId: ConnectorId) {
    super(connectorId, 'NOT_CONFIGURED',
      `Le connecteur "${connectorId}" n'est pas encore configuré. Renseignez les champs requis.`,
      false)
    this.name = 'ConnectorNotConfiguredError'
  }
}

export class ConnectorNotImplementedError extends ConnectorBaseError {
  constructor(connectorId: ConnectorId, operation: OperationType) {
    super(connectorId, 'NOT_IMPLEMENTED',
      `L'opération "${operation}" n'est pas prise en charge par le connecteur "${connectorId}".`,
      false)
    this.name = 'ConnectorNotImplementedError'
  }
}

export class ConnectorAuthError extends ConnectorBaseError {
  constructor(connectorId: ConnectorId, message = 'Clé API invalide ou expirée.') {
    super(connectorId, 'AUTH_ERROR', message, false)
    this.name = 'ConnectorAuthError'
  }
}

export class ConnectorRateLimitError extends ConnectorBaseError {
  readonly retryAfter?: number  // seconds

  constructor(connectorId: ConnectorId, retryAfter?: number) {
    super(connectorId, 'RATE_LIMIT',
      `Limite de requêtes atteinte${retryAfter ? ` — réessayez dans ${retryAfter}s` : ''}.`,
      true)
    this.name       = 'ConnectorRateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ConnectorNetworkError extends ConnectorBaseError {
  constructor(connectorId: ConnectorId, cause?: string) {
    super(connectorId, 'NETWORK_ERROR',
      `Impossible de joindre le service${cause ? ` : ${cause}` : ''}. Vérifiez votre connexion.`,
      true)
    this.name = 'ConnectorNetworkError'
  }
}

export class ConnectorMappingError extends ConnectorBaseError {
  readonly field: string

  constructor(connectorId: ConnectorId, field: string, reason: string) {
    super(connectorId, 'MAPPING_ERROR',
      `Erreur de mapping sur le champ "${field}" : ${reason}.`,
      false)
    this.name  = 'ConnectorMappingError'
    this.field = field
  }
}

export class ConnectorParseError extends ConnectorBaseError {
  readonly row?: number

  constructor(connectorId: ConnectorId, row?: number, details?: string) {
    super(connectorId, 'PARSE_ERROR',
      `Impossible de lire les données${row !== undefined ? ` à la ligne ${row}` : ''}${details ? ` : ${details}` : ''}.`,
      false)
    this.name = 'ConnectorParseError'
    this.row  = row
  }
}

// ── Guard ─────────────────────────────────────────────────────────────────────

export function toConnectorError(
  connectorId: ConnectorId,
  err: unknown,
): ConnectorBaseError {
  if (err instanceof ConnectorBaseError) return err
  const msg = err instanceof Error ? err.message : String(err)
  return new ConnectorBaseError(connectorId, 'UNKNOWN', msg, false)
}
