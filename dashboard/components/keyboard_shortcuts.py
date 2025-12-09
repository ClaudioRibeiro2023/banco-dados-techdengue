"""
Keyboard Shortcuts System
Design System v4.0.0
"""

# Definição de atalhos globais
SHORTCUTS = {
    'search': {
        'key': 'k',
        'mod': 'ctrl',
        'label': 'Buscar',
        'action': 'focusSearch()',
        'description': 'Ativar busca global'
    },
    'filter': {
        'key': 'f',
        'mod': 'ctrl',
        'label': 'Filtros',
        'action': 'focusFilters()',
        'description': 'Focar nos filtros'
    },
    'home': {
        'key': 'h',
        'mod': 'ctrl',
        'label': 'Home',
        'action': 'goHome()',
        'description': 'Ir para página inicial'
    },
    'help': {
        'key': '?',
        'mod': None,
        'label': 'Ajuda',
        'action': 'openShortcutsPanel()',
        'description': 'Mostrar este painel'
    },
    'escape': {
        'key': 'Escape',
        'mod': None,
        'label': 'Esc',
        'action': 'closeModals()',
        'description': 'Fechar modais'
    },
}


def create_shortcuts_panel() -> str:
    """
    Cria painel de atalhos de teclado com acessibilidade completa
    
    Returns:
        HTML string com painel e JavaScript handler
    """
    shortcuts_html = ""
    
    for shortcut_id, shortcut in SHORTCUTS.items():
        mod_key = shortcut['mod']
        key = shortcut['key']
        
        if mod_key:
            if mod_key == 'ctrl':
                key_display = f"Ctrl+{key.upper()}"
            elif mod_key == 'alt':
                key_display = f"Alt+{key.upper()}"
            elif mod_key == 'shift':
                key_display = f"Shift+{key.upper()}"
        else:
            key_display = key if len(key) > 1 else key.upper()
        
        shortcuts_html += f'''
        <div class="shortcut-item">
            <kbd aria-label="Tecla {key_display}">{key_display}</kbd>
            <div class="shortcut-info">
                <strong>{shortcut['label']}</strong>
                <span class="shortcut-description">{shortcut['description']}</span>
            </div>
        </div>
        '''
    
    return f'''
    <!-- Keyboard Shortcuts Panel -->
    <div class="shortcuts-panel" 
         id="shortcutsPanel"
         role="dialog"
         aria-modal="true"
         aria-labelledby="shortcuts-title"
         aria-hidden="true">
        
        <div class="shortcuts-overlay" 
             onclick="closeShortcutsPanel()"
             aria-label="Fechar painel"></div>
        
        <div class="shortcuts-content">
            <div class="shortcuts-header">
                <h3 id="shortcuts-title">⌨️ Atalhos de Teclado</h3>
                <button class="shortcuts-close" 
                        onclick="closeShortcutsPanel()"
                        aria-label="Fechar painel de atalhos"
                        type="button">
                    <svg width="24" height="24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2">
                        <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="shortcuts-grid">
                {shortcuts_html}
            </div>
            
            <div class="shortcuts-footer">
                <p class="shortcuts-hint">
                    💡 Pressione <kbd>?</kbd> a qualquer momento para ver estes atalhos
                </p>
            </div>
        </div>
    </div>
    
    <script>
        // Keyboard Shortcuts Handler
        (function() {{
            const shortcuts = {SHORTCUTS};
            
            // Open/Close Functions
            window.openShortcutsPanel = function() {{
                const panel = document.getElementById('shortcutsPanel');
                panel.classList.add('open');
                panel.setAttribute('aria-hidden', 'false');
                
                // Focus first focusable element
                const closeBtn = panel.querySelector('.shortcuts-close');
                if (closeBtn) closeBtn.focus();
                
                // Lock body scroll
                document.body.style.overflow = 'hidden';
            }};
            
            window.closeShortcutsPanel = function() {{
                const panel = document.getElementById('shortcutsPanel');
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                
                // Unlock body scroll
                document.body.style.overflow = '';
            }};
            
            // Helper functions for shortcuts
            window.focusSearch = function() {{
                const searchInput = document.querySelector('input[type="search"], input[placeholder*="uscar" i]');
                if (searchInput) {{
                    searchInput.focus();
                    searchInput.select();
                }}
            }};
            
            window.focusFilters = function() {{
                const firstFilter = document.querySelector('.filter-bar select, .filter-bar input');
                if (firstFilter) firstFilter.focus();
            }};
            
            window.goHome = function() {{
                if (window.location.pathname !== '/') {{
                    window.location.href = '/';
                }}
            }};
            
            window.closeModals = function() {{
                // Close shortcuts panel
                if (document.getElementById('shortcutsPanel').classList.contains('open')) {{
                    closeShortcutsPanel();
                    return;
                }}
                
                // Close mobile drawer
                const drawer = document.getElementById('mobileDrawer');
                if (drawer && drawer.classList.contains('open')) {{
                    closeMobileDrawer();
                    return;
                }}
                
                // Close any other modals
                const modals = document.querySelectorAll('[role="dialog"].open');
                modals.forEach(modal => modal.classList.remove('open'));
            }};
            
            // Global keyboard event listener
            document.addEventListener('keydown', function(e) {{
                const key = e.key.toLowerCase();
                const ctrl = e.ctrlKey || e.metaKey;
                const alt = e.altKey;
                const shift = e.shiftKey;
                
                // Don't trigger when typing in inputs
                const isInput = e.target.tagName === 'INPUT' || 
                               e.target.tagName === 'TEXTAREA' ||
                               e.target.isContentEditable;
                
                // Check each shortcut
                Object.entries(shortcuts).forEach(([id, shortcut]) => {{
                    let modMatch = true;
                    
                    if (shortcut.mod === 'ctrl') modMatch = ctrl && !alt && !shift;
                    else if (shortcut.mod === 'alt') modMatch = alt && !ctrl && !shift;
                    else if (shortcut.mod === 'shift') modMatch = shift && !ctrl && !alt;
                    else modMatch = !ctrl && !alt && !shift;
                    
                    const keyMatch = key === shortcut.key.toLowerCase();
                    
                    if (keyMatch && modMatch) {{
                        // Special handling for help and escape (work in inputs too)
                        if (shortcut.key === '?' || shortcut.key === 'Escape') {{
                            e.preventDefault();
                            eval(shortcut.action);
                            return;
                        }}
                        
                        // Other shortcuts don't work in inputs
                        if (!isInput) {{
                            e.preventDefault();
                            eval(shortcut.action);
                        }}
                    }}
                }});
            }});
            
            // Show hint on first visit
            if (!localStorage.getItem('shortcuts-hint-seen')) {{
                setTimeout(() => {{
                    const hint = document.createElement('div');
                    hint.className = 'shortcuts-floating-hint';
                    hint.innerHTML = `
                        <span>💡 Pressione <kbd>?</kbd> para ver atalhos de teclado</span>
                        <button onclick="this.parentElement.remove(); localStorage.setItem('shortcuts-hint-seen', 'true')">
                            ✕
                        </button>
                    `;
                    document.body.appendChild(hint);
                    
                    // Auto-hide after 10 seconds
                    setTimeout(() => {{
                        hint.remove();
                        localStorage.setItem('shortcuts-hint-seen', 'true');
                    }}, 10000);
                }}, 2000);
            }}
        }})();
    </script>
    '''


def add_shortcut_indicator(element_html: str, shortcut_key: str) -> str:
    """
    Adiciona indicador visual de atalho a um elemento
    
    Args:
        element_html: HTML do elemento (ex: botão)
        shortcut_key: Tecla do atalho (ex: "Ctrl+K")
        
    Returns:
        HTML com indicador de atalho
    """
    return f'''
    <div class="element-with-shortcut">
        {element_html}
        <span class="shortcut-indicator" aria-label="Atalho: {shortcut_key}">
            <kbd>{shortcut_key}</kbd>
        </span>
    </div>
    '''
