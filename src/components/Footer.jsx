import { Link } from 'react-router-dom'
import './Footer.css'

const EXPERTISES = [
  ['/collaborateurs-ia', 'Intelligence Artificielle'],
  ['/automatisations', 'Automatisation'],
  ['/services', 'SEO & Référencement'],
  ['/services', 'Développement Web'],
  ['/services', 'Design & Identité'],
]

const SOLUTIONS = [
  ['/services', 'Sites vitrines'],
  ['/services', 'Sites e-commerce'],
  ['/services', 'Landing pages'],
  ['/services', 'Applications métier'],
  ['/services', 'Logos & Charte'],
]

const PAGES = [
  ['/loic', 'Loïc'],
  ['/realisations', 'Réalisations'],
  ['/blog', 'Blog'],
  ['/a-propos', 'À propos'],
  ['/tarifs', 'Tarifs'],
  ['/contact', 'Contact'],
]

export default function Footer() {
  return (
    <footer>
      <div className="f-top">
        <div className="f-col">
          <Link to="/" className="f-brand">
            <img src="/assets/logos/logo-ca-tech.png" alt="CA-TECH" width="36" height="36" style={{ borderRadius: '8px' }} />
            <div>
              <div className="f-brand-name">CA-TECH</div>
              <div className="f-brand-tag">Agence Web &amp; IA</div>
            </div>
          </Link>
          <p className="f-col-desc">
            Agence Web &amp; IA spécialisée dans la création de sites, les collaborateurs IA et l'automatisation des entreprises en France.
          </p>
          <div className="f-zones">
            <div className="f-zones-lbl">Zones d'intervention</div>
            <div className="f-zones-cities">
              {['Paris', 'Lyon', 'Dijon', 'Troyes', 'Marseille', 'Bordeaux'].map(c => (
                <a key={c} href={`/agence-web-${c.toLowerCase()}`}>{c}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="f-col">
          <h5>Expertises</h5>
          <ul>
            {EXPERTISES.map(([to, label]) => (
              <li key={label}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="f-col">
          <h5>Solutions</h5>
          <ul>
            {SOLUTIONS.map(([to, label]) => (
              <li key={label}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="f-col">
          <h5>Pages</h5>
          <ul>
            {PAGES.map(([to, label]) => (
              <li key={label}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="f-col">
          <h5>Contact</h5>
          <div className="f-contact-item">
            <div className="f-contact-icon">
              <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg>
            </div>
            <div className="f-contact-txt">
              <a href="mailto:contact@ca-tech.fr">contact@ca-tech.fr</a>
            </div>
          </div>
          <div className="f-contact-item">
            <div className="f-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
            </div>
            <div className="f-contact-txt">
              <a href="tel:+33775664975">+33 7 75 66 49 75</a>
            </div>
          </div>
          <div className="f-contact-item">
            <div className="f-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
            </div>
            <div className="f-contact-txt">
              <a href="https://www.linkedin.com/company/ca-tech" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>

      <div className="f-sep" />

      <div className="f-bottom">
        <span>© 2026 CA-TECH — Tous droits réservés</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/mentions-legales" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none', fontSize: '.72rem' }}>Mentions légales</a>
          <a href="/politique-de-confidentialite" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none', fontSize: '.72rem' }}>Confidentialité</a>
          <a href="/tarifs" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none', fontSize: '.72rem' }}>CGV</a>
        </div>
      </div>
    </footer>
  )
}
