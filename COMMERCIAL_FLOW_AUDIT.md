# COMMERCIAL_FLOW_AUDIT.md
## Sprint 9.1 — Audit du Circuit Commercial CA-TECH Manager

---

## 1. FONCTIONNEMENT ACTUEL

Le circuit commercial couvre le flux :

**Message de contact → Lead → Devis → Facture → Paiement → Client**

Les entités principales sont :
- `messages` — messages entrants du site public
- `leads` — prospects en cours de qualification
- `devis` + `devis_items` — propositions commerciales avec lignes
- `invoices` + `invoice_items` — factures générées depuis les devis
- `payments` — paiements enregistrés (manuels ou Stripe)
- `clients` — clients convertis depuis un lead

Chaque entité possède son hook React Query dédié, ses mutations CRUD, et sa page UI. Les relations entre entités sont assurées via des foreign keys Supabase.

---

## 2. DEMANDES

### Point d'entrée 1 — Formulaire de contact public (site ca-tech.fr)

`src/pages/Contact.jsx` → POST `supabase/functions/v1/contact-form`

Edge Function `supabase/functions/contact-form/index.ts` :
1. Valide nom, email, message (requis)
2. INSERT dans `messages` (pas dans `leads`)
3. Envoie 2 emails via Resend/Brevo : notification admin + accusé réception client
4. Retourne `{ ok: true, id: msg.id }`

### Schéma table `messages`
```
id                UUID
from_name         VARCHAR
from_email        VARCHAR
phone             VARCHAR (optionnel)
company           VARCHAR (optionnel)
subject           VARCHAR
body              TEXT
source            VARCHAR (défaut: "Formulaire")
ip_address        VARCHAR (optionnel)
is_read           BOOLEAN (défaut: false)
is_replied        BOOLEAN (défaut: false)
is_archived       BOOLEAN (défaut: false)
created_at        TIMESTAMPTZ
```

### Point d'entrée 2 — Création manuelle via Manager

Route `/leads` → formulaire "Nouveau lead" → INSERT direct dans `leads`.

### Ce qui n'existe pas

- Aucune conversion automatique message → lead
- Aucun webhook de CRM externe (LinkedIn, Salesforce, Pipedrive)
- Le module Prospection (IA + connecteurs) est un circuit séparé, non lié au circuit commercial standard

### Schéma table `leads`
```
id                    UUID
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
prenom                VARCHAR
nom                   VARCHAR
email                 VARCHAR
telephone             VARCHAR (optionnel)
entreprise            VARCHAR (optionnel)
source                VARCHAR (linkedin, site web, formulaire, etc.)
status                VARCHAR — voir statuts ci-dessous
budget_estime         NUMERIC (optionnel)
besoin                TEXT (description du besoin)
converted_to_client_id UUID FK → clients (optionnel)
```

### Statuts `leads` (7)
| Statut | Signification |
|--------|---------------|
| `nouveau` | Contact entrant non traité |
| `contact` | Premier contact effectué |
| `qualifie` | Besoin identifié et validé |
| `proposition` | Devis / proposition envoyé |
| `negocie` | En cours de négociation |
| `gagne` | Affaire conclue |
| `perdu` | Affaire perdue |

### Fonctionnalités réelles (hooks + requêtes Supabase présentes)
- `useLeads` — SELECT * ORDER BY created_at DESC
- `useCreateLead` — INSERT avec tous les champs
- `useUpdateLead` — UPDATE champs individuels
- `useUpdateLeadStatus` — UPDATE status seul (drag Kanban)
- `useDeleteLead` — DELETE
- `useConvertLeadToClient` — INSERT clients + UPDATE lead status='gagne' + SET converted_to_client_id
- `useLeadsRealtime` — abonnement postgres_changes INSERT (temps réel)

