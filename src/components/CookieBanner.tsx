import { useState, useEffect } from 'react'
import './CookieBanner.css'

const STORAGE_KEY  = 'ca-tech-cookies-consent'
const CONSENT_DAYS = 180
const SCHEMA_V     = 2

interface Prefs {
  statistics:      boolean
  marketing:       boolean
  personalization: boolean
  functional:      boolean
}

interface Stored extends Prefs {
  v:  number
  ts: number
}

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s: Stored = JSON.parse(raw)
    if ((s.v ?? 0) < SCHEMA_V) { localStorage.removeItem(STORAGE_KEY); return null }
    if ((Date.now() - s.ts) / 86400000 > CONSENT_DAYS) { localStorage.removeItem(STORAGE_KEY); return null }
    return s
  } catch { return null }
}

function saveConsent(prefs: Prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: SCHEMA_V, ts: Date.now(), ...prefs }))
}

const ALL_ON:  Prefs = { statistics: true,  marketing: true,  personalization: true,  functional: true  }
const ALL_OFF: Prefs = { statistics: false, marketing: false, personalization: false, functional: false }

const CATEGORIES = [
  {
    id:        'necessary' as const,
    label:     'Cookies strictement nécessaires',
    desc:      'Indispensables au fonctionnement du site. Ne peuvent pas être désactivés.',
    purpose:   'Navigation, authentification, sécurité de session, mémorisation de vos préférences de cookies.',
    duration:  'Session ou jusqu\'à 1 an',
    providers: ['CA-TECH (interne)'],
    required:  true,
  },
  {
    id:        'statistics' as const,
    label:     'Cookies statistiques',
    desc:      'Mesure d\'audience anonymisée pour comprendre comment le site est utilisé et améliorer nos contenus.',
    purpose:   'Analyser le trafic, identifier les pages populaires, détecter les problèmes techniques.',
    duration:  '13 mois',
    providers: ['Google Analytics 4 (Google LLC)'],
    required:  false,
  },
  {
    id:        'marketing' as const,
    label:     'Cookies marketing',
    desc:      'Suivi publicitaire pour vous proposer des annonces pertinentes sur d\'autres sites.',
    purpose:   'Mesurer l\'efficacité des campagnes, cibler des audiences similaires.',
    duration:  '13 mois',
    providers: ['Google Ads (Google LLC)', 'Meta Pixel (Meta Platforms Inc.)'],
    required:  false,
  },
  {
    id:        'personalization' as const,
    label:     'Cookies de personnalisation',
    desc:      'Mémorisation de vos préférences et adaptation des contenus selon votre parcours.',
    purpose:   'Afficher un contenu adapté à vos intérêts, mémoriser vos choix de navigation.',
    duration:  '6 mois',
    providers: ['CA-TECH (interne)'],
    required:  false,
  },
  {
    id:        'functional' as const,
    label:     'Cookies fonctionnels',
    desc:      'Fonctionnalités enrichies : vidéos intégrées, chat, partage sur les réseaux sociaux.',
    purpose:   'Activer les fonctionnalités interactives optionnelles du site.',
    duration:  '12 mois',
    providers: ['YouTube (Google LLC)', 'LinkedIn (LinkedIn Corporation)'],
    required:  false,
  },
]

