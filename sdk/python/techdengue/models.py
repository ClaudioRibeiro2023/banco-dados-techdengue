"""
Modelos de dados do SDK TechDengue.
"""

from datetime import datetime
from typing import Optional, Any
from dataclasses import dataclass, field


@dataclass
class WeatherData:
    """Dados climáticos."""
    cidade: str
    temperatura: float
    sensacao_termica: float
    umidade: int
    pressao: int
    velocidade_vento: float
    nebulosidade: int
    chuva_1h: float = 0
    descricao: str = ""
    indice_favorabilidade_dengue: float = 0
    timestamp: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "WeatherData":
        return cls(
            cidade=data.get("cidade", ""),
            temperatura=data.get("temperatura", 0),
            sensacao_termica=data.get("sensacao_termica", 0),
            umidade=data.get("umidade", 0),
            pressao=data.get("pressao", 0),
            velocidade_vento=data.get("velocidade_vento", 0),
            nebulosidade=data.get("nebulosidade", 0),
            chuva_1h=data.get("chuva_1h", 0),
            descricao=data.get("descricao", ""),
            indice_favorabilidade_dengue=data.get("indice_favorabilidade_dengue", 0),
        )


@dataclass
class RiskAnalysis:
    """Análise de risco de dengue."""
    municipio: str
    nivel_risco: str
    score_risco: float
    tendencia: str
    fatores_principais: list[str] = field(default_factory=list)
    recomendacoes: list[str] = field(default_factory=list)
    analise_detalhada: str = ""
    confianca: float = 0.8
    modelo_usado: str = ""
    timestamp: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "RiskAnalysis":
        return cls(
            municipio=data.get("municipio", ""),
            nivel_risco=data.get("nivel_risco", ""),
            score_risco=data.get("score_risco", 0),
            tendencia=data.get("tendencia", ""),
            fatores_principais=data.get("fatores_principais", []),
            recomendacoes=data.get("recomendacoes", []),
            analise_detalhada=data.get("analise_detalhada", ""),
            confianca=data.get("confianca", 0.8),
            modelo_usado=data.get("modelo_usado", ""),
        )

    @property
    def is_critical(self) -> bool:
        return self.nivel_risco == "critico"

    @property
    def is_high(self) -> bool:
        return self.nivel_risco in ("critico", "alto")


@dataclass
class DengueCase:
    """Caso de dengue."""
    ano: int
    semana_epidemiologica: int
    codigo_ibge: str
    municipio: str
    casos_notificados: int
    casos_confirmados: int
    incidencia: float = 0
    timestamp: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: dict) -> "DengueCase":
        return cls(
            ano=data.get("ano", 0),
            semana_epidemiologica=data.get("semana_epidemiologica", 0),
            codigo_ibge=str(data.get("codigo_ibge", "")),
            municipio=data.get("municipio", ""),
            casos_notificados=data.get("casos_notificados", 0),
            casos_confirmados=data.get("casos_confirmados", 0),
            incidencia=data.get("incidencia", 0),
        )


@dataclass
class Municipality:
    """Município de MG."""
    codigo_ibge: str
    nome: str
    mesorregiao: str = ""
    microrregiao: str = ""
    populacao: int = 0
    area_km2: float = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Municipality":
        return cls(
            codigo_ibge=str(data.get("codigo_ibge", "")),
            nome=data.get("nome_municipio", data.get("municipio", "")),
            mesorregiao=data.get("mesorregiao", ""),
            microrregiao=data.get("microrregiao", ""),
            populacao=data.get("populacao", 0),
            area_km2=data.get("area_km2", 0),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
        )


@dataclass
class Activity:
    """Atividade TechDengue."""
    id: str
    codigo_ibge: str
    municipio: str
    data_mapeamento: Optional[datetime] = None
    atividade: str = ""
    hectares: float = 0
    pois: int = 0
    status: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "Activity":
        return cls(
            id=str(data.get("id", "")),
            codigo_ibge=str(data.get("codigo_ibge", "")),
            municipio=data.get("municipio", ""),
            atividade=data.get("nomenclatura_atividade", data.get("atividade", "")),
            hectares=data.get("hectares", 0),
            pois=data.get("pois", 0),
            status=data.get("status", ""),
        )


@dataclass
class ApiError:
    """Erro da API."""
    error: str
    message: str
    status_code: int = 500

    @classmethod
    def from_response(cls, response: Any) -> "ApiError":
        data = response.json() if hasattr(response, 'json') else {}
        return cls(
            error=data.get("error", "unknown_error"),
            message=data.get("message", str(response)),
            status_code=getattr(response, 'status_code', 500),
        )
