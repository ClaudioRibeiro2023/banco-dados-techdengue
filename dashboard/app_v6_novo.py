"""
TechDengue Analytics v6.0 - REDESIGN TOTAL
Dashboard Executivo Moderno com Dark Theme
"""
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================
st.set_page_config(
    page_title="TechDengue v6.0",
    page_icon="🦟",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ============================================================================
# CSS - DARK THEME ULTRA MODERNO
# ============================================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

* {
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.main {
    background: #0a0e27;
    background-image: 
        radial-gradient(at 0% 0%, rgba(96, 165, 250, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(167, 139, 246, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(244, 114, 182, 0.15) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%);
    padding: 2rem 3rem !important;
    min-height: 100vh;
}

.header-modern {
    background: linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,246,0.15));
    backdrop-filter: blur(30px);
    border-radius: 28px;
    padding: 3rem 3rem;
    margin-bottom: 3rem;
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 25px 80px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1);
    position: relative;
    overflow: hidden;
}

.header-modern::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #60a5fa, #a78bfa, #f472b6, transparent);
    animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.header-modern h1 {
    font-size: 3.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 40px rgba(96, 165, 250, 0.5);
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.kpi-card {
    background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(51,65,85,0.9));
    backdrop-filter: blur(30px);
    border-radius: 24px;
    padding: 2.5rem;
    border: 2px solid rgba(255,255,255,0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.kpi-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
    opacity: 0;
    transition: opacity 0.4s;
}

.kpi-card:hover::before {
    opacity: 1;
}

.kpi-card::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.4s;
}

.kpi-card:hover::after {
    opacity: 1;
}

.kpi-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 30px 80px rgba(96,165,250,0.4), 0 0 40px rgba(167,139,246,0.3);
    border-color: rgba(96,165,250,0.4);
}

.kpi-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 4px 12px rgba(96,165,250,0.6));
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.kpi-value {
    font-size: 3rem;
    font-weight: 900;
    color: #fff;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 20px rgba(255,255,255,0.3);
}

.kpi-label {
    color: rgba(255,255,255,0.7);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    font-weight: 600;
}

.chart-box {
    background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(51,65,85,0.9));
    backdrop-filter: blur(30px);
    border-radius: 24px;
    padding: 2.5rem;
    margin: 1.5rem 0;
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
}

.chart-box:hover {
    border-color: rgba(96,165,250,0.3);
    box-shadow: 0 25px 70px rgba(96,165,250,0.2);
}

.chart-title {
    color: #fff;
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-shadow: 0 2px 10px rgba(255,255,255,0.2);
}

/* Ocultar elementos Streamlit */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.stDeployButton {display: none;}

/* Scrollbar customizada */
::-webkit-scrollbar {width: 12px; height: 12px;}
::-webkit-scrollbar-track {
    background: rgba(30,41,59,0.5);
    border-radius: 6px;
}
::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border-radius: 6px;
    border: 2px solid rgba(30,41,59,0.5);
}
::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #a78bfa, #f472b6);
}

