"""
Cliente Python para a API TechDengue.

Exemplo de uso:
    from techdengue import TechDengueClient
    
    client = TechDengueClient(api_key="sua_api_key")
    
    # Obter clima de uma cidade
    weather = client.get_weather("Belo Horizonte")
    print(f"Temperatura: {weather.temperatura}°C")
    
    # Análise de risco
    risk = client.analyze_risk(municipio="Uberlândia", casos_recentes=150)
    print(f"Nível de risco: {risk.nivel_risco}")
"""

import os
from typing import Optional, Any
from urllib.parse import urljoin

import httpx

from techdengue.models import (
    WeatherData,
    RiskAnalysis,
    DengueCase,
    Municipality,
    Activity,
    ApiError,
)


class TechDengueError(Exception):
    """Erro da API TechDengue."""
    def __init__(self, error: ApiError):
        self.error = error
        super().__init__(f"{error.error}: {error.message}")


class TechDengueClient:
    """
    Cliente oficial para a API TechDengue.
    
    Args:
        base_url: URL base da API (default: http://localhost:4010)
        api_key: Chave de API para autenticação
        timeout: Timeout em segundos (default: 30)
    """
    
    DEFAULT_BASE_URL = "http://localhost:4010"
    
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
    ):
        self.base_url = base_url or os.getenv("TECHDENGUE_API_URL", self.DEFAULT_BASE_URL)
        self.api_key = api_key or os.getenv("TECHDENGUE_API_KEY")
        self.timeout = timeout
        
        self._client = httpx.Client(
            base_url=self.base_url,
            timeout=timeout,
            headers=self._get_headers(),
        )
    
    def _get_headers(self) -> dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": "TechDengue-SDK-Python/1.0.0",
        }
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers
    
    def _request(
        self,
        method: str,
        path: str,
        params: Optional[dict] = None,
        json: Optional[dict] = None,
    ) -> dict:
        """Faz uma requisição à API."""
        try:
            response = self._client.request(
                method=method,
                url=path,
                params=params,
                json=json,
            )
            
            if response.status_code >= 400:
                raise TechDengueError(ApiError.from_response(response))
            
            return response.json()
            
        except httpx.HTTPError as e:
            raise TechDengueError(ApiError(
                error="connection_error",
                message=str(e),
            ))
    
    def close(self):
        """Fecha o cliente."""
        self._client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    # ==================== Health ====================
    
    def health(self) -> dict:
        """Verifica saúde da API."""
        return self._request("GET", "/health")
    
    def status(self) -> dict:
        """Retorna status detalhado do sistema."""
        return self._request("GET", "/api/v1/status")
    
    # ==================== Weather ====================
    
    def get_weather(self, cidade: str) -> WeatherData:
        """
        Obtém dados climáticos de uma cidade.
        
        Args:
            cidade: Nome da cidade (ex: "Belo Horizonte")
        
        Returns:
            WeatherData com temperatura, umidade e índice de favorabilidade dengue
        """
        data = self._request("GET", f"/api/v1/weather/{cidade}")
        return WeatherData.from_dict(data)
    
    def get_weather_all(self) -> list[WeatherData]:
        """Obtém clima de todas as principais cidades de MG."""
        data = self._request("GET", "/api/v1/weather")
        return [WeatherData.from_dict(c) for c in data.get("cidades", [])]
    
    def get_weather_risk(self, cidade: str) -> dict:
        """Obtém análise de risco climático de uma cidade."""
        return self._request("GET", f"/api/v1/weather/{cidade}/risk")
    
    # ==================== Risk Analysis ====================
    
    def analyze_risk(
        self,
        municipio: str,
        codigo_ibge: Optional[str] = None,
        casos_recentes: int = 0,
        casos_ano_anterior: int = 0,
        temperatura_media: float = 25.0,
        umidade_media: float = 70.0,
        populacao: int = 100000,
        **kwargs,
    ) -> RiskAnalysis:
        """
        Analisa risco de dengue usando IA.
        
        Args:
            municipio: Nome do município
            codigo_ibge: Código IBGE (opcional)
            casos_recentes: Casos nos últimos 30 dias
            casos_ano_anterior: Casos no mesmo período ano anterior
            temperatura_media: Temperatura média em °C
            umidade_media: Umidade média em %
            populacao: População do município
        
        Returns:
            RiskAnalysis com nível de risco, tendência e recomendações
        """
        payload = {
            "municipio": municipio,
            "codigo_ibge": codigo_ibge,
            "casos_recentes": casos_recentes,
            "casos_ano_anterior": casos_ano_anterior,
            "temperatura_media": temperatura_media,
            "umidade_media": umidade_media,
            "populacao": populacao,
            **kwargs,
        }
        data = self._request("POST", "/api/v1/risk/analyze", json=payload)
        return RiskAnalysis.from_dict(data)
    
    def get_municipio_risk(self, codigo_ibge: str) -> dict:
        """Obtém análise de risco de um município por código IBGE."""
        return self._request("GET", f"/api/v1/risk/municipio/{codigo_ibge}")
    
    def get_risk_dashboard(self) -> dict:
        """Obtém dashboard consolidado de risco regional."""
        return self._request("GET", "/api/v1/risk/dashboard")
    
    # ==================== Data ====================
    
    def get_facts(
        self,
        limit: int = 100,
        offset: int = 0,
        municipio: Optional[str] = None,
    ) -> list[Activity]:
        """
        Obtém atividades TechDengue (fatos).
        
        Args:
            limit: Número máximo de registros
            offset: Offset para paginação
            municipio: Filtrar por município
        """
        params = {"limit": limit, "offset": offset}
        if municipio:
            params["q"] = municipio
        
        data = self._request("GET", "/facts", params=params)
        return [Activity.from_dict(r) for r in data.get("data", [])]
    
    def get_dengue_cases(
        self,
        limit: int = 100,
        offset: int = 0,
        ano: Optional[int] = None,
        municipio: Optional[str] = None,
    ) -> list[DengueCase]:
        """
        Obtém casos de dengue.
        
        Args:
            limit: Número máximo de registros
            offset: Offset para paginação
            ano: Filtrar por ano
            municipio: Filtrar por município
        """
        params = {"limit": limit, "offset": offset}
        if ano:
            params["ano"] = ano
        if municipio:
            params["q"] = municipio
        
        data = self._request("GET", "/dengue", params=params)
        return [DengueCase.from_dict(r) for r in data.get("data", [])]
    
    def get_municipalities(
        self,
        limit: int = 100,
        offset: int = 0,
        search: Optional[str] = None,
    ) -> list[Municipality]:
        """
        Obtém municípios de MG.
        
        Args:
            limit: Número máximo de registros
            offset: Offset para paginação
            search: Buscar por nome
        """
        params = {"limit": limit, "offset": offset}
        if search:
            params["q"] = search
        
        data = self._request("GET", "/municipios", params=params)
        return [Municipality.from_dict(r) for r in data.get("data", [])]
    
    def get_municipality_by_ibge(self, codigo_ibge: str) -> Municipality:
        """Obtém município por código IBGE."""
        municipalities = self.get_municipalities(search=codigo_ibge)
        for m in municipalities:
            if m.codigo_ibge == codigo_ibge:
                return m
        raise TechDengueError(ApiError(
            error="not_found",
            message=f"Município {codigo_ibge} não encontrado",
            status_code=404,
        ))
    
    # ==================== Export ====================
    
    def export_data(
        self,
        dataset: str,
        format: str = "json",
        limit: int = 1000,
    ) -> Any:
        """
        Exporta dados em diferentes formatos.
        
        Args:
            dataset: Nome do dataset (facts, dengue, municipios, gold)
            format: Formato de saída (json, csv)
            limit: Limite de registros
        
        Returns:
            Dados no formato especificado
        """
        params = {"format": format, "limit": limit}
        return self._request("GET", f"/{dataset}", params=params)
    
    # ==================== Admin (requer API Key) ====================
    
    def get_cache_stats(self) -> dict:
        """Obtém estatísticas do cache."""
        return self._request("GET", "/api/v1/cache/stats")
    
    def clear_cache(self, pattern: Optional[str] = None) -> dict:
        """Limpa o cache (requer API Key)."""
        params = {"pattern": pattern} if pattern else None
        return self._request("POST", "/api/v1/cache/clear", params=params)
    
    def get_audit_stats(self) -> dict:
        """Obtém estatísticas de uso da API."""
        return self._request("GET", "/api/v1/audit/stats")


