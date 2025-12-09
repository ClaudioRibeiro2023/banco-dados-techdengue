"""
Configurações do Sistema
Gerenciamento centralizado de configurações com validação
"""
import os
from pathlib import Path
from typing import Optional
from dataclasses import dataclass
import warnings
from dotenv import load_dotenv

# Carregar variáveis de ambiente de um arquivo .env na raiz do projeto (se existir)
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=False)


@dataclass
class DatabaseConfig:
    """Configuração do banco de dados PostgreSQL/PostGIS"""
    host: str
    port: int
    database: str
    username: str
    password: str
    ssl_mode: str = 'require'
    
    @property
    def connection_string(self) -> str:
        """Retorna string de conexão PostgreSQL"""
        return (
            f"postgresql://{self.username}:{self.password}@"
            f"{self.host}:{self.port}/{self.database}"
            f"?sslmode={self.ssl_mode}"
        )
    
    @property
    def sqlalchemy_url(self) -> str:
        """Retorna URL para SQLAlchemy"""
        return self.connection_string


@dataclass
class PathConfig:
    """Configuração de caminhos do projeto"""
    base_dir: Path
    data_dir: Path
    output_dir: Path
    cache_dir: Path
    logs_dir: Path
    
    @classmethod
    def from_base_dir(cls, base_dir: Path) -> 'PathConfig':
        """Cria configuração a partir do diretório base"""
        return cls(
            base_dir=base_dir,
            data_dir=base_dir / "base_dados",
            output_dir=base_dir / "dados_integrados",
            cache_dir=base_dir / "cache",
            logs_dir=base_dir / "logs"
        )
    
    def ensure_dirs(self):
        """Garante que todos os diretórios existem"""
        for dir_path in [self.output_dir, self.cache_dir, self.logs_dir]:
            dir_path.mkdir(exist_ok=True, parents=True)


class Config:
    """Configuração central do sistema"""
    
    # Versão
    VERSION = "1.0.0"
    
    # Banco de dados GIS (PostgreSQL/PostGIS)
    GIS_DB = DatabaseConfig(
        host=os.getenv('GIS_DB_HOST', 'localhost'),
        port=int(os.getenv('GIS_DB_PORT', '5432')),
        database=os.getenv('GIS_DB_NAME', 'postgres'),
        username=os.getenv('GIS_DB_USERNAME', 'postgres'),
        password=os.getenv('GIS_DB_PASSWORD', ''),
        ssl_mode=os.getenv('GIS_DB_SSL_MODE', 'require')
    )
    
    # Banco de dados secundário (Warehouse) para escrita
    WAREHOUSE_DB = DatabaseConfig(
        host=os.getenv('WAREHOUSE_DB_HOST', 'localhost'),
        port=int(os.getenv('WAREHOUSE_DB_PORT', '5432')),
        database=os.getenv('WAREHOUSE_DB_NAME', 'postgres'),
        username=os.getenv('WAREHOUSE_DB_USERNAME', 'postgres'),
        password=os.getenv('WAREHOUSE_DB_PASSWORD', ''),
        ssl_mode=os.getenv('WAREHOUSE_DB_SSL_MODE', 'prefer')
    )
    
    # Caminhos
    BASE_DIR = Path(__file__).parent.parent
    PATHS = PathConfig.from_base_dir(BASE_DIR)
    
    # Configurações de cache
    CACHE_ENABLED = True
    CACHE_TTL_SECONDS = 3600  # 1 hora
    
    # Configurações de sincronização
    SYNC_BATCH_SIZE = 1000
    SYNC_MAX_RETRIES = 3
    SYNC_RETRY_DELAY = 5  # segundos
    
    # Configurações de validação
    VALIDATION_ENABLED = True
    VALIDATION_STRICT_MODE = False  # Se True, falha em qualquer anomalia
    
    # Configurações de logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # CORS
    CORS_ALLOW_ORIGINS_RAW = os.getenv('CORS_ALLOW_ORIGINS', '*')
    
    # Sentry (Observabilidade)
    SENTRY_DSN = os.getenv('SENTRY_DSN', '')
    SENTRY_ENVIRONMENT = os.getenv('SENTRY_ENVIRONMENT', 'development')
    
    # APIs Externas
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    MAPBOX_API_KEY = os.getenv('MAPBOX_API_KEY', '')
    
    # Datasets remotos (opcionais)
    # Base HTTP(s) para os arquivos parquet (ex.: https://storage.example.com/dados_integrados)
    DATASETS_REMOTE_URL: str = os.getenv('DATASETS_REMOTE_URL', '')
    # Base S3 URI para os arquivos parquet (ex.: s3://meu-bucket/dados_integrados)
    DATASETS_S3_URI: str = os.getenv('DATASETS_S3_URI', '')
    
    # Timeouts
    DB_CONNECTION_TIMEOUT = 30  # segundos
    DB_QUERY_TIMEOUT = 300  # 5 minutos
    
    @classmethod
    def validate(cls):
        """Valida configurações"""
        errors = []
        
        # Validar conexão de banco
        if not cls.GIS_DB.host:
            errors.append("GIS_DB_HOST não configurado")
        
        if not cls.GIS_DB.username:
            errors.append("GIS_DB_USERNAME não configurado")
        
        if not cls.GIS_DB.password:
            warnings.warn("GIS_DB_PASSWORD não configurado ou vazio")
        
        if errors:
            raise ValueError(f"Erros de configuração: {', '.join(errors)}")
        
        # Criar diretórios
        cls.PATHS.ensure_dirs()
        
        return True
    
    @classmethod
    def get_cors_allow_origins(cls) -> list:
        raw = (cls.CORS_ALLOW_ORIGINS_RAW or '*').strip()
        if raw == '*':
            return ['*']
        parts = [p.strip() for p in raw.split(',') if p.strip()]
        return parts or ['*']
    
    @classmethod
    def get_env_template(cls) -> str:
        """Retorna template de arquivo .env"""
        return """
# Configurações do Banco de Dados GIS (PostgreSQL/PostGIS)
GIS_DB_HOST=localhost
GIS_DB_PORT=5432
GIS_DB_NAME=postgres
GIS_DB_USERNAME=postgres
GIS_DB_PASSWORD=
GIS_DB_SSL_MODE=require

# CORS (separados por vírgula ou * para liberar todos)
CORS_ALLOW_ORIGINS=*

# Configurações de Logging
LOG_LEVEL=INFO

# Configurações de Cache
CACHE_ENABLED=true
CACHE_TTL_SECONDS=3600

# (Opcional) Datasets remotos
# HTTP(s) base para os parquet (ex.: https://storage.example.com/dados_integrados)
# DATASETS_REMOTE_URL=
# S3 base para os parquet (ex.: s3://meu-bucket/dados_integrados)
# DATASETS_S3_URI=
""".strip()


# Validar configurações ao importar
try:
    Config.validate()
except Exception as e:
    warnings.warn(f"Erro ao validar configurações: {e}")
