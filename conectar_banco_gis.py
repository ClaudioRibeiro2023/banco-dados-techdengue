"""
Script para conectar ao banco GIS PostgreSQL e explorar sua estrutura
"""

import psycopg2
from psycopg2 import sql
import pandas as pd
from datetime import datetime

# Configurações de conexão
DB_CONFIG = {
    'host': 'ls-564b587f07ec660b943bc46eeb4d39a79a9eec4d.cul8kgow0o6q.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'postgres',
    'user': 'claudio_aero',
    'password': '123456',
    'sslmode': 'require'
}

def conectar_banco():
    """Estabelece conexão com o banco de dados GIS"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Conexão estabelecida com sucesso!")
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return None

def listar_tabelas(conn):
    """Lista todas as tabelas no schema público"""
    query = """
        SELECT table_name, 
               pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """
    try:
        df = pd.read_sql(query, conn)
        print("\n📋 TABELAS DISPONÍVEIS NO BANCO GIS:")
        print("=" * 80)
        print(df.to_string(index=False))
        return df
    except Exception as e:
        print(f"❌ Erro ao listar tabelas: {e}")
        return None

def descrever_tabela(conn, nome_tabela):
    """Descreve a estrutura de uma tabela específica"""
    query = f"""
        SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '{nome_tabela}'
        ORDER BY ordinal_position;
    """
    try:
        df = pd.read_sql(query, conn)
        print(f"\n📊 ESTRUTURA DA TABELA: {nome_tabela}")
        print("=" * 80)
        print(df.to_string(index=False))
        return df
    except Exception as e:
        print(f"❌ Erro ao descrever tabela {nome_tabela}: {e}")
        return None

def contar_registros(conn, nome_tabela):
    """Conta o número de registros em uma tabela"""
    query = f"SELECT COUNT(*) as total FROM {nome_tabela};"
    try:
        df = pd.read_sql(query, conn)
        total = df['total'].iloc[0]
        print(f"\n📈 Total de registros em '{nome_tabela}': {total:,}")
        return total
    except Exception as e:
        print(f"❌ Erro ao contar registros de {nome_tabela}: {e}")
        return None

def amostra_dados(conn, nome_tabela, limite=5):
    """Retorna uma amostra dos dados da tabela"""
    query = f"SELECT * FROM {nome_tabela} LIMIT {limite};"
    try:
        df = pd.read_sql(query, conn)
        print(f"\n👁️ AMOSTRA DE DADOS - {nome_tabela} (primeiras {limite} linhas):")
        print("=" * 80)
        print(df.to_string())
        return df
    except Exception as e:
        print(f"❌ Erro ao buscar amostra de {nome_tabela}: {e}")
        return None

def analisar_banco_techdengue(conn):
    """Análise específica da tabela banco_techdengue"""
    print("\n" + "=" * 80)
    print("🔬 ANÁLISE DETALHADA: banco_techdengue")
    print("=" * 80)
    
    # Contar total
    contar_registros(conn, 'banco_techdengue')
    
    # Estatísticas básicas
    queries = {
        'Registros por analista': """
            SELECT analista, COUNT(*) as total
            FROM banco_techdengue
            WHERE analista IS NOT NULL
            GROUP BY analista
            ORDER BY total DESC
            LIMIT 10;
        """,
        'Registros por mês (últimos 6 meses)': """
            SELECT 
                TO_CHAR(data_criacao, 'YYYY-MM') as mes,
                COUNT(*) as total
            FROM banco_techdengue
            WHERE data_criacao IS NOT NULL
            GROUP BY mes
            ORDER BY mes DESC
            LIMIT 6;
        """,
        'Registros com geometria': """
            SELECT 
                COUNT(CASE WHEN geom IS NOT NULL THEN 1 END) as com_geometria,
                COUNT(CASE WHEN geom IS NULL THEN 1 END) as sem_geometria
            FROM banco_techdengue;
        """
    }
    
    for titulo, query in queries.items():
        try:
            print(f"\n📊 {titulo}:")
            print("-" * 80)
            df = pd.read_sql(query, conn)
            print(df.to_string(index=False))
        except Exception as e:
            print(f"❌ Erro: {e}")

def analisar_planilha_campo(conn):
    """Análise específica da tabela planilha_campo"""
    print("\n" + "=" * 80)
    print("🔬 ANÁLISE DETALHADA: planilha_campo")
    print("=" * 80)
    
    # Contar total
    contar_registros(conn, 'planilha_campo')
    
    # Estatísticas básicas
    queries = {
        'Registros por POI (top 10)': """
            SELECT poi, COUNT(*) as total
            FROM planilha_campo
            WHERE poi IS NOT NULL
            GROUP BY poi
            ORDER BY total DESC
            LIMIT 10;
        """,
        'Registros por bairro (top 10)': """
            SELECT bairro, COUNT(*) as total
            FROM planilha_campo
            WHERE bairro IS NOT NULL
            GROUP BY bairro
            ORDER BY total DESC
            LIMIT 10;
        """,
        'Uploads mais recentes': """
            SELECT 
                TO_CHAR(data_upload, 'YYYY-MM-DD') as data,
                COUNT(*) as total
            FROM planilha_campo
            WHERE data_upload IS NOT NULL
            GROUP BY data
            ORDER BY data DESC
            LIMIT 5;
        """
    }
    
    for titulo, query in queries.items():
        try:
            print(f"\n📊 {titulo}:")
            print("-" * 80)
            df = pd.read_sql(query, conn)
            print(df.to_string(index=False))
        except Exception as e:
            print(f"❌ Erro: {e}")

def main():
    print("╔═══════════════════════════════════════════════════════════════════════════════╗")
    print("║              ANÁLISE DO BANCO DE DADOS GIS - PROJETO TECHDENGUE              ║")
    print("╚═══════════════════════════════════════════════════════════════════════════════╝")
    print(f"\n⏰ Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Conectar ao banco
    conn = conectar_banco()
    if not conn:
        print("\n❌ Não foi possível conectar ao banco. Verifique as credenciais e a conexão.")
        return
    
    try:
        # Listar tabelas
        listar_tabelas(conn)
        
        # Analisar tabela banco_techdengue
        if input("\n\nDeseja analisar a tabela 'banco_techdengue'? (s/n): ").lower() == 's':
            descrever_tabela(conn, 'banco_techdengue')
            analisar_banco_techdengue(conn)
            amostra_dados(conn, 'banco_techdengue', 3)
        
        # Analisar tabela planilha_campo
        if input("\n\nDeseja analisar a tabela 'planilha_campo'? (s/n): ").lower() == 's':
            descrever_tabela(conn, 'planilha_campo')
            analisar_planilha_campo(conn)
            amostra_dados(conn, 'planilha_campo', 3)
        
    except Exception as e:
        print(f"\n❌ Erro durante a análise: {e}")
    finally:
        conn.close()
        print("\n\n✅ Conexão fechada.")
        print("="*80)
        print(f"⏰ Finalizado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)

if __name__ == "__main__":
    main()
