# SUPABASE V2 — MIGRATION MAPPING
*Sprint 4 / Prompt 3 — Analyse uniquement — Aucune migration effectuée*

**Date :** 2026-08-10  
**Projet :** CA-TECH Manager — CA-TECH Supabase (`jhcyooksjeivajdjicka`)

---

## 1. RÉSUMÉ

### Nature de la migration V2

La migration V2 **n'est pas une restructuration de tables**. Les tables existantes sont conservées intactes. La migration concerne :

1. **Nouvelles tables** (déjà créées) — démarrent vides, seront alimentées par le code V2
2. **Migration localStorage → `app_settings`** — seule vraie migration de données (profil, agence, facturation)
3. **Correction doublon `devis`/`quotes`** — changement de code uniquement (quotes = 0 lignes)
4. **Nettoyage des doublons de devis** — à décider avec l'utilisateur avant nettoyage
5. **Renouvellement token Google** — opérationnel (token expiré depuis le 16/07/2026)

### Ce qui n'a PAS besoin d'être migré

| Table | Raison |
|---|---|
| `quotes` | 0 lignes — vide, vestige inactif |
| `quote_items` | 0 lignes — vide, vestige inactif |
| `prospect_*`, `campaigns`, `email_drafts` | Module Prospection supprimé — données conservées, code supprimé |
| `projects`, `project_tasks`, `services` | Hors périmètre V2 — données conservées |
| `tickets`, `ticket_messages`, `documents` | Hors périmètre V2 — données conservées |
| `appointments`, `portfolio_projects` | Hors périmètre V2 — données conservées |
| `catalogue_services`, `catalogue_collaborateurs` | Hors périmètre V2 — données conservées |

---

## 2. TABLES ANALYSÉES

| Table | Lignes | Analysée | Statut V2 |
|---|---|---|---|
| `clients` | 2 | ✅ | Active — données de test uniquement |
| `leads` | 13 | ✅ | Active — données réelles |
| `messages` | 6 | ✅ | Active — données réelles |
| `devis` | 32 | ✅ | Active — 25 doublons de test + 7 réels |
| `devis_items` | 49 | ✅ | Active — items liés aux devis |
| `quotes` | 0 | ✅ | Vestige vide — aucune migration |
| `quote_items` | 0 | ✅ | Vestige vide — aucune migration |
| `invoices` | 4 | ✅ | Active — données de test |
| `invoice_items` | 4 | ✅ | Active — 1 item par facture |
| `payments` | 4 | ✅ | Active — paiements Stripe test réels |
| `ai_conversations` | 8 | ✅ | Active — conversations réelles Loïc |
| `google_integrations` | 1 | ✅ | Active — token expiré ! |
| `notifications` | 1 | ✅ | Active — liée à un prospect |
| `notification_settings` | 3 | ✅ | Active — email/telegram/whatsapp |
| `stripe_payment_links` | 0 | ✅ | NOUVELLE — vide, prête |
| `client_google_connections` | 0 | ✅ | NOUVELLE — vide, prête |
| `app_settings` | 0 | ✅ | NOUVELLE — vide, migration localStorage requise |
| `subscriptions` | 0 | ✅ | NOUVELLE — vide, prête |
| `loic_actions` | 0 | ✅ | NOUVELLE — vide, prête |

---

## 3. NOMBRE DE DONNÉES PAR TABLE

### Tables actives V2

| Table | Lignes totales | Données réelles | Données de test | Doublons |
|---|---|---|---|---|
| `clients` | 2 | 0 | 2 (Test CATECH, Jean Test) | 0 |
| `leads` | 13 | 13 | 0 | 2 emails partagés (4 lignes) |
| `messages` | 6 | 6 | 0 | 0 |
| `devis` | 32 | 7 | 3 (contacts tests) | 25 (doublons test) |
| `devis_items` | 49 | ~14 | ~35 | Proportionnel aux devis |
| `invoices` | 4 | 0 | 4 (Logo test 180€) | 0 |
| `invoice_items` | 4 | 0 | 4 | 0 |
| `payments` | 4 | 4 (vrais Stripe IDs) | 0 | 0 |
| `ai_conversations` | 8 | 8 | 0 | 0 |
| `google_integrations` | 1 | 1 (⚠️ token expiré) | 0 | 0 |
| `notifications` | 1 | 1 (liée Prospection) | 0 | 0 |
| `notification_settings` | 3 | 3 | 0 | 0 |

### Tables obsolètes (données conservées, code supprimé)

| Table | Lignes | Nature |
|---|---|---|
| `prospects` | 25 | Prospects B2B Prospection |
| `prospect_contacts` | 5 | Contacts prospects |
| `prospect_activities` | 0 | Activités vides |
| `prospect_campaigns` | 1 | 1 lien prospect↔campagne |
| `campaigns` | 1 | 1 campagne |
| `campaign_steps` | 0 | Étapes vides |
| `email_drafts` | 16 | Emails générés par IA |
| `notification_logs` | 83 | Logs Prospection |
| `projects` | 4 | Projets clients |
| `services` | 9 | Catalogue services |
| `audit_logs` | 32 | Logs audit |
| `integration_logs` | 17 | Logs intégrations |
| `calendar_events` | 5 | Événements calendrier |

