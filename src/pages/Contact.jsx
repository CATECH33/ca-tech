import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { useReducedMotion } from '../lib/hooks/useReducedMotion'
import { staggerContainer, fadeUp, fadeUpHeadline, viewport } from '../lib/motion'

const SUBJECTS = [
  'Agent IA / Automatisation',
  'Développement web',
  'LLM & MCP',
  'Diagnostic gratuit',
  'Autre demande',
]

function ContactInfo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <a
        href="mailto:contact@ca-tech.fr"
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          textDecoration: 'none',
          padding: '18px 20px',
          background: 'rgba(16,39,64,0.55)',
          border: '1px solid rgba(165,172,181,0.10)',
          borderRadius: '10px',
          transition: 'border-color 0.18s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(53,155,217,0.30)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(165,172,181,0.10)'}
      >
        <div style={{
          width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(53,155,217,0.10)',
          border: '1px solid rgba(53,155,217,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mail size={16} color="#359BD9" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(165,172,181,0.55)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '3px' }}>
            Email
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: '#F2F4F6' }}>
            contact@ca-tech.fr
          </div>
        </div>
      </a>

      <a
        href="tel:+33775664975"
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          textDecoration: 'none',
          padding: '18px 20px',
          background: 'rgba(16,39,64,0.55)',
          border: '1px solid rgba(165,172,181,0.10)',
          borderRadius: '10px',
          transition: 'border-color 0.18s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(53,155,217,0.30)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(165,172,181,0.10)'}
      >
        <div style={{
          width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(53,155,217,0.10)',
          border: '1px solid rgba(53,155,217,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Phone size={16} color="#359BD9" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(165,172,181,0.55)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '3px' }}>
            Téléphone
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: '#F2F4F6' }}>
            07 75 66 49 75
          </div>
        </div>
      </a>

      <div style={{
        padding: '18px 20px',
        background: 'rgba(16,39,64,0.35)',
        border: '1px solid rgba(165,172,181,0.06)',
        borderRadius: '10px',
      }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#A5ACB5', lineHeight: 1.6 }}>
          Réponse sous <span style={{ color: '#F2F4F6', fontWeight: 500 }}>24h ouvrées</span> — Basé en France, actif partout.
        </div>
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(165,172,181,0.06)' }}>
          {['SIRET 93344494500012', 'Équipe 100 % France', 'Sans engagement'].map(badge => (
            <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(53,155,217,0.60)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(165,172,181,0.55)', letterSpacing: '0.02em' }}>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(5,16,30,0.60)',
    border: '1px solid rgba(165,172,181,0.12)',
    borderRadius: '6px',
    padding: '12px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    color: '#F2F4F6',
    outline: 'none',
    transition: 'border-color 0.18s ease',
  }
  const labelStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(165,172,181,0.55)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.message) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur réseau')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Une erreur est survenue. Réessayez ou écrivez directement à contact@ca-tech.fr')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          padding: '48px 40px',
          background: 'rgba(16,39,64,0.55)',
          border: '1px solid rgba(53,155,217,0.20)',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <CheckCircle2 size={40} color="#22C55E" style={{ margin: '0 auto 20px' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#F2F4F6', marginBottom: '12px' }}>
          Message envoyé !
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#A5ACB5', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto' }}>
          Nous revenons vers vous sous 24h ouvrées. En attendant, vous pouvez nous appeler au{' '}
          <a href="tel:+33775664975" style={{ color: '#359BD9', textDecoration: 'none' }}>07 75 66 49 75</a>.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
        <div>
          <label htmlFor="contact-name" style={labelStyle}>Nom</label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Votre nom"
            autoComplete="name"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(53,155,217,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(165,172,181,0.12)'}
          />
        </div>
        <div>
          <label htmlFor="contact-email" style={labelStyle}>Email <span style={{ color: '#359BD9' }}>*</span></label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="vous@entreprise.fr"
            autoComplete="email"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(53,155,217,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(165,172,181,0.12)'}
          />
        </div>
      </div>

      {/* Téléphone + Sujet */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
        <div>
          <label htmlFor="contact-phone" style={labelStyle}>Téléphone</label>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="06 00 00 00 00"
            autoComplete="tel"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(53,155,217,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(165,172,181,0.12)'}
          />
        </div>
        <div>
          <label htmlFor="contact-subject" style={labelStyle}>Sujet</label>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={set('subject')}
            style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
            onFocus={e => e.target.style.borderColor = 'rgba(53,155,217,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(165,172,181,0.12)'}
          >
            <option value="" style={{ background: '#05101E' }}>Choisir un sujet…</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s} style={{ background: '#05101E' }}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" style={labelStyle}>Message <span style={{ color: '#359BD9' }}>*</span></label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={set('message')}
          placeholder="Décrivez votre projet ou votre question…"
          required
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
          onFocus={e => e.target.style.borderColor = 'rgba(53,155,217,0.45)'}
          onBlur={e => e.target.style.borderColor = 'rgba(165,172,181,0.12)'}
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.20)',
          borderRadius: '6px',
        }}>
          <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#F87171', margin: 0 }}>
            {errorMsg}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading' || !form.email || !form.message}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '13px 28px',
          background: (!form.email || !form.message) ? 'rgba(53,155,217,0.40)' : '#359BD9',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: (!form.email || !form.message || status === 'loading') ? 'not-allowed' : 'pointer',
          transition: 'background 0.18s ease, transform 0.15s ease',
          alignSelf: 'flex-start',
        }}
        onMouseEnter={e => { if (form.email && form.message && status !== 'loading') e.currentTarget.style.background = '#4AAEE0' }}
        onMouseLeave={e => { if (form.email && form.message && status !== 'loading') e.currentTarget.style.background = '#359BD9' }}
      >
        {status === 'loading' ? (
          <>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            Envoi en cours…
          </>
        ) : (
          <>
            Envoyer le message
            <ArrowRight size={14} />
          </>
        )}
      </button>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(165,172,181,0.40)', margin: 0, lineHeight: 1.5 }}>
        * Champs obligatoires. Vos données sont utilisées uniquement pour vous répondre — conformément à notre{' '}
        <a href="/politique-de-confidentialite" style={{ color: 'rgba(165,172,181,0.55)', textDecoration: 'underline' }}>politique de confidentialité</a>.
      </p>
    </form>
  )
}

