# AUDIT CA-TECH MANAGER
*Rapport généré avant refonte — lecture seule, aucune modification effectuée*

---

## 1. ÉTAT ACTUEL

Le Manager est une application React (Vite + TypeScript + Tailwind) montée dans `/manager` sur le domaine CA-TECH (`basename="/manager"`). Elle est connectée à Supabase pour la persistence des données et à plusieurs API externes (Google, Apify, Stripe).

**Statistiques globales**

| Indicateur | Valeur |
|---|---|
| Pages / routes | 35 pages, 37 routes |
| Hooks personnalisés | 29 |
| Composants UI | 9 |
| Tables Supabase utilisées | 31 identifiées |
| Edge Functions Supabase | 2 (`loic-chat`, `google-oauth`) |
| Dépendances npm | 14 production, 10 dev |
| Build | ✅ 3.7s — aucune erreur TypeScript |
| Lint | 10 erreurs (pré-existantes), 88 warnings |

---

## 2. ARCHITECTURE ACTUELLE

```
manager/
├── src/
│   ├── App.tsx                    # Router principal (BrowserRouter, basename="/manager")
│   ├── main.tsx                   # Entry point React 19
│   ├── index.css                  # Tailwind base
│   ├── contexts/
│   │   └── AuthContext.tsx        # Session Supabase + signOut
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx        # Nav complète + sous-menus Prospection/Catalogue
│   │   │   └── Breadcrumbs.tsx
│   │   ├── ui/                    # 9 composants UI (Button, Card, Badge…)
│   │   └── prospection/           # 4 panneaux d'analyse IA (utilisés dans ProspectionProspects)
│   ├── pages/
│   │   ├── [15 pages principales] # Dashboard, Clients, Leads, Devis, Factures…
│   │   ├── prospection/           # 13 sous-pages (module complet B2B outreach)
│   │   └── catalogue/             # 4 sous-pages (CMS catalogue services/collaborateurs)
│   ├── hooks/                     # 29 hooks React Query (data layer complète)
│   ├── lib/
│   │   ├── supabase.ts            # Client Supabase
│   │   ├── googleOAuth.ts         # Construction URL OAuth + helpers scopes
│   │   ├── auto-analyse.ts        # Analyse IA prospects via Edge Function
│   │   ├── auto-draft.ts          # Génération emails IA (appelé par auto-analyse)
│   │   ├── scoreCommercial.ts     # Scoring prospects
│   │   ├── prospect-importer.ts   # Import masse prospects Supabase
│   │   └── utils.ts               # formatCurrency, formatDate, cn…
│   ├── connectors/                # Système de connecteurs B2B (Apify, Google, LinkedIn…)
│   │   ├── index.ts
│   │   ├── registry.ts
│   │   ├── manager.ts
│   │   ├── types.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── connectors/            # 7 connecteurs individuels
│   └── types/
│       └── index.ts               # Types TypeScript centraux
└── package.json
```

**Stack technique**

| Couche | Technologie |
|---|---|
| UI Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Router | react-router-dom 7 |
| Data fetching | @tanstack/react-query 5 |
| Backend / DB | Supabase (PostgreSQL + Auth + Edge Functions) |
| Styles | Tailwind CSS 3 |
| Composants | Radix UI (Dialog, Dropdown, Select, Tabs, Tooltip…) |
| Charts | Recharts 3 |
| PDF | html2canvas + jsPDF |
| Icons | Lucide React |
| Dates | date-fns 4 |

---

## 3. PAGES EXISTANTES

### Pages principales (routes `/`)

