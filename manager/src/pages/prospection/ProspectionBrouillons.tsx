import { useState, useMemo } from 'react'
import {
  FilePen, Plus, Search, X, RefreshCw, Send, Lock,
  Mail, CheckCircle2, Clock, AlertCircle, Trash2, Pencil,
  ChevronLeft, ChevronRight, Eye, Wand2, Building2,
  User, Hash, Palette,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { cn, formatDate } from '@/lib/utils'
import {
  useEmailDrafts, useCreateDraft, useUpdateDraft,
  useSetDraftStatus, useDeleteDraft, useProspectsForDraft,
  type DraftRow, type CreateDraftInput, type UpdateDraftInput,
} from '@/hooks/useEmailDrafts'
import { MAIL_STATUS } from '@/services/mailProvider'
import type { EmailDraftStatus, EmailDraftTone } from '@/types'

/* ─── CONSTANTES ──────────────────────────────────────────────────────────── */

type FilterTab = 'all' | EmailDraftStatus
type PanelMode = 'preview' | 'edit'

const TONE_CONFIG: Record<EmailDraftTone, { label: string; color: string }> = {
  formal:       { label: 'Formel',         color: 'bg-slate-100 text-slate-700 border-slate-200' },
  friendly:     { label: 'Amical',         color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  direct:       { label: 'Direct',         color: 'bg-amber-50 text-amber-700 border-amber-200' },
  professional: { label: 'Professionnel',  color: 'bg-brand-50 text-brand-700 border-brand-200' },
}

const STATUS_CONFIG: Record<EmailDraftStatus, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  draft:  { label: 'Brouillon',       color: 'bg-gray-50 text-gray-600 border-gray-200',    dot: 'bg-gray-400',    icon: FilePen },
  ready:  { label: 'Prêt à envoyer',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  sent:   { label: 'Envoyé',          color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500',    icon: Mail },
  failed: { label: 'Échec',           color: 'bg-red-50 text-red-600 border-red-200',       dot: 'bg-red-500',     icon: AlertCircle },
}

const TONE_OPTIONS: { value: EmailDraftTone; label: string }[] = [
  { value: 'professional', label: 'Professionnel' },
  { value: 'formal',       label: 'Formel' },
  { value: 'friendly',     label: 'Amical' },
  { value: 'direct',       label: 'Direct' },
]

const EMPTY_CREATE: CreateDraftInput = {
  prospect_id: '', prospect_contact_id: '',
  subject: '', body: '', tone: 'professional', sequence_step: 1,
}

/* ─── UTILITAIRES ─────────────────────────────────────────────────────────── */

function contactLabel(d: DraftRow) {
  if (!d.contact) return null
  const name = `${d.contact.first_name} ${d.contact.last_name}`
  return d.contact.email ? `${name} <${d.contact.email}>` : name
}

/* ─── SEND BUTTON ─────────────────────────────────────────────────────────── */

function SendButton() {
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled
        className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
        title={MAIL_STATUS.disabledReason}
      >
        <Lock className="h-3.5 w-3.5" />
        <Send className="h-3.5 w-3.5" />
        Envoyer
      </button>
      <span className="text-[10px] text-gray-400 flex items-center gap-1">
        <Lock className="h-2.5 w-2.5" />
        {MAIL_STATUS.disabledReason}
      </span>
    </div>
  )
}

/* ─── DRAFT ROW ───────────────────────────────────────────────────────────── */

function DraftListRow({
  draft, selected, onClick, onDelete,
}: {
  draft: DraftRow
  selected: boolean
  onClick: () => void
  onDelete: () => void
}) {
  const st = STATUS_CONFIG[draft.status]
  const tn = TONE_CONFIG[draft.tone]
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group',
        selected ? 'bg-brand-50 border-l-2 border-l-brand-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent',
      )}
    >
      {/* Status dot */}
      <div className={cn('h-2 w-2 rounded-full shrink-0', st.dot)} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-700 truncate">
            {draft.prospect?.company_name ?? '—'}
          </span>
          {draft.contact && (
            <>
              <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
              <span className="text-xs text-gray-500 truncate">
                {draft.contact.first_name} {draft.contact.last_name}
              </span>
            </>
          )}
        </div>
        <p className={cn('text-sm truncate', selected ? 'text-gray-900 font-medium' : 'text-gray-700')}>
          {draft.subject}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5 line-clamp-1 leading-relaxed">
          {draft.body.replace(/\n/g, ' ').slice(0, 120)}…
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-[10px] text-gray-400">{formatDate(draft.updated_at)}</span>
        <div className="flex items-center gap-1">
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', tn.color)}>
            {tn.label}
          </span>
          <span className="text-[10px] text-gray-400">#{draft.sequence_step}</span>
        </div>
      </div>

      {/* Delete (hover) */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/* ─── DRAFT PANEL ─────────────────────────────────────────────────────────── */

function DraftPanel({
  draft, onClose, onSave, onSetStatus, onDelete,
}: {
  draft: DraftRow
  onClose: () => void
  onSave: (data: UpdateDraftInput) => Promise<void>
  onSetStatus: (id: string, status: EmailDraftStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [mode, setMode]     = useState<PanelMode>('preview')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [editForm, setEditForm] = useState<UpdateDraftInput>({
    id: draft.id,
    subject: draft.subject,
    body: draft.body,
    tone: draft.tone,
    sequence_step: draft.sequence_step,
  })

  // Sync form when draft changes (panel stays open, data refreshes)
  useMemo(() => {
    setEditForm({ id: draft.id, subject: draft.subject, body: draft.body, tone: draft.tone, sequence_step: draft.sequence_step })
  }, [draft.id, draft.updated_at]) // eslint-disable-line react-hooks/exhaustive-deps

  const st = STATUS_CONFIG[draft.status]
  const tn = TONE_CONFIG[draft.tone]
  const to = contactLabel(draft)

  const handleSave = async () => {
    setSaving(true)
    await onSave(editForm)
    setSaving(false)
    setMode('preview')
  }

  const handleToggleReady = async () => {
    setStatusBusy(true)
    const next: EmailDraftStatus = draft.status === 'ready' ? 'draft' : 'ready'
    await onSetStatus(draft.id, next)
    setStatusBusy(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(draft.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-full max-w-[600px] bg-white shadow-2xl h-full flex flex-col border-l border-gray-200">

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border', st.color)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
              {st.label}
            </span>
            <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-full border', tn.color)}>
              {tn.label}
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Hash className="h-3 w-3" />{draft.sequence_step}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {mode === 'preview' && (
              <button
                onClick={() => setMode('edit')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                <Pencil className="h-3.5 w-3.5" /> Modifier
              </button>
            )}
            {mode === 'edit' && (
              <button
                onClick={() => setMode('preview')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                <Eye className="h-3.5 w-3.5" /> Aperçu
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── MODE PRÉVISUALISATION ── */}
          {mode === 'preview' && (
            <div className="p-5">
              {/* Email header */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 border border-gray-100">
                <div className="grid grid-cols-[56px_1fr] gap-2 text-xs">
                  <span className="text-gray-400 font-medium pt-0.5">De</span>
                  <span className="text-gray-500 italic">votre adresse email (à configurer)</span>
                </div>
                {to && (
                  <div className="grid grid-cols-[56px_1fr] gap-2 text-xs">
                    <span className="text-gray-400 font-medium pt-0.5">À</span>
                    <span className="text-gray-700 font-medium">{to}</span>
                  </div>
                )}
                <div className="grid grid-cols-[56px_1fr] gap-2 text-xs">
                  <span className="text-gray-400 font-medium pt-0.5">Objet</span>
                  <span className="text-gray-900 font-semibold">{draft.subject}</span>
                </div>
                <div className="grid grid-cols-[56px_1fr] gap-2 text-xs">
                  <span className="text-gray-400 font-medium pt-0.5">Prospect</span>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    {draft.prospect?.company_name ?? '—'}
                    {draft.prospect?.industry && <span className="text-gray-400">· {draft.prospect.industry}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-[56px_1fr] gap-2 text-xs border-t border-gray-200 pt-2">
                  <span className="text-gray-400 font-medium pt-0.5">Date</span>
                  <span className="text-gray-500">{formatDate(draft.updated_at, 'dd/MM/yyyy HH:mm')}</span>
                </div>
                {draft.ai_model && (
                  <div className="grid grid-cols-[56px_1fr] gap-2 text-xs">
                    <span className="text-gray-400 font-medium pt-0.5">IA</span>
                    <span className="text-brand-600 flex items-center gap-1">
                      <Wand2 className="h-3 w-3" />{draft.ai_model}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {draft.body}
                </pre>
              </div>

              {draft.sent_at && (
                <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Envoyé le {formatDate(draft.sent_at, 'dd/MM/yyyy à HH:mm')}
                </p>
              )}
            </div>
          )}

          {/* ── MODE ÉDITION ── */}
          {mode === 'edit' && (
            <div className="p-5 space-y-4">
              {/* AI generate placeholder */}
              <div className="bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl p-3.5 border border-brand-100 flex items-start gap-3">
                <Wand2 className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-brand-700 mb-0.5">Génération IA</p>
                  <p className="text-xs text-brand-500">Rédaction automatique par Claude — à connecter dans une prochaine étape.</p>
                </div>
                <button disabled className="text-xs px-2.5 py-1 bg-white border border-brand-200 rounded-lg text-brand-400 cursor-not-allowed opacity-60 shrink-0">
                  Générer
                </button>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Objet
                </label>
                <input
                  value={editForm.subject}
                  onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                />
              </div>

              {/* Tone + Seq */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Palette className="h-3 w-3" /> Ton
                  </label>
                  <select
                    value={editForm.tone}
                    onChange={e => setEditForm(f => ({ ...f, tone: e.target.value as EmailDraftTone }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                  >
                    {TONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Email séquence
                  </label>
                  <input
                    type="number" min={1} max={10}
                    value={editForm.sequence_step}
                    onChange={e => setEditForm(f => ({ ...f, sequence_step: Number(e.target.value) }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                  />
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Corps de l'email
                </label>
                <textarea
                  value={editForm.body}
                  onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                  rows={14}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition leading-relaxed font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1 text-right">
                  {editForm.body?.length ?? 0} caractères
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          {mode === 'preview' ? (
            <div className="space-y-3">
              {/* Actions principales */}
              <div className="flex items-center gap-2">
                {draft.status !== 'sent' && draft.status !== 'failed' && (
                  <Button
                    variant={draft.status === 'ready' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={handleToggleReady}
                    disabled={statusBusy}
                  >
                    {statusBusy ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : draft.status === 'ready' ? (
                      <><Clock className="h-3.5 w-3.5" /> Remettre en brouillon</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Marquer comme prêt</>
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setMode('edit')}>
                  <Pencil className="h-3.5 w-3.5" /> Modifier
                </Button>
                <Button
                  variant="danger" size="sm"
                  onClick={handleDelete} disabled={deleting}
                  className="ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? 'Suppression…' : 'Supprimer'}
                </Button>
              </div>
              {/* Send button — toujours désactivé */}
              <div className="pt-2 border-t border-gray-50">
                <SendButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setMode('preview')}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !editForm.subject || !editForm.body}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── MODAL NOUVEAU BROUILLON ─────────────────────────────────────────────── */

function NewDraftModal({
  open, onClose, onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateDraftInput) => Promise<void>
}) {
  const { data: prospects = [], isLoading } = useProspectsForDraft()
  const [form, setForm] = useState<CreateDraftInput>(EMPTY_CREATE)
  const [creating, setCreating] = useState(false)

  const selectedProspect = prospects.find(p => p.id === form.prospect_id)

  const handleCreate = async () => {
    if (!form.prospect_id || !form.subject || !form.body) return
    setCreating(true)
    await onCreate({ ...form, prospect_contact_id: form.prospect_contact_id || undefined })
    setCreating(false)
    onClose()
    setForm(EMPTY_CREATE)
  }

  const set = (k: keyof CreateDraftInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau brouillon"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !form.prospect_id || !form.subject || !form.body}
          >
            {creating ? 'Création…' : 'Créer le brouillon'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* AI placeholder */}
        <div className="bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl p-3 border border-brand-100 flex items-center gap-3">
          <Wand2 className="h-4 w-4 text-brand-400 shrink-0" />
          <p className="text-xs text-brand-600 flex-1">
            Génération automatique par IA — à connecter dans une prochaine étape.
          </p>
          <button disabled className="text-xs px-3 py-1.5 bg-white border border-brand-200 rounded-lg text-brand-400 cursor-not-allowed opacity-60">
            Générer avec l'IA
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Prospect */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1 block">
              <Building2 className="h-3.5 w-3.5" /> Prospect *
            </label>
            <select
              value={form.prospect_id}
              onChange={e => setForm(f => ({ ...f, prospect_id: e.target.value, prospect_contact_id: '' }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
            >
              <option value="">
                {isLoading ? 'Chargement…' : '— Sélectionner un prospect —'}
              </option>
              {prospects.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
            </select>
          </div>

          {/* Contact */}
          {selectedProspect && (
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1 block">
                <User className="h-3.5 w-3.5" /> Contact destinataire
              </label>
              <select
                value={form.prospect_contact_id ?? ''}
                onChange={set('prospect_contact_id')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
              >
                <option value="">— Aucun contact spécifique —</option>
                {selectedProspect.contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}{c.email ? ` <${c.email}>` : ''}{c.is_primary ? ' ★' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ton + Séquence */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1 block">
              <Palette className="h-3.5 w-3.5" /> Ton
            </label>
            <select value={form.tone} onChange={set('tone')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition">
              {TONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1 block">
              <Hash className="h-3.5 w-3.5" /> Email #
            </label>
            <input type="number" min={1} max={10} value={form.sequence_step}
              onChange={e => setForm(f => ({ ...f, sequence_step: Number(e.target.value) }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
          </div>

          {/* Subject */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Objet *</label>
            <input value={form.subject} onChange={set('subject')} autoFocus
              placeholder="Ex : Création de votre site web — proposition CA-TECH"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
          </div>

          {/* Body */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Corps de l'email *
            </label>
            <textarea value={form.body} onChange={set('body')} rows={8}
              placeholder="Bonjour [Prénom],&#10;&#10;Je me permets de vous contacter…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition leading-relaxed" />
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */

export function ProspectionBrouillons() {
  const [tab, setTab]         = useState<FilterTab>('all')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState<DraftRow | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<DraftRow | null>(null)

  const { data: drafts = [], isLoading, refetch, isFetching } = useEmailDrafts()
  const createDraft  = useCreateDraft()
  const updateDraft  = useUpdateDraft()
  const setStatus    = useSetDraftStatus()
  const deleteDraft  = useDeleteDraft()

  /* Filtrage */
  const filtered = useMemo(() => {
    let list = drafts
    if (tab !== 'all') list = list.filter(d => d.status === tab)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.subject.toLowerCase().includes(q) ||
        (d.prospect?.company_name ?? '').toLowerCase().includes(q) ||
        (d.contact ? `${d.contact.first_name} ${d.contact.last_name}`.toLowerCase().includes(q) : false),
      )
    }
    return list
  }, [drafts, tab, search])

  /* Stats */
  const counts = useMemo(() => ({
    all:    drafts.length,
    draft:  drafts.filter(d => d.status === 'draft').length,
    ready:  drafts.filter(d => d.status === 'ready').length,
    sent:   drafts.filter(d => d.status === 'sent').length,
    failed: drafts.filter(d => d.status === 'failed').length,
  }), [drafts])

  /* Handlers */
  const handleSave = async (data: UpdateDraftInput) => {
    await updateDraft.mutateAsync(data)
    const fresh = drafts.find(d => d.id === data.id)
    if (fresh) setSelected({ ...fresh, ...data })
  }

  const handleSetStatus = async (id: string, status: EmailDraftStatus) => {
    await setStatus.mutateAsync({ id, status })
  }

  const handleDelete = async (id: string) => {
    await deleteDraft.mutateAsync(id)
    if (selected?.id === id) setSelected(null)
    setConfirmDelete(null)
  }

  const handleCreate = async (data: CreateDraftInput) => {
    await createDraft.mutateAsync(data)
  }

  // Sync selected when data refreshes
  useMemo(() => {
    if (selected) {
      const fresh = drafts.find(d => d.id === selected.id)
      if (fresh) setSelected(fresh)
    }
  }, [drafts]) // eslint-disable-line react-hooks/exhaustive-deps

  const TABS: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all',    label: 'Tous',             count: counts.all },
    { value: 'draft',  label: 'Brouillons',        count: counts.draft },
    { value: 'ready',  label: 'Prêts',             count: counts.ready },
    { value: 'sent',   label: 'Envoyés',            count: counts.sent },
    { value: 'failed', label: 'Échoués',            count: counts.failed },
  ]

  return (
    <Layout
      title="Brouillons"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau brouillon
          </Button>
        </div>
      }
    >

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          <p className="text-xs text-gray-400 mt-1">brouillons</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <p className="text-xs text-gray-500">Brouillons</p>
          </div>
          <p className="text-2xl font-bold text-gray-700">{counts.draft}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs text-gray-500">Prêts</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{counts.ready}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="h-3.5 w-3.5 text-gray-300" />
            <p className="text-xs text-gray-500">Envoi</p>
          </div>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {MAIL_STATUS.disabledReason}
          </p>
        </Card>
      </div>

      {/* ── FILTRES ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'text-xs font-medium px-2.5 py-1.5 rounded-md transition flex items-center gap-1.5',
                tab === t.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                  tab === t.value ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500',
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />}
          className="w-56"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition">
            <X className="h-3 w-3" /> Effacer
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} email{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── LISTE ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 text-gray-300 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center">
              <FilePen className="h-6 w-6 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Aucun brouillon</p>
              <p className="text-xs text-gray-400 mt-1">
                {tab !== 'all' ? 'Aucun email dans cette catégorie' : 'Créez votre premier brouillon'}
              </p>
            </div>
            {tab === 'all' && (
              <Button size="sm" onClick={() => setShowNew(true)}>
                <Plus className="h-3.5 w-3.5" /> Nouveau brouillon
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card padding={false} className="divide-y divide-gray-50 overflow-hidden">
          {filtered.map(d => (
            <DraftListRow
              key={d.id}
              draft={d}
              selected={selected?.id === d.id}
              onClick={() => setSelected(d)}
              onDelete={() => setConfirmDelete(d)}
            />
          ))}
        </Card>
      )}

      {/* ── PANEL ──────────────────────────────────────────────────────────── */}
      {selected && (
        <DraftPanel
          draft={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onSetStatus={handleSetStatus}
          onDelete={async () => { setConfirmDelete(selected) }}
        />
      )}

      {/* ── MODAL NOUVEAU ──────────────────────────────────────────────────── */}
      <NewDraftModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={handleCreate}
      />

      {/* ── MODAL CONFIRMATION SUPPRESSION ────────────────────────────────── */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer ce brouillon"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Annuler</Button>
            <Button variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete.id)}>
              <Trash2 className="h-3.5 w-3.5" /> Supprimer
            </Button>
          </>
        }
      >
        {confirmDelete && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Ce brouillon sera supprimé définitivement.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-700 truncate">{confirmDelete.subject}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {confirmDelete.prospect?.company_name}
                {confirmDelete.contact && ` → ${confirmDelete.contact.first_name} ${confirmDelete.contact.last_name}`}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
