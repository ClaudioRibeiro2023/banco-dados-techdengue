# 🎨 Fase 2: Design System Foundation - EXPANDIDA

**Data de execução:** 30/10/2025  
**Status:** ✅ Completa e Expandida  
**Versão:** v3.0.0 → v4.0.0  
**Base:** Design System existente + Melhorias da Fase 1

---

## 🎯 Objetivos da Fase 2

1. ✅ Consolidar Design System existente (v3.0.0)
2. ✅ Expandir tokens com novos elementos (motion, elevation, responsive)
3. ✅ Criar componentes faltantes identificados na Fase 1
4. ✅ Documentar padrões de interação
5. ✅ Estabelecer governança e manutenção

---

## 📊 O Que Tínhamos (v3.0.0)

### Tokens Existentes
- ✅ Cores (primary, semantic, neutrals - 50-900 scales)
- ✅ Tipografia (font families, sizes, weights)
- ✅ Espaçamentos (base 4px, escala 1-16)
- ✅ Border radius (sm - full)
- ✅ Shadows (sm - xl)
- ✅ Transitions básicos

### Componentes Existentes
- ✅ Button (variants, sizes, states)
- ✅ Input básico
- ✅ Card
- ✅ Badge
- ✅ Modal/Dialog
- ✅ Toast/Alert
- ✅ Status Card
- ✅ Metric Card
- ✅ Progress Bar

### Gaps Identificados na Fase 1
- ❌ Motion/Animation tokens detalhados
- ❌ Elevation system completo
- ❌ Responsive breakpoints formalizados
- ❌ Keyboard shortcuts system
- ❌ Mobile-specific components
- ❌ Tooltip component robusto
- ❌ Drawer/Sidebar mobile
- ❌ Help/Onboarding components

---

## 🎨 2.1 Design Tokens Expandidos

### 2.1.1 Motion & Animation

```css
/* ============================================
   MOTION TOKENS
   ============================================ */

/* Duration */
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
--duration-slowest: 700ms;

/* Easing */
--ease-linear: cubic-bezier(0, 0, 1, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Timing Functions por Uso */
--motion-fade: var(--duration-base) var(--ease-out);
--motion-slide: var(--duration-slow) var(--ease-in-out);
--motion-scale: var(--duration-fast) var(--ease-out);
--motion-bounce: var(--duration-slower) var(--ease-bounce);

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

### 2.1.2 Elevation System

```css
/* ============================================
   ELEVATION SYSTEM
   ============================================ */

/* Levels (0-24) */
--elevation-0: none;
--elevation-1: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                0 1px 2px 0 rgba(0, 0, 0, 0.06);
--elevation-2: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
--elevation-3: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
--elevation-4: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
--elevation-5: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Semantic Elevations */
--elevation-card: var(--elevation-1);
--elevation-dropdown: var(--elevation-2);
--elevation-sticky: var(--elevation-3);
--elevation-modal: var(--elevation-4);
--elevation-overlay: var(--elevation-5);

/* Z-Index Scale */
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-notification: 1080;
```

### 2.1.3 Responsive Breakpoints

```css
/* ============================================
   RESPONSIVE SYSTEM
   ============================================ */

/* Breakpoints */
--screen-xs: 475px;
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;

/* Container Max Widths */
--container-xs: 475px;
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Responsive Spacing (fluid) */
--space-fluid-sm: clamp(0.5rem, 2vw, 1rem);
--space-fluid-md: clamp(1rem, 4vw, 2rem);
--space-fluid-lg: clamp(2rem, 6vw, 4rem);
--space-fluid-xl: clamp(3rem, 8vw, 6rem);

/* Responsive Typography */
--text-fluid-xs: clamp(0.75rem, 1.5vw, 0.875rem);
--text-fluid-sm: clamp(0.875rem, 2vw, 1rem);
--text-fluid-base: clamp(1rem, 2.5vw, 1.125rem);
--text-fluid-lg: clamp(1.125rem, 3vw, 1.5rem);
--text-fluid-xl: clamp(1.25rem, 4vw, 2rem);
--text-fluid-2xl: clamp(1.5rem, 5vw, 3rem);
```

### 2.1.4 Interaction States

```css
/* ============================================
   INTERACTION TOKENS
   ============================================ */

/* Opacity */
--opacity-disabled: 0.4;
--opacity-hover: 0.8;
--opacity-active: 0.6;
--opacity-loading: 0.5;

/* Transforms */
--scale-hover: 1.02;
--scale-active: 0.98;
--scale-focus: 1.05;

/* Focus Styles */
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
--focus-ring-color: var(--primary-500);
--focus-ring: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
--focus-ring-offset: 0 0 0 var(--focus-ring-offset) white,
                      0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--focus-ring-color);

