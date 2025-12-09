import os, csv, psycopg2, unicodedata, math
from typing import Dict, List, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'dados', 'deng')
FILE_2024 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG24.prn'))
FILE_2025 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG25.prn'))


def load_env(path: str = ".env") -> Dict[str, str]:
    env = {}
    p = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', path))
    if os.path.exists(p):
        for line in open(p, 'r', encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def _read_rows(path: str) -> List[List[str]]:
    for enc in ('utf-8-sig', 'cp1252', 'latin-1'):
        try:
            with open(path, 'r', encoding=enc, newline='') as f:
                return list(csv.reader(f))
        except UnicodeDecodeError:
            continue
    with open(path, 'rb') as fb:
        data = fb.read().decode('latin-1', errors='ignore')
    return list(csv.reader(data.splitlines()))


def normalize(s: str) -> str:
    s = s.strip()
    s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode('ASCII')
    return s.upper()


def parse_prn(path: str) -> Tuple[int, Dict[str, int]]:
    rows = _read_rows(path)
    if not rows:
        return 0, {}
    header = [h.strip().strip('"') for h in rows[0]]
    week_cols = [i for i, h in enumerate(header) if h.startswith('Semana')]
    se_max = len(week_cols)
    totals = {}
    for r in rows[1:]:
        if not r:
            continue
        first = r[0].strip().strip('"')
        if ' ' in first:
            _, name = first.split(' ', 1)
        else:
            name = first
        name_n = normalize(name)
        s = 0
        for i in week_cols[:se_max]:
            try:
                s += int(r[i])
            except Exception:
                try:
                    s += int(float(str(r[i]).replace(',', '.')))
                except Exception:
                    s += 0
        totals[name_n] = s
    return se_max, totals


def fetch_cisarp_pois() -> Dict[str, int]:
    env = {**load_env(), **os.environ}
    conn = psycopg2.connect(
        host=env.get('DB_HOST'),
        port=int(env.get('DB_PORT', '5432')),
        database=env.get('DB_NAME'),
        user=env.get('DB_USER'),
        password=env.get('DB_PASSWORD'),
        sslmode=env.get('DB_SSLMODE', 'require')
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT nm_mun, COUNT(*) AS pois
        FROM banco_techdengue
        WHERE contratante ILIKE '%CISARP%MONTES CLAROS%'
          AND sigla_uf = 'MG'
        GROUP BY nm_mun
    """)
    m = {}
    for nm, pois in cur.fetchall():
        if nm:
            m[normalize(nm)] = int(pois or 0)
    cur.close(); conn.close()
    return m


def pearson(x: List[float], y: List[float]) -> float:
    n = len(x)
    if n == 0:
        return float('nan')
    sx = sum(x); sy = sum(y)
    sxx = sum(v*v for v in x); syy = sum(v*v for v in y)
    sxy = sum(a*b for a,b in zip(x,y))
    num = n*sxy - sx*sy
    den = math.sqrt((n*sxx - sx*sx) * (n*syy - sy*sy))
    if den == 0:
        return float('nan')
    return num/den


def main():
    se, y25 = parse_prn(FILE_2025)
    _, y24 = parse_prn(FILE_2024)
    pois = fetch_cisarp_pois()

    # Join por nome normalizado
    rows = []
    for name_n, pois_cnt in pois.items():
        c24 = y24.get(name_n, 0)
        c25 = y25.get(name_n, 0)
        redu = None
        redu_pos = None
        if c24 > 0:
            redu = (c25 - c24) / c24 * 100.0
            redu_pos = max(0.0, 1.0 - (c25 / c24))  # 0..1
        rows.append((name_n, pois_cnt, c24, c25, redu, redu_pos))

    # Filtrar só os com base 2024
    rows = [r for r in rows if r[2] > 0]
    x = [float(r[1]) for r in rows]
    y = [float(r[5]) for r in rows]  # redução positiva
    r = pearson(x, y)

    # Outliers: alto POI e baixa redução (watchlist) e baixo POI e alta redução
    # Definir thresholds por quantis simples
    if rows:
        sorted_pois = sorted(x)
        sorted_red = sorted(y)
        q_pois = sorted_pois[int(0.75*len(sorted_pois))]
        q_red = sorted_red[int(0.25*len(sorted_red))]
        q_red_high = sorted_red[int(0.75*len(sorted_red))]
    else:
        q_pois = q_red = q_red_high = 0

    watch = [r for r in rows if r[1] >= q_pois and (r[5] is not None and r[5] <= q_red)]
    watch.sort(key=lambda t: (t[5], -t[1]))  # menor redução e maior POI primeiro
    watch = watch[:10]

    eff = [r for r in rows if r[1] <= (sorted_pois[int(0.25*len(sorted_pois))] if rows else 0) and (r[5] is not None and r[5] >= q_red_high)]
    eff.sort(key=lambda t: (-t[5], t[1]))  # maior redução e menor POI primeiro
    eff = eff[:10]

    print(f"Pearson r (POIs vs redução positiva 2025 vs 2024 até SE {se:02d}): {r:.3f}")
    print("\nWatchlist: Alto POI e baixa redução")
    for n, p, c24, c25, rd, rp in watch:
        print(f"- {n.title()} | POIs={p} | 2024={c24} | 2025={c25} | Redução%={(rd if rd is None else round(rd,1))}")
    print("\nEficiência local: Baixo POI e alta redução")
    for n, p, c24, c25, rd, rp in eff:
        print(f"- {n.title()} | POIs={p} | 2024={c24} | 2025={c25} | Redução%={(rd if rd is None else round(rd,1))}")

if __name__ == '__main__':
    main()
