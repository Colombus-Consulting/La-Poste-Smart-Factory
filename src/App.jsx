import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import KpiCards from './components/KpiCards';
import MultiSiteSummary from './components/MultiSiteSummary';
import SitesTable from './components/SitesTable';
import TourneeListView from './components/TourneeListView';
import TourneeDetail from './components/TourneeDetail';
import ConsolidationPanel from './components/ConsolidationPanel';
import DistributionPanel from './components/DistributionPanel';
import ParametresPage from './components/ParametresPage';
import DataSourcesPage from './components/DataSourcesPage';
import MethodologyPage from './components/MethodologyPage';
import {
  generateMockData,
  HORIZONS,
  defaultCoefficients,
  defaultCapacites,
  defaultRenfortActive,
  defaultCleRenfort,
  defaultSecableActive,
  defaultSecableVoisinage,
  defaultCleSecable,
  computeEor,
  CAPACITE_REF,
} from './data/mockData';
import { applyRedistribution } from './data/redistribution';

function computeKpis(sites, coefficients) {
  let chargeTotale = 0;
  let capaciteTotale = 0;
  let nbSurcharge = 0;
  let nbSousCharge = 0;
  let manqueEor = 0;

  for (const site of sites) {
    for (const t of site.tournees) {
      const eor = computeEor(t.objects.reel, coefficients);
      chargeTotale += eor;
      capaciteTotale += t.capacite;
      const ratio = eor / t.capacite;
      if (ratio > 1) {
        nbSurcharge += 1;
      } else if (ratio < 0.85) {
        nbSousCharge += 1;
        manqueEor += t.capacite - eor;
      }
    }
  }

  const tauxUtilisation = capaciteTotale ? (chargeTotale / capaciteTotale) * 100 : 0;
  const manqueEtp = manqueEor / CAPACITE_REF;

  return { tauxUtilisation, chargeTotale, capaciteTotale, nbSurcharge, nbSousCharge, manqueEor, manqueEtp };
}

