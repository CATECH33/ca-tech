/**
 * Catalogue des produits CA-TECH
 * Pour ajouter un service : ajouter une entrée dans PRODUCTS.
 * Aucune autre modification de code n'est nécessaire.
 */
const PRODUCTS = {
  'site-vitrine': {
    id: 'site-vitrine',
    name: 'Site Vitrine',
    description: 'Site vitrine professionnel sur mesure — design premium, SEO, responsive.',
    amount: 59000, // centimes EUR (590.00 €)
    currency: 'eur',
    mode: 'payment',
    category: 'web',
    emoji: '🖥️',
    deliveryDays: 15,
  },
  'site-ecommerce': {
    id: 'site-ecommerce',
    name: 'Site E-commerce',
    description: 'Boutique en ligne complète avec Stripe, gestion produits et SEO.',
    amount: 109000, // 1090.00 €
    currency: 'eur',
    mode: 'payment',
    category: 'web',
    emoji: '🛒',
    deliveryDays: 25,
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Page de conversion haute performance — design moderne et responsive.',
    amount: 27000, // 270.00 €
    currency: 'eur',
    mode: 'payment',
    category: 'web',
    emoji: '🎯',
    deliveryDays: 7,
  },
  'logo': {
    id: 'logo',
    name: 'Logo Professionnel',
    description: 'Logo professionnel sur mesure — 3 propositions créatives, formats PNG/SVG.',
    amount: 18000, // 180.00 €
    currency: 'eur',
    mode: 'payment',
    category: 'design',
    emoji: '✏️',
    deliveryDays: 5,
  },
  'flyer': {
    id: 'flyer',
    name: 'Flyer Professionnel',
    description: 'Flyer professionnel — format impression HD + version numérique.',
    amount: 13900, // 139.00 €
    currency: 'eur',
    mode: 'payment',
    category: 'design',
    emoji: '🗞️',
    deliveryDays: 3,
  },
  'maintenance-vitrine': {
    id: 'maintenance-vitrine',
    name: 'Maintenance Premium',
    description: 'Maintenance mensuelle site vitrine — mises à jour, sécurité, support.',
    amount: 8999, // 89.99 €/mois
    currency: 'eur',
    mode: 'subscription',
    interval: 'month',
    category: 'maintenance',
    emoji: '🛡️',
  },
  'maintenance-ecommerce': {
    id: 'maintenance-ecommerce',
    name: 'Maintenance E-commerce Premium',
    description: 'Maintenance mensuelle boutique e-commerce — surveillance 24/7, sauvegardes quotidiennes.',
    amount: 12000, // 120.00 €/mois
    currency: 'eur',
    mode: 'subscription',
    interval: 'month',
    category: 'maintenance',
    emoji: '🛡️',
  },
};

function getProduct(id) {
  return PRODUCTS[id] || null;
}

function getAllProducts() {
  return Object.values(PRODUCTS);
}

module.exports = { PRODUCTS, getProduct, getAllProducts };
