import { useState } from 'react';
import type { Player, KingdomSummary, ViewMode } from './types/stats';
import rawPlayersData from './data/players.json';
import kingdomsData from './data/kingdoms.json';

import { Header } from './components/Header';
import { TopNav } from './components/TopNav';
import { KdChartsSection } from './components/KdChartsSection';
import { KingdomGrid } from './components/KingdomGrid';
import { ComparisonSuite } from './components/ComparisonSuite';
import { PlayerTable } from './components/PlayerTable';
import { KingdomModal } from './components/KingdomModal';
import { PlayerModal } from './components/PlayerModal';

export function App() {
  const players = rawPlayersData as Player[];
  const kingdoms = kingdomsData as KingdomSummary[];

  // Start with empty or user-chosen players
  const [currentView, setCurrentView] = useState<ViewMode>('all');
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<Set<string>>(new Set());
  const [activeKdModalServer, setActiveKdModalServer] = useState<string | null>(null);
  const [activePlayerModalName, setActivePlayerModalName] = useState<string | null>(null);

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

  const handleFilterTableToKd = (_server: string) => {
    setActiveKdModalServer(null);
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

      {/* 1. Graphs View */}
      {(currentView === 'all' || currentView === 'graphs') && (
        <KdChartsSection kingdoms={kingdoms} />
      )}

      {/* 2. Kingdom Cards View */}
      {(currentView === 'all' || currentView === 'kingdoms') && (
        <KingdomGrid kingdoms={kingdoms} players={players} onOpenKdModal={setActiveKdModalServer} />
      )}

      {/* 3. Multi-Player Comparison View */}
      {(currentView === 'all' || currentView === 'compare') && (
        <ComparisonSuite
          allPlayers={players}
          selectedPlayers={selectedPlayers}
          onAddPlayer={handleAddPlayerTag}
          onRemovePlayer={handleRemovePlayerTag}
          onClearAll={handleClearAllTags}
        />
      )}

      {/* 4. Complete Player Table View (Only shown in 'all' or 'table' mode) */}
      {(currentView === 'all' || currentView === 'table') && (
        <PlayerTable
          players={players}
          selectedPlayerNames={selectedPlayerNames}
          onAddPlayerTag={handleAddPlayerTag}
          onRemovePlayerTag={handleRemovePlayerTag}
          onClearAllTags={handleClearAllTags}
          onOpenPlayerModal={setActivePlayerModalName}
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
    </>
  );
}

export default App;
