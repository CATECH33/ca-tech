import { chromium } from 'playwright'

// ── Cleanup préalable : supprimer les leads "Lead TEMP" des runs précédents ──
const SUPA_URL = 'https://jhcyooksjeivajdjicka.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY3lvb2tzamVpdmFqZGppY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzEwMjQsImV4cCI6MjA5NzU0NzAyNH0.pFYDxJUDD5oZyVfGSDDKnPAnyc-jkXd0scS0LvGdlFk'
await fetch(`${SUPA_URL}/rest/v1/leads?last_name=eq.Lead TEMP`, {
  method: 'DELETE',
  headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
})
console.log('0. Cleanup leads TEMP effectué')

const browser = await chromium.launch({ headless: false, slowMo: 200 })
const page = await browser.newPage()

const errors = []
const network = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))
page.on('response', async res => {
  if (res.url().includes('/leads')) {
    try { network.push(`${res.request().method()} ${res.status()} leads`) } catch {}
  }
})

await page.goto('http://localhost:5173/manager/leads', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

// ── 1. Page chargée ──────────────────────────────────────────────────────
const title = await page.locator('h1').first().textContent().catch(() => '')
console.log('1. Titre :', title?.trim())

// ── 2. Vue Kanban (défaut) — compter les colonnes par header rounded-t-xl ──
const kanbanCols = await page.locator('div.rounded-t-xl').count()
console.log('2. Colonnes Kanban :', kanbanCols, '(attendu 7)')

// ── 3. Basculer en vue Liste ─────────────────────────────────────────────
await page.locator('button[title="Liste"]').click()
await page.waitForTimeout(800)
const tableHeader = await page.locator('th').count()
console.log('3. Vue Liste — headers tableau :', tableHeader)

// Revenir Kanban
await page.locator('button[title="Kanban"]').click()
await page.waitForTimeout(500)

// ── 4. Créer un lead ─────────────────────────────────────────────────────
await page.locator('button:has-text("Nouveau lead")').click()
await page.waitForTimeout(800)
console.log('4. Modal création ouvert :', await page.locator('text=Créer le lead').count() > 0)

// Placeholders = valeurs d'exemple dans le composant Input
await page.locator('input[placeholder="Thomas"]').fill('Test')
await page.locator('input[placeholder="Legrand"]').fill('Lead TEMP')
await page.locator('input[placeholder="thomas@exemple.fr"]').fill('test.lead@temp.com')
await page.locator('input[placeholder="Legrand & Co"]').fill('Société Test')

// Source — <select> natif dans le modal
const sourceSelect = page.locator('dialog select, div[role="dialog"] select, .fixed select').first()
await sourceSelect.selectOption('Email')
await page.waitForTimeout(200)

await page.locator('button').filter({ hasText: /^Créer le lead$/ }).click()
await page.waitForTimeout(3000)

const leadCreated = await page.locator('text=Lead TEMP').count() > 0
console.log('5. Lead créé dans Kanban :', leadCreated)

// ── 5. Ouvrir la fiche du lead ───────────────────────────────────────────
if (leadCreated) {
  // Le nom affiché est "{prenom} {nom}" = "Test Lead TEMP" dans un <p>
  const nameEl = page.locator('p').filter({ hasText: 'Lead TEMP' }).first()
  await nameEl.click()
  await page.waitForTimeout(1000)
  const ficheOpen = await page.locator('text=Lead TEMP').count() > 1
  console.log('6. Fiche lead ouverte :', ficheOpen)

  // ── 6. Modifier le statut (boutons colorés, pas de <select>) ───────────
  const fichePanel = page.locator('.fixed.inset-0.z-40').last()
  const contactedBtn = fichePanel.locator('button').filter({ hasText: 'Contacté' }).first()
  if (await contactedBtn.count() > 0) {
    await contactedBtn.click()
    await page.waitForTimeout(300)
    console.log('6b. Statut changé à Contacté')
  }

  // ── 7. Enregistrer ──────────────────────────────────────────────────────
  const saveBtn = fichePanel.locator('button:has-text("Enregistrer")')
  if (await saveBtn.count() > 0) {
    await saveBtn.click()
    await page.waitForTimeout(2000)
    console.log('7. Modifications enregistrées')
  }

  // ── 8. Supprimer depuis la fiche ouverte ────────────────────────────────
  const deleteBtn = fichePanel.locator('button:has-text("Supprimer")').first()
  if (await deleteBtn.count() > 0) {
    await deleteBtn.click()
    // Attendre que la fiche se ferme (div.fixed.inset-0.z-40 disparaît)
    await page.waitForSelector('.fixed.inset-0.z-40', { state: 'detached', timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1500)
    const gone = await page.locator('text=Lead TEMP').count() === 0
    console.log('8. Lead supprimé :', gone)
  } else {
    console.log('8. Bouton Supprimer non trouvé dans la fiche')
  }
}

// ── Résumé ────────────────────────────────────────────────────────────────
console.log('\n=== Réseau ===')
network.forEach(r => console.log(r))
console.log(errors.length === 0 ? '\n✅ Aucune erreur JS' : `\n❌ ${errors.length} erreur(s)`)
errors.slice(0, 3).forEach(e => console.log(e.substring(0, 120)))

await page.waitForTimeout(1500)
await browser.close()
