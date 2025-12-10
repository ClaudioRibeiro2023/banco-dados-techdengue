# 🚀 TechDengue Dashboard - Guia de Deploy Local

## 📋 Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 20+ (para desenvolvimento)
- **pnpm** 8+ (para desenvolvimento)

## 🐳 Deploy com Docker

### 1. Configuração de Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure as variáveis:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias:**
- `NEXT_PUBLIC_API_BASE_URL` - URL da API TechDengue
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Token do Mapbox (obtenha em https://mapbox.com)

### 2. Build e Start

```bash
# Build da imagem Docker
docker-compose build

# Iniciar o container
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. Acessar a Aplicação

A aplicação estará disponível em:
- **URL**: http://localhost:2000
- **Health Check**: http://localhost:2000/api/health

### 4. Parar o Container

```bash
docker-compose down
```

## 🔧 Desenvolvimento Local (sem Docker)

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` com suas configurações.

### 3. Executar em Modo Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em http://localhost:3000

### 4. Build de Produção

```bash
# Build
pnpm build

# Start
pnpm start
```

## 📊 Monitoramento

### Health Check

O endpoint `/api/health` retorna o status da aplicação:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "api": {
      "status": "up",
      "url": "https://api.techdengue.com",
      "responseTime": 150
    }
  },
  "uptime": 3600
}
```

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f techdengue-dashboard

# Ver últimas 100 linhas
docker-compose logs --tail=100 techdengue-dashboard
```

## 🔍 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs techdengue-dashboard

# Verificar se a porta 2000 está em uso
netstat -ano | findstr :2000  # Windows
lsof -i :2000                  # Linux/Mac
```

### Erro de build

```bash
# Limpar cache do Docker
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### API não responde

1. Verifique se a URL da API está correta no `.env.local`
2. Teste a API diretamente: `curl https://api.techdengue.com/health`
3. Verifique os logs da aplicação

## 🏗️ Arquitetura

```
techdengue-dashboard/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   ├── features/         # Features da aplicação
│   ├── lib/             # Utilitários e serviços
│   └── styles/          # Estilos globais
├── public/              # Arquivos estáticos
├── Dockerfile           # Configuração Docker
├── docker-compose.yml   # Orquestração Docker
└── next.config.ts       # Configuração Next.js
```

## 🔐 Segurança

- Headers de segurança configurados no `next.config.ts`
- HTTPS obrigatório em produção
- Tokens armazenados de forma segura
- Rate limiting na API
- Validação de entrada em todos os formulários

## 📈 Performance

- **Build otimizado** com standalone output
- **Compressão** habilitada
- **Imagens otimizadas** com AVIF/WebP
- **Code splitting** automático
- **Cache** configurado para assets estáticos

## 🆘 Suporte

- **Documentação**: [DEPLOY.md](./DEPLOY.md)
- **Issues**: GitHub Issues
- **API Docs**: https://api.techdengue.com/docs

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Endpoint `/api/health` para healthcheck
- ✅ Sistema de logging profissional
- ✅ Otimizações de performance
- ✅ Headers de segurança
- ✅ Docker com porta 2000
- ✅ Variáveis de ambiente completas
