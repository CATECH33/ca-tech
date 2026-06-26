import { useState, useEffect, type KeyboardEvent } from 'react'
import {
  Plus, Search, Check, Clock, AlertCircle, Columns3, List, FolderOpen,
  GripVertical, Trash2, X, Timer, Tag, ChevronDown, CalendarDays,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { formatDate, cn } from '@/lib/utils'
import {
  useTaches, useCreateTache, useUpdateTacheStatus,
  useUpdateTache, useDeleteTache,
} from '@/hooks/useTaches'
import { useProjets } from '@/hooks/useProjets'
import type { Tache, TacheStatus, TachePriority } from '@/types'

/* ─── CONSTANTES ─────────────────────────────────────────────────────────── */

type ViewMode = 'kanban' | 'liste' | 'projet'

const COLS: { status: TacheStatus; label: string; accent: string; bg: string }[] = [
  { status: 'a_faire',  label: 'À faire',  accent: 'border-gray-300',    bg: 'bg-gray-50' },
  { status: 'en_cours', label: 'En cours', accent: 'border-brand-400',   bg: 'bg-brand-50' },
  { status: 'bloque',   label: 'Bloqué',   accent: 'border-red-400',     bg: 'bg-red-50' },
  { status: 'termine',  label: 'Terminé',  accent: 'border-emerald-400', bg: 'bg-emerald-50' },
]

const PRIORITY_META: Record<TachePriority, { dot: string; label: string; bg: string; text: string }> = {
  urgente: { dot: 'bg-red-500',    label: 'Urgente', bg: 'bg-red-50',    text: 'text-red-700' },
  haute:   { dot: 'bg-orange-400', label: 'Haute',   bg: 'bg-orange-50', text: 'text-orange-700' },
  normale: { dot: 'bg-blue-400',   label: 'Normale', bg: 'bg-blue-50',   text: 'text-blue-700' },
  basse:   { dot: 'bg-gray-300',   label: 'Basse',   bg: 'bg-gray-100',  text: 'text-gray-500' },
}

const PRIORITY_OPTS: { value: TachePriority; label: string }[] = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'haute',   label: 'Haute' },
  { value: 'normale', label: 'Normale' },
  { value: 'basse',   label: 'Basse' },
]
const FORM_INIT = {
  titre: '', description: '', priority: 'normale' as TachePriority,
  date_echeance: '', projet_id: '', tags: [] as string[], time_estime_h: '', time_estime_m: '',
}

/* ─── UTILITAIRES ─────────────────────────────────────────────────────────── */

