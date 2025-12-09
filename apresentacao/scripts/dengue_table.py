import os, csv, json, unicodedata
from typing import List, Dict, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'dados', 'deng')
FILE_2023 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG23.prn'))
FILE_2024 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG24.prn'))
FILE_2025 = os.path.abspath(os.path.join(DATA_DIR, 'DENGMG25.prn'))
CISARP_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dados', 'cisarp_dados_validados.csv'))

# Semana epidemiológica limite solicitada
SE_LIMIT = 42


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


def _read_rows(path: str):
    # PRN com separador vírgula e aspas; tentar múltiplos encodings
    for enc in ('utf-8-sig', 'cp1252', 'latin-1'):
        try:
            with open(path, 'r', encoding=enc, newline='') as f:
                reader = csv.reader(f)
                return list(reader)
        except UnicodeDecodeError:
            continue
    # última tentativa binária -> decodificar como latin-1
    with open(path, 'rb') as fb:
        data = fb.read().decode('latin-1', errors='ignore')
    return list(csv.reader(data.splitlines()))


def normalize_name(s: str) -> str:
    s = s.strip()
    s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode('ASCII')
    return s.upper()


def parse_prn(path: str) -> Tuple[List[str], List[Dict]]:
    rows = _read_rows(path)
    if not rows:
        return [], []
    header = [h.strip().strip('"') for h in rows[0]]
    # identificar colunas de semanas e total
    week_cols = [i for i, h in enumerate(header) if h.startswith('Semana')]
    # última semana disponível = última coluna Semana
    se_max = len(week_cols)
    records = []
    for r in rows[1:]:
        if not r:
            continue
        first = r[0].strip().strip('"')
        if ' ' in first:
            code, name = first.split(' ', 1)
        else:
            code, name = first, first
        # converter semanas até se_max
        weeks = []
        for i in week_cols[:se_max]:
            try:
                weeks.append(int(r[i]))
            except Exception:
                try:
                    weeks.append(int(float(r[i].replace(',', '.'))))
                except Exception:
                    weeks.append(0)
        total = 0
        try:
            total = int(r[-1])
        except Exception:
            try:
                total = int(float(r[-1].replace(',', '.')))
            except Exception:
                total = sum(weeks)
        records.append({
            'code': code,
            'name': name,
            'weeks': weeks,
            'se_max': se_max,
            'total': total,
        })
    return header, records


def build_sum_map(records: List[Dict], se_max: int) -> Dict[str, int]:
    m = {}
    for rec in records:
        name_norm = normalize_name(rec['name'])
        s = sum(rec['weeks'][:se_max])
        m[name_norm] = s
    return m


def fetch_cisarp_municipalities() -> List[str]:
    """Lê municípios CISARP a partir do CSV validado local."""
    names = set()
    try:
        with open(CISARP_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                mun = (row.get('Municipio') or row.get('MUNICIPIO') or row.get('municipio') or '').strip()
                if mun:
                    names.add(mun)
    except Exception:
        pass
    return sorted(names)


def main():
    # Carregar PRNs 2023-2025
    h25, rec25 = parse_prn(FILE_2025)
    if not rec25:
        raise SystemExit('Arquivo 2025 vazio ou inválido')
    h24, rec24 = parse_prn(FILE_2024)
    if not rec24:
        raise SystemExit('Arquivo 2024 vazio ou inválido')
    h23, rec23 = parse_prn(FILE_2023)
    if not rec23:
        raise SystemExit('Arquivo 2023 vazio ou inválido')

    # Semana limite efetiva (até SE 42 ou o mínimo disponível entre os arquivos)
    se_limit = min(SE_LIMIT, rec23[0]['se_max'], rec24[0]['se_max'], rec25[0]['se_max'])

    # Mapas de soma por município normalizado
    map23 = build_sum_map(rec23, se_limit)
    map24 = build_sum_map(rec24, se_limit)
    map25 = build_sum_map(rec25, se_limit)

    # Municípios CISARP a partir do CSV validado
    cisarp_names = fetch_cisarp_municipalities()
    cisarp_norm = [normalize_name(n) for n in cisarp_names]

    # Construir linhas
    rows = []
    for original, name_norm in zip(cisarp_names, cisarp_norm):
        y23 = map23.get(name_norm, 0)
        y24 = map24.get(name_norm, 0)
        y25 = map25.get(name_norm, 0)
        rows.append((original, y23, y24, y25))

    # Ordenar por 2025 desc
    rows.sort(key=lambda x: x[3], reverse=True)

    # Emitir markdown base
    md_lines = []
    md_lines.append(f"Semana limite considerada: SE {se_limit:02d}")
    md_lines.append("")
    md_lines.append(f"| Município | 2023 (até SE {se_limit:02d}) | 2024 (até SE {se_limit:02d}) | 2025 (até SE {se_limit:02d}) |")
    md_lines.append("|-----------|----------------------------:|----------------------------:|----------------------------:|")
    for mun, y23, y24, y25 in rows:
        md_lines.append(f"| {mun} | {y23} | {y24} | {y25} |")

    # Totais gerais
    tot23 = sum(y23 for _, y23, _, _ in rows)
    tot24 = sum(y24 for _, _, y24, _ in rows)
    tot25 = sum(y25 for _, _, _, y25 in rows)
    md_lines.append("")
    md_lines.append("| Total | {0} | {1} | {2} |".format(tot23, tot24, tot25))

    # Print no console
    print("\n".join(md_lines))

    # Exportar para docs_cr/cisarp
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs_cr', 'cisarp'))
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'DENGUE_CISARP_SE42.md')
    with open(out_path, 'w', encoding='utf-8') as fo:
        fo.write("\n".join(md_lines))
    print(f"\n[export] {out_path}")

if __name__ == '__main__':
    main()
