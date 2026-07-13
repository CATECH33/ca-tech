import { useState, useCallback } from 'react'
import {
  Globe, ShieldCheck, ShieldOff, Smartphone, SmartphoneNfc,
  FileText, FileX, MapPin, MapPinOff, Mail, MailX,
  Phone, PhoneOff, ExternalLink, Sparkles, Check, X,
  Share2, Wand2, AlertCircle, Save, RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  useAnalyseProspect, computeAnalyseScore, getAnalyse,
  type ProspectRow, type ProspectAnalyse, type QualCriterion, type SocialNetwork,
  SOCIAL_NETWORK_LABELS,
} from '@/hooks/useProspects'

/* ─── Types ──────────────────────────────────────────────────────────────────── */

const NULL_CRIT: QualCriterion = { value: null, source: 'manual' }

const EMPTY_ANALYSE: ProspectAnalyse = {
  version: 1,
  website_url: '',
  has_website:         { ...NULL_CRIT },
  has_https:           { ...NULL_CRIT },
  is_responsive:       { ...NULL_CRIT },
  has_form:            { ...NULL_CRIT },
  has_email:           { ...NULL_CRIT },
  has_phone:           { ...NULL_CRIT },
  has_google_business: { ...NULL_CRIT },
  social_networks: {
    facebook: null, instagram: null, linkedin: null,
    twitter: null, youtube: null, tiktok: null,
  },
  ai_comment: '',
  commercial_opportunity: '',
  score: 0,
  analysed_at: null,
}

/* ─── Score ring ─────────────────────────────────────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, (score / 10) * 100)
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  const color =
    score >= 7 ? '#10b981' :
    score >= 4 ? '#f59e0b' :
    score > 0  ? '#ef4444' : '#e5e7eb'

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="rotate-[-90deg]" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-gray-900 leading-none">{score.toFixed(1)}</span>
        <span className="text-[9px] text-gray-400 leading-none">/10</span>
      </div>
    </div>
  )
}

/* ─── TriToggle (critère booléen) ────────────────────────────────────────────── */

interface TriToggleProps {
  label: string
  value: boolean | null
  iconTrue: React.ElementType
  iconFalse: React.ElementType
  colorTrue?: string
  colorFalse?: string
  onChange: (v: boolean | null) => void
}

function TriToggle({
  label, value, iconTrue: IconT, iconFalse: IconF,
  colorTrue = 'text-emerald-600 bg-emerald-50 border-emerald-200',
  colorFalse = 'text-red-500 bg-red-50 border-red-200',
  onChange,
}: TriToggleProps) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }

  const Icon = value === true ? IconT : value === false ? IconF : Globe
  const colorClass =
    value === true  ? colorTrue :
    value === false ? colorFalse :
    'text-gray-300 bg-gray-50 border-gray-200'

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex items-center gap-3 w-full py-2 px-3 rounded-xl hover:bg-gray-50 active:scale-[.98] transition group text-left"
    >
      <div className={cn(
        'h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 transition',
        colorClass,
      )}>
        {value === null
          ? <span className="text-xs font-bold text-gray-300">?</span>
          : <Icon className="h-3.5 w-3.5" />
        }
      </div>
      <span className={cn(
        'flex-1 text-sm font-medium transition',
        value === null ? 'text-gray-400' : 'text-gray-800',
      )}>
        {label}
      </span>
      <span className={cn(
        'text-[11px] font-semibold px-2 py-0.5 rounded-full transition',
        value === true  ? 'bg-emerald-100 text-emerald-700' :
        value === false ? 'bg-red-100 text-red-500' :
                          'bg-gray-100 text-gray-400',
      )}>
        {value === true ? 'Oui' : value === false ? 'Non' : '—'}
      </span>
    </button>
  )
}

/* ─── SocialToggle ───────────────────────────────────────────────────────────── */

const SOCIAL_ICONS: Record<SocialNetwork, string> = {
  facebook:  'f',
  instagram: '📷',
  linkedin:  'in',
  twitter:   'X',
  youtube:   '▶',
  tiktok:    '♪',
}

