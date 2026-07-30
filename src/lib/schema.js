import { useEffect } from 'react'
import { SITE_URL, SITE_NAME } from './seo'

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

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: 'CA-TECH',
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logos/logo-ca-tech.png`,
  image: `${SITE_URL}/assets/logos/logo-ca-tech.png`,
  description: "Agence web et cabinet de conseil IA. Sites, applications métier, CRM sur mesure, SaaS, automatisations, agents IA et collaborateurs IA pour PME et startups.",
  email: 'contact@ca-tech.fr',
  telephone: '+33-7-75-66-49-75',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
    addressLocality: 'Paris',
  },
  areaServed: [
    { '@type': 'City', name: 'Paris' },
    { '@type': 'City', name: 'Lyon' },
    { '@type': 'City', name: 'Dijon' },
    { '@type': 'City', name: 'Troyes' },
    { '@type': 'Country', name: 'France' },
  ],
  sameAs: [],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: 'fr-FR',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/catalogue?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

export function serviceSchema({ name, description, path, serviceType, priceRange, offers }) {
  const s = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'France' },
    serviceType: serviceType || name,
  }
  if (priceRange) s.priceRange = priceRange
  if (offers) s.offers = offers
  return s
}

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
