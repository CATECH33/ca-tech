# STRIPE FINAL SECURITY AUDIT — CA-TECH

**Date** : 2026-08-12  
**Scope** : stripe-create-payment v2 · stripe-webhook v6 · migration 014 · DevisPaymentSection · RLS  
**Mode** : Lecture seule — aucune modification effectuée  
**Environnement cible** : Stripe Test Mode

---

## Légende

🟢 PASS — contrôle validé  
🟠 WARNING — fonctionne mais risque identifié  
🔴 FAIL — défaut de sécurité ou d'intégrité confirmé

---

## 1. Montants — Calcul côté serveur

| Contrôle | Résultat | Détail |
|---|---|---|
| Acompte 50 % calculé serveur | 🟢 PASS | `amount = Number(devis.total) * 0.5` — lu depuis la DB |
| Solde 50 % calculé serveur | 🟢 PASS | Même formule, indépendant du frontend |
| Frontend n'envoie pas de montant | 🟢 PASS | `useCreateStripeProjectPayment` → `{ devis_id, payment_type }` uniquement |
| Body ignoré si `amount` injecté | 🟢 PASS | Edge Function destructure uniquement `devis_id` + `payment_type` |
| `unit_amount` Stripe fixé serveur | 🟢 PASS | `amountCents = Math.round(amount * 100)` — jamais lu du body |

---

## 2. Contrôles d'accès et séquencement

| Contrôle | Résultat | Détail |
|---|---|---|
| Devis doit être `accepted` | 🟢 PASS | `if (devis.status !== 'accepted') → 400` |
| Double acompte impossible | 🟢 PASS | v2 : SELECT + retour 400 si ligne existante (`payment_type='acompte'`) |
| Double solde impossible | 🟢 PASS | v2 : SELECT + retour 400 si ligne existante (`payment_type='solde'`) |
| Solde bloqué avant acompte payé | 🟢 PASS | `acompte.status !== 'paid'` → 400 |
| UI : bouton solde désactivé | 🟢 PASS | `canGenerate={acompte?.status === 'payee'}` |
| UI : bouton acompte masqué si facture existe | 🟢 PASS | Condition `canGenerate && !invoice` |

**🔴 FAIL — TOCTOU race condition (double acompte / double solde)**

- **Fichier** : `supabase/functions/stripe-create-payment/index.ts` lignes 45–73
- **Fonction** : bloc de contrôle d'intégrité
- **Problème** : L'Edge Function effectue un `SELECT ... maybeSingle()` puis un `INSERT` séparément. Si deux requêtes simultanées arrivent pour le même `(devis_id, 'acompte')`, les deux peuvent passer le SELECT avant que l'un n'ait inséré. Résultat : deux factures acompte pour le même devis.
- **Risque** : Double facturation client, double paiement Stripe possible, incohérence comptable.
- **Correction recommandée** :
  ```sql
  -- migration à appliquer sur invoices
  CREATE UNIQUE INDEX invoices_devis_payment_type_key
    ON invoices (devis_id, payment_type)
    WHERE devis_id IS NOT NULL AND payment_type IN ('acompte', 'solde');
  ```
  Cette contrainte DB-level rend le race condition impossible — le second INSERT échouerait avec une erreur UNIQUE violation que l'Edge Function intercepterait.

---

## 3. Webhook — Sécurité et intégrité

| Contrôle | Résultat | Détail |
|---|---|---|
| Vérification signature Stripe | 🟢 PASS | `stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET)` → 400 si invalide |
| `verify_jwt: false` justifié | 🟢 PASS | Stripe est server-to-server, pas de JWT Supabase |
| Idempotence — vérification code | 🟢 PASS | SELECT `payments WHERE stripe_payment_id` avant INSERT |
| Idempotence — index DB | 🟢 PASS | `payments_stripe_payment_id_key` : UNIQUE partiel WHERE NOT NULL, confirmé en base |
| Signature invalide → 400 | 🟢 PASS | Bloc try/catch dédié, log + return 400 |
| Paiement lié au client | 🟢 PASS | `client_id` lu depuis la facture en DB (metadata non trust-ée) |
| Paiement lié au devis | 🟢 PASS | Via `invoice_id → invoices.devis_id` |
| Conservation des anciens paiements | 🟢 PASS | Aucun DELETE, `charge.refunded` → UPDATE status uniquement |
| `checkout.session.completed` mode=payment | 🟢 PASS | Chemin acompte/solde correctement isolé du chemin subscription |

