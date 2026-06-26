import { useState, useMemo } from 'react'
import {
  Plus, X, Edit, Trash2, ChevronLeft, ChevronRight,
  Users, Phone, Monitor, AlertCircle, Bell, MoreHorizontal,
  MapPin, Video, Clock, CheckCircle, XCircle, AlertTriangle,
  CalendarDays, List, CalendarCheck, User, ExternalLink,
} from 'lucide-react'
import {
  format, parseISO, isSameDay, isToday, isSameMonth,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths,
  eachDayOfInterval, differenceInMinutes, addHours,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import {
  useAppointments, useCreateAppointment, useUpdateAppointment,
  useDeleteAppointment, type ApptPayload,
} from '@/hooks/useAgenda'
import { useClients } from '@/hooks/useClients'
import type { Appointment, AppointmentType, AppointmentStatus } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_H  = 56
const DAY_START = 7
const DAY_END   = 21
const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => i + DAY_START)

type ViewMode = 'month' | 'week' | 'day' | 'list'

const TYPE_CFG: Record<AppointmentType, { label: string; Icon: React.ElementType; pill: string; block: string; dot: string }> = {
  meeting:  { label: 'Réunion',  Icon: Users,         pill: 'bg-brand-50 text-brand-700',    block: 'bg-brand-500/10 border-l-2 border-brand-500 text-brand-800',    dot: 'bg-brand-500'   },
  call:     { label: 'Appel',    Icon: Phone,         pill: 'bg-emerald-50 text-emerald-700', block: 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-800', dot: 'bg-emerald-500' },
  demo:     { label: 'Démo',     Icon: Monitor,       pill: 'bg-violet-50 text-violet-700',   block: 'bg-violet-500/10 border-l-2 border-violet-500 text-violet-800',   dot: 'bg-violet-500'  },
  deadline: { label: 'Deadline', Icon: AlertCircle,   pill: 'bg-red-50 text-red-700',         block: 'bg-red-500/10 border-l-2 border-red-500 text-red-800',            dot: 'bg-red-500'     },
  reminder: { label: 'Rappel',   Icon: Bell,          pill: 'bg-amber-50 text-amber-700',     block: 'bg-amber-500/10 border-l-2 border-amber-500 text-amber-800',      dot: 'bg-amber-500'   },
  other:    { label: 'Autre',    Icon: MoreHorizontal, pill: 'bg-gray-100 text-gray-600',     block: 'bg-gray-100 border-l-2 border-gray-400 text-gray-700',            dot: 'bg-gray-400'    },
}

const STATUS_CFG: Record<AppointmentStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Planifié',  cls: 'bg-blue-50 text-blue-700 border-blue-200'       },
  confirmed: { label: 'Confirmé',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Terminé',   cls: 'bg-gray-100 text-gray-500 border-gray-200'      },
  cancelled: { label: 'Annulé',    cls: 'bg-red-50 text-red-600 border-red-200'          },
  no_show:   { label: 'Absent',    cls: 'bg-orange-50 text-orange-600 border-orange-200' },
}

const TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: 'meeting',  label: '👥 Réunion'  },
  { value: 'call',     label: '📞 Appel'    },
  { value: 'demo',     label: '🖥️ Démo'    },
  { value: 'deadline', label: '🔴 Deadline' },
  { value: 'reminder', label: '🔔 Rappel'   },
  { value: 'other',    label: '📌 Autre'    },
]
const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Planifié'  },
  { value: 'confirmed', label: 'Confirmé'  },
  { value: 'completed', label: 'Terminé'   },
  { value: 'cancelled', label: 'Annulé'    },
  { value: 'no_show',   label: 'Absent'    },
]

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  titre: string; type: AppointmentType; status: AppointmentStatus
  date: string; start_time: string; end_time: string
  client_id: string; en_ligne: boolean; lieu: string; url_reunion: string; description: string
}
const FORM_INIT: FormState = {
  titre: '', type: 'meeting', status: 'scheduled',
  date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '10:00',
  client_id: '', en_ligne: false, lieu: '', url_reunion: '', description: '',
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function getMonthGrid(nav: Date): Date[][] {
  const start = startOfWeek(startOfMonth(nav), { weekStartsOn: 1 })
  const end   = endOfWeek(endOfMonth(nav), { weekStartsOn: 1 })
  const all   = eachDayOfInterval({ start, end })
  const weeks: Date[][] = []
  for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7))
  return weeks
}

