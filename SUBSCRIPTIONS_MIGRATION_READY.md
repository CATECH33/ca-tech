# SUBSCRIPTIONS — MIGRATION PRÊTE

**Date** : 2026-08-12  
**Sprint** : 10.1 — Abonnements Maintenance Préparation  
**Méthode** : Lecture + analyse — aucune donnée modifiée  
**Objectif** : Valider et corriger la migration 016 avant exécution

---

## 1. Schéma actuel (V1 — état réel en base)

Table `subscriptions` — issue de la migration initiale V1 (antérieure à `014_payments_v2.sql`).
La migration 014 a tenté un `CREATE TABLE IF NOT EXISTS subscriptions` — silencieusement ignoré car la table existait déjà.

### Colonnes

| Colonne | Type | Nullable | Défaut |
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

### Contraintes

| Contrainte | Type | Définition |
|---|---|---|
| `subscriptions_pkey` | PK | `id` |
| `subscriptions_client_id_fkey` | FK | `client_id → clients(id) ON DELETE RESTRICT` |
| `subscriptions_stripe_payment_link_id_fkey` | FK | `stripe_payment_link_id → stripe_payment_links(id) ON DELETE SET NULL` |
| `subscriptions_frequence_check` | CHECK | `frequence IN ('mensuel', 'annuel')` |
| `subscriptions_status_check` | CHECK | `status IN ('pending', 'active', 'suspended', 'cancelled', 'expired')` |
| `subscriptions_montant_check` | CHECK | `montant >= 0` |
| `chk_sub_dates` | CHECK | `date_fin IS NULL OR date_debut IS NULL OR date_fin >= date_debut` |

### Index

| Index | Type | Définition |
|---|---|---|
| `subscriptions_pkey` | UNIQUE | `id` |
| `idx_sub_client_id` | Btree | `client_id` |
| `idx_sub_status` | Btree | `status` |
| `idx_sub_stripe_subscription_id` | Btree partiel | `stripe_subscription_id WHERE NOT NULL` (⚠️ non UNIQUE) |
| `idx_sub_payment_link_id` | Btree partiel | `stripe_payment_link_id WHERE NOT NULL` |
| `idx_sub_date_fin` | Btree partiel | `date_fin WHERE NOT NULL` |

---

## 2. Schéma cible (V2 — requis par les Edge Functions)

D'après `PAYMENT_ARCHITECTURE_V2.md` §8 et les Edge Functions `stripe-create-subscription`, `stripe-cancel-subscription`, `stripe-webhook`.

| Colonne | Type | Nullable | Défaut | Source |
|---|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | Inchangé |
| `created_at` | timestamptz | NOT NULL | `now()` | Inchangé |
| `updated_at` | timestamptz | NOT NULL | `now()` | Inchangé |
| `client_id` | uuid | NOT NULL | — | Inchangé |
| `devis_id` | uuid | YES | — | **À ajouter** |
| `name` | text | NOT NULL | — | Renommé depuis `offre` |
| `amount` | numeric | NOT NULL | — | Renommé depuis `montant` |
| `currency` | text | NOT NULL | `'eur'` | Inchangé |
| `frequency` | text | NOT NULL | `'monthly'` | Renommé depuis `frequence` + valeurs changées |
| `status` | text | NOT NULL | `'trialing'` | Valeurs changées + défaut changé |
| `stripe_customer_id` | text | YES | — | Inchangé |
| `stripe_subscription_id` | text UNIQUE | YES | — | Index non-UNIQUE → UNIQUE |
| `stripe_checkout_session_id` | text | YES | — | **À ajouter** |
| `stripe_price_id` | text | YES | — | **À ajouter** |
| `current_period_start` | timestamptz | YES | — | **À ajouter** |
| `current_period_end` | timestamptz | YES | — | **À ajouter** |
| `cancelled_at` | timestamptz | YES | — | **À ajouter** |

**Colonnes V1 conservées (non utilisées par V2) :**  
`stripe_payment_link_id`, `date_debut`, `date_fin`, `notes`

---

## 3. Mapping complet

### Colonnes renommées

| Ancienne colonne | → | Nouvelle colonne | Transformation sur les valeurs |
|---|---|---|---|
| `offre` | → | `name` | Aucune |
| `montant` | → | `amount` | Aucune |
| `frequence` | → | `frequency` | `'mensuel'` → `'monthly'` · `'annuel'` → `'annual'` |

### Colonnes inchangées

| Colonne | Action |
|---|---|
| `id` | Conservé |
| `created_at` | Conservé |
| `updated_at` | Conservé |
| `client_id` | Conservé |
| `currency` | Conservé |
| `stripe_customer_id` | Conservé |
| `stripe_subscription_id` | Conservé + index non-UNIQUE → UNIQUE |
| `stripe_payment_link_id` | Conservé (V1 legacy, nullable) |
| `date_debut` | Conservé (V1 legacy) |
| `date_fin` | Conservé (V1 legacy) |
| `notes` | Conservé (utile manuellement) |

