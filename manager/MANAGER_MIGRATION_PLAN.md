# MANAGER CA-TECH — PLAN TECHNIQUE DE MIGRATION
*Sprint 1 / Prompt 3 — Aucune modification de code*

---

## PRÉAMBULE

Ce document définit l'ordre d'exécution précis pour transformer CA-TECH Manager V1 (35 pages, 37 routes) en Manager V2 (8 pages, ~15 routes), sans casser aucune intégration active.

**Sources** : `AUDIT_MANAGER.md` + `MANAGER_ARCHITECTURE_V2.md`

**Règle absolue** : À chaque fin de phase, le projet doit compiler (`npm run build`) sans erreur.

---

## 1. FICHIERS

### 1.1 Fichiers à conserver — inchangés

Ces fichiers ne sont pas touchés dans aucune phase.

| Fichier | Raison |
|---|---|
| `src/main.tsx` | Entry point React, aucune modification nécessaire |
| `src/index.css` | Tailwind base, aucune modification nécessaire |
| `src/lib/supabase.ts` | Client Supabase, aucune modification nécessaire |
| `src/lib/utils.ts` | Helpers (formatCurrency, formatDate, cn), utilisés partout |
| `src/lib/googleOAuth.ts` | OAuth URL builder + helpers scopes, conserver tel quel |
| `src/contexts/AuthContext.tsx` | Session Supabase, aucune modification nécessaire |
| `src/components/auth/ProtectedRoute.tsx` | Guard auth, aucune modification nécessaire |
| `src/components/ui/Avatar.tsx` | UI composant, conserver |
| `src/components/ui/Badge.tsx` | UI composant, conserver |
| `src/components/ui/Button.tsx` | UI composant, conserver |
| `src/components/ui/Card.tsx` | UI composant, conserver |
| `src/components/ui/FileUpload.tsx` | UI composant, utilisé dans Loïc |
| `src/components/ui/Input.tsx` | UI composant, conserver |
| `src/components/ui/Modal.tsx` | UI composant, conserver |
| `src/components/ui/Table.tsx` | UI composant, conserver |
| `src/components/ui/Toast.tsx` | UI composant, conserver |
| `src/hooks/useLoic.ts` | Core Loïc IA, aucune modification nécessaire |
| `src/hooks/useGmailSend.ts` | Envoi Gmail pour devis/factures, conserver |
| `src/hooks/useGoogleIntegration.ts` | Google OAuth CA-TECH, conserver |
| `src/hooks/useDocuments.ts` | Documents clients, conserver (intégré dans fiche Client) |
| `src/hooks/useMessages.ts` | Formulaire contact, conserver (fusionné dans Contacts) |
| `src/hooks/useLeads.ts` | Leads, conserver (fusionné dans Contacts) |
| `src/hooks/useClients.ts` | Clients CRUD, conserver |
| `src/hooks/useDevis.ts` | Devis CRUD + PDF + Gmail, conserver |
| `src/hooks/useFactures.ts` | Factures CRUD + PDF, conserver (intégré dans Paiements) |
| `src/hooks/usePaiements.ts` | Paiements, conserver et enrichir |
| `src/hooks/useInAppNotifications.ts` | Cloche Header, conserver |
| `src/pages/Login.tsx` | Auth, aucune modification |
| `src/pages/ForgotPassword.tsx` | Auth, aucune modification |
| `src/pages/ResetPassword.tsx` | Auth, aucune modification |
| `src/pages/GoogleOAuthCallback.tsx` | Callback OAuth popup, aucune modification |
| `src/pages/Loic.tsx` | Page Loïc IA, légères améliorations UX seulement |

### 1.2 Fichiers à modifier

Ces fichiers existent et doivent être modifiés.

| Fichier | Modifications requises | Phase |
|---|---|---|
| `src/App.tsx` | Supprimer 31 imports + routes, ajouter nouvelles routes `/contacts`, `/contacts/:id`, `/paiements/nouveau`, `/paiements/:id`, `/devis/new`, `/devis/:id` | 1 + 2 |
| `src/components/layout/Sidebar.tsx` | Réécrire : 7 items fixes, supprimer blocs Prospection + Catalogue, supprimer sous-menus | 2 |
| `src/components/layout/Breadcrumbs.tsx` | Adapter au nouveau mapping de routes V2 | 2 |
| `src/components/layout/Header.tsx` | Conserver, vérifier que la cloche reste fonctionnelle | 2 |
| `src/components/layout/Layout.tsx` | Conserver structure, vérifier compatibilité | 2 |
| `src/types/index.ts` | Supprimer types Prospection/Catalogue/Portfolio/Support/Agenda/Projets. Ajouter types : `Contact`, `StripePaymentLink`, `ClientGoogleConnection`, `AppSettings` | 1 + 10 |
| `src/pages/Dashboard.tsx` | Reconstruire complètement : KPIs V2 (5 cards), section Demandes récentes, section Loïc activité, section Devis en attente, section Paiements en attente, section Alertes | 3 |
| `src/pages/Devis.tsx` | Simplifier : retirer toute référence Prospection, ajouter gestion routes `/devis/new` et `/devis/:id` | 5 |
| `src/pages/Paiements.tsx` | Enrichir : intégrer logique Factures, ajouter routes `/paiements/nouveau` et `/paiements/:id`, ajouter interface Stripe Payment Link | 6 |
| `src/pages/Clients.tsx` | Enrichir : ajouter onglets Documents + Google Workspace dans la fiche client | 7 |
| `src/pages/Parametres.tsx` | Simplifier : supprimer onglets Projets/Notifications/Support. Ajouter onglet Google CA-TECH. Migrer localStorage → Supabase via `useAppSettings` | 9 |
| `src/hooks/useNotifications.ts` | Conserver uniquement la partie `notification_settings` (utilisée dans Paramètres). Supprimer tout ce qui référence les pages supprimées | 2 |

