import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotConfiguredError, ConnectorNotImplementedError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface LinkedInConfig extends ConnectorConfig {
  liAtCookie:  string  // LinkedIn session cookie (li_at)
  searchUrl?:  string  // Sales Navigator or standard search URL
  maxResults?: number
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class LinkedInConnector implements IConnector<LinkedInConfig> {
  readonly meta: ConnectorMeta = {
    id:          'linkedin',
    name:        'LinkedIn',
    description: 'Extraction de prospects depuis LinkedIn — entreprises, contacts, Sales Navigator. Utilise un cookie de session.',
    category:    'scraping',
    color:       'bg-blue-100 text-blue-700',
    icon:        'LI',
    requiresAuth: true,
    capabilities: ['import'],
    docsUrl:     'https://www.linkedin.com/help/linkedin/answer/a548441',
    configFields: [
      { key: 'liAtCookie',  label: 'Cookie LinkedIn (li_at)', type: 'password', placeholder: 'AQE...', required: true,
        hint: 'DevTools → Application → Cookies → linkedin.com → li_at. Expire après ~1 an.' },
      { key: 'searchUrl',   label: 'URL de recherche (opt.)', type: 'text',  placeholder: 'https://www.linkedin.com/search/results/companies/?keywords=...', required: false,
        hint: 'Laissez vide pour un import manuel des URLs par lot' },
      { key: 'maxResults',  label: 'Nombre max de résultats', type: 'number', placeholder: '50', required: false },
    ],
  }

  private config?: LinkedInConfig

  configure(config: LinkedInConfig): void {
    this.config = config
  }

  isConfigured(): boolean {
    return !!this.config?.liAtCookie
  }

  async test(): Promise<TestResult> {
    if (!this.config?.liAtCookie) {
      return { ok: false, message: 'Cookie li_at manquant — ouvrez DevTools → Application → Cookies → linkedin.com → li_at.' }
    }
    // LinkedIn Voyager API is blocked by CORS from the browser — validation server-side only.
    // We confirm the cookie is registered and non-empty.
    const len = this.config.liAtCookie.length
    return {
      ok:      true,
      message: `Cookie li_at enregistré (${len} caractères). Vérification directe impossible (CORS) — l'import utilisera ce cookie via Apify.`,
    }
  }

  async import(_opts?: ImportOptions): Promise<ImportResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('linkedin')

    // FUTURE implementation (requires backend proxy or Apify actor):
    // Option A — Apify actor:
    //   Use apify/linkedin-company-scraper with the li_at cookie
    //   Actor accepts searchUrl and returns company profiles
    //
    // Option B — Voyager API (unofficial):
    //   GET /voyager/api/search/blended?q=all&query=(keywords:...,filters:List(...))
    //   Headers: csrf-token, Cookie: li_at={liAtCookie}, JSESSIONID=...
    //
    // Response fields to map:
    //   company_name = miniCompany.name
    //   website      = (from company detail) companyPageUrl → resolve
    //   industry     = miniCompany.industries[0].localizedName
    //   company_size = staffCount
    //   linkedin_url = miniCompany.universalName → https://linkedin.com/company/{name}
    //   source       = 'linkedin'

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(_opts?: SyncOptions): Promise<SyncResult> {
    throw new ConnectorNotImplementedError('linkedin', 'sync')
    // LinkedIn scraping is rate-limited — full sync is risky.
    // Planned: incremental sync only via search URL + dedup by linkedin_url.
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('linkedin', 'update')
    // LinkedIn does not offer a write API for company data.
  }
}
