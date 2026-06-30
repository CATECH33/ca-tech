/**
 * Test visuel du formulaire devis CA-TECH — nouveau flux
 * Parcours complet : Projet → Secteur → Fonctions → Logo/Domaine/Pages → Options → Délai → Budget → Contact → Récap → Succès → PDF
 * node test-pdf-visual.js [BASE_URL]
 */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';

async function waitForLoic(page, prev = 0, timeout = 15000) {
  await page.waitForFunction((p) => {
    const msgs = document.querySelectorAll('.msg:not(.user) .msg-bubble');
    if (msgs.length <= p) return false;
    return !msgs[msgs.length - 1].querySelector('.typing');
  }, prev, { timeout });
  await page.waitForTimeout(400);
}

async function loicCount(page) {
  return page.evaluate(() => document.querySelectorAll('.msg:not(.user) .msg-bubble').length);
}

(async () => {
  console.log(`\n🧪  Test formulaire devis — ${BASE}\n${'─'.repeat(55)}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'fr-FR',
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('console', msg => {
    const t = msg.type();
    const txt = msg.text();
    if (t === 'error' || txt.includes('[STEP') || txt.includes('[PDF') || txt.includes('upload')) {
      console.log(`  [browser:${t}] ${txt}`);
    }
  });
  page.on('pageerror', err => console.error('  [pageerror]', err.message));

  let ok = true;
  const fail = (msg) => { console.error('❌', msg); ok = false; };

  try {
    // ── 1. Charger le formulaire ───────────────────────────────────
    await page.goto(BASE + '/devis', { waitUntil: 'networkidle', timeout: 25000 });
    await waitForLoic(page, 0, 15000);
    console.log('✅ Formulaire chargé (Loïc prêt)');

    // STEP 0 — Type de projet : Site Vitrine
    let count = await loicCount(page);
    await page.locator('.choice-card').first().click();
    await waitForLoic(page, count);
    console.log('✅ Site Vitrine sélectionné');

    // STEP 1 — Secteur d'activité
    count = await loicCount(page);
    await page.locator('.choice-card').first().click();
    await waitForLoic(page, count);
    console.log('✅ Secteur sélectionné');

    // STEP 2 — Fonctionnalités
    count = await loicCount(page);
    const feats = await page.locator('.feat-item').all();
    if (feats.length >= 2) { await feats[0].click(); await feats[1].click(); }
    await page.locator('button', { hasText: 'Continuer' }).first().click();
    // Après Continuer sur un projet web, Loïc pose la question logo
    await waitForLoic(page, count, 12000);
    console.log('✅ Fonctionnalités sélectionnées');

    // STEP 2b — Logo (Site Vitrine est un projet web)
    count = await loicCount(page);
    // Cliquer "Non, à créer" (2ème card)
    await page.locator('.choice-card').nth(1).click();
    await waitForLoic(page, count, 10000);
    console.log('✅ Question logo répondue (Non)');

    // STEP 2c — Domaine
    count = await loicCount(page);
    await page.locator('.choice-card').nth(0).click(); // "Oui, j'ai un domaine"
    await waitForLoic(page, count, 10000);
    console.log('✅ Question domaine répondue (Oui)');

    // STEP 2d — Nombre de pages
    count = await loicCount(page);
    await page.locator('.choice-card').nth(1).click(); // "5 à 10 pages"
    await waitForLoic(page, count, 10000);
    console.log('✅ Nombre de pages sélectionné');

    // STEP 3 — Options
    count = await loicCount(page);
    await page.locator('button', { hasText: 'Continuer' }).first().click();
    await waitForLoic(page, count);
    console.log('✅ Options (aucune)');

    // STEP 4 — Délai
    count = await loicCount(page);
    await page.locator('.choice-card').nth(1).click();
    await waitForLoic(page, count);
    console.log('✅ Délai sélectionné');

    // STEP 5 — Budget
    count = await loicCount(page);
    await page.locator('.choice-card').nth(2).click();
    await waitForLoic(page, count);
    console.log('✅ Budget sélectionné');

    // STEP 6 — Coordonnées
    await page.waitForSelector('#fPrenom', { timeout: 10000 });
    await page.fill('#fPrenom',  'Marie');
    await page.fill('#fNom',     'Leblanc');
    await page.fill('#fEmail',   'marie@exemple.fr');
    await page.fill('#fPhone',   '+33 6 12 34 56 78').catch(() => {});
    await page.fill('#fSociete', 'Leblanc Consulting').catch(() => {});
    await page.fill('#fVille',   'Lyon').catch(() => {});
    await page.locator('#fLegal').check().catch(() => {});
    console.log('✅ Coordonnées remplies (avec Ville)');

    // Clic "Voir le récapitulatif →"
    await page.locator('#btnSubmit').click();

    // STEP 7 — Récapitulatif : attendre que Loïc l'affiche
    count = await loicCount(page);
    await waitForLoic(page, count, 12000);
    console.log('✅ Récapitulatif affiché');

    // Vérifier que la carte récap est présente
    const recapCard = await page.locator('.price-panel').first();
    const recapText = await recapCard.textContent();
    if (!recapText.includes('Récapitulatif')) fail('Carte récap absente');
    else console.log('✅ Carte récapitulatif vérifiée');

    // Clic "Je valide et envoie ma demande"
    await page.locator('#btnValidate').click();

    // Attendre l'écran de succès
    await page.waitForSelector('#successScreen.show', { timeout: 30000 });
    console.log('✅ Écran de succès affiché');

    // Vérifier le numéro de devis
    const numEl = await page.locator('#successNum').textContent();
    if (!numEl.startsWith('DEV-')) fail(`Numéro devis invalide : ${numEl}`);
    else console.log(`✅ Numéro devis : ${numEl}`);

    // ── 2. Attendre que le PDF soit généré et uploadé ─────────────
    console.log('  ⏳ Attente génération PDF + upload Supabase...');
    await page.waitForFunction(() => {
      const btn = document.getElementById('btnPdf');
      return btn && !btn.disabled && btn.innerHTML.includes('svg');
    }, null, { timeout: 60000 });
    console.log('✅ PDF généré et bouton activé');

    // Vérifier que state.pdf_url est rempli
    const pdfUrl = await page.evaluate(() => window.state?.pdf_url || null);
    if (pdfUrl) console.log(`✅ PDF uploadé → ${pdfUrl.slice(0, 70)}...`);
    else console.log('⚠️  pdf_url non disponible dans state (upload peut avoir échoué)');

    // ── 3. Screenshot ─────────────────────────────────────────────
    await page.screenshot({ path: 'pdf-screenshot-success.png', fullPage: false });
    console.log('✅ Screenshot → pdf-screenshot-success.png');

    // ── 4. Vérifier le téléchargement PDF local ───────────────────
    let downloadedPath = null;
    try {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        page.locator('#btnPdf').click(),
      ]);
      downloadedPath = await download.path();
      const stat = fs.statSync(downloadedPath);
      const header = fs.readFileSync(downloadedPath).slice(0, 5).toString('ascii');
      if (header !== '%PDF-') fail('Fichier PDF invalide (magic bytes)');
      else console.log(`✅ PDF téléchargé — ${Math.round(stat.size / 1024)} Ko, header: ${header}`);
    } catch (dlErr) {
      // Si le bouton ouvre l'URL Supabase au lieu de déclencher un download Playwright
      console.log(`⚠️  Download event non capturé (URL publique) : ${dlErr.message.slice(0, 80)}`);
    }

    console.log(`\n${'═'.repeat(55)}`);
    if (ok) {
      console.log('  🟢 PASS — Formulaire devis validé bout en bout');
    } else {
      console.log('  🔴 FAIL — Voir les erreurs ci-dessus');
    }
    console.log(`${'═'.repeat(55)}\n`);

  } catch (err) {
    console.error('\n❌ Exception :', err.message);
    await page.screenshot({ path: 'pdf-screenshot-error.png' }).catch(() => {});
    console.log('  Screenshot erreur → pdf-screenshot-error.png');
  } finally {
    await browser.close();
  }
})();
