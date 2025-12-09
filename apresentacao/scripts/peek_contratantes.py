import os, psycopg2
from collections import Counter

def load_env(path: str = ".env"):
    env = {}
    if os.path.exists(path):
        for line in open(path, 'r', encoding='utf-8'):
            line=line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k,v=line.split('=',1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

e = {**load_env(), **os.environ}
conn = psycopg2.connect(
    host=e.get('DB_HOST'),
    port=int(e.get('DB_PORT','5432')),
    database=e.get('DB_NAME'),
    user=e.get('DB_USER'),
    password=e.get('DB_PASSWORD'),
    sslmode=e.get('DB_SSLMODE','require')
)
cur = conn.cursor()
cur.execute("""
    SELECT contratante, COUNT(*) AS total
    FROM banco_techdengue
    GROUP BY contratante
    ORDER BY total DESC
    LIMIT 100
""")
rows = cur.fetchall()
for i,(c,t) in enumerate(rows,1):
    print(f"{i:2d}. {c} | {t}")
cur.close()
conn.close()