### 1.3 Fichiers à créer

Ces fichiers n'existent pas encore et doivent être créés.

| Fichier | Contenu | Phase |
|---|---|---|
| `src/pages/Contacts.tsx` | Page Contacts & Demandes : vue unifiée messages + leads avec statuts, actions, historique | 4 |
| `src/pages/ContactDetail.tsx` | Fiche contact : détails + devis liés + historique échanges + actions | 4 |
| `src/hooks/useContacts.ts` | Hook unifié : agrège `useMessages` + `useLeads`, normalise en type `Contact` commun | 4 |
| `src/hooks/useAppSettings.ts` | Hook Supabase pour table `app_settings` : lecture/écriture profil, agence, facturation, apparence. Migration depuis localStorage | 9 |
| `src/hooks/useStripePaymentLinks.ts` | Hook Supabase pour table `stripe_payment_links` : CRUD + appel Edge Function `create-stripe-link` | 6 |
| `src/hooks/useClientGoogleConnections.ts` | Hook Supabase pour table `client_google_connections` : connexions Google par client | 9 |

### 1.4 Fichiers à supprimer — Phase 10 uniquement

**Ne pas supprimer avant la Phase 10.** Ces fichiers restent présents mais non routés dès la Phase 1.

#### Pages (17 fichiers)
```
src/pages/Leads.tsx
src/pages/Messages.tsx
src/pages/Factures.tsx
src/pages/Projets.tsx
src/pages/Taches.tsx
src/pages/Services.tsx
src/pages/Portfolio.tsx
src/pages/Agenda.tsx
src/pages/Support.tsx
src/pages/Documents.tsx
src/pages/Notifications.tsx
src/pages/Integrations.tsx
src/pages/prospection/ApifyPanel.tsx
src/pages/prospection/ProspectionBrouillons.tsx
src/pages/prospection/ProspectionCampagnes.tsx
src/pages/prospection/ProspectionCommercialDashboard.tsx
src/pages/prospection/ProspectionConnecteurs.tsx
src/pages/prospection/ProspectionDashboard.tsx
src/pages/prospection/ProspectionParametres.tsx
src/pages/prospection/ProspectionPipeline.tsx
src/pages/prospection/ProspectionProspectDetail.tsx
src/pages/prospection/ProspectionProspects.tsx
src/pages/prospection/ProspectionQualification.tsx
src/pages/prospection/ProspectionRecherche.tsx
src/pages/prospection/ProspectionRelances.tsx
src/pages/prospection/ProspectionStatistiques.tsx
src/pages/catalogue/CatalogueCollaborateurForm.tsx
src/pages/catalogue/CatalogueCollaborateurs.tsx
src/pages/catalogue/CatalogueServiceForm.tsx
src/pages/catalogue/CatalogueServices.tsx
```

#### Composants (4 fichiers)
```
src/components/prospection/ProspectAnalysePanel.tsx
src/components/prospection/ProspectAuditPanel.tsx
src/components/prospection/ProspectRecommendPanel.tsx
src/components/prospection/ProspectScorePanel.tsx
```

#### Hooks (15 fichiers)
```
src/hooks/useAgenda.ts
src/hooks/useApify.ts
src/hooks/useAudit.ts
src/hooks/useCalendarEvents.ts
src/hooks/useCampagnes.ts
src/hooks/useCatalogueCollaborateurs.ts
src/hooks/useCatalogueServices.ts
src/hooks/useConnectors.ts
src/hooks/useDashboardRealtime.ts
src/hooks/useEmailDrafts.ts
src/hooks/useGoogleDrive.ts
src/hooks/useIntegrations.ts
src/hooks/usePortfolio.ts
src/hooks/useProjets.ts
src/hooks/useProspects.ts
src/hooks/useRecommendations.ts
src/hooks/useServices.ts
src/hooks/useSheetsSync.ts
src/hooks/useTaches.ts
src/hooks/useTickets.ts
```

#### Lib (4 fichiers)
```
src/lib/auto-analyse.ts
src/lib/auto-draft.ts
src/lib/prospect-importer.ts
src/lib/scoreCommercial.ts
```

#### Connecteurs (dossier complet — 16 fichiers)
```
src/connectors/connectors/apify.ts
src/connectors/connectors/apify-actors.ts
src/connectors/connectors/apify-client.ts
src/connectors/connectors/apify-mappers.ts
src/connectors/connectors/csv.ts
src/connectors/connectors/excel.ts
src/connectors/connectors/google-maps.ts
src/connectors/connectors/google-sheets.ts
src/connectors/connectors/linkedin.ts
src/connectors/connectors/x.ts
src/connectors/errors.ts
src/connectors/index.ts
src/connectors/logger.ts
src/connectors/manager.ts
src/connectors/registry.ts
src/connectors/types.ts
```

**Total fichiers à supprimer en Phase 10 : 65 fichiers**

---

## 2. ROUTES

### 2.1 Routes actuelles (37 routes)

