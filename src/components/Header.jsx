import React from 'react';
import { ShieldCheck, ShieldAlert, UserCog } from 'lucide-react';
import { SITES } from '../data/mockData';
import InfoTip from './InfoTip';

const BADGE_STYLES = {
  vert: 'bg-green-100 text-green-700',
  'vert-clair': 'bg-green-50 text-green-600',
  orange: 'bg-orange-100 text-orange-700',
};

export default function Header({ horizonInfo, date, role }) {
  const badgeClass = BADGE_STYLES[horizonInfo.badge] || BADGE_STYLES.vert;
  const Icon = horizonInfo.badge === 'orange' ? ShieldAlert : ShieldCheck;
  const roleLabel = role === 'admin' ? 'Vue Admin (Établissement)' : `Vue site — ${SITES.find((s) => s.id === role)?.name}`;

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Adéquation Charge / Ressource — PPDC Bretagne-Sud
        </h1>
        <p className="text-sm text-slate-500">Pilotage quotidien de la distribution</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          <UserCog size={14} />
          {roleLabel}
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${badgeClass}`}>
          <Icon size={14} />
          Fiabilité des données {horizonInfo.reliability}%
          <InfoTip text="Il s'agit de données réelles, mais le flux n'est pas encore remonté à 100% à J+1 et J+2. La fiabilité augmente à mesure que l'on se rapproche du jour de distribution, jusqu'à 100% le jour même." />
        </div>
        <div className="text-right text-sm text-slate-500">
          {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
