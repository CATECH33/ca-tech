import { useEffect, useRef, useState } from 'react'

const SRC  = '/videos/hero-ca-tech.mp4'
const FALLBACK = '/images/hero-fallback.webp'

export default function HeroVideo() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError]   = useState(false)
  const [visible, setVisible] = useState(false)

  /* Intersection Observer — lazy-load only when near viewport */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* Trigger animation one frame after mount so CSS transition fires */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const id = requestAnimationFrame(() => { el.dataset.ready = '1' })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="hv-wrap"
      aria-hidden="true"
    >
      {error ? (
        <img
          src={FALLBACK}
          alt=""
          className="hv-media"
          decoding="async"
          fetchPriority="low"
        />
      ) : (
        visible && (
          <video
            ref={videoRef}
            className="hv-media"
            src={SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setError(true)}
          />
        )
      )}
    </div>
  )
}
