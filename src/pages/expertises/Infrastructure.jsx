import { motion } from 'framer-motion'
import { ArrowRight, Cloud, GitBranch, Monitor, Server, Shield, Wrench } from 'lucide-react'
import { PageHero } from '../../components/layout/PageHero'
import { Section } from '../../components/layout/Section'
import { Container } from '../../components/layout/Container'
import { CTASection } from '../../components/sections/CTASection'
import { ButtonLink } from '../../components/ui/button-link'
import { staggerContainer, staggerSlow, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const CAPABILITIES = [
  {
    icon: Cloud,
    title: 'Cloud & hébergement',
    desc: 'AWS, GCP, Vercel, OVH — architecture adaptée à votre charge, avec scaling automatique et coûts maîtrisés.',
  },
  {
    icon: GitBranch,
    title: 'CI/CD & DevOps',
    desc: 'Pipelines de déploiement automatisés, tests continus, rollback instantané — votre code en production en toute confiance.',
  },
  {
    icon: Server,
    title: 'Bases de données',
    desc: 'PostgreSQL, MySQL, Redis, MongoDB — modélisation, optimisation des requêtes, sauvegardes automatiques et haute disponibilité.',
  },
  {
    icon: Monitor,
    title: 'Monitoring & alertes',
    desc: 'Tableaux de bord de performance, alertes proactives, logs centralisés — vous êtes informé avant que vos utilisateurs ne le soient.',
  },
  {
    icon: Shield,
    title: 'Sécurité & conformité',
    desc: 'Audit de sécurité, chiffrement, gestion des accès, conformité RGPD — votre infrastructure auditée et renforcée.',
  },
  {
    icon: Wrench,
    title: 'Maintenance & support',
    desc: 'Mises à jour proactives, gestion des dépendances, optimisation des performances — nous gérons l\'opérationnel pour que vous ne le fassiez pas.',
  },
]

const METRICS = [
  { value: '99.9%', label: 'Uptime cible' },
  { value: '< 200ms', label: 'Temps de réponse' },
  { value: '0 loss', label: 'Politique de backup' },
  { value: '24h', label: 'SLA de réponse' },
]

export default function ExpertiseInfrastructure() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const slow = prefersReduced ? {} : staggerSlow
  const item = prefersReduced ? {} : fadeUp

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Expertise — Infrastructure Cloud & IT"
        title={<>Une infrastructure<br />qui ne dort jamais.</>}
        description="Architecture cloud, CI/CD, monitoring, sécurité — nous construisons et maintenons l'infrastructure technique sur laquelle repose votre activité, avec la rigueur d'une équipe DevOps dédiée."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <ButtonLink
            to="/contact"
            variant="default"
            size="lg"
            className="gap-2 px-7 text-[14px] font-bold shadow-[0_0_0_1px_rgba(53,155,217,0.30),0_8px_32px_rgba(53,155,217,0.25)] hover:shadow-[0_0_0_1px_rgba(53,155,217,0.5),0_16px_40px_rgba(53,155,217,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Auditer mon infrastructure <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink to="/contact" variant="outline" size="lg" className="px-6 text-[14px]">
            Demander un devis
          </ButtonLink>
        </div>
      </PageHero>

      {/* Metrics */}
      <Section bg="panel" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1px',
              background: 'rgba(165,172,181,0.10)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {METRICS.map(({ value, label }) => (
              <motion.div
                key={label}
                variants={item}
                style={{
                  padding: '32px 24px',
                  background: '#102740',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 3vw, 32px)',
                  fontWeight: 600, letterSpacing: '-0.03em', color: '#359BD9',
                  lineHeight: 1, marginBottom: '8px',
                }}>{value}</div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px',
                  color: 'rgba(165,172,181,0.65)', letterSpacing: '0.02em',
                }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Capabilities */}
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
              }}>Nos capacités</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6', maxWidth: '540px',
              }}>
                Ce que nous gérons pour vous
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
                  style={{ padding: '32px', background: '#05101E', transition: 'background 0.2s ease' }}
                  whileHover={{ background: '#102740' }}
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

      {/* Stack */}
      <Section bg="panel">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.div variants={item} style={{ marginBottom: '48px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>Notre stack technique</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6',
              }}>
                Technologies éprouvées
              </h2>
            </motion.div>

            <motion.div
              variants={slow}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
              }}
            >
              {[
                'Vercel', 'AWS', 'Google Cloud', 'OVH VPS',
                'PostgreSQL', 'Supabase', 'Redis', 'MongoDB',
                'GitHub Actions', 'Docker', 'Nginx', 'Cloudflare',
                'Datadog', 'Sentry', 'Grafana', 'Let\'s Encrypt',
              ].map(tech => (
                <motion.div
                  key={tech}
                  variants={item}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(53,155,217,0.04)',
                    border: '1px solid rgba(53,155,217,0.10)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500,
                    color: '#A5ACB5',
                    transition: 'border-color 0.2s ease, color 0.2s ease',
                    cursor: 'default',
                  }}
                  whileHover={{ borderColor: 'rgba(53,155,217,0.25)', color: '#E0E0E3' }}
                >
                  {tech}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      <CTASection />
    </main>
  )
}
