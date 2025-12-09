"""
Sistema de Cache Inteligente
Baseado no SIVEPI com TTL e persistência em disco

Suporta:
- Cache em memória (rápido)
- Cache em disco (persistente)
- TTL configurável
- Invalidação automática
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Callable
from functools import wraps
import pickle
import hashlib
from pathlib import Path
from loguru import logger

from dashboard.config.settings import settings

class CacheManager:
    """Gerenciador de cache com TTL e persistência"""
    
    def __init__(
        self,
        cache_dir: Optional[Path] = None,
        ttl_minutes: Optional[int] = None
    ):
        self.cache_dir = cache_dir or settings.CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.ttl = timedelta(minutes=ttl_minutes or (settings.CACHE_TTL // 60))
        self.memory_cache = {}
        
        logger.info(f"CacheManager inicializado (TTL: {self.ttl})")
    
    def _generate_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Gera chave única para cache"""
        key_data = f"{func_name}_{str(args)}_{str(kwargs)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _is_expired(self, timestamp: datetime) -> bool:
        """Verifica se cache expirou"""
        return datetime.now() - timestamp > self.ttl
    
    def get(self, key: str) -> Optional[Any]:
        """
        Recupera do cache se válido
        
        Ordem:
        1. Tenta memória (rápido)
        2. Tenta disco (persistente)
        3. Retorna None se não encontrar ou expirado
        """
        # Memória primeiro
        if key in self.memory_cache:
            value, timestamp = self.memory_cache[key]
            if not self._is_expired(timestamp):
                logger.debug(f"Cache HIT (memória): {key}")
                return value
            else:
                del self.memory_cache[key]
        
        # Disco se não estiver em memória
        if settings.ENABLE_DISK_CACHE:
            cache_file = self.cache_dir / f"{key}.pkl"
            if cache_file.exists():
                try:
                    with open(cache_file, 'rb') as f:
                        value, timestamp = pickle.load(f)
                        if not self._is_expired(timestamp):
                            # Promove para memória
                            self.memory_cache[key] = (value, timestamp)
                            logger.debug(f"Cache HIT (disco): {key}")
                            return value
                        else:
                            cache_file.unlink()
                except Exception as e:
                    logger.warning(f"Erro ao ler cache do disco: {e}")
        
        logger.debug(f"Cache MISS: {key}")
        return None
    
    def set(self, key: str, value: Any):
        """
        Salva no cache (memória + disco)
        """
        timestamp = datetime.now()
        self.memory_cache[key] = (value, timestamp)
        
        # Persistir em disco se habilitado
        if settings.ENABLE_DISK_CACHE:
            try:
                cache_file = self.cache_dir / f"{key}.pkl"
                with open(cache_file, 'wb') as f:
                    pickle.dump((value, timestamp), f)
                logger.debug(f"Cache SET: {key}")
            except Exception as e:
                logger.warning(f"Erro ao salvar cache no disco: {e}")
    
    def invalidate(self, key: str):
        """Invalida cache específico"""
        if key in self.memory_cache:
            del self.memory_cache[key]
        
        cache_file = self.cache_dir / f"{key}.pkl"
        if cache_file.exists():
            cache_file.unlink()
        
        logger.info(f"Cache invalidado: {key}")
    
    def clear(self):
        """Limpa todo o cache"""
        self.memory_cache.clear()
        
        if settings.ENABLE_DISK_CACHE:
            for file in self.cache_dir.glob("*.pkl"):
                file.unlink()
        
        logger.info("Cache completamente limpo")
    
    def cached(self, ttl_minutes: Optional[int] = None):
        """
        Decorator para cache automático de funções
        
        Uso:
            @cache_manager.cached(ttl_minutes=10)
            def minha_funcao(param1, param2):
                # código pesado
                return resultado
        """
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Gera chave única
                key = self._generate_key(func.__name__, args, kwargs)
                
                # Tenta recuperar do cache
                cached_value = self.get(key)
                if cached_value is not None:
                    return cached_value
                
                # Executa função e cacheia
                result = func(*args, **kwargs)
                self.set(key, result)
                
                return result
            return wrapper
        return decorator
    
    def get_stats(self) -> dict:
        """Estatísticas do cache"""
        disk_files = list(self.cache_dir.glob("*.pkl")) if settings.ENABLE_DISK_CACHE else []
        disk_size = sum(f.stat().st_size for f in disk_files) / 1024 / 1024  # MB
        
        return {
            'memory_entries': len(self.memory_cache),
            'disk_files': len(disk_files),
            'disk_size_mb': disk_size,
            'ttl_minutes': self.ttl.total_seconds() / 60
        }

# Instância global
cache_manager = CacheManager()
