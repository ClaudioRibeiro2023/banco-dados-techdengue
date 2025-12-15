"""
Empty and Error State Components
Design System v4.0.0
"""

def create_empty_state(
    icon: str = "📭",
    title: str = "Nenhum dado disponível",
    description: str = "Não há dados para exibir no momento",
    action_label: str = None,
    action_onclick: str = None,
    action_variant: str = "primary"
) -> str:
    """
    Cria estado vazio com call-to-action opcional
    
    Args:
        icon: Emoji ou HTML do ícone
        title: Título do estado vazio
        description: Descrição detalhada
        action_label: Texto do botão de ação (opcional)
        action_onclick: Função JavaScript ao clicar (opcional)
        action_variant: Variante do botão (primary|secondary)
        
    Returns:
        HTML string do empty state
        
    Example:
        html = create_empty_state(
            icon="📊",
            title="Nenhuma análise salva",
            description="Você ainda não salvou nenhuma análise personalizada",
            action_label="Criar primeira análise",
            action_onclick="createNewAnalysis()"
        )
    """
    action_html = ""
    if action_label and action_onclick:
        action_html = f'''
        <button class="btn btn-{action_variant}" 
                onclick="{action_onclick}"
                type="button">
            {action_label}
        </button>
        '''
    
    return f'''
    <div class="empty-state" role="status" aria-live="polite">
        <div class="empty-icon" aria-hidden="true">{icon}</div>
        <h3 class="empty-title">{title}</h3>
        <p class="empty-description">{description}</p>
        {action_html}
    </div>
    '''


def create_empty_search_state(search_term: str = "") -> str:
    """
    Estado vazio específico para busca sem resultados
    
    Args:
        search_term: Termo buscado
    """
    term_display = f' para "{search_term}"' if search_term else ''
    
    return create_empty_state(
        icon="🔍",
        title=f"Nenhum resultado encontrado{term_display}",
        description="Tente ajustar os filtros ou usar termos diferentes",
        action_label="Limpar filtros",
        action_onclick="clearAllFilters()"
    )


def create_empty_filtered_state() -> str:
    """
    Estado vazio para dados filtrados
    """
    return create_empty_state(
        icon="🔎",
        title="Nenhum registro com os filtros selecionados",
        description="Ajuste os critérios de filtro para ver mais resultados",
        action_label="Remover filtros",
        action_onclick="clearAllFilters()"
    )


def create_error_state(
    error_message: str = "Ocorreu um erro ao carregar os dados",
    retry_action: str = None,
    details: str = None,
    error_code: str = None,
    show_support: bool = True
) -> str:
    """
    Cria estado de erro com opções de retry e detalhes técnicos
    
    Args:
        error_message: Mensagem de erro amigável
        retry_action: Função JavaScript para tentar novamente
        details: Detalhes técnicos do erro
        error_code: Código do erro
        show_support: Mostrar link de suporte
        
    Returns:
        HTML string do error state
        
    Example:
        html = create_error_state(
            error_message="Não foi possível carregar a Mega Tabela",
            retry_action="reloadMegaTabela()",
            details="FileNotFoundError: mega_tabela_analitica.parquet",
            error_code="ERR_DATA_001"
        )
    """
    retry_html = ""
    if retry_action:
        retry_html = f'''
        <button class="btn btn-primary" 
                onclick="{retry_action}"
                type="button">
            🔄 Tentar Novamente
        </button>
        '''
    
    details_html = ""
    if details:
        details_html = f'''
        <details class="error-details">
            <summary>Detalhes técnicos</summary>
            <pre class="error-code-block"><code>{details}</code></pre>
            {f'<p class="error-code-label">Código: {error_code}</p>' if error_code else ''}
        </details>
        '''
    
    support_html = ""
    if show_support:
        support_html = '''
        <p class="error-support">
            <a href="#" onclick="openSupport(); return false;">
                💬 Entrar em contato com o suporte
            </a>
        </p>
        '''
    
    return f'''
    <div class="error-state" role="alert" aria-live="assertive">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <h3 class="error-title">Algo deu errado</h3>
        <p class="error-message">{error_message}</p>
        <div class="error-actions">
            {retry_html}
        </div>
        {details_html}
        {support_html}
    </div>
    '''


