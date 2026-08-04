import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 820, height: 1180 } });
const page = await ctx.newPage();
await page.goto('https://www.ca-tech.fr', { waitUntil: 'networkidle', timeout: 30000 });

// Lister les feuilles de style (href seulement, cross-origin bloqué)
const sheets = await page.evaluate(() =>
  [...document.styleSheets].map(s => ({ href: s.href, rules: (() => { try { return s.cssRules?.length } catch { return 'blocked' } })() }))
);
console.log('Stylesheets:');
sheets.forEach(s => console.log(' ', s.href || '[inline]', '—', s.rules, 'rules'));

// Chercher nav-links dans les styles <style> inline
const inlineNav = await page.evaluate(() => {
  return [...document.querySelectorAll('style')].map(s => s.textContent).join('\n')
    .split('\n').filter(l => l.includes('nav-links')).join('\n');
});
console.log('\nInline <style> nav-links rules:\n', inlineNav || '(aucun)');

await browser.close();
