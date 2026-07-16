import { useState, useEffect } from 'react'
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Zap, Wifi,
  WifiOff, Clock, Activity, BarChart2, ChevronDown, ChevronUp,
  ExternalLink, Wrench, Mail, Calendar, HardDrive, Sheet,
  Cpu, MapPin, Search, Building2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'
import {
  useIntegrationStatus, useTestConnections, useAutoFix,
  type ServiceId, type IntegrationLog, type SheetsSyncLog,
} from '@/hooks/useIntegrations'
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration'
import { hasSheetsScope } from '@/lib/googleOAuth'
import { useApifyConnection, useApifyRun } from '@/hooks/useApify'
import { ApifyClient, TERMINAL_STATUSES, type ApifyRun } from '@/connectors/connectors/apify-client'

// ── Service definitions ───────────────────────────────────────────────────────

interface ServiceDef {
  id: ServiceId
  label: string
  scope: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
}

const SERVICES: ServiceDef[] = [
  { id: 'gmail',    label: 'Gmail',         scope: 'gmail',        icon: Mail,        color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100' },
  { id: 'calendar', label: 'Google Agenda', scope: 'calendar',     icon: Calendar,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  { id: 'drive',    label: 'Google Drive',  scope: 'drive',        icon: HardDrive,   color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { id: 'sheets',   label: 'Google Sheets', scope: 'spreadsheets', icon: Sheet,       color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ ok, testing }: { ok: boolean | null; testing?: boolean }) {
  if (testing) return <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse inline-block" />
  if (ok === null) return <span className="h-2 w-2 rounded-full bg-gray-300 inline-block" />
  return <span className={cn('h-2 w-2 rounded-full inline-block', ok ? 'bg-emerald-500' : 'bg-red-500')} />
}

function StatusBadge({ ok, testing }: { ok: boolean | null; testing?: boolean }) {
  if (testing) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
      <RefreshCw className="h-2.5 w-2.5 animate-spin" />Test en cours
    </span>
  )
  if (ok === null) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <WifiOff className="h-2.5 w-2.5" />Non testé
    </span>
  )
  if (ok) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
      <CheckCircle2 className="h-2.5 w-2.5" />Actif
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
      <XCircle className="h-2.5 w-2.5" />Erreur
    </span>
  )
}

function ServiceIcon({ svc }: { svc: ServiceDef }) {
  const Icon = svc.icon
  return (
    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', svc.bg, svc.border, 'border')}>
      <Icon className={cn('h-5 w-5', svc.color)} />
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 bg-gray-50 rounded-lg min-w-[64px]">
      <span className="text-sm font-bold text-gray-800 leading-none">{value}</span>
      <span className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  )
}

function LogStatusChip({ status }: { status: string }) {
  if (status === 'success') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
      <CheckCircle2 className="h-3 w-3" />Succès
    </span>
  )
  if (status === 'warning' || status === 'partial') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50">
      <AlertTriangle className="h-3 w-3" />Partiel
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-red-700 bg-red-50">
      <XCircle className="h-3 w-3" />Erreur
    </span>
  )
}

function ServiceLabel({ service }: { service: string }) {
  const colors: Record<string, string> = {
    gmail: 'text-red-600 bg-red-50',
    calendar: 'text-blue-600 bg-blue-50',
    drive: 'text-yellow-700 bg-yellow-50',
    sheets: 'text-emerald-700 bg-emerald-50',
    google: 'text-brand-600 bg-brand-50',
  }
  const labels: Record<string, string> = {
    gmail: 'Gmail', calendar: 'Agenda', drive: 'Drive', sheets: 'Sheets', google: 'Google',
  }
  return (
    <span className={cn('inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full', colors[service] ?? 'text-gray-600 bg-gray-100')}>
      {labels[service] ?? service}
    </span>
  )
}

// ── Google Account Header ─────────────────────────────────────────────────────

