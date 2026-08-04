import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 820, height: 1180 } });
const page = await ctx.newPage();
await page.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(800);

// Vérif exacte du computed style + media query active
const info = await page.evaluate(() => {
  const navLinks = document.querySelector('.nav-links');
  const ham = document.querySelector('.ham');
  const mq900 = window.matchMedia('(max-width: 900px)').matches;
  return {
    innerWidth: window.innerWidth,
    mq900matches: mq900,
    navLinksComputed: getComputedStyle(navLinks).display,
    navLinksInline: navLinks?.style.display,
    hamComputed: getComputedStyle(ham).display,
    // Vérifie si une feuille de style override
    navLinksRules: [...document.styleSheets]
      .flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
      .filter(r => r.cssText?.includes('.nav-links') && !r.cssText?.includes('.nav-links a'))
      .map(r => r.cssText?.slice(0, 120))
  };
});
console.log('innerWidth:', info.innerWidth);
console.log('max-width:900px matches:', info.mq900matches);
console.log('nav-links computed:', info.navLinksComputed);
console.log('nav-links inline:', info.navLinksInline);
console.log('ham computed:', info.hamComputed);
console.log('\nRules matching .nav-links:');
info.navLinksRules.forEach(r => console.log(' ', r));

// Overflow source détaillé
const overflow = await page.evaluate(() => {
  const w = window.innerWidth;
  return [...document.querySelectorAll('*')]
    .filter(el => el.getBoundingClientRect().right > w + 1)
    .map(el => ({
      tag: el.tagName,
      cls: el.className?.toString?.().slice(0, 60),
      right: Math.round(el.getBoundingClientRect().right),
      width: Math.round(el.getBoundingClientRect().width),
    })).slice(0, 8);
});
console.log('\nOverflow elements:');
overflow.forEach(e => console.log(`  ${e.tag}.${e.cls} right=${e.right} w=${e.width}`));

await browser.close();
