# 🎯 GUIA ESTRATÉGICO DE ANÁLISE - TECHDENGUE

**Documento Executivo para Análise de Dados**  
**Versão:** 1.0 | **Data:** 31/10/2025

---

## 📋 ROADMAP DE ANÁLISES

### FASE 1: Diagnóstico (1-2 semanas)
**Objetivo:** Entender situação atual

✅ **Análises Essenciais:**
1. Perfil epidemiológico (incidência, ranking, curvas)
2. Perfil operacional (POIs, cobertura, produtividade)
3. Distribuição geográfica (mapas, regiões críticas)
4. Categorias de criadouros mais frequentes

**Entregas:**
- Dashboard descritivo
- Relatório executivo
- Mapas de calor

### FASE 2: Comparações (2-3 semanas)
**Objetivo:** Identificar padrões e mudanças

✅ **Análises Essenciais:**
1. Evolução temporal (2024 vs 2025)
2. Benchmarking regional
3. Correlação dengue × POIs
4. Categorias críticas de criadouros

**Entregas:**
- Análise comparativa
- Ranking de efetividade
- Insights de correlação

### FASE 3: Predição (3-4 semanas)
**Objetivo:** Antecipar riscos

✅ **Análises Essenciais:**
1. Modelo de previsão de surtos (ML)
2. Séries temporais (Prophet)
3. Priorização de municípios
4. Análise espacial (hotspots)

**Entregas:**
- Modelo preditivo
- Lista de municípios prioritários
- Mapa de risco

### FASE 4: Impacto (4-6 semanas)
**Objetivo:** Avaliar efetividade

✅ **Análises Essenciais:**
1. Análise antes-depois
2. Diferença-em-diferenças
3. ROI do programa
4. Recomendações estratégicas

**Entregas:**
- Relatório de impacto
- Evidências de efetividade
- Plano de ação

---

## 📊 TOP 10 ANÁLISES PRIORITÁRIAS

### 1. Mapa de Calor de Incidência
**Complexidade:** Baixa | **Tempo:** 2h | **Valor:** Alto

```python
import geopandas as gpd
import matplotlib.pyplot as plt

gdf = gpd.read_file('mg_municipios.shp')
gdf = gdf.merge(df_dengue[['codmun', 'incidencia']], on='codmun')

fig, ax = plt.subplots(figsize=(15, 10))
gdf.plot(column='incidencia', cmap='YlOrRd', legend=True, ax=ax)
plt.title('Incidência de Dengue - MG 2024')
plt.savefig('mapa_incidencia.png', dpi=300)
```

### 2. Ranking Top 20 Municípios
**Complexidade:** Baixa | **Tempo:** 30min | **Valor:** Alto

```python
top20 = df_dengue.nlargest(20, 'Total')[['Municipio', 'Total', 'incidencia']]
print(top20)
```

### 3. Evolução Temporal
**Complexidade:** Média | **Tempo:** 3h | **Valor:** Alto

```python
df_comp = pd.merge(
    df_2024[['codmun', 'Total']].rename(columns={'Total': 'casos_2024'}),
    df_2025[['codmun', 'Total']].rename(columns={'Total': 'casos_2025'}),
    on='codmun'
)
df_comp['variacao'] = ((df_comp['casos_2025'] - df_comp['casos_2024']) / df_comp['casos_2024']) * 100
```

### 4. Correlação Dengue × POIs
**Complexidade:** Média | **Tempo:** 2h | **Valor:** Muito Alto

```python
from scipy.stats import pearsonr

pois_mun = df_atividades.groupby('CODIGO IBGE')['POIS'].sum()
df_merged = df_dengue.merge(pois_mun, left_on='codmun', right_index=True)

corr, p_value = pearsonr(df_merged['POIS'], df_merged['Total'])
print(f"Correlação: {corr:.3f}, p-value: {p_value}")
```

### 5. Produtividade Operacional
**Complexidade:** Baixa | **Tempo:** 1h | **Valor:** Alto

```python
df_atividades['produtividade'] = df_atividades['POIS'] / df_atividades['HECTARES']
df_atividades['taxa_conversao'] = (df_atividades['DEVOLUTIVAS'] / df_atividades['POIS']) * 100

print(df_atividades[['CONTRATANTE', 'produtividade', 'taxa_conversao']].groupby('CONTRATANTE').mean())
```

### 6. Categorias Críticas
**Complexidade:** Média | **Tempo:** 2h | **Valor:** Alto

```python
categorias = ['TERRENO_BALDIO', 'CAIXA_DAGUA', 'EDIFICACAO_ABANDONADA', 'PISCINA']
for cat in categorias:
    if cat in df_atividades.columns:
        cat_total = df_atividades[cat].sum()
        print(f"{cat}: {cat_total:,} POIs")
```

### 7. Modelo Preditivo de Surtos
**Complexidade:** Alta | **Tempo:** 8h | **Valor:** Muito Alto

```python
from sklearn.ensemble import RandomForestClassifier

X = df[['populacao', 'densidade', 'total_pois']]
y = (df['incidencia'] > 300).astype(int)

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
```

### 8. Análise Espacial (Hotspots)
**Complexidade:** Alta | **Tempo:** 6h | **Valor:** Alto

