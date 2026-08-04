import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

// Test 1 : 820px SANS deviceScaleFactor (pour isoler le bug)
const ctx1 = await browser.newContext({ viewport: { width: 820, height: 1180 } });
const p1 = await ctx1.newPage();
await p1.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
await p1.waitForTimeout(800);

const info1 = await p1.evaluate(() => ({
  innerWidth: window.innerWidth,
  dpr: window.devicePixelRatio,
  navLinksDisplay: getComputedStyle(document.querySelector('.nav-links')).display,
  hamDisplay: getComputedStyle(document.querySelector('.ham')).display,
  overflowW: document.body.scrollWidth,
  bodyW: window.innerWidth,
}));
console.log('820px no-DPR:', info1);

// Source de l'overflow
const overflowEl = await p1.evaluate(() => {
  const w = window.innerWidth;
  const els = [...document.querySelectorAll('*')].filter(el => el.getBoundingClientRect().right > w + 2);
  return els.slice(0, 5).map(el => ({ tag: el.tagName, class: el.className?.toString().slice(0, 50), right: Math.round(el.getBoundingClientRect().right) }));
});
console.log('\nÉléments en overflow à 820px:', overflowEl);

// Screenshot sans DPR
await p1.screenshot({ path: 'tablet-screenshots/debug-820-nodpr.png' });
await ctx1.close();

// Test 2 : 820px AVEC deviceScaleFactor:2
const ctx2 = await browser.newContext({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2 });
const p2 = await ctx2.newPage();
await p2.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });
const info2 = await p2.evaluate(() => ({
  innerWidth: window.innerWidth,
  dpr: window.devicePixelRatio,
  navLinksDisplay: getComputedStyle(document.querySelector('.nav-links')).display,
  hamDisplay: getComputedStyle(document.querySelector('.ham')).display,
}));
console.log('\n820px DPR=2:', info2);
await ctx2.close();

await browser.close();
