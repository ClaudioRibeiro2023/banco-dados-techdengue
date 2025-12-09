"""
Componentes de métricas e KPIs
"""
import streamlit as st

def render_metric_card(title, value, delta=None, icon="📊", color="#1f77b4"):
    """
    Renderiza um card de métrica
    
    Args:
        title: Título da métrica
        value: Valor da métrica
        delta: Variação (opcional)
        icon: Ícone (emoji)
        color: Cor do card
    """
    st.markdown(f"""
    <div style="
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid {color};
        margin-bottom: 1rem;
    ">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">{icon}</div>
        <div style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">{title}</div>
        <div style="font-size: 2rem; font-weight: bold; color: {color};">{value}</div>
        {f'<div style="color: #28a745; font-size: 0.9rem; margin-top: 0.5rem;">▲ {delta}</div>' if delta else ''}
    </div>
    """, unsafe_allow_html=True)


def render_kpi_grid(kpis):
    """
    Renderiza grid de KPIs
    
    Args:
        kpis: Lista de dicionários com {title, value, delta, icon, color}
    """
    cols = st.columns(len(kpis))
    
    for col, kpi in zip(cols, kpis):
        with col:
            st.metric(
                label=f"{kpi.get('icon', '📊')} {kpi['title']}",
                value=kpi['value'],
                delta=kpi.get('delta')
            )
