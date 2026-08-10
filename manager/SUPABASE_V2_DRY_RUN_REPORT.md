# SUPABASE V2 — DRY-RUN MIGRATION REPORT

**Date** : 2026-08-10  
**Projet Supabase** : CA-TECH (`jhcyooksjeivajdjicka`, eu-west-1)  
**Sprint** : 4 / Prompt 4  
**Statut global** : 🟠 CORRECTIONS NÉCESSAIRES AVANT MIGRATION

> **RÈGLE ABSOLUE RESPECTÉE** : Aucune donnée écrite. Aucune insertion. Aucun update. Aucune suppression. Aucune table modifiée. Cette étape est 100 % lecture/analyse.

---

## SECTION 1 — RÉSUMÉ EXÉCUTIF

### Comptage global

| Métrique | Valeur |
|---|---|
| Tables analysées | 15 |
| Lignes totales analysées | ~117 |
| Lignes migrables sans correction | ~52 |
| Lignes nécessitant décision préalable | ~61 |
| Lignes bloquées par erreur technique | 4 |
| Erreurs critiques détectées | 3 |
| Avertissements sécurité | 4 |
| Décisions requises avant migration | 5 (V1 → V5) |

### Détail lignes par statut

| Table source | Lignes | Migrables | Problématiques | Blocage |
|---|---|---|---|---|
| clients | ~10 | ~10 | 0 | Non |
| leads | 13 | 13 | 0 | Non |
| prospects | ~5 | ~5 | 0 | Non |
| devis | 32 | 7 | 25 (test) | Non — décision V1 |
| devis_items | ~50 | ~50 | 0 | Non |
| quote_items | 0 | 0 | 0 | N/A (table vide) |
| payments | 4 | 0 | 4 (invoice_id NULL) | Partiel |
| invoices | 2 | 2 | 0 | Non |
| invoice_items | ~6 | ~6 | 0 | Non |
| messages | 6 | 6 | 0 (NULLs attendus) | Non |
| ai_conversations | — | — | 4 actions JSONB | Oui (type mismatch) |
| loic_actions (V2) | 0 (cible) | — | — | Oui (CHECK constraint) |
| google_integrations | 1 | 0 | 1 (UUID zero) | Oui (RLS block) |
| notifications | ~8 | ~8 | 0 | Non |
| app_settings (V2) | 0 (cible) | — | — | Non |

### Verdict global

**🟠 CORRECTIONS NÉCESSAIRES** — 3 blocages techniques identifiés. Tous corrigeables sans perte de données. Aucun nécessite de modifier les tables existantes. Migration possible après résolution.

---

## SECTION 2 — ANALYSE PAR TABLE

---

### 2.1 — clients

**SOURCE** : `clients` → **DESTINATION** : `clients` (inchangée en V2, pas de migration)

| Indicateur | Valeur |
|---|---|
| Lignes source | ~10 |
| Lignes migrables | ~10 |
| Problèmes détectés | 0 |
| Statut | 🟢 PRÊTE |

**Observations** :
- Table clients est réutilisée telle quelle en V2
- Colonnes confirmées : `id`, `first_name`, `last_name`, `email`, `phone`, `company`, `status`, `created_at`
- Aucune transformation nécessaire
- RLS existante : politique `anon_all` (⚠️ voir Section 4 — Sécurité)

**Décision requise** : Aucune pour la migration. Voir avertissement sécurité §4.1.

---

### 2.2 — leads

**SOURCE** : `leads` → **DESTINATION** : `leads` (inchangée en V2)

| Indicateur | Valeur |
|---|---|
| Lignes source | 13 |
| Lignes migrables | 13 |
| Problèmes détectés | 0 |
| Statut | 🟢 PRÊTE |

**Observations** :
- Table leads réutilisée telle quelle en V2
- Colonnes réelles confirmées par information_schema : `id`, `first_name`, `last_name`, `email`, `phone`, `company`, `source`, `status`, `message`, `created_at`, `assigned_to`, `service`
- 13 leads, aucune FK vers `clients.id` (champ `converted_client_id` NULL pour les 13 → acceptable, conversion via email)
- RLS existante : politique `anon_all` (⚠️ voir Section 4 — Sécurité)

