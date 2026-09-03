import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_KEY       = Deno.env.get('STRIPE_SECRET_KEY')!
const WEBHOOK_SECRET   = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const ANTHROPIC_KEY    = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''

// ─── Helpers email paiement échoué ───────────────────────────────────────────

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => bin += String.fromCharCode(b))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function getGoogleAccessToken(sb: ReturnType<typeof createClient>): Promise<{ token: string; email: string } | null> {
  const { data: g } = await sb
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at, email')
    .limit(1)
    .maybeSingle()
  if (!g) return null

  if (new Date(g.expires_at).getTime() > Date.now() + 5 * 60 * 1000) {
    return { token: g.access_token, email: g.email }
  }
  if (!g.refresh_token || !GOOGLE_CLIENT_ID) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token', client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET, refresh_token: g.refresh_token,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) return null
  await sb.from('google_integrations').update({
    access_token: data.access_token,
    expires_at: new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString(),
  }).eq('email', g.email)
  return { token: data.access_token, email: g.email }
}

async function sendGmailRaw(accessToken: string, from: string, to: string, subject: string, html: string) {
  const raw = toBase64Url([
    `From: CA-TECH <${from}>`, `To: ${to}`, `Subject: ${subject}`,
    'MIME-Version: 1.0', 'Content-Type: text/html; charset=UTF-8', '', html,
  ].join('\r\n'))
  await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
}

async function generatePaymentFailedEmail(clientName: string, planName: string, amount: number): Promise<{ subject: string; html: string }> {
  const amountFr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
  const fallbackHtml = `<!DOCTYPE html><html lang="fr"><body style="font-family:sans-serif;max-width:600px;margin:32px auto;padding:0 16px;">
<div style="background:#0A2540;padding:24px 32px;border-radius:8px 8px 0 0;border-top:4px solid #0066FF;">
  <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">CA<span style="color:#0066FF;">-TECH</span></h1>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
  <p>Bonjour ${clientName},</p>
  <p>Nous vous informons que le prélèvement mensuel de votre abonnement <strong>${planName}</strong> (${amountFr}/mois) n'a pas pu être effectué.</p>
  <p>Pour maintenir votre abonnement actif, nous vous invitons à mettre à jour vos informations de paiement en cliquant sur le lien que vous avez reçu de Stripe.</p>
  <p>Notre équipe reste disponible pour vous accompagner.<br>Cordialement,<br>L'équipe CA-TECH<br>contact@ca-tech.fr</p>
</div>
</body></html>`

  if (!ANTHROPIC_KEY) return { subject: `Problème de paiement — ${planName}`, html: fallbackHtml }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 600,
        messages: [{ role: 'user', content: `Tu rédiges un email pour CA-TECH (ESN web & IA) à envoyer à un client dont le paiement d'abonnement a échoué.
Client : ${clientName}
Plan : ${planName} (${amountFr}/mois)

Instructions : ton empathique et bienveillant, rassure le client, propose de mettre à jour sa CB via le lien Stripe qu'il a reçu séparément, reste court (3 paragraphes max).
Signature : "Cordialement, L'équipe CA-TECH, contact@ca-tech.fr"

Réponds UNIQUEMENT JSON sans markdown : {"subject":"...","body_html":"<p>...</p>"}
body_html = HTML partiel (sans html/head/body).` }],
      }),
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    const parsed = JSON.parse((data.content?.[0]?.text ?? '').trim())

    const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:sans-serif;max-width:600px;margin:32px auto;padding:0 16px;">
<div style="background:#0A2540;padding:24px 32px;border-radius:8px 8px 0 0;border-top:4px solid #0066FF;">
  <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">CA<span style="color:#0066FF;">-TECH</span></h1>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
  ${parsed.body_html}
