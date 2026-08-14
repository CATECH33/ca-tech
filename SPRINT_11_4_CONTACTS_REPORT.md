# SPRINT 11.4 — CONTACTS & DEMANDES MANAGER V2
## Rapport de développement

**Date :** 2026-08-14  
**Sprint :** 11.4  
**Périmètre :** Contacts & Demandes — enrichissement fiche, filtres, intégration devis, actions Loïc IA

---

## 1. FICHIERS MODIFIÉS

| Fichier | Nature | Description |
|---|---|---|
| `manager/src/pages/Contacts.tsx` | Modifié | Refonte Sprint 11.4 — filtres, devis associé, Loïc IA, anti-doublon |
| `SPRINT_11_4_CONTACTS_REPORT.md` | Créé | Ce rapport |

**Fichiers supprimés : 0**

---

## 2. HOOKS RÉUTILISÉS

| Hook | Source | Usage Sprint 11.4 |
|---|---|---|
| `useLeads()` | `hooks/useLeads.ts` | Leads + statuts + filtres |
| `useConvertLeadToClient()` | `hooks/useLeads.ts` | Conversion lead → client (anti-doublon côté serveur existant) |
| `useClients()` | `hooks/useClients.ts` | Détection doublon côté UI (email match) |
| `useDevis()` | `hooks/useDevis.ts` | Filtrage devis par client_id pour la fiche |
| `useMessages()` | `hooks/useMessages.ts` | Onglet Messages |

**Total hooks nouvellement importés : 2 (`useClients`, `useDevis`) — aucun hook modifié, aucun hook créé**

---

## 3. NOUVELLES FONCTIONNALITÉS

### 3.1 Filtres de liste (LeadsSection)

| Filtre | Statuts inclus | Description |
|---|---|---|
| Toutes | Tous statuts | Affichage complet |
| Nouvelles | `nouveau` | Demandes entrantes non traitées |
| En cours | `contact`, `qualifie`, `proposition`, `negocie` | Demandes en traitement actif |
| Traitées | `gagne` | Demandes converties en client |
| Perdues | `perdu` | Demandes non abouties |

### 3.2 Champ "Service demandé"

- **Source :** champ `besoin` de la table `leads` (mappé depuis `notes`)
- **Avant :** label "Notes & besoin"
- **Après :** label "Besoin / Service demandé" dans la fiche, "Service demandé / Besoin" dans la modale de création
- **Note :** Aucune colonne `service` n'existe dans la table leads — `besoin` est le champ pertinent

### 3.3 Devis associé dans la fiche lead

- **Source :** `useDevis()` filtré par `d.client_id === fiche.client_id`
- **Affichage :** numéro de devis, montant TTC, badge statut coloré
- **Lien :** chaque devis pointe vers `/devis` (page liste — aucune route `/devis/:id` n'existe)
- **Vide :** "Aucun devis associé" avec icône gris si `devisLies.length === 0`
- **Type :** `DevisResume = { id, numero, status, total_ttc }` — données minimales pour la fiche

### 3.4 Boutons d'action dans la fiche lead

| Bouton | Condition | Route | Icon |
|---|---|---|---|
| Voir le client | `isConverted` (status === 'gagne') | `/clients` | Users |
| Loïc IA | Toujours visible | `/loic` | Bot |

### 3.5 Anti-doublon dans la modale de conversion

- **Logique :** `existingClientForConvert = clients.find(c => c.email === convertLead.email)`
- **Si doublon détecté :** alerte amber "Client existant détecté : Prénom Nom. Le lead sera lié à ce client sans créer de doublon."
- **Si pas de doublon :** texte standard "Un profil client sera créé."
- **Note :** `useConvertLeadToClient` gère déjà la prévention côté serveur — cet affichage est purement informatif

### 3.6 Loïc IA dans le panneau message

- Bouton "Loïc IA" ajouté dans la barre d'actions du panneau détail message (MessagesSection)
- Lien vers `/loic` — icône Bot

### 3.7 Client lié → lien cliquable

- La puce "client lié" dans MessagesSection est maintenant un `<Link to="/clients">` plutôt qu'un simple badge

### 3.8 Label onglet renommé

- `Leads` → `Demandes` (onglet supérieur de la page Contacts)

---

## 4. SOURCES DE DONNÉES

| Section | Table Supabase | Filtre |
|---|---|---|
| Liste leads / filtres | `leads` | Par `status` selon FilterGroup |
| Fiche lead — Devis associé | `devis` | `client_id === fiche.client_id` |
| Anti-doublon conversion | `clients` | `email === convertLead.email` |
| Onglet Messages | `messages` | Non modifié |

---

## 5. TYPES AJOUTÉS

```ts
type FilterGroup = 'toutes' | 'nouvelles' | 'encours' | 'traitees' | 'perdues'

type DevisResume = { id: string; numero: string; status: string; total_ttc: number }

const FILTER_LABELS: Record<FilterGroup, string> = {
  toutes: 'Toutes', nouvelles: 'Nouvelles', encours: 'En cours',
  traitees: 'Traitées', perdues: 'Perdues',
}
```

---

## 6. INTÉGRITÉ DES DONNÉES

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

## 7. TESTS

| Test | Résultat |
|---|---|
| TypeScript (tsc -b) | ✅ 0 erreur |
| Vite build | ✅ 3573+ modules transformés |
| Contacts chunk | 50.84 kB (gzip: 11.86 kB) — +3.76 kB vs Sprint 11.2 pour nouvelles fonctionnalités |
| Build time | 3.39s |
| Filtre Toutes | ✅ Tous leads affichés |
| Filtre Nouvelles | ✅ leads.status === 'nouveau' uniquement |
| Filtre En cours | ✅ contact/qualifie/proposition/negocie |
| Filtre Traitées | ✅ leads.status === 'gagne' uniquement |
| Filtre Perdues | ✅ leads.status === 'perdu' uniquement |
| Devis associé — vide | ✅ "Aucun devis associé" si client_id vide ou aucun devis |
| Devis associé — avec données | ✅ Numéro + montant + badge statut + lien /devis |
| Bouton Voir le client | ✅ Visible uniquement si status === 'gagne' |
| Bouton Loïc IA | ✅ Toujours visible dans la fiche lead |
| Anti-doublon — doublon détecté | ✅ Alerte amber avec nom du client existant |
| Anti-doublon — pas de doublon | ✅ Texte standard affiché |
| Loïc IA dans messages | ✅ Bouton présent dans barre d'actions |
| Client lié → lien | ✅ Cliquable → /clients |
| Label onglet Demandes | ✅ "Demandes" affiché (était "Leads") |
| Valeurs fictives | ✅ Aucune — tout vient des hooks réels |
| Fiche vide | ✅ Tous les champs non renseignés affichent "—" |

---

## 8. DESIGN

- Filtres : pills actives brand-500 / fond blanc inactif — aligné design CA-TECH
- Devis associé : cards blanches avec border subtil, badge coloré par statut
- Boutons d'action : style ghost small avec icônes — cohérent avec le reste de la fiche
- Alerte doublon : amber warning box — palette existante dans l'app
- Responsive : fiche latérale scrollable, filtres en flex-wrap sur mobile

---

**SPRINT 11.4 TERMINÉ — CONTACTS & DEMANDES OPÉRATIONNELS — DONNÉES PRÉSERVÉES**
