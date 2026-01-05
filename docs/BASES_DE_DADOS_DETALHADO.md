# 📚 BASES DE DADOS TECHDENGUE - GUIA TÉCNICO DETALHADO

**Estruturas, Conexões e Integrações**  
**Versão:** 1.0 | **Data:** 31/10/2025

---

## 📋 VISÃO GERAL

### 3 Bases Principais

| # | Base | Formato | Registros | Chave |
|---|------|---------|-----------|-------|
| 1 | **Dengue 2024/2025** | Excel (.xlsx) | 853 municípios | `codmun` |
| 2 | **Atividades TechDengue** | Excel 3 abas | 1.278 atividades | `CODIGO IBGE` |
| 3 | **Banco GIS** | PostgreSQL+PostGIS | Tempo real | `codigo_ibge` |

**Chave de Relacionamento Universal:** Código IBGE (7 dígitos, formato: `31XXXXX`)

---

## 📊 BASE 1: DADOS DE DENGUE

### Localização
```
base_dados/dados_dengue/
├── base.dengue.2024.xlsx
└── base.dengue.2025.xlsx
```

### Estrutura

**Dimensões:** 853 linhas × 55 colunas

**Colunas:**
- `codmun` (int64): Código IBGE - **CHAVE PRIMÁRIA**
- `Municipio` (object): Nome do município
- `Semana 1` a `Semana 52` (int64): Casos por semana epidemiológica
- `Total` (int64): Soma anual

**Fonte:** SINAN/SES-MG

### Como Carregar

```python
import pandas as pd

df_dengue = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')

# Validar
assert len(df_dengue) == 853, "Deveria ter 853 municípios"
assert 'codmun' in df_dengue.columns, "Falta chave primária"
```

### Métricas Derivadas

```python
# Incidência por 100mil habitantes
df_dengue['incidencia'] = (df_dengue['Total'] / populacao) * 100000

# Semana de pico
semanas = [f'Semana {i}' for i in range(1, 53)]
df_dengue['semana_pico'] = df_dengue[semanas].idxmax(axis=1)
```

---

## 🏢 BASE 2: ATIVIDADES TECHDENGUE

### Localização
```
base_dados/dados_techdengue/
└── Atividades Techdengue.xlsx (3 abas)
```

### ABA 1: Atividades Techdengue

**Dimensões:** 1.278 linhas × ~50 colunas

**Colunas Principais:**
```python
{
    'MUNICIPIO': str,
    'CODIGO IBGE': str,        # CHAVE ESTRANGEIRA
    'CONTRATANTE': str,
    'DATA_MAP': datetime,
    'POIS': int,               # Total de POIs identificados
    'DEVOLUTIVAS': int,        # Devolutivas realizadas
    'HECTARES': float,         # Área mapeada
    'ANALISTA': str,
    'STATUS': str,
    'LINK': str,               # URL GIS Cloud
}
```

**34 Categorias de POIs:**
```python
categorias = [
    'TERRENO_BALDIO', 'CAIXA_DAGUA', 'EDIFICACAO_ABANDONADA',
    'PISCINA', 'ENTULHO', 'LIXAO', 'BUEIRO', 'RESIDENCIA',
    'CEMITERIO', 'BORRACHARIA', 'AUTO', 'FERRO_VELHO',
    'OFICINA', 'LAVA_JATO', # ... e mais 20
]
```

**Carregar:**
```python
df_atividades = pd.read_excel(
    'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
    sheet_name='Atividades Techdengue'
)

# Converter datas
df_atividades['DATA_MAP'] = pd.to_datetime(df_atividades['DATA_MAP'], errors='coerce')

# Padronizar código IBGE
df_atividades['CODIGO IBGE'] = df_atividades['CODIGO IBGE'].astype(str).str.strip()
```

### ABA 2: IBGE

**Dimensões:** 853 linhas × ~15 colunas

**Colunas:**
```python
{
    'CODIGO IBGE': str,        # CHAVE PRIMÁRIA
    'MUNICIPIO': str,
    'POPULACAO': int,          # População estimada
    'AREA_KM2': float,         # Área territorial
    'DENSIDADE': float,        # Densidade demográfica
    'MACRORREGIAO': str,       # Macrorregião de saúde
    'PIB_PER_CAPITA': float,
    'IDH': float,              # Índice Desenvolvimento Humano
}
```

**Carregar:**
```python
df_ibge = pd.read_excel(
    'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
    sheet_name='IBGE'
)
```

### ABA 3: Atividades (com sub)

**Visão consolidada com hierarquia administrativa**

