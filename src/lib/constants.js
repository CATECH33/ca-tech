// Navigation et données statiques CA-TECH

export const NAV_ITEMS = [
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Intelligence Artificielle', href: '/services/ia' },
      { label: 'Automatisation', href: '/services/automatisation' },
      { label: 'LLM & MCP', href: '/services/llm-mcp' },
      { label: 'Systèmes & Infra', href: '/services/systemes' },
      { label: 'Développement Web', href: '/services/developpement' },
    ],
  },
  { label: 'Réalisations', href: '/projets' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]

export const FOOTER_NAV = {
  expertises: [
    { label: 'Intelligence Artificielle', href: '/services/ia' },
    { label: 'Automatisation', href: '/services/automatisation' },
    { label: 'LLM & MCP', href: '/services/llm-mcp' },
    { label: 'Systèmes & Infra', href: '/services/systemes' },
    { label: 'Développement Web', href: '/services/developpement' },
  ],
  navigation: [
    { label: 'Réalisations', href: '/projets' },
    { label: 'À propos', href: '/a-propos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Devis', href: '/devis' },
  ],
  legal: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
    { label: 'Gestion des cookies', href: '/gestion-des-cookies' },
  ],
}

export const METRICS = [
  { value: '48h', label: 'Premier livrable IA opérationnel' },
  { value: '5', label: 'Pôles d\'expertise couverts' },
  { value: '2023', label: 'Fondé à Dijon, actif en France' },
  { value: '< 1 sem.', label: 'Prototype livré en sprint' },
]

export const EXPERTISE_CARDS = [
  {
    id: 'ia',
    icon: 'Brain',
    title: 'Intelligence Artificielle',
    description: 'Chatbots, agents métier, RAG, fine-tuning. Des systèmes IA qui s\'intègrent à vos processus.',
    tags: ['LLM', 'Agents IA', 'RAG', 'Fine-tuning'],
    href: '/services/ia',
  },
  {
    id: 'automatisation',
    icon: 'Zap',
    title: 'Automatisation',
    description: 'n8n, Make, scripts Node.js. Chaque heure économisée est une heure réinvestie.',
    tags: ['n8n', 'Make', 'Zapier', 'Scripts'],
    href: '/services/automatisation',
  },
  {
    id: 'llm-mcp',
    icon: 'Network',
    title: 'LLM & MCP',
    description: 'Architectures LLM sur-mesure, protocoles MCP, mémoire longue durée, orchestration d\'agents.',
    tags: ['OpenAI', 'Anthropic', 'LangChain', 'MCP'],
    href: '/services/llm-mcp',
  },
  {
    id: 'systemes',
    icon: 'Server',
    title: 'Systèmes & Infra',
    description: 'Cloud, APIs, pipelines de données, cybersécurité, monitoring. L\'architecture qui tient.',
    tags: ['Vercel', 'Supabase', 'AWS', 'APIs'],
    href: '/services/systemes',
  },
  {
    id: 'developpement',
    icon: 'Code2',
    title: 'Développement Web',
    description: 'Sites vitrines, apps SaaS, e-commerce, APIs. Interfaces qui convertissent.',
    tags: ['React', 'Next.js', 'Node.js', 'Supabase'],
    href: '/services/developpement',
  },
]

export const PROCESS_STEPS = [
  { number: '01', title: 'Diagnostic', description: 'Audit IA / Automatisation / SEO', duration: '1 semaine' },
  { number: '02', title: 'Stratégie', description: 'Roadmap priorisée, forfait défini', duration: '3 jours' },
  { number: '03', title: 'Sprint 1', description: 'Premier livrable livré', duration: 'Semaine 1' },
  { number: '04', title: 'Exécution', description: 'Développement itératif, démos', duration: '2–4 semaines' },
  { number: '05', title: 'Validation', description: 'Tests, ajustements, approbation', duration: '1 semaine' },
  { number: '06', title: 'Livraison', description: 'Mise en ligne + formation', duration: 'J-day' },
]

export const SYSTEM_DOMAINS = [
  { icon: 'Cloud', title: 'Cloud & Hébergement', description: 'Vercel, AWS, infra scalable' },
  { icon: 'Database', title: 'Data & Pipelines', description: 'PostgreSQL, ETL, analytics' },
  { icon: 'Plug', title: 'APIs & Intégrations', description: 'REST, webhooks, connecteurs' },
  { icon: 'Shield', title: 'Cybersécurité', description: 'Audit, durcissement, conformité' },
  { icon: 'Activity', title: 'Monitoring', description: 'Observabilité, alertes, logs' },
  { icon: 'Layers', title: 'Scalabilité', description: 'Architecture évolutive et résiliente' },
]

export const PORTFOLIO_PROJECTS = [
  {
    id: 'ca-tech-manager',
    title: 'CA-TECH Manager',
    type: 'App SaaS',
    description: 'Application de gestion interne — CRM, devis, facturation, analytics.',
    image: '/portfolio/pf-01-ca-tech-manager.webp',
    slug: 'ca-tech-manager',
    metric: 'App interne',
    tags: ['React', 'Supabase', 'Stripe'],
  },
  {
    id: 'cv-magic',
    title: 'CV Magic',
    type: 'Web App',
    description: 'Génération de CV optimisés ATS avec IA intégrée.',
    image: '/portfolio/pf-02-cv-magic.webp',
    slug: 'cv-magic',
    metric: '+200 CVs générés',
    tags: ['React', 'OpenAI', 'Node.js'],
  },
  {
    id: 'pasmal',
    title: 'Pasmal',
    type: 'E-commerce',
    description: 'Place de marché multi-vendeurs — catalogue produits, filtres avancés et espace marchand.',
    image: '/portfolio/pf-03-shopca.webp',
    slug: 'pasmal',
    metric: 'Marketplace live',
    tags: ['React', 'Node.js', 'Stripe'],
  },
  {
    id: 'pemous-money',
    title: 'Pemous Money',
    type: 'Finance App',
    description: 'Application de gestion financière personnelle avec analyses IA.',
    image: '/portfolio/pf-04-pemous-money.webp',
    slug: 'pemous-money',
    metric: '+180% engagement',
    tags: ['React', 'Node.js', 'AI'],
  },
]
