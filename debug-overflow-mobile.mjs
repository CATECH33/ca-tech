import { chromium, devices } from 'playwright';
const device = devices['iPhone 14'];
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ...device, locale: 'fr-FR' });
const page = await ctx.newPage();
await page.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(800);

const overflow = await page.evaluate(() => {
  const w = window.innerWidth;
  return [...document.querySelectorAll('*')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.right > w + 1 && r.width > 0;
    })
    .map(el => ({
      tag: el.tagName,
      cls: el.className?.toString?.().trim().slice(0, 70),
      id: el.id,
      right: Math.round(el.getBoundingClientRect().right),
      width: Math.round(el.getBoundingClientRect().width),
      left: Math.round(el.getBoundingClientRect().left),
    }))
    .slice(0, 10);
});

console.log(`Viewport: ${await page.evaluate(() => window.innerWidth)}px`);
console.log(`Body scrollWidth: ${await page.evaluate(() => document.body.scrollWidth)}px`);
console.log('\nÉléments en overflow:');
overflow.forEach(e => console.log(`  ${e.tag}${e.id ? '#'+e.id : ''}.${e.cls.split(' ')[0]} | left=${e.left} width=${e.width} right=${e.right}`));

await browser.close();
