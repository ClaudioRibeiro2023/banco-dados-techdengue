"""
Página Impacto Epidemiológico - Análise Before-After
Dashboard CISARP Enterprise
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

st.set_page_config(
    page_title="Impacto - Dashboard CISARP",
    page_icon="💊",
    layout="wide"
)

from dashboard.shared.design_system import ds
from dashboard.modules import (
    settings,
    data_processor,
    impact_analyzer,
    load_cisarp_data as gw_load_cisarp,
)

ds.inject_custom_css()

# ==================== CARREGAMENTO ====================

@st.cache_data(ttl=settings.CACHE_TTL)
def load_cisarp_data():
    try:
        df = gw_load_cisarp()
        return df if df is not None else pd.DataFrame()
    except Exception:
        return pd.DataFrame()

@st.cache_data(ttl=settings.CACHE_TTL)
def load_dengue_data():
    """
    Carrega dados de dengue para análise de impacto
    Em produção: base_dados/dados_dengue/dengue_2023.xlsx, etc.
    """
    # Mock data para demonstração
    # Em produção, carregar dados reais de casos de dengue
    return pd.DataFrame(), pd.DataFrame()

# ==================== MAIN ====================

def main():
    ds.section_header(
        title="Impacto Epidemiológico",
        description="Análise Before-After de casos de dengue",
        icon="💊"
    )
    
    df_cisarp = load_cisarp_data()
    df_dengue_before, df_dengue_after = load_dengue_data()
    
    if len(df_cisarp) == 0:
        st.warning("⚠️ Dados CISARP não encontrados.")
        return
    
    # Avisos sobre dados
    st.info("""
    💡 **Análise de Impacto Epidemiológico**
    
    Esta análise compara os casos de dengue **antes** e **depois** das intervenções CISARP.
    
    **Dados necessários:**
    - Dados de dengue por município (52 semanas epidemiológicas)
    - Período anterior às intervenções (baseline)
    - Período posterior às intervenções (follow-up)
    """)
    
    # Tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "📊 Visão Geral",
        "🎯 Cases de Sucesso",
        "📈 Correlações",
        "🔬 Análise Detalhada"
    ])
    
    # ==================== TAB 1: VISÃO GERAL ====================
    with tab1:
        st.subheader("📊 Impacto Geral")
        
        # Se houver dados de dengue, executar análise
        if len(df_dengue_before) > 0 and len(df_dengue_after) > 0:
            # Análise before-after
            col_municipio = data_processor.identify_municipality_column(df_cisarp)
            municipios_cisarp = df_cisarp[col_municipio].unique().tolist() if col_municipio else []
            
            with st.spinner("Analisando impacto epidemiológico..."):
                impact = impact_analyzer.before_after_analysis(
                    df_dengue_before,
                    df_dengue_after,
                    municipios_cisarp
                )
            
            # KPIs de impacto
            agg = impact['aggregate']
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                ds.metric_card(
                    title="Municípios Analisados",
                    value=str(agg['total_municipios']),
                    color="primary",
                    icon="🏙️"
                )
            
            with col2:
                ds.metric_card(
                    title="Casos Antes",
                    value=f"{agg['casos_antes_total']:,}",
                    color="danger",
                    icon="🦟"
                )
            
            with col3:
                ds.metric_card(
                    title="Casos Depois",
                    value=f"{agg['casos_depois_total']:,}",
                    delta=f"{agg['variacao_media']:.1f}%",
                    color="success" if agg['variacao_media'] < 0 else "warning",
                    icon="💊"
                )
            
            with col4:
                ds.metric_card(
                    title="Casos Evitados",
                    value=f"{abs(agg['reducao_total_absoluta']):,}",
                    color="success",
                    icon="✅"
                )
            
            st.markdown("")
            
            # Segunda linha
            col1, col2, col3 = st.columns(3)
            
            with col1:
                ds.stat_card(
                    title="Variação Média",
                    value=f"{agg['variacao_media']:.1f}%",
                    subtitle="Mudança nos casos",
                    trend=f"{'▼' if agg['variacao_media'] < 0 else '▲'} {abs(agg['variacao_media']):.1f}%",
                    trend_positive=agg['variacao_media'] < 0
                )
            
            with col2:
                ds.stat_card(
                    title="Municípios com Redução",
                    value=str(agg['municipios_com_reducao']),
                    subtitle=f"{(agg['municipios_com_reducao']/agg['total_municipios']*100):.1f}% do total"
                )
            
            with col3:
                ds.stat_card(
                    title="Municípios com Aumento",
                    value=str(agg['municipios_com_aumento']),
                    subtitle=f"{(agg['municipios_com_aumento']/agg['total_municipios']*100):.1f}% do total"
                )
            
            ds.divider()
            
            # Distribuição de impacto
            st.markdown("### 📊 Distribuição de Impacto")
            
            if len(impact['individual']) > 0:
                df_impact = impact['individual']
                
                col1, col2 = st.columns(2)
                
                with col1:
                    # Histograma de variação percentual
                    fig = px.histogram(
                        df_impact,
                        x='variacao_percentual',
                        nbins=20,
                        title='Distribuição de Variação Percentual',
                        labels={'variacao_percentual': 'Variação (%)', 'count': 'Frequência'},
                        color_discrete_sequence=['#0066CC']
                    )
                    
                    fig.add_vline(x=0, line_dash="dash", line_color="red", annotation_text="Sem mudança")
                    fig.update_layout(height=350)
                    
                    ds.apply_plotly_theme(fig)
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    # Distribuição por classificação
                    dist_data = impact['distribution']['distribution']
                    
                    if dist_data:
                        fig = px.pie(
                            values=list(dist_data.values()),
                            names=list(dist_data.keys()),
                            title='Classificação de Impacto'
                        )
                        
                        fig.update_traces(textposition='inside', textinfo='percent+label')
                        fig.update_layout(height=350)
                        
                        ds.apply_plotly_theme(fig)
                        st.plotly_chart(fig, use_container_width=True)
                
                # Gráfico before-after agregado
                st.markdown("### 📉 Comparação Before-After")
                
                fig = go.Figure(data=[
                    go.Bar(
                        name='Antes',
                        x=['Total de Casos'],
                        y=[agg['casos_antes_total']],
                        marker_color='#DC3545',
                        text=[f"{agg['casos_antes_total']:,}"],
                        textposition='auto'
                    ),
                    go.Bar(
                        name='Depois',
                        x=['Total de Casos'],
                        y=[agg['casos_depois_total']],
                        marker_color='#28A745',
                        text=[f"{agg['casos_depois_total']:,}"],
                        textposition='auto'
                    )
                ])
                
                fig.update_layout(
                    title='Casos de Dengue: Antes vs Depois das Intervenções',
                    barmode='group',
                    height=400
                )
                
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
        
        else:
            # Mock visualization quando não há dados
            st.markdown("### 📊 Análise de Impacto (Exemplo)")
            
            # Dados exemplo
            exemplo_data = {
                'total_municipios': 108,
                'casos_antes_total': 15420,
                'casos_depois_total': 12336,
                'variacao_media': -20.0,
                'reducao_total_absoluta': -3084,
                'municipios_com_reducao': 72
            }
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                ds.metric_card(
                    title="Municípios",
                    value="108",
                    color="primary",
                    icon="🏙️"
                )
            
            with col2:
                ds.metric_card(
                    title="Casos Antes",
                    value="15.420",
                    color="danger",
                    icon="🦟"
                )
            
            with col3:
                ds.metric_card(
                    title="Casos Depois",
                    value="12.336",
                    delta="-20.0%",
                    color="success",
                    icon="💊"
                )
            
            with col4:
                ds.metric_card(
                    title="Casos Evitados",
                    value="3.084",
                    color="success",
                    icon="✅"
                )
            
            st.info("💡 Execute os scripts de análise de impacto para gerar dados reais.")
    
    # ==================== TAB 2: CASES DE SUCESSO ====================
    with tab2:
        st.subheader("🎯 Cases de Sucesso")
        
        st.markdown("""
        Cases de sucesso são municípios que apresentaram:
        - ✅ Redução **superior a 15%** nos casos de dengue
        - ✅ Mínimo de **50 casos** no período anterior (relevância estatística)
        - ✅ Intervenções CISARP realizadas
        """)
        
        # Se houver dados, mostrar cases reais
        if len(df_dengue_before) > 0 and 'individual' in locals():
            success_cases = impact['cases_success']
            
            if len(success_cases) > 0:
                st.markdown(f"### 🏆 Top {len(success_cases)} Cases de Sucesso")
                
                for idx, case in success_cases.iterrows():
                    with st.expander(
                        f"🏆 {idx+1}º - Município {case['municipio']} ({case['variacao_percentual']:.1f}%)",
                        expanded=idx < 3
                    ):
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.metric("Casos Antes", f"{case['casos_antes']:,}")
                        with col2:
                            st.metric("Casos Depois", f"{case['casos_depois']:,}")
                        with col3:
                            st.metric("Redução", f"{abs(case['variacao_absoluta']):,} casos")
                        
                        # Gráfico de pizza do case
                        fig = go.Figure(data=[go.Pie(
                            labels=['Casos Evitados', 'Casos Remanescentes'],
                            values=[abs(case['variacao_absoluta']), case['casos_depois']],
                            marker_colors=['#28A745', '#FFA500']
                        )])
                        
                        fig.update_layout(
                            title=f"Impacto em {case['municipio']}",
                            height=300
                        )
                        
                        ds.apply_plotly_theme(fig)
                        st.plotly_chart(fig, use_container_width=True)
                        
                        # Score de sucesso
                        if 'score_sucesso' in case:
                            ds.progress_bar(
                                value=case['score_sucesso'],
                                max_value=100,
                                color='#28A745',
                                show_label=True
                            )
                            st.caption(f"Score de Sucesso: {case['score_sucesso']}/100")
            else:
                st.info("Nenhum case de sucesso identificado com os critérios estabelecidos.")
        else:
            st.info("💡 Dados de impacto não disponíveis. Execute análise de impacto epidemiológico.")
    
    # ==================== TAB 3: CORRELAÇÕES ====================
    with tab3:
        st.subheader("📈 Análise de Correlações")
        
        st.markdown("""
        Análise estatística da relação entre **intervenções CISARP** e **redução de casos de dengue**.
        
        **Métricas analisadas:**
        - Correlação POIs x Variação de Casos
        - Correlação Hectares x Variação de Casos
        - Correlação Número de Atividades x Variação de Casos
        """)
        
        if len(df_dengue_before) > 0 and 'individual' in locals():
            # Calcular correlações
            correlations = impact_analyzer.correlation_analysis(
                df_cisarp,
                impact['individual']
            )
            
            if correlations.get('correlation_pois'):
                # Resultados das correlações
                st.markdown("### 📊 Resultados Estatísticos")
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    corr_pois = correlations['correlation_pois']
                    st.markdown("#### POIs")
                    st.metric("Coeficiente", f"{corr_pois['coefficient']:.3f}")
                    st.metric("P-value", f"{corr_pois['p_value']:.4f}")
                    
                    if corr_pois['significant']:
                        st.success(f"✅ Significativo ({corr_pois['strength']})")
                    else:
                        st.warning("⚠️ Não significativo")
                
                with col2:
                    corr_hec = correlations['correlation_hectares']
                    st.markdown("#### Hectares")
                    st.metric("Coeficiente", f"{corr_hec['coefficient']:.3f}")
                    st.metric("P-value", f"{corr_hec['p_value']:.4f}")
                    
                    if corr_hec['significant']:
                        st.success(f"✅ Significativo ({corr_hec['strength']})")
                    else:
                        st.warning("⚠️ Não significativo")
                
                with col3:
                    if correlations.get('correlation_activities'):
                        corr_act = correlations['correlation_activities']
                        st.markdown("#### Atividades")
                        st.metric("Coeficiente", f"{corr_act['coefficient']:.3f}")
                        st.metric("P-value", f"{corr_act['p_value']:.4f}")
                        
                        if corr_act['significant']:
                            st.success(f"✅ Significativo ({corr_act['strength']})")
                        else:
                            st.warning("⚠️ Não significativo")
                
                # Interpretação
                st.markdown("### 💡 Interpretação")
                ds.info_box(
                    correlations['interpretation'],
                    box_type='success' if 'Forte' in correlations['interpretation'] else 'info',
                    icon='📊'
                )
                
                st.caption(f"**n = {correlations['n_observations']}** observações analisadas")
        else:
            st.info("💡 Execute análise de impacto para visualizar correlações.")
    
    # ==================== TAB 4: ANÁLISE DETALHADA ====================
    with tab4:
        st.subheader("🔬 Análise Detalhada por Município")
        
        if len(df_dengue_before) > 0 and 'individual' in locals():
            df_impact = impact['individual']
            
            if len(df_impact) > 0:
                # Filtros
                col1, col2 = st.columns(2)
                
                with col1:
                    classificacao_filtro = st.multiselect(
                        "Filtrar por Classificação",
                        options=df_impact['classificacao'].unique().tolist(),
                        default=None
                    )
                
                with col2:
                    ordem = st.selectbox(
                        "Ordenar por",
                        options=[
                            'Maior Redução',
                            'Menor Redução',
                            'Maior Impacto Absoluto'
                        ]
                    )
                
                # Aplicar filtros
                df_filtered = df_impact.copy()
                
                if classificacao_filtro:
                    df_filtered = df_filtered[df_filtered['classificacao'].isin(classificacao_filtro)]
                
                # Ordenar
                if ordem == 'Maior Redução':
                    df_filtered = df_filtered.sort_values('variacao_percentual')
                elif ordem == 'Menor Redução':
                    df_filtered = df_filtered.sort_values('variacao_percentual', ascending=False)
                else:
                    df_filtered = df_filtered.sort_values('variacao_absoluta')
                
                # Tabela detalhada
                st.markdown(f"### 📋 Detalhamento ({len(df_filtered)} municípios)")
                
                st.dataframe(
                    df_filtered[[
                        'municipio',
                        'casos_antes',
                        'casos_depois',
                        'variacao_absoluta',
                        'variacao_percentual',
                        'classificacao'
                    ]].style.format({
                        'casos_antes': '{:,.0f}',
                        'casos_depois': '{:,.0f}',
                        'variacao_absoluta': '{:+,.0f}',
                        'variacao_percentual': '{:+.1f}%'
                    }),
                    use_container_width=True,
                    height=400
                )
                
                # Scatter plot
                st.markdown("### 📊 Visualização Scatter")
                
                fig = px.scatter(
                    df_filtered,
                    x='casos_antes',
                    y='variacao_percentual',
                    size='casos_depois',
                    color='classificacao',
                    hover_name='municipio',
                    title='Casos Antes vs Variação Percentual',
                    labels={
                        'casos_antes': 'Casos Antes',
                        'variacao_percentual': 'Variação (%)',
                        'classificacao': 'Classificação'
                    }
                )
                
                fig.add_hline(y=0, line_dash="dash", line_color="red", annotation_text="Sem mudança")
                fig.update_layout(height=500)
                
                ds.apply_plotly_theme(fig)
                st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("💡 Análise detalhada disponível após execução dos scripts de impacto.")
    
    ds.divider()
    
    # Resumo final
    st.subheader("📋 Resumo de Impacto Epidemiológico")
    
    if 'impact' in locals() and impact['individual'] is not None and len(impact['individual']) > 0:
        summary = impact_analyzer.get_summary(impact, correlations if 'correlations' in locals() else None)
        st.markdown(summary)
    else:
        st.info("""
        **Para gerar análise de impacto epidemiológico:**
        
        1. Execute o script: `python 04_analise_impacto_epidemiologico.py`
        2. Certifique-se de ter dados de dengue antes e depois das intervenções
        3. Atualize esta página
        """)

if __name__ == "__main__":
    main()
