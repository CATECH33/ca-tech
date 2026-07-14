import { useState, useCallback, useEffect } from 'react'
import {
  X, ExternalLink, CheckCircle2, XCircle, Loader2,
  Play, Square, ChevronDown, ChevronUp, Clock, AlertCircle,
  Wifi, WifiOff, RefreshCw, User, Zap, Download, SkipForward,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigureConnector, useConnectorLogs } from '@/hooks/useConnectors'
import {
  useApifyConnection, useApifyUserActors, useApifyRun, useApifyImport,
} from '@/hooks/useApify'
import type { ApifyRun } from '@/hooks/useApify'
import { CURATED_ACTORS, CATEGORY_LABEL } from '../../connectors/connectors/apify-actors'
import type { CuratedActor } from '../../connectors/connectors/apify-actors'
import { TERMINAL_STATUSES } from '../../connectors/connectors/apify-client'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(ms?: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000)  return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function runStatusLabel(status: ApifyRun['status']): string {
  const map: Record<ApifyRun['status'], string> = {
    'READY':      'Prêt',
    'RUNNING':    'En cours',
    'SUCCEEDED':  'Terminé',
    'FAILED':     'Échoué',
    'TIMING-OUT': 'Expiration imminente',
    'TIMED-OUT':  'Expiré',
    'ABORTING':   'Abandon en cours',
    'ABORTED':    'Abandonné',
  }
  return map[status] ?? status
}

function RunStatusBadge({ status }: { status: ApifyRun['status'] }) {
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const isSuccess  = status === 'SUCCEEDED'
  const isError    = ['FAILED', 'TIMED-OUT', 'ABORTED'].includes(status)
  const isRunning  = ['READY', 'RUNNING'].includes(status)
  const isAborting = status === 'ABORTING' || status === 'TIMING-OUT'

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
      isRunning  && 'bg-blue-50 text-blue-700',
      isSuccess  && 'bg-green-50 text-green-700',
      isError    && 'bg-red-50 text-red-700',
      isAborting && 'bg-amber-50 text-amber-700',
      !isRunning && !isSuccess && !isError && !isAborting && 'bg-gray-100 text-gray-600',
    )}>
      {(isRunning || isAborting) && <Loader2 className="h-3 w-3 animate-spin" />}
      {isSuccess && <CheckCircle2 className="h-3 w-3" />}
      {isError   && <XCircle className="h-3 w-3" />}
      {runStatusLabel(status)}
    </span>
  )
}

// ── Actor card ────────────────────────────────────────────────────────────────

