# SUBSCRIPTIONS — ANALYSE DE COMPATIBILITÉ SCHÉMA

**Date** : 2026-08-12  
**Méthode** : Lecture seule — aucune donnée modifiée  
**Objectif** : Identifier les incompatibilités entre la table `subscriptions` réelle en DB et les Edge Functions V2 (`stripe-create-subscription`, `stripe-cancel-subscription`, `stripe-webhook`)

---

## 1. Schéma réel en base de données

Table `subscriptions` — issue de la migration `create_subscriptions` (v20260810080410)

| Colonne | Type DB | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` |
| `created_at` | timestamptz | NOT NULL | `now()` |
| `updated_at` | timestamptz | NOT NULL | `now()` |
| `client_id` | uuid | NOT NULL | — |
| `stripe_payment_link_id` | uuid | YES | — |
| `offre` | text | NOT NULL | — |
| `montant` | numeric | NOT NULL | — |
| `currency` | text | NOT NULL | `'eur'` |
| `frequence` | text | NOT NULL | — |
| `status` | text | NOT NULL | `'pending'` |
| `stripe_subscription_id` | text | YES | — |
| `stripe_customer_id` | text | YES | — |
| `date_debut` | date | YES | — |
| `date_fin` | date | YES | — |
| `notes` | text | YES | — |

**Contraintes CHECK actives :**

| Contrainte | Valeurs autorisées |
|---|---|
| `subscriptions_frequence_check` | `'mensuel'`, `'annuel'` |
| `subscriptions_status_check` | `'pending'`, `'active'`, `'suspended'`, `'cancelled'`, `'expired'` |
| `subscriptions_montant_check` | `montant >= 0` |
| `chk_sub_dates` | `date_fin >= date_debut` (si les deux non NULL) |

**Index :**
- `subscriptions_pkey` UNIQUE sur `id`
- `idx_sub_client_id` sur `client_id`
- `idx_sub_status` sur `status`
- `idx_sub_stripe_subscription_id` sur `stripe_subscription_id` WHERE NOT NULL (non UNIQUE)
- `idx_sub_payment_link_id` sur `stripe_payment_link_id` WHERE NOT NULL
- `idx_sub_date_fin` sur `date_fin` WHERE NOT NULL

---

## 2. Schéma attendu par l'architecture V2

D'après `PAYMENT_ARCHITECTURE_V2.md` §8 et les Edge Functions :

| Colonne V2 | Type attendu | Nullable | Notes |
|---|---|---|---|
| `id` | uuid | NOT NULL | ✅ compatible |
| `created_at` | timestamptz | NOT NULL | ✅ compatible |
| `updated_at` | timestamptz | NOT NULL | ✅ compatible |
| `client_id` | uuid | NOT NULL | ✅ compatible |
| `devis_id` | uuid | YES | ❌ **MANQUANT** |
| `name` | text | NOT NULL | ❌ **colonne s'appelle `offre`** |
| `amount` | numeric | NOT NULL | ❌ **colonne s'appelle `montant`** |
| `currency` | text | NOT NULL | ✅ compatible |
| `frequency` | text | NOT NULL | ❌ **colonne s'appelle `frequence`**, valeurs différentes |
| `status` | text | NOT NULL | ⚠️ colonne existe mais valeurs incompatibles |
| `stripe_customer_id` | text | YES | ✅ compatible |
| `stripe_subscription_id` | text | YES (UNIQUE) | ⚠️ colonne existe mais index non UNIQUE |
| `stripe_checkout_session_id` | text | YES | ❌ **MANQUANT** |
| `stripe_price_id` | text | YES | ❌ **MANQUANT** |
| `current_period_start` | timestamptz | YES | ❌ **MANQUANT** |
| `current_period_end` | timestamptz | YES | ❌ **MANQUANT** |
| `cancelled_at` | timestamptz | YES | ❌ **MANQUANT** |

---

## 3. Incompatibilités détaillées par Edge Function

### `stripe-create-subscription` (INSERT)

```typescript
await sb.from('subscriptions').insert([{
  client_id,                           // ✅ OK
  devis_id: devis_id || null,          // ❌ colonne inexistante → erreur 42703
  name: planConfig.name,               // ❌ colonne "offre" attendue → erreur 42703
  amount: planConfig.amount,           // ❌ colonne "montant" attendue → erreur 42703
  frequency: 'monthly',               // ❌ colonne "frequence", valeur 'mensuel' attendue → erreur 42703 / 23514
  status: 'trialing',                  // ❌ CHECK 'pending|active|suspended|cancelled|expired' → erreur 23514
  stripe_customer_id: stripeCustomerId, // ✅ OK
  stripe_checkout_session_id: session.id // ❌ colonne inexistante → erreur 42703
}])
```

**Résultat à l'exécution** : erreur PostgreSQL `42703` (colonne inexistante) — l'INSERT échoue, retour 500.

### `stripe-cancel-subscription` (SELECT + UPDATE)

```typescript
// SELECT — colonnes lues depuis DB
.select('id, stripe_subscription_id, status')
// ✅ id : OK
// ✅ stripe_subscription_id : OK (colonne existe)
// ✅ status : OK (colonne existe)

