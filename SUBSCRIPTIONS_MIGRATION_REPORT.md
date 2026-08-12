# SUBSCRIPTIONS — RAPPORT DE MIGRATION V2

**Date** : 2026-08-12  
**Sprint** : 10.2 — Migration subscriptions V2  
**Migration** : `016_subscriptions_v2_align`  
**Projet Supabase** : `jhcyooksjeivajdjicka`

---

## 1. État avant migration

| Vérification | Résultat |
|---|---|
| Nombre de lignes | **0** |
| Valeurs incompatibles `frequence` | 0 |
| Valeurs incompatibles `status` | 0 |
| Guard DO $$ | ✅ Passé — migration autorisée |

Schéma V1 confirmé :

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

---

## 2. Migration exécutée

**Fichier** : `supabase/migrations/016_subscriptions_v2_align.sql`  
**Méthode** : `mcp__claude_ai_Supabase__apply_migration`  
**Résultat** : `{"success": true}`

### Étapes exécutées dans l'ordre

| # | Étape | Résultat |
|---|---|---|
| 0 | Guard DO $$ — comptage lignes + vérification valeurs mappables | ✅ OK |
| 1 | RENAME `offre → name`, `montant → amount`, `frequence → frequency` | ✅ OK |
| 2 | DROP CONSTRAINT `subscriptions_frequence_check` | ✅ OK |
| 2 | DROP CONSTRAINT `subscriptions_status_check` | ✅ OK |
| 3 | UPDATE `frequency` : `'mensuel'→'monthly'`, `'annuel'→'annual'` | ✅ No-op (0 ligne) |
| 3 | UPDATE `status` : `'pending'→'active'`, `'suspended'→'paused'`, `'expired'→'cancelled'` | ✅ No-op (0 ligne) |
| 4 | ADD CONSTRAINT `subscriptions_frequency_check` (`monthly`, `annual`) | ✅ OK |
| 4 | ADD CONSTRAINT `subscriptions_status_check` (`active`, `paused`, `cancelled`, `past_due`, `trialing`) | ✅ OK |
| 5 | ALTER COLUMN `status` SET DEFAULT `'trialing'` | ✅ OK |
| 6 | ADD COLUMN `devis_id`, `stripe_checkout_session_id`, `stripe_price_id`, `current_period_start`, `current_period_end`, `cancelled_at` | ✅ OK |
| 7 | DROP INDEX `idx_sub_stripe_subscription_id` (non-UNIQUE) | ✅ OK |
| 7 | CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_key` | ✅ OK |

---

## 3. Colonnes finales (V2)

| Colonne | Type | Nullable | Défaut | Statut |
|---|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | Inchangé |
| `created_at` | timestamptz | NOT NULL | `now()` | Inchangé |
| `updated_at` | timestamptz | NOT NULL | `now()` | Inchangé |
| `client_id` | uuid | NOT NULL | — | Inchangé |
| `stripe_payment_link_id` | uuid | YES | — | Conservé (V1 legacy) |
| `name` | text | NOT NULL | — | ✅ Renommé depuis `offre` |
| `amount` | numeric | NOT NULL | — | ✅ Renommé depuis `montant` |
| `currency` | text | NOT NULL | `'eur'` | Inchangé |
| `frequency` | text | NOT NULL | — | ✅ Renommé depuis `frequence` |
| `status` | text | NOT NULL | **`'trialing'`** | ✅ Valeurs + défaut mis à jour |
| `stripe_subscription_id` | text | YES | — | Index UNIQUE ajouté |
| `stripe_customer_id` | text | YES | — | Inchangé |
| `date_debut` | date | YES | — | Conservé (V1 legacy) |
| `date_fin` | date | YES | — | Conservé (V1 legacy) |
| `notes` | text | YES | — | Conservé |
| `devis_id` | uuid | YES | — | ✅ **Ajouté** |
| `stripe_checkout_session_id` | text | YES | — | ✅ **Ajouté** |
| `stripe_price_id` | text | YES | — | ✅ **Ajouté** |
| `current_period_start` | timestamptz | YES | — | ✅ **Ajouté** |
| `current_period_end` | timestamptz | YES | — | ✅ **Ajouté** |
| `cancelled_at` | timestamptz | YES | — | ✅ **Ajouté** |

**21 colonnes au total** (15 V1 + 6 nouvelles).

---

## 4. Contraintes après migration

| Contrainte | Type | Définition | Statut |
|---|---|---|---|
| `subscriptions_pkey` | PK | `PRIMARY KEY (id)` | Inchangé |
| `subscriptions_client_id_fkey` | FK | `client_id → clients(id) ON DELETE RESTRICT` | Inchangé |
| `subscriptions_devis_id_fkey` | FK | `devis_id → devis(id)` | ✅ **Nouveau** |
| `subscriptions_stripe_payment_link_id_fkey` | FK | `stripe_payment_link_id → stripe_payment_links(id) ON DELETE SET NULL` | Conservé (V1) |
| `subscriptions_frequency_check` | CHECK | `frequency IN ('monthly', 'annual')` | ✅ **Nouveau** (remplace `frequence_check`) |
| `subscriptions_status_check` | CHECK | `status IN ('active', 'paused', 'cancelled', 'past_due', 'trialing')` | ✅ **Mis à jour** |
| `subscriptions_montant_check` | CHECK | `amount >= 0` | Conservé (renommé auto par PG) |
| `chk_sub_dates` | CHECK | `date_fin IS NULL OR date_debut IS NULL OR date_fin >= date_debut` | Inchangé |

---

## 5. Index après migration

| Index | Type | Définition | Statut |
|---|---|---|---|
| `subscriptions_pkey` | UNIQUE | `id` | Inchangé |
| `idx_sub_client_id` | Btree | `client_id` | Inchangé |
| `idx_sub_status` | Btree | `status` | Inchangé |
| `subscriptions_stripe_subscription_id_key` | **UNIQUE** partiel | `stripe_subscription_id WHERE NOT NULL` | ✅ **Nouveau** (remplace l'index non-UNIQUE) |
| `idx_sub_payment_link_id` | Btree partiel | `stripe_payment_link_id WHERE NOT NULL` | Conservé (V1) |
| `idx_sub_date_fin` | Btree partiel | `date_fin WHERE NOT NULL` | Conservé (V1) |

---

## 6. RLS

| Paramètre | Valeur |
|---|---|
| Row Level Security | ✅ ENABLED |
| Politique 1 | `auth users manage subscriptions` — ALL TO authenticated USING(true) |
| Politique 2 | `sub_authenticated_all` — ALL TO authenticated USING(true) |

Note : deux politiques permissives identiques (doublon pré-existant — W3 de l'audit Stripe, non bloquant, à nettoyer dans un sprint maintenance).

---

## 7. Tests

### Test A — Statuts valides acceptés

Les 5 statuts V2 ont été insérés avec succès (15 lignes au total sur 3 batches de tests) et confirmés sans valeur invalide.

| Statut testé | Résultat |
|---|---|
| `trialing` | ✅ ACCEPTÉ |
| `active` | ✅ ACCEPTÉ |
| `past_due` | ✅ ACCEPTÉ |
| `cancelled` | ✅ ACCEPTÉ |
| `paused` | ✅ ACCEPTÉ |

### Test B — Valeurs invalides rejetées par CHECK

Le DO block a tenté d'insérer les 5 valeurs invalides — toutes rejetées avec `check_violation`. Aucune ligne invalide insérée.

| Valeur invalide | Résultat |
|---|---|
| `pending` (ancienne V1) | ✅ REJETÉ (check_violation) |
| `suspended` (ancienne V1) | ✅ REJETÉ (check_violation) |
| `expired` (ancienne V1) | ✅ REJETÉ (check_violation) |
| `unpaid` (Stripe brut) | ✅ REJETÉ (check_violation) |
| `unknown` | ✅ REJETÉ (check_violation) |

Confirmation : `SELECT COUNT(*) FILTER (WHERE status NOT IN (...)) FROM subscriptions WHERE name LIKE 'TEST_%'` → **0 invalide**.

### Test C — Nettoyage des données de test

```sql
DELETE FROM subscriptions WHERE name LIKE 'TEST_%';
-- 15 lignes supprimées
```

### Test D — État final propre

```sql
SELECT COUNT(*) FROM subscriptions;
-- Résultat : 0
```

---

## 8. État après migration

| Vérification | Résultat |
|---|---|
| Nombre de lignes | **0** |
| Données de test supprimées | ✅ 15/15 |
| Colonnes V2 présentes | ✅ 21 colonnes |
| CHECK `frequency` | ✅ `('monthly', 'annual')` |
| CHECK `status` | ✅ `('active', 'paused', 'cancelled', 'past_due', 'trialing')` |
| DEFAULT `status` | ✅ `'trialing'` |
| FK `devis_id` | ✅ présente |
| UNIQUE `stripe_subscription_id` | ✅ présent |
| RLS activé | ✅ |

### Couverture Stripe — vérification finale

| Besoin abonnements | Colonne | Présent |
|---|---|---|
| Client | `client_id` | ✅ |
| Projet/site | `devis_id` | ✅ |
| Offre maintenance | `name` | ✅ |
| Montant | `amount` | ✅ |
| Fréquence | `frequency` | ✅ |
| Statut | `status` | ✅ |
| Stripe Customer | `stripe_customer_id` | ✅ |
| Stripe Subscription | `stripe_subscription_id` UNIQUE | ✅ |
| Session Checkout | `stripe_checkout_session_id` | ✅ |
| Prix Stripe | `stripe_price_id` | ✅ |
| Début période | `current_period_start` | ✅ |
| Fin période / prochaine échéance | `current_period_end` | ✅ |
| Date annulation | `cancelled_at` | ✅ |

**13/13 — couverture complète.**

---

## 9. Anomalies

| # | Anomalie | Niveau | Action |
|---|---|---|---|
| A1 | 2 politiques RLS identiques (`auth users manage subscriptions` + `sub_authenticated_all`) | 🟡 Mineur | Pré-existant (W3 audit Stripe) — nettoyage sprint maintenance |
| A2 | Contrainte `subscriptions_montant_check` nommée "montant" mais vérifie `amount` | 🟢 Nul | PostgreSQL suit la colonne par OID — fonctionne correctement |
| A3 | Colonnes V1 conservées sans usage (`stripe_payment_link_id`, `date_debut`, `date_fin`) | 🟢 Nul | Conservées intentionnellement pour l'historique |

**Aucune anomalie bloquante.**

---

## 10. Prochaine étape — Sprint 10.3

La table `subscriptions` est maintenant compatible V2. Les Edge Functions peuvent être déployées :

| Edge Function | Statut | Action sprint suivant |
|---|---|---|
| `stripe-create-subscription` | Prête — code V2 existant | Déployer + configurer `stripe_price_id` Stripe |
| `stripe-cancel-subscription` | Prête — code V2 existant | Déployer |
| `stripe-webhook` | Déjà V6 active — gère subscriptions | Aucune modification nécessaire |
| UI Abonnements | À créer | Page `/abonnements` + composants |

---

**SPRINT 10.2 TERMINÉ — SUBSCRIPTIONS V2 MIGRÉE — 0 DONNÉE PERDUE**
