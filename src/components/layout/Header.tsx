import { NavLink } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import './Header.css'

const SOLUTIONS = [
  { label: 'Création de site Web', href: '/creation-site-vitrine' },
  { label: 'Applications Métier',  href: '/services#apps' },
  { label: 'CRM sur mesure',       href: '/services#apps' },
  { label: 'SEO',                  href: '/services#seo' },
  { label: 'Maintenance',          href: '/maintenance-site-web' },
]

const NAV = [
  { label: 'Collaborateurs IA', to: '/collaborateurs-ia' },
  { label: 'Automatisations',   to: '/automatisations' },
  { label: 'Réalisations',      to: '/realisations' },
  { label: 'Blog',              href: '/blog' },
  { label: 'Tarifs',            to: '/tarifs' },
  { label: 'À propos',          to: '/loic' },
  { label: 'Contact',           to: '/contact' },
] as const

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [solOpen, setSolOpen] = useState(false)

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

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    setSolOpen(false)
  }, [])

  const active = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-active' : undefined

  return (
    <>
      <div id="prog" />
      <nav className={scrolled ? 'scrolled' : ''} id="nav">

        {/* Logo */}
        <NavLink to="/" className="logo" onClick={closeMenu} aria-label="CA-TECH — Retour à l'accueil">
          <picture>
            <source srcSet="/assets/logos/logo-ca-tech.webp" type="image/webp" />
            <img
              src="/assets/logos/logo-ca-tech.png"
              alt="Logo CA-TECH — Agence Web & IA"
              width="36" height="36"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
          <div>
            <span className="logo-name">CA-TECH</span>
            <span className="logo-sub">Agence Web &amp; Design</span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={active} end>Accueil</NavLink>
          </li>

          {/* Solutions dropdown */}
          <li className="nav-dropdown">
            <button className="nav-dd-trigger" aria-haspopup="true">
              Solutions <span className="nav-caret" aria-hidden="true">▾</span>
            </button>
            <div className="nav-sol-panel" role="menu">
              {SOLUTIONS.map(({ label, href }) => (
                <a key={label} href={href} className="nav-sol-link" role="menuitem" onClick={closeMenu}>
                  {label}
                </a>
              ))}
            </div>
          </li>

          {/* Main nav items */}
          {NAV.map(item => (
            <li key={item.label}>
              {'to' in item
                ? <NavLink to={item.to} className={active} onClick={closeMenu}>{item.label}</NavLink>
                : <a href={item.href} onClick={closeMenu}>{item.label}</a>
              }
            </li>
          ))}

          <li>
            <NavLink to="/contact" className="btn-nav" onClick={closeMenu}>
              Demander un devis
            </NavLink>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className={`ham${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mob-menu${menuOpen ? ' open' : ''}`} id="mob">
        <NavLink to="/" className={active} end onClick={closeMenu}>Accueil</NavLink>

        {/* Solutions mobile toggle */}
        <button
          className={`mob-sol-hd${solOpen ? ' open' : ''}`}
          onClick={() => setSolOpen(o => !o)}
          aria-expanded={solOpen}
        >
          Solutions <span className="nav-caret" aria-hidden="true">▾</span>
        </button>
        {solOpen && SOLUTIONS.map(({ label, href }) => (
          <a key={label} href={href} className="mob-dd-item" onClick={closeMenu}>{label}</a>
        ))}

        {NAV.map(item => (
          'to' in item
            ? <NavLink key={item.label} to={item.to} className={active} onClick={closeMenu}>{item.label}</NavLink>
            : <a key={item.label} href={item.href} onClick={closeMenu}>{item.label}</a>
        ))}

        <NavLink to="/contact" className="btn-mob" onClick={closeMenu}>Demander un devis</NavLink>
      </div>
    </>
  )
}
