"""
Serviço de dados climáticos via OpenWeather API.
Fatores climáticos são fundamentais para análise de risco de dengue.
"""

import os
from datetime import datetime, timezone
from typing import Optional, Any

import httpx
from pydantic import BaseModel, Field
from loguru import logger

from src.core.cache import cached, get_cache


class WeatherData(BaseModel):
    """Dados climáticos atuais."""
    cidade: str
    estado: str = "MG"
    temperatura: float = Field(..., description="Temperatura em Celsius")
    sensacao_termica: float = Field(..., description="Sensação térmica em Celsius")
    umidade: int = Field(..., description="Umidade relativa (%)")
    pressao: int = Field(..., description="Pressão atmosférica (hPa)")
    velocidade_vento: float = Field(..., description="Velocidade do vento (m/s)")
    nebulosidade: int = Field(..., description="Cobertura de nuvens (%)")
    chuva_1h: float = Field(default=0, description="Chuva na última hora (mm)")
    descricao: str = Field(..., description="Descrição do tempo")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Índices de risco calculados
    indice_favorabilidade_dengue: float = Field(
        default=0,
        description="Índice de 0-100 indicando condições favoráveis ao mosquito"
    )


class WeatherForecast(BaseModel):
    """Previsão do tempo para os próximos dias."""
    cidade: str
    previsoes: list[dict[str, Any]]