**Colunas:**
```python
{
    'MACRORREGIAO': str,       # 14 macrorregiões MG
    'CONSORCIO': str,          # Consórcio intermunicipal
    'CONTRATANTE': str,
    'STATUS_MAPEAMENTO': str,
    'N_ATIVIDADES': int,
    'POIS_TOTAL': int,
    'HECTARES_TOTAL': float,
}
```

---

## 🗺️ BASE 3: BANCO GIS (POSTGRESQL)

### Conexão

**Host:** `<GIS_DB_HOST>`  
**Port:** `<GIS_DB_PORT>`  
**Database:** `<GIS_DB_NAME>`  
**User:** `<GIS_DB_USERNAME>`  
**Password:** `<GIS_DB_PASSWORD>`  
**SSL:** Obrigatório

**Connection String:**
```
postgresql://<GIS_DB_USERNAME>:<GIS_DB_PASSWORD>@<GIS_DB_HOST>:<GIS_DB_PORT>/<GIS_DB_NAME>?sslmode=require
```

### TABELA 1: banco_techdengue

**Estrutura:**
```sql
id (SERIAL PRIMARY KEY)
nome (VARCHAR)
lat, long (DECIMAL)
geom (GEOMETRY Point)      -- PostGIS
data_criacao (TIMESTAMP)
analista (VARCHAR)
codigo_ibge (VARCHAR)      -- CHAVE ESTRANGEIRA
categoria (VARCHAR)
```

**Consultar:**
```python
import psycopg2
import pandas as pd
import os

conn = psycopg2.connect(
    host=os.getenv('GIS_DB_HOST', 'localhost'),
    port=int(os.getenv('GIS_DB_PORT', '5432')),
    database=os.getenv('GIS_DB_NAME', 'postgres'),
    user=os.getenv('GIS_DB_USERNAME', 'postgres'),
    password=os.getenv('GIS_DB_PASSWORD', ''),
    sslmode=os.getenv('GIS_DB_SSL_MODE', 'require')
)

query = "SELECT * FROM banco_techdengue LIMIT 100"
df_gis = pd.read_sql(query, conn)
conn.close()
```

### TABELA 2: planilha_campo

**Estrutura:**
```sql
id (SERIAL PRIMARY KEY)
id_atividade (INTEGER)
poi (VARCHAR)              -- Tipo de POI
descricao (TEXT)
lat, longi (DECIMAL)
data_upload (TIMESTAMP)
codigo_ibge (VARCHAR)      -- CHAVE ESTRANGEIRA
```

---

## 🔗 RELACIONAMENTOS ENTRE BASES

### Diagrama ER

```
┌─────────────────────────┐
│ base.dengue.2024.xlsx   │
│ ┌─────────────────────┐ │
│ │ codmun (PK)         │ │◄─────┐
│ │ Municipio           │ │      │
│ │ Semana 1..52        │ │      │
│ │ Total               │ │      │
│ └─────────────────────┘ │      │
└─────────────────────────┘      │
                                  │ (1:N)
┌─────────────────────────┐      │
│ Atividades.xlsx [IBGE]  │      │
│ ┌─────────────────────┐ │      │
│ │ CODIGO IBGE (PK)    │ │◄─────┤
│ │ MUNICIPIO           │ │      │
│ │ POPULACAO           │ │      │
│ │ AREA_KM2            │ │      │
│ │ MACRORREGIAO        │ │      │
│ └─────────────────────┘ │      │
└─────────────────────────┘      │
        │                         │
        │ (1:N)                   │
        ▼                         │
┌─────────────────────────┐      │
│ Atividades.xlsx [Ativ]  │      │
│ ┌─────────────────────┐ │      │
│ │ CODIGO IBGE (FK)    │ │◄─────┘
│ │ MUNICIPIO           │ │
│ │ POIS                │ │
│ │ DEVOLUTIVAS         │ │
│ │ DATA_MAP            │ │
│ └─────────────────────┘ │
└─────────────────────────┘
        │
        │ (1:N)
        ▼
┌─────────────────────────┐
│ banco_techdengue (GIS)  │
│ ┌─────────────────────┐ │
│ │ id (PK)             │ │
│ │ codigo_ibge (FK)    │ │◄─────┐
│ │ lat, long           │ │      │ (1:1)
│ │ geom (PostGIS)      │ │      │
│ │ data_criacao        │ │      │
│ └─────────────────────┘ │      │
└─────────────────────────┘      │
                                  │
┌─────────────────────────┐      │
│ planilha_campo (GIS)    │      │
│ ┌─────────────────────┐ │      │
│ │ id (PK)             │ │      │
│ │ codigo_ibge (FK)    │ │◄─────┘
│ │ poi                 │ │
│ │ lat, longi          │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Cardinalidades

- **1 Município : N Atividades** (um município pode ter várias atividades)
- **1 Município : N Registros GIS** (um município tem múltiplos POIs)
- **1 Atividade : N Registros planilha_campo** (uma atividade gera vários registros)

---

## 🔄 INTEGRAÇÃO DE DADOS

### Exemplo 1: Dengue + IBGE

```python
# Juntar casos de dengue com dados populacionais
df_integrado = pd.merge(
    df_dengue[['codmun', 'Municipio', 'Total']],
    df_ibge[['CODIGO IBGE', 'POPULACAO', 'MACRORREGIAO']],
    left_on='codmun',
    right_on='CODIGO IBGE',
    how='inner'
)

