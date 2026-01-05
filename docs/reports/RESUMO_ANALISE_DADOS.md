# Análise Detalhada das Bases de Dados - Projeto TechDengue

**Data da Análise:** 30 de Outubro de 2025  
**Analista:** Sistema de Análise de Dados

---

## 📋 Sumário Executivo

Este documento apresenta uma análise detalhada das bases de dados disponíveis para o projeto TechDengue, incluindo dados históricos de dengue e informações operacionais das atividades do projeto.

### Bases de Dados Identificadas:

1. **Dados de Dengue** (3 arquivos): Histórico 2023-2025
2. **Atividades TechDengue** (1 arquivo): Base mestre de operações
3. **Banco GIS PostgreSQL**: Dados geoespaciais em tempo real

---

## 🦟 1. BASES DE DADOS DE DENGUE

### 1.1 Visão Geral

Três arquivos Excel contendo histórico de casos de dengue por semana epidemiológica:
- `base.dengue.2023.xlsx`
- `base.dengue.2024.xlsx`
- `base.dengue.2025.xlsx`

### 1.2 Estrutura dos Dados

**Exemplo: base.dengue.2024.xlsx**

#### Aba Principal
- **Dimensões:** 853 linhas × 65 colunas
- **Granularidade:** Municipal (Minas Gerais)
- **Período:** Semanas epidemiológicas 1 a 52 de 2024
- **Identificador:** Código IBGE (853 municípios únicos)

#### Principais Colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `codmun` | int64 | Código IBGE do município (7 dígitos) |
| `nome` | object | Nome do município |
| `SE 1` até `SE 52` | int64 | Casos de dengue por semana epidemiológica |
| `Total` | int64 | Total acumulado de casos no ano |

#### Estatísticas (2024):
- **Total de casos registrados:** Variável por município
- **Municípios com dados:** 853
- **Semanas epidemiológicas:** 52 (cobertura completa)

### 1.3 Padrões Identificados

- Dados organizados cronologicamente (semanas epidemiológicas)
- Cobertura completa de todos os municípios de MG
- Valores nulos presentes em algumas semanas (municípios sem registros)
- Campo `codmun` é consistente com padrão IBGE (3100000 + código)

---

## 🔬 2. BASE DE DADOS TECHDENGUE

### 2.1 Arquivo Principal: Atividades Techdengue.xlsx

**Dimensões:** 2 abas principais

#### 2.1.1 Aba: "IBGE_MAPA_CONSÓRCIO_MACRO_CONTRATANTE"

**Propósito:** Base mestre de municípios com informações de contratos e atividades

**Dimensões:** 624 linhas × 55 colunas

**Principais Grupos de Informações:**

##### A. Identificação Municipal
- `CODIGO IBGE` - Código único do município (7 dígitos)
- `MUNICIPIO` - Nome do município
- `HABITANTES (IBGE/2022)` - População oficial
- `Área (Ha Urbano)` - Área urbana em hectares

##### B. Localização Administrativa
- `URS` - Unidade Regional de Saúde
- `MACROREGIAO_SAUDE` - Macrorregião de saúde
- `CONSORCIO` - Consórcio intermunicipal
- `MACRO` - Macro região

##### C. Dados Operacionais do Projeto
- `CONTRATANTE` - Entidade contratante
- `NOMENCLATURA_ATIVIDADE` - Código da atividade (ex: ATV.01, ATV.02)
- `MUNICIPIO_MAPEADO` - Município onde ocorreu o mapeamento
- `ATIVIDADE` - Tipo de atividade realizada
- `ID_MINICRM` - ID no sistema MiniCRM
- `DATA_MAP` - Data do mapeamento
- `LINK_GIS` - Link para visualização no GIS Cloud

##### D. Métricas de Campo
- `HECTARES MAPEADOS` - Área mapeada
- `POIS` - Pontos de Interesse identificados
- `1_LI` até `34_PN` - Diversas categorias de pontos identificados (34 categorias)
- `TOTAL_DEVOLUTIVAS` - Total de devolutivas realizadas

**Estatísticas Principais:**
- **624 atividades registradas** em múltiplos municípios
- **Período:** Dados de 2024 até 2025
- **Hectares mapeados:** Total acumulado significativo
- **POIs identificados:** Média de ~243 pontos por atividade

#### 2.1.2 Aba: "Atividades Techdengue"

**Propósito:** Visão consolidada e simplificada das atividades

**Dimensões:** 1.278 linhas × 8 colunas

**Estrutura:**

