"""
Mobile Drawer Navigation Component
Design System v4.0.0
"""

def create_mobile_drawer(items: list, active_page: str = "") -> str:
    """
    Cria drawer de navegação mobile com acessibilidade completa
    
    Args:
        items: Lista de dicts com {label, icon, path, badge}
        active_page: Path da página ativa atual
        
    Returns:
        HTML string com drawer completo
        
    Example:
        items = [
            {'label': 'Home', 'icon': '🏠', 'path': '/', 'badge': None},
            {'label': 'Qualidade', 'icon': '✅', 'path': '/Qualidade_Dados', 'badge': '3'},
        ]
        html = create_mobile_drawer(items, active_page='/')
    """
    items_html = ""
    
    for item in items:
        is_active = item['path'] == active_page
        active_class = 'active' if is_active else ''
        aria_current = 'aria-current="page"' if is_active else ''
        
        badge_html = ''
        if item.get('badge'):
            badge_html = f'<span class="badge warning" style="margin-left:auto;" aria-label="{item["badge"]} notificações">{item["badge"]}</span>'
        
        items_html += f'''
        <a href="{item['path']}" 
           class="drawer-item {active_class}"
           {aria_current}
           role="menuitem">
            <span class="drawer-icon" aria-hidden="true">{item['icon']}</span>
            <span class="drawer-label">{item['label']}</span>
            {badge_html}
        </a>
        '''
    
    return f'''
    <!-- Mobile Drawer Navigation -->
    <div class="mobile-drawer" 
         id="mobileDrawer" 
         role="dialog" 
         aria-modal="true"
         aria-labelledby="drawer-title"
         aria-hidden="true">
        
        <div class="drawer-overlay" 
             onclick="closeMobileDrawer()" 
             aria-label="Fechar menu"></div>
        
        <div class="drawer-content">
            <div class="drawer-header">
                <h3 id="drawer-title">🦟 TechDengue</h3>
                <button class="drawer-close" 
                        onclick="closeMobileDrawer()"
                        aria-label="Fechar menu de navegação"
                        type="button">
                    <svg width="24" height="24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2"
                         aria-hidden="true">
                        <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <nav class="drawer-nav" role="menu" aria-label="Navegação principal">
                {items_html}
            </nav>
            
            <div class="drawer-footer">
                <button class="btn-help" 
                        onclick="openHelp()"
                        type="button">
                    ❓ Ajuda
                </button>
            </div>
        </div>
    </div>
    
    <!-- Mobile Menu Toggle Button -->
    <button class="mobile-menu-toggle" 
            onclick="openMobileDrawer()"
            aria-label="Abrir menu de navegação"
            aria-expanded="false"
            aria-controls="mobileDrawer"
            type="button">
        <svg width="24" height="24" 
             fill="none" 
             stroke="currentColor" 
             stroke-width="2"
             aria-hidden="true">
            <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
    </button>
    
    <script>
        // Mobile Drawer Control
        function openMobileDrawer() {{
            const drawer = document.getElementById('mobileDrawer');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            drawer.classList.add('open');
            drawer.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            
            // Trap focus
            const firstFocusable = drawer.querySelector('button, a');
            if (firstFocusable) firstFocusable.focus();
            
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        }}
        
        function closeMobileDrawer() {{
            const drawer = document.getElementById('mobileDrawer');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            
            // Return focus
            toggle.focus();
            
            // Unlock body scroll
            document.body.style.overflow = '';
        }}
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'Escape') {{
                const drawer = document.getElementById('mobileDrawer');
                if (drawer.classList.contains('open')) {{
                    closeMobileDrawer();
                }}
            }}
        }});
    </script>
    '''


def create_mobile_header_with_drawer(title: str = "TechDengue Analytics", nav_items: list = None) -> str:
    """
    Cria header mobile completo com drawer integrado
    
    Args:
        title: Título da aplicação
        nav_items: Lista de items de navegação
    """
    if nav_items is None:
        nav_items = [
            {'label': 'Home', 'icon': '🏠', 'path': '/', 'badge': None},
            {'label': 'Análises', 'icon': '📊', 'path': '/Analises', 'badge': None},
            {'label': 'Mega Tabela', 'icon': '📋', 'path': '/Mega_Tabela', 'badge': None},
            {'label': 'Qualidade', 'icon': '✅', 'path': '/Qualidade_Dados', 'badge': None},
        ]
    
    drawer = create_mobile_drawer(nav_items)
    
    return f'''
    <div class="mobile-header">
        {drawer}
        <div class="mobile-header-content">
            <span class="mobile-logo">🦟 {title}</span>
        </div>
    </div>
    '''
