import React from 'react';
import { X } from 'lucide-react';
import { OBJECT_TYPES, computeEor } from '../data/mockData';
import { StatusPastille } from './StatusBadge';
import InfoTip from './InfoTip';

export default function TourneeDetail({ tournee, site, coefficients, onClose }) {
  if (!tournee) return null;

  const eorReel = computeEor(tournee.objects.reel, coefficients);
  const ratioReel = eorReel / tournee.capacite;
  const status = ratioReel > 1 ? 'surcharge' : ratioReel < 0.85 ? 'sous-charge' : 'optimal';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">{site?.name}</div>
            <h3 className="text-lg font-semibold text-slate-900">{tournee.name}</h3>
            <div className="mt-1">
              <StatusPastille status={status} />
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          Vue détail par type d'objet
          <InfoTip text="Chaque type d'objet a un coefficient EOR différent : c'est ce qui permet de comparer un colis et une lettre sur une même échelle de temps de traitement." />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Type d'objet</th>
                <th className="px-4 py-2 font-medium text-right">Objets</th>
                <th className="px-4 py-2 font-medium text-right">EOR</th>
              </tr>
            </thead>
            <tbody>
              {OBJECT_TYPES.map((type) => {
                const objReel = tournee.objects.reel[type.key];
                const eorTypeReel = objReel * coefficients[type.key];
                return (
                  <tr key={type.key} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-700">{type.label}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{objReel.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-2 text-right text-slate-500">
                      {eorTypeReel.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <td className="px-4 py-2">Total EOR</td>
                <td className="px-4 py-2 text-right">—</td>
                <td className="px-4 py-2 text-right">{eorReel.toFixed(0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 text-xs text-slate-400">Capacité de référence de la tournée : {tournee.capacite} EOR.</div>
      </div>
    </div>
  );
}
