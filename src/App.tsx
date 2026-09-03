import { useState, useEffect } from 'react';
import type { Player, KingdomSummary, ViewMode, UnitPowType, TableFilters } from './types/stats';
import publicPlayersData from './data/public_players.json';
import kingdomsData from './data/kingdoms.json';
import { supabase } from './lib/supabase';

import { Header } from './components/Header';
import { TopNav } from './components/TopNav';
import { HomePage } from './components/HomePage';
import { KdChartsSection } from './components/KdChartsSection';
import { KingdomGrid } from './components/KingdomGrid';
import { ComparisonSuite } from './components/ComparisonSuite';
import { PlayerTable } from './components/PlayerTable';
import { CivilWarSuite } from './components/CivilWarSuite';
// import { KingdomSimulator } from './components/KingdomSimulator';
import { KingdomModal } from './components/KingdomModal';
import { PlayerModal } from './components/PlayerModal';
import { Footer } from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

export function App() {
  const { session, loading, isApproved } = useAuth();
  
  const publicPlayersInitial = publicPlayersData as Player[];
  
  const [players, setPlayers] = useState<Player[]>(() => {
    const seenNames = new Set<string>();
    const duplicateNames = new Set<string>();
    publicPlayersInitial.forEach(p => {
      if (seenNames.has(p.name)) duplicateNames.add(p.name);
      seenNames.add(p.name);
    });
    return publicPlayersInitial.map(p => ({
      ...p,
      name: duplicateNames.has(p.name) ? `${p.name} (${p.server})` : p.name
    }));
  });

  useEffect(() => {
    const fetchDetailedPlayers = async () => {
      if (!isApproved) return;
      
      try {
        const { data: detData, error: detError } = await supabase
          .from('players_detailed')
          .select('*');
          
        if (detError) throw detError;
        if (!detData) return;

        const merged = publicPlayersInitial.map(sum => {
          const det = detData.find(d => d.name === sum.name && d.server === sum.server) || {};
          return { ...sum, ...det };
        });

        const seenNames = new Set<string>();
        const duplicateNames = new Set<string>();
        merged.forEach(p => {
          if (seenNames.has(p.name)) duplicateNames.add(p.name);
          seenNames.add(p.name);
        });
        
        const finalPlayers = merged.map(p => ({
          ...p,
          name: duplicateNames.has(p.name) ? `${p.name} (${p.server})` : p.name
        }));

        setPlayers(finalPlayers as Player[]);
      } catch (err) {
        console.error("Error fetching detailed players from Supabase:", err);
      }
    };

    fetchDetailedPlayers();
  }, [isApproved]);

  const kingdoms = kingdomsData as KingdomSummary[];

  // Start on Command Center (Home)
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<Set<string>>(new Set());
  const [activeKdModalServer, setActiveKdModalServer] = useState<string | null>(null);
  const [activePlayerModalName, setActivePlayerModalName] = useState<string | null>(null);

  // Sync hash with currentView
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = ['home', 'graphs', 'kingdoms', 'compare', 'table', 'login', 'privacy', 'terms', 'simulator', 'civilwar'];
      if (validViews.includes(hash)) {
        if (!isApproved && ['table'].includes(hash)) {
          setCurrentView('login');
          window.location.hash = 'login';
          return;
        }
        setCurrentView(hash as ViewMode);
      } else if (hash === '') {
        setCurrentView('home');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isApproved]);

  // If user is logged in with Google but NOT approved yet, send them to the approval request screen
  useEffect(() => {
    if (!loading && session && !isApproved) {
      if (currentView !== 'privacy' && currentView !== 'terms') {
        setCurrentView('login');
        window.location.hash = 'login';
      }
    }
  }, [loading, session, isApproved, currentView]);

  // If user is guest/unapproved and tries to go to table, redirect to login
  useEffect(() => {
    if (!loading && !isApproved && ['table'].includes(currentView)) {
      setCurrentView('login');
      window.location.hash = 'login';
    }
  }, [loading, isApproved, currentView]);

  // Auto-redirect out of login screen when approved
  useEffect(() => {
    if (isApproved && ['login', 'privacy', 'terms'].includes(currentView)) {
      window.location.hash = 'home';
    }
  }, [isApproved, currentView]);

  const navigateTo = (view: ViewMode) => {
    if (!isApproved && ['table'].includes(view)) {
      window.location.hash = 'login';
      return;
    }
    window.location.hash = view;
  };

  const drillDownTo = (view: ViewMode) => {
    navigateTo(view);
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

  const handleOpenKdModal = (server: string | null) => {
    if (!isApproved && server !== null) {
      drillDownTo('login');
      return;
    }
    setActiveKdModalServer(server);
  };

  const handleOpenPlayerModal = (name: string | null) => {
    if (!isApproved && name !== null) {
      drillDownTo('login');
      return;
    }
    setActivePlayerModalName(name);
  };

  const selectedPlayers = players.filter((p) => selectedPlayerNames.has(p.name));
  const activePlayer = activePlayerModalName ? players.find((p) => p.name === activePlayerModalName) || null : null;

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>Loading...</div>;
  }

  return (
    <>
      <Header />
      <TopNav currentView={currentView} onSelectView={navigateTo} />

      <main style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '32px', width: '100%' }}>
      {['login', 'privacy', 'terms'].includes(currentView) && (
        <Login />
      )}

      {currentView === 'home' && (
        <HomePage
          kingdoms={kingdoms}
          players={players}
          onNavigate={drillDownTo}
          onOpenPlayer={handleOpenPlayerModal}
          onOpenKingdom={handleOpenKdModal}
        />
      )}

      {/* 1. KD Benchmarks View (Untouched) */}
      {currentView === 'graphs' && (
        <KdChartsSection kingdoms={kingdoms} players={players} />
      )}

      {/* 2. Kingdom Cards View */}
      {currentView === 'kingdoms' && (
        <KingdomGrid kingdoms={kingdoms} players={players} onOpenKdModal={handleOpenKdModal} onDrillDownTier={handleDrillDownTier} />
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
        isApproved ? (
          <PlayerTable
            players={players}
            selectedPlayerNames={selectedPlayerNames}
            onAddPlayerTag={handleAddPlayerTag}
            onRemovePlayerTag={handleRemovePlayerTag}
            onClearAllTags={handleClearAllTags}
            onOpenPlayerModal={handleOpenPlayerModal}
            filters={tableFilters}
            onFiltersChange={setTableFilters}
          />
        ) : (
          <Login />
        )
      )}

      {/* {currentView === 'simulator' && (
        <KingdomSimulator kingdoms={kingdoms} players={players} isApproved={isApproved} />
      )} */}

      {currentView === 'civilwar' && (
        <CivilWarSuite kingdoms={kingdoms} players={players} isApproved={isApproved} />
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
