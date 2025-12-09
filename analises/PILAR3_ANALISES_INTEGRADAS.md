# 📊 PILAR 3: Análises Integradas (Dengue + TechDengue)

## 📋 Objetivo Central
**Avaliar o impacto das atividades TechDengue nos casos de dengue**

Questões-chave:
- Existe correlação entre atividades TechDengue e casos de dengue?
- As intervenções reduziram os casos?
- Qual o efeito temporal (imediato, defasado)?
- Quais tipos de intervenção são mais efetivos?
- Existe efeito espacial (vizinhança)?

---

## 🎯 NÍVEL 1: Análises de Correlação e Associação

### 1.1 Correlação Simples
**Objetivo:** Existe relação entre atividades e casos?

**Análises:**

#### A. Correlação Contemporânea (2024)
```python
# Hipóteses
H0: Não há correlação entre atividades TechDengue e casos de dengue
H1: Existe correlação (positiva? negativa?)

# Variáveis
- Casos dengue 2024 vs Total POIs
- Casos dengue 2024 vs Total devolutivas
- Casos dengue 2024 vs Hectares mapeados
- Casos dengue 2024 vs Taxa de conversão

# Métodos
- Correlação de Pearson (linear)
- Correlação de Spearman (não-paramétrica)
- Teste de significância (p-value)
```

#### B. Correlação por Subgrupo
```python
# Apenas municípios com atividades (624)
- Correlação mais forte?
- Padrões diferentes?

# Por macrorregião
- Correlação varia geograficamente?
- Heterogeneidade regional

# Por faixa populacional
- Pequenos vs grandes municípios
- Efeito diferenciado?
```

#### C. Correlação com Lag Temporal
```python
# Considerar defasagem
- Atividades em t-1 vs Casos em t
- Atividades em t-2 vs Casos em t
- Qual lag é mais significativo?

# Exemplo
- Atividades Abr-Jun/2024 vs Casos Jul-Set/2024
- Efeito não é imediato
```

**Visualizações:**
- Scatter plots com linha de regressão
- Heatmap de correlações
- Gráficos de lag

---

### 1.2 Análise Antes-Depois
**Objetivo:** Avaliar impacto temporal das intervenções

**Análises:**

#### A. Comparação Temporal Simples
```python
# Para municípios que receberam atividades em 2024
- Casos 2023 (antes)
- Casos 2024 (durante)
- Casos 2025 (depois)

# Métricas
- Variação absoluta (casos 2024 - casos 2023)
- Variação relativa (%)
- Teste t pareado
```

#### B. Grupo Controle (Quasi-Experimental)
```python
# Tratados
- Municípios com atividades TechDengue (624)

# Controles
- Municípios SEM atividades (229)
- Características similares (matching)

# Comparação
- Evolução dos tratados vs controles
- Difference-in-Differences (DiD)
```

#### C. Análise por Intensidade
```python
# Estratificar por intensidade de intervenção
- Baixa (< 25 percentil de POIs)
- Média (25-75 percentil)
- Alta (> 75 percentil)

# Comparar
- Dose-resposta
- Maior intensidade = maior redução?
```

**Visualizações:**
- Gráficos de linha (antes-depois)
- Box plots (distribuições)
- Gráficos de barras (variação %)

---

### 1.3 Análise de Causalidade
**Objetivo:** Estabelecer relação causal (não apenas correlação)

**Análises:**

#### A. Propensity Score Matching
```python
# Matching
- Parear tratados e controles por características
- População, densidade, casos 2023, região

# Comparação
- Casos 2024 entre pareados
- Efeito médio do tratamento (ATT)
```

#### B. Difference-in-Differences (DiD)
```python
# Modelo
ΔCasos = β0 + β1*Tratado + β2*Pós + β3*(Tratado×Pós) + ε

# Interpretação
- β3 = efeito causal da intervenção
- Controla tendências temporais
- Controla diferenças fixas entre grupos
```

#### C. Regressão Descontínua
```python
# Se houver critério de elegibilidade
- Municípios com >X casos receberam intervenção
- Comparar municípios logo acima vs logo abaixo do cutoff
```

