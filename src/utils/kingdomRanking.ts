import type { KingdomSummary, Player } from '../types/stats';

export interface KingdomRankingConfig {
  redSkills: number;
  tierBadge: string;
  badgeClass: string;
  customBuff?: number;
}

export const KINGDOM_CONFIGS: Record<string, KingdomRankingConfig> = {
  'K54': { redSkills: 3, tierBadge: 'TIER S++', badgeClass: 'bg-crimson' },
  'K197': { redSkills: 5, tierBadge: 'TIER S+', badgeClass: 'bg-gold' },
  'K60': { redSkills: 1, tierBadge: 'TIER S+', badgeClass: 'bg-gold' },
  'K176': { redSkills: 1, tierBadge: 'TIER S', badgeClass: 'bg-emerald' },
  'K116': { redSkills: 4, tierBadge: 'TIER S', badgeClass: 'bg-emerald' },
  'K91': { redSkills: 3, tierBadge: 'TIER A', badgeClass: 'bg-blue' },
  'K170': { redSkills: 1, tierBadge: 'TIER A', badgeClass: 'bg-blue', customBuff: 0.03 },
  'K57': { redSkills: 2, tierBadge: 'TIER B', badgeClass: 'bg-purple' },
  'K138': { redSkills: 1, tierBadge: 'TIER B', badgeClass: 'bg-purple' },
  'K48': { redSkills: 4, tierBadge: 'TIER B', badgeClass: 'bg-purple' },
  'K88': { redSkills: 1, tierBadge: 'TIER B', badgeClass: 'bg-purple' },
  'K43': { redSkills: 2, tierBadge: 'TIER B', badgeClass: 'bg-purple' }
};

export function getRedSkillMultiplier(skills: number, customBuff?: number): number {
  if (customBuff !== undefined) return customBuff;
  if (skills <= 0) return 0.0;
  return 0.04 + (skills - 1) * 0.01;
}

export interface RankedKingdom extends KingdomSummary {
  rank: number;
  config: KingdomRankingConfig;
  wocLeader: Player | null;
  guardPower: number;
  redBonus: number;
  finalKingdomPower: number;
}

export function getRankedKingdoms(kingdoms: KingdomSummary[], players: Player[]): RankedKingdom[] {
  const calculated = kingdoms.map((kd) => {
    const config = KINGDOM_CONFIGS[kd.server] || {
      redSkills: 0,
      tierBadge: 'TIER C',
      badgeClass: 'bg-purple',
      customBuff: undefined
    };
    const wocLeader = players.find((p) => p.server === kd.server && p.is_woc_leader) || null;
    const guardPower = wocLeader ? wocLeader.dgp : 0;
    const redBonus = getRedSkillMultiplier(config.redSkills, config.customBuff);
    const finalKingdomPower = Math.round((kd.avg_total + (guardPower * 0.85)) * (1 + redBonus));

    return {
      ...kd,
      rank: 0,
      config,
      wocLeader,
      guardPower,
      redBonus,
      finalKingdomPower
    };
  });

  calculated.sort((a, b) => b.finalKingdomPower - a.finalKingdomPower);

  return calculated.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}
