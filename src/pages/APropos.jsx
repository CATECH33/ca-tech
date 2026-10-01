import { motion } from 'framer-motion'
import { ArrowRight, Building2, Target, TrendingUp, Users } from 'lucide-react'
import { PageHero } from '../components/layout/PageHero'
import { Section } from '../components/layout/Section'
import { Container } from '../components/layout/Container'
import { CTASection } from '../components/sections/CTASection'
import { ButtonLink } from '../components/ui/button-link'
import { staggerContainer, staggerSlow, fadeUp, viewport } from '../lib/motion'
import { useReducedMotion } from '../lib/hooks/useReducedMotion'

const VALEURS = [
  {
    icon: Target,
    title: 'Résultats avant tout',
    desc: 'Chaque projet est évalué sur son impact réel — pas sur la complexité technique ou le volume d\'heures. Nous optimisons pour votre ROI.',
  },
  {
    icon: Users,
    title: 'Relation directe',
    desc: 'Pas d\'account manager, pas d\'intermédiaire. Vous travaillez directement avec les personnes qui construisent votre solution.',
  },
  {
    icon: Building2,
    title: 'Ancrage français',
    desc: 'Cabinet basé en France, données hébergées en Europe, conformité RGPD native. La souveraineté numérique n\'est pas un argument de vente — c\'est une exigence.',
  },
  {
    icon: TrendingUp,
    title: 'Vision long terme',
    desc: 'Nous ne livrons pas des projets isolés. Nous construisons des fondations technologiques sur lesquelles votre activité peut croître pendant 10 ans.',
  },
]

const TIMELINE = [
  { year: '2023', event: 'Création de CA-TECH', desc: 'Premiers projets web et identités visuelles pour des PME locales.' },
  { year: '2024', event: 'Pivot IA', desc: 'Intégration des LLM et des agents IA dans les projets clients. Premier diagnostic IA livré.' },
  { year: '2025', event: 'Cabinet IA-First', desc: 'Repositionnement officiel en cabinet de conseil technologique. Lancement du Manager CA-TECH en production.' },
  { year: '2026', event: 'Industrialisation', desc: 'Agents IA métier (RH, commercial, comptable). Diagnostic IA comme produit standardisé.' },
  { year: '2027–2029', event: 'Plateforme SaaS', desc: 'Vision : plateforme IA propriétaire unifiant tous les agents. Revenus récurrents > 60 %. Présence 10 villes.' },
]

