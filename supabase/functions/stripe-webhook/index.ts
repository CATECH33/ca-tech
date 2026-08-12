import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_KEY       = Deno.env.get('STRIPE_SECRET_KEY')!
const WEBHOOK_SECRET   = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  try {
    const body      = await req.text()
    const signature = req.headers.get('stripe-signature') ?? ''

    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)
    } catch (err) {
      console.error('[stripe-webhook] Signature invalide', err)
      return new Response('Signature invalide', { status: 400 })
    }

    if (event.type !== 'checkout.session.completed') {
      return new Response('OK', { status: 200 })
    }

    const session   = event.data.object as Stripe.Checkout.Session
    const invoiceId = session.metadata?.invoice_id

    if (!invoiceId) {
      console.warn('[stripe-webhook] Pas de invoice_id dans les métadonnées, ignoré')
      return new Response('OK', { status: 200 })
    }

    const amountEuros = (session.amount_total ?? 0) / 100
    const paidAt      = new Date().toISOString()
    const sb          = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // Fetch current invoice to compute new amount_paid
    const { data: inv, error: invErr } = await sb
      .from('invoices')
      .select('total, amount_paid, client_id')
      .eq('id', invoiceId)
      .single()

    if (invErr || !inv) {
      console.error('[stripe-webhook] Facture introuvable', invoiceId, invErr)
      return new Response('Facture introuvable', { status: 404 })
    }

    // Insert payment record
    const { error: pErr } = await sb.from('payments').insert([{
      invoice_id:        invoiceId,
      client_id:         inv.client_id,
      amount:            amountEuros,
      method:            'stripe',
      status:            'completed',
      reference:         typeof session.payment_intent === 'string' ? session.payment_intent : null,
      stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      notes:             `Paiement Stripe · Session ${session.id}`,
      paid_at:           paidAt,
    }])

    if (pErr) {
      console.error('[stripe-webhook] Erreur INSERT payments', pErr)
      return new Response('Erreur BDD', { status: 500 })
    }

    // Sync invoice status
    const newAmountPaid = Math.min(Number(inv.amount_paid ?? 0) + amountEuros, Number(inv.total))
    const isFullyPaid   = newAmountPaid >= Number(inv.total)

    const invoiceUpdate: Record<string, unknown> = {
      amount_paid: newAmountPaid,
      status:      isFullyPaid ? 'paid' : 'partial',
    }
    if (isFullyPaid) invoiceUpdate.paid_at = paidAt

    const { error: iErr } = await sb.from('invoices').update(invoiceUpdate).eq('id', invoiceId)
    if (iErr) console.error('[stripe-webhook] Erreur UPDATE invoices', iErr)

    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('[stripe-webhook]', err)
    return new Response('Erreur interne', { status: 500 })
  }
})
