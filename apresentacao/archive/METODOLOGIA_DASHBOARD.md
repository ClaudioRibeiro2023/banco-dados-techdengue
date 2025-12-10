# 🎯 METODOLOGIA: DASHBOARD DE ANÁLISE CISARP

**Objetivo:** Criar dashboard interativo de alto impacto para apoiar construção da apresentação  
**Ferramenta:** Streamlit (Python)  
**Entregas:** Dashboard web interativo + Análises descritivas

---

## 📊 VISÃO GERAL

### O Que Você Terá

```
DASHBOARD INTERATIVO (Streamlit)
├─ Home: KPIs principais e resumo executivo
├─ Performance: Análises operacionais completas
├─ Impacto: Análise epidemiológica e cases
├─ Benchmarking: Comparações e rankings
├─ Exploração: Filtros e drill-down interativos
└─ Insights: Descobertas e recomendações
```

**Uso:** Navegue, explore, exporte gráficos → Use na sua apresentação

---

## 🚀 METODOLOGIA EM 6 FASES

### FASE 1: PREPARAÇÃO DOS DADOS (30 min)

**Objetivo:** Consolidar e validar todas as bases necessárias

#### Atividades
```python
1. Executar scripts de preparação
   ├─ 01_validacao_dados.py (já feito ✅)
   ├─ 02_analise_cisarp.py
   ├─ 04_analise_impacto_epidemiologico.py
   └─ Gerar CSVs consolidados

2. Validar integridade
   ├─ Verificar 108 registros
   ├─ Confirmar 52 municípios
   └─ Validar correspondência com dengue

3. Criar dataset mestre
   └─ Juntar todas as análises em um único CSV
```

**Entrega:** `dados/dashboard_master.csv` (dataset completo)

---

### FASE 2: ESTRUTURA DO DASHBOARD (20 min)

**Objetivo:** Definir páginas e navegação

#### Estrutura de Páginas

```python
dashboard_cisarp/
├─ app.py                    # Aplicação principal
├─ pages/
│  ├─ 1_🏠_Home.py          # Visão geral
│  ├─ 2_📊_Performance.py   # Análise operacional
│  ├─ 3_💊_Impacto.py       # Análise epidemiológica
│  ├─ 4_🏆_Benchmarking.py  # Comparações
│  ├─ 5_🔍_Exploração.py    # Filtros interativos
│  └─ 6_💡_Insights.py      # Descobertas
├─ utils/
│  ├─ data_loader.py        # Carregamento de dados
│  ├─ metrics.py            # Cálculo de métricas
│  └─ visualizations.py     # Gráficos reutilizáveis
└─ style.css                # Estilos customizados
```

**Entrega:** Estrutura de arquivos criada

---

### FASE 3: PÁGINA HOME (45 min)

**Objetivo:** Dashboard executivo com KPIs principais

#### Componentes

**1. KPI Cards (Topo)**
```python
col1, col2, col3, col4 = st.columns(4)

col1.metric("Intervenções", "108", delta="+37 vs inicial")
col2.metric("POIs", "13.584", delta="+0.06%")
col3.metric("Hectares", "9.440", delta="+94%")
col4.metric("Ranking", "4º", delta="Top 6%")
```

**2. Resumo Executivo (Centro)**
- Período de operação (timeline visual)
- 52 municípios atendidos (mapa MG)
- Top 5 insights (bullets)
- Status de qualidade (gauge)

**3. Navegação Rápida (Base)**
- Botões para cada seção
- Atalhos para cases de sucesso
- Link para relatórios

**Visualizações:**
- 📊 4 KPI cards
- 🗺️ Mapa de MG com CISARP
- 📈 Timeline de operação
- 🎯 Gauge de qualidade

---

### FASE 4: PÁGINAS DE ANÁLISE (2-3h)

#### PÁGINA 2: PERFORMANCE OPERACIONAL

**Seções:**

**A. KPIs Detalhados**
```python
# Métricas expandidas
st.subheader("📊 Indicadores Operacionais")

col1, col2, col3 = st.columns(3)
col1.metric("POIs/registro", "125.8")
col2.metric("Hectares/registro", "87.4")
col3.metric("Densidade", "1.44 POIs/ha")
```

