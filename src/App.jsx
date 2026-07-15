import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import KpiCards from './components/KpiCards';
import SitesTable from './components/SitesTable';
import TourneeListView from './components/TourneeListView';
import TourneeDetail from './components/TourneeDetail';
import ConsolidationPanel from './components/ConsolidationPanel';
import DistributionPanel from './components/DistributionPanel';
import EorMatrixPage from './components/EorMatrixPage';
import MethodologyPage from './components/MethodologyPage';
import {
  generateMockData,
  HORIZONS,
  defaultCoefficients,
  computeEor,
  CAPACITE_REF,
} from './data/mockData';

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
  const [horizon, setHorizon] = useState('J');
  const [unit, setUnit] = useState('eor');
  const [siteFilter, setSiteFilter] = useState('');
  const [tourneeFilter, setTourneeFilter] = useState('');
  const [selectedTourneeId, setSelectedTourneeId] = useState('');
  const [coefficients, setCoefficients] = useState(defaultCoefficients());

  const horizonInfo = HORIZONS.find((h) => h.key === horizon);
  const { date, sites: allSites } = dataByHorizon[horizon];

  const filteredSites = useMemo(() => {
    let sites = siteFilter ? allSites.filter((s) => s.id === siteFilter) : allSites;
    if (tourneeFilter) {
      sites = sites.map((s) => ({ ...s, tournees: s.tournees.filter((t) => t.id === tourneeFilter) }));
    }
    return sites;
  }, [allSites, siteFilter, tourneeFilter]);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <Sidebar view={view} onViewChange={setView} horizon={horizon} onHorizonChange={setHorizon} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header horizonInfo={horizonInfo} date={date} />

        {view !== 'matrice' && view !== 'methodologie' && (
          <FilterBar
            unit={unit}
            onUnitChange={setUnit}
            siteFilter={siteFilter}
            onSiteFilterChange={setSiteFilter}
            tourneeFilter={tourneeFilter}
            onTourneeFilterChange={setTourneeFilter}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          {view === 'global' && (
            <>
              <KpiCards kpis={kpis} />
              <div className="grid grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SitesTable
                    sites={filteredSites}
                    coefficients={coefficients}
                    unit={unit}
                    onSelectTournee={setSelectedTourneeId}
                  />
                </div>
                <div className="space-y-4">
                  <ConsolidationPanel sites={allSites} coefficients={coefficients} />
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
              <ConsolidationPanel sites={allSites} coefficients={coefficients} />
            </div>
          )}

          {view === 'matrice' && (
            <EorMatrixPage
              coefficients={coefficients}
              onChange={handleCoefficientChange}
              onReset={() => setCoefficients(defaultCoefficients())}
            />
          )}

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
