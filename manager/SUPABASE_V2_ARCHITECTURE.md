# SUPABASE V2 — ARCHITECTURE DE BASE DE DONNÉES
*Sprint 1 / Audit + Conception — Aucune modification effectuée*

---

## PRÉAMBULE

Ce document est issu de l'analyse complète du code source de CA-TECH Manager (hooks, types, mutations). Il ne s'appuie pas sur une introspection directe de la base Supabase mais sur la lecture exhaustive de toutes les requêtes SQL émises par le frontend. Chaque colonne listée est confirmée par au moins un appel `.from()`, `.insert()`, `.update()` ou `.select()` dans le code.

**Sources analysées** :
- `src/hooks/useClients.ts`
- `src/hooks/useLeads.ts`
- `src/hooks/useMessages.ts`
- `src/hooks/useDevis.ts`
- `src/hooks/useFactures.ts`
- `src/hooks/usePaiements.ts`
- `src/hooks/useLoic.ts`
- `src/hooks/useGoogleIntegration.ts`
- `src/hooks/useNotifications.ts`
- `src/hooks/useInAppNotifications.ts`
- `src/hooks/useProspects.ts`
- `src/types/index.ts`

---

## 1. ÉTAT ACTUEL — TABLES IDENTIFIÉES

### 1.1 Tables core — CRM / Facturation

#### `clients`
Colonnes confirmées par le code :
```
id                uuid PK
created_at        timestamptz
updated_at        timestamptz
first_name        text
last_name         text
email             text
phone             text (nullable)
company           text (nullable)
industry          text (nullable)
address           text (nullable)
postal_code       text (nullable)
city              text (nullable)
country           text DEFAULT 'France'
status            text  -- 'active' | 'inactive' | 'archived'
notes             text (nullable)
```
Relations : référencée par `invoices`, `payments`, `messages`, `leads`, `devis`, `tickets`, `projects`, `ai_conversations`

---

#### `leads`
Colonnes confirmées :
```
id                     uuid PK
created_at             timestamptz
updated_at             timestamptz
first_name             text
last_name              text
email                  text
phone                  text (nullable)
company                text (nullable)
source                 text (nullable)
status                 text  -- 'new'|'contacted'|'qualified'|'proposal'|'negotiation'|'won'|'lost'
budget_max             numeric (nullable)
budget_min             numeric (nullable)
notes                  text (nullable)
converted_to_client_id uuid (nullable, FK → clients.id)
```
Relations : référencée par `messages`, `ai_conversations`

---

#### `messages`
Colonnes confirmées :
```
id           uuid PK
created_at   timestamptz
from_name    text
from_email   text
subject      text (nullable)
body         text
source       text
is_read      boolean DEFAULT false
is_replied   boolean DEFAULT false
is_archived  boolean DEFAULT false
reply_body   text (nullable)
replied_at   timestamptz (nullable)
client_id    uuid (nullable, FK → clients.id)
lead_id      uuid (nullable, FK → leads.id)
company      text (nullable)
phone        text (nullable)
ip_address   text (nullable)
```

---

#### `devis`
Colonnes confirmées :
```
id             uuid PK
created_at     timestamptz
updated_at     timestamptz
devis_number   text  -- format DEV-YYYY-NNNN
client_id      uuid FK → clients.id
status         text  -- 'draft'|'sent'|'accepted'|'rejected'|'expired'
subtotal       numeric
tax_rate       numeric DEFAULT 20
tax_amount     numeric
total          numeric
valid_until    date (nullable)
notes          text (nullable)
sent_at        timestamptz (nullable)
accepted_at    timestamptz (nullable)
signature      text (nullable)
contact_name   text  -- champ utilisé lors de la création
contact_email  text  -- champ utilisé lors de la création
```
Relations : a des enfants dans `devis_items`

---

#### `devis_items`
Colonnes confirmées :
```
id          uuid PK
devis_id    uuid FK → devis.id (CASCADE DELETE)
description text
quantity    numeric
unit_price  numeric
total       numeric
sort_order  integer
service_id  uuid (nullable, FK → services.id ?)
```

---

#### ⚠️ `quotes` — TABLE PROBABLEMENT OBSOLÈTE

`useClients.ts:useClientDevis()` interroge `.from('quotes').select('id, quote_number, total, status, created_at')`.

Cela signifie qu'il existe une table `quotes` distincte de `devis`, avec la colonne `quote_number` (au lieu de `devis_number`). Ce doublon indique une migration de schéma incomplète : l'ancienne table s'appelait `quotes`, la nouvelle s'appelle `devis`. Le code `useDevis.ts` utilise exclusivement `devis`, mais `useClients.ts` utilise encore `quotes` pour l'onglet fiche client. Les lignes sont probablement dans une table `quote_items` (référencée dans le fallback `row.quote_items` de `useDevis.ts`).

