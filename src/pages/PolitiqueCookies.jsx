import { useState, useEffect, useCallback } from 'react'
import './PolitiqueCookies.css'

const CATEGORIES = {
  analytics: {
    label: 'Analytique',
    icon: '📊',
    description: "Nous aident à comprendre comment les visiteurs utilisent le site (pages vues, durée, provenance) afin d'améliorer l'expérience.",
  },
  advertising: {
    label: 'Marketing',
    icon: '📢',
    description: "Utilisés pour mesurer l'efficacité de nos campagnes publicitaires et vous proposer des contenus personnalisés sur d'autres sites.",
  },
  functional: {
    label: 'Fonctionnel',
    icon: '⚙️',
    description: "Nécessaires au bon fonctionnement de certaines fonctionnalités (paiement sécurisé, vidéos, cartes interactives).",
  },
}

export default function PolitiqueCookies() {
  const [registry, setRegistry] = useState({})
  const [choices, setChoices] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const r = window.CATechConsent?.getRegistry() || {}
    const c = window.CATechConsent?.getChoices() || {}
    setRegistry(r)
    setChoices(c)
  }, [])

  const flash = useCallback(() => {
    setSaving(true)
    setTimeout(() => { setSaving(false); setSaved(true) }, 400)
    setTimeout(() => setSaved(false), 3000)
  }, [])

  function toggle(vendor) {
    setChoices(prev => ({ ...prev, [vendor]: !prev[vendor] }))
    setSaved(false)
  }

  function acceptAll() {
    const all = {}
    Object.keys(registry).forEach(k => { all[k] = true })
    setChoices(all)
    window.CATechConsent?.acceptAll()
    flash()
  }

  function refuseAll() {
    const none = {}
    Object.keys(registry).forEach(k => { none[k] = false })
    setChoices(none)
    window.CATechConsent?.refuseAll()
    flash()
  }

  function save() {
    window.CATechConsent?.saveChoices(choices)
    flash()
  }

  // Regrouper par catégorie dans l'ordre souhaité
  const order = ['analytics', 'advertising', 'functional']
  const groups = {}
  order.forEach(cat => { groups[cat] = [] })
  Object.entries(registry).forEach(([vendor, svc]) => {
    const cat = svc.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push({ vendor, ...svc })
  })

  const hasChoices = Object.keys(registry).length > 0

  return (
    <main className="pc-page">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pc-hero">
        <div className="pc-hero-inner">
          <div className="pc-hero-badge">Vie privée</div>
          <h1 className="pc-hero-title">Centre de préférences</h1>
          <p className="pc-hero-desc">
            Contrôlez précisément les technologies de suivi utilisées sur&nbsp;
            <strong>ca-tech.fr</strong>. Vos choix sont enregistrés et appliqués
            immédiatement.
          </p>
          <div className="pc-actions">
            <button className="pc-btn pc-btn-primary" onClick={acceptAll}>
              Tout accepter
            </button>
            <button className="pc-btn pc-btn-secondary" onClick={refuseAll}>
              Tout refuser
            </button>
            <button
              className="pc-btn pc-btn-ghost"
              onClick={() => window.CATechConsent?.openPreferences()}
            >
              Ouvrir le panneau Axeptio
            </button>
          </div>
        </div>
      </section>

      {/* ── Intro RGPD ───────────────────────────────────────────── */}
      <section className="pc-intro">
        <div className="pc-intro-inner">
          <h2>Qu'est-ce qu'un cookie&nbsp;?</h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre appareil lors de la
            visite d'un site web. Certains sont indispensables au fonctionnement du
            site&nbsp;; d'autres sont utilisés à des fins analytiques ou publicitaires
            et nécessitent votre consentement conformément au&nbsp;
            <strong>RGPD</strong> et aux recommandations de la&nbsp;
            <strong>CNIL</strong>.
          </p>
          <p>
            Vous pouvez modifier vos préférences à tout moment depuis cette page, le
            footer du site, ou notre{' '}
            <a href="/politique-de-confidentialite">politique de confidentialité</a>.
          </p>
        </div>
      </section>

      {/* ── Services par catégorie ───────────────────────────────── */}
      {order.map(cat => {
        const services = groups[cat]
        if (!services || services.length === 0) return null
        const meta = CATEGORIES[cat]
        return (
          <section key={cat} className="pc-category">
            <div className="pc-category-inner">
              <header className="pc-category-header">
                <span className="pc-category-icon">{meta.icon}</span>
                <div>
                  <h2 className="pc-category-title">{meta.label}</h2>
                  <p className="pc-category-desc">{meta.description}</p>
                </div>
              </header>

              <div className="pc-services">
                {services.map(({ vendor, label, purpose, retention, partner, active }) => {
                  const isOn = !!choices[vendor]
                  return (
                    <div key={vendor} className={`pc-service ${isOn ? 'pc-service--on' : ''}`}>
                      <div className="pc-service-top">
                        <div className="pc-service-info">
                          <span className="pc-service-label">{label}</span>
                          {!active && (
                            <span className="pc-service-badge">Non configuré</span>
                          )}
                        </div>
                        <button
                          className={`pc-toggle ${isOn ? 'pc-toggle--on' : ''}`}
                          onClick={() => toggle(vendor)}
                          aria-label={`${isOn ? 'Désactiver' : 'Activer'} ${label}`}
                          role="switch"
                          aria-checked={isOn}
                        >
                          <span className="pc-toggle-knob" />
                        </button>
                      </div>

                      {purpose && (
                        <p className="pc-service-purpose">{purpose}</p>
                      )}

                      <div className="pc-service-meta">
                        {retention && (
                          <span className="pc-meta-item">
                            <svg viewBox="0 0 16 16" width="12" height="12"><circle cx="8" cy="8" r="7" /><path d="M8 4v4l3 2" /></svg>
                            {retention}
                          </span>
                        )}
                        {partner && (
                          <a
                            className="pc-meta-link"
                            href={partner}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Politique de confidentialité →
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}

      {/* ── Barre de sauvegarde ──────────────────────────────────── */}
      {hasChoices && (
        <div className="pc-save-bar">
          <div className="pc-save-inner">
            <p className="pc-save-hint">
              Vos modifications ne seront effectives qu'après avoir cliqué sur
              « Sauvegarder ».
            </p>
            <button
              className={`pc-btn pc-btn-primary pc-btn-save ${saving ? 'pc-btn--saving' : ''} ${saved ? 'pc-btn--saved' : ''}`}
              onClick={save}
            >
              {saving ? 'Enregistrement…' : saved ? '✓ Préférences sauvegardées' : 'Sauvegarder mes préférences'}
            </button>
          </div>
        </div>
      )}

    </main>
  )
}
