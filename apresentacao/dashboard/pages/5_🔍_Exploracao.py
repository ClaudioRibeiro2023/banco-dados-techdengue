"""
Página Exploração - Filtros e Exploração de Dados
Dashboard CISARP Enterprise
"""

import streamlit as st
import pandas as pd
from datetime import datetime

st.set_page_config(
    page_title="Exploração - Dashboard CISARP",
    page_icon="🔍",
    layout="wide"
)

from dashboard.shared.design_system import ds
from dashboard.modules import (
    settings,
    data_processor,
)

ds.inject_custom_css()

# ==================== CARREGAMENTO ====================

@st.cache_data(ttl=settings.CACHE_TTL)
def load_data():
    try:
        data_path = settings.DADOS_DIR / "cisarp_dados_validados.csv"
        if data_path.exists():
            df = pd.read_csv(data_path)
            # Converter datas
            if 'DATA_MAP' in df.columns:
                df['DATA_MAP'] = pd.to_datetime(df['DATA_MAP'], errors='coerce')
            return df
        
        alt_path = settings.DADOS_DIR / "cisarp_completo.csv"
        if alt_path.exists():
            df = pd.read_csv(alt_path)
            if 'DATA_MAP' in df.columns:
                df['DATA_MAP'] = pd.to_datetime(df['DATA_MAP'], errors='coerce')
            return df
        
        return pd.DataFrame()
    except:
        return pd.DataFrame()

# ==================== MAIN ====================

