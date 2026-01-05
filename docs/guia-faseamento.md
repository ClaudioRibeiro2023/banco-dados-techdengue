# Guia de Faseamento da Aplicação TechDengue

Este guia descreve a metodologia faseada para estruturar uma base de dados integrada a partir de múltiplas fontes, mantendo o banco oficial (GIS/RDS) somente leitura, materializando dados para consumo via API e, quando necessário, persistindo derivados em um banco secundário (Warehouse).

- Data atual: 2025-11-04
- Versão do guia: 1.0.0

---

## 1. Objetivo e Escopo

- Estruturar uma base integrada (Bronze → Silver → Gold) a partir de:
  - Banco GIS oficial (PostgreSQL/PostGIS) em modo somente leitura.
  - Planilhas Excel e demais insumos.
- Expor dados via API (FastAPI) para consumo por clientes (web, serviços, análises).
- Persistir dados derivados (tabelas de fato/dimensão) apenas em um banco secundário (Warehouse), mantendo o banco oficial sem escrita.

Escopo fora (out of scope) imediato:
- Alterações de schema no banco oficial.
- Processos destrutivos (DROP/TRUNCATE) em qualquer banco.

---

## 2. Arquitetura Alvo (Visão Geral)

- Fontes (Leitura):
  - GIS/PostgreSQL (RDS oficial) – somente leitura.
  - Arquivos Excel (mega planilha, dengue, IBGE etc.).
- ETL (Python):
  - Bronze: ingestão bruta + cache Parquet.
  - Silver: limpeza, padronização, validação, agregações niveladas.
  - Gold: agregações de negócio, KPIs, tabelas derivadas para consumo analítico.
- Persistência:
  - Parquet em `dados_integrados/` e `data_lake/*`.
  - Warehouse (PostgreSQL secundário) para escrita de fatos/dimensões derivadas.
- Exposição:
  - API FastAPI (endpoints de facts, summary e, depois, gold).

Invariantes (CISARP) aplicados:
- Configuração via `.env` (sem segredos no código).
- Logs com Loguru (evitar `print`), observabilidade básica.
- Validação de I/O (Pydantic) e contratos versionados.
- Path cross-platform (`pathlib`), sem hardcode de caminhos.

---

## 3. Configuração (.env)

Variáveis obrigatórias de leitura (GIS oficial – somente leitura):
```
GIS_DB_HOST=<host_rds_oficial>
GIS_DB_PORT=5432
GIS_DB_NAME=postgres
GIS_DB_USERNAME=<gis_ro_user>
GIS_DB_PASSWORD=<senha_ro>
GIS_DB_SSL_MODE=require
```

Variáveis de escrita (Warehouse – secundário):
```
WAREHOUSE_DB_HOST=<host_warehouse>
WAREHOUSE_DB_PORT=5432
WAREHOUSE_DB_NAME=postgres
WAREHOUSE_DB_USERNAME=td_app
WAREHOUSE_DB_PASSWORD=<senha_forte>
WAREHOUSE_DB_SSL_MODE=prefer
```

Observações:
- `.env` não deve ser versionado.
- Alternativa segura: exportar variáveis apenas na sessão (PowerShell/Unix) antes de executar comandos.

---

## 4. Metodologia Faseada

### 4.1 Fase 0 – Alinhamento e Setup (CONCLUÍDA)
- Objetivo: ambiente local funcional, leitura RO do GIS, pipeline executável.
- Ações:
  - Instalação de dependências (`requirements.txt`).
  - Validação de conexão ao RDS (somente leitura).
  - Subida da API local (Uvicorn) e smoke tests básicos.
- Evidências:
  - `python gis_cli.py test-connection` → OK.
  - API em `http://127.0.0.1:8001` com `/health` e `/facts` OK.

### 4.2 Fase 1 – BRONZE (PARCIALMENTE CONCLUÍDA)
- Objetivo: ingestão bruta e cache local.
- Ações:
  - Sincronização de tabelas do GIS para cache Parquet (`cache/*.parquet`).
  - Carregamento de fontes Excel para `data_lake/bronze`.
- Artefatos:
  - `cache/banco_techdengue.parquet`, `cache/planilha_campo.parquet`.
  - `data_lake/bronze/*.parquet` (atividades_excel, ibge_referencia, dengue_historico).
- Status atual:
  - GIS cache: OK.
  - Excel mega planilha: OK (bronze parquet gerado).

### 4.3 Fase 2 – SILVER (CONCLUÍDA PARA FATO ATIVIDADES; PARCIAL PARA DIMENSÕES)
- Objetivo: limpeza, padronização, validações e agregações consistentes.
- Ações:
  - Padronização de colunas e codificação IBGE (zero padding, normalização de `Municipio`).
  - Conversão de tipos (datas, numéricos) e coerção segura.
  - Agregação para evitar duplicação de hectares (usar `max` em `HECTARES_MAPEADOS`).
  - Validações: nulos obrigatórios, chave composta, faixa de valores.
