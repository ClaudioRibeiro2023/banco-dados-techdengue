from __future__ import annotations
from typing import Optional, List, Dict, Any
import pandas as pd
from loguru import logger
from datetime import datetime
import psycopg2.extras as extras

from .config import Config
from .database import get_database, get_warehouse_database, DatabaseManager
from .validators import validate_mega_planilha


FACT_TABLE = "fato_atividades_techdengue"


def _normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    # Normalize column names and types
    colmap = {c: c.strip() for c in df.columns}
    df = df.rename(columns=colmap)
    if "CODIGO IBGE" in df.columns and "CODIGO_IBGE" not in df.columns:
        df = df.rename(columns={"CODIGO IBGE": "CODIGO_IBGE"})
    # Normalize municipality column
    if "Municipio" in df.columns and "MUNICIPIO" not in df.columns:
        df = df.rename(columns={"Municipio": "MUNICIPIO"})
    if "Município" in df.columns and "MUNICIPIO" not in df.columns:
        df = df.rename(columns={"Município": "MUNICIPIO"})

    # Date
    if "DATA_MAP" in df.columns:
        df["DATA_MAP"] = pd.to_datetime(df["DATA_MAP"], errors="coerce").dt.date

    # Numeric coercion
    numeric_candidates = [
        "POIS",
        "devolutivas",
        "removido_solucionado",
        "descaracterizado",
        "Tratado",
        "morador_ausente",
        "nao_Autorizado",
        "tratamento_via_drones",
        "monitorado",
        "HECTARES_MAPEADOS",
    ]
    for col in numeric_candidates:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Standardize boolean-ish ints
    for col in ["Tratado", "tratamento_via_drones", "monitorado", "removido_solucionado", "descaracterizado", "morador_ausente"]:
        if col in df.columns:
            df[col] = df[col].fillna(0).astype(int)

    # Normalize IBGE
    if "CODIGO_IBGE" in df.columns:
        df["CODIGO_IBGE"] = df["CODIGO_IBGE"].astype(str).str.strip()

    return df


def _aggregate_for_fact(df: pd.DataFrame) -> pd.DataFrame:
    # Group at (CODIGO_IBGE, DATA_MAP, NOMENCLATURA_ATIVIDADE)
    for required in ["CODIGO_IBGE", "DATA_MAP", "NOMENCLATURA_ATIVIDADE"]:
        if required not in df.columns:
            raise ValueError(f"Coluna obrigatória ausente para agregação: {required}")

    # Identify columns
    numeric_sum_cols = [c for c in [
        "POIS",
        "devolutivas",
        "removido_solucionado",
        "descaracterizado",
        "morador_ausente",
        "tratamento_via_drones",
        "monitorado",
    ] if c in df.columns]

    agg_dict: Dict[str, Any] = {}
    for c in numeric_sum_cols:
        agg_dict[c] = "sum"

    if "HECTARES_MAPEADOS" in df.columns:
        agg_dict["HECTARES_MAPEADOS"] = "max"  # evitar duplicação por sub-atividade

    for c in ["CONTRATANTE", "LINK_GIS", "SUB_ATIVIDADE", "MUNICIPIO"]:
        if c in df.columns:
            agg_dict[c] = "first"

    grouped = (
        df.groupby(["CODIGO_IBGE", "DATA_MAP", "NOMENCLATURA_ATIVIDADE"], as_index=False)
          .agg(agg_dict)
    )
    return grouped