**🟠 WARNING — `invoice_id` nullable dans `payments`**

- **Fichier** : Schema DB `payments`, vérifiable par `2200_17902_1_not_null` (liste des NOT NULL)
- **Problème** : `invoice_id` n'est pas dans la liste des contraintes NOT NULL de `payments`. Les paiements de renouvellement d'abonnement sont insérés sans `invoice_id`. Pas de risque immédiat pour l'acompte/solde (le webhook le set toujours), mais laisse la porte ouverte à des paiements orphelins.
- **Correction recommandée** : Ajouter une contrainte CHECK conditionnelle ou documenter le cas nominal.

---

## 4. Distinction deposit / balance

| Contrôle | Résultat | Détail |
|---|---|---|
| `payment_type` stocké en DB | 🟢 PASS | Colonne `invoices.payment_type` CHECK IN ('acompte','solde','unique') |
| `payment_type` dans metadata Stripe | 🟢 PASS | `metadata: { payment_type, invoice_id, devis_id, client_id }` |
| Webhook lit le type depuis la DB | 🟢 PASS | `inv.payment_type` lu depuis `invoices` — pas depuis les metadata Stripe |
| Solde = 50 % recalculé (non résiduel) | 🟢 PASS | Les deux paiements sont toujours `devis.total * 0.5` — design intentionnel |

---

## 5. Association client / devis / paiement

| Contrôle | Résultat | Détail |
|---|---|---|
| Invoice → client_id FK | 🟢 PASS | `invoices_client_id_fkey` confirmée en base |
| Invoice → devis_id FK | 🟢 PASS | `invoices_devis_id_fkey` confirmée en base |
| Payment → invoice_id FK | 🟢 PASS | `payments_invoice_id_fkey` confirmée en base |
| Payment → client_id FK | 🟢 PASS | `payments_client_id_fkey` confirmée en base |

**🟠 WARNING — Pas de lien direct `payments.devis_id`**

- Le chemin `payments → invoices → devis` est indirect.
- Pour retrouver tous les paiements d'un devis : `SELECT p.* FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE i.devis_id = ?`
- Pas un défaut de sécurité, mais une complexité de requêtage. Note d'architecture.

---

## 6. Secrets Stripe — Absence dans le frontend

| Contrôle | Résultat | Détail |
|---|---|---|
| Aucun `sk_` dans le frontend | 🟢 PASS | Grep sur `manager/src/**/*.ts` — aucune occurrence |
| Aucun `pk_test` / `pk_live` | 🟢 PASS | Idem |
| Aucune variable `VITE_STRIPE_*` | 🟢 PASS | Seuls `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` exposés |
| `STRIPE_SECRET_KEY` — Edge Function uniquement | 🟢 PASS | `Deno.env.get('STRIPE_SECRET_KEY')` — secret Supabase, non exposé |
| `STRIPE_WEBHOOK_SECRET` — Edge Function uniquement | 🟢 PASS | Idem |
| Lien Stripe `stripe_payment_link` en DB | 🟢 PASS | URL publique Stripe, pas un secret — lecture légitime |

---

## 7. RLS — Row Level Security

| Table | RLS activé | Résultat | Détail |
|---|---|---|---|
| `invoices` | Oui | 🟢 PASS | Accès réservé aux utilisateurs authentifiés |
| `payments` | Oui | 🟢 PASS | Idem |
| `devis` | Oui | 🟢 PASS | Idem |
| `subscriptions` | Oui | 🟢 PASS | Idem |
| anon → invoices | — | 🟢 PASS | Aucune politique anon sur `invoices` ou `payments` |

**🟠 WARNING — Politiques RLS dupliquées**

- **Tables concernées** : `invoices`, `payments`, `subscriptions`
- **Problème** : Chaque table possède deux politiques `ALL TO authenticated USING (true)` distinctes (noms différents, effet identique). Résultat de migrations successives qui n'ont pas vérifié l'existence.
- **Risque** : Aucun impact fonctionnel, mais maintenance compliquée et risque de confusion si une future politique restrictive est ajoutée sans supprimer les permissives.
- **Correction recommandée** : Conserver une seule politique par table et supprimer le doublon.

