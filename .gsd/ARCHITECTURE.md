# ARCHITECTURE.md — System Architecture & Codebase Map

> **Generated**: 2026-11-12  
> **Status**: Verified Brownfield Map

---

## 1. System Overview
**COE Statistics & Rally Simulation Platform** is a web application providing real-time combat analytics, kingdom tiering, civil war simulations, and rally march optimizations for Clash of Empires (COE).

- **Frontend**: React 19 + TypeScript + Vite + Lucide Icons
- **Backend / DB**: Supabase (PostgreSQL with `players_detailed` table)
- **Data Pipeline**: Python ETL scripts converting `master_database.csv` into statically served JSON artifacts (`kingdoms.json`, `players.json`, `public_players.json`) and syncing live records into Supabase.

---

## 2. Architecture Diagram

```mermaid
flowchart TD
    subgraph Data Pipeline
        CSV[master_database.csv] -->|build_json.py| JSON[src/data/*.json]
        CSV -->|sync_to_supabase.py| Supabase[(Supabase DB)]
    end

    subgraph Client Application
        App[src/App.tsx] --> AuthContext[AuthContext.tsx]
        App --> TopNav[TopNav.tsx]
        App --> Router{View Router}

        Router -->|#rally5678 (Gated)| Rally[RallySimulator.tsx]
        Router -->|civilWar| CivilWar[CivilWarSuite.tsx]
        Router -->|comparison| Compare[ComparisonSuite.tsx]
        Router -->|simulator| KdSim[KingdomSimulator.tsx]
        Router -->|default| Home[HomePage.tsx]

        Home --> KingdomGrid[KingdomGrid.tsx]
        Home --> PlayerTable[PlayerTable.tsx]
        Home --> KdCharts[KdChartsSection.tsx]
    end

    subgraph Math & Optimization Engines
        Rally --> RallyOpt[rallyOptimization.ts]
        CivilWar --> KdRank[kingdomRanking.ts]
        Home --> KdRank
    end
```

---

## 3. Key Components & Responsibilities

| Component / Utility | File Path | Responsibility |
| :--- | :--- | :--- |
| **App Shell & Router** | `src/App.tsx` | Hash-based routing, authentication state, modal management |
| **Rally Simulator** | `src/components/RallySimulator.tsx` | Secret route `/#rally5678` for 25-man rally march optimization, exclusion toggles, and live capacity recalculation |
| **Rally Optimizer Engine** | `src/utils/rallyOptimization.ts` | Mathematical formulation for lean march sweetspots, diminishing returns ($\gamma$), and non-replacement attendance scaling |
| **Kingdom Ranking Engine** | `src/utils/kingdomRanking.ts` | Formulas for WoC Guard Power (DGP), Red Skills multipliers, and tier calculations (A/B/C) |
| **Civil War Suite** | `src/components/CivilWarSuite.tsx` | Head-to-head kingdom comparison and battle simulation |
| **Player Table** | `src/components/PlayerTable.tsx` | Searchable, filterable, sortable player stat cards with modal drilldowns |
| **Data Synchronization** | `build_json.py` & `sync_to_supabase.py` | ETL pipeline pushing CSV updates to local build files and Supabase REST endpoints |

---

## 4. Data Flows & Constraints
1. **Source of Truth**: `master_database.csv` contains all parsed stat rows across all tracked kingdoms.
2. **Access Control**: Public visitors only see anonymized or high-level views (`public_players.json`); authenticated approved users access raw player names and hidden routes (`#rally5678`).
3. **Build & Sync Protocol**: Any changes to player stats require running:
   ```bash
   python3 build_json.py
   python3 sync_to_supabase.py
   npm run build
   ```

