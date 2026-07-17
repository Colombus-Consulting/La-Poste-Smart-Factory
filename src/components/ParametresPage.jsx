import React, { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { SITES } from '../data/mockData';
import InfoTip from './InfoTip';
import EorMatrixPage from './EorMatrixPage';

function CleEditor({ ids, cle, onChange }) {
  const isCustom = cle && typeof cle === 'object';
  const mode = isCustom ? 'custom' : cle === 'proportionnel' ? 'proportionnel' : 'uniforme';
  return (
    <div>
      <select
        value={mode}
        onChange={(e) => {
          if (e.target.value === 'custom') onChange(Object.fromEntries(ids.map((id) => [id, Math.round(100 / (ids.length || 1))])));
          else onChange(e.target.value);
        }}
        className="mb-2 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
      >
        <option value="uniforme">Uniforme</option>
        <option value="proportionnel">Proportionnelle à la capacité</option>
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

function AddAgentControl({ onAdd }) {
  const [type, setType] = useState('normale');
  return (
    <div className="flex items-center gap-2 border-t border-slate-100 p-3">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
      >
        <option value="normale">Normale</option>
        <option value="renfort">Renfort</option>
        <option value="secable">Sécable</option>
      </select>
      <button
        onClick={() => onAdd(type)}
        className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700"
      >
        <Plus size={13} />
        Ajouter un agent
      </button>
    </div>
  );
}

export default function ParametresPage({
  sitesConfig,
  onAddAgent,
  onRemoveAgent,
  onResetRoster,
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
          <h2 className="text-base font-semibold text-slate-900">Matrice RH — effectif &amp; capacité par agent</h2>
          <InfoTip text="Chaque agent a sa propre capacité EOR quotidienne, au lieu d'une capacité uniforme. L'effectif n'est pas figé : ajoutez ou retirez un agent (normal, renfort ou sécable) à tout moment, par exemple pour étendre un site." />
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Montfort : valeurs réelles (53 semaines 2025). Guichen / Messac : calibrées, à remplacer.
        </p>
        <div className="space-y-2">
          {SITES.map((site) => {
            const entries = sitesConfig[site.configKey];
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
                  <>
                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 p-3 sm:grid-cols-2">
                      {entries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                          <span>
                            {entry.id}
                            {entry.type !== 'normale' && <span className="ml-1 text-[10px] text-slate-400">({entry.type})</span>}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={capacites[entry.id] ?? entry.capacite}
                              onChange={(e) => onCapaciteChange(entry.id, Math.max(0, Number(e.target.value)))}
                              className="w-20 rounded border border-slate-200 px-1.5 py-0.5 text-right"
                            />
                            <button
                              onClick={() => onRemoveAgent(site.configKey, entry.id)}
                              disabled={entries.length <= 1}
                              title="Retirer cet agent"
                              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2 size={13} />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                    <AddAgentControl onAdd={(type) => onAddAgent(site.configKey, type)} />
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onResetCapacites}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={13} />
            Réinitialiser les capacités par défaut
          </button>
          <button
            onClick={onResetRoster}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={13} />
            Réinitialiser l'effectif par défaut
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-slate-900">Clé de répartition — Renfort</h2>
          <InfoTip text="Le renfort a sa propre capacité et charge, comme une tournée normale (éditable dans la Matrice RH ci-dessus). Quand sa case « Actif » est décochée, sa charge est répartie sur toutes les autres tournées du site selon cette clé. Un site peut avoir 0, 1 ou plusieurs renforts." />
        </div>
        <div className="space-y-4">
          {SITES.flatMap((site) => {
            const entries = sitesConfig[site.configKey];
            return entries
              .filter((e) => e.type === 'renfort')
              .map((renfort) => {
                const otherIds = entries.filter((e) => e.id !== renfort.id).map((e) => e.id);
                return (
                  <div key={renfort.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      {site.name} — {renfort.id}
                    </div>
                    <CleEditor ids={otherIds} cle={cleRenfort[renfort.id]} onChange={(v) => onCleRenfortChange(renfort.id, v)} />
                  </div>
                );
              });
          })}
          {SITES.every((site) => !sitesConfig[site.configKey].some((e) => e.type === 'renfort')) && (
            <p className="text-sm text-slate-400">Aucun agent renfort pour l'instant — ajoutez-en un depuis la Matrice RH.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-slate-900">Tournées sécables — voisinage &amp; clé</h2>
          <InfoTip text="Quand une tournée sécable est décochée, sa charge est répartie sur les tournées voisines cochées ci-dessous, selon la clé choisie — sauf si une répartition manuelle est saisie directement dans le tableau des tournées, qui prend alors le dessus." />
        </div>
        <div className="space-y-4">
          {SITES.flatMap((site) => {
            const entries = sitesConfig[site.configKey];
            const allIds = entries.map((e) => e.id);
            return entries
              .filter((e) => e.type === 'secable')
              .map((secable) => {
                const voisinage = secableVoisinage[secable.id] || secable.voisinage || [];
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
          {SITES.every((site) => !sitesConfig[site.configKey].some((e) => e.type === 'secable')) && (
            <p className="text-sm text-slate-400">Aucune tournée sécable pour l'instant — ajoutez-en une depuis la Matrice RH.</p>
          )}
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
