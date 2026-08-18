# SPRINT 12.1 — Gestion des Devis Signés

**Date :** 2026-08-18  
**Statut :** Implémenté — En attente de validation migration SQL + commit

---

## Résumé

Ajout de la gestion documentaire des devis signés dans CA-TECH Manager.  
Le flux complet : Générer PDF → Imprimer → Signature manuscrite → Import PDF signé → Archivage.

---

## Ce qui existait déjà (non modifié)

| Fonctionnalité | Fichier | Note |
|---|---|---|
| Génération PDF (html2canvas + jsPDF) | `Devis.tsx` | ✅ Inchangé |
| Téléchargement PDF | `Devis.tsx` | ✅ Inchangé |
| Impression (`window.print()`) | `Devis.tsx` | ✅ Inchangé |
| Bucket `client-documents` | Migration 012 | ✅ Inchangé |
| Table `documents` | Migrations existantes | ✅ Colonne ajoutée uniquement |
| Pièces jointes génériques | `DevisDocuments` dans `Devis.tsx` | ✅ Comportement affiné |

---

## Modifications implémentées

### 1. Migration SQL — `supabase/migrations/020_devis_signed_document.sql`

```sql
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'attachment'
    CHECK (document_type IN ('attachment', 'signed_quote'));

CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(document_type);
```

**Impact :** Additif uniquement. Les 100% des documents existants reçoivent `'attachment'` par défaut.  
**À EXÉCUTER MANUELLEMENT** via Supabase Dashboard ou CLI après validation.

---

### 2. `manager/src/hooks/useDocuments.ts`

- `DocumentRecord` : ajout champ `document_type?: string`
- `UploadOptions` : ajout option `documentType?: string`
- `uploadDocument()` : passe `document_type` à l'insert (défaut `'attachment'`)
- `useDocuments()` : filtre désormais `.neq('document_type', 'signed_quote')` — les pièces jointes normales n'affichent plus le doc signé
- Nouveau hook `useSignedDocument(devisId)` : retourne le PDF signé d'un devis (`document_type = 'signed_quote'`)
- `useUploadDocuments` : invalide aussi `['signed-document', entityId]` après upload
- `useDeleteDocument` : invalide aussi `['signed-document', entityId]` si `documentType = 'signed_quote'`

---

### 3. `manager/src/pages/Devis.tsx`

#### Nouveau composant `SignatureDocumentsSection`

Affiché dans `DevisFiche` (mode vue uniquement, pas en édition), juste avant la section paiements.

**Comportement :**

| État | Affichage |
|---|---|
| Aucun doc signé | Badge "En attente de signature" + bouton import |
| Doc signé présent | Badge "Signé" + nom fichier + date import + bouton Télécharger |

**Import :**
- Filtre `accept="application/pdf"` (natif input)
- Validation MIME côté JS (`application/pdf`)
- Taille max : 20 Mo
- Stockage : bucket `client-documents`, path `quote/{devisId}/{uuid}.pdf`
- Type DB : `document_type = 'signed_quote'`
- **Auto-passage statut → `accepte`** si le devis n'est pas déjà accepté

**Suppression :** supprime le fichier storage + la ligne DB, réinitialise l'état "En attente de signature"

**Sécurité :** URLs signées (TTL 1h) via `getSignedUrl()` — accessible uniquement aux utilisateurs authentifiés de Manager

---

## Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `supabase/migrations/020_devis_signed_document.sql` | **CRÉÉ** — à exécuter manuellement |
| `manager/src/hooks/useDocuments.ts` | Modifié |
| `manager/src/pages/Devis.tsx` | Modifié |

---

## Fichiers NON touchés

- Stripe / paiements / abonnements
- Clients existants
- Toutes les autres migrations (001–019)
- `DevisStatus` type — aucun nouveau statut créé
- Table `devis` — aucune colonne ajoutée

---

## Validation technique

| Critère | Résultat |
|---|---|
| TypeScript `--noEmit` | ✅ 0 erreur |
| `npm run build` | ✅ OK en 4.15s |
| Fichiers inutiles créés | ✅ Aucun |
| Données existantes supprimées | ✅ Aucune |

---

## Étapes restantes

1. **Valider la migration** → exécuter `020_devis_signed_document.sql` via Supabase Dashboard
2. **Valider visuellement** → ouvrir un devis, vérifier la section "Signature & Documents"
3. **Tester le flux complet** :
   - Télécharger le PDF du devis
   - Importer un PDF signé
   - Vérifier le passage automatique au statut "Accepté"
   - Vérifier l'affichage nom/date/téléchargement
4. **Commit & push** après validation complète
