# 🚀 Início Rápido - Projeto TechDengue

## ⚡ Começando em 5 Minutos

### 1️⃣ Instalar Dependências

```bash
# Instale as dependências Python
pip install -r requirements.txt
```

### 2️⃣ Executar Primeira Análise

```bash
# Execute a análise exploratória completa
python scripts/exemplo_analise_exploratoria.py
```

**Resultado:** Relatório executivo + 3 gráficos salvos em `visualizacoes/`

### 3️⃣ Testar Conexão com Banco GIS

```bash
# Conecte ao banco PostgreSQL
python scripts/db/conectar_banco_gis.py
```

**Resultado:** Exploração interativa do banco de dados GIS

---

## 📁 Arquivos Criados

### 📚 Documentação (Leia Nesta Ordem)

1. **README.md** ← Comece aqui
2. **GUIA_NAVEGACAO.md** ← Checklist e próximos passos
3. **RESUMO_ANALISE_DADOS.md** ← Análise técnica completa
4. **INICIO_RAPIDO.md** ← Este arquivo

### 🐍 Scripts Python

|Arquivo|O Que Faz|
|---|---|
|`scripts/analise_estrutura_dados.py`|Analisa estrutura dos arquivos Excel|
|`scripts/db/conectar_banco_gis.py`|Conecta ao PostgreSQL e explora dados|
|`scripts/exemplo_analise_exploratoria.py`|**PRINCIPAL** - Análise completa com visualizações|

### ⚙️ Configuração

- `requirements.txt` - Dependências Python
- `.gitignore` - Proteção de dados sensíveis

---

## 🎯 O Que Você Tem Agora

### ✅ Dados Catalogados

- ✅ **3 anos de dados de dengue** (2023-2025)
  - 853 municípios de Minas Gerais
  - Dados por semana epidemiológica
  
- ✅ **1.278 atividades do TechDengue**
  - 624 municípios mapeados
  - Dezenas de milhares de POIs identificados
  - Links para visualização GIS
  
- ✅ **Banco GIS PostgreSQL ativo**
  - Tabela `banco_techdengue` (dados operacionais)
  - Tabela `planilha_campo` (registros de campo)
  - Recursos PostGIS (consultas espaciais)

### ✅ Ferramentas Prontas

- ✅ Scripts de análise automatizados
- ✅ Conexão configurada com banco GIS
- ✅ Estrutura de dados completamente documentada
- ✅ Exemplos de código funcionais

---

## 📊 Principais Insights (Baseado em Análise Inicial)

### Dados Epidemiológicos

- **853 municípios** monitorados em Minas Gerais
- Dados organizados por **semanas epidemiológicas**
- Histórico completo de **2023 a 2025**

### Operações TechDengue

- **1.278 atividades** registradas
- Média de **244 POIs** por atividade
- Taxa de conversão **POIs → Devolutivas**: ~21%
- **97,5%** das atividades com link GIS disponível

### Cobertura

- **624 municípios** com contratos ativos
- Distribuição por **macrorregiões de saúde**
- Dados integrados com **população IBGE 2022**

---

## 🔥 Análises Prontas para Executar

### Análise 1: Panorama Geral

```bash
python scripts/exemplo_analise_exploratoria.py
```

**Gera:**
- Estatísticas gerais
- Top 10 municípios (dengue)
- Análise por região
- Análise temporal
- Produtividade (POIs/hectare)
- 3 gráficos (PNG)
- Relatório executivo (TXT)

### Análise 2: Estrutura Detalhada

```bash
python scripts/analise_estrutura_dados.py
```

**Gera:**
- Dimensões de todas as tabelas
- Tipos de dados
- Estatísticas descritivas
- Amostras de dados
- Identificação de campos-chave

### Análise 3: Exploração Banco GIS

```bash
python scripts/db/conectar_banco_gis.py
```

**Modo Interativo:**
- Lista tabelas disponíveis
- Descreve estrutura
- Mostra estatísticas
- Exibe amostras

---

## 🎨 Exemplos de Código Rápido

### Carregar Dados de Dengue
```python
import pandas as pd

df = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')
print(f"Total de municípios: {len(df)}")
print(f"Colunas: {df.columns.tolist()}")
```

