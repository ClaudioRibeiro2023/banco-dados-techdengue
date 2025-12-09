# 🔬 ANÁLISE PROFUNDA DE DADOS - TECHDENGUE
## PARTE 1: CONTEXTO E ESTRUTURA DE DADOS

**Versão:** 1.0 | **Data:** 31/10/2025

---

## 🦟 CONTEXTO EPIDEMIOLÓGICO

### O Problema da Dengue no Brasil

#### Magnitude
- **Doença tropical negligenciada** com impacto crescente
- **Transmissão vetorial** pelo mosquito *Aedes aegypti*
- **Sazonalidade** relacionada a temperatura e chuvas (verão/outono)
- **Ciclicidade** de surtos a cada 3-4 anos
- **4 sorotipos** circulantes: DENV-1, DENV-2, DENV-3, DENV-4
- **Formas clínicas:** Dengue clássica, Dengue com sinais de alarme, Dengue grave

#### Fatores de Risco

**Climáticos:**
- Temperatura ideal: 25-30°C
- Umidade relativa > 60%
- Precipitação acumulada
- Altitude < 1000m

**Ambientais:**
- Acúmulo de água parada (criadouros)
- Lixo e entulho
- Áreas degradadas
- Falta de saneamento

**Sociais:**
- Densidade populacional alta
- Moradia inadequada
- Baixa renda
- Nível educacional

**Urbanização:**
- Crescimento desordenado
- Infraestrutura precária
- Ocupação irregular

### Estratégias de Controle (OMS)

#### 1. Controle Vetorial
- **Eliminação de criadouros** ⭐ (FOCO DO TECHDENGUE)
- Tratamento larvicida
- Controle químico adulticida (UBV/fumacê)
- Controle biológico (*Wolbachia*, peixe larvófago)

#### 2. Vigilância Epidemiológica
- Notificação compulsória
- Investigação de casos graves
- Monitoramento de índices entomológicos (LIRAa/LIA)

#### 3. Assistência ao Paciente
- Protocolo de manejo clínico
- Classificação de risco
- Hidratação adequada

#### 4. Mobilização Social
- Educação em saúde
- Agentes comunitários
- Comunicação de risco

### Papel do TechDengue

**Objetivo Principal:**  
Identificação massiva, geolocalizada e categorizada de criadouros potenciais do *Aedes aegypti*

**Diferenciais:**
- ✅ **Escala:** 624 municípios mapeados
- ✅ **Precisão:** Geolocalização de cada POI
- ✅ **Categorização:** 34 tipos de criadouros
- ✅ **Estruturação:** Dados analíticos robustos
- ✅ **Integração:** Epidemiologia + Operação

---

## 📊 ESTRUTURA DE DADOS DISPONÍVEL

### 1. Dados Epidemiológicos (Dengue)

**Bases:** `base.dengue.2024.xlsx`, `base.dengue.2025.xlsx`

**Granularidade:** Municipal  
**Cobertura:** 853 municípios de Minas Gerais  
**Periodicidade:** Semanas Epidemiológicas (SE 1-52)  
**Fonte:** SINAN/SES-MG

**Estrutura:**
```
Colunas:
- codmun: Código IBGE (7 dígitos, 31XXXXX)
- Municipio: Nome do município
- Semana 1 a Semana 52: Casos notificados por SE
- Total: Soma anual de casos
```

**Características:**
- ✅ Dados oficiais, alta confiabilidade
- ✅ Atualização semanal
- ⚠️ Subnotificação inerente (20-50%)
- ⚠️ Lag de notificação (7-14 dias)

**Métricas Deriváveis:**
- Incidência (casos/100mil habitantes)
- Taxa de crescimento semanal/mensal
- Curva epidêmica
- Período epidêmico
- Comparação interanual

### 2. Dados Operacionais (TechDengue)

**Base:** `Atividades Techdengue.xlsx` (3 abas)

#### Aba 1: Atividades Techdengue

**Registros:** 1.278 atividades  
**Municípios:** 624 únicos

**Colunas-Chave:**
```python
{
    'MUNICIPIO': str,         # Nome do município
    'CODIGO IBGE': str,       # Código IBGE (7 dígitos)
    'CONTRATANTE': str,       # Organização contratante
    'DATA_MAP': datetime,     # Data do mapeamento
    'POIS': int,              # Quantidade de POIs identificados
    'DEVOLUTIVAS': int,       # Devolutivas realizadas
    'HECTARES': float,        # Área mapeada (ha)
    'LINK': str,              # URL GIS Cloud
    'ANALISTA': str,          # Responsável
    'STATUS': str             # Situação da atividade
}
```

**Categorias de POIs (34 tipos):**
```
Categorias Críticas (alta densidade larvária):
- TERRENO_BALDIO: Lotes sem manutenção
- CAIXA_DAGUA: Reservatórios descobertos
- EDIFICACAO_ABANDONADA: Imóveis vazios
- PISCINA: Piscinas sem tratamento
- ENTULHO: Acúmulo de materiais

Categorias Comerciais:
- BORRACHARIA, AUTO, FERRO_VELHO, SUCATA
- LAVA_JATO, OFICINA, MARMORARIA

Infraestrutura:
- BUEIRO, SANEAMENTO, ESTACAO_TRATAMENTO
- POCO, AGUA_QUENTE

Gestão de Resíduos:
- LIXAO, DESCARTE, RECICLAGEM, TRANSBORDO
- PEV_COLETA, COMPOSTAGEM

Outros:
- RESIDENCIA, CEMITERIO, ACADEMIA
- PARQUE_INDUSTRIAL, LOJA_CONSTRUCAO
```