| Route | Page | Fonctionnalité |
|---|---|---|
| `/` | Dashboard | Vue d'ensemble avec 8 sources de données (clients, devis, factures, paiements, projets, leads, messages, tickets) + graphiques Recharts |
| `/clients` | Clients | CRUD complet, fiche client avec onglets (infos, devis, factures, projets, documents, messages) |
| `/leads` | Leads | Pipeline kanban + liste, CRUD, conversion lead→client |
| `/devis` | Devis | CRUD, PDF (html2canvas+jsPDF), envoi Gmail, signature, conversion devis→facture |
| `/factures` | Factures | CRUD, PDF, envoi Gmail, lien Stripe payment, enregistrement paiements |
| `/projets` | Projets | CRUD, vues kanban/liste/timeline, tâches liées |
| `/taches` | Tâches | CRUD, filtres, priorités, lien projets |
| `/services` | Services | CRUD catalogue services internes CA-TECH |
| `/paiements` | Paiements | Historique paiements, graphique Recharts, méthodes multiples (virement/carte/stripe/chèque/espèces) |
| `/portfolio` | Portfolio | CRUD réalisations, upload images, toggle featured/publié |
| `/agenda` | Agenda | CRUD rendez-vous, vue calendrier + liste |
| `/documents` | Documents | Upload/download documents Supabase Storage |
| `/loic` | Loïc IA | Chat IA via Supabase Edge Function `loic-chat` + historique conversations |
| `/notifications` | Notifications | Centre de notifications + paramètres canaux |
| `/messages` | Messages | Boîte de réception formulaire contact, réponse Gmail, conversion → lead |
| `/support` | Support | Tickets support, fil messages par ticket |
| `/integrations` | Intégrations | Tableau de bord connexions Google (Gmail/Calendar/Drive/Sheets) + Apify |
| `/parametres` | Paramètres | Profil, agence, facturation, notifications, apparence, sécurité, Google OAuth |
| `/login` | Login | Authentification Supabase email+password |
| `/forgot-password` | ForgotPassword | Reset password Supabase |
| `/reset-password` | ResetPassword | Nouveau mot de passe |
| `/auth/google/callback` | GoogleOAuthCallback | Récepteur popup OAuth Google |

### Module Prospection IA (routes `/prospection/*`)

| Route | Page | Fonctionnalité |
|---|---|---|
| `/prospection` | ProspectionCommercialDashboard | Dashboard global B2B : funnel, emails, campagnes, activités |
| `/prospection/ia` | ProspectionDashboard | Tableau IA : scores, analyses, recommandations |
| `/prospection/prospects` | ProspectionProspects | Liste + fiche prospect (contact, activités, emails, scoring, agenda, Drive) |
| `/prospection/pipeline` | ProspectionPipeline | Vue kanban par status |
| `/prospection/recherche` | ProspectionRecherche | Recherche + import via Apify |
| `/prospection/qualification` | ProspectionQualification | Qualification IA en masse |
| `/prospection/brouillons` | ProspectionBrouillons | Emails générés par IA |
| `/prospection/campagnes` | ProspectionCampagnes | Campagnes emailing multi-étapes |
| `/prospection/relances` | ProspectionRelances | Suivi relances automatiques |
| `/prospection/statistiques` | ProspectionStatistiques | Analytics campagnes |
| `/prospection/connecteurs` | ProspectionConnecteurs | Configuration connecteurs (Apify, Google Maps, LinkedIn, CSV, Excel) |
| `/prospection/config` | ProspectionParametres | Paramètres Google Sheets sync |
| `/prospection/prospects/:id` | ProspectionProspectDetail | Fiche prospect complète |

### Module Catalogue (routes `/catalogue/*`)

| Route | Page | Fonctionnalité |
|---|---|---|
| `/catalogue/services` | CatalogueServices | CRUD services site CA-TECH (synchronisé avec le site public) |
| `/catalogue/services/new` | CatalogueServiceForm | Formulaire création |
| `/catalogue/services/:id/edit` | CatalogueServiceForm | Formulaire édition |
| `/catalogue/collaborateurs` | CatalogueCollaborateurs | CRUD collaborateurs IA pour le site CA-TECH |
| `/catalogue/collaborateurs/new` | CatalogueCollaborateurForm | Formulaire création |
| `/catalogue/collaborateurs/:id/edit` | CatalogueCollaborateurForm | Formulaire édition |

---

## 4. FONCTIONNALITÉS EXISTANTES

### 4.1 CRM de base
- Gestion clients (CRUD + fiche complète)
- Pipeline leads (kanban 7 colonnes : nouveau → gagné/perdu)
- Conversion lead → client

### 4.2 Facturation
- Devis (création, envoi PDF/Gmail, signature, conversion → facture)
- Factures (création, envoi PDF/Gmail, lien Stripe payment, enregistrement paiements)
- Paiements (historique, méthodes multiples, graphique mensuel)

### 4.3 Gestion de projets
- Projets (kanban, liste, timeline, progression)
- Tâches (priorités, statuts, deadlines)
- Documents liés aux projets/clients (Supabase Storage)

### 4.4 Communication
- Messages : boîte de réception du formulaire de contact CA-TECH
- Réponse directe via Gmail (Edge Function Supabase)
- Conversion message → lead ou ticket

