import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5174';
const OUT = 'verify-mobile-shots';

// Create output dir
import { mkdirSync } from 'fs';
try { mkdirSync(OUT); } catch {}

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const TABLET = { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`📸 ${name}.png`);
}

async function checkNavHidden(page, label) {
  const navLinks = await page.locator('#header .nav-links').isVisible().catch(() => false);
  const navCta = await page.locator('.nav-cta').isVisible().catch(() => false);
  const ham = await page.locator('.nav-ham').isVisible().catch(() => false);
  console.log(`[${label}] nav-links visible: ${navLinks}, nav-cta visible: ${navCta}, hamburger visible: ${ham}`);
  return { navLinks, navCta, ham };
}

// ── Mobile 390px ──────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: MOBILE, ...MOBILE });
  const page = await ctx.newPage();

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // 1. Hero + nav mobile
  await shot(page, '01-mobile-hero');
  const nav = await checkNavHidden(page, 'mobile-390');

  // 2. Scroll to services section
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(300);
  await shot(page, '02-mobile-services');

  // 3. Cases-grid / réalisations (to check if grid is 1-col on mobile)
  await page.goto(BASE + '/realisations.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await shot(page, '03-mobile-realisations');

  // Check cases-grid columns at 390px
  const casesGridCols = await page.evaluate(() => {
    const el = document.querySelector('.cases-grid');
    if (!el) return 'not found';
    return getComputedStyle(el).gridTemplateColumns;
  });
  console.log('[mobile-390] .cases-grid columns:', casesGridCols);

  // 4. Footer contrast check
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.scrollTo(0, 999999));
  await page.waitForTimeout(400);
  await shot(page, '04-mobile-footer');

  const footerOpacity = await page.evaluate(() => {
    const el = document.querySelector('.footer-desc');
    if (!el) return 'not found';
    return getComputedStyle(el).opacity;
  });
  console.log('[mobile-390] .footer-desc opacity:', footerOpacity);

  // 5. Scroll-padding-top — click a nav anchor and check offset
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  // Open hamburger then click a link
  const hamBtn = page.locator('.nav-ham');
  if (await hamBtn.isVisible()) {
    await hamBtn.click();
    await page.waitForTimeout(300);
    await shot(page, '05-mobile-menu-open');
  }

  await ctx.close();
}

// ── Tablet 820px ──────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: TABLET, ...TABLET });
  const page = await ctx.newPage();

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // 6. Nav at 820px — links should be VISIBLE (not hidden)
  await shot(page, '06-tablet-820-hero');
  const nav = await checkNavHidden(page, 'tablet-820');

  // 7. cases-grid at 820px — should be 2 cols (from 900px breakpoint)
  await page.goto(BASE + '/realisations.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await shot(page, '07-tablet-820-realisations');

  const casesGridCols = await page.evaluate(() => {
    const el = document.querySelector('.cases-grid');
    if (!el) return 'not found';
    return getComputedStyle(el).gridTemplateColumns;
  });
  console.log('[tablet-820] .cases-grid columns:', casesGridCols);

  await ctx.close();
}

// ── Mobile 375px (iPhone SE) ──────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true } });
  const page = await ctx.newPage();

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await shot(page, '08-mobile-375-hero');

  const nav = await checkNavHidden(page, 'mobile-375');

  await ctx.close();
}

await browser.close();
console.log('\n✅ All screenshots saved to:', OUT);
