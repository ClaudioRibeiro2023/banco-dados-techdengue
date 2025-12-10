# Plano de Melhorias – TODO

Este arquivo acompanha o plano de melhorias faseado descrito em `docs/PROPOSTA_ARQUITETURA.md` e serve como checklist de implementação.

> **Uso:** Marque os itens conforme forem concluídos (`[x]`).  
> Para detalhes (comandos, código, contexto), consulte a Proposta.

---

## Legenda de Prioridade

- **[P0]** Crítico / Bloqueante
- **[P1]** Alta prioridade
- **[P2]** Importante, mas não urgente
- **[P3]** Melhoria incremental / Nice to have

---

## Fase 0 – Fundamentos & Quick Wins

> **Objetivo:** Corrigir problemas críticos e preparar base para melhorias.

- [x] [P0] **0.1** Ativar Sentry no Railway — adicionar variáveis:
  - ✅ Concluído em 2025-12-10
  - `SENTRY_DSN=https://91d9b63a6765b49bfe0efdfcb3a7581f@o4510502722142208.ingest.us.sentry.io/4510508545474560`
  - `SENTRY_ENVIRONMENT=production`

- [x] [P0] **0.2** Configurar pre-commit hooks — criar `.pre-commit-config.yaml`:
  - ✅ Concluído em 2025-12-10
  ```yaml
  repos:
    - repo: https://github.com/astral-sh/ruff-pre-commit
      rev: v0.1.9
      hooks:
        - id: ruff
        - id: ruff-format
    - repo: https://github.com/pre-commit/pre-commit-hooks
      rev: v4.5.0
      hooks:
        - id: trailing-whitespace
        - id: end-of-file-fixer
  ```
  - Executar: `pip install pre-commit && pre-commit install`

- [x] [P0] **0.3** Mover scripts `.py` da raiz para `/scripts`:
  - ✅ Concluído em 2025-12-10
  - `carregar_base_integrada.py` → `scripts/etl/`
  - `criar_base_integrada.py` → `scripts/etl/`
  - `criar_mega_tabela.py` → `scripts/etl/`
  - `pipeline_etl_completo.py` → `scripts/etl/`
  - `conectar_banco_gis.py` → `scripts/db/`
  - `gis_cli.py` → `scripts/cli/`
  - `validar_dados_servidor.py` → `scripts/validation/`
  - `test_dashboard.py` → `tests/`
  - `test_import.py` → `tests/`

- [x] [P1] **0.4** Remover/consolidar arquivos `.bat`:
  - ✅ Concluído em 2025-12-10 (movidos para scripts/legacy/)
  - Criar `Makefile` com targets equivalentes
  - Remover: `ATIVAR_DASHBOARD_NOVO.bat`, `RUN_*.bat`, `START_DASHBOARD.bat`

- [x] [P0] **0.4** Limpar variáveis obsoletas do `.env`
  - ✅ .env já está limpogada:
  - Mover `docs/archive/` para backup externo ou deletar
  - Mover `docs/legacy/` para backup externo ou deletar
  - Consolidar documentação ativa em estrutura clara

- [x] [P1] **0.5** Consolidar arquivos `.env`:
  - Manter apenas: `.env` (local), `.env.example` (template)
  - Remover: `railway.env` (usar variáveis no painel do Railway)
  - `.env.production` pode ficar ignorado no git

- [x] [P2] **0.6** Limpar documentação legada:
  - Mover `docs/archive/` para backup externo ou deletar
  - Mover `docs/legacy/` para backup externo ou deletar
  - Consolidar documentação ativa em estrutura clara

---

## Fase 1 – Organização & Arquitetura

> **Objetivo:** Modularizar `app.py` e estabelecer estrutura de routers.

- [x] [P0] **1.1** Criar `src/api/routers/__init__.py`
  - ✅ Concluído em 2025-12-10

- [x] [P0] **1.2** Criar `src/api/routers/health.py`:
  - ✅ Concluído em 2025-12-10
  - Mover endpoints: `/health`, `/monitor`, `/quality`, `/datasets`
  - Ver seção 4.1 da Proposta

