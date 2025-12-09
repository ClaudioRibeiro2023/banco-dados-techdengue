from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime


class HealthResponse(BaseModel):
    ok: bool
    version: str
    datasets: Dict[str, Any]
    db_connected: bool


class FactRecord(BaseModel):
    codigo_ibge: str
    municipio: Optional[str] = None
    data_map: Optional[date] = None
    nomenclatura_atividade: Optional[str] = None
    pois: Optional[int] = None
    devolutivas: Optional[float] = None
    hectares_mapeados: Optional[float] = None


class FactsResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[FactRecord]


class SummaryItem(BaseModel):
    key: Optional[str]
    total_pois: int
    total_devolutivas: float
    total_hectares: float
    atividades: int


class SummaryResponse(BaseModel):
    generated_at: datetime
    group_by: Optional[str]
    summary: List[SummaryItem]


class GoldAnaliseRecord(BaseModel):
    codigo_ibge: str
    municipio: Optional[str] = None
    competencia: Optional[date] = None
    total_pois: Optional[int] = None
    total_devolutivas: Optional[float] = None
    total_hectares: Optional[float] = None
    atividades: Optional[int] = None


class GoldAnaliseResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[GoldAnaliseRecord]


class PageResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[Dict[str, Any]]


class DatasetsResponse(BaseModel):
    datasets: Dict[str, Any]
