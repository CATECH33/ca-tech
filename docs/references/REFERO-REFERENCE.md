# REFERO REFERENCE — Analyse DESIGN.md
## Ce qui est repris · Ce qui est adapté · Ce qui est rejeté
**Référence source :** `DESIGN (3).md` — Style system "Moxie"  
**Date :** 28 septembre 2026

---

## La référence Moxie en résumé

Moxie est un design system d'agence PR dark-mode avec :
- Canvas noir pur `#000000`
- Typographie IBM Plex Serif 300 comme signature éditoriale
- Accent unique periwinkle `#84acfb`
- Zéro ombre, zéro gradient — hiérarchie par bordures et espacement
- Layout généreux, sections respirantes (80–120px)
- Boutons pill (1000px radius)

---

## 1. CE QUI EST REPRIS — Principes directement applicables

### Typographie IBM Plex

**Repris à 100% :**
- IBM Plex Serif poids 300 pour tous les headlines
- IBM Plex Sans pour le corps et l'UI
- La combinaison Serif (authority) / Sans (fonctionnel) comme tension de marque

**Pourquoi :** Cette décision typographique est universellement valide pour un positionnement premium editorial. Elle transcende le contexte PR-agency de Moxie et s'applique parfaitement à CA-TECH.

### Principe éditorial sans ombre

**Repris à 100% :**
- Pas de box-shadow decoratif
- Hiérarchie créée par : surface tonal, bordures hairline, espacement

**Pourquoi :** Les ombres signalent "SaaS générique 2020". Leur absence est la marque d'un design qui se tient par sa propre structure.

### Italic accent sur les titres

**Repris à 100% :**
- Un mot ou groupe de mots en italic coloré par titre de section
- Crée un rythme typographique reconnaissable

**Adaptation CA-TECH :** La couleur de l'accent change. Moxie utilise le periwinkle `#84acfb`. CA-TECH utilise le Tech Blue `#359BD9`. L'intention est identique : un signal chromatique unique dans un système autrement sobre.

### Rythme vertical généreux

**Repris à 100% :**
- 80–120px entre les sections
- Espacement intérieur des cards : 19–35px
- "Let the canvas breathe"

**Pourquoi :** L'espacement est la forme la moins coûteuse de luxe. Un site qui respire communique confiance.

### Un seul accent chromatique

**Repris comme principe :**
- Moxie : 1 couleur chromatique (periwinkle)
- CA-TECH : 1 couleur chromatique (Tech Blue `#359BD9`)
- Tout le reste est achrome ou tonal

**Pourquoi :** La concentration de l'accent sur une seule couleur lui donne du poids. Quand le Tech Blue apparaît, il signifie quelque chose.

---

## 2. CE QUI EST ADAPTÉ — Principes transformés pour CA-TECH

### Fond principal

**Moxie :** Noir pur `#000000` — darkroom intentionnel, trou noir éditorial  
**CA-TECH :** Deep Navy `#05101E` — fond sombre mais avec chaleur technique

**Pourquoi l'adaptation :** Le noir pur est interdit dans le brief CA-TECH, et pour une bonne raison : il évoque davantage un magazine ou une galerie d'art qu'un cabinet technologique. Le Deep Navy `#05101E` conserve la profondeur sombre mais ancre dans un registre bleu nuit — plus "salle de contrôle" que "galerie".

### Bordures des cards

**Moxie :** Cream `#f4efd4` sur fond noir — très visible, hairline warm  
**CA-TECH :** `rgba(255,255,255,0.08)` sur fond Navy — très subtile, presque invisible

**Pourquoi l'adaptation :** Sur fond noir, une bordure cream crème crée une tension dramatique théâtrale valide pour une agence PR. Sur fond Navy, la même bordure serait trop froide et détachée. La bordure semi-transparente préserve la structure sans s'imposer.

### Radius des boutons

**Moxie :** 1000px (pill complet) — très arrondi, organique  
**CA-TECH :** 4–6px — sobre, technique, précis

**Pourquoi l'adaptation :** Le pill button de Moxie s'accorde avec l'esthétique éditoriale PR chaleureuse. CA-TECH cible un positionnement plus structurel, moins "agence créative". Des boutons quasi-rectangulaires avec un radius minimal communiquent précision et maîtrise technique.

### Typographie — Poids et taille

