"""
Sincronizador de Dados
Sincroniza dados do servidor GIS com cache local
"""
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime
import json
import hashlib

import pandas as pd

from .config import Config
from .repository import TechDengueRepository
from .database import get_database

logger = logging.getLogger(__name__)


class SyncMetadata:
    """Metadados de sincronização"""
    
    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.metadata_file = cache_dir / "sync_metadata.json"
    
    def load(self) -> Dict[str, Any]:
        """Carrega metadados"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def save(self, metadata: Dict[str, Any]):
        """Salva metadados"""
        self.cache_dir.mkdir(exist_ok=True, parents=True)
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, default=str)
    
    def get_last_sync(self, table_name: str) -> Optional[datetime]:
        """Retorna data da última sincronização"""
        metadata = self.load()
        if table_name in metadata:
            timestamp = metadata[table_name].get('last_sync')
            if timestamp:
                return datetime.fromisoformat(timestamp)
        return None
    
    def update_sync(self, table_name: str, info: Dict[str, Any]):
        """Atualiza informações de sincronização"""
        metadata = self.load()
        metadata[table_name] = {
            'last_sync': datetime.now().isoformat(),
            **info
        }
        self.save(metadata)


class DataSynchronizer:
    """
    Sincronizador de dados do servidor GIS para cache local
    
    Features:
    - Sincronização incremental
    - Detecção de mudanças (hash MD5)
    - Cache em Parquet
    - Metadados de sincronização
    - Relatórios de diferenças
    """
    
    def __init__(self, config: Config = Config):
        """
        Inicializa sincronizador
        
        Args:
            config: Configuração do sistema
        """
        self.config = config
        self.repository = TechDengueRepository(get_database())
        self.cache_dir = config.PATHS.cache_dir
        self.metadata = SyncMetadata(self.cache_dir)
        
        logger.info("DataSynchronizer inicializado")
    
    def _calculate_hash(self, df: pd.DataFrame) -> str:
        """
        Calcula hash MD5 do DataFrame
        
        Args:
            df: DataFrame
            
        Returns:
            Hash MD5
        """
        # Converter para bytes e calcular hash
        data_bytes = pd.util.hash_pandas_object(df, index=False).values.tobytes()
        return hashlib.md5(data_bytes).hexdigest()
    
    def _save_to_cache(
        self,
        df: pd.DataFrame,
        table_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Salva DataFrame no cache
        
        Args:
            df: DataFrame para salvar
            table_name: Nome da tabela
            metadata: Metadados adicionais
        """
        cache_file = self.cache_dir / f"{table_name}.parquet"
        self.cache_dir.mkdir(exist_ok=True, parents=True)
        
        # Salvar Parquet
        df.to_parquet(cache_file, index=False)
        logger.info(f"✓ Cache salvo: {cache_file} ({len(df):,} linhas)")
        
        # Calcular hash
        data_hash = self._calculate_hash(df)
        
        # Atualizar metadados
        sync_info = {
            'row_count': len(df),
            'columns': list(df.columns),
            'hash_md5': data_hash,
            'file_path': str(cache_file),
            **(metadata or {})
        }
        
        self.metadata.update_sync(table_name, sync_info)
    
    def _load_from_cache(self, table_name: str) -> Optional[pd.DataFrame]:
        """
        Carrega DataFrame do cache
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            DataFrame ou None se não existir
        """
        cache_file = self.cache_dir / f"{table_name}.parquet"
        
        if cache_file.exists():
            logger.info(f"Carregando do cache: {cache_file}")
            return pd.read_parquet(cache_file)
        
        return None
    
    def sync_banco_techdengue(self, force: bool = False) -> Dict[str, Any]:
        """
        Sincroniza tabela banco_techdengue
        
        Args:
            force: Força sincronização mesmo se cache válido
            
        Returns:
            Dicionário com resultado da sincronização
        """
        table_name = 'banco_techdengue'
        logger.info(f"Sincronizando {table_name}...")
        
        # Verificar cache
        last_sync = self.metadata.get_last_sync(table_name)
        if not force and last_sync and self.config.CACHE_ENABLED:
            cache_age = (datetime.now() - last_sync).total_seconds()
            if cache_age < self.config.CACHE_TTL_SECONDS:
                logger.info(f"✓ Cache válido (idade: {cache_age:.0f}s)")
                cached_df = self._load_from_cache(table_name)
                if cached_df is not None:
                    return {
                        'status': 'cache_hit',
                        'row_count': len(cached_df),
                        'cache_age_seconds': cache_age
                    }
        
        # Buscar do servidor
        logger.info("Buscando dados do servidor...")
        df = self.repository.get_banco_techdengue_all()
        
        # Salvar no cache
        self._save_to_cache(df, table_name)
        
        return {
            'status': 'synced',
            'row_count': len(df),
            'columns': list(df.columns)
        }
    
    def sync_planilha_campo(self, force: bool = False) -> Dict[str, Any]:
        """
        Sincroniza tabela planilha_campo (POIs)
        
        Args:
            force: Força sincronização mesmo se cache válido
            
        Returns:
            Dicionário com resultado da sincronização
        """
        table_name = 'planilha_campo'
        logger.info(f"Sincronizando {table_name}...")
        
        # Verificar cache
        last_sync = self.metadata.get_last_sync(table_name)
        if not force and last_sync and self.config.CACHE_ENABLED:
            cache_age = (datetime.now() - last_sync).total_seconds()
            if cache_age < self.config.CACHE_TTL_SECONDS:
                logger.info(f"✓ Cache válido (idade: {cache_age:.0f}s)")
                cached_df = self._load_from_cache(table_name)
                if cached_df is not None:
                    return {
                        'status': 'cache_hit',
                        'row_count': len(cached_df),
                        'cache_age_seconds': cache_age
                    }
        
        # Buscar do servidor
        logger.info("Buscando dados do servidor...")
        df = self.repository.get_planilha_campo_all()
        
        # Salvar no cache
        self._save_to_cache(df, table_name)
        
        return {
            'status': 'synced',
            'row_count': len(df),
            'columns': list(df.columns)
        }
    
    def sync_all(self, force: bool = False) -> Dict[str, Dict[str, Any]]:
        """
        Sincroniza todas as tabelas
        
        Args:
            force: Força sincronização mesmo se cache válido
            
        Returns:
            Dicionário com resultados de cada tabela
        """
        logger.info("="*80)
        logger.info("SINCRONIZAÇÃO COMPLETA")
        logger.info("="*80)
        
        results = {}
        
        # Sincronizar banco_techdengue
        try:
            results['banco_techdengue'] = self.sync_banco_techdengue(force=force)
        except Exception as e:
            logger.error(f"Erro ao sincronizar banco_techdengue: {e}")
            results['banco_techdengue'] = {'status': 'error', 'error': str(e)}
        
        # Sincronizar planilha_campo
        try:
            results['planilha_campo'] = self.sync_planilha_campo(force=force)
        except Exception as e:
            logger.error(f"Erro ao sincronizar planilha_campo: {e}")
            results['planilha_campo'] = {'status': 'error', 'error': str(e)}
        
        logger.info("="*80)
        logger.info("SINCRONIZAÇÃO CONCLUÍDA")
        logger.info("="*80)
        
        return results
    
    def get_sync_status(self) -> Dict[str, Any]:
        """
        Retorna status da sincronização
        
        Returns:
            Dicionário com status de cada tabela
        """
        metadata = self.metadata.load()
        
        status = {}
        for table_name, info in metadata.items():
            last_sync = info.get('last_sync')
            if last_sync:
                last_sync_dt = datetime.fromisoformat(last_sync)
                age_seconds = (datetime.now() - last_sync_dt).total_seconds()
                
                status[table_name] = {
                    'last_sync': last_sync,
                    'age_seconds': age_seconds,
                    'age_human': self._format_age(age_seconds),
                    'row_count': info.get('row_count'),
                    'hash_md5': info.get('hash_md5'),
                    'is_fresh': age_seconds < self.config.CACHE_TTL_SECONDS
                }
        
        return status
    
    def _format_age(self, seconds: float) -> str:
        """Formata idade do cache em formato legível"""
        if seconds < 60:
            return f"{seconds:.0f}s"
        elif seconds < 3600:
            return f"{seconds/60:.0f}m"
        elif seconds < 86400:
            return f"{seconds/3600:.1f}h"
        else:
            return f"{seconds/86400:.1f}d"
    
    def compare_with_excel(self, excel_path: Path) -> Dict[str, Any]:
        """
        Compara dados do servidor com Excel local
        
        Args:
            excel_path: Caminho do arquivo Excel
            
        Returns:
            Dicionário com comparação
        """
        logger.info(f"Comparando servidor com Excel: {excel_path}")
        
        # Carregar do servidor (cache)
        df_servidor = self._load_from_cache('planilha_campo')
        if df_servidor is None:
            logger.warning("Cache não encontrado. Sincronizando...")
            self.sync_planilha_campo()
            df_servidor = self._load_from_cache('planilha_campo')
        
        # Carregar do Excel
        df_excel = pd.read_excel(excel_path, sheet_name='Atividades (com sub)')
        
        # Comparar
        comparison = {
            'servidor': {
                'total_registros': len(df_servidor),
                'total_pois': df_servidor['poi'].notna().sum() if 'poi' in df_servidor.columns else 0,
                'colunas': list(df_servidor.columns)
            },
            'excel': {
                'total_registros': len(df_excel),
                'total_pois': df_excel['POIS'].sum() if 'POIS' in df_excel.columns else 0,
                'colunas': list(df_excel.columns)
            },
            'diferenca': {
                'registros': len(df_servidor) - len(df_excel),
                'pois': (df_servidor['poi'].notna().sum() if 'poi' in df_servidor.columns else 0) - 
                        (df_excel['POIS'].sum() if 'POIS' in df_excel.columns else 0)
            }
        }
        
        return comparison
