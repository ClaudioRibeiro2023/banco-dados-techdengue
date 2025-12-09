import os, csv, psycopg2, json, unicodedata, math
from typing import List, Dict, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'dados', 'deng')
FILE_2024 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG24.prn'))
FILE_2025 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG25.prn'))


def load_env(path: str = ".env") -> Dict[str, str]:
    env = {}
    p = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', path))
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            for line in f:
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


def parse_prn(path: str) -> Tuple[int, List[Tuple[str, str, int]]]:
    rows = _read_rows(path)
    if not rows:
        return 0, []
    header = [h.strip().strip('"') for h in rows[0]]
    week_cols = [i for i, h in enumerate(header) if h.startswith('Semana')]
    se_max = len(week_cols)
    out = []
    for r in rows[1:]:
        if not r:
            continue
        first = r[0].strip().strip('"')
        if ' ' in first:
            code, name = first.split(' ', 1)
        else:
            code, name = first, first
        s = 0
        for i in week_cols[:se_max]:
            try:
                s += int(r[i])
            except Exception:
                try:
                    s += int(float(str(r[i]).replace(',', '.')))
                except Exception:
                    s += 0
        out.append((code, name, s))
    return se_max, out


def build_maps(data: List[Tuple[str, str, int]]) -> Tuple[Dict[str, int], Dict[str, str]]:
    m = {}
    names = {}
    for code, name, total in data:
        nn = normalize(name)
        m[nn] = int(total or 0)
        names[nn] = name
    return m, names


