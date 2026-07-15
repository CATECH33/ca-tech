import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotImplementedError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface CsvConfig extends ConnectorConfig {
  delimiter?:  string   // default ','
  encoding?:   string   // default 'utf-8'
  hasHeader?:  boolean  // default true
  skipRows?:   number   // rows to skip before header
  mapping?:    Record<string, string>  // { csv_column: prospect_field }
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class CsvConnector implements IConnector<CsvConfig> {
  readonly meta: ConnectorMeta = {
    id:          'csv',
    name:        'CSV',
    description: 'Import de prospects depuis un fichier CSV — mappage flexible des colonnes vers les champs prospect.',
    category:    'files',
    color:       'bg-slate-100 text-slate-700',
    icon:        'CSV',
    requiresAuth: false,
    capabilities: ['import'],
    configFields: [
      { key: 'delimiter',  label: 'Séparateur',         type: 'text',   placeholder: ',',       required: false, hint: 'Virgule par défaut. Utilisez ; pour les exports Excel français.' },
      { key: 'encoding',   label: 'Encodage',           type: 'select', placeholder: 'utf-8',   required: false,
        options: [{ value: 'utf-8', label: 'UTF-8' }, { value: 'latin1', label: 'Latin-1 / ISO-8859-1' }, { value: 'utf-16', label: 'UTF-16' }] },
      { key: 'hasHeader',  label: 'Ligne d\'en-tête',   type: 'select', required: false,
        options: [{ value: 'true', label: 'Oui (défaut)' }, { value: 'false', label: 'Non' }] },
      { key: 'skipRows',   label: 'Lignes à ignorer',   type: 'number', placeholder: '0',       required: false, hint: 'Nombre de lignes à sauter avant l\'en-tête' },
    ],
  }

  private config?: CsvConfig
  private _file?: File

  configure(config: CsvConfig): void {
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
      return { ok: false, message: 'Sélectionnez un fichier CSV à importer.' }
    }
    return { ok: true, message: `Fichier prêt : ${this._file.name} (${(this._file.size / 1024).toFixed(1)} Ko)` }
  }

  async import(opts?: ImportOptions): Promise<ImportResult> {
    if (!this._file) {
      return { total: 0, imported: 0, skipped: 0, errors: [{ code: 'NO_FILE', message: 'Aucun fichier sélectionné.', at: new Date().toISOString(), retryable: false, row: 0 }], prospects: [] }
    }

    // FUTURE implementation:
    // 1. Read file via FileReader API or text() method
    // 2. Parse CSV with PapaParse or manual split:
    //    Papa.parse(text, { header: hasHeader, delimiter, encoding, skipEmptyLines: true })
    // 3. If !hasHeader → build synthetic header from opts?.mapping keys
    // 4. Apply column mapping (this.config?.mapping) or auto-detect:
    //    Auto-detect: match column names to known aliases
    //    { 'nom société', 'company', 'entreprise' } → company_name
    //    { 'site', 'website', 'url' }               → website
    //    { 'email', 'mail', 'courriel' }             → email
    //    { 'téléphone', 'phone', 'tel' }             → phone
    //    { 'ville', 'city' }                         → city
    //    { 'secteur', 'industry' }                   → industry
    // 5. Validate: skip rows where company_name is empty
    // 6. Return ImportResult with prospects[]

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(_opts?: SyncOptions): Promise<SyncResult> {
    throw new ConnectorNotImplementedError('csv', 'sync')
    // CSV is a one-shot import — no incremental sync concept applies.
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('csv', 'update')
    // CSV files are read-only from the connector's perspective.
  }
}
