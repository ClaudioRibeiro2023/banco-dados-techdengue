"""
Página Insights - Insights e Recomendações
Dashboard CISARP Enterprise
"""

import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="Insights - Dashboard CISARP",
    page_icon="💡",
    layout="wide"
)

from dashboard.shared.design_system import ds
from dashboard.modules import (
    settings,
    performance_analyzer,
    insights_generator
)

ds.inject_custom_css()

# ==================== CARREGAMENTO ====================

@st.cache_data(ttl=settings.CACHE_TTL)
def load_data():
    try:
        data_path = settings.DADOS_DIR / "cisarp_dados_validados.csv"
        if data_path.exists():
            return pd.read_csv(data_path)
        alt_path = settings.DADOS_DIR / "cisarp_completo.csv"
        if alt_path.exists():
            return pd.read_csv(alt_path)
        return pd.DataFrame()
    except:
        return pd.DataFrame()

# ==================== MAIN ====================

def main():
    ds.section_header(
        title="Insights e Recomendações",
        description="Análises automáticas e recomendações estratégicas",
        icon="💡"
    )
    
    df = load_data()
    
    if len(df) == 0:
        st.warning("⚠️ Dados não encontrados.")
        return
    
    # Calcular análises
    with st.spinner("Gerando insights..."):
        kpis = performance_analyzer.calculate_kpis(df)
        temporal = performance_analyzer.temporal_evolution(df)
        ranking = {
            'cisarp_position': 4,
            'total_contractors': 66,
            'cisarp_percentile': 6.1,
            'gaps': {'to_top': -217, 'to_top3': -12, 'to_top5': 9}
        }
        
        insights = insights_generator.generate_insights(
            kpis=kpis,
            temporal=temporal,
            ranking=ranking,
            impact=None
        )
        
        recommendations = insights_generator.generate_recommendations(
            insights=insights,
            kpis=kpis,
            ranking=ranking
        )
        
        opportunities = insights_generator.identify_opportunities(
            kpis=kpis,
            temporal=temporal
        )
    
    # Tab de navegação
    tab1, tab2, tab3 = st.tabs(["💡 Insights", "🚀 Recomendações", "🎯 Oportunidades"])
    
    # ==================== TAB 1: INSIGHTS ====================
    with tab1:
        st.subheader("🎯 Insights Identificados")
        
        # Contadores
        success_insights = [i for i in insights if i['severity'] == 'success']
        warning_insights = [i for i in insights if i['severity'] == 'warning']
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total de Insights", len(insights))
        with col2:
            st.metric("Pontos Positivos", len(success_insights), delta="✅")
        with col3:
            st.metric("Áreas de Atenção", len(warning_insights), delta="⚠️" if len(warning_insights) > 0 else None)
        
        st.markdown("")
        
        # Mostrar insights por categoria
        categories = {}
        for insight in insights:
            cat = insight['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(insight)
        
        for category, cat_insights in categories.items():
            st.markdown(f"### {category.title()}")
            
            for insight in cat_insights:
                # Cor baseada em severidade
                severity_colors = {
                    'success': '🟢',
                    'info': '🔵',
                    'warning': '🟡',
                    'danger': '🔴'
                }
                icon = severity_colors.get(insight['severity'], '⚪')
                
                with st.expander(f"{icon} {insight['title']}", expanded=False):
                    st.write(insight['description'])
                    
                    col1, col2 = st.columns([2, 1])
                    with col1:
                        if insight.get('action'):
                            st.info(f"**Ação Recomendada:** {insight['action']}")
                    with col2:
                        st.metric("Métrica", insight['metric'])
    
    # ==================== TAB 2: RECOMENDAÇÕES ====================
    with tab2:
        st.subheader("🚀 Recomendações Estratégicas")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("### 🔴 Curto Prazo")
            st.caption("1-3 meses")
            for i, rec in enumerate(recommendations['curto_prazo'], 1):
                st.markdown(f"{i}. {rec}")
        
        with col2:
            st.markdown("### 🟡 Médio Prazo")
            st.caption("3-6 meses")
            for i, rec in enumerate(recommendations['medio_prazo'], 1):
                st.markdown(f"{i}. {rec}")
        
        with col3:
            st.markdown("### 🟢 Longo Prazo")
            st.caption("6-12 meses")
            for i, rec in enumerate(recommendations['longo_prazo'], 1):
                st.markdown(f"{i}. {rec}")
        
        st.markdown("")
        ds.divider()
        
        # Priorização visual
        st.subheader("📊 Matriz de Priorização")
        
        st.info("""
        **Critérios de Priorização:**
        - **Curto Prazo:** Ações de impacto imediato e baixa complexidade
        - **Médio Prazo:** Projetos estruturantes de médio impacto
        - **Longo Prazo:** Iniciativas estratégicas de longo alcance
        """)
    
    # ==================== TAB 3: OPORTUNIDADES ====================
    with tab3:
        st.subheader("🎯 Oportunidades Identificadas")
        
        if len(opportunities) == 0:
            st.info("Nenhuma oportunidade crítica identificada no momento.")
        else:
            for opp in opportunities:
                with st.expander(f"📌 {opp['titulo']}", expanded=True):
                    st.write(opp['descricao'])
                    
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Potencial", opp['potencial'])
                    with col2:
                        st.metric("Esforço", opp['esforco'])
                    with col3:
                        st.caption("**Impacto Esperado:**")
                        st.write(opp['impacto_esperado'])
        
        st.markdown("")
        ds.divider()
        
        # Matriz Impacto x Esforço
        st.subheader("📊 Matriz Impacto x Esforço")
        
        if len(opportunities) > 0:
            import plotly.graph_objects as go
            
            # Mapear valores
            potencial_map = {'Alto': 3, 'Médio': 2, 'Baixo': 1}
            esforco_map = {'Alto': 3, 'Médio': 2, 'Baixo': 1}
            
            x = [esforco_map.get(opp['esforco'], 2) for opp in opportunities]
            y = [potencial_map.get(opp['potencial'], 2) for opp in opportunities]
            labels = [opp['titulo'] for opp in opportunities]
            
            fig = go.Figure(data=go.Scatter(
                x=x,
                y=y,
                mode='markers+text',
                text=labels,
                textposition='top center',
                marker=dict(size=20, color='blue'),
                textfont=dict(size=10)
            ))
            
            fig.update_layout(
                title='Oportunidades por Impacto e Esforço',
                xaxis_title='Esforço Requerido',
                yaxis_title='Potencial de Impacto',
                xaxis=dict(tickmode='array', tickvals=[1, 2, 3], ticktext=['Baixo', 'Médio', 'Alto']),
                yaxis=dict(tickmode='array', tickvals=[1, 2, 3], ticktext=['Baixo', 'Médio', 'Alto']),
                height=400
            )
            
            # Adicionar quadrantes
            fig.add_hline(y=2, line_dash="dash", line_color="gray", opacity=0.5)
            fig.add_vline(x=2, line_dash="dash", line_color="gray", opacity=0.5)
            
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
            
            st.caption("""
            **Interpretação:**
            - **Canto Superior Esquerdo:** Quick wins (alto impacto, baixo esforço) - PRIORIZAR
            - **Canto Superior Direito:** Projetos estratégicos (alto impacto, alto esforço)
            - **Canto Inferior Esquerdo:** Melhorias incrementais
            - **Canto Inferior Direito:** Evitar (baixo impacto, alto esforço)
            """)
    
    ds.divider()
    
    # Resumo final
    st.subheader("📋 Resumo Executivo")
    
    summary = insights_generator.get_summary(insights, recommendations)
    st.markdown(summary)
    
    # Download de insights
    st.markdown("")
    if st.button("📥 Exportar Insights (JSON)", use_container_width=True):
        import json
        
        export_data = {
            'insights': insights,
            'recommendations': recommendations,
            'opportunities': opportunities,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        json_str = json.dumps(export_data, indent=2, ensure_ascii=False)
        st.download_button(
            label="⬇️ Download JSON",
            data=json_str,
            file_name=f"cisarp_insights_{pd.Timestamp.now().strftime('%Y%m%d')}.json",
            mime="application/json"
        )

if __name__ == "__main__":
    main()
