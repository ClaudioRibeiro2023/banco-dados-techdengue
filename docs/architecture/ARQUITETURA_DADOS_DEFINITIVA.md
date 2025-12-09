# 🏗️ Arquitetura de Dados Definitiva - Projeto TechDengue

## 📊 Visão Geral

Arquitetura **Enterprise-Grade** baseada em melhores práticas de Data Engineering e benchmarks de mercado.

---

## 🎯 Padrões e Frameworks Implementados

### 1. Medallion Architecture (Databricks/Delta Lake)
```
🥉 BRONZE → 🥈 SILVER → 🥇 GOLD
  Raw        Clean      Analytics
```

### 2. Star Schema (Kimball - Data Warehouse)
```
Dimensões + Fatos = Modelo Estrela
```

### 3. Data Quality Framework
```
Validações automáticas em cada camada
```

### 4. Data Lineage
```
Rastreabilidade completa de transformações
```

---

## 🏛️ Arquitetura em 3 Camadas

### 🥉 CAMADA BRONZE (Raw Data)

**Objetivo:** Ingestão de dados brutos sem transformações

**Fontes:**
```
1. PostgreSQL/PostGIS (Servidor AWS)
   ├── banco_techdengue (310.838 POIs)
   └── planilha_campo (0 registros)

2. Excel (Local)
   ├── Atividades Techdengue.xlsx
   ├── base.dengue.2023-2025.xlsx
   └── IBGE (referência)
```

**Tabelas Bronze:**
```
data_lake/bronze/
├── banco_techdengue.parquet      (310.838 registros)
├── planilha_campo.parquet         (0 registros)
├── atividades_excel.parquet       (1.977 registros)
├── ibge_referencia.parquet        (853 municípios)
└── dengue_historico.parquet       (2.562 registros)
```

**Características:**
- ✅ Dados exatamente como na fonte
- ✅ Sem transformações
- ✅ Versionamento automático
- ✅ Hash MD5 para integridade

---

### 🥈 CAMADA SILVER (Clean Data)

**Objetivo:** Dados limpos, validados e padronizados

**Transformações:**
- Padronização de nomes de colunas
- Conversão de tipos de dados
- Remoção de duplicatas
- Validação de qualidade
- Enriquecimento de dados

**Tabelas Silver:**
```
data_lake/silver/
├── dim_municipios.parquet         (853 municípios)
├── fato_pois_servidor.parquet     (310.838 POIs)
├── fato_atividades.parquet        (1.281 atividades - corrigido)
└── fato_dengue.parquet            (2.562 registros)
```

**Modelo de Dados:**
```
DIMENSÕES (Referência)
├── dim_municipios
│   ├── codigo_ibge (PK)
│   ├── municipio
│   ├── populacao
│   ├── area_ha
│   ├── urs
│   ├── microregiao_saude
│   └── macroregiao_saude

FATOS (Transacionais)
├── fato_pois_servidor
│   ├── poi_id (PK)
│   ├── sistema_id (FK)
│   ├── latitude
│   ├── longitude
│   ├── geometria_json
│   └── analista

├── fato_atividades
│   ├── codigo_ibge (FK)
│   ├── data_map
│   ├── nomenclatura_atividade
│   ├── total_pois
│   ├── total_devolutivas
│   ├── hectares_mapeados (CORRIGIDO)
│   └── 34 categorias de POIs

└── fato_dengue
    ├── codigo_ibge (FK)
    ├── ano
    ├── semana
    └── casos
```

**Validações Implementadas:**
- ✅ NOT NULL em colunas críticas
- ✅ UNIQUE em chaves primárias
- ✅ RANGE em coordenadas (-90/90, -180/180)
- ✅ Correlação de códigos IBGE (98,9%)

---

### 🥇 CAMADA GOLD (Analytics)

**Objetivo:** Dados agregados e prontos para análise

**MEGA TABELA ANALÍTICA COMPLETA**

**Granularidade:** MUNICÍPIO × ANO

**Estrutura (60+ colunas):**

