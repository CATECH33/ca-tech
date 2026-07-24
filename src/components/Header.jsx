import { NavLink } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import './Header.css'

const MEGA_LISTS = [
  {
    title: 'Développement Web',
    items: [
      { label: 'Site vitrine',    href: '/services#creation' },
      { label: 'Site E-commerce', href: '/services#creation' },
      { label: 'Landing Page',    href: '/services#creation' },
      { label: 'Refonte de site', href: '/services#refonte'  },
    ],
  },
  {
    title: 'Applications Métier',
    items: [
      { label: 'CRM sur mesure', href: '/services#apps' },
      { label: 'ERP',            href: '/services#apps' },
      { label: 'SaaS',           href: '/services#apps' },
      { label: 'Portail client', href: '/services#apps' },
    ],
  },
  {
    title: 'Visibilité',
    items: [
      { label: 'SEO',               href: '/services#seo'         },
      { label: 'Audit SEO',         href: '/services#seo'         },
      { label: 'Identité visuelle', href: '/services'             },
      { label: 'Logo',              href: '/services'             },
      { label: 'Maintenance',       href: '/services#maintenance' },
    ],
  },
]

const MEGA_CARDS = [
  {
    icon: '🤖',
    section: 'Intelligence Artificielle',
    title: 'Collaborateurs IA',
    desc: 'Des assistants spécialisés qui travaillent 24h/24 pour votre entreprise.',
    to: '/collaborateurs-ia',
  },
  {
    icon: '⚡',
    section: 'Automatisations',
    title: 'Automatisations',
    desc: 'Automatisez vos tâches répétitives et connectez tous vos outils.',
    to: '/automatisations',
  },
]

const NAV_ITEMS = [
  { to: '/',             label: 'Accueil',      end: true },
  { to: '/realisations', label: 'Réalisations' },
  { to: '/tarifs',       label: 'Tarifs' },
  { to: '/loic',         label: 'À propos' },
  { to: '/contact',      label: 'Contact' },
]

const MOB_SERVICES = [
  { label: 'Développement Web',    href: '/services#creation'  },
  { label: 'Applications Métier',  href: '/services#apps'      },
  { label: 'Collaborateurs IA',    to:   '/collaborateurs-ia'  },
  { label: 'Automatisations',      to:   '/automatisations'    },
  { label: 'Visibilité & SEO',     href: '/services#seo'       },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
          {/* ── Services + Mega Menu ── */}
          <li className="nav-dropdown">
            <NavLink
              to="/services"
              className={({ isActive }) => `nav-dd-trigger${isActive ? ' nav-active' : ''}`}
            >
              Services <span className="nav-caret" aria-hidden="true">▾</span>
            </NavLink>

            <div className="nav-mega-panel" role="dialog" aria-label="Menu Services">
              <div className="nav-mega-grid">

                {/* Cols 1 & 2 : list sections, Col 5 : list section */}
                {MEGA_LISTS.slice(0, 2).map(col => (
                  <div key={col.title} className="nav-mega-col">
                    <p className="nav-mega-title">{col.title}</p>
                    {col.items.map(({ label, href }) => (
                      <a key={label} href={href} className="nav-mega-link" onClick={closeMenu}>{label}</a>
                    ))}
                  </div>
                ))}

                {/* Cols 3 & 4 : feature cards */}
                {MEGA_CARDS.map(card => (
                  <div key={card.to} className="nav-mega-col">
                    <p className="nav-mega-title">{card.section}</p>
                    <div className="nav-mega-card">
                      <span className="nav-mega-card-icon">{card.icon}</span>
                      <strong className="nav-mega-card-title">{card.title}</strong>
                      <p className="nav-mega-card-desc">{card.desc}</p>
                      <NavLink to={card.to} className="nav-mega-card-btn" onClick={closeMenu}>
                        Découvrir →
                      </NavLink>
                    </div>
                  </div>
                ))}

                {/* Col 5 : Visibilité */}
                <div className="nav-mega-col">
                  <p className="nav-mega-title">{MEGA_LISTS[2].title}</p>
                  {MEGA_LISTS[2].items.map(({ label, href }) => (
                    <a key={label} href={href} className="nav-mega-link" onClick={closeMenu}>{label}</a>
                  ))}
                </div>
              </div>

              {/* ── Bottom banner ── */}
              <div className="nav-mega-banner">
                <div className="nav-mega-banner-text">
                  <strong>Vous ne savez pas quelle solution choisir ?</strong>
                  <span>Réservez un diagnostic gratuit avec un expert CA-TECH.</span>
                </div>
                <NavLink to="/contact" className="nav-mega-banner-btn" onClick={closeMenu}>
                  Demander un diagnostic →
                </NavLink>
              </div>
            </div>
          </li>

          {/* ── Other nav items ── */}
          {NAV_ITEMS.filter(n => n.to !== '/').map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} className={activeClass} end={end}>{label}</NavLink>
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

      {/* ── Mobile menu ── */}
      <div className={`mob-menu${menuOpen ? ' open' : ''}`}>
        <NavLink to="/"             className={activeClass} end onClick={closeMenu}>Accueil</NavLink>
        <NavLink to="/services"     className={`${activeClass({ isActive: false })} mob-srv-hd`} onClick={closeMenu}>Services</NavLink>
        {MOB_SERVICES.map(({ label, href, to }) =>
          to
            ? <NavLink key={to}   to={to}   className={activeClass}    onClick={closeMenu} style={{ paddingLeft: '1rem' }}>{label}</NavLink>
            : <a       key={href} href={href} className="mob-dd-item"   onClick={closeMenu}>{label}</a>
        )}
        <NavLink to="/realisations" className={activeClass} onClick={closeMenu}>Réalisations</NavLink>
        <NavLink to="/tarifs"       className={activeClass} onClick={closeMenu}>Tarifs</NavLink>
        <NavLink to="/loic"         className={activeClass} onClick={closeMenu}>À propos</NavLink>
        <NavLink to="/contact"      className={activeClass} onClick={closeMenu}>Contact</NavLink>
        <NavLink to="/contact" className="btn-mob" onClick={closeMenu}>Demander un devis</NavLink>
      </div>
    </>
  )
}
