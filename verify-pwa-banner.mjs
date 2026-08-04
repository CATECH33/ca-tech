import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const BASE = 'https://www.ca-tech.fr'

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-blink-features=AutomationControlled'],
})
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  locale: 'fr-FR',
  viewport: { width: 390, height: 844 },
  isMobile: true,
})

const page = await ctx.newPage()

// Clear localStorage so dismiss state is clean
await page.addInitScript(() => {
  localStorage.removeItem('ca-tech-pwa-later')
})

console.log('── Chargement de la page ──')
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })

// Screenshot avant scroll
writeFileSync('verify-banner-0-initial.png', await page.screenshot({ fullPage: false }))
console.log('  📸 screenshot initial')

// Scroll 30% de la hauteur pour déclencher la bannière
const scrollY = await page.evaluate(() => window.innerHeight * 0.30)
await page.evaluate(y => window.scrollBy(0, y), scrollY)
console.log(`  ↓ scroll ${Math.round(scrollY)}px`)

// Attendre l'apparition de la bannière
try {
  await page.waitForSelector('.pwa-overlay', { timeout: 5000 })
  console.log('  ✅ .pwa-overlay détecté')
} catch {
  console.log('  ⚠️  .pwa-overlay absent après scroll — attente 16s (timer fallback)')
  await page.waitForTimeout(16000)
}

// Screenshot avec bannière
writeFileSync('verify-banner-1-banner.png', await page.screenshot({ fullPage: false }))
console.log('  📸 screenshot bannière')

// Vérifier les éléments
const checks = await page.evaluate(() => {
  const banner   = document.querySelector('.pwa-banner')
  const logo     = document.querySelector('.pwa-logo img')
  const title    = document.querySelector('.pwa-title')
  const desc     = document.querySelector('.pwa-desc')
  const btnInst  = document.querySelector('.pwa-btn-install')
  const btnLater = document.querySelector('.pwa-btn-later')
  const closeBtn = document.querySelector('.pwa-close')

  return {
    bannerPresent:      !!banner,
    logoPresent:        !!logo,
    titleText:          title?.textContent?.trim() ?? null,
    descPresent:        !!desc,
    installBtnText:     btnInst?.textContent?.trim() ?? null,
    laterBtnText:       btnLater?.textContent?.trim() ?? null,
    closeBtnPresent:    !!closeBtn,
    bannerClasses:      banner?.className ?? null,
  }
})

console.log('\n── Éléments bannière ──')
const items = [
  ['bannerPresent',   checks.bannerPresent],
  ['logoPresent',     checks.logoPresent],
  ['titleText',       checks.titleText],
  ['descPresent',     checks.descPresent],
  ['installBtnText',  checks.installBtnText],
  ['laterBtnText',    checks.laterBtnText],
  ['closeBtnPresent', checks.closeBtnPresent],
]
for (const [k, v] of items) {
  const ok = v !== null && v !== false
  console.log(`  ${ok ? '✅' : '❌'} ${k.padEnd(18)} : ${v}`)
}

// Cliquer sur Installer → vue instructions
if (checks.bannerPresent) {
  await page.click('.pwa-btn-install')
  await page.waitForTimeout(400)
  writeFileSync('verify-banner-2-instructions.png', await page.screenshot({ fullPage: false }))
  console.log('\n📸 screenshot instructions plateforme')

  const instr = await page.evaluate(() => {
    const icon  = document.querySelector('.pwa-instr-icon')
    const title = document.querySelector('.pwa-instr-title')
    const steps = [...document.querySelectorAll('.pwa-step')]
    return {
      icon:       icon?.textContent?.trim() ?? null,
      title:      title?.textContent?.trim() ?? null,
      stepsCount: steps.length,
    }
  })
  console.log(`  ✅ Vue instructions — ${instr.title} (${instr.stepsCount} étapes) ${instr.icon}`)

  // Retour + fermer via "Plus tard"
  await page.click('.pwa-close')
  await page.waitForTimeout(300)
  await page.click('.pwa-btn-later').catch(() => {})
}

// Vérifier dismiss localStorage
const stored = await page.evaluate(() => localStorage.getItem('ca-tech-pwa-later'))
console.log(`\n  ${stored ? '✅' : '❌'} localStorage dismiss : ${stored ? 'stocké (' + stored + ')' : 'absent'}`)

await browser.close()
console.log('\n✅ Vérification bannière PWA terminée.')
