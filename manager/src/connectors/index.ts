// Public API — import everything from here, not from sub-modules directly
export type { ConnectorId, ConnectorMeta, ConnectorConfig, ConfigField, ConnectorCategory, OperationType, ConnectorStatus } from './types'
export type { IConnector, ImportOptions, SyncOptions, UpdateOptions, ImportResult, SyncResult, UpdateResult, TestResult, ProspectImport } from './types'
export { ConnectorBaseError, ConnectorNotConfiguredError, ConnectorNotImplementedError, ConnectorAuthError, ConnectorRateLimitError, ConnectorNetworkError, ConnectorMappingError, ConnectorParseError, toConnectorError } from './errors'
export { connectorLogger } from './logger'
export { connectorRegistry } from './registry'
export { connectorManager } from './manager'

// Individual connector classes & configs (for custom instantiation)
export { ApifyConnector }       from './connectors/apify'
export { GoogleMapsConnector }  from './connectors/google-maps'
export { GoogleSheetsConnector } from './connectors/google-sheets'
export { LinkedInConnector }    from './connectors/linkedin'
export { XConnector }           from './connectors/x'
export { CsvConnector }         from './connectors/csv'
export { ExcelConnector }       from './connectors/excel'
export type { ApifyConfig }         from './connectors/apify'
export type { GoogleMapsConfig }    from './connectors/google-maps'
export type { GoogleSheetsConfig }  from './connectors/google-sheets'
export type { LinkedInConfig }      from './connectors/linkedin'
export type { XConfig }             from './connectors/x'
export type { CsvConfig }           from './connectors/csv'
export type { ExcelConfig }         from './connectors/excel'

// ── Bootstrap — register all connectors ──────────────────────────────────────
import { connectorRegistry } from './registry'
import { ApifyConnector }        from './connectors/apify'
import { GoogleMapsConnector }   from './connectors/google-maps'
import { GoogleSheetsConnector } from './connectors/google-sheets'
import { LinkedInConnector }     from './connectors/linkedin'
import { XConnector }            from './connectors/x'
import { CsvConnector }          from './connectors/csv'
import { ExcelConnector }        from './connectors/excel'

connectorRegistry.register(new ApifyConnector())
connectorRegistry.register(new GoogleMapsConnector())
connectorRegistry.register(new GoogleSheetsConnector())
connectorRegistry.register(new LinkedInConnector())
connectorRegistry.register(new XConnector())
connectorRegistry.register(new CsvConnector())
connectorRegistry.register(new ExcelConnector())