---

## 🎯 NÍVEL 2: Análises Espaciais Integradas

### 2.1 Mapas Comparativos
**Objetivo:** Visualizar relação espacial

**Análises:**

#### A. Mapas Lado a Lado
```python
# Mapa 1: Intensidade TechDengue
- POIs por município
- Colorir por quartil

# Mapa 2: Incidência Dengue
- Taxa de incidência 2024
- Colorir por quartil

# Análise visual
- Áreas com alta intervenção têm baixa incidência?
- Padrões espaciais coincidem?
```

#### B. Mapa Bivariate
```python
# Combinar duas variáveis em um mapa
- Eixo X: Intensidade TechDengue (baixa, média, alta)
- Eixo Y: Incidência Dengue (baixa, média, alta)
- 9 categorias (3×3)

# Cores
- Azul escuro: Alta intervenção + Baixa dengue (sucesso!)
- Vermelho escuro: Baixa intervenção + Alta dengue (risco!)
```

#### C. Mapas de Mudança
```python
# Variação 2023 → 2024
- Municípios com redução (verde)
- Municípios com aumento (vermelho)
- Sobrepor atividades TechDengue

# Análise
- Municípios com atividades reduziram mais?
```

---

### 2.2 Análise de Spillover (Efeito Vizinhança)
**Objetivo:** Intervenção em A afeta B vizinho?

**Análises:**

#### A. Spatial Lag Model
```python
# Modelo
Casos_i = β0 + β1*POIs_i + β2*Σ(Casos_vizinhos) + ε

# Interpretação
- β1: Efeito direto (no próprio município)
- β2: Efeito indireto (vizinhança)
```

#### B. Buffer Analysis
```python
# Para cada município com intervenção
- Criar buffer de 50km
- Comparar casos dentro vs fora do buffer
- Existe efeito de proximidade?
```

#### C. Spatial Durbin Model
```python
# Incluir lag espacial das variáveis explicativas
Casos_i = β0 + β1*POIs_i + β2*Σ(POIs_vizinhos) + β3*Σ(Casos_vizinhos) + ε

# Captura
- Efeito direto
- Efeito indireto (spillover)
- Efeito total
```

---

### 2.3 Clustering Integrado
**Objetivo:** Identificar padrões espaciais conjuntos

**Análises:**

#### A. Bivariate Moran's I
```python
# Autocorrelação espacial bivariada
- Correlação entre POIs em i e Casos em vizinhos de i
- Existe padrão espacial cruzado?

# Interpretação
- Positivo: Alta intervenção cercada por baixos casos
- Negativo: Alta intervenção cercada por altos casos
```

#### B. Geographically Weighted Regression
```python
# Coeficientes variam espacialmente
- Efeito de POIs sobre casos varia por região?
- Mapear coeficientes locais
- Identificar onde intervenção é mais efetiva
```

---

## 🎯 NÍVEL 3: Análises Temporais Integradas

### 3.1 Análise de Séries Temporais Cruzadas
**Objetivo:** Relação temporal entre intervenções e casos

**Análises:**

#### A. Cross-Correlation Function (CCF)
```python
# Correlação cruzada com lags
- Lag 0: Correlação contemporânea
- Lag 1: Atividades em t-1 vs Casos em t
- Lag 2, 3, ...

# Identificar
- Qual lag tem maior correlação?
- Tempo de efeito da intervenção
```

#### B. Vector Autoregression (VAR)
```python
# Modelo multivariado
- Casos e POIs se influenciam mutuamente?
- Causalidade de Granger
- Impulse Response Functions

# Interpretação
- Choque em POIs → impacto em Casos?
- Quanto tempo dura o efeito?
```

#### C. Análise de Intervenção (ARIMA)
```python
# Modelo ARIMA com variável de intervenção
Casos_t = ARIMA(p,d,q) + β*Intervenção_t + ε

# Tipos de intervenção
- Pulse (efeito pontual)
- Step (mudança de nível)
- Ramp (mudança gradual)
```

---

