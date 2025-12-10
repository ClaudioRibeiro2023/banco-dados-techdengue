# 🦟 TechDengue API - Guia Técnico de Integração

**Versão:** 2.0.0  
**Data:** Dezembro 2025  
**Ambientes:**

| Ambiente | URL | Status |
|----------|-----|--------|
| **Frontend (Dashboard)** | https://banco-dados-techdengue.netlify.app | 🟢 Produção |
| **API (Backend)** | https://banco-dados-techdengue-production.up.railway.app | 🟢 Produção |
| **API (Local)** | http://localhost:8000 | 🔧 Desenvolvimento |

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Autenticação](#3-autenticação)
4. [Endpoints](#4-endpoints)
5. [SDK Python](#5-sdk-python)
6. [Integração via cURL](#6-integração-via-curl)
7. [Webhooks e Alertas](#7-webhooks-e-alertas)
8. [Rate Limiting](#8-rate-limiting)
9. [Cache e Performance](#9-cache-e-performance)
10. [Tratamento de Erros](#10-tratamento-de-erros)
11. [Exemplos de Integração](#11-exemplos-de-integração)
12. [Referência de Dados](#12-referência-de-dados)

---

## 1. Visão Geral

A **TechDengue API** é uma plataforma de dados como serviço (DaaS) focada em:

- **Dados epidemiológicos** de dengue em Minas Gerais
- **Atividades de mapeamento** TechDengue (314k+ POIs)
- **Dados climáticos** em tempo real (OpenWeather)
- **Análise preditiva** de risco com IA (Llama 3.3)
- **Informações geográficas** dos 853 municípios de MG

### Casos de Uso

| Caso de Uso | Endpoints Relevantes |
|-------------|---------------------|
| Dashboards de saúde pública | `/api/v1/risk/dashboard`, `/monitor` |
| Sistemas de alerta epidemiológico | `/api/v1/weather/{cidade}/risk`, `/api/v1/risk/analyze` |
| Integração com BI (Power BI, Tableau) | `/facts`, `/dengue`, `/gold` (formato CSV) |
| Apps móveis de prevenção | `/api/v1/weather`, `/municipios` |
| Pesquisa acadêmica | `/datasets`, exportação em Parquet |

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                  │
│  (Apps, BI Tools, Sistemas de Saúde, Dashboards)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway (FastAPI)                          │
│  ┌──────────┬───────────┬───────────┬────────────────────────┐  │
│  │ GZip     │ Rate      │ API Keys  │ Audit Logs             │  │
│  │ Compress │ Limiting  │ Auth      │ (todas requisições)    │  │
│  └──────────┴───────────┴───────────┴────────────────────────┘  │
│                                                                  │
│  Endpoints: /health, /facts, /dengue, /municipios, /gold        │
│             /api/v1/weather, /api/v1/risk, /api/v1/keys         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Redis     │  │  PostgreSQL  │  │   Parquet    │
│   (Cache)    │  │   (PostGIS)  │  │   (Gold)     │
└──────────────┘  └──────────────┘  └──────────────┘
                          │
                          ▼
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  OpenWeather │  │    Groq      │  │   Sentry     │
│   (Clima)    │  │   (IA/LLM)   │  │ (Monitoring) │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| API Framework | FastAPI | 0.115+ |
| Banco de Dados | PostgreSQL/PostGIS | 14+ |
| Cache | Redis | 7+ |
| AI/ML | Groq (Llama 3.3 70B) | - |
| Clima | OpenWeather API | 2.5 |
| Observabilidade | Sentry | 2.0+ |
| Container | Docker Compose | 3.8+ |

---

## 3. Autenticação

### 3.1 Endpoints Públicos (sem autenticação)

Os seguintes endpoints são acessíveis sem API Key:

```
GET /health
GET /docs
GET /redoc
GET /facts (com rate limit)
GET /dengue (com rate limit)
GET /municipios (com rate limit)
GET /api/v1/weather/{cidade}
GET /api/v1/audit/stats
```

### 3.2 Endpoints Protegidos (requerem API Key)

```
POST /api/v1/cache/clear
GET  /api/v1/keys
DELETE /api/v1/keys/{id}
GET  /api/v1/audit/logs
```

### 3.3 Obter uma API Key

```bash
# Criar nova API Key
curl -X POST "https://techdengue-api.railway.app/api/v1/keys" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Aplicação",
    "owner": "meu-email@exemplo.com",
    "tier": "standard"
  }'
```

**Resposta:**
```json
{
  "key": "tk_live_xxxxxxxxxxxxxxxxxxx",
  "key_id": "tk_xxxxxxxx",
  "name": "Minha Aplicação",
  "tier": "standard",
  "created_at": "2025-12-09T22:30:00Z"
}
```

> ⚠️ **IMPORTANTE**: Salve a chave completa! Ela só é exibida uma vez.

### 3.4 Usar API Key

Inclua no header `X-API-Key`:

```bash
curl -H "X-API-Key: tk_live_xxxxx" \
  "https://techdengue-api.railway.app/api/v1/keys"
```

### 3.5 Tiers de Acesso

| Tier | Rate Limit | Uso |
|------|------------|-----|
| `free` | 60/min | Testes e desenvolvimento |
| `standard` | 300/min | Aplicações internas |
| `premium` | 1000/min | Sistemas de produção |
| `admin` | ilimitado | Administração |

---

## 4. Endpoints

### 4.1 Health & Status

```http
GET /health
```
Retorna status básico da API.

```http
GET /api/v1/status
```
Retorna status detalhado incluindo cache, features ativas e rate limits.

### 4.2 Dados de Atividades (Facts)

```http
GET /facts?limit=100&offset=0&format=json
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `limit` | int | Máximo de registros (default: 100, max: 10000) |
| `offset` | int | Offset para paginação |
| `format` | string | `json`, `csv` ou `parquet` |
| `q` | string | Busca por município |
| `fields` | string | Campos específicos (separados por vírgula) |

### 4.3 Casos de Dengue

```http
GET /dengue?limit=100&ano=2024
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `limit` | int | Máximo de registros |
| `offset` | int | Offset |
| `ano` | int | Filtrar por ano |
| `q` | string | Busca por município |

### 4.4 Municípios

```http
GET /municipios?limit=100&q=Belo
```

### 4.5 Dados Climáticos

```http
GET /api/v1/weather/{cidade}
```

**Exemplo:**
```bash
curl "https://techdengue-api.railway.app/api/v1/weather/Belo%20Horizonte"
```

**Resposta:**
```json
{
  "cidade": "Belo Horizonte",
  "estado": "MG",
  "temperatura": 28.5,
  "sensacao_termica": 30.2,
  "umidade": 72,
  "pressao": 1015,
  "velocidade_vento": 3.2,
  "nebulosidade": 40,
  "chuva_1h": 0,
  "descricao": "parcialmente nublado",
  "indice_favorabilidade_dengue": 68.5,
  "timestamp": "2025-12-09T22:30:00Z"
}
```

```http
GET /api/v1/weather
```
Retorna clima de todas as principais cidades de MG.

```http
GET /api/v1/weather/{cidade}/risk
```
Retorna análise de risco baseada em condições climáticas.

### 4.6 Análise de Risco com IA

```http
POST /api/v1/risk/analyze
Content-Type: application/json

{
  "municipio": "Uberlândia",
  "codigo_ibge": "3170206",
  "casos_recentes": 150,
  "casos_ano_anterior": 80,
  "temperatura_media": 28.5,
  "umidade_media": 75,
  "populacao": 700000,
  "cobertura_saneamento": 92.5,
  "acoes_recentes": ["Mutirão de limpeza", "Nebulização"]
}
```

**Resposta:**
```json
{
  "municipio": "Uberlândia",
  "nivel_risco": "alto",
  "score_risco": 72.5,
  "tendencia": "aumentando",
  "fatores_principais": [
    "Aumento de 87% vs ano anterior",
    "Temperatura ideal para o vetor (28.5°C)",
    "Umidade elevada (75%)"
  ],
  "recomendacoes": [
    "Intensificar ações de controle vetorial",
    "Realizar mutirões de limpeza",
    "Ampliar campanhas de conscientização"
  ],
  "analise_detalhada": "O município de Uberlândia apresenta risco alto...",
  "confianca": 0.85,
  "modelo_usado": "llama-3.3-70b-versatile",
  "timestamp": "2025-12-09T22:30:00Z"
}
```

```http
GET /api/v1/risk/municipio/{codigo_ibge}
```
Análise de risco de um município específico.

```http
GET /api/v1/risk/dashboard
```
Dashboard consolidado de risco regional.

### 4.7 Administração

```http
GET /api/v1/cache/stats
```
Estatísticas do cache.

```http
POST /api/v1/cache/clear?pattern=weather
X-API-Key: {sua_key}
```
Limpa cache por padrão.

```http
GET /api/v1/audit/stats
```
Estatísticas de uso da API.

```http
GET /api/v1/audit/logs?limit=100&min_status=400
X-API-Key: {sua_key}
```
Logs de auditoria.

---

## 5. SDK Python

### 5.1 Instalação

```bash
pip install git+https://github.com/techdengue/techdengue-sdk-python.git
```

Ou localmente:
```bash
cd sdk/python
pip install -e .
```

### 5.2 Uso Básico

```python
from techdengue import TechDengueClient

# Inicializar
client = TechDengueClient(
    base_url="https://techdengue-api.railway.app",
    api_key="tk_live_xxxxx"  # opcional
)

# Obter clima
weather = client.get_weather("Belo Horizonte")
print(f"Temp: {weather.temperatura}°C")
print(f"Risco dengue: {weather.indice_favorabilidade_dengue}")

# Análise de risco com IA
risk = client.analyze_risk(
    municipio="Uberlândia",
    casos_recentes=150,
    casos_ano_anterior=80,
    temperatura_media=28.5
)
print(f"Nível: {risk.nivel_risco}")
print(f"Recomendações: {risk.recomendacoes}")

# Dashboard de risco
dashboard = client.get_risk_dashboard()
for cidade in dashboard["cidades"]:
    if cidade["risco_climatico"] in ("alto", "critico"):
        print(f"⚠️ {cidade['cidade']}: {cidade['score']}")
```

### 5.3 Cliente Assíncrono

```python
import asyncio
from techdengue.client import AsyncTechDengueClient

async def main():
    async with AsyncTechDengueClient() as client:
        weather = await client.get_weather("BH")
        dashboard = await client.get_risk_dashboard()
        return dashboard

result = asyncio.run(main())
```

---

## 6. Integração via cURL

### 6.1 Obter Dados de Dengue (JSON)

```bash
curl -s "https://techdengue-api.railway.app/dengue?limit=10&ano=2024" \
  | jq '.data[].municipio'
```

### 6.2 Exportar para CSV

```bash
curl -s "https://techdengue-api.railway.app/facts?format=csv&limit=1000" \
  -o atividades.csv
```

### 6.3 Análise de Risco

```bash
curl -X POST "https://techdengue-api.railway.app/api/v1/risk/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "municipio": "Contagem",
    "casos_recentes": 200,
    "casos_ano_anterior": 100,
    "populacao": 660000
  }'
```

### 6.4 Dashboard de Risco

```bash
curl -s "https://techdengue-api.railway.app/api/v1/risk/dashboard" \
  | jq '{
    total: .total_cidades,
    criticos: .resumo.critico,
    alerta: .alerta
  }'
```

---

## 7. Webhooks e Alertas

### 7.1 Configurar Webhook de Alerta (Exemplo)

```python
import requests
import schedule
import time

WEBHOOK_URL = "https://seu-sistema.com/webhook/dengue"

def verificar_alertas():
    response = requests.get("https://techdengue-api.railway.app/api/v1/risk/dashboard")
    data = response.json()
    
    if data.get("alerta"):
        # Enviar alerta
        requests.post(WEBHOOK_URL, json={
            "tipo": data["alerta"]["tipo"],
            "severidade": data["alerta"]["severidade"],
            "mensagem": data["alerta"]["mensagem"],
            "cidades": data["alerta"]["cidades"],
        })

# Verificar a cada 30 minutos
schedule.every(30).minutes.do(verificar_alertas)

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 8. Rate Limiting

### 8.1 Limites por Tier

| Tier | Requisições/min | Requisições/dia |
|------|-----------------|-----------------|
| Free (sem key) | 60 | 1.000 |
| Standard | 300 | 10.000 |
| Premium | 1.000 | 100.000 |

### 8.2 Headers de Rate Limit

Toda resposta inclui headers informativos:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 55
X-RateLimit-Reset: 1702159800
```

### 8.3 Resposta de Rate Limit Excedido

```json
{
  "error": "rate_limit_exceeded",
  "message": "Muitas requisições. Aguarde antes de tentar novamente.",
  "retry_after": "60 seconds",
  "tier": "free"
}
```

---

## 9. Cache e Performance

### 9.1 TTLs de Cache

| Endpoint | TTL | Motivo |
|----------|-----|--------|
| `/api/v1/weather/{cidade}` | 30 min | Dados atualizam frequentemente |
| `/api/v1/risk/analyze` | 1 hora | Análise computacionalmente intensiva |
| `/facts`, `/dengue` | 1 hora | Dados estáveis |
| `/municipios` | 24 horas | Dados raramente mudam |

### 9.2 Verificar Cache

```bash
curl "https://techdengue-api.railway.app/api/v1/cache/stats"
```

```json
{
  "cache": {
    "hits": 1523,
    "misses": 234,
    "hit_rate": 0.867,
    "backend": "redis"
  },
  "ttl_seconds": 3600
}
```

### 9.3 Invalidar Cache

```bash
# Limpar cache de clima
curl -X POST "https://techdengue-api.railway.app/api/v1/cache/clear?pattern=weather" \
  -H "X-API-Key: tk_xxxxx"

# Limpar todo o cache
curl -X POST "https://techdengue-api.railway.app/api/v1/cache/clear" \
  -H "X-API-Key: tk_xxxxx"
```

---

## 10. Tratamento de Erros

### 10.1 Códigos HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | API Key necessária |
| 403 | Permissão negada (tier insuficiente) |
| 404 | Recurso não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno |

### 10.2 Formato de Erro

```json
{
  "error": "codigo_do_erro",
  "message": "Descrição legível do erro",
  "details": {}
}
```

### 10.3 Exemplo de Tratamento (Python)

```python
from techdengue import TechDengueClient
from techdengue.client import TechDengueError

client = TechDengueClient()

try:
    weather = client.get_weather("CidadeInexistente")
except TechDengueError as e:
    if e.error.status_code == 404:
        print(f"Cidade não encontrada")
    elif e.error.status_code == 429:
        print(f"Rate limit excedido, aguardando...")
        time.sleep(60)
    else:
        print(f"Erro: {e.error.message}")
```

---

## 11. Exemplos de Integração

### 11.1 Power BI / Tableau

**URL de Dados:**
```
https://techdengue-api.railway.app/gold?format=csv&limit=10000
```

**Configuração no Power BI:**
1. Obter Dados > Web
2. URL: `https://techdengue-api.railway.app/gold?format=csv`
3. Atualização: Diária

### 11.2 Sistema de Alerta por Email (Python)

```python
import smtplib
from email.mime.text import MIMEText
from techdengue import TechDengueClient

def enviar_alerta(dashboard):
    if dashboard.get("alerta"):
        msg = MIMEText(f"""
        ALERTA DE DENGUE - TechDengue
        
        Tipo: {dashboard['alerta']['tipo']}
        Severidade: {dashboard['alerta']['severidade']}
        Mensagem: {dashboard['alerta']['mensagem']}
        Cidades: {', '.join(dashboard['alerta']['cidades'])}
        """)
        msg['Subject'] = f"[ALERTA] Dengue - {dashboard['alerta']['tipo']}"
        # Configurar SMTP e enviar

client = TechDengueClient()
dashboard = client.get_risk_dashboard()
enviar_alerta(dashboard)
```

### 11.3 Aplicativo React

```typescript
// api.ts
const BASE_URL = 'https://techdengue-api.railway.app';

export async function getWeather(cidade: string) {
  const response = await fetch(`${BASE_URL}/api/v1/weather/${cidade}`);
  return response.json();
}

export async function getRiskDashboard() {
  const response = await fetch(`${BASE_URL}/api/v1/risk/dashboard`);
  return response.json();
}

// Componente
function DengueDashboard() {
  const [dashboard, setDashboard] = useState(null);
  
  useEffect(() => {
    getRiskDashboard().then(setDashboard);
  }, []);
  
  return (
    <div>
      {dashboard?.cidades.map(cidade => (
        <CidadeRiscoCard 
          key={cidade.cidade}
          {...cidade}
        />
      ))}
    </div>
  );
}
```

---

## 12. Referência de Dados

### 12.1 Datasets Disponíveis

| Dataset | Registros | Atualização | Formato |
|---------|-----------|-------------|---------|
| fato_atividades_techdengue | 1.281 | Mensal | Parquet |
| dengue_mg | 124.000+ | Semanal | Parquet |
| dim_municipios | 853 | Anual | Parquet |
| analise_integrada | Gold | Sob demanda | Parquet |

### 12.2 Campos Principais

**Atividades TechDengue:**
```
codigo_ibge, municipio, data_mapeamento, atividade,
hectares, pois, status, operador
```

**Casos de Dengue:**
```
ano, semana_epidemiologica, codigo_ibge, municipio,
casos_notificados, casos_confirmados, incidencia
```

**Municípios:**
```
codigo_ibge, nome_municipio, mesorregiao, microrregiao,
populacao, area_km2, latitude, longitude
```

### 12.3 Cobertura Geográfica

- **Estado:** Minas Gerais
- **Municípios:** 853 (100% de MG)
- **POIs Mapeados:** 314.880+
- **Área Coberta:** 332.599 hectares

---

## 📞 Suporte

- **Documentação Swagger:** https://techdengue-api.railway.app/docs
- **Documentação ReDoc:** https://techdengue-api.railway.app/redoc
- **Status da API:** https://techdengue-api.railway.app/health

---

## 📜 Changelog

### v2.0.0 (Dezembro 2025)
- **Deploy em produção:** Frontend no Netlify, API configurada para Railway
- **URLs atualizadas** para ambientes online (sem dependência de localhost)
- Documentação atualizada com exemplos de integração remota

### v1.0.0 (Dezembro 2025)
- Lançamento inicial da API DaaS
- Endpoints de dados (facts, dengue, municipios, gold)
- Integração com OpenWeather
- Análise de risco com IA (Groq/Llama)
- Sistema de API Keys com tiers
- Rate limiting e cache Redis
- Audit logs
- SDK Python

---

*Documento gerado em Dezembro de 2025 - TechDengue API v1.0.0*