| Coluna | Tipo | Não-nulos | Descrição |
|--------|------|-----------|-----------|
| CONTRATANTE | object | 1.278 | Entidade contratante |
| NOMENCLATURA_ATIVIDADE | object | 1.278 | Código da atividade |
| ID_MINICRM | float64 | 1.239 | ID no CRM (39 nulos) |
| HECTARES_MAPEADOS | object | 1.278 | Área mapeada |
| DATA_MAP | datetime64 | 1.276 | Data do mapeamento |
| POIS | int64 | 1.278 | Quantidade de POIs |
| DEVOLUTIVAS | float64 | 1.107 | Devolutivas realizadas |
| LINK_GIS | object | 1.246 | Link GIS Cloud |

**Insights Estatísticos:**
- **POIs por atividade:** Média de 244, variando de 0 a 4.410
- **Devolutivas:** Média de 51, com máximo de 808
- **Links GIS:** 97,5% das atividades possuem link

#### 2.1.3 Aba: "IBGE"

**Propósito:** Tabela de referência com informações geográficas e populacionais

**Dimensões:** 853 linhas × 9 colunas

**Colunas:**

| Coluna | Descrição |
|--------|-----------|
| Código Município Completo | Código IBGE (7 dígitos) |
| Nome_Município | Nome oficial do município |
| POPULAÇÃO CENSO DEMOGRÁFICO (IBGE/2022) | População atualizada |
| Unidade Regional de Saúde | URS responsável |
| Código Micro | Código da microrregião de saúde |
| Microrregião de Saúde | Nome da microrregião |
| Código Macro | Código da macrorregião |
| Macrorregião de Saúde | Nome da macrorregião |
| AREA_ha | Área total em hectares |

**Cobertura:** 853 municípios de Minas Gerais

---

## 🗄️ 3. BANCO DE DADOS GIS (PostgreSQL)

### 3.1 Informações de Conexão

**Servidor:** AWS RDS PostgreSQL + PostGIS  
**Host:** `<GIS_DB_HOST>`  
**Porta:** 5432  
**Database:** postgres  
**SSL:** Obrigatório

### 3.2 Credenciais de Acesso (Somente Leitura)

```
Usuário: <GIS_DB_USERNAME>
Senha: <GIS_DB_PASSWORD>
Permissões: SELECT apenas (read-only)
```

### 3.3 Estrutura de Tabelas

#### Tabela: `banco_techdengue`

**Descrição:** Dados operacionais com informações geoespaciais

**Principais Colunas:**
- `id` - Identificador único
- `nome` - Nome do ponto/local
- `lat` - Latitude
- `long` - Longitude
- `geom` - Geometria PostGIS (pontos, polígonos, etc.)
- `data_criacao` - Data de criação do registro
- `analista` - Analista responsável
- `id_sistema` - ID no sistema

**Índices:** 
- `analista`
- `data_criacao`
- `id_sistema`
- `nome`

#### Tabela: `planilha_campo`

**Descrição:** Registros de campo das atividades

**Principais Colunas:**
- `id` - Identificador único
- `id_atividade` - Referência à atividade
- `poi` - Ponto de interesse
- `descricao` - Descrição do ponto
- `bairro` - Bairro
- `lat` - Latitude
- `longi` - Longitude
- `data_upload` - Data do upload

### 3.4 Recursos Espaciais

**PostGIS Functions Disponíveis:**
- `ST_AsGeoJSON()` - Converter geometrias para GeoJSON
- `ST_Within()` - Verificar contenção espacial
- `ST_Distance()` - Calcular distâncias
- Outras funções espaciais do PostGIS

### 3.5 Exemplos de Consultas

```sql
-- Últimos registros do banco TechDengue
SELECT id, nome, lat, long, data_criacao
FROM banco_techdengue
ORDER BY data_criacao DESC NULLS LAST
LIMIT 50;

-- Dados em formato GeoJSON
SELECT id, nome, ST_AsGeoJSON(geom) AS geometry
FROM banco_techdengue
WHERE geom IS NOT NULL
LIMIT 100;

-- Registros de campo mais recentes
SELECT id, poi, descricao, bairro, data_upload
FROM planilha_campo
ORDER BY data_upload DESC NULLS LAST
LIMIT 50;
```

---

## 🔗 4. RELACIONAMENTO ENTRE AS BASES

### 4.1 Chave Primária: Código IBGE

Todas as bases utilizam o **Código IBGE** como identificador único dos municípios:

