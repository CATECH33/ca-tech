# MANAGER_V2_AUDIT_AND_MIGRATION_PLAN.md
## Sprint 11.1 — Audit complet du Manager avant refonte V2

**Date :** 2026-08-14
**Auteur :** Audit automatisé (lecture seule)
**Périmètre :** Manager React (`manager/src/`) + Edge Functions (`supabase/functions/`) + DB Supabase

> **CONTRÔLE :** 0 fichier supprimé — 0 fichier modifié — 0 table modifiée — 0 donnée supprimée — 0 migration exécutée

---

## Table des matières

1. [État actuel](#1-état-actuel)
2. [Navigation actuelle](#2-navigation-actuelle)
3. [Routes](#3-routes)
4. [Fonctionnalités](#4-fonctionnalités)
5. [Tables Supabase](#5-tables-supabase)
6. [Hooks et services](#6-hooks-et-services)
7. [Données à préserver](#7-données-à-préserver)
8. [Éléments redondants ou inutiles](#8-éléments-redondants-ou-inutiles)
9. [Architecture V2](#9-architecture-v2)
10. [Plan de migration](#10-plan-de-migration)
11. [Risques](#11-risques)

---

## 1. État actuel

### Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18, TypeScript, Vite, TanStack Query, React Router v6 |
| UI | Tailwind CSS, Lucide icons, composants maison (Button, Modal, Table, Input, Card, Badge) |
| Auth | Supabase Auth (email/password) + Google OAuth via edge function |
| Backend | Supabase (PostgreSQL 17, RLS, Storage, Realtime) + Deno Edge Functions |
| Paiements | Stripe (checkout unique, abonnements mensuels, webhooks) |
| IA | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic API |
| Intégrations | Google OAuth/Gmail/Calendar/Drive/Sheets, Apify, Resend, Brevo |
| Build | `tsc -b && vite build` — 0 erreur TypeScript, warning vendor-pdf > 500 kB (connu) |

### Chiffres globaux

| Indicateur | Valeur |
|-----------|--------|
| Pages React | 42 composants page |
| Routes | 44 routes (4 publiques + 40 protégées) |
| Hooks | 33 fichiers hooks |
| Edge Functions | 10 fonctions Deno |
| Tables Supabase | 51 tables (27 avec données, 24 vides) |
| Intégrations externes | 6 (Google, Stripe, Apify, Anthropic, Resend, Brevo) |

---

## 2. Navigation actuelle

### Sidebar principale (7 entrées)

| # | Label | Icône | Route | Visible sidebar |
|---|-------|-------|-------|----------------|
| 1 | Vue d'ensemble | LayoutDashboard | `/` | ✅ |
| 2 | Demandes & Devis | Inbox | `/demandes` | ✅ |
| 3 | Clients | Users | `/clients` | ✅ |
| 4 | Paiements | CreditCard | `/paiements` | ✅ |
| 5 | Loïc IA | Bot | `/loic` | ✅ |
| 6 | Prospection | Target | `/prospection` | ✅ |
| — | Paramètres | Settings | `/parametres` | ✅ (bottom) |

### Pages protégées NON présentes dans la sidebar

Ces pages existent et fonctionnent mais ne sont pas liées directement depuis la sidebar. Elles sont accessibles via des liens internes dans d'autres pages :

| Page | Route | Accès depuis |
|------|-------|-------------|
| Leads | `/leads` | Dashboard, DemandesDevis |
| Devis | `/devis` | Clients, DemandesDevis |
| Factures | `/factures` | Clients, Paiements |
| Projets | `/projets` | Clients |
| Tâches | `/taches` | Projets |
| Services | `/services` | Paramètres internes |
| Portfolio | `/portfolio` | Paramètres internes |
| Agenda | `/agenda` | Navigation interne |
| Messages | `/messages` | Dashboard (badge) |
| Support | `/support` | Navigation interne |
| Documents | `/documents` | Clients |
| Notifications | `/notifications` | Header (badge) |
| Intégrations | `/integrations` | Paramètres |
| Catalogue Services | `/catalogue/services` | Paramètres |
| Catalogue Collabs | `/catalogue/collaborateurs` | Paramètres |

### Sous-module Prospection (13 routes internes)

| Label | Route | Fichier |
|-------|-------|---------|
| Dashboard commercial | `/prospection` | ProspectionCommercialDashboard.tsx |
| Dashboard IA | `/prospection/ia` | ProspectionDashboard.tsx |
| Prospects | `/prospection/prospects` | ProspectionProspects.tsx |
| Détail prospect | `/prospection/prospects/:id` | ProspectionProspectDetail.tsx |
| Recherche | `/prospection/recherche` | ProspectionRecherche.tsx |
| Qualification | `/prospection/qualification` | ProspectionQualification.tsx |
| Brouillons | `/prospection/brouillons` | ProspectionBrouillons.tsx |
| Campagnes | `/prospection/campagnes` | ProspectionCampagnes.tsx |
| Relances | `/prospection/relances` | ProspectionRelances.tsx |
| Statistiques | `/prospection/statistiques` | ProspectionStatistiques.tsx |
| Configuration | `/prospection/config` | ProspectionParametres.tsx |
| Pipeline | `/prospection/pipeline` | ProspectionPipeline.tsx |
| Connecteurs | `/prospection/connecteurs` | ProspectionConnecteurs.tsx |

### Sous-module Catalogue (6 routes internes)

| Label | Route | Fichier |
|-------|-------|---------|
| Services catalogue | `/catalogue/services` | CatalogueServices.tsx |
| Nouveau service | `/catalogue/services/new` | CatalogueServiceForm.tsx |
| Éditer service | `/catalogue/services/:id/edit` | CatalogueServiceForm.tsx |
| Collaborateurs | `/catalogue/collaborateurs` | CatalogueCollaborateurs.tsx |
| Nouveau collab | `/catalogue/collaborateurs/new` | CatalogueCollaborateurForm.tsx |
| Éditer collab | `/catalogue/collaborateurs/:id/edit` | CatalogueCollaborateurForm.tsx |

---

## 3. Routes

### Routes publiques (4)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/login` | Login.tsx | Authentification email/password |
| `/forgot-password` | ForgotPassword.tsx | Réinitialisation mot de passe |
| `/reset-password` | ResetPassword.tsx | Nouveau mot de passe (token Supabase) |
| `/auth/google/callback` | GoogleOAuthCallback.tsx | Callback OAuth Google (code → tokens) |

### Routes protégées (40) — résumé

| Groupe | Nombre | Routes |
|--------|--------|--------|
| Sidebar principale | 7 | /, /demandes, /clients, /paiements, /loic, /prospection, /parametres |
| Pages métier non-sidebar | 13 | /leads, /devis, /factures, /projets, /taches, /services, /portfolio, /agenda, /messages, /support, /integrations, /documents, /notifications |
| Sous-module Prospection | 13 | /prospection/* |
| Sous-module Catalogue | 6 | /catalogue/* |
| Auth annexe | 1 | /auth/google/callback |

---

## 4. Fonctionnalités

### 4.1 Dashboard (`/`)

🟢 **CONSERVER** — Widget de synthèse KPIs
- Chiffre d'affaires (total paiements, revenus abonnements)
- Clients actifs
- Devis en attente
- Derniers leads / messages non lus
- Notifications en temps réel (Supabase Realtime)

### 4.2 Demandes & Devis (`/demandes`)

🟡 **SIMPLIFIER** — Page combinée actuellement :
- Reçoit les demandes de devis du formulaire contact (table `messages` ou `leads`)
- Crée/gère les devis
- Duplique la logique de `/devis`

**Fusion suggérée V2** : Section "Contacts & Demandes" unifiée. Les devis restent dans `/clients/:id/devis` (vue client) ou section Devis dédiée.

### 4.3 Leads (`/leads`)

🟡 **FUSIONNER** avec Demandes — Un lead vient du formulaire Loïc ou d'une demande manuelle. En V2 : regrouper leads + messages + demandes dans une section "Contacts entrants".

- Tables : `leads`, `clients` (conversion)
- Fonctions : `useLeads`, `useConvertLeadToClient`

### 4.4 Clients (`/clients`)

🟢 **CONSERVER** — Cœur du CRM :
- Fiche client complète (infos, devis, factures, paiements, projets, tickets, messages)
- Création manuelle de clients
- Conversion lead → client
- Lien Stripe (`stripe_customer_id`)

### 4.5 Devis (`/devis`)

🟡 **CONSOLIDER** — Actuellement accessible via `/devis` ET depuis Clients. En V2 : lister tous les devis depuis une vue dédiée mais unifier l'accès depuis la fiche client.

- Conversion devis → facture
- Items de devis (`devis_items`)
- Statuts : brouillon / envoyé / accepté / refusé

### 4.6 Factures (`/factures`)

🟢 **CONSERVER** — Module critique :
- Création depuis devis accepté
- Types : acompte (50%) / solde (50%) / unique / maintenance
- Envoi par email
- Génération PDF (vendor-pdf, chunk > 500 kB)
- Paiement Stripe (checkout unique)
- Paiement manuel (edge function `create-manual-payment`)
- Sync `amount_paid` via RPC atomique

### 4.7 Paiements (`/paiements`)

🟢 **CONSERVER** — Module critique :
- Historique de tous les paiements
- Filtres par client / méthode / statut
- Paiement manuel (`create-manual-payment`)
- Abonnements (`stripe-create-subscription`, `stripe-cancel-subscription`)
- Gestion Stripe (webhooks, sync)

### 4.8 Projets (`/projets`)

🟡 **SIMPLIFIER** — Gestion de projets liés aux clients :
- Liaison devis → projet
- Suivi avancement (0-100%)
- Statuts : en cours / terminé / en pause
- Sous-tâches (`/taches`, `project_tasks`)

**En V2** : intégrer la vue projets dans la fiche client plutôt que page dédiée, ou garder une liste globale dans Paramètres/Administration.

### 4.9 Tâches (`/taches`)

🟡 **SIMPLIFIER / INTÉGRER** — Tâches liées aux projets :
- Table `project_tasks` — 0 lignes en production
- Fonctionnalité utilisée marginalement

**En V2** : intégrer directement dans la fiche projet.

### 4.10 Services (`/services`)

🟡 **DÉPLACER** vers Paramètres :
- Référentiel des services internes CA-TECH (9 services en production)
- Utilisé dans les items de devis/facture
- Pas une vue opérationnelle quotidienne

### 4.11 Portfolio (`/portfolio`)

🔴 **RETIRER DE LA NAVIGATION PRINCIPALE** — optionnel :
- Projets portfolio public (vitrine CA-TECH)
- 0 lignes en production
- Peu lié au workflow CRM

**En V2** : intégrer dans Paramètres/Administration ou supprimer si non utilisé.

### 4.12 Agenda (`/agenda`)

🟡 **FUSIONNER** avec Google Workspace :
- Synchronisation avec Google Calendar
- Appointments (0 lignes en production)
- Calendrier des rendez-vous clients

**En V2** : regrouper avec Google Workspace (Gmail, Drive, Sheets).

### 4.13 Messages (`/messages`)

🟡 **FUSIONNER** avec Contacts & Demandes :
- Messages entrants (formulaire contact site vitrine)
- Réponse par email (edge function `send-reply-email`)
- Génération de réponse IA (`generate-reply`)
- 6 messages en production

### 4.14 Support (`/support`)

🔴 **RETIRER DE LA NAVIGATION** — peu utilisé :
- Tickets support client (`tickets`, `ticket_messages`)
- 0 tickets en production

**En V2** : conserver la logique (hook, table) mais ne pas exposer dans la navigation principale.

### 4.15 Documents (`/documents`)

🟡 **INTÉGRER** dans la fiche client :
- Storage Supabase `client-documents`
- 0 documents en production
- Plus pertinent dans le contexte d'un client spécifique

### 4.16 Notifications (`/notifications`)

🟡 **SIMPLIFIER** :
- `notification_logs` : 87 lignes (logs système, non critiques)
- Paramètres de canaux (email, Telegram, WhatsApp)
- En V2 : accessible via Paramètres, pas une page principale

### 4.17 Intégrations (`/integrations`)

🟢 **CONSERVER** mais déplacer :
- Diagnostic des intégrations Google (statut connexion)
- En V2 : intégrer dans Paramètres → Intégrations, ou section Google Workspace

### 4.18 Loïc IA (`/loic`)

🟢 **CONSERVER** — module IA différenciant :
- Conversations de diagnostic (`ai_conversations` : 8 lignes)
- Historique des diagnostics menés
- Lien vers leads générés
- Temps réel Supabase

### 4.19 Prospection (`/prospection/*`)

🟢 **CONSERVER** — module complet :
- 13 sous-pages (prospects, qualification, campagnes, relances, pipeline, connecteurs…)
- 25 prospects en production, 14 leads, 16 brouillons
- Intégration Apify (scraping), Google Drive, analyse IA

### 4.20 Catalogue (`/catalogue/*`)

🟡 **DÉPLACER** vers Paramètres :
- Services catalogue (10 lignes) et collaborateurs (6 lignes)
- Catalogue public de l'offre CA-TECH
- Données de référence, pas opérationnelles quotidiennement

### 4.21 Paramètres (`/parametres`)

🟢 **CONSERVER et ENRICHIR** :
- Profil utilisateur
- Notifications
- Sécurité
- En V2 : centraliser ici Catalogue, Services, Portfolio, Intégrations

---

## 5. Tables Supabase

### Tables avec données (27)

| Table | Lignes | Pages utilisatrices | Type données | Risque refonte |
|-------|--------|---------------------|--------------|----------------|
| `notification_logs` | 87 | Notifications | Logs système | BAS — logs non critiques |
| `devis_items` | 50 | Devis, Factures | Lignes devis | ÉLEVÉ — données financières |
| `audit_logs` | 40 | — (système) | Logs audit | BAS — système |
| `devis` | 33 | Devis, Clients, DemandesDevis | Devis clients | ÉLEVÉ — données financières |
| `prospects` | 25 | Prospection | Prospects commerciaux | MOYEN |
| `integration_logs` | 17 | Intégrations | Logs intégrations | BAS |
| `email_drafts` | 16 | Brouillons | Emails générés | BAS — données temporaires |
| `leads` | 14 | Leads, DemandesDevis | Leads entrants | MOYEN |
| `catalogue_services` | 10 | Catalogue | Services publics | BAS |
| `services` | 9 | Services | Services internes | BAS |
| `ai_conversations` | 8 | Loïc | Conversations Loïc | MOYEN |
| `catalogue_collaborateurs` | 6 | Catalogue | Collaborateurs publics | BAS |
| `messages` | 6 | Messages | Contacts entrants | MOYEN |
| `prospect_contacts` | 5 | Prospection | Contacts prospects | BAS |
| `calendar_events` | 5 | Agenda | Événements Google | BAS |
| `projects` | 4 | Projets, Clients | Projets clients | MOYEN |
| `invoice_items` | 4 | Factures | Lignes factures | ÉLEVÉ |
| `invoices` | 4 | Factures, Paiements | Factures clients | ÉLEVÉ |
| `payments` | 4 | Paiements, Factures | Paiements (Stripe + manuels) | ÉLEVÉ |
| `notification_settings` | 3 | Notifications | Config canaux notifs | BAS |
| `roles` | 3 | — (système) | Rôles utilisateurs | BAS |
| `clients` | 2 | Clients | Clients CA-TECH | CRITIQUE |
| `manager_users` | 1 | — (auth) | Accès manager | CRITIQUE |
| `notifications` | 1 | Notifications | Notifs in-app | BAS |
| `campaigns` | 1 | Campagnes | Campagnes email | BAS |
| `prospect_campaigns` | 1 | Campagnes | Enrôlement prospects | BAS |
| `google_integrations` | 1 | Intégrations | Tokens Google OAuth | ÉLEVÉ — sécurité |

### Tables vides (24) — données test ou fonctionnalités non activées

| Table | Lignes | Note |
|-------|--------|------|
| `tickets` | 0 | Support non activé |
| `documents` | 0 | Module non activé |
| `devis_relances` | 0 | Relances non utilisées (remplacé par email_drafts) |
| `appointments` | 0 | Agenda non alimenté manuellement |
| `quote_items` | 0 | Doublon de devis_items (ancienne structure ?) |
| `prospect_notes` | 0 | Notes dans metadata prospects |
| `prospect_tasks` | 0 | Non utilisé |
| `quotes` | 0 | Doublon de devis (ancienne structure ?) |
| `prospect_activities` | 0 | Log d'activités (non alimenté) |
| `subscriptions` | 0 | Aucun abonnement actif |
| `campaign_steps` | 0 | Campagne sans étapes |
| `loic_actions` | 0 | Actions Loïc non enregistrées |
| `users` | 0 | Doublon de auth.users (inutile ?) |
| `project_tasks` | 0 | Tâches non utilisées |
| `sheets_sync_config` | 0 | Sync Sheets non configuré |
| `sheets_sync_logs` | 0 | Logs Sheets vides |
| `client_contacts` | 0 | Contacts clients non utilisés |
| `lead_notes` | 0 | Notes leads dans metadata |
| `settings` | 0 | Non utilisé |
| `stripe_payment_links` | 0 | Non utilisé |
| `client_google_connections` | 0 | Connexions Google clients non utilisées |
| `app_settings` | 0 | Non utilisé |
| `email_templates` | 0 | Templates non créés |
| `portfolio_projects` | 0 | Portfolio vide |
| `ticket_messages` | 0 | Messages tickets vides |

---

## 6. Hooks et services

### 6.1 Hooks React (33 fichiers)

| Fichier | Hooks exportés | Tables | Edge Functions | Intégrations |
|---------|---------------|--------|----------------|-------------|
| `useAgenda.ts` | useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment | `appointments`, `clients` | — | Google Calendar |
| `useApify.ts` | useApifyConnection, useApifyUserActors, useApifyRun, useApifyImport | `prospects` | — | Apify API |
| `useAudit.ts` | useRunAudit, useSaveAudit | `prospects` | `audit-site` | — |
| `useCalendarEvents.ts` | useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent, useSyncCalendarEvents | — | `google-calendar` | Google Calendar |
| `useCampagnes.ts` | useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useDuplicateCampaign, useCreateStep, useUpdateStep, useDeleteStep, useEnrollProspect, useRemoveProspect | `campaigns`, `campaign_steps`, `prospect_campaigns`, `prospects` | — | — |
| `useCatalogueCollaborateurs.ts` | useCatalogueCollaborateurs, useCatalogueCollaborateurById, useCreateCatalogueCollaborateur, useUpdateCatalogueCollaborateur, useToggleCatalogueCollaborateurVisible, useDeleteCatalogueCollaborateur, useDuplicateCatalogueCollaborateur | `catalogue_collaborateurs` | — | Storage catalogue |
| `useCatalogueServices.ts` | useCatalogueServices, useCatalogueServiceById, useCreateCatalogueService, useUpdateCatalogueService, useToggleCatalogueVisible, useDeleteCatalogueService, useDuplicateCatalogueService | `catalogue_services` | — | Storage catalogue |
| `useClients.ts` | useClients, useCreateClient, useUpdateClient, useDeleteClient, useClientProjets, useClientDevis, useClientFactures, useClientPaiements, useClientTickets, useClientMessages | `clients`, `projects`, `devis`, `invoices`, `payments`, `tickets`, `messages` | — | — |
| `useConnectors.ts` | useConnectors, useConnectorRunning, useConnectorLogs, useTestConnector, useRunImport, useRunSync, useRunUpdate, useConfigureConnector | — | — | Apify, connecteurs |
| `useDashboardRealtime.ts` | useDashboardRealtime, useEmailEvents | `prospects`, `prospect_activities`, `email_drafts`, `campaigns`, `devis` | — | Supabase Realtime |
| `useDevis.ts` | useDevis, useUpdateDevisStatus, useCreateDevis, useUpdateDevis, useDeleteDevis, useDuplicateDevis, useConvertDevisToFacture | `devis`, `clients`, `devis_items`, `invoices`, `invoice_items` | — | — |
| `useDocuments.ts` | useDocuments, useUploadDocuments, useDeleteDocument, useAllDocuments, useDocumentInsertListener | `documents` | — | Storage client-documents |
| `useEmailDrafts.ts` | useEmailDrafts, useEmailDraftsRealtime, useCreateDraft, useUpdateDraft, useSetDraftStatus, useDeleteDraft, useSendDraft, useGenerateEmailDraft, useProspectsForDraft, useRelanceDrafts, useGenerateRelances, useAllProspects | `email_drafts`, `prospects`, `prospect_contacts` | `gmail-send`, `generate-email`, `generate-relances` | Gmail |
| `useFactures.ts` | useFactures, useFacturePayments, useCreateFacture, useUpdateFacture, useUpdateFactureStatus, useEnvoyerFacture, useEnregistrerPaiement, useCreateStripeCheckout, useDevisInvoices, useCreateStripeProjectPayment, useDeleteFacture, useDuplicateFacture | `invoices`, `clients`, `invoice_items`, `payments`, `devis` | `create-manual-payment`, `stripe-create-checkout`, `stripe-create-payment` | Stripe |
| `useGmailSend.ts` | useGmailSend | — | `gmail-send` | Gmail |
| `useGoogleDrive.ts` | useCreateDriveFolder | `prospects` | `google-drive` | Google Drive |
| `useGoogleIntegration.ts` | useGoogleIntegration | `google_integrations` | `google-oauth` | Google OAuth 2.0 |
| `useInAppNotifications.ts` | useInAppNotifications, useUnreadNotificationCount, useInAppNotificationsRealtime, useMarkNotificationRead, useMarkAllNotificationsRead | `notifications` | — | Supabase Realtime |
| `useIntegrations.ts` | useIntegrationStatus, useTestConnections, useAutoFix | `integration_logs`, `integration_settings` | `integration-health` | Google suite |
| `useLeads.ts` | useLeads, useCreateLead, useUpdateLead, useUpdateLeadStatus, useDeleteLead, useLeadsRealtime, useConvertLeadToClient | `leads`, `clients` | — | — |
| `useLoic.ts` | useLoicConversations, useCreateLoicConversation, useUpdateLoicConversation, useDeleteLoicConversation | `ai_conversations` | — | Supabase Realtime |
| `useMessages.ts` | useMessages, useMarkMessage, useMarkAllRead, useReplyMessage, useArchiveMessage, useCreateMessage, useLinkMessageToLead, useDeleteMessage, useMessagesRealtime, useUnreadMessageCount, useGenerateReply | `messages` | `send-reply-email`, `generate-reply` | Resend/Brevo, Claude IA |
| `useNotifications.ts` | useNotifications, useNotificationSettings, useUpdateNotificationChannel | `notification_logs`, `notification_settings` | — | Email, Telegram, WhatsApp |
| `usePaiements.ts` | usePaiements, useClientInvoicesForPayment, useCreatePaiement, useDeletePaiement | `payments`, `clients`, `invoices` | `create-manual-payment` | Stripe |
| `usePortfolio.ts` | usePortfolioItems, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem, useToggleFeatured, useTogglePublished | `portfolio_projects` | — | Storage portfolio |
| `useProjets.ts` | useProjets, useCreateProjet, useUpdateProjet, useUpdateProjetProgress, useUpdateProjetStatus, useDeleteProjet, useProjetDevis, useProjetFactures | `projects`, `clients`, `devis`, `invoices` | — | — |
| `useProspects.ts` | useProspects, useProspectsRealtime, useCreateProspect, useUpdateProspect, useDeleteProspect, useAddActivity, useSaveNotes, useSaveRelances, useAutoAnalyse, useAnalyseProspect, useQualifyProspect | `prospects`, `prospect_activities`, `prospect_contacts` | `google-drive`, `analyse-prospect` | Google Drive, Claude IA |
| `useRecommendations.ts` | useGenerateRecommendations, useSaveRecommendations | `prospects` | `recommend-prospect` | Claude IA |
| `useServices.ts` | useServices, useServiceStats, useCreateService, useUpdateService, useDeleteService | `services`, `devis_items`, `invoice_items` | — | — |
| `useSubscriptions.ts` | useSubscriptions, useCreateSubscriptionCheckout, useCancelSubscription | `subscriptions`, `clients` | `stripe-create-subscription`, `stripe-cancel-subscription` | Stripe |
| `useSheetsSync.ts` | (sync bidirectionnel Google Sheets) | `sheets_sync_config`, `sheets_sync_logs` | — | Google Sheets |
| `useTickets.ts` | (gestion tickets support) | `tickets`, `ticket_messages` | — | — |
| `useTaches.ts` | (gestion tâches projets) | `project_tasks` | — | — |

### 6.2 Edge Functions Deno (10)

| Fonction | verify_jwt | Tables | Intégrations | Rôle |
|----------|-----------|--------|--------------|------|
| `contact-form` | ❌ (public) | `messages` | Resend, Brevo | Réception formulaire contact vitrine |
| `create-manual-payment` | ✅ + IDOR manager_users | `payments`, `invoices` | — | Paiement manuel validé serveur (P1 sécurisé) |
| `google-oauth` | ✅ | `google_integrations` | Google OAuth 2.0 | Connexion/déconnexion Google |
| `loic-chat` | ❌ (public — chatbot vitrine) | `ai_conversations`, `leads`, `devis`, `clients` | Claude Haiku, Resend, Brevo | Diagnostic IA Loïc (8 questions → score → lead) |
| `send-reply-email` | ❌ | `messages` | Resend, Brevo | Réponse email au contact |
| `stripe-cancel-subscription` | ✅ + IDOR | `subscriptions`, `manager_users` | Stripe | Annulation abonnement |
| `stripe-create-checkout` | ✅ + IDOR | `invoices`, `clients`, `manager_users` | Stripe | Checkout Stripe paiement unique (montant DB) |
| `stripe-create-payment` | ✅ + IDOR | `devis`, `invoices`, `clients`, `manager_users` | Stripe | Acompte/solde depuis devis accepté |
| `stripe-create-subscription` | ✅ + IDOR | `clients`, `subscriptions`, `manager_users` | Stripe | Abonnement mensuel (plans serveur) |
| `stripe-webhook` | ❌ (signature Stripe) | `subscriptions`, `payments`, `invoices` | Stripe + RPC sync_invoice_after_payment | Traitement webhooks Stripe (v18) |

### 6.3 Fonctions Loïc IA

Le module Loïc couvre :
1. **`loic-chat`** (edge) — chatbot public, 8 questions, score maturité IA 0-100, 4 dimensions
2. **`useLoic.ts`** — historique des conversations manager-side
3. **`useGenerateEmailDraft`** — génération IA de brouillons email pour prospects
4. **`useGenerateRelances`** — génération IA de séquences de relance
5. **`useGenerateReply`** — génération IA de réponses aux messages entrants
6. **`useAutoAnalyse`** / **`useAnalyseProspect`** — analyse technique du site prospect
7. **`useRecommendations`** — recommandations commerciales IA par prospect

### 6.4 Fonctions Prospection

Workflow complet :
```
Apify scraping → Import prospects (useApifyImport)
→ Auto-analyse site (useAutoAnalyse → analyse-prospect)
→ Qualification commerciale (useQualifyProspect)
→ Campagne email drip (useCampaignes → useEmailDrafts)
→ Génération IA emails (useGenerateEmailDraft → generate-email)
→ Envoi Gmail (useSendDraft → gmail-send)
→ Relances (useRelanceDrafts → generate-relances)
→ Conversion lead → client (useConvertLeadToClient)
→ Devis → facture → paiement Stripe
```

---

## 7. Données à préserver

### 7.1 Données financières (CRITIQUES)

| Donnée | Table | Lignes | Note |
|--------|-------|--------|------|
| Clients | `clients` | 2 | Liés aux factures, paiements, Stripe |
| Devis | `devis` | 33 | Historique complet |
| Lignes de devis | `devis_items` | 50 | Détail devis |
| Factures | `invoices` | 4 | dont FAC-2026-0001 à 0004 (`amount_paid=180, status=paid`) |
| Lignes factures | `invoice_items` | 4 | Détail factures |
| Paiements | `payments` | 4 | 4 stripe_payment_id distincts — jamais supprimer |
| Abonnements | `subscriptions` | 0 | Aucun actif |

> ⚠️ Les 4 invoices FAC-2026-0001 à 0004 ont `amount_paid=180, status=paid` sans payment record lié (drift connu). Ne jamais appeler `sync_invoice_after_payment` sur ces factures sans réconciliation préalable.

### 7.2 Données CRM

| Donnée | Table | Lignes |
|--------|-------|--------|
| Leads entrants | `leads` | 14 |
| Messages contact | `messages` | 6 |
| Projets | `projects` | 4 |

### 7.3 Données Loïc IA

| Donnée | Table | Lignes |
|--------|-------|--------|
| Conversations diagnostic | `ai_conversations` | 8 |
| Actions Loïc | `loic_actions` | 0 |

### 7.4 Données Prospection

| Donnée | Table | Lignes |
|--------|-------|--------|
| Prospects | `prospects` | 25 |
| Contacts prospects | `prospect_contacts` | 5 |
| Activités prospects | `prospect_activities` | 0 |
| Brouillons email | `email_drafts` | 16 |
| Campagnes | `campaigns` | 1 |
| Enrôlements | `prospect_campaigns` | 1 |

### 7.5 Connexions Google

| Donnée | Table | Lignes |
|--------|-------|--------|
| Token OAuth Google | `google_integrations` | 1 |
| Événements calendar | `calendar_events` | 5 |

### 7.6 Catalogue et référentiels

| Donnée | Table | Lignes |
|--------|-------|--------|
| Services catalogue | `catalogue_services` | 10 |
| Collaborateurs | `catalogue_collaborateurs` | 6 |
| Services internes | `services` | 9 |

---

## 8. Éléments redondants ou inutiles

### 8.1 Tables en doublon structurel

| Table | Doublon de | Action recommandée |
|-------|-----------|-------------------|
| `quotes` (0 lignes) | `devis` | Vestige ancienne structure — NE PAS SUPPRIMER sans audit complet |
| `quote_items` (0 lignes) | `devis_items` | Idem |
| `users` (0 lignes) | `auth.users` | Probablement inutile — vérifier avant refonte |
| `devis_relances` (0 lignes) | `email_drafts` (metadata.is_relance) | Fonctionnalité migrée vers email_drafts |
| `prospect_notes` (0 lignes) | `prospects.metadata` | Notes stockées en JSON |
| `lead_notes` (0 lignes) | `leads.metadata` probable | Non utilisé |
| `client_contacts` (0 lignes) | `prospect_contacts` / clients | Non alimenté |
| `settings` / `app_settings` (0 lignes) | — | Non utilisé dans le code |

### 8.2 Pages en doublon fonctionnel

| Page V1 | Doublon de | Note |
|---------|-----------|------|
| `/devis` | Sous-onglet dans `/clients/:id` | Même données, deux accès |
| `/factures` | Sous-onglet dans `/clients/:id` et `/paiements` | Même données |
| `/leads` | Sous-section de `/demandes` | Logique similaire |
| `/services` | `/catalogue/services` | Services internes vs catalogue public — distincts mais visuellement proches |

### 8.3 Fonctionnalités non activées en production

| Fonctionnalité | État | Tables concernées |
|---------------|------|------------------|
| Tickets support | 0 tickets, 0 messages ticket | `tickets`, `ticket_messages` |
| Portfolio public | 0 projets | `portfolio_projects` |
| Documents clients | 0 documents | `documents` |
| Tâches projets | 0 tâches | `project_tasks` |
| Sync Google Sheets | Non configuré | `sheets_sync_config`, `sheets_sync_logs` |
| Abonnements actifs | 0 abonnements | `subscriptions` |

---

## 9. Architecture V2

La V2 réorganise le Manager autour de 9 sections cohérentes. La logique : regrouper par workflow métier, pas par table technique.

### Section 1 — Dashboard

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| KPIs CA, clients, devis | `/` (Dashboard) | 🟢 Conserver, enrichir |
| Leads récents | `/leads` (widget) | 🟢 Fusionner dans dashboard |
| Messages non lus | `/messages` (badge) | 🟢 Conserver widget |
| Notifications realtime | in-app | 🟢 Conserver |

**Tables :** `clients`, `devis`, `invoices`, `payments`, `leads`, `messages`, `notifications`

---

### Section 2 — Contacts & Demandes

Regroupe toute la partie "entrants" : formulaires du site, leads, messages, conversion.

| Élément | Pages actuelles fusionnées | Action |
|---------|--------------------------|--------|
| Demandes de formulaire | `/demandes` | 🟡 Fusionner |
| Leads Loïc | `/leads` | 🟡 Fusionner |
| Messages contact | `/messages` | 🟡 Fusionner |
| Réponse email IA | Messages (generate-reply) | 🟢 Conserver |
| Conversion lead → client | Leads | 🟢 Conserver |

**Tables :** `leads`, `messages`, `clients`
**Hooks :** `useLeads`, `useMessages`, `useGmailSend`

---

### Section 3 — Clients

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| Liste clients | `/clients` | 🟢 Conserver |
| Fiche client (devis, factures, paiements, projets, messages) | Sous-onglets Clients | 🟢 Conserver, enrichir |
| Création client | Modal dans /clients | 🟢 Conserver |

**Tables :** `clients`, `devis`, `invoices`, `payments`, `projects`, `messages`
**Pages retirées de la nav :** `/leads` (fusionné §2)

---

### Section 4 — Devis

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| Liste globale devis | `/devis` | 🟢 Conserver (vue transversale utile) |
| Création / édition devis | `/devis`, modal | 🟢 Conserver |
| Conversion devis → facture | useDevis | 🟢 Conserver |
| Items et services | `devis_items`, `services` | 🟢 Conserver |

**Tables :** `devis`, `devis_items`, `invoice_items`, `services`, `clients`

---

### Section 5 — Paiements & Abonnements

| Élément | Pages actuelles fusionnées | Action |
|---------|--------------------------|--------|
| Factures | `/factures` | 🟢 Conserver |
| Paiements | `/paiements` | 🟢 Conserver |
| Abonnements | Sous-section de /paiements | 🟢 Conserver |
| Checkout Stripe | Edge functions | 🟢 Conserver |
| Paiement manuel | create-manual-payment | 🟢 Conserver (sécurisé) |

**Tables :** `invoices`, `invoice_items`, `payments`, `subscriptions`, `clients`
**Edge Functions :** `create-manual-payment`, `stripe-create-checkout`, `stripe-create-payment`, `stripe-create-subscription`, `stripe-cancel-subscription`, `stripe-webhook`

---

### Section 6 — Loïc IA

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| Historique conversations | `/loic` | 🟢 Conserver |
| Détail conversation + score | Loic sous-vues | 🟢 Conserver |
| Génération email | Prospection/Brouillons | 🟢 Conserver (mutualisé) |
| Génération relances | Prospection | 🟢 Conserver |
| Réponse aux messages | Messages | 🟢 Conserver |

**Tables :** `ai_conversations`, `leads`, `devis`
**Edge Functions :** `loic-chat`, `generate-email`, `generate-relances`, `generate-reply`, `recommend-prospect`

---

### Section 7 — Prospection

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| Dashboard commercial | `/prospection` | 🟢 Conserver |
| Dashboard IA | `/prospection/ia` | 🟢 Conserver |
| Liste prospects | `/prospection/prospects` | 🟢 Conserver |
| Détail prospect | `/prospection/prospects/:id` | 🟢 Conserver |
| Recherche & import Apify | `/prospection/recherche` | 🟢 Conserver |
| Qualification | `/prospection/qualification` | 🟢 Conserver |
| Pipeline | `/prospection/pipeline` | 🟢 Conserver |
| Brouillons | `/prospection/brouillons` | 🟢 Conserver |
| Campagnes | `/prospection/campagnes` | 🟢 Conserver |
| Relances | `/prospection/relances` | 🟢 Conserver |
| Statistiques | `/prospection/statistiques` | 🟢 Conserver |
| Connecteurs | `/prospection/connecteurs` | 🟢 Conserver |
| Configuration | `/prospection/config` | 🟡 Déplacer vers Paramètres optionnellement |

**Tables :** `prospects`, `prospect_contacts`, `prospect_activities`, `prospect_campaigns`, `email_drafts`, `campaigns`, `campaign_steps`
**Intégrations :** Apify, Google Drive, Claude IA

---

### Section 8 — Google Workspace

Regroupe toutes les intégrations Google, actuellement dispersées dans Intégrations, Agenda, Documents.

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| Connexion OAuth | `/integrations` | 🟡 Consolider ici |
| Diagnostic intégrations | `/integrations` | 🟡 Consolider |
| Agenda / Calendar | `/agenda` | 🟡 Fusionner |
| Documents clients | `/documents` | 🟡 Fusionner (ou dans fiche client) |
| Drive prospects | useGoogleDrive | 🟢 Conserver (interne) |
| Gmail envoi | useGmailSend | 🟢 Conserver (interne) |

**Tables :** `google_integrations`, `calendar_events`, `documents`
**Edge Functions :** `google-oauth`, `google-calendar`, `google-drive`, `gmail-send`

---

### Section 9 — Paramètres

| Élément | Pages actuelles | Action |
|---------|----------------|--------|
| Profil utilisateur | `/parametres` | 🟢 Conserver |
| Notifications (canaux) | `/notifications` | 🟡 Intégrer ici |
| Sécurité / MFA | `/parametres` | 🟢 Conserver |
| Catalogue services | `/catalogue/services` | 🟡 Déplacer ici |
| Catalogue collaborateurs | `/catalogue/collaborateurs` | 🟡 Déplacer ici |
| Services internes | `/services` | 🟡 Déplacer ici |
| Portfolio | `/portfolio` | 🔴 Retirer nav ou déplacer ici |
| Intégrations (si non §8) | `/integrations` | 🟡 Déplacer ici |

**Tables :** `notification_settings`, `notification_logs`, `catalogue_services`, `catalogue_collaborateurs`, `services`, `portfolio_projects`

---

### Comparaison navigation V1 → V2

| Navigation V1 (sidebar) | Navigation V2 (sidebar) |
|------------------------|------------------------|
| Vue d'ensemble | Dashboard |
| Demandes & Devis | Contacts & Demandes |
| Clients | Clients |
| Paiements | Devis |
| Loïc IA | Paiements & Abonnements |
| Prospection | Loïc IA |
| Paramètres (bottom) | Prospection |
| — | Google Workspace |
| — | Paramètres (bottom) |

Pages retirées de la navigation principale (logique conservée, accessibles depuis la fiche client ou section parent) : `/leads`, `/factures`, `/projets`, `/taches`, `/agenda`, `/messages`, `/support`, `/documents`, `/notifications`, `/integrations`, `/services`, `/portfolio`, `/catalogue/*`

---

## 10. Plan de migration

### Principes

1. Aucune donnée supprimée — les tables restent intactes
2. Les routes V1 restent actives en parallèle pendant la migration (pas de breaking change)
3. Migration par étapes — chaque étape est indépendante et rollbackable
4. Les hooks et edge functions ne changent pas — seule la navigation/UI change

---

### Étape 1 — Refonte navigation sidebar

**Durée estimée :** 1 sprint
**Fichiers :** `Sidebar.tsx`, `App.tsx`, `Layout.tsx`

| Tâche | Détail |
|-------|--------|
| Ajouter 3 entrées sidebar | Devis, Google Workspace, (réorganiser) |
| Retirer entrée `/demandes` | Remplacer par `/contacts` |
| Ajouter sous-menus sidebar | Contacts, Paiements (factures + abonnements) |
| Mettre à jour `App.tsx` | Nouvelles routes V2 en parallèle des anciennes |

**Fonctionnalités conservées :** toutes
**Fonctionnalités supprimées de l'interface :** aucune — seulement réorganisation des liens
**Risques :** faible — liens existants continuent de fonctionner
**Rollback :** remettre Sidebar.tsx en état V1

---

### Étape 2 — Fusion Contacts & Demandes

**Durée estimée :** 1-2 sprints
**Fichiers :** `pages/Contacts.tsx` (NOUVEAU), `pages/DemandesDevis.tsx`, `pages/Leads.tsx`, `pages/Messages.tsx`

| Tâche | Détail |
|-------|--------|
| Créer page `/contacts` | Tableau unifié : leads + messages + demandes |
| Onglets dans Contacts | Tous / Leads / Messages / Demandes |
| Conserver routes V1 | `/leads`, `/messages`, `/demandes` redirigent vers `/contacts` |
| Conserver tous les hooks | useLeads, useMessages, usePaiements — inchangés |

**Données concernées :** `leads` (14), `messages` (6)
**Risques :** faible — logique hooks inchangée
**Rollback :** supprimer page Contacts, routes V1 déjà actives

---

### Étape 3 — Page Devis dans sidebar

**Durée estimée :** 0.5 sprint
**Fichiers :** `Sidebar.tsx`

| Tâche | Détail |
|-------|--------|
| Ajouter `/devis` à la sidebar | La page existe déjà |
| Mettre en avant depuis `/clients` | Lien rapide vers liste globale |

**Risques :** nul — page existante
**Rollback :** retirer l'entrée sidebar

---

### Étape 4 — Section Paiements & Abonnements unifiée

**Durée estimée :** 1-2 sprints
**Fichiers :** `pages/Paiements.tsx`, `pages/Factures.tsx` (fusion dans une seule section)

| Tâche | Détail |
|-------|--------|
| Ajouter onglets dans Paiements | Paiements / Factures / Abonnements |
| Rendre `/factures` accessible via `/paiements` | Onglet Factures |
| Conserver route `/factures` | Redirige vers `/paiements?tab=factures` |

**Données concernées :** `invoices` (4), `payments` (4), `subscriptions` (0)
**Risques :** moyen — la page Factures a de la logique complexe (PDF, Stripe, RPC)
**Rollback :** garder route `/factures` indépendante

---

### Étape 5 — Section Google Workspace

**Durée estimée :** 1 sprint
**Fichiers :** `pages/GoogleWorkspace.tsx` (NOUVEAU), `pages/Integrations.tsx`, `pages/Agenda.tsx`, `pages/Documents.tsx`

| Tâche | Détail |
|-------|--------|
| Créer page `/google` | Onglets : Statut / Agenda / Documents |
| Intégrer diagnostic OAuth | Depuis /integrations |
| Intégrer calendar | Depuis /agenda |
| Intégrer documents | Depuis /documents |

**Données concernées :** `google_integrations` (1), `calendar_events` (5), `documents` (0)
**Risques :** faible — données peu critiques
**Rollback :** routes /integrations, /agenda, /documents restent actives

---

### Étape 6 — Paramètres enrichis

**Durée estimée :** 1 sprint
**Fichiers :** `pages/Parametres.tsx`

| Tâche | Détail |
|-------|--------|
| Ajouter onglets dans Paramètres | Profil / Notifications / Catalogue / Services / Portfolio |
| Intégrer `/catalogue/*` | Sous-section Paramètres |
| Intégrer `/services` | Référentiel interne |
| Intégrer `/notifications` | Canaux de notification |

**Risques :** faible — déplacement de pages existantes
**Rollback :** routes /catalogue/*, /services, /notifications restent actives

---

### Étape 7 — Nettoyage et dépréciations

**Durée estimée :** 1 sprint — après validation des étapes 1-6 en production

| Tâche | Détail |
|-------|--------|
| Supprimer les redirections V1 | Une fois navigation V2 stable |
| Nettoyer tables vides | `quotes`, `quote_items`, `users` — après audit complet |
| Archiver pages orphelines | Support, Portfolio si non utilisés |

**Risques :** modéré — vérifier que no lien externe ne pointe vers routes V1

---

## 11. Risques

### Risques ÉLEVÉS

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Corruption données factures/paiements | Faible | Critique | Ne jamais modifier tables financières sans backup — RLS en place |
| Drift FAC-2026-0001 à 0004 aggravé | Faible | Élevé | Ne jamais appeler sync_invoice_after_payment sans réconciliation |
| Token Google OAuth révoqué | Moyen | Élevé | 1 seule connexion Google en DB — si révoquée, réauthentifier |
| Stripe webhook rate (double paiement) | Faible | Élevé | Idempotence en place (stripe_payment_id UNIQUE) |

### Risques MOYENS

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Régression hooks lors refonte pages | Moyen | Moyen | Ne pas modifier les hooks — seulement les pages/navigation |
| Casse routes V1 (bookmarks) | Moyen | Moyen | Garder redirections V1 actives pendant 1 version |
| RLS notifications insuffisante | Faible | Moyen | auth_all supprimé (Sprint 10.11) — RLS user-scoped active |

### Risques FAIBLES

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Tables vides supprimées accidentellement | Faible | Faible | Ne pas exécuter de migrations sans validation explicite |
| Perte données Loïc (ai_conversations) | Faible | Faible | 8 conversations — pas de FK critique |
| Build regression après refonte | Faible | Faible | tsc + vite build à chaque étape |

### Dépendances critiques à ne pas casser

1. **`manager_users`** (1 ligne) — table d'IDOR pour toutes les edge functions protégées. Si cette ligne est supprimée, toutes les mutations échouent en 403.
2. **`stripe_payment_id` UNIQUE** — index d'idempotence. Ne jamais DROP.
3. **`sync_invoice_after_payment`** — fonction SQL (migration 019). Ne pas DROP pendant refonte.
4. **`auth_all` policies** — déjà supprimées (Sprint 10.11). Ne pas recréer.
5. **RLS `Authenticated full access`** sur clients/invoices/payments — seule policy active. Si supprimée sans remplacement, toutes les lectures échouent.

---

## Contrôle final

| Vérification | Résultat |
|-------------|---------|
| Fichiers supprimés | 0 |
| Fichiers modifiés | 0 |
| Tables modifiées | 0 |
| Données supprimées | 0 |
| Migrations exécutées | 0 |

---

*SPRINT 11.1 TERMINÉ — AUDIT COMPLET — AUCUNE MODIFICATION EFFECTUÉE*
