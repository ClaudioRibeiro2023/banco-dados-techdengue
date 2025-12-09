import os, psycopg2, json

def load_env(path: str = ".env"):
    env = {}
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
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
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type='BASE TABLE'
      AND table_schema NOT IN ('pg_catalog','information_schema')
      AND (
        table_name ILIKE '%dengue%' OR table_name ILIKE '%sinan%' OR table_name ILIKE '%caso%'
      )
    ORDER BY table_schema, table_name
"""
)
rows = cur.fetchall()
results = []
for schema, table in rows:
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema=%s AND table_name=%s
        ORDER BY ordinal_position
    """, (schema, table))
    cols = cur.fetchall()
    results.append({
        'schema': schema,
        'table': table,
        'columns': cols
    })
print(json.dumps(results, ensure_ascii=False, indent=2))
cur.close()
conn.close()