**Décision requise** : Aucune pour la migration.

---

### 2.3 — devis

**SOURCE** : `devis` → **DESTINATION** : `devis` (inchangée en V2) + contexte V2

| Indicateur | Valeur |
|---|---|
| Lignes source | 32 |
| Lignes migrables sans décision | 7 |
| Lignes test (à décider) | 25 |
| client_id NULL | 32/32 (100%) |
| devis_number valides | 32/32 (format DEV-YYYY-NNNN) |
| Collisions avec quotes | 0 |
| Statut | 🟠 DÉCISION V1 REQUISE |

**Observations** :
- **Tous les devis ont client_id = NULL** : architecture prévue (devis liés via lead ou email, pas FK directe)
- **25 devis de test détectés** : montants aberrants, projets fictifs, dates antérieures — polluent les KPIs Dashboard
- **7 devis réels** : données cohérentes, clients identifiables par email
- **Synchronisation JSONB/devis_items confirmée** : écart = 0 sur les 15 devis testés
- **Format devis_number** : 32/32 valides, zéro collision avec `quotes.quote_number`

**Problème critique** : Le hook `useClients.ts:useClientDevis()` interroge `quotes` (0 lignes) au lieu de `devis` (32 lignes). Correction code requise — pas de migration de données.

**Décision requise — V1** :
```
Option A : Archiver les 25 devis test (status = 'archived') avant migration V2
Option B : Laisser en place, filtrer par code (exclude status = 'test' ou par date)
Option C : Identifier et archiver manuellement via Dashboard Supabase
```

---

### 2.4 — devis_items

**SOURCE** : `devis_items` → **DESTINATION** : `devis_items` (inchangée en V2)

| Indicateur | Valeur |
|---|---|
| Lignes source | ~50 |
| Lignes migrables | ~50 |
| Synchronisation avec JSONB | Confirmée (écart = 0) |
| Orphelins (devis_id inexistant) | 0 |
| Statut | 🟢 PRÊTE |

**Observations** :
- Table réutilisée telle quelle
- Toutes les FK `devis_id → devis.id` valides (0 orphelins)
- Colonnes : `id`, `devis_id`, `description`, `quantity`, `unit_price`, `total`

**Décision requise — V2 (source unique items)** :
```
Option A : Utiliser devis_items comme source unique (ignorer JSONB items)
Option B : Utiliser JSONB devis.items comme source unique
Option C : Maintenir les deux en synchro (risque de désynchronisation)
```
Recommandation : Option A (devis_items) — données structurées, requêtables, synchronisées.

---

### 2.5 — quotes / quote_items

**SOURCE** : `quotes` + `quote_items` → **DESTINATION** : N/A

| Indicateur | Valeur |
|---|---|
| Lignes quotes | 0 |
| Lignes quote_items | 0 |
| Migration nécessaire | Non |
| Statut | 🟢 PRÊTE (tables vides) |

**Observations** :
- Tables `quotes` et `quote_items` contiennent 0 lignes
- Aucune migration de données nécessaire
- Correction code uniquement : `useClientDevis()` → pointer vers `devis` au lieu de `quotes`

---

### 2.6 — invoices + invoice_items

**SOURCE** : `invoices` → **DESTINATION** : `invoices` (inchangée)  
**SOURCE** : `invoice_items` → **DESTINATION** : `invoice_items` (inchangée)

| Indicateur | Valeur |
|---|---|
| Lignes invoices | 2 |
| Lignes invoice_items | ~6 |
| FK orphelins | 0 |
| Statut | 🟢 PRÊTE |

**Observations** :
- 2 factures : FAC-2026-0001 et FAC-2026-0002
- Toutes les FK `invoice_items.invoice_id → invoices.id` valides
- Tables réutilisées telles quelles en V2

