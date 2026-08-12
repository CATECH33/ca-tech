import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, CreditCard, FileText, UserPlus, Target, CalendarDays,
  ChevronRight, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Activity, Circle, Plus,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'
import { useDevis } from '@/hooks/useDevis'
import { useFactures } from '@/hooks/useFactures'
import { usePaiements } from '@/hooks/usePaiements'
import { useLeads } from '@/hooks/useLeads'
import { useProspects } from '@/hooks/useProspects'
import { useAppointments } from '@/hooks/useAgenda'

const ALERTE_COLORS = {
  error:   { bg: 'bg-red-50 border-red-100',         dot: 'bg-red-400',    text: 'text-red-700' },
  warning: { bg: 'bg-amber-50 border-amber-100',     dot: 'bg-amber-400',  text: 'text-amber-700' },
  info:    { bg: 'bg-blue-50 border-blue-100',       dot: 'bg-blue-400',   text: 'text-blue-700' },
  success: { bg: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400', text: 'text-emerald-700' },
}

const ACTIVITY_COLORS: Record<string, { bg: string; dot: string }> = {
  paiement: { bg: 'bg-emerald-100', dot: 'text-emerald-500' },
  devis:    { bg: 'bg-blue-100',    dot: 'text-blue-500' },
  client:   { bg: 'bg-violet-100',  dot: 'text-violet-500' },
  lead:     { bg: 'bg-indigo-100',  dot: 'text-indigo-500' },
}

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
  return formatDate(dateStr)
}

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

