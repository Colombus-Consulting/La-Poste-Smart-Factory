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

// Applique, pour un site donné, la redistribution de chaque renfort décoché (réparti sur toutes
// les autres tournées du site) puis de chaque sécable décochée (répartie sur son voisinage, ou
// sur une allocation manuelle si renseignée). Un site peut avoir 0, 1 ou plusieurs renforts/
// sécables, chacun avec sa propre case "actif" et sa propre clé — renfort et sécable ont une
// charge/capacité comme une tournée normale, seule leur case "actif" déclenche ce mécanisme.
// Retourne un site { tournees } ajusté, prêt à être consommé partout ailleurs comme s'il
// s'agissait des données brutes.
export function applyRedistribution(site, options) {
  const { capacites, renfortActive, cleRenfort, secableActive, secableVoisinage, cleSecable, secableManual } = options;

  const tournees = site.tournees.map((t) => cloneTournee(t, capacites[t.id] ?? t.capaciteDefaut));
  const byId = Object.fromEntries(tournees.map((t) => [t.id, t]));
  const capacitesById = Object.fromEntries(tournees.map((t) => [t.id, t.capacite]));

  for (const renfort of tournees.filter((t) => t.type === 'renfort')) {
    if (renfortActive[renfort.id] === false) {
      const recipients = tournees.filter((t) => t.id !== renfort.id);
      // Pas d'autre agent sur le site (cas extrême) : on laisse le renfort inchangé plutôt que
      // de faire disparaître sa charge en la redistribuant vers personne.
      if (recipients.length) {
        const weights = resolveWeights(cleRenfort[renfort.id], recipients.map((t) => t.id), capacitesById);
        redistribute(renfort, recipients, weights);
      }
    }
  }

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
        const voisinageIds = (secableVoisinage[secable.id] || secable.voisinageDefaut || []).filter((id) => byId[id]);
        // Voisinage pas (encore) configuré (ex. sécable tout juste ajoutée) : on retombe sur tout
        // le site plutôt que de perdre la charge en la redistribuant vers personne.
        ids = voisinageIds.length ? voisinageIds : tournees.filter((t) => t.id !== secable.id).map((t) => t.id);
        weights = resolveWeights(cleSecable[secable.id], ids, capacitesById);
      }
      if (ids.length) {
        redistribute(
          secable,
          ids.map((id) => byId[id]),
          weights
        );
      }
    }
  }

  return { tournees };
}
