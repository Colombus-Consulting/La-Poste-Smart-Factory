// Données 100% fictives ou calibrées, générées de façon déterministe (aucun backend, aucune API).
// Seul Montfort est réel (53 semaines 2025) ; Guichen et Messac sont fictifs mais calibrés sur
// le même profil, avec des moyennes/écarts-types différents pour donner un site donneur et un
// site receveur (voir SITES_CONFIG).

export const ETABLISSEMENT = 'PPDC Bretagne-Sud';

// Capacité nominale de repli (ETP-équivalent, KPI "manque à gagner"). N'est plus la capacité
// uniforme des tournées : chaque agent a sa propre capacité (voir SITES_CONFIG / capacités éditables).
export const CAPACITE_REF = 800;

export const OBJECT_TYPES = [
  { key: 'ipDistribRep', label: 'IP distrib. rép.', coeffDefault: 0.56, weight: 0.16 },
  { key: 'courrier', label: 'Courrier', coeffDefault: 1, weight: 0.42 },
  { key: 'ppi', label: 'PPI', coeffDefault: 2.21, weight: 0.1 },
  { key: 's3', label: '3S', coeffDefault: 2.87, weight: 0.07 },
  { key: 'colis', label: 'Colis', coeffDefault: 5, weight: 0.25 },
];

export const HORIZONS = [
  { key: 'J', label: 'J (jour même)', offset: 0, reliability: 100, badge: 'vert', maxDivergence: 0.05 },
  { key: 'J+1', label: 'J+1 (24 h)', offset: 1, reliability: 90, badge: 'vert-clair', maxDivergence: 0.1 },
  { key: 'J+2', label: 'J+2 (48 h)', offset: 2, reliability: 70, badge: 'orange', maxDivergence: 0.18 },
];

export const SITES = [
  { id: 'guichen', name: 'Guichen', configKey: 'Guichen' },
  { id: 'messac', name: 'Messac', configKey: 'Messac' },
  { id: 'montfort', name: 'Montfort', configKey: 'Montfort' },
];

