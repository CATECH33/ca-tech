import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Facture, FactureStatus } from '@/types'

// ─── Maps ────────────────────────────────────────────────────────────────────

const STATUS_FROM_DB: Record<string, FactureStatus> = {
  draft: 'brouillon', sent: 'envoyee', viewed: 'envoyee',
  partial: 'partiellement_payee', paid: 'payee',
  overdue: 'en_retard', cancelled: 'annulee',
}
const STATUS_TO_DB: Record<FactureStatus, string> = {
  brouillon: 'draft', envoyee: 'sent',
  partiellement_payee: 'partial', payee: 'paid',
  en_retard: 'overdue', annulee: 'cancelled',
}

function mapClient(c: Record<string, any>) {
  return {
    id: c.id, created_at: c.created_at, updated_at: c.updated_at,
    nom: c.last_name, prenom: c.first_name, email: c.email,
    telephone: c.phone ?? undefined, entreprise: c.company ?? undefined,
    pays: c.country ?? 'France',
    status: c.status === 'active' ? 'actif' as const : c.status === 'inactive' ? 'inactif' as const : 'archive' as const,
    total_ca: 0,
  }
}

function mapRow(row: Record<string, any>): Facture {
  const tva_rate = Number(row.tva_rate ?? 20)
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    numero: row.invoice_number,
    client_id: row.client_id,
    client: row.clients ? mapClient(row.clients) : undefined,
    status: STATUS_FROM_DB[row.status] ?? 'brouillon',
    lignes: (row.invoice_items ?? []).map((i: any) => ({
      id: i.id, description: i.description,
      quantite: Number(i.quantity), prix_unitaire: Number(i.unit_price),
      tva: tva_rate, total_ht: Number(i.total),
      total_ttc: Number(i.total) * (1 + tva_rate / 100),
    })),
    sous_total_ht: Number(row.subtotal),
    tva_rate,
    tva_total: Number(row.tax_amount),
    total_ttc: Number(row.total),
    amount_paid: Number(row.amount_paid ?? 0),
    date_emission: row.created_at.split('T')[0],
    date_echeance: row.due_date ?? row.created_at.split('T')[0],
    date_paiement: row.paid_at ? row.paid_at.split('T')[0] : undefined,
    notes: row.notes ?? undefined,
    stripe_payment_link: row.stripe_payment_link ?? undefined,
  }
}

