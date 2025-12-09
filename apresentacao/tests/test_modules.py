"""
Testes Unitários - Módulos de Análise
Dashboard CISARP Enterprise
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from dashboard.modules.performance_analyzer import PerformanceAnalyzer
from dashboard.modules.impact_analyzer import ImpactAnalyzer
from dashboard.modules.benchmark_analyzer import BenchmarkAnalyzer
from dashboard.modules.insights_generator import InsightsGenerator


class TestPerformanceAnalyzer:
    """Testes para PerformanceAnalyzer"""
    
    @pytest.fixture
    def analyzer(self):
        return PerformanceAnalyzer()
    
    @pytest.fixture
    def sample_data(self):
        return pd.DataFrame({
            'MUNICIPIO': ['Cidade A', 'Cidade B', 'Cidade C'] * 3,
            'POIS': [100, 200, 150, 120, 180, 160, 140, 190, 170],
            'HECTARES_MAPEADOS': [50.0, 75.0, 60.0, 55.0, 70.0, 65.0, 58.0, 72.0, 66.0],
            'DEVOLUTIVAS': [10, 20, 15, 12, 18, 16, 14, 19, 17],
            'DATA_MAP': pd.date_range('2024-01-01', periods=9, freq='M')
        })
    
    def test_calculate_kpis(self, analyzer, sample_data):
        """Testa cálculo de KPIs"""
        kpis = analyzer.calculate_kpis(sample_data)
        
        assert kpis['total_registros'] == 9
        assert kpis['pois_total'] == 1410
        assert kpis['hectares_total'] > 0
        assert kpis['densidade'] > 0
        assert kpis['municipios_unicos'] == 3
    
    def test_calculate_kpis_empty(self, analyzer):
        """Testa KPIs com DataFrame vazio"""
        empty_df = pd.DataFrame()
        kpis = analyzer.calculate_kpis(empty_df)
        
        assert kpis['total_registros'] == 0
        assert kpis['pois_total'] == 0
    
    def test_get_top_municipalities(self, analyzer, sample_data):
        """Testa top municípios"""
        top3 = analyzer.get_top_municipalities(sample_data, n=3, metric='count')
        
        assert len(top3) == 3
        assert 'municipio' in top3.columns
        assert 'total' in top3.columns
        assert 'rank' in top3.columns
    
    def test_temporal_evolution(self, analyzer, sample_data):
        """Testa evolução temporal"""
        temporal = analyzer.temporal_evolution(sample_data)
        
        assert 'monthly' in temporal
        assert 'trend' in temporal
        assert temporal['trend'] in ['crescente', 'decrescente', 'estável', 'insuficiente']
    
    def test_coverage_analysis(self, analyzer, sample_data):
        """Testa análise de cobertura"""
        coverage = analyzer.coverage_analysis(sample_data)
        
        assert coverage['municipios_total'] == 3
        assert coverage['densidade_media'] > 0
        assert 'cobertura_por_municipio' in coverage


class TestImpactAnalyzer:
    """Testes para ImpactAnalyzer"""
    
    @pytest.fixture
    def analyzer(self):
        return ImpactAnalyzer()
    
    def test_classify_impact(self, analyzer):
        """Testa classificação de impacto"""
        # Alta redução
        assert "ALTA" in analyzer._classify_impact(-35.0)
        # Redução significativa
        assert "SIGNIFICATIVA" in analyzer._classify_impact(-20.0)
        # Redução moderada
        assert "MODERADA" in analyzer._classify_impact(-10.0)
        # Estável
        assert "ESTÁVEL" in analyzer._classify_impact(0.0)
        # Aumento
        assert "AUMENTO" in analyzer._classify_impact(15.0)
    
    def test_interpret_correlation_strength(self, analyzer):
        """Testa interpretação de força de correlação"""
        assert analyzer._interpret_correlation_strength(0.2) == 'fraca'
        assert analyzer._interpret_correlation_strength(0.5) == 'moderada'
        assert analyzer._interpret_correlation_strength(0.8) == 'forte'


class TestBenchmarkAnalyzer:
    """Testes para BenchmarkAnalyzer"""
    
    @pytest.fixture
    def analyzer(self):
        return BenchmarkAnalyzer()
    
    @pytest.fixture
    def contractors_data(self):
        return pd.DataFrame({
            'CONTRATANTE': ['CISARP', 'ICISMEP', 'CISMAS', 'Outros'] * 5,
            'POIS': [100, 200, 150, 80] * 5,
            'HECTARES_MAPEADOS': [50, 100, 75, 40] * 5
        })
    
    def test_rank_contractors(self, analyzer, contractors_data):
        """Testa ranking de contratantes"""
        ranking = analyzer.rank_contractors(contractors_data, 'CISARP')
        
        assert 'ranking_completo' in ranking
        assert 'top_10' in ranking
        assert 'cisarp_position' in ranking
        assert ranking['cisarp_position'] is not None
    
    def test_calc_diff_pct(self, analyzer):
        """Testa cálculo de diferença percentual"""
        # 150 é 50% maior que 100
        diff = analyzer._calc_diff_pct(150, 100)
        assert diff == 50.0
        
        # 75 é 25% menor que 100
        diff = analyzer._calc_diff_pct(75, 100)
        assert diff == -25.0
        
        # Baseline zero
        diff = analyzer._calc_diff_pct(100, 0)
        assert diff == 0.0


class TestInsightsGenerator:
    """Testes para InsightsGenerator"""
    
    @pytest.fixture
    def generator(self):
        return InsightsGenerator()
    
    @pytest.fixture
    def sample_kpis(self):
        return {
            'total_registros': 100,
            'pois_total': 10000,
            'hectares_total': 5000,
            'densidade': 2.0,
            'taxa_conversao': 35.0,
            'municipios_unicos': 50
        }
    
    @pytest.fixture
    def sample_temporal(self):
        return {
            'trend': 'crescente',
            'dias_operacao': 180
        }
    
    @pytest.fixture
    def sample_ranking(self):
        return {
            'cisarp_position': 4,
            'total_contractors': 66,
            'cisarp_percentile': 6.1,
            'gaps': {'to_top': -50, 'to_top3': -10, 'to_top5': 5}
        }
    
    def test_generate_insights(self, generator, sample_kpis, sample_temporal, sample_ranking):
        """Testa geração de insights"""
        insights = generator.generate_insights(
            sample_kpis,
            sample_temporal,
            sample_ranking,
            None
        )
        
        assert len(insights) > 0
        assert all('title' in i for i in insights)
        assert all('description' in i for i in insights)
        assert all('severity' in i for i in insights)
        assert all('priority' in i for i in insights)
    
    def test_generate_recommendations(self, generator, sample_kpis, sample_ranking):
        """Testa geração de recomendações"""
        insights = generator.generate_insights(
            sample_kpis,
            {'trend': 'crescente', 'dias_operacao': 180},
            sample_ranking,
            None
        )
        
        recommendations = generator.generate_recommendations(
            insights,
            sample_kpis,
            sample_ranking
        )
        
        assert 'curto_prazo' in recommendations
        assert 'medio_prazo' in recommendations
        assert 'longo_prazo' in recommendations
        assert len(recommendations['curto_prazo']) > 0
    
    def test_identify_opportunities(self, generator, sample_kpis, sample_temporal):
        """Testa identificação de oportunidades"""
        opportunities = generator.identify_opportunities(
            sample_kpis,
            sample_temporal
        )
        
        assert isinstance(opportunities, list)
        if len(opportunities) > 0:
            assert all('titulo' in opp for opp in opportunities)
            assert all('potencial' in opp for opp in opportunities)
    
    def test_interpret_density(self, generator):
        """Testa interpretação de densidade"""
        # Alta densidade
        result = generator._interpret_density(2.0)
        assert "alta" in result.lower() or "intensiva" in result.lower()
        
        # Baixa densidade
        result = generator._interpret_density(0.3)
        assert "baixa" in result.lower() or "aumentar" in result.lower()
    
    def test_interpret_conversion_rate(self, generator):
        """Testa interpretação de taxa de conversão"""
        # Taxa alta
        result = generator._interpret_conversion_rate(55.0)
        assert "excelente" in result.lower() or "alta" in result.lower()
        
        # Taxa baixa
        result = generator._interpret_conversion_rate(10.0)
        assert "baixa" in result.lower() or "revisão" in result.lower()


# Testes de integração
class TestIntegration:
    """Testes de integração entre módulos"""
    
    def test_full_analysis_pipeline(self):
        """Testa pipeline completo de análise"""
        # Criar dados de exemplo
        df = pd.DataFrame({
            'MUNICIPIO': ['Cidade A', 'Cidade B', 'Cidade C'],
            'POIS': [100, 200, 150],
            'HECTARES_MAPEADOS': [50.0, 75.0, 60.0],
            'DEVOLUTIVAS': [10, 20, 15],
            'DATA_MAP': pd.date_range('2024-01-01', periods=3, freq='M')
        })
        
        # Performance
        perf = PerformanceAnalyzer()
        kpis = perf.calculate_kpis(df)
        assert kpis['total_registros'] == 3
        
        # Insights
        insights_gen = InsightsGenerator()
        insights = insights_gen.generate_insights(
            kpis,
            {'trend': 'crescente', 'dias_operacao': 90},
            {'cisarp_position': 5, 'total_contractors': 66, 'cisarp_percentile': 7.6, 'gaps': {}},
            None
        )
        assert len(insights) > 0
        
        # Recomendações
        recommendations = insights_gen.generate_recommendations(insights, kpis, {})
        assert 'curto_prazo' in recommendations


# Executar testes
if __name__ == '__main__':
    pytest.main([__file__, '-v'])
