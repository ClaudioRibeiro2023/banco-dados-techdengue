"""
Benchmark Analyzer - Análise de Benchmarking e Posicionamento
Baseado em padrões SIVEPI

Responsável por:
- Ranking de contratantes
- Comparação de indicadores
- Análise de percentis
- Gap analysis
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from loguru import logger
import streamlit as st

from dashboard.config.settings import settings

class BenchmarkAnalyzer:
    """
    Análise de benchmarking e posicionamento competitivo
    """
    
    def __init__(self):
        logger.info("BenchmarkAnalyzer inicializado")
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def rank_contractors(
        _self,
        df: pd.DataFrame,
        contractor_name: str = 'CISARP',
        metric_col: Optional[str] = None
    ) -> Dict:
        """
        Ranking de contratantes. Por padrão, por número de atividades (contagem de linhas).
        Se metric_col for fornecido e existir no DF, ranqueia pela métrica agregada por contratante.
        
        Args:
            df: DataFrame com todas as atividades TechDengue
            contractor_name: Nome do contratante focal (CISARP)
            metric_col: Nome da coluna métrica (ex.: 'POIS')
        
        Returns:
            Dict com ranking completo
        """
        if len(df) == 0:
            return _self._empty_ranking()
        
        # Identificar coluna de contratante
        contratante_col = None
        for col in ['CONTRATANTE', 'Contratante', 'contratante']:
            if col in df.columns:
                contratante_col = col
                break
        
        if not contratante_col:
            logger.warning("Coluna de contratante não encontrada")
            return _self._empty_ranking()
        
        if metric_col and metric_col in df.columns:
            # Agregar pela métrica informada
            ranking = (
                df.groupby(contratante_col)[metric_col]
                  .sum()
                  .reset_index(name=metric_col)
                  .sort_values(metric_col, ascending=False)
            )
            value_col = metric_col
        else:
            # Contar atividades por contratante
            ranking = df.groupby(contratante_col).size().reset_index(name='atividades')
            ranking = ranking.sort_values('atividades', ascending=False)
            value_col = 'atividades'
        ranking['posicao'] = range(1, len(ranking) + 1)
        
        # Calcular percentil
        ranking['percentil'] = ((ranking['posicao'] / len(ranking)) * 100).round(1)
        
        # Encontrar posição do CISARP
        cisarp_data = ranking[ranking[contratante_col].str.contains(contractor_name, case=False, na=False)]
        
        if len(cisarp_data) == 0:
            logger.warning(f"Contratante '{contractor_name}' não encontrado")
            cisarp_position = None
            cisarp_percentile = None
            cisarp_value = None
        else:
            cisarp_position = int(cisarp_data['posicao'].iloc[0])
            cisarp_percentile = float(cisarp_data['percentil'].iloc[0])
            cisarp_value = float(cisarp_data[value_col].iloc[0])
        
        # Top 10 para exibição
        top_10 = ranking.head(10).copy()
        
        # Calcular gaps
        if cisarp_position:
            top_vals = ranking[value_col].tolist()
            gap_to_top = cisarp_value - top_vals[0] if cisarp_value is not None else None
            gap_to_top3 = cisarp_value - top_vals[2] if (cisarp_value is not None and len(top_vals) >= 3) else None
            gap_to_top5 = cisarp_value - top_vals[4] if (cisarp_value is not None and len(top_vals) >= 5) else None
        else:
            gap_to_top = None
            gap_to_top3 = None
            gap_to_top5 = None
        
        return {
            'ranking_completo': ranking,
            'top_10': top_10,
            'total_contractors': len(ranking),
            'cisarp_position': cisarp_position,
            'cisarp_percentile': cisarp_percentile,
            'cisarp_metric': cisarp_value,
            'metric_col': value_col,
            'gaps': {
                'to_top': gap_to_top,
                'to_top3': gap_to_top3,
                'to_top5': gap_to_top5
            }
        }
    
    def _empty_ranking(self) -> Dict:
        """Retorna ranking vazio"""
        return {
            'ranking_completo': pd.DataFrame(),
            'top_10': pd.DataFrame(),
            'total_contractors': 0,
            'cisarp_position': None,
            'cisarp_percentile': None,
            'cisarp_activities': None,
            'gaps': {
                'to_top': None,
                'to_top3': None,
                'to_top5': None
            }
        }
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def compare_metrics(
        _self,
        df: pd.DataFrame,
        contractor: str,
        comparison_group: Optional[List[str]] = None
    ) -> Dict:
        """
        Compara métricas entre contratante focal e grupo de comparação
        
        Args:
            df: DataFrame completo
            contractor: Nome do contratante focal (CISARP)
            comparison_group: Lista de contratantes para comparar (se None, usa Top 3)
        
        Returns:
            Dict com comparações
        """
        if len(df) == 0:
            return _self._empty_comparison()
        
        # Identificar coluna de contratante
        contratante_col = None
        for col in ['CONTRATANTE', 'Contratante', 'contratante']:
            if col in df.columns:
                contratante_col = col
                break
        
        if not contratante_col:
            return _self._empty_comparison()
        
        # Se comparison_group não fornecido, usar Top 3
        if comparison_group is None:
            top_3 = df.groupby(contratante_col).size().nlargest(3).index.tolist()
            comparison_group = top_3
        
        # Dados do contratante focal
        contractor_data = df[df[contratante_col].str.contains(contractor, case=False, na=False)]
        
        # Dados do grupo de comparação
        group_data = df[df[contratante_col].isin(comparison_group)]
        
        # Calcular métricas
        metrics = {}
        
        for col in ['POIS', 'HECTARES_MAPEADOS', 'DEVOLUTIVAS']:
            if col in df.columns:
                contractor_mean = contractor_data[col].mean() if len(contractor_data) > 0 else 0
                group_mean = group_data[col].mean() if len(group_data) > 0 else 0
                
                diff_pct = _self._calc_diff_pct(contractor_mean, group_mean)
                
                metrics[col] = {
                    'contractor_mean': float(contractor_mean),
                    'contractor_total': float(contractor_data[col].sum()) if len(contractor_data) > 0 else 0,
                    'group_mean': float(group_mean),
                    'group_total': float(group_data[col].sum()) if len(group_data) > 0 else 0,
                    'difference_pct': float(diff_pct),
                    'comparison': 'superior' if diff_pct > 0 else 'inferior' if diff_pct < 0 else 'igual'
                }
        
        # Densidade (POIs/hectare)
        if 'POIS' in df.columns and 'HECTARES_MAPEADOS' in df.columns:
            contractor_density = (
                contractor_data['POIS'].sum() / contractor_data['HECTARES_MAPEADOS'].sum()
                if len(contractor_data) > 0 and contractor_data['HECTARES_MAPEADOS'].sum() > 0
                else 0
            )
            group_density = (
                group_data['POIS'].sum() / group_data['HECTARES_MAPEADOS'].sum()
                if len(group_data) > 0 and group_data['HECTARES_MAPEADOS'].sum() > 0
                else 0
            )
            
            metrics['DENSIDADE'] = {
                'contractor_mean': float(contractor_density),
                'group_mean': float(group_density),
                'difference_pct': float(_self._calc_diff_pct(contractor_density, group_density)),
                'comparison': 'superior' if contractor_density > group_density else 'inferior' if contractor_density < group_density else 'igual'
            }
        
        return {
            'metrics': metrics,
            'contractor_name': contractor,
            'comparison_group': comparison_group,
            'contractor_n': len(contractor_data),
            'group_n': len(group_data)
        }
    
    def _calc_diff_pct(self, value: float, baseline: float) -> float:
        """Calcula diferença percentual"""
        if baseline == 0:
            return 0.0
        return ((value - baseline) / baseline) * 100
    
    def _empty_comparison(self) -> Dict:
        """Retorna comparação vazia"""
        return {
            'metrics': {},
            'contractor_name': None,
            'comparison_group': [],
            'contractor_n': 0,
            'group_n': 0
        }
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def percentile_analysis(_self, df: pd.DataFrame, contractor: str) -> Dict:
        """
        Análise de percentis para todas as métricas
        
        Args:
            df: DataFrame completo
            contractor: Nome do contratante focal
        
        Returns:
            Dict com percentis
        """
        if len(df) == 0:
            return {}
        
        # Identificar coluna de contratante
        contratante_col = None
        for col in ['CONTRATANTE', 'Contratante', 'contratante']:
            if col in df.columns:
                contratante_col = col
                break
        
        if not contratante_col:
            return {}
        
        # Agregar métricas por contratante
        agg_metrics = df.groupby(contratante_col).agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        
        # Calcular densidade
        agg_metrics['DENSIDADE'] = agg_metrics['POIS'] / agg_metrics['HECTARES_MAPEADOS'].replace(0, np.nan)
        
        # Dados do CISARP
        cisarp_data = agg_metrics[agg_metrics[contratante_col].str.contains(contractor, case=False, na=False)]
        
        if len(cisarp_data) == 0:
            return {}
        
        percentiles = {}
        
        for metric in ['POIS', 'HECTARES_MAPEADOS', 'DENSIDADE']:
            if metric not in agg_metrics.columns:
                continue
            
            cisarp_value = cisarp_data[metric].iloc[0]
            
            # Calcular percentil
            percentile = (agg_metrics[metric] < cisarp_value).sum() / len(agg_metrics) * 100
            
            percentiles[metric] = {
                'value': float(cisarp_value),
                'percentile': float(percentile),
                'rank': int((agg_metrics[metric] >= cisarp_value).sum()),
                'total': len(agg_metrics)
            }
        
        return percentiles
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def identify_peers(_self, df: pd.DataFrame, contractor: str, n_peers: int = 5) -> Dict:
        """
        Identifica contratantes semelhantes (peers)
        
        Args:
            df: DataFrame completo
            contractor: Nome do contratante focal
            n_peers: Número de peers a identificar
        
        Returns:
            Dict com peers identificados
        """
        if len(df) == 0:
            return {'peers': pd.DataFrame()}
        
        # Identificar coluna de contratante
        contratante_col = None
        for col in ['CONTRATANTE', 'Contratante', 'contratante']:
            if col in df.columns:
                contratante_col = col
                break
        
        if not contratante_col:
            return {'peers': pd.DataFrame()}
        
        # Agregar por contratante
        agg = df.groupby(contratante_col).agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        
        agg['DENSIDADE'] = agg['POIS'] / agg['HECTARES_MAPEADOS'].replace(0, np.nan)
        agg['N_ATIVIDADES'] = df.groupby(contratante_col).size().values
        
        # Dados do CISARP
        cisarp_data = agg[agg[contratante_col].str.contains(contractor, case=False, na=False)]
        
        if len(cisarp_data) == 0:
            return {'peers': pd.DataFrame()}
        
        # Normalizar métricas para calcular distância
        from sklearn.preprocessing import StandardScaler
        
        metrics_cols = ['POIS', 'HECTARES_MAPEADOS', 'DENSIDADE', 'N_ATIVIDADES']
        metrics_cols = [c for c in metrics_cols if c in agg.columns]
        
        scaler = StandardScaler()
        agg_scaled = agg.copy()
        agg_scaled[metrics_cols] = scaler.fit_transform(agg[metrics_cols].fillna(0))
        
        # Calcular distância euclidiana do CISARP para todos
        cisarp_scaled = agg_scaled[agg_scaled[contratante_col].str.contains(contractor, case=False, na=False)][metrics_cols].values[0]
        
        agg_scaled['distance'] = agg_scaled[metrics_cols].apply(
            lambda row: np.sqrt(((row.values - cisarp_scaled) ** 2).sum()),
            axis=1
        )
        
        # Remover o próprio CISARP
        peers = agg_scaled[~agg_scaled[contratante_col].str.contains(contractor, case=False, na=False)]
        
        # Ordenar por proximidade
        peers = peers.sort_values('distance').head(n_peers)
        
        # Adicionar métricas originais
        peers = peers.merge(
            agg[[contratante_col, 'POIS', 'HECTARES_MAPEADOS', 'DENSIDADE', 'N_ATIVIDADES']],
            on=contratante_col
        )
        
        return {
            'peers': peers[[contratante_col, 'N_ATIVIDADES', 'POIS', 'HECTARES_MAPEADOS', 'DENSIDADE', 'distance']],
            'cisarp_metrics': cisarp_data[['POIS', 'HECTARES_MAPEADOS', 'DENSIDADE', 'N_ATIVIDADES']].to_dict('records')[0]
        }
    
    def get_summary(self, ranking_results: Dict, comparison_results: Dict) -> str:
        """
        Resumo textual de benchmarking
        
        Args:
            ranking_results: Resultados do ranking
            comparison_results: Resultados da comparação
        
        Returns:
            String com resumo
        """
        pos = ranking_results.get('cisarp_position', 'N/A')
        total = ranking_results.get('total_contractors', 0)
        pct = ranking_results.get('cisarp_percentile', 0)
        
        summary = f"""
        **Resumo de Benchmarking**
        
        - **Posição:** {pos}º de {total} contratantes
        - **Percentil:** Top {pct:.1f}%
        - **Gap para Top 3:** {abs(ranking_results['gaps']['to_top3'])} atividades
        """
        
        if comparison_results.get('metrics'):
            summary += f"\n\n**Comparação com Top 3:**"
            for metric, data in comparison_results['metrics'].items():
                comp = data['comparison']
                icon = '✅' if comp == 'superior' else '⚠️' if comp == 'inferior' else '➡️'
                summary += f"\n- {metric}: {icon} {comp} ({data['difference_pct']:+.1f}%)"
        
        return summary.strip()

# Instância global
benchmark_analyzer = BenchmarkAnalyzer()