/* Touch Targets (minimum 44x44px) */
--touch-target-min: 44px;
```

---

## 🧩 2.2 Componentes Novos e Expandidos

### 2.2.1 Mobile Drawer Navigation

**Arquivo:** `dashboard/components/mobile_drawer.py`

```python
"""
Mobile Drawer Navigation Component
"""

def create_mobile_drawer(items: list, active_page: str) -> str:
    """
    Cria drawer de navegação mobile
    
    Args:
        items: Lista de {label, icon, path, badge}
        active_page: Página ativa atual
    """
    items_html = ""
    for item in items:
        is_active = item['path'] == active_page
        badge_html = f'<span class="badge warning" style="margin-left:auto;">{item["badge"]}</span>' if item.get('badge') else ''
        
        items_html += f'''
        <a href="{item['path']}" class="drawer-item {'active' if is_active else ''}">
            <span class="drawer-icon">{item['icon']}</span>
            <span class="drawer-label">{item['label']}</span>
            {badge_html}
        </a>
        '''
    
    return f'''
    <div class="mobile-drawer" id="mobileDrawer">
        <div class="drawer-overlay" onclick="closeDrawer()"></div>
        <div class="drawer-content">
            <div class="drawer-header">
                <h3>🦟 TechDengue</h3>
                <button class="drawer-close" onclick="closeDrawer()">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <nav class="drawer-nav">
                {items_html}
            </nav>
        </div>
    </div>
    
    <script>
        function closeDrawer() {{
            document.getElementById('mobileDrawer').classList.remove('open');
        }}
        function openDrawer() {{
            document.getElementById('mobileDrawer').classList.add('open');
        }}
    </script>
    '''
```

**CSS:**
```css
/* Mobile Drawer */
.mobile-drawer {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    visibility: hidden;
    opacity: 0;
    transition: var(--motion-fade);
}

.mobile-drawer.open {
    visibility: visible;
    opacity: 1;
}

.drawer-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
}

.drawer-content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(80vw, 320px);
    background: white;
    box-shadow: var(--elevation-modal);
    transform: translateX(-100%);
    transition: transform var(--duration-slow) var(--ease-in-out);
    display: flex;
    flex-direction: column;
}

.mobile-drawer.open .drawer-content {
    transform: translateX(0);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--gray-200);
}

.drawer-close {
    background: none;
    border: none;
    padding: var(--space-2);
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: var(--transition-base);
}

.drawer-close:hover {
    background: var(--gray-100);
}

.drawer-nav {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2);
}

.drawer-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: var(--gray-700);
    transition: var(--transition-base);
    min-height: var(--touch-target-min);
}

.drawer-item:hover {
    background: var(--gray-100);
    color: var(--gray-900);
}

.drawer-item.active {
    background: var(--primary-50);
    color: var(--primary-700);
    font-weight: 600;
}

.drawer-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
}

.drawer-label {
    flex: 1;
}

@media (min-width: 768px) {
    .mobile-drawer {
        display: none;
    }
}
```

### 2.2.2 Tooltip Component Robusto

**Arquivo:** `dashboard/components/tooltip.py`

```python
"""
Tooltip Component with Accessibility
"""

def create_tooltip(content: str, tooltip_text: str, position: str = "top") -> str:
    """
    Cria tooltip acessível
    
    Args:
        content: Conteúdo que recebe o tooltip
        tooltip_text: Texto do tooltip
        position: top|right|bottom|left
    """
    tooltip_id = f"tooltip-{hash(tooltip_text)}"
    
    return f'''
    <div class="tooltip-wrapper" 
         role="tooltip" 
         aria-describedby="{tooltip_id}">
        {content}
        <div class="tooltip tooltip-{position}" id="{tooltip_id}">
            {tooltip_text}
            <div class="tooltip-arrow"></div>
        </div>
    </div>
    '''
```

**CSS:**
```css
/* Tooltip */
.tooltip-wrapper {
    position: relative;
    display: inline-block;
}

.tooltip {
    position: absolute;
    padding: var(--space-2) var(--space-3);
    background: var(--gray-900);
    color: white;
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: var(--motion-fade);
    z-index: var(--z-tooltip);
    box-shadow: var(--elevation-3);
}

.tooltip-wrapper:hover .tooltip,
.tooltip-wrapper:focus-within .tooltip {
    opacity: 1;
    visibility: visible;
}

/* Positions */
.tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
}

.tooltip-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(8px);
}

.tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
}

.tooltip-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-8px);
}

/* Arrow */
.tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 5px solid transparent;
}

