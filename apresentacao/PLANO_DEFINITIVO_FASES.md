# 🚀 PLANO DEFINITIVO - FASES COMPLETAS

**Continuação do PLANO_DEFINITIVO_DASHBOARD.md**

---

## 📊 FASE 2: MÓDULOS DE ANÁLISE (4h)

### 2.1 Performance Analyzer (1h)

```python
# dashboard/modules/performance_analyzer.py
"""
Módulo de Análise de Performance
"""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, List
from dashboard.core.data_processor import data_processor
from dashboard.core.cache_manager import cache_manager

class PerformanceAnalyzer:
    """Análise completa de performance operacional"""
    
    @cache_manager.cached(ttl_minutes=5)
    def calculate_kpis(self, df: pd.DataFrame) -> Dict:
        """Calcula KPIs principais"""
        return {
            'total_registros': len(df),
            'pois_total': df['POIS'].sum() if 'POIS' in df.columns else 0,
            'hectares_total': df['HECTARES_MAPEADOS'].sum() if 'HECTARES_MAPEADOS' in df.columns else 0,
            'pois_medio': df['POIS'].mean() if 'POIS' in df.columns else 0,
            'densidade': self._calculate_density(df)
        }
    
    def _calculate_density(self, df: pd.DataFrame) -> float:
        """Calcula densidade POIs/hectare"""
        pois = df['POIS'].sum() if 'POIS' in df.columns else 0
        hectares = df['HECTARES_MAPEADOS'].sum() if 'HECTARES_MAPEADOS' in df.columns else 1
        return pois / hectares if hectares > 0 else 0
    
    def get_top_municipalities(self, df: pd.DataFrame, n: int = 15) -> pd.DataFrame:
        """Top N municípios por número de intervenções"""
        col_codigo = self._identify_municipality_column(df)
        if not col_codigo:
            return pd.DataFrame()
        
        return df[col_codigo].value_counts().head(n).reset_index()
    
    def temporal_evolution(self, df: pd.DataFrame) -> Dict:
        """Análise de evolução temporal"""
        if 'DATA_MAP' not in df.columns:
            return {}
        
        df_temp = df.copy()
        df_temp['mes'] = pd.to_datetime(df_temp['DATA_MAP']).dt.to_period('M')
        
        evolution = df_temp.groupby('mes').agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        
        return {
            'monthly': evolution.to_dict('records'),
            'trend': self._calculate_trend(evolution)
        }
    
    def _calculate_trend(self, df: pd.DataFrame) -> str:
        """Calcula tendência (crescente, decrescente, estável)"""
        if len(df) < 2:
            return 'insuficiente'
        
        first_half = df.iloc[:len(df)//2]['POIS'].mean()
        second_half = df.iloc[len(df)//2:]['POIS'].mean()
        
        diff_pct = ((second_half - first_half) / first_half) * 100
        
        if diff_pct > 10:
            return 'crescente'
        elif diff_pct < -10:
            return 'decrescente'
        return 'estável'
    
    def _identify_municipality_column(self, df: pd.DataFrame) -> str:
        """Identifica coluna de município"""
        for col in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge', 'Municipio']:
            if col in df.columns:
                return col
        return None

# Instância global
performance_analyzer = PerformanceAnalyzer()
```

### 2.2 Impact Analyzer (1h)

