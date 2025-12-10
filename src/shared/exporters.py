"""
Exporters para CSV e Parquet.
Funções reutilizáveis para exportação de dados.
"""

import io
from typing import Any

import pandas as pd
from fastapi.responses import StreamingResponse
from loguru import logger


def export_csv(
    df: pd.DataFrame,
    filename: str = "export.csv",
    encoding: str = "utf-8-sig",
) -> StreamingResponse:
    """
    Exporta DataFrame para CSV como StreamingResponse.
    
    Args:
        df: DataFrame a exportar
        filename: Nome do arquivo para download
        encoding: Encoding do CSV (default: utf-8-sig para Excel)
    
    Returns:
        StreamingResponse com o CSV
    """
    buffer = io.StringIO()
    df.to_csv(buffer, index=False, encoding=encoding)
    buffer.seek(0)
    
    logger.info(f"Exportando CSV: {filename} ({len(df)} linhas)")
    
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


def export_parquet(
    df: pd.DataFrame,
    filename: str = "export.parquet",
) -> StreamingResponse:
    """
    Exporta DataFrame para Parquet como StreamingResponse.
    
    Args:
        df: DataFrame a exportar
        filename: Nome do arquivo para download
    
    Returns:
        StreamingResponse com o Parquet
    """
    buffer = io.BytesIO()
    df.to_parquet(buffer, index=False, engine="pyarrow")
    buffer.seek(0)
    
    logger.info(f"Exportando Parquet: {filename} ({len(df)} linhas)")
    
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


def dataframe_to_records(
    df: pd.DataFrame,
    limit: int | None = None,
    offset: int = 0,
) -> tuple[list[dict[str, Any]], int]:
    """
    Converte DataFrame para lista de dicionários com paginação.
    
    Args:
        df: DataFrame fonte
        limit: Limite de registros (None = todos)
        offset: Offset para paginação
    
    Returns:
        Tupla com (lista de records, total de registros)
    """
    total = len(df)
    
    if offset > 0:
        df = df.iloc[offset:]
    
    if limit:
        df = df.head(limit)
    
    records = df.to_dict(orient="records")
    
    return records, total
