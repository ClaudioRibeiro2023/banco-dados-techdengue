# TechDengue API – Dicionário de Dados

Este documento descreve as principais tabelas e colunas disponíveis para consulta via API TechDengue, bem como o significado dos dados e sugestões de uso.

Tabelas cobertas:
- `fato_atividades_techdengue` (endpoint `/facts`)
- `analise_integrada` (endpoint `/gold/analise`)
- `fato_dengue_historico` (endpoint `/dengue`)
- `dim_municipios` (endpoint `/municipios`)
- Tabelas GIS principais (endpoints `/gis/banco` e `/gis/pois`)

---

## 1. fato_atividades_techdengue

**Origem**: Mega planilha de atividades TechDengue

**Arquivo**: `dados_integrados/fato_atividades_techdengue.parquet`

**Endpoint principal**: `/facts`

**Grão (nível de detalhe)**: combinação de município (`CODIGO_IBGE`), data de referência da atividade (`DATA_MAP`) e nomenclatura de atividade (`NOMENCLATURA_ATIVIDADE`).

### Colunas principais

- **CODIGO_IBGE**  
  Tipo: inteiro (7 dígitos)  
  Descrição: código IBGE do município (chave de junção com `dim_municipios` e outras bases).  
  Observação: na API é exposto como `codigo_ibge`.

- **DATA_MAP**  
  Tipo: data  
  Descrição: data de referência do mapeamento/atividade (por exemplo, data da operação em campo).  
  Uso: permite filtro temporal em `/facts` (`start_date`, `end_date`).  
  Na API: campo `data_map`.

- **NOMENCLATURA_ATIVIDADE**  
  Tipo: texto  
  Descrição: descrição padronizada da atividade executada (ex.: "Mapeamento urbano", "Devolutiva técnica").  
  Na API: `nomenclatura_atividade`, com filtro via parâmetro `atividade` (alias `nomenclatura_atividade`).

- **HECTARES_MAPEADOS**  
  Tipo: numérico (float)  
  Descrição: área total mapeada pela atividade (em hectares).  
  Na API: `hectares_mapeados`; usado em agregações e análise de esforço territorial.

- **POIS**  
  Tipo: inteiro  
  Descrição: total de POIs (pontos de interesse) identificados na combinação município+atividade+data.  
  Na API: `pois`; usado em `/facts`, `/facts/summary` e na geração da tabela gold.

- **devolutivas**  
  Tipo: numérico (float)  
  Descrição: quantidade de devolutivas (ações de retorno, relatórios, reuniões) associadas à atividade.  
  Uso: avalia a conversão de mapeamentos em ações concretas junto aos municípios.

- **removido_solucionado**, **descaracterizado**, **Tratado**, **morador_ausente**, **nao_Autorizado**, **tratamento_via_drones**, **monitorado**  
  Tipo: numérico (contagens)  
  Descrição: indicadores operacionais de status dos focos/POIs (removidos, tratados, não acessados, etc.).  
  Uso: análise de efetividade da intervenção (ex.: proporção de focos tratados).

- **A - Caixa de água elevada**, **A - Tonel, Barril, Tambor**, **A - Poço / Cacimba**, **B - Balde / Frasco**, **C - Tanques (pátios construção e mecanicas)**, **C - Máquinas/Equip em pátios**, **C - Piscinas e fontes**, **D - Pneus**, **D - Lixo (plásticos, latas, sucatas e entulhos)**, **O - Outros (laje com acúmulo)**, **O - Outros**  
  Tipo: numérico (contagens)  
  Descrição: contagem de focos por categoria de criadouro, seguindo a tipologia padrão (A, B, C, D, O).  
  Uso: análise detalhada de tipos de criadouros predominantes por município/atividade.

- **A - Armazenamento de água**, **B - Pequenos depósitos móveis**, **C - Depósitos fixos**, **D - Depósitos passíveis de remoção**  
  Tipo: numérico (contagens)  
  Descrição: agregações por macrocategoria de criadouro (classificação A/B/C/D consolidada).  
  Uso: análise sintética orientada a políticas públicas.

