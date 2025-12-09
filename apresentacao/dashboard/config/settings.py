"""
Settings Centralizados com Pydantic
Baseado em arquitetura SIVEPI
"""

from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional

class Settings(BaseSettings):
    """Configurações globais do dashboard"""
    
    # App Info
    APP_NAME: str = "Dashboard CISARP - Análise de Impacto"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Dashboard enterprise-grade para análise CISARP"
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    DADOS_DIR: Path = BASE_DIR / "dados"
    CACHE_DIR: Path = DADOS_DIR / "cache"
    EXPORTS_DIR: Path = DADOS_DIR / "exports"
    LOGS_DIR: Path = DADOS_DIR / "logs"
    
    # Cache Settings
    CACHE_TTL: int = 300  # 5 minutos em segundos
    MAX_CACHE_SIZE: int = 500  # MB
    ENABLE_DISK_CACHE: bool = True
    
    # Performance
    ENABLE_LAZY_LOADING: bool = True
    MAX_WORKERS: int = 4
    
    # UI Settings
    PAGE_TITLE: str = "Dashboard CISARP"
    PAGE_ICON: str = "🦟"
    LAYOUT: str = "wide"
    INITIAL_SIDEBAR_STATE: str = "expanded"
    
    # Data Settings
    REQUIRED_COLUMNS_CISARP: list = [
        'CODIGO IBGE', 'DATA_MAP', 'POIS', 'HECTARES_MAPEADOS'
    ]
    
    # Database (Aero)
    USE_DB: bool = True
    DB_HOST: Optional[str] = None
    DB_PORT: int = 5432
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_SSLMODE: str = "require"
    
    # Database schema mapeado
    DB_MAIN_TABLE: str = "banco_techdengue"
    DB_CONTRACTOR_COLUMN: str = "contratante"
    DB_DATE_COLUMN: str = "data_criacao"
    DB_MUN_CODE_COLUMN: str = "cd_mun"
    DB_MUN_NAME_COLUMN: str = "nm_mun"
    
    # Candidatos para autodetecção
    DB_HECTARES_CANDIDATES: list = [
        "hectares_mapeados", "hectares", "area_mapeada_ha", "area_ha", "hectares_totais", "hect"
    ]
    DB_DEVOLUTIVAS_CANDIDATES: list = [
        "devolutivas", "qtd_devolutivas", "devolutiva", "retornos", "followup", "follow_up", "acoes_realizadas"
    ]
    
    # Overrides explícitos (se definidos, têm precedência sobre autodetecção)
    DB_HECTARES_COLUMN: Optional[str] = None
    DB_DEVOLUTIVAS_COLUMN: Optional[str] = None
    
    # Uso opcional de área territorial como proxy (desabilitado por padrão)
    ALLOW_TERRITORIAL_AREA_AS_HECTARES: bool = False
    DB_TERRITORIAL_AREA_COLUMN: str = "area_km2"
    
    # Filtros/Defaults para consultas
    AERO_CONTRACTOR_FILTER: str = "CISARP"
    DEFAULT_START_DATE: str = "2024-01-01"
    DEFAULT_END_DATE: str = "2025-12-31"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_ROTATION: str = "1 day"
    LOG_RETENTION: str = "7 days"
    
    # Debug
    DEBUG: bool = False
    PROFILING: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Criar diretórios se não existirem
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self.EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Instância global
settings = Settings()