### UI disponible
- Vue Kanban (colonnes par statut, drag-and-drop)
- Vue Liste (table avec filtres)
- Recherche full-text (prenom, nom, entreprise, email)
- Filtrage par source et groupe (actifs / gagnés / perdus)
- Statistiques : total leads, taux de conversion, pipeline actif (somme budgets), CA gagné

---

## 3. CLIENTS

### Schéma table `clients`
```
id             UUID
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
first_name     VARCHAR
last_name      VARCHAR
email          VARCHAR
phone          VARCHAR (optionnel)
company        VARCHAR (optionnel)
industry       VARCHAR (optionnel)
address        VARCHAR (optionnel)
city           VARCHAR (optionnel)
postal_code    VARCHAR (optionnel)
country        VARCHAR (défaut: France)
status         VARCHAR (active | inactive | archived)
notes          TEXT (optionnel)
```

### Statuts `clients` (3)
| Statut | Signification |
|--------|---------------|
| `actif` | Client en activité |
| `inactif` | Client sans activité récente |
| `archive` | Client archivé |

### Fonctionnalités réelles
- `useClients` — SELECT * LEFT JOIN invoices, calcule `total_ca` = somme factures payées
- `useCreateClient` — INSERT (pays=France, status=active par défaut)
- `useUpdateClient` — UPDATE tous champs
- `useDeleteClient` — DELETE (cascade non vérifiée sur FK)
- `useClientDevis` — SELECT devis WHERE client_id
- `useClientFactures` — SELECT invoices WHERE client_id
- `useClientPaiements` — SELECT payments WHERE client_id
- `useClientProjets` — SELECT projects WHERE client_id
- `useClientTickets` — SELECT tickets WHERE client_id
- `useClientMessages` — SELECT messages WHERE client_id

### Onglets dans la fiche client
Infos · Activité · Projets · Devis · Factures · Paiements · Tickets · Messages · Notes

### Conversion lead → client
`useConvertLeadToClient` :
1. INSERT dans `clients` (mapping prenom→first_name, nom→last_name, etc.)
2. UPDATE lead : status='gagne', converted_to_client_id=client.id
3. Pas de déduplication : deux appels successifs créent deux clients identiques

---

## 4. DEVIS

### Schéma table `devis`
```
id                  UUID
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
numero              TEXT UNIQUE (DEV-ANNEE-SEQ)
status              VARCHAR — voir statuts ci-dessous
client_id           UUID FK → clients (optionnel)
lead_id             UUID FK → leads (optionnel — non utilisé UI)
contact_name        TEXT
contact_email       TEXT
contact_phone       VARCHAR (optionnel)
company_name        VARCHAR (optionnel)
project_type        TEXT (site-vitrine, ecommerce, etc.) — non mappé UI
activity            TEXT (secteur) — non mappé UI
features            JSONB — non mappé UI
budget_range        VARCHAR — non mappé UI
deadline            TEXT — non mappé UI
seo_option          BOOLEAN — non mappé UI
maintenance_option  VARCHAR (none|vitrine|ecommerce) — non mappé UI
hosting_option      BOOLEAN — non mappé UI
branding_option     BOOLEAN — non mappé UI
items               JSONB (snapshot lignes)
subtotal            NUMERIC (HT)
discount            NUMERIC
tax_rate            NUMERIC (20 par défaut)
tax_amount          NUMERIC
total               NUMERIC (TTC)
valid_until         DATE (défaut: +30j)
sent_at             TIMESTAMPTZ
accepted_at         TIMESTAMPTZ
refused_at          TIMESTAMPTZ
last_reminder_at    TIMESTAMPTZ
signature           TEXT (base64 PNG)
```

### Schéma table `devis_items`
```
id            UUID
devis_id      UUID FK → devis ON DELETE CASCADE
description   TEXT
quantity      INTEGER
unit_price    NUMERIC (HT)
total         NUMERIC (HT = quantity × unit_price)
sort_order    INTEGER
created_at    TIMESTAMPTZ
```

