/**
 * API Devis CA-TECH
 * GET    /api/devis?action=list[&status=sent][&limit=50]  → liste admin
 * GET    /api/devis?action=get&id=UUID                    → devis unique
 * POST   /api/devis                                       → créer devis
 * PATCH  /api/devis                                       → mettre à jour statut / envoyer relance
 */
const { createClient } = require('@supabase/supabase-js');
const { notify } = require('./notifications');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://www.ca-tech.fr',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TVA = 20;

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function generateDevisNumber(supabase) {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('devis')
    .select('*', { count: 'exact', head: true });
  const seq = String((count || 0) + 1).padStart(4, '0');
  return `DEV-${year}-${seq}`;
}

// ── Calculer les lignes à partir des données du formulaire ───────────────────
function buildItems(data) {
  const items = [];
  const TYPE_PRICES = {
    'site-vitrine':      590,
    'site-ecommerce':   1090,
    'landing-page':      270,
    'logo':              180,
    'flyer':             139,
    'identite-visuelle': 500,
    'sur-mesure':       2500,
    'ia-automatisation': 800,
  };

  const TYPE_LABELS = {
    'site-vitrine':      'Site Vitrine professionnel sur mesure',
    'site-ecommerce':    'Site E-commerce complet avec paiement Stripe',
    'landing-page':      'Landing Page haute conversion',
    'logo':              'Création de logo professionnel (3 propositions)',
    'flyer':             'Flyer professionnel HD (recto/verso)',
    'identite-visuelle': 'Identité visuelle complète (logo + charte)',
    'sur-mesure':        'Développement web sur mesure',
    'ia-automatisation': 'Solution Intelligence Artificielle / Automatisation',
  };

  const baseTTC = TYPE_PRICES[data.project_type] || 0;
  if (baseTTC > 0) {
    const baseHT = Math.round((baseTTC / (1 + TVA / 100)) * 100) / 100;
    items.push({
      description: TYPE_LABELS[data.project_type] || data.project_type,
      quantity: 1,
      unit_price: baseHT,
      total: baseHT,
      sort_order: 0,
    });
  }

  if (data.seo_option) {
    const ht = Math.round((200 / (1 + TVA / 100)) * 100) / 100;
    items.push({ description: 'Référencement SEO avancé (optimisation complète)', quantity: 1, unit_price: ht, total: ht, sort_order: 1 });
  }

  if (data.maintenance_option === 'vitrine') {
    const ht = Math.round((89.99 / (1 + TVA / 100)) * 100) / 100;
    items.push({ description: 'Maintenance mensuelle — Site Vitrine Premium', quantity: 1, unit_price: ht, total: ht, sort_order: 2 });
  } else if (data.maintenance_option === 'ecommerce') {
    const ht = Math.round((120 / (1 + TVA / 100)) * 100) / 100;
    items.push({ description: 'Maintenance mensuelle — E-commerce Premium', quantity: 1, unit_price: ht, total: ht, sort_order: 2 });
  }

  if (data.hosting_option) {
    const ht = Math.round((30 / (1 + TVA / 100)) * 100) / 100;
    items.push({ description: 'Hébergement géré (domaine + SSL + CDN)', quantity: 1, unit_price: ht, total: ht, sort_order: 3 });
  }

  if (data.branding_option && data.project_type !== 'identite-visuelle') {
    const ht = Math.round((500 / (1 + TVA / 100)) * 100) / 100;
    items.push({ description: 'Identité visuelle complète (logo + charte graphique)', quantity: 1, unit_price: ht, total: ht, sort_order: 4 });
  }

  const subtotal = Math.round(items.reduce((s, i) => s + i.total, 0) * 100) / 100;
  const taxAmount = Math.round(subtotal * (TVA / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return { items, subtotal, taxAmount, total };
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleCreate(body, supabase) {
  const { items, subtotal, taxAmount, total } = buildItems(body);
  const devisNumber = await generateDevisNumber(supabase);

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const { data: devis, error } = await supabase
    .from('devis')
    .insert({
      devis_number:       devisNumber,
      status:             'draft',
      contact_name:       body.contact_name || '',
      contact_email:      body.contact_email || '',
      contact_phone:      body.contact_phone || null,
      company_name:       body.company_name  || null,
      project_type:       body.project_type  || null,
      activity:           body.activity      || null,
      features:           body.features      || [],
      budget_range:       body.budget_range  || null,
      deadline:           body.deadline      || null,
      notes:              body.notes         || null,
      seo_option:         !!body.seo_option,
      maintenance_option: body.maintenance_option || 'none',
      hosting_option:     !!body.hosting_option,
      branding_option:    !!body.branding_option,
      items:              items,
      subtotal,
      discount:           0,
      tax_rate:           TVA,
      tax_amount:         taxAmount,
      total,
      valid_until:        validUntil.toISOString().split('T')[0],
      conversation_id:    body.conversation_id || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Création devis : ${error.message}`);

  // Insérer les lignes
  if (items.length > 0) {
    await supabase.from('devis_items').insert(
      items.map(it => ({ ...it, devis_id: devis.id }))
    );
  }

  // Créer ou retrouver le lead
  if (body.contact_email) {
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', body.contact_email)
      .maybeSingle();

    if (!existingLead) {
      const nameParts = (body.contact_name || '').trim().split(' ');
      await supabase.from('leads').insert({
        first_name: nameParts[0] || '',
        last_name:  nameParts.slice(1).join(' ') || '',
        email:      body.contact_email,
        phone:      body.contact_phone || null,
        company:    body.company_name  || null,
        notes:      `Devis ${devisNumber} — ${body.project_type || ''}`,
        source:     'devis_form',
        status:     'qualified',
        budget_max: total || null,
      });
    }
  }

  // Log audit (fire-and-forget, non-bloquant)
  try {
    await supabase.from('audit_logs').insert({
      action:     'DEVIS_CREATED',
      table_name: 'devis',
      record_id:  devis.id,
      new_data: {
        devis_number: devisNumber,
        contact_email: body.contact_email,
        project_type:  body.project_type,
        total,
      },
    });
  } catch {}

  // Notifications
  await notify('nouveau_devis', {
    devisNumber,
    clientName: body.contact_name || body.contact_email,
    amount:     total,
  }, supabase).catch(console.error);

  return { devis_number: devisNumber, id: devis.id, total, valid_until: devis.valid_until };
}

async function handleList(query, supabase) {
  let q = supabase
    .from('devis')
    .select('id,devis_number,status,contact_name,contact_email,company_name,project_type,total,created_at,valid_until,sent_at')
    .order('created_at', { ascending: false });

  if (query.status) q = q.eq('status', query.status);
  if (query.search) q = q.or(`contact_name.ilike.%${query.search}%,contact_email.ilike.%${query.search}%,devis_number.ilike.%${query.search}%`);

  const limit = Math.min(parseInt(query.limit || '50', 10), 200);
  q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

async function handleGet(id, supabase) {
  const { data: devis, error } = await supabase
    .from('devis')
    .select('*, devis_items(*), devis_relances(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return devis;
}

async function handlePatch(body, supabase) {
  const { id, action } = body;
  if (!id) throw new Error('id manquant');

  const { data: devis, error: fetchErr } = await supabase
    .from('devis').select('*').eq('id', id).single();
  if (fetchErr) throw new Error(fetchErr.message);

  if (action === 'send') {
    await supabase.from('devis').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    return { ok: true, status: 'sent' };
  }

  if (action === 'accept') {
    await supabase.from('devis').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', id);
    await notify('devis_accepte', {
      devisNumber: devis.devis_number,
      clientName:  devis.contact_name,
      amount:      devis.total,
    }, supabase).catch(console.error);
    return { ok: true, status: 'accepted' };
  }

  if (action === 'refuse') {
    await supabase.from('devis').update({ status: 'refused', refused_at: new Date().toISOString() }).eq('id', id);
    return { ok: true, status: 'refused' };
  }

  if (action === 'expire') {
    await supabase.from('devis').update({ status: 'expired' }).eq('id', id);
    return { ok: true, status: 'expired' };
  }

  if (action === 'relance') {
    await supabase.from('devis').update({ last_reminder_at: new Date().toISOString() }).eq('id', id);
    const results = await notify('nouveau_devis', {
      devisNumber: devis.devis_number,
      clientName:  devis.contact_name,
      amount:      devis.total,
    }, supabase);
    const channels = results.map(r => r.channel);
    await supabase.from('devis_relances').insert(
      channels.map(ch => ({ devis_id: id, channel: ch, status: 'sent' }))
    );
    return { ok: true, channels };
  }

  // Mise à jour des champs
  const allowed = ['contact_name','contact_email','contact_phone','company_name','notes','status'];
  const patch = {};
  for (const k of allowed) { if (body[k] !== undefined) patch[k] = body[k]; }
  if (Object.keys(patch).length > 0) {
    await supabase.from('devis').update(patch).eq('id', id);
  }
  return { ok: true };
}

// ── Handler principal ─────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  try {
    if (req.method === 'GET') {
      const q = req.query || {};
      if (q.action === 'get' && q.id) {
        const data = await handleGet(q.id, supabase);
        return res.status(200).json(data);
      }
      const data = await handleList(q, supabase);
      return res.status(200).json(data);
    }

    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    if (req.method === 'POST') {
      if (!body.contact_email) return res.status(400).json({ error: 'contact_email manquant' });
      if (!body.project_type)  return res.status(400).json({ error: 'project_type manquant' });
      const result = await handleCreate(body, supabase);
      return res.status(201).json(result);
    }

    if (req.method === 'PATCH') {
      const result = await handlePatch(body, supabase);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/devis]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