**🟠 WARNING — RLS sans ownership (multi-tenant)**

- Les politiques utilisent `USING (true)` sans filtrer par `created_by` ou user_id.
- Tout utilisateur authentifié peut lire/modifier toute facture, tout paiement.
- **Risque** : Acceptable pour un manager solo (CA-TECH), non acceptable en mode SaaS multi-utilisateurs.
- **Correction recommandée** : Si multi-utilisateurs à terme : `USING (created_by = auth.uid())`.

**🟠 WARNING — `anon_insert_devis` policy**

- Les utilisateurs anonymes peuvent insérer dans `devis` (pour le formulaire prospect du site).
- Hors scope paiement, mais surface d'attaque potentielle si le formulaire n'est pas rate-limité.

---

## 8. Contraintes et index DB

| Contrôle | Résultat | Détail |
|---|---|---|
| `invoices.payment_type` CHECK | 🟢 PASS | `CHECK (payment_type IN ('acompte','solde','unique'))` confirmé |
| `invoices.invoice_number` UNIQUE | 🟢 PASS | Confirmé |
| `invoices.devis_id` FK | 🟢 PASS | `invoices_devis_id_fkey` confirmé |
| `payments_stripe_payment_id_key` UNIQUE partiel | 🟢 PASS | Confirmé, `WHERE stripe_payment_id IS NOT NULL` |
| `devis.status` CHECK | 🟢 PASS | `CHECK (status IN ('draft','sent','accepted','refused','expired'))` |

**🟠 WARNING — Pas d'index sur `invoices.devis_id`**

- **Fichier** : DB schema (indexes confirmés par requête)
- **Problème** : `useDevisInvoices(devisId)` fait `SELECT * FROM invoices WHERE devis_id = ?`. Aucun index n'existe sur cette colonne → sequential scan sur `invoices` à chaque ouverture d'un devis.
- **Risque** : Performance dégradée à mesure que la table `invoices` grossit.
- **Correction recommandée** :
  ```sql
  CREATE INDEX IF NOT EXISTS idx_invoices_devis_id ON invoices (devis_id) WHERE devis_id IS NOT NULL;
  ```

**🔴 FAIL — Table `subscriptions` : schéma DB incompatible avec les Edge Functions**

- **Fichier** : `supabase/migrations/014_payments_v2.sql` + `supabase/functions/stripe-create-subscription/index.ts`
- **Problème** : La migration 014 contient `CREATE TABLE IF NOT EXISTS subscriptions (...)` avec les colonnes V2 (`name`, `amount`, `frequency`, `status IN ('active','paused','cancelled','past_due','trialing')`, `stripe_checkout_session_id`). Mais une table `subscriptions` existait déjà (migration `create_subscriptions` v20260810080410) avec un schéma différent (`offre`, `montant`, `frequence IN ('mensuel','annuel')`, `status IN ('pending','active','suspended','cancelled','expired')`, `stripe_payment_link_id` FK).
- **Conséquence** : `CREATE TABLE IF NOT EXISTS` n'a pas créé la table V2 — l'ancienne a été conservée silencieusement.
- **Edge Functions impactées** : `stripe-create-subscription` (INSERT sur colonnes inexistantes `name`, `amount`, `frequency`, `stripe_checkout_session_id`) et `stripe-cancel-subscription` (UPDATE sur `stripe_subscription_id`) échoueront à l'exécution.
- **Hors scope acompte/solde** (pas bloquant pour ce sprint), mais risque de confusion et d'erreurs en production si les abonnements sont activés.
- **Correction recommandée** : Créer une migration `015_subscriptions_v2_rename.sql` qui renomme/ajoute les colonnes manquantes sur la table existante via `ALTER TABLE subscriptions RENAME COLUMN / ADD COLUMN IF NOT EXISTS`.

---

## 9. Durée d'expiration Stripe Checkout

**🟠 WARNING — `expires_at = +30 jours`**

- **Fichier** : `supabase/functions/stripe-create-payment/index.ts` ligne 146
- **Problème** : `Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60` — durée maximale autorisée par Stripe. Un lien valable 30 jours peut être partagé, transmis à un tiers, ou subsister après modification du devis.
- **Risque** : Si le devis est modifié ou annulé entre la génération et le paiement, le lien reste valide et correspond à l'ancien montant (figé côté Stripe).
- **Correction recommandée** : Réduire à 7 jours (`7 * 24 * 60 * 60`) et prévoir une action "Régénérer le lien" si expiré.