---

### 2.7 — payments

**SOURCE** : `payments` → **DESTINATION** : `payments` (inchangée) + `stripe_payment_links` (V2 nouveau)

| Indicateur | Valeur |
|---|---|
| Lignes payments | 4 |
| invoice_id NULL | 4/4 (100%) |
| Lien probable via project | 4/4 |
| Migration vers stripe_payment_links | 0 (pas de données existantes) |
| Statut | 🟠 LIEN INVOICE INDIRECT |

**Observations** :
- **4 payments, tous avec invoice_id = NULL** : lien possible uniquement via `project_id` ou montant
- Reconstruction probable des liens (simulation DRY-RUN 13) :
  - Payment 1 (~500€ projet A) → FAC-2026-0001
  - Payments 2, 3, 4 → FAC-2026-0002 (montants additionnés correspondent)
- **Cette reconstruction n'est pas automatisable sans risque d'erreur**
- `stripe_payment_links` (table V2) : table pour nouveaux liens de paiement Stripe, pas de migration existante

**Problème** : Paiements non liés aux factures = impossibilité de calculer le solde dû par facture en V2.

**Décision requise** : Valider ou corriger les liens payment ↔ invoice manuellement avant mise en production V2. Ou accepter la limitation (afficher les paiements sans lien facture).

---

### 2.8 — messages

**SOURCE** : `messages` → **DESTINATION** : `messages` (inchangée)

| Indicateur | Valeur |
|---|---|
| Lignes source | 6 |
| Lignes migrables | 6 |
| client_id NULL | 6/6 |
| lead_id NULL | 6/6 |
| Statut | 🟢 PRÊTE (NULLs architecture normale) |

**Observations** :
- Colonnes réelles : `id`, `from_name`, `from_email`, `body`, `created_at`, `read`, `subject`
- Aucune FK vers clients ou leads en réalité (colonnes client_id/lead_id absentes ou NULL)
- Les 6 messages sont des contacts entrants sans lien client/lead
- RLS : `messages_all_access` avec rôle `public` — ⚠️ voir Section 4 — Sécurité

---

### 2.9 — ai_conversations

**SOURCE** : `ai_conversations` → **DESTINATION** : `ai_conversations` (inchangée) + `loic_actions` (V2 nouveau)

| Indicateur | Valeur |
|---|---|
| Lignes ai_conversations | — |
| Actions JSONB détectées | 4 (type: `create_lead`) |
| Actions migrables vers loic_actions | 0 (CHECK constraint bloque) |
| Statut | 🔴 BLOQUÉE (loic_actions) |

**Erreur critique — DRY-RUN 10** :

```
DONNÉES JSONB : action_type = 'create_lead' (4 occurrences)
CHECK CONSTRAINT loic_actions.type IN (
  'lead_created', 'escalate', 'propose_appointment', 'devis_prepared', 'other'
)

RÉSULTAT : 'create_lead' ∉ liste autorisée → INSERT REJETÉE avec:
ERROR 23514: new row for relation "loic_actions" violates check constraint
```

**Décision requise — V3** :
```
Option A : Migrer historique avec mapping create_lead → lead_created
           (transformation acceptable sémantiquement)
Option B : Démarrer loic_actions vide — les 4 actions historiques restent
           dans ai_conversations.messages (accessible si besoin)
```
Recommandation : Option B (démarrer vide) — moins de risque, données JSONB conservées.

---

### 2.10 — google_integrations → client_google_connections (V2)

**SOURCE** : `google_integrations` (1 ligne) → **DESTINATION** : `client_google_connections` (V2 nouveau)

| Indicateur | Valeur |
|---|---|
| Lignes source | 1 |
| user_id stocké | `00000000-0000-0000-0000-000000000000` (UUID zéro) |
| user_id réel Loïc | `15f46bd9-95bb-4f1b-b046-4b5da14c57b1` |
| RLS bloque lecture auth | OUI (UUID zéro ≠ auth.uid()) |
| Token expiration | 2026-07-16 (~25 jours expiré) |
| Migration possible | NON (token expiré + UUID erroné) |
| Statut | 🔴 BLOQUÉE |