function GoogleAccountCard({
  email,
  connectedAt,
  scope,
  onTest,
  onFix,
  onConnect,
  testing,
  fixing,
  hasErrors,
}: {
  email: string | null
  connectedAt: string | null
  scope: string | null
  onTest: () => void
  onFix: () => void
  onConnect: () => void
  testing: boolean
  fixing: boolean
  hasErrors: boolean
}) {
  const connected = !!email
  const services = [
    scope?.includes('gmail') && 'Gmail',
    scope?.includes('calendar') && 'Agenda',
    scope?.includes('drive') && 'Drive',
    scope?.includes('spreadsheets') && 'Sheets',
  ].filter(Boolean) as string[]

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-4">
        {/* Google G avatar */}
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #EA4335 100%)' }}
        >
          G
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{email ?? 'Non connecté'}</p>
            {connected
              ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-2.5 w-2.5" />Connecté</span>
              : <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"><WifiOff className="h-2.5 w-2.5" />Déconnecté</span>
            }
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {connectedAt && (
              <span className="text-xs text-gray-400">
                Connecté le {formatDate(connectedAt, 'dd/MM/yyyy')}
              </span>
            )}
            {services.length > 0 && (
              <div className="flex gap-1">
                {services.map(s => (
                  <span key={s} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasErrors && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onFix}
              disabled={fixing}
              className="gap-1.5"
            >
              <Wrench className={cn('h-3.5 w-3.5', fixing && 'animate-spin')} />
              {fixing ? 'Correction…' : 'Auto-corriger'}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onTest}
            disabled={testing}
            className="gap-1.5"
          >
            <Wifi className={cn('h-3.5 w-3.5', testing && 'animate-pulse')} />
            {testing ? 'Test…' : 'Tout tester'}
          </Button>
          {!connected && (
            <Button size="sm" onClick={onConnect} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />Connecter
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// ── Service Card ──────────────────────────────────────────────────────────────

function ServiceCard({
  svc,
  log,
  ops,
  onTest,
  testing,
  scope,
}: {
  svc: ServiceDef
  log: IntegrationLog | null
  ops: number
  onTest: () => void
  testing: boolean
  scope: string
}) {
  const [expanded, setExpanded] = useState(false)

  const hasScope = scope.includes(svc.scope)
  const lastOk = log ? log.status === 'success' : null
  const displayOk = hasScope ? lastOk : false
  const lastErr = log?.error_message ?? (!hasScope ? `Scope ${svc.label} manquant` : null)
  const needsReconnect = log?.details && (log.details as Record<string, unknown>).needs_reconnect === true
  const apiDisabled = log?.details && (log.details as Record<string, unknown>).api_disabled === true

  const details = log?.details as Record<string, unknown> | null

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <ServiceIcon svc={svc} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{svc.label}</h3>
            <StatusDot ok={displayOk} testing={testing} />
          </div>
          <StatusBadge ok={displayOk} testing={testing} />
        </div>
      </div>

      {/* Metrics */}
      <div className="flex gap-2 mb-4">
        <MetricPill label="Opérations" value={ops} />
        {log?.duration_ms != null && (
          <MetricPill label="Latence" value={`${log.duration_ms}ms`} />
        )}
      </div>

      {/* Last sync */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5 text-gray-300 shrink-0" />
          <span>{log ? `Testé ${formatDate(log.created_at, 'dd/MM HH:mm')}` : 'Jamais testé'}</span>
        </div>

        {/* Details */}
        {details && displayOk && (
          <div className="text-xs text-gray-400 pl-5 space-y-0.5">
            {Object.entries(details)
              .filter(([k]) => k !== 'note')
              .slice(0, 3)
              .map(([k, v]) => (
                <div key={k} className="flex gap-1">
                  <span className="capitalize">{k.replace(/_/g, ' ')} :</span>
                  <span className="text-gray-600 font-medium truncate">{String(v)}</span>
                </div>
              ))}
            {(details.note as string) && (
              <p className="text-gray-400 italic">{details.note as string}</p>
            )}
          </div>
        )}

        {/* Error */}
        {lastErr && (
          <div className="flex items-start gap-1.5 bg-red-50 rounded-lg px-2.5 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-px" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-700 leading-relaxed">{lastErr}</p>
              {apiDisabled && (
                <a
                  href={`https://console.developers.google.com/apis/api/sheets.googleapis.com/overview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 hover:text-red-700 mt-1"
                >
                  <ExternalLink className="h-2.5 w-2.5" />Activer l'API Sheets
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expand raw details */}
      {details && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Masquer les détails' : 'Afficher les détails'}
        </button>
      )}
      {expanded && details && (
        <pre className="text-[10px] bg-gray-50 rounded-lg p-2 overflow-auto mb-3 text-gray-600 max-h-24">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}

      {/* Test button */}
      <div className="mt-auto pt-2 border-t border-gray-50">
        <button
          onClick={onTest}
          disabled={testing}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Activity className={cn('h-3.5 w-3.5', testing && 'animate-pulse')} />
          {testing ? 'Test en cours…' : 'Tester la connexion'}
        </button>
      </div>
    </Card>
  )
}

// ── Unified Journal ───────────────────────────────────────────────────────────

interface UnifiedLog {
  id: string
  created_at: string
  service: string
  action: string
  status: string
  duration_ms: number | null
  error_message: string | null
  details: Record<string, unknown> | null
}

function buildUnifiedLogs(
  integrationLogs: IntegrationLog[],
  sheetsLogs: SheetsSyncLog[],
): UnifiedLog[] {
  const mapped: UnifiedLog[] = [
    ...integrationLogs.map(l => ({
      id: l.id,
      created_at: l.created_at,
      service: l.service,
      action: l.action,
      status: l.status,
      duration_ms: l.duration_ms,
      error_message: l.error_message,
      details: l.details,
    })),
    ...sheetsLogs.map(l => ({
      id: l.id,
      created_at: l.created_at,
      service: 'sheets',
      action: l.direction,
      status: l.status,
      duration_ms: l.duration_ms,
      error_message: null,
      details: {
        exportées: l.rows_exported,
        importées: l.rows_imported,
        créées: l.rows_created,
        mises_à_jour: l.rows_updated,
        erreurs: l.rows_failed,
      } as Record<string, unknown>,
    })),
  ]
  return mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function Journal({ logs }: { logs: UnifiedLog[] }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? logs : logs.slice(0, 20)

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-8 w-8 mx-auto mb-2 text-gray-200" />
        <p className="text-sm text-gray-400">Aucun événement — lancez un test pour commencer</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-2.5 font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500">Service</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500">Action</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500">Statut</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-500">Durée</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500">Détails</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(log => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                  {formatDate(log.created_at, 'dd/MM HH:mm:ss')}
                </td>
                <td className="px-4 py-2.5">
                  <ServiceLabel service={log.service} />
                </td>
                <td className="px-4 py-2.5 text-gray-600 font-medium capitalize">
                  {log.action.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-2.5">
                  <LogStatusChip status={log.status} />
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400">
                  {log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
                </td>
                <td className="px-4 py-2.5 text-gray-400 max-w-[220px] truncate">
                  {log.error_message
                    ? <span className="text-red-500">{log.error_message}</span>
                    : log.details
                    ? Object.entries(log.details)
                        .filter(([, v]) => v && v !== 0)
                        .slice(0, 3)
                        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                        .join(' · ')
                    : '—'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length > 20 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            {showAll ? `Afficher moins` : `Voir ${logs.length - 20} entrées supplémentaires`}
          </button>
        </div>
      )}
    </>
  )
}

// ── Apify Section ─────────────────────────────────────────────────────────────

const MAPS_ACTOR_ID = 'compass/crawler-google-places'

function ApifyRunStatus({ run, itemCount }: { run: ApifyRun; itemCount: number | null }) {
  const isRunning = !TERMINAL_STATUSES.includes(run.status)
  const isSuccess = run.status === 'SUCCEEDED'
  const isFailed  = !isRunning && !isSuccess

  const duration = run.finishedAt && run.startedAt
    ? Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
    : null

  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-3',
      isRunning ? 'bg-brand-50/50 border-brand-100'
      : isSuccess ? 'bg-emerald-50/50 border-emerald-100'
      : 'bg-red-50/50 border-red-100',
    )}>
      <div className="flex items-center gap-2">
        {isRunning && <RefreshCw className="h-4 w-4 text-brand-500 animate-spin" />}
        {isSuccess  && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {isFailed   && <XCircle className="h-4 w-4 text-red-500" />}
        <span className={cn(
          'text-sm font-semibold',
          isRunning ? 'text-brand-700' : isSuccess ? 'text-emerald-700' : 'text-red-700',
        )}>
          {isRunning ? 'Recherche en cours…'
          : isSuccess ? 'Recherche terminée'
          : `Erreur — ${run.status}`}
        </span>
        <span className="ml-auto text-[10px] text-gray-400 font-mono">{run.id.slice(0, 8)}…</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {itemCount !== null && (
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-sm font-bold text-gray-800">{itemCount}</span>
            <span className="text-xs text-gray-500">entreprises trouvées</span>
          </div>
        )}
        {duration !== null && (
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-sm font-bold text-gray-800">{duration}s</span>
            <span className="text-xs text-gray-500">durée</span>
          </div>
        )}
        {isRunning && (
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
            <Activity className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
            <span className="text-xs text-brand-600 font-medium">{run.status}</span>
          </div>
        )}
      </div>

      {isSuccess && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          Résultats disponibles. Allez dans <strong>Prospection &gt; Connecteurs</strong> pour les importer dans le CRM.
        </p>
      )}
    </div>
  )
}

function ApifySection() {
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem('apify_api_key') ?? '')
  const [savedKey, setSavedKey] = useState(() => localStorage.getItem('apify_api_key') ?? '')
  const [ville, setVille]       = useState('')
  const [secteur, setSecteur]   = useState('')
  const [limite, setLimite]     = useState(50)
  const [itemCount, setItemCount] = useState<number | null>(null)

  const conn   = useApifyConnection()
  const runner = useApifyRun(savedKey)

  // Auto-test saved key on mount
  useEffect(() => {
    if (savedKey) conn.test(savedKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch dataset item count when run succeeds
  useEffect(() => {
    if (runner.run?.status !== 'SUCCEEDED' || !savedKey) return
    const datasetId = runner.run.defaultDatasetId
    if (!datasetId) return
    const client = new ApifyClient(savedKey)
    client.getDatasetInfo(datasetId)
      .then(info => setItemCount(info.itemCount))
      .catch(() => {})
  }, [runner.run?.status, runner.run?.defaultDatasetId, savedKey])

  const handleSaveAndTest = () => {
    localStorage.setItem('apify_api_key', apiKey)
    setSavedKey(apiKey)
    conn.test(apiKey)
  }

  const handleLaunch = () => {
    if (!ville.trim() || !secteur.trim()) return
    setItemCount(null)
    runner.reset()
    runner.launch(MAPS_ACTOR_ID, {
      searchStringsArray:        [`${secteur} ${ville}`],
      locationQuery:             `${ville}, France`,
      maxCrawledPlacesPerSearch: limite,
    })
  }

  const isConnected = conn.status === 'connected'
  const canLaunch   = isConnected && !!ville.trim() && !!secteur.trim() && !runner.isRunning && !runner.isLaunching

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Prospection Automatique</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <Card>
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <Cpu className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900">Apify — Google Maps Scraper</h3>
              {conn.status === 'connected' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-2.5 w-2.5" />Connecté
                </span>
              )}
              {conn.status === 'testing' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />Test…
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {conn.status === 'connected' && conn.user
                ? `${conn.user.username} · ${conn.user.isPaidUser ? 'Compte payant' : 'Compte gratuit'} · ${conn.latency}ms`
                : 'Entrez votre clé API Apify pour activer la recherche Google Maps'}
            </p>
          </div>
        </div>

        {/* API Key */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Clé API Apify</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="apify_api_XXXXXXXXXXXXX"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition font-mono"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveAndTest}
              disabled={!apiKey.trim() || conn.status === 'testing'}
            >
              {conn.status === 'testing'
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Test…</>
                : <><Wifi className="h-3.5 w-3.5" />Tester</>
              }
            </Button>
          </div>
          {conn.status === 'error' && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 shrink-0" />{conn.error}
            </p>
          )}
          <p className="mt-1 text-[11px] text-gray-400">
            Trouvez votre clé sur <span className="font-medium text-gray-600">apify.com</span> → Settings → Integrations → API tokens
          </p>
        </div>

        {/* Search form */}
        {isConnected && (
          <>
            <div className="border-t border-gray-100 pt-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Paramètres de recherche Google Maps</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Ville</label>
                  <input
                    type="text"
                    value={ville}
                    onChange={e => setVille(e.target.value)}
                    placeholder="Ex : Dijon"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Secteur d'activité</label>
                  <input
                    type="text"
                    value={secteur}
                    onChange={e => setSecteur(e.target.value)}
                    placeholder="Ex : Restaurant"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Résultats max</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={limite}
                    onChange={e => setLimite(Number(e.target.value))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                  />
                </div>
              </div>

              {ville && secteur && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  Requête : <span className="font-semibold text-gray-700">"{secteur} {ville}"</span> · zone : <span className="font-semibold text-gray-700">{ville}, France</span> · limite : <span className="font-semibold text-gray-700">{limite}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLaunch}
                disabled={!canLaunch}
                className={cn(
                  'flex items-center gap-2 px-4 h-9 text-sm font-semibold rounded-lg transition',
                  canLaunch
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                )}
              >
                {runner.isLaunching
                  ? <><RefreshCw className="h-4 w-4 animate-spin" />Lancement…</>
                  : <><Search className="h-4 w-4" />Lancer la recherche</>
                }
              </button>
              {(runner.run !== null || runner.error) && (
                <button
                  onClick={() => { runner.reset(); setItemCount(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {runner.error && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />{runner.error}
              </div>
            )}

            {runner.run && (
              <div className="mt-4">
                <ApifyRunStatus run={runner.run} itemCount={itemCount} />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Integrations() {
  const { data: status, isLoading } = useIntegrationStatus()
  const { integration, isConnected, connect } = useGoogleIntegration()
  const testMutation = useTestConnections()
  const fixMutation = useAutoFix()

  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null)
  const [fixResult, setFixResult] = useState<{ success: boolean; msg: string } | null>(null)
  const [testingService, setTestingService] = useState<ServiceId | 'all' | null>(null)

  const logs = status?.logs ?? []
  const sheetsLogs = status?.sheets_logs ?? []
  const latestPerService = status?.latest_per_service ?? {}

  const scope = integration?.scope ?? ''

  // Count ops per service from logs
  const opsPerService = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.service] = (acc[l.service] ?? 0) + (l.operations_count ?? 1)
    return acc
  }, {})

  const hasErrors = SERVICES.some(svc => {
    const log = latestPerService[svc.id] ?? null
    return log?.status === 'error' || !scope.includes(svc.scope)
  })

  async function handleTestAll() {
    setTestingService('all')
    setTestResult(null)
    try {
      const r = await testMutation.mutateAsync(undefined)
      const allOk = r.results ? Object.values(r.results).every(s => s.ok) : false
      setTestResult({ success: allOk, msg: allOk ? 'Tous les services sont opérationnels' : 'Certains services ont des erreurs — consultez les cartes ci-dessous' })
    } catch (e) {
      setTestResult({ success: false, msg: e instanceof Error ? e.message : 'Erreur inconnue' })
    } finally {
      setTestingService(null)
    }
  }

  async function handleTestService(svc: ServiceId) {
    setTestingService(svc)
    try { await testMutation.mutateAsync(svc) }
    catch { /* handled in card */ }
    finally { setTestingService(null) }
  }

  async function handleFix() {
    setFixResult(null)
    try {
      const r = await fixMutation.mutateAsync()
      setFixResult({ success: r.success, msg: r.fixes.join(' · ') || (r.needs_reconnect ? 'Reconnexion requise' : 'OK') })
      if (r.success) setTimeout(handleTestAll, 500)
    } catch (e) {
      setFixResult({ success: false, msg: e instanceof Error ? e.message : 'Erreur' })
    }
  }

  const unifiedLogs = buildUnifiedLogs(logs, sheetsLogs)

  return (
    <Layout title="Intégrations">
      <div className="max-w-5xl mx-auto">

        {/* ── Compte Google ─────────────────────────────────────────────── */}
        <GoogleAccountCard
          email={integration?.email ?? null}
          connectedAt={integration?.connected_at ?? null}
          scope={scope}
          onTest={handleTestAll}
          onFix={handleFix}
          onConnect={connect}
          testing={testingService === 'all'}
          fixing={fixMutation.isPending}
          hasErrors={hasErrors}
        />

        {/* Result banners */}
        {testResult && (
          <div className={cn(
            'mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium',
            testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          )}>
            {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {testResult.msg}
          </div>
        )}
        {fixResult && (
          <div className={cn(
            'mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium',
            fixResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
          )}>
            {fixResult.success ? <Wrench className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            {fixResult.msg}
          </div>
        )}

        {/* ── Service cards 2×2 ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {SERVICES.map(svc => (
            <ServiceCard
              key={svc.id}
              svc={svc}
              log={latestPerService[svc.id] ?? null}
              ops={opsPerService[svc.id] ?? 0}
              onTest={() => handleTestService(svc.id)}
              testing={testingService === svc.id || testingService === 'all'}
              scope={scope}
            />
          ))}
        </div>

        {/* ── Journal ────────────────────────────────────────────────────── */}
        <Card padding={false}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Journal des synchronisations</h3>
            <span className="ml-auto text-xs text-gray-400">{unifiedLogs.length} entrée{unifiedLogs.length !== 1 ? 's' : ''}</span>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-10">Chargement…</p>
          ) : (
            <Journal logs={unifiedLogs} />
          )}
        </Card>

        {/* ── Apify ──────────────────────────────────────────────────────── */}
        <ApifySection />
      </div>
    </Layout>
  )
}
