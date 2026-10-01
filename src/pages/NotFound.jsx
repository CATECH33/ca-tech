import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container'

export default function NotFound() {
  return (
    <main id="main-content" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '64px' }}>
      <Container style={{ textAlign: 'center', padding: '80px 24px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#359BD9', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
          404
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 700, color: '#F2F4F6', letterSpacing: '-0.04em', marginBottom: '20px' }}>
          Page introuvable.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: '#A5ACB5', marginBottom: '40px' }}>
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px',
            background: '#359BD9', color: '#fff',
            borderRadius: '6px',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Retour à l'accueil
        </Link>
      </Container>
    </main>
  )
}
