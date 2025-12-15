"""
Rate Limiter para API TechDengue.
Implementa throttling por IP e API Key com tiers diferentes.
"""

import os
from typing import Optional

from fastapi import Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from loguru import logger


try:
    import redis
    _REDIS_AVAILABLE = True
except ImportError:
    redis = None
    _REDIS_AVAILABLE = False


def get_api_key_or_ip(request: Request) -> str:
    """
    Extrai identificador para rate limiting.
    Prioriza API Key, fallback para IP.
    """
    # Verificar API Key no header
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return f"key:{api_key[:16]}"  # Usar prefixo da chave
    
    # Fallback para IP
    return get_remote_address(request)


# Configuração do limiter
def _mask_redis_url(url: str) -> str:
    if not url:
        return url
    if "@" not in url:
        return url
    prefix, host_part = url.rsplit("@", 1)
    if "://" not in prefix:
        return url
    scheme, creds = prefix.split("://", 1)
    if ":" in creds:
        user, _ = creds.split(":", 1)
        creds = f"{user}:***"
    else:
        creds = "***"
    return f"{scheme}://{creds}@{host_part}"


def _get_storage_uri() -> str:
    """Determina o storage URI para o rate limiter."""
    redis_url = (os.getenv("REDIS_URL", "") or "").strip()
    
    # Em ambiente de teste ou dev sem Redis, usar memória
    if not redis_url or os.getenv("TESTING", "").lower() == "true":
        return "memory://"
    
    # Verificar se é URL Upstash válida
    if redis_url.startswith("redis://") or redis_url.startswith("rediss://"):
        if not _REDIS_AVAILABLE:
            return "memory://"
        try:
            client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=0.5,
                socket_timeout=0.5,
            )
            client.ping()
            return redis_url
        except Exception as e:
            logger.warning(
                f"Redis indisponível para rate limiter ({_mask_redis_url(redis_url)}), usando memória: {e}"
            )
            return "memory://"
    
    return "memory://"


try:
    limiter = Limiter(
        key_func=get_api_key_or_ip,
        default_limits=["60/minute"],  # Tier Free
        storage_uri=_get_storage_uri(),
        strategy="fixed-window",
    )
except Exception as e:
    # Fallback para memória se Redis falhar
    logger.warning(f"Redis não disponível para rate limiter, usando memória: {e}")
    limiter = Limiter(
        key_func=get_api_key_or_ip,
        default_limits=["60/minute"],
        storage_uri="memory://",
        strategy="fixed-window",
    )


# Rate limits por tier
RATE_LIMITS = {
    "free": {
        "per_minute": 60,
        "per_day": 1000,
        "description": "Tier gratuito para testes",
    },
    "standard": {
        "per_minute": 300,
        "per_day": 10000,
        "description": "Aplicações internas",
    },
    "premium": {
        "per_minute": 1000,
        "per_day": 100000,
        "description": "Sistemas de produção",
    },
    "unlimited": {
        "per_minute": 10000,
        "per_day": 1000000,
        "description": "Uso interno sem limites",
    },
}


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Handler para quando o rate limit é excedido."""
    logger.warning(f"Rate limit exceeded: {get_api_key_or_ip(request)}")
    
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Muitas requisições. Aguarde antes de tentar novamente.",
            "retry_after": exc.detail.split()[-1] if exc.detail else "60 seconds",
            "tier": "free",
            "upgrade_info": "Para limites maiores, solicite uma API Key em /docs",
        },
        headers={
            "Retry-After": "60",
            "X-RateLimit-Limit": "60",
        },
    )


def get_rate_limit_for_tier(tier: str) -> str:
    """Retorna o rate limit formatado para o slowapi."""
    limits = RATE_LIMITS.get(tier, RATE_LIMITS["free"])
    return f"{limits['per_minute']}/minute"


# Decorators pré-configurados para diferentes endpoints
def limit_free(func):
    """Rate limit para tier free (60/min)."""
    return limiter.limit("60/minute")(func)


def limit_standard(func):
    """Rate limit para tier standard (300/min)."""
    return limiter.limit("300/minute")(func)


def limit_heavy(func):
    """Rate limit para endpoints pesados (10/min)."""
    return limiter.limit("10/minute")(func)


def limit_export(func):
    """Rate limit para exports (5/min)."""
    return limiter.limit("5/minute")(func)