### 3.2 Análise de Defasagem (Lag Analysis)
**Objetivo:** Quanto tempo leva para ver efeito?

**Análises:**

#### A. Distributed Lag Model
```python
# Efeito distribuído no tempo
Casos_t = β0 + β1*POIs_t + β2*POIs_(t-1) + β3*POIs_(t-2) + ... + ε

# Interpretação
- Efeito imediato (β1)
- Efeito defasado (β2, β3, ...)
- Efeito acumulado (Σβ)
```

#### B. Optimal Lag Selection
```python
# Determinar lag ótimo
- AIC (Akaike Information Criterion)
- BIC (Bayesian Information Criterion)
- Cross-validation

# Resultado
- Efeito máximo em t-X semanas/meses
```

---

## 🎯 NÍVEL 4: Análises de Efetividade

### 4.1 Análise Custo-Efetividade
**Objetivo:** Avaliar retorno do investimento

**Análises:**

#### A. Casos Evitados
```python
# Estimar casos que teriam ocorrido sem intervenção
- Baseado em tendência 2023
- Baseado em grupo controle
- Baseado em modelo preditivo

# Calcular
Casos evitados = Casos esperados - Casos observados

# Validação
- Intervalo de confiança
- Análise de sensibilidade
```

#### B. Custo por Caso Evitado
```python
# Se custo disponível
Custo por caso evitado = Custo total intervenção / Casos evitados

# Comparar
- Com outras intervenções de saúde pública
- Com custo de tratamento de dengue
- Análise de viabilidade
```

#### C. QALY (Quality-Adjusted Life Years)
```python
# Se dados de qualidade de vida disponíveis
- Anos de vida ajustados por qualidade ganhos
- Custo por QALY
- Comparação com threshold de custo-efetividade
```

---

### 4.2 Análise de Eficiência
**Objetivo:** Quais intervenções são mais eficientes?

**Análises:**

#### A. Por Tipo de POI
```python
# Para cada categoria de POI
- Correlação com redução de casos
- Quais categorias mais importantes?

# Priorização
- Focar em categorias mais efetivas
- Otimizar recursos
```

#### B. Por Tipo de Atividade
```python
# Comparar
- Mapeamento vs Tratamento
- Diferentes sub-atividades
- Qual tem maior impacto?
```

#### C. Por Intensidade
```python
# Dose-resposta
- Relação entre intensidade e efeito
- Existe limiar mínimo?
- Existe saturação (mais não ajuda)?

# Otimização
- Intensidade ótima
- Maximizar impacto com recursos limitados
```

---

### 4.3 Análise de Heterogeneidade
**Objetivo:** Efeito varia por contexto?

**Análises:**

#### A. Por Características Municipais
```python
# Estratificar por
- Tamanho populacional
- Densidade
- Região
- Nível socioeconômico (se disponível)

# Análise
- Efeito maior em pequenos municípios?
- Efeito maior em áreas densas?
- Interações
```

#### B. Por Nível Basal de Dengue
```python
# Municípios com alta vs baixa incidência em 2023
- Efeito diferente?
- Intervenção mais efetiva onde dengue é pior?
```

#### C. Por Timing da Intervenção
```python
# Intervenções antes vs durante pico
- Timing importa?
- Intervenção preventiva vs reativa
```

---

## 🎯 NÍVEL 5: Análises Preditivas e Prescritivas

### 5.1 Modelos Preditivos Integrados
**Objetivo:** Prever casos futuros considerando intervenções

**Análises:**

#### A. Modelo de Regressão Múltipla
```python
# Variáveis
Casos_2025 = f(
    Casos_2024,
    POIs_2024,
    Devolutivas_2024,
    População,
    Densidade,
    Região,
    ...
)

# Validação
- Train/test split
- Cross-validation
- Métricas (R², RMSE, MAE)
```

#### B. Machine Learning
```python
# Algoritmos
- Random Forest
- Gradient Boosting (XGBoost, LightGBM)
- Neural Networks

# Feature importance
- Quais variáveis mais importantes?
- POIs, devolutivas, ou outras?
```

