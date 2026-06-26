import { useState, useEffect } from 'react'
import {
  Plus, Search, ArrowLeft, Pencil, Calendar, LayoutGrid,
  List, Columns3, Play, Pause, CheckCircle2,
  RotateCcw, X, AlertCircle, FileText, Receipt,
  Clock, GripVertical, ChevronRight, Trash2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, statusLabel, cn } from '@/lib/utils'
import {
  useProjets, useCreateProjet, useUpdateProjet,
  useUpdateProjetStatus, useUpdateProjetProgress, useDeleteProjet,
  useProjetDevis, useProjetFactures,
} from '@/hooks/useProjets'
import {
  useTaches, useCreateTache, useUpdateTache,
  useUpdateTacheStatus, useDeleteTache,
} from '@/hooks/useTaches'
import { useClients } from '@/hooks/useClients'
import type { Projet, ProjetStatus, Tache, TacheStatus, TachePriority } from '@/types'

/* ─── Constantes ─────────────────────────────────────────────── */

const STATUS_OPTS = [
  { value: 'planifie', label: 'Planifié' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_pause', label: 'En pause' },
  { value: 'termine',  label: 'Terminé' },
  { value: 'annule',   label: 'Annulé' },
]
const PRIORITY_OPTS = [
  { value: 'basse',    label: 'Basse' },
  { value: 'normale',  label: 'Normale' },
  { value: 'haute',    label: 'Haute' },
  { value: 'urgente',  label: 'Urgente' },
]
const TASK_STATUS_OPTS = [
  { value: 'a_faire',  label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'bloque',   label: 'Bloqué' },
  { value: 'termine',  label: 'Terminé' },
]
const KANBAN_COLS: { status: TacheStatus; label: string; color: string; bg: string }[] = [
  { status: 'a_faire',  label: 'À faire',  color: 'text-gray-500',   bg: 'bg-gray-50' },
  { status: 'en_cours', label: 'En cours', color: 'text-violet-600', bg: 'bg-violet-50' },
  { status: 'bloque',   label: 'Bloqué',   color: 'text-red-500',    bg: 'bg-red-50' },
  { status: 'termine',  label: 'Terminé',  color: 'text-emerald-600',bg: 'bg-emerald-50' },
]
const PROJET_KANBAN_COLS: { status: ProjetStatus; label: string }[] = [
  { status: 'planifie', label: 'Planifiés' },
  { status: 'en_cours', label: 'En cours' },
  { status: 'en_pause', label: 'En pause' },
  { status: 'termine',  label: 'Terminés' },
]
const PROJECT_COLORS = [
  '#0066FF','#6366f1','#8b5cf6','#ec4899',
  '#ef4444','#f97316','#eab308','#22c55e',
  '#14b8a6','#06b6d4','#64748b','#1e293b',
]
const FORM_INIT = {
  nom: '', client_id: '', description: '', notes: '',
  budget: '', date_debut: '', date_fin_prevue: '',
  couleur: '#0066FF', tags: [] as string[],
}
const ALL_FILTER = ['all', 'planifie', 'en_cours', 'en_pause', 'termine', 'annule'] as const
type FilterStatus = (typeof ALL_FILTER)[number]
type ViewMode = 'grid' | 'list' | 'kanban'

/* ─── Petits composants utilitaires ─────────────────────────── */

function ProgressBar({ value, color, className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full bg-gray-100 rounded-full overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: value === 100 ? '#22c55e' : (color ?? '#0066FF') }}
      />
    </div>
  )
}

