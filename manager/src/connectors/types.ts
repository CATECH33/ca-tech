// ── Connector system — core types ─────────────────────────────────────────────
// Add a new connector: create src/connectors/connectors/<name>.ts
// implementing IConnector, then register it in src/connectors/index.ts.
// The UI page discovers connectors automatically from the registry.

import type { ProspectSource } from '@/types'

// ── Identity ──────────────────────────────────────────────────────────────────

export type ConnectorId =
  | 'apify'
  | 'google-maps'
  | 'google-sheets'
  | 'linkedin'
  | 'x'
  | 'csv'
  | 'excel'
// ↑ To add a connector, append its id here and create the implementation file.

export type ConnectorCategory =
  | 'scraping'  // Apify, LinkedIn, X
  | 'maps'      // Google Maps
  | 'sheets'    // Google Sheets
  | 'files'     // CSV, Excel

export type OperationType = 'import' | 'sync' | 'update'

export type ConnectorStatus =
  | 'idle'          // Ready, not running
  | 'running'       // Operation in progress
  | 'success'       // Last operation succeeded
  | 'error'         // Last operation failed
  | 'rate_limited'  // Throttled by external API

// ── Connector descriptor ──────────────────────────────────────────────────────

export interface ConnectorMeta {
  id:           ConnectorId
  name:         string
  description:  string
  category:     ConnectorCategory
  /** Tailwind color classes for the icon badge */
  color:        string
  /** Short text used as icon (emoji or abbreviation) */
  icon:         string
  requiresAuth: boolean
  /** Which operations this connector supports */
  capabilities: OperationType[]
  docsUrl?:     string
  /** Fields the user must fill in the config form */
  configFields: ConfigField[]
}

export interface ConfigField {
  key:         string
  label:       string
  type:        'text' | 'password' | 'number' | 'select' | 'file'
  placeholder?: string
  required:    boolean
  options?:    Array<{ value: string; label: string }>
  hint?:       string
}

// ── Configuration ─────────────────────────────────────────────────────────────

export type ConnectorConfig = Record<string, unknown>

// ── Field mapping: source column → prospect field ─────────────────────────────

export type ProspectField =
  | 'company_name' | 'website' | 'industry' | 'company_size'
  | 'country' | 'city' | 'source' | 'tags' | 'linkedin_url'
  | 'contact.first_name' | 'contact.last_name' | 'contact.email'
  | 'contact.phone' | 'contact.job_title' | 'contact.linkedin_url'

export type FieldMapping = Partial<Record<string, ProspectField>>

// ── Data models for imported prospects ────────────────────────────────────────

export interface ContactImport {
  first_name?:   string
  last_name?:    string
  email?:        string
  phone?:        string
  job_title?:    string
  linkedin_url?: string
  is_primary?:   boolean
}

export interface ProspectImport {
  company_name:   string
  website?:       string
  industry?:      string
  company_size?:  string
  country?:       string
  city?:          string
  source:         ProspectSource
  tags?:          string[]
  linkedin_url?:  string
  metadata?:      Record<string, unknown>
  contacts?:      ContactImport[]
  // Raw source row, for audit / field mapping UI
  _raw?:          Record<string, unknown>
}

// ── Operation options ─────────────────────────────────────────────────────────

export interface ImportOptions {
  limit?:       number
  offset?:      number
  mapping?:     FieldMapping
  filters?:     Record<string, unknown>
  dryRun?:      boolean
}

export interface SyncOptions {
  mode:                 'full' | 'incremental'
  since?:               string     // ISO date — used for incremental
  conflictResolution:   'skip' | 'overwrite' | 'merge'
  mapping?:             FieldMapping
}

export interface UpdateOptions {
  prospect_ids: string[]
  fields:       string[]
  dryRun?:      boolean
}

// ── Operation results ─────────────────────────────────────────────────────────

export interface ConnectorErrorDetail {
  code:      string
  message:   string
  details?:  unknown
  at:        string    // ISO timestamp
  retryable: boolean
  row?:      number    // source row index, if applicable
}

export interface ImportResult {
  total:     number
  imported:  number
  skipped:   number
  errors:    ConnectorErrorDetail[]
  prospects: ProspectImport[]
}

export interface SyncResult {
  total:    number
  created:  number
  updated:  number
  deleted:  number
  skipped:  number
  errors:   ConnectorErrorDetail[]
}

export interface UpdateResult {
  total:    number
  updated:  number
  failed:   number
  errors:   ConnectorErrorDetail[]
}

export type OperationResult = ImportResult | SyncResult | UpdateResult

// ── Test result ───────────────────────────────────────────────────────────────

export interface TestResult {
  ok:       boolean
  message:  string
  latency?: number  // ms
}

// ── Log entry ─────────────────────────────────────────────────────────────────

export type LogStatus = 'running' | 'success' | 'partial' | 'error'

export interface ConnectorLogEntry {
  id:            string
  connector_id:  ConnectorId
  operation:     OperationType | 'test'
  status:        LogStatus
  started_at:    string
  ended_at?:     string
  duration_ms?:  number
  items_total?:  number
  items_ok?:     number
  items_failed?: number
  errors?:       ConnectorErrorDetail[]
  metadata?:     Record<string, unknown>
}

// ── Core interface every connector must implement ─────────────────────────────

export interface IConnector<TConfig extends ConnectorConfig = ConnectorConfig> {
  /** Static descriptor — read-only, used by registry and UI */
  readonly meta: ConnectorMeta

  /** Save config (validates required fields but does NOT call any API) */
  configure(config: TConfig): void

  /** Return true when all required config fields are populated */
  isConfigured(): boolean

  /** Test the connection / API key — called explicitly by the user */
  test(): Promise<TestResult>

  /** Pull records from source → return ProspectImport[] (not yet persisted) */
  import(opts?: ImportOptions): Promise<ImportResult>

  /** Two-way or one-way sync against existing prospects in DB */
  sync(opts?: SyncOptions): Promise<SyncResult>

  /** Push updated fields from DB back to the source */
  update(opts: UpdateOptions): Promise<UpdateResult>
}
