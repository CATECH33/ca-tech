import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft, Building2, Globe, Phone, Mail, MapPin, ExternalLink,
  Star, Sparkles, Tag, Plus, Send, BellRing, Paperclip, FileText, Link2,
  CheckCircle2, XCircle, Calendar, Clock, BarChart2, User, MessageSquare,
  Zap, Edit3, Check, Plug, RefreshCw, Loader2, ChevronDown, Trash2,
  AlertCircle, Info,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Badge } from '@/components/ui/Badge'
import { cn, statusLabel, statusColor } from '@/lib/utils'
import {
  useProspects, useUpdateProspect, useAddActivity, useSaveNotes, useSaveRelances,
  getNotes, getRelances, getAnalyse,
  type ProspectRow, type ProspectActivity, type Relance, type RelanceType,
} from '@/hooks/useProspects'
import { getAudit } from '@/hooks/useAudit'
import { getRecommendations } from '@/hooks/useRecommendations'
import { computeScoreCommercial, OPPORTUNITY_CONFIG } from '@/lib/scoreCommercial'
import type { ProspectStatus } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type DetailTab = 'activites' | 'notes' | 'emails' | 'relances' | 'documents'

const RELANCE_TYPE_LABELS: Record<RelanceType, string> = {
  email:    'Email',
  appel:    'Appel',
  linkedin: 'LinkedIn',
  autre:    'Autre',
}

// ── Activity helpers ──────────────────────────────────────────────────────────

const ACTIVITY_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  email_sent:     { icon: Mail,         color: 'text-blue-500 bg-blue-50',     label: 'Email envoyé' },
  email_opened:   { icon: Mail,         color: 'text-indigo-500 bg-indigo-50', label: 'Email ouvert' },
  email_replied:  { icon: Mail,         color: 'text-green-500 bg-green-50',   label: 'Email répondu' },
  call:           { icon: Phone,        color: 'text-emerald-500 bg-emerald-50', label: 'Appel' },
  meeting:        { icon: Calendar,     color: 'text-violet-500 bg-violet-50', label: 'RDV' },
  note_added:     { icon: FileText,     color: 'text-amber-500 bg-amber-50',   label: 'Note ajoutée' },
  status_changed: { icon: RefreshCw,    color: 'text-gray-400 bg-gray-100',    label: 'Statut modifié' },
  relance:        { icon: BellRing,     color: 'text-orange-500 bg-orange-50', label: 'Relance' },
  score_updated:  { icon: BarChart2,    color: 'text-slate-500 bg-slate-100',  label: 'Score mis à jour' },
  task_completed: { icon: CheckCircle2, color: 'text-teal-500 bg-teal-50',     label: 'Tâche terminée' },
  contacted:      { icon: User,         color: 'text-brand-500 bg-brand-50',   label: 'Contacté' },
  created:        { icon: Zap,          color: 'text-brand-500 bg-brand-50',   label: 'Créé' },
}

function activityMeta(type: string) {
  return ACTIVITY_META[type] ?? { icon: MessageSquare, color: 'text-gray-400 bg-gray-100', label: type }
}

// ── Left panel ────────────────────────────────────────────────────────────────

