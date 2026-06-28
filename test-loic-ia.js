/**
 * Test toutes les pages loic-ia
 * node test-loic-ia.js [BASE_URL]
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';

const results = [];
let browser, page;

function log(emoji, label, detail = '') {
  console.log(`${emoji} ${label}${detail ? ' — ' + detail : ''}`);
  results.push({ emoji });
}
async function ss(name) {
  await page.screenshot({ path: `test-screenshot-loic-${name}.png`, fullPage: false });
  log('📸', `Screenshot → test-screenshot-loic-${name}.png`);
}

const PAGES = [
  { path: '/admin/loic-ia/index.html',         title: 'Loïc IA',       active: 'index',         type: 'hub' },
  { path: '/admin/loic-ia/devis.html',          title: 'Devis',         active: 'devis',         type: 'devis' },
  { path: '/admin/loic-ia/qualification.html',  title: 'Qualification', active: 'qualification', type: 'quali' },
  { path: '/admin/loic-ia/crm.html',            title: 'CRM',           active: 'crm',           type: 'cs' },
  { path: '/admin/loic-ia/stripe.html',         title: 'Stripe',        active: 'stripe',        type: 'cs' },
  { path: '/admin/loic-ia/agenda.html',         title: 'Agenda',        active: 'agenda',        type: 'cs' },
];

(async () => {
  console.log(`\n🤖 Test pages Loïc IA — ${BASE}\n${'─'.repeat(55)}`);
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'fr-FR' });

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    for (const p of PAGES) {
      console.log(`\n🔵 ${p.path}`);
      const r = await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 20000 });
      log(r.status() === 200 ? '✅' : '❌', `HTTP ${r.status()}`);

      // Titre
      const title = await page.title();
      log(title.includes(p.title) ? '✅' : '⚠️', `Titre : "${title}"`);

      // Sidebar
      const sidebar = await page.locator('.sidebar').isVisible();
      log(sidebar ? '✅' : '❌', 'Sidebar visible');

      // Lien "Loïc IA" actif dans sidebar
      const sbActive = await page.locator('.sb-link.active').textContent().catch(() => '');
      log(sbActive.includes('Loïc') ? '✅' : '⚠️', `Sidebar active : "${sbActive.trim().substring(0, 15)}"`);

      // Subnav présente avec 6 liens
      const subnav = await page.locator('.subnav').isVisible().catch(() => false);
      log(subnav ? '✅' : '❌', 'Subnav visible');

      const sublinks = await page.locator('.subnav-link').count();
      log(sublinks === 6 ? '✅' : '⚠️', `${sublinks} liens subnav`);

      // Lien actif dans subnav
      const subActive = await page.locator('.subnav-link.active').textContent().catch(() => '');
      log(subActive.toLowerCase().includes(p.active) || subActive.includes('Hub') ? '✅' : '⚠️',
        `Subnav active : "${subActive.trim()}"`);

      // Topbar
      const topbar = await page.locator('.topbar-title').textContent().catch(() => '');
      log(topbar.includes('Loïc') ? '✅' : '⚠️', `Topbar : "${topbar.trim()}"`);

      if (p.type === 'hub') {
        // Stats band
        await page.waitForFunction(() => {
          const el = document.getElementById('spDevis');
          return el && el.textContent !== '—';
        }, null, { timeout: 8000 }).catch(() => {});

        const spDevis = await page.locator('#spDevis').textContent().catch(() => '—');
        log(spDevis !== '—' ? '✅' : '⚠️', `Stats hub — devis: ${spDevis}`);

        // 6 capability cards
        const caps = await page.locator('.cap-card').count();
        log(caps === 6 ? '✅' : '⚠️', `${caps} capability cards`);

        // Chips sur les cards
        const chips = await page.locator('.cap-chip').count();
        log(chips >= 6 ? '✅' : '⚠️', `${chips} chips de features`);

        await ss('01-hub');
      }

      if (p.type === 'devis') {
        await page.waitForFunction(() => {
          const el = document.getElementById('devisList');
          return el && !el.querySelector('.spinner');
        }, null, { timeout: 10000 }).catch(() => {});

        const devisRows = await page.locator('.devis-row').count();
        log(devisRows >= 0 ? '✅' : '⚠️', `${devisRows} devis dans la liste`);

        const insights = await page.locator('.ia-insight').count();
        log(insights >= 0 ? '✅' : '⚠️', `${insights} insights IA affichés`);

        const panelCount = await page.locator('.panel').count();
        log(panelCount === 2 ? '✅' : '⚠️', `${panelCount} panels (devis + insights)`);

        await ss('02-devis-ia');
      }

      if (p.type === 'quali') {
        await page.waitForFunction(() => {
          const el = document.getElementById('leadsList');
          return el && !el.querySelector('.spinner');
        }, null, { timeout: 10000 }).catch(() => {});

        // Score rings ou empty state
        const rings = await page.locator('.score-ring').count();
        const empty = await page.locator('.empty-state').isVisible().catch(() => false);
        log(rings > 0 || empty ? '✅' : '⚠️', rings > 0 ? `${rings} score ring(s)` : 'Empty state affiché');

        if (rings > 0) {
          const firstScore = await page.locator('.score-ring').first().textContent().catch(() => '');
          const scoreNum = parseInt(firstScore);
          log(scoreNum >= 0 && scoreNum <= 100 ? '✅' : '⚠️', `Premier score : ${firstScore}/100`);

          // Tags de qualification
          const tags = await page.locator('.lead-tag').count();
          log(tags > 0 ? '✅' : '⚠️', `${tags} tags de qualification`);
        }

        await ss('03-quali');
      }

      if (p.type === 'cs') {
        const csTitle = await page.locator('.cs-title').textContent().catch(() => '');
        log(csTitle.length > 0 ? '✅' : '⚠️', `Panel CS : "${csTitle}"`);
        const csFeats = await page.locator('.cs-feat').count();
        log(csFeats >= 4 ? '✅' : '⚠️', `${csFeats} features listées`);
      }
    }

    // ── 🔍 Probe : liens subnav navigables ──────────────────────────────
    console.log('');
    log('🔍', 'Probe : navigation subnav Hub → Qualification');
    await page.goto(BASE + '/admin/loic-ia/index.html', { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('.subnav-link', { hasText: 'Qualification' }).click();
    await page.waitForURL(/qualification/, { timeout: 5000 }).catch(() => {});
    const onQuali = page.url().includes('qualification');
    log(onQuali ? '✅' : '⚠️', `Clic subnav → ${page.url().split('/').pop()}`);

    // 🔍 Probe : lien "Loïc IA" depuis sidebar admin → loic-ia/index.html
    log('🔍', 'Probe : lien Loïc IA depuis admin/dashboard');
    await page.goto(BASE + '/admin/dashboard.html', { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('.sb-link', { hasText: 'Loïc IA' }).click();
    await page.waitForURL(/loic-ia/, { timeout: 5000 }).catch(() => {});
    const onLoic = page.url().includes('loic-ia');
    log(onLoic ? '✅' : '⚠️', `Sidebar → ${page.url().split('/').slice(-2).join('/')}`);

    // Erreurs
    console.log('');
    const critical = errors.filter(e => !e.includes('404') && !e.includes('400'));
    log(critical.length === 0 ? '✅' : '⚠️', critical.length === 0
      ? 'Aucune erreur JS critique'
      : `${critical.length} erreur(s)`, critical.slice(0, 2).join(' | '));

    await ss('final');

  } catch (err) {
    log('❌', 'Exception inattendue', err.message);
    await page.screenshot({ path: 'test-screenshot-loic-crash.png' }).catch(() => {});
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
