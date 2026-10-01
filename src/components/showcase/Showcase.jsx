import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export function Showcase({ slides, renderSlide, renderNav, className, style, ariaLabel = 'Projets' }) {
  const prefersReduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = useCallback((next) => {
    setDirection(next > active ? 1 : -1)
    setActive(next)
  }, [active])

  const prev = useCallback(() => { if (active > 0) go(active - 1) }, [active, go])
  const next = useCallback(() => { if (active < slides.length - 1) go(active + 1) }, [active, slides.length, go])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next])

  return (
    <div
      className={className}
      style={style}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <div aria-live="polite" aria-atomic="false">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={active}
          custom={direction}
          variants={prefersReduced ? undefined : slideVariants}
          initial={prefersReduced ? false : 'enter'}
          animate={prefersReduced ? {} : 'center'}
          exit={prefersReduced ? {} : 'exit'}
          transition={{ duration: prefersReduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderSlide(slides[active], active)}
        </motion.div>
      </AnimatePresence>
      </div>

      {renderNav && (
        <div style={{ marginTop: '32px' }}>
          {renderNav({ active, total: slides.length, onPrev: prev, onNext: next })}
        </div>
      )}
    </div>
  )
}
