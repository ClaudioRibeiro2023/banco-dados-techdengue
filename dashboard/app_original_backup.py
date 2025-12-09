"""
Painel de Gestão de Base de Dados TechDengue
Dashboard profissional para monitoramento e gestão de dados
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
from utils.plotly_theme import apply_theme
from components.layout import page_container, page_section, section, spacer
from components.filters import filter_bar_mega
from components.keyboard_shortcuts import create_shortcuts_panel
from components.empty_error_states import create_empty_state, create_loading_skeleton

# Configuração da página
st.set_page_config(
    page_title="TechDengue Analytics | Dashboard Profissional",
    page_icon="🦟",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://github.com/techdengue',
        'Report a bug': 'https://github.com/techdengue/issues',
        'About': '# TechDengue Analytics\n## Sistema Profissional de Gestão de Dados\nVersão 5.0.0 - Enterprise Design System'
    }
)

# Aplicar tema global do Plotly
apply_theme()

# Carregar Design System v5.0.0: tokens → extended → base → components → extended → VISUAL UPGRADE
assets_dir = Path(__file__).parent / "assets"

for css_name in ("tokens.css", "tokens-extended.css", "base.css", "components.css", "components-extended.css", "visual-upgrade-v5.css"):
    css_path = assets_dir / css_name
    if css_path.exists():
        with open(css_path, 'r', encoding='utf-8') as f:
            st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# Caminhos
BASE_DIR = Path(__file__).parent.parent
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

@st.cache_data(ttl=300)  # Cache por 5 minutos
def carregar_insights():
    """Carrega insights para a home"""
    arquivo = METADATA_DIR / "insights_home.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_relatorio_qualidade():
    """Carrega relatório de qualidade"""
    arquivo = METADATA_DIR / "relatorio_qualidade_completo.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_validacao_estrutura():
    """Carrega validação de estrutura"""
    arquivo = METADATA_DIR / "validacao_estrutura.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_historico_atualizacoes():
    """Carrega histórico de atualizações"""
    arquivo = METADATA_DIR / "historico_atualizacoes.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'atualizacoes': []}

@st.cache_data(ttl=300)
def carregar_mega_tabela():
    """Carrega MEGA TABELA"""
    arquivo = GOLD_DIR / "mega_tabela_analitica.parquet"
    if arquivo.exists():
        return pd.read_parquet(arquivo)
    return None

# ============================================================================
# HEADER PRINCIPAL MODERNO
# ============================================================================

# Skip link para acessibilidade
st.markdown('<a class="skip-link" href="#main-content">Pular para o conteúdo</a>', unsafe_allow_html=True)

# Keyboard shortcuts panel (v5.0.0)
st.markdown(create_shortcuts_panel(), unsafe_allow_html=True)

st.markdown(create_techdengue_header(), unsafe_allow_html=True)

# Banner de Versão 5.0.0 (destaque visual)
st.markdown("""
<div style="
    background: linear-gradient(135deg, #1f77b4 0%, #28a745 50%, #17a2b8 100%);
    padding: 1.5rem 2rem;
    border-radius: 12px;
    margin: 1rem 0 2rem 0;
    box-shadow: 0 8px 24px rgba(31, 119, 180, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    animation: fadeIn 0.5s ease-in;
">
    <h2 style="
        color: white;
        margin: 0 0 0.5rem 0;
        font-size: 1.8rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    ">
        ✨ TechDengue Analytics v5.0.0 ✨
    </h2>
    <p style="
        color: rgba(255, 255, 255, 0.95);
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
    ">
        🎨 Enterprise Design System | ♿ WCAG 2.1 AA Compliant | ⚡ Performance Optimized
    </p>
    <div style="
        margin-top: 0.75rem;
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    ">
        <span style="
            background: rgba(255,255,255,0.2);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            color: white;
            font-weight: 600;
        ">🎯 60+ Tokens CSS</span>
        <span style="
            background: rgba(255,255,255,0.2);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            color: white;
            font-weight: 600;
        ">🧩 20+ Componentes</span>
        <span style="
            background: rgba(255,255,255,0.2);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            color: white;
            font-weight: 600;
        ">⌨️ Keyboard Shortcuts (Pressione ?)</span>
        <span style="
            background: rgba(255,255,255,0.2);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            color: white;
            font-weight: 600;
        ">🧪 48 Testes</span>
    </div>
</div>

<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
""", unsafe_allow_html=True)

# Container principal (ritmo visual consistente)
st.markdown('<div class="container" id="main-content">', unsafe_allow_html=True)

# ============================================================================
# SIDEBAR
# ============================================================================

with st.sidebar:
    # Logo/Header do Sidebar
    st.markdown("""
    <div style="
        background: linear-gradient(135deg, #1f77b4 0%, #155a8a 100%);
        padding: 1.5rem;
        border-radius: 0.75rem;
        text-align: center;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(31,119,180,0.3);
    ">
        <h2 style="
            color: white;
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
        ">
            🦟 TechDengue
        </h2>
        <p style="
            color: rgba(255,255,255,0.9);
            margin: 0.5rem 0 0 0;
            font-size: 0.9rem;
        ">
            Dashboard v5.0.0
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Navegação melhorada
    st.markdown("### 📊 Navegação")
    
    # Páginas com ícones e descrições
    pages = {
        "🏠 Home": "Visão geral do sistema",
        "📊 Qualidade de Dados": "Monitoramento de qualidade",
        "🗄️ Dados Disponíveis": "Inventário de tabelas",
        "🔍 Confiabilidade": "Rastreabilidade",
        "🔄 Sincronização": "Controles de sync",
        "📈 Análises": "Análises rápidas"
    }
    
    for page, desc in pages.items():
        if page == "🏠 Home":
            st.markdown(f"""
            <div style="
                background: linear-gradient(135deg, #1f77b4 0%, #155a8a 100%);
                padding: 0.75rem;
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                color: white;
                font-weight: 600;
            ">
                {page}
                <div style="font-size: 0.8rem; opacity: 0.9; font-weight: normal;">
                    {desc}
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div style="
                background: #f8f9fa;
                padding: 0.75rem;
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                border-left: 3px solid #1f77b4;
            ">
                {page}
                <div style="font-size: 0.8rem; color: #666;">
                    {desc}
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Status do Sistema (Design System)
    st.markdown("### 🔌 Status do Sistema")
    status_variant = "warning"
    details = "Conexão não testada"
    try:
        from src.database import get_database
        db = get_database()
        if db.test_connection():
            status_variant = "online"
            details = "PostgreSQL conectado"
        else:
            status_variant = "error"
            details = "Servidor offline"
    except Exception:
        status_variant = "warning"
        details = "Conexão não testada"

    st.markdown(create_status_card("PostgreSQL", status_variant, details), unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Última atualização melhorada
    historico = carregar_historico_atualizacoes()
    if historico['atualizacoes']:
        ultima = historico['atualizacoes'][-1]
        st.markdown("### ⏰ Última Atualização")
        if 'inicio' in ultima:
            data = datetime.fromisoformat(ultima['inicio'])
            st.markdown(f"""
            <div style="
                background: #d1ecf1;
                border-left: 4px solid #17a2b8;
                padding: 1rem;
                border-radius: 0.5rem;
            ">
                <div style="color: #0c5460; font-weight: 600;">
                    📅 {data.strftime('%d/%m/%Y')}
                </div>
                <div style="color: #0c5460; font-size: 0.9rem; margin-top: 0.25rem;">
                    🕐 {data.strftime('%H:%M:%S')}
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Informações adicionais
    st.markdown("### ℹ️ Informações")
    st.markdown("""
    <div style="font-size: 0.85rem; color: #666;">
        <p><strong>Versão:</strong> 5.0.0</p>
        <p><strong>Design System:</strong> Enterprise-Grade</p>
        <p><strong>Ambiente:</strong> Produção</p>
        <p><strong>Desenvolvido por:</strong> Cascade AI</p>
    </div>
    """, unsafe_allow_html=True)

# ============================================================================
# MÉTRICAS PRINCIPAIS (KPIs)
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

# Criar colunas para métricas com espaçamento
col1, col2, col3, col4 = st.columns(4, gap="large")

# Função helper para criar card de métrica melhorado
def create_metric_card(icon, label, value, delta=None, color="#1f77b4"):
    delta_html = ""
    if delta:
        delta_color = "#28a745" if "Excelente" in delta or "+" in str(delta) else "#ffc107"
        delta_html = f"""
        <div style="
            color: {delta_color};
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 0.5rem;
        ">
            {delta}
        </div>
        """
    
    return f"""
    <div style="
        background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-left: 4px solid {color};
        transition: all 0.3s ease;
        margin-bottom: 1rem;
    ">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">{icon}</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 0.25rem;">
            {value}
        </div>
        <div style="font-size: 0.9rem; color: #666; font-weight: 500;">
            {label}
        </div>
        {delta_html}
    </div>
    """

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
    st.caption("Evolução anual: linha 1 representa POIs identificados; linha 2 (eixo direito) representa municípios ativos.")

st.markdown("---")

# ============================================================================
# TOP PERFORMERS - RANKING
# ============================================================================

st.markdown(page_section("🏆 Top Performers", "Municípios e regiões com melhor desempenho", "🏆", "warning"), unsafe_allow_html=True)

if mega_tabela is not None:
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🥇 Top 10 Municípios por POIs")
        top_municipios = mega_tabela[mega_tabela['total_atividades'] > 0].nlargest(10, 'total_pois_excel')[
            ['municipio', 'ano', 'total_pois_excel', 'total_hectares_mapeados']
        ].copy()
        top_municipios.columns = ['Município', 'Ano', 'POIs', 'Hectares']
        
        # Gráfico de barras
        fig_mun = px.bar(
            top_municipios,
            x='POIs',
            y='Município',
            color='Ano',
            orientation='h',
            title=''
        )
        fig_mun.update_layout(height=400, showlegend=True)
        st.plotly_chart(fig_mun, use_container_width=True)
        st.caption("Ranking dos 10 municípios com maior número de POIs; cores seguem o tema global.")
    
    with col2:
        st.markdown("### 🏥 Top 10 URS por POIs")
        if 'urs' in mega_tabela.columns:
            top_urs = mega_tabela[mega_tabela['total_atividades'] > 0].groupby('urs').agg({
                'total_pois_excel': 'sum',
                'codigo_ibge': 'nunique'
            }).nlargest(10, 'total_pois_excel').reset_index()
            top_urs.columns = ['URS', 'POIs', 'Municípios']
            
            # Gráfico de barras (usar palette do tema)
            fig_urs = px.bar(
                top_urs,
                x='POIs',
                y='URS',
                orientation='h',
                title='',
                color='URS'
            )
            fig_urs.update_layout(height=400, showlegend=False)
            st.plotly_chart(fig_urs, use_container_width=True)
            st.caption("Ranking das 10 URS por POIs acumulados; cores seguem o tema global.")

st.markdown("---")

# ============================================================================
# ANÁLISE DE DEPÓSITOS
# ============================================================================

st.markdown(page_section("🪣 Análise de Tipos de Depósitos", "Distribuição e efetividade por categoria", "🪣", "info"), unsafe_allow_html=True)

if mega_tabela is not None:
    # Grupos de depósitos
    grupos = {
        'A - Armazenamento de água': '#1f77b4',
        'B - Pequenos depósitos móveis': '#ff7f0e',
        'C - Depósitos fixos': '#2ca02c',
        'D - Depósitos passíveis de remoção': '#d62728'
    }
    
    depositos_data = []
    for grupo, cor in grupos.items():
        if grupo in mega_tabela.columns:
            total = mega_tabela[grupo].sum()
            depositos_data.append({'Tipo': grupo.split(' - ')[1], 'Total': total, 'Cor': cor})
    
    if depositos_data:
        df_depositos = pd.DataFrame(depositos_data)
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            # Gráfico de pizza
            fig_pizza = go.Figure(data=[go.Pie(
                labels=df_depositos['Tipo'],
                values=df_depositos['Total'],
                marker=dict(colors=df_depositos['Cor']),
                hole=0.4,
                textinfo='label+percent',
                textposition='outside'
            )])
            fig_pizza.update_layout(
                title='Distribuição por Tipo de Depósito',
                height=400,
                showlegend=True
            )
            st.plotly_chart(fig_pizza, use_container_width=True)
            st.caption("Distribuição de tipos de depósitos (donut). As porcentagens indicam a participação relativa de cada grupo.")
        
        with col2:
            # Métricas de ações (Design System)
            st.markdown("### ✅ Ações Realizadas")

            acoes = {
                'removido_solucionado': ('🗑️', 'Removidos/Solucionados', 'success'),
                'Tratado': ('💊', 'Tratados', 'primary'),
                'descaracterizado': ('🔧', 'Descaracterizados', 'warning'),
                'morador_ausente': ('🚪', 'Morador Ausente', 'warning'),
                'nao_Autorizado': ('⛔', 'Não Autorizados', 'error')
            }

            cols_cards = st.columns(2)
            idx = 0
            for col_name, (icon, label, variant) in acoes.items():
                if col_name in mega_tabela.columns:
                    total = int(mega_tabela[col_name].sum())
                    with cols_cards[idx % 2]:
                        st.markdown(
                            create_metric_card_modern(
                                icon=icon,
                                title=label,
                                value=f"{total:,}",
                                change=None,
                                color=variant,
                                size="default",
                                tooltip=f"Total de {label}"
                            ),
                            unsafe_allow_html=True
                        )
                    idx += 1

st.markdown("---")

# ============================================================================
# STATUS DAS CAMADAS
# ============================================================================

st.markdown(page_section("🏗️ Status das Camadas (Medallion Architecture)", "Visão operacional das camadas Bronze/Silver/Gold", "🏗️", "primary"), unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)

with col1:
    bronze_ok = bool(validacao_estrutura and validacao_estrutura.get('bronze'))
    st.markdown(f"""
    <div class="metric-card {'success' if bronze_ok else 'error'}">
      <div class="metric-card-icon">🥉</div>
      <div class="metric-card-value">BRONZE</div>
      <div class="metric-card-label">Dados Brutos</div>
      <div class="metric-card-change {'positive' if bronze_ok else 'negative'}">
        {'✅ Operacional' if bronze_ok else '❌ Não disponível'}
      </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    silver_ok = bool(validacao_estrutura and validacao_estrutura.get('silver'))
    st.markdown(f"""
    <div class="metric-card {'success' if silver_ok else 'error'}">
      <div class="metric-card-icon">🥈</div>
      <div class="metric-card-value">SILVER</div>
      <div class="metric-card-label">Dados Limpos</div>
      <div class="metric-card-change {'positive' if silver_ok else 'negative'}">
        {'✅ Operacional' if silver_ok else '❌ Não disponível'}
      </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    gold_ok = bool(validacao_estrutura and validacao_estrutura.get('gold'))
    st.markdown(f"""
    <div class="metric-card {'success' if gold_ok else 'error'}">
      <div class="metric-card-icon">🥇</div>
      <div class="metric-card-value">GOLD</div>
      <div class="metric-card-label">Dados Analíticos</div>
      <div class="metric-card-change {'positive' if gold_ok else 'negative'}">
        {'✅ Operacional' if gold_ok else '❌ Não disponível'}
      </div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# ============================================================================
# VALIDAÇÕES DE QUALIDADE
# ============================================================================

st.markdown(page_section("✅ Validações de Qualidade", "Score, checks e conformidade com métricas oficiais", "✅", "success"), unsafe_allow_html=True)

if relatorio_qualidade:
    # Gauge chart do score
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=relatorio_qualidade.get('score_qualidade_geral', 0),
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Score de Qualidade Geral"},
        delta={'reference': 90},
        gauge={
            'axis': {'range': [None, 100]},
            'bar': {'color': "#1f77b4"},
            'steps': [
                {'range': [0, 50], 'color': "#ffcccc"},
                {'range': [50, 75], 'color': "#fff3cd"},
                {'range': [75, 90], 'color': "#d4edda"},
                {'range': [90, 100], 'color': "#28a745"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 90
            }
        }
    ))
    
    fig.update_layout(height=300)
    st.plotly_chart(fig, use_container_width=True)
    
    # Detalhes das validações
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### ✅ Checks Aprovados")
        checks_passed = relatorio_qualidade.get('checks_passed', 0)
        checks_total = relatorio_qualidade.get('checks_total', 0)
        st.success(f"{checks_passed} de {checks_total} checks")
        
        # Progresso
        progress = checks_passed / checks_total if checks_total > 0 else 0
        st.progress(progress)
    
    with col2:
        st.markdown("### 📊 Métricas Oficiais")
        metricas = relatorio_qualidade.get('metricas_oficiais', {})
        if metricas:
            dentro_tolerancia = metricas.get('dentro_tolerancia', False)
            if dentro_tolerancia:
                st.success("✅ Dentro da tolerância")
            else:
                st.warning("⚠️ Fora da tolerância")
            
            diferenca = metricas.get('diferenca_percentual', 0)
            st.info(f"Diferença: {diferenca:.2f}%")

else:
    st.warning("⚠️ Relatório de qualidade não disponível")

st.markdown("---")

# ============================================================================
# MEGA TABELA - VISUALIZAÇÃO COMPLETA
# ============================================================================

st.markdown(page_section("📊 MEGA TABELA Analítica", "Visualização completa e interativa de todos os dados", "📊", "primary"), unsafe_allow_html=True)

if mega_tabela is not None:
    # Estatísticas principais com componentes modernos
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(create_metric_card_modern(
            icon="📝",
            title="Total de Registros",
            value=f"{len(mega_tabela):,}",
            change=None,
            color="primary",
            size="default",
            tooltip="Total de registros na mega_tabela_analitica"
        ), unsafe_allow_html=True)
    
    with col2:
        st.markdown(create_metric_card_modern(
            icon="📋",
            title="Colunas",
            value=f"{len(mega_tabela.columns)}",
            change=None,
            color="info",
            size="default",
            tooltip="Número de colunas disponíveis na mega tabela"
        ), unsafe_allow_html=True)
    
    with col3:
        municipios = mega_tabela['codigo_ibge'].nunique() if 'codigo_ibge' in mega_tabela.columns else 0
        st.markdown(create_metric_card_modern(
            icon="🏙️",
            title="Municípios",
            value=f"{municipios}",
            change=None,
            color="success",
            size="default",
            tooltip="Quantidade de municípios distintos com registros"
        ), unsafe_allow_html=True)
    
    with col4:
        com_atividades = (mega_tabela['total_atividades'] > 0).sum() if 'total_atividades' in mega_tabela.columns else 0
        st.markdown(create_metric_card_modern(
            icon="✅",
            title="Com Atividades",
            value=f"{com_atividades:,}",
            change=(com_atividades/len(mega_tabela)*100),
            color="warning",
            size="default",
            tooltip="Quantidade de registros com atividades (>0)"
        ), unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Filtros interativos (padronizados)
    st.markdown("### 🔍 Filtros Interativos")
    ano_selecionado, urs_selecionada, filtro_atividades, registros_por_pagina = filter_bar_mega(mega_tabela)
    
    # Aplicar filtros
    df_filtrado = mega_tabela.copy()
    
    if ano_selecionado != 'Todos':
        df_filtrado = df_filtrado[df_filtrado['ano'] == ano_selecionado]
    
    if urs_selecionada != 'Todas':
        df_filtrado = df_filtrado[df_filtrado['urs'] == urs_selecionada]
    
    if filtro_atividades == 'Com Atividades':
        df_filtrado = df_filtrado[df_filtrado['total_atividades'] > 0]
    elif filtro_atividades == 'Sem Atividades':
        df_filtrado = df_filtrado[df_filtrado['total_atividades'] == 0]
    
    # Alertas contextuais
    com_atividades_filtrado = (df_filtrado['total_atividades'] > 0).sum()
    sem_atividades_filtrado = (df_filtrado['total_atividades'] == 0).sum()
    
    # Informações do filtro com contexto
    col_info1, col_info2 = st.columns([2, 1])
    
    with col_info1:
        st.markdown(
            create_modern_alert(
                f"📊 Exibindo {len(df_filtrado):,} de {len(mega_tabela):,} registros",
                type="info",
                icon="ℹ️"
            ),
            unsafe_allow_html=True
        )
    
    with col_info2:
        if com_atividades_filtrado == 0 and ano_selecionado == 2023:
            st.markdown(
                create_modern_alert("2023: Sem atividades TechDengue", type="warning", icon="⚠️"),
                unsafe_allow_html=True
            )
        elif com_atividades_filtrado == 0:
            st.markdown(
                create_modern_alert("Nenhum registro com atividades", type="warning", icon="⚠️"),
                unsafe_allow_html=True
            )
        else:
            st.markdown(
                create_modern_alert(f"{com_atividades_filtrado:,} com atividades", type="success", icon="✅"),
                unsafe_allow_html=True
            )
    
    # Resumo por ano
    if ano_selecionado == 'Todos':
        st.markdown(page_section("📅 Distribuição por Ano", "Resumo por ano com atividades, POIs e hectares", "📅", "success"), unsafe_allow_html=True)
        resumo_anos = mega_tabela.groupby('ano').agg({
            'total_atividades': 'sum',
            'total_pois_excel': 'sum',
            'total_hectares_mapeados': 'sum',
            'codigo_ibge': 'count'
        }).reset_index()
        resumo_anos.columns = ['Ano', 'Atividades', 'POIs', 'Hectares', 'Municípios']
        
        c1, c2, c3 = st.columns(3)
        cols = [c1, c2, c3]
        
        # Render DS year cards
        for idx, row in resumo_anos.iterrows():
            with cols[idx % 3]:
                ano = int(row['Ano'])
                atividades = int(row['Atividades'])
                pois = int(row['POIs'])
                municipios = int(row['Municípios'])
                
                # Crescimento simples em relação ao ano anterior, se existir
                crescimento = None
                if idx > 0 and resumo_anos.loc[idx-1, 'Atividades'] > 0 and atividades > 0:
                    prev = resumo_anos.loc[idx-1, 'Atividades']
                    crescimento = ((atividades - prev) / prev) * 100
                
                st.markdown(create_year_card(ano, atividades, pois, municipios, crescimento), unsafe_allow_html=True)
    
    # Empty state para filtros sem resultado (v5.0.0)
    if len(df_filtrado) == 0:
        st.markdown(
            create_empty_state(
                icon="🔍",
                title="Nenhum registro encontrado",
                description="Não há registros que correspondam aos filtros selecionados. Tente ajustar os critérios de busca.",
                action_label="Limpar Filtros",
                action_onclick="window.location.reload()"
            ),
            unsafe_allow_html=True
        )
    else:
        # Paginação
        total_paginas = (len(df_filtrado) - 1) // registros_por_pagina + 1
        
        if total_paginas > 1:
            pagina_atual = st.slider(
                "Página",
                min_value=1,
                max_value=total_paginas,
                value=1,
                help=f"Total de {total_paginas} páginas"
            )
        else:
            pagina_atual = 1
        
        # Calcular índices
        inicio = (pagina_atual - 1) * registros_por_pagina
        fim = min(inicio + registros_por_pagina, len(df_filtrado))
        
        # Exibir dados
        st.markdown(f"### 📋 Dados (Página {pagina_atual} de {total_paginas})")
        
        # Selecionar colunas para exibir
        colunas_principais = [
            'codigo_ibge', 'municipio', 'ano', 'urs',
            'populacao', 'area_ha', 'total_atividades',
            'total_pois_excel', 'total_devolutivas',
            'total_hectares_mapeados', 'taxa_conversao_devolutivas'
        ]
        
        colunas_exibir = [col for col in colunas_principais if col in df_filtrado.columns]
        
        # Opção para ver todas as colunas
        ver_todas_colunas = st.checkbox("🔍 Ver todas as colunas", value=False)
        
        if ver_todas_colunas:
            df_exibir = df_filtrado.iloc[inicio:fim]
        else:
            df_exibir = df_filtrado[colunas_exibir].iloc[inicio:fim]
        
        # Estilizar e exibir
        st.dataframe(
            df_exibir,
            use_container_width=True,
            height=600
        )
        
        # Estatísticas dos dados filtrados
        st.markdown("### 📊 Estatísticas dos Dados Filtrados")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_pois = df_filtrado['total_pois_excel'].sum() if 'total_pois_excel' in df_filtrado.columns else 0
            st.metric("🎯 Total de POIs", f"{total_pois:,}")
        
        with col2:
            total_hectares = df_filtrado['total_hectares_mapeados'].sum() if 'total_hectares_mapeados' in df_filtrado.columns else 0
            st.metric("📏 Total de Hectares", f"{total_hectares:,.2f}")
        
        with col3:
            total_devolutivas = df_filtrado['total_devolutivas'].sum() if 'total_devolutivas' in df_filtrado.columns else 0
            st.metric("📝 Total de Devolutivas", f"{total_devolutivas:,}")
        
        with col4:
            taxa_media = df_filtrado['taxa_conversao_devolutivas'].mean() if 'taxa_conversao_devolutivas' in df_filtrado.columns else 0
            st.metric("📈 Taxa Conversão Média", f"{taxa_media:.1f}%")
        
        # Botões de ação
        col1, col2, col3 = st.columns(3)
        
        with col1:
            # Download dados filtrados
            csv_filtrado = df_filtrado.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download Dados Filtrados (CSV)",
                data=csv_filtrado,
                file_name=f"mega_tabela_filtrada_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv",
                use_container_width=True
            )
        
        with col2:
            # Download todos os dados
            csv_completo = mega_tabela.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download Completo (CSV)",
                data=csv_completo,
                file_name=f"mega_tabela_completa_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv",
                use_container_width=True
            )
        
        with col3:
            # Download Excel
            from io import BytesIO
            buffer = BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df_filtrado.to_excel(writer, index=False, sheet_name='Dados')
            
            st.download_button(
                label="📥 Download Excel (XLSX)",
                data=buffer.getvalue(),
                file_name=f"mega_tabela_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                use_container_width=True
            )

else:
    # Empty/Skeleton state quando não há dados
    st.error("❌ MEGA TABELA não disponível. Execute o pipeline ETL primeiro.")
    st.markdown('<div class="skeleton" style="height: 16px; width: 40%; margin: 12px 0;"></div>', unsafe_allow_html=True)
    st.markdown('<div class="skeleton" style="height: 200px; width: 100%; margin: 8px 0;"></div>', unsafe_allow_html=True)
    st.markdown('<div class="skeleton" style="height: 200px; width: 100%; margin: 8px 0;"></div>', unsafe_allow_html=True)

st.markdown("---")

# ============================================================================
# AÇÕES RÁPIDAS
# ============================================================================

st.markdown(page_section("⚡ Ações Rápidas", "Atalhos operacionais", "⚡", "primary"), unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🔄 Sincronizar Dados", use_container_width=True):
        with st.spinner("Sincronizando..."):
            # Aqui você pode chamar o atualizador
            st.info("Funcionalidade em desenvolvimento")

with col2:
    if st.button("✅ Validar Qualidade", use_container_width=True):
        with st.spinner("Validando..."):
            st.info("Funcionalidade em desenvolvimento")

with col3:
    if st.button("📊 Gerar Relatório", use_container_width=True):
        with st.spinner("Gerando..."):
            st.info("Funcionalidade em desenvolvimento")

# ============================================================================
# FOOTER
# ============================================================================

st.markdown("---")
st.markdown('</div>', unsafe_allow_html=True)

st.markdown("""
<div style='text-align: center; color: #666; padding: 2rem 0;'>
    <p><strong>TechDengue - Sistema de Gestão de Dados</strong></p>
    <p>Versão 1.0.0 | Desenvolvido por Cascade AI | 30 de Outubro de 2025</p>
</div>
""", unsafe_allow_html=True)
