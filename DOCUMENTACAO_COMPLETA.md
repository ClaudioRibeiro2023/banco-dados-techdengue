# 🦟 TechDengue Analytics - Documentação Completa

> **Plataforma de Análise de Dados para Combate à Dengue em Minas Gerais**

**Versão:** 1.0.0  
**Última Atualização dos Dados:** 09 de Dezembro de 2025  
**Gerado em:** 09/12/2025 às 18:36 (UTC-3)

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Datasets Disponíveis](#datasets-disponíveis)
4. [Endpoints da API](#endpoints-da-api)
5. [Interfaces de Usuário](#interfaces-de-usuário)
6. [Possibilidades de Uso](#possibilidades-de-uso)
7. [Qualidade dos Dados](#qualidade-dos-dados)
8. [Próximos Passos](#próximos-passos)
9. [Como Executar](#como-executar)

---

## 🎯 Visão Geral

O **TechDengue Analytics** é uma plataforma completa de análise de dados desenvolvida para apoiar as operações de combate à dengue no estado de Minas Gerais. O sistema integra dados de múltiplas fontes, incluindo:

- Atividades de mapeamento de campo
- Dados epidemiológicos históricos
- Informações geográficas dos municípios
- Pontos de Interesse (POIs) georreferenciados

### Números Atuais

| Métrica | Valor |
|---------|-------|
| **Total de POIs** | 314.880 |
| **Devolutivas** | 56.956 |
| **Hectares Mapeados** | 139.499,59 |
| **Atividades Registradas** | 1.281 |
| **Municípios Cobertos** | 624 |
| **Casos de Dengue (histórico)** | 124.684 registros |
| **Total de Municípios MG** | 853 |

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Frontend React │ Dashboard       │   Swagger/ReDoc         │
│  (porta 4012)   │ Streamlit       │   (porta 4010/docs)     │
│                 │ (porta 4011)    │                         │
├─────────────────┴─────────────────┴─────────────────────────┤
│                      CAMADA DE API                           │
│                    FastAPI (porta 4010)                      │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE DADOS                           │
├──────────────────┬──────────────────┬───────────────────────┤
│  Parquet Files   │  PostgreSQL/     │   Data Lake           │
│  (dados_integra- │  PostGIS (RDS)   │   (Medallion)         │
│  dos/)           │                  │                       │
└──────────────────┴──────────────────┴───────────────────────┘
```

### Arquitetura de Dados (Medallion)

```
Bronze (Dados Brutos)     → Silver (Dados Limpos)     → Gold (Dados Analíticos)
     ↓                           ↓                           ↓
base_dados/               dados_integrados/           data_lake/gold/
├── dados_techdengue/     ├── fato_atividades.parquet ├── mega_tabela_analitica.parquet
├── IBGE/                 ├── fato_dengue.parquet     └── analise_integrada.parquet
└── SES/                  └── dim_municipios.parquet
```

---

## 📊 Datasets Disponíveis

### 1. Fato Atividades TechDengue
**Arquivo:** `fato_atividades_techdengue.parquet`  
**Registros:** 1.281  
**Colunas:** 17  
**Qualidade:** ✅ 95.77% (4.23% nulos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo_ibge` | string | Código IBGE do município |
| `municipio` | string | Nome do município |
| `data_map` | date | Data do mapeamento |
| `nomenclatura_atividade` | string | Identificador da atividade |
| `pois` | integer | Quantidade de POIs identificados |
| `devolutivas` | float | Devolutivas realizadas |
| `hectares_mapeados` | float | Área mapeada em hectares |

**Exemplo de registro:**
```json
{
  "codigo_ibge": "3100104",
  "municipio": "ABADIA DOS DOURADOS",
  "data_map": "2025-02-26",
  "nomenclatura_atividade": "ATV.13_ABADIA.DOURADOS",
  "pois": 140,
  "devolutivas": 0.0,
  "hectares_mapeados": 49.75
}
```

---

### 2. Fato Dengue Histórico
**Arquivo:** `fato_dengue_historico.parquet`  
**Registros:** 124.684  
**Colunas:** 7  
**Qualidade:** ✅ 100% (0% nulos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo_ibge` | string | Código IBGE do município |
| `municipio` | string | Nome do município |
| `casos` | integer | Número de casos de dengue |
| `semana_epidemiologica` | integer | Semana epidemiológica (1-52) |
| `ano` | integer | Ano de referência |
| `data_carga` | datetime | Data de carregamento |
| `versao` | string | Versão do dataset |

**Cobertura temporal:** 2023 - 2025

---

### 3. Dimensão Municípios
**Arquivo:** `dim_municipios.parquet`  
**Registros:** 853 (todos os municípios de MG)  
**Colunas:** 11  
**Qualidade:** ✅ 100% (0% nulos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo_ibge` | string | Código IBGE |
| `municipio` | string | Nome do município |
| `populacao` | string | População estimada |
| `urs` | string | Unidade Regional de Saúde |
| `cod_microregiao` | integer | Código da microrregião |
| `microregiao_saude` | string | Nome da microrregião |
| `cod_macroregiao` | integer | Código da macrorregião |
| `macroregiao_saude` | string | Nome da macrorregião |
| `area_ha` | float | Área em hectares |

---

### 4. Análise Integrada
**Arquivo:** `analise_integrada.parquet`  
**Registros:** 1.229  
**Colunas:** 7  
**Qualidade:** ✅ 100% (0% nulos)

Dados agregados por município e competência (mês).

---

### 5. Dados GIS (PostgreSQL/PostGIS)

**Conexão:** AWS RDS PostgreSQL  
**Status:** ✅ Conectado

#### Tabela: `banco_techdengue`
Contém metadados das atividades de campo.

#### Tabela: `planilha_campo`
Pontos de interesse georreferenciados com coordenadas lat/long.

**Exemplo de POI:**
```json
{
  "id": 567549,
  "nome": "PT_50",
  "lat": -15.75337252,
  "long": -43.02107119,
  "geom_json": {"type": "Point", "coordinates": [-43.021, -15.753]},
  "data_criacao": "2025-11-11T15:46:30"
}
```

---

## 🔌 Endpoints da API

**Base URL:** `http://localhost:4010`

### Health & Monitoramento

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Status de saúde da API |
| `/monitor` | GET | Dashboard de monitoramento completo |
| `/quality` | GET | Relatório de qualidade dos dados |
| `/datasets` | GET | Catálogo de datasets disponíveis |

### Atividades TechDengue

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/facts` | GET | Lista atividades com paginação e filtros |
| `/facts/summary` | GET | Resumo agregado das atividades |

**Parâmetros de `/facts`:**
- `codigo_ibge` - Filtrar por município
- `nomenclatura_atividade` - Filtrar por atividade
- `start_date`, `end_date` - Filtrar por período
- `limit`, `offset` - Paginação (máx 1000)
- `sort_by`, `order` - Ordenação
- `format` - json, csv ou parquet

### Dados Epidemiológicos

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/dengue` | GET | Histórico de casos de dengue |

### Municípios

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/municipios` | GET | Dados dos 853 municípios de MG |

**Parâmetros:**
- `q` - Busca por nome
- `codigo_ibge` - Filtrar por código

### Análise Gold

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/gold/analise` | GET | Dados consolidados para análise |

### GIS/Geoespacial

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/gis/banco` | GET | Dados do banco TechDengue |
| `/gis/pois` | GET | POIs georreferenciados |

**Parâmetros de `/gis/pois`:**
- `limit` - Máximo 2000
- `id_atividade` - Filtrar por atividade

---

## 🖥️ Interfaces de Usuário

### 1. Frontend React (http://localhost:4012)

Dashboard moderno com:
- **Monitor de Qualidade** - Status em tempo real
- **Página de Qualidade** - Validações detalhadas
- **Tabela de Dados** - Exploração interativa

Tecnologias: React 18, TailwindCSS, Radix UI, Recharts, React Query

### 2. Dashboard Streamlit (http://localhost:4011)

Dashboard executivo com:
- KPIs principais
- Treemaps de distribuição
- Gráficos Sunburst
- Scatter 3D multidimensional
- Gauge de qualidade
- Radar de performance

### 3. Swagger/OpenAPI (http://localhost:4010/docs)

Documentação interativa da API com:
- Todos os endpoints documentados
- Exemplos de requisições
- Teste direto no navegador

### 4. ReDoc (http://localhost:4010/redoc)

Documentação alternativa com layout limpo.

---

## 💡 Possibilidades de Uso

### 1. Análise Operacional

```python
# Verificar atividades de um município específico
GET /facts?codigo_ibge=3100104

# Resumo por município
GET /facts/summary?group_by=municipio

# Exportar dados para análise externa
GET /facts?format=csv
```

### 2. Monitoramento Epidemiológico

```python
# Casos de dengue por município
GET /dengue?codigo_ibge=3100104

# Série temporal de casos
GET /dengue?limit=1000&sort_by=ano&order=asc
```

### 3. Análise Geoespacial

```python
# POIs de uma atividade específica
GET /gis/pois?id_atividade=ATV.13_ABADIA.DOURADOS

# Exportar para GIS
GET /gis/pois?limit=2000
```

### 4. Relatórios e Dashboards

```python
# Dados consolidados para dashboard
GET /monitor

# Relatório de qualidade
GET /quality

# Análise integrada
GET /gold/analise?limit=100
```

### 5. Integração com Outras Ferramentas

- **Power BI / Tableau**: Conectar via endpoints REST
- **Python/Pandas**: Usar formato Parquet
- **QGIS/ArcGIS**: Importar POIs do `/gis/pois`
- **Excel**: Exportar via formato CSV

---

## 📈 Qualidade dos Dados

### Score Geral: 100/100 ✅

| Dataset | Status | Registros | Colunas | Nulos |
|---------|--------|-----------|---------|-------|
| fato_atividades_techdengue | ✅ Passed | 1.281 | 17 | 4.23% |
| fato_dengue_historico | ✅ Passed | 124.684 | 7 | 0.00% |
| dim_municipios | ✅ Passed | 853 | 11 | 0.00% |
| analise_integrada | ✅ Passed | 1.229 | 7 | 0.00% |

### Validações Realizadas

- ✅ Integridade referencial entre datasets
- ✅ Consistência de códigos IBGE
- ✅ Completude das séries temporais
- ✅ Conexão com banco PostgreSQL/PostGIS

---

## 🚀 Próximos Passos - Data as a Service (DaaS)

> **Objetivo:** Transformar a base TechDengue em uma fonte de dados rápida, eficiente e de alto valor agregado para servir múltiplas aplicações.

---

### 🎯 Fase 1: Fundação da Plataforma de Dados (Semana 1-2)

#### 1.1 Otimização de Performance

| Ação | Impacto | Esforço |
|------|---------|---------|
| Implementar Redis para cache de queries frequentes | Alto | Médio |
| Criar índices otimizados no PostgreSQL | Alto | Baixo |
| Configurar connection pooling (PgBouncer) | Médio | Baixo |
| Implementar compressão Gzip nas respostas | Médio | Baixo |

```yaml
# Adicionar ao docker-compose.yml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

#### 1.2 Versionamento de API

```
/api/v1/facts      # Versão estável
/api/v2/facts      # Versão com breaking changes
```

- Manter retrocompatibilidade por 6 meses
- Deprecation headers para endpoints antigos
- Changelog automático via OpenAPI

#### 1.3 Rate Limiting & Throttling

| Tier | Requests/min | Requests/dia | Uso |
|------|--------------|--------------|-----|
| Free | 60 | 1.000 | Testes/Desenvolvimento |
| Standard | 300 | 10.000 | Aplicações internas |
| Premium | 1.000 | 100.000 | Sistemas de produção |

---

### 🔐 Fase 2: Segurança & Autenticação (Semana 2-3)

#### 2.1 API Keys Management

```python
# Exemplo de uso
curl -H "X-API-Key: tk_live_abc123..." \
     "https://api.techdengue.mg.gov.br/v1/facts"
```

- Dashboard de gerenciamento de chaves
- Revogação instantânea
- Métricas por chave (uso, latência, erros)

#### 2.2 OAuth2 para Aplicações Avançadas

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

- Scopes granulares: `read:facts`, `read:dengue`, `read:gis`
- Refresh tokens com rotação automática
- SSO com Azure AD / Google Workspace

#### 2.3 Audit & Compliance

- Log de todas as requisições (quem, quando, o quê)
- Retenção de logs por 12 meses
- Relatórios de acesso por período

---

### 📊 Fase 3: Enriquecimento de Dados (Semana 3-4)

#### 3.1 Novos Datasets de Alto Valor

| Dataset | Fonte | Frequência | Valor |
|---------|-------|------------|-------|
| Clima/Precipitação | INMET | Diária | Correlação com surtos |
| Dados Socioeconômicos | IBGE | Anual | Análise de vulnerabilidade |
| Focos do mosquito | LIRAa/LIRa+ | Bimestral | Índice de infestação |
| Notificações SINAN | DataSUS | Semanal | Dados oficiais |

#### 3.2 Dados Derivados (Analytics)

```json
GET /v1/analytics/risco?codigo_ibge=3106200

{
  "municipio": "Belo Horizonte",
  "indice_risco": 0.73,
  "classificacao": "ALTO",
  "fatores": [
    {"fator": "historico_casos", "peso": 0.4, "score": 0.85},
    {"fator": "cobertura_mapeamento", "peso": 0.3, "score": 0.62},
    {"fator": "densidade_populacional", "peso": 0.3, "score": 0.71}
  ],
  "tendencia": "CRESCENTE",
  "previsao_proximas_4_semanas": 234
}
```

#### 3.3 Agregações Pré-computadas

- Resumos por macrorregião, microrregião, município
- Séries temporais por semana epidemiológica
- Rankings e comparativos

---

### 🔄 Fase 4: Integração & Interoperabilidade (Semana 4-5)

#### 4.1 Formatos de Saída

| Formato | Endpoint | Uso Típico |
|---------|----------|------------|
| JSON | `/facts` | APIs REST, JavaScript |
| CSV | `/facts?format=csv` | Excel, BI Tools |
| Parquet | `/facts?format=parquet` | Python, Spark, DataBricks |
| GeoJSON | `/gis/pois?format=geojson` | QGIS, Mapbox, Leaflet |
| GraphQL | `/graphql` | Queries flexíveis |

#### 4.2 Webhooks para Eventos

```json
POST https://seu-sistema.com/webhook
{
  "event": "dados.atualizados",
  "timestamp": "2025-12-09T18:00:00Z",
  "dataset": "fato_atividades_techdengue",
  "changes": {
    "added": 45,
    "updated": 12,
    "deleted": 0
  }
}
```

#### 4.3 SDKs e Client Libraries

```python
# Python SDK
from techdengue import TechDengueClient

client = TechDengueClient(api_key="tk_live_...")
atividades = client.facts.list(municipio="Belo Horizonte", limit=100)
```

```javascript
// JavaScript SDK
import { TechDengue } from '@techdengue/sdk';

const client = new TechDengue({ apiKey: 'tk_live_...' });
const data = await client.facts.list({ codigoIbge: '3106200' });
```

---

### 📈 Fase 5: Observabilidade & SLA (Semana 5-6)

#### 5.1 Métricas de Performance

| Métrica | Target | Atual |
|---------|--------|-------|
| Latência P50 | < 100ms | ~80ms |
| Latência P99 | < 500ms | ~350ms |
| Disponibilidade | 99.9% | 99.5% |
| Taxa de erro | < 0.1% | 0.05% |

#### 5.2 Health Dashboard

```
GET /v1/status

{
  "status": "healthy",
  "uptime": "15d 4h 32m",
  "databases": {
    "parquet": {"status": "ok", "latency_ms": 12},
    "postgresql": {"status": "ok", "latency_ms": 45}
  },
  "cache": {"hit_rate": 0.87, "size_mb": 256},
  "last_data_update": "2025-12-09T15:00:00Z"
}
```

#### 5.3 Alerting

- Slack/Teams para incidentes
- PagerDuty para SLA críticos
- Relatórios semanais de performance

---

### 🏗️ Arquitetura Alvo

```
                                    ┌─────────────────┐
                                    │   CDN/Cache     │
                                    │   (CloudFlare)  │
                                    └────────┬────────┘
                                             │
┌─────────────┐    ┌─────────────┐    ┌──────▼──────┐    ┌─────────────┐
│ App Mobile  │───▶│             │    │             │    │             │
├─────────────┤    │   API       │◀──▶│   Redis     │◀──▶│ PostgreSQL  │
│ Dashboard   │───▶│   Gateway   │    │   Cache     │    │   + GIS     │
├─────────────┤    │             │    │             │    │             │
│ BI Tools    │───▶│             │    └─────────────┘    └─────────────┘
├─────────────┤    └──────┬──────┘                              │
│ Sistemas    │           │                               ┌─────▼─────┐
│ Externos    │───▶       │                               │  Parquet  │
└─────────────┘    ┌──────▼──────┐                        │  (S3/MinIO)│
                   │  FastAPI    │                        └───────────┘
                   │  Workers    │
                   │  (Uvicorn)  │
                   └─────────────┘
```

---

### 📋 Checklist de Implementação

#### Fase 1 - Fundação
- [ ] Adicionar Redis ao docker-compose
- [ ] Implementar cache decorator nos endpoints
- [ ] Configurar versionamento de API (`/api/v1/`)
- [ ] Implementar rate limiting com slowapi
- [ ] Adicionar compressão Gzip

#### Fase 2 - Segurança
- [ ] Criar tabela de API Keys
- [ ] Implementar middleware de autenticação
- [ ] Dashboard de gerenciamento de chaves
- [ ] Logs de auditoria

#### Fase 3 - Enriquecimento
- [ ] Pipeline de ingestão INMET
- [ ] Endpoint de analytics/risco
- [ ] Agregações pré-computadas
- [ ] Documentação de campos

#### Fase 4 - Integração
- [ ] Endpoint GraphQL
- [ ] Suporte a GeoJSON
- [ ] Sistema de webhooks
- [ ] SDK Python básico

#### Fase 5 - Observabilidade
- [ ] Dashboard Grafana
- [ ] Alertas Slack
- [ ] Página de status pública
- [ ] Relatórios de SLA

---

### 💰 Valor Agregado para Consumidores

| Consumidor | Valor Entregue |
|------------|----------------|
| **Prefeituras** | Dados de mapeamento e risco por município |
| **SES-MG** | Visão consolidada estadual, séries temporais |
| **Pesquisadores** | Datasets históricos para análise |
| **Startups HealthTech** | API para apps de combate à dengue |
| **Jornalistas** | Dados públicos para reportagens |
| **Cidadãos** | Consulta de situação do bairro |

---

### ⏱️ Timeline Estimada

```
Semana 1-2: Fase 1 (Performance & Versionamento)
     │
Semana 2-3: Fase 2 (Segurança & API Keys)
     │
Semana 3-4: Fase 3 (Enriquecimento de Dados)
     │
Semana 4-5: Fase 4 (SDKs & Webhooks)
     │
Semana 5-6: Fase 5 (Observabilidade & SLA)
     │
Semana 7+:  Lançamento Beta → GA
```

---

## 🐳 Como Executar

### Pré-requisitos

- Docker Desktop instalado
- Git
- 4GB RAM mínimo

### Inicialização Rápida

```bash
# Clonar repositório
git clone <repository-url>
cd banco-dados-techdengue

# Iniciar todos os serviços
docker compose up -d

# Verificar status
docker compose ps
```

### URLs Disponíveis

| Serviço | URL |
|---------|-----|
| API FastAPI | http://localhost:4010 |
| Swagger Docs | http://localhost:4010/docs |
| ReDoc | http://localhost:4010/redoc |
| Dashboard Streamlit | http://localhost:4011 |
| Frontend React | http://localhost:4012 |

### Comandos Úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Reiniciar um serviço específico
docker compose restart api

# Parar todos os serviços
docker compose down

# Rebuild após alterações
docker compose build --no-cache
docker compose up -d
```

---

## 📞 Suporte

Para dúvidas ou sugestões, consulte a documentação técnica em `/docs` ou abra uma issue no repositório.

---

**TechDengue Analytics** - Tecnologia no combate à Dengue 🦟