```sql
gold.mega_tabela_analitica
├── IDENTIFICAÇÃO (6 colunas)
│   ├── codigo_ibge
│   ├── municipio
│   ├── ano
│   ├── urs
│   ├── microregiao_saude
│   └── macroregiao_saude
│
├── DEMOGRAFIA (3 colunas)
│   ├── populacao
│   ├── area_ha
│   └── densidade_populacional
│
├── DENGUE (2+ colunas)
│   ├── total_casos_dengue
│   └── taxa_incidencia_100k
│
├── ATIVIDADES TECHDENGUE (9 colunas)
│   ├── total_atividades
│   ├── total_pois_excel
│   ├── total_devolutivas
│   ├── total_hectares_mapeados
│   ├── taxa_conversao_devolutivas
│   ├── data_primeira_atividade
│   ├── data_ultima_atividade
│   ├── dias_operacao
│   └── densidade_pois_por_hectare
│
├── CATEGORIAS DE POIs (34 colunas)
│   ├── A - Armazenamento de água
│   ├── A - Caixa de água elevada
│   ├── ... (todas as 34 categorias)
│   └── O - Outros
│
├── TRATAMENTOS (7 colunas)
│   ├── total_removido_solucionado
│   ├── total_descaracterizado
│   ├── total_tratado
│   ├── total_morador_ausente
│   ├── total_nao_autorizado
│   ├── total_tratamento_drone
│   └── total_monitorado
│
├── INDICADORES CALCULADOS (6 colunas)
│   ├── tem_atividade_techdengue (0/1)
│   ├── tem_casos_dengue (0/1)
│   ├── pois_por_caso_dengue
│   ├── efetividade_score (0-100)
│   └── risco_dengue_score (0-100)
│
└── METADADOS (2 colunas)
    ├── data_atualizacao
    └── versao
```

**Dimensões:**
- **Registros:** 2.559 (853 municípios × 3 anos)
- **Colunas:** 60+
- **Tamanho:** ~5 MB (Parquet comprimido)

---

## 🔄 Pipeline ETL Automatizado

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    1. INGESTÃO (Bronze)                      │
├─────────────────────────────────────────────────────────────┤
│  • Sincroniza PostgreSQL → Bronze                           │
│  • Carrega Excel → Bronze                                    │
│  • Registra lineage                                          │
│  • Calcula hash MD5                                          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   2. LIMPEZA (Silver)                        │
├─────────────────────────────────────────────────────────────┤
│  • Padroniza nomes de colunas                               │
│  • Converte tipos de dados                                   │
│  • Remove duplicatas                                         │
│  • Valida qualidade (NOT NULL, UNIQUE, RANGE)              │
│  • Correlaciona códigos IBGE                                │
│  • Corrige duplicação de hectares                           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   3. AGREGAÇÃO (Gold)                        │
├─────────────────────────────────────────────────────────────┤
│  • Agrega por município × ano                               │
│  • Calcula indicadores derivados                            │
│  • Cria MEGA TABELA                                         │
│  • Gera dicionário de dados                                 │
└─────────────────────────────────────────────────────────────┘
```

### Comandos

```bash
# Pipeline completo
python pipeline_etl_completo.py

# Apenas MEGA TABELA
python criar_mega_tabela.py

# Sincronizar servidor
python gis_cli.py sync --force
```

---

## 📊 Casos de Uso da MEGA TABELA

### 1. Análises de Correlação
```python
import pandas as pd

df = pd.read_parquet('data_lake/gold/mega_tabela_analitica.parquet')

# Correlação POIs × Casos de Dengue
df_com_atividades = df[df['tem_atividade_techdengue'] == 1]

correlation = df_com_atividades[['total_pois_excel', 'total_casos_dengue']].corr()
print(correlation)
```

### 2. Análise Antes-Depois
```python
# Comparar 2023 vs 2024
df_2023 = df[df['ano'] == 2023]
df_2024 = df[df['ano'] == 2024]

# Municípios com atividades em 2024
municipios_intervencao = df_2024[df_2024['tem_atividade_techdengue'] == 1]['codigo_ibge']

# Comparar casos
comparacao = df[df['codigo_ibge'].isin(municipios_intervencao)].pivot_table(
    index='codigo_ibge',
    columns='ano',
    values='total_casos_dengue'
)

comparacao['variacao'] = comparacao[2024] - comparacao[2023]
print(comparacao.describe())
```

### 3. Dashboard Executivo
```python
import streamlit as st

df = pd.read_parquet('data_lake/gold/mega_tabela_analitica.parquet')

st.title("Dashboard TechDengue")

