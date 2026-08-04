import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = 'tablet-screenshots';
mkdirSync(OUT, { recursive: true });

// iPad Air (portrait) + iPad Pro (landscape)
const configs = [
  { name: 'ipad-portrait',  vp: { width: 820,  height: 1180 } },
  { name: 'ipad-landscape', vp: { width: 1180, height: 820  } },
];

const browser = await chromium.launch({ headless: true });

for (const cfg of configs) {
  const ctx = await browser.newContext({ viewport: cfg.vp, locale: 'fr-FR', deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  console.log(`\n=== ${cfg.name} (${cfg.vp.width}×${cfg.vp.height}) ===`);

  await page.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);

  // 1. Hero
  await page.screenshot({ path: `${OUT}/${cfg.name}-01-hero.png` });
  console.log('📸 01-hero');

  // 2. Scroll ~20%
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.18));
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/${cfg.name}-02-services.png` });
  console.log('📸 02-services');

  // 3. ~45%
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.42));
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/${cfg.name}-03-mid.png` });
  console.log('📸 03-mid');

  // 4. Footer
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator('footer').screenshot({ path: `${OUT}/${cfg.name}-04-footer.png` });
  console.log('📸 04-footer');

  // 5. Nav — hamburger visible ?
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const hamVisible = await page.locator('button.ham').isVisible().catch(() => false);
  const navLinksVisible = await page.locator('.nav-links').isVisible().catch(() => false);
  console.log(`Hamburger: ${hamVisible ? '✅ visible' : '❌ absent'} | Nav links: ${navLinksVisible ? '✅ visible' : '🔴 caché'}`);

  // Audit images
  const imgs = await page.$$eval('img', els => els.map(el => ({ src: el.currentSrc, alt: el.alt })));
  const noAlt = imgs.filter(i => !i.alt);
  const webp  = imgs.filter(i => i.src.includes('.webp'));
  console.log(`Images: ${imgs.length} | WebP: ${webp.length} | Sans alt: ${noAlt.length}`);

  // Overflow horizontal ?
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  console.log(`Overflow horizontal: ${overflow ? '⚠️  OUI' : '✅ NON'}`);

  await ctx.close();
}

await browser.close();
console.log(`\n✅ Screenshots → ${OUT}/`);