### 4.5 Support
- Tickets support avec fils de messages
- Statuts (ouvert, en cours, résolu, fermé) + priorités

### 4.6 Loïc IA
- Chat IA (Supabase Edge Function `loic-chat`)
- Historique conversations en base (`ai_conversations`)
- Création automatique de leads depuis les conversations
- Pièces jointes uploadées dans Supabase Storage
- Actions structurées (propose_appointment, escalate)
- Onglet dashboard intégré

### 4.7 Google Workspace
- OAuth 2.0 complet (popup → callback → Edge Function `google-oauth`)
- Scopes : Gmail (send+readonly), Calendar, Drive (file), Sheets
- Connexion unique stockée dans `google_integrations`
- Utilisations : envoi emails Gmail (devis/factures), création dossiers Drive (prospects), sync Sheets (prospects)

### 4.8 Module Prospection IA (complexe)
- Scraping prospects via Apify (Google Maps, LinkedIn, CSV, Excel, X)
- Analyse IA automatique des prospects
- Scoring commercial calculé (scoreCommercial)
- Génération emails IA (auto-draft)
- Campagnes multi-étapes
- Qualification IA en masse
- Relances automatiques
- Sync Google Sheets bidirectionnelle
- 13 sous-pages dédiées

### 4.9 Catalogue (CMS)
- Gestion services CA-TECH (affiché sur le site public)
- Gestion collaborateurs IA (affiché sur le site public)

### 4.10 Portfolio
- Réalisations CA-TECH avec images, technologies, résultats
- Toggle featured/publié

### 4.11 Agenda
- Rendez-vous (RDV, appels, démos, deadlines, rappels)
- Lien clients/leads/projets
- Vue calendrier + liste

### 4.12 Intégrations (tableau de bord)
- Statut en temps réel des connexions Google
- Test de connexion pour chaque service
- Auto-fix
- Run Apify depuis l'interface
- Logs d'intégration

### 4.13 Paramètres
- Profil utilisateur (stocké localStorage `catech_settings`)
- Paramètres agence (stocké localStorage)
- Paramètres facturation — préfixes, TVA, IBAN (stocké localStorage)
- Notifications settings (stocké Supabase `notification_settings`)
- Google OAuth connection/disconnection

---

## 5. TABLES SUPABASE

### Tables core (CRM / Facturation)

| Table | Usage | Hook |
|---|---|---|
| `clients` | Clients CA-TECH | `useClients` |
| `leads` | Pipeline commercial + demandes Loïc | `useLeads` |
| `devis` | Devis | `useDevis` |
| `devis_items` / `quote_items` | Lignes de devis | via useDevis |
| `invoices` | Factures | `useFactures` |
| `invoice_items` | Lignes de factures | via useFactures |
| `payments` | Paiements | `usePaiements` |
| `services` | Catalogue services internes | `useServices` |
| `projects` | Projets | `useProjets` |
| `project_tasks` | Tâches | `useTaches` |
| `messages` | Formulaire contact CA-TECH | `useMessages` |
| `tickets` | Support | `useTickets` |
| `ticket_messages` | Fils discussions tickets | via useTickets |
| `documents` | Fichiers Supabase Storage | `useDocuments` |
| `appointments` | Agenda | `useAgenda` |
| `portfolio_projects` | Réalisations | `usePortfolio` |
| `notifications` | Centre notifications | `useInAppNotifications` |
| `notification_settings` | Préférences notifications | `useNotifications` |

### Tables Google / Auth

| Table | Usage | Hook |
|---|---|---|
| `google_integrations` | Token Google OAuth CA-TECH | `useGoogleIntegration` |

### Tables Prospection IA

| Table | Usage | Hook |
|---|---|---|
| `prospects` | Prospects B2B | `useProspects` |
| `prospect_activities` | Journal activités prospect | via useProspects |
| `prospect_campaigns` | Lien prospect ↔ campagne | via useProspects |
| `campaigns` | Campagnes emailing | `useCampagnes` |
| `campaign_steps` | Étapes d'une campagne | via useCampagnes |
| `email_drafts` | Emails générés par IA | `useEmailDrafts` |

### Tables Loïc IA

| Table | Usage | Hook |
|---|---|---|
| `ai_conversations` | Historique conversations Loïc | `useLoic` |

### Tables Catalogue

