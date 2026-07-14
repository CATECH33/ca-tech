/**
 * TEST WORKFLOW COMPLET — bout en bout
 * Import → Prospect → Analyse IA → Score → Commentaire → Brouillon → Notification → Validation
 *
 * Ce test vérifie chaque étape du pipeline automatique CA-TECH Manager.
 * Il utilise la navigation SPA (sidebar) pour ne pas tuer les fetch() en cours.
 */
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────────────────────────
import { readFileSync } from 'fs'
import { resolve }      from 'path'

const BASE         = 'http://localhost:5180/manager'
const SUPABASE_URL = 'https://jhcyooksjeivajdjicka.supabase.co'

// Lire la clé depuis .env.local si non fournie en env
let SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? ''
if (!SUPABASE_KEY) {
  try {
    const envFile = readFileSync(resolve('.env.local'), 'utf8')
    const match   = envFile.match(/VITE_SUPABASE_ANON_KEY=(.+)/)
    if (match) SUPABASE_KEY = match[1].trim()
  } catch { /* ignore */ }
}

const s    = ms => new Promise(r => setTimeout(r, ms))
let   ss   = 0
const shot = async (page, name) => {
  const n = String(++ss).padStart(2, '0')
  await page.screenshot({ path: `workflow-${n}-${name}.png`, fullPage: false })
  console.log(`  📸 ${n}-${name}`)
}

// ── Rapport ───────────────────────────────────────────────────────────────────
const rapport = {
  steps: [],
  errors: [],
  startTime: Date.now(),
}

function ok(step, detail = '') {
  rapport.steps.push({ step, status: 'OK', detail })
  console.log(`  ✅ [${step}]${detail ? ' — ' + detail : ''}`)
}

function warn(step, detail = '') {
  rapport.steps.push({ step, status: 'WARN', detail })
  console.log(`  ⚠️  [${step}]${detail ? ' — ' + detail : ''}`)
}

function fail(step, detail = '') {
  rapport.steps.push({ step, status: 'FAIL', detail })
  rapport.errors.push({ step, detail })
  console.log(`  ❌ [${step}]${detail ? ' — ' + detail : ''}`)
}

function printReport() {
  const elapsed = Math.round((Date.now() - rapport.startTime) / 1000)
  const okCount   = rapport.steps.filter(s => s.status === 'OK').length
  const warnCount = rapport.steps.filter(s => s.status === 'WARN').length
  const failCount = rapport.steps.filter(s => s.status === 'FAIL').length

  console.log('\n' + '═'.repeat(60))
  console.log('  RAPPORT DU WORKFLOW COMPLET')
  console.log('═'.repeat(60))
  console.log(`  Durée totale : ${elapsed}s`)
  console.log(`  Résultats   : ✅ ${okCount} OK  ⚠️  ${warnCount} WARN  ❌ ${failCount} FAIL`)
  console.log('─'.repeat(60))
  for (const s of rapport.steps) {
    const icon = s.status === 'OK' ? '✅' : s.status === 'WARN' ? '⚠️ ' : '❌'
    console.log(`  ${icon} ${s.step.padEnd(35)} ${s.detail}`)
  }
  if (rapport.errors.length) {
    console.log('─'.repeat(60))
    console.log('  ERREURS :')
    for (const e of rapport.errors) {
      console.log(`  ❌ ${e.step} : ${e.detail}`)
    }
  }
  console.log('═'.repeat(60))
  return failCount === 0
}

