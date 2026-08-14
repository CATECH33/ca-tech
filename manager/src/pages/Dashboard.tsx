import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, CreditCard, FileText, Inbox, Target, Bot,
  ChevronRight, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Activity, Circle, Plus, Repeat, TrendingUp, MessageSquare,
  UserPlus,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'
import { useDevis } from '@/hooks/useDevis'
import { useFactures } from '@/hooks/useFactures'
import { usePaiements } from '@/hooks/usePaiements'
import { useLeads } from '@/hooks/useLeads'
import { useProspects } from '@/hooks/useProspects'
import { useMessages } from '@/hooks/useMessages'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useLoicConversations } from '@/hooks/useLoic'

// ─── Couleurs alertes ──────────────────────────────────────────────────────────

const ALERTE_COLORS = {
  error:   { bg: 'bg-red-50 border-red-100',         dot: 'bg-red-400',     text: 'text-red-700' },
  warning: { bg: 'bg-amber-50 border-amber-100',     dot: 'bg-amber-400',   text: 'text-amber-700' },
  info:    { bg: 'bg-blue-50 border-blue-100',       dot: 'bg-blue-400',    text: 'text-blue-700' },
  success: { bg: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400', text: 'text-emerald-700' },
}

const ACTIVITY_COLORS: Record<string, { bg: string; dot: string }> = {
  paiement:     { bg: 'bg-emerald-100', dot: 'text-emerald-500' },
  devis:        { bg: 'bg-blue-100',    dot: 'text-blue-500' },
  client:       { bg: 'bg-violet-100',  dot: 'text-violet-500' },
  lead:         { bg: 'bg-indigo-100',  dot: 'text-indigo-500' },
  message:      { bg: 'bg-sky-100',     dot: 'text-sky-500' },
  prospect:     { bg: 'bg-orange-100',  dot: 'text-orange-500' },
  conversation: { bg: 'bg-rose-100',    dot: 'text-rose-500' },
  abonnement:   { bg: 'bg-teal-100',    dot: 'text-teal-500' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 2) return "à l'instant"
  if (min < 60) return `il y a ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'hier'
  if (d < 7) return `il y a ${d}j`
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  to?: string
  accent?: boolean
  change?: number
}

function KpiCard({ label, value, sub, icon, iconBg, iconColor, to, accent, change }: KpiCardProps) {
  const up   = change !== undefined && change > 0
  const down = change !== undefined && change < 0
  const inner = (
    <div className={cn(
      'rounded-2xl border p-5 group transition-all duration-200',
      accent
        ? 'bg-gradient-to-br from-brand-500 to-brand-600 border-brand-400 hover:shadow-lg'
        : 'bg-white border-gray-100 hover:shadow-sm',
      to && 'cursor-pointer',
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl shrink-0', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        {to && <ChevronRight className={cn('h-4 w-4 opacity-0 group-hover:opacity-100 transition mt-0.5', accent ? 'text-white/60' : 'text-gray-300')} />}
      </div>
      <p className={cn('text-xs font-medium mb-1', accent ? 'text-white/70' : 'text-gray-500')}>{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums leading-none', accent ? 'text-white' : 'text-gray-900')}>{value}</p>
      {sub && <p className={cn('text-[11px] mt-2', accent ? 'text-white/50' : 'text-gray-400')}>{sub}</p>}
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-[11px] font-semibold mt-2',
          up ? (accent ? 'text-white/80' : 'text-emerald-600') : down ? (accent ? 'text-white/80' : 'text-red-500') : 'text-gray-400',
        )}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : down ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
          {up && '+'}{change}%
        </div>
      )}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

// ─── Actions rapides config ────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Nouveau devis',     icon: FileText,     to: '/devis',       color: 'text-blue-500',    bg: 'bg-blue-50' },
  { label: 'Voir les demandes', icon: Inbox,        to: '/contacts',    color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  { label: 'Voir les clients',  icon: Users,        to: '/clients',     color: 'text-violet-500',  bg: 'bg-violet-50' },
  { label: 'Voir les paiements',icon: CreditCard,   to: '/paiements',   color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Ouvrir Loïc IA',   icon: Bot,          to: '/loic',        color: 'text-rose-500',    bg: 'bg-rose-50' },
  { label: 'Prospection',       icon: Target,       to: '/prospection', color: 'text-orange-500',  bg: 'bg-orange-50' },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { data: clients       = [] } = useClients()
  const { data: leads         = [] } = useLeads()
  const { data: devis         = [] } = useDevis()
  const { data: factures      = [] } = useFactures()
  const { data: paiements     = [] } = usePaiements()
  const { data: prospects     = [] } = useProspects()
  const { data: messages      = [] } = useMessages()
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: conversations = [] } = useLoicConversations()

  const now              = new Date()
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfWeek      = new Date(now.getTime() - 7 * 86400000)
  const in7Days          = new Date(now.getTime() + 7 * 86400000)
  const hour             = now.getHours()
  const greeting         = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  // ── CA ce mois ──────────────────────────────────────────────────────────────
  const caThisMo = paiements
    .filter(p => new Date(p.date_paiement) >= startOfMonth)
    .reduce((s, p) => s + p.montant, 0)
  const caPrevMo = paiements
    .filter(p => { const d = new Date(p.date_paiement); return d >= startOfPrevMonth && d < startOfMonth })
    .reduce((s, p) => s + p.montant, 0)
  const caChange = caPrevMo > 0 ? Math.round((caThisMo - caPrevMo) / caPrevMo * 100) : undefined

  // ── 6 KPIs ──────────────────────────────────────────────────────────────────
  const nouveauxContacts   = leads.filter(l => l.status === 'nouveau').length
                           + messages.filter(m => !m.lu && !m.is_archived).length
  const devisEnAttente     = devis.filter(d => d.status === 'envoye').length
  const devisAcceptesMo    = devis.filter(d => d.status === 'accepte' && new Date(d.created_at) >= startOfMonth).length
  const devisAcceptesTotal = devis.filter(d => d.status === 'accepte').reduce((s, d) => s + d.total_ttc, 0)
  const paiementsMo        = paiements.filter(p => new Date(p.date_paiement) >= startOfMonth)
  const paiementsCount     = paiementsMo.length
  const abonnementsActifs  = subscriptions.filter(s => s.status === 'active').length
  const prospectsARelancer = prospects.filter(p =>
    ['contacted', 'email_ready', 'responded', 'qualified'].includes(p.status)
  ).length

  // ── À traiter ───────────────────────────────────────────────────────────────
  type AlerteType = 'error' | 'warning' | 'info' | 'success'
  const alertes: { id: string; type: AlerteType; titre: string; desc: string; lien: string }[] = [
    ...messages.filter(m => !m.lu && !m.is_archived).slice(0, 2).map(m => ({
      id: `msg-${m.id}`, type: 'info' as const,
      titre: `Message de ${m.from_name}`,
      desc: m.subject ?? m.body.slice(0, 60),
      lien: '/contacts',
    })),
    ...leads.filter(l => l.status === 'nouveau').slice(0, 2).map(l => ({
      id: `lead-${l.id}`, type: 'info' as const,
      titre: 'Nouveau contact à traiter',
      desc: `${l.prenom} ${l.nom}${l.entreprise ? ` · ${l.entreprise}` : ''}`,
      lien: '/contacts',
    })),
    ...devis
      .filter(d => d.status === 'envoye' && d.date_expiration && new Date(d.date_expiration) <= in7Days)
      .slice(0, 2)
      .map(d => ({
        id: `dexp-${d.id}`, type: 'warning' as const,
        titre: `Devis ${d.numero} expire bientôt`,
        desc: `${d.client?.entreprise ?? `${d.client?.prenom ?? ''} ${d.client?.nom ?? ''}`}`,
        lien: '/devis',
      })),
    ...factures.filter(f => f.status === 'en_retard').slice(0, 2).map(f => ({
      id: `ret-${f.id}`, type: 'error' as const,
      titre: `Facture ${f.numero} en retard`,
      desc: `${f.client?.entreprise ?? `${f.client?.prenom ?? ''} ${f.client?.nom ?? ''}`} · ${formatCurrency(f.total_ttc)}`,
      lien: '/paiements',
    })),
    ...subscriptions.filter(s => s.status === 'cancelled').slice(0, 1).map(s => ({
      id: `sub-${s.id}`, type: 'warning' as const,
      titre: 'Abonnement annulé',
      desc: s.name,
      lien: '/paiements',
    })),
  ].slice(0, 6)

  // ── Activité récente ────────────────────────────────────────────────────────
  const activities = useMemo(() => [
    ...paiements.slice(0, 3).map(p => ({
      id: `p-${p.id}`, type: 'paiement',
      action: 'Paiement encaissé',
      detail: `${p.client?.prenom ?? ''} ${p.client?.nom ?? ''} · ${formatCurrency(p.montant)}`,
      time: p.date_paiement,
    })),
    ...devis.slice(0, 3).map(d => ({
      id: `d-${d.id}`, type: 'devis',
      action: d.status === 'accepte' ? 'Devis accepté' : 'Devis créé',
      detail: `${d.numero} · ${d.client?.entreprise ?? `${d.client?.prenom ?? ''} ${d.client?.nom ?? ''}`}`,
      time: d.created_at,
    })),
    ...clients.slice(0, 2).map(c => ({
      id: `c-${c.id}`, type: 'client',
      action: 'Nouveau client',
      detail: `${c.prenom} ${c.nom}${c.entreprise ? ` · ${c.entreprise}` : ''}`,
      time: c.created_at,
    })),
    ...leads.slice(0, 3).map(l => ({
      id: `l-${l.id}`, type: 'lead',
      action: 'Nouveau contact',
      detail: `${l.prenom} ${l.nom}${l.entreprise ? ` · ${l.entreprise}` : ''}`,
      time: l.created_at,
    })),
    ...messages.slice(0, 2).map(m => ({
      id: `m-${m.id}`, type: 'message',
      action: 'Message reçu',
      detail: `${m.from_name} · ${m.subject ?? m.body.slice(0, 40)}`,
      time: m.created_at,
    })),
    ...prospects.slice(0, 2).map(pr => ({
      id: `pr-${pr.id}`, type: 'prospect',
      action: 'Nouveau prospect',
      detail: pr.company_name,
      time: pr.created_at,
    })),
    ...conversations.slice(0, 2).map(cv => ({
      id: `cv-${cv.id}`, type: 'conversation',
      action: 'Conversation Loïc',
      detail: cv.metadata.prenom ? `${cv.metadata.prenom}${cv.metadata.nom ? ` ${cv.metadata.nom}` : ''}` : 'Contact anonyme',
      time: cv.updated_at,
    })),
    ...subscriptions.filter(s => s.status === 'active').slice(0, 1).map(s => ({
      id: `sub-${s.id}`, type: 'abonnement',
      action: 'Abonnement activé',
      detail: s.name,
      time: s.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10),
  [paiements, devis, clients, leads, messages, prospects, conversations, subscriptions])

  // ── Loïc IA stats ──────────────────────────────────────────────────────────
  const loicActive    = conversations.filter(c => c.status === 'active').length
  const loicCompleted = conversations.filter(c => c.status === 'completed').length
  const loicToday     = conversations.filter(c => {
    const d = new Date(c.updated_at)
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const loicLast      = conversations[0]?.updated_at

  // ── Prospection stats ──────────────────────────────────────────────────────
  const prospectsNew    = prospects.filter(p => new Date(p.created_at) >= startOfWeek).length
  const prospectsActifs = prospects.filter(p =>
    !['disqualified', 'converted', 'project_started', 'contract_signed'].includes(p.status)
  ).length
  const prospectLast    = prospects[0]?.company_name

  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Layout
      title="Vue d'ensemble"
      actions={
        <div className="flex items-center gap-2">
          <Link to="/contacts"><Button size="sm" variant="outline"><Inbox className="h-3 w-3" />Contacts</Button></Link>
          <Link to="/devis"><Button size="sm"><Plus className="h-3 w-3" />Nouveau devis</Button></Link>
        </div>
      }
    >

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2540] via-[#0A3060] to-brand-600 p-6 mb-6">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative">
          <p className="text-white/40 text-xs capitalize mb-2 tracking-wide">{dateStr}</p>
          <p className="text-white/70 text-sm font-medium mb-1">{greeting}</p>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-bold text-white tabular-nums tracking-tight">
              {formatCurrency(caThisMo)}
            </span>
            <span className="text-white/40 text-sm">encaissé ce mois</span>
          </div>
          {caChange !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-semibold mt-2',
              caChange >= 0 ? 'text-emerald-300' : 'text-red-300',
            )}>
              {caChange >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {caChange >= 0 ? '+' : ''}{caChange}% vs mois précédent
            </div>
          )}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Clients</p>
              <p className="text-white font-bold text-lg">{clients.length}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Devis actifs</p>
              <p className="text-white font-bold text-lg">{devis.filter(d => d.status === 'envoye').length}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Prospects</p>
              <p className="text-white font-bold text-lg">{prospectsActifs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6 KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Nouveaux contacts"
          value={nouveauxContacts}
          sub={`${leads.filter(l => l.status === 'nouveau').length} leads · ${messages.filter(m => !m.lu && !m.is_archived).length} messages`}
          icon={<Inbox className="h-5 w-5" />}
          iconBg={nouveauxContacts > 0 ? 'bg-white/20' : 'bg-blue-50'}
          iconColor={nouveauxContacts > 0 ? 'text-white' : 'text-blue-500'}
          to="/contacts"
          accent={nouveauxContacts > 0}
        />
        <KpiCard
          label="Devis en attente"
          value={devisEnAttente}
          sub={`${devis.length} devis au total`}
          icon={<FileText className="h-5 w-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          to="/devis"
        />
        <KpiCard
          label="Devis acceptés"
          value={devisAcceptesMo}
          sub={devisAcceptesTotal > 0 ? formatCurrency(devisAcceptesTotal) + ' au total' : 'ce mois-ci'}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          to="/devis"
        />
        <KpiCard
          label="Paiements reçus"
          value={formatCurrency(caThisMo)}
          sub={`${paiementsCount} paiement${paiementsCount !== 1 ? 's' : ''} ce mois`}
          icon={<CreditCard className="h-5 w-5" />}
          iconBg="bg-teal-50"
          iconColor="text-teal-500"
          to="/paiements"
          change={caChange}
        />
        <KpiCard
          label="Abonnements actifs"
          value={abonnementsActifs}
          sub={`${subscriptions.length} abonnement${subscriptions.length !== 1 ? 's' : ''} au total`}
          icon={<Repeat className="h-5 w-5" />}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          to="/paiements"
        />
        <KpiCard
          label="Prospects à relancer"
          value={prospectsARelancer}
          sub={`${prospects.length} prospects au total`}
          icon={<Target className="h-5 w-5" />}
          iconBg={prospectsARelancer > 0 ? 'bg-orange-50' : 'bg-gray-50'}
          iconColor={prospectsARelancer > 0 ? 'text-orange-500' : 'text-gray-400'}
          to="/prospection"
        />
      </div>

      {/* ── ACTIONS RAPIDES ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Actions rapides</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon
            return (
              <Link
                key={a.to}
                to={a.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                <div className={cn('p-2 rounded-lg', a.bg)}>
                  <Icon className={cn('h-4 w-4', a.color)} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-900 text-center leading-tight">{a.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── À TRAITER + ACTIVITÉ RÉCENTE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* À traiter */}
        <Card>
          <CardHeader>
            <CardTitle>À traiter</CardTitle>
            {alertes.filter(a => a.type === 'error').length > 0 && (
              <span className="h-5 w-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {alertes.filter(a => a.type === 'error').length}
              </span>
            )}
            {alertes.length === 0 && (
              <span className="text-[11px] text-emerald-500 font-medium">Tout est en ordre</span>
            )}
          </CardHeader>
          {alertes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-xs text-gray-400">Aucune action requise</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertes.map(a => {
                const c = ALERTE_COLORS[a.type]
                return (
                  <Link
                    key={a.id}
                    to={a.lien}
                    className={cn('flex items-start gap-2.5 p-2.5 rounded-xl border transition hover:shadow-sm', c.bg)}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0 mt-1.5', c.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold truncate', c.text)}>{a.titre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{a.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <CardTitle>Activité récente</CardTitle>
            </div>
            <span className="text-[11px] text-gray-400">{activities.length} événements</span>
          </CardHeader>
          {activities.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Aucune activité</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-0">
                {activities.map((a, i) => {
                  const c = ACTIVITY_COLORS[a.type] ?? { bg: 'bg-gray-100', dot: 'text-gray-400' }
                  return (
                    <div key={a.id} className={cn('flex gap-3 pb-3 relative', i === activities.length - 1 && 'pb-0')}>
                      <div className={cn('h-7 w-7 rounded-full shrink-0 flex items-center justify-center z-10 border-2 border-white', c.bg)}>
                        <span className={cn('h-2 w-2 rounded-full bg-current', c.dot)} />
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

      {/* ── LOÏC IA + PROSPECTION ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Loïc IA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50">
                <Bot className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <CardTitle>Loïc IA</CardTitle>
            </div>
            <Link to="/loic">
              <Button size="sm" variant="outline">Voir Loïc IA</Button>
            </Link>
          </CardHeader>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Aucune conversation pour l'instant</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{conversations.length}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Conversations</p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-center">
                  <p className="text-xl font-bold text-rose-600">{loicActive}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">En cours</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{loicCompleted}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Terminées</p>
                </div>
              </div>
              {loicToday > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-700 font-medium">{loicToday} conversation{loicToday > 1 ? 's' : ''} aujourd'hui</p>
                </div>
              )}
              {loicLast && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-50">
                  <span>Dernière activité</span>
                  <span>{relativeTime(loicLast)}</span>
                </div>
              )}
              <div className="space-y-1.5 pt-1">
                {conversations.slice(0, 3).map(cv => (
                  <div key={cv.id} className="flex items-center gap-2 py-1.5">
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      cv.status === 'active' ? 'bg-rose-400' : cv.status === 'completed' ? 'bg-emerald-400' : 'bg-gray-300'
                    )} />
                    <p className="text-xs text-gray-700 font-medium truncate flex-1">
                      {cv.metadata.prenom ? `${cv.metadata.prenom}${cv.metadata.nom ? ` ${cv.metadata.nom}` : ''}` : 'Anonyme'}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(cv.updated_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Prospection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Target className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <CardTitle>Prospection</CardTitle>
            </div>
            <Link to="/prospection">
              <Button size="sm" variant="outline">Voir la prospection</Button>
            </Link>
          </CardHeader>
          {prospects.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Aucun prospect pour l'instant</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{prospects.length}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <p className="text-xl font-bold text-blue-600">{prospectsNew}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cette semaine</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-3 text-center">
                  <p className="text-xl font-bold text-orange-600">{prospectsARelancer}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">À relancer</p>
                </div>
              </div>
              {prospectsARelancer > 0 && (
                <Link
                  to="/prospection"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700 font-medium flex-1">{prospectsARelancer} prospect{prospectsARelancer > 1 ? 's' : ''} à relancer</p>
                  <ChevronRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                </Link>
              )}
              {prospectsActifs > 0 && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-50">
                  <span>{prospectsActifs} dans le pipeline actif</span>
                  {prospectLast && <span className="truncate max-w-[120px]">{prospectLast}</span>}
                </div>
              )}
              <div className="space-y-1.5 pt-1">
                {prospects.slice(0, 3).map(pr => (
                  <div key={pr.id} className="flex items-center gap-2 py-1.5">
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      pr.status === 'new' ? 'bg-blue-400'
                        : pr.status === 'qualified' ? 'bg-emerald-400'
                        : pr.status === 'contacted' ? 'bg-orange-400'
                        : pr.status === 'disqualified' ? 'bg-gray-300'
                        : 'bg-violet-400'
                    )} />
                    <p className="text-xs text-gray-700 font-medium truncate flex-1">{pr.company_name}</p>
                    <span className="text-[10px] text-gray-400 shrink-0 capitalize">{pr.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