```
/                               → Dashboard
/clients                        → Clients
/leads                          → Leads
/devis                          → Devis
/factures                       → Factures
/projets                        → Projets
/taches                         → Taches
/services                       → Services
/paiements                      → Paiements
/portfolio                      → Portfolio
/agenda                         → Agenda
/documents                      → Documents
/loic                           → Loic
/notifications                  → Notifications
/messages                       → Messages
/support                        → Support
/integrations                   → Integrations
/parametres                     → Parametres
/login                          → Login
/forgot-password                → ForgotPassword
/reset-password                 → ResetPassword
/auth/google/callback           → GoogleOAuthCallback
/prospection                    → ProspectionCommercialDashboard
/prospection/ia                 → ProspectionDashboard
/prospection/prospects          → ProspectionProspects
/prospection/pipeline           → ProspectionPipeline
/prospection/recherche          → ProspectionRecherche
/prospection/qualification      → ProspectionQualification
/prospection/brouillons         → ProspectionBrouillons
/prospection/campagnes          → ProspectionCampagnes
/prospection/relances           → ProspectionRelances
/prospection/statistiques       → ProspectionStatistiques
/prospection/connecteurs        → ProspectionConnecteurs
/prospection/config             → ProspectionParametres
/prospection/prospects/:id      → ProspectionProspectDetail
/catalogue/services             → CatalogueServices
/catalogue/services/new         → CatalogueServiceForm
/catalogue/services/:id/edit    → CatalogueServiceForm
/catalogue/collaborateurs       → CatalogueCollaborateurs
/catalogue/collaborateurs/new   → CatalogueCollaborateurForm
/catalogue/collaborateurs/:id/edit → CatalogueCollaborateurForm
```
*Note : l'audit comptait 37 routes (certaines routes `/catalogue` sont partagées via le même composant Form)*

### 2.2 Routes à conserver (8 routes)

| Route | Composant | Modifications |
|---|---|---|
| `/` | Dashboard | Reconstruire (Phase 3) |
| `/loic` | Loic | Légères améliorations UX (Phase 8) |
| `/devis` | Devis | Simplifier (Phase 5) |
| `/clients` | Clients | Enrichir onglets (Phase 7) |
| `/parametres` | Parametres | Réécrire partiellement (Phase 9) |
| `/login` | Login | Inchangé |
| `/forgot-password` | ForgotPassword | Inchangé |
| `/reset-password` | ResetPassword | Inchangé |
| `/auth/google/callback` | GoogleOAuthCallback | Inchangé |

### 2.3 Routes à supprimer (31 routes)

Supprimées de `App.tsx` en Phase 1. Les fichiers correspondants restent jusqu'à la Phase 10.

```
/leads
/messages
/factures
/projets
/taches
/services
/portfolio
/agenda
/documents
/notifications
/support
/integrations
/prospection
/prospection/ia
/prospection/prospects
/prospection/pipeline
/prospection/recherche
/prospection/qualification
/prospection/brouillons
/prospection/campagnes
/prospection/relances
/prospection/statistiques
/prospection/connecteurs
/prospection/config
/prospection/prospects/:id
/catalogue/services
/catalogue/services/new
/catalogue/services/:id/edit
/catalogue/collaborateurs
/catalogue/collaborateurs/new
/catalogue/collaborateurs/:id/edit
```

### 2.4 Nouvelles routes (7 routes)

| Route | Composant | Description | Phase |
|---|---|---|---|
| `/contacts` | `Contacts.tsx` (nouveau) | Liste unifiée messages + leads | 4 |
| `/contacts/:id` | `ContactDetail.tsx` (nouveau) | Fiche contact avec historique | 4 |
| `/devis/new` | `Devis.tsx` (enrichi) | Formulaire création devis | 5 |
| `/devis/:id` | `Devis.tsx` (enrichi) | Voir / éditer un devis | 5 |
| `/paiements/nouveau` | `Paiements.tsx` (enrichi) | Créer lien Stripe comptant ou abonnement | 6 |
| `/paiements/:id` | `Paiements.tsx` (enrichi) | Détail paiement / statut | 6 |
| `/clients/:id` | `Clients.tsx` (enrichi) | Fiche client complète (onglets) | 7 |

**Total V2 : ~15 routes** (8 conservées + 7 nouvelles, hors auth)

---

## 3. SUPABASE

### 3.1 Tables existantes et leur statut V2

#### Tables actives V2 (code + données conservés)

| Table | Rôle V2 | Hook | Modifications code |
|---|---|---|---|
| `clients` | Fiche client | `useClients` | Aucune |
| `leads` | Contacts & Demandes | `useLeads` | Conserver, fusionné via `useContacts` |
| `messages` | Demandes formulaire contact | `useMessages` | Conserver, fusionné via `useContacts` |
| `devis` | Devis | `useDevis` | Vérifier doublon `devis_number`/`quote_number` |
| `devis_items` | Lignes devis | via `useDevis` | Vérifier doublon avec `quote_items` |
| `invoices` | Factures (liées paiements) | `useFactures` | Intégré dans Paiements |
| `invoice_items` | Lignes factures | via `useFactures` | Intégré dans Paiements |
| `payments` | Paiements enregistrés | `usePaiements` | Enrichir avec Stripe |
| `ai_conversations` | Conversations Loïc | `useLoic` | Aucune |
| `google_integrations` | Token Google CA-TECH (1 ligne) | `useGoogleIntegration` | Aucune |
| `documents` | Fichiers Supabase Storage | `useDocuments` | Intégré dans fiche Client |
| `notifications` | Notifications in-app | `useInAppNotifications` | Conserver pour cloche Header |
| `notification_settings` | Préférences notifications | `useNotifications` | Conserver (Paramètres) |

#### Tables conservées — données uniquement (code supprimé)

Ces tables ne sont **jamais supprimées**. Le code qui les interroge sera supprimé, mais les données sont préservées.

| Table | Données à préserver |
|---|---|
| `prospects` | Données prospects B2B existantes |
| `prospect_activities` | Journal activités prospect |
| `prospect_campaigns` | Liens prospect ↔ campagne |
| `campaigns` | Campagnes emailing |
| `campaign_steps` | Étapes campagnes |
| `email_drafts` | Emails générés par IA |
| `appointments` | Rendez-vous agenda |
| `portfolio_projects` | Réalisations CA-TECH |
| `projects` | Projets |
| `project_tasks` | Tâches |
| `services` | Catalogue services internes |
| `tickets` | Tickets support |
| `ticket_messages` | Messages tickets |
| `catalogue_services` | Services site public |
| `catalogue_collaborateurs` | Collaborateurs IA site public |

