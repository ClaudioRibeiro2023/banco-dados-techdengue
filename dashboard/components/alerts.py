"""
Componentes de alertas e badges
"""
import streamlit as st

def show_alert(message, alert_type="info"):
    """
    Mostra alerta
    
    Args:
        message: Mensagem do alerta
        alert_type: Tipo (success, info, warning, error)
    """
    if alert_type == "success":
        st.success(message)
    elif alert_type == "info":
        st.info(message)
    elif alert_type == "warning":
        st.warning(message)
    elif alert_type == "error":
        st.error(message)


def show_status_badge(status, label=None):
    """
    Mostra badge de status
    
    Args:
        status: Status (success, warning, error, info)
        label: Texto do badge
    """
    colors = {
        'success': ('#d4edda', '#155724'),
        'warning': ('#fff3cd', '#856404'),
        'error': ('#f8d7da', '#721c24'),
        'info': ('#d1ecf1', '#0c5460')
    }
    
    bg_color, text_color = colors.get(status, colors['info'])
    
    if label is None:
        label = status.upper()
    
    st.markdown(f"""
    <span style="
        background-color: {bg_color};
        color: {text_color};
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
        font-weight: bold;
        font-size: 0.875rem;
    ">{label}</span>
    """, unsafe_allow_html=True)
