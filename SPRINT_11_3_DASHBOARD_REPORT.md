# SPRINT 11.3 — DASHBOARD MANAGER V2
## Rapport de développement

**Date :** 2026-08-14  
**Sprint :** 11.3  
**Périmètre :** Dashboard — refonte complète en centre de pilotage CA-TECH

---

## 1. FICHIERS MODIFIÉS

| Fichier | Nature | Description |
|---|---|---|
| `manager/src/pages/Dashboard.tsx` | Modifié | Refonte complète Dashboard V2 |
| `SPRINT_11_3_DASHBOARD_REPORT.md` | Créé | Ce rapport |

**Fichiers supprimés : 0**

---

## 2. HOOKS RÉUTILISÉS

| Hook | Source | Données |
|---|---|---|
| `useClients()` | `hooks/useClients.ts` | Clients, total, statuts |
| `useLeads()` | `hooks/useLeads.ts` | Leads, statuts, noms |
| `useDevis()` | `hooks/useDevis.ts` | Devis, statuts, montants, dates |
| `useFactures()` | `hooks/useFactures.ts` | Factures en retard, montants |
| `usePaiements()` | `hooks/usePaiements.ts` | Paiements, dates, montants |
| `useProspects()` | `hooks/useProspects.ts` | Prospects, statuts, pipeline |
| `useMessages()` | `hooks/useMessages.ts` | Messages non lus, archivés |
| `useSubscriptions()` | `hooks/useSubscriptions.ts` | Abonnements actifs/annulés |
| `useLoicConversations()` | `hooks/useLoic.ts` | Conversations IA, statuts, metadata |

**Total : 9 hooks — aucun hook modifié, aucun hook créé**

---

## 3. SOURCES DE DONNÉES

| KPI / Section | Table Supabase | Filtre appliqué |
|---|---|---|
| Nouveaux contacts | `leads` + `messages` | leads.status='nouveau' + messages.is_read=false |
| Devis en attente | `devis` / `quotes` | status='envoye' |
| Devis acceptés | `devis` / `quotes` | status='accepte', created_at >= mois en cours |
| Paiements reçus | `payments` | date_paiement >= début du mois |
| Abonnements actifs | `subscriptions` | status='active' |
| Prospects à relancer | `prospects` | status IN (contacted, email_ready, responded, qualified) |
| À traiter | `messages` + `leads` + `devis` + `invoices` | Non lus / en retard / expirant bientôt |
| Activité récente | Toutes les tables ci-dessus | Tri chronologique, 10 derniers événements |
| Loïc IA | `ai_conversations` | Toutes, triées par updated_at |
| Prospection | `prospects` | Total / nouveaux (7j) / à relancer |

---

## 4. KPI CRÉÉS (6)

| # | KPI | Valeur | Source | Accent |
|---|---|---|---|---|
| 1 | Nouveaux contacts | Nombre | leads(nouveau) + messages(non lus) | Bleu si > 0 |
| 2 | Devis en attente | Nombre | devis(envoye) | Amber |
| 3 | Devis acceptés | Nombre (ce mois) | devis(accepte) | Emerald |
| 4 | Paiements reçus | Montant €, nb paiements | paiements(ce mois) | Teal + variation % |
| 5 | Abonnements actifs | Nombre | subscriptions(active) | Violet |
| 6 | Prospects à relancer | Nombre | prospects(contacted/qualified/etc.) | Orange |

---

## 5. SECTIONS DU DASHBOARD

### Hero
- CA encaissé ce mois (somme paiements)
- Variation % vs mois précédent
- 3 compteurs rapides : Clients / Devis actifs / Prospects actifs

### 6 KPIs
- Grille 2 colonnes mobile, 3 colonnes desktop
- Chaque KPI lié à son module
- Accentuation dynamique si action requise

### Actions rapides
- 6 boutons en grille (3 mobile / 6 desktop)
- Nouveau devis → /devis
- Voir les demandes → /contacts
- Voir les clients → /clients
- Voir les paiements → /paiements
- Ouvrir Loïc IA → /loic
- Prospection → /prospection

### À traiter
- Messages non lus → /contacts
- Contacts non traités (leads nouveau) → /contacts
- Devis expirant dans 7 jours → /devis
- Factures en retard → /paiements
- Abonnements annulés → /paiements
- Maximum 6 alertes affichées, vide = "Aucune action requise"

