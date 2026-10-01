import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { SectionHeading } from './SectionHeading'
import { Tag } from '../ui/Tag'
import { Link } from 'react-router-dom'
import { staggerContainer, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { SYSTEM_DOMAINS } from '../../lib/constants'
import { Cloud, Database, Plug, Shield, Activity, Layers } from 'lucide-react'

const DOMAIN_ICONS = { Cloud, Database, Plug, Shield, Activity, Layers }

const STACK_TAGS = ['Vercel', 'Supabase', 'Node.js', 'Python', 'PostgreSQL', 'React', 'Docker', 'GitHub']

function DomainItem({ domain, index, prefersReduced }) {
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.06, duration: 0.50, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ position: 'relative', height: '1px', background: 'rgba(165,172,181,0.07)', marginBottom: '0' }}>
        <motion.div
          initial={prefersReduced ? {} : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: index * 0.06 + 0.07, duration: 0.50, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(53,155,217,0.22)', transformOrigin: 'left' }}
        />
      </div>
      <div style={{ padding: '22px 0 26px' }}>
        {(() => {
          const Icon = DOMAIN_ICONS[domain.icon]
          return Icon ? (
            <div style={{ marginBottom: '10px' }}>
              <Icon size={20} color="#359BD9" aria-hidden="true" />
            </div>
          ) : null
        })()}
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '15px',
          fontWeight: 600, color: '#F2F4F6', marginBottom: '6px',
        }}>
          {domain.title}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '13px',
          color: '#A5ACB5', lineHeight: 1.55,
        }}>
          {domain.description}
        </div>
      </div>
    </motion.div>
  )
}

export function SystemsSection() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const item = prefersReduced ? {} : fadeUp

  const col1 = SYSTEM_DOMAINS.slice(0, 3)
  const col2 = SYSTEM_DOMAINS.slice(3)

  return (
    <Section bg="canvas" id="systemes" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(53,155,217,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(53,155,217,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeading
          eyebrow="Systèmes · Infrastructure · Data"
          headline="L'architecture qui supporte votre croissance."
          description="De l'API au cloud, du pipeline data à la cybersécurité — nous concevons des systèmes qui tiennent quand ça compte."
          align="left"
          headlineSize="display-md"
          maxWidth="640px"
        />

        {/* Two-column domain list */}
        <div
          className="grid grid-cols-1 md:grid-cols-12"
          style={{ marginTop: '72px', gap: '0' }}
        >
          {/* Left 8/12 — domains in 2 sub-columns */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ columnGap: '48px' }}>
              <div>
                {col1.map((domain, i) => (
                  <DomainItem key={domain.title} domain={domain} index={i} prefersReduced={prefersReduced} />
                ))}
              </div>
              <div>
                {col2.map((domain, i) => (
                  <DomainItem key={domain.title} domain={domain} index={i + 3} prefersReduced={prefersReduced} />
                ))}
              </div>
            </div>
          </div>

          {/* Right 4/12 — stack + CTA */}
          <div
            className="md:col-span-4 mt-12 md:mt-0"
            style={{ paddingLeft: '0' }}
          >
            <div
              className="md:border-l"
              style={{ paddingLeft: '0' }}
            >
              <div className="md:pl-12">
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px',
                  letterSpacing: '0.08em', color: 'rgba(165,172,181,0.35)',
                  textTransform: 'uppercase', fontWeight: 500, marginBottom: '20px',
                }}>
                  Stack technique
                </div>

                <motion.div
                  variants={cont}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '32px' }}
                >
                  {STACK_TAGS.map(tag => (
                    <motion.div key={tag} variants={item}>
                      <Tag>{tag}</Tag>
                    </motion.div>
                  ))}
                </motion.div>

                <div style={{ height: '1px', background: 'rgba(165,172,181,0.07)', marginBottom: '28px' }} />

                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: '#A5ACB5', lineHeight: 1.6,
                  marginBottom: '24px',
                }}>
                  Chaque projet est construit sur une infrastructure robuste, scalable et documentée — prête pour la production dès le premier sprint.
                </p>

                <Link
                  to="/contact"
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px',
                    color: '#359BD9', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    transition: 'color 0.18s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4AAEE0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#359BD9'}
                >
                  Infrastructure & Conseil →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
