/**
 * Test Manager CA-TECH — vérification page Devis
 * node test-manager-devis.js [BASE_URL]
 * Env: MANAGER_EMAIL, MANAGER_PASSWORD
 */
const { chromium } = require('playwright');

const BASE  = process.argv[2] || 'https://www.ca-tech.fr';
const EMAIL = process.env.MANAGER_EMAIL    || 'contact@ca-tech.fr';
const PASS  = process.env.MANAGER_PASSWORD || '';

if (!PASS) {
  console.error('❌ MANAGER_PASSWORD non défini. Exemple :');
  console.error('   $env:MANAGER_PASSWORD="monmotdepasse"; node test-manager-devis.js');
  process.exit(1);
}

(async () => {
  console.log(`\n🧪  Test Manager Devis — ${BASE}\n${'─'.repeat(55)}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [browser:error] ${msg.text()}`);
  });
  page.on('pageerror', err => console.error('  [pageerror]', err.message));

  let ok = true;
  const fail = (msg) => { console.error('❌', msg); ok = false; };

  try {
    // ── 1. Charger le Manager ─────────────────────────────────────
    await page.goto(BASE + '/manager', { waitUntil: 'networkidle', timeout: 20000 });
    console.log(`✅ Manager chargé (URL finale : ${page.url()})`);

    // ── 2. Login ──────────────────────────────────────────────────
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');

    // Attendre redirection post-login (dashboard)
    await page.waitForFunction(() => !document.querySelector('input[type="password"]'), { timeout: 15000 });
    console.log('✅ Connexion réussie');

    // ── 3. Naviguer vers Devis ────────────────────────────────────
    // Chercher le lien "Devis" dans la sidebar
    const devisLink = page.locator('a', { hasText: 'Devis' }).first();
    await devisLink.waitFor({ timeout: 8000 });
    await devisLink.click();
    await page.waitForLoadState('networkidle');
    console.log(`✅ Page Devis chargée (URL : ${page.url()})`);

    // ── 4. Vérifier que la table des devis s'affiche ──────────────
    // Attendre qu'au moins une ligne de devis apparaisse (pas "Chargement…")
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      if (rows.length === 0) return false;
      // Vérifier que ce n'est pas le message "Chargement…"
      const firstCell = rows[0].querySelector('td');
      if (!firstCell) return false;
      return !firstCell.textContent.includes('Chargement');
    }, null, { timeout: 15000 });

    const rowCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    if (rowCount === 0) {
      fail('Aucune ligne dans la table devis');
    } else {
      console.log(`✅ ${rowCount} devis affichés dans la table`);
    }

    // ── 5. Vérifier la présence de DEV-2026-0022 ─────────────────
    const lastDevis = await page.locator('tbody tr').first().textContent();
    if (lastDevis.includes('DEV-2026')) {
      console.log(`✅ Numéro devis trouvé : ${lastDevis.match(/DEV-\d{4}-\d{4}/)?.[0] ?? '?'}`);
    } else {
      fail(`Numéro devis absent dans la première ligne : ${lastDevis.slice(0, 80)}`);
    }

    // ── 6. Vérifier les stats (Total devis > 0) ───────────────────
    const statsText = await page.locator('.grid').first().textContent();
    const totalMatch = statsText.match(/(\d+)/);
    if (totalMatch && parseInt(totalMatch[1]) > 0) {
      console.log(`✅ Stats : ${totalMatch[1]} devis au total`);
    } else {
      fail('Stats Total devis vaut 0 ou absent');
    }

    // ── 7. Ouvrir le détail d'un devis ────────────────────────────
    await page.locator('tbody tr').first().click();
    await page.waitForFunction(() => document.querySelector('#devis-document') !== null, { timeout: 8000 });
    console.log('✅ Fiche devis ouverte');

    // Vérifier que le numéro apparaît dans la fiche
    const ficheNum = await page.locator('#devis-document').textContent();
    if (ficheNum.includes('DEV-')) {
      console.log(`✅ Numéro dans la fiche : ${ficheNum.match(/DEV-\d{4}-\d{4}/)?.[0] ?? '?'}`);
    } else {
      fail('Numéro devis absent dans la fiche');
    }

    // ── 8. Vérifier les lignes de prestation ─────────────────────
    const ligneCount = await page.locator('#devis-document tbody tr').count();
    if (ligneCount > 0) {
      console.log(`✅ ${ligneCount} ligne(s) de prestation dans la fiche`);
    } else {
      fail('Aucune ligne de prestation dans la fiche (devis_items RLS?)');
    }

    // ── 9. Screenshot ─────────────────────────────────────────────
    await page.screenshot({ path: 'manager-devis-screenshot.png', fullPage: false });
    console.log('✅ Screenshot → manager-devis-screenshot.png');

    console.log(`\n${'═'.repeat(55)}`);
    if (ok) {
      console.log('  🟢 PASS — Manager Devis opérationnel');
    } else {
      console.log('  🔴 FAIL — Voir les erreurs ci-dessus');
    }
    console.log(`${'═'.repeat(55)}\n`);

  } catch (err) {
    console.error('\n❌ Exception :', err.message);
    await page.screenshot({ path: 'manager-devis-error.png' }).catch(() => {});
    console.log('  Screenshot erreur → manager-devis-error.png');
  } finally {
    await browser.close();
  }
})();
