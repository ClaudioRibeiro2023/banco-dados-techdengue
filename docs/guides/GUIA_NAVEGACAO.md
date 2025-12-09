# 🧭 Guia de Navegação - Projeto TechDengue

## 📚 Documentação Disponível

### 📄 Documentos Principais

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **README.md** | Visão geral do projeto, quick start e exemplos | Primeira leitura, referência rápida |
| **RESUMO_ANALISE_DADOS.md** | Análise detalhada completa das bases | Entender estrutura e relacionamentos |
| **GUIA_NAVEGACAO.md** | Este arquivo - índice e checklist | Orientação sobre próximos passos |
| **guia-banco-gis.md** | Guia técnico de conexão PostgreSQL/PostGIS | Conectar ao banco GIS |

### 🐍 Scripts Python

| Script | Funcionalidade | Execução |
|--------|----------------|----------|
| **analise_estrutura_dados.py** | Analisa estrutura dos arquivos Excel | `python analise_estrutura_dados.py` |
| **conectar_banco_gis.py** | Conecta e explora banco PostgreSQL | `python conectar_banco_gis.py` |
| **exemplo_analise_exploratoria.py** | Análise exploratória completa com gráficos | `python exemplo_analise_exploratoria.py` |

---

## 🗂️ Estrutura das Bases de Dados

```
📊 Bases Disponíveis
│
├── 🦟 Dados Epidemiológicos (Dengue)
│   ├── base.dengue.2023.xlsx ────► 853 municípios × 52 semanas
│   ├── base.dengue.2024.xlsx ────► 853 municípios × 52 semanas
│   └── base.dengue.2025.xlsx ────► 853 municípios × semanas parciais
│
├── 🔬 Dados Operacionais (TechDengue)
│   └── Atividades Techdengue.xlsx
│       ├── [Aba 1] IBGE_MAPA_CONSÓRCIO_MACRO_CONTRATANTE
│       │   └─► 624 registros × 55 colunas (base mestre completa)
│       ├── [Aba 2] Atividades Techdengue
│       │   └─► 1.278 registros × 8 colunas (visão simplificada)
│       └── [Aba 3] IBGE
│           └─► 853 municípios × 9 colunas (referência)
│
└── 🗄️ Banco GIS (PostgreSQL + PostGIS)
    ├── Tabela: banco_techdengue ────► Dados geoespaciais operacionais
    └── Tabela: planilha_campo ──────► Registros de campo
```

---

## 🔑 Chaves de Relacionamento

```
┌─────────────────────────────────────────────────────────────┐
│                   CÓDIGO IBGE (7 dígitos)                   │
│                     Formato: 31XXXXX                        │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌───────────┐        ┌───────────┐       ┌───────────┐
    │  Dengue   │        │ Atividades│       │   IBGE    │
    │  (codmun) │        │(CODIGO    │       │ (Código   │
    │           │        │ IBGE)     │       │ Município)│
    └───────────┘        └───────────┘       └───────────┘
```

### Campos de Junção (JOIN)

```python
# Exemplo de junção
df_integrado = pd.merge(
    df_dengue, 
    df_atividades, 
    left_on='codmun', 
    right_on='CODIGO IBGE',
    how='inner'  # ou 'left', 'right', 'outer'
)
```

---

## ✅ Checklist de Atividades

### Fase 1: Configuração Inicial ✅ CONCLUÍDO

- [x] Identificar estrutura de diretórios
- [x] Catalogar bases de dados disponíveis
- [x] Analisar estrutura dos arquivos Excel
- [x] Documentar banco de dados GIS
- [x] Criar scripts de análise básicos
- [x] Gerar documentação completa

### Fase 2: Análises Exploratórias 🔄 EM ANDAMENTO

- [ ] **2.1. Executar análise exploratória inicial**
  ```bash
  python exemplo_analise_exploratoria.py
  ```

- [ ] **2.2. Verificar conexão com banco GIS**
  ```bash
  python conectar_banco_gis.py
  ```

- [ ] **2.3. Análise de qualidade dos dados**
  - [ ] Identificar valores faltantes
  - [ ] Detectar outliers
  - [ ] Validar consistência entre bases
  - [ ] Documentar problemas encontrados

- [ ] **2.4. Estatísticas descritivas básicas**
  - [ ] Casos de dengue por região
  - [ ] POIs por categoria
  - [ ] Taxa de devolutivas
  - [ ] Cobertura temporal

### Fase 3: Análises Integradas 📋 PLANEJADO

- [ ] **3.1. Análise Temporal**
  - [ ] Evolução de casos de dengue (2023-2025)
  - [ ] Cronograma de atividades TechDengue
  - [ ] Correlação temporal casos vs. atividades
  - [ ] Identificação de sazonalidade

- [ ] **3.2. Análise Espacial**
  - [ ] Mapas de calor de casos de dengue
  - [ ] Distribuição geográfica de POIs
  - [ ] Clustering de áreas prioritárias
  - [ ] Análise de proximidade

- [ ] **3.3. Análise de Efetividade**
  - [ ] Impacto das atividades nos indicadores
  - [ ] Taxa de conversão POIs → Devolutivas
  - [ ] ROI por município/região
  - [ ] Benchmarking entre equipes

