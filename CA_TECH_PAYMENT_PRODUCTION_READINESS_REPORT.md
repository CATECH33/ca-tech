# CA_TECH_PAYMENT_PRODUCTION_READINESS_REPORT.md
## Sprint 10.7 — Audit Final Global Paiements + Abonnements

**Date :** 2026-08-13  
**Périmètre :** Paiements ponctuels, abonnements, sécurité, webhooks, Supabase, frontend, build  
**Mode :** Lecture seule — aucune modification effectuée  
**Projet Supabase :** `jhcyooksjeivajdjicka`

---

## Tableau de bord

| Domaine | Statut | Détail |
|---|---|---|
| PONCTUEL | 🟢 | Montants serveur, double paiement impossible, idempotence OK |
| ABONNEMENTS | 🟢 | Plans serveur, statuts gérés, idempotence fixée |
| SÉCURITÉ | 🟠 | IDOR manquant sur 2 fonctions, RLS permissive sur tables core |
| WEBHOOKS | 🟢 | Tous les événements signés, idempotents, gestion d'erreur OK |
| SUPABASE | 🟠 | RLS permissive sur clients/invoices/payments/devis |
| FRONTEND | 🟠 | Paiements manuels avec montant frontend, routes OK |
| BUILD | 🟢 | 0 erreur TypeScript — site 422ms — Manager 0 erreur tsc |

---

## 1. PAIEMENTS PONCTUELS

### Parcours DEVIS → ACOMPTE → SOLDE

| Vérification | Statut | Détail |
|---|---|---|
| Montant serveur | 🟢 PASS | `stripe-create-payment` calcule 50 % de `devis.total` (DB) — jamais le frontend |
| Double acompte impossible | 🟢 PASS | Check applicatif + UNIQUE index `invoices_devis_payment_type_key` (migration 015) |
| Solde bloqué avant acompte payé | 🟢 PASS | Guard explicite : `acompte.status !== 'paid'` → 400 |
| Double solde impossible | 🟢 PASS | Check applicatif + même UNIQUE index DB |
| Webhook signé | 🟢 PASS | `stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET)` |
| Webhook idempotent (paiement unique) | 🟢 PASS | Check `stripe_payment_id` dans `payments` avant INSERT |
| Association client/devis/paiement | 🟢 PASS | FK: `invoices.client_id`, `invoices.devis_id`, `payments.invoice_id` |
| Race condition PostgreSQL | 🟢 PASS | UNIQUE index partiel (devis_id, payment_type) ferme la fenêtre TOCTOU |
| Devis doit être `accepted` | 🟢 PASS | Guard `devis.status !== 'accepted'` → 400 avant toute création |
| Numéro de facture séquentiel unique | 🟢 PASS | UNIQUE constraint `invoices_invoice_number_key` en DB |
| Session Checkout expire à 7 jours | 🟢 PASS | `expires_at: Date.now()/1000 + 7*24*60*60` |

### ⚠️ WARNING P1 — `useCreatePaiement` : montant frontend pour paiements manuels

- **Gravité :** MODÉRÉE
- **Fichier :** `manager/src/hooks/usePaiements.ts:142`
- **Cause :** `INSERT payments (amount: p.montant)` — `montant` vient directement de l'UI Manager, sans validation serveur. Bypass possible via un appel direct à l'API Supabase.
- **Impact :** Tout utilisateur authentifié Supabase (pas uniquement le manager) peut enregistrer un paiement manuel avec n'importe quel montant pour n'importe quel client.
- **Recommandation :** Déplacer l'enregistrement des paiements manuels vers une edge function avec check `manager_users` (même pattern que W4). Non bloquant dans l'état actuel (1 seul utilisateur Supabase).

### ⚠️ WARNING P2 — `invoices.amount_paid` : read-modify-write sans transaction dans le webhook

- **Gravité :** FAIBLE
- **Fichier :** `supabase/functions/stripe-webhook/index.ts:100`
- **Cause :** `const newAmountPaid = inv.amount_paid + amountEuros` suivi d'un UPDATE — si deux webhooks distincts arrivent simultanément pour la même facture, `amount_paid` pourrait être sous-calculé.
- **Impact :** Théorique — en pratique chaque facture CA-TECH a un seul paiement Stripe. L'idempotence prévient les doublons du même `payment_intent`.
- **Recommandation :** Remplacer par `UPDATE invoices SET amount_paid = (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = ?)` pour atomicité. Ou utiliser une transaction Supabase RPC.

---

## 2. ABONNEMENTS

### Parcours CLIENT → OFFRE → CHECKOUT → ABONNEMENT → WEBHOOK

