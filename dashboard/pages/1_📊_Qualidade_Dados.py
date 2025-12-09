"""
Módulo de Qualidade de Dados
Monitoramento completo da qualidade dos dados
"""
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from pathlib import Path
import json
import sys
from dashboard.components.layout import page_section
from dashboard.utils.plotly_theme import apply_theme

# Adicionar diretório pai ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dashboard.components.charts import create_gauge_chart
from dashboard.components.alerts import show_alert, show_status_badge

# Configuração da página
st.set_page_config(
    page_title="Qualidade de Dados - TechDengue",
    page_icon="📊",
    layout="wide"
)

# Aplicar tema Plotly e carregar Design System (tokens → base → components)
apply_theme()

ASSETS_DIR = Path(__file__).parent.parent / "assets"
for css_name in ("tokens.css", "base.css", "components.css"):
    css_path = ASSETS_DIR / css_name
    if css_path.exists():
        with open(css_path, 'r', encoding='utf-8') as f:
            st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# Caminhos
BASE_DIR = Path(__file__).parent.parent.parent
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

# ============================================================================
# FUNÇÕES
# ============================================================================

@st.cache_data(ttl=300)
def carregar_relatorio_qualidade():
    """Carrega relatório de qualidade"""
    arquivo = METADATA_DIR / "relatorio_qualidade_completo.json"
    if arquivo.exists():
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data(ttl=300)
def carregar_quality_report():
    """Carrega quality report CSV"""
    arquivo = METADATA_DIR / "quality_report.csv"
    if arquivo.exists():
        return pd.read_csv(arquivo)
    return None

# ============================================================================
# HEADER
# ============================================================================

st.markdown(page_section(
    "📊 Qualidade de Dados",
    "Monitoramento completo da qualidade e confiabilidade dos dados",
    "📊",
    "primary"
), unsafe_allow_html=True)

st.markdown('<div class="container">', unsafe_allow_html=True)
st.markdown("---")

# ============================================================================
# CARREGAR DADOS
# ============================================================================

relatorio = carregar_relatorio_qualidade()
quality_df = carregar_quality_report()

if not relatorio:
    st.error("❌ Relatório de qualidade não encontrado!")
    st.stop()

# ============================================================================
# SCORE GERAL
# ============================================================================

st.markdown(page_section("🎯 Score de Qualidade Geral", "Panorama do score e aprovação", "🎯", "success"), unsafe_allow_html=True)

col1, col2 = st.columns([1, 2])

with col1:
    score = relatorio.get('score_qualidade_geral', 0)
    
    # Determinar status
    if score >= 90:
        status = "success"
        status_text = "EXCELENTE"
        status_desc = "Dados confiáveis para análises"
    elif score >= 75:
        status = "warning"
        status_text = "BOM"
        status_desc = "Alguns ajustes recomendados"
    else:
        status = "error"
        status_text = "INSUFICIENTE"
        status_desc = "Revisão necessária"
    
    st.metric("Score Geral", f"{score}%")
    show_status_badge(status, status_text)
    st.info(status_desc)
    
    # Checks
    checks_passed = relatorio.get('checks_passed', 0)
    checks_total = relatorio.get('checks_total', 0)
    st.metric("Checks Aprovados", f"{checks_passed}/{checks_total}")

with col2:
    # Gauge chart
    fig = create_gauge_chart(score, "Score de Qualidade Geral")
    st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

# ============================================================================
# VALIDAÇÕES POR CATEGORIA
# ============================================================================

st.markdown(page_section("✅ Validações por Categoria", "Transformações entre camadas e consistência", "✅", "primary"), unsafe_allow_html=True)

# Transformação Bronze → Silver
st.markdown("### 🥉→🥈 Transformação Bronze → Silver")

transf = relatorio.get('transformacao_bronze_silver', {})

col1, col2, col3 = st.columns(3)

with col1:
    st.metric("Atividades Bronze", f"{transf.get('atividades_bronze', 0):,}")
    st.metric("Atividades Silver", f"{transf.get('atividades_silver', 0):,}")

with col2:
    pois_ok = transf.get('pois_preservados', False)
    st.metric("POIs Preservados", "✅ Sim" if pois_ok else "❌ Não")
    
