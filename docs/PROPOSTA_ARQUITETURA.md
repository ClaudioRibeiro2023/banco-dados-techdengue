# Proposta de Melhorias – TechDengue

**Versão:** 1.0  
**Data:** 2025-12-10  
**Arquiteto:** Análise Automatizada

---

## 1. Visão Geral do Projeto

### 1.1 Contexto

O **TechDengue** é uma aplicação fullstack para análise de dados epidemiológicos de dengue em Minas Gerais, composta por:

- **Backend:** API FastAPI (Python 3.11) com dados em Parquet + PostgreSQL/PostGIS
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Infraestrutura:** Railway (API) + Netlify (Frontend) + Redis (Cache)
- **Tipo:** Monorepo com API, Dashboard Streamlit, Frontend React e scripts ETL

### 1.2 Resumo Executivo

#### ✅ Pontos Fortes

- **Arquitetura de dados bem definida** (Medallion: Bronze/Silver/Gold)
- **API robusta** com 22 endpoints funcionais, rate limiting, cache e autenticação
- **CI/CD configurado** via GitHub Actions para deploy automático
- **Documentação extensa** (75 arquivos em `/docs`)
- **Stack moderna** (FastAPI, React Query, Zustand, TailwindCSS)
- **Observabilidade** iniciada (Sentry configurado, Loguru para logs)

#### ⚠️ Riscos e Dívidas Técnicas

- **Scripts na raiz** (13 arquivos `.py` e `.bat` poluindo o projeto)
- **Múltiplos dashboards** (Streamlit em `/dashboard` + React em `/frontend`)
- **Testes fragmentados** (cobertura parcial, sem medição de coverage)
- **Configuração dispersa** (`.env`, `.env.example`, `.env.production`, `railway.env`)
- **Arquivos legados** em `docs/archive/` e `docs/legacy/`
- **app.py monolítico** (35KB, 1049 linhas) precisa ser modularizado
- **Ausência de pre-commit hooks** (código pode ir sem lint/format)

---

## 2. Diagnóstico Estruturado

### 2.1 Arquitetura & Organização

#### O que está bom

- Separação clara em `src/` com subcamadas:
  - `src/api/` – endpoints FastAPI
  - `src/core/` – cache, auth, audit, rate limiting
  - `src/services/` – weather, risk analyzer
- Configuração centralizada em `src/config.py` com dataclasses
- Uso de Pydantic para validação de schemas

#### O que precisa melhorar

| Problema | Arquivo/Local | Impacto |
|----------|---------------|---------|
| Scripts avulsos na raiz | `carregar_base_integrada.py`, `criar_mega_tabela.py`, etc. | Dificulta onboarding, poluição visual |
| `app.py` monolítico | `src/api/app.py` (35KB) | Difícil manutenção e testes |
| Falta de módulo `shared/` | Design System disperso | Inconsistência de estilos |
| Arquivos `.bat` na raiz | `START_DASHBOARD.bat`, etc. | Windows-only, não portável |

#### Recomendação

```
projeto/
├── src/
│   ├── api/
│   │   ├── routers/        # Separar por domínio
│   │   │   ├── health.py
│   │   │   ├── facts.py
│   │   │   ├── weather.py
│   │   │   └── gis.py
│   │   ├── app.py          # Só inicialização
│   │   └── dependencies.py
│   ├── core/               # ✅ Já existe
│   ├── services/           # ✅ Já existe
│   └── shared/             # CRIAR: design_system, exporters
├── scripts/                # Mover scripts da raiz
├── frontend/               # ✅ Já existe
└── tests/                  # ✅ Já existe
```

### 2.2 Qualidade de Código

#### O que está bom

- Tipagem com Pydantic models (`WeatherData`, `DengueWeatherRisk`)
- Logging estruturado com Loguru
- Docstrings em funções principais

#### O que precisa melhorar

