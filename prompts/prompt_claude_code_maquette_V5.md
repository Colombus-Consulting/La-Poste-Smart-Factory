# Évolution V5 de la maquette « Adéquation Charge / Ressource » (La Poste Smart Factory)

Tu vas faire évoluer une maquette React/Vite existante. **Commence par relire le fichier
`etat-des-lieux-maquette.md` (fourni) et le code actuel** (`src/App.jsx`, `src/data/mockData.js`,
`src/components/*`) avant toute modification. Respecte toute la structure et les composants
existants : tu ajoutes et modifies, tu ne réécris pas ce qui marche.

## Contraintes non négociables (rappel, toujours vraies)
- Données **fictives, codées en dur, générées de façon déterministe** (PRNG maison existant, pas de
  `Math.random()`). Aucun backend, aucune API, aucun login, aucune persistance (un F5 réinitialise).
- Écran compréhensible par des **non-initiés** : gros chiffres, code couleur, **infobulle
  (`InfoTip`) sur chaque nouveau terme** (renfort, sécable, clé de répartition, capacité agent…).
- Toute nouvelle valeur métier (clés, capacités, voisinages, types de tournées) doit être une
  **constante centralisée dans `src/data/mockData.js`**, pas une valeur en dur éparpillée dans les
  composants, et **éditable depuis l'onglet Paramètres** (voir Feature 4). Objectif : pouvoir
  remplacer les valeurs provisoires par les vraies en un seul endroit.

## ⚠ Réactivation de périmètre
Le §11 de l'état des lieux marque **Renfort et Sécable comme différés / hors scope**. **Ce n'est
plus le cas : ils sont désormais dans le périmètre**, spécifiés ci-dessous (Feature 2). Ignore la
mention « ne pas réintroduire » pour ces deux concepts uniquement.

---

## Feature 1 — Affiner les vues par rôle

Le rôle (`role` dans `App.jsx` : `'admin'` ou id de site) existe déjà. Ajustements :

1. **Non-admin (directeur de site)** : le sélecteur de site ne doit plus apparaître **du tout** dans
   `FilterBar` — pas même grisé/désactivé comme aujourd'hui. À la place, afficher simplement le
   **nom du site en libellé statique**. L'utilisateur ne voit que son site, point.
2. **Admin (directeur d'établissement)** : peut soit sélectionner **un site à la fois** (sélecteur
   présent), soit consulter le **tableau de bord multi-sites**.
3. **Vue Admin multi-sites** : renforcer la vue destinée au directeur d'établissement pour qu'elle
   présente, **pour l'intégralité des sites en une fois**, un récapitulatif par site à l'horizon
   **H-24 (J+1) par défaut** : par site → taux d'utilisation, charge EOR, capacité EOR, nb tournées
   en surcharge / sous-charge, le tout comparables côte à côte (cartes ou tableau synthétique). Le
   sélecteur d'horizon reste disponible, mais cette vue s'ouvre sur J+1. Conserver l'accès au détail
   repliable par site en dessous.

---

## Feature 2 — Trois types de tournées + scénarios « décochage »

Ajouter à chaque tournée un champ **`type` ∈ { `normale`, `renfort`, `secable` }** (constante
centralisée : quelles tournées sont renfort/sécable par site — voir bloc CONFIG plus bas). Afficher
un **badge de type** distinct sur chaque ligne de tournée (dans `SitesTable` et `TourneeListView`).

**Distinction structurante à respecter :** la redistribution renfort/sécable est **intra-site, à la
maille tournée, en EOR** (on absorbe les objets d'une tournée sur d'autres tournées du même site).
Elle est **différente** de la consolidation existante (inter-sites, à la maille agent). Ne pas
mélanger les deux logiques.

