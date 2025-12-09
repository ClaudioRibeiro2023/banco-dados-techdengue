"""
Event Bus para comunicação entre módulos
Baseado no SIVEPI EventBus

Permite:
- Comunicação cross-module desacoplada
- Subscribe/emit pattern
- Logging estruturado de eventos
"""

from typing import Callable, Dict, List, Any
from loguru import logger

class EventBus:
    """
    Sistema de eventos para comunicação cross-module
    Baseado no padrão pub/sub
    """
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        logger.info("EventBus inicializado")
    
    def subscribe(self, event_name: str, callback: Callable):
        """
        Inscreve callback para evento
        
        Args:
            event_name: Nome do evento (ex: 'data_loaded', 'filter_changed')
            callback: Função a ser chamada quando evento ocorrer
        
        Uso:
            def on_data_loaded(data):
                print(f"Dados carregados: {len(data)}")
            
            event_bus.subscribe('data_loaded', on_data_loaded)
        """
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        
        self.subscribers[event_name].append(callback)
        logger.info(f"Subscriber adicionado para '{event_name}' ({len(self.subscribers[event_name])} total)")
    
    def unsubscribe(self, event_name: str, callback: Callable):
        """
        Remove callback de evento
        
        Args:
            event_name: Nome do evento
            callback: Função a remover
        """
        if event_name in self.subscribers:
            try:
                self.subscribers[event_name].remove(callback)
                logger.info(f"Subscriber removido de '{event_name}'")
            except ValueError:
                logger.warning(f"Callback não encontrado para '{event_name}'")
    
    def emit(self, event_name: str, data: Any = None):
        """
        Emite evento para todos os subscribers
        
        Args:
            event_name: Nome do evento
            data: Dados a enviar para callbacks
        
        Uso:
            event_bus.emit('data_loaded', {'records': 108, 'source': 'CISARP'})
        """
        if event_name not in self.subscribers:
            logger.debug(f"Nenhum subscriber para evento '{event_name}'")
            return
        
        subscriber_count = len(self.subscribers[event_name])
        logger.info(f"Emitindo evento '{event_name}' para {subscriber_count} subscriber(s)")
        
        for callback in self.subscribers[event_name]:
            try:
                callback(data)
            except Exception as e:
                logger.error(f"Erro em subscriber de '{event_name}': {e}")
    
    def emit_async(self, event_name: str, data: Any = None):
        """
        Emite evento assíncrono (não bloqueia)
        
        Útil para eventos de UI que não devem travar a interface
        """
        # Em Streamlit, podemos usar st.experimental_rerun() se necessário
        # Por ora, implementação síncrona
        self.emit(event_name, data)
    
    def clear(self, event_name: Optional[str] = None):
        """
        Limpa subscribers
        
        Args:
            event_name: Se especificado, limpa apenas esse evento.
                       Se None, limpa todos.
        """
        if event_name:
            if event_name in self.subscribers:
                del self.subscribers[event_name]
                logger.info(f"Subscribers de '{event_name}' removidos")
        else:
            self.subscribers.clear()
            logger.info("Todos os subscribers removidos")
    
    def get_events(self) -> List[str]:
        """Retorna lista de eventos registrados"""
        return list(self.subscribers.keys())
    
    def get_subscriber_count(self, event_name: str) -> int:
        """Retorna número de subscribers para evento"""
        return len(self.subscribers.get(event_name, []))

# Instância global
event_bus = EventBus()
