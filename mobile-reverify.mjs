import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = 'mobile-reverify';
mkdirSync(OUT, { recursive: true });

const device = devices['iPhone 14'];
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ...device, locale: 'fr-FR' });
const page = await ctx.newPage();

await page.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(800);

// 1. Hero
await page.screenshot({ path: `${OUT}/01-hero.png` });
console.log('📸 01-hero');

// 2. Services cards
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.15));
await page.waitForTimeout(350);
await page.screenshot({ path: `${OUT}/02-services.png` });
console.log('📸 02-services');

// 3. Mid (IA section)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35));
await page.waitForTimeout(350);
await page.screenshot({ path: `${OUT}/03-ia.png` });
console.log('📸 03-ia');

// 4. Cases grid (section réalisations)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
await page.waitForTimeout(350);
await page.screenshot({ path: `${OUT}/04-cases.png` });
console.log('📸 04-cases');

// 5. Footer
await page.locator('footer').scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.locator('footer').screenshot({ path: `${OUT}/05-footer.png` });
console.log('📸 05-footer');

// 6. Nav hamburger
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.locator('button.ham').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/06-menu-open.png` });
console.log('📸 06-menu-open');

// ── Audits ──
const checks = await page.evaluate(() => {
  const navLinks = document.querySelector('.nav-links');
  const ham = document.querySelector('.ham');
  const imgs = [...document.querySelectorAll('img')].map(el => ({
    src: el.currentSrc || el.src,
    alt: el.alt,
    loading: el.loading,
    isWebP: (el.currentSrc || el.src).includes('.webp'),
  }));
  return {
    innerWidth: window.innerWidth,
    navLinksDisplay: getComputedStyle(navLinks).display,
    hamDisplay: getComputedStyle(ham).display,
    overflow: document.body.scrollWidth > window.innerWidth,
    scrollPadding: getComputedStyle(document.documentElement).scrollPaddingTop,
    imgs,
    viewport: document.querySelector('meta[name="viewport"]')?.content,
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim(),
    canonical: document.querySelector('link[rel="canonical"]')?.href,
  };
});

console.log(`\n📐 Viewport: ${checks.innerWidth}px | scroll-padding-top: ${checks.scrollPadding}`);
console.log(`🍔 Nav: links=${checks.navLinksDisplay} ham=${checks.hamDisplay} → ${checks.navLinksDisplay === 'none' && checks.hamDisplay === 'flex' ? '✅' : '❌'}`);
console.log(`📏 Overflow horizontal: ${checks.overflow ? '❌ OUI' : '✅ NON'}`);

const noAlt = checks.imgs.filter(i => !i.alt);
const webp = checks.imgs.filter(i => i.isWebP);
const lazy = checks.imgs.filter(i => i.loading === 'lazy');
console.log(`\n🖼️  Images: ${checks.imgs.length} total | ${webp.length} WebP | ${lazy.length} lazy | ${noAlt.length} sans alt`);
if (noAlt.length) noAlt.forEach(i => console.log(`   ⚠️  ${i.src.split('/').pop()}`));

console.log(`\n📄 Title: ${checks.title}`);
console.log(`🔖 H1: ${checks.h1}`);
console.log(`🔗 Canonical: ${checks.canonical}`);
console.log(`📱 Viewport meta: ${checks.viewport}`);

// Console errors
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
console.log(`\n🖥️  Erreurs JS: ${errors.length}${errors.length ? ' → ' + errors[0].slice(0, 100) : ''}`);

await browser.close();
console.log(`\n✅ Screenshots → ${OUT}/`);
