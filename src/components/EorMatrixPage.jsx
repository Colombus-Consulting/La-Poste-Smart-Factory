import React from 'react';
import { RotateCcw } from 'lucide-react';
import { OBJECT_TYPES, defaultCoefficients } from '../data/mockData';
import InfoTip from './InfoTip';

export default function EorMatrixPage({ coefficients, onChange, onReset }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5">
        <h2 className="text-base font-semibold text-slate-900">Matrice de transfert EOR</h2>
        <InfoTip text="L'EOR (Équivalent Objet de Référence) convertit chaque type d'objet en une unité de temps de traitement commune, en le multipliant par un coefficient." />
      </div>
      <p className="mb-5 text-sm text-slate-500">
        1 EOR correspond au temps de traitement d'une lettre standard. Les coefficients ci-dessous sont modifiables :
        tout le tableau de bord recalcule automatiquement la charge en EOR.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2 font-medium">Type d'objet</th>
            <th className="py-2 font-medium text-right">Coefficient EOR</th>
          </tr>
        </thead>
        <tbody>
          {OBJECT_TYPES.map((type) => (
            <tr key={type.key} className="border-t border-slate-100">
              <td className="py-3 font-medium text-slate-700">{type.label}</td>
              <td className="py-3 text-right">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={coefficients[type.key]}
                  onChange={(e) => onChange(type.key, Math.max(0, Number(e.target.value)))}
                  className="w-24 rounded-md border border-slate-200 px-2 py-1 text-right text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={onReset}
        className="mt-5 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <RotateCcw size={13} />
        Réinitialiser les valeurs par défaut
      </button>
    </div>
  );
}

export { defaultCoefficients };
