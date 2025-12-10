"""
Routers da API TechDengue.
Cada módulo agrupa endpoints por domínio.
"""

from .health import router as health_router
from .facts import router as facts_router
from .weather import router as weather_router
from .gis import router as gis_router
from .admin import router as admin_router

__all__ = [
    "health_router",
    "facts_router",
    "weather_router",
    "gis_router",
    "admin_router",
]
