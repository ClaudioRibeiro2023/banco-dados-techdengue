from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger
import httpx
import pandas as pd
import io

from src.config import Config
from src.api.schemas import HealthResponse, FactsResponse, FactRecord, SummaryResponse, SummaryItem, GoldAnaliseResponse, GoldAnaliseRecord, PageResponse, DatasetsResponse
from src.api.utils import read_parquet_cached
from src.repository import TechDengueRepository

# Fase 1 & 2: Cache, Rate Limiting, Auth, Audit
from src.core.cache import get_cache, cached
from src.core.rate_limiter import limiter, rate_limit_exceeded_handler
from src.core.auth import (
    APIKeyInfo, APIKeyCreate, APIKeyResponse, Tier,
    get_api_key_optional, get_api_key_required, require_tier,
    create_api_key, list_api_keys, revoke_api_key,
)
from src.core.audit import AuditMiddleware, get_recent_logs, get_audit_stats
from slowapi.errors import RateLimitExceeded

# Sentry (Observabilidade)
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

def init_sentry():
    """Inicializa Sentry se configurado."""
    if Config.SENTRY_DSN:
        sentry_sdk.init(
            dsn=Config.SENTRY_DSN,
            environment=Config.SENTRY_ENVIRONMENT,
            integrations=[
                FastApiIntegration(),
                StarletteIntegration(),
            ],
            traces_sample_rate=0.1,  # 10% das requisições
            profiles_sample_rate=0.1,
            send_default_pii=False,
        )
        logger.info(f"Sentry inicializado: {Config.SENTRY_ENVIRONMENT}")
    else:
        logger.info("Sentry não configurado (SENTRY_DSN vazio)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Config.validate()
    # Inicializar Sentry
    init_sentry()
    # Inicializar cache
    cache = get_cache()
    logger.info(f"Cache inicializado: {cache.stats['backend']}")
    yield
    logger.info("API shutdown")

app = FastAPI(
    title="TechDengue API",
    description="""
## 🦟 API de Dados do Projeto TechDengue

Sistema completo de análise de dados para combate à Dengue em Minas Gerais.

### Funcionalidades

- **Atividades TechDengue**: Dados de mapeamento e operações de campo
- **Dados Epidemiológicos**: Histórico de casos de dengue por município
- **Municípios**: Informações demográficas e geográficas de MG
- **Análise Integrada**: Dados consolidados para análise

### Arquitetura de Dados (Medallion)

- 🥉 **Bronze**: Dados brutos
- 🥈 **Silver**: Dados limpos e normalizados
- 🥇 **Gold**: Dados agregados e analíticos

### Exportação

Todos os endpoints de dados suportam exportação em `JSON`, `CSV` e `Parquet`.
    """,
    version=Config.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Health", "description": "Status e saúde da API"},
        {"name": "Datasets", "description": "Catálogo de datasets disponíveis"},
        {"name": "Atividades", "description": "Atividades de mapeamento TechDengue"},
        {"name": "Dengue", "description": "Dados epidemiológicos de dengue"},
        {"name": "Municípios", "description": "Dados dos municípios de MG"},
        {"name": "Análise Gold", "description": "Dados analíticos consolidados"},
        {"name": "GIS", "description": "Dados geoespaciais do PostgreSQL/PostGIS"},
        {"name": "Clima", "description": "Dados climáticos em tempo real (OpenWeather)"},
        {"name": "Análise de Risco", "description": "Análise preditiva de risco com IA"},
        {"name": "Admin", "description": "Administração: API Keys, Cache, Logs"},
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fase 1: Compressão Gzip
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Fase 2: Audit Logging
app.add_middleware(AuditMiddleware)

# Fase 1: Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)




def _df_to_records(df: pd.DataFrame) -> List[Dict[str, Any]]:
    out = []
    for rec in df.to_dict(orient="records"):
        for k, v in list(rec.items()):
            if isinstance(v, (pd.Timestamp, datetime)):
                rec[k] = v.isoformat()
            elif isinstance(v, date):
                rec[k] = v.isoformat()
        out.append(rec)
    return out


def _apply_fields(df: pd.DataFrame, fields: Optional[str]) -> pd.DataFrame:
    if fields:
        cols = [c.strip() for c in str(fields).split(",") if c.strip()]
        cols = [c for c in cols if c in df.columns]
        if cols:
            df = df.loc[:, cols]
    return df


def _export_df(df: pd.DataFrame, fmt: str, filename: str) -> StreamingResponse:
    if fmt == "csv":
        buf = io.StringIO()
        df.to_csv(buf, index=False)
        buf.seek(0)
        return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={
            "Content-Disposition": f"attachment; filename={filename}.csv"
        })
    if fmt == "parquet":
        b = io.BytesIO()
        df.to_parquet(b, index=False)
        b.seek(0)
        return StreamingResponse(b, media_type="application/x-parquet", headers={
            "Content-Disposition": f"attachment; filename={filename}.parquet"
        })
    return StreamingResponse(iter([""]), media_type="text/plain")


@app.get("/health", response_model=HealthResponse, tags=["Health"], summary="Verificar saúde da API")
def health() -> Any:
    """
    Retorna o status de saúde da API, incluindo:
    - Status geral (ok/error)
    - Versão da API
    - Datasets disponíveis e seus tamanhos
    - Status da conexão com o banco PostgreSQL
    """
    datasets = {}
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
                    else:
                        datasets[fname] = {"exists": False, "size": 0}
                except Exception:
                    datasets[fname] = {"exists": False, "size": 0}
            else:
                path = (Config.PATHS.output_dir / fname)
                datasets[fname] = {"exists": path.exists(), "size": path.stat().st_size if path.exists() else 0}
        except Exception:
            datasets[fname] = {"exists": False, "size": 0}

    db_ok = False
    try:
        repo = TechDengueRepository()
        db_ok = repo.test_connection()
    except Exception as e:
        logger.warning(f"DB health check failed: {e}")
        db_ok = False

    return HealthResponse(ok=True, version=Config.VERSION, datasets=datasets, db_connected=db_ok)


@app.get("/facts", response_model=FactsResponse, tags=["Atividades"], summary="Listar atividades TechDengue")
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
    limit = max(1, min(limit, 1000))
    offset = max(0, offset)

    df = read_parquet_cached("fato_atividades_techdengue.parquet")
    # columns in parquet were normalized to lowercase
    if codigo_ibge:
        df = df[df["codigo_ibge"].astype(str) == str(codigo_ibge)]
    if atividade:
        df = df[df["nomenclatura_atividade"].astype(str).str.contains(str(atividade), case=False, na=False)]
    if start_date:
        df = df[pd.to_datetime(df["data_map"]).dt.date >= start_date]
    if end_date:
        df = df[pd.to_datetime(df["data_map"]).dt.date <= end_date]

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(order == "asc"), na_position="last")

    if format != "json":
        df_export = _apply_fields(df, fields)
        page = df_export.iloc[offset: offset + limit]
        return _export_df(page, format, "facts")

    total = len(df)
    page = df.iloc[offset: offset + limit]

    items: List[FactRecord] = []
    for rec in _df_to_records(page):
        items.append(FactRecord(**{
            "codigo_ibge": rec.get("codigo_ibge"),
            "municipio": rec.get("municipio"),
            "data_map": rec.get("data_map"),
            "nomenclatura_atividade": rec.get("nomenclatura_atividade"),
            "pois": rec.get("pois"),
            "devolutivas": rec.get("devolutivas"),
            "hectares_mapeados": rec.get("hectares_mapeados"),
        }))

    return FactsResponse(total=total, limit=limit, offset=offset, items=items)


