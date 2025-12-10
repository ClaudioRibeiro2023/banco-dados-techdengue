"""
Router de Dados/Facts.
Endpoints: /facts, /facts/summary, /dengue, /municipios, /gold/analise
"""

from datetime import datetime, date, timezone
from typing import Any, Optional, List

import pandas as pd
from fastapi import APIRouter, Query

from src.api.schemas import (
    FactsResponse,
    FactRecord,
    SummaryResponse,
    SummaryItem,
    GoldAnaliseResponse,
    GoldAnaliseRecord,
    PageResponse,
)
from src.api.utils import read_parquet_cached
from src.api.dependencies import df_to_records, apply_fields, export_df

router = APIRouter()


@router.get("/facts", response_model=FactsResponse, tags=["Atividades"], summary="Listar atividades TechDengue")
def get_facts(
    codigo_ibge: Optional[str] = None,
    atividade: Optional[str] = Query(None, alias="nomenclatura_atividade"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: Optional[str] = None,
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    format: Optional[str] = Query("json", pattern="^(json|csv|parquet)$"),
    fields: Optional[str] = None,
) -> Any:
    """Lista atividades TechDengue com filtros e paginação."""
    limit = max(1, min(limit, 1000))
    offset = max(0, offset)

    df = read_parquet_cached("fato_atividades_techdengue.parquet")

    if codigo_ibge:
        df = df[df["codigo_ibge"].astype(str) == str(codigo_ibge)]
    if atividade:
        df = df[
            df["nomenclatura_atividade"]
            .astype(str)
            .str.contains(str(atividade), case=False, na=False)
        ]
    if start_date:
        df = df[pd.to_datetime(df["data_map"]).dt.date >= start_date]
    if end_date:
        df = df[pd.to_datetime(df["data_map"]).dt.date <= end_date]

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(order == "asc"), na_position="last")

    if format != "json":
        df_export = apply_fields(df, fields)
        page = df_export.iloc[offset : offset + limit]
        return export_df(page, format, "facts")

    total = len(df)
    page = df.iloc[offset : offset + limit]

    items: List[FactRecord] = []
    for rec in df_to_records(page):
        items.append(
            FactRecord(
                codigo_ibge=rec.get("codigo_ibge"),
                municipio=rec.get("municipio"),
                data_map=rec.get("data_map"),
                nomenclatura_atividade=rec.get("nomenclatura_atividade"),
                pois=rec.get("pois"),
                devolutivas=rec.get("devolutivas"),
                hectares_mapeados=rec.get("hectares_mapeados"),
            )
        )

    return FactsResponse(total=total, limit=limit, offset=offset, items=items)


@router.get("/facts/summary", response_model=SummaryResponse, tags=["Atividades"], summary="Resumo agregado das atividades")
def facts_summary(
    group_by: Optional[str] = Query(None, pattern="^(municipio|codigo_ibge|atividade)$"),
) -> Any:
    """Retorna resumo agregado das atividades, opcionalmente agrupado."""
    df = read_parquet_cached("fato_atividades_techdengue.parquet")

    if group_by == "municipio":
        key_col = "municipio"
    elif group_by == "codigo_ibge":
        key_col = "codigo_ibge"
    elif group_by == "atividade":
        key_col = "nomenclatura_atividade"
    else:
        key_col = None

    if key_col:
        # Usar coluna diferente para count quando agrupando por nomenclatura_atividade
        count_col = "pois" if key_col == "nomenclatura_atividade" else "nomenclatura_atividade"
        g = (
            df.groupby(key_col)
            .agg(
                total_pois=("pois", "sum"),
                total_devolutivas=("devolutivas", "sum"),
                total_hectares=("hectares_mapeados", "sum"),
                atividades=(count_col, "count"),
            )
            .reset_index()
            .rename(columns={key_col: "key"})
        )
        items = [
            SummaryItem(
                key=str(r["key"]) if r.get("key") is not None else None,
                total_pois=int(r["total_pois"]) if pd.notna(r["total_pois"]) else 0,
                total_devolutivas=float(r["total_devolutivas"]) if pd.notna(r["total_devolutivas"]) else 0.0,
                total_hectares=float(r["total_hectares"]) if pd.notna(r["total_hectares"]) else 0.0,
                atividades=int(r["atividades"]) if pd.notna(r["atividades"]) else 0,
            )
            for _, r in g.iterrows()
        ]
    else:
        s = df.agg(
            {
                "pois": "sum",
                "devolutivas": "sum",
                "hectares_mapeados": "sum",
                "nomenclatura_atividade": "count",
            }
        )
        items = [
            SummaryItem(
                key=None,
                total_pois=int(s.get("pois", 0) or 0),
                total_devolutivas=float(s.get("devolutivas", 0.0) or 0.0),
                total_hectares=float(s.get("hectares_mapeados", 0.0) or 0.0),
                atividades=int(s.get("nomenclatura_atividade", 0) or 0),
            )
        ]

    return SummaryResponse(generated_at=datetime.now(timezone.utc), group_by=group_by, summary=items)


