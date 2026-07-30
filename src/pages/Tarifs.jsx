import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Tarifs.css'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, breadcrumbSchema, faqSchema } from '../lib/schema'
import { SeoSection, SeoProse, SeoAdvice, SeoComparison } from '../components/SeoContent'

const TARIFS_ADVICE = [
  { title: 'Alignez le budget sur le retour attendu',   desc: "Un site à 590 € qui capte 2 clients par mois s'amortit en un trimestre. Un site à 3 000 € qui reste vitrine ne s'amortit jamais. Chiffrez d'abord ce qu'un client vous rapporte, ensuite arbitrez." },
  { title: 'Distinguez one-shot et récurrent',           desc: "Un développement se paie une fois ; la maintenance, l'hébergement et l'agent IA se paient chaque mois. Un budget projet réaliste inclut toujours 15 à 20 % du coût initial en récurrent annuel." },
  { title: 'N\'achetez pas ce dont vous n\'êtes pas sûr', desc: "Commencez par le service minimum viable — landing page plutôt que site complet, un seul collaborateur IA plutôt que six. Vous ajusterez en 3 mois avec des vraies données d'usage." },
  { title: 'Négociez la portée, pas le prix',            desc: "Un devis 30 % moins cher pour un scope 30 % réduit est souvent un excellent deal. Un devis 30 % moins cher au même scope cache généralement une qualité ou un accompagnement au rabais." },
  { title: 'Inclure la formation dans le calcul',        desc: "Un outil que personne n'utilise coûte plus cher qu'un outil bien formé. Prévoyez 1 à 3 sessions de formation pour vos équipes — c'est l'investissement à plus fort ROI de toute solution digitale." },
  { title: 'Gardez 20 % de budget pour la phase 2',      desc: "Aucun projet digital ne se termine à la livraison. Réservez 20 % de votre enveloppe totale pour les 90 premiers jours d'ajustements — c'est là que se joue la vraie adoption." },
]

const TARIFS_COMPARE_COLS = [
  { label: 'Landing / Vitrine',     sub: 'À partir de 270 €' },
  { label: 'Site complet',           sub: 'À partir de 590 €', highlight: true },
  { label: 'Sur mesure',             sub: 'À partir de 2 500 €' },
]
const TARIFS_COMPARE_ROWS = [
  { label: 'Nombre de pages',                       values: ['1 à 3',                       '5 à 12',                        '10+ et espace client'] },
  { label: 'Design personnalisé',                   values: ['Template premium adapté',     'Design sur mesure',              'Design sur mesure + prototype'] },
  { label: 'Formulaire de contact / prise de RDV',  values: [true,                           true,                             true] },
  { label: 'SEO on-page inclus',                    values: [true,                           true,                             true] },
  { label: 'CMS pour éditer vous-même',             values: [false,                          true,                             true] },
  { label: 'Blog / actualités',                     values: [false,                          true,                             true] },
  { label: 'E-commerce Stripe / Shopify',           values: [false,                          '+ 500 €',                        'Inclus'] },
  { label: 'Espace client / connexion',             values: [false,                          '+ 490 €',                        true] },
  { label: 'Maintenance 3 mois offerte',            values: [true,                           true,                             true] },
  { label: 'Délai de livraison',                    values: ['5 à 7 jours',                 '2 à 3 semaines',                 '4 à 8 semaines'] },
]

const FAQS = [
  {
    q: 'Le devis est-il vraiment gratuit ?',
    a: "Oui, le devis est entièrement gratuit et sans engagement. Vous recevez une réponse détaillée sous 24h ouvrées avec une estimation précise pour votre projet.",
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: "Les délais varient selon la prestation : flyer en 48h, logo en 5 jours ouvrés, landing page en 7 jours, site vitrine en 10 à 15 jours, site e-commerce en 3 à 4 semaines. Ces délais sont indicatifs et peuvent varier selon la complexité.",
  },
  {
    q: 'La maintenance est-elle obligatoire ?',
    a: "Non, la maintenance est optionnelle. Cependant, nous la recommandons fortement pour garantir la sécurité, les performances et la disponibilité de votre site dans la durée. Plus de 80 % de nos clients y souscrivent.",
  },
  {
    q: 'Proposez-vous des facilités de paiement ?',
    a: "Oui. Pour les projets à partir de 590 €, nous proposons un paiement en 2 ou 3 fois sans frais. Contactez-nous pour en discuter.",
  },
  {
    q: 'Que se passe-t-il si je ne suis pas satisfait ?',
    a: "Nous travaillons en mode itératif : chaque étape est validée avec vous avant de passer à la suivante. Des allers-retours sont inclus dans chaque prestation afin de nous assurer que le résultat correspond exactement à vos attentes.",
  },
  {
    q: 'Intervenez-vous partout en France ?',
    a: "Oui, nous intervenons sur toute la France. Nos équipes sont basées à Paris, Lyon, Dijon et Troyes. Nous travaillons à distance et en présentiel selon votre préférence.",
  },
]

