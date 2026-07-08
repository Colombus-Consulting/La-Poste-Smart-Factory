# Prompt — Maquette (Look & Feel) du tableau de bord « Adéquation Charge / Ressource » — La Poste Smart Factory

> À coller tel quel dans Claude Code ou Lovable. Tu peux ajuster les chiffres et les libellés en gras `[entre crochets]`.

---

## 1. Rôle et objectif

Tu es un développeur front-end senior spécialisé dans les tableaux de bord d'aide à la décision. Génère une **application web mono-page** (React + Tailwind CSS) qui présente une **maquette interactive (look & feel)** d'un tableau de bord opérationnel.

Contraintes non négociables :
- **Toutes les données sont fictives mais réalistes, codées en dur** (aucun backend, aucune API, aucune base de données, aucun login).
- L'écran doit être **immédiatement compréhensible par des utilisateurs qui n'ont aucune culture data ni informatique** : gros chiffres, code couleur évident, libellés en français simple, infobulles explicatives sur chaque terme technique.
- **Objectif d'expérience** : en 5 secondes, un chef d'établissement doit voir *où ça coince* et *quoi réallouer*.

---

## 2. Contexte métier (à comprendre — ne pas afficher tel quel)

La Poste cherche à mieux ajuster la **charge de travail** (volume d'objets à distribuer) aux **ressources** (agents/facteurs disponibles) sur ses plateformes de distribution en Bretagne. Aujourd'hui, **10 à 25 % du temps agent n'est pas utilisé**, ce qui représente un fort manque à gagner. Le tableau de bord doit rendre visible, jour par jour, la **sous-charge** (agent sous-occupé → réaffectable ailleurs) et la **surcharge** (besoin de renfort), puis proposer une **réallocation** des ressources entre sites.

---

## 3. Unité centrale : l'EOR (Équivalent Objet de Référence)

Tous les objets sont convertis dans une unité commune, l'**EOR**, via une **matrice de transfert** (temps de traitement relatif). Coefficients illustratifs (à rendre visibles dans une infobulle et idéalement modifiables) :

| Type d'objet | Flux | Coefficient EOR |
|---|---|---|
| Courrier / lettre | PIC | 1 (référence) |
| Imprimé publicitaire | PIC | 0,5 |
| Presse / journal | PIC | 1,5 |
| Recommandé (signature) | PIC | 3 |
| Colis | PFC | 5 |

Deux flux d'objets : **PIC** (courrier, presse, recommandé, imprimés pub) et **PFC** (colis).

---

## 4. Hiérarchie de données — drill-down à 3 niveaux

**Établissement → Sites → Tournées**

- Un **établissement** regroupe plusieurs **sites** ; les agents y sont **interchangeables** (= consolidation, le levier de réallocation).
- Un **site** regroupe plusieurs **tournées**.
- Une **tournée = 1 agent**, avec une **capacité max** (ex. `800 EOR`).

À chaque niveau, l'utilisateur peut basculer l'affichage :
- en **nombre d'objets** OU en **EOR** (bascule),
- entre **Référence (prévu)** et **Réel** (bascule).

**Vue détail d'une tournée** (demandée explicitement) : un petit tableau croisant, pour chaque type d'objet, les 4 valeurs → Objets Réf / Objets Réel / EOR Réf / EOR Réel.

---

## 5. Dimension temporelle et fiabilité

Sélecteur d'horizon : **J / J+1 / J+2**. Afficher un **badge de fiabilité** qui change selon l'horizon (les prévisions se fiabilisent en approchant du jour J) :
- **J (jour même, H-2)** → fiabilité **100 %** (badge vert)
- **J+1 (24 h)** → fiabilité **~90 %** (badge vert clair)
- **J+2 (48 h)** → fiabilité **~60 %** sur PIC / **75-85 %** sur le prévisionnel colis-courrier (badge orange)

---

## 6. Structure de l'écran (tout tient sur un seul écran, plusieurs volets)

**A. Barre latérale gauche (fond sombre)** — navigation :
`Vue globale` · `Par site` · `Par tournée` · `Consolidation` · `Matrice EOR` · `Méthodologie`
En bas de la sidebar : le sélecteur d'horizon **J / J+1 / J+2**.

**B. En-tête** : titre `Adéquation Charge / Ressource — PPDC Bretagne-Sud`, sous-titre `Pilotage quotidien de la distribution`, badge de fiabilité (selon horizon), date du jour.

**C. Bandeau de filtres** (une ligne, boutons/toggles très visibles) :
- Unité : **Objets ⇄ EOR**
- Données : **Référence ⇄ Réel**
- Établissement / Site / Tournée (menus déroulants en cascade)
- Flux : **Tous / PIC / PFC**

**D. Rangée de cartes KPI** (style « cartes » avec icône, gros chiffre, delta coloré vs objectif) :
1. **Taux d'utilisation global** (%) — avec une jauge
2. **Charge totale** (EOR)
3. **Capacité totale** (EOR)
4. **Tournées en surcharge** (nb) — rouge
5. **Tournées en sous-charge** (nb) — orange
6. **Manque à gagner** (EOR non utilisés + équivalent en ETP)

**E. Volet principal — tableau / heatmap repliable par site.** Pour chaque site puis chaque tournée : nom, charge (EOR), capacité (EOR), **barre de progression colorée du taux d'utilisation**, pastille de statut, écart chiffré. Cliquer sur une tournée ouvre sa **vue détail** (§4).

**F. Volet Consolidation (le volet clé pour la décision).** Au sein de l'établissement : total **excédent** (EOR libres cumulés des tournées sous-chargées) vs total **déficit** (EOR en surcharge cumulés), et une liste de **suggestions de réallocation** formulées en langage clair, ex. :
> « Déplacer **320 EOR** de **Quimper** (excédent) vers **Lorient** (déficit) → +2 tournées équilibrées. »

**G. Volet Répartition** : mini-graphes — répartition des objets **par type** et **par flux PIC vs PFC** (donut + barres).

---

## 7. Code couleur du statut (sémantique, à appliquer partout)

- 🟢 **Optimal** : taux d'utilisation **85–100 %**
- 🟠 **Sous-charge** : **< 85 %** → temps libre réaffectable
- 🔴 **Surcharge** : **> 100 %** → besoin de renfort / redistribution

---

## 8. Données fictives à générer (cohérentes)

- **Établissement** : `PPDC Bretagne-Sud`
- **3 sites (périmètre PoC)** : `Quimper` (12 tournées), `Lorient` (10 tournées), `Vannes` (8 tournées) → **30 tournées / 30 agents**.
- **Capacité de référence par tournée** : `800 EOR`.
- **Charge réelle** répartie pour créer un mix parlant : ~40 % des tournées en sous-charge (500-700 EOR), ~45 % optimal (700-800), ~15 % en surcharge (810-920). Ainsi le volet Consolidation a du sens (excédent global côté Quimper, déficit côté Lorient par ex.).
- Générer un léger écart **Référence vs Réel** (le réel diverge de 5-15 % du prévu) pour montrer l'intérêt de la donnée fraîche.
- Générer un **mix d'objets** cohérent par tournée (beaucoup de courrier + imprimés pub, moins de colis mais lourds en EOR), et faire varier selon le jour de semaine (moins de courrier en fin de semaine, surtout le samedi).

---

## 9. Direction artistique

Style de référence : dashboard corporate sobre et haut de gamme — **barre latérale sombre à gauche**, zone principale claire, **cartes KPI** avec icône + gros chiffre + delta coloré, **mini-graphes** (barres, donut, jauges/anneaux de progression), typographie sans-serif nette, beaucoup d'espace blanc. Palette de base neutre (gris/anthracite/blanc) + **couleurs sémantiques** vert/orange/rouge réservées au statut de charge. Accent discret possible : **jaune La Poste** en touche de branding. Icônes via `lucide-react`, graphes via `recharts`. **L'ensemble tient sur un écran desktop (~1440 px) sans scroll vertical** ; rester responsive.

**Accessibilité pédagogique** : chaque terme technique (EOR, charge, capacité, consolidation, référence/réel) porte une **infobulle** avec une phrase d'explication simple. Aucun acronyme laissé sans définition.

---

## 10. Stack technique

- React (un seul composant / fichier principal) + Tailwind CSS.
- `recharts` pour les graphes, `lucide-react` pour les icônes.
- **Toutes les données mockées dans un objet JavaScript en haut du fichier**, facilement éditable.
- Interactions gérées en state React (bascules, filtres, drill-down, sélection d'horizon).

## 11. À NE PAS faire

- Pas de login / inscription, pas d'appel réseau, pas de backend ni de base de données.
- Pas de page de réglages complexe : tout se pilote depuis l'écran unique.
- Pas de jargon non expliqué. Pas de tableau brut sans code couleur.