### Colonne avec changement de valeurs

| Colonne | V1 valeurs | V2 valeurs | Mapping |
|---|---|---|---|
| `status` | `'pending'`, `'active'`, `'suspended'`, `'cancelled'`, `'expired'` | `'trialing'`, `'active'`, `'paused'`, `'cancelled'`, `'past_due'` | `pending→active`, `suspended→paused`, `expired→cancelled`, `active→active`, `cancelled→cancelled` |

### Colonnes manquantes à ajouter (6)

| Nouvelle colonne | Type | Utilisée par |
|---|---|---|
| `devis_id` | UUID FK → devis | `stripe-create-subscription` (lien projet) |
| `stripe_checkout_session_id` | TEXT | `stripe-create-subscription` (insert) · `stripe-webhook` (lookup) |
| `stripe_price_id` | TEXT | `stripe-create-subscription` (stockage Price ID Stripe) |
| `current_period_start` | TIMESTAMPTZ | `stripe-webhook` (subscription.updated / completed) |
| `current_period_end` | TIMESTAMPTZ | `stripe-webhook` (subscription.updated / completed) |
| `cancelled_at` | TIMESTAMPTZ | `stripe-cancel-subscription` · `stripe-webhook` (subscription.deleted) |

---

## 4. Données existantes

Requête exécutée sur le projet `jhcyooksjeivajdjicka` :

```sql
SELECT COUNT(*) AS total_lignes FROM subscriptions;
-- Résultat : 0
```

**La table est vide — 0 ligne.**

| Vérification | Résultat |
|---|---|
| Nombre de lignes | **0** |
| Valeurs `offre` | Aucune |
| Valeurs `montant` | Aucune |
| Valeurs `frequence` | Aucune |
| Statuts existants | Aucun |
| Relations existantes | Aucune |
| Valeurs incompatibles | **0** (table vide) |

**Conséquence directe :** toutes les transformations (UPDATE, RENAME, DROP/ADD CHECK) s'exécutent sans risque de conflit de données. Les UPDATE sont des no-ops.

---

## 5. Transformations nécessaires

### Par ordre d'exécution

1. **Vérification guard** — DO block qui compte les lignes et détecte les valeurs non-mappables (bloque la migration si trouvées)

2. **RENAME colonnes**
   - `offre → name`
   - `montant → amount`  
   - `frequence → frequency`

3. **DROP anciens CHECK** ← ⚠️ **AVANT** les UPDATE (voir §7 — bug corrigé)
   - `DROP CONSTRAINT subscriptions_frequence_check`
   - `DROP CONSTRAINT subscriptions_status_check`

4. **UPDATE valeurs frequency**
   - `'mensuel' → 'monthly'`
   - `'annuel' → 'annual'`

5. **UPDATE valeurs status**
   - `'pending' → 'active'`
   - `'suspended' → 'paused'`
   - `'expired' → 'cancelled'`

6. **ADD nouveaux CHECK**
   - `frequency IN ('monthly', 'annual')`
   - `status IN ('active', 'paused', 'cancelled', 'past_due', 'trialing')`

7. **UPDATE DEFAULT status** → `'trialing'`

8. **ADD colonnes manquantes** (6 colonnes)

9. **Remplacement index** `stripe_subscription_id` : DROP non-UNIQUE → CREATE UNIQUE

---

## 6. Risques

### Risques identifiés et niveau

| # | Risque | Niveau | État |
|---|---|---|---|
| R1 | Table non vide lors de l'exécution réelle | 🟡 FAIBLE | Table vide aujourd'hui — à vérifier au moment d'exécuter |
| R2 | Valeur `status='active'` existante transformée en `status='active'` par le mapping `pending→active` — collision si row avec status='active' pré-existant | 🟢 NUL | No-op : active→active, pas de problème |
| R3 | Bug ordre UPDATE/CHECK (voir §7) | 🔴 CRITIQUE | **Corrigé** dans migration 016 v2 |
| R4 | Default `status='pending'` invalide après nouveau CHECK | 🟡 MOYEN | **Corrigé** : `ALTER COLUMN status SET DEFAULT 'trialing'` |
| R5 | FK `subscriptions_stripe_payment_link_id_fkey` vers `stripe_payment_links` | 🟢 NUL | Colonne nullable conservée — aucun conflit |
| R6 | Index `idx_sub_stripe_subscription_id` (non-UNIQUE) en conflit avec nouvel index UNIQUE | 🟢 NUL | Migration DROP ancien → CREATE UNIQUE |
| R7 | `chk_sub_dates` CHECK sur `date_debut`/`date_fin` toujours valide | 🟢 NUL | Colonnes non renommées |
| R8 | Contrainte `subscriptions_montant_check` nommée "montant" mais vérifie "amount" | 🟢 NUL | PostgreSQL suit la colonne par OID — fonctionne correctement |