### Statuts `devis` (5)
| Statut | Signification |
|--------|---------------|
| `brouillon` | En cours de rédaction |
| `envoye` | Envoyé au client |
| `accepte` | Accepté par le client |
| `refuse` | Refusé par le client |
| `expire` | Délai de validité dépassé |

### Fonctionnalités réelles
- `useDevis` — SELECT * JOIN clients JOIN devis_items
- `useCreateDevis` — INSERT devis + INSERT devis_items en cascade, numéro auto
- `useUpdateDevis` — UPDATE devis + DELETE/INSERT devis_items si lignes changées
- `useUpdateDevisStatus` — UPDATE status + sent_at/accepted_at timestamps
- `useDeleteDevis` — DELETE (cascade supprime devis_items)
- `useDuplicateDevis` — Nouveau numéro + copie champs + copie items, status=brouillon
- `useConvertDevisToFacture` — INSERT invoices + INSERT invoice_items + UPDATE devis status='accepte'

### PDF et impression
- `html2canvas` + `jsPDF` — génération PDF côté client
- `print()` — impression navigateur

### Signature électronique
- Canvas dessin ou saisie texte → base64 PNG → champ `signature`
- Stocké dans la ligne devis uniquement (pas de circuit de signature côté client)

### Envoi email
- `useGmailSend` — OAuth Gmail intégré
- Template HTML pré-généré avec montants, dates, liens Stripe éventuels

### Catalogue services
- Dropdown dans l'éditeur de lignes → ajoute une ligne préremplie depuis `services`

### Ce qui est visuel uniquement / incomplet
- Les champs `project_type`, `activity`, `features`, `budget_range`, `deadline`, `seo_option`, `maintenance_option`, `hosting_option`, `branding_option` existent en base mais **ne sont pas mappés dans le hook useDevis** → données non exploitées côté UI
- `lead_id` sur le devis existe en base mais n'est jamais renseigné par le frontend
- Pas de signature côté client (le client ne signe pas en ligne)

---

## 5. PAIEMENTS

### Schéma table `payments`
```
id                   UUID
created_at           TIMESTAMPTZ
invoice_id           UUID FK → invoices (optionnel)
client_id            UUID FK → clients
amount               NUMERIC
method               VARCHAR (virement|carte|stripe|cheque|especes)
status               VARCHAR (completed|pending|failed — seul 'completed' affiché)
reference            VARCHAR (optionnel — ex: numéro chèque, ID Stripe)
notes                TEXT (optionnel)
paid_at              TIMESTAMPTZ
stripe_payment_id    VARCHAR (optionnel — ID transaction Stripe)
ip_address           VARCHAR (optionnel)
```

### Schéma table `invoices`
```
id                   UUID
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
invoice_number       TEXT UNIQUE (FAC-ANNEE-SEQ)
client_id            UUID FK → clients
status               VARCHAR — voir statuts ci-dessous
due_date             DATE
notes                TEXT (optionnel)
subtotal             NUMERIC (HT)
tva_rate             NUMERIC (20 par défaut)
tax_amount           NUMERIC
total                NUMERIC (TTC)
amount_paid          NUMERIC (cumul des paiements reçus)
paid_at              TIMESTAMPTZ
sent_at              TIMESTAMPTZ
stripe_payment_link  VARCHAR (optionnel — lien Stripe créé externement)
```

### Schéma table `invoice_items`
```
id            UUID
invoice_id    UUID FK → invoices ON DELETE CASCADE
description   TEXT
quantity      INTEGER
unit_price    NUMERIC (HT)
total         NUMERIC (HT)
sort_order    INTEGER
created_at    TIMESTAMPTZ
```

### Statuts `invoices` (6)
| Statut | Signification |
|--------|---------------|
| `brouillon` | En cours de rédaction |
| `envoyee` | Envoyée au client |
| `partiellement_payee` | Paiement partiel reçu |
| `payee` | Entièrement réglée |
| `en_retard` | Dépassée la date d'échéance |
| `annulee` | Annulée |