function getWeekDays(nav: Date): Date[] {
  const start = startOfWeek(nav, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

function isAllDay(a: Appointment): boolean {
  const s = parseISO(a.start_at)
  return s.getHours() === 0 && s.getMinutes() === 0
}

function eventTop(a: Appointment): number {
  const s = parseISO(a.start_at)
  return Math.max(0, (s.getHours() + s.getMinutes() / 60 - DAY_START) * HOUR_H)
}

function eventHeight(a: Appointment): number {
  const s = parseISO(a.start_at)
  const e = a.end_at ? parseISO(a.end_at) : addHours(s, 1)
  const mins = Math.max(15, differenceInMinutes(e, s))
  const clampedMins = Math.min(mins, (DAY_END - s.getHours()) * 60 - s.getMinutes())
  return Math.max(24, (clampedMins / 60) * HOUR_H)
}

function getNavLabel(view: ViewMode, nav: Date): string {
  if (view === 'month') return format(nav, 'MMMM yyyy', { locale: fr })
  if (view === 'week') {
    const s = startOfWeek(nav, { weekStartsOn: 1 })
    const e = endOfWeek(nav, { weekStartsOn: 1 })
    return isSameMonth(s, e)
      ? `${format(s, 'd')} — ${format(e, 'd MMMM yyyy', { locale: fr })}`
      : `${format(s, 'd MMM', { locale: fr })} — ${format(e, 'd MMM yyyy', { locale: fr })}`
  }
  if (view === 'day') return format(nav, 'EEEE d MMMM yyyy', { locale: fr })
  return 'Rendez-vous à venir'
}

function navigate(view: ViewMode, nav: Date, dir: -1 | 1): Date {
  if (view === 'month') return addMonths(nav, dir)
  if (view === 'week')  return addWeeks(nav, dir)
  return addDays(nav, dir)
}

const FR_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ─── Small shared components ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

function EventPill({ appt, onClick }: { appt: Appointment; onClick: (e: React.MouseEvent) => void }) {
  const cfg = TYPE_CFG[appt.type]
  const time = format(parseISO(appt.start_at), 'HH:mm')
  return (
    <button
      onClick={onClick}
      className={cn('w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate leading-tight', cfg.pill)}
    >
      <span className="opacity-70">{time}</span> {appt.titre}
    </button>
  )
}

function EventBlock({ appt, onClick }: { appt: Appointment; onClick: (e: React.MouseEvent) => void }) {
  const cfg = TYPE_CFG[appt.type]
  const Icon = cfg.Icon
  const top    = eventTop(appt)
  const height = eventHeight(appt)
  const time   = format(parseISO(appt.start_at), 'HH:mm')
  return (
    <button
      onClick={onClick}
      style={{ top, height, left: 4, right: 4, position: 'absolute' }}
      className={cn('rounded-lg px-2 py-1 text-left overflow-hidden cursor-pointer transition-opacity hover:opacity-90 z-10', cfg.block)}
    >
      <div className="flex items-center gap-1 truncate">
        <Icon className="h-2.5 w-2.5 shrink-0 opacity-70" />
        <span className="text-[10px] font-bold truncate">{appt.titre}</span>
      </div>
      {height >= 36 && <p className="text-[9px] opacity-60 mt-0.5">{time}</p>}
      {height >= 52 && appt.client && (
        <p className="text-[9px] opacity-60 truncate">{appt.client.prenom} {appt.client.nom}</p>
      )}
    </button>
  )
}

function AppointmentRow({ appt, onClick }: { appt: Appointment; onClick: () => void }) {
  const cfg  = TYPE_CFG[appt.type]
  const Icon = cfg.Icon
  const start = parseISO(appt.start_at)
  const end   = appt.end_at ? parseISO(appt.end_at) : null
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group',
        (appt.status === 'cancelled' || appt.status === 'completed') && 'opacity-50',
      )}
    >
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cfg.pill)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{appt.titre}</p>
          <StatusBadge status={appt.status} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-500">
            {format(start, 'HH:mm')}{end ? ` — ${format(end, 'HH:mm')}` : ''}
          </span>
          {appt.client && (
            <span className="text-xs text-gray-400 truncate">{appt.client.prenom} {appt.client.nom}</span>
          )}
          {(appt.lieu || appt.en_ligne) && (
            <span className="text-xs text-gray-400 truncate">
              {appt.en_ligne ? '🔗 En ligne' : `📍 ${appt.lieu}`}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Main Agenda page ─────────────────────────────────────────────────────────

export function Agenda() {
  const [view, setView]         = useState<ViewMode>('month')
  const [nav, setNav]           = useState(new Date())
  const [panelMode, setPanelMode] = useState<'view' | 'create' | 'edit' | null>(null)
  const [panelEvent, setPanelEvent] = useState<Appointment | null>(null)
  const [form, setForm]         = useState<FormState>(FORM_INIT)
  const [confirmDel, setConfirmDel] = useState(false)

  const { data: appointments = [], isLoading } = useAppointments()
  const { data: clients = [] } = useClients()
  const createAppt = useCreateAppointment()
  const updateAppt = useUpdateAppointment()
  const deleteAppt = useDeleteAppointment()

  const isPending = createAppt.isPending || updateAppt.isPending

  // ── Panel helpers ──────────────────────────────────────────────────────────
  const closePanel = () => { setPanelMode(null); setPanelEvent(null); setConfirmDel(false) }

  const openCreate = (prefillDate?: string) => {
    setForm({ ...FORM_INIT, date: prefillDate ?? FORM_INIT.date })
    setPanelEvent(null)
    setPanelMode('create')
  }

  const openView = (appt: Appointment) => {
    setPanelEvent(appt)
    setPanelMode('view')
    setConfirmDel(false)
  }

  const startEdit = (appt: Appointment) => {
    const s = parseISO(appt.start_at)
    const e = appt.end_at ? parseISO(appt.end_at) : null
    setForm({
      titre:      appt.titre,
      type:       appt.type,
      status:     appt.status,
      date:       format(s, 'yyyy-MM-dd'),
      start_time: format(s, 'HH:mm'),
      end_time:   e ? format(e, 'HH:mm') : '',
      client_id:  appt.client_id ?? '',
      en_ligne:   appt.en_ligne,
      lieu:       appt.lieu ?? '',
      url_reunion: appt.url_reunion ?? '',
      description: appt.description ?? '',
    })
    setPanelMode('edit')
  }

  const buildPayload = (): ApptPayload => ({
    titre:       form.titre,
    type:        form.type,
    status:      form.status,
    start_at:    `${form.date}T${form.start_time}:00`,
    end_at:      form.end_time ? `${form.date}T${form.end_time}:00` : null,
    en_ligne:    form.en_ligne,
    lieu:        !form.en_ligne ? form.lieu || undefined : undefined,
    url_reunion: form.en_ligne ? form.url_reunion || undefined : undefined,
    client_id:   form.client_id || null,
    description: form.description || undefined,
  })

  const handleSave = async () => {
    if (!form.titre.trim()) return
    if (panelMode === 'create') {
      await createAppt.mutateAsync(buildPayload())
    } else if (panelMode === 'edit' && panelEvent) {
      await updateAppt.mutateAsync({ id: panelEvent.id, ...buildPayload() })
    }
    closePanel()
  }

  const handleDelete = async () => {
    if (!panelEvent) return
    await deleteAppt.mutateAsync(panelEvent.id)
    closePanel()
  }

  const quickStatus = async (status: AppointmentStatus) => {
    if (!panelEvent) return
    await updateAppt.mutateAsync({ ...buildPayloadFromEvent(panelEvent), id: panelEvent.id, status })
    setPanelEvent(prev => prev ? { ...prev, status } : null)
  }

  function buildPayloadFromEvent(a: Appointment): ApptPayload {
    return {
      titre: a.titre, type: a.type, status: a.status,
      start_at: a.start_at, end_at: a.end_at ?? null,
      en_ligne: a.en_ligne, lieu: a.lieu, url_reunion: a.url_reunion,
      client_id: a.client_id ?? null, description: a.description,
    }
  }

  const setF = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }))

  const clientOptions = useMemo(() =>
    clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}` })),
  [clients])

  // ── Day filter helper ──────────────────────────────────────────────────────
  const getDayEvents = (day: Date, allDay = false) =>
    appointments.filter(a => isSameDay(parseISO(a.start_at), day) && isAllDay(a) === allDay)
      .sort((a, b) => a.start_at.localeCompare(b.start_at))

  // ── Stats ──────────────────────────────────────────────────────────────────
  const todayEvents   = getDayEvents(new Date(), false).length + getDayEvents(new Date(), true).length
  const weekStart     = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd       = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEvents    = appointments.filter(a => {
    const d = parseISO(a.start_at)
    return d >= weekStart && d <= weekEnd
  }).length
  const upcoming      = appointments.filter(a => parseISO(a.start_at) > new Date() && a.status !== 'cancelled').length
  const confirmed     = appointments.filter(a => a.status === 'confirmed').length

  // ── Month view ─────────────────────────────────────────────────────────────
  const monthGrid = useMemo(() => getMonthGrid(nav), [nav])

  const MonthView = (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {FR_DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
        ))}
      </div>
      {/* Weeks */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {monthGrid.map((week, wi) => (
          <div key={wi} className={cn('grid grid-cols-7', wi > 0 && 'border-t border-gray-100')}>
            {week.map((day, di) => {
              const inMonth   = isSameMonth(day, nav)
              const today     = isToday(day)
              const dayAll    = getDayEvents(day, true)
              const dayTimed  = getDayEvents(day, false)
              const all       = [...dayAll, ...dayTimed]
              const shown     = all.slice(0, 3)
              const overflow  = all.length - shown.length
              return (
                <div
                  key={di}
                  className={cn(
                    'min-h-[100px] p-1.5 cursor-pointer hover:bg-gray-50 transition-colors',
                    !inMonth && 'bg-gray-50/60',
                    di < 6 && 'border-r border-gray-100',
                  )}
                  onClick={() => openCreate(format(day, 'yyyy-MM-dd'))}
                >
                  <div className="flex items-center justify-end mb-1">
                    <span className={cn(
                      'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                      today ? 'bg-brand-500 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300',
                    )}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {shown.map(a => (
                      <EventPill key={a.id} appt={a} onClick={e => { e.stopPropagation(); openView(a) }} />
                    ))}
                    {overflow > 0 && (
                      <p className="text-[10px] text-gray-400 px-1">+{overflow} autre{overflow > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  // ── Time grid (week + day) ─────────────────────────────────────────────────
  const TimeGrid = (days: Date[]) => (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className={cn('grid border-b border-gray-100', days.length === 1 ? 'grid-cols-1' : 'grid-cols-[56px_repeat(7,1fr)]')}>
        {days.length > 1 && <div className="w-14 shrink-0" />}
        {days.map(day => {
          const today = isToday(day)
          const allDay = getDayEvents(day, true)
          return (
            <div key={day.toISOString()} className={cn('text-center py-2 border-l border-gray-100 first:border-l-0', today && 'bg-brand-50/50')}>
              <p className={cn('text-xs font-semibold', today ? 'text-brand-600' : 'text-gray-500')}>
                {format(day, 'EEE', { locale: fr })}
              </p>
              <p className={cn(
                'text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto',
                today ? 'bg-brand-500 text-white' : 'text-gray-800',
              )}>
                {day.getDate()}
              </p>
              {/* All-day events */}
              {allDay.length > 0 && (
                <div className="mt-1 space-y-0.5 px-1">
                  {allDay.map(a => <EventPill key={a.id} appt={a} onClick={e => { e.stopPropagation(); openView(a) }} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
        <div className={cn('grid relative', days.length === 1 ? 'grid-cols-1' : 'grid-cols-[56px_repeat(7,1fr)]')}>
          {/* Time labels */}
          {days.length > 1 && (
            <div className="sticky left-0 bg-white z-10">
              {HOURS.map(h => (
                <div key={h} className="relative" style={{ height: HOUR_H }}>
                  <span className="absolute -top-2.5 right-2 text-[10px] text-gray-400 font-medium">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Day columns */}
          {days.map(day => {
            const timedEvents = getDayEvents(day, false).filter(a => !isAllDay(a))
            return (
              <div
                key={day.toISOString()}
                className={cn('relative border-l border-gray-100 first:border-l-0 cursor-pointer', isToday(day) && 'bg-brand-50/20')}
                style={{ height: HOURS.length * HOUR_H }}
                onClick={() => openCreate(format(day, 'yyyy-MM-dd'))}
              >
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: (h - DAY_START) * HOUR_H }}
                  />
                ))}
                {/* Current time indicator */}
                {isToday(day) && (() => {
                  const now = new Date()
                  const pct = now.getHours() + now.getMinutes() / 60
                  if (pct < DAY_START || pct > DAY_END) return null
                  const top = (pct - DAY_START) * HOUR_H
                  return (
                    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
                      <div className="h-px bg-brand-500 relative">
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-brand-500" />
                      </div>
                    </div>
                  )
                })()}
                {/* Events */}
                {timedEvents.map(a => (
                  <EventBlock key={a.id} appt={a} onClick={e => { e.stopPropagation(); openView(a) }} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── List view ──────────────────────────────────────────────────────────────
  const listItems = useMemo(() => {
    const now = new Date()
    const sorted = [...appointments].sort((a, b) => a.start_at.localeCompare(b.start_at))
    const past    = sorted.filter(a => parseISO(a.start_at) < now).slice(-5)
    const future  = sorted.filter(a => parseISO(a.start_at) >= now)
    return { past, future }
  }, [appointments])

  const ListView = (
    <div className="space-y-6">
      {listItems.past.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Récents</p>
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
            {listItems.past.map(a => <AppointmentRow key={a.id} appt={a} onClick={() => openView(a)} />)}
          </div>
        </div>
      )}

      {listItems.future.length === 0 && listItems.past.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <CalendarDays className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Aucun rendez-vous</p>
          <button onClick={() => openCreate()} className="mt-2 text-xs text-brand-600 hover:underline">
            Planifier un premier RDV →
          </button>
        </div>
      )}

      {Object.entries(
        listItems.future.reduce<Record<string, Appointment[]>>((acc, a) => {
          const key = a.start_at.split('T')[0]
          if (!acc[key]) acc[key] = []
          acc[key].push(a)
          return acc
        }, {})
      ).map(([date, events]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <p className={cn('text-xs font-semibold uppercase tracking-wider', isToday(parseISO(date)) ? 'text-brand-600' : 'text-gray-500')}>
              {isToday(parseISO(date)) ? "Aujourd'hui" : format(parseISO(date), 'EEEE d MMMM', { locale: fr })}
            </p>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{events.length} RDV</span>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
            {events.map(a => <AppointmentRow key={a.id} appt={a} onClick={() => openView(a)} />)}
          </div>
        </div>
      ))}
    </div>
  )

  // ── Panel — form ───────────────────────────────────────────────────────────
  const PanelForm = (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      <Input
        label="Titre *"
        placeholder="Réunion de lancement, Appel de suivi…"
        value={form.titre}
        onChange={e => setF('titre', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" value={form.type} onChange={e => setF('type', e.target.value as AppointmentType)} options={TYPE_OPTIONS} />
        <Select label="Statut" value={form.status} onChange={e => setF('status', e.target.value as AppointmentStatus)} options={STATUS_OPTIONS} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <Input label="Date" type="date" value={form.date} onChange={e => setF('date', e.target.value)} />
        </div>
        <Input label="Début" type="time" value={form.start_time} onChange={e => setF('start_time', e.target.value)} />
        <Input label="Fin" type="time" value={form.end_time} onChange={e => setF('end_time', e.target.value)} />
      </div>
      <Select
        label="Client"
        placeholder="Aucun client lié"
        value={form.client_id}
        onChange={e => setF('client_id', e.target.value)}
        options={clientOptions}
      />

      {/* Lieu / Online toggle */}
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1.5">Lieu ou lien</label>
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setF('en_ligne', false)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              !form.en_ligne ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
          >
            <MapPin className="h-3 w-3" /> En présentiel
          </button>
          <button
            type="button"
            onClick={() => setF('en_ligne', true)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              form.en_ligne ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
          >
            <Video className="h-3 w-3" /> En ligne
          </button>
        </div>
        {form.en_ligne ? (
          <Input placeholder="https://meet.google.com/…" value={form.url_reunion} onChange={e => setF('url_reunion', e.target.value)} leading={<Video className="h-3.5 w-3.5" />} />
        ) : (
          <Input placeholder="Adresse ou salle de réunion" value={form.lieu} onChange={e => setF('lieu', e.target.value)} leading={<MapPin className="h-3.5 w-3.5" />} />
        )}
      </div>

      <Textarea
        label="Description"
        placeholder="Ordre du jour, notes de préparation…"
        value={form.description}
        onChange={e => setF('description', e.target.value)}
        rows={3}
      />
    </div>
  )

  // ── Panel — detail view ────────────────────────────────────────────────────
  const PanelDetail = panelEvent ? (() => {
    const a    = panelEvent
    const cfg  = TYPE_CFG[a.type]
    const Icon = cfg.Icon
    const start = parseISO(a.start_at)
    const end   = a.end_at ? parseISO(a.end_at) : null
    const mins  = end ? differenceInMinutes(end, start) : null
    const dur   = mins ? mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? String(mins % 60).padStart(2, '0') : ''}` : `${mins}min` : null
    return (
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Type + status */}
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', cfg.pill)}>
            <Icon className="h-3 w-3" /> {cfg.label}
          </span>
          <StatusBadge status={a.status} />
        </div>

        {/* Date + time */}
        <div className={cn('p-4 rounded-xl', cfg.pill.split(' ')[0])}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date & heure</p>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {format(start, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-700">
              {format(start, 'HH:mm')}{end ? ` — ${format(end, 'HH:mm')}` : ''}
              {dur && <span className="text-gray-400 ml-2 text-xs">({dur})</span>}
            </p>
          </div>
        </div>

        {/* Client */}
        {a.client && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Client</p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Avatar nom={a.client.nom} prenom={a.client.prenom} size="md" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{a.client.prenom} {a.client.nom}</p>
                {a.client.entreprise && <p className="text-xs text-gray-500">{a.client.entreprise}</p>}
                <p className="text-xs text-gray-400">{a.client.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lieu / lien */}
        {(a.lieu || a.url_reunion || a.en_ligne) && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {a.en_ligne ? 'Lien de connexion' : 'Lieu'}
            </p>
            {a.en_ligne ? (
              <a
                href={a.url_reunion}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-600 hover:underline"
              >
                <Video className="h-3.5 w-3.5" />
                {a.url_reunion ?? 'Lien en ligne'}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {a.lieu}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {a.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">{a.description}</p>
          </div>
        )}

        {/* Quick status actions */}
        {a.status !== 'completed' && a.status !== 'cancelled' && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions rapides</p>
            <div className="flex flex-wrap gap-2">
              {a.status === 'scheduled' && (
                <button
                  onClick={() => quickStatus('confirmed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Confirmer
                </button>
              )}
              <button
                onClick={() => quickStatus('completed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Marquer terminé
              </button>
              <button
                onClick={() => quickStatus('cancelled')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" /> Annuler
              </button>
            </div>
          </div>
        )}
        {(a.status === 'completed' || a.status === 'cancelled') && (
          <button
            onClick={() => quickStatus('scheduled')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Réouvrir
          </button>
        )}
      </div>
    )
  })() : null

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Layout
      title="Agenda"
      actions={
        <Button size="sm" onClick={() => openCreate()}>
          <Plus className="h-3.5 w-3.5" /> Nouveau rendez-vous
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Aujourd'hui",  value: todayEvents,  sub: 'rendez-vous', color: 'text-brand-600' },
          { label: 'Cette semaine', value: weekEvents,  sub: 'rendez-vous', color: 'text-gray-900'  },
          { label: 'À venir',      value: upcoming,     sub: 'planifiés',   color: 'text-emerald-600' },
          { label: 'Confirmés',    value: confirmed,    sub: 'en attente',  color: 'text-amber-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1.5">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setNav(new Date())}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          Aujourd'hui
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setNav(navigate(view, nav, -1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setNav(navigate(view, nav, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <h2 className="text-sm font-semibold text-gray-800 capitalize flex-1">
          {getNavLabel(view, nav)}
        </h2>

        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {([
            { v: 'month' as ViewMode, label: 'Mois',    Icon: CalendarDays  },
            { v: 'week'  as ViewMode, label: 'Semaine', Icon: CalendarCheck },
            { v: 'day'   as ViewMode, label: 'Jour',    Icon: User          },
            { v: 'list'  as ViewMode, label: 'Liste',   Icon: List          },
          ] as const).map(({ v, label, Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar content */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-20">Chargement…</p>
      ) : (
        <>
          {view === 'month' && MonthView}
          {view === 'week' && TimeGrid(getWeekDays(nav))}
          {view === 'day'  && TimeGrid([nav])}
          {view === 'list' && ListView}
        </>
      )}

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {panelMode && (
        <>
          <div className="fixed inset-0 z-20 bg-black/10 backdrop-blur-[2px]" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 w-[520px] z-30 bg-white shadow-2xl flex flex-col border-l border-gray-100">

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              {panelMode === 'view' && panelEvent ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', TYPE_CFG[panelEvent.type].pill)}>
                    {(() => { const Icon = TYPE_CFG[panelEvent.type].Icon; return <Icon className="h-4 w-4" /> })()}
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 truncate">{panelEvent.titre}</h2>
                </div>
              ) : (
                <h2 className="text-sm font-semibold text-gray-900">
                  {panelMode === 'create' ? 'Nouveau rendez-vous' : 'Modifier'}
                </h2>
              )}
              <div className="flex items-center gap-2 shrink-0">
                {panelMode === 'view' && panelEvent && (
                  <button
                    onClick={() => startEdit(panelEvent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <Edit className="h-3 w-3" /> Modifier
                  </button>
                )}
                {(panelMode === 'create' || panelMode === 'edit') && (
                  <>
                    <Button variant="outline" size="sm" onClick={closePanel}>Annuler</Button>
                    <Button size="sm" onClick={handleSave} disabled={isPending || !form.titre.trim()}>
                      {isPending ? 'Enregistrement…' : panelMode === 'create' ? 'Créer' : 'Enregistrer'}
                    </Button>
                  </>
                )}
                <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1 transition-colors">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Panel body */}
            {panelMode === 'view' ? PanelDetail : PanelForm}

            {/* Panel footer (view mode only) */}
            {panelMode === 'view' && panelEvent && (
              <div className="px-6 py-4 border-t border-gray-100 shrink-0">
                {confirmDel ? (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs text-red-700 flex-1">Supprimer ce rendez-vous définitivement ?</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setConfirmDel(false)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                        Annuler
                      </button>
                      <button onClick={handleDelete} disabled={deleteAppt.isPending} className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                        {deleteAppt.isPending ? 'Suppression…' : 'Confirmer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button variant="danger" size="sm" onClick={() => setConfirmDel(true)} className="w-full justify-center">
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer ce rendez-vous
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}