with col3:
    hectares_ok = transf.get('hectares_corrigidos', False)
    st.metric("Hectares Corrigidos", "✅ Sim" if hectares_ok else "❌ Não")

# Agregação Silver → Gold
st.markdown("### 🥈→🥇 Agregação Silver → Gold")

agreg = relatorio.get('agregacao_silver_gold', {})

col1, col2, col3 = st.columns(3)

with col1:
    ativ_ok = agreg.get('atividades_preservadas', False)
    st.metric("Atividades", "✅ Preservadas" if ativ_ok else "❌ Perdidas")

with col2:
    pois_ok = agreg.get('pois_preservados', False)
    st.metric("POIs", "✅ Preservados" if pois_ok else "❌ Perdidos")

with col3:
    hect_ok = agreg.get('hectares_preservados', False)
    st.metric("Hectares", "✅ Preservados" if hect_ok else "❌ Perdidos")

st.markdown("---")

# ============================================================================
# INTEGRIDADE REFERENCIAL
# ============================================================================

st.markdown(page_section("🔗 Integridade Referencial", "Presença e chaves entre dimensões e fatos", "🔗", "primary"), unsafe_allow_html=True)

integ = relatorio.get('integridade_referencial', {})

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Municípios (dim)", f"{integ.get('municipios_dim', 0)}")

with col2:
    st.metric("Municípios (atividades)", f"{integ.get('municipios_atividades', 0)}")

with col3:
    st.metric("Municípios (mega_tabela)", f"{integ.get('municipios_mega_tabela', 0)}")

with col4:
    orfaos = integ.get('orfaos_atividades', 0)
    st.metric("Códigos Órfãos", f"{orfaos}", delta="0" if orfaos == 0 else f"-{orfaos}")

if integ.get('todos_municipios_presentes', False):
    show_alert("✅ Todos os municípios estão presentes na MEGA TABELA", "success")
else:
    show_alert("⚠️ Alguns municípios estão faltando na MEGA TABELA", "warning")

st.markdown("---")

# ============================================================================
# MÉTRICAS OFICIAIS
# ============================================================================

st.markdown(page_section("📏 Validação contra Métricas Oficiais", "Comparação com referência externa e tolerância", "📏", "primary"), unsafe_allow_html=True)

metricas = relatorio.get('metricas_oficiais', {})

col1, col2, col3 = st.columns(3)

with col1:
    oficial = metricas.get('hectares_oficial', 0)
    st.metric("Hectares Oficial", f"{oficial:,.2f} ha")

with col2:
    calculado = metricas.get('hectares_calculado', 0)
    st.metric("Hectares Calculado", f"{calculado:,.2f} ha")

with col3:
    diferenca = metricas.get('diferenca_percentual', 0)
    dentro_tolerancia = metricas.get('dentro_tolerancia', False)
    
    st.metric("Diferença", f"{diferenca:.2f}%")
    
    if dentro_tolerancia:
        show_status_badge("success", "DENTRO DA TOLERÂNCIA")
    else:
        show_status_badge("warning", "FORA DA TOLERÂNCIA")

st.markdown("---")

# ============================================================================
# SERVIDOR POSTGRESQL
# ============================================================================

st.markdown(page_section("🗄️ Validação do Servidor PostgreSQL", "Cobertura e precisão de coordenadas", "🗄️", "primary"), unsafe_allow_html=True)

servidor = relatorio.get('servidor_postgresql', {})

col1, col2, col3 = st.columns(3)

with col1:
    total = servidor.get('total_pois', 0)
    st.metric("Total de POIs", f"{total:,}")

with col2:
    com_coords = servidor.get('com_coordenadas', 0)
    st.metric("Com Coordenadas", f"{com_coords:,}")

with col3:
    percentual = servidor.get('percentual_valido', 0)
    st.metric("Coordenadas Válidas", f"{percentual:.1f}%")

if percentual >= 99:
    show_alert("✅ Qualidade excelente das coordenadas", "success")
elif percentual >= 95:
    show_alert("⚠️ Qualidade boa das coordenadas", "warning")
else:
    show_alert("❌ Problemas nas coordenadas", "error")

st.markdown("---")

# ============================================================================
# DETALHAMENTO DE CHECKS
# ============================================================================

