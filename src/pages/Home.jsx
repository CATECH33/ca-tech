import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, organizationSchema, websiteSchema } from '../lib/schema'
import { StorySection } from '../components/story/StorySection'

/* ── Scroll reveal (sections non-showcase) ── */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* ── Data ── */

const WORKS = [
  {
    img: '/portfolio/ca-tech-manager/home.webp',
    title: 'CA-TECH Manager',
    tags: ['Web App', 'React', 'Supabase'],
    desc: 'Plateforme interne de gestion devis, clients et projets.',
  },
  {
    img: '/portfolio/cv-magic/home.webp',
    title: 'CV Magic',
    tags: ['SaaS', 'IA', 'React'],
    desc: 'Générateur de CV optimisé IA — exportation PDF en un clic.',
  },
  {
    img: '/portfolio/pasmal/home.webp',
    title: 'Pasmal',
    tags: ['Web App', 'React'],
    desc: 'Application web de gestion opérationnelle pour équipes terrain.',
  },
  {
    img: '/portfolio/branding/logo1.webp',
    title: 'Identité visuelle',
    tags: ['Design', 'Branding', 'Logo'],
    desc: "Systèmes d'identité visuels pour PME et startups.",
  },
]

const STEPS = [
  { title: 'Comprendre',  desc: "Nous cartographions vos processus, vos outils et vos contraintes réelles avant d'écrire une ligne." },
  { title: 'Concevoir',   desc: 'Architecture système, choix technologiques, plan de déploiement. Tout est validé avec vous avant exécution.' },
  { title: 'Construire',  desc: 'Développement itératif, livraisons régulières. Vous voyez le système prendre forme en temps réel.' },
  { title: 'Déployer',    desc: 'Mise en production, tests de charge, monitoring. Le système est opérationnel avant la date convenue.' },
  { title: 'Maintenir',   desc: 'Support réactif, mises à jour, évolutions. Votre système grandit avec votre entreprise.' },
]

/* ── IA slide visuals ── */

