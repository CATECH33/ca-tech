import { useState } from 'react'
import './SeoContent.css'

/* ══════════════════════════════════════════════════
   Section — wrapper avec header (eyebrow + h2 + intro)
══════════════════════════════════════════════════ */
export function SeoSection({ eyebrow, title, intro, children, variant = 'light', id }) {
  return (
    <section className={`seo-section seo-section--${variant}`} id={id}>
      <div className="seo-section-inner">
        {(eyebrow || title || intro) && (
          <header className="seo-section-header">
            {eyebrow && <span className="seo-eyebrow">{eyebrow}</span>}
            {title && <h2 className="seo-h2">{title}</h2>}
            {intro && <p className="seo-intro">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   Prose — colonnes de paragraphes riches
══════════════════════════════════════════════════ */
export function SeoProse({ columns = 1, children }) {
  return <div className={`seo-prose seo-prose--${columns === 2 ? 'two' : 'one'}`}>{children}</div>
}

/* ══════════════════════════════════════════════════
   Method — étapes numérotées (méthodologie)
══════════════════════════════════════════════════ */
export function SeoMethod({ steps }) {
  return (
    <ol className="seo-method">
      {steps.map((s, i) => (
        <li key={i} className="seo-method-step">
          <span className="seo-method-num">{String(i + 1).padStart(2, '0')}</span>
          <div className="seo-method-body">
            <h3 className="seo-method-title">{s.title}</h3>
            <p className="seo-method-desc">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ══════════════════════════════════════════════════
   Comparison — tableau 2/3 colonnes
══════════════════════════════════════════════════ */
export function SeoComparison({ columns, rows }) {
  return (
    <div className="seo-compare-wrap">
      <table className="seo-compare">
        <thead>
          <tr>
            <th aria-hidden="true"></th>
            {columns.map((c, i) => (
              <th key={i} className={c.highlight ? 'seo-compare-th--highlight' : ''}>
                <span className="seo-compare-th-label">{c.label}</span>
                {c.sub && <span className="seo-compare-th-sub">{c.sub}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th scope="row" className="seo-compare-row-label">{r.label}</th>
              {r.values.map((v, j) => (
                <td key={j} className={columns[j]?.highlight ? 'seo-compare-td--highlight' : ''}>
                  {typeof v === 'boolean'
                    ? (v
                      ? <span className="seo-compare-check" aria-label="Oui">✓</span>
                      : <span className="seo-compare-cross" aria-label="Non">—</span>)
                    : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   Advice — checklist de conseils
══════════════════════════════════════════════════ */
export function SeoAdvice({ items }) {
  return (
    <ul className="seo-advice">
      {items.map((it, i) => (
        <li key={i} className="seo-advice-item">
          <span className="seo-advice-dot" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 8l2.5 2.5L12 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="seo-advice-title">{it.title}</p>
            <p className="seo-advice-desc">{it.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ══════════════════════════════════════════════════
   FAQ — accordion accessible
══════════════════════════════════════════════════ */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`seo-faq-item${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="seo-faq-q"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="seo-faq-chevron" aria-hidden="true">
          <svg viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 4.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="seo-faq-a" role="region">
        <p>{a}</p>
      </div>
    </div>
  )
}

export function SeoFaq({ items }) {
  return (
    <div className="seo-faq">
      {items.map((it, i) => <FaqItem key={i} {...it} />)}
    </div>
  )
}
