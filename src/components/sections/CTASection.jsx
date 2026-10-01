import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { ArrowRight } from 'lucide-react'
import { fadeUpHeadline, fadeUp, staggerContainer, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { ButtonLink } from '../ui/button-link'
import { Badge } from '../ui/badge'

export function CTASection() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const item = prefersReduced ? {} : fadeUp
  const itemH = prefersReduced ? {} : fadeUpHeadline

  return (
    <Section
      bg="canvas"
      id="contact"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
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
        background: 'radial-gradient(ellipse at 50% 30%, rgba(53,155,217,0.10) 0%, rgba(53,155,217,0.03) 45%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}
        >
          {/* Badge */}
          <motion.div variants={item} style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <Badge
              variant="outline"
              className="gap-2 px-4 py-1.5 h-auto rounded-full border-[rgba(34,197,94,0.25)] text-[rgba(34,197,94,0.85)] bg-[rgba(34,197,94,0.06)] text-xs font-medium"
            >
              <span className="size-1.5 rounded-full bg-[#22C55E] shrink-0" />
              Disponible maintenant
            </Badge>
          </motion.div>

          <motion.h2
            variants={itemH}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.5vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#F2F4F6',
              marginBottom: '24px',
              textWrap: 'balance',
            }}
          >
            Prêt à transformer votre croissance ?
          </motion.h2>

          <motion.p
            variants={item}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#A5ACB5',
              maxWidth: '500px',
              margin: '0 auto 44px',
            }}
          >
            Loïc analyse votre situation en 15 minutes et vous propose un plan d'action concret. Sans engagement.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '44px' }}
          >
            <ButtonLink
              to="/contact"
              variant="default"
              size="lg"
              className="gap-2.5 px-8 text-[15px] font-bold shadow-[0_0_0_1px_rgba(53,155,217,0.35),0_8px_36px_rgba(53,155,217,0.30)] hover:shadow-[0_0_0_1px_rgba(53,155,217,0.5),0_16px_48px_rgba(53,155,217,0.40)] hover:-translate-y-0.5 transition-all"
            >
              Parler de votre projet
              <ArrowRight size={17} />
            </ButtonLink>
            <ButtonLink
              to="/devis"
              variant="outline"
              size="lg"
              className="px-7 text-[15px] font-medium"
            >
              Demander un devis
            </ButtonLink>
          </motion.div>

          {/* Trust */}
          <motion.div
            variants={item}
            style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px' }}
          >
            {['SIRET 93344494500012', 'Basé en France', 'Réponse < 24h'].map(badge => (
              <span key={badge} style={{
                fontFamily: 'var(--font-body)', fontSize: '11px',
                color: 'rgba(165,172,181,0.40)',
                letterSpacing: '0.04em',
              }}>
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}
