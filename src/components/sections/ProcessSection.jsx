import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { SectionHeading } from './SectionHeading'
import { Link } from 'react-router-dom'
import { staggerContainer, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { PROCESS_STEPS } from '../../lib/constants'


export function ProcessSection() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const item = prefersReduced ? {} : fadeUp

  return (
    <Section bg="canvas" id="process">
      <Container>
        <SectionHeading
          eyebrow="Notre méthode"
          headline="Un process clair. Des jalons tenus."
          description="De la première conversation à la livraison — voici exactement comment ça se passe."
          align="center"
          headlineSize="display-md"
        />

        {/* Timeline */}
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginTop: '64px' }}
        >
          {/* Desktop : horizontal */}
          <div className="hidden md:flex" style={{ alignItems: 'flex-start', position: 'relative' }}>
            {/* Connection line */}
            <motion.div
              initial={prefersReduced ? {} : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{
                position: 'absolute',
                top: '7px',
                left: '2%',
                right: '2%',
                height: '1px',
                background: 'rgba(53,155,217,0.18)',
                transformOrigin: 'left',
              }}
            />

            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={item}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '0 8px',
                  position: 'relative',
                  zIndex: 1,
                  cursor: 'default',
                }}
              >
                {/* Step marker */}
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: '#05101E',
                  border: '1px solid rgba(53,155,217,0.40)',
                  boxShadow: '0 0 0 4px rgba(53,155,217,0.07)',
                  marginBottom: '20px',
                  flexShrink: 0,
                }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px', fontWeight: 600,
                  color: '#F2F4F6', marginBottom: '6px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px', color: '#A5ACB5',
                  lineHeight: 1.5, marginBottom: '6px',
                }}>
                  {step.description}
                </p>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'rgba(53,155,217,0.55)',
                }}>
                  {step.duration}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mobile : vertical */}
          <div className="flex md:hidden" style={{ flexDirection: 'column', gap: '0', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '7px', bottom: '20px', left: '6px',
              width: '1px',
              background: 'rgba(53,155,217,0.18)',
            }} />

            {PROCESS_STEPS.map((step) => (
              <motion.div
                key={step.title}
                variants={item}
                style={{ display: 'flex', gap: '20px', paddingBottom: '28px', position: 'relative', zIndex: 1 }}
              >
                <div style={{
                  width: '28px', height: '28px', flexShrink: 0, marginTop: '2px',
                  borderRadius: '50%',
                  background: '#05101E',
                  border: '1px solid rgba(53,155,217,0.40)',
                  boxShadow: '0 0 0 3px rgba(53,155,217,0.07)',
                }} />
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px', fontWeight: 600,
                    color: '#F2F4F6', marginBottom: '4px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px', color: '#A5ACB5',
                    lineHeight: 1.5, marginBottom: '3px',
                  }}>
                    {step.description}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'rgba(53,155,217,0.55)',
                  }}>
                    {step.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Durée + CTA */}
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{
            marginTop: '48px', paddingTop: '40px',
            borderTop: '1px solid rgba(165,172,181,0.08)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px',
          }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#A5ACB5' }}>
              Durée indicative :{' '}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#F2F4F6' }}>
              4 à 8 semaines selon la mission
            </span>
          </div>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              background: '#359BD9', color: '#fff',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.18s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4AAEE0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#359BD9'; e.currentTarget.style.transform = 'none' }}
          >
            Démarrer un diagnostic gratuit
          </Link>
        </motion.div>
      </Container>
    </Section>
  )
}