**B. Análise por Município**
- Tabela interativa top 15
- Filtro por município
- Gráfico de barras horizontal
- Drill-down por município selecionado

**C. Evolução Temporal**
- Gráfico de linha mensal
- Filtro de período
- Análise de sazonalidade
- Comparação trimestral

**D. Categorias de POIs**
- Treemap interativo
- Pizza com top 10
- Tabela ordenável
- Filtro por categoria

**E. Cobertura Territorial**
- Mapa de calor
- Distribuição geográfica
- Hectares por município
- Gaps de cobertura

**Visualizações:** 8-10 gráficos interativos

---

#### PÁGINA 3: IMPACTO EPIDEMIOLÓGICO ⭐

**Seções:**

**A. Before-After Geral**
```python
st.subheader("📉 Impacto nos Casos de Dengue")

col1, col2 = st.columns(2)
col1.metric("ANTES (Jan-Nov/24)", "X.XXX casos")
col2.metric("DEPOIS (Dez/24-Ago/25)", "X.XXX casos", delta="-X.X%")

# Gráfico de barras comparativo
```

**B. Top Municípios com Redução**
- Ranking interativo
- Filtro por % de redução
- Gráfico de barras horizontal
- Detalhes ao clicar

**C. Cases de Sucesso**
```python
# Seletor de município
municipio_selecionado = st.selectbox(
    "Selecione um Case de Sucesso",
    ["JANAÚBA", "SALINAS", "RIO PARDO", ...]
)

# Exibir detalhes do case
st.subheader(f"🏆 Case: {municipio_selecionado}")

col1, col2, col3, col4 = st.columns(4)
col1.metric("Intervenções", "10")
col2.metric("POIs", "1.234")
col3.metric("Redução", "-35%")
col4.metric("Score", "92/100")

# Timeline de intervenções vs casos
# Gráfico de linha dupla
```

**D. Correlações**
- Scatter: POIs vs Redução de casos
- Correlação estatística (Pearson)
- Linha de tendência
- Análise de outliers

**E. Análise Temporal**
- Série temporal de casos
- Marcadores de intervenções
- Lag de impacto (2-4 semanas)
- Comparação com grupo controle

**Visualizações:** 6-8 gráficos interativos

---

#### PÁGINA 4: BENCHMARKING

**Seções:**

**A. Ranking Nacional**
- Top 10 contratantes
- Posição do CISARP destacada
- Barra de progresso até top 3
- Comparação com média

**B. Comparação de Indicadores**
```python
# Radar chart interativo
indicadores = [
    'POIs/registro',
    'Hectares/registro',
    'Taxa conversão',
    'Densidade POIs',
    'Cobertura'
]

# Comparar CISARP vs Top 3 vs Média
```

**C. Consórcios Similares**
- Filtro por faixa de atividades
- Tabela comparativa
- Gráficos de bolhas
- Matriz SWOT

**D. Evolução de Posição**
- Timeline de ranking
- Projeção de crescimento
- Metas para top 3

**Visualizações:** 5-6 gráficos interativos

---

#### PÁGINA 5: EXPLORAÇÃO INTERATIVA

**Objetivo:** Drill-down e filtros customizados

**Filtros Disponíveis:**
```python
# Sidebar com filtros
st.sidebar.header("🔍 Filtros")

# Município
municipios = st.sidebar.multiselect(
    "Municípios",
    options=lista_municipios,
    default=lista_municipios[:10]
)

# Período
data_inicio, data_fim = st.sidebar.date_input(
    "Período",
    value=[df['DATA_MAP'].min(), df['DATA_MAP'].max()]
)

# Nº de intervenções
min_intervencoes = st.sidebar.slider(
    "Mínimo de intervenções",
    min_value=1,
    max_value=10,
    value=1
)

# Categoria de POI
categorias = st.sidebar.multiselect(
    "Categorias de POI",
    options=lista_categorias
)
```

