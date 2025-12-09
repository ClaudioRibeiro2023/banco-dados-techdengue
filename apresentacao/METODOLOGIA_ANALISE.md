# 📐 METODOLOGIA DE ANÁLISE - CONSÓRCIO CISARP

**Versão:** 1.0  
**Data:** Novembro 2025  
**Objetivo:** Framework analítico completo para apresentação ao CISARP

---

## 🎯 VISÃO GERAL

Esta metodologia estrutura a análise dos dados do CISARP em **5 fases sequenciais**, garantindo rigor científico, insights acionáveis e comunicação efetiva dos resultados.

---

## 📊 FASE 1: VALIDAÇÃO E QUALIDADE DOS DADOS

### Objetivo
Garantir integridade, completude e qualidade das bases antes da análise.

### Atividades

#### 1.1 Validação das Bases Excel
```python
# Checklist de validação
✓ Verificar número de registros esperados
✓ Validar formato do código IBGE (7 dígitos, inicia com 31)
✓ Verificar valores missing e percentuais
✓ Detectar outliers e valores inconsistentes
✓ Validar tipos de dados (int, float, datetime, string)
✓ Verificar duplicatas
```

#### 1.2 Validação de Relacionamentos
```python
# Chave de integração: Código IBGE
✓ Verificar existência de códigos em todas as bases
✓ Validar cardinalidade (1:1, 1:N)
✓ Identificar municípios sem correspondência
✓ Calcular taxa de correlação entre bases
```

#### 1.3 Validação Específica CISARP
```python
✓ Confirmar 71 atividades registradas
✓ Listar municípios únicos do consórcio
✓ Verificar completude de dados críticos:
  - DATA_MAP (datas de mapeamento)
  - POIS (totais de POIs)
  - HECTARES_MAPEADOS (área coberta)
  - DEVOLUTIVAS (entregas realizadas)
✓ Validar coordenadas geográficas (se aplicável)
```

### Entregas da Fase 1
- ✅ **Relatório de Qualidade de Dados** (PDF)
- ✅ **Log de Validações** (TXT/JSON)
- ✅ **Score de Qualidade** (0-100)
- ✅ **Decisão Go/No-Go** para análise

### Critérios de Aceitação
- Score de qualidade ≥ 85%
- Taxa de missing em campos críticos < 5%
- Correlação de códigos IBGE ≥ 95%

---

## 🔍 FASE 2: ANÁLISE EXPLORATÓRIA DE DADOS (EDA)

### Objetivo
Compreender a estrutura, distribuições e padrões dos dados do CISARP.

### 2.1 Estatísticas Descritivas

#### Variáveis Contínuas
```python
Métricas por variável:
- Média, mediana, desvio padrão
- Mínimo, máximo, quartis (Q1, Q3)
- Coeficiente de variação
- Outliers (método IQR)

Variáveis:
- POIS totais
- HECTARES_MAPEADOS
- DEVOLUTIVAS
- Casos de dengue
- População municipal
```

#### Variáveis Categóricas
```python
Análises:
- Frequência absoluta e relativa
- Distribuição por município
- Distribuição por categoria de POI
- Status das atividades

Variáveis:
- Municípios
- Categorias de POIs (34 tipos)
- Status de tratamento
```

### 2.2 Análise Temporal

```python
Timeline das atividades:
- Primeira atividade CISARP
- Última atividade CISARP
- Distribuição mensal/trimestral
- Períodos de alta/baixa atividade
- Comparação com períodos epidemiológicos

Métricas:
- Dias totais de operação
- Taxa de atividades/mês
- Sazonalidade (se detectável)
```

### 2.3 Análise Geográfica

```python
Distribuição espacial:
- Mapa dos municípios CISARP
- Densidade de atividades por município
- Cobertura territorial (% do consórcio)
- Municípios sem atividades

Métricas:
- Hectares mapeados por município
- POIs por km²
- Densidade populacional vs. atividades
```

### 2.4 Análise de Categorias de POIs

```python
Top 10 categorias:
- Ranking por frequência
- Distribuição percentual
- Comparação com médias estaduais

Categorias críticas:
- Criadouros de alto risco (ex: terrenos baldios, caixas d'água)
- Oportunidades de intervenção
```

