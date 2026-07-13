/**
 * analyse-prospect — Moteur d'analyse IA automatique
 *
 * Analyse un site web sur 8 axes :
 *  1. Présence (fetch HTTP)
 *  2. HTTPS (URL + redirect final)
 *  3. Responsive (meta viewport + Google PageSpeed API)
 *  4. Formulaire de contact (pattern HTML)
 *  5. Email visible (mailto: / pattern)
 *  6. Téléphone visible (tel: / pattern FR/intl)
 *  7. Google Business (Google Places API)
 *  8. Réseaux sociaux (liens dans le HTML)
 *
 * Env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injectés)
 *   GOOGLE_API_KEY — clé API Google avec PageSpeed + Places activés
 *                    Si absente : responsive = null, google_business = null
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

// ── Fetch HTML (avec timeout 10s, User-Agent réaliste) ────────────────────────

async function fetchHtml(url: string): Promise<{
  html: string | null
  finalUrl: string
  error: string | null
}> {
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
      return { html: null, finalUrl: res.url ?? url, error: `HTTP ${res.status}` }
    }

    // Limiter à 800 Ko pour éviter les timeouts sur les pages volumineuses
    const reader = res.body?.getReader()
    if (!reader) return { html: null, finalUrl: res.url ?? url, error: 'Pas de body' }

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

    return { html, finalUrl: res.url ?? url, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { html: null, finalUrl: url, error: msg.includes('aborted') ? 'Timeout (10s)' : msg }
  }
}

// ── HTML analysers ────────────────────────────────────────────────────────────

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
  // Numéros FR : 0X XX XX XX XX ou +33 X XX XX XX XX
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
        audits?: {
          viewport?: { score: number; displayValue?: string }
          'uses-responsive-images'?: { score: number }
        }
        categories?: { performance?: { score: number } }
      }
    }

    const viewport = data.lighthouseResult?.audits?.viewport
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

    if (!res.ok) {
      return { found: null, error: `HTTP ${res.status}` }
    }

    const data = await res.json() as {
      status: string
      results?: Array<{ name: string; formatted_address?: string }>
      error_message?: string
    }

    if (data.status === 'REQUEST_DENIED') {
      return { found: null, error: data.error_message ?? 'Places API non autorisée — vérifiez la clé' }
    }
    if (data.status === 'ZERO_RESULTS') {
      return { found: false, error: null }
    }
    if (data.status !== 'OK') {
      return { found: null, error: `Places status: ${data.status}` }
    }

    const first = data.results?.[0]
    return { found: true, place_name: first?.name, error: null }
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
    const rawUrl = body.url?.trim()
    const companyName = body.company_name?.trim() ?? ''

    if (!rawUrl) return json({ error: 'Paramètre url manquant' }, 400)

    const url = normalizeUrl(rawUrl)
    const apiKey = Deno.env.get('GOOGLE_API_KEY') ?? ''

    const errors: string[] = []

    // ── 1. HTTPS (from URL structure) ────────────────────────────────────────
    const has_https = url.startsWith('https://')

    // ── 2. Fetch HTML + has_website ──────────────────────────────────────────
    const { html, finalUrl, error: fetchError } = await fetchHtml(url)
    const has_website = html !== null

    if (fetchError) errors.push(`Fetch: ${fetchError}`)

    // ── 3. HTML analyses (if page accessible) ───────────────────────────────
    let has_form:  boolean | null = null
    let has_email: boolean | null = null
    let has_phone: boolean | null = null
    let has_viewport = false
    let socials: Record<string, boolean> | null = null
    let email_found: string | undefined
    let phone_found: string | undefined
    let social_found: string[] = []

    if (html) {
      has_form = detectForm(html)

      const emailRes = detectEmail(html)
      has_email = emailRes.found
      email_found = emailRes.email

      const phoneRes = detectPhone(html)
      has_phone = phoneRes.found
      phone_found = phoneRes.phone

      has_viewport = detectViewport(html)
      socials = detectSocials(html)
      social_found = Object.entries(socials).filter(([, v]) => v).map(([k]) => k)
    }

    // ── 4. PageSpeed (responsive) ────────────────────────────────────────────
    const { is_responsive: psResponsive, performance_score, error: psError } = await checkPageSpeed(finalUrl, apiKey)
    if (psError) errors.push(`PageSpeed: ${psError}`)

    // Fallback : si PageSpeed échoue, utiliser la présence du meta viewport
    const is_responsive = psResponsive !== null
      ? psResponsive
      : (html !== null ? has_viewport : null)

    // ── 5. Google Places (Google Business) ───────────────────────────────────
    const { found: has_google_business, place_name, error: placesError } = companyName
      ? await checkGoogleBusiness(companyName, apiKey)
      : { found: null, place_name: undefined, error: 'Nom entreprise manquant' }

    if (placesError) errors.push(`Places: ${placesError}`)

    // ── 6. Réponse finale ────────────────────────────────────────────────────
    return json({
      has_website,
      has_https: has_https && (has_website || rawUrl.startsWith('https://')),
      is_responsive,
      has_form,
      has_email,
      has_phone,
      has_google_business,
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
