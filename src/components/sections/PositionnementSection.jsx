import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { staggerContainer, staggerFast, fadeUp, fadeUpHeadline, counterReveal, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { useCountUp } from '../../lib/hooks/useCountUp'
import { METRICS } from '../../lib/constants'

const CAPACITES = [
  'IA générative',
  'Automatisation',
  'LLM & MCP',
  'Développement web sur mesure',
  'Systèmes digitaux',
  'Infrastructure & Intégration',
]

function MetricItem({ metric, index, prefersReduced }) {
  const numericStr = metric.value.replace(/[^0-9]/g, '')
  const numeric = parseInt(numericStr, 10) || 0
  const isStatic = !numeric || metric.value.startsWith('<')
  const [count, ref] = useCountUp(isStatic ? 0 : numeric)

  const displayValue = isStatic
    ? metric.value
    : metric.value.replace(numericStr, String(count))

  const item = prefersReduced ? {} : counterReveal

  return (
    <motion.div
      ref={ref}
      variants={item}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(22px, 2.5vw, 32px)',
        fontWeight: 600,
        color: '#F2F4F6',
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>
        {displayValue}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: '#A5ACB5',
        lineHeight: 1.4,
        maxWidth: '180px',
      }}>
        {metric.label}
      </div>
    </motion.div>
  )
}

export function PositionnementSection() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const contF = prefersReduced ? {} : staggerFast
  const itemH = prefersReduced ? {} : fadeUpHeadline
  const item  = prefersReduced ? {} : fadeUp

  return (
    <Section bg="panel" id="positionnement">
      <Container>

        {/* ── Bande 1 : Introduction ─────────────────────────────────── */}
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginBottom: '80px' }}
        >
          <motion.div variants={item} style={{ marginBottom: '24px' }}>
            <Eyebrow>Notre positionnement</Eyebrow>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '48px', alignItems: 'start' }}>
            <motion.h2
              variants={itemH}
              className="lg:col-span-7"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4.5vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                color: '#F2F4F6',
                textWrap: 'balance',
              }}
            >
              IA, automatisation, développement web —{' '}
              <span style={{ color: 'rgba(242,244,246,0.35)' }}>un seul cabinet.</span>
            </motion.h2>

            <motion.div variants={item} className="lg:col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px', lineHeight: 1.75,
                color: '#A5ACB5',
              }}>
                CA-TECH conçoit et déploie des systèmes digitaux fondés sur l'IA générative, les LLM, le MCP et l'automatisation.
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px', lineHeight: 1.70,
                color: 'rgba(165,172,181,0.70)',
              }}>
                Nous ne nous limitons pas à créer des interfaces. Nous concevons des solutions complètes : intelligences, workflows, applications Web sur mesure et infrastructures digitales pensées pour répondre aux enjeux réels de votre entreprise.
              </p>
            </motion.div>
          </div>

          {/* Capacités */}
          <motion.div
            variants={contF}
            style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}
          >
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px', letterSpacing: '0.08em',
              color: 'rgba(165,172,181,0.35)', textTransform: 'uppercase',
              fontWeight: 500, display: 'flex', alignItems: 'center',
              marginRight: '6px',
            }}>
              Capacités
            </div>
            {CAPACITES.map(cap => (
              <motion.span
                key={cap}
                variants={item}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px', fontWeight: 500,
                  color: 'rgba(165,172,181,0.65)',
                  border: '1px solid rgba(165,172,181,0.12)',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  letterSpacing: '0.01em',
                }}
              >
                {cap}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Bande 2 : Métriques avec count-up ─────────────────────── */}
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{
            borderTop: '1px solid rgba(165,172,181,0.08)',
            borderBottom: '1px solid rgba(165,172,181,0.08)',
            padding: '40px 0',
            marginBottom: '56px',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '40px' }}>
            {METRICS.map((metric, i) => (
              <MetricItem
                key={metric.label}
                metric={metric}
                index={i}
                prefersReduced={prefersReduced}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Bande 3 : Citation éditoriale ─────────────────────────── */}
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
        >
          <blockquote style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(18px, 2vw, 26px)',
            fontStyle: 'italic',
            fontWeight: 500,
            color: 'rgba(242,244,246,0.45)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            margin: 0,
          }}>
            "Pas une agence. Un cabinet qui exécute."
          </blockquote>
        </motion.div>

      </Container>
    </Section>
  )
}
