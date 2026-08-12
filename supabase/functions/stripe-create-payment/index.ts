import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_KEY       = Deno.env.get('STRIPE_SECRET_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { devis_id, payment_type } = await req.json() as {
      devis_id: string
      payment_type: 'acompte' | 'solde'
    }

    if (!devis_id || !['acompte', 'solde'].includes(payment_type)) {
      return json({ error: 'devis_id et payment_type (acompte|solde) requis' }, 400)
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // Source de vérité : le devis (jamais le frontend)
    const { data: devis, error: dErr } = await sb
      .from('devis')
      .select('id, devis_number, total, subtotal, tax_amount, tax_rate, status, client_id, clients(id, email, first_name, last_name)')
      .eq('id', devis_id)
      .single()

    if (dErr || !devis) return json({ error: 'Devis introuvable' }, 404)
    if (devis.status !== 'accepted') return json({ error: 'Le devis doit être accepté' }, 400)

    // Contrôles d'intégrité — jamais de double paiement
    if (payment_type === 'acompte') {
      const { data: existing } = await sb
        .from('invoices')
        .select('id')
        .eq('devis_id', devis_id)
        .eq('payment_type', 'acompte')
        .maybeSingle()
      if (existing) return json({ error: 'Un acompte existe déjà pour ce devis' }, 400)
    }

    if (payment_type === 'solde') {
      const { data: existingSolde } = await sb
        .from('invoices')
        .select('id')
        .eq('devis_id', devis_id)
        .eq('payment_type', 'solde')
        .maybeSingle()
      if (existingSolde) return json({ error: 'Un solde existe déjà pour ce devis' }, 400)

      const { data: acompte } = await sb
        .from('invoices')
        .select('status')
        .eq('devis_id', devis_id)
        .eq('payment_type', 'acompte')
        .maybeSingle()
      if (!acompte || acompte.status !== 'paid') {
        return json({ error: "L'acompte doit être payé avant de générer le solde" }, 400)
      }
    }

    // Calcul 50 % côté serveur — jamais côté client
    const total     = Number(devis.total)
    const amount    = total * 0.5
    const subtotal  = Number(devis.subtotal) * 0.5
    const taxAmount = Number(devis.tax_amount) * 0.5
    const tvaRate   = Number(devis.tax_rate ?? 20)
    const amountCents = Math.round(amount * 100)

    const client = devis.clients as Record<string, any>

    // Numéro de facture séquentiel
    const year = new Date().getFullYear()
    const { data: latestInv } = await sb
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `FAC-${year}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .maybeSingle()
    const lastNum = latestInv
      ? parseInt(latestInv.invoice_number.split('-')[2] ?? '0')
      : 0
    const invoice_number = `FAC-${year}-${String(lastNum + 1).padStart(3, '0')}`

    const label = payment_type === 'acompte' ? 'Acompte 50 %' : 'Solde 50 %'

    // Créer la facture liée au devis
    const { data: inv, error: invErr } = await sb
      .from('invoices')
      .insert([{
        invoice_number,
        client_id:    devis.client_id,
        devis_id:     devis.id,
        payment_type,
        subtotal:     subtotal,
        tax_amount:   taxAmount,
        tva_rate:     tvaRate,
        total:        amount,
        amount_paid:  0,
        status:       'sent',
        notes:        `${label} — Devis ${devis.devis_number}`,
      }])
      .select('id')
      .single()

    if (invErr) {
      // Code 23505 = violation contrainte UNIQUE (race condition simultanée)
      if ((invErr as any).code === '23505') {
        return json({ error: 'Un paiement de ce type est déjà en cours de génération pour ce devis' }, 409)
      }
      throw invErr
    }

    // Stripe Checkout Session — montant fixé côté serveur
    const stripe  = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       client?.email || undefined,
      line_items: [{
        price_data: {
          currency:     'eur',
          product_data: {
            name:        `${label} — ${devis.devis_number}`,
            description: `CA-TECH · ${payment_type === 'acompte' ? 'Acompte pour démarrage du projet' : 'Solde à la livraison'}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      metadata: {
        invoice_id:   inv.id,
        devis_id:     devis.id,
        payment_type,
        client_id:    devis.client_id,
      },
      expires_at:  Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      success_url: 'https://ca-tech.fr?paiement=confirme',
      cancel_url:  'https://ca-tech.fr?paiement=annule',
    })

    // Sauvegarder le lien sur la facture
    await sb.from('invoices')
      .update({ stripe_payment_link: session.url })
      .eq('id', inv.id)

    return json({ url: session.url, invoice_id: inv.id })

  } catch (err) {
    console.error('[stripe-create-payment]', err)
    return json({ error: String(err) }, 500)
  }
})
