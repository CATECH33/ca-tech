import { useState, useMemo, useEffect } from 'react'
import {
  Plus, X, Trash2, Search, TrendingUp, Calendar, DollarSign, ArrowUpRight,
  CreditCard, Building2, Zap, FileText, Banknote, Receipt, User, StickyNote,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  usePaiements, useCreatePaiement, useDeletePaiement,
  useClientInvoicesForPayment,
} from '@/hooks/usePaiements'
import { useClients } from '@/hooks/useClients'
import type { PaiementMethod } from '@/types'

// ─── Method config ────────────────────────────────────────────────────────────

type MethodConfig = { label: string; badge: string; bar: string; icon: React.ReactNode }

const METHODE: Record<string, MethodConfig> = {
  virement: {
    label: 'Virement',
    badge: 'bg-blue-50 text-blue-700 border border-blue-100',
    bar: 'bg-blue-500',
    icon: <Building2 className="h-3 w-3" />,
  },
  carte: {
    label: 'Carte bancaire',
    badge: 'bg-violet-50 text-violet-700 border border-violet-100',
    bar: 'bg-violet-500',
    icon: <CreditCard className="h-3 w-3" />,
  },
  stripe: {
    label: 'Stripe',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    bar: 'bg-indigo-500',
    icon: <Zap className="h-3 w-3" />,
  },
  cheque: {
    label: 'Chèque',
    badge: 'bg-amber-50 text-amber-700 border border-amber-100',
    bar: 'bg-amber-500',
    icon: <FileText className="h-3 w-3" />,
  },
  especes: {
    label: 'Espèces',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    bar: 'bg-emerald-500',
    icon: <Banknote className="h-3 w-3" />,
  },
}

const ALL_METHODS = Object.keys(METHODE) as PaiementMethod[]

const METHOD_OPTIONS = ALL_METHODS.map(m => ({ value: m, label: METHODE[m].label }))