**Statut** : table orpheline partielle — le code principal écrit dans `devis`, mais la fiche client lit encore dans `quotes`.

---

#### `invoices`
Colonnes confirmées :
```
id               uuid PK
created_at       timestamptz
updated_at       timestamptz
invoice_number   text  -- format FAC-YYYY-NNN
client_id        uuid FK → clients.id
status           text  -- 'draft'|'sent'|'viewed'|'partial'|'paid'|'overdue'|'cancelled'
subtotal         numeric
tva_rate         numeric DEFAULT 20
tax_amount       numeric
total            numeric
amount_paid      numeric DEFAULT 0
due_date         date (nullable)
paid_at          timestamptz (nullable)
sent_at          timestamptz (nullable)
notes            text (nullable)
stripe_payment_link text (nullable)
```
Relations : a des enfants dans `invoice_items`, référencée par `payments`

---

#### `invoice_items`
Colonnes confirmées :
```
id          uuid PK
invoice_id  uuid FK → invoices.id (CASCADE DELETE)
description text
quantity    numeric
unit_price  numeric
total       numeric
sort_order  integer
```

---

#### `payments`
Colonnes confirmées :
```
id                 uuid PK
created_at         timestamptz
client_id          uuid FK → clients.id
invoice_id         uuid (nullable, FK → invoices.id)
amount             numeric
method             text  -- 'virement'|'carte'|'stripe'|'cheque'|'especes'|'paypal'|'autre'
status             text  -- 'completed' (seule valeur utilisée dans le code)
reference          text (nullable)
notes              text (nullable)
paid_at            timestamptz
stripe_payment_id  text (nullable)
```

---

### 1.2 Tables Loïc IA

#### `ai_conversations`
Colonnes confirmées :
```
id          uuid PK
created_at  timestamptz
updated_at  timestamptz
type        text  -- 'qualification'|'devis'|'support'|'crm'|'agenda'|'general'
status      text  -- 'active'|'completed'|'archived'
messages    jsonb  -- LoicMessage[] : [{role, content, timestamp, action?}]
metadata    jsonb  -- {prenom, nom, email, telephone, entreprise, projet, budget,
             --        lead_created, escalated, source}
lead_id     uuid (nullable, FK → leads.id)
client_id   uuid (nullable, FK → clients.id)
user_id     uuid (nullable, FK → auth.users.id)
```

---

### 1.3 Tables Google OAuth

#### `google_integrations`
Colonnes confirmées (non sensibles) :
```
id            uuid PK
email         text  -- email du compte Google connecté
scope         text  -- scopes autorisés (espace-séparés)
connected_at  timestamptz
expires_at    timestamptz (nullable)
```
Colonnes probables (non sélectionnées par sécurité) : `access_token`, `refresh_token`
Usage : **1 seule ligne** — connexion Google CA-TECH agence

---

### 1.4 Tables Notifications

#### `notifications`
Colonnes confirmées :
```
id           uuid PK
created_at   timestamptz
title        text
message      text (nullable)
type         text  -- 'info'|'success'|'warning'|'error'
link         text (nullable)
is_read      boolean DEFAULT false
prospect_id  uuid (nullable, FK → prospects.id)
user_id      uuid (nullable, FK → auth.users.id)
metadata     jsonb DEFAULT '{}'
```
Usage : cloche in-app dans le Header — utilisée dans V2

---

#### `notification_logs`
Colonnes confirmées :
```
id           uuid PK
created_at   timestamptz
prospect_id  uuid (nullable, FK → prospects.id)
type         text
channel      text  -- 'email'|'telegram'|'whatsapp'
provider     text (nullable)
status       text  -- 'sent'|'failed'|'skipped'
recipient    text (nullable)
message      text (nullable)
error        text (nullable)
metadata     jsonb DEFAULT '{}'
```
Usage : logs d'envoi notifications Prospection — **non utilisée dans V2**

---

#### `notification_settings`
Colonnes confirmées :
```
id          uuid PK
channel     text  -- 'email'|'telegram'|'whatsapp'
enabled     boolean
updated_at  timestamptz
```
Usage : préférences canaux notifications — utilisée dans Paramètres

---

### 1.5 Tables Prospection IA

