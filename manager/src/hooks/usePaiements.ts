import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Paiement, PaiementMethod } from '@/types'

export type PaiementRow = Paiement & {
  facture_numero?: string
  facture_total?: number
  facture_paid?: number
}

export interface InvoiceForPayment {
  id: string
  numero: string
  total: number
  amount_paid: number
  remaining: number
  status: string
}

const METHOD_FROM_DB: Record<string, PaiementMethod> = {
  virement: 'virement', carte: 'carte', stripe: 'stripe',
  cheque: 'cheque', especes: 'especes',
  paypal: 'virement', autre: 'virement',
}
const METHOD_TO_DB: Record<PaiementMethod, string> = {
  virement: 'virement', carte: 'carte', stripe: 'stripe',
  cheque: 'cheque', especes: 'especes',
}

function mapClient(c: Record<string, any>) {
  return {
    id: c.id, created_at: c.created_at, updated_at: c.updated_at,
    nom: c.last_name, prenom: c.first_name, email: c.email,
    telephone: c.phone ?? undefined, entreprise: c.company ?? undefined,
    pays: c.country ?? 'France',
    status: c.status === 'active' ? 'actif' as const
      : c.status === 'inactive' ? 'inactif' as const : 'archive' as const,
    total_ca: 0,
  }
}

function mapRow(row: Record<string, any>): PaiementRow {
  return {
    id: row.id,
    created_at: row.created_at,
    facture_id: row.invoice_id ?? '',
    client_id: row.client_id,
    client: row.clients ? mapClient(row.clients) : undefined,
    montant: Number(row.amount),
    methode: METHOD_FROM_DB[row.method] ?? 'virement',
    reference: row.reference ?? undefined,
    stripe_payment_id: row.stripe_payment_id ?? undefined,
    date_paiement: row.paid_at
      ? row.paid_at.split('T')[0]
      : row.created_at.split('T')[0],
    notes: row.notes ?? undefined,
    facture_numero: row.invoices?.invoice_number ?? undefined,
    facture_total: row.invoices ? Number(row.invoices.total ?? 0) : undefined,
    facture_paid: row.invoices ? Number(row.invoices.amount_paid ?? 0) : undefined,
  }
}

const Q = ['paiements'] as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePaiements() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, clients(*), invoices(invoice_number, total, amount_paid)')
        .eq('status', 'completed')
        .order('paid_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useClientInvoicesForPayment(clientId: string | null) {
  return useQuery({
    queryKey: ['invoices-for-payment', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, amount_paid, status')
        .eq('client_id', clientId!)
        .not('status', 'in', '("paid","cancelled")')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        numero: r.invoice_number as string,
        total: Number(r.total),
        amount_paid: Number(r.amount_paid ?? 0),
        remaining: Math.max(0, Number(r.total) - Number(r.amount_paid ?? 0)),
        status: r.status as string,
      })) as InvoiceForPayment[]
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

async function syncInvoice(invoiceId: string) {
  const { data: pmts } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('status', 'completed')
  const totalPaid = (pmts ?? []).reduce((s, r) => s + Number(r.amount), 0)
  const { data: inv } = await supabase
    .from('invoices').select('total').eq('id', invoiceId).single()
  if (!inv) return
  const newStatus = totalPaid === 0
    ? 'sent'
    : totalPaid >= Number(inv.total) ? 'paid' : 'partial'
  await supabase.from('invoices').update({
    amount_paid: totalPaid,
    status: newStatus,
    paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
  }).eq('id', invoiceId)
}

export function useCreatePaiement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: {
      client_id: string
      invoice_id?: string
      montant: number
      methode: PaiementMethod
      reference?: string
      date_paiement: string
      notes?: string
    }) => {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          client_id: p.client_id,
          invoice_id: p.invoice_id || null,
          amount: p.montant,
          method: METHOD_TO_DB[p.methode],
          status: 'completed',
          reference: p.reference || null,
          notes: p.notes || null,
          paid_at: new Date(p.date_paiement).toISOString(),
        }])
        .select('*, clients(*), invoices(invoice_number, total, amount_paid)')
        .single()
      if (error) throw error
      if (p.invoice_id) await syncInvoice(p.invoice_id)
      return mapRow(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: Q })
      qc.invalidateQueries({ queryKey: ['factures'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useDeletePaiement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, invoice_id }: { id: string; invoice_id?: string }) => {
      const { error } = await supabase.from('payments').delete().eq('id', id)
      if (error) throw error
      if (invoice_id) await syncInvoice(invoice_id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: Q })
      qc.invalidateQueries({ queryKey: ['factures'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