### 3.2 Migrations Supabase nécessaires (3 nouvelles tables)

Ces migrations créent de nouvelles tables. **Aucune table existante n'est modifiée.**

#### Migration 1 — `client_google_connections` (Phase 9)

```sql
CREATE TABLE IF NOT EXISTS client_google_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  google_email    text NOT NULL,
  scope           text NOT NULL,
  access_token    text,
  refresh_token   text,
  expires_at      timestamptz,
  connected_at    timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE client_google_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage client google connections"
  ON client_google_connections FOR ALL TO authenticated USING (true);
```

#### Migration 2 — `stripe_payment_links` (Phase 6)

```sql
CREATE TYPE stripe_link_type AS ENUM ('comptant', 'abonnement');
CREATE TYPE stripe_link_status AS ENUM ('pending', 'paid', 'expired', 'cancelled', 'active', 'suspended', 'cancelled');

CREATE TABLE IF NOT EXISTS stripe_payment_links (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid REFERENCES clients(id) ON DELETE SET NULL,
  devis_id         uuid REFERENCES devis(id) ON DELETE SET NULL,
  type             stripe_link_type NOT NULL,
  stripe_link_id   text,
  stripe_link_url  text,
  amount           numeric(10, 2),
  currency         text DEFAULT 'eur',
  status           text NOT NULL DEFAULT 'pending',
  subscription_id  text,
  plan             text,
  created_at       timestamptz DEFAULT now(),
  paid_at          timestamptz
);

ALTER TABLE stripe_payment_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage stripe payment links"
  ON stripe_payment_links FOR ALL TO authenticated USING (true);
```

#### Migration 3 — `app_settings` (Phase 9)

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profil       jsonb DEFAULT '{}',
  agence       jsonb DEFAULT '{}',
  facturation  jsonb DEFAULT '{}',
  apparence    jsonb DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings"
  ON app_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id);
```

### 3.3 Point critique — doublon `devis_items` / `quote_items`

`useDevis.ts` ligne 35 contient :
```ts
lignes: (row.devis_items ?? row.quote_items ?? [])
```

**Action requise avant Phase 5 :** Vérifier dans le dashboard Supabase quelle table existe réellement (`devis_items` ou `quote_items`). Corriger `useDevis.ts` pour utiliser uniquement le nom correct.

---

## 4. SERVICES

### 4.1 Formulaire contact

| Élément | Fichier | Action V2 |
|---|---|---|
| Données entrantes | Table `messages` | Conserver |
| Hook de lecture | `hooks/useMessages.ts` | Conserver, fusionné dans `useContacts` |
| Affichage | `pages/Messages.tsx` | Remplacé par `pages/Contacts.tsx` |
| Réponse Gmail | `hooks/useGmailSend.ts` | Conserver |
| Conversion → lead | `hooks/useLeads.ts` | Conserver |

### 4.2 Devis

| Élément | Fichier | Action V2 |
|---|---|---|
| Tables | `devis`, `devis_items` | Conserver |
| Hook CRUD | `hooks/useDevis.ts` | Conserver, simplifier |
| Génération PDF | html2canvas + jsPDF dans `Devis.tsx` | Conserver à court terme |
| Envoi Gmail | `hooks/useGmailSend.ts` | Conserver |
| Signature | dans `Devis.tsx` | Conserver |
| Conversion → facture | dans `Devis.tsx` + `Factures.tsx` | Réintégrer dans Paiements |
| Routes | `/devis` uniquement | Ajouter `/devis/new`, `/devis/:id` |

### 4.3 Paiements

| Élément | Fichier | Action V2 |
|---|---|---|
| Table paiements | `payments` | Conserver |
| Hook paiements | `hooks/usePaiements.ts` | Enrichir |
| Table factures | `invoices`, `invoice_items` | Conserver, intégrer dans Paiements |
| Hook factures | `hooks/useFactures.ts` | Conserver, intégrer dans Paiements |
| Stripe lien manuel | champ `stripe_payment_link` dans `invoices` | Conserver le champ |
| Stripe lien API | inexistant | Créer `hooks/useStripePaymentLinks.ts` + table |
| Abonnements | inexistant | Créer dans Phase 6 |

### 4.4 Stripe

| Élément | Situation actuelle | Action V2 | Phase |
|---|---|---|---|
| Lien paiement manuel | Champ `stripe_payment_link` dans factures | Conserver | — |
| SDK `@stripe/stripe-js` | Absent | Ne pas installer côté frontend | — |
| Création lien via API | Absent | Créer Edge Function Supabase `create-stripe-link` | 6 |
| Hook frontend | Absent | Créer `useStripePaymentLinks.ts` | 6 |
| Table dédiée | Absent | Créer `stripe_payment_links` | 6 |
| Abonnements | Absent | Implémenter dans Phase 6 | 6 |
| Webhook Stripe | Absent (côté Edge Functions) | À vérifier / créer séparément | 6 |

> **Note importante** : La création de liens Stripe via API nécessite une nouvelle Edge Function Supabase `create-stripe-link` avec la clé secrète Stripe. Cette Edge Function n'existe pas dans le dépôt actuel. Elle sera à développer en Phase 6 du côté Supabase, en coordination avec le frontend.

### 4.5 Loïc IA

| Élément | Fichier | Action V2 |
|---|---|---|
| Edge Function | `loic-chat` (Supabase) | Aucune modification |
| Table conversations | `ai_conversations` | Aucune modification |
| Hook | `hooks/useLoic.ts` | Aucune modification |
| Page | `pages/Loic.tsx` | Légères améliorations UX (Phase 8) |
| Lien leads créés | `hooks/useLeads.ts` via metadata | Exposer dans Contacts & Demandes (Phase 4) |

### 4.6 Google Workspace

| Élément | Fichier | Action V2 |
|---|---|---|
| Edge Function OAuth | `google-oauth` (Supabase) | Aucune modification |
| Edge Function Gmail | `send-gmail` (Supabase, implicite) | Aucune modification |
| Lib OAuth URL | `lib/googleOAuth.ts` | Aucune modification |
| Hook Google CA-TECH | `hooks/useGoogleIntegration.ts` | Aucune modification |
| Table Google CA-TECH | `google_integrations` | Aucune modification |
| Callback OAuth | `pages/GoogleOAuthCallback.tsx` | Aucune modification |
| Page Intégrations (UI) | `pages/Integrations.tsx` | Déplacer Google vers Paramètres. Supprimer le reste. |
| Connexion par client | Absent | Créer `hooks/useClientGoogleConnections.ts` + table (Phase 9) |

### 4.7 Notifications

| Élément | Fichier | Action V2 |
|---|---|---|
| Cloche Header | `hooks/useInAppNotifications.ts` | Conserver, aucune modification |
| Table notifications | `notifications` | Conserver |
| Table settings | `notification_settings` | Conserver (Paramètres) |
| Hook settings | `hooks/useNotifications.ts` | Simplifier : garder uniquement la partie `notification_settings` |
| Page dédiée | `pages/Notifications.tsx` | Supprimer la route en Phase 1, fichier en Phase 10 |

### 4.8 Authentification

| Élément | Fichier | Action V2 |
|---|---|---|
| Provider | Supabase Auth email+password | Aucune modification |
| Context | `contexts/AuthContext.tsx` | Aucune modification |
| Guard | `components/auth/ProtectedRoute.tsx` | Aucune modification |
| Page login | `pages/Login.tsx` | Aucune modification |
| Reset password | `pages/ForgotPassword.tsx`, `pages/ResetPassword.tsx` | Aucune modification |

---

## 5. PLAN D'EXÉCUTION PAR PHASES

### Phase 1 — Nettoyage App.tsx (sans modifier les fichiers sources)

**Objectif** : Supprimer les 31 routes orphelines de `App.tsx` sans supprimer aucun fichier. Le build doit passer.

**Fichiers modifiés** :
- `src/App.tsx`

**Actions précises** :
1. Supprimer tous les `import` lazy de pages Prospection (13 imports)
2. Supprimer tous les `import` lazy de pages Catalogue (4 imports)
3. Supprimer les imports de : `Leads`, `Messages`, `Factures`, `Projets`, `Taches`, `Services`, `Portfolio`, `Agenda`, `Documents`, `Notifications`, `Support`, `Integrations`
4. Supprimer les `<Route>` correspondants (31 routes)
5. Conserver le reste du fichier intact

**Validation** : `npm run build` → 0 erreurs TypeScript

---

### Phase 2 — Nouvelle navigation

**Objectif** : Simplifier la Sidebar à 7 items, mettre à jour les Breadcrumbs, ajouter un placeholder route `/contacts`.

**Fichiers modifiés** :
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Breadcrumbs.tsx`
- `src/App.tsx` (ajouter route `/contacts` placeholder)