```python
# dashboard/modules/impact_analyzer.py
"""
Módulo de Análise de Impacto Epidemiológico
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from scipy import stats
from dashboard.core.cache_manager import cache_manager
from loguru import logger

class ImpactAnalyzer:
    """Análise de impacto epidemiológico"""
    
    @cache_manager.cached(ttl_minutes=10)
    def before_after_analysis(
        self,
        df_dengue_before: pd.DataFrame,
        df_dengue_after: pd.DataFrame,
        municipios_cisarp: List[str]
    ) -> Dict:
        """Análise before-after de casos de dengue"""
        
        results = []
        
        for codigo in municipios_cisarp:
            casos_before = self._sum_cases(df_dengue_before, codigo)
            casos_after = self._sum_cases(df_dengue_after, codigo)
            
            if casos_before > 0:
                variacao_pct = ((casos_after - casos_before) / casos_before) * 100
                
                results.append({
                    'municipio': codigo,
                    'casos_antes': casos_before,
                    'casos_depois': casos_after,
                    'variacao_absoluta': casos_after - casos_before,
                    'variacao_percentual': variacao_pct,
                    'classificacao': self._classify_impact(variacao_pct)
                })
        
        df_results = pd.DataFrame(results)
        
        return {
            'individual': df_results.to_dict('records'),
            'aggregate': self._aggregate_statistics(df_results),
            'cases_success': self._identify_success_cases(df_results)
        }
    
    def _sum_cases(self, df: pd.DataFrame, codigo: str) -> int:
        """Soma casos para município"""
        mun_data = df[df['codmun'].astype(str) == str(codigo)]
        if len(mun_data) == 0:
            return 0
        
        # Somar todas as colunas de semana
        week_cols = [col for col in df.columns if col.startswith('Semana')]
        return int(mun_data[week_cols].sum(axis=1).values[0]) if week_cols else 0
    
    def _classify_impact(self, variacao_pct: float) -> str:
        """Classifica impacto"""
        if variacao_pct < -20:
            return 'ALTA REDUÇÃO ⭐⭐⭐'
        elif variacao_pct < -10:
            return 'REDUÇÃO MODERADA ⭐⭐'
        elif variacao_pct < 0:
            return 'REDUÇÃO LEVE ⭐'
        return 'SEM REDUÇÃO'
    
    def _aggregate_statistics(self, df: pd.DataFrame) -> Dict:
        """Estatísticas agregadas"""
        return {
            'total_municipios': len(df),
            'casos_antes_total': int(df['casos_antes'].sum()),
            'casos_depois_total': int(df['casos_depois'].sum()),
            'variacao_media': float(df['variacao_percentual'].mean()),
            'variacao_mediana': float(df['variacao_percentual'].median()),
            'municipios_com_reducao': int((df['variacao_percentual'] < 0).sum())
        }
    
    def _identify_success_cases(self, df: pd.DataFrame, threshold: float = -15) -> List[Dict]:
        """Identifica cases de sucesso"""
        success = df[df['variacao_percentual'] < threshold]
        return success.nlargest(5, 'variacao_percentual', keep='first').to_dict('records')
    
    def correlation_analysis(
        self,
        df_activities: pd.DataFrame,
        df_impact: pd.DataFrame
    ) -> Dict:
        """Análise de correlação entre atividades e impacto"""
        
        # Merge datasets
        merged = pd.merge(
            df_activities.groupby('municipio').agg({'POIS': 'sum', 'HECTARES_MAPEADOS': 'sum'}),
            df_impact[['municipio', 'variacao_percentual']],
            on='municipio',
            how='inner'
        )
        
        # Correlação de Pearson
        if len(merged) > 2:
            corr_pois, p_pois = stats.pearsonr(merged['POIS'], merged['variacao_percentual'])
            corr_hectares, p_hectares = stats.pearsonr(merged['HECTARES_MAPEADOS'], merged['variacao_percentual'])
            
            return {
                'correlation_pois': {
                    'coefficient': float(corr_pois),
                    'p_value': float(p_pois),
                    'significant': p_pois < 0.05
                },
                'correlation_hectares': {
                    'coefficient': float(corr_hectares),
                    'p_value': float(p_hectares),
                    'significant': p_hectares < 0.05
                },
                'interpretation': self._interpret_correlation(corr_pois, p_pois)
            }
        
        return {}
    
    def _interpret_correlation(self, corr: float, p_value: float) -> str:
        """Interpreta correlação"""
        if p_value >= 0.05:
            return "Sem correlação estatisticamente significativa"
        
        if corr < -0.5:
            return "Forte correlação NEGATIVA (mais POIs = maior redução) ✅"
        elif corr < -0.3:
            return "Moderada correlação negativa"
        elif corr < 0:
            return "Fraca correlação negativa"
        return "Correlação positiva ou nula"

# Instância global
impact_analyzer = ImpactAnalyzer()
```

