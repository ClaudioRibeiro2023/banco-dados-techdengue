"""
Accessibility Utils - Utilitários de Acessibilidade
Dashboard CISARP Enterprise

Funções para melhorar acessibilidade (WCAG 2.1 Level AA)
"""

from typing import Tuple
import colorsys

class AccessibilityUtils:
    """
    Utilitários para garantir acessibilidade no dashboard
    """
    
    @staticmethod
    def calculate_contrast_ratio(color1: str, color2: str) -> float:
        """
        Calcula razão de contraste entre duas cores (WCAG)
        
        Args:
            color1: Cor hex (#RRGGBB)
            color2: Cor hex (#RRGGBB)
        
        Returns:
            Razão de contraste (1-21)
        """
        def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        def relative_luminance(rgb: Tuple[int, int, int]) -> float:
            r, g, b = [x / 255.0 for x in rgb]
            
            def adjust(c):
                if c <= 0.03928:
                    return c / 12.92
                return ((c + 0.055) / 1.055) ** 2.4
            
            r, g, b = map(adjust, (r, g, b))
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        
        rgb1 = hex_to_rgb(color1)
        rgb2 = hex_to_rgb(color2)
        
        lum1 = relative_luminance(rgb1)
        lum2 = relative_luminance(rgb2)
        
        lighter = max(lum1, lum2)
        darker = min(lum1, lum2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    @staticmethod
    def meets_wcag_aa(color1: str, color2: str, large_text: bool = False) -> bool:
        """
        Verifica se contraste atende WCAG 2.1 Level AA
        
        Args:
            color1: Cor de fundo
            color2: Cor do texto
            large_text: Se é texto grande (18pt+ ou 14pt+ bold)
        
        Returns:
            True se atende critérios
        """
        ratio = AccessibilityUtils.calculate_contrast_ratio(color1, color2)
        
        if large_text:
            return ratio >= 3.0  # WCAG AA para texto grande
        return ratio >= 4.5  # WCAG AA para texto normal
    
    @staticmethod
    def meets_wcag_aaa(color1: str, color2: str, large_text: bool = False) -> bool:
        """
        Verifica se contraste atende WCAG 2.1 Level AAA
        
        Args:
            color1: Cor de fundo
            color2: Cor do texto
            large_text: Se é texto grande
        
        Returns:
            True se atende critérios
        """
        ratio = AccessibilityUtils.calculate_contrast_ratio(color1, color2)
        
        if large_text:
            return ratio >= 4.5  # WCAG AAA para texto grande
        return ratio >= 7.0  # WCAG AAA para texto normal
    
    @staticmethod
    def generate_aria_label(element_type: str, value: str, context: str = "") -> str:
        """
        Gera aria-label apropriado para elemento
        
        Args:
            element_type: Tipo do elemento ('button', 'link', 'input', etc)
            value: Valor/texto do elemento
            context: Contexto adicional
        
        Returns:
            String aria-label
        """
        templates = {
            'button': f"Botão {value}",
            'link': f"Link para {value}",
            'input': f"Campo de entrada {value}",
            'metric': f"Métrica {value}",
            'chart': f"Gráfico {value}",
            'table': f"Tabela {value}"
        }
        
        label = templates.get(element_type, f"{element_type} {value}")
        
        if context:
            label += f", {context}"
        
        return label
    
    @staticmethod
    def keyboard_navigation_hint(action: str) -> str:
        """
        Retorna dica de navegação por teclado
        
        Args:
            action: Ação desejada
        
        Returns:
            String com instrução
        """
        hints = {
            'navigate': "Use Tab para navegar entre elementos, Enter para selecionar",
            'close': "Pressione Esc para fechar",
            'select': "Use setas para navegar, Enter para selecionar",
            'expand': "Pressione Enter ou Espaço para expandir/recolher",
            'zoom': "Use + e - para zoom, ou Ctrl + scroll do mouse"
        }
        
        return hints.get(action, "Use Tab e Enter para navegar")
    
    @staticmethod
    def screen_reader_text(text: str) -> str:
        """
        Formata texto para leitores de tela
        
        Args:
            text: Texto original
        
        Returns:
            HTML com texto apenas para screen readers
        """
        return f'<span class="sr-only">{text}</span>'
    
    @staticmethod
    def color_blind_safe_palette() -> dict:
        """
        Retorna paleta de cores segura para daltônicos
        
        Returns:
            Dict com cores hex
        """
        return {
            'blue': '#0173B2',
            'orange': '#DE8F05',
            'green': '#029E73',
            'red': '#CC78BC',
            'gray': '#949494',
            'yellow': '#ECE133',
            'purple': '#56B4E9'
        }
    
    @staticmethod
    def validate_color_scheme(colors: dict) -> dict:
        """
        Valida esquema de cores contra critérios de acessibilidade
        
        Args:
            colors: Dict com 'background', 'text', 'primary', etc
        
        Returns:
            Dict com resultados de validação
        """
        results = {
            'valid': True,
            'warnings': [],
            'errors': []
        }
        
        # Verificar contraste principal
        if 'background' in colors and 'text' in colors:
            ratio = AccessibilityUtils.calculate_contrast_ratio(
                colors['background'],
                colors['text']
            )
            
            if ratio < 4.5:
                results['valid'] = False
                results['errors'].append(
                    f"Contraste insuficiente entre background e text: {ratio:.2f} (mínimo 4.5)"
                )
            elif ratio < 7.0:
                results['warnings'].append(
                    f"Contraste abaixo do nível AAA: {ratio:.2f} (recomendado 7.0)"
                )
        
        return results

# Instância global
accessibility = AccessibilityUtils()
