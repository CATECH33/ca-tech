import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Client, Status } from '@/types'

const PROJ_STATUS: Record<string, string> = {
  draft: 'planifie', pending: 'planifie', in_progress: 'en_cours',
  review: 'en_cours', completed: 'termine', cancelled: 'annule', on_hold: 'en_pause',
}
const DEVIS_STATUS: Record<string, string> = {
  draft: 'brouillon', sent: 'envoye', accepted: 'accepte', rejected: 'refuse', expired: 'expire',
}
const FACTURE_STATUS: Record<string, string> = {
  draft: 'brouillon', sent: 'envoyee', paid: 'payee', overdue: 'en_retard', cancelled: 'annulee',
}
const TICKET_STATUS: Record<string, string> = {
  open: 'ouvert', in_progress: 'en_cours', waiting: 'en_cours', resolved: 'resolu', closed: 'ferme',
}
const TICKET_PRIORITY: Record<string, string> = {
  low: 'basse', medium: 'normale', high: 'haute', urgent: 'critique',
}

function mapRow(row: Record<string, any>): Client {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    nom: row.last_name,
    prenom: row.first_name,
    email: row.email,
    telephone: row.phone ?? undefined,
    entreprise: row.company ?? undefined,
    secteur: row.industry ?? undefined,
    adresse: row.address ?? undefined,
    ville: row.city ?? undefined,
    code_postal: row.postal_code ?? undefined,
    pays: row.country ?? 'France',
    status: row.status === 'active' ? 'actif' : row.status === 'inactive' ? 'inactif' : 'archive',
    notes: row.notes ?? undefined,
    total_ca: (row.invoices ?? [])
      .filter((i: any) => i.status === 'paid')
      .reduce((s: number, i: any) => s + Number(i.total), 0),
  }
}

const Q = ['clients'] as const

export function useClients() {
  return useQuery({
    queryKey: Q,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*, invoices(total, status)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (c: {
      prenom: string; nom: string; email: string; telephone?: string
      entreprise?: string; secteur?: string; adresse?: string
      code_postal?: string; ville?: string
    }) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          first_name: c.prenom, last_name: c.nom, email: c.email,
          phone: c.telephone || null, company: c.entreprise || null,
          industry: c.secteur || null, address: c.adresse || null,
          postal_code: c.code_postal || null, city: c.ville || null,
          country: 'France', status: 'active',
        }])
        .select('*, invoices(total, status)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...c }: {
      id: string; prenom?: string; nom?: string; email?: string
      telephone?: string; entreprise?: string; secteur?: string
      adresse?: string; code_postal?: string; ville?: string
      status?: Status; notes?: string
    }) => {
      const update: Record<string, any> = {}
      if (c.prenom !== undefined) update.first_name = c.prenom
      if (c.nom !== undefined) update.last_name = c.nom
      if (c.email !== undefined) update.email = c.email
      if (c.telephone !== undefined) update.phone = c.telephone || null
      if (c.entreprise !== undefined) update.company = c.entreprise || null
      if (c.secteur !== undefined) update.industry = c.secteur || null
      if (c.adresse !== undefined) update.address = c.adresse || null
      if (c.code_postal !== undefined) update.postal_code = c.code_postal || null
      if (c.ville !== undefined) update.city = c.ville || null
      if (c.status !== undefined) update.status = c.status === 'actif' ? 'active' : c.status === 'inactif' ? 'inactive' : 'archived'
      if (c.notes !== undefined) update.notes = c.notes || null
      const { data, error } = await supabase
        .from('clients')
        .update(update)
        .eq('id', id)
        .select('*, invoices(total, status)')
        .single()
      if (error) throw error
      return mapRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: Q }),
  })
}

// ─── Fiche client — données liées ─────────────────────────────────────────────

export function useClientProjets(clientId: string | null) {
  return useQuery({
    queryKey: ['client-projets', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status, progress, budget, created_at, due_date')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        nom: r.name as string,
        status: PROJ_STATUS[r.status as string] ?? 'planifie',
        progression: Number(r.progress ?? 0),
        budget: Number(r.budget ?? 0),
        created_at: r.created_at as string,
        date_fin_prevue: (r.due_date ?? undefined) as string | undefined,
      }))
    },
  })
}

export function useClientDevis(clientId: string | null) {
  return useQuery({
    queryKey: ['client-devis', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, quote_number, total, status, created_at')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        numero: r.quote_number as string,
        total_ttc: Number(r.total ?? 0),
        status: DEVIS_STATUS[r.status as string] ?? 'brouillon',
        created_at: r.created_at as string,
      }))
    },
  })
}

export function useClientFactures(clientId: string | null) {
  return useQuery({
    queryKey: ['client-factures', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, status, created_at, due_date')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        numero: r.invoice_number as string,
        total_ttc: Number(r.total ?? 0),
        status: FACTURE_STATUS[r.status as string] ?? 'brouillon',
        created_at: r.created_at as string,
        date_echeance: (r.due_date ?? '') as string,
      }))
    },
  })
}

export function useClientPaiements(clientId: string | null) {
  return useQuery({
    queryKey: ['client-paiements', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, method, paid_at, reference, created_at')
        .eq('client_id', clientId!)
        .order('paid_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        montant: Number(r.amount ?? 0),
        methode: (r.method ?? 'virement') as string,
        date_paiement: ((r.paid_at ?? r.created_at ?? '') as string).split('T')[0],
        reference: (r.reference ?? undefined) as string | undefined,
      }))
    },
  })
}

export function useClientTickets(clientId: string | null) {
  return useQuery({
    queryKey: ['client-tickets', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, subject, status, priority, created_at, updated_at')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        ticket_number: (r.ticket_number ?? undefined) as string | undefined,
        sujet: r.subject as string,
        status: TICKET_STATUS[r.status as string] ?? 'ouvert',
        priority: TICKET_PRIORITY[r.priority as string] ?? 'normale',
        created_at: r.created_at as string,
        updated_at: r.updated_at as string,
      }))
    },
  })
}

export function useClientMessages(clientId: string | null) {
  return useQuery({
    queryKey: ['client-messages', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, from_name, from_email, subject, body, source, is_read, is_replied, created_at')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: r.id as string,
        from_name: r.from_name as string,
        from_email: r.from_email as string,
        subject: (r.subject ?? undefined) as string | undefined,
        body: r.body as string,
        source: r.source as string,
        lu: Boolean(r.is_read),
        replied: Boolean(r.is_replied),
        created_at: r.created_at as string,
      }))
    },
  })
}
