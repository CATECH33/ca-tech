import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Section } from '../layout/Section'
import { Container } from '../layout/Container'
import { SectionHeading } from './SectionHeading'
import { Tag } from '../ui/Tag'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { staggerContainer, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'
import { PORTFOLIO_PROJECTS } from '../../lib/constants'

function ProjectPlaceholder({ project, index }) {
  const colors = [
    { bg: 'linear-gradient(135deg, #1A4066 0%, #102740 100%)', accent: '#359BD9' },
    { bg: 'linear-gradient(135deg, #102740 0%, #0A2030 100%)', accent: '#4AAEE0' },
    { bg: 'linear-gradient(135deg, #0A2030 0%, #1A4066 100%)', accent: '#359BD9' },
    { bg: 'linear-gradient(135deg, #1A4066 0%, #05101E 100%)', accent: '#A5ACB5' },
  ]
  const c = colors[index % colors.length]

  const badge = (
    <div style={{
      position: 'absolute', top: '12px', right: '12px',
      background: 'rgba(53,155,217,0.20)',
      border: '1px solid rgba(53,155,217,0.30)',
      borderRadius: '999px',
      padding: '4px 10px',
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      color: '#359BD9',
      fontWeight: 600,
    }}>
      {project.type}
    </div>
  )

  if (project.image) {
    return (
      <div style={{
        height: '220px',
        borderRadius: '16px 16px 0 0',
        position: 'relative',
        overflow: 'hidden',
        background: c.bg,
      }}>
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
        {badge}
      </div>
    )
  }

  return (
    <div style={{
      height: '220px',
      background: c.bg,
      borderRadius: '16px 16px 0 0',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '80%', padding: '16px' }}>
        <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '40px', background: 'rgba(53,155,217,0.12)', borderRadius: '6px', border: `1px solid rgba(53,155,217,0.20)` }} />
          ))}
        </div>
        <div style={{ height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
      </div>
      {badge}
    </div>
  )
}

function ProjectCard({ project, index }) {
  const prefersReduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.32, 0, 0.16, 1], delay: index * 0.08 }}
      style={{
        minWidth: '460px',
        maxWidth: '480px',
        background: '#102740',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(165,172,181,0.10)',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        borderColor: hovered ? 'rgba(53,155,217,0.30)' : 'rgba(165,172,181,0.10)',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ProjectPlaceholder project={project} index={index} />
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: '#F2F4F6', marginBottom: '8px' }}>
          {project.title}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A5ACB5', lineHeight: 1.5, marginBottom: '12px' }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {project.tags.map(t => <Tag key={t}>{t}</Tag>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: '#22C55E', fontWeight: 600,
          }}>
            {project.metric}
          </span>
          <Link
            to={`/projets/${project.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontFamily: 'var(--font-body)', fontSize: '12px',
              color: '#359BD9', textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#4AAEE0'}
            onMouseLeave={e => e.currentTarget.style.color = '#359BD9'}
          >
            Voir <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function DigitalExperiencesSection() {
  const prefersReduced = useReducedMotion()
  const item = prefersReduced ? {} : fadeUp
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragLeft, setDragLeft] = useState(0)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    function compute() {
      setDragLeft(-(PORTFOLIO_PROJECTS.length * 500 - window.innerWidth + 48))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return (
    <Section bg="panel" id="digital-experiences">
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
          <SectionHeading
            eyebrow="Digital Experiences"
            headline="Des interfaces qui convertissent. Des produits qui durent."
            align="left"
            headlineSize="display-md"
            maxWidth="560px"
          />
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <Link
              to="/projets"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px',
                border: '1px solid rgba(165,172,181,0.20)',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: '#A5ACB5', textDecoration: 'none',
                transition: 'border-color 0.18s ease, color 0.18s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#359BD9'; e.currentTarget.style.color = '#F2F4F6' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(165,172,181,0.20)'; e.currentTarget.style.color = '#A5ACB5' }}
            >
              Voir tous les projets
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </Container>

      {/* Carousel pleine largeur */}
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ right: 0, left: dragLeft }}
          style={{
            display: 'flex',
            gap: '20px',
            paddingLeft: '24px',
            paddingRight: '24px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false)
            const cardWidth = 500
            const snapped = Math.round(-info.point.x / cardWidth)
            setActiveCard(Math.max(0, Math.min(snapped, PORTFOLIO_PROJECTS.length - 1)))
          }}
          dragElastic={0.05}
        >
          {PORTFOLIO_PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </motion.div>

        {/* Dots navigation */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px',
          marginTop: '24px',
        }}>
          {PORTFOLIO_PROJECTS.map((_, i) => (
            <button
              key={i}
              aria-label={`Projet ${i + 1}`}
              onClick={() => setActiveCard(i)}
              style={{
                width: activeCard === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: activeCard === i ? '#359BD9' : 'rgba(165,172,181,0.25)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}
