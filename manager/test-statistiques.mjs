import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/manager'
const SHOT = (name) => `manager/test-stats-${name}.png`

async function shot(page, name) {
  await page.screenshot({ path: SHOT(name), fullPage: false })
  console.log(`📸 ${name}`)
}

const browser = await chromium.launch({ headless: false, slowMo: 300 })
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })
page.setDefaultTimeout(15_000)

try {
  // ── 1. Navigate ────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/prospection/statistiques`)
  await page.waitForLoadState('networkidle')
  await shot(page, '01-page-chargee')
  console.log('✅ Page Statistiques chargée')

  // ── 2. KPI cards ───────────────────────────────────────────────────────────
  const kpiLabels = ['Prospects', 'Emails envoyés', 'Taux de réponse', 'Taux de conversion']
  for (const lbl of kpiLabels) {
    const el = page.locator(`text=${lbl}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} KPI "${lbl}"`)
  }
  await shot(page, '02-kpi-cards')

  // ── 3. Period filter ───────────────────────────────────────────────────────
  const periodBtns = ['7 jours', '30 jours', 'Tout']
  for (const lbl of periodBtns) {
    const btn = page.locator(`button:has-text("${lbl}")`).first()
    console.log(`  ${await btn.isVisible() ? '✅' : '❌'} Filtre "${lbl}"`)
  }

  // Click "7 jours"
  await page.locator('button:has-text("7 jours")').first().click()
  await page.waitForTimeout(400)
  await shot(page, '03-filtre-7j')
  console.log('✅ Filtre 7 jours appliqué')

  // Click "30 jours"
  await page.locator('button:has-text("30 jours")').first().click()
  await page.waitForTimeout(400)
  await shot(page, '04-filtre-30j')
  console.log('✅ Filtre 30 jours appliqué')

  // Back to "Tout"
  await page.locator('button:has-text("Tout")').first().click()
  await page.waitForTimeout(400)

  // ── 4. Section titles ──────────────────────────────────────────────────────
  const sections = [
    'Entonnoir de conversion',
    'Sources',
    'Distribution des scores',
    "Secteurs d'activité",
    'Emails',
    'Relances automatiques',
  ]
  for (const s of sections) {
    const el = page.locator(`text=${s}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} Section "${s}"`)
  }

  // ── 5. Charts present ──────────────────────────────────────────────────────
  // Recharts renders SVG elements
  const svgs = await page.locator('svg.recharts-surface').count()
  console.log(`  ${svgs > 0 ? '✅' : '❌'} ${svgs} graphique(s) Recharts rendu(s)`)

  // ── 6. Scroll through the full page ───────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 400))
  await page.waitForTimeout(300)
  await shot(page, '05-section-funnel-sources')

  await page.evaluate(() => window.scrollTo(0, 900))
  await page.waitForTimeout(300)
  await shot(page, '06-section-scores-industries')

  await page.evaluate(() => window.scrollTo(0, 1400))
  await page.waitForTimeout(300)
  await shot(page, '07-section-emails-relances')

  // Check if campaigns table is visible
  const campTable = page.locator('text=Détail des campagnes').first()
  if (await campTable.isVisible()) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    await shot(page, '08-section-campagnes')
    console.log('✅ Table campagnes visible')
  } else {
    console.log('ℹ️  Pas de campagnes (table masquée — normal si 0 campagne)')
  }

  // ── 7. KPI values check ────────────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)

  // Read KPI values by looking at large bold numbers near each label
  const allBoldNums = await page.locator('.text-2xl.font-bold').allTextContents()
  console.log(`  Valeurs KPI : ${allBoldNums.join(' | ')}`)
  console.log(`  ${allBoldNums.length >= 4 ? '✅' : '❌'} 4 KPI cards avec valeurs`)

  // ── 8. Check for "Entonnoir" chart bars ────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(400)
  const funnelBars = await page.locator('.recharts-bar-rectangle').count()
  console.log(`  ${funnelBars > 0 ? '✅' : '❌'} ${funnelBars} barre(s) dans les graphiques`)

  // ── 9. Check empty state or actual data ────────────────────────────────────
  const emptyTexts = await page.locator('text=Aucun prospect pour cette période').count()
  const hasData    = await page.locator('.recharts-bar-rectangle').count() > 0
  if (hasData) {
    console.log('✅ Données réelles affichées dans les graphiques')
  } else if (emptyTexts > 0) {
    console.log('ℹ️  État vide affiché (normal sans prospects)')
  }

  // Final full-page screenshot
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await shot(page, '09-vue-globale')

  console.log('\n🎉 Page Statistiques testée avec succès !')

} catch (err) {
  console.error('❌ Erreur:', err.message)
  await page.screenshot({ path: 'manager/test-stats-ERROR.png', fullPage: false })
} finally {
  await browser.close()
}
