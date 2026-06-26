import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, UserPlus, Euro, TrendingUp, FolderKanban, CheckCircle2,
  Receipt, ArrowUpRight, ArrowDownRight, FileText,
  Activity, Circle, ChevronRight, AlertCircle, Clock,
  Plus, CalendarDays, Trophy, Percent, Flame,
  MessageCircle, Headphones, BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
}
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'
import { useDevis } from '@/hooks/useDevis'
import { useFactures } from '@/hooks/useFactures'
import { usePaiements } from '@/hooks/usePaiements'
import { useProjets } from '@/hooks/useProjets'
import { useLeads } from '@/hooks/useLeads'
import { useTaches } from '@/hooks/useTaches'
import { useMessages } from '@/hooks/useMessages'
import { useTickets } from '@/hooks/useTickets'

/* ─── CONSTANTES ─────────────────────────────────────────────────────────── */

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const PROJET_COLORS: Record<string, string> = {
  en_cours: '#0066FF', planifie: '#7C3AED', en_pause: '#D97706',
  termine: '#059669', annule: '#DC2626',
}
const PROJET_LABELS: Record<string, string> = {
  en_cours: 'En cours', planifie: 'Planifié', en_pause: 'En pause',
  termine: 'Terminé', annule: 'Annulé',
}

const LEAD_COLS = [
  { status: 'nouveau',     label: 'Nouveau',      bar: 'bg-blue-500' },
  { status: 'contact',     label: 'Contacté',     bar: 'bg-indigo-500' },
  { status: 'qualifie',    label: 'Qualification', bar: 'bg-violet-500' },
  { status: 'proposition', label: 'Proposition',  bar: 'bg-amber-500' },
  { status: 'negocie',     label: 'Négociation',  bar: 'bg-orange-500' },
  { status: 'gagne',       label: 'Gagné',        bar: 'bg-emerald-500' },
  { status: 'perdu',       label: 'Perdu',        bar: 'bg-red-400' },
]

