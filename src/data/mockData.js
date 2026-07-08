// Données 100% fictives, générées de façon déterministe (aucun backend, aucune API).

export const ETABLISSEMENT = 'PPDC Bretagne-Sud';

export const CAPACITE_REF = 800; // EOR par tournée

export const OBJECT_TYPES = [
  { key: 'courrier', label: 'Courrier / lettre', flux: 'PIC', coeffDefault: 1, weight: 0.42 },
  { key: 'imprime', label: 'Imprimé publicitaire', flux: 'PIC', coeffDefault: 0.5, weight: 0.16 },
  { key: 'presse', label: 'Presse / journal', flux: 'PIC', coeffDefault: 1.5, weight: 0.1 },
  { key: 'recommande', label: 'Recommandé (signature)', flux: 'PIC', coeffDefault: 3, weight: 0.07 },
  { key: 'colis', label: 'Colis', flux: 'PFC', coeffDefault: 5, weight: 0.25 },
];

export const HORIZONS = [
  { key: 'J', label: 'J (jour même)', offset: 0, reliability: 100, badge: 'vert', maxDivergence: 0.05 },
  { key: 'J+1', label: 'J+1 (24 h)', offset: 1, reliability: 90, badge: 'vert-clair', maxDivergence: 0.1 },
  { key: 'J+2', label: 'J+2 (48 h)', offset: 2, reliability: 70, badge: 'orange', maxDivergence: 0.18 },
];

export const SITES = [
  { id: 'guichen', name: 'Guichen', nbTournees: 12, buckets: bucketPlan(6, 5, 1) },
  { id: 'messac', name: 'Messac', nbTournees: 10, buckets: bucketPlan(2, 5, 3) },
  { id: 'montfort', name: 'Montfort', nbTournees: 8, buckets: bucketPlan(4, 4, 0) },
];

function bucketPlan(sous, optimal, surcharge) {
  const plan = [];
  for (let i = 0; i < sous; i++) plan.push('sous');
  for (let i = 0; i < optimal; i++) plan.push('optimal');
  for (let i = 0; i < surcharge; i++) plan.push('surcharge');
  return plan;
}

const BUCKET_RANGES = {
  sous: [500, 700],
  optimal: [700, 800],
  surcharge: [810, 920],
};

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

// Moins de courrier en fin de semaine (surtout le samedi) ; le poids libéré
// est redistribué sur la presse et les colis.
function weightsForDay(dayOfWeek) {
  const weights = OBJECT_TYPES.reduce((acc, t) => {
    acc[t.key] = t.weight;
    return acc;
  }, {});
  if (dayOfWeek === 6) {
    weights.courrier -= 0.14;
    weights.presse += 0.05;
    weights.colis += 0.09;
  } else if (dayOfWeek === 0) {
    weights.courrier -= 0.08;
    weights.presse += 0.03;
    weights.colis += 0.05;
  }
  return weights;
}

function buildTournee(site, index, bucket, horizon, date) {
  const id = `${site.id}-t${String(index + 1).padStart(2, '0')}`;
  const name = `${site.name} — Tournée ${String(index + 1).padStart(2, '0')}`;
  const rng = rngFromSeed(`${id}|${horizon.key}`);
  const [min, max] = BUCKET_RANGES[bucket];
  const targetEorRef = randRange(rng, min, max);
  const weights = weightsForDay(date.getDay());

  const objectsRef = {};
  const objectsReel = {};
  for (const type of OBJECT_TYPES) {
    const jitter = randRange(rng, 0.9, 1.1);
    const eorShare = targetEorRef * weights[type.key] * jitter;
    const countRef = Math.max(0, Math.round(eorShare / type.coeffDefault));
    objectsRef[type.key] = countRef;

    const divergence = randRange(rng, -horizon.maxDivergence, horizon.maxDivergence);
    objectsReel[type.key] = Math.max(0, Math.round(countRef * (1 + divergence)));
  }

  return {
    id,
    name,
    siteId: site.id,
    bucket,
    capacite: CAPACITE_REF,
    objects: { ref: objectsRef, reel: objectsReel },
  };
}

// eor(objects, coefficients) -> total EOR pour un jeu d'objets donné
export function computeEor(objects, coefficients) {
  return OBJECT_TYPES.reduce((sum, type) => sum + (objects[type.key] || 0) * coefficients[type.key], 0);
}

export function computeEorByFlux(objects, coefficients, flux) {
  return OBJECT_TYPES.filter((t) => flux === 'tous' || t.flux === flux).reduce(
    (sum, type) => sum + (objects[type.key] || 0) * coefficients[type.key],
    0
  );
}

export function generateMockData() {
  const today = new Date();
  const dataByHorizon = {};

  for (const horizon of HORIZONS) {
    const date = new Date(today);
    date.setDate(date.getDate() + horizon.offset);

    const sites = SITES.map((site) => {
      const tournees = site.buckets.map((bucket, index) => buildTournee(site, index, bucket, horizon, date));
      return { id: site.id, name: site.name, date, tournees };
    });

    dataByHorizon[horizon.key] = { date, sites };
  }

  return dataByHorizon;
}

export function defaultCoefficients() {
  return OBJECT_TYPES.reduce((acc, t) => {
    acc[t.key] = t.coeffDefault;
    return acc;
  }, {});
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