def create_connection_error_state(retry_action: str = "window.location.reload()") -> str:
    """
    Estado de erro específico para falha de conexão
    
    Args:
        retry_action: Função para recarregar
    """
    return create_error_state(
        error_message="Não foi possível conectar ao servidor",
        retry_action=retry_action,
        details="Network error: Failed to fetch",
        error_code="ERR_NETWORK_001",
        show_support=False
    )


def create_permission_error_state() -> str:
    """
    Estado de erro para falta de permissão
    """
    return create_error_state(
        error_message="Você não tem permissão para acessar este recurso",
        retry_action=None,
        details="403 Forbidden: Insufficient permissions",
        error_code="ERR_PERM_001",
        show_support=True
    )


def create_loading_skeleton(width: str = "100%", height: str = "20px", count: int = 1) -> str:
    """
    Cria skeleton loader para estado de carregamento
    
    Args:
        width: Largura do skeleton
        height: Altura do skeleton
        count: Número de skeletons
        
    Returns:
        HTML string com skeletons
    """
    skeletons = ""
    for i in range(count):
        margin_bottom = "var(--space-2)" if i < count - 1 else "0"
        skeletons += f'''
        <div class="skeleton" 
             style="width:{width};height:{height};margin-bottom:{margin_bottom};"
             aria-hidden="true"></div>
        '''
    
    return f'''
    <div class="skeleton-group" aria-label="Carregando..." role="status">
        {skeletons}
        <span class="sr-only">Carregando conteúdo...</span>
    </div>
    '''


def create_loading_card_skeleton() -> str:
    """
    Skeleton loader no formato de card
    """
    return f'''
    <div class="skeleton-card" aria-label="Carregando card..." role="status">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <span class="sr-only">Carregando conteúdo do card...</span>
    </div>
    '''


def create_loading_table_skeleton(rows: int = 5, columns: int = 4) -> str:
    """
    Skeleton loader no formato de tabela
    
    Args:
        rows: Número de linhas
        columns: Número de colunas
    """
    header_cells = ""
    for _ in range(columns):
        header_cells += '<div class="skeleton skeleton-table-header"></div>'
    
    body_rows = ""
    for _ in range(rows):
        row_cells = ""
        for _ in range(columns):
            row_cells += '<div class="skeleton skeleton-table-cell"></div>'
        body_rows += f'<div class="skeleton-table-row">{row_cells}</div>'
    
    return f'''
    <div class="skeleton-table" aria-label="Carregando tabela..." role="status">
        <div class="skeleton-table-header-row">{header_cells}</div>
        {body_rows}
        <span class="sr-only">Carregando dados da tabela...</span>
    </div>
    '''


def create_spinner(size: str = "md", color: str = "primary", label: str = "Carregando...") -> str:
    """
    Cria spinner de carregamento animado
    
    Args:
        size: Tamanho (sm|md|lg|xl)
        color: Cor (primary|success|warning|error)
        label: Texto acessível
        
    Returns:
        HTML string com spinner
    """
    sizes = {
        "sm": "16px",
        "md": "24px", 
        "lg": "32px",
        "xl": "48px"
    }
    
    size_px = sizes.get(size, "24px")
    
    return f'''
    <div class="spinner-container" role="status" aria-live="polite">
        <svg class="spinner spinner-{size} spinner-{color}" 
             width="{size_px}" 
             height="{size_px}"
             viewBox="0 0 50 50"
             aria-hidden="true">
            <circle class="spinner-track" 
                    cx="25" 
                    cy="25" 
                    r="20" 
                    fill="none" 
                    stroke-width="5"></circle>
            <circle class="spinner-progress" 
                    cx="25" 
                    cy="25" 
                    r="20" 
                    fill="none" 
                    stroke-width="5"></circle>
        </svg>
        <span class="spinner-label" aria-hidden="true">{label}</span>
        <span class="sr-only">{label}</span>
    </div>
    '''
