"""
Processador de Dados Centralizado
Baseado no SIVEPI DataProcessor com cache e validação

Responsável por:
- Carregamento e validação de dados
- Cálculo de métricas
- Agregações e transformações
- Cache de resultados
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from functools import lru_cache
from loguru import logger
import hashlib
import streamlit as st

from dashboard.config.settings import settings

class DataProcessor:
    """
    Processador centralizado de dados com cache e validação robusta
    """
    
    def __init__(self):
        self.cache = {}
        self._setup_logger()
    
    def _setup_logger(self):
        """Configura logging estruturado"""
        logger.add(
            settings.LOGS_DIR / "data_processor_{time}.log",
            rotation=settings.LOG_ROTATION,
            retention=settings.LOG_RETENTION,
            level=settings.LOG_LEVEL
        )
        logger.info("DataProcessor inicializado")
    
    def _generate_cache_key(self, data: Any, operation: str) -> str:
        """Gera chave de cache baseada em hash"""
        data_str = str(data)[:1000]  # Limita tamanho
        hash_obj = hashlib.md5(f"{data_str}_{operation}".encode())
        return hash_obj.hexdigest()
    
    def validate_dataframe(
        self,
        df: pd.DataFrame,
        required_columns: List[str]
    ) -> Tuple[bool, Optional[str]]:
        """
        Valida DataFrame com colunas obrigatórias
        
        Returns:
            (is_valid, error_message)
        """
        if not isinstance(df, pd.DataFrame):
            return False, "Input não é um DataFrame"
        
        if len(df) == 0:
            return False, "DataFrame vazio"
        
        missing = set(required_columns) - set(df.columns)
        if missing:
            return False, f"Colunas faltando: {missing}"
        
        return True, None
    
    def safe_array(self, data: Any) -> List:
        """
        Converte para array seguro com validação
        Baseado no padrão SIVEPI Array.isArray()
        """
        if data is None:
            return []
        if isinstance(data, list):
            return data
        if isinstance(data, pd.Series):
            return data.tolist()
        if isinstance(data, np.ndarray):
            return data.tolist()
        if isinstance(data, (int, float, str)):
            return [data]
        return []
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def load_csv(_self, filepath: str, **kwargs) -> pd.DataFrame:
        """
        Carrega CSV com cache Streamlit
        """
        try:
            df = pd.read_csv(filepath, **kwargs)
            logger.info(f"CSV carregado: {filepath} ({len(df)} registros)")
            return df
        except Exception as e:
            logger.error(f"Erro ao carregar CSV {filepath}: {e}")
            return pd.DataFrame()
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def load_excel(_self, filepath: str, sheet_name: str = 0, **kwargs) -> pd.DataFrame:
        """
        Carrega Excel com cache Streamlit
        """
        try:
            df = pd.read_excel(filepath, sheet_name=sheet_name, **kwargs)
            logger.info(f"Excel carregado: {filepath} sheet={sheet_name} ({len(df)} registros)")
            return df
        except Exception as e:
            logger.error(f"Erro ao carregar Excel {filepath}: {e}")
            return pd.DataFrame()
    
    def calculate_metrics(
        self,
        df: pd.DataFrame,
        metrics: List[str]
    ) -> Dict[str, Dict[str, float]]:
        """
        Calcula múltiplas métricas de forma otimizada
        
        Args:
            df: DataFrame
            metrics: Lista de colunas para calcular métricas
        
        Returns:
            Dict com estatísticas para cada métrica
        """
        results = {}
        
        for metric in metrics:
            if metric not in df.columns:
                continue
            
            series = pd.to_numeric(df[metric], errors='coerce')
            
            results[metric] = {
                'sum': float(series.sum()),
                'mean': float(series.mean()),
                'median': float(series.median()),
                'std': float(series.std()),
                'min': float(series.min()),
                'max': float(series.max()),
                'count': int(series.count())
            }
        
        return results
    
    def aggregate_by(
        self,
        df: pd.DataFrame,
        group_by: str,
        agg_dict: Dict[str, str]
    ) -> pd.DataFrame:
        """
        Agregação otimizada com tratamento de erros
        
        Args:
            df: DataFrame
            group_by: Coluna para agrupar
            agg_dict: Dict com {coluna: função}
        
        Returns:
            DataFrame agregado
        """
        try:
            if group_by not in df.columns:
                logger.warning(f"Coluna de agrupamento '{group_by}' não encontrada")
                return pd.DataFrame()
            
            result = df.groupby(group_by).agg(agg_dict).reset_index()
            return result
        except Exception as e:
            logger.error(f"Erro na agregação: {e}")
            return pd.DataFrame()
    
    def filter_dataframe(
        self,
        df: pd.DataFrame,
        filters: Dict[str, Any]
    ) -> pd.DataFrame:
        """
        Filtra DataFrame baseado em múltiplos critérios
        
        Args:
            df: DataFrame
            filters: Dict com critérios de filtro
                    {coluna: valor} ou
                    {coluna: {'min': X, 'max': Y}} ou
                    {coluna: {'values': [A, B, C]}}
        
        Returns:
            DataFrame filtrado
        """
        result = df.copy()
        
        for col, condition in filters.items():
            if col not in result.columns:
                logger.warning(f"Coluna '{col}' não encontrada para filtro")
                continue
            
            if isinstance(condition, dict):
                if 'min' in condition:
                    result = result[result[col] >= condition['min']]
                if 'max' in condition:
                    result = result[result[col] <= condition['max']]
                if 'values' in condition:
                    result = result[result[col].isin(condition['values'])]
            else:
                result = result[result[col] == condition]
        
        return result
    
    def calculate_density(
        self,
        numerator_col: str,
        denominator_col: str,
        df: pd.DataFrame
    ) -> float:
        """
        Calcula densidade (ex: POIs/hectare)
        """
        try:
            total_num = df[numerator_col].sum()
            total_den = df[denominator_col].sum()
            
            if total_den == 0:
                return 0.0
            
            return total_num / total_den
        except Exception as e:
            logger.error(f"Erro ao calcular densidade: {e}")
            return 0.0
    
    def identify_municipality_column(self, df: pd.DataFrame) -> Optional[str]:
        """
        Identifica coluna de código de município
        """
        possible_names = [
            'CODIGO IBGE',
            'Código IBGE',
            'codigo_ibge',
            'CODMUN',
            'codmun',
            'Municipio',
            'municipio'
        ]
        
        for col in possible_names:
            if col in df.columns:
                return col
        
        return None
    
    def convert_dates(
        self,
        df: pd.DataFrame,
        date_columns: List[str]
    ) -> pd.DataFrame:
        """
        Converte colunas para datetime
        """
        result = df.copy()
        
        for col in date_columns:
            if col in result.columns:
                result[col] = pd.to_datetime(result[col], errors='coerce')
        
        return result
    
    def get_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Resumo executivo do DataFrame
        """
        return {
            'total_registros': len(df),
            'total_colunas': len(df.columns),
            'colunas': df.columns.tolist(),
            'tipos': df.dtypes.astype(str).to_dict(),
            'nulos': df.isnull().sum().to_dict(),
            'memoria_mb': df.memory_usage(deep=True).sum() / 1024 / 1024
        }

# Instância global
data_processor = DataProcessor()
