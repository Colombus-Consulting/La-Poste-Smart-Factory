import React from 'react';
import InfoTip from './InfoTip';

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar({
  unit,
  onUnitChange,
  allSites,
  siteFilter,
  onSiteFilterChange,
  tourneeFilter,
  onTourneeFilterChange,
  lockedSiteId,
}) {
  const site = allSites.find((s) => s.id === siteFilter);

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500">Unité</span>
        <InfoTip text="EOR = Équivalent Objet de Référence, l'unité commune qui permet de comparer tous les types d'objets entre eux." />
        <ToggleGroup
          options={[
            { value: 'objets', label: 'Objets' },
            { value: 'eor', label: 'EOR' },
          ]}
          value={unit}
          onChange={onUnitChange}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <select
          value={siteFilter}
          disabled={!!lockedSiteId}
          onChange={(e) => {
            onSiteFilterChange(e.target.value);
            onTourneeFilterChange('');
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-60"
        >
          {!lockedSiteId && <option value="">Tous les sites</option>}
          {allSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={tourneeFilter}
          onChange={(e) => onTourneeFilterChange(e.target.value)}
          disabled={!site}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
        >
          <option value="">Toutes les tournées</option>
          {site?.tournees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name.split(' — ')[1] || t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