**Actions précises** :

**Sidebar.tsx** :
1. Supprimer le bloc `prospectionItems` et son rendu conditionnel
2. Supprimer le bloc `catalogueItems` et son rendu conditionnel
3. Réécrire `navItems` avec 7 entrées uniquement :
   - Dashboard `/` (icône : LayoutDashboard)
   - Contacts `/contacts` (icône : MessageSquare)
   - Devis `/devis` (icône : FileText)
   - Paiements `/paiements` (icône : CreditCard)
   - Clients `/clients` (icône : Users)
   - Loïc `/loic` (icône : Bot)
   - Paramètres `/parametres` (icône : Settings)
4. Supprimer les imports non utilisés (Lucide icons Prospection)

**Breadcrumbs.tsx** :
1. Mettre à jour le mapping de routes pour inclure `/contacts`, `/contacts/:id`
2. Supprimer les mappings Prospection/Catalogue/Leads/Messages/etc.

**App.tsx** :
1. Ajouter `<Route path="/contacts" element={<div>Contacts (à venir)</div>} />`

**Validation** : `npm run build` → 0 erreurs. Naviguer dans l'app : Sidebar affiche 7 items.

---

### Phase 3 — Dashboard V2

**Objectif** : Reconstruire `Dashboard.tsx` avec les KPIs V2. Remplacer le dashboard complexe par la structure définie dans `MANAGER_ARCHITECTURE_V2.md` section 13.

**Fichiers modifiés** :
- `src/pages/Dashboard.tsx`

**Hooks utilisés** :
- `useMessages` → KPI nouveaux contacts (7j)
- `useLeads` → KPI contacts + devis en attente
- `useDevis` → devis en attente (status = 'envoye')
- `usePaiements` → paiements ce mois
- `useClients` → clients actifs
- `useLoic` → activité Loïc 24h
- `useInAppNotifications` → alertes

**Structure du Dashboard** :
```
Ligne KPIs (5 cards) :
  ├── Nouveaux contacts (7j) ← useMessages + useLeads
  ├── Devis en attente ← useDevis WHERE status='envoye'
  ├── Paiements ce mois ← usePaiements WHERE mois courant
  ├── Abonnements actifs ← useStripePaymentLinks (Phase 6, placeholder '—' pour l'instant)
  └── Clients actifs ← useClients

Colonne gauche (60%) :
  ├── Demandes récentes (5 dernières) ← useMessages + useLeads
  └── Alertes (devis expirant, paiements en retard)

Colonne droite (40%) :
  ├── Loïc activité récente ← useLoic
  ├── Devis en attente (liste) ← useDevis
  └── Paiements en attente ← usePaiements
```

