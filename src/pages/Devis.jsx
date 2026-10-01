import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { useReducedMotion } from '../lib/hooks/useReducedMotion'
import { staggerContainer, fadeUp, fadeUpHeadline } from '../lib/motion'

const PROJECT_TYPES = [
  { value: 'site-vitrine',      label: 'Site vitrine',           price: 'à partir de 590 €' },
  { value: 'site-ecommerce',    label: 'Site e-commerce',        price: 'à partir de 1 090 €' },
  { value: 'landing-page',      label: 'Landing page',           price: 'à partir de 270 €' },
  { value: 'ia-automatisation', label: 'IA & Automatisation',    price: 'à partir de 800 €' },
  { value: 'sur-mesure',        label: 'Développement sur mesure', price: 'sur devis' },
  { value: 'logo',              label: 'Logo professionnel',     price: 'à partir de 180 €' },
  { value: 'identite-visuelle', label: 'Identité visuelle',      price: 'à partir de 500 €' },
]

const BUDGET_RANGES = [
  '< 500 €',
  '500 € – 1 000 €',
  '1 000 € – 3 000 €',
  '3 000 € – 5 000 €',
  '5 000 € – 10 000 €',
  '> 10 000 €',
]

function DevisForm() {
  const [form, setForm] = useState({
    contact_name: '', contact_email: '', contact_phone: '',
    project_type: '', budget_range: '', notes: '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState(null)

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
    fontSize: '11px', fontWeight: 500,
    color: 'rgba(165,172,181,0.55)',
    letterSpacing: '0.04em', textTransform: 'uppercase',
    display: 'block', marginBottom: '8px',
  }
  const onFocus = (e) => { e.target.style.borderColor = 'rgba(53,155,217,0.45)' }
  const onBlur  = (e) => { e.target.style.borderColor = 'rgba(165,172,181,0.12)' }

  const canSubmit = form.contact_email && form.project_type && status !== 'loading'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur réseau')
      setResult(data)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Une erreur est survenue. Écrivez-nous à contact@ca-tech.fr')
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
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#F2F4F6', marginBottom: '8px' }}>
          Demande reçue !
        </h3>
        {result?.devis_number && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#359BD9', marginBottom: '16px', letterSpacing: '0.04em' }}>
            Référence : {result.devis_number}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#A5ACB5', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto' }}>
          Nous préparons votre estimation et vous répondons sous 24h ouvrées. Vous recevrez votre devis par email.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
        <div>
          <label htmlFor="devis-name" style={labelStyle}>Nom</label>
          <input id="devis-name" type="text" value={form.contact_name} onChange={set('contact_name')}
            placeholder="Votre nom" autoComplete="name"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div>
          <label htmlFor="devis-email" style={labelStyle}>Email <span style={{ color: '#359BD9' }}>*</span></label>
          <input id="devis-email" type="email" value={form.contact_email} onChange={set('contact_email')}
            placeholder="vous@entreprise.fr" autoComplete="email" required
            style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="devis-phone" style={labelStyle}>Téléphone</label>
        <input id="devis-phone" type="tel" value={form.contact_phone} onChange={set('contact_phone')}
          placeholder="06 00 00 00 00" autoComplete="tel"
          style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
      </div>

      {/* Type de projet */}
      <div>
        <label htmlFor="devis-type" style={labelStyle}>Type de projet <span style={{ color: '#359BD9' }}>*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '8px', marginTop: '4px' }}>
          {PROJECT_TYPES.map(({ value, label, price }) => {
            const active = form.project_type === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, project_type: value }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px',
                  background: active ? 'rgba(53,155,217,0.10)' : 'rgba(5,16,30,0.50)',
                  border: `1px solid ${active ? 'rgba(53,155,217,0.40)' : 'rgba(165,172,181,0.10)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? '#F2F4F6' : '#A5ACB5' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: active ? '#359BD9' : 'rgba(165,172,181,0.35)', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {price}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Budget indicatif */}
      <div>
        <label htmlFor="devis-budget" style={labelStyle}>Budget indicatif</label>
        <select id="devis-budget" value={form.budget_range} onChange={set('budget_range')}
          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
          onFocus={onFocus} onBlur={onBlur}>
          <option value="" style={{ background: '#05101E' }}>Sélectionner un budget…</option>
          {BUDGET_RANGES.map(b => <option key={b} value={b} style={{ background: '#05101E' }}>{b}</option>)}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="devis-notes" style={labelStyle}>Informations complémentaires</label>
        <textarea id="devis-notes" value={form.notes} onChange={set('notes')}
          placeholder="Précisez votre projet, vos contraintes techniques, votre délai…"
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
          onFocus={onFocus} onBlur={onBlur} />
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
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#F87171', margin: 0 }}>{errorMsg}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '13px 28px',
          background: !canSubmit ? 'rgba(53,155,217,0.40)' : '#359BD9',
          color: '#fff', border: 'none', borderRadius: '6px',
          fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
          cursor: !canSubmit ? 'not-allowed' : 'pointer',
          transition: 'background 0.18s ease, transform 0.15s ease',
          alignSelf: 'flex-start',
        }}
        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = '#4AAEE0' }}
        onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = '#359BD9' }}
      >
        {status === 'loading' ? (
          <>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            Envoi en cours…
          </>
        ) : (
          <>Demander mon devis <ArrowRight size={14} /></>
        )}
      </button>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(165,172,181,0.40)', margin: 0 }}>
        * Champ obligatoire. Devis gratuit, sans engagement.
      </p>
    </form>
  )
}

export default function Devis() {
  const prefersReduced = useReducedMotion()
  const cont  = prefersReduced ? {} : staggerContainer
  const itemH = prefersReduced ? {} : fadeUpHeadline
  const item  = prefersReduced ? {} : fadeUp

  return (
    <div style={{ minHeight: '100vh', background: '#05101E', paddingTop: '64px' }}>
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 70% 0%, rgba(53,155,217,0.07) 0%, transparent 60%)',
      }} />

      <Container style={{ position: 'relative', zIndex: 1, paddingTop: '72px', paddingBottom: '80px' }}>
        <motion.div variants={cont} initial="hidden" animate="visible" style={{ marginBottom: '52px', maxWidth: '560px' }}>
          <motion.span variants={item} style={{
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: '#359BD9',
            display: 'block', marginBottom: '20px',
          }}>
            Devis gratuit
          </motion.span>

          <motion.h1 variants={itemH} style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.03em',
            color: '#F2F4F6', marginBottom: '16px',
          }}>
            Estimons votre projet ensemble.
          </motion.h1>

          <motion.p variants={item} style={{
            fontFamily: 'var(--font-body)', fontSize: '16px',
            lineHeight: 1.65, color: '#A5ACB5',
          }}>
            Remplissez ce formulaire en 2 minutes. Nous préparons votre estimation et revenons vers vous sous 24h, avec un devis détaillé et sans engagement.
          </motion.p>
        </motion.div>

        <motion.div
          variants={item} initial="hidden" animate="visible"
          style={{
            maxWidth: '780px',
            padding: '40px 44px',
            background: 'rgba(16,39,64,0.40)',
            border: '1px solid rgba(165,172,181,0.08)',
            borderRadius: '12px',
          }}
        >
          <DevisForm />
        </motion.div>

        <motion.p variants={item} initial="hidden" animate="visible" style={{
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(165,172,181,0.45)',
          marginTop: '24px',
        }}>
          Vous préférez nous écrire directement ?{' '}
          <a href="mailto:contact@ca-tech.fr" style={{ color: '#359BD9', textDecoration: 'none' }}>contact@ca-tech.fr</a>
          {' '}ou appeler le{' '}
          <a href="tel:+33775664975" style={{ color: '#359BD9', textDecoration: 'none' }}>07 75 66 49 75</a>
        </motion.p>
      </Container>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