// Comparaison statut
if (sub.status === 'cancelled')
// ✅ 'cancelled' est une valeur valide dans la DB

// UPDATE
.update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
// ✅ status='cancelled' : valeur valide
// ❌ cancelled_at : colonne inexistante → erreur 42703
```

**Résultat à l'exécution** : SELECT OK, UPDATE échoue sur `cancelled_at` → erreur 500.

### `stripe-webhook` (UPDATE sur subscriptions)

```typescript
// checkout.session.completed (mode=subscription)
.update({
  stripe_subscription_id: stripeSubId,   // ✅ OK
  status: 'active',                       // ✅ valeur autorisée
  current_period_start: ...,              // ❌ colonne inexistante → erreur 42703
  current_period_end: ...,               // ❌ colonne inexistante → erreur 42703
})
.eq('stripe_checkout_session_id', session.id) // ❌ colonne inexistante → filtre retourne 0 lignes (no-op silencieux)

// customer.subscription.updated
.update({
  status: statusMap[sub.status],         // ⚠️ 'past_due', 'paused', 'trialing' pas dans le CHECK
  current_period_start: ...,             // ❌ colonne inexistante
  current_period_end: ...,              // ❌ colonne inexistante
})
.eq('stripe_subscription_id', sub.id)   // ✅ colonne existe

// customer.subscription.deleted
.update({ status: 'cancelled', cancelled_at: ... }) // ✅ 'cancelled' OK, ❌ cancelled_at inexistant

