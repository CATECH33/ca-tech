import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import {
  UsersRound, Mail, Send, MessageSquare, Calendar, Trophy,
  TrendingUp, FilePen, RefreshCw, Plus, Sparkles, ArrowRight,
  Activity, Target, Zap, Globe, ShieldAlert, Star, Flame,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, formatDate, statusLabel } from '@/lib/utils'
import { useProspects, useProspectsRealtime, getAnalyse } from '@/hooks/useProspects'
import { useEmailDrafts } from '@/hooks/useEmailDrafts'
import { getAudit } from '@/hooks/useAudit'
import { getRecommendations } from '@/hooks/useRecommendations'
import { computeScoreCommercial } from '@/lib/scoreCommercial'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ProspectStatus } from '@/types'

/* ─── CONSTANTES ──────────────────────────────────────────────────────────── */

const REFETCH_INTERVAL = 30_000

const STATUS_COLORS: Record<string, string> = {
  new:          '#3B82F6',
  researching:  '#6366F1',
  qualified:    '#8B5CF6',
  contacted:    '#F59E0B',
  responded:    '#06B6D4',
  meeting:      '#14B8A6',
  converted:    '#10B981',
  disqualified: '#9CA3AF',
}

const SOURCE_COLORS = ['#0066FF', '#6366F1', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6']

const ACTIVITY_LABELS: Record<string, string> = {
  email_sent: 'Email envoyé', email_opened: 'Email ouvert', email_replied: 'Réponse reçue',
  call: 'Appel', meeting: 'Rendez-vous', note_added: 'Note ajoutée',
  status_changed: 'Statut modifié', score_updated: 'Score mis à jour',
  task_completed: 'Tâche terminée', contacted: 'Contacté',
}

const STATUS_ORDER: ProspectStatus[] = [
  'new', 'researching', 'qualified', 'contacted', 'responded', 'meeting', 'converted', 'disqualified',
]

/* ─── KPI CARD ────────────────────────────────────────────────────────────── */

function KpiCard({
  label, value, sub, icon: Icon, color, loading,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  loading?: boolean
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn('absolute inset-0 opacity-[0.04]', color)} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', color.replace('bg-', 'bg-').replace('-500', '-50'))}>
            <Icon className={cn('h-4 w-4', color.replace('bg-', 'text-'))} />
          </div>
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </Card>
  )
}

/* ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.value} {p.name && p.name !== 'count' ? p.name : ''}
        </p>
      ))}
    </div>
  )
}

/* ─── PAGE ────────────────────────────────────────────────────────────────── */

