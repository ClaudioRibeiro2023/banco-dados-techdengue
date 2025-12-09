"""
Testes Unitários - Core System
Dashboard CISARP Enterprise
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Adicionar dashboard ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dashboard.core.data_processor import DataProcessor
from dashboard.core.cache_manager import CacheManager
from dashboard.core.event_bus import EventBus


class TestDataProcessor:
    """Testes para DataProcessor"""
    
    @pytest.fixture
    def processor(self):
        """Fixture do data processor"""
        return DataProcessor()
    
    @pytest.fixture
    def sample_df(self):
        """DataFrame de exemplo"""
        return pd.DataFrame({
            'MUNICIPIO': ['Belo Horizonte', 'Uberlândia', 'Contagem'],
            'CODIGO IBGE': ['3106200', '3170206', '3118601'],
            'POIS': [100, 200, 150],
            'HECTARES_MAPEADOS': [50.0, 75.0, 60.0],
            'DATA_MAP': pd.to_datetime(['2024-01-15', '2024-02-20', '2024-03-10'])
        })
    
    def test_validate_dataframe_valid(self, processor, sample_df):
        """Testa validação de DataFrame válido"""
        is_valid, message = processor.validate_dataframe(sample_df)
        assert is_valid == True
        assert "válido" in message.lower()
    
    def test_validate_dataframe_empty(self, processor):
        """Testa validação de DataFrame vazio"""
        empty_df = pd.DataFrame()
        is_valid, message = processor.validate_dataframe(empty_df)
        assert is_valid == False
        assert "vazio" in message.lower()
    
    def test_identify_municipality_column(self, processor, sample_df):
        """Testa identificação de coluna de município"""
        col = processor.identify_municipality_column(sample_df)
        assert col == 'MUNICIPIO'
    
    def test_clean_data(self, processor):
        """Testa limpeza de dados"""
        df = pd.DataFrame({
            'A': [1, 2, np.nan, 4],
            'B': [5, np.nan, 7, 8]
        })
        cleaned = processor.clean_data(df)
        assert cleaned['A'].isna().sum() == 0
        assert cleaned['B'].isna().sum() == 0
    
    def test_calculate_density(self, processor, sample_df):
        """Testa cálculo de densidade"""
        sample_df['densidade'] = sample_df.apply(
            lambda row: processor._calculate_density(row['POIS'], row['HECTARES_MAPEADOS']),
            axis=1
        )
        assert sample_df['densidade'].iloc[0] == 2.0  # 100/50
        assert sample_df['densidade'].iloc[1] == pytest.approx(2.67, 0.01)  # 200/75
    
    def test_get_summary(self, processor, sample_df):
        """Testa geração de resumo"""
        summary = processor.get_summary(sample_df)
        assert summary['total_registros'] == 3
        assert summary['total_colunas'] == 5
        assert 'tipos' in summary
        assert 'nulos' in summary


class TestCacheManager:
    """Testes para CacheManager"""
    
    @pytest.fixture
    def cache_manager(self):
        """Fixture do cache manager"""
        return CacheManager()
    
    def test_set_and_get_memory_cache(self, cache_manager):
        """Testa cache em memória"""
        cache_manager.set('test_key', {'value': 42}, ttl=60)
        result = cache_manager.get('test_key')
        assert result is not None
        assert result['value'] == 42
    
    def test_cache_expiration(self, cache_manager):
        """Testa expiração de cache"""
        cache_manager.set('expire_key', 'test_value', ttl=0)
        import time
        time.sleep(0.1)
        result = cache_manager.get('expire_key')
        assert result is None
    
    def test_delete_cache(self, cache_manager):
        """Testa remoção de cache"""
        cache_manager.set('delete_key', 'value')
        cache_manager.delete('delete_key')
        result = cache_manager.get('delete_key')
        assert result is None
    
    def test_clear_all_cache(self, cache_manager):
        """Testa limpeza total de cache"""
        cache_manager.set('key1', 'value1')
        cache_manager.set('key2', 'value2')
        cache_manager.clear_all()
        assert cache_manager.get('key1') is None
        assert cache_manager.get('key2') is None
    
    def test_exists(self, cache_manager):
        """Testa verificação de existência"""
        cache_manager.set('exists_key', 'value')
        assert cache_manager.exists('exists_key') == True
        assert cache_manager.exists('nonexistent_key') == False


class TestEventBus:
    """Testes para EventBus"""
    
    @pytest.fixture
    def event_bus(self):
        """Fixture do event bus"""
        return EventBus()
    
    def test_subscribe_and_emit(self, event_bus):
        """Testa inscrição e emissão de eventos"""
        received_data = []
        
        def callback(data):
            received_data.append(data)
        
        event_bus.subscribe('test_event', callback)
        event_bus.emit('test_event', {'message': 'hello'})
        
        assert len(received_data) == 1
        assert received_data[0]['message'] == 'hello'
    
    def test_multiple_subscribers(self, event_bus):
        """Testa múltiplos inscritos"""
        results = []
        
        def callback1(data):
            results.append('callback1')
        
        def callback2(data):
            results.append('callback2')
        
        event_bus.subscribe('multi_event', callback1)
        event_bus.subscribe('multi_event', callback2)
        event_bus.emit('multi_event', {})
        
        assert len(results) == 2
        assert 'callback1' in results
        assert 'callback2' in results
    
    def test_unsubscribe(self, event_bus):
        """Testa desinscrição"""
        results = []
        
        def callback(data):
            results.append(data)
        
        event_bus.subscribe('unsub_event', callback)
        event_bus.unsubscribe('unsub_event', callback)
        event_bus.emit('unsub_event', 'test')
        
        assert len(results) == 0
    
    def test_clear_events(self, event_bus):
        """Testa limpeza de eventos"""
        def callback(data):
            pass
        
        event_bus.subscribe('event1', callback)
        event_bus.subscribe('event2', callback)
        event_bus.clear()
        
        # Emitir não deve chamar callbacks
        event_bus.emit('event1', {})
        event_bus.emit('event2', {})


# Executar testes
if __name__ == '__main__':
    pytest.main([__file__, '-v'])
