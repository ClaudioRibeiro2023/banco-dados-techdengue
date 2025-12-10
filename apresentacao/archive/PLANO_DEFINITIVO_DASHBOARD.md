# 🎯 PLANO DEFINITIVO - DASHBOARD ANALÍTICO CISARP

**Baseado em arquitetura enterprise-grade do SIVEPI**  
**Status:** Plano Definitivo Aprovado  
**Complexidade:** Alta (Arquitetura Modular Profissional)

---

## 📊 APRENDIZADOS ARQUITETURAIS APLICADOS

### Da Aplicação SIVEPI (Referência)

#### ✅ 1. Arquitetura Modular
```
✓ Aplicações independentes em /applications
✓ Shared components centralizados em /shared
✓ DesignSystem como fonte única da verdade
✓ DataIntegrationHub para comunicação cross-module
✓ EventBus para eventos entre componentes
```

#### ✅ 2. Sistema de Design Centralizado
```
✓ ThemeProvider com context
✓ Cores padronizadas (brandColors)
✓ Componentes reutilizáveis (Card, Button, Badge)
✓ Typografia padronizada
✓ Shadows e spacing consistentes
```

#### ✅ 3. Gestão de Dados Avançada
```
✓ DataProcessor centralizado
✓ Cache inteligente (5min TTL)
✓ Validação robusta de arrays
✓ Hooks customizados (useDataIntegration)
✓ Event-driven data updates
```

#### ✅ 4. Performance e Otimização
```
✓ Lazy loading de módulos (React.lazy)
✓ useMemo para cálculos pesados
✓ Suspense boundaries
✓ GPU-accelerated animations
✓ Code splitting automático
```

#### ✅ 5. Sistema de Notificações
```
✓ Alertas automáticos baseados em regras
✓ Níveis de criticidade (crítico, warning, info)
✓ Monitoramento contínuo
✓ Interface integrada
```

#### ✅ 6. Resiliência e Qualidade
```
✓ Error boundaries robustos
✓ Fallbacks graceful
✓ Health checks
✓ Logging estruturado
✓ Testes automatizados (Jest + Cypress)
```

---

## 🏗️ ARQUITETURA DEFINITIVA

### Estrutura de Diretórios

```
apresentacao/
├── dashboard/                          # Dashboard principal
│   ├── app.py                         # Entry point Streamlit
│   ├── config/                        # Configurações
│   │   ├── __init__.py
│   │   ├── settings.py               # Settings centralizados
│   │   └── themes.py                 # Temas e cores
│   ├── core/                         # Core do sistema
│   │   ├── __init__.py
│   │   ├── data_processor.py         # Processamento centralizado
│   │   ├── cache_manager.py          # Sistema de cache
│   │   ├── event_bus.py              # Event bus Python
│   │   └── validators.py             # Validações robustas
│   ├── shared/                       # Componentes compartilhados
│   │   ├── __init__.py
│   │   ├── design_system.py          # Design system
│   │   ├── chart_factory.py          # Factory de gráficos
│   │   ├── metrics_calculator.py     # Cálculos de métricas
│   │   └── exporters.py              # Exportação de dados/gráficos
│   ├── pages/                        # Páginas modulares
│   │   ├── __init__.py
│   │   ├── 1_🏠_Home.py
│   │   ├── 2_📊_Performance.py
│   │   ├── 3_💊_Impacto_Epidemiologico.py
│   │   ├── 4_🏆_Benchmarking.py
│   │   ├── 5_🔍_Exploracao.py
│   │   └── 6_💡_Insights.py
│   ├── modules/                      # Módulos especializados
│   │   ├── __init__.py
│   │   ├── performance_analyzer.py   # Análise de performance
│   │   ├── impact_analyzer.py        # Análise de impacto
│   │   ├── benchmark_analyzer.py     # Benchmarking
│   │   └── insights_generator.py     # Gerador de insights
│   ├── utils/                        # Utilitários
│   │   ├── __init__.py
│   │   ├── data_loaders.py          # Carregadores de dados
│   │   ├── formatters.py            # Formatadores
│   │   └── helpers.py               # Funções auxiliares
│   └── assets/                      # Assets estáticos
│       ├── logos/
│       ├── styles/
│       │   └── custom.css
│       └── docs/
├── dados/                           # Dados processados
│   ├── cache/                       # Cache de dados
│   ├── exports/                     # Exports gerados
│   └── logs/                        # Logs do sistema
├── scripts/                         # Scripts auxiliares
│   ├── 01_validacao_dados.py       # Validação
│   ├── 02_analise_cisarp.py        # Análise
│   ├── 03_preparacao_dashboard.py  # Preparação (NOVO)
│   └── 04_analise_impacto.py       # Impacto
└── docs/                           # Documentação
    ├── ARQUITETURA.md
    ├── API.md
    └── GUIAS/
```

