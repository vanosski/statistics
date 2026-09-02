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
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<Set<string>>(new Set());
  const [activeKdModalServer, setActiveKdModalServer] = useState<string | null>(null);
  const [activePlayerModalName, setActivePlayerModalName] = useState<string | null>(null);

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
    setCurrentView('compare');
  };

  const handleFilterTableToKd = (server: string) => {
    setActiveKdModalServer(null);
    setTableFilters({ ...initialTableFilters, servers: [server] });
    setCurrentView('table');
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
    setCurrentView('table');
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
      <TopNav currentView={currentView} onSelectView={setCurrentView} />

      {/* 0. Dedicated Cyber Brutalism Command Center Home View */}
      {currentView === 'home' && (
        <HomePage
          kingdoms={kingdoms}
          players={players}
          onNavigate={setCurrentView}
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
        onClose={() => setActivePlayerModalName(null)}
        onAddToCompare={handleAddToCompareAndSwitch}
      />

      <Footer />
    </>
  );
}

export default App;
