import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/constants'

export function NavDesktop() {
  const { pathname } = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)

  return (
    <nav aria-label="Navigation principale">
      <ul style={{ display: 'flex', alignItems: 'center', gap: '32px', listStyle: 'none', margin: 0, padding: 0 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.children && item.children.some(c => pathname === c.href))
          return (
            <li
              key={item.label}
              style={{ position: 'relative' }}
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.children ? (
                <>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px', fontWeight: 500,
                      color: isActive ? '#F2F4F6' : '#A5ACB5',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px 0',
                      transition: 'color 0.18s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F2F4F6'}
                    onMouseLeave={e => e.currentTarget.style.color = isActive ? '#F2F4F6' : '#A5ACB5'}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: openDropdown === item.label ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {isActive && (
                    <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#359BD9', borderRadius: '1px' }} />
                  )}
                  {openDropdown === item.label && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(16, 39, 64, 0.97)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '10px',
                      border: '1px solid rgba(165,172,181,0.12)',
                      padding: '8px',
                      minWidth: '220px',
                      zIndex: 200,
                    }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          style={{
                            display: 'block',
                            padding: '10px 14px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: pathname === child.href ? '#F2F4F6' : '#A5ACB5',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            transition: 'background 0.15s ease, color 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(53,155,217,0.08)'; e.currentTarget.style.color = '#F2F4F6' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = pathname === child.href ? '#F2F4F6' : '#A5ACB5' }}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to={item.href}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px', fontWeight: 500,
                      color: isActive ? '#F2F4F6' : '#A5ACB5',
                      textDecoration: 'none',
                      padding: '4px 0',
                      transition: 'color 0.18s ease',
                      display: 'block',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F2F4F6'}
                    onMouseLeave={e => e.currentTarget.style.color = isActive ? '#F2F4F6' : '#A5ACB5'}
                  >
                    {item.label}
                  </Link>
                  {isActive && (
                    <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#359BD9', borderRadius: '1px' }} />
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
