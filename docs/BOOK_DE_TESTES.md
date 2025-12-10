# 📋 Book de Testes - TechDengue

> Documento de validação completa da aplicação.  
> Atualizado em: 2025-12-09

---

## 1. Visão Geral da Aplicação

| Componente | Stack | URL |
|------------|-------|-----|
| **API Backend** | FastAPI + Python 3.14 | `http://localhost:8000` |
| **Frontend** | React + Vite + TypeScript | `https://banco-dados-techdengue.netlify.app` |
| **Banco de Dados** | PostgreSQL (RDS/Supabase) | RDS AWS |
| **Cache** | Redis (Upstash) | Upstash |

---

## 2. Endpoints da API

### 2.1. Endpoints Públicos (sem autenticação)

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| GET | `/` | Root/Docs redirect | - |
| GET | `/health` | Health check | - |
| GET | `/api/v1/docs` | Swagger UI | - |

### 2.2. Endpoints de Dados

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| GET | `/api/v1/atividades` | Lista atividades TechDengue | 60/min |
| GET | `/api/v1/atividades/{id}` | Detalhe de atividade | 60/min |
| GET | `/api/v1/municipios` | Lista municípios | 60/min |
| GET | `/api/v1/municipios/{codigo_ibge}` | Detalhe de município | 60/min |
| GET | `/api/v1/dengue` | Dados epidemiológicos | 60/min |
| GET | `/api/v1/dengue/historico` | Histórico de dengue | 60/min |
| GET | `/api/v1/pois` | Pontos de interesse | 60/min |
| GET | `/api/v1/analytics/summary` | Resumo analítico | 10/min |

### 2.3. Endpoints de Export

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| GET | `/api/v1/export/csv` | Export CSV | 5/min |
| GET | `/api/v1/export/json` | Export JSON | 5/min |
| GET | `/api/v1/export/parquet` | Export Parquet | 5/min |

### 2.4. Endpoints GIS

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| GET | `/api/v1/gis/layers` | Camadas GIS | 60/min |
| GET | `/api/v1/gis/features` | Features geográficas | 60/min |

---

## 3. Cenários de Teste

### 3.1. API - Happy Path

```bash
# Health Check
curl -X GET http://localhost:8000/health
# Esperado: {"status": "healthy", ...}

# Lista Atividades
curl -X GET http://localhost:8000/api/v1/atividades
# Esperado: {"items": [...], "total": N, "page": 1}

# Lista Municípios
curl -X GET http://localhost:8000/api/v1/municipios
# Esperado: {"items": [...], "total": N}

# Dados de Dengue
curl -X GET http://localhost:8000/api/v1/dengue
# Esperado: {"items": [...], "ano": 2024}

# Analytics Summary
curl -X GET http://localhost:8000/api/v1/analytics/summary
# Esperado: {"total_atividades": N, "total_pois": M, ...}
```

### 3.2. API - Cenários de Erro

```bash
# Recurso não encontrado
curl -X GET http://localhost:8000/api/v1/atividades/99999
# Esperado: {"detail": "Atividade não encontrada"}, status 404

# Parâmetro inválido
curl -X GET "http://localhost:8000/api/v1/atividades?page=-1"
# Esperado: {"detail": "..."}, status 422

# Rate Limit Exceeded
# (fazer mais de 60 requests em 1 minuto)
# Esperado: status 429, {"error": "rate_limit_exceeded", ...}
```

### 3.3. Frontend - Páginas Principais

| Página | URL | Verificações |
|--------|-----|--------------|
| Home/Monitor | `/` | Cards de status, gráficos carregam |
| Qualidade | `/quality` | Tabela de validações exibida |
| Dados | `/data-table` | Tabela paginada funcional |

### 3.4. Frontend - Fluxos de UI

| Fluxo | Passos | Resultado Esperado |
|-------|--------|-------------------|
| **Navegação** | Clicar em cada item do menu | Página correspondente carrega |
| **Tema** | Toggle dark/light mode | Cores mudam corretamente |
| **Responsivo** | Redimensionar para mobile | Menu drawer aparece |
| **Paginação** | Navegar páginas na tabela | Dados atualizam |

---

## 4. Testes Automatizados

### 4.1. Frontend (Vitest)

```bash
cd frontend
npm run test -- --run
```

| Suite | Arquivo | Testes |
|-------|---------|--------|
| Utils | `src/lib/utils.test.ts` | 12 |
| Button | `src/components/ui/button.test.tsx` | 6 |
| **Total** | | **18** |

### 4.2. Backend (Pytest)

```bash
$env:TESTING="true"; python -m pytest tests/ -v
```

| Suite | Arquivo | Testes |
|-------|---------|--------|
| API GIS | `tests/api/test_api_gis.py` | 2 (skip) |
| API Smoke | `tests/api/test_api_smoke.py` | 7 |
| Export | `tests/api/test_export_fields.py` | 3 |
| Endpoints | `tests/api/test_new_endpoints.py` | 5 |
| API Base | `tests/test_api.py` | 3 |
| UI Components | `tests/components/test_ui_components.py` | 20 |
| Accessibility | `tests/accessibility/test_a11y.py` | 30 |
| Config | `tests/test_config.py` | 2 |
| **Total** | | **72** (68 pass, 2 fail, 2 skip) |

### 4.3. Testes Falhando (Conhecidos)

| Teste | Motivo | Severidade |
|-------|--------|------------|
| `test_sr_only_class_exists` | CSS acessibilidade | Baixa |
| `test_drawer_items_have_min_height` | CSS touch target | Baixa |

---

## 5. Validação de Qualidade de Dados

### 5.1. Regras de Negócio

| Regra | Descrição | Validador |
|-------|-----------|-----------|
| `project_start` | Dados >= 2023-01-01 | `src/core/data_quality.py` |
| `valid_years` | Anos: 2023, 2024, 2025, 2026 | `src/core/data_quality.py` |
| `positive_metrics` | POIs, Hectares >= 0 | `src/core/data_quality.py` |
| `known_contratantes` | CISARP, ICISMEP, etc. | `src/core/data_quality.py` |

### 5.2. Comando de Validação

```bash
python src/core/data_quality.py
```

---

## 6. Comandos de Validação Rápida

### 6.1. Validação Completa

```bash
# Backend
$env:TESTING="true"; python -m pytest tests/ -v --tb=short

# Frontend
cd frontend && npm run test -- --run && npm run build

# Lint
cd frontend && npm run lint
```

### 6.2. Smoke Test da API

```bash
# Iniciar API
uvicorn src.api.app:app --reload

# Em outro terminal
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/atividades?limit=5
```

---

## 7. Checklist de Deploy

### 7.1. Pre-Deploy

- [ ] Todos os testes passam (ou falhas são conhecidas)
- [ ] Build do frontend sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets não expostos no código

### 7.2. Post-Deploy

- [ ] Health check retorna OK
- [ ] Frontend carrega sem erros no console
- [ ] Dados exibidos corretamente
- [ ] Rate limiting funcionando

---

## 8. Histórico de Validações

| Data | Versão | Backend | Frontend | Observações |
|------|--------|---------|----------|-------------|
| 2025-12-09 | v1.0 | 68/70 ✅ | 18/18 ✅ | 2 falhas CSS a11y |

---

## 9. Contatos e Referências

- **Repositório**: https://github.com/ClaudioRibeiro2023/banco-dados-techdengue
- **Frontend**: https://banco-dados-techdengue.netlify.app
- **API Docs**: `/api/v1/docs` (Swagger UI)