| Vérification | Statut | Détail |
|---|---|---|
| Montant serveur | 🟢 PASS | `PLANS` object hardcodé dans `stripe-create-subscription` — jamais le frontend |
| Fréquence serveur | 🟢 PASS | `recurring: { interval: 'month' }` hardcodé serveur |
| Stripe Customer créé/récupéré | 🟢 PASS | `clients.stripe_customer_id` persisté en DB, réutilisé |
| Stripe Subscription via Checkout | 🟢 PASS | Session mode `subscription`, metadata `client_id/plan` |
| Statut `trialing` → `active` | 🟢 PASS | Webhook `checkout.session.completed` met à jour + `stripe_subscription_id` |
| Prochaine échéance | 🟢 PASS | `current_period_start/end` mise à jour par webhook |
| Annulation abonnement actif | 🟢 PASS | `stripe.subscriptions.cancel()` + UPDATE DB `cancelled` |
| Annulation Checkout non complétée | 🟢 PASS | `stripe.checkout.sessions.expire()` (F4 Sprint 10.5) |
| Paiement échoué → `past_due` | 🟢 PASS | Webhook `invoice.payment_failed` + guard `.neq('cancelled')` (W2) |
| `unpaid` → `past_due` | 🟢 PASS | `statusMap` dans `customer.subscription.updated` |
| `cancelled` protégé | 🟢 PASS | Guard W2 sur `invoice.payment_failed` |
| Idempotence renouvellements | 🟢 PASS | Check `stripe_payment_id` dans `payments` avant INSERT (F2) |
| Doublon d'abonnement | 🟢 PASS | Check applicatif (client_id + name + active/trialing) + UNIQUE index 017 |
| IDOR : appelant est manager | 🟢 PASS | Check `manager_users` dans les deux fonctions abonnement |

### ⚠️ WARNING A1 — `customer.subscription.updated` : pas de guard `cancelled`

- **Gravité :** FAIBLE
- **Fichier :** `supabase/functions/stripe-webhook/index.ts:115-129`
- **Cause :** L'UPDATE n'a pas de `.neq('status','cancelled')`. Un événement Stripe retardé après une annulation Manager pourrait théoriquement remettre une subscription annulée en `active`.
- **Impact :** Rare — Stripe envoie `customer.subscription.deleted` pour les annulations, pas `updated`. Mais un événement de mise à jour en file d'attente pourrait arriver dans l'ordre inverse.
- **Recommandation :** Ajouter `.neq('status','cancelled')` comme dans `invoice.payment_failed`.

---

## 3. SÉCURITÉ

### Résultats des tests d'accès

| Scénario | Résultat |
|---|---|
| Utilisateur non connecté → Manager | 🟢 REFUS — ProtectedRoute + Navigate(/login) + garde loading |
| Manager connecté → ses données | 🟢 OK — accès complet |
| `is_ca_tech_manager()` admin | 🟢 true |
| `is_ca_tech_manager()` autre user | 🟢 false |
| Utilisateur A → subscriptions Utilisateur B | 🟢 REFUS — RLS `is_ca_tech_manager()` |
| Utilisateur non-manager JWT valide → stripe-create-subscription | 🟢 REFUS — check manager_users → 403 |
| Utilisateur non-manager JWT valide → stripe-cancel-subscription | 🟢 REFUS — check manager_users → 403 |
| Utilisateur non-manager JWT valide → stripe-create-checkout | 🔴 PASS — IDOR manquant |
| Utilisateur non-manager JWT valide → stripe-create-payment | 🔴 PASS — IDOR manquant |
| Utilisateur A → clients Utilisateur B (si multi-users) | 🔴 PASS — RLS permissive |

### 🔴 FAIL S1 — IDOR manquant sur `stripe-create-checkout`

- **Gravité :** CRITIQUE
- **Fichier :** `supabase/functions/stripe-create-checkout/index.ts` (v10)
- **Cause :** `verify_jwt: true` garantit l'authentification, mais aucune vérification que l'appelant est dans `manager_users`. Tout utilisateur Supabase avec un JWT valide peut créer une Checkout Session pour n'importe quelle `invoice_id`.
- **Impact :** Si un second compte Supabase est créé (test, client, prestataire), il peut déclencher des sessions de paiement pour n'importe quelle facture — même si le montant est correct (serveur-side), la surface d'attaque est ouverte.
- **Recommandation :** Ajouter le pattern `extractUserId + manager_users check` identique à `stripe-create-subscription` (W4).

### 🔴 FAIL S2 — IDOR manquant sur `stripe-create-payment`