function MethodBadge({ methode }: { methode: string }) {
  const cfg = METHODE[methode]
  if (!cfg) return <span className="text-xs text-gray-400">—</span>
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', cfg.badge)}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ─── Period ───────────────────────────────────────────────────────────────────

type Period = 'month' | 'quarter' | 'year' | 'all'
const PERIOD_LABELS: Record<Period, string> = {
  month: 'Ce mois', quarter: 'Ce trimestre', year: 'Cette année', all: 'Tout',
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const FORM_INIT = {
  client_id: '',
  invoice_id: '',
  montant: '',
  methode: 'virement' as PaiementMethod,
  reference: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Paiements() {
  const [period, setPeriod]             = useState<Period>('all')
  const [filterMethod, setFilterMethod] = useState<PaiementMethod | 'all'>('all')
  const [search, setSearch]             = useState('')
  const [showCreate, setShowCreate]     = useState(false)
  const [panelId, setPanelId]           = useState<string | null>(null)
  const [confirmDel, setConfirmDel]     = useState(false)
  const [form, setForm]                 = useState(FORM_INIT)

  const { data: paiements = [], isLoading } = usePaiements()
  const { data: clients = [] }              = useClients()
  const createPaiement  = useCreatePaiement()
  const deletePaiement  = useDeletePaiement()
  const { data: clientInvoices = [] }       = useClientInvoicesForPayment(form.client_id || null)

  const panelP = panelId ? paiements.find(p => p.id === panelId) ?? null : null

  // Pre-fill montant when an invoice is selected
  useEffect(() => {
    if (!form.invoice_id || clientInvoices.length === 0) return
    const inv = clientInvoices.find(i => i.id === form.invoice_id)
    if (inv && inv.remaining > 0) {
      setForm(f => ({ ...f, montant: inv.remaining.toFixed(2) }))
    }
  }, [form.invoice_id, clientInvoices])

  // ── Stats ───────────────────────────────────────────────────────────────────
  const now = new Date()
  const startOf: Record<Period, Date | null> = {
    month:   new Date(now.getFullYear(), now.getMonth(), 1),
    quarter: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
    year:    new Date(now.getFullYear(), 0, 1),
    all:     null,
  }

  const sum = (arr: typeof paiements) => arr.reduce((s, p) => s + p.montant, 0)
  const inPeriod = (cutoff: Date | null) =>
    paiements.filter(p => !cutoff || new Date(p.date_paiement) >= cutoff)

  const totalAll     = sum(paiements)
  const totalMonth   = sum(inPeriod(startOf.month))
  const totalQuarter = sum(inPeriod(startOf.quarter))
  const totalYear    = sum(inPeriod(startOf.year))
  const countMonth   = inPeriod(startOf.month).length
  const countQuarter = inPeriod(startOf.quarter).length
  const countYear    = inPeriod(startOf.year).length

  // ── Chart — 12 derniers mois ──────────────────────────────────────────────
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {}
    paiements.forEach(p => {
      const key = p.date_paiement.substring(0, 7)
      grouped[key] = (grouped[key] ?? 0) + p.montant
    })
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const raw = d.toLocaleDateString('fr-FR', { month: 'short' })
      return { mois: raw.charAt(0).toUpperCase() + raw.slice(1, 3), total: grouped[key] ?? 0 }
    })
  }, [paiements])

  // ── Method breakdown ──────────────────────────────────────────────────────
  const methodStats = useMemo(() =>
    ALL_METHODS.map(m => ({
      methode: m,
      total: sum(paiements.filter(p => p.methode === m)),
      count: paiements.filter(p => p.methode === m).length,
    })).filter(m => m.count > 0).sort((a, b) => b.total - a.total),
  [paiements])
  const methodMax = Math.max(1, ...methodStats.map(m => m.total))

  // ── Top clients ───────────────────────────────────────────────────────────
  const topClients = useMemo(() => {
    const agg: Record<string, { client: typeof paiements[0]['client']; total: number; count: number }> = {}
    paiements.forEach(p => {
      if (!agg[p.client_id]) agg[p.client_id] = { client: p.client, total: 0, count: 0 }
      agg[p.client_id].total += p.montant
      agg[p.client_id].count += 1
    })
    return Object.values(agg).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [paiements])
  const topMax = Math.max(1, ...topClients.map(c => c.total))

  // ── Filtered list ─────────────────────────────────────────────────────────
  const cutoff   = startOf[period]
  const filtered = paiements.filter(p => {
    if (cutoff && new Date(p.date_paiement) < cutoff) return false
    if (filterMethod !== 'all' && p.methode !== filterMethod) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${p.client?.prenom ?? ''} ${p.client?.nom ?? ''} ${p.reference ?? ''} ${p.facture_numero ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  const filteredTotal = sum(filtered)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => { setForm(FORM_INIT); setShowCreate(true) }

  const handleCreate = async () => {
    if (!form.client_id || !form.montant || !form.date) return
    await createPaiement.mutateAsync({
      client_id: form.client_id,
      invoice_id: form.invoice_id || undefined,
      montant: Number(form.montant),
      methode: form.methode,
      reference: form.reference || undefined,
      date_paiement: form.date,
      notes: form.notes || undefined,
    })
    setShowCreate(false)
    setForm(FORM_INIT)
  }

  const handleDelete = async () => {
    if (!panelP) return
    await deletePaiement.mutateAsync({
      id: panelP.id,
      invoice_id: panelP.facture_id || undefined,
    })
    setPanelId(null)
    setConfirmDel(false)
  }

  const clientOptions = useMemo(() =>
    clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}` })),
  [clients])

  const invoiceOptions = useMemo(() =>
    clientInvoices.map(i => ({
      value: i.id,
      label: `${i.numero} · ${formatCurrency(i.remaining)} restant / ${formatCurrency(i.total)}`,
    })),
  [clientInvoices])

  return (
    <Layout
      title="Paiements"
      actions={
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />Enregistrer un paiement
        </Button>
      }
    >

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Total encaissé</p>
            <DollarSign className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAll)}</p>
          <p className="text-xs text-gray-400 mt-1">{paiements.length} paiement{paiements.length > 1 ? 's' : ''}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Ce mois</p>
            <Calendar className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(totalMonth)}</p>
          <p className="text-xs text-gray-400 mt-1">{countMonth} paiement{countMonth > 1 ? 's' : ''}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Ce trimestre</p>
            <TrendingUp className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalQuarter)}</p>
          <p className="text-xs text-gray-400 mt-1">{countQuarter} paiement{countQuarter > 1 ? 's' : ''}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Cette année</p>
            <ArrowUpRight className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalYear)}</p>
          <p className="text-xs text-gray-400 mt-1">{countYear} paiement{countYear > 1 ? 's' : ''}</p>
        </Card>
      </div>

      {/* ── Chart + side cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Encaissements mensuels</p>
            <p className="text-xs text-gray-400 mt-0.5">12 derniers mois</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={20}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0066FF" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3385FF" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Encaissé']}
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                cursor={{ fill: '#f8fafc', radius: 4 }}
              />
              <Bar dataKey="total" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Par méthode</p>
            {methodStats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun paiement</p>
            ) : (
              <div className="space-y-3.5">
                {methodStats.map(m => {
                  const cfg = METHODE[m.methode]
                  const pct = Math.round((m.total / methodMax) * 100)
                  return (
                    <div key={m.methode}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{cfg?.label ?? m.methode}</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(m.total)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', cfg?.bar ?? 'bg-brand-500')} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {m.count} paiement{m.count > 1 ? 's' : ''} · {Math.round((m.total / Math.max(1, totalAll)) * 100)}%
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Meilleurs clients</p>
            {topClients.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun paiement</p>
            ) : (
              <div className="space-y-3">
                {topClients.map((c, i) => {
                  const pct = Math.round((c.total / topMax) * 100)
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar nom={c.client?.nom} prenom={c.client?.prenom} size="sm" />
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-gray-800 truncate">{c.client?.prenom} {c.client?.nom}</p>
                          <span className="text-xs font-semibold text-gray-800 shrink-0">{formatCurrency(c.total)}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-8">
                        <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition',
                period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setFilterMethod('all')}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg border transition',
              filterMethod === 'all'
                ? 'bg-gray-800 border-gray-800 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
            )}
          >
            Toutes
          </button>
          {ALL_METHODS.map(m => (
            <button
              key={m}
              onClick={() => setFilterMethod(f => f === m ? 'all' : m)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg border transition',
                filterMethod === m
                  ? 'bg-gray-800 border-gray-800 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
              )}
            >
              {METHODE[m].label}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <Input
            placeholder="Client, facture, référence…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leading={<Search className="h-3.5 w-3.5" />}
            className="w-64"
          />
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Card padding={false}>
        <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-800">{filtered.length}</span>
            {' '}paiement{filtered.length > 1 ? 's' : ''}
          </p>
          {filtered.length > 0 && (
            <p className="text-xs font-semibold text-emerald-600">{formatCurrency(filteredTotal)}</p>
          )}
        </div>

        <Table>
          <Thead>
            <Tr>
              <Th>Client</Th>
              <Th>Facture</Th>
              <Th>Montant</Th>
              <Th>Méthode</Th>
              <Th>Référence</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <EmptyRow cols={6} message="Chargement…" />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={6} />
            ) : filtered.map(p => (
              <Tr
                key={p.id}
                onClick={() => { setPanelId(p.id); setConfirmDel(false) }}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar nom={p.client?.nom} prenom={p.client?.prenom} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.client?.prenom} {p.client?.nom}</p>
                      {p.client?.entreprise && <p className="text-xs text-gray-400">{p.client.entreprise}</p>}
                    </div>
                  </div>
                </Td>
                <Td>
                  {p.facture_numero ? (
                    <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {p.facture_numero}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </Td>
                <Td>
                  <span className="font-bold text-emerald-600 text-sm">{formatCurrency(p.montant)}</span>
                </Td>
                <Td><MethodBadge methode={p.methode} /></Td>
                <Td>
                  <span className="font-mono text-xs text-gray-500">{p.reference ?? p.stripe_payment_id ?? '—'}</span>
                </Td>
                <Td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(p.date_paiement)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* ── Detail panel ─────────────────────────────────────────────────── */}
      {panelId && panelP && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/10 backdrop-blur-[2px]"
            onClick={() => { setPanelId(null); setConfirmDel(false) }}
          />
          <div className="fixed inset-y-0 right-0 w-[480px] z-30 bg-white shadow-2xl flex flex-col border-l border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Paiement</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(panelP.montant)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MethodBadge methode={panelP.methode} />
                <button
                  onClick={() => { setPanelId(null); setConfirmDel(false) }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Client */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</p>
                </div>
                {panelP.client ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Avatar nom={panelP.client.nom} prenom={panelP.client.prenom} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{panelP.client.prenom} {panelP.client.nom}</p>
                      {panelP.client.entreprise && <p className="text-xs text-gray-500">{panelP.client.entreprise}</p>}
                      <p className="text-xs text-gray-400">{panelP.client.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Client non trouvé</p>
                )}
              </div>

              {/* Facture */}
              {panelP.facture_numero && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Facture liée</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                        {panelP.facture_numero}
                      </span>
                      {panelP.facture_total !== undefined && (
                        <span className="text-xs text-gray-500">Total {formatCurrency(panelP.facture_total)}</span>
                      )}
                    </div>
                    {panelP.facture_total !== undefined && panelP.facture_paid !== undefined && (
                      <>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Encaissé</span>
                          <span className="font-medium text-emerald-600">{formatCurrency(panelP.facture_paid)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.round((panelP.facture_paid / panelP.facture_total) * 100))}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {Math.min(100, Math.round((panelP.facture_paid / panelP.facture_total) * 100))}% réglé
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Détails */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Détails</p>
                <dl className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Date</dt>
                    <dd className="font-medium text-gray-800">{formatDate(panelP.date_paiement)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Méthode</dt>
                    <dd><MethodBadge methode={panelP.methode} /></dd>
                  </div>
                  {(panelP.reference || panelP.stripe_payment_id) && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Référence</dt>
                      <dd className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {panelP.reference ?? panelP.stripe_payment_id}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Enregistré le</dt>
                    <dd className="text-gray-500 text-xs">{formatDate(panelP.created_at)}</dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              {panelP.notes && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <StickyNote className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</p>
                  </div>
                  <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed">
                    {panelP.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer — delete */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              {confirmDel ? (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs text-red-700 flex-1">Supprimer ce paiement ? L'encaissement de la facture sera recalculé.</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDel(false)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deletePaiement.isPending}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletePaiement.isPending ? 'Suppression…' : 'Confirmer'}
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDel(true)}
                  className="w-full justify-center"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer ce paiement
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Create modal ─────────────────────────────────────────────────── */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Enregistrer un paiement"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button
              onClick={handleCreate}
              disabled={createPaiement.isPending || !form.client_id || !form.montant || !form.date}
            >
              {createPaiement.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Client */}
          <Select
            label="Client *"
            placeholder="Sélectionner un client…"
            value={form.client_id}
            onChange={e => setForm(f => ({ ...f, client_id: e.target.value, invoice_id: '', montant: '' }))}
            options={clientOptions}
          />

          {/* Facture (seulement si client sélectionné) */}
          {form.client_id && (
            <Select
              label="Facture liée"
              placeholder={clientInvoices.length === 0 ? 'Aucune facture en attente' : 'Aucune (paiement libre)'}
              value={form.invoice_id}
              onChange={e => setForm(f => ({ ...f, invoice_id: e.target.value }))}
              options={invoiceOptions}
            />
          )}

          {/* Montant + Méthode */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Montant (€) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.montant}
              onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
            />
            <Select
              label="Méthode *"
              value={form.methode}
              onChange={e => setForm(f => ({ ...f, methode: e.target.value as PaiementMethod }))}
              options={METHOD_OPTIONS}
            />
          </div>

          {/* Référence + Date */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Référence"
              placeholder="VIR-2024-001"
              value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
            />
            <Input
              label="Date *"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Informations complémentaires…"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
          />
        </div>
      </Modal>
    </Layout>
  )
}
