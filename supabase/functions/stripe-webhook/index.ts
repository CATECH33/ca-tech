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
    const stripe    = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)
    } catch (err) {
      console.error('[stripe-webhook] Signature invalide', err)
      return new Response('Signature invalide', { status: 400 })
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // ─── checkout.session.completed ────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.mode === 'subscription') {
        // ── Abonnement ──────────────────────────────────────────────────────────
        const stripeSubId = typeof session.subscription === 'string' ? session.subscription : null
        if (stripeSubId) {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)
          await sb.from('subscriptions')
            .update({
              stripe_subscription_id: stripeSubId,
              status:                 'active',
              current_period_start:   new Date(stripeSub.current_period_start * 1000).toISOString(),
              current_period_end:     new Date(stripeSub.current_period_end   * 1000).toISOString(),
            })
            .eq('stripe_checkout_session_id', session.id)
        }
        return new Response('OK', { status: 200 })
      }

      // ── Paiement unique (acompte / solde / ad hoc) ──────────────────────────
      const invoiceId = session.metadata?.invoice_id
      if (!invoiceId) {
        console.warn('[stripe-webhook] Pas de invoice_id dans les métadonnées')
        return new Response('OK', { status: 200 })
      }

      const amountEuros   = (session.amount_total ?? 0) / 100
      const paidAt        = new Date().toISOString()
      const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null

      // Idempotence : ignorer si déjà enregistré
      if (paymentIntent) {
        const { data: existing } = await sb
          .from('payments')
          .select('id')
          .eq('stripe_payment_id', paymentIntent)
          .maybeSingle()
        if (existing) {
          console.log('[stripe-webhook] Paiement déjà enregistré, ignoré', paymentIntent)
          return new Response('OK', { status: 200 })
        }
      }

      // Lire la facture
      const { data: inv, error: invErr } = await sb
        .from('invoices')
        .select('id, total, amount_paid, client_id, payment_type, devis_id')
        .eq('id', invoiceId)
        .single()

      if (invErr || !inv) {
        console.error('[stripe-webhook] Facture introuvable', invoiceId, invErr)
        return new Response('Facture introuvable', { status: 404 })
      }

      // Insérer le paiement
      const { error: pErr } = await sb.from('payments').insert([{
        invoice_id:        invoiceId,
        client_id:         inv.client_id,
        amount:            amountEuros,
        method:            'stripe',
        status:            'completed',
        reference:         paymentIntent,
        stripe_payment_id: paymentIntent,
        notes:             `Paiement Stripe · Session ${session.id}`,
        paid_at:           paidAt,
      }])
      if (pErr) {
        console.error('[stripe-webhook] Erreur INSERT payments', pErr)
        return new Response('Erreur BDD', { status: 500 })
      }

      // Synchroniser la facture
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
    }

    // ─── customer.subscription.updated ─────────────────────────────────────────
    if (event.type === 'customer.subscription.updated') {
      const sub       = event.data.object as Stripe.Subscription
      const statusMap: Record<string, string> = {
        active:   'active',   past_due:  'past_due',
        canceled: 'cancelled', unpaid:   'past_due',
        paused:   'paused',   trialing:  'trialing',
      }
      await sb.from('subscriptions')
        .update({
          status:               statusMap[sub.status] ?? sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      return new Response('OK', { status: 200 })
    }

    // ─── customer.subscription.deleted ─────────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      await sb.from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)
      return new Response('OK', { status: 200 })
    }

    // ─── invoice.payment_succeeded (renouvellement abonnement) ─────────────────
    if (event.type === 'invoice.payment_succeeded') {
      const stripeInv = event.data.object as Stripe.Invoice
      if (stripeInv.subscription) {
        const stripeSubId = typeof stripeInv.subscription === 'string' ? stripeInv.subscription : null
        if (stripeSubId) {
          const { data: sub } = await sb
            .from('subscriptions')
            .select('id, client_id')
            .eq('stripe_subscription_id', stripeSubId)
            .maybeSingle()
          if (sub) {
            await sb.from('payments').insert([{
              client_id:         sub.client_id,
              amount:            (stripeInv.amount_paid ?? 0) / 100,
              method:            'stripe',
              status:            'completed',
              stripe_payment_id: typeof stripeInv.payment_intent === 'string' ? stripeInv.payment_intent : null,
              notes:             `Renouvellement abonnement · Stripe Invoice ${stripeInv.id}`,
              paid_at:           new Date().toISOString(),
            }])
          }
        }
      }
      return new Response('OK', { status: 200 })
    }

    // ─── invoice.payment_failed ─────────────────────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
      const stripeInv = event.data.object as Stripe.Invoice
      if (stripeInv.subscription) {
        const subId = typeof stripeInv.subscription === 'string' ? stripeInv.subscription : null
        if (subId) {
          await sb.from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subId)
        }
      }
      return new Response('OK', { status: 200 })
    }

    // ─── charge.refunded ────────────────────────────────────────────────────────
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const pi     = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
      if (pi) {
        await sb.from('payments')
          .update({ status: 'refunded' })
          .eq('stripe_payment_id', pi)
      }
      return new Response('OK', { status: 200 })
    }

    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('[stripe-webhook]', err)
    return new Response('Erreur interne', { status: 500 })
  }
})
