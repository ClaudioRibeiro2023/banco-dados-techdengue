"""
TechDengue API - Aplicação Principal.
Arquivo refatorado usando routers modulares.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from slowapi.errors import RateLimitExceeded

from src.config import Config
from src.core.cache import get_cache
from src.core.rate_limiter import limiter, rate_limit_exceeded_handler
from src.core.audit import AuditMiddleware

# Routers
from src.api.routers import (
    health_router,
    facts_router,
    weather_router,
    gis_router,
    admin_router,
)


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
            traces_sample_rate=0.1,
            profiles_sample_rate=0.1,
            send_default_pii=False,
        )
        logger.info(f"Sentry inicializado: {Config.SENTRY_ENVIRONMENT}")
    else:
        logger.info("Sentry não configurado (SENTRY_DSN vazio)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação."""
    Config.validate()
    init_sentry()
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
    ],
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(AuditMiddleware)

# Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Registrar Routers
app.include_router(health_router)
app.include_router(facts_router)
app.include_router(weather_router)
app.include_router(gis_router)
app.include_router(admin_router)


@app.get("/", tags=["Health"], summary="Root endpoint")
async def root():
    """
    Endpoint raiz da API.
    Retorna informações básicas e links úteis.
    """
    return {
        "name": "TechDengue API",
        "version": Config.VERSION,
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "endpoints": {
            "facts": "/facts",
            "dengue": "/dengue",
            "municipios": "/municipios",
            "weather": "/api/v1/weather",
            "gis": "/gis/banco",
            "monitor": "/monitor",
        },
    }
