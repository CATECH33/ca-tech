import type {
  IConnector, ConnectorMeta, ConnectorConfig,
  ImportOptions, SyncOptions, UpdateOptions,
  ImportResult, SyncResult, UpdateResult, TestResult,
} from '../types'
import { ConnectorNotConfiguredError, ConnectorNotImplementedError } from '../errors'

// ── Config ────────────────────────────────────────────────────────────────────

export interface GoogleMapsConfig extends ConnectorConfig {
  apiKey:    string
  query:     string   // "restaurants Paris" or "plumbers London"
  radius?:   number   // metres
  type?:     string   // "restaurant", "plumber", etc.
  language?: string   // "fr", "en"
  region?:   string   // "fr", "gb"
}

// ── Connector ─────────────────────────────────────────────────────────────────

export class GoogleMapsConnector implements IConnector<GoogleMapsConfig> {
  readonly meta: ConnectorMeta = {
    id:          'google-maps',
    name:        'Google Maps',
    description: 'Extraction d\'établissements depuis Google Maps Places API — restaurants, artisans, commerces, PME locales.',
    category:    'maps',
    color:       'bg-red-100 text-red-600',
    icon:        'GM',
    requiresAuth: true,
    capabilities: ['import', 'sync'],
    docsUrl:     'https://developers.google.com/maps/documentation/places',
    configFields: [
      { key: 'apiKey',   label: 'Clé API Google Maps',   type: 'password', placeholder: 'AIzaSy...',  required: true,  hint: 'Activez l\'API Places dans Google Cloud Console' },
      { key: 'query',    label: 'Recherche',              type: 'text',     placeholder: 'agences web Paris', required: true },
      { key: 'radius',   label: 'Rayon (m)',              type: 'number',   placeholder: '5000',        required: false, hint: 'Rayon en mètres autour du centre de la requête' },
      { key: 'type',     label: 'Type de lieu',           type: 'text',     placeholder: 'establishment', required: false },
      { key: 'language', label: 'Langue des résultats',   type: 'select',   required: false,
        options: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' }, { value: 'es', label: 'Espagnol' }] },
    ],
  }

  private config?: GoogleMapsConfig

  configure(config: GoogleMapsConfig): void {
    this.config = config
  }

  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.query)
  }

  async test(): Promise<TestResult> {
    // FUTURE: GET /maps/api/place/textsearch/json?query=test&key={apiKey}
    // Expect status=OK and non-empty results
    return {
      ok:      false,
      message: 'Configurez votre clé API Google Maps pour tester la connexion.',
    }
  }

  async import(opts?: ImportOptions): Promise<ImportResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('google-maps')

    // FUTURE implementation:
    // 1. GET /maps/api/place/textsearch/json?query={query}&radius={radius}&key={apiKey}
    // 2. Paginate via next_page_token
    // 3. For each result: GET /maps/api/place/details/json?place_id={id}&fields=...
    //    fields: name, website, formatted_phone_number, formatted_address, rating, types
    // 4. Map to ProspectImport:
    //    company_name = result.name
    //    website      = result.website
    //    city         = extract from formatted_address
    //    industry     = result.types[0]
    //    source       = 'search'
    //    metadata     = { place_id, rating, reviews_count }

    return { total: 0, imported: 0, skipped: 0, errors: [], prospects: [] }
  }

  async sync(opts?: SyncOptions): Promise<SyncResult> {
    if (!this.isConfigured()) throw new ConnectorNotConfiguredError('google-maps')

    // FUTURE: re-run the import and compare against existing DB prospects
    // using place_id from metadata to match records

    return { total: 0, created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] }
  }

  async update(_opts: UpdateOptions): Promise<UpdateResult> {
    throw new ConnectorNotImplementedError('google-maps', 'update')
    // Google Places is read-only — no write API for business data.
  }
}
