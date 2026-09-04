import pandas as pd
import os
import urllib.request
import urllib.parse
import ssl

# 1. Remove from CSV
df = pd.read_csv('master_database.csv')
new_df = df[~((df['Server'] == 'K27') & (df['Player Name'] == '(277)OYKU'))]
new_df.to_csv('master_database.csv', index=False)
print("Removed (277)OYKU from master_database.csv")

# 2. Delete from Supabase
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

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

p = "(277)OYKU"
encoded_name = urllib.parse.quote(p)
url = f"{SUPABASE_URL}/rest/v1/players_detailed?name=eq.{encoded_name}&server=eq.K27"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

req = urllib.request.Request(url, headers=headers, method='DELETE')
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print(f"Deleted {p} from Supabase")
except Exception as e:
    print(f"Error deleting from Supabase: {e}")

