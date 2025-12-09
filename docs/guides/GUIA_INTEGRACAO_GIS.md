# 🚀 Guia de Integração GIS - Sistema TechDengue

## 📋 Visão Geral

Sistema profissional de integração com banco de dados PostgreSQL/PostGIS para análises em tempo real dos dados TechDengue.

### ✨ Features

- ✅ **Conexão com PostgreSQL/PostGIS** (AWS RDS)
- ✅ **Pool de conexões** com retry automático
- ✅ **Cache local** em Parquet (performance)
- ✅ **Sincronização inteligente** (incremental)
- ✅ **CLI completo** para gerenciamento
- ✅ **Queries geoespaciais** (PostGIS)
- ✅ **Validação automática** de dados
- ✅ **Logging profissional**
- ✅ **Modo online/offline**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     APLICAÇÃO PYTHON                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  CLI (gis_   │  │  Jupyter     │  │  Scripts     │      │
│  │  cli.py)     │  │  Notebooks   │  │  Análise     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │   DataSynchronizer (sync.py)        │             │
│         │   - Sincronização inteligente       │             │
│         │   - Cache management                │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │  TechDengueRepository (repository.py)│            │
│         │  - Queries especializadas           │             │
│         │  - Agregações                       │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │  DatabaseManager (database.py)      │             │
│         │  - Pool de conexões                 │             │
│         │  - Retry logic                      │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ PostgreSQL Protocol
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              POSTGRESQL/POSTGIS (AWS RDS)                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ banco_techdengue │  │ planilha_campo   │                 │
│  │ (dados operac.)  │  │ (POIs)           │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📦 Instalação

### 1. Instalar Dependências

```bash
pip install psycopg2-binary sqlalchemy geoalchemy2 pandas pyarrow
```

### 2. Estrutura de Arquivos

```
banco-dados-techdengue/
├── src/
│   ├── __init__.py
│   ├── config.py          # Configurações
│   ├── database.py        # Gerenciador de conexões
│   ├── models.py          # Modelos de dados
│   ├── repository.py      # Camada de acesso a dados
│   └── sync.py            # Sincronizador
├── gis_cli.py             # Interface CLI
├── cache/                 # Cache local (Parquet)
├── logs/                  # Logs do sistema
└── GUIA_INTEGRACAO_GIS.md # Este arquivo
```

---

## 🚀 Início Rápido

### 1. Testar Conexão

```bash
python gis_cli.py test-connection
```

**Output esperado:**
```
================================================================================
  TESTE DE CONEXÃO
================================================================================

✅ Conexão bem-sucedida!

Host: ls-564b587f07ec660b943bc46eeb4d39a79a9eec4d.cul8kgow0o6q.us-east-1.rds.amazonaws.com
Database: postgres
Usuário: claudio_aero
```

### 2. Sincronizar Dados

```bash
# Sincronizar todas as tabelas
python gis_cli.py sync

# Sincronizar tabela específica
python gis_cli.py sync --table planilha_campo

# Forçar sincronização (ignorar cache)
python gis_cli.py sync --force
```

### 3. Ver Estatísticas

```bash
python gis_cli.py stats
```

### 4. Verificar Status da Sincronização

```bash
python gis_cli.py sync-status
```

---

## 💻 Uso em Python

### Exemplo 1: Carregar Dados (Modo Online)

```python
from src.repository import TechDengueRepository

# Inicializar repositório
repo = TechDengueRepository()

# Buscar POIs
df_pois = repo.get_planilha_campo_all(limit=1000)

print(f"Total de POIs: {len(df_pois):,}")
print(df_pois.head())
```

### Exemplo 2: Usar Cache (Modo Offline)

```python
from src.sync import DataSynchronizer
import pandas as pd

# Sincronizar (se necessário)
sync = DataSynchronizer()
sync.sync_planilha_campo()

# Carregar do cache (rápido, offline)
df = pd.read_parquet('cache/planilha_campo.parquet')

print(f"Dados do cache: {len(df):,} linhas")
```

### Exemplo 3: Análise Temporal

```python
from src.repository import TechDengueRepository

repo = TechDengueRepository()

# Evolução mensal de POIs
df_evolucao = repo.get_evolucao_temporal_pois(intervalo='month')

print(df_evolucao)

# Visualizar
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plt.plot(df_evolucao['periodo'], df_evolucao['total_pois'])
plt.title('Evolução de POIs ao Longo do Tempo')
plt.xlabel('Período')
plt.ylabel('Total de POIs')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
```

### Exemplo 4: Query Geoespacial

```python
from src.repository import TechDengueRepository

repo = TechDengueRepository()

# POIs em raio de 1km de um ponto
lat, lon = -19.9167, -43.9345  # Belo Horizonte
raio_metros = 1000

df_proximos = repo.get_pois_em_raio(lat, lon, raio_metros)

print(f"POIs encontrados: {len(df_proximos)}")
print(df_proximos[['poi', 'descricao', 'distancia_metros']].head())
```

### Exemplo 5: Estatísticas por Categoria

```python
from src.repository import TechDengueRepository

repo = TechDengueRepository()

# POIs por categoria
df_categorias = repo.get_pois_por_categoria()

print(df_categorias)

# Visualizar
import seaborn as sns
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
sns.barplot(data=df_categorias.head(10), x='total_pois', y='categoria')
plt.title('Top 10 Categorias de POIs')
plt.xlabel('Total de POIs')
plt.tight_layout()
plt.show()
```

