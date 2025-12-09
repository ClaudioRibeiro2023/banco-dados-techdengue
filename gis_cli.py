"""
CLI para Sistema de Integração GIS
Interface de linha de comando para gerenciar dados do servidor
"""
import sys
import logging
from pathlib import Path
from datetime import datetime
import argparse

# Adicionar src ao path
sys.path.insert(0, str(Path(__file__).parent))

from src.config import Config
from src.database import get_database, DatabaseManager
from src.repository import TechDengueRepository
from src.sync import DataSynchronizer
from src.ingestion import ingest_mega_planilha

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(Config.PATHS.logs_dir / 'gis_cli.log')
    ]
)

logger = logging.getLogger(__name__)


def print_header(title: str):
    """Imprime cabeçalho formatado"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")


def cmd_test_connection(args):
    """Testa conexão com banco de dados"""
    print_header("TESTE DE CONEXÃO")
    
    db = get_database()
    
    if db.test_connection():
        print("✅ Conexão bem-sucedida!")
        
        # Mostrar informações
        print(f"\nHost: {Config.GIS_DB.host}")
        print(f"Database: {Config.GIS_DB.database}")
        print(f"Usuário: {Config.GIS_DB.username}")
        
        return 0
    else:
        print("❌ Falha na conexão!")
        return 1


def cmd_table_info(args):
    """Mostra informações sobre uma tabela"""
    print_header(f"INFORMAÇÕES DA TABELA: {args.table}")
    
    repo = TechDengueRepository()
    
    try:
        info = repo.get_table_info(args.table)
        
        print(f"Schema: {info['schema']}")
        print(f"Tabela: {info['table_name']}")
        print(f"Registros: {info['row_count']:,}")
        print(f"\nColunas ({len(info['columns'])}):")
        
        for col in info['columns']:
            nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
            print(f"  - {col['column_name']}: {col['data_type']} {nullable}")
        
        return 0
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return 1


def cmd_stats(args):
    """Mostra estatísticas das tabelas"""
    print_header("ESTATÍSTICAS DO SERVIDOR")
    
    repo = TechDengueRepository()
    
    # banco_techdengue
    print("📊 BANCO_TECHDENGUE")
    print("-" * 80)
    try:
        stats = repo.get_banco_techdengue_stats()
        for key, value in stats.items():
            print(f"  {key}: {value}")
    except Exception as e:
        print(f"  ❌ Erro: {e}")
    
    print()
    
    # planilha_campo
    print("📊 PLANILHA_CAMPO (POIs)")
    print("-" * 80)
    try:
        stats = repo.get_planilha_campo_stats()
        for key, value in stats.items():
            print(f"  {key}: {value}")
    except Exception as e:
        print(f"  ❌ Erro: {e}")
    
    return 0


def cmd_sync(args):
    """Sincroniza dados do servidor"""
    print_header("SINCRONIZAÇÃO DE DADOS")
    
    sync = DataSynchronizer()
    
    if args.table:
        # Sincronizar tabela específica
        print(f"Sincronizando tabela: {args.table}")
        
        if args.table == 'banco_techdengue':
            result = sync.sync_banco_techdengue(force=args.force)
        elif args.table == 'planilha_campo':
            result = sync.sync_planilha_campo(force=args.force)
        else:
            print(f"❌ Tabela desconhecida: {args.table}")
            return 1
        
        print(f"\n✅ Status: {result['status']}")
        print(f"   Registros: {result.get('row_count', 'N/A'):,}")
        
    else:
        # Sincronizar todas
        print("Sincronizando todas as tabelas...")
        results = sync.sync_all(force=args.force)
        
        print("\n📊 RESULTADOS:")
        for table, result in results.items():
            status_icon = "✅" if result['status'] != 'error' else "❌"
            print(f"\n{status_icon} {table}:")
            print(f"   Status: {result['status']}")
            if 'row_count' in result:
                print(f"   Registros: {result['row_count']:,}")
            if 'error' in result:
                print(f"   Erro: {result['error']}")
    
    return 0


def cmd_sync_status(args):
    """Mostra status da sincronização"""
    print_header("STATUS DA SINCRONIZAÇÃO")
    
    sync = DataSynchronizer()
    status = sync.get_sync_status()
    
    if not status:
        print("⚠️  Nenhuma sincronização encontrada.")
        print("   Execute: python gis_cli.py sync")
        return 0
    
    for table, info in status.items():
        fresh_icon = "🟢" if info['is_fresh'] else "🟡"
        print(f"\n{fresh_icon} {table}:")
        print(f"   Última sincronização: {info['last_sync']}")
        print(f"   Idade: {info['age_human']}")
        print(f"   Registros: {info['row_count']:,}")
        print(f"   Hash MD5: {info['hash_md5']}")
        print(f"   Status: {'FRESCO' if info['is_fresh'] else 'DESATUALIZADO'}")
    
    return 0


def cmd_query(args):
    """Executa query personalizada"""
    print_header("EXECUTAR QUERY")
    
    db = get_database()
    
    print(f"Query: {args.query}\n")
    
    try:
        df = db.query_to_dataframe(args.query)
        
        print(f"✅ Resultado: {len(df):,} linhas × {len(df.columns)} colunas\n")
        
        if args.limit:
            print(f"Primeiras {args.limit} linhas:")
            print(df.head(args.limit))
        else:
            print(df)
        
        if args.output:
            output_path = Path(args.output)
            df.to_csv(output_path, index=False)
            print(f"\n✅ Salvo em: {output_path}")
        
        return 0
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return 1


def cmd_export(args):
    """Exporta dados para arquivo"""
    print_header(f"EXPORTAR: {args.table}")
    
    sync = DataSynchronizer()
    
    # Garantir que dados estão sincronizados
    if args.table == 'banco_techdengue':
        sync.sync_banco_techdengue()
    elif args.table == 'planilha_campo':
        sync.sync_planilha_campo()
    
    # Carregar do cache
    cache_file = Config.PATHS.cache_dir / f"{args.table}.parquet"
    
    if not cache_file.exists():
        print(f"❌ Cache não encontrado: {cache_file}")
        return 1
    
    import pandas as pd
    df = pd.read_parquet(cache_file)
    
    # Exportar
    output_path = Path(args.output)
    
    if output_path.suffix == '.csv':
        df.to_csv(output_path, index=False)
    elif output_path.suffix == '.xlsx':
        df.to_excel(output_path, index=False)
    elif output_path.suffix == '.parquet':
        df.to_parquet(output_path, index=False)
    else:
        print(f"❌ Formato não suportado: {output_path.suffix}")
        return 1
    
    print(f"✅ Exportado: {len(df):,} linhas → {output_path}")
    return 0


def cmd_warehouse_ingest(args):
    """Ingesta mega planilha para o Warehouse (escrita por padrão)."""
    print_header("WAREHOUSE: INGESTÃO FATO ATIVIDADES")
    try:
        result = ingest_mega_planilha()
        print("✅ Ingestão concluída")
        print(f"   Tabela: {result.get('table')}")
        print(f"   Linhas ingeridas: {result.get('ingested_rows')}")
        return 0
    except Exception as e:
        print(f"❌ Erro na ingestão: {e}")
        return 1


def cmd_warehouse_validate(args):
    """Valida a existência e contagem da tabela fato no Warehouse."""
    print_header("WAREHOUSE: VALIDAÇÃO DA TABELA")
    try:
        db = DatabaseManager(db_config=Config.WAREHOUSE_DB)
        count = db.execute_query("SELECT COUNT(*) FROM fato_atividades_techdengue")
        print(f"✅ Registros na tabela fato_atividades_techdengue: {count}")
        if args.sample:
            import pandas as pd
            df = db.query_to_dataframe("SELECT * FROM fato_atividades_techdengue LIMIT 5")
            print("\nAmostra (5 linhas):")
            print(df)
        return 0
    except Exception as e:
        print(f"❌ Erro na validação: {e}")
        return 1


def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description='CLI para Sistema de Integração GIS - TechDengue',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponíveis')
    
    # test-connection
    parser_test = subparsers.add_parser('test-connection', help='Testa conexão com banco')
    parser_test.set_defaults(func=cmd_test_connection)
    
    # table-info
    parser_info = subparsers.add_parser('table-info', help='Informações sobre tabela')
    parser_info.add_argument('table', help='Nome da tabela')
    parser_info.set_defaults(func=cmd_table_info)
    
    # stats
    parser_stats = subparsers.add_parser('stats', help='Estatísticas das tabelas')
    parser_stats.set_defaults(func=cmd_stats)
    
    # sync
    parser_sync = subparsers.add_parser('sync', help='Sincroniza dados do servidor')
    parser_sync.add_argument('--table', help='Tabela específica (opcional)')
    parser_sync.add_argument('--force', action='store_true', help='Força sincronização')
    parser_sync.set_defaults(func=cmd_sync)
    
    # sync-status
    parser_status = subparsers.add_parser('sync-status', help='Status da sincronização')
    parser_status.set_defaults(func=cmd_sync_status)
    
    # query
    parser_query = subparsers.add_parser('query', help='Executa query personalizada')
    parser_query.add_argument('query', help='Query SQL')
    parser_query.add_argument('--limit', type=int, help='Limitar linhas exibidas')
    parser_query.add_argument('--output', help='Salvar resultado em arquivo CSV')
    parser_query.set_defaults(func=cmd_query)
    
    # export
    parser_export = subparsers.add_parser('export', help='Exporta dados para arquivo')
    parser_export.add_argument('table', help='Nome da tabela')
    parser_export.add_argument('output', help='Arquivo de saída (.csv, .xlsx, .parquet)')
    parser_export.set_defaults(func=cmd_export)

    # warehouse-ingest
    parser_wh_ingest = subparsers.add_parser('warehouse-ingest', help='Ingesta mega planilha no Warehouse')
    parser_wh_ingest.set_defaults(func=cmd_warehouse_ingest)

    # warehouse-validate
    parser_wh_validate = subparsers.add_parser('warehouse-validate', help='Valida a tabela fato no Warehouse')
    parser_wh_validate.add_argument('--sample', action='store_true', help='Exibe amostra de 5 linhas')
    parser_wh_validate.set_defaults(func=cmd_warehouse_validate)
    
    # Parse argumentos
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 0
    
    # Executar comando
    try:
        return args.func(args)
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada pelo usuário")
        return 130
    except Exception as e:
        logger.exception("Erro não tratado")
        print(f"\n❌ Erro: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
