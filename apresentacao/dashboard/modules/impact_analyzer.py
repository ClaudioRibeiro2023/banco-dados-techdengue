"""
Impact Analyzer - Análise de Impacto Epidemiológico
Baseado em padrões SIVEPI

Responsável por:
- Análise before-after de casos de dengue
- Correlações estatísticas
- Identificação de cases de sucesso
- Classificação de impacto
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from scipy import stats
from loguru import logger
import streamlit as st

from dashboard.config.settings import settings
from dashboard.core.data_processor import data_processor

class ImpactAnalyzer:
    """
    Análise de impacto epidemiológico das intervenções CISARP
    """
    
    def __init__(self):
        logger.info("ImpactAnalyzer inicializado")
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def before_after_analysis(
        _self,
        df_dengue_before: pd.DataFrame,
        df_dengue_after: pd.DataFrame,
        municipios_cisarp: List[str]
    ) -> Dict:
        """
        Análise before-after de casos de dengue
        
        Args:
            df_dengue_before: Dados de dengue ANTES das intervenções
            df_dengue_after: Dados de dengue DEPOIS das intervenções
            municipios_cisarp: Lista de códigos IBGE dos municípios CISARP
        
        Returns:
            Dict com análise completa
        """
        if len(municipios_cisarp) == 0:
            return _self._empty_analysis()
        
        results = []
        
        for codigo in municipios_cisarp:
            casos_before = _self._sum_cases(df_dengue_before, str(codigo))
            casos_after = _self._sum_cases(df_dengue_after, str(codigo))
            
            if casos_before > 0:
                variacao_abs = casos_after - casos_before
                variacao_pct = (variacao_abs / casos_before) * 100
                
                results.append({
                    'municipio': str(codigo),
                    'casos_antes': int(casos_before),
                    'casos_depois': int(casos_after),
                    'variacao_absoluta': int(variacao_abs),
                    'variacao_percentual': float(variacao_pct),
                    'classificacao': _self._classify_impact(variacao_pct)
                })
        
        if len(results) == 0:
            return _self._empty_analysis()
        
        df_results = pd.DataFrame(results)
        
        return {
            'individual': df_results,
            'aggregate': _self._aggregate_statistics(df_results),
            'cases_success': _self._identify_success_cases(df_results),
            'distribution': _self._impact_distribution(df_results)
        }
    
    def _sum_cases(self, df: pd.DataFrame, codigo: str) -> int:
        """
        Soma casos de dengue para município
        
        Args:
            df: DataFrame de dengue
            codigo: Código IBGE do município
        
        Returns:
            Total de casos
        """
        if len(df) == 0:
            return 0
        
        # Tentar diferentes formatos de coluna
        cod_col = None
        for col_name in ['codmun', 'CODMUN', 'codigo_ibge', 'CODIGO IBGE']:
            if col_name in df.columns:
                cod_col = col_name
                break
        
        if not cod_col:
            return 0
        
        # Filtrar município
        mun_data = df[df[cod_col].astype(str) == codigo]
        
        if len(mun_data) == 0:
            return 0
        
        # Identificar colunas de semana
        week_cols = [col for col in df.columns if col.startswith('Semana') or col.startswith('semana')]
        
        if not week_cols:
            return 0
        
        # Somar casos
        try:
            total = mun_data[week_cols].sum(axis=1).sum()
            return int(total)
        except:
            return 0
    
    def _classify_impact(self, variacao_pct: float) -> str:
        """
        Classifica impacto baseado em variação percentual
        
        Args:
            variacao_pct: Variação percentual de casos
        
        Returns:
            Classificação de impacto
        """
        if variacao_pct < -30:
            return 'ALTA REDUÇÃO ⭐⭐⭐'
        elif variacao_pct < -15:
            return 'REDUÇÃO SIGNIFICATIVA ⭐⭐'
        elif variacao_pct < -5:
            return 'REDUÇÃO MODERADA ⭐'
        elif variacao_pct < 5:
            return 'ESTÁVEL'
        elif variacao_pct < 20:
            return 'AUMENTO LEVE ⚠️'
        else:
            return 'AUMENTO SIGNIFICATIVO ⚠️⚠️'
    
    def _aggregate_statistics(self, df: pd.DataFrame) -> Dict:
        """
        Estatísticas agregadas de impacto
        
        Args:
            df: DataFrame com resultados individuais
        
        Returns:
            Dict com estatísticas
        """
        return {
            'total_municipios': len(df),
            'casos_antes_total': int(df['casos_antes'].sum()),
            'casos_depois_total': int(df['casos_depois'].sum()),
            'variacao_media': float(df['variacao_percentual'].mean()),
            'variacao_mediana': float(df['variacao_percentual'].median()),
            'variacao_std': float(df['variacao_percentual'].std()),
            'municipios_com_reducao': int((df['variacao_percentual'] < 0).sum()),
            'municipios_com_aumento': int((df['variacao_percentual'] > 0).sum()),
            'municipios_estaveis': int((df['variacao_percentual'].abs() < 5).sum()),
            'reducao_total_absoluta': int(df[df['variacao_absoluta'] < 0]['variacao_absoluta'].sum())
        }
    
    def _identify_success_cases(
        self,
        df: pd.DataFrame,
        threshold: float = -15.0,
        min_cases: int = 50
    ) -> pd.DataFrame:
        """
        Identifica cases de sucesso
        
        Args:
            df: DataFrame com resultados
            threshold: Percentual mínimo de redução para ser sucesso
            min_cases: Mínimo de casos antes para considerar
        
        Returns:
            DataFrame com cases de sucesso
        """
        # Filtrar por critérios de sucesso
        success = df[
            (df['variacao_percentual'] < threshold) &
            (df['casos_antes'] >= min_cases)
        ].copy()
        
        # Ordenar por maior redução percentual
        success = success.sort_values('variacao_percentual')
        
        # Adicionar score de sucesso (0-100)
        if len(success) > 0:
            # Normalizar redução percentual para score
            min_var = success['variacao_percentual'].min()
            max_var = threshold
            success['score_sucesso'] = success['variacao_percentual'].apply(
                lambda x: int(100 * (1 - (x - min_var) / (max_var - min_var))) if max_var != min_var else 100
            )
        
        return success.head(10)  # Top 10 cases de sucesso
    
    def _impact_distribution(self, df: pd.DataFrame) -> Dict:
        """
        Distribuição de impacto em categorias
        
        Args:
            df: DataFrame com resultados
        
        Returns:
            Dict com distribuição
        """
        distribution = df['classificacao'].value_counts().to_dict()
        
        return {
            'distribution': distribution,
            'total': len(df)
        }
    
    def _empty_analysis(self) -> Dict:
        """Retorna análise vazia"""
        return {
            'individual': pd.DataFrame(),
            'aggregate': {
                'total_municipios': 0,
                'casos_antes_total': 0,
                'casos_depois_total': 0,
                'variacao_media': 0,
                'variacao_mediana': 0,
                'variacao_std': 0,
                'municipios_com_reducao': 0,
                'municipios_com_aumento': 0,
                'municipios_estaveis': 0,
                'reducao_total_absoluta': 0
            },
            'cases_success': pd.DataFrame(),
            'distribution': {'distribution': {}, 'total': 0}
        }
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def correlation_analysis(
        _self,
        df_activities: pd.DataFrame,
        df_impact: pd.DataFrame
    ) -> Dict:
        """
        Análise de correlação entre atividades e impacto
        
        Args:
            df_activities: DataFrame de atividades CISARP
            df_impact: DataFrame com análise de impacto
        
        Returns:
            Dict com análises de correlação
        """
        if len(df_activities) == 0 or len(df_impact) == 0:
            return {
                'correlation_pois': None,
                'correlation_hectares': None,
                'correlation_activities': None,
                'interpretation': 'Dados insuficientes para análise'
            }
        
        # Identificar coluna de município
        col_municipio = data_processor.identify_municipality_column(df_activities)
        if not col_municipio:
            return {
                'correlation_pois': None,
                'correlation_hectares': None,
                'correlation_activities': None,
                'interpretation': 'Coluna de município não identificada'
            }
        
        # Agregar atividades por município
        agg_activities = df_activities.groupby(col_municipio).agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        agg_activities[col_municipio] = agg_activities[col_municipio].astype(str)
        
        # Preparar dados de impacto
        df_impact_clean = df_impact.copy()
        df_impact_clean['municipio'] = df_impact_clean['municipio'].astype(str)
        
        # Merge datasets
        merged = pd.merge(
            agg_activities,
            df_impact_clean[['municipio', 'variacao_percentual']],
            left_on=col_municipio,
            right_on='municipio',
            how='inner'
        )
        
        if len(merged) < 3:
            return {
                'correlation_pois': None,
                'correlation_hectares': None,
                'correlation_activities': None,
                'interpretation': 'Dados insuficientes para correlação (n < 3)'
            }
        
        # Calcular correlações de Pearson
        try:
            corr_pois, p_pois = stats.pearsonr(
                merged['POIS'],
                merged['variacao_percentual']
            )
            
            corr_hectares, p_hectares = stats.pearsonr(
                merged['HECTARES_MAPEADOS'],
                merged['variacao_percentual']
            )
            
            # Correlação com número de atividades
            activities_count = df_activities.groupby(col_municipio).size().reset_index(name='n_activities')
            activities_count[col_municipio] = activities_count[col_municipio].astype(str)
            
            merged_count = pd.merge(
                activities_count,
                df_impact_clean[['municipio', 'variacao_percentual']],
                left_on=col_municipio,
                right_on='municipio',
                how='inner'
            )
            
            if len(merged_count) >= 3:
                corr_activities, p_activities = stats.pearsonr(
                    merged_count['n_activities'],
                    merged_count['variacao_percentual']
                )
            else:
                corr_activities, p_activities = None, None
            
            return {
                'correlation_pois': {
                    'coefficient': float(corr_pois),
                    'p_value': float(p_pois),
                    'significant': p_pois < 0.05,
                    'strength': _self._interpret_correlation_strength(corr_pois)
                },
                'correlation_hectares': {
                    'coefficient': float(corr_hectares),
                    'p_value': float(p_hectares),
                    'significant': p_hectares < 0.05,
                    'strength': _self._interpret_correlation_strength(corr_hectares)
                },
                'correlation_activities': {
                    'coefficient': float(corr_activities) if corr_activities else None,
                    'p_value': float(p_activities) if p_activities else None,
                    'significant': p_activities < 0.05 if p_activities else None,
                    'strength': _self._interpret_correlation_strength(corr_activities) if corr_activities else None
                } if corr_activities else None,
                'interpretation': _self._interpret_correlations(corr_pois, p_pois, corr_hectares, p_hectares),
                'n_observations': len(merged)
            }
        
        except Exception as e:
            logger.error(f"Erro ao calcular correlações: {e}")
            return {
                'correlation_pois': None,
                'correlation_hectares': None,
                'correlation_activities': None,
                'interpretation': f'Erro no cálculo: {str(e)}'
            }
    
    def _interpret_correlation_strength(self, corr: float) -> str:
        """Interpreta força da correlação"""
        abs_corr = abs(corr)
        if abs_corr < 0.3:
            return 'fraca'
        elif abs_corr < 0.7:
            return 'moderada'
        else:
            return 'forte'
    
    def _interpret_correlations(
        self,
        corr_pois: float,
        p_pois: float,
        corr_hectares: float,
        p_hectares: float
    ) -> str:
        """
        Interpretação narrativa das correlações
        
        Returns:
            String com interpretação
        """
        interpretations = []
        
        # POIs
        if p_pois < 0.05:
            if corr_pois < -0.5:
                interpretations.append("✅ Forte correlação NEGATIVA entre POIs e casos (mais POIs = maior redução)")
            elif corr_pois < -0.3:
                interpretations.append("✅ Moderada correlação negativa entre POIs e casos")
            elif corr_pois < 0:
                interpretations.append("Fraca correlação negativa entre POIs e casos")
            else:
                interpretations.append("⚠️ Correlação positiva entre POIs e casos (revisar dados)")
        else:
            interpretations.append("Sem correlação estatisticamente significativa entre POIs e casos")
        
        # Hectares
        if p_hectares < 0.05:
            if corr_hectares < -0.5:
                interpretations.append("✅ Forte correlação entre cobertura territorial e redução de casos")
            elif corr_hectares < -0.3:
                interpretations.append("✅ Moderada correlação entre hectares mapeados e redução")
        
        if not interpretations:
            return "Correlações não significativas estatisticamente (p > 0.05)"
        
        return " | ".join(interpretations)
    
    def get_summary(
        self,
        before_after_results: Dict,
        correlation_results: Optional[Dict] = None
    ) -> str:
        """
        Resumo textual do impacto
        
        Args:
            before_after_results: Resultados da análise before-after
            correlation_results: Resultados de correlação (opcional)
        
        Returns:
            String com resumo
        """
        agg = before_after_results['aggregate']
        
        summary = f"""
        **Resumo de Impacto Epidemiológico**
        
        - **{agg['total_municipios']}** municípios analisados
        - **{agg['casos_antes_total']:,}** casos ANTES das intervenções
        - **{agg['casos_depois_total']:,}** casos DEPOIS das intervenções
        - **{agg['variacao_media']:.1f}%** variação média
        - **{agg['municipios_com_reducao']}** municípios com redução de casos
        - **{abs(agg['reducao_total_absoluta']):,}** casos evitados (redução total)
        
        **Cases de Sucesso:** {len(before_after_results['cases_success'])} identificados
        """
        
        if correlation_results and correlation_results.get('correlation_pois'):
            summary += f"\n**Correlação:** {correlation_results['interpretation']}"
        
        return summary.strip()

# Instância global
impact_analyzer = ImpactAnalyzer()