### Entregas da Fase 2
- ✅ **Relatório EDA Completo** (PDF, 10-15 páginas)
- ✅ **Dataset limpo e enriquecido** (CSV/Parquet)
- ✅ **Visualizações exploratórias** (20+ gráficos)
- ✅ **Sumário executivo de insights** (2 páginas)

---

## 📈 FASE 3: ANÁLISES AVANÇADAS E INSIGHTS

### Objetivo
Gerar insights de alto valor para decisões estratégicas do CISARP.

### 3.1 Performance Operacional

#### Indicadores de Produtividade
```python
KPIs calculados:
1. POIs por hectare mapeado
2. Taxa de conversão devolutivas (devolutivas/POIs)
3. Atividades por município
4. Cobertura territorial (%)
5. Eficiência temporal (POIs/dia)

Análises:
- Ranking de municípios
- Identificação de best practices
- Municípios abaixo da média
- Oportunidades de melhoria
```

#### Benchmarking com Outros Consórcios
```python
Comparação CISARP vs:
- CISMAS (120 atividades)
- ICISMEP Divinópolis (122 atividades)
- ICISMEP BHTE (99 atividades)
- Média estadual

Métricas:
- POIs totais e per capita
- Hectares mapeados per capita
- Taxa de conversão devolutivas
- Qualidade dos dados (completude)
```

### 3.2 Impacto Epidemiológico

#### Correlação com Casos de Dengue
```python
Análises:
1. Casos de dengue nos municípios CISARP (2023-2025)
2. Incidência por 100.000 habitantes
3. Correlação temporal:
   - Antes das atividades TechDengue
   - Durante as atividades
   - Após as atividades
4. Municípios com maior/menor impacto

Técnicas:
- Correlação de Pearson/Spearman
- Análise de séries temporais
- Teste de hipóteses (t-test, ANOVA)
- Regressão linear simples
```

#### Identificação de Áreas Prioritárias
```python
Scoring de risco:
- Municípios com alta incidência + baixa cobertura
- Áreas com crescimento de casos
- Gaps de mapeamento

Output:
- Mapa de calor de risco
- Lista priorizada de municípios
- Recomendações de expansão
```

### 3.3 Análise de Efetividade

```python
Indicadores:
1. Efetividade Score = (devolutivas / POIs) × (1 - taxa_incidência_normalizada)
2. ROI Operacional = impacto estimado / recursos investidos
3. Cobertura vs. Necessidade

Segmentação:
- Municípios de alta/média/baixa efetividade
- Fatores de sucesso identificados
- Barreiras e desafios
```

### Entregas da Fase 3
- ✅ **Dashboard Interativo** (Streamlit/Power BI)
- ✅ **Relatório de Insights** (PDF, 15-20 páginas)
- ✅ **Base de KPIs** (JSON/Excel)
- ✅ **Mapas de calor e clustering** (PNG/HTML)
- ✅ **Análise de correlações** (gráficos + estatísticas)

---

## 📊 FASE 4: VISUALIZAÇÃO E COMUNICAÇÃO

### Objetivo
Transformar insights em narrativa visual impactante para apresentação.

### 4.1 Tipos de Visualizações

#### Gráficos Executivos (para apresentação)
```python
1. KPI Cards
   - Total de atividades CISARP
   - Total de POIs identificados
   - Hectares mapeados
   - Taxa de conversão devolutivas

2. Gráficos de Comparação
   - Ranking CISARP vs. outros consórcios (barras horizontais)
   - Evolução temporal (linhas)
   - Distribuição geográfica (mapa)

3. Gráficos de Performance
   - Top 10 municípios CISARP (barras)
   - Distribuição de categorias de POIs (pizza/treemap)
   - Heatmap de produtividade

4. Gráficos de Impacto
   - Scatter plot: POIs vs. Casos de dengue
   - Antes/Depois: incidência de dengue
   - Mapa de risco dengue
```

#### Dashboards Interativos
```python
Páginas:
1. Visão Geral CISARP
   - KPIs principais
   - Mapa do consórcio
   - Timeline de atividades

2. Performance por Município
   - Tabela ordenável
   - Filtros interativos
   - Drill-down por município

3. Análise de POIs
   - Distribuição por categoria
   - Heatmap de concentração
   - Tratamentos realizados

4. Impacto Epidemiológico
   - Séries temporais de casos
   - Correlações
   - Áreas prioritárias
```