---

## 7. Migration 016 — Validation et corrections

### Bug identifié dans le template SUBSCRIPTIONS_SCHEMA_COMPATIBILITY.md §6

Le template initial faisait les UPDATEs **avant** les DROP CONSTRAINT :

```sql
-- ❌ ORDRE INCORRECT (template initial)
ALTER TABLE subscriptions RENAME COLUMN frequence TO frequency;
UPDATE subscriptions SET frequency = 'monthly' WHERE frequency = 'mensuel';  -- ← VIOLE le CHECK !
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_frequence_check;     -- ← trop tard
```

Après RENAME, le CHECK devient `frequency IN ('mensuel', 'annuel')`. Tenter d'UPDATE `'mensuel'→'monthly'` violerait cette contrainte sur une table non vide.

**Sur une table vide, cela ne provoque pas d'erreur** (UPDATE est un no-op). Mais la migration était logiquement incorrecte pour le cas général.

### Corrections apportées dans `016_subscriptions_v2_align.sql`

| Correction | Raison |
|---|---|
| DROP CHECK **avant** UPDATE valeurs | Évite la violation de contrainte si la table avait des données |
| `ALTER COLUMN status SET DEFAULT 'trialing'` | L'ancien default `'pending'` serait invalide avec le nouveau CHECK |
| Guard DO block avec vérification des valeurs incompatibles | Bloque la migration proprement si des valeurs non-mappables existent |
| `DROP INDEX idx_sub_stripe_subscription_id` avant `CREATE UNIQUE INDEX` | Évite la redondance index non-UNIQUE + index UNIQUE sur même colonne |

### Ordre d'exécution corrigé

```
1. DO $$ guard : COUNT + vérification valeurs mappables $$
2. RENAME colonnes (offre→name, montant→amount, frequence→frequency)
3. DROP CONSTRAINT subscriptions_frequence_check
4. DROP CONSTRAINT subscriptions_status_check
5. UPDATE frequency ('mensuel'→'monthly', 'annuel'→'annual')
6. UPDATE status ('pending'→'active', 'suspended'→'paused', 'expired'→'cancelled')
7. ADD CONSTRAINT subscriptions_frequency_check (monthly, annual)
8. ADD CONSTRAINT subscriptions_status_check (active, paused, cancelled, past_due, trialing)
9. ALTER COLUMN status SET DEFAULT 'trialing'
10. ADD COLUMN devis_id, stripe_checkout_session_id, stripe_price_id,
            current_period_start, current_period_end, cancelled_at
11. DROP INDEX idx_sub_stripe_subscription_id
12. CREATE UNIQUE INDEX subscriptions_stripe_subscription_id_key
COMMIT
```

### Verdict migration 016

| Critère | Résultat |
|---|---|
| Supprime des données | ✅ NON |
| Casse des relations | ✅ NON — FK client_id conservée, stripe_payment_links conservée |
| Conflit avec données existantes | ✅ NON — table vide |
| Transforme correctement les valeurs | ✅ OUI (après correction ordre) |
| Ajoute uniquement les colonnes nécessaires | ✅ OUI |
| CHECK ajoutés après traitement valeurs | ✅ OUI (après correction) |
| Bug ordre UPDATE/CHECK | ✅ CORRIGÉ |
| Default status invalide | ✅ CORRIGÉ |

**Migration 016 validée après corrections — fichier `016_subscriptions_v2_align.sql` prêt.**

---

## 8. Couverture Stripe — Schéma final

Vérification que le schéma V2 couvre tous les besoins de gestion des abonnements maintenance :

| Besoin | Colonne | Statut |
|---|---|---|
| Client | `client_id` FK → clients | ✅ |
| Projet/site associé | `devis_id` FK → devis | ✅ (ajouté par 016) |
| Offre maintenance | `name` (ex `offre`) | ✅ |
| Montant | `amount` (ex `montant`) | ✅ |
| Fréquence | `frequency` (ex `frequence`) — monthly / annual | ✅ |
| Statut | `status` — active / paused / cancelled / past_due / trialing | ✅ |
| Stripe Customer | `stripe_customer_id` | ✅ |
| Stripe Subscription | `stripe_subscription_id` UNIQUE | ✅ (index UNIQUE ajouté) |
| Session Checkout | `stripe_checkout_session_id` | ✅ (ajouté par 016) |
| Prix Stripe | `stripe_price_id` | ✅ (ajouté par 016) |
| Date de début | `current_period_start` | ✅ (ajouté par 016) |
| Date de fin / prochaine échéance | `current_period_end` | ✅ (ajouté par 016) |
| Date d'annulation | `cancelled_at` | ✅ (ajouté par 016) |

