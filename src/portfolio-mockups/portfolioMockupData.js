// Portfolio mockup data — static fixture data, no live sources

export const PF01_DATA = {
  kpis: [
    { label: 'Pipeline', value: '€124K' },
    { label: 'Opportunités', value: '28' },
    { label: 'Conversion', value: '34%' },
  ],
  columns: [
    {
      id: 'qualification',
      label: 'Qualification',
      count: 4,
      deals: [
        { company: 'Nova Conseil', amount: '€18,000', proba: '40%', date: '12 Oct', tag: 'Entrant' },
        { company: 'Atlas Digital', amount: '€32,500', proba: '55%', date: '10 Oct', tag: 'Chaud' },
        { company: 'Studio 17', amount: '€8,400', proba: '30%', date: '08 Oct', tag: 'Entrant' },
        { company: 'Maison Rivière', amount: '€14,000', proba: '45%', date: '06 Oct', tag: 'Entrant' },
      ],
    },
    {
      id: 'proposition',
      label: 'Proposition',
      count: 3,
      deals: [
        { company: 'Orbis Group', amount: '€42,000', proba: '65%', date: '05 Oct', tag: 'Devis envoyé' },
        { company: 'Lumen Conseil', amount: '€27,300', proba: '70%', date: '03 Oct', tag: 'Devis envoyé' },
        { company: 'Aria SAS', amount: '€15,600', proba: '50%', date: '01 Oct', tag: 'Relance' },
      ],
    },
    {
      id: 'negociation',
      label: 'Négociation',
      count: 3,
      deals: [
        { company: 'Vertex Labs', amount: '€58,000', proba: '80%', date: '28 Sep', tag: 'Priorité' },
        { company: 'Solaris Tech', amount: '€21,000', proba: '75%', date: '25 Sep', tag: 'En cours' },
        { company: 'Branche & Co', amount: '€11,200', proba: '60%', date: '20 Sep', tag: 'En cours' },
      ],
    },
    {
      id: 'gagne',
      label: 'Gagné',
      count: 3,
      won: true,
      deals: [
        { company: 'Nexus IA', amount: '€35,000', proba: '100%', date: '15 Sep', tag: 'Signé' },
        { company: 'Petra Digital', amount: '€19,800', proba: '100%', date: '10 Sep', tag: 'Signé' },
        { company: 'Blue Oak Agency', amount: '€44,500', proba: '100%', date: '02 Sep', tag: 'Signé' },
      ],
    },
    {
      id: 'perdu',
      label: 'Perdu',
      count: 2,
      lost: true,
      deals: [
        { company: 'Horizon SAS', amount: '€22,000', proba: '0%', date: '18 Sep', tag: 'Archivé' },
        { company: 'Crest Media', amount: '€9,500', proba: '0%', date: '12 Sep', tag: 'Archivé' },
      ],
    },
  ],
}

export const PF02_DATA = {
  cv: {
    name: 'Alexandre Martin',
    title: 'Consultant IA & Infrastructure',
    location: 'Paris, France',
    email: 'a.martin@conseil.fr',
    phone: '+33 6 12 34 56 78',
    experience: [
      {
        role: 'Lead AI Consultant',
        company: 'Nexus Digital',
        period: '2022 – Présent',
        bullets: [
          'Déploiement de 3 agents IA en production client',
          'Réduction des coûts opérationnels de 40 %',
          'Architecture RAG sur 2 millions de documents',
        ],
      },
      {
        role: 'Ingénieur Solutions Cloud',
        company: 'Vertex Labs',
        period: '2019 – 2022',
        bullets: [
          'Architecture cloud AWS et GCP pour 8 clients grands comptes',
          'Management d\'une équipe de 6 développeurs',
        ],
      },
    ],
    skills: ['Python', 'LangChain', 'AWS', 'Node.js', 'PostgreSQL', 'Docker', 'FastAPI', 'Terraform'],
    education: 'Master Informatique — Université Paris-Saclay · 2019',
  },
  analysis: {
    score: 92,
    ats: 'Optimisé ATS',
    sections: [
      { label: 'Impact', value: 88 },
      { label: 'Lisibilité', value: 95 },
      { label: 'Mots-clés', value: 91 },
      { label: 'Structure', value: 97 },
    ],
    recommendations: [
      'Renforcer les résultats chiffrés dans les expériences récentes.',
      'Ajouter des certifications AWS ou GCP pour booster l\'ATS.',
      'Reformuler le titre pour inclure le secteur cible.',
    ],
  },
}

export const PF03_DATA = {
  categories: ['Tous', 'Maison', 'Tech', 'Mode', 'Services'],
  products: [
    { id: 1, name: 'Studio Lamp', category: 'Maison', price: '€129', rating: 4.8, reviews: 124, color: '#C8C0B0' },
    { id: 2, name: 'Oak Chair', category: 'Maison', price: '€349', rating: 4.9, reviews: 89, color: '#B8A898' },
    { id: 3, name: 'Minimal Watch', category: 'Mode', price: '€219', rating: 4.7, reviews: 203, color: '#C0C8D0' },
    { id: 4, name: 'Desk System', category: 'Tech', price: '€489', rating: 4.9, reviews: 67, color: '#A8B4C0' },
    { id: 5, name: 'Ceramic Vase', category: 'Maison', price: '€89', rating: 4.6, reviews: 156, color: '#D0C8B8' },
    { id: 6, name: 'Leather Bag', category: 'Mode', price: '€289', rating: 4.8, reviews: 91, color: '#B0A898' },
    { id: 7, name: 'Notebook Set', category: 'Tech', price: '€49', rating: 4.5, reviews: 312, color: '#BCC4CC' },
    { id: 8, name: 'Table Fan', category: 'Maison', price: '€159', rating: 4.7, reviews: 78, color: '#B8C0C8' },
  ],
  filters: [
    { label: 'Fourchette de prix', options: ['< €100', '€100–€300', '€300–€500', '> €500'] },
    { label: 'Note', options: ['4.5+', '4.0+', 'Toutes'] },
    { label: 'Disponibilité', options: ['En stock', 'Tous'] },
  ],
}

export const PF04_DATA = {
  balance: '€84 520,40',
  variation: '+8,4 %',
  variationPositive: true,
  ytd: '+€6 520',
  metrics: [
    { label: 'Rendement annuel', value: '+12,4 %' },
    { label: 'Volatilité', value: '6,2 %' },
    { label: 'Ratio Sharpe', value: '1.84' },
  ],
  allocation: [
    { label: 'Investissements', pct: 58, color: '#359BD9' },
    { label: 'Épargne', pct: 20, color: '#1A4066' },
    { label: 'Liquidités', pct: 22, color: '#A5ACB5' },
  ],
  // normalized 0–100 — 12 monthly data points
  performance: [42, 45, 43, 52, 58, 55, 62, 68, 64, 72, 78, 84],
  months: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct'],
  transactions: [
    { label: 'Virement Apple Inc.', date: '01 Oct 2026', amount: '+€2 400', positive: true },
    { label: 'Loyer Appartement', date: '30 Sep 2026', amount: '-€1 200', positive: false },
    { label: 'Dividendes ETF World', date: '29 Sep 2026', amount: '+€340', positive: true },
    { label: 'Abonnements SaaS', date: '28 Sep 2026', amount: '-€89', positive: false },
    { label: 'Remboursement assurance', date: '26 Sep 2026', amount: '+€120', positive: true },
  ],
}
