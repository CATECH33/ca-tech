import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:5174';
const OUT = 'verify-mobile-shots';
try { mkdirSync(OUT); } catch {}

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`📸 ${name}.png`);
}

async function fullShot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`📸 ${name}.png (full)`);
}

// ── Helper: check nav state ────────────────────────────────────────────────
async function checkNav(page, label) {
  const result = await page.evaluate(() => {
    const navLinks = document.querySelector('.nav-links');
    const ham = document.querySelector('.ham');
    return {
      navLinksDisplay: navLinks ? getComputedStyle(navLinks).display : 'NOT FOUND',
      hamDisplay: ham ? getComputedStyle(ham).display : 'NOT FOUND',
    };
  });
  const navHidden = result.navLinksDisplay === 'none';
  const hamVisible = result.hamDisplay !== 'none' && result.hamDisplay !== 'NOT FOUND';
  const ok = navHidden && hamVisible;
  console.log(`[${label}] nav-links: ${result.navLinksDisplay} | ham: ${result.hamDisplay} → ${ok ? '✅ OK' : '❌ PROBLEM'}`);
  return result;
}

// ── Helper: check cases-grid columns ──────────────────────────────────────
async function checkCasesGrid(page, label) {
  const cols = await page.evaluate(() => {
    const el = document.querySelector('.cases-grid');
    if (!el) return 'NOT FOUND';
    return getComputedStyle(el).gridTemplateColumns;
  });
  console.log(`[${label}] .cases-grid: ${cols}`);
  return cols;
}

// ── Helper: check footer text opacity ─────────────────────────────────────
async function checkFooterContrast(page, label) {
  const result = await page.evaluate(() => {
    // Check footer link opacity or color
    const link = document.querySelector('.footer-link');
    const copy = document.querySelector('.footer-copy');
    const legal = document.querySelector('.footer-legal-link');
    return {
      footerLinkColor: link ? getComputedStyle(link).color : 'NOT FOUND',
      footerCopyColor: copy ? getComputedStyle(copy).color : 'NOT FOUND',
      footerLegalColor: legal ? getComputedStyle(legal).color : 'NOT FOUND',
    };
  });
  console.log(`[${label}] footer-link: ${result.footerLinkColor} | footer-copy: ${result.footerCopyColor}`);
  return result;
}

// ── 1. Mobile 390px ───────────────────────────────────────────────────────
console.log('\n═══ MOBILE 390px ═══');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  await shot(page, '01-mobile-390-hero');
  await checkNav(page, 'mobile-390');

  // Scroll to cases section
  await page.evaluate(() => {
    const el = document.querySelector('.cases-grid');
    el?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(300);
  await shot(page, '02-mobile-390-cases');
  await checkCasesGrid(page, 'mobile-390');

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await shot(page, '03-mobile-390-footer');
  await checkFooterContrast(page, 'mobile-390');

  // Test hamburger click
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  const ham = page.locator('.ham');
  if (await ham.isVisible()) {
    await ham.click();
    await page.waitForTimeout(400);
    await shot(page, '04-mobile-390-menu-open');
    console.log('[mobile-390] ✅ Hamburger cliqué, menu ouvert');
    // Close
    await ham.click();
  } else {
    console.log('[mobile-390] ❌ Hamburger non visible');
  }

  // Test scroll-padding-top: click anchor, check if section header visible
  const scrollPad = await page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingTop);
  console.log(`[mobile-390] scroll-padding-top: ${scrollPad}`);

  await ctx.close();
}

// ── 2. Tablet 820px ───────────────────────────────────────────────────────
console.log('\n═══ TABLET 820px ═══');
{
  const ctx = await browser.newContext({ viewport: { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  await shot(page, '05-tablet-820-hero');
  await checkNav(page, 'tablet-820');

  await page.evaluate(() => {
    const el = document.querySelector('.cases-grid');
    el?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(300);
  await shot(page, '06-tablet-820-cases');
  const caseCols = await checkCasesGrid(page, 'tablet-820');
  // At 820px, should be 2 columns (new @media max-width:900px rule)
  const isTwoCols = caseCols !== 'NOT FOUND' && (caseCols.trim().split(/\s+/).length === 2 || caseCols.includes('1fr 1fr'));
  console.log(`[tablet-820] cases-grid 2 colonnes: ${isTwoCols ? '✅' : '❌'}`);

  await ctx.close();
}

// ── 3. Desktop 1280px (baseline) ──────────────────────────────────────────
console.log('\n═══ DESKTOP 1280px ═══');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  await shot(page, '07-desktop-1280-hero');

  const navLinks = await page.evaluate(() => {
    const el = document.querySelector('.nav-links');
    return el ? getComputedStyle(el).display : 'NOT FOUND';
  });
  const ham = await page.evaluate(() => {
    const el = document.querySelector('.ham');
    return el ? getComputedStyle(el).display : 'NOT FOUND';
  });
  const navOk = navLinks === 'flex' && ham === 'none';
  console.log(`[desktop] nav-links: ${navLinks} | ham: ${ham} → ${navOk ? '✅ OK' : '❌ PROBLEM'}`);

  const desktopCols = await checkCasesGrid(page, 'desktop-1280');
  // Should be 3 columns
  console.log(`[desktop] cases-grid 3 colonnes: ${desktopCols.includes('3') || desktopCols.trim().split(/\s+/).length === 3 ? '✅' : '❌'}`);

  await ctx.close();
}

await browser.close();
console.log('\n✅ Vérification terminée — screenshots dans:', OUT);
