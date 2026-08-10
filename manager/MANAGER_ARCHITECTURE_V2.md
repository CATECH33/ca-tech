# MANAGER CA-TECH — ARCHITECTURE V2
*Document de référence architecture — aucune modification de code*

---

## 1. ARCHITECTURE GLOBALE

### Principe directeur

Le nouveau Manager est un **centre opérationnel**, pas un ERP.
7 modules. Une navigation. Des actions immédiates.

```
CA-TECH Manager V2
│
├── Dashboard             → Vue synthétique temps réel
├── Contacts & Demandes   → Formulaire + leads + devis entrants
├── Devis                 → Création, suivi, envoi, conversion
├── Paiements             → Liens Stripe comptant + abonnements Prospection
├── Clients               → Fiches complètes + Google Workspace
├── Loïc                  → Centre de contrôle IA
└── Paramètres            → Profil, agence, facturation (migrés Supabase)
```

### Ce qui change radicalement

| Avant (V1) | Après (V2) |
|---|---|
| 35 pages, 37 routes | **8 pages principales**, ~15 routes |
| Sidebar avec 20+ items | **7 items nav** fixes |
| Module Prospection 13 pages | Supprimé |
| Projets / Tâches / Support | Supprimés |
| Portfolio / Catalogue / Agenda | Supprimés |
| Messages isolé + Leads isolé | **Fusionnés → Contacts & Demandes** |
| Factures page dédiée | **Intégré dans Paiements + fiche Client** |
| Google = 1 connexion interne | **Google par client + 1 connexion CA-TECH** |
| Paramètres localStorage | **Paramètres Supabase** |

---

## 2. NAVIGATION PRINCIPALE

### Sidebar V2 — 7 items, aucun sous-menu

```
┌─────────────────────┐
│  ⚡ CA-TECH Manager │
├─────────────────────┤
│  ⊞  Dashboard       │  /
│  💬 Contacts        │  /contacts
│  📄 Devis           │  /devis
│  💳 Paiements       │  /paiements
│  👥 Clients         │  /clients
│  🤖 Loïc            │  /loic
│                     │
│  ─────────────────  │
│  ⚙️  Paramètres      │  /parametres
└─────────────────────┘
```

### Règles de navigation

- Aucun sous-menu dans la sidebar principale
- La sidebar peut se réduire (mode icônes) — comportement conservé
- Le bouton Google Workspace est accessible **depuis la fiche Client** et depuis **Paramètres**
- Les notifications (cloche) restent dans le Header, pas dans la nav

---

## 3. PAGES NÉCESSAIRES

### 3.1 Dashboard `/`
Page unique. Aucune sous-route.

### 3.2 Contacts & Demandes `/contacts`
```
/contacts              → Liste tous les contacts / demandes
/contacts/:id          → Fiche contact individuelle
```

### 3.3 Devis `/devis`
```
/devis                 → Liste des devis
/devis/new             → Créer un devis
/devis/:id             → Voir / éditer un devis
```

### 3.4 Paiements `/paiements`
```
/paiements             → Hub paiements (comptant + abonnements)
/paiements/nouveau     → Créer un lien de paiement ou abonnement
/paiements/:id         → Détail d'un paiement / statut
```

### 3.5 Clients `/clients`
```
/clients               → Liste des clients
/clients/:id           → Fiche client complète (avec onglets)
```

### 3.6 Loïc `/loic`
Page unique avec deux vues intégrées (chat / dashboard). Aucune sous-route.

### 3.7 Paramètres `/parametres`
Page unique avec onglets (profil, agence, facturation, Google CA-TECH, sécurité).

### 3.8 Auth (inchangées)
```
/login
/forgot-password
/reset-password
/auth/google/callback
```

**Total : 8 pages, ~15 routes** (vs 35 pages, 37 routes en V1)

---

## 4. PAGES À SUPPRIMER

Ces pages et leurs routes sont à éliminer dans le Sprint 2 :

