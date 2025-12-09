"""
TechDengue - MONITOR DE QUALIDADE DE DADOS
Data Quality & Database Health Dashboard
Sistema de Monitoramento e Observabilidade de Dados
"""
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from pathlib import Path
import json
from datetime import datetime
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================
st.set_page_config(
    page_title="Monitor de Qualidade | TechDengue",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ============================================================================
# CSS - DATA QUALITY MONITOR THEME
# ============================================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;900&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.main {
    background: #0d1117;
    padding: 1.5rem !important;
    font-family: 'Inter', sans-serif;
}

/* Header Monitor */
.monitor-header {
    background: linear-gradient(135deg, #161b22, #1c2128);
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.monitor-title {
    font-size: 1.75rem;
    font-weight: 900;
    color: #58a6ff;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.live-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #7d8590;
}

.live-dot {
    width: 10px;
    height: 10px;
    background: #3fb950;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
}

/* Status Cards Grid */
.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.status-card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s;
}

.status-card:hover {
    border-color: #58a6ff;
    transform: translateY(-2px);
}

.status-card.healthy {
    border-left: 3px solid #3fb950;
}

.status-card.warning {
    border-left: 3px solid #d29922;
}

.status-card.error {
    border-left: 3px solid #f85149;
}

.status-label {
    color: #7d8590;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.status-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #c9d1d9;
    margin-bottom: 0.25rem;
    font-family: 'JetBrains Mono', monospace;
}

.status-metric {
    font-size: 0.875rem;
    color: #7d8590;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;
}

.badge-success {
    background: rgba(63, 185, 80, 0.15);
    color: #3fb950;
}

.badge-warning {
    background: rgba(210, 153, 34, 0.15);
    color: #d29922;
}

.badge-error {
    background: rgba(248, 81, 73, 0.15);
    color: #f85149;
}

/* Monitor Box */
.monitor-box {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.monitor-box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #30363d;
}

.monitor-box-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #c9d1d9;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.monitor-box-action {
    font-size: 0.875rem;
    color: #58a6ff;
    cursor: pointer;
}

/* Table Style */
.data-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.875rem;
}

