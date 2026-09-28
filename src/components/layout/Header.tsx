import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import './Header.css'

const EXPERTISES = [
  { label: 'Intelligence Artificielle', to: '/expertises/ia' },
  { label: 'Automatisation',            to: '/expertises/automatisation' },
  { label: 'Web & SaaS',               to: '/expertises/web-saas' },
  { label: 'Infrastructure IT',         to: '/expertises/infrastructure' },
]

const EXPERTISE_PATHS = EXPERTISES.map(e => e.to)

const NAV = [
  { label: 'Réalisations', to: '/realisations' },
  { label: 'À propos',     to: '/a-propos' },
  { label: 'Contact',      to: '/contact' },
] as const

export default function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [expOpen, setExpOpen]     = useState(false)
  const location = useLocation()

  const expActive = EXPERTISE_PATHS.some(p => location.pathname.startsWith(p))

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 80); ticking = false })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = useCallback(() => { setMenuOpen(false); setExpOpen(false) }, [])

  const active = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link nav-active' : 'nav-link'

  return (
    <>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} id="nav" aria-label="Navigation principale">

        {/* Logo */}
        <NavLink to="/" className="nav-logo" onClick={closeMenu} aria-label="CA-TECH — Retour à l'accueil">
          <picture>
            <source media="(max-width:1024px)" srcSet="/logos/logo-ca-tech-icon.svg" type="image/svg+xml" />
            <source media="(min-width:1025px)" srcSet="/assets/logos/logo-ca-tech.webp" type="image/webp" />
            <img
              src="/assets/logos/logo-ca-tech.png"
              alt="Logo CA-TECH"
              width="34" height="34"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
          <div className="nav-logo-text">
            <span className="nav-logo-name">CA-TECH</span>
            <span className="nav-logo-sub">Cabinet Technologique</span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <ul className="nav-links" role="list">
          <li>
            <NavLink to="/" className={active} end onClick={closeMenu}>Accueil</NavLink>
          </li>

          {/* Expertises dropdown */}
          <li className="nav-dropdown">
            <button
              className={`nav-link nav-dd-trigger${expActive ? ' nav-active' : ''}`}
              aria-haspopup="listbox"
              aria-expanded="false"
            >
              Expertises <span className="nav-caret" aria-hidden="true">▾</span>
            </button>
            <div className="nav-dd-panel" role="listbox">
              {EXPERTISES.map(({ label, to }) => (
                <NavLink key={to} to={to} className="nav-dd-item" role="option" onClick={closeMenu}>
                  {label}
                </NavLink>
              ))}
            </div>
          </li>

          {NAV.map(item => (
            <li key={item.label}>
              <NavLink to={item.to} className={active} onClick={closeMenu}>{item.label}</NavLink>
            </li>
          ))}

          <li>
            <NavLink to="/contact" className="nav-cta" onClick={closeMenu}>
              Démarrer
            </NavLink>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className={`nav-ham${menuOpen ? ' nav-ham--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mob-menu${menuOpen ? ' mob-menu--open' : ''}`} id="mobile-menu" role="dialog" aria-label="Menu mobile">
        <NavLink to="/" className={active} end onClick={closeMenu}>Accueil</NavLink>

        <button
          className={`mob-exp-hd${expOpen ? ' mob-exp-hd--open' : ''}`}
          onClick={() => setExpOpen(o => !o)}
          aria-expanded={expOpen}
        >
          Expertises <span className="nav-caret" aria-hidden="true">▾</span>
        </button>

        {expOpen && EXPERTISES.map(({ label, to }) => (
          <NavLink key={to} to={to} className="mob-dd-item" onClick={closeMenu}>{label}</NavLink>
        ))}

        {NAV.map(item => (
          <NavLink key={item.label} to={item.to} className={active} onClick={closeMenu}>{item.label}</NavLink>
        ))}

        <NavLink to="/contact" className="mob-cta" onClick={closeMenu}>Démarrer</NavLink>
      </div>
    </>
  )
}