| Page V1 | Route | Raison |
|---|---|---|
| Leads | `/leads` | Fusionné → Contacts & Demandes |
| Messages | `/messages` | Fusionné → Contacts & Demandes |
| Factures | `/factures` | Simplifié → Paiements + fiche Client |
| Projets | `/projets` | Hors périmètre |
| Tâches | `/taches` | Hors périmètre |
| Services | `/services` | Hors périmètre |
| Portfolio | `/portfolio` | Hors périmètre |
| Agenda | `/agenda` | Hors périmètre |
| Support | `/support` | Hors périmètre |
| Documents | `/documents` | Intégré dans fiche Client |
| Notifications | `/notifications` | Simplifié → Header (cloche) |
| Intégrations | `/integrations` | Remplacé par Google dans Paramètres + fiche Client |
| ProspectionCommercialDashboard | `/prospection` | Module supprimé |
| ProspectionDashboard | `/prospection/ia` | Module supprimé |
| ProspectionProspects | `/prospection/prospects` | Module supprimé |
| ProspectionPipeline | `/prospection/pipeline` | Module supprimé |
| ProspectionRecherche | `/prospection/recherche` | Module supprimé |
| ProspectionQualification | `/prospection/qualification` | Module supprimé |
| ProspectionBrouillons | `/prospection/brouillons` | Module supprimé |
| ProspectionCampagnes | `/prospection/campagnes` | Module supprimé |
| ProspectionRelances | `/prospection/relances` | Module supprimé |
| ProspectionStatistiques | `/prospection/statistiques` | Module supprimé |
| ProspectionConnecteurs | `/prospection/connecteurs` | Module supprimé |
| ProspectionParametres | `/prospection/config` | Module supprimé |
| ProspectionProspectDetail | `/prospection/prospects/:id` | Module supprimé |
| CatalogueServices | `/catalogue/services` | Hors périmètre |
| CatalogueServiceForm | `/catalogue/services/new` | Hors périmètre |
| CatalogueServiceForm | `/catalogue/services/:id/edit` | Hors périmètre |
| CatalogueCollaborateurs | `/catalogue/collaborateurs` | Hors périmètre |
| CatalogueCollaborateurForm | `/catalogue/collaborateurs/new` | Hors périmètre |
| CatalogueCollaborateurForm | `/catalogue/collaborateurs/:id/edit` | Hors périmètre |

**Total : 31 routes supprimées**

---

## 5. PAGES À FUSIONNER

| Pages V1 | Page V2 | Logique de fusion |
|---|---|---|
| `Messages` + `Leads` | `Contacts & Demandes` | Un contact = une personne qui a écrit (formulaire) OU un lead créé manuellement OU une demande Loïc. Vue unifiée avec statut et historique. |
| `Factures` | dans `Paiements` | Les factures ne disparaissent pas de la base mais ne sont plus une page dédiée. Elles sont visibles dans la fiche paiement et dans la fiche client. |
| `Documents` | dans fiche `Client` | Upload/download de documents liés au client depuis sa fiche (onglet Documents). |
| `Intégrations Google` | `Paramètres` + fiche `Client` | La connexion Google CA-TECH va dans Paramètres. La connexion Google par client va dans la fiche Client. |
| `Notifications` | Header (cloche) | Les notifications in-app restent via la cloche dans le Header. La page `/notifications` est supprimée. |

---

## 6. MODULES CONSERVÉS

| Module | Fichiers clés à conserver | Modifications |
|---|---|---|
| **Auth** | `AuthContext.tsx`, `ProtectedRoute.tsx`, `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` | Aucune |
| **Google OAuth** | `lib/googleOAuth.ts`, `hooks/useGoogleIntegration.ts`, `GoogleOAuthCallback.tsx` | Étendre pour gestion par client |
| **Loïc** | `pages/Loic.tsx`, `hooks/useLoic.ts` | Légères améliorations UX |
| **Devis** | `pages/Devis.tsx`, `hooks/useDevis.ts` | Simplifier, retirer sections inutiles |
| **Clients** | `pages/Clients.tsx`, `hooks/useClients.ts` | Enrichir avec onglet Google |
| **Paiements** | `pages/Paiements.tsx`, `hooks/usePaiements.ts`, `hooks/useFactures.ts` | Recentrer sur liens Stripe |
| **Messages** | `hooks/useMessages.ts` | Fusionner dans Contacts |
| **Leads** | `hooks/useLeads.ts` | Fusionner dans Contacts |
| **Gmail** | `hooks/useGmailSend.ts` | Conserver pour envoi devis/factures/paiements |
| **Documents** | `hooks/useDocuments.ts` | Conserver, intégré dans fiche Client |
| **Layout UI** | `components/layout/*`, `components/ui/*` | Conserver tous, Sidebar à simplifier |
| **Lib** | `lib/supabase.ts`, `lib/utils.ts` | Inchangés |

---

## 7. MODULES SUPPRIMÉS

