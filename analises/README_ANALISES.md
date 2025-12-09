# 📊 Guia Completo de Análises - Projeto TechDengue

## 📚 Estrutura da Documentação

Este diretório contém o **roadmap completo** de análises possíveis para o projeto TechDengue, organizado em **3 pilares**:

### 📁 Documentos Disponíveis

1. **[PILAR1_ANALISES_TECHDENGUE.md](PILAR1_ANALISES_TECHDENGUE.md)**
   - Análises exclusivas dos dados TechDengue
   - 4 níveis: Descritivas, Geoespaciais, Estatísticas, Operacionais
   - Foco: Caracterizar e otimizar operações

2. **[PILAR2_ANALISES_DENGUE.md](PILAR2_ANALISES_DENGUE.md)**
   - Análises exclusivas dos dados de dengue
   - 5 níveis: Epidemiológicas básicas, Avançadas, Comparativas, Especializadas, Estatísticas
   - Foco: Entender epidemia e identificar padrões

3. **[PILAR3_ANALISES_INTEGRADAS.md](PILAR3_ANALISES_INTEGRADAS.md)**
   - Análises cruzadas (Dengue + TechDengue)
   - 6 níveis: Correlação, Espaciais, Temporais, Efetividade, Preditivas, Avançadas
   - Foco: **Avaliar impacto das intervenções**

---

## 🎯 Visão Geral por Pilar

### PILAR 1: TechDengue (Operacional)
```
Dados: 1.977 atividades, 624 municípios, 314.880 POIs

Níveis de Análise:
├── 1. Descritivas Básicas
│   ├── KPIs gerais
│   ├── Temporal/sazonalidade
│   ├── Por contratante
│   └── Categorias de POIs
│
├── 2. Geoespaciais
│   ├── Mapas e distribuição
│   ├── Clustering e hot spots
│   └── Análise regional
│
├── 3. Estatísticas Avançadas
│   ├── Correlações
│   ├── Regressão
│   ├── Séries temporais
│   └── Clustering
│
└── 4. Operacionais
    ├── Eficiência e performance
    ├── Qualidade dos dados
    └── Produtividade

Total: ~40 tipos de análises
```

### PILAR 2: Dengue (Epidemiológico)
```
Dados: 124.684 registros, 853 municípios, 2.228.381 casos

Níveis de Análise:
├── 1. Epidemiológicas Básicas
│   ├── Estatísticas gerais
│   ├── Curva epidêmica
│   └── Distribuição espacial
│
├── 2. Epidemiológicas Avançadas
│   ├── Análise de risco
│   ├── Modelagem preditiva
│   ├── Ondas epidêmicas
│   └── Tendências
│
├── 3. Comparativas
│   ├── Benchmarking municipal
│   └── Desigualdade
│
├── 4. Especializadas
│   ├── Análise de surtos
│   ├── Sazonalidade avançada
│   └── Vulnerabilidade
│
└── 5. Estatísticas Avançadas
    ├── Testes de hipóteses
    ├── Modelos hierárquicos
    └── Análise de sobrevivência

Total: ~45 tipos de análises
```

