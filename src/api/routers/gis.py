"""
Router de dados GIS (PostgreSQL/PostGIS).
Endpoints: /gis/banco, /gis/pois
"""

from typing import Any, Optional

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from loguru import logger

from src.repository import TechDengueRepository
from src.api.dependencies import df_to_records

router = APIRouter(prefix="/gis", tags=["GIS"])


@router.get("/banco", summary="Dados do banco GIS")
def gis_banco(limit: int = 100) -> Any:
    """Retorna dados do banco TechDengue no PostgreSQL."""
    limit = max(1, min(limit, 1000))
    repo = TechDengueRepository()
    try:
        df = repo.get_banco_techdengue_all(limit=limit)
        return JSONResponse(content=df_to_records(df))
    except Exception as e:
        logger.error(f"/gis/banco error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@router.get("/pois", summary="POIs do campo")
def gis_pois(limit: int = 100, id_atividade: Optional[str] = None) -> Any:
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
        return JSONResponse(content=df_to_records(df))
    except Exception as e:
        logger.error(f"/gis/pois error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