| Module | Fichiers | Tables à conserver (données) |
|---|---|---|
| **Prospection IA** | 13 pages, 4 composants panneaux, hooks useProspects/useEmailDrafts/useCampagnes/useAudit/useRecommendations/useApify/useSheetsSync/useCalendarEvents/useGoogleDrive/useDashboardRealtime, lib auto-analyse/auto-draft/scoreCommercial/prospect-importer, 10 connecteurs | `prospects`, `prospect_activities`, `prospect_campaigns`, `campaigns`, `campaign_steps`, `email_drafts` (conserver les données, supprimer le code) |
| **Portfolio** | `pages/Portfolio.tsx`, `hooks/usePortfolio.ts` | `portfolio_projects` (conserver) |
| **Agenda** | `pages/Agenda.tsx`, `hooks/useAgenda.ts` | `appointments` (conserver) |
| **Support** | `pages/Support.tsx`, `hooks/useTickets.ts` | `tickets`, `ticket_messages` (conserver) |
| **Projets** | `pages/Projets.tsx`, `hooks/useProjets.ts` | `projects` (conserver) |
| **Tâches** | `pages/Taches.tsx`, `hooks/useTaches.ts` | `project_tasks` (conserver) |
| **Services** | `pages/Services.tsx`, `hooks/useServices.ts` | `services` (conserver) |
| **Catalogue** | 4 pages catalogue, `hooks/useCatalogueServices.ts`, `hooks/useCatalogueCollaborateurs.ts` | `catalogue_services`, `catalogue_collaborateurs` (conserver) |
| **Intégrations** | `pages/Integrations.tsx`, `hooks/useIntegrations.ts`, `connectors/` | — |
| **Notifications page** | `pages/Notifications.tsx` | `notifications`, `notification_settings` (conserver) |

> **Règle** : les tables Supabase et leurs données ne sont **jamais supprimées** lors du refactoring du code. Seul le code frontend est supprimé.

---

## 8. FLUX CONTACT → DEVIS → PAIEMENT → CLIENT

```
ENTRÉES
────────────────────────────────────────────────────────────────
[Formulaire site CA-TECH]   →  table `messages`         ┐
[Loïc IA (conversation)]    →  table `ai_conversations` ┤ → Contacts & Demandes
[Saisie manuelle Manager]   →  table `leads`            ┘

ÉTAPE 1 — CONTACT CRÉÉ
────────────────────────────────────────────────────────────────
Vue unifiée /contacts
  - Source identifiée (formulaire / Loïc / manuel)
  - Informations prospect (nom, email, tel, entreprise, besoin)
  - Statut : nouveau → qualifié → devis demandé → gagné / perdu
  - Notes internes
  - Historique des échanges
  - Action : [Créer un devis] [Envoyer un email] [Passer en client]

ÉTAPE 2 — DEVIS
────────────────────────────────────────────────────────────────
/devis/new (pré-rempli depuis le contact)
  - Client ou prospect lié
  - Lignes (description, quantité, prix HT, TVA)
  - Total TTC calculé
  - Notes / conditions
  - Action : [Sauvegarder] [Envoyer par email] [Télécharger PDF]

Statuts devis : brouillon → envoyé → accepté / refusé / expiré

  Si ACCEPTÉ → action disponible : [Créer un paiement]

ÉTAPE 3 — PAIEMENT
────────────────────────────────────────────────────────────────
/paiements/nouveau (pré-rempli depuis le devis)
  
  TYPE A — Paiement comptant
    - Montant = total TTC du devis
    - Création d'un Stripe Payment Link (API Stripe)
    - Envoi du lien par Gmail au client
    - Suivi : en attente → payé / expiré / échoué

  TYPE B — Abonnement Prospection
    - Sélection du plan (mensuel / annuel)
    - Création d'une Stripe Subscription via Payment Link
    - Envoi du lien par Gmail au client
    - Suivi : en attente → actif → suspendu / résilié

ÉTAPE 4 — CLIENT
────────────────────────────────────────────────────────────────
Paiement confirmé (webhook Stripe ou vérification manuelle)
  → Si prospect → conversion automatique ou manuelle en Client
  → Fiche Client créée / mise à jour

  Fiche client contient :
    - Identité + coordonnées
    - Devis liés
    - Paiements / abonnements
    - Historique complet
    - Documents
    - Connexions Google Workspace
```

---

## 9. FLUX LOÏC

