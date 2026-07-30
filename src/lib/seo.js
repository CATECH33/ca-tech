import { useEffect } from 'react'

const SITE_URL = 'https://www.ca-tech.fr'
const DEFAULT_OG_IMAGE = 'https://www.ca-tech.fr/assets/logos/logo-ca-tech.png'
const SITE_NAME = 'CA-TECH'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function usePageMeta({
  title,
  description,
  keywords,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
}) {
  useEffect(() => {
    const canonical = `${SITE_URL}${path}`
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'keywords', keywords)
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1')
    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', 'fr_FR')
    upsertMeta('property', 'og:type', ogType)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:image', ogImage)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [title, description, keywords, path, ogImage, ogType, noindex])
}

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE }
