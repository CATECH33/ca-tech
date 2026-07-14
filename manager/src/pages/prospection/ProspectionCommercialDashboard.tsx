import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, Mail, Send, Eye, MessageSquare, Calendar, FileText,
  PenLine, CheckCircle2, TrendingUp, TrendingDown, RefreshCw,
  Plus, ArrowRight, Activity, Zap, Rocket, Building2,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, formatCurrency } from '@/lib/utils'
import { useProspects } from '@/hooks/useProspects'
import { useEmailDrafts } from '@/hooks/useEmailDrafts'
import { useCampaigns } from '@/hooks/useCampagnes'
import { useDevis } from '@/hooks/useDevis'
import { useDashboardRealtime, useEmailEvents } from '@/hooks/useDashboardRealtime'

// ── Constants ─────────────────────────────────────────────────────────────────

const REFETCH_INTERVAL = 30_000

const FUNNEL_STAGES = [
  { status: 'new',            label: 'Nouveau prospect', color: '#94A3B8', shortLabel: 'Nouveau'  },
  { status: 'qualified',      label: 'Qualifié',         color: '#3B82F6', shortLabel: 'Qualifié' },
  { status: 'email_ready',    label: 'Email prêt',       color: '#6366F1', shortLabel: 'Email ✓'  },
  { status: 'contacted',      label: 'Email envoyé',     color: '#8B5CF6', shortLabel: 'Envoyé'   },
  { status: 'responded',      label: 'Réponse reçue',    color: '#06B6D4', shortLabel: 'Réponse'  },
  { status: 'meeting',        label: 'Rendez-vous',      color: '#14B8A6', shortLabel: 'RDV'      },
  { status: 'proposal_sent',  label: 'Devis envoyé',     color: '#F59E0B', shortLabel: 'Devis'    },
  { status: 'contract_signed',label: 'Contrat signé',    color: '#F97316', shortLabel: 'Contrat'  },
  { status: 'converted',      label: 'Client',           color: '#10B981', shortLabel: 'Client'   },
  { status: 'project_started',label: 'Projet lancé',     color: '#22C55E', shortLabel: 'Projet'   },
] as const

const ACTIVITY_LABELS: Record<string, string> = {
  email_sent:     'Email envoyé',
  email_opened:   'Email ouvert',
  email_replied:  'Réponse reçue',
  call:           'Appel passé',
  meeting:        'Rendez-vous',
  note_added:     'Note ajoutée',
  status_changed: 'Statut modifié',
  score_updated:  'Score mis à jour',
  task_completed: 'Tâche terminée',
  contacted:      'Contacté',
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function trend(current: number, prev: number): number | null {
  if (prev === 0 && current === 0) return null
  if (prev === 0) return null
  return Math.round((current - prev) / prev * 100)
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null
  const up = value >= 0
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
      up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
    )}>
      {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {Math.abs(value)}%
    </span>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiDef {
  label:     string
  value:     string | number
  sub?:      string
  icon:      React.ElementType
  color:     string        // hex
  bgColor:   string        // Tailwind bg-*
  trendVal?: number | null
  locked?:   boolean
  lockLabel?:string
}

function KpiCard({ def, loading }: { def: KpiDef; loading?: boolean }) {
  const Icon = def.icon
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative overflow-hidden',
      'transition-all hover:shadow-md hover:-translate-y-px',
      def.locked && 'opacity-80',
    )}>
      {/* Subtle background blob */}
      <div
        className="absolute -top-4 -right-4 h-20 w-20 rounded-full opacity-[0.06]"
        style={{ background: def.color }}
      />

      <div className="relative">
        {/* Icon + trend */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn('h-9 w-9 rounded-xl flex items-center justify-center', def.bgColor)}
          >
            <Icon className="h-4.5 w-4.5" style={{ color: def.color }} />
          </div>
          {def.trendVal !== undefined && <TrendBadge value={def.trendVal ?? null} />}
        </div>

        {/* Value */}
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
        ) : def.locked ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-200">—</span>
            {def.lockLabel && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                {def.lockLabel}
              </span>
            )}
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 mb-1">{def.value}</p>
        )}

        {/* Label + sub */}
        <p className="text-xs font-semibold text-gray-500">{def.label}</p>
        {def.sub && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{def.locked ? 'Connectez un ESP' : def.sub}</p>
        )}
      </div>
    </div>
  )
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color ?? p.fill }} />
          <span className="text-gray-500">{p.name}</span>
          <span className="font-bold text-gray-800 ml-auto pl-3">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Funnel bar chart (custom) ─────────────────────────────────────────────────

function FunnelChart({ data }: { data: Array<{ label: string; count: number; color: string; prev?: number }> }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="space-y-2">
      {data.map((stage, i) => {
        const pct = Math.round((stage.count / max) * 100)
        const convRate = i > 0 && data[i - 1].count > 0
          ? Math.round(stage.count / data[i - 1].count * 100)
          : null

        return (
          <div key={stage.label} className="flex items-center gap-3 group">
            {/* Label */}
            <div className="w-28 shrink-0 text-right">
              <span className="text-[11px] text-gray-500 group-hover:text-gray-700 transition-colors truncate block">
                {stage.label}
              </span>
            </div>

            {/* Bar */}
            <div className="flex-1 relative h-7 bg-gray-50 rounded-lg overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-lg transition-all duration-500"
                style={{ width: `${pct}%`, background: stage.color, opacity: 0.8 }}
              />
              <div className="absolute inset-0 flex items-center px-2.5">
                {stage.count > 0 && (
                  <span className="text-[11px] font-bold text-white drop-shadow-sm">
                    {stage.count}
                  </span>
                )}
              </div>
            </div>

            {/* Drop-off % */}
            <div className="w-12 shrink-0 text-right">
              {convRate !== null ? (
                <span className={cn(
                  'text-[10px] font-semibold',
                  convRate >= 50 ? 'text-emerald-500' :
                  convRate >= 20 ? 'text-amber-500' :
                  'text-red-400',
                )}>
                  {convRate}%
                </span>
              ) : (
                <span className="text-[10px] text-gray-300">—</span>
              )}
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-3 pt-1">
        <div className="w-28 shrink-0" />
        <div className="flex-1" />
        <div className="w-12 shrink-0 text-right">
          <span className="text-[10px] text-gray-400">Taux</span>
        </div>
      </div>
    </div>
  )
}

// ── Activity item ─────────────────────────────────────────────────────────────

function ActivityItem({ type, company, description, date }: {
  type: string
  company: string
  description?: string
  date: string
}) {
  return (
    <div className="flex items-start gap-3 py-2 px-2 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="h-6 w-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700">
          {ACTIVITY_LABELS[type] ?? type}
          <span className="text-gray-400 font-normal"> · {company}</span>
        </p>
        {description && (
          <p className="text-[11px] text-gray-400 truncate">{description}</p>
        )}
      </div>
      <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">{date}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ProspectionCommercialDashboard() {
  const navigate = useNavigate()

  // ── Real-time subscriptions ────────────────────────────────────────────────
  useDashboardRealtime()

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: prospects  = [], isLoading: pLoad,  isFetching: pFetch,  refetch: rP } = useProspects({ refetchInterval: REFETCH_INTERVAL })
  const { data: drafts     = [], isLoading: dLoad,  isFetching: dFetch,  refetch: rD } = useEmailDrafts({ refetchInterval: REFETCH_INTERVAL })
  const { data: campaigns  = [], isLoading: cLoad,  isFetching: cFetch,  refetch: rC } = useCampaigns()
  const { data: devisData  = [], isLoading: dvLoad, isFetching: dvFetch, refetch: rDv } = useDevis()

  // ── Future: email open-rate integration ────────────────────────────────────
  const { openRate } = useEmailEvents()

  const isLoading  = pLoad || dLoad || cLoad || dvLoad
  const isFetching = pFetch || dFetch || cFetch || dvFetch
  const refetch = () => { rP(); rD(); rC(); rDv() }

  // ── Computed stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now   = new Date()
    const iso   = (d: Date) => d.toISOString().slice(0, 10)
    const ago   = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return iso(d) }

    const d7   = ago(7)
    const d14  = ago(14)
    const d30  = ago(30)

    // ── Core KPI values ────────────────────────────────────────────────────
    const activeProspects = prospects.filter(p => p.status !== 'disqualified').length

    const nonRelanceDrafts = drafts.filter(d => !d.metadata?.is_relance)
    const emailsReady  = nonRelanceDrafts.filter(d => d.status === 'ready').length
    const emailsSentD  = nonRelanceDrafts.filter(d => d.status === 'sent').length
    const emailsSentC  = campaigns.reduce((a, c) => a + c.emails_sent, 0)
    const emailsSent   = emailsSentD + emailsSentC

    const responsesP  = prospects.filter(p => p.status === 'responded').length
    const responsesC  = campaigns.reduce((a, c) => a + c.replies, 0)
    const responses   = responsesP + responsesC

    const meetingsP   = prospects.filter(p => p.status === 'meeting').length
    const meetingsC   = campaigns.reduce((a, c) => a + c.meetings, 0)
    const meetings    = meetingsP + meetingsC

    const devisCount  = devisData.filter(d => ['envoye', 'accepte', 'brouillon'].includes(d.status)).length
    const contrats    = prospects.filter(p => p.status === 'contract_signed').length
    const clients     = prospects.filter(p => ['converted', 'project_started'].includes(p.status)).length

    const caPotentiel = devisData
      .filter(d => ['envoye', 'accepte'].includes(d.status))
      .reduce((a, d) => a + d.total_ttc, 0)

    // ── 7-day trends ───────────────────────────────────────────────────────
    const prosp7   = prospects.filter(p => p.created_at.slice(0, 10) >= d7).length
    const prosp7p  = prospects.filter(p => p.created_at.slice(0, 10) >= d14 && p.created_at.slice(0, 10) < d7).length
    const prospTrend = trend(prosp7, prosp7p)

    const sent7    = nonRelanceDrafts.filter(d => d.sent_at && d.sent_at.slice(0, 10) >= d7).length
    const sent7p   = nonRelanceDrafts.filter(d => d.sent_at && d.sent_at.slice(0, 10) >= d14 && d.sent_at.slice(0, 10) < d7).length
    const sentTrend = trend(sent7, sent7p)

    const resp7    = prospects.filter(p => p.activities.some(a => a.type === 'email_replied' && a.created_at.slice(0, 10) >= d7)).length
    const resp7p   = prospects.filter(p => p.activities.some(a => a.type === 'email_replied' && a.created_at.slice(0, 10) >= d14 && a.created_at.slice(0, 10) < d7)).length
    const respTrend = trend(resp7, resp7p)

    // ── Funnel ─────────────────────────────────────────────────────────────
    const funnel = FUNNEL_STAGES.map(s => ({
      label: s.label,
      color: s.color,
      count: prospects.filter(p => p.status === s.status).length,
    }))

    // ── Daily evolution (30 days) ──────────────────────────────────────────
    const today = new Date()
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (29 - i))
      const ds = iso(d)
      return {
        date:      format(d, 'dd/MM', { locale: fr }),
        prospects: prospects.filter(p => p.created_at.slice(0, 10) === ds).length,
        emails:    nonRelanceDrafts.filter(d => d.sent_at?.slice(0, 10) === ds).length,
        reponses:  prospects.filter(p =>
          p.activities.some(a => a.type === 'email_replied' && a.created_at.slice(0, 10) === ds),
        ).length,
      }
    })

    // ── CA by devis status ─────────────────────────────────────────────────
    const caByStatus = [
      { name: 'Accepté',  value: devisData.filter(d => d.status === 'accepte').reduce((a, d) => a + d.total_ttc, 0),  color: '#10B981' },
      { name: 'Envoyé',   value: devisData.filter(d => d.status === 'envoye').reduce((a, d)  => a + d.total_ttc, 0),  color: '#3B82F6' },
      { name: 'Brouillon',value: devisData.filter(d => d.status === 'brouillon').reduce((a, d) => a + d.total_ttc, 0),color: '#94A3B8' },
      { name: 'Refusé',   value: devisData.filter(d => d.status === 'refuse').reduce((a, d) => a + d.total_ttc, 0),   color: '#EF4444' },
    ].filter(d => d.value > 0)

    // ── Conversion rates at key transitions ────────────────────────────────
    const totalProspects = prospects.length
    const conversionSteps = [
      { label: 'Prospect → Email envoyé', from: totalProspects,                                                     to: emailsSent },
      { label: 'Email → Réponse',         from: emailsSent,                                                         to: responses  },
      { label: 'Réponse → RDV',           from: responses,                                                          to: meetings   },
      { label: 'RDV → Devis',             from: meetings,                                                           to: devisCount },
      { label: 'Devis → Contrat',         from: devisCount,                                                         to: contrats   },
      { label: 'Contrat → Client',        from: contrats,                                                           to: clients    },
    ].map(s => ({
      ...s,
      rate: s.from > 0 ? Math.round(s.to / s.from * 100) : 0,
    }))

    // ── Recent activities ──────────────────────────────────────────────────
    const recentActivities = prospects
      .flatMap(p => p.activities.map(a => ({
        ...a, company: p.company_name, prospectId: p.id,
      })))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    return {
      activeProspects, emailsReady, emailsSent, responses, meetings,
      devisCount, contrats, clients, caPotentiel,
      prospTrend, sentTrend, respTrend,
      funnel, dailyData, caByStatus, conversionSteps, recentActivities,
    }
  }, [prospects, drafts, campaigns, devisData])

  // ── KPI definitions ────────────────────────────────────────────────────────
  const kpiRow1: KpiDef[] = [
    {
      label:    'Prospects actifs',
      value:    stats.activeProspects,
      sub:      'dans le pipeline',
      icon:     Users,
      color:    '#0066FF',
      bgColor:  'bg-blue-50',
      trendVal: stats.prospTrend,
    },
    {
      label:   'Emails préparés',
      value:   stats.emailsReady,
      sub:     'prêts à envoyer',
      icon:    Mail,
      color:   '#6366F1',
      bgColor: 'bg-indigo-50',
    },
    {
      label:    'Emails envoyés',
      value:    stats.emailsSent,
      sub:      'via brouillons + campagnes',
      icon:     Send,
      color:    '#8B5CF6',
      bgColor:  'bg-violet-50',
      trendVal: stats.sentTrend,
    },
    {
      label:     'Taux d\'ouverture',
      value:     openRate > 0 ? `${openRate}%` : '—',
      sub:       'connectez un ESP pour suivre',
      icon:      Eye,
      color:     '#F59E0B',
      bgColor:   'bg-amber-50',
      locked:    openRate === 0,
      lockLabel: 'Tracking',
    },
    {
      label:    'Réponses reçues',
      value:    stats.responses,
      sub:      'prospects + campagnes',
      icon:     MessageSquare,
      color:    '#06B6D4',
      bgColor:  'bg-cyan-50',
      trendVal: stats.respTrend,
    },
  ]

  const kpiRow2: KpiDef[] = [
    {
      label:   'Rendez-vous',
      value:   stats.meetings,
      sub:     'planifiés ou passés',
      icon:    Calendar,
      color:   '#14B8A6',
      bgColor: 'bg-teal-50',
    },
    {
      label:   'Devis',
      value:   stats.devisCount,
      sub:     'envoyés ou en cours',
      icon:    FileText,
      color:   '#F97316',
      bgColor: 'bg-orange-50',
    },
    {
      label:   'Contrats signés',
      value:   stats.contrats,
      sub:     'prêts à démarrer',
      icon:    PenLine,
      color:   '#EF4444',
      bgColor: 'bg-red-50',
    },
    {
      label:   'Clients',
      value:   stats.clients,
      sub:     'convertis + projets lancés',
      icon:    CheckCircle2,
      color:   '#10B981',
      bgColor: 'bg-emerald-50',
    },
    {
      label:   'CA potentiel',
      value:   formatCurrency(stats.caPotentiel),
      sub:     'devis envoyés + acceptés',
      icon:    TrendingUp,
      color:   '#22C55E',
      bgColor: 'bg-green-50',
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout
      title="Tableau de bord commercial"
      actions={
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              isFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400',
            )} />
            <span className="text-[11px] text-gray-500 font-medium">
              {isFetching ? 'Synchronisation…' : 'En direct'}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={refetch} disabled={isFetching}>
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          </Button>

          <Button size="sm" onClick={() => navigate('/prospection/prospects')}>
            <Plus className="h-3.5 w-3.5" /> Nouveau prospect
          </Button>
        </div>
      }
    >

      {/* ── KPI Row 1 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
        {kpiRow1.map(def => (
          <KpiCard key={def.label} def={def} loading={isLoading} />
        ))}
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpiRow2.map(def => (
          <KpiCard key={def.label} def={def} loading={isLoading} />
        ))}
      </div>

      {/* ── Funnel + Évolution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Funnel (3/5) */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Entonnoir commercial</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Répartition des {prospects.length} prospects par étape
              </p>
            </div>
            <button
              onClick={() => navigate('/prospection/pipeline')}
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              Pipeline <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-7 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : prospects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Users className="h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-400">Aucun prospect dans le pipeline</p>
              <button
                onClick={() => navigate('/prospection/prospects')}
                className="text-xs text-brand-600 hover:underline mt-1"
              >
                Ajouter le premier →
              </button>
            </div>
          ) : (
            <FunnelChart data={stats.funnel} />
          )}
        </Card>

        {/* Évolution 30j (2/5) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Activité — 30 jours</h3>
              <p className="text-xs text-gray-400 mt-0.5">Prospects · Emails · Réponses</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-blue-500">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> Prospects
              </span>
              <span className="flex items-center gap-1 text-violet-500">
                <span className="h-2 w-2 rounded-full bg-violet-400" /> Emails
              </span>
              <span className="flex items-center gap-1 text-cyan-500">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Réponses
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <AreaChart data={stats.dailyData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="prospects" name="Prospects" stroke="#3B82F6" strokeWidth={1.5} fill="url(#gP)" dot={false} />
                <Area type="monotone" dataKey="emails"    name="Emails"    stroke="#8B5CF6" strokeWidth={1.5} fill="url(#gE)" dot={false} />
                <Area type="monotone" dataKey="reponses"  name="Réponses"  stroke="#06B6D4" strokeWidth={1.5} fill="url(#gR)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── CA potentiel + Conversion + Activité ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* CA potentiel donut */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">CA potentiel</h3>
            <p className="text-xs text-gray-400 mt-0.5">Répartition par statut des devis</p>
          </div>

          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : stats.caByStatus.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2">
              <FileText className="h-7 w-7 text-gray-200" />
              <p className="text-xs text-gray-400 text-center">Aucun devis encore créé</p>
              <button onClick={() => navigate('/devis')} className="text-xs text-brand-600 hover:underline">
                Créer un devis →
              </button>
            </div>
          ) : (
            <>
              {/* Total */}
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.caPotentiel)}
              </p>
              <p className="text-[11px] text-gray-400 mb-4">Total devis actifs</p>

              {/* Donut */}
              <div className="flex items-center gap-4">
                <PieChart width={88} height={88}>
                  <Pie
                    data={stats.caByStatus}
                    cx={44} cy={44}
                    innerRadius={26} outerRadius={42}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {stats.caByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>

                <div className="flex-1 space-y-2">
                  {stats.caByStatus.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-[11px] text-gray-500 flex-1">{d.name}</span>
                      <span className="text-[11px] font-bold text-gray-700">
                        {formatCurrency(d.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Taux de conversion par étape */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Taux de conversion</h3>
            <p className="text-xs text-gray-400 mt-0.5">Par transition clé du pipeline</p>
          </div>

          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="space-y-3">
              {stats.conversionSteps.map(step => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 truncate flex-1">{step.label}</span>
                    <span className={cn(
                      'text-xs font-bold shrink-0 ml-2',
                      step.rate >= 50 ? 'text-emerald-600' :
                      step.rate >= 20 ? 'text-amber-600' :
                      step.from === 0 ? 'text-gray-300' : 'text-red-500',
                    )}>
                      {step.from === 0 ? '—' : `${step.rate}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        step.rate >= 50 ? 'bg-emerald-400' :
                        step.rate >= 20 ? 'bg-amber-400' :
                        'bg-red-300',
                      )}
                      style={{ width: `${Math.min(step.rate, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-300 mt-0.5">{step.from} → {step.to}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activité récente */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-gray-400" /> Activité récente
            </h3>
            <button
              onClick={() => navigate('/prospection/prospects')}
              className="flex items-center gap-0.5 text-xs text-brand-600 hover:underline"
            >
              Tout voir <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.recentActivities.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="h-7 w-7 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Aucune activité récente</p>
            </div>
          ) : (
            <div className="space-y-0.5 -mx-2">
              {stats.recentActivities.map(a => (
                <ActivityItem
                  key={a.id}
                  type={a.type}
                  company={a.company}
                  description={a.description}
                  date={format(new Date(a.created_at), 'dd/MM', { locale: fr })}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Actions rapides + Statut temps réel ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Prospects',   icon: Users,         path: '/prospection/prospects',    color: 'hover:border-blue-300 hover:bg-blue-50',    iconColor: 'text-blue-500'   },
          { label: 'Pipeline',    icon: Zap,           path: '/prospection/pipeline',     color: 'hover:border-indigo-300 hover:bg-indigo-50', iconColor: 'text-indigo-500' },
          { label: 'Brouillons',  icon: Mail,          path: '/prospection/brouillons',   color: 'hover:border-violet-300 hover:bg-violet-50', iconColor: 'text-violet-500' },
          { label: 'Relances',    icon: Send,          path: '/prospection/relances',     color: 'hover:border-cyan-300 hover:bg-cyan-50',    iconColor: 'text-cyan-500'   },
          { label: 'Campagnes',   icon: Building2,     path: '/prospection/campagnes',    color: 'hover:border-teal-300 hover:bg-teal-50',    iconColor: 'text-teal-500'   },
          { label: 'Statistiques',icon: TrendingUp,    path: '/prospection/statistiques', color: 'hover:border-emerald-300 hover:bg-emerald-50',iconColor: 'text-emerald-500'},
        ].map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white',
                'transition-all hover:shadow-sm hover:-translate-y-px text-center',
                item.color,
              )}
            >
              <Icon className={cn('h-5 w-5', item.iconColor)} />
              <span className="text-xs font-semibold text-gray-700">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Real-time status footer ── */}
      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            isFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400',
          )} />
          <span>
            Supabase Realtime — mise à jour instantanée sur toutes les tables
          </span>
          <span className="text-gray-300">·</span>
          <span>Polling de secours toutes les {REFETCH_INTERVAL / 1000}s</span>
        </div>
        <button
          onClick={() => navigate('/prospection/statistiques')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors"
        >
          <Rocket className="h-3.5 w-3.5" />
          Statistiques avancées
        </button>
      </div>

    </Layout>
  )
}