function CuratedActorCard({
  actor,
  selected,
  onSelect,
}: {
  actor: CuratedActor
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-xl border transition-all',
        selected
          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-400'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      <div className="flex items-start gap-2">
        <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold shrink-0 mt-0.5', actor.badgeColor)}>
          {CATEGORY_LABEL[actor.category].slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{actor.name}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{actor.description}</p>
        </div>
        {selected && <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 font-mono truncate">{actor.id}</p>
    </button>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ApifyPanel({ onClose }: { onClose: () => void }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [apiKey, setApiKey]           = useState('')
  const [actorTab, setActorTab]       = useState<'catalog' | 'mine' | 'custom'>('catalog')
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [customActorId, setCustomId]  = useState('')
  const [inputJson, setInputJson]     = useState('')
  const [jsonError, setJsonError]     = useState<string | null>(null)
  const [showInput, setShowInput]     = useState(false)

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const { configure }                               = useConfigureConnector('apify')
  const { status, user, error: connErr, latency, test, reset: resetConn } = useApifyConnection()
  const { actors, loading: loadingActors, error: actorsErr, load: loadActors } = useApifyUserActors(apiKey)
  const { run, isLaunching, isAborting, isRunning, error: runErr, launch, abort, reset: resetRun } = useApifyRun(apiKey)
  const { status: importStatus, report, error: importErr, runImport, reset: resetImport } = useApifyImport(apiKey)
  const logs = useConnectorLogs('apify')

  // When switching to "Mes Actors" tab, auto-load if connected
  useEffect(() => {
    if (actorTab === 'mine' && status === 'connected' && actors.length === 0) {
      loadActors()
    }
  }, [actorTab, status, actors.length, loadActors])

  // Pre-fill input template when selecting a curated actor
  const handleSelectCurated = useCallback((actor: CuratedActor) => {
    setSelectedId(actor.id)
    setInputJson(JSON.stringify(actor.inputTemplate, null, 2))
    setJsonError(null)
  }, [])

  // ── Derived ─────────────────────────────────────────────────────────────────
  const effectiveActorId = actorTab === 'custom' ? customActorId : (selectedId ?? '')
  const canTest          = apiKey.trim().length > 0 && status !== 'testing'
  const canLaunch        = status === 'connected' && effectiveActorId.trim().length > 0 && !isRunning && !isLaunching

  const handleTest = useCallback(() => {
    resetConn()
    test(apiKey)
  }, [apiKey, test, resetConn])

  const handleSave = useCallback(() => {
    if (!apiKey.trim() || !effectiveActorId.trim()) return
    configure({ apiKey, actorId: effectiveActorId })
  }, [apiKey, effectiveActorId, configure])

  const handleLaunch = useCallback(() => {
    let input: Record<string, unknown> | undefined
    if (inputJson.trim()) {
      try {
        input = JSON.parse(inputJson)
        setJsonError(null)
      } catch {
        setJsonError('JSON invalide — vérifiez la syntaxe.')
        return
      }
    }
    handleSave()
    launch(effectiveActorId, input)
  }, [inputJson, effectiveActorId, handleSave, launch])

  // Live duration while running
  const [elapsed, setElapsed] = useState<number>(0)
  useEffect(() => {
    if (!run || !isRunning) { setElapsed(0); return }
    const start = new Date(run.startedAt).getTime()
    const t = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(t)
  }, [run?.startedAt, isRunning])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold bg-orange-100 text-orange-600 shrink-0">
            AP
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">Apify</h2>
            <p className="text-xs text-gray-500 truncate">Scraping web via acteurs Apify</p>
          </div>
          <a
            href="https://docs.apify.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            title="Documentation Apify"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── 1. Connexion ──────────────────────────────────────────────── */}
          <section>
            <SectionHeader label="Connexion" icon={<Wifi className="h-3.5 w-3.5" />} />
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Clé API Apify <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => { setApiKey(e.target.value); resetConn() }}
                    placeholder="apify_api_..."
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
                  />
                  <button
                    onClick={handleTest}
                    disabled={!canTest}
                    className="px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                  >
                    {status === 'testing'
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Zap className="h-3.5 w-3.5" />
                    }
                    Tester
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Console Apify → Paramètres → Clés API
                </p>
              </div>

              {/* Connection status */}
              {status === 'connected' && user && (
                <div className="flex items-center gap-2.5 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800">Connecté</p>
                    <p className="text-xs text-green-600">@{user.username}{latency ? ` · ${latency}ms` : ''}</p>
                  </div>
                  <User className="h-4 w-4 text-green-400" />
                </div>
              )}
              {status === 'error' && connErr && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <WifiOff className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Connexion échouée</p>
                    <p className="text-xs text-red-600 mt-0.5">{connErr}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── 2. Sélection Actor ────────────────────────────────────────── */}
          <section>
            <SectionHeader label="Sélection de l'Actor" icon={<Play className="h-3.5 w-3.5" />} />

            {/* Tabs */}
            <div className="flex border border-gray-200 rounded-lg p-0.5 mb-3 bg-gray-50">
              {(['catalog', 'mine', 'custom'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActorTab(tab)}
                  className={cn(
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-colors',
                    actorTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {tab === 'catalog' ? 'Catalogue' : tab === 'mine' ? 'Mes Actors' : 'ID libre'}
                </button>
              ))}
            </div>

            {/* Catalogue */}
            {actorTab === 'catalog' && (
              <div className="grid grid-cols-1 gap-2">
                {CURATED_ACTORS.map(actor => (
                  <CuratedActorCard
                    key={actor.id}
                    actor={actor}
                    selected={selectedId === actor.id}
                    onSelect={() => handleSelectCurated(actor)}
                  />
                ))}
              </div>
            )}

            {/* Mes Actors */}
            {actorTab === 'mine' && (
              <div className="space-y-2">
                {status !== 'connected' && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Connectez-vous d'abord pour charger vos actors.
                  </p>
                )}
                {status === 'connected' && (
                  <>
                    {loadingActors ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Chargement…
                      </div>
                    ) : actorsErr ? (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-xs text-red-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {actorsErr}
                      </div>
                    ) : actors.length === 0 ? (
                      <div className="text-center py-6 space-y-2">
                        <p className="text-xs text-gray-400">Aucun actor trouvé sur votre compte.</p>
                        <button
                          onClick={loadActors}
                          className="text-xs text-brand-600 hover:underline flex items-center gap-1 mx-auto"
                        >
                          <RefreshCw className="h-3 w-3" /> Réessayer
                        </button>
                      </div>
                    ) : (
                      actors.map(a => (
                        <button
                          key={a.id}
                          onClick={() => { setSelectedId(a.id); setInputJson('') }}
                          className={cn(
                            'w-full text-left p-3 rounded-xl border transition-all',
                            selectedId === a.id
                              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-400'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{a.title ?? a.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">{a.username}/{a.name}</p>
                            </div>
                            {selectedId === a.id && <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />}
                          </div>
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            )}

            {/* ID libre */}
            {actorTab === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Actor ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customActorId}
                  onChange={e => setCustomId(e.target.value)}
                  placeholder="apify/google-search-scraper"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Slug complet trouvable sur{' '}
                  <a href="https://apify.com/store" target="_blank" rel="noreferrer" className="underline hover:text-brand-600">
                    apify.com/store
                  </a>
                </p>
              </div>
            )}

            {/* Selected actor recap */}
            {effectiveActorId && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span className="text-xs text-gray-600">Actor sélectionné :</span>
                <span className="text-xs font-mono font-semibold text-gray-900 truncate">{effectiveActorId}</span>
              </div>
            )}
          </section>

          {/* ── 3. Paramètres (input JSON) ────────────────────────────────── */}
          <section>
            <button
              onClick={() => setShowInput(v => !v)}
              className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors w-full"
            >
              <Zap className="h-3.5 w-3.5" />
              Paramètres de l'Actor
              {showInput ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
            </button>

            {showInput && (
              <div className="mt-3 space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Input JSON (optionnel)
                </label>
                <textarea
                  value={inputJson}
                  onChange={e => { setInputJson(e.target.value); setJsonError(null) }}
                  rows={8}
                  placeholder={'{\n  "queries": ["agence web Paris"]\n}'}
                  className={cn(
                    'w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono resize-y',
                    jsonError ? 'border-red-300 bg-red-50' : 'border-gray-200',
                  )}
                />
                {jsonError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {jsonError}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ── 4. Statut d'exécution ─────────────────────────────────────── */}
          {run && (
            <section>
              <SectionHeader label="Exécution en cours" icon={<Clock className="h-3.5 w-3.5" />} />
              <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <RunStatusBadge status={run.status} />
                  {isRunning && (
                    <span className="text-sm tabular-nums text-gray-500 font-mono">
                      {formatDuration(elapsed)}
                    </span>
                  )}
                  {!isRunning && run.finishedAt && (
                    <span className="text-xs text-gray-400">
                      Fini à {formatTime(run.finishedAt)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Run ID</span>
                    <p className="font-mono text-gray-700 truncate">{run.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Démarré</span>
                    <p className="text-gray-700">{formatTime(run.startedAt)}</p>
                  </div>
                  {run.stats?.netRunDurationSecs != null && (
                    <div>
                      <span className="text-gray-400">Durée nette</span>
                      <p className="text-gray-700">{run.stats.netRunDurationSecs.toFixed(1)}s</p>
                    </div>
                  )}
                </div>

                {run.defaultDatasetId && run.status === 'SUCCEEDED' && (
                  <a
                    href={`https://console.apify.com/storage/datasets/${run.defaultDatasetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Voir les données dans Apify Console
                  </a>
                )}

                {isRunning && (
                  <button
                    onClick={abort}
                    disabled={isAborting}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    {isAborting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
                    Abandonner l'exécution
                  </button>
                )}

                {!isRunning && (
                  <button
                    onClick={() => { resetRun(); resetImport() }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {/* ── Import into CRM ───────────────────────────────────────── */}
              {run.status === 'SUCCEEDED' && run.defaultDatasetId && (
                <div className="mt-3 p-4 bg-brand-50 border border-brand-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-brand-600" />
                    <p className="text-sm font-semibold text-brand-900">Importer dans le CRM</p>
                  </div>

                  {importStatus === 'idle' && (
                    <button
                      onClick={() => runImport(run.defaultDatasetId, effectiveActorId)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Importer les résultats
                    </button>
                  )}

                  {(importStatus === 'fetching' || importStatus === 'mapping' || importStatus === 'writing') && (
                    <div className="flex items-center gap-2.5 py-1">
                      <Loader2 className="h-4 w-4 text-brand-600 animate-spin shrink-0" />
                      <p className="text-sm text-brand-700">
                        {importStatus === 'fetching' ? 'Récupération des données…'
                          : importStatus === 'mapping' ? 'Analyse des résultats…'
                          : 'Écriture dans la base de données…'}
                      </p>
                    </div>
                  )}

                  {importStatus === 'done' && report && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-white rounded-lg border border-brand-100">
                          <p className="text-lg font-bold text-green-600">{report.imported}</p>
                          <p className="text-[10px] text-gray-500">Importés</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-brand-100">
                          <p className="text-lg font-bold text-amber-500">{report.skipped}</p>
                          <p className="text-[10px] text-gray-500">
                            <SkipForward className="h-2.5 w-2.5 inline mr-0.5" />
                            Ignorés
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-brand-100">
                          <p className="text-lg font-bold text-red-500">{report.errors.length}</p>
                          <p className="text-[10px] text-gray-500">Erreurs</p>
                        </div>
                      </div>
                      {report.skipped > 0 && (
                        <p className="text-[11px] text-brand-600">
                          {report.skipped} prospect{report.skipped > 1 ? 's' : ''} ignoré{report.skipped > 1 ? 's' : ''} — déjà présent{report.skipped > 1 ? 's' : ''} dans le CRM.
                        </p>
                      )}
                      {report.errors.map((e, i) => (
                        <p key={i} className="text-[11px] text-red-600 font-mono">{e.code}: {e.message}</p>
                      ))}
                    </div>
                  )}

                  {importStatus === 'error' && importErr && (
                    <div className="flex items-start gap-2 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      {importErr}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── 5. Erreurs de lancement ───────────────────────────────────── */}
          {runErr && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Erreur de lancement</p>
                <p className="text-xs text-red-600 mt-0.5">{runErr}</p>
              </div>
            </div>
          )}

          {/* ── 6. Journal Apify ──────────────────────────────────────────── */}
          {logs.length > 0 && (
            <section>
              <SectionHeader label="Journal Apify" icon={<Clock className="h-3.5 w-3.5" />} />
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">Statut</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">Op.</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">Heure</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">Durée</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">Erreurs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.slice(0, 10).map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2">
                          <span className={cn(
                            'inline-block w-1.5 h-1.5 rounded-full',
                            entry.status === 'running'  && 'bg-blue-400 animate-pulse',
                            entry.status === 'success'  && 'bg-green-500',
                            entry.status === 'partial'  && 'bg-amber-400',
                            entry.status === 'error'    && 'bg-red-500',
                          )} />
                        </td>
                        <td className="px-3 py-2 capitalize text-gray-600">{entry.operation}</td>
                        <td className="px-3 py-2 text-gray-500 tabular-nums">{formatTime(entry.started_at)}</td>
                        <td className="px-3 py-2 text-gray-500 tabular-nums">{formatDuration(entry.duration_ms)}</td>
                        <td className="px-3 py-2">
                          {entry.errors?.length
                            ? <span className="text-red-500">{entry.errors.length} erreur{entry.errors.length > 1 ? 's' : ''}</span>
                            : <span className="text-gray-300">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Error details */}
              {logs.some(e => e.errors?.length) && (
                <div className="mt-3 space-y-2">
                  {logs.slice(0, 5).flatMap(e => e.errors ?? []).slice(0, 5).map((err, i) => (
                    <div key={i} className="p-2.5 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs font-mono font-semibold text-red-700">{err.code}</p>
                      <p className="text-xs text-red-600 mt-0.5">{err.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Footer actions ───────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2 shrink-0">
          <button
            onClick={handleLaunch}
            disabled={!canLaunch || isLaunching}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {isLaunching
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Lancement…</>
              : <><Play className="h-4 w-4" /> Lancer l'Actor</>
            }
          </button>

          {!canLaunch && !isRunning && (
            <p className="text-center text-[11px] text-gray-400">
              {status !== 'connected'
                ? 'Testez votre connexion pour activer le lancement.'
                : 'Sélectionnez un Actor pour lancer.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