def fetch_mg_pois() -> Dict[str, int]:
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
        WHERE sigla_uf = 'MG'
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
    se, dat25 = parse_prn(FILE_2025)
    _, dat24 = parse_prn(FILE_2024)
    map25, names = build_maps(dat25)
    map24, _ = build_maps(dat24)

    # Totais MG
    tot24 = sum(map24.values())
    tot25 = sum(map25.values())
    redu_tot = ((tot25 - tot24) / tot24 * 100) if tot24 else None
    abs_tot = tot24 - tot25

    # Distribuição de variação por município
    rows = []
    for key, nm in names.items():
        y24 = map24.get(key, 0)
        y25 = map25.get(key, 0)
        pct = ((y25 - y24) / y24 * 100) if y24 else None
        rows.append((nm, y24, y25, pct))

    # Top quedas absolutas (filtro y24>=200)
    drops = [(nm, y24, y25, (y24 - y25), ((y25 - y24) / y24 * 100 if y24 else None)) for nm, y24, y25, _ in rows if y24 >= 200]
    drops.sort(key=lambda x: x[3], reverse=True)
    top10_drops = drops[:10]

    # Aumentos
    incs = [(nm, y24, y25, (y25 - y24), ((y25 - y24) / y24 * 100 if y24 else None)) for nm, y24, y25, _ in rows if y25 > y24]
    incs.sort(key=lambda x: (x[4] if x[4] is not None else -9999), reverse=True)
    top10_incs = incs[:10]

    # Buckets
    def bucket(p):
        if p is None:
            return 'sem_base_2024'
        if p <= -90:
            return '≤ -90%'
        if p <= -80:
            return '(-90%, -80%]'
        if p <= -50:
            return '(-80%, -50%]'
        if p <= -10:
            return '(-50%, -10%]'
        if p <= +10:
            return '(-10%, +10%]'
        return '> +10%'

    buckets = {}
    for _, y24, y25, pct in rows:
        b = bucket(((y25 - y24) / y24 * 100) if y24 else None)
        buckets[b] = buckets.get(b, 0) + 1

    # Contribuintes
    contribs = [(nm, (y24 - y25)) for nm, y24, y25, _ in rows if y24 > y25]
    contribs.sort(key=lambda x: x[1], reverse=True)
    top10_contribs = contribs[:10]

    # Zerados (2025==0 e 2024>0)
    zerados = [nm for nm, y24, y25, _ in rows if y24 > 0 and y25 == 0]
    zerados.sort()

    # Correlação com POIs (DB MG)
    pois = fetch_mg_pois()
    join = []
    for key, nm in names.items():
        p = pois.get(normalize(nm), 0)
        y24 = map24.get(normalize(nm), 0)
        y25 = map25.get(normalize(nm), 0)
        redu_pos = None
        if y24 > 0:
            redu_pos = max(0.0, 1.0 - (y25 / y24))
        join.append((nm, p, y24, y25, redu_pos))
    join = [r for r in join if r[2] > 0]
    x = [float(r[1]) for r in join]
    y = [float(r[4]) for r in join if r[4] is not None]
    # need equal lengths; filter keeping only with redu_pos
    join2 = [r for r in join if r[4] is not None]
    x2 = [float(r[1]) for r in join2]
    y2 = [float(r[4]) for r in join2]
    r_val = pearson(x2, y2)

    # Watchlist/eficiência
    if join2:
        pois_sorted = sorted(x2)
        red_sorted = sorted(y2)
        q_pois = pois_sorted[int(0.75 * len(pois_sorted))]
        q_red_low = red_sorted[int(0.25 * len(red_sorted))]
        q_red_high = red_sorted[int(0.75 * len(red_sorted))]
    else:
        q_pois = q_red_low = q_red_high = 0

    watch = [r for r in join2 if r[1] >= q_pois and r[4] <= q_red_low]
    watch.sort(key=lambda t: (t[4], -t[1]))
    watch = watch[:10]

    eff = [r for r in join2 if r[1] <= (pois_sorted[int(0.25*len(pois_sorted))] if join2 else 0) and r[4] >= q_red_high]
    eff.sort(key=lambda t: (-t[4], t[1]))
    eff = eff[:10]

    # Markdown
    md = []
    md.append(f"Semana limite considerada no arquivo de 2025: {se:02d}")
    md.append("")
    md.append("#### 7.1 Sumário (Minas Gerais)")
    md.append("")
    md.append(f"Total 2024 (até SE {se:02d}): {tot24}")
    md.append("")
    md.append(f"Total 2025 (até SE {se:02d}): {tot25}")
    md.append("")
    md.append(f"Redução total: {redu_tot:+.1f}%")

    md.append("")
    md.append("#### 7.2 Distribuição por faixas de variação (2025 vs 2024)")
    md.append("")
    md.append("| Faixa | Municípios |")
    md.append("|-------|-----------:|")
    for label in ['≤ -90%', '(-90%, -80%]', '(-80%, -50%]', '(-50%, -10%]', '(-10%, +10%]', '> +10%', 'sem_base_2024']:
        if label in buckets:
            md.append(f"| {label} | {buckets[label]} |")

    md.append("")
    md.append("#### 7.3 Top 10 Maiores Reduções (absolutas)")
    md.append("| Município | 2024 | 2025 | Queda abs. | Redução % |")
    md.append("|-----------|-----:|-----:|-----------:|----------:|")
    for nm, y24, y25, absd, pct in top10_drops:
        pct_str = f"{pct:+.1f}%" if pct is not None else "—"
        md.append(f"| {nm} | {y24} | {y25} | {absd} | {pct_str} |")

    if top10_incs:
        md.append("")
        md.append("#### 7.4 Municípios com Aumento (Top 10 por %)")
        md.append("| Município | 2024 | 2025 | Aumento abs. | Variação % |")
        md.append("|-----------|-----:|-----:|------------:|-----------:|")
        for nm, y24, y25, absi, pct in top10_incs:
            pct_str = f"{pct:+.1f}%" if pct is not None else "—"
            md.append(f"| {nm} | {y24} | {y25} | {absi} | {pct_str} |")

    if top10_contribs:
        md.append("")
        md.append("#### 7.5 Principais Contribuidores da Redução (Top 10)")
        md.append("| Município | Queda abs. | % do total de redução |")
        md.append("|-----------|-----------:|-----------------------:|")
        for nm, absd in top10_contribs:
            share = (absd / abs_tot * 100) if abs_tot > 0 else 0.0
            md.append(f"| {nm} | {absd} | {share:.1f}% |")

    md.append("")
    md.append(f"#### 7.6 Municípios zerados em 2025 (até SE {se:02d})")
    md.append("")
    if zerados:
        for nm in zerados[:20]:
            md.append(f"- {nm}")
        if len(zerados) > 20:
            md.append(f"- (+{len(zerados)-20} outros)")
    else:
        md.append("- Nenhum")

    md.append("")
    md.append("#### 7.7 Correlação POIs x Redução (MG)")
    md.append("")
    md.append(f"- Pearson r: {r_val:.3f}")
    md.append("- Interpretação: correlação fraca; execução local e sazonalidade influem")

    if watch:
        md.append("")
        md.append("#### 7.8 Watchlist: alto POI e baixa redução")
        md.append("| Município | POIs (DB) | 2024 | 2025 | Redução% |")
        md.append("|-----------|----------:|-----:|-----:|---------:|")
        for nm, p, y24, y25, rp in watch:
            pct = ((y25 - y24) / y24 * 100) if y24 else None
            pct_str = f"{pct:+.1f}%" if pct is not None else "—"
            md.append(f"| {nm} | {p} | {y24} | {y25} | {pct_str} |")

    if eff:
        md.append("")
        md.append("#### 7.9 Eficiência local: baixo POI e alta redução")
        md.append("| Município | POIs (DB) | 2024 | 2025 | Redução% |")
        md.append("|-----------|----------:|-----:|-----:|---------:|")
        for nm, p, y24, y25, rp in eff:
            pct = ((y25 - y24) / y24 * 100) if y24 else None
            pct_str = f"{pct:+.1f}%" if pct is not None else "—"
            md.append(f"| {nm} | {p} | {y24} | {y25} | {pct_str} |")

    print("\n".join(md))

    # export
    exports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dados', 'exports'))
    os.makedirs(exports_dir, exist_ok=True)
    out_path = os.path.join(exports_dir, 'dengue_mg.md')
    with open(out_path, 'w', encoding='utf-8') as fo:
        fo.write("\n".join(md))
    print(f"\n[export] {out_path}")

if __name__ == '__main__':
    main()