function LeftPanel({ prospect }: { prospect: ProspectRow }) {
  const navigate = useNavigate()
  const updateProspect = useUpdateProspect()
  const [editingStatus, setEditingStatus] = useState(false)

  const audit   = getAudit(prospect)
  const analyse = getAnalyse(prospect)
  const reco    = getRecommendations(prospect)
  const score   = computeScoreCommercial(prospect, audit, analyse)
  const oppConf = OPPORTUNITY_CONFIG[score.opportunity]

  const contact = prospect.contacts.find(c => c.is_primary) ?? prospect.contacts[0] ?? null

  const STATUSES: ProspectStatus[] = ['new', 'researching', 'qualified', 'contacted', 'responded', 'meeting', 'converted', 'disqualified']
  const STATUS_LABELS: Record<ProspectStatus, string> = {
    new: 'Nouveau', researching: 'En recherche', qualified: 'Qualifié',
    email_ready: 'Email prêt', contacted: 'Contacté', responded: 'A répondu',
    meeting: 'RDV planifié', proposal_sent: 'Proposition envoyée',
    contract_signed: 'Contrat signé', converted: 'Converti',
    project_started: 'Projet démarré', disqualified: 'Disqualifié',
  }

  return (
    <div className="w-[300px] shrink-0 border-r border-gray-100 overflow-y-auto bg-white flex flex-col">

      {/* Company identity */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-brand-600">
              {prospect.company_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
              {prospect.company_name}
            </h2>
            {prospect.industry && (
              <p className="text-xs text-gray-500 mt-0.5">{prospect.industry}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {editingStatus ? (
            <select
              autoFocus
              value={prospect.status}
              onChange={e => {
                updateProspect.mutate({ id: prospect.id, status: e.target.value as ProspectStatus })
                setEditingStatus(false)
              }}
              onBlur={() => setEditingStatus(false)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 w-full"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingStatus(true)}
              className="flex items-center gap-1.5 group"
            >
              <Badge status={prospect.status} dot />
              <Edit3 className="h-2.5 w-2.5 text-gray-300 group-hover:text-gray-400 transition" />
            </button>
          )}
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {prospect.website && (
            <a href={prospect.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-brand-500 bg-gray-50 hover:bg-brand-50 px-2 py-1 rounded-lg border border-gray-100 transition">
              <Globe className="h-3 w-3" /> Site web
            </a>
          )}
          {prospect.linkedin_url && (
            <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded-lg border border-gray-100 transition">
              <Link2 className="h-3 w-3" /> LinkedIn
            </a>
          )}
          <button
            onClick={() => navigate(`/prospection/prospects`)}
            className="flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg border border-gray-100 transition">
            <BarChart2 className="h-3 w-3" /> Pipeline
          </button>
        </div>
      </div>

      {/* Score commercial */}
      {score.score > 0 && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Score commercial</p>
          <div className="flex items-center gap-3">
            <span className={cn(
              'text-2xl font-black tabular-nums',
              score.opportunity === 'very_high' ? 'text-emerald-600' :
              score.opportunity === 'medium'    ? 'text-amber-500' : 'text-slate-400',
            )}>
              {score.score.toFixed(1)}
              <span className="text-xs text-gray-300 font-normal">/10</span>
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={cn(
                  'h-4 w-4',
                  i < score.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100',
                )} />
              ))}
            </div>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full border',
            oppConf.bg, oppConf.text, oppConf.border,
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', oppConf.dot)} />
            {oppConf.label}
          </span>
        </div>
      )}

      {/* Recommandation IA */}
      {reco && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommandation IA</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
              reco.priority === 'A' ? 'bg-emerald-500' : reco.priority === 'B' ? 'bg-amber-500' : 'bg-slate-400',
            )}>
              {reco.priority}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {reco.priority === 'A' ? 'Contacter sous 48 h' : reco.priority === 'B' ? 'Potentiel à développer' : 'Faible potentiel'}
            </span>
          </div>
          {reco.recommendation && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{reco.recommendation}</p>
          )}
        </div>
      )}

      {/* Entreprise */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Entreprise</p>
        <ul className="space-y-2">
          {prospect.company_size && (
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Building2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              {prospect.company_size} employés
            </li>
          )}
          {(prospect.city || prospect.country) && (
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              {[prospect.city, prospect.country].filter(Boolean).join(', ')}
            </li>
          )}
          {prospect.website && (
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Globe className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              <a href={prospect.website} target="_blank" rel="noopener noreferrer"
                className="text-brand-500 hover:underline truncate">
                {prospect.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </li>
          )}
          <li className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            Ajouté le {format(new Date(prospect.created_at), 'd MMM yyyy', { locale: fr })}
          </li>
        </ul>
      </div>

      {/* Décideur */}
      {contact && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Décideur</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
              {contact.first_name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '—'}
              </p>
              {contact.job_title && <p className="text-[11px] text-gray-400 truncate">{contact.job_title}</p>}
            </div>
          </div>
          <ul className="space-y-1.5 mt-2">
            {contact.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-xs text-brand-500 hover:underline truncate">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <a href={`tel:${contact.phone}`} className="text-xs text-gray-600 hover:text-gray-800 truncate">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.linkedin_url && (
              <li className="flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate">
                  Profil LinkedIn
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Tags */}
      {prospect.tags.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {prospect.tags.map(tag => (
              <span key={tag} className="text-[11px] text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connecteurs */}
      <div className="px-5 py-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Connecteurs</p>
        <ul className="space-y-2">
          {[
            { label: 'Gmail',         icon: Mail,      status: 'active',  hint: 'Emails synchronisés' },
            { label: 'Google Drive',  icon: Paperclip, status: 'active',  hint: 'Documents liés' },
            { label: 'LinkedIn',      icon: Link2,  status: 'pending', hint: 'Connecteur à venir' },
            { label: 'Clearbit',      icon: Zap,       status: 'pending', hint: 'Enrichissement auto' },
          ].map(c => (
            <li key={c.label} className="flex items-center gap-2">
              <c.icon className={cn('h-3.5 w-3.5 shrink-0', c.status === 'active' ? 'text-emerald-500' : 'text-gray-300')} />
              <span className={cn('text-xs flex-1', c.status === 'active' ? 'text-gray-700' : 'text-gray-400')}>
                {c.label}
              </span>
              {c.status === 'active'
                ? <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Actif</span>
                : (
                  <Link to="/integrations" className="text-[10px] text-gray-400 hover:text-brand-500 transition">
                    Configurer
                  </Link>
                )
              }
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Activities tab ────────────────────────────────────────────────────────────

function ActivitiesTab({ prospect }: { prospect: ProspectRow }) {
  const addActivity = useAddActivity()
  const [note, setNote] = useState('')
  const [type, setType] = useState('note_added')

  const sorted = [...prospect.activities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleAdd = async () => {
    if (!note.trim()) return
    await addActivity.mutateAsync({ prospectId: prospect.id, type, description: note })
    setNote('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add form */}
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex gap-2 mb-2">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          >
            <option value="note_added">Note</option>
            <option value="email_sent">Email envoyé</option>
            <option value="call">Appel</option>
            <option value="meeting">RDV</option>
            <option value="contacted">Contacté</option>
          </select>
        </div>
        <div className="flex gap-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ajouter une note ou une activité…"
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAdd() }}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
          />
          <button
            onClick={handleAdd}
            disabled={!note.trim() || addActivity.isPending}
            className="px-3 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 text-white rounded-xl transition self-end"
          >
            {addActivity.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-8 w-8 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Aucune activité enregistrée</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
            <ul className="space-y-4">
              {sorted.map(act => {
                const meta = activityMeta(act.type)
                const Icon = meta.icon
                return (
                  <li key={act.id} className="flex gap-4 relative">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white', meta.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
                        <span className="text-[11px] text-gray-400">
                          {formatDistanceToNow(new Date(act.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{act.description}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Notes tab ─────────────────────────────────────────────────────────────────

function NotesTab({ prospect }: { prospect: ProspectRow }) {
  const saveNotes = useSaveNotes()
  const initial   = getNotes(prospect)
  const [text, setText] = useState(initial)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setText(getNotes(prospect)) }, [prospect.id])

  const handleSave = async () => {
    await saveNotes.mutateAsync({ prospectId: prospect.id, notes: text })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full px-6 py-5 gap-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Rédigez vos notes sur ce prospect : contexte, points clés, informations importantes…"
        className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition min-h-[200px]"
      />
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">{text.length} caractères</p>
        <button
          onClick={handleSave}
          disabled={saveNotes.isPending || text === initial}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition',
            saved
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-brand-500 hover:bg-brand-600 text-white disabled:bg-gray-100 disabled:text-gray-400',
          )}
        >
          {saveNotes.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

// ── Emails tab ────────────────────────────────────────────────────────────────

function EmailsTab({ prospect }: { prospect: ProspectRow }) {
  const emails = ((prospect.metadata as Record<string, unknown> | null)?.emails as unknown[]) ?? []

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 py-12">
        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Mail className="h-7 w-7 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Historique des emails</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Connectez Gmail pour voir automatiquement les échanges avec ce prospect.
          </p>
        </div>
        <Link
          to="/integrations"
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition"
        >
          <Plug className="h-4 w-4" />
          Connecter Gmail
        </Link>
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-4 w-full max-w-sm">
          <p className="text-[11px] text-gray-400 text-left leading-relaxed">
            <span className="font-semibold text-gray-500">Données attendues :</span><br />
            expéditeur, destinataire, objet, date, extrait, fil de discussion
          </p>
        </div>
      </div>
    )
  }

  return <div className="p-6 text-sm text-gray-500">Emails à afficher ici.</div>
}

// ── Relances tab ──────────────────────────────────────────────────────────────

function RelancesTab({ prospect }: { prospect: ProspectRow }) {
  const saveRelances = useSaveRelances()
  const relances     = getRelances(prospect)

  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate]     = useState(today)
  const [type, setType]     = useState<RelanceType>('email')
  const [note, setNote]     = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    const newRelance: Relance = {
      id: crypto.randomUUID(),
      date,
      type,
      note: note || undefined,
      done: false,
      created_at: new Date().toISOString(),
    }
    await saveRelances.mutateAsync({ prospectId: prospect.id, relances: [...relances, newRelance] })
    setDate(today); setNote(''); setAdding(false)
  }

  const handleToggle = async (id: string) => {
    const updated = relances.map(r => r.id === id ? { ...r, done: !r.done } : r)
    await saveRelances.mutateAsync({ prospectId: prospect.id, relances: updated })
  }

  const handleDelete = async (id: string) => {
    await saveRelances.mutateAsync({ prospectId: prospect.id, relances: relances.filter(r => r.id !== id) })
  }

  const sorted = [...relances].sort((a, b) => a.date.localeCompare(b.date))
  const pending = sorted.filter(r => !r.done)
  const done    = sorted.filter(r => r.done)

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl border border-brand-200 transition w-full justify-center"
          >
            <Plus className="h-4 w-4" /> Planifier une relance
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                min={today}
                onChange={e => setDate(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              />
              <select
                value={type}
                onChange={e => setType(e.target.value as RelanceType)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              >
                {Object.entries(RELANCE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note optionnelle…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saveRelances.isPending}
                className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition"
              >
                {saveRelances.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Ajouter'}
              </button>
              <button
                onClick={() => setAdding(false)}
                className="px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {relances.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BellRing className="h-8 w-8 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Aucune relance planifiée</p>
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">À faire</p>
            {pending.map(r => (
              <RelanceRow key={r.id} relance={r} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
        {done.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Effectuées</p>
            {done.map(r => (
              <RelanceRow key={r.id} relance={r} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RelanceRow({ relance, onToggle, onDelete }: { relance: Relance; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const isPast = relance.date < format(new Date(), 'yyyy-MM-dd') && !relance.done
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-xl border transition group',
      relance.done ? 'bg-gray-50 border-gray-100 opacity-60' : isPast ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100 shadow-sm',
    )}>
      <button onClick={() => onToggle(relance.id)}
        className={cn('h-5 w-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition',
          relance.done ? 'border-emerald-400 bg-emerald-400' : 'border-gray-300 hover:border-brand-400',
        )}>
        {relance.done && <Check className="h-3 w-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-700">{RELANCE_TYPE_LABELS[relance.type]}</span>
          <span className={cn('text-[11px]', isPast ? 'text-red-500 font-medium' : 'text-gray-400')}>
            {isPast ? '⚠ ' : ''}{format(new Date(relance.date), 'd MMM yyyy', { locale: fr })}
          </span>
        </div>
        {relance.note && <p className="text-xs text-gray-500 mt-0.5">{relance.note}</p>}
      </div>
      <button onClick={() => onDelete(relance.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition">
        <Trash2 className="h-3.5 w-3.5 text-red-400" />
      </button>
    </div>
  )
}

// ── Documents tab ─────────────────────────────────────────────────────────────

function DocumentsTab({ prospect }: { prospect: ProspectRow }) {
  const docs = ((prospect.metadata as Record<string, unknown> | null)?.documents as unknown[]) ?? []
  const driveFolderId = ((prospect.metadata as Record<string, unknown> | null)?.drive_folder_id as string | undefined)

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-4">
      {/* Drive folder */}
      {driveFolderId ? (
        <a
          href={`https://drive.google.com/drive/folders/${driveFolderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition"
        >
          <Paperclip className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Dossier Google Drive</p>
            <p className="text-xs text-emerald-600">Ouvrir le dossier du prospect</p>
          </div>
          <ExternalLink className="h-4 w-4 text-emerald-500 ml-auto" />
        </a>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 flex items-center gap-3">
          <Paperclip className="h-5 w-5 text-gray-300 shrink-0" />
          <p className="text-xs text-gray-400">Dossier Google Drive non trouvé</p>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-8">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Paperclip className="h-7 w-7 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Documents</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Les documents liés à ce prospect apparaîtront ici via Google Drive ou en import direct.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 p-4 w-full max-w-sm text-left">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-500">Données attendues :</span><br />
              nom, URL, type (PDF/Word/…), source (Drive/import), date
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS: { key: DetailTab; label: string; icon: React.ElementType }[] = [
  { key: 'activites',  label: 'Activités',  icon: Clock },
  { key: 'notes',      label: 'Notes',      icon: FileText },
  { key: 'emails',     label: 'Emails',     icon: Mail },
  { key: 'relances',   label: 'Relances',   icon: BellRing },
  { key: 'documents',  label: 'Documents',  icon: Paperclip },
]

export function ProspectionProspectDetail() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { data: prospects = [], isLoading } = useProspects()

  const [tab, setTab] = useState<DetailTab>('activites')

  const prospect = prospects.find(p => p.id === id) ?? null

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </Layout>
    )
  }

  if (!prospect) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-gray-600">Prospect introuvable.</p>
          <button onClick={() => navigate('/prospection/prospects')}
            className="text-sm text-brand-500 hover:underline">
            Retour aux prospects
          </button>
        </div>
      </Layout>
    )
  }

  const relancesCount = getRelances(prospect).filter(r => !r.done).length

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/prospection/prospects')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Prospects
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-800">{prospect.company_name}</span>
          </div>
          <div className="flex items-center gap-2">
            {prospect.website && (
              <a href={prospect.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">
                <Globe className="h-3.5 w-3.5" /> Site web
              </a>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left panel */}
          <LeftPanel prospect={prospect} />

          {/* Right: tabs + content */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 bg-white shrink-0 px-2">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition relative',
                    tab === key
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {key === 'relances' && relancesCount > 0 && (
                    <span className="ml-0.5 text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full leading-none">
                      {relancesCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {tab === 'activites'  && <ActivitiesTab  prospect={prospect} />}
              {tab === 'notes'      && <NotesTab       prospect={prospect} />}
              {tab === 'emails'     && <EmailsTab      prospect={prospect} />}
              {tab === 'relances'   && <RelancesTab    prospect={prospect} />}
              {tab === 'documents'  && <DocumentsTab   prospect={prospect} />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
