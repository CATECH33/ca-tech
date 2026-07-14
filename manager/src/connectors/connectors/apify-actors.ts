// Curated Apify actor catalog — add new actors here to make them available in the panel.
// Each entry provides a suggested input template and documentation link.

export interface CuratedActor {
  id:            string   // full actor slug, e.g. 'apify/google-search-scraper'
  name:          string
  description:   string
  category:      'scraping' | 'search' | 'maps' | 'contact' | 'custom'
  badgeColor:    string   // Tailwind classes
  inputTemplate: Record<string, unknown>
  docsUrl:       string
}

export const CURATED_ACTORS: CuratedActor[] = [
  {
    id:          'apify/google-search-scraper',
    name:        'Google Search Scraper',
    description: 'Résultats organiques Google — trouvez des entreprises par mot-clé.',
    category:    'search',
    badgeColor:  'bg-blue-100 text-blue-700',
    inputTemplate: {
      queries:          'agence web Paris',
      maxPagesPerQuery: 3,
      languageCode:     'fr',
      countryCode:      'fr',
    },
    docsUrl: 'https://apify.com/apify/google-search-scraper',
  },
  {
    id:          'compass/google-maps-scraper',
    name:        'Google Maps Scraper',
    description: 'Fiches d\'établissements Google Maps avec coordonnées et avis.',
    category:    'maps',
    badgeColor:  'bg-green-100 text-green-700',
    inputTemplate: {
      searchStringsArray:         ['agence web'],
      locationQuery:              'Paris, France',
      maxCrawledPlacesPerSearch:  50,
    },
    docsUrl: 'https://apify.com/compass/google-maps-scraper',
  },
  {
    id:          'apify/website-content-crawler',
    name:        'Website Content Crawler',
    description: 'Crawl un site web et extrait le contenu — idéal pour la recherche entreprise.',
    category:    'scraping',
    badgeColor:  'bg-orange-100 text-orange-700',
    inputTemplate: {
      startUrls:     [{ url: 'https://example.com' }],
      maxCrawlDepth: 2,
      maxCrawlPages: 20,
    },
    docsUrl: 'https://apify.com/apify/website-content-crawler',
  },
  {
    id:          'vdrmota/contactinfoscraper',
    name:        'Contact Info Scraper',
    description: 'Extrait emails et téléphones depuis les sites d\'entreprises.',
    category:    'contact',
    badgeColor:  'bg-purple-100 text-purple-700',
    inputTemplate: {
      startUrls: [{ url: 'https://example.com' }],
    },
    docsUrl: 'https://apify.com/vdrmota/contactinfoscraper',
  },
  {
    id:          'apify/cheerio-scraper',
    name:        'Cheerio Scraper',
    description: 'Scraper HTML léger et rapide pour pages simples sans JavaScript.',
    category:    'scraping',
    badgeColor:  'bg-yellow-100 text-yellow-700',
    inputTemplate: {
      startUrls:    [{ url: 'https://example.com' }],
      pageFunction: '// async function pageFunction({ $, request, log }) { ... }',
    },
    docsUrl: 'https://apify.com/apify/cheerio-scraper',
  },
]

export const CATEGORY_LABEL: Record<CuratedActor['category'], string> = {
  scraping: 'Scraping',
  search:   'Recherche',
  maps:     'Cartographie',
  contact:  'Contact',
  custom:   'Personnalisé',
}