```python
from libpysal.weights import Queen
from esda.moran import Moran

w = Queen.from_dataframe(gdf)
moran = Moran(gdf['incidencia'], w)
print(f"Moran's I: {moran.I:.4f}")
```

### 9. Séries Temporais
**Complexidade:** Alta | **Tempo:** 4h | **Valor:** Alto

```python
from prophet import Prophet

df_prophet = pd.DataFrame({'ds': dates, 'y': casos})
model = Prophet().fit(df_prophet)
forecast = model.predict(model.make_future_dataframe(periods=12, freq='W'))
```

### 10. Priorização de Municípios
**Complexidade:** Média | **Tempo:** 3h | **Valor:** Muito Alto

```python
# Score composto
df['prioridade'] = (
    df['incidencia_norm'] * 0.4 +
    df['crescimento_norm'] * 0.3 +
    df['vulnerabilidade_norm'] * 0.2 +
    (1 - df['cobertura_norm']) * 0.1
)
top_prioridade = df.nlargest(20, 'prioridade')
```

---

## 🔧 FERRAMENTAS RECOMENDADAS

### Python (Essencial)
```bash
pip install pandas numpy matplotlib seaborn
pip install scikit-learn scipy statsmodels
pip install geopandas libpysal esda
pip install prophet plotly
```

### Bancos de Dados
- **PostgreSQL + PostGIS** (dados GIS)
- **DuckDB** (análises rápidas)

### Visualização
- **Matplotlib/Seaborn** (plots estáticos)
- **Plotly** (interativos)
- **Streamlit** (dashboards)

### GIS
- **QGIS** (análise espacial)
- **GeoPandas** (Python)
- **Leaflet/Mapbox** (mapas web)

---

## 📚 REFERÊNCIAS E CONHECIMENTO EXTERNO

### Epidemiologia da Dengue
- **OMS:** Diretrizes de controle vetorial
- **Ministério da Saúde:** Boletins epidemiológicos
- **SES-MG:** Dados estaduais
- **Fiocruz:** Pesquisas sobre *Aedes aegypti*

### Métodos Estatísticos
- **Spatial Analysis:** Anselin (1988) - Spatial Econometrics
- **Time Series:** Hyndman & Athanasopoulos - Forecasting
- **Machine Learning:** Hastie et al. - Elements of Statistical Learning

### Controle Vetorial
- **Criadouros:** CDC guidelines
- **Categorização:** Literatura técnica PNCD
- **Efetividade:** Estudos de intervenção (meta-análises)

---

## 💡 INSIGHTS ESPERADOS

### Hipóteses a Testar

**H1:** Densidade de POIs está positivamente correlacionada com incidência de dengue
- **Método:** Correlação de Pearson/Spearman
- **Significância:** p < 0.05

**H2:** Municípios com mapeamento TechDengue apresentam redução de casos no ano seguinte
- **Método:** Diferença-em-diferenças
- **Controle:** Municípios sem mapeamento

**H3:** Categorias críticas (terrenos baldios, caixas d'água) têm maior associação com dengue
- **Método:** Regressão múltipla
- **Variável dependente:** Incidência

**H4:** Existe autocorrelação espacial (clusters de alta incidência)
- **Método:** Moran's I, Getis-Ord Gi*
- **Significância:** p < 0.05

**H5:** É possível prever surtos com 70%+ de acurácia
- **Método:** Random Forest, XGBoost
- **Métricas:** AUC-ROC, F1-score

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs Epidemiológicos
- Redução de 20% na incidência (ano a ano)
- Antecipação de surtos (4 semanas)
- Identificação de 90% dos hotspots

### KPIs Operacionais
- Cobertura de 80% dos municípios prioritários
- Taxa de conversão POI→Devolutiva > 70%
- Produtividade > 30 POIs/hectare

### KPIs Analíticos
- Atualização semanal dos dashboards
- 5+ análises críticas por trimestre
- Relatório executivo mensal

---

## 🚀 QUICK START

### Análise Básica em 15 Minutos

```python
import pandas as pd
import matplotlib.pyplot as plt

# 1. Carregar dados
df_dengue = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')
df_atividades = pd.read_excel('base_dados/dados_techdengue/Atividades Techdengue.xlsx')

# 2. Métricas rápidas
print(f"Total de casos: {df_dengue['Total'].sum():,}")
print(f"Total de POIs: {df_atividades['POIS'].sum():,}")

# 3. Top 10 municípios
top10 = df_dengue.nlargest(10, 'Total')[['Municipio', 'Total']]
print(top10)

# 4. Visualizar
plt.figure(figsize=(10, 6))
plt.barh(top10['Municipio'], top10['Total'])
plt.xlabel('Casos')
plt.title('Top 10 Municípios - Dengue 2024')
plt.tight_layout()
plt.show()
```

---

## 📞 SUPORTE

**Documentação Completa:**
- [PARTE 1: Contexto](ANALISE_DADOS_PARTE_1_CONTEXTO.md)
- [Catálogo de Análises](CATALOGO_ANALISES_COMPLETO.md)

**Scripts Prontos:**
- `exemplo_analise_exploratoria.py`
- `conectar_banco_gis.py`

---

**Última Atualização:** 31/10/2025  
**Revisão:** Trimestral
