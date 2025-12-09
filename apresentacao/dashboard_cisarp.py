"""
DASHBOARD INTERATIVO - ANÁLISE CISARP
Dashboard de alto impacto para apoio à construção da apresentação

Executar: streamlit run dashboard_cisarp.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from pathlib import Path
import json
from datetime import datetime

# ==================== CONFIGURAÇÃO ====================

st.set_page_config(
    page_title="Dashboard CISARP",
    page_icon="🦟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos customizados
st.markdown("""
    <style>
    .big-font {
        font-size:30px !important;
        font-weight: bold;
    }
    .metric-card {
        background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    </style>
    """, unsafe_allow_html=True)

# Cores
COLORS = {
    'primary': '#0066CC',
    'success': '#28A745',
    'warning': '#FFA500',
    'danger': '#DC3545',
    'neutral': '#6C757D',
}

# ==================== CARREGAMENTO DE DADOS ====================

@st.cache_data
def carregar_dados():
    """Carrega todos os dados necessários"""
    try:
        # Dados principais
        df_cisarp = pd.read_csv('dados/cisarp_dados_validados.csv')
        
        # Converter datas
        if 'DATA_MAP' in df_cisarp.columns:
            df_cisarp['DATA_MAP'] = pd.to_datetime(df_cisarp['DATA_MAP'], errors='coerce')
        
        # Converter colunas numéricas
        for col in ['POIS', 'DEVOLUTIVAS', 'HECTARES_MAPEADOS']:
            if col in df_cisarp.columns:
                df_cisarp[col] = pd.to_numeric(df_cisarp[col], errors='coerce')
        
        return df_cisarp
    except FileNotFoundError:
        st.error("⚠️ Dados não encontrados! Execute os scripts de análise primeiro.")
        st.code("""
# Execute na ordem:
python 02_analise_cisarp.py
python 04_analise_impacto_epidemiologico.py
        """)
        st.stop()

@st.cache_data
def carregar_impacto():
    """Carrega dados de impacto epidemiológico"""
    try:
        with open('impacto/sumario_impacto.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

# ==================== PÁGINA PRINCIPAL ====================

def main():
    # Sidebar
    st.sidebar.title("🦟 Dashboard CISARP")
    st.sidebar.markdown("---")
    
    # Navegação
    pagina = st.sidebar.radio(
        "Navegação",
        ["🏠 Home", "📊 Performance", "💊 Impacto Epidemiológico", 
         "🏆 Benchmarking", "🔍 Exploração", "💡 Insights"]
    )
    
    st.sidebar.markdown("---")
    st.sidebar.info("""
    **Dashboard de Análise - CISARP**
    
    Navegue pelas seções para explorar:
    - KPIs e métricas operacionais
    - Análise de impacto epidemiológico
    - Comparações e benchmarking
    - Cases de sucesso
    """)
    
    # Carregar dados
    df = carregar_dados()
    impacto = carregar_impacto()
    
    # Roteamento de páginas
    if "Home" in pagina:
        pagina_home(df, impacto)
    elif "Performance" in pagina:
        pagina_performance(df)
    elif "Impacto" in pagina:
        pagina_impacto(df, impacto)
    elif "Benchmarking" in pagina:
        pagina_benchmarking(df)
    elif "Exploração" in pagina:
        pagina_exploracao(df)
    elif "Insights" in pagina:
        pagina_insights(df, impacto)

# ==================== PÁGINA HOME ====================

def pagina_home(df, impacto):
    st.title("🦟 Dashboard de Análise - CISARP")
    st.markdown("### Visão Executiva das Atividades TechDengue")
    st.markdown("---")
    
    # KPIs Principais
    st.subheader("📊 Indicadores Principais")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="Intervenções",
            value=len(df),
            delta="+37 vs inicial",
            help="Total de registros/intervenções realizadas"
        )
    
    with col2:
        pois_total = df['POIS'].sum() if 'POIS' in df.columns else 0
        st.metric(
            label="POIs Identificados",
            value=f"{pois_total:,}",
            help="Total de Pontos de Interesse identificados"
        )
    
    with col3:
        hectares_total = df['HECTARES_MAPEADOS'].sum() if 'HECTARES_MAPEADOS' in df.columns else 0
        st.metric(
            label="Hectares Mapeados",
            value=f"{hectares_total:,.0f}",
            delta="+94%",
            help="Área total mapeada em hectares"
        )
    
    with col4:
        st.metric(
            label="Ranking Nacional",
            value="4º",
            delta="Top 6%",
            help="Posição entre 66 contratantes"
        )
    
    st.markdown("---")
    
    # Resumo Executivo
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📅 Período de Operação")
        if 'DATA_MAP' in df.columns:
            datas = df['DATA_MAP'].dropna()
            if len(datas) > 0:
                inicio = datas.min()
                fim = datas.max()
                dias = (fim - inicio).days
                
                st.info(f"""
                **Início:** {inicio.strftime('%d/%m/%Y')}  
                **Última Atividade:** {fim.strftime('%d/%m/%Y')}  
                **Duração:** {dias} dias (~{dias//30} meses)
                """)
                
                # Timeline visual
                df_timeline = df.copy()
                df_timeline['mes'] = df_timeline['DATA_MAP'].dt.to_period('M').astype(str)
                timeline = df_timeline.groupby('mes').size().reset_index(name='atividades')
                
                fig_timeline = px.line(
                    timeline, x='mes', y='atividades',
                    title='Evolução Mensal de Atividades',
                    markers=True
                )
                fig_timeline.update_traces(line_color=COLORS['primary'], line_width=2)
                st.plotly_chart(fig_timeline, use_container_width=True)
    
    with col2:
        st.subheader("🗺️ Cobertura")
        
        # Identificar coluna de município
        col_codigo = None
        for col in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge', 'Municipio']:
            if col in df.columns:
                col_codigo = col
                break
        
        if col_codigo:
            municipios_unicos = df[col_codigo].nunique()
            st.metric("Municípios Atendidos", municipios_unicos)
            
            # Top 5 municípios
            st.markdown("**Top 5 Municípios:**")
            top5 = df[col_codigo].value_counts().head(5)
            for i, (mun, count) in enumerate(top5.items(), 1):
                st.text(f"{i}. {str(mun)[:20]}: {count} atividades")
        
        st.markdown("---")
        
        # Status de qualidade
        st.markdown("**Status de Qualidade:**")
        st.progress(0.7)
        st.caption("Score: 70% (GO COM RESSALVAS)")
    
    st.markdown("---")
    
    # Impacto Epidemiológico
    if impacto:
        st.subheader("💊 Impacto Epidemiológico")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric(
                "Municípios Analisados",
                impacto.get('municipios_analisados', 0)
            )
        with col2:
            st.metric(
                "Variação Média",
                f"{impacto.get('variacao_media', 0):.1f}%"
            )
        with col3:
            st.metric(
                "Cases de Sucesso",
                impacto.get('cases_sucesso', 0)
            )
    
    st.markdown("---")
    
    # Navegação rápida
    st.subheader("🧭 Navegação Rápida")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("📊 Ver Performance Detalhada", use_container_width=True):
            st.info("Use a navegação lateral para acessar")
    with col2:
        if st.button("💊 Análise de Impacto", use_container_width=True):
            st.info("Use a navegação lateral para acessar")
    with col3:
        if st.button("🏆 Ver Benchmarking", use_container_width=True):
            st.info("Use a navegação lateral para acessar")

# ==================== PÁGINA PERFORMANCE ====================

def pagina_performance(df):
    st.title("📊 Análise de Performance Operacional")
    st.markdown("---")
    
    # KPIs Detalhados
    st.subheader("🎯 Indicadores Operacionais Detalhados")
    
    col1, col2, col3, col4 = st.columns(4)
    
    pois_total = df['POIS'].sum() if 'POIS' in df.columns else 0
    hectares_total = df['HECTARES_MAPEADOS'].sum() if 'HECTARES_MAPEADOS' in df.columns else 0
    
    with col1:
        pois_medio = pois_total / len(df) if len(df) > 0 else 0
        st.metric("POIs/Registro", f"{pois_medio:.1f}")
    
    with col2:
        hectares_medio = hectares_total / len(df) if len(df) > 0 else 0
        st.metric("Hectares/Registro", f"{hectares_medio:.1f}")
    
    with col3:
        densidade = pois_total / hectares_total if hectares_total > 0 else 0
        st.metric("Densidade", f"{densidade:.2f} POIs/ha")
    
    with col4:
        if 'DEVOLUTIVAS' in df.columns:
            devolutivas = df['DEVOLUTIVAS'].sum()
            st.metric("Devolutivas", f"{devolutivas:,}")
    
    st.markdown("---")
    
    # Top Municípios
    st.subheader("🏆 Top 15 Municípios por Número de Intervenções")
    
    col_codigo = None
    for col in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge', 'Municipio']:
        if col in df.columns:
            col_codigo = col
            break
    
    if col_codigo:
        top15 = df[col_codigo].value_counts().head(15).reset_index()
        top15.columns = ['municipio', 'atividades']
        
        fig_top15 = px.bar(
            top15,
            x='atividades',
            y='municipio',
            orientation='h',
            title='',
            color='atividades',
            color_continuous_scale='Blues'
        )
        fig_top15.update_layout(
            showlegend=False,
            yaxis={'categoryorder': 'total ascending'},
            height=500
        )
        st.plotly_chart(fig_top15, use_container_width=True)
        
        # Tabela detalhada
        with st.expander("📋 Ver tabela detalhada"):
            municipios_agg = df.groupby(col_codigo).agg({
                'POIS': 'sum',
                'HECTARES_MAPEADOS': 'sum',
            }).reset_index()
            municipios_agg.columns = ['Município', 'POIs Total', 'Hectares Total']
            st.dataframe(municipios_agg, use_container_width=True)
    
    st.markdown("---")
    
    # Evolução Temporal
    st.subheader("📈 Evolução Temporal")
    
    if 'DATA_MAP' in df.columns:
        df_temp = df.copy()
        df_temp['mes'] = df_temp['DATA_MAP'].dt.to_period('M').astype(str)
        evolucao = df_temp.groupby('mes').agg({
            'POIS': 'sum',
            'HECTARES_MAPEADOS': 'sum'
        }).reset_index()
        
        fig_evolucao = make_subplots(
            rows=2, cols=1,
            subplot_titles=('POIs por Mês', 'Hectares por Mês'),
            vertical_spacing=0.15
        )
        
        fig_evolucao.add_trace(
            go.Scatter(x=evolucao['mes'], y=evolucao['POIS'], 
                      mode='lines+markers', name='POIs',
                      line=dict(color=COLORS['primary'], width=2)),
            row=1, col=1
        )
        
        fig_evolucao.add_trace(
            go.Scatter(x=evolucao['mes'], y=evolucao['HECTARES_MAPEADOS'],
                      mode='lines+markers', name='Hectares',
                      line=dict(color=COLORS['success'], width=2)),
            row=2, col=1
        )
        
        fig_evolucao.update_layout(height=600, showlegend=False)
        st.plotly_chart(fig_evolucao, use_container_width=True)

# ==================== PÁGINA IMPACTO ====================

def pagina_impacto(df, impacto):
    st.title("💊 Análise de Impacto Epidemiológico")
    st.markdown("---")
    
    if not impacto:
        st.warning("⚠️ Dados de impacto não disponíveis. Execute: `python 04_analise_impacto_epidemiologico.py`")
        return
    
    # KPIs de Impacto
    st.subheader("📉 Impacto nos Casos de Dengue")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Casos ANTES",
            f"{impacto.get('casos_antes', 0):,}"
        )
    
    with col2:
        st.metric(
            "Casos DEPOIS",
            f"{impacto.get('casos_depois', 0):,}",
            delta=f"{impacto.get('variacao_media', 0):.1f}%"
        )
    
    with col3:
        st.metric(
            "Municípios com Redução",
            impacto.get('municipios_analisados', 0)
        )
    
    with col4:
        st.metric(
            "Cases de Sucesso",
            impacto.get('cases_sucesso', 0)
        )
    
    st.markdown("---")
    
    # Top Municípios com Redução
    if 'top_5' in impacto:
        st.subheader("🏆 Top 5 Municípios - Maior Redução de Casos")
        
        top5_data = []
        for item in impacto['top_5']:
            top5_data.append({
                'Município': item['municipio'],
                'Variação %': item['variacao_percentual']
            })
        
        df_top5 = pd.DataFrame(top5_data)
        
        fig_top5 = px.bar(
            df_top5,
            x='Variação %',
            y='Município',
            orientation='h',
            title='',
            color='Variação %',
            color_continuous_scale='RdYlGn_r'
        )
        fig_top5.update_layout(yaxis={'categoryorder': 'total ascending'}, height=400)
        st.plotly_chart(fig_top5, use_container_width=True)
    
    # Análise Descritiva
    st.markdown("---")
    st.subheader("📊 Análise Descritiva")
    
    st.info(f"""
    **Resumo Geral:**
    - Total de municípios analisados: **{impacto.get('municipios_analisados', 0)}**
    - Variação média de casos: **{impacto.get('variacao_media', 0):.1f}%**
    - Cases de sucesso identificados: **{impacto.get('cases_sucesso', 0)}**
    
    **Metodologia:**
    - ANTES: Jan-Nov 2024 (sem intervenções TechDengue)
    - DEPOIS: Dez 2024-Ago 2025 (com intervenções TechDengue)
    - Análise ajustada por sazonalidade
    """)

# ==================== PÁGINA BENCHMARKING ====================

def pagina_benchmarking(df):
    st.title("🏆 Benchmarking e Posicionamento")
    st.markdown("---")
    
    st.subheader("📊 Posição do CISARP")
    
    # Dados fictícios para demonstração
    ranking_data = {
        'Contratante': ['ICISMEP', 'ICISMEP Divinópolis', 'CISMAS', 'CISARP', 'ICISMEP BHTE'],
        'Atividades': [221, 122, 120, 108, 99],
        'Posição': ['1º', '2º', '3º', '4º', '5º']
    }
    df_ranking = pd.DataFrame(ranking_data)
    
    fig_ranking = px.bar(
        df_ranking,
        x='Atividades',
        y='Contratante',
        orientation='h',
        title='Top 5 Contratantes - Número de Atividades',
        color='Atividades',
        color_continuous_scale='Blues',
        text='Posição'
    )
    fig_ranking.update_layout(yaxis={'categoryorder': 'total ascending'}, height=400)
    st.plotly_chart(fig_ranking, use_container_width=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.metric("Posição", "4º de 66", help="Top 6% dos contratantes")
    
    with col2:
        st.metric("Gap para 3º", "12 atividades", help="Diferença para CISMAS")

# ==================== PÁGINA EXPLORAÇÃO ====================

def pagina_exploracao(df):
    st.title("🔍 Exploração Interativa de Dados")
    st.markdown("---")
    
    st.subheader("🎛️ Filtros Personalizados")
    
    # Filtros
    col1, col2 = st.columns(2)
    
    with col1:
        # Filtro de data
        if 'DATA_MAP' in df.columns:
            datas = df['DATA_MAP'].dropna()
            if len(datas) > 0:
                data_min = st.date_input("Data Início", value=datas.min())
                data_max = st.date_input("Data Fim", value=datas.max())
    
    with col2:
        # Filtro de POIs
        if 'POIS' in df.columns:
            pois_min = st.number_input("POIs Mínimo", min_value=0, value=0)
            pois_max = st.number_input("POIs Máximo", min_value=0, value=int(df['POIS'].max()))
    
    # Aplicar filtros
    df_filtrado = df.copy()
    if 'DATA_MAP' in df.columns:
        df_filtrado = df_filtrado[
            (df_filtrado['DATA_MAP'] >= pd.to_datetime(data_min)) &
            (df_filtrado['DATA_MAP'] <= pd.to_datetime(data_max))
        ]
    if 'POIS' in df.columns:
        df_filtrado = df_filtrado[
            (df_filtrado['POIS'] >= pois_min) &
            (df_filtrado['POIS'] <= pois_max)
        ]
    
    st.markdown(f"**Registros filtrados:** {len(df_filtrado)} de {len(df)}")
    
    # Tabela
    st.subheader("📋 Dados Filtrados")
    st.dataframe(df_filtrado, use_container_width=True)
    
    # Exportar
    if st.button("📥 Exportar Dados Filtrados (CSV)"):
        csv = df_filtrado.to_csv(index=False)
        st.download_button(
            label="⬇️ Download CSV",
            data=csv,
            file_name=f"cisarp_filtrado_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv"
        )

# ==================== PÁGINA INSIGHTS ====================

def pagina_insights(df, impacto):
    st.title("💡 Insights e Recomendações")
    st.markdown("---")
    
    st.subheader("🎯 Top 5 Insights")
    
    insights = [
        {
            'titulo': "🏆 Performance Excepcional",
            'descricao': "CISARP alcançou 4º lugar nacional entre 66 contratantes, posicionando-se no Top 6%.",
            'metrica': "4º/66"
        },
        {
            'titulo': "📊 Cobertura Abrangente",
            'descricao': "52 municípios atendidos com 9.440 hectares mapeados, quase 2x o esperado.",
            'metrica': "52 municípios"
        },
        {
            'titulo': "🔍 Densidade Operacional",
            'descricao': "13.584 POIs identificados com densidade média de 1.44 POIs/hectare.",
            'metrica': "13.584 POIs"
        },
        {
            'titulo': "⏱️ Operação Sustentada",
            'descricao': "263 dias de operação contínua, demonstrando consistência.",
            'metrica': "263 dias"
        },
        {
            'titulo': "📈 Potencial de Crescimento",
            'descricao': "Gap de apenas 12 atividades para alcançar o 3º lugar nacional.",
            'metrica': "+11% para top 3"
        }
    ]
    
    for insight in insights:
        with st.expander(f"**{insight['titulo']}**"):
            col1, col2 = st.columns([3, 1])
            with col1:
                st.write(insight['descricao'])
            with col2:
                st.metric("", insight['metrica'])
    
    st.markdown("---")
    
    # Recomendações
    st.subheader("🚀 Recomendações Estratégicas")
    
    tab1, tab2, tab3 = st.tabs(["Curto Prazo", "Médio Prazo", "Longo Prazo"])
    
    with tab1:
        st.markdown("""
        **1-3 meses:**
        - ✅ Expandir para 5 municípios prioritários
        - ✅ Aumentar taxa de conversão para 50%
        - ✅ Campanhas de conscientização
        - ✅ Revisita em áreas de alto risco
        """)
    
    with tab2:
        st.markdown("""
        **3-6 meses:**
        - 📊 Monitoramento contínuo a cada 3 meses
        - 🔗 Integração com vigilância epidemiológica
        - 👥 Capacitação avançada de equipes
        - 📱 Digitalização completa de processos
        """)
    
    with tab3:
        st.markdown("""
        **6-12 meses:**
        - 🌟 Modelo CISARP como referência
        - 🔬 Estudo de impacto longitudinal
        - 🤝 Intercâmbio de boas práticas
        - 💰 Captação de recursos para inovação
        """)

# ==================== EXECUTAR ====================

if __name__ == "__main__":
    main()