| Table | Usage | Hook |
|---|---|---|
| `catalogue_services` | Services CA-TECH (site public) | `useCatalogueServices` |
| `catalogue_collaborateurs` | Collaborateurs IA (site public) | `useCatalogueCollaborateurs` |

**Total : 31 tables identifiées. Aucune n'a été modifiée ou supprimée.**

---

## 6. AUTHENTIFICATION

### Système actuel
- **Provider** : Supabase Auth (email + password)
- **Context** : `AuthContext.tsx` — expose `user`, `session`, `loading`, `signOut`
- **Guard** : `ProtectedRoute.tsx` — redirige vers `/login` si pas de session
- **Session** : gérée par `supabase.auth.getSession()` + `onAuthStateChange()`
- **Reset password** : pages `ForgotPassword` + `ResetPassword` via Supabase
- **Rôles** : type `User` définit `role: 'admin' | 'manager' | 'user'` mais **non appliqué dans le code** — aucune vérification de rôle dans les pages ou les guards

### Points d'attention
- ⚠️ Les rôles sont typés mais **jamais vérifiés** : tout utilisateur authentifié accède à toutes les routes
- ⚠️ Le profil utilisateur (nom, prénom, téléphone) est stocké en **localStorage** (`catech_settings`), pas en Supabase
- Le Manager est mono-utilisateur en pratique (outil interne CA-TECH)

---

## 7. PAIEMENTS

### Infrastructure Stripe actuelle
Stripe est référencé mais **non intégré directement côté frontend**. L'intégration est partielle :

| Fonctionnalité | État |
|---|---|
| Lien Stripe payment dans les factures (`stripe_payment_link`) | ✅ Champ en base + interface |
| Copier/afficher le lien Stripe | ✅ Dans Factures.tsx |
| ID paiement Stripe (`stripe_payment_id`) | ✅ Champ en base + interface |
| SDK Stripe côté frontend | ❌ Absent — pas de `@stripe/stripe-js` |
| Création de lien Stripe via API | ❌ Absent — le lien est saisi manuellement |
| Webhook Stripe | ❌ Absent dans le frontend (peut exister côté Edge Function non listé) |
| Abonnements Stripe | ❌ Absent |

### Conclusion
La gestion Stripe actuelle est **manuelle** : l'utilisateur crée le lien de paiement dans le dashboard Stripe, le copie, et le colle dans la facture. Il n'y a pas de création automatique de lien ou de session Stripe depuis le Manager.

---

## 8. GOOGLE WORKSPACE

### Architecture OAuth

```
Utilisateur clique "Connecter Google"
  → useGoogleIntegration.connect()
  → Popup window → accounts.google.com/o/oauth2/v2/auth
  → Callback : /manager/auth/google/callback (GoogleOAuthCallback.tsx)
  → postMessage vers la fenêtre parent
  → useGoogleIntegration reçoit le code
  → POST → Supabase Edge Function `google-oauth`
  → Tokens stockés dans table `google_integrations`
```

### Scopes demandés (depuis `lib/googleOAuth.ts`)

| Scope | Service |
|---|---|
| `userinfo.email` + `userinfo.profile` | Identification |
| `gmail.send` + `gmail.readonly` | Envoi/lecture emails |
| `calendar` | Agenda Google |
| `drive.file` | Création dossiers Drive |
| `spreadsheets` | Lecture/écriture Sheets |

### Utilisations concrètes

| Fonctionnalité | Fichier |
|---|---|
| Envoi devis/factures par Gmail | `useGmailSend` → Edge Function `send-gmail` (implicite) |
| Création dossier Drive par prospect | `useGoogleDrive` → `drive.file` scope |
| Sync prospects ↔ Google Sheets | `useSheetsSync` → `spreadsheets` scope |
| Connexion/déconnexion UI | `Parametres.tsx` + `Integrations.tsx` |

### Point clé
Il n'y a qu'**une seule connexion Google** pour l'ensemble du Manager (celle de CA-TECH en tant qu'agence). Il n'existe pas de système de connexion Google **par client**.

---

## 9. LOÏC IA

### Fonctionnement

```
Manager → supabase.functions.invoke('loic-chat')
         → Edge Function Supabase (non visible dans ce repo)
         → Réponse + action structurée (JSON)
         → Sauvegarde messages dans ai_conversations
```

### Capacités actuelles (inférées du code)