**Moxie :** 55px weight 300 pour les heroes  
**CA-TECH :** 56–72px weight 300 — gamme légèrement plus large selon viewport

**Pourquoi :** CA-TECH a besoin de plus de flexibilité responsive. La philosophie (poids léger = élégance) est identique.

### Palette globale

**Moxie :** Monochrome achrome (black, cream, warm ash)  
**CA-TECH :** Tonale bleue (Deep Navy, Navy, Technical Blue, Tech Blue, Silvers)

**Pourquoi l'adaptation :** Moxie joue sur la tension achrome. CA-TECH joue sur la progression tonale — de l'obscurité du fond vers la luminosité technique de l'accent. Ce choix est plus cohérent avec l'identité d'un cabinet tech.

---

## 3. CE QUI EST REJETÉ — Principes incompatibles avec CA-TECH

### Canvas noir pur

**Moxie :** `#000000` mandatoire  
**CA-TECH :** Interdit

**Pourquoi rejeté :** Instruction explicite dans le brief. Le noir pur "too much" pour un cabinet tech — il penche trop vers l'éditorial créatif.

### Boutons pill 1000px

**Moxie :** Tous les boutons en pill complet  
**CA-TECH :** Radius 4–6px max sur les CTAs

**Pourquoi rejeté :** Le pill button est devenu un marqueur générique des interfaces SaaS/startup 2023–2025. CA-TECH V2 cherche à s'en démarquer. Le radius réduit est plus aligné avec l'esthétique des outils professionnels sérieux (Figma, Linear, Vercel).

### Accent periwinkle `#84acfb`

**Moxie :** `#84acfb` — bleu pervenche doux, légèrement violet  
**CA-TECH :** `#359BD9` — bleu technique franc

**Pourquoi rejeté :** Le periwinkle tire vers le violet doux, une teinte associée aux plateformes de créatifs et aux agences. Le Tech Blue de CA-TECH est plus saturé, plus technique, plus en cohérence avec l'ADN bleu de la marque.

### Text cream `#f4efd4`

**Moxie :** Texte principal en cream warm — chaleur éditoriale  
**CA-TECH :** Cool White `#F2F4F6` et Light Silver `#E0E0E3`

**Pourquoi rejeté :** Le cream `#f4efd4` est très beau mais apporte une chaleur "imprimé" qui ne correspond pas à l'univers technologique de CA-TECH. Les silvers froids sont plus cohérents avec l'identité.

### Logo minimal centré (hamburger left, wordmark center)

**Moxie :** Navigation minimale — hamburger gauche, wordmark centré, pill CTA droite  
**CA-TECH :** Navigation complète — logo + nom gauche, liens centrés, CTA droit

**Pourquoi rejeté :** Moxie est une agence avec un portfolio comme produit principal. CA-TECH est un cabinet multi-expertise avec des catégories de services à naviguer. La navigation complète est fonctionnellement nécessaire.

### Carousel horizontal pour les cas clients

**Moxie :** Horizontal scroll carousel pour les case studies  
**CA-TECH :** Grid asymétrique (1 featured + miniatures)

**Pourquoi rejeté :** Le carousel horizontal cache du contenu et est problématique pour les utilisateurs au clavier et sur mobile. La grid asymétrique montre plus de projets au premier regard.

---

## 4. SYNTHÈSE — Transformation de la référence en identité CA-TECH

| Principe Moxie | Interprétation CA-TECH |
|---------------|------------------------|
| Fond noir éditorial | Fond Navy profond technique |
| Accent chromatique unique | Tech Blue unique |
| Serif 300 headline | Conservé identiquement |
| Zéro ombre | Conservé identiquement |
| Rythme vertical généreux | Conservé identiquement |
| Italic accent phrase | Conservé — couleur adaptée |
| Pill buttons | Remplacé par radius technique |
| Warm cream text | Remplacé par cool silvers |
| Navigation minimale | Remplacé par nav structurée |
| Carousel case studies | Remplacé par grid asymétrique |

**En résumé :** CA-TECH emprunte à Moxie sa **philosophie typographique**, son **économie chromatique**, et son **sens du rythme**. Il rejette ses choix esthétiques spécifiques au monde créatif/PR pour les adapter à un registre technique français.

Le résultat est un design qui vient du même esprit — sobre, précis, éditorial — mais qui parle avec une voix différente : non plus la chaleur d'une agence créative new-yorkaise, mais la rigueur d'un cabinet technologique français.