const GARANTIES = [
  {
    title: 'Devis gratuit',
    desc: 'Demandez un devis détaillé et personnalisé sans engagement, livré sous 24h ouvrées.',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 1.2-.504 2.274-1.32 3.025L12 21 4.32 15.025A4.99 4.99 0 013 12V5l9-3 9 3v7z"/></svg>,
  },
  {
    title: 'Livraison rapide',
    desc: 'Des délais clairs et respectés. Logo en 5 jours, site vitrine en 15 jours, flyer en 48h.',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    title: 'Accompagnement dédié',
    desc: 'Un interlocuteur unique de la première réunion à la livraison finale. Vous n\'êtes jamais seul.',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    title: 'Support réactif',
    desc: 'Une question après livraison ? Notre équipe répond sous 24h, même après la mise en ligne.',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
]

function CheckIcon() {
  return (
    <span className="tar-check-icon">
      <svg viewBox="0 0 16 16" fill="none"><path d="M4 8l2.5 2.5L12 5" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`tar-faq-item${open ? ' open' : ''}`}>
      <button className="tar-faq-q" onClick={() => setOpen(o => !o)}>
        {q}
        <span className="tar-faq-icon">
          <svg viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      <div className="tar-faq-a" style={{ maxHeight: open ? '300px' : '0' }}>
        <p className="tar-faq-a-inner">{a}</p>
      </div>
    </div>
  )
}