### 4.2 Diretrizes de Design

```python
Paleta de cores:
- Primária: Azul (#0066CC) - CISARP
- Secundária: Verde (#28A745) - Sucesso/Impacto
- Alerta: Laranja (#FFA500) - Atenção
- Crítico: Vermelho (#DC3545) - Prioridade alta

Fontes:
- Títulos: Arial Bold, 18-24pt
- Corpo: Arial Regular, 12-14pt
- Dados: Courier New, 10-12pt

Layout:
- Margens: 2cm
- Espaçamento: 1.5x
- Logos: CISARP + TechDengue
```

### 4.3 Storytelling

#### Estrutura da Apresentação
```
1. CONTEXTO (2-3 slides)
   - Desafio da dengue em MG
   - Papel do CISARP
   - Objetivos da análise

2. METODOLOGIA (1 slide)
   - Bases de dados utilizadas
   - Período analisado
   - Técnicas aplicadas

3. RESULTADOS (8-10 slides)
   - KPIs principais (1 slide)
   - Performance operacional (2-3 slides)
   - Impacto epidemiológico (2-3 slides)
   - Benchmarking (1-2 slides)
   - Insights estratégicos (1 slide)

4. RECOMENDAÇÕES (2-3 slides)
   - Áreas prioritárias
   - Oportunidades de melhoria
   - Próximos passos

5. CONCLUSÃO (1 slide)
   - Principais takeaways
   - Call to action
```

### Entregas da Fase 4
- ✅ **Apresentação PowerPoint** (15-20 slides)
- ✅ **Dashboard web standalone** (HTML + JS)
- ✅ **Infográfico executivo** (PDF 1-2 páginas)
- ✅ **Banco de visualizações** (20+ imagens PNG/SVG)

---

## 📝 FASE 5: DOCUMENTAÇÃO E ENTREGA

### Objetivo
Garantir rastreabilidade, reprodutibilidade e uso futuro das análises.

### 5.1 Documentação Técnica

```markdown
Conteúdo:
1. Metodologia detalhada aplicada
2. Scripts Python utilizados (comentados)
3. Queries SQL executadas (se aplicável)
4. Fórmulas de cálculo de KPIs
5. Decisões analíticas e premissas
6. Limitações e ressalvas
```

### 5.2 Datasets Finais

```python
Entregas:
1. cisarp_completo.csv
   - Todos os dados CISARP enriquecidos
   - 71+ linhas × 60+ colunas

2. cisarp_metricas.json
   - KPIs calculados
   - Metadados da análise

3. cisarp_municipios.geojson
   - Dados geográficos
   - Para uso em GIS/mapas

4. cisarp_comparacao_consorcios.xlsx
   - Benchmarking completo
   - Formatação executiva
```

### 5.3 Relatório Executivo Final

```markdown
Estrutura (15-25 páginas):

1. SUMÁRIO EXECUTIVO (1 página)
   - Principais achados em bullets
   - 3-5 recomendações prioritárias

2. INTRODUÇÃO (2 páginas)
   - Contexto e objetivos
   - Metodologia resumida

3. ANÁLISE DESCRITIVA (5-7 páginas)
   - Caracterização do CISARP
   - Estatísticas principais
   - Visualizações

4. ANÁLISE DE PERFORMANCE (4-6 páginas)
   - KPIs operacionais
   - Benchmarking
   - Rankings

5. IMPACTO EPIDEMIOLÓGICO (3-5 páginas)
   - Correlações
   - Análise temporal
   - Mapas de risco

6. INSIGHTS E RECOMENDAÇÕES (3-4 páginas)
   - Insights estratégicos
   - Áreas de atenção
   - Plano de ação sugerido

7. ANEXOS (variável)
   - Tabelas completas
   - Metodologia detalhada
   - Glossário
```

### 5.4 Checklist de Entrega Final

```
Arquivos digitais:
□ Relatório executivo (PDF)
□ Apresentação PowerPoint (PPTX)
□ Dashboard interativo (HTML ou link)
□ Datasets (CSV, JSON, XLSX)
□ Visualizações (pasta ZIP com PNGs)
□ Código-fonte (Python scripts)
□ Documentação técnica (MD)

Qualidade:
□ Revisão ortográfica e gramatical
□ Validação de todos os números
□ Testes de links e referências
□ Aprovação de logos e marcas
□ Compatibilidade de formatos

Comunicação:
□ Email de entrega com sumário
□ Instruções de uso dos arquivos
□ Contato para dúvidas
□ Agendamento de apresentação (se aplicável)
```

