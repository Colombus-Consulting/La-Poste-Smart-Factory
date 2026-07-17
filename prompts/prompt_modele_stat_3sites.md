# Complément au prompt V5 — Modèle statistique + données calibrées (3 sites)

À utiliser **après** (ou avec) le prompt V5. Ce complément fournit (1) le modèle statistique à
implémenter pour générer la charge, et (2) les **données calibrées des 3 sites**, prêtes à coller.
Il **remplace** l'ancien générateur par buckets et l'ancienne `CAPACITE_REF = 800` uniforme.

## A. Modèle statistique de génération de la charge

La charge (EOR) d'une tournée pour un horizon donné est une **variable aléatoire** tirée d'une loi
**log-normale** paramétrée par la moyenne et l'écart-type fournis par tournée (calibrés sur données
réelles Montfort ; CV ≈ 45 %, distribution asymétrique à droite → la log-normale est le bon choix).

Pour une tournée de paramètres `moyenne` (μ) et `ecartType` (σ) :

```
sigmaLog = Math.sqrt(Math.log(1 + (σ/μ)**2))
muLog    = Math.log(μ) - sigmaLog**2 / 2
z        = boxMuller(rng)              // N(0,1) via 2 tirages uniformes du PRNG existant
charge   = clamp(Math.exp(muLog + sigmaLog * z), min, max)
```

Contraintes d'implémentation :
- **Déterminisme** (obligatoire, cf. contraintes projet) : réutilise le PRNG maison existant
  (xmur3 + mulberry32). Seed = hash de la chaîne `${site}|${tourneeId}|${horizon}` (ajoute le
  décalage de jour si tu veux faire varier J/J+1/J+2). Les données restent stables au sein d'une
  session, pas de `Math.random()`.
- `boxMuller(rng)` : `Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2)` avec u1,u2 tirés du PRNG.
- **Capacité** : fixe par agent, lue depuis la config (ne plus utiliser 800 uniforme).
- **Taux d'utilisation = charge / capacité**, statut selon les seuils existants (sous <85 %,
  optimal 85-100 %, surcharge >100 %).
- **Renfort** (`charge: null`) : pas de tirage de charge propre. Quand la case est décochée (cf.
  V5), on répartit son `volumeRedistribuable` sur toutes les autres tournées du site selon
  `cleRenfort`.
- **Sécable** : tirage normal ; quand décochée, on répartit sa charge sur `voisinage` selon
  `cleSecable` (ou le mode manuel de V5).
- **Conserver** la logique samedi (agents divisés par 2) et le comportement horizon/fiabilité
  existants. Les données sources étant hebdomadaires, n'invente pas d'autre effet jour-de-semaine.

## B. Données calibrées — coller dans `src/data/mockData.js`

- **Montfort** : valeurs **réelles** (53 semaines de 2025). 17 tournées + 1 renfort (T14).
- **Guichen / Messac** : **fictifs** mais proches de Montfort, avec **variabilité inter-agents**
  (capacités et charges différentes d'un agent à l'autre), 18 agents chacun. Profils calibrés pour
  que la Consolidation ait du sens : Guichen **donneur** (~79 %), Messac **receveur** (~117 %),
  Montfort **receveur** (~102 %).
- Chaque site : 18 agents = 17 tournées (dont 1 sécable) + 1 renfort. Les valeurs `PROVISOIRE`
  (clés de répartition, voisinage, volume redistribuable du renfort) seront remplacées par les
  vraies la semaine prochaine.

