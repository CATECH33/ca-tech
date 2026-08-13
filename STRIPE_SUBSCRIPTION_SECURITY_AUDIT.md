# STRIPE_SUBSCRIPTION_SECURITY_AUDIT.md
## Sprint 10.4 — Audit Abonnements Stripe — TEST MODE

**Date :** 2026-08-13  
**Auditeur :** Claude Sonnet 4.6  
**Scope :** stripe-create-subscription, stripe-cancel-subscription, stripe-webhook, stripe-create-checkout, stripe-create-payment, Manager Clients (abonnements), logique DB  
**Mode :** Analyse statique du code + requêtes live Supabase (projet `jhcyooksjeivajdjicka`)  
**Contrainte :** Aucune correction automatique — documentation uniquement

---

## Résumé

| Catégorie | Résultat |
|---|---|
| 🟢 PASS | **15** |
| 🟠 WARNING | **4** |
| 🔴 FAIL | **4** |

---

## 🔴 VERDICT FINAL

```
🔴 ABONNEMENTS NON PRÊTS POUR PRODUCTION
```

**Raison :** 2 FAIL critiques détectés :
- `stripe-create-checkout` accepte un montant fourni par le frontend
- `stripe-webhook` `invoice.payment_succeeded` n'est pas idempotent → boucle de re-tentatives Stripe possible

---

## 1. SÉCURITÉ — Audit du code

### 1.1 Montant et fréquence déterminés côté serveur

| Vérification | Résultat | Fichier | Détail |
|---|---|---|---|
| Montant abonnement côté serveur | 🟢 PASS | `stripe-create-subscription/index.ts` L14-18 | Objet `PLANS` hardcodé, seule la clé `plan` transit par le frontend |
| Fréquence côté serveur | 🟢 PASS | `stripe-create-subscription/index.ts` L93 | `recurring: { interval: 'month' }` hardcodé |
| Montant facture one-shot côté serveur | 🔴 **FAIL** | `stripe-create-checkout/index.ts` L17-25 | `amount_ttc` reçu du frontend et utilisé directement dans Stripe sans vérification DB |
| Montant acompte/solde côté serveur | 🟢 PASS | `stripe-create-payment/index.ts` L75-81 | Calculé depuis `devis.total` (DB), jamais depuis le frontend |

### 1.2 Authentification et clés

| Vérification | Résultat | Détail |
|---|---|---|
| `STRIPE_SECRET_KEY` jamais côté frontend | 🟢 PASS | Présente uniquement dans les edge functions (Deno env) |
| `SUPABASE_SERVICE_ROLE_KEY` jamais côté frontend | 🟢 PASS | Idem, uniquement edge functions |
| `verify_jwt: true` stripe-create-subscription | 🟢 PASS | Confirmé live : JWT Supabase requis |
| `verify_jwt: true` stripe-cancel-subscription | 🟢 PASS | Confirmé live |
| `verify_jwt: true` stripe-create-checkout | 🟢 PASS | Confirmé live |
| `verify_jwt: true` stripe-create-payment | 🟢 PASS | Confirmé live |
| `verify_jwt: false` stripe-webhook | 🟢 PASS | Correct — Stripe n'émet pas de JWT Supabase |
| Frontend envoie JWT dans Authorization | 🟢 PASS | `useSubscriptions.ts` L48-49 : session?.access_token |
| ProtectedRoute (Manager) | 🔴 **FAIL** | `manager/src/components/auth/ProtectedRoute.tsx` — composant vide, aucune vérification d'authentification |

### 1.3 Autorisation / RBAC

| Vérification | Résultat | Détail |
|---|---|---|
| Vérification client_id dans stripe-create-subscription | 🟠 WARNING | La fonction vérifie que le client existe en DB mais ne vérifie pas que l'utilisateur connecté est autorisé à agir sur ce client_id spécifique (IDOR) |
| Vérification subscription_id dans stripe-cancel-subscription | 🟠 WARNING | Idem — tout manager authentifié peut annuler l'abonnement de n'importe quel client |
| RLS sur subscriptions | 🟠 WARNING | RLS activée, policy `FOR ALL TO authenticated USING (true)` — trop permissive, aucun filtrage par rôle ou client |

### 1.4 Association client/projet

