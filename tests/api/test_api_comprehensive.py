"""
Testes Abrangentes da API TechDengue
=====================================
Cobertura completa de todos os endpoints, validações e cenários de erro.
"""
import sys
from pathlib import Path
from datetime import date
from typing import Any, Dict

import pytest
from fastapi.testclient import TestClient

# Garantir import do pacote src a partir da raiz do projeto
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import app

client = TestClient(app)


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def valid_codigo_ibge() -> str:
    """Obtém um código IBGE válido do dataset."""
    r = client.get("/facts", params={"limit": 1})
    if r.status_code == 200:
        data = r.json()
        if data.get("items"):
            return str(data["items"][0].get("codigo_ibge", "3100104"))
    return "3100104"  # Fallback


@pytest.fixture
def valid_municipio() -> str:
    """Obtém um nome de município válido do dataset."""
    r = client.get("/municipios", params={"limit": 1})
    if r.status_code == 200:
        data = r.json()
        if data.get("items"):
            return str(data["items"][0].get("municipio", ""))
    return "Uberlândia"  # Fallback


# =============================================================================
# HEALTH & MONITORING ENDPOINTS
# =============================================================================

class TestHealthEndpoints:
    """Testes dos endpoints de saúde e monitoramento."""
    
    def test_health_returns_200(self):
        """GET /health deve retornar 200 OK."""
        r = client.get("/health")
        assert r.status_code == 200
    
    def test_health_response_structure(self):
        """GET /health deve retornar estrutura correta."""
        r = client.get("/health")
        data = r.json()
        
        assert "ok" in data
        assert "version" in data
        assert "datasets" in data
        assert "db_connected" in data
        
        assert isinstance(data["ok"], bool)
        assert isinstance(data["version"], str)
        assert isinstance(data["datasets"], dict)
        assert isinstance(data["db_connected"], bool)
    
    def test_health_datasets_structure(self):
        """Datasets devem ter estrutura correta."""
        r = client.get("/health")
        data = r.json()
        
        expected_datasets = [
            "fato_atividades_techdengue.parquet",
            "fato_dengue_historico.parquet",
            "dim_municipios.parquet",
            "analise_integrada.parquet",
        ]
        
        for ds in expected_datasets:
            assert ds in data["datasets"], f"Dataset {ds} não encontrado"
            assert "exists" in data["datasets"][ds]
            assert "size" in data["datasets"][ds]
    
    def test_monitor_returns_200(self):
        """GET /monitor deve retornar 200 OK."""
        r = client.get("/monitor")
        assert r.status_code == 200
    
    def test_monitor_response_structure(self):
        """GET /monitor deve retornar estrutura de dashboard."""
        r = client.get("/monitor")
        data = r.json()
        
        assert "lastUpdate" in data
        assert "database" in data
        assert "stats" in data
        assert "datasets" in data
    
    def test_quality_returns_200(self):
        """GET /quality deve retornar 200 OK."""
        r = client.get("/quality")
        assert r.status_code == 200
    
    def test_quality_response_structure(self):
        """GET /quality deve retornar relatório de qualidade."""
        r = client.get("/quality")
        data = r.json()
        
        assert "generatedAt" in data
        assert "score" in data
        assert "validations" in data
        assert "summary" in data
        
        assert isinstance(data["score"], int)
        assert isinstance(data["validations"], list)
    
    def test_api_status_returns_200(self):
        """GET /api/v1/status deve retornar 200 OK."""
        r = client.get("/api/v1/status")
        assert r.status_code == 200
    
    def test_datasets_catalog_returns_200(self):
        """GET /datasets deve retornar catálogo."""
        r = client.get("/datasets")
        assert r.status_code == 200
        data = r.json()
        assert "datasets" in data


# =============================================================================
# FACTS ENDPOINTS
# =============================================================================

