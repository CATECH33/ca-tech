/**
 * Tests CA-TECH — toutes les fonctions API
 * node test-all.js
 */

const { PRODUCTS, getProduct, getAllProducts } = require('./api/products');
const { notify } = require('./api/notifications');

let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

// ─── 1. products.js ───────────────────────────────────────────────────────────

section('products.js — getProduct()');

assert(getProduct('site-vitrine') !== null, 'site-vitrine existe');
assert(getProduct('site-ecommerce') !== null, 'site-ecommerce existe');
assert(getProduct('landing-page') !== null, 'landing-page existe');
assert(getProduct('logo') !== null, 'logo existe');
assert(getProduct('flyer') !== null, 'flyer existe');
assert(getProduct('maintenance-vitrine') !== null, 'maintenance-vitrine existe');
assert(getProduct('maintenance-ecommerce') !== null, 'maintenance-ecommerce existe');
assert(getProduct('inconnu') === null, 'produit inconnu retourne null');

section('products.js — champs obligatoires');
const p = getProduct('site-vitrine');
assert(p.id === 'site-vitrine', 'id correct');
assert(p.name === 'Site Vitrine', 'name correct');
assert(typeof p.amount === 'number' && p.amount > 0, `amount valide (${p.amount})`);
assert(p.currency === 'eur', 'currency EUR');
assert(p.mode === 'payment', 'mode payment');
assert(typeof p.stripePrice === 'string' && p.stripePrice.startsWith('price_'), `stripePrice valide (${p.stripePrice})`);

section('products.js — getAllProducts()');
const all = getAllProducts();
assert(Array.isArray(all), 'retourne un tableau');
assert(all.length === 7, `7 produits (${all.length} trouvés)`);
const subscriptions = all.filter(p => p.mode === 'subscription');
const payments = all.filter(p => p.mode === 'payment');
assert(subscriptions.length === 2, `2 abonnements (${subscriptions.length} trouvés)`);
assert(payments.length === 5, `5 paiements uniques (${payments.length} trouvés)`);

section('products.js — abonnements ont interval');
subscriptions.forEach(s => {
  assert(s.interval === 'month', `${s.id} a interval=month`);
});

// ─── 2. notifications.js — templates ─────────────────────────────────────────

section('notifications.js — templates (sans envoi réseau)');

// On teste la génération des templates en isolant la logique
// Sans clés API, notify() retournera "skipped" pour tous les canaux

const supabaseMock = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
  }),
};

const testCases = [
  ['paiement_confirme', { productName: 'Site Vitrine', amount: 590, customerName: 'Jean Dupont', email: 'jean@test.fr', phone: '+33612345678', invoiceNumber: 'FAC-2026-0001' }],
  ['abonnement_souscrit', { productName: 'Maintenance Premium', amount: 89.99, customerName: 'Marie Martin', email: 'marie@test.fr' }],
  ['nouveau_prospect', { name: 'Pierre Durant', email: 'pierre@test.fr', phone: '+33698765432', message: 'Je voudrais un devis pour un site vitrine.' }],
  ['formulaire_contact', { name: 'Alice Doe', email: 'alice@test.fr', message: 'Bonjour, je souhaite en savoir plus.' }],
  ['nouveau_devis', { devisNumber: 'DEV-2026-0001', clientName: 'Bob Smith', amount: 1500 }],
  ['devis_accepte', { devisNumber: 'DEV-2026-0002', clientName: 'Claire Blanc', amount: 2000 }],
  ['nouveau_client', { name: 'David Noir', email: 'david@test.fr', firstService: 'Site E-commerce' }],
  ['rendez_vous_cree', { clientName: 'Emma Gris', date: '2026-07-01 14:00', subject: 'Présentation projet web' }],
  ['message_transmis_loic', { clientName: 'François Bleu', email: 'francois@test.fr', message: 'Question sur les tarifs' }],
  ['erreur_critique', { context: 'webhook/checkout', error: 'DB connection failed' }],
];

