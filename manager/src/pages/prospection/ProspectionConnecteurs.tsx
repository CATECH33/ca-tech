import { useState, useCallback } from 'react'
import { X, ExternalLink, CheckCircle2, XCircle, Loader2, Play, RefreshCw, Pencil, Trash2, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConnectors, useConnectorRunning, useConnectorLogs, useTestConnector, useRunImport, useRunSync, useConfigureConnector } from '@/hooks/useConnectors'
import type { ConnectorId, ConnectorMeta, ConfigField, ConnectorConfig } from '../../connectors/types'
import type { ConnectorLogEntry } from '../../connectors/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function capabilityLabel(cap: string) {
  return cap === 'import' ? 'Import' : cap === 'sync' ? 'Sync' : 'Mise à jour'
}

function statusDot(entry: ConnectorLogEntry) {
  if (entry.status === 'running')  return <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
  if (entry.status === 'success')  return <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
  if (entry.status === 'partial')  return <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
  return <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
}

function formatDuration(ms?: number) {
  if (ms === undefined) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Config form ───────────────────────────────────────────────────────────────

function ConfigField({ field, value, onChange }: {
  field: ConfigField
  value: string
  onChange: (v: string) => void
}) {
  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          <option value="">— Choisir —</option>
          {field.options?.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {field.hint && <p className="text-[11px] text-gray-400 mt-1">{field.hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
        value={value}
        placeholder={field.placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      {field.hint && <p className="text-[11px] text-gray-400 mt-1">{field.hint}</p>}
    </div>
  )
}

// ── Config slide-over ─────────────────────────────────────────────────────────

function ConfigPanel({ meta, onClose }: { meta: ConnectorMeta; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const { configure, isConfigured } = useConfigureConnector(meta.id)
  const { result: testResult, test } = useTestConnector(meta.id)
  const running = useConnectorRunning(meta.id)
  const { run: runImport, result: importResult } = useRunImport(meta.id)
  const { run: runSync,   result: syncResult }   = useRunSync(meta.id)

  const handleSave = useCallback(() => {
    const config: ConnectorConfig = {}
    meta.configFields.forEach(f => {
      if (values[f.key]) config[f.key] = f.type === 'number' ? Number(values[f.key]) : values[f.key]
    })
    configure(config)
  }, [values, meta.configFields, configure])

  const handleTest = useCallback(async () => {
    handleSave()
    await test()
  }, [handleSave, test])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className={cn('inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold', meta.color)}>
            {meta.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{meta.name}</h2>
            <p className="text-xs text-gray-500 truncate">{meta.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {meta.configFields.length === 0 ? (
            <p className="text-sm text-gray-500">Ce connecteur ne nécessite pas de configuration.</p>
          ) : (
            meta.configFields.map(field => (
              <ConfigField
                key={field.key}
                field={field}
                value={values[field.key] ?? ''}
                onChange={v => setValues(prev => ({ ...prev, [field.key]: v }))}
              />
            ))
          )}

          {/* Test result */}
          {testResult && (
            <div className={cn(
              'flex items-start gap-2 p-3 rounded-lg text-sm',
              testResult.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            )}>
              {testResult.ok
                ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              }
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm space-y-1">
              <p className="font-medium">Résultat de l'import</p>
              <p>{importResult.imported} importés · {importResult.skipped} ignorés · {importResult.errors.length} erreurs</p>
            </div>
          )}
          {syncResult && (
            <div className="p-3 rounded-lg bg-teal-50 text-teal-800 text-sm space-y-1">
              <p className="font-medium">Résultat de la synchronisation</p>
              <p>{syncResult.created} créés · {syncResult.updated} mis à jour · {syncResult.errors.length} erreurs</p>
            </div>
          )}

          {/* Docs link */}
          {meta.docsUrl && (
            <a
              href={meta.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Documentation officielle
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Enregistrer
            </button>
            <button
              onClick={handleTest}
              disabled={running.isTesting}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {running.isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Tester
            </button>
          </div>
          {meta.capabilities.includes('import') && (
            <button
              onClick={() => { handleSave(); runImport() }}
              disabled={running.isImporting || !isConfigured}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              {running.isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Lancer l'import
            </button>
          )}
          {meta.capabilities.includes('sync') && (
            <button
              onClick={() => { handleSave(); runSync({ mode: 'incremental', conflictResolution: 'skip' }) }}
              disabled={running.isSyncing || !isConfigured}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              {running.isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Synchroniser
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Connector card ────────────────────────────────────────────────────────────

function ConnectorCard({ meta, onConfigure }: { meta: ConnectorMeta; onConfigure: () => void }) {
  const running  = useConnectorRunning(meta.id)
  const { isConfigured } = useConfigureConnector(meta.id)
  const logs     = useConnectorLogs(meta.id)
  const lastLog  = logs[0]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <span className={cn('inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0', meta.color)}>
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{meta.name}</h3>
            {isConfigured && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-green-50 text-green-700 rounded-full px-1.5 py-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Configuré
              </span>
            )}
            {running.isAnyRunning && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full px-1.5 py-0.5">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                En cours
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{meta.description}</p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {meta.capabilities.map(cap => (
          <span key={cap} className="text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
            {capabilityLabel(cap)}
          </span>
        ))}
        {!meta.requiresAuth && (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
            Sans auth
          </span>
        )}
      </div>

      {/* Last log */}
      {lastLog && (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
          {statusDot(lastLog)}
          <span className="capitalize">{lastLog.operation}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{formatTime(lastLog.started_at)}</span>
          {lastLog.duration_ms !== undefined && (
            <span className="text-gray-300">({formatDuration(lastLog.duration_ms)})</span>
          )}
        </div>
      )}

      {/* Action */}
      <button
        onClick={onConfigure}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-brand-50 hover:text-brand-700 text-gray-700 text-sm font-medium rounded-xl transition-colors group-hover:border-brand-100"
      >
        <Pencil className="h-3.5 w-3.5" />
        Configurer
        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
      </button>
    </div>
  )
}

// ── Log journal ───────────────────────────────────────────────────────────────

function LogJournal() {
  const logs = useConnectorLogs()

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        Aucune opération enregistrée. Configurez un connecteur et lancez un import.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="pb-2 pr-4 font-medium">Statut</th>
            <th className="pb-2 pr-4 font-medium">Connecteur</th>
            <th className="pb-2 pr-4 font-medium">Opération</th>
            <th className="pb-2 pr-4 font-medium">Démarré</th>
            <th className="pb-2 pr-4 font-medium">Durée</th>
            <th className="pb-2 pr-4 font-medium">Résultats</th>
            <th className="pb-2 font-medium">Erreurs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {logs.map(entry => (
            <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-2.5 pr-4">{statusDot(entry)}</td>
              <td className="py-2.5 pr-4 font-medium text-gray-800">{entry.connector_id}</td>
              <td className="py-2.5 pr-4 capitalize text-gray-600">{entry.operation}</td>
              <td className="py-2.5 pr-4 text-gray-500 tabular-nums">{formatTime(entry.started_at)}</td>
              <td className="py-2.5 pr-4 text-gray-500 tabular-nums">{formatDuration(entry.duration_ms)}</td>
              <td className="py-2.5 pr-4 text-gray-500 tabular-nums">
                {entry.items_ok !== undefined
                  ? `${entry.items_ok}/${entry.items_total ?? '?'}`
                  : '—'}
              </td>
              <td className="py-2.5 text-gray-500">
                {entry.errors?.length
                  ? <span className="text-red-500">{entry.errors.length} erreur{entry.errors.length > 1 ? 's' : ''}</span>
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProspectionConnecteurs() {
  const connectors = useConnectors()
  const [selected, setSelected] = useState<ConnectorId | null>(null)

  const selectedMeta = selected ? connectors.find(c => c.id === selected) : null

  const byCategory = connectors.reduce<Record<string, ConnectorMeta[]>>((acc, c) => {
    const group = acc[c.category] ?? []
    group.push(c)
    acc[c.category] = group
    return acc
  }, {})

  const categoryLabel: Record<string, string> = {
    scraping: 'Scraping & Réseaux sociaux',
    maps:     'Cartographie',
    sheets:   'Tableurs connectés',
    files:    'Fichiers',
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connecteurs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Importez et synchronisez vos prospects depuis n'importe quelle source. Les services ne sont pas encore connectés — configurez vos clés pour activer chaque connecteur.
        </p>
      </div>

      {/* Connector grid grouped by category */}
      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{categoryLabel[cat] ?? cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(meta => (
              <ConnectorCard key={meta.id} meta={meta} onConfigure={() => setSelected(meta.id)} />
            ))}
          </div>
        </section>
      ))}

      {/* Log journal */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Journal des opérations</h2>
          <span className="text-xs text-gray-400">200 entrées max · en mémoire</span>
        </div>
        <LogJournal />
      </section>

      {/* Config slide-over */}
      {selectedMeta && (
        <ConfigPanel meta={selectedMeta} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