- **Gravité :** CRITIQUE
- **Fichier :** `supabase/functions/stripe-create-payment/index.ts` (v8)
- **Cause :** Même problème que S1 — `verify_jwt: true` mais aucun check `manager_users`. Tout authentifié peut créer un acompte ou solde pour n'importe quel devis.
- **Impact :** Création de factures et sessions de paiement Stripe par des non-managers.
- **Recommandation :** Même correctif que S1.

### ⚠️ WARNING S3 — RLS permissive sur les tables business core

- **Gravité :** ÉLEVÉE (pour un système multi-utilisateurs)
- **Tables concernées :** `clients`, `invoices`, `payments`, `devis`, `devis_items`
- **Policies :** `USING (true)` pour `authenticated` → tout utilisateur Supabase authentifié lit et écrit TOUTES les données.
- **Constat DB :** Les tables `clients` et `invoices` ont même 2 policies identiques en doublon (`"Authenticated full access"` + `"auth_all"`), toutes deux permissives.
- **Impact actuel :** Nul (1 seul utilisateur). Impact futur si multi-users : exposition complète de toutes les données clients, factures, paiements.
- **Recommandation :** Appliquer la même approche `is_ca_tech_manager()` que pour `subscriptions` à toutes les tables business.

### ⚠️ WARNING S4 — Policies en doublon sur plusieurs tables

- **Gravité :** FAIBLE (redondance, pas de faille supplémentaire)
- **Tables :** `clients` (2x ALL), `invoices` (2x ALL), `payments` (2x ALL), `notifications` (auth_all ALL override les policies restrictives user_id)
- **Impact :** La table `notifications` a 5 policies dont une `auth_all` (ALL, USING true) qui annule l'effet des policies restrictives `user_id = auth.uid()`. Tout authentifié peut lire/modifier toutes les notifications.
- **Recommandation :** Supprimer les policies `auth_all` en doublon; pour `notifications` supprimer `auth_all` pour que les policies `user_id = auth.uid()` fonctionnent.

### ✅ Points sécurité validés

| Point | Statut |
|---|---|
| Secrets Stripe dans `Deno.env` | 🟢 Jamais dans le code |
| Signature webhook `WEBHOOK_SECRET` | 🟢 Vérifiée avant tout traitement |
| Montants Stripe calculés serveur (3 fonctions) | 🟢 Stripe-create-payment, checkout, subscription |
| JWT non rejeté si absent (webhook) | 🟢 `verify_jwt: false` approprié pour Stripe |
| `manager_users` : 1 seul admin (contact@ca-tech.fr) | 🟢 Vérifié live |
| ProtectedRoute avec garde loading | 🟢 Implémentée (F3) |
| Pas de montant dans les metadata Stripe exploitables | 🟢 Stripe recalcule en interne |

---

## 4. WEBHOOKS

### Inventaire des événements Stripe

| Événement | Signature | Idempotence | Action Supabase | Gestion erreur | Statut |
|---|---|---|---|---|---|
| `checkout.session.completed` (subscription) | 🟢 | 🟢 UPDATE idempotent | UPDATE subscriptions (stripe_sub_id, status, dates) | try/catch global | 🟢 |
| `checkout.session.completed` (payment) | 🟢 | 🟢 Check payment_intent avant INSERT | INSERT payments + UPDATE invoices | 404 facture, 500 BDD | 🟢 |
| `customer.subscription.updated` | 🟢 | 🟢 UPDATE idempotent | UPDATE subscriptions (status, dates) | try/catch global | 🟠 ¹ |
| `customer.subscription.deleted` | 🟢 | 🟢 UPDATE idempotent | UPDATE subscriptions status=cancelled | try/catch global | 🟢 |
| `invoice.payment_succeeded` | 🟢 | 🟢 Check stripe_payment_id avant INSERT | INSERT payments | try/catch global | 🟠 ² |
| `invoice.payment_failed` | 🟢 | 🟢 UPDATE idempotent + guard cancelled | UPDATE subscriptions status=past_due | try/catch global | 🟢 |
| `customer.subscription.trial_will_end` | 🟢 | 🟢 No-op | Aucune | — | 🟢 |
| `charge.refunded` | 🟢 | 🟢 UPDATE idempotent | UPDATE payments status=refunded | try/catch global | 🟢 |

¹ Warning A1 — pas de guard contre overwrite de 'cancelled'  
² Idempotence bypassed si `payment_intent` est NULL (rare)

### Vérification doublons en DB

- Paiements dupliqués (même `stripe_payment_id`) : **0 doublon** ✅
- Factures acompte/solde en doublon : **0 doublon** ✅
- Abonnements actifs/trialing en doublon : **0 doublon** ✅