| Problema | Exemplo | Ação |
|----------|---------|------|
| Funções longas | `app.py` endpoints misturados | Extrair para routers |
| Import dentro de função | `weather.py:123` → `import unicodedata` | Mover para topo |
| Código duplicado | Leitura de Parquet em múltiplos lugares | Consolidar em `data_processor.py` |

### 2.3 Testes

#### O que está bom

- Suite de testes organizada em `tests/api/`
- Testes E2E com Playwright no frontend
- Fixtures em `conftest.py`

#### O que precisa melhorar

| Problema | Status Atual | Meta |
|----------|--------------|------|
| Cobertura desconhecida | Não medida | Mínimo 60% |
| Testes de serviços | Ausentes | Testar `WeatherService`, `RiskAnalyzer` |
| Testes de integração DB | Parciais | Mock ou testcontainers |

### 2.4 Configuração & Ambientes

#### O que está bom

- `.env.example` documentado
- Validação de config em `Config.validate()`
- CORS configurável via env var

#### O que precisa melhorar

| Problema | Risco | Solução |
|----------|-------|---------|
| Múltiplos `.env` | Confusão | Consolidar em `.env` + `.env.example` |
| `railway.env` separado | Duplicação | Usar apenas variáveis no Railway |
| Segredos sem validação | Falha silenciosa | Fail-fast com Pydantic Settings |

### 2.5 Infraestrutura & Deploy

#### O que está bom

- Docker multi-stage funcional
- `docker-compose.yml` completo (api, redis, frontend, dashboard)
- Railway + Netlify configurados
- GitHub Actions CI/CD

#### O que precisa melhorar

| Problema | Impacto | Solução |
|----------|---------|---------|
| Build lento | DX ruim | Cache de dependências no Docker |
| Sem multi-stage otimizado | Imagem grande | Slim final image |

### 2.6 Observabilidade

#### O que está bom

- Sentry configurado e pronto para ativar ✅
- Loguru para logs estruturados
- Health check em `/health`
- Audit middleware para rastreamento

#### O que precisa melhorar

| Métrica | Status | Meta |
|---------|--------|------|
| Métricas Prometheus | Ausente | [OPCIONAL] Adicionar `/metrics` |
| Tracing distribuído | Ausente | [OPCIONAL] OpenTelemetry |
| Alertas | Ausente | Configurar alertas no Sentry |

### 2.7 DX & Governança

#### O que está bom

- Scripts npm no frontend (`dev`, `build`, `test`, `lint`)
- README.md completo com badges
- Documentação extensa em `/docs`

#### O que precisa melhorar

| Problema | Impacto | Solução |
|----------|---------|---------|
| Sem pre-commit hooks | Código inconsistente | Adicionar pre-commit |
| Sem Makefile/Justfile | Comandos dispersos | Criar task runner |
| Docs desorganizados | 75 arquivos, muitos legados | Limpar e consolidar |

---

## 3. Princípios Norteadores das Melhorias

1. **Fail Fast** – Validar configurações no startup, não em runtime
2. **Single Source of Truth** – Uma fonte para cada tipo de dado/config
3. **Onboarding < 15 min** – Dev novo deve rodar o projeto rapidamente
4. **Modularidade** – Cada módulo com responsabilidade única
5. **Observabilidade First** – Logs, métricas e traces desde o início
6. **Testes como Documentação** – Testes claros que explicam o comportamento
7. **Automação de Qualidade** – Lint, format e testes em pre-commit

---

## 4. Plano Faseado de Implementação

### Fase 0 – Fundamentos & Quick Wins

**Objetivo:** Corrigir problemas críticos e preparar base para melhorias.

**Critérios de Sucesso:**
- [ ] Todos os scripts da raiz movidos para `/scripts`
- [ ] Pre-commit hooks funcionando
- [ ] `.env` consolidado (remover redundâncias)
- [ ] Sentry ativo e capturando erros

**Entregáveis:**