### Activité récente
- 10 derniers événements triés chronologiquement
- Types : paiement / devis / client / lead / message / prospect / conversation / abonnement
- Affichage temps relatif ("il y a 2h", "hier", etc.)

### Loïc IA
- Totaux : conversations / en cours / terminées
- Conversations aujourd'hui (badge si > 0)
- Dernière activité (temps relatif)
- Liste des 3 dernières conversations avec statut
- Bouton : Voir Loïc IA → /loic

### Prospection
- Totaux : total / cette semaine / à relancer
- Alerte cliquable si prospects à relancer
- Pipeline actif
- Liste des 3 derniers prospects avec statut
- Bouton : Voir la prospection → /prospection

---

## 6. ACTIONS RAPIDES

| Action | Route | Icon |
|---|---|---|
| Nouveau devis | `/devis` | FileText |
| Voir les demandes | `/contacts` | Inbox |
| Voir les clients | `/clients` | Users |
| Voir les paiements | `/paiements` | CreditCard |
| Ouvrir Loïc IA | `/loic` | Bot |
| Prospection | `/prospection` | Target |

---

## 7. DESIGN

- Design système CA-TECH : blanc / gris / brand-500 (#0066FF) / #0A2540
- Hero gradient dark → brand
- KPI cards : hover subtle shadow, accent dynamique si urgence
- Couleurs cohérentes par type d'événement
- Responsive : 2 col mobile → 3 col desktop pour KPIs, 1→2 col pour sections

---

## 8. INTÉGRITÉ DES DONNÉES

| Contrôle | Résultat |
|---|---|
| Tables créées | **0** |
| Tables modifiées | **0** |
| Données supprimées | **0** |
| Migrations exécutées | **0** |
| Edge Functions modifiées | **0** |
| Hooks métier modifiés | **0** |
| Logique Stripe modifiée | **0** |

### Données critiques vérifiées

| Table | Lignes | Statut |
|---|---|---|
| clients | 2 | ✅ Intact |
| devis | 33 | ✅ Intact |
| invoices | 4 | ✅ Intact (amount_paid=180, sans payment associé) |
| payments | 4 | ✅ Intact |
| devis_items | 50 | ✅ Intact |
| manager_users | 1 | ✅ Intact |

---

## 9. TESTS

| Test | Résultat |
|---|---|
| TypeScript (tsc -b) | ✅ 0 erreur |
| Vite build | ✅ 3573 modules transformés |
| Dashboard chunk | 20.59 kB (gzip: 5.16 kB) — +9kB vs V1 pour 4 nouvelles sections |
| Build time | 2.71s |
| KPI "Nouveaux contacts" | ✅ Données réelles (leads + messages) |
| KPI "Devis en attente" | ✅ Données réelles (devis.status=envoye) |
| KPI "Devis acceptés" | ✅ Données réelles (devis.status=accepte) |
| KPI "Paiements reçus" | ✅ Données réelles (sum paiements ce mois) |
| KPI "Abonnements actifs" | ✅ Données réelles (subscriptions.status=active) — affiche 0 si vide |
| KPI "Prospects à relancer" | ✅ Données réelles (prospects par statut) |
| Valeurs fictives | ✅ Aucune — tout est 0 ou "—" si données absentes |
| Liens KPIs | ✅ Tous vérifiés (/contacts, /devis, /paiements, /prospection) |
| Actions rapides | ✅ 6 boutons, tous liés aux modules existants |
| Section Loïc IA | ✅ Masquée proprement si 0 conversations |
| Section Prospection | ✅ Masquée proprement si 0 prospects |
| Desktop (≥1024px) | ✅ 3 col KPI, 2 col sections |
| Mobile (<768px) | ✅ 2 col KPI, 1 col sections, boutons actions 3 col |

---

## 10. VÉRIFICATION DES DONNÉES RÉELLES

Aucune valeur fictive ou inventée dans le Dashboard.

- Si 0 paiements ce mois → Hero affiche "0,00 €"
- Si 0 conversations Loïc → section affiche message vide
- Si 0 prospects → section affiche message vide
- Si 0 alertes → section affiche "Aucune action requise" + icône check
- Si abonnements vides → KPI affiche 0

---

**SPRINT 11.3 TERMINÉ — DASHBOARD MANAGER V2 OPÉRATIONNEL — DONNÉES PRÉSERVÉES**