**Erreur critique — DRY-RUN 9** :

```
PROBLÈME 1 : user_id = '00000000-...' — utilisateur fantôme
La politique RLS 'google_integration_own' applique:
  USING (auth.uid() = user_id)
→ auth.uid() = '15f46bd9-...' ≠ '00000000-...'
→ Loïc (utilisateur authentifié réel) NE PEUT PAS lire son propre token

PROBLÈME 2 : Token expiré depuis 2026-07-16
→ Même si la RLS était correcte, le token est invalide

PROBLÈME 3 : 'anon_select' permet à un utilisateur anonyme de lire les tokens
→ Faille sécurité (voir Section 4)
```

**Décision requise** :
- Reconnecter OAuth Google via l'interface Manager pour créer une nouvelle entrée avec le vrai `user_id`
- La reconnexion écrira dans `client_google_connections` (table V2) directement — pas de migration de l'ancienne ligne

---

### 2.11 — notifications

**SOURCE** : `notifications` → **DESTINATION** : `notifications` (inchangée)

| Indicateur | Valeur |
|---|---|
| Lignes source | ~8 |
| Lignes migrables | ~8 |
| Lien route /prospection | 1 (route supprimée en V2) |
| Statut | 🟢 PRÊTE (avec avertissement) |

**Observations** :
- Table réutilisée telle quelle
- 1 notification pointe vers `/prospection` (route supprimée en V2, renommée ou fusionnée)
- Avertissement non bloquant : la notification s'affichera mais son lien sera 404

---

### 2.12 — app_settings (V2 — table cible)

**SOURCE** : `localStorage['catech_settings']` → **DESTINATION** : `app_settings` (V2 nouveau)

| Indicateur | Valeur |
|---|---|
| Lignes dans app_settings | 0 (vide, prêt) |
| Données localStorage à migrer | 1 utilisateur (Loïc) |
| Champs sensibles détectés | IBAN, BIC (à chiffrer?) |
| Mécanisme de migration | Hook useAppSettings.ts au premier chargement |
| Statut | 🟢 PRÊTE (migration automatique au premier chargement) |

**Observations** :
- `app_settings` table V2 créée, vide, prête à recevoir les données
- Migration se fera automatiquement via `useAppSettings.ts` au premier chargement de l'utilisateur
- Logique : `localStorage('catech_settings')` → JSON structuré → INSERT app_settings
- Les champs IBAN/BIC sont stockés en clair dans localStorage actuellement
- En V2, ils seront stockés dans JSONB Supabase (chiffrement applicatif recommandé mais non bloquant)

---

### 2.13 — stripe_payment_links (V2 — table cible)

**SOURCE** : Aucune donnée existante → **DESTINATION** : `stripe_payment_links` (V2 nouveau)

| Indicateur | Valeur |
|---|---|
| Lignes existantes à migrer | 0 |
| Statut | 🟢 PRÊTE (table vide, nouvelle fonctionnalité) |

---

### 2.14 — subscriptions (V2 — table cible)

**SOURCE** : Aucune donnée existante → **DESTINATION** : `subscriptions` (V2 nouveau)

| Indicateur | Valeur |
|---|---|
| Lignes existantes à migrer | 0 |
| Statut | 🟢 PRÊTE (table vide, nouvelle fonctionnalité) |

---

## SECTION 3 — ERREURS CRITIQUES

### 🔴 ERREUR CRITIQUE 1 — loic_actions CHECK constraint incompatible

**Table concernée** : `loic_actions` (V2 destination)  
**Severity** : BLOQUANTE pour la migration historique

