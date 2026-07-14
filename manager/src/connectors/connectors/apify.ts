import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotConfiguredError, ConnectorNotImplementedError } from '../errors'
import { ApifyClient } from './apify-client'

// ── Config ────────────────────────────────────────────────────────────────────

export interface ApifyConfig extends ConnectorConfig {
  apiKey:    string
  actorId:   string
  maxItems?: number
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class ApifyConnector implements IConnector<ApifyConfig> {
  readonly meta: ConnectorMeta = {
    id:           'apify',
    name:         'Apify',
    description:  'Scraping web via acteurs Apify — extraire des entreprises depuis n\'importe quelle URL ou moteur de recherche.',
    category:     'scraping',
    color:        'bg-orange-100 text-orange-600',
    icon:         'AP',
    requiresAuth: true,
    capabilities: ['import', 'sync'],
    docsUrl:      'https://docs.apify.com',
    configFields: [
      { key: 'apiKey',   label: 'Clé API Apify',    type: 'password', placeholder: 'apify_api_...', required: true,  hint: 'Console Apify → Paramètres → Clés API' },
      { key: 'actorId',  label: 'Actor ID',          type: 'text',     placeholder: 'apify/google-search-scraper', required: true, hint: 'Slug complet de l\'acteur Apify' },
      { key: 'maxItems', label: 'Limite d\'imports', type: 'number',   placeholder: '100', required: false },
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
    if (!this.config?.apiKey) {
      return { ok: false, message: 'Clé API manquante — configurez votre connecteur Apify.' }
    }
    const start = Date.now()
    try {
      const client = new ApifyClient(this.config.apiKey)
      const user   = await client.getMe()
      return {
        ok:      true,
        message: `Connecté en tant que @${user.username}${user.plan ? ` (${user.plan})` : ''}`,
        latency: Date.now() - start,
      }
    } catch (err) {
      return {
        ok:      false,
        message: err instanceof Error ? err.message : 'Erreur de connexion Apify.',
      }
    }
  }

  async import(_opts?: ImportOptions): Promise<ImportResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('apify')
    // Actor runs are managed by useApifyRun hook (with polling).
    // Full CRM import will be wired here in a future iteration.
    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(_opts?: SyncOptions): Promise<SyncResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('apify')
    return { total: 0, created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] }
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('apify', 'update')
  }
}
