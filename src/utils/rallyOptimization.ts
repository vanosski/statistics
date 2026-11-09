import type { Player, KingdomSummary } from '../types/stats';
import { KINGDOM_CONFIGS, getRedSkillMultiplier } from './kingdomRanking';

export interface PlayerRallyAllocation {
  player: Player;
  power: number;
  marchSize: number; // in troops (e.g. 150000)
  effectivePunch: number; // power * effective_troops
  troopEfficiencyPct: number; // e.g. 85.5%
  activeUnits?: string[];
}

export interface KingdomRallyResult {
  server: string;
  playerCount: number;
  totalTroopsSent: number;
  avgTroopEfficiency: number;
  rawRallyPunch: number;
  finalRallyPower: number;
  currentFinalPower: number;
  wocLeader: Player | null;
  guardPower: number;
  redBonusPct: number;
  activeRedSkills: number;
  topAllocations: PlayerRallyAllocation[];
  unitRallies: {
    archer: number;
    cav: number;
    siege: number;
  };
}

export interface RallyOptimizationParams {
  totalCapacity?: number; // default 2,000,000
  maxMarchPerPlayer?: number; // default 380,000
  baselineLeanMarch?: number; // default 150,000 (100% eff)
  diminishingGamma?: number; // default 0.55
  maxPlayers?: number; // default 25
}

