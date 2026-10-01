import { motion } from 'framer-motion'
import { ArrowRight, Code2, Gauge, Globe, LayoutDashboard, Layers, ShoppingBag } from 'lucide-react'
import { PageHero } from '../../components/layout/PageHero'
import { Section } from '../../components/layout/Section'
import { Container } from '../../components/layout/Container'
import { CTASection } from '../../components/sections/CTASection'
import { ButtonLink } from '../../components/ui/button-link'
import { staggerContainer, staggerSlow, fadeUp, viewport } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks/useReducedMotion'

const CAPABILITIES = [
  {
    icon: Globe,
    title: 'Sites vitrines premium',
    desc: 'Design sur mesure, SEO natif, performance optimale. Votre site comme premier commercial — disponible 24h/24, convaincant dès la première seconde.',
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce',
    desc: 'Boutiques performantes avec tunnel d\'achat optimisé, intégrations paiement, gestion des stocks et expérience mobile irréprochable.',
  },
  {
    icon: LayoutDashboard,
    title: 'Applications web',
    desc: 'Interfaces métier, back-offices, CRM sur mesure — des outils que vos équipes utilisent réellement parce qu\'ils sont pensés pour elles.',
  },
  {
    icon: Layers,
    title: 'SaaS & plateformes',
    desc: 'Architecture scalable, authentification, paiements récurrents, multi-tenant — nous posons les fondations d\'un produit SaaS solide.',
  },
  {
    icon: Code2,
    title: 'Intégrations & API',
    desc: 'Connexion à votre stack existante : CRM, ERP, outils marketing, passerelles de paiement. Votre site s\'intègre dans votre écosystème.',
  },
  {
    icon: Gauge,
    title: 'Performance & SEO',
    desc: 'Core Web Vitals optimisés, score Lighthouse > 90, balises structurées — pour apparaître en tête des résultats et ne pas perdre de conversions.',
  },
]

const PROJECTS = [
  {
    type: 'Vitrine',
    title: 'CA-TECH Manager',
    desc: 'Back-office de gestion interne : leads, devis, factures, projets, clients. Interface React avec Supabase en backend.',
    tags: ['React', 'Supabase', 'Vite'],
  },
  {
    type: 'SaaS',
    title: 'CV Magic',
    desc: 'Générateur de CV optimisé IA avec parsing automatique, suggestions intelligentes et export multi-formats.',
    tags: ['React', 'OpenAI', 'Node.js'],
  },
  {
    type: 'Finance',
    title: 'Pemous Money',
    desc: 'Application de suivi financier personnel avec catégorisation automatique des dépenses et projections budgétaires.',
    tags: ['React', 'Chart.js', 'Supabase'],
  },
]

export default function ExpertiseWebSaaS() {
  const prefersReduced = useReducedMotion()
  const cont = prefersReduced ? {} : staggerContainer
  const slow = prefersReduced ? {} : staggerSlow
  const item = prefersReduced ? {} : fadeUp

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Expertise — Développement Web & SaaS"
        title={<>Des interfaces qui<br />convertissent.</>}
        description="Du site vitrine premium à l'application SaaS complète — nous construisons des expériences web rapides, accessibles et optimisées pour la conversion, avec le SEO intégré dès la conception."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <ButtonLink
            to="/contact"
            variant="default"
            size="lg"
            className="gap-2 px-7 text-[14px] font-bold shadow-[0_0_0_1px_rgba(53,155,217,0.30),0_8px_32px_rgba(53,155,217,0.25)] hover:shadow-[0_0_0_1px_rgba(53,155,217,0.5),0_16px_40px_rgba(53,155,217,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Démarrer mon projet <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink to="/contact" variant="outline" size="lg" className="px-6 text-[14px]">
            Voir les tarifs
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
                Ce que nous développons
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

      {/* Réalisations */}
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
              }}>Réalisations</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6',
              }}>
                Du code en production
              </h2>
            </motion.div>

            <motion.div
              variants={slow}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {PROJECTS.map(({ type, title, desc, tags }) => (
                <motion.div
                  key={title}
                  variants={item}
                  style={{
                    padding: '32px',
                    background: '#102740',
                    border: '1px solid rgba(165,172,181,0.10)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                  whileHover={{ borderColor: 'rgba(53,155,217,0.25)', y: -2 }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#359BD9', background: 'rgba(53,155,217,0.10)',
                    border: '1px solid rgba(53,155,217,0.20)',
                    padding: '2px 8px', borderRadius: 'var(--radius-xs)',
                    display: 'inline-block', marginBottom: '16px',
                  }}>{type}</span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: '22px',
                    fontWeight: 600, letterSpacing: '-0.02em', color: '#F2F4F6', marginBottom: '10px',
                  }}>{title}</h3>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65,
                    color: '#A5ACB5', marginBottom: '24px',
                  }}>{desc}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
                        padding: '3px 8px', borderRadius: 'var(--radius-xs)',
                        background: 'rgba(53,155,217,0.08)',
                        border: '1px solid rgba(53,155,217,0.18)',
                        color: '#359BD9',
                      }}>{tag}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Tarifs */}
      <Section bg="panel">
        <Container>
          <motion.div
            variants={cont}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.div variants={item} style={{ marginBottom: '56px', textAlign: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
                display: 'block', marginBottom: '12px',
              }}>Tarifs</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
                color: '#F2F4F6',
              }}>
                Forfaits clairs, pas de surprises
              </h2>
            </motion.div>

            <motion.div
              variants={slow}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              {[
                {
                  name: 'Site vitrine',
                  price: '590€',
                  desc: 'Site professionnel 5 pages, SEO optimisé, responsive, livré en 7 jours.',
                  items: ['Design sur mesure', 'SEO natif', '5 pages', 'Formulaire contact'],
                },
                {
                  name: 'E-commerce',
                  price: '990€',
                  desc: 'Boutique complète avec paiement en ligne, gestion catalogue et suivi commandes.',
                  items: ['Tout du vitrine', 'Paiement sécurisé', 'Gestion stock', 'Tableau de bord'],
                  highlight: true,
                },
              ].map(({ name, price, desc, items, highlight }) => (
                <motion.div
                  key={name}
                  variants={item}
                  style={{
                    padding: '36px',
                    background: highlight ? 'linear-gradient(135deg, #102740 0%, #1A4066 100%)' : '#05101E',
                    border: highlight ? '1px solid rgba(53,155,217,0.30)' : '1px solid rgba(165,172,181,0.12)',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                  }}
                >
                  {highlight && (
                    <span style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      color: '#05101E', background: '#359BD9',
                      padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                    }}>Populaire</span>
                  )}
                  <h3 style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                    color: '#A5ACB5', letterSpacing: '0.04em', textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}>{name}</h3>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '44px', fontWeight: 600,
                    letterSpacing: '-0.04em', color: '#F2F4F6', lineHeight: 1, marginBottom: '16px',
                  }}>{price}</div>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65,
                    color: '#A5ACB5', marginBottom: '24px',
                  }}>{desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#22C55E', fontSize: '14px' }}>✓</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#E0E0E3' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            <motion.p variants={item} style={{
              textAlign: 'center', marginTop: '32px',
              fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(165,172,181,0.50)',
            }}>
              Développement sur mesure sur devis · Maintenance mensuelle disponible
            </motion.p>
          </motion.div>
        </Container>
      </Section>

      <CTASection />
    </main>
  )
}
