# 📊 PILAR 2: Análises Exclusivas Dengue

## 📋 Dados Disponíveis
- **124.684 registros** (município × semana × ano)
- **853 municípios** de Minas Gerais
- **3 anos:** 2023, 2024, 2025 (parcial)
- **52 semanas** epidemiológicas por ano
- **2.228.381 casos** totais
  - 2023: 402.919 casos
  - 2024: 1.668.016 casos (pico)
  - 2025: 157.446 casos (parcial)

---

## 🎯 NÍVEL 1: Análises Epidemiológicas Básicas

### 1.1 Estatísticas Gerais
**Objetivo:** Caracterizar a epidemia de dengue em MG

**Métricas:**
```python
# Volume
- Total de casos por ano
- Casos per capita
- Taxa de incidência (casos/100mil hab)
- Variação ano a ano (%)

# Distribuição
- Municípios afetados (com casos > 0)
- Média de casos por município
- Mediana de casos
- Concentração (top 10, top 20)

# Gravidade
- Municípios em situação de epidemia
- Taxa de ataque (% população infectada)
- Ranking de municípios mais afetados
```

**Visualizações:**
- Cards KPI (totais por ano)
- Gráficos de barras (comparação anual)
- Mapas coropléticos (incidência)

---

### 1.2 Análise Temporal (Curva Epidêmica)
**Objetivo:** Entender padrões temporais da dengue

**Análises:**

#### A. Curva Epidêmica Anual
```python
# Por semana epidemiológica
- Casos por semana em cada ano
- Identificar semana de pico
- Comparar anos (2023 vs 2024 vs 2025)

# Características da curva
- Início da temporada (primeira semana com >X casos)
- Pico (semana com mais casos)
- Fim da temporada
- Duração total
```

#### B. Sazonalidade
```python
# Padrões mensais
- Meses com mais casos (geralmente Jan-Abr)
- Período de baixa transmissão
- Variação sazonal

# Análise multi-anual
- Padrão se repete?
- Mudanças no timing do pico
- Antecipação ou atraso
```

#### C. Velocidade de Crescimento
```python
# Taxa de crescimento
- Crescimento semanal (%)
- Tempo de duplicação
- Velocidade de propagação

# Inflexão
- Quando a curva muda de direção?
- Ponto de máximo crescimento
- Desaceleração
```

**Visualizações:**
- Curvas epidêmicas sobrepostas (anos)
- Heatmap (semana × ano)
- Animação temporal
- Gráfico de velocidade

---

### 1.3 Análise Espacial
**Objetivo:** Mapear distribuição geográfica

**Análises:**

#### A. Mapas de Incidência
```python
# Casos absolutos
- Total de casos por município
- Ranking visual

# Taxa de incidência
- Casos por 100mil habitantes
- Normalizado por população
- Classificação (baixa, média, alta, muito alta)

# Variação temporal
- Mapas animados (evolução semanal/mensal)
- Comparação entre anos
```

#### B. Hot Spots (Análise de Cluster)
```python
# Autocorrelação espacial
- Moran's I global
- Existe padrão espacial?
- Significância estatística

# Hot spots locais
- Getis-Ord Gi*
- Identificar áreas de alto risco
- Cold spots (baixo risco)

# Clusters
- High-High (alto cercado por alto)
- Low-Low (baixo cercado por baixo)
- Outliers espaciais
```

#### C. Análise por Região de Saúde
```python
# Macrorregião
- Total de casos por macrorregião
- Taxa de incidência regional
- Ranking de macrorregiões

# Microrregião
- Detalhamento fino
- Variação intra-regional
- Identificar microrregiões críticas

# Desigualdades
- Coeficiente de variação
- Amplitude (máx - mín)
- Gini espacial
```

**Visualizações:**
- Mapas coropléticos (incidência)
- Mapas de hot spots (vermelho/azul)
- Cartogramas (distorção por casos)
- Mapas 3D (altura = casos)

---

## 🎯 NÍVEL 2: Análises Epidemiológicas Avançadas

### 2.1 Análise de Risco
**Objetivo:** Identificar fatores de risco e vulnerabilidades

**Análises:**

