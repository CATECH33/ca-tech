import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/constants'

export function NavMobile({ isOpen, onClose }) {
  const { pathname } = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 149,
              background: 'rgba(5,16,30,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0, 0.16, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(320px, 85vw)',
              background: 'rgba(5, 16, 30, 0.97)',
              backdropFilter: 'blur(24px)',
              zIndex: 150,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(165,172,181,0.10)',
            }}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
          >
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 0' }}>
              <button
                onClick={onClose}
                aria-label="Fermer le menu"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(165,172,181,0.15)',
                  borderRadius: '6px',
                  color: '#A5ACB5',
                  width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav aria-label="Navigation mobile" style={{ flex: 1, padding: '32px 24px 24px', overflow: 'auto' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        style={{
                          display: 'block',
                          padding: '14px 16px',
                          fontFamily: 'var(--font-display)',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: isActive ? '#F2F4F6' : '#A5ACB5',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          background: isActive ? 'rgba(53,155,217,0.08)' : 'transparent',
                          borderLeft: isActive ? '2px solid #359BD9' : '2px solid transparent',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        {item.label}
                      </Link>
                      {item.children && (
                        <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0 4px 16px' }}>
                          {item.children.map(child => (
                            <li key={child.label}>
                              <Link
                                to={child.href}
                                onClick={onClose}
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '14px',
                                  color: pathname === child.href ? '#359BD9' : '#A5ACB5',
                                  textDecoration: 'none',
                                  borderRadius: '6px',
                                  transition: 'color 0.15s ease',
                                }}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* CTA */}
            <div style={{ padding: '16px 24px 32px', borderTop: '1px solid rgba(165,172,181,0.08)' }}>
              <Link
                to="/contact"
                onClick={onClose}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px 24px',
                  background: '#359BD9',
                  color: '#fff',
                  textAlign: 'center',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.18s ease',
                }}
              >
                Parler à CA-TECH
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
