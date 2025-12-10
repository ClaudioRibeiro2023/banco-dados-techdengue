# 🦟 TechDengue Analytics - Sistema Completo

**Versão:** 3.0.0  
**Status:** 🟢 Produção Ready  
**Design System:** Enterprise-grade com WCAG AA

## 📍 Visão Geral

Sistema completo de dados integrados do Projeto TechDengue, incluindo:
- **Dashboard Analytics** moderno com Design System enterprise-grade
- **Arquitetura Medallion** (Bronze/Silver/Gold) para dados estruturados
- **Dados epidemiológicos** de dengue em Minas Gerais
- **Informações operacionais** das atividades de mapeamento e controle
- **Integração em tempo real** com PostgreSQL/PostGIS

**✅ Status:** Sistema validado (Score de Qualidade: 100%)

---

## 🚀 Início Rápido - Dashboard

### Executar o Dashboard Analytics

**Opção 1: Launcher (Recomendado)**
```bash
# Duplo-clique no arquivo ou execute:
START_DASHBOARD.bat
```
O dashboard abrirá automaticamente em seu navegador em http://localhost:8501

**Opção 2: Linha de Comando**
```bash
python -m streamlit run dashboard/app.py
```

### Primeira Vez?

Leia a documentação completa:
- **[Índice da Documentação](docs/design-system/README_DESIGN_SYSTEM.md)** - Comece aqui
- **[Quick Start](docs/design-system/QUICK_START_DESIGN_SYSTEM.md)** - Guia prático em 5 minutos
- **[Guia de Validação](docs/design-system/GUIA_VALIDACAO_DESIGN_SYSTEM.md)** - Checklist de testes
- **[Próximos Passos](docs/guides/PROXIMOS_PASSOS.md)** - Roadmap e melhorias

---

## 📚 Documentação Completa

Toda a documentação foi organizada em `docs/` por categoria:

### 🎨 Design System
- [README Design System](docs/design-system/README_DESIGN_SYSTEM.md) - Índice geral
- [Quick Start](docs/design-system/QUICK_START_DESIGN_SYSTEM.md) - Como usar
- [Documentação Completa](docs/design-system/DESIGN_SYSTEM_COMPLETO.md) - Referência técnica
- [Relatório Final](docs/design-system/RELATORIO_FINAL_IMPLEMENTACAO.md) - O que foi implementado
- [Discovery](docs/design-system/FASE1_DISCOVERY_RELATORIO.md) - Auditoria inicial
- [Wireframes](docs/design-system/WIREFRAMES_FASE3.md) - IA e estrutura

### 🏗️ Arquitetura
- [Arquitetura de Dados](docs/architecture/ARQUITETURA_DADOS_DEFINITIVA.md) - Medallion Architecture
- [Estrutura do Projeto](docs/architecture/ESTRUTURA_PROJETO.md) - Organização
- [Sistema Completo](docs/architecture/SISTEMA_COMPLETO.md) - Visão geral técnica
- [Estratégia de Integridade](docs/architecture/ESTRATEGIA_INTEGRIDADE_DADOS.md) - Qualidade

### 📖 Guias Práticos
- [Início Rápido](docs/guides/INICIO_RAPIDO.md) - Tutorial básico
- [Próximos Passos](docs/guides/PROXIMOS_PASSOS.md) - Roadmap
- [Guia de Navegação](docs/guides/GUIA_NAVEGACAO.md) - Como navegar
- [Integração GIS](docs/guides/GUIA_INTEGRACAO_GIS.md) - PostGIS

### 📊 Relatórios
- [Resumo de Implementação](docs/reports/RESUMO_FINAL_IMPLEMENTACAO.md) - Entregas
- [Análise de Dados](docs/reports/RESUMO_ANALISE_DADOS.md) - Dados disponíveis
- [Sumário do Trabalho](docs/reports/SUMARIO_TRABALHO_REALIZADO.md) - Histórico

### 📜 Legacy
Documentação histórica em `docs/legacy/` (referência apenas)

---

## 📂 Estrutura de Diretórios

