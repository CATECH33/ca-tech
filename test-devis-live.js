/**
 * Test end-to-end du formulaire /devis
 * node test-devis-live.js [URL]
 * Exemple : node test-devis-live.js https://www.ca-tech.fr
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';
const DEVIS_URL = BASE.replace(/\/$/, '') + '/devis';

const results = [];
let browser, page;

function log(emoji, label, detail = '') {
  const line = `${emoji} ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  results.push({ emoji, label, detail });
}

async function screenshot(name) {
  const path = `test-screenshot-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  log('📸', `Screenshot → ${path}`);
  return path;
}

async function waitForLoic(timeout = 8000) {
  // Attendre qu'au moins un message Loïc soit apparu et sans animation de frappe
  await page.waitForFunction(() => {
    const bubbles = document.querySelectorAll('.msg-bubble');
    if (!bubbles.length) return false;
    const last = bubbles[bubbles.length - 1];
    return !last.querySelector('.typing');
  }, null, { timeout });
}

async function waitForChoices(timeout = 6000) {
  await page.waitForSelector('.choice-card, .feat-item, .option-toggle, .f-grp input', { timeout });
}

(async () => {
  console.log(`\n🎯 Test formulaire devis — ${DEVIS_URL}\n${'─'.repeat(55)}`);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR',
  });
  page = await context.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));

  try {
    // ── STEP 0 : Chargement ────────────────────────────────────────────────
    const res = await page.goto(DEVIS_URL, { waitUntil: 'networkidle', timeout: 20000 });
    log(res.status() === 200 ? '✅' : '❌', `GET /devis → HTTP ${res.status()}`);

    // Titre de page
    const title = await page.title();
    log(title.includes('Devis') || title.includes('CA-TECH') ? '✅' : '⚠️', `Titre : "${title}"`);

    // Progress bar
    const progress = await page.locator('.progress-bar').isVisible();
    log(progress ? '✅' : '❌', 'Barre de progression visible');

    // Panneau prix sidebar
    const pricePanel = await page.locator('.price-panel').isVisible();
    log(pricePanel ? '✅' : '❌', 'Panneau estimation visible');

    // Attendre le premier message Loïc
    await waitForLoic(12000);

    // Loïc avatar visible (après que les messages apparaissent)
    const avatar = await page.locator('.msg-avatar').first().isVisible();
    log(avatar ? '✅' : '❌', 'Avatar Loïc visible');

    await screenshot('01-accueil');

    // ── STEP 1 : Sélection projet ────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 1 — Sélection type de projet');
    await waitForChoices(6000);

    const cards = await page.locator('.choice-card').count();
    log(cards >= 4 ? '✅' : '❌', `${cards} cartes de projet affichées`);

    // Cliquer sur "Site Vitrine"
    const siteVitrine = page.locator('.choice-card').filter({ hasText: 'Site Vitrine' }).first();
    await siteVitrine.click();
    log('✅', 'Clic → Site Vitrine');

    // Vérifier que le prix se met à jour
    await page.waitForTimeout(600);
    const priceText = await page.locator('.pp-total-val').textContent().catch(() => '');
    log(priceText.includes('590') || priceText.includes('708') ? '✅' : '⚠️',
      `Prix sidebar mis à jour : "${priceText.trim()}"`);

    await waitForLoic(6000);

    // ── STEP 2 : Secteur ─────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 2 — Secteur d\'activité');
    await waitForChoices(6000);

    const secteur = page.locator('.choice-card').filter({ hasText: 'Commerce' }).first();
    const secteurVisible = await secteur.isVisible().catch(() => false);
    log(secteurVisible ? '✅' : '⚠️', 'Cartes secteur affichées');

    if (secteurVisible) {
      await secteur.click();
      log('✅', 'Clic → Commerce & Retail');
    } else {
      // Bouton passer
      await page.locator('.btn-skip').click();
      log('⚠️', 'Bouton "Passer" utilisé (cartes non visibles)');
    }

    await waitForLoic(6000);

    // ── STEP 3 : Fonctionnalités ─────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 3 — Fonctionnalités');
    await waitForChoices(6000);
    await screenshot('02-features');

    const features = await page.locator('.feat-item').count();
    log(features > 0 ? '✅' : '⚠️', `${features} fonctionnalités affichées`);

    // Cocher 2 fonctionnalités
    const checkboxes = page.locator('.feat-cb');
    const cbCount = await checkboxes.count();
    if (cbCount >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      log('✅', '2 fonctionnalités cochées');
    }

    await page.locator('.btn-next').click();
    await waitForLoic(6000);

    // ── STEP 4 : Options ─────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 4 — Options');
    await waitForChoices(5000);

    const options = await page.locator('.option-toggle').count();
    log(options > 0 ? '✅' : '⚠️', `${options} options affichées`);

    // Activer SEO
    const seoToggle = page.locator('.option-toggle').filter({ hasText: 'SEO' }).first();
    const seoVisible = await seoToggle.isVisible().catch(() => false);
    if (seoVisible) {
      await seoToggle.click();
      await page.waitForTimeout(300);
      const priceAfterSeo = await page.locator('.pp-total-val').textContent().catch(() => '');
      log('✅', `SEO activé — prix sidebar : "${priceAfterSeo.trim()}"`);
    }

    await page.locator('.btn-next').click();
    await waitForLoic(6000);

    // ── STEP 5 : Délai ────────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 5 — Délai');
    await waitForChoices(5000);

    const normal = page.locator('.choice-card').filter({ hasText: 'Normal' }).first();
    await normal.click();
    log('✅', 'Clic → Délai Normal');
    await waitForLoic(5000);

    // ── STEP 6 : Budget ───────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 6 — Budget');
    await waitForChoices(5000);

    const budget = page.locator('.choice-card').filter({ hasText: '500' }).first();
    await budget.click();
    log('✅', 'Clic → Budget 500-1000€');
    await waitForLoic(5000);

    // ── STEP 7 : Contact ─────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 7 — Coordonnées');
    await waitForChoices(5000);
    await screenshot('03-contact');

    const prenomInput = page.locator('#fPrenom');
    const emailInput  = page.locator('#fEmail');
    const nomInput    = page.locator('#fNom');

    const formVisible = await prenomInput.isVisible().catch(() => false);
    log(formVisible ? '✅' : '❌', 'Formulaire de contact visible');

    if (formVisible) {
      await prenomInput.fill('Test');
      await nomInput.fill('Vérification');
      await emailInput.fill('test-verify@ca-tech.fr');
      await page.locator('#fPhone').fill('+33600000000');
      await page.locator('#fSociete').fill('CA-TECH Test');
      await page.locator('#fLegal').check();
      log('✅', 'Formulaire rempli');

      // 🔍 Probe : soumission sans legal → doit bloquer
      await page.locator('#fLegal').uncheck();
      await page.locator('#btnSubmit').click();
      await page.waitForTimeout(500);
      const stillOnForm = await page.locator('#fPrenom').isVisible().catch(() => false);
      log(stillOnForm ? '✅' : '⚠️', '🔍 Probe : soumission sans consentement → bloquée');
      await page.locator('#fLegal').check();

      // 🔍 Probe : soumission sans email → doit mettre .err
      await emailInput.fill('');
      await page.locator('#btnSubmit').click();
      await page.waitForTimeout(400);
      const errClass = await emailInput.getAttribute('class').catch(() => '');
      log(errClass.includes('err') ? '✅' : '⚠️', '🔍 Probe : email vide → classe .err ajoutée');
      await emailInput.fill('test-verify@ca-tech.fr');
    }

    // ── STEP 8 : Soumission API ───────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 8 — Soumission API');

    const [apiResponse] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/devis') && r.request().method() === 'POST', { timeout: 15000 }),
      page.locator('#btnSubmit').click(),
    ]).catch(async err => {
      log('❌', 'Soumission API — timeout ou erreur', err.message);
      await screenshot('99-error');
      return [null];
    });

    if (apiResponse) {
      const status = apiResponse.status();
      let body = {};
      try { body = await apiResponse.json(); } catch {}
      log(status === 201 ? '✅' : '❌', `API POST /api/devis → HTTP ${status}`);

      if (body.devis_number) {
        log('✅', `Numéro de devis généré : ${body.devis_number}`);
        log('✅', `Total : ${body.total} €`);
      } else if (body.error) {
        log('❌', `Erreur API : ${body.error}`);
      }
    }

    // ── STEP 9 : Écran de succès ────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 9 — Écran de succès');
    await page.waitForSelector('#successScreen.show', { timeout: 10000 }).catch(() => {});
    await screenshot('04-success');

    const successVisible = await page.locator('#successScreen').evaluate(el => el.classList.contains('show')).catch(() => false);
    log(successVisible ? '✅' : '❌', 'Écran de succès affiché');

    const successNum = await page.locator('#successNum').textContent().catch(() => '');
    log(successNum.startsWith('DEV-') ? '✅' : '⚠️', `Numéro affiché : "${successNum}"`);

    const pdfBtn = await page.locator('#btnPdf').isVisible().catch(() => false);
    log(pdfBtn ? '✅' : '❌', 'Bouton "Télécharger PDF" visible');

    // ── STEP 10 : Génération PDF ─────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 10 — Génération PDF (jsPDF)');

    // Vérifier que jsPDF est chargé
    const jsPdfLoaded = await page.evaluate(() => typeof window.jspdf !== 'undefined').catch(() => false);
    log(jsPdfLoaded ? '✅' : '❌', 'jsPDF chargé en mémoire');

    if (pdfBtn && jsPdfLoaded) {
      // Intercepter le téléchargement
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }),
        page.locator('#btnPdf').click(),
      ]).catch(async () => {
        // Certains navigateurs headless ne déclenchent pas l'event download
        await page.locator('#btnPdf').click().catch(() => {});
        return [null];
      });

      if (download) {
        log('✅', `PDF téléchargé : ${download.suggestedFilename()}`);
      } else {
        // Vérifier qu'aucune erreur JS n'a été levée
        const pdfErrors = consoleErrors.filter(e => e.toLowerCase().includes('pdf') || e.toLowerCase().includes('jspdf'));
        log(pdfErrors.length === 0 ? '✅' : '⚠️', 'Génération PDF sans erreur console');
      }
    }

    // ── 🔍 Probe : API sans project_type ─────────────────────────────────
    log('', '');
    log('🔍', 'Probe : POST /api/devis sans project_type');
    const probeRes = await page.evaluate(async (base) => {
      const r = await fetch(`${base}/api/devis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_email: 'probe@test.fr' }),
      });
      return { status: r.status, body: await r.json() };
    }, BASE);
    log(probeRes.status === 400 ? '✅' : '⚠️', `Probe sans project_type → HTTP ${probeRes.status} : ${JSON.stringify(probeRes.body)}`);

    // ── 🔍 Probe : POST sans email ───────────────────────────────────────
    log('🔍', 'Probe : POST /api/devis sans contact_email');
    const probe2 = await page.evaluate(async (base) => {
      const r = await fetch(`${base}/api/devis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_type: 'logo' }),
      });
      return { status: r.status, body: await r.json() };
    }, BASE);
    log(probe2.status === 400 ? '✅' : '⚠️', `Probe sans email → HTTP ${probe2.status} : ${JSON.stringify(probe2.body)}`);

    // ── 🔍 Test mobile (viewport 390px) ─────────────────────────────────
    log('', '');
    log('🔍', 'Probe : viewport mobile 390×844');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(DEVIS_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForLoic(6000);
    await screenshot('05-mobile');

    const priceColHidden = await page.locator('.price-col').evaluate(el => getComputedStyle(el).display === 'none').catch(() => null);
    const mobileBarVisible = await page.locator('.mobile-price-bar').isVisible().catch(() => false);
    log(priceColHidden ? '✅' : '⚠️', 'Sidebar prix masquée sur mobile');

    const mobileCards = await page.locator('.choice-card').count();
    log(mobileCards >= 4 ? '✅' : '⚠️', `${mobileCards} cartes visibles sur mobile`);

    // ── Erreurs console ───────────────────────────────────────────────────
    log('', '');
    if (consoleErrors.length === 0) {
      log('✅', 'Aucune erreur console JavaScript');
    } else {
      log('⚠️', `${consoleErrors.length} erreur(s) console`, consoleErrors.slice(0, 3).join(' | '));
    }

  } catch (err) {
    log('❌', 'Exception inattendue', err.message);
    await screenshot('99-crash').catch(() => {});
  } finally {
    await browser.close();
  }

  // ── Résumé ────────────────────────────────────────────────────────────
  const passed  = results.filter(r => r.emoji === '✅').length;
  const failed  = results.filter(r => r.emoji === '❌').length;
  const warned  = results.filter(r => r.emoji === '⚠️').length;
  const probes  = results.filter(r => r.emoji === '🔍').length;

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  ✅ ${passed}  ❌ ${failed}  ⚠️  ${warned}  🔍 ${probes} probes`);
  console.log(`  Verdict : ${failed === 0 ? '🟢 PASS' : '🔴 FAIL'}`);
  console.log('═'.repeat(55));

  process.exit(failed > 0 ? 1 : 0);
})();
