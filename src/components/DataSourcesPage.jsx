import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { SITES } from '../data/mockData';

const SOURCES = [
  {
    site: 'Guichen',
    statut: 'incomplete',
    maj: 'Mai 2026',
    remarque:
      "Fictif, calibré sur le profil Montfort (pas de données réelles à ce stade). Données non transmises par le site en mai 2026 — une estimation basée sur la moyenne glissante des mois précédents a été appliquée en remplacement.",
  },
  {
    site: 'Messac',
    statut: 'incomplete',
    maj: 'Juillet 2026',
    remarque: 'Fictif, calibré sur le profil Montfort (pas de données réelles à ce stade). À remplacer par un vrai flux quand disponible.',
  },
  {
    site: 'Montfort',
    statut: 'ok',
    maj: '08/07/2026',
    remarque:
      "Seul site réel du PoC : charge et capacité par agent issues de l'extraction RH consolidée (fichier « Données RH consolidées »), onglet MFData T, 53 semaines 2025.",
  },
];

const STATUS_META = {
  ok: { label: 'À jour', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  incomplete: { label: 'Donnée incomplète', icon: AlertTriangle, className: 'bg-orange-100 text-orange-700' },
};

export default function DataSourcesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Sources de données</h2>
        <p className="mt-1 text-sm text-slate-500">
          Traçabilité et fiabilité des données par site — utile pour savoir si un chiffre affiché s'appuie sur une
          donnée fraîche ou sur une estimation de repli.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-2.5 font-medium">Site</th>
              <th className="px-5 py-2.5 font-medium">Statut</th>
              <th className="px-5 py-2.5 font-medium">Dernière mise à jour</th>
              <th className="px-5 py-2.5 font-medium">Remarque</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => {
              const meta = STATUS_META[s.statut];
              const Icon = meta.icon;
              return (
                <tr key={s.site} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-3 font-medium text-slate-700">{s.site}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                      <Icon size={13} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{s.maj}</td>
                  <td className="px-5 py-3 text-slate-500">{s.remarque}</td>
                </tr>
              );
            })}
            <tr className="border-t border-slate-100 align-top">
              <td className="px-5 py-3 font-medium text-slate-700">Matrice EOR</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                  <CheckCircle2 size={13} />
                  Validé
                </span>
              </td>
              <td className="px-5 py-3 text-slate-500">Juillet 2026</td>
              <td className="px-5 py-3 text-slate-500">
                Coefficients confirmés par la direction métier à partir des données RH consolidées.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Périmètre du PoC : {SITES.map((s) => s.name).join(', ')} — établissement PPDC Bretagne-Sud.
      </p>
    </div>
  );
}
