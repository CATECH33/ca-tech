# PAYMENT_ARCHITECTURE_V2 — CA-TECH Manager
## Architecture Paiements & Abonnements

---

## 1. Parcours commercial

```
PROSPECT
  └── LEAD créé (formulaire / message)
        └── DEVIS envoyé
              └── DEVIS ACCEPTÉ
                    ├── FACTURE ACOMPTE 50 % générée
                    │     └── Lien Stripe envoyé au client
                    │           └── PAIEMENT ACOMPTE CONFIRMÉ (webhook)
                    │                 └── PROJET AUTORISÉ À DÉMARRER
                    │                       └── DÉVELOPPEMENT
                    │                             └── LIVRAISON (brouillon)
                    │                                   └── FACTURE SOLDE 50 % générée
                    │                                         └── Lien Stripe envoyé au client
                    │                                               └── PAIEMENT SOLDE CONFIRMÉ (webhook)
                    │                                                     └── LIVRAISON OFFICIELLE
                    │                                                           └── MAINTENANCE (optionnel)
                    │                                                                 └── ABONNEMENT STRIPE
                    └── (refus) → DEVIS REFUSÉ → archivé
```

**Règle absolue** : le projet ne démarre jamais sans paiement de l'acompte confirmé par Stripe.

---

## 2. Architecture des paiements

```
Devis (source de vérité du montant)
  │
  ├── Facture Acompte (50 % de devis.total TTC)
  │     ├── Stripe Checkout Session
  │     ├── Webhook → payments INSERT
  │     └── invoices UPDATE (status: paid, amount_paid)
  │
  └── Facture Solde (50 % de devis.total TTC)
        ├── Stripe Checkout Session
        ├── Webhook → payments INSERT
        └── invoices UPDATE (status: paid, amount_paid)

Abonnement Maintenance (indépendant)
  ├── Stripe Customer (1 par client)
  ├── Stripe Subscription (recurring)
  └── subscriptions row en DB
```

**Tables principales concernées :**
- `devis` — source de vérité du montant du projet
- `invoices` — une ligne par paiement (acompte / solde / unique)
- `payments` — historique des transactions confirmées
- `subscriptions` — abonnements récurrents (nouvelle table)
- `clients` — enrichi de `stripe_customer_id`

---

## 3. Acompte 50 %

**Déclencheur :** devis accepté par le client ou manuellement par le Manager.

**Calcul :**
```
montant_acompte = devis.total * 0.50
```
Le calcul se fait **uniquement côté serveur** (Edge Function). Le frontend envoie uniquement `devis_id`.

**Flux :**
1. Manager clique "Générer lien acompte" sur le devis accepté
2. Appel Edge Function `stripe-create-payment` avec `{ devis_id, payment_type: 'acompte' }`
3. La fonction :
   - Lit `devis.total` depuis la DB (service role)
   - Calcule `montant = total * 0.50`
   - Crée une `invoice` (type: acompte, devis_id, client_id, montant)
   - Crée une Stripe Checkout Session avec ce montant
   - Sauvegarde `stripe_payment_link` sur la facture
4. Manager copie/envoie le lien au client
5. Client paie → webhook `checkout.session.completed` → facture acompte `paid`
6. Statut projet passe automatiquement à `en_cours`

---

## 4. Solde 50 %

**Déclencheur :** développement terminé, Manager génère manuellement le lien de solde.

**Calcul :**
```
montant_solde = devis.total * 0.50
(= devis.total - montant_acompte_payé)
```
La cohérence est garantie car les deux dérivent de `devis.total`.

**Flux :**
1. Manager clique "Générer lien solde" (disponible uniquement si acompte = paid)
2. Appel Edge Function `stripe-create-payment` avec `{ devis_id, payment_type: 'solde' }`
3. La fonction :
   - Lit `devis.total`, vérifie que l'acompte est bien `paid`
   - Calcule `montant = total * 0.50`
   - Crée une `invoice` (type: solde, devis_id, client_id, montant)
   - Crée une Stripe Checkout Session
4. Client paie → webhook → facture solde `paid`
5. Statut projet passe à `termine`

---

## 5. Liens de paiement

### Type de lien

