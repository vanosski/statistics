import json
import urllib.request
import urllib.error
import ssl
import os

# Bypass SSL verification for local script execution on Mac
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Load env variables from .env
env = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            parts = line.split('=', 1)
            if len(parts) == 2:
                env[parts[0]] = parts[1]

SUPABASE_URL = env.get('VITE_SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def upsert_to_supabase(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict=name,server"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' # Handles upsert on primary key/unique constraint
    }
    
    for batch in chunked(data, 1000):
        req = urllib.request.Request(url, data=json.dumps(batch).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req, context=ctx) as response:
                print(f"Successfully upserted {len(batch)} rows to {table}. Status: {response.status}")
        except urllib.error.HTTPError as e:
            print(f"HTTPError: {e.code} - {e.reason}")
            print(e.read().decode('utf-8'))
        except Exception as e:
            print(f"Exception: {e}")

# Load the local json
with open('src/data/players.json', 'r') as f:
    players = json.load(f)

# Split into summary and detailed
summary_cols = [
    'name', 'server', 'total_pow', 'archer_pow', 'cav_pow', 'siege_pow',
    'total_pow_tier', 'total_pow_color', 'archer_pow_tier', 'archer_pow_color',
    'cav_pow_tier', 'cav_pow_color', 'siege_pow_tier', 'siege_pow_color',
    'dgp', 'is_woc_leader'
]

summary_data = []
detailed_data = []

for p in players:
    s_row = {k: p.get(k) for k in summary_cols}
    
# Extract detailed fields
    d_row = {k: v for k, v in p.items() if k not in summary_cols}
    # name and server must be present in detailed_data to link them and satisfy constraints
    d_row['name'] = p['name']
    d_row['server'] = p['server']
    
    detailed_data.append(d_row)

print("Upserting detailed data...")
upsert_to_supabase('players_detailed', detailed_data)
print("Done!")
