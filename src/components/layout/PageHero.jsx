import { motion } from 'framer-motion'
import { Container } from './Container'
import { staggerContainer, fadeUp, fadeUpHeadline, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

export function PageHero({ eyebrow, title, description, children }) {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const item  = prefersReduced ? {} : fadeUp
  const itemH = prefersReduced ? {} : fadeUpHeadline

  return (
    <section style={{
      minHeight: '52vh',
      paddingTop: 'calc(64px + 80px)',
      paddingBottom: '80px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#05101E',
    }}>
      {/* Dot grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(165,172,181,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '0%', left: '50%', transform: 'translateX(-50%)',
        width: '120%', height: '100%',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(53,155,217,0.09) 0%, rgba(53,155,217,0.03) 45%, transparent 68%)',
        pointerEvents: 'none',
      }} />
      {/* Bottom fade */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(to bottom, transparent, #05101E)',
        pointerEvents: 'none',
      }} />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={cont}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: '760px' }}
        >
          {eyebrow && (
            <motion.span variants={item} style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#359BD9',
              marginBottom: '20px',
            }}>
              {eyebrow}
            </motion.span>
          )}

          <motion.h1
            variants={itemH}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#F2F4F6',
              marginBottom: '24px',
              textWrap: 'balance',
            }}
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p variants={item} style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(17px, 1.8vw, 20px)',
              lineHeight: 1.65,
              color: '#A5ACB5',
              maxWidth: '640px',
              marginBottom: children ? '40px' : '0',
            }}>
              {description}
            </motion.p>
          )}

          {children && (
            <motion.div variants={item}>
              {children}
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  )
}