### Fonctionnalités réelles
- `useFactures` — SELECT * JOIN clients JOIN invoice_items
- `useCreateFacture` — INSERT invoices + INSERT invoice_items, numéro auto FAC-ANNEE-SEQ
- `useUpdateFacture` — UPDATE + DELETE/INSERT items si changés
- `useUpdateFactureStatus` — UPDATE status + sent_at/paid_at timestamps
- `useEnvoyerFacture` — SET status='sent', sent_at=NOW()
- `useDeleteFacture` — DELETE (cascade invoice_items)
- `useDuplicateFacture` — Nouveau numéro, due_date=+30j, amount_paid=0, status=draft
- `useEnregistrerPaiement` — CREATE payment + recalcule amount_paid + met à jour status facture
- `useFacturePayments` — SELECT payments WHERE invoice_id

### Logique `syncInvoice()` (appelée après chaque paiement)
```
amount_paid = SUM(payments WHERE invoice_id AND status='completed')
si amount_paid == 0      → status = 'sent'
si 0 < amount_paid < total → status = 'partial'
si amount_paid >= total  → status = 'paid', paid_at = NOW()
```

### Paiements partiels (acompte/solde)
Supportés par la logique syncInvoice() — plusieurs paiements peuvent être enregistrés sur une même facture. Pas d'UI dédiée "acompte / solde" mais mécaniquement possible.

### Statistiques dans la page Paiements
- Total de tous les paiements
- Total mois / trimestre / année en cours
- Graphique 12 derniers mois (montant par mois)
- Répartition par méthode de paiement
- Top 5 clients par montant payé

---

## 6. STRIPE

### Ce qui existe
- Colonne `stripe_payment_link` dans `invoices` — champ texte libre pour coller un lien Stripe
- Colonne `stripe_payment_id` dans `payments` — référence ID de transaction Stripe
- Méthode de paiement `stripe` dans les dropdowns UI
- L'email de facture inclut le lien Stripe si `stripe_payment_link` est renseigné

### Ce qui fonctionne
- Le lien Stripe affiché dans l'email et dans la fiche facture est cliquable
- Le champ `stripe_payment_id` permet de noter la référence manuellement

### Ce qui est incomplet
- Aucune intégration Stripe Checkout ou Payment Links API
- Aucun webhook Stripe → paiement automatique en base
- Aucune création automatique de lien de paiement
- Le lien Stripe doit être créé manuellement sur dashboard.stripe.com et copié-collé

### Ce qui manque
- Edge Function webhook `stripe/webhook` pour recevoir `payment_intent.succeeded`
- Auto-création de Payment Link via Stripe API à la validation d'une facture
- Synchronisation automatique Stripe ↔ `payments` table
- Gestion acompte Stripe (Payment Intent avec `capture_method: manual`)

---

## 7. ABONNEMENTS

### Ce qui existe
- Champ `maintenance_option` dans `devis` (none | vitrine | ecommerce) — option commerciale uniquement
- Aucune table `subscriptions`, `maintenance_contracts`, ou `recurring_invoices` détectée
- Aucun hook `useAbonnements` ou `useSubscriptions`
- Aucune page dédiée au suivi des abonnements

### Ce qui manque
- Table pour modéliser un abonnement (client_id, plan, amount, frequency, next_billing_date, status)
- Rattachement abonnement ↔ projet / site livré
- Facturation périodique automatique (cron ou job Supabase)
- Historique des renouvellements
- Intégration Stripe Subscriptions ou Stripe Billing

### Risque
Les contrats de maintenance sont actuellement vendus via le devis mais ne font l'objet d'aucun suivi après la signature. Le renouvellement et la facturation sont entièrement manuels.

---

## 8. CE QUI FONCTIONNE

