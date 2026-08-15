# SPRINT 11.5 — DEVIS + PAIEMENTS + ABONNEMENTS
## Rapport de développement

**Date :** 2026-08-15  
**Sprint :** 11.5  
**Périmètre :** Devis → Paiements → Abonnements — cœur commercial opérationnel

---

## 1. FICHIERS MODIFIÉS

| Fichier | Nature | Description |
|---|---|---|
| `manager/src/hooks/usePaiements.ts` | Modifié | Ajout `facture_type` (acompte/solde/unique) dans `PaiementRow` + select étendu |
| `manager/src/pages/Paiements.tsx` | Modifié | Onglet Abonnements + colonne Type de paiement + badge TypeBadge |
| `manager/src/pages/Devis.tsx` | Modifié | Lien "Fiche client" dans le document devis |
| `SPRINT_11_5_DEVIS_PAIEMENTS_REPORT.md` | Créé | Ce rapport |

**Fichiers supprimés : 0**

---

## 2. DEVIS (Devis.tsx — complété)

### Fonctionnalités présentes

| Fonctionnalité | État |
|---|---|
| Liste des devis (search + filtres statut) | ✅ Tous/Brouillon/Envoyé/Accepté/Refusé/Expiré |
| Document view (numéro, client, lignes, totaux HT/TVA/TTC) | ✅ |
| Pièces jointes | ✅ Via DevisDocuments |
| Signature client | ✅ Pad + prévisualisation |
| Export PDF | ✅ html2canvas + jsPDF |
| Envoi email (Gmail) | ✅ useGmailSend |
| Édition des lignes | ✅ LignesEditor avec services |
| Duplication | ✅ useDuplicateDevis |
| Conversion → Facture | ✅ useConvertDevisToFacture |
| Paiements du projet (Acompte 50% / Solde 50%) | ✅ DevisPaymentSection |
| **Lien → Fiche client** | ✅ **AJOUT Sprint 11.5 — "Fiche client" dans section Pour** |

### Ajout Sprint 11.5

- **Lien "Fiche client"** dans l'en-tête de la section "Pour" du document devis → `/clients`
- Import `Link` de react-router-dom + icône `ExternalLink`

---

## 3. PAIEMENTS (Paiements.tsx — enrichissements Sprint 11.5)

### 3.1 Onglet Abonnements

- **Source :** `useSubscriptions()` — tous les abonnements Stripe
- **Table :** Client, Offre, Montant, Fréquence, Statut, Début, Prochaine échéance
- **Statuts :** Actif (vert), Essai (bleu), Suspendu (amber), Impayé (rouge), Annulé (gris)
- **Panel détail :** informations complètes + lien client + Stripe ID
- **Action annulation :** bouton "Annuler l'abonnement" → `useCancelSubscription` → Stripe → fin de période
- **Confirmation :** dialog amber avant annulation
- **Badge actifs :** compteur vert sur l'onglet Abonnements

### 3.2 Type de paiement (Acompte / Solde / Unique)

- **Source :** `invoices.payment_type` — fetched via join Supabase
- **Colonne "Type"** ajoutée dans la table des paiements
- **TypeBadge :** Acompte (bleu), Solde (violet), Unique (gris)
- **Panel détail :** ligne "Type de paiement" avec badge
- **Hook mis à jour :** `usePaiements` → `.select('*, clients(*), invoices(invoice_number, total, amount_paid, payment_type)')` + `facture_type` dans `PaiementRow`

### 3.3 Tab switcher

- **Tabs :** Paiements | Abonnements dans le même Layout `/paiements`
- **Cohérence :** nav sidebar "Paiements & abonnements" → `/paiements` (aucune route supplémentaire nécessaire)
- **Bouton "Enregistrer un paiement"** masqué sur l'onglet Abonnements
- **Recherche dédiée** sur l'onglet Abonnements (client, offre)

---

## 4. ABONNEMENTS — FICHE CLIENT (Clients.tsx — déjà complet depuis Sprint antérieur)

| Fonctionnalité | État |
|---|---|
| Onglet Abonnements dans fiche client | ✅ Présent — plan, montant, fréquence, statut, dates |
| Création abonnement (checkout Stripe) | ✅ useCreateSubscriptionCheckout |
| Annulation abonnement | ✅ useCancelSubscription |
| Source : useSubscriptions(client.id) | ✅ Filtré par client |

---

## 5. DASHBOARD — CONNEXION CONFIRMÉE

| KPI Dashboard | Source | Données |
|---|---|---|
| Abonnements actifs | `useSubscriptions()` | `subscriptions.filter(s => s.status === 'active').length` |
| CA ce mois | `usePaiements()` | Paiements du mois |
| Devis en attente | `useDevis()` | `status === 'envoye'` |
| Devis acceptés ce mois | `useDevis()` | `status === 'accepte' && >= startOfMonth` |
| Alertes devis expirant | `useDevis()` | `status === 'envoye' && due <= +7j` |

Aucun système parallèle créé.

---

## 6. DONNÉES HISTORIQUES — PRÉSERVÉES

| Règle | Résultat |
|---|---|
| 4 invoices historiques (amount_paid=180, sans payment) | ✅ Non modifiées — aucune migration |
| Aucune donnée fictive | ✅ Tout vient de Supabase |
| Logique Stripe inchangée | ✅ useCancelSubscription utilisé tel quel |

---

## 7. HOOKS CRÉÉS / MODIFIÉS

| Hook | Nature | Description |
|---|---|---|
| `usePaiements` | Modifié | `facture_type` ajouté — select + PaiementRow + mapRow |

**Total : 1 hook modifié — aucune Edge Function touchée**

---

## 8. INTÉGRITÉ DES DONNÉES

| Contrôle | Résultat |
|---|---|
| Tables créées | **0** |
| Tables modifiées | **0** |
| Données supprimées | **0** |
| Migrations exécutées | **0** |
| Edge Functions modifiées | **0** |
| Logique Stripe modifiée | **0** |

---

## 9. RESPONSIVE

| Section | Mobile | Tablette | Desktop |
|---|---|---|---|
| Devis — liste | Scroll table | Scroll | Table 5 colonnes |
| Devis — fiche | Full width | Full width | Full width |
| Paiements — tab switcher | ✅ Adaptatif | ✅ | ✅ |
| Paiements — table (7 cols) | Scroll horizontal | Scroll | Table complète |
| Abonnements — table (7 cols) | Scroll horizontal | Scroll | Table complète |
| Panels (paiement / abonnement) | Full width | 480px | 480px |

---

## 10. TESTS

| Test | Résultat |
|---|---|
| TypeScript (tsc --noEmit) | ✅ 0 erreur |
| Vite build | ✅ 3573 modules |
| Paiements chunk | 31.54 kB (gzip: 6.89 kB) — +19 kB pour Abonnements section |
| Devis chunk | 50.00 kB (gzip: 12.76 kB) — +0.1 kB pour lien client |
| Build time | 6.97s |
| Tab Paiements | ✅ Conserve tous les filtres, stats, chart |
| Tab Abonnements — liste | ✅ Table client/offre/montant/fréquence/statut/dates |
| Tab Abonnements — panel | ✅ Détail + lien client + annulation Stripe |
| Colonne Type (Acompte/Solde) | ✅ Visible dans table + panel paiement |
| Lien "Fiche client" dans devis | ✅ Section Pour → /clients |
| Données historiques invoices | ✅ Intactes |

---

**SPRINT 11.5 TERMINÉ — DEVIS + PAIEMENTS + ABONNEMENTS OPÉRATIONNELS**
