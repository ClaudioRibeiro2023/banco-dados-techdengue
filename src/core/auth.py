"""
Sistema de Autenticação e API Keys para TechDengue.
Implementa autenticação por API Key com tiers de acesso.
"""

import os
import secrets
import hashlib
from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

from loguru import logger


class Tier(str, Enum):
    """Tiers de acesso à API."""
    FREE = "free"
    STANDARD = "standard"
    PREMIUM = "premium"
    ADMIN = "admin"


class APIKeyInfo(BaseModel):
    """Informações de uma API Key."""
    key_id: str = Field(..., description="ID público da chave")
    name: str = Field(..., description="Nome descritivo")
    tier: Tier = Field(default=Tier.FREE, description="Tier de acesso")
    owner: str = Field(..., description="Proprietário da chave")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used_at: Optional[datetime] = None
    is_active: bool = True
    scopes: list[str] = Field(default_factory=lambda: ["read:all"])
    rate_limit_override: Optional[int] = None  # Override do rate limit padrão


class APIKeyCreate(BaseModel):
    """Schema para criação de API Key."""
    name: str = Field(..., min_length=3, max_length=100)
    owner: str = Field(..., min_length=3, max_length=100)
    tier: Tier = Tier.FREE
    scopes: list[str] = Field(default_factory=lambda: ["read:all"])


class APIKeyResponse(BaseModel):
    """Resposta após criar API Key (única vez que a chave completa é exibida)."""
    key: str = Field(..., description="Chave completa (salve-a, não será exibida novamente)")
    key_id: str = Field(..., description="ID público da chave")
    name: str
    tier: Tier
    created_at: datetime


# Armazenamento em memória (em produção, usar banco de dados)
# Formato: hash_da_chave -> APIKeyInfo
_api_keys_store: dict[str, APIKeyInfo] = {}

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def _hash_key(key: str) -> str:
    """Gera hash seguro da API Key."""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_api_key(prefix: str = "tk") -> tuple[str, str]:
    """
    Gera uma nova API Key.
    Retorna (chave_completa, key_id).
    """
    # Formato: tk_live_<32 chars random>
    random_part = secrets.token_urlsafe(24)
    key = f"{prefix}_live_{random_part}"
    key_id = f"{prefix}_{random_part[:8]}"
    return key, key_id


def create_api_key(data: APIKeyCreate) -> APIKeyResponse:
    """Cria uma nova API Key."""
    key, key_id = generate_api_key()
    key_hash = _hash_key(key)
    
    info = APIKeyInfo(
        key_id=key_id,
        name=data.name,
        tier=data.tier,
        owner=data.owner,
        scopes=data.scopes,
    )
    
    _api_keys_store[key_hash] = info
    logger.info(f"API Key criada: {key_id} para {data.owner} (tier: {data.tier})")
    
    return APIKeyResponse(
        key=key,
        key_id=key_id,
        name=data.name,
        tier=data.tier,
        created_at=info.created_at,
    )


def validate_api_key(key: str) -> Optional[APIKeyInfo]:
    """Valida uma API Key e retorna suas informações."""
    if not key:
        return None
    
    key_hash = _hash_key(key)
    info = _api_keys_store.get(key_hash)
    
    if info and info.is_active:
        # Atualizar last_used_at
        info.last_used_at = datetime.now(timezone.utc)
        return info
    
    return None


def revoke_api_key(key_id: str) -> bool:
    """Revoga uma API Key pelo seu ID."""
    for key_hash, info in _api_keys_store.items():
        if info.key_id == key_id:
            info.is_active = False
            logger.info(f"API Key revogada: {key_id}")
            return True
    return False


def list_api_keys(owner: Optional[str] = None) -> list[APIKeyInfo]:
    """Lista API Keys (filtrada por owner se especificado)."""
    keys = list(_api_keys_store.values())
    if owner:
        keys = [k for k in keys if k.owner == owner]
    return keys


async def get_api_key_optional(
    api_key: Optional[str] = Security(api_key_header),
) -> Optional[APIKeyInfo]:
    """
    Dependency para obter API Key (opcional).
    Retorna None se não houver chave ou se for inválida.
    """
    if not api_key:
        return None
    
    info = validate_api_key(api_key)
    return info


async def get_api_key_required(
    api_key: Optional[str] = Security(api_key_header),
) -> APIKeyInfo:
    """
    Dependency para obter API Key (obrigatória).
    Lança HTTPException 401 se não houver chave válida.
    """
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "api_key_required",
                "message": "API Key necessária. Inclua o header X-API-Key.",
                "docs": "/docs#section/Authentication",
            },
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    info = validate_api_key(api_key)
    if not info:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "invalid_api_key",
                "message": "API Key inválida ou revogada.",
            },
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    return info


async def require_tier(min_tier: Tier):
    """
    Dependency factory para exigir um tier mínimo.
    
    Exemplo:
        @app.get("/admin/keys")
        async def list_keys(key: APIKeyInfo = Depends(require_tier(Tier.ADMIN))):
            ...
    """
    async def dependency(
        api_key_info: APIKeyInfo = Depends(get_api_key_required),
    ) -> APIKeyInfo:
        tier_order = [Tier.FREE, Tier.STANDARD, Tier.PREMIUM, Tier.ADMIN]
        
        if tier_order.index(api_key_info.tier) < tier_order.index(min_tier):
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "insufficient_tier",
                    "message": f"Este endpoint requer tier {min_tier.value} ou superior.",
                    "current_tier": api_key_info.tier.value,
                    "required_tier": min_tier.value,
                },
            )
        
        return api_key_info
    
    return dependency


def has_scope(info: APIKeyInfo, required_scope: str) -> bool:
    """Verifica se a API Key tem o scope necessário."""
    if "admin:all" in info.scopes:
        return True
    if "read:all" in info.scopes and required_scope.startswith("read:"):
        return True
    return required_scope in info.scopes


# Inicializar algumas chaves de desenvolvimento
def _init_dev_keys():
    """Cria chaves de desenvolvimento para testes."""
    if os.getenv("ENVIRONMENT", "development") == "development":
        # Chave de desenvolvimento (conhecida)
        dev_key = "tk_dev_12345678901234567890123456789012"
        dev_hash = _hash_key(dev_key)
        
        if dev_hash not in _api_keys_store:
            _api_keys_store[dev_hash] = APIKeyInfo(
                key_id="tk_dev_1234",
                name="Development Key",
                tier=Tier.ADMIN,
                owner="development",
                scopes=["admin:all"],
            )
            logger.debug("Dev API Key disponível: tk_dev_12345678901234567890123456789012")


# Inicializar chaves de dev no import
_init_dev_keys()
