import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, GitMerge, RefreshCw, Share2, Sliders, Timer, Webhook } from 'lucide-react'
import { PageHero } from '../../components/layout/PageHero'
import { Section } from '../../components/layout/Section'
import { Container } from '../../components/layout/Container'
import { CTASection } from '../../components/sections/CTASection'
import { ButtonLink } from '../../components/ui/button-link'
import { staggerContainer, staggerSlow, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const CAPABILITIES = [
  {
    icon: Webhook,
    title: 'Intégrations sans code',
    desc: 'Connexion de vos outils existants — CRM, ERP, comptabilité, messagerie — via des workflows n8n ou Make robustes et maintenables.',
  },
  {
    icon: RefreshCw,
    title: 'Synchronisation de données',
    desc: 'Vos données restent cohérentes entre tous vos systèmes, en temps réel ou par batch, avec gestion des erreurs et alertes.',
  },
  {
    icon: Timer,
    title: 'Workflows déclencheurs',
    desc: 'Un devis signé, une facture payée, un formulaire rempli — chaque événement déclenche automatiquement la chaîne d\'actions adaptée.',
  },
  {
    icon: GitMerge,
    title: 'Routage conditionnel',
    desc: 'Des branchements logiques basés sur vos règles métier : priorité, montant, segmentation, statut — sans écrire une ligne de code.',
  },
  {
    icon: Share2,
    title: 'Notifications intelligentes',
    desc: 'Email, Slack, SMS, WhatsApp — les bonnes personnes reçoivent le bon message au bon moment, automatiquement.',
  },
  {
    icon: Sliders,
    title: 'Reporting automatisé',
    desc: 'Tableaux de bord, bilans hebdomadaires, alertes KPI — vos données compilées et envoyées sans intervention manuelle.',
  },
]

const USE_CASES = [
  {
    label: 'Commercial',
    title: 'Pipeline CRM automatisé',
    desc: 'Nouveau lead sur votre site → enrichissement automatique → score → affectation → séquence d\'emails → rappel commercial. Zéro saisie manuelle.',
    metric: '-85%',
    metricLabel: 'tâches manuelles CRM',
  },
  {
    label: 'Finance',
    title: 'Facturation & relances',
    desc: 'Devis accepté → création facture → envoi → suivi paiement → relances automatiques → comptabilisation. Le cycle complet sans toucher à rien.',
    metric: '× 3',
    metricLabel: 'rapidité de traitement',
  },
  {
    label: 'Opérations',
    title: 'Onboarding client',
    desc: 'Signature du contrat → création espace client → accès outils → séquence de bienvenue → kick-off planifié. Chaque nouveau client vit la même expérience premium.',
    metric: '< 5min',
    metricLabel: 'onboarding complet',
  },
]

export default function ExpertiseAutomatisation() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const slow = prefersReduced ? {} : staggerSlow
  const item = prefersReduced ? {} : fadeUp

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Expertise — Automatisation"
        title={<>Vos processus.<br />En pilote automatique.</>}
        description="Nous cartographions vos workflows, éliminons les tâches répétitives et connectons vos outils — pour que votre équipe se concentre uniquement sur ce qui crée de la valeur."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <ButtonLink
            to="/contact"
            variant="default"
            size="lg"
            className="gap-2 px-7 text-[14px] font-bold shadow-[0_0_0_1px_rgba(53,155,217,0.30),0_8px_32px_rgba(53,155,217,0.25)] hover:shadow-[0_0_0_1px_rgba(53,155,217,0.5),0_16px_40px_rgba(53,155,217,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Analyser mes processus <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink to="/contact" variant="outline" size="lg" className="px-6 text-[14px]">
            Demander un devis
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
                Ce que nous automatisons
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
                  style={{ padding: '32px', background: '#102740', transition: 'background 0.2s ease' }}
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
                Des gains mesurables
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
                      fontWeight: 600, letterSpacing: '-0.03em', color: '#359BD9', lineHeight: 1,
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

      {/* Stack */}
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
              }}>Notre stack</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6', marginBottom: '24px',
              }}>
                Des outils éprouvés, pas de solutions maison fragiles
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7,
                color: '#A5ACB5',
              }}>
                Nous utilisons n8n, Make, et Zapier comme fondations — des plateformes maintenues, documentées, et adoptées par des milliers d'entreprises. Vos workflows restent compréhensibles, modifiables, et maintenables après notre intervention.
              </p>
            </motion.div>

            <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['n8n', 'Workflows complexes, auto-hébergé'],
                ['Make', 'Intégrations visuelles, 1000+ apps'],
                ['Zapier', 'Connecteurs standards, rapidité'],
                ['Webhooks & API REST', 'Intégrations sur mesure'],
                ['Supabase / PostgreSQL', 'Stockage et logique métier'],
              ].map(([tool, desc]) => (
                <div key={tool} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                  padding: '14px 20px',
                  background: 'rgba(53,155,217,0.04)',
                  border: '1px solid rgba(53,155,217,0.12)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#F2F4F6',
                  }}>{tool}</span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '12px', color: '#A5ACB5',
                  }}>{desc}</span>
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