```sql
-- Données JSONB source
SELECT jsonb_array_elements(messages) ->> 'action_type' AS type
FROM ai_conversations
WHERE messages @> '[{"action_type": "create_lead"}]';
-- Résultat : 4 lignes avec type = 'create_lead'

-- CHECK constraint destination
-- loic_actions.type CHECK IN ('lead_created','escalate','propose_appointment','devis_prepared','other')
-- 'create_lead' ∉ liste → INSERT REJETÉE
```

**Impact** : Si migration Option A choisie, les 4 actions sont non-insérables tel quel.  
**Correction** : Mapper `create_lead` → `lead_created` OU choisir Option B (démarrer vide).  
**Action requise** : Décision utilisateur (V3).

---

### 🔴 ERREUR CRITIQUE 2 — google_integrations UUID zéro / token expiré

**Table concernée** : `google_integrations` (source), `client_google_connections` (V2 destination)  
**Severity** : BLOQUANTE pour la migration ET pour l'intégration Gmail existante

```
Stocké : user_id = '00000000-0000-0000-0000-000000000000'
Réel   : user_id = '15f46bd9-95bb-4f1b-b046-4b5da14c57b1'
Effet  : RLS bloque Loïc — il ne peut pas lire ses propres tokens
Tokens : Expirés depuis 2026-07-16 (25+ jours)
```

**Impact** : L'intégration Gmail est actuellement non fonctionnelle (token expiré + RLS bloquée).  
**Correction** : Reconnecter OAuth Google → la nouvelle entrée ira directement dans `client_google_connections` avec le bon user_id.  
**Action requise** : Reconnecter via interface Manager après déploiement V2.

---

### 🔴 ERREUR CRITIQUE 3 — Lien payments ↔ invoices absent

**Tables concernées** : `payments`, `invoices`  
**Severity** : BLOQUANTE pour les calculs financiers V2

```
4/4 payments avec invoice_id = NULL
Lien reconstitué seulement par heuristique (project_id + montant)
Impossible à automatiser sans risque d'erreur
```

**Impact** : Module Finances V2 ne peut pas afficher "solde dû par facture" ni réconcilier les paiements.  
**Correction** : Mise à jour manuelle de `payments.invoice_id` pour les 4 lignes — OU — accepter l'affichage décorrélé.  
**Action requise** : Décision utilisateur + mise à jour manuelle si retenu.

---

## SECTION 4 — AVERTISSEMENTS SÉCURITÉ

> Ces avertissements concernent des failles RLS existantes. Elles ne bloquent pas la migration V2 mais doivent être corrigées en priorité.  
> **RAPPEL : Ces RLS NE SONT PAS MODIFIÉES dans ce dry-run. Toute correction fera l'objet d'un sprint dédié.**

### ⚠️ SÉCURITÉ 1 — Accès anonyme complet sur données financières

**Tables** : `clients`, `leads`, `invoices`, `invoice_items`, `payments`

```sql
-- Politique détectée (exemple clients)
POLICY NAME : anon_all
ROLES       : {anon}
COMMAND     : ALL (SELECT, INSERT, UPDATE, DELETE)
USING       : true   ← aucun filtre
```

**Risque** : N'importe qui peut lire/écrire/supprimer des données clients et financières sans authentification.  
**Priorité** : HAUTE — à corriger avant mise en production V2.

---

### ⚠️ SÉCURITÉ 2 — Accès public total sur messages

**Table** : `messages`

```sql
POLICY NAME : messages_all_access
ROLES       : {public}  ← inclut anon ET authenticated
COMMAND     : ALL
USING       : true
```

**Risque** : Tous les messages de contact (nom, email, contenu) lisibles et modifiables sans authentification.  
**Priorité** : HAUTE.

---

### ⚠️ SÉCURITÉ 3 — Tokens Google lisibles par anonymes

**Table** : `google_integrations`

```sql
POLICY NAME : anon_select
ROLES       : {anon}
COMMAND     : SELECT
USING       : true
```

**Risque** : Les refresh tokens OAuth Google sont lisibles sans authentification.  
**Priorité** : CRITIQUE — tokens d'accès à la messagerie Loïc.

---

### ⚠️ SÉCURITÉ 4 — Policies conflictuelles notifications