| Vérification | Résultat | Détail |
|---|---|---|
| client_id validé en DB avant création | 🟢 PASS | `stripe-create-subscription/index.ts` L44-51 : SELECT + 404 si absent |
| Pas de project_id dans abonnements | N/A | Les abonnements ne sont pas liés à un projet — conception correcte |

### 1.5 Validation des données

| Vérification | Résultat | Détail |
|---|---|---|
| Validation `plan` IN ('vitrine','ecommerce','ia') | 🟢 PASS | L36 : `!PLANS[plan]` → 400 |
| Validation `subscription_id` présent | 🟢 PASS | `stripe-cancel-subscription` L24 |
| Gestion d'erreur Stripe | 🟢 PASS | try/catch global dans chaque fonction → 500 avec message |

---

## 2. WEBHOOKS

### 2.1 Configuration

| Vérification | Résultat | Détail |
|---|---|---|
| Vérification signature Stripe | 🟢 PASS | `stripe-webhook/index.ts` L17 : `constructEventAsync` → 400 si invalide |
| `verify_jwt: false` sur webhook | 🟢 PASS | Nécessaire pour que Stripe puisse appeler sans JWT |
| CORS absent sur webhook | 🟢 PASS | Pas de headers CORS — correct, endpoint serveur-à-serveur |

### 2.2 Idempotence

| Événement | Résultat | Détail |
|---|---|---|
| `checkout.session.completed` (subscription) | 🟢 PASS | UPDATE sur `stripe_checkout_session_id` est idempotent |
| `checkout.session.completed` (paiement one-shot) | 🟢 PASS | Check `stripe_payment_id` existant avant INSERT (L58-66) |
| `customer.subscription.updated` | 🟢 PASS | UPDATE sur `stripe_subscription_id` est idempotent |
| `customer.subscription.deleted` | 🟢 PASS | UPDATE idempotent (cancelled_at peut être réécrit) |
| `invoice.payment_succeeded` | 🔴 **FAIL** | Pas de vérification d'idempotence avant INSERT payments. Si l'événement est envoyé deux fois, l'index UNIQUE sur `stripe_payment_id` bloque la deuxième insertion mais génère une erreur 500 (pas 200) → Stripe relancera le webhook indéfiniment |
| `invoice.payment_failed` | 🟠 WARNING | Met `status = 'past_due'` sans vérifier si l'abonnement est déjà 'cancelled' |
| `charge.refunded` | 🟢 PASS | UPDATE idempotent |

### 2.3 Événements traités

| Événement | Statut |
|---|---|
| `checkout.session.completed` | ✅ Géré |
| `customer.subscription.updated` | ✅ Géré |
| `customer.subscription.deleted` | ✅ Géré |
| `invoice.payment_succeeded` | ✅ Géré (avec FAIL idempotence) |
| `invoice.payment_failed` | ✅ Géré |
| `charge.refunded` | ✅ Géré |
| `customer.subscription.trial_will_end` | 🟠 WARNING — Non géré, pas de notification avant fin d'essai |
| `payment_intent.payment_failed` | Non géré — acceptable, couvert par invoice.payment_failed |

---

## 3. TESTS NÉGATIFS

| # | Test | Résultat | Mécanisme de blocage |
|---|---|---|---|
| 1 | Montant modifié côté frontend (abonnement) | 🟢 BLOQUÉ | Montant résolu par `PLANS[plan]` côté serveur |
| 2 | Fréquence modifiée côté frontend | 🟢 BLOQUÉ | `interval: 'month'` hardcodé côté serveur |
| 3 | `client_id` d'un autre client | 🟠 PARTIEL | `verify_jwt: true` requis, mais pas de contrôle IDOR (tout manager peut agir sur tout client) |
| 4 | Projet appartenant à un autre client | N/A | Abonnements non liés à des projets |
| 5 | Deux abonnements actifs identiques | 🟢 BLOQUÉ | Check applicatif (409) + index UNIQUE DB partiel (migration 017) |
| 6 | Webhook `checkout.session.completed` envoyé deux fois | 🟢 BLOQUÉ | UPDATE idempotent |
| 7 | Webhook `invoice.payment_succeeded` envoyé deux fois | 🔴 FAIL | Pas de check préalable → INSERT → erreur 500 → re-tentatives Stripe |
| 8 | Webhook avec signature invalide | 🟢 BLOQUÉ | `constructEventAsync` → 400 |
| 9 | Abonnement inexistant (annulation) | 🟢 BLOQUÉ | SELECT + `.single()` → 404 |
| 10 | Utilisateur non authentifié | 🟠 PARTIEL | `verify_jwt: true` bloque les fonctions Stripe, mais `ProtectedRoute` vide ne redirige pas vers /login |
| 11 | Abonnement déjà annulé | 🟢 BLOQUÉ | `stripe-cancel-subscription` L37 : vérification status → 400 |

