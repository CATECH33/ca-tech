import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] })
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  locale: 'fr-FR',
})
const page = await ctx.newPage()
await page.setViewportSize({ width: 375, height: 812 })
await page.goto('https://www.ca-tech.fr', { waitUntil: 'domcontentloaded', timeout: 25000 })
await page.waitForFunction(() => !!document.querySelector('.ham'), { timeout: 10000 }).catch(() => {})

// Ouvrir hamburger
await page.click('.ham')
await page.waitForTimeout(400)
await page.screenshot({ path: 'verify-sol-closed.png' })

const allBtns = await page.$$('.mob-menu .mob-sol-hd')
console.log('Boutons dropdown :', allBtns.length)

// Clic sur Solutions (index 0)
await allBtns[0].click()
await page.waitForTimeout(400)

const solOpen = await page.evaluate(() =>
  document.querySelectorAll('.mob-menu .mob-sol-hd')[0]?.classList.contains('open')
)

const subItems = await page.evaluate(() =>
  [...document.querySelectorAll('.mob-menu .mob-dd-item')].map(a => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href'),
  }))
)

console.log('Dropdown Solutions ouvert :', solOpen ? '✅ oui' : '❌ non')
console.log('Sous-items visibles :')
subItems.forEach(item => console.log(`  - "${item.text}" → ${item.href}`))

const expected = [
  { label: 'Création de site Web', href: '/creation-site-vitrine' },
  { label: 'Applications Métier',  href: '/services#apps' },
  { label: 'CRM sur mesure',       href: '/services#apps' },
  { label: 'SEO & Visibilité',     href: '/services#seo' },
  { label: 'Maintenance',          href: '/maintenance-site-web' },
]
const texts = subItems.map(i => i.text)
const missing = expected.filter(e => !texts.includes(e.label))
console.log('\nItems attendus :', missing.length === 0 ? '✅ tous présents' : '❌ manquants : ' + missing.map(e => e.label).join(', '))
console.log('Nombre         :', subItems.length === 5 ? `✅ ${subItems.length}/5` : `⚠️  ${subItems.length}/5`)

await page.screenshot({ path: 'verify-sol-open.png' })
await browser.close()
console.log('\n✅ Terminé.')