### 2.3 Benchmark Analyzer (45min)

```python
# dashboard/modules/benchmark_analyzer.py
"""
Módulo de Benchmarking
"""

import pandas as pd
from typing import Dict, List

class BenchmarkAnalyzer:
    """Análise de benchmarking e posicionamento"""
    
    def rank_contractors(self, df: pd.DataFrame, contractor_name: str = 'CISARP') -> Dict:
        """Ranking de contratantes"""
        
        ranking = df.groupby('CONTRATANTE').size().reset_index(name='atividades')
        ranking = ranking.sort_values('atividades', ascending=False)
        ranking['posicao'] = range(1, len(ranking) + 1)
        
        # Posição do CISARP
        cisarp_pos = ranking[ranking['CONTRATANTE'] == contractor_name]
        
        return {
            'ranking': ranking.head(10).to_dict('records'),
            'cisarp_position': int(cisarp_pos['posicao'].values[0]) if len(cisarp_pos) > 0 else 0,
            'total_contractors': len(ranking),
            'cisarp_percentile': self._calculate_percentile(cisarp_pos, ranking)
        }
    
    def _calculate_percentile(self, cisarp: pd.DataFrame, ranking: pd.DataFrame) -> float:
        """Calcula percentil do CISARP"""
        if len(cisarp) == 0:
            return 0.0
        
        pos = cisarp['posicao'].values[0]
        total = len(ranking)
        
        return (pos / total) * 100
    
    def compare_metrics(
        self,
        df: pd.DataFrame,
        contractor: str,
        comparison_group: List[str]
    ) -> Dict:
        """Compara métricas entre grupos"""
        
        # Métricas do contratante
        contractor_data = df[df['CONTRATANTE'] == contractor]
        
        # Métricas do grupo de comparação
        group_data = df[df['CONTRATANTE'].isin(comparison_group)]
        
        metrics = {}
        for col in ['POIS', 'HECTARES_MAPEADOS']:
            if col in df.columns:
                metrics[col] = {
                    'contractor_mean': float(contractor_data[col].mean()),
                    'group_mean': float(group_data[col].mean()),
                    'difference_pct': self._calc_diff_pct(
                        contractor_data[col].mean(),
                        group_data[col].mean()
                    )
                }
        
        return metrics
    
    def _calc_diff_pct(self, value: float, baseline: float) -> float:
        """Calcula diferença percentual"""
        if baseline == 0:
            return 0.0
        return ((value - baseline) / baseline) * 100

# Instância global
benchmark_analyzer = BenchmarkAnalyzer()
```

### 2.4 Insights Generator (45min)

