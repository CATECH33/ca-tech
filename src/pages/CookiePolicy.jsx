import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import './CookiePolicy.css'

const CATEGORY_META = {
  analytics: {
    label:       'Analytique',
    description: "Permettent de mesurer l'audience du site et le comportement des visiteurs afin d'améliorer l'expérience utilisateur.",
    lawBasis:    'Consentement (art. 6.1.a RGPD)',
  },
  advertising: {
    label:       'Marketing',
    description: "Utilisés pour mesurer l'efficacité des campagnes publicitaires et diffuser des contenus personnalisés sur des plateformes tierces.",
    lawBasis:    'Consentement (art. 6.1.a RGPD)',
  },
  functional: {
    label:       'Fonctionnel',
    description: 'Nécessaires au bon fonctionnement de certaines fonctionnalités du site (paiement sécurisé, vidéos intégrées, cartographie).',
    lawBasis:    'Intérêt légitime / Exécution du contrat (art. 6.1.b-f RGPD)',
  },
}

const CATEGORY_ORDER = ['analytics', 'advertising', 'functional']

function useRegistry() {
  return useMemo(() => {
    const raw = window.CATechConsent?.getRegistry() || {}
    const groups = {}
    CATEGORY_ORDER.forEach(c => { groups[c] = [] })
    Object.entries(raw).forEach(([vendor, svc]) => {
      const cat = svc.category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push({ vendor, ...svc })
    })
    return { raw, groups, total: Object.keys(raw).length }
  }, [])
}

