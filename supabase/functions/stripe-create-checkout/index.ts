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
    // F1 : accepter uniquement invoice_id — le montant est déterminé côté serveur depuis la DB,
    // jamais fourni par le frontend (sinon un client pourrait manipuler le montant facturé).
    const { invoice_id } = await req.json() as { invoice_id: string }

    if (!invoice_id) return json({ error: 'invoice_id requis' }, 400)

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // ── Vérification IDOR (S1) : l'appelant doit être un manager enregistré ─
    const userId = extractUserId(req)
    if (!userId) return json({ error: 'Token invalide' }, 401)

    const { data: mgr } = await sb
      .from('manager_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!mgr) return json({ error: 'Accès refusé' }, 403)
    // ─────────────────────────────────────────────────────────────────────────

    // Lire la facture et l'email client depuis la DB
    const { data: inv, error: invErr } = await sb
      .from('invoices')
      .select('id, invoice_number, total, amount_paid, status, client_id, clients(id, email)')
      .eq('id', invoice_id)
      .single()

    if (invErr || !inv) return json({ error: 'Facture introuvable' }, 404)

    const remaining = Number(inv.total ?? 0) - Number(inv.amount_paid ?? 0)
    if (remaining <= 0) return json({ error: 'Facture déjà réglée' }, 400)

    const clientEmail = (inv.clients as any)?.email ?? undefined
    const invoiceNumber = inv.invoice_number ?? inv.id

    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       clientEmail,
      line_items: [{
        price_data: {
          currency:     'eur',
          product_data: {
            name:        `Facture ${invoiceNumber}`,
            description: 'CA-TECH · Agence Web & IA',
          },
          unit_amount: Math.round(remaining * 100),
        },
        quantity: 1,
      }],
      metadata: {
        invoice_id,
        invoice_number: invoiceNumber,
      },
      expires_at:  Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      success_url: 'https://ca-tech.fr?paiement=confirme',
      cancel_url:  'https://ca-tech.fr?paiement=annule',
    })

    await sb.from('invoices')
      .update({ stripe_payment_link: session.url })
      .eq('id', invoice_id)

    return json({ url: session.url, session_id: session.id })

  } catch (err) {
    console.error('[stripe-create-checkout]', err)
    return json({ error: String(err) }, 500)
  }
})