### Ver Atividades TechDengue
```python
import pandas as pd

df = pd.read_excel(
    'base_dados/dados_techdengue/Atividades Techdengue.xlsx',
    sheet_name='Atividades Techdengue'
)
print(f"Total de atividades: {len(df)}")
print(f"Total de POIs: {df['POIS'].sum():,}")
```

### Consultar Banco GIS
```python
import psycopg2
import pandas as pd
import os

conn = psycopg2.connect(
    host=os.getenv('GIS_DB_HOST', 'localhost'),
    port=int(os.getenv('GIS_DB_PORT', '5432')),
    database=os.getenv('GIS_DB_NAME', 'postgres'),
    user=os.getenv('GIS_DB_USERNAME', 'postgres'),
    password=os.getenv('GIS_DB_PASSWORD', ''),
    sslmode=os.getenv('GIS_DB_SSL_MODE', 'require')
)

df = pd.read_sql("SELECT * FROM banco_techdengue LIMIT 5", conn)
print(df)
conn.close()
```

---

## 🗺️ Roadmap Sugerido

### Semana 1: Exploração
- [x] Estruturar dados ✅
- [ ] Executar análises exploratórias
- [ ] Identificar insights principais
- [ ] Documentar problemas de qualidade

### Semana 2: Análises Específicas
- [ ] Análise temporal (evolução de casos)
- [ ] Análise por região
- [ ] Correlação casos vs. atividades
- [ ] Identificar municípios prioritários

### Semana 3: Visualizações
- [ ] Criar dashboards interativos
- [ ] Mapas de calor
- [ ] Gráficos de tendência
- [ ] Relatórios automatizados

### Semana 4: Modelos Preditivos
- [ ] Feature engineering
- [ ] Modelo de previsão de surtos
- [ ] Classificação de áreas de risco
- [ ] Validação e documentação

---

## 💡 Dicas Importantes

### ⚠️ Antes de Começar
1. **Backup dos dados originais** - Nunca modifique os arquivos Excel originais
2. **Ambiente virtual Python** - Recomendado para isolar dependências
3. **Credenciais seguras** - Não compartilhe senhas do banco GIS

### 🔧 Troubleshooting

**Erro ao instalar pandas:**
```bash
pip install --upgrade pip
pip install pandas openpyxl
```

**Erro de conexão ao banco GIS:**
- Verifique conexão com internet
- Teste credenciais no script `conectar_banco_gis.py`
- Confirme que SSL está habilitado

**Arquivos Excel não encontrados:**
- Verifique caminhos no código
- Use caminhos absolutos se necessário

---

## 📞 Próximas Ações Recomendadas

### 🎯 Ação Imediata (Hoje)
```bash
python exemplo_analise_exploratoria.py
```
Revise os resultados em:
- `relatorio_executivo.txt`
- `visualizacoes/`

### 📅 Esta Semana
1. Explorar todos os scripts criados
2. Ler documentação completa
3. Testar conexão com banco GIS
4. Identificar 3-5 análises prioritárias

### 🚀 Próximas 2 Semanas
1. Desenvolver análises customizadas
2. Criar visualizações interativas
3. Estabelecer pipeline de atualização
4. Preparar apresentação de resultados

---

## 📚 Recursos de Suporte

|Precisa de...|Consulte...|
|---|---|
|Visão geral|`README.md`|
|Estrutura técnica|`RESUMO_ANALISE_DADOS.md`|
|Próximos passos|`GUIA_NAVEGACAO.md`|
|Início rápido|Este arquivo|
|Conexão GIS|`base_dados/dados_techdengue/guia-banco-gis.md`|

---

## ✅ Checklist de Verificação

Antes de prosseguir, confirme:

- [ ] Python instalado (versão 3.8+)
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivos Excel acessíveis
- [ ] Conexão com internet (para banco GIS)
- [ ] Documentação lida
- [ ] Análise exploratória executada

---

**🎉 Você está pronto para começar!**

Execute agora:
```bash
python exemplo_analise_exploratoria.py
```

---

*Guia de início rápido - Projeto TechDengue*  
*Atualizado em: 30/10/2025*
