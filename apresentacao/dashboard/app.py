"""
Dashboard CISARP - Aplicação Principal
Baseado em arquitetura enterprise SIVEPI

Autor: Dashboard CISARP Team
Versão: 1.0.0
"""

import streamlit as st
from pathlib import Path

# Importar configurações e sistema de design
from dashboard.config.settings import settings
from dashboard.shared.design_system import ds
from dashboard.shared.ui_enhancements import ui
from dashboard.core import data_processor, cache_manager, event_bus

# Configuração da página
st.set_page_config(
    page_title=settings.PAGE_TITLE,
    page_icon=settings.PAGE_ICON,
    layout=settings.LAYOUT,
    initial_sidebar_state=settings.INITIAL_SIDEBAR_STATE
)

# Injetar CSS customizado
ds.inject_custom_css()
ui.inject_advanced_css()

# ==================== MAIN ====================

def main():
    """Função principal do dashboard"""
    
    # Header principal
    ds.section_header(
        title="Dashboard CISARP",
        description="Análise de Impacto - TechDengue em Ação",
        icon="🦟"
    )
    
    # Sidebar
    with st.sidebar:
        st.title("🦟 Dashboard CISARP")
        st.markdown("---")
        
        st.markdown("### 📊 Navegação")
        st.info("""
        **Páginas disponíveis:**
        - 🏠 Home
        - 📊 Performance
        - 💊 Impacto Epidemiológico
        - 🏆 Benchmarking
        - 🔍 Exploração
        - 💡 Insights
        
        *Selecione uma página no menu acima*
        """)
        
        st.markdown("---")
        
        # Estatísticas do sistema
        with st.expander("⚙️ Status do Sistema"):
            cache_stats = cache_manager.get_stats()
            st.metric("Cache em Memória", cache_stats['memory_entries'])
            st.metric("Cache em Disco", cache_stats['disk_files'])
            st.metric("TTL (minutos)", cache_stats['ttl_minutes'])
        
        st.markdown("---")
        st.caption(f"v{settings.VERSION}")
    
    # Conteúdo principal
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        ds.metric_card(
            title="Intervenções",
            value="108",
            delta="+37 vs inicial",
            color="primary",
            icon="📊"
        )
    
    with col2:
        ds.metric_card(
            title="POIs",
            value="13.584",
            color="success",
            icon="📍"
        )
    
    with col3:
        ds.metric_card(
            title="Hectares",
            value="9.440",
            delta="+94%",
            color="info",
            icon="🗺️"
        )
    
    with col4:
        ds.metric_card(
            title="Ranking",
            value="4º",
            delta="Top 6%",
            color="warning",
            icon="🏆"
        )
    
    st.markdown("")
    
    # Mensagem de boas-vindas
    ds.info_box(
        content="✅ **Core System funcionando!** Design System, Data Processor, Cache Manager e Event Bus estão operacionais.",
        box_type="success",
        icon="🎉"
    )
    
    st.markdown("")
    
    # Próximos passos
    st.subheader("📋 Próximos Passos")
    
    col1, col2 = st.columns(2)
    
    with col1:
        ds.stat_card(
            title="Fase Atual",
            value="Fase 1 ✅",
            subtitle="Core System implementado"
        )
    
    with col2:
        ds.stat_card(
            title="Próxima Fase",
            value="Fase 2",
            subtitle="Módulos de Análise"
        )
    
    st.markdown("")
    
    # Roadmap
    with st.expander("📊 Ver Roadmap Completo"):
        st.markdown("""
        ### Fases de Desenvolvimento
        
        **✅ Fase 0: Setup** (1h) - COMPLETO
        - Estrutura de pastas
        - Dependências instaladas
        - Settings centralizados
        
        **✅ Fase 1: Core System** (3h) - COMPLETO
        - Design System centralizado ✅
        - Data Processor robusto ✅
        - Cache Manager inteligente ✅
        - Event Bus funcional ✅
        
        **⏳ Fase 2: Módulos de Análise** (4h) - PRÓXIMO
        - Performance Analyzer
        - Impact Analyzer
        - Benchmark Analyzer
        - Insights Generator
        
        **⏳ Fase 3: Páginas Dashboard** (6h)
        - Home, Performance, Impacto
        - Benchmarking, Exploração, Insights
        
        **⏳ Fase 4-6:** UI/UX, Testes, Deploy
        """)
    
    st.markdown("")
    
    # Footer
    ds.divider()
    st.caption("Dashboard CISARP - Arquitetura Enterprise baseada em SIVEPI")

if __name__ == "__main__":
    main()
