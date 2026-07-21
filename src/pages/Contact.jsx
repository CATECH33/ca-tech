import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <section className="ct-hero">
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
              <a href="/devis" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Configurer mon projet →</a>
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
                <div className="ct-form-row">
                  <div className="ct-field">
                    <label htmlFor="ct-name">Nom &amp; Prénom *</label>
                    <input id="ct-name" type="text" placeholder="Jean Dupont" required value={form.name} onChange={set('name')} />
                  </div>
                  <div className="ct-field">
                    <label htmlFor="ct-email">Email *</label>
                    <input id="ct-email" type="email" placeholder="jean@entreprise.fr" required value={form.email} onChange={set('email')} />
                  </div>
                </div>

                <div className="ct-field">
                  <label htmlFor="ct-phone">Téléphone</label>
                  <input id="ct-phone" type="tel" placeholder="+33 6 00 00 00 00" value={form.phone} onChange={set('phone')} />
                </div>

                <div className="ct-field">
                  <label htmlFor="ct-message">Message *</label>
                  <textarea id="ct-message" rows={6} placeholder="Décrivez votre projet ou votre besoin..." required value={form.message} onChange={set('message')} />
                </div>

                <button type="submit" className="ct-submit">Envoyer le message →</button>
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