| Fonctionnalité | Statut |
|----------------|--------|
| Création manuelle de leads | ✅ |
| Kanban leads avec drag-and-drop | ✅ |
| Conversion lead → client | ✅ |
| Création et édition de devis | ✅ |
| Lignes devis via `devis_items` | ✅ |
| Calcul HT / TVA / TTC | ✅ |
| Catalogue services dans l'éditeur | ✅ |
| Génération PDF devis / facture | ✅ |
| Signature électronique (admin) | ✅ |
| Envoi email devis / facture (Gmail OAuth) | ✅ |
| Conversion devis → facture | ✅ |
| Enregistrement paiement manuel | ✅ |
| Paiements partiels (acompte / solde) | ✅ (mécaniquement) |
| Synchronisation amount_paid ↔ status facture | ✅ |
| Fiche client avec tous les onglets | ✅ |
| Statistiques paiements (mois/année) | ✅ |
| Réception messages formulaire de contact | ✅ |
| Envoi emails transactionnels (Edge Function) | ✅ |
| Temps réel leads (INSERT) | ✅ |
| Upload documents liés aux devis/factures | ✅ |

---

## 9. CE QUI MANQUE

| Manque | Impact |
|--------|--------|
| Conversion automatique message → lead | Haut — messages perdus |
| Intégration Stripe réelle (webhook + API) | Haut — paiements 100% manuels |
| Table et gestion abonnements/maintenance | Haut — aucun suivi post-vente |
| Déduplication clients (détection doublons) | Moyen — risque de doublons |
| Statut `en_retard` automatique (cron/job) | Moyen — factures expirées non signalées |
| Expiration automatique devis (cron/job) | Moyen — devis expirés non signalées |
| Signature côté client (lien externe) | Moyen — signature uniquement admin |
| Mapping champs `project_type`, `features`, etc. dans UI | Bas — données perdues |
| Lien `lead_id` sur le devis dans l'UI | Bas — traçabilité incomplète |
| Soft delete (audit trail) | Bas — pertes irréversibles |
| Templates de devis personnalisables | Bas |
| Export comptable | Bas |

---

## 10. RISQUES

### Risque 1 — Messages non convertis (CRITICITÉ HAUTE)
Les messages du formulaire de contact s'insèrent dans `messages`, pas dans `leads`. Il n'existe aucune conversion automatique. Un message reçu peut rester invisible si personne ne consulte la page Messages du manager.

### Risque 2 — Désynchronisation Stripe (CRITICITÉ HAUTE)
Un client qui paie via un lien Stripe ne déclenche aucune mise à jour automatique en base. La facture reste `envoyee` jusqu'à saisie manuelle. Risque de relancer un client qui a déjà payé.

### Risque 3 — Bug `amount_paid = -1` (CRITICITÉ HAUTE)
Dans `useUpdateFacture`, quand le statut passe à `payee` manuellement, le champ `amount_paid` reçoit la valeur `-1` au lieu du montant total. Cela casse le calcul restant dû dans les emails et les affichages.

### Risque 4 — Doublons clients (CRITICITÉ MOYENNE)
`useConvertLeadToClient` ne vérifie pas si un client avec le même email existe déjà. Deux conversions du même lead (ou deux leads pour le même prospect) créent deux entrées clients distinctes.

### Risque 5 — Abonnements non suivis (CRITICITÉ MOYENNE)
Les contrats de maintenance sont vendus dans le devis (`maintenance_option`) mais aucun suivi n'existe après signature. Risque d'oubli de facturation récurrente.

### Risque 6 — Pas de relances automatiques (CRITICITÉ MOYENNE)
Les devis expirés et les factures en retard ne sont pas mis à jour automatiquement. Les statuts `expire` et `en_retard` doivent être appliqués manuellement.

### Risque 7 — Champs devis orphelins (CRITICITÉ BASSE)
`project_type`, `activity`, `features`, `budget_range`, `deadline`, `seo_option`, `maintenance_option`, `hosting_option`, `branding_option` existent en base mais ne sont pas exploités par le frontend. Ces données issues du formulaire de devis ne sont pas valorisées.