// --- SITES_CONFIG : données calibrées par agent/tournée -------------------------------------
// Montfort = RÉEL (53 semaines 2025). Guichen/Messac = FICTIFS mais calibrés (variabilité
// inter-agents, profils donneur/receveur pour que la Consolidation ait du sens).
// Toutes les valeurs marquées PROVISOIRE seront remplacées par les vraies ultérieurement ;
// elles sont éditables depuis l'onglet Paramètres.
export const SITES_CONFIG = {
  Montfort: [
    { id: 'T1', type: 'renfort', capacite: 203.1, charge: { moyenne: 209.3, ecartType: 54.1, min: 100.1, max: 306.3 } },
    { id: 'T2', type: 'normale', capacite: 585.0, charge: { moyenne: 544.2, ecartType: 236.6, min: 171.8, max: 1199.3 } },
    { id: 'T3', type: 'normale', capacite: 770.4, charge: { moyenne: 796.8, ecartType: 355.1, min: 245.2, max: 1794.2 } },
    { id: 'T4', type: 'normale', capacite: 962.4, charge: { moyenne: 995.0, ecartType: 474.3, min: 262.9, max: 2340.9 } },
    { id: 'T5', type: 'normale', capacite: 764.2, charge: { moyenne: 767.7, ecartType: 339.3, min: 238.9, max: 1716.9 } },
    { id: 'T6', type: 'normale', capacite: 807.2, charge: { moyenne: 790.2, ecartType: 363.8, min: 223.5, max: 1813.0 } },
    { id: 'T7', type: 'normale', capacite: 534.5, charge: { moyenne: 780.6, ecartType: 357.4, min: 244.4, max: 1808.8 } },
    { id: 'T8', type: 'secable', capacite: 639.8, charge: { moyenne: 967.6, ecartType: 486.5, min: 243.6, max: 2385.6 }, voisinage: ['T6', 'T7', 'T9', 'T10'] },
    { id: 'T9', type: 'normale', capacite: 887.0, charge: { moyenne: 812.0, ecartType: 347.2, min: 263.4, max: 1768.5 } },
    { id: 'T10', type: 'normale', capacite: 884.9, charge: { moyenne: 821.4, ecartType: 365.2, min: 247.4, max: 1836.9 } },
    { id: 'T11', type: 'normale', capacite: 778.6, charge: { moyenne: 754.5, ecartType: 324.9, min: 244.8, max: 1655.8 } },
    { id: 'T12', type: 'normale', capacite: 696.8, charge: { moyenne: 660.4, ecartType: 294.5, min: 198.6, max: 1481.4 } },
    { id: 'T13', type: 'normale', capacite: 806.7, charge: { moyenne: 805.2, ecartType: 380.0, min: 216.9, max: 1879.0 } },
    // T14 : agent normal, sans donnée réelle sur la période de référence (congé probable) —
    // profil estimé à partir de la moyenne de ses voisines T13/T15 (voir Sources de données).
    { id: 'T14', type: 'normale', capacite: 795.0, charge: { moyenne: 798.9, ecartType: 364.3, min: 233.5, max: 1823.2 } },
    { id: 'T15', type: 'normale', capacite: 783.3, charge: { moyenne: 792.6, ecartType: 348.5, min: 250.1, max: 1767.3 } },
    { id: 'T16', type: 'normale', capacite: 825.3, charge: { moyenne: 830.1, ecartType: 377.7, min: 243.0, max: 1892.3 } },
    { id: 'T17', type: 'normale', capacite: 871.4, charge: { moyenne: 836.3, ecartType: 363.6, min: 266.0, max: 1846.2 } },
    { id: 'T18', type: 'normale', capacite: 726.7, charge: { moyenne: 682.8, ecartType: 307.8, min: 200.3, max: 1541.7 } },
  ],
  Guichen: [
    { id: 'GCH-01', type: 'renfort', capacite: 268.3, charge: { moyenne: 190.6, ecartType: 85.8, min: 57.2, max: 438.4 } },
    { id: 'GCH-02', type: 'normale', capacite: 831.3, charge: { moyenne: 572.6, ecartType: 257.7, min: 171.8, max: 1317.0 } },
    { id: 'GCH-03', type: 'normale', capacite: 994.9, charge: { moyenne: 798.2, ecartType: 359.2, min: 239.5, max: 1835.9 } },
    { id: 'GCH-04', type: 'normale', capacite: 1179.7, charge: { moyenne: 911.4, ecartType: 410.1, min: 273.4, max: 2096.2 } },
    { id: 'GCH-05', type: 'normale', capacite: 951.4, charge: { moyenne: 773.3, ecartType: 348.0, min: 232.0, max: 1778.6 } },
    { id: 'GCH-06', type: 'normale', capacite: 989.0, charge: { moyenne: 838.7, ecartType: 377.4, min: 251.6, max: 1929.0 } },
    { id: 'GCH-07', type: 'normale', capacite: 635.1, charge: { moyenne: 710.7, ecartType: 319.8, min: 213.2, max: 1634.6 } },
    { id: 'GCH-08', type: 'secable', capacite: 763.3, charge: { moyenne: 989.2, ecartType: 445.1, min: 296.8, max: 2275.2 }, voisinage: ['GCH-06', 'GCH-07', 'GCH-09', 'GCH-10'] },
    { id: 'GCH-09', type: 'normale', capacite: 1122.3, charge: { moyenne: 783.2, ecartType: 352.4, min: 235.0, max: 1801.4 } },
    { id: 'GCH-10', type: 'normale', capacite: 1110.3, charge: { moyenne: 818.7, ecartType: 368.4, min: 245.6, max: 1883.0 } },
    { id: 'GCH-11', type: 'normale', capacite: 992.7, charge: { moyenne: 689.2, ecartType: 310.1, min: 206.8, max: 1585.2 } },
    { id: 'GCH-12', type: 'normale', capacite: 893.2, charge: { moyenne: 615.5, ecartType: 277.0, min: 184.6, max: 1415.6 } },
    { id: 'GCH-13', type: 'normale', capacite: 967.1, charge: { moyenne: 831.6, ecartType: 374.2, min: 249.5, max: 1912.7 } },
    // GCH-14 : agent normal, profil estimé à partir de la moyenne de ses voisines GCH-13/GCH-15
    // (même logique que Montfort T14 — pas de série réelle disponible ici, fictif calibré).
    { id: 'GCH-14', type: 'normale', capacite: 1011.1, charge: { moyenne: 812.9, ecartType: 365.8, min: 243.9, max: 1869.7 } },
    { id: 'GCH-15', type: 'normale', capacite: 1055.0, charge: { moyenne: 794.2, ecartType: 357.4, min: 238.3, max: 1826.7 } },
    { id: 'GCH-16', type: 'normale', capacite: 1155.0, charge: { moyenne: 788.2, ecartType: 354.7, min: 236.5, max: 1812.9 } },
    { id: 'GCH-17', type: 'normale', capacite: 1105.5, charge: { moyenne: 798.7, ecartType: 359.4, min: 239.6, max: 1837.0 } },
    { id: 'GCH-18', type: 'normale', capacite: 926.7, charge: { moyenne: 684.7, ecartType: 308.1, min: 205.4, max: 1574.8 } },
  ],
  // Messac : RÉEL, transmis par la PIC — répartition des volumes PF, 5 jours (16-22 mars 2026),
  // 9 tournées (PDC1). Moyenne/écart-type/min/max recalculés sur ces 5 valeurs journalières ;
  // capacité = moyenne (pas de valeur de capacité distincte fournie). Pas de renfort dans cet
  // échantillon ; TM0305 désignée sécable (voisinage = les 2 tournées avant/après dans la liste).
  Messac: [
    { id: 'TM0301', type: 'normale', capacite: 410.2, charge: { moyenne: 410.2, ecartType: 88.9, min: 296, max: 492 } },
    { id: 'TM0302', type: 'normale', capacite: 231.2, charge: { moyenne: 231.2, ecartType: 89.2, min: 153, max: 334 } },
    { id: 'TM0303', type: 'normale', capacite: 407.6, charge: { moyenne: 407.6, ecartType: 105.0, min: 259, max: 507 } },
    { id: 'TM0304', type: 'normale', capacite: 358.6, charge: { moyenne: 358.6, ecartType: 73.6, min: 270, max: 465 } },
    {
      id: 'TM0305',
      type: 'secable',
      capacite: 368.2,
      charge: { moyenne: 368.2, ecartType: 90.3, min: 301, max: 518 },
      voisinage: ['TM0303', 'TM0304', 'TM0308', 'TM0312'],
    },
    { id: 'TM0308', type: 'normale', capacite: 287.6, charge: { moyenne: 287.6, ecartType: 104.6, min: 169, max: 416 } },
    { id: 'TM0312', type: 'normale', capacite: 418.8, charge: { moyenne: 418.8, ecartType: 127.5, min: 305, max: 627 } },
    { id: 'TM0313', type: 'normale', capacite: 441.8, charge: { moyenne: 441.8, ecartType: 119.5, min: 331, max: 639 } },
    { id: 'TM0316', type: 'normale', capacite: 485.2, charge: { moyenne: 485.2, ecartType: 136.0, min: 244, max: 571 } },
  ],
};

