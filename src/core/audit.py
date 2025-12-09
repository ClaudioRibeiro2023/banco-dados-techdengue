"""
Sistema de Audit Logs para TechDengue API.
Registra todas as requisições para compliance e análise.
"""

import os
import json
from datetime import datetime, timezone
from typing import Optional, Any
from collections import deque

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from pydantic import BaseModel, Field

from loguru import logger


class AuditLogEntry(BaseModel):
    """Entrada de log de auditoria."""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    request_id: str
    method: str
    path: str
    query_params: dict[str, Any] = Field(default_factory=dict)
    client_ip: str
    user_agent: Optional[str] = None
    api_key_id: Optional[str] = None
    tier: Optional[str] = None
    status_code: int
    response_time_ms: float
    error: Optional[str] = None


# Buffer em memória para logs recentes (em produção, enviar para ElasticSearch/CloudWatch)
_audit_buffer: deque[AuditLogEntry] = deque(maxlen=10000)


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware para registrar audit logs de todas as requisições."""
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        import time
        import uuid
        
        # Gerar request ID
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        
        start_time = time.perf_counter()
        error_msg = None
        status_code = 500
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            
            # Adicionar headers de rastreamento
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            error_msg = str(e)
            raise
            
        finally:
            # Calcular tempo de resposta
            response_time_ms = (time.perf_counter() - start_time) * 1000
            
            # Extrair informações da request
            client_ip = request.client.host if request.client else "unknown"
            
            # Extrair API Key ID se disponível
            api_key_id = None
            tier = None
            if hasattr(request.state, "api_key_info") and request.state.api_key_info:
                api_key_id = request.state.api_key_info.key_id
                tier = request.state.api_key_info.tier.value
            
            # Criar entrada de log
            entry = AuditLogEntry(
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                query_params=dict(request.query_params),
                client_ip=client_ip,
                user_agent=request.headers.get("User-Agent"),
                api_key_id=api_key_id,
                tier=tier,
                status_code=status_code,
                response_time_ms=round(response_time_ms, 2),
                error=error_msg,
            )
            
            # Adicionar ao buffer
            _audit_buffer.append(entry)
            
            # Log estruturado
            log_data = {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "time_ms": round(response_time_ms, 2),
                "client": client_ip,
                "key": api_key_id or "anonymous",
            }
            
            if status_code >= 400:
                logger.warning(f"API Request: {json.dumps(log_data)}")
            else:
                logger.info(f"API Request: {json.dumps(log_data)}")


def get_recent_logs(
    limit: int = 100,
    path_filter: Optional[str] = None,
    api_key_id: Optional[str] = None,
    min_status: Optional[int] = None,
) -> list[AuditLogEntry]:
    """
    Retorna logs recentes com filtros opcionais.
    
    Args:
        limit: Número máximo de logs a retornar
        path_filter: Filtrar por path (contém)
        api_key_id: Filtrar por API Key
        min_status: Status code mínimo (ex: 400 para erros)
    """
    logs = list(_audit_buffer)
    logs.reverse()  # Mais recentes primeiro
    
    if path_filter:
        logs = [l for l in logs if path_filter in l.path]
    
    if api_key_id:
        logs = [l for l in logs if l.api_key_id == api_key_id]
    
    if min_status:
        logs = [l for l in logs if l.status_code >= min_status]
    
    return logs[:limit]


def get_audit_stats() -> dict:
    """Retorna estatísticas dos logs de auditoria."""
    logs = list(_audit_buffer)
    
    if not logs:
        return {
            "total_requests": 0,
            "period_hours": 0,
            "requests_per_hour": 0,
            "avg_response_time_ms": 0,
            "error_rate": 0,
            "top_paths": [],
            "top_clients": [],
        }
    
    total = len(logs)
    errors = sum(1 for l in logs if l.status_code >= 400)
    avg_time = sum(l.response_time_ms for l in logs) / total
    
    # Período coberto
    oldest = min(l.timestamp for l in logs)
    newest = max(l.timestamp for l in logs)
    hours = (newest - oldest).total_seconds() / 3600
    
    # Top paths
    path_counts: dict[str, int] = {}
    for l in logs:
        path_counts[l.path] = path_counts.get(l.path, 0) + 1
    top_paths = sorted(path_counts.items(), key=lambda x: -x[1])[:10]
    
    # Top clients
    client_counts: dict[str, int] = {}
    for l in logs:
        key = l.api_key_id or l.client_ip
        client_counts[key] = client_counts.get(key, 0) + 1
    top_clients = sorted(client_counts.items(), key=lambda x: -x[1])[:10]
    
    return {
        "total_requests": total,
        "period_hours": round(hours, 2),
        "requests_per_hour": round(total / hours, 2) if hours > 0 else 0,
        "avg_response_time_ms": round(avg_time, 2),
        "error_rate": round(errors / total * 100, 2),
        "top_paths": [{"path": p, "count": c} for p, c in top_paths],
        "top_clients": [{"client": c, "count": n} for c, n in top_clients],
    }


def export_logs(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> list[dict]:
    """Exporta logs para análise externa."""
    logs = list(_audit_buffer)
    
    if start_date:
        logs = [l for l in logs if l.timestamp >= start_date]
    
    if end_date:
        logs = [l for l in logs if l.timestamp <= end_date]
    
    return [l.model_dump() for l in logs]
