export type TierGrade = 'S++' | 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export interface Player {
  name: string;
  server: string;
  archer_pow: number;
  cav_pow: number;
  siege_pow: number;
  total_pow: number;
  lethal: number;
  lion_lvl: number | null;
  lion_dmg: number;
  
  // General Troop Attributes
  troop_atk: number;
  troop_hp: number;
  troop_def: number;
  troop_dmg: number;
  troop_dmgr: number;
  troop_atk_bless: number;
  troop_prot_bless: number;
  
  // Infantry / Guard Attributes
  inf_atk: number;
  inf_hp: number;
  inf_def: number;
  inf_dmg: number;
  inf_dmgr: number;
  inf_atk_bless: number;
  inf_prot_bless: number;
  
  // Archer Attributes
  arc_atk: number;
  arc_hp: number;
  arc_def: number;
  arc_dmg: number;
  arc_dmgr: number;
  arc_atk_bless: number;
  arc_prot_bless: number;
  
  // Cavalry Attributes
  cav_atk: number;
  cav_hp: number;
  cav_def: number;
  cav_dmg: number;
  cav_dmgr: number;
  cav_atk_bless: number;
  cav_prot_bless: number;
  
  // Siege Attributes
  sg_atk: number;
  sg_hp: number;
  sg_def: number;
  sg_dmg: number;
  sg_dmgr: number;
  sg_atk_bless: number;
  sg_prot_bless: number;
  
  // Tiers & DGP
  total_pow_tier: TierGrade;
  total_pow_color: string;
  archer_pow_tier: TierGrade;
  archer_pow_color: string;
  cav_pow_tier: TierGrade;
  cav_pow_color: string;
  siege_pow_tier: TierGrade;
  siege_pow_color: string;
  
  dgp: number; // Guard Power (WOC)
  is_woc_leader: boolean;
}

export interface TierCounts {
  'S++': number;
  'S+': number;
  'S': number;
  'A': number;
  'B': number;
  'C': number;
  'D': number;
}

export interface KingdomSummary {
  server: string;
  count: number;
  avg_total: number;
  avg_archer: number;
  avg_cav: number;
  avg_siege: number;
  tiers: {
    total_pow: TierCounts;
    archer_pow: TierCounts;
    cav_pow: TierCounts;
    siege_pow: TierCounts;
  };
}

export type ViewMode = 'graphs' | 'kingdoms' | 'compare' | 'table';
export type UnitPowType = 'total_pow' | 'archer_pow' | 'cav_pow' | 'siege_pow';
export type CompMetricType = 'powers' | 'guard_pool' | 'attack_dmg';