#### C. Cenários "What-If"
```python
# Simular
- Se dobrarmos POIs, quantos casos evitamos?
- Se expandirmos para todos os 853 municípios?
- Se focarmos apenas nos top 10% de risco?

# Análise de sensibilidade
- Variação nos parâmetros
- Robustez das conclusões
```

---

### 5.2 Otimização de Recursos
**Objetivo:** Onde alocar recursos para máximo impacto?

**Análises:**

#### A. Programação Linear
```python
# Objetivo
Maximizar: Casos evitados

# Restrições
- Orçamento limitado
- Capacidade operacional
- Cobertura mínima por região

# Solução
- Alocação ótima de recursos
- Quais municípios priorizar
```

#### B. Análise de Portfólio
```python
# Trade-offs
- Eficiência vs Equidade
- Concentrar em poucos vs Dispersar
- Curto prazo vs Longo prazo

# Fronteira de Pareto
- Soluções ótimas
- Não é possível melhorar um sem piorar outro
```

---

### 5.3 Análise de Impacto de Longo Prazo
**Objetivo:** Efeitos além do imediato

**Análises:**

#### A. Modelagem Dinâmica
```python
# Considerar
- Efeitos cumulativos
- Feedback loops
- Mudanças comportamentais

# System Dynamics
- Modelo de compartimentos
- Simulação de longo prazo (5-10 anos)
```

#### B. Análise de Sustentabilidade
```python
# Questões
- Efeito persiste após intervenção?
- Necessidade de manutenção?
- Custo de longo prazo
```

---

## 🎯 NÍVEL 6: Análises Avançadas Especializadas

### 6.1 Análise de Mediação
**Objetivo:** Como a intervenção funciona?

```python
# Modelo
TechDengue → POIs identificados → Tratamento → Redução casos

# Análise
- Efeito direto vs indireto
- Mediadores importantes
- Mecanismo de ação
```

### 6.2 Análise de Moderação
**Objetivo:** Quando a intervenção funciona melhor?

```python
# Moderadores
- Características municipais
- Timing
- Intensidade basal de dengue

# Interações
- Efeito de POIs moderado por densidade
- Efeito de devolutivas moderado por população
```

### 6.3 Análise Bayesiana
**Objetivo:** Incorporar incerteza e conhecimento prévio

```python
# Prior
- Conhecimento de estudos anteriores
- Expectativas sobre efeito

# Posterior
- Atualizar crenças com dados
- Probabilidade de efeito positivo

# Vantagens
- Quantificar incerteza
- Inferência mais robusta
```

### 6.4 Análise de Rede
**Objetivo:** Estrutura de conexões entre municípios

```python
# Rede
- Nós: Municípios
- Arestas: Contiguidade ou fluxo

# Métricas
- Centralidade
- Comunidades
- Difusão de dengue pela rede

# Análise
- Municípios centrais são mais importantes?
- Intervenção em hubs tem efeito maior?
```

---

## 📊 Resumo de Prioridades

### 🔴 Análises Prioritárias (Fazer Primeiro)
1. Correlação simples (Nível 1.1)
2. Análise antes-depois (Nível 1.2)
3. Mapas comparativos (Nível 2.1)
4. Casos evitados (Nível 4.1.A)

### 🟡 Análises Intermediárias (Fazer em Seguida)
5. Difference-in-Differences (Nível 1.3.B)
6. Análise de spillover (Nível 2.2)
7. Cross-correlation (Nível 3.1.A)
8. Eficiência por tipo de POI (Nível 4.2.A)

### 🟢 Análises Avançadas (Fazer Depois)
9. Machine Learning (Nível 5.1.B)
10. Otimização de recursos (Nível 5.2)
11. Análise Bayesiana (Nível 6.3)
12. Análise de rede (Nível 6.4)

---

Ver documentos complementares:
- `PILAR1_ANALISES_TECHDENGUE.md`
- `PILAR2_ANALISES_DENGUE.md`
- `EXEMPLOS_CODIGO_COMPLETO.md`
- `ROADMAP_IMPLEMENTACAO.md`
