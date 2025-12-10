# ✅ TechDengue Dashboard – TODO & Checklist

Guia visual de status das implementações e próximos passos.

---

## Legenda

- [x] Concluído
- [ ] Pendente
- [~] Em progresso / fase futura

---

## 1. Infra, Build & Docker

- [x] Next.js 16 configurado com App Router
- [x] Output standalone para Docker (`next.config.ts`)
- [x] Dockerfile multi-stage (deps / builder / runner)
- [x] Container rodando como usuário não-root
- [x] `docker-compose.yml` com porta externa **2000** → 3000
- [x] Healthcheck apontando para `/api/health`
- [x] `.dockerignore` configurado
- [ ] Adicionar profiles de Docker (dev / prod separados)
- [ ] Script de `make` ou `deploy-local.bat` atualizado para novo fluxo

---

## 2. Configuração de Ambiente (.env)

- [x] `.env.example` documentado
- [x] `.env.local` para desenvolvimento local
- [x] Variáveis de API TechDengue (`NEXT_PUBLIC_API_BASE_URL`, timeout)
- [x] Variáveis Mapbox (token, style)
- [x] Variáveis OpenWeather (base URL, key opcional)
- [x] Variáveis de APIs externas (IBGE, InfoDengue)
- [x] Feature flags básicas:
  - [x] `NEXT_PUBLIC_ENABLE_DARK_MODE`
  - [x] `NEXT_PUBLIC_ENABLE_EXPORT_PDF`
  - [x] `NEXT_PUBLIC_MOCK_API`
  - [x] `NEXT_PUBLIC_DEBUG_MODE`
- [ ] Validar env obrigatórias em ambiente de produção (build fail se faltar)
- [ ] Centralizar documentação de env em um único lugar (ex: `/docs/env.md`)

---

## 3. Observabilidade & Health Check

- [x] Endpoint `/api/health` criado
  - [x] Retorna status: `healthy` | `degraded` | `unhealthy`
  - [x] Inclui: versão, environment, uptime
  - [x] Checa conectividade com API TechDengue
- [x] Healthcheck do Docker apontando para `/api/health`
- [ ] Expor métricas para Prometheus (futuro)
- [ ] Integrar com Sentry (quando DSN disponível)
- [ ] Integrar com PostHog/analytics (quando chave disponível)

---

## 4. Logging & Tratamento de Erros

- [x] Logger central (`src/lib/utils/logger.ts`)
  - [x] Níveis: DEBUG, INFO, WARN, ERROR
  - [x] Comportamento diferente para dev/produção
  - [x] Armazena erros recentes em `sessionStorage` (para debug)
- [x] `techdengueClient` usando `logger.error` em vez de `console.error`
- [ ] Integrar logger com Sentry (quando configurado)
- [ ] Adicionar logs de contexto em pontos críticos (auth, mapa, relatórios)

---

## 5. Autenticação & Autorização

### 5.1. Backend/API

- [ ] Confirmar contrato dos endpoints reais da API:
  - [ ] `POST /auth/login`
  - [ ] `POST /auth/logout`
  - [ ] `GET /auth/profile` ou `/auth/me`
  - [ ] `POST /auth/refresh`
  - [ ] `POST /auth/forgot-password`
  - [ ] `POST /auth/reset-password`

### 5.2. Serviço Central de Auth (`src/lib/services/auth.service.ts`)

- [x] Estrutura de tipos (`AuthUser`, `AuthResponse`, etc.)
- [x] Token management com `tokenManager`
- [x] Fallback/mock quando API está indisponível ou retorna 404
- [x] Mock de usuário admin para desenvolvimento
- [ ] Adicionar expiração de sessão e auto-logout amigável

### 5.3. Serviço de Auth de Features (`src/features/auth/services/auth.service.ts`)

- [x] Passar a delegar o `login` para o serviço central (`coreAuthService`)
- [x] Mapear `AuthUser` → `User` do `auth.store`
- [x] Converter erros em formato compatível com React Query / Axios
- [ ] Usar também o serviço central para `getProfile`, `refreshToken` e demais operações (hoje parte ainda usa `techdengueClient` direto)

### 5.4. Store de Auth (`src/stores/auth.store.ts`)

- [x] Persistência de `user` e `token` com Zustand + localStorage
- [x] Métodos `login`, `logout`, `setUser`, `setToken`, `setLoading`
- [ ] Sincronizar `tokenManager` e store para evitar estados divergentes
- [ ] Implementar refresh automático de token baseado em expiração

### 5.5. UX de Login (`src/features/auth/components/login-form.tsx`)

- [x] Formulário com validação (zod + react-hook-form)
- [x] Integração com `useAuth` hook
- [x] Exibição de erro de login (mensagem genérica hoje)
- [x] Mostrar mensagem amigável quando estiver usando mock (ex: "Ambiente de desenvolvimento - login simulado")
- [ ] Padronizar mensagens de erro com base em `ApiError`

---

## 6. Dashboard & Métricas

- [x] Dashboard básico em `/dashboard` com KPIs
- [x] Uso de hooks (`useDashboardKPIs`, `useHectaresMapeados`)
- [x] Placeholders/mocks visuais quando API não responde
- [x] Serviço `dadosGerenciaisService` com fallback para mocks
- [x] Serviço `dadosGeograficosService` com fallback para mocks (municípios/contratos)
- [x] Skeletons/loading states ricos (`DashboardPageSkeleton`, `KPICardSkeleton`, `ChartSkeleton`, `MapSkeleton`)
- [x] Filtros avançados implementados (município, período, contrato em popover)
- [ ] Conectar KPIs reais quando a API estiver estável