@app.get("/facts/summary", response_model=SummaryResponse, tags=["Atividades"], summary="Resumo agregado das atividades")
def facts_summary(
    group_by: Optional[str] = Query(None, pattern="^(municipio|codigo_ibge|atividade)$"),
) -> Any:
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
        g = df.groupby(key_col).agg({
            "pois": "sum",
            "devolutivas": "sum",
            "hectares_mapeados": "sum",
            "nomenclatura_atividade": "count",
        }).reset_index().rename(columns={
            key_col: "key",
            "nomenclatura_atividade": "atividades",
        })
        items = [SummaryItem(
            key=str(r["key"]) if r.get("key") is not None else None,
            total_pois=int(r["pois"]) if pd.notna(r["pois"]) else 0,
            total_devolutivas=float(r["devolutivas"]) if pd.notna(r["devolutivas"]) else 0.0,
            total_hectares=float(r["hectares_mapeados"]) if pd.notna(r["hectares_mapeados"]) else 0.0,
            atividades=int(r["atividades"]) if pd.notna(r["atividades"]) else 0,
        ) for _, r in g.iterrows()]
    else:
        s = df.agg({
            "pois": "sum",
            "devolutivas": "sum",
            "hectares_mapeados": "sum",
            "nomenclatura_atividade": "count",
        })
        items = [SummaryItem(
            key=None,
            total_pois=int(s.get("pois", 0) or 0),
            total_devolutivas=float(s.get("devolutivas", 0.0) or 0.0),
            total_hectares=float(s.get("hectares_mapeados", 0.0) or 0.0),
            atividades=int(s.get("nomenclatura_atividade", 0) or 0),
        )]

    return SummaryResponse(generated_at=datetime.now(timezone.utc), group_by=group_by, summary=items)


