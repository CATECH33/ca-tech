import { useState } from 'react'
import {
  BarChart3, RefreshCw, Download, Loader2, Play,
  TrendingUp, FileText, AlertTriangle, CheckCircle2,
  ChevronRight, Calendar,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { cn, formatCurrency } from '@/lib/utils'
import { useWeeklyReports, useTriggerWeeklyReport, type WeeklyReport, type WeeklySummary } from '@/hooks/useWeeklyReports'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWeek(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + 'T00:00:00Z')
  const end   = new Date(weekEnd   + 'T00:00:00Z')
  const optStart: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', timeZone: 'UTC' }
  const optEnd:   Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }
  return `${start.toLocaleDateString('fr-FR', optStart)} → ${end.toLocaleDateString('fr-FR', optEnd)}`
}

function weekNumber(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00Z')
  const startOfYear = new Date(d.getUTCFullYear(), 0, 1)
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000) + 1
  return `S${Math.ceil(dayOfYear / 7)}`
}

// ─── Carte rapport ────────────────────────────────────────────────────────────

function ReportCard({ report, onRegenerate, isRegenerating }: {
  report: WeeklyReport
  onRegenerate: () => void
  isRegenerating: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const s = report.summary_json as WeeklySummary | null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:border-gray-200">
      {/* Header de la carte */}
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <BarChart3 className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wide">
                {weekNumber(report.week_start)}
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate">
                {fmtWeek(report.week_start, report.week_end)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Généré le {new Date(report.generated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {report.email_sent_at && ' · Email envoyé'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {report.pdf_drive_url && (
            <a
              href={report.pdf_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </a>
          )}
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regénérer ce rapport"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition disabled:opacity-40"
          >
            {isRegenerating
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />
            }
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
          </button>
        </div>
      </div>

      {/* KPIs inline */}
      {s && (
        <div className="px-5 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'CA',           value: formatCurrency(s.ca_total),       color: 'text-brand-600'   },
            { label: 'Devis acceptés', value: `${s.devis.accepte}`,            color: 'text-emerald-600' },
            { label: 'Leads',        value: String(s.leads.total),             color: 'text-violet-600'  },
            { label: 'Impayés',      value: s.overdue_count > 0 ? `${s.overdue_count} (${formatCurrency(s.overdue_total)})` : '0', color: s.overdue_count > 0 ? 'text-red-600' : 'text-gray-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 font-medium">{kpi.label}</p>
              <p className={cn('text-sm font-bold mt-0.5', kpi.color)}>{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Détail étendu */}
      {expanded && s && (
        <div className="border-t border-gray-50 px-5 py-4 space-y-4">
          {/* Devis */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Devis</p>
            <div className="flex gap-4 text-xs">
              <span className="text-blue-600"><span className="font-bold">{s.devis.envoye}</span> envoyé(s)</span>
              <span className="text-emerald-600"><span className="font-bold">{s.devis.accepte}</span> accepté(s) — {formatCurrency(s.devis.totalAccepte)}</span>
              <span className="text-red-500"><span className="font-bold">{s.devis.refuse}</span> refusé(s)</span>
            </div>
          </div>

          {/* Leads */}
          {s.leads.total > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Leads par source</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(s.leads.bySource).map(([src, count]) => (
                  <span key={src} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full font-medium">
                    {src}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Commentaire IA */}
          {s.ai_comment && (
            <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-100">
              <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wide mb-2">Analyse IA</p>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.ai_comment}</p>
            </div>
          )}

          {/* Alertes impayés */}
          {s.overdue_count > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                {s.overdue_count} facture(s) en retard — total {formatCurrency(s.overdue_total)}
              </p>
            </div>
          )}

          {/* Actions email en attente */}
          {s.pending_actions > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <FileText className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <p className="text-xs text-orange-800 font-medium">
                {s.pending_actions} action(s) email en attente dans le digest
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function RapportsHebdo() {
  const { data: reports = [], isLoading, refetch, isFetching } = useWeeklyReports()
  const trigger = useTriggerWeeklyReport()
  const [triggerError, setTriggerError] = useState<string | null>(null)

  async function handleGenerate() {
    setTriggerError(null)
    try {
      await trigger.mutateAsync()
    } catch (err) {
      setTriggerError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const lastReport  = reports[0] ?? null
  const lastSummary = lastReport?.summary_json as WeeklySummary | null

  const totalCA  = reports.reduce((s, r) => s + ((r.summary_json as WeeklySummary | null)?.ca_total ?? 0), 0)
  const avgDevis = reports.length
    ? Math.round(reports.reduce((s, r) => s + ((r.summary_json as WeeklySummary | null)?.devis.accepte ?? 0), 0) / reports.length * 10) / 10
    : 0

  return (
    <Layout
      title="Rapports hebdomadaires"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Actualiser
          </button>
          <button
            onClick={handleGenerate}
            disabled={trigger.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition disabled:opacity-50"
          >
            {trigger.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Play className="h-3.5 w-3.5" />
            }
            Générer maintenant
          </button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Feedback */}
        {trigger.isSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-800 font-medium">Rapport généré avec succès — email envoyé à contact@ca-tech.fr</p>
          </div>
        )}
        {triggerError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-800 font-medium">{triggerError}</p>
          </div>
        )}

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Rapports générés', value: reports.length,             Icon: BarChart3,   color: 'text-brand-500',   bg: 'bg-brand-50'   },
            { label: 'CA total (20 sem)', value: formatCurrency(totalCA),   Icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Moy. devis/sem',   value: String(avgDevis),           Icon: FileText,    color: 'text-violet-500',  bg: 'bg-violet-50'  },
            { label: 'Impayés actuels',  value: lastSummary ? String(lastSummary.overdue_count) : '—', Icon: AlertTriangle, color: lastSummary?.overdue_count ? 'text-red-500' : 'text-gray-400', bg: lastSummary?.overdue_count ? 'bg-red-50' : 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
                <s.Icon className={cn('h-5 w-5', s.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-semibold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info cron */}
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            Génération automatique chaque <span className="font-semibold text-gray-700">dimanche à 20h (Paris)</span> via pg_cron.
            Le PDF est uploadé sur Google Drive et un email de récap est envoyé à contact@ca-tech.fr.
          </p>
        </div>

        {/* Liste rapports */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
            <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Aucun rapport disponible</p>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur "Générer maintenant" pour créer le premier rapport.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onRegenerate={handleGenerate}
                isRegenerating={trigger.isPending}
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}