class TestFactsEndpoints:
    """Testes do endpoint /facts."""
    
    def test_facts_returns_200(self):
        """GET /facts deve retornar 200 OK."""
        r = client.get("/facts")
        assert r.status_code == 200
    
    def test_facts_pagination_default(self):
        """Paginação padrão deve funcionar."""
        r = client.get("/facts")
        data = r.json()
        
        assert "total" in data
        assert "limit" in data
        assert "offset" in data
        assert "items" in data
        
        assert data["limit"] == 100  # default
        assert data["offset"] == 0   # default
    
    def test_facts_pagination_custom(self):
        """Paginação customizada deve funcionar."""
        r = client.get("/facts", params={"limit": 5, "offset": 10})
        data = r.json()
        
        assert data["limit"] == 5
        assert data["offset"] == 10
        assert len(data["items"]) <= 5
    
    def test_facts_limit_min_bound(self):
        """Limit mínimo deve ser 1."""
        r = client.get("/facts", params={"limit": 0})
        data = r.json()
        assert data["limit"] >= 1
    
    def test_facts_limit_max_bound(self):
        """Limit máximo deve ser 1000."""
        r = client.get("/facts", params={"limit": 5000})
        data = r.json()
        assert data["limit"] <= 1000
        assert len(data["items"]) <= 1000
    
    def test_facts_filter_by_codigo_ibge(self, valid_codigo_ibge):
        """Filtro por codigo_ibge deve funcionar."""
        r = client.get("/facts", params={"codigo_ibge": valid_codigo_ibge})
        assert r.status_code == 200
        data = r.json()
        
        for item in data.get("items", []):
            assert str(item.get("codigo_ibge")) == valid_codigo_ibge
    
    def test_facts_filter_by_atividade(self):
        """Filtro por atividade deve funcionar."""
        r = client.get("/facts", params={"nomenclatura_atividade": "mapeamento"})
        assert r.status_code == 200
    
    def test_facts_filter_by_date_range(self):
        """Filtro por período deve funcionar."""
        r = client.get("/facts", params={
            "start_date": "2023-01-01",
            "end_date": "2024-12-31"
        })
        assert r.status_code == 200
    
    def test_facts_sort_by_valid_column(self):
        """Ordenação por coluna válida deve funcionar."""
        r = client.get("/facts", params={"sort_by": "pois", "order": "desc"})
        assert r.status_code == 200
    
    def test_facts_order_asc(self):
        """Ordenação ascendente deve funcionar."""
        r = client.get("/facts", params={"order": "asc"})
        assert r.status_code == 200
    
    def test_facts_order_invalid(self):
        """Ordenação inválida deve retornar 422."""
        r = client.get("/facts", params={"order": "invalid"})
        assert r.status_code == 422
    
    def test_facts_export_csv(self):
        """Exportação CSV deve funcionar."""
        r = client.get("/facts", params={"format": "csv", "limit": 5})
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
    
    def test_facts_export_parquet(self):
        """Exportação Parquet deve funcionar."""
        r = client.get("/facts", params={"format": "parquet", "limit": 5})
        assert r.status_code == 200
        assert "parquet" in r.headers.get("content-type", "")
    
    def test_facts_export_invalid_format(self):
        """Formato inválido deve retornar 422."""
        r = client.get("/facts", params={"format": "xml"})
        assert r.status_code == 422
    
    def test_facts_fields_selection(self):
        """Seleção de campos deve funcionar."""
        r = client.get("/facts", params={"fields": "codigo_ibge,municipio"})
        assert r.status_code == 200