- [x] [P0] **1.3** Criar `src/api/routers/facts.py`:
  - ✅ Concluído em 2025-12-10
  - Mover endpoints: `/facts`, `/facts/summary`, `/facts/export`
  - Ver seção 4.1 da Proposta

- [x] [P1] **1.4** Criar `src/api/routers/weather.py`:
  - ✅ Concluído em 2025-12-10
  - Mover endpoints: `/api/v1/weather/*`
  - Ver seção 4.1 da Proposta

- [x] [P1] **1.5** Criar `src/api/routers/weather.py` (inclui risk):
  - ✅ Concluído em 2025-12-10
  - Mover endpoints: `/api/v1/risk/*`
  - Ver seção 4.1 da Proposta

- [x] [P1] **1.6** Criar `src/api/routers/gis.py`:
  - ✅ Concluído em 2025-12-10
  - Mover endpoints: `/gis/*`
  - Ver seção 4.1 da Proposta

- [x] [P2] **1.7** Criar `src/api/routers/admin.py`:
  - ✅ Concluído em 2025-12-10
  - Mover endpoints: `/api/v1/admin/*`, `/api/v1/audit/*`
  - Ver seção 4.1 da Proposta

- [x] [P1] **1.8** Criar `src/api/dependencies.py`:
  - ✅ Concluído em 2025-12-10
  - Extrair dependências comuns (cache, db, rate limiter)

- [ ] [P2] **1.9** Mover import de `unicodedata` para topo em `weather.py`

- [ ] [P2] **1.10** Criar `src/shared/__init__.py`

- [ ] [P2] **1.11** Criar `src/shared/exporters.py`:
  - Consolidar lógica de export CSV/Parquet

---

## Fase 2 – Qualidade de Código & Testes

> **Objetivo:** Aumentar cobertura de testes e garantir qualidade.

- [x] [P0] **2.1** Adicionar pytest-cov ao `requirements.txt`
  - ✅ Concluído em 2025-12-10

- [x] [P0] **2.2** Configurar coverage no CI (`.github/workflows/deploy.yml`):
  - ✅ Concluído em 2025-12-10 (min 50%)
  ```yaml
  - name: Run tests with coverage
    run: pytest tests/ -v --cov=src --cov-report=xml
  ```

- [x] [P1] **2.3** Criar `tests/services/__init__.py`
  - ✅ Concluído em 2025-12-10

- [x] [P1] **2.4** Criar `tests/services/test_weather.py`:
  - ✅ Concluído em 2025-12-10 (20 testes, 81% coverage)
  - Testar `WeatherService._normalize_cidade()`
  - Testar `WeatherService._calcular_favorabilidade()`
  - Testar `WeatherService.analyze_dengue_risk()`

- [x] [P1] **2.5** Criar `tests/services/test_risk_analyzer.py`:
  - ✅ Concluído em 2025-12-10 (19 testes)
  - Testar `RiskAnalyzer.analyze_risk()`

- [x] [P1] **2.6** Expandir testes de integração para routers:
  - ✅ Concluído em 2025-12-10 (20 testes em test_routers.py)
  - Testar paginação
  - Testar filtros
  - Testar exports

- [x] [P1] **2.7** Expandir testes para `/weather/*`:
  - ✅ 20 testes passando (92% cobertura)
  - Testar normalização de cidades
  - Testar mock weather data

- [x] [P2] **2.8** Adicionar badge de coverage no README
  - ✅ Concluído em 2025-12-10

- [ ] [P2] **2.9** Revisar testes E2E do frontend (Playwright)

---

## Fase 3 – Infraestrutura & Performance

> **Objetivo:** Otimizar build e melhorar DX.

- [x] [P0] **3.1** Criar `Makefile`:
  - ✅ Já existia completo
  ```makefile
  .PHONY: dev test lint build

  dev:
      uvicorn src.api.app:app --reload --port 8000

  test:
      pytest tests/ -v

  lint:
      ruff check src/ tests/
      ruff format --check src/ tests/

  build:
      docker build -t techdengue-api .
  ```