**Stripe Checkout Sessions** (pas Payment Links statiques) — raisons :
- Montant calculé dynamiquement côté serveur
- Metadata riches (`invoice_id`, `devis_id`, `payment_type`, `client_id`)
- Expiration configurable (30 jours max)
- Support partial payment tracking natif via `amount_total`
- Webhook fiable : `checkout.session.completed`

### Structure d'un lien

```
Stripe Checkout Session
├── mode: 'payment'
├── currency: 'eur'
├── amount: montant_calculé_serveur (en centimes)
├── customer_email: client.email
├── metadata:
│   ├── invoice_id: uuid
│   ├── devis_id: uuid
│   ├── payment_type: 'acompte' | 'solde' | 'unique'
│   └── client_id: uuid
├── success_url: https://ca-tech.fr?paiement=confirme
├── cancel_url:  https://ca-tech.fr?paiement=annule
└── expires_at: +30 jours
```

### Rattachement

Chaque lien est rattaché via les metadata ET via la colonne `invoices.stripe_payment_link`.

| Donnée      | Via               |
|-------------|-------------------|
| Client      | `invoices.client_id` + `metadata.client_id` |
| Devis       | `invoices.devis_id` + `metadata.devis_id`   |
| Paiement    | `payments.invoice_id`                        |
| Type        | `invoices.payment_type` + `metadata.payment_type` |

---

## 6. Stripe — Configuration

### Objets Stripe utilisés

| Objet Stripe         | Usage                              |
|----------------------|------------------------------------|
| Checkout Session     | Paiement acompte / solde           |
| Customer             | Abonnement maintenance (1/client)  |
| Subscription         | Abonnement récurrent               |
| Price                | Tarif abonnement (prédéfini Stripe)|
| Webhook Endpoint     | Réception événements               |

### Edge Functions Stripe

| Fonction                    | Rôle                                            |
|-----------------------------|------------------------------------------------|
| `stripe-create-payment`     | Crée Session Checkout pour acompte ou solde     |
| `stripe-create-subscription`| Crée Customer + Subscription maintenance        |
| `stripe-cancel-subscription`| Annule une Subscription Stripe                  |
| `stripe-webhook`            | Traite tous les événements Stripe (étendu)       |
| `stripe-create-checkout`    | Existant — factures ad hoc (conservé)           |

### Sécurité

- `STRIPE_SECRET_KEY` : uniquement dans les Edge Functions (jamais frontend)
- `STRIPE_WEBHOOK_SECRET` : uniquement dans `stripe-webhook`
- `SUPABASE_SERVICE_ROLE_KEY` : uniquement côté serveur
- `verify_jwt: false` sur `stripe-webhook` (Stripe ne signe pas avec JWT Supabase)
- `verify_jwt: true` sur toutes les autres Edge Functions

---

## 7. Webhooks

### Endpoint

```
POST https://<project>.supabase.co/functions/v1/stripe-webhook
```

Configuré dans le Dashboard Stripe avec `STRIPE_WEBHOOK_SECRET`.

### Événements à écouter

| Événement Stripe                  | Action Manager                                              |
|-----------------------------------|-------------------------------------------------------------|
| `checkout.session.completed`      | INSERT payments, UPDATE invoice (paid/partial), UPDATE project status |
| `customer.subscription.created`   | UPDATE subscriptions.status = 'active'                      |
| `customer.subscription.updated`   | Sync status (active/paused/past_due/cancelled)              |
| `customer.subscription.deleted`   | UPDATE subscriptions.status = 'cancelled', cancelled_at     |
| `invoice.payment_succeeded`       | Renouvellement abonnement — INSERT payments, UPDATE current_period |
| `invoice.payment_failed`          | UPDATE subscriptions.status = 'past_due'                    |
| `charge.refunded`                 | UPDATE payments.status = 'refunded', revert invoice status  |

### Logique `checkout.session.completed` (étendue)

```
1. Lire metadata.invoice_id, metadata.payment_type, metadata.devis_id
2. Récupérer invoice depuis DB
3. INSERT INTO payments (invoice_id, client_id, amount, method:'stripe', status:'completed', stripe_payment_id)
4. UPDATE invoices SET status='paid', amount_paid=total, paid_at=NOW()
5. Si payment_type = 'acompte' → déclencher transition projet vers 'en_cours'
6. Si payment_type = 'solde'   → déclencher transition projet vers 'termine'
```

