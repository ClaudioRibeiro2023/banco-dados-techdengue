"""
Página Benchmarking - Ranking e Comparações
Dashboard CISARP Enterprise
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Benchmarking - Dashboard CISARP",
    page_icon="🏆",
    layout="wide"
)

from dashboard.shared.design_system import ds
from dashboard.modules import (
    settings,
    benchmark_analyzer,
)

ds.inject_custom_css()

# ==================== DADOS MOCK ====================
# Em produção, carregar dados reais de todas as atividades TechDengue

@st.cache_data(ttl=settings.CACHE_TTL)
def load_all_activities():
    """
    Carrega todas as atividades TechDengue para benchmarking
    Em produção, usar: base_dados/dados_techdengue/Atividades Techdengue.xlsx
    """
    # Mock data para demonstração
    data = {
        'CONTRATANTE': ['CISARP', 'ICISMEP', 'CISMAS', 'Outros'] * 27,
        'ATIVIDADES': [108, 221, 120, 50] * 27,
        'POIS': [13584, 28000, 15000, 6000] * 27,
        'HECTARES_MAPEADOS': [9440, 18000, 12000, 5000] * 27
    }
    return pd.DataFrame(data)

# ==================== MAIN ====================

def main():
    ds.section_header(
        title="Benchmarking Nacional",
        description="Posicionamento e comparação com outros contratantes",
        icon="🏆"
    )
    
    # Carregar dados
    df_all = load_all_activities()
    
    # Calcular ranking
    with st.spinner("Calculando posicionamento..."):
        ranking = benchmark_analyzer.rank_contractors(df_all, contractor_name='CISARP')
    
    # ==================== POSICIONAMENTO CISARP ====================
    st.subheader("🎯 Posicionamento CISARP")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        ds.metric_card(
            title="Posição Nacional",
            value=f"{ranking['cisarp_position']}º",
            delta=f"de {ranking['total_contractors']} contratantes",
            color="primary",
            icon="🏆"
        )
    
    with col2:
        ds.metric_card(
            title="Percentil",
            value=f"Top {ranking['cisarp_percentile']:.1f}%",
            color="success",
            icon="📊"
        )
    
    with col3:
        if ranking['cisarp_activities']:
            ds.metric_card(
                title="Atividades",
                value=str(ranking['cisarp_activities']),
                color="info",
                icon="📍"
            )
    
    with col4:
        gap_top3 = ranking['gaps']['to_top3']
        if gap_top3:
            ds.metric_card(
                title="Gap para Top 3",
                value=f"{abs(gap_top3)}",
                delta="atividades" if gap_top3 < 0 else "Já no Top 3!",
                color="warning" if gap_top3 < 0 else "success",
                icon="🎯"
            )
    
    st.markdown("")
    
    # Mensagem de contexto
    if ranking['cisarp_position'] and ranking['cisarp_position'] <= 5:
        ds.info_box(
            f"🌟 **Excelente!** CISARP está entre os Top 5 contratantes nacionais, demonstrando liderança em cobertura.",
            box_type='success',
            icon='🏆'
        )
    elif ranking['cisarp_position'] and ranking['cisarp_position'] <= 10:
        ds.info_box(
            f"✅ **Muito Bom!** CISARP está no Top 10 nacional, com potencial para crescimento.",
            box_type='info',
            icon='📈'
        )
    
    ds.divider()
    
    # ==================== RANKING COMPLETO ====================
    st.subheader("📊 Ranking Nacional")
    
    tab1, tab2 = st.tabs(["🏆 Top 10", "📋 Ranking Completo"])
    
    with tab1:
        if len(ranking['top_10']) > 0:
            # Gráfico de barras do Top 10
            fig = px.bar(
                ranking['top_10'],
                x='atividades',
                y='CONTRATANTE',
                orientation='h',
                title='Top 10 Contratantes por Número de Atividades',
                color='atividades',
                color_continuous_scale='Blues',
                text='atividades'
            )
            
            fig.update_layout(
                yaxis={'categoryorder': 'total ascending'},
                height=500,
                showlegend=False
            )
            
            fig.update_traces(texttemplate='%{text}', textposition='outside')
            
            # Destacar CISARP
            colors = ['#0066CC' if x == 'CISARP' else '#1f77b4' 
                     for x in ranking['top_10']['CONTRATANTE']]
            fig.update_traces(marker_color=colors)
            
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
            
            # Tabela do Top 10
            st.markdown("### 📋 Detalhes Top 10")
            st.dataframe(
                ranking['top_10'][['posicao', 'CONTRATANTE', 'atividades', 'percentil']],
                use_container_width=True,
                hide_index=True
            )
    
    with tab2:
        if len(ranking['ranking_completo']) > 0:
            # Tabela completa com busca
            search = st.text_input("🔎 Buscar contratante", placeholder="Digite o nome...")
            
            df_display = ranking['ranking_completo']
            if search:
                df_display = df_display[
                    df_display['CONTRATANTE'].str.contains(search, case=False, na=False)
                ]
            
            st.dataframe(
                df_display[['posicao', 'CONTRATANTE', 'atividades', 'percentil']],
                use_container_width=True,
                height=400,
                hide_index=True
            )
            
            st.caption(f"Mostrando {len(df_display)} de {len(ranking['ranking_completo'])} contratantes")
    
    ds.divider()
    
    # ==================== COMPARAÇÃO COM TOP ====================
    st.subheader("⚖️ Comparação com Top Contratantes")
    
    # Comparar CISARP com Top 3
    top_3_names = ranking['top_10']['CONTRATANTE'].head(3).tolist() if len(ranking['top_10']) > 0 else []
    
    comparison = benchmark_analyzer.compare_metrics(
        df_all,
        contractor='CISARP',
        comparison_group=top_3_names
    )
    
    if comparison['metrics']:
        col1, col2, col3 = st.columns(3)
        
        metrics_to_show = ['POIS', 'HECTARES_MAPEADOS']
        
        for idx, (metric_name, metric_data) in enumerate(comparison['metrics'].items()):
            if metric_name in metrics_to_show:
                with [col1, col2, col3][idx % 3]:
                    st.markdown(f"### {metric_name}")
                    
                    # Gráfico de comparação
                    fig = go.Figure(data=[
                        go.Bar(
                            name='CISARP',
                            x=['CISARP'],
                            y=[metric_data['contractor_total']],
                            marker_color='#0066CC'
                        ),
                        go.Bar(
                            name='Média Top 3',
                            x=['Média Top 3'],
                            y=[metric_data['group_total'] / 3],
                            marker_color='#28A745'
                        )
                    ])
                    
                    fig.update_layout(
                        showlegend=False,
                        height=250,
                        margin=dict(l=0, r=0, t=10, b=0)
                    )
                    
                    ds.apply_plotly_theme(fig)
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Diferença percentual
                    diff = metric_data['difference_pct']
                    comp = metric_data['comparison']
                    
                    if comp == 'superior':
                        st.success(f"✅ {diff:+.1f}% acima da média Top 3")
                    elif comp == 'inferior':
                        st.warning(f"⚠️ {diff:+.1f}% abaixo da média Top 3")
                    else:
                        st.info(f"➡️ Igual à média Top 3")
        
        # Densidade
        if 'DENSIDADE' in comparison['metrics']:
            st.markdown("### 🎯 Densidade Operacional")
            densidade_data = comparison['metrics']['DENSIDADE']
            
            col1, col2 = st.columns(2)
            with col1:
                st.metric(
                    "CISARP",
                    f"{densidade_data['contractor_mean']:.2f} POIs/ha"
                )
            with col2:
                st.metric(
                    "Média Top 3",
                    f"{densidade_data['group_mean']:.2f} POIs/ha",
                    delta=f"{densidade_data['difference_pct']:+.1f}%"
                )
    
    ds.divider()
    
    # ==================== ANÁLISE DE GAPS ====================
    st.subheader("📈 Análise de Gaps")
    
    gaps = ranking['gaps']
    
    if gaps['to_top']:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            gap_1 = abs(gaps['to_top']) if gaps['to_top'] else 0
            st.metric(
                "Gap para 1º Lugar",
                f"{gap_1} atividades",
                delta="🥇"
            )
        
        with col2:
            gap_3 = abs(gaps['to_top3']) if gaps['to_top3'] else 0
            st.metric(
                "Gap para Top 3",
                f"{gap_3} atividades",
                delta="🥉"
            )
        
        with col3:
            gap_5 = abs(gaps['to_top5']) if gaps['to_top5'] else 0
            status = "Já no Top 5! 🎉" if gap_5 <= 0 else f"{gap_5} atividades"
            st.metric(
                "Gap para Top 5",
                status
            )
        
        st.markdown("")
        
        # Gráfico de gaps
        if gaps['to_top'] and gaps['to_top'] < 0:
            gap_data = pd.DataFrame({
                'Posição': ['1º Lugar', 'Top 3', 'Top 5'],
                'Gap': [abs(gaps['to_top']), abs(gaps['to_top3']), abs(gaps['to_top5'])]
            })
            
            fig = px.bar(
                gap_data,
                x='Posição',
                y='Gap',
                title='Distância para Posições Superiores',
                color='Gap',
                color_continuous_scale='Reds'
            )
            
            fig.update_layout(height=300, showlegend=False)
            
            ds.apply_plotly_theme(fig)
            st.plotly_chart(fig, use_container_width=True)
            
            # Interpretação
            if gaps['to_top3'] and abs(gaps['to_top3']) < 50:
                ds.info_box(
                    f"🎯 **Oportunidade:** Com apenas {abs(gaps['to_top3'])} atividades adicionais, CISARP pode alcançar o Top 3 nacional!",
                    box_type='warning',
                    icon='🚀'
                )
    
    ds.divider()
    
    # ==================== PEERS ====================
    st.subheader("👥 Contratantes Similares (Peers)")
    
    st.info("""
    Peers são contratantes com perfil operacional similar ao CISARP,
    identificados por análise de múltiplas métricas (POIs, hectares, densidade).
    """)
    
    # Em produção, usar: benchmark_analyzer.identify_peers()
    st.markdown("*Funcionalidade disponível com dados completos*")
    
    ds.divider()
    
    # Resumo
    st.subheader("📋 Resumo de Benchmarking")
    
    summary = benchmark_analyzer.get_summary(ranking, comparison)
    st.markdown(summary)
    
    # Export
    if st.button("📥 Exportar Análise de Benchmarking", use_container_width=True):
        import json
        
        export_data = {
            'ranking': ranking['top_10'].to_dict('records') if len(ranking['top_10']) > 0 else [],
            'cisarp_position': ranking['cisarp_position'],
            'comparisons': comparison['metrics'] if comparison['metrics'] else {},
            'gaps': gaps,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        json_str = json.dumps(export_data, indent=2, ensure_ascii=False)
        st.download_button(
            label="⬇️ Download JSON",
            data=json_str,
            file_name=f"cisarp_benchmarking_{pd.Timestamp.now().strftime('%Y%m%d')}.json",
            mime="application/json"
        )

if __name__ == "__main__":
    main()