export default function CookieBanner() {
  const [visible,   setVisible]   = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [prefs,     setPrefs]     = useState<Prefs>(ALL_OFF)

  useEffect(() => {
    const stored = loadStored()
    if (!stored) {
      setVisible(true)
    } else {
      setPrefs({ statistics: stored.statistics, marketing: stored.marketing, personalization: stored.personalization, functional: stored.functional })
    }
  }, [])

  useEffect(() => {
    const handler = () => setShowPrefs(true)
    window.addEventListener('ca-tech:open-cookie-prefs', handler)
    return () => window.removeEventListener('ca-tech:open-cookie-prefs', handler)
  }, [])

  const acceptAll = () => { setPrefs(ALL_ON);  saveConsent(ALL_ON);  setVisible(false); setShowPrefs(false) }
  const refuseAll = () => { setPrefs(ALL_OFF); saveConsent(ALL_OFF); setVisible(false); setShowPrefs(false) }
  const saveCustom = () => { saveConsent(prefs); setVisible(false); setShowPrefs(false) }

  const toggle = (key: keyof Prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }))
  const toggleExpand = (id: string) => setExpanded(e => e === id ? null : id)

  return (
    <>
      {/* ── Modal préférences ── */}
      {showPrefs && (
        <div
          className="ck-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Gérer mes préférences cookies"
          onClick={e => { if (e.target === e.currentTarget) setShowPrefs(false) }}
        >
          <div className="ck-modal">
            <button className="ck-modal-close" onClick={() => setShowPrefs(false)} aria-label="Fermer">✕</button>
            <p className="ck-modal-title">Gérer mes préférences</p>
            <p className="ck-modal-sub">Activez ou désactivez chaque catégorie. Les cookies strictement nécessaires sont toujours actifs.</p>

            <div className="ck-cats">
              {CATEGORIES.map(cat => {
                const isOn  = cat.required || prefs[cat.id as keyof Prefs] || false
                const open  = expanded === cat.id
                return (
                  <div key={cat.id} className={`ck-cat${open ? ' ck-cat--open' : ''}`}>
                    <div className="ck-cat-header">
                      <div className="ck-cat-info">
                        <p className="ck-cat-label">{cat.label}</p>
                        <p className="ck-cat-desc">{cat.desc}</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={isOn}
                        aria-label={cat.label}
                        className={`ck-toggle${isOn ? ' on' : ''}${cat.required ? ' required' : ''}`}
                        onClick={() => !cat.required && toggle(cat.id as keyof Prefs)}
                        disabled={cat.required}
                      >
                        <span className="ck-toggle-thumb" />
                      </button>
                    </div>

                    <button className="ck-cat-expand-btn" onClick={() => toggleExpand(cat.id)} aria-expanded={open}>
                      {open ? 'Masquer les détails ▲' : 'Voir les détails ▼'}
                    </button>

                    {open && (
                      <div className="ck-cat-details">
                        <div className="ck-detail-row">
                          <span className="ck-detail-key">Finalité</span>
                          <span className="ck-detail-val">{cat.purpose}</span>
                        </div>
                        <div className="ck-detail-row">
                          <span className="ck-detail-key">Durée</span>
                          <span className="ck-detail-val">{cat.duration}</span>
                        </div>
                        <div className="ck-detail-row">
                          <span className="ck-detail-key">Fournisseurs</span>
                          <span className="ck-detail-val">{cat.providers.join(' · ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="ck-modal-actions">
              <button className="ck-btn ck-btn-primary" onClick={saveCustom}>Enregistrer mes préférences</button>
              <button className="ck-btn ck-btn-secondary" onClick={refuseAll}>Tout refuser</button>
              <button className="ck-btn ck-btn-ghost" onClick={acceptAll}>Tout accepter</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bannière principale ── */}
      {visible && (
        <div className="ck-banner" role="region" aria-label="Gestion des cookies">
          <div className="ck-inner">
            <div className="ck-text">
              <p className="ck-title">🍪 Respect de votre vie privée</p>
              <p className="ck-body">
                CA-TECH utilise des cookies pour améliorer votre expérience, mesurer l'audience,
                personnaliser certains contenus et optimiser nos services. Vous gardez le contrôle de vos choix.
              </p>
            </div>
            <div className="ck-actions">
              <button className="ck-btn ck-btn-primary"   onClick={acceptAll}>Tout accepter</button>
              <button className="ck-btn ck-btn-secondary" onClick={refuseAll}>Tout refuser</button>
              <button className="ck-btn ck-btn-ghost"     onClick={() => setShowPrefs(true)}>Personnaliser</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bouton flottant modifier préférences (après consentement) ── */}
      {!visible && (
        <button
          className="ck-float-btn"
          onClick={() => setShowPrefs(true)}
          aria-label="Gérer mes préférences cookies"
          title="Gérer mes cookies"
        >
          🍪
        </button>
      )}
    </>
  )
}