---

## 4. PARCOURS COMPLET — Test de bout en bout (analyse statique)

| Étape | Statut | Détail |
|---|---|---|
| 1. CLIENT — création | ✅ | Via Manager `/clients` |
| 2. PROJET — création | N/A | Abonnements indépendants des projets |
| 3. OFFRE — sélection | ✅ | Modal Manager : vitrine/ecommerce/ia sélectionné |
| 4. CHECKOUT — génération URL | ✅ | `stripe-create-subscription` → Checkout URL Stripe |
| 5. ABONNEMENT PRÉ-ENREGISTRÉ | ✅ | Status `trialing` en DB avant paiement |
| 6. PAIEMENT — Stripe | ✅ | Client entre sa carte sur Stripe Checkout |
| 7. WEBHOOK `checkout.session.completed` | ✅ | Update status `active` + `stripe_subscription_id` |
| 8. SUBSCRIPTIONS — synchronisation | ✅ | Visible dans Manager Clients > Abonnements |
| 9. MANAGER — affichage | ✅ | Plan, montant, statut, période affichés |
| **NOTE** | ⚠️ | La redirection `success_url` vers ca-tech.fr n'est PAS utilisée comme preuve de paiement — correct |

---

## 5. ANNULATION

| Étape | Statut | Détail |
|---|---|---|
| Demande Manager (bouton Ban) | ✅ | `confirm()` dialog avant action |
| Transmission à Stripe | ✅ | `stripe.subscriptions.cancel(stripe_subscription_id)` |
| Si `stripe_subscription_id` = NULL | 🟠 WARNING | Annulation DB effectuée, mais session Checkout reste ouverte dans Stripe — un client pourrait compléter le paiement post-annulation |
| Mise à jour DB immédiate | ✅ | status = 'cancelled', cancelled_at = now() |
| Webhook `customer.subscription.deleted` | ✅ | Confirmation idempotente — UPDATE status = 'cancelled' |
| Affichage Manager | ✅ | Statut 'Annulé', bouton Ban masqué |
| Enregistrement conservé | ✅ | Pas de DELETE, historique préservé |

---

## 6. RÉCONCILIATION Stripe / Supabase / Manager

**Données de test :** Table `subscriptions` vide (0 lignes — confirmé via requête SQL live).

Aucun abonnement à réconcilier au moment de l'audit. La réconciliation sera possible lors du premier test Stripe TEST MODE.

**Colonnes de synchronisation disponibles :**
| Champ | Stripe | Supabase | Manager |
|---|---|---|---|
| stripe_subscription_id | ID Stripe | ✅ colonne unique | ✅ affiché |
| client | customer.email | ✅ client_id FK | ✅ panel client |
| plan (name) | product.name | ✅ colonne `name` | ✅ affiché |
| montant | price.unit_amount / 100 | ✅ colonne `amount` | ✅ affiché |
| fréquence | price.recurring.interval | ✅ colonne `frequency` | ✅ affiché |
| statut | subscription.status | ✅ colonne `status` (mappé) | ✅ badges colorés |
| prochaine échéance | current_period_end | ✅ colonne | ✅ affiché |

---

## 7. BUILD

| Vérification | Résultat | Détail |
|---|---|---|
| Build site principal (`npm run build`) | 🟢 PASS | 342ms, 0 erreur |
| Build Manager (`npm run build`) | 🟢 PASS | 2.74s, 0 erreur TypeScript |
| Warning chunk size Manager | 🟠 INFO | Chunks > 500 kB (vendor-pdf, vendor-charts) — non critique, warning de performance |
| Typecheck Subscription (`Subscription` type) | 🟢 PASS | Tous les champs correspondant au schéma DB |
| `SubscriptionPlan` type | 🟢 PASS | `'vitrine' | 'ecommerce' | 'ia'` cohérent avec PLANS serveur |

