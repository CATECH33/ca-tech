# STRIPE ABONNEMENTS — RAPPORT D'IMPLÉMENTATION

**Date** : 2026-08-12  
**Sprint** : 10.3 — Stripe Abonnements Maintenance  
**Projet Supabase** : `jhcyooksjeivajdjicka`

---

## 1. Périmètre

Implémentation complète du flux abonnement maintenance CA-TECH :

```
Client → Fiche client (Manager) → Sélection plan → Edge Function → Stripe Checkout
                                                                        ↓
                                                               Client entre sa CB
                                                                        ↓
                                                              Webhook Stripe → subscriptions
                                                                        ↓
                                                              Manager affiche statut live
```

---

## 2. Edge Functions déployées

### 2.1 `stripe-create-subscription` — v2 ACTIVE

**Endpoint** : POST `/functions/v1/stripe-create-subscription`  
**Auth** : `verify_jwt: true` (Manager authentifié uniquement)

**Payload accepté** :
```json
{
  "client_id": "uuid",
  "plan": "vitrine" | "ecommerce" | "ia",
  "devis_id": "uuid (optionnel)"
}
```

**Plans serveur (montants non modifiables côté frontend)** :

| Plan | Nom | Montant |
|---|---|---|
| `vitrine` | Maintenance Site Vitrine | 49 €/mois |
| `ecommerce` | Maintenance E-commerce | 99 €/mois |
| `ia` | Maintenance IA / Sur-mesure | 149 €/mois |

**Comportement** :

1. Validation plan + client_id
2. Lecture `stripe_customer_id` existant sur la ligne client (si le client a déjà payé un acompte via `stripe-create-payment`, le Customer Stripe est réutilisé — via `stripe_payment_links` ou en cherchant dans `subscriptions`)
3. Création Customer Stripe si absent
4. **Vérification doublon application** : SELECT abonnement actif/trialing avec même `client_id` + `name` → retourne 409 si trouvé
5. Création Session Checkout Stripe mode `subscription`
6. INSERT dans `subscriptions` avec colonnes V2 : `client_id`, `devis_id`, `name`, `amount`, `currency='eur'`, `frequency='monthly'`, `status='trialing'`, `stripe_customer_id`, `stripe_checkout_session_id`
7. Retourne `{ url: "https://checkout.stripe.com/..." }`

**Sécurité** :
- Montants définis côté serveur uniquement — le frontend envoie uniquement le plan slug
- `STRIPE_SECRET_KEY` uniquement dans la Edge Function
- JWT Supabase vérifié sur chaque requête

---

### 2.2 `stripe-cancel-subscription` — v2 ACTIVE

**Endpoint** : POST `/functions/v1/stripe-cancel-subscription`  
**Auth** : `verify_jwt: true`

**Payload accepté** :
```json
{
  "subscription_id": "uuid (ID interne DB)"
}
```

**Comportement** :

1. Lecture `subscriptions` : `id`, `stripe_subscription_id`, `status`
2. Si `stripe_subscription_id` présent → annulation Stripe (`stripe.subscriptions.cancel`)
3. UPDATE DB : `status='cancelled'`, `cancelled_at=NOW()`
4. Retourne `{ success: true }`

---

### 2.3 `stripe-webhook` — v6 ACTIVE (inchangé)

Le webhook existant gère déjà les abonnements depuis v6. Aucune modification nécessaire.

**Événements gérés** :

| Événement Stripe | Action DB |
|---|---|
| `checkout.session.completed` (mode subscription) | UPDATE `stripe_subscription_id`, `status`, `current_period_start/end` |
| `customer.subscription.updated` | UPDATE `status`, `current_period_start/end` |
| `customer.subscription.deleted` | UPDATE `status='cancelled'`, `cancelled_at` |
| `invoice.payment_succeeded` | UPDATE `status='active'`, `current_period_start/end` |
| `invoice.payment_failed` | UPDATE `status='past_due'` |
| `charge.refunded` | — (payments existant) |

**Mapping status Stripe → DB** :

| Stripe | DB |
|---|---|
| `active` | `active` |
| `trialing` | `trialing` |
| `past_due` | `past_due` |
| `unpaid` | `past_due` |
| `canceled` | `cancelled` |
| `paused` | `paused` |

Note : `unpaid` n'est jamais stocké directement — mappé vers `past_due`.

---

## 3. Schéma subscriptions V2 (déjà migré — Sprint 10.2)

| Colonne | Rôle |
|---|---|
| `client_id` | Client CA-TECH |
| `devis_id` | Lien projet (optionnel) |
| `name` | Offre maintenance |
| `amount` | Montant mensuel |
| `frequency` | `monthly` \| `annual` |
| `status` | `active` \| `trialing` \| `past_due` \| `cancelled` \| `paused` |
| `stripe_customer_id` | Customer Stripe |
| `stripe_subscription_id` | Subscription Stripe (UNIQUE) |
| `stripe_checkout_session_id` | Session Checkout |
| `stripe_price_id` | Prix Stripe (rempli par webhook) |
| `current_period_start` | Début période active |
| `current_period_end` | Prochaine échéance |
| `cancelled_at` | Date annulation |

---

## 4. Interface Manager — `Clients.tsx`

### Tab « Abonnements » dans la fiche client

**Tableau** : Plan | Montant | Statut | Date de début | Prochain renouvellement | Action

