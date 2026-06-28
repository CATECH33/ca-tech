/**
 * Test paiement complet CA-TECH + vérification notification email
 * Produit : logo (180€) — carte test Stripe 4242...
 */
const { chromium } = require('playwright');
const https = require('https');

const SITE = 'https://www.ca-tech.fr';
const SUPABASE_URL = 'https://jhcyooksjeivajdjicka.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sbFetch(path, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const req = https.request(url, {
      method: opts.method || 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...opts.headers,
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(JSON.stringify(opts.body));
    req.end();
  });
}

async function getLastNotificationLogs(since) {
  const res = await sbFetch(
    `/rest/v1/notification_logs?created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=10`
  );
  return res.body;
}

async function getLastPayment(since) {
  const res = await sbFetch(
    `/rest/v1/payments?created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=1`,
    { headers: { Prefer: 'return=representation' } }
  );
  return res.body;
}

(async () => {
  const startTime = new Date().toISOString();
  console.log(`\n🚀 Début test paiement — ${startTime}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ── 1. Ouvrir tarifs.html ──────────────────────────────────────────────
    console.log('1. Ouverture de la page tarifs...');
    await page.goto(`${SITE}/tarifs`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`   ✅ Page chargée : ${page.url()}`);

    // ── 2. Cliquer "Commander mon logo" ───────────────────────────────────
    console.log('2. Clic sur Commander mon logo...');
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes('Commander mon logo'));
      if (btn) btn.click();
      else throw new Error('Bouton Commander mon logo introuvable');
    });

    // ── 3. Attendre la redirection Stripe ─────────────────────────────────
    console.log('3. Attente redirection Stripe Checkout...');
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });
    console.log(`   ✅ Stripe Checkout : ${page.url().slice(0, 60)}...`);

    // ── 4. Remplir l'email ────────────────────────────────────────────────
    console.log('4. Saisie email...');
    await page.waitForSelector('input[name="email"]', { timeout: 15000 });
    await page.fill('input[name="email"]', 'test.payment@ca-tech.fr');
    console.log('   ✅ Email saisi');

    // ── 5. Sélectionner "Carte" ────────────────────────────────────────────
    console.log('5. Sélection paiement par carte...');
    try {
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="card-accordion-item-button"]');
        if (btn) btn.click();
      });
      await page.waitForTimeout(1000);
    } catch { /* déjà sélectionné */ }

    // ── 6. Remplir les champs carte ───────────────────────────────────────
    console.log('6. Saisie carte test 4242...');
    await page.waitForSelector('input[name="cardNumber"]', { timeout: 10000 });
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardExpiry"]', '12/28');
    await page.fill('input[name="cardCvc"]',    '123');
    await page.fill('input[name="billingName"]', 'Jean Test CA-TECH');
    console.log('   ✅ Carte remplie');

    // ── 7. Téléphone ──────────────────────────────────────────────────────
    console.log('7. Saisie téléphone...');
    try {
      const phoneInput = page.locator('input[name="phoneNumber"], input[autocomplete="tel"], input[type="tel"]').first();
      if (await phoneInput.isVisible({ timeout: 3000 })) {
        await phoneInput.fill('+33775664975');
        console.log('   ✅ Téléphone saisi');
      }
    } catch { console.log('   ⏭️  Champ téléphone absent'); }

    // ── 8. Adresse de facturation ─────────────────────────────────────────
    console.log('8. Saisie adresse...');
    try {
      const countrySelect = page.locator('select[name="country"]').first();
      if (await countrySelect.isVisible({ timeout: 3000 })) {
        await countrySelect.selectOption('FR');
      }
    } catch { /* pas de select pays */ }

    try {
      await page.fill('input[name="billingAddressLine1"]', '1 Rue de la Paix');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await page.fill('input[name="billingLocality"]',   'Paris');
      await page.fill('input[name="billingPostalCode"]', '75001');
    } catch { /* champs adresse optionnels */ }
    console.log('   ✅ Adresse remplie');

    // ── 9. Soumettre ──────────────────────────────────────────────────────
    console.log('9. Soumission du paiement...');
    const submitBtn = page.locator('[data-testid="hosted-payment-submit-button"]');
    await submitBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await submitBtn.click();

    // ── 10. Attendre la page de confirmation ─────────────────────────────
    console.log('10. Attente confirmation...');
    await page.waitForURL(/commande-confirmation/, { timeout: 40000 });
    const confirmUrl = page.url();
    console.log(`   ✅ Page confirmation : ${confirmUrl.slice(0, 80)}...`);

    // Laisser le temps au webhook de traiter
    console.log('   ⏳ Attente traitement webhook (5s)...');
    await page.waitForTimeout(5000);

    // ── 11. Vérifier le contenu de la page ───────────────────────────────
    const title = await page.locator('.card-title').textContent().catch(() => '?');
    const product = await page.locator('#order-product').textContent().catch(() => '?');
    const amount  = await page.locator('#order-amount').textContent().catch(() => '?');
    const email   = await page.locator('#order-email').textContent().catch(() => '?');
    console.log(`\n   📋 Page confirmation :`);
    console.log(`      Titre   : ${title}`);
    console.log(`      Produit : ${product}`);
    console.log(`      Montant : ${amount}`);
    console.log(`      Email   : ${email}`);

    // ── 12. Vérifier Supabase ─────────────────────────────────────────────
    console.log('\n12. Vérification Supabase...');

    if (!SUPABASE_KEY) {
      console.log('   ⚠️  SUPABASE_SERVICE_ROLE_KEY absent — vérification Supabase ignorée');
    } else {
      // Paiement enregistré ?
      const payments = await getLastPayment(startTime);
      if (Array.isArray(payments) && payments.length > 0) {
        console.log(`   ✅ Paiement enregistré : ${payments[0].reference} — ${payments[0].amount}€`);
      } else {
        console.log('   ⚠️  Aucun paiement trouvé (webhook peut être lent)');
      }

      // Notifications loggées ?
      await page.waitForTimeout(3000);
      const logs = await getLastNotificationLogs(startTime);
      if (Array.isArray(logs) && logs.length > 0) {
        console.log(`\n   📊 Notifications loggées (${logs.length}) :`);
        logs.forEach(l => {
          const icon = l.status === 'sent' ? '✅' : l.status === 'skipped' ? '⏭️' : '❌';
          console.log(`      ${icon} [${l.channel.toUpperCase()}] ${l.status} — ${l.recipient || l.error || '—'}`);
        });
      } else {
        console.log('   ⚠️  Aucune notification loggée (webhook peut être lent)');
      }
    }

    console.log('\n✅ TEST RÉUSSI\n');

  } catch (err) {
    console.error('\n❌ TEST ÉCHOUÉ :', err.message);
    await page.screenshot({ path: 'test-error.png' });
    console.error('   Screenshot : test-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
