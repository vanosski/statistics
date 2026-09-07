import pandas as pd
import math
import numpy as np
import csv

def parse_pct(val):
    if pd.isna(val) or val == '': return 0.0
    if isinstance(val, str):
        val = val.replace('%', '').replace('+', '').replace(',', '')
    try: return float(val) / 100.0
    except: return 0.0

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

# Read master db
df = pd.read_csv('master_database.csv')
original_df = df.copy()

# Parse percentages for power calc
pct_cols = [c for c in df.columns if c not in ['Server', 'Player Name']]
for c in pct_cols:
    df[c] = df[c].apply(parse_pct)

# Calc power
df['arc_pow'] = df.apply(lambda r: calc_unit_power(r, 'Archer'), axis=1)
df['cav_pow'] = df.apply(lambda r: calc_unit_power(r, 'Cav'), axis=1)
df['sg_pow'] = df.apply(lambda r: calc_unit_power(r, 'Siege'), axis=1)
df['tot_pow'] = df['arc_pow'] + df['cav_pow'] + df['sg_pow']

# Find 3 weakest K162 players
k162 = df[df['Server'] == 'K162']
k162_sorted = k162.sort_values(by='tot_pow', ascending=True)
weakest_3 = k162_sorted.head(3)['Player Name'].tolist()
print("Removing 3 weakest players from K162:", weakest_3)

# Remove from original dataframe
new_df = original_df[~((original_df['Server'] == 'K162') & (original_df['Player Name'].isin(weakest_3)))]
new_df.to_csv('master_database.csv', index=False)