class AsyncTechDengueClient:
    """
    Cliente assíncrono para a API TechDengue.
    
    Exemplo:
        async with AsyncTechDengueClient(api_key="...") as client:
            weather = await client.get_weather("Belo Horizonte")
    """
    
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
    ):
        self.base_url = base_url or os.getenv("TECHDENGUE_API_URL", TechDengueClient.DEFAULT_BASE_URL)
        self.api_key = api_key or os.getenv("TECHDENGUE_API_KEY")
        self.timeout = timeout
        
        headers = {
            "Accept": "application/json",
            "User-Agent": "TechDengue-SDK-Python/1.0.0",
        }
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=timeout,
            headers=headers,
        )
    
    async def _request(
        self,
        method: str,
        path: str,
        params: Optional[dict] = None,
        json: Optional[dict] = None,
    ) -> dict:
        try:
            response = await self._client.request(
                method=method,
                url=path,
                params=params,
                json=json,
            )
            
            if response.status_code >= 400:
                raise TechDengueError(ApiError.from_response(response))
            
            return response.json()
            
        except httpx.HTTPError as e:
            raise TechDengueError(ApiError(
                error="connection_error",
                message=str(e),
            ))
    
    async def close(self):
        await self._client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
    
    async def get_weather(self, cidade: str) -> WeatherData:
        data = await self._request("GET", f"/api/v1/weather/{cidade}")
        return WeatherData.from_dict(data)
    
    async def analyze_risk(self, **kwargs) -> RiskAnalysis:
        data = await self._request("POST", "/api/v1/risk/analyze", json=kwargs)
        return RiskAnalysis.from_dict(data)
    
    async def get_risk_dashboard(self) -> dict:
        return await self._request("GET", "/api/v1/risk/dashboard")