#### Aba 2: IBGE

**Dados municipais:**
```python
{
    'CODIGO IBGE': str,
    'MUNICIPIO': str,
    'POPULACAO': int,         # Estimativa IBGE
    'AREA_KM2': float,        # Área territorial
    'DENSIDADE': float,        # hab/km²
    'PIB_PER_CAPITA': float,   # R$ (quando disponível)
    'IDH': float               # Índice Desenvolvimento Humano
}
```

#### Aba 3: IBGE_MAPA_CONSÓRCIO_MACRO_CONTRATANTE

**Hierarquia administrativa:**
```python
{
    'MACRORREGIAO': str,       # Macrorregião de Saúde (14 em MG)
    'CONSORCIO': str,          # Consórcio Intermunicipal
    'CONTRATANTE': str,        # Organização contratante
    'STATUS_MAPEAMENTO': str,  # Concluído/Em andamento/Planejado
    'N_MUNICIPIOS': int,       # Quantidade de municípios
    'POPULACAO_TOTAL': int,    # População agregada
    'POIS_TOTAL': int,         # POIs identificados
    'HECTARES_TOTAL': float    # Área mapeada agregada
}
```

### 3. Dados Geoespaciais (PostgreSQL + PostGIS)

**Host:** AWS RDS (us-east-1)  
**Usuário read-only:** claudio_aero  
**Tabelas:** banco_techdengue, planilha_campo

#### Tabela: banco_techdengue

```sql
Colunas:
- id (SERIAL PRIMARY KEY)
- nome (VARCHAR)
- lat (DECIMAL): Latitude
- long (DECIMAL): Longitude
- geom (GEOMETRY): PostGIS geometry point
- data_criacao (TIMESTAMP)
- analista (VARCHAR)
- id_sistema (INTEGER)
- [metadados adicionais]
```

**Funcionalidades PostGIS:**
- `ST_AsGeoJSON(geom)`: Export para GeoJSON
- `ST_Distance(geom1, geom2)`: Distância em metros
- `ST_Within(geom, polygon)`: Ponto dentro de polígono
- `ST_Buffer(geom, radius)`: Área de influência
- `ST_ClusterDBSCAN()`: Clustering espacial

#### Tabela: planilha_campo

```sql
Colunas:
- id (SERIAL PRIMARY KEY)
- id_atividade (INTEGER FK)
- poi (VARCHAR): Tipo de POI
- descricao (TEXT): Descrição detalhada
- bairro (VARCHAR): Localização
- lat, longi (DECIMAL): Coordenadas
- data_upload (TIMESTAMP)
- observacoes (TEXT)
```

---

## 🔑 DICIONÁRIO DE DADOS COMPLETO

### Dengue - Campos Calculados

| Campo | Fórmula | Interpretação |
|-------|---------|---------------|
| `incidencia` | `(Total / População) × 100.000` | Casos por 100mil habitantes |
| `taxa_crescimento` | `((SE_atual - SE_anterior) / SE_anterior) × 100` | % de variação semanal |
| `media_movel_4` | `mean(SE_n, SE_n-1, SE_n-2, SE_n-3)` | Suavização da curva |
| `risco_relativo` | `(Incidência_mun / Incidência_estado)` | Risco comparado ao estado |
| `casos_acumulados` | `cumsum(Semana 1:Semana N)` | Acumulado até semana N |

### TechDengue - Indicadores

| Indicador | Fórmula | Benchmark |
|-----------|---------|-----------|
| **Produtividade** | `POIs / Hectares` | 20-50 POIs/ha |
| **Taxa Conversão** | `(Devolutivas / POIs) × 100` | 60-80% |
| **Cobertura Territorial** | `(Municípios mapeados / Total) × 100` | > 70% |
| **Densidade Criadouros** | `POIs / Área_km²` | Varia por região |
| **Eficiência** | `POIs / Dias_trabalho` | 50-100 POIs/dia |

### Classificações

**Incidência de Dengue (casos/100mil):**
- Baixa: < 100
- Moderada: 100-300
- Alta: 300-1000
- Muito Alta: > 1000

**Status de Atividade:**
- Planejado: Não iniciado
- Em andamento: Em execução
- Concluído: Finalizado e validado
- Devolutiva realizada: Com retorno à gestão local

**Macror

regiões de Saúde (MG):**
1. Centro
2. Centro-Sul
3. Jequitinhonha
4. Leste
5. Leste do Sul
6. Nordeste
7. Noroeste
8. Norte
9. Oeste
10. Sudeste
11. Sul
12. Triângulo do Norte
13. Triângulo do Sul
14. Vale do Aço

---

**Próximas Partes:**
- PARTE 2: Métricas e Indicadores
- PARTE 3: Análises Possíveis
- PARTE 4: Metodologias
- PARTE 5: Implementação

**Criado em:** 31/10/2025  
**Próxima revisão:** Trimestral