| ID | Tarefa | Prioridade |
|----|--------|------------|
| 0.1 | Mover scripts `.py` da raiz para `/scripts` | P0 |
| 0.2 | Mover/remover arquivos `.bat` (criar Makefile) | P1 |
| 0.3 | Configurar pre-commit (ruff, black, mypy) | P0 |
| 0.4 | Consolidar arquivos `.env` | P1 |
| 0.5 | Ativar Sentry no Railway (DSN já fornecido) | P0 |
| 0.6 | Limpar `docs/archive/` e `docs/legacy/` | P2 |

**Riscos:** Quebra de imports ao mover scripts.

---

### Fase 1 – Organização & Arquitetura

**Objetivo:** Modularizar `app.py` e estabelecer estrutura de routers.

**Critérios de Sucesso:**
- [ ] `app.py` reduzido a < 200 linhas
- [ ] Routers separados por domínio
- [ ] Importações circulares eliminadas

**Entregáveis:**

| ID | Tarefa | Prioridade |
|----|--------|------------|
| 1.1 | Criar `src/api/routers/health.py` | P0 |
| 1.2 | Criar `src/api/routers/facts.py` | P0 |
| 1.3 | Criar `src/api/routers/weather.py` | P1 |
| 1.4 | Criar `src/api/routers/gis.py` | P1 |
| 1.5 | Criar `src/api/routers/admin.py` (API keys, audit) | P2 |
| 1.6 | Criar `src/api/dependencies.py` | P1 |
| 1.7 | Criar `src/shared/exporters.py` (CSV, Parquet) | P2 |
| 1.8 | Mover import de `unicodedata` para topo em `weather.py` | P2 |

**Riscos:** Regressões em endpoints; mitigar com testes.

---

### Fase 2 – Qualidade de Código & Testes

**Objetivo:** Aumentar cobertura de testes e garantir qualidade.

**Critérios de Sucesso:**
- [ ] Cobertura de testes ≥ 60%
- [ ] Testes de unidade para `WeatherService`
- [ ] Testes de integração para endpoints principais
- [ ] CI rodando testes com coverage report

**Entregáveis:**

| ID | Tarefa | Prioridade |
|----|--------|------------|
| 2.1 | Configurar pytest-cov no CI | P0 |
| 2.2 | Testes unitários para `WeatherService` | P1 |
| 2.3 | Testes unitários para `RiskAnalyzer` | P1 |
| 2.4 | Testes de integração para `/facts` | P1 |
| 2.5 | Testes de integração para `/weather/*` | P1 |
| 2.6 | Adicionar badge de coverage no README | P2 |
| 2.7 | Testes E2E no frontend (Playwright) - revisar | P2 |

**Riscos:** Mocks complexos para serviços externos.

---

### Fase 3 – Infraestrutura & Performance

**Objetivo:** Otimizar build e melhorar DX.

**Critérios de Sucesso:**
- [ ] Dockerfile otimizado com cache
- [ ] Makefile com comandos principais
- [ ] Tempo de build < 3 min

**Entregáveis:**

| ID | Tarefa | Prioridade |
|----|--------|------------|
| 3.1 | Criar `Makefile` com targets: dev, test, lint, build | P0 |
| 3.2 | Otimizar Dockerfile (multi-stage, cache de pip) | P1 |
| 3.3 | Adicionar `.dockerignore` mais restritivo | P2 |
| 3.4 | Configurar hot-reload para desenvolvimento | P2 |

---

### Fase 4 – Observabilidade & Robustez

**Objetivo:** Melhorar monitoramento e resiliência.

**Critérios de Sucesso:**
- [ ] Alertas configurados no Sentry
- [ ] Logs estruturados com contexto
- [ ] Health check completo com dependências

**Entregáveis:**

