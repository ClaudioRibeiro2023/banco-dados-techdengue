"""Análise de impacto de dengue para municípios do ICISMEP (BHTE + Divinópolis).

Cruza as bases de dengue 2024/2025 com a base de atividades TechDengue
para identificar os municípios pertencentes às ZURS ICISMEP BHTE e
ICISMEP Divinópolis, e calcula a redução percentual de casos entre 2024
e 2025 para esse grupo de municípios.
"""

from pathlib import Path
import unicodedata

import pandas as pd


BASE_DIR = Path(__file__).parent.parent
DADOS_DIR = BASE_DIR / "base_dados"


def _normalize_text(value: str) -> str:
    """Normaliza texto para comparação (sem acentos, maiúsculo)."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    s = str(value).strip()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    return s.upper()


def _to_ibge6(value) -> str | None:
    """Normaliza código IBGE para string de 6 dígitos (sem dígito verificador).

    - Remove sufixo ".0" típico de exportação do Excel.
    - Se receber 7 dígitos (código completo IBGE), remove o último dígito.
    - Se receber 6 dígitos, mantém.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    s = str(value).strip()
    if s.endswith(".0"):
        s = s[:-2]
    if not s.isdigit():
        return None
    # Tratar códigos IBGE completos (7 dígitos) -> 6 dígitos sem DV
    if len(s) == 7:
        s = s[:-1]
    return s.zfill(6)


def carregar_codigos_icismep() -> list[str]:
    """Retorna lista de códigos IBGE (7 dígitos) dos municípios ICISMEP BHTE + Divinópolis."""
    atividades_path = (
        DADOS_DIR / "dados_techdengue" / "Atividades Techdengue.xlsx"
    )

    print(f"Carregando base de atividades: {atividades_path}")
    # Usar a aba consolidada com sub-atividades, que é a base canônica
    # em outros scripts do projeto (ex.: debug_hectares.py, pipeline_etl_completo.py)
    df_ativ = pd.read_excel(atividades_path, sheet_name="Atividades (com sub)")

    # Normalizar nomes de colunas (remover espaços extras)
    df_ativ.columns = [str(c).strip() for c in df_ativ.columns]

    if "CONTRATANTE" not in df_ativ.columns:
        raise RuntimeError("Coluna 'CONTRATANTE' não encontrada em 'Atividades (com sub)'")

    # Aceitar tanto "CODIGO IBGE" quanto "CODIGO_IBGE" como fonte do código IBGE
    col_ibge = None
    if "CODIGO IBGE" in df_ativ.columns:
        col_ibge = "CODIGO IBGE"
    elif "CODIGO_IBGE" in df_ativ.columns:
        col_ibge = "CODIGO_IBGE"
    else:
        raise RuntimeError("Nenhuma coluna de código IBGE encontrada (esperado 'CODIGO IBGE' ou 'CODIGO_IBGE')")

    # Normalizar contratante
    contratante_norm = df_ativ["CONTRATANTE"].apply(_normalize_text)

    # ZURS ICISMEP BHTE e ICISMEP Divinópolis
    mask_bhte = contratante_norm.str.contains("ICISMEP") & contratante_norm.str.contains("BHTE")
    mask_div = contratante_norm.str.contains("ICISMEP") & contratante_norm.str.contains("DIVINOPOLIS")

    df_icismep = df_ativ[mask_bhte | mask_div].copy()

    print(f"Registros de atividades ICISMEP BHTE + Divinópolis encontrados: {len(df_icismep)}")

    codigos6 = (
        df_icismep[col_ibge]
        .apply(_to_ibge6)
        .dropna()
        .drop_duplicates()
        .tolist()
    )

    print(f"Municípios únicos ICISMEP (BHTE + Divinópolis): {len(codigos6)}")

    return codigos6


def carregar_dengue_por_ano(ano: int) -> pd.DataFrame:
    """Carrega base de dengue para o ano informado."""
    path = DADOS_DIR / "dados_dengue" / f"base.dengue.{ano}.xlsx"
    print(f"Carregando base de dengue {ano}: {path}")
    df = pd.read_excel(path)

    # A base de dengue pode usar diferentes nomes para o código IBGE:
    # - Versão documentada em BASES_DE_DADOS_DETALHADO.md: 'codmun'
    # - Versão observada em verificar_colunas.py: 'Cod IBGE'
    col_ibge = None
    if "codmun" in df.columns:
        col_ibge = "codmun"
    elif "Cod IBGE" in df.columns:
        col_ibge = "Cod IBGE"
    else:
        raise RuntimeError(
            f"Nenhuma coluna de código IBGE encontrada na base de dengue {ano} (esperado 'codmun' ou 'Cod IBGE')"
        )
    if "Total" not in df.columns:
        raise RuntimeError(f"Coluna 'Total' não encontrada na base de dengue {ano}")

    # Normalizar para código de 6 dígitos, compatível com o usado nas atividades
    df["codmun_str"] = df[col_ibge].apply(_to_ibge6)
    return df


def calcular_reducao_icismep():
    codigos_icismep = carregar_codigos_icismep()

    df_2024 = carregar_dengue_por_ano(2024)
    df_2025 = carregar_dengue_por_ano(2025)

    dengue_2024_icismep = df_2024[df_2024["codmun_str"].isin(codigos_icismep)].copy()
    dengue_2025_icismep = df_2025[df_2025["codmun_str"].isin(codigos_icismep)].copy()

    print("\nResumo de cobertura nas bases de dengue:")
    print(f"  Municípios ICISMEP esperados: {len(codigos_icismep)}")
    print(f"  Encontrados em 2024: {dengue_2024_icismep['codmun_str'].nunique()}")
    print(f"  Encontrados em 2025: {dengue_2025_icismep['codmun_str'].nunique()}")

    casos_2024 = int(dengue_2024_icismep["Total"].sum())
    casos_2025 = int(dengue_2025_icismep["Total"].sum())

    reducao_pct = None
    if casos_2024 > 0:
        reducao_pct = (casos_2024 - casos_2025) / casos_2024 * 100

    print("\n===== RESULTADO ICISMEP (BHTE + DIVINÓPOLIS) =====")
    print(f"Casos de dengue 2024 (67 municípios ICISMEP): {casos_2024:,}")
    print(f"Casos de dengue 2025 (67 municípios ICISMEP): {casos_2025:,}")
    if reducao_pct is not None:
        print(f"Redução relativa 2024→2025: {reducao_pct:.2f}%")
    else:
        print("Não foi possível calcular a redução percentual (casos_2024 = 0).")


if __name__ == "__main__":
    calcular_reducao_icismep()