**Couverture : 13/13 besoins couverts.**

---

## 9. Plan d'exécution (sprint abonnements)

> **Ce sprint (10.1) n'exécute pas ces étapes.** Référence pour le sprint suivant.

### Pré-conditions

- [ ] Vérifier que `subscriptions` est toujours vide (ou analyser les données le moment venu)
- [ ] Avoir les secrets Stripe configurés dans Supabase : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Créer les 3 Stripe Price IDs dans le Dashboard Stripe (vitrine 49€, ecommerce 99€, ia 149€)
- [ ] Mettre à jour `stripe-create-subscription` avec les vrais `stripe_price_id`

### Étapes

```
1. Appliquer migration 016_subscriptions_v2_align.sql via Supabase MCP
2. Vérifier schéma résultant (list_tables + execute_sql)
3. Déployer Edge Function stripe-create-subscription
4. Déployer Edge Function stripe-cancel-subscription
5. Vérifier stripe-webhook (aucune modification nécessaire — déjà V2)
6. Créer page UI Abonnements dans le Manager
7. Tester flux complet en mode test Stripe
8. npm run build + vercel --prod
```

---

## 10. Plan de rollback

> En cas de problème après exécution de la migration 016.

### Scénario 1 — Migration échoue (erreur pendant la transaction)

Aucune action nécessaire. La migration est dans une transaction `BEGIN/COMMIT`. Si elle échoue, PostgreSQL annule automatiquement toutes les opérations. La table reste dans l'état V1.

### Scénario 2 — Migration réussie mais Edge Functions dysfonctionnelles

```sql
-- Rollback manuel (à exécuter dans Supabase SQL Editor)
BEGIN;

-- Supprimer les colonnes ajoutées
ALTER TABLE subscriptions
  DROP COLUMN IF EXISTS devis_id,
  DROP COLUMN IF EXISTS stripe_checkout_session_id,
  DROP COLUMN IF EXISTS stripe_price_id,
  DROP COLUMN IF EXISTS current_period_start,
  DROP COLUMN IF EXISTS current_period_end,
  DROP COLUMN IF EXISTS cancelled_at;

-- Supprimer l'index UNIQUE
DROP INDEX IF EXISTS subscriptions_stripe_subscription_id_key;

-- Recréer l'index non-UNIQUE
CREATE INDEX idx_sub_stripe_subscription_id
  ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Supprimer les nouveaux CHECK
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_frequency_check;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Transformer les valeurs retour (V2 → V1)
UPDATE subscriptions SET frequency = 'mensuel' WHERE frequency = 'monthly';
UPDATE subscriptions SET frequency = 'annuel'  WHERE frequency = 'annual';
-- Note : 'active' peut venir de 'pending' ou d'un vrai 'active' — ambiguïté possible
-- si des données ont été insérées après la migration.

-- Re-nommer les colonnes V2 → V1
ALTER TABLE subscriptions RENAME COLUMN name      TO offre;
ALTER TABLE subscriptions RENAME COLUMN amount    TO montant;
ALTER TABLE subscriptions RENAME COLUMN frequency TO frequence;

-- Remettre les anciens CHECK
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_frequence_check
  CHECK (frequence IN ('mensuel', 'annuel'));
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'expired'));

-- Remettre le DEFAULT
ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'pending';

COMMIT;
```

⚠️ **Note rollback status :** Si des abonnements ont été créés en V2 (`status='trialing'` ou `'paused'` ou `'past_due'`), le rollback du CHECK vers les valeurs V1 échouera car ces valeurs ne sont pas dans `('pending','active','suspended','cancelled','expired')`. Dans ce cas, mettre à jour les valeurs avant de re-créer le CHECK.

---

## Résumé

| Item | Statut |
|---|---|
| Table subscriptions analysée | ✅ |
| 0 ligne — aucun risque de données | ✅ |
| Bug ordre migration corrigé | ✅ |
| Default status corrigé | ✅ |
| Migration 016 créée | ✅ `supabase/migrations/016_subscriptions_v2_align.sql` |
| 6 colonnes manquantes identifiées | ✅ |
| Couverture Stripe 13/13 | ✅ |
| Aucune donnée modifiée dans ce sprint | ✅ |

---

**SPRINT 10.1 TERMINÉ — SUBSCRIPTIONS PRÊT POUR MIGRATION — AUCUNE DONNÉE MODIFIÉE**
