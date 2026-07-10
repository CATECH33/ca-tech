import { useState, useMemo } from 'react'
import {
  Sparkles, Search, X, Globe, ShieldCheck, ShieldOff, Smartphone,
  SmartphoneNfc, FileText, FileX, MapPin, MapPinOff, RefreshCw,
  ChevronRight, Wand2, AlertCircle, Building2, ExternalLink,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn, formatDate } from '@/lib/utils'
import {
  useProspects, useQualifyProspect, getQualification, computeQualScore,
  autoQualifyProspect,
  type ProspectRow, type ProspectQualification, type QualCriterion, type QualSource,
} from '@/hooks/useProspects'

/* ─── CONSTANTES ──────────────────────────────────────────────────────────── */

type FilterTab = 'all' | 'pending' | 'qualified'

const CRITERIA_CONFIG = [
  {
    key: 'has_https' as const,
    label: 'HTTPS',
    weight: 2.0,
    iconTrue:  ShieldCheck,
    iconFalse: ShieldOff,
    colorTrue:  'text-emerald-600 bg-emerald-50',
    colorFalse: 'text-red-500 bg-red-50',
  },
  {
    key: 'is_responsive' as const,
    label: 'Responsive',
    weight: 2.5,
    iconTrue:  SmartphoneNfc,
    iconFalse: Smartphone,
    colorTrue:  'text-emerald-600 bg-emerald-50',
    colorFalse: 'text-red-500 bg-red-50',
  },
  {
    key: 'has_form' as const,
    label: 'Formulaire',
    weight: 1.5,
    iconTrue:  FileText,
    iconFalse: FileX,
    colorTrue:  'text-emerald-600 bg-emerald-50',
    colorFalse: 'text-red-500 bg-red-50',
  },
  {
    key: 'has_google_business' as const,
    label: 'Google Business',
    weight: 2.0,
    iconTrue:  MapPin,
    iconFalse: MapPinOff,
    colorTrue:  'text-emerald-600 bg-emerald-50',
    colorFalse: 'text-red-500 bg-red-50',
  },
] as const

type CriteriaKey = typeof CRITERIA_CONFIG[number]['key']

const EMPTY_QUAL: Omit<ProspectQualification, 'score' | 'qualified_at' | 'qualified_by'> = {
  version: 1,
  website_url: '',
  has_https:           { value: null, source: 'manual' },
  is_responsive:       { value: null, source: 'manual' },
  has_form:            { value: null, source: 'manual' },
  has_google_business: { value: null, source: 'manual' },
  ai_comment: '',
  commercial_opportunity: '',
}

/* ─── STAR RATING ─────────────────────────────────────────────────────────── */

function StarRating({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const rounded = Math.round(score * 2) / 2
  const full  = Math.floor(rounded / 2)
  const half  = rounded % 2 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  const starSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'
  const numSize  = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex leading-none">
        {Array.from({ length: full },  (_, i) => <span key={`f${i}`} className={cn(starSize, 'text-amber-400')}>★</span>)}
        {half === 1 && <span className={cn(starSize, 'text-amber-200')}>★</span>}
        {Array.from({ length: empty }, (_, i) => <span key={`e${i}`} className={cn(starSize, 'text-gray-200')}>★</span>)}
      </div>
      <span className={cn(numSize, 'font-bold text-gray-800')}>
        {score.toFixed(1)}<span className="text-gray-400 font-normal text-[0.75em]">/10</span>
      </span>
    </div>
  )
}

/* ─── CRITERION BADGE (compact, pour la carte) ────────────────────────────── */

function CriterionBadge({
  value, source, label, iconTrue: IconTrue, iconFalse: IconFalse, colorTrue, colorFalse,
}: {
  value: boolean | null
  source: QualSource
  label: string
  iconTrue: React.ElementType
  iconFalse: React.ElementType
  colorTrue: string
  colorFalse: string
}) {
  const isAuto = source === 'auto'
  if (value === null) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
        <span className="text-gray-300">?</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    )
  }
  const Icon  = value ? IconTrue : IconFalse
  const color = value ? colorTrue : colorFalse
  return (
    <span className={cn(
      'flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md border',
      color,
      value ? 'border-emerald-200' : 'border-red-200',
    )}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      {isAuto && <Sparkles className="h-2.5 w-2.5 opacity-60 shrink-0" />}
    </span>
  )
}