@app.get("/gis/banco", tags=["GIS"], summary="Dados do banco GIS")
def gis_banco(limit: int = 100) -> Any:
    limit = max(1, min(limit, 1000))
    repo = TechDengueRepository()
    try:
        df = repo.get_banco_techdengue_all(limit=limit)
        return JSONResponse(content=_df_to_records(df))
    except Exception as e:
        logger.error(f"/gis/banco error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/gold/analise", response_model=GoldAnaliseResponse, tags=["Análise Gold"], summary="Análise integrada consolidada")
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
        df_export = _apply_fields(df, fields)
        page = df_export.iloc[offset: offset + limit]
        return _export_df(page, format, "gold_analise")

    total = len(df)
    page = df.iloc[offset: offset + limit]

    items: List[GoldAnaliseRecord] = []
    for rec in _df_to_records(page):
        items.append(GoldAnaliseRecord(**{
            "codigo_ibge": rec.get("codigo_ibge"),
            "municipio": rec.get("municipio"),
            "competencia": rec.get("competencia"),
            "total_pois": rec.get("total_pois"),
            "total_devolutivas": rec.get("total_devolutivas"),
            "total_hectares": rec.get("total_hectares"),
            "atividades": rec.get("atividades"),
        }))

    return GoldAnaliseResponse(total=total, limit=limit, offset=offset, items=items)


@app.get("/dengue", response_model=PageResponse, tags=["Dengue"], summary="Dados históricos de dengue")
def dengue(
    codigo_ibge: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: Optional[str] = None,
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    format: Optional[str] = Query("json", pattern="^(json|csv|parquet)$"),
    fields: Optional[str] = None,
) -> Any:
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
        df_export = _apply_fields(df, fields)
        page = df_export.iloc[offset: offset + limit]
        return _export_df(page, format, "dengue")

    df = _apply_fields(df, fields)
    total = len(df)
    page = df.iloc[offset: offset + limit]
    return PageResponse(total=total, limit=limit, offset=offset, items=_df_to_records(page))


@app.get("/municipios", response_model=PageResponse, tags=["Municípios"], summary="Dados dos municípios de MG")
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
        df_export = _apply_fields(df, fields)
        page = df_export.iloc[offset: offset + limit]
        return _export_df(page, format, "municipios")

    df = _apply_fields(df, fields)
    total = len(df)
    page = df.iloc[offset: offset + limit]
    return PageResponse(total=total, limit=limit, offset=offset, items=_df_to_records(page))


@app.get("/datasets", response_model=DatasetsResponse, tags=["Datasets"], summary="Catálogo de datasets disponíveis")
def datasets() -> Any:
    datasets: Dict[str, Any] = {}
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
                    else:
                        datasets[fname] = {"exists": False, "size": 0}
                except Exception:
                    datasets[fname] = {"exists": False, "size": 0}
            else:
                path = (Config.PATHS.output_dir / fname)
                datasets[fname] = {"exists": path.exists(), "size": path.stat().st_size if path.exists() else 0}
        except Exception:
            datasets[fname] = {"exists": False, "size": 0}
    return DatasetsResponse(datasets=datasets)


@app.get("/gis/pois", tags=["GIS"], summary="POIs do campo")
def gis_pois(limit: int = 100, id_atividade: Optional[str] = None) -> Any:
    limit = max(1, min(limit, 2000))
    repo = TechDengueRepository()
    try:
        if id_atividade:
            df = repo.get_planilha_campo_by_atividade(id_atividade=id_atividade)
            if len(df) > limit:
                df = df.head(limit)
        else:
            df = repo.get_planilha_campo_all(limit=limit)
        return JSONResponse(content=_df_to_records(df))
    except Exception as e:
        logger.error(f"/gis/pois error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/monitor", tags=["Health"], summary="Dashboard de monitoramento")
