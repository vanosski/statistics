import pandas as pd
import json
import math
import numpy as np

# 1. Read CSV
df_master = pd.read_csv('master_database.csv')

# Percentage parsing helper
def parse_pct(val):
    if pd.isna(val) or val == '': return 0.0
    if isinstance(val, str):
        val = val.replace('%', '').replace('+', '').replace(',', '')
    try: return float(val) / 100.0
    except: return 0.0

pct_cols = [c for c in df_master.columns if c not in ['Server', 'Player Name']]
for c in pct_cols:
    df_master[c] = df_master[c].apply(parse_pct)

# Calculation logic
def calc_guard_power(row):
    inf_def = (row.get('Infantry DEF', 0) or 0) * 100
    troop_def = (row.get('Troop DEF', 0) or 0) * 100
    inf_hp = (row.get('Infantry HP', 0) or 0) * 100
    troop_hp = (row.get('Troop HP', 0) or 0) * 100
    inf_prot_bless = (row.get('Infantry PROT Bless', 0) or 0) * 100
    troop_prot_bless = (row.get('Troop PROT Bless', 0) or 0) * 100
    inf_dmgr = abs(row.get('Infantry DMG Recv', 0) or 0) * 100
    troop_dmgr = abs(row.get('Troop DMG Recv', 0) or 0) * 100
    total_def_pool = (inf_def + troop_def) + (inf_hp + troop_hp) + 1.5 * (inf_prot_bless + troop_prot_bless)
    total_dmgr_pool = (inf_dmgr + troop_dmgr)
    return math.ceil((total_def_pool * total_dmgr_pool) / 800.0)

def calc_unit_power(row, unit_prefix):
    u_atk = (row.get(f'{unit_prefix} ATK', 0) or 0) * 100
    t_atk = (row.get('Troop ATK', 0) or 0) * 100
    u_atk_b = (row.get(f'{unit_prefix} ATK Bless', 0) or 0) * 100
    t_atk_b = (row.get('Troop ATK Bless', 0) or 0) * 100
    u_def = (row.get(f'{unit_prefix} DEF', 0) or 0) * 100
    t_def = (row.get('Troop DEF', 0) or 0) * 100
    u_hp = (row.get(f'{unit_prefix} HP', 0) or 0) * 100
    t_hp = (row.get('Troop HP', 0) or 0) * 100
    u_prot_b = (row.get(f'{unit_prefix} PROT Bless', 0) or 0) * 100
    t_prot_b = (row.get('Troop PROT Bless', 0) or 0) * 100
    u_dmg = (row.get(f'{unit_prefix} DMG', 0) or 0) * 100
    t_dmg = (row.get('Troop DMG', 0) or 0) * 100
    u_dmgr = abs(row.get(f'{unit_prefix} DMG Recv', 0) or 0) * 100
    t_dmgr = abs(row.get('Troop DMG Recv', 0) or 0) * 100
    base_pool = (u_atk + t_atk) + 1.5 * (u_atk_b + t_atk_b)
    support_pool = 0.5 * ((u_def + t_def) + (u_hp + t_hp) + 1.5 * (u_prot_b + t_prot_b))
    mult_pool = (u_dmg + t_dmg) + 0.5 * (u_dmgr + t_dmgr)
    return math.ceil(((base_pool + support_pool) * mult_pool) / 1000.0)

df_master['guard_pow'] = df_master.apply(calc_guard_power, axis=1)
df_master['arc_pow'] = df_master.apply(lambda r: calc_unit_power(r, 'Archer'), axis=1)
df_master['cav_pow'] = df_master.apply(lambda r: calc_unit_power(r, 'Cav'), axis=1)
df_master['sg_pow'] = df_master.apply(lambda r: calc_unit_power(r, 'Siege'), axis=1)
df_master['tot_pow'] = df_master['arc_pow'] + df_master['cav_pow'] + df_master['sg_pow']

def get_tier_and_color(val, p80, p60, p40, p20, p95=None, p98=None):
    if p98 is not None and val >= p98: return 'S++', '#ef4444'
    if p95 is not None and val >= p95: return 'S+', '#f59e0b'
    if val >= p80: return 'S', '#10b981'
    elif val >= p60: return 'A', '#3b82f6'
    elif val >= p40: return 'B', '#8b5cf6'
    elif val >= p20: return 'C', '#64748b'
    else: return 'D', '#475569'