/* ─── TRI-TOGGLE ──────────────────────────────────────────────────────────── */

function TriToggle({
  label, value, source, onChange,
}: {
  label: string
  value: boolean | null
  source: QualSource
  onChange: (v: boolean | null) => void
}) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }
  return (
    <button
      type="button"
      onClick={cycle}
      className="flex items-center gap-3 w-full group py-2 px-3 rounded-xl hover:bg-gray-50 transition"
    >
      <div className={cn(
        'h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold transition shrink-0',
        value === true  ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-300' :
        value === false ? 'bg-red-100 text-red-500 ring-2 ring-red-200' :
                          'bg-gray-100 text-gray-400',
      )}>
        {value === true ? '✓' : value === false ? '✗' : '?'}
      </div>
      <div className="flex-1 text-left">
        <p className={cn('text-sm font-medium', value === null ? 'text-gray-400' : 'text-gray-800')}>
          {label}
        </p>
        {source === 'auto' && (
          <p className="text-[10px] text-brand-500 flex items-center gap-0.5">
            <Sparkles className="h-2.5 w-2.5" /> Auto-qualifié
          </p>
        )}
      </div>
      <span className={cn(
        'text-xs font-semibold px-2 py-0.5 rounded-full',
        value === true  ? 'bg-emerald-100 text-emerald-700' :
        value === false ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-400',
      )}>
        {value === true ? 'Oui' : value === false ? 'Non' : 'Inconnu'}
      </span>
    </button>
  )
}

/* ─── QUALIFICATION CARD ──────────────────────────────────────────────────── */

