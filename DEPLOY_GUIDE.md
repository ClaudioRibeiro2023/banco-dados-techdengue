# 🚀 TechDengue - Guia de Deploy em Produção

Este guia mostra como fazer deploy da TechDengue API para funcionar **24/7 na nuvem** com custo mínimo (~$5/mês ou grátis).

---

## 📋 Resumo da Stack

| Componente | Serviço | Custo | URL |
|------------|---------|-------|-----|
| **API FastAPI** | Railway | $5/mês | railway.app |
| **Frontend React** | Netlify | Grátis | netlify.com |
| **Banco PostgreSQL** | RDS AWS (existente) | (já pago) | - |
| **Cache Redis** | Upstash | Grátis | upstash.com |
| **CI/CD** | GitHub Actions | Grátis | github.com |

---

## 🔧 Passo 1: Configurar Railway (API)

### 1.1 Criar conta e projeto

1. Acesse [railway.app](https://railway.app)
2. Login com GitHub
3. Clique em **"New Project"** → **"Deploy from GitHub repo"**
4. Selecione o repositório `banco-dados-techdengue`

### 1.2 Configurar variáveis de ambiente

No Railway, vá em **Variables** e adicione:

```bash
# Banco de Dados
GIS_DB_HOST=<seu_host_rds>
GIS_DB_PORT=5432
GIS_DB_NAME=postgres
GIS_DB_USERNAME=<seu_usuario>
GIS_DB_PASSWORD=<sua_senha>
GIS_DB_SSL_MODE=require

# Redis (Upstash)
REDIS_URL=rediss://default:<sua_senha>@<seu_host>.upstash.io:6379

# APIs
OPENWEATHER_API_KEY=<sua_api_key_openweather>
GROQ_API_KEY=<sua_api_key_groq>

# Config
ENVIRONMENT=production
LOG_LEVEL=WARNING
CORS_ALLOW_ORIGINS=https://techdengue.netlify.app
```

### 1.3 Configurar domínio

1. Vá em **Settings** → **Domains**
2. Clique em **"Generate Domain"**
3. Anote a URL (ex: `techdengue-api-production.up.railway.app`)

### 1.4 Obter token para CI/CD

1. Vá em **Account Settings** → **Tokens**
2. Crie um novo token
3. Copie para usar no GitHub Secrets

---

## 🔧 Passo 2: Configurar Netlify (Frontend)

### 2.1 Criar site

1. Acesse [netlify.com](https://www.netlify.com)
2. Login com GitHub
3. Clique em **"Add new site"** → **"Import an existing project"**
4. Selecione o repositório

### 2.2 Configurar build

```yaml
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 2.3 Configurar variáveis de ambiente

```bash
VITE_API_BASE_URL=https://techdengue-api-production.up.railway.app
```

### 2.4 Obter credenciais para CI/CD

1. **Site ID**: Settings → General → Site ID
2. **Auth Token**: User Settings → Applications → Personal access tokens

---

## 🔧 Passo 3: Configurar GitHub Secrets

No repositório GitHub, vá em **Settings** → **Secrets and variables** → **Actions**

Adicione os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `RAILWAY_TOKEN` | `railway_xxxxx` | Token do Railway |
| `NETLIFY_AUTH_TOKEN` | `nfp_xxxxx` | Token pessoal Netlify |
| `NETLIFY_SITE_ID` | `xxxxxxxx-xxxx` | ID do site Netlify |
| `API_BASE_URL` | `https://xxx.railway.app` | URL da API |

---

## 🔧 Passo 4: Fazer Deploy

### Opção A: Deploy Automático (recomendado)

Simplesmente faça um push para a branch `main`:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

O GitHub Actions irá:
1. Rodar testes
2. Fazer deploy da API no Railway
3. Fazer deploy do frontend no Netlify

### Opção B: Deploy Manual

**Railway (API):**
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Netlify (Frontend):**
```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Build e deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## ✅ Passo 5: Verificar Deploy

### Testar API

```bash
# Health check
curl https://techdengue-api-production.up.railway.app/health

# Status completo
curl https://techdengue-api-production.up.railway.app/api/v1/status

# Testar clima
curl https://techdengue-api-production.up.railway.app/api/v1/weather/Belo%20Horizonte
```

### Testar Frontend

Acesse: `https://techdengue.netlify.app`

---

## 📊 Monitoramento

### Railway

- Dashboard: https://railway.app/dashboard
- Logs: Clique no serviço → **View Logs**
- Métricas: CPU, RAM, Requests

### Netlify

- Dashboard: https://app.netlify.com
- Deploy logs
- Analytics

### Upstash Redis

- Dashboard: https://console.upstash.com
- Comandos executados
- Uso de memória

---

## 🔄 Atualizações Futuras

Para fazer deploy de atualizações:

```bash
# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

O deploy é **automático** via GitHub Actions!

---

## 💰 Custos Detalhados

| Serviço | Tier | Limite | Custo |
|---------|------|--------|-------|
| Railway | Starter | 500 horas/mês | ~$5/mês |
| Netlify | Free | 100GB bandwidth | $0 |
| Upstash | Free | 10k commands/dia | $0 |
| GitHub Actions | Free | 2000 min/mês | $0 |
| **TOTAL** | - | - | **~$5/mês** |

### Alternativa 100% Grátis

Se quiser $0/mês, pode usar:
- **Render.com** ao invés de Railway (750h/mês free)
- Limitação: A API "dorme" após 15min de inatividade

---

## ❓ Troubleshooting

### API não inicia

```bash
# Ver logs no Railway
railway logs
```

Verificar:
- Variáveis de ambiente configuradas
- Dockerfile correto
- Porta dinâmica ($PORT)

### Frontend não conecta na API

Verificar:
- `VITE_API_BASE_URL` correto no Netlify
- CORS configurado na API
- API está respondendo

### Redis não conecta

Verificar:
- URL do Upstash correta
- Usar `rediss://` (com SSL)
- Credenciais válidas

---

## 📞 Suporte

- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com
- **Upstash Docs**: https://docs.upstash.com

---

*Guia criado em Dezembro 2025 - TechDengue v1.0.0*
