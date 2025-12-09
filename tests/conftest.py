"""
Pytest Configuration
Configuração global para testes
"""
import pytest
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

@pytest.fixture
def sample_dataframe():
    """Fixture para DataFrame de teste"""
    import pandas as pd
    return pd.DataFrame({
        'codigo_ibge': [3100104, 3100203, 3100302],
        'municipio': ['Município A', 'Município B', 'Município C'],
        'ano': [2024, 2024, 2024],
        'URS': ['URS 1', 'URS 2', 'URS 1'],
        'total_atividades': [10, 0, 25],
        'POIS': [100, 0, 250]
    })

@pytest.fixture
def empty_dataframe():
    """Fixture para DataFrame vazio"""
    import pandas as pd
    return pd.DataFrame()

@pytest.fixture
def mock_mega_tabela(tmp_path):
    """Fixture que cria mock de mega tabela em parquet"""
    import pandas as pd
    
    df = pd.DataFrame({
        'codigo_ibge': range(3100104, 3100154),
        'municipio': [f'Município {i}' for i in range(50)],
        'ano': [2024] * 50,
        'URS': [f'URS {i % 5}' for i in range(50)],
        'total_atividades': [i * 10 for i in range(50)],
        'POIS': [i * 100 for i in range(50)]
    })
    
    parquet_path = tmp_path / "test_mega_tabela.parquet"
    df.to_parquet(parquet_path)
    
    return parquet_path, df
