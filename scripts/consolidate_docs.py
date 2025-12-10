"""
Script de Consolidação de Documentação.
Arquiva docs obsoletos e mantém apenas os essenciais.
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent

# ============================================================
# APRESENTACAO - Arquivos para mover para archive
# ============================================================

APRESENTACAO_TO_ARCHIVE = [
    # Fases antigas
    "FASE1_COMPLETA_RESUMO.md",
    "FASE2_COMPLETA_RESUMO.md",
    "FASE3_COMPLETA_FINAL.md",
    "FASE3_PROGRESSO.md",
    "FASE4_COMPLETA_FINAL.md",
    "FASE5_COMPLETA_FINAL.md",
    "FASE6_COMPLETA_FINAL.md",
    # Planos concluídos
    "PLANO_DEFINITIVO_DASHBOARD.md",
    "PLANO_DEFINITIVO_FASES.md",
    "PROGRESSO_IMPLEMENTACAO.md",
    # Índices duplicados
    "INDICE_DOCUMENTACAO.md",
    "INDICE_FINAL.md",
    "INICIO_AQUI.md",
    "START_HERE_DEFINITIVO.md",
    # Resumos antigos
    "RESUMO_EXECUTIVO_CORRECAO.md",
    "RESUMO_VISUAL_1PAGINA.md",
    "SUMARIO_ENTREGA.md",
    "SUMARIO_FINAL_COMPLETO.md",
    "STATUS_ATUAL_COMPLETO.md",
    # Guias duplicados
    "GUIA_DASHBOARD.md",
    "GUIA_EXECUCAO_METODOLOGIA.md",
    "GUIA_RAPIDO.md",
    "QUICK_REFERENCE_VISUAL.md",
    # Metodologias antigas
    "METODOLOGIA_DASHBOARD.md",
    "CORRECAO_DIVERGENCIA.md",
    # Outros
    "INSTALLATION.md",
    "UI_UX_GUIDE.md",
    "TESTING_GUIDE.md",
    "README_DASHBOARD.md",
]

# Manter na apresentacao
APRESENTACAO_KEEP = [
    "README.md",
    "ANALISES_COMPLETAS_CISARP.md",
    "CHANGELOG.md",
    "CHEAT_SHEET_APRESENTACAO.md",
    "EXEC_SUMMARY_DEFINITIVO.md",
    "GUIA_ANALISE_IMPACTO.md",
    "METODOLOGIA_ANALISE.md",
    "METODOLOGIA_APRESENTACAO_CISARP.md",
    "NUMEROS_CORRETOS_CISARP.md",
]

# ============================================================
# DESIGN-SYSTEM - Arquivos para mover para archive
# ============================================================

DESIGN_SYSTEM_TO_ARCHIVE = [
    "FASE1_DISCOVERY_EXECUTADA.md",
    "FASE1_DISCOVERY_RELATORIO.md",
    "FASE2_FOUNDATION_EXPANDIDA.md",
    "FASES_1_2_3_RESUMO_EXECUTIVO.md",
    "FASES_4_A_8_IMPLEMENTADAS.md",
    "FASES_9_A_12_COMPLETAS.md",
    "METODOLOGIA_REDESIGN_V4.md",
    "UI_UX_MODERNO_V3.md",
    "WIREFRAMES_FASE3.md",
]

# Manter no design-system
DESIGN_SYSTEM_KEEP = [
    "README_DESIGN_SYSTEM.md",
    "QUICK_START_DESIGN_SYSTEM.md",
    "DESIGN_SYSTEM_COMPLETO.md",
    "GUIA_VALIDACAO_DESIGN_SYSTEM.md",
    "RELATORIO_FINAL_IMPLEMENTACAO.md",
]


def move_files(files: list, src_dir: str, dest_dir: str, dry_run: bool = True):
    """Move arquivos para o diretório de destino."""
    src = ROOT / src_dir
    dest = ROOT / dest_dir
    dest.mkdir(parents=True, exist_ok=True)
    
    moved = 0
    for f in files:
        src_file = src / f
        if src_file.exists():
            dst_file = dest / f
            if dry_run:
                print(f"  [DRY-RUN] {f}")
            else:
                shutil.move(str(src_file), str(dst_file))
                print(f"  [MOVIDO] {f}")
            moved += 1
    
    return moved


def main(dry_run: bool = True):
    """Executa a consolidação."""
    print("=" * 60)
    print("CONSOLIDAÇÃO DE DOCUMENTAÇÃO")
    print("=" * 60)
    
    if dry_run:
        print("\n⚠️  MODO DRY-RUN: Nenhum arquivo será movido.")
        print("   Execute com --execute para aplicar.\n")
    
    # 1. Apresentacao
    print("\n📁 apresentacao/ -> apresentacao/archive/")
    count = move_files(APRESENTACAO_TO_ARCHIVE, "apresentacao", "apresentacao/archive", dry_run)
    print(f"   Total: {count} arquivos")
    
    # 2. Design System
    print("\n📁 docs/design-system/ -> docs/design-system/archive/")
    count = move_files(DESIGN_SYSTEM_TO_ARCHIVE, "docs/design-system", "docs/design-system/archive", dry_run)
    print(f"   Total: {count} arquivos")
    
    print("\n" + "=" * 60)
    if dry_run:
        print("Execute: python scripts/consolidate_docs.py --execute")
    else:
        print("✅ Consolidação concluída!")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    dry_run = "--execute" not in sys.argv
    main(dry_run)
