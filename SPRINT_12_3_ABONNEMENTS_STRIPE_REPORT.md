# Sprint 12.3 — Abonnements Stripe : Catalogue & Modal dynamique

**Date** : 2026-09-03  
**Branche** : main  
**Commit** : `69f3b00`  
**Priorité** : P3 — Abonnements Stripe pour futurs clients

---

## Objectif

Remplacer les 3 plans d'abonnement hardcodés (vitrine/ecommerce/ia) par un catalogue dynamique géré en base, accessible depuis le Manager. Ajouter la page de gestion du catalogue avec KPIs MRR, toggle actif/inactif et liste des abonnés, ainsi qu'un webhook enrichi (email IA sur paiement échoué, notification churn).

---

## Fichiers créés ou modifiés

### Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `supabase/migrations/023_stripe_plans.sql` | Table `stripe_plans` + RLS + index |
| `manager/src/hooks/useStripePlans.ts` | `useStripePlans()` + `useToggleStripePlan()` |
| `manager/src/pages/parametres/AbonnementsCatalogue.tsx` | Page catalogue `/parametres/abonnements-catalogue` |
| `scripts/setup-stripe-plans.mjs` | Script one-shot pour créer les 3 plans dans Stripe + DB |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `manager/src/hooks/useSubscriptions.ts` | Ajout `useCreateSubscriptionFromPlan()` (stripe_price_id) |
| `manager/src/pages/Clients.tsx` | Modal abonnement → plans dynamiques + `useCreateSubscriptionFromPlan` |
| `manager/src/pages/Parametres.tsx` | Lien sidebar vers `/parametres/abonnements-catalogue` |
| `manager/src/App.tsx` | Route + lazy-import `AbonnementsCatalogue` |
| `manager/src/components/layout/Breadcrumbs.tsx` | Label `'abonnements-catalogue'` |
| `supabase/functions/stripe-create-subscription/index.ts` | Support `stripe_price_id` (+ backward-compat LEGACY_PLANS) |
| `supabase/functions/stripe-webhook/index.ts` | `invoice.payment_failed` enrichi + churn notification |

---

## Architecture

### Table `stripe_plans`

