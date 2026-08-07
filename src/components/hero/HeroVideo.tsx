import { useEffect, useRef, useState } from 'react'

const SRC      = '/videos/hero-ca-tech.mp4'
const FALLBACK = '/images/hero-fallback.webp'

export default function HeroVideo() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  /* Déclenche l'animation d'entrée après le premier rendu */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    /* Double rAF : garantit que le navigateur a peint l'état initial (opacity 0) */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.dataset.ready = '1' })
    })
  }, [])

  return (
    <div ref={wrapRef} className="hv-wrap" aria-hidden="true">
      {error ? (
        <img
          src={FALLBACK}
          alt=""
          className="hv-media"
          decoding="async"
        />
      ) : (
        <video
          className="hv-media"
          src={SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