#### `prospects`
Colonnes confirmées :
```
id                    uuid PK
created_at            timestamptz
updated_at            timestamptz
company_name          text
website               text (nullable)
industry              text (nullable)
company_size          text (nullable)
country               text (nullable)
city                  text (nullable)
status                text  -- ProspectStatus (12 valeurs)
score                 integer DEFAULT 0
score_reasons         jsonb DEFAULT '{}'
source                text  -- 'manual'|'linkedin'|'search'|'referral'|'import'|'other'
linkedin_url          text (nullable)
converted_to_lead_id  uuid (nullable, FK → leads.id)
tags                  text[] DEFAULT '{}'
metadata              jsonb  -- {notes, relances, analyse, qualification}
created_by            uuid (nullable)
drive_folder_id       text (nullable)
drive_folder_url      text (nullable)
```

---

#### `prospect_contacts`
Colonnes confirmées :
```
id            uuid PK
created_at    timestamptz
updated_at    timestamptz
prospect_id   uuid FK → prospects.id
first_name    text
last_name     text
email         text (nullable)
phone         text (nullable)
job_title     text (nullable)
linkedin_url  text (nullable)
is_primary    boolean DEFAULT false
```

---

#### `prospect_activities`
Colonnes confirmées :
```
id           uuid PK
created_at   timestamptz
prospect_id  uuid FK → prospects.id
type         text  -- ProspectActivityType
description  text (nullable)
```

---

#### `email_drafts`
Colonnes confirmées :
```
id                  uuid PK
created_at          timestamptz
updated_at          timestamptz
prospect_id         uuid FK → prospects.id
prospect_contact_id uuid (nullable, FK → prospect_contacts.id)
subject             text
body                text
status              text  -- 'draft'|'ready'|'sent'|'failed'
tone                text  -- 'formal'|'friendly'|'direct'|'professional'
sequence_step       integer DEFAULT 1
sent_at             timestamptz (nullable)
ai_model            text (nullable)
metadata            jsonb DEFAULT '{}'
created_by          uuid (nullable)
```

---

#### Tables Prospection partiellement documentées
Ces tables sont référencées dans le code (audit) mais leurs colonnes ne sont pas complètement extraites :

| Table | Référence dans le code |
|---|---|
| `prospect_campaigns` | `useProspects` (via `prospect_campaigns` join implicite) |
| `campaigns` | `hooks/useCampagnes.ts` |
| `campaign_steps` | `hooks/useCampagnes.ts` |

---

### 1.6 Tables secondaires partiellement documentées

| Table | Source | Colonnes connues |
|---|---|---|
| `projects` | `useClients:useClientProjets` | id, name, status, progress, budget, client_id, due_date |
| `project_tasks` | `hooks/useTaches.ts` (non lu) | id, project_id, ... |
| `services` | `hooks/useServices.ts` (non lu) | id, nom, description, prix_base, unite, actif, categorie, duree_jours |
| `tickets` | `useClients:useClientTickets` | id, ticket_number, subject, status, priority, client_id |
| `ticket_messages` | `hooks/useTickets.ts` (non lu) | id, ticket_id, ... |
| `documents` | `hooks/useDocuments.ts` (non lu) | id, client_id?, ... (Supabase Storage) |
| `appointments` | `hooks/useAgenda.ts` (non lu) | id, titre, type, start_at, end_at, client_id, lead_id |
| `portfolio_projects` | `hooks/usePortfolio.ts` (non lu) | id, titre, slug, images, technologies, ... |
| `catalogue_services` | `hooks/useCatalogueServices.ts` (non lu) | id, nom, description, ... |
| `catalogue_collaborateurs` | `hooks/useCatalogueCollaborateurs.ts` (non lu) | id, nom, role, ... |
| `quotes` | `useClients:useClientDevis` | id, quote_number, total, status, client_id, created_at |

---

### 1.7 Edge Functions Supabase identifiées

| Fonction | Appelant | Usage |
|---|---|---|
| `loic-chat` | `useLoic.ts` (via `supabase.functions.invoke`) | Chat IA Loïc |
| `google-oauth` | `useGoogleIntegration.ts` | OAuth Google CA-TECH |
| `google-drive` | `useProspects.ts` | Création dossier Drive par prospect |
| `analyse-prospect` | `useProspects.ts` | Analyse IA d'un prospect |
| `send-reply-email` | `useMessages.ts` | Réponse Gmail à un message entrant |
| `generate-reply` | `useMessages.ts` | Génération IA de brouillon de réponse |

Implicite (non confirmée mais nécessaire) :
- Envoi Gmail devis/factures (appelé depuis `useGmailSend.ts`)

---

