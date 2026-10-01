import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { Tag } from '../ui/Tag'
import { Link } from 'react-router-dom'
import { staggerContainer, staggerFast, fadeUp, fadeUpHeadline, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const LLM_BLOCKS = [
  {
    title: 'LLM sur-mesure',
    description: 'Fine-tuning, RAG, prompt engineering, évaluation de modèles. Nous adaptons les LLM à votre domaine métier.',
  },
  {
    title: 'Architectures agents',
    description: 'Systèmes multi-agents, mémoire longue terme, routage contextuel, orchestration. Des IA qui collaborent.',
  },
  {
    title: 'Protocoles MCP',
    description: 'Context servers, tool-calling, intégrations systèmes. L\'IA connectée à vos outils existants.',
  },
]

const TECH_TAGS = ['OpenAI', 'Anthropic', 'Llama', 'LangChain', 'Supabase', 'Python', 'Node.js']

export function LLMSection() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const contF = prefersReduced ? {} : staggerFast
  const item  = prefersReduced ? {} : fadeUp
  const itemH = prefersReduced ? {} : fadeUpHeadline

  // Word-by-word headline
  const headline = 'Des systèmes qui pensent, connectés à vos outils.'
  const words = headline.split(' ')

  return (
    <Section bg="canvas" id="llm" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glow radial en haut */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '400px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(53,155,217,0.10), transparent 60%)',
        pointerEvents: 'none',
        animation: prefersReduced ? 'none' : 'glowPulse 4s ease-in-out infinite',
      }} />

      <Container>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={item}
            style={{ marginBottom: '24px' }}
          >
            <Eyebrow>LLM · Agents · MCP</Eyebrow>
          </motion.div>

          {/* Word-by-word headline */}
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#F2F4F6',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 12px',
            }}
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#A5ACB5',
              maxWidth: '640px',
            }}
          >
            Nous concevons des architectures IA sur-mesure : RAG, chaînes d'agents, protocoles MCP, mémoire longue terme, routage contextuel.
          </motion.p>
        </div>

        {/* 3 blocs techniques */}
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid md:grid-cols-3 gap-0"
          style={{ marginTop: '80px', borderTop: '1px solid rgba(165,172,181,0.08)', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {LLM_BLOCKS.map((block) => (
            <motion.div
              key={block.title}
              variants={item}
              style={{
                padding: '40px 32px',
                borderRight: '1px solid rgba(165,172,181,0.08)',
                transition: 'background 0.2s ease',
                cursor: 'default',
              }}
              whileHover={prefersReduced ? {} : { background: 'rgba(16,39,64,0.6)' }}
              className="last:border-r-0"
            >
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: '#F2F4F6',
                marginBottom: '12px',
                lineHeight: 1.2,
              }}>
                {block.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: '#A5ACB5',
                lineHeight: 1.6,
              }}>
                {block.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech tags */}
        <motion.div
          variants={contF}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginTop: '48px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {TECH_TAGS.map(tag => (
            <motion.div key={tag} variants={item}>
              <Tag>{tag}</Tag>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginTop: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
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
            Discuter d'un projet IA
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/services/ia"
            style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: '#359BD9', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.18s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#4AAEE0'}
            onMouseLeave={e => e.currentTarget.style.color = '#359BD9'}
          >
            Voir notre expertise IA →
          </Link>
        </motion.div>
      </Container>
    </Section>
  )
}
