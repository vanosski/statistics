import pandas as pd
import subprocess

def clean_val(v):
    if isinstance(v, str):
        return v.strip()
    return v

# Read master db
master = pd.read_csv('master_database.csv')

# Read new CSVs
k162_new = pd.read_csv('K162_All_Stats.csv').dropna(how='all')
k292_new = pd.read_csv('K292_All_Stats.csv').dropna(how='all')

# Clean
k162_new = k162_new.dropna(subset=['Player Name'])
k292_new = k292_new.dropna(subset=['Player Name'])

k162_new['Server'] = 'K162'
k292_new['Server'] = 'K292'

# Combine new players
new_players = pd.concat([k162_new, k292_new], ignore_index=True)

# Remove existing rows for these kingdoms (upsert logic)
servers_to_update = new_players['Server'].unique().tolist()
master_filtered = master[~master['Server'].isin(servers_to_update)]

# Concat
updated = pd.concat([master_filtered, new_players], ignore_index=True)
updated.to_csv('master_database.csv', index=False, encoding='utf-8')

print(f"Added {len(new_players)} players ({', '.join(servers_to_update)})")
print(f"Total rows now: {len(updated)}")

print("\nRunning build_json.py...")
res = subprocess.run(['python3', 'build_json.py'], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print("Error:", res.stderr)
