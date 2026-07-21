import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Services.css'

const NAV_ITEMS = [
  { id: 'creation',        label: 'Création de sites' },
  { id: 'refonte',         label: 'Refonte' },
  { id: 'seo',             label: 'SEO' },
  { id: 'apps',            label: 'Applications métier' },
  { id: 'collab-ia',       label: 'Collaborateurs IA' },
  { id: 'automatisations', label: 'Automatisations' },
  { id: 'maintenance',     label: 'Maintenance' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Services() {
  useEffect(() => {
    /* ── Canvas particles ── */
    const cv = document.getElementById('srvCanvas')
    let rafId
    if (cv) {
      const cx = cv.getContext('2d')
      let W, H, pts = []
      const N = 40, LK = 100
      const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
      window.addEventListener('resize', resize, { passive: true })
      resize()
      const r = (a, b) => a + Math.random() * (b - a)
      for (let i = 0; i < N; i++) pts.push({ x: r(0, W), y: r(0, H), vx: r(-.2, .2), vy: r(-.2, .2), s: r(.8, 1.6) })
      const frame = () => {
        cx.clearRect(0, 0, W, H)
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
          cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
          cx.fillStyle = 'rgba(0,102,255,.4)'; cx.fill()
        })
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LK) {
            cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y)
            cx.strokeStyle = `rgba(0,102,255,${.08 * (1 - d / LK)})`; cx.lineWidth = 1; cx.stroke()
          }
        }
        rafId = requestAnimationFrame(frame)
      }
      frame()
    }

    /* ── Scroll reveal sections ── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('srv-vis'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    document.querySelectorAll('[data-srv]').forEach(el => obs.observe(el))

    /* ── Active nav link ── */
    const navLinks = document.querySelectorAll('.srv-nav-link')
    const sectionIds = NAV_ITEMS.map(n => n.id)
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const link = document.querySelector(`.srv-nav-link[href="#${e.target.id}"]`)
        if (link) link.classList.toggle('active', e.isIntersecting)
      })
    }, { rootMargin: '-40% 0px -40% 0px' })
    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) navObs.observe(el) })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', () => {})
      obs.disconnect()
      navObs.disconnect()
    }
  }, [])

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="sol-hero">
        <canvas className="sol-canvas" id="srvCanvas" aria-hidden="true" />
        <div className="sol-grid-bg" aria-hidden="true" />
        <div className="sol-halo sol-halo-1" aria-hidden="true" />
        <div className="sol-halo sol-halo-2" aria-hidden="true" />
        <div className="sol-hero-inner">
          <p className="sol-kicker"><span />Nos services · CA-TECH<span /></p>
          <h1 className="sol-h1">Sept expertises pour<br /><em>votre croissance.</em></h1>
          <p className="sol-sub">De la création de site à la maintenance — des services complémentaires, conçus pour digitaliser, automatiser et développer votre activité.</p>
          <div className="sol-hero-btns">
            <button className="sol-btn-main" onClick={() => scrollTo('creation')}>
              Explorer les services
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <Link to="/contact" className="sol-btn-ghost">Prendre contact →</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          QUICK NAV
      ══════════════════════════════════════════════════════ */}
      <nav className="srv-nav" aria-label="Accès rapide aux services">
        <div className="srv-nav-track">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="srv-nav-link" onClick={e => { e.preventDefault(); scrollTo(id) }}>{label}</a>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          01 · CRÉATION DE SITES
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service" id="creation" data-srv>
        <div className="srv-inner">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Création de site web"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">01</p>
            <h2 className="srv-h2">Création de <em>sites web</em></h2>
            <p className="srv-desc">Sites vitrines, e-commerce et landing pages conçus pour convertir. Design premium, mobile-first, optimisé SEO dès le départ — livraison en 1 à 3 semaines.</p>
            <ul className="srv-benefits">
              <li>Design sur mesure, fidèle à votre image de marque</li>
              <li>100 % responsive — mobile, tablette, desktop</li>
              <li>Score Lighthouse &gt; 90, chargement &lt; 2 secondes</li>
              <li>Hébergement, domaine et SSL inclus la 1ère année</li>
            </ul>
            <Link to="/contact" className="srv-btn">
              Découvrir
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          02 · REFONTE
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service srv-alt" id="refonte" data-srv>
        <div className="srv-inner srv-inner--rev">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Refonte de site internet"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">02</p>
            <h2 className="srv-h2">Refonte de <em>site internet</em></h2>
            <p className="srv-desc">Votre site est daté ou ne convertit plus ? On le transforme en profondeur — nouveau design, nouvelle performance, contenu préservé et SEO protégé.</p>
            <ul className="srv-benefits">
              <li>Audit UX et performance complet avant démarrage</li>
              <li>Préservation des positions SEO (redirections, balises)</li>
              <li>Migration de contenu incluse</li>
              <li>Délai : 1 à 2 semaines selon la taille du site</li>
            </ul>
            <Link to="/contact" className="srv-btn">
              Découvrir
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          03 · SEO
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service" id="seo" data-srv>
        <div className="srv-inner">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Référencement naturel SEO"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">03</p>
            <h2 className="srv-h2">SEO et <em>référencement</em></h2>
            <p className="srv-desc">Votre site remonte sur Google avec une stratégie pilotée par les données. Mots-clés ciblés, contenu optimisé, SEO local — résultats mesurables sous 90 jours.</p>
            <ul className="srv-benefits">
              <li>Audit SEO complet offert au démarrage</li>
              <li>Production de contenu optimisé chaque mois</li>
              <li>SEO local : fiche Google My Business incluse</li>
              <li>Reporting mensuel avec positions et trafic</li>
            </ul>
            <Link to="/contact" className="srv-btn">
              Découvrir
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          04 · APPLICATIONS MÉTIER
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service srv-alt" id="apps" data-srv>
        <div className="srv-inner srv-inner--rev">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Applications métier sur mesure"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">04</p>
            <h2 className="srv-h2">Applications <em>métier</em></h2>
            <p className="srv-desc">Des outils sur mesure pour vos équipes. CRM, tableaux de bord, portails clients et espaces collaboratifs — conçus pour vos processus, pas pour un usage générique.</p>
            <ul className="srv-benefits">
              <li>Développement 100 % adapté à votre secteur</li>
              <li>Interface simple, prise en main en moins d'une heure</li>
              <li>Intégration avec vos outils existants (ERP, CRM…)</li>
              <li>Évolutions et maintenance incluses dans l'abonnement</li>
            </ul>
            <Link to="/contact" className="srv-btn">
              Découvrir
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          05 · COLLABORATEURS IA
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service srv-service--special" id="collab-ia" data-srv>
        <div className="srv-inner">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Collaborateurs IA"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">05</p>
            <h2 className="srv-h2">Collaborateurs <em>IA</em></h2>
            <p className="srv-desc">Des agents IA spécialisés qui prennent en charge vos processus métier. Ventes, support, RH, comptabilité — disponibles 24h/24, sans embaucher.</p>
            <ul className="srv-benefits">
              <li>Opérationnel en 48h, sans formation requise</li>
              <li>ROI visible dès le premier mois</li>
              <li>Compatible Google Workspace et Microsoft 365</li>
              <li>Support humain inclus, intervention sous 4h</li>
            </ul>
            <Link to="/collaborateurs-ia" className="srv-btn srv-btn--special">
              Voir la page dédiée
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          06 · AUTOMATISATIONS
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service srv-alt srv-service--special" id="automatisations" data-srv>
        <div className="srv-inner srv-inner--rev">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Automatisations de processus"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">06</p>
            <h2 className="srv-h2">Automatisa&shy;tions</h2>
            <p className="srv-desc">Connectez vos outils et éliminez les tâches répétitives. Relances, devis, reporting, synchronisation de données — automatisés sans coder, déployés en 48h.</p>
            <ul className="srv-benefits">
              <li>+15h récupérées par semaine en moyenne</li>
              <li>50+ connecteurs disponibles (Zapier, Make, n8n…)</li>
              <li>Sans code, sans formation</li>
              <li>Déployé et opérationnel en 48h</li>
            </ul>
            <Link to="/automatisations" className="srv-btn srv-btn--special">
              Voir la page dédiée
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          07 · MAINTENANCE
      ══════════════════════════════════════════════════════ */}
      <section className="srv-service" id="maintenance" data-srv>
        <div className="srv-inner">
          <div className="srv-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=720&h=520&fit=crop&q=80&auto=format"
              alt="Maintenance et support technique"
              width="720" height="520" loading="lazy" decoding="async"
            />
          </div>
          <div className="srv-content">
            <p className="srv-num">07</p>
            <h2 className="srv-h2">Maintenance et <em>support</em></h2>
            <p className="srv-desc">On s'occupe de votre site ou application après la livraison. Mises à jour, sécurité, sauvegardes et support technique réactif — vous n'avez plus à y penser.</p>
            <ul className="srv-benefits">
              <li>Mises à jour hebdomadaires, plugins et CMS inclus</li>
              <li>Sauvegardes automatiques quotidiennes</li>
              <li>Monitoring 24h/24 (uptime, performances, sécurité)</li>
              <li>Support français, intervention garantie sous 4h</li>
            </ul>
            <Link to="/contact" className="srv-btn">
              Découvrir
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="sol-cta">
        <div className="sol-cta-inner">
          <p className="sol-cta-label">Passons à l'action</p>
          <h2 className="sol-cta-title">Vous ne savez pas par <strong>où commencer ?</strong></h2>
          <p className="sol-cta-sub">On analyse votre situation gratuitement et on vous recommande le service le plus adapté — en 30 minutes, sans engagement.</p>
          <div className="sol-cta-btns">
            <Link to="/contact" className="sol-btn-main">Demander un audit gratuit →</Link>
            <Link to="/realisations" className="sol-btn-ghost">Voir nos réalisations</Link>
          </div>
        </div>
      </section>
    </>
  )
}
