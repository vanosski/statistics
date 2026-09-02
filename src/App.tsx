import { useState } from 'react';
import type { Player, KingdomSummary, ViewMode, UnitPowType, TableFilters } from './types/stats';
import rawPlayersData from './data/players.json';
import kingdomsData from './data/kingdoms.json';

import { Header } from './components/Header';
import { TopNav } from './components/TopNav';
import { HomePage } from './components/HomePage';
import { KdChartsSection } from './components/KdChartsSection';
import { KingdomGrid } from './components/KingdomGrid';
import { ComparisonSuite } from './components/ComparisonSuite';
import { PlayerTable } from './components/PlayerTable';
import { KingdomModal } from './components/KingdomModal';
import { PlayerModal } from './components/PlayerModal';
import { Footer } from './components/Footer';
import { ArrowLeft } from 'lucide-react';

export function App() {
  const rawPlayers = rawPlayersData as Player[];
  
  // Disambiguate duplicate names
  const seenNames = new Set<string>();
  const duplicateNames = new Set<string>();
  rawPlayers.forEach(p => {
    if (seenNames.has(p.name)) duplicateNames.add(p.name);
    seenNames.add(p.name);
  });
  
  const players = rawPlayers.map(p => ({
    ...p,
    name: duplicateNames.has(p.name) ? `${p.name} (${p.server})` : p.name
  }));

  const kingdoms = kingdomsData as KingdomSummary[];

  // Start on Command Center (Home)
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [history, setHistory] = useState<ViewMode[]>([]);
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<Set<string>>(new Set());
  const [activeKdModalServer, setActiveKdModalServer] = useState<string | null>(null);
  const [activePlayerModalName, setActivePlayerModalName] = useState<string | null>(null);

  const navigateTo = (view: ViewMode) => {
    setHistory([]);
    setCurrentView(view);
  };

  const drillDownTo = (view: ViewMode) => {
    setHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevView = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentView(prevView);
    }
  };

  const initialTableFilters: TableFilters = {
    servers: [],
    tiers: [],
    classes: [],
    wocOnly: false,
    tierType: 'total_pow'
  };
  const [tableFilters, setTableFilters] = useState<TableFilters>(initialTableFilters);

  // Player comparison selection handlers
  const handleAddPlayerTag = (name: string) => {
    setSelectedPlayerNames((prev) => new Set([...prev, name]));
  };

  const handleRemovePlayerTag = (name: string) => {
    setSelectedPlayerNames((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const handleClearAllTags = () => {
    setSelectedPlayerNames(new Set());
  };

  // Switch to compare view and ensure player added
  const handleAddToCompareAndSwitch = (name: string) => {
    handleAddPlayerTag(name);
    setActivePlayerModalName(null);
    if (currentView !== 'compare') drillDownTo('compare');
  };

  const handleFilterTableToKd = (server: string) => {
    setActiveKdModalServer(null);
    setTableFilters({ ...initialTableFilters, servers: [server] });
    drillDownTo('table');
    const tableEl = document.getElementById('playerTableSection');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDrillDownTier = (server: string, tier: string, tierType: UnitPowType) => {
    setTableFilters({
      servers: [server],
      tiers: [tier],
      classes: [],
      wocOnly: false,
      tierType: tierType
    });
    drillDownTo('table');
    const tableEl = document.getElementById('playerTableSection');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selectedPlayers = players.filter((p) => selectedPlayerNames.has(p.name));
  const activePlayer = activePlayerModalName ? players.find((p) => p.name === activePlayerModalName) || null : null;

  return (
    <>
      <Header />
      <TopNav currentView={currentView} onSelectView={navigateTo} />

      {history.length > 0 && (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 16px', marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={goBack}
            className="btn-toggle active"
            style={{ 
              padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(51, 65, 85, 0.8)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      )}

      <main style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '32px', width: '100%' }}>
      {currentView === 'home' && (
        <HomePage
          kingdoms={kingdoms}
          players={players}
          onNavigate={drillDownTo}
          onOpenPlayer={setActivePlayerModalName}
          onOpenKingdom={setActiveKdModalServer}
        />
      )}

      {/* 1. KD Benchmarks View (Untouched) */}
      {currentView === 'graphs' && (
        <KdChartsSection kingdoms={kingdoms} />
      )}

      {/* 2. Kingdom Cards View */}
      {currentView === 'kingdoms' && (
        <KingdomGrid kingdoms={kingdoms} players={players} onOpenKdModal={setActiveKdModalServer} onDrillDownTier={handleDrillDownTier} />
      )}

      {/* 3. Multi-Player Comparison View */}
      {currentView === 'compare' && (
        <ComparisonSuite
          allPlayers={players}
          selectedPlayers={selectedPlayers}
          onAddPlayer={handleAddPlayerTag}
          onRemovePlayer={handleRemovePlayerTag}
          onClearAll={handleClearAllTags}
        />
      )}

      {/* 4. Complete Player Table View */}
      {currentView === 'table' && (
        <PlayerTable
          players={players}
          selectedPlayerNames={selectedPlayerNames}
          onAddPlayerTag={handleAddPlayerTag}
          onRemovePlayerTag={handleRemovePlayerTag}
          onClearAllTags={handleClearAllTags}
          onOpenPlayerModal={setActivePlayerModalName}
          filters={tableFilters}
          onFiltersChange={setTableFilters}
        />
      )}

      </main>

      {/* Layered Modals */}
      <KingdomModal
        server={activeKdModalServer}
        kingdoms={kingdoms}
        players={players}
        onClose={() => setActiveKdModalServer(null)}
        onOpenPlayerProfile={(name) => {
          setActiveKdModalServer(null);
          setActivePlayerModalName(name);
        }}
        onFilterTableToKd={handleFilterTableToKd}
      />

      <PlayerModal
        player={activePlayer}
        allPlayers={players}
        onClose={() => setActivePlayerModalName(null)}
        onAddToCompare={handleAddToCompareAndSwitch}
      />

      <Footer />
    </>
  );
}

export default App;
