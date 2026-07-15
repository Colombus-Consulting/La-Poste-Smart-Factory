import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { computeEor, CAPACITE_REF } from '../data/mockData';
import { StatusPastille, UtilizationBar } from './StatusBadge';
import InfoTip from './InfoTip';

function tourneeMetrics(tournee, coefficients) {
  const objects = tournee.objects.reel;
  const chargeEor = computeEor(objects, coefficients);
  const chargeObjets = Object.values(objects).reduce((sum, count) => sum + count, 0);
  const ratio = chargeEor / tournee.capacite;
  const status = ratio > 1 ? 'surcharge' : ratio < 0.85 ? 'sous-charge' : 'optimal';
  return { chargeEor, chargeObjets, ratio, status };
}

export default function SitesTable({ sites, coefficients, unit, onSelectTournee }) {
  const [collapsed, setCollapsed] = useState({});

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Charge par site et par tournée</h2>
        <InfoTip text="Cliquez sur une tournée pour voir le détail par type d'objet. Cliquez sur un site pour replier/déplier ses tournées." />
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {sites.map((site) => {
          const metrics = site.tournees.map((t) => ({ t, m: tourneeMetrics(t, coefficients) }));
          const totalCharge = metrics.reduce((s, x) => s + x.m.chargeEor, 0);
          const totalCapacite = site.tournees.reduce((s, t) => s + t.capacite, 0);
          const ratioSite = totalCapacite ? totalCharge / totalCapacite : 0;
          const isCollapsed = collapsed[site.id];

          return (
            <div key={site.id} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [site.id]: !c[site.id] }))}
                className="flex w-full items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? <ChevronRight size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  <span className="text-sm font-semibold text-slate-800">{site.name}</span>
                  <span className="text-xs text-slate-400">{site.tournees.length} tournées</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-slate-500">
                    {Math.round(totalCharge).toLocaleString('fr-FR')} / {totalCapacite.toLocaleString('fr-FR')} EOR
                  </span>
                  <div className="w-32">
                    <UtilizationBar ratio={ratioSite} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-slate-700">{(ratioSite * 100).toFixed(0)}%</span>
                </div>
              </button>

              {!isCollapsed && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-1.5 font-medium">Tournée</th>
                      <th className="px-5 py-1.5 font-medium">{unit === 'eor' ? 'Charge (EOR)' : 'Charge (objets)'}</th>
                      <th className="px-5 py-1.5 font-medium">Capacité (EOR)</th>
                      <th className="px-5 py-1.5 font-medium">Taux d'utilisation</th>
                      <th className="px-5 py-1.5 font-medium">Statut</th>
                      <th className="px-5 py-1.5 font-medium text-right">Écart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(({ t, m }) => {
                      const ecart = Math.round(m.chargeEor - t.capacite);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => onSelectTournee(t.id)}
                          className="cursor-pointer border-t border-slate-50 hover:bg-slate-50"
                        >
                          <td className="px-5 py-2 font-medium text-slate-700">{t.name}</td>
                          <td className="px-5 py-2 text-slate-600">
                            {unit === 'eor' ? Math.round(m.chargeEor).toLocaleString('fr-FR') : m.chargeObjets.toLocaleString('fr-FR')}
                          </td>
                          <td className="px-5 py-2 text-slate-500">{t.capacite.toLocaleString('fr-FR')}</td>
                          <td className="px-5 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-24">
                                <UtilizationBar ratio={m.ratio} />
                              </div>
                              <span className="text-xs text-slate-500">{(m.ratio * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-2">
                            <StatusPastille status={m.status} />
                          </td>
                          <td
                            className={`px-5 py-2 text-right font-medium ${
                              ecart > 0 ? 'text-red-600' : ecart < -120 ? 'text-orange-600' : 'text-slate-500'
                            }`}
                          >
                            {ecart > 0 ? '+' : ''}
                            {ecart.toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { tourneeMetrics, CAPACITE_REF };
