/**
 * Catalogue des produits CA-TECH
 * Pour ajouter un service : ajouter une entrée dans PRODUCTS.
 * stripePrice : Price ID Stripe (créé en mode test — à remplacer par le Price ID live en production)
 */
const PRODUCTS = {
  'site-vitrine': {
    id: 'site-vitrine',
    name: 'Site Vitrine',
    description: 'Site vitrine professionnel sur mesure — design premium, SEO, responsive.',
    amount: 59000,
    currency: 'eur',
    mode: 'payment',
    category: 'web',
    emoji: '🖥️',
    deliveryDays: 15,
    stripePrice: 'price_1TnGcRGlGz9pCpApucNcQev4',
  },
  'site-ecommerce': {
    id: 'site-ecommerce',
    name: 'Site E-commerce',
    description: 'Boutique en ligne complète avec Stripe, gestion produits et SEO.',
    amount: 109000,
    currency: 'eur',
    mode: 'payment',
    category: 'web',
    emoji: '🛒',
    deliveryDays: 25,
    stripePrice: 'price_1TnGcSGlGz9pCpApXdLNuwTz',
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Page de conversion haute performance — design moderne et responsive.',
    amount: 27000,
    currency: 'eur',
    mode: 'payment',
    category: 'web',
    emoji: '🎯',
    deliveryDays: 7,
    stripePrice: 'price_1TnGcTGlGz9pCpApXXUv1IeT',
  },
  'logo': {
    id: 'logo',
    name: 'Logo Professionnel',
    description: 'Logo professionnel sur mesure — 3 propositions créatives, formats PNG/SVG.',
    amount: 18000,
    currency: 'eur',
    mode: 'payment',
    category: 'design',
    emoji: '✏️',
    deliveryDays: 5,
    stripePrice: 'price_1TnGcTGlGz9pCpApz7WQNNBg',
  },
  'flyer': {
    id: 'flyer',
    name: 'Flyer Professionnel',
    description: 'Flyer professionnel — format impression HD + version numérique.',
    amount: 13900,
    currency: 'eur',
    mode: 'payment',
    category: 'design',
    emoji: '🗞️',
    deliveryDays: 3,
    stripePrice: 'price_1TnGcUGlGz9pCpApk8AfEJYr',
  },
  'maintenance-vitrine': {
    id: 'maintenance-vitrine',
    name: 'Maintenance Premium',
    description: 'Maintenance mensuelle site vitrine — mises à jour, sécurité, support.',
    amount: 8999,
    currency: 'eur',
    mode: 'subscription',
    interval: 'month',
    category: 'maintenance',
    emoji: '🛡️',
    stripePrice: 'price_1TnGcVGlGz9pCpApAgnl6Lzm',
  },
  'maintenance-ecommerce': {
    id: 'maintenance-ecommerce',
    name: 'Maintenance E-commerce Premium',
    description: 'Maintenance mensuelle boutique e-commerce — surveillance 24/7, sauvegardes quotidiennes.',
    amount: 12000,
    currency: 'eur',
    mode: 'subscription',
    interval: 'month',
    category: 'maintenance',
    emoji: '🛡️',
    stripePrice: 'price_1TnGcVGlGz9pCpApbPEc096r',
  },
};

function getProduct(id) {
  return PRODUCTS[id] || null;
}

function getAllProducts() {
  return Object.values(PRODUCTS);
}

function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(getAllProducts());
}

handler.PRODUCTS = PRODUCTS;
handler.getProduct = getProduct;
handler.getAllProducts = getAllProducts;

module.exports = handler;