def _rename_to_db(df: pd.DataFrame) -> pd.DataFrame:
    rename_map = {
        "CODIGO_IBGE": "codigo_ibge",
        "MUNICIPIO": "municipio",
        "DATA_MAP": "data_map",
        "NOMENCLATURA_ATIVIDADE": "nomenclatura_atividade",
        "POIS": "pois",
        "devolutivas": "devolutivas",
        "removido_solucionado": "removido_solucionado",
        "descaracterizado": "descaracterizado",
        "Tratado": "tratado",
        "morador_ausente": "morador_ausente",
        "nao_Autorizado": "nao_autorizado",
        "tratamento_via_drones": "tratamento_via_drones",
        "monitorado": "monitorado",
        "HECTARES_MAPEADOS": "hectares_mapeados",
        "CONTRATANTE": "contratante",
        "LINK_GIS": "link_gis",
        "SUB_ATIVIDADE": "sub_atividade",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
    # Add metadata cols
    df["data_carga"] = datetime.now()
    df["versao"] = Config.VERSION
    return df


def ensure_fact_table(db: Optional[DatabaseManager] = None) -> None:
    db = db or get_database()
    create_sql = f"""
    CREATE TABLE IF NOT EXISTS {FACT_TABLE} (
        codigo_ibge VARCHAR(7) NOT NULL,
        municipio TEXT,
        data_map DATE NOT NULL,
        nomenclatura_atividade TEXT NOT NULL,
        pois INTEGER,
        devolutivas INTEGER,
        removido_solucionado INTEGER,
        descaracterizado INTEGER,
        tratado INTEGER,
        morador_ausente INTEGER,
        nao_autorizado INTEGER,
        tratamento_via_drones INTEGER,
        monitorado INTEGER,
        hectares_mapeados DOUBLE PRECISION,
        contratante TEXT,
        link_gis TEXT,
        sub_atividade TEXT,
        data_carga TIMESTAMP DEFAULT NOW(),
        versao TEXT,
        PRIMARY KEY (codigo_ibge, data_map, nomenclatura_atividade)
    );
    """
    db.execute_query(create_sql, fetch=False)
    logger.info(f"Garantida existência da tabela {FACT_TABLE}")


def upsert_fact(df: pd.DataFrame, db: Optional[DatabaseManager] = None, chunk_size: int = 5000) -> int:
    db = db or get_database()
    if df.empty:
        return 0

    cols = [
        "codigo_ibge", "municipio", "data_map", "nomenclatura_atividade",
        "pois", "devolutivas", "removido_solucionado", "descaracterizado",
        "tratado", "morador_ausente", "nao_autorizado", "tratamento_via_drones",
        "monitorado", "hectares_mapeados", "contratante", "link_gis", "sub_atividade",
        "data_carga", "versao"
    ]
    present_cols = [c for c in cols if c in df.columns]
    df = df[present_cols]

    insert_sql = f"INSERT INTO {FACT_TABLE} ({', '.join(present_cols)}) VALUES %s\n" \
                 f"ON CONFLICT (codigo_ibge, data_map, nomenclatura_atividade) DO UPDATE SET " + \
                 ", ".join([f"{c}=EXCLUDED.{c}" for c in present_cols if c not in ["codigo_ibge", "data_map", "nomenclatura_atividade"]])

    total = 0
    with db.get_connection() as conn:
        with conn.cursor() as cur:
            for start in range(0, len(df), chunk_size):
                chunk = df.iloc[start:start+chunk_size]
                values = [tuple(None if pd.isna(v) else v for v in row) for row in chunk.to_numpy()]
                extras.execute_values(cur, insert_sql, values, page_size=min(chunk_size, len(values)))
                total += len(values)
    logger.info(f"Upsert concluído na tabela {FACT_TABLE}: {total} linhas")
    return total


def ingest_mega_planilha(
    path: Optional[str] = None,
    sheet: str = "Atividades (com sub)",
    db: Optional[DatabaseManager] = None,
    use_warehouse: bool = True,
) -> Dict[str, Any]:
    # Validate first
    report = validate_mega_planilha(path=path, sheet=sheet)
    if not report.ok:
        logger.error("Validação falhou, abortando ingestão")
        return {"ok": False, "report": report.dict()}

    # Load and transform
    path = path or str(Config.PATHS.data_dir / "dados_techdengue" / "Atividades Techdengue.xlsx")
    df_raw = pd.read_excel(path, sheet_name=sheet)
    df_raw = _normalize_df(df_raw)
    df_grouped = _aggregate_for_fact(df_raw)
    df_db = _rename_to_db(df_grouped)

    # Ensure table and upsert (escreve no Warehouse por padrão)
    db = db or (get_warehouse_database() if use_warehouse else get_database())
    ensure_fact_table(db)
    total = upsert_fact(df_db, db)

    return {
        "ok": True,
        "ingested_rows": total,
        "report": report.dict(),
        "table": FACT_TABLE,
    }