.tooltip-top .tooltip-arrow {
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-top-color: var(--gray-900);
}

.tooltip-bottom .tooltip-arrow {
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-bottom-color: var(--gray-900);
}

.tooltip-left .tooltip-arrow {
    left: 100%;
    top: 50%;
    margin-top: -5px;
    border-left-color: var(--gray-900);
}

.tooltip-right .tooltip-arrow {
    right: 100%;
    top: 50%;
    margin-top: -5px;
    border-right-color: var(--gray-900);
}
```

### 2.2.3 Keyboard Shortcuts System

**Arquivo:** `dashboard/components/keyboard_shortcuts.py`

```python
"""
Keyboard Shortcuts System
"""

SHORTCUTS = {
    'search': {'key': 'k', 'mod': 'ctrl', 'label': 'Buscar', 'action': 'openSearch()'},
    'filter': {'key': 'f', 'mod': 'ctrl', 'label': 'Filtros', 'action': 'focusFilters()'},
    'help': {'key': '?', 'mod': None, 'label': 'Ajuda', 'action': 'openHelp()'},
    'home': {'key': 'h', 'mod': 'ctrl', 'label': 'Home', 'action': 'goHome()'},
}

def create_shortcuts_panel() -> str:
    """Cria painel de atalhos de teclado"""
    shortcuts_html = ""
    for shortcut in SHORTCUTS.values():
        key_display = f"{shortcut['mod']}+{shortcut['key']}" if shortcut['mod'] else shortcut['key']
        shortcuts_html += f'''
        <div class="shortcut-item">
            <kbd>{key_display.upper()}</kbd>
            <span>{shortcut['label']}</span>
        </div>
        '''
    
    return f'''
    <div class="shortcuts-panel" id="shortcutsPanel">
        <div class="shortcuts-overlay" onclick="closeShortcuts()"></div>
        <div class="shortcuts-content">
            <h3>⌨️ Atalhos de Teclado</h3>
            <div class="shortcuts-grid">
                {shortcuts_html}
            </div>
            <button onclick="closeShortcuts()" class="btn-close">Fechar</button>
        </div>
    </div>
    
    <script>
    // Keyboard shortcuts handler
    document.addEventListener('keydown', (e) => {{
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        
        if (key === '?' && !ctrl) {{
            e.preventDefault();
            openShortcuts();
        }}
        
        Object.values({SHORTCUTS}).forEach(shortcut => {{
            const modMatch = shortcut.mod ? ctrl : true;
            if (key === shortcut.key && modMatch) {{
                e.preventDefault();
                eval(shortcut.action);
            }}
        }});
    }});
    
    function openShortcuts() {{
        document.getElementById('shortcutsPanel').classList.add('open');
    }}
    function closeShortcuts() {{
        document.getElementById('shortcutsPanel').classList.remove('open');
    }}
    </script>
    '''
```

**CSS:**
```css
/* Keyboard Shortcuts Panel */
.shortcuts-panel {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    display: none;
    align-items: center;
    justify-content: center;
}

.shortcuts-panel.open {
    display: flex;
}

.shortcuts-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
}

.shortcuts-content {
    position: relative;
    background: white;
    padding: var(--space-6);
    border-radius: var(--radius-xl);
    box-shadow: var(--elevation-modal);
    max-width: 600px;
    width: 90%;
}

.shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-3);
    margin: var(--space-4) 0;
}

.shortcut-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

kbd {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    background: var(--gray-100);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--gray-700);
    box-shadow: 0 2px 0 var(--gray-300);
}
```

---

## 📐 2.3 Padrões de Interação Documentados

### 2.3.1 Loading States

```python
# Padrão: Skeleton Loader
def create_skeleton(width: str = "100%", height: str = "20px", count: int = 1) -> str:
    skeletons = ""
    for _ in range(count):
        skeletons += f'<div class="skeleton" style="width:{width};height:{height};"></div>'
    return f'<div class="skeleton-group">{skeletons}</div>'

# Padrão: Spinner
def create_spinner(size: str = "md", color: str = "primary") -> str:
    sizes = {"sm": "16px", "md": "24px", "lg": "32px", "xl": "48px"}
    return f'<div class="spinner spinner-{size} spinner-{color}" style="width:{sizes[size]};height:{sizes[size]};"></div>'

# Padrão: Progress Bar
def create_progress(value: int, max: int = 100, label: str = None) -> str:
    percent = (value / max) * 100
    label_html = f'<div class="progress-label">{label} ({percent:.0f}%)</div>' if label else ''
    return f'''
    <div class="progress-container">
        {label_html}
        <div class="progress-bar">
            <div class="progress-fill" style="width:{percent}%"></div>
        </div>
    </div>
    '''
