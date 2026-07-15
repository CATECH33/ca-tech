import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotImplementedError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface ExcelConfig extends ConnectorConfig {
  sheetName?:  string  // default: first sheet
  hasHeader?:  boolean // default true
  startRow?:   number  // 1-indexed row where data starts (after optional header)
  mapping?:    Record<string, string>  // { excel_column: prospect_field }
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class ExcelConnector implements IConnector<ExcelConfig> {
  readonly meta: ConnectorMeta = {
    id:          'excel',
    name:        'Excel',
    description: 'Import de prospects depuis un fichier Excel (.xlsx / .xls) — sélection d\'onglet et mappage de colonnes.',
    category:    'files',
    color:       'bg-emerald-100 text-emerald-700',
    icon:        'XLS',
    requiresAuth: false,
    capabilities: ['import'],
    configFields: [
      { key: 'sheetName', label: 'Nom de l\'onglet', type: 'text',   placeholder: 'Feuil1',     required: false, hint: 'Laissez vide pour utiliser le premier onglet' },
      { key: 'hasHeader', label: 'Ligne d\'en-tête', type: 'select', required: false,
        options: [{ value: 'true', label: 'Oui (défaut)' }, { value: 'false', label: 'Non — colonnes A, B, C…' }] },
      { key: 'startRow',  label: 'Première ligne de données', type: 'number', placeholder: '2', required: false, hint: 'Numéro de la première ligne de données (1-indexé)' },
    ],
  }

  private config?: ExcelConfig
  private _file?: File

  configure(config: ExcelConfig): void {
    this.config = config
  }

  setFile(file: File): void {
    this._file = file
  }

  isConfigured(): boolean {
    return !!this._file
  }

  async test(): Promise<TestResult> {
    if (!this._file) {
      return { ok: false, message: 'Sélectionnez un fichier Excel (.xlsx ou .xls) à importer.' }
    }
    const ext = this._file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xls') {
      return { ok: false, message: `Format non supporté : .${ext}. Utilisez .xlsx ou .xls.` }
    }
    return { ok: true, message: `Fichier prêt : ${this._file.name} (${(this._file.size / 1024).toFixed(1)} Ko)` }
  }

  async import(opts?: ImportOptions): Promise<ImportResult> {
    if (!this._file) {
      return { total: 0, imported: 0, skipped: 0, errors: [{ code: 'NO_FILE', message: 'Aucun fichier sélectionné.', at: new Date().toISOString(), retryable: false, row: 0 }], prospects: [] }
    }

    // FUTURE implementation (requires SheetJS / xlsx package):
    // 1. Read file as ArrayBuffer: const buf = await file.arrayBuffer()
    // 2. Parse: const wb = XLSX.read(buf, { type: 'array' })
    // 3. Select sheet: wb.Sheets[sheetName ?? wb.SheetNames[0]]
    // 4. Convert to JSON: XLSX.utils.sheet_to_json(sheet, { header: hasHeader ? 1 : 'A', range: startRow - 1 })
    // 5. Apply column mapping (this.config?.mapping) or auto-detect column names
    //    Same alias table as CsvConnector
    // 6. Validate: skip rows where company_name is empty
    // 7. Return ImportResult with prospects[]
    //
    // SheetJS install: npm install xlsx
    // Import: import * as XLSX from 'xlsx'

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(_opts?: SyncOptions): Promise<SyncResult> {
    throw new ConnectorNotImplementedError('excel', 'sync')
    // Excel files are one-shot imports — no incremental sync concept applies.
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('excel', 'update')
    // Writing back to Excel files is not supported in this architecture.
  }
}
