# SPRINT 12.1 — Relances automatiques des factures impayées
## Rapport de livraison — Priorité 1

**Date :** 2026-08-21
**Sprint :** 12.1
**Module :** Relances automatiques factures impayées (cron-invoice-reminders)

---

## 1. FICHIERS CRÉÉS / MODIFIÉS

| Fichier | Action | Description |
|---------|--------|-------------|
| `supabase/migrations/021_invoice_reminders.sql` | Créé | Table `invoice_reminders`, colonne `skip_reminders` sur `invoices`, RLS, index, instructions cron |
| `supabase/functions/cron-invoice-reminders/index.ts` | Créé | Edge Function Deno — orchestration complète des relances |
| `manager/src/hooks/useInvoiceReminders.ts` | Créé | Hook React + type `InvoiceReminder` + constante `STAGE_META` |
| `manager/src/pages/Factures.tsx` | Modifié | Import `Bell` + `useInvoiceReminders` + composant `ReminderHistory` |

---

## 2. ARCHITECTURE DU MODULE

### 2.1 Migration SQL (021)

| Opération | Détail |
|-----------|--------|
| `ALTER TABLE invoices ADD skip_reminders` | Booléen, DEFAULT false — protège les futures factures normales |
| `UPDATE invoices SET skip_reminders = true` | FAC-2026-0001 à 0004 marquées — drift connu, jamais relancées |
| `CREATE TABLE invoice_reminders` | id, invoice_id (FK), stage (CHECK), sent_at, message_id, response_status, created_at |
| RLS activée | Policy `managers read invoice_reminders` — réutilise `is_ca_tech_manager()` |
| 3 index | `invoice_id`, `(invoice_id, stage)`, `sent_at DESC` |
| Section cron commentée | À exécuter manuellement après déploiement + CRON_SECRET configuré |

### 2.2 Edge Function `cron-invoice-reminders`

**Authentification :** `verify_jwt = false` + contrôle `CRON_SECRET` dans le header `Authorization`.

**Flux complet :**

```
POST /functions/v1/cron-invoice-reminders
  1. Vérifie CRON_SECRET → 401 si invalide
  2. Lit token Google (google_integrations) → refresh automatique si expiré
  3. Scan: invoices WHERE status IN ('sent','overdue')
           AND due_date < CURRENT_DATE
           AND skip_reminders = false
  4. Pour chaque facture :
     ├─ Calcule daysOverdue + stage
     ├─ Anti-doublon 48h par (invoice_id, stage) → skip si déjà envoyé
     ├─ stage = 'escalade' → notification in-app + log (pas d'email)
     └─ stages douce/ferme/mise_en_demeure :
          ├─ Génère email via Claude Haiku (JSON structuré)
          ├─ Fallback email générique si Claude indisponible
          ├─ Envoi via Gmail API (base64url RFC 2822)
          ├─ Log dans invoice_reminders
          └─ Pause 500ms (anti rate-limit Gmail)
  5. Retourne { processed, skipped, errors, startedAt, finishedAt }
```

### 2.3 Classification par stade

| Jours de retard | Stage | Comportement |
|-----------------|-------|--------------|
| J+1 → J+7 | `douce` | Email poli, rappel amical |
| J+8 → J+21 | `ferme` | Email ferme, règlement immédiat demandé |
| J+22 → J+45 | `mise_en_demeure` | Email formel + mentions légales : indemnité 40 € (art. L441-10) + pénalités BCE + 10 pts |
| J+46+ | `escalade` | Notification in-app manager uniquement |

### 2.4 Génération email (Claude Haiku)

- Modèle : `claude-haiku-4-5-20251001`
- Sortie JSON structurée : `{ "subject": "...", "body_html": "..." }`
- Gabarit HTML CA-TECH : couleurs #0066FF / #0A2540, responsive, footer légal automatique
- Fallback générique si Anthropic API indisponible (pas de crash du batch)
- Prompts en français, ton adapté au stade

### 2.5 Envoi Gmail API

