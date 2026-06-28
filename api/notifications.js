/**
 * NotificationService — CA-TECH
 * Canaux : Email (Resend), Telegram Bot, WhatsApp (CallMeBot)
 * Chaque canal est indépendant : l'échec de l'un n'interrompt pas les autres.
 */

const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const fmtAmount = (n) => fmt.format(typeof n === 'number' ? n : parseFloat(n) || 0);

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = {
  paiement_confirme: (d) => ({
    subject: `🎉 Paiement reçu — ${d.productName}`,
    telegram: [
      `🎉 *Paiement confirmé — CA-TECH*`,
      ``,
      `📦 *Service :* ${d.productName}`,
      `💰 *Montant :* ${fmtAmount(d.amount)}`,
      `👤 *Client :* ${d.customerName || 'N/A'}`,
      `📧 *Email :* ${d.email}`,
      `📞 *Tél :* ${d.phone || 'N/A'}`,
      `🧾 *Facture :* ${d.invoiceNumber}`,
      `⏰ *Date :* ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
    ].join('\n'),
    whatsapp: `🎉 Paiement CA-TECH\n📦 ${d.productName} — ${fmtAmount(d.amount)}\n👤 ${d.customerName || d.email}\n🧾 ${d.invoiceNumber}`,
    emailHtml: buildEmailHtml({
      title: 'Paiement confirmé !',
      icon: '💰',
      lines: [
        ['Service', d.productName],
        ['Montant', fmtAmount(d.amount)],
        ['Client', d.customerName || d.email],
        ['Facture', d.invoiceNumber],
      ],
    }),
  }),

  abonnement_souscrit: (d) => ({
    subject: `🔁 Abonnement souscrit — ${d.productName}`,
    telegram: [
      `🔁 *Nouvel abonnement — CA-TECH*`,
      ``,
      `📦 *Service :* ${d.productName}`,
      `💰 *Mensualité :* ${fmtAmount(d.amount)}/mois`,
      `👤 *Client :* ${d.customerName || 'N/A'}`,
      `📧 *Email :* ${d.email}`,
    ].join('\n'),
    whatsapp: `🔁 Abonnement CA-TECH\n📦 ${d.productName} — ${fmtAmount(d.amount)}/mois\n👤 ${d.customerName || d.email}`,
    emailHtml: buildEmailHtml({
      title: 'Nouvel abonnement',
      icon: '🔁',
      lines: [
        ['Service', d.productName],
        ['Mensualité', `${fmtAmount(d.amount)}/mois`],
        ['Client', d.customerName || d.email],
      ],
    }),
  }),

  nouveau_prospect: (d) => ({
    subject: `👤 Nouveau prospect — ${d.name}`,
    telegram: [
      `👤 *Nouveau prospect*`,
      ``,
      `👤 *Nom :* ${d.name}`,
      `📧 *Email :* ${d.email}`,
      `📞 *Tél :* ${d.phone || 'N/A'}`,
      `💬 *Message :* ${d.message || 'N/A'}`,
    ].join('\n'),
    whatsapp: `👤 Nouveau prospect\n${d.name} — ${d.email}\n${d.message || ''}`,
    emailHtml: buildEmailHtml({
      title: 'Nouveau prospect',
      icon: '👤',
      lines: [
        ['Nom', d.name],
        ['Email', d.email],
        ['Téléphone', d.phone || 'N/A'],
        ['Message', d.message || 'N/A'],
      ],
    }),
  }),

  formulaire_contact: (d) => ({
    subject: `📬 Formulaire de contact — ${d.name}`,
    telegram: [
      `📬 *Formulaire de contact*`,
      ``,
      `👤 *Nom :* ${d.name}`,
      `📧 *Email :* ${d.email}`,
      `📞 *Tél :* ${d.phone || 'N/A'}`,
      `💬 *Message :* ${d.message}`,
    ].join('\n'),
    whatsapp: `📬 Contact CA-TECH\n${d.name} — ${d.email}\n${d.message}`,
    emailHtml: buildEmailHtml({
      title: 'Formulaire de contact',
      icon: '📬',
      lines: [
        ['Nom', d.name],
        ['Email', d.email],
        ['Téléphone', d.phone || 'N/A'],
        ['Message', d.message],
      ],
    }),
  }),

  nouveau_devis: (d) => ({
    subject: `📄 Nouveau devis envoyé — ${d.devisNumber}`,
    telegram: [
      `📄 *Devis envoyé*`,
      ``,
      `🆔 *Référence :* ${d.devisNumber}`,
      `👤 *Client :* ${d.clientName}`,
      `💰 *Montant :* ${fmtAmount(d.amount)}`,
    ].join('\n'),
    whatsapp: `📄 Devis ${d.devisNumber} envoyé à ${d.clientName} — ${fmtAmount(d.amount)}`,
    emailHtml: buildEmailHtml({
      title: 'Devis envoyé',
      icon: '📄',
      lines: [
        ['Référence', d.devisNumber],
        ['Client', d.clientName],
        ['Montant', fmtAmount(d.amount)],
      ],
    }),
  }),

  devis_accepte: (d) => ({
    subject: `✅ Devis accepté — ${d.devisNumber}`,
    telegram: [
      `✅ *Devis accepté !*`,
      ``,
      `🆔 *Référence :* ${d.devisNumber}`,
      `👤 *Client :* ${d.clientName}`,
      `💰 *Montant :* ${fmtAmount(d.amount)}`,
    ].join('\n'),
    whatsapp: `✅ Devis accepté !\n${d.devisNumber} — ${d.clientName} — ${fmtAmount(d.amount)}`,
    emailHtml: buildEmailHtml({
      title: 'Devis accepté !',
      icon: '✅',
      lines: [
        ['Référence', d.devisNumber],
        ['Client', d.clientName],
        ['Montant', fmtAmount(d.amount)],
      ],
    }),
  }),

  nouveau_client: (d) => ({
    subject: `🎊 Nouveau client — ${d.name}`,
    telegram: [
      `🎊 *Nouveau client CA-TECH*`,
      ``,
      `👤 *Nom :* ${d.name}`,
      `📧 *Email :* ${d.email}`,
      `📦 *Premier service :* ${d.firstService || 'N/A'}`,
    ].join('\n'),
    whatsapp: `🎊 Nouveau client\n${d.name} — ${d.email}`,
    emailHtml: buildEmailHtml({
      title: 'Nouveau client',
      icon: '🎊',
      lines: [
        ['Nom', d.name],
        ['Email', d.email],
        ['Premier service', d.firstService || 'N/A'],
      ],
    }),
  }),

  rendez_vous_cree: (d) => ({
    subject: `📅 Rendez-vous — ${d.clientName}`,
    telegram: [
      `📅 *Rendez-vous créé*`,
      ``,
      `👤 *Client :* ${d.clientName}`,
      `📆 *Date :* ${d.date}`,
      `💬 *Objet :* ${d.subject || 'N/A'}`,
    ].join('\n'),
    whatsapp: `📅 RDV ${d.clientName}\n${d.date}\n${d.subject || ''}`,
    emailHtml: buildEmailHtml({
      title: 'Rendez-vous créé',
      icon: '📅',
      lines: [
        ['Client', d.clientName],
        ['Date', d.date],
        ['Objet', d.subject || 'N/A'],
      ],
    }),
  }),

  message_transmis_loic: (d) => ({
    subject: `💬 Message de Loïc — ${d.clientName || 'Visiteur'}`,
    telegram: [
      `💬 *Message via Loïc*`,
      ``,
      `👤 *Expéditeur :* ${d.clientName || 'Visiteur'}`,
      `📧 *Email :* ${d.email || 'N/A'}`,
      `💬 *Message :* ${d.message}`,
    ].join('\n'),
    whatsapp: `💬 Message Loïc\n${d.clientName || 'Visiteur'} : ${d.message}`,
    emailHtml: buildEmailHtml({
      title: 'Message transmis par Loïc',
      icon: '💬',
      lines: [
        ['Expéditeur', d.clientName || 'Visiteur'],
        ['Email', d.email || 'N/A'],
        ['Message', d.message],
      ],
    }),
  }),

  erreur_critique: (d) => ({
    subject: `🚨 Erreur critique — ${d.context}`,
    telegram: [
      `🚨 *ERREUR CRITIQUE — CA-TECH*`,
      ``,
      `📍 *Contexte :* ${d.context}`,
      `❌ *Erreur :* ${d.error}`,
      `⏰ *Date :* ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
    ].join('\n'),
    whatsapp: `🚨 Erreur critique CA-TECH\n${d.context}: ${d.error}`,
    emailHtml: buildEmailHtml({
      title: 'Erreur critique',
      icon: '🚨',
      lines: [
        ['Contexte', d.context],
        ['Erreur', d.error],
      ],
    }),
  }),
};

