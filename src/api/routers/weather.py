"""
Router de Clima e Análise de Risco.
Endpoints: /api/v1/weather/*, /api/v1/risk/*
"""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from loguru import logger

from src.api.utils import read_parquet_cached
from src.core.rate_limiter import limiter
from src.services.weather import get_weather_service, WeatherData, DengueWeatherRisk
from src.services.risk_analyzer import (
    get_risk_analyzer,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
)

router = APIRouter(prefix="/api/v1", tags=["Clima"])


@router.get(
    "/weather/{cidade}",
    summary="Clima atual de uma cidade",
    response_model=WeatherData,
)
@limiter.limit("60/minute")
async def get_weather(request: Request, cidade: str) -> Any:
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
            content={"error": "cidade_nao_encontrada", "message": f"Cidade {cidade} não encontrada"},
        )

    return weather.model_dump()


@router.get("/weather", summary="Clima de todas as cidades principais")
@limiter.limit("30/minute")
async def get_all_weather(request: Request) -> Any:
    """Obtém clima de todas as principais cidades de MG."""
    service = get_weather_service()
    weather_list = await service.get_all_cities_weather()
    return {"count": len(weather_list), "cidades": [w.model_dump() for w in weather_list]}


@router.get(
    "/weather/{cidade}/risk",
    summary="Risco climático de dengue",
    response_model=DengueWeatherRisk,
)
@limiter.limit("60/minute")
async def get_weather_risk(request: Request, cidade: str) -> Any:
    """Analisa risco de dengue baseado em condições climáticas atuais."""
    service = get_weather_service()
    weather = await service.get_current_weather(cidade)

    if not weather:
        return JSONResponse(status_code=404, content={"error": "cidade_nao_encontrada"})

    risk = service.analyze_dengue_risk(weather)
    return risk.model_dump()


@router.post(
    "/risk/analyze",
    tags=["Análise de Risco"],
    summary="Análise de risco com IA",
    response_model=RiskAnalysisResponse,
)
@limiter.limit("20/minute")
async def analyze_risk(request: Request, data: RiskAnalysisRequest) -> Any:
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


@router.get(
    "/risk/municipio/{codigo_ibge}",
    tags=["Análise de Risco"],
    summary="Risco de um município por código IBGE",
)
@limiter.limit("30/minute")
async def get_municipio_risk(request: Request, codigo_ibge: str) -> Any:
    """
    Obtém análise de risco de um município específico.
    Combina dados do banco com análise climática em tempo real.
    """
    try:
        df_municipios = read_parquet_cached("dim_municipios.parquet")
        municipio = df_municipios[df_municipios["codigo_ibge"].astype(str) == codigo_ibge]

        if municipio.empty:
            return JSONResponse(status_code=404, content={"error": "municipio_nao_encontrado"})

        mun = municipio.iloc[0]
        nome = mun.get("nome_municipio", mun.get("municipio", "Desconhecido"))

        weather_service = get_weather_service()
        weather = await weather_service.get_current_weather(nome)

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
            status_code=500, content={"error": "analise_falhou", "message": str(e)}
        )


@router.get(
    "/risk/dashboard",
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

    weather_list = await weather_service.get_all_cities_weather()

    results = []
    for weather in weather_list:
        risk = weather_service.analyze_dengue_risk(weather)
        results.append(
            {
                "cidade": weather.cidade,
                "temperatura": weather.temperatura,
                "umidade": weather.umidade,
                "indice_favorabilidade": weather.indice_favorabilidade_dengue,
                "risco_climatico": risk.risco_climatico,
                "score": risk.score,
            }
        )

    results.sort(key=lambda x: x["score"], reverse=True)

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
