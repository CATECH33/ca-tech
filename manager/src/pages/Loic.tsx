import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'
import {
  useLoicConversations,
  useCreateLoicConversation,
  useUpdateLoicConversation,
  useDeleteLoicConversation,
} from '@/hooks/useLoic'
import { useCreateLead } from '@/hooks/useLeads'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  Bot, Send, Plus, Trash2, Sparkles, LayoutDashboard,
  MessageSquare, CheckCircle, AlertTriangle, Users,
  TrendingUp, Archive, Mail, Phone,
  User, Calendar, ExternalLink,
  Loader2, ChevronRight, Globe, Monitor,
  Wifi, Paperclip, X,
} from 'lucide-react'
import type { LoicMessage, AIConversation } from '@/hooks/useLoic'
import { uploadDocument } from '@/hooks/useDocuments'

const WELCOME: LoicMessage = {
  role: 'assistant',
  content:
    'Bonjour ! Je suis Loïc, l\'assistant commercial de CA-TECH 👋\n\nJe suis là pour vous présenter nos services, répondre à vos questions et vous accompagner dans votre projet digital. Comment puis-je vous aider aujourd\'hui ?',
  timestamp: new Date().toISOString(),
}

function convTitle(c: AIConversation): string {
  if (c.metadata.prenom || c.metadata.nom)
    return `${c.metadata.prenom ?? ''} ${c.metadata.nom ?? ''}`.trim()
  const first = c.messages.find(m => m.role === 'user')
  if (first) return first.content.slice(0, 28) + (first.content.length > 28 ? '…' : '')
  return 'Nouvelle conversation'
}

