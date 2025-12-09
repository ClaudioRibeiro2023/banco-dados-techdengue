from __future__ import annotations
from pathlib import Path
from typing import Optional, Dict, Any
import pandas as pd
from loguru import logger

from .config import Config
from .ingestion import _normalize_df, _aggregate_for_fact, _rename_to_db
from .validators import validate_mega_planilha


def materialize_facts_to_parquet(
    xlsx_path: Optional[Path] = None,
    sheet: str = "Atividades (com sub)",
    out_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Gera dataset materializado (Parquet) a partir da mega planilha, sem escrever no banco.
    Retorna metadados do processo e caminho do arquivo gerado.
    """
    out_dir = out_dir or Config.PATHS.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    xlsx_path = xlsx_path or (Config.PATHS.data_dir / "dados_techdengue" / "Atividades Techdengue.xlsx")
    parquet_path = out_dir / "fato_atividades_techdengue.parquet"

    logger.info(f"Validando mega planilha em: {xlsx_path}")
    report = validate_mega_planilha(path=str(xlsx_path), sheet=sheet)
    if not report.ok:
        return {"ok": False, "error": "validation_failed", "report": report.model_dump()}

    logger.info("Lendo e transformando planilha...")
    df_raw = pd.read_excel(xlsx_path, sheet_name=sheet)
    df_raw = _normalize_df(df_raw)
    df_grouped = _aggregate_for_fact(df_raw)
    df_db = _rename_to_db(df_grouped)

    logger.info(f"Salvando Parquet em {parquet_path}")
    df_db.to_parquet(parquet_path, index=False)

    return {
        "ok": True,
        "rows": int(len(df_db)),
        "columns": df_db.columns.tolist(),
        "parquet": str(parquet_path),
        "report": report.model_dump(),
    }


def materialize_gold_analise(
    out_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    out_dir = out_dir or Config.PATHS.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    facts_path = out_dir / "fato_atividades_techdengue.parquet"
    gold_path = out_dir / "analise_integrada.parquet"

    if not facts_path.exists():
        return {"ok": False, "error": "facts_missing", "parquet": str(facts_path)}

    df = pd.read_parquet(facts_path)

    if "data_map" not in df.columns:
        return {"ok": False, "error": "column_missing:data_map"}

    comp = pd.to_datetime(df["data_map"], errors="coerce").dt.to_period("M").dt.to_timestamp()
    df["competencia"] = comp.dt.date

    for c in ["pois", "devolutivas", "hectares_mapeados"]:
        if c not in df.columns:
            df[c] = 0
    if "nomenclatura_atividade" not in df.columns:
        df["nomenclatura_atividade"] = None

    g = (
        df.groupby(["codigo_ibge", "municipio", "competencia"], as_index=False)
          .agg({
              "pois": "sum",
              "devolutivas": "sum",
              "hectares_mapeados": "sum",
              "nomenclatura_atividade": "count",
          })
          .rename(columns={
              "pois": "total_pois",
              "devolutivas": "total_devolutivas",
              "hectares_mapeados": "total_hectares",
              "nomenclatura_atividade": "atividades",
          })
    )

    g.to_parquet(gold_path, index=False)

    return {
        "ok": True,
        "rows": int(len(g)),
        "columns": g.columns.tolist(),
        "parquet": str(gold_path),
    }