- Montant : `{formatCurrency(a.amount)}{a.frequency === 'monthly' ? '/mois' : '/an'}` (dynamique)
- Date de début : `current_period_start` (rempli par webhook après paiement)
- Prochain renouvellement : `current_period_end`
- Statuts affichés : Actif (vert) | En cours — trialing (bleu) | En retard (orange) | Annulé / En pause (gris)
- Bouton annulation (Ban icon) avec confirmation

**Modal création** :

- Sélection plan avec prix (vitrine 49€ | ecommerce 99€ | ia 149€)
- Lien optionnel à un devis accepté du client
- Bouton « Générer le lien Stripe » → ouvre Checkout Stripe dans nouvel onglet

### Hooks (inchangés — déjà V2-compatibles)

- `useSubscriptions(clientId)` — liste des abonnements par client
- `useCreateSubscriptionCheckout()` — POST stripe-create-subscription → retourne URL
- `useCancelSubscription()` — POST stripe-cancel-subscription

---

## 5. Règles de sécurité appliquées

| Règle | Application |
|---|---|
| Montants serveur uniquement | Plans définis dans la Edge Function — frontend envoie uniquement le slug |
| Pas de clé secrète frontend | `STRIPE_SECRET_KEY` uniquement dans Edge Functions |
| `verify_jwt: false` webhook uniquement | stripe-create-subscription et stripe-cancel-subscription : `verify_jwt: true` |
| Signature Stripe vérifiée | stripe-webhook v6 : `stripe.webhooks.constructEvent()` |
| Webhook idempotent | Lookup par `stripe_checkout_session_id` ou `stripe_subscription_id` — UPDATE si déjà présent |
| Vérification doublon (application) | SELECT active/trialing par client+plan → 409 si trouvé |

---

## 6. Anomalie signalée — Contrainte UNIQUE DB non créée

**Contexte** : L'Edge Function implémente une vérification applicative contre la création de deux abonnements actifs identiques (même `client_id` + même `name` avec status `active` ou `trialing`). Cette vérification retourne HTTP 409 si un doublon est détecté.

**Contrainte SQL correspondante — non créée** :

```sql
CREATE UNIQUE INDEX subscriptions_active_per_client_plan
  ON subscriptions(client_id, name)
  WHERE status IN ('active', 'trialing');
```

**Raison de non-création** : la règle du sprint interdit de créer automatiquement cette contrainte — elle nécessite validation explicite avant d'être appliquée en production, car elle bloquerait un re-abonnement immédiat après annulation si le status n'a pas encore été mis à jour par le webhook.

**Recommandation** : valider et créer dans un sprint maintenance dédié après observation du comportement en Test Mode.

---

## 7. Configuration Stripe requise (manuel)

### Dashboard Stripe → Webhooks

Vérifier que l'endpoint webhook inclut les événements suivants :

| Événement | Géré par |
|---|---|
| `checkout.session.completed` | stripe-webhook v6 |
| `customer.subscription.created` | stripe-webhook v6 |
| `customer.subscription.updated` | stripe-webhook v6 |
| `customer.subscription.deleted` | stripe-webhook v6 |
| `invoice.payment_succeeded` | stripe-webhook v6 |
| `invoice.payment_failed` | stripe-webhook v6 |
| `charge.refunded` | stripe-webhook v6 |

### Dashboard Stripe → Produits/Prix

Créer en Test Mode les 3 prix récurrents correspondant aux plans :

| Plan | Montant | Intervalle | ID à copier dans l'Edge Function |
|---|---|---|---|
| Maintenance Site Vitrine | 49 € | monthly | `price_xxx` |
| Maintenance E-commerce | 99 € | monthly | `price_xxx` |
| Maintenance IA / Sur-mesure | 149 € | monthly | `price_xxx` |

Mettre à jour `stripe_price_id` dans `stripe-create-subscription` une fois les prix créés.

Note : la version v2 actuelle crée la session Checkout avec `unit_amount` et `currency` en inline pricing — les `stripe_price_id` Stripe Dashboard sont optionnels mais recommandés pour une meilleure gestion des prix.

---

## 8. Tests

| Test | Résultat |
|---|---|
| TypeScript typecheck | ✅ 0 erreur |
| Build Vite | ✅ Succès (2.20s) |
| `stripe-create-subscription` v2 déployée | ✅ ACTIVE |
| `stripe-cancel-subscription` v2 déployée | ✅ ACTIVE |
| `stripe-webhook` v6 | ✅ ACTIVE (inchangé) |
| UI fiche client — tab abonnements | ✅ Dynamique (fréquence, date début, prochain renouvellement) |

---

## 9. État des Edge Functions

| Edge Function | Version | Statut |
|---|---|---|
| `stripe-create-subscription` | v2 | ✅ ACTIVE |
| `stripe-cancel-subscription` | v2 | ✅ ACTIVE |
| `stripe-webhook` | v6 | ✅ ACTIVE |
| `stripe-create-payment` | v4 | ✅ ACTIVE |

---

## 10. Anomalies

| # | Anomalie | Niveau | Action |
|---|---|---|---|
| A1 | Contrainte UNIQUE DB abonnements actifs non créée | 🟡 Signalé | Validation requise — voir §6 |
| A2 | `stripe_price_id` non rempli à la création (inline pricing) | 🟢 Nul | Rempli par webhook `customer.subscription.updated` |
| A3 | `stripe_customer_id` récupération complexe si client sans abonnement précédent | 🟢 Nul | Edge Function crée le Customer Stripe si absent |

---

**SPRINT 10.3 TERMINÉ — ABONNEMENTS STRIPE IMPLÉMENTÉS EN TEST MODE**