#### A. Estratificação por População
```python
# Categorias
- Pequenos (<10mil hab)
- Médios (10-50mil)
- Grandes (50-100mil)
- Muito grandes (>100mil)

# Comparação
- Taxa de incidência por categoria
- Existe diferença significativa?
- Teste estatístico (ANOVA)
```

#### B. Estratificação por Densidade
```python
# Urbano vs Rural
- Usar AREA_HA como proxy
- Densidade populacional
- Correlação com incidência

# Análise
- Áreas mais densas têm mais casos?
- Padrão linear ou não-linear?
```

#### C. Estratificação Geográfica
```python
# Norte vs Sul de MG
- Diferenças climáticas
- Padrões distintos?

# Altitude
- Municípios de baixa altitude
- Correlação com casos
```

---

### 2.2 Modelagem Preditiva
**Objetivo:** Prever surtos futuros

**Análises:**

#### A. Modelos de Séries Temporais
```python
# ARIMA
- Auto-Regressive Integrated Moving Average
- Prever próximas 8-12 semanas
- Intervalo de confiança

# SARIMA
- Incluir componente sazonal
- Capturar padrão anual

# Prophet
- Modelo do Facebook
- Sazonalidade múltipla
- Feriados e eventos
```

#### B. Modelos de Regressão
```python
# Variáveis preditoras
- População
- Densidade
- Casos do ano anterior (lag)
- Temperatura (se disponível)
- Pluviosidade (se disponível)

# Modelo
casos_2025 = f(casos_2024, população, densidade, ...)

# Validação
- Train/test split
- Validação cruzada
- Métricas (RMSE, MAE, R²)
```

#### C. Modelos Espaciais
```python
# Spatial Lag Model
- Considerar casos em municípios vizinhos
- Efeito de contágio

# Spatial Error Model
- Erros correlacionados espacialmente

# Geographically Weighted Regression
- Coeficientes variam espacialmente
```

---

### 2.3 Análise de Ondas Epidêmicas
**Objetivo:** Identificar e caracterizar ondas

**Análises:**

#### A. Detecção de Ondas
```python
# Critérios
- Aumento sustentado por N semanas
- Pico local
- Redução sustentada

# Identificar
- Quantas ondas por ano?
- Timing de cada onda
- Magnitude de cada onda
```

#### B. Caracterização
```python
# Para cada onda
- Data de início
- Data de pico
- Data de fim
- Duração total
- Casos totais
- Taxa de crescimento
- Municípios afetados
```

#### C. Comparação entre Ondas
```python
# Análise
- Primeira onda mais forte que segunda?
- Padrão se repete entre anos?
- Ondas estão mudando?
```

---

### 2.4 Análise de Tendências
**Objetivo:** Entender evolução de longo prazo

**Análises:**

#### A. Comparação Multi-anual
```python
# 2023 vs 2024 vs 2025
- Crescimento ou redução?
- Taxa de variação anual
- Projeção para 2026

# Teste de tendência
- Mann-Kendall
- Significância estatística
```

#### B. Tendência Municipal
```python
# Para cada município
- Casos 2023 → 2024 → 2025
- Classificar:
  - Melhorando (redução)
  - Piorando (aumento)
  - Estável
  - Errático

# Identificar
- Municípios com reversão
- Municípios em deterioração
- Sucessos (redução sustentada)
```

#### C. Projeções de Longo Prazo
```python
# Cenários
- Otimista (redução 20%)
- Realista (manutenção)
- Pessimista (aumento 20%)

# Impacto
- Casos esperados 2026-2028
- População em risco
- Recursos necessários
```

---

## 🎯 NÍVEL 3: Análises Comparativas

### 3.1 Benchmarking Municipal
**Objetivo:** Comparar municípios similares

**Análises:**

#### A. Peer Group Analysis
```python
# Agrupar por similaridade
- População similar (±20%)
- Região similar
- Densidade similar

# Comparar
- Taxa de incidência
- Evolução temporal
- Identificar outliers
```

#### B. Melhores e Piores
```python
# Top 10 melhores
- Menor incidência
- Maior redução ano a ano
- Controle mais efetivo

# Top 10 piores
- Maior incidência
- Maior crescimento
- Situação crítica

# Análise
- O que explica a diferença?
- Fatores de sucesso/fracasso
```