---

## 🚀 PLANO FASEADO DEFINITIVO

### **FASE 0: PREPARAÇÃO E SETUP** (1h)

#### Objetivo
Configurar ambiente e dependências com padrões enterprise

#### Atividades

**0.1 Instalar Dependências Completas**
```bash
pip install -r requirements_dashboard_full.txt
```

**Dependências:**
```txt
# Dashboard
streamlit==1.28.0
streamlit-aggrid==0.3.4        # Tabelas avançadas
streamlit-extras==0.3.5         # Componentes extras

# Visualização
plotly==5.17.0
kaleido==0.2.1                  # Export de gráficos

# Dados
pandas==2.1.0
numpy==1.24.3
openpyxl==3.1.2

# Cache e Performance
redis==5.0.0                    # Cache distribuído (opcional)
diskcache==5.6.3                # Cache em disco

# Validação
pydantic==2.4.0                 # Validação de dados

# Utils
python-dotenv==1.0.0            # Variáveis de ambiente
loguru==0.7.2                   # Logging avançado
```

**0.2 Estrutura de Pastas**
```bash
# Criar estrutura
mkdir -p dashboard/{config,core,shared,pages,modules,utils,assets/{logos,styles,docs}}
mkdir -p dados/{cache,exports,logs}
```

**0.3 Arquivos de Configuração**
```python
# dashboard/config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Dashboard CISARP"
    VERSION: str = "1.0.0"
    CACHE_TTL: int = 300  # 5 minutos
    MAX_CACHE_SIZE: int = 500  # MB
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**Entregas:**
- ✅ Ambiente configurado
- ✅ Dependências instaladas
- ✅ Estrutura de pastas criada
- ✅ Settings centralizados

---

### **FASE 1: CORE SYSTEM** (3h)

#### Objetivo
Implementar núcleo do sistema com padrões enterprise

#### 1.1 Design System (45min)

```python
# dashboard/shared/design_system.py
"""
Design System Centralizado - Baseado em SIVEPI
"""

import streamlit as st
from typing import Dict, Literal, Optional
from dataclasses import dataclass

@dataclass
class BrandColors:
    """Cores oficiais CISARP"""
    primary: str = '#0066CC'
    secondary: str = '#28A745'
    warning: str = '#FFA500'
    danger: str = '#DC3545'
    neutral: str = '#6C757D'
    background: str = '#F8F9FA'
    surface: str = '#FFFFFF'
    text_primary: str = '#1F2937'
    text_secondary: str = '#6B7280'

@dataclass
class Spacing:
    """Spacing padronizado"""
    xs: str = '4px'
    sm: str = '8px'
    md: str = '16px'
    lg: str = '24px'
    xl: str = '32px'
    xxl: str = '48px'

@dataclass
class Typography:
    """Tipografia padronizada"""
    h1: Dict = {'size': '32px', 'weight': 'bold'}
    h2: Dict = {'size': '24px', 'weight': 'bold'}
    h3: Dict = {'size': '20px', 'weight': '600'}
    body: Dict = {'size': '16px', 'weight': 'normal'}
    caption: Dict = {'size': '12px', 'weight': 'normal'}

class DesignSystem:
    """Sistema de Design Unificado"""
    
    colors = BrandColors()
    spacing = Spacing()
    typography = Typography()
    
    @staticmethod
    def metric_card(
        title: str,
        value: str,
        delta: Optional[str] = None,
        color: str = 'primary',
        icon: Optional[str] = None
    ):
        """Card de métrica padronizado"""
        color_map = {
            'primary': DesignSystem.colors.primary,
            'success': DesignSystem.colors.secondary,
            'warning': DesignSystem.colors.warning,
            'danger': DesignSystem.colors.danger
        }
        
        st.markdown(f"""
        <div style="
            background: linear-gradient(135deg, {color_map[color]} 0%, {color_map[color]}dd 100%);
            padding: {DesignSystem.spacing.lg};
            border-radius: 12px;
            color: white;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <h3 style="margin: 0; font-size: 14px; opacity: 0.9;">{title}</h3>
            <h1 style="margin: 10px 0; font-size: 36px; font-weight: bold;">{value}</h1>
            {f'<p style="margin: 0; font-size: 12px; opacity: 0.8;">{delta}</p>' if delta else ''}
        </div>
        """, unsafe_allow_html=True)
    
    @staticmethod
    def section_header(title: str, description: Optional[str] = None):
        """Header de seção padronizado"""
        st.markdown(f"""
        <div style="
            background: linear-gradient(135deg, {DesignSystem.colors.primary} 0%, {DesignSystem.colors.secondary} 100%);
            padding: {DesignSystem.spacing.lg};
            border-radius: 12px;
            margin-bottom: {DesignSystem.spacing.lg};
        ">
            <h2 style="color: white; margin: 0;">{title}</h2>
            {f'<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">{description}</p>' if description else ''}
        </div>
        """, unsafe_allow_html=True)