---

## 8. PROBLÈMES DÉTECTÉS

---

### 🔴 FAIL #1 — CRITIQUE — Montant facture one-shot fourni par le frontend

| | |
|---|---|
| **Fichier** | `supabase/functions/stripe-create-checkout/index.ts` |
| **Fonction** | Handler principal, L17-25 |
| **Code** | `const { invoice_id, invoice_number, amount_ttc, client_email } = await req.json()` puis `unit_amount: Math.round(amount_ttc * 100)` |
| **Risque** | Critique — Un utilisateur authentifié peut modifier `amount_ttc` avant l'envoi (devtools / curl) et créer une session Checkout pour n'importe quel montant, y compris 0.01 € |
| **Impact** | Paiement insuffisant pour une facture existante ; Stripe accepte le paiement, le webhook marque la facture comme payée |
| **Correction recommandée** | Lire `amount_ttc` depuis la table `invoices` en utilisant `invoice_id` côté serveur, jamais depuis le body de la requête. Rejeter la requête si `invoice_id` introuvable |

---

### 🔴 FAIL #2 — CRITIQUE — Idempotence manquante sur `invoice.payment_succeeded`

| | |
|---|---|
| **Fichier** | `supabase/functions/stripe-webhook/index.ts` |
| **Fonction** | Handler `invoice.payment_succeeded`, L142-165 |
| **Code** | INSERT dans `payments` sans vérification préalable de `stripe_payment_id` existant |
| **Risque** | Élevé — Si Stripe retente le webhook (timeout, erreur réseau, maintenance), la deuxième tentative d'INSERT échoue avec violation de contrainte UNIQUE (`stripe_payment_id`), ce qui génère une exception non gérée → réponse 500 → Stripe retente indéfiniment (jusqu'à 72h) |
| **Impact** | Boucle de re-tentatives webhook infinie ; logs d'erreur pollués ; potentiellement un second paiement inséré si `payment_intent` est NULL |
| **Correction recommandée** | Ajouter un check `SELECT ... WHERE stripe_payment_id = stripeInv.payment_intent` avant l'INSERT, comme déjà fait pour `checkout.session.completed` (L58-66). Retourner 200 si déjà enregistré |

---

### 🔴 FAIL #3 — MODÉRÉ — ProtectedRoute vide — Manager accessible sans authentification

| | |
|---|---|
| **Fichier** | `manager/src/components/auth/ProtectedRoute.tsx` |
| **Fonction** | `ProtectedRoute` |
| **Code** | `return <>{children}</>` — aucune vérification d'authentification |
| **Risque** | Modéré — L'interface Manager est accessible sans être connecté. Les données Supabase sont protégées par RLS (`TO authenticated`) et les fonctions Stripe par `verify_jwt: true`, donc aucune donnée n'est exposée et aucune action financière possible. Mais l'UI est visible |
| **Impact** | Un visiteur non authentifié accède à l'URL `/manager/clients` et voit l'interface vide sans redirection vers /login. Risque de confusion et d'énumération d'endpoints |
| **Correction recommandée** | Implémenter la redirection dans `ProtectedRoute` : lire `session` depuis `AuthContext`, rediriger vers `/login` si `session === null && !loading` |

---

### 🔴 FAIL #4 — MODÉRÉ — Annulation sans `stripe_subscription_id` laisse la session Checkout ouverte

| | |
|---|---|
| **Fichier** | `supabase/functions/stripe-cancel-subscription/index.ts` |
| **Fonction** | Handler principal, L40-41 |
| **Code** | `if (sub.stripe_subscription_id) { await stripe.subscriptions.cancel(...) }` |
| **Risque** | Modéré — Si l'abonnement est en status `trialing` (Checkout non complétée), l'annulation DB est faite mais la Checkout Session Stripe reste ouverte (expire après 7 jours max). Un client pourrait compléter le paiement après l'annulation Manager |
| **Impact** | Abonnement marqué 'cancelled' en DB, mais le webhook `checkout.session.completed` serait reçu plus tard et passerait l'abonnement en `active` — incohérence état |
| **Correction recommandée** | Si `stripe_subscription_id` est NULL mais que `stripe_checkout_session_id` existe, appeler `stripe.checkout.sessions.expire(stripe_checkout_session_id)` pour invalider la session Checkout avant l'annulation DB |

