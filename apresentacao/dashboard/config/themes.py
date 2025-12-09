"""
Temas e Cores Centralizados
Baseado no Design System SIVEPI
"""

from dataclasses import dataclass
from typing import Dict

@dataclass
class BrandColors:
    """Cores oficiais CISARP - PANTONE"""
    primary: str = '#0066CC'
    secondary: str = '#28A745'
    warning: str = '#FFA500'
    danger: str = '#DC3545'
    neutral: str = '#6C757D'
    info: str = '#17A2B8'
    
    # Backgrounds
    background: str = '#F8F9FA'
    surface: str = '#FFFFFF'
    
    # Text
    text_primary: str = '#1F2937'
    text_secondary: str = '#6B7280'
    text_tertiary: str = '#9CA3AF'
    
    # Borders
    border: str = '#E5E7EB'
    border_light: str = '#F3F4F6'
    
    # Status colors
    success: str = '#10B981'
    error: str = '#EF4444'
    
    def to_dict(self) -> Dict[str, str]:
        """Converte para dicionário"""
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

@dataclass
class Spacing:
    """Spacing padronizado"""
    xs: str = '4px'
    sm: str = '8px'
    md: str = '16px'
    lg: str = '24px'
    xl: str = '32px'
    xxl: str = '48px'
    
    def to_dict(self) -> Dict[str, str]:
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

@dataclass
class Typography:
    """Tipografia padronizada"""
    font_family: str = "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    
    # Sizes
    h1_size: str = '32px'
    h2_size: str = '24px'
    h3_size: str = '20px'
    h4_size: str = '18px'
    body_size: str = '16px'
    caption_size: str = '12px'
    
    # Weights
    light: int = 300
    regular: int = 400
    medium: int = 500
    semibold: int = 600
    bold: int = 700
    
    def to_dict(self) -> Dict:
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

@dataclass
class Shadows:
    """Sombras padronizadas"""
    sm: str = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    md: str = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    lg: str = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    xl: str = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    
    def to_dict(self) -> Dict[str, str]:
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

@dataclass
class BorderRadius:
    """Border radius padronizado"""
    sm: str = '4px'
    md: str = '8px'
    lg: str = '12px'
    xl: str = '16px'
    full: str = '9999px'
    
    def to_dict(self) -> Dict[str, str]:
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

class Theme:
    """Tema completo do dashboard"""
    
    def __init__(self):
        self.colors = BrandColors()
        self.spacing = Spacing()
        self.typography = Typography()
        self.shadows = Shadows()
        self.border_radius = BorderRadius()
    
    def get_plotly_template(self) -> Dict:
        """Template Plotly customizado"""
        return {
            'layout': {
                'font': {
                    'family': self.typography.font_family,
                    'size': 14,
                    'color': self.colors.text_primary
                },
                'plot_bgcolor': self.colors.surface,
                'paper_bgcolor': self.colors.surface,
                'colorway': [
                    self.colors.primary,
                    self.colors.secondary,
                    self.colors.warning,
                    self.colors.info,
                    self.colors.danger
                ]
            }
        }
    
    def get_custom_css(self) -> str:
        """CSS customizado para Streamlit"""
        return f"""
        <style>
        /* Cores globais */
        :root {{
            --primary: {self.colors.primary};
            --secondary: {self.colors.secondary};
            --warning: {self.colors.warning};
            --danger: {self.colors.danger};
            --success: {self.colors.success};
        }}
        
        /* Headers */
        .stApp h1 {{
            font-size: {self.typography.h1_size};
            font-weight: {self.typography.bold};
            color: {self.colors.text_primary};
        }}
        
        .stApp h2 {{
            font-size: {self.typography.h2_size};
            font-weight: {self.typography.semibold};
            color: {self.colors.text_primary};
        }}
        
        /* Métricas */
        div[data-testid="stMetricValue"] {{
            font-size: 36px;
            font-weight: {self.typography.bold};
        }}
        
        /* Sidebar */
        section[data-testid="stSidebar"] {{
            background-color: {self.colors.background};
        }}
        
        /* Cards */
        .metric-card {{
            background: {self.colors.surface};
            padding: {self.spacing.lg};
            border-radius: {self.border_radius.lg};
            box-shadow: {self.shadows.md};
        }}
        </style>
        """

# Instância global
themes = Theme()