# Instância global
ds = DesignSystem()
```

#### 1.2 Data Processor (1h)

```python
# dashboard/core/data_processor.py
"""
Processador de Dados Centralizado
Baseado no SIVEPI DataProcessor
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from functools import lru_cache
from loguru import logger
import hashlib

class DataProcessor:
    """
    Processador centralizado de dados com cache e validação
    """
    
    def __init__(self):
        self.cache = {}
        self._setup_logger()
    
    def _setup_logger(self):
        """Configura logging"""
        logger.add(
            "dados/logs/data_processor_{time}.log",
            rotation="1 day",
            retention="7 days",
            level="INFO"
        )
    
    def _generate_cache_key(self, data: Any, operation: str) -> str:
        """Gera chave de cache baseada em hash"""
        data_str = str(data)
        hash_obj = hashlib.md5(f"{data_str}_{operation}".encode())
        return hash_obj.hexdigest()
    
    def validate_dataframe(self, df: pd.DataFrame, required_columns: List[str]) -> bool:
        """Valida DataFrame com colunas obrigatórias"""
        if not isinstance(df, pd.DataFrame):
            logger.error("Input não é um DataFrame")
            return False
        
        missing = set(required_columns) - set(df.columns)
        if missing:
            logger.error(f"Colunas faltando: {missing}")
            return False
        
        return True
    
    @lru_cache(maxsize=128)
    def safe_array(self, data: Any) -> List:
        """Converte para array seguro com validação"""
        if data is None:
            return []
        if isinstance(data, list):
            return data
        if isinstance(data, pd.Series):
            return data.tolist()
        if isinstance(data, np.ndarray):
            return data.tolist()
        return []
    
    def calculate_metrics(self, df: pd.DataFrame, metrics: List[str]) -> Dict[str, float]:
        """Calcula múltiplas métricas de forma otimizada"""
        cache_key = self._generate_cache_key(df, f"metrics_{metrics}")
        
        if cache_key in self.cache:
            logger.info("Retornando métricas do cache")
            return self.cache[cache_key]
        
        results = {}
        for metric in metrics:
            if metric in df.columns:
                results[metric] = {
                    'sum': float(df[metric].sum()),
                    'mean': float(df[metric].mean()),
                    'median': float(df[metric].median()),
                    'std': float(df[metric].std()),
                    'min': float(df[metric].min()),
                    'max': float(df[metric].max())
                }
        
        self.cache[cache_key] = results
        return results
    
    def aggregate_by(
        self,
        df: pd.DataFrame,
        group_by: str,
        agg_cols: Dict[str, str]
    ) -> pd.DataFrame:
        """Agregação otimizada com cache"""
        cache_key = self._generate_cache_key(df, f"agg_{group_by}_{agg_cols}")
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        result = df.groupby(group_by).agg(agg_cols).reset_index()
        self.cache[cache_key] = result
        
        return result
    
    def filter_dataframe(
        self,
        df: pd.DataFrame,
        filters: Dict[str, Any]
    ) -> pd.DataFrame:
        """Filtra DataFrame baseado em múltiplos critérios"""
        result = df.copy()
        
        for col, condition in filters.items():
            if col not in result.columns:
                continue
            
            if isinstance(condition, dict):
                if 'min' in condition:
                    result = result[result[col] >= condition['min']]
                if 'max' in condition:
                    result = result[result[col] <= condition['max']]
                if 'values' in condition:
                    result = result[result[col].isin(condition['values'])]
            else:
                result = result[result[col] == condition]
        
        return result

# Instância global
data_processor = DataProcessor()
```

#### 1.3 Cache Manager (45min)

```python
# dashboard/core/cache_manager.py
"""
Sistema de Cache Inteligente
Baseado no SIVEPI com TTL e invalidação
"""

import streamlit as st
from datetime import datetime, timedelta
from typing import Any, Optional, Callable
from functools import wraps
import pickle
import hashlib
from pathlib import Path

class CacheManager:
    """Gerenciador de cache com TTL e persistência"""
    
    def __init__(self, cache_dir: str = "dados/cache", ttl_minutes: int = 5):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl = timedelta(minutes=ttl_minutes)
        self.memory_cache = {}
    
    def _generate_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Gera chave única para cache"""
        key_data = f"{func_name}_{args}_{kwargs}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _is_expired(self, timestamp: datetime) -> bool:
        """Verifica se cache expirou"""
        return datetime.now() - timestamp > self.ttl
    
    def get(self, key: str) -> Optional[Any]:
        """Recupera do cache se válido"""
        # Memória primeiro
        if key in self.memory_cache:
            value, timestamp = self.memory_cache[key]
            if not self._is_expired(timestamp):
                return value
        
        # Disco se não estiver em memória
        cache_file = self.cache_dir / f"{key}.pkl"
        if cache_file.exists():
            with open(cache_file, 'rb') as f:
                value, timestamp = pickle.load(f)
                if not self._is_expired(timestamp):
                    self.memory_cache[key] = (value, timestamp)
                    return value
        
        return None
    
    def set(self, key: str, value: Any):
        """Salva no cache"""
        timestamp = datetime.now()
        self.memory_cache[key] = (value, timestamp)
        
        # Persistir em disco
        cache_file = self.cache_dir / f"{key}.pkl"
        with open(cache_file, 'wb') as f:
            pickle.load((value, timestamp), f)
    
    def cached(self, ttl_minutes: Optional[int] = None):
        """Decorator para cache automático"""
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                key = self._generate_key(func.__name__, args, kwargs)
                
                # Tenta recuperar do cache
                cached_value = self.get(key)
                if cached_value is not None:
                    return cached_value
                
                # Executa função e cacheia
                result = func(*args, **kwargs)
                self.set(key, result)
                
                return result
            return wrapper
        return decorator
    
    def clear(self):
        """Limpa cache"""
        self.memory_cache.clear()
        for file in self.cache_dir.glob("*.pkl"):
            file.unlink()

