import { motion } from 'framer-motion'
import { Eyebrow } from '../ui/Eyebrow'
import { fadeUpHeadline, fadeUp, staggerContainer, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

export function SectionHeading({
  eyebrow,
  headline,
  description,
  align = 'left',   // 'left' | 'center'
  headlineSize = 'display-md', // 'hero' | 'display' | 'display-md' | 'heading-xl' | 'heading'
  className = '',
  maxWidth,
}) {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const itemH = prefersReduced ? {} : fadeUpHeadline
  const item  = prefersReduced ? {} : fadeUp

  const fontSizes = {
    hero:       'clamp(40px, 6vw, 80px)',
    display:    'clamp(36px, 5vw, 64px)',
    'display-md': 'clamp(32px, 4vw, 48px)',
    'heading-xl': 'clamp(28px, 3.5vw, 40px)',
    heading:    'clamp(24px, 3vw, 32px)',
  }

  const textAlign = align === 'center' ? 'center' : 'left'
  const mx = align === 'center' ? 'auto' : undefined

  return (
    <motion.div
      className={className}
      variants={cont}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      style={{ textAlign, maxWidth: maxWidth || (align === 'center' ? '800px' : undefined), marginLeft: mx, marginRight: mx }}
    >
      {eyebrow && (
        <motion.div variants={item} style={{ marginBottom: '16px' }}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>
      )}
      {headline && (
        <motion.h2
          variants={itemH}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: fontSizes[headlineSize] || fontSizes['display-md'],
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: '#F2F4F6',
            marginBottom: description ? '20px' : 0,
          }}
        >
          {headline}
        </motion.h2>
      )}
      {description && (
        <motion.p
          variants={item}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            lineHeight: 1.6,
            color: '#A5ACB5',
          }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
