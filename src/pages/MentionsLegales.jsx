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


export default function MentionsLegales() {
  return (
    <div style={{ minHeight: '100vh', background: '#05101E', paddingTop: '64px' }}>
      <Container style={{ paddingTop: '64px', paddingBottom: '80px', maxWidth: '760px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 3.5vw, 48px)',
          fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em',
          color: '#F2F4F6', marginBottom: '12px',
        }}>
          Mentions légales
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(165,172,181,0.45)', marginBottom: '56px' }}>
          Dernière mise à jour : octobre 2026
        </p>

        <div style={{ borderTop: '1px solid rgba(165,172,181,0.08)', paddingTop: '40px' }}>

          <Section title="1. Éditeur du site">
            <P>Le site <strong style={{ color: '#F2F4F6' }}>www.ca-tech.fr</strong> est édité par :</P>
            <P>
              <strong style={{ color: '#F2F4F6' }}>CA-TECH</strong><br />
              Forme juridique : Entreprise Individuelle (EI)<br />
              SIRET : 93344494500012<br />
              Numéro de TVA intracommunautaire : Non applicable<br />
              Siège social : 1 Avenue du Mail, 21240 Talant, France<br />
              Email : <a href="mailto:contact@ca-tech.fr" style={{ color: '#359BD9', textDecoration: 'none' }}>contact@ca-tech.fr</a><br />
              Téléphone : <a href="tel:+33775664975" style={{ color: '#359BD9', textDecoration: 'none' }}>+33 7 75 66 49 75</a>
            </P>
            <P>Directeur de la publication : JEAN KEVIN PEMOU</P>
          </Section>

          <Section title="2. Hébergement">
            <P>
              Le site est hébergé par :<br />
              <strong style={{ color: '#F2F4F6' }}>Vercel Inc.</strong><br />
              340 Pine Street, Suite 900<br />
              San Francisco, CA 94104 – États-Unis<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#359BD9', textDecoration: 'none' }}>vercel.com</a>
            </P>
          </Section>

          <Section title="3. Propriété intellectuelle">
            <P>
              L'ensemble des contenus présents sur ce site (textes, images, graphismes, logos, icônes, sons, logiciels) est la propriété exclusive de CA-TECH ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            </P>
            <P>
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de CA-TECH.
            </P>
          </Section>

          <Section title="4. Données personnelles">
            <P>
              Pour toute information relative au traitement de vos données personnelles, consultez notre{' '}
              <a href="/politique-de-confidentialite" style={{ color: '#359BD9', textDecoration: 'none' }}>Politique de confidentialité</a>.
            </P>
          </Section>

          <Section title="5. Cookies">
            <P>
              Ce site utilise des cookies techniques et des cookies analytiques. Pour en savoir plus et gérer vos préférences, consultez notre{' '}
              <a href="/gestion-des-cookies" style={{ color: '#359BD9', textDecoration: 'none' }}>Politique de gestion des cookies</a>.
            </P>
          </Section>

          <Section title="6. Responsabilité">
            <P>
              CA-TECH s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, CA-TECH ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. CA-TECH décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.
            </P>
          </Section>

          <Section title="7. Liens hypertextes">
            <P>
              Ce site peut contenir des liens vers d'autres sites internet. CA-TECH n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </P>
          </Section>

          <Section title="8. Contact">
            <P>
              Pour toute question relative à ces mentions légales :<br />
              <a href="mailto:contact@ca-tech.fr" style={{ color: '#359BD9', textDecoration: 'none' }}>contact@ca-tech.fr</a>
            </P>
          </Section>

        </div>
      </Container>
    </div>
  )
}
