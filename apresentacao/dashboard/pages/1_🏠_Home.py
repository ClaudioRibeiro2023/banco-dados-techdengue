"""
Página Home - Visão Executiva
Dashboard CISARP Enterprise
"""

import streamlit as st
import pandas as pd
from pathlib import Path

# Configuração da página
st.set_page_config(
    page_title="Home - Dashboard CISARP",
    page_icon="🏠",
    layout="wide"
)

# Imports do dashboard
from dashboard.shared.design_system import ds
from dashboard.modules import (
    settings,
    data_processor,
    performance_analyzer,
    insights_generator,
    load_cisarp_data as gw_load_cisarp,
)

# Injetar CSS
ds.inject_custom_css()

# ==================== CARREGAMENTO DE DADOS ====================

@st.cache_data(ttl=settings.CACHE_TTL)
def load_cisarp_data():
    """Carrega dados CISARP validados"""
    try:
        df = gw_load_cisarp()
        return df if df is not None else pd.DataFrame()
    except Exception as e:
        st.error(f"Erro ao carregar dados: {e}")
        return pd.DataFrame()

# ==================== MAIN ====================

def main():
    """Página principal Home"""
    
    # Header
    ds.section_header(
        title="Dashboard CISARP",
        description="Análise de Impacto TechDengue - Visão Executiva",
        icon="🏠"
    )
    
    # Carregar dados
    df = load_cisarp_data()
    
    if len(df) == 0:
        st.warning("⚠️ Nenhum dado encontrado. Execute os scripts de preparação de dados.")
        st.code("""
# Execute na ordem:
cd apresentacao
python 02_analise_cisarp.py
python 04_analise_impacto_epidemiologico.py
        """)
        return
    
    # Calcular KPIs
    with st.spinner("Calculando KPIs..."):
        kpis = performance_analyzer.calculate_kpis(df)
    
    # KPIs Principais
    st.subheader("📊 Indicadores Principais")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        ds.metric_card(
            title="Intervenções",
            value=str(kpis['total_registros']),
            delta="+37 vs inicial",
            color="primary",
            icon="📊",
            help_text="Total de registros/intervenções"
        )
    
    with col2:
        ds.metric_card(
            title="POIs Identificados",
            value=f"{kpis['pois_total']:,}",
            color="success",
            icon="📍",
            help_text="Pontos de Interesse mapeados"
        )
    
    with col3:
        ds.metric_card(
            title="Hectares Mapeados",
            value=f"{kpis['hectares_total']:,.0f}",
            delta="+94%",
            color="info",
            icon="🗺️",
            help_text="Área total mapeada"
        )
    
    with col4:
        ds.metric_card(
            title="Municípios",
            value=str(kpis['municipios_unicos']),
            color="warning",
            icon="🏙️",
            help_text="Municípios atendidos"
        )
    
    st.markdown("")
    
    # Segunda linha de KPIs
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        ds.stat_card(
            title="Densidade",
            value=f"{kpis['densidade']:.2f} POIs/ha",
            subtitle="Densidade operacional"
        )
    
    with col2:
        ds.stat_card(
            title="POIs Médio",
            value=f"{kpis['pois_medio']:.1f}",
            subtitle="Por intervenção"
        )
    
    with col3:
        ds.stat_card(
            title="Hectares Médio",
            value=f"{kpis['hectares_medio']:.1f}",
            subtitle="Por intervenção"
        )
    
    with col4:
        ds.stat_card(
            title="Taxa Conversão",
            value=f"{kpis['taxa_conversao']:.1f}%",
            subtitle="Devolutivas realizadas"
        )
    
    ds.divider()
    
    # Análise Temporal
    st.subheader("📅 Período de Operação")
    
    temporal = performance_analyzer.temporal_evolution(df)
    
    if temporal['periodo_inicio']:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            ds.info_box(
                f"**Início:** {temporal['periodo_inicio'].strftime('%d/%m/%Y')}",
                box_type='info',
                icon="📅"
            )
        
        with col2:
            ds.info_box(
                f"**Última Atividade:** {temporal['periodo_fim'].strftime('%d/%m/%Y')}",
                box_type='info',
                icon="📅"
            )
        
        with col3:
            ds.info_box(
                f"**Duração:** {temporal['dias_operacao']} dias (~{temporal['dias_operacao']//30} meses)",
                box_type='success',
                icon="⏱️"
            )
        
        # Tendência
        trend_map = {
            'crescente': ('📈', 'Operação em Crescimento', 'success'),
            'estável': ('➡️', 'Operação Estável', 'info'),
            'decrescente': ('📉', 'Operação em Declínio', 'warning'),
            'insuficiente': ('⏸️', 'Dados Insuficientes', 'info')
        }
        
        icon, text, box_type = trend_map.get(temporal['trend'], ('', '', 'info'))
        
        st.markdown("")
        ds.info_box(
            f"{icon} **Tendência:** {text}",
            box_type=box_type
        )
    
    ds.divider()
    
    # Top 5 Municípios
    st.subheader("🏆 Top 5 Municípios")
    
    top5 = performance_analyzer.get_top_municipalities(df, n=5, metric='count')
    
    if len(top5) > 0:
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Criar gráfico de barras simples
            import plotly.express as px
            
            fig = px.bar(
                top5,
                x='total',
                y='municipio',
                orientation='h',
                title='',
                color='total',
                color_continuous_scale='Blues'
            )
            fig.update_layout(
                showlegend=False,
                yaxis={'categoryorder': 'total ascending'},
                height=300,
                margin=dict(l=0, r=0, t=10, b=0)
            )
            
            # Aplicar tema
            ds.apply_plotly_theme(fig)
            
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.markdown("**Ranking:**")
            for i, row in top5.iterrows():
                st.markdown(f"{row['rank']}. **{row['municipio']}**: {row['total']} intervenções")
    
    ds.divider()
    
    # Insights Rápidos
    st.subheader("💡 Insights Principais")
    
    # Gerar insights com dados disponíveis
    insights = insights_generator.generate_insights(
        kpis=kpis,
        temporal=temporal,
        ranking={'cisarp_position': 4, 'total_contractors': 66, 'cisarp_percentile': 6.1},
        impact=None  # Será carregado na página específica
    )
    
    # Mostrar top 3 insights
    for insight in insights[:3]:
        with st.expander(f"{insight['title']}", expanded=False):
            st.write(insight['description'])
            col1, col2 = st.columns([3, 1])
            with col1:
                st.caption(f"**Categoria:** {insight['category']}")
            with col2:
                st.metric("", insight['metric'])
    
    st.markdown("")
    
    # Call to action
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("📊 Ver Performance Detalhada", use_container_width=True):
            st.info("Use a navegação lateral → **Performance**")
    
    with col2:
        if st.button("💊 Análise de Impacto", use_container_width=True):
            st.info("Use a navegação lateral → **Impacto Epidemiológico**")
    
    with col3:
        if st.button("🏆 Ver Benchmarking", use_container_width=True):
            st.info("Use a navegação lateral → **Benchmarking**")
    
    ds.divider()
    
    # Footer
    st.caption(f"Dashboard CISARP v{settings.VERSION} - Dados atualizados em tempo real")

if __name__ == "__main__":
    main()
