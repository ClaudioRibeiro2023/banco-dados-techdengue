"""
Mega Tabela Analítica - Página Dedicada
Design System v4.0.0
"""
import streamlit as st
import pandas as pd
import sys
from pathlib import Path
from io import BytesIO

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Import components
from dashboard.components.layout import page_section, page_container, spacer
from dashboard.components.ui_components import (
    create_metric_card_modern,
    create_modern_alert,
    create_badge
)
from dashboard.components.empty_error_states import (
    create_empty_state,
    create_error_state,
    create_loading_skeleton,
    create_empty_filtered_state
)
from dashboard.components.tooltip import create_icon_with_tooltip
from dashboard.components.keyboard_shortcuts import create_shortcuts_panel
from dashboard.utils.plotly_theme import apply_theme

# Page config
st.set_page_config(
    page_title="Mega Tabela | TechDengue",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Apply theme
apply_theme()

# Load CSS
ASSETS = Path(__file__).parent.parent / "assets"
css_files = ["tokens.css", "tokens-extended.css", "base.css", "components.css", "components-extended.css"]
for css_file in css_files:
    css_path = ASSETS / css_file
    if css_path.exists():
        with open(css_path, 'r', encoding='utf-8') as f:
            st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# Keyboard shortcuts
st.markdown(create_shortcuts_panel(), unsafe_allow_html=True)

# Skip link
st.markdown('<a class="skip-link" href="#main-content">Pular para o conteúdo</a>', unsafe_allow_html=True)

# Breadcrumbs
st.markdown('''
<nav aria-label="Breadcrumb" class="breadcrumbs">
    <a href="/">Home</a>
    <span class="breadcrumb-separator">›</span>
    <span aria-current="page">Mega Tabela</span>
</nav>
''', unsafe_allow_html=True)

# Main content
st.markdown('<div class="container" id="main-content">', unsafe_allow_html=True)

# Header
st.markdown(page_section(
    "📋 MEGA TABELA Analítica",
    "Visualização completa e interativa de todos os dados",
    "📋",
    "primary"
), unsafe_allow_html=True)

# Load data
@st.cache_data
def load_mega_tabela():
    """Load mega tabela with error handling"""
    try:
        data_lake_path = Path(__file__).parent.parent.parent / "data_lake" / "gold" / "mega_tabela_analitica.parquet"
        if data_lake_path.exists():
            df = pd.read_parquet(data_lake_path)
            return df, None
        else:
            return None, f"Arquivo não encontrado: {data_lake_path}"
    except Exception as e:
        return None, str(e)

mega_tabela, error = load_mega_tabela()

if error:
    # Error state
    st.markdown(create_error_state(
        error_message="Não foi possível carregar a Mega Tabela",
        retry_action="st.cache_data.clear(); st.rerun()",
        details=error,
        error_code="ERR_LOAD_001"
    ), unsafe_allow_html=True)
    st.stop()

if mega_tabela is None or len(mega_tabela) == 0:
    # Empty state
    st.markdown(create_empty_state(
        icon="📊",
        title="Mega Tabela vazia",
        description="Não há dados disponíveis na Mega Tabela no momento",
        action_label="Recarregar",
        action_onclick="window.location.reload()"
    ), unsafe_allow_html=True)
    st.stop()

# KPIs
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_registros = len(mega_tabela)
    st.markdown(create_metric_card_modern(
        icon="📝",
        title="Total de Registros",
        value=f"{total_registros:,}",
        change=None,
        color="primary",
        size="default",
        tooltip="Número total de registros na Mega Tabela"
    ), unsafe_allow_html=True)

with col2:
    total_colunas = len(mega_tabela.columns)
    st.markdown(create_metric_card_modern(
        icon="📋",
        title="Colunas",
        value=f"{total_colunas}",
        change=None,
        color="info",
        size="default",
        tooltip="Número de colunas disponíveis"
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
        tooltip="Municípios distintos com registros"
    ), unsafe_allow_html=True)

with col4:
    com_atividades = (mega_tabela['total_atividades'] > 0).sum() if 'total_atividades' in mega_tabela.columns else 0
    perc_atividades = (com_atividades / total_registros * 100) if total_registros > 0 else 0
    st.markdown(create_metric_card_modern(
        icon="✅",
        title="Com Atividades",
        value=f"{com_atividades:,}",
        change=perc_atividades,
        color="warning",
        size="default",
        tooltip="Registros com atividades (>0)"
    ), unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Filters section
st.markdown(page_section(
    "🔍 Filtros Avançados",
    "Refine sua busca com múltiplos critérios",
    "🔍",
    "info"
), unsafe_allow_html=True)

# Filter bar
col_f1, col_f2, col_f3, col_f4 = st.columns([2, 2, 2, 2])

with col_f1:
    # Year filter
    anos_disponiveis = sorted(mega_tabela['ano'].unique()) if 'ano' in mega_tabela.columns else []
    ano_selecionado = st.selectbox(
        "📅 Ano",
        options=['Todos'] + anos_disponiveis,
        index=0,
        key="filter_ano"
    )

with col_f2:
    # URS filter
    urs_disponiveis = sorted(mega_tabela['URS'].unique()) if 'URS' in mega_tabela.columns else []
    urs_selecionada = st.selectbox(
        "🏥 URS",
        options=['Todas'] + urs_disponiveis,
        index=0,
        key="filter_urs"
    )

with col_f3:
    # Activity filter
    filtro_atividade = st.selectbox(
        "🎯 Atividades",
        options=['Todas', 'Com atividades', 'Sem atividades'],
        index=0,
        key="filter_atividade"
    )

with col_f4:
    # Search
    search_term = st.text_input(
        "🔎 Buscar",
        placeholder="Nome do município...",
        key="search_term"
    )

# Apply filters
df_filtrado = mega_tabela.copy()

if ano_selecionado != 'Todos':
    df_filtrado = df_filtrado[df_filtrado['ano'] == ano_selecionado]

if urs_selecionada != 'Todas':
    df_filtrado = df_filtrado[df_filtrado['URS'] == urs_selecionada]

if filtro_atividade == 'Com atividades':
    df_filtrado = df_filtrado[df_filtrado['total_atividades'] > 0]
elif filtro_atividade == 'Sem atividades':
    df_filtrado = df_filtrado[df_filtrado['total_atividades'] == 0]

if search_term:
    if 'municipio' in df_filtrado.columns:
        df_filtrado = df_filtrado[df_filtrado['municipio'].str.contains(search_term, case=False, na=False)]

# Filter feedback
col_info1, col_info2, col_info3 = st.columns(3)

with col_info1:
    st.markdown(create_modern_alert(
        f"📊 Exibindo {len(df_filtrado):,} de {len(mega_tabela):,} registros",
        type="info",
        icon="ℹ️"
    ), unsafe_allow_html=True)

with col_info2:
    if len(df_filtrado) == 0:
        st.markdown(create_modern_alert(
            "⚠️ Nenhum registro encontrado com os filtros aplicados",
            type="warning",
            icon="⚠️"
        ), unsafe_allow_html=True)
    elif len(df_filtrado) < len(mega_tabela) * 0.1:
        st.markdown(create_modern_alert(
            "🎯 Resultado muito específico - considere ampliar os filtros",
            type="warning",
            icon="🎯"
        ), unsafe_allow_html=True)

with col_info3:
    if ano_selecionado != 'Todos' or urs_selecionada != 'Todas' or filtro_atividade != 'Todas' or search_term:
        if st.button("🔄 Limpar Filtros", key="clear_filters"):
            st.rerun()

st.markdown("<br>", unsafe_allow_html=True)

# Table section
if len(df_filtrado) == 0:
    # Empty filtered state
    st.markdown(create_empty_filtered_state(), unsafe_allow_html=True)
else:
    st.markdown(page_section(
        "📋 Dados da Tabela",
        f"Visualizando {len(df_filtrado):,} registros",
        "📋",
        "success"
    ), unsafe_allow_html=True)
    
    # Column selector
    col_sel1, col_sel2, col_sel3 = st.columns([4, 2, 2])
    
    with col_sel1:
        st.markdown("**Colunas visíveis:**")
    
    with col_sel2:
        # Select columns
        colunas_disponiveis = list(df_filtrado.columns)
        colunas_padrao = colunas_disponiveis[:10]  # First 10 columns by default
        
        with st.expander("⚙️ Configurar colunas"):
            colunas_selecionadas = st.multiselect(
                "Selecione as colunas para exibir",
                options=colunas_disponiveis,
                default=colunas_padrao,
                key="columns_selector"
            )
            
            if not colunas_selecionadas:
                colunas_selecionadas = colunas_padrao
    
    with col_sel3:
        # Rows per page
        registros_por_pagina = st.selectbox(
            "📄 Registros/página",
            options=[10, 25, 50, 100],
            index=1,
            key="rows_per_page"
        )
    
    # Pagination
    total_paginas = (len(df_filtrado) - 1) // registros_por_pagina + 1
    
    col_pag1, col_pag2, col_pag3 = st.columns([1, 2, 1])
    
    with col_pag2:
        pagina_atual = st.number_input(
            "Página",
            min_value=1,
            max_value=total_paginas,
            value=1,
            step=1,
            key="current_page"
        )
    
    # Calculate slice
    inicio = (pagina_atual - 1) * registros_por_pagina
    fim = inicio + registros_por_pagina
    
    df_pagina = df_filtrado[colunas_selecionadas].iloc[inicio:fim]
    
    # Display table
    st.dataframe(
        df_pagina,
        use_container_width=True,
        height=500
    )
    
    # Pagination info
    st.markdown(f"""
    <div style="text-align: center; color: var(--gray-600); font-size: var(--text-sm); margin-top: var(--space-2);">
        Exibindo linhas {inicio + 1} a {min(fim, len(df_filtrado))} de {len(df_filtrado):,}
        | Página {pagina_atual} de {total_paginas}
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Export section
    st.markdown(page_section(
        "↓ Exportar Dados",
        "Baixe os dados filtrados em diferentes formatos",
        "↓",
        "warning"
    ), unsafe_allow_html=True)
    
    col_exp1, col_exp2, col_exp3 = st.columns(3)
    
    with col_exp1:
        # CSV export
        csv = df_filtrado[colunas_selecionadas].to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📄 Baixar CSV",
            data=csv,
            file_name=f"mega_tabela_{ano_selecionado}.csv",
            mime="text/csv",
            key="download_csv"
        )
    
    with col_exp2:
        # Excel export
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_filtrado[colunas_selecionadas].to_excel(writer, index=False, sheet_name='Dados')
        excel_data = output.getvalue()
        
        st.download_button(
            label="📊 Baixar Excel",
            data=excel_data,
            file_name=f"mega_tabela_{ano_selecionado}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            key="download_excel"
        )
    
    with col_exp3:
        # JSON export
        json_data = df_filtrado[colunas_selecionadas].to_json(orient='records', indent=2).encode('utf-8')
        st.download_button(
            label="🔤 Baixar JSON",
            data=json_data,
            file_name=f"mega_tabela_{ano_selecionado}.json",
            mime="application/json",
            key="download_json"
        )

st.markdown('</div>', unsafe_allow_html=True)

# Footer
st.markdown("""
<div style="margin-top: var(--space-8); padding-top: var(--space-4); border-top: 1px solid var(--gray-200); text-align: center;">
    <p style="color: var(--gray-600); font-size: var(--text-sm);">
        💡 Pressione <kbd>?</kbd> para ver atalhos de teclado | 
        <kbd>Ctrl+F</kbd> para focar nos filtros |
        <kbd>Ctrl+H</kbd> para voltar à Home
    </p>
</div>
""", unsafe_allow_html=True)
