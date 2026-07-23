const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const fs   = require('fs')
const path = require('path')
const os   = require('os')

const DB = {
  host: 'db.jhcyooksjeivajdjicka.supabase.co',
  port: 5432, database: 'postgres', user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false }
}

const supa = createClient(
  process.env.SUPABASE_URL || 'https://jhcyooksjeivajdjicka.supabase.co',
  process.env.SUPABASE_SECRET_KEY
)

// ─── Téléchargement + upload Storage ──────────────────────────────────────────

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject)
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', reject)
  })
}

async function uploadImage(id, unsplashUrl) {
  const tmp = path.join(os.tmpdir(), `collab-${id}.jpg`)
  await downloadImage(unsplashUrl, tmp)
  const buf  = fs.readFileSync(tmp)
  const dest = `collaborateurs/${id}/main-${Date.now()}.jpg`
  const { error } = await supa.storage.from('catalogue').upload(dest, buf, { contentType: 'image/jpeg', upsert: true })
  fs.unlinkSync(tmp)
  if (error) throw new Error('Storage: ' + error.message)
  return supa.storage.from('catalogue').getPublicUrl(dest).data.publicUrl
}

// ─── Données ───────────────────────────────────────────────────────────────────

const collaborateurs = [
  {
    nom:   'Assistant Support Client IA',
    slug:  'assistant-support-client-ia',
    icone: '🎧',
    categorie: 'assistant',
    description: "Votre support client IA qui répond instantanément aux demandes, résout les tickets et fidélise vos clients 24h/24.",
    description_complete: "L'Assistant Support Client IA prend en charge l'intégralité de votre service après-vente. Il répond aux questions courantes en quelques secondes, escalade intelligemment les cas complexes à vos équipes humaines et assure un suivi rigoureux de chaque ticket jusqu'à sa résolution.\n\nGrâce à sa base de connaissance enrichie en continu, il s'améliore à chaque interaction et maintient un taux de satisfaction client élevé, même aux heures de pointe ou le week-end.",
    mission: "Offrir une expérience support irréprochable à chaque client, à toute heure, sans augmenter vos coûts de service.",
    fonctionnalites: [
      "Réponse instantanée aux questions fréquentes (FAQ dynamique)",
      "Gestion et priorisation automatique des tickets",
      "Escalade intelligente vers les agents humains",
      "Suivi de l'historique client multicanal (email, chat, WhatsApp)",
      "Détection du sentiment client et alertes d'insatisfaction",
      "Rapports de satisfaction (CSAT, NPS) en temps réel",
      "Base de connaissance auto-enrichie après chaque résolution",
      "Réponses multilingues (FR, EN, ES, DE)"
    ],
    secteurs: ['E-commerce', 'SaaS & Tech', 'Télécommunications', 'Banque & Assurance', 'Santé', 'Tourisme'],
    outils_compatibles: ['Zendesk', 'Intercom', 'Freshdesk', 'HubSpot Service', 'Notion', 'Slack', 'WhatsApp Business', 'Gmail'],
    resultats_attendus: [
      "Réduction de 65% du volume de tickets traités manuellement",
      "Temps de première réponse réduit à moins de 30 secondes",
      "Taux de satisfaction client (CSAT) supérieur à 92%",
      "Disponibilité 24h/24 sans coût supplémentaire de personnel"
    ],
    temps_installation: '24 heures',
    prix: 290, prix_barre: 450,
    cta_label: 'Activer le support IA',
    cta_secondaire: 'Voir une démonstration',
    faq: [
      { question: "Peut-il gérer des demandes complexes ?", reponse: "Oui. Lorsqu'une demande dépasse ses capacités, il escalade automatiquement vers le bon agent humain avec tout le contexte de la conversation — sans que le client ait à se répéter." },
      { question: "Dans combien de langues répond-il ?", reponse: "Il maîtrise nativement le français, l'anglais, l'espagnol et l'allemand. D'autres langues peuvent être ajoutées sur demande." },
      { question: "Comment est alimentée sa base de connaissance ?", reponse: "Nous importons votre documentation existante (FAQ, guides, contrats) au démarrage. Ensuite, il apprend automatiquement de chaque ticket résolu." },
      { question: "Est-il compatible avec notre outil support actuel ?", reponse: "Il s'intègre nativement avec Zendesk, Intercom, Freshdesk et HubSpot. Pour d'autres outils, une connexion via API ou Zapier est possible." },
      { question: "Que se passe-t-il si un client est très insatisfait ?", reponse: "Un système de détection d'insatisfaction alerte immédiatement votre équipe et transfère la conversation à un agent prioritaire pour éviter toute escalade." }
    ],
    seo_title: "Assistant Support Client IA — Service Après-Vente Automatisé | CA-TECH",
    seo_description: "Automatisez votre support client avec notre IA. Réponses instantanées, gestion des tickets, disponible 24h/24. -65% de tickets manuels, CSAT > 92%.",
    ordre: 2,
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&auto=format&fit=crop'
  },

  {
    nom:   'Collaborateur RH IA',
    slug:  'collaborateur-rh-ia',
    icone: '👥',
    categorie: 'agent',
    description: "Votre RH IA qui automatise le recrutement, l'onboarding et la gestion administrative pour libérer vos équipes.",
    description_complete: "Le Collaborateur RH IA prend en charge les processus ressources humaines les plus chronophages : tri des candidatures, planification des entretiens, onboarding des nouveaux collaborateurs et suivi des congés.\n\nIl analyse les CV selon vos critères, rédige les descriptions de poste, automatise les relances candidates et produit des tableaux de bord RH en temps réel — pour que votre DRH se concentre sur la stratégie et l'humain.",
    mission: "Automatiser les processus RH répétitifs pour recruter plus vite, mieux onboarder et garder vos talents.",
    fonctionnalites: [
      "Tri et scoring automatique des candidatures",
      "Rédaction de fiches de poste optimisées",
      "Planification automatique des entretiens",
      "Onboarding digital structuré et personnalisé",
      "Suivi des congés, absences et plannings",
      "Génération de contrats et documents RH standards",
      "Tableau de bord RH avec KPIs en temps réel",
      "Relances automatiques des candidats et managers"
    ],
    secteurs: ['PME & ETI', 'Cabinets de recrutement', 'Grande distribution', 'Santé', 'Industrie', 'Conseil & Services B2B'],
    outils_compatibles: ['BambooHR', 'Workday', 'Notion', 'Google Workspace', 'LinkedIn Recruiter', 'Docusign', 'Slack', 'Calendly'],
    resultats_attendus: [
      "Division par 3 du temps de traitement des candidatures",
      "Réduction de 80% des tâches administratives RH",
      "Onboarding réduit à 1 jour au lieu de 1 semaine",
      "Taux de rétention amélioré de 25% grâce à un suivi structuré"
    ],
    temps_installation: '3 jours',
    prix: 390, prix_barre: 590,
    cta_label: 'Activer le RH IA',
    cta_secondaire: 'Voir une démonstration',
    faq: [
      { question: "Peut-il publier les offres sur les jobboards ?", reponse: "Oui, il publie automatiquement sur Indeed, LinkedIn, Welcome to the Jungle et votre site carrière via intégration API." },
      { question: "Comment gère-t-il la confidentialité des données candidats ?", reponse: "Il est conforme RGPD. Les données candidates sont chiffrées, conservées selon les durées légales et supprimées sur demande." },
      { question: "Peut-il gérer les entretiens vidéo ?", reponse: "Il planifie les entretiens et envoie les liens (Teams, Zoom, Google Meet). L'analyse des entretiens vidéo est disponible en option." },
      { question: "Est-il adapté aux petites structures ?", reponse: "Oui, il est conçu pour des équipes de 5 à 500 personnes. Il s'adapte à votre volume de recrutement, qu'il soit occasionnel ou continu." },
      { question: "Peut-il gérer les contrats et la paperasse ?", reponse: "Il génère les contrats standards (CDI, CDD, stage) à partir de vos modèles, les envoie en signature électronique et archive les originaux." }
    ],
    seo_title: "Collaborateur RH IA — Recrutement & Onboarding Automatisés | CA-TECH",
    seo_description: "Automatisez votre recrutement et vos processus RH avec notre IA. Tri des CV, onboarding, gestion des congés. Réduisez de 80% vos tâches administratives.",
    ordre: 3,
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop'
  },

  {
    nom:   'Juriste IA',
    slug:  'juriste-ia',
    icone: '⚖️',
    categorie: 'analyste',
    description: "Votre expert juridique IA qui rédige, analyse et sécurise vos contrats et documents légaux en quelques minutes.",
    description_complete: "Le Juriste IA analyse, rédige et sécurise vos documents juridiques avec la rigueur d'un expert légal. Il détecte les clauses risquées dans vos contrats, suggère des corrections, rédige des CGV, NDA et contrats commerciaux sur mesure et assure une veille juridique permanente sur votre secteur.\n\nIndispensable pour les dirigeants, commerciaux et équipes en croissance qui signent régulièrement des contrats sans avoir de juriste interne, il réduit votre exposition légale tout en accélérant vos cycles de vente.",
    mission: "Protéger juridiquement votre entreprise en analysant vos contrats, rédigeant vos documents légaux et assurant une veille continue.",
    fonctionnalites: [
      "Analyse et audit de contrats (détection de clauses abusives)",
      "Rédaction de CGV, CGU, NDA, contrats commerciaux",
      "Veille juridique automatisée sur votre secteur",
      "Vérification de conformité RGPD de vos processus",
      "Résumé exécutif de documents juridiques complexes",
      "Bibliothèque de modèles de documents légaux",
      "Alertes sur les échéances contractuelles",
      "Questions-réponses juridiques en langage naturel"
    ],
    secteurs: ['Startups & Scale-ups', 'Immobilier', 'E-commerce', 'Conseil & Services B2B', 'Santé', 'Fintech'],
    outils_compatibles: ['Docusign', 'PandaDoc', 'Notion', 'Google Drive', 'Microsoft Word', 'Slack', 'Hubspot', 'Airtable'],
    resultats_attendus: [
      "Analyse d'un contrat de 30 pages en moins de 3 minutes",
      "Réduction de 90% des coûts de consultation juridique courante",
      "Zéro clause abusive non détectée dans vos contrats signés",
      "Conformité RGPD maintenue en continu sans effort manuel"
    ],
    temps_installation: '24 heures',
    prix: 590, prix_barre: 890,
    cta_label: 'Activer le juriste IA',
    cta_secondaire: 'Voir une démonstration',
    faq: [
      { question: "Peut-il remplacer un avocat ?", reponse: "Non, il ne se substitue pas à un avocat pour les affaires complexes ou contentieuses. Il gère les documents courants et vous alerte sur les points nécessitant un expert humain." },
      { question: "Quels types de contrats maîtrise-t-il ?", reponse: "CGV, CGU, NDA, contrats de prestation, baux commerciaux, contrats de travail, partenariats, licences logicielles et contrats SaaS." },
      { question: "Est-il à jour des dernières lois ?", reponse: "Sa base juridique est mise à jour mensuellement. Pour le droit français et européen, il couvre les textes en vigueur avec un délai maximum d'un mois." },
      { question: "Mes documents sont-ils confidentiels ?", reponse: "Oui, chaque document est traité dans un environnement isolé. Aucun contenu n'est utilisé pour entraîner des modèles tiers." },
      { question: "Peut-il rédiger en plusieurs langues ?", reponse: "Il rédige et analyse en français, anglais, espagnol et allemand. Pour d'autres langues, contactez-nous." }
    ],
    seo_title: "Juriste IA — Analyse et Rédaction de Contrats Automatisées | CA-TECH",
    seo_description: "Analysez et rédigez vos contrats en quelques minutes avec notre Juriste IA. CGV, NDA, veille RGPD, détection de clauses abusives. -90% de coûts juridiques courants.",
    ordre: 4,
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80&auto=format&fit=crop'
  },

  {
    nom:   'Référenceur SEO IA',
    slug:  'referenceur-seo-ia',
    icone: '📈',
    categorie: 'createur',
    description: "Votre expert SEO IA qui optimise votre visibilité Google, produit du contenu optimisé et booste votre trafic organique.",
    description_complete: "Le Référenceur SEO IA analyse votre site, identifie les opportunités de mots-clés à fort potentiel et produit du contenu optimisé qui remonte dans les résultats de recherche. Il réalise des audits techniques, surveille vos positions et s'adapte aux mises à jour des algorithmes Google en temps réel.\n\nChaque semaine, il publie de nouveaux articles, optimise vos pages existantes et vous soumet un rapport de progression détaillé — pour une croissance du trafic organique constante, sans agence externe coûteuse.",
    mission: "Faire grimper votre site dans les résultats Google grâce à une stratégie SEO continue, du contenu optimisé et des audits techniques réguliers.",
    fonctionnalites: [
      "Audit SEO technique complet (vitesse, balises, maillage)",
      "Recherche de mots-clés et opportunités concurrentielles",
      "Rédaction d'articles de blog et pages SEO optimisés",
      "Optimisation des balises titre, meta et Hn existants",
      "Suivi quotidien des positions Google",
      "Analyse des backlinks et recommandations de netlinking",
      "Rapport mensuel de performance SEO",
      "Veille sur les mises à jour des algorithmes Google"
    ],
    secteurs: ['E-commerce', 'Immobilier', 'Santé & Bien-être', 'Tourisme', 'SaaS & Tech', 'Artisanat & Commerce local'],
    outils_compatibles: ['Google Search Console', 'Google Analytics', 'Ahrefs', 'Semrush', 'Screaming Frog', 'WordPress', 'Webflow', 'Notion'],
    resultats_attendus: [
      "+150% de trafic organique en 6 mois",
      "Top 3 Google sur 80% des mots-clés cibles en 4 mois",
      "Production de 8 à 12 contenus optimisés par mois",
      "Score Lighthouse > 90 sur toutes les pages stratégiques"
    ],
    temps_installation: '48 heures',
    prix: 390, prix_barre: 590,
    cta_label: 'Booster mon SEO',
    cta_secondaire: 'Voir une démonstration',
    faq: [
      { question: "Combien de temps avant de voir des résultats ?", reponse: "Les premières améliorations de positions sont visibles en 4 à 8 semaines. Une croissance significative du trafic est constatée entre le 3e et le 6e mois." },
      { question: "Rédige-t-il le contenu ou donne-t-il des recommandations ?", reponse: "Les deux. Il rédige directement les articles et pages optimisées, et fournit aussi des briefs SEO si vous préférez garder la main sur la rédaction." },
      { question: "Est-il compatible avec tous les CMS ?", reponse: "Il s'intègre nativement avec WordPress et Webflow. Pour Shopify, Prestashop ou un CMS sur mesure, une connexion via API est disponible." },
      { question: "Comment gère-t-il les mises à jour Google ?", reponse: "Il surveille les annonces et impacts des Core Updates en temps réel, ajuste la stratégie de contenu et vous alerte si votre site est affecté." },
      { question: "Peut-il gérer le SEO local ?", reponse: "Oui, il optimise votre fiche Google Business Profile, gère les mots-clés géolocalisés et suit vos positions dans les résultats locaux." }
    ],
    seo_title: "Référenceur SEO IA — Trafic Organique et Contenu Optimisé | CA-TECH",
    seo_description: "Boostez votre référencement Google avec notre IA SEO. Audit technique, création de contenu, suivi des positions. +150% de trafic organique en 6 mois.",
    ordre: 5,
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop'
  },

  {
    nom:   'Comptable IA',
    slug:  'comptable-ia',
    icone: '📊',
    categorie: 'analyste',
    description: "Votre comptable IA qui automatise la saisie, le rapprochement bancaire et le reporting financier en temps réel.",
    description_complete: "Le Comptable IA prend en charge la totalité de votre comptabilité courante : catégorisation des dépenses, rapprochement bancaire, génération des factures et préparation des déclarations TVA. Il analyse vos flux financiers, détecte les anomalies et produit des tableaux de bord clairs pour piloter votre trésorerie.\n\nConnecté à votre banque et à votre outil de facturation, il élimine les doubles saisies, réduit les erreurs et vous donne une vision financière en temps réel — sans attendre la clôture mensuelle.",
    mission: "Automatiser la comptabilité courante pour vous donner une vision financière en temps réel et libérer votre expert-comptable des tâches répétitives.",
    fonctionnalites: [
      "Catégorisation automatique des dépenses et recettes",
      "Rapprochement bancaire quotidien",
      "Génération et envoi automatique des factures",
      "Préparation et vérification des déclarations TVA",
      "Tableau de bord trésorerie en temps réel",
      "Détection d'anomalies et alertes de dérive budgétaire",
      "Rapport P&L mensuel automatisé",
      "Préparation du dossier bilan pour l'expert-comptable"
    ],
    secteurs: ['TPE & PME', 'Freelances & Indépendants', 'E-commerce', 'Agences', 'Restauration', 'Immobilier'],
    outils_compatibles: ['QuickBooks', 'Pennylane', 'Sage', 'Stripe', 'PayPal', 'Qonto', 'Shine', 'Google Sheets', 'Zapier'],
    resultats_attendus: [
      "Réduction de 85% du temps de saisie comptable",
      "Clôture mensuelle en 2 heures au lieu de 2 jours",
      "Zéro erreur de rapprochement bancaire",
      "Vision trésorerie à 90 jours disponible en permanence"
    ],
    temps_installation: '48 heures',
    prix: 490, prix_barre: 790,
    cta_label: 'Activer le comptable IA',
    cta_secondaire: 'Voir une démonstration',
    faq: [
      { question: "Remplace-t-il mon expert-comptable ?", reponse: "Non, il travaille en complément. Il prend en charge la saisie et le travail courant, et prépare un dossier propre pour votre expert-comptable qui peut se concentrer sur le conseil stratégique." },
      { question: "Est-il compatible avec mon logiciel de comptabilité ?", reponse: "Il s'intègre avec QuickBooks, Pennylane et Sage. Pour d'autres logiciels, un export au format FEC ou CSV est disponible." },
      { question: "Peut-il gérer la TVA intracommunautaire ?", reponse: "Oui, il gère la TVA française (normale, réduite, nulle) et la TVA intracommunautaire pour les opérations avec les pays de l'UE." },
      { question: "Comment se connecte-t-il à ma banque ?", reponse: "Via DSP2 (agrégation bancaire sécurisée), il se connecte à toutes les banques françaises et à Qonto, Shine, Revolut Business et N26." },
      { question: "Mes données financières sont-elles sécurisées ?", reponse: "Oui, les connexions bancaires sont chiffrées TLS, les données hébergées en France et l'accès protégé par authentification forte (2FA)." }
    ],
    seo_title: "Comptable IA — Automatisation Comptable et Reporting Financier | CA-TECH",
    seo_description: "Automatisez votre comptabilité avec notre IA. Saisie, rapprochement bancaire, TVA, tableaux de bord financiers. -85% de temps de saisie, vision trésorerie en temps réel.",
    ordre: 6,
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&auto=format&fit=crop'
  },
]