- **CONTRATANTE**  
  Tipo: texto  
  Descrição: instituição contratante ou parceira responsável pela atividade (consórcio, prefeitura, etc.).

- **LINK_GIS**  
  Tipo: texto (URL)  
  Descrição: link para visualização GIS (mapa interativo) associado às atividades.

- **SUB_ATIVIDADE**  
  Tipo: texto  
  Descrição: nível de detalhe adicional da atividade (subtipo, fase específica).

- **DATA_CARGA**  
  Tipo: data/hora  
  Descrição: data/hora de carga do registro na tabela de fatos.

- **VERSAO**  
  Tipo: texto  
  Descrição: versão do pipeline/estrutura que gerou a base.

### Como consultar via API

- Endpoint: `/facts`
- Filtros:
  - `codigo_ibge`: filtra por município específico.
  - `nomenclatura_atividade` (parametro `atividade`): filtro parcial por nome de atividade.
  - `start_date`, `end_date`: intervalo sobre `data_map`.
- Paginação: `limit`, `offset`.
- Ordenação: `sort_by` (qualquer coluna existente), `order` (`asc`/`desc`).
- Exportação: `format=json|csv|parquet`, `fields=col1,col2,...`.

Exemplos:
- Top atividades por POIs em um município: `/facts?codigo_ibge=3106200&sort_by=pois&order=desc&limit=50`
- Exportar CSV com colunas básicas: `/facts?format=csv&fields=codigo_ibge,municipio,pois,hectares_mapeados`

---

## 2. analise_integrada (Tabela Gold)

**Arquivo**: `dados_integrados/analise_integrada.parquet`

**Endpoint principal**: `/gold/analise`

**Grão**: município (`CODIGO_IBGE`) por competência mensal (`competencia`).

### Colunas principais

- **CODIGO_IBGE**  
  Tipo: inteiro  
  Descrição: código IBGE do município.

- **MUNICIPIO**  
  Tipo: texto  
  Descrição: nome do município.

- **POPULACAO**  
  Tipo: inteiro  
  Descrição: população estimada do município (fonte IBGE ou equivalente).  
  Uso: construção de taxas por 100 mil habitantes.

- **URS**  
  Tipo: texto  
  Descrição: Unidade Regional de Saúde.

- **COD_MICROREGIAO**, **MICROREGIAO_SAUDE**  
  Tipo: código/texto  
  Descrição: código e nome da microrregião de saúde.

- **COD_MACROREGIAO**, **MACROREGIAO_SAUDE**  
  Tipo: código/texto  
  Descrição: código e nome da macrorregião de saúde.

- **AREA_HA**  
  Tipo: numérico  
  Descrição: área territorial do município em hectares.

- **CASOS_DENGUE_2023**, **CASOS_DENGUE_2024**, **CASOS_DENGUE_2025**  
  Tipo: inteiros  
  Descrição: total de casos notificados de dengue por ano, agregados no período considerado.

- **QTD_ATIVIDADES**  
  Tipo: inteiro  
  Descrição: número total de atividades TechDengue realizadas no município no período.

- **TOTAL_POIS**  
  Tipo: inteiro  
  Descrição: total de POIs identificados no município no período.

- **TOTAL_DEVOLUTIVAS**  
  Tipo: numérico  
  Descrição: total de devolutivas realizadas.

- **TOTAL_HECTARES**  
  Tipo: numérico  
  Descrição: área total mapeada (somatório de hectares) no período.

- **DATA_PRIMEIRA_ATIVIDADE**, **DATA_ULTIMA_ATIVIDADE**  
  Tipo: data  
  Descrição: datas da primeira e da última atividade TechDengue no município.

- **TAXA_CONVERSAO_DEVOLUTIVAS**  
  Tipo: numérico  
  Descrição: métrica derivada que relaciona devolutivas com mapeamentos/POIs (indicador de efetividade).