function SocialToggle({
  network, value, onChange,
}: {
  network: SocialNetwork
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }
  const label = SOCIAL_NETWORK_LABELS[network]
  const icon  = SOCIAL_ICONS[network]

  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      className={cn(
        'relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition text-center active:scale-[.96]',
        value === true  ? 'bg-emerald-50 border-emerald-200 shadow-sm' :
        value === false ? 'bg-red-50 border-red-200 opacity-60' :
                          'bg-white border-gray-200 hover:border-gray-300',
      )}
    >
      {value !== null && (
        <div className={cn(
          'absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold',
          value ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white',
        )}>
          {value ? '✓' : '✗'}
        </div>
      )}
      <span className="text-sm font-bold text-gray-700 leading-none">{icon}</span>
      <span className="text-[10px] text-gray-500 leading-none whitespace-nowrap">{label.split('/')[0].trim()}</span>
    </button>
  )
}

/* ─── Section wrapper ────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 bg-white">
        {children}
      </div>
    </div>
  )
}

/* ─── ProspectAnalysePanel ───────────────────────────────────────────────────── */

export function ProspectAnalysePanel({ prospect }: { prospect: ProspectRow }) {
  const existing = getAnalyse(prospect)
  const [form, setForm] = useState<ProspectAnalyse>(() => ({
    ...EMPTY_ANALYSE,
    website_url: existing?.website_url ?? prospect.website ?? '',
    ...(existing ?? {}),
  }))
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [autoMsg, setAutoMsg] = useState<string | null>(null)

  const analyse = useAnalyseProspect()

  const setCrit = useCallback((key: keyof Pick<ProspectAnalyse,
    'has_website' | 'has_https' | 'is_responsive' | 'has_form' |
    'has_email' | 'has_phone' | 'has_google_business'
  >) => (value: boolean | null) =>
    setForm(f => ({ ...f, [key]: { value, source: 'manual' as const } }))
  , [])

  const setSocial = useCallback((net: SocialNetwork) => (value: boolean | null) =>
    setForm(f => ({ ...f, social_networks: { ...f.social_networks, [net]: value } }))
  , [])

  const score = computeAnalyseScore(form)

  const handleSave = async () => {
    setSaving(true)
    const payload: ProspectAnalyse = {
      ...form,
      score,
      analysed_at: new Date().toISOString(),
    }
    await analyse.mutateAsync({ prospect, analyse: payload })
    setForm(payload)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setForm({ ...EMPTY_ANALYSE, website_url: prospect.website ?? '' })
    setAutoMsg(null)
  }

  const handleAutoAnalyse = () => {
    setAutoMsg('Analyse automatique non encore connectée — remplissez les critères manuellement.')
  }

  const socialDetected = (Object.entries(form.social_networks) as [SocialNetwork, boolean | null][])
    .filter(([, v]) => v === true).length

  return (
    <div className="flex flex-col h-full">

      {/* ── Header score ──────────────────────────────────────────────── */}
      <div className="px-5 py-4 bg-gradient-to-br from-violet-50 to-brand-50 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score d'analyse</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">
                {score === 0 ? 'Aucun critère renseigné' :
                 score >= 7  ? 'Prospect bien établi en ligne' :
                 score >= 4  ? 'Présence numérique partielle' :
                               'Présence numérique limitée'}
              </span>
              {score > 0 && socialDetected > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">
                  <Share2 className="h-2.5 w-2.5" />{socialDetected} réseau{socialDetected > 1 ? 'x' : ''}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleReset}
            title="Réinitialiser"
            className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-white rounded-lg transition shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* URL */}
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              value={form.website_url}
              onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
              placeholder="https://exemple.com"
              className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition"
            />
          </div>
          {form.website_url && (
            <a
              href={form.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Auto-analyse CTA */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100 rounded-xl">
          <Wand2 className="h-4 w-4 text-brand-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">Analyse automatique</p>
            <p className="text-[11px] text-gray-500">Connecteurs API à venir</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAutoAnalyse} className="bg-white shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            Analyser
          </Button>
        </div>

        {autoMsg && (
          <div className="flex items-start gap-2 text-xs px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {autoMsg}
          </div>
        )}

        {/* Site web */}
        <Section title="Site web">
          <TriToggle
            label="Site web présent"
            value={form.has_website.value}
            iconTrue={Globe} iconFalse={Globe}
            onChange={setCrit('has_website')}
          />
          <TriToggle
            label="HTTPS activé"
            value={form.has_https.value}
            iconTrue={ShieldCheck} iconFalse={ShieldOff}
            onChange={setCrit('has_https')}
          />
          <TriToggle
            label="Design responsive (mobile)"
            value={form.is_responsive.value}
            iconTrue={SmartphoneNfc} iconFalse={Smartphone}
            onChange={setCrit('is_responsive')}
          />
        </Section>

        {/* Contact */}
        <Section title="Contact">
          <TriToggle
            label="Formulaire de contact"
            value={form.has_form.value}
            iconTrue={FileText} iconFalse={FileX}
            onChange={setCrit('has_form')}
          />
          <TriToggle
            label="Email visible"
            value={form.has_email.value}
            iconTrue={Mail} iconFalse={MailX}
            onChange={setCrit('has_email')}
          />
          <TriToggle
            label="Téléphone visible"
            value={form.has_phone.value}
            iconTrue={Phone} iconFalse={PhoneOff}
            onChange={setCrit('has_phone')}
          />
        </Section>

        {/* Présence locale */}
        <Section title="Présence locale">
          <TriToggle
            label="Fiche Google Business"
            value={form.has_google_business.value}
            iconTrue={MapPin} iconFalse={MapPinOff}
            onChange={setCrit('has_google_business')}
          />
        </Section>

        {/* Réseaux sociaux */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Réseaux sociaux</p>
            <span className="text-[11px] text-gray-400">
              {socialDetected > 0
                ? <span className="text-emerald-600 font-semibold">{socialDetected} détecté{socialDetected > 1 ? 's' : ''}</span>
                : 'Cliquer pour renseigner'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(form.social_networks) as SocialNetwork[]).map(net => (
              <SocialToggle
                key={net}
                network={net}
                value={form.social_networks[net]}
                onChange={setSocial(net)}
              />
            ))}
          </div>
        </div>

        {/* Commentaire IA */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-400" />Commentaire IA
          </p>
          <textarea
            value={form.ai_comment}
            onChange={e => setForm(f => ({ ...f, ai_comment: e.target.value }))}
            rows={3}
            placeholder="Analyse du site, points forts, axes d'amélioration…"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition leading-relaxed"
          />
        </div>

        {/* Opportunité */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
            Opportunité commerciale
            <span className="text-brand-500 font-bold normal-case text-[11px]">+1.5 pts</span>
          </p>
          <textarea
            value={form.commercial_opportunity}
            onChange={e => setForm(f => ({ ...f, commercial_opportunity: e.target.value }))}
            rows={2}
            placeholder="Refonte site, e-commerce, SEO, branding…"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition leading-relaxed"
          />
        </div>

        {/* Pondération */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pondération</p>
          <div className="space-y-1">
            {[
              { label: 'Site présent',    pts: 1.0, val: form.has_website.value },
              { label: 'HTTPS',           pts: 1.5, val: form.has_https.value },
              { label: 'Responsive',      pts: 2.0, val: form.is_responsive.value },
              { label: 'Formulaire',      pts: 1.0, val: form.has_form.value },
              { label: 'Email',           pts: 0.5, val: form.has_email.value },
              { label: 'Téléphone',       pts: 0.5, val: form.has_phone.value },
              { label: 'Google Business', pts: 1.5, val: form.has_google_business.value },
              { label: 'Réseaux sociaux', pts: 0.5, val: socialDetected > 0 ? true : socialDetected === 0 ? null : false },
              { label: 'Opportunité',     pts: 1.5, val: form.commercial_opportunity.trim() ? true : null },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span className={cn(
                    'h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold text-[9px]',
                    row.val === true  ? 'bg-emerald-100 text-emerald-600' :
                    row.val === false ? 'bg-red-100 text-red-400' :
                                        'bg-gray-100 text-gray-400',
                  )}>
                    {row.val === true ? '✓' : row.val === false ? '✗' : '?'}
                  </span>
                  {row.label}
                </div>
                <span className={cn('font-semibold', row.val === true ? 'text-emerald-600' : 'text-gray-400')}>
                  {row.val === true ? `+${row.pts}` : `${row.pts} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-gray-100 shrink-0">
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saved
            ? <><Check className="h-3.5 w-3.5" />Enregistré</>
            : saving
            ? 'Enregistrement…'
            : <><Save className="h-3.5 w-3.5" />Enregistrer l'analyse</>
          }
        </Button>
      </div>
    </div>
  )
}
