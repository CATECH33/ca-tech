import { chromium } from 'playwright';

const PAGES = [
  'https://www.ca-tech.fr/automatisations',
  'https://www.ca-tech.fr/tarifs',
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const url of PAGES) {
    const context = await browser.newContext();
    // Clear storage so banner shows fresh
    await context.clearCookies();
    const page = await context.newPage();

    console.log(`\n── ${url} ────────────────────────────────`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Check for banner visibility — React CookieBanner
    const bannerVisible = await page.locator('#ck-banner, [class*="cookie-banner"], [class*="CookieBanner"], [id*="cookie"]').first().isVisible().catch(() => false);

    // Also check by text
    const textVisible = await page.getByText(/cookies|consentement|accepter/i).first().isVisible().catch(() => false);

    // Screenshot
    const slug = url.split('/').pop();
    const shot = `verify-banner-${slug}.png`;
    await page.screenshot({ path: shot, fullPage: false });

    console.log('  Banner element visible:', bannerVisible);
    console.log('  Cookie text visible   :', textVisible);
    console.log('  Screenshot            :', shot);

    // Try accept button
    const acceptBtn = page.locator('#ck-accept-all, button:has-text("Tout accepter"), button:has-text("Accepter")').first();
    const acceptVisible = await acceptBtn.isVisible().catch(() => false);
    console.log('  Accept button visible :', acceptVisible);

    if (acceptVisible) {
      await acceptBtn.click();
      await page.waitForTimeout(1000);
      const bannerGone = !(await page.locator('#ck-banner, [class*="cookie-banner"]').first().isVisible().catch(() => false));
      console.log('  Banner dismissed after accept:', bannerGone);
      const shot2 = `verify-banner-${slug}-accepted.png`;
      await page.screenshot({ path: shot2, fullPage: false });
      console.log('  Screenshot after accept:', shot2);
    }

    await context.close();
  }

  await browser.close();
  console.log('\nDone.');
})();
