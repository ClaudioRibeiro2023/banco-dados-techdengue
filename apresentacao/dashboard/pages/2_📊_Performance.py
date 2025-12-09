"""
Página Performance - Análise Operacional Detalhada
Dashboard CISARP Enterprise
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Performance - Dashboard CISARP",
    page_icon="📊",
    layout="wide"
)

from dashboard.shared.design_system import ds
from dashboard.modules import (
    settings,
    data_processor,
    performance_analyzer,
    load_cisarp_data as gw_load_cisarp,
)

ds.inject_custom_css()

# ==================== CARREGAMENTO ====================

@st.cache_data(ttl=settings.CACHE_TTL)
def load_data():
    try:
        df = gw_load_cisarp()
        return df if df is not None else pd.DataFrame()
    except Exception:
        return pd.DataFrame()

# ==================== MAIN ====================

def main():
    ds.section_header(
        title="Performance Operacional",
        description="Análise detalhada de métricas e indicadores",
        icon="📊"
    )
    
    df = load_data()
    
    if len(df) == 0:
        st.warning("⚠️ Dados não encontrados.")
        return
    
    # Calcular análises
    with st.spinner("Calculando métricas de performance..."):
        kpis = performance_analyzer.calculate_kpis(df)
        temporal = performance_analyzer.temporal_evolution(df)
        coverage = performance_analyzer.coverage_analysis(df)
        categories = performance_analyzer.category_analysis(df)
    
    # Tabs de navegação
    tab1, tab2, tab3, tab4 = st.tabs([
        "📊 KPIs Principais",
        "📅 Evolução Temporal",
        "🗺️ Cobertura Territorial",
        "📦 Categorias POIs"
    ])
    
    # ==================== TAB 1: KPIs ====================
    with tab1:
        st.subheader("🎯 Indicadores Operacionais")
        
        # Grid de KPIs
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("### Volume")
            st.metric("Total de Registros", f"{kpis['total_registros']:,}")
            st.metric("POIs Total", f"{kpis['pois_total']:,}")
            st.metric("Hectares Total", f"{kpis['hectares_total']:,.0f}")
        
        with col2:
            st.markdown("### Médias")
            st.metric("POIs/Intervenção", f"{kpis['pois_medio']:.1f}")
            st.metric("Hectares/Intervenção", f"{kpis['hectares_medio']:.1f}")
            st.metric("Densidade", f"{kpis['densidade']:.2f} POIs/ha")
        
        with col3:
            st.markdown("### Conversão")
            st.metric("Devolutivas Total", f"{kpis['devolutivas_total']:,}")
            st.metric("Taxa de Conversão", f"{kpis['taxa_conversao']:.1f}%")
            st.metric("Municípios Únicos", kpis['municipios_unicos'])
        
        ds.divider()
        
        # Gráficos comparativos
        st.markdown("### 📈 Comparativo de Métricas")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Volume de POIs vs Hectares
            fig = go.Figure()
            
            fig.add_trace(go.Bar(
                x=['POIs', 'Hectares x10'],
                y=[kpis['pois_total'], kpis['hectares_total']/10],
                marker_color=['#0066CC', '#28A745'],
                text=[f"{kpis['pois_total']:,}", f"{kpis['hectares_total']:,.0f}"],
                textposition='auto'
            ))
            
            fig.update_layout(
                title='Volume Total de POIs vs Hectares',
                showlegend=False,
                height=350
            )
            
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Taxa de conversão visual
            fig = go.Figure(go.Indicator(
                mode = "gauge+number+delta",
                value = kpis['taxa_conversao'],
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Taxa de Conversão (%)"},
                delta = {'reference': 30, 'increasing': {'color': "green"}},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "#0066CC"},
                    'steps': [
                        {'range': [0, 30], 'color': "#FFE5E5"},
                        {'range': [30, 50], 'color': "#FFF4E5"},
                        {'range': [50, 100], 'color': "#E5F5E5"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 40
                    }
                }
            ))
            
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)
        
        # Top municípios
        st.markdown("### 🏆 Top 15 Municípios")
        
        col1, col2 = st.columns(2)
        
        with col1:
            top15_count = performance_analyzer.get_top_municipalities(df, n=15, metric='count')
            if len(top15_count) > 0:
                fig = px.bar(
                    top15_count,
                    x='total',
                    y='municipio',
                    orientation='h',
                    title='Por Número de Intervenções',
                    color='total',
                    color_continuous_scale='Blues'
                )
                fig.update_layout(
                    yaxis={'categoryorder': 'total ascending'},
                    height=450,
                    showlegend=False
                )
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            top15_pois = performance_analyzer.get_top_municipalities(df, n=15, metric='pois')
            if len(top15_pois) > 0:
                fig = px.bar(
                    top15_pois,
                    x='total',
                    y='municipio',
                    orientation='h',
                    title='Por Número de POIs',
                    color='total',
                    color_continuous_scale='Greens'
                )
                fig.update_layout(
                    yaxis={'categoryorder': 'total ascending'},
                    height=450,
                    showlegend=False
                )
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
    
    # ==================== TAB 2: TEMPORAL ====================
    with tab2:
        st.subheader("📅 Evolução Temporal")
        
        if temporal['periodo_inicio']:
            # Informações do período
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Início", temporal['periodo_inicio'].strftime('%d/%m/%Y'))
            with col2:
                st.metric("Última Atividade", temporal['periodo_fim'].strftime('%d/%m/%Y'))
            with col3:
                st.metric("Duração (dias)", temporal['dias_operacao'])
            with col4:
                trend_emoji = {
                    'crescente': '📈',
                    'estável': '➡️',
                    'decrescente': '📉',
                    'insuficiente': '⏸️'
                }
                st.metric("Tendência", f"{trend_emoji.get(temporal['trend'], '')} {temporal['trend']}")
            
            ds.divider()
            
            # Evolução mensal
            if len(temporal['monthly']) > 0:
                st.markdown("### 📊 Evolução Mensal")
                
                monthly_df = temporal['monthly']
                
                fig = go.Figure()
                
                fig.add_trace(go.Scatter(
                    x=monthly_df['mes'].astype(str),
                    y=monthly_df['POIS'],
                    name='POIs',
                    mode='lines+markers',
                    line=dict(color='#0066CC', width=3),
                    marker=dict(size=8)
                ))
                
                if 'HECTARES_MAPEADOS' in monthly_df.columns:
                    fig.add_trace(go.Scatter(
                        x=monthly_df['mes'].astype(str),
                        y=monthly_df['HECTARES_MAPEADOS'],
                        name='Hectares',
                        mode='lines+markers',
                        line=dict(color='#28A745', width=3),
                        marker=dict(size=8),
                        yaxis='y2'
                    ))
                
                fig.update_layout(
                    title='Evolução Mensal de POIs e Hectares',
                    xaxis_title='Mês',
                    yaxis_title='POIs',
                    yaxis2=dict(
                        title='Hectares',
                        overlaying='y',
                        side='right'
                    ),
                    height=400,
                    hovermode='x unified'
                )
                
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
            
            # Evolução trimestral
            if len(temporal['quarterly']) > 0:
                st.markdown("### 📊 Evolução Trimestral")
                
                quarterly_df = temporal['quarterly']
                
                fig = px.bar(
                    quarterly_df,
                    x='trimestre',
                    y='POIS',
                    title='POIs por Trimestre',
                    color='POIS',
                    color_continuous_scale='Blues',
                    text='POIS'
                )
                
                fig.update_traces(texttemplate='%{text:,.0f}', textposition='outside')
                fig.update_layout(height=350, showlegend=False)
                
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Dados de datas não disponíveis para análise temporal.")
    
    # ==================== TAB 3: COBERTURA ====================
    with tab3:
        st.subheader("🗺️ Cobertura Territorial")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Municípios Total", coverage['municipios_total'])
        with col2:
            st.metric("Densidade Média", f"{coverage['densidade_media']:.2f} POIs/ha")
        with col3:
            st.metric("Alta Densidade", f"{coverage['municipios_alta_densidade']}")
        with col4:
            pct_alta = (coverage['municipios_alta_densidade'] / coverage['municipios_total'] * 100) if coverage['municipios_total'] > 0 else 0
            st.metric("% Alta Densidade", f"{pct_alta:.1f}%")
        
        ds.divider()
        
        # Distribuição de cobertura
        if len(coverage['cobertura_por_municipio']) > 0:
            cob_df = coverage['cobertura_por_municipio']
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("### 📊 Distribuição de POIs")
                
                fig = px.histogram(
                    cob_df,
                    x='POIS',
                    nbins=20,
                    title='Distribuição de POIs por Município',
                    labels={'POIS': 'Número de POIs', 'count': 'Frequência'}
                )
                
                fig.update_layout(height=350, showlegend=False)
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                st.markdown("### 📊 Distribuição de Hectares")
                
                fig = px.histogram(
                    cob_df,
                    x='HECTARES_MAPEADOS',
                    nbins=20,
                    title='Distribuição de Hectares por Município',
                    labels={'HECTARES_MAPEADOS': 'Hectares', 'count': 'Frequência'}
                )
                
                fig.update_layout(height=350, showlegend=False)
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
            
            # Scatter densidade
            st.markdown("### 🎯 Densidade Operacional por Município")
            
            fig = px.scatter(
                cob_df.head(50),
                x='HECTARES_MAPEADOS',
                y='POIS',
                size='densidade',
                hover_name=cob_df.columns[0],
                title='POIs vs Hectares (tamanho = densidade)',
                labels={'POIS': 'Número de POIs', 'HECTARES_MAPEADOS': 'Hectares Mapeados'}
            )
            
            fig.update_layout(height=400)
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
    
    # ==================== TAB 4: CATEGORIAS ====================
    with tab4:
        st.subheader("📦 Categorias de POIs")
        
        if len(categories['top_10']) > 0:
            # Top 10 categorias
            st.markdown("### 🏆 Top 10 Categorias")
            
            fig = px.bar(
                categories['top_10'],
                x='total',
                y='categoria',
                orientation='h',
                title='',
                color='percentual',
                color_continuous_scale='RdYlGn',
                text='percentual'
            )
            
            fig.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
            fig.update_layout(
                yaxis={'categoryorder': 'total ascending'},
                height=450
            )
            
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
            
            # Tabela completa
            st.markdown("### 📋 Todas as Categorias")
            
            st.dataframe(
                categories['categories'][['categoria', 'total', 'percentual']],
                use_container_width=True,
                height=400,
                hide_index=True
            )
            
            # Gráfico de pizza
            st.markdown("### 🥧 Distribuição Percentual")
            
            fig = px.pie(
                categories['top_10'],
                values='total',
                names='categoria',
                title='Top 10 Categorias (% do total)'
            )
            
            fig.update_traces(textposition='inside', textinfo='percent+label')
            fig.update_layout(height=500)
            
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Dados de categorias não disponíveis.")
    
    ds.divider()
    
    # Resumo
    st.subheader("📋 Resumo de Performance")
    
    summary = performance_analyzer.get_summary(df)
    st.markdown(summary)

if __name__ == "__main__":
    main()