export default function Contact() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const itemH = prefersReduced ? {} : fadeUpHeadline
  const item  = prefersReduced ? {} : fadeUp

  return (
    <div style={{ minHeight: '100vh', background: '#05101E', paddingTop: '64px' }}>
      {/* Ambient */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 0%, rgba(53,155,217,0.07) 0%, transparent 60%)',
      }} />

      <Container style={{ position: 'relative', zIndex: 1, paddingTop: '72px', paddingBottom: '80px' }}>
        <motion.div
          variants={cont}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: '64px', maxWidth: '560px' }}
        >
          <motion.span
            variants={item}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
              display: 'block', marginBottom: '20px',
            }}
          >
            Contact
          </motion.span>

          <motion.h1
            variants={itemH}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              color: '#F2F4F6',
              marginBottom: '16px',
            }}
          >
            Parlons de votre projet.
          </motion.h1>

          <motion.p
            variants={item}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: 1.65,
              color: '#A5ACB5',
            }}
          >
            Décrivez votre situation en quelques lignes. Nous revenons vers vous sous 24h avec une première analyse, sans engagement.
          </motion.p>
        </motion.div>

        {/* Grid : form + contact info */}
        <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '48px', alignItems: 'start' }}>
          {/* Form — left 7 cols */}
          <motion.div
            className="lg:col-span-7"
            variants={item}
            initial="hidden"
            animate="visible"
            style={{
              padding: '36px 40px',
              background: 'rgba(16,39,64,0.40)',
              border: '1px solid rgba(165,172,181,0.08)',
              borderRadius: '12px',
            }}
          >
            <ContactForm />
          </motion.div>

          {/* Contact info — right 5 cols */}
          <motion.div
            className="lg:col-span-5"
            variants={item}
            initial="hidden"
            animate="visible"
          >
            <ContactInfo />
          </motion.div>
        </div>
      </Container>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
