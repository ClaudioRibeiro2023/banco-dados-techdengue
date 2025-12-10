"""
Testes unitários para WeatherService.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from src.services.weather import WeatherService, WeatherData


class TestWeatherServiceNormalization:
    """Testes para normalização de nomes de cidades."""

    def setup_method(self):
        """Setup para cada teste."""
        self.service = WeatherService(api_key=None)

    def test_normalize_cidade_lowercase(self):
        """Deve normalizar cidade em lowercase."""
        assert self.service._normalize_cidade("uberlandia") == "Uberlândia"

    def test_normalize_cidade_with_spaces(self):
        """Deve normalizar cidade com espaços."""
        assert self.service._normalize_cidade("belo horizonte") == "Belo Horizonte"

    def test_normalize_cidade_with_hyphen(self):
        """Deve normalizar cidade com hífen."""
        assert self.service._normalize_cidade("belo-horizonte") == "Belo Horizonte"
        assert self.service._normalize_cidade("juiz-de-fora") == "Juiz de Fora"

    def test_normalize_cidade_without_accent(self):
        """Deve normalizar cidade sem acento."""
        assert self.service._normalize_cidade("ribeirao das neves") == "Ribeirão das Neves"

    def test_normalize_cidade_already_correct(self):
        """Deve manter cidade já formatada corretamente."""
        result = self.service._normalize_cidade("Belo Horizonte")
        assert result == "Belo Horizonte"

    def test_normalize_cidade_unknown(self):
        """Deve retornar a cidade original se não conhecida."""
        result = self.service._normalize_cidade("cidade_desconhecida")
        assert result == "cidade_desconhecida"


class TestWeatherServiceFavorabilidade:
    """Testes para cálculo de favorabilidade de dengue."""

    def setup_method(self):
        """Setup para cada teste."""
        self.service = WeatherService(api_key=None)

    def test_favorabilidade_alta_temperatura_ideal(self):
        """Temperatura entre 25-30°C deve ter alta favorabilidade."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=27.0,
            sensacao_termica=28.0,
            umidade=80,
            pressao=1015,
            velocidade_vento=2.0,
            nebulosidade=50,
            chuva_1h=5.0,
            descricao="teste",
        )
        score = self.service._calcular_favorabilidade(weather)
        # Temperatura ideal (40) + umidade alta (35) + chuva ideal (15) + vento fraco (7) = 97
        assert score >= 80

    def test_favorabilidade_baixa_temperatura_fria(self):
        """Temperatura muito baixa deve ter baixa favorabilidade."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=15.0,
            sensacao_termica=14.0,
            umidade=40,
            pressao=1015,
            velocidade_vento=15.0,
            nebulosidade=50,
            chuva_1h=0,
            descricao="teste",
        )
        score = self.service._calcular_favorabilidade(weather)
        assert score <= 30

    def test_favorabilidade_score_range(self):
        """Score deve estar entre 0 e 100."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=25.0,
            sensacao_termica=25.0,
            umidade=70,
            pressao=1015,
            velocidade_vento=3.0,
            nebulosidade=50,
            chuva_1h=2.0,
            descricao="teste",
        )
        score = self.service._calcular_favorabilidade(weather)
        assert 0 <= score <= 100