export default function APropos() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const slow = prefersReduced ? {} : staggerSlow
  const item = prefersReduced ? {} : fadeUp

  return (
    <main id="main-content">
      <PageHero
        eyebrow="À propos de CA-TECH"
        title={<>Le cabinet qui rend<br />l'IA accessible.</>}
        description="CA-TECH est un cabinet de conseil technologique français spécialisé en intelligence artificielle, automatisation et développement web. Notre mission : traduire la complexité technologique en avantages compétitifs concrets pour les PME et ETI."
      />

      {/* Mission */}
      <Section bg="panel">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: '80px', alignItems: 'start' }}
          >
            <motion.div variants={item}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>Notre mission</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6', marginBottom: '24px',
              }}>
                L'Intelligence Artificielle<br />au service de votre croissance.
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.75,
                color: '#A5ACB5', marginBottom: '20px',
              }}>
                Les grandes entreprises investissent massivement dans l'IA depuis 2022. Les PME et ETI françaises, elles, n'ont pas encore accès aux mêmes outils — non pas parce que ces outils n'existent pas, mais parce qu'elles n'ont pas les équipes techniques pour les déployer.
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.75,
                color: '#A5ACB5',
              }}>
                C'est ce vide que CA-TECH comble : un partenaire technique qui parle votre langage, comprend vos contraintes, et construit des solutions qui fonctionnent en production — pas seulement en démo.
              </p>
            </motion.div>

            <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '28px',
                background: 'rgba(53,155,217,0.06)',
                border: '1px solid rgba(53,155,217,0.15)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 600,
                  letterSpacing: '-0.04em', color: '#359BD9', lineHeight: 1, marginBottom: '8px',
                }}>IA-First</div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, color: '#A5ACB5',
                }}>Notre approche place l'intelligence artificielle au cœur de chaque solution — pas en option, en fondation.</p>
              </div>
              <div style={{
                padding: '28px',
                background: '#05101E',
                border: '1px solid rgba(165,172,181,0.10)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 600,
                  letterSpacing: '-0.04em', color: '#F2F4F6', lineHeight: 1, marginBottom: '8px',
                }}>France</div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, color: '#A5ACB5',
                }}>Équipe basée en France, données en Europe, disponibilité en français. Pas de barrière de langue, pas de décalage horaire.</p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Loïc */}
      <Section bg="canvas">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.div variants={item} style={{ marginBottom: '56px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>L'équipe</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6',
              }}>
                Loïc, premier consultant IA
              </h2>
            </motion.div>

            <motion.div
              variants={item}
              style={{
                padding: '48px',
                background: '#102740',
                border: '1px solid rgba(53,155,217,0.15)',
                borderRadius: 'var(--radius-xl)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '48px',
                alignItems: 'start',
              }}
            >
              {/* Avatar placeholder */}
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #102740, #1A4066)',
                border: '1px solid rgba(53,155,217,0.25)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700,
                  color: '#359BD9',
                }}>L</span>
              </div>

              <div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600,
                    letterSpacing: '-0.02em', color: '#F2F4F6',
                  }}>Loïc</span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px', color: '#A5ACB5', marginLeft: '12px',
                  }}>Fondateur & Consultant IA principal</span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.75,
                  color: '#A5ACB5', marginBottom: '24px', maxWidth: '600px',
                  marginTop: '16px',
                }}>
                  Loïc est le premier point de contact pour chaque client CA-TECH. Il conduit le diagnostic IA initial, conçoit l'architecture des solutions, et supervise les déploiements. Son rôle : transformer votre situation en plan d'action concret, puis le mettre en œuvre.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Intelligence Artificielle', 'LLM & Agents', 'Automatisation', 'Architecture technique', 'Conseil stratégique'].map(tag => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
                      padding: '3px 10px', borderRadius: 'var(--radius-xs)',
                      background: 'rgba(53,155,217,0.10)',
                      border: '1px solid rgba(53,155,217,0.20)',
                      color: '#359BD9',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Valeurs */}
      <Section bg="panel">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.div variants={item} style={{ marginBottom: '56px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>Nos valeurs</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6', maxWidth: '540px',
              }}>
                Ce qui guide nos décisions
              </h2>
            </motion.div>

            <motion.div
              variants={slow}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {VALEURS.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={item}
                  style={{
                    padding: '32px',
                    background: '#05101E',
                    border: '1px solid rgba(165,172,181,0.10)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'border-color 0.2s ease',
                  }}
                  whileHover={{ borderColor: 'rgba(53,155,217,0.20)' }}
                >
                  <div style={{
                    width: '40px', height: '40px',
                    background: 'rgba(53,155,217,0.10)',
                    border: '1px solid rgba(53,155,217,0.18)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Icon size={18} color="#359BD9" />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600,
                    color: '#F2F4F6', marginBottom: '10px',
                  }}>{title}</h3>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65,
                    color: '#A5ACB5',
                  }}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Timeline */}
      <Section bg="canvas">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.div variants={item} style={{ marginBottom: '56px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>Trajectoire</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6',
              }}>
                De 2023 à 2029
              </h2>
            </motion.div>

            <div style={{ position: 'relative', maxWidth: '640px' }}>
              {/* Ligne verticale */}
              <div style={{
                position: 'absolute', left: '68px', top: '8px', bottom: '8px', width: '1px',
                background: 'rgba(53,155,217,0.15)',
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {TIMELINE.map(({ year, event, desc }, i) => (
                  <motion.div
                    key={year}
                    variants={item}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr',
                      gap: '24px',
                      alignItems: 'start',
                      paddingBottom: i < TIMELINE.length - 1 ? '32px' : '0',
                    }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '20px', paddingTop: '2px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                        color: i === TIMELINE.length - 1 ? 'rgba(53,155,217,0.50)' : '#359BD9',
                        letterSpacing: '0.04em',
                      }}>{year}</span>
                      {/* Dot */}
                      <div style={{
                        position: 'absolute', right: '-5px',
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: i === TIMELINE.length - 1 ? 'rgba(53,155,217,0.30)' : '#359BD9',
                        border: '2px solid #05101E',
                        boxShadow: i === TIMELINE.length - 1 ? 'none' : '0 0 8px rgba(53,155,217,0.40)',
                      }} />
                    </div>
                    <div style={{ paddingTop: '1px' }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600,
                        color: i === TIMELINE.length - 1 ? '#A5ACB5' : '#F2F4F6',
                        marginBottom: '4px',
                      }}>{event}</div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6,
                        color: 'rgba(165,172,181,0.65)',
                      }}>{desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>

      <CTASection />
    </main>
  )
}
