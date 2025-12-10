"""
Dependências compartilhadas entre routers.
Funções utilitárias e helpers para a API.
"""

from datetime import datetime, date
from typing import List, Dict, Any, Optional

import pandas as pd
import io
from fastapi.responses import StreamingResponse


def df_to_records(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Converte DataFrame para lista de dicionários com serialização de datas."""
    out = []
    for rec in df.to_dict(orient="records"):
        for k, v in list(rec.items()):
            if isinstance(v, (pd.Timestamp, datetime)):
                rec[k] = v.isoformat()
            elif isinstance(v, date):
                rec[k] = v.isoformat()
        out.append(rec)
    return out


def apply_fields(df: pd.DataFrame, fields: Optional[str]) -> pd.DataFrame:
    """Aplica filtro de campos ao DataFrame."""
    if fields:
        cols = [c.strip() for c in str(fields).split(",") if c.strip()]
        cols = [c for c in cols if c in df.columns]
        if cols:
            df = df.loc[:, cols]
    return df


def export_df(df: pd.DataFrame, fmt: str, filename: str) -> StreamingResponse:
    """Exporta DataFrame para CSV ou Parquet."""
    if fmt == "csv":
        buf = io.StringIO()
        df.to_csv(buf, index=False)
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}.csv"},
        )
    if fmt == "parquet":
        b = io.BytesIO()
        df.to_parquet(b, index=False)
        b.seek(0)
        return StreamingResponse(
            b,
            media_type="application/x-parquet",
            headers={"Content-Disposition": f"attachment; filename={filename}.parquet"},
        )
    return StreamingResponse(iter([""]), media_type="text/plain")
