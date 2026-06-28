const Stripe = require('stripe');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://www.ca-tech.fr',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: 'session_id manquant.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Configuration serveur incomplète.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(402).json({ error: 'Paiement non complété.' });
    }

    const productName = session.metadata?.productName || session.line_items?.data?.[0]?.description || 'Service CA-TECH';
    const amount = session.amount_total / 100;
    const currency = session.currency?.toUpperCase() || 'EUR';
    const customerName = session.customer_details?.name || '';
    const customerEmail = session.customer_details?.email || '';
    const firstName = customerName.trim().split(' ')[0] || 'Client';

    return res.status(200).json({
      sessionId: session.id,
      productName,
      amount,
      currency,
      customerName,
      customerEmail,
      firstName,
      mode: session.mode,
    });
  } catch (err) {
    console.error('Erreur récupération session Stripe:', err.message);
    return res.status(500).json({ error: 'Impossible de récupérer les détails de la commande.' });
  }
};