.data-table th {
    background: #0d1117;
    color: #7d8590;
    font-weight: 600;
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #30363d;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

.data-table td {
    padding: 0.875rem 0.75rem;
    border-bottom: 1px solid #30363d;
    color: #c9d1d9;
    font-family: 'JetBrains Mono', monospace;
}

.data-table tr:hover td {
    background: rgba(88, 166, 255, 0.05);
}

/* Log Entry */
.log-entry {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8125rem;
}

.log-timestamp {
    color: #7d8590;
    margin-right: 0.75rem;
}

.log-level {
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    margin-right: 0.75rem;
}

.log-level.info {
    background: rgba(88, 166, 255, 0.2);
    color: #58a6ff;
}

.log-level.success {
    background: rgba(63, 185, 80, 0.2);
    color: #3fb950;
}

.log-level.warning {
    background: rgba(210, 153, 34, 0.2);
    color: #d29922;
}

.log-level.error {
    background: rgba(248, 81, 73, 0.2);
    color: #f85149;
}

/* Chart Container */
.chart-container {
    background: #0d1117;
    border-radius: 8px;
    padding: 1rem;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-track {
    background: #161b22;
}

::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: #484f58;
}

/* Hide Streamlit Elements */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.stDeployButton {display: none;}
</style>
""", unsafe_allow_html=True)

# ============================================================================
# FUNÇÕES DE CARREGAMENTO
# ============================================================================
BASE_DIR = Path(__file__).parent.parent
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
BRONZE_DIR = BASE_DIR / "data_lake" / "bronze"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"

@st.cache_data(ttl=60)
def load_quality_report():
    """Carrega relatório de qualidade"""
    arquivo = METADATA_DIR / "relatorio_qualidade_completo.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=60)
def load_validation_structure():
    """Carrega validação de estrutura"""
    arquivo = METADATA_DIR / "validacao_estrutura.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=60)
def load_update_history():
    """Carrega histórico de atualizações"""
    arquivo = METADATA_DIR / "historico_atualizacoes.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'atualizacoes': []}

@st.cache_data(ttl=60)
def check_database_status():
    """Verifica status do banco de dados"""
    try:
        from src.database import get_database
        db = get_database()
        if db.test_connection():
            return {'status': 'online', 'message': 'Conectado'}
        return {'status': 'offline', 'message': 'Desconectado'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@st.cache_data(ttl=60)
def get_layer_status():
    """Verifica status das camadas"""
    layers = {
        'bronze': BRONZE_DIR.exists(),
        'silver': SILVER_DIR.exists(),
        'gold': GOLD_DIR.exists()
    }
    
    counts = {}
    for layer, exists in layers.items():
        if exists:
            path = BASE_DIR / "data_lake" / layer
            counts[layer] = len(list(path.glob('*.parquet'))) + len(list(path.glob('*.csv')))
        else:
            counts[layer] = 0
    
    return layers, counts

# ============================================================================
# HEADER
# ============================================================================
now = datetime.now()
st.markdown(f"""
<div class="monitor-header">
    <div class="monitor-title">
        🔍 Monitor de Qualidade de Dados
    </div>
    <div class="live-indicator">
        <div class="live-dot"></div>
        <span>Live • Atualizado {now.strftime('%H:%M:%S')}</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ============================================================================
# CARREGAR DADOS
# ============================================================================
quality = load_quality_report()
validation = load_validation_structure()
history = load_update_history()
db_status = check_database_status()
layers_exist, layers_count = get_layer_status()

# ============================================================================
# STATUS CARDS - OVERVIEW
# ============================================================================
st.markdown('<div class="status-grid">', unsafe_allow_html=True)

# Database Status
db_class = 'healthy' if db_status['status'] == 'online' else 'error'
st.markdown(f"""
<div class="status-card {db_class}">
    <div class="status-label">🗄️ Database</div>
    <div class="status-value">{db_status['status'].upper()}</div>
    <div class="status-metric">{db_status['message']}</div>
    <div class="status-badge badge-{'success' if db_status['status'] == 'online' else 'error'}">
        {'✓ Conectado' if db_status['status'] == 'online' else '✗ Erro'}
    </div>
</div>
""", unsafe_allow_html=True)

# Quality Score
score = quality.get('score_qualidade_geral', 0) if quality else 0
score_class = 'healthy' if score >= 90 else 'warning' if score >= 70 else 'error'
st.markdown(f"""
<div class="status-card {score_class}">
    <div class="status-label">✅ Quality Score</div>
    <div class="status-value">{score:.1f}%</div>
    <div class="status-metric">Score Geral</div>
    <div class="status-badge badge-{'success' if score >= 90 else 'warning' if score >= 70 else 'error'}">
        {'Excelente' if score >= 90 else 'Bom' if score >= 70 else 'Atenção'}
    </div>
</div>
""", unsafe_allow_html=True)

# Checks Status
if quality:
    checks_passed = quality.get('checks_passed', 0)
    checks_total = quality.get('checks_total', 0)
    checks_pct = (checks_passed / checks_total * 100) if checks_total > 0 else 0
    checks_class = 'healthy' if checks_pct >= 90 else 'warning' if checks_pct >= 70 else 'error'
    
    st.markdown(f"""
    <div class="status-card {checks_class}">
        <div class="status-label">🧪 Validações</div>
        <div class="status-value">{checks_passed}/{checks_total}</div>
        <div class="status-metric">{checks_pct:.1f}% Aprovado</div>
        <div class="status-badge badge-{'success' if checks_pct >= 90 else 'warning' if checks_pct >= 70 else 'error'}">
            {checks_passed} Passaram
        </div>
    </div>
    """, unsafe_allow_html=True)

# Gold Layer
gold_files = layers_count.get('gold', 0)
gold_class = 'healthy' if gold_files > 0 else 'warning'
st.markdown(f"""
<div class="status-card {gold_class}">
    <div class="status-label">🥇 Gold Layer</div>
    <div class="status-value">{gold_files}</div>
    <div class="status-metric">Arquivos</div>
    <div class="status-badge badge-{'success' if gold_files > 0 else 'warning'}">
        {'Disponível' if gold_files > 0 else 'Vazio'}
    </div>
</div>
""", unsafe_allow_html=True)

# Last Update
if history['atualizacoes']:
    last_update = history['atualizacoes'][-1]
    if 'inicio' in last_update:
        last_time = datetime.fromisoformat(last_update['inicio'])
        time_diff = (now - last_time).total_seconds() / 3600  # horas
        update_class = 'healthy' if time_diff < 24 else 'warning' if time_diff < 48 else 'error'
        
        st.markdown(f"""
        <div class="status-card {update_class}">
            <div class="status-label">⏰ Última Atualização</div>
            <div class="status-value">{int(time_diff)}h</div>
            <div class="status-metric">{last_time.strftime('%d/%m %H:%M')}</div>
            <div class="status-badge badge-{'success' if time_diff < 24 else 'warning' if time_diff < 48 else 'error'}">
                {'Recente' if time_diff < 24 else 'Antigas' if time_diff < 48 else 'Muito Antiga'}
            </div>
        </div>
        """, unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# ============================================================================
# CHARTS - 2 COLUMNS
# ============================================================================
col1, col2 = st.columns(2)

# QUALITY SCORE GAUGE
with col1:
    st.markdown("""
    <div class="monitor-box">
        <div class="monitor-box-header">
            <div class="monitor-box-title">📊 Score de Qualidade</div>
        </div>
        <div class="chart-container">
    """, unsafe_allow_html=True)
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=score,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Qualidade Geral (%)", 'font': {'color': '#c9d1d9', 'size': 16}},
        delta={'reference': 90, 'increasing': {'color': "#3fb950"}},
        gauge={
            'axis': {'range': [None, 100], 'tickcolor': "#7d8590"},
            'bar': {'color': "#58a6ff"},
            'bgcolor': "#161b22",
            'borderwidth': 2,
            'bordercolor': "#30363d",
            'steps': [
                {'range': [0, 50], 'color': 'rgba(248, 81, 73, 0.2)'},
                {'range': [50, 70], 'color': 'rgba(210, 153, 34, 0.2)'},
                {'range': [70, 90], 'color': 'rgba(88, 166, 255, 0.2)'},
                {'range': [90, 100], 'color': 'rgba(63, 185, 80, 0.2)'}
            ],
            'threshold': {
                'line': {'color': "#3fb950", 'width': 4},
                'thickness': 0.75,
                'value': 90
            }
        }
    ))
    
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font={'color': "#c9d1d9"},
        height=300,
        margin=dict(t=40, l=20, r=20, b=20)
    )
    
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    
    st.markdown('</div></div>', unsafe_allow_html=True)

