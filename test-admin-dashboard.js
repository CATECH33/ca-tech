/**
 * Test end-to-end admin/dashboard.html
 * node test-admin-dashboard.js [BASE_URL]
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';
const URL  = BASE.replace(/\/$/, '') + '/admin/dashboard.html';

const results = [];
let browser, page;

function log(emoji, label, detail = '') {
  const line = `${emoji} ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  results.push({ emoji, label });
}
async function ss(name) {
  const path = `test-screenshot-dash-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  log('📸', `Screenshot → ${path}`);
}

(async () => {
  console.log(`\n🎯 Test admin/dashboard.html — ${URL}\n${'─'.repeat(55)}`);
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));

  try {
    // ── STEP 0 : Chargement ───────────────────────────────────────────────
    const r = await page.goto(URL, { waitUntil: 'networkidle', timeout: 20000 });
    log(r.status() === 200 ? '✅' : '❌', `GET /admin/dashboard.html → HTTP ${r.status()}`);

    const title = await page.title();
    log(title.includes('Dashboard') || title.includes('CA-TECH') ? '✅' : '⚠️', `Titre : "${title}"`);

    const sidebarVisible = await page.locator('.sidebar').isVisible();
    log(sidebarVisible ? '✅' : '❌', 'Sidebar visible');

    const activeLink = await page.locator('.sb-link.active').textContent().catch(() => '');
    log(activeLink.includes('Dashboard') ? '✅' : '⚠️', `Lien actif sidebar : "${activeLink.trim()}"`);

    const topbarDate = await page.locator('#topbarDate').textContent().catch(() => '');
    log(topbarDate.length > 5 ? '✅' : '⚠️', `Date topbar : "${topbarDate}"`);

    await ss('01-load');

    // ── STEP 1 : KPIs ─────────────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 1 — KPI cards');

    // Attendre que les KPIs se chargent
    await page.waitForFunction(() => {
      const el = document.getElementById('kpiDevis');
      return el && el.textContent !== '—';
    }, null, { timeout: 10000 }).catch(() => {});

    const kpiDevis = await page.locator('#kpiDevis').textContent().catch(() => '—');
    const kpiCA    = await page.locator('#kpiCA').textContent().catch(() => '—');
    const kpiLeads = await page.locator('#kpiLeads').textContent().catch(() => '—');
    const kpiConv  = await page.locator('#kpiConv').textContent().catch(() => '—');

    log(kpiDevis !== '—' ? '✅' : '❌', `KPI Devis ce mois : ${kpiDevis}`);
    log(kpiCA !== '—' ? '✅' : '❌', `KPI CA potentiel : ${kpiCA}`);
    log(kpiLeads !== '—' ? '✅' : '❌', `KPI Leads actifs : ${kpiLeads}`);
    log(kpiConv.includes('%') ? '✅' : '⚠️', `KPI Taux conversion : ${kpiConv}`);

    const kpiCards = await page.locator('.kpi-card').count();
    log(kpiCards === 4 ? '✅' : '⚠️', `${kpiCards} KPI cards affichées`);

    await ss('02-kpis');

    // ── STEP 2 : Devis récents ────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 2 — Devis récents');

    await page.waitForFunction(() => {
      const el = document.getElementById('recentDevis');
      return el && !el.querySelector('.spinner');
    }, null, { timeout: 10000 }).catch(() => {});

    const devisRows = await page.locator('.devis-row').count();
    log(devisRows > 0 ? '✅' : '⚠️', `${devisRows} devis récents affichés`);

    const firstDrNum = await page.locator('.dr-num').first().textContent().catch(() => '');
    log(firstDrNum.startsWith('DEV-') ? '✅' : '⚠️', `Premier devis : ${firstDrNum.trim()}`);

    const badges = await page.locator('#recentDevis .badge').count();
    log(badges > 0 ? '✅' : '⚠️', `${badges} badges statut dans la liste`);

    // ── STEP 3 : Type chart ───────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 3 — Répartition types de projet');

    await page.waitForFunction(() => {
      const el = document.getElementById('typeChart');
      return el && !el.querySelector('.spinner');
    }, null, { timeout: 8000 }).catch(() => {});

    const typeRows = await page.locator('.type-row').count();
    log(typeRows > 0 ? '✅' : '⚠️', `${typeRows} type(s) de projet dans le graphique`);

    const typeBar = await page.locator('.type-bar').first().evaluate(el => el.style.width).catch(() => '');
    log(typeBar && typeBar !== '0%' ? '✅' : '⚠️', `Barre de type : width="${typeBar}"`);

    // ── STEP 4 : Activity feed ────────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 4 — Feed d\'activité');

    await page.waitForFunction(() => {
      const el = document.getElementById('activityFeed');
      return el && !el.querySelector('.spinner');
    }, null, { timeout: 8000 }).catch(() => {});

    const afItems = await page.locator('.af-item').count();
    log(afItems > 0 ? '✅' : '⚠️', `${afItems} événements dans le feed d\'activité`);

    const firstAf = await page.locator('.af-text').first().textContent().catch(() => '');
    log(firstAf.includes('DEV-') ? '✅' : '⚠️', `Premier événement : "${firstAf.substring(0,60)}"`);

    await ss('03-feed');

    // ── STEP 5 : Actions rapides ──────────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 5 — Actions rapides');

    const qaBtns = await page.locator('.qa-btn').count();
    log(qaBtns === 4 ? '✅' : '⚠️', `${qaBtns} actions rapides affichées`);

    const qaFirst = await page.locator('.qa-btn').first().getAttribute('href').catch(() => '');
    log(qaFirst ? '✅' : '⚠️', `Première action rapide → href="${qaFirst}"`);

    // ── STEP 6 : Sidebar navigation ──────────────────────────────────────
    log('', '');
    log('🔵', 'STEP 6 — Navigation sidebar');

    const sbLinks = await page.locator('.sb-link').count();
    log(sbLinks >= 10 ? '✅' : '⚠️', `${sbLinks} liens dans la sidebar`);

    const devisLink = page.locator('.sb-link[href="devis.html"]');
    const devisLinkVisible = await devisLink.isVisible().catch(() => false);
    log(devisLinkVisible ? '✅' : '⚠️', 'Lien "Devis" dans la sidebar visible');

    // Badge sidebar (devis en attente)
    const sbBadge = await page.locator('#sbBadge').textContent().catch(() => '');
    log('✅', `Badge devis en attente : "${sbBadge || '(aucun)'}"`);

    // ── STEP 7 : Bouton "Nouveau devis" ──────────────────────────────────
    log('', '');
    log('🔵', 'STEP 7 — Bouton Nouveau devis');

    const newBtn = page.locator('.btn-primary');
    const newBtnVisible = await newBtn.isVisible().catch(() => false);
    log(newBtnVisible ? '✅' : '❌', 'Bouton "Nouveau devis" visible');
    const newBtnHref = await newBtn.getAttribute('href').catch(() => '');
    log(newBtnHref === '/devis' ? '✅' : '⚠️', `href="${newBtnHref}"`);

    // ── 🔍 Probe : responsive 768px ──────────────────────────────────────
    log('', '');
    log('🔍', 'Probe : viewport tablette 768×1024');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    const sidebarHidden = await page.locator('.sidebar').evaluate(el => getComputedStyle(el).display === 'none').catch(() => null);
    log(sidebarHidden ? '✅' : '⚠️', 'Sidebar masquée sur tablette');
    await ss('04-tablet');

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // ── 🔍 Probe : bouton Actualiser ─────────────────────────────────────
    log('🔍', 'Probe : bouton Actualiser déclenche GET /api/devis');
    const [refreshRes] = await Promise.all([
      page.waitForResponse(r2 => r2.url().includes('/api/devis'), { timeout: 8000 }),
      page.locator('button', { hasText: 'Actualiser' }).click(),
    ]).catch(async () => [null]);
    log(refreshRes && refreshRes.status() === 200 ? '✅' : '⚠️', `Actualiser → GET /api/devis HTTP ${refreshRes?.status() || '?'}`);

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
    await page.screenshot({ path: 'test-screenshot-dash-99-crash.png' }).catch(() => {});
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