```python
# dashboard/modules/insights_generator.py
"""
Gerador de Insights Inteligente
"""

from typing import List, Dict
import pandas as pd

class InsightsGenerator:
    """Geração automática de insights"""
    
    def generate_insights(
        self,
        kpis: Dict,
        impact: Dict,
        benchmark: Dict
    ) -> List[Dict]:
        """Gera insights baseados em múltiplas fontes"""
        
        insights = []
        
        # Insight 1: Performance
        insights.append({
            'category': 'performance',
            'title': f"🏆 {benchmark.get('cisarp_position', 0)}º Lugar Nacional",
            'description': f"CISARP alcançou {benchmark.get('cisarp_position', 0)}º lugar entre {benchmark.get('total_contractors', 0)} contratantes, posicionando-se no Top {benchmark.get('cisarp_percentile', 0):.0f}%",
            'metric': f"{benchmark.get('cisarp_position', 0)}º/{benchmark.get('total_contractors', 0)}",
            'severity': 'success'
        })
        
        # Insight 2: Cobertura
        insights.append({
            'category': 'coverage',
            'title': "📊 Cobertura Territorial Abrangente",
            'description': f"{kpis.get('hectares_total', 0):,.0f} hectares mapeados com {kpis.get('pois_total', 0):,} POIs identificados",
            'metric': f"{kpis.get('hectares_total', 0):,.0f} ha",
            'severity': 'info'
        })
        
        # Insight 3: Impacto (se disponível)
        if impact:
            avg_impact = impact.get('aggregate', {}).get('variacao_media', 0)
            if avg_impact < 0:
                insights.append({
                    'category': 'impact',
                    'title': "💊 Impacto Epidemiológico Positivo",
                    'description': f"Redução média de {abs(avg_impact):.1f}% nos casos de dengue em municípios com intervenções",
                    'metric': f"{avg_impact:.1f}%",
                    'severity': 'success'
                })
        
        # Insight 4: Densidade
        densidade = kpis.get('densidade', 0)
        insights.append({
            'category': 'efficiency',
            'title': "🔍 Alta Densidade Operacional",
            'description': f"Densidade média de {densidade:.2f} POIs por hectare, demonstrando cobertura intensiva",
            'metric': f"{densidade:.2f} POIs/ha",
            'severity': 'info'
        })
        
        # Insight 5: Potencial
        gap_to_3rd = 3 - benchmark.get('cisarp_position', 4)
        if gap_to_3rd > 0:
            insights.append({
                'category': 'potential',
                'title': "📈 Potencial de Crescimento",
                'description': f"Gap de apenas {gap_to_3rd} posições para alcançar o Top 3 nacional",
                'metric': f"+{gap_to_3rd} posições",
                'severity': 'warning'
            })
        
        return insights
    
    def generate_recommendations(self, insights: List[Dict]) -> Dict[str, List[str]]:
        """Gera recomendações baseadas em insights"""
        
        recommendations = {
            'curto_prazo': [],
            'medio_prazo': [],
            'longo_prazo': []
        }
        
        # Análise de insights para gerar recomendações
        for insight in insights:
            if insight['category'] == 'potential':
                recommendations['curto_prazo'].append(
                    "Expandir cobertura para municípios prioritários"
                )
            elif insight['category'] == 'impact' and 'Positivo' in insight['title']:
                recommendations['medio_prazo'].append(
                    "Documentar cases de sucesso para replicação"
                )
        
        # Recomendações padrão
        recommendations['curto_prazo'].extend([
            "Aumentar taxa de conversão de devolutivas",
            "Campanhas de conscientização em áreas de risco"
        ])
        
        recommendations['medio_prazo'].extend([
            "Implementar monitoramento contínuo",
            "Integrar com dados epidemiológicos em tempo real"
        ])
        
        recommendations['longo_prazo'].extend([
            "Estabelecer CISARP como modelo de referência",
            "Desenvolver programa de capacitação regional"
        ])
        
        return recommendations

# Instância global
insights_generator = InsightsGenerator()
```

**Entregas Fase 2:**
- ✅ 4 Módulos de análise completos
- ✅ Cache e otimização integrados
- ✅ Insights automáticos
- ✅ Recomendações baseadas em dados

---

## 📱 FASE 3: PÁGINAS DO DASHBOARD (6h)

### Estrutura de Páginas

**3.1 Home (1h)** - Visão executiva com KPIs principais  
**3.2 Performance (1.5h)** - Análise operacional detalhada  
**3.3 Impacto (1.5h)** - Análise epidemiológica completa  
**3.4 Benchmarking (1h)** - Comparações e ranking  
**3.5 Exploração (0.5h)** - Filtros e tabelas interativas  
**3.6 Insights (0.5h)** - Descobertas e recomendações  

*[Implementação detalhada disponível mediante solicitação]*

---

## 🎨 FASE 4: UI/UX E POLISH (3h)

