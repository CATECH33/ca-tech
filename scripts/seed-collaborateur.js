const { Client } = require('pg')

async function run() {
  const client = new Client({
    host: 'db.jhcyooksjeivajdjicka.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Thallia236**',
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()

  await client.query(`DELETE FROM catalogue_collaborateurs WHERE nom = 'Test Collaborateur'`)
  console.log('✓ Test supprimé')

  const faq = [
    {
      question: "En combien de temps est-il opérationnel ?",
      reponse: "L'Assistant Commercial IA est configuré et opérationnel en 48h. Nous intégrons vos données clients existantes, votre CRM et vos scripts de vente dès le départ."
    },
    {
      question: "Peut-il gérer plusieurs pipelines simultanément ?",
      reponse: "Oui, il peut gérer un nombre illimité de prospects en parallèle, sans perte de qualité ni oubli de suivi."
    },
    {
      question: "Est-ce qu'il remplace mon équipe commerciale ?",
      reponse: "Non, il la renforce. Il prend en charge les tâches répétitives (relances, qualification, reporting) pour que votre équipe se concentre sur la négociation et la signature."
    },
    {
      question: "Quels CRM sont compatibles ?",
      reponse: "HubSpot, Salesforce, Pipedrive, Notion, Airtable, Google Sheets et tout outil connecté via Zapier ou Make."
    },
    {
      question: "Comment sont sécurisées mes données ?",
      reponse: "Vos données restent hébergées sur des serveurs européens. Aucune donnée client n'est utilisée pour entraîner des modèles tiers."
    },
  ]

  await client.query(
    `INSERT INTO catalogue_collaborateurs (
      nom, slug, description, description_complete, mission,
      fonctionnalites, secteurs, outils_compatibles, resultats_attendus,
      temps_installation, categorie, icone, image_url,
      prix, prix_barre, cta_label, cta_secondaire,
      faq, seo_title, seo_description, visible, ordre
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
    [
      'Assistant Commercial IA',
      'assistant-commercial-ia',
      "Votre commercial IA disponible 24h/24 qui prospecte, relance et qualifie vos leads automatiquement.",
      "L'Assistant Commercial IA est un collaborateur autonome qui intègre l'ensemble de votre processus de vente. Il analyse votre pipeline, identifie les opportunités à fort potentiel, rédige des messages de prospection personnalisés et assure les relances au bon moment — sans que vous ayez à lever le petit doigt.\n\nConnecté à votre CRM et à vos outils existants, il centralise l'information, met à jour les fiches prospects et génère des rapports de performance hebdomadaires. Vos commerciaux se concentrent sur ce qui compte vraiment : convaincre et signer.",
      "Prospecter, qualifier et relancer vos leads automatiquement pour remplir votre pipeline de vente sans effort manuel.",
      ['Prospection automatisée par email et LinkedIn', 'Qualification des leads selon vos critères métier', "Relances intelligentes avec détection du bon moment d'envoi", 'Rédaction de messages personnalisés pour chaque prospect', 'Mise à jour automatique de votre CRM', "Détection des signaux d'achat et alertes en temps réel", 'Rapports de performance hebdomadaires', 'Scoring des prospects et priorisation du pipeline'],
      ['SaaS & Tech', 'Immobilier', 'Conseil & Services B2B', 'E-commerce', 'Recrutement', 'Formation'],
      ['HubSpot', 'Salesforce', 'Pipedrive', 'Notion', 'Google Sheets', 'LinkedIn Sales Navigator', 'Zapier', 'Make', 'Slack'],
      ['+40% de leads qualifiés par mois', 'Réduction de 70% du temps passé sur les relances', 'Taux de réponse moyen de 28% sur les séquences email', 'Pipeline commercial toujours à jour, zéro saisie manuelle'],
      '48 heures',
      'agent',
      '🤝',
      null,
      490,
      690,
      'Activer cet assistant',
      'Voir une démonstration',
      JSON.stringify(faq),
      'Assistant Commercial IA — Prospection & Relances Automatisées | CA-TECH',
      'Automatisez votre prospection et vos relances commerciales avec notre Assistant Commercial IA. Qualification de leads, CRM synchronisé, +40% de pipeline en 30 jours.',
      true,
      1,
    ]
  )

  console.log('✓ Assistant Commercial IA créé avec succès')
  await client.end()
}

run().catch(e => { console.error('ERREUR:', e.message); process.exit(1) })
