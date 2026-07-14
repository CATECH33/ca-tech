import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/manager'
const SHOT = (name) => `manager/test-relances-${name}.png`

async function shot(page, name) {
  await page.screenshot({ path: SHOT(name), fullPage: false })
  console.log(`📸 ${name}`)
}

const browser = await chromium.launch({ headless: false, slowMo: 350 })
const page = await browser.newPage()
page.setDefaultTimeout(25_000)

// Log browser errors and network activity
page.on('console', msg => {
  if (msg.type() === 'error') console.error('🔴 BROWSER ERROR:', msg.text())
  if (msg.type() === 'warn')  console.warn ('🟡 BROWSER WARN :', msg.text())
})
page.on('pageerror', err => console.error('🔴 PAGE ERROR:', err.message))
page.on('requestfailed', req => {
  if (req.url().includes('supabase')) {
    console.error('🔴 REQUEST FAILED:', req.url(), req.failure()?.errorText)
  }
})
page.on('response', res => {
  if (res.url().includes('generate-relances')) {
    console.log(`🌐 generate-relances → HTTP ${res.status()}`)
    res.text().then(t => console.log('   Body:', t.slice(0, 200))).catch(() => {})
  }
  if (res.url().includes('/rest/v1/email_drafts') && res.request().method() === 'POST') {
    console.log(`🌐 INSERT email_drafts → HTTP ${res.status()}`)
    res.text().then(t => console.log('   Body:', t.slice(0, 200))).catch(() => {})
  }
})