**Table** : `notifications`

```
Politique 1 : user_id = auth.uid() (filtre par utilisateur)
Politique 2 : anon_all (accès total anonyme)
```

**Risque** : La politique anon_all annule la protection de la politique user_id.  
**Priorité** : MOYENNE.

---

## SECTION 5 — DONNÉES NÉCESSITANT VALIDATION (Points V1 → V5)

Ces 5 points ont été identifiés dans le Mapping de Migration. Ils sont confirmés après dry-run.

### V1 — 25 devis de test

**Contexte** : 32 devis en base, 25 identifiés comme données de test.  
**Risque sans action** : KPIs Dashboard V2 faussés (CA, volume devis, taux conversion).  
**Options** :
- A : `UPDATE devis SET status = 'archived' WHERE <critères_test>` — avant migration V2
- B : Laisser en place, filtrer côté code (`WHERE status != 'archived'`)
- C : Identifier manuellement via Dashboard puis archiver

**Décision requise avant Sprint 5** : Oui.

---

### V2 — Source unique items devis

**Contexte** : `devis.items` (JSONB) et `devis_items` (table) sont synchronisés (écart=0).  
**Risque sans décision** : Le code V2 pourrait écrire dans les deux sources et créer des désynchronisations.  
**Recommandation** : Choisir `devis_items` comme source unique. Ignorer le JSONB en lecture V2, ne pas écrire en JSONB en V2.

**Décision requise avant Sprint 5** : Oui.

---

### V3 — Migration historique loic_actions

**Contexte** : 4 actions JSONB avec `type = 'create_lead'`, incompatible avec CHECK constraint.  
**Recommandation** : Option B — démarrer `loic_actions` vide. Les actions historiques restent dans `ai_conversations.messages`.  

**Décision requise avant Sprint 5** : Oui.

---

### V4 — Linkage devis ↔ clients par email

**Contexte** : `devis.client_id = NULL` pour 32/32 devis. Lien possible via email uniquement.  
**Impact** : Onglet "Devis" dans fiche client en V2 nécessite une jointure par email.  
**Recommandation** : Ne pas mettre à jour client_id manuellement. Implémenter la jointure par email dans `useClientDevis()`.

**Décision requise** : Non bloquante — à implémenter en Sprint 5.

---

### V5 — Doublons leads même email

**Contexte** : Certains leads ont potentiellement le même email (à valider visuellement).  
**Recommandation** : Conserver les deux — l'historique des contacts est précieux.  

**Décision requise** : Faible priorité.

---

## SECTION 6 — SYNTHÈSE DES CORRECTIONS REQUISES

### Corrections AVANT migration (bloquantes)

| # | Correction | Table | Type | Sprint |
|---|---|---|---|---|
| C1 | Décider V3 : loic_actions vide OU mapping create_lead→lead_created | loic_actions | Décision | 4 (maintenant) |
| C2 | Décider V1 : archiver/filtrer les 25 devis test | devis | Décision | 4 (maintenant) |
| C3 | Décider V2 : source unique items (devis_items recommandé) | devis_items | Décision | 4 (maintenant) |

### Corrections APRÈS déploiement V2 (non bloquantes pour migration)

| # | Correction | Table | Type | Sprint |
|---|---|---|---|---|
| C4 | Reconnecter OAuth Google → créer entrée client_google_connections | google_integrations | Opération | 5 |
| C5 | Corriger useClients.ts:useClientDevis() → lire devis au lieu de quotes | Code | Fix code | 5 |
| C6 | Valider/corriger links payments ↔ invoices (4 lignes) | payments | Opération | 5 |
| C7 | Corriger RLS anon_all sur clients, leads, invoices, invoice_items, payments | RLS | Sécurité | 5 (prioritaire) |
| C8 | Corriger RLS messages_all_access | RLS | Sécurité | 5 (prioritaire) |
| C9 | Corriger RLS anon_select sur google_integrations | RLS | Sécurité | 5 (critique) |

