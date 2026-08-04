import { chromium } from 'playwright'
import fs from 'fs'

const PAGES = [
  { url: 'https://www.ca-tech.fr/methodologie', name: 'Méthodologie', file: 'methodologie.html' },
  { url: 'https://www.ca-tech.fr/technologies', name: 'Technologies', file: 'technologies.html' },
]

const OUT = 'verify-nouvelles-pages'
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 900 })

for (const p of PAGES) {
  console.log(`\n🔍 Vérification : ${p.name} (${p.url})`)
  try {
    const res = await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 })
    const status = res.status()
    const title = await page.title()
    const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'ABSENT')
    const desc = await page.$eval('meta[name="description"]', el => el.content).catch(() => 'ABSENT')
    const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => 'ABSENT')

    // Maillage interne (liens vers autres pages CA-TECH)
    const internalLinks = await page.$$eval('a[href]', els =>
      els
        .filter(el => {
          const href = el.getAttribute('href') || ''
          return (
            href.startsWith('/') ||
            href.includes('ca-tech.fr')
          ) && !href.startsWith('/#') && href !== '/' && !href.includes('tel:') && !href.includes('mailto:')
        })
        .map(el => ({ text: el.textContent.trim().slice(0, 40), href: el.getAttribute('href') }))
        .filter(l => l.text.length > 1)
        .slice(0, 20)
    )

    // Sections présentes
    const sections = await page.$$eval('section, .section', els =>
      els.map(el => el.id || el.className.split(' ')[0]).filter(Boolean).slice(0, 10)
    )

    // JSON-LD
    const jsonLd = await page.$$eval('script[type="application/ld+json"]', els =>
      els.flatMap(el => {
        try {
          const d = JSON.parse(el.textContent)
          return (d['@graph'] || [d]).map(n => n['@type']).filter(Boolean)
        } catch { return [] }
      })
    )

    const ok = status === 200 ? '✅' : '❌'
    console.log(`${ok} HTTP ${status} | "${title}"`)
    console.log(`   H1        : ${h1}`)
    console.log(`   meta desc : ${desc.slice(0, 80)}${desc.length > 80 ? '…' : ''}`)
    console.log(`   canonical : ${canonical}`)
    console.log(`   JSON-LD   : ${jsonLd.join(', ') || 'ABSENT'}`)
    console.log(`   Sections  : ${sections.slice(0, 6).join(', ')}`)
    console.log(`   Maillage  : ${internalLinks.length} liens internes`)
    internalLinks.slice(0, 8).forEach(l => console.log(`     → ${l.href}  (${l.text})`))

    // Screenshots
    await page.screenshot({ path: `${OUT}/${p.file.replace('.html','')}-top.png`, fullPage: false })
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${p.file.replace('.html','')}-bottom.png`, fullPage: false })
    console.log(`   📸 Captures sauvegardées`)
  } catch (err) {
    console.log(`❌ ERREUR : ${err.message}`)
  }
}

await browser.close()
console.log('\n✅ Vérification terminée.')