---

## 4. MAPPING ANCIEN → V2

### 4.1 `clients` → `clients` (V2)

Table conservée telle quelle. Aucune transformation.

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `first_name` | `first_name` | Aucune |
| `last_name` | `last_name` | Aucune |
| `email` | `email` | Aucune |
| `phone` | `phone` | Aucune |
| `company` | `company` | Aucune |
| `status` | `status` | Aucune (`active`/`inactive`/`archived`) |
| `siret` | `siret` | Aucune ⚠️ *colonne non documentée dans l'architecture* |
| `tva_number` | `tva_number` | Aucune ⚠️ *colonne non documentée* |
| `website` | `website` | Aucune ⚠️ *colonne non documentée* |
| `lead_id` | `lead_id` | Aucune ⚠️ *colonne non documentée (FK vers leads)* |
| `address`, `city`, `postal_code`, `country` | idem | Aucune |
| `industry`, `notes` | idem | Aucune |
| `created_at`, `updated_at` | idem | Aucune |

**Relations V2 entrantes** (tables qui référencent clients) :
- `client_google_connections.client_id` → `clients.id` (NOUVELLE)
- `stripe_payment_links.client_id` → `clients.id` (NOUVELLE)
- `subscriptions.client_id` → `clients.id` (NOUVELLE)
- `devis.client_id`, `invoices.client_id`, `payments.client_id` (existantes)

---

### 4.2 `leads` → `leads` (V2, Contacts & Demandes)

Table conservée. Lue dans le module Contacts & Demandes avec les `messages`.

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `first_name` | `first_name` | Aucune |
| `last_name` | `last_name` | Aucune |
| `email` | `email` | Aucune |
| `phone` | `phone` | Aucune |
| `company` | `company` | Aucune |
| `source` | `source` | Aucune |
| `status` | `status` | Aucune (`new`/`contacted`/`qualified`/`proposal`/`negotiation`/`won`/`lost`) |
| `budget_min`, `budget_max` | idem | Aucune |
| `notes` | `notes` | Aucune |
| `converted_to_client_id` | `converted_to_client_id` | Aucune |
| `service_id` | → À DÉCIDER | Colonne présente en DB mais pas dans useLeads.ts — probablement ignorée en V2 |
| `assigned_to` | → À DÉCIDER | Non utilisée en V2 (mono-utilisateur) |
| `created_at`, `updated_at` | idem | Aucune |

---

### 4.3 `messages` → `messages` (V2, Contacts & Demandes)

Table conservée. Lue dans le module Contacts & Demandes avec les `leads`.

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `from_name` | `from_name` | Aucune |
| `from_email` | `from_email` | Aucune |
| `subject` | `subject` | Aucune |
| `body` | `body` | Aucune |
| `source` | `source` | Aucune |
| `is_read`, `is_replied`, `is_archived` | idem | Aucune |
| `reply_body`, `replied_at` | idem | Aucune |
| `client_id` | `client_id` | Aucune (NULL pour tous les 6 messages actuels) |
| `lead_id` | `lead_id` | Aucune (NULL pour tous les 6 messages actuels) |
| `company`, `phone`, `ip_address` | idem | Aucune |
| `created_at` | `created_at` | Aucune |

---

### 4.4 `devis` → `devis` (V2) — ⚠️ ARCHITECTURE RÉELLE DIFFÉRENTE

> La vraie structure de `devis` en base est **très différente** de ce que les hooks documentent. La table a été conçue pour recevoir des devis depuis le formulaire Loïc et le formulaire de contact, pas seulement depuis le Manager.

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `devis_number` | `devis_number` | Aucune (format DEV-YYYY-NNNN) |
| `status` | `status` | Aucune (`draft`/`sent`/`accepted`/`rejected`/`expired`) |
| `client_id` | `client_id` | ⚠️ NULL pour 32/32 devis actuels — V2 doit gérer les devis sans client |
| `lead_id` | `lead_id` | Aucune (3/32 devis ont un lead_id) |
| `conversation_id` | `conversation_id` | Aucune (3/32 devis ont un conversation_id) |
| `contact_name` | `contact_name` | Aucune — utilisé à la place de client_id |
| `contact_email` | `contact_email` | Aucune |
| `contact_phone` | `contact_phone` | Aucune |
| `company_name` | `company_name` | Aucune |
| `project_type` | `project_type` | Aucune (site-vitrine/site-ecommerce/ia-automatisation…) |
| `subtotal`, `tax_rate`, `tax_amount`, `total`, `discount` | idem | Aucune |
| `valid_until`, `sent_at`, `accepted_at`, `refused_at` | idem | Aucune |
| `notes` | `notes` | Aucune |
| `items` (JSONB) | `items` (JSONB) | ⚠️ Double stockage avec `devis_items` — voir §5.2 |
| `features`, `budget_range`, `deadline` | → À DÉCIDER | Champs formulaire Loïc, pas exposés dans le Manager V2 actuel |
| `seo_option`, `maintenance_option`, `hosting_option`, `branding_option` | → À DÉCIDER | Options booléennes Loïc |
| `has_logo`, `has_domain`, `page_count` | → À DÉCIDER | Options formulaire devis |
| `activity`, `city` | → À DÉCIDER | Secteur d'activité et ville du prospect |
| `pdf_url` | `pdf_url` | Aucune (URL PDF généré) |
| `conversation_data` | → À DÉCIDER | JSONB données brutes de conversation Loïc |
| `last_reminder_at` | `last_reminder_at` | Aucune |
| `created_at`, `updated_at` | idem | Aucune |

