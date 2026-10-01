import { Link } from 'react-router-dom'
// LinkedIn SVG natif — lucide-react v1+ ne l'exporte plus sous ce nom
import { Container } from '../layout/Container'
import { FOOTER_NAV } from '../../lib/constants'

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px', fontWeight: 600,
        color: '#F2F4F6',
        marginBottom: '16px',
        letterSpacing: '0.01em',
      }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: '#A5ACB5',
                textDecoration: 'none',
                transition: 'color 0.18s ease',
                display: 'inline-block',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.color = '#A5ACB5'}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: '#05101E',
      borderTop: '1px solid rgba(165,172,181,0.08)',
      paddingTop: '80px',
      paddingBottom: '40px',
    }}>
      <Container>
        {/* Colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10" style={{ marginBottom: '64px' }}>
          {/* Bloc identité */}
          <div>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <img src="/logos/logo-ca-tech-icon.svg" alt="CA-TECH" style={{ height: '28px', width: 'auto' }} />
            </Link>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A5ACB5',
              lineHeight: 1.6,
              marginBottom: '16px',
              maxWidth: '220px',
            }}>
              Cabinet d'intelligence digitale — IA, Automatisation, Développement Web, SEO.
            </p>
            <a
              href="mailto:contact@ca-tech.fr"
              style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: '#A5ACB5', textDecoration: 'none',
                display: 'block', marginBottom: '6px',
                transition: 'color 0.18s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.color = '#A5ACB5'}
            >
              contact@ca-tech.fr
            </a>
            <a
              href="tel:+33775664975"
              style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: '#A5ACB5', textDecoration: 'none',
                display: 'block', marginBottom: '20px',
                transition: 'color 0.18s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.color = '#A5ACB5'}
            >
              07 75 66 49 75
            </a>
            {/* Réseaux */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://www.linkedin.com/company/ca-tech-france/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn CA-TECH"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(165,172,181,0.12)',
                  borderRadius: '8px',
                  color: '#A5ACB5',
                  transition: 'all 0.18s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(53,155,217,0.12)'; e.currentTarget.style.borderColor = 'rgba(53,155,217,0.30)'; e.currentTarget.style.color = '#359BD9' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(165,172,181,0.12)'; e.currentTarget.style.color = '#A5ACB5' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          <FooterColumn title="Expertises" links={FOOTER_NAV.expertises} />
          <FooterColumn title="Navigation" links={FOOTER_NAV.navigation} />
          <FooterColumn title="Légal" links={FOOTER_NAV.legal} />
        </div>

        {/* Barre légale */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(165,172,181,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(165,172,181,0.50)' }}>
            © {year} CA-TECH · SIRET 93344494500012 · 1 Avenue du Mail, 21240 Talant
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {FOOTER_NAV.legal.slice(0, 2).map(link => (
              <Link
                key={link.label}
                to={link.href}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px',
                  color: 'rgba(165,172,181,0.50)',
                  textDecoration: 'none',
                  transition: 'color 0.18s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#A5ACB5'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(165,172,181,0.50)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
