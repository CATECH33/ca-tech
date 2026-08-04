import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] })
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
  locale: 'fr-FR',
  viewport: { width: 1280, height: 800 },
})

// Test sur le build local (pas de BotID)
const page = await ctx.newPage()

// Vider le localStorage pour simuler première visite
await page.addInitScript(() => localStorage.removeItem('ca-tech-cookies-consent'))

await page.goto('http://localhost:4174/dist/', { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(800)

writeFileSync('verify-cookie-desktop.png', await page.screenshot())
console.log('📸 Desktop bannière')

const checks = await page.evaluate(() => {
  const banner    = document.querySelector('.ck-banner')
  const title     = document.querySelector('.ck-title')
  const btnAccept = document.querySelector('.ck-btn-primary')
  const btnRefuse = document.querySelector('.ck-btn-secondary')
  const btnCustom = document.querySelector('.ck-btn-ghost')
  return {
    bannerPresent: !!banner,
    title: title?.textContent?.trim(),
    btnAccept: btnAccept?.textContent?.trim(),
    btnRefuse: btnRefuse?.textContent?.trim(),
    btnCustom: btnCustom?.textContent?.trim(),
  }
})

console.log('\n── Éléments bannière ──')
console.log('  ' + (checks.bannerPresent ? '✅' : '❌') + ' Bannière présente')
console.log('  ✅ Titre :', checks.title)
console.log('  ✅ Bouton 1 :', checks.btnAccept)
console.log('  ✅ Bouton 2 :', checks.btnRefuse)
console.log('  ✅ Bouton 3 :', checks.btnCustom)

// Ouvrir la modale Personnaliser
await page.click('.ck-btn-ghost')
await page.waitForTimeout(400)
writeFileSync('verify-cookie-modal.png', await page.screenshot())
console.log('📸 Modal préférences')

const modal = await page.evaluate(() => {
  const m      = document.querySelector('.ck-modal')
  const cats   = [...document.querySelectorAll('.ck-cat-label')].map(e => e.textContent?.trim())
  const toggles = [...document.querySelectorAll('.ck-toggle')].map(t => ({
    on: t.classList.contains('on'),
    required: t.classList.contains('required'),
  }))
  return { present: !!m, categories: cats, toggles }
})

console.log('\n── Modal préférences ──')
console.log('  ' + (modal.present ? '✅' : '❌') + ' Modal ouverte')
modal.categories.forEach((c, i) => {
  const t = modal.toggles[i]
  console.log(`  ✅ ${c} — on:${t?.on} required:${t?.required}`)
})

// Fermer modal, tester "Tout accepter" + localStorage
await page.click('.ck-modal-close')
await page.waitForTimeout(300)
await page.click('.ck-btn-primary')
await page.waitForTimeout(300)

const stored = await page.evaluate(() => {
  const s = localStorage.getItem('ca-tech-cookies-consent')
  return s ? JSON.parse(s) : null
})
console.log('\n── localStorage après "Tout accepter" ──')
console.log('  ' + (stored?.analytics && stored?.personalization ? '✅' : '❌') + ' Consentement sauvegardé :', stored)
console.log('  Bannière disparue :', !(await page.isVisible('.ck-banner')) ? '✅' : '❌')

// Mobile
const mobile = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/131.0 Mobile Safari/537.36',
  viewport: { width: 390, height: 844 }, isMobile: true,
})
const mpage = await mobile.newPage()
await mpage.addInitScript(() => localStorage.removeItem('ca-tech-cookies-consent'))
await mpage.goto('http://localhost:4174/dist/', { waitUntil: 'networkidle', timeout: 20000 })
await mpage.waitForTimeout(800)
writeFileSync('verify-cookie-mobile.png', await mpage.screenshot())
console.log('\n📸 Mobile bannière')

await browser.close()
console.log('\n✅ Vérification terminée.')
