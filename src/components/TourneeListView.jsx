import React, { useMemo } from 'react';
import { computeEor } from '../data/mockData';
import { StatusPastille, UtilizationBar } from './StatusBadge';
import InfoTip from './InfoTip';

export default function TourneeListView({ sites, coefficients, unit, onSelectTournee }) {
  const rows = useMemo(() => {
    const all = [];
    for (const site of sites) {
      for (const t of site.tournees) {
        const objects = t.objects.reel;
        const chargeEor = computeEor(objects, coefficients);
        const chargeObjets = Object.values(objects).reduce((sum, count) => sum + count, 0);
        const ratio = chargeEor / t.capacite;
        const status = ratio > 1 ? 'surcharge' : ratio < 0.85 ? 'sous-charge' : 'optimal';
        all.push({ t, siteName: site.name, chargeEor, chargeObjets, ratio, status });
      }
    }
    return all.sort((a, b) => b.ratio - a.ratio);
  }, [sites, coefficients]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Toutes les tournées, triées par taux d'utilisation</h2>
        <InfoTip text="Vue à plat de toutes les tournées de l'établissement, des plus en surcharge aux plus en sous-charge." />
      </div>
      <div className="max-h-[520px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2 font-medium">Tournée</th>
              <th className="px-5 py-2 font-medium">Site</th>
              <th className="px-5 py-2 font-medium">{unit === 'eor' ? 'Charge (EOR)' : 'Charge (objets)'}</th>
              <th className="px-5 py-2 font-medium">Capacité (EOR)</th>
              <th className="px-5 py-2 font-medium">Taux d'utilisation</th>
              <th className="px-5 py-2 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ t, siteName, chargeEor, chargeObjets, ratio, status }) => (
              <tr key={t.id} onClick={() => onSelectTournee(t.id)} className="cursor-pointer border-t border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-2 font-medium text-slate-700">
                  {t.name}
                  {t.type === 'secable' && (
                    <span className="ml-1.5 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">Sécable</span>
                  )}
                </td>
                <td className="px-5 py-2 text-slate-500">{siteName}</td>
                <td className="px-5 py-2 text-slate-600">
                  {t.released ? (
                    <span className="text-slate-400">—</span>
                  ) : unit === 'eor' ? (
                    Math.round(chargeEor).toLocaleString('fr-FR')
                  ) : (
                    chargeObjets.toLocaleString('fr-FR')
                  )}
                </td>
                <td className="px-5 py-2 text-slate-500">{Math.round(t.capacite).toLocaleString('fr-FR')}</td>
                <td className="px-5 py-2">
                  {t.released ? (
                    <span className="text-xs text-slate-400">redistribuée</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-28">
                        <UtilizationBar ratio={ratio} />
                      </div>
                      <span className="text-xs text-slate-500">{(ratio * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-2">
                  {t.released ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                      Redistribuée
                    </span>
                  ) : (
                    <StatusPastille status={status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
