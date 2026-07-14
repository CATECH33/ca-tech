import { useState, useMemo } from 'react'
import {
  BellRing, RefreshCw, Clock, CheckCircle2, AlertCircle,
  Calendar, ChevronRight, X, Send, Trash2, Save, Sparkles, Building2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { cn } from '@/lib/utils'
import {
  useRelanceDrafts, useGenerateRelances, useSetDraftStatus,
  useUpdateDraft, useDeleteDraft, useAllProspects,
  computeRelanceStatus,
  type RelanceDraft,
} from '@/hooks/useEmailDrafts'

type RelanceStatus = 'overdue' | 'due_today' | 'pending' | 'sent'
type TabId = 'all' | 'overdue' | 'today' | 'pending' | 'sent' | 'togenerate'

interface EnrichedRelance extends RelanceDraft { rs: RelanceStatus }

interface ProspectGroup {
  prospect_id: string
  company_name: string
  industry?: string | null
  relances: EnrichedRelance[]
}

const STATUS_CFG: Record<RelanceStatus, { label: string; cls: string }> = {
  overdue:   { label: 'En retard',   cls: 'text-red-600 bg-red-50 border-red-200' },
  due_today: { label: "Aujourd'hui", cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  pending:   { label: 'En attente',  cls: 'text-brand-600 bg-brand-50 border-brand-200' },
  sent:      { label: 'Envoyé',      cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function ProspectionRelances() {
  const [tab, setTab] = useState<TabId>('all')
  const [selected, setSelected] = useState<EnrichedRelance | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())

  const { data: relances = [], isLoading } = useRelanceDrafts()
  const { data: allProspects = [] } = useAllProspects()
  const generateRelances = useGenerateRelances()
  const setStatus = useSetDraftStatus()
  const updateDraft = useUpdateDraft()
  const deleteDraft = useDeleteDraft()

  const enriched = useMemo<EnrichedRelance[]>(
    () => relances.map(r => ({ ...r, rs: computeRelanceStatus(r) })),
    [relances],
  )

  const stats = useMemo(() => ({
    overdue:   enriched.filter(r => r.rs === 'overdue').length,
    due_today: enriched.filter(r => r.rs === 'due_today').length,
    pending:   enriched.filter(r => r.rs === 'pending').length,
    sent:      enriched.filter(r => r.rs === 'sent').length,
  }), [enriched])

  const allGroups = useMemo<ProspectGroup[]>(() => {
    const map = new Map<string, ProspectGroup>()
    for (const r of enriched) {
      if (!map.has(r.prospect_id)) {
        map.set(r.prospect_id, {
          prospect_id: r.prospect_id,
          company_name: r.prospect?.company_name ?? r.prospect_id,
          industry: r.prospect?.industry,
          relances: [],
        })
      }
      map.get(r.prospect_id)!.relances.push(r)
    }
    for (const g of map.values()) {
      g.relances.sort((a, b) => (a.metadata.relance_day ?? 0) - (b.metadata.relance_day ?? 0))
    }
    return Array.from(map.values())
  }, [enriched])

  const visibleGroups = useMemo<ProspectGroup[]>(() => {
    if (tab === 'all') return allGroups
    if (tab === 'togenerate') return []
    const filter: RelanceStatus =
      tab === 'overdue' ? 'overdue'
      : tab === 'today' ? 'due_today'
      : tab === 'pending' ? 'pending'
      : 'sent'
    return allGroups
      .map(g => ({ ...g, relances: g.relances.filter(r => r.rs === filter) }))
      .filter(g => g.relances.length > 0)
  }, [allGroups, tab])

  const prospectIdsWithRelances = useMemo(
    () => new Set(enriched.map(r => r.prospect_id)),
    [enriched],
  )
  const prospectsToGenerate = useMemo(
    () => allProspects.filter(p => !prospectIdsWithRelances.has(p.id)),
    [allProspects, prospectIdsWithRelances],
  )

  function handleSelect(r: EnrichedRelance) {
    setSelected(r)
    setEditSubject(r.subject)
    setEditBody(r.body)
  }

  async function handleGenerate(prospect_id: string) {
    setGeneratingIds(s => new Set(s).add(prospect_id))
    try {
      await generateRelances.mutateAsync(prospect_id)
    } finally {
      setGeneratingIds(s => { const n = new Set(s); n.delete(prospect_id); return n })
    }
  }

  async function handleSave() {
    if (!selected) return
    await updateDraft.mutateAsync({ id: selected.id, subject: editSubject, body: editBody })
    setSelected(null)
  }

  async function handleMarkSent(id: string) {
    await setStatus.mutateAsync({ id, status: 'sent' })
    setSelected(null)
  }

  async function handleDelete(id: string) {
    await deleteDraft.mutateAsync(id)
    if (selected?.id === id) setSelected(null)
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'all',        label: 'Toutes',      count: enriched.length },
    { id: 'overdue',    label: 'En retard',   count: stats.overdue },
    { id: 'today',      label: "Aujourd'hui", count: stats.due_today },
    { id: 'pending',    label: 'En attente',  count: stats.pending },
    { id: 'sent',       label: 'Envoyées',    count: stats.sent },
    { id: 'togenerate', label: 'À générer',   count: prospectsToGenerate.length },
  ]

  return (
    <Layout title="Relances — Prospection IA">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-red-100 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">En retard</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">Aujourd'hui</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.due_today}</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-medium text-brand-600">En attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">Envoyées</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-gray-100 mb-5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={cn(
                'text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none',
                tab === t.id ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500',
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex gap-5">
        <div className={cn('flex-1 min-w-0 space-y-4', selected && 'max-w-[calc(100%-380px)]')}>

          {isLoading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Chargement…</span>
            </div>
          )}

          {/* À générer tab */}
          {!isLoading && tab === 'togenerate' && (
            prospectsToGenerate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                <p className="text-sm text-gray-400">Tous les prospects ont des relances générées</p>
              </div>
            ) : (
              <div className="space-y-2">
                {prospectsToGenerate.map(p => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.company_name}</p>
                      {p.industry && <p className="text-xs text-gray-400 mt-0.5">{p.industry}</p>}
                    </div>
                    <button
                      onClick={() => handleGenerate(p.id)}
                      disabled={generatingIds.has(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {generatingIds.has(p.id)
                        ? <><RefreshCw className="h-3 w-3 animate-spin" />Génération…</>
                        : <><Sparkles className="h-3 w-3" />Générer</>
                      }
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Main tabs: grouped by prospect */}
          {!isLoading && tab !== 'togenerate' && (
            visibleGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BellRing className="h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Aucune relance dans cette catégorie</p>
                {tab === 'all' && (
                  <button
                    onClick={() => setTab('togenerate')}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Générer les relances pour vos prospects →
                  </button>
                )}
              </div>
            ) : (
              visibleGroups.map(group => (
                <div key={group.prospect_id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{group.company_name}</p>
                      {group.industry && <p className="text-[11px] text-gray-400 mt-0.5">{group.industry}</p>}
                    </div>
                    <button
                      onClick={() => handleGenerate(group.prospect_id)}
                      disabled={generatingIds.has(group.prospect_id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {generatingIds.has(group.prospect_id)
                        ? <><RefreshCw className="h-3 w-3 animate-spin" />Génération…</>
                        : <><RefreshCw className="h-3 w-3" />Régénérer</>
                      }
                    </button>
                  </div>

                  {/* Relance rows */}
                  <div className="divide-y divide-gray-50">
                    {group.relances.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors text-left',
                          selected?.id === r.id && 'bg-brand-50/40',
                        )}
                      >
                        <span className="shrink-0 text-[11px] font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded-md px-1.5 py-0.5 w-10 text-center leading-none">
                          J+{r.metadata.relance_day}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400 w-16">
                          {r.metadata.scheduled_for ? formatDate(r.metadata.scheduled_for) : '—'}
                        </span>
                        <span className={cn(
                          'shrink-0 text-[10px] font-semibold border rounded-full px-2 py-0.5 w-24 text-center leading-none',
                          STATUS_CFG[r.rs].cls,
                        )}>
                          {STATUS_CFG[r.rs].label}
                        </span>
                        <span className="flex-1 min-w-0 text-sm text-gray-700 truncate">{r.subject}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Side panel */}
        {selected && (
          <div className="w-[360px] shrink-0 bg-white border border-gray-100 rounded-xl sticky top-4 max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded-md px-1.5 py-0.5">
                J+{selected.metadata.relance_day}
              </span>
              {selected.metadata.scheduled_for && (
                <span className="text-xs text-gray-400 flex-1">
                  {formatDate(selected.metadata.scheduled_for)}
                </span>
              )}
              <span className={cn(
                'text-[10px] font-semibold border rounded-full px-2 py-0.5',
                STATUS_CFG[selected.rs].cls,
              )}>
                {STATUS_CFG[selected.rs].label}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="ml-1 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  Objet
                </label>
                <input
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  Corps
                </label>
                <textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={12}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Panel actions */}
            <div className="shrink-0 px-4 pb-4 pt-2 border-t border-gray-50 flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateDraft.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {updateDraft.isPending
                  ? <RefreshCw className="h-3 w-3 animate-spin" />
                  : <Save className="h-3 w-3" />
                }
                Enregistrer
              </button>
              {selected.rs !== 'sent' && (
                <button
                  onClick={() => handleMarkSent(selected.id)}
                  disabled={setStatus.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 text-xs font-semibold rounded-lg transition-colors border border-emerald-200"
                >
                  <Send className="h-3 w-3" />
                  Envoyé
                </button>
              )}
              <button
                onClick={() => handleDelete(selected.id)}
                disabled={deleteDraft.isPending}
                className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors border border-gray-100 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
