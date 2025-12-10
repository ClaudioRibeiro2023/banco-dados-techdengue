# Configuração do Frontend no Netlify

## 🔧 Variáveis de Ambiente

Acesse o painel do Netlify: **Site settings → Environment variables**

### Variáveis Obrigatórias

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_API_BASE_URL` | `https://banco-dados-techdengue-production.up.railway.app` | URL da API no Railway |
| `VITE_ENVIRONMENT` | `production` | Ambiente de execução |

### Como Configurar

1. Acesse https://app.netlify.com/
2. Selecione o site `banco-dados-techdengue`
3. Vá em **Site settings** (ícone de engrenagem)
4. Clique em **Environment variables** no menu lateral
5. Adicione as variáveis acima
6. Clique em **Trigger deploy** → **Deploy site** para reconstruir

## 🚀 Após Configurar

O frontend deve conseguir fazer requisições para a API sem erros de CORS.

### Testando

Abra o console do navegador (F12) e execute:

```javascript
fetch('https://banco-dados-techdengue-production.up.railway.app/health')
  .then(r => r.json())
  .then(console.log)
```

Deve retornar:

```json
{
  "ok": true,
  "version": "1.0.0",
  "datasets": {...},
  "db_connected": true
}
```

## 🔍 Solução de Problemas

### Erro de CORS

Se aparecer erro de CORS no console:

1. Verifique se a variável `CORS_ALLOW_ORIGINS` no Railway inclui a URL do Netlify
2. Ou mantenha como `*` para permitir todas as origens

### API retornando 500

Verifique os logs no Railway Dashboard para identificar o erro.

---

## 📊 Monitoramento com Sentry (Opcional)

Para capturar erros em produção:

1. Crie uma conta em https://sentry.io/
2. Crie um projeto para FastAPI
3. Adicione no Railway: `SENTRY_DSN=sua-dsn-do-sentry`

O código já está preparado para usar Sentry automaticamente.
