# État des lieux — Maquette « Adéquation Charge / Ressource » (La Poste Smart Factory)

> Document de contexte à coller dans un prompt Claude Code pour lui donner l'état actuel de la
> maquette avant de lui demander une nouvelle évolution. Rédigé le 17/07/2026.

## 1. Objectif du projet

Maquette interactive (« look & feel », pas un vrai outil de production) d'un tableau de bord
d'aide à la décision pour La Poste : visualiser l'adéquation entre la charge de travail (volume
d'objets à distribuer) et les ressources (agents/facteurs) sur 3 sites de distribution, puis
proposer des réallocations.

**Contraintes non négociables (toujours vraies, à respecter dans toute évolution) :**
- Toutes les données sont **fictives et codées en dur**, générées par un algorithme déterministe
  (aucun backend, aucune API, aucune base de données, aucun login).
- L'écran doit rester compréhensible par des utilisateurs sans culture data (gros chiffres, code
  couleur, infobulles sur chaque terme technique).
- Aucune persistance entre rechargements de page (tout l'état vit en `useState` React, y compris
  les validations de transfert — un `F5` réinitialise tout).

## 2. Stack technique

- React 18 (Vite) + Tailwind CSS.
- `recharts` pour les graphes, `lucide-react` pour les icônes.
- Un seul composant racine `src/App.jsx` qui orchestre tout l'état ; les vues sont des composants
  dans `src/components/`.
- Données mockées et logique de génération dans `src/data/mockData.js`.
- Déployé sur GitHub (`Colombus-Consulting/La-Poste-Smart-Factory`, branche `main`) → Railway
  (redéploiement automatique à chaque push, config dans `railway.json`).

### Arborescence

```
src/
  App.jsx                       — état global, routage des vues, calculs KPI
  data/mockData.js              — génération des données fictives + constantes métier
  components/
    Sidebar.jsx                 — nav + sélecteur de vue (rôle) + sélecteur d'horizon
    Header.jsx                  — titre, badge « Fiabilité des données », badge de vue active
    FilterBar.jsx                — toggle Objets/EOR, dropdowns site/tournée
    KpiCards.jsx                — 6 cartes KPI en haut de la vue globale
    SitesTable.jsx              — tableau repliable par site → tournée (vue « Vue globale »/« Par site »)
    TourneeListView.jsx         — liste à plat de toutes les tournées, triée par taux d'utilisation
    TourneeDetail.jsx           — modale de détail d'une tournée (objets/EOR par type)
    ConsolidationPanel.jsx      — suggestions de transfert d'agents entre sites + validation
    DistributionPanel.jsx       — donut + barres, répartition par type d'objet
    EorMatrixPage.jsx           — table des coefficients EOR, éditable
    DataSourcesPage.jsx         — traçabilité/fiabilité des données par site (statique, fictif)
    MethodologyPage.jsx         — page pédagogique statique
    StatusBadge.jsx             — pastille de statut + barre de progression (réutilisés partout)
    InfoTip.jsx                 — infobulle au survol d'une icône (i)
```

## 3. Modèle de données (`src/data/mockData.js`)

### Constantes

- `ETABLISSEMENT = 'PPDC Bretagne-Sud'`
- `CAPACITE_REF = 800` — capacité EOR d'un agent/tournée pour une journée normale (identique pour
  tous les agents, tous les sites).
- `SITES` : 3 sites fictifs — **Guichen** (12 tournées), **Messac** (10 tournées), **Montfort**
  (8 tournées). Chaque site a un `bucketPlan(nbSous, nbOptimal, nbSurcharge)` qui fixe, à l'avance
  et de façon fixe, combien de ses tournées seront en sous-charge/optimal/surcharge (Guichen
  plutôt excédentaire, Messac plutôt déficitaire, Montfort équilibré) — c'est ce qui donne du sens
  au panneau Consolidation.
