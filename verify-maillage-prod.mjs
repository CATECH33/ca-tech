import { chromium } from 'playwright'

const PAGES = [
  { url: 'https://www.ca-tech.fr/creation-site-vitrine', name: 'Site vitrine' },
  { url: 'https://www.ca-tech.fr/creation-site-ecommerce', name: 'E-commerce' },
  { url: 'https://www.ca-tech.fr/automatisations', name: 'Automatisations (React)' },
  { url: 'https://www.ca-tech.fr/collaborateurs-ia', name: 'Collaborateurs IA (React)' },
  { url: 'https://www.ca-tech.fr/tarifs', name: 'Tarifs (React)' },
  { url: 'https://www.ca-tech.fr/cas-clients', name: 'Cas clients' },
  { url: 'https://www.ca-tech.fr/maintenance-site-web', name: 'Maintenance' },
  { url: 'https://www.ca-tech.fr/creation-logo', name: 'Création logo' },
]

const browser = await chromium.launch()
const page = await browser.newPage()

for (const p of PAGES) {
  try {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 })

    // Static pages: .lp-link-card
    const lpLinks = await page.$$eval('.lp-link-card', els =>
      els.map(el => el.querySelector('.lp-link-title')?.textContent?.trim()).filter(Boolean)
    )

    // React pages: SeoRelated component links (look for the related section)
    const seoLinks = await page.$$eval('a[href]', els =>
      els
        .filter(el => {
          const parent = el.closest('section, div')
          return parent && (
            parent.textContent.includes('Explorez') ||
            parent.textContent.includes('Services liés') ||
            parent.textContent.includes('Voir aussi') ||
            parent.className?.includes('related') ||
            parent.className?.includes('Related')
          )
        })
        .map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
        .filter(l => l.text && l.text.length > 2)
    )

    const total = lpLinks.length + seoLinks.length
    const status = total >= 6 ? '✅' : total >= 3 ? '⚠️' : '❌'

    console.log(`${status} [${p.name}] lp-cards: ${lpLinks.length} | seo-links: ${seoLinks.length} | total: ${total}`)
    if (lpLinks.length > 0) {
      console.log(`   LP: ${lpLinks.slice(0, 5).join(' | ')}`)
    }
    if (seoLinks.length > 0) {
      console.log(`   SEO: ${seoLinks.slice(0, 4).map(l => l.text).join(' | ')}`)
    }
    if (total === 0) {
      console.log(`   ⚠️  Aucun lien de maillage trouvé`)
    }
  } catch (err) {
    console.log(`❌ [${p.name}] ERREUR: ${err.message}`)
  }
}

await browser.close()
console.log('\nVérification terminée.')
