import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { SectionHeading } from './SectionHeading'
import { Tag } from '../ui/Tag'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import { staggerContainer, staggerFast, fadeUp, scaleReveal, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const WORKFLOW_NODES = [
  { id: 'trigger', label: 'Trigger', sub: 'Nouveau lead formulaire', color: '#22C55E' },
  { id: 'qualify', label: 'Qualification', sub: 'Loïc analyse le profil', color: '#359BD9' },
  { id: 'crm', label: 'CRM Update', sub: 'Fiche créée automatiquement', color: '#359BD9' },
  { id: 'email', label: 'Email', sub: 'Sequence personnalisée', color: '#4AAEE0' },
  { id: 'devis', label: 'Devis Auto', sub: 'PDF généré et envoyé', color: '#359BD9' },
]

const TOOL_TAGS = ['n8n', 'Make', 'Zapier', 'Scripts Node', 'Python', 'APIs']

function WorkflowDiagram() {
  const prefersReduced = useReducedMotion()
  return (
    <div style={{
      background: '#102740',
      borderRadius: '24px',
      border: '1px solid rgba(165,172,181,0.10)',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '24px',
        backgroundImage: 'linear-gradient(rgba(53,155,217,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(53,155,217,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Nodes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', paddingBottom: '8px' }}>
        {WORKFLOW_NODES.map((node, i) => (
          <div key={node.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(5,16,30,0.60)',
                border: `1px solid ${node.color}40`,
                borderRadius: '12px',
                padding: '16px',
                minWidth: '130px',
                cursor: 'default',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
              whileHover={prefersReduced ? {} : { borderColor: node.color }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.color, marginBottom: '12px' }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#F2F4F6', marginBottom: '4px' }}>{node.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#A5ACB5', lineHeight: 1.3 }}>{node.sub}</div>
            </motion.div>
            {i < WORKFLOW_NODES.length - 1 && (
              <div style={{ padding: '0 8px', flexShrink: 0 }}>
                <motion.div
                  initial={prefersReduced ? {} : { scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.15, duration: 0.3 }}
                  style={{ transformOrigin: 'left' }}
                >
                  <ArrowRight size={16} color="rgba(165,172,181,0.30)" />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Result */}
      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.20)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Exemple de workflow</span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#F2F4F6', margin: '4px 0 0' }}>
            Tâches répétitives éliminées — zéro intervention humaine
          </p>
        </div>
        <Zap size={24} color="#22C55E" />
      </div>

      {/* Tool icons — à reconstruire avec les nouveaux assets */}
    </div>
  )
}

export function AutomationSection() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const contF = prefersReduced ? {} : staggerFast
  const item  = prefersReduced ? {} : fadeUp
  const visual = prefersReduced ? {} : scaleReveal

  return (
    <Section bg="panel" id="automatisation">
      <Container>
        <SectionHeading
          eyebrow="Automatisation"
          headline="Vos process s'exécutent. Vous vous concentrez sur l'essentiel."
          description="Un workflow automatisé qui élimine les tâches répétitives : de la capture du lead à la facturation, sans intervention humaine."
          align="left"
          headlineSize="display-md"
          maxWidth="640px"
        />

        <motion.div
          variants={visual}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginTop: '64px' }}
        >
          <WorkflowDiagram />
        </motion.div>

        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        >
          {TOOL_TAGS.map(tag => (
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
          style={{ marginTop: '32px' }}
        >
          <Link
            to="/services/automatisation"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px',
              background: '#359BD9', color: '#fff',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.18s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4AAEE0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#359BD9'; e.currentTarget.style.transform = 'none' }}
          >
            Voir une démo d'automatisation
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </Container>
    </Section>
  )
}
