import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { staggerContainer, fadeUp, fadeUpHeadline, imageReveal } from '../../lib/motion'

const HERO_ASSETS = {
  desktop: '/hero/catech-hero-01.webp',
  mobile:  '/hero/catech-hero-mobile.webp',
  poster:  '/hero/catech-hero-poster.webp',
  width:   1920,
  height:  1075,
}

export function HeroSection() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const itemH = prefersReduced ? {} : fadeUpHeadline
  const item  = prefersReduced ? {} : fadeUp
  const img   = prefersReduced ? {} : imageReveal

  return (
    <section
      aria-label="CA-TECH — Accueil"
      style={{
        minHeight: '100dvh',
        paddingTop: '64px',
        position: 'relative',
        overflow: 'hidden',
        background: '#05101E',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* ── Image structurelle + scrim ─────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        variants={img}
        initial="hidden"
        animate="visible"
        style={{ position: 'absolute', inset: 0 }}
      >
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={HERO_ASSETS.mobile}
            width="828"
            height="1104"
          />
          <img
            src={HERO_ASSETS.desktop}
            alt=""
            fetchpriority="high"
            loading="eager"
            decoding="async"
            width={HERO_ASSETS.width}
            height={HERO_ASSETS.height}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right center',
              display: 'block',
            }}
          />
        </picture>

        {/* Scrim gauche — bleu nuit localisé, non opaque */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(90deg,',
              'rgba(5,16,30,0.97) 0%,',
              'rgba(5,16,30,0.90) 28%,',
              'rgba(5,16,30,0.70) 48%,',
              'rgba(5,16,30,0.25) 68%,',
              'rgba(5,16,30,0.00) 85%)',
            ].join(' '),
          }}
        />

        {/* Fondu bas — transition vers la section suivante */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '160px',
            background: 'linear-gradient(to bottom, transparent, #05101E)',
          }}
        />
      </motion.div>

      {/* ── Contenu ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
        }}
        className="md:px-12 xl:px-20"
      >
        <motion.div
          variants={cont}
          initial="hidden"
          animate="visible"
          style={{
            maxWidth: '560px',
            paddingTop: '56px',
            paddingBottom: '120px',
          }}
          className="lg:max-w-[580px]"
        >
          {/* Eyebrow */}
          <motion.div variants={item} style={{ marginBottom: '28px' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#359BD9',
            }}>
              CA-TECH
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={itemH}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              color: '#F2F4F6',
              marginBottom: '24px',
              textWrap: 'balance',
            }}
          >
            L'intelligence qui transforme{' '}
            <span style={{ color: '#359BD9' }}>votre entreprise.</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            variants={item}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: 1.65,
              color: 'rgba(165,172,181,0.85)',
              marginBottom: '44px',
              letterSpacing: '0.015em',
            }}
          >
            Nous automatisons vos processus, déployons des agents IA sur mesure et construisons vos outils digitaux — pour que votre entreprise aille plus vite.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                background: '#359BD9',
                color: '#fff',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.01em',
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
              Parler de votre projet
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '13px 28px',
                background: 'transparent',
                color: '#F2F4F6',
                borderRadius: '6px',
                border: '1px solid rgba(165,172,181,0.25)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'border-color 0.18s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(53,155,217,0.50)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(165,172,181,0.25)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              Découvrir CA-TECH
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats band */}
      <motion.div
        variants={item}
        initial="hidden"
        animate="visible"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          zIndex: 1,
          borderTop: '1px solid rgba(165,172,181,0.08)',
          background: 'rgba(5,16,30,0.50)',
          backdropFilter: 'blur(8px)',
          padding: '16px 24px',
          display: 'flex',
          gap: '40px',
          flexWrap: 'wrap',
        }}
        className="md:px-12 xl:px-20"
      >
        {[
          { value: '50+', label: 'Projets livrés' },
          { value: '< 24h', label: 'Délai de réponse' },
          { value: '100%', label: 'Équipe basée en France' },
        ].map(stat => (
          <div key={stat.label} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '18px', fontWeight: 600,
              color: '#F2F4F6', letterSpacing: '-0.02em',
            }}>{stat.value}</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px', color: 'rgba(165,172,181,0.55)',
            }}>{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
