import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_KEY       = Deno.env.get('STRIPE_SECRET_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { invoice_id, invoice_number, amount_ttc, client_email } =
      await req.json() as {
        invoice_id:     string
        invoice_number: string
        amount_ttc:     number
        client_email?:  string
      }

    if (!invoice_id || !amount_ttc || amount_ttc <= 0) {
      return new Response(JSON.stringify({ error: 'invoice_id et amount_ttc requis' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       client_email || undefined,
      line_items: [{
        price_data: {
          currency:     'eur',
          product_data: {
            name:        `Facture ${invoice_number}`,
            description: 'CA-TECH · Agence Web & IA',
          },
          unit_amount: Math.round(amount_ttc * 100),
        },
        quantity: 1,
      }],
      metadata: {
        invoice_id,
        invoice_number,
      },
      // Checkout sessions expire after max 30 days
      expires_at:  Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      success_url: 'https://ca-tech.fr?paiement=confirme',
      cancel_url:  'https://ca-tech.fr?paiement=annule',
    })

    // Persist the checkout URL on the invoice immediately
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    await sb.from('invoices')
      .update({ stripe_payment_link: session.url })
      .eq('id', invoice_id)

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[stripe-create-checkout]', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
