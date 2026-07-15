import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { OBJECT_TYPES } from '../data/mockData';
import InfoTip from './InfoTip';

const TYPE_COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#ec4899', '#334155'];

export default function DistributionPanel({ sites, coefficients, unit }) {
  const byType = useMemo(() => {
    const totals = OBJECT_TYPES.reduce((acc, t) => {
      acc[t.key] = 0;
      return acc;
    }, {});

    for (const site of sites) {
      for (const t of site.tournees) {
        const objects = t.objects.reel;
        for (const type of OBJECT_TYPES) {
          const value = unit === 'eor' ? objects[type.key] * coefficients[type.key] : objects[type.key];
          totals[type.key] += value;
        }
      }
    }

    return OBJECT_TYPES.map((type, i) => ({
      name: type.label,
      value: Math.round(totals[type.key]),
      color: TYPE_COLORS[i % TYPE_COLORS.length],
    })).sort((a, b) => b.value - a.value);
  }, [sites, coefficients, unit]);

  const unitLabel = unit === 'eor' ? 'EOR' : 'objets';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <h2 className="text-sm font-semibold text-slate-800">Répartition des {unitLabel} par type d'objet</h2>
        <InfoTip text="Répartition de la charge de travail selon le type d'objet distribué." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {byType.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toLocaleString('fr-FR')} ${unitLabel}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {byType.map((entry, i) => (
              <div key={i} className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={byType} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v.toLocaleString('fr-FR')} ${unitLabel}`} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {byType.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
