const Stripe = require('stripe');
const { getProduct } = require('./products');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://www.ca-tech.fr',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY manquant');
    return res.status(500).json({ error: 'Configuration serveur incomplète.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { productId } = body || {};

  if (!productId) {
    return res.status(400).json({ error: 'productId manquant.' });
  }

  const product = getProduct(productId);
  if (!product) {
    return res.status(404).json({ error: `Produit inconnu : ${productId}` });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
  const siteUrl = process.env.SITE_URL || 'https://www.ca-tech.fr';

  try {
    // Utilise le Price ID Stripe pré-créé si disponible, sinon price_data inline
    const lineItem = product.stripePrice
      ? { quantity: 1, price: product.stripePrice }
      : {
          quantity: 1,
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
              metadata: { productId: product.id, category: product.category },
            },
            unit_amount: product.amount,
            ...(product.mode === 'subscription' && {
              recurring: { interval: product.interval },
            }),
          },
        };

    const sessionParams = {
      mode: product.mode,
      line_items: [lineItem],
      success_url: `${siteUrl}/commande-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/tarifs?cancelled=1`,
      customer_creation: product.mode === 'payment' ? 'always' : undefined,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      locale: 'fr',
      metadata: {
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
      },
      custom_text: {
        submit: {
          message: `Votre paiement est sécurisé. L'équipe CA-TECH vous contactera sous 24h.`,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Erreur Stripe Checkout:', err.message);
    return res.status(500).json({ error: 'Impossible de créer la session de paiement.' });
  }
};
