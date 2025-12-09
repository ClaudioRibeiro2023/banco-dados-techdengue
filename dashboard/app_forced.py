"""
TechDengue Analytics - Dashboard com CSS Forçado
Versão para garantir que as melhorias sejam aplicadas
"""
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from pathlib import Path
from datetime import datetime
import json
import sys
from io import BytesIO

# Forçar limpeza de cache
st.cache_data.clear()

# Adicionar diretório pai ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Importar componentes UI modernos
from components.ui_components import (
    create_metric_card_modern,
    create_section_header,
    create_status_card,
    create_analysis_card,
    create_modern_button,
    create_modern_alert,
    create_progress_bar,
    create_badge,
    create_techdengue_header,
    create_year_card,
    create_techdengue_kpi_grid
)

# Configuração da página
st.set_page_config(
    page_title="TechDengue Analytics | Dashboard Profissional",
    page_icon="🦟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS FORÇADO INLINE (garantir aplicação)
st.markdown("""
<style>
/* =============================================================================
   DESIGN SYSTEM FORÇADO - CSS INLINE
   ============================================================================= */

:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-900: #1e3a8a;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  --gradient-primary: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --gradient-success: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  --gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --gradient-error: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
}

/* Reset geral */
.stApp {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Header principal */
.main-header {
  background: var(--gradient-primary);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
}

.main-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.main-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
}

.main-header p {
  margin: 0.5rem 0 0 0;
  font-size: 1.125rem;
  opacity: 0.9;
}

/* Cards de métrica */
.metric-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.metric-card.primary::before {
  background: var(--gradient-primary);
}

.metric-card.success::before {
  background: var(--gradient-success);
}

.metric-card.warning::before {
  background: var(--gradient-warning);
}

.metric-card.error::before {
  background: var(--gradient-error);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.metric-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  color: white;
}

.metric-card-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.metric-card-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

.metric-card-change {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
}

.metric-card-change.positive {
  background: #dcfce7;
  color: #15803d;
}

.metric-card-change.negative {
  background: #fee2e2;
  color: #b91c1c;
}

/* Seções */
.section-header {
  background: white;
  border-radius: var(--radius-2xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  position: relative;
  overflow: hidden;
}

.section-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: var(--gradient-primary);
}

.section-header.primary::before {
  background: var(--gradient-primary);
}

.section-header.success::before {
  background: var(--gradient-success);
}

.section-header.warning::before {
  background: var(--gradient-warning);
}

.section-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-800);
}

.section-header p {
  margin: 0.5rem 0 0 0;
  color: var(--gray-600);
  font-size: 1rem;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Botões */
.modern-button {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-lg);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

/* Override Streamlit */
.stMarkdown {
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.stMetric {
  background: white !important;
  padding: 1.5rem !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-lg) !important;
  border: 1px solid var(--gray-200) !important;
}

.stMetric:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--shadow-xl) !important;
}

/* Sidebar */
.css-1d391kg {
  background: linear-gradient(180deg, var(--primary-50) 0%, white 100%) !important;
  border-right: 1px solid var(--gray-200) !important;
}

/* Main content */
.css-1y0pads {
  background: transparent !important;
  padding: 2rem !important;
}
</style>
""", unsafe_allow_html=True)

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

@st.cache_data(ttl=300)
def carregar_insights():
    """Carrega insights para a home"""
    arquivo = Path(__file__).parent.parent / "data_lake" / "metadata" / "insights_home.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_relatorio_qualidade():
    """Carrega relatório de qualidade"""
    arquivo = Path(__file__).parent.parent / "data_lake" / "metadata" / "relatorio_qualidade_completo.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_validacao_estrutura():
    """Carrega validação de estrutura"""
    arquivo = Path(__file__).parent.parent / "data_lake" / "metadata" / "validacao_estrutura_completa.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_mega_tabela():
    """Carrega MEGA TABELA"""
    arquivo = Path(__file__).parent.parent / "data_lake" / "gold" / "mega_tabela_analitica.parquet"
    if arquivo.exists():
        return pd.read_parquet(arquivo)
    return None

# ============================================================================
# HEADER PRINCIPAL FORÇADO
# ============================================================================

st.markdown("""
<div class="main-header fade-in">
    <div class="main-header-content">
        <div>
            <h1>🦟 TechDengue Analytics</h1>
            <p>Sistema Profissional de Gestão de Dados e Monitoramento</p>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 0.875rem; opacity: 0.7;">Versão 3.0</div>
            <div style="font-size: 0.875rem; opacity: 0.7;">Production Ready</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ============================================================================
# SIDEBAR
# ============================================================================

with st.sidebar:
    st.markdown("""
    <div style="
        background: linear-gradient(135deg, #1f77b4 0%, #155a8a 100%);
        padding: 1.5rem;
        border-radius: 0.75rem;
        text-align: center;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(31,119,180,0.3);
    ">
        <h2 style="margin: 0; color: white; font-size: 1.5rem;">
            🦟 TechDengue
        </h2>
        <p style="margin: 0.5rem 0 0 0; color: rgba(255,255,255,0.9); font-size: 0.9rem;">
            Analytics Platform
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Navegação
    st.markdown("### 🧭 Navegação")
    
    pages = [
        "🏠 Dashboard Principal",
        "📊 Análise de Dados", 
        "🗺️ Visualizações",
        "⚙️ Configurações"
    ]
    
    for page in pages:
        if st.button(page, key=page, use_container_width=True):
            st.info(f"Navegando para: {page}")
    
    st.markdown("---")
    
    # Status do Sistema
    st.markdown("### 📊 Status do Sistema")
    
    status_items = [
        ("🟢", "Base de Dados", "Online"),
        ("🟢", "API GIS", "Operacional"),
        ("🟡", "Sincronização", "Pendente"),
        ("🟢", "Validação", "Concluída")
    ]
    
    for icon, label, status in status_items:
        color = "success" if status == "Online" or status == "Operacional" or status == "Concluída" else "warning"
        st.markdown(create_status_card(label, color, status), unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Informações
    st.markdown("### ℹ️ Informações")
    st.markdown(f"""
    <div style="
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.5rem;
        font-size: 0.85rem;
        color: #666;
    ">
        <p><strong>Última atualização:</strong><br>{datetime.now().strftime("%d/%m/%Y %H:%M")}</p>
        <p><strong>Versão:</strong> 3.0.0</p>
        <p><strong>Ambiente:</strong> Produção</p>
        <p><strong>Desenvolvido por:</strong> Cascade AI</p>
    </div>
    """, unsafe_allow_html=True)

# ============================================================================
# CONTEÚDO PRINCIPAL
# ============================================================================

# Seção de Visão Geral Moderna
st.markdown(create_section_header(
    "📊 Visão Geral do Sistema", 
    "Monitoramento em tempo real da base de dados TechDengue",
    "📊",
    "primary"
), unsafe_allow_html=True)

# Carregar dados
relatorio_qualidade = carregar_relatorio_qualidade()
validacao_estrutura = carregar_validacao_estrutura()
mega_tabela = carregar_mega_tabela()
insights = carregar_insights()

# Grid de KPIs Modernos
if insights:
    st.markdown(create_techdengue_kpi_grid(insights), unsafe_allow_html=True)
else:
    # KPIs básicos se insights não disponíveis
    col1, col2, col3, col4 = st.columns(4, gap="large")
    
    with col1:
        if relatorio_qualidade:
            score = relatorio_qualidade.get('score_qualidade_geral', 0)
            st.markdown(create_metric_card_modern(
                "✅",
                "Score de Qualidade",
                f"{score:.1f}%",
                None,
                "success"
            ), unsafe_allow_html=True)
    
    with col2:
        if validacao_estrutura:
            total_registros = validacao_estrutura.get('total_registros', 0)
            st.markdown(create_metric_card_modern(
                "📝",
                "Total de Registros",
                f"{total_registros:,}",
                None,
                "primary"
            ), unsafe_allow_html=True)
    
    with col3:
        if validacao_estrutura:
            total_tabelas = validacao_estrutura.get('total_tabelas', 0)
            st.markdown(create_metric_card_modern(
                "🗄️",
                "Tabelas Criadas",
                f"{total_tabelas}",
                None,
                "info"
            ), unsafe_allow_html=True)
    
    with col4:
        if validacao_estrutura:
            tamanho = validacao_estrutura.get('total_tamanho_mb', 0)
            st.markdown(create_metric_card_modern(
                "💾",
                "Tamanho Total",
                f"{tamanho:.1f} MB",
                None,
                "warning"
            ), unsafe_allow_html=True)

st.markdown("---")

# ============================================================================
# ANÁLISE TEMPORAL - EVOLUÇÃO
# ============================================================================

st.markdown(create_section_header(
    "📈 Evolução Temporal das Operações",
    "Crescimento e tendências ao longo do tempo",
    "📈",
    "success"
), unsafe_allow_html=True)

if mega_tabela is not None:
    # Análise por ano
    evolucao = mega_tabela.groupby('ano').agg({
        'total_atividades': 'sum',
        'total_pois_excel': 'sum',
        'total_hectares_mapeados': 'sum',
        'total_devolutivas': 'sum',
        'codigo_ibge': lambda x: (mega_tabela.loc[x.index, 'total_atividades'] > 0).sum()
    }).reset_index()
    
    evolucao.columns = ['Ano', 'Atividades', 'POIs', 'Hectares', 'Devolutivas', 'Municípios Ativos']
    
    # Cards por ano
    col1, col2, col3 = st.columns(3)
    
    for idx, row in evolucao.iterrows():
        with [col1, col2, col3][idx]:
            ano = int(row['Ano'])
            atividades = int(row['Atividades'])
            pois = int(row['POIs'])
            municipios = int(row['Municípios Ativos'])
            
            # Calcular crescimento
            crescimento = None
            if idx > 0 and atividades > 0 and evolucao.iloc[idx-1]['Atividades'] > 0:
                ativ_anterior = evolucao.iloc[idx-1]['Atividades']
                crescimento = ((atividades - ativ_anterior) / ativ_anterior) * 100
            
            st.markdown(create_year_card(ano, atividades, pois, municipios, crescimento), unsafe_allow_html=True)
    
    # Gráfico de evolução
    st.markdown("### 📊 Gráfico de Evolução")
    
    fig = go.Figure()
    
    # POIs
    fig.add_trace(go.Scatter(
        x=evolucao['Ano'],
        y=evolucao['POIs'],
        name='POIs Identificados',
        mode='lines+markers',
        line=dict(color='#1f77b4', width=3),
        marker=dict(size=10),
        fill='tozeroy',
        fillcolor='rgba(31, 119, 180, 0.1)'
    ))
    
    # Municípios Ativos
    fig.add_trace(go.Scatter(
        x=evolucao['Ano'],
        y=evolucao['Municípios Ativos'],
        name='Municípios Ativos',
        mode='lines+markers',
        line=dict(color='#28a745', width=3),
        marker=dict(size=10),
        yaxis='y2'
    ))
    
    fig.update_layout(
        title='Evolução de POIs e Municípios Ativos (2023-2025)',
        xaxis=dict(title='Ano', tickmode='linear'),
        yaxis=dict(title='POIs Identificados', side='left'),
        yaxis2=dict(title='Municípios Ativos', side='right', overlaying='y'),
        hovermode='x unified',
        height=400,
        showlegend=True,
        legend=dict(x=0.01, y=0.99),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    
    st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

# ============================================================================
# MEGA TABELA - VISUALIZAÇÃO
# ============================================================================

st.markdown(create_section_header(
    "📊 MEGA TABELA Analítica",
    "Visualização completa e interativa de todos os dados",
    "📊",
    "primary"
), unsafe_allow_html=True)

if mega_tabela is not None:
    # Estatísticas principais com componentes modernos
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(create_metric_card_modern(
            "📝",
            "Total de Registros",
            f"{len(mega_tabela):,}",
            None,
            "primary"
        ), unsafe_allow_html=True)
    
    with col2:
        st.markdown(create_metric_card_modern(
            "📋",
            "Colunas",
            f"{len(mega_tabela.columns)}",
            None,
            "info"
        ), unsafe_allow_html=True)
    
    with col3:
        municipios = mega_tabela['codigo_ibge'].nunique() if 'codigo_ibge' in mega_tabela.columns else 0
        st.markdown(create_metric_card_modern(
            "🏙️",
            "Municípios",
            f"{municipios}",
            None,
            "success"
        ), unsafe_allow_html=True)
    
    with col4:
        com_atividades = (mega_tabela['total_atividades'] > 0).sum() if 'total_atividades' in mega_tabela.columns else 0
        st.markdown(create_metric_card_modern(
            "✅",
            "Com Atividades",
            f"{com_atividades:,}",
            (com_atividades/len(mega_tabela)*100),
            "warning"
        ), unsafe_allow_html=True)
    
    # Tabela interativa
    st.markdown("### 📋 Tabela de Dados")
    
    # Filtros simples
    col1, col2 = st.columns(2)
    
    with col1:
        anos_disponiveis = ['Todos'] + sorted(mega_tabela['ano'].unique().tolist())
        ano_selecionado = st.selectbox("📅 Filtrar por Ano", anos_disponiveis)
    
    with col2:
        filtro_atividades = st.selectbox(
            "🔍 Filtrar por Atividades",
            ['Todos', 'Com Atividades', 'Sem Atividades']
        )
    
    # Aplicar filtros
    df_filtrado = mega_tabela.copy()
    
    if ano_selecionado != 'Todos':
        df_filtrado = df_filtrado[df_filtrado['ano'] == ano_selecionado]
    
    if filtro_atividades == 'Com Atividades':
        df_filtrado = df_filtrado[df_filtrado['total_atividades'] > 0]
    elif filtro_atividades == 'Sem Atividades':
        df_filtrado = df_filtrado[df_filtrado['total_atividades'] == 0]
    
    # Mostrar tabela
    st.dataframe(df_filtrado, use_container_width=True)
    
    # Métricas do filtro
    st.markdown(f"📊 Exibindo {len(df_filtrado):,} de {len(mega_tabela):,} registros")

else:
    st.warning("⚠️ MEGA TABELA não encontrada. Execute o pipeline ETL primeiro.")

# ============================================================================
# RODAPÉ
# ============================================================================

st.markdown("---")

st.markdown("""
<div style="
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 0.9rem;
">
    <p>🦟 <strong>TechDengue Analytics</strong> - Sistema Profissional de Gestão de Dados</p>
    <p>Desenvolvido por Cascade AI | Versão 3.0.0 | Production Ready</p>
</div>
""", unsafe_allow_html=True)