(async () => {
  for (const [type, data] of testCases) {
    try {
      const results = await notify(type, data, supabaseMock);
      assert(Array.isArray(results), `notify("${type}") retourne un tableau`);
      const statuses = results.map(r => r.status);
      const allSkippedOrSent = statuses.every(s => ['skipped', 'sent', 'failed'].includes(s));
      assert(allSkippedOrSent, `notify("${type}") — statuts valides: [${statuses.join(', ')}]`);
    } catch (err) {
      assert(false, `notify("${type}") — exception: ${err.message}`);
    }
  }

  // Type inconnu
  try {
    const results = await notify('type_inexistant', {}, supabaseMock);
    assert(Array.isArray(results) && results.length === 0, 'type inconnu retourne []');
  } catch (err) {
    assert(false, `type inconnu — exception inattendue: ${err.message}`);
  }

  // ─── 3. create-checkout.js — validation entrées ───────────────────────────

  section('create-checkout.js — validation requêtes');

  function mockRes() {
    const r = { _status: 200, _body: null, headers: {} };
    r.status = (s) => { r._status = s; return r; };
    r.json = (b) => { r._body = b; return r; };
    r.setHeader = (k, v) => { r.headers[k] = v; };
    r.writeHead = (s) => { r._status = s; };
    r.end = () => {};
    return r;
  }

  const handler = require('./api/create-checkout');

  // OPTIONS preflight
  {
    const req = { method: 'OPTIONS' };
    const res = mockRes();
    await handler(req, res);
    assert(res._status === 204, 'OPTIONS → 204');
  }

  // GET non autorisé
  {
    const req = { method: 'GET' };
    const res = mockRes();
    await handler(req, res);
    assert(res._status === 405, 'GET → 405 Method Not Allowed');
  }

  // POST sans productId
  {
    const req = { method: 'POST', body: {} };
    const res = mockRes();
    await handler(req, res);
    assert(res._status === 400, 'POST sans productId → 400');
    assert(res._body?.error?.includes('productId'), 'message erreur productId');
  }

  // POST productId inconnu
  {
    const req = { method: 'POST', body: { productId: 'produit-fantome' } };
    const res = mockRes();
    await handler(req, res);
    assert(res._status === 404, 'productId inconnu → 404');
  }

  // POST sans STRIPE_SECRET_KEY (env non configuré localement)
  {
    const savedKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    const req = { method: 'POST', body: { productId: 'site-vitrine' } };
    const res = mockRes();
    await handler(req, res);
    assert(res._status === 500, 'sans STRIPE_SECRET_KEY → 500');
    process.env.STRIPE_SECRET_KEY = savedKey;
  }

  // POST body string JSON
  {
    const req = { method: 'POST', body: '{"productId":"logo"}' };
    const res = mockRes();
    delete process.env.STRIPE_SECRET_KEY;
    await handler(req, res);
    assert(res._status === 500, 'body string JSON parsé — sans clé → 500 (pas 400 ni 404)');
    process.env.STRIPE_SECRET_KEY = undefined;
  }

  // ─── 4. session-status.js — validation entrées ───────────────────────────

  section('session-status.js — validation requêtes');

  const sessionHandler = require('./api/session-status');

  // POST non autorisé
  {
    const req = { method: 'POST' };
    const res = mockRes();
    await sessionHandler(req, res);
    assert(res._status === 405, 'POST → 405');
  }

  // GET sans session_id
  {
    const req = { method: 'GET', query: {} };
    const res = mockRes();
    await sessionHandler(req, res);
    assert(res._status === 400, 'GET sans session_id → 400');
  }

  // GET sans STRIPE_SECRET_KEY
  {
    const savedKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    const req = { method: 'GET', query: { session_id: 'cs_test_fake' } };
    const res = mockRes();
    await sessionHandler(req, res);
    assert(res._status === 500, 'sans STRIPE_SECRET_KEY → 500');
    process.env.STRIPE_SECRET_KEY = savedKey;
  }

  // ─── 5. Intégrité des Price IDs Stripe ────────────────────────────────────

  section('products.js — format Price IDs Stripe');
  for (const prod of getAllProducts()) {
    const valid = typeof prod.stripePrice === 'string' && prod.stripePrice.startsWith('price_') && prod.stripePrice.length > 10;
    assert(valid, `${prod.id}: ${prod.stripePrice}`);
  }

  // ─── Résumé ───────────────────────────────────────────────────────────────

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Résultats : ${passed} ✅  ${failed} ❌  (total: ${passed + failed})`);
  console.log('═'.repeat(50));

  if (failed > 0) process.exit(1);
})();