def main():
    ds.section_header(
        title="Exploração de Dados",
        description="Filtros interativos e análise exploratória",
        icon="🔍"
    )
    
    df = load_data()
    
    if len(df) == 0:
        st.warning("⚠️ Dados não encontrados.")
        return
    
    # Sidebar com filtros
    st.sidebar.markdown("## 🎛️ Filtros")
    
    # Identificar coluna de município
    col_municipio = data_processor.identify_municipality_column(df)
    
    # Filtro de município
    if col_municipio:
        municipios_disponiveis = sorted(df[col_municipio].unique().tolist())
        municipios_selecionados = st.sidebar.multiselect(
            "Municípios",
            options=municipios_disponiveis,
            default=None,
            help="Selecione um ou mais municípios"
        )
    else:
        municipios_selecionados = []
    
    # Filtro de data
    if 'DATA_MAP' in df.columns:
        datas_validas = df['DATA_MAP'].dropna()
        if len(datas_validas) > 0:
            min_date = datas_validas.min().date()
            max_date = datas_validas.max().date()
            
            date_range = st.sidebar.date_input(
                "Período",
                value=(min_date, max_date),
                min_value=min_date,
                max_value=max_date,
                help="Selecione o período de análise"
            )
        else:
            date_range = None
    else:
        date_range = None
    
    # Filtros de métricas
    if 'POIS' in df.columns:
        pois_range = st.sidebar.slider(
            "POIs (mínimo)",
            min_value=0,
            max_value=int(df['POIS'].max()) if df['POIS'].max() > 0 else 100,
            value=0,
            help="Filtrar por número mínimo de POIs"
        )
    else:
        pois_range = 0
    
    if 'HECTARES_MAPEADOS' in df.columns:
        hectares_range = st.sidebar.slider(
            "Hectares (mínimo)",
            min_value=0.0,
            max_value=float(df['HECTARES_MAPEADOS'].max()) if df['HECTARES_MAPEADOS'].max() > 0 else 100.0,
            value=0.0,
            help="Filtrar por área mínima mapeada"
        )
    else:
        hectares_range = 0.0
    
    # Aplicar filtros
    df_filtrado = df.copy()
    
    # Filtro de município
    if col_municipio and len(municipios_selecionados) > 0:
        df_filtrado = df_filtrado[df_filtrado[col_municipio].isin(municipios_selecionados)]
    
    # Filtro de data
    if date_range and 'DATA_MAP' in df.columns:
        if len(date_range) == 2:
            start_date, end_date = date_range
            df_filtrado = df_filtrado[
                (df_filtrado['DATA_MAP'].dt.date >= start_date) &
                (df_filtrado['DATA_MAP'].dt.date <= end_date)
            ]
    
    # Filtros de métricas
    if 'POIS' in df.columns:
        df_filtrado = df_filtrado[df_filtrado['POIS'] >= pois_range]
    
    if 'HECTARES_MAPEADOS' in df.columns:
        df_filtrado = df_filtrado[df_filtrado['HECTARES_MAPEADOS'] >= hectares_range]
    
    # Resumo dos filtros
    st.subheader("📊 Resumo dos Dados")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        ds.stat_card(
            title="Total Original",
            value=str(len(df)),
            subtitle="registros"
        )
    
    with col2:
        ds.stat_card(
            title="Após Filtros",
            value=str(len(df_filtrado)),
            subtitle="registros",
            trend=f"{(len(df_filtrado)/len(df)*100):.1f}%" if len(df) > 0 else "0%",
            trend_positive=True
        )
    
    with col3:
        if 'POIS' in df_filtrado.columns:
            ds.stat_card(
                title="POIs Total",
                value=f"{df_filtrado['POIS'].sum():,}",
                subtitle="filtrados"
            )
    
    with col4:
        if 'HECTARES_MAPEADOS' in df_filtrado.columns:
            ds.stat_card(
                title="Hectares Total",
                value=f"{df_filtrado['HECTARES_MAPEADOS'].sum():,.0f}",
                subtitle="filtrados"
            )
    
    ds.divider()
    
    # Tabs de visualização
    tab1, tab2, tab3 = st.tabs(["📋 Tabela", "📊 Estatísticas", "📥 Exportar"])
    
    # ==================== TAB 1: TABELA ====================
    with tab1:
        st.subheader("📋 Dados Filtrados")
        
        # Opções de visualização
        col1, col2 = st.columns([3, 1])
        
        with col1:
            search = st.text_input(
                "🔎 Buscar",
                placeholder="Digite para buscar em qualquer coluna...",
                help="Busca em todas as colunas visíveis"
            )
        
        with col2:
            rows_per_page = st.selectbox(
                "Linhas por página",
                options=[10, 25, 50, 100, len(df_filtrado)],
                index=1
            )
        
        # Aplicar busca
        if search:
            mask = df_filtrado.astype(str).apply(
                lambda x: x.str.contains(search, case=False, na=False)
            ).any(axis=1)
            df_display = df_filtrado[mask]
        else:
            df_display = df_filtrado
        
        # Paginação
        if rows_per_page < len(df_display):
            page = st.number_input(
                "Página",
                min_value=1,
                max_value=max(1, (len(df_display) // rows_per_page) + 1),
                value=1
            )
            start_idx = (page - 1) * rows_per_page
            end_idx = start_idx + rows_per_page
            df_page = df_display.iloc[start_idx:end_idx]
        else:
            df_page = df_display
        
        # Mostrar tabela
        st.dataframe(
            df_page,
            use_container_width=True,
            height=400
        )
        
        st.caption(f"Mostrando {len(df_page)} de {len(df_display)} registros")
    
    # ==================== TAB 2: ESTATÍSTICAS ====================
    with tab2:
        st.subheader("📊 Estatísticas Descritivas")
        
        # Estatísticas numéricas
        numeric_cols = df_filtrado.select_dtypes(include=['number']).columns.tolist()
        
        if len(numeric_cols) > 0:
            stats_df = df_filtrado[numeric_cols].describe().T
            stats_df['sum'] = df_filtrado[numeric_cols].sum()
            stats_df = stats_df[['count', 'sum', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']]
            
            st.dataframe(
                stats_df.style.format("{:.2f}"),
                use_container_width=True
            )
        else:
            st.info("Nenhuma coluna numérica encontrada.")
        
        st.markdown("")
        
        # Distribuição de valores
        st.markdown("### 📈 Distribuição de Valores")
        
        if len(numeric_cols) > 0:
            selected_col = st.selectbox(
                "Selecione uma métrica",
                options=numeric_cols,
                help="Visualizar distribuição"
            )
            
            if selected_col:
                import plotly.express as px
                
                fig = px.histogram(
                    df_filtrado,
                    x=selected_col,
                    nbins=30,
                    title=f'Distribuição de {selected_col}',
                    labels={selected_col: selected_col}
                )
                
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
    
    # ==================== TAB 3: EXPORTAR ====================
    with tab3:
        st.subheader("📥 Exportar Dados")
        
        st.markdown("""
        Exporte os dados filtrados em diferentes formatos para análise externa.
        """)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 📄 CSV")
            csv = df_filtrado.to_csv(index=False)
            st.download_button(
                label="⬇️ Download CSV",
                data=csv,
                file_name=f"cisarp_filtrado_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
                mime="text/csv",
                use_container_width=True
            )
        
        with col2:
            st.markdown("### 📊 Excel")
            # Para Excel precisaríamos usar buffer, simplificando para CSV
            st.info("Use o formato CSV para compatibilidade com Excel")
        
        st.markdown("")
        
        # Metadados do export
        with st.expander("📋 Informações do Export"):
            st.json({
                'total_registros': len(df_filtrado),
                'total_colunas': len(df_filtrado.columns),
                'colunas': df_filtrado.columns.tolist(),
                'filtros_aplicados': {
                    'municipios': municipios_selecionados if len(municipios_selecionados) > 0 else 'Todos',
                    'periodo': f"{date_range[0]} a {date_range[1]}" if date_range and len(date_range) == 2 else 'Completo',
                    'pois_min': pois_range,
                    'hectares_min': hectares_range
                },
                'timestamp': datetime.now().isoformat()
            })
    
    ds.divider()
    
    # Resumo do data_processor
    st.subheader("🔬 Análise Técnica")
    
    summary = data_processor.get_summary(df_filtrado)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Registros", summary['total_registros'])
        st.metric("Colunas", summary['total_colunas'])
    
    with col2:
        st.metric("Memória (MB)", f"{summary['memoria_mb']:.2f}")
        nulos_total = sum(summary['nulos'].values())
        st.metric("Valores Nulos", nulos_total)
    
    with col3:
        # Tipos de dados
        tipos_count = {}
        for tipo in summary['tipos'].values():
            tipos_count[tipo] = tipos_count.get(tipo, 0) + 1
        
        st.markdown("**Tipos de Dados:**")
        for tipo, count in tipos_count.items():
            st.text(f"{tipo}: {count}")

if __name__ == "__main__":
    main()