```javascript
export const SITES_CONFIG = {
  'Montfort': [ // RÉEL — calibré sur 53 semaines 2025
    { id: 'T1', type: 'normale', capacite: 203.1, charge: { moyenne: 209.3, ecartType: 54.1, min: 100.1, max: 306.3 } },
    { id: 'T2', type: 'normale', capacite: 585.0, charge: { moyenne: 544.2, ecartType: 236.6, min: 171.8, max: 1199.3 } },
    { id: 'T3', type: 'normale', capacite: 770.4, charge: { moyenne: 796.8, ecartType: 355.1, min: 245.2, max: 1794.2 } },
    { id: 'T4', type: 'normale', capacite: 962.4, charge: { moyenne: 995.0, ecartType: 474.3, min: 262.9, max: 2340.9 } },
    { id: 'T5', type: 'normale', capacite: 764.2, charge: { moyenne: 767.7, ecartType: 339.3, min: 238.9, max: 1716.9 } },
    { id: 'T6', type: 'normale', capacite: 807.2, charge: { moyenne: 790.2, ecartType: 363.8, min: 223.5, max: 1813.0 } },
    { id: 'T7', type: 'normale', capacite: 534.5, charge: { moyenne: 780.6, ecartType: 357.4, min: 244.4, max: 1808.8 } },
    { id: 'T8', type: 'secable', capacite: 639.8, charge: { moyenne: 967.6, ecartType: 486.5, min: 243.6, max: 2385.6 }, voisinage: ["T6", "T7", "T9", "T10"] /* PROVISOIRE i±2 */, cleSecable: 'uniforme' /* PROVISOIRE */ },
    { id: 'T9', type: 'normale', capacite: 887.0, charge: { moyenne: 812.0, ecartType: 347.2, min: 263.4, max: 1768.5 } },
    { id: 'T10', type: 'normale', capacite: 884.9, charge: { moyenne: 821.4, ecartType: 365.2, min: 247.4, max: 1836.9 } },
    { id: 'T11', type: 'normale', capacite: 778.6, charge: { moyenne: 754.5, ecartType: 324.9, min: 244.8, max: 1655.8 } },
    { id: 'T12', type: 'normale', capacite: 696.8, charge: { moyenne: 660.4, ecartType: 294.5, min: 198.6, max: 1481.4 } },
    { id: 'T13', type: 'normale', capacite: 806.7, charge: { moyenne: 805.2, ecartType: 380.0, min: 216.9, max: 1879.0 } },
    { id: 'T14', type: 'renfort', capacite: 0, charge: null, volumeRedistribuable: 800 /* PROVISOIRE */, cleRenfort: 'uniforme' /* PROVISOIRE */ },
    { id: 'T15', type: 'normale', capacite: 783.3, charge: { moyenne: 792.6, ecartType: 348.5, min: 250.1, max: 1767.3 } },
    { id: 'T16', type: 'normale', capacite: 825.3, charge: { moyenne: 830.1, ecartType: 377.7, min: 243.0, max: 1892.3 } },
    { id: 'T17', type: 'normale', capacite: 871.4, charge: { moyenne: 836.3, ecartType: 363.6, min: 266.0, max: 1846.2 } },
    { id: 'T18', type: 'normale', capacite: 726.7, charge: { moyenne: 682.8, ecartType: 307.8, min: 200.3, max: 1541.7 } },
  ],
  'Guichen': [ // FICTIF — profil DONNEUR (~79%)
    { id: 'GCH-01', type: 'normale', capacite: 268.3, charge: { moyenne: 190.6, ecartType: 85.8, min: 57.2, max: 438.4 } },
    { id: 'GCH-02', type: 'normale', capacite: 831.3, charge: { moyenne: 572.6, ecartType: 257.7, min: 171.8, max: 1317.0 } },
    { id: 'GCH-03', type: 'normale', capacite: 994.9, charge: { moyenne: 798.2, ecartType: 359.2, min: 239.5, max: 1835.9 } },
    { id: 'GCH-04', type: 'normale', capacite: 1179.7, charge: { moyenne: 911.4, ecartType: 410.1, min: 273.4, max: 2096.2 } },
    { id: 'GCH-05', type: 'normale', capacite: 951.4, charge: { moyenne: 773.3, ecartType: 348.0, min: 232.0, max: 1778.6 } },
    { id: 'GCH-06', type: 'normale', capacite: 989.0, charge: { moyenne: 838.7, ecartType: 377.4, min: 251.6, max: 1929.0 } },
    { id: 'GCH-07', type: 'normale', capacite: 635.1, charge: { moyenne: 710.7, ecartType: 319.8, min: 213.2, max: 1634.6 } },
    { id: 'GCH-08', type: 'secable', capacite: 763.3, charge: { moyenne: 989.2, ecartType: 445.1, min: 296.8, max: 2275.2 }, voisinage: ["GCH-06", "GCH-07", "GCH-09", "GCH-10"] /* PROVISOIRE i±2 */, cleSecable: 'uniforme' /* PROVISOIRE */ },
    { id: 'GCH-09', type: 'normale', capacite: 1122.3, charge: { moyenne: 783.2, ecartType: 352.4, min: 235.0, max: 1801.4 } },
    { id: 'GCH-10', type: 'normale', capacite: 1110.3, charge: { moyenne: 818.7, ecartType: 368.4, min: 245.6, max: 1883.0 } },
    { id: 'GCH-11', type: 'normale', capacite: 992.7, charge: { moyenne: 689.2, ecartType: 310.1, min: 206.8, max: 1585.2 } },
    { id: 'GCH-12', type: 'normale', capacite: 893.2, charge: { moyenne: 615.5, ecartType: 277.0, min: 184.6, max: 1415.6 } },
    { id: 'GCH-13', type: 'normale', capacite: 967.1, charge: { moyenne: 831.6, ecartType: 374.2, min: 249.5, max: 1912.7 } },
    { id: 'GCH-14', type: 'renfort', capacite: 0, charge: null, volumeRedistribuable: 800 /* PROVISOIRE */, cleRenfort: 'uniforme' /* PROVISOIRE */ },
    { id: 'GCH-15', type: 'normale', capacite: 1055.0, charge: { moyenne: 794.2, ecartType: 357.4, min: 238.3, max: 1826.7 } },
    { id: 'GCH-16', type: 'normale', capacite: 1155.0, charge: { moyenne: 788.2, ecartType: 354.7, min: 236.5, max: 1812.9 } },
    { id: 'GCH-17', type: 'normale', capacite: 1105.5, charge: { moyenne: 798.7, ecartType: 359.4, min: 239.6, max: 1837.0 } },
    { id: 'GCH-18', type: 'normale', capacite: 926.7, charge: { moyenne: 684.7, ecartType: 308.1, min: 205.4, max: 1574.8 } },
  ],
  'Messac': [ // FICTIF — profil RECEVEUR (~117%)
    { id: 'MSC-01', type: 'normale', capacite: 192.4, charge: { moyenne: 219.7, ecartType: 98.9, min: 65.9, max: 505.3 } },
    { id: 'MSC-02', type: 'normale', capacite: 517.0, charge: { moyenne: 521.6, ecartType: 234.7, min: 156.5, max: 1199.7 } },
    { id: 'MSC-03', type: 'normale', capacite: 717.9, charge: { moyenne: 889.0, ecartType: 400.0, min: 266.7, max: 2044.7 } },
    { id: 'MSC-04', type: 'normale', capacite: 853.6, charge: { moyenne: 1086.1, ecartType: 488.7, min: 325.8, max: 2498.0 } },
    { id: 'MSC-05', type: 'normale', capacite: 624.0, charge: { moyenne: 787.4, ecartType: 354.3, min: 236.2, max: 1811.0 } },
    { id: 'MSC-06', type: 'normale', capacite: 683.1, charge: { moyenne: 805.1, ecartType: 362.3, min: 241.5, max: 1851.7 } },
    { id: 'MSC-07', type: 'normale', capacite: 491.8, charge: { moyenne: 852.9, ecartType: 383.8, min: 255.9, max: 1961.7 } },
    { id: 'MSC-08', type: 'secable', capacite: 578.5, charge: { moyenne: 1059.8, ecartType: 476.9, min: 317.9, max: 2437.5 }, voisinage: ["MSC-06", "MSC-07", "MSC-09", "MSC-10"] /* PROVISOIRE i±2 */, cleSecable: 'uniforme' /* PROVISOIRE */ },
    { id: 'MSC-09', type: 'normale', capacite: 770.6, charge: { moyenne: 766.7, ecartType: 345.0, min: 230.0, max: 1763.4 } },
    { id: 'MSC-10', type: 'normale', capacite: 790.8, charge: { moyenne: 873.9, ecartType: 393.3, min: 262.2, max: 2010.0 } },
    { id: 'MSC-11', type: 'normale', capacite: 729.9, charge: { moyenne: 698.3, ecartType: 314.2, min: 209.5, max: 1606.1 } },
    { id: 'MSC-12', type: 'normale', capacite: 595.6, charge: { moyenne: 640.5, ecartType: 288.2, min: 192.2, max: 1473.1 } },
    { id: 'MSC-13', type: 'normale', capacite: 721.9, charge: { moyenne: 880.7, ecartType: 396.3, min: 264.2, max: 2025.6 } },
    { id: 'MSC-14', type: 'renfort', capacite: 0, charge: null, volumeRedistribuable: 800 /* PROVISOIRE */, cleRenfort: 'uniforme' /* PROVISOIRE */ },
    { id: 'MSC-15', type: 'normale', capacite: 672.7, charge: { moyenne: 735.0, ecartType: 330.8, min: 220.5, max: 1690.5 } },
    { id: 'MSC-16', type: 'normale', capacite: 801.9, charge: { moyenne: 909.2, ecartType: 409.1, min: 272.8, max: 2091.2 } },
    { id: 'MSC-17', type: 'normale', capacite: 826.7, charge: { moyenne: 774.3, ecartType: 348.4, min: 232.3, max: 1780.9 } },
    { id: 'MSC-18', type: 'normale', capacite: 622.7, charge: { moyenne: 651.4, ecartType: 293.1, min: 195.4, max: 1498.2 } },
  ],
};
```

