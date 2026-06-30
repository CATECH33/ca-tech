/**
 * Test visuel du PDF devis CA-TECH
 * Complète le formulaire, intercepte le PDF jsPDF, screenshot toutes les pages.
 * node test-pdf-visual.js [BASE_URL]
 */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';

async function waitForLoic(page, prev = 0, timeout = 12000) {
  await page.waitForFunction((p) => {
    const msgs = document.querySelectorAll('.msg:not(.user) .msg-bubble');
    if (msgs.length <= p) return false;
    return !msgs[msgs.length - 1].querySelector('.typing');
  }, prev, { timeout });
  await page.waitForTimeout(350);
}

async function loicCount(page) {
  return page.evaluate(() => document.querySelectorAll('.msg:not(.user) .msg-bubble').length);
}

(async () => {
  console.log(`\n🖨  Test visuel PDF devis — ${BASE}\n${'─'.repeat(50)}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'fr-FR',
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('[patch]') || msg.text().includes('PDF'))
      console.log('  [browser]', msg.type(), msg.text());
  });
  page.on('pageerror', err => console.log('  [pageerror]', err.message));

  try {
    // ── 1. Compléter le formulaire ────────────────────────────────
    await page.goto(BASE + '/devis', { waitUntil: 'networkidle', timeout: 20000 });
    await waitForLoic(page, 0, 12000);
    console.log('✅ Formulaire chargé');

    // Step 1 — Type projet : Site Vitrine
    let count = await loicCount(page);
    await page.locator('.choice-card').first().click();
    await waitForLoic(page, count);
    console.log('✅ Site Vitrine sélectionné');

    // Step 2 — Secteur
    count = await loicCount(page);
    await page.locator('.choice-card').first().click();
    await waitForLoic(page, count);
    console.log('✅ Secteur sélectionné');

    // Step 3 — Features : cocher 2 puis continuer
    count = await loicCount(page);
    const feats = await page.locator('.feat-item').all();
    if (feats.length >= 2) { await feats[0].click(); await feats[1].click(); }
    await page.locator('button', { hasText: 'Continuer' }).first().click();
    await waitForLoic(page, count);
    console.log('✅ Fonctionnalités sélectionnées');

    // Step 4 — Options : SEO
    count = await loicCount(page);
    const opts = await page.locator('.opt-item, .choice-card').all();
    if (opts.length > 0) await opts[0].click();
    await page.locator('button', { hasText: 'Continuer' }).first().click();
    await waitForLoic(page, count);
    console.log('✅ Options sélectionnées');

    // Step 5 — Délai
    count = await loicCount(page);
    await page.locator('.choice-card').nth(1).click();
    await waitForLoic(page, count);
    console.log('✅ Délai sélectionné');

    // Step 6 — Budget
    count = await loicCount(page);
    await page.locator('.choice-card').nth(2).click();
    await waitForLoic(page, count);
    console.log('✅ Budget sélectionné');

    // Step 7 — Coordonnées (champs réels : fPrenom, fNom, fEmail, fPhone, fSociete, fLegal)
    await page.waitForSelector('#fPrenom', { timeout: 10000 });
    await page.fill('#fPrenom',  'Marie');
    await page.fill('#fNom',     'Leblanc');
    await page.fill('#fEmail',   'marie@exemple.fr');
    await page.fill('#fPhone',   '+33 6 12 34 56 78').catch(() => {});
    await page.fill('#fSociete', 'Leblanc Consulting').catch(() => {});
    await page.locator('#fLegal').check();
    console.log('✅ Coordonnées remplies');

    // Soumettre — bouton "Générer mon devis →" (id=btnSubmit)
    await page.locator('#btnSubmit').click();
    // showSuccess() s'exécute directement après l'API (pas de message Loïc)
    await page.waitForSelector('#successScreen.show', { timeout: 25000 });
    console.log('✅ Écran de succès atteint');

    // ── 2. Intercepter le PDF via Proxy constructor ──────────────
    // Remplacer window.jspdf.jsPDF par un Proxy qui patch save() sur chaque instance
    const jspdfAvail = await page.evaluate(() => !!window.jspdf?.jsPDF);
    if (!jspdfAvail) throw new Error('jsPDF non disponible sur la page');

    // Diagnostic: vérifier l'état jsPDF avant patch
    const diag = await page.evaluate(() => ({
      hasJspdf: !!window.jspdf,
      hasCtor:  !!window.jspdf?.jsPDF,
      ctorName: window.jspdf?.jsPDF?.name,
      hasDlFn:  typeof window.downloadPDF,
    }));
    console.log('  jsPDF diag:', JSON.stringify(diag));

    await page.evaluate(() => {
      window.__pdfDataUri__ = null;
      const OrigClass = window.jspdf.jsPDF;
      window.jspdf.jsPDF = new Proxy(OrigClass, {
        construct(target, args, newTarget) {
          const instance = Reflect.construct(target, args, newTarget || target);
          const origSave = instance.save.bind(instance);
          instance.save = function(filename) {
            try { window.__pdfDataUri__ = instance.output('datauristring'); } catch(e) {}
            return origSave(filename);
          };
          return instance;
        }
      });
      console.log('[patch] Proxy installé, type:', typeof window.jspdf.jsPDF);
    });

    // Cliquer sur le bouton PDF (downloadPDF est async, attend la génération)
    await page.locator('#btnPdf').click();

    // Attendre que la génération soit terminée (poll sur __pdfDataUri__)
    await page.waitForFunction(
      () => !!(window.__pdfDataUri__ && window.__pdfDataUri__.length > 100),
      null,
      { timeout: 60000 }
    );
    const pdfDataUri = await page.evaluate(() => window.__pdfDataUri__);

    const pdfPath = 'pdf-devis-preview.pdf';
    const base64  = pdfDataUri.replace(/^data:application\/pdf;[^,]*,/, '');
    fs.writeFileSync(pdfPath, Buffer.from(base64, 'base64'));
    console.log('✅ PDF capturé → ' + pdfPath + ' (' + Math.round(fs.statSync(pdfPath).size / 1024) + ' Ko)');

    // ── 3. Valider le PDF (magic bytes) ──────────────────────────
    const pdfBuf  = fs.readFileSync(pdfPath);
    const header  = pdfBuf.slice(0, 5).toString('ascii');
    if (header !== '%PDF-') throw new Error('Fichier PDF invalide (header: ' + header + ')');
    console.log('✅ PDF valide (header: %PDF-' + pdfBuf.slice(5, 8).toString('ascii') + ', ' + Math.round(pdfBuf.length / 1024) + ' Ko)');

    // ── 4. Screenshot de la page succès ──────────────────────────
    await page.screenshot({ path: 'pdf-screenshot-success.png' });
    console.log('✅ Screenshot succès → pdf-screenshot-success.png');

    console.log(`\n${'═'.repeat(50)}`);
    console.log('  🟢 PDF premium généré et capturé avec succès');
    console.log('  Fichiers :');
    console.log('    📄 pdf-devis-preview.pdf  ← ouvrir pour vérifier le rendu');
    console.log('    🖼  pdf-screenshot-success.png');
    console.log('═'.repeat(50));

  } catch (err) {
    console.error('❌ Erreur :', err.message || err);
    await page.screenshot({ path: 'pdf-screenshot-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