**Visualizações Dinâmicas:**
- Tabela filtrada e exportável
- Gráficos que atualizam com filtros
- Estatísticas descritivas dinâmicas
- Exportar dados filtrados (CSV/Excel)

---

#### PÁGINA 6: INSIGHTS E RECOMENDAÇÕES

**Seções:**

**A. Top 5 Insights**
- Cards visuais
- Ícones e cores
- Narrativa descritiva
- Dados de suporte

**B. Oportunidades**
```python
st.subheader("🎯 Oportunidades de Melhoria")

# Análise de gaps
gaps = identificar_gaps(df)

for gap in gaps:
    with st.expander(f"⚠️ {gap['titulo']}"):
        st.write(gap['descricao'])
        st.metric("Potencial", gap['potencial'])
        st.plotly_chart(gap['grafico'])
```

**C. Recomendações**
- Curto prazo (bullets)
- Médio prazo (timeline)
- Longo prazo (roadmap)
- Priorização (matriz impacto/esforço)

**D. Próximos Passos**
- Checklist interativo
- Cronograma sugerido
- Responsáveis
- KPIs de acompanhamento

---

### FASE 5: FUNCIONALIDADES AVANÇADAS (1h)

#### Recursos Interativos

**1. Exportação de Dados**
```python
# Botão para download
st.download_button(
    label="📥 Exportar dados filtrados (CSV)",
    data=df_filtrado.to_csv(index=False),
    file_name=f"cisarp_export_{datetime.now().strftime('%Y%m%d')}.csv",
    mime="text/csv"
)
```

**2. Exportação de Gráficos**
```python
# Salvar gráfico em PNG
fig.write_image("grafico.png", width=1920, height=1080, scale=2)

# Botão de download
with open("grafico.png", "rb") as file:
    st.download_button(
        label="📥 Baixar gráfico (PNG)",
        data=file,
        file_name="grafico_cisarp.png"
    )
```

**3. Comparação Personalizada**
```python
# Selecionar múltiplos municípios para comparar
municipios_comparar = st.multiselect(
    "Selecione municípios para comparar",
    options=lista_municipios
)

# Gerar gráfico comparativo
criar_grafico_comparativo(municipios_comparar)
```

**4. Anotações e Observações**
```python
# Campo para notas
with st.expander("📝 Adicionar observação"):
    nota = st.text_area("Suas observações sobre esta análise:")
    if st.button("Salvar nota"):
        salvar_nota(nota)
```

**5. Modo Apresentação**
```python
# Toggle para modo fullscreen
if st.checkbox("🎬 Modo Apresentação"):
    st.markdown("""
        <style>
        .stApp {background-color: #000;}
        .metric-container {font-size: 2em;}
        </style>
    """, unsafe_allow_html=True)
```

---

### FASE 6: TESTES E REFINAMENTO (30 min)

#### Checklist de Qualidade

**Performance:**
- [ ] Carregamento < 3 segundos
- [ ] Cache de dados implementado
- [ ] Gráficos renderizam rápido
- [ ] Responsivo (mobile/tablet/desktop)

**Funcionalidade:**
- [ ] Todos os filtros funcionam
- [ ] Exportação de dados OK
- [ ] Exportação de gráficos OK
- [ ] Navegação fluida

**Conteúdo:**
- [ ] Todos os 108 registros
- [ ] Números validados
- [ ] Análise de impacto incluída
- [ ] Cases de sucesso detalhados

**UX:**
- [ ] Layout limpo e organizado
- [ ] Cores consistentes
- [ ] Tooltips explicativos
- [ ] Feedback de ações

---

## 🎨 DESIGN E ESTILO

### Paleta de Cores

```python
COLORS = {
    'primary': '#0066CC',      # Azul CISARP
    'success': '#28A745',      # Verde (positivo)
    'warning': '#FFA500',      # Laranja (atenção)
    'danger': '#DC3545',       # Vermelho (crítico)
    'neutral': '#6C757D',      # Cinza
    'background': '#F8F9FA',   # Fundo claro
}
```

### Componentes Visuais