## C. Câblage
- Le générateur boucle sur `SITES_CONFIG[site]` et, pour chaque tournée non-renfort, tire la charge
  via le modèle A. Les KPI, tableaux, statuts, consolidation et la vue admin multi-sites consomment
  ces valeurs.
- La **capacité par agent** vient de `capacite` (remplace `CAPACITE_REF`). Le tri/affichage par
  tournée et la modale de détail restent inchangés côté structure.
- Types `normale` / `renfort` / `secable` : voir V5 pour les cases à cocher et la redistribution.

## D. À savoir / points ouverts
- **Portée** : seul Montfort est réel. Si tu présentes au client, assume-le (Guichen/Messac =
  illustratifs, calibrés sur le profil Montfort).
- **Renfort** : `volumeRedistribuable: 800` est un **placeholder** — T14 n'a pas de série de charge
  (agent flottant), donc la charge qu'il absorbe et la clé de répartition sont à fournir.
- **Ne pas réutiliser** les colonnes résumé (Moyenne/Écartype/Min/Max) du fichier source : elles
  sont incohérentes (Min > Max). Les stats ici sont recalculées sur les 53 valeurs hebdomadaires.

## E. Définition de « terminé »
- [ ] Générateur log-normal déterministe par tournée (μ/σ de la config), plus de buckets.
- [ ] Capacité par agent issue de la config, taux = charge / capacité.
- [ ] 3 sites × 18 agents, profils donneur/receveur visibles dans la Consolidation.
- [ ] Renfort (T14 & équivalents) et sécable (T8 & équivalents) branchés sur les cases V5.
- [ ] Déterminisme respecté (F5 stable, pas de Math.random), build OK avant push.