| ID | Tarefa | Prioridade |
|----|--------|------------|
| 4.1 | Configurar alertas no Sentry (erros críticos) | P1 |
| 4.2 | Adicionar contexto aos logs (request_id, user) | P2 |
| 4.3 | Health check profundo (Redis, DB, Parquet) | P1 |
| 4.4 | [OPCIONAL] Endpoint `/metrics` Prometheus | P3 |
| 4.5 | [OPCIONAL] Dashboard de métricas | P3 |

---

### Fase 5 – DX & Governança

**Objetivo:** Facilitar contribuição e manutenção.

**Critérios de Sucesso:**
- [ ] CONTRIBUTING.md completo
- [ ] Templates de PR/Issue
- [ ] Documentação limpa e navegável

**Entregáveis:**

| ID | Tarefa | Prioridade |
|----|--------|------------|
| 5.1 | Criar `CONTRIBUTING.md` | P1 |
| 5.2 | Criar templates `.github/ISSUE_TEMPLATE/` | P2 |
| 5.3 | Criar template `.github/PULL_REQUEST_TEMPLATE.md` | P2 |
| 5.4 | Limpar e consolidar `/docs` | P1 |
| 5.5 | Atualizar README com seção de arquitetura | P2 |
| 5.6 | [OPCIONAL] Configurar MkDocs para documentação | P3 |

---

## 5. Roadmap Resumido

| Fase | Foco | Impacto | Esforço |
|------|------|---------|---------|
| **0** | Fundamentos | Alto | 1-2 dias |
| **1** | Arquitetura | Alto | 2-3 dias |
| **2** | Testes | Médio-Alto | 2-3 dias |
| **3** | Infra | Médio | 1-2 dias |
| **4** | Observabilidade | Médio | 1-2 dias |
| **5** | Governança | Baixo-Médio | 1 dia |

**Total estimado:** 8-13 dias de desenvolvimento

---

## 6. Top 5 Ações Imediatas

As 5 ações mais urgentes para os próximos 2 dias:

1. **[P0] Configurar Sentry no Railway** – DSN já fornecido, só adicionar variável
2. **[P0] Configurar pre-commit hooks** – Garantir qualidade de código
3. **[P0] Mover scripts da raiz** – Organização básica
4. **[P1] Criar Makefile** – Centralizar comandos
5. **[P1] Consolidar arquivos .env** – Reduzir confusão

---

## 7. Recomendações Finais

### Governança

- **Code Review obrigatório** para merges em `main`
- **Squash merges** para histórico limpo
- **Semantic versioning** para releases

### Ferramentas Recomendadas (já na stack)

- **Ruff** – Linter rápido para Python (substituir flake8)
- **Black** – Formatador de código
- **Mypy** – Checagem de tipos (opcional, mas recomendado)
- **Vitest** – Já em uso no frontend ✅

### Próximos Passos Além do Escopo

- **i18n** – Se precisar suportar múltiplos idiomas
- **Multi-tenancy** – Se precisar separar dados por organização
- **API versioning** – Já com `/api/v1/`, continuar padrão
- **GraphQL** – Se precisar de queries flexíveis (não prioritário)

---

## Anexo: Estrutura Proposta Final

```
banco-dados-techdengue/
├── .github/
│   ├── workflows/deploy.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                    # Documentação limpa
│   ├── architecture/
│   ├── guides/
│   └── api/
├── frontend/               # React + Vite
├── scripts/                # Scripts utilitários
│   ├── etl/
│   ├── analysis/
│   └── validation/
├── src/
│   ├── api/
│   │   ├── routers/       # NOVO
│   │   ├── app.py
│   │   ├── dependencies.py # NOVO
│   │   └── schemas.py
│   ├── core/
│   ├── services/
│   └── shared/            # NOVO
├── tests/
│   ├── api/
│   ├── services/          # NOVO
│   └── conftest.py
├── .pre-commit-config.yaml # NOVO
├── Makefile               # NOVO
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

*Documento gerado automaticamente com base na análise do repositório.*