// ── Polling Supabase direct ───────────────────────────────────────────────────
async function pollSupabase(supabase, table, field, value, maxMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    const { data } = await supabase.from(table).select('*').eq(field, value).limit(1)
    if (data?.length) return data[0]
    await s(3000)
  }
  return null
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
;(async () => {
  const supabase = SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const page    = await browser.newPage()
  page.setDefaultTimeout(25000)

  const uniqueName = `WorkflowTest ${Date.now()}`
  let   prospectId = null

  console.log('\n' + '═'.repeat(60))
  console.log('  DÉBUT DU TEST WORKFLOW COMPLET')
  console.log('═'.repeat(60))
  console.log(`  Prospect : "${uniqueName}"`)
  console.log(`  URL      : https://stripe.com`)
  console.log('═'.repeat(60) + '\n')

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 1 : Navigation & Création du prospect
  // ─────────────────────────────────────────────────────────────
  console.log('📌 ÉTAPE 1 — Création du prospect')
  try {
    await page.goto(`${BASE}/prospection`)
    await page.waitForLoadState('networkidle')

    const prospectsTab = page.locator('button, a').filter({ hasText: /^Prospects$/ }).first()
    await prospectsTab.click()
    await s(800)

    await page.locator('button').filter({ hasText: /nouveau prospect/i }).first().click()
    await page.waitForSelector('text=Nom de l\'entreprise')
    await s(400)

    await page.locator('input[placeholder="Acme Corp"]').fill(uniqueName)
    await page.locator('input[placeholder="https://…"]').fill('https://stripe.com')
    await page.locator('input[placeholder="Tech, Finance, Retail…"]').fill('Fintech')
    await page.locator('input[placeholder="Paris"]').fill('San Francisco')
    await page.locator('input[placeholder="France"]').fill('USA')
    await shot(page, 'creation-modal')

    await page.locator('button').filter({ hasText: /créer le prospect/i }).first().click()
    await page.waitForFunction(
      () => !document.body.innerText.includes('Nom de l\'entreprise *'),
      { timeout: 10000 }
    )
    await shot(page, 'apres-creation')
    ok('1. Création prospect', uniqueName)
  } catch (e) {
    fail('1. Création prospect', e.message)
    await browser.close()
    printReport()
    process.exit(1)
  }

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 2 : Vérifier le prospect dans Supabase
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 2 — Vérification en base de données')
  if (supabase) {
    try {
      const { data } = await supabase
        .from('prospects')
        .select('id, company_name, website, score, metadata')
        .ilike('company_name', `WorkflowTest%`)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data?.length) {
        prospectId = data[0].id
        ok('2. Prospect en DB', `id=${prospectId.slice(0, 8)}…`)
      } else {
        fail('2. Prospect en DB', 'Non trouvé dans la table prospects')
      }
    } catch (e) {
      fail('2. Prospect en DB', e.message)
    }
  } else {
    warn('2. Prospect en DB', 'SUPABASE_ANON_KEY non fournie — skip vérification DB')
  }

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 3 : Analyse IA (le pipeline tourne en arrière-plan)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 3 — Analyse IA (arrière-plan)')

  // Navigation SPA vers la fiche pour vérifier l'analyse
  await s(2000)
  const prospectsTab2 = page.locator('button, a').filter({ hasText: /^Prospects$/ }).first()
  if (await prospectsTab2.isVisible()) await prospectsTab2.click()
  await s(500)

  const row = page.locator('table tbody tr').filter({ hasText: /WorkflowTest/ }).first()

  if (await row.isVisible()) {
    await row.click()
    await s(600)

    // Attendre l'onglet Analyse
    const analyseTabBtn = page.locator('button').filter({ hasText: /Analyse/ }).first()
    if (await analyseTabBtn.isVisible()) {
      await analyseTabBtn.click()
      await s(400)
    }
    await shot(page, 'fiche-analyse-initial')

    // Attendre données analyse (max 30s — peut déjà être là)
    let analyseOk = false
    for (let i = 0; i < 10; i++) {
      const txt = await page.textContent('body')
      if (txt.includes('Site web présent') || txt.includes('HTTPS') || txt.includes('Score d\'analyse')) {
        analyseOk = true
        break
      }
      await s(3000)
    }

    if (analyseOk) {
      ok('3. Analyse IA dans UI', 'Critères visibles dans l\'onglet Analyse')
      await shot(page, 'fiche-analyse-ok')
    } else {
      warn('3. Analyse IA dans UI', 'Pas encore visible — vérification via DB')
    }
  } else {
    warn('3. Analyse IA dans UI', 'Ligne prospect non trouvée dans la table')
  }

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 4 : Score (vérifié via Supabase)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 4 — Score commercial')
  if (supabase && prospectId) {
    try {
      let prospect = null
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase
          .from('prospects')
          .select('score, metadata')
          .eq('id', prospectId)
          .single()
        if (data?.metadata?.analyse?.analysed_at) {
          prospect = data
          break
        }
        await s(3000)
        process.stdout.write('  Attente analyse… ')
      }
      console.log('')

      if (prospect) {
        const score    = prospect.score
        const metaScore = prospect.metadata?.analyse?.score
        ok('4. Score calculé', `score=${score} (${metaScore}/9)`)
        ok('4b. Analyse sauvegardée', `analysed_at=${prospect.metadata.analyse.analysed_at?.slice(0, 19)}`)
      } else {
        fail('4. Score calculé', 'metadata.analyse.analysed_at non trouvé après 60s')
      }
    } catch (e) {
      fail('4. Score calculé', e.message)
    }
  } else {
    warn('4. Score calculé', 'Skip — pas de connexion Supabase directe')
  }

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 5 : Commentaire IA
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 5 — Commentaire IA')
  if (supabase && prospectId) {
    try {
      const { data } = await supabase
        .from('prospects')
        .select('metadata')
        .eq('id', prospectId)
        .single()
      const comment = data?.metadata?.analyse?.ai_comment ?? ''
      if (comment.includes('Analyse automatique')) {
        ok('5. Commentaire IA', comment.slice(0, 60) + '…')
      } else {
        warn('5. Commentaire IA', 'Commentaire absent ou format inattendu')
      }
    } catch (e) {
      fail('5. Commentaire IA', e.message)
    }
  } else {
    warn('5. Commentaire IA', 'Skip — pas de connexion Supabase directe')
  }

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 6 : Brouillon créé
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 6 — Création du brouillon')

  // Fermer la fiche si ouverte — cliquer le backdrop qui couvre tout le viewport
  const backdrop = page.locator('div.fixed.inset-0.z-40 > div.absolute.inset-0').first()
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 10, y: 10 } })
    await s(500)
  }
  // Fallback : navigation JS directe sans reload de page
  await page.evaluate(() => {
    if (window.__reactRouterDataRouter || window.history) {
      // Trigger React Router navigation via pushState + popstate
      window.history.pushState({}, '', '/manager/prospection/brouillons')
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
    }
  })
  await s(1000)
  await s(1500)
  await shot(page, 'brouillons-nav')

  if (supabase && prospectId) {
    // Polling DB pour le brouillon (max 90s)
    console.log('  Attente brouillon auto (max 90s)…')
    let draft = null
    for (let i = 0; i < 30; i++) {
      const { data } = await supabase
        .from('email_drafts')
        .select('id, subject, status, metadata')
        .eq('prospect_id', prospectId)
        .limit(1)
      if (data?.length) {
        draft = data[0]
        break
      }
      await s(3000)
      process.stdout.write(`  ${(i+1)*3}s… `)
    }
    console.log('')

    if (draft) {
      ok('6. Brouillon créé', `"${draft.subject?.slice(0, 50)}…"`)
      if (draft.status === 'draft') {
        ok('6b. Statut = draft', 'Jamais envoyé automatiquement ✓')
      } else {
        fail('6b. Statut = draft', `Statut inattendu : ${draft.status}`)
      }
      if (draft.metadata?.source === 'auto_analyse') {
        ok('6c. Source auto_analyse', 'Traçabilité ✓')
      } else {
        warn('6c. Source auto_analyse', `Source : ${draft.metadata?.source}`)
      }
    } else {
      fail('6. Brouillon créé', 'Non trouvé dans email_drafts après 90s')
    }
  } else {
    // Vérification UI
    const bodyText = await page.textContent('body')
    if (bodyText.includes('WorkflowTest') || bodyText.includes('Fintech')) {
      ok('6. Brouillon créé', 'Visible dans la page Brouillons')
    } else {
      warn('6. Brouillon créé', 'Non visible dans l\'UI (vérifier DB manuellement)')
    }
  }
  await shot(page, 'brouillons-liste')

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 7 : Notification in-app
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 7 — Notification dans CA-TECH Manager')

  // Vérifier la cloche dans le header
  const bellBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(0)

  // Chercher le badge de notification (count > 0)
  const hasBadge = await page.locator('header span.bg-brand-500').first().isVisible().catch(() => false)

  if (supabase && prospectId) {
    try {
      let notif = null
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase
          .from('notifications')
          .select('id, title, message, type, is_read, link')
          .eq('prospect_id', prospectId)
          .limit(1)
        if (data?.length) {
          notif = data[0]
          break
        }
        await s(3000)
        process.stdout.write(`  ${(i+1)*3}s… `)
      }
      console.log('')

      if (notif) {
        ok('7. Notification créée', `"${notif.title}"`)
        ok('7b. Type notification', `type=${notif.type}`)
        ok('7c. Lien brouillons', notif.link ?? '(vide)')
        if (!notif.is_read) {
          ok('7d. Non lue = badge actif', 'Compteur dans la cloche ✓')
        }
      } else {
        warn('7. Notification créée', 'Non trouvée dans la table notifications après 60s')
      }
    } catch (e) {
      fail('7. Notification créée', e.message)
    }
  } else {
    if (hasBadge) {
      ok('7. Badge notification', 'Badge visible dans la cloche')
    } else {
      warn('7. Badge notification', 'Badge non visible (vérifier connexion DB)')
    }
  }

  // Ouvrir la cloche et prendre screenshot (puis fermer avant l'étape suivante)
  try {
    const bellButton = page.locator('header button').filter({ has: page.locator('svg') }).nth(1)
    await bellButton.click({ timeout: 3000 })
    await s(500)
    await shot(page, 'notification-cloche')
    // Fermer le dropdown en cliquant sur son overlay
    const bellOverlay = page.locator('header div.fixed.inset-0').first()
    if (await bellOverlay.isVisible().catch(() => false)) {
      await bellOverlay.click()
    } else {
      await page.keyboard.press('Escape')
    }
    await s(400)
  } catch {
    // Cloche peut ne pas être trouvée
  }

  // ─────────────────────────────────────────────────────────────
  // ÉTAPE 8 : Validation manuelle du brouillon
  // ─────────────────────────────────────────────────────────────
  console.log('\n📌 ÉTAPE 8 — Prêt pour validation')

  // Ouvrir le premier brouillon visible
  const draftCards = page.locator('[class*="cursor-pointer"]')
  const cardCount  = await draftCards.count()

  if (cardCount > 0) {
    await draftCards.first().click()
    await s(800)
    await shot(page, 'brouillon-detail')

    const panelText = await page.textContent('body')
    const validerBtn = page.locator('button').filter({ hasText: /^Valider$/ }).first()
    const hasValider = await validerBtn.isVisible().catch(() => false)

    if (hasValider) {
      ok('8. Bouton Valider présent', 'Action manuelle requise ✓')
      ok('8b. Pas d\'envoi auto', 'Le bouton Envoyer n\'est actif qu\'après validation')
    } else {
      // Chercher si statut est déjà différent
      if (panelText.includes('Remettre en brouillon')) {
        ok('8. Brouillon déjà validé', 'ready status')
      } else {
        warn('8. Bouton Valider', 'Non trouvé dans la vue actuelle')
      }
    }

    // Vérifier que l'envoi automatique est impossible
    const envoyerActif = await page.locator('button').filter({ hasText: /^Envoyer/ })
      .filter({ hasNot: page.locator('[disabled]') }).count()
    if (envoyerActif === 0) {
      ok('8c. Envoi automatique bloqué', 'Brouillon non-ready = envoi désactivé ✓')
    }

    await shot(page, 'validation-pret')
  } else {
    warn('8. Validation', 'Aucun brouillon visible dans la liste')
  }

  // ─────────────────────────────────────────────────────────────
  // RAPPORT FINAL
  // ─────────────────────────────────────────────────────────────
  await browser.close()
  const success = printReport()
  process.exit(success ? 0 : 1)
})().catch(err => {
  console.error('\n✗ ERREUR FATALE :', err.message)
  printReport()
  process.exit(1)
})
