"""
Testes unitários para RiskAnalyzer.
"""

import pytest
from unittest.mock import patch, MagicMock

from src.services.risk_analyzer import (
    RiskAnalyzer,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
)


class TestRiskAnalyzerRuleBased:
    """Testes para análise baseada em regras (sem API key)."""

    def setup_method(self):
        """Setup para cada teste."""
        self.analyzer = RiskAnalyzer(api_key=None)

    def test_is_ai_disabled_without_key(self):
        """Sem API key, IA deve estar desabilitada."""
        assert self.analyzer.is_ai_enabled is False

    def test_risk_critico_alta_incidencia(self):
        """Incidência > 300 + condições favoráveis = crítico."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=400,  # 400/100000 * 100000 = 400 incidência
            casos_ano_anterior=200,  # 100% aumento
            populacao=100000,
            temperatura_media=27.0,
            umidade_media=80.0,
            cobertura_saneamento=40.0,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.nivel_risco == "critico"
        assert result.score_risco >= 75
        assert "Declarar estado de alerta" in result.recomendacoes

    def test_risk_alto(self):
        """Score entre 50-75 = alto."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=150,
            casos_ano_anterior=100,
            populacao=100000,
            temperatura_media=26.0,
            umidade_media=75.0,
            cobertura_saneamento=60.0,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.nivel_risco in ["alto", "critico"]
        assert result.score_risco >= 50

    def test_risk_moderado(self):
        """Score entre 25-50 = moderado."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=30,
            casos_ano_anterior=30,
            populacao=100000,
            temperatura_media=22.0,
            umidade_media=60.0,
            cobertura_saneamento=85.0,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.nivel_risco in ["moderado", "baixo"]

    def test_risk_baixo(self):
        """Score < 25 = baixo."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=5,
            casos_ano_anterior=10,  # Diminuindo
            populacao=100000,
            temperatura_media=18.0,  # Fora do ideal
            umidade_media=50.0,  # Baixa
            cobertura_saneamento=95.0,  # Alta
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.nivel_risco == "baixo"
        assert "Manter ações básicas de prevenção" in result.recomendacoes

    def test_tendencia_aumentando(self):
        """Aumento > 50% deve indicar tendência aumentando."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=200,
            casos_ano_anterior=100,  # 100% aumento
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.tendencia == "aumentando"

    def test_tendencia_diminuindo(self):
        """Redução > 20% deve indicar tendência diminuindo."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=50,
            casos_ano_anterior=100,  # 50% redução
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.tendencia == "diminuindo"

    def test_tendencia_estavel(self):
        """Variação < 10% deve indicar tendência estável."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            casos_recentes=100,
            casos_ano_anterior=95,  # ~5% aumento
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.tendencia == "estavel"

    def test_fatores_temperatura_ideal(self):
        """Temperatura 25-30°C deve ser identificada como fator."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            temperatura_media=27.0,
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        fatores_str = " ".join(result.fatores_principais)
        assert "Temperatura ideal" in fatores_str or "25-30" in fatores_str

    def test_fatores_umidade_elevada(self):
        """Umidade >= 70% deve ser identificada como fator."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            umidade_media=85.0,
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        fatores_str = " ".join(result.fatores_principais)
        assert "Umidade" in fatores_str or "85" in fatores_str

    def test_fatores_saneamento_baixo(self):
        """Saneamento < 50% deve ser identificado como fator."""
        request = RiskAnalysisRequest(
            municipio="Cidade Teste",
            cobertura_saneamento=30.0,
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        fatores_str = " ".join(result.fatores_principais)
        assert "saneamento" in fatores_str.lower()

    def test_analise_detalhada_contem_municipio(self):
        """Análise detalhada deve mencionar o município."""
        request = RiskAnalysisRequest(
            municipio="Uberlândia",
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert "Uberlândia" in result.analise_detalhada

    def test_response_has_all_fields(self):
        """Response deve ter todos os campos obrigatórios."""
        request = RiskAnalysisRequest(
            municipio="Teste",
            populacao=100000,
        )
        result = self.analyzer._analyze_rule_based(request)
        assert result.municipio == "Teste"
        assert result.nivel_risco in ["baixo", "moderado", "alto", "critico"]
        assert 0 <= result.score_risco <= 100
        assert result.tendencia in ["estavel", "aumentando", "diminuindo"]
        assert isinstance(result.fatores_principais, list)
        assert isinstance(result.recomendacoes, list)
        assert len(result.analise_detalhada) > 0
        assert 0 <= result.confianca <= 1


class TestRiskAnalysisRequest:
    """Testes para o modelo RiskAnalysisRequest."""

    def test_default_values(self):
        """Valores padrão devem ser aplicados."""
        request = RiskAnalysisRequest(municipio="Teste")
        assert request.casos_recentes == 0
        assert request.casos_ano_anterior == 0
        assert request.temperatura_media == 25.0
        assert request.umidade_media == 70.0
        assert request.populacao == 100000
        assert request.cobertura_saneamento == 80.0
        assert request.acoes_recentes == []

    def test_custom_values(self):
        """Valores customizados devem sobrescrever padrões."""
        request = RiskAnalysisRequest(
            municipio="Belo Horizonte",
            codigo_ibge="3106200",
            casos_recentes=150,
            populacao=2500000,
        )
        assert request.municipio == "Belo Horizonte"
        assert request.codigo_ibge == "3106200"
        assert request.casos_recentes == 150
        assert request.populacao == 2500000


class TestRiskAnalysisResponse:
    """Testes para o modelo RiskAnalysisResponse."""

    def test_response_creation(self):
        """Response deve ser criada corretamente."""
        response = RiskAnalysisResponse(
            municipio="Teste",
            nivel_risco="alto",
            score_risco=65.5,
            tendencia="aumentando",
            fatores_principais=["fator1", "fator2"],
            recomendacoes=["acao1", "acao2"],
            analise_detalhada="Análise de teste.",
        )
        assert response.municipio == "Teste"
        assert response.nivel_risco == "alto"
        assert response.score_risco == 65.5
        assert response.modelo_usado == "llama-3.3-70b-versatile"

    def test_response_default_confianca(self):
        """Confiança padrão deve ser 0.8."""
        response = RiskAnalysisResponse(
            municipio="Teste",
            nivel_risco="baixo",
            score_risco=10.0,
            tendencia="estavel",
            fatores_principais=[],
            recomendacoes=[],
            analise_detalhada="Teste.",
        )
        assert response.confianca == 0.8


@pytest.mark.asyncio
class TestRiskAnalyzerAsync:
    """Testes assíncronos para RiskAnalyzer."""

    async def test_analyze_risk_without_api_key(self):
        """Sem API key deve usar análise rule-based."""
        analyzer = RiskAnalyzer(api_key=None)
        request = RiskAnalysisRequest(
            municipio="Belo Horizonte",
            casos_recentes=100,
            populacao=2500000,
        )
        
        with patch.object(analyzer, '_analyze_rule_based') as mock_rule:
            mock_rule.return_value = RiskAnalysisResponse(
                municipio="Belo Horizonte",
                nivel_risco="moderado",
                score_risco=40.0,
                tendencia="estavel",
                fatores_principais=[],
                recomendacoes=[],
                analise_detalhada="Teste.",
            )
            
            # Mock cache
            with patch('src.services.risk_analyzer.get_cache') as mock_cache:
                cache_instance = MagicMock()
                cache_instance.get.return_value = None
                mock_cache.return_value = cache_instance
                
                result = await analyzer.analyze_risk(request)
                
                assert result.municipio == "Belo Horizonte"
                mock_rule.assert_called_once()

    async def test_analyze_risk_uses_cache(self):
        """Deve usar cache se disponível."""
        analyzer = RiskAnalyzer(api_key=None)
        request = RiskAnalysisRequest(municipio="Teste")
        
        cached_data = {
            "municipio": "Teste",
            "nivel_risco": "baixo",
            "score_risco": 15.0,
            "tendencia": "estavel",
            "fatores_principais": [],
            "recomendacoes": [],
            "analise_detalhada": "Cached.",
            "confianca": 0.8,
            "timestamp": "2025-01-01T00:00:00Z",
            "modelo_usado": "llama-3.3-70b-versatile",
        }
        
        with patch('src.services.risk_analyzer.get_cache') as mock_cache:
            cache_instance = MagicMock()
            cache_instance.get.return_value = cached_data
            mock_cache.return_value = cache_instance
            
            result = await analyzer.analyze_risk(request)
            
            assert result.municipio == "Teste"
            assert result.nivel_risco == "baixo"
            assert result.analise_detalhada == "Cached."