- [ ] **3.4. Análise Preditiva**
  - [ ] Modelo de previsão de surtos
  - [ ] Identificação de áreas de risco
  - [ ] Otimização de recursos
  - [ ] Priorização de intervenções

### Fase 4: Visualizações e Dashboards 📋 PLANEJADO

- [ ] **4.1. Gráficos Estáticos (Python)**
  - [ ] Séries temporais
  - [ ] Mapas coropléticos
  - [ ] Gráficos de correlação
  - [ ] Heatmaps

- [ ] **4.2. Visualizações Interativas**
  - [ ] Dashboard Plotly/Dash
  - [ ] Mapas interativos (Folium/Leaflet)
  - [ ] Filtros dinâmicos
  - [ ] Exportação de relatórios

- [ ] **4.3. BI Profissional**
  - [ ] Dashboard Power BI
  - [ ] Integração com banco GIS
  - [ ] KPIs em tempo real
  - [ ] Alertas automáticos

### Fase 5: Integração com Banco GIS 📋 PLANEJADO

- [ ] **5.1. Configuração**
  - [ ] Testar conexão PostgreSQL
  - [ ] Validar estrutura das tabelas
  - [ ] Verificar dados geoespaciais (PostGIS)
  - [ ] Documentar schema completo

- [ ] **5.2. ETL (Extract, Transform, Load)**
  - [ ] Script de sincronização Excel → PostgreSQL
  - [ ] Validação de dados importados
  - [ ] Tratamento de duplicatas
  - [ ] Log de processamento

- [ ] **5.3. Consultas Avançadas**
  - [ ] Queries espaciais (ST_Within, ST_Distance)
  - [ ] Agregações complexas
  - [ ] Views materializadas
  - [ ] Otimização de índices

### Fase 6: Modelagem e Machine Learning 📋 PLANEJADO

- [ ] **6.1. Preparação de Dados**
  - [ ] Feature engineering
  - [ ] Normalização/padronização
  - [ ] Tratamento de valores ausentes
  - [ ] Divisão treino/teste

- [ ] **6.2. Modelos Preditivos**
  - [ ] Regressão (previsão de casos)
  - [ ] Classificação (áreas de risco)
  - [ ] Clustering (agrupamento de municípios)
  - [ ] Séries temporais (ARIMA, Prophet)

- [ ] **6.3. Validação e Deploy**
  - [ ] Métricas de performance
  - [ ] Validação cruzada
  - [ ] Testes de hipótese
  - [ ] Documentação de modelos

---

## 🎯 Casos de Uso Prioritários

### 1. Dashboard Gerencial
**Objetivo:** Visualização executiva de KPIs  
**Usuário:** Gestores  
**Entrega:** Dashboard interativo com métricas principais

### 2. Análise de Impacto
**Objetivo:** Medir efetividade das atividades TechDengue  
**Usuário:** Equipe técnica  
**Entrega:** Relatório com análise antes/depois

### 3. Priorização de Recursos
**Objetivo:** Identificar municípios prioritários  
**Usuário:** Planejamento  
**Entrega:** Ranking de prioridade com justificativas

### 4. Mapa Interativo
**Objetivo:** Visualização geoespacial integrada  
**Usuário:** Equipes de campo  
**Entrega:** WebApp com mapas e filtros

---

## 🛠️ Ferramentas Necessárias

### Já Instaladas
- [x] Python 3.x
- [x] pandas
- [x] openpyxl
- [x] psycopg2

### A Instalar Conforme Necessidade

```bash
# Visualização
pip install matplotlib seaborn plotly

# GIS
pip install geopandas folium

# Machine Learning
pip install scikit-learn statsmodels prophet

# Dashboard
pip install dash streamlit

# Jupyter
pip install jupyter notebook
```

---

## 📖 Recursos de Aprendizagem

### Documentação Oficial
- [pandas](https://pandas.pydata.org/docs/)
- [geopandas](https://geopandas.org/)
- [PostGIS](https://postgis.net/documentation/)
- [Plotly](https://plotly.com/python/)

### Tutoriais Recomendados
- Análise de dados com pandas
- Visualização geoespacial
- Machine Learning para séries temporais
- Dashboard com Plotly Dash

---

## 📞 Suporte e Contatos

### Dúvidas Técnicas
- Estrutura de dados: Consultar `RESUMO_ANALISE_DADOS.md`
- Conexão GIS: Consultar `guia-banco-gis.md`
- Código Python: Ver exemplos em scripts criados

### Próximos Passos Imediatos

1. **Execute a análise exploratória:**
   ```bash
   python exemplo_analise_exploratoria.py
   ```

2. **Revise os gráficos gerados:**
   - Verifique a pasta `visualizacoes/`
   - Analise `relatorio_executivo.txt`

3. **Teste a conexão GIS:**
   ```bash
   python conectar_banco_gis.py
   ```

4. **Defina prioridades:**
   - Quais análises são mais urgentes?
   - Quais KPIs são mais importantes?
   - Quem serão os usuários finais?

---

## 🔄 Atualizações

| Data | Versão | Alterações |
|------|--------|------------|
| 30/10/2025 | 1.0 | Versão inicial - estruturação completa |

---

**Status Atual:** ✅ Fase 1 concluída | 🔄 Fase 2 iniciada  
**Próxima Ação:** Executar `exemplo_analise_exploratoria.py` e revisar resultados

---

*Documento de navegação e planejamento - Projeto TechDengue*
