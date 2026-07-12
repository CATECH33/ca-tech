import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Devis, DevisStatus } from '@/types'

const STATUS_FROM_DB: Record<string, DevisStatus> = {
  draft: 'brouillon', sent: 'envoye', viewed: 'envoye',
  accepted: 'accepte', rejected: 'refuse', expired: 'expire',
}
const STATUS_TO_DB: Record<DevisStatus, string> = {
  brouillon: 'draft', envoye: 'sent', accepte: 'accepted',
  refuse: 'rejected', expire: 'expired',
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

function mapRow(row: Record<string, any>): Devis {
  const tva_rate = Number(row.tax_rate ?? row.tva_rate ?? 20)
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    numero: row.devis_number ?? row.quote_number,
    client_id: row.client_id,
    client: row.clients ? mapClient(row.clients) : undefined,
    status: STATUS_FROM_DB[row.status] ?? 'brouillon',
    lignes: (row.devis_items ?? row.quote_items ?? []).map((i: any) => ({
      id: i.id, service_id: i.service_id ?? undefined,
      description: i.description,
      quantite: Number(i.quantity), prix_unitaire: Number(i.unit_price),
      tva: tva_rate, total_ht: Number(i.total),
      total_ttc: Number(i.total) * (1 + tva_rate / 100),
    })),
    sous_total_ht: Number(row.subtotal),
    tva_rate,
    tva_total: Number(row.tax_amount),
    total_ttc: Number(row.total),
    validite_jours: 30,
    date_envoi: row.sent_at ? row.sent_at.split('T')[0] : undefined,
    date_expiration: row.valid_until ?? undefined,
    notes: row.notes ?? undefined,
    signature: row.signature ?? undefined,
  }
}

