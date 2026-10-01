import { useState } from 'react'
import { CATechManagerMockup } from './CATechManagerMockup'
import { CVMagicMockup } from './CVMagicMockup'
import { ShopcaMockup } from './ShopcaMockup'
import { PemousMoneyMockup } from './PemousMoneyMockup'

const PREVIEWS = [
  { id: 'pf01', label: 'PF-01 — CA-TECH Manager', Component: CATechManagerMockup },
  { id: 'pf02', label: 'PF-02 — CV Magic', Component: CVMagicMockup },
  { id: 'pf03', label: 'PF-03 — SHOPCA', Component: ShopcaMockup },
  { id: 'pf04', label: "PF-04 — Pemou's Money", Component: PemousMoneyMockup },
]

export default function PortfolioPreview() {
  const [active, setActive] = useState('pf01')
  const current = PREVIEWS.find((p) => p.id === active)
  const { Component } = current

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#020D18',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Selector bar */}
      <nav
        aria-label="Sélection du mockup portfolio"
        style={{
          height: '40px', flexShrink: 0,
          background: '#020D18',
          borderBottom: '1px solid rgba(53,155,217,0.15)',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: '4px',
        }}
      >
        <span style={{
          fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 600,
          color: 'rgba(165,172,181,0.50)', letterSpacing: '0.07em', textTransform: 'uppercase',
          marginRight: '12px', flexShrink: 0,
        }}>
          Portfolio Preview
        </span>

        {PREVIEWS.map((p) => {
          const isActive = p.id === active
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              style={{
                padding: '4px 14px',
                borderRadius: '4px',
                background: isActive ? 'rgba(53,155,217,0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(53,155,217,0.35)' : 'transparent'}`,
                fontFamily: '"Inter", sans-serif', fontSize: '11px', fontWeight: isActive ? 500 : 400,
                color: isActive ? '#F2F4F6' : 'rgba(165,172,181,0.60)',
                cursor: 'default', flexShrink: 0,
              }}
            >
              {p.label}
            </button>
          )
        })}

        <div style={{ flex: 1 }} />
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: '10px',
          color: 'rgba(165,172,181,0.30)',
        }}>
          dev · /portfolio-preview
        </span>
      </nav>

      {/* Mockup area — each mockup gets a stable ID for Playwright capture */}
      <div
        id={`portfolio-mockup-${active}`}
        style={{ flex: 1, overflow: 'hidden' }}
      >
        <Component />
      </div>
    </div>
  )
}
