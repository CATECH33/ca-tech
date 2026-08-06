import { chromium } from 'playwright';

const URL = 'https://www.ca-tech.fr/gestion-des-cookies';

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Test 1 : affichage initial (sans consentement préalable) ──
  {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    console.log('── Test 1 : premier affichage (storage vide) ──────────────');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Bannière cookie ne doit PAS apparaître (data-no-cookie-banner)
    const bannerVisible = await page.locator('#ck-banner, [id*="cookie-banner"]').first().isVisible().catch(() => false);
    console.log('  Bannière supprimée (data-no-cookie-banner):', !bannerVisible ? 'OK' : 'FAIL — bannière visible');

    // Vérifier présence des toggles de catégories
    const toggles = await page.locator('.gc-toggle, [id^="gc-toggle-"]').count();
    console.log('  Toggles catégories présents:', toggles, toggles >= 4 ? '✓' : '✗ (attendu ≥4)');

    // Vérifier les boutons d'action
    const acceptAll  = await page.locator('#gc-accept-all').isVisible().catch(() => false);
    const refuseAll  = await page.locator('#gc-refuse-all').isVisible().catch(() => false);
    const saveBtn    = await page.locator('#gc-save').isVisible().catch(() => false);
    console.log('  Bouton "Tout accepter" :', acceptAll  ? '✓' : '✗');
    console.log('  Bouton "Tout refuser"  :', refuseAll  ? '✓' : '✗');
    console.log('  Bouton "Enregistrer"   :', saveBtn    ? '✓' : '✗');

    await page.screenshot({ path: 'verify-gc-init.png', fullPage: false });
    console.log('  Screenshot: verify-gc-init.png');
    await ctx.close();
  }

  // ── Test 2 : "Tout accepter" → toast + localStorage ──────────
  {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    console.log('\n── Test 2 : clic "Tout accepter" ──────────────────────────');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    await page.locator('#gc-accept-all').click();
    await page.waitForTimeout(800);

    // Toast de succès
    const toastVisible = await page.locator('#gc-success').isVisible().catch(() => false);
    console.log('  Toast succès visible:', toastVisible ? '✓' : '✗');

    // localStorage
    const stored = await page.evaluate(() => localStorage.getItem('ca-tech-cookies-consent'));
    const prefs  = stored ? JSON.parse(stored) : null;
    console.log('  localStorage présent:', prefs ? '✓' : '✗');
    if (prefs) {
      console.log('  statistics    :', prefs.statistics);
      console.log('  marketing     :', prefs.marketing);
      console.log('  personalization:', prefs.personalization);
      console.log('  functional    :', prefs.functional);
    }

    await page.screenshot({ path: 'verify-gc-accept.png', fullPage: false });
    console.log('  Screenshot: verify-gc-accept.png');
    await ctx.close();
  }

  // ── Test 3 : "Tout refuser" ────────────────────────────────────
  {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    console.log('\n── Test 3 : clic "Tout refuser" ────────────────────────────');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    await page.locator('#gc-refuse-all').click();
    await page.waitForTimeout(800);

    const stored = await page.evaluate(() => localStorage.getItem('ca-tech-cookies-consent'));
    const prefs  = stored ? JSON.parse(stored) : null;
    const allFalse = prefs && !prefs.statistics && !prefs.marketing && !prefs.personalization && !prefs.functional;
    console.log('  Toutes catégories refusées:', allFalse ? '✓' : '✗', prefs ? JSON.stringify(prefs) : 'null');

    await page.screenshot({ path: 'verify-gc-refuse.png', fullPage: false });
    console.log('  Screenshot: verify-gc-refuse.png');
    await ctx.close();
  }

  // ── Test 4 : consentement préexistant — toggles reflètent l'état
  {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    console.log('\n── Test 4 : rechargement avec consentement préexistant ─────');

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem('ca-tech-cookies-consent', JSON.stringify({
        v: 2, ts: Date.now(),
        statistics: true, marketing: false,
        personalization: false, functional: true
      }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const statToggle = await page.locator('#gc-toggle-statistics').getAttribute('aria-checked').catch(() => null);
    const mktToggle  = await page.locator('#gc-toggle-marketing').getAttribute('aria-checked').catch(() => null);
    const funcToggle = await page.locator('#gc-toggle-functional').getAttribute('aria-checked').catch(() => null);
    console.log('  statistics toggle (doit être true) :', statToggle);
    console.log('  marketing toggle (doit être false)  :', mktToggle);
    console.log('  functional toggle (doit être true)  :', funcToggle);

    await page.screenshot({ path: 'verify-gc-reload.png', fullPage: false });
    console.log('  Screenshot: verify-gc-reload.png');
    await ctx.close();
  }

  await browser.close();

  console.log('\n══ RÉSUMÉ ════════════════════════════════════════════════');
})();
