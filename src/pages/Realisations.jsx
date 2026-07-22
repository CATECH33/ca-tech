import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Realisations.css'

const CATEGORIES = [
  { key: 'tous', label: 'Tous les projets' },
  { key: 'sites', label: 'Sites web' },
  { key: 'automatisations', label: 'Automatisations' },
  { key: 'collaborateurs', label: 'Collaborateurs IA' },
  { key: 'seo', label: 'SEO' },
  { key: 'applications', label: 'Applications' },
]

const CAT_COLORS = {
  sites:          { bg: 'rgba(124,58,237,.13)', color: '#7c3aed', dot: '#7c3aed' },
  automatisations:{ bg: 'rgba(0,102,255,.12)',  color: '#0066FF', dot: '#0066FF' },
  collaborateurs: { bg: 'rgba(16,185,129,.12)', color: '#059669', dot: '#059669' },
  seo:            { bg: 'rgba(245,158,11,.14)', color: '#d97706', dot: '#d97706' },
  applications:   { bg: 'rgba(239,68,68,.12)',  color: '#dc2626', dot: '#dc2626' },
}

const PROJECTS = [
  /* ── Sites web ── */
  {
    id: 'boutique-mode',
    cat: 'sites',
    title: 'Boutique mode en ligne',
    company: 'Camille & Co · Paris',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    probleme: 'Aucune présence en ligne, 100 % des ventes en boutique physique, saisonnalité forte.',
    solution: 'E-commerce Stripe + SEO local + automatisation stocks & commandes + Google Shopping.',
    resultats: [
      { val: '+280 %', lbl: 'Chiffre d\'affaires' },
      { val: '−12 h',  lbl: 'Admin / semaine' },
      { val: '4 sem.', lbl: 'Délai de lancement' },
    ],
    techs: ['React', 'Stripe', 'Node.js', 'Google Shopping'],
  },
  {
    id: 'restaurant-bordeaux',
    cat: 'sites',
    title: 'Restaurant gastronomique premium',
    company: 'Antoine R. · Bordeaux',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    probleme: 'Réservations 100 % téléphoniques, zéro présence en ligne structurée.',
    solution: 'Site vitrine premium + réservation en ligne + identité visuelle + stratégie Google.',
    resultats: [
      { val: '+220 %', lbl: 'Réservations' },
      { val: '4.9 ★',  lbl: 'Note Google' },
      { val: '−6 h',   lbl: 'Admin / semaine' },
    ],
    techs: ['Vite', 'TheFork', 'Google Business', 'Figma'],
  },
  {
    id: 'cabinet-dentaire',
    cat: 'sites',
    title: 'Cabinet dentaire connecté',
    company: 'Dr. Laurent M. · Paris 15e',
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
    probleme: 'Agenda 100 % téléphonique, secrétaire surchargée, 30 % de no-shows.',
    solution: 'Site + RDV en ligne + rappels SMS automatiques + fiche patient digitale.',
    resultats: [
      { val: '−75 %', lbl: 'Appels entrants' },
      { val: '−90 %', lbl: 'No-shows' },
      { val: '+15 h',  lbl: 'Libérées / semaine' },
    ],
    techs: ['React', 'Calendly', 'Twilio', 'Stripe'],
  },

  /* ── Automatisations ── */
  {
    id: 'cabinet-rh-reporting',
    cat: 'automatisations',
    title: 'Reporting RH entièrement automatisé',
    company: 'Cabinet RH · Lyon',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    probleme: 'Reporting 100 % manuel sur Excel, chaque proposition reconstruite de zéro.',
    solution: 'Pipeline : données → rapport → envoi client, templates intelligents, CRM intégré.',
    resultats: [
      { val: '−80 %', lbl: 'Temps reporting' },
      { val: '+40 %', lbl: 'Missions signées' },
      { val: '+20 h',  lbl: 'Récupérées / mois' },
    ],
    techs: ['n8n', 'Google Sheets', 'HubSpot', 'Make'],
  },
  {
    id: 'agence-immo-leads',
    cat: 'automatisations',
    title: 'Pipeline leads immobiliers',
    company: 'Agence Bordelais · Toulouse',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    probleme: 'Leads dispersés, suivi manuel, 100 % dépendant des portails payants.',
    solution: 'Qualification automatique + CRM + scoring leads + relances séquencées.',
    resultats: [
      { val: '+315 %', lbl: 'Leads qualifiés' },
      { val: '−60 %',  lbl: 'Coût d\'acquisition' },
      { val: '−8 h',   lbl: 'Admin / semaine' },
    ],
    techs: ['Zapier', 'HubSpot', 'Slack', 'Google Ads'],
  },
  {
    id: 'facturation-auto',
    cat: 'automatisations',
    title: 'Facturation e-commerce automatisée',
    company: 'Startup SaaS · Nantes',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    probleme: 'Facturation manuelle pour 200+ commandes/mois, erreurs comptables fréquentes.',
    solution: 'Pipeline commande → facture → comptabilité → relances impayés, 100 % auto.',
    resultats: [
      { val: '−95 %', lbl: 'Erreurs compta' },
      { val: '+18 h',  lbl: 'Libérées / semaine' },
      { val: '×3',    lbl: 'Volume traité' },
    ],
    techs: ['Make', 'Stripe', 'QuickBooks', 'Notion'],
  },

  /* ── Collaborateurs IA ── */
  {
    id: 'commercial-ia',
    cat: 'collaborateurs',
    title: 'Commercial IA — Loïc',
    company: 'Agence de services · Bordeaux',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
    probleme: 'Commerciaux débordés, relances oubliées, pipeline CRM mal suivi.',
    solution: 'Commercial IA qui qualifie, relance et planifie les RDV automatiquement 24 h/24.',
    resultats: [
      { val: '+38 %', lbl: 'Taux de conversion' },
      { val: '−12 h', lbl: 'Admin com. / sem.' },
      { val: '×2.4',  lbl: 'Leads traités' },
    ],
    techs: ['Claude API', 'HubSpot', 'Gmail', 'Calendly'],
  },
  {
    id: 'support-ia',
    cat: 'collaborateurs',
    title: 'Support IA 24/7',
    company: 'E-commerce · Paris',
    img: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=80',
    probleme: '300+ tickets/semaine, équipe saturée, délai de réponse supérieur à 24 h.',
    solution: 'Collaborateur IA qui répond en < 2 min, traite 80 % des tickets, escalade le reste.',
    resultats: [
      { val: '−78 %',  lbl: 'Tickets humains' },
      { val: '< 2 min', lbl: 'Délai de réponse' },
      { val: '97 %',   lbl: 'Satisfaction client' },
    ],
    techs: ['Claude API', 'Intercom', 'Notion KB', 'Slack'],
  },

  /* ── SEO ── */
  {
    id: 'seo-local-boutique',
    cat: 'seo',
    title: 'SEO local — Boutique spécialisée',
    company: 'Greenlab · Lyon',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    probleme: 'Invisible sur Google, 100 % du trafic payant, concurrence féroce.',
    solution: 'SEO local + 40 pages optimisées + Google Business + schema markup complet.',
    resultats: [
      { val: '+420 %', lbl: 'Trafic organique' },
      { val: 'Top 3',  lbl: 'Positions Google' },
      { val: '−70 %',  lbl: 'Budget pub' },
    ],
    techs: ['Next.js', 'Search Console', 'Ahrefs', 'Schema.org'],
  },
  {
    id: 'seo-coach',
    cat: 'seo',
    title: 'SEO national — Coach bien-être',
    company: 'Sarah M. · Paris',
    img: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
    probleme: 'Zéro visibilité organique, uniquement référencée sur Instagram.',
    solution: 'Blog SEO IA-assisté + 60 articles optimisés + maillage interne + netlinking.',
    resultats: [
      { val: '1 200+', lbl: 'Visiteurs / mois' },
      { val: '+18',    lbl: 'Mots-clés top 10' },
      { val: '+65 %',  lbl: 'Nouveaux clients' },
    ],
    techs: ['WordPress', 'Semrush', 'Claude AI', 'Ahrefs'],
  },

  /* ── Applications ── */
  {
    id: 'app-rdv-multi',
    cat: 'applications',
    title: 'App RDV multi-praticiens',
    company: 'Centre médical · Marseille',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    probleme: 'Planning sur papier pour 8 praticiens, conflits d\'agenda quotidiens.',
    solution: 'App web sur mesure : agenda partagé + alertes SMS + paiement en ligne + stats.',
    resultats: [
      { val: '0',     lbl: 'Conflits planning' },
      { val: '+45 %', lbl: 'Taux de remplissage' },
      { val: '−22 h', lbl: 'Admin / semaine' },
    ],
    techs: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
  },
  {
    id: 'dashboard-analytics',
    cat: 'applications',
    title: 'Dashboard analytics unifié',
    company: 'Startup DTC · Nantes',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    probleme: 'Données dispersées entre Shopify, Meta Ads, GA4 — aucune vue centralisée.',
    solution: 'Dashboard temps réel unifiant toutes les sources + alertes auto + export PDF.',
    resultats: [
      { val: '×4',    lbl: 'Rapidité décision' },
      { val: '+28 %', lbl: 'ROAS Ads' },
      { val: '1 vue', lbl: 'Toutes les données' },
    ],
    techs: ['React', 'FastAPI', 'BigQuery', 'Metabase'],
  },
]