// ─── Email HTML builder ────────────────────────────────────────────────────────

function buildEmailHtml({ title, icon, lines }) {
  const rows = lines.map(([k, v]) =>
    `<tr><td style="color:#64748b;font-size:13px;padding:6px 0;border-top:1px solid #e8eef5;">${k}</td>` +
    `<td style="color:#0A2540;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #e8eef5;">${v}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,sans-serif;">
<div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,37,64,.08);">
  <div style="background:linear-gradient(135deg,#0A2540,#0066FF);padding:28px 36px;text-align:center;">
    <h1 style="color:#fff;font-size:18px;font-weight:800;margin:0;">CA-TECH</h1>
    <p style="color:rgba(255,255,255,.7);font-size:11px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">Agence Web & Design</p>
  </div>
  <div style="padding:32px 36px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">${icon}</div>
      <h2 style="color:#0A2540;font-size:17px;font-weight:800;margin:0;">${title}</h2>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0;">
      ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
    </p>
  </div>
</div>
</body></html>`;
}

// ─── Channel senders ───────────────────────────────────────────────────────────

async function sendEmail({ subject, htmlBody, to }) {
  if (!process.env.RESEND_API_KEY) {
    return { status: 'skipped', error: 'RESEND_API_KEY absent', recipient: to, provider: 'resend' };
  }
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'CA-TECH <contact@ca-tech.fr>',
      to,
      subject,
      html: htmlBody,
    });
    return { status: 'sent', recipient: to, provider: 'resend' };
  } catch (err) {
    return { status: 'failed', error: err.message, recipient: to, provider: 'resend' };
  }
}