### 2.a Tournées normales
Comportement actuel inchangé (sous-charge / optimal / surcharge selon le taux d'utilisation).

### 2.b Tournée Renfort (une seule par site, active par défaut)
- Ajouter une **case à cocher « Tournée renfort active »** sur la ligne de la tournée renfort
  (cochée par défaut). État dans `App.jsx`, par site.
- **Si décochée** : la charge (EOR + objets) de la tournée renfort est **redistribuée sur TOUTES les
  autres tournées du site**, y compris celles déjà en surcharge, selon une **clé de répartition
  fixe** (`CLE_RENFORT`, un poids par tournée réceptrice, somme = 100 %). Recalculer en direct la
  charge, le taux d'utilisation et le statut de chaque tournée impactée, et la tournée renfort
  passe à 0 / masquée.
- **But analytique** : visualiser l'impact de la suppression du renfort, **même si cela aggrave une
  surcharge existante**. Rendre l'effet lisible : afficher sur chaque tournée réceptrice
  l'incrément reçu (ex. `+45 EOR`) et le changement de statut éventuel.
- Cocher à nouveau restaure l'état initial.

### 2.c Tournée Sécable (divisible, active par défaut)
- Ajouter une **case à cocher « Tournée sécable active »** sur la/les ligne(s) sécable (cochée par
  défaut).
- **Si décochée — mode automatique** : la charge de la tournée sécable est redistribuée non pas sur
  tout le site mais sur un **sous-ensemble de tournées voisines** défini par tournée
  (`SECABLE_VOISINAGE`, ex. tournée 8 → {6, 7, 9, 10}), selon une **clé** (`CLE_SECABLE`, poids par
  voisine). Même recalcul en direct et même affichage des incréments que pour le renfort.
- **Mode manuel (option supplémentaire)** : permettre à l'utilisateur, quand la sécable est
  décochée, de **choisir lui-même les tournées réceptrices et la charge/part affectée à chacune**
  (petit panneau inline : liste des tournées du site avec un champ de part ou d'EOR par tournée, la
  somme devant couvrir 100 % de la charge sécable). Ce mode manuel prime sur la clé automatique
  quand il est utilisé.

### 2.d Récapitulatif du mécanisme (à garder en tête)
On veut voir **l'effet du décochage** : renfort → réparti sur **toutes** les tournées du site ;
sécable → réparti sur des **tournées données** (voisinage ou choix manuel), selon des clés. Les
recalculs sont live et visibles.

---

## Feature 3 — Capacité EOR par agent (matrice RH)

Aujourd'hui la capacité est uniforme (`CAPACITE_REF = 800`). La rendre **paramétrable par
agent/tournée** :
- Introduire `CAPACITE_AGENT` : une capacité EOR par tournée/agent (valeur par défaut 800, mais
  **surchargeable par agent** — les vraies valeurs, fixes, seront fournies ultérieurement).
- Remplacer partout l'usage du 800 uniforme par cette capacité par agent : **taux d'utilisation =
  charge EOR de la tournée ÷ capacité de son agent**. Répercuter sur KPI, tableaux, statuts,
  consolidation.

---

## Feature 4 — Onglet « Paramètres » (engrenage), discret et central

Créer une nouvelle entrée de navigation **« Paramètres »** avec une **icône engrenage**
(`lucide-react`), pensée pour ne pas surcharger l'UI principale. Elle regroupe, en sous-sections
claires et éditables en direct (chaque modification recalcule toute l'app, comme le fait déjà la
Matrice EOR), avec une infobulle explicative par section :
1. **Matrice EOR** — coefficients par type d'objet (réutiliser la table éditable existante ; tu peux
   replier l'entrée de nav « Matrice EOR » actuelle dans cet onglet pour éviter le doublon).
2. **Matrice RH** — capacité EOR par agent (Feature 3).
3. **Clés de répartition** — `CLE_RENFORT` (par site) et `CLE_SECABLE` (par tournée sécable).
4. **Tournées sécables & voisinage** — quelles tournées sont sécables et leur `SECABLE_VOISINAGE`.

Priorité : que ce soit **compréhensible par un non-initié** (libellés en français simple, valeurs en
%, bouton « Réinitialiser les valeurs par défaut » comme sur la Matrice EOR).

---

## Bloc CONFIG — valeurs PROVISOIRES à centraliser dans `mockData.js`

Toutes ces valeurs sont **provisoires** et seront remplacées par les vraies la semaine prochaine.
Mets-les dans des constantes bien nommées, commentées `// PROVISOIRE — à remplacer`, éditables via
l'onglet Paramètres :

- **Types de tournées** : désigner **1 tournée renfort par site** et **1 à 2 tournées sécables par
  site** (au choix, ex. une tournée en milieu de liste pour que le voisinage ait du sens).
- **`CLE_RENFORT`** (provisoire) : répartition **uniforme** sur les autres tournées du site
  (1/(n−1) chacune). À remplacer par la vraie clé fournie.
- **`SECABLE_VOISINAGE`** (provisoire) : pour une tournée d'indice *i*, voisines = {*i−2, i−1, i+1,
  i+2*} présentes dans le site (reproduit l'exemple « 8 → 6,7,9,10 »).
- **`CLE_SECABLE`** (provisoire) : répartition **uniforme** sur les voisines.
- **`CAPACITE_AGENT`** (provisoire) : 800 pour tous, surchargeable par agent.
- Les **paramètres de charge par tournée** (moyenne / variance / effet jour de semaine) resteront
  pilotés par la logique de génération actuelle pour l'instant ; ils seront calibrés sur données
  réelles et injectés via ces constantes — donc structure la génération pour lire une éventuelle
  table de paramètres par tournée si elle existe, sinon retomber sur le comportement actuel.

---

## Définition de « terminé » (à vérifier avant de pousser)
- [ ] Non-admin : plus aucun sélecteur de site (libellé statique du site à la place).
- [ ] Admin : vue multi-sites récapitulative par site à J+1 par défaut + sélection d'un site possible.
- [ ] Chaque tournée porte un badge de type (normale / renfort / sécable).
- [ ] Case renfort : décochage → redistribution sur **toutes** les autres tournées du site (clé),
      incréments et statuts recalculés et visibles ; recochage → retour à l'état initial.
- [ ] Case sécable : décochage → redistribution sur le **voisinage** (clé) **ou** choix manuel des
      réceptrices et parts ; recalcul live.
- [ ] Capacité EOR par agent prise en compte partout (taux = charge ÷ capacité agent).
- [ ] Onglet Paramètres (engrenage) éditant EOR, RH, clés, voisinage sécable, avec infobulles.
- [ ] Aucune régression : consolidation inter-sites en agents, logique samedi, horizons/fiabilité,
      absence de persistance, tout reste fonctionnel.
- [ ] Build OK (`npm run build`) avant push sur `main`.
