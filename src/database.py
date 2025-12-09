"""
Gerenciador de Conexão com Banco de Dados
Implementação profissional com pool de conexões, retry logic e logging
"""
from typing import Optional, List, Dict, Any
from contextlib import contextmanager
import time

import psycopg2
from psycopg2 import pool, extras
from psycopg2.extensions import connection as Connection
import pandas as pd

from .config import Config, DatabaseConfig
from loguru import logger


class DatabaseConnectionError(Exception):
    """Erro de conexão com banco de dados"""
    pass


class DatabaseQueryError(Exception):
    """Erro ao executar query"""
    pass


class DatabaseManager:
    """
    Gerenciador de conexões com PostgreSQL/PostGIS
    
    Features:
    - Pool de conexões
    - Retry automático
    - Logging detalhado
    - Context manager para transações
    - Conversão automática para pandas
    """
    
    def __init__(self, config: Config = Config, db_config: Optional[DatabaseConfig] = None):
        """
        Inicializa gerenciador de banco de dados
        
        Args:
            config: Configuração do sistema
        """
        self.config = config
        self.db_config: DatabaseConfig = db_config or config.GIS_DB
        self._pool: Optional[pool.SimpleConnectionPool] = None
        self._connection_attempts = 0
        
        logger.info(f"Inicializando DatabaseManager (versão {config.VERSION})")
    
    def _create_pool(self) -> pool.SimpleConnectionPool:
        """Cria pool de conexões"""
        try:
            logger.info(f"Criando pool de conexões para {self.db_config.host}")
            
            connection_pool = pool.SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                host=self.db_config.host,
                port=self.db_config.port,
                database=self.db_config.database,
                user=self.db_config.username,
                password=self.db_config.password,
                sslmode=self.db_config.ssl_mode,
                connect_timeout=self.config.DB_CONNECTION_TIMEOUT
            )
            
            logger.info("✓ Pool de conexões criado com sucesso")
            return connection_pool
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar pool de conexões: {e}")
            raise DatabaseConnectionError(f"Falha ao conectar ao banco: {e}")
    
    @property
    def pool(self) -> pool.SimpleConnectionPool:
        """Retorna pool de conexões (lazy loading)"""
        if self._pool is None:
            self._pool = self._create_pool()
        return self._pool
    
    @contextmanager
    def get_connection(self):
        """
        Context manager para obter conexão do pool
        
        Uso:
            with db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM table")
        """
        conn = None
        try:
            conn = self.pool.getconn()
            yield conn
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Erro na conexão: {e}")
            raise
        finally:
            if conn:
                self.pool.putconn(conn)
    
    def execute_query(
        self,
        query: str,
        params: Optional[tuple] = None,
        fetch: bool = True
    ) -> Optional[List[tuple]]:
        """
        Executa query SQL com retry automático
        
        Args:
            query: Query SQL
            params: Parâmetros da query
            fetch: Se deve fazer fetch dos resultados
            
        Returns:
            Lista de tuplas com resultados (se fetch=True)
        """
        for attempt in range(self.config.SYNC_MAX_RETRIES):
            try:
                with self.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute(query, params)
                        
                        if fetch:
                            results = cursor.fetchall()
                            logger.debug(f"Query retornou {len(results)} linhas")
                            return results
                        else:
                            logger.debug("Query executada (sem fetch)")
                            return None
                            
            except Exception as e:
                logger.warning(
                    f"Tentativa {attempt + 1}/{self.config.SYNC_MAX_RETRIES} falhou: {e}"
                )
                
                if attempt < self.config.SYNC_MAX_RETRIES - 1:
                    time.sleep(self.config.SYNC_RETRY_DELAY)
                else:
                    raise DatabaseQueryError(f"Falha após {self.config.SYNC_MAX_RETRIES} tentativas: {e}")
    
    def query_to_dataframe(
        self,
        query: str,
        params: Optional[tuple] = None,
        parse_dates: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Executa query e retorna DataFrame pandas
        
        Args:
            query: Query SQL
            params: Parâmetros da query
            parse_dates: Colunas para parsear como datas
            
        Returns:
            DataFrame com resultados
        """
        try:
            logger.info("Executando query e convertendo para DataFrame...")
            
            with self.get_connection() as conn:
                df = pd.read_sql_query(
                    query,
                    conn,
                    params=params,
                    parse_dates=parse_dates
                )
            
            logger.info(f"✓ DataFrame criado: {len(df):,} linhas × {len(df.columns)} colunas")
            return df
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar DataFrame: {e}")
            raise DatabaseQueryError(f"Falha ao executar query: {e}")
    
    def get_table_info(self, table_name: str, schema: str = 'public') -> Dict[str, Any]:
        """
        Obtém informações sobre uma tabela
        
        Args:
            table_name: Nome da tabela
            schema: Schema da tabela
            
        Returns:
            Dicionário com informações da tabela
        """
        query = """
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = %s AND table_name = %s
        ORDER BY ordinal_position
        """
        
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=extras.RealDictCursor) as cursor:
                cursor.execute(query, (schema, table_name))
                columns = cursor.fetchall()
        
        # Contar registros
        count_query = f"SELECT COUNT(*) FROM {schema}.{table_name}"
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(count_query)
                row_count = cursor.fetchone()[0]
        
        return {
            'table_name': table_name,
            'schema': schema,
            'row_count': row_count,
            'columns': columns
        }
    
    def test_connection(self) -> bool:
        """
        Testa conexão com banco de dados
        
        Returns:
            True se conexão bem-sucedida
        """
        try:
            logger.info("Testando conexão com banco de dados...")
            
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT version()")
                    version = cursor.fetchone()[0]
                    logger.info(f"✓ Conexão bem-sucedida: {version}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Falha no teste de conexão: {e}")
            return False
    
    def close(self):
        """Fecha pool de conexões"""
        if self._pool:
            logger.info("Fechando pool de conexões...")
            self._pool.closeall()
            self._pool = None
            logger.info("✓ Pool fechado")
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
    
    def __del__(self):
        """Destructor"""
        self.close()


# Instância global (singleton pattern)
_db_instance: Optional[DatabaseManager] = None


def get_database() -> DatabaseManager:
    """
    Retorna instância global do DatabaseManager (singleton)
    
    Returns:
        Instância do DatabaseManager
    """
    global _db_instance
    
    if _db_instance is None:
        _db_instance = DatabaseManager()
    
    return _db_instance


# Instância global para o Warehouse (singleton separado)
_warehouse_db_instance: Optional[DatabaseManager] = None


def get_warehouse_database() -> DatabaseManager:
    """
    Retorna instância global do DatabaseManager apontando para o Warehouse
    
    Returns:
        Instância do DatabaseManager (warehouse)
    """
    global _warehouse_db_instance
    
    if _warehouse_db_instance is None:
        _warehouse_db_instance = DatabaseManager(db_config=Config.WAREHOUSE_DB)
    
    return _warehouse_db_instance