---

## 5. SUPABASE

### Tables auditées

| Table | RLS | Policies | UNIQUE | FK | CHECK | Statut |
|---|---|---|---|---|---|---|
| `payments` | ✅ ON | `USING(true)` ALL authenticated ⚠️ | `stripe_payment_id` (partiel) | clients, invoices | method, status | 🟠 |
| `invoices` | ✅ ON | `USING(true)` x2 ALL authenticated ⚠️ | invoice_number, (devis_id, payment_type) | clients, devis | status, payment_type | 🟠 |
| `subscriptions` | ✅ ON | `is_ca_tech_manager()` ✅ | stripe_subscription_id, (client_id, name) | clients, devis | status, frequency | 🟢 |
| `devis` | ✅ ON | `USING(true)` ALL auth + INSERT anon ⚠️ | devis_number | clients | status | 🟠 |
| `devis_items` | ✅ ON | `USING(true)` ALL authenticated ⚠️ | — | devis (CASCADE) | — | 🟠 |
| `manager_users` | ✅ ON | SELECT only authenticated | user_id (PK) | auth.users (CASCADE) | role | 🟢 |
| `stripe_payment_links` | ✅ ON | `USING(true)` ALL authenticated | — | — | — | 🟠 |
| `loic_actions` | ✅ ON | `USING(true)` ALL authenticated | — | — | — | 🟠 |
| `client_google_connections` | ✅ ON | `USING(true)` ALL authenticated | — | — | — | 🟠 |
| `app_settings` | ✅ ON | `auth.uid() = user_id` ✅ | — | — | — | 🟢 |

### Indexes critiques vérifiés en production

| Index | Table | Type | Statut |
|---|---|---|---|
| `payments_stripe_payment_id_key` | payments | UNIQUE partiel (NOT NULL) | ✅ |
| `invoices_devis_payment_type_key` | invoices | UNIQUE partiel (acompte/solde) | ✅ |
| `subscriptions_stripe_subscription_id_key` | subscriptions | UNIQUE partiel (NOT NULL) | ✅ |
| `idx_subscriptions_one_active_per_client_plan` | subscriptions | UNIQUE partiel (active/trialing) | ✅ |
| `invoices_invoice_number_key` | invoices | UNIQUE | ✅ |

### Cohérence des données (état live)

- Paiements dupliqués : **0**
- Abonnements actifs/trialing en doublon : **0**
- Subscriptions orphelines (checkout sans subscription) : **0**
- stripe_payment_links : **0 lignes** (table vide — FK conservée)

---

## 6. FRONTEND

### ProtectedRoute

```
App.tsx → AuthProvider → ProtectedApp
  /login, /forgot-password, /reset-password → PUBLIC
  /* → ProtectedRoute → useAuth()
    loading=true → Spinner (pas de flash de contenu)
    user=null → Navigate('/login', replace)
    user=admin → children rendus
```

✅ Toutes les routes métier sont derrière `ProtectedRoute` (35 routes vérifiées dans App.tsx)  
✅ `GoogleOAuthCallback` est une route publique intentionnelle (OAuth flow)  
✅ `loading` guard empêche le flash du contenu protégé avant résolution de session

### Flux Stripe depuis le frontend

| Flux | Body envoyé | Montant | Statut |
|---|---|---|---|
| Checkout facture (stripe-create-checkout) | `{ invoice_id }` uniquement | Calculé DB (`total - amount_paid`) | 🟢 |
| Acompte/Solde devis (stripe-create-payment) | `{ devis_id, payment_type }` | 50% de `devis.total` DB | 🟢 |
| Abonnement (stripe-create-subscription) | `{ client_id, plan }` | PLANS[plan].amount (serveur) | 🟢 |

### ⚠️ WARNING F1 — Paiement manuel avec montant frontend (`useCreatePaiement`)

- **Gravité :** MODÉRÉE
- **Fichier :** `manager/src/hooks/usePaiements.ts:128`
- **Cause :** INSERT direct Supabase client avec `amount: p.montant` — pas de validation serveur.
- **Impact :** Pour les paiements non-Stripe (virement, chèque, espèces) : un utilisateur authentifié peut enregistrer n'importe quel montant. La RLS USING(true) n'oppose aucune résistance.
- **Recommandation :** Acceptable pour usage CRM interne mono-manager. Déplacer vers edge function avec manager check avant multi-utilisateurs.

---

## 7. BUILD & TESTS

