"""
Componentes UI Modernos para TechDengue Analytics
Design System com UX Otimizado
"""

def create_metric_card_modern(icon, title, value, change=None, color="primary", size="default", tooltip=None):
    """
    Cria card de métrica moderno com design avançado
    
    Args:
        icon: Ícone (emoji ou HTML)
        title: Título da métrica
        value: Valor principal
        change: Mudança percentual (opcional)
        color: Cor do card (primary, success, warning, error)
        size: Tamanho (small, default, large)
    """
    
    size_classes = {
        "small": "p-4",
        "default": "p-6", 
        "large": "p-8"
    }
    
    value_sizes = {
        "small": "text-xl",
        "default": "text-2xl",
        "large": "text-3xl"
    }
    
    change_html = ""
    if change:
        change_value = float(change)
        change_type = "positive" if change_value >= 0 else "negative"
        change_sign = "+" if change_value >= 0 else ""
        change_html = f"""
        <div class="metric-card-change {change_type}">
            {change_sign}{change_value:.1f}%
        </div>
        """
    
    title_attr = f' title="{tooltip}" aria-label="{title}: {value}"' if tooltip else f' aria-label="{title}: {value}"'
    return f"""
    <div class="metric-card {color} {size_classes.get(size, 'p-6')} fade-in"{title_attr}>
        <div class="metric-card-icon">
            {icon}
        </div>
        <div class="metric-card-value {value_sizes.get(size, 'text-2xl')}">
            {value}
        </div>
        <div class="metric-card-label">
            {title}
        </div>
        {change_html}
    </div>
    """

def create_section_header(title, description, icon="📊", color="primary"):
    """
    Cria cabeçalho de seção moderno
    """
    return f"""
    <div class="section-header {color} scale-in">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 2rem;">{icon}</span>
            <div>
                <h2 style="margin: 0;">{title}</h2>
                <p style="margin: 0.5rem 0 0 0;">{description}</p>
            </div>
        </div>
    </div>
    """

def create_status_card(title, status="online", details=None):
    """
    Cria card de status moderno
    """
    status_icons = {
        "online": "🟢",
        "warning": "🟡", 
        "error": "🔴"
    }
    
    return f"""
    <div class="status-card {status} slide-in" role="status" aria-live="polite">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="status-indicator {status}"></span>
                    <strong>{title}</strong>
                </div>
                {f'<div style="font-size: 0.875rem; color: #6b7280;">{details}</div>' if details else ''}
            </div>
            <span style="font-size: 1.5rem;">{status_icons.get(status, '⚪')}</span>
        </div>
    </div>
    """

def create_analysis_card(title, icon, content, color="primary"):
    """
    Cria card de análise moderno
    """
    return f"""
    <div class="analysis-card fade-in">
        <div class="analysis-card-header">
            <div class="analysis-card-icon" style="background: var(--gradient-{color});">
                {icon}
            </div>
            <div class="analysis-card-title">
                {title}
            </div>
        </div>
        <div class="analysis-card-content">
            {content}
        </div>
    </div>
    """

def create_modern_button(text, icon=None, variant="primary", size="default", href=None):
    """
    Cria botão moderno
    
    Args:
        text: Texto do botão
        icon: Ícone (opcional)
        variant: Estilo (primary, success, warning, error, outline)
        size: Tamanho (small, default, large)
        href: Link (opcional)
    """
    
    size_classes = {
        "small": "px-3 py-2 text-sm",
        "default": "px-4 py-3 text-sm",
        "large": "px-6 py-4 text-base"
    }
    
    icon_html = f'<span>{icon}</span>' if icon else ''
    
    button_html = f"""
    <button class="modern-button {variant} {size_classes.get(size, 'px-4 py-3 text-sm')}">
        {icon_html}
        {text}
    </button>
    """
    
    if href:
        return f'<a href="{href}" style="text-decoration: none;">{button_html}</a>'
    
    return button_html

def create_modern_alert(message, type="info", icon="ℹ️"):
    """
    Cria alerta moderno
    """
    return f"""
    <div class="modern-alert {type} fade-in">
        <span style="font-size: 1.25rem;">{icon}</span>
        <div>{message}</div>
    </div>
    """

def create_progress_bar(value, max_value=100, color="primary", show_percentage=True):
    """
    Cria barra de progresso moderna
    """
    percentage = (value / max_value) * 100
    
    return f"""
    <div class="modern-progress">
        <div class="modern-progress-bar {color}" style="width: {percentage}%;"></div>
    </div>
    {f'<div style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">{percentage:.1f}%</div>' if show_percentage else ''}
    """

def create_badge(text, variant="primary", icon=None):
    """
    Cria badge moderno
    """
    icon_html = f'<span style="margin-right: 0.25rem;">{icon}</span>' if icon else ''
    
    return f"""
    <span class="modern-badge {variant}">
        {icon_html}{text}
    </span>
    """

def create_tooltip(content, tooltip_text):
    """
    Cria elemento com tooltip
    """
    return f"""
    <span class="tooltip" data-tooltip="{tooltip_text}">
        {content}
    </span>
    """