function ColorDot({ color, size = 'md' }: { color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'h-2.5 w-2.5' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
  return <span className={cn('rounded-full shrink-0 inline-block', sz)} style={{ background: color ?? '#0066FF' }} />
}

function TagPill({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-gray-400 hover:text-gray-700 transition">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  )
}

/* ─── TaskEditModal ──────────────────────────────────────────── */

function TaskEditModal({
  tache, projetId, onSave, onClose, isNew,
}: {
  tache?: Tache; projetId: string; onSave: (data: Omit<Tache, 'id' | 'created_at' | 'updated_at'>) => Promise<void>; onClose: () => void; isNew?: boolean
}) {
  const [form, setForm] = useState({
    titre:        tache?.titre ?? '',
    description:  tache?.description ?? '',
    priority:     (tache?.priority ?? 'normale') as TachePriority,
    status:       (tache?.status ?? 'a_faire') as TacheStatus,
    date_echeance: tache?.date_echeance ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.titre.trim()) return
    setSaving(true)
    await onSave({ ...form, projet_id: projetId })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title={isNew ? 'Nouvelle tâche' : 'Modifier la tâche'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.titre.trim()}>
            {saving ? 'Enregistrement…' : isNew ? 'Créer' : 'Enregistrer'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label="Titre *" placeholder="Titre de la tâche…" autoFocus
          value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSave()} />
        <Textarea label="Description" placeholder="Détails, contexte, liens…" rows={3}
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Priorité" value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value as TachePriority }))}
            options={PRIORITY_OPTS} />
          <Select label="Statut" value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as TacheStatus }))}
            options={TASK_STATUS_OPTS} />
        </div>
        <Input label="Date d'échéance" type="date"
          value={form.date_echeance} onChange={e => setForm(f => ({ ...f, date_echeance: e.target.value }))} />
      </div>
    </Modal>
  )
}

/* ─── TaskCard (kanban) ──────────────────────────────────────── */