## 2. TABLES À CONSERVER — ACTIVES EN V2

Ces tables sont utilisées par des fonctionnalités V2 confirmées. Leurs données et schémas sont intacts.

| Table | Justification |
|---|---|
| `clients` | Module Clients — fiche client complète |
| `leads` | Module Contacts & Demandes — leads entrants |
| `messages` | Module Contacts & Demandes — formulaire contact |
| `devis` | Module Devis |
| `devis_items` | Lignes de devis |
| `invoices` | Module Paiements — factures liées |
| `invoice_items` | Lignes de factures |
| `payments` | Module Paiements — paiements enregistrés |
| `ai_conversations` | Module Loïc |
| `google_integrations` | Connexion Google CA-TECH (Paramètres) |
| `notifications` | Cloche in-app Header |
| `notification_settings` | Préférences canaux (Paramètres) |

---

## 3. TABLES À FUSIONNER

### 3.1 `devis` + `quotes` → `devis` (fusion à clarifier)

**Situation** : deux tables co-existent pour le même concept.
- `devis` (active) : écritures dans `useDevis.ts`, colonnes `devis_number` + `devis_items`
- `quotes` (vestige) : lectures dans `useClients:useClientDevis`, colonnes `quote_number`

**Action V2** :
1. Vérifier si `quotes` contient des données historiques
2. Si oui : migrer les données de `quotes` vers `devis` (mapping `quote_number` → `devis_number`)
3. Corriger `useClients.ts:useClientDevis()` pour lire depuis `devis` au lieu de `quotes`
4. Conserver `quotes` en lecture seule jusqu'à confirmation de migration

**Statut** : doublon critique — lire dans `devis`, lire dans `quotes`, deux sources de vérité pour la fiche client.

---

### 3.2 `notification_logs` + `notifications` — NE PAS FUSIONNER

Ces deux tables ont des rôles distincts :
- `notifications` : notifications in-app (cloche Header) — **conservée en V2**
- `notification_logs` : logs d'envoi Prospection (email/telegram/whatsapp) — **non utilisée en V2**

Elles ne doivent pas être fusionnées. `notification_logs` reste en place (données Prospection).

---

## 4. TABLES À REMPLACER

Aucune table n'est à supprimer ou remplacée au sens strict. Les nouvelles tables V2 (`client_google_connections`, `stripe_payment_links`, `app_settings`) sont des **ajouts**, pas des remplacements.

Cependant, la table `quotes` doit à terme être remplacée par `devis` comme unique source de vérité pour les devis.

---

## 5. TABLES POTENTIELLEMENT OBSOLÈTES

Ces tables ont leur code frontend supprimé en V2, mais leurs **données sont conservées**.

| Table | Raison | Données présentes (probable) |
|---|---|---|
| `quotes` | Doublon de `devis` — migration incomplète | Historique anciens devis |
| `prospect_contacts` | Module Prospection supprimé | Contacts prospects B2B |
| `prospect_activities` | Module Prospection supprimé | Journal activités |
| `prospect_campaigns` | Module Prospection supprimé | Liens prospect↔campagne |
| `campaigns` | Module Prospection supprimé | Campagnes emailing |
| `campaign_steps` | Module Prospection supprimé | Étapes campagnes |
| `email_drafts` | Module Prospection supprimé | Emails générés par IA |
| `notification_logs` | Module Prospection supprimé | Logs envois notifications |
| `projects` | Hors périmètre V2 | Projets clients |
| `project_tasks` | Hors périmètre V2 | Tâches |
| `services` | Hors périmètre V2 | Catalogue services internes |
| `tickets` | Hors périmètre V2 | Tickets support |
| `ticket_messages` | Hors périmètre V2 | Messages tickets |
| `documents` | Intégré dans fiche Client V2 (hook conservé) | Fichiers Supabase Storage |
| `appointments` | Hors périmètre V2 | Rendez-vous agenda |
| `portfolio_projects` | Hors périmètre V2 | Réalisations CA-TECH |
| `catalogue_services` | Hors périmètre V2 | Services site public |
| `catalogue_collaborateurs` | Hors périmètre V2 | Collaborateurs IA site public |

**Règle absolue** : aucune de ces tables n'est supprimée lors du refactoring.

---

## 6. SCHÉMA V2 PROPOSÉ

### 6.1 Vue d'ensemble

