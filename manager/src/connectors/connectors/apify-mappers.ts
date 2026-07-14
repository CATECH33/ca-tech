// Actor-specific mappers: raw dataset item → ProspectImport
// To add a new actor: implement a mapper function and register it in MAPPERS.

import type { ProspectImport } from '../types'

type RawItem = Record<string, unknown>
type Mapper  = (item: RawItem) => ProspectImport | null

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function parseCompanyName(title: string): string {
  // Strip common suffixes after separators: "Agence Web | Paris" → "Agence Web"
  return title.split(/[|–—\-]/).map(s => s.trim()).find(Boolean) ?? title.trim()
}

function normalizeDomain(raw: string): string | undefined {
  try {
    const url = raw.startsWith('http') ? raw : `https://${raw}`
    const parsed = new URL(url)
    return `https://${parsed.hostname.replace(/^www\./, '')}`
  } catch {
    return undefined
  }
}

function countryCodeToName(code: string): string | undefined {
  const map: Record<string, string> = {
    FR: 'France', DE: 'Allemagne', GB: 'Royaume-Uni', ES: 'Espagne',
    IT: 'Italie', BE: 'Belgique', CH: 'Suisse', CA: 'Canada', US: 'États-Unis',
  }
  return map[code.toUpperCase()] ?? code
}

// ── Google Search Scraper ─────────────────────────────────────────────────────
// apify/google-search-scraper
// Each dataset item = one SERP page with organicResults[] inside.
// We flatten organicResults into individual ProspectImport entries.

function mapOneOrganic(organic: RawItem, query?: string): ProspectImport | null {
  const title = str(organic.websiteTitle || organic.title)
  const url   = str(organic.url || organic.displayedUrl)
  if (!title && !url) return null

  const website     = normalizeDomain(url)
  const companyName = title ? parseCompanyName(title) : (website?.replace('https://', '') ?? url)

  return {
    company_name: companyName,
    website,
    source:       'search',
    metadata: {
      description: str(organic.description) || undefined,
      rank:        organic.rank,
      query,
    },
    _raw: organic,
  }
}

function mapGoogleSearch(item: RawItem): ProspectImport | null {
  // If the item has organicResults, it's a SERP page — this mapper is called
  // per raw item, so we handle it via mapDatasetItems (see below).
  // Fall through to single-result handling for edge cases.
  const title = str(item.title || item.websiteTitle)
  const url   = str(item.url || item.displayedUrl)
  if (!title && !url) return null

  const website     = normalizeDomain(url)
  const companyName = title ? parseCompanyName(title) : (website?.replace('https://', '') ?? url)
  const query       = (item.searchQuery as Record<string, unknown>)?.term

  return {
    company_name: companyName,
    website,
    source:       'search',
    metadata: {
      description: str(item.description) || undefined,
      rank:        item.rank,
      query:       typeof query === 'string' ? query : undefined,
    },
    _raw: item,
  }
}

// ── Google Maps Scraper ───────────────────────────────────────────────────────
// compass/google-maps-scraper
// Item fields: title, website, phone, address, city, postalCode, countryCode,
//              categoryName, totalScore, reviewsCount

function mapGoogleMaps(item: RawItem): ProspectImport | null {
  const name = str(item.title || item.name)
  if (!name) return null

  const website     = str(item.website) ? normalizeDomain(str(item.website)) : undefined
  const countryCode = str(item.countryCode)

  return {
    company_name: name,
    website,
    city:         str(item.city) || undefined,
    country:      countryCode ? countryCodeToName(countryCode) : undefined,
    source:       'search',
    metadata: {
      phone:    str(item.phone) || undefined,
      address:  str(item.address) || undefined,
      category: str(item.categoryName) || undefined,
      rating:   typeof item.totalScore === 'number' ? item.totalScore : undefined,
      reviews:  typeof item.reviewsCount === 'number' ? item.reviewsCount : undefined,
    },
    _raw: item,
  }
}

// ── Contact Info Scraper ──────────────────────────────────────────────────────
// vdrmota/contactinfoscraper
// Item fields: url, emails[], phones[]

function mapContactInfo(item: RawItem): ProspectImport | null {
  const url = str(item.url)
  if (!url) return null

  const website     = normalizeDomain(url)
  const companyName = website?.replace('https://', '') ?? url
  const emails      = Array.isArray(item.emails) ? (item.emails as string[]) : []
  const phones      = Array.isArray(item.phones) ? (item.phones as string[]) : []

  return {
    company_name: companyName,
    website,
    source:       'search',
    metadata: {
      emails: emails.slice(0, 5),
      phones: phones.slice(0, 3),
    },
    _raw: item,
  }
}

// ── Website Content Crawler / Cheerio Scraper ─────────────────────────────────
// apify/website-content-crawler, apify/cheerio-scraper
// Item fields: url, title, text

function mapWebsiteContent(item: RawItem): ProspectImport | null {
  const url = str(item.url)
  if (!url) return null

  const website     = normalizeDomain(url)
  const title       = str(item.title)
  const companyName = title ? parseCompanyName(title) : (website?.replace('https://', '') ?? url)

  return {
    company_name: companyName,
    website,
    source:       'search',
    metadata: {
      excerpt: str(item.text).slice(0, 300) || undefined,
    },
    _raw: item,
  }
}

// ── Generic fallback ─────────────────────────────────────────────────────────

function mapGeneric(item: RawItem): ProspectImport | null {
  // Try common field names
  const name = str(item.name || item.title || item.company_name || item.company || item.companyName)
  const url  = str(item.url || item.website || item.domain)
  if (!name && !url) return null

  const website = url ? normalizeDomain(url) : undefined

  return {
    company_name: name || website?.replace('https://', '') || 'Inconnu',
    website,
    source:       'import',
    metadata:     { raw: item },
    _raw:         item,
  }
}

// ── Registry ──────────────────────────────────────────────────────────────────

const MAPPERS: Record<string, Mapper> = {
  'apify/google-search-scraper':     mapGoogleSearch,
  'compass/google-maps-scraper':     mapGoogleMaps,
  'vdrmota/contactinfoscraper':      mapContactInfo,
  'apify/website-content-crawler':   mapWebsiteContent,
  'apify/cheerio-scraper':           mapWebsiteContent,
}

export function getMapper(actorId: string): Mapper {
  return MAPPERS[actorId] ?? mapGeneric
}

export function mapDatasetItems(
  actorId: string,
  items: RawItem[],
): ProspectImport[] {
  // Google Search Scraper: each item is a SERP page; flatten organicResults
  if (actorId === 'apify/google-search-scraper') {
    const prospects: ProspectImport[] = []
    for (const item of items) {
      const query = (item.searchQuery as Record<string, unknown>)?.term as string | undefined
      const organics = Array.isArray(item.organicResults) ? item.organicResults as RawItem[] : []
      if (organics.length > 0) {
        for (const organic of organics) {
          const p = mapOneOrganic(organic, query)
          if (p) prospects.push(p)
        }
      } else {
        // Fallback: treat the item itself as a result
        const p = mapGoogleSearch(item)
        if (p) prospects.push(p)
      }
    }
    return prospects
  }

  const mapper = getMapper(actorId)
  return items.map(mapper).filter((p): p is ProspectImport => p !== null)
}