```
ENTRÉE CONVERSATION
────────────────────────────────────────────────────────────────
Prospect ouvre /loic sur le site public (ou Manager)
  → Conversation stockée dans `ai_conversations`
  → Loïc collecte : nom, email, tel, entreprise, besoin, budget

ACTIONS DÉTECTÉES PAR LOÏC
────────────────────────────────────────────────────────────────
  → lead_created    : Crée un lead dans `leads`
                      → Apparaît dans Contacts & Demandes
  → escalate        : Notifie l'équipe CA-TECH
  → propose_appointment : Génère un lien RDV
  → devis_prepared  : Prépare une proposition (future)

CENTRE DE CONTRÔLE LOÏC (Manager /loic)
────────────────────────────────────────────────────────────────
Vue CHAT
  ├── Liste des conversations (gauche)
  │     - Nom du prospect (si détecté) ou extrait du 1er message
  │     - Date + aperçu dernière réponse
  │     - Badge statut (active / completed / archived)
  └── Conversation active (droite)
        - Historique messages
        - Actions détectées (leads créés, escalades)
        - Pièces jointes

Vue DASHBOARD (onglet)
  ├── Conversations du jour / de la semaine
  ├── Leads créés par Loïc
  ├── Taux de qualification
  ├── Demandes en attente d'action
  └── Escalades non traitées

LIEN AVEC LES AUTRES MODULES
────────────────────────────────────────────────────────────────
  Lead créé par Loïc → visible dans Contacts & Demandes
  Devis demandé via Loïc → actionnable depuis Contacts
  Client identifié par Loïc → lien vers fiche Client
```

---

## 10. FLUX GOOGLE WORKSPACE

```
NIVEAU 1 — CONNEXION CA-TECH (interne)
────────────────────────────────────────────────────────────────
Paramètres → onglet Google
  - 1 connexion Google pour CA-TECH (compte agence)
  - Scopes : Gmail send/read, Calendar, Drive, Sheets
  - Utilisée pour : envoyer devis/factures par Gmail,
                    créer des dossiers Drive, sync Sheets
  - Stockée dans : table `google_integrations` (1 ligne)
  - Bouton : [Connecter Google] / [Déconnecter] / [Renouveler]

NIVEAU 2 — CONNEXIONS PAR CLIENT (nouveau)
────────────────────────────────────────────────────────────────
Fiche Client → onglet Google Workspace

  Pour chaque client, possibilité de lier son compte Google :
  ┌─────────────────────────────────────────────┐
  │  Google Workspace — Jean Dupont             │
  │  ● Gmail         jean@exemple.com  [Lié]    │
  │  ○ Google Drive                   [Lier]    │
  │  ○ Google Docs                    [Lier]    │
  │  ○ Google Sheets                  [Lier]    │
  │  ○ Google Calendar                [Lier]    │
  └─────────────────────────────────────────────┘

  - Permet d'agir au nom du client (drive, docs, sheets)
  - Stocké dans : nouvelle table `client_google_connections`
  - OAuth distinct par client (compte Google du client)
  - Bouton : [Inviter le client à connecter] ou [Connecter moi-même]

SCOPES GOOGLE PAR USAGE
────────────────────────────────────────────────────────────────
  Connexion CA-TECH :
    - gmail.send + gmail.readonly  → Envoi devis/factures/paiements
    - calendar                     → Prise de RDV (si besoin futur)
    - drive.file                   → Dossiers clients
    - spreadsheets                 → Synchronisations

  Connexion Client :
    - drive.file                   → Partage documents projet
    - docs                         → Édition collaborative
    - sheets                       → Tableaux de bord client
    - gmail.readonly               → Suivi communication (optionnel)

AFFICHAGE DANS MANAGER
────────────────────────────────────────────────────────────────
  Section Google dans fiche Client :
    - Compte connecté (email Google)
    - Services autorisés (chips colorés)
    - Date de connexion
    - Expiration du token (si applicable)
    - Boutons : [Reconnecter] [Révoquer l'accès]
```

---

## 11. ARCHITECTURE DES DONNÉES

### Tables conservées et leur rôle dans V2