export default function CookiePolicy() {
  const { groups, total } = useRegistry()
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="cp-page">

      {/* ── En-tête ─────────────────────────────────────────────── */}
      <header className="cp-header">
        <div className="cp-header-inner">
          <div className="cp-meta">
            <span className="cp-meta-tag">Document légal</span>
            <span className="cp-meta-sep" />
            <span className="cp-meta-date">Mis à jour le {today}</span>
            <span className="cp-meta-sep" />
            <span className="cp-meta-count">{total} services référencés</span>
          </div>
          <h1>Politique d'utilisation des cookies</h1>
          <p className="cp-lead">
            La présente politique décrit l'ensemble des cookies et technologies de
            traçage déployés sur <strong>ca-tech.fr</strong>, leurs finalités, leur
            durée de conservation et les partenaires impliqués. Elle est générée
            automatiquement à partir de notre registre de services et reste
            synchronisée en temps réel.
          </p>
          <div className="cp-header-actions">
            <Link to="/politique-des-cookies" className="cp-btn cp-btn-primary">
              Gérer mes préférences →
            </Link>
            <button
              className="cp-btn cp-btn-ghost"
              onClick={() => window.CATechConsent?.openPreferences()}
            >
              Ouvrir le panneau de consentement
            </button>
          </div>
        </div>
      </header>

      <div className="cp-body">

        {/* ── Qu'est-ce qu'un cookie ? ──────────────────────────── */}
        <section className="cp-section">
          <h2>Qu'est-ce qu'un cookie&nbsp;?</h2>
          <p>
            Un cookie est un petit fichier texte ou alphanumérique déposé sur votre
            terminal (ordinateur, smartphone, tablette) par le serveur du site que
            vous visitez. Il permet de reconnaître votre appareil lors de visites
            ultérieures et peut contenir des informations telles qu'un identifiant de
            session ou vos préférences.
          </p>
          <p>
            Conformément à la loi Informatique et Libertés modifiée et au{' '}
            <strong>Règlement Général sur la Protection des Données (RGPD)</strong>,
            les cookies non strictement nécessaires au fonctionnement du site
            nécessitent votre consentement préalable. Vous pouvez accepter, refuser
            ou personnaliser vos choix à tout moment via notre{' '}
            <Link to="/politique-des-cookies">centre de préférences</Link>.
          </p>
        </section>

        {/* ── Tableau de bord des catégories ───────────────────── */}
        <section className="cp-section">
          <h2>Vue d'ensemble</h2>
          <div className="cp-overview">
            {CATEGORY_ORDER.map(cat => {
              const meta    = CATEGORY_META[cat]
              const entries = groups[cat] || []
              return (
                <a key={cat} href={`#cat-${cat}`} className="cp-overview-card">
                  <span className="cp-overview-count">{entries.length}</span>
                  <span className="cp-overview-label">{meta?.label}</span>
                  <span className="cp-overview-basis">{meta?.lawBasis}</span>
                </a>
              )
            })}
          </div>
        </section>

        {/* ── Détail par catégorie ─────────────────────────────── */}
        {CATEGORY_ORDER.map(cat => {
          const meta    = CATEGORY_META[cat]
          const entries = groups[cat] || []
          if (entries.length === 0) return null
          return (
            <section key={cat} id={`cat-${cat}`} className="cp-section cp-section--services">
              <div className="cp-section-header">
                <h2>{meta?.label}</h2>
                <span className="cp-section-basis">{meta?.lawBasis}</span>
              </div>
              <p className="cp-section-desc">{meta?.description}</p>

              {/* Tableau desktop */}
              <div className="cp-table-wrap">
                <table className="cp-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Finalité</th>
                      <th>Durée de conservation</th>
                      <th>Partenaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(({ vendor, label, purpose, retention, partner, active }) => (
                      <tr key={vendor}>
                        <td>
                          <strong>{label}</strong>
                          {!active && <span className="cp-inactive">Inactif</span>}
                        </td>
                        <td className="cp-td-purpose">{purpose || '—'}</td>
                        <td className="cp-td-retention">
                          <span className="cp-pill">{retention || '—'}</span>
                        </td>
                        <td>
                          {partner
                            ? <a href={partner} target="_blank" rel="noopener noreferrer" className="cp-partner-link">
                                Politique de confidentialité ↗
                              </a>
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <div className="cp-cards">
                {entries.map(({ vendor, label, purpose, retention, partner, active }) => (
                  <div key={vendor} className="cp-card">
                    <div className="cp-card-top">
                      <strong>{label}</strong>
                      {!active && <span className="cp-inactive">Inactif</span>}
                    </div>
                    {purpose && <p className="cp-card-purpose">{purpose}</p>}
                    <div className="cp-card-row">
                      <span className="cp-card-key">Durée</span>
                      <span className="cp-pill">{retention || '—'}</span>
                    </div>
                    {partner && (
                      <div className="cp-card-row">
                        <span className="cp-card-key">Partenaire</span>
                        <a href={partner} target="_blank" rel="noopener noreferrer" className="cp-partner-link">
                          Confidentialité ↗
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {/* ── Vos droits ───────────────────────────────────────── */}
        <section className="cp-section">
          <h2>Vos droits</h2>
          <p>
            Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et
            Libertés, vous disposez des droits suivants concernant vos données
            personnelles&nbsp;:
          </p>
          <ul className="cp-rights">
            <li><strong>Droit d'accès</strong> — Obtenir une copie de vos données traitées.</li>
            <li><strong>Droit de rectification</strong> — Corriger des données inexactes.</li>
            <li><strong>Droit à l'effacement</strong> — Demander la suppression de vos données.</li>
            <li><strong>Droit d'opposition</strong> — Vous opposer à certains traitements.</li>
            <li><strong>Droit à la portabilité</strong> — Récupérer vos données dans un format structuré.</li>
            <li><strong>Droit de retrait du consentement</strong> — Retirer votre consentement à tout moment, sans préjudice des traitements antérieurs.</li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous à{' '}
            <a href="mailto:contact@ca-tech.fr">contact@ca-tech.fr</a> ou via notre{' '}
            <Link to="/contact">formulaire de contact</Link>.
            Vous pouvez également introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
          </p>
        </section>

        {/* ── Gérer les préférences ────────────────────────────── */}
        <section className="cp-section cp-section--cta">
          <div className="cp-cta-box">
            <h2>Modifier vos préférences</h2>
            <p>
              Vous pouvez modifier ou retirer votre consentement à tout moment.
              Vos choix sont appliqués immédiatement.
            </p>
            <div className="cp-cta-actions">
              <Link to="/politique-des-cookies" className="cp-btn cp-btn-primary">
                Ouvrir le centre de préférences →
              </Link>
              <button
                className="cp-btn cp-btn-secondary"
                onClick={() => window.CATechConsent?.refuseAll?.()}
              >
                Tout refuser
              </button>
              <button
                className="cp-btn cp-btn-secondary"
                onClick={() => window.CATechConsent?.acceptAll?.()}
              >
                Tout accepter
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
