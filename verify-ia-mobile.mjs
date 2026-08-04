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

const dropdowns = await page.evaluate(() =>
  [...document.querySelectorAll('.mob-menu .mob-sol-hd')].map((b, i) => ({ i, label: b.textContent.trim() }))
)
console.log('Boutons dropdown :', dropdowns.map(b => `[${b.i}] ${b.label}`).join(' | '))

await page.screenshot({ path: 'verify-ia-dropdown-closed.png' })

const allBtns = await page.$$('.mob-menu .mob-sol-hd')
console.log('Nombre de boutons dropdown :', allBtns.length)

if (allBtns.length >= 2) {
  // Clic sur bouton IA (index 1)
  await allBtns[1].click()
  await page.waitForTimeout(400)

  const iaOpen = await page.evaluate(() =>
    document.querySelectorAll('.mob-menu .mob-sol-hd')[1]?.classList.contains('open')
  )

  const subItems = await page.evaluate(() =>
    [...document.querySelectorAll('.mob-menu .mob-dd-item')].map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href'),
    }))
  )

  console.log('\nDropdown IA ouvert :', iaOpen ? '✅ oui' : '❌ non')
  console.log('Sous-items visibles :')
  subItems.forEach(item => console.log(`  - "${item.text}" → ${item.href}`))

  const expected = ['/collaborateurs-ia', '/automatisations', '/loic']
  const hrefs = subItems.map(i => i.href)
  const allOk = expected.every(h => hrefs.includes(h))
  console.log('\nLiens corrects :', allOk ? '✅ tous présents' : '⚠️  manquants : ' + expected.filter(h => !hrefs.includes(h)).join(', '))

  await page.screenshot({ path: 'verify-ia-dropdown-open.png' })
} else {
  console.log('❌ Bouton IA non trouvé')
}

await browser.close()
console.log('\n✅ Terminé.')