- **TEM_ATIVIDADE_TECHDENGUE**  
  Tipo: booleano  
  Descrição: indica se o município possui ou não atividades TechDengue no período.

### Como consultar via API

- Endpoint: `/gold/analise`
- Filtros:
  - `codigo_ibge`, `municipio` (texto parcial).
  - `comp_start`, `comp_end`: intervalo de competência (mensal).
- Paginação: `limit`, `offset`.
- Ordenação: `sort_by`, `order`.
- Exportação: `format=json|csv|parquet`, `fields=...`.

Exemplos:
- Municípios com maior `total_pois`: `/gold/analise?sort_by=total_pois&order=desc&limit=100`
- Exportar parquet apenas com indicadores-chave: `/gold/analise?format=parquet&fields=codigo_ibge,municipio,total_pois,total_devolutivas,total_hectares`

---

## 3. fato_dengue_historico

**Arquivo**: `dados_integrados/fato_dengue_historico.parquet`

**Endpoint principal**: `/dengue`

**Grão**: município (`CODIGO_IBGE`) por semana epidemiológica (`SEMANA_EPIDEMIOLOGICA`) e ano (`ANO`).

### Colunas

- **CODIGO_IBGE**  
  Tipo: inteiro  
  Descrição: código IBGE do município.

- **MUNICIPIO**  
  Tipo: texto  
  Descrição: nome do município.

- **CASOS**  
  Tipo: inteiro  
  Descrição: número de casos de dengue na combinação (município, semana, ano).

- **SEMANA_EPIDEMIOLOGICA**  
  Tipo: inteiro  
  Descrição: semana epidemiológica (1–52/53).  
  Uso: análise de sazonalidade e curvas epidêmicas.

- **ANO**  
  Tipo: inteiro  
  Descrição: ano de referência.

- **DATA_CARGA**, **VERSAO**  
  Tipo: data/texto  
  Descrição: metadados de carga e versão da base.

### Como consultar via API

- Endpoint: `/dengue`
- Filtros:
  - `codigo_ibge`.
- Paginação: `limit`, `offset`.
- Ordenação: `sort_by`, `order` (ex.: `CASOS`, `ANO`, `SEMANA_EPIDEMIOLOGICA`).
- Exportação: `format=json|csv|parquet`, `fields=...`.

Exemplos:
- Curva temporal de casos (export CSV): `/dengue?codigo_ibge=3106200&sort_by=ANO&order=asc&format=csv`

---

## 4. dim_municipios

**Arquivo**: `dados_integrados/dim_municipios.parquet`

**Endpoint principal**: `/municipios`

**Grão**: município (1 linha por município de MG).

### Colunas

- **CODIGO_IBGE**  
  Tipo: inteiro  
  Descrição: código IBGE do município (chave primária).

- **MUNICIPIO**  
  Tipo: texto  
  Descrição: nome do município.

- **POPULACAO**  
  Tipo: inteiro  
  Descrição: população do município.

- **URS**  
  Tipo: texto  
  Descrição: Unidade Regional de Saúde.

- **COD_MICROREGIAO**, **MICROREGIAO_SAUDE**  
  Tipo: código/texto  
  Descrição: microrregião de saúde do município.

- **COD_MACROREGIAO**, **MACROREGIAO_SAUDE**  
  Tipo: código/texto  
  Descrição: macrorregião de saúde.

- **AREA_HA**  
  Tipo: numérico  
  Descrição: área territorial em hectares.

- **DATA_CARGA**, **VERSAO**  
  Tipo: data/texto  
  Descrição: metadados de carga.

### Como consultar via API

- Endpoint: `/municipios`
- Filtros:
  - `q`: busca parcial no nome do município (`MUNICIPIO`).
  - `codigo_ibge`.
