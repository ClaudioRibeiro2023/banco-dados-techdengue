"""Lista municípios pertencentes ao consórcio CISAJE
usando a planilha Atividades Techdengue.xlsx (aba 'Atividades (com sub)').

Saída é salva em arquivo TXT para fácil leitura.
"""

from pathlib import Path
import unicodedata

import pandas as pd


BASE_DIR = Path(__file__).parent.parent
ATIVIDADES_PATH = BASE_DIR / "base_dados" / "dados_techdengue" / "Atividades Techdengue.xlsx"
OUTPUT_FILE = BASE_DIR / "output_cisaje_municipios.txt"


def _normalize_text(value: str) -> str:
    """Normaliza texto para comparação (sem acentos, maiúsculo)."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    s = str(value).strip()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    return s.upper()


def _normalize_ibge(value):
    """Normaliza código IBGE para string de 7 dígitos."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    s = str(value).strip()
    if s.endswith(".0"):
        s = s[:-2]
    if not s.isdigit():
        return None
    return s.zfill(7)


def listar_municipios_cisaje() -> None:
    output_lines = []
    
    output_lines.append(f"Lendo planilha de atividades: {ATIVIDADES_PATH}")
    df = pd.read_excel(ATIVIDADES_PATH, sheet_name="Atividades (com sub)")
    df.columns = [str(c).strip() for c in df.columns]

    if "CONTRATANTE" not in df.columns:
        raise RuntimeError("Coluna 'CONTRATANTE' não encontrada na planilha de atividades")

    # Listar TODOS os contratantes únicos primeiro
    contratantes_unicos = df["CONTRATANTE"].dropna().unique()
    output_lines.append(f"\n=== LISTA COMPLETA DE CONTRATANTES ({len(contratantes_unicos)} únicos) ===")
    for c in sorted(contratantes_unicos):
        output_lines.append(f"  - {c}")

    # Detectar coluna de código IBGE, se existir
    col_ibge = None
    if "CODIGO IBGE" in df.columns:
        col_ibge = "CODIGO IBGE"
    elif "CODIGO_IBGE" in df.columns:
        col_ibge = "CODIGO_IBGE"

    # Detectar coluna de nome do município
    col_mun = None
    for cand in ("MUNICIPIO", "MUNICÍPIO", "MUNICIPIO_IBGE", "MUNICIPIO_NOME"):
        if cand in df.columns:
            col_mun = cand
            break

    # Buscar por CISAJE (ou variações)
    contratante_norm = df["CONTRATANTE"].apply(_normalize_text)
    
    # Tentar diferentes padrões
    patterns = ["CISAJE", "DIAMANTINA"]
    
    for pattern in patterns:
        mask = contratante_norm.str.contains(pattern)
        df_filtered = df[mask].copy()
        
        output_lines.append(f"\n=== Busca por '{pattern}' ===")
        output_lines.append(f"Registros encontrados: {len(df_filtered)}")
        
        if not df_filtered.empty:
            # Listar contratantes únicos que casaram
            contratantes_match = df_filtered["CONTRATANTE"].unique()
            output_lines.append(f"Contratantes que casaram: {list(contratantes_match)}")
            
            cols = ["CONTRATANTE"]
            if col_ibge is not None:
                df_filtered["IBGE7"] = df_filtered[col_ibge].apply(_normalize_ibge)
                cols.append("IBGE7")
            if col_mun is not None:
                cols.append(col_mun)

            df_out = df_filtered[cols].drop_duplicates()

            # Ordenar
            sort_cols = []
            if col_mun is not None:
                sort_cols.append(col_mun)
            if "IBGE7" in df_out.columns:
                sort_cols.append("IBGE7")
            if not sort_cols:
                sort_cols = ["CONTRATANTE"]

            df_out = df_out.sort_values(sort_cols)

            output_lines.append(f"\nMunicípios únicos: {len(df_out)}")
            if "IBGE7" in df_out.columns and col_mun is not None:
                for _, row in df_out.iterrows():
                    output_lines.append(f"  {row[col_mun]} - {row['IBGE7']}")
            else:
                output_lines.append(df_out.to_string(index=False))

    # Salvar em arquivo
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    
    print(f"Resultado salvo em: {OUTPUT_FILE}")


if __name__ == "__main__":
    listar_municipios_cisaje()
