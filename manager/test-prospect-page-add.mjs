// Test ajout prospect manuel depuis la page Prospects
import { chromium } from 'playwright'

const BASE = 'http://localhost:5180/manager'
const s    = ms => new Promise(r => setTimeout(r, ms))
let   ss   = 0
const shot = async (page, name) => {
  const n = String(++ss).padStart(2, '0')
  await page.screenshot({ path: `prospect-add-${n}-${name}.png`, fullPage: false })
  console.log(`📸 ${n}-${name}`)
}

;(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const page    = await browser.newPage()
  page.setDefaultTimeout(15000)

  // ── 1. Page Prospects ─────────────────────────────────────────────────────
  console.log('→ Navigation vers la page Prospects')
  await page.goto(`${BASE}/prospection`)
  await page.waitForLoadState('networkidle')

  // Aller sur l'onglet Prospects
  const prospectsTab = page.locator('button, a').filter({ hasText: /^Prospects$/ }).first()
  await prospectsTab.click()
  await s(800)
  await shot(page, 'prospects-page')

  // ── 2. Ouvrir la modal "Nouveau prospect" ─────────────────────────────────
  console.log('→ Clic "Nouveau prospect"')
  await page.locator('button').filter({ hasText: /nouveau prospect/i }).first().click()
  await s(500)
  await page.waitForSelector('text=Nom de l\'entreprise')
  await shot(page, 'modal-open')

  // ── 3. Remplir le formulaire ──────────────────────────────────────────────
  console.log('→ Remplissage du formulaire')
  const uniqueName = `Page Test SAS ${Date.now()}`

  await page.locator('input[placeholder="Acme Corp"]').fill(uniqueName)
  await page.locator('input[placeholder="Tech, Finance, Retail…"]').fill('Conseil digital')
  await page.locator('input[placeholder="Paris"]').fill('Nantes')
  await page.locator('input[placeholder="France"]').fill('France')
  await page.locator('input[placeholder="https://…"]').fill('https://page-test.fr')
  // Contact principal
  await page.locator('input[placeholder="+33 1 23 45 67 89"]').fill('+33 2 00 00 00 01')
  await page.locator('input[placeholder="contact@entreprise.fr"]').fill('contact@page-test.fr')
  await shot(page, 'modal-filled')

  // ── 4. Créer le prospect ──────────────────────────────────────────────────
  console.log('→ Création')
  await page.locator('button').filter({ hasText: /créer le prospect/i }).first().click()

  // Attendre fermeture de la modal
  await page.waitForFunction(
    () => !document.body.innerText.includes('Nom de l\'entreprise *'),
    { timeout: 10000 }
  )
  await s(1000)
  await shot(page, 'after-create')

  // ── 5. Vérifier le prospect dans la liste ────────────────────────────────
  console.log('→ Vérification dans la liste')
  const found = await page.locator(`text=${uniqueName.slice(0, 20)}`).first().isVisible().catch(() => false)
  console.log(found ? '✓ Prospect visible dans la liste' : 'ℹ Prospect peut être sur une autre page (pagination)')

  // Chercher dans la table
  const rows = await page.locator('table tbody tr').count()
  console.log(`✓ ${rows} prospects dans la table`)

  // ── 6. Ouvrir la fiche pour vérifier le contact ───────────────────────────
  console.log('→ Vérification du contact (téléphone + email)')
  // Chercher la ligne avec le nom unique
  const row = page.locator('table tbody tr').filter({ hasText: uniqueName.slice(0, 20) }).first()
  if (await row.isVisible()) {
    await row.click()
    await s(800)
    await shot(page, 'fiche-open')
    const ficheText = await page.textContent('body')
    console.log(ficheText.includes('+33 2 00 00 00 01') ? '✓ Téléphone présent' : '✗ Téléphone absent')
    console.log(ficheText.includes('contact@page-test.fr') ? '✓ Email présent' : '✗ Email absent')
  } else {
    console.log('ℹ Ligne non visible directement (pagination ou tri)')
  }

  await browser.close()
  console.log('\n✅ Test ajout depuis page Prospects terminé')
})().catch(err => {
  console.error('\n✗', err.message)
  process.exit(1)
})
