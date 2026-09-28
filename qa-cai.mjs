import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/collaborateurs-ia';

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // ─── DESKTOP PASS ──────────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const consoleErrs = [];
    const networkFails = [];
    const jsErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrs.push(msg.text()); });
    page.on('pageerror', e => jsErrors.push(e.message));
    page.on('response', r => {
      const s = r.status();
      if (s >= 400 && !r.url().includes('hot-update') && !r.url().includes('localhost:5173/@'))
        networkFails.push({ url: r.url().substring(0, 120), status: s });
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Force all reveals visible
    await page.evaluate(() => document.querySelectorAll('.cai-reveal').forEach(el => el.classList.add('visible')));

    // ── NAVIGATION ──
    const navLinks = await page.evaluate(() =>
      [...document.querySelectorAll('nav a, header a')].map(a => ({
        text: a.textContent.trim().slice(0, 40),
        href: a.getAttribute('href'),
      }))
    );

    // ── HERO ──
    const heroH1 = await page.textContent('h1').catch(() => null);
    const heroPanel = !!(await page.$('.cai-hero-ui'));
    const heroEntries = await page.$$('.cai-hui-entry');
    const heroDemoBar = !!(await page.$('.cai-hui-demo-bar'));
    const heroOverflow = await page.evaluate(() => {
      const el = document.querySelector('.cai-hero');
      return el ? el.scrollWidth > el.clientWidth + 2 : false;
    });

    // ── CARDS ──
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll('.cai-col-card')].map(card => ({
        name: card.querySelector('.cai-col-name')?.textContent?.trim(),
        hasDesc: !!card.querySelector('.cai-col-desc'),
        hasMissions: !!card.querySelector('.cai-col-missions'),
        hasMetricsLabel: card.querySelector('.cai-col-metrics-label')?.textContent?.trim(),
        hasPrice290: !!card.querySelector('.cai-col-price')?.textContent?.includes('290'),
        hasPrimaryCTA: !!card.querySelector('.cai-col-cta--primary'),
        hasOutlineCTA: !!card.querySelector('.cai-col-cta--outline'),
        hasDrawerLink: !!card.querySelector('.cai-col-cta-link'),
        hasVisual: !!card.querySelector('.cai-cv'),
        hasExemple: !!card.querySelector('.cai-cv-demo'),
        statusText: card.querySelector('.cai-col-status')?.textContent?.trim(),
      }))
    );

    // ── DRAWER — test each card ──
    const drawerResults = [];
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const links = await page.$$('.cai-col-cta-link');
      if (!links[i]) { drawerResults.push({ idx: i, error: 'link not found' }); continue; }
      await links[i].evaluate(el => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(200);
      await links[i].click({ force: true });
      await page.waitForTimeout(1000);

      const opened = !!(await page.$('.dd-body'));
      const title = await page.$eval('.dd-title', el => el.textContent.trim()).catch(() => null);
      const imgSrc = await page.$eval('.dd-hero-img', el => el.src).catch(() => null);
      const ctaCount = (await page.$$('.dd-btn')).length;
      const missionsCount = (await page.$$('.dd-list li')).length;
      const hasMetrics = !!(await page.$('.dd-metric'));
      const hasFaq = !!(await page.$('.dd-faq'));

      // close via evaluate to bypass nav overlap
      await page.evaluate(() => {
        const btn = document.querySelector('.dd-close');
        if (btn) btn.click();
      });
      await page.waitForTimeout(500);
      const closed = !(await page.$('.dd-body'));

      drawerResults.push({ idx: i, opened, title, imgSrc: imgSrc?.slice(0, 80), ctaCount, missionsCount, hasMetrics, hasFaq, closed });
    }

    // ESC key test
    const firstLink = await page.$('.cai-col-cta-link');
    if (firstLink) {
      await firstLink.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await firstLink.click({ force: true });
      await page.waitForTimeout(600);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
    const drawerClosedByEsc = !(await page.$('.dd-body'));

    // Body scroll after close
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);

    // ── FAQ ──
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.85));
    await page.waitForTimeout(600);
    const faqBtns = await page.$$('[class*="faq"] button, .seo-faq-item button');
    let faqOk = false;
    if (faqBtns.length > 0) {
      await faqBtns[0].click({ force: true });
      await page.waitForTimeout(300);
      faqOk = true;
    }

    // ── CTA inventory ──
    const ctaInventory = await page.evaluate(() =>
      [...document.querySelectorAll('a.btn-primary, a.btn-outline, a.cai-col-cta, a.btn-cta-white, a.btn-cta-outline, a.cai-col-cta--primary, a.cai-col-cta--outline')].map(el => ({
        text: el.textContent.trim().slice(0, 50),
        href: el.getAttribute('href'),
        valid: !!(el.getAttribute('href')),
      }))
    );
    const deadLinks = ctaInventory.filter(c => !c.valid || c.href === '#');

    // Scroll anchor
    await page.evaluate(() => window.scrollTo(0, 0));
    const anchorEl = await page.$('a[href="#collaborateurs"]');
    const scrollAnchorOk = !!anchorEl;

    // ── SEO ──
    const seo = await page.evaluate(() => ({
      title: document.title,
      metaDesc: document.querySelector('meta[name="description"]')?.content?.slice(0, 120),
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content?.slice(0, 80),
      jsonLdTypes: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'PARSE_ERROR'; } }),
    }));

    // ── PAGE OVERFLOW ──
    const pageOverflowX = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 2
    );

    // ── LOÏC ──
    const loicWidget = await page.evaluate(() =>
      !!document.querySelector('#loic-widget, [data-loic], script[src*="loic"]') ||
      !!document.querySelector('script[src*="loic-widget"]')
    );

    // ── GA4 / AXEPTIO ──
    const ga4 = await page.evaluate(() =>
      typeof window.gtag === 'function' || !!document.querySelector('script[src*="googletagmanager"]')
    );
    const axeptio = await page.evaluate(() =>
      !!(window._axcb || document.querySelector('#axeptio_btn') || document.querySelector('[class*="axeptio"]') || document.querySelector('script[src*="axeptio"]'))
    );

    results.desktop = {
      navLinks,
      heroH1: heroH1?.trim().slice(0, 100),
      heroPanel,
      heroEntryCount: heroEntries.length,
      heroDemoBar,
      heroOverflow,
      cards,
      drawerResults,
      drawerClosedByEsc,
      bodyOverflowAfterClose: bodyOverflow,
      faqButtonCount: faqBtns.length,
      faqOk,
      ctaInventory: ctaInventory.slice(0, 20),
      deadLinks,
      scrollAnchorOk,
      seo,
      pageOverflowX,
      loicWidget,
      ga4,
      axeptio,
      consoleErrors: consoleErrs,
      networkFails,
      jsErrors,
    };

    await page.close();
  }

  // ─── RESPONSIVE ────────────────────────────────────────────
  const viewports = [
    { w: 1440, h: 900,  name: 'desktop_1440' },
    { w: 960,  h: 1024, name: 'tablet_960' },
    { w: 390,  h: 844,  name: 'mobile_390' },
    { w: 375,  h: 812,  name: 'mobile_375' },
  ];

  results.responsive = {};
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => document.querySelectorAll('.cai-reveal').forEach(el => el.classList.add('visible')));

    const check = await page.evaluate(() => {
      const html = document.documentElement;
      const huiPanel = document.querySelector('.cai-hero-ui');
      const panelRect = huiPanel?.getBoundingClientRect();
      const entries = [...document.querySelectorAll('.cai-hui-entry')];
      const visibleEntries = entries.filter(e => getComputedStyle(e).display !== 'none');
      const clippedEntries = visibleEntries.filter(e => {
        if (!panelRect) return false;
        const r = e.getBoundingClientRect();
        return r.bottom > panelRect.bottom + 4 || r.top < panelRect.top - 4;
      });
      return {
        overflowX: html.scrollWidth > html.clientWidth + 2,
        cardsCount: document.querySelectorAll('.cai-col-card').length,
        heroPanel: !!huiPanel,
        heroPanelH: panelRect ? Math.round(panelRect.height) : 0,
        totalEntries: entries.length,
        visibleEntries: visibleEntries.length,
        clippedEntries: clippedEntries.length,
        h1Visible: !!document.querySelector('h1'),
        navVisible: !!document.querySelector('nav'),
        footerVisible: !!document.querySelector('footer'),
      };
    });

    // Test drawer open/close on this viewport
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const link = await page.$('.cai-col-cta-link');
    if (link) {
      await link.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await link.click({ force: true });
      await page.waitForTimeout(800);
    }
    const drawerOnVp = !!(await page.$('.dd-body'));
    if (drawerOnVp) {
      await page.evaluate(() => { const btn = document.querySelector('.dd-close'); if (btn) btn.click(); });
      await page.waitForTimeout(400);
    }

    results.responsive[vp.name] = { ...check, drawerOpens: drawerOnVp };
    await page.close();
  }

  await browser.close();
  return results;
}

runQA()
  .then(r => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error('QA_FATAL:', e.message);
    process.exit(1);
  });
