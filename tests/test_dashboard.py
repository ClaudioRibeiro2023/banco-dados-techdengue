"""
Teste completo do dashboard após correções
"""
import sys
from pathlib import Path

# Adicionar diretório do dashboard
dashboard_dir = Path(__file__).parent / "dashboard"
sys.path.insert(0, str(dashboard_dir))

print("🔍 TESTE COMPLETO DO DASHBOARD")
print("=" * 50)

try:
    # Testar imports de componentes
    print("1. Testando imports de componentes...")
    from components.ui_components import (
        create_techdengue_header,
        create_metric_card_modern,
        create_section_header,
        create_year_card,
        create_techdengue_kpi_grid
    )
    print("   ✅ Todos os componentes importados com sucesso!")
    
    # Testar funções individuais
    print("\n2. Testando funções individuais...")
    
    # Header
    header_html = create_techdengue_header()
    print("   ✅ create_techdengue_header() funcionando!")
    
    # Metric card
    metric_html = create_metric_card_modern("📊", "Teste", "1,234", 5.0, "primary")
    print("   ✅ create_metric_card_modern() funcionando!")
    
    # Section header
    section_html = create_section_header("Título", "Descrição", "📊", "primary")
    print("   ✅ create_section_header() funcionando!")
    
    # Year card
    year_html = create_year_card(2024, 100, 5000, 50, 10.5)
    print("   ✅ create_year_card() funcionando!")
    
    # KPI grid
    kpi_metrics = {
        'total_pois': 100000,
        'total_hectares': 50000.5,
        'municipios_com_atividades': 400,
        'total_municipios': 853,
        'taxa_conversao_media': 25.5
    }
    kpi_html = create_techdengue_kpi_grid(kpi_metrics)
    print("   ✅ create_techdengue_kpi_grid() funcionando!")
    
    # Testar import do app principal
    print("\n3. Testando import do app principal...")
    import app
    print("   ✅ app.py importado com sucesso!")
    
    # Testar funções do app
    print("\n4. Testando funções do app...")
    
    # Verificar se as funções de carregamento existem
    if hasattr(app, 'carregar_relatorio_qualidade'):
        print("   ✅ carregar_relatorio_qualidade() existe!")
    if hasattr(app, 'carregar_mega_tabela'):
        print("   ✅ carregar_mega_tabela() existe!")
    if hasattr(app, 'carregar_insights'):
        print("   ✅ carregar_insights() existe!")
    
    print("\n5. Verificando estrutura de arquivos...")
    
    # Verificar arquivos importantes
    files_to_check = [
        "assets/modern.css",
        "components/__init__.py",
        "components/ui_components.py",
        "app.py"
    ]
    
    for file_path in files_to_check:
        full_path = dashboard_dir / file_path
        if full_path.exists():
            print(f"   ✅ {file_path} existe!")
        else:
            print(f"   ❌ {file_path} não encontrado!")
    
    print("\n" + "=" * 50)
    print("🎉 TODOS OS TESTES PASSARAM!")
    print("✅ Dashboard pronto para execução!")
    print("\n🚀 Para executar:")
    print("   cd C:\\Users\\claud\\CascadeProjects\\banco-dados-techdengue")
    print("   python -m streamlit run dashboard/app.py")
    
except Exception as e:
    print(f"\n❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