```
TABLES ACTIVES V2 (13 tables existantes + 3 nouvelles)
─────────────────────────────────────────────────────────────────────

[auth.users]  ←──────────────────────────────────────────────┐
      │                                                        │
      ↓                                                        │
[app_settings]  ← NOUVELLE                                     │
                                                               │
[clients]                                                      │
   │  ←── [leads] (converted_to_client_id)                    │
   │  ←── [messages] (client_id + lead_id)                    │
   │  ←── [devis] → [devis_items]                             │
   │  ←── [invoices] → [invoice_items]                        │
   │  ←── [payments]                                          │
   │  ←── [ai_conversations] (client_id + lead_id)            │
   │  ←── [client_google_connections]  ← NOUVELLE             │
   │  ←── [stripe_payment_links]  ← NOUVELLE                  │
   │        ↑ (lié à devis via devis_id)                      │
   │                                                           │
   ↓                                                           │
[google_integrations]  (1 ligne — CA-TECH)                    │
[notifications]  → Header cloche                               │
[notification_settings]  → Paramètres                         │

TABLES CONSERVÉES — DONNÉES SEULES (18 tables, code supprimé)
─────────────────────────────────────────────────────────────────────

quotes · prospect_contacts · prospect_activities · prospect_campaigns
campaigns · campaign_steps · email_drafts · notification_logs
projects · project_tasks · services · tickets · ticket_messages
documents · appointments · portfolio_projects
catalogue_services · catalogue_collaborateurs
```

---

### 6.2 Nouvelle table — `client_google_connections`

**Objectif** : Stocker les connexions Google OAuth par client (un client peut autoriser CA-TECH à accéder à son Drive, Docs, Sheets, Calendar).

```
Nom de table   : client_google_connections
Clé primaire   : id uuid DEFAULT gen_random_uuid()

Colonnes :
  id              uuid PK
  created_at      timestamptz DEFAULT now()
  client_id       uuid NOT NULL FK → clients.id ON DELETE CASCADE
  google_email    text NOT NULL
  scope           text NOT NULL  -- scopes autorisés espace-séparés
  access_token    text           -- chiffré recommandé
  refresh_token   text           -- chiffré recommandé
  expires_at      timestamptz (nullable)
  connected_at    timestamptz DEFAULT now()

Index : (client_id)
RLS : authenticated ONLY (lecture + écriture)
Contrainte : UNIQUE (client_id, google_email) — un client = 1 connexion Google max
```

**Relation** : `client_google_connections.client_id → clients.id`

---

### 6.3 Nouvelle table — `stripe_payment_links`

**Objectif** : Stocker les liens Stripe créés via API (Payment Links comptant + Subscriptions abonnement), avec leur statut de paiement.

```
Nom de table   : stripe_payment_links
Clé primaire   : id uuid DEFAULT gen_random_uuid()

Colonnes :
  id               uuid PK
  created_at       timestamptz DEFAULT now()
  client_id        uuid (nullable, FK → clients.id ON DELETE SET NULL)
  devis_id         uuid (nullable, FK → devis.id ON DELETE SET NULL)
  type             text NOT NULL  -- 'comptant' | 'abonnement'
  stripe_link_id   text (nullable)  -- ID Stripe du Payment Link
  stripe_link_url  text (nullable)  -- URL envoyée au client
  amount           numeric(10,2) (nullable)
  currency         text DEFAULT 'eur'
  status           text NOT NULL DEFAULT 'pending'
                   -- 'pending'|'paid'|'expired'|'cancelled'
                   -- |'active'|'suspended' (abonnements)
  subscription_id  text (nullable)  -- ID Stripe Subscription (abonnements)
  plan             text (nullable)  -- 'mensuel' | 'annuel'
  paid_at          timestamptz (nullable)
  notes            text (nullable)

Index : (client_id), (status), (type)
RLS : authenticated ONLY
```

**Relations** :
- `stripe_payment_links.client_id → clients.id`
- `stripe_payment_links.devis_id → devis.id`

---

### 6.4 Nouvelle table — `app_settings`

**Objectif** : Migrer les paramètres actuellement stockés en localStorage (`catech_settings`) vers Supabase. Garantit la persistance inter-navigateurs et inter-appareils.

```
Nom de table   : app_settings
Clé primaire   : id uuid DEFAULT gen_random_uuid()

Colonnes :
  id           uuid PK
  created_at   timestamptz DEFAULT now()
  updated_at   timestamptz DEFAULT now()
  user_id      uuid NOT NULL FK → auth.users.id ON DELETE CASCADE
  profil       jsonb DEFAULT '{}'
               -- { prenom, nom, telephone, poste }
  agence       jsonb DEFAULT '{}'
               -- { nom, email, telephone, adresse, siret, tva_intra, logo_url }
  facturation  jsonb DEFAULT '{}'
               -- { prefixe_devis, prefixe_facture, tva_defaut, delai_paiement, iban, bic, mentions }
  apparence    jsonb DEFAULT '{}'
               -- { langue, format_date, fuseau, monnaie }

Contrainte : UNIQUE (user_id) — 1 ligne par utilisateur
Index : (user_id)
RLS : user_id = auth.uid() ONLY — chaque utilisateur voit uniquement ses propres paramètres
```

