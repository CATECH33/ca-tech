import { useState } from 'react'
import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { Tag } from '../ui/Tag'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { staggerContainer, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { EXPERTISE_CARDS } from '../../lib/constants'
import { Brain, Zap, Network, Server, Code2 } from 'lucide-react'

const EXPERTISE_ICONS = { Brain, Zap, Network, Server, Code2 }

function ExpertiseRow({ card, index, prefersReduced }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top line */}
      <div style={{ position: 'relative', height: '1px', background: 'rgba(165,172,181,0.08)' }}>
        {!prefersReduced && (
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ delay: index * 0.07 + 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', inset: 0,
              background: hovered ? '#359BD9' : 'rgba(53,155,217,0.25)',
              transformOrigin: 'left',
              transition: 'background 0.22s ease',
            }}
          />
        )}
        {prefersReduced && (
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered ? '#359BD9' : 'rgba(53,155,217,0.25)',
            transition: 'background 0.22s ease',
          }} />
        )}
      </div>

      {/* Row content */}
      <div
        className="grid grid-cols-1 md:grid-cols-12"
        style={{
          padding: '28px 0 32px',
          gap: '24px',
          transform: hovered && !prefersReduced ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'transform 0.22s ease',
          cursor: 'default',
        }}
      >
        {/* Title + description */}
        <div className="md:col-span-7">
          {(() => {
            const Icon = EXPERTISE_ICONS[card.icon]
            return Icon ? (
              <div style={{ marginBottom: '10px' }}>
                <Icon size={20} color="#359BD9" aria-hidden="true" />
              </div>
            ) : null
          })()}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(16px, 1.6vw, 22px)',
            fontWeight: 600,
            color: '#F2F4F6',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            marginBottom: '10px',
          }}>
            {card.title}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: '#A5ACB5', lineHeight: 1.6,
            maxWidth: '480px',
          }}>
            {card.description}
          </p>
        </div>

        {/* Tags + link */}
        <div className="md:col-span-5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {card.tags.map(tag => (
              <Tag key={tag} className={hovered ? 'border-[rgba(53,155,217,0.35)] text-[rgba(53,155,217,0.90)]' : 'opacity-60'}>
                {tag}
              </Tag>
            ))}
          </div>
          <Link
            to={card.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: '#359BD9', textDecoration: 'none',
              transition: 'color 0.15s ease',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#4AAEE0'}
            onMouseLeave={e => e.currentTarget.style.color = '#359BD9'}
          >
            En savoir plus <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function ExpertiseSection() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const item = prefersReduced ? {} : fadeUp

  return (
    <Section bg="panel" id="expertises">
      <Container>

        {/* Header */}
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginBottom: '0' }}
        >
          <motion.div variants={item} style={{ marginBottom: '20px' }}>
            <Eyebrow>Expertises</Eyebrow>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12" style={{ gap: '24px', alignItems: 'flex-end' }}>
            <motion.h2
              variants={item}
              className="md:col-span-7"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 52px)',
                fontWeight: 700,
                color: '#F2F4F6',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
              }}
            >
              Tout ce qu'il faut pour construire et faire croître.
            </motion.h2>

            <motion.p
              variants={item}
              className="md:col-span-5"
              style={{
                fontFamily: 'var(--font-body)', fontSize: '15px',
                color: '#A5ACB5', lineHeight: 1.65,
              }}
            >
              Cinq pôles d'expertise. Une seule approche : livrer ce qui compte, mesurer ce qui fonctionne.
            </motion.p>
          </div>
        </motion.div>

        {/* Editorial list */}
        <div style={{ marginTop: '64px' }}>
          {EXPERTISE_CARDS.map((card, i) => (
            <ExpertiseRow key={card.id} card={card} index={i} prefersReduced={prefersReduced} />
          ))}
          {/* Bottom line */}
          <div style={{ height: '1px', background: 'rgba(165,172,181,0.08)' }} />
        </div>

        <motion.div
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginTop: '48px' }}
        >
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 24px',
              border: '1px solid rgba(53,155,217,0.35)',
              borderRadius: '6px',
              background: 'transparent',
              color: '#F2F4F6',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500,
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'border-color 0.18s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#359BD9'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(53,155,217,0.35)'}
          >
            Démarrer un projet
            <ArrowRight size={13} />
          </Link>
        </motion.div>

      </Container>
    </Section>
  )
}