// invoice.payment_succeeded (renouvellement)
— pas de modification de subscriptions dans ce path → ✅ OK
```

---

## 4. Tableau de synthèse des incompatibilités

| Incompatibilité | Type | Impact | Edge Functions concernées |
|---|---|---|---|
| Colonne `name` inexistante (→ `offre`) | Renommage | FAIL 500 | stripe-create-subscription |
| Colonne `amount` inexistante (→ `montant`) | Renommage | FAIL 500 | stripe-create-subscription |
| Colonne `frequency` inexistante (→ `frequence`) | Renommage | FAIL 500 | stripe-create-subscription |
| Valeurs `frequency` : `'monthly'` → `'mensuel'` | Valeur CHECK | FAIL 23514 | stripe-create-subscription |
| Valeur `status: 'trialing'` non autorisée | Valeur CHECK | FAIL 23514 | stripe-create-subscription, stripe-webhook |
| Valeurs `status: 'past_due'`, `'paused'` non autorisées | Valeur CHECK | FAIL 23514 | stripe-webhook |
| Colonne `devis_id` manquante | Colonne absente | FAIL 42703 | stripe-create-subscription |
| Colonne `stripe_checkout_session_id` manquante | Colonne absente | FAIL / no-op silencieux | stripe-create-subscription, stripe-webhook |
| Colonne `stripe_price_id` manquante | Colonne absente | Donnée non stockée | stripe-create-subscription |
| Colonne `current_period_start` manquante | Colonne absente | FAIL 42703 | stripe-webhook |
| Colonne `current_period_end` manquante | Colonne absente | FAIL 42703 | stripe-webhook |
| Colonne `cancelled_at` manquante | Colonne absente | FAIL 42703 | stripe-cancel-subscription, stripe-webhook |
| `stripe_subscription_id` non UNIQUE en DB | Index manquant | Doublons possibles | stripe-webhook |

---

## 5. Colonnes existantes non utilisées par V2

Ces colonnes appartiennent à l'ancienne architecture et ne correspondent pas à V2 :

| Colonne ancienne | Équivalent V2 | Action recommandée |
|---|---|---|
| `offre` | `name` | Renommer via `ALTER TABLE ... RENAME COLUMN` |
| `montant` | `amount` | Renommer |
| `frequence` | `frequency` | Renommer + modifier CHECK |
| `date_debut` (date) | *(non utilisé dans V2)* | Conserver ou supprimer |
| `date_fin` (date) | *(non utilisé dans V2)* | Conserver ou supprimer |
| `stripe_payment_link_id` (FK→stripe_payment_links) | *(architecture V1)* | Rendre nullable, ne pas utiliser |
| `notes` | *(non dans V2)* | Conserver (utile manuellement) |

---

## 6. Migration recommandée (Sprint suivant)

> **Ne pas exécuter dans ce sprint.** Référence pour la prochaine itération abonnements.

```sql
-- 016_subscriptions_v2_align.sql
-- Alignement du schéma subscriptions sur l'architecture V2
-- Sans suppression de données

BEGIN;

-- 1. Renommer les colonnes V1 → V2
ALTER TABLE subscriptions RENAME COLUMN offre     TO name;
ALTER TABLE subscriptions RENAME COLUMN montant   TO amount;
ALTER TABLE subscriptions RENAME COLUMN frequence TO frequency;

-- 2. Mettre à jour les valeurs de fréquence
UPDATE subscriptions SET frequency = 'monthly' WHERE frequency = 'mensuel';
UPDATE subscriptions SET frequency = 'annual'  WHERE frequency = 'annuel';

-- 3. Remplacer le CHECK frequency
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_frequence_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_frequency_check
  CHECK (frequency IN ('monthly', 'annual'));

-- 4. Mettre à jour les valeurs de status
UPDATE subscriptions SET status = 'active' WHERE status = 'pending';
-- 'suspended' → 'paused', 'expired' → 'cancelled'
UPDATE subscriptions SET status = 'paused'     WHERE status = 'suspended';
UPDATE subscriptions SET status = 'cancelled'  WHERE status = 'expired';

-- 5. Remplacer le CHECK status
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'trialing'));

-- 6. Ajouter les colonnes manquantes
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS devis_id                  UUID         REFERENCES devis(id),
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id            TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at               TIMESTAMPTZ;

-- 7. Rendre stripe_payment_link_id nullable (déjà YES) et non FK bloquant
-- (conserver la colonne pour historique, ne plus l'utiliser en V2)

-- 8. Ajouter index UNIQUE sur stripe_subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_key
  ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

COMMIT;
```

---

## 7. Impact immédiat (état actuel)

- **Acompte / solde** : **non impacté** — utilise uniquement `invoices` et `payments`
- **Abonnements** : **100 % non fonctionnel** — toutes les Edge Functions abonnements échoueront
- **Frontend `useSubscriptions`** : lira des colonnes inexistantes → valeurs `undefined` sur tous les champs V2
- **Webhook subscription** : les UPDATE sur `stripe_checkout_session_id` seront des no-ops silencieux (0 lignes modifiées)

---

*Analyse effectuée en lecture seule — aucune donnée modifiée — aucune table supprimée*
