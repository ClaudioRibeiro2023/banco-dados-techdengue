"""
Design System Centralizado - CISARP
Baseado em SIVEPI com componentes Streamlit

Fonte única da verdade para UI/UX
"""

import streamlit as st
from typing import Optional, Literal, List, Dict, Any
from dashboard.config.themes import themes
import plotly.graph_objects as go

class DesignSystem:
    """Sistema de Design Unificado"""
    
    def __init__(self):
        self.theme = themes
        self.colors = themes.colors
        self.spacing = themes.spacing
        self.typography = themes.typography
    
    def inject_custom_css(self):
        """Injeta CSS customizado no Streamlit"""
        st.markdown(self.theme.get_custom_css(), unsafe_allow_html=True)
    
    def metric_card(
        self,
        title: str,
        value: str,
        delta: Optional[str] = None,
        color: Literal['primary', 'success', 'warning', 'danger', 'info'] = 'primary',
        icon: Optional[str] = None,
        help_text: Optional[str] = None
    ):
        """
        Card de métrica padronizado
        
        Args:
            title: Título da métrica
            value: Valor principal
            delta: Variação (ex: "+15%")
            color: Cor do card
            icon: Emoji/ícone
            help_text: Texto de ajuda
        """
        color_map = {
            'primary': self.colors.primary,
            'success': self.colors.success,
            'warning': self.colors.warning,
            'danger': self.colors.danger,
            'info': self.colors.info
        }
        
        bg_color = color_map.get(color, self.colors.primary)
        icon_str = f"{icon} " if icon else ""
        delta_html = f'<p style="margin: 0; font-size: 12px; opacity: 0.8;">{delta}</p>' if delta else ''
        help_html = f'<p style="margin: 8px 0 0 0; font-size: 11px; opacity: 0.7;">{help_text}</p>' if help_text else ''
        
        st.markdown(f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color}dd 100%);
            padding: {self.spacing.lg};
            border-radius: {self.theme.border_radius.lg};
            color: white;
            text-align: center;
            box-shadow: {self.theme.shadows.md};
            transition: transform 0.2s ease;
        ">
            <h3 style="margin: 0; font-size: 14px; opacity: 0.9; font-weight: 600;">{icon_str}{title}</h3>
            <h1 style="margin: 10px 0; font-size: 36px; font-weight: 700;">{value}</h1>
            {delta_html}
            {help_html}
        </div>
        """, unsafe_allow_html=True)
    
    def section_header(
        self,
        title: str,
        description: Optional[str] = None,
        icon: Optional[str] = None
    ):
        """Header de seção padronizado"""
        icon_str = f"{icon} " if icon else ""
        desc_html = f'<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">{description}</p>' if description else ''
        
        st.markdown(f"""
        <div style="
            background: linear-gradient(135deg, {self.colors.primary} 0%, {self.colors.secondary} 100%);
            padding: {self.spacing.xl};
            border-radius: {self.theme.border_radius.lg};
            margin-bottom: {self.spacing.lg};
            box-shadow: {self.theme.shadows.md};
        ">
            <h2 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">{icon_str}{title}</h2>
            {desc_html}
        </div>
        """, unsafe_allow_html=True)
    
    def info_box(
        self,
        content: str,
        box_type: Literal['info', 'success', 'warning', 'danger'] = 'info',
        icon: Optional[str] = None
    ):
        """Caixa de informação colorida"""
        color_map = {
            'info': (self.colors.info, '#E0F2FE'),
            'success': (self.colors.success, '#DCFCE7'),
            'warning': (self.colors.warning, '#FEF3C7'),
            'danger': (self.colors.danger, '#FEE2E2')
        }
        
        border_color, bg_color = color_map.get(box_type, color_map['info'])
        icon_str = f"{icon} " if icon else ""
        
        st.markdown(f"""
        <div style="
            background: {bg_color};
            border-left: 4px solid {border_color};
            padding: {self.spacing.md};
            border-radius: {self.theme.border_radius.md};
            margin: {self.spacing.md} 0;
        ">
            <p style="margin: 0; color: {self.colors.text_primary};">{icon_str}{content}</p>
        </div>
        """, unsafe_allow_html=True)
    
    def stat_card(
        self,
        title: str,
        value: str,
        subtitle: Optional[str] = None,
        trend: Optional[str] = None,
        trend_positive: bool = True
    ):
        """Card de estatística com trend"""
        trend_html = ""
        if trend:
            trend_color = self.colors.success if trend_positive else self.colors.danger
            trend_icon = "▲" if trend_positive else "▼"
            trend_html = f"""
            <div style="margin-top: 8px;">
                <span style="color: {trend_color}; font-weight: 600;">
                    {trend_icon} {trend}
                </span>
            </div>
            """
        
        subtitle_html = f'<p style="margin: 4px 0 0 0; font-size: 13px; color: {self.colors.text_secondary};">{subtitle}</p>' if subtitle else ''
        
        st.markdown(f"""
        <div style="
            background: {self.colors.surface};
            padding: {self.spacing.lg};
            border-radius: {self.theme.border_radius.md};
            box-shadow: {self.theme.shadows.sm};
            border: 1px solid {self.colors.border};
        ">
            <p style="margin: 0; font-size: 13px; color: {self.colors.text_secondary}; text-transform: uppercase; font-weight: 600;">{title}</p>
            <h2 style="margin: 8px 0 0 0; font-size: 32px; color: {self.colors.text_primary}; font-weight: 700;">{value}</h2>
            {subtitle_html}
            {trend_html}
        </div>
        """, unsafe_allow_html=True)
    
    def divider(self, margin: str = 'md'):
        """Divider visual"""
        margin_value = getattr(self.spacing, margin, self.spacing.md)
        st.markdown(f"""
        <div style="
            height: 1px;
            background: {self.colors.border};
            margin: {margin_value} 0;
        "></div>
        """, unsafe_allow_html=True)
    
    def badge(
        self,
        text: str,
        badge_type: Literal['primary', 'success', 'warning', 'danger', 'neutral'] = 'neutral'
    ) -> str:
        """Badge inline"""
        color_map = {
            'primary': (self.colors.primary, 'white'),
            'success': (self.colors.success, 'white'),
            'warning': (self.colors.warning, 'white'),
            'danger': (self.colors.danger, 'white'),
            'neutral': (self.colors.neutral, 'white')
        }
        
        bg_color, text_color = color_map.get(badge_type, color_map['neutral'])
        
        return f"""
        <span style="
            background: {bg_color};
            color: {text_color};
            padding: 4px 12px;
            border-radius: {self.theme.border_radius.full};
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        ">{text}</span>
        """
    
    def progress_bar(
        self,
        value: float,
        max_value: float = 100,
        color: str = None,
        height: str = '8px',
        show_label: bool = True
    ):
        """Barra de progresso customizada"""
        percentage = (value / max_value) * 100
        bar_color = color or self.colors.primary
        
        label_html = f'<span style="font-size: 12px; color: {self.colors.text_secondary}; margin-left: 8px;">{value:.1f} / {max_value:.1f}</span>' if show_label else ''
        
        st.markdown(f"""
        <div style="margin: {self.spacing.sm} 0;">
            <div style="
                background: {self.colors.border_light};
                border-radius: {self.theme.border_radius.full};
                height: {height};
                overflow: hidden;
            ">
                <div style="
                    background: {bar_color};
                    width: {percentage}%;
                    height: 100%;
                    transition: width 0.3s ease;
                "></div>
            </div>
            {label_html}
        </div>
        """, unsafe_allow_html=True)
    
    def get_plotly_theme(self) -> Dict:
        """Retorna tema Plotly customizado"""
        return self.theme.get_plotly_template()
    
    def apply_plotly_theme(self, fig: go.Figure) -> go.Figure:
        """Aplica tema ao gráfico Plotly"""
        template = self.get_plotly_theme()
        fig.update_layout(**template['layout'])
        return fig

# Instância global
ds = DesignSystem()
