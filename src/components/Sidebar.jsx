import React from 'react';
import { LayoutGrid, Building2, Route, Shuffle, Table2, BookOpen, Truck } from 'lucide-react';
import { HORIZONS } from '../data/mockData';

const NAV_ITEMS = [
  { key: 'global', label: 'Vue globale', icon: LayoutGrid },
  { key: 'site', label: 'Par site', icon: Building2 },
  { key: 'tournee', label: 'Par tournée', icon: Route },
  { key: 'consolidation', label: 'Consolidation', icon: Shuffle },
  { key: 'matrice', label: 'Matrice EOR', icon: Table2 },
  { key: 'methodologie', label: 'Méthodologie', icon: BookOpen },
];

export default function Sidebar({ view, onViewChange, horizon, onHorizonChange }) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-laposte-yellow">
          <Truck size={18} className="text-slate-900" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Smart Factory</div>
          <div className="text-[11px] text-slate-400">La Poste</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? 'bg-slate-700 text-white font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-700/60 px-3 py-4">
        <div className="mb-2 px-1 text-[11px] uppercase tracking-wide text-slate-400">Horizon</div>
        <div className="flex gap-1 rounded-md bg-slate-800 p-1">
          {HORIZONS.map((h) => (
            <button
              key={h.key}
              onClick={() => onHorizonChange(h.key)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                horizon === h.key ? 'bg-laposte-yellow text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              {h.key}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