/* Animação de entrada */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.kpi-grid, .chart-box, .header-modern {
    animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Brilho nos gráficos */
.js-plotly-plot {
    filter: drop-shadow(0 4px 20px rgba(96,165,250,0.1));
}
</style>
""", unsafe_allow_html=True)

# ============================================================================
# DADOS
# ============================================================================
BASE_DIR = Path(__file__).parent.parent
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

@st.cache_data
def load_data():
    arquivo = GOLD_DIR / "mega_tabela_analitica.parquet"
    if arquivo.exists():
        return pd.read_parquet(arquivo)
    return None

@st.cache_data
def load_quality():
    arquivo = METADATA_DIR / "relatorio_qualidade_completo.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

df = load_data()
quality = load_quality()

# ============================================================================
# HEADER
# ============================================================================
st.markdown("""
<div class="header-modern">
    <h1>🦟 TechDengue Analytics v6.0</h1>
    <p style="color: rgba(255,255,255,0.7); font-size: 1.25rem;">Dashboard Executivo | Análise Inteligente</p>
</div>
""", unsafe_allow_html=True)

if df is None or len(df) == 0:
    st.error("⚠️ Dados não disponíveis")
    st.stop()

# ============================================================================
# KPIS
# ============================================================================
total_pois = int(df['total_pois_excel'].sum()) if 'total_pois_excel' in df.columns else 0
total_municipios = df['codigo_ibge'].nunique() if 'codigo_ibge' in df.columns else 0
total_hectares = float(df['total_hectares_mapeados'].sum()) if 'total_hectares_mapeados' in df.columns else 0
total_atividades = int(df['total_atividades'].sum()) if 'total_atividades' in df.columns else 0

st.markdown('<div class="kpi-grid">', unsafe_allow_html=True)
st.markdown(f"""
<div class="kpi-card">
    <div class="kpi-icon">📍</div>
    <div class="kpi-value">{total_pois:,}</div>
    <div class="kpi-label">POIs Identificados</div>
</div>
""", unsafe_allow_html=True)

st.markdown(f"""
<div class="kpi-card">
    <div class="kpi-icon">🏙️</div>
    <div class="kpi-value">{total_municipios}</div>
    <div class="kpi-label">Municípios</div>
</div>
""", unsafe_allow_html=True)

st.markdown(f"""
<div class="kpi-card">
    <div class="kpi-icon">📏</div>
    <div class="kpi-value">{total_hectares/1000:.1f}K</div>
    <div class="kpi-label">Hectares</div>
</div>
""", unsafe_allow_html=True)

st.markdown(f"""
<div class="kpi-card">
    <div class="kpi-icon">⚡</div>
    <div class="kpi-value">{total_atividades:,}</div>
    <div class="kpi-label">Atividades</div>
</div>
""", unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ============================================================================
# GRÁFICOS
# ============================================================================
col1, col2 = st.columns(2)

# TREEMAP
with col1:
    st.markdown('<div class="chart-box">', unsafe_allow_html=True)
    st.markdown('<div class="chart-title">🗺️ Distribuição por URS</div>', unsafe_allow_html=True)
    
    if 'urs' in df.columns:
        urs_data = df.groupby('urs')['total_pois_excel'].sum().reset_index()
        urs_data.columns = ['URS', 'POIs']
        
        fig = px.treemap(urs_data, path=['URS'], values='POIs',
                        color='POIs', color_continuous_scale='viridis')
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            margin=dict(t=0,l=0,r=0,b=0),
            height=400
        )
        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    
    st.markdown('</div>', unsafe_allow_html=True)

# SUNBURST
with col2:
    st.markdown('<div class="chart-box">', unsafe_allow_html=True)
    st.markdown('<div class="chart-title">⏳ Evolução Temporal</div>', unsafe_allow_html=True)
    
    if 'ano' in df.columns and 'urs' in df.columns:
        temp = df.groupby(['ano', 'urs'])['total_pois_excel'].sum().reset_index()
        temp.columns = ['Ano', 'URS', 'POIs']
        temp['Ano'] = temp['Ano'].astype(str)
        
        fig = px.sunburst(temp, path=['Ano', 'URS'], values='POIs',
                         color='POIs', color_continuous_scale='plasma')
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            margin=dict(t=0,l=0,r=0,b=0),
            height=400
        )
        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    
    st.markdown('</div>', unsafe_allow_html=True)

# SCATTER 3D INTERATIVO
st.markdown('<div class="chart-box">', unsafe_allow_html=True)
st.markdown('<div class="chart-title">🌐 Análise Multidimensional Interativa</div>', unsafe_allow_html=True)

# Agrupar por município (soma por município, não por ano)
scatter_data = df.groupby('municipio').agg({
    'total_pois_excel': 'sum',
    'total_atividades': 'sum',
    'total_hectares_mapeados': 'sum',
    'urs': 'first'  # pegar primeira URS
}).reset_index()

# Top 20 para scatter
scatter_top = scatter_data.nlargest(20, 'total_pois_excel')

fig = px.scatter_3d(
    scatter_top,
    x='total_pois_excel',
    y='total_atividades',
    z='total_hectares_mapeados',
    color='urs',
    size='total_pois_excel',
    hover_name='municipio',
    labels={
        'total_pois_excel': 'POIs',
        'total_atividades': 'Atividades',
        'total_hectares_mapeados': 'Hectares'
    },
    color_discrete_sequence=px.colors.qualitative.Vivid
)
fig.update_layout(
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    font=dict(color='white'),
    scene=dict(
        xaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='rgba(255,255,255,0.1)'),
        yaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='rgba(255,255,255,0.1)'),
        zaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='rgba(255,255,255,0.1)')
    ),
    height=500
)
st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': True})
st.markdown('</div>', unsafe_allow_html=True)

# GAUGE
col3, col4 = st.columns([1, 2])

with col3:
    st.markdown('<div class="chart-box">', unsafe_allow_html=True)
    st.markdown('<div class="chart-title">✅ Qualidade</div>', unsafe_allow_html=True)
    
    score = quality.get('score_qualidade_geral', 0) if quality else 0
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=score,
        gauge={
            'axis': {'range': [0, 100]},
            'bar': {'color': "#60a5fa"},
            'steps': [
                {'range': [0, 50], 'color': 'rgba(239,68,68,0.3)'},
                {'range': [50, 75], 'color': 'rgba(251,191,36,0.3)'},
                {'range': [75, 100], 'color': 'rgba(16,185,129,0.3)'}
            ]
        }
    ))
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='white'),
        height=300
    )
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    st.markdown('</div>', unsafe_allow_html=True)

# INDICADORES RADAR
with col4:
    st.markdown('<div class="chart-box">', unsafe_allow_html=True)
    st.markdown('<div class="chart-title">📊 Performance Comparativa</div>', unsafe_allow_html=True)
    
    # Top 5 municípios agrupados
    top5_grouped = df.groupby('municipio').agg({
        'total_pois_excel': 'sum',
        'total_atividades': 'sum',
        'total_hectares_mapeados': 'sum',
        'total_devolutivas': 'sum'
    }).nlargest(5, 'total_pois_excel')
    
    # Normalizar para radar
    top5_norm = (top5_grouped - top5_grouped.min()) / (top5_grouped.max() - top5_grouped.min())
    
    fig = go.Figure()
    
    for mun in top5_norm.index[:3]:  # Top 3 para não poluir
        fig.add_trace(go.Scatterpolar(
            r=top5_norm.loc[mun].values,
            theta=['POIs', 'Atividades', 'Hectares', 'Devolutivas'],
            fill='toself',
            name=mun
        ))
    
    fig.update_layout(
        polar=dict(
            bgcolor='rgba(0,0,0,0)',
            radialaxis=dict(
                visible=True,
                range=[0, 1],
                gridcolor='rgba(255,255,255,0.2)'
            ),
            angularaxis=dict(gridcolor='rgba(255,255,255,0.2)')
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color='white', size=10),
        height=300,
        showlegend=True,
        legend=dict(font=dict(size=9))
    )
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    st.markdown('</div>', unsafe_allow_html=True)

st.markdown("""
<div style="text-align:center; color: rgba(255,255,255,0.5); margin-top: 3rem; padding: 1rem;">
    <p>TechDengue Analytics v6.0 | Redesign Completo 2025</p>
</div>
""", unsafe_allow_html=True)
