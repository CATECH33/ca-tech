# SPRINT 11.4 — CONTACTS + CLIENTS MANAGER V2
## Rapport de développement

**Date :** 2026-08-15  
**Sprint :** 11.4 (révision)  
**Périmètre :** Contacts & Demandes + Clients — module commercial central opérationnel

---

## 1. FICHIERS MODIFIÉS

| Fichier | Nature | Description |
|---|---|---|
| `manager/src/types/index.ts` | Modifié | Client — champs `devis_count` et `paiements_count` optionnels |
| `manager/src/hooks/useClients.ts` | Modifié | Query enrichie (counts devis/paiements) + `useClientLeads` |
| `manager/src/pages/Clients.tsx` | Modifié | Onglet Demandes, doublon email, compteurs liste, Loïc IA |
| `SPRINT_11_4_CONTACTS_CLIENTS_REPORT.md` | Créé | Ce rapport |

**Fichiers supprimés : 0**

---

## 2. CONTACTS & DEMANDES (Contacts.tsx — déjà complet depuis Sprint 11.4 initial)

### Fonctionnalités présentes

| Fonctionnalité | État |
|---|---|
| Liste des demandes (leads) | ✅ Kanban + Vue liste |
| Nom, entreprise, email, téléphone | ✅ Affichés dans fiche + liste |
| Service demandé (`besoin`) | ✅ Label "Besoin / Service demandé" |
| Message / notes | ✅ Corps de la demande |
| Date | ✅ `created_at` formaté |
| Statut | ✅ Badge + pipeline Kanban |
| Recherche | ✅ Par nom, email, entreprise |
| Filtres par statut | ✅ Toutes / Nouvelles / En cours / Traitées / Perdues |
| Ouverture de la demande | ✅ Side panel complet |
| Changement de statut | ✅ Pipeline visuel + pills de statut |
| Voir le client | ✅ Bouton conditionnel (si lead converti) → /clients |
| Voir le devis associé | ✅ Section "Devis associé" avec numéro + montant + statut |
| Ouvrir Loïc IA | ✅ Bouton → /loic dans la fiche et dans les messages |
| Anti-doublon à la conversion | ✅ Détection par email + avertissement amber |
| Onglet Messages | ✅ Interface 3 panels : dossiers / liste / détail |

---

## 3. CLIENTS (Clients.tsx — enrichissements Sprint 11.4)

### 3.1 Onglet Demandes dans la fiche client

- **Source :** `useClientLeads(client.id)` — leads avec `converted_to_client_id === client.id`
- **Affichage :** card par demande avec prénom/nom, statut coloré, service demandé (`besoin`), source, budget estimé, date
- **Lien :** "Voir dans Contacts →" en bas de la liste
- **Vide :** "Aucune demande liée à ce client" avec icône si 0 demandes
- **Position :** 2e onglet après Infos (avant Activité)

### 3.2 Anti-doublon email dans la création client

- **Logique :** `useMemo` qui cherche un client existant par email exact (case insensitive)
- **Si doublon :** alerte amber "Client existant avec cet email : Prénom Nom. Modifiez l'email ou ouvrez la fiche de ce client."
- **Bouton Créer :** désactivé tant qu'un doublon est détecté
- **Si pas de doublon :** formulaire standard, bouton actif

### 3.3 Compteurs Devis / Paiements dans la liste

- **Query enrichie :** `select('*, invoices(total, status), devis(id), payments(id)')`
- **Affichage :** colonne "Devis / Paiements" avec icônes FileText + CreditCard et compteurs
- **Fallback :** affiche 0 si non renseigné (`devis_count ?? 0`)
- **Type Client** : champs `devis_count?: number` et `paiements_count?: number` ajoutés (optionnels, rétrocompatibles)

### 3.4 Bouton Loïc IA dans l'en-tête de la fiche client

- Bouton "Loïc IA" ajouté à côté de "Modifier" → `/loic`