| Cible | Commande | Résultat |
|---|---|---|
| Site principal | `npm run build` | 🟢 422ms — 0 erreur |
| Manager TypeScript | `npx tsc -b --noEmit` | 🟢 0 erreur TypeScript |
| Manager build complet | `npm run build` | 🟢 2.30s — 0 erreur |
| Warning chunk vendor-pdf | présent | 🟠 Non critique (601kB minifié) |

---

## 8. PROBLÈMES CLASSÉS PAR PRIORITÉ

### 🔴 FAIL — À corriger avant production

| # | Gravité | Fichier | Cause | Impact | Recommandation |
|---|---|---|---|---|---|
| S1 | CRITIQUE | `supabase/functions/stripe-create-checkout/index.ts` | Pas de check `manager_users` — IDOR ouvert | Tout auth user peut créer des sessions de paiement | Ajouter `extractUserId + manager_users check` |
| S2 | CRITIQUE | `supabase/functions/stripe-create-payment/index.ts` | Même absence IDOR | Création de factures et sessions par non-managers | Même correctif que S1 |

### ⚠️ WARNING — À corriger avant ouverture multi-utilisateurs

| # | Gravité | Fichier/Table | Cause | Impact | Recommandation |
|---|---|---|---|---|---|
| S3 | ÉLEVÉE | Tables: clients, invoices, payments, devis, devis_items | RLS USING(true) — tout authenticated | Exposition totale si 2nd user créé | RLS `is_ca_tech_manager()` sur toutes |
| S4 | MODÉRÉE | Table: notifications | Policy `auth_all` ALL override les policies restrictives | Toutes notifs visibles par tout auth user | Supprimer policy `auth_all` |
| P1 | MODÉRÉE | `manager/src/hooks/usePaiements.ts:142` | Montant paiement manuel depuis frontend | Enregistrement de montants arbitraires | Edge function + manager check |
| A1 | FAIBLE | `supabase/functions/stripe-webhook/index.ts:115` | Pas de guard cancelled sur `subscription.updated` | Événement retardé peut réactiver une sub annulée | Ajouter `.neq('status','cancelled')` |
| P2 | FAIBLE | `supabase/functions/stripe-webhook/index.ts:100` | Read-modify-write non transactionnel sur amount_paid | Sous-calcul théorique si 2 webhooks simultanés | Recalcul atomique via SUM(payments) |
| F1 | FAIBLE | `manager/src/hooks/usePaiements.ts:128` | Montant manuel frontend | Identique à P1 | Edge function |
| S5 | FAIBLE | Tables: clients, invoices, payments | 2 policies ALL identiques en doublon | Redondance, pas de faille | Supprimer duplicates |

---

## 9. ÉTAT DES EDGE FUNCTIONS

| Fonction | Version | verify_jwt | IDOR check | Montant | Statut |
|---|---|---|---|---|---|
| `stripe-create-checkout` | v10 | `true` | ❌ manquant | ✅ DB uniquement | 🔴 |
| `stripe-create-payment` | v8 | `true` | ❌ manquant | ✅ DB 50% | 🔴 |
| `stripe-create-subscription` | v8 | `true` | ✅ manager_users | ✅ PLANS serveur | 🟢 |
| `stripe-cancel-subscription` | v8 | `true` | ✅ manager_users | N/A | 🟢 |
| `stripe-webhook` | v16 | `false` | N/A (Stripe signe) | ✅ Stripe amount | 🟢 |

---

## VERDICT

```
🔴 PAYMENT SYSTEM NOT READY FOR PRODUCTION
```

**Raisons bloquantes :**

1. **IDOR sur `stripe-create-checkout`** — Tout utilisateur Supabase authentifié peut créer une session de paiement Stripe pour n'importe quelle facture. Résoudre : `extractUserId + manager_users check`.

2. **IDOR sur `stripe-create-payment`** — Même faille sur la création d'acomptes/soldes de devis. Résoudre : même pattern que `stripe-create-subscription`.

3. **RLS permissive sur les tables business core** — `clients`, `invoices`, `payments`, `devis`, `devis_items` sont accessibles en lecture et écriture par tout utilisateur Supabase authentifié. Résoudre : `is_ca_tech_manager()` sur toutes les tables business, identique à `subscriptions`.

**État général :** La logique de paiement est saine — montants serveur, idempotence, race condition couverts. Les FAILs sont des gaps d'autorisation (IDOR + RLS), pas des bugs de calcul. Le système est sécurisé dans le cas où un seul compte Supabase existe, mais le principe de défense en profondeur l'interdit en production.

---

*SPRINT 10.7 TERMINÉ — AUDIT FINAL SANS MODIFICATION*
