# 🚀 Deploy da API no Railway

> Guia passo a passo para deploy da TechDengue API no Railway.

## Pré-requisitos

- Conta no [Railway](https://railway.app)
- Repositório no GitHub conectado
- Variáveis de ambiente configuradas

---

## 1. Criar Projeto no Railway

### 1.1 Via Dashboard

1. Acesse [railway.app](https://railway.app)
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Escolha o repositório `banco-dados-techdengue`

### 1.2 Via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

---

## 2. Configurar Variáveis de Ambiente

No dashboard do Railway, adicione as seguintes variáveis:

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `GIS_DB_HOST` | Host do PostgreSQL | `ls-xxx.rds.amazonaws.com` |
| `GIS_DB_PORT` | Porta do banco | `5432` |
| `GIS_DB_NAME` | Nome do banco | `postgres` |
| `GIS_DB_USERNAME` | Usuário | `claudio_aero` |
| `GIS_DB_PASSWORD` | Senha | `***` |
| `GIS_DB_SSL_MODE` | Modo SSL | `require` |

### Redis (Cache)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `REDIS_URL` | URL do Redis (Upstash) | `rediss://default:xxx@xxx.upstash.io:6379` |
| `CACHE_TTL_SECONDS` | TTL do cache | `3600` |

### APIs Externas (Opcionais)

| Variável | Descrição |
|----------|-----------|
| `OPENWEATHER_API_KEY` | API de clima |
| `GROQ_API_KEY` | IA/LLM para análise |
| `SENTRY_DSN` | Monitoramento de erros |

### Ambiente

| Variável | Descrição | Valor |
|----------|-----------|-------|
| `ENVIRONMENT` | Ambiente | `production` |
| `LOG_LEVEL` | Nível de log | `INFO` |
| `CORS_ALLOW_ORIGINS` | Origens CORS | `https://banco-dados-techdengue.netlify.app` |

---

## 3. Configurar Upstash Redis

1. Acesse [upstash.com](https://upstash.com)
2. Crie um banco Redis (plano gratuito disponível)
3. Copie a URL de conexão
4. Adicione como `REDIS_URL` no Railway

**Formato da URL:**
```
rediss://default:TOKEN@HOST.upstash.io:6379
```

---

## 4. Verificar Deploy

### Health Check

```bash
curl https://techdengue-api.railway.app/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-12-09T22:00:00Z"
}
```

### Swagger UI

Acesse: https://techdengue-api.railway.app/docs

---

## 5. Conectar Frontend

No Netlify, adicione a variável de ambiente:

```
VITE_API_BASE_URL=https://techdengue-api.railway.app
```

Ou atualize o arquivo `.env.production` no frontend:

```env
VITE_API_BASE_URL=https://techdengue-api.railway.app
```

---

## 6. Monitoramento

### Logs

```bash
railway logs
```

### Métricas

Acesse o dashboard do Railway para ver:
- CPU/Memória
- Requests por segundo
- Latência

### Sentry (Opcional)

1. Crie conta no [sentry.io](https://sentry.io)
2. Crie projeto Python/FastAPI
3. Copie o DSN
4. Adicione como `SENTRY_DSN` no Railway

---

## 7. Troubleshooting

### API não responde

1. Verifique logs: `railway logs`
2. Verifique variáveis de ambiente
3. Verifique conexão com banco de dados

### Erro de conexão com banco

1. Verifique `GIS_DB_*` variables
2. Verifique se SSL está habilitado (`GIS_DB_SSL_MODE=require`)
3. Verifique whitelist de IPs no RDS

### Cache não funciona

1. Verifique `REDIS_URL`
2. Verifique se o Redis está acessível
3. A API tem fallback para memória local

---

## 8. Comandos Úteis

```bash
# Ver status
railway status

# Ver variáveis
railway variables

# Restart
railway restart

# Rollback
railway rollback

# Abrir em browser
railway open
```

---

## 9. Custos

### Railway

- **Hobby Plan:** $5/mês (500 horas de execução)
- **Pro Plan:** $20/mês (uso ilimitado)

### Upstash Redis

- **Free Tier:** 10.000 comandos/dia
- **Pay-as-you-go:** $0.2 per 100K comandos

---

**Última atualização:** Dezembro 2025
