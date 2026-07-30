import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Contact.css'
import { usePageMeta, SITE_URL } from '../lib/seo'
import { useJsonLd, breadcrumbSchema } from '../lib/schema'

const EDGE_URL = 'https://jhcyooksjeivajdjicka.supabase.co/functions/v1/contact-form'

const COLLABORATEURS_MAP = {
  commercial: { name: 'Commercial IA',  color: '#0066FF' },
  support:    { name: 'Support IA',     color: '#7c3aed' },
  rh:         { name: 'RH IA',          color: '#0891b2' },
  juridique:  { name: 'Juridique IA',   color: '#6d28d9' },
  seo:        { name: 'SEO IA',         color: '#059669' },
  comptable:  { name: 'Comptable IA',   color: '#d97706' },
}

export default function Contact() {
  usePageMeta({
    title: 'Contact CA-TECH — Devis gratuit sous 24h · Paris, Lyon, Dijon',
    description: "Contactez CA-TECH pour un devis site web, e-commerce, application métier, CRM sur mesure, SaaS, agent IA ou automatisation. Réponse sous 24h. Diagnostic gratuit et sans engagement.",
    keywords: 'devis site internet gratuit, contact agence web, demander devis agent IA, contact développeur web Paris, devis CRM sur mesure, contact automatisation entreprise',
    path: '/contact',
  })
  useJsonLd('breadcrumb', breadcrumbSchema([
    { name: 'Accueil', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]))
  useJsonLd('contactpoint', {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#contact`,
    name: 'Contact CA-TECH',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+33-7-75-66-49-75',
        email: 'contact@ca-tech.fr',
        availableLanguage: ['French', 'English'],
        areaServed: 'FR',
      }],
    },
  })

  const [params, setParams] = useSearchParams()
  const collabId = params.get('collaborateur')
  const isDemo = params.get('demo') === '1'
  const selectedCollab = collabId ? COLLABORATEURS_MAP[collabId] : null

  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!selectedCollab) return
    const subject = isDemo
      ? `Démonstration — ${selectedCollab.name}`
      : `Demande — ${selectedCollab.name}`
    const message = isDemo
      ? `Bonjour,\n\nJe souhaite voir une démonstration du ${selectedCollab.name} appliqué à mon activité.\n\nMerci de me recontacter pour organiser un rendez-vous.`
      : `Bonjour,\n\nJe souhaite mettre en place le ${selectedCollab.name} dans mon entreprise.\n\nMerci de me recontacter pour discuter des modalités et organiser une démonstration.`
    setForm(f => ({ ...f, subject, message }))
  }, [collabId, isDemo])

  function clearCollab() {
    const next = new URLSearchParams(params)
    next.delete('collaborateur')
    next.delete('demo')
    setParams(next, { replace: true })
    setForm(f => ({ ...f, subject: '', message: '' }))
  }

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name,
          company: form.company || undefined,
          email:   form.email,
          phone:   form.phone   || undefined,
          subject: form.subject || undefined,
          message: form.message,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
      setSent(true)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter par email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="ct-hero">
        <div className="ct-grid-bg" aria-hidden="true"></div>
        <div className="ct-halo ct-halo-1" aria-hidden="true"></div>
        <div className="ct-halo ct-halo-2" aria-hidden="true"></div>
        <div className="ct-hero-inner">
          <p className="ct-kicker"><span></span>Parlons de votre projet<span></span></p>
          <h1>Contactez-<em>nous</em></h1>
          <p className="ct-sub">Une question, un projet, une démonstration ? Notre équipe répond sous 24h. Le diagnostic initial est gratuit et sans engagement.</p>
        </div>
      </section>

      <div className="ct-main-wrap">
      <section className="ct-main">
        <div className="ct-grid">

          <div className="ct-info">
            <div className="ct-info-card">
              <div className="ct-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
                </svg>
              </div>
              <div>
                <div className="ct-info-label">Email</div>
                <a href="mailto:contact@ca-tech.fr" className="ct-info-value">contact@ca-tech.fr</a>
              </div>
            </div>

            <div className="ct-info-card">
              <div className="ct-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <div className="ct-info-label">Téléphone</div>
                <a href="tel:+33775664975" className="ct-info-value">+33 7 75 66 49 75</a>
              </div>
            </div>

            <div className="ct-info-card">
              <div className="ct-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div className="ct-info-label">Zones</div>
                <div className="ct-info-value">Paris · Lyon · Dijon · Troyes</div>
              </div>
            </div>

            <div className="ct-info-card">
              <div className="ct-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div className="ct-info-label">Disponibilité</div>
                <div className="ct-info-value">Lun–Ven · 9h–19h</div>
              </div>
            </div>

            <div className="ct-devis-box">
              <p className="ct-devis-title">Besoin d'un devis complet ?</p>
              <p className="ct-devis-sub">Remplissez notre configurateur en 8 étapes pour recevoir une proposition détaillée avec les prix exacts.</p>
              <a href="/tarifs" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Voir les tarifs →</a>
            </div>
          </div>

          <div className="ct-form-wrap">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-icon">✓</div>
                <h2>Message envoyé !</h2>
                <p>Nous vous répondrons sous 24h. En attendant, vous pouvez consulter nos <Link to="/realisations">réalisations</Link> ou nos <Link to="/services">services</Link>.</p>
              </div>
            ) : (
              <form className="ct-form" onSubmit={handleSubmit}>
                {selectedCollab && (
                  <div className="ct-collab-banner" style={{ '--collab-color': selectedCollab.color }}>
                    <div className="ct-collab-info">
                      <span className="ct-collab-badge">
                        <span className="ct-collab-dot" />
                        Collaborateur sélectionné
                      </span>
                      <span className="ct-collab-name">{selectedCollab.name}</span>
                    </div>
                    <button
                      type="button"
                      className="ct-collab-close"
                      onClick={clearCollab}
                      aria-label="Retirer la sélection"
                    >×</button>
                  </div>
                )}
                <div className="ct-form-row">
                  <div className="ct-field">
                    <label htmlFor="ct-name">Nom &amp; Prénom *</label>
                    <input id="ct-name" type="text" placeholder="Jean Dupont" required value={form.name} onChange={set('name')} />
                  </div>
                  <div className="ct-field">
                    <label htmlFor="ct-company">Entreprise</label>
                    <input id="ct-company" type="text" placeholder="Mon Entreprise SAS" value={form.company} onChange={set('company')} />
                  </div>
                </div>

                <div className="ct-form-row">
                  <div className="ct-field">
                    <label htmlFor="ct-email">Email *</label>
                    <input id="ct-email" type="email" placeholder="jean@entreprise.fr" required value={form.email} onChange={set('email')} />
                  </div>
                  <div className="ct-field">
                    <label htmlFor="ct-phone">Téléphone</label>
                    <input id="ct-phone" type="tel" placeholder="+33 6 00 00 00 00" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>

                <div className="ct-field">
                  <label htmlFor="ct-subject">Sujet *</label>
                  <input id="ct-subject" type="text" placeholder="Création d'un site vitrine, question sur l'IA…" required value={form.subject} onChange={set('subject')} />
                </div>

                <div className="ct-field">
                  <label htmlFor="ct-message">Message *</label>
                  <textarea id="ct-message" rows={6} placeholder="Décrivez votre projet ou votre besoin..." required value={form.message} onChange={set('message')} />
                </div>

                {error && <p className="ct-error">{error}</p>}
                <button type="submit" className="ct-submit" disabled={loading}>
                  {loading ? 'Envoi en cours…' : 'Envoyer le message →'}
                </button>
                <p className="ct-legal">En soumettant ce formulaire, vous acceptez notre <a href="/politique-de-confidentialite">politique de confidentialité</a>.</p>
              </form>
            )}
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