const ALERTE_COLORS = {
  error:   { bg: 'bg-red-50 border-red-100',       dot: 'bg-red-400',    text: 'text-red-700' },
  warning: { bg: 'bg-amber-50 border-amber-100',   dot: 'bg-amber-400',  text: 'text-amber-700' },
  info:    { bg: 'bg-blue-50 border-blue-100',     dot: 'bg-blue-400',   text: 'text-blue-700' },
  success: { bg: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400', text: 'text-emerald-700' },
}

const ACTIVITY_COLORS: Record<string, { bg: string; dot: string }> = {
  paiement: { bg: 'bg-emerald-100', dot: 'text-emerald-500' },
  facture:  { bg: 'bg-rose-100',    dot: 'text-rose-500' },
  devis:    { bg: 'bg-blue-100',    dot: 'text-blue-500' },
  client:   { bg: 'bg-violet-100',  dot: 'text-violet-500' },
  projet:   { bg: 'bg-amber-100',   dot: 'text-amber-500' },
  lead:     { bg: 'bg-indigo-100',  dot: 'text-indigo-500' },
  tache:    { bg: 'bg-gray-100',    dot: 'text-gray-500' },
}

/* ─── UTILITAIRES ─────────────────────────────────────────────────────────── */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 2)  return "à l'instant"
  if (min < 60) return `il y a ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)  return 'hier'
  if (d < 7)    return `il y a ${d}j`
  return formatDate(dateStr, 'dd MMM')
}

/* ─── COMPOSANTS ─────────────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-elevated px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p: { value: number; name: string; color?: string }, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500">
            {p.name === 'ca' ? 'Encaissé' : p.name === 'pipeline' ? 'Devisé' : String(p.name)} :
          </span>
          <span className="font-semibold text-gray-800 ml-auto pl-3">{formatCurrency(Number(p.value))}</span>
        </div>
      ))}
    </div>
  )
}

interface KpiProps {
  label: string; value: string | number; sub?: string
  change?: number; changeLabel?: string
  icon: React.ReactNode; iconBg: string; iconColor: string
  to?: string; accent?: boolean
}

function KpiCard({ label, value, sub, change, changeLabel, icon, iconBg, iconColor, to, accent }: KpiProps) {
  const up   = change !== undefined && change > 0
  const down = change !== undefined && change < 0
  const inner = (
    <Card className={cn(
      'group hover:shadow-elevated transition-all duration-200',
      accent && 'bg-gradient-to-br from-brand-500 to-brand-600 border-brand-400',
      to && 'cursor-pointer',
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl shrink-0', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        {to && (
          <ChevronRight className={cn('h-4 w-4 opacity-0 group-hover:opacity-100 transition mt-0.5', accent ? 'text-white/60' : 'text-gray-300')} />
        )}
      </div>
      <p className={cn('text-xs font-medium mb-1', accent ? 'text-white/70' : 'text-gray-500')}>{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums leading-none', accent ? 'text-white' : 'text-gray-900')}>{value}</p>
      {sub && <p className={cn('text-[11px] mt-1.5', accent ? 'text-white/50' : 'text-gray-400')}>{sub}</p>}
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-[11px] font-semibold mt-2',
          up ? (accent ? 'text-white/80' : 'text-emerald-600') : down ? (accent ? 'text-white/80' : 'text-red-500') : 'text-gray-400',
        )}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : down ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
          {up && '+'}{change}%
          {changeLabel && <span className={cn('font-normal', accent ? 'text-white/50' : 'text-gray-400')}> {changeLabel}</span>}
        </div>
      )}
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

/* ─── MINI STAT PILL ─────────────────────────────────────────────────────── */

function MiniStat({ icon, label, count, color, to }: {
  icon: React.ReactNode; label: string; count: number; color: string; to: string
}) {
  return (
    <Link to={to} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border transition hover:shadow-sm', color)}>
      <span>{icon}</span>
      <span className="text-xs font-bold">{count}</span>
      <span className="text-[11px] font-medium hidden sm:inline">{label}</span>
    </Link>
  )
}

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */

export function Dashboard() {
  const { data: clients   = [] } = useClients()
  const { data: leads     = [] } = useLeads()
  const { data: devis     = [] } = useDevis()
  const { data: factures  = [] } = useFactures()
  const { data: paiements = [] } = usePaiements()
  const { data: projets   = [] } = useProjets()
  const { data: taches    = [] } = useTaches()
  const { data: messages  = [] } = useMessages()
  const { data: tickets   = [] } = useTickets()

  const now              = new Date()
  const todayStr         = now.toISOString().split('T')[0]
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const in7Days          = new Date(now.getTime() + 7  * 86400000)
  const in14Days         = new Date(now.getTime() + 14 * 86400000)
  const hour             = now.getHours()
  const greeting         = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  /* ── Financial KPIs ───────────────────────────────────────────────────── */
  const caTotal    = paiements.reduce((s, p) => s + p.montant, 0)
  const caThisMo   = paiements.filter(p => new Date(p.date_paiement) >= startOfMonth).reduce((s, p) => s + p.montant, 0)
  const caPrevMo   = paiements.filter(p => { const d = new Date(p.date_paiement); return d >= startOfPrevMonth && d < startOfMonth }).reduce((s, p) => s + p.montant, 0)
  const caChange   = caPrevMo > 0 ? Math.round((caThisMo - caPrevMo) / caPrevMo * 100) : undefined

  const facturesPayees    = factures.filter(f => f.status === 'payee')
  const enAttente         = factures.filter(f => ['envoyee', 'en_retard'].includes(f.status))
  const enRetard          = factures.filter(f => f.status === 'en_retard')
  const totalAttente      = enAttente.reduce((s, f) => s + f.total_ttc, 0)
  const totalRetard       = enRetard.reduce((s, f) => s + f.total_ttc, 0)

  /* ── Operational KPIs ─────────────────────────────────────────────────── */
  const activeLeads       = leads.filter(l => !['gagne', 'perdu'].includes(l.status))
  const closedLeads       = leads.filter(l => l.status === 'gagne' || l.status === 'perdu')
  const winRate           = closedLeads.length > 0 ? Math.round(leads.filter(l => l.status === 'gagne').length / closedLeads.length * 100) : 0
  const projetsEnCours    = projets.filter(p => p.status === 'en_cours')
  const tachesUrgentesAll = taches.filter(t => t.status !== 'termine' && (t.priority === 'urgente' || t.priority === 'haute'))
  const tachesAujourdhui  = taches.filter(t => t.date_echeance === todayStr && t.status !== 'termine')
  const messagesNonLus    = messages.filter(m => !m.lu && !m.is_archived)
  const ticketsOuverts    = tickets.filter(t => t.status === 'ouvert' || t.status === 'en_cours')

  /* ── Monthly chart ────────────────────────────────────────────────────── */
  const caMonthly = useMemo(() =>
    MONTHS.slice(0, now.getMonth() + 1).map((mois, i) => ({
      mois,
      ca: paiements.filter(p => { const d = new Date(p.date_paiement); return d.getFullYear() === now.getFullYear() && d.getMonth() === i }).reduce((s, p) => s + p.montant, 0),
      pipeline: devis.filter(d => { const dt = new Date(d.created_at); return dt.getFullYear() === now.getFullYear() && dt.getMonth() === i && d.status !== 'refuse' }).reduce((s, d) => s + d.total_ttc, 0),
    })),
  [paiements, devis]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Devis stats bar chart ────────────────────────────────────────────── */
  const devisStats = useMemo(() => [
    { name: 'Brouillon', value: devis.filter(d => d.status === 'brouillon').length, fill: '#94a3b8' },
    { name: 'Envoyé',    value: devis.filter(d => d.status === 'envoye').length,    fill: '#3b82f6' },
    { name: 'Accepté',   value: devis.filter(d => d.status === 'accepte').length,   fill: '#10b981' },
    { name: 'Refusé',    value: devis.filter(d => d.status === 'refuse').length,    fill: '#ef4444' },
    { name: 'Expiré',    value: devis.filter(d => d.status === 'expire').length,    fill: '#f59e0b' },
  ], [devis])

  /* ── Projets donut ────────────────────────────────────────────────────── */
  const projetsByStatus = useMemo(() =>
    (['en_cours', 'planifie', 'en_pause', 'termine', 'annule'] as const)
      .map(s => ({ name: PROJET_LABELS[s], value: projets.filter(p => p.status === s).length, color: PROJET_COLORS[s] }))
      .filter(d => d.value > 0),
  [projets])

  /* ── Top clients ──────────────────────────────────────────────────────── */
  const topClients = useMemo(() =>
    [...clients].sort((a, b) => b.total_ca - a.total_ca).filter(c => c.total_ca > 0).slice(0, 5),
  [clients])

  /* ── Projets actifs triés par échéance ────────────────────────────────── */
  const projetsActifs = useMemo(() =>
    [...projetsEnCours]
      .sort((a, b) => {
        if (!a.date_fin_prevue) return 1
        if (!b.date_fin_prevue) return -1
        return new Date(a.date_fin_prevue).getTime() - new Date(b.date_fin_prevue).getTime()
      })
      .slice(0, 6),
  [projetsEnCours])

  /* ── Alertes ──────────────────────────────────────────────────────────── */
  type AlerteType = 'error' | 'warning' | 'info' | 'success'
  const alertes: { id: string; type: AlerteType; titre: string; desc: string; lien: string }[] = [
    ...enRetard.slice(0, 3).map(f => ({
      id: `retard-${f.id}`, type: 'error' as const,
      titre: `Facture ${f.numero} en retard`,
      desc: `${f.client?.entreprise ?? `${f.client?.prenom} ${f.client?.nom}`} · ${formatCurrency(f.total_ttc)}`,
      lien: '/factures',
    })),
    ...devis.filter(d => d.status === 'envoye' && d.date_expiration && new Date(d.date_expiration) <= in7Days).slice(0, 2).map(d => ({
      id: `exp-${d.id}`, type: 'warning' as const,
      titre: `Devis ${d.numero} expire bientôt`,
      desc: `${d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`} · ${formatDate(d.date_expiration)}`,
      lien: '/devis',
    })),
    ...leads.filter(l => l.status === 'nouveau').slice(0, 2).map(l => ({
      id: `lead-${l.id}`, type: 'info' as const,
      titre: 'Nouveau lead à traiter',
      desc: `${l.prenom} ${l.nom}${l.entreprise ? ` · ${l.entreprise}` : ''}`,
      lien: '/leads',
    })),
    ...messagesNonLus.slice(0, 1).map(m => ({
      id: `msg-${m.id}`, type: 'info' as const,
      titre: 'Message non lu',
      desc: `${m.from_name}${m.subject ? ` · ${m.subject}` : ''}`,
      lien: '/messages',
    })),
    ...devis.filter(d => d.status === 'accepte').slice(0, 1).map(d => ({
      id: `acc-${d.id}`, type: 'success' as const,
      titre: `Devis ${d.numero} accepté`,
      desc: `${d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`} · ${formatCurrency(d.total_ttc)}`,
      lien: '/devis',
    })),
  ].slice(0, 6)

  const nbAlertes = alertes.filter(a => a.type === 'error' || a.type === 'warning').length

  /* ── Tâches urgentes list ─────────────────────────────────────────────── */
  const tachesUrgentesTop = tachesUrgentesAll
    .sort((a, b) => { const p: Record<string, number> = { urgente: 0, haute: 1, normale: 2, basse: 3 }; return p[a.priority] - p[b.priority] })
    .slice(0, 5)

  /* ── Échéances 14j ────────────────────────────────────────────────────── */
  type EcheanceType = 'projet' | 'facture'
  const echeances: { id: string; type: EcheanceType; label: string; date: string; overdue: boolean; lien: string }[] = [
    ...projets.filter(p => !['termine', 'annule'].includes(p.status) && !!p.date_fin_prevue && new Date(p.date_fin_prevue!) <= in14Days)
      .map(p => ({ id: `p-${p.id}`, type: 'projet' as const, label: p.nom, date: p.date_fin_prevue!, overdue: new Date(p.date_fin_prevue!) < now, lien: '/projets' })),
    ...factures.filter(f => ['envoyee', 'en_retard'].includes(f.status) && f.date_echeance && new Date(f.date_echeance) <= in14Days)
      .map(f => ({ id: `f-${f.id}`, type: 'facture' as const, label: `${f.numero} · ${formatCurrency(f.total_ttc)}`, date: f.date_echeance, overdue: f.status === 'en_retard', lien: '/factures' })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 6)

  /* ── Activity feed ────────────────────────────────────────────────────── */
  const activities = useMemo(() => [
    ...paiements.slice(0, 3).map(p => ({ id: `p-${p.id}`, type: 'paiement', action: 'Paiement encaissé', detail: `${p.client?.prenom ?? ''} ${p.client?.nom ?? ''} · ${formatCurrency(p.montant)}`, time: p.date_paiement })),
    ...factures.slice(0, 3).map(f => ({ id: `f-${f.id}`, type: 'facture', action: 'Facture émise', detail: `${f.numero} · ${f.client?.entreprise ?? `${f.client?.prenom} ${f.client?.nom}`}`, time: f.date_emission })),
    ...devis.slice(0, 3).map(d => ({ id: `d-${d.id}`, type: 'devis', action: 'Devis créé', detail: `${d.numero} · ${d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`}`, time: d.created_at })),
    ...clients.slice(0, 2).map(c => ({ id: `c-${c.id}`, type: 'client', action: 'Nouveau client', detail: `${c.prenom} ${c.nom}${c.entreprise ? ` · ${c.entreprise}` : ''}`, time: c.created_at })),
    ...leads.slice(0, 2).map(l => ({ id: `l-${l.id}`, type: 'lead', action: 'Nouveau lead', detail: `${l.prenom} ${l.nom}${l.entreprise ? ` · ${l.entreprise}` : ''}`, time: l.created_at })),
    ...projets.slice(0, 2).map(p => ({ id: `pr-${p.id}`, type: 'projet', action: 'Projet créé', detail: p.nom, time: p.created_at })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10),
  [paiements, factures, devis, clients, leads, projets])

  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Layout
      title="Tableau de bord"
      actions={
        <div className="flex items-center gap-2">
          <Link to="/clients"><Button size="sm" variant="outline"><Plus className="h-3 w-3" />Client</Button></Link>
          <Link to="/devis"><Button size="sm" variant="outline"><Plus className="h-3 w-3" />Devis</Button></Link>
          <Link to="/factures"><Button size="sm" variant="outline"><Plus className="h-3 w-3" />Facture</Button></Link>
          <Link to="/leads"><Button size="sm"><Plus className="h-3 w-3" />Lead</Button></Link>
        </div>
      }
    >

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-gray-400 capitalize mb-0.5">{dateStr}</p>
          <h2 className="text-lg font-bold text-gray-900">
            {greeting} &mdash;&nbsp;
            <span className="text-brand-600">{formatCurrency(caThisMo)}</span>
            <span className="text-sm font-normal text-gray-400 ml-1">encaissé ce mois</span>
          </h2>
          {caChange !== undefined && (
            <p className={cn('text-xs font-semibold mt-0.5', caChange >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {caChange >= 0 ? '↑' : '↓'} {Math.abs(caChange)}% vs mois précédent
            </p>
          )}
        </div>

        {/* Ops mini-stats */}
        <div className="flex flex-wrap gap-2">
          <MiniStat to="/taches" icon={<Flame className="h-3.5 w-3.5" />} label="urgentes" count={tachesUrgentesAll.length}
            color={tachesUrgentesAll.length > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-500'} />
          <MiniStat to="/taches" icon={<CalendarDays className="h-3.5 w-3.5" />} label="aujourd'hui" count={tachesAujourdhui.length}
            color={tachesAujourdhui.length > 0 ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-500'} />
          <MiniStat to="/messages" icon={<MessageCircle className="h-3.5 w-3.5" />} label="non lus" count={messagesNonLus.length}
            color={messagesNonLus.length > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'} />
          <MiniStat to="/support" icon={<Headphones className="h-3.5 w-3.5" />} label="tickets" count={ticketsOuverts.length}
            color={ticketsOuverts.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500'} />
          {nbAlertes > 0 && (
            <Link to="/factures" className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-red-50 border-red-200 text-red-700 transition hover:shadow-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{nbAlertes}</span>
              <span className="text-[11px] font-medium hidden sm:inline">alerte{nbAlertes > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI ROW 1 — Financier ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard label="CA ce mois" value={formatCurrency(caThisMo)} sub={`Total : ${formatCurrency(caTotal)}`}
          change={caChange} changeLabel="vs mois préc."
          icon={<Euro className="h-5 w-5" />} iconBg="bg-brand-500" iconColor="text-white" accent to="/paiements" />
        <KpiCard label="Factures payées" value={formatCurrency(facturesPayees.reduce((s, f) => s + f.total_ttc, 0))} sub={`${facturesPayees.length} factures`}
          icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-emerald-50" iconColor="text-emerald-500" to="/factures" />
        <KpiCard label="En attente" value={formatCurrency(totalAttente)} sub={`${enAttente.length} facture${enAttente.length !== 1 ? 's' : ''}`}
          icon={<Receipt className="h-5 w-5" />} iconBg="bg-amber-50" iconColor="text-amber-500" to="/factures" />
        <KpiCard label="En retard" value={formatCurrency(totalRetard)} sub={`${enRetard.length} facture${enRetard.length !== 1 ? 's' : ''}`}
          icon={<AlertCircle className="h-5 w-5" />} iconBg="bg-red-50" iconColor="text-red-500" to="/factures" />
      </div>

      {/* ── KPI ROW 2 — Activité ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Clients actifs" value={clients.filter(c => c.status === 'actif').length} sub={`${clients.length} au total`}
          icon={<Users className="h-5 w-5" />} iconBg="bg-blue-50" iconColor="text-blue-500" to="/clients" />
        <KpiCard label="Leads actifs" value={activeLeads.length} sub={`${leads.length} au total`}
          icon={<UserPlus className="h-5 w-5" />} iconBg="bg-indigo-50" iconColor="text-indigo-500" to="/leads" />
        <KpiCard label="Projets en cours" value={projetsEnCours.length} sub={`${projets.length} au total`}
          icon={<FolderKanban className="h-5 w-5" />} iconBg="bg-orange-50" iconColor="text-orange-500" to="/projets" />
        <KpiCard label="Taux de conversion" value={`${winRate}%`} sub={`${leads.filter(l => l.status === 'gagne').length} leads gagnés`}
          icon={<Percent className="h-5 w-5" />} iconBg="bg-teal-50" iconColor="text-teal-500" to="/leads" />
      </div>

      {/* ── CHARTS ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* Area chart CA */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Encaissements {now.getFullYear()}</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">CA encaissé vs devis créés par mois</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" />Encaissé</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400" />Devisé</span>
            </div>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={caMonthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0066FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPipe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : '0'} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="pipeline" name="pipeline" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4 2"
                fill="url(#gradPipe)" dot={false} activeDot={{ r: 3, fill: '#7C3AED', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="ca" name="ca" stroke="#0066FF" strokeWidth={2.5}
                fill="url(#gradCA)" dot={false} activeDot={{ r: 4, fill: '#0066FF', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Projets donut */}
        <Card>
          <CardHeader>
            <CardTitle>Projets par statut</CardTitle>
            <Link to="/projets" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          {projets.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">Aucun projet</div>
          ) : (
            <>
              <div className="relative mb-3">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={projetsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                      paddingAngle={2} dataKey="value" labelLine={false}>
                      {projetsByStatus.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{projets.length}</p>
                    <p className="text-[10px] text-gray-400">projets</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {projetsByStatus.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-gray-600 flex-1 truncate">{s.name}</span>
                    <span className="text-xs font-semibold text-gray-800">{s.value}</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(s.value / projets.length * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── DEVIS BAR CHART + ALERTES + ÉCHEANCES ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Devis par statut */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <CardTitle>Devis par statut</CardTitle>
            </div>
            <Link to="/devis" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          {devis.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">Aucun devis</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={devisStats} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [v, 'devis']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {devisStats.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
            <span className="text-gray-500">{devis.length} devis au total</span>
            <span className="font-semibold text-emerald-600">
              {devis.length > 0 ? Math.round(devis.filter(d => d.status === 'accepte').length / devis.length * 100) : 0}% d'acceptation
            </span>
          </div>
        </Card>

        {/* Alertes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Alertes</CardTitle>
              {nbAlertes > 0 && (
                <span className="h-5 w-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{nbAlertes}</span>
              )}
            </div>
          </CardHeader>
          {alertes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-xs text-gray-400">Tout est en ordre</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertes.map(a => {
                const c = ALERTE_COLORS[a.type]
                return (
                  <Link key={a.id} to={a.lien}
                    className={cn('flex items-start gap-2.5 p-2.5 rounded-xl border transition hover:shadow-sm', c.bg)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0 mt-1.5', c.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold truncate', c.text)}>{a.titre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{a.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        {/* Échéances 14j */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <CardTitle>Échéances (14j)</CardTitle>
            </div>
          </CardHeader>
          {echeances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CalendarDays className="h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">Aucune échéance proche</p>
            </div>
          ) : (
            <div className="space-y-2">
              {echeances.map(e => {
                const daysLeft = Math.ceil((new Date(e.date).getTime() - now.getTime()) / 86400000)
                return (
                  <Link key={e.id} to={e.lien} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition">
                    <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center shrink-0', e.overdue ? 'bg-red-50' : 'bg-amber-50')}>
                      {e.type === 'projet'
                        ? <FolderKanban className={cn('h-3 w-3', e.overdue ? 'text-red-500' : 'text-amber-500')} />
                        : <Receipt       className={cn('h-3 w-3', e.overdue ? 'text-red-500' : 'text-amber-500')} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{e.label}</p>
                      <p className={cn('text-[10px]', e.overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
                        {e.overdue ? `En retard de ${Math.abs(daysLeft)}j` : daysLeft === 0 ? "Aujourd'hui" : `Dans ${daysLeft}j · ${formatDate(e.date)}`}
                      </p>
                    </div>
                    {e.overdue && <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />}
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── TÂCHES URGENTES + PROJETS EN COURS ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Tâches urgentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              <CardTitle>Tâches urgentes & hautes</CardTitle>
            </div>
            <Link to="/taches" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          {tachesUrgentesTop.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-xs text-gray-400">Aucune tâche urgente</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {tachesUrgentesTop.map(t => (
                <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition">
                  <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center shrink-0', t.priority === 'urgente' ? 'bg-red-50' : 'bg-amber-50')}>
                    <AlertCircle className={cn('h-3 w-3', t.priority === 'urgente' ? 'text-red-500' : 'text-amber-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{t.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.projet && <span className="text-[10px] text-gray-400 truncate">{t.projet.nom}</span>}
                      {t.date_echeance && (
                        <span className={cn('text-[10px] flex items-center gap-0.5 shrink-0', new Date(t.date_echeance) < now ? 'text-red-500 font-semibold' : 'text-gray-400')}>
                          <Clock className="h-2.5 w-2.5" />{formatDate(t.date_echeance)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge status={t.priority} className="text-[10px] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Projets en cours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-gray-400" />
              <CardTitle>Projets en cours</CardTitle>
            </div>
            <Link to="/projets" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          {projetsActifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <FolderKanban className="h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">Aucun projet en cours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projetsActifs.map(p => {
                const overdue = p.date_fin_prevue && new Date(p.date_fin_prevue) < now
                return (
                  <Link key={p.id} to="/projets" className="block hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition">
                    <div className="flex items-center gap-2 mb-1.5">
                      {p.couleur && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.couleur }} />}
                      <p className="text-xs font-semibold text-gray-800 flex-1 truncate">{p.nom}</p>
                      <span className="text-xs font-bold tabular-nums text-gray-700">{p.progression}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p.progression}%`, backgroundColor: p.couleur ?? '#0066FF' }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 truncate">{p.client?.entreprise ?? `${p.client?.prenom ?? ''} ${p.client?.nom ?? ''}`}</span>
                      {p.date_fin_prevue && (
                        <span className={cn('text-[10px] flex items-center gap-0.5 shrink-0', overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
                          <Clock className="h-2.5 w-2.5" />{formatDate(p.date_fin_prevue)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── DERNIÈRES LISTES ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top clients</CardTitle>
            <Link to="/clients" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-0.5">
            {topClients.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Aucune donnée</p>
            ) : topClients.map((c, i) => (
              <Link key={c.id} to="/clients" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition -mx-2">
                <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0 text-center">{i + 1}</span>
                <Avatar nom={c.nom} prenom={c.prenom} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{c.prenom} {c.nom}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.entreprise || 'Particulier'}</p>
                </div>
                <p className="text-xs font-bold text-gray-700 shrink-0">{formatCurrency(c.total_ca)}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Derniers devis */}
        <Card>
          <CardHeader>
            <CardTitle>Derniers devis</CardTitle>
            <Link to="/devis" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-0.5">
            {devis.slice(0, 5).length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Aucun devis</p>
            ) : devis.slice(0, 5).map(d => (
              <Link key={d.id} to="/devis" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition -mx-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 font-mono">{d.numero}</p>
                  <p className="text-[10px] text-gray-400 truncate">{d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-700">{formatCurrency(d.total_ttc)}</p>
                  <Badge status={d.status} className="text-[9px] px-1.5 py-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Dernières factures */}
        <Card>
          <CardHeader>
            <CardTitle>Dernières factures</CardTitle>
            <Link to="/factures" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-0.5">
            {factures.slice(0, 5).length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Aucune facture</p>
            ) : factures.slice(0, 5).map(f => (
              <Link key={f.id} to="/factures" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition -mx-2">
                <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                  f.status === 'payee' ? 'bg-emerald-50' : f.status === 'en_retard' ? 'bg-red-50' : 'bg-amber-50')}>
                  <Receipt className={cn('h-3.5 w-3.5',
                    f.status === 'payee' ? 'text-emerald-500' : f.status === 'en_retard' ? 'text-red-500' : 'text-amber-500')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 font-mono">{f.numero}</p>
                  <p className="text-[10px] text-gray-400 truncate">{f.client?.entreprise ?? `${f.client?.prenom} ${f.client?.nom}`}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-700">{formatCurrency(f.total_ttc)}</p>
                  <Badge status={f.status} className="text-[9px] px-1.5 py-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ── PIPELINE + ACTIVITÉ ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pipeline leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gray-400" />
              <CardTitle>Pipeline commercial</CardTitle>
            </div>
            <Link to="/leads" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-2.5">
            {LEAD_COLS.map(col => {
              const count = leads.filter(l => l.status === col.status).length
              const value = leads.filter(l => l.status === col.status).reduce((s, l) => s + (l.budget_estime ?? 0), 0)
              const pct   = Math.round(count / Math.max(1, leads.length) * 100)
              return (
                <div key={col.status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{col.label}</span>
                    <div className="flex items-center gap-2">
                      {value > 0 && <span className="text-gray-400 text-[11px]">{formatCurrency(value)}</span>}
                      <span className="font-semibold text-gray-800 w-4 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', col.bar)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 grid grid-cols-3 text-center gap-2">
            <div>
              <p className="text-xs font-bold text-emerald-600">
                {formatCurrency(leads.filter(l => l.status === 'gagne').reduce((s, l) => s + (l.budget_estime ?? 0), 0))}
              </p>
              <p className="text-[10px] text-gray-400">CA gagné</p>
            </div>
            <div>
              <p className="text-xs font-bold text-brand-600">
                {formatCurrency(activeLeads.reduce((s, l) => s + (l.budget_estime ?? 0), 0))}
              </p>
              <p className="text-[10px] text-gray-400">Pipeline</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">{winRate}%</p>
              <p className="text-[10px] text-gray-400">Conversion</p>
            </div>
          </div>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <CardTitle>Activités récentes</CardTitle>
            </div>
            <span className="text-[11px] text-gray-400">{activities.length} actions</span>
          </CardHeader>
          {activities.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Aucune activité</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-0">
                {activities.map((a, i) => {
                  const c = ACTIVITY_COLORS[a.type] ?? { bg: 'bg-gray-100', dot: 'text-gray-400' }
                  return (
                    <div key={a.id} className={cn('flex gap-3 pb-3 relative', i === activities.length - 1 && 'pb-0')}>
                      <div className={cn('h-7 w-7 rounded-full shrink-0 flex items-center justify-center z-10 border-2 border-white', c.bg)}>
                        <Circle className={cn('h-2 w-2 fill-current', c.dot)} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-800">{a.action}</p>
                          <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(a.time)}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{a.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