### Entregas da Fase 5
- ✅ **Pacote completo de entrega** (ZIP estruturado)
- ✅ **Documentação técnica** (Markdown + PDF)
- ✅ **Datasets finais** (4+ formatos)
- ✅ **Relatório executivo** (PDF profissional)
- ✅ **Scripts reprodutíveis** (Python com requirements.txt)

---

## 🎯 CRONOGRAMA SUGERIDO

Para entrega esta semana:

| Fase | Duração | Atividades Principais |
|------|---------|------------------------|
| **Fase 1** | 2-3 horas | Validação completa das bases |
| **Fase 2** | 4-6 horas | EDA + visualizações exploratórias |
| **Fase 3** | 6-8 horas | Análises avançadas + insights |
| **Fase 4** | 4-6 horas | Criação de visualizações finais + apresentação |
| **Fase 5** | 2-4 horas | Documentação + compilação final |
| **TOTAL** | **18-27 horas** | Distribuível em 3-4 dias |

### Recomendação
- **Dia 1:** Fases 1 + 2 (validação + EDA)
- **Dia 2:** Fase 3 (análises avançadas)
- **Dia 3:** Fase 4 (visualizações + apresentação)
- **Dia 4:** Fase 5 (documentação + revisão final)

---

## 🛠️ FERRAMENTAS E BIBLIOTECAS

### Python Stack
```python
# Manipulação de dados
pandas==2.1.0
numpy==1.24.3
openpyxl==3.1.2

# Banco de dados
psycopg2-binary==2.9.7
sqlalchemy==2.0.20

# Visualização
matplotlib==3.7.2
seaborn==0.12.2
plotly==5.16.1

# Geoespacial
geopandas==0.14.0
folium==0.14.0

# Estatística
scipy==1.11.2
statsmodels==0.14.0

# Dashboard
streamlit==1.27.0

# Relatórios
reportlab==4.0.4
python-pptx==0.6.21
```

### Instalação
```bash
pip install -r apresentacao/requirements.txt
```

---

## 📊 MÉTRICAS DE SUCESSO DA ANÁLISE

### Qualidade Técnica
- [ ] Score de qualidade de dados ≥ 90%
- [ ] Cobertura de municípios CISARP = 100%
- [ ] Visualizações geradas ≥ 15
- [ ] Tempo de processamento < 10 minutos

### Impacto para o Cliente
- [ ] Insights acionáveis ≥ 5
- [ ] Recomendações específicas ≥ 3
- [ ] Benchmarking com ≥ 3 consórcios
- [ ] Aprovação na apresentação (feedback positivo)

### Reprodutibilidade
- [ ] Todos os scripts executam sem erros
- [ ] Documentação completa e clara
- [ ] Datasets exportados validados
- [ ] Código versionado (Git)

---

## 🔍 PRÓXIMAS AÇÕES

### Imediatas
1. Executar `01_validacao_dados.py`
2. Revisar relatório de qualidade
3. Decidir Go/No-Go para fase 2

### Curto Prazo
1. Implementar análises das fases 2-3
2. Gerar visualizações principais
3. Compilar insights preliminares

### Antes da Apresentação
1. Revisar todos os números
2. Praticar apresentação
3. Preparar Q&A antecipado

---

## 📚 REFERÊNCIAS

### Documentação do Sistema
- **Bases de Dados:** `../docs/BASES_DE_DADOS_DETALHADO.md`
- **Arquitetura:** `../docs/architecture/ARQUITETURA_DADOS_DEFINITIVA.md`
- **README Principal:** `../README.md`

### Metodologias Aplicadas
- Medallion Architecture (Databricks)
- CRISP-DM (Cross-Industry Standard Process for Data Mining)
- Data Quality Framework (Great Expectations)
- Statistical Process Control (SPC)

---

**Versão:** 1.0  
**Criado em:** Novembro 2025  
**Revisões:** Conforme necessário durante a análise  
**Status:** ✅ Aprovado para execução