async function nextDevisNumber() {
  const year = new Date().getFullYear()
  const { data: latest } = await supabase
    .from('devis')
    .select('devis_number')
    .like('devis_number', `DEV-${year}-%`)
    .order('devis_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  const lastNum = latest ? parseInt(latest.devis_number.split('-')[2] ?? '0') : 0
  return `DEV-${year}-${String(lastNum + 1).padStart(4, '0')}`
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

const Q = ['devis'] as const

export function useDevis() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devis')
        .select('*, clients(*), devis_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useUpdateDevisStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DevisStatus }) => {
      const update: Record<string, any> = { status: STATUS_TO_DB[status] }
      if (status === 'envoye') update.sent_at = new Date().toISOString()
      if (status === 'accepte') update.accepted_at = new Date().toISOString()
      const { data, error } = await supabase
        .from('devis')
        .update(update)
        .eq('id', id)
        .select('*, clients(*), devis_items(*)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useCreateDevis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: {
      client_id: string
      notes?: string
      valid_until?: string
      tva_rate?: number
      lignes: Array<{ description: string; quantite: number; prix_unitaire: number }>
    }) => {
      const devis_number = await nextDevisNumber()
      const rate = d.tva_rate ?? 20
      const subtotal = d.lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0)
      const tax_amount = subtotal * (rate / 100)
      const total = subtotal + tax_amount

      const { data: dv, error: qErr } = await supabase
        .from('devis')
        .insert([{
          devis_number, client_id: d.client_id, notes: d.notes || null,
          valid_until: d.valid_until || null, subtotal, tax_amount, total,
          tax_rate: rate, status: 'draft',
          contact_name: '', contact_email: '',
        }])
        .select('id')
        .single()
      if (qErr) throw qErr

      if (d.lignes.length > 0) {
        const { error: iErr } = await supabase.from('devis_items').insert(
          d.lignes.map((l, idx) => ({
            devis_id: dv.id, description: l.description,
            quantity: l.quantite, unit_price: l.prix_unitaire,
            total: l.quantite * l.prix_unitaire, sort_order: idx,
          }))
        )
        if (iErr) throw iErr
      }

      const { data, error } = await supabase.from('devis').select('*, clients(*), devis_items(*)').eq('id', dv.id).single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateDevis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: {
      id: string
      client_id?: string
      notes?: string
      valid_until?: string
      status?: DevisStatus
      tva_rate?: number
      signature?: string
      lignes?: Array<{ description: string; quantite: number; prix_unitaire: number }>
    }) => {
      const updates: Record<string, any> = {}
      if (d.client_id !== undefined) updates.client_id = d.client_id
      if (d.notes !== undefined) updates.notes = d.notes || null
      if (d.valid_until !== undefined) updates.valid_until = d.valid_until || null
      if (d.signature !== undefined) updates.signature = d.signature || null
      if (d.status !== undefined) {
        updates.status = STATUS_TO_DB[d.status]
        if (d.status === 'envoye') updates.sent_at = new Date().toISOString()
        if (d.status === 'accepte') updates.accepted_at = new Date().toISOString()
      }
      if (d.lignes !== undefined) {
        const rate = d.tva_rate ?? 20
        const subtotal = d.lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0)
        updates.subtotal = subtotal
        updates.tax_rate = rate
        updates.tax_amount = subtotal * (rate / 100)
        updates.total = subtotal * (1 + rate / 100)
        await supabase.from('devis_items').delete().eq('devis_id', d.id)
        if (d.lignes.length > 0) {
          await supabase.from('devis_items').insert(
            d.lignes.map((l, idx) => ({
              devis_id: d.id, description: l.description,
              quantity: l.quantite, unit_price: l.prix_unitaire,
              total: l.quantite * l.prix_unitaire, sort_order: idx,
            }))
          )
        }
      } else if (d.tva_rate !== undefined) {
        updates.tax_rate = d.tva_rate
      }
      const { data, error } = await supabase.from('devis').update(updates).eq('id', d.id).select('*, clients(*), devis_items(*)').single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteDevis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('devis').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDuplicateDevis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (devis: Devis) => {
      const devis_number = await nextDevisNumber()
      const { data: dv, error: qErr } = await supabase
        .from('devis')
        .insert([{
          devis_number, client_id: devis.client_id,
          notes: devis.notes || null, valid_until: null,
          subtotal: devis.sous_total_ht, tax_amount: devis.tva_total,
          total: devis.total_ttc, tax_rate: devis.tva_rate, status: 'draft',
          contact_name: '', contact_email: '',
        }])
        .select('id')
        .single()
      if (qErr) throw qErr

      if (devis.lignes.length > 0) {
        await supabase.from('devis_items').insert(
          devis.lignes.map((l, idx) => ({
            devis_id: dv.id, description: l.description,
            quantity: l.quantite, unit_price: l.prix_unitaire,
            total: l.quantite * l.prix_unitaire, sort_order: idx,
          }))
        )
      }

      const { data, error } = await supabase.from('devis').select('*, clients(*), devis_items(*)').eq('id', dv.id).single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useConvertDevisToFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (devis: Devis) => {
      const invoice_number = await nextFactureNumber()
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)
      const due_date = dueDate.toISOString().split('T')[0]

      const { data: inv, error: iErr } = await supabase
        .from('invoices')
        .insert([{
          invoice_number, client_id: devis.client_id,
          due_date, notes: devis.notes || null,
          subtotal: devis.sous_total_ht, tax_amount: devis.tva_total,
          total: devis.total_ttc, tva_rate: devis.tva_rate, status: 'draft',
        }])
        .select('id')
        .single()
      if (iErr) throw iErr

      if (devis.lignes.length > 0) {
        await supabase.from('invoice_items').insert(
          devis.lignes.map((l, idx) => ({
            invoice_id: inv.id, description: l.description,
            quantity: l.quantite, unit_price: l.prix_unitaire,
            total: l.quantite * l.prix_unitaire, sort_order: idx,
          }))
        )
      }

      await supabase
        .from('devis')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', devis.id)

      return invoice_number
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: Q })
      qc.invalidateQueries({ queryKey: ['factures'] })
    },
  })
}