export default function Tarifs() {
  usePageMeta({
    title: 'Tarifs — Prix site web, e-commerce, CRM, IA & maintenance · CA-TECH',
    description: "Grille tarifaire transparente CA-TECH : site vitrine dès 590 €, landing page 270 €, e-commerce 1 090 €, application métier, CRM sur mesure, agents IA, maintenance 49 €/mois. Devis gratuit sous 24h.",
    keywords: 'tarif site vitrine, prix site internet, tarif e-commerce, prix application métier, tarif CRM sur mesure, prix agent IA, tarif maintenance site web, prix hébergement, tarif SEO, devis développement web',
    path: '/tarifs',
  })
  useJsonLd('breadcrumb', breadcrumbSchema([
    { name: 'Accueil', path: '/' },
    { name: 'Tarifs', path: '/tarifs' },
  ]))
  useJsonLd('tarifs-faq', faqSchema(FAQS))

  return (
    <>
      {/* ═══════════════════════════════════ HERO */}
      <section className="tar-hero">
        <div className="tar-hero-inner">
          <span className="tar-kicker">Tarifs CA-TECH</span>
          <h1 className="tar-h1">Tarifs simples.<br /><em>Résultats professionnels.</em></h1>
          <p className="tar-sub">
            Des sites internet et identités visuelles conçus pour développer votre activité et renforcer votre image de marque.
          </p>
          <div className="tar-hero-ctas">
            <Link to="/contact" className="tar-btn-main">Demander un devis</Link>
            <Link to="/realisations" className="tar-btn-ghost">Voir nos réalisations</Link>
          </div>
          <div className="tar-trust">
            <span className="tar-trust-item"><span className="tar-dot" />Devis gratuit sous 24h</span>
            <span className="tar-trust-item"><span className="tar-dot" />Sans engagement</span>
            <span className="tar-trust-item"><span className="tar-dot" />Partout en France</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ PRICING */}
      <section className="tar-section">
        <div className="tar-section-inner">
          <div className="tar-section-header">
            <h2 className="tar-section-title">Nos Offres & Tarifs</h2>
            <p className="tar-section-desc">Des solutions professionnelles adaptées aux entreprises, artisans, associations et entrepreneurs.</p>
          </div>

          <div className="tar-grid">
            {/* Logo */}
            <div className="tar-card">
              <p className="tar-card-cat">Design</p>
              <h3 className="tar-card-name">Logo Professionnel</h3>
              <div className="tar-price">
                <span className="tar-price-val">180 €</span>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features">
                <li><CheckIcon />Logo professionnel sur mesure</li>
                <li><CheckIcon />3 propositions créatives</li>
                <li><CheckIcon />Formats PNG, JPG et SVG</li>
                <li><CheckIcon />Version fond clair et fond sombre</li>
                <li><CheckIcon />Livraison rapide</li>
              </ul>
              <Link to="/contact" className="tar-card-btn tar-btn-outline">Commander mon logo →</Link>
            </div>

            {/* Landing Page */}
            <div className="tar-card">
              <p className="tar-card-cat">Web</p>
              <h3 className="tar-card-name">Landing Page</h3>
              <div className="tar-price">
                <span className="tar-price-val">270 €</span>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features">
                <li><CheckIcon />Design moderne</li>
                <li><CheckIcon />Responsive mobile</li>
                <li><CheckIcon />Formulaire de contact</li>
                <li><CheckIcon />Optimisation SEO de base</li>
                <li><CheckIcon />Livraison clé en main</li>
              </ul>
              <Link to="/contact" className="tar-card-btn tar-btn-outline">Commander ma landing page →</Link>
            </div>

            {/* Flyer */}
            <div className="tar-card">
              <p className="tar-card-cat">Design</p>
              <h3 className="tar-card-name">Flyer Professionnel</h3>
              <div className="tar-price">
                <span className="tar-price-val">139 €</span>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features">
                <li><CheckIcon />Design professionnel</li>
                <li><CheckIcon />Format impression HD</li>
                <li><CheckIcon />Version numérique</li>
                <li><CheckIcon />Jusqu'à 2 modifications</li>
              </ul>
              <Link to="/contact" className="tar-card-btn tar-btn-outline">Commander mon flyer →</Link>
            </div>
          </div>

          {/* Site Vitrine — featured */}
          <div className="tar-featured-block">
            <div className="tar-featured-card">
              <span className="tar-featured-badge">OFFRE POPULAIRE</span>
              <p className="tar-card-cat">Web</p>
              <h3 className="tar-card-name">Site Vitrine</h3>
              <div className="tar-price">
                <span className="tar-price-val">590 €</span>
                <span className="tar-price-unit">TTC · Paiement unique</span>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features tar-features--2col">
                <li><CheckIcon />Design sur mesure</li>
                <li><CheckIcon />Site responsive (mobile first)</li>
                <li><CheckIcon />Optimisation SEO</li>
                <li><CheckIcon />Formulaire de contact</li>
                <li><CheckIcon />Hébergement configurable</li>
                <li><CheckIcon />Livraison rapide</li>
              </ul>
              <Link to="/contact" className="tar-card-btn tar-btn-blue">Commander mon site vitrine →</Link>
            </div>

            <div className="tar-connector">
              <span className="tar-connector-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="2" x2="8" y2="14"/><polyline points="4,10 8,14 12,10"/></svg>
                Ajouter la maintenance
              </span>
            </div>

            <div className="tar-maintenance-card">
              <span className="tar-maintenance-badge">★ Recommandé</span>
              <div className="tar-maintenance-header">
                <div className="tar-maintenance-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <p className="tar-card-cat">Maintenance & Assistance</p>
                  <h3 className="tar-card-name">Maintenance Premium</h3>
                  <div className="tar-maint-price">
                    <span className="tar-maint-amount">89,99 €</span>
                    <span className="tar-maint-period">/mois · Sans engagement</span>
                  </div>
                </div>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features tar-features--2col">
                <li><CheckIcon />Mises à jour du site</li>
                <li><CheckIcon />Sauvegardes automatiques</li>
                <li><CheckIcon />Surveillance de sécurité</li>
                <li><CheckIcon />Corrections de bugs</li>
                <li><CheckIcon />Assistance prioritaire</li>
                <li><CheckIcon />Modifications mineures incluses</li>
                <li><CheckIcon />Optimisation des performances</li>
                <li><CheckIcon />Support Email / WhatsApp</li>
              </ul>
              <p className="tar-reassurance">La maintenance n'est pas obligatoire, mais elle est fortement recommandée afin de garantir la sécurité, les performances et la disponibilité de votre site.</p>
              <Link to="/contact" className="tar-card-btn tar-btn-blue">Souscrire à la maintenance →</Link>
            </div>
          </div>

          {/* Site E-commerce — featured */}
          <div className="tar-featured-block">
            <div className="tar-featured-card">
              <span className="tar-featured-badge">BOUTIQUE EN LIGNE</span>
              <p className="tar-card-cat">E-commerce</p>
              <h3 className="tar-card-name">Site E-commerce</h3>
              <div className="tar-price">
                <span className="tar-price-val">1 090 €</span>
                <span className="tar-price-unit">TTC · Paiement unique</span>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features tar-features--2col">
                <li><CheckIcon />Boutique en ligne complète</li>
                <li><CheckIcon />Paiement Stripe sécurisé</li>
                <li><CheckIcon />Gestion des produits</li>
                <li><CheckIcon />SEO de base</li>
                <li><CheckIcon />Responsive mobile</li>
                <li><CheckIcon />Formation incluse</li>
              </ul>
              <Link to="/contact" className="tar-card-btn tar-btn-blue">Commander ma boutique →</Link>
            </div>

            <div className="tar-connector">
              <span className="tar-connector-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="2" x2="8" y2="14"/><polyline points="4,10 8,14 12,10"/></svg>
                Ajouter la maintenance
              </span>
            </div>

            <div className="tar-maintenance-card">
              <span className="tar-maintenance-badge">★ Recommandé</span>
              <div className="tar-maintenance-header">
                <div className="tar-maintenance-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <p className="tar-card-cat">Maintenance & Assistance</p>
                  <h3 className="tar-card-name">Maintenance E-commerce Premium</h3>
                  <div className="tar-maint-price">
                    <span className="tar-maint-amount">120 €</span>
                    <span className="tar-maint-period">/mois · Sans engagement</span>
                  </div>
                </div>
              </div>
              <div className="tar-divider" />
              <ul className="tar-features tar-features--2col">
                <li><CheckIcon />Mises à jour du site</li>
                <li><CheckIcon />Sauvegardes quotidiennes</li>
                <li><CheckIcon />Sécurité renforcée</li>
                <li><CheckIcon />Surveillance 24/7</li>
                <li><CheckIcon />Assistance prioritaire</li>
                <li><CheckIcon />Corrections de bugs</li>
                <li><CheckIcon />Optimisation des performances</li>
                <li><CheckIcon />Ajout de nouveaux produits</li>
              </ul>
              <p className="tar-reassurance">La maintenance n'est pas obligatoire, mais elle est fortement recommandée afin de garantir la sécurité, les performances et la disponibilité de votre site.</p>
              <Link to="/contact" className="tar-card-btn tar-btn-blue">Souscrire à la maintenance →</Link>
            </div>
          </div>

          <div className="tar-social-proof">
            <strong>Plus de 80 % de nos clients</strong> choisissent la maintenance afin de garder leur site sécurisé, rapide et toujours à jour.
          </div>

          <div className="tar-devis-cta">
            <p>Besoin d'un projet sur mesure ? Contactez-nous pour obtenir un devis personnalisé.</p>
            <Link to="/contact" className="tar-btn-main">Demander un devis</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ PROCESSUS */}
      <section className="tar-process">
        <div className="tar-section-inner">
          <div className="tar-section-header">
            <p className="tar-label">Méthode</p>
            <h2 className="tar-section-title">Comment ça fonctionne ?</h2>
          </div>
          <div className="tar-process-grid">
            {[
              { n:'01', title:'Prise de contact', desc:"Vous nous décrivez votre projet. Nous vous répondons sous 24h avec un premier échange personnalisé." },
              { n:'02', title:'Analyse du besoin', desc:"On analyse votre marché, vos objectifs et vos références pour construire une stratégie adaptée." },
              { n:'03', title:'Création', desc:"Maquettes, design, développement — chaque étape est validée avec vous avant de passer à la suivante." },
              { n:'04', title:'Livraison', desc:"Mise en ligne, formation et accompagnement post-lancement. Nous restons disponibles pour faire évoluer votre projet." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="tar-process-step">
                <div className="tar-process-num">{n}</div>
                <h3 className="tar-process-title">{title}</h3>
                <p className="tar-process-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ GARANTIES */}
      <section className="tar-garanties">
        <div className="tar-section-inner">
          <div className="tar-section-header">
            <p className="tar-label">Nos engagements</p>
            <h2 className="tar-section-title">Ce que nous garantissons</h2>
          </div>
          <div className="tar-gar-grid">
            {GARANTIES.map(({ title, desc, svg }) => (
              <div key={title} className="tar-gar-card">
                <div className="tar-gar-icon">{svg}</div>
                <h3 className="tar-gar-name">{title}</h3>
                <p className="tar-gar-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ FAQ */}
      <section className="tar-faq">
        <div className="tar-faq-inner">
          <div className="tar-section-header">
            <p className="tar-label">Questions fréquentes</p>
            <h2 className="tar-section-title">FAQ</h2>
          </div>
          {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
        </div>
      </section>

      {/* ── SEO · GUIDE D'ACHAT ────────────────────────────────── */}
      <SeoSection
        variant="gray"
        eyebrow="Guide d'achat"
        title="6 principes pour dimensionner correctement votre budget digital"
        intro="Ces règles empiriques sortent de 120 projets menés pour des PME françaises. Elles ne remplacent pas un chiffrage précis, mais elles évitent les mauvaises surprises budgétaires."
      >
        <SeoAdvice items={TARIFS_ADVICE} />
      </SeoSection>

      {/* ── SEO · COMPARATIF ───────────────────────────────────── */}
      <SeoSection
        variant="light"
        eyebrow="Comparatif"
        title="Landing, site complet ou sur mesure : que couvre chaque offre ?"
        intro="La différence entre nos trois formules ne tient pas au design (toujours premium) mais au périmètre fonctionnel et à la complexité technique. Voici la comparaison ligne à ligne."
      >
        <SeoComparison columns={TARIFS_COMPARE_COLS} rows={TARIFS_COMPARE_ROWS} />
      </SeoSection>

      {/* ── SEO · CE QUE COUVRE UN TARIF ───────────────────────── */}
      <SeoSection
        variant="tint"
        eyebrow="Transparence"
        title="Ce qu'inclut réellement un tarif chez CA-TECH"
      >
        <SeoProse columns={2}>
          <h3>Le chiffrage, pas le devis</h3>
          <p>
            Nos tarifs affichés sont des <strong>chiffrages initiaux</strong>, basés sur des scopes standardisés. Le devis final tient compte de vos spécificités : contenus à intégrer, connecteurs tiers, exigences de performance, environnements à gérer. Il est envoyé sous 24 h après un diagnostic gratuit de 30 minutes, sans engagement.
          </p>
          <h3>La bande passante humaine incluse</h3>
          <p>
            Chaque forfait inclut le temps de cadrage, la revue de contenu, la formation à l'usage et 3 mois de maintenance corrective. Vous ne payez pas seulement du code — vous payez un accompagnement qui garantit que la solution atterrit dans votre organisation.
          </p>
          <h3>Ce qui n'est jamais inclus (sauf mention contraire)</h3>
          <p>
            <strong>Le contenu rédactionnel</strong> (nous pouvons l'écrire, à partir de 90 € /page). <strong>La photographie professionnelle</strong> (partenariat photographe à partir de 450 €). <strong>Les licences tierces</strong> (Google Workspace, Stripe, hébergement long terme). <strong>Les campagnes publicitaires</strong> (Google Ads, Meta). Chacun de ces éléments est chiffré séparément — vous décidez ce que vous confiez à CA-TECH et ce que vous gérez en interne.
          </p>
          <h3>La sortie propre, garantie</h3>
          <p>
            Aucun frais de sortie, aucune clause d'exclusivité, aucun contrat de durée minimale. Le code vous appartient à 100 %. Si vous décidez de reprendre le projet en interne ou de changer de prestataire, nous fournissons la documentation technique, les accès et une session de passation d'une heure — <strong>inclus dans le forfait initial.</strong>
          </p>
        </SeoProse>
      </SeoSection>

      {/* ═══════════════════════════════════ CTA */}
      <section className="tar-cta">
        <div className="tar-cta-inner">
          <p className="tar-cta-label">Prêt à démarrer ?</p>
          <h2 className="tar-cta-h2">Un devis gratuit<br /><strong>sous 24h.</strong></h2>
          <p className="tar-cta-sub">Décrivez votre projet en 2 minutes. Nous vous revenons avec une estimation détaillée et personnalisée, sans engagement.</p>
          <div className="tar-cta-btns">
            <Link to="/contact" className="tar-cta-btn-main">Demander un devis →</Link>
            <Link to="/loic" className="tar-cta-btn-ghost">Parler avec Loïc</Link>
          </div>
        </div>
      </section>
    </>
  )
}
