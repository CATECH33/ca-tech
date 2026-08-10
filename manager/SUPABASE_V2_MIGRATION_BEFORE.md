# SUPABASE V2 — ÉTAT AVANT MIGRATION

**Date** : 2026-08-10  
**Heure** : Prise avant toute écriture Sprint 6  
**Projet** : CA-TECH (`jhcyooksjeivajdjicka`, eu-west-1)  
**Sprint** : 6 — Migration contrôlée

> Aucune donnée modifiée au moment de cette capture.

---

## TABLES V2 ACTIVES

| Table | Lignes AVANT | Type | Attendu APRÈS |
|---|---|---|---|
| `clients` | 2 | Existante — réutilisée | ≥ 2 |
| `leads` | 13 | Existante — réutilisée | ≥ 13 |
| `messages` | 6 | Existante — réutilisée | ≥ 6 |
| `devis` | 32 | Existante — réutilisée | = 32 (aucune suppression) |
| `devis_items` | 49 | Existante — réutilisée | = 49 (aucune suppression) |
| `quotes` | 0 | Vestige vide | = 0 |
| `quote_items` | 0 | Vestige vide | = 0 |
| `invoices` | 4 | Existante — réutilisée | ≥ 4 |
| `invoice_items` | 4 | Existante — réutilisée | ≥ 4 |
| `payments` | 4 | Existante — réutilisée | = 4 (aucune suppression) |
| `ai_conversations` | 8 | Existante — réutilisée | ≥ 8 |
| `google_integrations` | 1 | Existante — conservée intacte | = 1 |
| `notifications` | 1 | Existante — réutilisée | ≥ 1 |
| `notification_settings` | 3 | Existante — réutilisée | = 3 |
| `loic_actions` | 0 | **NOUVELLE V2** — démarrer vide (D1) | = 0 |
| `client_google_connections` | 0 | **NOUVELLE V2** — via OAuth (D2) | = 0 |
| `app_settings` | 0 | **NOUVELLE V2** — via useAppSettings.ts | = 0 (migration frontend) |
| `stripe_payment_links` | 0 | **NOUVELLE V2** — nouvelles données | = 0 |
| `subscriptions` | 0 | **NOUVELLE V2** — nouvelles données | = 0 |

---

## TABLES OBSOLÈTES (hors périmètre V2 — données conservées intactes)

| Table | Lignes AVANT | Statut |
|---|---|---|
| `prospects` | 25 | Conservée — module Prospection supprimé |
| `prospect_contacts` | 5 | Conservée |
| `prospect_activities` | 0 | Conservée |
| `prospect_campaigns` | 1 | Conservée |
| `campaigns` | 1 | Conservée |
| `campaign_steps` | 0 | Conservée |
| `email_drafts` | 16 | Conservée |
| `notification_logs` | 83 | Conservée |
| `projects` | 4 | Conservée |
| `services` | 9 | Conservée |
| `audit_logs` | 32 | Conservée |
| `integration_logs` | 17 | Conservée |
| `calendar_events` | 5 | Conservée |

---

## INTÉGRITÉ FK AVANT MIGRATION

| Contrôle | Résultat |
|---|---|
| devis → leads (orphelins) | **0** ✅ |
| leads → clients (converted_to_client_id orphelins) | **0** ✅ |
| payments → invoices (orphelins) | **0** ✅ |
| devis_items → devis (orphelins) | **0** ✅ |
| invoice_items → invoices (orphelins) | **0** ✅ |

Intégrité référentielle : **PARFAITE avant migration**

---

## RÉSUMÉ DÉCISIONS APPLIQUÉES

| Décision | Action en Sprint 6 |
|---|---|
| D1 — loic_actions vide | Table déjà à 0 — aucune écriture |
| D2 — Google : pas de migration | google_integrations conservée intacte — client_google_connections reste à 0 |
| D3 — Payments : invoice_id NULL | 4 paiements conservés tels quels |
| D4 — devis_items source unique | 49 lignes confirmées — quote_items = 0 |
| D5 — Devis test identifiés | 26 certains + 3 probables signalés — aucune suppression |
| app_settings | Migration via useAppSettings.ts au 1er chargement frontend — non exécutable en SQL |
