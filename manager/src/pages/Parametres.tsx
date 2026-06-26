import { useState } from 'react'
import {
  User, Building2, Receipt, Bell, Palette, Shield,
  Check, Eye, EyeOff, AlertTriangle, CreditCard,
  Clock, Monitor, Smartphone, LogOut,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// ─── Types & storage ──────────────────────────────────────────────────────────

interface Settings {
  profil: {
    prenom: string; nom: string; email: string; telephone: string; poste: string
  }
  agence: {
    nom: string; email: string; telephone: string; site_web: string
    siret: string; tva_intra: string
    adresse: string; ville: string; code_postal: string; pays: string
  }
  facturation: {
    prefixe_devis: string; prefixe_facture: string
    tva_defaut: string; delai_paiement: string
    iban: string; bic: string
    conditions: string; mentions_legales: string
  }
  notifications: {
    facture_payee: boolean; facture_retard: boolean; nouveau_lead: boolean
    devis_accepte: boolean; devis_refuse: boolean; devis_expire: boolean
    projet_retard: boolean; tache_urgente: boolean; nouveau_message: boolean
  }
  apparence: {
    langue: string; format_date: string; fuseau_horaire: string; monnaie: string
  }
}

type Tab = 'profil' | 'agence' | 'facturation' | 'notifications' | 'apparence' | 'securite'
type NotifKey = keyof Settings['notifications']

const STORAGE_KEY = 'catech_settings'

const DEFAULT: Settings = {
  profil: {
    prenom: 'Jean', nom: 'Dupont', email: 'admin@ca-tech.fr',
    telephone: '+33 7 75 66 49 75', poste: 'Administrateur',
  },
  agence: {
    nom: 'CA-TECH', email: 'contact@ca-tech.fr', telephone: '+33 7 75 66 49 75',
    site_web: 'https://ca-tech.fr', siret: '', tva_intra: '',
    adresse: '', ville: 'Paris', code_postal: '75001', pays: 'France',
  },
  facturation: {
    prefixe_devis: 'DEV', prefixe_facture: 'FAC',
    tva_defaut: '20', delai_paiement: '30',
    iban: '', bic: '',
    conditions: 'Paiement à réception de facture.',
    mentions_legales: '',
  },
  notifications: {
    facture_payee: true, facture_retard: true, nouveau_lead: true,
    devis_accepte: true, devis_refuse: true, devis_expire: true,
    projet_retard: false, tache_urgente: true, nouveau_message: true,
  },
  apparence: {
    langue: 'fr', format_date: 'dd/MM/yyyy',
    fuseau_horaire: 'Europe/Paris', monnaie: 'EUR',
  },
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const p = JSON.parse(raw)
    return {
      profil:         { ...DEFAULT.profil,         ...p.profil },
      agence:         { ...DEFAULT.agence,         ...p.agence },
      facturation:    { ...DEFAULT.facturation,    ...p.facturation },
      notifications:  { ...DEFAULT.notifications,  ...p.notifications },
      apparence:      { ...DEFAULT.apparence,      ...p.apparence },
    }
  } catch {
    return DEFAULT
  }
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profil',         label: 'Profil',        icon: User },
  { id: 'agence',         label: 'Agence',         icon: Building2 },
  { id: 'facturation',    label: 'Facturation',    icon: Receipt },
  { id: 'notifications',  label: 'Notifications',  icon: Bell },
  { id: 'apparence',      label: 'Apparence',      icon: Palette },
  { id: 'securite',       label: 'Sécurité',       icon: Shield },
]

const NOTIF_ITEMS: { key: NotifKey; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: 'facture_payee',   label: 'Facture payée',       desc: 'Quand un paiement est reçu',                    icon: CreditCard,   color: 'text-emerald-500' },
  { key: 'facture_retard',  label: 'Facture en retard',   desc: "Quand une facture dépasse son échéance",         icon: AlertTriangle, color: 'text-red-500' },
  { key: 'nouveau_lead',    label: 'Nouveau lead',        desc: 'Quand un prospect entre dans le pipeline',       icon: User,          color: 'text-blue-500' },
  { key: 'devis_accepte',   label: 'Devis accepté',       desc: 'Quand un client accepte un devis',               icon: Check,         color: 'text-emerald-500' },
  { key: 'devis_refuse',    label: 'Devis refusé',        desc: 'Quand un client refuse un devis',                icon: AlertTriangle, color: 'text-red-500' },
  { key: 'devis_expire',    label: 'Devis expirant',      desc: 'Devis expirant dans moins de 7 jours',           icon: Clock,         color: 'text-amber-500' },
  { key: 'projet_retard',   label: 'Projet en retard',    desc: "Quand un projet dépasse sa date de livraison",   icon: Clock,         color: 'text-orange-500' },
  { key: 'tache_urgente',   label: 'Tâche urgente',       desc: 'Quand une tâche urgente est assignée',           icon: AlertTriangle, color: 'text-red-500' },
  { key: 'nouveau_message', label: 'Nouveau message',     desc: 'Quand un message est reçu',                      icon: Bell,          color: 'text-blue-500' },
]