- Artefatos principais:
  - `dados_integrados/fato_atividades_techdengue.parquet` (1281 linhas, pós-agregação).
  - `data_lake/silver/dim_municipios.parquet` (parcial, a evoluir com IBGE completo).
- Status atual:
  - `fato_atividades`: CONCLUÍDO.
  - `dim_municipios`: PARCIAL (ajustes e enriquecimentos pendentes).

### 4.4 Fase 3 – WAREHOUSE (PENDENTE)
- Objetivo: persistir fatos/dimensões derivadas em banco secundário, mantendo o oficial read-only.
- Ações necessárias:
  1) Provisionar Warehouse (PostgreSQL) – host/porta/db.
  2) Criar role/usuário de escrita com privilégios mínimos (executar no Warehouse):
     ```sql
     DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'td_writer') THEN
         CREATE ROLE td_writer;
       END IF;
     END $$;

     GRANT CONNECT ON DATABASE postgres TO td_writer;
     GRANT USAGE, CREATE ON SCHEMA public TO td_writer;
     GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO td_writer;
     GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO td_writer;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE ON TABLES TO td_writer;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO td_writer;

     DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'td_app') THEN
         CREATE USER td_app WITH PASSWORD '<SENHA_FORTE>' LOGIN;
       END IF;
     END $$;

     GRANT td_writer TO td_app;
     ```
  3) Configurar `.env` com `WAREHOUSE_DB_*`.
  4) Executar ingestão para Warehouse (escrita por padrão no Warehouse):
     ```bash
     python -c "from src.ingestion import ingest_mega_planilha; import json; r=ingest_mega_planilha(); print(json.dumps(r, indent=2, default=str))"
     ```
  5) Validar tabela no Warehouse:
     ```bash
     # Contagem
     python -c "from src.database import DatabaseManager; from src.config import Config; db=DatabaseManager(db_config=Config.WAREHOUSE_DB); print(db.execute_query('SELECT COUNT(*) FROM fato_atividades_techdengue'))"

     # Amostra
     python -c "from src.database import DatabaseManager; from src.config import Config; db=DatabaseManager(db_config=Config.WAREHOUSE_DB); import pandas as pd; df=db.query_to_dataframe('SELECT * FROM fato_atividades_techdengue LIMIT 5'); print(df)"
     ```
- Status atual:
  - Código ajustado para Warehouse: CONCLUÍDO.
  - Provisionamento + credenciais + ingestão no Warehouse: PENDENTE.

### 4.5 Fase 4 – GOLD (CONCLUÍDA – v1 analise_integrada)
- Objetivo: materializar agregações finais de negócio e KPIs (v1: `analise_integrada`).
- Ações realizadas:
  - Métricas v1 definidas: `total_pois`, `total_devolutivas`, `total_hectares`, `atividades` por `codigo_ibge`/`municipio`/`competencia (Mês)`.
  - Materialização GOLD em Parquet: `dados_integrados/analise_integrada.parquet`.
  - Contratos Pydantic: `GoldAnaliseRecord`, `GoldAnaliseResponse`.
- Evidências:
  - Materialização executada com sucesso: 1229 linhas, colunas: `[codigo_ibge, municipio, competencia, total_pois, total_devolutivas, total_hectares, atividades]`.
- DoD:
  - KPIs conferidos; consistência temporal; contratos estáveis e versionados (v1).

### 4.6 Fase 5 – API (PARCIALMENTE CONCLUÍDA)
- Objetivo: expor datasets para consumo externo.
- Ações realizadas:
  - Endpoints: `/health`, `/facts`, `/facts/summary`, `/gis/banco`, `/gis/pois`, `/gold/analise`.
  - Cache de Parquet por mtime; paginação/limite.
- Pendências:
  - Filtros adicionais e documentação OpenAPI reforçada.

### 4.7 Fase 6 – Qualidade, Testes e Observabilidade (PENDENTE)
- Ações:
  - Testes unit/integration/E2E (smoke rotas críticas).
  - Observabilidade: Loguru como padrão; métricas básicas; logs WARNING+.
  - Lint/format; imports cíclicos.

### 4.8 Fase 7 – Segurança e Governança (PENDENTE)
- Ações:
  - Política de segredos (env/secret store) e rotação de credenciais `td_app`.
  - Data contracts versionados (BREAKING → bump versão); cache TTL e auditoria hit/miss.

### 4.9 Fase 8 – Orquestração e Deploy (PENDENTE)
- Ações:
  - Agendamento do pipeline (cron/CI/CD/Jobs).
  - Deploy da API (Netlify/VPS/Container) com smoke pós-deploy.

---

## 5. Itens Concluídos vs Pendentes

Concluídos:
- Dependências instaladas.
- Conexão ao GIS oficial (RO) validada.
- Mega planilha validada (1977 linhas; WARN duplicatas na chave composta).
- Materialização Parquet `fato_atividades_techdengue.parquet` (1281 linhas pós-agregação).
- API FastAPI rodando local; smoke tests aprovados.
- Suporte a Warehouse no código:
  - `Config.WAREHOUSE_DB` (novas variáveis `WAREHOUSE_DB_*`).
  - `DatabaseManager(db_config=...)` e `get_warehouse_database()`.
  - `ingest_mega_planilha(..., use_warehouse=True)` escrevendo no Warehouse por padrão.
 - GOLD v1 materializado: `dados_integrados/analise_integrada.parquet` (1229 linhas).
 - Endpoint GOLD publicado: `/gold/analise`.

