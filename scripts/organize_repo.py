"""
Script de Organização do Repositório TechDengue.
Move arquivos temporários, de debug e documentação obsoleta para pastas apropriadas.
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent

# ============================================================
# CONFIGURAÇÃO DE MOVIMENTAÇÃO
# ============================================================

# Scripts de debug para scripts/debug/
DEBUG_SCRIPTS = [
    "debug_codigos_ibge.py",
    "debug_hectares.py",
    "debug_hectares_detalhado.py",
    "debug_hectares_final.py",
    "debug_municipios.py",
]

# Scripts de verificação para scripts/verificacao/
VERIFICACAO_SCRIPTS = [
    "verificar_abas.py",
    "verificar_analise_integrada.py",
    "verificar_colunas.py",
    "verificar_colunas_atividades.py",
    "verificar_colunas_excel.py",
    "verificar_hectares_corrigidos.py",
    "temp_check_consorcio.py",
]

# Imagens para assets/images/
IMAGES = [
    "analise_por_analista.png",
    "analise_por_sistema.png",
    "distribuicao_geografica.png",
    "heatmap_analista_sistema.png",
    "mapa_calor_densidade.png",
]

# Documentos obsoletos/rascunhos para docs/archive/
ARCHIVE_DOCS = [
    "ATUALIZACAO_V5_APLICADA.md",
    "COMO_VER_DASHBOARD_NOVO.md",
    "CORRECOES_E_METODOLOGIA.md",
    "DASHBOARD_V6_NOVO_VISUAL.md",
    "IMPLEMENTACAO_COMPLETA_FASES_1_A_8.md",
    "INICIO_RAPIDO_V5.md",
    "MONITOR_QUALIDADE_FINAL.md",
    "MUDANCAS_VISUAIS_REAIS_V5.md",
    "PLANO_IMPLEMENTACAO_IMEDIATO.md",
    "REDESIGN_COMPLETO_12_FASES.md",
    "REORGANIZACAO_COMPLETA.md",
]

# Scripts de análise para scripts/ (mantêm relevância)
ANALYSIS_SCRIPTS = [
    "analise_detalhada_abas.py",
    "analyze_data_quality.py",
    "diagnostico_mega_tabela.py",
    "exemplo_analise_exploratoria.py",
    "investigar_categorias_pois.py",
    "investigar_divergencia.py",
    "revisao_completa_dados.py",
]


def move_files(files: list, dest_dir: str, dry_run: bool = True):
    """Move arquivos para o diretório de destino."""
    dest = ROOT / dest_dir
    dest.mkdir(parents=True, exist_ok=True)
    
    moved = []
    for f in files:
        src = ROOT / f
        if src.exists():
            dst = dest / f
            if dry_run:
                print(f"  [DRY-RUN] {f} -> {dest_dir}/{f}")
            else:
                shutil.move(str(src), str(dst))
                print(f"  [MOVIDO] {f} -> {dest_dir}/{f}")
            moved.append(f)
        else:
            print(f"  [SKIP] {f} não encontrado")
    
    return moved


def main(dry_run: bool = True):
    """Executa a organização do repositório."""
    print("=" * 60)
    print("ORGANIZAÇÃO DO REPOSITÓRIO TECHDENGUE")
    print("=" * 60)
    
    if dry_run:
        print("\n⚠️  MODO DRY-RUN: Nenhum arquivo será movido.")
        print("   Execute com --execute para aplicar as mudanças.\n")
    else:
        print("\n🚀 MODO EXECUÇÃO: Arquivos serão movidos.\n")
    
    # 1. Scripts de debug
    print("\n📁 Scripts de Debug -> scripts/debug/")
    move_files(DEBUG_SCRIPTS, "scripts/debug", dry_run)
    
    # 2. Scripts de verificação
    print("\n📁 Scripts de Verificação -> scripts/verificacao/")
    move_files(VERIFICACAO_SCRIPTS, "scripts/verificacao", dry_run)
    
    # 3. Imagens
    print("\n📁 Imagens -> assets/images/")
    move_files(IMAGES, "assets/images", dry_run)
    
    # 4. Documentos obsoletos
    print("\n📁 Documentos Obsoletos -> docs/archive/")
    move_files(ARCHIVE_DOCS, "docs/archive", dry_run)
    
    # 5. Scripts de análise
    print("\n📁 Scripts de Análise -> scripts/")
    move_files(ANALYSIS_SCRIPTS, "scripts", dry_run)
    
    print("\n" + "=" * 60)
    if dry_run:
        print("Execute: python scripts/organize_repo.py --execute")
    else:
        print("✅ Organização concluída!")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    dry_run = "--execute" not in sys.argv
    main(dry_run)