const MOCK_SESSIONS = [
  { id: '1', device: 'Chrome · Windows 11',  icon: Monitor,    location: 'Paris, France', last_seen: 'Maintenant',     current: true },
  { id: '2', device: 'Safari · iPhone 15',   icon: Smartphone, location: 'Paris, France', last_seen: 'Il y a 2 heures', current: false },
]

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
        checked ? 'bg-brand-500' : 'bg-gray-200'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  )
}

// ─── Saved badge ──────────────────────────────────────────────────────────────

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
      <Check className="h-3.5 w-3.5" /> Sauvegardé
    </span>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5 pb-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Parametres() {
  const [tab, setTab] = useState<Tab>('profil')
  const [settings, setSettings] = useState(loadSettings)
  const [saved, setSaved] = useState<Tab | null>(null)

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  function patch<K extends keyof Settings>(section: K, vals: Partial<Settings[K]>) {
    setSettings(s => ({ ...s, [section]: { ...s[section], ...vals } }))
  }

  function save(section: Tab) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(section)
    setTimeout(() => setSaved(null), 3000)
  }

  async function handlePwChange() {
    setPwError('')
    if (!pw.next) { setPwError('Entrez un nouveau mot de passe.'); return }
    if (pw.next.length < 8) { setPwError('8 caractères minimum.'); return }
    if (pw.next !== pw.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pw.next })
    setPwLoading(false)
    if (error) { setPwError(error.message); return }
    setPw({ current: '', next: '', confirm: '' })
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 3000)
  }

  const p = settings.profil
  const ag = settings.agence
  const fac = settings.facturation
  const notif = settings.notifications
  const app = settings.apparence

  return (
    <Layout title="Paramètres">
      <div className="max-w-5xl flex gap-6">

        {/* ── Left nav ── */}
        <aside className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(t => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                    active ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand-500' : 'text-gray-400')} />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* PROFIL */}
          {tab === 'profil' && (
            <Card>
              <SectionHeader title="Profil utilisateur" desc="Vos informations personnelles et de contact" />
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                <Avatar nom={p.nom} prenom={p.prenom} size="xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.prenom} {p.nom}</p>
                  <p className="text-xs text-gray-500">{p.email} · {p.poste}</p>
                  <Button variant="outline" size="sm" className="mt-2">Changer l'avatar</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" value={p.prenom} onChange={e => patch('profil', { prenom: e.target.value })} />
                <Input label="Nom" value={p.nom} onChange={e => patch('profil', { nom: e.target.value })} />
                <Input label="Email" type="email" value={p.email} onChange={e => patch('profil', { email: e.target.value })} className="col-span-2" />
                <Input label="Téléphone" value={p.telephone} onChange={e => patch('profil', { telephone: e.target.value })} />
                <Input label="Poste / Rôle" value={p.poste} onChange={e => patch('profil', { poste: e.target.value })} />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <SavedBadge show={saved === 'profil'} />
                <Button onClick={() => save('profil')}>Sauvegarder</Button>
              </div>
            </Card>
          )}

          {/* AGENCE */}
          {tab === 'agence' && (
            <Card>
              <SectionHeader title="Informations agence" desc="Ces informations apparaissent sur vos devis et factures" />
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-2">Logo</p>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {ag.nom.charAt(0)}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Téléverser un logo</Button>
                    <p className="text-xs text-gray-400 mt-1">PNG ou SVG · max 2 Mo</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nom de l'agence" value={ag.nom} onChange={e => patch('agence', { nom: e.target.value })} className="col-span-2" />
                <Input label="Email contact" type="email" value={ag.email} onChange={e => patch('agence', { email: e.target.value })} />
                <Input label="Téléphone" value={ag.telephone} onChange={e => patch('agence', { telephone: e.target.value })} />
                <Input label="Site web" type="url" value={ag.site_web} onChange={e => patch('agence', { site_web: e.target.value })} className="col-span-2" placeholder="https://" />
                <Input label="SIRET" value={ag.siret} onChange={e => patch('agence', { siret: e.target.value })} placeholder="XXX XXX XXX XXXXX" />
                <Input label="N° TVA intracommunautaire" value={ag.tva_intra} onChange={e => patch('agence', { tva_intra: e.target.value })} placeholder="FR XX XXX XXX XXX" />
                <Input label="Adresse" value={ag.adresse} onChange={e => patch('agence', { adresse: e.target.value })} className="col-span-2" />
                <Input label="Ville" value={ag.ville} onChange={e => patch('agence', { ville: e.target.value })} />
                <Input label="Code postal" value={ag.code_postal} onChange={e => patch('agence', { code_postal: e.target.value })} />
                <Input label="Pays" value={ag.pays} onChange={e => patch('agence', { pays: e.target.value })} />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <SavedBadge show={saved === 'agence'} />
                <Button onClick={() => save('agence')}>Sauvegarder</Button>
              </div>
            </Card>
          )}

          {/* FACTURATION */}
          {tab === 'facturation' && (
            <Card>
              <SectionHeader title="Facturation & Comptabilité" desc="Paramètres par défaut pour les devis et factures générés" />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Préfixe devis"
                  value={fac.prefixe_devis}
                  onChange={e => patch('facturation', { prefixe_devis: e.target.value })}
                  hint="Ex : DEV → DEV-0001"
                />
                <Input
                  label="Préfixe facture"
                  value={fac.prefixe_facture}
                  onChange={e => patch('facturation', { prefixe_facture: e.target.value })}
                  hint="Ex : FAC → FAC-0001"
                />
                <Input
                  label="TVA par défaut (%)"
                  type="number"
                  value={fac.tva_defaut}
                  onChange={e => patch('facturation', { tva_defaut: e.target.value })}
                  min="0" max="100"
                />
                <Input
                  label="Délai de paiement (jours)"
                  type="number"
                  value={fac.delai_paiement}
                  onChange={e => patch('facturation', { delai_paiement: e.target.value })}
                  min="0"
                />
                <Input
                  label="IBAN"
                  value={fac.iban}
                  onChange={e => patch('facturation', { iban: e.target.value })}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  className="col-span-2"
                />
                <Input
                  label="BIC / SWIFT"
                  value={fac.bic}
                  onChange={e => patch('facturation', { bic: e.target.value })}
                  placeholder="BNPAFRPP"
                />
              </div>
              <div className="mt-3 space-y-3">
                <Textarea
                  label="Conditions de paiement"
                  value={fac.conditions}
                  onChange={e => patch('facturation', { conditions: e.target.value })}
                  rows={3}
                />
                <Textarea
                  label="Mentions légales"
                  value={fac.mentions_legales}
                  onChange={e => patch('facturation', { mentions_legales: e.target.value })}
                  placeholder="Ex : TVA non applicable, art. 293 B du CGI."
                  rows={3}
                />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <SavedBadge show={saved === 'facturation'} />
                <Button onClick={() => save('facturation')}>Sauvegarder</Button>
              </div>
            </Card>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <Card>
              <SectionHeader
                title="Notifications"
                desc="Choisissez les événements pour lesquels vous souhaitez être notifié"
              />
              <div className="space-y-1">
                {NOTIF_ITEMS.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          <Icon className={cn('h-3.5 w-3.5', item.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={notif[item.key]}
                        onChange={v => patch('notifications', { [item.key]: v } as Partial<Settings['notifications']>)}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <SavedBadge show={saved === 'notifications'} />
                <Button onClick={() => save('notifications')}>Sauvegarder</Button>
              </div>
            </Card>
          )}

          {/* APPARENCE */}
          {tab === 'apparence' && (
            <Card>
              <SectionHeader title="Apparence & Localisation" desc="Personnalisez l'interface selon vos préférences régionales" />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Langue"
                  value={app.langue}
                  onChange={e => patch('apparence', { langue: e.target.value })}
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                  ]}
                />
                <Select
                  label="Format de date"
                  value={app.format_date}
                  onChange={e => patch('apparence', { format_date: e.target.value })}
                  options={[
                    { value: 'dd/MM/yyyy', label: 'JJ/MM/AAAA (23/06/2026)' },
                    { value: 'MM/dd/yyyy', label: 'MM/JJ/AAAA (06/23/2026)' },
                    { value: 'yyyy-MM-dd', label: 'AAAA-MM-JJ (2026-06-23)' },
                  ]}
                />
                <Select
                  label="Fuseau horaire"
                  value={app.fuseau_horaire}
                  onChange={e => patch('apparence', { fuseau_horaire: e.target.value })}
                  options={[
                    { value: 'Europe/Paris',        label: 'Paris (UTC+1/+2)' },
                    { value: 'Europe/London',       label: 'Londres (UTC+0/+1)' },
                    { value: 'Africa/Casablanca',   label: 'Casablanca (UTC+1)' },
                    { value: 'America/New_York',    label: 'New York (UTC-5/-4)' },
                    { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
                  ]}
                />
                <Select
                  label="Monnaie"
                  value={app.monnaie}
                  onChange={e => patch('apparence', { monnaie: e.target.value })}
                  options={[
                    { value: 'EUR', label: 'EUR — Euro (€)' },
                    { value: 'USD', label: 'USD — Dollar ($)' },
                    { value: 'GBP', label: 'GBP — Livre sterling (£)' },
                    { value: 'CHF', label: 'CHF — Franc suisse (Fr)' },
                    { value: 'MAD', label: 'MAD — Dirham marocain (د.م.)' },
                  ]}
                />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <SavedBadge show={saved === 'apparence'} />
                <Button onClick={() => save('apparence')}>Sauvegarder</Button>
              </div>
            </Card>
          )}

          {/* SÉCURITÉ */}
          {tab === 'securite' && (
            <>
              {/* Password */}
              <Card>
                <SectionHeader title="Mot de passe" desc="Choisissez un mot de passe fort d'au moins 8 caractères" />
                <div className="space-y-3 max-w-sm">
                  <Input
                    label="Mot de passe actuel"
                    type={showPw ? 'text' : 'password'}
                    value={pw.current}
                    onChange={e => setPw(f => ({ ...f, current: e.target.value }))}
                    placeholder="••••••••"
                    trailing={
                      <button type="button" onClick={() => setShowPw(v => !v)}>
                        {showPw
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />
                        }
                      </button>
                    }
                  />
                  <Input
                    label="Nouveau mot de passe"
                    type={showPw ? 'text' : 'password'}
                    value={pw.next}
                    onChange={e => setPw(f => ({ ...f, next: e.target.value }))}
                    placeholder="••••••••"
                    hint="8 caractères minimum"
                  />
                  <Input
                    label="Confirmer le mot de passe"
                    type={showPw ? 'text' : 'password'}
                    value={pw.confirm}
                    onChange={e => setPw(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="••••••••"
                    error={pwError}
                  />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button onClick={handlePwChange} loading={pwLoading}>
                    Changer le mot de passe
                  </Button>
                  {pwSaved && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <Check className="h-3.5 w-3.5" /> Mot de passe mis à jour
                    </span>
                  )}
                </div>
              </Card>

              {/* Sessions */}
              <Card>
                <SectionHeader title="Sessions actives" desc="Appareils actuellement connectés à votre compte" />
                <div className="divide-y divide-gray-50">
                  {MOCK_SESSIONS.map(session => {
                    const Icon = session.icon
                    return (
                      <div key={session.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {session.device}
                              {session.current && (
                                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full leading-none">
                                  Session actuelle
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{session.location} · {session.last_seen}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5">
                            <LogOut className="h-3.5 w-3.5" />
                            Révoquer
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Danger zone */}
              <Card className="border-red-100">
                <SectionHeader title="Zone dangereuse" desc="Ces actions sont irréversibles. Procédez avec précaution." />
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Réinitialiser les paramètres</p>
                      <p className="text-xs text-gray-500 mt-0.5">Restaure tous les paramètres à leurs valeurs par défaut</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        localStorage.removeItem(STORAGE_KEY)
                        setSettings(DEFAULT)
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                  <div className="flex items-start justify-between gap-4 pt-4 border-t border-red-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Supprimer le compte</p>
                      <p className="text-xs text-gray-500 mt-0.5">Suppression définitive et irréversible de toutes les données</p>
                    </div>
                    <Button variant="danger" size="sm" className="shrink-0">
                      Supprimer le compte
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

        </div>
      </div>
    </Layout>
  )
}