| Capacité | Implémentation |
|---|---|
| Conversation multi-tours | `messages: LoicMessage[]` en JSONB dans ai_conversations |
| Création de lead automatique | Action `lead_created` dans metadata → `useCreateLead()` |
| Transmission à l'équipe (escalade) | Action `escalate` dans metadata |
| Proposition RDV | Action `propose_appointment` → lien `/agenda` |
| Pièces jointes | Upload Supabase Storage + contexte dans le message |
| Historique conversations | Table `ai_conversations` + realtime subscription |
| Onglet dashboard | Statistiques conversations (tabs chat/dashboard) |
| Contexte de conversation | `metadata` : prenom, nom, email, telephone, entreprise, projet, budget |
| Types de conversation | `qualification`, `devis`, `support`, `crm`, `agenda`, `general` |

### Tables liées
- `ai_conversations` (messages JSON, metadata, lead_id, client_id)
- Supabase Storage (pièces jointes)

---

## 10. FICHIERS INUTILISÉS OU SUSPECTS

### Fichiers supprimés lors du nettoyage précédent (Sprint 0)
- `src/assets/hero.png`, `react.svg`, `vite.svg` — assets Vite par défaut
- `src/App.css` — CSS jamais importé
- `src/services/mailProvider.ts` — stub `null`, jamais importé
- `src/components/ui/StatCard.tsx` — composant défini, jamais utilisé

### Fichiers suspects restants

| Fichier | Observation |
|---|---|
| `src/pages/prospection/ApifyPanel.tsx` | Page dans `pages/` mais sans route directe — utilisée comme composant dans `ProspectionConnecteurs` |
| `src/connectors/connectors/apify-actors.ts` | Liste d'acteurs Apify curés — utilisé uniquement par ApifyPanel |
| `src/lib/auto-draft.ts` | Génération emails IA — utilisé uniquement via `auto-analyse.ts` |
| `src/lib/scoreCommercial.ts` | Scoring prospects — spécifique au module Prospection |
| `src/lib/prospect-importer.ts` | Import masse — utilisé uniquement par ApifyPanel |

Ces fichiers sont **tous utilisés transitivement** par le module Prospection. Ils ne sont pas orphelins mais seront à supprimer si le module Prospection est éliminé.

### Paramètres stockés en localStorage (risque de perte)

La page `Parametres.tsx` stocke les données suivantes en localStorage via la clé `catech_settings` :
- Profil utilisateur (prénom, nom, email, téléphone, poste)
- Paramètres agence (nom, email, téléphone, adresse, SIRET, TVA intra)
- Paramètres facturation (préfixes, TVA par défaut, délai paiement, IBAN, BIC)
- Apparence (langue, format date, fuseau, monnaie)

⚠️ Ces données ne sont **pas en Supabase** et seront perdues si le localStorage est vidé ou si l'utilisateur change de navigateur.

---

## 11. DOUBLONS

### Doublon `devis_items` vs `quote_items`
La table est référencée sous deux noms dans le code (`devis_items` et `quote_items`) dans `useDevis.ts` ligne 35 :
```ts
lignes: (row.devis_items ?? row.quote_items ?? [])
```
Même chose pour `devis_number` vs `quote_number`. Indique une migration de schéma partielle ou une double table.

### Doublon Dashboard
Le Dashboard principal (`/`) et le `ProspectionCommercialDashboard` (`/prospection`) font tous les deux des tableaux de bord avec métriques et graphiques. À terme, un seul Dashboard simplifié suffira.

### Doublon ProspectionDashboard vs ProspectionCommercialDashboard
`/prospection` (CommercialDashboard) et `/prospection/ia` (ProspectionDashboard) sont deux dashboards distincts pour le même module.

### Doublon `useMessages` + `useGmailSend`
Les messages entrants (formulaire contact) sont dans la table `messages` via `useMessages`. L'envoi de réponses passe par `useGmailSend` qui appelle une Edge Function. Les deux coexistent mais représentent des flows différents (entrant vs sortant).

### Icônes dupliquées dans Sidebar
`BookOpen` apparaît importé mais l'icône `Bot` est utilisée deux fois (Loïc IA + Collaborateurs IA).

---

## 12. FONCTIONNALITÉS À CONSERVER

Ces éléments correspondent aux besoins du futur Manager et doivent être préservés :

