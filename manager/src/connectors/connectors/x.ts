import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotConfiguredError, ConnectorNotImplementedError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface XConfig extends ConnectorConfig {
  bearerToken: string
  apiKey?:     string
  apiSecret?:  string
  query:       string   // Advanced search query, e.g. "agence web lang:fr -is:retweet"
  maxResults?: number
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class XConnector implements IConnector<XConfig> {
  readonly meta: ConnectorMeta = {
    id:          'x',
    name:        'X (Twitter)',
    description: 'Recherche de prospects via X API v2 — identifier des entreprises actives et leurs contacts par mots-clés.',
    category:    'scraping',
    color:       'bg-gray-100 text-gray-800',
    icon:        '𝕏',
    requiresAuth: true,
    capabilities: ['import', 'sync'],
    docsUrl:     'https://developer.twitter.com/en/docs/twitter-api',
    configFields: [
      { key: 'bearerToken', label: 'Bearer Token', type: 'password', placeholder: 'AAAA...', required: true,
        hint: 'Disponible dans Twitter Developer Portal → Votre app → Keys and tokens' },
      { key: 'apiKey',      label: 'API Key (opt.)',    type: 'password', placeholder: '...', required: false },
      { key: 'apiSecret',   label: 'API Secret (opt.)', type: 'password', placeholder: '...', required: false },
      { key: 'query',       label: 'Requête de recherche', type: 'text', placeholder: '"agence web" lang:fr -is:retweet has:links', required: true,
        hint: 'Utilisez la syntaxe X Advanced Search. Ex : "création site" OR "refonte web" lang:fr' },
      { key: 'maxResults',  label: 'Résultats max',    type: 'number', placeholder: '100', required: false },
    ],
  }

  private config?: XConfig

  configure(config: XConfig): void {
    this.config = config
  }

  isConfigured(): boolean {
    return !!(this.config?.bearerToken && this.config?.query)
  }

  async test(): Promise<TestResult> {
    // FUTURE: GET https://api.twitter.com/2/users/me
    // Authorization: Bearer {bearerToken}
    return {
      ok:      false,
      message: 'Configurez votre Bearer Token X pour tester la connexion.',
    }
  }

  async import(opts?: ImportOptions): Promise<ImportResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('x')

    // FUTURE implementation:
    // 1. GET /2/tweets/search/recent?query={query}&max_results={maxResults}
    //    &tweet.fields=author_id,entities,created_at
    //    &expansions=author_id
    //    &user.fields=name,username,description,url,entities,public_metrics
    //    Authorization: Bearer {bearerToken}
    //
    // 2. For each unique author:
    //    - Extract website from user.entities.url (expanded URL)
    //    - company_name = user.name
    //    - source       = 'other' (X)
    //    - metadata     = { twitter_id, username, followers_count, tweet_count }
    //    - tags         = ['x', 'social-media']
    //
    // 3. Deduplicate by twitter_id in metadata

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(opts?: SyncOptions): Promise<SyncResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('x')

    // FUTURE: incremental sync using since_id from previous run
    // stored in metadata.last_tweet_id

    return { total: 0, created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] }
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('x', 'update')
    // X API does not support updating user profiles via API.
  }
}
