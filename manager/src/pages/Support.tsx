import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus, Search, Send, Trash2, X,
  Clock, CheckCircle, Circle, XCircle, AlertTriangle,
  User, ChevronDown, Tag, LayoutGrid, List,
  GripVertical, Zap, LifeBuoy,
} from 'lucide-react'
import { format, parseISO, formatDistanceToNow, differenceInHours } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { cn, formatDate, statusLabel } from '@/lib/utils'
import {
  useTickets, useTicketMessages, useCreateTicket,
  useUpdateTicket, useAddTicketMessage, useDeleteTicket,
} from '@/hooks/useTickets'
import type { TicketMessage } from '@/hooks/useTickets'
import { useClients } from '@/hooks/useClients'
import type { Ticket, TicketStatus, TicketPriority } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

type FilterStatus = 'tous' | TicketStatus
type ViewMode = 'table' | 'kanban'

// ─── Static config ─────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<TicketStatus, React.ElementType> = {
  ouvert: Circle, en_cours: Clock, resolu: CheckCircle, ferme: XCircle,
}

const KANBAN_COLS: { status: TicketStatus; label: string; iconCls: string; headBg: string }[] = [
  { status: 'ouvert',   label: 'Ouvert',   iconCls: 'text-blue-500',    headBg: 'bg-blue-50' },
  { status: 'en_cours', label: 'En cours', iconCls: 'text-violet-500',  headBg: 'bg-violet-50' },
  { status: 'resolu',   label: 'Résolu',   iconCls: 'text-emerald-500', headBg: 'bg-emerald-50' },
  { status: 'ferme',    label: 'Fermé',    iconCls: 'text-gray-400',    headBg: 'bg-gray-50' },
]

const PRIORITY_OPTIONS = [
  { value: 'all',      label: 'Toutes priorités' },
  { value: 'critique', label: 'Critique' },
  { value: 'haute',    label: 'Haute' },
  { value: 'normale',  label: 'Normale' },
  { value: 'basse',    label: 'Basse' },
]

const QUICK_TEMPLATES = [
  { label: 'Accusé de réception', text: "Bonjour,\n\nNous avons bien reçu votre demande et nous nous en occupons dans les plus brefs délais.\n\nCordialement,\nL'équipe CA-TECH" },
  { label: 'En traitement', text: "Bonjour,\n\nVotre demande est actuellement en cours de traitement. Nous revenons vers vous rapidement.\n\nCordialement,\nL'équipe CA-TECH" },
  { label: 'Besoin de précisions', text: "Bonjour,\n\nAfin de mieux traiter votre demande, pourriez-vous nous fournir plus d'informations ?\n\nCordialement,\nL'équipe CA-TECH" },
  { label: 'Problème résolu', text: "Bonjour,\n\nNous avons résolu votre problème. N'hésitez pas à nous recontacter si vous avez d'autres questions.\n\nCordialement,\nL'équipe CA-TECH" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  return formatDistanceToNow(parseISO(dateStr), { locale: fr, addSuffix: true })
}

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

function timeBetween(from: string, to: string): string {
  const diff = new Date(to).getTime() - new Date(from).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

function slaClass(ticket: Ticket): string {
  if (ticket.status === 'resolu' || ticket.status === 'ferme') return ''
  const h = differenceInHours(new Date(), parseISO(ticket.created_at))
  if (ticket.priority === 'critique' && h >= 2)  return 'border-l-2 border-l-red-400'
  if (ticket.priority === 'haute'    && h >= 8)  return 'border-l-2 border-l-amber-400'
  return ''
}

// ─── ThreadMessage ─────────────────────────────────────────────────────────────

function ThreadMessage({ msg, ticket }: { msg: TicketMessage; ticket: Ticket }) {
  if (msg.sender_type === 'system') {
    return (
      <div className="flex items-center justify-center gap-2 py-1 my-1">
        <div className="h-px bg-gray-100 flex-1" />
        <span className="text-[10px] text-gray-400 px-2 shrink-0">{msg.content}</span>
        <div className="h-px bg-gray-100 flex-1" />
      </div>
    )
  }
  const isAgent = msg.sender_type === 'agent'
  return (
    <div className={cn('flex gap-2.5', isAgent ? 'flex-row-reverse' : 'flex-row')}>
      {isAgent ? (
        <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-brand-600">CA</span>
        </div>
      ) : ticket.client ? (
        <Avatar nom={ticket.client.nom} prenom={ticket.client.prenom} size="sm" className="shrink-0 mt-0.5" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-3.5 w-3.5 text-gray-400" />
        </div>
      )}
      <div className={cn('max-w-[78%]', isAgent ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isAgent ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        )}>
          {msg.content}
        </div>
        <p className={cn('text-[10px] text-gray-400 px-1 mt-1', isAgent ? 'text-right' : 'text-left')}>
          {isAgent ? 'CA-TECH' : ticket.client ? `${ticket.client.prenom} ${ticket.client.nom}` : 'Client'}
          {' · '}
          {format(parseISO(msg.created_at), 'dd MMM à HH:mm', { locale: fr })}
        </p>
      </div>
    </div>
  )
}

// ─── InfoRow ───────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-gray-400 shrink-0">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

// ─── TagInput ──────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('')

  function addTag() {
    const val = input.trim().replace(/[,;]/g, '').toLowerCase()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(t => (
            <span key={t} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {t}
              <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (input.trim()) addTag() }
        }}
        onBlur={() => { if (input.trim()) addTag() }}
        placeholder="Ajouter un tag…"
        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white"
      />
    </div>
  )
}