export function ProspectionDashboard() {
  const navigate = useNavigate()

  useProspectsRealtime()

  const {
    data: prospects = [], isLoading: pLoading, isFetching: pFetching, refetch: refetchP,
  } = useProspects({ refetchInterval: REFETCH_INTERVAL })

  const {
    data: drafts = [], isLoading: dLoading, isFetching: dFetching, refetch: refetchD,
  } = useEmailDrafts({ refetchInterval: REFETCH_INTERVAL })

  const isLoading  = pLoading || dLoading
  const isFetching = pFetching || dFetching
  const refetch    = () => { refetchP(); refetchD() }

  /* ── Computed stats ──────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total      = prospects.length
    const toContact  = prospects.filter(p => ['new', 'researching'].includes(p.status)).length
    const draftCount = drafts.filter(d => d.status !== 'sent' && d.status !== 'failed').length
    const sent       = drafts.filter(d => d.status === 'sent').length
    const responded  = prospects.filter(p => p.status === 'responded').length
    const meetings   = prospects.filter(p => p.status === 'meeting').length
    const converted  = prospects.filter(p => p.status === 'converted').length
    const convRate   = total > 0 ? Math.round(converted / total * 100) : 0

    /* Pipeline */
    const pipeline = STATUS_ORDER.map(s => ({
      label: statusLabel(s),
      count: prospects.filter(p => p.status === s).length,
      color: STATUS_COLORS[s],
    }))

    /* Score distribution */
    const scoreBands = [
      { range: '0 – 2', min: 0,   max: 20  },
      { range: '2 – 4', min: 20,  max: 40  },
      { range: '4 – 6', min: 40,  max: 60  },
      { range: '6 – 8', min: 60,  max: 80  },
      { range: '8 – 10', min: 80, max: 101 },
    ]
    const scoreData = scoreBands.map(b => ({
      range: b.range,
      count: prospects.filter(p => p.score >= b.min && p.score < b.max).length,
    }))

    /* Sources */
    const srcMap: Record<string, number> = {}
    prospects.forEach(p => { srcMap[p.source] = (srcMap[p.source] ?? 0) + 1 })
    const sourceData = Object.entries(srcMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name: statusLabel(name) || name, value }))

    /* Daily activity (last 14 days) */
    const today = new Date()
    const dailyData = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (13 - i))
      const dateStr = d.toISOString().slice(0, 10)
      return {
        date: format(d, 'dd/MM', { locale: fr }),
        prospects: prospects.filter(p => p.created_at.slice(0, 10) === dateStr).length,
        emails:    drafts.filter(dr => dr.created_at.slice(0, 10) === dateStr).length,
      }
    })

    /* Recent activities */
    const recentActivities = prospects
      .flatMap(p => p.activities.map(a => ({
        ...a,
        company: p.company_name,
        prospectId: p.id,
      })))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12)

    /* Drafts by tone */
    const toneMap: Record<string, number> = {}
    drafts.forEach(d => { toneMap[d.tone] = (toneMap[d.tone] ?? 0) + 1 })
    const toneData = Object.entries(toneMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name: ({ professional: 'Professionnel', formal: 'Formel', friendly: 'Amical', direct: 'Direct' } as Record<string, string>)[name] ?? name,
        value,
      }))

    return {
      total, toContact, draftCount, sent, responded, meetings, converted, convRate,
      pipeline, scoreData, sourceData, dailyData, recentActivities, toneData,
    }
  }, [prospects, drafts])

  /* ── AI stats ─────────────────────────────────────────────────────────────── */
  const aiStats = useMemo(() => {
    const withAnalyse   = prospects.filter(p => getAnalyse(p) !== null).length
    const withWebsite   = prospects.filter(p => !!p.website).length

    const auditedProspects = prospects.filter(p => getAudit(p) !== null)
    const noHttps = auditedProspects.filter(p =>
      getAudit(p)!.checks.find(c => c.id === 'https')?.value === false).length
    const noForm  = auditedProspects.filter(p =>
      getAudit(p)!.checks.find(c => c.id === 'form')?.value === false).length

    const commercialScores = prospects.map(p =>
      computeScoreCommercial(p, getAudit(p), getAnalyse(p)))
    const strongOpps   = commercialScores.filter(s => s.opportunity === 'very_high').length
    const knownScores  = commercialScores.filter(s => s.score > 0).map(s => s.score)
    const avgScore     = knownScores.length > 0
      ? Math.round(knownScores.reduce((a, b) => a + b, 0) / knownScores.length * 10) / 10
      : 0

    /* Priority breakdown */
    const priorityA = prospects.filter(p => getRecommendations(p)?.priority === 'A').length
    const priorityB = prospects.filter(p => getRecommendations(p)?.priority === 'B').length
    const priorityC = prospects.filter(p => getRecommendations(p)?.priority === 'C').length
    const priorityData = [
      { name: 'Priorité A', value: priorityA, color: '#10B981' },
      { name: 'Priorité B', value: priorityB, color: '#F59E0B' },
      { name: 'Priorité C', value: priorityC, color: '#9CA3AF' },
    ]

    /* Audit issues bar */
    const auditIssues = [
      { label: 'Sans HTTPS',      count: noHttps, color: '#EF4444' },
      { label: 'Sans formulaire', count: noForm,  color: '#F97316' },
      { label: 'Sans responsive', count: auditedProspects.filter(p =>
          getAudit(p)!.checks.find(c => c.id === 'responsive')?.value === false).length, color: '#F59E0B' },
      { label: 'Sans title SEO',  count: auditedProspects.filter(p =>
          getAudit(p)!.checks.find(c => c.id === 'title_tag')?.value === false).length, color: '#6366F1' },
      { label: 'Sans Analytics',  count: auditedProspects.filter(p =>
          getAudit(p)!.checks.find(c => c.id === 'analytics')?.value === false).length, color: '#8B5CF6' },
    ]

    /* Score commercial distribution */
    const commScoreBands = [
      { range: '0–2',  min: 0,  max: 2  },
      { range: '2–4',  min: 2,  max: 4  },
      { range: '4–6',  min: 4,  max: 6  },
      { range: '6–8',  min: 6,  max: 8  },
      { range: '8–10', min: 8,  max: 11 },
    ]
    const commScoreData = commScoreBands.map(b => ({
      range: b.range,
      count: commercialScores.filter(s => s.score >= b.min && s.score < b.max && s.score > 0).length,
    }))

    /* Score moyen par secteur */
    const sectorMap: Record<string, { total: number; count: number }> = {}
    prospects.forEach(p => {
      if (!p.industry) return
      const s = computeScoreCommercial(p, getAudit(p), getAnalyse(p))
      if (s.score === 0) return
      if (!sectorMap[p.industry]) sectorMap[p.industry] = { total: 0, count: 0 }
      sectorMap[p.industry].total += s.score
      sectorMap[p.industry].count++
    })
    const sectorData = Object.entries(sectorMap)
      .map(([sector, { total, count }]) => ({
        sector: sector.length > 18 ? sector.slice(0, 18) + '…' : sector,
        avg: Math.round(total / count * 10) / 10,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8)

    return {
      withAnalyse, withWebsite, noHttps, noForm, strongOpps, avgScore,
      audited: auditedProspects.length, priorityData, auditIssues, commScoreData, sectorData,
    }
  }, [prospects])

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <Layout
      title="Tableau de bord"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', isFetching ? 'bg-brand-400 animate-pulse' : 'bg-emerald-400')} />
            {isFetching ? 'Synchronisation…' : `Mis à jour toutes les ${REFETCH_INTERVAL / 1000}s`}
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

      {/* ── KPI CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Prospects"       value={stats.total}      sub="total dans la base"        icon={UsersRound}    color="bg-brand-500 text-brand-500"    loading={isLoading} />
        <KpiCard label="À contacter"     value={stats.toContact}  sub="Nouveau + En recherche"    icon={Target}        color="bg-amber-500 text-amber-500"    loading={isLoading} />
        <KpiCard label="Brouillons"      value={stats.draftCount} sub="prêts ou en cours"         icon={FilePen}       color="bg-violet-500 text-violet-500"  loading={isLoading} />
        <KpiCard label="Emails envoyés"  value={stats.sent}       sub="via le module Brouillons"  icon={Send}          color="bg-emerald-500 text-emerald-500" loading={isLoading} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Réponses"        value={stats.responded}  sub="prospects ayant répondu"   icon={MessageSquare} color="bg-cyan-500 text-cyan-500"      loading={isLoading} />
        <KpiCard label="Rendez-vous"     value={stats.meetings}   sub="RDV planifiés"             icon={Calendar}      color="bg-teal-500 text-teal-500"      loading={isLoading} />
        <KpiCard label="Clients signés"  value={stats.converted}  sub="prospects convertis"       icon={Trophy}        color="bg-orange-500 text-orange-500"  loading={isLoading} />
        <KpiCard
          label="Taux de conversion"
          value={`${stats.convRate}%`}
          sub={`${stats.converted} / ${stats.total} prospects`}
          icon={TrendingUp}
          color="bg-brand-500 text-brand-500"
          loading={isLoading}
        />
      </div>

      {/* ── KPI IA ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <h2 className="text-sm font-semibold text-gray-700">Intelligence commerciale</h2>
        <span className="text-[11px] text-gray-400 ml-1">Mise à jour en temps réel</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard
          label="Prospects analysés"
          value={aiStats.withAnalyse}
          sub={`sur ${prospects.length} total`}
          icon={Sparkles}
          color="bg-violet-500 text-violet-500"
          loading={isLoading}
        />
        <KpiCard
          label="Sites détectés"
          value={aiStats.withWebsite}
          sub="avec URL renseignée"
          icon={Globe}
          color="bg-brand-500 text-brand-500"
          loading={isLoading}
        />
        <KpiCard
          label="Sans HTTPS"
          value={aiStats.noHttps}
          sub={`sur ${aiStats.audited} audités`}
          icon={ShieldAlert}
          color="bg-red-500 text-red-500"
          loading={isLoading}
        />
        <KpiCard
          label="Sans formulaire"
          value={aiStats.noForm}
          sub="opportunité de contact"
          icon={Mail}
          color="bg-orange-500 text-orange-500"
          loading={isLoading}
        />
        <KpiCard
          label="Opport. fortes"
          value={aiStats.strongOpps}
          sub="score commercial < 4"
          icon={Flame}
          color="bg-emerald-500 text-emerald-500"
          loading={isLoading}
        />
        <KpiCard
          label="Score moyen"
          value={aiStats.avgScore > 0 ? `${aiStats.avgScore}/10` : '—'}
          sub="score commercial IA"
          icon={Star}
          color="bg-amber-500 text-amber-500"
          loading={isLoading}
        />
      </div>

      {/* ── CHARTS IA ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Priorités IA donut */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Priorités IA
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Répartition A / B / C</p>
          </div>
          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : aiStats.priorityData.every(d => d.value === 0) ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
              <Sparkles className="h-6 w-6 text-gray-200" />
              <p className="text-xs text-center">Générez des recommandations IA<br/>sur vos prospects</p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <PieChart width={100} height={100}>
                <Pie
                  data={aiStats.priorityData.filter(d => d.value > 0)}
                  cx={50} cy={50}
                  innerRadius={28} outerRadius={46}
                  dataKey="value"
                  strokeWidth={2} stroke="#fff"
                >
                  {aiStats.priorityData.filter(d => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {aiStats.priorityData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600 flex-1">{d.name}</span>
                    <span className="text-sm font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Problèmes audit bar */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" /> Problèmes détectés
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Sur {aiStats.audited} sites audités</p>
          </div>
          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : aiStats.audited === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
              <ShieldAlert className="h-6 w-6 text-gray-200" />
              <p className="text-xs text-center">Lancez l'audit sur vos<br/>prospects pour voir ici</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={aiStats.auditIssues}
                layout="vertical"
                margin={{ left: 0, right: 20, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} width={88} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="count" name="Prospects" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {aiStats.auditIssues.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Score commercial distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" /> Score commercial
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution /10 (opportunité inverse)</p>
          </div>
          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={aiStats.commScoreData} margin={{ left: -16, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="count" name="Prospects" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {aiStats.commScoreData.map((_, i) => {
                    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#EF4444']
                    return <Cell key={i} fill={colors[i] ?? '#0066FF'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span className="text-emerald-600">⬅ Fort potentiel</span>
            <span className="text-gray-400">Déjà équipé ➡</span>
          </div>
        </Card>
      </div>

      {/* Score moyen par secteur */}
      {aiStats.sectorData.length > 0 && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-brand-400" /> Score moyen par secteur
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Top {aiStats.sectorData.length} secteurs — score commercial /10</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={aiStats.sectorData} margin={{ left: -8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="sector" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="avg" name="Score moyen" radius={[4, 4, 0, 0]} maxBarSize={36} fill="#0066FF">
                {aiStats.sectorData.map((entry, i) => {
                  const color = entry.avg < 4 ? '#10B981' : entry.avg < 7 ? '#F59E0B' : '#9CA3AF'
                  return <Cell key={i} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── PIPELINE + SCORE ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Pipeline funnel */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Pipeline de prospection</h3>
              <p className="text-xs text-gray-400 mt-0.5">Répartition des prospects par statut</p>
            </div>
            <span className="text-xs text-gray-400">{stats.total} prospects</span>
          </div>
          {isLoading ? (
            <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
          ) : stats.pipeline.every(p => p.count === 0) ? (
            <div className="h-56 flex items-center justify-center text-sm text-gray-400">
              Aucun prospect — <button onClick={() => navigate('/prospection/prospects')} className="ml-1 text-brand-600 hover:underline">Ajouter le premier</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={stats.pipeline}
                layout="vertical"
                margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={90} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="count" name="Prospects" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {stats.pipeline.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Score distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Score IA
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution /10</p>
          </div>
          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.scoreData} margin={{ left: -16, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="count" name="Prospects" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {stats.scoreData.map((_, i) => {
                    const colors = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981']
                    return <Cell key={i} fill={colors[i] ?? '#0066FF'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-between text-[10px] text-gray-400 mt-2">
            <span>⬇ Faible</span><span>Élevé ⬆</span>
          </div>
        </Card>
      </div>

      {/* ── ACTIVITÉ + SOURCES ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Activité 14 jours */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Activité — 14 derniers jours</h3>
              <p className="text-xs text-gray-400 mt-0.5">Prospects ajoutés et brouillons créés</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-brand-600"><span className="h-2 w-2 rounded-full bg-brand-400" />Prospects</span>
              <span className="flex items-center gap-1 text-violet-600"><span className="h-2 w-2 rounded-full bg-violet-400" />Emails</span>
            </div>
          </div>
          {isLoading ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats.dailyData} margin={{ left: -16, right: 8, top: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="gProspects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0066FF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="prospects" name="Prospects" stroke="#0066FF" strokeWidth={2} fill="url(#gProspects)" dot={false} />
                <Area type="monotone" dataKey="emails" name="Emails" stroke="#8B5CF6" strokeWidth={2} fill="url(#gEmails)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Sources + Tons */}
        <div className="grid grid-rows-2 gap-4">

          {/* Sources donut */}
          <Card className="flex items-center gap-4">
            <div className="shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Sources</h3>
              {isLoading ? (
                <div className="h-24 w-24 rounded-full bg-gray-100 animate-pulse" />
              ) : stats.sourceData.length === 0 ? (
                <div className="h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center text-xs text-gray-300">Vide</div>
              ) : (
                <PieChart width={96} height={96}>
                  <Pie data={stats.sourceData} cx={48} cy={48} innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={2} stroke="#fff">
                    {stats.sourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              {stats.sourceData.slice(0, 5).map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                  <span className="text-xs text-gray-600 flex-1 truncate capitalize">{s.name}</span>
                  <span className="text-xs font-semibold text-gray-700">{s.value}</span>
                </div>
              ))}
              {stats.sourceData.length === 0 && (
                <p className="text-xs text-gray-400">Aucune donnée</p>
              )}
            </div>
          </Card>

          {/* Tons emails */}
          <Card className="flex items-center gap-4">
            <div className="shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tons emails</h3>
              {isLoading ? (
                <div className="h-24 w-24 rounded-full bg-gray-100 animate-pulse" />
              ) : stats.toneData.length === 0 ? (
                <div className="h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center text-xs text-gray-300">Vide</div>
              ) : (
                <PieChart width={96} height={96}>
                  <Pie data={stats.toneData} cx={48} cy={48} innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={2} stroke="#fff">
                    {stats.toneData.map((_, i) => (
                      <Cell key={i} fill={['#0066FF', '#14B8A6', '#F59E0B', '#EF4444'][i % 4]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              {stats.toneData.slice(0, 4).map((t, i) => (
                <div key={t.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: ['#0066FF', '#14B8A6', '#F59E0B', '#EF4444'][i % 4] }} />
                  <span className="text-xs text-gray-600 flex-1 truncate">{t.name}</span>
                  <span className="text-xs font-semibold text-gray-700">{t.value}</span>
                </div>
              ))}
              {stats.toneData.length === 0 && (
                <p className="text-xs text-gray-400">Aucun brouillon</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── ACTIVITÉ RÉCENTE + ACTIONS RAPIDES ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-gray-400" /> Activité récente
            </h3>
            <button onClick={() => navigate('/prospection/prospects')}
              className="text-xs text-brand-600 hover:underline flex items-center gap-0.5">
              Voir tout <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.recentActivities.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              Aucune activité — commencez à prospecter !
            </div>
          ) : (
            <div className="space-y-1">
              {stats.recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-3 py-2 px-2 rounded-xl hover:bg-gray-50 transition group">
                  <div className="h-6 w-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {ACTIVITY_LABELS[a.type] ?? a.type}
                      <span className="text-gray-400 font-normal"> · {a.company}</span>
                    </p>
                    {a.description && (
                      <p className="text-[11px] text-gray-400 truncate">{a.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                    {formatDate(a.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Actions rapides</h3>

          {[
            {
              label: 'Ajouter un prospect',
              desc: 'Nouveau dans le pipeline',
              icon: UsersRound,
              color: 'border-brand-200 hover:border-brand-400 hover:bg-brand-50',
              iconColor: 'text-brand-500',
              path: '/prospection/prospects',
            },
            {
              label: 'Qualifier un prospect',
              desc: 'Analyser le site web, score IA',
              icon: Sparkles,
              color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
              iconColor: 'text-amber-500',
              path: '/prospection/qualification',
            },
            {
              label: 'Nouveau brouillon',
              desc: 'Rédiger un email commercial',
              icon: FilePen,
              color: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50',
              iconColor: 'text-violet-500',
              path: '/prospection/brouillons',
            },
            {
              label: 'Voir les relances',
              desc: 'Suivre les prospects contactés',
              icon: Zap,
              color: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50',
              iconColor: 'text-teal-500',
              path: '/prospection/relances',
            },
          ].map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border bg-white transition text-left group',
                a.color,
              )}
            >
              <div className={cn('h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-none transition', a.color.includes('border-'))}>
                <a.icon className={cn('h-4 w-4', a.iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800">{a.label}</p>
                <p className="text-[11px] text-gray-400 truncate">{a.desc}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-gray-300 ml-auto shrink-0 group-hover:text-gray-500 transition" />
            </button>
          ))}

          {/* Auto-refresh indicator */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('h-2 w-2 rounded-full', isFetching ? 'bg-brand-400 animate-pulse' : 'bg-emerald-400')} />
              <p className="text-[11px] font-semibold text-gray-600">
                {isFetching ? 'Synchronisation…' : 'Données à jour'}
              </p>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Rafraîchissement automatique toutes les {REFETCH_INTERVAL / 1000}s.
              Connectez vos APIs pour alimenter automatiquement les KPIs.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