# Calcular incidência
df_integrado['incidencia'] = (df_integrado['Total'] / df_integrado['POPULACAO']) * 100000
```

### Exemplo 2: Dengue + Atividades

```python
# Agregar POIs por município
pois_mun = df_atividades.groupby('CODIGO IBGE').agg({
    'POIS': 'sum',
    'DEVOLUTIVAS': 'sum',
    'HECTARES': 'sum'
}).reset_index()

# Juntar com dengue
df_dengue_pois = pd.merge(
    df_dengue,
    pois_mun,
    left_on='codmun',
    right_on='CODIGO IBGE',
    how='left'
)

# Correlação
from scipy.stats import pearsonr
corr, p_value = pearsonr(
    df_dengue_pois['Total'].dropna(),
    df_dengue_pois['POIS'].fillna(0)
)
print(f"Correlação: {corr:.3f}, p-value: {p_value}")
```

### Exemplo 3: Integração Completa (4 Fontes)

```python
def integrar_todas_bases():
    """Integra dengue, atividades, IBGE e GIS"""
    
    # 1. Carregar bases Excel
    df_dengue = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')
    df_atividades = pd.read_excel(
        'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
        sheet_name='Atividades Techdengue'
    )
    df_ibge = pd.read_excel(
        'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
        sheet_name='IBGE'
    )
    
    # 2. Carregar dados GIS
    import psycopg2
    import os
    conn = psycopg2.connect(
        host=os.getenv('GIS_DB_HOST', 'localhost'),
        port=int(os.getenv('GIS_DB_PORT', '5432')),
        database=os.getenv('GIS_DB_NAME', 'postgres'),
        user=os.getenv('GIS_DB_USERNAME', 'postgres'),
        password=os.getenv('GIS_DB_PASSWORD', ''),
        sslmode=os.getenv('GIS_DB_SSL_MODE', 'require')
    )
    df_gis = pd.read_sql(
        "SELECT codigo_ibge, COUNT(*) as registros_gis FROM banco_techdengue GROUP BY codigo_ibge",
        conn
    )
    conn.close()
    
    # 3. Agregar atividades por município
    ativ_agg = df_atividades.groupby('CODIGO IBGE').agg({
        'POIS': 'sum',
        'DEVOLUTIVAS': 'sum',
        'HECTARES': 'sum'
    }).reset_index()
    
    # 4. Merge progressivo
    df_final = df_dengue[['codmun', 'Municipio', 'Total']]
    
    # Adicionar IBGE
    df_final = df_final.merge(
        df_ibge[['CODIGO IBGE', 'POPULACAO', 'AREA_KM2', 'MACRORREGIAO']],
        left_on='codmun',
        right_on='CODIGO IBGE',
        how='left'
    )
    
    # Adicionar atividades
    df_final = df_final.merge(
        ativ_agg,
        left_on='codmun',
        right_on='CODIGO IBGE',
        how='left'
    )
    
    # Adicionar GIS
    df_final = df_final.merge(
        df_gis,
        left_on='codmun',
        right_on='codigo_ibge',
        how='left'
    )
    
    # Preencher missing
    df_final['POIS'] = df_final['POIS'].fillna(0)
    df_final['registros_gis'] = df_final['registros_gis'].fillna(0)
    
    # Calcular métricas
    df_final['incidencia'] = (df_final['Total'] / df_final['POPULACAO']) * 100000
    df_final['densidade_pois'] = df_final['POIS'] / df_final['AREA_KM2']
    
    return df_final

# Usar
df_master = integrar_todas_bases()
print(df_master.head())
print(f"\nDimensões: {df_master.shape}")
print(f"Colunas: {df_master.columns.tolist()}")
```

---

## 📊 FORMAS DE APRESENTAÇÃO

### 1. Dashboards Interativos (Streamlit)

```python
import streamlit as st
import plotly.express as px

st.title('🦟 TechDengue Analytics')

# KPIs
col1, col2, col3 = st.columns(3)
col1.metric("Total Casos", f"{df['Total'].sum():,}")
col2.metric("Municípios", len(df))
col3.metric("POIs", f"{df['POIS'].sum():,}")

