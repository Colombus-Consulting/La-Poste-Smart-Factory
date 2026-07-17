import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { computeEor } from '../data/mockData';
import { StatusPastille, UtilizationBar } from './StatusBadge';
import InfoTip from './InfoTip';

function summarize(site, coefficients) {
  let charge = 0;
  let capacite = 0;
  let nbSurcharge = 0;
  let nbSousCharge = 0;

  for (const t of site.tournees) {
    const eor = computeEor(t.objects.reel, coefficients);
    charge += eor;
    capacite += t.capacite;
    const ratio = eor / t.capacite;
    if (ratio > 1) nbSurcharge += 1;
    else if (ratio < 0.85) nbSousCharge += 1;
  }

  const ratio = capacite ? charge / capacite : 0;
  return { charge, capacite, ratio, nbSurcharge, nbSousCharge };
}

export default function MultiSiteSummary({ sites, coefficients, onSelectSite }) {
  const summaries = useMemo(() => sites.map((s) => ({ site: s, ...summarize(s, coefficients) })), [sites, coefficients]);

  return (
    <div className="px-6 pt-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Building2 size={15} className="text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">Récapitulatif par site</h2>
        <InfoTip text="Vue réservée au directeur d'établissement : comparer tous les sites côte à côte. Cliquez sur un site pour n'afficher que lui." />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaries.map(({ site, charge, capacite, ratio, nbSurcharge, nbSousCharge }) => (
          <button
            key={site.id}
            onClick={() => onSelectSite(site.id)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{site.name}</span>
              <StatusPastille status={ratio > 1 ? 'surcharge' : ratio < 0.85 ? 'sous-charge' : 'optimal'} />
            </div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex-1">
                <UtilizationBar ratio={ratio} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{(ratio * 100).toFixed(0)}%</span>
            </div>
            <div className="text-xs text-slate-500">
              {Math.round(charge).toLocaleString('fr-FR')} / {Math.round(capacite).toLocaleString('fr-FR')} EOR
            </div>
            <div className="mt-2 flex gap-3 text-xs">
              <span className="text-red-600">{nbSurcharge} surcharge</span>
              <span className="text-orange-600">{nbSousCharge} sous-charge</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
