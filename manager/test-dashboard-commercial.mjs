import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/manager'
const SHOT = (name) => `manager/test-dashboard-commercial-${name}.png`

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
  // ── 1. Page principale ─────────────────────────────────────────────────
  await page.goto(`${BASE}/prospection`)
  await page.waitForLoadState('networkidle')
  await shot(page, '01-hero')
  console.log('✅ Tableau de bord commercial chargé')

  // ── 2. KPI Row 1 ────────────────────────────────────────────────────────
  const kpi1 = ['Prospects actifs', 'Emails préparés', 'Emails envoyés', "Taux d'ouverture", 'Réponses reçues']
  for (const lbl of kpi1) {
    const el = page.locator(`text=${lbl}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} KPI "${lbl}"`)
  }
  await shot(page, '02-kpi-row1')

  // ── 3. KPI Row 2 ────────────────────────────────────────────────────────
  const kpi2 = ['Rendez-vous', 'Devis', 'Contrats signés', 'Clients', 'CA potentiel']
  for (const lbl of kpi2) {
    const el = page.locator(`text=${lbl}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} KPI "${lbl}"`)
  }
  await shot(page, '03-kpi-row2')

  // ── 4. Sections ─────────────────────────────────────────────────────────
  const sections = ['Entonnoir commercial', "Activité — 30 jours", 'CA potentiel', 'Taux de conversion', 'Activité récente']
  for (const s of sections) {
    const el = page.locator(`text=${s}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} Section "${s}"`)
  }

  // ── 5. Scroll to see funnel ──────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 320))
  await page.waitForTimeout(400)
  await shot(page, '04-funnel-area')

  // Check funnel stage labels
  const funnelLabels = ['Nouveau prospect', 'Qualifié', 'Email prêt', 'Email envoyé',
    'Réponse reçue', 'Rendez-vous', 'Devis envoyé', 'Contrat signé', 'Client', 'Projet lancé']
  const funnelVisible = []
  for (const lbl of funnelLabels) {
    const el = page.locator(`text=${lbl}`).first()
    if (await el.isVisible()) funnelVisible.push(lbl)
  }
  console.log(`  ${funnelVisible.length >= 10 ? '✅' : '❌'} ${funnelVisible.length}/10 étapes funnel visibles`)

  // ── 6. Scroll to charts row ──────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 800))
  await page.waitForTimeout(400)
  await shot(page, '05-charts-row')

  // Check conversion steps
  const convSteps = ['Prospect → Email envoyé', 'Email → Réponse', 'Réponse → RDV', 'RDV → Devis']
  for (const s of convSteps) {
    const el = page.locator(`text=${s}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} "${s}"`)
  }

  // ── 7. Scroll to quick actions ───────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  await shot(page, '06-quick-actions')

  // Check quick action buttons
  const quickActions = ['Pipeline', 'Brouillons', 'Relances', 'Campagnes', 'Statistiques']
  for (const lbl of quickActions) {
    const btn = page.locator(`button:has-text("${lbl}")`).first()
    console.log(`  ${await btn.isVisible() ? '✅' : '❌'} Accès rapide "${lbl}"`)
  }

  // ── 8. Check live indicator ──────────────────────────────────────────────
  const liveIndicator = page.locator('text=En direct').first()
  console.log(`  ${await liveIndicator.isVisible() ? '✅' : '❌'} Indicateur temps réel`)

  // Check realtime footer
  const rtFooter = page.locator('text=Supabase Realtime').first()
  console.log(`  ${await rtFooter.isVisible() ? '✅' : '❌'} Footer Supabase Realtime`)

  // ── 9. Recharts SVGs ─────────────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const svgs = await page.locator('svg.recharts-surface').count()
  console.log(`  ${svgs > 0 ? '✅' : '❌'} ${svgs} graphique(s) Recharts rendus`)

  // ── 10. Quick action navigation test ────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(200)
  const pipelineBtn = page.locator('button:has-text("Pipeline")').last()
  if (await pipelineBtn.isVisible()) {
    await pipelineBtn.click()
    await page.waitForLoadState('networkidle')
    console.log(`  ${page.url().includes('pipeline') ? '✅' : '❌'} Navigation Pipeline OK`)
    await page.goBack()
    await page.waitForLoadState('networkidle')
  }

  // Final screenshot
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await shot(page, '07-vue-finale')

  console.log('\n🎉 Tableau de bord commercial testé avec succès !')

} catch (err) {
  console.error('❌ Erreur:', err.message)
  await page.screenshot({ path: 'manager/test-dashboard-commercial-ERROR.png', fullPage: false })
} finally {
  await browser.close()
}