---

## 🔧 CLI - Comandos Disponíveis

### test-connection
Testa conexão com banco de dados
```bash
python gis_cli.py test-connection
```

### table-info
Mostra informações sobre uma tabela
```bash
python gis_cli.py table-info banco_techdengue
python gis_cli.py table-info planilha_campo
```

### stats
Exibe estatísticas das tabelas
```bash
python gis_cli.py stats
```

### sync
Sincroniza dados do servidor
```bash
# Todas as tabelas
python gis_cli.py sync

# Tabela específica
python gis_cli.py sync --table planilha_campo

# Forçar sincronização
python gis_cli.py sync --force
```

### sync-status
Mostra status da sincronização
```bash
python gis_cli.py sync-status
```

### query
Executa query personalizada
```bash
# Query simples
python gis_cli.py query "SELECT COUNT(*) FROM planilha_campo"

# Com limite de linhas
python gis_cli.py query "SELECT * FROM planilha_campo" --limit 10

# Salvar resultado
python gis_cli.py query "SELECT * FROM planilha_campo" --output resultado.csv
```

### export
Exporta dados para arquivo
```bash
# CSV
python gis_cli.py export planilha_campo dados_pois.csv

# Excel
python gis_cli.py export planilha_campo dados_pois.xlsx

# Parquet
python gis_cli.py export banco_techdengue dados_banco.parquet
```

---

## ⚙️ Configuração Avançada

### Variáveis de Ambiente (.env)

Crie arquivo `.env` na raiz do projeto:

```env
# Banco de Dados GIS
GIS_DB_HOST=ls-564b587f07ec660b943bc46eeb4d39a79a9eec4d.cul8kgow0o6q.us-east-1.rds.amazonaws.com
GIS_DB_PORT=5432
GIS_DB_NAME=postgres
GIS_DB_USERNAME=claudio_aero
GIS_DB_PASSWORD=123456
GIS_DB_SSL_MODE=require

# Cache
CACHE_ENABLED=true
CACHE_TTL_SECONDS=3600

# Logging
LOG_LEVEL=INFO
```

### Personalizar Configurações

```python
from src.config import Config

# Alterar TTL do cache
Config.CACHE_TTL_SECONDS = 7200  # 2 horas

# Desabilitar cache
Config.CACHE_ENABLED = False

# Alterar nível de log
Config.LOG_LEVEL = 'DEBUG'
```

---

## 📊 Casos de Uso

### Caso 1: Dashboard em Tempo Real

```python
from src.sync import DataSynchronizer
from src.repository import TechDengueRepository
import streamlit as st

# Sincronizar dados
sync = DataSynchronizer()
sync.sync_all()

# Carregar dados
repo = TechDengueRepository()
stats = repo.get_planilha_campo_stats()

# Dashboard
st.title("Dashboard TechDengue")
st.metric("Total de POIs", f"{stats['total_pois']:,}")
st.metric("Total de Atividades", f"{stats['total_atividades']:,}")
```

### Caso 2: Análise Comparativa (Excel vs Servidor)

```python
from src.sync import DataSynchronizer
from pathlib import Path

sync = DataSynchronizer()

# Comparar
excel_path = Path("base_dados/dados_techdengue/Atividades Techdengue.xlsx")
comparison = sync.compare_with_excel(excel_path)

print("COMPARAÇÃO:")
print(f"Servidor: {comparison['servidor']['total_pois']:,} POIs")
print(f"Excel: {comparison['excel']['total_pois']:,} POIs")
print(f"Diferença: {comparison['diferenca']['pois']:,} POIs")
```

### Caso 3: Atualização Automática (Agendada)

```python
import schedule
import time
from src.sync import DataSynchronizer

def sync_job():
    print("Iniciando sincronização agendada...")
    sync = DataSynchronizer()
    results = sync.sync_all(force=True)
    print(f"Sincronização concluída: {results}")

# Agendar para rodar a cada hora
schedule.every().hour.do(sync_job)

# Loop
while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 🔍 Troubleshooting

### Erro: "Connection refused"
**Causa:** Firewall ou VPN bloqueando conexão  
**Solução:** Verificar regras de firewall e conectar VPN se necessário

### Erro: "SSL connection required"
**Causa:** Servidor requer SSL  
**Solução:** Já configurado automaticamente (`sslmode=require`)

### Cache desatualizado
**Solução:** Forçar sincronização
```bash
python gis_cli.py sync --force
```

### Queries lentas
**Solução:** Usar cache local
```python
# Ao invés de:
df = repo.get_planilha_campo_all()

# Usar:
import pandas as pd
df = pd.read_parquet('cache/planilha_campo.parquet')
```

---

## 📚 Referências

- **PostgreSQL:** https://www.postgresql.org/docs/
- **PostGIS:** https://postgis.net/documentation/
- **psycopg2:** https://www.psycopg.org/docs/
- **pandas:** https://pandas.pydata.org/docs/

---

## ✅ Checklist de Implementação

- [x] Configuração do sistema
- [x] Gerenciador de conexões
- [x] Modelos de dados
- [x] Repositório (queries)
- [x] Sincronizador
- [x] CLI completo
- [x] Documentação
- [ ] Testes unitários
- [ ] Dashboard web
- [ ] API REST
- [ ] Monitoramento

---

**Versão:** 1.0.0  
**Data:** 30 de Outubro de 2025  
**Status:** ✅ Produção
