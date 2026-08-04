import { useState, useEffect } from 'react'
import './CookieBanner.css'

const STORAGE_KEY  = 'ca-tech-cookies-consent'
const CONSENT_DAYS = 180

interface Prefs {
  analytics:       boolean
  personalization: boolean
}

interface Stored {
  v:              number
  ts:             number
  analytics:      boolean
  personalization: boolean
}

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s: Stored = JSON.parse(raw)
    const age = (Date.now() - s.ts) / 86400000
    if (age > CONSENT_DAYS) { localStorage.removeItem(STORAGE_KEY); return null }
    return s
  } catch { return null }
}

function saveConsent(prefs: Prefs) {
  const s: Stored = { v: 1, ts: Date.now(), ...prefs }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

const CATEGORIES = [
  {
    id:       'technical' as const,
    label:    'Cookies techniques',
    desc:     'Indispensables au fonctionnement du site — navigation, session, préférences. Ne peuvent pas être désactivés.',
    required: true,
  },
  {
    id:       'analytics' as const,
    label:    'Cookies analytiques',
    desc:     'Mesure d\'audience anonymisée (Google Analytics 4) pour comprendre comment vous utilisez le site et améliorer nos contenus.',
    required: false,
  },
  {
    id:       'personalization' as const,
    label:    'Cookies de personnalisation',
    desc:     'Mémorisation de vos préférences et personnalisation de certains contenus selon votre parcours.',
    required: false,
  },
]

export default function CookieBanner() {
  const [visible,     setVisible]     = useState(false)
  const [showPrefs,   setShowPrefs]   = useState(false)
  const [prefs,       setPrefs]       = useState<Prefs>({ analytics: false, personalization: false })

  useEffect(() => {
    if (!loadStored()) setVisible(true)
  }, [])

  if (!visible) return null

  const acceptAll = () => {
    saveConsent({ analytics: true, personalization: true })
    setVisible(false)
  }

  const refuseAll = () => {
    saveConsent({ analytics: false, personalization: false })
    setVisible(false)
  }

  const saveCustom = () => {
    saveConsent(prefs)
    setVisible(false)
  }

  const toggle = (key: keyof Prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }))

  return (
    <>
      {/* ── Overlay préférences ── */}
      {showPrefs && (
        <div className="ck-modal-overlay" role="dialog" aria-modal="true" aria-label="Gérer mes préférences cookies" onClick={e => { if (e.target === e.currentTarget) setShowPrefs(false) }}>
          <div className="ck-modal">
            <button className="ck-modal-close" onClick={() => setShowPrefs(false)} aria-label="Fermer">✕</button>
            <p className="ck-modal-title">Gérer mes préférences</p>
            <p className="ck-modal-sub">Activez ou désactivez chaque catégorie. Les cookies techniques sont toujours actifs.</p>

            <div className="ck-cats">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="ck-cat">
                  <div className="ck-cat-header">
                    <div>
                      <p className="ck-cat-label">{cat.label}</p>
                      <p className="ck-cat-desc">{cat.desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={cat.required || prefs[cat.id as keyof Prefs] || false}
                      aria-label={cat.label}
                      className={`ck-toggle ${cat.required || (prefs[cat.id as keyof Prefs] ?? false) ? 'on' : ''} ${cat.required ? 'required' : ''}`}
                      onClick={() => !cat.required && toggle(cat.id as keyof Prefs)}
                      disabled={cat.required}
                    >
                      <span className="ck-toggle-thumb" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ck-modal-actions">
              <button className="ck-btn ck-btn-primary" onClick={saveCustom}>
                Enregistrer mes choix
              </button>
              <button className="ck-btn ck-btn-ghost" onClick={acceptAll}>
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bannière principale ── */}
      <div className="ck-banner" role="region" aria-label="Gestion des cookies">
        <div className="ck-inner">
          <div className="ck-text">
            <p className="ck-title">🍪 Respect de votre vie privée</p>
            <p className="ck-body">
              CA-TECH utilise des cookies pour améliorer votre expérience, mesurer l'audience, personnaliser certains contenus et optimiser nos services. Vous gardez le contrôle de vos choix.
            </p>
          </div>
          <div className="ck-actions">
            <button className="ck-btn ck-btn-primary" onClick={acceptAll}>
              Tout accepter
            </button>
            <button className="ck-btn ck-btn-secondary" onClick={refuseAll}>
              Tout refuser
            </button>
            <button className="ck-btn ck-btn-ghost" onClick={() => setShowPrefs(true)}>
              Personnaliser
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
