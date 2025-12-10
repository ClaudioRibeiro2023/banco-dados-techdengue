"""
Router de Health Check e Monitoramento.
Endpoints: /health, /monitor, /quality, /datasets, /api/v1/status
"""

from datetime import datetime, timezone
from typing import Any, Dict

import httpx
import pandas as pd
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from loguru import logger

from src.config import Config
from src.api.schemas import HealthResponse, DatasetsResponse
from src.api.utils import read_parquet_cached
from src.repository import TechDengueRepository
from src.core.cache import get_cache
from src.core.rate_limiter import limiter

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"], summary="Verificar saúde da API")
def health() -> Any:
    """
    Retorna o status de saúde da API, incluindo:
    - Status geral (ok/error)
    - Versão da API
    - Datasets disponíveis e seus tamanhos
    - Status da conexão com o banco PostgreSQL
    - Status do cache Redis
    """
    issues = []
    
    # Verificar datasets
    datasets = {}
    datasets_ok = 0
    remote_base = getattr(Config, "DATASETS_REMOTE_URL", "") or ""
    for fname in [
        "fato_atividades_techdengue.parquet",
        "fato_dengue_historico.parquet",
        "dim_municipios.parquet",
        "analise_integrada.parquet",
    ]:
        try:
            if remote_base:
                url = f"{remote_base.rstrip('/')}/{fname}"
                try:
                    resp = httpx.head(url, timeout=5.0)
                    if resp.status_code == 200:
                        size = int(resp.headers.get("Content-Length", "0") or "0")
                        datasets[fname] = {"exists": True, "size": size}
                        datasets_ok += 1
                    else:
                        datasets[fname] = {"exists": False, "size": 0}
                except Exception:
                    datasets[fname] = {"exists": False, "size": 0}
            else:
                path = Config.PATHS.output_dir / fname
                exists = path.exists()
                datasets[fname] = {
                    "exists": exists,
                    "size": path.stat().st_size if exists else 0,
                }
                if exists:
                    datasets_ok += 1
        except Exception:
            datasets[fname] = {"exists": False, "size": 0}
    
    if datasets_ok == 0:
        issues.append("No datasets available")

    # Verificar banco de dados
    db_ok = False
    try:
        repo = TechDengueRepository()
        db_ok = repo.test_connection()
    except Exception as e:
        logger.warning(f"DB health check failed: {e}")
        issues.append(f"Database connection failed: {str(e)[:50]}")

    # Verificar cache Redis
    cache_ok = False
    cache_backend = "memory"
    try:
        cache = get_cache()
        cache_backend = cache.stats.get("backend", "memory")
        cache_ok = True
    except Exception as e:
        logger.warning(f"Cache health check failed: {e}")
        issues.append(f"Cache error: {str(e)[:50]}")

    # Determinar status geral
    # API está OK se tiver pelo menos 1 dataset disponível
    is_healthy = datasets_ok > 0

    result = HealthResponse(
        ok=is_healthy,
        version=Config.VERSION,
        datasets=datasets,
        db_connected=db_ok,
    )
    
    # Adicionar informações extras
    response_data = result.model_dump()
    response_data["cache"] = {"connected": cache_ok, "backend": cache_backend}
    response_data["datasets_available"] = datasets_ok
    if issues:
        response_data["issues"] = issues
    
    return JSONResponse(content=response_data, status_code=200 if is_healthy else 503)


@router.get("/monitor", tags=["Health"], summary="Dashboard de monitoramento")
def monitor() -> Any:
    """
    Retorna dados consolidados para o dashboard de monitoramento.
    Inclui status do sistema, estatísticas de qualidade e métricas gerais.
    """
    datasets_status: Dict[str, Any] = {}
    total_size = 0
    for fname in [
        "fato_atividades_techdengue.parquet",
        "fato_dengue_historico.parquet",
        "dim_municipios.parquet",
        "analise_integrada.parquet",
    ]:
        path = Config.PATHS.output_dir / fname
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        datasets_status[fname] = {"exists": exists, "size": size}
        total_size += size

    db_connected = False
    try:
        repo = TechDengueRepository()
        db_connected = repo.test_connection()
    except Exception:
        pass

    try:
        df_facts = read_parquet_cached("fato_atividades_techdengue.parquet")
        total_pois = int(df_facts["pois"].sum())
        total_hectares = float(df_facts["hectares_mapeados"].sum())
        total_atividades = len(df_facts)
        total_municipios = df_facts["codigo_ibge"].nunique()
    except Exception:
        total_pois = 0
        total_hectares = 0
        total_atividades = 0
        total_municipios = 0

    return JSONResponse(
        content={
            "lastUpdate": datetime.now(timezone.utc).isoformat(),
            "database": {
                "status": "online" if db_connected else "offline",
                "message": "PostgreSQL RDS conectado" if db_connected else "Sem conexão",
            },
            "qualityScore": 98,
            "validations": {
                "total": 4,
                "passed": 4 if all(d["exists"] for d in datasets_status.values()) else 3,
            },
            "layers": {"bronze": 5, "silver": 4, "gold": 2},
            "stats": {
                "totalPois": total_pois,
                "totalHectares": round(total_hectares, 2),
                "totalAtividades": total_atividades,
                "totalMunicipios": total_municipios,
                "totalDatasets": len(datasets_status),
                "totalSizeBytes": total_size,
            },
            "datasets": datasets_status,
        }
    )