---

## 10. Scénarios Test Mode — Analyse code path

> Les Edge Functions sont actives en production Supabase (STRIPE_SECRET_KEY en mode test). L'analyse ci-dessous est une revue de code path — non une exécution live.

| Scénario | Code Path | Résultat |
|---|---|---|
| **1. Acompte 50 % réussi** | Frontend → `stripe-create-payment` → devis.total * 0.5 → Invoice + Session Stripe → webhook `checkout.session.completed` → INSERT payments + UPDATE invoices `paid` | 🟢 PASS |
| **2. Solde 50 % réussi** | Idem, après `acompte.status='paid'` validé côté serveur | 🟢 PASS |
| **3. Deuxième acompte refusé** | Edge Function v2 : SELECT existant → `400 "Un acompte existe déjà"` ; UI : bouton absent | 🟢 PASS |
| **4. Solde avant acompte refusé** | `acompte.status !== 'paid'` → `400 "L'acompte doit être payé"` ; UI : "Acompte requis d'abord" | 🟢 PASS |
| **5. Deuxième solde refusé** | Edge Function v2 : SELECT existant → `400 "Un solde existe déjà"` | 🟢 PASS |
| **6. Modification montant refusée** | Corps injecté avec `amount` → ignoré, `unit_amount` toujours `Math.round(devis.total * 0.5 * 100)` | 🟢 PASS |
| **7. Webhook répété sans doublon** | SELECT `payments WHERE stripe_payment_id` → existant → `return 'OK' 200` sans INSERT | 🟢 PASS |

**Scénario TOCTOU (non testé, voir §2) :** deux requêtes simultanées pour le même devis → risque de double INSERT non couvert par le code actuel.

---

## 11. Synthèse des résultats

| Catégorie | 🟢 PASS | 🟠 WARNING | 🔴 FAIL |
|---|---|---|---|
| Calcul montant serveur | 5 | 0 | 0 |
| Contrôles séquencement | 6 | 0 | 1 (TOCTOU) |
| Webhook sécurité | 9 | 1 | 0 |
| Distinction deposit/balance | 4 | 0 | 0 |
| Association client/devis/paiement | 4 | 1 | 0 |
| Secrets Stripe / frontend | 6 | 0 | 0 |
| RLS | 5 | 3 | 0 |
| Contraintes et index | 5 | 1 | 1 (subscriptions schema) |
| Expiration liens | 0 | 1 | 0 |
| Scénarios Test Mode | 7 | 0 | 0 |
| **TOTAL** | **51** | **7** | **2** |

---

## 12. Défauts à corriger (ordre de priorité)

### 🔴 FAIL 1 — Race condition double acompte/solde
- **Fichier** : `supabase/functions/stripe-create-payment/index.ts`
- **Risque** : Double facturation — critique
- **Fix** : `CREATE UNIQUE INDEX invoices_devis_payment_type_key ON invoices (devis_id, payment_type) WHERE devis_id IS NOT NULL AND payment_type IN ('acompte','solde')`

### 🔴 FAIL 2 — Subscriptions : schéma DB incompatible avec Edge Functions
- **Fichiers** : `supabase/migrations/014_payments_v2.sql`, `supabase/functions/stripe-create-subscription/`, `stripe-cancel-subscription/`
- **Risque** : Crash runtime sur toute action abonnement
- **Fix** : Migration `015_subscriptions_v2_rename.sql` pour aligner les colonnes

### 🟠 WARNING 1 — Index manquant sur `invoices.devis_id`
- **Fix** : `CREATE INDEX idx_invoices_devis_id ON invoices (devis_id) WHERE devis_id IS NOT NULL`

### 🟠 WARNING 2 — Expiration Checkout à 30 jours
- **Fichier** : `stripe-create-payment/index.ts` ligne 146
- **Fix** : Remplacer par `7 * 24 * 60 * 60`

### 🟠 WARNING 3 — Politiques RLS dupliquées
- **Fix** : Migration pour supprimer les doublons (`auth_all` à conserver, supprimer les "Authenticated full access *")

---

**STRIPE FINAL AUDIT TERMINÉ — AUCUNE MODIFICATION EFFECTUÉE**
