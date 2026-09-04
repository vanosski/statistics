import os
import urllib.request
import urllib.error
import ssl

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

players_to_delete = ["(aaa)PAJDAA", "(aaa)foreverSparta", "(aaa)珍珠米"]

for p in players_to_delete:
    encoded_name = urllib.parse.quote(p)
    url = f"{SUPABASE_URL}/rest/v1/players_detailed?name=eq.{encoded_name}&server=eq.K162"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    
    req = urllib.request.Request(url, headers=headers, method='DELETE')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            print(f"Deleted {p}")
    except urllib.error.HTTPError as e:
        print(f"HTTPError for {p}: {e.code}")

