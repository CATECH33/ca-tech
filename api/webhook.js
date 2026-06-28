const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { getProduct } = require('./products');

// Stripe nécessite le corps brut pour vérifier la signature
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function sendConfirmationEmail({ to, firstName, productName, amount, invoiceNumber }) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const amountStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

    await resend.emails.send({
      from: 'CA-TECH <contact@ca-tech.fr>',
      to,
      subject: `✅ Commande confirmée — ${productName}`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,37,64,.08);">
  <div style="background:linear-gradient(135deg,#0A2540,#0066FF);padding:32px 40px;text-align:center;">
    <div style="width:48px;height:48px;background:rgba(255,255,255,.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
      <span style="font-size:24px;">⚡</span>
    </div>
    <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;letter-spacing:-.3px;">CA-TECH</h1>
    <p style="color:rgba(255,255,255,.7);font-size:12px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">Agence Web & Design</p>
  </div>
  <div style="padding:40px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:56px;height:56px;background:#ecfdf5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:28px;">✅</span>
      </div>
      <h2 style="color:#0A2540;font-size:18px;font-weight:800;margin:0 0 8px;">Commande confirmée !</h2>
      <p style="color:#64748b;font-size:14px;margin:0;">Bonjour ${firstName}, merci pour votre confiance.</p>
    </div>
    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <h3 style="color:#0066FF;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Détails de votre commande</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Service</td><td style="color:#0A2540;font-size:13px;font-weight:600;text-align:right;">${productName}</td></tr>
        <tr><td style="color:#64748b;font-size:13px;padding:6px 0;border-top:1px solid #e8eef5;">Montant</td><td style="color:#0A2540;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8eef5;">${amountStr}</td></tr>
        <tr><td style="color:#64748b;font-size:13px;padding:6px 0;border-top:1px solid #e8eef5;">Référence</td><td style="color:#0A2540;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8eef5;">${invoiceNumber}</td></tr>
      </table>
    </div>
    <div style="background:rgba(0,102,255,.04);border:1px solid rgba(0,102,255,.12);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="color:#0A2540;font-size:13px;font-weight:600;margin:0 0 6px;">⏱️ Prochaine étape</p>
      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">Notre équipe vous contactera dans les <strong>24h ouvrées</strong> pour démarrer votre projet et convenir d'un premier échange.</p>
    </div>
    <div style="text-align:center;">
      <a href="https://wa.me/33775664975" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:700;">
        💬 Nous contacter sur WhatsApp
      </a>
    </div>
  </div>
  <div style="border-top:1px solid #e8eef5;padding:20px 40px;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} CA-TECH — Agence Web & Design · <a href="https://ca-tech.fr" style="color:#94a3b8;">ca-tech.fr</a></p>
  </div>
</div>
</body>
</html>`,
    });
  } catch (err) {
    console.error('Erreur email Resend:', err.message);
  }
}

async function sendTelegramNotification({ productName, amount, customerName, email, phone, invoiceNumber }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;

  try {
    const amountStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    const text = [
      `🎉 *Nouvelle commande CA-TECH*`,
      ``,
      `📦 *Produit :* ${productName}`,
      `💰 *Montant :* ${amountStr}`,
      `👤 *Client :* ${customerName || 'Non précisé'}`,
      `📧 *Email :* ${email}`,
      `📞 *Téléphone :* ${phone || 'Non précisé'}`,
      `🧾 *Facture :* ${invoiceNumber}`,
      `⏰ *Date :* ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
    ].join('\n');

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Erreur Telegram:', err.message);
  }
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

  // 7. Email de confirmation
  await sendConfirmationEmail({ to: email, firstName, productName: product.name, amount: totalTTC, invoiceNumber });

  // 8. Notification Telegram
  await sendTelegramNotification({
    productName: product.name,
    amount: totalTTC,
    customerName: fullName,
    email,
    phone,
    invoiceNumber,
  });

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
    // On renvoie 200 pour éviter que Stripe ne rejoue indéfiniment
    // L'erreur est loggée côté serveur
  }

  res.status(200).json({ received: true });
};