// ─── KanbanCard ────────────────────────────────────────────────────────────────

function KanbanCard({ ticket, onOpen, onDragStart }: {
  ticket: Ticket; onOpen: () => void; onDragStart: () => void
}) {
  const urgentSla = slaClass(ticket)
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-all group',
        urgentSla
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {ticket.ticket_number && (
            <span className="font-mono text-[10px] text-gray-400">{ticket.ticket_number}</span>
          )}
          <Badge status={ticket.priority} dot />
        </div>
        <GripVertical className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
      </div>
      <p className="text-xs font-semibold text-gray-800 leading-snug mb-2 line-clamp-2">{ticket.sujet}</p>
      <div className="flex items-center justify-between gap-2">
        {ticket.client ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar nom={ticket.client.nom} prenom={ticket.client.prenom} size="sm" />
            <span className="text-[10px] text-gray-500 truncate">{ticket.client.prenom} {ticket.client.nom}</span>
          </div>
        ) : (
          <span className="text-[10px] text-gray-400">Sans client</span>
        )}
        <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
          <Clock className="h-3 w-3" />
          {timeSince(ticket.created_at)}
        </div>
      </div>
      {ticket.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {ticket.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t}</span>
          ))}
          {ticket.tags.length > 3 && <span className="text-[9px] text-gray-400">+{ticket.tags.length - 3}</span>}
        </div>
      )}
    </div>
  )
}

// ─── KanbanBoard ───────────────────────────────────────────────────────────────