async function nextFactureNumber() {
  const year = new Date().getFullYear()
  const { data: latest } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `FAC-${year}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  const lastNum = latest ? parseInt(latest.invoice_number.split('-')[2] ?? '0') : 0
  return `FAC-${year}-${String(lastNum + 1).padStart(3, '0')}`
}

const Q = ['factures'] as const

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useFactures() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export type FacturePayment = {
  id: string; invoice_id: string; client_id: string
  amount: number; method: string; reference?: string
  paid_at: string; status: string; notes?: string
}

export function useFacturePayments(factureId: string | null) {
  return useQuery({
    queryKey: ['facture-payments', factureId],
    enabled: !!factureId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', factureId!)
        .order('paid_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as FacturePayment[]
    },
  })
}

export function useCreateFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: {
      client_id: string; due_date?: string; notes?: string; tva_rate?: number
      lignes: Array<{ description: string; quantite: number; prix_unitaire: number }>
    }) => {
      const invoice_number = await nextFactureNumber()
      const rate = d.tva_rate ?? 20
      const subtotal = d.lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0)
      const tax_amount = subtotal * (rate / 100)
      const total = subtotal + tax_amount

      const { data: inv, error: iErr } = await supabase
        .from('invoices')
        .insert([{
          invoice_number, client_id: d.client_id,
          due_date: d.due_date || null, notes: d.notes || null,
          subtotal, tax_amount, total, tva_rate: rate,
          amount_paid: 0, status: 'draft',
        }])
        .select('id')
        .single()
      if (iErr) throw iErr

      if (d.lignes.length > 0) {
        const { error: liErr } = await supabase.from('invoice_items').insert(
          d.lignes.map((l, idx) => ({
            invoice_id: inv.id, description: l.description,
            quantity: l.quantite, unit_price: l.prix_unitaire,
            total: l.quantite * l.prix_unitaire, sort_order: idx,
          }))
        )
        if (liErr) throw liErr
      }

      const { data, error } = await supabase.from('invoices').select('*, clients(*), invoice_items(*)').eq('id', inv.id).single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: {
      id: string; client_id?: string; due_date?: string; notes?: string
      status?: FactureStatus; tva_rate?: number; stripe_payment_link?: string
      lignes?: Array<{ description: string; quantite: number; prix_unitaire: number }>
    }) => {
      const updates: Record<string, any> = {}
      if (d.client_id !== undefined) updates.client_id = d.client_id
      if (d.due_date !== undefined) updates.due_date = d.due_date || null
      if (d.notes !== undefined) updates.notes = d.notes || null
      if (d.stripe_payment_link !== undefined) updates.stripe_payment_link = d.stripe_payment_link || null
      if (d.status !== undefined) {
        updates.status = STATUS_TO_DB[d.status]
        if (d.status === 'envoyee') updates.sent_at = new Date().toISOString()
        if (d.status === 'payee') { updates.paid_at = new Date().toISOString(); updates.amount_paid = -1 }
      }
      if (d.lignes !== undefined) {
        const rate = d.tva_rate ?? 20
        const subtotal = d.lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0)
        updates.subtotal = subtotal
        updates.tva_rate = rate
        updates.tax_amount = subtotal * (rate / 100)
        updates.total = subtotal * (1 + rate / 100)
        await supabase.from('invoice_items').delete().eq('invoice_id', d.id)
        if (d.lignes.length > 0) {
          await supabase.from('invoice_items').insert(
            d.lignes.map((l, idx) => ({
              invoice_id: d.id, description: l.description,
              quantity: l.quantite, unit_price: l.prix_unitaire,
              total: l.quantite * l.prix_unitaire, sort_order: idx,
            }))
          )
        }
      } else if (d.tva_rate !== undefined) {
        updates.tva_rate = d.tva_rate
      }
      const { data, error } = await supabase.from('invoices').update(updates).eq('id', d.id).select('*, clients(*), invoice_items(*)').single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateFactureStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FactureStatus }) => {
      const update: Record<string, any> = { status: STATUS_TO_DB[status] }
      if (status === 'envoyee') update.sent_at = new Date().toISOString()
      if (status === 'payee') { update.paid_at = new Date().toISOString(); update.amount_paid = -1 }
      const { data, error } = await supabase
        .from('invoices')
        .update(update)
        .eq('id', id)
        .select('*, clients(*), invoice_items(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useEnvoyerFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, clients(*), invoice_items(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useEnregistrerPaiement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      facture, montant, methode, reference, date_paiement, notes,
    }: {
      facture: Facture; montant: number; methode: string
      reference?: string; date_paiement: string; notes?: string
    }) => {
      const paidAt = new Date(date_paiement).toISOString()
      const newAmountPaid = Math.min(facture.amount_paid + montant, facture.total_ttc)
      const isFullyPaid = newAmountPaid >= facture.total_ttc

      const { error: pErr } = await supabase.from('payments').insert([{
        invoice_id: facture.id,
        client_id: facture.client_id,
        amount: montant,
        method: methode,
        reference: reference || null,
        notes: notes || null,
        paid_at: paidAt,
        status: 'completed',
      }])
      if (pErr) throw pErr

      const updates: Record<string, any> = {
        status: isFullyPaid ? 'paid' : 'partial',
        amount_paid: newAmountPaid,
      }
      if (isFullyPaid) updates.paid_at = paidAt

      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', facture.id)
        .select('*, clients(*), invoice_items(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: (_, { facture }) => {
      qc.invalidateQueries({ queryKey: Q })
      qc.invalidateQueries({ queryKey: ['facture-payments', facture.id] })
      qc.invalidateQueries({ queryKey: ['paiements'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useDeleteFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDuplicateFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (facture: Facture) => {
      const invoice_number = await nextFactureNumber()
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)
      const due_date = dueDate.toISOString().split('T')[0]

      const { data: inv, error: iErr } = await supabase
        .from('invoices')
        .insert([{
          invoice_number, client_id: facture.client_id,
          due_date, notes: facture.notes || null,
          subtotal: facture.sous_total_ht, tax_amount: facture.tva_total,
          total: facture.total_ttc, tva_rate: facture.tva_rate,
          amount_paid: 0, status: 'draft',
        }])
        .select('id')
        .single()
      if (iErr) throw iErr

      if (facture.lignes.length > 0) {
        await supabase.from('invoice_items').insert(
          facture.lignes.map((l, idx) => ({
            invoice_id: inv.id, description: l.description,
            quantity: l.quantite, unit_price: l.prix_unitaire,
            total: l.quantite * l.prix_unitaire, sort_order: idx,
          }))
        )
      }

      const { data, error } = await supabase.from('invoices').select('*, clients(*), invoice_items(*)').eq('id', inv.id).single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}
