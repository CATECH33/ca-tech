/**
 * Test site principal CA-TECH
 * node test-site-principal.js [BASE_URL]
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
  await page.screenshot({ path: `test-screenshot-site-${name}.png`, fullPage: false });
  log('📸', `Screenshot → test-screenshot-site-${name}.png`);
}

// Pages to test
const PAGES = [
  { path: '/',                          title: 'CA-TECH',          type: 'home'      },
  { path: '/tarifs',                    title: 'Tarifs',           type: 'tarifs'    },
  { path: '/faq',                       title: 'FAQ',              type: 'content'   },
  { path: '/creation-site-vitrine',     title: 'Vitrine',          type: 'service'   },
  { path: '/creation-site-ecommerce',   title: 'E-commerce',       type: 'service'   },
  { path: '/creation-logo',             title: 'Logo',             type: 'service'   },
  { path: '/agence-web-paris',          title: 'Paris',            type: 'seo-local' },
  { path: '/agence-web-dijon',          title: 'Dijon',            type: 'seo-local' },
  { path: '/realisation-ca-tech-manager', title: 'CA-TECH',        type: 'realisation'},
  { path: '/mentions-legales',          title: 'Mentions',         type: 'content'   },
  { path: '/politique-de-confidentialite', title: 'Confidentialité', type: 'content' },
];

(async () => {
  console.log(`\n🌐 Test Site Principal CA-TECH — ${BASE}\n${'─'.repeat(60)}`);
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'fr-FR' });

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    // ── API probes first ─────────────────────────────────────────────────
    console.log('\n🔍 API Probes\n' + '─'.repeat(40));

    const rProducts = await page.goto(BASE + '/api/products', { waitUntil: 'networkidle', timeout: 15000 });
    log(rProducts.status() === 200 ? '✅' : '❌', `/api/products → HTTP ${rProducts.status()}`);
    try {
      const products = JSON.parse(await page.evaluate(() => document.body.innerText));
      log(Array.isArray(products) && products.length > 0 ? '✅' : '⚠️', `${Array.isArray(products) ? products.length : 0} produits retournés`);
    } catch { log('⚠️', 'Réponse /api/products non parseable'); }

    const rDevis = await page.goto(BASE + '/api/devis?action=list&limit=1', { waitUntil: 'networkidle', timeout: 15000 });
    log(rDevis.status() === 200 ? '✅' : '❌', `/api/devis → HTTP ${rDevis.status()}`);

    // ── Pages loop ────────────────────────────────────────────────────────
    for (const p of PAGES) {
      console.log(`\n🔵 ${p.path}`);
      const r = await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 20000 });
      log(r.status() === 200 ? '✅' : '❌', `HTTP ${r.status()}`);
      await page.waitForTimeout(1500);

      const title = await page.title();
      log(title.toLowerCase().includes(p.title.toLowerCase()) ? '✅' : '⚠️', `Titre : "${title.substring(0, 60)}"`);

      // Loader doit être caché après chargement
      await page.waitForFunction(() => {
        const el = document.getElementById('loader');
        if (!el) return true;
        const s = getComputedStyle(el);
        return el.classList.contains('hidden') || s.display === 'none' || parseFloat(s.opacity) < 0.1 || s.visibility === 'hidden';
      }, null, { timeout: 5000 }).catch(() => {});
      const loaderHidden = await page.evaluate(() => {
        const el = document.getElementById('loader');
        if (!el) return true;
        const s = getComputedStyle(el);
        return el.classList.contains('hidden') || s.display === 'none' || parseFloat(s.opacity) < 0.1 || s.visibility === 'hidden';
      });
      log(loaderHidden ? '✅' : '⚠️', 'Loader masqué');

      // Nav présente
      const nav = await page.locator('nav').first().isVisible().catch(() => false);
      log(nav ? '✅' : '⚠️', 'Nav visible');

      // Logo CA-TECH
      const logo = await page.locator('.logo, .logo-name').first().isVisible().catch(() => false);
      log(logo ? '✅' : '⚠️', 'Logo visible');

      // CTA "Devis gratuit" ou lien /devis dans la nav (peut être button onclick ou lien)
      const ctaNav = await page.locator('nav a[href*="devis"], nav a[href*="contact"], nav button, nav .btn-nav').count();
      log(ctaNav > 0 ? '✅' : '⚠️', `CTA dans nav (${ctaNav})`);

      // ── Type-specific checks ─────────────────────────────────────────

      if (p.type === 'home') {
        // Hero
        const hero = await page.locator('#hero, .hero, section').first().isVisible().catch(() => false);
        log(hero ? '✅' : '⚠️', 'Section hero visible');

        // JSON-LD present
        const jsonld = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);
        log(jsonld > 0 ? '✅' : '⚠️', `${jsonld} bloc(s) JSON-LD`);

        // Sections principales
        const h2s = await page.locator('h2, h1').count();
        log(h2s >= 3 ? '✅' : '⚠️', `${h2s} titres (h1/h2)`);

        // Footer
        const footer = await page.locator('footer').isVisible().catch(() => false);
        log(footer ? '✅' : '⚠️', 'Footer visible');

        await ss('01-home');
      }

      if (p.type === 'tarifs') {
        // Wait for pricing to load (may be dynamic)
        await page.waitForTimeout(1000);

        const pricingCards = await page.locator('.p-card, .pricing-card, .tarif-card, .price-card').count();
        log(pricingCards > 0 ? '✅' : '⚠️', `${pricingCards} cartes/cards`);

        // Prix en euros
        const euroText = await page.evaluate(() => document.body.innerText.includes('€'));
        log(euroText ? '✅' : '⚠️', 'Symbole € présent');

        // CTA "Devis"
        const ctaDevis = await page.locator('a[href*="devis"], button').count();
        log(ctaDevis > 0 ? '✅' : '⚠️', `${ctaDevis} CTA`);

        await ss('02-tarifs');
      }

      if (p.type === 'service') {
        // H1
        const h1 = await page.locator('h1').first().textContent().catch(() => '');
        log(h1.length > 5 ? '✅' : '⚠️', `H1 : "${h1.substring(0, 50)}"`);

        // Section features / avantages
        const features = await page.locator('ul li, .feature, .avantage, .benefit').count();
        log(features > 0 ? '✅' : '⚠️', `${features} éléments features/avantages`);

        // CTA vers devis ou contact
        const ctaLink = await page.locator('a[href*="devis"], a[href*="contact"], button[onclick*="devis"], button[onclick*="contact"]').count();
        log(ctaLink > 0 ? '✅' : '⚠️', `${ctaLink} CTA vers devis/contact`);
      }

      if (p.type === 'seo-local') {
        const h1 = await page.locator('h1').first().textContent().catch(() => '');
        const cityInH1 = h1.toLowerCase().includes(p.title.toLowerCase());
        log(cityInH1 ? '✅' : '⚠️', `Ville dans H1 : "${h1.substring(0, 50)}"`);

        // JSON-LD local
        const jsonld = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);
        log(jsonld > 0 ? '✅' : '⚠️', `${jsonld} bloc(s) JSON-LD`);

        // CTA
        const cta = await page.locator('a[href*="devis"], a[href*="contact"], button[onclick*="devis"], button[onclick*="contact"]').count();
        log(cta > 0 ? '✅' : '⚠️', `${cta} CTA vers devis/contact`);
      }

      if (p.type === 'realisation') {
        const h1 = await page.locator('h1').first().textContent().catch(() => '');
        log(h1.length > 3 ? '✅' : '⚠️', `H1 : "${h1.substring(0, 50)}"`);

        const imgs = await page.locator('img').count();
        log(imgs > 0 ? '✅' : '⚠️', `${imgs} image(s) sur la page`);
      }

      if (p.type === 'content') {
        const h1 = await page.locator('h1').first().textContent().catch(() => '');
        log(h1.length > 3 ? '✅' : '⚠️', `H1 : "${h1.substring(0, 50)}"`);

        const paragraphs = await page.locator('p').count();
        log(paragraphs >= 2 ? '✅' : '⚠️', `${paragraphs} paragraphe(s)`);
      }
    }

    // ── 🔍 Probes navigation ─────────────────────────────────────────────
    console.log('\n' + '─'.repeat(40));
    log('🔍', 'Probe : CTA principal homepage → devis/contact');
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    const ctaCount = await page.locator('a[href*="devis"], a[href*="contact"], button[onclick*="devis"], button[onclick*="contact"]').count();
    log(ctaCount > 0 ? '✅' : '⚠️', `${ctaCount} CTA devis/contact sur homepage`);

    log('🔍', 'Probe : page /devis accessible');
    const rDevisPage = await page.goto(BASE + '/devis', { waitUntil: 'networkidle', timeout: 20000 });
    log(rDevisPage.status() === 200 ? '✅' : '❌', `/devis → HTTP ${rDevisPage.status()}`);
    const chatVisible = await page.locator('#chat, .chat, .msg, #loic').isVisible().catch(() => false);
    log(chatVisible ? '✅' : '⚠️', 'Interface chat visible sur /devis');

    log('🔍', 'Probe : page /commande-confirmation');
    const rConf = await page.goto(BASE + '/commande-confirmation', { waitUntil: 'networkidle', timeout: 15000 });
    log(rConf.status() === 200 ? '✅' : '❌', `/commande-confirmation → HTTP ${rConf.status()}`);

    log('🔍', 'Probe : meta robots (non-admin pages = indexable)');
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
    const metaRobots = await page.evaluate(() => {
      const el = document.querySelector('meta[name="robots"]');
      return el ? el.content : 'absent';
    });
    log(!metaRobots.includes('noindex') ? '✅' : '⚠️', `meta robots index.html : "${metaRobots}"`);

    log('🔍', 'Probe : responsive 375px (mobile)');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    const mobileNav = await page.locator('nav').isVisible().catch(() => false);
    log(mobileNav ? '✅' : '⚠️', 'Nav visible mobile 375px');
    await ss('final-mobile');
    await page.setViewportSize({ width: 1280, height: 800 });

    // ── Erreurs JS ───────────────────────────────────────────────────────
    console.log('');
    const critical = errors.filter(e => !e.includes('404') && !e.includes('400') && !e.includes('EmailJS'));
    log(critical.length === 0 ? '✅' : '⚠️', critical.length === 0
      ? 'Aucune erreur JS critique'
      : `${critical.length} erreur(s) JS`, critical.slice(0, 2).join(' | '));

    await ss('final');

  } catch (err) {
    log('❌', 'Exception inattendue', err.message);
    await page.screenshot({ path: 'test-screenshot-site-crash.png' }).catch(() => {});
  } finally {
    await browser.close();
  }

  const passed  = results.filter(r => r.emoji === '✅').length;
  const failed  = results.filter(r => r.emoji === '❌').length;
  const warned  = results.filter(r => r.emoji === '⚠️').length;
  const probes  = results.filter(r => r.emoji === '🔍').length;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ✅ ${passed}  ❌ ${failed}  ⚠️  ${warned}  🔍 ${probes} probes`);
  console.log(`  Verdict : ${failed === 0 ? '🟢 PASS' : '🔴 FAIL'}`);
  console.log('═'.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
})();