- `OBJECT_TYPES` : 5 types d'objets avec leurs **coefficients EOR réels** (fournis par le client,
  à ne pas modifier sans confirmation) :
  | Type | Clé | Coefficient EOR |
  |---|---|---|
  | IP distrib. rép. | `ipDistribRep` | 0,56 |
  | Courrier | `courrier` | 1 |
  | PPI | `ppi` | 2,21 |
  | 3S | `s3` | 2,87 |
  | Colis | `colis` | 5 |

  Chaque type a aussi un `weight` (poids relatif dans le mix, ex. 0,42 pour Courrier, 0,25 pour
  Colis) utilisé uniquement pour la génération du mock — **il n'y a plus aucune notion de flux
  PIC/PFC dans l'app** (retiré suite aux retours client : jugé inutile à afficher).
- `HORIZONS` : `J` (fiabilité 100 %), `J+1` (90 %), `J+2` (70 %) — chaque horizon a un
  `maxDivergence` qui contrôle l'écart aléatoire entre la donnée « Référence » (paramètre interne)
  et la donnée « Réel » (seule affichée).

### Génération (`generateMockData`)

- PRNG maison déterministe (xmur3 + mulberry32) : les données sont stables entre deux rendus, mais
  ne changent pas d'un jour à l'autre au sein d'une session (pas de `Math.random()`).
