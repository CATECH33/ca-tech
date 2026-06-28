const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { getProduct } = require('./products');
const { notify } = require('./notifications');

// Stripe nécessite le corps brut pour vérifier la signature
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}


async function handleCheckoutCompleted(session, supabase) {
  const { id: sessionId, customer_details, amount_total, metadata, payment_intent, subscription } = session;

  // Éviter les doublons (Stripe peut rejouer les webhooks)
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('reference', sessionId)
    .maybeSingle();

  if (existingPayment) {
    console.log('Commande déjà traitée:', sessionId);
    return;
  }

  const product = getProduct(metadata?.productId);
  if (!product) {
    console.error('Produit introuvable dans metadata:', metadata?.productId);
    return;
  }

  const email = customer_details?.email || '';
  const fullName = customer_details?.name || '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Client';
  const lastName = nameParts.slice(1).join(' ') || '';
  const phone = customer_details?.phone || '';

  // 1. Trouver ou créer le client
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  let clientId;
  if (existingClient) {
    clientId = existingClient.id;
    // Mettre à jour le téléphone si absent
    if (phone) {
      await supabase.from('clients').update({ phone }).eq('id', clientId);
    }
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({ first_name: firstName, last_name: lastName, email, phone, status: 'active' })
      .select('id')
      .single();

    if (clientErr) throw new Error(`Création client : ${clientErr.message}`);
    clientId = newClient.id;
  }

  // 2. Créer le projet
  const isSubscription = product.mode === 'subscription';
  const { data: project, error: projectErr } = await supabase
    .from('projects')
    .insert({
      client_id: clientId,
      name: `${product.name} — ${firstName} ${lastName}`.trim(),
      status: isSubscription ? 'in_progress' : 'pending',
      priority: 'medium',
      budget: amount_total / 100,
      notes: `Commande automatique via Stripe Checkout.\nSession : ${sessionId}\nProduit : ${product.id}`,
      color: '#0066FF',
    })
    .select('id')
    .single();

  if (projectErr) throw new Error(`Création projet : ${projectErr.message}`);

  // 3. Enregistrer le paiement
  const { error: paymentErr } = await supabase.from('payments').insert({
    client_id: clientId,
    project_id: project.id,
    amount: amount_total / 100,
    method: 'stripe',
    status: 'completed',
    stripe_payment_id: payment_intent || subscription || sessionId,
    reference: sessionId,
    paid_at: new Date().toISOString(),
    notes: `${product.name} — ${isSubscription ? 'Abonnement mensuel' : 'Paiement unique'}`,
  });

  if (paymentErr) throw new Error(`Enregistrement paiement : ${paymentErr.message}`);

  // 4. Générer la facture
  const { count: invoiceCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true });

  const year = new Date().getFullYear();
  const seq = String((invoiceCount || 0) + 1).padStart(4, '0');
  const invoiceNumber = `FAC-${year}-${seq}`;

  const totalTTC = amount_total / 100;
  const TVA_RATE = 20;
  const totalHT = Math.round((totalTTC / (1 + TVA_RATE / 100)) * 100) / 100;
  const tvaAmount = Math.round((totalTTC - totalHT) * 100) / 100;

  const { data: invoice, error: invoiceErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      client_id: clientId,
      project_id: project.id,
      status: 'paid',
      subtotal: totalHT,
      tax_rate: TVA_RATE,
      tax_amount: tvaAmount,
      total: totalTTC,
      amount_paid: totalTTC,
      tva_rate: TVA_RATE,
      paid_at: new Date().toISOString(),
      due_date: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single();

  if (invoiceErr) throw new Error(`Création facture : ${invoiceErr.message}`);

  // 5. Ligne de facture
  await supabase.from('invoice_items').insert({
    invoice_id: invoice.id,
    description: product.description,
    quantity: 1,
    unit_price: totalHT,
    total: totalHT,
    sort_order: 0,
  });

  // 6. Log d'audit
  await supabase.from('audit_logs').insert({
    action: 'ORDER_COMPLETED',
    table_name: 'payments',
    record_id: project.id,
    new_data: {
      session_id: sessionId,
      product_id: product.id,
      product_name: product.name,
      client_email: email,
      amount_ttc: totalTTC,
      invoice_number: invoiceNumber,
      mode: product.mode,
    },
  });

  // 7. Notifications (email + telegram + whatsapp selon paramètres)
  const notifType = isSubscription ? 'abonnement_souscrit' : 'paiement_confirme';
  await notify(notifType, {
    productName: product.name,
    amount: totalTTC,
    customerName: fullName,
    email,
    phone,
    invoiceNumber,
  }, supabase);

  console.log(`✅ Commande traitée : ${invoiceNumber} — ${email} — ${product.name}`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Configuration serveur incomplète.' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabase);
        break;

      case 'invoice.payment_succeeded':
        // Renouvellements d'abonnements — log uniquement pour l'instant
        await supabase.from('audit_logs').insert({
          action: 'SUBSCRIPTION_RENEWED',
          table_name: 'payments',
          new_data: {
            subscription_id: event.data.object.subscription,
            customer: event.data.object.customer_email,
            amount: event.data.object.amount_paid / 100,
          },
        });
        break;

      case 'customer.subscription.deleted':
        await supabase.from('audit_logs').insert({
          action: 'SUBSCRIPTION_CANCELLED',
          table_name: 'projects',
          new_data: {
            subscription_id: event.data.object.id,
            customer: event.data.object.customer,
          },
        });
        break;

      default:
        break;
    }
  } catch (err) {
    console.error('Erreur traitement webhook:', err.message);
    await notify('erreur_critique', { context: `webhook/${event.type}`, error: err.message }, supabase).catch(() => {});
  }

  res.status(200).json({ received: true });
};