def create_loading_skeleton(height="100px", width="100%"):
    """
    Cria skeleton loading
    """
    return f"""
    <div class="loading-skeleton" style="height: {height}; width: {width};"></div>
    """

def create_spacer(height="1rem"):
    """
    Cria espaçador vertical
    """
    return f'<div style="height: {height};"></div>'

def create_divider(thick=False, color="gray"):
    """
    Cria divisor
    """
    thickness = "2px" if thick else "1px"
    divider_color = {
        "gray": "#e5e7eb",
        "primary": "#3b82f6",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "error": "#ef4444"
    }.get(color, "#e5e7eb")
    
    return f'<div style="border: none; border-top: {thickness} solid {divider_color}; margin: 2rem 0;"></div>'

def create_grid(columns=2, gap="1rem"):
    """
    Cria container de grid
    """
    return f"""
    <div style="display: grid; grid-template-columns: repeat({columns}, 1fr); gap: {gap};">
        {content}
    </div>
    """

def create_flex_container(items=[], justify="start", align="center", gap="1rem"):
    """
    Cria container flex
    """
    return f"""
    <div style="display: flex; justify-content: {justify}; align-items: {align}; gap: {gap};">
        {''.join(items)}
    </div>
    """

# Componentes específicos para o TechDengue
def create_techdengue_header():
    """
    Cria header específico do TechDengue
    """
    return """
    <div style="
        background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
        position: relative;
        overflow: hidden;
    ">
        <div style="
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        "></div>
        <div style="
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
        ">
            <div>
                <h1 style="margin: 0; font-size: 2.5rem; font-weight: 800;">
                    🦟 TechDengue Analytics
                </h1>
                <p style="margin: 0.5rem 0 0 0; font-size: 1.125rem; opacity: 0.9;">
                    Sistema Profissional de Gestão de Dados e Monitoramento
                </p>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.875rem; opacity: 0.7;">Versão 3.0</div>
                <div style="font-size: 0.875rem; opacity: 0.7;">Production Ready</div>
            </div>
        </div>
    </div>
    """

def create_year_card(year, activities, pois, municipalities, growth=None):
    """
    Cria card específico para análise anual
    """
    if activities == 0:
        return f"""
        <div class="metric-card warning" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📅</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #92400e; margin-bottom: 0.5rem;">
                {year}
            </div>
            <div style="font-size: 1.125rem; color: #92400e; margin-bottom: 0.5rem;">
                Sem Operações
            </div>
            <div style="font-size: 0.875rem; color: #b45309;">
                Ano de planejamento
            </div>
        </div>
        """
    else:
        growth_html = ""
        if growth:
            growth_type = "positive" if growth >= 0 else "negative"
            growth_sign = "+" if growth >= 0 else ""
            growth_html = f"""
            <div class="metric-card-change {growth_type}" style="margin-top: 1rem;">
                {growth_sign}{growth:.0f}% vs ano anterior
            </div>
            """
        
        return f"""
        <div class="metric-card success" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📅</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #15803d; margin-bottom: 0.5rem;">
                {year}
            </div>
            <div style="font-size: 1.25rem; font-weight: 600; color: #166534; margin-bottom: 0.5rem;">
                {activities:,} atividades
            </div>
            <div style="font-size: 1rem; color: #16a34a; margin-bottom: 0.25rem;">
                {pois:,} POIs
            </div>
            <div style="font-size: 1rem; color: #16a34a;">
                {municipalities} municípios
            </div>
            {growth_html}
        </div>
        """

def create_techdengue_kpi_grid(metrics):
    """
    Cria grid de KPIs específico do TechDengue
    
    Args:
        metrics: Dicionário com métricas
    """
    kpis = []
    
    # POIs
    if 'total_pois' in metrics:
        kpis.append(create_metric_card_modern(
            "🎯", 
            "POIs Identificados", 
            f"{metrics['total_pois']:,}",
            None,
            "primary"
        ))
    
    # Hectares
    if 'total_hectares' in metrics:
        kpis.append(create_metric_card_modern(
            "📏", 
            "Hectares Mapeados", 
            f"{metrics['total_hectares']:,.0f}",
            None,
            "info"
        ))
    
    # Municípios
    if 'municipios_com_atividades' in metrics and 'total_municipios' in metrics:
        coverage = (metrics['municipios_com_atividades'] / metrics['total_municipios']) * 100
        kpis.append(create_metric_card_modern(
            "🏙️", 
            "Municípios Ativos", 
            f"{metrics['municipios_com_atividades']:,}",
            coverage,
            "success"
        ))
    
    # Taxa de Conversão
    if 'taxa_conversao_media' in metrics:
        kpis.append(create_metric_card_modern(
            "📈", 
            "Taxa de Conversão", 
            f"{metrics['taxa_conversao_media']:.1f}%",
            None,
            "warning"
        ))
    
    return f"""
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        {''.join(kpis)}
    </div>
    """
