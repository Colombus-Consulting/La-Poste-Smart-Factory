import React, { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { SITES, SITES_CONFIG } from '../data/mockData';
import InfoTip from './InfoTip';
import EorMatrixPage from './EorMatrixPage';

function CleEditor({ ids, cle, onChange }) {
  const isCustom = cle && typeof cle === 'object';
  return (
    <div>
      <select
        value={isCustom ? 'custom' : 'uniforme'}
        onChange={(e) => {
          if (e.target.value === 'uniforme') onChange('uniforme');
          else onChange(Object.fromEntries(ids.map((id) => [id, Math.round(100 / (ids.length || 1))])));
        }}
        className="mb-2 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
      >
        <option value="uniforme">Uniforme</option>
        <option value="custom">Personnalisée (%)</option>
      </select>
      {isCustom && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ids.map((id) => (
            <label key={id} className="flex items-center justify-between gap-1 text-xs text-slate-600">
              {id}
              <span className="flex items-center gap-0.5">
                <input
                  type="number"
                  min="0"
                  value={cle[id] ?? 0}
                  onChange={(e) => onChange({ ...cle, [id]: Number(e.target.value) })}
                  className="w-14 rounded border border-slate-200 px-1 py-0.5 text-right"
                />
                %
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function VoisinageEditor({ allIds, excludeId, voisinage, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allIds
        .filter((id) => id !== excludeId)
        .map((id) => (
          <label
            key={id}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] ${
              voisinage.includes(id) ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={voisinage.includes(id)}
              onChange={(e) => {
                const next = e.target.checked ? [...voisinage, id] : voisinage.filter((v) => v !== id);
                onChange(next);
              }}
            />
            {id}
          </label>
        ))}
    </div>
  );
}

export default function ParametresPage({
  coefficients,
  onCoefficientChange,
  onResetCoefficients,
  capacites,
  onCapaciteChange,
  onResetCapacites,
  cleRenfort,
  onCleRenfortChange,
  cleSecable,
  onCleSecableChange,
  secableVoisinage,
  onSecableVoisinageChange,
  onResetParametresAvances,
}) {
  const [openSite, setOpenSite] = useState({});

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Paramètres</h2>
        <p className="mt-1 text-sm text-slate-500">
          Valeurs provisoires, à remplacer par les vraies données au fur et à mesure. Chaque modification
          recalcule immédiatement tout le tableau de bord.
        </p>
      </div>

      <EorMatrixPage coefficients={coefficients} onChange={onCoefficientChange} onReset={onResetCoefficients} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-slate-900">Matrice RH — capacité par agent</h2>
          <InfoTip text="Chaque agent a sa propre capacité EOR quotidienne, au lieu d'une capacité uniforme. Le taux d'utilisation d'une tournée se calcule contre la capacité de son agent." />
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Montfort : valeurs réelles (53 semaines 2025). Guichen / Messac : calibrées, à remplacer.
        </p>
        <div className="space-y-2">
          {SITES.map((site) => {
            const entries = SITES_CONFIG[site.configKey];
            const isOpen = openSite[site.id];
            return (
              <div key={site.id} className="rounded-lg border border-slate-100">
                <button
                  onClick={() => setOpenSite((o) => ({ ...o, [site.id]: !o[site.id] }))}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {site.name}
                  <span className="text-xs font-normal text-slate-400">{entries.length} agents</span>
                </button>
                {isOpen && (
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3 sm:grid-cols-3">
                    {entries.map((entry) => (
                      <label key={entry.id} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                        <span>
                          {entry.id}
                          {entry.type !== 'normale' && <span className="ml-1 text-[10px] text-slate-400">({entry.type})</span>}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={capacites[entry.id] ?? entry.capacite}
                          onChange={(e) => onCapaciteChange(entry.id, Math.max(0, Number(e.target.value)))}
                          className="w-20 rounded border border-slate-200 px-1.5 py-0.5 text-right"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={onResetCapacites}
          className="mt-4 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={13} />
          Réinitialiser les capacités par défaut
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-slate-900">Clé de répartition — Renfort</h2>
          <InfoTip text="Le renfort a sa propre capacité et charge, comme une tournée normale (éditable dans la Matrice RH ci-dessus). Quand la case « Actif » est décochée sur le site, sa charge est répartie sur toutes les autres tournées selon cette clé." />
        </div>
        <div className="space-y-4">
          {SITES.map((site) => {
            const entries = SITES_CONFIG[site.configKey];
            const renfortEntry = entries.find((e) => e.type === 'renfort');
            if (!renfortEntry) return null;
            const otherIds = entries.filter((e) => e.type !== 'renfort').map((e) => e.id);
            return (
              <div key={site.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <div className="mb-2 text-sm font-medium text-slate-700">{site.name}</div>
                <CleEditor ids={otherIds} cle={cleRenfort[site.id]} onChange={(v) => onCleRenfortChange(site.id, v)} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-slate-900">Tournées sécables — voisinage &amp; clé</h2>
          <InfoTip text="Quand une tournée sécable est décochée, sa charge est répartie sur les tournées voisines cochées ci-dessous, selon la clé choisie — sauf si une répartition manuelle est saisie directement dans le tableau des tournées, qui prend alors le dessus." />
        </div>
        <div className="space-y-4">
          {SITES.flatMap((site) => {
            const entries = SITES_CONFIG[site.configKey];
            const allIds = entries.map((e) => e.id);
            return entries
              .filter((e) => e.type === 'secable')
              .map((secable) => {
                const voisinage = secableVoisinage[secable.id] || secable.voisinage;
                return (
                  <div key={secable.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      {site.name} — {secable.id}
                    </div>
                    <div className="mb-2">
                      <div className="mb-1 text-xs font-medium text-slate-500">Voisinage (tournées réceptrices possibles)</div>
                      <VoisinageEditor
                        allIds={allIds}
                        excludeId={secable.id}
                        voisinage={voisinage}
                        onChange={(v) => onSecableVoisinageChange(secable.id, v)}
                      />
                    </div>
                    <div className="mb-1 text-xs font-medium text-slate-500">Clé de répartition sur le voisinage</div>
                    <CleEditor ids={voisinage} cle={cleSecable[secable.id]} onChange={(v) => onCleSecableChange(secable.id, v)} />
                  </div>
                );
              });
          })}
        </div>
        <button
          onClick={onResetParametresAvances}
          className="mt-4 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={13} />
          Réinitialiser clés &amp; voisinage par défaut
        </button>
      </div>
    </div>
  );
}
