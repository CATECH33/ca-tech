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
    const { subscription_id } = await req.json() as { subscription_id: string }
    if (!subscription_id) return json({ error: 'subscription_id requis' }, 400)

    const sb     = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    // Lire la DB pour obtenir le stripe_subscription_id
    const { data: sub, error: sErr } = await sb
      .from('subscriptions')
      .select('id, stripe_subscription_id, status')
      .eq('id', subscription_id)
      .single()

    if (sErr || !sub) return json({ error: 'Abonnement introuvable' }, 404)
    if (sub.status === 'cancelled') return json({ error: 'Abonnement déjà annulé' }, 400)

    // Annuler dans Stripe si on a un stripe_subscription_id
    if (sub.stripe_subscription_id) {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id)
    }

    // Mettre à jour la DB immédiatement (le webhook confirmera)
    await sb.from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', subscription_id)

    return json({ success: true })

  } catch (err) {
    console.error('[stripe-cancel-subscription]', err)
    return json({ error: String(err) }, 500)
  }
})
