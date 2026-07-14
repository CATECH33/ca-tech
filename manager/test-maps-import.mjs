// Test Google Maps Scraper — import complet dans le CRM
import { chromium } from 'playwright'

const API_KEY = process.env.APIFY_API_KEY ?? ''
if (!API_KEY) { console.error('✗ APIFY_API_KEY env var manquante'); process.exit(1) }
const BASE    = 'http://localhost:5180/manager'

const s    = ms => new Promise(r => setTimeout(r, ms))
let   ss   = 0
const shot = async (page, name) => {
  const n = String(++ss).padStart(2, '0')
  await page.screenshot({ path: `maps-import-${n}-${name}.png`, fullPage: false })
  console.log(`📸 ${n}-${name}`)
}

;(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const page    = await browser.newPage()
  page.setDefaultTimeout(20000)

  // ── 1. Aller sur Connecteurs ──────────────────────────────────────────────
  console.log('→ Navigation Prospection / Connecteurs')
  await page.goto(`${BASE}/prospection`)
  await page.waitForLoadState('networkidle')

  await page.locator('button, a').filter({ hasText: /connecteur/i }).first().click()
  await s(600)
  await shot(page, 'connecteurs')

  // ── 2. Ouvrir panneau Apify (1er bouton Configurer) ───────────────────────
  console.log('→ Ouverture panneau Apify')
  await page.locator('button').filter({ hasText: /configurer/i }).first().click()
  await s(800)
  await page.waitForSelector('text=Clé API Apify', { timeout: 8000 })

  // Panneau identifié par shadow-2xl — tous les clics suivants sont scopés dedans
  const panel = page.locator('.shadow-2xl').first()
  await shot(page, 'panel-open')

  // ── 3. Clé API + test connexion ────────────────────────────────────────────
  console.log('→ Saisie clé API')
  await panel.locator('input[type="password"]').fill(API_KEY)
  await s(300)
  await panel.locator('button').filter({ hasText: /^Tester$/ }).click()

  console.log('→ Attente connexion...')
  await page.waitForFunction(
    () => document.body.innerText.includes('Connecté'),
    { timeout: 15000 }
  )
  await s(300)
  await shot(page, 'connected')

  // ── 4. Sélectionner Google Maps Scraper (2ème actor dans le catalogue) ────
  console.log('→ Sélection Google Maps Scraper')
  // CuratedActorCard rend un <button> contenant le texte "Google Maps Scraper"
  // Restreint au panel pour éviter la carte "Google Maps" du fond
  const mapsActorBtn = panel.locator('button').filter({ hasText: /Google Maps Scraper/i }).first()
  await mapsActorBtn.click()
  await s(400)
  await shot(page, 'maps-selected')

  // Vérifier que l'actor est bien sélectionné (recap visible)
  await page.waitForFunction(
    () => document.body.innerText.includes('compass/crawler-google-places'),
    { timeout: 5000 }
  )
  console.log('✓ Actor sélectionné : compass/crawler-google-places')

  // ── 5. Lancer l'actor ─────────────────────────────────────────────────────
  console.log('→ Lancement')
  // Footer button (scopé dans le panel pour éviter conflits)
  const launchBtn = panel.locator('button').filter({ hasText: /lancer l.actor/i }).first()
  await launchBtn.click()
  await s(1500)
  await shot(page, 'launched')

  // ── 6. Attendre SUCCEEDED (max 3 min) ─────────────────────────────────────
  console.log('→ Polling run status (max 3 min)...')
  let succeeded = false
  const deadline = Date.now() + 3 * 60 * 1000

  while (Date.now() < deadline) {
    await s(5000)
    const txt = await page.textContent('body')
    process.stdout.write('.')
    if (/Terminé|SUCCEEDED/.test(txt)) { succeeded = true; break }
    if (/Échoué|FAILED|ABORTED|Expiré/.test(txt)) {
      console.error('\n✗ Run échoué')
      await shot(page, 'run-failed')
      break
    }
  }
  console.log()
  await shot(page, 'run-done')

  if (!succeeded) {
    console.error('✗ Run non terminé dans les délais')
    await browser.close()
    process.exit(1)
  }
  console.log('✓ Run SUCCEEDED')

  // ── 7. Import CRM ─────────────────────────────────────────────────────────
  console.log('→ Import dans le CRM')
  const importBtn = panel.locator('button').filter({ hasText: /importer les résultats/i }).first()
  await importBtn.waitFor({ state: 'visible', timeout: 10000 })
  await shot(page, 'import-btn')
  await importBtn.click()

  // Attendre la fin de l'import (status "done" : les compteurs apparaissent)
  await page.waitForFunction(
    () => document.body.innerText.match(/Importés|Ignorés|Erreurs/),
    { timeout: 30000 }
  )
  await shot(page, 'import-done')

  // Lire les compteurs
  const bodyText = await page.textContent('body')
  const imported = bodyText.match(/(\d+)\s*Importés/)
  const skipped  = bodyText.match(/(\d+)\s*Ignorés/)
  const errors   = bodyText.match(/(\d+)\s*Erreurs/)
  console.log(`✓ Importés: ${imported?.[1] ?? '?'} | Ignorés: ${skipped?.[1] ?? '?'} | Erreurs: ${errors?.[1] ?? '?'}`)

  // ── 8. Vérifier dans la liste des prospects ───────────────────────────────
  console.log('→ Vérification liste prospects')
  await page.goto(`${BASE}/prospection`)
  await page.waitForLoadState('networkidle')
  await s(1500)
  await shot(page, 'prospects-list')

  const rows = await page.locator('table tbody tr').count()
  console.log(`✓ ${rows} prospects dans le CRM`)

  await browser.close()
  console.log('\n✅ Test Google Maps import terminé avec succès')
})().catch(async err => {
  console.error('\n✗', err.message)
  process.exit(1)
})