---

### 🟠 WARNING #1 — RLS policy trop permissive sur `subscriptions`

| | |
|---|---|
| **Fichier** | `supabase/migrations/014_payments_v2.sql` L49-53 |
| **Risque** | Faible (contexte Manager mono-admin) — `FOR ALL TO authenticated USING (true)` : tout utilisateur Supabase authentifié a lecture/écriture sur tous les abonnements. Pas de filtrage par rôle |
| **Correction recommandée** | Acceptable en l'état pour un contexte interne mono-admin. Ajouter un filtre par rôle (`auth.jwt() ->> 'role' = 'admin'`) avant ouverture multi-utilisateurs |

---

### 🟠 WARNING #2 — `invoice.payment_failed` peut écraser un abonnement annulé

| | |
|---|---|
| **Fichier** | `supabase/functions/stripe-webhook/index.ts` L169-180 |
| **Risque** | Faible — Si Stripe envoie un `invoice.payment_failed` pour un abonnement déjà 'cancelled', le statut DB repasse à 'past_due' |
| **Correction recommandée** | Ajouter `AND status != 'cancelled'` dans la clause WHERE du UPDATE |

---

### 🟠 WARNING #3 — `customer.subscription.trial_will_end` non géré

| | |
|---|---|
| **Fichier** | `supabase/functions/stripe-webhook/index.ts` |
| **Risque** | Faible — Pas de notification envoyée avant la fin de la période d'essai |
| **Correction recommandée** | Ajouter un handler pour cet événement, ou configurer une notification Stripe Dashboard |

---

### 🟠 WARNING #4 — IDOR (Insecure Direct Object Reference) sur les fonctions abonnements

| | |
|---|---|
| **Fichiers** | `stripe-create-subscription/index.ts`, `stripe-cancel-subscription/index.ts` |
| **Risque** | Faible (contexte mono-admin) — Un manager authentifié peut créer/annuler l'abonnement de n'importe quel `client_id` / `subscription_id` sans vérification d'appartenance |
| **Correction recommandée** | Acceptable pour un Manager interne à accès unique. À corriger avant tout système multi-manager |

---

## Informations live (Supabase)

| Fonction | `verify_jwt` | Version | Statut |
|---|---|---|---|
| stripe-create-subscription | `true` | v7 | ACTIVE |
| stripe-cancel-subscription | `true` | v7 | ACTIVE |
| stripe-create-checkout | `true` | v9 | ACTIVE |
| stripe-create-payment | `true` | v8 | ACTIVE |
| stripe-webhook | `false` | v14 | ACTIVE |
| loic-chat | `false` | v34 | ACTIVE |

| Donnée | Valeur |
|---|---|
| Abonnements en DB | **0** (table vide — aucune donnée de test) |
| Projet Supabase | `jhcyooksjeivajdjicka` (CA-TECH) |
| Région | `eu-west-1` |

---

## Conclusion

```
🔴 ABONNEMENTS NON PRÊTS POUR PRODUCTION
```

**Avant toute mise en production, corriger obligatoirement :**
1. 🔴 FAIL #1 — `stripe-create-checkout` : lire `amount_ttc` depuis la DB, jamais depuis le body
2. 🔴 FAIL #2 — `stripe-webhook` `invoice.payment_succeeded` : ajouter idempotence avant INSERT
3. 🔴 FAIL #3 — `ProtectedRoute` : implémenter la redirection vers /login si non authentifié
4. 🔴 FAIL #4 — `stripe-cancel-subscription` : expirer la Checkout Session si `stripe_subscription_id` NULL

**Peuvent attendre la V2 :**
- 🟠 WARNING #1 : RLS filtrage par rôle
- 🟠 WARNING #2 : Guard `invoice.payment_failed` vs 'cancelled'
- 🟠 WARNING #3 : Handler `trial_will_end`
- 🟠 WARNING #4 : Vérification IDOR

---

*SPRINT 10.4 TERMINÉ — AUDIT ABONNEMENTS TERMINÉ — AUCUNE CORRECTION AUTOMATIQUE*
