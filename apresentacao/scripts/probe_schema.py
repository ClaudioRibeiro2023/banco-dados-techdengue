import os, sys, json
import psycopg2

def load_env_from_dotenv(path: str = ".env"):
    if not os.path.exists(path):
        return {}
    env = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

local_env = load_env_from_dotenv()

host = os.environ.get("DB_HOST") or local_env.get("DB_HOST")
port = int(os.environ.get("DB_PORT") or local_env.get("DB_PORT", "5432"))
db = os.environ.get("DB_NAME") or local_env.get("DB_NAME")
user = os.environ.get("DB_USER") or local_env.get("DB_USER")
password = os.environ.get("DB_PASSWORD") or local_env.get("DB_PASSWORD")
sslmode = os.environ.get("DB_SSLMODE") or local_env.get("DB_SSLMODE", "require")

table = os.environ.get("DB_TABLE", "banco_techdengue")

out = {"ok": False, "error": None, "table": table, "columns": [], "candidates": {}}

try:
    conn = psycopg2.connect(host=host, port=port, database=db, user=user, password=password, sslmode=sslmode)
    cur = conn.cursor()
    cur.execute("select column_name, data_type from information_schema.columns where table_name=%s order by ordinal_position", (table,))
    rows = cur.fetchall()
    out["columns"] = [{"name": r[0], "type": r[1]} for r in rows]
    names = [r[0].lower() for r in rows]

    candidates_hec = ["hectares_mapeados","hectares","area_mapeada_ha","area_ha","hectares_totais","hect","area_km2"]
    candidates_dev = ["devolutivas","qtd_devolutivas","devolutiva","retornos","followup","follow_up","acoes_realizadas"]

    out["candidates"]["hectares"] = [c for c in candidates_hec if c in names]
    out["candidates"]["devolutivas"] = [c for c in candidates_dev if c in names]
    out["ok"] = True
    cur.close()
    conn.close()
except Exception as e:
    out["error"] = str(e)

print(json.dumps(out, ensure_ascii=False, indent=2))