# Instância global
cache_manager = CacheManager()
```

#### 1.4 Event Bus (30min)

```python
# dashboard/core/event_bus.py
"""
Event Bus para comunicação entre módulos
Baseado no SIVEPI EventBus
"""

from typing import Callable, Dict, List
from loguru import logger

class EventBus:
    """
    Sistema de eventos para comunicação cross-module
    """
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        logger.info("EventBus inicializado")
    
    def subscribe(self, event_name: str, callback: Callable):
        """Inscreve callback para evento"""
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        
        self.subscribers[event_name].append(callback)
        logger.info(f"Subscriber adicionado para '{event_name}'")
    
    def unsubscribe(self, event_name: str, callback: Callable):
        """Remove callback de evento"""
        if event_name in self.subscribers:
            self.subscribers[event_name].remove(callback)
            logger.info(f"Subscriber removido de '{event_name}'")
    
    def emit(self, event_name: str, data: any):
        """Emite evento para todos os subscribers"""
        if event_name in self.subscribers:
            logger.info(f"Emitindo evento '{event_name}' para {len(self.subscribers[event_name])} subscribers")
            for callback in self.subscribers[event_name]:
                try:
                    callback(data)
                except Exception as e:
                    logger.error(f"Erro em subscriber de '{event_name}': {e}")

# Instância global
event_bus = EventBus()
```

**Entregas Fase 1:**
- ✅ Design System centralizado
- ✅ Data Processor robusto
- ✅ Cache Manager inteligente
- ✅ Event Bus funcional

---

### **FASE 2: MÓDULOS DE ANÁLISE** (4h)

#### 2.1 Performance Analyzer (1h)
#### 2.2 Impact Analyzer (1h)
#### 2.3 Benchmark Analyzer (1h)
#### 2.4 Insights Generator (1h)

*[Continua no próximo documento devido ao tamanho]*

---

**Total Estimado:** 18-20 horas de desenvolvimento
**Resultado:** Dashboard enterprise-grade profissional

Este é o PLANO DEFINITIVO baseado em arquitetura comprovada.
