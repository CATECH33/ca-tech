import { chromium } from 'playwright'
import fs from 'fs'

const PAGES = [
  { url: 'https://www.ca-tech.fr/blog', name: 'Blog hub' },
  { url: 'https://www.ca-tech.fr/ressources/agent-ia-service-client', name: 'Agent IA service client' },
  { url: 'https://www.ca-tech.fr/ressources/n8n-vs-make', name: 'n8n vs Make' },
  { url: 'https://www.ca-tech.fr/ressources/automatisations-tpe-10h-semaine', name: 'Automatisations TPE 10h/sem' },
  { url: 'https://www.ca-tech.fr/ressources/seo-local-guide-complet', name: 'SEO local guide complet' },
]

const OUT = 'verify-blog-ressources'
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 900 })

for (const p of PAGES) {
  console.log(`\n🔍 ${p.name} (${p.url})`)
  try {
    const res = await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 })
    const status = res.status()
    const title = await page.title()
    const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'ABSENT')
    const desc = await page.$eval('meta[name="description"]', el => el.content).catch(() => 'ABSENT')
    const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => 'ABSENT')

    const jsonLd = await page.$$eval('script[type="application/ld+json"]', els =>
      els.flatMap(el => {
        try {
          const d = JSON.parse(el.textContent)
          return (d['@graph'] || [d]).map(n => n['@type']).filter(Boolean)
        } catch { return [] }
      })
    )

    const internalLinks = await page.$$eval('a[href]', els =>
      els
        .filter(el => {
          const href = el.getAttribute('href') || ''
          return (href.startsWith('/') || href.includes('ca-tech.fr')) &&
            !href.startsWith('/#') && href !== '/' &&
            !href.includes('tel:') && !href.includes('mailto:')
        })
        .map(el => el.getAttribute('href'))
        .filter(Boolean)
    )

    const icon = status === 200 ? '✅' : '❌'
    console.log(`${icon} HTTP ${status} | "${title}"`)
    console.log(`   H1        : ${h1}`)
    console.log(`   meta desc : ${desc.slice(0, 90)}${desc.length > 90 ? '…' : ''}`)
    console.log(`   canonical : ${canonical}`)
    console.log(`   JSON-LD   : ${jsonLd.join(', ') || 'ABSENT'}`)
    console.log(`   Liens int : ${internalLinks.length}`)

    const slug = p.url.split('/').pop() || 'blog'
    await page.screenshot({ path: `${OUT}/${slug}-top.png` })
  } catch (err) {
    console.log(`❌ ERREUR : ${err.message}`)
  }
}

await browser.close()
console.log('\n✅ Vérification terminée.')