---

## SECTION 7 — ORDRE D'EXÉCUTION RECOMMANDÉ

```
[PHASE PRÉ-MIGRATION — Décisions requises]
  ├── Décision V1 : Sort des 25 devis test
  ├── Décision V2 : Source unique items
  └── Décision V3 : loic_actions vide ou migration

[PHASE 0 — Premier chargement V2]
  └── useAppSettings.ts : localStorage → app_settings (automatique)

[PHASE 1 — Corrections code]
  └── useClients.ts:useClientDevis() : quotes → devis

[PHASE 2 — Si V1 = Option A]
  └── UPDATE devis SET status = 'archived' WHERE <critères>

[PHASE 3 — Nouvelles données V2 uniquement]
  ├── stripe_payment_links : nouvelles données (aucune migration)
  └── subscriptions : nouvelles données (aucune migration)

[PHASE 4 — Post-déploiement]
  ├── Reconnecter OAuth Google (→ client_google_connections)
  ├── Valider links payments ↔ invoices
  └── Corriger RLS (sprint sécurité dédié)
```

---

## SECTION 8 — TABLEAU DE CLASSIFICATION FINALE

| Table | Statut | Raison |
|---|---|---|
| clients | 🟢 PRÊTE | Réutilisée telle quelle |
| leads | 🟢 PRÊTE | Réutilisée telle quelle |
| prospects | 🟢 PRÊTE | Réutilisée telle quelle |
| devis | 🟠 DÉCISION V1 | 25 devis test à traiter |
| devis_items | 🟢 PRÊTE | 0 orphelins, synchronisés |
| quotes | 🟢 PRÊTE | Table vide, correction code |
| quote_items | 🟢 PRÊTE | Table vide |
| invoices | 🟢 PRÊTE | 2 factures valides |
| invoice_items | 🟢 PRÊTE | FK valides |
| payments | 🟠 LIEN INDIRECT | invoice_id NULL pour 4/4 |
| messages | 🟢 PRÊTE | NULLs normaux |
| ai_conversations | 🟠 DONNÉES | JSONB conservé, migration loic_actions bloquée |
| loic_actions (V2) | 🔴 BLOQUÉE | CHECK constraint incompatible |
| google_integrations | 🔴 BLOQUÉE | UUID zéro + token expiré |
| client_google_connections (V2) | 🟢 PRÊTE | Table vide, prête pour reconnexion |
| notifications | 🟢 PRÊTE | 1 lien 404 non bloquant |
| app_settings (V2) | 🟢 PRÊTE | Migration automatique au 1er chargement |
| stripe_payment_links (V2) | 🟢 PRÊTE | Table vide, nouvelle fonctionnalité |
| subscriptions (V2) | 🟢 PRÊTE | Table vide, nouvelle fonctionnalité |

---

## SECTION 9 — VERDICT FINAL

### 🟠 CORRECTIONS NÉCESSAIRES — MIGRATION NON EXÉCUTÉE

**Résumé des blocages** :

1. **loic_actions** : migration historique bloquée par CHECK constraint mismatch (`create_lead` vs `lead_created`). Résolution : Option B (démarrer vide) recommandée.

2. **google_integrations → client_google_connections** : migration impossible (UUID zéro + token expiré). Résolution : reconnecter OAuth après déploiement V2.

3. **payments ↔ invoices** : 4 paiements sans lien facture. Résolution : correction manuelle ou acceptation de la limitation.

**Tables prêtes à migrer** : 14/19 (74%)  
**Tables nécessitant décision préalable** : 3/19 (16%)  
**Tables bloquées techniquement** : 2/19 (10%)

**La migration V2 peut procéder dès que les 3 décisions (V1, V2, V3) sont prises.** Les blocages techniques (google_integrations, loic_actions en Option B) ne bloquent pas les autres migrations.

---

*DRY-RUN TERMINÉ — AUCUNE DONNÉE ÉCRITE — AUCUNE TABLE MODIFIÉE*