function fmtTime(min: number | undefined) {
  if (!min) return '0min'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function isOverdue(t: Tache) {
  return !!t.date_echeance && t.status !== 'termine' && new Date(t.date_echeance) < new Date()
}

function isToday(t: Tache) {
  if (!t.date_echeance) return false
  const today = new Date().toISOString().split('T')[0]
  return t.date_echeance === today
}

/* ─── SOUS-COMPOSANTS ─────────────────────────────────────────────────────── */

function PriorityDot({ priority }: { priority: TachePriority }) {
  return <span className={cn('inline-block h-2 w-2 rounded-full shrink-0', PRIORITY_META[priority].dot)} />
}

function ColorDot({ color = '#0066FF', size = 'sm' }: { color?: string; size?: 'sm' | 'xs' }) {
  return (
    <span
      className={cn('rounded-full shrink-0 inline-block', size === 'sm' ? 'h-2.5 w-2.5' : 'h-2 w-2')}
      style={{ backgroundColor: color }}
    />
  )
}

function TagPill({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-red-500 transition">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  )
}

/* ─── FICHE TÂCHE (side panel) ───────────────────────────────────────────── */

type FicheForm = {
  titre: string; description: string; priority: TachePriority
  date_echeance: string; status: TacheStatus; projet_id: string
  tags: string[]; time_estime_h: string; time_estime_m: string
}

function TacheFiche({
  tache, projets, onClose, onUpdate, onDelete,
}: {
  tache: Tache
  projets: { id: string; nom: string; couleur?: string }[]
  onClose: () => void
  onUpdate: (data: Parameters<ReturnType<typeof useUpdateTache>['mutate']>[0]) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [form, setForm] = useState<FicheForm>(() => ({
    titre: tache.titre,
    description: tache.description ?? '',
    priority: tache.priority,
    date_echeance: tache.date_echeance ?? '',
    status: tache.status,
    projet_id: tache.projet_id ?? '',
    tags: tache.tags ?? [],
    time_estime_h: tache.time_estime ? String(Math.floor(tache.time_estime / 60)) : '',
    time_estime_m: tache.time_estime ? String(tache.time_estime % 60) : '',
  }))
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [logAdded, setLogAdded] = useState(false)

  useEffect(() => {
    setForm({
      titre: tache.titre,
      description: tache.description ?? '',
      priority: tache.priority,
      date_echeance: tache.date_echeance ?? '',
      status: tache.status,
      projet_id: tache.projet_id ?? '',
      tags: tache.tags ?? [],
      time_estime_h: tache.time_estime ? String(Math.floor(tache.time_estime / 60)) : '',
      time_estime_m: tache.time_estime ? String(tache.time_estime % 60) : '',
    })
  }, [tache.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof FicheForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const addTag = () => {
    const v = tagInput.trim()
    if (v && !form.tags.includes(v)) setForm(f => ({ ...f, tags: [...f.tags, v] }))
    setTagInput('')
  }
  const removeTag = (t: string) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
  }

  const addTime = async (minutes: number) => {
    await onUpdate({ id: tache.id, time_log: (tache.time_log ?? 0) + minutes })
    setLogAdded(true)
    setTimeout(() => setLogAdded(false), 1500)
  }

  const handleSave = async () => {
    setSaving(true)
    const estime_h = Number(form.time_estime_h) || 0
    const estime_m = Number(form.time_estime_m) || 0
    const time_estime = estime_h * 60 + estime_m || undefined
    await onUpdate({
      id: tache.id,
      titre: form.titre,
      description: form.description || undefined,
      priority: form.priority,
      date_echeance: form.date_echeance || undefined,
      status: form.status,
      projet_id: form.projet_id || undefined,
      tags: form.tags,
      time_estime,
    })
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
    onClose()
  }

  const projet = projets.find(p => p.id === tache.projet_id)
  const timeLog  = tache.time_log ?? 0
  const timeEst  = tache.time_estime
  const logPct   = timeEst && timeEst > 0 ? Math.min(100, Math.round((timeLog / timeEst) * 100)) : null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white shadow-2xl h-full overflow-y-auto flex flex-col border-l border-gray-200">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          {projet && <ColorDot color={projet.couleur} />}
          <p className="text-xs text-gray-400 flex-1 truncate">{projet?.nom ?? 'Sans projet'}</p>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Status toggle */}
        <div className="flex gap-1 px-5 py-3 border-b border-gray-100 shrink-0">
          {COLS.map(col => (
            <button
              key={col.status}
              onClick={() => setForm(f => ({ ...f, status: col.status }))}
              className={cn(
                'flex-1 text-[10px] font-semibold py-1.5 rounded-lg border transition',
                form.status === col.status
                  ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300',
              )}
            >
              {col.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">

          {/* Titre */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Titre</label>
            <input
              value={form.titre}
              onChange={set('titre')}
              className="w-full text-base font-semibold text-gray-900 border-0 border-b-2 border-transparent focus:border-brand-400 focus:outline-none pb-1 bg-transparent transition"
              placeholder="Titre de la tâche"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition"
              placeholder="Détails supplémentaires…"
            />
          </div>

          {/* Priorité + Échéance */}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priorité" options={PRIORITY_OPTS} value={form.priority} onChange={set('priority')} />
            <Input label="Échéance" type="date" value={form.date_echeance} onChange={set('date_echeance')} />
          </div>

          {/* Projet */}
          <Select
            label="Projet"
            options={[{ value: '', label: 'Aucun projet' }, ...projets.map(p => ({ value: p.id, label: p.nom }))]}
            value={form.projet_id}
            onChange={set('projet_id')}
          />

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(t => <TagPill key={t} label={t} onRemove={() => removeTag(t)} />)}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={onTagKey}
                placeholder="Ajouter un tag…"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Time tracking */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Timer className="h-3 w-3" /> Suivi du temps
            </p>

            {/* Estimé */}
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Temps estimé</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number" min="0" placeholder="0"
                  value={form.time_estime_h}
                  onChange={set('time_estime_h')}
                  className="w-16 text-center text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition"
                />
                <span className="text-xs text-gray-400">h</span>
                <input
                  type="number" min="0" max="59" placeholder="0"
                  value={form.time_estime_m}
                  onChange={set('time_estime_m')}
                  className="w-16 text-center text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition"
                />
                <span className="text-xs text-gray-400">min</span>
              </div>
            </div>

            {/* Passé */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-gray-500">Temps passé</label>
                <span className={cn(
                  'text-xs font-semibold transition',
                  logAdded ? 'text-emerald-600' : 'text-gray-700',
                )}>
                  {fmtTime(timeLog)}
                  {logPct !== null && ` · ${logPct}%`}
                </span>
              </div>
              {logPct !== null && (
                <div className="h-1.5 bg-gray-200 rounded-full mb-2 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', logPct >= 100 ? 'bg-red-400' : 'bg-brand-500')}
                    style={{ width: `${logPct}%` }}
                  />
                </div>
              )}
              <div className="flex gap-1.5 flex-wrap">
                {[15, 30, 60, 120].map(m => (
                  <button
                    key={m}
                    onClick={() => addTime(m)}
                    className="text-[11px] px-2.5 py-1 bg-white border border-gray-200 hover:border-brand-400 hover:text-brand-600 rounded-lg transition"
                  >
                    +{m < 60 ? `${m}min` : `${m / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Suppression…' : 'Supprimer'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.titre.trim()}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── TASK CARD (kanban) ─────────────────────────────────────────────────── */

function TaskCard({
  tache, onOpen, onDragStart,
}: {
  tache: Tache
  onOpen: (t: Tache) => void
  onDragStart: (id: string) => void
}) {
  const late = isOverdue(tache)
  const { dot, label, bg, text } = PRIORITY_META[tache.priority]

  return (
    <div
      draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(tache.id) }}
      onClick={() => onOpen(tache)}
      className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-card cursor-pointer group/card select-none transition-shadow"
    >
      {/* Drag handle + titre */}
      <div className="flex items-start gap-2">
        <GripVertical className="h-3.5 w-3.5 text-gray-300 mt-0.5 shrink-0 opacity-0 group-hover/card:opacity-100 transition cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-xs font-medium leading-snug',
            tache.status === 'termine' ? 'line-through text-gray-400' : 'text-gray-800',
          )}>
            {tache.status === 'termine' && <Check className="h-3 w-3 text-emerald-500 inline mr-1" />}
            {tache.status === 'bloque'  && <AlertCircle className="h-3 w-3 text-red-400 inline mr-1" />}
            {tache.titre}
          </p>

          {tache.description && (
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{tache.description}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {(tache.tags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tache.tags!.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{t}</span>
          ))}
          {tache.tags!.length > 3 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">+{tache.tags!.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2.5">
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', bg, text)}>
          <span className={cn('inline-block h-1.5 w-1.5 rounded-full mr-1', dot)} />
          {label}
        </span>
        <div className="flex items-center gap-2">
          {(tache.time_log ?? 0) > 0 && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Timer className="h-3 w-3" />{fmtTime(tache.time_log)}
            </span>
          )}
          {tache.date_echeance && (
            <span className={cn('text-[10px] flex items-center gap-0.5', late ? 'text-red-500 font-semibold' : 'text-gray-400')}>
              <Clock className="h-3 w-3" />{formatDate(tache.date_echeance)}
            </span>
          )}
        </div>
      </div>

      {/* Project */}
      {tache.projet && (
        <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-50">
          <ColorDot color={tache.projet.couleur} size="xs" />
          <p className="text-[10px] text-gray-400 truncate">{tache.projet.nom}</p>
        </div>
      )}
    </div>
  )
}

/* ─── KANBAN BOARD ───────────────────────────────────────────────────────── */

function KanbanBoard({
  taches, onOpen, onCreate, onStatusChange,
}: {
  taches: Tache[]
  onOpen: (t: Tache) => void
  onCreate: (status: TacheStatus) => void
  onStatusChange: (id: string, status: TacheStatus) => void
}) {
  const [dragId, setDragId]   = useState<string | null>(null)
  const [overCol, setOverCol] = useState<TacheStatus | null>(null)

  const handleDrop = (status: TacheStatus) => {
    if (dragId) onStatusChange(dragId, status)
    setDragId(null)
    setOverCol(null)
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {COLS.map(col => {
        const tasks = taches.filter(t => t.status === col.status)
        const isOver = overCol === col.status
        return (
          <div
            key={col.status}
            onDragOver={e => { e.preventDefault(); setOverCol(col.status) }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => handleDrop(col.status)}
            className={cn(
              'rounded-xl border-t-2 p-3 min-h-[200px] transition-all',
              col.accent, col.bg,
              isOver && 'ring-2 ring-brand-400 ring-offset-1 opacity-90',
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700">{col.label}</span>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 font-medium px-1.5 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map(t => (
                <TaskCard
                  key={t.id}
                  tache={t}
                  onOpen={onOpen}
                  onDragStart={setDragId}
                />
              ))}

              <button
                onClick={() => onCreate(col.status)}
                className="w-full text-xs text-gray-400 hover:text-gray-600 hover:bg-white py-2 rounded-xl border border-dashed border-gray-200 flex items-center justify-center gap-1 transition"
              >
                <Plus className="h-3 w-3" /> Ajouter
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── LIST VIEW ──────────────────────────────────────────────────────────── */

function ListView({
  taches, onOpen, onToggle,
}: {
  taches: Tache[]
  onOpen: (t: Tache) => void
  onToggle: (id: string, current: TacheStatus) => void
}) {
  return (
    <Card padding={false}>
      <Table>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Tâche</Th>
            <Th>Projet</Th>
            <Th>Priorité</Th>
            <Th>Statut</Th>
            <Th>Échéance</Th>
            <Th>Temps</Th>
          </Tr>
        </Thead>
        <Tbody>
          {taches.length === 0 ? (
            <EmptyRow cols={7} />
          ) : taches.map(t => {
            const late = isOverdue(t)
            return (
              <Tr key={t.id} onClick={() => onOpen(t)} className="cursor-pointer">
                <Td onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onToggle(t.id, t.status)}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 flex items-center justify-center transition shrink-0',
                      t.status === 'termine'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : t.status === 'bloque'
                          ? 'border-red-400 hover:border-red-500'
                          : 'border-gray-300 hover:border-brand-400',
                    )}
                  >
                    {t.status === 'termine' && <Check className="h-3 w-3" />}
                    {t.status === 'bloque'  && <AlertCircle className="h-3 w-3 text-red-400" />}
                  </button>
                </Td>
                <Td>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', t.status === 'termine' ? 'line-through text-gray-400' : 'text-gray-800')}>
                      {t.titre}
                    </p>
                    {t.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{t.description}</p>
                    )}
                    {(t.tags?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.tags!.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Td>
                <Td>
                  {t.projet ? (
                    <div className="flex items-center gap-1.5">
                      <ColorDot color={t.projet.couleur} size="xs" />
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">{t.projet.nom}</span>
                    </div>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <PriorityDot priority={t.priority} />
                    <span className={cn('text-xs font-medium', PRIORITY_META[t.priority].text)}>
                      {PRIORITY_META[t.priority].label}
                    </span>
                  </div>
                </Td>
                <Td><Badge status={t.status} dot /></Td>
                <Td>
                  {t.date_echeance ? (
                    <span className={cn('text-xs flex items-center gap-1', late ? 'text-red-500 font-semibold' : 'text-gray-400')}>
                      <Clock className="h-3 w-3" />{formatDate(t.date_echeance)}
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                <Td>
                  {(t.time_log ?? 0) > 0 ? (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {fmtTime(t.time_log)}
                      {t.time_estime && (
                        <span className="text-gray-300">/ {fmtTime(t.time_estime)}</span>
                      )}
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Card>
  )
}

/* ─── PAR PROJET VIEW ────────────────────────────────────────────────────── */

function ProjetGroupView({
  taches, projets, onOpen, onToggle,
}: {
  taches: Tache[]
  projets: { id: string; nom: string; couleur?: string }[]
  onOpen: (t: Tache) => void
  onToggle: (id: string, current: TacheStatus) => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setCollapsed(s => { const n = new Set(s); if (n.has(id)) { n.delete(id) } else { n.add(id) } return n })

  const groups: { id: string; label: string; color?: string; tasks: Tache[] }[] = []

  projets.forEach(p => {
    const tasks = taches.filter(t => t.projet_id === p.id)
    if (tasks.length > 0) groups.push({ id: p.id, label: p.nom, color: p.couleur, tasks })
  })

  const sans = taches.filter(t => !t.projet_id)
  if (sans.length > 0) groups.push({ id: '__none__', label: 'Sans projet', tasks: sans })

  if (groups.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-8">Aucune tâche trouvée</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map(g => {
        const isCollapsed = collapsed.has(g.id)
        const done = g.tasks.filter(t => t.status === 'termine').length
        return (
          <Card key={g.id} padding={false}>
            {/* Group header */}
            <button
              onClick={() => toggle(g.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100"
            >
              {g.color ? (
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
              ) : (
                <FolderOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
              <span className="text-sm font-semibold text-gray-800 flex-1">{g.label}</span>
              <span className="text-xs text-gray-400">{done}/{g.tasks.length} terminées</span>
              {/* Progress */}
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: g.tasks.length > 0 ? `${(done / g.tasks.length) * 100}%` : '0%' }}
                />
              </div>
              <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', isCollapsed && '-rotate-90')} />
            </button>

            {/* Tasks */}
            {!isCollapsed && (
              <div className="divide-y divide-gray-50">
                {g.tasks.map(t => {
                  const late = isOverdue(t)
                  return (
                    <div
                      key={t.id}
                      onClick={() => onOpen(t)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition group"
                    >
                      <button
                        onClick={e => { e.stopPropagation(); onToggle(t.id, t.status) }}
                        className={cn(
                          'h-4.5 w-4.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition',
                          t.status === 'termine'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 hover:border-brand-400',
                        )}
                      >
                        {t.status === 'termine' && <Check className="h-2.5 w-2.5" />}
                      </button>

                      <p className={cn('text-sm flex-1 truncate', t.status === 'termine' ? 'line-through text-gray-400' : 'text-gray-800')}>
                        {t.titre}
                      </p>

                      <div className="flex items-center gap-3 shrink-0">
                        {(t.tags?.length ?? 0) > 0 && (
                          <span className="text-[10px] text-gray-400 hidden group-hover:block">
                            <Tag className="h-3 w-3 inline" /> {t.tags![0]}
                          </span>
                        )}
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', PRIORITY_META[t.priority].bg, PRIORITY_META[t.priority].text)}>
                          {PRIORITY_META[t.priority].label}
                        </span>
                        {t.date_echeance && (
                          <span className={cn('text-[11px] flex items-center gap-0.5', late ? 'text-red-500 font-semibold' : 'text-gray-400')}>
                            <Clock className="h-3 w-3" />{formatDate(t.date_echeance)}
                          </span>
                        )}
                        {(t.time_log ?? 0) > 0 && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                            <Timer className="h-3 w-3" />{fmtTime(t.time_log)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */

export function Taches() {
  const [view, setView]               = useState<ViewMode>('kanban')
  const [search, setSearch]           = useState('')
  const [filterPriority, setFP]       = useState<TachePriority | null>(null)
  const [filterProjet, setFPr]        = useState<string | null>(null)
  const [filterOverdue, setFO]        = useState(false)
  const [filterToday, setFT]          = useState(false)
  const [showAdd, setShowAdd]         = useState(false)
  const [addStatus, setAddStatus]     = useState<TacheStatus>('a_faire')
  const [form, setForm]               = useState(FORM_INIT)
  const [ficheTask, setFicheTask]     = useState<Tache | null>(null)
  const [tagInput, setTagInput]       = useState('')

  const { data: taches = [], isLoading } = useTaches()
  const { data: projets = [] }           = useProjets()
  const createTache  = useCreateTache()
  const updateStatus = useUpdateTacheStatus()
  const updateTache  = useUpdateTache()
  const deleteTache  = useDeleteTache()

  /* Sync fiche when taches data refreshes */
  useEffect(() => {
    if (ficheTask) {
      const fresh = taches.find(t => t.id === ficheTask.id)
      if (fresh) setFicheTask(fresh)
    }
  }, [taches]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Filter */
  const filtered = taches.filter(t => {
    if (search && !t.titre.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterProjet && t.projet_id !== filterProjet) return false
    if (filterOverdue && !isOverdue(t)) return false
    if (filterToday && !isToday(t)) return false
    return true
  })

  /* Stats */
  const counts = {
    a_faire:  taches.filter(t => t.status === 'a_faire').length,
    en_cours: taches.filter(t => t.status === 'en_cours').length,
    bloque:   taches.filter(t => t.status === 'bloque').length,
    termine:  taches.filter(t => t.status === 'termine').length,
    retard:   taches.filter(t => isOverdue(t)).length,
  }

  /* Form helpers */
  const set = (k: keyof typeof FORM_INIT) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const addFormTag = () => {
    const v = tagInput.trim()
    if (v && !form.tags.includes(v)) setForm(f => ({ ...f, tags: [...f.tags, v] }))
    setTagInput('')
  }
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addFormTag() }
  }

  const openAdd = (status: TacheStatus = 'a_faire') => {
    setAddStatus(status)
    setForm(FORM_INIT)
    setTagInput('')
    setShowAdd(true)
  }

  const handleCreate = async () => {
    if (!form.titre.trim()) return
    await createTache.mutateAsync({
      titre: form.titre, description: form.description || undefined,
      priority: form.priority as TachePriority,
      date_echeance: form.date_echeance || undefined,
      projet_id: form.projet_id || undefined,
      status: addStatus,
      tags: form.tags,
    })
    setShowAdd(false)
    setForm(FORM_INIT)
    setTagInput('')
  }

  const handleToggle = (id: string, current: TacheStatus) =>
    updateStatus.mutate({ id, status: current === 'termine' ? 'a_faire' : 'termine' })

  const handleFicheUpdate = async (data: Parameters<typeof updateTache.mutate>[0]) => {
    await updateTache.mutateAsync(data)
  }

  const handleFicheDelete = async () => {
    if (!ficheTask) return
    await deleteTache.mutateAsync(ficheTask.id)
    setFicheTask(null)
  }

  const projetOptions = [
    { value: '', label: 'Tous les projets' },
    ...projets.map(p => ({ value: p.id, label: p.nom })),
  ]

  return (
    <Layout
      title="Tâches"
      actions={
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('kanban')}
              title="Vue Kanban"
              className={cn('p-1.5 rounded-md transition', view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}
            >
              <Columns3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('liste')}
              title="Vue liste"
              className={cn('p-1.5 rounded-md transition', view === 'liste' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('projet')}
              title="Par projet"
              className={cn('p-1.5 rounded-md transition', view === 'projet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}
            >
              <FolderOpen className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-3.5 w-3.5" />Nouvelle tâche
          </Button>
        </div>
      }
    >

      {/* ── STATS ── */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {([
          { key: 'a_faire',  label: 'À faire',   bg: 'bg-gray-50',     ring: 'ring-gray-300' },
          { key: 'en_cours', label: 'En cours',  bg: 'bg-brand-50',    ring: 'ring-brand-400' },
          { key: 'bloque',   label: 'Bloqué',    bg: 'bg-red-50',      ring: 'ring-red-400' },
          { key: 'termine',  label: 'Terminé',   bg: 'bg-emerald-50',  ring: 'ring-emerald-400' },
          { key: 'retard',   label: 'En retard', bg: 'bg-orange-50',   ring: 'ring-orange-400' },
        ] as const).map(s => (
          <Card
            key={s.key}
            className={cn('cursor-pointer hover:shadow-elevated transition-shadow', s.bg,
              filterOverdue && s.key === 'retard' ? `ring-2 ${s.ring} ring-offset-1` : ''
            )}
            onClick={() => {
              if (s.key === 'retard') { setFO(f => !f); setFT(false) }
            }}
          >
            <p className="text-2xl font-bold text-gray-900">{counts[s.key]}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />}
          className="w-52"
        />

        {/* Priority pills */}
        <div className="flex gap-1">
          {([null, 'urgente', 'haute', 'normale', 'basse'] as (TachePriority | null)[]).map(p => (
            <button
              key={p ?? 'all'}
              onClick={() => setFP(f => f === p ? null : p)}
              className={cn(
                'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition',
                filterPriority === p
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300',
              )}
            >
              {p === null ? 'Toutes' : PRIORITY_META[p].label}
            </button>
          ))}
        </div>

        {/* Project filter */}
        <select
          value={filterProjet ?? ''}
          onChange={e => setFPr(e.target.value || null)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white text-gray-600 transition"
        >
          {projetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Quick toggles */}
        <button
          onClick={() => { setFT(f => !f); setFO(false) }}
          className={cn(
            'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition flex items-center gap-1',
            filterToday ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 text-gray-500 hover:border-gray-300',
          )}
        >
          <CalendarDays className="h-3 w-3" /> Aujourd'hui
        </button>
        <button
          onClick={() => { setFO(f => !f); setFT(false) }}
          className={cn(
            'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition flex items-center gap-1',
            filterOverdue ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-500 hover:border-gray-300',
          )}
        >
          <AlertCircle className="h-3 w-3" /> En retard
        </button>

        {(search || filterPriority || filterProjet || filterOverdue || filterToday) && (
          <button
            onClick={() => { setSearch(''); setFP(null); setFPr(null); setFO(false); setFT(false) }}
            className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition"
          >
            <X className="h-3 w-3" /> Réinitialiser
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{filtered.length} tâche{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-16">Chargement…</p>
      ) : view === 'kanban' ? (
        <KanbanBoard
          taches={filtered}
          onOpen={setFicheTask}
          onCreate={openAdd}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
        />
      ) : view === 'liste' ? (
        <ListView
          taches={filtered}
          onOpen={setFicheTask}
          onToggle={handleToggle}
        />
      ) : (
        <ProjetGroupView
          taches={filtered}
          projets={projets.map(p => ({ id: p.id, nom: p.nom, couleur: p.couleur }))}
          onOpen={setFicheTask}
          onToggle={handleToggle}
        />
      )}

      {/* ── MODAL: Nouvelle tâche ── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Nouvelle tâche"
        description={COLS.find(c => c.status === addStatus)?.label}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createTache.isPending || !form.titre.trim()}>
              {createTache.isPending ? 'Création…' : 'Créer la tâche'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Titre *" placeholder="Description de la tâche" value={form.titre} onChange={set('titre')} autoFocus />
          <Textarea label="Description" placeholder="Détails supplémentaires…" value={form.description} onChange={set('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priorité" options={PRIORITY_OPTS} value={form.priority} onChange={set('priority')} />
            <Input label="Échéance" type="date" value={form.date_echeance} onChange={set('date_echeance')} />
          </div>
          <Select
            label="Projet"
            options={[{ value: '', label: 'Aucun projet' }, ...projets.map(p => ({ value: p.id, label: p.nom }))]}
            value={form.projet_id}
            onChange={set('projet_id')}
          />

          {/* Tags in modal */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {form.tags.map(t => (
                <TagPill key={t} label={t} onRemove={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={onTagKey}
                placeholder="Tag + Entrée"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
              />
              <button onClick={addFormTag} disabled={!tagInput.trim()} className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── FICHE TÂCHE ── */}
      {ficheTask && (
        <TacheFiche
          tache={ficheTask}
          projets={projets.map(p => ({ id: p.id, nom: p.nom, couleur: p.couleur }))}
          onClose={() => setFicheTask(null)}
          onUpdate={handleFicheUpdate}
          onDelete={handleFicheDelete}
        />
      )}
    </Layout>
  )
}