function TaskCard({
  tache, onEdit, onDelete, onDragStart,
}: {
  tache: Tache; onEdit: () => void; onDelete: () => void; onDragStart: () => void
}) {
  const isLate = tache.date_echeance && tache.status !== 'termine'
    && new Date(tache.date_echeance) < new Date()

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onEdit}
      className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-xs font-medium leading-snug flex-1', tache.status === 'termine' ? 'text-gray-400 line-through' : 'text-gray-800')}>
          {tache.titre}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-0.5 text-gray-300 hover:text-red-400 transition rounded">
            <X className="h-3 w-3" />
          </button>
          <GripVertical className="h-3 w-3 text-gray-300 cursor-grab" />
        </div>
      </div>
      {tache.description && (
        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{tache.description}</p>
      )}
      <div className="flex items-center justify-between mt-2 gap-2">
        <Badge status={tache.priority} dot />
        {tache.date_echeance && (
          <span className={cn('text-[10px] flex items-center gap-0.5', isLate ? 'text-red-500 font-semibold' : 'text-gray-400')}>
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(tache.date_echeance)}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── KanbanBoard (tâches) ───────────────────────────────────── */

function KanbanBoard({
  projetId, taches, createTache, updateTache, updateStatus, deleteTache,
}: {
  projetId: string
  taches: Tache[]
  createTache: ReturnType<typeof useCreateTache>
  updateTache: ReturnType<typeof useUpdateTache>
  updateStatus: ReturnType<typeof useUpdateTacheStatus>
  deleteTache: ReturnType<typeof useDeleteTache>
}) {
  const [dragId, setDragId]     = useState<string | null>(null)
  const [overCol, setOverCol]   = useState<TacheStatus | null>(null)
  const [editTask, setEditTask] = useState<Tache | null | 'new'>()
  const [newColStatus, setNewColStatus] = useState<TacheStatus>('a_faire')

  const handleDrop = (colStatus: TacheStatus) => {
    if (dragId && colStatus !== taches.find(t => t.id === dragId)?.status) {
      updateStatus.mutate({ id: dragId, status: colStatus })
    }
    setDragId(null); setOverCol(null)
  }

  const handleSaveTask = async (data: Omit<Tache, 'id' | 'created_at' | 'updated_at'>) => {
    if (editTask === 'new') {
      await createTache.mutateAsync({ titre: data.titre, description: data.description, priority: data.priority, date_echeance: data.date_echeance, projet_id: projetId, status: newColStatus })
    } else if (editTask) {
      await updateTache.mutateAsync({ id: editTask.id, titre: data.titre, description: data.description, priority: data.priority, status: data.status, date_echeance: data.date_echeance })
    }
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-3 h-full">
        {KANBAN_COLS.map(col => {
          const colTasks = taches.filter(t => t.status === col.status)
          const isOver = overCol === col.status
          return (
            <div
              key={col.status}
              className={cn('flex flex-col rounded-xl border-2 transition-colors min-h-[300px]',
                isOver ? 'border-brand-300 bg-brand-50/50' : 'border-transparent bg-gray-50/50')}
              onDragOver={e => { e.preventDefault(); setOverCol(col.status) }}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold uppercase tracking-wider', col.color)}>{col.label}</span>
                  <span className="text-[10px] font-medium text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setNewColStatus(col.status); setEditTask('new') }}
                  className="text-gray-400 hover:text-brand-500 transition p-0.5 rounded"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                {colTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    tache={t}
                    onEdit={() => setEditTask(t)}
                    onDelete={() => deleteTache.mutate(t.id)}
                    onDragStart={() => setDragId(t.id)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-300">
                    Glissez une tâche ici
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editTask != null && (
        <TaskEditModal
          tache={editTask === 'new' ? undefined : editTask}
          projetId={projetId}
          isNew={editTask === 'new'}
          onSave={handleSaveTask}
          onClose={() => setEditTask(undefined)}
        />
      )}
    </>
  )
}

/* ─── ProjetFiche ────────────────────────────────────────────── */

type FicheTab = 'taches' | 'notes' | 'informations'

function ProjetFiche({
  projet, onBack, onUpdate, onDelete,
}: {
  projet: Projet; onBack: () => void
  onUpdate: (p: Projet) => void; onDelete: () => void
}) {
  const [tab, setTab]               = useState<FicheTab>('taches')
  const [editMode, setEditMode]     = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [localProgress, setLocalProgress] = useState(projet.progression)
  const [notes, setNotes]           = useState(projet.notes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [tagInput, setTagInput]     = useState('')

  const [editForm, setEditForm] = useState({
    nom:            projet.nom,
    description:    projet.description ?? '',
    budget:         projet.budget ? String(projet.budget) : '',
    date_debut:     projet.date_debut ?? '',
    date_fin_prevue: projet.date_fin_prevue ?? '',
    status:         projet.status,
    couleur:        projet.couleur ?? '#0066FF',
    tags:           projet.tags ?? [],
  })

  useEffect(() => {
    setEditForm({
      nom: projet.nom, description: projet.description ?? '',
      budget: projet.budget ? String(projet.budget) : '',
      date_debut: projet.date_debut ?? '',
      date_fin_prevue: projet.date_fin_prevue ?? '',
      status: projet.status, couleur: projet.couleur ?? '#0066FF',
      tags: projet.tags ?? [],
    })
    setLocalProgress(projet.progression)
    setNotes(projet.notes ?? '')
    setEditMode(false)
  }, [projet.id])

  const { data: taches = [] }   = useTaches(projet.id)
  const { data: pDevis = [] }   = useProjetDevis(projet.id)
  const { data: pFactures = [] } = useProjetFactures(projet.id)
  const updateProjet   = useUpdateProjet()
  const updateStatus   = useUpdateProjetStatus()
  const updateProgress = useUpdateProjetProgress()
  const deleteProjet   = useDeleteProjet()
  const createTache    = useCreateTache()
  const updateTache    = useUpdateTache()
  const updateTacheStatus = useUpdateTacheStatus()
  const deleteTache    = useDeleteTache()

  const daysLeft = projet.date_fin_prevue
    ? Math.ceil((new Date(projet.date_fin_prevue).getTime() - Date.now()) / 86400000) // eslint-disable-line react-hooks/purity
    : null
  const isLate = daysLeft !== null && daysLeft < 0
    && projet.status !== 'termine' && projet.status !== 'annule'

  const doneTasks = taches.filter(t => t.status === 'termine').length
  const taskProgress = taches.length ? Math.round((doneTasks / taches.length) * 100) : 0

  const handleSave = async () => {
    const updated = await updateProjet.mutateAsync({
      id: projet.id,
      nom: editForm.nom,
      description: editForm.description,
      budget: editForm.budget ? Number(editForm.budget) : 0,
      date_debut: editForm.date_debut,
      date_fin_prevue: editForm.date_fin_prevue,
      status: editForm.status as ProjetStatus,
      couleur: editForm.couleur,
      tags: editForm.tags,
    })
    onUpdate(updated); setEditMode(false)
  }

  const handleStatusChange = async (status: ProjetStatus) => {
    const updated = await updateStatus.mutateAsync({ id: projet.id, status })
    onUpdate(updated)
  }

  const handleProgressCommit = async (val: number) => {
    const updated = await updateProgress.mutateAsync({ id: projet.id, progression: val })
    onUpdate(updated)
  }

  const handleSaveNotes = async () => {
    await updateProjet.mutateAsync({ id: projet.id, notes })
    setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000)
  }

  const handleAddTag = (tag: string) => {
    const t = tag.trim()
    if (!t || editForm.tags.includes(t)) return
    setEditForm(f => ({ ...f, tags: [...f.tags, t] }))
    setTagInput('')
  }
  const handleRemoveTag = (tag: string) => {
    setEditForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  const totalFacture  = pFactures.reduce((s, f) => s + f.total_ttc, 0)
  const totalEncaisse = pFactures.reduce((s, f) => s + f.amount_paid, 0)
  const totalDevis    = pDevis.reduce((s, d) => s + d.total_ttc, 0)
  const couleur       = projet.couleur ?? '#0066FF'

  return (
    <div>
      {/* ── Header ── */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ background: `linear-gradient(135deg, #0A2540 0%, #1a1a2e 100%)` }}>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button onClick={onBack}
                className="mt-0.5 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))}
                    className="text-xl font-bold text-white bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-white/30" />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <ColorDot color={couleur} size="lg" />
                    <h1 className="text-xl font-bold text-white truncate">{projet.nom}</h1>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar nom={projet.client?.nom} prenom={projet.client?.prenom} size="sm" />
                  <span className="text-sm text-white/60 truncate">
                    {projet.client?.entreprise || `${projet.client?.prenom} ${projet.client?.nom}`}
                  </span>
                </div>
                {(projet.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(projet.tags ?? []).map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
              <Badge status={projet.status} />
              {!editMode && projet.status === 'planifie' && (
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => handleStatusChange('en_cours')} disabled={updateStatus.isPending}>
                  <Play className="h-3.5 w-3.5" />Démarrer
                </Button>
              )}
              {!editMode && projet.status === 'en_cours' && (
                <>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleStatusChange('en_pause')} disabled={updateStatus.isPending}>
                    <Pause className="h-3.5 w-3.5" />Pause
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                    onClick={() => handleStatusChange('termine')} disabled={updateStatus.isPending}>
                    <CheckCircle2 className="h-3.5 w-3.5" />Terminer
                  </Button>
                </>
              )}
              {!editMode && projet.status === 'en_pause' && (
                <>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleStatusChange('en_cours')} disabled={updateStatus.isPending}>
                    <RotateCcw className="h-3.5 w-3.5" />Reprendre
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                    onClick={() => handleStatusChange('termine')} disabled={updateStatus.isPending}>
                    <CheckCircle2 className="h-3.5 w-3.5" />Terminer
                  </Button>
                </>
              )}
              {editMode ? (
                <>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setEditMode(false)}>Annuler</Button>
                  <Button size="sm" onClick={handleSave} disabled={updateProjet.isPending || !editForm.nom}>
                    {updateProjet.isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setEditMode(true)}>
                  <Pencil className="h-3.5 w-3.5" />Modifier
                </Button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/50">Progression</span>
              <div className="flex items-center gap-3">
                {taches.length > 0 && (
                  <span className="text-xs text-white/40">{doneTasks}/{taches.length} tâches</span>
                )}
                <span className="text-sm font-bold text-white">{localProgress}%</span>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${localProgress}%`, background: localProgress === 100 ? '#22c55e' : couleur }} />
            </div>
            <input type="range" min={0} max={100} step={5} value={localProgress}
              onChange={e => setLocalProgress(Number(e.target.value))}
              onMouseUp={e => handleProgressCommit(Number((e.target as HTMLInputElement).value))}
              onTouchEnd={e => handleProgressCommit(Number((e.target as HTMLInputElement).value))}
              className="w-full h-1 appearance-none cursor-pointer accent-white opacity-40 hover:opacity-80 transition" />
          </div>
        </div>
      </div>

      {/* Overdue */}
      {isLate && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          En retard de {Math.abs(daysLeft!)} jour{Math.abs(daysLeft!) > 1 ? 's' : ''} — échéance le {formatDate(projet.date_fin_prevue)}
        </div>
      )}

      {/* ── Tabs + content ── */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-card mb-5 w-fit">
        {(['taches', 'notes', 'informations'] as FicheTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition capitalize',
              tab === t ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-700')}>
            {t === 'taches' ? 'Tâches' : t === 'notes' ? 'Notes' : 'Informations'}
            {t === 'taches' && taches.length > 0 && (
              <span className={cn('ml-1.5 text-[10px]', tab === 'taches' ? 'text-white/70' : 'text-gray-400')}>
                {doneTasks}/{taches.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab: Tâches (Kanban) ─── */}
      {tab === 'taches' && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <KanbanBoard
              projetId={projet.id}
              taches={taches}
              createTache={createTache}
              updateTache={updateTache}
              updateStatus={updateTacheStatus}
              deleteTache={deleteTache}
            />
          </div>
        </div>
      )}

      {/* ─── Tab: Notes ─── */}
      {tab === 'notes' && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes de projet</h3>
            <button onClick={handleSaveNotes}
              className={cn('text-xs font-medium px-3 py-1 rounded-lg transition',
                notesSaved ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-600 hover:bg-brand-100')}>
              {notesSaved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes, décisions, liens utiles, résumés de réunion…"
            rows={16}
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent leading-relaxed"
          />
        </Card>
      )}

      {/* ─── Tab: Informations ─── */}
      {tab === 'informations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <Card>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              {editMode ? (
                <Textarea placeholder="Périmètre, objectifs, livrables…" rows={4}
                  value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              ) : projet.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{projet.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Aucune description</p>
              )}
            </Card>

            {/* Finances */}
            <Card>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Finances</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(projet.budget)}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Devis</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(totalDevis)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{pDevis.length} devis</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Encaissé</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalEncaisse)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">sur {formatCurrency(totalFacture)}</p>
                </div>
              </div>

              {pDevis.length > 0 && (
                <div className="space-y-1 mb-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Devis liés</p>
                  {pDevis.map(d => (
                    <div key={d.id} className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-lg">
                      <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-xs font-mono font-medium text-gray-700">{d.numero}</span>
                      <Badge status={d.status} />
                      <span className="text-xs text-gray-500 ml-auto">{formatCurrency(d.total_ttc)}</span>
                    </div>
                  ))}
                </div>
              )}

              {pFactures.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Factures liées</p>
                  {pFactures.map(f => (
                    <div key={f.id} className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-lg">
                      <Receipt className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-xs font-mono font-medium text-gray-700">{f.numero}</span>
                      <Badge status={f.status} />
                      <div className="ml-auto text-right">
                        <p className="text-xs text-gray-500">{formatCurrency(f.total_ttc)}</p>
                        {f.amount_paid > 0 && f.amount_paid < f.total_ttc && (
                          <p className="text-[10px] text-amber-600">{formatCurrency(f.amount_paid)} enc.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pDevis.length === 0 && pFactures.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">Aucun devis ni facture lié à ce projet</p>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            {/* Infos */}
            <Card>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informations</h3>
              <div className="space-y-3.5">
                {editMode && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Statut</p>
                    <select value={editForm.status}
                      onChange={e => setEditForm(f => ({ ...f, status: e.target.value as ProjetStatus }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                      {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Budget</p>
                  {editMode ? (
                    <input type="number" min="0" placeholder="0" value={editForm.budget}
                      onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(projet.budget)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Date de début</p>
                  {editMode ? (
                    <input type="date" value={editForm.date_debut}
                      onChange={e => setEditForm(f => ({ ...f, date_debut: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white" />
                  ) : (
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />{formatDate(projet.date_debut)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Échéance</p>
                  {editMode ? (
                    <input type="date" value={editForm.date_fin_prevue}
                      onChange={e => setEditForm(f => ({ ...f, date_fin_prevue: e.target.value }))}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white" />
                  ) : (
                    <p className={cn('text-sm flex items-center gap-1', isLate ? 'text-red-600 font-medium' : 'text-gray-700')}>
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(projet.date_fin_prevue)}
                      {daysLeft !== null && daysLeft >= 0 && projet.status === 'en_cours' && (
                        <span className="ml-1 text-xs text-gray-400 font-normal">({daysLeft}j)</span>
                      )}
                    </p>
                  )}
                </div>
                {projet.date_fin_reelle && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Livré le</p>
                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />{formatDate(projet.date_fin_reelle)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tâches</p>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{doneTasks} / {taches.length} terminées</span>
                      <span className="font-medium">{taskProgress}%</span>
                    </div>
                    <ProgressBar value={taskProgress} color={couleur} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Color + Tags */}
            {editMode && (
              <Card>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Couleur & Tags</h3>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Couleur</p>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_COLORS.map(c => (
                      <button key={c} onClick={() => setEditForm(f => ({ ...f, couleur: c }))}
                        className={cn('h-6 w-6 rounded-full transition-transform hover:scale-110',
                          editForm.couleur === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : '')}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editForm.tags.map(t => (
                      <TagPill key={t} label={t} onRemove={() => handleRemoveTag(t)} />
                    ))}
                  </div>
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(tagInput) }
                    }}
                    placeholder="Ajouter un tag, puis Entrée…"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white"
                  />
                </div>
              </Card>
            )}

            {/* Client */}
            {projet.client && (
              <Card>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Client</h3>
                <div className="flex items-center gap-3">
                  <Avatar nom={projet.client.nom} prenom={projet.client.prenom} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{projet.client.prenom} {projet.client.nom}</p>
                    {projet.client.entreprise && <p className="text-xs text-gray-500 truncate">{projet.client.entreprise}</p>}
                    <a href={`mailto:${projet.client.email}`} className="text-xs text-brand-600 hover:underline truncate block">
                      {projet.client.email}
                    </a>
                  </div>
                </div>
              </Card>
            )}

            <button onClick={() => setShowDelete(true)}
              className="w-full text-xs text-red-400 hover:text-red-600 py-2 transition text-center flex items-center justify-center gap-1">
              <Trash2 className="h-3.5 w-3.5" />Supprimer ce projet
            </button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Supprimer le projet" size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger"
              onClick={async () => { await deleteProjet.mutateAsync(projet.id); onDelete() }}
              disabled={deleteProjet.isPending}>
              {deleteProjet.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </>
        }>
        <p className="text-sm text-gray-600">
          Supprimer <strong>{projet.nom}</strong> ? Cette action est irréversible et supprimera toutes les tâches associées.
        </p>
      </Modal>
    </div>
  )
}

/* ─── ProjectCard ────────────────────────────────────────────── */

function ProjectCard({ projet, onClick }: { projet: Projet; onClick: () => void }) {
  const couleur = projet.couleur ?? '#0066FF'
  const daysLeft = projet.date_fin_prevue
    ? Math.ceil((new Date(projet.date_fin_prevue).getTime() - Date.now()) / 86400000) // eslint-disable-line react-hooks/purity
    : null
  const isLate = daysLeft !== null && daysLeft < 0
    && projet.status !== 'termine' && projet.status !== 'annule'

  return (
    <Card onClick={onClick}
      className="hover:shadow-elevated transition-all cursor-pointer group border-l-4"
      style={{ borderLeftColor: couleur }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition">
            {projet.nom}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Avatar nom={projet.client?.nom} prenom={projet.client?.prenom} size="sm" />
            <span className="text-xs text-gray-500 truncate">
              {projet.client?.entreprise || `${projet.client?.prenom} ${projet.client?.nom}`}
            </span>
          </div>
        </div>
        <Badge status={projet.status} className="ml-2 shrink-0" />
      </div>

      {(projet.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(projet.tags ?? []).slice(0, 3).map(t => <TagPill key={t} label={t} />)}
        </div>
      )}

      {projet.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{projet.description}</p>
      )}

      <ProgressBar value={projet.progression} color={couleur} className="mb-1.5" />
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>{projet.progression}%</span>
      </div>

      <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3">
        <div className={cn('flex items-center gap-1', isLate ? 'text-red-500 font-medium' : 'text-gray-400')}>
          <Calendar className="h-3 w-3" />
          {formatDate(projet.date_fin_prevue)}
          {isLate && <AlertCircle className="h-3 w-3" />}
        </div>
        <span className="font-semibold text-gray-800">{formatCurrency(projet.budget)}</span>
      </div>
    </Card>
  )
}

/* ─── Page Projets ───────────────────────────────────────────── */

export function Projets() {
  const [search, setSearch]         = useState('')
  const [view, setView]             = useState<ViewMode>('grid')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showAdd, setShowAdd]       = useState(false)
  const [form, setForm]             = useState(FORM_INIT)
  const [ficheProjet, setFicheProjet] = useState<Projet | null>(null)
  const [tagInput, setTagInput]     = useState('')
  const [dragProjId, setDragProjId] = useState<string | null>(null)
  const [overKanbanCol, setOverKanbanCol] = useState<ProjetStatus | null>(null)

  const { data: projets = [], isLoading } = useProjets()
  const { data: clients = [] }            = useClients()
  const createProjet  = useCreateProjet()
  const updateStatus  = useUpdateProjetStatus()

  useEffect(() => {
    if (!ficheProjet) return
    const fresh = projets.find(p => p.id === ficheProjet.id)
    if (fresh) setFicheProjet(fresh)
  }, [projets]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = projets.filter(p => {
    const matchSearch = `${p.nom} ${p.client?.nom ?? ''} ${p.client?.prenom ?? ''} ${p.client?.entreprise ?? ''} ${(p.tags ?? []).join(' ')}`
      .toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const statCols = [
    { status: 'planifie' as ProjetStatus, label: 'Planifiés' },
    { status: 'en_cours' as ProjetStatus, label: 'En cours' },
    { status: 'en_pause' as ProjetStatus, label: 'En pause' },
    { status: 'termine'  as ProjetStatus, label: 'Terminés' },
  ]

  const clientOptions = clients.map(c => ({
    value: c.id, label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}`,
  }))

  const handleCreate = async () => {
    if (!form.nom || !form.client_id) return
    const created = await createProjet.mutateAsync({
      nom: form.nom, client_id: form.client_id,
      description: form.description, notes: form.notes,
      budget: form.budget ? Number(form.budget) : undefined,
      date_debut: form.date_debut, date_fin_prevue: form.date_fin_prevue,
      couleur: form.couleur, tags: form.tags,
    })
    setShowAdd(false); setForm(FORM_INIT); setFicheProjet(created)
  }

  const handleAddFormTag = (tag: string) => {
    const t = tag.trim()
    if (!t || form.tags.includes(t)) return
    setForm(f => ({ ...f, tags: [...f.tags, t] }))
    setTagInput('')
  }

  const handleKanbanDrop = (status: ProjetStatus) => {
    if (dragProjId) {
      const p = projets.find(p => p.id === dragProjId)
      if (p && p.status !== status) updateStatus.mutate({ id: dragProjId, status })
    }
    setDragProjId(null); setOverKanbanCol(null)
  }

  if (ficheProjet) {
    return (
      <Layout title="Projets">
        <ProjetFiche
          projet={ficheProjet}
          onBack={() => setFicheProjet(null)}
          onUpdate={setFicheProjet}
          onDelete={() => setFicheProjet(null)}
        />
      </Layout>
    )
  }

  return (
    <Layout title="Projets"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {([['grid', LayoutGrid], ['list', List], ['kanban', Columns3]] as [ViewMode, typeof LayoutGrid][]).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={cn('p-1.5 rounded-lg transition', view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => { setForm(FORM_INIT); setTagInput(''); setShowAdd(true) }}>
            <Plus className="h-3.5 w-3.5" />Nouveau projet
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {statCols.map(col => (
          <Card key={col.status} onClick={() => setFilterStatus(f => f === col.status ? 'all' : col.status)}
            className={cn('text-center cursor-pointer hover:shadow-elevated transition-shadow',
              filterStatus === col.status && 'ring-2 ring-brand-400')}>
            <p className="text-2xl font-bold text-gray-900">{projets.filter(p => p.status === col.status).length}</p>
            <Badge status={col.status} className="mt-1" />
          </Card>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input placeholder="Rechercher un projet…" value={search}
          onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />} className="max-w-xs" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_FILTER.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1 text-xs rounded-full border transition',
                filterStatus === s ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}>
              {s === 'all' ? `Tous (${projets.length})` : `${statusLabel(s)} (${projets.filter(p => p.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid view ── */}
      {!isLoading && view === 'grid' && (
        filtered.length === 0
          ? <p className="text-sm text-gray-400 text-center py-12">Aucun projet trouvé</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => <ProjectCard key={p.id} projet={p} onClick={() => setFicheProjet(p)} />)}
            </div>
      )}

      {/* ── List view ── */}
      {!isLoading && view === 'list' && (
        filtered.length === 0
          ? <p className="text-sm text-gray-400 text-center py-12">Aucun projet trouvé</p>
          : <Card padding={false}>
              <div className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const couleur = p.couleur ?? '#0066FF'
                  return (
                    <div key={p.id} onClick={() => setFicheProjet(p)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition cursor-pointer group border-l-4"
                      style={{ borderLeftColor: couleur }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600 transition">{p.nom}</p>
                          {(p.tags ?? []).slice(0, 2).map(t => <TagPill key={t} label={t} />)}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.client?.entreprise || `${p.client?.prenom} ${p.client?.nom}`}
                        </p>
                      </div>
                      <div className="w-28 hidden md:block">
                        <ProgressBar value={p.progression} color={couleur} />
                        <p className="text-[10px] text-gray-400 mt-0.5 text-right">{p.progression}%</p>
                      </div>
                      <Badge status={p.status} />
                      <span className="text-xs text-gray-400 hidden lg:block w-24 text-right">
                        {formatDate(p.date_fin_prevue)}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 w-20 text-right">{formatCurrency(p.budget)}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition shrink-0" />
                    </div>
                  )
                })}
              </div>
            </Card>
      )}

      {/* ── Kanban view (projects by status) ── */}
      {!isLoading && view === 'kanban' && (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 gap-4 min-w-[900px]">
            {PROJET_KANBAN_COLS.map(col => {
              const colProjets = filtered.filter(p => p.status === col.status)
              const isOver = overKanbanCol === col.status
              return (
                <div key={col.status}
                  className={cn('flex flex-col rounded-xl border-2 transition-colors min-h-[400px]',
                    isOver ? 'border-brand-300 bg-brand-50/50' : 'border-transparent bg-gray-50/50')}
                  onDragOver={e => { e.preventDefault(); setOverKanbanCol(col.status) }}
                  onDragLeave={() => setOverKanbanCol(null)}
                  onDrop={() => handleKanbanDrop(col.status)}>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge status={col.status} />
                      <span className="text-xs text-gray-400">{colProjets.length}</span>
                    </div>
                  </div>
                  <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                    {colProjets.map(p => (
                      <div key={p.id} draggable
                        onDragStart={() => setDragProjId(p.id)}
                        onDragEnd={() => { setDragProjId(null); setOverKanbanCol(null) }}>
                        <ProjectCard projet={p} onClick={() => setFicheProjet(p)} />
                      </div>
                    ))}
                    {colProjets.length === 0 && (
                      <p className="text-center py-8 text-xs text-gray-300">Glissez un projet ici</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-gray-400 text-center py-12">Chargement…</p>}

      {/* Create modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nouveau projet" size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createProjet.isPending || !form.nom || !form.client_id}>
              {createProjet.isPending ? 'Création…' : 'Créer le projet'}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom du projet *" placeholder="Site vitrine, Logo, App…"
              value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              className="col-span-2" />
            <Select label="Client *" value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              options={clientOptions} placeholder="Sélectionner un client" className="col-span-2" />
            <Textarea label="Description" placeholder="Périmètre, objectifs, livrables…"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="col-span-2" />
            <Input label="Budget (€)" type="number" min="0" placeholder="0"
              value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            <div />
            <Input label="Date de début" type="date" value={form.date_debut}
              onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} />
            <Input label="Date de fin prévue" type="date" value={form.date_fin_prevue}
              onChange={e => setForm(f => ({ ...f, date_fin_prevue: e.target.value }))} />
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Couleur</p>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, couleur: c }))}
                  className={cn('h-6 w-6 rounded-full transition-transform hover:scale-110',
                    form.couleur === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : '')}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Tags</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(t => <TagPill key={t} label={t} onRemove={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} />)}
            </div>
            <input value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddFormTag(tagInput) } }}
              placeholder="Ajouter un tag, puis Entrée…"
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white" />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
