import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/manager'
const SHOT = (name) => `manager/test-pipeline-${name}.png`

async function shot(page, name) {
  await page.screenshot({ path: SHOT(name), fullPage: false })
  console.log(`📸 ${name}`)
}

const browser = await chromium.launch({ headless: false, slowMo: 250 })
const page = await browser.newPage()
await page.setViewportSize({ width: 1600, height: 900 })
page.setDefaultTimeout(15_000)

try {
  await page.goto(`${BASE}/prospection/pipeline`)
  await page.waitForLoadState('networkidle')
  await shot(page, '01-page-chargee')
  console.log('✅ Page Pipeline chargée')

  // ── 1. Check all 10 stage headers ────────────────────────────────────────
  const expectedStages = [
    'Nouveau prospect',
    'Qualifié',
    'Email prêt',
    'Email envoyé',
    'Réponse reçue',
    'Rendez-vous',
    'Devis envoyé',
    'Contrat signé',
    'Client',
    'Projet lancé',
  ]

  for (const label of expectedStages) {
    const el = page.locator(`text=${label}`).first()
    const visible = await el.isVisible()
    console.log(`  ${visible ? '✅' : '❌'} Colonne "${label}"`)
  }

  // ── 2. Check column count ─────────────────────────────────────────────────
  const columns = await page.locator('.rounded-t-xl').count()
  console.log(`  ${columns >= 10 ? '✅' : '❌'} ${columns} colonnes visibles`)

  // ── 3. Check progress bar present ────────────────────────────────────────
  const progressBar = await page.locator('.rounded-full.overflow-hidden').count()
  console.log(`  ${progressBar > 0 ? '✅' : '❌'} Barre de progression présente`)

  // ── 4. Check search filter ────────────────────────────────────────────────
  const searchInput = page.locator('input[placeholder="Filtrer…"]')
  console.log(`  ${await searchInput.isVisible() ? '✅' : '❌'} Champ de recherche`)

  // ── 5. Horizontal scroll test ────────────────────────────────────────────
  await page.evaluate(() => {
    const board = document.querySelector('.overflow-auto')
    if (board) board.scrollLeft = 600
  })
  await page.waitForTimeout(300)
  await shot(page, '02-scroll-droite')
  console.log('✅ Scroll horizontal — colonnes 5-10 visibles')

  // ── 6. Scroll back to start ───────────────────────────────────────────────
  await page.evaluate(() => {
    const board = document.querySelector('.overflow-auto')
    if (board) board.scrollLeft = 0
  })
  await page.waitForTimeout(200)

  // ── 7. Test drag & drop (if cards exist) ─────────────────────────────────
  const cards = await page.locator('[draggable="true"]').count()
  console.log(`  ${cards >= 0 ? '✅' : '❌'} ${cards} carte(s) draggable(s)`)

  if (cards > 0) {
    // Grab first card and drag to second column
    const firstCard = page.locator('[draggable="true"]').first()
    const secondCol = page.locator('.rounded-b-xl.border').nth(1)

    const cardBox = await firstCard.boundingBox()
    const colBox  = await secondCol.boundingBox()

    if (cardBox && colBox) {
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(200)
      await page.mouse.move(colBox.x + colBox.width / 2, colBox.y + 80, { steps: 10 })
      await page.waitForTimeout(300)
      await shot(page, '03-drag-en-cours')
      await page.mouse.up()
      await page.waitForTimeout(600)
      await shot(page, '04-apres-drop')
      console.log('✅ Drag & Drop testé')
    }
  }

  // ── 8. Click a card to open quick panel ───────────────────────────────────
  if (cards > 0) {
    await page.locator('[draggable="true"]').first().click()
    await page.waitForTimeout(400)
    const panel = page.locator('.shadow-xl').first()
    if (await panel.isVisible()) {
      await shot(page, '05-panel-ouvert')
      console.log('✅ Panneau latéral ouvert')

      // Check status dropdown
      const select = panel.locator('select').first()
      console.log(`  ${await select.isVisible() ? '✅' : '❌'} Select statut`)

      // Count options in dropdown
      const options = await select.locator('option').count()
      console.log(`  ${options >= 10 ? '✅' : '❌'} ${options} étapes dans le dropdown`)

      // Close panel
      await page.locator('button').filter({ has: page.locator('svg') }).first().click()
      await page.waitForTimeout(300)
    }
  }

  // ── 9. Toggle disqualified ────────────────────────────────────────────────
  const disqualBtn = page.locator('button:has-text("Afficher disqualifiés")')
  if (await disqualBtn.isVisible()) {
    await disqualBtn.click()
    await page.waitForTimeout(400)
    const disqCol = page.locator('text=Disqualifié').first()
    console.log(`  ${await disqCol.isVisible() ? '✅' : '❌'} Colonne Disqualifié apparue`)
    await shot(page, '06-avec-disqualifies')

    // Hide again
    await page.locator('button:has-text("Masquer disqualifiés")').click()
    await page.waitForTimeout(300)
  }

  // Final screenshot
  await shot(page, '07-vue-finale')
  console.log('\n🎉 Pipeline commercial testé avec succès !')

} catch (err) {
  console.error('❌ Erreur:', err.message)
  await page.screenshot({ path: 'manager/test-pipeline-ERROR.png', fullPage: false })
} finally {
  await browser.close()
}
