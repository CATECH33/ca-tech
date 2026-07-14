import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotConfiguredError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface GoogleSheetsConfig extends ConnectorConfig {
  spreadsheetId: string
  sheetName:     string
  headerRow?:    number  // 1-indexed, default 1
  // OAuth tokens are managed by the existing Google integration (useGoogleIntegration)
  // — no access_token stored here, the connector fetches it at runtime
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class GoogleSheetsConnector implements IConnector<GoogleSheetsConfig> {
  readonly meta: ConnectorMeta = {
    id:          'google-sheets',
    name:        'Google Sheets',
    description: 'Import et synchronisation bidirectionnelle avec Google Sheets — lecture des prospects et écriture des mises à jour.',
    category:    'sheets',
    color:       'bg-green-100 text-green-600',
    icon:        'GS',
    requiresAuth: true,
    capabilities: ['import', 'sync', 'update'],
    docsUrl:     'https://developers.google.com/sheets/api',
    configFields: [
      { key: 'spreadsheetId', label: 'ID du Spreadsheet', type: 'text', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms', required: true, hint: 'Visible dans l\'URL du fichier Google Sheets' },
      { key: 'sheetName',     label: 'Nom de l\'onglet',  type: 'text', placeholder: 'Feuil1',          required: true },
      { key: 'headerRow',     label: 'Ligne d\'en-tête',  type: 'number', placeholder: '1',             required: false, hint: 'Numéro de la ligne contenant les en-têtes (défaut : 1)' },
    ],
  }

  private config?: GoogleSheetsConfig

  configure(config: GoogleSheetsConfig): void {
    this.config = config
  }

  isConfigured(): boolean {
    return !!(this.config?.spreadsheetId && this.config?.sheetName)
  }

  async test(): Promise<TestResult> {
    // FUTURE: GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}
    // using OAuth token from useGoogleIntegration() / Supabase google_tokens table
    return {
      ok:      false,
      message: 'Configurez l\'ID du Spreadsheet et connectez votre compte Google.',
    }
  }

  async import(opts?: ImportOptions): Promise<ImportResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('google-sheets')

    // FUTURE implementation:
    // 1. Get OAuth token from Supabase google_tokens (already used by useSheetsSync)
    // 2. GET /v4/spreadsheets/{id}/values/{sheetName}
    //    response.values = [headerRow, ...dataRows]
    // 3. Parse header row → detect or apply opts.mapping
    // 4. Map each data row → ProspectImport using the mapping
    //    company_name required — skip rows where it's empty
    // 5. Deduplicate by company_name + website

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(opts?: SyncOptions): Promise<SyncResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('google-sheets')

    // FUTURE: bidirectional sync
    // - Full: import all rows, upsert by external_id (row index or custom key column)
    // - Incremental: compare against last sync timestamp in metadata

    return { total: 0, created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] }
  }

  async update(opts: UpdateOptions): Promise<UpdateResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('google-sheets')

    // FUTURE: push updated prospect fields back to the spreadsheet
    // 1. Fetch rows from Sheets to find matching rows (by company_name or id column)
    // 2. For each prospect_id in opts.prospect_ids:
    //    a. Find the row number
    //    b. Build ValueRange with updated fields
    //    c. PUT /v4/spreadsheets/{id}/values/{sheetName}!A{row}:Z{row}

    return { total: opts.prospect_ids.length, updated: 0, failed: 0, errors: [] }
  }
}