const IA_SLIDES = [
  {
    copy: "Un dirigeant de PME passe 2 heures par jour à chercher des informations dans ses propres outils.",
    visual: (
      <div className="ia-tasklist">
        {[
          ['Vérifier les devis en attente', '9:05'],
          ['Relancer le client Martin', '9:22'],
          ['Mettre à jour le CRM', '9:48'],
          ['Envoyer le rapport hebdomadaire', '10:14'],
        ].map(([task, time], i) => (
          <div key={i} className="ia-tasklist-row" style={{ animationDelay: `${i * 120}ms` }}>
            <span className="ia-tasklist-task">{task}</span>
            <span className="ia-tasklist-time">{time}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    copy: "Loïc lit votre question. Il identifie l'intention, les données nécessaires, les systèmes à consulter.",
    visual: (
      <div className="ia-chat-demo">
        <div className="ia-bubble ia-bubble--user">
          Combien de devis sont en attente de signature ?
        </div>
        <div className="ia-typing-dots" aria-label="Loïc réfléchit">
          <span /><span /><span />
        </div>
      </div>
    ),
  },
  {
    copy: "Loïc consulte vos systèmes. Il ne devine pas — il lit les données réelles.",
    visual: (
      <div className="ia-terminal">
        {[
          ['CRM.getDevis', '{ status: "pending" }'],
          ['Calendar.getEvents', '{ this_week: true }'],
          ['Slack.getMessages', '{ channel: "commercial" }'],
        ].map(([fn, params], i) => (
          <div key={i} className="ia-term-line" style={{ animationDelay: `${i * 120}ms` }}>
            <span className="ia-term-arrow">→</span>
            <span className="ia-term-fn">{fn}</span>
            <span className="ia-term-params">({params})</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    copy: "La réponse est structurée. Les actions sont proposées.",
    visual: (
      <div className="ia-response">
        <p className="ia-response-text">
          Vous avez <strong>8 devis</strong> en attente — <strong>16 800 €</strong> au total.
          <br />Les 3 les plus anciens : Dupont SAS, Martin & Fils, TechRenov.
        </p>
        <div className="ia-response-action">
          <span className="ia-response-arrow">→</span>
          <span>Envoyer les rappels ?</span>
          <span className="ia-response-cta">Confirmer</span>
        </div>
      </div>
    ),
  },
  {
    copy: "En 4 secondes. Pas 2 heures.",
    visual: (
      <div className="ia-result">
        {[
          ['8 devis identifiés automatiquement', '0.4s'],
          ['3 relances envoyées par email', '0.8s'],
          ['CRM mis à jour', '1.1s'],
          ["Rapport Slack envoyé à l'équipe", '1.4s'],
        ].map(([task, time], i) => (
          <div key={i} className="ia-result-row" style={{ animationDelay: `${i * 120}ms` }}>
            <span className="ia-result-check">✓</span>
            <span className="ia-result-task">{task}</span>
            <span className="ia-result-time">{time}</span>
          </div>
        ))}
        <div className="ia-result-ratio">
          2h <span className="ia-result-ratio-sep">→</span> <em>4s</em>
        </div>
      </div>
    ),
  },
]

/* ── AUTO slide visuals ── */

const AUTO_SLIDES = [
  {
    copy: "Votre équipe reçoit 40 emails par jour. Chacun demande une action manuelle.",
    visual: (
      <div className="auto-inbox">
        {[
          ['ML', "Besoin d'un devis pour votre prestation", '1h'],
          ['SB', 'Relance facture n°2024-089', '3h'],
          ['TK', 'Question sur le projet en cours', 'hier'],
          ['AR', 'Demande de réunion urgente', 'hier'],
          ['JD', 'Suivi commande #4521', 'il y a 2j'],
        ].map(([initials, subject, time], i) => (
          <div key={i} className="auto-email-card" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="auto-email-avatar">{initials}</div>
            <div className="auto-email-meta">
              <div className="auto-email-subject">{subject}</div>
              <div className="auto-email-time">{time}</div>
            </div>
            {i === 0 && <div className="auto-email-unread" aria-hidden="true" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    copy: "Un email entre. Le système s'active en moins d'une seconde.",
    visual: (
      <div className="auto-trigger">
        <div className="auto-trigger-source">Email</div>
        <div className="auto-trigger-line">
          <div className="auto-trigger-fill" />
        </div>
        <div className="auto-trigger-target">DÉCLENCHEUR</div>
      </div>
    ),
  },
  {
    copy: "L'IA lit, classe, extrait. Elle sait déjà quoi faire.",
    visual: (
      <div className="auto-tree">
        <div className="auto-tree-top">
          <div className="auto-tree-branch" style={{ animationDelay: '0ms' }}>URGENCE</div>
        </div>
        <div className="auto-tree-mid">
          <div className="auto-tree-source">Email reçu</div>
          <div className="auto-tree-sep">→</div>
          <div className="auto-tree-center">IA</div>
          <div className="auto-tree-sep">→</div>
          <div className="auto-tree-branch auto-tree-branch--active" style={{ animationDelay: '400ms' }}>FACTURATION</div>
        </div>
        <div className="auto-tree-bot">
          <div className="auto-tree-branch" style={{ animationDelay: '200ms' }}>SUIVI</div>
          <div className="auto-tree-branch" style={{ animationDelay: '600ms' }}>ARCHIVE</div>
        </div>
      </div>
    ),
  },
  {
    copy: "Trois systèmes mis à jour. Simultanément. Sans intervention.",
    visual: (
      <div className="auto-actions">
        {[
          { src: '/automatisations/gmail.webp', label: 'Gmail', action: 'Email de confirmation envoyé' },
          { src: '/automatisations/slack.webp', label: 'Slack', action: 'Notification équipe commerciale' },
          { label: 'CRM', action: 'Fiche client mise à jour', css: true },
        ].map((tool, i) => (
          <div key={i} className="auto-action-card" style={{ animationDelay: `${i * 300}ms` }}>
            {tool.css
              ? <div className="auto-action-icon-css">CRM</div>
              : <img className="auto-action-icon" src={tool.src} alt={tool.label} width="32" height="32" loading="lazy" decoding="async" />
            }
            <span className="auto-action-label">{tool.action}</span>
            <span className="auto-action-check" style={{ animationDelay: `${i * 300 + 300}ms` }}>✓ Fait</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    copy: "20 minutes de travail manuel. Remplacées par 3 secondes de système.",
    visual: (
      <div className="auto-compare">
        <div className="auto-compare-before">
          <div className="auto-compare-header">Avant</div>
          {[
            ["Ouvrir l'email", '4 min'],
            ['Lire et trier', '5 min'],
            ['Saisir dans le CRM', '8 min'],
            ['Envoyer confirmation', '3 min'],
          ].map(([t, d], i) => (
            <div key={i} className="auto-compare-row">
              <span>{t}</span>
              <span className="auto-compare-dur">{d}</span>
            </div>
          ))}
          <div className="auto-compare-total">20 min</div>
        </div>
        <div className="auto-compare-divider" aria-hidden="true" />
        <div className="auto-compare-after">
          <div className="auto-compare-header">Après</div>
          <p className="auto-compare-msg">Le système<br />a tout fait.</p>
          <div className="auto-compare-total auto-compare-total--accent">3 sec</div>
        </div>
      </div>
    ),
  },
]

/* ── WEB slide visuals ── */

const WEB_SLIDES = [
  {
    copy: "Avant d'écrire une ligne, on dessine la structure.",
    visual: (
      <div className="web-wireframe">
        <div className="wf-block wf-nav" />
        <div className="wf-block wf-hero" />
        <div className="wf-cols">
          <div className="wf-block wf-col" />
          <div className="wf-block wf-col" />
          <div className="wf-block wf-col" />
        </div>
        <div className="wf-block wf-footer" />
      </div>
    ),
  },
  {
    copy: "L'architecture technique avant l'esthétique. Routes, composants, données.",
    visual: (
      <div className="web-tree">
        {[
          'App',
          '├── Navigation',
          '├── Hero',
          '│   ├── Headline',
          '│   └── CTAs',
          '├── Features',
          '│   └── Card × 3',
          '└── Footer',
        ].map((line, i) => (
          <div key={i} className="web-tree-line" style={{ animationDelay: `${i * 80}ms` }}>
            {line}
          </div>
        ))}
      </div>
    ),
  },
  {
    copy: "L'interface prend forme. Chaque composant a un rôle précis.",
    visual: (
      <div className="web-mockup-pair">
        <div className="web-mockup-bg" aria-hidden="true" />
        <img
          className="web-mockup-front"
          src="/portfolio/ca-tech-manager/home.webp"
          alt="CA-TECH Manager"
          loading="lazy"
          decoding="async"
        />
      </div>
    ),
  },
  {
    copy: "Le produit livré. Pages, fonctionnalités, données réelles.",
    visual: (
      <div className="web-product">
        <img
          className="web-product-img"
          src="/portfolio/ca-tech-manager/dashboard.webp"
          alt="CA-TECH Manager Dashboard"
          loading="lazy"
          decoding="async"
        />
        <div className="web-lh-badge" aria-label="Score Lighthouse">
          {[['98', 'Performance'], ['100', 'Accessibilité'], ['100', 'SEO']].map(([score, label]) => (
            <div key={label} className="web-lh-row">
              <span className="web-lh-score">{score}</span>
              <span className="web-lh-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    copy: "Chaque projet dans ce portfolio a commencé par une conversation de 30 minutes.",
    visual: (
      <div className="web-stack">
        <img className="web-stack-c web-stack-c--back2" src="/portfolio/cv-magic/home.webp" alt="" loading="lazy" decoding="async" />
        <img className="web-stack-c web-stack-c--back" src="/portfolio/ca-tech-manager/home.webp" alt="" loading="lazy" decoding="async" />
        <img className="web-stack-c web-stack-c--front" src="/portfolio/ca-tech-manager/dashboard.webp" alt="Portfolio CA-TECH" loading="lazy" decoding="async" />
      </div>
    ),
  },
]

/* ── INFRA slide visuals ── */

function InfraDiagram({ variant }) {
  return (
    <div className={`infra-diag infra-diag--${variant}`}>
      <div className="infra-d-tier">
        <div className="infra-d-node infra-d-node--accent">CDN / Edge</div>
        {variant === 'badges' && <span className="infra-d-badge">TLS 1.3</span>}
      </div>
      <div className={`infra-d-conn${variant === 'conn' || variant === 'badges' ? ' infra-d-conn--active' : ''}`} />
      <div className="infra-d-tier">
        <div className="infra-d-node">Load Balancer</div>
        {variant === 'badges' && <span className="infra-d-badge">WAF</span>}
      </div>
      <div className={`infra-d-conn${variant === 'conn' || variant === 'badges' ? ' infra-d-conn--active' : ''}`} />
      <div className="infra-d-tier infra-d-tier--split">
        <div className="infra-d-node">App Server</div>
        <div className="infra-d-node">API</div>
        <div className="infra-d-node">Auth</div>
        {variant === 'badges' && <span className="infra-d-badge infra-d-badge--wide">IAM / RBAC</span>}
      </div>
      <div className={`infra-d-conn${variant === 'conn' || variant === 'badges' ? ' infra-d-conn--active' : ''}`} />
      <div className="infra-d-tier infra-d-tier--split">
        <div className="infra-d-node infra-d-node--dim">Database</div>
        <div className="infra-d-node infra-d-node--dim">Cache</div>
        <div className="infra-d-node infra-d-node--dim">Logs</div>
        {variant === 'badges' && <span className="infra-d-badge">AES-256</span>}
      </div>
    </div>
  )
}

const INFRA_SLIDES = [
  {
    copy: "Chaque couche a un rôle. Aucune n'est là par hasard.",
    visual: <InfraDiagram variant="base" />,
  },
  {
    copy: "Chaque service est défini, isolé, documenté.",
    visual: (
      <div className="infra-tooltips">
        <InfraDiagram variant="tips" />
        <div className="infra-tip-list">
          {[
            ['CDN / Edge', 'Latence < 50ms'],
            ['Load Balancer', '99.9% uptime'],
            ['App Server', 'Auto-scaling'],
            ['Database', 'Read replicas'],
          ].map(([node, val], i) => (
            <div key={i} className="infra-tip-row" style={{ animationDelay: `${i * 200}ms` }}>
              <span className="infra-tip-node">{node}</span>
              <span className="infra-tip-val">{val}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    copy: "Les flux sont cartographiés. Aucune dépendance cachée.",
    visual: <InfraDiagram variant="conn" />,
  },
  {
    copy: "Chiffré en transit. Chiffré au repos. Accès par rôles.",
    visual: <InfraDiagram variant="badges" />,
  },
  {
    copy: "Le système se surveille lui-même.",
    visual: (
      <div className="infra-metrics">
        {[
          ['99.9%', 'Uptime'],
          ['<200ms', 'Latence'],
          ['0.01%', 'Erreurs'],
          ['14/mois', 'Déploiements'],
        ].map(([val, label], i) => (
          <div key={label} className="infra-metric-card" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="infra-metric-val">{val}</div>
            <div className="infra-metric-label">{label}</div>
            <div className="infra-metric-status">
              <span className="infra-status-dot" aria-hidden="true" />
              Nominal
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

/* ── Slide indicator (dots + bar) ── */

function SlideIndicator({ total, active, light }) {
  return (
    <div className={`sc-indicator${light ? ' sc-indicator--light' : ''}`} aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`sc-dot${active === i ? ' sc-dot--active' : ''}`} />
      ))}
    </div>
  )
}

/* ── Component ── */

export default function Home() {
  usePageMeta({
    title: 'CA-TECH — Intelligence Artificielle, Automatisation & Technologie',
    description: 'Cabinet de conseil technologique IA-first. Nous concevons, automatisons et déployons des systèmes numériques pour les PME françaises.',
    canonical: 'https://www.ca-tech.fr/',
  })
  useJsonLd('home-org',     organizationSchema)
  useJsonLd('home-website', websiteSchema)
  useReveal()

  return (
    <main className="home-page">

      {/* ── HERO ──────────────────────────────── */}
      <section className="home-hero" aria-label="Présentation">
        <div className="home-hero__orb" aria-hidden="true" />
        <div className="home-hero__inner container">
          <div className="home-hero__meta reveal">
            <span className="home-hero__eyebrow">CA-TECH · CABINET TECHNOLOGIQUE</span>
          </div>
          <div className="home-hero__badge reveal" data-delay="1">
            <span className="home-hero__badge-dot" aria-hidden="true" />
            <span className="home-hero__badge-accent">Loïc</span>,
            votre collaborateur IA
          </div>
          <h1 className="home-hero__headline reveal" data-delay="2">
            La technologie
            <br />
            au travail.
          </h1>
          <p className="home-hero__domains reveal" data-delay="3" aria-label="Nos domaines d'expertise">
            IA&nbsp;&nbsp;·&nbsp;&nbsp;Automatisation&nbsp;&nbsp;·&nbsp;&nbsp;Web &amp; SaaS&nbsp;&nbsp;·&nbsp;&nbsp;Infrastructure IT
          </p>
          <p className="home-hero__body reveal" data-delay="4">
            CA-TECH conçoit et déploie des systèmes numériques
            pour les PME françaises.
          </p>
          <div className="home-hero__ctas reveal" data-delay="5">
            <Link to="/contact" className="home-hero__cta-primary">
              Parler de votre projet
            </Link>
            <Link to="/realisations" className="home-hero__cta-ghost">
              Voir les réalisations
            </Link>
          </div>
        </div>
      </section>

      {/* ── INTELLIGENCE ARTIFICIELLE (dark) ── */}
      <StorySection id="expertise-ia" theme="dark" label="Intelligence Artificielle" slideCount={IA_SLIDES.length}>
        {(slide) => (
          <div className="sc-split container">

            {/* Text panel */}
            <div className="sc-text">
              <div className="sc-text-header">
                <p className="eyebrow">Intelligence Artificielle</p>
                <h2 className="sc-headline">
                  Intelligence<br />artificielle
                </h2>
              </div>
              <div className="sc-text-slides" aria-live="polite">
                {IA_SLIDES.map((s, i) => (
                  <p key={i} className={`sc-text-slide${slide === i ? ' is-active' : ''}`}>
                    {s.copy}
                  </p>
                ))}
              </div>
              <Link to="/expertises/ia" className="home-section-link sc-cta">
                Découvrir l'expertise IA →
              </Link>
            </div>

            {/* Visual panel */}
            <div className="sc-visual">
              {IA_SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`sc-visual-slide${slide === i ? ' is-active' : ''}`}
                  aria-hidden={slide !== i}
                >
                  {s.visual}
                </div>
              ))}
              <SlideIndicator total={IA_SLIDES.length} active={slide} />
            </div>

          </div>
        )}
      </StorySection>

      {/* ── AUTOMATISATION (light) ── */}
      <StorySection id="expertise-automatisation" theme="light" label="Automatisation" slideCount={AUTO_SLIDES.length}>
        {(slide) => (
          <div className="sc-centered container">

            <div className="sc-cent-header">
              <p className="eyebrow">Automatisation</p>
              <h2 className="sc-headline sc-headline--light">Automatisation</h2>
            </div>

            <div className="sc-cent-copy" aria-live="polite">
              {AUTO_SLIDES.map((s, i) => (
                <p key={i} className={`sc-text-slide${slide === i ? ' is-active' : ''}`}>
                  {s.copy}
                </p>
              ))}
            </div>

            <div className="sc-cent-visual">
              {AUTO_SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`sc-visual-slide${slide === i ? ' is-active' : ''}`}
                  aria-hidden={slide !== i}
                >
                  {s.visual}
                </div>
              ))}
            </div>

            <SlideIndicator total={AUTO_SLIDES.length} active={slide} light />

            <Link to="/expertises/automatisation" className="home-section-link home-section-link--light sc-cta">
              Découvrir l'expertise Automatisation →
            </Link>

          </div>
        )}
      </StorySection>

      {/* ── WEB & SAAS (dark) ── */}
      <StorySection id="expertise-web-saas" theme="dark" label="Web & SaaS" slideCount={WEB_SLIDES.length}>
        {(slide) => (
          <div className="sc-split sc-split--reverse container">

            {/* Visual panel (left in reverse) */}
            <div className="sc-visual">
              {WEB_SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`sc-visual-slide${slide === i ? ' is-active' : ''}`}
                  aria-hidden={slide !== i}
                >
                  {s.visual}
                </div>
              ))}
              <SlideIndicator total={WEB_SLIDES.length} active={slide} />
            </div>

            {/* Text panel */}
            <div className="sc-text">
              <div className="sc-text-header">
                <p className="eyebrow">Web & SaaS</p>
                <h2 className="sc-headline">Web &amp; SaaS</h2>
              </div>
              <div className="sc-text-slides" aria-live="polite">
                {WEB_SLIDES.map((s, i) => (
                  <p key={i} className={`sc-text-slide${slide === i ? ' is-active' : ''}`}>
                    {s.copy}
                  </p>
                ))}
              </div>
              <Link to="/expertises/web-saas" className="home-section-link sc-cta">
                Découvrir l'expertise Web & SaaS →
              </Link>
            </div>

          </div>
        )}
      </StorySection>

      {/* ── INFRASTRUCTURE (light) ── */}
      <StorySection id="expertise-infrastructure" theme="light" label="Infrastructure IT" slideCount={INFRA_SLIDES.length}>
        {(slide) => (
          <div className="sc-centered container">

            <div className="sc-cent-header">
              <p className="eyebrow">Infrastructure IT</p>
              <h2 className="sc-headline sc-headline--light">Infrastructure IT</h2>
            </div>

            <div className="sc-cent-copy" aria-live="polite">
              {INFRA_SLIDES.map((s, i) => (
                <p key={i} className={`sc-text-slide sc-text-slide--light${slide === i ? ' is-active' : ''}`}>
                  {s.copy}
                </p>
              ))}
            </div>

            <div className="sc-cent-visual">
              {INFRA_SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`sc-visual-slide${slide === i ? ' is-active' : ''}`}
                  aria-hidden={slide !== i}
                >
                  {s.visual}
                </div>
              ))}
            </div>

            <SlideIndicator total={INFRA_SLIDES.length} active={slide} light />

            <Link to="/expertises/infrastructure" className="home-section-link home-section-link--light sc-cta">
              Découvrir l'expertise Infrastructure →
            </Link>

          </div>
        )}
      </StorySection>

      {/* ── RÉALISATIONS ──────────────────────── */}
      <section className="home-real" aria-label="Réalisations">
        <div className="container">
          <div className="home-real__head reveal">
            <p className="eyebrow">Nos réalisations</p>
            <h2 className="home-section-headline reveal" data-delay="1">
              Ce que nous construisons.
            </h2>
          </div>
          <div className="home-real__grid">
            {WORKS.map((w, i) => (
              <article key={w.title} className="home-real__card reveal" data-delay={i + 1}>
                <div className="home-real__card-img">
                  <img src={w.img} alt={w.title} width="480" height="300" loading="lazy" decoding="async" />
                </div>
                <div className="home-real__card-body">
                  <div className="home-real__card-tags">
                    {w.tags.map(t => <span key={t} className="home-real__tag">{t}</span>)}
                  </div>
                  <h3 className="home-real__card-title">{w.title}</h3>
                  <p className="home-real__card-desc">{w.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="home-real__more reveal">
            <Link to="/realisations" className="home-section-link">
              Voir toutes les réalisations →
            </Link>
          </div>
        </div>
      </section>

      {/* ── APPROCHE ──────────────────────────── */}
      <section className="home-method" aria-label="Notre approche">
        <div className="container">
          <div className="home-method__head reveal">
            <p className="eyebrow">Notre approche</p>
            <h2 className="home-section-headline home-section-headline--light reveal" data-delay="1">
              Comment nous travaillons.
            </h2>
          </div>
          <ol className="home-method__list">
            {STEPS.map((step, i) => (
              <li key={i} className="home-method__item reveal" data-delay={i + 1}>
                <strong className="home-method__title">{step.title}</strong>
                <p className="home-method__desc">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── À PROPOS ──────────────────────────── */}
      <section className="home-about" aria-label="À propos">
        <div className="container home-about__inner">
          <div className="home-about__copy">
            <p className="eyebrow">À propos</p>
            <h2 className="home-section-headline reveal" data-delay="1">
              Construit par<br />des praticiens.
            </h2>
            <p className="home-about__text reveal" data-delay="2">
              CA-TECH est un cabinet de conseil technologique fondé pour répondre
              à un constat simple : les PME françaises ont besoin de systèmes qui
              fonctionnent vraiment, pas de promesses technologiques.
            </p>
            <p className="home-about__text reveal" data-delay="3">
              Nous intervenons en bout de chaîne — de la stratégie à la mise
              en production — avec des engagements clairs et des livrables mesurables.
            </p>
            <div className="home-about__founder reveal" data-delay="4">
              <div className="home-about__founder-name">Jean Kevin PEMOU</div>
              <div className="home-about__founder-role">
                Consultant en technologie, IA et infrastructure
              </div>
            </div>
          </div>
          <div className="home-about__stats reveal" data-delay="2" aria-hidden="true">
            {[
              { val: '2023',     label: 'Fondé en' },
              { val: 'PME',      label: 'Cœur de marché' },
              { val: 'IA-first', label: 'Posture' },
              { val: '< 1 sem.', label: 'Prototype' },
            ].map(s => (
              <div key={s.label} className="home-about__stat">
                <span className="home-about__stat-val">{s.val}</span>
                <span className="home-about__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────── */}
      <section className="home-cta" aria-label="Prendre contact">
        <div className="container home-cta__inner">
          <p className="eyebrow home-cta__eyebrow reveal">Construisons ensemble</p>
          <h2 className="home-cta__headline reveal" data-delay="1">
            Votre prochain
            <br />
            système numérique.
          </h2>
          <Link to="/contact" className="home-cta__btn home-cta__btn--breath reveal" data-delay="2">
            Parler de votre projet
          </Link>
        </div>
      </section>

    </main>
  )
}