| Fonctionnalité | Fichiers / Tables concernés |
|---|---|
| **Messages / Formulaire contact** | `pages/Messages.tsx`, `hooks/useMessages.ts`, table `messages` |
| **Leads / Demandes de devis** | `pages/Leads.tsx`, `hooks/useLeads.ts`, table `leads` |
| **Devis** | `pages/Devis.tsx`, `hooks/useDevis.ts`, tables `devis`, `devis_items` |
| **Factures** | `pages/Factures.tsx`, `hooks/useFactures.ts`, tables `invoices`, `invoice_items` |
| **Paiements** | `pages/Paiements.tsx`, `hooks/usePaiements.ts`, table `payments` |
| **Clients** | `pages/Clients.tsx`, `hooks/useClients.ts`, table `clients` |
| **Loïc IA** | `pages/Loic.tsx`, `hooks/useLoic.ts`, table `ai_conversations`, Edge Function `loic-chat` |
| **Google OAuth** | `lib/googleOAuth.ts`, `hooks/useGoogleIntegration.ts`, `pages/GoogleOAuthCallback.tsx`, table `google_integrations`, Edge Function `google-oauth` |
| **Authentification** | `contexts/AuthContext.tsx`, `components/auth/ProtectedRoute.tsx`, `pages/Login.tsx`, `pages/ForgotPassword.tsx`, `pages/ResetPassword.tsx` |
| **Envoi Gmail** | `hooks/useGmailSend.ts` (utilisé pour devis/factures) |
| **Intégrations (partiel)** | `pages/Integrations.tsx` — conserver la gestion Google uniquement |
| **Paramètres (partiel)** | `pages/Parametres.tsx` — conserver profil, agence, facturation, Google |
| **Layout / UI** | `components/layout/*`, `components/ui/*` (tous les 9 composants) |
| **Documents** | `hooks/useDocuments.ts` (utilisé par Devis, Loïc) |

---

## 13. FONCTIONNALITÉS À SUPPRIMER

Ces éléments ne correspondent pas aux besoins du futur Manager. Ils peuvent être supprimés lors du refactoring :

### Priorité haute (superflu total)

| Fonctionnalité | Fichiers | Tables |
|---|---|---|
| **Module Prospection IA complet** | 13 pages + 4 composants panneau + 7 hooks (useProspects, useEmailDrafts, useCampagnes, useAudit, useRecommendations, useApify, useSheetsSync, useCalendarEvents, useGoogleDrive, useDashboardRealtime) + 3 lib (auto-analyse, auto-draft, scoreCommercial, prospect-importer) + 10 connecteurs | `prospects`, `prospect_activities`, `prospect_campaigns`, `campaigns`, `campaign_steps`, `email_drafts` |
| **Portfolio** | `pages/Portfolio.tsx`, `hooks/usePortfolio.ts` | `portfolio_projects` |
| **Agenda** | `pages/Agenda.tsx`, `hooks/useAgenda.ts`, `hooks/useCalendarEvents.ts` (déjà dans Prospection) | `appointments` |
| **Support / Tickets** | `pages/Support.tsx`, `hooks/useTickets.ts` | `tickets`, `ticket_messages` |
| **Tâches** | `pages/Taches.tsx`, `hooks/useTaches.ts` | `project_tasks` |
| **Projets** | `pages/Projets.tsx`, `hooks/useProjets.ts` | `projects` |
| **Services** (catalogue interne) | `pages/Services.tsx`, `hooks/useServices.ts` | `services` |
| **Module Catalogue** | 4 pages catalogue + `hooks/useCatalogueServices.ts` + `hooks/useCatalogueCollaborateurs.ts` | `catalogue_services`, `catalogue_collaborateurs` |
| **Connecteurs B2B** | `connectors/` (9 fichiers) — Apify, Google Maps, LinkedIn, X, Sheets, CSV, Excel | — |

### Priorité moyenne (à simplifier / migrer)

| Fonctionnalité | Observation |
|---|---|
| **Dashboard actuel** | Trop complexe — à remplacer par un dashboard simple (KPIs essentiels uniquement) |
| **Notifications** | `pages/Notifications.tsx` + `hooks/useNotifications.ts` + `hooks/useInAppNotifications.ts` — peut être conservé sous forme simplifiée |
| **Paramètres localStorage** | Migrer vers Supabase (profil, agence, facturation) |
| **Apify (Integrations.tsx)** | Retirer la section Apify de la page Intégrations |

---

## 14. RISQUES TECHNIQUES

### Risque 1 — Tables Prospection en production
⚠️ Les tables `prospects`, `prospect_activities`, `campaigns`, `campaign_steps`, `email_drafts`, `prospect_campaigns` contiennent potentiellement des données réelles de prospection. **Ne pas les supprimer sans validation préalable.**

