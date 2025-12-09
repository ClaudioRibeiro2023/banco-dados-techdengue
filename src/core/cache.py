"""
Cache Manager com Redis para API TechDengue.
Implementa cache distribuído com TTL configurável.
"""

import json
import hashlib
import os
from functools import wraps
from typing import Any, Callable, Optional
from datetime import timedelta

from loguru import logger

# Redis é opcional - fallback para cache em memória
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis não disponível, usando cache em memória")


class CacheManager:
    """Gerenciador de cache com suporte a Redis e fallback em memória."""
    
    def __init__(self, redis_url: Optional[str] = None, default_ttl: int = 3600):
        """
        Inicializa o cache manager.
        
        Args:
            redis_url: URL de conexão Redis (redis://host:port/db)
            default_ttl: TTL padrão em segundos (default: 1 hora)
        """
        self.default_ttl = default_ttl
        self._redis_client: Optional[redis.Redis] = None
        self._memory_cache: dict[str, tuple[Any, float]] = {}
        self._stats = {"hits": 0, "misses": 0}
        
        redis_url = redis_url or os.getenv("REDIS_URL")
        
        if redis_url and REDIS_AVAILABLE:
            try:
                self._redis_client = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                # Testar conexão
                self._redis_client.ping()
                logger.info(f"Cache Redis conectado: {redis_url}")
            except Exception as e:
                logger.warning(f"Falha ao conectar Redis: {e}. Usando cache em memória.")
                self._redis_client = None
        else:
            logger.info("Cache em memória ativado (Redis não configurado)")
    
    @property
    def is_redis(self) -> bool:
        """Retorna True se está usando Redis."""
        return self._redis_client is not None
    
    @property
    def stats(self) -> dict:
        """Retorna estatísticas do cache."""
        total = self._stats["hits"] + self._stats["misses"]
        hit_rate = self._stats["hits"] / total if total > 0 else 0
        return {
            **self._stats,
            "hit_rate": round(hit_rate, 3),
            "backend": "redis" if self.is_redis else "memory",
        }
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Gera uma chave única baseada nos argumentos."""
        key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
        hash_suffix = hashlib.md5(key_data.encode()).hexdigest()[:12]
        return f"techdengue:{prefix}:{hash_suffix}"
    
    def get(self, key: str) -> Optional[Any]:
        """Obtém valor do cache."""
        try:
            if self.is_redis:
                value = self._redis_client.get(key)
                if value:
                    self._stats["hits"] += 1
                    return json.loads(value)
            else:
                import time
                if key in self._memory_cache:
                    value, expiry = self._memory_cache[key]
                    if time.time() < expiry:
                        self._stats["hits"] += 1
                        return value
                    else:
                        del self._memory_cache[key]
        except Exception as e:
            logger.debug(f"Cache get error: {e}")
        
        self._stats["misses"] += 1
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Define valor no cache com TTL."""
        ttl = ttl or self.default_ttl
        try:
            if self.is_redis:
                serialized = json.dumps(value, default=str)
                self._redis_client.setex(key, ttl, serialized)
            else:
                import time
                self._memory_cache[key] = (value, time.time() + ttl)
            return True
        except Exception as e:
            logger.debug(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Remove valor do cache."""
        try:
            if self.is_redis:
                self._redis_client.delete(key)
            else:
                self._memory_cache.pop(key, None)
            return True
        except Exception as e:
            logger.debug(f"Cache delete error: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Remove todas as chaves que correspondem ao padrão."""
        count = 0
        try:
            if self.is_redis:
                for key in self._redis_client.scan_iter(f"techdengue:{pattern}:*"):
                    self._redis_client.delete(key)
                    count += 1
            else:
                prefix = f"techdengue:{pattern}:"
                keys_to_delete = [k for k in self._memory_cache if k.startswith(prefix)]
                for key in keys_to_delete:
                    del self._memory_cache[key]
                    count += 1
        except Exception as e:
            logger.debug(f"Cache clear pattern error: {e}")
        return count
    
    def clear_all(self) -> bool:
        """Limpa todo o cache."""
        try:
            if self.is_redis:
                for key in self._redis_client.scan_iter("techdengue:*"):
                    self._redis_client.delete(key)
            else:
                self._memory_cache.clear()
            self._stats = {"hits": 0, "misses": 0}
            return True
        except Exception as e:
            logger.debug(f"Cache clear all error: {e}")
            return False


# Instância global do cache
_cache_instance: Optional[CacheManager] = None


def get_cache() -> CacheManager:
    """Retorna a instância global do cache."""
    global _cache_instance
    if _cache_instance is None:
        redis_url = os.getenv("REDIS_URL")
        ttl = int(os.getenv("CACHE_TTL_SECONDS", "3600"))
        _cache_instance = CacheManager(redis_url=redis_url, default_ttl=ttl)
    return _cache_instance


def cached(prefix: str, ttl: Optional[int] = None):
    """
    Decorator para cache de funções.
    
    Args:
        prefix: Prefixo para a chave do cache
        ttl: TTL em segundos (None = usar default)
    
    Exemplo:
        @cached("facts", ttl=300)
        def get_facts(limit: int, offset: int):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache()
            key = cache._generate_key(prefix, *args, **kwargs)
            
            # Tentar obter do cache
            cached_value = cache.get(key)
            if cached_value is not None:
                logger.debug(f"Cache HIT: {key}")
                return cached_value
            
            # Executar função e cachear resultado
            logger.debug(f"Cache MISS: {key}")
            result = func(*args, **kwargs)
            cache.set(key, result, ttl)
            return result
        
        return wrapper
    return decorator


def invalidate_cache(pattern: str) -> int:
    """Invalida cache por padrão."""
    return get_cache().clear_pattern(pattern)