async function sendTelegram({ text }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return { status: 'skipped', error: 'TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID absent', recipient: null, provider: 'telegram' };
  }
  try {
    const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { status: 'failed', error: body, recipient: process.env.TELEGRAM_CHAT_ID, provider: 'telegram' };
    }
    return { status: 'sent', recipient: process.env.TELEGRAM_CHAT_ID, provider: 'telegram' };
  } catch (err) {
    return { status: 'failed', error: err.message, recipient: process.env.TELEGRAM_CHAT_ID || null, provider: 'telegram' };
  }
}

async function sendWhatsApp({ text }) {
  if (!process.env.CALLMEBOT_PHONE || !process.env.CALLMEBOT_APIKEY) {
    return { status: 'skipped', error: 'CALLMEBOT_PHONE ou CALLMEBOT_APIKEY absent', recipient: null, provider: 'callmebot' };
  }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(process.env.CALLMEBOT_PHONE)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return { status: 'failed', error: `HTTP ${resp.status}`, recipient: process.env.CALLMEBOT_PHONE, provider: 'callmebot' };
    }
    return { status: 'sent', recipient: process.env.CALLMEBOT_PHONE, provider: 'callmebot' };
  } catch (err) {
    return { status: 'failed', error: err.message, recipient: process.env.CALLMEBOT_PHONE || null, provider: 'callmebot' };
  }
}

// ─── Log helper ───────────────────────────────────────────────────────────────

async function logNotification(supabase, { type, channel, status, recipient, message, error, metadata, prospectId }) {
  try {
    await supabase.from('notification_logs').insert({
      type,
      channel,
      status,
      recipient: recipient || null,
      message: message || null,
      error: error || null,
      metadata: metadata || {},
      prospect_id: prospectId || null,
      provider: metadata?.provider || null,
    });
  } catch (err) {
    console.error('Erreur log notification:', err.message);
  }
}

// ─── Main notify function ─────────────────────────────────────────────────────

async function notify(type, data, supabase) {
  const template = TEMPLATES[type];
  if (!template) {
    console.warn(`NotificationService: type inconnu "${type}"`);
    return [];
  }

  // Charger les paramètres des canaux
  let channelSettings = { email: true, telegram: true, whatsapp: false };
  try {
    const { data: rows } = await supabase.from('notification_settings').select('channel, enabled');
    if (rows?.length) {
      channelSettings = {};
      rows.forEach(r => { channelSettings[r.channel] = r.enabled; });
    }
  } catch (err) {
    console.error('Impossible de charger notification_settings:', err.message);
  }

  const tpl = template(data);
  const results = [];
  const prospectId = data.prospectId || null;
  const messageSnippet = tpl.telegram?.slice(0, 200);

  // Email
  if (channelSettings.email) {
    const emailTo = process.env.ADMIN_EMAIL || 'contact@ca-tech.fr';
    const result = await sendEmail({ subject: tpl.subject, htmlBody: tpl.emailHtml, to: emailTo });
    await logNotification(supabase, {
      type, channel: 'email', status: result.status,
      recipient: result.recipient, message: tpl.subject,
      error: result.error, metadata: { provider: result.provider }, prospectId,
    });
    results.push({ channel: 'email', ...result });
  }

  // Telegram
  if (channelSettings.telegram) {
    const result = await sendTelegram({ text: tpl.telegram });
    await logNotification(supabase, {
      type, channel: 'telegram', status: result.status,
      recipient: result.recipient, message: messageSnippet,
      error: result.error, metadata: { provider: result.provider }, prospectId,
    });
    results.push({ channel: 'telegram', ...result });
  }

  // WhatsApp
  if (channelSettings.whatsapp) {
    const result = await sendWhatsApp({ text: tpl.whatsapp });
    await logNotification(supabase, {
      type, channel: 'whatsapp', status: result.status,
      recipient: result.recipient, message: tpl.whatsapp?.slice(0, 200),
      error: result.error, metadata: { provider: result.provider }, prospectId,
    });
    results.push({ channel: 'whatsapp', ...result });
  }

  const sent = results.filter(r => r.status === 'sent').length;
  console.log(`[notify] ${type} → ${sent}/${results.length} canaux envoyés`);
  return results;
}

module.exports = { notify };