Pendentes (prioridade alta primeiro):
- Provisionar Warehouse e criar `td_writer/td_app` (mínimos privilégios).
- Atualizar `.env` local com `WAREHOUSE_DB_*` (sem versionar segredos).
- Executar ingestão no Warehouse e validar tabela/contagem.
- Testes automatizados; lint/format; observabilidade Loguru.

---

## 6. Checklists de DoD por Fase

Fase 0–2 (Bronze/Silver):
- [x] Fontes lidas e validadas (Excel + GIS RO).
- [x] Parquet gerado (Silver) com chaves e tipos padronizados.
- [x] WARN/ERROR documentados na validação (sem ERROR em produção).

Fase 3 (Warehouse):
- [ ] Role/usuário com privilégios mínimos criados; `.env` atualizado.
- [ ] Ingestão idempotente (ON CONFLICT) executada e validada.

Fase 4–5 (Gold + API):
- [ ] KPIs e schema gold definidos e versionados.
- [ ] Endpoints gold publicados; smoke OK; logs limpos.

Fase 6–8 (Qualidade, Segurança, Orquestração):
- [ ] Testes (unit/integration/E2E) passando.
- [ ] Lint/format/CI OK.
- [ ] Segredos fora do repositório; rotação definida.
- [ ] Pipeline agendado; deploy API com smoke.

---

## 7. Comandos Úteis

- Validar mega planilha:
```
python -c "from src.validators import validate_mega_planilha; import json; r=validate_mega_planilha(); print(json.dumps({'ok': r.ok, 'rows': r.rows, 'columns': r.columns, 'issues': [i.model_dump() for i in r.issues]}, indent=2))"
```

- Materializar Parquet (fato atividades):
```
python -c "from src.materialize import materialize_facts_to_parquet; import json; r=materialize_facts_to_parquet(); print(json.dumps(r, indent=2))"
```

- Materializar GOLD (analise_integrada):
```
python -c "from src.materialize import materialize_gold_analise; import json; r=materialize_gold_analise(); print(json.dumps(r, indent=2))"
```

- Ingestão para Warehouse:
```
python -c "from src.ingestion import ingest_mega_planilha; import json; r=ingest_mega_planilha(); print(json.dumps(r, indent=2, default=str))"
```

- Testar conexão GIS (RO):
```
python gis_cli.py test-connection
```

- Info de tabela (Warehouse):
```
python -c "from src.database import DatabaseManager; from src.config import Config; db=DatabaseManager(db_config=Config.WAREHOUSE_DB); from pprint import pprint; pprint(db.get_table_info('fato_atividades_techdengue'))"
```

- Smoke test API GOLD (servidor em 127.0.0.1:8001):
```
curl "http://127.0.0.1:8001/gold/analise?codigo_ibge=3550308&limit=5"
```

---

## 8. Riscos e Decisões

- GIS oficial deve permanecer read-only: riscos de acesso indevido mitigados com segregação por `.env` e uso do Warehouse para escrita.
- Consistência de chaves e codificação IBGE: padronização aplicada no Silver; duplicações controladas por chave composta no fato.
- Segredos: nunca versionar; usar env/secret store; definir rotação periódica para `td_app`.

---

## 9. Roadmap Resumido

1) Provisionar Warehouse e credenciais → Ingestão no Warehouse → Validação.
2) Definir Gold (KPIs/schema) → Materializar Gold → Endpoints Gold.
3) Qualidade (tests, lint, observabilidade) → Orquestração/Deploy.
4) Operação contínua: monitorar, ajustar TTL/Cache, evoluir contratos versionados.

---

## 10. Referências (Código)

- `src/config.py`: `GIS_DB` e `WAREHOUSE_DB`.
- `src/database.py`: `DatabaseManager`, `get_database()`, `get_warehouse_database()`.
- `src/repository.py`: consultas ao GIS (RO).
- `src/sync.py`: sincronização e cache Parquet.
- `src/validators.py`: validação da mega planilha.
- `src/materialize.py`: materialização Parquet do fato atividades.
- `src/ingestion.py`: upsert no Warehouse (por padrão).
- `src/api/app.py`: endpoints `/health`, `/facts`, `/facts/summary`, `/gis/*`.

---

## 11. Anotações de Status (Evidências Resumidas)

- Mega planilha: 1977 linhas, 41 colunas; WARN duplicatas na chave composta.
- Parquet `fato_atividades_techdengue`: 1281 linhas (pós-aggregate).
- API local: `/health`, `/facts`, `/facts/summary`, `/gis/banco`, `/gis/pois` testados com sucesso.
- Próximo passo: Warehouse provisionado + ingestão + validação.