# Mapa
fig = px.choropleth_mapbox(
    df_master,
    geojson=geojson_mg,
    locations='codmun',
    color='incidencia',
    hover_name='Municipio',
    mapbox_style="carto-positron",
    zoom=5,
    center={"lat": -18.5, "lon": -44.5},
    color_continuous_scale="YlOrRd"
)
st.plotly_chart(fig)
```

### 2. Relatórios PDF (ReportLab)

```python
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def gerar_relatorio_pdf(df, filename='relatorio.pdf'):
    doc = SimpleDocTemplate(filename, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Título
    story.append(Paragraph("Relatório Epidemiológico - TechDengue", styles['Title']))
    
    # Tabela
    data = [['Município', 'Casos', 'Incidência', 'POIs']]
    for _, row in df.head(20).iterrows():
        data.append([
            row['Municipio'],
            f"{row['Total']:,}",
            f"{row['incidencia']:.1f}",
            f"{row['POIS']:.0f}"
        ])
    
    table = Table(data)
    story.append(table)
    
    doc.build(story)
```

### 3. Mapas GIS (GeoPandas + Folium)

```python
import geopandas as gpd
import folium

# Carregar shapefile
gdf = gpd.read_file('data/mg_municipios.shp')

# Juntar com dados
gdf = gdf.merge(df_master, left_on='CD_MUN', right_on='codmun')

# Criar mapa
m = folium.Map(location=[-18.5, -44.5], zoom_start=7)

# Choropleth
folium.Choropleth(
    geo_data=gdf,
    name='Incidência',
    data=df_master,
    columns=['codmun', 'incidencia'],
    key_on='feature.properties.CD_MUN',
    fill_color='YlOrRd',
    legend_name='Incidência (casos/100mil hab)'
).add_to(m)

m.save('mapa_dengue.html')
```

### 4. Gráficos Estáticos (Matplotlib)

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Top 20 municípios
top20 = df_master.nlargest(20, 'Total')

fig, ax = plt.subplots(figsize=(12, 8))
ax.barh(top20['Municipio'], top20['Total'])
ax.set_xlabel('Casos de Dengue')
ax.set_title('Top 20 Municípios - Dengue 2024')
plt.tight_layout()
plt.savefig('top20_municipios.png', dpi=300)
```

---

## 🔧 FERRAMENTAS DE CONEXÃO

### Python

```python
# Excel
import pandas as pd
import openpyxl

# PostgreSQL
import psycopg2
from sqlalchemy import create_engine

# GIS
import geopandas as gpd
from shapely.geometry import Point

# Visualização
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import folium

# Dashboard
import streamlit as st
import dash
```

### R

```r
# Excel
library(readxl)
library(writexl)

# PostgreSQL
library(RPostgreSQL)
library(DBI)

# GIS
library(sf)
library(leaflet)

# Visualização
library(ggplot2)
library(plotly)

# Dashboard
library(shiny)
library(flexdashboard)
```

### SQL (DBeaver, pgAdmin)

```sql
-- Conectar via DBeaver
-- Host: <GIS_DB_HOST>
-- Port: <GIS_DB_PORT>
-- Database: <GIS_DB_NAME>
-- Username: <GIS_DB_USERNAME>
-- Password: <GIS_DB_PASSWORD>
-- SSL: require

-- Consultas
SELECT * FROM banco_techdengue LIMIT 10;
SELECT * FROM planilha_campo LIMIT 10;

-- Metadados
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'banco_techdengue';
```

---

## ✅ CHECKLIST DE QUALIDADE

### Ao Carregar Dados

- [ ] Verificar número de registros esperados
- [ ] Validar formato do código IBGE (7 dígitos, inicia com 31)
- [ ] Converter datas para datetime
- [ ] Verificar valores missing e tratá-los
- [ ] Padronizar nomes de colunas (maiúsculas/minúsculas)
- [ ] Verificar duplicatas
- [ ] Validar tipos de dados

### Ao Integrar Bases

- [ ] Verificar chaves de relacionamento existem em ambas bases
- [ ] Escolher tipo de join adequado (inner, left, right, outer)
- [ ] Validar cardinalidade (1:1, 1:N, N:N)
- [ ] Verificar registros perdidos no merge
- [ ] Testar com subset antes de processar tudo
- [ ] Documentar transformações aplicadas

---

## 📞 REFERÊNCIAS

- **Guia PostGIS:** `base_dados/dados_techdengue/guia-banco-gis.md`
- **Análise de Dados:** `docs/README_ANALISE_DADOS.md`
- **Arquitetura:** `docs/architecture/ARQUITETURA_DADOS_DEFINITIVA.md`

---

**Criado em:** 31/10/2025  
**Revisão:** Trimestral