st.markdown(page_section("📋 Detalhamento de Checks", "Lista filtrável de checks por tabela e status", "📋", "primary"), unsafe_allow_html=True)

if quality_df is not None:
    # Filtros
    col1, col2 = st.columns(2)
    
    with col1:
        tabelas = ['Todas'] + list(quality_df['table'].unique())
        tabela_selecionada = st.selectbox("Filtrar por tabela", tabelas)
    
    with col2:
        status_opcoes = ['Todos'] + list(quality_df['status'].unique())
        status_selecionado = st.selectbox("Filtrar por status", status_opcoes)
    
    # Aplicar filtros
    df_filtrado = quality_df.copy()
    
    if tabela_selecionada != 'Todas':
        df_filtrado = df_filtrado[df_filtrado['table'] == tabela_selecionada]
    
    if status_selecionado != 'Todos':
        df_filtrado = df_filtrado[df_filtrado['status'] == status_selecionado]
    
    # Exibir tabela (Design System)
    # Selecionar colunas principais, se existirem
    colunas_preferidas = [
        'table', 'column', 'check', 'status', 'message'
    ]
    colunas_presentes = [c for c in colunas_preferidas if c in df_filtrado.columns]
    if not colunas_presentes:
        colunas_presentes = list(df_filtrado.columns)

    # Paginação
    total_rows = len(df_filtrado)
    col_p1, col_p2 = st.columns([1, 1])
    with col_p1:
        page_size = st.selectbox("📄 Registros/Página", [20, 50, 100, 200], index=1)
    total_pages = (total_rows - 1) // page_size + 1 if total_rows > 0 else 1
    with col_p2:
        page_index = st.slider("Página", 1, max(1, total_pages), 1, help=f"Total de {total_pages} páginas")
    start = (page_index - 1) * page_size
    end = min(start + page_size, total_rows)
    df_show = df_filtrado[colunas_presentes].iloc[start:end].copy()

    # Mapear status para badges do DS
    def badge_html(status: str) -> str:
        variant = {
            'PASS': 'success',
            'FAIL': 'error',
            'WARN': 'warning'
        }.get(str(status).upper(), 'primary')
        return f'<span class="badge {variant}">{status}</span>'

    if 'status' in df_show.columns:
        df_show['status'] = df_show['status'].apply(badge_html)

    # Construir HTML da tabela
    thead = ''.join([f'<th>{c}</th>' for c in df_show.columns])
    rows_html = ''
    for _, row in df_show.iterrows():
        tds = ''.join([f'<td>{row[c]}</td>' for c in df_show.columns])
        rows_html += f'<tr>{tds}</tr>'

    table_html = f'''
    <div class="table" style="margin-top: .5rem;">
      <table>
        <thead><tr>{thead}</tr></thead>
        <tbody>
          {rows_html}
        </tbody>
      </table>
    </div>
    <div style="margin-top:.5rem;color:#6b7280;font-size:.875rem;">Exibindo linhas {start+1 if total_rows>0 else 0}–{end} de {total_rows}</div>
    '''

    st.markdown(table_html, unsafe_allow_html=True)
    
    # Resumo
    st.markdown("### 📊 Resumo")
    resumo = df_filtrado.groupby('status').size().reset_index(name='count')
    
    col1, col2, col3 = st.columns(3)
    
    for idx, row in resumo.iterrows():
        with [col1, col2, col3][idx % 3]:
            variant = {
                'PASS': 'success',
                'FAIL': 'error',
                'WARN': 'warning'
            }.get(row['status'], 'primary')
            st.markdown(
                f"""
                <div>
                  <span class="badge {variant}">{row['status']}</span>
                  <div style="margin-top: .5rem; font-weight:700;">{row['count']}</div>
                </div>
                """,
                unsafe_allow_html=True
            )

else:
    st.warning("⚠️ Relatório detalhado de qualidade não disponível")

st.markdown('</div>', unsafe_allow_html=True)

# ============================================================================
# FOOTER
# ============================================================================

st.markdown("---")
st.markdown(f"""
<div style='text-align: center; color: #666;'>
    <p>Última atualização: {relatorio.get('data_validacao', 'N/A')}</p>
</div>
""", unsafe_allow_html=True)