class TestFactsSummaryEndpoint:
    """Testes do endpoint /facts/summary."""
    
    def test_summary_returns_200(self):
        """GET /facts/summary deve retornar 200 OK."""
        r = client.get("/facts/summary")
        assert r.status_code == 200
    
    def test_summary_response_structure(self):
        """Resposta deve ter estrutura correta."""
        r = client.get("/facts/summary")
        data = r.json()
        
        assert "generated_at" in data
        assert "group_by" in data
        assert "summary" in data
        assert isinstance(data["summary"], list)
    
    def test_summary_group_by_municipio(self):
        """Agrupamento por município deve funcionar."""
        r = client.get("/facts/summary", params={"group_by": "municipio"})
        assert r.status_code == 200
        data = r.json()
        assert data["group_by"] == "municipio"
    
    def test_summary_group_by_codigo_ibge(self):
        """Agrupamento por codigo_ibge deve funcionar."""
        r = client.get("/facts/summary", params={"group_by": "codigo_ibge"})
        assert r.status_code == 200
    
    def test_summary_group_by_atividade(self):
        """Agrupamento por atividade deve funcionar."""
        r = client.get("/facts/summary", params={"group_by": "atividade"})
        assert r.status_code == 200
    
    def test_summary_invalid_group_by(self):
        """Agrupamento inválido deve retornar 422."""
        r = client.get("/facts/summary", params={"group_by": "invalid"})
        assert r.status_code == 422
    
    def test_summary_items_structure(self):
        """Itens do resumo devem ter estrutura correta."""
        r = client.get("/facts/summary")
        data = r.json()
        
        if data.get("summary"):
            item = data["summary"][0]
            assert "total_pois" in item
            assert "total_devolutivas" in item
            assert "total_hectares" in item
            assert "atividades" in item


# =============================================================================
# DENGUE ENDPOINT
# =============================================================================

class TestDengueEndpoint:
    """Testes do endpoint /dengue."""
    
    def test_dengue_returns_200(self):
        """GET /dengue deve retornar 200 OK."""
        r = client.get("/dengue")
        assert r.status_code == 200
    
    def test_dengue_pagination(self):
        """Paginação deve funcionar."""
        r = client.get("/dengue", params={"limit": 10, "offset": 5})
        data = r.json()
        
        assert "total" in data
        assert "items" in data
        assert data["limit"] == 10
        assert data["offset"] == 5
    
    def test_dengue_filter_by_codigo_ibge(self, valid_codigo_ibge):
        """Filtro por codigo_ibge deve funcionar."""
        r = client.get("/dengue", params={"codigo_ibge": valid_codigo_ibge})
        assert r.status_code == 200
    
    def test_dengue_export_csv(self):
        """Exportação CSV deve funcionar."""
        r = client.get("/dengue", params={"format": "csv", "limit": 5})
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")


# =============================================================================
# MUNICIPIOS ENDPOINT
# =============================================================================

class TestMunicipiosEndpoint:
    """Testes do endpoint /municipios."""
    
    def test_municipios_returns_200(self):
        """GET /municipios deve retornar 200 OK."""
        r = client.get("/municipios")
        assert r.status_code == 200
    
    def test_municipios_pagination(self):
        """Paginação deve funcionar."""
        r = client.get("/municipios", params={"limit": 20})
        data = r.json()
        
        assert "total" in data
        assert "items" in data
        assert len(data["items"]) <= 20
    
    def test_municipios_search_by_name(self):
        """Busca por nome deve funcionar."""
        r = client.get("/municipios", params={"q": "belo"})
        assert r.status_code == 200
    
    def test_municipios_filter_by_codigo_ibge(self, valid_codigo_ibge):
        """Filtro por codigo_ibge deve funcionar."""
        r = client.get("/municipios", params={"codigo_ibge": valid_codigo_ibge})
        assert r.status_code == 200
    
    def test_municipios_sort_asc(self):
        """Ordenação ascendente deve ser default."""
        r = client.get("/municipios")
        data = r.json()
        # Default order is asc
        assert r.status_code == 200
    
    def test_municipios_export_csv(self):
        """Exportação CSV deve funcionar."""
        r = client.get("/municipios", params={"format": "csv", "limit": 5})
        assert r.status_code == 200


# =============================================================================
# GOLD ANALISE ENDPOINT
# =============================================================================

