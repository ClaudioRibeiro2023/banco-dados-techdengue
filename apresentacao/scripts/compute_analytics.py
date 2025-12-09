import os, json, psycopg2
from datetime import date

def load_env(path: str = ".env"):
    env = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line=line.strip()
                if not line or line.startswith('#') or '=' not in line: continue
                k,v=line.split('=',1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def connect():
    e = {**load_env(), **os.environ}
    conn = psycopg2.connect(
        host=e.get('DB_HOST'),
        port=int(e.get('DB_PORT','5432')),
        database=e.get('DB_NAME'),
        user=e.get('DB_USER'),
        password=e.get('DB_PASSWORD'),
        sslmode=e.get('DB_SSLMODE','require')
    )
    return conn

def fetchall(cur, q, params=None):
    cur.execute(q, params or {})
    return cur.fetchall()

def as_dict(rows, cols):
    return [dict(zip(cols, r)) for r in rows]

def analytics_montes_claros(cur, start=None, end=None):
    contractor = "%CISARP%MONTES CLAROS%"
    q_base = f"""
        FROM banco_techdengue
        WHERE contratante ILIKE %s
    """
    # Totais
    total = fetchall(cur, f"SELECT COUNT(*) {q_base}", (contractor,))[0][0]
    devol = fetchall(cur, f"SELECT SUM(CASE WHEN devolutiva IS NOT NULL AND devolutiva::text<>'' THEN 1 ELSE 0 END) {q_base}", (contractor,))[0][0]
    # Período
    r = fetchall(cur, f"SELECT MIN(data_criacao), MAX(data_criacao) {q_base}", (contractor,))[0]
    dmin, dmax = r
    # Top municípios
    rows = fetchall(cur, f"""
        SELECT nm_mun, cd_mun, COUNT(*) AS pois
        {q_base}
        GROUP BY nm_mun, cd_mun
        ORDER BY pois DESC
        LIMIT 10
    """, (contractor,))
    top_mun = [ {"municipio": a, "cod_ibge": b, "pois": int(c)} for a,b,c in rows ]
    # Série mensal
    rows = fetchall(cur, f"""
        SELECT date_trunc('month', data_criacao)::date AS mes,
               COUNT(*) AS pois,
               SUM(CASE WHEN devolutiva IS NOT NULL AND devolutiva::text<>'' THEN 1 ELSE 0 END) AS devolutivas
        {q_base}
        GROUP BY 1
        ORDER BY 1
    """, (contractor,))
    monthly = [ {"mes": str(a), "pois": int(b), "devolutivas": int(c)} for a,b,c in rows ]
    return {
        "contractor": "CISARP - ZURS MONTES CLAROS",
        "periodo": {"inicio": str(dmin) if dmin else None, "fim": str(dmax) if dmax else None},
        "pois_total": int(total or 0),
        "devolutivas_total": int(devol or 0),
        "top_municipios": top_mun,
        "mensal": monthly
    }

def ranking_mg(cur, start=None, end=None):
    q = """
        SELECT contratante, COUNT(*)::bigint AS pois
        FROM banco_techdengue
        WHERE sigla_uf = 'MG'
        GROUP BY contratante
        ORDER BY pois DESC
    """
    rows = fetchall(cur, q)
    ranking = [ {"contratante": a, "pois": int(b)} for a,b in rows ]
    # posição de CISARP - ZURS MONTES CLAROS
    pos = next((i+1 for i,x in enumerate(ranking) if 'CISARP' in (x['contratante'] or '').upper() and 'MONTES CLAROS' in (x['contratante'] or '').upper()), None)
    cisarp_pois = next((x['pois'] for x in ranking if 'CISARP' in (x['contratante'] or '').upper() and 'MONTES CLAROS' in (x['contratante'] or '').upper()), None)
    top10 = ranking[:10]
    return {
        "metric": "POIS",
        "total_contratantes": len(ranking),
        "top10": top10,
        "cisarp_mc_pos": pos,
        "cisarp_mc_pois": cisarp_pois
    }

def main():
    e = {**load_env(), **os.environ}
    start = e.get('DEFAULT_START_DATE')
    end = e.get('DEFAULT_END_DATE')
    with connect() as conn:
        with conn.cursor() as cur:
            mc = analytics_montes_claros(cur, start, end)
            rk = ranking_mg(cur, start, end)
    print(json.dumps({"montes_claros": mc, "ranking_mg": rk}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