### Risque 2 — Edge Functions non visibles
Les Supabase Edge Functions (`loic-chat`, `google-oauth`, `send-gmail` implicite) ne sont **pas dans ce dépôt**. Leur configuration, secrets et comportement sont gérés côté Supabase. Tout changement de schéma ou de payload doit être coordonné avec les Edge Functions.

### Risque 3 — Paramètres en localStorage
Les paramètres agence et facturation (IBAN, BIC, préfixes, TVA) sont en localStorage. Ils sont utilisés dans les PDF de devis et factures. Si le localStorage est vidé, les PDF générés seront incomplets.

### Risque 4 — Double nommage tables devis
`devis_items` vs `quote_items` dans `useDevis.ts` — vérifier quelle table existe réellement en Supabase avant de faire des migrations.

### Risque 5 — Lint errors pré-existantes
10 erreurs lint dont `Cannot create components during render` et `setState in useMemo` dans `ProspectionProspects.tsx` — fichier à réécrire de toute façon mais ne pas laisser ces patterns se propager dans le nouveau code.

### Risque 6 — `recharts` et `vendor-pdf` bundle size
`vendor-pdf` fait 601KB gzippé (html2canvas + jsPDF). Ces libs ne seront plus nécessaires si le PDF est géré côté serveur dans la nouvelle version.

### Risque 7 — Abonnement Prospection non implémenté
Le futur Manager doit gérer "l'envoi de liens d'abonnement Prospection" mais **aucune infrastructure pour cela n'existe** dans le code actuel. C'est un nouveau développement à prévoir intégralement.

---

## 15. RECOMMANDATIONS POUR LA NOUVELLE ARCHITECTURE

### Vision

Le nouveau Manager doit être **radical dans sa simplicité** : un outil opérationnel, pas un ERP. Les 8 besoins métiers identifiés correspondent à 5-6 pages maximum.

### Structure recommandée

```
Pages à créer / conserver
├── Dashboard simplifié       → KPIs : demandes en attente, devis en cours, paiements reçus
├── Messages / Demandes       → Formulaire contact + pipeline simple leads/devis
├── Devis & Factures          → Fusionner en une seule page ou vue tabsée
├── Paiements                 → Lien Stripe comptant + lien abonnement + vérification
├── Clients                   → Liste + fiche simplifiée
├── Loïc IA                   → Page chat dédiée (à conserver telle quelle)
├── Google Workspace          → Connexion + services disponibles par client
└── Paramètres                → Profil, agence, facturation (migrer localStorage → Supabase)
```

### Ce qui doit être repris tel quel
- Système d'authentification Supabase
- `lib/googleOAuth.ts` + `hooks/useGoogleIntegration.ts` + `GoogleOAuthCallback.tsx`
- `hooks/useLoic.ts` + `pages/Loic.tsx` (peut être conservé presque tel quel)
- `hooks/useMessages.ts`
- `hooks/useGmailSend.ts`
- `contexts/AuthContext.tsx`
- `components/auth/ProtectedRoute.tsx`
- `components/ui/*` (tous)
- `lib/supabase.ts`, `lib/utils.ts`

### Ce qui doit être reconstruit
- Dashboard (nouvelle logique, KPIs métier futurs)
- Paiements (ajouter gestion liens Stripe comptant + abonnements via API Stripe)
- Paramètres (migrer localStorage → Supabase)

### Nouvelle fonctionnalité à créer
- **Liens d'abonnement Prospection** : intégration Stripe Subscriptions ou Payment Links — nécessite un `price_id` Stripe et une logique de création de session

### Dépendances à supprimer lors du refactoring
Si le module Prospection et les pages associées sont supprimés :
- `recharts` (si Dashboard simplifié sans graphiques complexes)
- `html2canvas` + `jspdf` (si PDF délégué à une Edge Function)
- `@radix-ui/react-tabs` (si les pages n'utilisent plus de tabs)
- Connecteurs Apify/LinkedIn/X/CSV/Excel/Maps

### Dépendances à conserver
- `@supabase/supabase-js`, `@tanstack/react-query`, `react-router-dom`, `lucide-react`, `date-fns`, `tailwind-merge`, `clsx`, `class-variance-authority`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`

---

*AUDIT TERMINÉ — AUCUNE MODIFICATION EFFECTUÉE*
