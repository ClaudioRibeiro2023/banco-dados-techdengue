"""
Script para verificar números reais de POIs no banco PostgreSQL
"""
import psycopg2
import pandas as pd
from collections import Counter

# Conexão com o banco
conn_params = {
    'host': 'ls-564b587f07ec660b943bc46eeb4d39a79a9eec4d.cul8kgow0o6q.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'postgres',
    'user': 'claudio_aero',
    'password': '123456',
    'sslmode': 'require'
}

print("=" * 80)
print("VERIFICAÇÃO DE POIs NO BANCO POSTGRESQL")
print("=" * 80)
print()

try:
    # Conectar ao banco
    print("Conectando ao banco PostgreSQL...")
    conn = psycopg2.connect(**conn_params)
    cur = conn.cursor()
    print("✅ Conectado com sucesso!")
    print()
    
    # 1. Total de POIs
    print("1. TOTAL DE POIs")
    print("-" * 80)
    cur.execute("SELECT COUNT(*) FROM banco_techdengue")
    total_pois = cur.fetchone()[0]
    print(f"Total de registros em banco_techdengue: {total_pois:,}")
    print()
    
    # 2. POIs por contratante (se houver coluna)
    print("2. VERIFICANDO ESTRUTURA DA TABELA")
    print("-" * 80)
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'banco_techdengue'
        ORDER BY ordinal_position
    """)
    columns = cur.fetchall()
    print("Colunas disponíveis:")
    for col_name, col_type in columns:
        print(f"  - {col_name}: {col_type}")
    print()
    
    # 3. Amostra de dados
    print("3. AMOSTRA DE DADOS (10 registros)")
    print("-" * 80)
    cur.execute("""
        SELECT * FROM banco_techdengue 
        LIMIT 10
    """)
    sample = cur.fetchall()
    col_names = [desc[0] for desc in cur.description]
    print(f"Colunas: {', '.join(col_names)}")
    for row in sample[:3]:  # Mostrar apenas 3 para não poluir
        print(f"  {row}")
    print(f"  ... (+{len(sample)-3} registros)")
    print()
    
    # 4. Verificar se há coluna de categoria/tipo
    print("4. ANÁLISE POR CATEGORIAS (se disponível)")
    print("-" * 80)
    
    # Tentar identificar colunas relevantes
    relevant_cols = []
    for col_name, _ in columns:
        if any(keyword in col_name.lower() for keyword in ['categoria', 'tipo', 'class', 'descricao', 'nome']):
            relevant_cols.append(col_name)
    
    if relevant_cols:
        print(f"Colunas potencialmente categóricas encontradas: {relevant_cols}")
        print()
        
        for col in relevant_cols[:3]:  # Limitar a 3 colunas
            print(f"Distribuição por '{col}':")
            try:
                cur.execute(f"""
                    SELECT {col}, COUNT(*) as total
                    FROM banco_techdengue
                    WHERE {col} IS NOT NULL
                    GROUP BY {col}
                    ORDER BY total DESC
                    LIMIT 20
                """)
                results = cur.fetchall()
                for value, count in results:
                    print(f"  {value}: {count:,}")
            except Exception as e:
                print(f"  Erro ao analisar '{col}': {e}")
            print()
    else:
        print("Nenhuma coluna categórica óbvia encontrada.")
        print()
    
    # 5. Dados geoespaciais
    print("5. DADOS GEOESPACIAIS")
    print("-" * 80)
    cur.execute("""
        SELECT COUNT(*) 
        FROM banco_techdengue 
        WHERE geom IS NOT NULL
    """)
    pois_com_geom = cur.fetchone()[0]
    print(f"POIs com geometria (geom): {pois_com_geom:,}")
    
    cur.execute("""
        SELECT COUNT(*) 
        FROM banco_techdengue 
        WHERE lat IS NOT NULL AND long IS NOT NULL
    """)
    pois_com_coords = cur.fetchone()[0]
    print(f"POIs com coordenadas (lat/long): {pois_com_coords:,}")
    print()
    
    # 6. Verificar planilha_campo também
    print("6. TABELA PLANILHA_CAMPO")
    print("-" * 80)
    cur.execute("SELECT COUNT(*) FROM planilha_campo")
    total_planilha = cur.fetchone()[0]
    print(f"Total de registros em planilha_campo: {total_planilha:,}")
    
    # Estrutura planilha_campo
    cur.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'planilha_campo'
        ORDER BY ordinal_position
    """)
    cols_planilha = [row[0] for row in cur.fetchall()]
    print(f"Colunas: {', '.join(cols_planilha)}")
    print()
    
    # 7. Resumo final
    print("=" * 80)
    print("RESUMO")
    print("=" * 80)
    print(f"✅ Total POIs (banco_techdengue): {total_pois:,}")
    print(f"✅ Total registros (planilha_campo): {total_planilha:,}")
    print(f"✅ POIs com geometria: {pois_com_geom:,}")
    print(f"✅ POIs com coordenadas: {pois_com_coords:,}")
    print()
    print("COMPARAÇÃO COM DOCUMENTOS:")
    print(f"  - Doc CISARP menciona: 13.584 POIs")
    print(f"  - Doc MG menciona: 158.450 POIs")
    print(f"  - Banco real tem: {total_pois:,} POIs")
    print()
    
    # Fechar conexão
    cur.close()
    conn.close()
    print("✅ Verificação concluída!")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
