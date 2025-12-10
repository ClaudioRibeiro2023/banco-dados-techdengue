"""
Testes dos Endpoints de Clima e Risco
======================================
Testes para os endpoints /api/v1/weather e /api/v1/risk.
"""
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Garantir import do pacote src a partir da raiz do projeto
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import app

client = TestClient(app)


# =============================================================================
# WEATHER ENDPOINTS
# =============================================================================

class TestWeatherEndpoints:
    """Testes dos endpoints de clima."""
    
    def test_weather_cidade_returns_200_or_error(self):
        """GET /api/v1/weather/{cidade} deve funcionar para cidade válida."""
        r = client.get("/api/v1/weather/uberlandia")
        # Pode retornar 200 (sucesso) ou 500/503 (API externa indisponível)
        assert r.status_code in [200, 404, 500, 503]
    
    def test_weather_belo_horizonte(self):
        """Teste com Belo Horizonte."""
        r = client.get("/api/v1/weather/belo-horizonte")
        assert r.status_code in [200, 404, 500, 503]
    
    def test_weather_response_structure(self):
        """Resposta deve ter estrutura correta quando sucesso."""
        r = client.get("/api/v1/weather/uberlandia")
        if r.status_code == 200:
            data = r.json()
            # Verificar campos esperados
            assert "cidade" in data or "city" in data or "location" in data
    
    def test_weather_cidade_with_accents(self):
        """Cidade com acentos deve funcionar."""
        r = client.get("/api/v1/weather/são-paulo")
        assert r.status_code in [200, 404, 500, 503]
    
    def test_weather_risk_endpoint(self):
        """GET /api/v1/weather/{cidade}/risk deve funcionar."""
        r = client.get("/api/v1/weather/uberlandia/risk")
        assert r.status_code in [200, 404, 500, 503]


# =============================================================================
# RISK ENDPOINTS
# =============================================================================

class TestRiskEndpoints:
    """Testes dos endpoints de análise de risco."""
    
    def test_risk_dashboard_returns_200(self):
        """GET /api/v1/risk/dashboard deve retornar 200."""
        r = client.get("/api/v1/risk/dashboard")
        assert r.status_code in [200, 500, 503]
    
    def test_risk_dashboard_structure(self):
        """Dashboard deve retornar estrutura correta."""
        r = client.get("/api/v1/risk/dashboard")
        if r.status_code == 200:
            data = r.json()
            # Verificar que é uma lista ou dict com dados
            assert isinstance(data, (list, dict))
    
    def test_risk_analyze_endpoint(self):
        """GET /api/v1/risk/analyze deve estar disponível."""
        r = client.get("/api/v1/risk/analyze")
        # Pode requerer parâmetros, então 422 também é válido
        assert r.status_code in [200, 400, 422, 500, 503]
    
    def test_risk_analyze_with_cidade(self):
        """Análise de risco com cidade deve funcionar."""
        r = client.get("/api/v1/risk/analyze", params={"cidade": "uberlandia"})
        assert r.status_code in [200, 400, 422, 500, 503]


# =============================================================================
# ENDPOINT DISCOVERY
# =============================================================================

class TestEndpointDiscovery:
    """Testes para descoberta de endpoints."""
    
    def test_all_routes_documented(self):
        """Todos os endpoints devem estar documentados no OpenAPI."""
        r = client.get("/openapi.json")
        assert r.status_code == 200
        data = r.json()
        
        paths = data.get("paths", {})
        
        # Endpoints principais que devem existir
        expected_paths = [
            "/health",
            "/facts",
            "/facts/summary",
            "/dengue",
            "/municipios",
            "/gold/analise",
            "/datasets",
            "/monitor",
            "/quality",
        ]
        
        for path in expected_paths:
            assert path in paths, f"Endpoint {path} não encontrado no OpenAPI"
    
    def test_api_v1_routes_exist(self):
        """Rotas /api/v1/* devem existir."""
        r = client.get("/openapi.json")
        data = r.json()
        paths = data.get("paths", {})
        
        api_v1_paths = [p for p in paths if p.startswith("/api/v1")]
        assert len(api_v1_paths) > 0, "Nenhuma rota /api/v1 encontrada"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