---

### 4.5 `devis_items` → `devis_items` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `devis_id` | `devis_id` | Aucune (FK → devis.id) |
| `description` | `description` | Aucune |
| `quantity` | `quantity` | Aucune (integer) |
| `unit_price` | `unit_price` | Aucune |
| `total` | `total` | Aucune |
| `sort_order` | `sort_order` | Aucune |
| `created_at` | `created_at` | Aucune |

---

### 4.6 `quotes` + `quote_items` → AUCUNE MIGRATION

- `quotes` : 0 lignes → **aucune migration à faire**
- `quote_items` : 0 lignes → **aucune migration à faire**
- Action requise : corriger `useClients.ts:useClientDevis()` pour lire `devis` au lieu de `quotes` (changement de code, Phase 5)

---

### 4.7 `invoices` → `invoices` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `invoice_number` | `invoice_number` | Aucune (format FAC-YYYY-NNNN) |
| `client_id` | `client_id` | Aucune |
| `quote_id` | `quote_id` | Aucune ⚠️ FK vers `quotes` (vide) — NULL pour toutes les 4 factures |
| `status` | `status` | Aucune |
| `subtotal`, `tax_rate`, `tva_rate`, `tax_amount`, `total` | idem | Aucune |
| `amount_paid`, `discount` | idem | Aucune |
| `due_date`, `sent_at`, `paid_at` | idem | Aucune |
| `stripe_payment_link` | `stripe_payment_link` | ⚠️ Text libre (URL Stripe) — à terme, idéalement FK vers `stripe_payment_links.stripe_link_url` |
| `notes` | `notes` | Aucune |
| `project_id`, `created_by` | → À DÉCIDER | Présents en DB, non documentés |
| `created_at`, `updated_at` | idem | Aucune |

---

### 4.8 `invoice_items` → `invoice_items` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `invoice_id` | `invoice_id` | Aucune |
| `service_id` | `service_id` | Aucune (nullable, FK → services) |
| `description`, `quantity`, `unit_price`, `total` | idem | Aucune |
| `sort_order` | `sort_order` | Aucune |

---

### 4.9 `payments` → `payments` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `client_id` | `client_id` | Aucune |
| `invoice_id` | `invoice_id` | ⚠️ NULL pour les 4 paiements — liés via `project_id` à la place |
| `project_id` | `project_id` | Aucune ⚠️ présent mais non documenté dans les hooks |
| `amount` | `amount` | Aucune |
| `method` | `method` | Aucune (`stripe`/`virement`/`carte`/`cheque`/`especes`/`paypal`/`autre`) |
| `status` | `status` | Aucune (`completed`) |
| `stripe_payment_id` | `stripe_payment_id` | Aucune (vrais IDs Stripe `pi_xxx`) |
| `reference` | `reference` | Aucune (Checkout Sessions IDs `cs_test_xxx`) |
| `notes`, `paid_at` | idem | Aucune |
| `created_at` | `created_at` | Aucune |

---

### 4.10 `ai_conversations` → `ai_conversations` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `type` | `type` | Aucune (`qualification` pour toutes les 8) |
| `status` | `status` | Aucune (`active` pour toutes les 8) |
| `messages` (JSONB) | `messages` (JSONB) | Aucune — tableau `{role, content, timestamp, action?}` |
| `metadata` (JSONB) | `metadata` (JSONB) | Aucune — `{prenom, nom, email, telephone, entreprise, projet, budget, lead_created, escalated, source}` |
| `lead_id` | `lead_id` | Aucune (4/8 conversations ont un lead_id) |
| `client_id` | `client_id` | Aucune (NULL pour toutes les 8) |
| `user_id` | `user_id` | Aucune (NULL pour toutes — conversations publiques) |
| `created_at`, `updated_at` | idem | Aucune |

**Nouvelle relation V2 :** `loic_actions.conversation_id → ai_conversations.id` (table NOUVELLE, 0 lignes)

---

### 4.11 `google_integrations` → `google_integrations` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `user_id` | `user_id` | ⚠️ Valeur `00000000-0000-0000-0000-000000000000` — UUID fictif, bug |
| `email` | `email` | Aucune (`catechn21@gmail.com`) |
| `access_token` | `access_token` | ⚠️ Token expiré depuis le 16/07/2026 |
| `refresh_token` | `refresh_token` | Aucune |
| `token_type` | `token_type` | Aucune (`Bearer`) |
| `scope` | `scope` | Aucune (tous les scopes complets) |
| `expires_at` | `expires_at` | ⚠️ `2026-07-16` — déjà expiré |
| `connected_at` | `connected_at` | Aucune |

---

### 4.12 `notifications` → `notifications` (V2)