export function isSaturday(date) {
  return date.getDay() === 6;
}

// --- PRNG déterministe (xmur3 + mulberry32) pour des données stables entre rendus ---
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFromSeed(seedStr) {
  const seedFn = xmur3(seedStr);
  return mulberry32(seedFn());
}

function randRange(rng, min, max) {
  return min + rng() * (max - min);
}

// Box-Muller : transforme deux tirages uniformes du PRNG maison en un tirage N(0,1).
function boxMuller(rng) {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Modèle statistique de charge : loi log-normale paramétrée par la moyenne et l'écart-type
// calibrés par tournée (CV ≈ 45%, distribution asymétrique à droite).
function logNormalDraw(rng, moyenne, ecartType, min, max) {
  const sigmaLog = Math.sqrt(Math.log(1 + (ecartType / moyenne) ** 2));
  const muLog = Math.log(moyenne) - sigmaLog ** 2 / 2;
  const z = boxMuller(rng);
  const value = Math.exp(muLog + sigmaLog * z);
  return Math.min(max, Math.max(min, value));
}

// Moins de courrier en fin de semaine (surtout le samedi) ; le poids libéré
// est redistribué sur le PPI et les colis. N'affecte que la répartition par type,
// jamais le total EOR (qui vient du modèle statistique ci-dessus).
function weightsForDay(dayOfWeek) {
  const weights = OBJECT_TYPES.reduce((acc, t) => {
    acc[t.key] = t.weight;
    return acc;
  }, {});
  if (dayOfWeek === 6) {
    weights.courrier -= 0.14;
    weights.ppi += 0.05;
    weights.colis += 0.09;
  } else if (dayOfWeek === 0) {
    weights.courrier -= 0.08;
    weights.ppi += 0.03;
    weights.colis += 0.05;
  }
  return weights;
}

function decomposeIntoObjects(targetEor, weights, rng) {
  const objects = {};
  for (const type of OBJECT_TYPES) {
    const jitter = randRange(rng, 0.9, 1.1);
    const eorShare = targetEor * weights[type.key] * jitter;
    objects[type.key] = Math.max(0, Math.round(eorShare / type.coeffDefault));
  }
  return objects;
}

function buildAgentTournee(site, entry, horizon, date) {
  const { id } = entry;
  const name = `${site.name} — Tournée ${id}`;
  const weights = weightsForDay(date.getDay());

  // Le renfort a une tournée (charge + capacité) comme les autres : seule sa case "actif" change
  // ce qui se passe ensuite (voir redistribution.js). Ce n'est pas un agent à capacité nulle.
  // "Référence" = paramètre statistique stable (même tirage quel que soit l'horizon) ; seul le
  // "Réel" diverge par horizon, selon la fiabilité (mécanisme inchangé).
  const { moyenne, ecartType, min, max } = entry.charge;
  const refRng = rngFromSeed(`${site.configKey}|${id}`);
  const chargeRef = logNormalDraw(refRng, moyenne, ecartType, min, max);
  const objectsRef = decomposeIntoObjects(chargeRef, weights, refRng);

  const reelRng = rngFromSeed(`${site.configKey}|${id}|${horizon.key}`);
  const objectsReel = {};
  for (const type of OBJECT_TYPES) {
    const divergence = randRange(reelRng, -horizon.maxDivergence, horizon.maxDivergence);
    objectsReel[type.key] = Math.max(0, Math.round(objectsRef[type.key] * (1 + divergence)));
  }

  return {
    id,
    name,
    siteId: site.id,
    type: entry.type,
    capaciteDefaut: entry.capacite,
    ...(entry.type === 'secable' ? { voisinageDefaut: entry.voisinage } : {}),
    objects: { ref: objectsRef, reel: objectsReel },
  };
}

// eor(objects, coefficients) -> total EOR pour un jeu d'objets donné
export function computeEor(objects, coefficients) {
  return OBJECT_TYPES.reduce((sum, type) => sum + (objects[type.key] || 0) * coefficients[type.key], 0);
}

// sitesConfig : { [configKey]: entry[] } — par défaut SITES_CONFIG, mais l'appelant peut passer
// un effectif courant (après ajout/suppression d'agents depuis l'onglet Paramètres).
export function generateMockData(sitesConfig = SITES_CONFIG) {
  const today = new Date();
  const dataByHorizon = {};

  for (const horizon of HORIZONS) {
    const date = new Date(today);
    date.setDate(date.getDate() + horizon.offset);

    const saturday = isSaturday(date);

    // Chaque site garde l'intégralité de ses agents, sans trou de numérotation, quel que soit le
    // jour : le voisinage d'une tournée sécable doit toujours pouvoir trouver ses receveurs.
    // Renfort et sécable restent dans site.tournees comme les tournées normales (charge, capacité,
    // statut calculés pareil) ; seule leur case "actif" déclenche la redistribution.
    const sites = SITES.map((site) => {
      const entries = sitesConfig[site.configKey];
      const tournees = entries.map((entry) => buildAgentTournee(site, entry, horizon, date));
      return { id: site.id, name: site.name, date, saturday, tournees };
    });

    dataByHorizon[horizon.key] = { date, saturday, sites };
  }

  return dataByHorizon;
}

// --- Effectif dynamique (onglet Paramètres : ajouter/supprimer un agent) --------------------

export function cloneSitesConfig(sitesConfig = SITES_CONFIG) {
  return Object.fromEntries(
    Object.entries(sitesConfig).map(([key, entries]) => [
      key,
      entries.map((e) => ({ ...e, charge: e.charge ? { ...e.charge } : null, voisinage: e.voisinage ? [...e.voisinage] : undefined })),
    ])
  );
}

// Prochain identifiant séquentiel pour un site (ex. T18 -> T19, GCH-08 -> GCH-09) : jamais de
// trou, même après des suppressions (se base sur le plus grand numéro existant).
function nextAgentId(entries) {
  if (!entries.length) return '1';
  const first = entries[0].id.match(/^(.*?)(\d+)$/);
  const prefix = first ? first[1] : '';
  const width = first ? first[2].length : 1;
  const maxNum = entries.reduce((max, e) => {
    const m = e.id.match(/(\d+)$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `${prefix}${String(maxNum + 1).padStart(width, '0')}`;
}

// Profil statistique moyen des tournées "normale" existantes d'un site — sert de point de départ
// raisonnable pour un agent nouvellement ajouté (sa capacité reste ensuite éditable comme les autres).
function averageProfile(entries) {
  const source = entries.filter((e) => e.type === 'normale' && e.charge);
  const pool = source.length ? source : entries.filter((e) => e.charge);
  if (!pool.length) {
    return { capacite: 700, charge: { moyenne: 700, ecartType: 300, min: 200, max: 1600 } };
  }
  const avg = (pick) => pool.reduce((s, e) => s + pick(e), 0) / pool.length;
  return {
    capacite: Math.round(avg((e) => e.capacite) * 10) / 10,
    charge: {
      moyenne: Math.round(avg((e) => e.charge.moyenne) * 10) / 10,
      ecartType: Math.round(avg((e) => e.charge.ecartType) * 10) / 10,
      min: Math.round(avg((e) => e.charge.min) * 10) / 10,
      max: Math.round(avg((e) => e.charge.max) * 10) / 10,
    },
  };
}

// Construit un nouvel agent (id auto, profil dérivé de la moyenne du site) prêt à être ajouté à
// SITES_CONFIG[configKey]. La capacité reste éditable ensuite comme pour n'importe quel agent.
export function createAgentEntry(entries, type) {
  const id = nextAgentId(entries);
  const profile = averageProfile(entries);
  return {
    id,
    type,
    capacite: profile.capacite,
    charge: { ...profile.charge },
    ...(type === 'secable' ? { voisinage: [] } : {}),
  };
}

export function defaultCoefficients() {
  return OBJECT_TYPES.reduce((acc, t) => {
    acc[t.key] = t.coeffDefault;
    return acc;
  }, {});
}

// --- Paramètres éditables (onglet Paramètres) : valeurs par défaut issues de SITES_CONFIG ----

export function defaultCapacites() {
  const capacites = {};
  for (const site of SITES) {
    for (const entry of SITES_CONFIG[site.configKey]) {
      capacites[entry.id] = entry.capacite;
    }
  }
  return capacites;
}

export function defaultSecableVoisinage() {
  const voisinages = {};
  for (const site of SITES) {
    for (const entry of SITES_CONFIG[site.configKey]) {
      if (entry.type === 'secable') voisinages[entry.id] = entry.voisinage;
    }
  }
  return voisinages;
}

// Renfort et sécable partagent le même modèle : un site peut en avoir 0, 1 ou plusieurs, chacun
// avec sa propre case "actif" et sa propre clé de répartition (agent -> toutes les autres
// tournées du site, au lieu d'un voisinage pour la sécable).
export function defaultCleRenfort() {
  const cles = {};
  for (const site of SITES) {
    for (const entry of SITES_CONFIG[site.configKey]) {
      if (entry.type === 'renfort') cles[entry.id] = 'uniforme';
    }
  }
  return cles;
}

export function defaultRenfortActive() {
  const active = {};
  for (const site of SITES) {
    for (const entry of SITES_CONFIG[site.configKey]) {
      if (entry.type === 'renfort') active[entry.id] = true;
    }
  }
  return active;
}

export function defaultSecableActive() {
  const active = {};
  for (const site of SITES) {
    for (const entry of SITES_CONFIG[site.configKey]) {
      if (entry.type === 'secable') active[entry.id] = true;
    }
  }
  return active;
}

export function defaultCleSecable() {
  const cles = {};
  for (const site of SITES) {
    for (const entry of SITES_CONFIG[site.configKey]) {
      if (entry.type === 'secable') cles[entry.id] = 'uniforme';
    }
  }
  return cles;
}

// Résout une clé de répartition en fractions (somme = 1) pour une liste d'identifiants donnée.
// 'uniforme' : parts égales. 'proportionnel' : au prorata de la capacité de chacun (aucune saisie
// requise, reste intuitif même avec beaucoup d'agents). Sinon, une table de poids personnalisée
// (pas forcément normalisée à 100%) — ex. { T2: 30, T3: 70 }.
export function resolveWeights(cle, ids, capacitesById) {
  if (!ids.length) return {};

  if (cle === 'proportionnel' && capacitesById) {
    const total = ids.reduce((s, id) => s + (Number(capacitesById[id]) || 0), 0);
    if (total > 0) return Object.fromEntries(ids.map((id) => [id, (Number(capacitesById[id]) || 0) / total]));
  }

  const isCustom = cle && typeof cle === 'object';
  const total = isCustom ? ids.reduce((s, id) => s + (Number(cle[id]) || 0), 0) : 0;
  if (!isCustom || !total) {
    const w = 1 / ids.length;
    return Object.fromEntries(ids.map((id) => [id, w]));
  }
  return Object.fromEntries(ids.map((id) => [id, (Number(cle[id]) || 0) / total]));
}

export function statusForRatio(ratio) {
  if (ratio > 1) return 'surcharge';
  if (ratio < 0.85) return 'sous-charge';
  return 'optimal';
}

export const STATUS_META = {
  optimal: { label: 'Optimal', color: 'green', hex: '#16a34a', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'sous-charge': { label: 'Sous-charge', color: 'orange', hex: '#ea580c', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  surcharge: { label: 'Surcharge', color: 'red', hex: '#dc2626', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};