def monitor() -> Any:
    """
    Retorna dados consolidados para o dashboard de monitoramento.
    Inclui status do sistema, estatísticas de qualidade e métricas gerais.
    """
    # Verificar datasets
    datasets_status = {}
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

    # Verificar banco de dados
    db_connected = False
    try:
        repo = TechDengueRepository()
        db_connected = repo.test_connection()
    except Exception:
        pass

    # Carregar estatísticas dos dados
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

    return JSONResponse(content={
        "lastUpdate": datetime.now(timezone.utc).isoformat(),
        "database": {
            "status": "online" if db_connected else "offline",
            "message": "PostgreSQL RDS conectado" if db_connected else "Sem conexão"
        },
        "qualityScore": 98,  # Placeholder - pode ser calculado
        "validations": {
            "total": 4,
            "passed": 4 if all(d["exists"] for d in datasets_status.values()) else 3
        },
        "layers": {
            "bronze": 5,
            "silver": 4,
            "gold": 2
        },
        "stats": {
            "totalPois": total_pois,
            "totalHectares": round(total_hectares, 2),
            "totalAtividades": total_atividades,
            "totalMunicipios": total_municipios,
            "totalDatasets": len(datasets_status),
            "totalSizeBytes": total_size
        },
        "datasets": datasets_status
    })


@app.get("/quality", tags=["Health"], summary="Relatório de qualidade dos dados")
def quality_report() -> Any:
    """
    Retorna relatório de qualidade dos dados, incluindo validações e métricas.
    """
    validations = []
    
    # Validar cada dataset
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
                null_pct = round((df.isnull().sum().sum() / (rows * cols)) * 100, 2) if rows > 0 else 0
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
        
        validations.append({
            "id": fname.replace(".parquet", ""),
            "name": fname,
            "status": status,
            "rows": rows,
            "columns": cols,
            "nullPercentage": null_pct,
            "message": f"{rows:,} registros, {cols} colunas" if exists else "Arquivo não encontrado"
        })
    
    # Calcular score geral
    passed = sum(1 for v in validations if v["status"] == "passed")
    score = round((passed / len(validations)) * 100)
    
    return JSONResponse(content={
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "score": score,
        "validations": validations,
        "summary": {
            "total": len(validations),
            "passed": passed,
            "warnings": sum(1 for v in validations if v["status"] == "warning"),
            "errors": sum(1 for v in validations if v["status"] == "error")
        }
    })


# ==================== Fase 2: Endpoints de Administração ====================

@app.get(
    "/api/v1/cache/stats",
    tags=["Admin"],
    summary="Estatísticas do cache",
)
@limiter.limit("60/minute")
async def cache_stats(request: Request) -> Any:
    """Retorna estatísticas do sistema de cache."""
    cache = get_cache()
    return {
        "cache": cache.stats,
        "ttl_seconds": cache.default_ttl,
    }


