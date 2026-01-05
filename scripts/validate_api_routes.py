#!/usr/bin/env python3
"""
Validador de Rotas da API TechDengue
=====================================
Script para validar todos os endpoints da API em qualquer ambiente.

Uso:
    python scripts/validate_api_routes.py [URL_BASE]
    
Exemplos:
    python scripts/validate_api_routes.py http://localhost:8000
    python scripts/validate_api_routes.py https://banco-dados-techdengue-production.up.railway.app
"""
import sys
import time
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

try:
    import httpx
except ImportError:
    print("❌ httpx não instalado. Execute: pip install httpx")
    sys.exit(1)


@dataclass
class RouteTest:
    """Definição de teste de rota."""
    method: str
    path: str
    params: Optional[Dict[str, Any]] = None
    expected_status: List[int] = None
    description: str = ""
    
    def __post_init__(self):
        if self.expected_status is None:
            self.expected_status = [200]


@dataclass
class TestResult:
    """Resultado de um teste."""
    route: RouteTest
    status_code: int
    elapsed_ms: float
    success: bool
    error: Optional[str] = None
    response_size: int = 0


# Definição de todas as rotas a testar
ROUTES_TO_TEST: List[RouteTest] = [
    # Health & Monitoring
    RouteTest("GET", "/health", description="Health check"),
    RouteTest("GET", "/monitor", description="Dashboard de monitoramento"),
    RouteTest("GET", "/quality", description="Relatório de qualidade"),
    RouteTest("GET", "/datasets", description="Catálogo de datasets"),
    RouteTest("GET", "/api/v1/status", description="Status do sistema"),
    RouteTest("GET", "/api/v1/cache/stats", description="Estatísticas de cache"),
    
    # Documentação
    RouteTest("GET", "/docs", description="Swagger UI"),
    RouteTest("GET", "/redoc", description="ReDoc"),
    RouteTest("GET", "/openapi.json", description="OpenAPI Schema"),
    
    # Facts (Atividades)
    RouteTest("GET", "/facts", {"limit": 5}, description="Listar atividades"),
    RouteTest("GET", "/facts", {"limit": 5, "format": "csv"}, description="Export CSV"),
    RouteTest("GET", "/facts/summary", description="Resumo geral"),
    RouteTest("GET", "/facts/summary", {"group_by": "municipio"}, description="Resumo por município"),
    
    # Dengue
    RouteTest("GET", "/dengue", {"limit": 5}, description="Dados de dengue"),
    
    # Municípios
    RouteTest("GET", "/municipios", {"limit": 5}, description="Lista de municípios"),
    RouteTest("GET", "/municipios", {"q": "belo"}, description="Busca por nome"),
    
    # Gold Analise
    RouteTest("GET", "/gold/analise", {"limit": 5}, description="Análise integrada"),
    
    # GIS (modo Telos: pode retornar lista vazia se DB/dados ausentes)
    RouteTest("GET", "/gis/banco", params={"limit": 5}, expected_status=[200], description="Dados GIS"),
    RouteTest("GET", "/gis/pois", params={"limit": 5}, expected_status=[200], description="POIs do campo"),
    
    # Weather & Risk (podem falhar se APIs externas offline)
    RouteTest("GET", "/api/v1/weather/uberlandia", expected_status=[200, 404, 500, 503], description="Clima"),
    RouteTest("GET", "/api/v1/risk/dashboard", expected_status=[200, 500, 503], description="Dashboard de risco"),
    
    # Audit
    RouteTest("GET", "/api/v1/audit/stats", description="Estatísticas de auditoria"),
]


def run_test(client: httpx.Client, base_url: str, route: RouteTest) -> TestResult:
    """Executa um teste de rota."""
    url = f"{base_url.rstrip('/')}{route.path}"
    
    try:
        start = time.time()
        
        if route.method == "GET":
            response = client.get(url, params=route.params, timeout=30.0)
        elif route.method == "POST":
            response = client.post(url, params=route.params, timeout=30.0)
        else:
            raise ValueError(f"Método não suportado: {route.method}")
        
        elapsed_ms = (time.time() - start) * 1000
        
        success = response.status_code in route.expected_status
        
        return TestResult(
            route=route,
            status_code=response.status_code,
            elapsed_ms=elapsed_ms,
            success=success,
            response_size=len(response.content),
        )
        
    except httpx.TimeoutException:
        return TestResult(
            route=route,
            status_code=0,
            elapsed_ms=30000,
            success=False,
            error="Timeout (30s)",
        )
    except Exception as e:
        return TestResult(
            route=route,
            status_code=0,
            elapsed_ms=0,
            success=False,
            error=str(e),
        )


def format_size(size_bytes: int) -> str:
    """Formata tamanho em bytes para leitura humana."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / 1024 / 1024:.1f} MB"


def main():
    # Determinar URL base
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8000"
    
    print("=" * 70)
    print("🦟 TechDengue API - Validador de Rotas")
    print("=" * 70)
    print(f"📍 URL Base: {base_url}")
    print(f"📅 Data: {datetime.now().isoformat()}")
    print(f"🔢 Total de rotas: {len(ROUTES_TO_TEST)}")
    print("=" * 70)
    print()
    
    results: List[TestResult] = []
    
    with httpx.Client() as client:
        for i, route in enumerate(ROUTES_TO_TEST, 1):
            result = run_test(client, base_url, route)
            results.append(result)
            
            # Formatação do resultado
            if result.success:
                status_icon = "✅"
            else:
                status_icon = "❌"
            
            params_str = ""
            if route.params:
                params_str = f" ?{json.dumps(route.params)}"
            
            print(f"{status_icon} [{i:02d}/{len(ROUTES_TO_TEST)}] {route.method} {route.path}{params_str}")
            print(f"   └─ Status: {result.status_code} | Tempo: {result.elapsed_ms:.0f}ms | Tamanho: {format_size(result.response_size)}")
            
            if result.error:
                print(f"   └─ Erro: {result.error}")
            
            if not result.success:
                print(f"   └─ Esperado: {route.expected_status}")
    
    # Resumo
    print()
    print("=" * 70)
    print("📊 RESUMO")
    print("=" * 70)
    
    passed = sum(1 for r in results if r.success)
    failed = len(results) - passed
    total_time = sum(r.elapsed_ms for r in results)
    avg_time = total_time / len(results) if results else 0
    
    print(f"✅ Sucesso: {passed}/{len(results)}")
    print(f"❌ Falhas:  {failed}/{len(results)}")
    print(f"⏱️  Tempo total: {total_time:.0f}ms")
    print(f"⏱️  Tempo médio: {avg_time:.0f}ms")
    
    if failed > 0:
        print()
        print("⚠️  Rotas com falha:")
        for r in results:
            if not r.success:
                print(f"   - {r.route.method} {r.route.path}: {r.status_code} (esperado: {r.route.expected_status})")
    
    print()
    
    # Exit code
    if failed > 0:
        print("❌ Validação FALHOU")
        sys.exit(1)
    else:
        print("✅ Validação PASSOU")
        sys.exit(0)


if __name__ == "__main__":
    main()
