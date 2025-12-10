# TechDengue Dashboard - Guia de Deploy

## Requisitos

- Node.js 18.x ou superior
- pnpm 8.x ou superior
- Conta Vercel (recomendado) ou outro provedor

## Variáveis de Ambiente

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | URL da API TechDengue | `https://tense-fallon-aeroeng-b5d4fc17.koyeb.app/api` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Token de acesso Mapbox | `pk.eyJ1...` |

### Recomendadas

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_APP_ENV` | Ambiente (development/staging/production) | `production` |
| `NEXT_PUBLIC_APP_NAME` | Nome da aplicação | `TechDengue Dashboard` |
| `NEXT_PUBLIC_APP_VERSION` | Versão da aplicação | `1.0.0` |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout das requisições (ms) | `30000` |
| `NEXT_PUBLIC_MAPBOX_STYLE` | Estilo do mapa Mapbox | `mapbox://styles/mapbox/light-v11` |

### Opcionais (Features)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | API Key OpenWeather | - |
| `NEXT_PUBLIC_OPENWEATHER_BASE_URL` | URL base OpenWeather | `https://api.openweathermap.org/data/2.5` |
| `NEXT_PUBLIC_ENABLE_DARK_MODE` | Habilitar tema escuro | `true` |
| `NEXT_PUBLIC_ENABLE_WEATHER_CORRELATION` | Correlação climática | `false` |
| `NEXT_PUBLIC_ENABLE_PREDICTIVE_ANALYTICS` | Analytics preditivo | `false` |
| `NEXT_PUBLIC_ENABLE_EXPORT_PDF` | Exportação PDF | `true` |

### Monitoramento (Opcional)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry para monitoramento de erros |
| `NEXT_PUBLIC_POSTHOG_KEY` | Chave do PostHog para analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | Host do PostHog |

## Deploy na Vercel

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Selecione o diretório `techdengue-dashboard`

### 2. Configurar Variáveis de Ambiente

No painel do projeto Vercel:

1. Vá em "Settings" → "Environment Variables"
2. Adicione as variáveis obrigatórias:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
3. Configure as demais variáveis conforme necessário

### 3. Configurar Build

As configurações já estão no `vercel.json`:

- **Framework**: Next.js (auto-detectado)
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Region**: São Paulo (gru1)

### 4. Deploy

O deploy será automático após push no branch principal.

Para deploy manual:
```bash
pnpm vercel --prod
```

## Deploy Manual (Outros Provedores)

### Build

```bash
# Instalar dependências
pnpm install

# Build de produção
pnpm build

# Iniciar servidor (produção)
pnpm start
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Ambientes

### Staging

- Branch: `develop` ou `staging`
- URL: `https://techdengue-staging.vercel.app`
- Variáveis: `NEXT_PUBLIC_APP_ENV=staging`

### Produção

- Branch: `main` ou `master`
- URL: `https://techdengue.vercel.app` (ou domínio customizado)
- Variáveis: `NEXT_PUBLIC_APP_ENV=production`

## Checklist Pré-Deploy

- [ ] Build local passa sem erros (`pnpm build`)
- [ ] Testes passam (`pnpm test:run`)
- [ ] Variáveis de ambiente configuradas
- [ ] Token Mapbox válido e com domínios permitidos
- [ ] API TechDengue acessível

## Monitoramento Pós-Deploy

1. **Verificar páginas principais**:
   - `/login` - Página de login
   - `/dashboard` - Dashboard principal
   - `/mapa` - Mapa interativo

2. **Verificar console** para erros JavaScript

3. **Verificar Network** para falhas de API

4. **Testar em mobile** para responsividade

## Rollback

Na Vercel, cada deploy gera uma URL única. Para rollback:

1. Vá em "Deployments" no painel Vercel
2. Encontre o deploy anterior funcional
3. Clique nos três pontos → "Promote to Production"

## Suporte

- **Documentação**: `/docs/`
- **API Docs**: https://tense-fallon-aeroeng-b5d4fc17.koyeb.app/api/docs
- **Issues**: GitHub Issues do repositório