export function Dashboard() {
  const { data: clients      = [] } = useClients()
  const { data: leads        = [] } = useLeads()
  const { data: devis        = [] } = useDevis()
  const { data: factures     = [] } = useFactures()
  const { data: paiements    = [] } = usePaiements()
  const { data: prospects    = [] } = useProspects()
  const { data: appointments = [] } = useAppointments()

  const now              = new Date()
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const in7Days          = new Date(now.getTime() + 7 * 86400000)
  const hour             = now.getHours()
  const greeting         = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const caThisMo = paiements
    .filter(p => new Date(p.date_paiement) >= startOfMonth)
    .reduce((s, p) => s + p.montant, 0)
  const caPrevMo = paiements
    .filter(p => { const d = new Date(p.date_paiement); return d >= startOfPrevMonth && d < startOfMonth })
    .reduce((s, p) => s + p.montant, 0)
  const caChange = caPrevMo > 0 ? Math.round((caThisMo - caPrevMo) / caPrevMo * 100) : undefined

  const demandesATraiter  = leads.filter(l => l.status === 'nouveau').length
  const devisEnCours      = devis.filter(d => d.status === 'envoye').length
  const facturesEnAttente = factures.filter(f => ['envoyee', 'en_retard'].includes(f.status))
  const totalAttente      = facturesEnAttente.reduce((s, f) => s + f.total_ttc, 0)
  const clientsActifs     = clients.filter(c => c.status === 'actif').length
  const prospectsActifs   = prospects.filter(p =>
    !['disqualified', 'converted', 'project_started', 'contract_signed'].includes(p.status)
  ).length
  const rdvAVenir = appointments.filter(a =>
    new Date(a.start_at) >= now && ['scheduled', 'confirmed'].includes(a.status)
  ).length

  /* ── Alertes ──────────────────────────────────────────────────────────── */
  const enRetard = factures.filter(f => f.status === 'en_retard')
  type AlerteType = 'error' | 'warning' | 'info' | 'success'
  const alertes: { id: string; type: AlerteType; titre: string; desc: string; lien: string }[] = [
    ...enRetard.slice(0, 2).map(f => ({
      id: `r-${f.id}`, type: 'error' as const,
      titre: `Facture ${f.numero} en retard`,
      desc: `${f.client?.entreprise ?? `${f.client?.prenom} ${f.client?.nom}`} · ${formatCurrency(f.total_ttc)}`,
      lien: '/paiements',
    })),
    ...devis
      .filter(d => d.status === 'envoye' && d.date_expiration && new Date(d.date_expiration) <= in7Days)
      .slice(0, 2)
      .map(d => ({
        id: `e-${d.id}`, type: 'warning' as const,
        titre: `Devis ${d.numero} expire bientôt`,
        desc: `${d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`} · ${formatDate(d.date_expiration!)}`,
        lien: '/demandes',
      })),
    ...leads.filter(l => l.status === 'nouveau').slice(0, 2).map(l => ({
      id: `l-${l.id}`, type: 'info' as const,
      titre: 'Nouvelle demande à traiter',
      desc: `${l.prenom} ${l.nom}${l.entreprise ? ` · ${l.entreprise}` : ''}`,
      lien: '/demandes',
    })),
    ...devis.filter(d => d.status === 'accepte').slice(0, 1).map(d => ({
      id: `a-${d.id}`, type: 'success' as const,
      titre: `Devis ${d.numero} accepté`,
      desc: `${d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`} · ${formatCurrency(d.total_ttc)}`,
      lien: '/demandes',
    })),
  ].slice(0, 6)

  /* ── Activité récente ─────────────────────────────────────────────────── */
  const activities = useMemo(() => [
    ...paiements.slice(0, 3).map(p => ({
      id: `p-${p.id}`, type: 'paiement',
      action: 'Paiement encaissé',
      detail: `${p.client?.prenom ?? ''} ${p.client?.nom ?? ''} · ${formatCurrency(p.montant)}`,
      time: p.date_paiement,
    })),
    ...devis.slice(0, 3).map(d => ({
      id: `d-${d.id}`, type: 'devis',
      action: 'Devis créé',
      detail: `${d.numero} · ${d.client?.entreprise ?? `${d.client?.prenom} ${d.client?.nom}`}`,
      time: d.created_at,
    })),
    ...clients.slice(0, 2).map(c => ({
      id: `c-${c.id}`, type: 'client',
      action: 'Nouveau client',
      detail: `${c.prenom} ${c.nom}${c.entreprise ? ` · ${c.entreprise}` : ''}`,
      time: c.created_at,
    })),
    ...leads.slice(0, 2).map(l => ({
      id: `l-${l.id}`, type: 'lead',
      action: 'Nouvelle demande',
      detail: `${l.prenom} ${l.nom}${l.entreprise ? ` · ${l.entreprise}` : ''}`,
      time: l.created_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8),
  [paiements, devis, clients, leads])

  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Layout
      title="Vue d'ensemble"
      actions={
        <div className="flex items-center gap-2">
          <Link to="/leads"><Button size="sm" variant="outline"><Plus className="h-3 w-3" />Demande</Button></Link>
          <Link to="/clients"><Button size="sm"><Plus className="h-3 w-3" />Client</Button></Link>
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
              {caChange >= 0
                ? <ArrowUpRight className="h-3.5 w-3.5" />
                : <ArrowDownRight className="h-3.5 w-3.5" />}
              {caChange >= 0 ? '+' : ''}{caChange}% vs mois précédent
            </div>
          )}
        </div>
      </div>

      {/* ── 6 KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Demandes à traiter"
          value={demandesATraiter}
          sub={`${leads.length} demandes au total`}
          icon={<UserPlus className="h-5 w-5" />}
          iconBg={demandesATraiter > 0 ? 'bg-white/20' : 'bg-blue-50'}
          iconColor={demandesATraiter > 0 ? 'text-white' : 'text-blue-500'}
          to="/demandes"
          accent={demandesATraiter > 0}
        />
        <KpiCard
          label="Devis en attente"
          value={devisEnCours}
          sub={`${devis.length} devis au total`}
          icon={<FileText className="h-5 w-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          to="/demandes"
        />
        <KpiCard
          label="Paiements en attente"
          value={formatCurrency(totalAttente)}
          sub={`${facturesEnAttente.length} facture${facturesEnAttente.length !== 1 ? 's' : ''}`}
          icon={<CreditCard className="h-5 w-5" />}
          iconBg={facturesEnAttente.some(f => f.status === 'en_retard') ? 'bg-red-50' : 'bg-orange-50'}
          iconColor={facturesEnAttente.some(f => f.status === 'en_retard') ? 'text-red-500' : 'text-orange-500'}
          to="/paiements"
        />
        <KpiCard
          label="Clients actifs"
          value={clientsActifs}
          sub={`${clients.length} clients au total`}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          to="/clients"
        />
        <KpiCard
          label="Prospects actifs"
          value={prospectsActifs}
          sub="dans le pipeline"
          icon={<Target className="h-5 w-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          to="/prospection"
        />
        <KpiCard
          label="Rendez-vous à venir"
          value={rdvAVenir}
          sub="prochains rendez-vous"
          icon={<CalendarDays className="h-5 w-5" />}
          iconBg="bg-sky-50"
          iconColor="text-sky-500"
          to="/agenda"
        />
      </div>

      {/* ── ALERTES + ACTIVITÉ ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Alertes */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes</CardTitle>
            {alertes.filter(a => a.type === 'error').length > 0 && (
              <span className="h-5 w-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {alertes.filter(a => a.type === 'error').length}
              </span>
            )}
          </CardHeader>
          {alertes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-xs text-gray-400">Tout est en ordre</p>
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
            <span className="text-[11px] text-gray-400">{activities.length} actions</span>
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