**Validation** : `npm run build` → 0 erreurs. Dashboard affiche les KPIs réels.

---

### Phase 4 — Contacts & Demandes

**Objectif** : Créer la page unifiée Contacts & Demandes fusionnant Messages + Leads.

**Fichiers créés** :
- `src/hooks/useContacts.ts`
- `src/pages/Contacts.tsx`
- `src/pages/ContactDetail.tsx`

**Fichiers modifiés** :
- `src/App.tsx` (remplacer le placeholder `/contacts` par les vraies routes)
- `src/types/index.ts` (ajouter type `Contact`)

**Type `Contact` unifié** :
```typescript
type ContactSource = 'formulaire' | 'loic' | 'manuel';
type ContactStatus = 'nouveau' | 'qualifie' | 'devis_envoye' | 'gagne' | 'perdu';

interface Contact {
  id: string;
  source: ContactSource;
  status: ContactStatus;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  besoin?: string;
  budget?: string;
  created_at: string;
  // Référence à l'entité source
  message_id?: string;   // si source = 'formulaire'
  lead_id?: string;      // si source = 'loic' | 'manuel'
  conversation_id?: string; // si créé par Loïc
}
```

**`useContacts.ts`** :
1. Appelle `useMessages` → transforme en `Contact[]` (source='formulaire')
2. Appelle `useLeads` → transforme en `Contact[]` (source='loic' ou 'manuel')
3. Fusionne et trie par `created_at` DESC
4. Expose : `contacts`, `isLoading`, `createContact()`, `updateContactStatus()`, `convertToClient()`

**`Contacts.tsx`** :
- Tableau de tous les contacts, colonne source (badge formulaire/Loïc/manuel), colonne statut, colonne date
- Filtres : source, statut, recherche texte
- Actions par ligne : [Créer un devis] → prérempli, [Envoyer un email] via Gmail, [Passer en client]
- Lien vers `/contacts/:id`

**`ContactDetail.tsx`** :
- Informations du contact (nom, email, tel, entreprise, besoin, budget)
- Historique des échanges (messages initiaux, réponses Gmail)
- Devis liés (liste des devis avec ce lead_id)
- Actions : [Créer un devis], [Envoyer un email], [Convertir en client]

**Validation** : `npm run build` → 0 erreurs. `/contacts` liste tous les messages + leads. `/contacts/:id` affiche la fiche.

---

### Phase 5 — Devis V2

**Objectif** : Simplifier `Devis.tsx`, ajouter les routes `/devis/new` et `/devis/:id`.

**Fichiers modifiés** :
- `src/pages/Devis.tsx`
- `src/App.tsx`

**Actions dans `Devis.tsx`** :
1. Gérer les 3 modes : liste (`/devis`), création (`/devis/new`), édition (`/devis/:id`)
2. Préremplissage depuis un contact si `?contact_id=` en query param
3. Conserver intégralement : PDF, envoi Gmail, signature, conversion → facture (dans Paiements)
4. Supprimer toute référence à Prospection ou Catalogue (si présente)
5. Résoudre le doublon `devis_items` / `quote_items` après vérification Supabase

**Validation** : `npm run build` → 0 erreurs. Créer un devis depuis `/contacts/:id` → préremplissage fonctionne.

---

### Phase 6 — Paiements V2

**Objectif** : Transformer `Paiements.tsx` en hub de paiements incluant la logique Factures et les liens Stripe API.

**Fichiers créés** :
- `src/hooks/useStripePaymentLinks.ts`

**Fichiers modifiés** :
- `src/pages/Paiements.tsx`
- `src/App.tsx`

**Migration Supabase** :
- Appliquer la migration `stripe_payment_links` (script SQL — Phase 6)

**`useStripePaymentLinks.ts`** :
1. `getLinks(clientId?)` → SELECT from `stripe_payment_links`
2. `createLink(params)` → invoke Edge Function Supabase `create-stripe-link` (à créer côté Supabase) → INSERT résultat dans `stripe_payment_links`
3. `updateLinkStatus(id, status)` → UPDATE status (pour vérification manuelle ou webhook)

**`Paiements.tsx`** — nouvelle structure :
```
/paiements           → Vue Hub : liste paiements + liens Stripe en attente
/paiements/nouveau   → Formulaire : choisir type (comptant/abonnement), lier client + devis, montant
/paiements/:id       → Détail : statut lien, historique, copier URL, renvoyer par Gmail
```

**Note Edge Function** : `create-stripe-link` doit être créée côté Supabase avec la clé secrète Stripe. Elle reçoit `{ amount, currency, client_id, type, plan? }` et retourne `{ stripe_link_id, stripe_link_url }`.

**Validation** : `npm run build` → 0 erreurs. Interface création lien Stripe visible (même si Edge Function pas encore déployée).

---

### Phase 7 — Clients V2

**Objectif** : Enrichir la fiche Client avec les onglets Documents et Google Workspace (placeholder).

**Fichiers modifiés** :
- `src/pages/Clients.tsx`
- `src/App.tsx` (ajouter `/clients/:id`)

**Onglets de la fiche Client** :
```
Onglet Infos         → Identité, coordonnées, entreprise, notes
Onglet Devis         → useDevis filtré par client_id
Onglet Paiements     → usePaiements + useFactures filtrés par client_id
Onglet Documents     → useDocuments filtré par client_id + upload
Onglet Google        → Placeholder "Google Workspace — bientôt disponible"
```

**Validation** : `npm run build` → 0 erreurs. Fiche client `/clients/:id` accessible avec 5 onglets.

---

### Phase 8 — Loïc V2

