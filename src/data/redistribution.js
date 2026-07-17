// Redistribution intra-site (renfort / sécable), à la maille tournée, en EOR + objets.
// Différent de la Consolidation (inter-sites, à la maille agent) : ne pas mélanger les deux.
import { OBJECT_TYPES, resolveWeights } from './mockData';

function zeroObjects() {
  return OBJECT_TYPES.reduce((acc, t) => {
    acc[t.key] = 0;
    return acc;
  }, {});
}

function cloneTournee(t, capacite) {
  return {
    ...t,
    capacite,
    objects: { ref: { ...t.objects.ref }, reel: { ...t.objects.reel } },
    incrementObjects: zeroObjects(),
    released: false,
  };
}

function redistribute(source, recipients, weights) {
  const objectsAvantRedistribution = { ...source.objects.reel };
  for (const type of OBJECT_TYPES) {
    const total = source.objects.reel[type.key];
    for (const r of recipients) {
      const add = Math.round(total * (weights[r.id] || 0));
      r.objects.reel[type.key] += add;
      r.objects.ref[type.key] += add;
      r.incrementObjects[type.key] += add;
    }
  }
  source.released = true;
  source.objectsAvantRedistribution = objectsAvantRedistribution;
  source.objects = { ref: zeroObjects(), reel: zeroObjects() };
}

// Applique, pour un site donné, la redistribution renfort (si décoché : réparti sur toutes les
// autres tournées du site) puis sécable (si décochée : réparti sur son voisinage, ou sur une
// allocation manuelle si renseignée). Retourne un site { tournees, renfort } ajusté, prêt à être
// consommé partout ailleurs comme s'il s'agissait des données brutes.
export function applyRedistribution(site, options) {
  const {
    capacites,
    renfortActive,
    cleRenfort,
    secableActive,
    secableVoisinage,
    cleSecable,
    secableManual,
    volumeRedistribuable,
  } = options;

  const tournees = site.tournees.map((t) => cloneTournee(t, capacites[t.id] ?? t.capaciteDefaut));
  let renfort = site.renfort ? cloneTournee(site.renfort, 0) : null;

  if (renfort) {
    const liveVolume = volumeRedistribuable?.[renfort.id] ?? renfort.volumeRedistribuableDefaut;
    if (liveVolume !== renfort.volumeRedistribuableDefaut && renfort.volumeRedistribuableDefaut > 0) {
      const scale = liveVolume / renfort.volumeRedistribuableDefaut;
      const scaledRef = {};
      const scaledReel = {};
      for (const type of OBJECT_TYPES) {
        scaledRef[type.key] = Math.round(renfort.objects.ref[type.key] * scale);
        scaledReel[type.key] = Math.round(renfort.objects.reel[type.key] * scale);
      }
      renfort = { ...renfort, objects: { ref: scaledRef, reel: scaledReel } };
    }
  }

  if (renfort && renfortActive[site.id] === false) {
    const weights = resolveWeights(cleRenfort[site.id], tournees.map((t) => t.id));
    redistribute(renfort, tournees, weights);
  }

  const byId = Object.fromEntries(tournees.map((t) => [t.id, t]));
  for (const secable of tournees.filter((t) => t.type === 'secable')) {
    if (secableActive[secable.id] === false) {
      const manual = secableManual[secable.id];
      const hasManual = manual && Object.values(manual).some((v) => Number(v) > 0);
      let ids;
      let weights;
      if (hasManual) {
        ids = Object.keys(manual).filter((id) => byId[id] && Number(manual[id]) > 0);
        weights = resolveWeights(manual, ids);
      } else {
        ids = (secableVoisinage[secable.id] || secable.voisinageDefaut || []).filter((id) => byId[id]);
        weights = resolveWeights(cleSecable[secable.id], ids);
      }
      redistribute(
        secable,
        ids.map((id) => byId[id]),
        weights
      );
    }
  }

  return { tournees, renfort };
}