| Colonne source | Colonne destination | Transformation |
|---|---|---|
| `id` | `id` | Aucune |
| `title` | `title` | Aucune |
| `message` | `message` | Aucune |
| `type` | `type` | Aucune |
| `link` | `link` | Aucune |
| `is_read` | `is_read` | Aucune |
| `user_id` | `user_id` | Aucune (NULL pour la 1 notification existante) |
| `prospect_id` | `prospect_id` | Aucune ⚠️ FK vers prospects (conservé) — null pour nouvelles notifications V2 |
| `metadata` | `metadata` | Aucune |
| `created_at` | `created_at` | Aucune |

---

### 4.13 `localStorage catech_settings` → `app_settings` (MIGRATION RÉELLE)

C'est **la seule vraie migration de données** : du navigateur vers Supabase.

| Source (localStorage) | Destination (app_settings) | Transformation |
|---|---|---|
| `catech_settings.prenom` | `profil.prenom` | Dans JSONB `profil` |
| `catech_settings.nom` | `profil.nom` | Dans JSONB `profil` |
| `catech_settings.telephone` | `profil.telephone` | Dans JSONB `profil` |
| `catech_settings.poste` | `profil.poste` | Dans JSONB `profil` |
| `catech_settings.agence_nom` | `agence.nom` | Dans JSONB `agence` |
| `catech_settings.agence_email` | `agence.email` | Dans JSONB `agence` |
| `catech_settings.agence_telephone` | `agence.telephone` | Dans JSONB `agence` |
| `catech_settings.agence_adresse` | `agence.adresse` | Dans JSONB `agence` |
| `catech_settings.siret` | `agence.siret` | Dans JSONB `agence` |
| `catech_settings.tva_intra` | `agence.tva_intra` | Dans JSONB `agence` |
| `catech_settings.logo_url` | `agence.logo_url` | Dans JSONB `agence` |
| `catech_settings.prefixe_devis` | `facturation.prefixe_devis` | Dans JSONB `facturation` |
| `catech_settings.prefixe_facture` | `facturation.prefixe_facture` | Dans JSONB `facturation` |
| `catech_settings.tva_defaut` | `facturation.tva_defaut` | Dans JSONB `facturation` |
| `catech_settings.delai_paiement` | `facturation.delai_paiement` | Dans JSONB `facturation` |
| `catech_settings.iban` | `facturation.iban` | Dans JSONB `facturation` — ⚠️ DONNÉES SENSIBLES |
| `catech_settings.bic` | `facturation.bic` | Dans JSONB `facturation` — ⚠️ DONNÉES SENSIBLES |
| `catech_settings.mentions` | `facturation.mentions` | Dans JSONB `facturation` |
| `catech_settings.langue` | `apparence.langue` | Dans JSONB `apparence` |
| `catech_settings.format_date` | `apparence.format_date` | Dans JSONB `apparence` |
| `catech_settings.fuseau` | `apparence.fuseau` | Dans JSONB `apparence` |
| `catech_settings.monnaie` | `apparence.monnaie` | Dans JSONB `apparence` |

**Logique de migration (à implémenter dans `useAppSettings.ts`) :**
```
1. Au premier chargement : vérifier si app_settings existe pour user_id
2. Si non : lire localStorage.getItem('catech_settings')
3. Transformer le JSON plat en structure {profil, agence, facturation, apparence}
4. INSERT dans app_settings (user_id = auth.uid())
5. Confirmer le succès de l'INSERT
6. Continuer à lire localStorage en parallèle pendant 14 jours (filet de sécurité)
7. Après 14 jours sans erreur : ne plus écrire dans localStorage
```

---

## 5. TRANSFORMATIONS NÉCESSAIRES

### 5.1 Structure `devis` — Colonne `client_id` absente

**Problème** : 32/32 devis existants ont `client_id = NULL`. Le V2 affiche les devis dans la fiche client.

**Solution recommandée** : Le code V2 doit filtrer les devis par `lead_id` OU par `contact_email` correspondant à l'email du client.

```sql
-- Dans useDevis.ts, pour charger les devis d'un client :
SELECT * FROM devis 
WHERE client_id = :client_id
   OR lead_id IN (SELECT id FROM leads WHERE converted_to_client_id = :client_id)
   OR contact_email = (SELECT email FROM clients WHERE id = :client_id)
ORDER BY created_at DESC;
```

**À valider :** lors de la conversion lead → client, mettre à jour `devis.client_id` pour tous les devis liés au lead.

### 5.2 Double stockage `devis.items` (JSONB) vs `devis_items` (table)

**Problème** : tous les devis ont à la fois `items` JSONB (inline) ET des lignes dans `devis_items`. C'est un double stockage potentiellement désynchronisé.

**Analyse** :
- `devis.items` : créé par le formulaire automatique (Loïc, formulaire site)
- `devis_items` : créé par le Manager V1 lors de l'édition manuelle

**Décision recommandée** : En V2, faire lire le code en priorité depuis `devis_items` (source relationnelle), avec fallback sur `devis.items` pour les devis créés automatiquement sans passage dans l'éditeur.

```typescript
// Dans useDevis.ts V2 :
lignes: row.devis_items?.length > 0 
  ? row.devis_items 
  : (row.items ?? [])
```

### 5.3 `google_integrations.user_id` — UUID fictif

**Problème** : `user_id = '00000000-0000-0000-0000-000000000000'` (UUID zéro, pas un vrai utilisateur).