# LAYERS STATUS
with col2:
    st.markdown("""
    <div class="monitor-box">
        <div class="monitor-box-header">
            <div class="monitor-box-title">🏗️ Status das Camadas</div>
        </div>
        <div class="chart-container">
    """, unsafe_allow_html=True)
    
    layer_names = ['Bronze', 'Silver', 'Gold']
    layer_files = [layers_count.get('bronze', 0), layers_count.get('silver', 0), layers_count.get('gold', 0)]
    layer_colors = ['#cd7f32', '#c0c0c0', '#ffd700']
    
    fig = go.Figure(data=[
        go.Bar(
            x=layer_names,
            y=layer_files,
            marker=dict(
                color=layer_colors,
                line=dict(color='#30363d', width=2)
            ),
            text=layer_files,
            textposition='outside',
            textfont=dict(color='#c9d1d9', size=14)
        )
    ])
    
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#c9d1d9'),
        xaxis=dict(showgrid=False),
        yaxis=dict(showgrid=True, gridcolor='#30363d'),
        height=300,
        margin=dict(t=20, l=20, r=20, b=20)
    )
    
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    
    st.markdown('</div></div>', unsafe_allow_html=True)

# ============================================================================
# VALIDATION CHECKS TABLE
# ============================================================================
if quality and 'validacoes' in quality:
    st.markdown("""
    <div class="monitor-box">
        <div class="monitor-box-header">
            <div class="monitor-box-title">🧪 Validações Detalhadas</div>
            <div class="monitor-box-action">Ver Todos →</div>
        </div>
    """, unsafe_allow_html=True)
    
    validacoes = quality['validacoes']
    
    # Criar tabela HTML
    table_html = '<table class="data-table"><thead><tr>'
    table_html += '<th>Validação</th><th>Status</th><th>Score</th><th>Detalhes</th>'
    table_html += '</tr></thead><tbody>'
    
    for val in validacoes[:10]:  # Top 10
        nome = val.get('nome', 'N/A')
        passou = val.get('passou', False)
        score = val.get('score', 0)
        detalhes = val.get('detalhes', '')
        
        status_badge = f'<span class="log-level {'success' if passou else 'error'}">{'✓ PASS' if passou else '✗ FAIL'}</span>'
        score_str = f'{score:.1f}%' if isinstance(score, (int, float)) else str(score)
        
        table_html += f'<tr><td>{nome}</td><td>{status_badge}</td><td>{score_str}</td><td>{detalhes[:50]}...</td></tr>'
    
    table_html += '</tbody></table>'
    
    st.markdown(table_html, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# ============================================================================
# ACTIVITY LOG
# ============================================================================
st.markdown("""
<div class="monitor-box">
    <div class="monitor-box-header">
        <div class="monitor-box-title">📋 Log de Atividades</div>
        <div class="monitor-box-action">Ver Histórico Completo →</div>
    </div>
""", unsafe_allow_html=True)

# Logs simulados/reais
if history['atualizacoes']:
    for update in history['atualizacoes'][-5:][::-1]:  # Últimas 5, ordem reversa
        timestamp = update.get('inicio', 'N/A')
        status = update.get('status', 'concluida')
        
        if isinstance(timestamp, str) and timestamp != 'N/A':
            try:
                dt = datetime.fromisoformat(timestamp)
                timestamp_str = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                timestamp_str = timestamp
        else:
            timestamp_str = 'N/A'
        
        log_level = 'success' if status == 'concluida' else 'warning' if status == 'em_andamento' else 'error'
        log_msg = f"Atualização {status}"
        
        st.markdown(f"""
        <div class="log-entry">
            <span class="log-timestamp">{timestamp_str}</span>
            <span class="log-level {log_level}">{status.upper()}</span>
            <span>{log_msg}</span>
        </div>
        """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="log-entry">
        <span class="log-level info">INFO</span>
        <span>Nenhuma atualização registrada</span>
    </div>
    """, unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# ============================================================================
# FOOTER
# ============================================================================
st.markdown("""
<div style="text-align: center; color: #7d8590; margin-top: 2rem; padding: 1rem; border-top: 1px solid #30363d;">
    <p>TechDengue Data Quality Monitor | Sistema de Monitoramento de Dados</p>
</div>
""", unsafe_allow_html=True)
