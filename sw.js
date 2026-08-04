const CACHE_VERSION = 'v1'
const STATIC_CACHE  = `ca-tech-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `ca-tech-dynamic-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/site.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/logos/logo-ca-tech.webp',
  '/logos/logo-ca-tech-icon.svg',
]

// ── Install : pré-cache des ressources essentielles ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate : purge des anciens caches ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch : stratégies par type de ressource ──
self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET et hors-origine
  if (request.method !== 'GET' || url.origin !== location.origin) return

  // Ignorer les routes API et Supabase
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return

  // Cache-First pour assets statiques (images, fonts, JS/CSS hachés)
  if (
    url.pathname.startsWith('/dist/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/logos/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2?|ico)$/)
  ) {
    e.respondWith(cacheFirst(request))
    return
  }

  // Network-First pour les pages HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(networkFirstWithFallback(request))
    return
  }

  // Stale-While-Revalidate pour tout le reste
  e.respondWith(staleWhileRevalidate(request))
})

// ── Stratégies ──

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 408 })
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return caches.match('/offline.html')
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => cached)
  return cached || fetchPromise
}