**Cause** : L'Edge Function `google-oauth` a probablement utilisé un UUID par défaut lors de la création.

**Solution** : Lors du renouvellement du token OAuth (étape opérationnelle), l'Edge Function doit écrire le vrai `auth.uid()` comme `user_id`.

### 5.4 `invoices.stripe_payment_link` — Champ texte vs nouvelle table

**Situation** : `invoices.stripe_payment_link` est un champ texte libre contenant une URL Stripe (NULL pour toutes les 4 factures actuelles).

**V2** : La table `stripe_payment_links` est créée pour gérer les liens Stripe de façon structurée.

**Décision** : Pour V2 initial, les deux coexistent. Pas de migration nécessaire (4 factures, toutes `stripe_payment_link = NULL`). En V2, les nouveaux liens Stripe vont dans `stripe_payment_links`, et `invoices.stripe_payment_link` devient un champ legacy.

---

## 6. DOUBLONS DÉTECTÉS

### 6.1 Doublons massifs de devis — CRITIQUE

| Contact | Email | Montant | Nb doublons | Période |
|---|---|---|---|---|
| Test Vérification | test-verify@ca-tech.fr | 790.01€ | **12 devis identiques** | DEV-2026-0001 à DEV-2026-0021 |
| Marie Leblanc | marie@exemple.fr | 590.00€ | **11 devis identiques** | DEV-2026-0011 à DEV-2026-0023 |
| Realtime Test | realtime-test@ca-tech.fr | 590.00€ | **2 devis identiques** | DEV-2026-0024 à DEV-2026-0025 |

**Cause** : Tests répétés de la fonctionnalité de création de devis (formulaire Loïc → génération automatique → envoi email).

**Total doublons** : 25 devis de test pour 3 contacts fictifs.  
**Devis réels uniques** : 7 (DEV-2026-0026 à DEV-2026-0032).

**Stratégie de déduplication recommandée** (à valider avant toute action) :
- Conserver uniquement le dernier devis par contact fictif (le plus récent)
- OU archiver tous les devis test (changer status → `archived`)
- Ne pas supprimer (règle absolue du projet)
- **Ne rien faire** avant validation explicite de l'utilisateur

### 6.2 Doublons de leads — IDENTITÉS DIFFÉRENTES MÊME EMAIL

| Email | Lead 1 | Source 1 | Lead 2 | Source 2 |
|---|---|---|---|---|
| `formationaic2021@gmail.com` | Doly MAKASSI | devis | Jean BALO | loic_widget |
| `kevin.pemou@gmail.com` | Cyril Gallet | devis_form | Kevin Pemou | loic_widget |

**Analyse** : Il s'agit de **vraies personnes différentes** qui ont utilisé le même email (probablement l'email de test `pemoustaskit@gmail.com` et `formationaic2021@gmail.com`). Ce ne sont pas des doublons au sens classique.

**Stratégie** : Ne pas fusionner. Conserver les 2 leads. Le code V2 devra afficher les doublons d'email dans Contacts & Demandes pour permettre à l'utilisateur de décider.

### 6.3 Doublons clients — AUCUN

Les 2 clients ont des emails distincts. Aucun doublon.

### 6.4 Doublons payments — AUCUN

Les 4 paiements ont des `stripe_payment_id` distincts. Aucun doublon.

---

## 7. DONNÉES SANS ÉQUIVALENT DIRECT EN V2

### 7.1 Champs `devis` sans consommateur V2 connu → À DÉCIDER

Ces colonnes existent en DB mais ne sont pas lues par les hooks V2 actuels :

| Colonne | Contenu | Décision recommandée |
|---|---|---|
| `activity` | Secteur d'activité du client (ex: `artisan`) | Afficher dans fiche devis V2 |
| `features` | JSONB liste de fonctionnalités Loïc | Afficher en mode lecture seule dans fiche devis |
| `budget_range` | Budget estimé (ex: `500-1000`) | Afficher dans fiche devis / Contacts |
| `deadline` | Délai souhaité (ex: `normal`, `urgent`) | Afficher dans fiche devis |
| `seo_option` | Boolean option SEO | Afficher dans récapitulatif devis |
| `maintenance_option` | Texte option maintenance | Afficher dans récapitulatif devis |
| `hosting_option`, `branding_option` | Boolean options | Afficher dans récapitulatif devis |
| `has_logo`, `has_domain`, `page_count` | Options formulaire site | Afficher dans récapitulatif devis |
| `conversation_data` | JSONB données brutes de conversation | Utiliser pour lien vers conversation Loïc |
| `city` | Ville du prospect | Afficher dans fiche devis / Contacts |
| `project_type` | Type de projet (site-vitrine, site-ecommerce, ia-automatisation) | Afficher comme badge dans liste devis |

### 7.2 `leads.service_id` → À DÉCIDER

FK vers `services` (table hors périmètre V2). En V2, le module Services est supprimé. Cette colonne reste en base mais n'est plus alimentée.

### 7.3 `payments.project_id` → À DÉCIDER

FK vers `projects` (hors périmètre V2). Les 4 paiements actuels sont liés à des project_id, pas à des invoice_id. Le module Projets étant supprimé, ces liens ne sont plus affichables en V2. Les paiements restent visibles via `client_id`.