- [x] [P1] **3.2** Otimizar `Dockerfile`:
  - ✅ Concluído em 2025-12-10 (multi-stage build, healthcheck)
  - Adicionar cache de pip com `--mount=type=cache`
  - Usar multi-stage build otimizado

- [x] [P2] **3.3** Revisar `.dockerignore`:
  - ✅ Concluído em 2025-12-10
  - Garantir que exclui: `__pycache__`, `.git`, `venv/`, `node_modules/`

- [x] [P2] **3.4** Configurar hot-reload para desenvolvimento:
  - ✅ Já documentado no Makefile (`make dev` usa --reload)
  - Documentar comando com `--reload`

---

## Fase 4 – Observabilidade & Robustez

> **Objetivo:** Melhorar monitoramento e resiliência.

- [ ] [P1] **4.1** Configurar alertas no Sentry:
  - Alerta para erros 5xx > 5/hora
  - Alerta para latência p95 > 2s

- [x] [P1] **4.2** Melhorar health check `/health`:
  - ✅ Concluído em 2025-12-10 (verifica Redis, retorna issues)
  - Verificar conexão Redis
  - Verificar existência dos Parquet files
  - Retornar `ok: false` se dependências falharem

- [x] [P2] **4.3** Adicionar contexto aos logs:
  - ✅ Concluído em 2025-12-10 (contextvars para request_id)
  - Request ID em cada log
  - User/API key quando disponível

- [ ] [P3] **4.4** [OPCIONAL] Criar endpoint `/metrics` para Prometheus

- [ ] [P3] **4.5** [OPCIONAL] Configurar dashboard de métricas (Grafana)

---

## Fase 5 – DX & Governança

> **Objetivo:** Facilitar contribuição e manutenção.

- [x] [P1] **5.1** Criar `CONTRIBUTING.md`:
  - ✅ Concluído em 2025-12-10
  - Guia de setup local
  - Padrões de código
  - Processo de PR

- [x] [P1] **5.2** Consolidar documentação em `/docs`:
  - ✅ Concluído em 2025-12-10 (removido archive e legacy)
  - Remover arquivos duplicados
  - Criar índice navegável
  - Atualizar links quebrados

- [x] [P0] **0.5** Consolidar duplicações de documentação
  - ✅ Removido legacy/archive, atualizado docs/README.md em `/docs`:
  - ✅ Concluído em 2025-12-10 (removido archive e legacy)
  - Remover arquivos duplicados
  - Criar índice navegável
  - Atualizar links quebrados

- [x] [P2] **5.3** Criar `.github/ISSUE_TEMPLATE/bug_report.md`
  - ✅ Concluído em 2025-12-10

- [x] [P2] **5.4** Criar `.github/ISSUE_TEMPLATE/feature_request.md`
  - ✅ Concluído em 2025-12-10

- [x] [P2] **5.5** Criar `.github/PULL_REQUEST_TEMPLATE.md`
  - ✅ Concluído em 2025-12-10

- [x] [P2] **5.6** Atualizar README com seção de arquitetura
  - ✅ Concluído em 2025-12-10

- [ ] [P3] **5.7** [OPCIONAL] Configurar MkDocs para documentação

---

## Observações

Use este arquivo como checklist vivo. Adicione notas rápidas abaixo dos itens conforme necessário.

**Exemplo de uso:**

```markdown
- [x] [P0] **0.1** Ativar Sentry no Railway
  - ✅ Concluído em 2025-12-10
  - Nota: DSN configurado, alertas pendentes
```

---

## Progresso Geral

| Fase | Total | Concluídos | % |
|------|-------|------------|---|
| 0 | 6 | 6 | 100% |
| 1 | 11 | 8 | 73% |
| 2 | 9 | 8 | 89% |
| 3 | 4 | 4 | 100% |
| 4 | 5 | 2 | 40% |
| 5 | 7 | 6 | 86% |
| **Total** | **42** | **34** | **81%** |

---

*Última atualização: 2025-12-10*