**KPI Cards:**
```python
def criar_kpi_card(titulo, valor, delta=None, cor='primary'):
    st.markdown(f"""
        <div style="
            background: linear-gradient(135deg, {COLORS[cor]} 0%, {COLORS[cor]}dd 100%);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <h3 style="margin: 0; font-size: 14px;">{titulo}</h3>
            <h1 style="margin: 10px 0; font-size: 36px;">{valor}</h1>
            {f'<p style="margin: 0; font-size: 12px;">{delta}</p>' if delta else ''}
        </div>
    """, unsafe_allow_html=True)
```

---

## 📁 ESTRUTURA DE ARQUIVOS FINAL

```
apresentacao/
├─ dashboard_cisarp.py          # Script principal do dashboard
├─ requirements_dashboard.txt   # Dependências adicionais
├─ dados/
│  ├─ dashboard_master.csv      # Dataset consolidado
│  ├─ cisarp_completo.csv
│  └─ impacto/
│     └─ sumario_impacto.json
├─ utils/
│  ├─ data_processing.py        # Processamento de dados
│  ├─ charts.py                 # Biblioteca de gráficos
│  └─ metrics.py                # Cálculos de métricas
└─ assets/
   ├─ logo_cisarp.png
   └─ style.css
```

---

## 🚀 COMO EXECUTAR

### Preparação (única vez)

```bash
# Instalar dependências
pip install streamlit plotly pandas openpyxl

# OU
pip install -r requirements_dashboard.txt
```

### Execução

```bash
cd apresentacao
streamlit run dashboard_cisarp.py
```

**Abre automaticamente em:** `http://localhost:8501`

---

## 💡 COMO USAR O DASHBOARD

### Para Construir Sua Apresentação

**1. Exploração Inicial (30 min)**
- Navegue por todas as páginas
- Entenda os dados disponíveis
- Identifique visualizações mais impactantes
- Anote insights principais

**2. Seleção de Conteúdo (1h)**
- Marque gráficos para usar
- Exporte visualizações (PNG)
- Copie números-chave
- Identifique cases de sucesso

**3. Construção de Narrativa (1h)**
- Use insights do dashboard
- Organize storyline
- Selecione 10-15 gráficos principais
- Prepare materiais de apoio

**4. Preparação Final (30 min)**
- Exporte dados para backup
- Salve gráficos em alta resolução
- Prepare Q&A com base no dashboard
- Teste navegação (para demonstração ao vivo)

### Apresentação ao Vivo (Opcional)

**Opção 1:** Usar gráficos exportados em PPT  
**Opção 2:** Demonstrar dashboard ao vivo (mais impacto!)

```
Vantagens de apresentar o dashboard:
✓ Interatividade com audiência
✓ Responder perguntas em tempo real
✓ Filtrar dados conforme interesse
✓ Demonstrar transparência
✓ Maior engajamento
```

---

## ⏱️ CRONOGRAMA DE EXECUÇÃO

| Fase | Duração | Atividade |
|------|---------|-----------|
| 1 | 30 min | Preparar dados |
| 2 | 20 min | Estruturar dashboard |
| 3 | 45 min | Criar página Home |
| 4 | 2-3h | Criar páginas de análise |
| 5 | 1h | Adicionar funcionalidades |
| 6 | 30 min | Testar e refinar |
| **TOTAL** | **5-6h** | Dashboard completo |

---

## ✅ ENTREGAS FINAIS

### O Que Você Terá

1. ✅ Dashboard web interativo (6 páginas)
2. ✅ 30+ visualizações de alto impacto
3. ✅ Análises descritivas completas
4. ✅ Filtros e exploração interativa
5. ✅ Exportação de dados e gráficos
6. ✅ Cases de sucesso detalhados
7. ✅ Material de apoio para apresentação

### Como Usar

- **Durante preparação:** Explore, analise, exporte
- **Durante apresentação:** Demonstre ao vivo ou use exports
- **Pós-apresentação:** Compartilhe link do dashboard
- **Acompanhamento:** Atualize dados periodicamente

---

**PRÓXIMO PASSO:** Execute `dashboard_cisarp.py` (será criado a seguir)