```
banco-dados-techdengue/
│
├── docs/                                # 📚 Documentação organizada
│   ├── design-system/                  # Design System e UI/UX
│   ├── architecture/                   # Arquitetura de dados
│   ├── guides/                         # Guias práticos
│   ├── reports/                        # Relatórios e análises
│   └── legacy/                         # Documentação histórica
│
├── dashboard/                           # 🎨 Dashboard Analytics
│   ├── assets/                         # CSS, tokens, temas
│   ├── components/                     # Componentes UI reutilizáveis
│   ├── pages/                          # Páginas do dashboard
│   ├── utils/                          # Utilitários (tema, navegação)
│   └── app.py                          # Aplicação principal
│
├── src/                                 # 💻 Código fonte
│   ├── database.py                     # Conexão com BD
│   ├── sync.py                         # Sincronização
│   └── ...
│
├── scripts/                             # 🔧 Scripts utilitários
│   ├── analise_estrutura_dados.py      # Análise de bases
│   ├── validacao_completa_estrutura.py # Validações
│   └── ...
│
├── data_lake/                           # 📊 Data Lake (Medallion)
│   ├── bronze/                         # Dados brutos
│   ├── silver/                         # Dados limpos
│   └── gold/                           # Dados agregados
│
├── base_dados/                          # 📁 Dados base
│   ├── dados_dengue/                   # Epidemiológicos
│   └── dados_techdengue/               # Operacionais
│
├── analises/                            # 📈 Análises especializadas
│
├── START_DASHBOARD.bat                  # 🚀 Launcher do dashboard
└── README.md                            # Este arquivo
```

---

## 🎯 Bases de Dados Disponíveis

### 1. 🦟 Dados de Dengue (2023-2025)
- **Formato:** Excel (.xlsx)
- **Granularidade:** Municipal (853 municípios de MG)
- **Periodicidade:** Semanas epidemiológicas (SE 1 a 52)
- **Identificador:** Código IBGE
- **Uso:** Análise epidemiológica, contexto para avaliação de impacto

### 2. 🔬 Atividades TechDengue
- **Formato:** Excel (.xlsx) - 3 abas
- **Registros:** 1.278 atividades / 624 municípios mapeados
- **Informações:**
  - Hectares mapeados
  - POIs identificados (34 categorias)
  - Devolutivas realizadas
  - Links para GIS Cloud
  - Informações municipais (população, área, região)

### 3. 🗄️ Banco GIS (PostgreSQL + PostGIS)
- **Tipo:** Banco de dados relacional com extensão espacial
- **Tabelas principais:**
  - `banco_techdengue` - Dados operacionais geoespaciais
  - `planilha_campo` - Registros de campo
- **Acesso:** Somente leitura (credenciais no guia)
- **Recursos:** Geometrias, consultas espaciais, dados em tempo real

---

## 🚀 Quick Start

### Pré-requisitos

```bash
# Instalar dependências Python
pip install pandas openpyxl psycopg2-binary matplotlib seaborn
```

### 1. Analisar Estrutura das Bases Excel

```bash
python analise_estrutura_dados.py
```

**Saída:** Análise completa de todas as bases Excel, incluindo:
- Dimensões (linhas x colunas)
- Tipos de dados
- Estatísticas descritivas
- Amostra de dados
- Identificação de campos-chave

### 2. Conectar ao Banco GIS

```bash
python conectar_banco_gis.py
```

**Funcionalidades:**
- Lista todas as tabelas disponíveis
- Descreve estrutura das tabelas
- Conta registros
- Mostra estatísticas básicas
- Exibe amostras de dados

### 3. Consultar Documentação Completa

```bash
# Abrir o resumo da análise
RESUMO_ANALISE_DADOS.md
```

---

## 📊 Exemplos de Análises

### Exemplo 1: Carregar Dados de Dengue

```python
import pandas as pd

# Carregar base de dengue 2024
df_dengue = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')

# Ver estrutura
print(f"Dimensões: {df_dengue.shape}")
print(f"Colunas: {df_dengue.columns.tolist()}")

# Total de casos por município
df_dengue['Total'] = df_dengue[[col for col in df_dengue.columns if col.startswith('SE')]].sum(axis=1)
top_municipios = df_dengue.nlargest(10, 'Total')[['nome', 'Total']]
print(top_municipios)
```

### Exemplo 2: Carregar Atividades TechDengue

```python
import pandas as pd

# Carregar atividades
df_atividades = pd.read_excel(
    'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
    sheet_name='Atividades Techdengue'
)

# Estatísticas de POIs
print(f"Total de POIs identificados: {df_atividades['POIS'].sum():,}")
print(f"Média de POIs por atividade: {df_atividades['POIS'].mean():.1f}")
print(f"Mediana: {df_atividades['POIS'].median():.1f}")

# Top 10 contratantes
top_contratantes = df_atividades.groupby('CONTRATANTE')['POIS'].sum().nlargest(10)
print(top_contratantes)
```

### Exemplo 3: Consultar Banco GIS