### Idempotence

Vérifier `stripe_payment_id` dans `payments` avant d'insérer — évite les doublons si Stripe renvoie l'événement.

---

## 8. Abonnements

### Modèle de données

Table `subscriptions` (nouvelle) :
```
id                    UUID PK
client_id             UUID FK → clients
devis_id              UUID FK → devis (nullable — projet associé)
name                  TEXT       — "Maintenance Vitrine", "Maintenance E-commerce"
amount                NUMERIC    — montant mensuel ou annuel
currency              TEXT       — 'eur'
frequency             TEXT       — 'monthly' | 'annual'
status                TEXT       — 'active' | 'paused' | 'cancelled' | 'past_due' | 'trialing'
stripe_customer_id    TEXT       — Stripe Customer ID (ck_...)
stripe_subscription_id TEXT UNIQUE — Stripe Subscription ID (sub_...)
stripe_price_id       TEXT       — Stripe Price ID (price_...)
current_period_start  TIMESTAMPTZ
current_period_end    TIMESTAMPTZ
cancelled_at          TIMESTAMPTZ
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### Flux de création d'abonnement

```
1. Manager choisit client + plan + projet associé (optionnel)
2. Appel stripe-create-subscription { client_id, plan, devis_id? }
3. Edge Function :
   a. Lire client depuis DB, récupérer ou créer Stripe Customer
   b. UPDATE clients SET stripe_customer_id = cus_xxx
   c. Créer Stripe Subscription avec le Price ID du plan
   d. INSERT INTO subscriptions { client_id, devis_id, stripe_customer_id, stripe_subscription_id, ... }
4. Stripe → webhook customer.subscription.created → UPDATE subscriptions.status = 'active'
```

### Plans de maintenance (à créer dans Stripe Dashboard)

| Plan                     | Montant | Fréquence | stripe_price_id |
|--------------------------|---------|-----------|-----------------|
| Maintenance Vitrine      | 49 €    | Mensuel   | price_xxx       |
| Maintenance E-commerce   | 99 €    | Mensuel   | price_xxx       |
| Maintenance IA / Sur-mesure | 149 € | Mensuel  | price_xxx       |

Les `stripe_price_id` sont des constantes dans l'Edge Function (jamais hardcodés en frontend).

---

## 9. Statuts

### Statuts de paiement (table `payments.status` / `invoices.status`)

| Statut DB       | Signification                              |
|-----------------|--------------------------------------------|
| `draft`         | Facture créée, lien non généré             |
| `sent`          | Lien envoyé, en attente de paiement        |
| `paid`          | Paiement confirmé par Stripe               |
| `partial`       | Paiement partiel reçu                      |
| `overdue`       | Échéance dépassée (cron auto)              |
| `cancelled`     | Facture annulée                            |
| `refunded`      | Remboursement effectué                     |

### Type de paiement (colonne `invoices.payment_type`)

| Valeur     | Signification              |
|------------|----------------------------|
| `acompte`  | 50 % du devis — démarrage  |
| `solde`    | 50 % du devis — livraison  |
| `unique`   | Paiement ad hoc (défaut)   |

### Statut projet (dérivé — pas de colonne DB dédiée)

Le statut projet est calculé côté frontend à partir de `devis.status` + `invoices` associées :

| Statut affiché               | Condition                                                        |
|------------------------------|------------------------------------------------------------------|
| `devis`                      | `devis.status IN ('draft', 'sent')`                             |
| `acompte en attente`         | `devis.status = 'accepted'` + aucune facture acompte paid        |
| `en cours`                   | Facture acompte `paid`                                           |
| `solde en attente`           | Facture acompte `paid` + facture solde créée mais non paid       |
| `terminé`                    | Facture solde `paid`                                             |
| `maintenance`                | `subscriptions.status = 'active'` rattaché au devis              |

### Statuts abonnement (`subscriptions.status`)

| Statut      | Signification                            |
|-------------|------------------------------------------|
| `trialing`  | Période d'essai                          |
| `active`    | Actif, paiements à jour                 |
| `past_due`  | Dernier paiement échoué                 |
| `paused`    | Mis en pause (depuis Manager)           |
| `cancelled` | Résilié                                  |

---

## 10. Sécurité

### Principe fondamental

**Le frontend ne fournit jamais un montant à payer.** Il envoie uniquement des identifiants (`devis_id`, `payment_type`). Le serveur calcule et impose le montant.

### Règles

| Risque                          | Mesure                                                              |
|---------------------------------|---------------------------------------------------------------------|
| Montant manipulé par le client  | Amount calculé côté Edge Function depuis `devis.total` DB          |
| Faux paiements webhooks         | Signature vérifiée `stripe.webhooks.constructEventAsync()`         |
| Clé secrète exposée             | `STRIPE_SECRET_KEY` jamais dans le bundle frontend                  |
| Double insertion paiement       | Check `stripe_payment_id` existant avant INSERT dans `payments`     |
| Accès non autorisé aux Edge Fn  | JWT Supabase vérifié sur toutes les fonctions sauf stripe-webhook   |
| Idempotence webhook             | Stripe peut retenter — vérifier `payments.stripe_payment_id UNIQUE`|
| IDOR sur devis_id               | Edge Function vérifie `client_id` du devis vs session utilisateur  |

---

## 11. Tables V2 utilisées

### Tables existantes (modifications minimales)

**`invoices`** — ajouter 2 colonnes :
```sql
payment_type TEXT DEFAULT 'unique' CHECK (payment_type IN ('acompte', 'solde', 'unique'))
devis_id     UUID REFERENCES devis(id)
```

**`clients`** — ajouter 1 colonne :
```sql
stripe_customer_id TEXT
```

### Nouvelle table

**`subscriptions`** — cf. section 8.

### Tables inchangées

- `devis` — source de vérité du montant (aucune modification)
- `devis_items` — lignes du devis (aucune modification)
- `payments` — historique transactions (aucune modification)
  - La colonne `stripe_payment_id` doit être UNIQUE pour l'idempotence
- `invoice_items` — lignes de facture (aucune modification)

### Vue calculée (optionnelle, Sprint suivant)

```sql
CREATE VIEW project_payment_summary AS
SELECT
  d.id AS devis_id,
  d.devis_number,
  d.total AS montant_total,
  d.total * 0.5 AS montant_acompte,
  d.total * 0.5 AS montant_solde,
  ia.status AS acompte_status,
  ia.amount_paid AS acompte_paye,
  is2.status AS solde_status,
  is2.amount_paid AS solde_paye,
  s.status AS abonnement_status
