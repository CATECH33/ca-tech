import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotConfiguredError, ConnectorNotImplementedError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface ApifyConfig extends ConnectorConfig {
  apiKey:     string
  actorId:    string
  datasetId?: string
  maxItems?:  number
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class ApifyConnector implements IConnector<ApifyConfig> {
  readonly meta: ConnectorMeta = {
    id:          'apify',
    name:        'Apify',
    description: 'Scraping web via acteurs Apify — extraire des entreprises depuis n\'importe quelle URL ou moteur de recherche.',
    category:    'scraping',
    color:       'bg-orange-100 text-orange-600',
    icon:        'AP',
    requiresAuth: true,
    capabilities: ['import', 'sync'],
    docsUrl:     'https://docs.apify.com',
    configFields: [
      { key: 'apiKey',    label: 'Clé API Apify',      type: 'password', placeholder: 'apify_api_...', required: true,  hint: 'Disponible dans Console Apify → Paramètres → Clés API' },
      { key: 'actorId',   label: 'Actor ID',            type: 'text',     placeholder: 'apify/web-scraper', required: true,  hint: 'Ex : apify/website-content-crawler' },
      { key: 'datasetId', label: 'Dataset ID (opt.)',   type: 'text',     placeholder: 'aBcDeFgH...',    required: false, hint: 'Laissez vide pour utiliser le dataset par défaut de l\'actor' },
      { key: 'maxItems',  label: 'Limite d\'imports',   type: 'number',   placeholder: '100',            required: false },
    ],
  }

  private config?: ApifyConfig

  configure(config: ApifyConfig): void {
    this.config = config
  }

  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.actorId)
  }

  async test(): Promise<TestResult> {
    // FUTURE: GET https://api.apify.com/v2/users/me?token={apiKey}
    // Check status 200 + response.data.username
    return {
      ok:      false,
      message: 'Configurez votre clé API Apify pour tester la connexion.',
    }
  }

  async import(opts?: ImportOptions): Promise<ImportResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('apify')

    // FUTURE implementation:
    // 1. POST /v2/acts/{actorId}/runs?token={apiKey}  → start actor run
    // 2. Poll GET /v2/acts/{actorId}/runs/last/status until status=SUCCEEDED
    // 3. GET /v2/datasets/{runId}/items?limit={maxItems}&offset={offset}
    // 4. Map items via opts?.mapping → ProspectImport[]

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(opts?: SyncOptions): Promise<SyncResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('apify')

    // FUTURE: same as import + compare against existing prospects in Supabase
    // Incremental: filter items where lastModifiedAt > opts.since

    return { total: 0, created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] }
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('apify', 'update')
    // Apify is read-only — pushing updates back is not applicable.
  }
}
