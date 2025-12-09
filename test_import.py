"""
Teste de importação dos componentes
"""
import sys
from pathlib import Path

# Adicionar diretório do dashboard
dashboard_dir = Path(__file__).parent / "dashboard"
sys.path.insert(0, str(dashboard_dir))

try:
    from components.ui_components import create_techdengue_header
    print("✅ Importação bem-sucedida!")
    
    # Testar função
    header_html = create_techdengue_header()
    print("✅ Função executada com sucesso!")
    print("✅ Header HTML gerado:")
    print(header_html[:200] + "...")
    
except Exception as e:
    print(f"❌ Erro na importação: {e}")
    import traceback
    traceback.print_exc()