export default function App() {
  const dataByHorizon = useMemo(() => generateMockData(), []);

  const [view, setView] = useState('global');
  const [horizon, setHorizon] = useState('J+1');
  const [unit, setUnit] = useState('eor');
  const [role, setRole] = useState('admin');
  const [siteFilter, setSiteFilter] = useState('');
  const [tourneeFilter, setTourneeFilter] = useState('');
  const [selectedTourneeId, setSelectedTourneeId] = useState('');
  const [coefficients, setCoefficients] = useState(defaultCoefficients());
  const [suggestionStatuses, setSuggestionStatuses] = useState({});

  // Paramètres (onglet dédié) : capacité par agent, clés de répartition renfort/sécable,
  // voisinage sécable, cases à cocher renfort/sécable actives.
  const [capacites, setCapacites] = useState(defaultCapacites());
  const [renfortActive, setRenfortActive] = useState(defaultRenfortActive());
  const [cleRenfort, setCleRenfort] = useState(defaultCleRenfort());
  const [secableActive, setSecableActive] = useState(defaultSecableActive());
  const [secableVoisinage, setSecableVoisinage] = useState(defaultSecableVoisinage());
  const [cleSecable, setCleSecable] = useState(defaultCleSecable());
  const [secableManual, setSecableManual] = useState({});

  const horizonInfo = HORIZONS.find((h) => h.key === horizon);
  const { date, sites: rawSites } = dataByHorizon[horizon];

  const isAdmin = role === 'admin';
  const effectiveSiteFilter = isAdmin ? siteFilter : role;

  function handleRoleChange(newRole) {
    setRole(newRole);
    setSiteFilter('');
    setTourneeFilter('');
  }

  const redistributionOptions = useMemo(
    () => ({
      capacites,
      renfortActive,
      cleRenfort,
      secableActive,
      secableVoisinage,
      cleSecable,
      secableManual,
    }),
    [capacites, renfortActive, cleRenfort, secableActive, secableVoisinage, cleSecable, secableManual]
  );

  // Toutes les tournées/agents affichés dans l'app découlent de cet ajustement : capacité live
  // (Paramètres) + redistribution renfort/sécable en cours. Le reste du code consomme ces
  // données ajustées exactement comme des données brutes.
  const allSites = useMemo(
    () => rawSites.map((site) => ({ ...site, ...applyRedistribution(site, redistributionOptions) })),
    [rawSites, redistributionOptions]
  );

  const filteredSites = useMemo(() => {
    let sites = effectiveSiteFilter ? allSites.filter((s) => s.id === effectiveSiteFilter) : allSites;
    if (tourneeFilter) {
      sites = sites.map((s) => ({ ...s, tournees: s.tournees.filter((t) => t.id === tourneeFilter) }));
    }
    return sites;
  }, [allSites, effectiveSiteFilter, tourneeFilter]);

  const kpis = useMemo(() => computeKpis(filteredSites, coefficients), [filteredSites, coefficients]);

  const selectedTournee = useMemo(() => {
    if (!selectedTourneeId) return null;
    for (const site of allSites) {
      const t = site.tournees.find((tt) => tt.id === selectedTourneeId);
      if (t) return { tournee: t, site };
    }
    return null;
  }, [allSites, selectedTourneeId]);

  function handleCoefficientChange(key, value) {
    setCoefficients((prev) => ({ ...prev, [key]: value }));
  }

  function handleValidateSuggestion(statusKey) {
    setSuggestionStatuses((prev) => ({ ...prev, [statusKey]: 'validé' }));
  }

  function handleRejectSuggestion(statusKey) {
    setSuggestionStatuses((prev) => ({ ...prev, [statusKey]: 'rejeté' }));
  }

  function handleToggleRenfort(siteId, active) {
    setRenfortActive((prev) => ({ ...prev, [siteId]: active }));
  }

  function handleToggleSecable(tourneeId, active) {
    setSecableActive((prev) => ({ ...prev, [tourneeId]: active }));
  }

  function handleSecableManualChange(tourneeId, recipientId, value) {
    setSecableManual((prev) => ({
      ...prev,
      [tourneeId]: { ...prev[tourneeId], [recipientId]: value },
    }));
  }

  const showMultiSiteSummary = view === 'global' && isAdmin && !siteFilter;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <Sidebar
        view={view}
        onViewChange={setView}
        horizon={horizon}
        onHorizonChange={setHorizon}
        role={role}
        onRoleChange={handleRoleChange}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header horizonInfo={horizonInfo} date={date} role={role} />

        {view !== 'parametres' && view !== 'methodologie' && view !== 'sources' && (
          <FilterBar
            unit={unit}
            onUnitChange={setUnit}
            allSites={allSites}
            lockedSiteId={isAdmin ? null : role}
            siteFilter={effectiveSiteFilter}
            onSiteFilterChange={setSiteFilter}
            tourneeFilter={tourneeFilter}
            onTourneeFilterChange={setTourneeFilter}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          {view === 'global' && (
            <>
              {showMultiSiteSummary && (
                <MultiSiteSummary sites={allSites} coefficients={coefficients} onSelectSite={setSiteFilter} />
              )}
              <KpiCards kpis={kpis} />
              <div className="grid grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SitesTable
                    sites={filteredSites}
                    coefficients={coefficients}
                    unit={unit}
                    onSelectTournee={setSelectedTourneeId}
                    renfortActive={renfortActive}
                    onToggleRenfort={handleToggleRenfort}
                    secableActive={secableActive}
                    onToggleSecable={handleToggleSecable}
                    secableVoisinage={secableVoisinage}
                    secableManual={secableManual}
                    onSecableManualChange={handleSecableManualChange}
                  />
                </div>
                <div className="space-y-4">
                  <ConsolidationPanel
                    sites={allSites}
                    coefficients={coefficients}
                    horizon={horizon}
                    role={role}
                    statuses={suggestionStatuses}
                    onValidate={handleValidateSuggestion}
                    onReject={handleRejectSuggestion}
                  />
                </div>
              </div>
              <div className="px-6 pb-6">
                <DistributionPanel sites={filteredSites} coefficients={coefficients} unit={unit} />
              </div>
            </>
          )}

          {view === 'site' && (
            <div className="space-y-4 p-6">
              <KpiCards kpis={kpis} />
              <SitesTable
                sites={filteredSites}
                coefficients={coefficients}
                unit={unit}
                onSelectTournee={setSelectedTourneeId}
                renfortActive={renfortActive}
                onToggleRenfort={handleToggleRenfort}
                secableActive={secableActive}
                onToggleSecable={handleToggleSecable}
                secableVoisinage={secableVoisinage}
                secableManual={secableManual}
                onSecableManualChange={handleSecableManualChange}
              />
            </div>
          )}

          {view === 'tournee' && (
            <div className="p-6">
              <TourneeListView
                sites={filteredSites}
                coefficients={coefficients}
                unit={unit}
                onSelectTournee={setSelectedTourneeId}
              />
            </div>
          )}

          {view === 'consolidation' && (
            <div className="mx-auto max-w-3xl p-6">
              <ConsolidationPanel
                sites={allSites}
                coefficients={coefficients}
                horizon={horizon}
                role={role}
                statuses={suggestionStatuses}
                onValidate={handleValidateSuggestion}
                onReject={handleRejectSuggestion}
              />
            </div>
          )}

          {view === 'parametres' && (
            <ParametresPage
              coefficients={coefficients}
              onCoefficientChange={handleCoefficientChange}
              onResetCoefficients={() => setCoefficients(defaultCoefficients())}
              capacites={capacites}
              onCapaciteChange={(id, value) => setCapacites((prev) => ({ ...prev, [id]: value }))}
              onResetCapacites={() => setCapacites(defaultCapacites())}
              cleRenfort={cleRenfort}
              onCleRenfortChange={(siteId, value) => setCleRenfort((prev) => ({ ...prev, [siteId]: value }))}
              cleSecable={cleSecable}
              onCleSecableChange={(id, value) => setCleSecable((prev) => ({ ...prev, [id]: value }))}
              secableVoisinage={secableVoisinage}
              onSecableVoisinageChange={(id, value) => setSecableVoisinage((prev) => ({ ...prev, [id]: value }))}
              onResetParametresAvances={() => {
                setCleRenfort(defaultCleRenfort());
                setCleSecable(defaultCleSecable());
                setSecableVoisinage(defaultSecableVoisinage());
              }}
            />
          )}

          {view === 'sources' && <DataSourcesPage />}

          {view === 'methodologie' && <MethodologyPage />}
        </main>
      </div>

      {selectedTournee && (
        <TourneeDetail
          tournee={selectedTournee.tournee}
          site={selectedTournee.site}
          coefficients={coefficients}
          onClose={() => setSelectedTourneeId('')}
        />
      )}
    </div>
  );
}
