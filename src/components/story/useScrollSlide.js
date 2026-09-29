import { useState, useEffect } from 'react'

/**
 * Scroll-driven slide tracker for sticky storytelling sections.
 *
 * Maps scroll progress through a tall wrapper element to a slide index.
 * The wrapper must use the computed height formula:
 *   height = slideCount * 45dvh + 55dvh
 *
 * Falls back to a 4s timer when prefers-reduced-motion is active.
 */
export function useScrollSlide(ref, count) {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      const timer = setInterval(() => setSlide(prev => (prev + 1) % count), 4000)
      return () => clearInterval(timer)
    }

    // Read --nav-h from CSS tokens (default 88px)
    const navH =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 88

    function update() {
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight
      const panelH = viewH - navH
      const totalScrollable = el.offsetHeight - panelH

      // Guard: mobile / short section (sticky disabled, height: auto)
      if (totalScrollable <= 0) return

      // scrolledIn: how many px past the sticky activation point
      const scrolledIn = navH - rect.top
      const progress = Math.max(0, Math.min(1 - 1e-9, scrolledIn / totalScrollable))
      setSlide(Math.floor(progress * count))
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, count])

  return slide
}
