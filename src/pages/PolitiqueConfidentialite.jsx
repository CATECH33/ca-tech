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

function Li({ children }) {
  return (
    <li style={{
      fontFamily: 'var(--font-body)', fontSize: '14px',
      color: '#A5ACB5', lineHeight: 1.75, marginBottom: '6px',
    }}>
      {children}
    </li>
  )
}

export default function PolitiqueConfidentialite() {
  return (
    <div style={{ minHeight: '100vh', background: '#05101E', paddingTop: '64px' }}>
      <Container style={{ paddingTop: '64px', paddingBottom: '80px', maxWidth: '760px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 3.5vw, 48px)',
          fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em',
          color: '#F2F4F6', marginBottom: '12px',
        }}>
          Politique de confidentialité
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(165,172,181,0.45)', marginBottom: '56px' }}>
          Dernière mise à jour : octobre 2026
        </p>

        <div style={{ borderTop: '1px solid rgba(165,172,181,0.08)', paddingTop: '40px' }}>

          <Section title="1. Responsable du traitement">
            <P>
              Le responsable du traitement des données personnelles collectées sur ce site est :<br />
              <strong style={{ color: '#F2F4F6' }}>CA-TECH</strong> — SIRET 93344494500012<br />
              1 Avenue du Mail, 21240 Talant, France<br />
              <a href="mailto:contact@ca-tech.fr" style={{ color: '#359BD9', textDecoration: 'none' }}>contact@ca-tech.fr</a>
            </P>
          </Section>

          <Section title="2. Données collectées">
            <P>Nous collectons les données suivantes, uniquement lorsque vous nous les transmettez volontairement :</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
              <Li>Formulaire de contact : nom, email, téléphone (optionnel), message</Li>
              <Li>Formulaire de devis : nom, email, téléphone (optionnel), type de projet, budget, notes</Li>
              <Li>Agent IA Loïc : messages échangés dans la conversation</Li>
            </ul>
            <P>
              Nous collectons également des données de navigation (adresse IP, pages visitées, durée de session) via des outils d'analyse (Google Analytics / Google Tag Manager) sous réserve de votre consentement.
            </P>
          </Section>

          <Section title="3. Finalités du traitement">
            <P>Vos données sont utilisées pour :</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
              <Li>Répondre à vos demandes de contact et de devis</Li>
              <Li>Établir et envoyer des devis commerciaux</Li>
              <Li>Gérer la relation commerciale (CRM interne)</Li>
              <Li>Améliorer nos services et l'expérience utilisateur du site (analytics)</Li>
            </ul>
          </Section>

          <Section title="4. Base légale">
            <P>
              Les traitements reposent sur les bases légales suivantes (RGPD, art. 6) :
            </P>
            <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
              <Li>Exécution d'un contrat ou de mesures précontractuelles (devis, réponse à une demande)</Li>
              <Li>Consentement de la personne concernée (cookies analytiques)</Li>
              <Li>Intérêt légitime de CA-TECH (suivi des prospects commerciaux)</Li>
            </ul>
          </Section>

          <Section title="5. Destinataires des données">
            <P>Vos données sont hébergées et traitées par les sous-traitants suivants, dans le cadre strict de la prestation :</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
              <Li><strong style={{ color: '#F2F4F6' }}>Supabase Inc.</strong> — stockage des données (base de données, USA / EU)</Li>
              <Li><strong style={{ color: '#F2F4F6' }}>Resend Inc.</strong> — envoi des emails transactionnels (USA)</Li>
              <Li><strong style={{ color: '#F2F4F6' }}>Vercel Inc.</strong> — hébergement du site (USA)</Li>
              <Li><strong style={{ color: '#F2F4F6' }}>Google LLC</strong> — analytics et mesure (soumis au consentement)</Li>
            </ul>
            <P>Aucune donnée n'est vendue ou transmise à des tiers à des fins commerciales.</P>
          </Section>

          <Section title="6. Durée de conservation">
            <P>
              Les données des prospects (formulaires de contact et de devis) sont conservées pendant <strong style={{ color: '#F2F4F6' }}>3 ans</strong> à compter du dernier contact commercial, puis supprimées ou anonymisées.
            </P>
          </Section>

          <Section title="7. Vos droits">
            <P>Conformément au RGPD, vous disposez des droits suivants :</P>
            <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
              <Li>Droit d'accès à vos données personnelles</Li>
              <Li>Droit de rectification</Li>
              <Li>Droit à l'effacement ("droit à l'oubli")</Li>
              <Li>Droit à la limitation du traitement</Li>
              <Li>Droit à la portabilité</Li>
              <Li>Droit d'opposition</Li>
            </ul>
            <P>
              Pour exercer ces droits, contactez-nous à :{' '}
              <a href="mailto:contact@ca-tech.fr" style={{ color: '#359BD9', textDecoration: 'none' }}>contact@ca-tech.fr</a>.
              Nous répondons dans un délai d'un mois.
            </P>
            <P>
              Vous disposez également du droit d'introduire une réclamation auprès de la{' '}
              <strong style={{ color: '#F2F4F6' }}>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#359BD9', textDecoration: 'none' }}>www.cnil.fr</a>.
            </P>
          </Section>

          <Section title="8. Cookies">
            <P>
              Pour en savoir plus sur les cookies utilisés sur ce site et gérer vos préférences, consultez notre{' '}
              <a href="/gestion-des-cookies" style={{ color: '#359BD9', textDecoration: 'none' }}>Politique de gestion des cookies</a>.
            </P>
          </Section>

          <Section title="9. Modifications">
            <P>
              CA-TECH se réserve le droit de modifier cette politique à tout moment. La version en vigueur est celle affichée sur cette page.
            </P>
          </Section>

        </div>
      </Container>
    </div>
  )
}
