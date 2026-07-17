import React, { useMemo } from 'react';
import { ArrowRight, Shuffle, Check, X as XIcon, Clock } from 'lucide-react';
import { computeEor } from '../data/mockData';
import InfoTip from './InfoTip';

function aggregateSite(site, coefficients) {
  const totalCharge = site.tournees.reduce((s, t) => s + computeEor(t.objects.reel, coefficients), 0);
  const totalCapacite = site.tournees.reduce((s, t) => s + t.capacite, 0);
  const nbAgents = site.tournees.length;
  const ratio = totalCapacite ? totalCharge / totalCapacite : 0;
  // Capacité "moyenne" d'un agent de ce site : les capacités variant beaucoup d'un agent à
  // l'autre, c'est cette moyenne (pas une constante uniforme) qui sert à convertir un écart
  // EOR en nombre d'agents entiers.
  const avgCapacite = nbAgents ? totalCapacite / nbAgents : 0;
  return { id: site.id, name: site.name, nbAgents, totalCharge, totalCapacite, avgCapacite, ratio };
}

// On ne raisonne jamais en EOR entre sites : seul un agent entier (1 tournée = 1 agent)
// peut être transféré. On ne propose un transfert que si, une fois la charge optimisée
// en interne (agents déjà interchangeables sur un même site), il reste un déséquilibre
// net d'au moins un agent au niveau du site.
function buildAgentSuggestions(aggregates) {
  const donors = aggregates
    .filter((s) => s.ratio < 0.85 && s.avgCapacite > 0)
    .map((s) => ({ ...s, remaining: Math.floor((s.totalCapacite - s.totalCharge) / s.avgCapacite) }))
    .filter((s) => s.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);

  const receivers = aggregates
    .filter((s) => s.ratio > 1 && s.avgCapacite > 0)
    .map((s) => ({ ...s, remaining: Math.ceil((s.totalCharge - s.totalCapacite) / s.avgCapacite) }))
    .sort((a, b) => b.remaining - a.remaining);

  const suggestions = [];
  for (const donor of donors) {
    for (const receiver of receivers) {
      if (donor.remaining <= 0) break;
      if (receiver.id === donor.id || receiver.remaining <= 0) continue;
      const nb = Math.min(donor.remaining, receiver.remaining);
      suggestions.push({
        id: `${donor.id}->${receiver.id}`,
        fromId: donor.id,
        toId: receiver.id,
        from: donor.name,
        to: receiver.name,
        nb,
      });
      donor.remaining -= nb;
      receiver.remaining -= nb;
    }
  }
  return suggestions;
}

const STATUS_LABEL = {
  proposé: { label: 'En attente de validation', icon: Clock, className: 'bg-slate-100 text-slate-500' },
  validé: { label: 'Validé', icon: Check, className: 'bg-green-100 text-green-700' },
  rejeté: { label: 'Rejeté', icon: XIcon, className: 'bg-red-100 text-red-600' },
};

export default function ConsolidationPanel({ sites, coefficients, horizon, role, statuses, onValidate, onReject }) {
  const aggregates = useMemo(() => sites.map((s) => aggregateSite(s, coefficients)), [sites, coefficients]);
  const suggestions = useMemo(
    () =>
      buildAgentSuggestions(aggregates).map((s) => ({
        ...s,
        statusKey: `${horizon}|${s.id}`,
        status: statuses[`${horizon}|${s.id}`] || 'proposé',
      })),
    [aggregates, horizon, statuses]
  );

  const isAdmin = role === 'admin';
  const visibleSuggestions = isAdmin ? suggestions : suggestions.filter((s) => s.fromId === role || s.toId === role);

  const nbAgentsDisponibles = aggregates
    .filter((s) => s.ratio < 0.85 && s.avgCapacite > 0)
    .reduce((sum, s) => sum + Math.max(0, Math.floor((s.totalCapacite - s.totalCharge) / s.avgCapacite)), 0);
  const nbAgentsManquants = aggregates
    .filter((s) => s.ratio > 1 && s.avgCapacite > 0)
    .reduce((sum, s) => sum + Math.ceil((s.totalCharge - s.totalCapacite) / s.avgCapacite), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5">
        <Shuffle size={16} className="text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">Consolidation — transferts d'agents</h2>
        <InfoTip text="Un EOR appartient à un site et ne se redistribue pas finement entre sites. Ce qui peut se déplacer, c'est un agent entier (1 tournée = 1 agent)." />
      </div>
      <p className="mb-4 text-xs text-slate-500">
        {isAdmin
          ? "Au sein d'un même site, les agents sont déjà interchangeables. Ces suggestions ne portent que sur le déséquilibre restant au niveau du site entier, et doivent être validées par le directeur d'établissement."
          : "Suggestions de transfert concernant votre site, soumises à la validation du directeur d'établissement."}
      </p>

      {isAdmin && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-orange-50 p-3">
            <div className="text-xs font-medium text-orange-700">Agents disponibles à redéployer</div>
            <div className="text-xl font-semibold text-orange-700">{nbAgentsDisponibles}</div>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <div className="text-xs font-medium text-red-700">Agents manquants</div>
            <div className="text-xl font-semibold text-red-700">{nbAgentsManquants}</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {visibleSuggestions.length === 0 && isAdmin && nbAgentsDisponibles === 0 && nbAgentsManquants === 0 && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Charge et effectifs déjà équilibrés : aucun transfert nécessaire.
          </p>
        )}
        {visibleSuggestions.length === 0 && isAdmin && nbAgentsManquants > 0 && nbAgentsDisponibles === 0 && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {nbAgentsManquants} agent{nbAgentsManquants > 1 ? 's' : ''} manquant{nbAgentsManquants > 1 ? 's' : ''} au total,
            mais aucun site n'a d'agent disponible à redéployer pour l'instant.
          </p>
        )}
        {visibleSuggestions.length === 0 && isAdmin && nbAgentsDisponibles > 0 && nbAgentsManquants === 0 && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
            {nbAgentsDisponibles} agent{nbAgentsDisponibles > 1 ? 's' : ''} disponible{nbAgentsDisponibles > 1 ? 's' : ''},
            mais aucun site n'est en déficit pour l'instant.
          </p>
        )}
        {visibleSuggestions.length === 0 && !isAdmin && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Aucun transfert en cours pour votre site.</p>
        )}
        {visibleSuggestions.map((s) => {
          const meta = STATUS_LABEL[s.status];
          const StatusIcon = meta.icon;
          return (
            <div key={s.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {s.nb} agent{s.nb > 1 ? 's' : ''}
                </span>
                <span className="text-slate-600">de</span>
                <span className="font-semibold text-orange-700">{s.from}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="text-slate-600">vers</span>
                <span className="font-semibold text-red-700">{s.to}</span>
                <span className={`ml-auto flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}>
                  <StatusIcon size={12} />
                  {meta.label}
                </span>
              </div>
              {isAdmin && s.status === 'proposé' && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onValidate(s.statusKey)}
                    className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => onReject(s.statusKey)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
