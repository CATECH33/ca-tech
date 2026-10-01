import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { SectionHeading } from './SectionHeading'
import { Tag } from '../ui/Tag'
import { Link } from 'react-router-dom'
import { ArrowRight, Cpu } from 'lucide-react'
import { staggerContainer, staggerFast, fadeUp, scaleReveal, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const AI_TAGS = ['Qualification leads', 'Diagnostic IA', 'Génération devis', 'Rapport automatique', 'RAG documentaire', 'Agents métier', 'Intégration CRM', 'LLM sur-mesure']

const LOIC_REPLY = 'Parfait. Pour 50 leads/mois, un agent IA de qualification peut automatiser 80% des échanges initiaux. Vous économiserez en moyenne 8–12h/semaine. Je vous prépare une proposition concrète ?'

function TypedText({ text, startDelay = 1600, speed = 16 }) {
  const prefersReduced = useReducedMotion()
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (prefersReduced) { setDisplayed(text); return }
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) clearInterval(interval)
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [text, startDelay, speed, prefersReduced])

  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#F2F4F6', lineHeight: 1.5, margin: 0 }}>
      {displayed || <span style={{ opacity: 0 }}>{text[0]}</span>}
      {displayed.length > 0 && displayed.length < text.length && (
        <span style={{ display: 'inline-block', width: '2px', height: '13px', background: '#359BD9', verticalAlign: 'text-bottom', animation: 'blink 0.8s step-end infinite', marginLeft: '1px' }} />
      )}
    </p>
  )
}

function LoicInterface({ prefersReduced = false }) {
  return (
    <div style={{
      background: '#102740',
      borderRadius: '16px',
      border: '1px solid rgba(53,155,217,0.20)',
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.40)',
      position: 'relative',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: '-20px',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(53,155,217,0.08), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Browser chrome */}
      <div style={{
        padding: '10px 16px',
        background: 'rgba(5,16,30,0.70)',
        borderBottom: '1px solid rgba(165,172,181,0.06)',
        display: 'flex', alignItems: 'center', gap: '10px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(165,172,181,0.18)' }} />
          ))}
        </div>
        <div style={{
          flex: 1, background: 'rgba(165,172,181,0.05)', borderRadius: '4px',
          padding: '4px 0', textAlign: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(165,172,181,0.35)', letterSpacing: '0.03em' }}>
            loic.ca-tech.fr
          </span>
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(165,172,181,0.08)',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(5,16,30,0.40)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #359BD9, #1A4066)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Cpu size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#F2F4F6' }}>Loïc — Agent IA CA-TECH</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A5ACB5' }}>En ligne · Disponible 24h/24</span>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1, minHeight: '280px' }}>
        {/* Message bot 1 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #359BD9, #1E6A96)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fff', fontWeight: 700 }}>L</span>
          </div>
          <div style={{
            background: 'rgba(53,155,217,0.10)',
            border: '1px solid rgba(53,155,217,0.15)',
            borderRadius: '0 12px 12px 12px',
            padding: '12px 16px', maxWidth: '85%',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#F2F4F6', lineHeight: 1.5, margin: 0 }}>
              Bonjour ! Je suis Loïc, votre consultant IA CA-TECH. En quelques questions, je peux analyser votre situation et identifier comment l'IA peut vous faire gagner du temps et des revenus.
            </p>
          </div>
        </div>

        {/* Message utilisateur */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(165,172,181,0.12)',
            borderRadius: '12px 0 12px 12px',
            padding: '12px 16px', maxWidth: '80%',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#F2F4F6', lineHeight: 1.5, margin: 0 }}>
              Nous recevons environ 50 leads par mois et notre équipe passe trop de temps à les qualifier manuellement.
            </p>
          </div>
        </div>

        {/* Réponse bot typée */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #359BD9, #1E6A96)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fff', fontWeight: 700 }}>L</span>
          </div>
          <div style={{
            background: 'rgba(53,155,217,0.10)',
            border: '1px solid rgba(53,155,217,0.15)',
            borderRadius: '0 12px 12px 12px',
            padding: '12px 16px', maxWidth: '85%',
          }}>
            {prefersReduced ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#F2F4F6', lineHeight: 1.5, margin: 0 }}>
                {LOIC_REPLY}
              </p>
            ) : (
              <TypedText text={LOIC_REPLY} />
            )}
          </div>
        </div>

        {/* Typing dots */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #359BD9, #1E6A96)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fff', fontWeight: 700 }}>L</span>
          </div>
          <div style={{ background: 'rgba(53,155,217,0.10)', border: '1px solid rgba(53,155,217,0.15)', borderRadius: '0 12px 12px 12px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#359BD9', display: 'inline-block' }}
                  animate={prefersReduced ? {} : { opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: prefersReduced ? 0 : Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AIShowcaseSection() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const contF = prefersReduced ? {} : staggerFast
  const item  = prefersReduced ? {} : fadeUp
  const visual = prefersReduced ? {} : scaleReveal

  return (
    <Section bg="canvas" id="ia">
      <Container>
        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">
          {/* Text */}
          <motion.div
            className="md:col-span-5"
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <SectionHeading
              eyebrow="Intelligence artificielle"
              headline="Des agents IA qui travaillent pour vous. Pas à votre place."
              description="Loïc, notre premier agent IA, est disponible 24h/24. Il qualifie vos prospects, génère des devis, produit des rapports. Voici comment il fonctionne."
              align="left"
              headlineSize="heading-xl"
            />

            <motion.div variants={contF} style={{ marginTop: '32px' }}>
              <div className="flex flex-wrap gap-2">
                {AI_TAGS.map((tag) => (
                  <motion.div key={tag} variants={item}>
                    <Tag>{tag}</Tag>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item} style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
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
                Parler à CA-TECH
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/services/ia"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '12px 0',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: '#359BD9', textDecoration: 'none',
                  transition: 'color 0.18s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#4AAEE0'}
                onMouseLeave={e => e.currentTarget.style.color = '#359BD9'}
              >
                Voir tous nos agents IA →
              </Link>
            </motion.div>
          </motion.div>

          {/* Loïc interface — sticky */}
          <motion.div
            className="md:col-span-7"
            variants={visual}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            style={{ position: 'sticky', top: '80px' }}
          >
            <LoicInterface prefersReduced={prefersReduced} />
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