</div>
</body></html>`
    return { subject: parsed.subject, html }
  } catch {
    return { subject: `Problème de paiement — ${planName}`, html: fallbackHtml }
  }
}

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

      // P2 : sync atomique via RPC — FOR UPDATE élimine la race condition
      const { error: syncErr } = await sb.rpc('sync_invoice_after_payment', {
        p_invoice_id: invoiceId,
        p_paid_at:    paidAt,
      })
      if (syncErr) console.error('[stripe-webhook] Erreur sync facture', syncErr)

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
      // A1 : ne jamais réactiver un abonnement déjà annulé — Stripe envoie parfois
      // customer.subscription.updated après customer.subscription.deleted (ordre non garanti).
      await sb.from('subscriptions')
        .update({
          status:               statusMap[sub.status] ?? sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
        .neq('status', 'cancelled')
      return new Response('OK', { status: 200 })
    }

    // ─── customer.subscription.deleted ─────────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      await sb.from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)

      // Notification churn in-app
      const { data: dbSub } = await sb
        .from('subscriptions')
        .select('name, amount, clients(first_name, last_name)')
        .eq('stripe_subscription_id', sub.id)
        .maybeSingle()

      if (dbSub) {
        const clientName = dbSub.clients
          ? `${(dbSub.clients as any).first_name} ${(dbSub.clients as any).last_name}`
          : 'Client inconnu'
        await sb.from('notifications').insert({
          type:    'warning',
          title:   `Abonnement résilié — ${clientName}`,
          message: `L'abonnement "${dbSub.name}" (${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dbSub.amount)}/mois) a été annulé.`,
          link:    '/paiements',
          is_read: false,
          metadata: { stripe_subscription_id: sub.id, event: 'churn' },
        })
      }
      return new Response('OK', { status: 200 })
    }

    // ─── invoice.payment_succeeded (renouvellement abonnement) ─────────────────
    if (event.type === 'invoice.payment_succeeded') {
      const stripeInv = event.data.object as Stripe.Invoice
      if (stripeInv.subscription) {
        const stripeSubId     = typeof stripeInv.subscription   === 'string' ? stripeInv.subscription   : null
        const stripePaymentId = typeof stripeInv.payment_intent === 'string' ? stripeInv.payment_intent : null

        // F2 : idempotence — ne pas insérer un paiement déjà enregistré.
        // Le UNIQUE index payments_stripe_payment_id_key garantit l'unicité en DB,
        // mais on vérifie en amont pour éviter une erreur 23505 et des retry Stripe infinis.
        if (stripePaymentId) {
          const { data: existingPayment } = await sb
            .from('payments')
            .select('id')
            .eq('stripe_payment_id', stripePaymentId)
            .maybeSingle()
          if (existingPayment) {
            console.log('[stripe-webhook] invoice.payment_succeeded déjà traité, ignoré', stripePaymentId)
            return new Response('OK', { status: 200 })
          }
        }

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
              stripe_payment_id: stripePaymentId,
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
          // W2 : ne pas écraser un abonnement déjà annulé
          await sb.from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subId)
            .neq('status', 'cancelled')

          // Récupérer les infos abonnement + client
          const { data: dbSub } = await sb
            .from('subscriptions')
            .select('name, amount, clients(first_name, last_name, email)')
            .eq('stripe_subscription_id', subId)
            .maybeSingle()

          if (dbSub?.clients) {
            const cl = dbSub.clients as any
            const clientName = `${cl.first_name} ${cl.last_name}`

            // Notification in-app
            await sb.from('notifications').insert({
              type:    'error',
              title:   `Paiement échoué — ${clientName}`,
              message: `L'abonnement "${dbSub.name}" n'a pas pu être prélevé. Montant : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dbSub.amount)}/mois.`,
              link:    '/paiements',
              is_read: false,
              metadata: { stripe_subscription_id: subId, event: 'payment_failed' },
            })

            // Email IA au client via Gmail
            try {
              const googleAuth = await getGoogleAccessToken(sb)
              if (googleAuth && cl.email) {
                const { subject, html } = await generatePaymentFailedEmail(clientName, dbSub.name, dbSub.amount)
                await sendGmailRaw(googleAuth.token, googleAuth.email, cl.email, subject, html)
                console.log(`[stripe-webhook] Email paiement échoué envoyé à ${cl.email}`)
              }
            } catch (emailErr) {
              console.error('[stripe-webhook] Erreur envoi email paiement échoué', emailErr)
            }
          }
        }
      }
      return new Response('OK', { status: 200 })
    }

    // ─── customer.subscription.trial_will_end ─────────────────────────────────
    // W3 (amélioration future) : notifier le client J-3 avant fin d'essai.
    // Non implémenté — aucun essai gratuit (trialing) n'est actuellement utilisé
    // par CA-TECH. À implémenter si des trials sont activés dans Stripe.
    if (event.type === 'customer.subscription.trial_will_end') {
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
