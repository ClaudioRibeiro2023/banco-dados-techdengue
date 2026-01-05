"""Análise de qualidade dos dados - Verificação de anos."""
import pandas as pd
from pathlib import Path

print("=" * 60)
print("ANÁLISE DE QUALIDADE DOS DADOS - TechDengue")
print("=" * 60)

# Carregar dados
data_path = Path("dados_integrados/fato_atividades_techdengue.parquet")
if data_path.exists():
    df = pd.read_parquet(data_path)
    print(f"\n📊 Arquivo: {data_path}")
    print(f"📌 Total de registros: {len(df):,}")
    print(f"📌 Colunas: {len(df.columns)}")
    
    print("\n" + "=" * 60)
    print("COLUNAS DISPONÍVEIS")
    print("=" * 60)
    for i, col in enumerate(df.columns):
        print(f"  {i+1:2}. {col}")
    
    # Identificar colunas de data/ano
    year_cols = [c for c in df.columns if any(x in c.lower() for x in ['ano', 'year', 'data', 'date'])]
    
    print("\n" + "=" * 60)
    print("ANÁLISE DE COLUNAS DE DATA/ANO")
    print("=" * 60)
    
    for col in year_cols:
        print(f"\n📅 Coluna: {col}")
        print(f"   Tipo: {df[col].dtype}")
        
        if df[col].dtype == 'object' or 'datetime' in str(df[col].dtype):
            try:
                # Tentar extrair anos
                if 'datetime' in str(df[col].dtype):
                    years = df[col].dt.year.dropna().unique()
                else:
                    # Tentar converter para datetime
                    dates = pd.to_datetime(df[col], errors='coerce')
                    years = dates.dt.year.dropna().unique()
                years = sorted([int(y) for y in years if pd.notna(y)])
                print(f"   Anos encontrados: {years}")
                
                # Verificar anos problemáticos (antes de 2023)
                problematic = [y for y in years if y < 2023]
                if problematic:
                    print(f"   ⚠️  ANOS ANTERIORES A 2023: {problematic}")
                    # Contar registros por ano
                    if 'datetime' in str(df[col].dtype):
                        year_counts = df[col].dt.year.value_counts().sort_index()
                    else:
                        dates = pd.to_datetime(df[col], errors='coerce')
                        year_counts = dates.dt.year.value_counts().sort_index()
                    print(f"   📊 Distribuição por ano:")
                    for y, count in year_counts.items():
                        if pd.notna(y):
                            flag = " ⚠️ SUSPEITO" if y < 2023 else ""
                            print(f"      {int(y)}: {count:,} registros{flag}")
            except Exception as e:
                print(f"   Erro ao processar: {e}")
        else:
            # Coluna numérica (pode ser ano diretamente)
            values = df[col].dropna().unique()
            if len(values) < 50:  # Provavelmente são anos
                years = sorted([int(v) for v in values if 1900 < v < 2100])
                if years:
                    print(f"   Valores (anos?): {years}")
                    problematic = [y for y in years if y < 2023]
                    if problematic:
                        print(f"   ⚠️  ANOS ANTERIORES A 2023: {problematic}")
    
    print("\n" + "=" * 60)
    print("RESUMO DE PROBLEMAS DE QUALIDADE")
    print("=" * 60)
    
    # Verificar DATA_MAP especificamente
    if 'DATA_MAP' in df.columns:
        dates = pd.to_datetime(df['DATA_MAP'], errors='coerce')
        years = dates.dt.year.value_counts().sort_index()
        
        total = len(df)
        problematic_count = 0
        for y, count in years.items():
            if pd.notna(y) and y < 2023:
                problematic_count += count
        
        if problematic_count > 0:
            pct = (problematic_count / total) * 100
            print(f"\n⚠️  PROBLEMA IDENTIFICADO:")
            print(f"   {problematic_count:,} registros ({pct:.1f}%) com data anterior a 2023")
            print(f"   Isso contradiz a informação de que o projeto existe apenas após 2023")
            print(f"\n💡 POSSÍVEIS CAUSAS:")
            print("   1. Dados de teste/exemplo incluídos na base")
            print("   2. Migração de dados de projetos anteriores")
            print("   3. Erros de digitação/importação de datas")
            print("   4. Uso de datas fictícias para treinamento")
            print(f"\n🔧 RECOMENDAÇÕES:")
            print("   1. Criar validador de datas no pipeline de ingestão")
            print("   2. Adicionar constraint de data >= 2023-01-01")
            print("   3. Revisar e limpar registros com datas incorretas")
            print("   4. Documentar origem dos dados históricos (se legítimos)")
else:
    print(f"Arquivo não encontrado: {data_path}")

# Verificar também a mega tabela
mega_path = Path("data_lake/gold/mega_tabela_analitica.parquet")
if mega_path.exists():
    print("\n" + "=" * 60)
    print("ANÁLISE: mega_tabela_analitica.parquet")
    print("=" * 60)
    df2 = pd.read_parquet(mega_path)
    print(f"Total de registros: {len(df2):,}")
    
    # Verificar colunas de ano
    for col in df2.columns:
        if 'ano' in col.lower() or 'year' in col.lower():
            print(f"\n{col}: {sorted(df2[col].dropna().unique())}")

cache_banco_path = Path("cache/banco_techdengue.parquet")
if cache_banco_path.exists():
    print("\n" + "=" * 60)
    print("ANÁLISE: cache/banco_techdengue.parquet")
    print("=" * 60)
    df3 = pd.read_parquet(cache_banco_path)
    print(f"Total de registros: {len(df3):,}")
    if "data_criacao" in df3.columns:
        pct = float(df3["data_criacao"].isna().mean() * 100)
        print(f"data_criacao nulos: {pct:.1f}%")
        if pct >= 99.9:
            print("⚠️  data_criacao está totalmente nulo no cache")

cache_pois_path = Path("cache/planilha_campo.parquet")
if cache_pois_path.exists():
    print("\n" + "=" * 60)
    print("ANÁLISE: cache/planilha_campo.parquet")
    print("=" * 60)
    df4 = pd.read_parquet(cache_pois_path)
    print(f"Total de registros: {len(df4):,}")
