"""
Script para verificar total de hectares mapeados
"""
import psycopg2

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
print("ANÁLISE DE HECTARES MAPEADOS")
print("=" * 80)
print()

try:
    conn = psycopg2.connect(**conn_params)
    cur = conn.cursor()
    
    # 1. Verificar se existe coluna de área/hectares
    print("1. VERIFICANDO COLUNAS RELACIONADAS A ÁREA")
    print("-" * 80)
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'banco_techdengue'
        AND (column_name ILIKE '%area%' OR column_name ILIKE '%hectare%')
        ORDER BY ordinal_position
    """)
    
    cols_area = cur.fetchall()
    if cols_area:
        print("Colunas relacionadas a área encontradas:")
        for col, tipo in cols_area:
            print(f"  - {col}: {tipo}")
    else:
        print("Nenhuma coluna específica de hectares encontrada.")
    print()
    
    # 2. Verificar coluna area_km2
    if cols_area:
        print("2. ANÁLISE DA COLUNA area_km2")
        print("-" * 80)
        
        # Total de área
        cur.execute("""
            SELECT 
                COUNT(DISTINCT cd_mun) as total_municipios,
                COUNT(*) as total_pois,
                SUM(DISTINCT area_km2) as area_total_km2,
                AVG(area_km2) as area_media_km2,
                MIN(area_km2) as area_min_km2,
                MAX(area_km2) as area_max_km2
            FROM banco_techdengue
            WHERE area_km2 IS NOT NULL
        """)
        
        result = cur.fetchone()
        municipios, pois, area_total, area_media, area_min, area_max = result
        
        print(f"Municípios únicos: {municipios:,}")
        print(f"Total de POIs: {pois:,}")
        print(f"Área total (km²): {float(area_total):,.2f} km²")
        print(f"Área total (hectares): {float(area_total) * 100:,.2f} ha")
        print(f"Área média por município (km²): {float(area_media):,.2f} km²")
        print(f"Área mínima: {float(area_min):,.2f} km²")
        print(f"Área máxima: {float(area_max):,.2f} km²")
        print()
        
        # 3. Área por contratante
        print("3. HECTARES POR CONTRATANTE")
        print("-" * 80)
        cur.execute("""
            SELECT 
                contratante,
                COUNT(DISTINCT cd_mun) as municipios,
                COUNT(*) as pois,
                SUM(DISTINCT area_km2) as area_km2
            FROM banco_techdengue
            WHERE contratante IS NOT NULL AND area_km2 IS NOT NULL
            GROUP BY contratante
            ORDER BY area_km2 DESC
        """)
        
        contratantes = cur.fetchall()
        print(f"{'Contratante':45s} {'Mun':>5s} {'POIs':>8s} {'km²':>12s} {'Hectares':>12s}")
        print("-" * 90)
        
        total_area_contratantes = 0
        for cont, mun, pois, area in contratantes:
            area_float = float(area) if area else 0
            hectares = area_float * 100
            total_area_contratantes += area_float
            print(f"{cont:45s} {mun:5,d} {pois:8,d} {area_float:12,.2f} {hectares:12,.0f}")
        
        print("-" * 90)
        print(f"{'TOTAL':45s} {'':<5s} {'':<8s} {total_area_contratantes:12,.2f} {total_area_contratantes * 100:12,.0f}")
        print()
        
        # 4. Top 20 municípios por área
        print("4. TOP 20 MUNICÍPIOS POR ÁREA")
        print("-" * 80)
        cur.execute("""
            SELECT 
                nm_mun,
                cd_mun,
                COUNT(*) as pois,
                area_km2
            FROM banco_techdengue
            WHERE nm_mun IS NOT NULL AND area_km2 IS NOT NULL
            GROUP BY nm_mun, cd_mun, area_km2
            ORDER BY area_km2 DESC
            LIMIT 20
        """)
        
        municipios_top = cur.fetchall()
        print(f"{'Município':35s} {'Cód IBGE':>10s} {'POIs':>8s} {'km²':>12s} {'Hectares':>12s}")
        print("-" * 85)
        for mun, cod, pois, area in municipios_top:
            area_float = float(area) if area else 0
            hectares = area_float * 100
            print(f"{mun:35s} {cod:10,d} {pois:8,d} {area_float:12,.2f} {hectares:12,.0f}")
        print()
    
    # 5. Análise geométrica (se possível calcular área da geometria)
    print("5. ANÁLISE GEOMÉTRICA")
    print("-" * 80)
    print("Verificando se é possível calcular área a partir da geometria...")
    
    try:
        cur.execute("""
            SELECT COUNT(*) 
            FROM banco_techdengue 
            WHERE geom IS NOT NULL
        """)
        pois_com_geom = cur.fetchone()[0]
        print(f"POIs com geometria: {pois_com_geom:,}")
        print()
        print("Nota: A coluna 'geom' contém pontos (POIs), não polígonos de área.")
        print("      A área vem da coluna 'area_km2' (área do município).")
    except Exception as e:
        print(f"Erro ao verificar geometria: {e}")
    print()
    
    # 6. Resumo final
    print("=" * 80)
    print("RESUMO FINAL - HECTARES MAPEADOS")
    print("=" * 80)
    
    if cols_area:
        cur.execute("""
            SELECT 
                COUNT(DISTINCT cd_mun) as municipios,
                SUM(DISTINCT area_km2) as area_total_km2
            FROM banco_techdengue
            WHERE area_km2 IS NOT NULL
        """)
        
        municipios_total, area_km2 = cur.fetchone()
        hectares_total = float(area_km2) * 100
        
        print(f"Total de Municípios:     {municipios_total:,}")
        print(f"Área Total (km²):        {float(area_km2):,.2f} km²")
        print(f"Área Total (hectares):   {hectares_total:,.0f} ha")
        print()
        print("COMPARAÇÃO COM DOCUMENTOS:")
        print(f"  - Doc MG menciona:     110.200 hectares")
        print(f"  - Banco real tem:      {hectares_total:,.0f} hectares")
        print(f"  - Diferença:           {hectares_total - 110200:+,.0f} hectares")
        print()
        print("NOTA IMPORTANTE:")
        print("A coluna 'area_km2' representa a ÁREA DO MUNICÍPIO, não a área")
        print("efetivamente mapeada/vistoriada. Essa é a área territorial total")
        print("dos municípios que participam do projeto.")
    
    cur.close()
    conn.close()
    print()
    print("Analise concluida!")
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