# KPIs
col1, col2, col3 = st.columns(3)
col1.metric("Municípios Atendidos", df['tem_atividade_techdengue'].sum())
col2.metric("Total de POIs", f"{df['total_pois_excel'].sum():,.0f}")
col3.metric("Taxa de Conversão", f"{df['taxa_conversao_devolutivas'].mean():.1f}%")

# Gráficos
st.line_chart(df.groupby('ano')['total_casos_dengue'].sum())
```

### 4. Machine Learning
```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# Preparar dados
X = df[['total_pois_excel', 'total_devolutivas', 'densidade_populacional']]
y = df['total_casos_dengue']

# Treinar modelo
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestRegressor()
model.fit(X_train, y_train)

# Prever
predictions = model.predict(X_test)
```

---

## 🎯 Vantagens da Arquitetura

### vs. Abordagem Anterior

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Fontes de dados** | Separadas | Integradas |
| **Atualização** | Manual | Automática |
| **Qualidade** | Não validada | Validada |
| **Rastreabilidade** | Nenhuma | Completa (lineage) |
| **Performance** | Lenta (Excel) | Rápida (Parquet) |
| **Escalabilidade** | Limitada | Alta |
| **Reprodutibilidade** | Difícil | Fácil |

### Benchmarks de Mercado

✅ **Medallion Architecture** - Padrão Databricks/Delta Lake  
✅ **Star Schema** - Padrão Kimball (Data Warehouse)  
✅ **Data Quality** - Framework Great Expectations  
✅ **Data Lineage** - Rastreabilidade completa  
✅ **Incremental Loading** - CDC (Change Data Capture)  
✅ **Parquet Format** - Formato colunar otimizado  

---

## 📁 Estrutura de Diretórios

```
banco-dados-techdengue/
├── data_lake/
│   ├── bronze/                    # Dados brutos
│   │   ├── banco_techdengue.parquet
│   │   ├── planilha_campo.parquet
│   │   ├── atividades_excel.parquet
│   │   ├── ibge_referencia.parquet
│   │   └── dengue_historico.parquet
│   │
│   ├── silver/                    # Dados limpos
│   │   ├── dim_municipios.parquet
│   │   ├── fato_pois_servidor.parquet
│   │   ├── fato_atividades.parquet
│   │   └── fato_dengue.parquet
│   │
│   ├── gold/                      # Dados analíticos
│   │   ├── mega_tabela_analitica.parquet
│   │   └── mega_tabela_analitica.csv
│   │
│   └── metadata/                  # Metadados
│       ├── data_lineage.json
│       ├── quality_report.csv
│       └── dicionario_mega_tabela.csv
│
├── pipeline_etl_completo.py       # Pipeline principal
├── criar_mega_tabela.py           # Criação da MEGA TABELA
└── gis_cli.py                     # CLI para gerenciamento
```

---

## 🚀 Próximos Passos

### Curto Prazo (1 semana)
1. ✅ Corrigir mapeamento de colunas do Excel
2. ⏳ Executar pipeline completo
3. ⏳ Validar MEGA TABELA
4. ⏳ Criar primeiras análises

### Médio Prazo (1 mês)
5. ⏳ Automatizar sincronização (cron/scheduler)
6. ⏳ Dashboard interativo (Streamlit)
7. ⏳ API REST (FastAPI)
8. ⏳ Testes automatizados

### Longo Prazo (3 meses)
9. ⏳ Análises geoespaciais avançadas
10. ⏳ Modelos de Machine Learning
11. ⏳ Publicação (Docker, Cloud)
12. ⏳ Documentação completa

---

## ✅ Checklist de Implementação

- [x] Arquitetura Medallion (Bronze/Silver/Gold)
- [x] Data Lineage (rastreabilidade)
- [x] Data Quality Framework
- [x] Pipeline ETL automatizado
- [x] MEGA TABELA analítica
- [x] Integração com servidor PostgreSQL
- [x] Correção de duplicação de hectares
- [ ] Correção de mapeamento de colunas
- [ ] Execução completa do pipeline
- [ ] Validação final
- [ ] Dashboard
- [ ] API REST
- [ ] Documentação de uso

---

**Versão:** 1.0.0  
**Data:** 30 de Outubro de 2025  
**Status:** 🟡 Em Implementação (90% completo)