---

## 11. ARCHITECTURE RECOMMANDÉE

### Circuit cible

```
FORMULAIRE CONTACT (site public)
    │
    ├─ INSERT messages (existant ✅)
    │
    └─ [Option A] Edge Function crée aussi un lead automatiquement
       [Option B] Bouton "Convertir en lead" dans la page Messages

LEAD (qualification manuelle)
    │
    ├─ Kanban statuts (existant ✅)
    │
    ├─ Création devis depuis le lead (lead_id renseigné sur le devis)
    │
    └─ Conversion lead → client (existant ✅, + déduplication à ajouter)

DEVIS (négociation)
    │
    ├─ Édition lignes devis_items (existant ✅)
    ├─ Envoi email (existant ✅)
    ├─ Signature admin (existant ✅)
    ├─ [À ajouter] Lien de signature client (circuit externe ou page publique)
    │
    └─ Acceptation → Conversion en facture (existant ✅)

FACTURE
    │
    ├─ Génération depuis devis (existant ✅)
    │
    ├─ [À ajouter] Création auto d'un Stripe Payment Link via API
    │
    ├─ Envoi email avec lien de paiement (existant ✅ si lien renseigné manuellement)
    │
    └─ Paiement
           ├─ Manuel (existant ✅)
           └─ [À ajouter] Webhook Stripe → auto-enregistrement paiement

ABONNEMENT (post-vente)
    │
    ├─ [À créer] Table `subscriptions` (client_id, plan, amount, frequency, next_billing_date)
    ├─ [À créer] Lien abonnement → projet/site livré
    └─ [À créer] Cron de facturation périodique (Supabase pg_cron ou Edge Function)
```

### Modèle de données recommandé pour les abonnements
```sql
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id),
  project_id      UUID REFERENCES projects(id),
  plan            VARCHAR,           -- maintenance-vitrine | maintenance-ecommerce | custom
  amount          NUMERIC,           -- montant mensuel/annuel HT
  frequency       VARCHAR,           -- monthly | quarterly | annual
  status          VARCHAR,           -- active | paused | cancelled
  start_date      DATE,
  next_billing_at DATE,
  stripe_sub_id   VARCHAR,           -- ID Stripe Subscription si géré via Stripe Billing
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 12. ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

### Sprint 9.2 — Corrections critiques (no-brainer)
1. **Corriger le bug `amount_paid = -1`** dans `useUpdateFacture` — 30 min
2. **Bouton "Créer un lead depuis ce message"** dans la page Messages — 2h
3. **Déduplication à la conversion lead → client** (vérification email existant) — 1h

### Sprint 9.3 — Stripe réel
4. **Stripe Payment Links API** : à la validation d'une facture, créer un lien Stripe auto et stocker dans `stripe_payment_link` — 1 jour (Edge Function)
5. **Webhook Stripe** `payment_intent.succeeded` → INSERT paiement + syncInvoice — 1 jour (Edge Function)

### Sprint 9.4 — Automatisations
6. **Job relances** : cron Supabase pour passer les devis en `expire` et les factures en `en_retard` passée leur date — 2h
7. **Mapper les champs devis** (`project_type`, `features`, etc.) dans le hook et l'UI — 3h

### Sprint 9.5 — Abonnements
8. **Créer table `subscriptions`** avec migration Supabase — 1h
9. **Page Abonnements** dans le manager (liste, création, modification) — 1 jour
10. **Lien abonnement → projet** — 2h
11. **Facturation récurrente** via Edge Function cron ou Stripe Billing — 2 jours

### Sprint futur — Signature client
12. **Page publique de signature** (lien unique par devis, côté client) — 2 jours

---

**SPRINT 9.1 — AUDIT COMMERCIAL TERMINÉ — AUCUNE MODIFICATION EFFECTUÉE**
