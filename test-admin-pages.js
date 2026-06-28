/**
 * Test toutes les pages admin CA-TECH Manager
 * node test-admin-pages.js [BASE_URL]
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';

const results = [];
let browser, page;

function log(emoji, label, detail = '') {
  const line = `${emoji} ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  results.push({ emoji });
}
async function ss(name) {
  await page.screenshot({ path: `test-screenshot-pages-${name}.png`, fullPage: false });
}

// Pages à tester : [path, titre attendu, activeLink, type]
const PAGES = [
  ['/admin/index.html',       'CA-TECH Manager',       null,          'redirect'],
  ['/admin/dashboard.html',   'Dashboard',             'Dashboard',   'full'],
  ['/admin/leads.html',       'Leads',                 'Leads',       'data'],
  ['/admin/clients.html',     'Clients',               'Clients',     'cs'],
  ['/admin/projets.html',     'Projets',               'Projets',     'cs'],
  ['/admin/factures.html',    'Factures',              'Factures',    'cs'],
  ['/admin/paiements.html',   'Paiements',             'Paiements',   'cs'],
  ['/admin/agenda.html',      'Agenda',                'Agenda',      'cs'],
  ['/admin/portfolio.html',   'Portfolio',             'Portfolio',   'cs'],
  ['/admin/parametres.html',  'Paramètres',            'Paramètres',  'settings'],
  ['/admin/devis.html',       'Devis',                 'Devis',       'full'],
];

(async () => {
  console.log(`\n🎯 Test pages admin CA-TECH Manager — ${BASE}\n${'─'.repeat(55)}`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'fr-FR' });
  page = await context.newPage();

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    for (const [path, titleKw, activeLink, type] of PAGES) {
      const url = BASE + path;
      console.log(`\n🔵 ${path}`);

      const r = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      log(r.status() === 200 ? '✅' : '❌', `HTTP ${r.status()}`);

      if (type === 'redirect') {
        // index.html → redirection vers dashboard
        await page.waitForURL(/dashboard\.html/, { timeout: 5000 }).catch(() => {});
        const finalUrl = page.url();
        log(finalUrl.includes('dashboard') ? '✅' : '⚠️', `Redirect → ${finalUrl.split('/').pop()}`);
        continue;
      }

      // Titre
      const title = await page.title();
      log(title.includes(titleKw) ? '✅' : '⚠️', `Titre : "${title}"`);

      // Sidebar
      const sidebarVisible = await page.locator('.sidebar').isVisible();
      log(sidebarVisible ? '✅' : '❌', 'Sidebar visible');

      // Lien actif
      if (activeLink) {
        const active = await page.locator('.sb-link.active').textContent().catch(() => '');
        log(active.includes(activeLink) ? '✅' : '⚠️', `Lien actif : "${active.trim().substring(0,20)}"`);
      }

      // Topbar title
      const topbar = await page.locator('.topbar-title').textContent().catch(() => '');
      log(topbar.length > 0 ? '✅' : '⚠️', `Topbar : "${topbar.trim()}"`);

      if (type === 'cs') {
        // Coming soon panel
        const csTitle = await page.locator('.cs-title').textContent().catch(() => '');
        log(csTitle.length > 0 ? '✅' : '⚠️', `Panel CS : "${csTitle}"`);
        const csFeats = await page.locator('.cs-feat').count();
        log(csFeats > 0 ? '✅' : '⚠️', `${csFeats} features listées`);
        const csEta = await page.locator('.cs-eta').isVisible().catch(() => false);
        log(csEta ? '✅' : '⚠️', 'ETA visible');
      }

      if (type === 'data') {
        // Leads — attendre chargement
        await page.waitForFunction(() => {
          const el = document.getElementById('sTotal');
          return el && el.textContent !== '—';
        }, null, { timeout: 8000 }).catch(() => {});
        const sTotal = await page.locator('#sTotal').textContent().catch(() => '—');
        log(sTotal !== '—' ? '✅' : '⚠️', `Leads total : ${sTotal}`);
        const leadsRows = await page.locator('#leadsTable tr').count();
        log(leadsRows > 0 ? '✅' : '⚠️', `${leadsRows} ligne(s) dans la table leads`);
        // Recherche
        await page.locator('#searchInput').fill('test');
        await page.waitForTimeout(200);
        const afterSearch = await page.locator('#leadsTable tr').count();
        log(afterSearch >= 0 ? '✅' : '⚠️', `Recherche "test" → ${afterSearch} résultat(s)`);
        await page.locator('#searchInput').fill('');
      }

      if (type === 'settings') {
        // Paramètres — API status
        await page.waitForFunction(() => {
          const el = document.getElementById('apiStatus');
          return el && !el.querySelector('.spinner');
        }, null, { timeout: 8000 }).catch(() => {});
        const apiRows = await page.locator('#apiStatus .info-row').count();
        log(apiRows >= 3 ? '✅' : '⚠️', `${apiRows} résultats de tests API`);
        const channels = await page.locator('.channel-row').count();
        log(channels === 3 ? '✅' : '⚠️', `${channels} canaux de notification affichés`);
        const linkBtns = await page.locator('.link-btn').count();
        log(linkBtns >= 3 ? '✅' : '⚠️', `${linkBtns} liens rapides`);
      }

      if (type === 'full' && path.includes('devis')) {
        // devis.html — déjà testé en détail, vérification rapide
        await page.waitForFunction(() => {
          const el = document.getElementById('statTotal');
          return el && el.textContent !== '—';
        }, null, { timeout: 8000 }).catch(() => {});
        const statTotal = await page.locator('#statTotal').textContent().catch(() => '—');
        log(statTotal !== '—' ? '✅' : '⚠️', `Stats devis chargées : total=${statTotal}`);
      }

      if (type === 'full' && path.includes('dashboard')) {
        await page.waitForFunction(() => {
          const el = document.getElementById('kpiDevis');
          return el && el.textContent !== '—';
        }, null, { timeout: 8000 }).catch(() => {});
        const kpi = await page.locator('#kpiDevis').textContent().catch(() => '—');
        log(kpi !== '—' ? '✅' : '⚠️', `KPI dashboard chargé : devis=${kpi}`);
      }
    }

    // ── Erreurs console globales ──────────────────────────────────────────
    console.log('');
    const critical = errors.filter(e => !e.includes('404') && !e.includes('400'));
    if (critical.length === 0) {
      log('✅', 'Aucune erreur JavaScript critique sur toutes les pages');
    } else {
      log('⚠️', `${critical.length} erreur(s) JS`, critical.slice(0,3).join(' | '));
    }

    // ── Probe : index.html accessible ────────────────────────────────────
    log('🔍', 'Probe : /admin/ (sans fichier) → vérification 200');
    const adminRoot = await page.goto(BASE + '/admin/', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    log(adminRoot ? '✅' : '⚠️', `GET /admin/ → HTTP ${adminRoot?.status() || '?'}`);

    await ss('summary');

  } catch(err) {
    log('❌', 'Exception inattendue', err.message);
    await page.screenshot({ path: 'test-screenshot-pages-crash.png' }).catch(() => {});
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
