"""
UI Enhancements - Componentes Avançados de UI/UX
Dashboard CISARP Enterprise

Melhorias visuais, animações e responsividade
"""

import streamlit as st
from typing import Optional, List, Dict
from dashboard.config.themes import themes

class UIEnhancements:
    """
    Componentes avançados de UI/UX para melhorar experiência do usuário
    """
    
    def __init__(self):
        self.theme = themes
        self.colors = themes.colors
    
    @staticmethod
    def inject_advanced_css():
        """
        Injeta CSS avançado com animações e responsividade
        """
        css = """
        <style>
        /* ==================== ANIMAÇÕES ==================== */
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        
        /* ==================== ELEMENTOS STREAMLIT ==================== */
        
        /* Animação de entrada para elementos */
        .element-container {
            animation: fadeIn 0.5s ease-out;
        }
        
        /* Sidebar melhorada */
        section[data-testid="stSidebar"] {
            background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%) !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
        }
        
        section[data-testid="stSidebar"] .css-1d391kg {
            padding-top: 2rem;
        }
        
        /* Headers melhorados */
        h1, h2, h3 {
            font-weight: 700 !important;
            letter-spacing: -0.5px;
        }
        
        h1 {
            background: linear-gradient(135deg, #0066CC 0%, #00B4D8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Botões melhorados */
        .stButton > button {
            background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3) !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        
        .stButton > button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0, 102, 204, 0.4) !important;
        }
        
        .stButton > button:active {
            transform: translateY(0) !important;
        }
        
        /* Tabs melhoradas */
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 4px;
        }
        
        .stTabs [data-baseweb="tab"] {
            border-radius: 6px;
            padding: 10px 20px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .stTabs [aria-selected="true"] {
            background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
        }
        
        /* Expander melhorado */
        .streamlit-expanderHeader {
            background-color: #f8f9fa;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .streamlit-expanderHeader:hover {
            background-color: #e9ecef;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Inputs melhorados */
        .stTextInput > div > div > input,
        .stSelectbox > div > div > div,
        .stMultiSelect > div > div > div {
            border-radius: 8px !important;
            border: 2px solid #e9ecef !important;
            transition: all 0.3s ease !important;
        }
        
        .stTextInput > div > div > input:focus,
        .stSelectbox > div > div > div:focus-within,
        .stMultiSelect > div > div > div:focus-within {
            border-color: #0066CC !important;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1) !important;
        }
        
        /* Dataframe melhorado */
        .stDataFrame {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Métricas melhoradas */
        [data-testid="stMetricValue"] {
            font-size: 2rem !important;
            font-weight: 700 !important;
        }
        
        /* Cards customizados */
        .custom-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            animation: fadeIn 0.5s ease-out;
        }
        
        .custom-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        
        /* Loading skeleton */
        .skeleton {
            background: linear-gradient(
                90deg,
                #f0f0f0 0%,
                #e0e0e0 50%,
                #f0f0f0 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
        }
        
        /* Badges */
        .badge {
            display: inline-block;
            padding: 0.35em 0.65em;
            font-size: 0.85em;
            font-weight: 600;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.375rem;
        }
        
        .badge-success {
            color: #fff;
            background-color: #28A745;
        }
        
        .badge-warning {
            color: #000;
            background-color: #FFC107;
        }
        
        .badge-danger {
            color: #fff;
            background-color: #DC3545;
        }
        
        .badge-info {
            color: #fff;
            background-color: #17A2B8;
        }
        
        /* ==================== RESPONSIVIDADE ==================== */
        
        @media (max-width: 768px) {
            .custom-card {
                padding: 1rem;
            }
            
            h1 {
                font-size: 1.75rem !important;
            }
            
            h2 {
                font-size: 1.5rem !important;
            }
            
            .stButton > button {
                padding: 0.5rem 1rem !important;
                font-size: 0.9rem !important;
            }
            
            [data-testid="stMetricValue"] {
                font-size: 1.5rem !important;
            }
        }
        
        /* ==================== ACESSIBILIDADE ==================== */
        
        /* Foco visível para navegação por teclado */
        *:focus {
            outline: 2px solid #0066CC !important;
            outline-offset: 2px !important;
        }
        
        /* Alto contraste para textos */
        p, span, div {
            color: #2c3e50;
        }
        
        /* Links acessíveis */
        a {
            color: #0066CC;
            text-decoration: underline;
            font-weight: 600;
        }
        
        a:hover {
            color: #0052A3;
        }
        
        /* ==================== SCROLLBAR ==================== */
        
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #0052A3;
        }
        
        /* ==================== TOOLTIP ==================== */
        
        .tooltip {
            position: relative;
            display: inline-block;
        }
        
        .tooltip .tooltiptext {
            visibility: hidden;
            width: 200px;
            background-color: #2c3e50;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 8px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            margin-left: -100px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 0.85rem;
        }
        
        .tooltip:hover .tooltiptext {
            visibility: visible;
            opacity: 1;
        }
        
        /* ==================== PROGRESS BAR ==================== */
        
        .progress-container {
            width: 100%;
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .progress-bar {
            height: 24px;
            background: linear-gradient(90deg, #0066CC 0%, #00B4D8 100%);
            border-radius: 10px;
            transition: width 0.6s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.85rem;
        }
        
        /* ==================== ALERTS ==================== */
        
        .alert {
            padding: 1rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 8px;
            animation: slideInRight 0.4s ease-out;
        }
        
        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
        
        .alert-warning {
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeaa7;
        }
        
        .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }
        
        .alert-info {
            color: #004085;
            background-color: #cce5ff;
            border-color: #b8daff;
        }
        </style>
        """
        st.markdown(css, unsafe_allow_html=True)
    
    def loading_spinner(self, text: str = "Carregando..."):
        """Spinner de loading customizado"""
        html = f"""
        <div style="text-align: center; padding: 2rem;">
            <div class="skeleton" style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 1rem;"></div>
            <p style="color: #6c757d; font-weight: 600;">{text}</p>
        </div>
        """
        return st.markdown(html, unsafe_allow_html=True)
    
    def alert(
        self,
        message: str,
        alert_type: str = 'info',
        icon: Optional[str] = None
    ):
        """
        Alert box customizado
        
        Args:
            message: Mensagem do alert
            alert_type: 'success', 'warning', 'danger', 'info'
            icon: Emoji opcional
        """
        icon_str = f"{icon} " if icon else ""
        html = f"""
        <div class="alert alert-{alert_type}" role="alert">
            {icon_str}{message}
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)
    
    def card(
        self,
        content: str,
        title: Optional[str] = None,
        hover: bool = True
    ):
        """
        Card customizado com animações
        
        Args:
            content: Conteúdo HTML do card
            title: Título opcional
            hover: Habilitar efeito hover
        """
        hover_class = "custom-card" if hover else ""
        title_html = f'<h3 style="margin-top: 0; color: #2c3e50;">{title}</h3>' if title else ''
        
        html = f"""
        <div class="{hover_class}" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
            {title_html}
            {content}
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)
    
    def badge(
        self,
        text: str,
        badge_type: str = 'info'
    ) -> str:
        """
        Retorna HTML de badge
        
        Args:
            text: Texto do badge
            badge_type: 'success', 'warning', 'danger', 'info'
        
        Returns:
            HTML string
        """
        return f'<span class="badge badge-{badge_type}">{text}</span>'
    
    def progress_bar(
        self,
        value: float,
        max_value: float = 100,
        label: Optional[str] = None,
        color: str = '#0066CC'
    ):
        """
        Barra de progresso customizada
        
        Args:
            value: Valor atual
            max_value: Valor máximo
            label: Label opcional
            color: Cor da barra
        """
        percentage = (value / max_value) * 100 if max_value > 0 else 0
        label_text = label if label else f"{percentage:.0f}%"
        
        html = f"""
        <div class="progress-container">
            <div class="progress-bar" style="width: {percentage}%; background: linear-gradient(90deg, {color} 0%, {color}dd 100%);">
                {label_text}
            </div>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)
    
    def timeline_item(
        self,
        title: str,
        description: str,
        date: str,
        status: str = 'completed'
    ):
        """
        Item de timeline
        
        Args:
            title: Título do item
            description: Descrição
            date: Data
            status: 'completed', 'in_progress', 'pending'
        """
        status_colors = {
            'completed': '#28A745',
            'in_progress': '#FFC107',
            'pending': '#6c757d'
        }
        
        status_icons = {
            'completed': '✅',
            'in_progress': '🔄',
            'pending': '⏳'
        }
        
        color = status_colors.get(status, '#6c757d')
        icon = status_icons.get(status, '⏳')
        
        html = f"""
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; animation: fadeIn 0.5s ease-out;">
            <div style="flex-shrink: 0;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: {color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                ">
                    {icon}
                </div>
            </div>
            <div style="flex-grow: 1;">
                <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50;">{title}</h4>
                <p style="margin: 0 0 0.25rem 0; color: #6c757d; font-size: 0.9rem;">{description}</p>
                <p style="margin: 0; color: #adb5bd; font-size: 0.85rem;">{date}</p>
            </div>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)
    
    def stats_grid(
        self,
        stats: List[Dict[str, str]]
    ):
        """
        Grid de estatísticas
        
        Args:
            stats: Lista de dicts com 'label', 'value', 'icon' (opcional)
        """
        cols = st.columns(len(stats))
        
        for idx, stat in enumerate(stats):
            with cols[idx]:
                icon = stat.get('icon', '📊')
                self.card(
                    content=f"""
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">{icon}</div>
                        <div style="font-size: 2rem; font-weight: 700; color: #0066CC; margin-bottom: 0.25rem;">
                            {stat['value']}
                        </div>
                        <div style="color: #6c757d; font-size: 0.9rem;">
                            {stat['label']}
                        </div>
                    </div>
                    """,
                    hover=True
                )
    
    def feature_highlight(
        self,
        icon: str,
        title: str,
        description: str
    ):
        """
        Destaque de feature
        
        Args:
            icon: Emoji/ícone
            title: Título
            description: Descrição
        """
        html = f"""
        <div class="custom-card" style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">{icon}</div>
            <h3 style="color: #2c3e50; margin-bottom: 0.75rem;">{title}</h3>
            <p style="color: #6c757d; margin: 0;">{description}</p>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)

# Instância global
ui = UIEnhancements()
