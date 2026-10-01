// Page stub — sera construite en Phase 2
import { useLocation, Link } from 'react-router-dom'
import { Container } from '../components/layout/Container'

export default function StubPage({ title }) {
  const { pathname } = useLocation()
  const name = title || pathname.split('/').pop().replace(/-/g, ' ')

  return (
    <main id="main-content" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '64px' }}>
      <Container style={{ padding: '80px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#359BD9', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
          En construction
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, color: '#F2F4F6', letterSpacing: '-0.03em', marginBottom: '16px', textTransform: 'capitalize' }}>
          {name}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: '#A5ACB5', marginBottom: '36px' }}>
          Cette page est en cours de construction. En attendant, contactez-nous directement.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px',
            background: 'transparent', color: '#359BD9',
            border: '1px solid #359BD9',
            borderRadius: '6px',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ← Retour à l'accueil
        </Link>
      </Container>
    </main>
  )
}