// ─── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const db = new Client(DB)
  await db.connect()
  console.log('Connecté à Supabase\n')

  for (const c of collaborateurs) {
    process.stdout.write(`→ ${c.nom}… `)

    // Upload image
    let imageUrl = null
    try {
      imageUrl = await uploadImage(c.slug, c.img)
    } catch (e) {
      console.warn(`(image échouée: ${e.message})`)
    }

    await db.query(`DELETE FROM catalogue_collaborateurs WHERE slug = $1`, [c.slug])

    const { rows } = await db.query(
      `INSERT INTO catalogue_collaborateurs (
        nom, slug, description, description_complete, mission,
        fonctionnalites, secteurs, outils_compatibles, resultats_attendus,
        temps_installation, categorie, icone, image_url,
        prix, prix_barre, cta_label, cta_secondaire,
        faq, seo_title, seo_description, visible, ordre
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING id`,
      [
        c.nom, c.slug, c.description, c.description_complete, c.mission,
        c.fonctionnalites, c.secteurs, c.outils_compatibles, c.resultats_attendus,
        c.temps_installation, c.categorie, c.icone, imageUrl,
        c.prix, c.prix_barre, c.cta_label, c.cta_secondaire,
        JSON.stringify(c.faq), c.seo_title, c.seo_description, true, c.ordre
      ]
    )
    console.log(`✓  (id: ${rows[0].id})`)
  }

  console.log('\n✅ 5 collaborateurs insérés avec succès')
  await db.end()
}

run().catch(e => { console.error('\nERREUR:', e.message); process.exit(1) })