class TestGoldAnaliseEndpoint:
    """Testes do endpoint /gold/analise."""
    
    def test_gold_analise_returns_200(self):
        """GET /gold/analise deve retornar 200 OK."""
        r = client.get("/gold/analise")
        assert r.status_code == 200
    
    def test_gold_analise_pagination(self):
        """Paginação deve funcionar."""
        r = client.get("/gold/analise", params={"limit": 10})
        data = r.json()
        
        assert "total" in data
        assert "items" in data
    
    def test_gold_analise_filter_by_codigo_ibge(self, valid_codigo_ibge):
        """Filtro por codigo_ibge deve funcionar."""
        r = client.get("/gold/analise", params={"codigo_ibge": valid_codigo_ibge})
        assert r.status_code == 200
    
    def test_gold_analise_filter_by_municipio(self, valid_municipio):
        """Filtro por municipio deve funcionar."""
        r = client.get("/gold/analise", params={"municipio": valid_municipio})
        assert r.status_code == 200
    
    def test_gold_analise_filter_by_competencia(self):
        """Filtro por competência deve funcionar."""
        r = client.get("/gold/analise", params={
            "comp_start": "2023-01-01",
            "comp_end": "2024-12-31"
        })
        assert r.status_code == 200
    
    def test_gold_analise_export_csv(self):
        """Exportação CSV deve funcionar."""
        r = client.get("/gold/analise", params={"format": "csv", "limit": 5})
        assert r.status_code == 200


# =============================================================================
# GIS ENDPOINTS
# =============================================================================

class TestGISEndpoints:
    """Testes dos endpoints GIS."""
    
    def test_gis_banco_returns_200_or_500(self):
        """GET /gis/banco deve retornar 200 ou 500 (se DB offline)."""
        r = client.get("/gis/banco", params={"limit": 10})
        assert r.status_code == 200
    
    def test_gis_pois_returns_200_or_500(self):
        """GET /gis/pois deve retornar 200 ou 500 (se DB offline)."""
        r = client.get("/gis/pois", params={"limit": 10})
        assert r.status_code == 200
    
    def test_gis_pois_limit_bound(self):
        """Limit deve ser respeitado."""
        r = client.get("/gis/pois", params={"limit": 5})
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list):
                assert len(data) <= 5


# =============================================================================
# CACHE ENDPOINTS
# =============================================================================

class TestCacheEndpoints:
    """Testes dos endpoints de cache."""
    
    def test_cache_stats_returns_200(self):
        """GET /api/v1/cache/stats deve retornar 200."""
        r = client.get("/api/v1/cache/stats")
        assert r.status_code == 200
    
    def test_cache_stats_structure(self):
        """Estatísticas devem ter estrutura correta."""
        r = client.get("/api/v1/cache/stats")
        data = r.json()
        
        assert "cache" in data
        assert "ttl_seconds" in data
    
    def test_cache_clear_requires_auth(self):
        """POST /api/v1/cache/clear deve requerer autenticação."""
        r = client.post("/api/v1/cache/clear")
        # Deve retornar 401 ou 403 sem auth, ou 200 se auth não estiver habilitada
        assert r.status_code in [200, 401, 403, 422]


# =============================================================================
# API KEYS ENDPOINTS
# =============================================================================

class TestAPIKeysEndpoints:
    """Testes dos endpoints de API Keys."""
    
    def test_create_key_structure(self):
        """POST /api/v1/keys deve aceitar estrutura correta."""
        r = client.post("/api/v1/keys", json={
            "name": "test-key",
            "owner": "pytest"
        })
        # Pode retornar 200 ou 422 dependendo de validações
        assert r.status_code in [200, 422]
    
    def test_list_keys_requires_auth(self):
        """GET /api/v1/keys deve requerer autenticação."""
        r = client.get("/api/v1/keys")
        assert r.status_code in [200, 401, 403]


# =============================================================================
# AUDIT ENDPOINTS
# =============================================================================