```sql
CREATE TABLE stripe_plans (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id  TEXT NOT NULL UNIQUE,
  stripe_price_id    TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,   -- 'essentiel' | 'confort' | 'premium'
  amount             INTEGER NOT NULL,        -- centimes HT
  currency           TEXT NOT NULL DEFAULT 'eur',
  interval           TEXT NOT NULL DEFAULT 'month',
  active             BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS** :
- `managers read stripe_plans` → SELECT via `is_ca_tech_manager()`
- `managers update stripe_plans` → UPDATE via `is_ca_tech_manager()` (toggle actif/inactif)
- INSERT/DELETE → service_role uniquement (script setup)

### Plans catalogue

| Slug | Nom | Prix HT/mois |
|---|---|---|
| `essentiel` | Plan Essentiel | 149 € |
| `confort` | Plan Confort | 299 € |
| `premium` | Plan Premium | 499 € |

### Flux création abonnement (nouveau chemin)

```
Manager clique "Nouvel abonnement" (fiche client)
→ useStripePlans() → charge plans actifs depuis stripe_plans
→ Sélection plan (stripe_price_id)
→ useCreateSubscriptionFromPlan({ client_id, stripe_price_id })
→ POST /functions/v1/stripe-create-subscription { client_id, stripe_price_id }
→ Edge function : lookup stripe_plans → checkout.sessions.create (price: stripe_price_id)
→ Retourne { url } → window.open(url, '_blank')
→ Client complète paiement → webhook checkout.session.completed → status: 'active'
```

### Backward-compat LEGACY_PLANS

Le chemin legacy (plan: 'vitrine' | 'ecommerce' | 'ia') reste fonctionnel dans l'edge function pour tout code existant. Aucune régression.

---

## Page Catalogue Abonnements (`/parametres/abonnements-catalogue`)

### KPIs
- **Plans actifs** : nombre de plans avec `active = true`
- **Abonnés actifs** : abonnements en statut `active` dans la table `subscriptions`
- **MRR** : somme des `amount` des abonnements actifs (formatCurrency)

### PlanCard
- Affichage : nom, prix en €/mois HT, badge "POPULAIRE" sur confort
- Compteur abonnés actifs par plan (filtre `s.name === plan.name && s.status === 'active'`)
- Liste des features par slug (PLAN_FEATURES)
- Bouton toggle actif/inactif (ToggleRight/ToggleLeft) → `useToggleStripePlan()`
- Stripe Price ID affiché (10px monospace, tronqué)

### État vide
Alerte amber avec commande `setup-stripe-plans.mjs` si aucun plan en base.

---

## Modal abonnement Clients.tsx

**Avant** : 3 options hardcodées `{ value: 'vitrine', label: '...', price: '49 €/mois' }`

**Après** :
- `useStripePlans()` → liste dynamique des plans actifs
- Auto-sélection du 1er plan actif au chargement
- Spinner pendant le chargement
- Message amber + lien vers le catalogue si aucun plan actif
- Radio boutons avec prix en `(plan.amount / 100).toFixed(0) €/mois HT`
- Bouton désactivé si aucun plan ou aucun `stripe_price_id` sélectionné

---

## Webhook enrichi

### `invoice.payment_failed`
1. Met à jour `subscriptions.status = 'past_due'` (ne touche pas les `cancelled`)
2. Crée une notification in-app `type: 'error'`
3. **Email IA** : génère via Claude Haiku un email HTML personnalisé (ton empathique, 3 paragraphes) avec fallback HTML statique si ANTHROPIC_API_KEY absent
4. Envoie via Gmail API (même pattern que email-digest-send)

### `customer.subscription.deleted`
1. Met à jour `subscriptions.status = 'cancelled'` + `cancelled_at`
2. Crée une notification in-app `type: 'warning'` avec nom client + plan + montant

---

## Script setup-stripe-plans.mjs

Script Node.js ESM idempotent. À exécuter une seule fois pour créer les plans dans Stripe et les enregistrer en base :

```bash
STRIPE_SECRET_KEY=sk_live_... \
SUPABASE_URL=https://jhcyooksjeivajdjicka.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/setup-stripe-plans.mjs
```

**Idempotence** : vérifie si le slug existe déjà en DB avant de créer. Skip si trouvé.

---

## Déploiement Supabase

| Opération | Statut |
|---|---|
| Migration 023 `stripe_plans` | ✅ Appliquée |
| Edge function `stripe-create-subscription` v12 | ✅ Déployée |
| Edge function `stripe-webhook` v22 | ✅ Déployée |

---

## Build

```
tsc -b      → 0 erreur
vite build  → ✓ built in 3.72s
```

Seul avertissement connu et pré-existant : `vendor-pdf.js > 500 kB` (chunk PDF tiers).

---

## Contraintes respectées

- ✅ Aucune modification des 4 factures FAC-2026-0001 à 0004
- ✅ Logique Stripe existante (webhook checkout, subscription.updated, payment_succeeded, charge.refunded) inchangée
- ✅ RLS activée sur `stripe_plans`
- ✅ `verify_jwt = false` uniquement sur les fonctions cron/webhook (pattern existant maintenu)
- ✅ Tokens Google non loggués
- ✅ Claude Haiku (pas Sonnet) pour la génération email paiement échoué
- ✅ Charte CA-TECH : bleu #0066FF, bleu foncé #0A2540

---

## Étape suivante : activation des plans

1. Exécuter `scripts/setup-stripe-plans.mjs` avec les clés prod
2. Vérifier dans `/parametres/abonnements-catalogue` que les 3 plans apparaissent
3. Activer le Smart Retries dans Stripe Dashboard → Billing → Settings → Smart Retries (P4)
