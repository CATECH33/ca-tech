# MANAGER V2 — RAPPORT DE RESTRUCTURATION UI
## Sprint 8 — Refonte Navigation & Interface

---

## 1. ANCIENNES SECTIONS SUPPRIMÉES DE LA NAVIGATION

Les sections suivantes ont été **retirées de la barre latérale** (Sidebar.tsx).
Les routes et composants correspondants restent intacts pour la rétrocompatibilité.

| Section retirée | Ancienne route | Raison |
|---|---|---|
| Leads | `/leads` | Fusionné dans **Demandes & Devis** |
| Devis | `/devis` | Fusionné dans **Demandes & Devis** |
| Factures | `/factures` | Accessible via Paiements |
| Projets | `/projets` | Hors scope nav v2 |
| Tâches | `/taches` | Hors scope nav v2 |
| Services | `/services` | Hors scope nav v2 |
| Portfolio | `/portfolio` | Hors scope nav v2 |
| Agenda | `/agenda` | Accessible via Dashboard (lien rendez-vous) |
| Documents | `/documents` | Hors scope nav v2 |
| Notifications | `/notifications` | Cloche conservée dans le Header |
| Messages | `/messages` | Hors scope nav v2 |
| Support | `/support` | Hors scope nav v2 |
| Intégrations | `/integrations` | À déplacer dans Paramètres (sprint futur) |
| Section Catalogue (collapsible) | `/catalogue/*` | Retirée de la nav principale |

---

## 2. NOUVELLE NAVIGATION (7 items)

| # | Label | Route | Icône |
|---|---|---|---|
| 1 | Vue d'ensemble | `/` | LayoutDashboard |
| 2 | Demandes & Devis | `/demandes` | Inbox |
| 3 | Clients | `/clients` | Users |
| 4 | Paiements | `/paiements` | CreditCard |
| 5 | Loïc IA | `/loic` | Bot |
| 6 | Prospection | `/prospection` | Target |
| — | Paramètres *(bas)* | `/parametres` | Settings |

---

## 3. ROUTES MODIFIÉES / AJOUTÉES

| Changement | Route | Fichier |
|---|---|---|
| **NOUVELLE** | `/demandes/*` | `src/pages/DemandesDevis.tsx` |
| SPA routing | `build.sh` ligne 44 | ajout de `demandes` dans la boucle for |

Toutes les anciennes routes sont conservées dans `App.tsx` — aucune route supprimée.

---

## 4. COMPOSANTS SUPPRIMÉS

**Aucun composant supprimé.** Conformément à la règle : supprimer uniquement quand ils ne sont plus référencés. Tous les composants de page existants restent présents.

---

## 5. COMPOSANTS MODIFIÉS

| Composant | Fichier | Modification |
|---|---|---|
| Sidebar | `src/components/layout/Sidebar.tsx` | Refonte complète : 7 items au lieu de 17+ |
| Breadcrumbs | `src/components/layout/Breadcrumbs.tsx` | Ajout labels : `demandes`, `loic`, `agenda`, `documents`, `integrations`, `catalogue`, `collaborateurs` |
| Dashboard | `src/pages/Dashboard.tsx` | Simplifié : suppression charts, 6 KPIs clairs, alertes, activité |
| App | `src/App.tsx` | Ajout import + route `/demandes/*` |
| build.sh | `build.sh` | Ajout route `demandes` pour SPA routing |

---

## 6. COMPOSANTS CONSERVÉS (sélection)

Tous les composants de page existants sont conservés :
- `Clients.tsx`, `Leads.tsx`, `Devis.tsx`, `Factures.tsx`
- `Projets.tsx`, `Taches.tsx`, `Services.tsx`, `Paiements.tsx`
- `Portfolio.tsx`, `Agenda.tsx`, `Messages.tsx`, `Support.tsx`
- `Parametres.tsx`, `Loic.tsx`, `Notifications.tsx`, `Documents.tsx`
- `Integrations.tsx`, `GoogleOAuthCallback.tsx`
- Module Prospection complet (11 pages)
- Module Catalogue complet (4 pages)
- Tous les hooks, contexts, libs, connectors

---

## 7. NOUVEAU COMPOSANT CRÉÉ

### `DemandesDevis.tsx` — Demandes & Devis unifiées

**Route :** `/demandes`

**Fonctionnalités :**
- Vue pipeline 4 étapes : Demande → Qualification → Devis → Paiement
- Compteurs en temps réel pour chaque étape
- Onglets : Tous / Demandes / Devis
- Recherche full-text sur nom, entreprise, numéro de devis
- Liste unifiée avec statuts, montants, dates
- Liens vers les pages de gestion complètes (`/leads`, `/devis`)

**Sources de données :**
- `useLeads()` — demandes/leads
- `useDevis()` — devis

---

## 8. REFONTE DASHBOARD

### Avant
- 10+ sections : hero, 2 rangées KPIs, 3 charts (area, donut, bar), alertes, échéances, tâches urgentes, projets en cours, top clients, derniers devis, dernières factures, pipeline leads, activité
- Imports : Recharts (AreaChart, PieChart, BarChart, etc.)
- Nombreux liens vers sections retirées (tâches, projets, messages, support)

### Après
- Structure épurée : hero + 6 KPIs + alertes + activité
- **6 indicateurs clés :** Demandes à traiter, Devis en attente, Paiements en attente, Clients actifs, Prospects actifs, Rendez-vous à venir
- Suppression de tous les graphiques décoratifs
- Suppression Recharts du Dashboard (toujours présent ailleurs)
- Liens mis à jour vers la nouvelle nav (`/demandes` au lieu de `/leads` + `/devis`)
- Actions d'en-tête : "+ Demande" et "+ Client"

**Sources de données :**
- `useLeads()`, `useDevis()`, `useFactures()`, `usePaiements()`
- `useClients()`, `useProspects()`, `useAppointments()`

---

## 9. TESTS EFFECTUÉS

| Test | Résultat |
|---|---|
| `tsc -b` (TypeScript) | ✅ 0 erreur |
| `vite build` | ✅ Build réussi en 2.86s |
| ESLint sur fichiers modifiés | ✅ 0 erreur, 0 warning |
| Erreurs lint pre-existantes | ⚠️ FileUpload.tsx, AuthContext.tsx, useAgenda.ts, useApify.ts — non modifiés |
| Route `/demandes` dans SPA routing | ✅ Ajoutée dans build.sh |

---

## 10. POINTS D'ATTENTION POUR LA SUITE

- **Intégrations** : la page Intégrations existe mais n'est plus dans la nav principale. Elle pourrait être intégrée dans Paramètres (sprint futur).
- **Catalogue** : les pages Services et Collaborateurs IA existent mais ne sont plus accessibles via la nav principale. À intégrer dans Paramètres ou une section dédiée si besoin.
- **Google Workspace** : la section Paramètres contient déjà la gestion Google OAuth. La présentation "connexion globale" est à vérifier dans Parametres.tsx.
- **Prospection collapsible → lien simple** : le module Prospection était un menu collapsible avec 11 sous-items. Il est maintenant accessible via un lien simple vers `/prospection`. La navigation interne du module est inchangée.

---

**MANAGER V2 — INTERFACE RESTRUCTURÉE — BUILD VALIDÉ**