### 3.5 Relations client affichées dans la fiche

| Relation | Tab | Données |
|---|---|---|
| Demandes | Demandes | Leads convertis (source, statut, besoin, budget) |
| Devis | Devis | Numéro, montant TTC, statut, date |
| Factures | Factures | Numéro, montant, statut, échéance |
| Paiements | Paiements | Date, montant, méthode, référence |
| Abonnements | Abonnements | Plan, montant, statut, période |
| Tickets | Tickets | Sujet, priorité, statut |
| Messages | Messages | Sujet, source, lu/répondu, date |

---

## 4. HOOKS CRÉÉS / MODIFIÉS

| Hook | Nature | Description |
|---|---|---|
| `useClients` | Modifié | Select étendu à `devis(id), payments(id)` pour counts |
| `useClientLeads` | Créé | Leads convertis pour un client_id donné |

**Total : 1 hook modifié, 1 hook créé — aucune Edge Function touchée**

---

## 5. DASHBOARD — CONNEXION EXISTANTE CONFIRMÉE

| KPI Dashboard | Source | Données |
|---|---|---|
| Nouveaux contacts | `useLeads()` | `leads.status === 'nouveau'` |
| Demandes à traiter | `useMessages()` + `useLeads()` | Messages non lus + leads nouveaux |
| Nombre de clients | `useClients()` | `clients.length` (compteur rapide Hero) |

Aucun système parallèle créé — les hooks TanStack Query partagent le même queryKey.

---

## 6. INTÉGRITÉ DES DONNÉES

| Contrôle | Résultat |
|---|---|
| Tables créées | **0** |
| Tables modifiées | **0** |
| Données supprimées | **0** |
| Migrations exécutées | **0** |
| Edge Functions modifiées | **0** |
| Logique Stripe modifiée | **0** |
| Doublons clients créés | **0** |

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

## 7. RESPONSIVE

| Section | Mobile | Tablette | Desktop |
|---|---|---|---|
| Liste contacts (Kanban) | Scroll horizontal | Scroll | 7 colonnes visibles |
| Liste contacts (Liste) | 1 col | Scroll table | Table complète |
| Fiche demande | Panel full width | Panel 480px | Panel 480px |
| Liste clients (Table) | Scroll | Scroll | Table 8 colonnes |
| Liste clients (Cards) | 1 col | 2 col | 3 col |
| Fiche client | Panel full width | 720px | 720px |

---

## 8. TESTS

| Test | Résultat |
|---|---|
| TypeScript (tsc -b) | ✅ 0 erreur |
| Vite build | ✅ 3573+ modules |
| Clients chunk | 40.10 kB (gzip: 8.97 kB) — +3.63 kB pour nouvelles fonctionnalités |
| Contacts chunk | 50.84 kB (gzip: 11.85 kB) — inchangé |
| Build time | 2.66s |
| Onglet Demandes (client avec leads) | ✅ Affiche les demandes converties |
| Onglet Demandes (client sans leads) | ✅ "Aucune demande liée" |
| Check doublon email — trouvé | ✅ Alerte amber + bouton désactivé |
| Check doublon email — non trouvé | ✅ Formulaire standard |
| Compteurs devis/paiements en liste | ✅ FileText + CreditCard + nombre |
| Loïc IA dans fiche client | ✅ Bouton → /loic dans header |
| Voir le client depuis demande | ✅ Lien → /clients si lead converti |
| Voir le devis depuis demande | ✅ Section "Devis associé" dans fiche |
| Filtres contacts (5 groupes) | ✅ Toutes / Nouvelles / En cours / Traitées / Perdues |
| Anti-doublon conversion lead→client | ✅ Détection email + warning |
| Données fictives | ✅ Aucune — tout vient de Supabase |

---

**SPRINT 11.4 TERMINÉ — CONTACTS + CLIENTS OPÉRATIONNELS**
