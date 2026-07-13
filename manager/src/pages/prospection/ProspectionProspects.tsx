import { useState, useMemo, useEffect } from 'react'
import {
  Plus, Search, X, LayoutGrid, List, Download, ExternalLink,
  Building2, MapPin, Globe, Phone, Mail, User, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight as ChevronRightIcon, Sparkles, Trash2,
  Link2, RefreshCw, SlidersHorizontal, Calendar, Clock, Video,
  CheckCircle2, AlertCircle, CalendarPlus, FolderOpen, FolderPlus,
  BarChart2, Gauge, Star,
} from 'lucide-react'
import { ProspectAnalysePanel } from '@/components/prospection/ProspectAnalysePanel'
import { ProspectAuditPanel } from '@/components/prospection/ProspectAuditPanel'
import { ProspectRecommendPanel } from '@/components/prospection/ProspectRecommendPanel'
import { ProspectScorePanel } from '@/components/prospection/ProspectScorePanel'
import { getAnalyse } from '@/hooks/useProspects'
import { getAudit } from '@/hooks/useAudit'
import { getRecommendations } from '@/hooks/useRecommendations'
import { computeScoreCommercial, OPPORTUNITY_CONFIG } from '@/lib/scoreCommercial'
import {
  useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent, useSyncCalendarEvents,
  type CalendarEventType, type CreateCalendarEventInput,
} from '@/hooks/useCalendarEvents'
import { useCreateDriveFolder } from '@/hooks/useGoogleDrive'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { cn, formatDate, statusColor, statusLabel } from '@/lib/utils'
import {
  useProspects, useCreateProspect, useUpdateProspect, useDeleteProspect,
  type ProspectRow, type CreateProspectInput,
} from '@/hooks/useProspects'
import type { ProspectStatus, ProspectSource } from '@/types'

/* ─── CONSTANTES ──────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20

type ViewMode = 'table' | 'cards'
type SortField = 'company_name' | 'score' | 'created_at' | 'last_activity' | 'status'
type SortDir = 'asc' | 'desc'

const PROSPECT_STATUSES: { value: ProspectStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'new', label: 'Nouveau' },
  { value: 'researching', label: 'En recherche' },
  { value: 'qualified', label: 'Qualifié' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'responded', label: 'A répondu' },
  { value: 'meeting', label: 'RDV planifié' },
  { value: 'converted', label: 'Converti' },
  { value: 'disqualified', label: 'Disqualifié' },
]

const SOURCES: { value: ProspectSource | ''; label: string }[] = [
  { value: '', label: 'Toutes sources' },
  { value: 'manual', label: 'Manuel' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'search', label: 'Recherche' },
  { value: 'referral', label: 'Référence' },
  { value: 'import', label: 'Import' },
  { value: 'other', label: 'Autre' },
]

const FORM_INIT: CreateProspectInput = {
  company_name: '', website: '', industry: '', company_size: '',
  country: 'France', city: '', status: 'new', source: 'manual',
  linkedin_url: '', tags: [],
}

const ACTIVITY_LABELS: Record<string, string> = {
  email_sent: 'Email envoyé', email_opened: 'Email ouvert', email_replied: 'Email répondu',
  call: 'Appel', meeting: 'RDV', note_added: 'Note ajoutée',
  status_changed: 'Statut modifié', score_updated: 'Score mis à jour',
  task_completed: 'Tâche terminée', contacted: 'Contacté',
}

/* ─── UTILITAIRES ─────────────────────────────────────────────────────────── */

function getPrimaryContact(p: ProspectRow) {
  return p.contacts.find(c => c.is_primary) ?? p.contacts[0] ?? null
}

function getLastActivity(p: ProspectRow) {
  if (!p.activities.length) return null
  return [...p.activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50'
  if (score >= 60) return 'text-blue-600 bg-blue-50'
  if (score >= 40) return 'text-amber-600 bg-amber-50'
  return 'text-red-500 bg-red-50'
}

function getScoreBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 60) return 'bg-blue-400'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

function getSourceIcon(source: string) {
  const m: Record<string, string> = {
    linkedin: '🔗', search: '🔍', referral: '🤝',
    import: '📥', manual: '✍️', other: '📌',
  }
  return m[source] ?? '📌'
}

