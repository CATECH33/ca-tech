import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ShowcaseNav({ total, active, onPrev, onNext }) {
  const atStart = active === 0
  const atEnd = active === total - 1

  const btnStyle = (disabled) => ({
    width: '44px', height: '44px', borderRadius: '50%',
    border: '1px solid rgba(165,172,181,0.18)',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'rgba(165,172,181,0.22)' : '#A5ACB5',
    transition: 'border-color 0.15s ease, color 0.15s ease',
    flexShrink: 0,
  })

  const onEnter = (e) => {
    e.currentTarget.style.borderColor = '#359BD9'
    e.currentTarget.style.color = '#F2F4F6'
  }
  const onLeave = (e, disabled) => {
    e.currentTarget.style.borderColor = 'rgba(165,172,181,0.18)'
    e.currentTarget.style.color = disabled ? 'rgba(165,172,181,0.22)' : '#A5ACB5'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Progress bars */}
      <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '64px' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '2px',
              background: i <= active ? '#359BD9' : 'rgba(165,172,181,0.12)',
              borderRadius: '1px',
              transition: 'background 0.25s ease',
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onPrev}
          disabled={atStart}
          aria-label="Projet précédent"
          style={btnStyle(atStart)}
          onMouseEnter={e => { if (!atStart) onEnter(e) }}
          onMouseLeave={e => onLeave(e, atStart)}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={onNext}
          disabled={atEnd}
          aria-label="Projet suivant"
          style={btnStyle(atEnd)}
          onMouseEnter={e => { if (!atEnd) onEnter(e) }}
          onMouseLeave={e => onLeave(e, atEnd)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