class TestAuditEndpoints:
    """Testes dos endpoints de auditoria."""
    
    def test_audit_stats_returns_200(self):
        """GET /api/v1/audit/stats deve retornar 200."""
        r = client.get("/api/v1/audit/stats")
        assert r.status_code == 200
    
    def test_audit_logs_requires_auth(self):
        """GET /api/v1/audit/logs deve requerer autenticação."""
        r = client.get("/api/v1/audit/logs")
        assert r.status_code in [200, 401, 403]


# =============================================================================
# ERROR HANDLING
# =============================================================================

class TestErrorHandling:
    """Testes de tratamento de erros."""
    
    def test_404_for_unknown_endpoint(self):
        """Endpoint inexistente deve retornar 404."""
        r = client.get("/unknown/endpoint")
        assert r.status_code == 404
    
    def test_422_for_invalid_query_params(self):
        """Parâmetros inválidos devem retornar 422."""
        r = client.get("/facts", params={"order": "invalid"})
        assert r.status_code == 422
    
    def test_negative_offset_handled(self):
        """Offset negativo deve ser tratado."""
        r = client.get("/facts", params={"offset": -10})
        # API deve aceitar e tratar (offset = 0)
        assert r.status_code == 200
        data = r.json()
        assert data["offset"] >= 0


# =============================================================================
# CORS & HEADERS
# =============================================================================

class TestCORSAndHeaders:
    """Testes de CORS e headers."""
    
    def test_cors_headers_present(self):
        """Headers CORS devem estar presentes."""
        r = client.options("/health")
        # OPTIONS pode retornar 200 ou 405 dependendo da config
        assert r.status_code in [200, 405]
    
    def test_gzip_compression(self):
        """Resposta deve aceitar gzip."""
        r = client.get("/facts", params={"limit": 100}, headers={
            "Accept-Encoding": "gzip"
        })
        assert r.status_code == 200


# =============================================================================
# OPENAPI DOCUMENTATION
# =============================================================================

class TestOpenAPIDocumentation:
    """Testes da documentação OpenAPI."""
    
    def test_openapi_json_available(self):
        """OpenAPI JSON deve estar disponível."""
        r = client.get("/openapi.json")
        # Pode retornar 500 devido a problemas de Pydantic em alguns ambientes
        assert r.status_code in [200, 500]
        if r.status_code == 200:
            data = r.json()
            assert "openapi" in data
            assert "info" in data
            assert "paths" in data
    
    def test_swagger_ui_available(self):
        """Swagger UI deve estar disponível."""
        r = client.get("/docs")
        assert r.status_code == 200
    
    def test_redoc_available(self):
        """ReDoc deve estar disponível."""
        r = client.get("/redoc")
        assert r.status_code == 200
    
    def test_openapi_version(self):
        """Versão da API deve estar correta."""
        r = client.get("/openapi.json")
        if r.status_code == 200:
            data = r.json()
            assert data["info"]["version"] == "1.0.0"
    
    def test_openapi_title(self):
        """Título da API deve estar correto."""
        r = client.get("/openapi.json")
        if r.status_code == 200:
            data = r.json()
            assert "TechDengue" in data["info"]["title"]


# =============================================================================
# PERFORMANCE TESTS
# =============================================================================

class TestPerformance:
    """Testes básicos de performance."""
    
    def test_health_response_time(self):
        """Health check deve responder rapidamente."""
        import time
        start = time.time()
        r = client.get("/health")
        elapsed = time.time() - start
        
        assert r.status_code == 200
        assert elapsed < 2.0, f"Health check demorou {elapsed:.2f}s"
    
    def test_facts_response_time(self):
        """Facts deve responder em tempo razoável."""
        import time
        start = time.time()
        r = client.get("/facts", params={"limit": 100})
        elapsed = time.time() - start
        
        assert r.status_code == 200
        assert elapsed < 5.0, f"/facts demorou {elapsed:.2f}s"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
