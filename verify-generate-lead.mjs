import { chromium } from 'playwright';

const PAGE = 'https://www.ca-tech.fr/devis';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  // Capture ALL GA4 request bodies
  const ga4Requests = [];
  page.on('request', req => {
    const url = req.url();
    if (url.includes('google-analytics.com/g/collect') ||
        url.includes('google-analytics.com/collect')) {
      const params = Object.fromEntries(new URL(url).searchParams);
      ga4Requests.push({ url, params, ts: Date.now() });
    }
  });

  // Load page
  console.log('→ Loading', PAGE);
  await page.goto(PAGE, { waitUntil: 'networkidle', timeout: 30000 });

  // Accept cookies
  const banner = page.locator('#ck-accept-all').first();
  if (await banner.isVisible({ timeout: 5000 }).catch(() => false)) {
    await banner.click();
    console.log('→ Cookie banner: accepted all');
  } else {
    // Inject consent directly
    await page.evaluate(() => {
      localStorage.setItem('ca-tech-cookies-consent', JSON.stringify({
        v: 2, ts: Date.now(),
        statistics: true, marketing: false,
        personalization: false, functional: false
      }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    console.log('→ Consent injected via localStorage');
  }

  // Wait for GA4 to load
  await page.waitForTimeout(2000);

  // Verify gtag is a function
  const gtagOk = await page.evaluate(() => typeof window.gtag === 'function');
  console.log('gtag is function:', gtagOk);

  // Fire generate_lead
  const t0 = Date.now();
  console.log('→ Firing generate_lead event...');
  await page.evaluate(() => {
    window.gtag('event', 'generate_lead', {
      currency:     'EUR',
      value:        1490,
      lead_source:  'devis_form',
      project_type: 'site_vitrine',
    });
  });

  // Wait for network flush (GA4 batches every ~1-2s)
  await page.waitForTimeout(5000);

  // Scroll to trigger a flush
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(2000);

  const newRequests = ga4Requests.filter(r => r.ts > t0);
  console.log('\n── GA4 requests after event fire ─────────────────────────');
  if (newRequests.length === 0) {
    console.log('  NONE');
  } else {
    newRequests.forEach((r, i) => {
      console.log(`\nRequest ${i + 1}:`);
      console.log('  en (event name):', r.params.en || 'N/A');
      console.log('  tid (property):', r.params.tid || 'N/A');
      // Check for generate_lead in the full URL
      const hasGL = r.url.includes('generate_lead');
      console.log('  contains generate_lead:', hasGL);
      // Print all event-related params
      const relevant = ['en', 'ep.currency', 'ep.value', 'ep.lead_source', 'ep.project_type',
                        'epn.value', 'currency', '_en'];
      relevant.forEach(k => {
        if (r.params[k]) console.log(`  ${k}:`, r.params[k]);
      });
    });
  }

  // Also check if generate_lead appears in ANY captured request
  const allWithGL = ga4Requests.filter(r => r.url.includes('generate_lead') || r.params.en === 'generate_lead');
  console.log('\n── generate_lead in ALL captured requests ─────────────────');
  console.log('  Total GA4 requests captured:', ga4Requests.length);
  console.log('  Requests with generate_lead:', allWithGL.length);
  allWithGL.forEach(r => {
    console.log('  URL (full):', r.url);
  });

  // Screenshot
  await page.screenshot({ path: 'verify-generate-lead.png', fullPage: false });

  // Summary
  console.log('\n══ VERDICT ═══════════════════════════════════════════════');
  const passed = allWithGL.length > 0;
  console.log('generate_lead sent to GA4:', passed ? 'YES ✓ PASS' : 'NO — investigating...');

  if (!passed && ga4Requests.length > 0) {
    console.log('\nAll event names captured:',
      [...new Set(ga4Requests.map(r => r.params.en))].join(', '));
  }

  await browser.close();
})();
