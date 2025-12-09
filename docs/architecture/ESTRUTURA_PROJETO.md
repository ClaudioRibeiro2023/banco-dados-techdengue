# 📁 Estrutura do Projeto TechDengue

**Última Atualização:** 30 de Outubro de 2025  
**Versão:** 1.0.0

---

## 🗂️ Organização de Diretórios

```
banco-dados-techdengue/
│
├── 📊 DASHBOARD (Painel de Gestão)
│   ├── dashboard/
│   │   ├── app.py                          # Aplicação principal
│   │   ├── config.py                       # Configurações
│   │   ├── requirements.txt                # Dependências
│   │   ├── README_DASHBOARD.md             # Documentação
│   │   │
│   │   ├── pages/                          # Páginas do dashboard
│   │   │   ├── 1_📊_Qualidade_Dados.py
│   │   │   ├── 2_🗄️_Dados_Disponíveis.py
│   │   │   ├── 3_🔍_Confiabilidade.py
│   │   │   ├── 4_🔄_Sincronização.py
│   │   │   └── 5_📈_Análises.py
│   │   │
│   │   ├── components/                     # Componentes reutilizáveis
│   │   │   ├── __init__.py
│   │   │   ├── metrics.py
│   │   │   ├── charts.py
│   │   │   ├── tables.py
│   │   │   └── alerts.py
│   │   │
│   │   ├── utils/                          # Utilitários
│   │   │   ├── __init__.py
│   │   │   ├── data_loader.py
│   │   │   ├── quality_checker.py
│   │   │   └── formatters.py
│   │   │
│   │   └── assets/                         # Assets estáticos
│   │       ├── style.css
│   │       └── logo.png
│   │
├── 🗄️ DATA LAKE (Arquitetura Medallion)
│   ├── data_lake/
│   │   ├── bronze/                         # Dados brutos
│   │   │   ├── banco_techdengue.parquet
│   │   │   ├── planilha_campo.parquet
│   │   │   ├── atividades_excel.parquet
│   │   │   ├── ibge_referencia.parquet
│   │   │   └── dengue_historico.parquet
│   │   │
│   │   ├── silver/                         # Dados limpos
│   │   │   ├── dim_municipios.parquet
│   │   │   ├── fato_pois_servidor.parquet
│   │   │   ├── fato_atividades.parquet
│   │   │   └── fato_dengue.parquet
│   │   │
│   │   ├── gold/                           # Dados analíticos
│   │   │   ├── mega_tabela_analitica.parquet
│   │   │   └── mega_tabela_analitica.csv
│   │   │
│   │   └── metadata/                       # Metadados
│   │       ├── data_lineage.json
│   │       ├── quality_report.csv
│   │       ├── relatorio_qualidade_completo.json
│   │       ├── validacao_estrutura.json
│   │       ├── dicionario_mega_tabela.csv
│   │       └── historico_atualizacoes.json
│   │
├── 🔧 CÓDIGO-FONTE (src/)
│   ├── src/
│   │   ├── __init__.py
│   │   ├── config.py                       # Configurações do sistema
│   │   ├── database.py                     # Gerenciador de conexões
│   │   ├── models.py                       # Modelos de dados
│   │   ├── repository.py                   # Repositório de dados
│   │   └── sync.py                         # Sincronizador
│   │
├── 📊 DADOS ORIGINAIS (base_dados/)
│   ├── base_dados/
│   │   ├── dados_dengue/                   # Histórico de dengue
│   │   │   ├── base.dengue.2023.xlsx
│   │   │   ├── base.dengue.2024.xlsx
│   │   │   └── base.dengue.2025.xlsx
│   │   │
│   │   └── dados_techdengue/               # Dados operacionais
│   │       ├── Atividades Techdengue.xlsx
│   │       └── guia-banco-gis.md
│   │
├── 💾 CACHE (cache/)
│   ├── cache/
│   │   ├── banco_techdengue.parquet
│   │   └── planilha_campo.parquet
│   │
├── 📝 LOGS (logs/)
│   ├── logs/
│   │   ├── gis_cli.log
│   │   └── atualizador_automatico.log
│   │
├── 🔄 SCRIPTS PRINCIPAIS
│   ├── pipeline_etl_completo.py            # Pipeline ETL Bronze→Silver→Gold
│   ├── criar_mega_tabela.py                # Criação da MEGA TABELA
│   ├── atualizador_automatico.py           # Sistema de atualização
│   ├── validacao_completa_estrutura.py     # Validação de estrutura
│   ├── validacao_cruzada_qualidade.py      # Validação de qualidade
│   ├── gis_cli.py                          # CLI para gerenciamento
│   ├── analise_exploratoria_servidor.py    # Análise exploratória
│   └── validar_dados_servidor.py           # Validação de dados
│   │
└── 📚 DOCUMENTAÇÃO
    ├── README.md                           # Documentação principal
    ├── SISTEMA_COMPLETO.md                 # Sistema completo
    ├── ARQUITETURA_DADOS_DEFINITIVA.md     # Arquitetura detalhada
    ├── GUIA_INTEGRACAO_GIS.md              # Guia de integração
    ├── SISTEMA_INTEGRACAO_GIS_COMPLETO.md  # Sistema GIS
    ├── ESTRUTURA_PROJETO.md                # Este arquivo
    └── CORRECAO_HECTARES.md                # Correção de hectares
```

