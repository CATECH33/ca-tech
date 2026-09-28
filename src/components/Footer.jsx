import { Link, NavLink } from 'react-router-dom'
import './Footer.css'

const EXPERTISES = [
  ['/expertises/ia',             'Intelligence Artificielle'],
  ['/expertises/automatisation', 'Automatisation'],
  ['/expertises/web-saas',       'Web & SaaS'],
  ['/expertises/infrastructure', 'Infrastructure IT'],
]

const PAGES = [
  ['/realisations', 'Réalisations'],
  ['/a-propos',     'À propos'],
  ['/tarifs',       'Tarifs'],
  ['/loic',         'Loïc — Agent IA'],
  ['/contact',      'Contact'],
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top container">

        {/* Brand column */}
        <div className="footer-col footer-col--brand">
          <Link to="/" className="footer-brand">
            <picture>
              <source srcSet="/assets/logos/logo-ca-tech.webp" type="image/webp" />
              <img
                src="/assets/logos/logo-ca-tech.png"
                alt="Logo CA-TECH"
                width="34" height="34"
                decoding="async"
                loading="lazy"
              />
            </picture>
            <div>
              <div className="footer-brand-name">CA-TECH</div>
              <div className="footer-brand-sub">Cabinet Technologique</div>
            </div>
          </Link>

          <p className="footer-desc">
            Nous concevons les systèmes qui font fonctionner votre entreprise — intelligence artificielle, automatisation, développement web et infrastructure.
          </p>

          <div className="footer-contact">
            <a href="mailto:contact@ca-tech.fr" className="footer-contact-link">contact@ca-tech.fr</a>
            <a href="tel:+33775664975" className="footer-contact-link">+33 7 75 66 49 75</a>
            <a
              href="https://www.linkedin.com/company/ca-tech-france/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Expertises column */}
        <div className="footer-col">
          <h5 className="footer-col-title">Expertises</h5>
          <ul>
            {EXPERTISES.map(([to, label]) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Pages column */}
        <div className="footer-col">
          <h5 className="footer-col-title">Navigation</h5>
          <ul>
            {PAGES.map(([to, label]) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Zones */}
        <div className="footer-col">
          <h5 className="footer-col-title">Zones d'intervention</h5>
          <div className="footer-zones">
            {['Paris', 'Lyon', 'Dijon', 'Troyes', 'Marseille', 'Bordeaux'].map(c => (
              <a key={c} href="/contact" className="footer-zone-tag">{c}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-sep" />

      <div className="footer-bottom container">
        <span>© 2026 CA-TECH — Tous droits réservés</span>
        <div className="footer-legal-links">
          <a href="/mentions-legales">Mentions légales</a>
          <a href="/politique-de-confidentialite">Confidentialité</a>
          <Link to="/politique-des-cookies">Cookies</Link>
          <button
            onClick={() => window.openAxeptioCookies?.() ?? window.CATechConsent?.openPreferences()}
          >
            Gérer mes cookies
          </button>
        </div>
      </div>
    </footer>
  )
}