p_tot = np.percentile(df_master['tot_pow'], [20, 40, 60, 82, 94, 98])
p_arc = np.percentile(df_master['arc_pow'], [20, 40, 60, 82, 94, 98])
p_cav = np.percentile(df_master['cav_pow'], [20, 40, 60, 82, 94, 98])
p_sg = np.percentile(df_master['sg_pow'], [20, 40, 60, 82, 94, 98])

woc_leaders = {}
for kd, grp in df_master.groupby('Server'):
    best_row = grp.sort_values(by='guard_pow', ascending=False).iloc[0]
    woc_leaders[kd] = best_row['Player Name']

players_list = []
for idx, r in df_master.iterrows():
    p_name = str(r['Player Name']).strip()
    kd = str(r['Server']).strip()
    tot_tier, tot_col = get_tier_and_color(r['tot_pow'], p_tot[3], p_tot[2], p_tot[1], p_tot[0], p_tot[4], p_tot[5])
    arc_tier, arc_col = get_tier_and_color(r['arc_pow'], p_arc[3], p_arc[2], p_arc[1], p_arc[0], p_arc[4], p_arc[5])
    cav_tier, cav_col = get_tier_and_color(r['cav_pow'], p_cav[3], p_cav[2], p_cav[1], p_cav[0], p_cav[4], p_cav[5])
    sg_tier, sg_col = get_tier_and_color(r['sg_pow'], p_sg[3], p_sg[2], p_sg[1], p_sg[0], p_sg[4], p_sg[5])
    
    is_woc = (woc_leaders.get(kd) == p_name)
    
    player_obj = {
        'name': p_name,
        'server': kd,
        'archer_pow': int(r['arc_pow']),
        'cav_pow': int(r['cav_pow']),
        'siege_pow': int(r['sg_pow']),
        'total_pow': int(r['tot_pow']),
        'lethal': round(float(r.get('Lethal %', 0) or 0) * 100, 2),
        'lion_lvl': 0,
        'lion_dmg': 0,
        'troop_atk': round(float(r.get('Troop ATK', 0) or 0) * 100, 2),
        'troop_hp': round(float(r.get('Troop HP', 0) or 0) * 100, 2),
        'troop_def': round(float(r.get('Troop DEF', 0) or 0) * 100, 2),
        'troop_dmg': round(float(r.get('Troop DMG', 0) or 0) * 100, 2),
        'troop_dmgr': round(abs(float(r.get('Troop DMG Recv', 0) or 0)) * 100, 2),
        'troop_atk_bless': round(float(r.get('Troop ATK Bless', 0) or 0) * 100, 2),
        'troop_prot_bless': round(float(r.get('Troop PROT Bless', 0) or 0) * 100, 2),
        'inf_atk': round(float(r.get('Infantry ATK', 0) or 0) * 100, 2),
        'inf_hp': round(float(r.get('Infantry HP', 0) or 0) * 100, 2),
        'inf_def': round(float(r.get('Infantry DEF', 0) or 0) * 100, 2),
        'inf_dmg': round(float(r.get('Infantry DMG', 0) or 0) * 100, 2),
        'inf_dmgr': round(abs(float(r.get('Infantry DMG Recv', 0) or 0)) * 100, 2),
        'inf_atk_bless': round(float(r.get('Infantry ATK Bless', 0) or 0) * 100, 2),
        'inf_prot_bless': round(float(r.get('Infantry PROT Bless', 0) or 0) * 100, 2),
        'arc_atk': round(float(r.get('Archer ATK', 0) or 0) * 100, 2),
        'arc_hp': round(float(r.get('Archer HP', 0) or 0) * 100, 2),
        'arc_def': round(float(r.get('Archer DEF', 0) or 0) * 100, 2),
        'arc_dmg': round(float(r.get('Archer DMG', 0) or 0) * 100, 2),
        'arc_dmgr': round(abs(float(r.get('Archer DMG Recv', 0) or 0)) * 100, 2),
        'arc_atk_bless': round(float(r.get('Archer ATK Bless', 0) or 0) * 100, 2),
        'arc_prot_bless': round(float(r.get('Archer PROT Bless', 0) or 0) * 100, 2),
        'cav_atk': round(float(r.get('Cav ATK', 0) or 0) * 100, 2),
        'cav_hp': round(float(r.get('Cav HP', 0) or 0) * 100, 2),
        'cav_def': round(float(r.get('Cav DEF', 0) or 0) * 100, 2),
        'cav_dmg': round(float(r.get('Cav DMG', 0) or 0) * 100, 2),
        'cav_dmgr': round(abs(float(r.get('Cav DMG Recv', 0) or 0)) * 100, 2),
        'cav_atk_bless': round(float(r.get('Cav ATK Bless', 0) or 0) * 100, 2),
        'cav_prot_bless': round(float(r.get('Cav PROT Bless', 0) or 0) * 100, 2),
        'sg_atk': round(float(r.get('Siege ATK', 0) or 0) * 100, 2),
        'sg_hp': round(float(r.get('Siege HP', 0) or 0) * 100, 2),
        'sg_def': round(float(r.get('Siege DEF', 0) or 0) * 100, 2),
        'sg_dmg': round(float(r.get('Siege DMG', 0) or 0) * 100, 2),
        'sg_dmgr': round(abs(float(r.get('Siege DMG Recv', 0) or 0)) * 100, 2),
        'sg_atk_bless': round(float(r.get('Siege ATK Bless', 0) or 0) * 100, 2),
        'sg_prot_bless': round(float(r.get('Siege PROT Bless', 0) or 0) * 100, 2),
        'total_pow_tier': tot_tier,
        'total_pow_color': tot_col,
        'archer_pow_tier': arc_tier,
        'archer_pow_color': arc_col,
        'cav_pow_tier': cav_tier,
        'cav_pow_color': cav_col,
        'siege_pow_tier': sg_tier,
        'siege_pow_color': sg_col,
        'dgp': int(r['guard_pow']),
        'is_woc_leader': is_woc
    }
    for k, v in player_obj.items():
        if isinstance(v, float) and math.isnan(v):
            player_obj[k] = 0
    players_list.append(player_obj)

