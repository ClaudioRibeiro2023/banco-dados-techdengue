"""
Repositório de Dados (Data Access Layer)
Camada de abstração para acesso aos dados do servidor GIS
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

import pandas as pd

from .database import DatabaseManager, get_database
from .models import BancoTechdengue, PlanilhaCampo, AtividadeAgregada
from loguru import logger


class TechDengueRepository:
    """
    Repositório para acesso aos dados TechDengue
    
    Implementa padrão Repository para abstrair acesso ao banco de dados
    """
    
    def __init__(self, db: Optional[DatabaseManager] = None):
        """
        Inicializa repositório
        
        Args:
            db: Instância do DatabaseManager (usa singleton se None)
        """
        self.db = db or get_database()
        logger.info("TechDengueRepository inicializado")
    
    # ========================================================================
    # BANCO_TECHDENGUE
    # ========================================================================
    
    def get_banco_techdengue_all(self, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Retorna todos os registros de banco_techdengue
        
        Args:
            limit: Limite de registros (None = todos)
            
        Returns:
            DataFrame com registros
        """
        query = """
        SELECT 
            id,
            nome,
            lat,
            long,
            ST_AsGeoJSON(geom) as geom_json,
            data_criacao,
            analista,
            id_sistema
        FROM banco_techdengue
        ORDER BY data_criacao DESC NULLS LAST
        """
        
        if limit:
            query += f" LIMIT {limit}"
        
        logger.info(f"Buscando registros de banco_techdengue (limit={limit})")
        return self.db.query_to_dataframe(query, parse_dates=['data_criacao'])
    
    def get_banco_techdengue_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Retorna registros de banco_techdengue por período
        
        Args:
            start_date: Data inicial
            end_date: Data final
            
        Returns:
            DataFrame com registros
        """
        query = """
        SELECT 
            id,
            nome,
            lat,
            long,
            ST_AsGeoJSON(geom) as geom_json,
            data_criacao,
            analista,
            id_sistema
        FROM banco_techdengue
        WHERE data_criacao BETWEEN %s AND %s
        ORDER BY data_criacao DESC
        """
        
        logger.info(f"Buscando registros entre {start_date} e {end_date}")
        return self.db.query_to_dataframe(
            query,
            params=(start_date, end_date),
            parse_dates=['data_criacao']
        )
    
    def get_banco_techdengue_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas de banco_techdengue
        
        Returns:
            Dicionário com estatísticas
        """
        query = """
        SELECT 
            COUNT(*) as total_registros,
            COUNT(DISTINCT analista) as total_analistas,
            MIN(data_criacao) as data_mais_antiga,
            MAX(data_criacao) as data_mais_recente,
            COUNT(CASE WHEN geom IS NOT NULL THEN 1 END) as registros_com_geometria,
            COUNT(CASE WHEN lat IS NOT NULL AND long IS NOT NULL THEN 1 END) as registros_com_coordenadas
        FROM banco_techdengue
        """
        
        logger.info("Calculando estatísticas de banco_techdengue")
        df = self.db.query_to_dataframe(query, parse_dates=['data_mais_antiga', 'data_mais_recente'])
        
        if len(df) > 0:
            return df.iloc[0].to_dict()
        return {}
    
    # ========================================================================
    # PLANILHA_CAMPO (POIs)
    # ========================================================================
    
    def get_planilha_campo_all(self, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Retorna todos os registros de planilha_campo (POIs)
        
        Args:
            limit: Limite de registros (None = todos)
            
        Returns:
            DataFrame com POIs
        """
        query = """
        SELECT 
            id,
            created_at,
            updated_at,
            id_atividade,
            id_sub_atividade,
            nome_sub_atividade,
            quadra,
            bairro,
            logradouro,
            poi,
            descricao,
            vol_estimado,
            pastilhas,
            granulado,
            data_visita,
            removido_solucionado,
            descaracterizado,
            tratado,
            morador_ausente,
            nao_autorizado,
            observacao,
            tratamento_via_drone,
            monitorado,
            lat,
            longi,
            foto
        FROM planilha_campo
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC NULLS LAST
        """
        
        if limit:
            query += f" LIMIT {limit}"
        
        logger.info(f"Buscando POIs de planilha_campo (limit={limit})")
        return self.db.query_to_dataframe(query, parse_dates=['created_at', 'updated_at', 'deleted_at'])
    
    def get_planilha_campo_by_atividade(self, id_atividade: str) -> pd.DataFrame:
        """
        Retorna POIs de uma atividade específica
        
        Args:
            id_atividade: ID da atividade
            
        Returns:
            DataFrame com POIs da atividade
        """
        query = """
        SELECT 
            id,
            id_atividade,
            poi,
            descricao,
            bairro,
            lat,
            longi,
            data_upload,
            categoria,
            tratamento,
            observacoes
        FROM planilha_campo
        WHERE id_atividade = %s
        ORDER BY data_upload DESC
        """
        
        logger.info(f"Buscando POIs da atividade {id_atividade}")
        return self.db.query_to_dataframe(
            query,
            params=(id_atividade,),
            parse_dates=['data_upload']
        )
    
    def get_planilha_campo_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas de planilha_campo
        
        Returns:
            Dicionário com estatísticas
        """
        query = """
        SELECT 
            COUNT(*) as total_pois,
            COUNT(DISTINCT id_atividade) as total_atividades,
            MIN(created_at) as data_mais_antiga,
            MAX(created_at) as data_mais_recente,
            COUNT(CASE WHEN lat IS NOT NULL AND longi IS NOT NULL THEN 1 END) as pois_com_coordenadas,
            COUNT(CASE WHEN tratado IS NOT NULL OR removido_solucionado IS NOT NULL THEN 1 END) as pois_com_tratamento
        FROM planilha_campo
        WHERE deleted_at IS NULL
        """
        
        logger.info("Calculando estatísticas de planilha_campo")
        df = self.db.query_to_dataframe(query, parse_dates=['data_mais_antiga', 'data_mais_recente'])
        
        if len(df) > 0:
            return df.iloc[0].to_dict()
        return {}
    
    def get_pois_por_categoria(self) -> pd.DataFrame:
        """
        Retorna contagem de POIs por categoria
        
        Returns:
            DataFrame com categoria e contagem
        """
        query = """
        SELECT 
            categoria,
            COUNT(*) as total_pois,
            COUNT(CASE WHEN tratamento IS NOT NULL THEN 1 END) as pois_tratados
        FROM planilha_campo
        WHERE categoria IS NOT NULL
        GROUP BY categoria
        ORDER BY total_pois DESC
        """
        
        logger.info("Agregando POIs por categoria")
        return self.db.query_to_dataframe(query)
    
    # ========================================================================
    # ANÁLISES AGREGADAS
    # ========================================================================
    
    def get_atividades_agregadas_por_municipio(self) -> pd.DataFrame:
        """
        Retorna atividades agregadas por município
        
        NOTA: Esta query assume que existe relação entre tabelas.
        Pode precisar de ajustes dependendo da estrutura real.
        
        Returns:
            DataFrame com dados agregados
        """
        # Esta é uma query exemplo - ajustar conforme estrutura real
        query = """
        SELECT 
            id_atividade,
            COUNT(*) as total_pois,
            COUNT(CASE WHEN tratamento IS NOT NULL THEN 1 END) as total_tratados,
            MIN(data_upload) as data_inicio,
            MAX(data_upload) as data_fim
        FROM planilha_campo
        WHERE id_atividade IS NOT NULL
        GROUP BY id_atividade
        ORDER BY total_pois DESC
        """
        
        logger.info("Agregando atividades")
        return self.db.query_to_dataframe(
            query,
            parse_dates=['data_inicio', 'data_fim']
        )
    
    def get_evolucao_temporal_pois(self, intervalo: str = 'month') -> pd.DataFrame:
        """
        Retorna evolução temporal de POIs
        
        Args:
            intervalo: 'day', 'week', 'month', 'year'
            
        Returns:
            DataFrame com série temporal
        """
        trunc_map = {
            'day': 'day',
            'week': 'week',
            'month': 'month',
            'year': 'year'
        }
        
        trunc = trunc_map.get(intervalo, 'month')
        
        query = f"""
        SELECT 
            DATE_TRUNC('{trunc}', data_upload) as periodo,
            COUNT(*) as total_pois,
            COUNT(DISTINCT id_atividade) as total_atividades,
            COUNT(CASE WHEN tratamento IS NOT NULL THEN 1 END) as pois_tratados
        FROM planilha_campo
        WHERE data_upload IS NOT NULL
        GROUP BY DATE_TRUNC('{trunc}', data_upload)
        ORDER BY periodo
        """
        
        logger.info(f"Calculando evolução temporal (intervalo={intervalo})")
        return self.db.query_to_dataframe(query, parse_dates=['periodo'])
    
    # ========================================================================
    # QUERIES GEOESPACIAIS
    # ========================================================================
    
    def get_pois_em_raio(
        self,
        lat: float,
        lon: float,
        raio_metros: float = 1000
    ) -> pd.DataFrame:
        """
        Retorna POIs dentro de um raio de um ponto
        
        Args:
            lat: Latitude do centro
            lon: Longitude do centro
            raio_metros: Raio em metros
            
        Returns:
            DataFrame com POIs no raio
        """
        query = """
        SELECT 
            id,
            poi,
            descricao,
            lat,
            longi,
            ST_Distance(
                ST_SetSRID(ST_MakePoint(longi, lat), 4326)::geography,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
            ) as distancia_metros
        FROM planilha_campo
        WHERE lat IS NOT NULL AND longi IS NOT NULL
            AND ST_DWithin(
                ST_SetSRID(ST_MakePoint(longi, lat), 4326)::geography,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                %s
            )
        ORDER BY distancia_metros
        """
        
        logger.info(f"Buscando POIs em raio de {raio_metros}m de ({lat}, {lon})")
        return self.db.query_to_dataframe(
            query,
            params=(lon, lat, lon, lat, raio_metros)
        )
    
    # ========================================================================
    # UTILIDADES
    # ========================================================================
    
    def get_table_info(self, table_name: str) -> Dict[str, Any]:
        """
        Retorna informações sobre uma tabela
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            Dicionário com informações
        """
        return self.db.get_table_info(table_name)
    
    def test_connection(self) -> bool:
        """
        Testa conexão com banco
        
        Returns:
            True se conexão OK
        """
        return self.db.test_connection()
