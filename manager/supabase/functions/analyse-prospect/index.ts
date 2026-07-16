/**
 * analyse-prospect — Moteur d'analyse SEO automatique v2
 *
 * Analyse un site web sur 15 axes :
 *  1. Présence (fetch HTTP)
 *  2. HTTPS
 *  3. Responsive (meta viewport + Google PageSpeed API)
 *  4. Meta Title
 *  5. Meta Description
 *  6. Sitemap.xml
 *  7. Robots.txt
 *  8. Formulaire de contact
 *  9. WhatsApp
 * 10. Google Maps intégré
 * 11. Temps de chargement estimé
 * 12. CMS détecté
 * 13. Email visible
 * 14. Téléphone visible
 * 15. Google Business (Places API)
 * 16. Réseaux sociaux
 *
 * Env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injectés)
 *   GOOGLE_API_KEY — clé API Google avec PageSpeed + Places activés
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ── Normalize URL ─────────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  raw = raw.trim()
  if (!raw.match(/^https?:\/\//i)) raw = 'https://' + raw
  return raw
}

function getOrigin(url: string): string {
  try { return new URL(url).origin } catch { return url }
}

// ── Fetch HTML ────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<{
  html: string | null
  finalUrl: string
  load_time_ms: number | null
  error: string | null
}> {
  const start = Date.now()
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10_000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CA-TECH-Analyser/1.0; +https://ca-tech.fr)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5',
      },
    })
    clearTimeout(timer)

    if (!res.ok) {
      return { html: null, finalUrl: res.url ?? url, load_time_ms: null, error: `HTTP ${res.status}` }
    }

    const reader = res.body?.getReader()
    if (!reader) return { html: null, finalUrl: res.url ?? url, load_time_ms: null, error: 'Pas de body' }

    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done || !value) break
      chunks.push(value)
      total += value.length
      if (total > 800_000) break
    }

    const html = new TextDecoder().decode(
      chunks.reduce((acc, c) => {
        const merged = new Uint8Array(acc.length + c.length)
        merged.set(acc, 0); merged.set(c, acc.length)
        return merged
      }, new Uint8Array()),
    )

    return { html, finalUrl: res.url ?? url, load_time_ms: Date.now() - start, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { html: null, finalUrl: url, load_time_ms: null, error: msg.includes('aborted') ? 'Timeout (10s)' : msg }
  }
}

// ── Fetch simple (sitemap / robots) ──────────────────────────────────────────

async function fetchExists(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6_000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CA-TECH-Analyser/1.0)' },
    })
    clearTimeout(timer)
    return res.ok
  } catch { return false }
}

// ── HTML analysers ────────────────────────────────────────────────────────────

function detectMetaTitle(html: string): boolean {
  return /<title[^>]*>[^<]{1,}/i.test(html)
}

function detectMetaDescription(html: string): boolean {
  return /<meta[^>]+name=["']description["'][^>]*content=["'][^"']{10,}/i.test(html) ||
         /<meta[^>]+content=["'][^"']{10,}["'][^>]*name=["']description["']/i.test(html)
}

function detectForm(html: string): boolean {
  return (
    /<form[\s>]/i.test(html) ||
    /typeform\.com/i.test(html) ||
    /tally\.so/i.test(html) ||
    /<input[^>]+type=["']?(?:text|email|tel)/i.test(html) ||
    /contact[-_]?form/i.test(html) ||
    /formspree\.io/i.test(html) ||
    /hubspotforms\.com/i.test(html) ||
    /wpforms/i.test(html)
  )
}

function detectWhatsApp(html: string): boolean {
  return /wa\.me\/|api\.whatsapp\.com\/send|whatsapp:\/\//i.test(html) ||
         /href=["'][^"']*whatsapp[^"']*["']/i.test(html)
}

function detectGoogleMapsEmbed(html: string): boolean {
  return /<iframe[^>]+src=["'][^"']*(?:google\.com\/maps|maps\.google\.com|goo\.gl\/maps)[^"']*["']/i.test(html) ||
         /maps\.googleapis\.com\/maps\/api\/js/i.test(html) ||
         /<iframe[^>]+src=["'][^"']*maps\.app\.goo\.gl[^"']*["']/i.test(html)
}

function detectEmail(html: string): { found: boolean; email?: string } {
  const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/)
  if (mailtoMatch) return { found: true, email: mailtoMatch[1] }
  const rawMatch = html.match(/\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/)
  if (rawMatch && !rawMatch[1].endsWith('.png') && !rawMatch[1].endsWith('.jpg')) {
    return { found: true, email: rawMatch[1] }
  }
  return { found: false }
}

function detectPhone(html: string): { found: boolean; phone?: string } {
  const telMatch = html.match(/tel:([+\d\s()./-]{7,20})/)
  if (telMatch) return { found: true, phone: telMatch[1].trim() }
  const frMatch = html.match(/(?:^|[\s(>])(\+33[\s.-]?[1-9](?:[\s.-]?\d{2}){4}|0[1-9](?:[\s.-]?\d{2}){4})/)
  if (frMatch) return { found: true, phone: frMatch[1].trim() }
  return { found: false }
}

function detectViewport(html: string): boolean {
  return /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html) ||
    /<meta[^>]+content=["'][^"']*width=device-width[^"']*["']/i.test(html)
}

function detectSocials(html: string): Record<string, boolean> {
  return {
    facebook:  /(?:href|src)=["'][^"']*facebook\.com\/(?!sharer|share|tr\?)/i.test(html),
    instagram: /(?:href|src)=["'][^"']*instagram\.com\//i.test(html),
    linkedin:  /(?:href|src)=["'][^"']*linkedin\.com\/(?:company|in)\//i.test(html),
    twitter:   /(?:href|src)=["'][^"']*(?:twitter|x)\.com\/(?!intent|share)/i.test(html),
    youtube:   /(?:href|src)=["'][^"']*youtube\.com\/(?:channel|c\/|@|user\/)/i.test(html),
    tiktok:    /(?:href|src)=["'][^"']*tiktok\.com\/@/i.test(html),
  }
}

function detectCMS(html: string): string | null {
  if (/wp-content\/|wp-includes\/|\/wp-json\//i.test(html)) {
    if (/elementor/i.test(html)) return 'WordPress + Elementor'
    if (/et_pb_row|divi/i.test(html))  return 'WordPress + Divi'
    return 'WordPress'
  }
  if (/wixsite\.com|wixstatic\.com|static\.wixstatic/i.test(html)) return 'Wix'
  if (/cdn\.shopify\.com|myshopify\.com/i.test(html))               return 'Shopify'
  if (/squarespace\.com|sqsp\.net|static1\.squarespace/i.test(html)) return 'Squarespace'
  if (/\.webflow\.io|webflow\.com/i.test(html))                      return 'Webflow'
  if (/drupal\.org|Drupal\.settings/i.test(html))                    return 'Drupal'
  if (/generator=["']Joomla|\/media\/joomla_/i.test(html))           return 'Joomla'
  if (/prestashop|presta-shop/i.test(html))                          return 'PrestaShop'
  if (/ghost\.io|ghost\.org\/assets/i.test(html))                    return 'Ghost'
  if (/__NEXT_DATA__/i.test(html))                                    return 'Next.js'
  if (/__nuxt/i.test(html))                                          return 'Nuxt.js'
  if (/gatsby/i.test(html))                                          return 'Gatsby'
  return null
}

// ── Google PageSpeed Insights ─────────────────────────────────────────────────

async function checkPageSpeed(url: string, apiKey: string): Promise<{
  is_responsive: boolean | null
  performance_score: number | null
  error: string | null
}> {
  try {
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
    endpoint.searchParams.set('url', url)
    endpoint.searchParams.set('strategy', 'mobile')
    endpoint.searchParams.set('category', 'PERFORMANCE')
    if (apiKey) endpoint.searchParams.set('key', apiKey)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 15_000)
    const res = await fetch(endpoint.toString(), { signal: ctrl.signal })
    clearTimeout(timer)

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message: string } }
      return { is_responsive: null, performance_score: null, error: err.error?.message ?? `HTTP ${res.status}` }
    }

    const data = await res.json() as {
      lighthouseResult?: {
        audits?: { viewport?: { score: number } }
        categories?: { performance?: { score: number } }
      }
    }

    const viewport  = data.lighthouseResult?.audits?.viewport
    const perfScore = data.lighthouseResult?.categories?.performance?.score

    const is_responsive = viewport !== undefined
      ? (viewport.score >= 0.9 ? true : viewport.score <= 0.1 ? false : null)
      : null

    return {
      is_responsive,
      performance_score: perfScore !== undefined ? Math.round(perfScore * 100) : null,
      error: null,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { is_responsive: null, performance_score: null, error: msg.includes('aborted') ? 'Timeout PageSpeed' : msg }
  }
}

// ── Google Places API ─────────────────────────────────────────────────────────

async function checkGoogleBusiness(companyName: string, apiKey: string): Promise<{
  found: boolean | null
  place_name?: string
  error: string | null
}> {
  if (!apiKey) return { found: null, error: 'GOOGLE_API_KEY non configurée' }

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8_000)

    const endpoint = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    endpoint.searchParams.set('query', companyName)
    endpoint.searchParams.set('key', apiKey)
    endpoint.searchParams.set('language', 'fr')

    const res = await fetch(endpoint.toString(), { signal: ctrl.signal })
    clearTimeout(timer)

    if (!res.ok) return { found: null, error: `HTTP ${res.status}` }

    const data = await res.json() as {
      status: string
      results?: Array<{ name: string }>
      error_message?: string
    }

    if (data.status === 'REQUEST_DENIED') return { found: null, error: data.error_message ?? 'Places API non autorisée' }
    if (data.status === 'ZERO_RESULTS')  return { found: false, error: null }
    if (data.status !== 'OK')            return { found: null, error: `Places status: ${data.status}` }

    return { found: true, place_name: data.results?.[0]?.name, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { found: null, error: msg.includes('aborted') ? 'Timeout Places' : msg }
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  try {
    const body = await req.json() as { url?: string; company_name?: string }
    const rawUrl      = body.url?.trim()
    const companyName = body.company_name?.trim() ?? ''

    if (!rawUrl) return json({ error: 'Paramètre url manquant' }, 400)

    const url    = normalizeUrl(rawUrl)
    const origin = getOrigin(url)
    const apiKey = Deno.env.get('GOOGLE_API_KEY') ?? ''
    const errors: string[] = []

    // ── 1. HTTPS ─────────────────────────────────────────────────────────────
    const has_https = url.startsWith('https://')

    // ── 2. Fetch HTML ─────────────────────────────────────────────────────────
    const { html, finalUrl, load_time_ms, error: fetchError } = await fetchHtml(url)
    const has_website = html !== null
    if (fetchError) errors.push(`Fetch: ${fetchError}`)

    // ── 3. HTML analyses ──────────────────────────────────────────────────────
    let has_meta_title:       boolean | null = null
    let has_meta_description: boolean | null = null
    let has_form:             boolean | null = null
    let has_whatsapp:         boolean | null = null
    let has_google_maps_embed: boolean | null = null
    let has_email:            boolean | null = null
    let has_phone:            boolean | null = null
    let has_viewport = false
    let socials: Record<string, boolean> | null = null
    let cms_detected: string | null = null
    let email_found: string | undefined
    let phone_found: string | undefined
    let social_found: string[] = []

    if (html) {
      has_meta_title        = detectMetaTitle(html)
      has_meta_description  = detectMetaDescription(html)
      has_form              = detectForm(html)
      has_whatsapp          = detectWhatsApp(html)
      has_google_maps_embed = detectGoogleMapsEmbed(html)
      cms_detected          = detectCMS(html)
      has_viewport          = detectViewport(html)

      const emailRes = detectEmail(html)
      has_email  = emailRes.found
      email_found = emailRes.email

      const phoneRes = detectPhone(html)
      has_phone  = phoneRes.found
      phone_found = phoneRes.phone

      socials      = detectSocials(html)
      social_found = Object.entries(socials).filter(([, v]) => v).map(([k]) => k)
    }

    // ── 4. Sitemap + Robots (parallel) ────────────────────────────────────────
    const [has_sitemap, has_robots] = await Promise.all([
      html !== null ? fetchExists(`${origin}/sitemap.xml`) : Promise.resolve(false),
      html !== null ? fetchExists(`${origin}/robots.txt`)  : Promise.resolve(false),
    ])

    // ── 5. PageSpeed (responsive) ─────────────────────────────────────────────
    const { is_responsive: psResponsive, performance_score, error: psError } =
      await checkPageSpeed(finalUrl, apiKey)
    if (psError) errors.push(`PageSpeed: ${psError}`)

    const is_responsive = psResponsive !== null
      ? psResponsive
      : (html !== null ? has_viewport : null)

    // ── 6. Google Places ──────────────────────────────────────────────────────
    const { found: has_google_business, place_name, error: placesError } = companyName
      ? await checkGoogleBusiness(companyName, apiKey)
      : { found: null, place_name: undefined, error: 'Nom entreprise manquant' }
    if (placesError) errors.push(`Places: ${placesError}`)

    // ── 7. Réponse ────────────────────────────────────────────────────────────
    return json({
      has_website,
      has_https: has_https && (has_website || rawUrl.startsWith('https://')),
      is_responsive,
      has_meta_title,
      has_meta_description,
      has_sitemap,
      has_robots,
      has_form,
      has_whatsapp,
      has_google_maps_embed,
      has_email,
      has_phone,
      has_google_business,
      cms_detected,
      load_time_ms,
      social_networks: socials,
      details: {
        final_url: finalUrl,
        email_found,
        phone_found,
        social_found,
        performance_score,
        place_name,
        ...(errors.length > 0 ? { warnings: errors } : {}),
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg }, 500)
  }
})
