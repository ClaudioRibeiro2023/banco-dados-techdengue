"""
Tooltip Component with Full Accessibility
Design System v4.0.0
"""

def create_tooltip(content: str, tooltip_text: str, position: str = "top") -> str:
    """
    Cria tooltip acessível com ARIA completo
    
    Args:
        content: Conteúdo que receberá o tooltip
        tooltip_text: Texto do tooltip
        position: Posição do tooltip (top|right|bottom|left)
        
    Returns:
        HTML string com tooltip
        
    Example:
        html = create_tooltip(
            '<button>Salvar</button>',
            'Salvar alterações (Ctrl+S)',
            position='top'
        )
    """
    import hashlib
    tooltip_id = f"tooltip-{abs(hash(tooltip_text)) % 10000}"
    
    valid_positions = ['top', 'right', 'bottom', 'left']
    if position not in valid_positions:
        position = 'top'
    
    return f'''
    <div class="tooltip-wrapper" 
         role="presentation">
        {content}
        <div class="tooltip tooltip-{position}" 
             id="{tooltip_id}"
             role="tooltip"
             aria-hidden="true">
            {tooltip_text}
            <div class="tooltip-arrow" aria-hidden="true"></div>
        </div>
    </div>
    '''


def create_icon_with_tooltip(icon: str, tooltip_text: str, position: str = "top") -> str:
    """
    Cria ícone com tooltip (uso comum)
    
    Args:
        icon: Emoji ou HTML do ícone
        tooltip_text: Texto explicativo
        position: Posição do tooltip
    """
    content = f'<span class="icon-tooltip" tabindex="0" aria-label="{tooltip_text}">{icon}</span>'
    return create_tooltip(content, tooltip_text, position)


def create_help_tooltip(text: str, help_text: str) -> str:
    """
    Cria texto com ícone de ajuda e tooltip
    
    Args:
        text: Texto principal
        help_text: Texto de ajuda no tooltip
    """
    help_icon = '''
    <svg width="16" height="16" 
         viewBox="0 0 16 16" 
         fill="none" 
         stroke="currentColor" 
         stroke-width="2"
         class="help-icon"
         aria-hidden="true">
        <circle cx="8" cy="8" r="7"/>
        <path d="M8 12v-1M8 8a1 1 0 011-1h0a1 1 0 011 1v0a1 1 0 01-1 1H8"/>
    </svg>
    '''
    
    content = f'''
    <span class="text-with-help">
        {text}
        <span class="help-trigger" tabindex="0" aria-label="Ajuda: {help_text}">
            {help_icon}
        </span>
    </span>
    '''
    
    return create_tooltip(content, help_text, position="top")