function KanbanBoard({ tickets, onOpen, onStatusChange }: {
  tickets: Ticket[]
  onOpen: (t: Ticket) => void
  onStatusChange: (id: string, status: TicketStatus) => void
}) {
  const [dragId, setDragId]   = useState<string | null>(null)
  const [overCol, setOverCol] = useState<TicketStatus | null>(null)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLS.map(col => {
        const colTickets = tickets.filter(t => t.status === col.status)
        const isOver = overCol === col.status
        const Icon = STATUS_ICONS[col.status]
        return (
          <div
            key={col.status}
            className={cn(
              'w-72 shrink-0 rounded-xl border transition-colors',
              isOver ? 'border-brand-400 bg-brand-50/30' : 'border-gray-200 bg-gray-50/60'
            )}
            onDragOver={e => { e.preventDefault(); setOverCol(col.status) }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => { if (dragId) onStatusChange(dragId, col.status); setDragId(null); setOverCol(null) }}
          >
            <div className={cn('px-3 py-2.5 rounded-t-xl flex items-center gap-2 border-b border-gray-100', col.headBg)}>
              <Icon className={cn('h-3.5 w-3.5 shrink-0', col.iconCls)} />
              <span className="text-xs font-semibold text-gray-700">{col.label}</span>
              <span className="ml-auto text-[10px] font-semibold bg-white/70 text-gray-500 px-1.5 py-0.5 rounded-full">
                {colTickets.length}
              </span>
            </div>
            <div className="p-2 space-y-2 min-h-[120px]">
              {colTickets.map(t => (
                <KanbanCard
                  key={t.id}
                  ticket={t}
                  onOpen={() => onOpen(t)}
                  onDragStart={() => setDragId(t.id)}
                />
              ))}
              {colTickets.length === 0 && (
                <div className="flex items-center justify-center h-16 text-[11px] text-gray-400">
                  Aucun ticket
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── TicketPanel ───────────────────────────────────────────────────────────────

function TicketPanel({ ticket, onClose, onDeleted }: {
  ticket: Ticket; onClose: () => void; onDeleted: () => void
}) {
  const { data: msgs = [], isLoading: loadingMsgs } = useTicketMessages(ticket.id)
  const updateTicket  = useUpdateTicket()
  const addMessage    = useAddTicketMessage()
  const deleteTicket  = useDeleteTicket()

  const [replyText, setReplyText]         = useState('')
  const [showDelete, setShowDelete]       = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editPriority, setEditPriority]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  const isSending = addMessage.isPending

  async function handleSendReply(andResolve = false) {
    if (!replyText.trim()) return
    await addMessage.mutateAsync({ ticket_id: ticket.id, content: replyText.trim(), sender_type: 'agent' })
    if (andResolve) await updateTicket.mutateAsync({ id: ticket.id, status: 'resolu' })
    setReplyText('')
  }

  function handleStatusChange(status: TicketStatus) {
    updateTicket.mutate({ id: ticket.id, status })
  }

  function handlePriorityChange(priority: TicketPriority) {
    updateTicket.mutate({ id: ticket.id, priority })
    setEditPriority(false)
  }

  function handleTagsChange(tags: string[]) {
    updateTicket.mutate({ id: ticket.id, tags })
  }

  function handleDelete() {
    deleteTicket.mutate(ticket.id, { onSuccess: () => { onDeleted() } })
  }

  const nextAction: { label: string; status: TicketStatus } | null =
    ticket.status === 'ouvert'   ? { label: 'Prendre en charge', status: 'en_cours' }
    : ticket.status === 'en_cours' ? { label: 'Marquer résolu',    status: 'resolu' }
    : ticket.status === 'resolu'   ? { label: 'Fermer le ticket',   status: 'ferme' }
    : null

  const SIcon = STATUS_ICONS[ticket.status]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[640px] bg-white border-l border-gray-200 shadow-2xl z-30 flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {ticket.ticket_number && (
                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {ticket.ticket_number}
                </span>
              )}
              <Badge status={ticket.status} dot />
              <Badge status={ticket.priority} dot />
              {(ticket.status === 'ouvert' || ticket.status === 'en_cours') && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock className="h-3 w-3" />
                  {timeSince(ticket.created_at)}
                </span>
              )}
              {ticket.resolved_at && ticket.status === 'resolu' && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  Résolu en {timeBetween(ticket.created_at, ticket.resolved_at)}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-base font-semibold text-gray-900 leading-snug mb-3">{ticket.sujet}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {nextAction && (
              <Button size="sm" onClick={() => handleStatusChange(nextAction.status)} loading={updateTicket.isPending}>
                <SIcon className="h-3.5 w-3.5" />
                {nextAction.label}
              </Button>
            )}
            {(ticket.status === 'resolu' || ticket.status === 'ferme') && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange('ouvert')} loading={updateTicket.isPending}>
                Réouvrir
              </Button>
            )}
            <Button
              size="icon" variant="ghost"
              onClick={() => setShowDelete(true)}
              className="ml-auto text-red-400 hover:text-red-600 hover:bg-red-50"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Conversation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Original message */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  {ticket.client ? (
                    <Avatar nom={ticket.client.nom} prenom={ticket.client.prenom} size="sm" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {ticket.client ? (
                      <p className="text-xs font-semibold text-gray-800">{ticket.client.prenom} {ticket.client.nom}</p>
                    ) : (
                      <p className="text-xs font-semibold text-gray-800">Client</p>
                    )}
                    <p className="text-[10px] text-gray-400">{formatDate(ticket.created_at, 'dd MMM yyyy à HH:mm')}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full shrink-0">
                    Message initial
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* Thread */}
              {loadingMsgs ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                msgs.map(msg => <ThreadMessage key={msg.id} msg={msg} ticket={ticket} />)
              )}

              <div ref={bottomRef} />
            </div>

            {/* Reply form */}
            {ticket.status !== 'ferme' ? (
              <div className="border-t border-gray-100 p-4 bg-gray-50/40 shrink-0">
                {/* Quick templates */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setShowTemplates(v => !v)}
                    className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    <Zap className="h-3 w-3" />
                    Templates
                  </button>
                  {showTemplates && (
                    <div className="flex flex-wrap gap-1">
                      {QUICK_TEMPLATES.map(tpl => (
                        <button
                          key={tpl.label}
                          onClick={() => { setReplyText(tpl.text); setShowTemplates(false) }}
                          className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Rédigez votre réponse…"
                  rows={3}
                  className="mb-2"
                />
                <div className="flex items-center justify-end gap-2">
                  {ticket.status === 'en_cours' && (
                    <Button variant="outline" size="sm" onClick={() => handleSendReply(true)} loading={isSending} disabled={!replyText.trim()}>
                      Envoyer et résoudre
                    </Button>
                  )}
                  <Button size="sm" onClick={() => handleSendReply(false)} loading={isSending} disabled={!replyText.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Envoyer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 p-4 bg-gray-50/40 flex items-center justify-center gap-2 shrink-0">
                <XCircle className="h-4 w-4 text-gray-300" />
                <span className="text-xs text-gray-400">
                  Ticket fermé ·{' '}
                  <button onClick={() => handleStatusChange('ouvert')} className="text-brand-500 hover:underline">
                    Réouvrir
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Info sidebar */}
          <div className="w-52 shrink-0 border-l border-gray-100 overflow-y-auto">
            {/* Client */}
            {ticket.client && (
              <div className="p-4 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Client</p>
                <div className="flex items-center gap-2.5">
                  <Avatar nom={ticket.client.nom} prenom={ticket.client.prenom} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{ticket.client.prenom} {ticket.client.nom}</p>
                    <p className="text-[10px] text-gray-500 truncate">{ticket.client.email}</p>
                    {ticket.client.entreprise && (
                      <p className="text-[10px] text-gray-400 truncate">{ticket.client.entreprise}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ticket info */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Informations</p>
              <dl className="space-y-2.5">
                <InfoRow label="Statut"><Badge status={ticket.status} dot /></InfoRow>
                <InfoRow label="Priorité">
                  <div className="relative">
                    <button onClick={() => setEditPriority(v => !v)} className="flex items-center gap-1 group">
                      <Badge status={ticket.priority} dot />
                      <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                    </button>
                    {editPriority && (
                      <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[120px]">
                        {(['critique', 'haute', 'normale', 'basse'] as TicketPriority[]).map(p => (
                          <button key={p} onClick={() => handlePriorityChange(p)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2">
                            <Badge status={p} dot />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </InfoRow>
                <InfoRow label="Créé"><span className="text-[11px] text-gray-600">{formatDate(ticket.created_at)}</span></InfoRow>
                <InfoRow label="Maj"><span className="text-[11px] text-gray-600">{timeAgo(ticket.updated_at)}</span></InfoRow>
                {ticket.resolved_at && (
                  <InfoRow label="Résolu"><span className="text-[11px] text-emerald-600">{formatDate(ticket.resolved_at)}</span></InfoRow>
                )}
              </dl>
            </div>

            {/* Status quick-change */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Statut</p>
              <div className="space-y-1">
                {(['ouvert', 'en_cours', 'resolu', 'ferme'] as TicketStatus[]).map(s => {
                  const Icon = STATUS_ICONS[s]
                  const active = ticket.status === s
                  return (
                    <button
                      key={s}
                      onClick={() => !active && handleStatusChange(s)}
                      disabled={active || updateTicket.isPending}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                        active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50'
                      )}
                    >
                      <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-brand-500' : 'text-gray-400')} />
                      {statusLabel(s)}
                      {active && <span className="ml-auto text-[10px] text-brand-500">Actuel</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" />Tags
              </p>
              <TagInput tags={ticket.tags} onChange={handleTagsChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer le ticket"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteTicket.isPending}>Supprimer</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Supprimer définitivement{' '}
          <span className="font-semibold text-gray-900">« {ticket.sujet} »</span>{' '}
          et tout son historique ? Action irréversible.
        </p>
      </Modal>
    </>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function Support() {
  const { data, isLoading } = useTickets()
  const { data: clientsData = [] } = useClients()
  const tickets = useMemo(() => data ?? [], [data])

  const createTicket = useCreateTicket()
  const updateTicket = useUpdateTicket()

  const [panelTicket, setPanelTicket]   = useState<Ticket | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('tous')
  const [filterPriority, setPriority]   = useState('all')
  const [search, setSearch]             = useState('')
  const [view, setView]                 = useState<ViewMode>('table')
  const [showCreate, setShowCreate]     = useState(false)
  const [createForm, setCreateForm]     = useState({
    sujet: '', description: '', priority: 'normale' as TicketPriority, client_id: '', tags: '',
  })
  const [createError, setCreateError]   = useState('')

  // Sync panel with fresh data
  useEffect(() => {
    if (!panelTicket) return
    const fresh = tickets.find(t => t.id === panelTicket.id)
    if (fresh) setPanelTicket(fresh)
  }, [tickets]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stats
  const counts = useMemo(() => {
    const c: Record<string, number> = { tous: 0, ouvert: 0, en_cours: 0, resolu: 0, ferme: 0, critique: 0 }
    tickets.forEach(t => {
      c.tous++
      c[t.status] = (c[t.status] ?? 0) + 1
      if (t.priority === 'critique' && (t.status === 'ouvert' || t.status === 'en_cours')) c.critique++
    })
    return c
  }, [tickets])

  // Filtered list
  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (filterStatus !== 'tous' && t.status !== filterStatus) return false
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false
      if (search) {
        const q = search.toLowerCase()
        const cn = t.client ? `${t.client.prenom} ${t.client.nom}` : ''
        if (!`${t.sujet} ${t.description} ${cn} ${(t.tags ?? []).join(' ')}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [tickets, filterStatus, filterPriority, search])

  function handleCreate() {
    if (!createForm.sujet.trim()) { setCreateError('Le sujet est requis.'); return }
    if (!createForm.description.trim()) { setCreateError('La description est requise.'); return }
    setCreateError('')
    const tags = createForm.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    createTicket.mutate(
      {
        sujet: createForm.sujet.trim(),
        description: createForm.description.trim(),
        priority: createForm.priority,
        client_id: createForm.client_id || undefined,
        tags,
      },
      {
        onSuccess: ticket => {
          setShowCreate(false)
          setCreateForm({ sujet: '', description: '', priority: 'normale', client_id: '', tags: '' })
          setPanelTicket(ticket)
        },
      }
    )
  }

  function handleStatusChange(id: string, status: TicketStatus) {
    updateTicket.mutate({ id, status })
  }

  const STAT_CARDS = [
    { id: 'tous' as FilterStatus,     label: 'Total',     count: counts.tous,     iconCls: 'text-gray-500',    bg: 'bg-gray-100',    ring: '' },
    { id: 'ouvert' as FilterStatus,   label: 'Ouverts',   count: counts.ouvert,   iconCls: 'text-blue-500',    bg: 'bg-blue-50',     ring: 'ring-blue-300' },
    { id: 'en_cours' as FilterStatus, label: 'En cours',  count: counts.en_cours, iconCls: 'text-violet-500',  bg: 'bg-violet-50',   ring: 'ring-violet-300' },
    { id: 'resolu' as FilterStatus,   label: 'Résolus',   count: counts.resolu,   iconCls: 'text-emerald-500', bg: 'bg-emerald-50',  ring: 'ring-emerald-300' },
  ]

  return (
    <Layout
      title="Support"
      actions={
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" />
          Nouveau ticket
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {STAT_CARDS.map(s => {
          const Icon = s.id === 'tous' ? LifeBuoy : STATUS_ICONS[s.id as TicketStatus]
          const active = filterStatus === s.id
          return (
            <button
              key={s.id}
              onClick={() => setFilterStatus(active && s.id !== 'tous' ? 'tous' : s.id)}
              className={cn(
                'bg-white rounded-xl border p-4 text-left transition-all shadow-card flex items-center gap-3',
                active && s.id !== 'tous' ? `border-brand-400 ring-2 ${s.ring}` : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <div className={cn('p-2 rounded-lg shrink-0', s.bg)}>
                <Icon className={cn('h-4 w-4', s.iconCls)} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 leading-none">{s.count}</p>
              </div>
              {s.id === 'tous' && counts.critique > 0 && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  {counts.critique} critique{counts.critique > 1 ? 's' : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <Card padding={false} className="mb-4">
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Status pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {([
              { id: 'tous', label: 'Tous' },
              { id: 'ouvert',   label: 'Ouverts' },
              { id: 'en_cours', label: 'En cours' },
              { id: 'resolu',   label: 'Résolus' },
              { id: 'ferme',    label: 'Fermés' },
            ] as { id: FilterStatus; label: string }[]).map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  filterStatus === f.id ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {f.label}
                {f.id !== 'tous' && (counts[f.id] ?? 0) > 0 && (
                  <span className={cn('ml-1.5 text-[10px] font-semibold px-1 rounded-full', filterStatus === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500')}>
                    {counts[f.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="h-4 border-r border-gray-200 mx-1" />

          <select
            value={filterPriority}
            onChange={e => setPriority(e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <Input
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leading={<Search className="h-3.5 w-3.5" />}
              className="w-52"
            />
            {/* View toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('table')}
                className={cn('px-2.5 py-1.5 transition-colors', view === 'table' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50')}
                title="Vue tableau"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView('kanban')}
                className={cn('px-2.5 py-1.5 transition-colors', view === 'kanban' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50')}
                title="Vue kanban"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Views */}
      {view === 'kanban' ? (
        <KanbanBoard
          tickets={filtered}
          onOpen={t => setPanelTicket(t)}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <Card padding={false}>
          <Table>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Sujet</Th>
                <Th>Client</Th>
                <Th>Priorité</Th>
                <Th>Statut</Th>
                <Th>Ouvert depuis</Th>
                <Th>Mis à jour</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <EmptyRow cols={7} message="Aucun ticket trouvé" />
              ) : (
                filtered.map(t => {
                  const sla = slaClass(t)
                  const hasAlert = !!sla
                  return (
                    <Tr
                      key={t.id}
                      onClick={() => setPanelTicket(t)}
                      className={cn('cursor-pointer', sla)}
                    >
                      <Td>
                        <span className="font-mono text-xs text-gray-400">
                          {t.ticket_number ?? t.id.substring(0, 8).toUpperCase()}
                        </span>
                      </Td>
                      <Td className="max-w-[260px]">
                        <div className="flex items-start gap-2">
                          {hasAlert && (
                            <AlertTriangle className={cn(
                              'h-3.5 w-3.5 mt-0.5 shrink-0',
                              t.priority === 'critique' ? 'text-red-500' : 'text-amber-500'
                            )} />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{t.sujet}</p>
                            {t.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {t.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tag}</span>
                                ))}
                                {t.tags.length > 2 && <span className="text-[10px] text-gray-400">+{t.tags.length - 2}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {t.client ? (
                          <div className="flex items-center gap-2">
                            <Avatar nom={t.client.nom} prenom={t.client.prenom} size="sm" />
                            <span className="text-sm text-gray-600 truncate">{t.client.prenom} {t.client.nom}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </Td>
                      <Td><Badge status={t.priority} dot /></Td>
                      <Td><Badge status={t.status} dot /></Td>
                      <Td>
                        <span className={cn('text-xs', hasAlert ? 'text-red-600 font-medium' : 'text-gray-400')}>
                          {timeSince(t.created_at)}
                        </span>
                      </Td>
                      <Td className="text-xs text-gray-400">{timeAgo(t.updated_at)}</Td>
                    </Tr>
                  )
                })
              )}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Ticket panel */}
      {panelTicket && (
        <TicketPanel
          ticket={panelTicket}
          onClose={() => setPanelTicket(null)}
          onDeleted={() => setPanelTicket(null)}
        />
      )}

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateError('') }}
        title="Nouveau ticket"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowCreate(false); setCreateError('') }}>Annuler</Button>
            <Button onClick={handleCreate} loading={createTicket.isPending}>Créer le ticket</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Sujet *"
            placeholder="Décrivez le problème en une phrase"
            value={createForm.sujet}
            onChange={e => setCreateForm(f => ({ ...f, sujet: e.target.value }))}
          />
          <Textarea
            label="Description *"
            placeholder="Détails, étapes pour reproduire, environnement…"
            value={createForm.description}
            onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priorité"
              value={createForm.priority}
              onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}
              options={[
                { value: 'basse',    label: 'Basse' },
                { value: 'normale',  label: 'Normale' },
                { value: 'haute',    label: 'Haute' },
                { value: 'critique', label: 'Critique' },
              ]}
            />
            <Select
              label="Client (optionnel)"
              value={createForm.client_id}
              onChange={e => setCreateForm(f => ({ ...f, client_id: e.target.value }))}
              placeholder="Aucun client associé"
              options={clientsData.map(c => ({
                value: c.id,
                label: `${c.prenom} ${c.nom}${c.entreprise ? ` (${c.entreprise})` : ''}`,
              }))}
            />
          </div>
          <Input
            label="Tags (séparés par des virgules)"
            placeholder="bug, urgent, interface…"
            value={createForm.tags}
            onChange={e => setCreateForm(f => ({ ...f, tags: e.target.value }))}
          />
          {createError && <p className="text-xs text-red-500">{createError}</p>}
        </div>
      </Modal>
    </Layout>
  )
}
