import { useState, useMemo } from 'react'
import { subDays } from 'date-fns'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell,
} from 'recharts'
import {
  UsersRound, Send, Trophy, TrendingUp, BellRing,
  Mail, Layers, AlertCircle, CheckCircle2, Clock, Target,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { cn, statusLabel } from '@/lib/utils'
import { useProspects } from '@/hooks/useProspects'
import { useEmailDrafts, useRelanceDrafts, computeRelanceStatus } from '@/hooks/useEmailDrafts'
import { useCampaigns } from '@/hooks/useCampagnes'
import type { ProspectStatus } from '@/types'

/* ─── Constants ───────────────────────────────────────────────────────────── */

type Period = '7d' | '30d' | 'all'

const STATUS_ORDER: ProspectStatus[] = [
  'new', 'researching', 'qualified', 'contacted', 'responded', 'meeting', 'converted', 'disqualified',
]

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

const PIE_COLORS = ['#0066FF', '#6366F1', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981']

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manuel', linkedin: 'LinkedIn', search: 'Recherche',
  referral: 'Parrainage', import: 'Import', other: 'Autre',
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; iconBg: string; iconColor: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-700 mb-3">{children}</h2>
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill ?? p.color }} className="font-medium">{p.value}</p>
      ))}
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-xs text-gray-300">{label}</div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export function ProspectionStatistiques() {
  const [period, setPeriod] = useState<Period>('all')

  const { data: prospects = [], isLoading: pLoading } = useProspects()
  const { data: allDrafts = [],  isLoading: dLoading } = useEmailDrafts()
  const { data: relances  = [] }                       = useRelanceDrafts()
  const { data: campaigns = [] }                       = useCampaigns()

  const isLoading = pLoading || dLoading

  /* ── Period cutoff ─────────────────────────────────────────────────────── */
  const cutoff = useMemo(() => {
    if (period === '7d')  return subDays(new Date(), 7).toISOString()
    if (period === '30d') return subDays(new Date(), 30).toISOString()
    return null
  }, [period])

  const fProspects = useMemo(
    () => cutoff ? prospects.filter(p => p.created_at >= cutoff) : prospects,
    [prospects, cutoff],
  )
  const regularDrafts = useMemo(() => {
    const drafts = cutoff ? allDrafts.filter(d => d.created_at >= cutoff) : allDrafts
    return drafts.filter(d => !(d.metadata as any)?.is_relance)
  }, [allDrafts, cutoff])

  /* ── KPIs ──────────────────────────────────────────────────────────────── */
  const kpis = useMemo(() => {
    const total     = fProspects.length
    const converted = fProspects.filter(p => p.status === 'converted').length
    const convRate  = total > 0 ? Math.round(converted / total * 100) : 0
    const avgScore  = total > 0
      ? Math.round(fProspects.reduce((s, p) => s + p.score, 0) / total)
      : 0
    const sentDrafts   = regularDrafts.filter(d => d.status === 'sent').length
    const campSent     = campaigns.reduce((s, c) => s + c.emails_sent, 0)
    const totalSent    = sentDrafts + campSent
    const totalReplies = campaigns.reduce((s, c) => s + c.replies, 0)
    const replyRate    = totalSent > 0 ? Math.round(totalReplies / totalSent * 100) : 0
    return { total, convRate, totalSent, replyRate, avgScore, converted }
  }, [fProspects, regularDrafts, campaigns])

  /* ── Funnel ────────────────────────────────────────────────────────────── */
  const funnelData = useMemo(() =>
    STATUS_ORDER.map(s => ({
      label: statusLabel(s),
      count: fProspects.filter(p => p.status === s).length,
      fill:  STATUS_COLORS[s],
    })),
    [fProspects],
  )

  /* ── Sources ───────────────────────────────────────────────────────────── */
  const sourcesData = useMemo(() => {
    const map: Record<string, number> = {}
    fProspects.forEach(p => { map[p.source] = (map[p.source] ?? 0) + 1 })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => ({ name: SOURCE_LABELS[key] ?? key, value }))
  }, [fProspects])

  /* ── Industries ────────────────────────────────────────────────────────── */
  const industriesData = useMemo(() => {
    const map: Record<string, number> = {}
    fProspects.forEach(p => { if (p.industry) map[p.industry] = (map[p.industry] ?? 0) + 1 })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [fProspects])

  /* ── Score distribution ────────────────────────────────────────────────── */
  const scoreData = useMemo(() => [
    { range: '0–20',  count: fProspects.filter(p => p.score <  20).length },
    { range: '20–40', count: fProspects.filter(p => p.score >= 20 && p.score < 40).length },
    { range: '40–60', count: fProspects.filter(p => p.score >= 40 && p.score < 60).length },
    { range: '60–80', count: fProspects.filter(p => p.score >= 60 && p.score < 80).length },
    { range: '80+',   count: fProspects.filter(p => p.score >= 80).length },
  ], [fProspects])

  /* ── Email drafts ──────────────────────────────────────────────────────── */
  const emailStats = useMemo(() => ({
    draft: regularDrafts.filter(d => d.status === 'draft').length,
    ready: regularDrafts.filter(d => d.status === 'ready').length,
    sent:  regularDrafts.filter(d => d.status === 'sent').length,
  }), [regularDrafts])

  /* ── Relances ──────────────────────────────────────────────────────────── */
  const relanceStats = useMemo(() => {
    const enriched = relances.map(r => ({ ...r, rs: computeRelanceStatus(r) }))
    return {
      total:   enriched.length,
      overdue: enriched.filter(r => r.rs === 'overdue').length,
      today:   enriched.filter(r => r.rs === 'due_today').length,
      pending: enriched.filter(r => r.rs === 'pending').length,
      sent:    enriched.filter(r => r.rs === 'sent').length,
      byDay: [3, 7, 15].map(day => ({
        day: `J+${day}`,
        total: enriched.filter(r => r.metadata.relance_day === day).length,
        sent:  enriched.filter(r => r.metadata.relance_day === day && r.status === 'sent').length,
      })),
    }
  }, [relances])

  /* ── Campaigns ─────────────────────────────────────────────────────────── */
  const campStats = useMemo(() => ({
    total:    campaigns.length,
    active:   campaigns.filter(c => c.status === 'active').length,
    sent:     campaigns.reduce((s, c) => s + c.emails_sent, 0),
    replies:  campaigns.reduce((s, c) => s + c.replies, 0),
    meetings: campaigns.reduce((s, c) => s + c.meetings, 0),
    clients:  campaigns.reduce((s, c) => s + c.clients, 0),
  }), [campaigns])

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <Layout title="Statistiques — Prospection IA">

      {/* Period selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {([['7d', '7 jours'], ['30d', '30 jours'], ['all', 'Tout']] as [Period, string][]).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                period === val
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
        {isLoading && <span className="text-xs text-gray-400">Chargement…</span>}
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Prospects"
          value={kpis.total}
          sub={`${kpis.converted} converti${kpis.converted !== 1 ? 's' : ''}`}
          icon={UsersRound}  iconBg="bg-brand-50"   iconColor="text-brand-500"
        />
        <KpiCard
          label="Emails envoyés"
          value={kpis.totalSent}
          sub="Brouillons + campagnes"
          icon={Send}        iconBg="bg-violet-50"  iconColor="text-violet-500"
        />
        <KpiCard
          label="Taux de réponse"
          value={`${kpis.replyRate}%`}
          sub={`${campaigns.reduce((s, c) => s + c.replies, 0)} réponses`}
          icon={TrendingUp}  iconBg="bg-emerald-50" iconColor="text-emerald-500"
        />
        <KpiCard
          label="Taux de conversion"
          value={`${kpis.convRate}%`}
          sub={`Score moyen : ${kpis.avgScore}/100`}
          icon={Trophy}      iconBg="bg-amber-50"   iconColor="text-amber-500"
        />
      </div>

      {/* ── Row 1: Funnel + Sources ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        <Card className="lg:col-span-2 p-4">
          <SectionTitle>Entonnoir de conversion</SectionTitle>
          {fProspects.length === 0
            ? <EmptyChart label="Aucun prospect pour cette période" />
            : (
              <ResponsiveContainer width="100%" height={224}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 96, right: 20, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={96} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        <Card className="p-4">
          <SectionTitle>Sources</SectionTitle>
          {sourcesData.length === 0
            ? <EmptyChart label="Aucune donnée" />
            : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sourcesData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3}>
                      {sourcesData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                          <p className="font-semibold text-gray-700">{payload[0].name}</p>
                          <p className="text-gray-500">{payload[0].value} prospect{(payload[0].value as number) > 1 ? 's' : ''}</p>
                        </div>
                      )
                    }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {sourcesData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 text-gray-600 truncate">{s.name}</span>
                      <span className="font-semibold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </Card>
      </div>

      {/* ── Row 2: Score + Industries ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <Card className="p-4">
          <SectionTitle>Distribution des scores</SectionTitle>
          {fProspects.length === 0
            ? <EmptyChart label="Aucun prospect" />
            : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={scoreData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#0066FF" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        <Card className="p-4">
          <SectionTitle>Secteurs d'activité</SectionTitle>
          {industriesData.length === 0
            ? <EmptyChart label="Aucune donnée" />
            : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={industriesData} layout="vertical" margin={{ left: 80, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>
      </div>

      {/* ── Row 3: Emails + Relances ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Emails */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Emails &amp; Brouillons</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Brouillons', value: emailStats.draft, cls: 'bg-gray-50 text-gray-700' },
              { label: 'Prêts',      value: emailStats.ready, cls: 'bg-amber-50 text-amber-700' },
              { label: 'Envoyés',    value: emailStats.sent,  cls: 'bg-emerald-50 text-emerald-700' },
            ].map(s => (
              <div key={s.label} className={cn('rounded-xl p-3 text-center', s.cls)}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[11px] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-50 pt-3 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3 w-3" /> Campagnes
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Total',    value: campStats.total },
                { label: 'Envoyés',  value: campStats.sent },
                { label: 'Réponses', value: campStats.replies },
                { label: 'Réunions', value: campStats.meetings },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Relances */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Relances automatiques</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'En retard',    value: relanceStats.overdue, icon: AlertCircle,  cls: 'text-red-600 bg-red-50' },
              { label: "Aujourd'hui", value: relanceStats.today,   icon: Clock,         cls: 'text-amber-600 bg-amber-50' },
              { label: 'En attente',   value: relanceStats.pending, icon: Target,        cls: 'text-brand-600 bg-brand-50' },
              { label: 'Envoyées',     value: relanceStats.sent,    icon: CheckCircle2,  cls: 'text-emerald-600 bg-emerald-50' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className={cn('rounded-xl p-2.5 text-center', s.cls)}>
                  <Icon className="h-4 w-4 mx-auto mb-1 opacity-70" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] font-medium leading-tight mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </div>
          {relanceStats.total === 0
            ? (
              <div className="flex items-center justify-center h-20 text-xs text-gray-300">
                Générez des relances pour voir les statistiques
              </div>
            )
            : (
              <>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Par séquence
                </p>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={relanceStats.byDay} margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">{label}</p>
                          {payload.map((p: any, i: number) => (
                            <p key={i} style={{ color: p.fill }} className="font-medium">
                              {p.name === 'total' ? 'Générés' : 'Envoyés'} : {p.value}
                            </p>
                          ))}
                        </div>
                      )
                    }} />
                    <Bar dataKey="total" name="total" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="sent"  name="sent"  fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="h-2 w-2 rounded-sm bg-slate-300 inline-block" /> Générés
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" /> Envoyés
                  </div>
                </div>
              </>
            )
          }
        </Card>
      </div>

      {/* ── Campaigns detail table ──────────────────────────────────────────── */}
      {campaigns.length > 0 && (
        <Card className="p-4">
          <SectionTitle>Détail des campagnes</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Campagne', 'Statut', 'Prospects', 'Envoyés', 'Réponses', 'Réunions', 'Clients'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">{c.name}</p>
                      {c.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{c.description}</p>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={cn(
                        'inline-flex text-[10px] font-semibold rounded-full px-2 py-0.5 border',
                        c.status === 'active'   ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                        c.status === 'paused'   ? 'text-amber-600 bg-amber-50 border-amber-200' :
                        c.status === 'archived' ? 'text-gray-500 bg-gray-50 border-gray-200' :
                                                   'text-brand-600 bg-brand-50 border-brand-200'
                      )}>
                        {{ active: 'Active', paused: 'En pause', archived: 'Archivée', draft: 'Brouillon' }[c.status]}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-gray-700">{c.enrolled?.length ?? 0}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-700">{c.emails_sent}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-brand-600 font-semibold">{c.replies}</span>
                      {c.emails_sent > 0 && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({Math.round(c.replies / c.emails_sent * 100)}%)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-emerald-600 font-semibold">{c.meetings}</td>
                    <td className="py-2.5 text-amber-600 font-semibold">{c.clients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </Layout>
  )
}