### 7.4 `payments.invoice_id` = NULL pour tous → INCOHÉRENCE

Les 4 paiements réels (180€ chacun) ne sont pas liés aux 4 factures (180€ chacune) malgré les montants identiques. Les factures ont `amount_paid = 180€` mais 0 paiements dans `payments` liés via `invoice_id`.

→ Incohérence de données V1. Les factures et paiements se correspondent manuellement mais pas en FK. À documenter, ne pas corriger maintenant.

### 7.5 `notifications` — Prospect Prospection expiré

La 1 notification existante est liée à un prospect du module Prospection (`prospect_id`). Ce prospect sera conservé (table conservée) mais le module est supprimé.

→ La notification reste visible dans le Header V2 mais le lien `link` pointe peut-être vers une route supprimée. À vérifier lors de l'implémentation.

### 7.6 Token Google expiré

`google_integrations.expires_at = 2026-07-16`. Le Manager ne peut pas actuellement envoyer d'emails Gmail ou créer de dossiers Drive.

→ Action opérationnelle urgente : se reconnecter via OAuth dans Paramètres dès que V2 sera déployé.

---

## 8. ORDRE DE MIGRATION

> Cet ordre s'applique lors de l'exécution des phases de migration, pas à la structure de base qui est déjà en place.

### Ordre sécurisé (respectant les clés étrangères)

```
Phase 0 — AVANT DÉPLOIEMENT CODE (opérationnel)
  ① Lire localStorage catech_settings → noter les valeurs
  ② INSERT dans app_settings (via useAppSettings.ts au premier chargement V2)

Phase 5 — CORRECTION DOUBLON DEVIS/QUOTES (code uniquement)
  ③ Modifier useClients.ts:useClientDevis() → lire depuis `devis` au lieu de `quotes`
  ④ Vérifier affichage fiche client onglet Devis

Phase 6 — STRIPE PAYMENT LINKS (nouvelles données)
  ⑤ Aucune migration de données existantes
  ⑥ Les nouveaux liens Stripe créés via API iront dans `stripe_payment_links`
  ⑦ Les anciens `invoices.stripe_payment_link` (texte) restent tels quels

Phase 7 — SUBSCRIPTIONS (nouvelles données)
  ⑧ Aucune migration — table vide, nouvelles données uniquement

Phase 8 — LOIC ACTIONS (données optionnelles)
  ⑨ Option A : extraire les actions des JSONB `ai_conversations.messages` → `loic_actions`
     (SELECT conversations, parcourir messages[], détecter action != null, INSERT loic_actions)
  ⑩ Option B : démarrer vide, ne migrer que les futures actions
  → Recommandation : Option B (historique Loïc accessible via ai_conversations)

Phase 9 — GOOGLE CONNEXIONS CLIENTS (nouvelles données)
  ⑪ Aucune migration — table vide, connexions à créer par client

Phase Finale — NETTOYAGE OPTIONNEL DEVIS (à valider)
  ⑫ Archiver les 25 devis de test (status → 'archived') — NE PAS SUPPRIMER
```

---

## 9. CONTRÔLES POST-MIGRATION

Ces requêtes SQL seront exécutées après chaque phase pour valider l'intégrité.

### Contrôle 1 — Comptes de lignes (baseline vs post-migration)

```sql
SELECT 'clients' AS tbl, COUNT(*) FROM clients
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'devis', COUNT(*) FROM devis
UNION ALL SELECT 'devis_items', COUNT(*) FROM devis_items
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'ai_conversations', COUNT(*) FROM ai_conversations
UNION ALL SELECT 'app_settings', COUNT(*) FROM app_settings
UNION ALL SELECT 'stripe_payment_links', COUNT(*) FROM stripe_payment_links
UNION ALL SELECT 'loic_actions', COUNT(*) FROM loic_actions;
```

