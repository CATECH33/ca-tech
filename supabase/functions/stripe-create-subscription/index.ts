import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_KEY       = Deno.env.get('STRIPE_SECRET_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Plans legacy hardcodés (backward compat)
const LEGACY_PLANS: Record<string, { name: string; amount: number; description: string }> = {
  vitrine:   { name: 'Maintenance Site Vitrine',    amount: 49,  description: 'CA-TECH · Maintenance mensuelle site vitrine' },
  ecommerce: { name: 'Maintenance E-commerce',      amount: 99,  description: 'CA-TECH · Maintenance mensuelle e-commerce' },
  ia:        { name: 'Maintenance IA / Sur-mesure', amount: 149, description: 'CA-TECH · Maintenance mensuelle IA & sur-mesure' },
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function extractUserId(req: Request): string | null {
  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const payload = JSON.parse(atob(b64 + pad))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch { return null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json() as {
      client_id:       string
      plan?:           string   // legacy
      stripe_price_id?: string  // nouveau
      devis_id?:       string
    }

    const { client_id, plan, stripe_price_id, devis_id } = body

    if (!client_id) return json({ error: 'client_id requis' }, 400)
    if (!plan && !stripe_price_id) return json({ error: 'plan ou stripe_price_id requis' }, 400)

    const sb     = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    // Vérification IDOR manager
    const userId = extractUserId(req)
    if (!userId) return json({ error: 'Token invalide' }, 401)

    const { data: mgr } = await sb
      .from('manager_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!mgr) return json({ error: 'Accès refusé' }, 403)

    // Résolution du plan
    let planName:    string
    let planAmount:  number
    let stripePriceId: string | undefined

    if (stripe_price_id) {
      // Nouveau chemin : plan depuis stripe_plans
      const { data: dbPlan, error: planErr } = await sb
        .from('stripe_plans')
        .select('name, amount, stripe_price_id, active')
        .eq('stripe_price_id', stripe_price_id)
        .maybeSingle()

      if (planErr || !dbPlan) return json({ error: 'Plan introuvable' }, 404)
      if (!dbPlan.active) return json({ error: 'Plan inactif' }, 409)

      planName     = dbPlan.name
      planAmount   = dbPlan.amount / 100  // centimes → euros
      stripePriceId = dbPlan.stripe_price_id
    } else {
      // Chemin legacy
      const legacy = LEGACY_PLANS[plan!]
      if (!legacy) return json({ error: 'Plan invalide' }, 400)
      planName   = legacy.name
      planAmount = legacy.amount
    }

    // Lire le client
    const { data: client, error: cErr } = await sb
      .from('clients')
      .select('id, first_name, last_name, email, stripe_customer_id')
      .eq('id', client_id)
      .single()

    if (cErr || !client) return json({ error: 'Client introuvable' }, 404)

    // Créer/récupérer le Stripe Customer
    let stripeCustomerId: string = client.stripe_customer_id ?? ''
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name:  `${client.first_name} ${client.last_name}`.trim(),
        metadata: { client_id },
      })
      stripeCustomerId = customer.id
      await sb.from('clients').update({ stripe_customer_id: stripeCustomerId }).eq('id', client_id)
    }

    // Vérifier doublon abonnement actif
    const { data: existing } = await sb
      .from('subscriptions')
      .select('id, status')
      .eq('client_id', client_id)
      .eq('name', planName)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (existing) {
      return json({ error: `Un abonnement "${planName}" est déjà actif pour ce client` }, 409)
    }

    // Créer la Checkout Session
    const lineItem = stripePriceId
      ? { price: stripePriceId, quantity: 1 }
      : {
          price_data: {
            currency: 'eur',
            product_data: { name: planName, description: `CA-TECH · ${planName}` },
            unit_amount: planAmount * 100,
            recurring:   { interval: 'month' as const },
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'subscription',
      customer:             stripeCustomerId,
      line_items:           [lineItem],
      metadata: {
        client_id,
        plan:     plan ?? 'custom',
        devis_id: devis_id ?? '',
        stripe_price_id: stripePriceId ?? '',
      },
      success_url: 'https://ca-tech.fr?abonnement=confirme',
      cancel_url:  'https://ca-tech.fr?abonnement=annule',
    })

    // Pré-enregistrer l'abonnement
    await sb.from('subscriptions').insert([{
      client_id,
      devis_id:                   devis_id || null,
      name:                       planName,
      amount:                     planAmount,
      frequency:                  'monthly',
      status:                     'trialing',
      stripe_customer_id:         stripeCustomerId,
      stripe_checkout_session_id: session.id,
    }])

    return json({ url: session.url, session_id: session.id })

  } catch (err) {
    console.error('[stripe-create-subscription]', err)
    return json({ error: String(err) }, 500)
  }
})
