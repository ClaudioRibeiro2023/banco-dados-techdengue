"""
Módulos de Análise Especializados
Baseado em arquitetura SIVEPI
"""

from .performance_analyzer import performance_analyzer, PerformanceAnalyzer
from .impact_analyzer import impact_analyzer, ImpactAnalyzer
from .benchmark_analyzer import benchmark_analyzer, BenchmarkAnalyzer
from .insights_generator import insights_generator, InsightsGenerator
from dashboard.core.data_processor import data_processor
from dashboard.core.data_gateway import load_cisarp_data
from dashboard.config.settings import settings as settings

__all__ = [
    'performance_analyzer',
    'PerformanceAnalyzer',
    'impact_analyzer',
    'ImpactAnalyzer',
    'benchmark_analyzer',
    'BenchmarkAnalyzer',
    'insights_generator',
    'InsightsGenerator',
    'data_processor',
    'load_cisarp_data',
    'settings'
]
