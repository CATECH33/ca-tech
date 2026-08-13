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

// Extrait le sub (user UUID) du JWT déjà vérifié par la gateway Supabase (verify_jwt=true).
// La signature est garantie valide — on décode uniquement le payload.
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
    const { subscription_id } = await req.json() as { subscription_id: string }
    if (!subscription_id) return json({ error: 'subscription_id requis' }, 400)

    const sb     = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    // ── Vérification IDOR : l'appelant doit être un manager enregistré (W4) ───
    const userId = extractUserId(req)
    if (!userId) return json({ error: 'Token invalide' }, 401)

    const { data: mgr } = await sb
      .from('manager_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!mgr) return json({ error: 'Accès refusé' }, 403)
    // ──────────────────────────────────────────────────────────────────────────

    // Lire la DB pour obtenir les IDs Stripe
    const { data: sub, error: sErr } = await sb
      .from('subscriptions')
      .select('id, stripe_subscription_id, stripe_checkout_session_id, status')
      .eq('id', subscription_id)
      .single()

    if (sErr || !sub) return json({ error: 'Abonnement introuvable' }, 404)
    if (sub.status === 'cancelled') return json({ error: 'Abonnement déjà annulé' }, 400)

    if (sub.stripe_subscription_id) {
      // Abonnement Stripe actif — annuler via l'API subscription
      await stripe.subscriptions.cancel(sub.stripe_subscription_id)

    } else if (sub.stripe_checkout_session_id) {
      // ── F4 : Checkout non complétée — expirer la session Stripe ─────────────
      // Sans cette expiration, le client pourrait compléter le paiement après
      // l'annulation DB, créant une incohérence état (DB=cancelled, Stripe=active).
      try {
        await stripe.checkout.sessions.expire(sub.stripe_checkout_session_id)
        console.log('[stripe-cancel-subscription] Session Checkout expirée :', sub.stripe_checkout_session_id)
      } catch (expErr: any) {
        // Session déjà expirée (>24h) ou déjà complétée — continuer sans bloquer
        console.warn('[stripe-cancel-subscription] Session non expirable :', expErr?.message)
      }
    }

    // Mettre à jour la DB immédiatement (le webhook customer.subscription.deleted confirmera si applicable)
    await sb.from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', subscription_id)

    return json({ success: true })

  } catch (err) {
    console.error('[stripe-cancel-subscription]', err)
    return json({ error: String(err) }, 500)
  }
})
