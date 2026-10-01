import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

// Anime un entier de 0 vers `end` sur `duration` ms (ease-out cubique).
// Renvoie [count, ref] — attacher ref à l'élément déclencheur d'intersection.
export function useCountUp(end, { duration = 1400 } = {}) {
  const [count, setCount] = useState(0)
  const prefersReduced = useReducedMotion()
  const started = useRef(false)
  const rafRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (prefersReduced) {
      setCount(end)
      return
    }

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const t0 = performance.now()

          const tick = (now) => {
            const progress = Math.min((now - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * end))
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(tick)
            } else {
              setCount(end)
            }
          }

          rafRef.current = requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, prefersReduced])

  return [count, containerRef]
}
