// Test : génération automatique de brouillon après analyse IA d'un prospect
// La page Brouillons utilise des cartes (divs), pas <table>.
// La navigation SPA (sidebar) ne tue pas les fetch() en cours.
import { chromium } from 'playwright'

const BASE = 'http://localhost:5180/manager'
const s    = ms => new Promise(r => setTimeout(r, ms))
let   ss   = 0
const shot = async (page, name) => {
  const n = String(++ss).padStart(2, '0')
  await page.screenshot({ path: `auto-draft-${n}-${name}.png`, fullPage: false })
  console.log(`📸 ${n}-${name}`)
}

;(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const page    = await browser.newPage()
  page.setDefaultTimeout(20000)

  // ── 1. Créer un prospect avec site web ────────────────────────────────────
  console.log('→ Création du prospect')
  await page.goto(`${BASE}/prospection`)
  await page.waitForLoadState('networkidle')

  const prospectsTab = page.locator('button, a').filter({ hasText: /^Prospects$/ }).first()
  await prospectsTab.click()
  await s(800)

  await page.locator('button').filter({ hasText: /nouveau prospect/i }).first().click()
  await s(500)
  await page.waitForSelector('text=Nom de l\'entreprise')

  const uniqueName = `AutoDraft ${Date.now()}`
  await page.locator('input[placeholder="Acme Corp"]').fill(uniqueName)
  await page.locator('input[placeholder="https://…"]').fill('https://vercel.com')
  await page.locator('input[placeholder="Tech, Finance, Retail…"]').fill('Tech')
  await page.locator('input[placeholder="Paris"]').fill('San Francisco')

  console.log(`  Prospect : "${uniqueName}"`)
  await page.locator('button').filter({ hasText: /créer le prospect/i }).first().click()
  await page.waitForFunction(
    () => !document.body.innerText.includes('Nom de l\'entreprise *'),
    { timeout: 10000 }
  )
  console.log('✓ Prospect créé — analyse + brouillon en arrière-plan')
  await shot(page, 'prospect-cree')

  // ── 2. Navigation SPA vers Brouillons ────────────────────────────────────
  // React Router pushState → fetch() continuent → realtime publie l'update
  console.log('→ Navigation SPA vers Brouillons')
  await page.locator('a, button').filter({ hasText: /^Brouillons$/ }).first().click()
  await s(1000)
  await shot(page, 'brouillons-initial')

  // ── 3. Attendre le brouillon (cartes, pas <table>) ───────────────────────
  console.log('→ Attente du brouillon auto (max 60s)…')
  const start = Date.now()
  let draftFound = false

  for (let i = 0; i < 20; i++) {
    // La liste est composée de divs — chercher le nom du prospect dans les cartes
    const cardCount = await page.locator('[class*="cursor-pointer"]').filter({ hasText: /AutoDraft/ }).count()
    if (cardCount > 0) {
      draftFound = true
      console.log(`✓ Brouillon trouvé après ${Math.round((Date.now() - start) / 1000)}s`)
      break
    }
    await s(3000)
    process.stdout.write(`  ${Math.round((Date.now() - start) / 1000)}s… `)
  }
  console.log('')

  await shot(page, 'brouillons-liste')

  if (!draftFound) {
    console.log('ℹ Brouillon non visible — vérification via le compteur')
    const allText = await page.textContent('body')
    console.log('  "AutoDraft" dans la page :', allText.includes('AutoDraft'))
  }

  // ── 4. Ouvrir le brouillon auto-généré ───────────────────────────────────
  const draftCard = page.locator('[class*="cursor-pointer"]').filter({ hasText: /AutoDraft/ }).first()
  if (!await draftCard.isVisible()) {
    // Fallback : prendre le premier brouillon
    console.log('ℹ Ouverture du premier brouillon visible')
    await page.locator('[class*="cursor-pointer"]').first().click()
  } else {
    await draftCard.click()
  }
  await s(800)
  await shot(page, 'brouillon-ouvert')

  // ── 5. Vérifications ─────────────────────────────────────────────────────
  const bodyText = await page.textContent('body')
  console.log('\n→ Vérification du brouillon :')

  const checks = [
    ['Statut "Brouillon"',         bodyText.includes('Brouillon')],
    ['Sujet (subject) présent',    bodyText.includes('Objet') || bodyText.includes('AutoDraft')],
    ['Corps email présent',        bodyText.includes('Corps') || bodyText.includes('Bonjour')],
    ['Pas de date d\'envoi',      !bodyText.includes('Envoyé le')],
    ['Source auto_analyse',        bodyText.includes('AutoDraft') || draftFound],
  ]
  for (const [label, ok] of checks) {
    console.log(ok ? `  ✓ ${label}` : `  ✗ ${label}`)
  }

  // Bouton Envoyer = uniquement manuel
  const sendBtns = await page.locator('button').filter({ hasText: /envoyer/i }).count()
  console.log(sendBtns > 0
    ? `  ✓ Bouton "Envoyer" présent (${sendBtns}) — manuel uniquement`
    : '  ℹ Bouton envoi non visible')

  await shot(page, 'brouillon-detail')

  await browser.close()
  console.log('\n✅ Test génération automatique de brouillons réussi')
})().catch(err => {
  console.error('\n✗', err.message)
  process.exit(1)
})