### 4.1 Design System Aplicado (1h)
- Aplicar cores padronizadas em todos os componentes
- Implementar spacing consistente
- Adicionar animações suaves

### 4.2 Responsividade (1h)
- Mobile-first design
- Breakpoints otimizados
- Touch-friendly interface

### 4.3 Acessibilidade (1h)
- Alt text em gráficos
- Contraste adequado
- Navegação por teclado

---

## 🧪 FASE 5: TESTES E QUALIDADE (3h)

### 5.1 Testes Unitários (1h)
```python
# tests/test_data_processor.py
import pytest
from dashboard.core.data_processor import data_processor

def test_validate_dataframe():
    df = pd.DataFrame({'A': [1,2], 'B': [3,4]})
    assert data_processor.validate_dataframe(df, ['A', 'B'])

def test_safe_array():
    assert data_processor.safe_array(None) == []
    assert data_processor.safe_array([1,2,3]) == [1,2,3]
```

### 5.2 Testes de Integração (1h)
- Testar fluxo completo de dados
- Validar integração entre módulos
- Verificar cache e performance

### 5.3 Testes de UI (1h)
- Testar navegação entre páginas
- Validar responsividade
- Verificar exportação de dados

---

## 🚀 FASE 6: DEPLOY E DOCUMENTAÇÃO (2h)

### 6.1 Preparação para Deploy (1h)
```bash
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements_dashboard_full.txt .
RUN pip install -r requirements_dashboard_full.txt
COPY dashboard/ ./dashboard/
COPY dados/ ./dados/
CMD ["streamlit", "run", "dashboard/app.py"]
```

### 6.2 Documentação Final (1h)
- README completo
- API documentation
- Guias de uso
- Troubleshooting

---

## ⏱️ CRONOGRAMA CONSOLIDADO

| Fase | Duração | Complexidade | Prioridade |
|------|---------|--------------|------------|
| **0. Setup** | 1h | Baixa | 🔴 Crítica |
| **1. Core** | 3h | Alta | 🔴 Crítica |
| **2. Módulos** | 4h | Alta | 🔴 Crítica |
| **3. Páginas** | 6h | Média | 🟡 Alta |
| **4. UI/UX** | 3h | Média | 🟡 Alta |
| **5. Testes** | 3h | Média | 🟢 Média |
| **6. Deploy** | 2h | Baixa | 🟢 Média |
| **TOTAL** | **22h** | **Enterprise** | |

---

## ✅ DIFERENCIAIS IMPLEMENTADOS

### vs Dashboard Anterior

| Aspecto | Anterior | NOVO (Definitivo) |
|---------|----------|-------------------|
| Arquitetura | Monolítica | **Modular** ✅ |
| Cache | Básico | **Inteligente c/ TTL** ✅ |
| Validação | Simples | **Robusta c/ Pydantic** ✅ |
| Design System | Inline | **Centralizado** ✅ |
| Logging | Print | **Loguru estruturado** ✅ |
| Testes | Nenhum | **Unit + Integration** ✅ |
| Event Bus | N/A | **Cross-module** ✅ |
| Performance | Básica | **Otimizada** ✅ |

---

## 🎯 RESULTADO FINAL

**Você terá:**

1. ✅ Dashboard enterprise-grade profissional
2. ✅ Arquitetura modular escalável
3. ✅ Sistema de cache inteligente
4. ✅ Design system centralizado
5. ✅ Análises automáticas e insights
6. ✅ Performance otimizada
7. ✅ Testes automatizados
8. ✅ Documentação completa

**Pronto para:**
- 📊 Apresentações de alto impacto
- 🔄 Expansão futura
- 🚀 Deploy em produção
- 👥 Compartilhamento com stakeholders

---

**Este é o PLANO DEFINITIVO baseado em arquitetura enterprise comprovada do SIVEPI.**

**Próxima ação:** Executar Fase 0 (Setup)
