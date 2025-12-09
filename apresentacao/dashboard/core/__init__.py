"""
Core System do Dashboard
Componentes fundamentais de processamento de dados
"""

from .data_processor import data_processor, DataProcessor
from .cache_manager import cache_manager, CacheManager
from .event_bus import event_bus, EventBus

__all__ = [
    'data_processor',
    'DataProcessor',
    'cache_manager',
    'CacheManager',
    'event_bus',
    'EventBus'
]
