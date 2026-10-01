import { motion } from 'framer-motion'
import { Bot, BrainCircuit, Cpu, MessagesSquare, Workflow, Zap, ArrowRight, ChevronRight } from 'lucide-react'
import { PageHero } from '../../components/layout/PageHero'
import { Section } from '../../components/layout/Section'
import { Container } from '../../components/layout/Container'
import { CTASection } from '../../components/sections/CTASection'
import { ButtonLink } from '../../components/ui/button-link'
import { staggerContainer, staggerSlow, fadeUp, scaleReveal, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const CAPABILITIES = [
  {
    icon: Bot,
    title: 'Agents IA autonomes',
    desc: 'Des agents capables de raisonner, planifier et agir sur vos outils métier — CRM, base de données, API — sans intervention humaine.',
  },
  {
    icon: MessagesSquare,
    title: 'Chatbots & assistants',
    desc: 'Interfaces conversationnelles entraînées sur votre contenu : FAQ, support client, onboarding, qualification de leads.',
  },
  {
    icon: BrainCircuit,
    title: 'Intégration LLM',
    desc: 'OpenAI, Anthropic, Mistral, Llama — sélection et intégration du modèle adapté à votre use case et votre budget.',
  },
  {
    icon: Workflow,
    title: 'Pipelines RAG',
    desc: 'Vos documents, vos données, votre base de connaissance — interrogeables en langage naturel avec précision et sources citées.',
  },
  {
    icon: Cpu,
    title: 'MCP & outils IA',
    desc: 'Connexion de vos systèmes au protocole MCP pour que vos agents IA interagissent nativement avec vos logiciels existants.',
  },
  {
    icon: Zap,
    title: 'Déploiement & maintenance',
    desc: 'Infrastructure robuste, monitoring, mises à jour des modèles, optimisation des coûts — nous gérons le cycle de vie complet.',
  },
]

const USE_CASES = [
  {
    label: 'Commercial',
    title: 'Agent de qualification',
    desc: 'Un agent analyse chaque prospect entrant, enrichit la fiche CRM, score la maturité et propose le bon script commercial — avant même que votre équipe ne décroche.',
    metric: '-70%',
    metricLabel: 'temps de qualification',
  },
  {
    label: 'Support',
    title: 'Assistance client 24/7',
    desc: 'Votre assistant répond aux questions fréquentes, escalade les cas complexes à l\'humain, et documente chaque échange pour nourrir votre base de connaissance.',
    metric: '× 5',
    metricLabel: 'tickets résolus sans agent',
  },
  {
    label: 'Interne',
    title: 'Copilote métier',
    desc: 'Vos équipes posent des questions en langage naturel sur vos données internes : bilans, contrats, emails, procédures. L\'IA répond avec les sources.',
    metric: '< 3s',
    metricLabel: 'temps de réponse',
  },
]

export default function ExpertiseIA() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const slow = prefersReduced ? {} : staggerSlow
  const item = prefersReduced ? {} : fadeUp
  const scale = prefersReduced ? {} : scaleReveal

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Expertise — Intelligence Artificielle"
        title={<>L'IA qui travaille<br />pour vous.</>}
        description="Nous concevons des agents IA, des chatbots métier et des pipelines LLM qui s'intègrent dans vos processus existants — et créent une valeur mesurable dès les premières semaines."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <ButtonLink
            to="/contact"
            variant="default"
            size="lg"
            className="gap-2 px-7 text-[14px] font-bold shadow-[0_0_0_1px_rgba(53,155,217,0.30),0_8px_32px_rgba(53,155,217,0.25)] hover:shadow-[0_0_0_1px_rgba(53,155,217,0.5),0_16px_40px_rgba(53,155,217,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Parler à Loïc <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink to="/contact" variant="outline" size="lg" className="px-6 text-[14px]">
            Voir nos réalisations
          </ButtonLink>
        </div>
      </PageHero>

      {/* Capabilities */}
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
              }}>Nos capacités</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6', maxWidth: '540px',
              }}>
                Ce que nous construisons pour vous
              </h2>
            </motion.div>

            <motion.div
              variants={slow}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1px',
                background: 'rgba(165,172,181,0.10)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={item}
                  style={{
                    padding: '32px',
                    background: '#102740',
                    transition: 'background 0.2s ease',
                  }}
                  whileHover={{ background: '#1A4066' }}
                >
                  <div style={{
                    width: '40px', height: '40px',
                    background: 'rgba(53,155,217,0.12)',
                    border: '1px solid rgba(53,155,217,0.20)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Icon size={18} color="#359BD9" />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600,
                    color: '#F2F4F6', marginBottom: '8px',
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

      {/* Use cases */}
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
              }}>Cas d'usage</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6',
              }}>
                Des résultats concrets
              </h2>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(165,172,181,0.10)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {USE_CASES.map(({ label, title, desc, metric, metricLabel }) => (
                <motion.div
                  key={title}
                  variants={item}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '40px',
                    padding: '40px',
                    background: '#05101E',
                    alignItems: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  whileHover={{ background: '#102740' }}
                  className="flex-col-mobile"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: '#359BD9', background: 'rgba(53,155,217,0.10)',
                        border: '1px solid rgba(53,155,217,0.20)',
                        padding: '2px 8px', borderRadius: 'var(--radius-xs)',
                      }}>{label}</span>
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)',
                      fontWeight: 600, letterSpacing: '-0.02em', color: '#F2F4F6', marginBottom: '12px',
                    }}>{title}</h3>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7,
                      color: '#A5ACB5', maxWidth: '560px',
                    }}>{desc}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 4vw, 44px)',
                      fontWeight: 600, letterSpacing: '-0.03em', color: '#359BD9',
                      lineHeight: 1,
                    }}>{metric}</div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '12px',
                      color: 'rgba(165,172,181,0.60)', marginTop: '6px',
                    }}>{metricLabel}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Approche */}
      <Section bg="panel">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}
          >
            <motion.div variants={item}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>Notre approche</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6', marginBottom: '24px',
              }}>
                Diagnostic avant déploiement
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7,
                color: '#A5ACB5', marginBottom: '16px',
              }}>
                Avant d'écrire une ligne de code, Loïc analyse vos processus pour identifier les tâches à plus fort potentiel d'automatisation IA — celles qui génèrent le meilleur retour sur investissement.
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7,
                color: '#A5ACB5',
              }}>
                Résultat : un plan d'action priorisé, un chiffrage précis, et un premier démonstrateur en moins de deux semaines.
              </p>
            </motion.div>

            <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Audit des processus existants', 'Identification des opportunités IA', 'Prototype & validation', 'Intégration dans vos outils', 'Suivi & optimisation continue'].map((step, i) => (
                <div key={step} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px',
                  background: 'rgba(53,155,217,0.04)',
                  border: '1px solid rgba(53,155,217,0.12)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                    color: '#359BD9', minWidth: '24px',
                  }}>0{i + 1}</span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500,
                    color: '#E0E0E3',
                  }}>{step}</span>
                  <ChevronRight size={14} color="rgba(53,155,217,0.40)" style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      <CTASection />
    </main>
  )
}