- Appel direct Gmail API (`users/me/messages/send`) depuis l'edge function (pas via `gmail-send`)
- Tokens lus depuis `google_integrations` avec le service role key (bypass RLS)
- Refresh automatique si `expires_at < now + 5min`
- Message encodé en RFC 2822 → base64url

### 2.6 Frontend — `ReminderHistory`

Composant affiché dans la fiche facture (`FactureFiche`), après l'historique des règlements :
- Visible uniquement si des relances existent (0 requête supplémentaire sur la liste)
- Code couleur par stade : bleu → amber → orange → rouge
- Badges : "Email envoyé ✓", "Notification manager", "Erreur [status]"
- Date d'envoi + Gmail message ID (audit)

---

## 3. CONTRAINTES RESPECTÉES

| Contrainte | Résultat |
|-----------|---------|
| 4 factures historiques intouchables | ✅ `skip_reminders = true` depuis la migration |
| Logique Stripe existante intacte | ✅ 0 modification stripe-webhook |
| verify_jwt = false sur le cron | ✅ CRON_SECRET en remplacement |
| Aucune donnée sensible loguée en clair | ✅ Pas de token ni email dans les logs |
| Tokens Google côté Supabase | ✅ Lecture depuis `google_integrations` via service_role |
| RLS sur nouvelle table | ✅ `invoice_reminders` — policy manager-only |
| Prompts Claude en français | ✅ Prompt 100 % français, ton professionnel |
| Claude Haiku | ✅ `claude-haiku-4-5-20251001` |
| TypeScript (tsc -b) | ✅ 0 erreur |
| Vite build | ✅ 3.44s |

---

## 4. ARRÊT AUTOMATIQUE DES RELANCES

Le webhook Stripe existant (`checkout.session.completed`) appelle `sync_invoice_after_payment` qui passe la facture en `status = paid`. Le scan dans le cron filtre `status IN ('sent', 'overdue')` — une facture payée n'est plus jamais relancée, sans aucune modification du webhook.

---

## 5. VARIABLE D'ENVIRONNEMENT REQUISE

| Variable | Rôle | Où la créer |
|----------|------|-------------|
| `CRON_SECRET` | Auth entre pg_cron et l'edge function | Supabase → Project Settings → Edge Functions → Secrets |

---

## 6. SETUP POST-DÉPLOIEMENT

```bash
# 1. Générer le secret
openssl rand -hex 32  # → coller dans Supabase Secrets

# 2. Déployer
supabase functions deploy cron-invoice-reminders --no-verify-jwt

# 3. Test manuel
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/cron-invoice-reminders \
  -H "Authorization: Bearer [CRON_SECRET]" \
  -H "Content-Type: application/json" \
  -d '{}'

# 4. Activer pg_cron (via SQL Editor Supabase)
# → Décommenter et exécuter la section CRON de la migration 021
#   en remplaçant [PROJECT_REF] et [CRON_SECRET]
```

---

## 7. TESTS

| Test | Résultat |
|------|---------|
| TypeScript (tsc --noEmit) | ✅ 0 erreur |
| Vite build | ✅ 3.44s — 0 nouveau warning |
| Migration SQL | ✅ Exécutée sans erreur |
| Edge Function déployée | ✅ `--no-verify-jwt` |
| Appel curl manuel | ✅ `{ processed, skipped, errors }` |
| Anti-doublon 48h | ✅ Vérifié : 2e appel skip toutes les factures |
| `skip_reminders` sur FAC-0001→0004 | ✅ Vérifié en base |

---

## 8. INTÉGRITÉ DES DONNÉES

| Contrôle | Résultat |
|----------|---------|
| Tables modifiées | `invoices` (colonne ajoutée, additive) |
| Tables créées | `invoice_reminders` |
| Données supprimées | 0 |
| Logique Stripe modifiée | 0 |
| Factures historiques touchées | 0 (skip_reminders = true) |

---

**SPRINT 12.1 — PRIORITÉ 1 TERMINÉE**

Prochaine étape : Priorité 2 — Agrégateur emails + compte rendu IA quotidien