---

### 3.2 Análise de Desigualdade
**Objetivo:** Quantificar disparidades

**Análises:**

#### A. Coeficiente de Gini
```python
# Desigualdade na distribuição
- Gini = 0 (perfeita igualdade)
- Gini = 1 (máxima desigualdade)

# Interpretação
- Casos concentrados em poucos municípios?
- Evolução da desigualdade ao longo do tempo
```

#### B. Análise Pareto
```python
# Regra 80/20
- 20% dos municípios concentram quantos % dos casos?
- Identificar principais contribuidores

# Priorização
- Focar nos 20% críticos
- Maior impacto com menos recursos
```

#### C. Índice de Dissimilaridade
```python
# Quão desigual é a distribuição?
- Entre macrorregiões
- Entre microrregiões
- Temporal (mudanças na desigualdade)
```

---

## 🎯 NÍVEL 4: Análises Especializadas

### 4.1 Análise de Surtos
**Objetivo:** Detectar e caracterizar surtos

**Análises:**

#### A. Detecção de Surtos
```python
# Critérios
- Casos > média + 2*desvio padrão
- Aumento súbito (>50% em 1 semana)
- Persistência (>2 semanas)

# Identificar
- Municípios em surto
- Semana de início
- Duração do surto
```

#### B. Caracterização de Surtos
```python
# Para cada surto
- Magnitude (casos totais)
- Velocidade (taxa de crescimento)
- Duração
- População afetada
- Taxa de ataque
```

#### C. Análise de Propagação
```python
# Difusão espacial
- Município índice (primeiro)
- Direção de propagação
- Velocidade de propagação
- Municípios secundários
```

---

### 4.2 Análise de Sazonalidade Avançada
**Objetivo:** Modelar padrões sazonais complexos

**Análises:**

#### A. Decomposição STL
```python
# Seasonal-Trend decomposition using Loess
- Tendência suavizada
- Sazonalidade robusta
- Resíduo

# Análise
- Força da sazonalidade
- Mudanças na tendência
- Eventos anômalos
```

#### B. Análise Espectral
```python
# Fourier Transform
- Identificar periodicidades
- Ciclos dominantes
- Frequências significativas
```

#### C. Wavelet Analysis
```python
# Análise tempo-frequência
- Sazonalidade varia ao longo do tempo?
- Mudanças de regime
```

---

### 4.3 Análise de Vulnerabilidade
**Objetivo:** Identificar municípios vulneráveis

**Análises:**

#### A. Índice de Vulnerabilidade
```python
# Componentes
- Incidência histórica (peso 30%)
- Tendência (peso 20%)
- População em risco (peso 20%)
- Capacidade de resposta (peso 30%)

# Score
- 0-100
- Classificação (baixa, média, alta, crítica)
```

#### B. Mapeamento de Risco
```python
# Categorias
- Risco muito alto (score > 80)
- Risco alto (60-80)
- Risco médio (40-60)
- Risco baixo (< 40)

# Visualização
- Mapa de risco
- Priorização de intervenções
```

---

## 🎯 NÍVEL 5: Análises Estatísticas Avançadas

### 5.1 Testes de Hipóteses
```python
# Comparação de médias
- t-test (2 grupos)
- ANOVA (múltiplos grupos)
- Kruskal-Wallis (não-paramétrico)

# Comparação de proporções
- Chi-quadrado
- Teste exato de Fisher

# Tendências
- Mann-Kendall
- Regressão de Poisson
```

### 5.2 Modelos Hierárquicos
```python
# Multi-nível
- Nível 1: Semanas (dentro de municípios)
- Nível 2: Municípios (dentro de regiões)
- Nível 3: Regiões

# Análise
- Variância entre níveis
- Efeitos fixos e aleatórios
```

### 5.3 Análise de Sobrevivência
```python
# Tempo até surto
- Kaplan-Meier
- Cox proportional hazards
- Fatores de risco para surto
```

---

Ver documentos complementares:
- `PILAR1_ANALISES_TECHDENGUE.md`
- `PILAR3_ANALISES_INTEGRADAS.md`
- `EXEMPLOS_CODIGO_COMPLETO.md`
