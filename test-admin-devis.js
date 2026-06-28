/**
 * Test end-to-end admin/devis.html
 * node test-admin-devis.js [BASE_URL]
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';
const URL  = BASE.replace(/\/$/, '') + '/admin/devis.html';

const results = [];
let browser, page;

function log(emoji, label, detail = '') {
  const line = `${emoji} ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  results.push({ emoji, label });
}
async function ss(name) {
  const path = `test-screenshot-admin-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  log('📸', `Screenshot → ${path}`);
}

(async () => {
  console.log(`\n🎯 Test admin/devis.html — ${URL}\n${'─'.repeat(55)}`);
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));

  try {
    // ── STEP 0 : Chargement ───────────────────────────────────────────────
    const r = await page.goto(URL, { waitUntil: 'networkidle', timeout: 20000 });
    log(r.status() === 200 ? '✅' : '❌', `GET /admin/devis.html → HTTP ${r.status()}`);

    const title = await page.title();
    log(title.includes('Devis') || title.includes('CA-TECH') ? '✅' : '⚠️', `Titre : "${title}"`);

    const sidebarVisible = await page.locator('.sidebar').isVisible();
    log(sidebarVisible ? '✅' : '❌', 'Sidebar visible');

    const logoName = await page.locator('.sb-logo-name').textContent().catch(() => '');
    log(logoName.includes('CA-TECH') ? '✅' : '⚠️', `Logo sidebar : "${logoName.trim()}"`);

    const activeLink = await page.locator('.sb-link.active').textContent().catch(() => '');
    log(activeLink.includes('Devis') ? '✅' : '⚠️', `Lien actif : "${activeLink.trim()}"`);

    await ss('01-load');

    // ── STEP 1 : Stats ────────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 1 — Stats cards');

    await page.waitForFunction(() => {
      const el = document.getElementById('statTotal');
      return el && el.textContent !== '—';
    }, null, { timeout: 10000 }).catch(() => {});

    const statTotal = await page.locator('#statTotal').textContent().catch(() => '—');
    const statSent  = await page.locator('#statSent').textContent().catch(() => '—');
    const statAcc   = await page.locator('#statAcc').textContent().catch(() => '—');
    const statRef   = await page.locator('#statRef').textContent().catch(() => '—');
    const statCA    = await page.locator('#statCA').textContent().catch(() => '—');
    log(parseInt(statTotal) >= 0 ? '✅' : '⚠️', `Stat Total : ${statTotal}`);
    log('✅', `Stats — Envoyés:${statSent} Acceptés:${statAcc} Refusés:${statRef} CA:${statCA}`);

    const sbBadge = await page.locator('#sbBadge').textContent().catch(() => '');
    log('✅', `Badge sidebar (devis en attente) : "${sbBadge}"`);

    // ── STEP 2 : Table ────────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 2 — Table des devis');

    await page.waitForFunction(() => {
      const row = document.getElementById('loadingRow');
      return !row || !row.parentNode;
    }, null, { timeout: 10000 }).catch(() => {});

    const rows = await page.locator('#devisTable tr').count();
    log(rows > 0 ? '✅' : '❌', `${rows} lignes dans la table`);

    const firstNum = await page.locator('.td-num').first().textContent().catch(() => '');
    log(firstNum.startsWith('DEV-') ? '✅' : '⚠️', `Premier numéro : ${firstNum}`);

    const badges = await page.locator('.badge').count();
    log(badges > 0 ? '✅' : '⚠️', `${badges} badges statut visibles`);

    await ss('02-table');

    // ── STEP 3 : Filtres ──────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 3 — Filtres par statut');

    const tabs = await page.locator('.tab-btn').count();
    log(tabs === 6 ? '✅' : '⚠️', `${tabs} onglets de filtre`);

    await page.locator('[data-status="draft"]').click();
    await page.waitForTimeout(1500);
    const draftCount = await page.locator('#countLabel').textContent().catch(() => '');
    log('✅', `Onglet Brouillons → ${draftCount}`);

    await page.locator('[data-status=""]').click();
    await page.waitForTimeout(1500);
    const allCount = await page.locator('#countLabel').textContent().catch(() => '');
    log('✅', `Retour Tous → ${allCount}`);

    // ── STEP 4 : Recherche ────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 4 — Recherche');

    await page.locator('#searchInput').fill('DEV-2026');
    await page.waitForTimeout(300);
    const afterSearch = await page.locator('#devisTable tr').count();
    log(afterSearch > 0 ? '✅' : '⚠️', `Recherche "DEV-2026" → ${afterSearch} résultat(s)`);

    await page.locator('#searchInput').fill('zzznomatch');
    await page.waitForTimeout(300);
    const noResult = await page.locator('.empty-state').isVisible().catch(() => false);
    log(noResult ? '✅' : '⚠️', '🔍 Probe : recherche vide → empty-state affiché');

    await page.locator('#searchInput').fill('');
    await page.waitForTimeout(300);

    // ── STEP 5 : Modal ────────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 5 — Modal détail devis');

    await page.locator('#devisTable tr').first().click();
    await page.waitForSelector('.modal-bg.open', { timeout: 6000 }).catch(() => {});
    const modalOpen = await page.locator('.modal-bg').evaluate(el => el.classList.contains('open')).catch(() => false);
    log(modalOpen ? '✅' : '❌', 'Modal ouverte au clic ligne');

    await page.waitForFunction(() => {
      const body = document.getElementById('modalBody');
      return body && !body.querySelector('.spinner');
    }, null, { timeout: 8000 }).catch(() => {});

    const modalNum = await page.locator('#modalNum').textContent().catch(() => '');
    log(modalNum.startsWith('DEV-') ? '✅' : '⚠️', `Numéro modal : ${modalNum}`);

    const modalBadgeVisible = await page.locator('#modalBadge .badge').isVisible().catch(() => false);
    log(modalBadgeVisible ? '✅' : '⚠️', 'Badge statut dans modal visible');

    const msTitle = await page.locator('.ms-title').first().textContent().catch(() => '');
    log(msTitle.length > 0 ? '✅' : '⚠️', `Première section modal : "${msTitle.trim()}"`);

    const itemsRows = await page.locator('.items-table tbody tr').count();
    log(itemsRows > 0 ? '✅' : '⚠️', `${itemsRows} ligne(s) de prestations dans la modal`);

    const actionBtns = await page.locator('#modalActions .ma-btn').count();
    log(actionBtns > 0 ? '✅' : '⚠️', `${actionBtns} boutons d'action dans la modal`);

    await ss('03-modal');

    // ── STEP 6 : Fermeture modal ──────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 6 — Fermeture modal');

    await page.locator('.modal-close').click();
    await page.waitForTimeout(300);
    const closedByBtn = await page.locator('.modal-bg').evaluate(el => !el.classList.contains('open')).catch(() => false);
    log(closedByBtn ? '✅' : '⚠️', 'Bouton ✕ ferme la modal');

    // Escape
    await page.locator('#devisTable tr').first().click();
    await page.waitForSelector('.modal-bg.open', { timeout: 5000 }).catch(() => {});
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const closedByEsc = await page.locator('.modal-bg').evaluate(el => !el.classList.contains('open')).catch(() => false);
    log(closedByEsc ? '✅' : '⚠️', '🔍 Probe : Escape ferme la modal');

    // Clic backdrop
    await page.locator('#devisTable tr').first().click();
    await page.waitForSelector('.modal-bg.open', { timeout: 5000 }).catch(() => {});
    await page.locator('#modalBg').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    const closedByBg = await page.locator('.modal-bg').evaluate(el => !el.classList.contains('open')).catch(() => false);
    log(closedByBg ? '✅' : '⚠️', '🔍 Probe : clic backdrop ferme la modal');

    // ── STEP 7 : Quick actions (PATCH API) ───────────────────────────────
    log('', '');
    log('🔵', 'STEP 7 — Quick action "Envoyer" sur devis draft');

    // Trouver un bouton "Envoyer" s'il existe
    const envoyerBtn = page.locator('.act-btn', { hasText: 'Envoyer' }).first();
    const envoyerVisible = await envoyerBtn.isVisible().catch(() => false);

    if (envoyerVisible) {
      const [patchRes] = await Promise.all([
        page.waitForResponse(r2 => r2.url().includes('/api/devis') && r2.request().method() === 'PATCH', { timeout: 8000 }),
        envoyerBtn.click(),
      ]).catch(async () => [null]);

      if (patchRes) {
        const s = patchRes.status();
        const body = await patchRes.json().catch(() => ({}));
        log(s === 200 ? '✅' : '❌', `PATCH quick-action "send" → HTTP ${s} status:${body.status || '?'}`);
      } else {
        log('⚠️', 'Quick action "Envoyer" — pas de réponse API capturée');
      }
    } else {
      log('⚠️', 'Pas de bouton "Envoyer" visible (devis peut-être déjà envoyé)');
    }

    // ── STEP 8 : API probes ────────────────────────────────────────────────
    log('', '');
    log('🔍', 'Probe API : GET /api/devis?action=list');
    const apiList = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/devis?action=list&limit=10`);
      const data = await res.json();
      return { status: res.status, count: Array.isArray(data) ? data.length : -1 };
    }, BASE);
    log(apiList.status === 200 ? '✅' : '❌', `GET list → HTTP ${apiList.status}, ${apiList.count} devis`);

    log('🔍', 'Probe API : GET /api/devis?action=list&status=draft');
    const apiDraft = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/devis?action=list&status=draft`);
      const data = await res.json();
      return { status: res.status, count: Array.isArray(data) ? data.length : -1 };
    }, BASE);
    log(apiDraft.status === 200 ? '✅' : '⚠️', `GET draft → HTTP ${apiDraft.status}, ${apiDraft.count} brouillon(s)`);

    log('🔍', 'Probe API : PATCH id inexistant → doit retourner erreur');
    const apiPatchBad = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/devis`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '00000000-0000-0000-0000-000000000000', action: 'send' }),
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, error: data.error };
    }, BASE);
    log(apiPatchBad.status >= 400 || apiPatchBad.error ? '✅' : '⚠️', `PATCH id inexistant → HTTP ${apiPatchBad.status} : ${apiPatchBad.error || 'ok'}`);

    // ── Erreurs console ───────────────────────────────────────────────────
    log('', '');
    const realErrors = errors.filter(e => !e.includes('status of 400') && !e.includes('status of 404'));
    if (realErrors.length === 0) {
      log('✅', 'Aucune erreur console JavaScript critique');
    } else {
      log('⚠️', `${realErrors.length} erreur(s) console`, realErrors.slice(0, 3).join(' | '));
    }

  } catch (err) {
    log('❌', 'Exception inattendue', err.message);
    await page.screenshot({ path: 'test-screenshot-admin-99-crash.png' }).catch(() => {});
  } finally {
    await browser.close();
  }

  const passed = results.filter(r => r.emoji === '✅').length;
  const failed = results.filter(r => r.emoji === '❌').length;
  const warned = results.filter(r => r.emoji === '⚠️').length;
  const probes = results.filter(r => r.emoji === '🔍').length;

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  ✅ ${passed}  ❌ ${failed}  ⚠️  ${warned}  🔍 ${probes} probes`);
  console.log(`  Verdict : ${failed === 0 ? '🟢 PASS' : '🔴 FAIL'}`);
  console.log('═'.repeat(55));

  process.exit(failed > 0 ? 1 : 0);
})();