**Objectif** : Légères améliorations UX de `Loic.tsx`. Lier les leads Loïc vers Contacts.

**Fichiers modifiés** :
- `src/pages/Loic.tsx`

**Actions** :
1. Dans la liste des conversations, afficher un badge si le lead a été créé (`metadata.lead_created = true`)
2. Ajouter un lien cliquable vers `/contacts/:id` (via le `lead_id` de `metadata`)
3. Dans le dashboard onglet Loïc : ajouter lien [Voir dans Contacts] pour chaque lead créé
4. Améliorer l'affichage des actions structurées (propose_appointment, escalate)

**Validation** : `npm run build` → 0 erreurs. Leads Loïc → lien vers Contacts fonctionnel.

---

### Phase 9 — Google Workspace V2 + Migration Paramètres

**Objectif** : Google par client dans fiche Client. Migration localStorage → Supabase pour les paramètres.

**Fichiers créés** :
- `src/hooks/useClientGoogleConnections.ts`
- `src/hooks/useAppSettings.ts`

**Fichiers modifiés** :
- `src/pages/Clients.tsx` (activer l'onglet Google — était placeholder en Phase 7)
- `src/pages/Parametres.tsx` (réécrire partiellement)

**Migrations Supabase** :
- Appliquer `client_google_connections`
- Appliquer `app_settings`

**`useAppSettings.ts`** :
1. Au premier appel : lire `localStorage.getItem('catech_settings')`, migrer vers `app_settings` Supabase si la table est vide
2. Exposer `settings`, `updateSettings()` → upsert dans `app_settings`
3. Ne plus jamais écrire dans localStorage

**`useClientGoogleConnections.ts`** :
1. `getConnections(clientId)` → SELECT from `client_google_connections`
2. `connectGoogle(clientId, scope)` → déclencher le flow OAuth adapté
3. `disconnectGoogle(connectionId)` → DELETE + révocation token Google

**`Parametres.tsx`** — structure V2 :
```
Onglet Profil      → useAppSettings().profil
Onglet Agence      → useAppSettings().agence
Onglet Facturation → useAppSettings().facturation
Onglet Google      → useGoogleIntegration (connexion CA-TECH)
Onglet Sécurité    → Changement mot de passe Supabase
```
Supprimer les onglets : Notifications (déplacé dans Header), Apparence (simplifié), Intégrations (retiré)

**Fiche Client — onglet Google** :
```
┌─────────────────────────────────────────────┐
│  Google Workspace — [Nom Client]            │
│  ● Gmail         email@client.com  [Lié]    │
│  ○ Google Drive                    [Lier]   │
│  ○ Google Sheets                   [Lier]   │
│  [Gérer les autorisations] [Révoquer tout]  │
└─────────────────────────────────────────────┘
```

**Validation** : `npm run build` → 0 erreurs. Paramètres sauvegardés en Supabase. Onglet Google actif dans fiche Client.

---

### Phase 10 — Suppression définitive

**Objectif** : Supprimer les 65 fichiers devenus inutiles, nettoyer les types, retirer les dépendances npm orphelines.

**Prérequis** : Toutes les phases 1-9 sont terminées et validées.

**Ordre de suppression** :
1. Supprimer `src/pages/prospection/` (dossier complet — 14 fichiers)
2. Supprimer `src/pages/catalogue/` (dossier complet — 4 fichiers)
3. Supprimer `src/components/prospection/` (dossier complet — 4 fichiers)
4. Supprimer les hooks orphelins (20 fichiers listés section 1.4)
5. Supprimer les lib orphelines (4 fichiers)
6. Supprimer `src/connectors/` (dossier complet — 16 fichiers)
7. Supprimer `src/pages/Leads.tsx`, `Messages.tsx`, `Factures.tsx`, et les autres pages (7 fichiers)
8. Nettoyer `src/types/index.ts` : supprimer les types `Prospect`, `ProspectContact`, `EmailDraft`, `Campaign`, `CampaignStep`, `Appointment`, `PortfolioItem`, `Ticket`, `TicketMessage`, `Projet`, `Tache`, `Service`
9. Retirer les dépendances npm inutiles

**Dépendances npm à évaluer pour suppression** :
- `recharts` — à supprimer si Dashboard V2 n'utilise plus de graphiques complexes
- `html2canvas` + `jspdf` — à supprimer si PDF migré vers Edge Function Supabase (décision à prendre en Phase 5)
- Connecteurs non npm (dans `connectors/`) — supprimés avec le dossier

**Validation finale** :
```bash
npm run lint        # 0 erreurs (les 10 erreurs pré-existantes doivent disparaître)
npm run typecheck   # 0 erreurs
npm run build       # Succès, bundle réduit vs V1
```

---

## 6. RISQUES

### Risque 1 — Doublon `devis_items` / `quote_items`

**Criticité** : HAUTE

**Description** : `useDevis.ts` contient `row.devis_items ?? row.quote_items ?? []`. Si une seule des deux tables existe en Supabase, l'autre référence retourne un array vide silencieusement. Les lignes de devis pourraient disparaître sans erreur visible.

**Mitigation** :
- Avant Phase 5 : vérifier dans le dashboard Supabase quelles tables `devis_items` et `quote_items` existent
- Corriger `useDevis.ts` pour utiliser uniquement le nom de table qui existe
- Tester la création + lecture de devis avec lignes avant de valider Phase 5

---

### Risque 2 — Perte de données localStorage lors de migration Paramètres

**Criticité** : HAUTE

**Description** : Les paramètres agence (IBAN, BIC, préfixes, TVA) sont en localStorage. Ils alimentent les PDF de devis et factures. Si la migration Phase 9 échoue et que localStorage est vidé, les PDF générés seront sans en-tête d'agence.

**Mitigation** :
- En Phase 9 : la migration `useAppSettings` lit d'abord le localStorage AVANT d'écrire en Supabase
- Ne jamais vider localStorage avant confirmation que `app_settings` est bien peuplée
- Tester : générer un PDF de devis après migration et vérifier l'en-tête agence (IBAN, SIRET, etc.)

---

### Risque 3 — Edge Functions non versionnées

**Criticité** : MOYENNE

**Description** : Les Edge Functions Supabase (`loic-chat`, `google-oauth`, `send-gmail`) ne sont pas dans ce dépôt. Tout changement de payload (colonnes ajoutées, format de réponse modifié) dans le frontend doit être coordonné avec les Edge Functions existantes.

**Mitigation** :
- Ne jamais modifier les payloads des appels aux Edge Functions existantes sans vérifier côté Supabase
- La nouvelle Edge Function `create-stripe-link` doit être créée ET déployée côté Supabase avant que Phase 6 soit testée

**Colonnes sensibles** :
- `useGmailSend` → payload attendu par `send-gmail` : vérifier avant de modifier `Devis.tsx` / `Paiements.tsx`
- `useGoogleIntegration` → payload attendu par `google-oauth` : ne pas modifier `lib/googleOAuth.ts`

---

### Risque 4 — Rupture OAuth Google

**Criticité** : HAUTE

**Description** : Le flow OAuth Google est délicat (popup → postMessage → callback → Edge Function). Toute modification du chemin `/auth/google/callback` ou du `basename="/manager"` casse le flow.

**Mitigation** :
- Ne jamais modifier `pages/GoogleOAuthCallback.tsx`
- Ne jamais modifier `lib/googleOAuth.ts`
- Ne jamais modifier `hooks/useGoogleIntegration.ts`
- En Phase 9 pour la connexion par client : créer un nouveau flow OAuth distinct (nouveau scope, nouveau callback paramétrisé `?client_id=xxx`), ne pas toucher au flow CA-TECH existant
- Tester la connexion Google CA-TECH après chaque phase modifiant `Parametres.tsx`

---

### Risque 5 — Régression dans Devis / Factures

**Criticité** : HAUTE

**Description** : Les modules Devis et Factures sont interdépendants (conversion devis → facture). En Phase 5, simplifier `Devis.tsx` et intégrer `Factures` dans `Paiements` peut casser la conversion.

**Mitigation** :
- En Phase 5 : conserver intacte la logique `convertToFacture()` dans `useDevis.ts`
- En Phase 6 : `useFactures` reste intact, `Factures.tsx` reste en fichier jusqu'à Phase 10
- Tester le parcours complet : créer devis → convertir en facture → enregistrer paiement → PDF

---

### Risque 6 — Données Prospection actives

**Criticité** : MOYENNE

**Description** : Les tables `prospects`, `campaigns`, `email_drafts` peuvent contenir des données de prospection réelles. La suppression du code ne supprime pas les données, mais la suppression accidentelle de tables ou de politiques RLS poserait un problème.

**Mitigation** :
- Règle absolue : **aucune table Supabase n'est supprimée** lors de la migration
- Vérifier avant Phase 10 qu'aucun hook restant ne référence ces tables
- Les politiques RLS existantes sur ces tables restent actives

---

### Risque 7 — Build cassé entre phases

**Criticité** : MOYENNE

**Description** : Supprimer des imports dans `App.tsx` (Phase 1) sans supprimer les fichiers peut laisser des imports circulaires ou des types non résolus dans `types/index.ts`.

**Mitigation** :
- Phase 1 : modifier `App.tsx` uniquement, valider le build avant de passer à Phase 2
- Ne jamais modifier `types/index.ts` avant Phase 10 (sauf ajout de nouveaux types)
- Si une erreur TypeScript apparaît après suppression d'import : chercher la dépendance transitive avant de supprimer

---

### Risque 8 — Stripe API — gestion des erreurs

**Criticité** : MOYENNE

**Description** : La création de liens Stripe via API est une nouvelle fonctionnalité. Si l'Edge Function `create-stripe-link` retourne une erreur (clé invalide, plan inexistant), l'UX doit rester stable.

**Mitigation** :
- En Phase 6 : implémenter un état de chargement + gestion d'erreur toast dans `Paiements.tsx`
- Le lien Stripe manuel dans `invoices.stripe_payment_link` reste disponible comme fallback pendant la transition
- Tester avec un payment link Stripe réel en mode test avant de merger Phase 6

---

## RÉSUMÉ EXÉCUTIF

| Phase | Objectif | Durée estimée | Risque principal |
|---|---|---|---|
| 1 | Nettoyage App.tsx | Court | Build cassé si import manquant |
| 2 | Nouvelle navigation | Court | Sidebar incohérente avec routes |
| 3 | Dashboard V2 | Moyen | Données KPI mal filtrées |
| 4 | Contacts & Demandes | Moyen | Fusion Messages+Leads = type unifié à maintenir |
| 5 | Devis V2 | Court | Doublon devis_items/quote_items |
| 6 | Paiements V2 | Long | Edge Function Stripe à créer côté Supabase |
| 7 | Clients V2 | Moyen | Onglets Documents + Google placeholder |
| 8 | Loïc V2 | Court | Lien leads Loïc → Contacts |
| 9 | Google + Paramètres | Long | Migration localStorage + OAuth par client |
| 10 | Suppression définitive | Court | Imports résiduels, types orphelins |

**Règles transversales** :
- Chaque phase se termine par `npm run build` sans erreur
- Aucune table Supabase n'est supprimée
- Aucune Edge Function existante n'est modifiée
- Les données existantes (leads, devis, paiements, clients) restent accessibles à tout moment

---

*PLAN DE MIGRATION TERMINÉ — AUCUNE MODIFICATION EFFECTUÉE*