FROM devis d
LEFT JOIN invoices ia ON ia.devis_id = d.id AND ia.payment_type = 'acompte'
LEFT JOIN invoices is2 ON is2.devis_id = d.id AND is2.payment_type = 'solde'
LEFT JOIN subscriptions s ON s.devis_id = d.id;
```

---

## 12. Flux Manager (UI)

### Fiche Client — Section Devis & Paiements

```
┌─────────────────────────────────────────────────────────┐
│ DEV-2025-0001 — Site vitrine — 5 000 € TTC — Accepté   │
│                                                         │
│  ACOMPTE   2 500 €   [Générer lien]  ✅ Payé 12/08/25  │
│  SOLDE     2 500 €   [Générer lien]  ⏳ En attente      │
│                                                         │
│  ABONNEMENT Maintenance Vitrine — 49 €/mois — Actif ✅  │
└─────────────────────────────────────────────────────────┘
```

### Page Devis — Actions disponibles selon statut

| Statut devis | Actions disponibles                              |
|--------------|--------------------------------------------------|
| `brouillon`  | Modifier, Envoyer, Supprimer                     |
| `envoye`     | Relancer, Marquer accepté/refusé                 |
| `accepte`    | **Générer lien acompte**, Convertir en facture   |
| Acompte paid | **Générer lien solde**, Voir paiement            |
| Solde paid   | **Créer abonnement**, Archiver                   |

### Bouton "Générer lien acompte"

```
Visible : devis.status === 'accepte' && pas de facture acompte paid
Action  : appelle stripe-create-payment({ devis_id, payment_type: 'acompte' })
Résultat: affiche l'URL copiable + ouvre dans nouvel onglet
```

### Bouton "Générer lien solde"

```
Visible : facture acompte paid && pas de facture solde paid
Action  : appelle stripe-create-payment({ devis_id, payment_type: 'solde' })
Résultat: affiche l'URL copiable + ouvre dans nouvel onglet
```

---

## 13. Ordre exact d'implémentation

### Phase 1 — DB (Migration 014)
1. Ajouter `invoices.payment_type` + `invoices.devis_id`
2. Ajouter `clients.stripe_customer_id`
3. Ajouter contrainte UNIQUE sur `payments.stripe_payment_id` (si absent)
4. Créer table `subscriptions`
5. Activer RLS sur `subscriptions`

### Phase 2 — Edge Functions
6. Créer `stripe-create-payment` (remplace partiellement `stripe-create-checkout`)
   - Paramètres : `{ devis_id, payment_type }`
   - Calcule 50 % côté serveur
   - Crée invoice + Checkout Session
   - Sauvegarde `stripe_payment_link`
7. Étendre `stripe-webhook` :
   - Gérer les nouveaux event types (subscription.*, invoice.payment_*)
   - Ajouter check idempotence `stripe_payment_id`
   - Mettre à jour le statut projet via la logique devis_id + payment_type
8. Créer `stripe-create-subscription`
   - Crée Stripe Customer si absent
   - Met à jour `clients.stripe_customer_id`
   - Crée Stripe Subscription
   - Insère dans `subscriptions`
9. Créer `stripe-cancel-subscription`
   - Annule dans Stripe
   - Met à jour `subscriptions.status`

### Phase 3 — Types & Hooks (Frontend)
10. Mettre à jour `types/index.ts`
    - Ajouter type `PaymentType = 'acompte' | 'solde' | 'unique'`
    - Ajouter type `SubscriptionStatus`
    - Ajouter interface `Subscription`
    - Étendre interface `Facture` avec `payment_type` + `devis_id`
    - Étendre interface `Client` avec `stripe_customer_id`
11. Étendre `useFactures.ts`
    - Mapper `payment_type` + `devis_id` dans `mapRow`
    - Ajouter `useCreateAcompte(devisId)` → appelle `stripe-create-payment`
    - Ajouter `useCreateSolde(devisId)` → appelle `stripe-create-payment`
12. Créer `useSubscriptions.ts`
    - `useSubscriptions(clientId?)` — liste
    - `useCreateSubscription()` — POST stripe-create-subscription
    - `useCancelSubscription()` — POST stripe-cancel-subscription

### Phase 4 — UI
13. Page Devis :
    - Afficher section "Paiements du projet" sous la fiche devis accepté
    - Bouton "Générer acompte" → `useCreateAcompte`
    - Bouton "Générer solde" → `useCreateSolde`
14. Page Clients (fiche détail) :
    - Section DEVIS → liste des devis avec statut paiement
    - Section PAIEMENTS → historique `payments` lié au client
    - Section ABONNEMENTS → liste + bouton créer abonnement
15. Composant `ProjectPaymentStatus` :
    - Barre de progression : devis → acompte → en cours → solde → terminé
    - Affiche les montants et statuts en temps réel

### Phase 5 — Tests & Déploiement
16. Tester en mode test Stripe (clés `sk_test_`)
17. Vérifier le webhook avec `stripe listen --forward-to`
18. Migration + Edge Functions + build + `vercel --prod`

---

## Résumé des flux Stripe

```
ACOMPTE
Frontend → stripe-create-payment(devis_id, 'acompte')
         → [serveur] lit devis.total, calcule 50 %
         → Stripe Checkout Session créée
         → URL retournée au Manager
         → Client paie
         → Stripe webhook checkout.session.completed
         → [serveur] INSERT payment + UPDATE invoice(paid) + UPDATE project(en_cours)

SOLDE
Frontend → stripe-create-payment(devis_id, 'solde')
         → [serveur] vérifie acompte paid, calcule 50 %
         → même flux que ci-dessus
         → webhook → UPDATE project(termine)

ABONNEMENT
Frontend → stripe-create-subscription(client_id, plan)
         → [serveur] crée/récupère Stripe Customer
         → crée Stripe Subscription
         → INSERT subscriptions
         → webhook customer.subscription.created → status = active
         → chaque mois : invoice.payment_succeeded → INSERT payment renouvelé
```

---

*ARCHITECTURE PAIEMENT VALIDÉE — AUCUNE MODIFICATION EFFECTUÉE*
