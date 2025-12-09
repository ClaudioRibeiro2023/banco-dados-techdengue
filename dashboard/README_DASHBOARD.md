# 📊 Painel de Gestão de Base de Dados TechDengue

## 🎯 Visão Geral

Dashboard profissional para gestão completa da base de dados TechDengue, incluindo monitoramento de qualidade, inventário de dados, rastreabilidade e controles de sincronização.

---

## 🏗️ Arquitetura do Dashboard

### Stack Tecnológica

```
Frontend: Streamlit (Python Web Framework)
Visualização: Plotly, Altair, Matplotlib
Dados: Pandas, Parquet
Estilo: CSS Customizado (Tema Profissional)
Atualização: Tempo Real
```

### Estrutura de Diretórios

```
dashboard/
├── app.py                          # Aplicação principal (Home)
├── config.py                       # Configurações do dashboard
├── requirements.txt                # Dependências
├── README_DASHBOARD.md             # Esta documentação
│
├── pages/                          # Páginas do dashboard (Streamlit)
│   ├── 1_📊_Qualidade_Dados.py    # Módulo de qualidade
│   ├── 2_🗄️_Dados_Disponíveis.py  # Inventário de dados
│   ├── 3_🔍_Confiabilidade.py     # Rastreabilidade
│   ├── 4_🔄_Sincronização.py      # Controles de sync
│   └── 5_📈_Análises.py           # Análises rápidas
│
├── components/                     # Componentes reutilizáveis
│   ├── __init__.py
│   ├── metrics.py                 # Cards de métricas
│   ├── charts.py                  # Gráficos
│   ├── tables.py                  # Tabelas
│   └── alerts.py                  # Alertas e notificações
│
├── utils/                          # Utilitários
│   ├── __init__.py
│   ├── data_loader.py             # Carregamento de dados
│   ├── quality_checker.py         # Verificações de qualidade
│   └── formatters.py              # Formatadores
│
└── assets/                         # Assets estáticos
    ├── style.css                  # Estilos customizados
    └── logo.png                   # Logo (se houver)
```

---

## 📋 Módulos do Dashboard

### 🏠 Home / Overview

**Funcionalidades:**
- Status geral do sistema (semáforo)
- Última atualização
- Métricas principais (KPIs)
- Alertas e notificações
- Ações rápidas

**Métricas Exibidas:**
- Score de qualidade geral
- Total de registros
- Tamanho da base
- Status da sincronização
- Tempo desde última atualização

---

### 📊 Qualidade de Dados

**Funcionalidades:**
- Score geral de qualidade (0-100%)
- Validações por camada (Bronze/Silver/Gold)
- Histórico de qualidade (gráfico temporal)
- Detalhamento de checks
- Alertas de anomalias

**Visualizações:**
- Gauge chart (score geral)
- Tabela de validações
- Gráfico de evolução temporal
- Heatmap de completude
- Lista de alertas

**Dados Fonte:**
- `metadata/relatorio_qualidade_completo.json`
- `metadata/quality_report.csv`

---

### 🗄️ Dados Disponíveis

**Funcionalidades:**
- Inventário completo de tabelas
- Estatísticas por camada
- Tamanhos e volumes
- Explorador de dados (preview)
- Exportações

**Visualizações:**
- Cards por camada (Bronze/Silver/Gold)
- Tabela de inventário
- Gráficos de volume
- Preview de dados
- Botões de download

**Dados Fonte:**
- `metadata/validacao_estrutura.json`
- Arquivos Parquet das 3 camadas

---

### 🔍 Confiabilidade

**Funcionalidades:**
- Data Lineage (rastreabilidade)
- Validações cruzadas
- Comparação com métricas oficiais
- Certificações de qualidade
- Histórico de transformações

**Visualizações:**
- Diagrama de lineage
- Tabela de validações cruzadas
- Gráfico de comparação
- Badges de certificação
- Timeline de transformações

**Dados Fonte:**
- `metadata/data_lineage.json`
- `metadata/relatorio_qualidade_completo.json`

---

### 🔄 Sincronização

**Funcionalidades:**
- Status da conexão com servidor
- Última sincronização
- Histórico de atualizações
- Controles manuais (sync, force)
- Logs em tempo real

**Visualizações:**
- Indicador de status (online/offline)
- Timeline de sincronizações
- Tabela de histórico
- Botões de ação
- Console de logs

**Dados Fonte:**
- `metadata/historico_atualizacoes.json`
- Conexão ao vivo com PostgreSQL

---

### 📈 Análises

**Funcionalidades:**
- Preview da MEGA TABELA
- Estatísticas descritivas
- Visualizações rápidas
- Filtros interativos
- Exportações

**Visualizações:**
- Dataframe interativo
- Gráficos de distribuição
- Mapas (se geoespacial)
- Correlações
- Botões de export

**Dados Fonte:**
- `data_lake/gold/mega_tabela_analitica.parquet`

---

## 🎨 Design e UX

### Paleta de Cores

```css
Primária:    #1f77b4 (Azul profissional)
Secundária:  #2ca02c (Verde sucesso)
Alerta:      #ff7f0e (Laranja aviso)
Erro:        #d62728 (Vermelho erro)
Neutro:      #7f7f7f (Cinza)
Fundo:       #f8f9fa (Cinza claro)
```

### Componentes Visuais

- **Cards:** Métricas principais com ícones
- **Gauges:** Scores de qualidade
- **Tabelas:** Dados tabulares com paginação
- **Gráficos:** Interativos (Plotly)
- **Alertas:** Notificações contextuais
- **Badges:** Status e certificações

---

## 🚀 Como Executar

### Instalação

```bash
# Instalar dependências
pip install -r dashboard/requirements.txt
```

### Execução

```bash
# Executar dashboard
streamlit run dashboard/app.py

# Ou com porta específica
streamlit run dashboard/app.py --server.port 8501
```

### Acesso

```
URL: http://localhost:8501
```

---

## 📊 Indicadores de Qualidade Monitorados

### Nível 1: Estrutura
- ✅ Diretórios criados
- ✅ Tabelas presentes
- ✅ Tamanhos adequados

### Nível 2: Integridade
- ✅ Integridade referencial
- ✅ Sem duplicatas
- ✅ Sem valores nulos críticos

### Nível 3: Transformação
- ✅ POIs preservados
- ✅ Hectares corrigidos
- ✅ Agregações corretas

### Nível 4: Validação
- ✅ Completude de dados
- ✅ Consistência de valores
- ✅ Métricas oficiais

### Nível 5: Confiabilidade
- ✅ Data lineage completo
- ✅ Rastreabilidade total
- ✅ Certificação 100%

---

## 🔐 Segurança

- ✅ Acesso local (localhost)
- ✅ Sem exposição de credenciais
- ✅ Read-only para dados
- ✅ Logs de auditoria

---

## 📝 Changelog

### Versão 1.0.0 - 30/10/2025
- ✅ Estrutura inicial criada
- ✅ Metodologia definida
- ✅ Módulos planejados
- ⏳ Implementação em andamento

---

**Desenvolvido por:** Cascade AI  
**Data:** 30 de Outubro de 2025  
**Versão:** 1.0.0
