import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

const VALID_METHODS = ['virement', 'carte', 'cheque', 'especes', 'stripe']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { invoice_id, client_id, montant, methode, date_paiement, reference, notes } =
      await req.json() as {
        invoice_id?: string
        client_id: string
        montant: number
        methode: string
        date_paiement: string
        reference?: string
        notes?: string
      }

    if (!client_id)                        return json({ error: 'client_id requis' }, 400)
    if (!montant || montant <= 0)          return json({ error: 'montant doit être > 0' }, 400)
    if (!VALID_METHODS.includes(methode))  return json({ error: 'methode invalide' }, 400)
    if (!date_paiement)                    return json({ error: 'date_paiement requis' }, 400)

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // IDOR : seuls les managers CA-TECH peuvent enregistrer un paiement manuel
    const userId = extractUserId(req)
    if (!userId) return json({ error: 'Token invalide' }, 401)
    const { data: mgr } = await sb
      .from('manager_users').select('user_id').eq('user_id', userId).maybeSingle()
    if (!mgr) return json({ error: 'Accès refusé' }, 403)

    // Si lié à une facture : lire le solde restant depuis la DB et valider
    if (invoice_id) {
      const { data: inv, error: invErr } = await sb
        .from('invoices')
        .select('id, total, amount_paid')
        .eq('id', invoice_id)
        .single()
      if (invErr || !inv) return json({ error: 'Facture introuvable' }, 404)

      const remaining = Math.round((Number(inv.total) - Number(inv.amount_paid ?? 0)) * 100)
      const montantCents = Math.round(montant * 100)
      if (montantCents > remaining + 1) {
        const rem = remaining / 100
        return json({
          error: `Montant (${montant}€) supérieur au solde restant (${rem.toFixed(2)}€)`,
        }, 400)
      }
    }

    const paidAt = new Date(date_paiement).toISOString()

    // INSERT avec montant validé côté serveur
    const { data: payment, error: pErr } = await sb
      .from('payments')
      .insert([{
        client_id,
        invoice_id: invoice_id || null,
        amount:    montant,
        method:    methode,
        status:    'completed',
        reference: reference || null,
        notes:     notes     || null,
        paid_at:   paidAt,
      }])
      .select('id, amount, method, paid_at')
      .single()
    if (pErr) throw pErr

    // Synchroniser la facture : recompute depuis la somme réelle des paiements (plus robuste que +delta)
    if (invoice_id) {
      const { data: pmts } = await sb
        .from('payments')
        .select('amount')
        .eq('invoice_id', invoice_id)
        .eq('status', 'completed')
      const totalPaid = (pmts ?? []).reduce((s: number, r: { amount: string }) => s + Number(r.amount), 0)
      const { data: inv } = await sb.from('invoices').select('total').eq('id', invoice_id).single()
      if (inv) {
        const newStatus = totalPaid <= 0 ? 'sent'
          : totalPaid >= Number(inv.total) ? 'paid' : 'partial'
        await sb.from('invoices').update({
          amount_paid: totalPaid,
          status:      newStatus,
          paid_at:     newStatus === 'paid' ? paidAt : null,
        }).eq('id', invoice_id)
      }
    }

    return json({ id: payment.id, amount: payment.amount })

  } catch (err) {
    console.error('[create-manual-payment]', err)
    return json({ error: String(err) }, 500)
  }
})