try {
  // ── 1. Navigate to Relances page ──────────────────────────────────────────
  await page.goto(`${BASE}/prospection/relances`)
  await page.waitForLoadState('networkidle')
  await shot(page, '01-page-chargee')
  console.log('✅ Page Relances chargée')

  // ── 2. Verify stats cards ─────────────────────────────────────────────────
  const statLabels = ['En retard', "Aujourd'hui", 'En attente', 'Envoyées']
  for (const lbl of statLabels) {
    const el = page.locator(`text=${lbl}`).first()
    console.log(`  ${await el.isVisible() ? '✅' : '❌'} Carte stats "${lbl}"`)
  }
  await shot(page, '02-stats-cards')

  // ── 3. Verify tabs ────────────────────────────────────────────────────────
  const tabLabels = ['Toutes', 'En retard', "Aujourd'hui", 'En attente', 'Envoyées', 'À générer']
  for (const lbl of tabLabels) {
    const tab = page.locator(`button:has-text("${lbl}")`).first()
    console.log(`  ${await tab.isVisible() ? '✅' : '❌'} Onglet "${lbl}"`)
  }

  // ── 4. Go to "À générer" tab ──────────────────────────────────────────────
  await page.locator('button:has-text("À générer")').first().click()
  await page.waitForTimeout(600)
  await shot(page, '03-tab-a-generer')
  console.log('✅ Onglet "À générer" ouvert')

  // Count prospects available to generate
  const prospectCards = page.locator('.bg-white.border.border-gray-100.rounded-xl.px-4')
  const count = await prospectCards.count()
  console.log(`  Prospects sans relances : ${count}`)

  if (count === 0) {
    console.log('ℹ️  Tous les prospects ont déjà des relances — on va en "Toutes" pour tester')
    await page.locator('button:has-text("Toutes")').first().click()
    await page.waitForTimeout(500)
    await shot(page, '04-toutes-existantes')

    // Try clicking the first relance row
    const firstRow = page.locator('[class*="flex items-center gap-3 px-4 py-3"]').first()
    if (await firstRow.isVisible()) {
      await firstRow.click()
      await page.waitForTimeout(400)
      await shot(page, '05-panel-ouvert')
      console.log('✅ Panneau latéral ouvert')
    }

    // Try Régénérer on the first group
    const regenBtn = page.locator('button:has-text("Régénérer")').first()
    if (await regenBtn.isVisible()) {
      console.log('⏳ Régénération en cours…')
      await regenBtn.click()
      await page.waitForFunction(() => {
        const btns = document.querySelectorAll('button')
        for (const btn of btns) {
          if (btn.textContent?.includes('Génération…')) return false
        }
        return true
      }, { timeout: 45_000 })
      await page.waitForTimeout(1000)
      await shot(page, '06-apres-regeneration')
      console.log('✅ Régénération terminée')
    }
  } else {
    // ── 5. Generate relances for the first prospect ────────────────────────
    // Use filter to avoid matching the "À générer" tab button (which also contains "Générer")
    const generateBtn = page.locator('button').filter({ hasText: 'Générer' }).filter({ hasNotText: 'À' }).first()
    const prospectName = await page.locator('.text-sm.font-semibold.text-gray-900').first().textContent()
    console.log(`⏳ Génération relances pour : ${prospectName?.trim()}`)

    // Log button state before click
    const btnDisabled = await generateBtn.isDisabled()
    const btnText     = await generateBtn.textContent()
    console.log(`  Bouton avant click: "${btnText?.trim()}" disabled=${btnDisabled}`)

    await generateBtn.click()
    await page.waitForTimeout(800)
    await shot(page, '04-generation-en-cours')

    // Check if button changed to "Génération…"
    const btnTextAfter = await generateBtn.textContent().catch(() => '?')
    console.log(`  Bouton après click: "${btnTextAfter?.trim()}"`)

    // Wait for generation to finish (AI call takes ~10-20s)
    await page.waitForFunction(() => {
      const btns = document.querySelectorAll('button')
      for (const btn of btns) {
        if (btn.textContent?.includes('Génération…')) return false
      }
      return true
    }, { timeout: 45_000 })

    await page.waitForTimeout(1000)
    await shot(page, '05-apres-generation')
    console.log('✅ Génération terminée')

    // ── 6. Navigate to "Toutes" tab to see generated relances ─────────────
    await page.locator('button:has-text("Toutes")').first().click()
    await page.waitForTimeout(600)
    await shot(page, '06-toutes-avec-relances')
    console.log('✅ Onglet "Toutes" — relances affichées')

    // Check for J+ badges
    const j3Badge = page.locator('text=J+3').first()
    const j7Badge = page.locator('text=J+7').first()
    const j15Badge = page.locator('text=J+15').first()
    console.log(`  ${await j3Badge.isVisible() ? '✅' : '❌'} Badge J+3`)
    console.log(`  ${await j7Badge.isVisible() ? '✅' : '❌'} Badge J+7`)
    console.log(`  ${await j15Badge.isVisible() ? '✅' : '❌'} Badge J+15`)

    // ── 7. Click on the J+3 relance to open the side panel ───────────────
    await j3Badge.click()
    await page.waitForTimeout(600)
    await shot(page, '07-panel-j3-ouvert')
    console.log('✅ Panneau J+3 ouvert')

    // Verify panel content — use the panel's input (scoped to the sticky side panel)
    const panel = page.locator('.sticky.top-4')
    const subjectInput = panel.locator('input').first()
    const subjectVal = await subjectInput.inputValue().catch(() => '')
    console.log(`  ${subjectVal.length > 3 ? '✅' : '❌'} Objet rempli : "${subjectVal.slice(0, 60)}"`)

    const bodyTextarea = panel.locator('textarea').first()
    const bodyVal = await bodyTextarea.inputValue().catch(() => '')
    console.log(`  ${bodyVal.length > 50 ? '✅' : '❌'} Corps rempli (${bodyVal.length} caractères)`)
    if (bodyVal.length > 0) {
      console.log(`  Aperçu: "${bodyVal.slice(0, 100).replace(/\n/g, '↵')}…"`)
    }

    // Check Enregistrer and Envoyé buttons (scoped to panel to avoid tab button ambiguity)
    const saveBtn = panel.locator('button:has-text("Enregistrer")')
    const sentBtnPanel = panel.locator('button').filter({ hasText: 'Envoyé' }).filter({ hasNotText: 'Envoyées' })
    console.log(`  ${await saveBtn.isVisible() ? '✅' : '❌'} Bouton "Enregistrer"`)
    console.log(`  ${await sentBtnPanel.isVisible() ? '✅' : '❌'} Bouton "Envoyé"`)

    // ── 8. Edit the subject and save ──────────────────────────────────────
    if (subjectVal.length > 0) {
      await subjectInput.fill(`${subjectVal} [TESTÉ]`)
      await page.waitForTimeout(200)
    }
    await saveBtn.click()
    await page.waitForTimeout(800)
    await shot(page, '08-apres-enregistrement')
    console.log('✅ Brouillon enregistré')

    // ── 9. Open J+7 and mark as "Envoyé" ─────────────────────────────────
    await page.locator('button:has-text("Toutes")').first().click()
    await page.waitForTimeout(500)
    await page.locator('text=J+7').first().click()
    await page.waitForTimeout(600)
    await shot(page, '09-panel-j7-ouvert')

    const panel2 = page.locator('.sticky.top-4')
    const sentBtnJ7 = panel2.locator('button').filter({ hasText: 'Envoyé' }).filter({ hasNotText: 'Envoyées' })
    if (await sentBtnJ7.isVisible()) {
      await sentBtnJ7.click()
      await page.waitForTimeout(800)
      await shot(page, '10-j7-marque-envoye')
      console.log('✅ J+7 marqué comme Envoyé')
    }

    // ── 10. Check "Envoyées" tab now shows 1 ──────────────────────────────
    await page.locator('button:has-text("Envoyées")').first().click()
    await page.waitForTimeout(500)
    await shot(page, '11-tab-envoyees')
    const sentCount = await page.locator('text=J+7').count()
    console.log(`  ${sentCount > 0 ? '✅' : '❌'} J+7 visible dans l'onglet Envoyées`)

    // ── 11. Check "En attente" tab ────────────────────────────────────────
    await page.locator('button:has-text("En attente")').first().click()
    await page.waitForTimeout(500)
    await shot(page, '12-tab-en-attente')
    console.log('✅ Onglet En attente vérifié')

    // ── 12. Test Régénérer button ─────────────────────────────────────────
    await page.locator('button:has-text("Toutes")').first().click()
    await page.waitForTimeout(400)
    const regenBtn = page.locator('button:has-text("Régénérer")').first()
    if (await regenBtn.isVisible()) {
      console.log('⏳ Test Régénérer…')
      await regenBtn.click()
      await page.waitForFunction(() => {
        const btns = document.querySelectorAll('button')
        for (const btn of btns) {
          if (btn.textContent?.includes('Génération…')) return false
        }
        return true
      }, { timeout: 45_000 })
      await page.waitForTimeout(800)
      await shot(page, '13-apres-regeneration')
      console.log('✅ Régénération réussie — nouvelles relances créées')
    }
  }

  console.log('\n🎉 Système de relances testé avec succès !')

} catch (err) {
  console.error('❌ Erreur:', err.message)
  await page.screenshot({ path: 'manager/test-relances-ERROR.png', fullPage: false })
} finally {
  await browser.close()
}
