import { Container } from '../components/layout/Container'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600,
        color: '#F2F4F6', marginBottom: '16px', letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function P({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)', fontSize: '14px',
      color: '#A5ACB5', lineHeight: 1.75, marginBottom: '10px',
    }}>
      {children}
    </p>
  )
}

function CookieRow({ name, purpose, duration, type }) {
  const cell = {
    fontFamily: 'var(--font-body)', fontSize: '13px',
    color: '#A5ACB5', padding: '10px 12px',
    borderBottom: '1px solid rgba(165,172,181,0.06)', verticalAlign: 'top',
  }
  return (
    <tr>
      <td style={{ ...cell, color: '#F2F4F6', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{name}</td>
      <td style={cell}>{purpose}</td>
      <td style={cell}>{duration}</td>
      <td style={{ ...cell, color: type === 'Nécessaire' ? '#22C55E' : '#359BD9' }}>{type}</td>
    </tr>
  )
}

export default function GestionCookies() {
  return (
    <div style={{ minHeight: '100vh', background: '#05101E', paddingTop: '64px' }}>
      <Container style={{ paddingTop: '64px', paddingBottom: '80px', maxWidth: '860px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 3.5vw, 48px)',
          fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em',
          color: '#F2F4F6', marginBottom: '12px',
        }}>
          Gestion des cookies
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(165,172,181,0.45)', marginBottom: '56px' }}>
          Dernière mise à jour : octobre 2026
        </p>

        <div style={{ borderTop: '1px solid rgba(165,172,181,0.08)', paddingTop: '40px' }}>

          <Section title="Qu'est-ce qu'un cookie ?">
            <P>
              Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur un site web. Il permet de mémoriser des informations sur votre navigation et d'améliorer votre expérience.
            </P>
          </Section>

          <Section title="Cookies utilisés sur ce site">
            <P>Le site www.ca-tech.fr utilise les catégories de cookies suivantes :</P>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(165,172,181,0.12)' }}>
                    {['Nom / Service', 'Finalité', 'Durée', 'Type'].map(h => (
                      <th key={h} style={{
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                        color: 'rgba(165,172,181,0.50)', textTransform: 'uppercase', letterSpacing: '0.04em',
                        padding: '8px 12px', textAlign: 'left',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <CookieRow name="axeptio_*" purpose="Gestion du consentement aux cookies (CMP Axeptio)" duration="13 mois" type="Nécessaire" />
                  <CookieRow name="_ga, _ga_*" purpose="Mesure d'audience Google Analytics 4 (pages vues, durée)" duration="13 mois" type="Analytique" />
                  <CookieRow name="_gcl_*" purpose="Suivi des conversions Google Ads" duration="90 jours" type="Analytique" />
                  <CookieRow name="loic_session" purpose="Continuité de la conversation avec l'agent Loïc" duration="Session" type="Nécessaire" />
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Gérer vos préférences">
            <P>
              Lors de votre première visite, une bannière de consentement (Axeptio) vous permet d'accepter ou de refuser les cookies analytiques. Vous pouvez modifier vos choix à tout moment via le bouton "Mes préférences cookies" en bas de page.
            </P>
            <P>
              Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies. Les paramètres varient selon les navigateurs — consultez l'aide de votre navigateur pour en savoir plus.
            </P>
          </Section>

          <Section title="Cookies tiers">
            <P>
              Les cookies analytiques (Google Analytics, Google Ads) sont déposés par des tiers. CA-TECH n'a pas de contrôle direct sur ces cookies. Pour en savoir plus :
            </P>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#A5ACB5', lineHeight: 1.75, marginBottom: '6px' }}>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#359BD9', textDecoration: 'none' }}>Politique de confidentialité Google</a>
              </li>
            </ul>
          </Section>

          <Section title="Contact">
            <P>
              Pour toute question relative aux cookies :{' '}
              <a href="mailto:contact@ca-tech.fr" style={{ color: '#359BD9', textDecoration: 'none' }}>contact@ca-tech.fr</a>
            </P>
          </Section>

        </div>
      </Container>
    </div>
  )
}