function relativeDays(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff}j`
  if (diff < 30) return `Il y a ${Math.floor(diff / 7)}sem`
  return formatDate(dateStr)
}

/** Google Sheets-ready: replace body with Sheets API call when credentials available */
function exportToCSV(prospects: ProspectRow[]) {
  const headers = [
    'ID', 'Entreprise', 'Ville', 'Pays', 'Secteur', 'Taille', 'Site web', 'LinkedIn',
    'Statut', 'Score IA', 'Source', 'Décideur', 'Poste', 'Email', 'Téléphone',
    'Dernière action', 'Tags', 'Créé le',
  ]
  const rows = prospects.map(p => {
    const contact = getPrimaryContact(p)
    const lastAct = getLastActivity(p)
    return [
      p.id, p.company_name, p.city ?? '', p.country ?? '', p.industry ?? '',
      p.company_size ?? '', p.website ?? '', p.linkedin_url ?? '',
      statusLabel(p.status), p.score, p.source,
      contact ? `${contact.first_name} ${contact.last_name}` : '',
      contact?.job_title ?? '', contact?.email ?? '', contact?.phone ?? '',
      lastAct ? `${ACTIVITY_LABELS[lastAct.type] ?? lastAct.type} — ${formatDate(lastAct.created_at)}` : '',
      p.tags.join('; '), formatDate(p.created_at),
    ]
  })
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prospects_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ─── SCORE BADGE ─────────────────────────────────────────────────────────── */

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex flex-col gap-1 w-14">
      <div className={cn('text-xs font-bold text-center rounded-md px-1.5 py-0.5', getScoreColor(score))}>
        {score}
      </div>
      <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getScoreBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

/* ─── SORT HEADER ─────────────────────────────────────────────────────────── */

function SortTh({
  field, label, current, dir, onSort, className,
}: {
  field: SortField; label: string
  current: SortField; dir: SortDir
  onSort: (f: SortField) => void
  className?: string
}) {
  const active = current === field
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer select-none',
        active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700',
        className,
      )}
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="flex flex-col -space-y-0.5 opacity-50">
          <ChevronUp className={cn('h-2.5 w-2.5', active && dir === 'asc' && 'opacity-100 text-brand-600')} />
          <ChevronDown className={cn('h-2.5 w-2.5', active && dir === 'desc' && 'opacity-100 text-brand-600')} />
        </span>
      </span>
    </th>
  )
}

/* ─── TABLE VIEW ──────────────────────────────────────────────────────────── */

function TableView({
  prospects, sortField, sortDir, onSort, onOpen,
}: {
  prospects: ProspectRow[]
  sortField: SortField; sortDir: SortDir
  onSort: (f: SortField) => void
  onOpen: (p: ProspectRow) => void
}) {
  const sh = { current: sortField, dir: sortDir, onSort } as const
  return (
    <Card padding={false}>
      <Table>
        <Thead>
          <Tr>
            <SortTh field="company_name" label="Entreprise" {...sh} />
            <Th>Ville</Th>
            <Th>Secteur</Th>
            <Th>Téléphone</Th>
            <Th>Email</Th>
            <Th>Site web</Th>
            <Th>Décideur</Th>
            <SortTh field="status" label="Statut" {...sh} />
            <SortTh field="score" label="Score IA" {...sh} />
            <SortTh field="last_activity" label="Dernière action" {...sh} />
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {prospects.length === 0 ? (
            <EmptyRow cols={11} message="Aucun prospect trouvé" />
          ) : prospects.map(p => {
            const contact = getPrimaryContact(p)
            const lastAct = getLastActivity(p)
            return (
              <Tr key={p.id} onClick={() => onOpen(p)} className="cursor-pointer">
                {/* Entreprise */}
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.company_name}</p>
                      {p.source && (
                        <p className="text-[11px] text-gray-400">
                          {getSourceIcon(p.source)} {p.source}
                        </p>
                      )}
                    </div>
                  </div>
                </Td>
                {/* Ville */}
                <Td>
                  {p.city
                    ? <span className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-300" />{p.city}</span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Secteur */}
                <Td>
                  {p.industry
                    ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.industry}</span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Téléphone */}
                <Td onClick={e => e.stopPropagation()}>
                  {contact?.phone
                    ? <a href={`tel:${contact.phone}`} className="text-xs text-gray-500 hover:text-brand-600 flex items-center gap-1 transition">
                        <Phone className="h-3 w-3" />{contact.phone}
                      </a>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Email */}
                <Td onClick={e => e.stopPropagation()}>
                  {contact?.email
                    ? <a href={`mailto:${contact.email}`} className="text-xs text-gray-500 hover:text-brand-600 flex items-center gap-1 transition">
                        <Mail className="h-3 w-3" />{contact.email}
                      </a>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Site web */}
                <Td onClick={e => e.stopPropagation()}>
                  {p.website
                    ? <a href={p.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-brand-600 flex items-center gap-1 transition max-w-[120px] truncate">
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Décideur */}
                <Td>
                  {contact
                    ? <div>
                        <p className="text-xs font-medium text-gray-700">{contact.first_name} {contact.last_name}</p>
                        {contact.job_title && <p className="text-[11px] text-gray-400">{contact.job_title}</p>}
                      </div>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Statut */}
                <Td>
                  <Badge status={p.status} dot />
                </Td>
                {/* Score IA */}
                <Td>
                  <ScoreBadge score={p.score} />
                </Td>
                {/* Dernière action */}
                <Td>
                  {lastAct
                    ? <div>
                        <p className="text-xs text-gray-600">{ACTIVITY_LABELS[lastAct.type] ?? lastAct.type}</p>
                        <p className="text-[11px] text-gray-400">{relativeDays(lastAct.created_at)}</p>
                      </div>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                {/* Actions */}
                <Td onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => onOpen(p)}>
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </Button>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Card>
  )
}

/* ─── CARD VIEW ───────────────────────────────────────────────────────────── */

function ProspectCard({ prospect, onOpen }: { prospect: ProspectRow; onOpen: () => void }) {
  const contact = getPrimaryContact(prospect)
  const lastAct = getLastActivity(prospect)
  return (
    <div
      onClick={onOpen}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-brand-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{prospect.company_name}</p>
            {prospect.industry && (
              <p className="text-[11px] text-gray-400 truncate">{prospect.industry}</p>
            )}
          </div>
        </div>
        <ScoreBadge score={prospect.score} />
      </div>

      {/* Status */}
      <div className="mb-3">
        <Badge status={prospect.status} dot />
      </div>

      {/* Info grid */}
      <div className="space-y-1.5 mb-3">
        {prospect.city && (
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <MapPin className="h-3 w-3 text-gray-300 shrink-0" />
            {prospect.city}{prospect.country && prospect.country !== 'France' ? `, ${prospect.country}` : ''}
          </div>
        )}
        {contact && (
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <User className="h-3 w-3 text-gray-300 shrink-0" />
            <span className="font-medium">{contact.first_name} {contact.last_name}</span>
            {contact.job_title && <span className="text-gray-400">· {contact.job_title}</span>}
          </div>
        )}
        {contact?.email && (
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 truncate">
            <Mail className="h-3 w-3 text-gray-300 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact?.phone && (
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <Phone className="h-3 w-3 text-gray-300 shrink-0" />
            {contact.phone}
          </div>
        )}
        {prospect.website && (
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 truncate">
            <Globe className="h-3 w-3 text-gray-300 shrink-0" />
            <span className="truncate">{prospect.website.replace(/^https?:\/\//, '')}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {prospect.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prospect.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
          {prospect.tags.length > 3 && (
            <span className="text-[10px] text-gray-400">+{prospect.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2.5 border-t border-gray-50 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {lastAct
            ? `${ACTIVITY_LABELS[lastAct.type] ?? lastAct.type} · ${relativeDays(lastAct.created_at)}`
            : `Ajouté ${relativeDays(prospect.created_at)}`}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          {prospect.website && (
            <a href={prospect.website} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {prospect.linkedin_url && (
            <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
              <Link2 className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── FICHE PROSPECT ──────────────────────────────────────────────────────── */

type FicheForm = CreateProspectInput

/* ─── GOOGLE AGENDA ───────────────────────────────────────────────────────── */

const EVENT_CFG: Record<CalendarEventType, { label: string; color: string; Icon: React.ElementType }> = {
  rdv:     { label: 'RDV',     color: 'bg-blue-50 text-blue-700 border-blue-200',       Icon: Calendar },
  relance: { label: 'Relance', color: 'bg-amber-50 text-amber-700 border-amber-200',    Icon: Clock },
  demo:    { label: 'Démo',    color: 'bg-purple-50 text-purple-700 border-purple-200', Icon: Video },
}

function CreateCalendarEventModal({
  prospect, defaultType, onClose, creating,
  onCreate,
}: {
  prospect: ProspectRow
  defaultType: CalendarEventType
  onClose: () => void
  creating: boolean
  onCreate: (data: CreateCalendarEventInput) => Promise<void>
}) {
  const contact = getPrimaryContact(prospect)
  const [type, setType]             = useState<CalendarEventType>(defaultType)
  const [title, setTitle]           = useState(`${EVENT_CFG[defaultType].label} — ${prospect.company_name}`)
  const [description, setDesc]      = useState('')
  const [location, setLocation]     = useState('')
  const [date, setDate]             = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime]             = useState('09:00')
  const [durMode, setDurMode]       = useState<'30'|'60'|'120'|'custom'>('60')
  const [customDur, setCustomDur]   = useState(60)
  const [error, setError]           = useState('')

  const handleType = (t: CalendarEventType) => {
    setType(t)
    setTitle(`${EVENT_CFG[t].label} — ${prospect.company_name}`)
  }

  const handleCreate = async () => {
    if (!title || !date || !time) return
    setError('')
    const start = new Date(`${date}T${time}:00`)
    const dur   = durMode === 'custom' ? customDur : Number(durMode)
    const end   = new Date(start.getTime() + dur * 60_000)
    try {
      await onCreate({ prospect_id: prospect.id, event_type: type, title, description: description || undefined, location: location || undefined, start_at: start.toISOString(), end_at: end.toISOString() })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-brand-500" /> Nouvel événement
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X className="h-4 w-4" /></button>
        </div>

        {/* Type */}
        <div className="flex gap-2 mb-4">
          {(Object.entries(EVENT_CFG) as [CalendarEventType, typeof EVENT_CFG[CalendarEventType]][]).map(([t, cfg]) => (
            <button key={t} onClick={() => handleType(t)}
              className={cn('flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-medium transition',
                type === t ? cfg.color + ' shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
              <cfg.Icon className="h-4 w-4" />{cfg.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Heure *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Durée</label>
            <div className="flex gap-1.5">
              {(['30','60','120','custom'] as const).map(d => (
                <button key={d} onClick={() => setDurMode(d)}
                  className={cn('text-[11px] px-2.5 py-1.5 rounded-lg border transition',
                    durMode === d ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
                  {d === '30' ? '30 min' : d === '60' ? '1h' : d === '120' ? '2h' : 'Autre'}
                </button>
              ))}
            </div>
            {durMode === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <input type="number" min={15} max={480} value={customDur}
                  onChange={e => setCustomDur(Number(e.target.value))}
                  className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
                <span className="text-xs text-gray-500">minutes</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Lieu</label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Paris, Visioconférence, Zoom…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="Ordre du jour, contexte…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition resize-none" />
          </div>

          {contact && (
            <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-500 flex items-center gap-2">
              <User className="h-3 w-3 text-gray-400 shrink-0" />
              <span>{contact.first_name} {contact.last_name}{contact.email ? ` · ${contact.email}` : ''}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={onClose}
            className="flex-1 text-sm border border-gray-200 rounded-xl py-2 text-gray-600 hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={handleCreate} disabled={creating || !title || !date || !time}
            className="flex-1 text-sm bg-brand-600 text-white rounded-xl py-2 font-medium hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
            {creating
              ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Création…</>
              : <><Calendar className="h-3.5 w-3.5" /> Créer dans Google Agenda</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProspectCalendarSection({ prospect }: { prospect: ProspectRow }) {
  const { data: events = [], isLoading }     = useCalendarEvents(prospect.id)
  const createEvent                          = useCreateCalendarEvent()
  const deleteEvent                          = useDeleteCalendarEvent()
  const syncEvents                           = useSyncCalendarEvents()
  const [modalOpen, setModalOpen]            = useState(false)
  const [defaultType, setDefaultType]        = useState<CalendarEventType>('rdv')

  useEffect(() => { syncEvents.mutate(prospect.id) }, [prospect.id])

  const upcoming = [...events]
    .filter(e => e.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  const openModal = (t: CalendarEventType) => { setDefaultType(t); setModalOpen(true) }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Google Agenda</p>
          <button onClick={() => syncEvents.mutate(prospect.id)} disabled={syncEvents.isPending}
            className="text-[11px] text-gray-400 hover:text-brand-500 flex items-center gap-0.5 transition">
            <RefreshCw className={cn('h-3 w-3', syncEvents.isPending && 'animate-spin')} /> Sync
          </button>
        </div>

        {/* Boutons rapides */}
        <div className="flex gap-1.5 mb-3">
          {(Object.entries(EVENT_CFG) as [CalendarEventType, typeof EVENT_CFG[CalendarEventType]][]).map(([t, cfg]) => (
            <button key={t} onClick={() => openModal(t)}
              className={cn('flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition hover:opacity-80', cfg.color)}>
              <cfg.Icon className="h-3 w-3" /> + {cfg.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {isLoading ? (
          <p className="text-xs text-gray-400">Chargement…</p>
        ) : upcoming.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Aucun événement planifié</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(ev => {
              const cfg = EVENT_CFG[ev.event_type]
              const isPast = new Date(ev.start_at) < new Date()
              return (
                <div key={ev.id} className={cn('flex items-start gap-2.5 p-2.5 rounded-xl border', isPast ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200')}>
                  <div className={cn('p-1.5 rounded-lg shrink-0 border', cfg.color)}>
                    <cfg.Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{ev.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(ev.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(ev.end_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {ev.location && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />{ev.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ev.google_event_id
                      ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      : <AlertCircle className="h-3 w-3 text-gray-300" />}
                    <button onClick={() => deleteEvent.mutate({ id: ev.id, googleEventId: ev.google_event_id, prospectId: prospect.id })}
                      className="text-gray-300 hover:text-red-400 transition">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <CreateCalendarEventModal
          prospect={prospect}
          defaultType={defaultType}
          creating={createEvent.isPending}
          onCreate={async (data) => { await createEvent.mutateAsync(data); setModalOpen(false) }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

/* ─── Google Drive ────────────────────────────────────────────────────────── */

function ProspectDriveSection({ prospect }: { prospect: ProspectRow }) {
  const createFolder = useCreateDriveFolder()

  const handleCreate = () => {
    createFolder.mutate({ prospect_id: prospect.id, prospect_name: prospect.company_name })
  }

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Google Drive</p>
      {prospect.drive_folder_id ? (
        <a
          href={prospect.drive_folder_url ?? `https://drive.google.com/drive/folders/${prospect.drive_folder_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-brand-300 hover:bg-brand-50 text-gray-700 transition group w-full"
        >
          <FolderOpen className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
          <span className="flex-1 truncate font-medium">{prospect.company_name}</span>
          <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-brand-400 shrink-0" />
        </a>
      ) : (
        <button
          onClick={handleCreate}
          disabled={createFolder.isPending}
          className="flex items-center gap-2 text-xs px-3 py-2 bg-white border border-dashed border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition w-full disabled:opacity-50"
        >
          {createFolder.isPending
            ? <><RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" /> Création en cours…</>
            : <><FolderPlus className="h-3.5 w-3.5 shrink-0" /> Créer le dossier Drive</>}
        </button>
      )}
      {createFolder.isError && (
        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {(createFolder.error as Error).message}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */

type FicheTab = 'fiche' | 'analyse' | 'audit' | 'reco' | 'score'

function ProspectFiche({
  prospect, onClose, onSave, onDelete,
}: {
  prospect: ProspectRow
  onClose: () => void
  onSave: (data: FicheForm) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const contact = getPrimaryContact(prospect)
  const [activeTab, setActiveTab] = useState<FicheTab>('fiche')
  const analyse        = getAnalyse(prospect)
  const audit          = getAudit(prospect)
  const reco           = getRecommendations(prospect)
  const scoreCommercial = computeScoreCommercial(prospect, audit, analyse)
  const [form, setForm] = useState<FicheForm>({
    company_name: prospect.company_name,
    website: prospect.website ?? '',
    industry: prospect.industry ?? '',
    company_size: prospect.company_size ?? '',
    country: prospect.country ?? 'France',
    city: prospect.city ?? '',
    status: prospect.status,
    score: prospect.score,
    source: prospect.source,
    linkedin_url: prospect.linkedin_url ?? '',
    tags: prospect.tags,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tagsInput, setTagsInput] = useState(prospect.tags.join(', '))

  const set = (k: keyof FicheForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({ ...form, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) })
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete()
    onClose()
  }

  const lastAct = getLastActivity(prospect)
  const recentActivities = [...prospect.activities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[500px] bg-white shadow-2xl h-full overflow-y-auto flex flex-col border-l border-gray-200">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-brand-50 to-indigo-50 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Building2 className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{prospect.company_name}</h3>
                {prospect.industry && <p className="text-xs text-gray-500">{prospect.industry}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge status={prospect.status} dot />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ScoreBadge score={prospect.score} />
              <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            {contact?.email && (
              <a href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition">
                <Mail className="h-3 w-3" /> Email
              </a>
            )}
            {contact?.phone && (
              <a href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition">
                <Phone className="h-3 w-3" /> Appeler
              </a>
            )}
            {prospect.website && (
              <a href={prospect.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition">
                <ExternalLink className="h-3 w-3" /> Site web
              </a>
            )}
            {prospect.linkedin_url && (
              <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition">
                <Link2 className="h-3 w-3" /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('fiche')}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition',
              activeTab === 'fiche'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Building2 className="h-3.5 w-3.5" />
            Fiche
          </button>
          <button
            onClick={() => setActiveTab('analyse')}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition',
              activeTab === 'analyse'
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Analyse
            {analyse && (
              <span className="ml-1 text-[10px] font-bold text-white bg-violet-500 px-1.5 py-0.5 rounded-full leading-none">
                {analyse.score.toFixed(1)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition',
              activeTab === 'audit'
                ? 'border-slate-600 text-slate-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Gauge className="h-3.5 w-3.5" />
            Audit
            {audit && (
              <span className="ml-1 text-[10px] font-bold text-white bg-slate-600 px-1.5 py-0.5 rounded-full leading-none">
                {audit.score.toFixed(1)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reco')}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition',
              activeTab === 'reco'
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            IA
            {reco && (
              <span className={cn(
                'ml-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none',
                reco.priority === 'A' ? 'bg-emerald-500' : reco.priority === 'B' ? 'bg-amber-500' : 'bg-slate-400',
              )}>
                {reco.priority}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('score')}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition',
              activeTab === 'score'
                ? 'border-amber-400 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Star className="h-3.5 w-3.5" />
            Score
            {scoreCommercial.score > 0 && (
              <span className={cn(
                'ml-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none',
                OPPORTUNITY_CONFIG[scoreCommercial.opportunity].dot,
              )}>
                {scoreCommercial.score.toFixed(1)}
              </span>
            )}
          </button>
        </div>

        {/* Tab: Analyse */}
        {activeTab === 'analyse' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProspectAnalysePanel prospect={prospect} />
          </div>
        )}

        {/* Tab: Audit */}
        {activeTab === 'audit' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProspectAuditPanel prospect={prospect} />
          </div>
        )}

        {/* Tab: Recommandations IA */}
        {activeTab === 'reco' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProspectRecommendPanel prospect={prospect} />
          </div>
        )}

        {/* Tab: Score commercial */}
        {activeTab === 'score' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProspectScorePanel prospect={prospect} />
          </div>
        )}

        {/* Tab: Fiche — Body */}
        {activeTab === 'fiche' && <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Entreprise */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Entreprise</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Nom *</label>
                <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Secteur</label>
                  <input value={form.industry ?? ''} onChange={set('industry')}
                    placeholder="Tech, Finance…"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Taille</label>
                  <select value={form.company_size ?? ''} onChange={set('company_size')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
                    <option value="">—</option>
                    {['1-10', '11-50', '51-200', '201-1000', '1000+'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Ville</label>
                  <input value={form.city ?? ''} onChange={set('city')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Pays</label>
                  <input value={form.country ?? ''} onChange={set('country')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Site web</label>
                <input value={form.website ?? ''} onChange={set('website')}
                  placeholder="https://exemple.com"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">LinkedIn</label>
                <input value={form.linkedin_url ?? ''} onChange={set('linkedin_url')}
                  placeholder="https://linkedin.com/company/…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
              </div>
            </div>
          </div>

          {/* Décideur */}
          {contact && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Décideur principal</p>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <p className="text-sm font-semibold text-gray-900">{contact.first_name} {contact.last_name}</p>
                {contact.job_title && <p className="text-xs text-gray-500">{contact.job_title}</p>}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" />{contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />{contact.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Statut & Score */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Qualification</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Statut</label>
                <select value={form.status} onChange={set('status')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
                  {PROSPECT_STATUSES.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Source</label>
                <select value={form.source} onChange={set('source')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
                  {SOURCES.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand-500" /> Score IA
                  <span className={cn('ml-auto text-xs font-bold px-1.5 py-0.5 rounded', getScoreColor(form.score ?? 0))}>
                    {form.score ?? 0}
                  </span>
                </label>
                <input type="range" min={0} max={100} value={form.score ?? 0}
                  onChange={e => setForm(f => ({ ...f, score: Number(e.target.value) }))}
                  className="w-full accent-brand-500" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tags</p>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition" />
            <p className="text-[11px] text-gray-400 mt-1">Séparer par des virgules</p>
          </div>

          {/* Activités récentes */}
          {recentActivities.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Activités récentes</p>
              <div className="space-y-1.5">
                {recentActivities.map(a => (
                  <div key={a.id} className="flex items-start gap-2 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-300 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">{ACTIVITY_LABELS[a.type] ?? a.type}</span>
                      {a.description && <span className="text-gray-400"> · {a.description}</span>}
                      <div className="text-gray-400">{relativeDays(a.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drive */}
          <ProspectDriveSection prospect={prospect} />

          {/* Calendrier */}
          <ProspectCalendarSection prospect={prospect} />

          {/* Méta */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1 text-gray-500">
            <div className="flex justify-between">
              <span>Créé le</span>
              <span className="font-medium text-gray-700">{formatDate(prospect.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Modifié le</span>
              <span className="font-medium text-gray-700">{formatDate(prospect.updated_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Contacts</span>
              <span className="font-medium text-gray-700">{prospect.contacts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Activités</span>
              <span className="font-medium text-gray-700">{prospect.activities.length}</span>
            </div>
          </div>
        </div>}

        {/* Footer — onglet Fiche uniquement */}
        {activeTab === 'fiche' && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Suppression…' : 'Supprimer'}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !form.company_name}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */

export function ProspectionProspects() {
  const [view, setView]             = useState<ViewMode>('table')
  const [search, setSearch]         = useState('')
  const [filterStatus, setFS]       = useState<ProspectStatus | ''>('')
  const [filterSource, setFSrc]     = useState<ProspectSource | ''>('')
  const [sortField, setSortField]   = useState<SortField>('created_at')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')
  const [page, setPage]             = useState(1)
  const [fiche, setFiche]           = useState<ProspectRow | null>(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [form, setForm]             = useState<CreateProspectInput>(FORM_INIT)
  const [showFilters, setShowFilters] = useState(false)

  const { data: prospects = [], isLoading, refetch, isFetching } = useProspects()
  const createProspect = useCreateProspect()
  const updateProspect = useUpdateProspect()
  const deleteProspect = useDeleteProspect()

  // Sync fiche avec les données fraîches (ex: drive_folder_id mis à jour après création Drive)
  useEffect(() => {
    if (!fiche) return
    const updated = prospects.find(p => p.id === fiche.id)
    if (updated && updated !== fiche) setFiche(updated)
  }, [prospects])

  /* Filtrage */
  const filtered = useMemo(() => {
    let list = prospects
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => {
        const contact = getPrimaryContact(p)
        return (
          p.company_name.toLowerCase().includes(q) ||
          (p.industry ?? '').toLowerCase().includes(q) ||
          (p.city ?? '').toLowerCase().includes(q) ||
          (contact?.email ?? '').toLowerCase().includes(q) ||
          (contact ? `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(q) : false)
        )
      })
    }
    if (filterStatus) list = list.filter(p => p.status === filterStatus)
    if (filterSource) list = list.filter(p => p.source === filterSource)
    return list
  }, [prospects, search, filterStatus, filterSource])

  /* Tri */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: number | string = 0
      let vb: number | string = 0
      if (sortField === 'company_name') { va = a.company_name; vb = b.company_name }
      else if (sortField === 'score') { va = a.score; vb = b.score }
      else if (sortField === 'status') { va = a.status; vb = b.status }
      else if (sortField === 'created_at') { va = a.created_at; vb = b.created_at }
      else if (sortField === 'last_activity') {
        const la = getLastActivity(a); const lb = getLastActivity(b)
        va = la?.created_at ?? ''
        vb = lb?.created_at ?? ''
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortField, sortDir])

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(1)
  }

  /* Stats */
  const avgScore    = prospects.length ? Math.round(prospects.reduce((s, p) => s + p.score, 0) / prospects.length) : 0
  const qualified   = prospects.filter(p => ['qualified', 'meeting', 'responded'].includes(p.status)).length
  const converted   = prospects.filter(p => p.status === 'converted').length

  const setF = (k: keyof CreateProspectInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.company_name) return
    await createProspect.mutateAsync(form)
    setShowAdd(false)
    setForm(FORM_INIT)
  }

  const handleFicheSave = async (data: FicheForm) => {
    if (!fiche) return
    await updateProspect.mutateAsync({ id: fiche.id, ...data })
    setFiche(null)
  }

  const handleFicheDelete = async () => {
    if (!fiche) return
    await deleteProspect.mutateAsync(fiche.id)
    setFiche(null)
  }

  const hasFilters = !!(search || filterStatus || filterSource)

  return (
    <Layout
      title="Prospects"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(sorted)}
            title="Exporter CSV (Google Sheets compatible)">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          {/* Vue toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('table')} title="Tableau"
              className={cn('p-1.5 rounded-md transition', view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
              <List className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setView('cards')} title="Cartes"
              className={cn('p-1.5 rounded-md transition', view === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau prospect
          </Button>
        </div>
      }
    >

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <p className="text-xs text-gray-500 mb-1">Total prospects</p>
          <p className="text-2xl font-bold text-gray-900">{prospects.length}</p>
          <p className="text-xs text-gray-400 mt-1">{filtered.length} filtrés</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Qualifiés</p>
          <p className="text-2xl font-bold text-violet-600">{qualified}</p>
          <p className="text-xs text-gray-400 mt-1">Qualifié + RDV + Répondu</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Convertis</p>
          <p className="text-2xl font-bold text-emerald-600">{converted}</p>
          <p className="text-xs text-gray-400 mt-1">
            {prospects.length > 0 ? Math.round(converted / prospects.length * 100) : 0}% du total
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Score IA moyen</p>
            <Sparkles className="h-4 w-4 text-brand-300" />
          </div>
          <p className={cn('text-2xl font-bold', getScoreColor(avgScore).split(' ')[0])}>
            {avgScore}<span className="text-sm font-normal text-gray-400">/100</span>
          </p>
        </Card>
      </div>

      {/* ── BARRE FILTRES ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          placeholder="Rechercher entreprise, secteur, ville, contact…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          leading={<Search className="h-3.5 w-3.5" />}
          className="w-72"
        />

        <button
          onClick={() => setShowFilters(f => !f)}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition',
            showFilters || hasFilters
              ? 'border-brand-300 bg-brand-50 text-brand-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300',
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtres
          {hasFilters && (
            <span className="h-4 w-4 bg-brand-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {[filterStatus, filterSource].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFS(''); setFSrc(''); setPage(1) }}
            className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition"
          >
            <X className="h-3 w-3" /> Réinitialiser
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {sorted.length} prospect{sorted.length !== 1 ? 's' : ''}
          {sorted.length > PAGE_SIZE && ` · page ${page}/${totalPages}`}
        </span>
      </div>

      {/* Panneau filtres dépliable */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 mb-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Statut</label>
            <select value={filterStatus} onChange={e => { setFS(e.target.value as ProspectStatus | ''); setPage(1) }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition">
              {PROSPECT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Source</label>
            <select value={filterSource} onChange={e => { setFSrc(e.target.value as ProspectSource | ''); setPage(1) }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition">
              {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── CONTENU ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-gray-300 animate-spin" />
            <p className="text-sm text-gray-400">Chargement des prospects…</p>
          </div>
        </div>
      ) : view === 'table' ? (
        <TableView
          prospects={paginated}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onOpen={setFiche}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center py-16 text-sm text-gray-400">
              Aucun prospect trouvé
            </div>
          ) : paginated.map(p => (
            <ProspectCard key={p.id} prospect={p} onOpen={() => setFiche(p)} />
          ))}
        </div>
      )}

      {/* ── PAGINATION ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline" size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Précédent
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p: number
              if (totalPages <= 7) p = i + 1
              else if (page <= 4) p = i + 1
              else if (page >= totalPages - 3) p = totalPages - 6 + i
              else p = page - 3 + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-7 w-7 rounded-lg text-xs font-medium transition',
                    p === page
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-500 hover:bg-gray-100',
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <Button
            variant="outline" size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Suivant <ChevronRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ── FICHE PANEL ────────────────────────────────────────────────────── */}
      {fiche && (
        <ProspectFiche
          prospect={fiche}
          onClose={() => setFiche(null)}
          onSave={handleFicheSave}
          onDelete={handleFicheDelete}
        />
      )}

      {/* ── MODAL NOUVEAU PROSPECT ─────────────────────────────────────────── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Nouveau prospect"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createProspect.isPending || !form.company_name}>
              {createProspect.isPending ? 'Création…' : 'Créer le prospect'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom de l'entreprise *" placeholder="Acme Corp" value={form.company_name}
            onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
            className="col-span-2" autoFocus />
          <Input label="Secteur" placeholder="Tech, Finance, Retail…" value={form.industry ?? ''}
            onChange={setF('industry')} />
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Taille</label>
            <select value={form.company_size ?? ''} onChange={setF('company_size')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
              <option value="">—</option>
              {['1-10', '11-50', '51-200', '201-1000', '1000+'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Input label="Ville" placeholder="Paris" value={form.city ?? ''} onChange={setF('city')} />
          <Input label="Pays" placeholder="France" value={form.country ?? ''} onChange={setF('country')} />
          <Input label="Site web" placeholder="https://…" value={form.website ?? ''}
            onChange={setF('website')} className="col-span-2" />
          <Input label="LinkedIn" placeholder="https://linkedin.com/company/…" value={form.linkedin_url ?? ''}
            onChange={setF('linkedin_url')} className="col-span-2" />
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Statut</label>
            <select value={form.status} onChange={setF('status')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
              {PROSPECT_STATUSES.filter(s => s.value).map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Source</label>
            <select value={form.source} onChange={setF('source')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
              {SOURCES.filter(s => s.value).map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