class DengueWeatherRisk(BaseModel):
    """Análise de risco baseada em condições climáticas."""
    municipio: str
    codigo_ibge: Optional[str] = None
    risco_climatico: str = Field(..., description="baixo/medio/alto/critico")
    score: float = Field(..., description="Score de 0-100")
    fatores: dict[str, Any]
    recomendacoes: list[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WeatherService:
    """
    Serviço para obter dados climáticos e calcular risco de dengue.
    
    Fatores climáticos que influenciam o Aedes aegypti:
    - Temperatura ideal: 25-30°C (acelera ciclo de vida)
    - Umidade: >60% (favorece reprodução)
    - Chuvas: Aumentam criadouros, mas chuvas fortes podem remover larvas
    """
    
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    # Coordenadas das principais cidades de MG
    CIDADES_MG = {
        "Belo Horizonte": {"lat": -19.9167, "lon": -43.9345, "ibge": "3106200"},
        "Uberlândia": {"lat": -18.9186, "lon": -48.2772, "ibge": "3170206"},
        "Contagem": {"lat": -19.9319, "lon": -44.0539, "ibge": "3118601"},
        "Juiz de Fora": {"lat": -21.7642, "lon": -43.3503, "ibge": "3136702"},
        "Betim": {"lat": -19.9678, "lon": -44.1983, "ibge": "3106705"},
        "Montes Claros": {"lat": -16.7350, "lon": -43.8617, "ibge": "3143302"},
        "Ribeirão das Neves": {"lat": -19.7669, "lon": -44.0867, "ibge": "3154606"},
        "Uberaba": {"lat": -19.7478, "lon": -47.9319, "ibge": "3170107"},
        "Governador Valadares": {"lat": -18.8511, "lon": -41.9494, "ibge": "3127701"},
        "Ipatinga": {"lat": -19.4683, "lon": -42.5367, "ibge": "3131307"},
    }
    
    # Mapeamento de nomes normalizados (sem acentos, lowercase) para nomes reais
    CIDADES_NORMALIZE = {
        "belo horizonte": "Belo Horizonte",
        "belo-horizonte": "Belo Horizonte",
        "belohorizonte": "Belo Horizonte",
        "uberlandia": "Uberlândia",
        "contagem": "Contagem",
        "juiz de fora": "Juiz de Fora",
        "juiz-de-fora": "Juiz de Fora",
        "juizdefora": "Juiz de Fora",
        "betim": "Betim",
        "montes claros": "Montes Claros",
        "montes-claros": "Montes Claros",
        "montesclaros": "Montes Claros",
        "ribeirao das neves": "Ribeirão das Neves",
        "ribeirao-das-neves": "Ribeirão das Neves",
        "ribeiraoneves": "Ribeirão das Neves",
        "uberaba": "Uberaba",
        "governador valadares": "Governador Valadares",
        "governador-valadares": "Governador Valadares",
        "governadorvaladares": "Governador Valadares",
        "ipatinga": "Ipatinga",
    }
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENWEATHER_API_KEY")
        self._client = httpx.AsyncClient(timeout=10.0)
        
        if not self.api_key:
            logger.warning("OpenWeather API key não configurada")
    
    async def close(self):
        """Fecha o cliente HTTP."""
        await self._client.aclose()
    
    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)
    
    def _normalize_cidade(self, cidade: str) -> str:
        """Normaliza nome de cidade para busca."""
        # Remover acentos e converter para lowercase
        import unicodedata
        normalized = unicodedata.normalize('NFKD', cidade.lower())
        normalized = normalized.encode('ASCII', 'ignore').decode('ASCII')
        normalized = normalized.replace('-', ' ').strip()
        
        # Tentar encontrar no mapeamento
        return self.CIDADES_NORMALIZE.get(normalized, 
               self.CIDADES_NORMALIZE.get(cidade.lower(), cidade))
    
    async def get_current_weather(
        self,
        cidade: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Optional[WeatherData]:
        """
        Obtém clima atual de uma cidade.
        
        Args:
            cidade: Nome da cidade
            lat: Latitude (opcional se cidade estiver no dicionário)
            lon: Longitude (opcional se cidade estiver no dicionário)
        """
        # Normalizar nome da cidade
        cidade_normalizada = self._normalize_cidade(cidade)
        
        if not self.is_configured:
            return self._get_mock_weather(cidade_normalizada)
        
        # Obter coordenadas
        if lat is None or lon is None:
            coords = self.CIDADES_MG.get(cidade_normalizada)
            if coords:
                lat, lon = coords["lat"], coords["lon"]
            else:
                logger.warning(f"Coordenadas não encontradas para {cidade} (normalizado: {cidade_normalizada})")
                return None
        
        # Verificar cache
        cache = get_cache()
        cache_key = f"weather:{cidade}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return WeatherData(**cached_data)
        
        try:
            response = await self._client.get(
                f"{self.BASE_URL}/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric",
                    "lang": "pt_br",
                }
            )
            response.raise_for_status()
            data = response.json()
            
            weather = WeatherData(
                cidade=cidade_normalizada,
                temperatura=data["main"]["temp"],
                sensacao_termica=data["main"]["feels_like"],
                umidade=data["main"]["humidity"],
                pressao=data["main"]["pressure"],
                velocidade_vento=data["wind"]["speed"],
                nebulosidade=data["clouds"]["all"],
                chuva_1h=data.get("rain", {}).get("1h", 0),
                descricao=data["weather"][0]["description"],
            )
            
            # Calcular índice de favorabilidade
            weather.indice_favorabilidade_dengue = self._calcular_favorabilidade(weather)
            
            # Cachear por 30 minutos
            cache.set(cache_key, weather.model_dump(), ttl=1800)
            
            return weather
            
        except Exception as e:
            logger.error(f"Erro ao obter clima de {cidade}: {e}")
            return self._get_mock_weather(cidade_normalizada)
    
    async def get_all_cities_weather(self) -> list[WeatherData]:
        """Obtém clima de todas as cidades principais de MG."""
        results = []
        for cidade, coords in self.CIDADES_MG.items():
            weather = await self.get_current_weather(
                cidade, 
                lat=coords["lat"], 
                lon=coords["lon"]
            )
            if weather:
                results.append(weather)
        return results
    
    def _calcular_favorabilidade(self, weather: WeatherData) -> float:
        """
        Calcula índice de favorabilidade para dengue baseado em condições climáticas.
        
        Retorna valor de 0-100 onde:
        - 0-25: Condições desfavoráveis
        - 25-50: Risco baixo
        - 50-75: Risco moderado
        - 75-100: Condições muito favoráveis (alto risco)
        """
        score = 0
        
        # Temperatura (peso 40%)
        # Ideal: 25-30°C
        temp = weather.temperatura
        if 25 <= temp <= 30:
            score += 40  # Temperatura ideal
        elif 22 <= temp < 25 or 30 < temp <= 33:
            score += 30  # Temperatura boa
        elif 18 <= temp < 22 or 33 < temp <= 35:
            score += 15  # Temperatura aceitável
        else:
            score += 5   # Temperatura desfavorável
        
        # Umidade (peso 35%)
        # Ideal: >70%
        umidade = weather.umidade
        if umidade >= 80:
            score += 35
        elif umidade >= 70:
            score += 28
        elif umidade >= 60:
            score += 20
        elif umidade >= 50:
            score += 10
        else:
            score += 5
        
        # Chuva (peso 15%)
        # Chuva leve é favorável, chuva forte pode remover larvas
        chuva = weather.chuva_1h
        if 1 <= chuva <= 10:
            score += 15  # Chuva ideal
        elif 0 < chuva < 1 or 10 < chuva <= 20:
            score += 10
        elif chuva > 20:
            score += 5   # Chuva forte (remove larvas)
        else:
            score += 8   # Sem chuva
        
        # Vento (peso 10%)
        # Vento fraco é favorável
        vento = weather.velocidade_vento
        if vento < 2:
            score += 10
        elif vento < 5:
            score += 7
        elif vento < 10:
            score += 4
        else:
            score += 2
        
        return min(100, max(0, score))
    
    def analyze_dengue_risk(self, weather: WeatherData) -> DengueWeatherRisk:
        """
        Analisa risco de dengue baseado em condições climáticas.
        """
        score = weather.indice_favorabilidade_dengue
        
        # Classificar risco
        if score >= 75:
            risco = "critico"
            recomendacoes = [
                "Alerta máximo para dengue",
                "Intensificar mutirões de limpeza",
                "Ativar centros de hidratação",
                "Reforçar equipes de agentes de saúde",
            ]
        elif score >= 50:
            risco = "alto"
            recomendacoes = [
                "Condições muito favoráveis ao mosquito",
                "Realizar campanhas de conscientização",
                "Verificar pontos de acúmulo de água",
            ]
        elif score >= 25:
            risco = "medio"
            recomendacoes = [
                "Manter vigilância ativa",
                "Continuar ações preventivas rotineiras",
            ]
        else:
            risco = "baixo"
            recomendacoes = [
                "Condições desfavoráveis ao mosquito",
                "Manter prevenção básica",
            ]
        
        return DengueWeatherRisk(
            municipio=weather.cidade,
            risco_climatico=risco,
            score=score,
            fatores={
                "temperatura": {
                    "valor": weather.temperatura,
                    "unidade": "°C",
                    "ideal": "25-30°C",
                },
                "umidade": {
                    "valor": weather.umidade,
                    "unidade": "%",
                    "ideal": ">70%",
                },
                "chuva_1h": {
                    "valor": weather.chuva_1h,
                    "unidade": "mm",
                    "ideal": "1-10mm",
                },
                "vento": {
                    "valor": weather.velocidade_vento,
                    "unidade": "m/s",
                    "ideal": "<5m/s",
                },
            },
            recomendacoes=recomendacoes,
        )
    
    def _get_mock_weather(self, cidade: str) -> WeatherData:
        """Retorna dados mock quando API não está disponível."""
        import random
        
        weather = WeatherData(
            cidade=cidade,
            temperatura=round(random.uniform(22, 32), 1),
            sensacao_termica=round(random.uniform(24, 35), 1),
            umidade=random.randint(50, 90),
            pressao=random.randint(1010, 1020),
            velocidade_vento=round(random.uniform(1, 8), 1),
            nebulosidade=random.randint(20, 80),
            chuva_1h=round(random.uniform(0, 5), 1),
            descricao="parcialmente nublado (dados simulados)",
        )
        weather.indice_favorabilidade_dengue = self._calcular_favorabilidade(weather)
        return weather


# Singleton para uso na API
_weather_service: Optional[WeatherService] = None


def get_weather_service() -> WeatherService:
    """Retorna instância singleton do serviço de clima."""
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service
