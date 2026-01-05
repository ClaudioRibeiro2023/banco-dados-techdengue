"""
Testes de integração para os routers da API.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from src.api.app import app


@pytest.fixture
def client():
    """Cliente de teste para a API."""
    return TestClient(app)


class TestHealthRouter:
    """Testes para o router de health."""

    def test_health_endpoint(self, client):
        """Endpoint /health deve retornar 200."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "ok" in data or "status" in data
        assert "version" in data

    def test_status_endpoint(self, client):
        """Endpoint /api/v1/status deve retornar 200."""
        response = client.get("/api/v1/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_datasets_endpoint(self, client):
        """Endpoint /datasets deve listar datasets."""
        response = client.get("/datasets")
        assert response.status_code == 200
        data = response.json()
        # Pode ser dict com datasets ou apenas dict de datasets
        assert isinstance(data, dict)


class TestFactsRouter:
    """Testes para o router de facts."""

    def test_facts_endpoint(self, client):
        """Endpoint /facts deve retornar dados."""
        response = client.get("/facts?limit=5")
        assert response.status_code == 200
        data = response.json()
        # Pode ser lista ou objeto com items
        assert isinstance(data, (list, dict))
        if isinstance(data, dict):
            assert "items" in data or "total" in data

    def test_facts_with_format_csv(self, client):
        """Endpoint /facts com format=csv deve retornar CSV."""
        response = client.get("/facts?limit=5&format=csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")

    def test_facts_summary_endpoint(self, client):
        """Endpoint /facts/summary deve retornar resumo."""
        response = client.get("/facts/summary")
        assert response.status_code == 200
        data = response.json()
        # Deve ter summary ou total_registros
        assert "summary" in data or "total_registros" in data

    def test_dengue_endpoint(self, client):
        """Endpoint /dengue deve retornar dados."""
        response = client.get("/dengue?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))
        if isinstance(data, dict):
            assert "items" in data

    def test_municipios_endpoint(self, client):
        """Endpoint /municipios deve retornar lista."""
        response = client.get("/municipios?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_municipios_search(self, client):
        """Endpoint /municipios com q deve filtrar."""
        response = client.get("/municipios?q=belo")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_gold_analise_endpoint(self, client):
        """Endpoint /gold/analise deve retornar dados."""
        response = client.get("/gold/analise?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))


class TestWeatherRouter:
    """Testes para o router de clima."""

    def test_weather_cidade(self, client):
        """Endpoint /api/v1/weather/{cidade} deve retornar clima."""
        response = client.get("/api/v1/weather/uberlandia")
        assert response.status_code == 200
        data = response.json()
        assert "cidade" in data
        assert "temperatura" in data
        assert "umidade" in data

    def test_weather_all_cities(self, client):
        """Endpoint /api/v1/weather deve retornar todas as cidades."""
        response = client.get("/api/v1/weather")
        assert response.status_code == 200
        data = response.json()
        assert "cidades" in data
        assert "count" in data

    def test_weather_risk(self, client):
        """Endpoint /api/v1/weather/{cidade}/risk deve retornar risco."""
        response = client.get("/api/v1/weather/uberlandia/risk")
        assert response.status_code == 200
        data = response.json()
        assert "risco_climatico" in data
        assert "score" in data

    def test_risk_dashboard(self, client):
        """Endpoint /api/v1/risk/dashboard deve retornar dashboard."""
        response = client.get("/api/v1/risk/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "cidades" in data
        assert "resumo" in data


class TestAdminRouter:
    """Testes para o router admin."""

    def test_cache_stats(self, client):
        """Endpoint /api/v1/cache/stats deve retornar stats."""
        response = client.get("/api/v1/cache/stats")
        assert response.status_code == 200
        data = response.json()
        assert "cache" in data

    def test_audit_stats(self, client):
        """Endpoint /api/v1/audit/stats deve retornar stats."""
        response = client.get("/api/v1/audit/stats")
        assert response.status_code == 200


class TestGISRouter:
    """Testes para o router GIS."""

    def test_gis_banco(self, client):
        """Endpoint /gis/banco pode retornar dados ou erro de conexão."""
        response = client.get("/gis/banco?limit=5")
        assert response.status_code == 200


class TestOpenAPI:
    """Testes para documentação OpenAPI."""

    def test_docs_available(self, client):
        """Documentação /docs deve estar disponível."""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_available(self, client):
        """Documentação /redoc deve estar disponível."""
        response = client.get("/redoc")
        assert response.status_code == 200

    def test_openapi_json(self, client):
        """OpenAPI JSON deve estar disponível."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
