import sys
import json
import argparse
from pathlib import Path
from loguru import logger

# Garantir import de 'src' ao executar via script
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.validators import validate_mega_planilha
from src.ingestion import ingest_mega_planilha, FACT_TABLE
from src.database import get_database


def main():
    parser = argparse.ArgumentParser(description="Validação e Ingestão da Mega Planilha TechDengue")
    parser.add_argument("--file", dest="file", default=None, help="Caminho para o arquivo XLSX")
    parser.add_argument("--sheet", dest="sheet", default="Atividades (com sub)", help="Nome da aba da planilha")
    parser.add_argument("--validate-only", dest="validate_only", action="store_true", help="Somente valida a planilha e sai")
    args = parser.parse_args()

    logger.info("Validando mega planilha...")
    report = validate_mega_planilha(path=args.file, sheet=args.sheet)

    result = {"validation": report.model_dump()}

    if args.validate_only:
        # Relatório apenas de validação, sem banco/ingestão
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(0 if report.ok else 1)

    if not report.ok:
        logger.error("Validação falhou. Corrija os problemas antes da ingestão.")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(1)

    logger.info("Testando conexão com o banco...")
    db = get_database()
    if not db.test_connection():
        logger.error("Falha ao conectar no banco. Verifique variáveis de ambiente GIS_DB_*.")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(2)

    logger.info("Ingerindo dados validados para o banco...")
    ingest = ingest_mega_planilha(path=args.file, sheet=args.sheet)

    # Consultar informação da tabela
    table_info = db.get_table_info(FACT_TABLE)

    out = {
        "ok": ingest.get("ok", False),
        "ingested_rows": ingest.get("ingested_rows", 0),
        "table": FACT_TABLE,
        "table_info": table_info,
        "validation": report.model_dump(),
    }

    print(json.dumps(out, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
