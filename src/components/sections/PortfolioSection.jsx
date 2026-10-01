import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { Showcase } from '../showcase/Showcase'
import { ShowcaseNav } from '../showcase/ShowcaseNav'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { PORTFOLIO_PROJECTS } from '../../lib/constants'

function ProjectSlide({ project }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12" style={{ gap: '48px', alignItems: 'center', paddingTop: '40px' }}>

      {/* Info — left */}
      <div className="md:col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          background: 'rgba(53,155,217,0.10)',
          border: '1px solid rgba(53,155,217,0.22)',
          borderRadius: '999px',
          padding: '4px 12px',
          marginBottom: '20px',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#359BD9', fontWeight: 600, letterSpacing: '0.04em' }}>
            {project.type}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 2.6vw, 38px)',
          fontWeight: 700,
          color: '#F2F4F6',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          marginBottom: '14px',
        }}>
          {project.title}
        </h3>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: '#A5ACB5',
          lineHeight: 1.65,
          maxWidth: '380px',
          marginBottom: '20px',
        }}>
          {project.description}
        </p>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: '#22C55E',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          {project.metric}
        </div>

        {project.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-body)', fontSize: '11px',
                color: 'rgba(165,172,181,0.55)',
                border: '1px solid rgba(165,172,181,0.12)',
                borderRadius: '4px',
                padding: '4px 8px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          to={`/projets/${project.slug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
            padding: '10px 22px',
            background: '#359BD9', color: '#fff',
            borderRadius: '6px',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.18s ease, transform 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4AAEE0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#359BD9'; e.currentTarget.style.transform = 'none' }}
        >
          Voir le projet <ArrowRight size={14} />
        </Link>
      </div>

      {/* Image — right */}
      <div className="md:col-span-7">
        <div style={{
          aspectRatio: '16/10',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #102740 0%, #0A2030 100%)',
          border: '1px solid rgba(165,172,181,0.10)',
          position: 'relative',
        }}>
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '65%', opacity: 0.35 }}>
                <div style={{ height: '6px', width: '45%', background: 'rgba(255,255,255,0.25)', borderRadius: '3px', marginBottom: '10px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: '32px', background: 'rgba(53,155,217,0.20)', borderRadius: '4px' }} />)}
                </div>
                <div style={{ height: '54px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PortfolioSection() {
  const prefersReduced = useReducedMotion()

  return (
    <Section bg="panel" id="realisations">
      <Container>

        {/* Header */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}
        >
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Eyebrow>Réalisations</Eyebrow>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              fontWeight: 700,
              color: '#F2F4F6',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
            }}>
              Construit, livré, mesuré.
            </h2>
          </div>

          <Link
            to="/projets"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: '#A5ACB5', textDecoration: 'none',
              border: '1px solid rgba(165,172,181,0.18)',
              borderRadius: '6px', padding: '8px 16px',
              transition: 'border-color 0.15s ease, color 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#359BD9'; e.currentTarget.style.color = '#F2F4F6' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(165,172,181,0.18)'; e.currentTarget.style.color = '#A5ACB5' }}
          >
            Tous les projets <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* Showcase */}
        <motion.div
          variants={prefersReduced ? {} : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <Showcase
            slides={PORTFOLIO_PROJECTS}
            ariaLabel="Réalisations CA-TECH"
            renderSlide={(project) => <ProjectSlide project={project} />}
            renderNav={({ active, total, onPrev, onNext }) => (
              <ShowcaseNav active={active} total={total} onPrev={onPrev} onNext={onNext} />
            )}
          />
        </motion.div>

      </Container>
    </Section>
  )
}