class TestWeatherServiceRiskAnalysis:
    """Testes para análise de risco de dengue."""

    def setup_method(self):
        """Setup para cada teste."""
        self.service = WeatherService(api_key=None)

    def test_risk_critico(self):
        """Score >= 75 deve ser crítico."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=28.0,
            sensacao_termica=30.0,
            umidade=85,
            pressao=1015,
            velocidade_vento=1.0,
            nebulosidade=50,
            chuva_1h=5.0,
            descricao="teste",
            indice_favorabilidade_dengue=80,
        )
        risk = self.service.analyze_dengue_risk(weather)
        assert risk.risco_climatico == "critico"
        assert len(risk.recomendacoes) >= 3

    def test_risk_alto(self):
        """Score entre 50-75 deve ser alto."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=25.0,
            sensacao_termica=26.0,
            umidade=70,
            pressao=1015,
            velocidade_vento=3.0,
            nebulosidade=50,
            chuva_1h=2.0,
            descricao="teste",
            indice_favorabilidade_dengue=60,
        )
        risk = self.service.analyze_dengue_risk(weather)
        assert risk.risco_climatico == "alto"

    def test_risk_medio(self):
        """Score entre 25-50 deve ser médio."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=22.0,
            sensacao_termica=22.0,
            umidade=55,
            pressao=1015,
            velocidade_vento=5.0,
            nebulosidade=50,
            chuva_1h=0,
            descricao="teste",
            indice_favorabilidade_dengue=35,
        )
        risk = self.service.analyze_dengue_risk(weather)
        assert risk.risco_climatico == "medio"

    def test_risk_baixo(self):
        """Score < 25 deve ser baixo."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=15.0,
            sensacao_termica=14.0,
            umidade=30,
            pressao=1015,
            velocidade_vento=15.0,
            nebulosidade=50,
            chuva_1h=0,
            descricao="teste",
            indice_favorabilidade_dengue=15,
        )
        risk = self.service.analyze_dengue_risk(weather)
        assert risk.risco_climatico == "baixo"

    def test_risk_has_fatores(self):
        """Risk deve incluir fatores climáticos."""
        weather = WeatherData(
            cidade="Teste",
            temperatura=27.0,
            sensacao_termica=28.0,
            umidade=75,
            pressao=1015,
            velocidade_vento=3.0,
            nebulosidade=50,
            chuva_1h=2.0,
            descricao="teste",
            indice_favorabilidade_dengue=70,
        )
        risk = self.service.analyze_dengue_risk(weather)
        assert "temperatura" in risk.fatores
        assert "umidade" in risk.fatores
        assert "chuva_1h" in risk.fatores
        assert "vento" in risk.fatores


class TestWeatherServiceMockData:
    """Testes para dados mock."""

    def setup_method(self):
        """Setup para cada teste."""
        self.service = WeatherService(api_key=None)

    def test_mock_weather_returns_data(self):
        """Mock deve retornar dados válidos."""
        weather = self.service._get_mock_weather("Belo Horizonte")
        assert weather.cidade == "Belo Horizonte"
        assert weather.estado == "MG"
        assert 15 <= weather.temperatura <= 40
        assert 0 <= weather.umidade <= 100
        assert "simulados" in weather.descricao.lower()

    def test_mock_weather_has_favorabilidade(self):
        """Mock deve calcular favorabilidade."""
        weather = self.service._get_mock_weather("Uberlândia")
        assert 0 <= weather.indice_favorabilidade_dengue <= 100


@pytest.mark.asyncio
class TestWeatherServiceAsync:
    """Testes assíncronos para WeatherService."""

    async def test_get_weather_without_api_key(self):
        """Sem API key deve retornar mock data."""
        service = WeatherService(api_key=None)
        weather = await service.get_current_weather("Belo Horizonte")
        assert weather is not None
        assert weather.cidade == "Belo Horizonte"
        assert "simulados" in weather.descricao.lower()

    async def test_get_weather_unknown_city_with_mock(self):
        """Cidade desconhecida sem API key retorna mock (fallback)."""
        service = WeatherService(api_key=None)
        weather = await service.get_current_weather("cidade_que_nao_existe")
        # Sem API key, o serviço retorna mock para qualquer cidade
        # Isso é comportamento esperado para desenvolvimento
        assert weather is not None
        assert "simulados" in weather.descricao.lower()

    async def test_get_weather_normalized_city(self):
        """Deve normalizar cidade antes de buscar."""
        service = WeatherService(api_key=None)
        weather = await service.get_current_weather("uberlandia")
        assert weather is not None
        assert weather.cidade == "Uberlândia"

    async def test_get_all_cities_weather(self):
        """Deve retornar clima de todas as cidades."""
        service = WeatherService(api_key=None)
        weather_list = await service.get_all_cities_weather()
        assert len(weather_list) == len(service.CIDADES_MG)
        cities = [w.cidade for w in weather_list]
        assert "Belo Horizonte" in cities
        assert "Uberlândia" in cities
