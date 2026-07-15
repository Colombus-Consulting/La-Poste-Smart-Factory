import React from 'react';
import { Layers, Scale, GitBranch, ShieldCheck, Palette } from 'lucide-react';

const SECTIONS = [
  {
    icon: Scale,
    title: "L'EOR, une unité commune",
    body:
      "Un colis ne se traite pas comme une lettre. L'EOR (Équivalent Objet de Référence) convertit chaque type d'objet en une unité de temps de traitement commune, ce qui permet de comparer et d'additionner des objets très différents.",
  },
  {
    icon: GitBranch,
    title: 'Hiérarchie à 3 niveaux',
    body:
      "Établissement → Sites → Tournées. Un établissement regroupe plusieurs sites où les agents sont interchangeables (c'est le principe de consolidation). Chaque site regroupe des tournées, et chaque tournée correspond à un agent avec une capacité maximale.",
  },
  {
    icon: ShieldCheck,
    title: 'Fiabilité des données',
    body:
      "Les chiffres affichés sont des données réelles, mais le flux d'objets n'est pas remonté à 100% plusieurs jours à l'avance. La fiabilité augmente à mesure que l'on se rapproche du jour de distribution : 100% à J, ~90% à J+1, ~70% à J+2.",
  },
  {
    icon: Palette,
    title: 'Code couleur du statut',
    body:
      'Vert = Optimal (85–100% d\'utilisation). Orange = Sous-charge (moins de 85%, du temps est réaffectable). Rouge = Surcharge (plus de 100%, un renfort est nécessaire).',
  },
  {
    icon: Layers,
    title: 'Consolidation',
    body:
      "Le levier de décision : identifier les tournées en sous-charge (excédent d'EOR libres) et les tournées en surcharge (déficit) au sein d'un même établissement, puis proposer un déplacement de charge ou d'agents entre sites.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Méthodologie</h2>
        <p className="mt-1 text-sm text-slate-500">
          Les principes qui sous-tendent ce tableau de bord, en langage simple.
        </p>
      </div>
      {SECTIONS.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