export default function Realisations() {
  const [active, setActive] = useState('tous')
  const [liveProjects, setLiveProjects] = useState(null) // null = loading, [] = empty

  useEffect(() => {
    supabase
      .from('portfolio_projects')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLiveProjects(data.map(r => ({
            id: r.id,
            cat: r.category ?? 'sites',
            title: r.title,
            company: r.client_name ?? '',
            img: r.thumbnail_url ?? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            probleme: r.probleme ?? r.description ?? '',
            solution: r.solution ?? '',
            resultats: Array.isArray(r.resultats) ? r.resultats : [],
            techs: Array.isArray(r.technologies) ? r.technologies : [],
            url: r.live_url ?? null,
          })))
        } else {
          setLiveProjects([])
        }
      })
  }, [])

  const projects = liveProjects && liveProjects.length > 0 ? liveProjects : PROJECTS

  const visible = useMemo(
    () => active === 'tous' ? projects : projects.filter(p => p.cat === active),
    [active, projects]
  )

  /* ── Particles (hero canvas) ── */
  useEffect(() => {
    const cv = document.getElementById('ccCanvas')
    if (!cv) return
    const cx = cv.getContext('2d')
    let W, H, rafId
    const pts = []
    const N = 38, LK = 95

    function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
    window.addEventListener('resize', resize, { passive: true }); resize()
    function r(a, b) { return a + Math.random() * (b - a) }
    for (let i = 0; i < N; i++) pts.push({ x: r(0, W), y: r(0, H), vx: r(-.14, .14), vy: r(-.14, .14), s: r(.6, 1.4) })

    ;(function frame() {
      cx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        cx.fillStyle = 'rgba(0,102,255,.32)'; cx.fill()
      })
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < LK) {
          cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y)
          cx.strokeStyle = `rgba(0,102,255,${0.06 * (1 - d / LK)})`; cx.lineWidth = 1; cx.stroke()
        }
      }
      rafId = requestAnimationFrame(frame)
    })()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  /* ── Scroll reveal (CTA) ── */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('cc-vis'); obs.unobserve(e.target) } })
    }, { threshold: 0.15 })
    document.querySelectorAll('.cc-cta-inner').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ════════════ HERO ════════════ */}
      <section className="cc-hero">
        <canvas className="cc-canvas" id="ccCanvas" aria-hidden="true"></canvas>
        <div className="cc-grid-bg" aria-hidden="true"></div>
        <div className="cc-halo cc-halo-1" aria-hidden="true"></div>
        <div className="cc-halo cc-halo-2" aria-hidden="true"></div>

        <div className="cc-hero-inner">
          <p className="cc-eyebrow"><span></span>Portfolio · Résultats réels<span></span></p>
          <h1 className="cc-h1">Des projets qui parlent<br /><em>d'eux-mêmes</em></h1>
          <p className="cc-sub">Résultats mesurables, délais tenus, clients satisfaits. Voici ce que nous construisons ensemble, secteur par secteur.</p>

          <div className="cc-hband">
            <div className="cc-hstat">
              <div className="cc-hstat-n"><em>200</em>+</div>
              <div className="cc-hstat-l">Projets livrés</div>
            </div>
            <div className="cc-hstat">
              <div className="cc-hstat-n"><em>4.9</em>★</div>
              <div className="cc-hstat-l">Satisfaction client</div>
            </div>
            <div className="cc-hstat">
              <div className="cc-hstat-n">−<em>60</em>%</div>
              <div className="cc-hstat-l">Temps économisé en moy.</div>
            </div>
            <div className="cc-hstat">
              <div className="cc-hstat-n">+<em>250</em>%</div>
              <div className="cc-hstat-l">ROI moyen constaté</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FILTER BAR ════════════ */}
      <div className="pf-filters-bar">
        <div className="pf-filters-inner">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              className={`pf-filter-btn${active === c.key ? ' pf-filter-btn--active' : ''}`}
              onClick={() => setActive(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════ PORTFOLIO GRID ════════════ */}
      <section className="pf-section">
        <div className="pf-grid">
          {visible.map((project, i) => {
            const cs = CAT_COLORS[project.cat]
            const catLabel = CATEGORIES.find(c => c.key === project.cat)?.label
            return (
              <article
                key={`${active}-${project.id}`}
                className="pf-card"
                style={{ '--pf-color': cs.color, animationDelay: `${i * 0.07}s` }}
              >
                {/* Image */}
                <div className="pf-card-img-wrap">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="pf-card-img"
                    loading="lazy"
                  />
                  <span className="pf-cat-badge" style={{ background: cs.bg, color: cs.color }}>
                    <span className="pf-cat-dot" style={{ background: cs.dot }}></span>
                    {catLabel}
                  </span>
                </div>

                {/* Body */}
                <div className="pf-card-body">
                  <div>
                    <h3 className="pf-card-title">{project.title}</h3>
                    <p className="pf-card-company">{project.company}</p>
                  </div>

                  <div className="pf-ps">
                    <div className="pf-prob">
                      <span className="pf-ps-lbl">Problème</span>
                      <p>{project.probleme}</p>
                    </div>
                    <div className="pf-sol">
                      <span className="pf-ps-lbl">Solution</span>
                      <p>{project.solution}</p>
                    </div>
                  </div>

                  <div className="pf-resultats">
                    {project.resultats.map((r, ri) => (
                      <div key={ri} className="pf-stat">
                        <div className="pf-stat-val">{r.val}</div>
                        <div className="pf-stat-lbl">{r.lbl}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pf-techs">
                    {project.techs.map(t => (
                      <span key={t} className="pf-tech">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pf-card-foot">
                  {project.url ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="pf-cta">
                      Voir le projet
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                    </a>
                  ) : (
                    <Link to="/contact" className="pf-cta">
                      Demander un devis
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="cc-cta">
        <div className="cc-cta-inner">
          <p className="cc-cta-ey">Votre entreprise, demain</p>
          <h2 className="cc-cta-title">Votre succès pourrait être<br />la prochaine étude de cas</h2>
          <p className="cc-cta-sub">Prenons 30 minutes pour analyser votre situation. On vous dit exactement ce qu'on peut accomplir ensemble — et ce que ça vous rapportera.</p>
          <div className="cc-cta-btns">
            <Link to="/contact" className="cc-btn-w">Demander un audit gratuit →</Link>
            <Link to="/services" className="cc-btn-g">Voir toutes les solutions</Link>
          </div>
        </div>
      </section>
    </>
  )
}