```
TABLES ACTIVES V2
─────────────────────────────────────────────────────────────────

clients              → Fiche client (identité, coordonnées, entreprise)
leads                → Contacts & Demandes (prospects, demandes entrantes)
messages             → Demandes formulaire contact CA-TECH
devis                → Devis
devis_items          → Lignes de devis
invoices             → Factures (liées aux paiements)
invoice_items        → Lignes de factures
payments             → Paiements enregistrés
ai_conversations     → Conversations Loïc
google_integrations  → Connexion Google CA-TECH (1 ligne)
documents            → Documents clients (Supabase Storage)
notifications        → Notifications in-app
notification_settings → Préférences notifications

NOUVELLE TABLE À CRÉER
─────────────────────────────────────────────────────────────────

client_google_connections
  id               uuid PK
  client_id        uuid FK → clients.id
  google_email     text
  scope            text
  access_token     text (encrypted)
  refresh_token    text (encrypted)
  expires_at       timestamptz
  connected_at     timestamptz
  created_at       timestamptz

stripe_payment_links (optionnel — peut rester dans invoices)
  id               uuid PK
  client_id        uuid FK → clients.id
  devis_id         uuid FK → devis.id (nullable)
  type             enum ('comptant', 'abonnement')
  stripe_link_id   text
  stripe_link_url  text
  amount           numeric
  currency         text
  status           enum ('pending', 'paid', 'expired', 'cancelled')
  subscription_id  text (pour abonnements Stripe)
  plan             text ('mensuel', 'annuel')
  created_at       timestamptz
  paid_at          timestamptz

PARAMÈTRES — MIGRATION localStorage → Supabase
─────────────────────────────────────────────────────────────────

app_settings (nouvelle table ou colonne JSONB dans auth.users metadata)
  user_id          uuid FK → auth.users.id
  profil           jsonb  { prenom, nom, telephone, poste }
  agence           jsonb  { nom, email, telephone, siret, tva_intra, adresse… }
  facturation      jsonb  { prefixe_devis, prefixe_facture, tva, delai, iban, bic }
  apparence        jsonb  { langue, format_date, fuseau, monnaie }

TABLES CONSERVÉES (données uniquement, code supprimé)
─────────────────────────────────────────────────────────────────

prospects, prospect_activities, prospect_campaigns
campaigns, campaign_steps, email_drafts
appointments, portfolio_projects
projects, project_tasks
services, tickets, ticket_messages
catalogue_services, catalogue_collaborateurs
```

### Nouveau hook nécessaire

```typescript
// À créer en Sprint 2
useClientGoogleConnections(clientId)  → table client_google_connections
useStripePaymentLinks(clientId?)      → table stripe_payment_links
useAppSettings()                      → table app_settings (migration localStorage)
```

---

## 12. PERMISSIONS / RÔLES

### Situation actuelle
Les rôles (`admin | manager | user`) sont **typés mais non appliqués**. Le Manager est mono-utilisateur.

### Proposition V2 — 2 niveaux simples

| Rôle | Accès |
|---|---|
| **admin** | Tout — paramètres, paiements, clients, Loïc, Google |
| **viewer** | Lecture seule — contacts, devis, clients (sans paiements ni paramètres) |

**Implémentation recommandée :** simple vérification dans `ProtectedRoute` sur le champ `role` du user Supabase (via `user.user_metadata.role` ou table `profiles`).

Pour l'instant, **CA-TECH étant mono-utilisateur**, aucun système de rôles complexe n'est nécessaire. Prévoir l'extension mais ne pas over-engineer.

---

## 13. PROPOSITION DE DASHBOARD

### Structure visuelle

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ CA-TECH Manager          Lun 9 août 2026 · Bonjour Jean │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  KPIs PRINCIPAUX (ligne de 5 cards)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ ┌──────┐ │
│  │Nouveaux  │ │Devis en  │ │Paiements │ │Abon. │ │Clients│ │
│  │contacts  │ │attente   │ │ce mois   │ │actifs│ │actifs │ │
│  │   +3     │ │   5      │ │ 4 200 €  │ │  2   │ │  12  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────┘ └──────┘ │
│                                                             │
│  COLONNE GAUCHE (60%)          COLONNE DROITE (40%)        │
│  ┌─────────────────────────┐   ┌─────────────────────────┐ │
│  │ DEMANDES RÉCENTES        │   │ LOÏC — Activité récente │ │
│  │ (5 derniers contacts)    │   │ 3 conversations actives │ │
│  │ • Marie D. — formulaire  │   │ 2 leads créés auj.      │ │
│  │   "site vitrine" — 12h   │   │ 1 escalade en attente   │ │
│  │   [Créer devis] [Email]  │   │ [Voir les conversations] │ │
│  │                          │   └─────────────────────────┘ │
│  │ • Thomas B. — Loïc       │                               │
│  │   "automatisation CRM"   │   ┌─────────────────────────┐ │
│  │   [Voir la demande]      │   │ DEVIS EN ATTENTE         │ │
│  │                          │   │ DEV-2026-031 · Martin S. │ │
│  │ • Paul R. — Manuel       │   │ 3 400 € · envoyé 5j     │ │
│  │   [Voir]                 │   │ DEV-2026-029 · CRM SARL  │ │
│  └─────────────────────────┘   │ 1 200 € · envoyé 12j    │ │
│                                 └─────────────────────────┘ │
│  ┌─────────────────────────┐                               │
│  │ ALERTES                  │   ┌─────────────────────────┐ │
│  │ ⚠ 2 devis expirent dans │   │ PAIEMENTS EN ATTENTE    │ │
│  │   48h                    │   │ • Lien Stripe — 890 €   │ │
│  │ ⚠ 1 paiement en retard  │   │   Sophie M. — 3j        │ │
│  └─────────────────────────┘   │ • Abonnement — en attente│ │
│                                 │   Dupont SARL            │ │
│                                 └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### KPIs source de données

