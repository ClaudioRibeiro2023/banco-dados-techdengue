"""
Router de Administração.
Endpoints: /api/v1/cache/*, /api/v1/keys/*, /api/v1/audit/*
"""

from typing import Any, Optional

from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import JSONResponse

from src.core.cache import get_cache
from src.core.rate_limiter import limiter
from src.core.auth import (
    APIKeyInfo,
    APIKeyCreate,
    APIKeyResponse,
    Tier,
    get_api_key_optional,
    get_api_key_required,
    create_api_key,
    list_api_keys,
    revoke_api_key,
)
from src.core.audit import get_recent_logs, get_audit_stats

router = APIRouter(prefix="/api/v1", tags=["Admin"])


# ==================== Cache ====================


@router.get("/cache/stats", summary="Estatísticas do cache")
@limiter.limit("60/minute")
async def cache_stats(request: Request) -> Any:
    """Retorna estatísticas do sistema de cache."""
    cache = get_cache()
    return {"cache": cache.stats, "ttl_seconds": cache.default_ttl}


@router.post("/cache/clear", summary="Limpar cache")
@limiter.limit("5/minute")
async def cache_clear(
    request: Request,
    pattern: Optional[str] = Query(None, description="Padrão para limpar (ex: 'facts')"),
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Limpa o cache (requer API Key)."""
    cache = get_cache()
    if pattern:
        count = cache.clear_pattern(pattern)
        return {"cleared": count, "pattern": pattern}
    else:
        cache.clear_all()
        return {"cleared": "all"}


# ==================== API Keys ====================


@router.post("/keys", summary="Criar API Key", response_model=APIKeyResponse)
@limiter.limit("10/minute")
async def create_key(request: Request, data: APIKeyCreate) -> APIKeyResponse:
    """
    Cria uma nova API Key.

    **IMPORTANTE**: A chave completa só é exibida uma vez. Salve-a em local seguro.
    """
    return create_api_key(data)


@router.get("/keys", summary="Listar API Keys")
@limiter.limit("60/minute")
async def list_keys(
    request: Request,
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Lista API Keys (apenas para usuários autenticados)."""
    keys = list_api_keys(owner=api_key.owner if api_key.tier != Tier.ADMIN else None)
    return {
        "keys": [
            {
                "key_id": k.key_id,
                "name": k.name,
                "tier": k.tier.value,
                "owner": k.owner,
                "created_at": k.created_at.isoformat(),
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "is_active": k.is_active,
            }
            for k in keys
        ]
    }


@router.delete("/keys/{key_id}", summary="Revogar API Key")
@limiter.limit("10/minute")
async def delete_key(
    request: Request,
    key_id: str,
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Revoga uma API Key."""
    success = revoke_api_key(key_id)
    if success:
        return {"revoked": key_id}
    else:
        return JSONResponse(
            status_code=404,
            content={"error": "key_not_found", "message": f"API Key {key_id} não encontrada"},
        )


# ==================== Audit ====================


@router.get("/audit/logs", summary="Logs de auditoria")
@limiter.limit("30/minute")
async def audit_logs(
    request: Request,
    limit: int = Query(100, le=1000),
    path: Optional[str] = Query(None, description="Filtrar por path"),
    min_status: Optional[int] = Query(None, description="Status mínimo (ex: 400)"),
    api_key: APIKeyInfo = Depends(get_api_key_required),
) -> Any:
    """Retorna logs de auditoria recentes (requer API Key)."""
    logs = get_recent_logs(
        limit=limit,
        path_filter=path,
        api_key_id=api_key.key_id if api_key.tier != Tier.ADMIN else None,
        min_status=min_status,
    )
    return {"count": len(logs), "logs": [log.model_dump() for log in logs]}


@router.get("/audit/stats", summary="Estatísticas de uso")
@limiter.limit("60/minute")
async def audit_statistics(
    request: Request,
    api_key: Optional[APIKeyInfo] = Depends(get_api_key_optional),
) -> Any:
    """Retorna estatísticas de uso da API."""
    return get_audit_stats()
