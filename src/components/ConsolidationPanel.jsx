import React, { useMemo } from 'react';
import { ArrowRight, Shuffle } from 'lucide-react';
import { computeEor } from '../data/mockData';
import InfoTip from './InfoTip';

function aggregateSite(site, coefficients) {
  let excedent = 0;
  let deficit = 0;
  let sousCount = 0;
  let surCount = 0;

  for (const t of site.tournees) {
    const eor = computeEor(t.objects.reel, coefficients);
    const ratio = eor / t.capacite;
    if (ratio < 0.85) {
      excedent += t.capacite - eor;
      sousCount += 1;
    } else if (ratio > 1) {
      deficit += eor - t.capacite;
      surCount += 1;
    }
  }
  return { id: site.id, name: site.name, excedent, deficit, sousCount, surCount };
}

function buildSuggestions(aggregates) {
  const donors = aggregates
    .filter((s) => s.excedent > 0)
    .map((s) => ({ ...s, remaining: s.excedent, remainingCount: s.sousCount }))
    .sort((a, b) => b.excedent - a.excedent);
  const receivers = aggregates
    .filter((s) => s.deficit > 0)
    .map((s) => ({ ...s, remaining: s.deficit, remainingCount: s.surCount }))
    .sort((a, b) => b.deficit - a.deficit);

  const suggestions = [];
  for (const donor of donors) {
    for (const receiver of receivers) {
      if (donor.remaining <= 10) break;
      if (receiver.id === donor.id || receiver.remaining <= 10) continue;
      const amount = Math.min(donor.remaining, receiver.remaining);
      const nb = Math.max(1, Math.min(donor.remainingCount, receiver.remainingCount));
      suggestions.push({ from: donor.name, to: receiver.name, amount: Math.round(amount), nb });
      donor.remaining -= amount;
      receiver.remaining -= amount;
      donor.remainingCount = Math.max(0, donor.remainingCount - nb);
      receiver.remainingCount = Math.max(0, receiver.remainingCount - nb);
    }
  }
  return suggestions;
}

export default function ConsolidationPanel({ sites, coefficients }) {
  const aggregates = useMemo(() => sites.map((s) => aggregateSite(s, coefficients)), [sites, coefficients]);
  const suggestions = useMemo(() => buildSuggestions(aggregates), [aggregates]);

  const totalExcedent = aggregates.reduce((s, a) => s + a.excedent, 0);
  const totalDeficit = aggregates.reduce((s, a) => s + a.deficit, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5">
        <Shuffle size={16} className="text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">Consolidation — réallocation des ressources</h2>
        <InfoTip text="La consolidation permet de déplacer des agents entre sites d'un même établissement pour équilibrer la charge, car les agents y sont interchangeables." />
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Au sein de PPDC Bretagne-Sud, les agents sont interchangeables entre sites : le temps libéré sur un site en
        sous-charge peut être redéployé vers un site en surcharge.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-orange-50 p-3">
          <div className="text-xs font-medium text-orange-700">Excédent cumulé</div>
          <div className="text-xl font-semibold text-orange-700">{Math.round(totalExcedent).toLocaleString('fr-FR')} EOR</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-xs font-medium text-red-700">Déficit cumulé</div>
          <div className="text-xl font-semibold text-red-700">{Math.round(totalDeficit).toLocaleString('fr-FR')} EOR</div>
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.length === 0 && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Charge et ressources déjà équilibrées : aucune réallocation nécessaire.
          </p>
        )}
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm">
            <span className="text-slate-600">Déplacer</span>
            <span className="font-semibold text-slate-900">{s.amount.toLocaleString('fr-FR')} EOR</span>
            <span className="text-slate-600">de</span>
            <span className="font-semibold text-orange-700">{s.from}</span>
            <span className="text-slate-400">(excédent)</span>
            <ArrowRight size={14} className="text-slate-400" />
            <span className="text-slate-600">vers</span>
            <span className="font-semibold text-red-700">{s.to}</span>
            <span className="text-slate-400">(déficit)</span>
            <span className="ml-auto whitespace-nowrap text-xs font-medium text-slate-500">
              → +{s.nb} tournée{s.nb > 1 ? 's' : ''} équilibrée{s.nb > 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