export function solveKingdomRally(
  playersInKd: Player[],
  server: string,
  currentAvgTotal: number,
  params: RallyOptimizationParams = {}
): KingdomRallyResult {
  const {
    totalCapacity = 2000000,
    maxMarchPerPlayer = 380000,
    baselineLeanMarch = 150000,
    diminishingGamma = 0.55,
    maxPlayers = 25
  } = params;

  // Informational Display: identify each player's primary viable units (for UI display only)
  const getPlayerActiveUnits = (p: Player): string[] => {
    const units = [
      { type: 'Archer', val: p.archer_pow || 0 },
      { type: 'Cav', val: p.cav_pow || 0 },
      { type: 'Siege', val: p.siege_pow || 0 }
    ];
    const personalBest = Math.max(...units.map(u => u.val));
    const cutoff = personalBest * 0.60;
    return units.filter(u => u.val >= cutoff).map(u => u.type);
  };

  // Filter & sort descending by total_pow (Old intact calculation)
  const sortedPlayers = [...playersInKd]
    .sort((a, b) => b.total_pow - a.total_pow)
    .slice(0, maxPlayers);

  const N = sortedPlayers.length;
  if (N === 0) {
    return {
      server,
      playerCount: 0,
      totalTroopsSent: 0,
      avgTroopEfficiency: 0,
      rawRallyPunch: 0,
      finalRallyPower: 0,
      currentFinalPower: 0,
      wocLeader: null,
      guardPower: 0,
      redBonusPct: 0,
      activeRedSkills: 0,
      topAllocations: [],
      unitRallies: { archer: 0, cav: 0, siege: 0 }
    };
  }

  // WoC Leader & Red Skills configuration
  const config = KINGDOM_CONFIGS[server] || {
    redSkills: 1,
    tierBadge: 'TIER C',
    badgeClass: 'bg-purple',
    customBuff: undefined
  };
  const wocLeader = playersInKd.find((p) => p.is_woc_leader) || null;
  const guardPower = wocLeader ? wocLeader.dgp : 0;

  let activeRedSkills = config.redSkills;
  if (server === 'K27' && wocLeader) {
    if (wocLeader.name.includes('X-')) {
      activeRedSkills = 4;
    } else if (wocLeader.name.toLowerCase().includes('avenok')) {
      activeRedSkills = 1;
    }
  }

  const redBonusPct = getRedSkillMultiplier(activeRedSkills, config.customBuff);
  const currentFinalPower = Math.round((currentAvgTotal + (guardPower * 0.85)) * (1 + redBonusPct));

  // Solve troop allocation with power weighting and 380k cap
  const powers = sortedPlayers.map(p => Math.max(1, p.total_pow));
  const weights = powers.map(p => Math.pow(p, 1.5));
  const sumW = weights.reduce((a, b) => a + b, 0);

  const targetTroops = Math.min(totalCapacity, N * maxMarchPerPlayer);
  let troops = weights.map(w => Math.min(maxMarchPerPlayer, targetTroops * (w / sumW)));

  // Normalize to targetTroops
  const curTroopsSum = troops.reduce((a, b) => a + b, 0);
  if (curTroopsSum > 0) {
    troops = troops.map(t => Math.min(maxMarchPerPlayer, t * (targetTroops / curTroopsSum)));
  }

  // Calculate diminishing efficiency per player
  const allocations: PlayerRallyAllocation[] = sortedPlayers.map((player, idx) => {
    const marchSize = Math.round(troops[idx]);
    const eff = marchSize > baselineLeanMarch
      ? Math.pow(baselineLeanMarch / marchSize, diminishingGamma)
      : 1.0;
    const effectiveTroops = marchSize * eff;
    const effectivePunch = powers[idx] * effectiveTroops;

    return {
      player,
      power: powers[idx],
      marchSize,
      effectivePunch,
      troopEfficiencyPct: Math.round(eff * 1000) / 10,
      activeUnits: getPlayerActiveUnits(player)
    };
  });

  const totalEffectiveCombat = allocations.reduce((sum, a) => sum + a.effectivePunch, 0);
  const rawRallyPunch = Math.round(totalEffectiveCombat / totalCapacity);
  const totalTroopsSent = allocations.reduce((sum, a) => sum + a.marchSize, 0);
  const totalEffectiveTroops = allocations.reduce((sum, a) => sum + (a.marchSize * (a.troopEfficiencyPct / 100)), 0);
  const avgTroopEfficiency = totalTroopsSent > 0 ? Math.round((totalEffectiveTroops / totalTroopsSent) * 1000) / 10 : 0;

  // Add WoC Guard Power and Red Skills
  const finalRallyPower = Math.round((rawRallyPunch + (guardPower * 0.85)) * (1 + redBonusPct));

  // Helper for unit rally punches
  const solveUnitPunch = (uMetric: 'archer_pow' | 'cav_pow' | 'siege_pow') => {
    const uSorted = [...playersInKd].sort((a, b) => b[uMetric] - a[uMetric]).slice(0, maxPlayers);
    const uPowers = uSorted.map(p => Math.max(1, p[uMetric]));
    const uWeights = uPowers.map(p => Math.pow(p, 1.5));
    const uSumW = uWeights.reduce((a, b) => a + b, 0);
    const uTarget = Math.min(totalCapacity, uSorted.length * maxMarchPerPlayer);
    let uTroops = uWeights.map(w => Math.min(maxMarchPerPlayer, uTarget * (w / uSumW)));
    const uTot = uTroops.reduce((a, b) => a + b, 0);
    if (uTot > 0) uTroops = uTroops.map(t => Math.min(maxMarchPerPlayer, t * (uTarget / uTot)));

    let effCombat = 0;
    for (let i = 0; i < uSorted.length; i++) {
      const ms = uTroops[i];
      const eff = ms > baselineLeanMarch ? Math.pow(baselineLeanMarch / ms, diminishingGamma) : 1.0;
      effCombat += uPowers[i] * (ms * eff);
    }
    return Math.round(effCombat / totalCapacity);
  };

  return {
    server,
    playerCount: playersInKd.length,
    totalTroopsSent,
    avgTroopEfficiency,
    rawRallyPunch,
    finalRallyPower,
    currentFinalPower,
    wocLeader,
    guardPower,
    redBonusPct,
    activeRedSkills,
    topAllocations: allocations,
    unitRallies: {
      archer: solveUnitPunch('archer_pow'),
      cav: solveUnitPunch('cav_pow'),
      siege: solveUnitPunch('siege_pow')
    }
  };
}

export function getAllKingdomRallyResults(
  kingdoms: KingdomSummary[],
  players: Player[],
  params?: RallyOptimizationParams
): KingdomRallyResult[] {
  const kdPlayerMap: Record<string, Player[]> = {};
  players.forEach(p => {
    if (p.server === 'K336') return;
    if (!kdPlayerMap[p.server]) kdPlayerMap[p.server] = [];
    kdPlayerMap[p.server].push(p);
  });

  const kdSummaryMap: Record<string, KingdomSummary> = {};
  kingdoms.forEach(k => {
    kdSummaryMap[k.server] = k;
  });

  const results: KingdomRallyResult[] = [];
  for (const server of Object.keys(kdPlayerMap)) {
    const summary = kdSummaryMap[server];
    const avgTotal = summary ? summary.avg_total : 0;
    results.push(solveKingdomRally(kdPlayerMap[server], server, avgTotal, params));
  }

  // Sort by finalRallyPower descending
  results.sort((a, b) => b.finalRallyPower - a.finalRallyPower);
  return results;
}
