import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LifeBuoy, Split } from 'lucide-react';
import { computeEor } from '../data/mockData';
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

function TypeBadge({ type }) {
  if (type === 'secable') {
    return (
      <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
        <Split size={10} />
        Sécable
      </span>
    );
  }
  if (type === 'renfort') {
    return (
      <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
        <LifeBuoy size={10} />
        Renfort
      </span>
    );
  }
  return <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-400">Normale</span>;
}

function SecableManualPanel({ secable, otherTournees, secableManual, onSecableManualChange, coefficients }) {
  const chargeAvant = secable.objectsAvantRedistribution
    ? computeEor(secable.objectsAvantRedistribution, coefficients)
    : 0;
  const manual = secableManual[secable.id] || {};
  const total = otherTournees.reduce((s, t) => s + (Number(manual[t.id]) || 0), 0);

  return (
    <div className="ml-6 mt-1 rounded-md border border-purple-100 bg-purple-50/50 p-2.5">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-purple-700">
        <span>Répartition manuelle (facultatif — remplace la clé automatique si renseignée)</span>
        <span className={total > chargeAvant ? 'text-red-600' : 'text-purple-700'}>
          {Math.round(total)} / {Math.round(chargeAvant)} EOR
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {otherTournees.map((t) => (
          <label key={t.id} className="flex items-center gap-1 text-[11px] text-slate-600">
            {t.id}
            <input
              type="number"
              min="0"
              value={manual[t.id] || ''}
              onChange={(e) => onSecableManualChange(secable.id, t.id, e.target.value)}
              placeholder="0"
              className="w-16 rounded border border-slate-200 px-1 py-0.5 text-right text-[11px]"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SitesTable({
  sites,
  coefficients,
  unit,
  onSelectTournee,
  renfortActive,
  onToggleRenfort,
  secableActive,
  onToggleSecable,
  secableManual,
  onSecableManualChange,
}) {
  const [collapsed, setCollapsed] = useState({});
  const [manualOpen, setManualOpen] = useState({});

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
          const renfortActif = site.renfort ? renfortActive[site.id] !== false : false;

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
                    {Math.round(totalCharge).toLocaleString('fr-FR')} / {Math.round(totalCapacite).toLocaleString('fr-FR')} EOR
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
                    {site.renfort && (
                      <tr
                        onClick={() => onSelectTournee(site.renfort.id)}
                        className="cursor-pointer border-t border-slate-50 bg-blue-50/40 hover:bg-blue-50"
                      >
                        <td className="px-5 py-2 font-medium text-slate-700">
                          {site.renfort.name}
                          <TypeBadge type="renfort" />
                          <label
                            className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={renfortActif}
                              onChange={(e) => onToggleRenfort(site.id, e.target.checked)}
                            />
                            Actif
                          </label>
                          <InfoTip text="Un renfort est un agent flottant, sans tournée fixe : il représente une capacité de soutien mobilisable, pas comptée dans les totaux du site. Décochez pour simuler sa suppression : sa charge est alors redistribuée sur toutes les autres tournées du site." />
                        </td>
                        <td className="px-5 py-2 text-slate-600">
                          {renfortActif ? (
                            Math.round(computeEor(site.renfort.objects.reel, coefficients)).toLocaleString('fr-FR')
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-2 text-slate-400">sans capacité fixe</td>
                        <td className="px-5 py-2">
                          {renfortActif ? (
                            <span className="text-xs text-slate-400">agent flottant</span>
                          ) : (
                            <span className="text-xs text-slate-400">redistribué</span>
                          )}
                        </td>
                        <td className="px-5 py-2">
                          {renfortActif ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                              Disponible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                              Redistribué
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-2 text-right text-slate-400">—</td>
                      </tr>
                    )}
                    {metrics.map(({ t, m }) => {
                        const ecart = Math.round(m.chargeEor - t.capacite);
                        const incrementEor = t.incrementObjects ? Math.round(computeEor(t.incrementObjects, coefficients)) : 0;
                        const isSecable = t.type === 'secable';
                        const secableOn = isSecable ? secableActive[t.id] !== false : true;

                        return (
                          <React.Fragment key={t.id}>
                            <tr
                              onClick={() => onSelectTournee(t.id)}
                              className="cursor-pointer border-t border-slate-50 hover:bg-slate-50"
                            >
                              <td className="px-5 py-2 font-medium text-slate-700">
                                {t.name}
                                <TypeBadge type={t.type} />
                                {isSecable && (
                                  <label
                                    className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal text-purple-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={secableOn}
                                      onChange={(e) => onToggleSecable(t.id, e.target.checked)}
                                    />
                                    Actif
                                  </label>
                                )}
                              </td>
                              <td className="px-5 py-2 text-slate-600">
                                {t.released ? (
                                  <span className="text-slate-400">—</span>
                                ) : unit === 'eor' ? (
                                  Math.round(m.chargeEor).toLocaleString('fr-FR')
                                ) : (
                                  m.chargeObjets.toLocaleString('fr-FR')
                                )}
                                {incrementEor > 0 && (
                                  <span className="ml-1 text-[11px] font-medium text-orange-600">+{incrementEor.toLocaleString('fr-FR')}</span>
                                )}
                              </td>
                              <td className="px-5 py-2 text-slate-500">{Math.round(t.capacite).toLocaleString('fr-FR')}</td>
                              <td className="px-5 py-2">
                                {t.released ? (
                                  <span className="text-xs text-slate-400">redistribuée</span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-24">
                                      <UtilizationBar ratio={m.ratio} />
                                    </div>
                                    <span className="text-xs text-slate-500">{(m.ratio * 100).toFixed(0)}%</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-2">
                                {t.released ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                                    Redistribuée
                                  </span>
                                ) : (
                                  <StatusPastille status={m.status} />
                                )}
                              </td>
                              <td
                                className={`px-5 py-2 text-right font-medium ${
                                  t.released ? 'text-slate-400' : ecart > 0 ? 'text-red-600' : ecart < -120 ? 'text-orange-600' : 'text-slate-500'
                                }`}
                              >
                                {t.released ? '—' : `${ecart > 0 ? '+' : ''}${ecart.toLocaleString('fr-FR')}`}
                              </td>
                            </tr>
                            {isSecable && !secableOn && (
                              <tr>
                                <td colSpan={6} className="px-5 pb-2">
                                  <button
                                    onClick={() => setManualOpen((m2) => ({ ...m2, [t.id]: !m2[t.id] }))}
                                    className="text-[11px] font-medium text-purple-600 hover:underline"
                                  >
                                    {manualOpen[t.id] ? 'Masquer' : 'Choisir'} la répartition manuelle
                                  </button>
                                  {manualOpen[t.id] && (
                                    <SecableManualPanel
                                      secable={t}
                                      otherTournees={site.tournees.filter((o) => o.id !== t.id)}
                                      secableManual={secableManual}
                                      onSecableManualChange={onSecableManualChange}
                                      coefficients={coefficients}
                                    />
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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

export { tourneeMetrics };