```
Dados Dengue (codmun) ←→ Atividades TechDengue (CODIGO IBGE) ←→ Tabela IBGE (Código Município Completo)
```

### 4.2 Fluxo de Dados

```
┌─────────────────────┐
│  Dados Dengue       │ → Histórico epidemiológico (contexto)
│  (2023-2025)        │
└─────────────────────┘
          ↓
┌─────────────────────┐
│  Atividades         │ → Operações do projeto
│  TechDengue         │   (mapeamentos, POIs, devolutivas)
└─────────────────────┘
          ↓
┌─────────────────────┐
│  Banco GIS          │ → Dados geoespaciais em tempo real
│  (PostgreSQL)       │   (pontos, geometrias, campo)
└─────────────────────┘
```

### 4.3 Possibilidades de Integração

1. **Análise Temporal:** Correlacionar casos de dengue com atividades realizadas
2. **Análise Espacial:** Mapear POIs em relação a concentração de casos
3. **Análise de Efetividade:** Avaliar impacto das devolutivas nos indicadores epidemiológicos
4. **Dashboards Integrados:** Combinar dados Excel + GIS em visualizações interativas

---

## 📊 5. PRINCIPAIS CATEGORIAS DE PONTOS DE INTERESSE (POIs)

### 5.1 Categorias Identificadas na Base

A base `Atividades TechDengue` contém **34 categorias diferentes** de POIs:

**Categorias Principais:**
- `1_LI` - Lixo/Entulho
- `2_PN` - Pneus
- `3_VA` - Vasos
- `4_PR` - Piscinas
- `5_CT` - Caixas d'água
- `6_CI` - Cisternas
- `7_RG` - Ralos/Grelhas
- `8_ES` - Esgoto
- (... e mais 26 categorias)

### 5.2 Volume de Dados

- **Total de POIs registrados:** Dezenas de milhares
- **Média por atividade:** 244 POIs
- **Máximo em uma atividade:** 4.410 POIs
- **Distribuição:** Varia significativamente por município e tipo de atividade

---

## 💡 6. RECOMENDAÇÕES PARA ANÁLISES FUTURAS

### 6.1 Análises Prioritárias

1. **Correlação Temporal**
   - Casos de dengue vs. atividades do TechDengue
   - Sazonalidade e padrões epidemiológicos

2. **Análise Espacial**
   - Mapas de calor de casos vs. POIs identificados
   - Clustering de áreas de risco

3. **Efetividade Operacional**
   - Taxa de conversão: POIs → Devolutivas
   - Tempo médio de resposta
   - Cobertura territorial (hectares mapeados vs. área urbana)

4. **Análise de Produtividade**
   - POIs por hectare mapeado
   - Comparação entre municípios e regiões
   - Análise de equipes/analistas

### 6.2 Ferramentas Sugeridas

- **Python:** pandas, geopandas, matplotlib, seaborn, plotly
- **BI:** Power BI ou Tableau para dashboards
- **GIS:** QGIS para análises espaciais avançadas
- **Web:** React + Leaflet/Mapbox para visualizações interativas

### 6.3 Próximos Passos

1. ✅ Estrutura de dados identificada e documentada
2. ⏳ Criar scripts de ETL para integração das bases
3. ⏳ Desenvolver análises exploratórias (EDA)
4. ⏳ Construir dashboard integrado
5. ⏳ Estabelecer conexão com banco GIS
6. ⏳ Desenvolver modelos preditivos

---

## 📝 7. OBSERVAÇÕES IMPORTANTES

### 7.1 Qualidade dos Dados

- **Dados de Dengue:** Completos e consistentes
- **Atividades TechDengue:** Algumas inconsistências (39 IDs MiniCRM faltantes, 171 devolutivas não registradas)
- **Links GIS:** 97,5% de cobertura
- **Datas:** 2 registros sem data de mapeamento

### 7.2 Segurança

- ⚠️ Credenciais do banco GIS expostas no guia (apenas leitura, mas considerar rotação)
- ✅ Acesso read-only ao banco GIS está correto
- ✅ SSL obrigatório nas conexões

### 7.3 Escalabilidade

- Dados atuais são gerenciáveis em Excel/Python
- Para análises em tempo real, migrar para banco de dados relacional
- Considerar data lake para dados históricos extensos

---

## 📞 Informações de Contato e Suporte

Para dúvidas sobre as bases de dados, entre em contato com a equipe técnica do TechDengue.

---

**Documento gerado automaticamente pelo sistema de análise de dados**  
**Versão 1.0 - Outubro 2025**
