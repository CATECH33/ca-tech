import { chromium } from 'playwright'

// ── Cleanup préalable ─────────────────────────────────────────────────────────
const SUPA_URL = 'https://jhcyooksjeivajdjicka.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY3lvb2tzamVpdmFqZGppY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzEwMjQsImV4cCI6MjA5NzU0NzAyNH0.pFYDxJUDD5oZyVfGSDDKnPAnyc-jkXd0scS0LvGdlFk'
await fetch(`${SUPA_URL}/rest/v1/clients?last_name=eq.Client TEMP`, {
  method: 'DELETE',
  headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
})
console.log('0. Cleanup clients TEMP effectué')

const browser = await chromium.launch({ headless: false, slowMo: 200 })
const page = await browser.newPage()

const errors = []
const network = []
page.on('console', m => {
  const t = m.type()
  if (t === 'error' || t === 'warn') errors.push(`[${t}] ${m.text()}`)
})
page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`))
page.on('response', async res => {
  if (res.url().includes('/clients')) {
    try {
      const body = await res.text().catch(() => '')
      network.push(`${res.request().method()} ${res.status()} clients → ${body.substring(0, 200)}`)
    } catch {}
  }
})

await page.goto('http://localhost:5173/manager/clients', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

// ── 1. Page chargée ──────────────────────────────────────────────────────────
const title = await page.locator('h1').first().textContent().catch(() => '')
console.log('1. Titre :', title?.trim())

// ── 2. Stat chips (4 cartes KPI) ─────────────────────────────────────────────
const statLabels = ['Total clients', 'Clients actifs', 'CA total', 'CA moyen']
for (const label of statLabels) {
  const found = await page.locator(`text=${label}`).count() > 0
  if (!found) console.log(`  ⚠ KPI manquant : ${label}`)
}
console.log('2. KPIs :', statLabels.length, 'attendus — OK')

// ── 3. Bascule vue Cartes ─────────────────────────────────────────────────────
await page.locator('button[title="Cartes"]').click()
await page.waitForTimeout(600)
const cardsVisible = await page.locator('.grid').count() > 0
console.log('3. Vue Cartes :', cardsVisible)

// Retour vue Tableau
await page.locator('button[title="Tableau"]').click()
await page.waitForTimeout(500)
const tableHeaders = await page.locator('th').count()
console.log('3b. Vue Tableau — headers :', tableHeaders, '(attendu 7)')

// ── 4. Créer un client ────────────────────────────────────────────────────────
await page.locator('button:has-text("Nouveau client")').click()
await page.waitForTimeout(700)
console.log('4. Modal création ouvert :', await page.locator('text=Nouveau client').count() > 1)

await page.locator('input[placeholder="Sophie"]').fill('Test')
await page.locator('input[placeholder="Martin"]').fill('Client TEMP')
await page.locator('input[placeholder="sophie@entreprise.fr"]').fill('test.client@temp.com')
await page.locator('input[placeholder="06 XX XX XX XX"]').fill('06 00 00 00 00')
await page.locator('input[placeholder="Martin SARL"]').fill('Société Test')
await page.locator('input[placeholder="Tech, Commerce, Santé…"]').fill('Tech')
await page.locator('input[placeholder="Paris"]').fill('Lyon')
await page.waitForTimeout(400)

// Debug : état du bouton Créer
const createBtn = page.locator('button').filter({ hasText: /^Créer le client$/ })
const isEnabled = await createBtn.isEnabled().catch(() => false)
console.log('4b. Bouton "Créer le client" activé :', isEnabled)
await page.screenshot({ path: 'debug-clients-form.png' })

await createBtn.click()
await page.waitForTimeout(4000)
await page.screenshot({ path: 'debug-clients-after-create.png' })

// Après création, le panel s'ouvre automatiquement
const allTextClientTemp = await page.evaluate(() =>
  [...document.querySelectorAll('*')]
    .filter(el => el.textContent?.includes('Client TEMP') && el.children.length === 0)
    .map(el => `<${el.tagName}>: "${el.textContent?.trim().substring(0, 60)}"`)
    .slice(0, 5)
)
console.log('  Debug textes "Client TEMP":', allTextClientTemp.join(' | ') || 'AUCUN')
const panelVisible = await page.locator('text=Client TEMP').count() > 0
console.log('5. Client créé + panel ouvert :', panelVisible)

// Debug réseau immédiat
console.log('  Réseau (POST clients):', network.filter(n => n.startsWith('POST')).join('\n  ') || 'AUCUN POST')
console.log('  Erreurs JS:', errors.slice(0, 3).join('\n  ') || 'aucune')

// ── 5. Vérifier les tabs du panel ────────────────────────────────────────────
const panel = page.locator('.fixed.inset-y-0.right-0')
const expectedTabs = ['Infos', 'Activité', 'Projets', 'Devis', 'Factures', 'Paiements', 'Tickets', 'Messages', 'Notes']
let tabsFound = 0
for (const tab of expectedTabs) {
  if (await panel.locator(`button:has-text("${tab}")`).count() > 0) tabsFound++
}
console.log('6. Tabs panel :', tabsFound, '/', expectedTabs.length)

// ── 6. Modifier via le bouton "Modifier" ──────────────────────────────────────
await panel.locator('button:has-text("Modifier")').click()
await page.waitForTimeout(500)
// Changer le téléphone en mode édition
const phoneInput = panel.locator('input[label="Téléphone"], label:has-text("Téléphone") + div input, div:has(label:has-text("Téléphone")) input').first()
// Les inputs n'ont pas d'attribut label, utiliser l'ordre dans le formulaire
// Téléphone est le 4e input (Prénom, Nom, Email, Téléphone)
const editInputs = panel.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').filter({ visible: true })
const count = await editInputs.count()
// In edit mode: Prénom, Nom, Email, Téléphone, Société, Secteur, Adresse, CP, Ville
const teleInput = editInputs.nth(3)
await teleInput.clear()
await teleInput.fill('07 99 88 77 66')
await page.waitForTimeout(200)
await panel.locator('button:has-text("Enregistrer")').click()
await page.waitForTimeout(2500)
console.log('7. Modification enregistrée (PATCH 200 :', network.some(n => n.includes('PATCH 200')) ? 'oui)' : 'non)')

// ── 7. Tab Notes ──────────────────────────────────────────────────────────────
await panel.locator('button:has-text("Notes")').click()
await page.waitForTimeout(400)
const notesArea = panel.locator('textarea[placeholder*="Notes privées"]')
await notesArea.fill('Note de test automatique')
await panel.locator('button:has-text("Enregistrer les notes")').click()
await page.waitForTimeout(2000)
console.log('8. Notes enregistrées')

// ── 8. Supprimer le client ────────────────────────────────────────────────────
// Bouton trash icon dans le header du panel (variant="ghost" text-red-400)
const trashBtn = panel.locator('button.text-red-400, button[class*="red"]').first()
await trashBtn.click()
await page.waitForTimeout(600)

// Modal confirmation "Supprimer définitivement"
const confirmModal = page.locator('text=Supprimer ce client')
console.log('9. Modal confirmation suppression :', await confirmModal.count() > 0)
await page.locator('button:has-text("Supprimer définitivement")').click()
await page.waitForTimeout(3000)

const gone = await page.locator('text=Client TEMP').count() === 0
console.log('10. Client supprimé :', gone)

// ── Résumé ────────────────────────────────────────────────────────────────────
console.log('\n=== Réseau ===')
network.forEach(r => console.log(r))
console.log(errors.length === 0 ? '\n✅ Aucune erreur JS' : `\n❌ ${errors.length} erreur(s)`)
errors.slice(0, 3).forEach(e => console.log(e.substring(0, 120)))

await page.waitForTimeout(1500)
await browser.close()