| KPI | Source |
|---|---|
| Nouveaux contacts | `messages` + `leads` (7 derniers jours) |
| Devis en attente | `devis` WHERE status = 'envoye' |
| Paiements ce mois | `payments` WHERE mois courant |
| Abonnements actifs | `stripe_payment_links` WHERE type = 'abonnement' AND status = 'actif' |
| Clients actifs | `clients` WHERE status = 'actif' |
| Activité Loïc | `ai_conversations` (24h) |
| Devis expirant | `devis` WHERE date_expiration < NOW() + 48h |
| Paiements en attente | `stripe_payment_links` WHERE status = 'pending' |

---

## 14. PRINCIPES UX

### 1. Orienté action
Chaque écran propose une **action principale évidente** : [Créer un devis], [Envoyer le lien], [Convertir en client]. Pas de pages informationnelles sans bouton d'action.

### 2. Navigation courte
Maximum **2 niveaux de profondeur** : liste → fiche. Jamais 3 niveaux.
Exemple : `/clients` → `/clients/:id` (onglet Google). Jamais `/clients/:id/google/connect`.

### 3. Données contextuelles
Dans la fiche Client : tout est là. Pas besoin de naviguer entre 5 pages pour voir les devis, paiements et connexions Google d'un client.

### 4. Statuts visuels clairs
Chaque entité affiche son statut avec un badge coloré immédiatement lisible :
- 🔵 Nouveau / En attente
- 🟡 En cours / Envoyé
- 🟢 Confirmé / Payé / Actif
- 🔴 Expiré / Refusé / Échoué

### 5. Actions en un clic
- Envoyer un devis par Gmail : **1 clic** depuis la fiche devis
- Créer un lien Stripe et l'envoyer : **2 clics** (montant → envoyer)
- Voir toutes les infos d'un client : **1 clic** depuis n'importe quelle liste

### 6. Sidebar réduite = mode terrain
L'utilisateur peut réduire la sidebar à 60px (icônes seules) pour gagner de l'espace en mode tablette ou petit écran. Comportement conservé de V1.

### 7. Design épuré
- Fond blanc, typographie grise, accents bleu `#0066FF` uniquement pour les actions
- Pas de graphiques complexes sur le Dashboard (sauf 1-2 KPI visuels simples)
- Cards légères, ombres subtiles
- Inspiration : Linear, Vercel Dashboard

### 8. Feedback immédiat
Toute action (envoi email, création lien Stripe, sauvegarde) affiche un **toast de confirmation ou d'erreur** immédiat. Pas de page de confirmation séparée.

### 9. Mobile-friendly (secondaire)
Le Manager est principalement desktop, mais la sidebar en mode mobile (hamburger + overlay) est conservée de V1.

### 10. Pas de données mortes
Aucune section affichant "0 éléments" de façon permanente. Si une section est vide, proposer une **action pour la remplir** (ex: "Aucun devis — [Créer le premier devis]").

---

## RÉSUMÉ DE LA TRANSFORMATION

| Dimension | V1 | V2 |
|---|---|---|
| Pages | 35 | **8** |
| Routes | 37 | **~15** |
| Hooks | 29 | **~14** |
| Tables actives | 31 | **14 actives + 2 nouvelles** |
| Items sidebar | 20+ | **7** |
| Modules | 8 modules complexes | **6 modules simples** |
| Paramètres | localStorage | **Supabase** |
| Google OAuth | 1 connexion interne | **1 CA-TECH + N par client** |
| Stripe | Liens manuels | **Création API automatique** |
| Complexité | ERP complet | **Outil opérationnel** |

---

*ARCHITECTURE V2 DÉFINIE — AUCUNE MODIFICATION DE CODE*