### PILAR 3: Integrado (Impacto) ⭐
```
Dados: Cruzamento completo (analise_integrada.parquet)

Níveis de Análise:
├── 1. Correlação e Associação
│   ├── Correlação simples
│   ├── Antes-depois
│   └── Causalidade (DiD, PSM)
│
├── 2. Espaciais Integradas
│   ├── Mapas comparativos
│   ├── Spillover (vizinhança)
│   └── Clustering integrado
│
├── 3. Temporais Integradas
│   ├── Séries cruzadas (CCF, VAR)
│   └── Análise de defasagem
│
├── 4. Efetividade
│   ├── Custo-efetividade
│   ├── Eficiência por tipo
│   └── Heterogeneidade
│
├── 5. Preditivas e Prescritivas
│   ├── Modelos preditivos
│   ├── Otimização de recursos
│   └── Impacto de longo prazo
│
└── 6. Avançadas Especializadas
    ├── Mediação/Moderação
    ├── Análise Bayesiana
    └── Análise de rede

Total: ~50 tipos de análises
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Fundação (Semana 1-2) ✅ CONCLUÍDO
- [x] Estruturar base de dados integrada
- [x] Sistema de validação e integridade
- [x] Correlação de códigos IBGE
- [x] Documentação da estratégia

### Fase 2: Análises Exploratórias (Semana 3-4)
**Objetivo:** Entender os dados

#### PILAR 1 - TechDengue
- [ ] 1.1 KPIs gerais e dashboard
- [ ] 1.2 Análise temporal (evolução, sazonalidade)
- [ ] 1.3 Análise por contratante
- [ ] 1.4 Distribuição de categorias POIs
- [ ] 2.1 Mapas de distribuição espacial

#### PILAR 2 - Dengue
- [ ] 1.1 Estatísticas gerais por ano
- [ ] 1.2 Curvas epidêmicas (2023, 2024, 2025)
- [ ] 1.3 Mapas de incidência
- [ ] 2.1 Análise de risco por população/densidade

### Fase 3: Análises de Impacto (Semana 5-6) ⭐ PRIORITÁRIO
**Objetivo:** Avaliar efetividade TechDengue

#### PILAR 3 - Integrado
- [ ] 1.1 Correlação simples (POIs vs casos)
- [ ] 1.2 Análise antes-depois (2023 vs 2024)
- [ ] 1.3 Difference-in-Differences
- [ ] 2.1 Mapas comparativos (bivariados)
- [ ] 4.1 Estimativa de casos evitados

**Entregáveis:**
- Relatório executivo de impacto
- Visualizações principais
- Métricas de efetividade

### Fase 4: Análises Geoespaciais (Semana 7-8)
**Objetivo:** Padrões espaciais e otimização territorial

#### Todos os Pilares
- [ ] Hot spots e clustering
- [ ] Análise de cobertura e lacunas
- [ ] Spillover (efeito vizinhança)
- [ ] Mapas interativos (dashboard)

### Fase 5: Análises Avançadas (Semana 9-12)
**Objetivo:** Modelagem e previsão

#### Estatísticas e ML
- [ ] Modelos de regressão múltipla
- [ ] Séries temporais (ARIMA, Prophet)
- [ ] Machine Learning (Random Forest, XGBoost)
- [ ] Modelos espaciais

#### Otimização
- [ ] Cenários "what-if"
- [ ] Otimização de alocação de recursos
- [ ] Análise custo-efetividade

### Fase 6: Produtos Finais (Semana 13-14)
**Objetivo:** Consolidar e comunicar

- [ ] Dashboard interativo completo
- [ ] Relatório técnico detalhado
- [ ] Apresentação executiva
- [ ] Artigo científico (opcional)

---

## 📊 Análises por Tipo

### 🔵 Análises Descritivas (Básicas)
**Quando usar:** Entender "o que aconteceu"
- Estatísticas gerais
- Distribuições
- Tendências temporais
- Padrões espaciais

**Ferramentas:** pandas, matplotlib, seaborn

### 🟢 Análises Inferenciais (Intermediárias)
**Quando usar:** Testar hipóteses, identificar relações
- Correlações
- Testes estatísticos
- Regressão
- ANOVA

**Ferramentas:** scipy, statsmodels

### 🟡 Análises Preditivas (Avançadas)
**Quando usar:** Prever "o que vai acontecer"
- Séries temporais
- Machine Learning
- Modelos espaciais

**Ferramentas:** scikit-learn, prophet, xgboost, geopandas

### 🔴 Análises Prescritivas (Especializadas)
**Quando usar:** Decidir "o que fazer"
- Otimização
- Cenários
- Simulação
- Análise de decisão

**Ferramentas:** scipy.optimize, pulp, simpy

---

## 🛠️ Stack Tecnológico Recomendado

### Core
```python
pandas>=2.0.0          # Manipulação de dados
numpy>=1.24.0          # Computação numérica
pyarrow>=14.0.0        # Leitura Parquet
```

### Visualização
```python
matplotlib>=3.7.0      # Gráficos básicos
seaborn>=0.12.0        # Gráficos estatísticos
plotly>=5.14.0         # Gráficos interativos
folium>=0.14.0         # Mapas interativos
```

### Estatística
```python
scipy>=1.10.0          # Testes estatísticos
statsmodels>=0.14.0    # Modelos estatísticos
scikit-learn>=1.3.0    # Machine Learning
```

### Geoespacial
```python
geopandas>=0.13.0      # Análise espacial
shapely>=2.0.0         # Geometrias
pysal>=2.7.0           # Econometria espacial
```

### Séries Temporais
```python
prophet>=1.1.0         # Previsão (Facebook)
pmdarima>=2.0.0        # Auto-ARIMA
```

### Otimização
```python
pulp>=2.7.0            # Programação linear
scipy.optimize         # Otimização geral
```

---

## 📈 Métricas de Sucesso

### Para Análises TechDengue (Pilar 1)
- ✅ Dashboard operacional funcional
- ✅ Identificação de padrões sazonais
- ✅ Benchmarking de contratantes
- ✅ Otimização de produtividade

### Para Análises Dengue (Pilar 2)
- ✅ Curvas epidêmicas por ano
- ✅ Identificação de hot spots
- ✅ Modelo preditivo com R² > 0.7
- ✅ Ranking de municípios de risco

### Para Análises Integradas (Pilar 3) ⭐
- ✅ **Correlação significativa identificada (p < 0.05)**
- ✅ **Estimativa de casos evitados**
- ✅ **Efeito causal estabelecido (DiD)**
- ✅ **Recomendações de otimização**

---

## 🎓 Boas Práticas

### 1. Sempre Validar
```python
# Antes de qualquer análise
df = carregar_validado('analise_integrada')
# ✓ Hash verificado
# ✓ Invariantes validados
# ✓ Dados íntegros
```

### 2. Documentar Premissas
```python
# Explicitar premissas
"""
PREMISSAS:
1. Códigos IBGE correlacionados com 98,9% de precisão
2. Efeito da intervenção pode ter lag de 1-3 meses
3. Municípios sem atividades servem como controle
"""
```

### 3. Reportar Incerteza
```python
# Sempre incluir intervalos de confiança
print(f"Casos evitados: {media:.0f} (IC 95%: {ic_lower:.0f} - {ic_upper:.0f})")
```

### 4. Visualizar Sempre
```python
# Uma imagem vale mais que mil números
# Sempre criar visualizações para comunicar resultados
```

### 5. Testar Robustez
```python
# Análise de sensibilidade
# Testar com diferentes parâmetros
# Verificar se conclusões se mantêm
```

---

## 📞 Próximos Passos

### Imediato (Esta Semana)
1. Revisar os 3 documentos de pilares
2. Priorizar análises mais importantes
3. Configurar ambiente (instalar bibliotecas)
4. Começar Fase 2 (Exploratórias)

### Curto Prazo (Próximas 2 Semanas)
1. Implementar análises prioritárias do Pilar 3
2. Criar primeiros dashboards
3. Gerar relatório preliminar de impacto

### Médio Prazo (Próximo Mês)
1. Completar análises geoespaciais
2. Desenvolver modelos preditivos
3. Otimização de recursos

### Longo Prazo (Próximos 3 Meses)
1. Dashboard completo e automatizado
2. Relatório técnico final
3. Publicação científica (se aplicável)

---

## 📚 Recursos Adicionais

### Tutoriais Recomendados
- Geopandas: https://geopandas.org/
- Prophet: https://facebook.github.io/prophet/
- Spatial Analysis: https://pysal.org/

### Livros
- "Python for Data Analysis" - Wes McKinney
- "Forecasting: Principles and Practice" - Hyndman & Athanasopoulos
- "Spatial Analysis" - O'Sullivan & Unwin

### Cursos
- Coursera: Applied Data Science with Python
- DataCamp: Geospatial Data Analysis
- Kaggle: Time Series Analysis

---

**Última atualização:** 30 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 📘 Documentação Completa

---

*"A análise de dados não é sobre números, é sobre histórias que os números contam."*