@app.post(
    "/api/v1/cache/clear",
    tags=["Admin"],
    summary="Limpar cache",
)
@limiter.limit("5/minute")
async def cache_clear(
    request: Request,
    pattern: Optional[str] = Query(None, description="Padrão para limpar (ex: 'facts')"),
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Limpa o cache (requer API Key)."""
    cache = get_cache()
    if pattern:
        count = cache.clear_pattern(pattern)
        return {"cleared": count, "pattern": pattern}
    else:
        cache.clear_all()
        return {"cleared": "all"}


@app.post(
    "/api/v1/keys",
    tags=["Admin"],
    summary="Criar API Key",
    response_model=APIKeyResponse,
)
@limiter.limit("10/minute")
async def create_key(
    request: Request,
    data: APIKeyCreate,
) -> APIKeyResponse:
    """
    Cria uma nova API Key.
    
    **IMPORTANTE**: A chave completa só é exibida uma vez. Salve-a em local seguro.
    """
    return create_api_key(data)


@app.get(
    "/api/v1/keys",
    tags=["Admin"],
    summary="Listar API Keys",
)
@limiter.limit("60/minute")
async def list_keys(
    request: Request,
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Lista API Keys (apenas para usuários autenticados)."""
    keys = list_api_keys(owner=api_key.owner if api_key.tier != Tier.ADMIN else None)
    return {
        "keys": [
            {
                "key_id": k.key_id,
                "name": k.name,
                "tier": k.tier.value,
                "owner": k.owner,
                "created_at": k.created_at.isoformat(),
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "is_active": k.is_active,
            }
            for k in keys
        ]
    }


@app.delete(
    "/api/v1/keys/{key_id}",
    tags=["Admin"],
    summary="Revogar API Key",
)
@limiter.limit("10/minute")
async def delete_key(
    request: Request,
    key_id: str,
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Revoga uma API Key."""
    success = revoke_api_key(key_id)
    if success:
        return {"revoked": key_id}
    else:
        return JSONResponse(
            status_code=404,
            content={"error": "key_not_found", "message": f"API Key {key_id} não encontrada"}
        )


@app.get(
    "/api/v1/audit/logs",
    tags=["Admin"],
    summary="Logs de auditoria",
)
@limiter.limit("30/minute")
async def audit_logs(
    request: Request,
    limit: int = Query(100, le=1000),
    path: Optional[str] = Query(None, description="Filtrar por path"),
    min_status: Optional[int] = Query(None, description="Status mínimo (ex: 400)"),
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Retorna logs de auditoria recentes (requer API Key)."""
    logs = get_recent_logs(
        limit=limit,
        path_filter=path,
        api_key_id=api_key.key_id if api_key.tier != Tier.ADMIN else None,
        min_status=min_status,
    )
    return {
        "count": len(logs),
        "logs": [l.model_dump() for l in logs]
    }


@app.get(
    "/api/v1/audit/stats",
    tags=["Admin"],
    summary="Estatísticas de uso",
)
@limiter.limit("60/minute")
async def audit_statistics(
    request: Request,
    api_key: Optional[APIKeyInfo] = Depends(get_api_key_optional),
) -> Any:
    """Retorna estatísticas de uso da API."""
    return get_audit_stats()


@app.get(
    "/api/v1/status",
    tags=["Health"],
    summary="Status detalhado do sistema",
)
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
            }
        },
        "features": {
            "cache": cache.is_redis,
            "rate_limiting": True,
            "api_keys": True,
            "audit_logs": True,
            "gzip_compression": True,
            "weather_integration": True,
            "ai_risk_analysis": True,
        }
    }


# ==================== Fase 3: Enriquecimento & Análise de Risco ====================

from src.services.weather import get_weather_service, WeatherData, DengueWeatherRisk
from src.services.risk_analyzer import (
    get_risk_analyzer, 
    RiskAnalysisRequest, 
    RiskAnalysisResponse,
    EpidemicAlert,
)


@app.get(
    "/api/v1/weather/{cidade}",
    tags=["Clima"],
    summary="Clima atual de uma cidade",
    response_model=WeatherData,
)
@limiter.limit("60/minute")
async def get_weather(
    request: Request,
    cidade: str,
) -> Any:
    """
    Obtém condições climáticas atuais de uma cidade de MG.
    
    Inclui índice de favorabilidade para dengue baseado em:
    - Temperatura (ideal: 25-30°C)
    - Umidade (ideal: >70%)
    - Precipitação
    - Vento
    """
    service = get_weather_service()
    weather = await service.get_current_weather(cidade)
    
    if not weather:
        return JSONResponse(
            status_code=404,
            content={"error": "cidade_nao_encontrada", "message": f"Cidade {cidade} não encontrada"}
        )
    
    return weather.model_dump()


@app.get(
    "/api/v1/weather",
    tags=["Clima"],
    summary="Clima de todas as cidades principais",
)
@limiter.limit("30/minute")
async def get_all_weather(request: Request) -> Any:
    """Obtém clima de todas as principais cidades de MG."""
    service = get_weather_service()
    weather_list = await service.get_all_cities_weather()
    return {
        "count": len(weather_list),
        "cidades": [w.model_dump() for w in weather_list]
    }


@app.get(
    "/api/v1/weather/{cidade}/risk",
    tags=["Clima"],
    summary="Risco climático de dengue",
    response_model=DengueWeatherRisk,
)
@limiter.limit("60/minute")
async def get_weather_risk(
    request: Request,
    cidade: str,
) -> Any:
    """
    Analisa risco de dengue baseado em condições climáticas atuais.
    """
    service = get_weather_service()
    weather = await service.get_current_weather(cidade)
    
    if not weather:
        return JSONResponse(
            status_code=404,
            content={"error": "cidade_nao_encontrada"}
        )
    
    risk = service.analyze_dengue_risk(weather)
    return risk.model_dump()


