import { useEffect } from 'react'
import { SITE_URL, SITE_NAME } from './seo'

/* ─── DOM helpers ───────────────────────────────────────────────────── */
function upsertJsonLd(id, data) {
  let el = document.head.querySelector(`script[data-jsonld="${id}"]`)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-jsonld', id)
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd(id) {
  const el = document.head.querySelector(`script[data-jsonld="${id}"]`)
  if (el) el.remove()
}

export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) { removeJsonLd(id); return }
    upsertJsonLd(id, data)
    return () => removeJsonLd(id)
  }, [id, JSON.stringify(data)])
}

/* ─── Shared IDs ────────────────────────────────────────────────────── */
const ORG_ID  = `${SITE_URL}/#organization`
const SITE_ID = `${SITE_URL}/#website`

/* ══════════════════════════════════════════════════════════════════════
   ORGANIZATION · LOCAL BUSINESS · PROFESSIONAL SERVICE
   Google recommends at least: name, url, telephone, address, openingHours
══════════════════════════════════════════════════════════════════════ */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
  '@id': ORG_ID,
  name: SITE_NAME,
  legalName: 'CA-TECH',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#logo`,
    url: `${SITE_URL}/assets/logos/logo-ca-tech.png`,
    contentUrl: `${SITE_URL}/assets/logos/logo-ca-tech.png`,
    width: 280,
    height: 80,
    caption: 'CA-TECH — Agence web & IA',
  },
  image: `${SITE_URL}/android-chrome-512x512.webp`,
  description: "Agence web IA-first : sites vitrines, e-commerce, CRM sur mesure, agents IA et automatisations pour PME françaises. Paris · Lyon · Dijon. Premier livrable en 72h.",
  email: 'contact@ca-tech.fr',
  telephone: '+33775664975',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Paris',
    addressRegion: 'Île-de-France',
    postalCode: '75000',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Carte bancaire, Virement bancaire',
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '19:00',
  }],
  areaServed: [
    { '@type': 'City', name: 'Paris' },
    { '@type': 'City', name: 'Lyon' },
    { '@type': 'City', name: 'Dijon' },
    { '@type': 'City', name: 'Troyes' },
    { '@type': 'Country', name: 'France' },
  ],
  knowsAbout: [
    'Développement web', 'Intelligence artificielle', 'Automatisation des processus',
    'CRM sur mesure', 'SEO', 'E-commerce', 'Agents IA', 'Applications métier',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services CA-TECH — Web, IA & Automatisations',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Landing page',
        price: '270',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/tarifs`,
        itemOffered: { '@type': 'Service', name: 'Création de landing page haute conversion' },
      },
      {
        '@type': 'Offer',
        name: 'Site vitrine',
        price: '590',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/tarifs`,
        itemOffered: { '@type': 'Service', name: 'Création de site vitrine professionnel' },
      },
      {
        '@type': 'Offer',
        name: 'Site e-commerce',
        price: '1090',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/tarifs`,
        itemOffered: { '@type': 'Service', name: 'Création de site e-commerce Stripe' },
      },
      {
        '@type': 'Offer',
        name: 'Collaborateur IA',
        price: '290',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/collaborateurs-ia`,
        itemOffered: { '@type': 'Service', name: 'Agent IA autonome 24h/24' },
      },
      {
        '@type': 'Offer',
        name: 'Automatisation de processus',
        price: '800',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/automatisations`,
        itemOffered: { '@type': 'Service', name: 'Automatisation N8N, Make, Zapier' },
      },
      {
        '@type': 'Offer',
        name: 'Maintenance web',
        price: '49',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/tarifs`,
        itemOffered: { '@type': 'Service', name: 'Maintenance et hébergement web managé' },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '47',
    reviewCount: '47',
  },
  foundingDate: '2023',
  sameAs: [],
}

/* ══════════════════════════════════════════════════════════════════════
   WEBSITE · SEARCH ACTION
   target.urlTemplate must point to a real search endpoint
══════════════════════════════════════════════════════════════════════ */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: 'Agence web IA-first pour PME — sites, e-commerce, CRM sur mesure, agents IA et automatisations.',
  inLanguage: 'fr-FR',
  publisher: { '@id': ORG_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/catalogue?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

/* ══════════════════════════════════════════════════════════════════════
   WEB PAGE (dynamic, one per route)
   pageType options: WebPage | CollectionPage | ContactPage | AboutPage
══════════════════════════════════════════════════════════════════════ */
export function webPageSchema({
  name,
  description,
  path,
  pageType = 'WebPage',
  datePublished = '2024-03-01',
  dateModified = '2026-08-03',
  image,
  speakableCssSelectors,
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    datePublished,
    dateModified,
  }
  if (image) {
    schema.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    }
    schema.thumbnailUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`
  }
  if (speakableCssSelectors) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableCssSelectors,
    }
  }
  return schema
}

/* ══════════════════════════════════════════════════════════════════════
   BREADCRUMB LIST
══════════════════════════════════════════════════════════════════════ */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${items[items.length - 1]?.path ?? '/'}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

/* ══════════════════════════════════════════════════════════════════════
   SERVICE
   Add offers via hasOfferCatalog for rich pricing snippets
══════════════════════════════════════════════════════════════════════ */
export function serviceSchema({ name, description, path, serviceType, priceRange, offers }) {
  const s = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'France' },
    serviceType: serviceType || name,
    category: serviceType || name,
  }
  if (priceRange) s.priceRange = priceRange
  if (offers && offers.length) {
    s.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `Offres — ${name}`,
      itemListElement: offers,
    }
  }
  return s
}

/* ══════════════════════════════════════════════════════════════════════
   OFFER (standalone, for pricing pages)
   For subscriptions pass billingPeriod: 'MON' (monthly) | 'ANN' (annual)
══════════════════════════════════════════════════════════════════════ */
export function offerSchema({
  name,
  description,
  price,
  priceCurrency = 'EUR',
  path,
  priceValidUntil,
  billingPeriod,
  availability = 'https://schema.org/InStock',
}) {
  const schema = {
    '@type': 'Offer',
    name,
    availability,
    url: `${SITE_URL}${path}`,
    seller: { '@id': ORG_ID },
  }
  if (description) schema.description = description
  if (priceValidUntil) schema.priceValidUntil = priceValidUntil

  if (billingPeriod) {
    schema.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      price,
      priceCurrency,
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: '1',
        unitCode: billingPeriod,
      },
    }
  } else {
    schema.price = price
    schema.priceCurrency = priceCurrency
  }
  return schema
}

/* ══════════════════════════════════════════════════════════════════════
   FAQ PAGE
══════════════════════════════════════════════════════════════════════ */
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/* ══════════════════════════════════════════════════════════════════════
   ITEM LIST
══════════════════════════════════════════════════════════════════════ */
export function itemListSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}${it.path}`,
    })),
  }
}

/* ══════════════════════════════════════════════════════════════════════
   SOFTWARE APPLICATION (Loïc IA demo)
══════════════════════════════════════════════════════════════════════ */
export function softwareAppSchema({ name, description, path, applicationCategory, offers }) {
  const s = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}${path}#app`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: applicationCategory || 'BusinessApplication',
    operatingSystem: 'All',
    inLanguage: 'fr-FR',
    author: { '@id': ORG_ID },
    provider: { '@id': ORG_ID },
  }
  if (offers) s.offers = offers
  return s
}
