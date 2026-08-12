import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_KEY       = Deno.env.get('STRIPE_SECRET_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Plans définis côté serveur — jamais fournis par le frontend
const PLANS: Record<string, { name: string; amount: number; description: string }> = {
  vitrine:   { name: 'Maintenance Site Vitrine',    amount: 49,  description: 'CA-TECH · Maintenance mensuelle site vitrine' },
  ecommerce: { name: 'Maintenance E-commerce',      amount: 99,  description: 'CA-TECH · Maintenance mensuelle e-commerce' },
  ia:        { name: 'Maintenance IA / Sur-mesure', amount: 149, description: 'CA-TECH · Maintenance mensuelle IA & sur-mesure' },
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { client_id, plan, devis_id } = await req.json() as {
      client_id: string
      plan:      'vitrine' | 'ecommerce' | 'ia'
      devis_id?: string
    }

    if (!client_id || !plan || !PLANS[plan]) {
      return json({ error: 'client_id et plan (vitrine|ecommerce|ia) requis' }, 400)
    }

    const planConfig = PLANS[plan]
    const sb         = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    const stripe     = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    // Lire le client
    const { data: client, error: cErr } = await sb
      .from('clients')
      .select('id, first_name, last_name, email, stripe_customer_id')
      .eq('id', client_id)
      .single()

    if (cErr || !client) return json({ error: 'Client introuvable' }, 404)

    // Créer ou récupérer le Stripe Customer
    let stripeCustomerId: string = client.stripe_customer_id ?? ''

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name:  `${client.first_name} ${client.last_name}`.trim(),
        metadata: { client_id },
      })
      stripeCustomerId = customer.id
      await sb.from('clients')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', client_id)
    }

    // Vérifier doublon : pas deux abonnements actifs/trialing identiques pour ce client
    const { data: existing } = await sb
      .from('subscriptions')
      .select('id, status')
      .eq('client_id', client_id)
      .eq('name', planConfig.name)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (existing) {
      return json({ error: `Un abonnement "${planConfig.name}" est déjà actif ou en cours pour ce client` }, 409)
    }

    // Créer la Checkout Session en mode subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'subscription',
      customer:             stripeCustomerId,
      line_items: [{
        price_data: {
          currency:     'eur',
          product_data: {
            name:        planConfig.name,
            description: planConfig.description,
          },
          unit_amount: planConfig.amount * 100,
          recurring:   { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        client_id,
        plan,
        devis_id: devis_id ?? '',
      },
      success_url: 'https://ca-tech.fr?abonnement=confirme',
      cancel_url:  'https://ca-tech.fr?abonnement=annule',
    })

    // Pré-enregistrer l'abonnement en base (statut trialing jusqu'au webhook)
    await sb.from('subscriptions').insert([{
      client_id,
      devis_id:                  devis_id || null,
      name:                      planConfig.name,
      amount:                    planConfig.amount,
      frequency:                 'monthly',
      status:                    'trialing',
      stripe_customer_id:        stripeCustomerId,
      stripe_checkout_session_id: session.id,
    }])

    return json({ url: session.url, session_id: session.id })

  } catch (err) {
    console.error('[stripe-create-subscription]', err)
    return json({ error: String(err) }, 500)
  }
})