function QualificationCard({
  prospect, onEdit,
}: {
  prospect: ProspectRow
  onEdit: () => void
}) {
  const qual = getQualification(prospect)
  const isQualified = qual !== null

  return (
    <Card className={cn('transition-all hover:shadow-md', isQualified && 'border-l-2 border-l-brand-400')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-brand-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{prospect.company_name}</p>
            {prospect.industry && <p className="text-[11px] text-gray-400 truncate">{prospect.industry}</p>}
          </div>
        </div>
        {isQualified
          ? <StarRating score={qual.score} size="sm" />
          : <Badge label="À qualifier" className="text-[10px] bg-gray-50 text-gray-400 border-gray-200" />
        }
      </div>

      {/* Website */}
      <div className="flex items-center gap-1.5 mb-3">
        <Globe className="h-3.5 w-3.5 text-gray-300 shrink-0" />
        {qual?.website_url || prospect.website
          ? <a
              href={qual?.website_url || prospect.website}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs text-brand-600 hover:underline truncate flex items-center gap-1"
            >
              {(qual?.website_url || prospect.website || '').replace(/^https?:\/\//, '')}
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
            </a>
          : <span className="text-xs text-gray-300">Aucun site renseigné</span>
        }
      </div>

      {/* Criteria badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CRITERIA_CONFIG.map(c => {
          const crit = qual?.[c.key] ?? { value: null, source: 'manual' as QualSource }
          return (
            <CriterionBadge
              key={c.key}
              value={crit.value}
              source={crit.source}
              label={c.label}
              iconTrue={c.iconTrue}
              iconFalse={c.iconFalse}
              colorTrue={c.colorTrue}
              colorFalse={c.colorFalse}
            />
          )
        })}
      </div>

      {/* AI Comment */}
      {qual?.ai_comment && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed italic">
          "{qual.ai_comment}"
        </p>
      )}

      {/* Opportunity */}
      {qual?.commercial_opportunity && (
        <div className="bg-brand-50 border border-brand-100 rounded-lg px-2.5 py-1.5 mb-3">
          <p className="text-[11px] font-semibold text-brand-700 mb-0.5">Opportunité</p>
          <p className="text-xs text-brand-600 line-clamp-2">{qual.commercial_opportunity}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        {qual?.qualified_at
          ? <span className="text-[11px] text-gray-400">
              Qualifié le {formatDate(qual.qualified_at)}
              {qual.qualified_by === 'auto' && (
                <span className="ml-1 text-brand-500 inline-flex items-center gap-0.5">
                  · <Sparkles className="h-2.5 w-2.5" /> IA
                </span>
              )}
            </span>
          : <span className="text-[11px] text-gray-300">Non encore qualifié</span>
        }
        <Button variant="outline" size="sm" onClick={onEdit}>
          {isQualified ? 'Modifier' : 'Qualifier'}
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  )
}

/* ─── QUALIFICATION PANEL ─────────────────────────────────────────────────── */

type PanelForm = {
  website_url: string
  has_https: QualCriterion
  is_responsive: QualCriterion
  has_form: QualCriterion
  has_google_business: QualCriterion
  ai_comment: string
  commercial_opportunity: string
}

function QualificationPanel({
  prospect, onClose, onSave,
}: {
  prospect: ProspectRow
  onClose: () => void
  onSave: (form: PanelForm, qualifiedBy: QualSource) => Promise<void>
}) {
  const existing = getQualification(prospect)
  const [form, setForm] = useState<PanelForm>({
    website_url:           existing?.website_url           ?? prospect.website ?? '',
    has_https:             existing?.has_https             ?? { value: null, source: 'manual' },
    is_responsive:         existing?.is_responsive         ?? { value: null, source: 'manual' },
    has_form:              existing?.has_form              ?? { value: null, source: 'manual' },
    has_google_business:   existing?.has_google_business   ?? { value: null, source: 'manual' },
    ai_comment:            existing?.ai_comment            ?? '',
    commercial_opportunity: existing?.commercial_opportunity ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [autoRunning, setAutoRunning] = useState(false)
  const [autoMsg, setAutoMsg] = useState<string | null>(null)

  const setCrit = (key: CriteriaKey) => (value: boolean | null) =>
    setForm(f => ({ ...f, [key]: { value, source: 'manual' } as QualCriterion }))

  const score = computeQualScore({
    has_https: form.has_https,
    is_responsive: form.is_responsive,
    has_form: form.has_form,
    has_google_business: form.has_google_business,
    commercial_opportunity: form.commercial_opportunity,
  })

  const handleSave = async (by: QualSource = 'manual') => {
    setSaving(true)
    await onSave(form, by)
    setSaving(false)
  }

  const handleAutoQualify = async () => {
    if (!form.website_url) {
      setAutoMsg('Renseignez d\'abord l\'URL du site.')
      return
    }
    setAutoRunning(true)
    setAutoMsg(null)
    try {
      const result = await autoQualifyProspect(form.website_url)
      if (Object.keys(result).length === 0) {
        setAutoMsg('API non connectée — à brancher dans une prochaine étape.')
      } else {
        setForm(f => ({
          ...f,
          has_https:           result.has_https           ?? f.has_https,
          is_responsive:       result.is_responsive       ?? f.is_responsive,
          has_form:            result.has_form            ?? f.has_form,
          has_google_business: result.has_google_business ?? f.has_google_business,
          ai_comment:          result.ai_comment          ?? f.ai_comment,
          commercial_opportunity: result.commercial_opportunity ?? f.commercial_opportunity,
        }))
        setAutoMsg('Qualification automatique réussie.')
      }
    } finally {
      setAutoRunning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white shadow-2xl h-full flex flex-col border-l border-gray-200">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-brand-50 to-violet-50 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" /> Qualification IA
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{prospect.company_name}</h3>
              {prospect.industry && <p className="text-xs text-gray-500">{prospect.industry}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition shrink-0">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Score en temps réel */}
          <div className="bg-white/70 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Score temps réel</p>
              <StarRating score={score} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-1">Pondération</p>
              <div className="space-y-0.5">
                {CRITERIA_CONFIG.map(c => (
                  <div key={c.key} className="flex items-center gap-1.5 justify-end">
                    <span className="text-[10px] text-gray-400">{c.label}</span>
                    <span className="text-[10px] font-semibold text-gray-600">{c.weight} pts</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 justify-end border-t border-gray-100 pt-0.5">
                  <span className="text-[10px] text-gray-400">Opportunité</span>
                  <span className="text-[10px] font-semibold text-gray-600">2.0 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* URL */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Site internet</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={form.website_url}
                  onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                  placeholder="https://exemple.com"
                  className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
                />
              </div>
              {form.website_url && (
                <a href={form.website_url} target="_blank" rel="noopener noreferrer"
                  className="px-2.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Critères */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Critères <span className="text-gray-300 font-normal normal-case">— cliquer pour changer l'état</span>
            </p>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
              {CRITERIA_CONFIG.map(c => (
                <TriToggle
                  key={c.key}
                  label={c.label}
                  value={form[c.key].value}
                  source={form[c.key].source}
                  onChange={setCrit(c.key)}
                />
              ))}
            </div>
          </div>

          {/* Commentaire IA */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-400" /> Commentaire IA
            </p>
            <textarea
              value={form.ai_comment}
              onChange={e => setForm(f => ({ ...f, ai_comment: e.target.value }))}
              rows={4}
              placeholder="Analyse du site, points forts, axes d'amélioration identifiés…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition leading-relaxed"
            />
          </div>

          {/* Opportunité */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Opportunité commerciale <span className="text-brand-400 font-bold">+2.0 pts</span>
            </p>
            <textarea
              value={form.commercial_opportunity}
              onChange={e => setForm(f => ({ ...f, commercial_opportunity: e.target.value }))}
              rows={3}
              placeholder="Refonte site, création e-commerce, SEO, branding…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition leading-relaxed"
            />
          </div>

          {/* Auto-qualify */}
          <div className="bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl p-4 border border-brand-100">
            <div className="flex items-start gap-2.5 mb-3">
              <Wand2 className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Qualification automatique</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Analyse HTTPS, responsive, formulaire et Google Business en un clic.
                  API à connecter dans une prochaine étape.
                </p>
              </div>
            </div>
            {autoMsg && (
              <div className={cn(
                'flex items-start gap-1.5 text-xs mb-3 px-2.5 py-1.5 rounded-lg',
                autoMsg.includes('non connectée') || autoMsg.includes('Renseignez')
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
              )}>
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                {autoMsg}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoQualify}
              disabled={autoRunning}
              className="w-full bg-white"
            >
              <Wand2 className={cn('h-3.5 w-3.5', autoRunning && 'animate-pulse')} />
              {autoRunning ? 'Analyse en cours…' : '🤖 Auto-qualifier ce prospect'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          <Button
            size="sm"
            onClick={() => handleSave('manual')}
            disabled={saving}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer la qualification'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */

export function ProspectionQualification() {
  const [tab, setTab]       = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [panel, setPanel]   = useState<ProspectRow | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const { data: prospects = [], isLoading, refetch, isFetching } = useProspects()
  const qualify = useQualifyProspect()

  /* Filtrage */
  const filtered = useMemo(() => {
    let list = prospects
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.company_name.toLowerCase().includes(q) ||
        (p.industry ?? '').toLowerCase().includes(q) ||
        (p.city ?? '').toLowerCase().includes(q),
      )
    }
    if (tab === 'pending')   list = list.filter(p => !getQualification(p))
    if (tab === 'qualified') list = list.filter(p => !!getQualification(p))
    return list
  }, [prospects, search, tab])

  /* Tri : qualifiés par score desc, non-qualifiés à la fin */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const qa = getQualification(a)
      const qb = getQualification(b)
      if (qa && !qb) return -1
      if (!qa && qb) return 1
      if (qa && qb) return qb.score - qa.score
      return 0
    })
  }, [filtered])

  /* Stats */
  const qualified   = prospects.filter(p => !!getQualification(p))
  const pending     = prospects.filter(p => !getQualification(p))
  const avgScore    = qualified.length
    ? Math.round(qualified.reduce((s, p) => s + (getQualification(p)?.score ?? 0), 0) / qualified.length * 10) / 10
    : 0
  const withOpportunity = qualified.filter(p => getQualification(p)?.commercial_opportunity?.trim()).length

  const handleSave = async (form: PanelForm, qualifiedBy: QualSource) => {
    if (!panel) return
    const score = computeQualScore({
      has_https: form.has_https,
      is_responsive: form.is_responsive,
      has_form: form.has_form,
      has_google_business: form.has_google_business,
      commercial_opportunity: form.commercial_opportunity,
    })
    const qualification: ProspectQualification = {
      version: 1,
      ...form,
      score,
      qualified_at: new Date().toISOString(),
      qualified_by: qualifiedBy,
    }
    await qualify.mutateAsync({ prospect: panel, qualification })
    setPanel(null)
  }

  return (
    <Layout
      title="Qualification IA"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowInfo(true)}>
            <AlertCircle className="h-3.5 w-3.5" /> Pondération
          </Button>
        </div>
      }
    >

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <p className="text-xs text-gray-500 mb-1">Total prospects</p>
          <p className="text-2xl font-bold text-gray-900">{prospects.length}</p>
          <p className="text-xs text-gray-400 mt-1">{pending.length} à qualifier</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Qualifiés</p>
          <p className="text-2xl font-bold text-brand-600">{qualified.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {prospects.length > 0 ? Math.round(qualified.length / prospects.length * 100) : 0}% du total
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Score moyen</p>
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          {avgScore > 0
            ? <StarRating score={avgScore} />
            : <p className="text-sm text-gray-300 mt-1">—</p>}
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Opportunités</p>
          <p className="text-2xl font-bold text-emerald-600">{withOpportunity}</p>
          <p className="text-xs text-gray-400 mt-1">avec opportunité identifiée</p>
        </Card>
      </div>

      {/* ── FILTRES ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {([
            { value: 'all',       label: `Tous (${prospects.length})` },
            { value: 'pending',   label: `À qualifier (${pending.length})` },
            { value: 'qualified', label: `Qualifiés (${qualified.length})` },
          ] as const).map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-md transition',
                tab === t.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t.label}
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
          {sorted.length} prospect{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── GRILLE ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-gray-300 animate-spin" />
            <p className="text-sm text-gray-400">Chargement…</p>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">
              {tab === 'qualified' ? 'Aucun prospect qualifié' : 'Aucun prospect trouvé'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tab === 'pending' ? 'Tous les prospects sont déjà qualifiés 🎉' : 'Ajoutez des prospects depuis la page Prospects'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(p => (
            <QualificationCard
              key={p.id}
              prospect={p}
              onEdit={() => setPanel(p)}
            />
          ))}
        </div>
      )}

      {/* ── PANEL ──────────────────────────────────────────────────────────── */}
      {panel && (
        <QualificationPanel
          prospect={panel}
          onClose={() => setPanel(null)}
          onSave={handleSave}
        />
      )}

      {/* ── MODAL INFO PONDÉRATION ─────────────────────────────────────────── */}
      <Modal
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title="Pondération du score"
        size="sm"
        footer={<Button onClick={() => setShowInfo(false)}>Fermer</Button>}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Le score est calculé automatiquement à partir de 5 critères :</p>
          <div className="space-y-2">
            {[...CRITERIA_CONFIG, { key: 'commercial_opportunity', label: 'Opportunité commerciale', weight: 2.0 } as const].map(c => (
              <div key={c.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{c.label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-brand-100 w-16">
                    <div className="h-1.5 rounded-full bg-brand-400" style={{ width: `${(c.weight / 2.5) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-12 text-right">{c.weight} pts</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-sm font-bold text-brand-600">10.0 pts</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
            <p className="text-xs text-amber-700 font-semibold mb-1 flex items-center gap-1">
              <Wand2 className="h-3 w-3" /> Prochaine étape
            </p>
            <p className="text-xs text-amber-600 leading-relaxed">
              La qualification automatique via API sera connectée dans une prochaine étape.
              Les critères seront détectés automatiquement à partir de l'URL du site.
            </p>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