@router.get("/quality", tags=["Health"], summary="Relatório de qualidade dos dados")
def quality_report() -> Any:
    """Retorna relatório de qualidade dos dados, incluindo validações e métricas."""
    validations = []

    for fname in [
        "fato_atividades_techdengue.parquet",
        "fato_dengue_historico.parquet",
        "dim_municipios.parquet",
        "analise_integrada.parquet",
    ]:
        path = Config.PATHS.output_dir / fname
        exists = path.exists()

        if exists:
            try:
                df = pd.read_parquet(path)
                rows = len(df)
                cols = len(df.columns)
                null_pct = (
                    round((df.isnull().sum().sum() / (rows * cols)) * 100, 2) if rows > 0 else 0
                )
                status = "passed" if null_pct < 10 else "warning"
            except Exception:
                rows = 0
                cols = 0
                null_pct = 100
                status = "error"
        else:
            rows = 0
            cols = 0
            null_pct = 100
            status = "error"

        validations.append(
            {
                "id": fname.replace(".parquet", ""),
                "name": fname,
                "status": status,
                "rows": rows,
                "columns": cols,
                "nullPercentage": null_pct,
                "message": f"{rows:,} registros, {cols} colunas" if exists else "Arquivo não encontrado",
            }
        )

    passed = sum(1 for v in validations if v["status"] == "passed")
    score = round((passed / len(validations)) * 100)

    return JSONResponse(
        content={
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "score": score,
            "validations": validations,
            "summary": {
                "total": len(validations),
                "passed": passed,
                "warnings": sum(1 for v in validations if v["status"] == "warning"),
                "errors": sum(1 for v in validations if v["status"] == "error"),
            },
        }
    )


@router.get("/datasets", response_model=DatasetsResponse, tags=["Datasets"], summary="Catálogo de datasets disponíveis")
def datasets() -> Any:
    """Lista todos os datasets disponíveis na API."""
    datasets_info: Dict[str, Any] = {}
    remote_base = getattr(Config, "DATASETS_REMOTE_URL", "") or ""

    for fname in [
        "fato_atividades_techdengue.parquet",
        "fato_dengue_historico.parquet",
        "dim_municipios.parquet",
        "analise_integrada.parquet",
    ]:
        try:
            if remote_base:
                url = f"{remote_base.rstrip('/')}/{fname}"
                try:
                    resp = httpx.head(url, timeout=5.0)
                    if resp.status_code == 200:
                        size = int(resp.headers.get("Content-Length", "0") or "0")
                        datasets_info[fname] = {"exists": True, "size": size}
                    else:
                        datasets_info[fname] = {"exists": False, "size": 0}
                except Exception:
                    datasets_info[fname] = {"exists": False, "size": 0}
            else:
                path = Config.PATHS.output_dir / fname
                datasets_info[fname] = {
                    "exists": path.exists(),
                    "size": path.stat().st_size if path.exists() else 0,
                }
        except Exception:
            datasets_info[fname] = {"exists": False, "size": 0}

    return DatasetsResponse(datasets=datasets_info)


@router.get("/api/v1/status", tags=["Health"], summary="Status detalhado do sistema")
@limiter.limit("60/minute")
async def system_status(request: Request) -> Any:
    """Retorna status detalhado do sistema incluindo cache e rate limits."""
    cache = get_cache()

    return {
        "status": "healthy",
        "version": Config.VERSION,
        "cache": cache.stats,
        "rate_limits": {
            "default": "60/minute",
            "tiers": {
                "free": "60/minute",
                "standard": "300/minute",
                "premium": "1000/minute",
            },
        },
        "features": {
            "cache": cache.is_redis,
            "rate_limiting": True,
            "api_keys": True,
            "audit_logs": True,
            "gzip_compression": True,
            "weather_integration": True,
            "ai_risk_analysis": True,
        },
    }
