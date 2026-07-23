import { NavLink } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import './Header.css'

const NAV_ITEMS = [
  { to: '/',                  label: 'Accueil',          end: true },
  { to: '/services',          label: 'Services' },
  { to: '/loic',              label: 'Loïc' },
  { to: '/collaborateurs-ia', label: 'Collaborateurs IA' },
  { to: '/automatisations',   label: 'Automatisations' },
  { to: '/realisations',      label: 'Réalisations' },
  { to: '/contact',           label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const activeClass = ({ isActive }) => isActive ? 'nav-active' : undefined

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <NavLink to="/" className="logo" onClick={closeMenu} aria-label="CA-TECH — Retour à l'accueil">
          <img src="/assets/logos/logo-ca-tech.png" alt="CA-TECH" width="36" height="36" />
          <div>
            <span className="logo-name">CA-TECH</span>
            <span className="logo-sub">Agence Web &amp; Design</span>
          </div>
        </NavLink>

        <ul className="nav-links">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} className={activeClass} end={end}>
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/contact" className="btn-nav" onClick={closeMenu}>
              Demander un devis
            </NavLink>
          </li>
        </ul>

        <button
          className={`ham${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mob-menu${menuOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink key={to} to={to} className={activeClass} end={end} onClick={closeMenu}>
            {label}
          </NavLink>
        ))}
        <NavLink to="/contact" className="btn-mob" onClick={closeMenu}>
          Demander un devis
        </NavLink>
      </div>
    </>
  )
}