function convPreview(c: AIConversation): string {
  if (!c.messages.length) return 'Conversation démarrée…'
  const last = c.messages[c.messages.length - 1]
  return last.content.slice(0, 58) + (last.content.length > 58 ? '…' : '')
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2.5 mb-3">
      <div className="h-7 w-7 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          {[0, 150, 300].map(d => (
            <div
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MsgBubble({ msg }: { msg: LoicMessage }) {
  const isBot = msg.role === 'assistant'
  return (
    <div className={cn('flex items-start gap-2.5 mb-3', !isBot && 'flex-row-reverse')}>
      <div className={cn(
        'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
        isBot ? 'bg-brand-500' : 'bg-gray-200'
      )}>
        {isBot
          ? <Bot className="h-3.5 w-3.5 text-white" />
          : <User className="h-3.5 w-3.5 text-gray-600" />
        }
      </div>
      <div className={cn('max-w-[75%] flex flex-col gap-1', !isBot && 'items-end')}>
        <div className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isBot ? 'bg-gray-100 text-gray-900 rounded-tl-sm' : 'bg-brand-500 text-white rounded-tr-sm'
        )}>
          {msg.content}
        </div>

        {msg.action?.type === 'propose_appointment' && (
          <a
            href="/agenda"
            className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700 hover:bg-blue-100 transition-colors mt-1"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="flex-1">Planifier un rendez-vous de découverte</span>
            <ExternalLink className="h-3 w-3 text-blue-400" />
          </a>
        )}

        {msg.action?.type === 'escalate' && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            Demande transmise à l'équipe CA-TECH
          </div>
        )}

        <span className="text-[10px] text-gray-400 px-1">
          {format(new Date(msg.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  )
}

export function Loic() {
  const navigate = useNavigate()
  const { data: conversations = [], isLoading } = useLoicConversations()
  const createConv = useCreateLoicConversation()
  const updateConv = useUpdateLoicConversation()
  const deleteConv = useDeleteLoicConversation()
  const createLead = useCreateLead()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [localMsgs, setLocalMsgs] = useState<LoicMessage[]>([])
  const [localMeta, setLocalMeta] = useState<AIConversation['metadata']>({})
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const [tab, setTab] = useState<'chat' | 'dashboard'>('chat')
  const [leadDone, setLeadDone] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [hoverConv, setHoverConv] = useState<string | null>(null)
  const [loicAttachments, setLoicAttachments] = useState<{ name: string }[]>([])
  const [attachUploading, setAttachUploading] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = inputRef
  const fileAttachRef = useRef<HTMLInputElement>(null)

  const activeConv = conversations.find(c => c.id === activeId)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMsgs, isTyping])

  // Load messages when switching conversations
  useEffect(() => {
    const conv = conversations.find(c => c.id === activeId)
    if (!conv) return
    const msgs = conv.messages.length > 0
      ? conv.messages
      : [{ ...WELCOME, timestamp: conv.created_at }]
    setLocalMsgs(msgs)
    setLocalMeta(conv.metadata ?? {})
    setLeadDone(!!conv.metadata?.lead_created)
    setEscalated(!!conv.metadata?.escalated)
    setLoicAttachments([])
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNew = async () => {
    try {
      const conv = await createConv.mutateAsync()
      const welcome = { ...WELCOME, timestamp: conv.created_at }
      setLocalMsgs([welcome])
      setLocalMeta({})
      setLeadDone(false)
      setEscalated(false)
      setActiveId(conv.id)
      await updateConv.mutateAsync({ id: conv.id, messages: [welcome] })
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (e) {
      console.error('Failed to create conversation:', e)
    }
  }

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || !activeId || isTyping) return

    const userMsg: LoicMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    const withUser = [...localMsgs, userMsg]
    setLocalMsgs(withUser)
    setInput('')
    setIsTyping(true)

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = '44px'

    try {
      const apiMsgs = withUser.map(m => ({ role: m.role, content: m.content }))

      const { data, error } = await supabase.functions.invoke('loic-chat', {
        body: { messages: apiMsgs, metadata: localMeta },
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      const { message = '', action } = data as { message: string; action?: any }

      const botMsg: LoicMessage = {
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString(),
        action: action ?? undefined,
      }

      const final = [...withUser, botMsg]
      setLocalMsgs(final)

      let newMeta = { ...localMeta }
      let newLeadId: string | undefined

      if (action?.type === 'create_lead' && !leadDone && action.data) {
        try {
          const lead = await createLead.mutateAsync({
            prenom: action.data.prenom ?? '',
            nom: action.data.nom ?? '',
            email: action.data.email ?? '',
            telephone: action.data.telephone,
            besoin: action.data.projet,
            budget_estime: action.data.budget > 0 ? action.data.budget : undefined,
            source: 'loic',
            status: 'qualifie',
          })
          newLeadId = lead.id
          newMeta = { ...newMeta, ...action.data, lead_created: true }
          setLeadDone(true)
        } catch (e) {
          console.error('Lead creation failed:', e)
        }
      }

      if (action?.type === 'escalate') {
        newMeta = { ...newMeta, escalated: true }
        setEscalated(true)
      }

      setLocalMeta(newMeta)
      await updateConv.mutateAsync({
        id: activeId,
        messages: final,
        metadata: newMeta,
        ...(newLeadId ? { lead_id: newLeadId } : {}),
      })
    } catch {
      setLocalMsgs(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Désolé, je rencontre un problème technique. Merci de réessayer ou de contacter CA-TECH directement à pemoustaskit@gmail.com',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }, [input, activeId, localMsgs, localMeta, leadDone, isTyping, createLead, updateConv])

  const handleAttachFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !activeId) return
    setAttachUploading(true)
    try {
      await uploadDocument(file, { entityType: 'conversation', entityId: activeId })
      setLoicAttachments(prev => [...prev, { name: file.name }])
    } catch (err) {
      console.error('Attach upload failed:', err)
    } finally {
      setAttachUploading(false)
    }
  }, [activeId])

  // Qualification progress
  const qualFields = [
    { label: 'Nom', filled: !!localMeta.prenom },
    { label: 'Email', filled: !!localMeta.email },
    { label: 'Tél.', filled: !!localMeta.telephone },
    { label: 'Projet', filled: !!localMeta.projet },
    { label: 'Budget', filled: localMeta.budget !== undefined },
  ]
  const qualCount = qualFields.filter(f => f.filled).length

  // Dashboard stats
  const total = conversations.length
  const leadsCount = conversations.filter(c => c.lead_id).length
  const widgetCount = conversations.filter(c => c.metadata?.source === 'widget').length
  const rate = total > 0 ? Math.round((leadsCount / total) * 100) : 0

  return (
    <Layout
      title="Loïc V2 — Assistant commercial"
      actions={
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full mr-1">
            <Wifi className="h-2.5 w-2.5 animate-pulse" /> Temps réel
          </span>
          <button
            onClick={() => setTab('chat')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              tab === 'chat' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Sparkles className="h-3.5 w-3.5" /> Assistant
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              tab === 'dashboard' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
          </button>
        </div>
      }
    >
      {tab === 'chat' ? (
        <div className="flex gap-4 h-[calc(100vh-12rem)]">

          {/* ── Sidebar: conversation list ── */}
          <div className="w-64 shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <button
                onClick={handleNew}
                disabled={createConv.isPending}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createConv.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />
                }
                Nouvelle conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Aucune conversation</p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {conversations.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      onMouseEnter={() => setHoverConv(c.id)}
                      onMouseLeave={() => setHoverConv(null)}
                      className={cn(
                        'relative flex flex-col px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                        c.id === activeId ? 'bg-brand-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn(
                          'text-xs font-semibold truncate flex-1',
                          c.id === activeId ? 'text-brand-700' : 'text-gray-800'
                        )}>
                          {convTitle(c)}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.metadata?.source === 'widget' && (
                            <Globe className="h-2.5 w-2.5 text-purple-400" aria-label="Depuis le site web" />
                          )}
                          {c.lead_id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" title="Lead créé" />
                          )}
                          {c.metadata?.escalated && (
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Escaladé" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 truncate leading-relaxed">
                        {convPreview(c)}
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-gray-300">
                          {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: fr })}
                        </span>
                        {hoverConv === c.id && (
                          <button
                            onClick={async e => {
                              e.stopPropagation()
                              if (c.id === activeId) { setActiveId(null); setLocalMsgs([]) }
                              await deleteConv.mutateAsync(c.id)
                            }}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden min-w-0">
            {!activeId ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="h-16 w-16 rounded-2xl bg-brand-500 flex items-center justify-center mb-4 shadow-lg shadow-brand-200">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Loïc — Assistant CA-TECH</h2>
                <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
                  Qualifiez vos prospects, présentez vos services et créez des leads automatiquement grâce à l'IA.
                </p>
                <button
                  onClick={handleNew}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Démarrer une conversation
                </button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {activeConv ? convTitle(activeConv) : 'Loïc'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Assistant CA-TECH · {localMsgs.length} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadDone && (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Lead créé
                      </span>
                    )}
                    {escalated && (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3" /> Escaladé
                      </span>
                    )}
                    {activeConv?.lead_id && (
                      <button
                        onClick={() => navigate('/leads')}
                        className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium"
                      >
                        Voir lead <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-4">
                  {localMsgs.map((msg, i) => (
                    <MsgBubble key={i} msg={msg} />
                  ))}
                  {isTyping && <TypingDots />}
                  <div ref={endRef} />
                </div>

                {/* Qualification progress bar */}
                {!leadDone && qualCount > 0 && (
                  <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/60 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">Qualification</span>
                      <div className="flex gap-1 flex-1">
                        {qualFields.map(f => (
                          <div
                            key={f.label}
                            title={f.label}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-all duration-300',
                              f.filled ? 'bg-brand-500' : 'bg-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{qualCount}/5</span>
                    </div>
                  </div>
                )}

                {/* Lead created banner */}
                {leadDone && (
                  <div className="px-4 py-2.5 bg-green-50 border-t border-green-100 flex items-center gap-3 shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-xs text-green-700 flex-1">
                      Prospect qualifié et enregistré comme lead
                    </span>
                    <button
                      onClick={() => navigate('/leads')}
                      className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 shrink-0"
                    >
                      Voir dans Leads <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Input bar */}
                <div className="p-3 border-t border-gray-100 shrink-0">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          send()
                        }
                      }}
                      onInput={e => {
                        const t = e.target as HTMLTextAreaElement
                        t.style.height = 'auto'
                        t.style.height = Math.min(t.scrollHeight, 120) + 'px'
                      }}
                      placeholder="Écrire un message… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileAttachRef.current?.click()}
                      disabled={!activeId || attachUploading}
                      title="Joindre un document"
                      className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors shrink-0"
                    >
                      {attachUploading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Paperclip className="h-4 w-4" />
                      }
                    </button>
                    <input
                      ref={fileAttachRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.svg,.zip"
                      onChange={handleAttachFile}
                      className="sr-only"
                    />
                    <button
                      onClick={send}
                      disabled={!input.trim() || isTyping}
                      className="h-11 w-11 flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
                    >
                      {isTyping
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Send className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  {loicAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                      {loicAttachments.map((a, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] bg-brand-50 text-brand-600 border border-brand-100 rounded-md px-1.5 py-0.5"
                        >
                          <Paperclip className="h-2.5 w-2.5 shrink-0" />
                          <span className="max-w-[120px] truncate">{a.name}</span>
                          <button
                            type="button"
                            onClick={() => setLoicAttachments(prev => prev.filter((_, j) => j !== i))}
                            className="text-brand-400 hover:text-brand-600 ml-0.5"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-300 mt-1.5 px-1">
                    Loïc est alimenté par Claude · CA-TECH 2026
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ── Dashboard view ── */
        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Conversations', value: total, Icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Leads créés', value: leadsCount, Icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Taux de conversion', value: `${rate}%`, Icon: TrendingUp, color: 'text-brand-500', bg: 'bg-brand-50' },
              { label: 'Depuis le site', value: widgetCount, Icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
                  <s.Icon className={cn('h-5 w-5', s.color)} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Knowledge base summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Base de connaissances active</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { cat: 'Web', items: ['Landing page — 270€', 'Site vitrine — 590€', 'Site e-commerce — 1 090€', 'Développement sur mesure — 2 500€+'] },
                { cat: 'Branding', items: ['Création de logo — 180€', 'Identité visuelle — 350€', 'Création de flyers — 139€'] },
                { cat: 'Tech & IA', items: ['Intelligence artificielle — 1 500€+', 'Automatisation — 800€+'] },
              ].map(s => (
                <div key={s.cat} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">{s.cat}</p>
                  <ul className="space-y-1">
                    {s.items.map(item => (
                      <li key={item} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <CheckCircle className="h-2.5 w-2.5 text-green-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Conversations table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Historique des conversations</h3>
              <span className="text-xs text-gray-400">{total} au total</span>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-14">
                <Bot className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-3">Aucune conversation pour le moment</p>
                <button
                  onClick={() => setTab('chat')}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  Démarrer la première conversation →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Visiteur', 'Contact', 'Projet', 'Source', 'Msg', 'Statut', 'Lead', 'Date', ''].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {conversations.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-900">
                            {(c.metadata.prenom || c.metadata.nom)
                              ? `${c.metadata.prenom ?? ''} ${c.metadata.nom ?? ''}`.trim()
                              : <span className="text-gray-400 italic">Anonyme</span>
                            }
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {c.metadata.email && (
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Mail className="h-2.5 w-2.5 text-gray-300" /> {c.metadata.email}
                              </p>
                            )}
                            {c.metadata.telephone && (
                              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5 text-gray-300" /> {c.metadata.telephone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          {c.metadata.projet ? (
                            <span className="text-[11px] text-gray-500 line-clamp-2">{c.metadata.projet}</span>
                          ) : (
                            <span className="text-gray-300 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.metadata?.source === 'widget' ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full w-fit">
                              <Globe className="h-2.5 w-2.5" /> Site web
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full w-fit">
                              <Monitor className="h-2.5 w-2.5" /> Manager
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-gray-500">{c.messages.length}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', {
                            'bg-green-50 text-green-600': c.status === 'active',
                            'bg-blue-50 text-blue-600': c.status === 'completed',
                            'bg-gray-100 text-gray-500': c.status === 'archived',
                          })}>
                            {c.status === 'active' ? 'Actif' : c.status === 'completed' ? 'Terminé' : 'Archivé'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.lead_id ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                              <CheckCircle className="h-3 w-3" /> Créé
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-gray-400">
                            {format(new Date(c.created_at), 'dd/MM/yy', { locale: fr })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setActiveId(c.id); setTab('chat') }}
                              title="Ouvrir la conversation"
                              className="text-gray-300 hover:text-brand-500 transition-colors"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => updateConv.mutateAsync({
                                id: c.id,
                                status: c.status === 'archived' ? 'active' : 'archived',
                              })}
                              title={c.status === 'archived' ? 'Désarchiver' : 'Archiver'}
                              className="text-gray-300 hover:text-amber-400 transition-colors"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (c.id === activeId) { setActiveId(null); setLocalMsgs([]) }
                                await deleteConv.mutateAsync(c.id)
                              }}
                              title="Supprimer"
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
