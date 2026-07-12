import { useState } from 'react'
import {
  RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle,
  Sheet, Clock, ArrowUpFromLine, ArrowDownToLine, ArrowLeftRight,
  Rows3, Zap,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn, formatDate } from '@/lib/utils'
import { useSyncStatus, useSyncNow, type SyncAction, type SyncLog } from '@/hooks/useSheetsSync'
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration'
import { hasSheetsScope } from '@/lib/googleOAuth'

// ── Helpers ───────────────────────────────────────────────────────────────────

function DirLabel({ dir }: { dir: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    sync:   { label: 'Sync bidirectionnelle', icon: ArrowLeftRight,  cls: 'text-brand-600 bg-brand-50' },
    export: { label: 'Export → Sheets',       icon: ArrowUpFromLine, cls: 'text-violet-600 bg-violet-50' },
    import: { label: 'Import ← Sheets',       icon: ArrowDownToLine, cls: 'text-amber-600 bg-amber-50' },
  }
  const d = map[dir] ?? map.sync
  const Icon = d.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', d.cls)}>
      <Icon className="h-3 w-3" />{d.label}
    </span>
  )
}

function StatusChip({ status }: { status: SyncLog['status'] }) {
  if (status === 'success') return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50"><CheckCircle2 className="h-3 w-3" />Succès</span>
  if (status === 'partial') return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50"><AlertTriangle className="h-3 w-3" />Partiel</span>
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-red-700 bg-red-50"><XCircle className="h-3 w-3" />Erreur</span>
}

function StatBox({ value, label, cls = '' }: { value: string | number; label: string; cls?: string }) {
  return (
    <div className="text-center px-4 py-3 bg-gray-50 rounded-xl">
      <p className={cn('text-xl font-bold leading-none', cls)}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProspectionParametres() {
  const [syncAction, setSyncAction] = useState<SyncAction>('sync')
  const [lastResult, setLastResult] = useState<{ success: boolean; msg: string } | null>(null)

  const { integration: googleIntegration, isConnected: isGoogleConnected, connect: connectGoogle } = useGoogleIntegration()
  const { data: syncData, isLoading: statusLoading } = useSyncStatus()
  const syncNow = useSyncNow()

  const config = syncData?.config ?? null
  const logs   = syncData?.logs ?? []

  const hasSheetsAccess = isGoogleConnected && hasSheetsScope(googleIntegration?.scope ?? '')

  async function handleSync() {
    setLastResult(null)
    try {
      const r = await syncNow.mutateAsync(syncAction)
      setLastResult({
        success: r.success,
        msg: r.success
          ? `${r.rows_exported} exportées, ${r.rows_created} créées, ${r.rows_updated} mises à jour`
          : `${r.rows_failed} erreur(s)`,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue'
      setLastResult({ success: false, msg })
    }
  }

  const isPending = syncNow.isPending

  return (
    <Layout title="Paramètres — Prospection IA">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Google Sheets Card ─────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Sheet className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Google Sheets — Synchronisation prospects</h3>
              <p className="text-xs text-gray-400 mt-0.5">Synchronisation bidirectionnelle entre CA-TECH Manager et un Google Sheets dédié.</p>
            </div>
            {config?.spreadsheet_url && (
              <a
                href={config.spreadsheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Ouvrir le sheet <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Auth warning */}
          {!isGoogleConnected && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Google non connecté</p>
                <p className="text-xs text-amber-600 mt-0.5">Connectez votre compte Google depuis <strong>Paramètres &gt; Intégrations</strong>.</p>
              </div>
            </div>
          )}

          {isGoogleConnected && !hasSheetsAccess && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800">Autorisation Google Sheets manquante</p>
                <p className="text-xs text-amber-600 mt-0.5 mb-2">Le scope Sheets n'a pas encore été accordé. Reconnectez votre compte pour l'activer.</p>
                <button
                  onClick={connectGoogle}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Zap className="h-3.5 w-3.5" /> Reconnecter Google
                </button>
              </div>
            </div>
          )}

          {/* Last sync status */}
          {config?.last_sync_at && (
            <div className="mb-5 grid grid-cols-3 gap-3">
              <StatBox
                value={formatDate(config.last_sync_at, 'dd/MM/yy HH:mm')}
                label="Dernière sync"
              />
              <StatBox
                value={config.last_sync_rows ?? 0}
                label="Lignes synchronisées"
                cls="text-brand-600"
              />
              <StatBox
                value={config.last_sync_errors ?? 0}
                label="Erreurs"
                cls={(config.last_sync_errors ?? 0) > 0 ? 'text-red-500' : 'text-emerald-600'}
              />
            </div>
          )}

          {/* Sync action selector */}
          <div className="flex items-center gap-2 mb-4">
            {(['sync', 'export', 'import'] as const).map(a => (
              <button
                key={a}
                onClick={() => setSyncAction(a)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                  syncAction === a
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white',
                )}
              >
                {a === 'sync'   && <><ArrowLeftRight className="h-3.5 w-3.5" />Bidirectionnel</>}
                {a === 'export' && <><ArrowUpFromLine className="h-3.5 w-3.5" />Exporter</>}
                {a === 'import' && <><ArrowDownToLine className="h-3.5 w-3.5" />Importer</>}
              </button>
            ))}
          </div>

          {/* Mode description */}
          <p className="text-xs text-gray-400 mb-4 px-1">
            {syncAction === 'sync'   && 'Les modifications du sheet sont importées dans CA-TECH, puis tous les prospects sont exportés vers le sheet.'}
            {syncAction === 'export' && 'Tous les prospects CA-TECH sont écrits dans le Google Sheet (écrase les données existantes).'}
            {syncAction === 'import' && 'Les nouvelles lignes et modifications du sheet sont importées dans CA-TECH.'}
          </p>

          {/* Sync button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSync}
              disabled={isPending || !hasSheetsAccess}
              className="flex-1"
            >
              <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
              {isPending ? 'Synchronisation en cours…' : 'Synchroniser maintenant'}
            </Button>
          </div>

          {/* Result */}
          {lastResult && (
            <div className={cn(
              'mt-3 p-3 rounded-xl flex items-center gap-2 text-xs font-medium',
              lastResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
            )}>
              {lastResult.success
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <XCircle className="h-4 w-4 shrink-0" />}
              {lastResult.msg}
            </div>
          )}
        </Card>

        {/* ── Historique des synchronisations ───────────────────────────────── */}
        <Card padding={false}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Historique des synchronisations</h3>
            <span className="ml-auto text-xs text-gray-400">{logs.length} entrée{logs.length > 1 ? 's' : ''}</span>
          </div>

          {statusLoading ? (
            <p className="text-sm text-gray-400 text-center py-10">Chargement…</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-10">
              <Rows3 className="h-8 w-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Aucune synchronisation effectuée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Direction</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Statut</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Exportées</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Créées</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">MàJ</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Erreurs</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {formatDate(log.created_at, 'dd/MM/yy HH:mm')}
                      </td>
                      <td className="px-4 py-2.5">
                        <DirLabel dir={log.direction} />
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusChip status={log.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-700">
                        {log.rows_exported > 0 ? log.rows_exported : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-600">
                        {log.rows_created > 0 ? `+${log.rows_created}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-brand-600">
                        {log.rows_updated > 0 ? log.rows_updated : '—'}
                      </td>
                      <td className={cn('px-4 py-2.5 text-right font-medium', log.rows_failed > 0 ? 'text-red-500' : 'text-gray-300')}>
                        {log.rows_failed > 0 ? log.rows_failed : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-400">
                        {log.duration_ms != null ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </Layout>
  )
}
