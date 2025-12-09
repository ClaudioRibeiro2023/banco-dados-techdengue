"""
Performance Analyzer - Análise de Performance Operacional
Baseado em padrões SIVEPI

Responsável por:
- Cálculo de KPIs operacionais
- Análise de top municípios
- Evolução temporal
- Métricas de densidade e cobertura
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from loguru import logger
import streamlit as st

from dashboard.config.settings import settings
from dashboard.core.data_processor import data_processor

class PerformanceAnalyzer:
    """
    Análise completa de performance operacional CISARP
    """
    
    def __init__(self):
        logger.info("PerformanceAnalyzer inicializado")
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def calculate_kpis(_self, df: pd.DataFrame) -> Dict:
        """
        Calcula KPIs principais de performance
        
        Args:
            df: DataFrame com dados CISARP
        
        Returns:
            Dict com KPIs calculados
        """
        if len(df) == 0:
            return _self._empty_kpis()
        
        # Validar colunas necessárias
        pois_col = 'POIS' if 'POIS' in df.columns else None
        hectares_col = 'HECTARES_MAPEADOS' if 'HECTARES_MAPEADOS' in df.columns else None
        devolutivas_col = 'DEVOLUTIVAS' if 'DEVOLUTIVAS' in df.columns else None
        
        kpis = {
            'total_registros': len(df),
            'pois_total': int(df[pois_col].sum()) if pois_col else 0,
            'hectares_total': float(df[hectares_col].sum()) if hectares_col else 0,
            'devolutivas_total': int(df[devolutivas_col].sum()) if devolutivas_col else 0,
        }
        
        # Médias
        kpis['pois_medio'] = kpis['pois_total'] / kpis['total_registros'] if kpis['total_registros'] > 0 else 0
        kpis['hectares_medio'] = kpis['hectares_total'] / kpis['total_registros'] if kpis['total_registros'] > 0 else 0
        
        # Densidade
        kpis['densidade'] = _self._calculate_density(
            kpis['pois_total'],
            kpis['hectares_total']
        )
        
        # Taxa de conversão (devolutivas/total)
        if devolutivas_col and kpis['pois_total'] > 0:
            kpis['taxa_conversao'] = (kpis['devolutivas_total'] / kpis['pois_total']) * 100
        else:
            kpis['taxa_conversao'] = 0
        
        # Identificar municípios únicos
        col_municipio = data_processor.identify_municipality_column(df)
        if col_municipio:
            kpis['municipios_unicos'] = df[col_municipio].nunique()
        else:
            kpis['municipios_unicos'] = 0
        
        logger.info(f"KPIs calculados: {kpis['total_registros']} registros, {kpis['pois_total']} POIs")
        
        return kpis
    
    def _calculate_density(self, pois: float, hectares: float) -> float:
        """Calcula densidade POIs/hectare"""
        if hectares == 0:
            return 0.0
        return pois / hectares
    
    def _empty_kpis(self) -> Dict:
        """Retorna KPIs vazios"""
        return {
            'total_registros': 0,
            'pois_total': 0,
            'hectares_total': 0,
            'devolutivas_total': 0,
            'pois_medio': 0,
            'hectares_medio': 0,
            'densidade': 0,
            'taxa_conversao': 0,
            'municipios_unicos': 0
        }
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def get_top_municipalities(
        _self,
        df: pd.DataFrame,
        n: int = 15,
        metric: str = 'count'
    ) -> pd.DataFrame:
        """
        Top N municípios por métrica especificada
        
        Args:
            df: DataFrame CISARP
            n: Número de top municípios
            metric: 'count' (intervenções), 'pois', 'hectares'
        
        Returns:
            DataFrame com top municípios
        """
        if len(df) == 0:
            return pd.DataFrame()
        
        col_municipio = data_processor.identify_municipality_column(df)
        if not col_municipio:
            logger.warning("Coluna de município não identificada")
            return pd.DataFrame()
        
        if metric == 'count':
            # Contar intervenções por município
            top = df[col_municipio].value_counts().head(n).reset_index()
            top.columns = ['municipio', 'total']
            
        elif metric == 'pois' and 'POIS' in df.columns:
            # Somar POIs por município
            top = df.groupby(col_municipio)['POIS'].sum().sort_values(ascending=False).head(n).reset_index()
            top.columns = ['municipio', 'total']
            
        elif metric == 'hectares' and 'HECTARES_MAPEADOS' in df.columns:
            # Somar hectares por município
            top = df.groupby(col_municipio)['HECTARES_MAPEADOS'].sum().sort_values(ascending=False).head(n).reset_index()
            top.columns = ['municipio', 'total']
            
        else:
            logger.warning(f"Métrica '{metric}' não disponível")
            return pd.DataFrame()
        
        # Adicionar rank
        top['rank'] = range(1, len(top) + 1)
        
        logger.info(f"Top {n} municípios calculados (métrica: {metric})")
        
        return top
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def temporal_evolution(_self, df: pd.DataFrame) -> Dict:
        """
        Análise de evolução temporal
        
        Args:
            df: DataFrame CISARP
        
        Returns:
            Dict com dados de evolução temporal
        """
        if len(df) == 0 or 'DATA_MAP' not in df.columns:
            return {
                'monthly': pd.DataFrame(),
                'quarterly': pd.DataFrame(),
                'trend': 'insuficiente',
                'periodo_inicio': None,
                'periodo_fim': None,
                'dias_operacao': 0
            }
        
        df_temp = df.copy()
        df_temp['DATA_MAP'] = pd.to_datetime(df_temp['DATA_MAP'], errors='coerce')
        df_temp = df_temp.dropna(subset=['DATA_MAP'])
        
        if len(df_temp) == 0:
            return {
                'monthly': pd.DataFrame(),
                'quarterly': pd.DataFrame(),
                'trend': 'insuficiente',
                'periodo_inicio': None,
                'periodo_fim': None,
                'dias_operacao': 0
            }
        
        # Evolução mensal
        df_temp['mes'] = df_temp['DATA_MAP'].dt.to_period('M')
        
        monthly = df_temp.groupby('mes').agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        monthly['mes'] = monthly['mes'].astype(str)
        
        # Evolução trimestral
        df_temp['trimestre'] = df_temp['DATA_MAP'].dt.to_period('Q')
        quarterly = df_temp.groupby('trimestre').agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        quarterly['trimestre'] = quarterly['trimestre'].astype(str)
        
        # Calcular tendência
        trend = _self._calculate_trend(monthly['POIS'].values if len(monthly) > 0 else [])
        
        # Período de operação
        periodo_inicio = df_temp['DATA_MAP'].min()
        periodo_fim = df_temp['DATA_MAP'].max()
        dias_operacao = (periodo_fim - periodo_inicio).days if periodo_inicio and periodo_fim else 0
        
        return {
            'monthly': monthly,
            'quarterly': quarterly,
            'trend': trend,
            'periodo_inicio': periodo_inicio,
            'periodo_fim': periodo_fim,
            'dias_operacao': dias_operacao
        }
    
    def _calculate_trend(self, values: np.ndarray) -> str:
        """
        Calcula tendência (crescente, decrescente, estável)
        
        Args:
            values: Array de valores
        
        Returns:
            'crescente', 'decrescente', 'estável' ou 'insuficiente'
        """
        if len(values) < 2:
            return 'insuficiente'
        
        # Dividir em duas metades
        mid = len(values) // 2
        first_half = np.mean(values[:mid])
        second_half = np.mean(values[mid:])
        
        if first_half == 0:
            return 'insuficiente'
        
        # Calcular variação percentual
        diff_pct = ((second_half - first_half) / first_half) * 100
        
        if diff_pct > 10:
            return 'crescente'
        elif diff_pct < -10:
            return 'decrescente'
        else:
            return 'estável'
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def category_analysis(_self, df: pd.DataFrame) -> Dict:
        """
        Análise por categorias de POIs
        
        Args:
            df: DataFrame CISARP
        
        Returns:
            Dict com análise de categorias
        """
        # Identificar colunas de categorias (começam com maiúscula e são numéricas)
        category_cols = [
            col for col in df.columns
            if col[0].isupper() and 
            col not in ['CODIGO IBGE', 'DATA_MAP', 'POIS', 'HECTARES_MAPEADOS', 'DEVOLUTIVAS'] and
            pd.api.types.is_numeric_dtype(df[col])
        ]
        
        if not category_cols:
            return {
                'categories': pd.DataFrame(),
                'top_10': pd.DataFrame()
            }
        
        # Somar cada categoria
        categories = []
        for col in category_cols:
            total = df[col].sum()
            if total > 0:
                categories.append({
                    'categoria': col,
                    'total': int(total),
                    'percentual': 0  # Será calculado depois
                })
        
        df_categories = pd.DataFrame(categories)
        
        if len(df_categories) == 0:
            return {
                'categories': pd.DataFrame(),
                'top_10': pd.DataFrame()
            }
        
        # Calcular percentuais
        total_geral = df_categories['total'].sum()
        df_categories['percentual'] = (df_categories['total'] / total_geral * 100).round(2)
        
        # Ordenar
        df_categories = df_categories.sort_values('total', ascending=False)
        
        # Top 10
        top_10 = df_categories.head(10).copy()
        
        logger.info(f"Análise de categorias: {len(df_categories)} categorias identificadas")
        
        return {
            'categories': df_categories,
            'top_10': top_10
        }
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def coverage_analysis(_self, df: pd.DataFrame) -> Dict:
        """
        Análise de cobertura territorial
        
        Args:
            df: DataFrame CISARP
        
        Returns:
            Dict com análise de cobertura
        """
        if len(df) == 0:
            return {
                'municipios_total': 0,
                'cobertura_por_municipio': pd.DataFrame(),
                'densidade_media': 0,
                'municipios_alta_densidade': 0
            }
        
        col_municipio = data_processor.identify_municipality_column(df)
        if not col_municipio:
            return {
                'municipios_total': 0,
                'cobertura_por_municipio': pd.DataFrame(),
                'densidade_media': 0,
                'municipios_alta_densidade': 0
            }
        
        # Agregação por município
        cobertura = df.groupby(col_municipio).agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        
        # Calcular densidade para cada município
        cobertura['densidade'] = cobertura.apply(
            lambda row: _self._calculate_density(row['POIS'], row['HECTARES_MAPEADOS']),
            axis=1
        )
        
        # Estatísticas
        densidade_media = cobertura['densidade'].mean()
        municipios_alta_densidade = len(cobertura[cobertura['densidade'] > densidade_media])
        
        return {
            'municipios_total': len(cobertura),
            'cobertura_por_municipio': cobertura,
            'densidade_media': densidade_media,
            'municipios_alta_densidade': municipios_alta_densidade
        }
    
    def get_summary(self, df: pd.DataFrame) -> str:
        """
        Resumo textual da performance
        
        Args:
            df: DataFrame CISARP
        
        Returns:
            String com resumo executivo
        """
        kpis = self.calculate_kpis(df)
        temporal = self.temporal_evolution(df)
        
        summary = f"""
        **Resumo de Performance CISARP**
        
        - **{kpis['total_registros']}** intervenções realizadas
        - **{kpis['pois_total']:,}** POIs identificados
        - **{kpis['hectares_total']:,.0f}** hectares mapeados
        - **{kpis['municipios_unicos']}** municípios atendidos
        - **{kpis['densidade']:.2f}** POIs/hectare (densidade)
        - **{temporal['dias_operacao']}** dias de operação
        - **Tendência:** {temporal['trend']}
        """
        
        return summary.strip()

# Instância global
performance_analyzer = PerformanceAnalyzer()