kd_chart_data = []
for kd, grp in df_master.groupby('Server'):
    grp_top25 = grp.sort_values('tot_pow', ascending=False).head(25)
    
    avg_tot = int(grp_top25['tot_pow'].mean())
    avg_arc = int(grp_top25['arc_pow'].mean())
    avg_cav = int(grp_top25['cav_pow'].mean())
    avg_sg = int(grp_top25['sg_pow'].mean())
    
    def count_tiers(metric):
        counts = {'S++': 0, 'S+': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}
        for _, pr in grp_top25.iterrows():
            if metric == 'total_pow':
                t, _ = get_tier_and_color(pr['tot_pow'], p_tot[3], p_tot[2], p_tot[1], p_tot[0], p_tot[4], p_tot[5])
            elif metric == 'archer_pow':
                t, _ = get_tier_and_color(pr['arc_pow'], p_arc[3], p_arc[2], p_arc[1], p_arc[0], p_arc[4], p_arc[5])
            elif metric == 'cav_pow':
                t, _ = get_tier_and_color(pr['cav_pow'], p_cav[3], p_cav[2], p_cav[1], p_cav[0], p_cav[4], p_cav[5])
            elif metric == 'siege_pow':
                t, _ = get_tier_and_color(pr['sg_pow'], p_sg[3], p_sg[2], p_sg[1], p_sg[0], p_sg[4], p_sg[5])
            counts[t] = counts.get(t, 0) + 1
        return counts

    kd_chart_data.append({
        'server': kd,
        'count': len(grp_top25),
        'avg_total': avg_tot,
        'avg_archer': avg_arc,
        'avg_cav': avg_cav,
        'avg_siege': avg_sg,
        'tiers': {
            'total_pow': count_tiers('total_pow'),
            'archer_pow': count_tiers('archer_pow'),
            'cav_pow': count_tiers('cav_pow'),
            'siege_pow': count_tiers('siege_pow')
        }
    })

summary_cols = [
    'name', 'server', 'total_pow', 'archer_pow', 'cav_pow', 'siege_pow',
    'total_pow_tier', 'total_pow_color', 'archer_pow_tier', 'archer_pow_color',
    'cav_pow_tier', 'cav_pow_color', 'siege_pow_tier', 'siege_pow_color',
    'dgp', 'is_woc_leader', 'lethal'
]
public_players_list = [{k: p[k] for k in summary_cols if k in p} for p in players_list]

with open('src/data/players.json', 'w') as f:
    json.dump(players_list, f, indent=2)

with open('src/data/public_players.json', 'w') as f:
    json.dump(public_players_list, f, indent=2)

with open('src/data/kingdoms.json', 'w') as f:
    json.dump(kd_chart_data, f, indent=2)

print("JSON files successfully built from master_database.csv!")
