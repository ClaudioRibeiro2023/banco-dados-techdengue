"""
Script para análise detalhada de POIs por contratante e categorias
"""
import psycopg2
import pandas as pd

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
print("ANÁLISE DETALHADA DE POIs")
print("=" * 80)
print()

try:
    conn = psycopg2.connect(**conn_params)
    cur = conn.cursor()
    
    # 1. POIs por contratante
    print("1. POIs POR CONTRATANTE")
    print("-" * 80)
    cur.execute("""
        SELECT contratante, COUNT(*) as total_pois
        FROM banco_techdengue
        WHERE contratante IS NOT NULL
        GROUP BY contratante
        ORDER BY total_pois DESC
    """)
    
    contratantes = cur.fetchall()
    print(f"Total de contratantes: {len(contratantes)}")
    print()
    print("TOP 20 CONTRATANTES:")
    for i, (contratante, total) in enumerate(contratantes[:20], 1):
        print(f"{i:2d}. {contratante:45s} {total:>8,} POIs")
    print()
    
    # Buscar CISARP especificamente
    cisarp_data = [c for c in contratantes if 'CISARP' in c[0].upper()]
    if cisarp_data:
        print("CISARP encontrado:")
        for cont, total in cisarp_data:
            print(f"  {cont}: {total:,} POIs")
    print()
    
    # 2. POIs por grupo/categoria
    print("2. POIs POR GRUPO/CATEGORIA")
    print("-" * 80)
    cur.execute("""
        SELECT grupo, COUNT(*) as total
        FROM banco_techdengue
        WHERE grupo IS NOT NULL
        GROUP BY grupo
        ORDER BY total DESC
    """)
    
    grupos = cur.fetchall()
    print(f"Total de grupos: {len(grupos)}")
    print()
    for grupo, total in grupos:
        pct = (total / 316484) * 100
        print(f"{grupo:60s} {total:>8,} ({pct:5.1f}%)")
    print()
    
    # 3. POIs por agrupamento (subcategoria)
    print("3. POIs POR AGRUPAMENTO (Top 30)")
    print("-" * 80)
    cur.execute("""
        SELECT agrupament, COUNT(*) as total
        FROM banco_techdengue
        WHERE agrupament IS NOT NULL
        GROUP BY agrupament
        ORDER BY total DESC
        LIMIT 30
    """)
    
    agrupamentos = cur.fetchall()
    for agrup, total in agrupamentos:
        pct = (total / 316484) * 100
        print(f"{agrup:60s} {total:>8,} ({pct:5.1f}%)")
    print()
    
    # 4. Distribuição temporal
    print("4. DISTRIBUIÇÃO TEMPORAL")
    print("-" * 80)
    cur.execute("""
        SELECT 
            EXTRACT(YEAR FROM data_criacao) as ano,
            COUNT(*) as total
        FROM banco_techdengue
        WHERE data_criacao IS NOT NULL
        GROUP BY ano
        ORDER BY ano
    """)
    
    temporal = cur.fetchall()
    print("POIs por ano de criação:")
    for ano, total in temporal:
        if ano:
            print(f"  {int(ano)}: {total:,} POIs")
    print()
    
    # 5. POIs por município (Top 20)
    print("5. POIs POR MUNICÍPIO (Top 20)")
    print("-" * 80)
    cur.execute("""
        SELECT nm_mun, cd_mun, COUNT(*) as total
        FROM banco_techdengue
        WHERE nm_mun IS NOT NULL
        GROUP BY nm_mun, cd_mun
        ORDER BY total DESC
        LIMIT 20
    """)
    
    municipios = cur.fetchall()
    for municipio, cod, total in municipios:
        print(f"{municipio:35s} (Cód: {cod}) {total:>8,} POIs")
    print()
    
    # 6. Tratamentos aplicados
    print("6. TRATAMENTOS APLICADOS")
    print("-" * 80)
    cur.execute("""
        SELECT tratamento, COUNT(*) as total
        FROM banco_techdengue
        WHERE tratamento IS NOT NULL
        GROUP BY tratamento
        ORDER BY total DESC
    """)
    
    tratamentos = cur.fetchall()
    print("Distribuição de tratamentos:")
    for trat, total in tratamentos:
        print(f"  Tratamento {trat}: {total:,} POIs")
    print()
    
    # 7. Resumo por região
    print("7. POIs POR REGIÃO")
    print("-" * 80)
    cur.execute("""
        SELECT nm_rgi, COUNT(*) as total
        FROM banco_techdengue
        WHERE nm_rgi IS NOT NULL
        GROUP BY nm_rgi
        ORDER BY total DESC
    """)
    
    regioes = cur.fetchall()
    print("Distribuição por Região Geográfica Intermediária:")
    for regiao, total in regioes:
        pct = (total / 316484) * 100
        print(f"{regiao:40s} {total:>8,} ({pct:5.1f}%)")
    print()
    
    # 8. Estatísticas de completude
    print("8. COMPLETUDE DOS DADOS")
    print("-" * 80)
    
    campos_importantes = [
        'contratante', 'nm_mun', 'grupo', 'agrupament', 
        'lat', 'long', 'geom', 'data_criacao', 'bairro'
    ]
    
    for campo in campos_importantes:
        cur.execute(f"""
            SELECT 
                COUNT(*) as total,
                COUNT({campo}) as preenchido,
                COUNT(*) - COUNT({campo}) as nulo
            FROM banco_techdengue
        """)
        total, preenchido, nulo = cur.fetchone()
        pct = (preenchido / total) * 100
        print(f"{campo:20s} {preenchido:>8,}/{total:,} ({pct:5.1f}%) | Nulos: {nulo:,}")
    
    print()
    print("=" * 80)
    print("✅ Análise concluída!")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
