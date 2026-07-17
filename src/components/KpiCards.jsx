import React from 'react';
import { Gauge, Package, Boxes, AlertTriangle, TrendingDown, PiggyBank } from 'lucide-react';
import InfoTip from './InfoTip';

function Card({ icon: Icon, label, tip, value, suffix, delta, deltaGood, accent, children }) {
  return (
    <div className="flex flex-1 min-w-[190px] flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {label}
          {tip && <InfoTip text={tip} />}
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${accent}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
      </div>
      {delta !== undefined && (
        <div className={`text-xs font-medium ${deltaGood ? 'text-green-600' : 'text-red-600'}`}>{delta}</div>
      )}
      {children}
    </div>
  );
}

export default function KpiCards({ kpis }) {
  const { tauxUtilisation, nbSurcharge, nbSousCharge } = kpis;
  const chargeTotale = Math.round(kpis.chargeTotale);
  const capaciteTotale = Math.round(kpis.capaciteTotale);
  const manqueEor = Math.round(kpis.manqueEor);
  const manqueEtp = kpis.manqueEtp.toFixed(1).replace('.', ',');

  return (
    <div className="flex flex-wrap gap-4 px-6 py-4">
      <Card
        icon={Gauge}
        label="Taux d'utilisation global"
        tip="Part de la capacité totale des tournées effectivement utilisée par la charge de travail."
        value={`${tauxUtilisation.toFixed(0)}%`}
        accent="bg-slate-100 text-slate-700"
        delta={tauxUtilisation >= 85 && tauxUtilisation <= 100 ? 'Dans la cible 85–100%' : 'Hors cible 85–100%'}
        deltaGood={tauxUtilisation >= 85 && tauxUtilisation <= 100}
      >
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, tauxUtilisation)}%`,
              backgroundColor: tauxUtilisation > 100 ? '#dc2626' : tauxUtilisation < 85 ? '#ea580c' : '#16a34a',
            }}
          />
        </div>
      </Card>

      <Card
        icon={Package}
        label="Charge totale"
        tip="Somme de la charge de travail de toutes les tournées affichées, exprimée en EOR."
        value={chargeTotale.toLocaleString('fr-FR')}
        suffix="EOR"
        accent="bg-blue-50 text-blue-600"
      />

      <Card
        icon={Boxes}
        label="Capacité totale"
        tip="Somme des capacités maximales des tournées affichées (chaque agent a sa propre capacité EOR)."
        value={capaciteTotale.toLocaleString('fr-FR')}
        suffix="EOR"
        accent="bg-slate-100 text-slate-600"
      />

      <Card
        icon={AlertTriangle}
        label="Tournées en surcharge"
        tip="Tournées dont la charge dépasse 100% de la capacité : elles ont besoin de renfort."
        value={nbSurcharge}
        accent="bg-red-50 text-red-600"
      />

      <Card
        icon={TrendingDown}
        label="Tournées en sous-charge"
        tip="Tournées dont le taux d'utilisation est inférieur à 85% : du temps agent est réaffectable."
        value={nbSousCharge}
        accent="bg-orange-50 text-orange-600"
      />

      <Card
        icon={PiggyBank}
        label="Manque à gagner"
        tip="EOR non utilisés sur les tournées en sous-charge, convertis en équivalent temps plein (ETP)."
        value={manqueEor.toLocaleString('fr-FR')}
        suffix={`EOR · ≈ ${manqueEtp} ETP`}
        accent="bg-yellow-50 text-yellow-700"
      />
    </div>
  );
}