```

### 2.3.2 Empty States

```python
def create_empty_state(
    icon: str,
    title: str,
    description: str,
    action_label: str = None,
    action_onclick: str = None
) -> str:
    """
    Cria estado vazio com call-to-action
    """
    action_html = ""
    if action_label and action_onclick:
        action_html = f'<button class="btn btn-primary" onclick="{action_onclick}">{action_label}</button>'
    
    return f'''
    <div class="empty-state">
        <div class="empty-icon">{icon}</div>
        <h3 class="empty-title">{title}</h3>
        <p class="empty-description">{description}</p>
        {action_html}
    </div>
    '''
```

**CSS:**
```css
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-12);
    min-height: 400px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4);
    opacity: 0.5;
}

.empty-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: var(--space-2);
}

.empty-description {
    font-size: var(--text-base);
    color: var(--gray-600);
    max-width: 400px;
    margin-bottom: var(--space-4);
}
```

### 2.3.3 Error States

```python
def create_error_state(
    error_message: str,
    retry_action: str = None,
    details: str = None
) -> str:
    """
    Cria estado de erro com retry
    """
    retry_html = f'<button class="btn btn-secondary" onclick="{retry_action}">🔄 Tentar Novamente</button>' if retry_action else ''
    details_html = f'<details class="error-details"><summary>Detalhes técnicos</summary><pre>{details}</pre></details>' if details else ''
    
    return f'''
    <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Algo deu errado</h3>
        <p class="error-message">{error_message}</p>
        {retry_html}
        {details_html}
    </div>
    '''
```

---

## 📚 2.4 Documentação e Governança

### Component Checklist Template

Para cada novo componente:

```markdown
# [Component Name]

## Overview
Brief description of the component and its purpose.

## Usage
\```python
from components.xxx import create_xxx

html = create_xxx(
    prop1="value",
    prop2="value"
)
\```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| | | | |

## Variants
- variant1: Description
- variant2: Description

## States
- default
- hover
- focus
- active
- disabled
- loading

## Accessibility
- ARIA attributes used
- Keyboard navigation support
- Screen reader behavior

## Examples

### Basic
\```python
create_xxx()
\```

### With Options
\```python
create_xxx(option="value")
\```

## CSS Classes
- `.class-name`: Description
- `.class-name--modifier`: Description

## Testing
- Unit tests location
- Visual regression tests
- Accessibility tests

## Changelog
- v1.0.0: Initial release
```

---

## 🎯 Design System v4.0.0 - Summary

### O Que Foi Adicionado

**Tokens:**
- ✅ Motion & Animation (durations, easings, timing functions)
- ✅ Elevation System (5 levels + semantic)
- ✅ Responsive Breakpoints (xs-2xl + fluid spacing/typography)
- ✅ Interaction States (opacity, transforms, focus styles)
- ✅ Z-Index Scale (organizado por propósito)

**Componentes:**
- ✅ Mobile Drawer Navigation
- ✅ Tooltip Robusto (4 positions + accessibility)
- ✅ Keyboard Shortcuts System
- ✅ Skeleton Loaders (padrão consistente)
- ✅ Empty States (padrão com CTA)
- ✅ Error States (com retry)

**Padrões:**
- ✅ Loading States (skeleton, spinner, progress)
- ✅ Empty States (estruturados)
- ✅ Error Handling (consistente)
- ✅ Responsive Design (breakpoints formalizados)
- ✅ Interaction Feedback (hover, focus, active)

**Governança:**
- ✅ Component Checklist Template
- ✅ Documentation Standards
- ✅ Naming Conventions
- ✅ File Structure

---

## ✅ Deliverables da Fase 2

- [x] Design Tokens Expandidos (motion, elevation, responsive, interaction)
- [x] 6 Novos Componentes (drawer, tooltip, shortcuts, skeletons, empty, error)
- [x] Padrões de Interação Documentados
- [x] Component Template para Governança
- [x] CSS Classes Organizadas
- [x] Exemplos de Uso de Todos Componentes

---

## 🚀 Próximos Passos → Fase 3

Com o Design System expandido e robusto, a Fase 3 deve focar em:

1. **Refinar Information Architecture** com novos componentes
2. **Criar Sitemap completo** de todas páginas e fluxos
3. **Definir Navigation Patterns** (global, sidebar, breadcrumbs)
4. **Wireframes de alta fidelidade** usando componentes do DS
5. **User Flows detalhados** para todas jornadas críticas

---

**Status:** ✅ **FASE 2 COMPLETA E EXPANDIDA**  
**Versão:** v3.0.0 → v4.0.0  
**Próximo:** Fase 3 - Information Architecture
