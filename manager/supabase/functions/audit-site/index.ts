/**
 * audit-site — Moteur d'audit technique de site web
 *
 * 11 critères modulaires + détection CMS
 * Score /10 calculé automatiquement sur les poids définis dans CHECKS.
 *
 * Ajouter un critère = ajouter une entrée dans CHECKS (aucune autre modif).
 *
 * Env vars: aucune requise (GOOGLE_API_KEY optionnelle pour évolutions futures)
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

// ── Types ─────────────────────────────────────────────────────────────────────

type AuditCategory = 'technique' | 'seo' | 'contact' | 'marketing'

interface AuditCtx {
  html: string | null
  finalUrl: string
  httpStatus: number | null
  loadTimeMs: number
  hasSitemap: boolean
  hasRobots: boolean
  hasFavicon: boolean
}

interface CheckDef {
  id: string
  label: string
  category: AuditCategory
  weight: number
  run(ctx: AuditCtx): boolean | null
  detail?(ctx: AuditCtx): string | undefined
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  raw = raw.trim()
  if (!raw.match(/^https?:\/\//i)) raw = 'https://' + raw
  return raw
}

function getBaseUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host}`
  } catch {
    return url
  }
}

// ── Fetch with timing ─────────────────────────────────────────────────────────

async function fetchSite(url: string): Promise<{
  html: string | null
  finalUrl: string
  httpStatus: number | null
  loadTimeMs: number
}> {
  const t0 = Date.now()
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12_000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CA-TECH-Audit/1.0; +https://ca-tech.fr)',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5',
      },
    })
    clearTimeout(timer)
    const loadTimeMs = Date.now() - t0

    if (!res.ok) {
      return { html: null, finalUrl: res.url ?? url, httpStatus: res.status, loadTimeMs }
    }

    const reader = res.body?.getReader()
    if (!reader) return { html: null, finalUrl: res.url ?? url, httpStatus: res.status, loadTimeMs }

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
    return { html, finalUrl: res.url ?? url, httpStatus: res.status, loadTimeMs }
  } catch {
    return { html: null, finalUrl: url, httpStatus: null, loadTimeMs: Date.now() - t0 }
  }
}

async function headOk(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5_000)
    const res = await fetch(url, { signal: ctrl.signal, method: 'HEAD', redirect: 'follow' })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

// ── HTML detectors ────────────────────────────────────────────────────────────

function detectViewport(html: string): boolean {
  return /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html) ||
    /<meta[^>]+content=["'][^"']*width=device-width[^"']*["']/i.test(html)
}

function detectFaviconInHtml(html: string): boolean {
  return /<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]*>/i.test(html) ||
    /<link[^>]+href=["'][^"']*favicon[^"']*["'][^>]*>/i.test(html)
}

function detectForm(html: string): boolean {
  return (
    /<form[\s>]/i.test(html) ||
    /typeform\.com|tally\.so|formspree\.io|hubspotforms\.com|wpforms/i.test(html) ||
    /<input[^>]+type=["']?(?:text|email|tel)/i.test(html)
  )
}

function detectGoogleMaps(html: string): boolean {
  return /maps\.google\.com|google\.com\/maps|maps\.googleapis\.com/i.test(html) ||
    /<iframe[^>]+src=["'][^"']*(?:maps\.google|google\.com\/maps)/i.test(html)
}

function detectWhatsApp(html: string): boolean {
  return /wa\.me\/|api\.whatsapp\.com\/send|whatsapp:\/\//i.test(html)
}

function detectAnalytics(html: string): boolean {
  return /googletagmanager\.com|google-analytics\.com|gtag\(["']config|UA-\d+-\d+|G-[A-Z0-9]{6,}/i.test(html)
}

function detectTitleTag(html: string): boolean {
  return /<title>[^<]{5,}<\/title>/i.test(html)
}

function detectMetaDescription(html: string): boolean {
  return (
    /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}["']/i.test(html) ||
    /<meta[^>]+content=["'][^"']{10,}["'][^>]+name=["']description["']/i.test(html)
  )
}

export function detectCMS(html: string): string | null {
  if (/elementor/i.test(html) && /wp-content/i.test(html)) return 'WordPress + Elementor'
  if (/divi/i.test(html) && /wp-content/i.test(html)) return 'WordPress + Divi'
  if (/wp-content|wp-includes/i.test(html)) return 'WordPress'
  if (/wixstatic\.com|wix\.com\/_api/i.test(html)) return 'Wix'
  if (/static\.squarespace\.com/i.test(html)) return 'Squarespace'
  if (/cdn\.shopify\.com/i.test(html)) return 'Shopify'
  if (/assets\.webflow\.com|webflow\.com\/js/i.test(html)) return 'Webflow'
  if (/framerusercontent\.com/i.test(html)) return 'Framer'
  if (/drupal\.org|drupal\.js/i.test(html)) return 'Drupal'
  if (/joomla/i.test(html)) return 'Joomla'
  if (/prestashop/i.test(html)) return 'PrestaShop'
  if (/Magento|mage\/cookies/i.test(html)) return 'Magento'
  if (/ghost-theme|ghost\.org\/docs/i.test(html)) return 'Ghost'
  return null
}

// ── Check definitions ─────────────────────────────────────────────────────────
// Ajouter un critère ici suffit — le reste est automatique.
// Poids total = 10.0

const CHECKS: CheckDef[] = [
  // ── Technique ───────────────────────────────────────────────────────────────
  {
    id: 'http_ok',
    label: 'Site accessible',
    category: 'technique',
    weight: 1.0,
    run: ctx => ctx.httpStatus !== null ? ctx.httpStatus < 400 : null,
    detail: ctx => ctx.httpStatus !== null ? `HTTP ${ctx.httpStatus}` : undefined,
  },
  {
    id: 'https',
    label: 'HTTPS activé',
    category: 'technique',
    weight: 1.5,
    run: ctx => ctx.finalUrl ? ctx.finalUrl.startsWith('https://') : null,
  },
  {
    id: 'responsive',
    label: 'Design responsive (mobile)',
    category: 'technique',
    weight: 2.0,
    run: ctx => ctx.html !== null ? detectViewport(ctx.html) : null,
  },
  {
    id: 'load_time',
    label: 'Chargement rapide (< 3 s)',
    category: 'technique',
    weight: 1.0,
    run: ctx => ctx.loadTimeMs > 0 ? ctx.loadTimeMs < 3000 : null,
    detail: ctx => `${ctx.loadTimeMs} ms`,
  },
  {
    id: 'favicon',
    label: 'Favicon présente',
    category: 'technique',
    weight: 0.5,
    run: ctx => {
      if (ctx.html && detectFaviconInHtml(ctx.html)) return true
      return ctx.hasFavicon
    },
  },
  // ── SEO ─────────────────────────────────────────────────────────────────────
  {
    id: 'title_tag',
    label: 'Balise title renseignée',
    category: 'seo',
    weight: 0.5,
    run: ctx => ctx.html !== null ? detectTitleTag(ctx.html) : null,
  },
  {
    id: 'meta_description',
    label: 'Meta description présente',
    category: 'seo',
    weight: 0.5,
    run: ctx => ctx.html !== null ? detectMetaDescription(ctx.html) : null,
  },
  {
    id: 'sitemap',
    label: 'Sitemap.xml',
    category: 'seo',
    weight: 0.5,
    run: ctx => ctx.hasSitemap,
  },
  {
    id: 'robots',
    label: 'Robots.txt',
    category: 'seo',
    weight: 0.5,
    run: ctx => ctx.hasRobots,
  },
  // ── Contact ─────────────────────────────────────────────────────────────────
  {
    id: 'form',
    label: 'Formulaire de contact',
    category: 'contact',
    weight: 1.0,
    run: ctx => ctx.html !== null ? detectForm(ctx.html) : null,
  },
  {
    id: 'google_maps',
    label: 'Google Maps intégré',
    category: 'contact',
    weight: 1.0,
    run: ctx => ctx.html !== null ? detectGoogleMaps(ctx.html) : null,
  },
  {
    id: 'whatsapp',
    label: 'Lien WhatsApp',
    category: 'contact',
    weight: 0.5,
    run: ctx => ctx.html !== null ? detectWhatsApp(ctx.html) : null,
  },
  // ── Marketing ───────────────────────────────────────────────────────────────
  {
    id: 'analytics',
    label: 'Google Analytics / GTM',
    category: 'marketing',
    weight: 0.5,
    run: ctx => ctx.html !== null ? detectAnalytics(ctx.html) : null,
  },
  // Total: 1.0+1.5+2.0+1.0+0.5+0.5+0.5+1.0+1.0+0.5+0.5 = 10.0
]

// ── Score ─────────────────────────────────────────────────────────────────────

function computeScore(results: Array<{ weight: number; value: boolean | null }>): number {
  const total  = results.reduce((s, r) => s + r.weight, 0)
  const earned = results.reduce((s, r) => s + (r.value === true ? r.weight : 0), 0)
  if (total === 0) return 0
  return Math.round((earned / total) * 100) / 10
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  try {
    const body = await req.json() as { url?: string }
    const rawUrl = body.url?.trim()
    if (!rawUrl) return json({ error: 'Paramètre url manquant' }, 400)

    const url  = normalizeUrl(rawUrl)
    const base = getBaseUrl(url)

    // Fetch HTML + checks parallèles
    const [{ html, finalUrl, httpStatus, loadTimeMs }, hasSitemap, hasRobots, hasFavicon] =
      await Promise.all([
        fetchSite(url),
        headOk(`${base}/sitemap.xml`),
        headOk(`${base}/robots.txt`),
        headOk(`${base}/favicon.ico`),
      ])

    const ctx: AuditCtx = { html, finalUrl, httpStatus, loadTimeMs, hasSitemap, hasRobots, hasFavicon }

    const checks = CHECKS.map(def => {
      const value = def.run(ctx)
      return { id: def.id, label: def.label, category: def.category, weight: def.weight, value, detail: def.detail?.(ctx) }
    })

    return json({
      version: 1,
      url,
      final_url: finalUrl !== url ? finalUrl : undefined,
      http_status: httpStatus,
      load_time_ms: loadTimeMs,
      cms: html ? detectCMS(html) : null,
      checks,
      score: computeScore(checks),
      audited_at: new Date().toISOString(),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg }, 500)
  }
})