- Pour chaque tournée, un objectif EOR cible est tiré selon le bucket (sous 500-700 / optimal
  700-800 / surcharge 810-920), puis réparti entre les 5 types d'objets selon leur poids (+ un
  peu de bruit), avec une légère variation selon le jour de la semaine (moins de courrier le
  week-end). Cela donne `objects.ref` (paramètre de répartition) puis `objects.reel` (= ref ±
  divergence aléatoire liée à l'horizon).
- **Important — concept de « Référence » (retour client)** : la Référence est une donnée
  statistique qui sert uniquement de paramètre interne pour générer une répartition réaliste du
  volume par tournée. Ce n'est **pas une donnée utile à afficher** : il n'y a plus de toggle
  Référence/Réel dans l'UI, seul le Réel est montré partout.
- **Samedi (retour client)** : si la date tombée sur un horizon est un samedi, le nombre de
  lignes « tournée » d'un site est **rééchantillonné de moitié** (`resampleBuckets`), simulant
  « deux fois moins d'agents, chacun couvrant 2 tournées ». La capacité par agent reste 800 EOR
  inchangée — c'est le nombre de lignes qui est divisé par 2, ce qui reproduit naturellement
  « moitié moins d'EOR à livrer » sans avoir besoin d'un facteur d'échelle séparé. Les lignes
  samedi sont alors labellisées « Agent 01 », « Agent 02 »… (au lieu de « Tournée ») avec un
  badge « 2 tournées » dans le tableau.
- `computeEor(objects, coefficients)` : somme `count × coefficient` sur les 5 types — utilisée
  partout pour convertir des objets en EOR (les coefficients viennent de l'état React, donc
  éditables en direct depuis la Matrice EOR).

## 4. Structure de navigation (`Sidebar.jsx`)

Barre latérale sombre, de haut en bas :
1. **Sélecteur « Vue »** (dropdown) : `Vue Admin (Établissement)` ou `Vue site — <nom>` pour
   chacun des 3 sites (voir §5).
2. **Navigation** (7 entrées) : Vue globale · Par site · Par tournée · Consolidation ·
   Matrice EOR · Sources de données · Méthodologie.
3. **Sélecteur d'horizon** : J / J+1 / J+2.

## 5. Vues par rôle (retour client — nouveau)

Un responsable de site n'a accès qu'aux données de son propre site ; voir tous les sites et
comparer entre sites n'est possible qu'en **Vue Admin** (directeur d'établissement).

- État `role` dans `App.jsx` : `'admin'` ou un id de site (`'guichen'`, `'messac'`, `'montfort'`).
- Quand `role !== 'admin'` : le filtre site est **verrouillé** sur ce site (dropdown désactivé
  dans `FilterBar`, plus d'option « Tous les sites »), et le panneau Consolidation passe en mode
  lecture seule filtré (voir §8.4).
- Un badge dans le `Header` affiche la vue active (« Vue Admin (Établissement) » ou « Vue site —
  Guichen »).
- La Méthodologie a une section dédiée qui explique cette différence de vue par rôle.
- **Ce n'est pas un vrai contrôle d'accès** : c'est un sélecteur de démonstration, sans
  authentification, purement pour prévisualiser les deux perspectives.

## 6. Horizon et fiabilité (`Header.jsx`)

- Badge « **Fiabilité des données** X % » (renommé suite au retour client — ce ne sont pas des
  données prévisionnelles comparées au réel, mais des données réelles dont le flux n'est pas
  encore remonté à 100 % à J+1/J+2). Vert à J (100 %), vert clair à J+1 (90 %), orange à J+2
  (70 %).
- La date affichée correspond à `aujourd'hui + offset horizon`.

## 7. Bandeau de filtres (`FilterBar.jsx`)

- Toggle **Unité** : Objets ⇄ EOR (s'applique aux tableaux et graphes).
- Dropdown **Site** (verrouillé si vue non-admin) + dropdown **Tournée** (dépend du site
  sélectionné, liste réellement générée pour l'horizon courant — donc correcte même le samedi où
  le nombre de tournées est réduit).
- Il n'y a **plus** de toggle Référence/Réel ni de toggle Flux (PIC/PFC) — retirés suite aux
  retours client, jugés inutiles/trompeurs à afficher.
- Non affiché sur les vues Matrice EOR, Sources de données et Méthodologie.

## 8. Détail des vues

### 8.1 Vue globale (`view === 'global'`)
KPI cards (voir §9) + `SitesTable` (2/3 de la largeur) + `ConsolidationPanel` (1/3) + en dessous
`DistributionPanel` pleine largeur.

### 8.2 Par site (`view === 'site'`)
KPI cards + `SitesTable` seule, en pleine largeur.

### 8.3 Par tournée (`view === 'tournee'`)
`TourneeListView` : liste à plat de toutes les tournées visibles (tous sites confondus ou un
seul selon le filtre), triée par taux d'utilisation décroissant (surcharge en premier).

### 8.4 Consolidation (`view === 'consolidation'`, ou panneau dans la Vue globale)
**Mécanisme central, entièrement revu suite au retour client** :
- **On ne raisonne jamais en EOR entre sites** — un EOR appartient à un site et ne se redistribue
  pas finement vers un autre. Seul un **agent entier** peut être transféré (rappel :
  1 tournée = 1 agent).
- `aggregateSite(site, coefficients)` calcule, **au niveau du site entier** (pas tournée par
  tournée), la charge totale, la capacité totale et le taux d'utilisation.
- Le déséquilibre **à l'intérieur d'un site** n'est jamais remonté en suggestion : les agents y
  sont déjà interchangeables, donc s'absorbe silencieusement (une tournée en surcharge et une en
  sous-charge sur le même site ne déclenchent rien).
- Une suggestion de transfert n'apparaît que si, **au niveau du site entier**, le taux
  d'utilisation sort de la bande 85-100 % :
  - site < 85 % → donneur, agents libérables = `floor((capacité - charge) / 800)`
  - site > 100 % → receveur, agents manquants = `ceil((charge - capacité) / 800)`
  - appariement glouton donneur→receveur (le plus excédentaire vers le plus déficitaire),
    jamais un site vers lui-même.
- Chaque suggestion a un statut : **`proposé` → `validé` / `rejeté`**, stocké dans
  `App.jsx` (`suggestionStatuses`, clé = `` `${horizon}|${donorId}->${receiverId}` ``, donc
  propre à chaque horizon). Les boutons **Valider / Rejeter** ne sont visibles qu'en **Vue
  Admin**, jamais en vue site (le directeur d'établissement est le seul « modérateur »).
- En vue site, seules les suggestions concernant ce site sont montrées, en lecture seule, sans
  les totaux établissement.
- Messages d'état gérés finement : équilibré (0 dispo / 0 manquant), déficit sans donneur
  disponible, excédent sans receveur en déficit, etc. (bug corrigé en cours de route : un message
  « tout est équilibré » s'affichait à tort quand il y avait un déficit sans donneur).

### 8.5 Matrice EOR (`view === 'matrice'`)
Table des 5 types d'objets avec leur coefficient, **modifiable en direct** (input number, pas de
colonne « Flux » — retirée). Un changement recalcule immédiatement toute la charge EOR affichée
dans toute l'app (KPI, tableaux, consolidation, graphes), puisque les coefficients sont un state
React partagé. Bouton « Réinitialiser les valeurs par défaut ».

### 8.6 Sources de données (`view === 'sources'`, nouveau)
Page statique listant, par site (+ un ligne « Matrice EOR »), un statut (À jour / Donnée
incomplète), une date de dernière mise à jour et une remarque. Exemple fictif imposé par le
client : Guichen n'a pas fourni ses données en mai 2026 (statut « Donnée incomplète », remarque
sur l'estimation de repli appliquée). Objectif : rendre visible la traçabilité/fiabilité des
sources, pas seulement la méthodologie.

### 8.7 Méthodologie (`view === 'methodologie'`)
Page pédagogique statique en 6 encarts : l'EOR comme unité commune, la hiérarchie à 3 niveaux,
la fiabilité des données, le code couleur du statut, la consolidation en agents (pas en EOR), et
la différence de vue selon le rôle (site vs admin).

## 9. Mécanismes transversaux

### KPI cards (`KpiCards.jsx`, en haut de « Vue globale » et « Par site »)
6 cartes : Taux d'utilisation global (jauge + barre), Charge totale (EOR), Capacité totale (EOR),
Tournées en surcharge (nb), Tournées en sous-charge (nb), Manque à gagner (EOR non utilisés +
équivalent ETP). Toujours calculées sur le Réel, sur le périmètre filtré (site/tournée courants).

### Code couleur de statut (partout, `STATUS_META` dans `mockData.js`)
- 🟢 Optimal : 85–100 % d'utilisation
- 🟠 Sous-charge : < 85 %
- 🔴 Surcharge : > 100 %

### Détail d'une tournée (`TourneeDetail.jsx`, modale)
Cliquer sur une ligne tournée (dans `SitesTable` ou `TourneeListView`) ouvre une modale avec un
tableau croisé par type d'objet : **Objets** et **EOR** (2 colonnes seulement — la colonne
« Référence » a été retirée suite au retour client, cf. §3).

### Infobulles (`InfoTip.jsx`)
Chaque terme technique (EOR, fiabilité, consolidation, etc.) porte une icône (i) avec une
explication en langage simple au survol.

## 10. Historique des itérations (contexte des décisions déjà prises)

1. **V1** : maquette initiale conforme au prompt d'origine (Quimper/Lorient/Vannes).
2. **V2** : villes renommées en Guichen/Messac/Montfort.
3. **V3 (retours client #1)** : vrais coefficients EOR, suppression de toute mention PIC/PFC,
   suppression du toggle Référence/Réel (Réel uniquement affiché), badge renommé « Fiabilité des
   données ».
4. **V4 (retours client #2, celle décrite ci-dessus)** : consolidation revue en agents (pas EOR),
   vues par rôle (Vue Admin / vue site), workflow de validation des transferts, logique samedi
   (agents divisés par 2), page Sources de données.

## 11. Explicitement hors scope / différé (ne pas réintroduire sans redemander)

- **Agent « Renfort » et tournée « Sécable »** : concepts réels vus dans le fichier RH client
  (`Données RH consolidées MF_V2.xlsx`, onglet `MFData T`, site Montfort — un agent flottant sans
  tournée fixe, et une tournée dont la charge peut être redécoupée sur d'autres). Le client a
  explicitement choisi de **ne pas les modéliser pour l'instant** (« pas maintenant » lors du
  dernier arbitrage). Une valeur exacte de cet exemple (887,03 EOR, agent 0008 ou 0009 ?) reste à
  clarifier avec le client avant toute implémentation future.
- Pas de login, pas de vrai contrôle d'accès, pas de backend, pas de persistance — ce sont des
  contraintes durables du projet, pas des oublis.
- Pas de vision cible OTT (compteurs d'agents) — en attente d'un retour de la direction de projet
  (Anne-Sophie), statu quo pour l'instant.

## 12. Déploiement

- Repo GitHub : `https://github.com/Colombus-Consulting/La-Poste-Smart-Factory` (branche `main`).
- Railway : redéploiement automatique à chaque push sur `main` (config `railway.json`, build
  Nixpacks, `npm run build` puis `npm run start` qui sert `dist/` via `serve`).
- Aucune variable d'environnement nécessaire.