@app.post(
    "/api/v1/risk/analyze",
    tags=["Análise de Risco"],
    summary="Análise de risco com IA",
    response_model=RiskAnalysisResponse,
)
@limiter.limit("20/minute")
async def analyze_risk(
    request: Request,
    data: RiskAnalysisRequest,
) -> Any:
    """
    Análise completa de risco de dengue usando IA (Llama 3.3).
    
    Combina:
    - Dados epidemiológicos
    - Condições climáticas
    - Informações demográficas
    - Histórico de ações
    
    Retorna nível de risco, tendência, fatores principais e recomendações.
    """
    analyzer = get_risk_analyzer()
    result = await analyzer.analyze_risk(data)
    return result.model_dump()


@app.get(
    "/api/v1/risk/municipio/{codigo_ibge}",
    tags=["Análise de Risco"],
    summary="Risco de um município por código IBGE",
)
@limiter.limit("30/minute")
async def get_municipio_risk(
    request: Request,
    codigo_ibge: str,
) -> Any:
    """
    Obtém análise de risco de um município específico.
    Combina dados do banco com análise climática em tempo real.
    """
    # Buscar dados do município
    try:
        df_municipios = read_parquet_cached("dim_municipios.parquet")
        municipio = df_municipios[df_municipios["codigo_ibge"].astype(str) == codigo_ibge]
        
        if municipio.empty:
            return JSONResponse(
                status_code=404,
                content={"error": "municipio_nao_encontrado"}
            )
        
        mun = municipio.iloc[0]
        nome = mun.get("nome_municipio", mun.get("municipio", "Desconhecido"))
        
        # Buscar clima
        weather_service = get_weather_service()
        weather = await weather_service.get_current_weather(nome)
        
        # Preparar análise
        analyzer = get_risk_analyzer()
        req = RiskAnalysisRequest(
            municipio=nome,
            codigo_ibge=codigo_ibge,
            populacao=int(mun.get("populacao", 100000)),
            area_km2=float(mun.get("area_km2", 100)),
            temperatura_media=weather.temperatura if weather else 25.0,
            umidade_media=weather.umidade if weather else 70.0,
        )
        
        result = await analyzer.analyze_risk(req)
        
        return {
            "municipio": nome,
            "codigo_ibge": codigo_ibge,
            "risco": result.model_dump(),
            "clima": weather.model_dump() if weather else None,
        }
        
    except Exception as e:
        logger.error(f"Erro ao analisar risco: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "analise_falhou", "message": str(e)}
        )


@app.get(
    "/api/v1/risk/dashboard",
    tags=["Análise de Risco"],
    summary="Dashboard de risco regional",
)
@limiter.limit("10/minute")
async def risk_dashboard(request: Request) -> Any:
    """
    Retorna visão consolidada de risco para dashboard.
    Inclui clima e risco das principais cidades de MG.
    """
    weather_service = get_weather_service()
    analyzer = get_risk_analyzer()
    
    # Obter clima de todas as cidades
    weather_list = await weather_service.get_all_cities_weather()
    
    # Analisar risco de cada cidade
    results = []
    for weather in weather_list:
        risk = weather_service.analyze_dengue_risk(weather)
        results.append({
            "cidade": weather.cidade,
            "temperatura": weather.temperatura,
            "umidade": weather.umidade,
            "indice_favorabilidade": weather.indice_favorabilidade_dengue,
            "risco_climatico": risk.risco_climatico,
            "score": risk.score,
        })
    
    # Ordenar por score (maior risco primeiro)
    results.sort(key=lambda x: x["score"], reverse=True)
    
    # Gerar alerta se necessário
    criticos = [r for r in results if r["risco_climatico"] == "critico"]
    altos = [r for r in results if r["risco_climatico"] == "alto"]
    
    alerta = None
    if len(criticos) >= 2:
        alerta = {
            "tipo": "ALERTA",
            "severidade": "critica",
            "mensagem": f"{len(criticos)} cidades em condições críticas para dengue",
            "cidades": [r["cidade"] for r in criticos],
        }
    elif len(altos) >= 3:
        alerta = {
            "tipo": "ATENÇÃO",
            "severidade": "alta",
            "mensagem": f"{len(altos)} cidades em condições de alto risco",
            "cidades": [r["cidade"] for r in altos],
        }
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_cidades": len(results),
        "resumo": {
            "critico": len(criticos),
            "alto": len(altos),
            "medio": len([r for r in results if r["risco_climatico"] == "medio"]),
            "baixo": len([r for r in results if r["risco_climatico"] == "baixo"]),
        },
        "alerta": alerta,
        "cidades": results,
    }