@router.get("/dengue", response_model=PageResponse, tags=["Dengue"], summary="Dados históricos de dengue")
def dengue(
    codigo_ibge: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: Optional[str] = None,
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    format: Optional[str] = Query("json", pattern="^(json|csv|parquet)$"),
    fields: Optional[str] = None,
) -> Any:
    """Retorna dados históricos de casos de dengue."""
    limit = max(1, min(limit, 1000))
    offset = max(0, offset)

    df = read_parquet_cached("fato_dengue_historico.parquet")
    if codigo_ibge:
        col = "codigo_ibge" if "codigo_ibge" in df.columns else "codmun"
        if col in df.columns:
            df = df[df[col].astype(str) == str(codigo_ibge)]

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(order == "asc"), na_position="last")

    if format != "json":
        df_export = apply_fields(df, fields)
        page = df_export.iloc[offset : offset + limit]
        return export_df(page, format, "dengue")

    df = apply_fields(df, fields)
    total = len(df)
    page = df.iloc[offset : offset + limit]
    return PageResponse(total=total, limit=limit, offset=offset, items=df_to_records(page))


@router.get("/municipios", response_model=PageResponse, tags=["Municípios"], summary="Dados dos municípios de MG")
def municipios(
    q: Optional[str] = None,
    codigo_ibge: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: Optional[str] = None,
    order: Optional[str] = Query("asc", pattern="^(asc|desc)$"),
    format: Optional[str] = Query("json", pattern="^(json|csv|parquet)$"),
    fields: Optional[str] = None,
) -> Any:
    """Retorna dados dos municípios de Minas Gerais."""
    limit = max(1, min(limit, 1000))
    offset = max(0, offset)

    df = read_parquet_cached("dim_municipios.parquet")
    if codigo_ibge and "codigo_ibge" in df.columns:
        df = df[df["codigo_ibge"].astype(str) == str(codigo_ibge)]
    if q:
        name_col = "municipio" if "municipio" in df.columns else None
        if name_col:
            df = df[df[name_col].astype(str).str.contains(q, case=False, na=False)]

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(order == "asc"), na_position="last")

    if format != "json":
        df_export = apply_fields(df, fields)
        page = df_export.iloc[offset : offset + limit]
        return export_df(page, format, "municipios")

    df = apply_fields(df, fields)
    total = len(df)
    page = df.iloc[offset : offset + limit]
    return PageResponse(total=total, limit=limit, offset=offset, items=df_to_records(page))


@router.get("/gold/analise", response_model=GoldAnaliseResponse, tags=["Análise Gold"], summary="Análise integrada consolidada")
def gold_analise(
    codigo_ibge: Optional[str] = None,
    municipio: Optional[str] = None,
    comp_start: Optional[date] = None,
    comp_end: Optional[date] = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: Optional[str] = None,
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    format: Optional[str] = Query("json", pattern="^(json|csv|parquet)$"),
    fields: Optional[str] = None,
) -> Any:
    """Retorna dados analíticos consolidados (camada Gold)."""
    limit = max(1, min(limit, 1000))
    offset = max(0, offset)

    df = read_parquet_cached("analise_integrada.parquet")

    if codigo_ibge:
        df = df[df["codigo_ibge"].astype(str) == str(codigo_ibge)]
    if municipio:
        df = df[df["municipio"].astype(str).str.contains(str(municipio), case=False, na=False)]
    if comp_start:
        df = df[pd.to_datetime(df["competencia"]).dt.date >= comp_start]
    if comp_end:
        df = df[pd.to_datetime(df["competencia"]).dt.date <= comp_end]

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(order == "asc"), na_position="last")

    if format != "json":
        df_export = apply_fields(df, fields)
        page = df_export.iloc[offset : offset + limit]
        return export_df(page, format, "gold_analise")

    total = len(df)
    page = df.iloc[offset : offset + limit]

    items: List[GoldAnaliseRecord] = []
    for rec in df_to_records(page):
        items.append(
            GoldAnaliseRecord(
                codigo_ibge=rec.get("codigo_ibge"),
                municipio=rec.get("municipio"),
                competencia=rec.get("competencia"),
                total_pois=rec.get("total_pois"),
                total_devolutivas=rec.get("total_devolutivas"),
                total_hectares=rec.get("total_hectares"),
                atividades=rec.get("atividades"),
            )
        )

    return GoldAnaliseResponse(total=total, limit=limit, offset=offset, items=items)