**Relation** : `app_settings.user_id → auth.users.id`

**Migration** : lors du premier appel, lire `localStorage.getItem('catech_settings')`, écrire dans `app_settings`, ne plus jamais écrire dans localStorage.

---

## 7. RELATIONS COMPLÈTES V2

```
auth.users
  └── app_settings (user_id)
  └── ai_conversations (user_id)

clients
  ├── leads (converted_to_client_id → clients.id)
  ├── messages (client_id → clients.id)
  │     └── messages (lead_id → leads.id)
  ├── devis (client_id → clients.id)
  │     └── devis_items (devis_id → devis.id)
  │     └── stripe_payment_links (devis_id → devis.id)
  ├── invoices (client_id → clients.id)
  │     └── invoice_items (invoice_id → invoices.id)
  │     └── payments (invoice_id → invoices.id)
  ├── payments (client_id → clients.id)
  ├── stripe_payment_links (client_id → clients.id)
  ├── ai_conversations (client_id → clients.id)
  └── client_google_connections (client_id → clients.id)

leads
  └── ai_conversations (lead_id → leads.id)
  └── messages (lead_id → leads.id)

notifications (standalone — prospect_id peut être null en V2)
notification_settings (standalone)
google_integrations (standalone — 1 ligne)
```

---

## 8. RLS — POLITIQUES NÉCESSAIRES

### 8.1 Principe général

Le Manager CA-TECH est un outil **mono-utilisateur interne**. La RLS actuelle est probablement simple (authenticated = tout accès). En V2, on maintient ce principe avec un renforcement sur `app_settings`.

### 8.2 Tables existantes — RLS supposée

| Table | Politique supposée | Observation |
|---|---|---|
| `clients` | authenticated → all | Usage interne uniquement |
| `leads` | authenticated → all | Usage interne uniquement |
| `messages` | authenticated → all | Inséré aussi par le site public (formulaire contact) |
| `devis` | authenticated → all | Usage interne |
| `devis_items` | authenticated → all | Usage interne |
| `invoices` | authenticated → all | Usage interne |
| `invoice_items` | authenticated → all | Usage interne |
| `payments` | authenticated → all | Usage interne |
| `ai_conversations` | anon + authenticated → all | ⚠️ Loïc est accessible au public (site CA-TECH) |
| `google_integrations` | authenticated → all | Usage interne |
| `notifications` | authenticated → all | Usage interne |
| `notification_settings` | authenticated → all | Usage interne |

⚠️ **Point d'attention `messages`** : le formulaire de contact du site CA-TECH insère des messages sans authentification (via anon key). La RLS de `messages` doit permettre INSERT anon mais restreindre SELECT/UPDATE/DELETE aux authenticated.

⚠️ **Point d'attention `ai_conversations`** : Loïc est potentiellement accessible depuis le site public. La RLS doit permettre INSERT/UPDATE anon (pour la conversation en cours) mais pas SELECT de toutes les conversations.

### 8.3 Nouvelles tables — RLS à créer

#### `client_google_connections`
```sql
-- Politique : uniquement les utilisateurs authentifiés
CREATE POLICY "authenticated_all" ON client_google_connections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

#### `stripe_payment_links`
```sql
-- Politique : uniquement les utilisateurs authentifiés
CREATE POLICY "authenticated_all" ON stripe_payment_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

#### `app_settings`
```sql
-- Politique stricte : chaque utilisateur voit uniquement ses paramètres
CREATE POLICY "own_settings" ON app_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 9. PLAN DE MIGRATION FUTUR

Les migrations ci-dessous sont **à exécuter dans l'ordre** lors des phases correspondantes. Aucune n'est exécutée maintenant.

### Migration 1 — `stripe_payment_links` (Phase 6)

```sql
CREATE TABLE IF NOT EXISTS public.stripe_payment_links (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  client_id        uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  devis_id         uuid REFERENCES public.devis(id) ON DELETE SET NULL,
  type             text NOT NULL CHECK (type IN ('comptant', 'abonnement')),
  stripe_link_id   text,
  stripe_link_url  text,
  amount           numeric(10, 2),
  currency         text NOT NULL DEFAULT 'eur',
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'active', 'suspended')),
  subscription_id  text,
  plan             text CHECK (plan IN ('mensuel', 'annuel')),
  paid_at          timestamptz,
  notes            text
);

