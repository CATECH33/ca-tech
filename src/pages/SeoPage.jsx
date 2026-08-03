import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, webPageSchema, breadcrumbSchema, serviceSchema, faqSchema } from '../lib/schema'
import { SeoSection, SeoProse, SeoMethod, SeoFaq } from '../components/SeoContent'

export default function SeoPage({ page }) {
  usePageMeta({
    title: page.meta.title,
    description: page.meta.description,
    keywords: page.meta.keywords,
    path: page.path,
  })

  useJsonLd('seo-page', webPageSchema({
    name: page.meta.title,
    description: page.meta.description,
    path: page.path,
    image: page.image,
    speakableCssSelectors: ['h1'],
  }))
  useJsonLd('breadcrumb', breadcrumbSchema([
    { name: 'Accueil', path: '/' },
    { name: page.breadcrumb, path: page.path },
  ]))

  useJsonLd('service', serviceSchema({
    name: page.serviceName,
    description: page.meta.description,
    path: page.path,
    serviceType: page.serviceType,
    priceRange: page.priceRange,
  }))

  useJsonLd('page-faq', page.faq ? faqSchema(page.faq) : null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => el.classList.add('visible'))
      return
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [page.path])

  const accent = page.categoryColor || '#0066FF'
  const accentBg = page.categoryBg || '#EEF4FF'

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg,#F0F6FF 0%,#F8FAFF 55%,#fff 100%)', padding: '72px 0 56px', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: '28px', fontSize: '.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Accueil</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            <span style={{ color: '#0A2540', fontWeight: 600 }}>{page.breadcrumb}</span>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: '56px', alignItems: 'start' }}>
            <div>
              <span style={{ display: 'inline-block', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, background: accentBg, padding: '5px 14px', borderRadius: '100px', marginBottom: '24px' }}>
                {page.category}
              </span>
              <h1 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, lineHeight: 1.1, color: '#0A2540', letterSpacing: '-.03em', margin: '0 0 18px' }}>
                {page.h1}
              </h1>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: accent, margin: '0 0 14px', lineHeight: 1.5 }}>
                {page.sub}
              </p>
              <p style={{ fontSize: '.975rem', lineHeight: 1.72, color: '#4a5568', margin: '0 0 32px', maxWidth: '520px' }}>
                {page.desc}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <a href={page.cta1Href || '/devis'} className="btn btn-primary">{page.cta1 || 'Demander un devis gratuit →'}</a>
                <Link to={page.cta2Href || '/services'} className="btn btn-secondary">{page.cta2 || 'Voir nos services'}</Link>
              </div>
              <p style={{ fontSize: '.78rem', color: '#9ca3af' }}>{page.micro || 'Devis gratuit · Sans engagement · Réponse sous 24h'}</p>
            </div>

            <div className="reveal" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
              <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 24px' }}>Résultats clients</p>
              {page.kpis && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
                  {page.kpis.map((kpi, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '1.9rem', fontWeight: 900, color: accent, letterSpacing: '-.03em', lineHeight: 1 }}>{kpi.value}</div>
                      <div style={{ fontSize: '.78rem', color: '#6b7280', marginTop: '5px', lineHeight: 1.4 }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {page.benefits?.slice(0, 4).map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '.875rem', color: '#374151' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFIT CARDS ────────────────────────────────────────────────── */}
      {page.benefitCards && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div className="section-header centered reveal" style={{ marginBottom: '52px' }}>
              {page.benefitsEyebrow && <span className="section-pre">{page.benefitsEyebrow}</span>}
              <h2 className="section-h2">{page.benefitsTitle}</h2>
              {page.benefitsIntro && <p className="section-intro">{page.benefitsIntro}</p>}
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: '20px', listStyle: 'none', padding: 0, margin: 0 }}>
              {page.benefitCards.map((card, i) => (
                <li key={i} className={`reveal${i % 3 === 1 ? ' d1' : i % 3 === 2 ? ' d2' : ''}`}>
                  <article style={{ background: '#F8FAFF', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '28px', height: '100%' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '14px' }} aria-hidden="true">{card.icon}</div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A2540', margin: '0 0 10px', lineHeight: 1.3 }}>{card.title}</h3>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── METHOD ───────────────────────────────────────────────────────── */}
      {page.method && (
        <SeoSection variant="gray" eyebrow="Notre méthode" title={page.methodTitle} intro={page.methodIntro}>
          <SeoMethod steps={page.method} />
        </SeoSection>
      )}

      {/* ── PROSE ────────────────────────────────────────────────────────── */}
      {page.prose && (
        <SeoSection variant="light" eyebrow={page.proseEyebrow || 'Notre expertise'} title={page.proseTitle}>
          <SeoProse columns={2}>
            {page.prose.map((block, i) =>
              block.type === 'h3'
                ? <h3 key={i}>{block.text}</h3>
                : <p key={i}>{block.text}</p>
            )}
          </SeoProse>
        </SeoSection>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {page.faq && (
        <SeoSection variant="tint" eyebrow="Questions fréquentes" title={page.faqTitle}>
          <SeoFaq items={page.faq} />
        </SeoSection>
      )}

      {/* ── RELATED ──────────────────────────────────────────────────────── */}
      {page.related?.length > 0 && (
        <section style={{ padding: '72px 0', borderTop: '1px solid #f3f4f6' }}>
          <div className="container">
            <div className="section-header centered reveal" style={{ marginBottom: '40px' }}>
              <span className="section-pre">À découvrir aussi</span>
              <h2 className="section-h2">Nos services associés</h2>
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: '14px', listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: '900px' }}>
              {page.related.map((rel, i) => (
                <li key={i} className={`reveal${i % 3 === 1 ? ' d1' : i % 3 === 2 ? ' d2' : ''}`}>
                  <Link
                    to={rel.href}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', color: '#0A2540', fontWeight: 600, fontSize: '.875rem', transition: 'border-color 200ms ease,box-shadow 200ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}25` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{rel.icon}</span>
                    {rel.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section id="cta-final" aria-labelledby="cta-seo-title">
        <div className="container">
          <div className="cta-final-pre"><span className="pill pill-dark">✦ Prêt à démarrer ?</span></div>
          <h2 className="cta-final-h2" id="cta-seo-title">{page.ctaTitle || 'Parlons de votre projet.'}</h2>
          <p className="cta-final-sub">{page.ctaSub || 'Diagnostic gratuit · Devis sous 24h · Premier livrable en 72h.'}<br />Pas d'engagement, des résultats mesurables.</p>
          <div className="cta-final-btns">
            <a href={page.cta1Href || '/devis'} className="btn btn-white btn-xl">{page.cta1 || 'Demander un devis →'}</a>
            <a href="/contact" className="btn btn-ghost-white btn-xl">Planifier un rendez-vous</a>
          </div>
          <p className="cta-final-micro">Gratuit · Sans engagement · Réponse sous 24h</p>
        </div>
      </section>
    </>
  )
}
