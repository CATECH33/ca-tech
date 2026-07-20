# ARCHITECTURE — CA-TECH

> **Dernière mise à jour** : Juillet 2026  
> **Mise à jour requise** : à chaque ajout/suppression de page, hook, composant, API ou dépendance majeure.

---

## Table des matières

1. [Arborescence](#1-arborescence)
2. [Pages HTML statiques](#2-pages-html-statiques)
3. [Routes Vercel](#3-routes-vercel)
4. [CSS](#4-css)
5. [JavaScript partagé](#5-javascript-partagé)
6. [API — Vercel Functions](#6-api--vercel-functions)
7. [Manager — React/Vite](#7-manager--reactvite)
   - 7.1 [Contextes](#71-contextes)
   - 7.2 [Hooks](#72-hooks)
   - 7.3 [Composants](#73-composants)
   - 7.4 [Pages](#74-pages)
   - 7.5 [Lib & Services](#75-lib--services)
   - 7.6 [Types](#76-types)
   - 7.7 [Dépendances clés](#77-dépendances-clés)
8. [Admin statique](#8-admin-statique)
9. [Assets](#9-assets)
10. [Flux de données](#10-flux-de-données)
11. [Stack technique](#11-stack-technique)
12. [Variables d'environnement](#12-variables-denvironnement)

---

## 1. Arborescence

```
ca-tech/
├── admin/                   → Dashboard admin legacy (HTML statique)
│   ├── css/admin.css
│   ├── js/admin.js
│   ├── loic-ia/             → Interface Loïc IA spécialisée (6 pages)
│   └── *.html               → 11 pages admin
│
├── api/                     → Vercel Serverless Functions (Node.js CJS)
│   ├── create-checkout.js
│   ├── devis.js
│   ├── notifications.js     → module (non-routé directement)
│   ├── products.js          → module (catalogue produits)
│   ├── session-status.js
│   └── webhook.js
│
├── assets/
│   └── logos/
│       └── logo-ca-tech.png → Logo principal (nav + footer)
│
├── css/
│   ├── main.css             → Design system homepage (tokens, composants)
│   └── auto-detail.css      → Styles fiches automatisations
│
├── docs/                    → Documentation projet (27 .md)
│
├── js/
│   ├── automations.js       → Données catalogue automatisations
│   └── scroll-animations.js → IntersectionObserver animations
│
├── manager/                 → App React 19 + Vite (CRM interne)
│   ├── dist/                → Build production (servi par Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx          → Routeur principal
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── public/                  → Assets statiques publics
│   ├── automatisations/     → Icônes outils (WebP)
│   ├── collaborateurs/      → Portraits IA (WebP)
│   ├── images/              → Images variées
│   ├── portfolio/           → Screenshots réalisations (WebP)
│   │   ├── branding/
│   │   ├── ca-tech-manager/
│   │   ├── cv-magic/
│   │   ├── pasmal/
│   │   └── pemous-money/
│   ├── services/            → Visuels services (WebP)
│   ├── favicon.ico + *.png  → Favicons
│   └── site.webmanifest
│
├── scripts/
│   ├── optimize-images.mjs  → Compression WebP (sharp)
│   └── screenshot-*.mjs     → Captures d'écran Playwright
│
├── supabase/                → Migrations SQL, Edge Functions
│
├── local-seo.css            → CSS pages locales (minifié)
├── nav.js                   → Header injecté (toutes pages)
├── footer.js                → Footer injecté (toutes pages)
├── loic-widget.js           → Widget chat Loïc (flottant)
├── index.html               → Homepage (site vitrine)
├── *.html                   → 45 autres pages statiques
├── vercel.json              → Routing, headers, rewrites
├── package.json             → Dépendances racine
└── ARCHITECTURE.md          → Ce fichier
```

---

## 2. Pages HTML statiques

**46 fichiers HTML** à la racine, servis en statique par Vercel. Chargent `nav.js`, `footer.js`, `loic-widget.js` (tous en `defer`).

### Pages principales
| Fichier | Description |
|---|---|
| `index.html` | Homepage — hero IA, services, réalisations, FAQ, contact |
| `solutions.html` | Vue d'ensemble des solutions CA-TECH |
| `catalogue.html` | Marketplace 27+ automatisations |
| `automatisations.html` | Hub automatisations (filtre dynamique) |
| `collaborateurs-ia.html` | 6 collaborateurs IA (commercial, support, RH, juridique, SEO, comptable) |
| `tarifs.html` | Grille tarifaire + CTA Stripe |
| `faq.html` | FAQ accordéon |
| `devis.html` | Configurateur devis intelligent |
| `commande-confirmation.html` | Confirmation post-paiement Stripe |

### Services (création web)
| Fichier | Service |
|---|---|
| `creation-site-vitrine.html` | Site vitrine |
| `creation-site-ecommerce.html` | Site e-commerce |
| `creation-landing-page.html` | Landing page |
| `creation-logo.html` | Logo |
| `creation-flyer.html` | Flyer |
| `identite-visuelle.html` | Identité visuelle complète |
| `refonte-site-internet.html` | Refonte |
| `maintenance-site-web.html` | Maintenance |

### Automatisations (fiches détail)
| Fichier | Automatisation |
|---|---|
| `auto-drive-ia-classement.html` | Google Drive + IA |
| `auto-forms-sheets-devis.html` | Forms → Sheets → Devis |
| `auto-gmail-calendar-slack.html` | Gmail / Calendar / Slack |
| `auto-hubspot-slack-calendar.html` | HubSpot / Slack / Calendar |
| `auto-linkedin-apify-crm.html` | LinkedIn → Apify → CRM |
| `auto-outlook-teams-crm.html` | Outlook / Teams → CRM |
| `auto-stripe-facture-email.html` | Stripe → Facture → Email |
| `auto-whatsapp-crm-email.html` | WhatsApp → CRM → Email |

### SEO local
| Catégorie | Paris | Lyon | Dijon | Troyes |
|---|---|---|---|---|
| Agence web | `agence-web-paris.html` | `agence-web-lyon.html` | `agence-web-dijon.html` | `agence-web-troyes.html` |
| Logo | `logo-paris.html` | `logo-lyon.html` | `logo-dijon.html` | `logo-troyes.html` |
| Site internet | `site-internet-paris.html` | `site-internet-lyon.html` | `site-internet-dijon.html` | `site-internet-troyes.html` |
| Site e-commerce | `site-ecommerce-paris.html` | `site-ecommerce-lyon.html` | `site-ecommerce-dijon.html` | `site-ecommerce-troyes.html` |

### Réalisations
| Fichier | Projet |
|---|---|
| `realisation-ca-tech-manager.html` | CA-TECH Manager (CRM) |
| `realisation-cv-magic.html` | CV Magic (builder) |
| `realisation-pasmal.html` | Pasmal (dashboard) |
| `realisation-pemous-money.html` | Pemous Money (finance) |

### Légal
- `mentions-legales.html`
- `politique-de-confidentialite.html`

---

## 3. Routes Vercel

Configuration dans `vercel.json`.

### Comportement global
```
cleanUrls: true      → /page (sans .html dans l'URL)
trailingSlash: false → Pas de slash final
```

### Headers de sécurité (toutes routes)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Cache headers
```
/assets/(*) → Cache-Control: public, max-age=31536000, immutable
/public/(*)  → Cache-Control: public, max-age=86400
```

### Redirects
```
/index → / (301 permanent)
```

### Rewrites (Manager SPA)
```
/manager             → /manager/dist/
/manager/(.*)        → /manager/dist/
/manager/assets/(.*) → /manager/dist/assets/$1
/manager/icons.svg   → /manager/dist/icons.svg
```

### Fonctions API
```
api/*.js → maxDuration: 30s
```

---

## 4. CSS

### `css/main.css` — Design system homepage
- **Chargé par** : `index.html`, `solutions.html`, `catalogue.html`, `tarifs.html`, pages services, pages SEO local, FAQ
- **Contenu** : tokens CSS (`:root`), reset, utilitaires, boutons, cartes, sections, header/nav, hero, FAQ, footer, scroll reveal, responsive
- **~1 100 lignes**, non minifié

### `css/auto-detail.css` — Fiches automatisations
- **Chargé par** : `auto-*.html` (8 pages détail)
- **Contenu** : hero dark, breadcrumb, features, pricing cards, CTA, animations hover

### `local-seo.css` — Pages locales
- **Chargé par** : `agence-web-*.html`, `logo-*.html`, `site-internet-*.html`, `site-ecommerce-*.html`, `automatisations.html`, `catalogue.html`, `collaborateurs-ia.html`, `faq.html`, pages services
- **Contenu** : hero local, sections, grilles, cards — version minifiée

### `admin/css/admin.css` — Admin
- **Chargé par** : `admin/*.html` uniquement

---

## 5. JavaScript partagé

Tous les scripts partagés sont chargés avec l'attribut `defer`.

### `nav.js` — Header universel
Injecte le `<header>` sur toutes les pages via `document.getElementById('nav')`.

**Fonctionnalités** :
- Logo + menu desktop (10 liens + CTA devis)
- Menu mobile (hamburger)
- Lien actif automatique (slug-based)
- Classe `.scrolled` après 80px de scroll
- `cleanUrls`-aware (hérite du slug courant)

**Pages clientes** : les 44 pages statiques (tout sauf `index.html` qui a son propre header inline)

---

### `footer.js` — Footer universel
Injecte le `<footer>` sur toutes les pages.

**Colonnes** :
1. Brand (logo, description, zones d'intervention)
2. Services (création web, logos, etc.)
3. Collaborateurs IA (avec anchors)
4. Automatisations
5. Contact (email, téléphone, LinkedIn, WhatsApp) + liens légaux

**Pages clientes** : les 45 pages statiques

---

### `loic-widget.js` — Chat Loïc (29 KB)
Widget de chat commercial flottant, autonome, sans dépendance externe.

**Architecture** :
- IIFE, auto-injecte CSS + DOM au `DOMContentLoaded`
- Bouton flottant 60px (bottom-right) avec animation pulse
- Panel 380×560px (responsive mobile)
- Conversation avec bulles user/assistant + typing indicator
- Progress bar qualification (6 champs : nom, email, téléphone, entreprise, projet, budget)

**API** : `POST https://jhcyooksjeivajdjicka.supabase.co/functions/v1/loic-chat`

**Actions supportées** (retournées par l'API) :
- `show_quote` → affiche estimation devis
- `propose_appointment` → propose RDV
- `create_lead` → enregistre lead en BDD

**Fallback** : mode démo avec réponses pré-écrites si API indisponible

**Persistance** : `sessionStorage` (conversation_id par onglet)

---

### `js/scroll-animations.js` — Animations IntersectionObserver
- Classes `.reveal`, `.reveal-l`, `.reveal-r` (slide depuis bas/gauche/droite)
- Stagger transitions sur grilles de cartes
- Légère parallaxe au scroll
- Respecte `prefers-reduced-motion`

**Chargé par** : `index.html`, `collaborateurs-ia.html`, `automatisations.html`

---

### `js/automations.js` — Données catalogue
Dictionnaire statique des automatisations (utilisé par `automatisations.html` pour le filtre dynamique).

**Structure** :
```js
APPS = { gmail: { label, color, icon }, slack: { ... }, ... }
AUTOMATIONS = [{ id, name, slug, description, apps[], category, prix_min, prix_max }, ...]
```

---

## 6. API — Vercel Functions

Toutes dans `api/`, servies comme Vercel Serverless Functions (Node.js CJS). CORS configuré pour `https://www.ca-tech.fr`.

### `GET /api/session-status`
```
Params  : ?session_id=<stripe_session_id>
Deps    : stripe
Retour  : { sessionId, productName, amount, currency, customerName, customerEmail, mode }
Rôle    : Vérifie l'état d'un paiement Stripe après redirection depuis Checkout
```

### `POST /api/create-checkout`
```
Body    : { productId }
Deps    : stripe, ./products
Retour  : { url, sessionId }
Rôle    : Crée une session Stripe Checkout (paiement unique ou abonnement)
Flux    : getProduct(productId) → stripe.checkout.sessions.create() → url
```

### `POST /api/webhook`
```
Header  : stripe-signature (vérifié)
Deps    : stripe, supabase, ./notifications
Rôle    : Traite les événements Stripe
Événements :
  checkout.session.completed  → Client + Projet + Paiement + Facture + notification
  invoice.payment_succeeded   → Log renouvellement abonnement
  customer.subscription.deleted → Log annulation
```

### `GET|POST|PATCH /api/devis`
```
GET    : ?action=list[&status=sent][&limit=50]  → Liste devis
GET    : ?action=get&id=<UUID>                  → Devis unique
POST   : { client, service, montant, ... }      → Créer devis
PATCH  : { id, statut }                         → Mettre à jour / relancer
Deps   : supabase, ./notifications
```

### `./api/products.js` — Catalogue produits (module interne)
```
Export  : getProduct(productId), PRODUCTS
Rôle    : Catalogue CA-TECH avec prix Stripe (amount en centimes)
Usage   : importé par create-checkout.js et webhook.js
```

### `./api/notifications.js` — Service notifications (module interne)
```
Export  : notify(type, data, supabase)
Deps    : resend, Telegram Bot API, CallMeBot (WhatsApp)
Canaux  : email (Resend), telegram (alertes équipe), whatsapp (client)
Types   : paiement_confirme, abonnement_souscrit, devis_envoye,
          devis_client, nouveau_prospect, nouveau_client, erreur_critique, ...
Comportement : chaque canal échoue gracieusement, n'interrompt pas les autres
```

---

## 7. Manager — React/Vite

SPA React 19 + TypeScript + Vite 8. Servie depuis `/manager/dist/`. Routes lazy-loaded.

### 7.1 Contextes

| Fichier | Export | Rôle |
|---|---|---|
| `contexts/AuthContext.tsx` | `AuthProvider`, `useAuth()` | Session Supabase (user, loading, signOut), listener real-time |

---

### 7.2 Hooks

#### Données métier (Supabase + React Query)
| Hook | Rôle |
|---|---|
| `useClients` | CRUD clients (liste, détail, création, édition) |
| `useProjets` | Projets (statut, dates, ressources) |
| `useDevis` | Devis (création, envoi, suivi, relance) |
| `useFactures` | Factures (génération, PDF, paiement) |
| `usePaiements` | Paiements (historique Stripe) |
| `useTaches` | Tâches (assignation, priorité, statut) |
| `useLeads` | Leads (liste, qualification) |
| `useServices` | Services catalogue (maintenance, tarification) |
| `usePortfolio` | Projets portfolio (galerie) |
| `useDocuments` | Documents (uploads, Drive links) |
| `useAgenda` | Calendrier (événements, RDV) |
| `useTickets` | Tickets support |
| `useNotifications` | Notifications in-app (badge, liste) |
| `useMessages` | Chat interne équipe |

#### Intégrations tierces
| Hook | Rôle |
|---|---|
| `useGoogleIntegration` | OAuth Google (état de connexion, scopes) |
| `useGoogleDrive` | API Drive (fichiers, upload) |
| `useGmailSend` | Envoi email via Gmail API |
| `useCalendarEvents` | Sync Google Calendar |
| `useSheetsSync` | Export/import Google Sheets |

#### Module prospection
| Hook | Rôle |
|---|---|
| `useProspects` | Gestion prospects (CRUD, import Apify) |
| `useApify` | Intégration Apify (web scraping LinkedIn/Maps) |
| `useCampagnes` | Campagnes multi-canal (créer, envoyer, suivre) |
| `useRecommendations` | Recommandations IA (scoring ML) |
| `useEmailDrafts` | Brouillons emails auto-générés (Claude) |

#### Utilitaires
| Hook | Rôle |
|---|---|
| `useLoic` | Conversations Loïc (analytics, qualifications) |
| `useDashboardRealtime` | Realtime Supabase (WebSocket, live KPIs) |
| `useConnectors` | Config connecteurs (n8n, Zapier, API keys) |
| `useAudit` | Logs d'audit (actions, timestamps) |
| `useInAppNotifications` | Pop-ups et toasts |

---

### 7.3 Composants

#### `components/ui/` — Primitives
| Composant | Description |
|---|---|
| `Button` | Bouton (variant: primary, outline, ghost, destructive) |
| `Badge` | Badge statut (coloré par type) |
| `Card` | Wrapper carte avec shadow |
| `Input` | Champ texte avec label/error |
| `Avatar` | Photo utilisateur (Radix Avatar + fallback initiales) |
| `Table` | Tableau (colonnes configurables, tri) |
| `Modal` | Dialog modal (Radix Dialog, trap focus) |
| `StatCard` | Carte KPI Dashboard (valeur, tendance, icône) |
| `FileUpload` | Drag-and-drop upload |
| `Toast` | Notification toast (succès/erreur/info) |

#### `components/layout/` — Structure
| Composant | Description |
|---|---|
| `Layout` | Wrapper principal (Sidebar + zone contenu) |
| `Sidebar` | Navigation latérale (logo, menu, profil utilisateur) |
| `Header` | En-tête page (recherche, notifications, user menu) |
| `Breadcrumbs` | Chemin de navigation |

#### `components/auth/`
| Composant | Description |
|---|---|
| `ProtectedRoute` | HOC — redirige vers `/login` si session absente |

#### `components/prospection/`
| Composant | Description |
|---|---|
| `ProspectAuditPanel` | Historique actions sur un prospect |
| `ProspectRecommendPanel` | Recommandations IA (prochaine action) |
| `ProspectScorePanel` | Score commercial (0–100) avec détail critères |
| `ProspectAnalysePanel` | Analyse complète (secteur, taille, potentiel) |

---

### 7.4 Pages

Toutes lazy-loadées via `React.lazy()` + `Suspense` dans `App.tsx`.

#### Pages métier
| Route | Composant | Description |
|---|---|---|
| `/` | `Dashboard` | Accueil CRM (KPIs, chiffres, alertes, timeline) |
| `/clients/*` | `Clients` | Gestion clients (liste, fiche, édition) |
| `/leads/*` | `Leads` | Pipeline leads (qualification) |
| `/devis/*` | `Devis` | Devis (création, PDF, envoi, relance) |
| `/factures/*` | `Factures` | Factures (génération, paiement, archive) |
| `/projets/*` | `Projets` | Projets (kanban, timeline) |
| `/taches/*` | `Taches` | Tâches (liste, assignation, filtres) |
| `/services/*` | `Services` | Catalogue services (tarification, maintenance) |
| `/paiements/*` | `Paiements` | Suivi paiements Stripe |
| `/portfolio/*` | `Portfolio` | Réalisations (galerie, case studies) |
| `/agenda/*` | `Agenda` | Calendrier (RDV, sync Google) |
| `/messages/*` | `Messages` | Chat interne équipe |
| `/support/*` | `Support` | Tickets support client |
| `/loic/*` | `Loic` | Dashboard Loïc (conversations, analytics) |
| `/notifications/*` | `Notifications` | Centre notifications |
| `/documents/*` | `Documents` | Gestion fichiers (Drive, uploads) |
| `/integrations` | `Integrations` | Connecteurs tiers (config, test) |
| `/parametres/*` | `Parametres` | Compte, équipe, facturation |

#### Pages Auth (chargement statique — non lazy)
| Route | Composant |
|---|---|
| `/login` | `Login` |
| `/forgot-password` | `ForgotPassword` |
| `/reset-password` | `ResetPassword` |
| `/auth/google/callback` | `GoogleOAuthCallback` |

#### Module Prospection (`/prospection/*`)
| Route | Composant | Description |
|---|---|---|
| `/prospection` | `ProspectionCommercialDashboard` | KPIs commerciaux (taux conversion, ROI) |
| `/prospection/ia` | `ProspectionDashboard` | Dashboard IA prospection |
| `/prospection/prospects` | `ProspectionProspects` | Liste prospects (import Apify) |
| `/prospection/recherche` | `ProspectionRecherche` | Recherche (LinkedIn, Google Maps) |
| `/prospection/qualification` | `ProspectionQualification` | Qualification et scoring |
| `/prospection/brouillons` | `ProspectionBrouillons` | Emails auto-générés (Claude) |
| `/prospection/campagnes` | `ProspectionCampagnes` | Campagnes multi-canal |
| `/prospection/relances` | `ProspectionRelances` | Relances automatiques |
| `/prospection/statistiques` | `ProspectionStatistiques` | Analytics (funnel, sources) |
| `/prospection/pipeline` | `ProspectionPipeline` | Kanban pipeline (drag-drop) |
| `/prospection/prospects/:id` | `ProspectionProspectDetail` | Fiche prospect détail |
| `/prospection/connecteurs` | `ProspectionConnecteurs` | Config Apify, webhooks |
| `/prospection/config` | `ProspectionParametres` | Paramètres module |

---

### 7.5 Lib & Services

#### `lib/`
| Fichier | Rôle |
|---|---|
| `supabase.ts` | Client Supabase (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`) |
| `utils.ts` | Formatage, validation, utilitaires purs |
| `scoreCommercial.ts` | Algorithme scoring prospect (0–100, multi-critères) |
| `googleOAuth.ts` | Config Google OAuth (client ID, scopes Calendar/Drive/Gmail) |
| `prospect-importer.ts` | Parse CSV Apify/LinkedIn → entités Supabase |
| `auto-draft.ts` | Génération brouillons emails via Claude API |
| `auto-analyse.ts` | Analyse automatique prospect (secteur, potentiel) |

#### `services/`
| Fichier | Rôle |
|---|---|
| `mailProvider.ts` | Envoi email (Resend API + Gmail API), templates HTML, pièces jointes |

---

### 7.6 Types

`types/index.ts` — définitions TypeScript centralisées :
- `User`, `Session`
- `Client`, `Prospect`, `Lead`
- `Projet`, `Tache`, `Service`
- `Devis`, `Facture`, `Paiement`
- `Campagne`, `Relance`, `EmailDraft`
- Types utilitaires (`Pagination`, `ApiResponse`, `Filter`)

---

### 7.7 Dépendances clés

#### Runtime
| Package | Version | Rôle |
|---|---|---|
| `react` | 19.2.6 | Framework UI |
| `react-dom` | 19.2.6 | Rendering DOM |
| `react-router-dom` | 7.18.0 | Routage SPA |
| `@tanstack/react-query` | 5.101.0 | State management (server state) |
| `@supabase/supabase-js` | 2.110.5 | BDD, Auth, Realtime |
| `tailwindcss` | 3.4.19 | Utility CSS |
| `lucide-react` | 1.21.0 | Icônes |
| `recharts` | 3.8.1 | Graphiques (lazy-loaded — `/statistiques` uniquement) |
| `jspdf` | 4.2.1 | Génération PDF (lazy-loaded) |
| `html2canvas` | 1.4.1 | Capture DOM→PNG (lazy-loaded, avec jspdf) |
| `date-fns` | 4.4.0 | Manipulation dates |
| `clsx` + `tailwind-merge` + `class-variance-authority` | — | Gestion className |
| `@radix-ui/react-*` | — | Composants headless (dialog, select, tabs, avatar…) |

#### Build chunks (vite.config.ts — `manualChunks`)
| Chunk | Contenu | Taille gzip |
|---|---|---|
| `vendor-react` | react, react-dom, react-router-dom | ~56 KB |
| `vendor-supabase` | @supabase/supabase-js | ~52 KB |
| `vendor-charts` | recharts + d3 | ~112 KB |
| `vendor-pdf` | jspdf, html2canvas | ~177 KB |
| `vendor-query` | @tanstack/react-query | ~10 KB |
| `vendor-ui` | lucide-react, clsx, cva, tailwind-merge | ~21 KB |
| `vendor-dates` | date-fns | ~9 KB |
| `index` (app core) | AuthContext, Layout, routing | ~23 KB |
| `Dashboard`, `Clients`, etc. | Chunk par page lazy | 7–90 KB chacun |

---

## 8. Admin statique

Pages HTML dans `admin/`. CSS/JS autonomes, sans dépendance sur nav.js ou footer.js.

### `admin/`
| Page | Description |
|---|---|
| `dashboard.html` | Tableau de bord (statut projet, KPIs) |
| `clients.html` | Gestion clients |
| `projets.html` | Gestion projets |
| `devis.html` | Gestion devis |
| `factures.html` | Gestion factures |
| `paiements.html` | Paiements reçus |
| `leads.html` | Leads/prospects |
| `agenda.html` | Agenda équipe |
| `portfolio.html` | Portfolio |
| `parametres.html` | Paramètres généraux |

### `admin/loic-ia/`
Interface dédiée à Loïc IA (dashboard analytique).

| Page | Description |
|---|---|
| `index.html` | Dashboard Loïc (conversations globales) |
| `devis.html` | Loïc devis (estimations) |
| `qualification.html` | Qualification leads |
| `crm.html` | Intégration CRM |
| `agenda.html` | Planification RDV |
| `stripe.html` | Paiements associés |

**Stack** : `admin/css/admin.css` + `admin/js/admin.js` (vanilla JS)

---

## 9. Assets

### `assets/logos/`
- `logo-ca-tech.png` — Logo principal CA-TECH (36×36px dans la nav)

### `public/` — Assets par catégorie

| Dossier | Contenu |
|---|---|
| `automatisations/` | Icônes outils WebP : gmail, slack, telegram, whatsapp, google-calendar, hero |
| `collaborateurs/` | Portraits IA WebP : commercial-ia, support-ia, rh-ia, juridique-ia, seo-ia, hero |
| `images/collaborateurs/` | Portraits haute résolution (WebP optimisés) |
| `portfolio/branding/` | Logos et flyers créations (WebP) |
| `portfolio/ca-tech-manager/` | Screenshots Manager : dashboard, clients, home |
| `portfolio/cv-magic/` | Screenshots CV Magic : home, cv-builder |
| `portfolio/pasmal/` | Screenshots Pasmal : dashboard, home |
| `portfolio/pemous-money/` | Screenshot Pemous Money : home |
| `services/` | Visuels services : site-vitrine, ecommerce, logo-design, flyer-design, branding, landing-page |

**Format** : tous WebP (optimisés avec `npm run optimize:images` — sharp, qualité 82, max 1400px)

### Favicons & PWA
```
public/favicon.ico
public/favicon-16x16.png
public/favicon-32x32.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png (+ .webp optimisé)
public/site.webmanifest
```

---

## 10. Flux de données

### Paiement Stripe
```
tarifs.html
  → POST /api/create-checkout { productId }
  → Stripe Checkout (externe)
  → GET /commande-confirmation?session_id=...
    → GET /api/session-status
  [asynchrone] POST /api/webhook (event Stripe)
    → Supabase : Client + Projet + Paiement + Facture + AuditLog
    → Notifications : Email (Resend) + Telegram + WhatsApp
```

### Chat Loïc
```
loic-widget.js (toutes pages)
  → POST supabase.co/functions/v1/loic-chat
  → Supabase Edge Function (Claude API)
  → sessionStorage (conversation_id)
  → Actions : create_lead → Supabase leads table
```

### Manager CRM
```
/manager/* (SPA React)
  → AuthContext → Supabase Auth
  → ProtectedRoute (redirect /login si absent)
  → useXxx hooks → React Query → Supabase SDK
  → Supabase Realtime (WebSocket) → live updates
```

### Prospection
```
/prospection/* (module Manager)
  → useApify → Apify API (scraping LinkedIn/Maps)
  → prospect-importer.ts → Supabase prospects
  → auto-analyse.ts + scoreCommercial.ts → scoring
  → auto-draft.ts → Claude API → brouillons emails
  → useCampagnes → envoi via Gmail API ou Resend
```

---

## 11. Stack technique

| Couche | Technologie |
|---|---|
| Site vitrine | HTML5 statique, CSS vanilla, JS ES6 (defer) |
| CSS | `main.css` (design system), `auto-detail.css`, `local-seo.css` (minifié) |
| Partage UI | `nav.js`, `footer.js` (injection DOM) |
| Chat commercial | `loic-widget.js` → Supabase Edge Function |
| Manager (CRM) | React 19 + TypeScript + Vite 8 + Tailwind CSS 3 |
| Routing SPA | React Router v7 + code splitting (React.lazy) |
| Server state | @tanstack/react-query v5 |
| Base de données | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| API Serverless | Vercel Functions (Node.js CJS, max 30s) |
| Paiements | Stripe (Checkout, Subscriptions, Webhooks) |
| Email | Resend API (templates HTML) |
| Notifications | Telegram Bot + WhatsApp (CallMeBot) |
| IA | Claude API (Edge Functions Supabase) |
| Images | WebP (sharp, q82, max 1400px) via `npm run optimize:images` |
| Déploiement | Vercel (auto-deploy sur `master`) |
| Monitoring | Supabase Dashboard + Vercel Logs |

---

## 12. Variables d'environnement

### Racine (Vercel Functions)
```bash
STRIPE_SECRET_KEY          # Clé secrète Stripe
STRIPE_WEBHOOK_SECRET      # Secret validation webhook Stripe
SUPABASE_URL               # URL projet Supabase (service)
SUPABASE_SERVICE_ROLE_KEY  # Clé service Supabase (admin)
RESEND_API_KEY             # Clé Resend (emails)
TELEGRAM_BOT_TOKEN         # Token bot Telegram
TELEGRAM_CHAT_ID           # Chat ID Telegram (alertes équipe)
CALLMEBOT_PHONE            # Numéro WhatsApp (CallMeBot)
CALLMEBOT_APIKEY           # Clé CallMeBot
ADMIN_EMAIL                # Email destinataire notifications admin
SITE_URL                   # URL publique (CORS, redirections Stripe)
```

### Manager (préfixe `VITE_` — exposées au client)
```bash
VITE_SUPABASE_URL          # URL projet Supabase (client)
VITE_SUPABASE_ANON_KEY     # Clé anonyme Supabase (client)
```

---

## Quand mettre à jour ce document

Mettre à jour `ARCHITECTURE.md` après :

- ✅ Ajout ou suppression d'une page HTML
- ✅ Ajout ou suppression d'une route `/prospection/*` ou autre
- ✅ Nouveau hook, contexte ou composant Manager
- ✅ Nouvelle Vercel Function dans `api/`
- ✅ Changement de dépendance majeure (nouveau framework, lib)
- ✅ Réorganisation de dossiers
- ✅ Nouveau canal de notification
- ✅ Nouvelle intégration tierce (Google, Stripe, etc.)

Mettre à jour la date en tête de fichier à chaque modification.
