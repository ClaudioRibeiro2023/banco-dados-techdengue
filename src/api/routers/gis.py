"""
Router de dados GIS (PostgreSQL/PostGIS).
Endpoints: /gis/banco, /gis/pois
"""

import os
from typing import Any, Optional

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from loguru import logger

from src.repository import TechDengueRepository
from src.api.dependencies import df_to_records
from src.database import DatabaseConnectionError, DatabaseQueryError

router = APIRouter(prefix="/gis", tags=["GIS"])


def _gis_optional() -> bool:
    return (os.getenv("GIS_OPTIONAL", "true") or "").strip().lower() in {"1", "true", "yes", "y"}


def _is_expected_gis_error(e: Exception) -> bool:
    if isinstance(e, (DatabaseConnectionError, DatabaseQueryError)):
        return True
    msg = str(e).lower()
    expected_markers = [
        "does not exist",
        "relation",
        "password authentication failed",
        "could not connect to server",
        "connection refused",
        "timeout",
        "timed out",
        "name or service not known",
    ]
    return any(m in msg for m in expected_markers)


def _empty_ok(reason: str, message: str) -> JSONResponse:
    return JSONResponse(
        content=[],
        status_code=200,
        headers={
            "X-TechDengue-Data-Available": "false",
            "X-TechDengue-Reason": reason,
            "X-TechDengue-Message": message,
        },
    )


def _unavailable(reason: str, message: str, status_code: int = 503) -> JSONResponse:
    return JSONResponse(
        content={"error": "gis_unavailable", "reason": reason, "message": message},
        status_code=status_code,
        headers={
            "X-TechDengue-Data-Available": "false",
            "X-TechDengue-Reason": reason,
            "X-TechDengue-Message": message,
            "X-TechDengue-Strict": "true",
        },
    )


@router.get("/banco", summary="Dados do banco GIS")
def gis_banco(limit: int = 100, strict: bool = False) -> Any:
    """Retorna dados do banco TechDengue no PostgreSQL."""
    limit = max(1, min(limit, 1000))
    repo = TechDengueRepository()
    try:
        df = repo.get_banco_techdengue_all(limit=limit)
        return JSONResponse(content=df_to_records(df), headers={"X-TechDengue-Data-Available": "true"})
    except Exception as e:
        if _is_expected_gis_error(e):
            if strict:
                logger.warning(f"/gis/banco unavailable (strict), returning 503: {e}")
                return _unavailable(
                    reason="gis_banco_unavailable",
                    message="Dados GIS (banco_techdengue) ainda nao disponiveis neste ambiente.",
                    status_code=503,
                )
            if _gis_optional():
                logger.warning(f"/gis/banco unavailable, returning empty list: {e}")
                return _empty_ok(
                    reason="gis_banco_unavailable",
                    message="Dados GIS (banco_techdengue) ainda nao disponiveis neste ambiente.",
                )
        logger.error(f"/gis/banco error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@router.get("/pois", summary="POIs do campo")
def gis_pois(limit: int = 100, id_atividade: Optional[str] = None, strict: bool = False) -> Any:
    """Retorna POIs (pontos de interesse) das atividades de campo."""
    limit = max(1, min(limit, 2000))
    repo = TechDengueRepository()
    try:
        if id_atividade:
            df = repo.get_planilha_campo_by_atividade(id_atividade=id_atividade)
            if len(df) > limit:
                df = df.head(limit)
        else:
            df = repo.get_planilha_campo_all(limit=limit)
        return JSONResponse(content=df_to_records(df), headers={"X-TechDengue-Data-Available": "true"})
    except Exception as e:
        if _is_expected_gis_error(e):
            if strict:
                logger.warning(f"/gis/pois unavailable (strict), returning 503: {e}")
                return _unavailable(
                    reason="gis_pois_unavailable",
                    message="POIs (planilha_campo) ainda nao carregados/disponiveis neste ambiente.",
                    status_code=503,
                )
            if _gis_optional():
                logger.warning(f"/gis/pois unavailable, returning empty list: {e}")
                return _empty_ok(
                    reason="gis_pois_unavailable",
                    message="POIs (planilha_campo) ainda nao carregados/disponiveis neste ambiente.",
                )
        logger.error(f"/gis/pois error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
