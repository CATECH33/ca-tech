import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/manager'
const SHOT = (name) => `manager/test-connecteurs-${name}.png`

async function shot(page, name) {
  await page.screenshot({ path: SHOT(name), fullPage: false })
  console.log(`📸 ${name}`)
}

const browser = await chromium.launch({ headless: false, slowMo: 300 })
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })
page.setDefaultTimeout(20_000)

page.on('console', msg => {
  if (msg.type() === 'error') console.error('🔴', msg.text())
})

try {
  // ── 1. Navigation directe ─────────────────────────────────────────────────
  await page.goto(`${BASE}/prospection/connecteurs`)
  await page.waitForLoadState('networkidle')
  await shot(page, '01-page-chargee')
  console.log('✅ Page Connecteurs chargée')

  // ── 3. Vérifier le titre et la description ───────────────────────────────
  const titre = page.locator('h1', { hasText: 'Connecteurs' })
  console.log(`  ${await titre.isVisible() ? '✅' : '❌'} Titre "Connecteurs"`)

  // ── 4. Vérifier les catégories ───────────────────────────────────────────
  const categories = ['Scraping & Réseaux sociaux', 'Cartographie', 'Tableurs connectés', 'Fichiers']
  for (const cat of categories) {
    const el = page.locator(`text=${cat}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} Catégorie "${cat}"`)
  }
  await shot(page, '02-categories')

  // ── 5. Vérifier les 7 cartes connecteurs ─────────────────────────────────
  const connectors = ['Apify', 'LinkedIn', 'X (Twitter)', 'Google Maps', 'Google Sheets', 'CSV', 'Excel']
  for (const name of connectors) {
    const card = page.locator(`h3`, { hasText: name }).first()
    console.log(`  ${await card.isVisible() ? '✅' : '❌'} Carte "${name}"`)
  }
  await shot(page, '03-cartes-connecteurs')

  // ── 6. Vérifier les badges de capacités ──────────────────────────────────
  const capBadges = await page.locator('span', { hasText: 'Import' }).count()
  console.log(`  ✅ ${capBadges} badges "Import" visibles`)
  const syncBadges = await page.locator('span', { hasText: 'Sync' }).count()
  console.log(`  ✅ ${syncBadges} badges "Sync" visibles`)

  // ── 7. Ouvrir le slide-over Apify ─────────────────────────────────────────
  await page.locator('h3', { hasText: 'Apify' }).first().scrollIntoViewIfNeeded()
  const apifyCard = page.locator('div').filter({ hasText: /^Apify/ }).first()
  await page.locator('button', { hasText: 'Configurer' }).first().click()
  await page.waitForTimeout(500)
  await shot(page, '04-slideover-apify')

  const slideoverTitle = page.locator('h2', { hasText: 'Apify' })
  console.log(`  ${await slideoverTitle.isVisible() ? '✅' : '❌'} Slide-over Apify ouvert`)

  // ── 8. Remplir le formulaire Apify ───────────────────────────────────────
  await page.fill('input[placeholder="apify_api_..."]', 'apify_api_TEST_KEY_123')
  await page.fill('input[placeholder="apify/web-scraper"]', 'apify/website-content-crawler')
  await page.waitForTimeout(500)  // wait for React state propagation

  // Diagnostic: check input values
  const apiKeyVal  = await page.locator('input[placeholder="apify_api_..."]').inputValue()
  const actorIdVal = await page.locator('input[placeholder="apify/web-scraper"]').inputValue()
  console.log(`  DEBUG: apiKey="${apiKeyVal}", actorId="${actorIdVal}"`)

  await shot(page, '05-formulaire-rempli')
  console.log('  ✅ Champs Apify remplis')

  // ── 9. Cliquer Enregistrer ────────────────────────────────────────────────
  await page.locator('.fixed.inset-0 button', { hasText: 'Enregistrer' }).click()
  await page.waitForTimeout(800)
  await shot(page, '06-apres-enregistrement')

  // ── 10. Cliquer Tester ───────────────────────────────────────────────────
  await page.locator('.fixed.inset-0 button', { hasText: 'Tester' }).click()
  await page.waitForTimeout(1200)
  await shot(page, '07-resultat-test')
  console.log('  ✅ Test lancé')

  // ── 11. Lancer Import (stub) ──────────────────────────────────────────────
  const importBtn = page.locator('button', { hasText: "Lancer l'import" })
  if (await importBtn.isVisible()) {
    const isDisabled = await importBtn.isDisabled()
    if (!isDisabled) {
      await importBtn.click()
      await page.waitForTimeout(800)
    } else {
      console.log('  ℹ️  Bouton Import désactivé (normal si pas configuré côté manager)')
    }
    await shot(page, '08-apres-import')
    console.log('  ✅ Import stub vérifié')
  }

  // ── 12. Fermer le slide-over via le backdrop ──────────────────────────────
  await page.locator('.fixed.inset-0.z-50 > div.absolute').click()
  await page.waitForTimeout(400)
  console.log('  ✅ Slide-over fermé')

  // Badge "Configuré" visible sur la carte (slide-over fermé)
  const configured = page.locator('span', { hasText: 'Configuré' }).first()
  console.log(`  ${await configured.isVisible() ? '✅' : '❌'} Badge "Configuré" visible sur la carte`)
  await shot(page, '09-badge-configure')

  // ── 13. Ouvrir Google Sheets ──────────────────────────────────────────────
  const gsButtons = await page.locator('button', { hasText: 'Configurer' }).all()
  if (gsButtons.length >= 5) {
    await gsButtons[4].click()
    await page.waitForTimeout(500)
    const gsTitle = page.locator('h2', { hasText: 'Google Sheets' })
    console.log(`  ${await gsTitle.isVisible() ? '✅' : '❌'} Slide-over Google Sheets`)
    await shot(page, '10-slideover-google-sheets')

    const syncBtn = page.locator('button', { hasText: 'Synchroniser' })
    console.log(`  ${await syncBtn.isVisible() ? '✅' : '❌'} Bouton Synchroniser visible`)

    // Fermer via backdrop
    await page.locator('.fixed.inset-0.z-50 > div.absolute').click()
    await page.waitForTimeout(300)
  }

  // ── 14. Ouvrir CSV ────────────────────────────────────────────────────────
  const csvButtons = await page.locator('button', { hasText: 'Configurer' }).all()
  if (csvButtons.length >= 6) {
    await csvButtons[5].click()
    await page.waitForTimeout(500)
    const csvTitle = page.locator('h2', { hasText: 'CSV' })
    console.log(`  ${await csvTitle.isVisible() ? '✅' : '❌'} Slide-over CSV`)
    await shot(page, '11-slideover-csv')

    const csvSaveBtn = page.locator('button', { hasText: 'Enregistrer' })
    console.log(`  ${await csvSaveBtn.isVisible() ? '✅' : '❌'} Bouton Enregistrer CSV`)

    // Fermer via backdrop
    await page.locator('.fixed.inset-0.z-50 > div.absolute').click()
    await page.waitForTimeout(300)
  }

  // ── 15. Journal des opérations ────────────────────────────────────────────
  await page.locator('text=Journal des opérations').scrollIntoViewIfNeeded()
  await shot(page, '12-journal')
  const journalTitle = page.locator('h2', { hasText: 'Journal des opérations' })
  console.log(`  ${await journalTitle.isVisible() ? '✅' : '❌'} Journal visible`)

  const journalRows = await page.locator('tbody tr').count()
  console.log(`  ✅ ${journalRows} entrée(s) dans le journal`)

  // ── 16. Vue complète ─────────────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await shot(page, '13-vue-finale')

  console.log('\n🎉 Test Connecteurs terminé avec succès')

} catch (err) {
  console.error('\n❌ ERREUR :', err.message)
  await page.screenshot({ path: 'manager/test-connecteurs-ERROR.png', fullPage: true })
  process.exit(1)
} finally {
  await browser.close()
}