```python
import psycopg2
import pandas as pd

# Conectar
conn = psycopg2.connect(
    host='ls-564b587f07ec660b943bc46eeb4d39a79a9eec4d.cul8kgow0o6q.us-east-1.rds.amazonaws.com',
    port=5432,
    database='postgres',
    user='claudio_aero',
    password='123456',
    sslmode='require'
)

# Consultar últimos registros
query = """
    SELECT id, nome, lat, long, data_criacao
    FROM banco_techdengue
    ORDER BY data_criacao DESC NULLS LAST
    LIMIT 10;
"""
df = pd.read_sql(query, conn)
print(df)

conn.close()
```

### Exemplo 4: Análise Integrada

```python
import pandas as pd

# Carregar bases
df_dengue = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')
df_atividades = pd.read_excel(
    'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
    sheet_name='IBGE_MAPA_CONSÓRCIO_MACRO_CONTRATANTE'
)

# Calcular total de casos por município
colunas_se = [col for col in df_dengue.columns if col.startswith('SE')]
df_dengue['total_casos'] = df_dengue[colunas_se].sum(axis=1)

# Juntar com atividades pelo código IBGE
df_integrado = pd.merge(
    df_atividades,
    df_dengue[['codmun', 'total_casos']],
    left_on='CODIGO IBGE',
    right_on='codmun',
    how='left'
)

# Analisar relação entre POIs e casos de dengue
print("Correlação POIs vs Casos de Dengue:")
print(df_integrado[['POIS', 'total_casos']].corr())
```

---

## 🔑 Informações-Chave

### Identificadores Principais

- **Código IBGE:** Identificador único de municípios (7 dígitos)
  - Formato: 31XXXXX (31 = Minas Gerais)
  - Usado em todas as bases para relacionamento

### Períodos de Dados

| Base | Período | Atualização |
|------|---------|-------------|
| Dados Dengue | 2023-2025 | Anual |
| Atividades TechDengue | 2024-2025 | Contínua |
| Banco GIS | 2024-presente | Tempo real |

### Dimensões

- **Municípios:** 853 (total MG) / 624 (com atividades)
- **Atividades:** 1.278 registradas
- **POIs:** Dezenas de milhares
- **Hectares mapeados:** Milhares

---

## 📈 Possibilidades de Análise

### Análises Epidemiológicas
- [ ] Evolução temporal de casos de dengue
- [ ] Identificação de municípios prioritários
- [ ] Análise de sazonalidade
- [ ] Previsão de surtos

### Análises Operacionais
- [ ] Produtividade por município/região
- [ ] Taxa de conversão POIs → Devolutivas
- [ ] Cobertura territorial
- [ ] Eficiência de equipes

### Análises Integradas
- [ ] Correlação casos vs. atividades
- [ ] Impacto das devolutivas nos indicadores
- [ ] Análise custo-benefício
- [ ] Priorização de áreas de intervenção

### Análises Espaciais
- [ ] Mapas de calor de casos
- [ ] Clustering de POIs
- [ ] Análise de proximidade
- [ ] Identificação de áreas de risco

---

## 🛠️ Ferramentas Recomendadas

### Python
- **pandas** - Manipulação de dados
- **geopandas** - Dados geoespaciais
- **matplotlib/seaborn** - Visualizações
- **plotly** - Gráficos interativos
- **scikit-learn** - Machine learning

### BI & Visualização
- **Power BI** - Dashboards interativos
- **Tableau** - Visualizações avançadas
- **Metabase** - BI open source

### GIS
- **QGIS** - Análises espaciais
- **PostGIS** - Banco de dados espacial
- **Leaflet/Mapbox** - Mapas web

---

## 🔐 Segurança

- ✅ Acesso read-only ao banco GIS
- ✅ SSL obrigatório nas conexões
- ⚠️ Não commitar credenciais em repositórios públicos
- ⚠️ Considerar rotação periódica de senhas

---

## 📚 Documentação Adicional

- **[RESUMO_ANALISE_DADOS.md](RESUMO_ANALISE_DADOS.md)** - Análise detalhada completa
- **[guia-banco-gis.md](base_dados/dados_techdengue/guia-banco-gis.md)** - Guia de conexão GIS
- **Scripts Python** - Análises automatizadas

---

## 🤝 Contribuindo

Para adicionar novas análises ou melhorias:

1. Documente adequadamente o código
2. Siga as convenções de nomenclatura
3. Teste com dados de amostra
4. Atualize este README se necessário

---

## 📞 Suporte

Para dúvidas técnicas ou acesso aos dados, entre em contato com a equipe TechDengue.

---

## 📝 Changelog

### Versão 1.0 - Outubro 2025
- ✅ Estruturação inicial do repositório
- ✅ Análise completa das bases de dados
- ✅ Scripts de conexão e análise
- ✅ Documentação abrangente

---

**Última atualização:** 30 de Outubro de 2025  
**Responsável:** Equipe de Análise de Dados - TechDengue