**Valeurs attendues post-migration** (au minimum) :
- `clients` ≥ 2
- `leads` ≥ 13
- `messages` ≥ 6
- `devis` = 32 (aucune suppression)
- `devis_items` = 49 (aucune suppression)
- `invoices` ≥ 4
- `payments` ≥ 4
- `ai_conversations` ≥ 8
- `app_settings` = 1 (1 ligne pour l'utilisateur)

### Contrôle 2 — app_settings migrée correctement

```sql
SELECT 
  user_id,
  profil->>'prenom' AS prenom,
  agence->>'nom' AS agence_nom,
  agence->>'siret' AS siret,
  facturation->>'iban' IS NOT NULL AS has_iban,
  facturation->>'prefixe_devis' AS prefixe_devis,
  updated_at
FROM app_settings;
```

**Attendu** : 1 ligne avec prenom, siret, prefixe_devis non null si localStorage avait des données.

### Contrôle 3 — Devis liés aux clients (après linkage)

```sql
SELECT 
  COUNT(*) AS total_devis,
  COUNT(client_id) AS avec_client_id,
  COUNT(lead_id) AS avec_lead_id,
  COUNT(*) - COUNT(client_id) - COUNT(lead_id) + COUNT(client_id * lead_id) AS sans_aucun_lien
FROM devis;
```

### Contrôle 4 — Montants conservés (invoices)

```sql
SELECT invoice_number, total, amount_paid, status
FROM invoices
ORDER BY invoice_number;
-- Attendu : FAC-2026-0001 à 0004, 180€ chacune, status paid
```

### Contrôle 5 — Paiements Stripe intacts

```sql
SELECT stripe_payment_id, amount, status, client_id IS NOT NULL AS has_client
FROM payments;
-- Attendu : 4 lignes, stripe_payment_id non null, amount = 180, status = completed
```

### Contrôle 6 — Intégrité clés étrangères

```sql
-- Devis avec lead_id orphelin
SELECT COUNT(*) AS devis_lead_orphans 
FROM devis d WHERE d.lead_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM leads l WHERE l.id = d.lead_id);

-- Leads avec client converti orphelin
SELECT COUNT(*) AS leads_client_orphans 
FROM leads l WHERE l.converted_to_client_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = l.converted_to_client_id);

-- Payments avec invoice orpheline
SELECT COUNT(*) AS payments_invoice_orphans 
FROM payments p WHERE p.invoice_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.id = p.invoice_id);
-- Attendu : 0, 0, 0 pour les 3 requêtes
```

### Contrôle 7 — Conversations Loïc intactes

```sql
SELECT COUNT(*) AS total, COUNT(lead_id) AS avec_lead, AVG(jsonb_array_length(messages)) AS avg_messages
FROM ai_conversations;
-- Attendu : 8 conversations, 4 avec lead_id, ~6 messages en moyenne
```

### Contrôle 8 — Absence de doublons post-nettoyage (optionnel)

```sql
SELECT contact_email, COUNT(*) AS nb 
FROM devis 
WHERE status != 'archived'
GROUP BY contact_email 
HAVING COUNT(*) > 3
ORDER BY nb DESC;
-- Attendu : 0 lignes si le nettoyage des doublons a été fait
```

---

## 10. RISQUES

### R1 — DEVIS SANS CLIENT_ID : données orphelines — HAUTE

**Description** : 32/32 devis ont `client_id = NULL`. Dans le flux V2 (fiche client → onglet Devis), aucun devis n'apparaîtra pour les 2 clients existants ni pour les futurs clients convertis depuis des leads.

**Impact** : Un prospect converti en client verra sa fiche vide dans l'onglet Devis.

**Mitigation** :
- En V2, lors de la conversion lead → client, copier `client_id` dans tous les `devis` liés au `lead_id`
- Ajouter filtre alternatif `contact_email = client.email` dans la requête devis par client
- NE PAS modifier les 32 devis existants avant implémentation du flux de conversion

**Timing** : Phase 5 du plan de migration

---

### R2 — DOUBLE STOCKAGE ITEMS : désynchronisation potentielle — HAUTE

**Description** : `devis.items` (JSONB) et `devis_items` (table) contiennent les mêmes lignes pour la plupart des devis. Si le code V2 écrit dans l'un et lit dans l'autre, les montants affichés seront incohérents.

**Exemple** : DEV-2026-0031 (Sophie Martin) a 5 items en `devis_items` ET dans `devis.items` JSONB. Si une modification n'est appliquée qu'à l'un des deux, les montants divergeront.

**Mitigation** :
- Décider d'une source unique en V2 : **recommandé `devis_items`** (table relationnelle)
- Le code V2 écrit UNIQUEMENT dans `devis_items` et lit UNIQUEMENT depuis `devis_items`
- Fallback sur `devis.items` JSONB uniquement pour les devis sans `devis_items` (Loïc)
- NE PAS mettre à jour `devis.items` JSONB lors des modifications V2

---

### R3 — TOKEN GOOGLE EXPIRÉ : fonctionnalités Gmail bloquées — HAUTE OPÉRATIONNELLE

**Description** : `google_integrations.expires_at = 2026-07-16`. Le Manager ne peut PAS actuellement :
- Envoyer des devis/factures par Gmail
- Créer des dossiers Drive
- Synchroniser Sheets

**Impact immédiat** : boutons "Envoyer par Gmail" non fonctionnels.

**Mitigation** : Reconnecter Google dans Paramètres → onglet Google dès que V2 est déployé. L'Edge Function `google-oauth` mettra à jour `google_integrations` avec le nouveau token.

---

### R4 — PAYMENTS.INVOICE_ID = NULL : paiements non liés — MOYENNE

**Description** : Les 4 paiements réels (180€) ne sont pas liés aux 4 factures correspondantes via `invoice_id`. Ils sont liés via `project_id` (module Projets supprimé).

**Impact** : Dans la fiche facture V2, l'onglet "Paiements" ne montrera aucun paiement lié pour FAC-2026-0001 à 0004, malgré les montants marqués `amount_paid = 180€`.

**Mitigation** : Données de test uniquement — ne pas corriger. Les vraies données futures utiliseront `invoice_id` correctement.

---

### R5 — GOOGLE_INTEGRATIONS.USER_ID FICTIF — MOYENNE

**Description** : `user_id = '00000000-0000-0000-0000-000000000000'`. La RLS de `google_integrations` (si elle filtre par `user_id = auth.uid()`) bloquera la lecture du token.

**Impact** : Le Manager ne pourra pas récupérer la connexion Google existante si la RLS est stricte.

**Mitigation** : Vérifier la politique RLS de `google_integrations`. Si la lecture passe par `authenticated = true` (pas de filtre user_id), pas d'impact. Si elle filtre par user_id, le token existant ne sera jamais récupéré → reconnexion obligatoire.

---

### R6 — DOUBLONS DEVIS : compteurs KPI faussés — MOYENNE

**Description** : Le Dashboard V2 affichera "32 devis en cours" dont 25 doublons de test. Les KPIs "montant total devis" seront artificiellement gonflés.

**Mitigation** : Archiver les 25 devis de test avant ou juste après le déploiement V2. **Validation de l'utilisateur requise avant toute action.**

---

### R7 — MESSAGES NON LIÉS AUX LEADS — FAIBLE

**Description** : Les 6 messages ont `lead_id = NULL`. Certains proviennent pourtant du même email que des leads existants (ex: `formationaic2021@gmail.com`). Le module Contacts & Demandes montrera des messages orphelins sans historique lead.

**Mitigation** : Le code V2 affiche messages ET leads côte à côte, même sans lien en base. Pas de migration nécessaire — l'utilisateur peut manuellement lier un message à un lead via l'UI.

---

### R8 — NOTIFICATION LIÉE À PROSPECT DISPARU — FAIBLE

**Description** : La 1 notification existante a un `prospect_id` qui pointe vers un prospect du module Prospection. Le lien `link` dans la notification pointe peut-être vers `/prospection/prospects/:id` (route supprimée).

**Impact** : La cloche du Header affichera 1 notification non lue avec un lien cassé.

**Mitigation** : Marquer cette notification comme lue, ou mettre à jour son `link` vers une route V2 valide. Aucune suppression.

---

## 11. POINTS NÉCESSITANT VALIDATION

Ces décisions ne peuvent pas être prises unilatéralement et doivent être confirmées avant exécution.

### V1 — Nettoyage des 25 devis de test ⚠️ VALIDATION REQUISE

**Question** : Faut-il archiver (status → `archived`) les 25 devis de test pour nettoyer les KPIs du Dashboard V2 ?

| Option | Avantage | Risque |
|---|---|---|
| A — Archiver les 25 devis test | KPIs propres en V2 | Perte de visibilité sur les tests passés |
| B — Laisser tels quels | Historique complet préservé | Dashboard V2 pollué par des données fictives |
| C — Filtrer en code | Pas de modification DB | Complexité supplémentaire dans les requêtes |

**Recommandation** : Option A (archiver) — mais **ne rien faire** avant confirmation.

---

### V2 — Source unique pour les items de devis ⚠️ VALIDATION REQUISE

**Question** : En V2, les lignes de devis sont-elles lues depuis `devis.items` (JSONB) ou `devis_items` (table) ?

| Option | Avantage | Risque |
|---|---|---|
| A — `devis_items` (table) | Relationnel, queryable, éditable | Les devis Loïc sans items en table seront vides |
| B — `devis.items` (JSONB) | Tous les devis ont des items JSONB | Non queryable, difficile à éditer ligne par ligne |
| C — Hybride : `devis_items` prioritaire, fallback JSONB | Couvre les deux cas | Logique complexe, risque de désynchronisation |

**Recommandation** : Option C (hybride) — `devis_items` si disponible, sinon `devis.items`.

---

### V3 — Migration des actions Loïc vers `loic_actions` ⚠️ DÉCISION

**Question** : Faut-il extraire les actions passées des conversations Loïc (dans `ai_conversations.messages[].action`) vers la nouvelle table `loic_actions` ?

| Option | Avantage | Risque |
|---|---|---|
| A — Migrer l'historique | Dashboard Loïc complet dès le départ | Complexité extraction JSONB |
| B — Démarrer vide | Simple, propre | Pas d'historique actions dans le dashboard V2 |

**Recommandation** : Option B (démarrer vide) — l'historique reste accessible via `ai_conversations`.

---

### V4 — Linkage devis ↔ clients existants ⚠️ DÉCISION

**Question** : Faut-il mettre à jour `devis.client_id` pour lier les devis aux clients existants quand l'email correspond ?

Par exemple : si un client a l'email `test@ca-tech.fr` et qu'il existe des devis avec `contact_email = 'test@ca-tech.fr'`, faut-il renseigner `client_id` ?

**Note** : Les 2 clients actuels sont des données de test. La décision peut attendre les vrais clients.

**Recommandation** : Ne pas faire ce linkage manuellement. L'implémenter dans le flux de conversion lead → client (automatique).

---

### V5 — Nettoyage doublons de leads (même email, personnes différentes) ⚠️ DÉCISION

`formationaic2021@gmail.com` est utilisé pour deux personnes (Doly MAKASSI + Jean BALO).  
`kevin.pemou@gmail.com` est utilisé pour deux personnes (Cyril Gallet + Kevin Pemou).

**Question** : Sont-ce vraiment des personnes différentes, ou des tests répétés par la même personne ?

**Recommandation** : Conserver les deux dans chaque cas. Afficher un avertissement doublon d'email dans l'UI Contacts.

---

**MAPPING TERMINÉ — AUCUNE DONNÉE MIGRÉE — AUCUNE TABLE MODIFIÉE**