---

## 7. Mapa & Geoespacial

- [x] Integração planejada com Mapbox (tokens e styles preparados)
- [x] Serviço `bancoTechdengueService` com fallback para mocks (100 POIs)
- [x] Hook `usePOIsGeoJSON` para dados geoespaciais
- [x] Store `useMapStore` para estado do mapa (filtros, estilo, viewport)
- [x] Componentes de mapa base criados (MapContainer, ClusterLayer, HeatmapLayer, etc.)
- [x] Página `/mapa` operacional com integração completa
- [x] Clusterização de pontos (`ClusterLayer` com cores e tamanhos dinâmicos)
- [x] Filtros por tipo de criadouro e status de devolutiva (`MapFiltersPanel`)
- [x] Camadas de calor / heatmap (`HeatmapLayer`)
- [x] Legendas e estatísticas no mapa (`MapLegend`, `MapStats`)
- [ ] Cache de dados geoespaciais no cliente (staleTime configurado no React Query)
- [ ] Configurar token Mapbox real (atualmente placeholder)

---

## 8. Relatórios & Exportações

- [x] Serviços e utils para export (Excel/PDF) criados
- [ ] Conectar relatórios às APIs reais de dados
- [ ] Implementar fila/estado de geração de relatórios longos
- [ ] Exportação customizável (colunas, filtros aplicados)
- [ ] Agendamento de relatórios (futuro, dependendo de backend)

---

## 9. Integrações Externas

- [ ] OpenWeather – correlação climática
- [ ] IBGE – dados demográficos/geográficos
- [ ] InfoDengue – dados epidemiológicos
- [ ] ClickUp / ferramentas de gestão (já há serviços iniciados)

Cada integração deve ter:

- [ ] Serviço dedicado em `src/lib/services/`
- [ ] Tratamento de erros robusto
- [ ] Retries e timeouts adequados

---

## 10. Acessibilidade & UX

- [x] Componentes de acessibilidade básicos (`VisuallyHidden`, etc.)
- [ ] Revisão de contraste, tamanhos e navegação por teclado
- [ ] Labels e `aria-*` em todos os inputs críticos
- [ ] Mensagens de erro acessíveis (associadas aos campos)

---

## 11. Segurança

- [x] Headers de segurança no `next.config.ts`:
  - [x] HSTS
  - [x] X-Frame-Options
  - [x] X-Content-Type-Options
  - [x] X-XSS-Protection
  - [x] Referrer-Policy
- [x] Usuário não-root no container
- [x] Tokens em localStorage com controle de expiração no client
- [ ] Revisar se há dados sensíveis em logs
- [ ] Adicionar Content Security Policy (CSP) ajustada ao uso de Mapbox

---

## 12. Testes & Qualidade

- [x] Vitest configurado
- [x] Playwright configurado para E2E
- [x] Cobertura de testes via `pnpm test:coverage`
- [x] Corrigir erros de TypeScript nos testes (**59 → 0 erros**)
  - [x] `virtual-table.test.tsx` - tipo TestData corrigido
  - [x] `visually-hidden.tsx` - componente polimórfico
  - [x] `sidebar.test.tsx` - import de beforeEach
  - [x] `error-boundary.test.tsx` - remoção de NODE_ENV readonly
  - [x] `api-integration.test.ts` - null assertions
  - [x] `atividades.service.test.ts` - type assertions para spread
  - [x] `relatorios-historico.store.test.ts` - inicialização de variáveis
- [ ] Adicionar testes E2E para fluxo completo: login → dashboard → mapa → relatório
- [ ] Configurar pipeline CI para rodar `type-check`, `lint`, `test`

---

## 13. Documentação

- [x] `README.md` base (template Next.js)
- [x] `DEPLOY.md` com guia de deploy (Vercel + Docker)
- [x] `README_DEPLOY.md` com foco em ambiente local + Docker
- [x] `CHANGELOG_IMPROVEMENTS.md` registrando melhorias implementadas
- [x] `TODO.md` (este arquivo) como checklist vivo
- [ ] Documentar arquitetura geral (diagramas simples: app → serviços → API)
- [ ] Documentar fluxos principais (login, geração de relatório, fluxo de atividades)

---

## 14. Próximas Fases (Roadmap Proposto)

### Fase A – Estabilização Técnica ✅ CONCLUÍDA

- [x] Corrigir todos os erros de testes TypeScript (59 → 0)
- [x] Ajustar `authService` para usar o serviço central com mocks
- [x] Garantir que serviços principais usem `techdengueClient` + logger
- [x] Adicionar fallbacks/mocks em todos os serviços críticos

### Fase B – Integração de Dados Reais

- [ ] Conectar KPIs do dashboard à API real
- [ ] Conectar página de mapa a dados geoespaciais reais
- [ ] Conectar relatórios às APIs de relatórios da TechDengue

### Fase C – Observabilidade & Segurança

- [ ] Integrar Sentry
- [ ] Integrar PostHog (ou outro analytics)
- [ ] Configurar CSP e revisar headers de segurança

### Fase D – UX e Produto

- [ ] Melhorar experiência de login (mensagens, lembrar-me, etc.)
- [ ] Refinar UI do dashboard, filtros e drill-down
- [ ] Implementar dark mode completo

---

> Este arquivo deve ser mantido como **fonte de verdade** do status do projeto.
> À medida que avançarmos nas fases, marque as caixas [ ] → [x] e adicione itens conforme necessário.
