import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { NavDesktop } from './NavDesktop'
import { NavMobile } from './NavMobile'

export function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Fermeture menu mobile avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center"
        style={{
          height: '64px',
          background: scrolled ? 'rgba(5, 16, 30, 0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(165,172,181,0.10)' : '1px solid transparent',
          transition: 'background 0.35s ease, border-color 0.35s ease',
        }}
      >
        <div
          className="w-full max-w-[1200px] mx-auto flex items-center justify-between"
          style={{ padding: '0 24px' }}
        >
          {/* Logo */}
          <Link
            to="/"
            aria-label="CA-TECH — Accueil"
            className="flex items-center shrink-0"
            style={{ lineHeight: 0 }}
          >
            <img
              src="/logos/logo-ca-tech-icon.svg"
              alt="CA-TECH"
              style={{ height: '28px', width: 'auto' }}
            />
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:block">
            <NavDesktop />
          </div>

          {/* Droite — CTA + Burger */}
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="hidden md:inline-flex items-center"
              style={{
                padding: '8px 18px',
                background: '#359BD9',
                color: '#fff',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                transition: 'background 0.18s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4AAEE0'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#359BD9'
                e.currentTarget.style.transform = 'none'
              }}
            >
              Parler à CA-TECH
            </Link>

            <button
              className="md:hidden flex items-center justify-center"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(165,172,181,0.15)',
                borderRadius: '6px',
                color: '#A5ACB5',
                width: '44px',
                height: '44px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      <NavMobile isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