- Paginação: `limit`, `offset`.
- Ordenação: `sort_by`, `order` (ex.: `MUNICIPIO`, `POPULACAO`).
- Exportação: `format=json|csv|parquet`, `fields=...`.

Exemplos:
- Autocomplete de municípios: `/municipios?q=bel&sort_by=municipio&order=asc&limit=20`
- Exportar apenas colunas de identificação: `/municipios?format=csv&fields=codigo_ibge,municipio,URS`

---

## 5. Tabelas GIS (PostgreSQL/PostGIS)

Estas tabelas são acessadas diretamente no banco GIS via repositório (`src/repository.py`) e expostas via endpoints:
- `/gis/banco` → tabela `banco_techdengue`
- `/gis/pois` → tabela `planilha_campo`

### 5.1 banco_techdengue

**Tabela**: `banco_techdengue`

**Endpoint**: `/gis/banco`

**Colunas principais** (conforme `TechDengueRepository.get_banco_techdengue_all`):

- **id** (inteiro): identificador único do registro GIS.
- **nome** (texto): nome do objeto ou registro.
- **lat** (float): latitude.
- **long** (float): longitude.
- **geom_json** (texto): geometria em formato GeoJSON (convertida de `geom`).
- **data_criacao** (timestamp): data/hora de criação.
- **analista** (texto): responsável técnico/analista.
- **id_sistema** (texto): identificador no sistema de origem.

Uso típico: visualização de pontos georreferenciados e análises espaciais básicas.

### 5.2 planilha_campo (POIs)

**Tabela**: `planilha_campo`

**Endpoint**: `/gis/pois`

**Colunas principais** (somadas das consultas `get_planilha_campo_all` e `get_planilha_campo_by_atividade`):

- **id** (inteiro): identificador do POI.
- **id_atividade** (texto): ID da atividade associada (chave para relacionamento com outras tabelas).
- **id_sub_atividade**, **nome_sub_atividade** (texto): detalhamento da subatividade.
- **quadra**, **bairro**, **logradouro** (texto): localização textual.
- **poi** (texto): código do ponto (ex.: `PT_123`).
- **descricao** (texto): descrição do foco/local.
- **categoria** (texto): categoria de POI (ex.: tipo de criadouro ou classificação interna).
- **vol_estimado**, **pastilhas**, **granulado** (numérico): quantidades usadas no tratamento.
- **data_visita**, **data_upload** (datas): datas importantes de visita e carga.
- **removido_solucionado**, **descaracterizado**, **tratado**, **morador_ausente**, **nao_autorizado**, **monitorado**, **tratamento_via_drone** (flags/campos de status): resultado da intervenção.
- **lat**, **longi** (float): coordenadas geográficas (longi = longitude).
- **foto** (texto): referência a imagens, se houver.
- **observacao/observacoes** (texto): comentários adicionais.

Uso típico: análise de focos, tipos de criadouros, status de tratamento e geração de camadas de mapa.

---

## 6. Guia rápido de uso da API

### Endpoints principais

- `/health`  
  Verifica disponibilidade dos Parquet e do banco GIS.

- `/datasets`  
  Lista datasets Parquet e seus tamanhos.

- `/facts`  
  Consulta atividades TechDengue agregadas.

- `/facts/summary`  
  Sumários por município, código IBGE ou atividade.

- `/gold/analise`  
  Análise integrada (gold) por município/competência.

- `/dengue`  
  Série histórica de casos de dengue.

- `/municipios`  
  Dimensão de municípios (para joins, filtros e autocomplete).

- `/gis/banco`, `/gis/pois`  
  Acesso direto ao banco GIS.

### Parâmetros comuns

- Paginação: `limit`, `offset`.
- Ordenação: `sort_by`, `order` (`asc|desc`).
- Exportação: `format=json|csv|parquet`.
- Seleção de colunas: `fields=col1,col2,...` (quando aplicável).

---

Este dicionário de dados deve ser usado como referência rápida para desenvolvimento de análises, dashboards e integrações que consumam a API TechDengue.
