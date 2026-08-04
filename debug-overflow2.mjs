import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('mobile-reverify', { recursive: true });

const device = devices['iPhone 14'];
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ...device, locale: 'fr-FR' });
const page = await ctx.newPage();

await page.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(800);

// Scroll vers proof-stats
const proofTop = await page.evaluate(() => {
  const el = document.querySelector('.proof-grid');
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
});
if (proofTop) {
  await page.evaluate(y => window.scrollTo(0, y - 80), proofTop);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'mobile-reverify/proof-section.png' });
  console.log('📸 proof-section (top:', proofTop, ')');
}

// Scroll vers seo-compare
const tableTop = await page.evaluate(() => {
  const el = document.querySelector('.seo-compare-wrap');
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
});
if (tableTop) {
  await page.evaluate(y => window.scrollTo(0, y - 80), tableTop);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'mobile-reverify/seo-table.png' });
  console.log('📸 seo-table (top:', tableTop, ')');
}

// Vérifier si html/body ont bien overflow-x: hidden
const overflowCheck = await page.evaluate(() => ({
  htmlOX: getComputedStyle(document.documentElement).overflowX,
  bodyOX: getComputedStyle(document.body).overflowX,
  wrapOX: document.querySelector('.seo-compare-wrap') ? getComputedStyle(document.querySelector('.seo-compare-wrap')).overflowX : 'N/A',
}));
console.log('html overflow-x:', overflowCheck.htmlOX);
console.log('body overflow-x:', overflowCheck.bodyOX);
console.log('.seo-compare-wrap overflow-x:', overflowCheck.wrapOX);

await browser.close();
