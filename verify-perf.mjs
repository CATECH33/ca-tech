import { chromium } from 'playwright'

const BASE = 'https://www.ca-tech.fr'

const browser = await chromium.launch({
  args: ['--disable-blink-features=AutomationControlled'],
})
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  locale: 'fr-FR',
  viewport: { width: 390, height: 844 },
  isMobile: true,
})

const page = await ctx.newPage()

// Intercepter les ressources chargées
const resources = []
page.on('response', r => {
  const url = r.url()
  const type = r.request().resourceType()
  if (type === 'script' || type === 'stylesheet') {
    r.body().then(buf => {
      resources.push({ url: url.split('/').pop().slice(0, 50), type, size: buf.length })
    }).catch(() => {})
  }
})

console.log('── Chargement de la page ──')
const t0 = Date.now()
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 40000 })
const loadTime = Date.now() - t0
console.log(`  ⏱  networkidle en ${loadTime}ms`)

// Métriques Performance API
const perf = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  const fcp = paint.find(e => e.name === 'first-contentful-paint')?.startTime ?? null
  return {
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    loadEvent:        Math.round(nav.loadEventEnd),
    ttfb:             Math.round(nav.responseStart - nav.requestStart),
    fcp:              fcp ? Math.round(fcp) : null,
  }
})

console.log('\n── Timings Navigation (temps réseau réel) ──')
const timings = [
  ['TTFB',              perf.ttfb,             300],
  ['DOMContentLoaded',  perf.domContentLoaded, 2000],
  ['Load event',        perf.loadEvent,        3500],
  ['FCP',               perf.fcp,              1800],
]
for (const [label, val, threshold] of timings) {
  if (val === null) { console.log(`  —  ${label.padEnd(20)}: n/a`); continue }
  const ok = val < threshold ? '✅' : val < threshold * 1.5 ? '⚠️ ' : '❌'
  console.log(`  ${ok} ${label.padEnd(20)}: ${val}ms`)
}

// Ressources JS/CSS chargées sur home
await page.waitForTimeout(1000)
console.log('\n── Ressources JS/CSS sur la home ──')
const js = resources.filter(r => r.type === 'script').sort((a, b) => b.size - a.size)
const css = resources.filter(r => r.type === 'stylesheet').sort((a, b) => b.size - a.size)
console.log('  JS:')
js.forEach(r => console.log(`    ${Math.round(r.size / 1024)}KB  ${r.url}`))
const jsTotal = js.reduce((s, r) => s + r.size, 0)
console.log(`    Total: ${Math.round(jsTotal / 1024)} KB`)
console.log('  CSS:')
css.forEach(r => console.log(`    ${Math.round(r.size / 1024)}KB  ${r.url}`))
const cssTotal = css.reduce((s, r) => s + r.size, 0)
console.log(`    Total: ${Math.round(cssTotal / 1024)} KB`)

// Vérifier que Supabase n'est PAS chargé sur la home
const supabaseLoaded = resources.some(r => r.url.includes('supabase'))
console.log(`\n  ${supabaseLoaded ? '❌' : '✅'} Supabase ${supabaseLoaded ? 'chargé (problème!)' : 'non chargé sur home (OK)'}`)

// Vérifier que le H1 est visible sans délai
const h1Visible = await page.evaluate(() => {
  const h1 = document.querySelector('.hero-h1')
  if (!h1) return null
  const style = window.getComputedStyle(h1)
  return { opacity: style.opacity, visibility: style.visibility }
})
console.log(`\n  ${h1Visible?.opacity === '1' ? '✅' : '⚠️ '} H1 opacity: ${h1Visible?.opacity} (LCP immédiat)`)

// Vérifier fonts non-bloquantes
const fontBlocking = await page.evaluate(() => {
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')]
  return links.filter(l => l.href.includes('fonts.googleapis')).length
})
console.log(`  ${fontBlocking === 0 ? '✅' : '⚠️ '} Google Fonts ${fontBlocking === 0 ? 'non-bloquant (preload)' : `bloquant (${fontBlocking} link)` }`)

await browser.close()
console.log('\n✅ Mesures terminées.')