---

## 🎯 Propósito de Cada Diretório

### 📊 dashboard/
**Propósito:** Painel de gestão profissional  
**Conteúdo:** Interface web para monitoramento e gestão  
**Tecnologia:** Streamlit, Plotly, Pandas  
**Acesso:** http://localhost:8501

### 🗄️ data_lake/
**Propósito:** Armazenamento de dados (Medallion Architecture)  
**Camadas:**
- **Bronze:** Dados brutos (5 tabelas)
- **Silver:** Dados limpos (4 tabelas)
- **Gold:** Dados analíticos (MEGA TABELA)
- **Metadata:** Rastreabilidade e qualidade

### 🔧 src/
**Propósito:** Código-fonte do sistema  
**Conteúdo:** Módulos Python reutilizáveis  
**Padrões:** Repository, Singleton, Factory

### 📊 base_dados/
**Propósito:** Dados originais (Excel)  
**Conteúdo:** Arquivos fonte não modificados  
**Status:** Read-only (preservação)

### 💾 cache/
**Propósito:** Cache local para performance  
**Conteúdo:** Dados do servidor em Parquet  
**TTL:** 1 hora (configurável)

### 📝 logs/
**Propósito:** Logs do sistema  
**Conteúdo:** Registros de execução  
**Retenção:** Configurável

---

## 🚀 Fluxo de Dados

```
1. INGESTÃO
   Excel/PostgreSQL → Bronze (dados brutos)
   
2. LIMPEZA
   Bronze → Silver (validação e padronização)
   
3. AGREGAÇÃO
   Silver → Gold (MEGA TABELA analítica)
   
4. VISUALIZAÇÃO
   Gold → Dashboard (painel de gestão)
```

---

## 📋 Arquivos Principais

### Scripts de Pipeline
- `pipeline_etl_completo.py` - Pipeline completo (Bronze→Silver→Gold)
- `criar_mega_tabela.py` - Criação da MEGA TABELA
- `atualizador_automatico.py` - Atualização automática

### Scripts de Validação
- `validacao_completa_estrutura.py` - Valida estrutura
- `validacao_cruzada_qualidade.py` - Valida qualidade

### Scripts de Análise
- `analise_exploratoria_servidor.py` - Análise exploratória
- `validar_dados_servidor.py` - Validação de dados

### CLI
- `gis_cli.py` - Interface de linha de comando

### Dashboard
- `dashboard/app.py` - Painel de gestão web

---

## 🔄 Comandos Principais

### Executar Pipeline Completo
```bash
python pipeline_etl_completo.py
```

### Criar MEGA TABELA
```bash
python criar_mega_tabela.py
```

### Atualizar Dados
```bash
python atualizador_automatico.py
```

### Validar Sistema
```bash
python validacao_completa_estrutura.py
python validacao_cruzada_qualidade.py
```

### Executar Dashboard
```bash
streamlit run dashboard/app.py
```

### CLI
```bash
python gis_cli.py test-connection
python gis_cli.py sync
python gis_cli.py stats
```

---

## 📊 Tamanhos Aproximados

```
data_lake/bronze/    ~12.8 MB
data_lake/silver/    ~12.7 MB
data_lake/gold/      ~0.2 MB
cache/               ~12.4 MB
logs/                ~0.1 MB

Total:               ~38 MB
```

---

## 🔐 Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ Acesso read-only ao servidor
- ✅ SSL/TLS nas conexões
- ✅ Logs de auditoria
- ✅ Dashboard local (localhost)

---

## 📝 Manutenção

### Limpeza de Cache
```bash
# Limpar cache (forçar nova sincronização)
rm -rf cache/*
```

### Limpeza de Logs
```bash
# Limpar logs antigos
rm logs/*.log
```

### Reconstruir Data Lake
```bash
# Executar pipeline completo
python pipeline_etl_completo.py
```

---

## ✅ Checklist de Organização

- [x] Estrutura de diretórios criada
- [x] Data Lake (Bronze/Silver/Gold)
- [x] Código-fonte modularizado (src/)
- [x] Dashboard profissional (dashboard/)
- [x] Scripts de pipeline
- [x] Scripts de validação
- [x] CLI para gerenciamento
- [x] Documentação completa
- [x] Metadados e rastreabilidade
- [x] Sistema de logs

---

**Desenvolvido por:** Cascade AI  
**Data:** 30 de Outubro de 2025  
**Versão:** 1.0.0  
**Status:** 🟢 Estrutura Completa e Organizada