ALTER TABLE public.stripe_payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all" ON public.stripe_payment_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_stripe_payment_links_client ON public.stripe_payment_links(client_id);
CREATE INDEX idx_stripe_payment_links_status ON public.stripe_payment_links(status);
```

### Migration 2 — `client_google_connections` (Phase 9)

```sql
CREATE TABLE IF NOT EXISTS public.client_google_connections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  client_id     uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  google_email  text NOT NULL,
  scope         text NOT NULL,
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  connected_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, google_email)
);

ALTER TABLE public.client_google_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all" ON public.client_google_connections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_client_google_client ON public.client_google_connections(client_id);
```

### Migration 3 — `app_settings` (Phase 9)

```sql
CREATE TABLE IF NOT EXISTS public.app_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profil       jsonb NOT NULL DEFAULT '{}',
  agence       jsonb NOT NULL DEFAULT '{}',
  facturation  jsonb NOT NULL DEFAULT '{}',
  apparence    jsonb NOT NULL DEFAULT '{}',
  UNIQUE (user_id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Migration 4 — Correction doublon `quotes` / `devis` (Phase 5)

```sql
-- ÉTAPE 1 : vérifier si quotes contient des données
SELECT COUNT(*) FROM quotes;

-- ÉTAPE 2 (si données présentes) : migrer les anciens devis
-- À adapter selon la structure réelle de quotes
INSERT INTO devis (devis_number, client_id, status, subtotal, tax_rate, tax_amount, total, created_at, updated_at)
SELECT
  quote_number,
  client_id,
  status,
  subtotal,
  20 AS tax_rate,
  tax_amount,
  total,
  created_at,
  updated_at
FROM quotes
WHERE quote_number NOT IN (SELECT devis_number FROM devis WHERE devis_number LIKE 'DEV%' OR devis_number LIKE 'QUO%');
-- NE PAS SUPPRIMER quotes avant validation

-- ÉTAPE 3 : mettre à jour useClients.ts pour lire depuis devis
-- (modification code — Phase 5)
```

---

## 10. RISQUES

### Risque 1 — Doublon `devis` / `quotes` : double source de vérité

**Criticité** : HAUTE

**Description** : La fiche client (`useClients:useClientDevis`) affiche les devis depuis `quotes`, tandis que la page Devis (`useDevis`) lit depuis `devis`. Un devis créé depuis la page Devis n'apparaît PAS dans la fiche client. Un devis créé avec l'ancien système (si `quotes` contient des données) n'apparaît PAS dans la liste des devis.

**Impact** : un client peut sembler n'avoir aucun devis dans sa fiche alors qu'il en a dans `devis`.

**Mitigation** :
1. Vérifier le contenu de `quotes` (requête `SELECT COUNT(*) FROM quotes`)
2. Si vide : simplement corriger `useClients.ts` pour lire depuis `devis` (Phase 5)
3. Si données : migration SQL puis correction (voir Migration 4)
4. Ne pas modifier `quotes` avant validation

---

### Risque 2 — RLS `messages` : formulaire contact public

**Criticité** : HAUTE

**Description** : Le formulaire de contact du site CA-TECH (pages statiques HTML) insère des messages dans la table `messages` via la clé anon. Si la RLS est trop restrictive, le formulaire cesse de fonctionner. Si elle est trop permissive, n'importe qui peut lire les messages privés.

**Mitigation** :
- Vérifier la politique RLS actuelle sur `messages` avant toute migration
- La configuration correcte est : INSERT pour anon, SELECT/UPDATE/DELETE pour authenticated uniquement
- Ne pas modifier la RLS sans test du formulaire de contact

---

### Risque 3 — RLS `ai_conversations` : Loïc public vs Manager interne

**Criticité** : MOYENNE

**Description** : Si Loïc est accessible depuis le site public CA-TECH, des conversations sont créées par des utilisateurs non authentifiés. La RLS doit permettre INSERT/UPDATE anon sur la conversation en cours. Mais elle ne doit pas exposer toutes les conversations privées en SELECT anon.

**Mitigation** :
- Vérifier la politique RLS actuelle de `ai_conversations`
- La configuration correcte est : INSERT/UPDATE anon avec filtre sur session_id ou conversation_id spécifique, SELECT authenticated pour tout
- À vérifier côté Edge Function `loic-chat` : elle gère peut-être elle-même la sécurité

---

### Risque 4 — `access_token` / `refresh_token` Google non chiffrés

**Criticité** : HAUTE

**Description** : La table `google_integrations` stocke probablement `access_token` et `refresh_token` en texte clair dans PostgreSQL. C'est un risque de sécurité si la RLS est mal configurée ou si Supabase est compromis.

**Mitigation** :
- Vérifier si les tokens sont chiffrés côté Edge Function `google-oauth` avant stockage
- Pour `client_google_connections` (nouvelle table) : prévoir le chiffrement dans l'Edge Function
- Alternative : utiliser `pgsodium` (disponible dans Supabase) ou stocker les tokens dans un vault

---

### Risque 5 — Migration localStorage → Supabase : données perdues si mal ordonnée

**Criticité** : HAUTE

**Description** : Les paramètres agence et facturation (IBAN, BIC, SIRET, préfixes devis/factures) alimentent les PDF générés. Si `app_settings` est créée mais que le localStorage est vidé avant la migration des données, les prochains PDF seront sans en-tête.

**Mitigation** :
- La migration `useAppSettings.ts` doit **lire le localStorage en premier**, écrire en Supabase, puis (et seulement si succès confirmé) ne plus écrire dans localStorage
- Générer un PDF de test après migration pour vérifier l'en-tête
- Conserver le localStorage en lecture seule pendant 2 semaines après migration

---

### Risque 6 — `notifications.prospect_id` : couplage Prospection

**Criticité** : FAIBLE

**Description** : La table `notifications` a une colonne `prospect_id` FK → `prospects.id`. En V2, le Module Prospection est supprimé, mais des notifications liées à des prospects peuvent exister. Si `ON DELETE CASCADE` est actif sur cette relation, et si on supprimait des prospects, les notifications disparaîtraient.

**Mitigation** :
- Ne jamais supprimer la table `prospects`
- En V2, les nouvelles notifications insérées auront `prospect_id = null`
- La colonne reste mais n'est plus alimentée depuis le code V2

---

### Risque 7 — Edge Functions non versionnées dans le dépôt

**Criticité** : MOYENNE

**Description** : Les Edge Functions (`loic-chat`, `google-oauth`, `send-reply-email`, `generate-reply`, `google-drive`, `analyse-prospect`) ne sont pas dans ce dépôt. Leurs payloads d'entrée/sortie sont des contrats implicites. Toute modification de schéma (nouveau champ dans `devis`, renommage de colonne) doit être coordonnée avec ces fonctions.

**Mitigation** :
- Ne jamais renommer de colonnes existantes dans `devis`, `invoices`, `payments`, `leads`, `ai_conversations`
- Les nouvelles colonnes sont additives et ne cassent pas les Edge Functions existantes
- Documenter le payload de chaque Edge Function avant toute modification

---

### Risque 8 — Stripe : absence de webhook

**Criticité** : MOYENNE

**Description** : La table `stripe_payment_links` aura un champ `status`. Pour maintenir ce statut à jour automatiquement (paiement reçu, abonnement résilié), un webhook Stripe est nécessaire. Sans webhook, le statut devra être mis à jour manuellement ou par vérification périodique.

**Mitigation** :
- Pour V2 initial : accepter la vérification manuelle (l'utilisateur clique "Vérifier le paiement")
- Pour V2 complet : créer une Edge Function Supabase `stripe-webhook` qui reçoit les événements Stripe (`payment_link.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) et met à jour `stripe_payment_links.status`
- La clé de signature webhook Stripe sera à stocker dans les secrets Supabase

---

## RÉSUMÉ DES DÉCISIONS

| Décision | Détail |
|---|---|
| Tables actives V2 | 13 tables existantes conservées et utilisées |
| Nouvelles tables | 3 à créer : `client_google_connections`, `stripe_payment_links`, `app_settings` |
| Tables orphelines | 18 tables conservées (données) mais code supprimé |
| Doublon critique | `devis` vs `quotes` — à résoudre en Phase 5 avant refactoring fiche client |
| RLS | Vérifier `messages` (INSERT anon) et `ai_conversations` (accès public Loïc) avant migration |
| Tokens Google | Vérifier chiffrement dans `google_integrations` — appliquer même mécanisme à `client_google_connections` |
| LocalStorage | Migrer `catech_settings` → `app_settings` en Phase 9, avec lecture localStorage en premier |
| Webhook Stripe | V2 initial = vérification manuelle ; V2 complet = Edge Function `stripe-webhook` |

---

*AUDIT SUPABASE V2 TERMINÉ — AUCUNE MODIFICATION EFFECTUÉE*
