"""
Diagnóstico Completo da MEGA TABELA
Identifica campos em branco e problemas de dados
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).parent
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"

print("="*80)
print("🔍 DIAGNÓSTICO COMPLETO DA MEGA TABELA")
print("="*80)

# ============================================================================
# 1. CARREGAR MEGA TABELA
# ============================================================================

print("\n1️⃣ Carregando MEGA TABELA...")

mega_tabela_path = GOLD_DIR / "mega_tabela_analitica.parquet"
if not mega_tabela_path.exists():
    print("❌ MEGA TABELA não encontrada!")
    exit(1)

df = pd.read_parquet(mega_tabela_path)
print(f"✅ Carregada: {len(df):,} registros, {len(df.columns)} colunas")

# ============================================================================
# 2. ANÁLISE DE COMPLETUDE POR COLUNA
# ============================================================================

print("\n2️⃣ Análise de completude por coluna:")
print("-" * 80)

completude = []

for col in df.columns:
    total = len(df)
    nulos = df[col].isnull().sum()
    vazios = 0
    zeros = 0
    
    # Verificar strings vazias
    if df[col].dtype == 'object':
        vazios = (df[col] == '').sum()
    
    # Verificar zeros (que podem ser problemáticos)
    if df[col].dtype in ['int64', 'float64']:
        zeros = (df[col] == 0).sum()
    
    preenchidos = total - nulos - vazios
    pct_preenchido = (preenchidos / total) * 100
    
    completude.append({
        'coluna': col,
        'total': total,
        'nulos': nulos,
        'vazios': vazios,
        'zeros': zeros,
        'preenchidos': preenchidos,
        'pct_preenchido': pct_preenchido,
        'tipo': str(df[col].dtype)
    })

df_completude = pd.DataFrame(completude)
df_completude = df_completude.sort_values('pct_preenchido')

# Mostrar colunas com problemas (< 50% preenchido)
print("\n⚠️  COLUNAS COM PROBLEMAS (< 50% preenchidas):")
problemas = df_completude[df_completude['pct_preenchido'] < 50]

if len(problemas) > 0:
    for _, row in problemas.iterrows():
        print(f"\n  📊 {row['coluna']}")
        print(f"     Tipo: {row['tipo']}")
        print(f"     Preenchidos: {row['preenchidos']:,} ({row['pct_preenchido']:.1f}%)")
        print(f"     Nulos: {row['nulos']:,}")
        print(f"     Vazios: {row['vazios']:,}")
        print(f"     Zeros: {row['zeros']:,}")
else:
    print("  ✅ Nenhuma coluna com < 50% de preenchimento")

# Mostrar colunas com 50-90% preenchidas
print("\n⚠️  COLUNAS COM PREENCHIMENTO MÉDIO (50-90%):")
medio = df_completude[(df_completude['pct_preenchido'] >= 50) & 
                      (df_completude['pct_preenchido'] < 90)]

if len(medio) > 0:
    for _, row in medio.iterrows():
        print(f"  • {row['coluna']}: {row['pct_preenchido']:.1f}%")
else:
    print("  ✅ Nenhuma coluna nesta faixa")

# Mostrar colunas bem preenchidas
print("\n✅ COLUNAS BEM PREENCHIDAS (>= 90%):")
boas = df_completude[df_completude['pct_preenchido'] >= 90]
print(f"  Total: {len(boas)} colunas")

# ============================================================================
# 3. ANÁLISE DE REGISTROS
# ============================================================================

print("\n3️⃣ Análise de registros:")
print("-" * 80)

# Registros com atividades
com_atividades = df[df['total_atividades'] > 0]
sem_atividades = df[df['total_atividades'] == 0]

print(f"\n📊 Distribuição de registros:")
print(f"  • Com atividades: {len(com_atividades):,} ({len(com_atividades)/len(df)*100:.1f}%)")
print(f"  • Sem atividades: {len(sem_atividades):,} ({len(sem_atividades)/len(df)*100:.1f}%)")

# Registros por ano
print(f"\n📅 Distribuição por ano:")
for ano in sorted(df['ano'].unique()):
    total_ano = len(df[df['ano'] == ano])
    com_ativ_ano = len(df[(df['ano'] == ano) & (df['total_atividades'] > 0)])
    print(f"  • {ano}: {total_ano:,} registros ({com_ativ_ano:,} com atividades)")

# ============================================================================
# 4. ANÁLISE DE COLUNAS CRÍTICAS
# ============================================================================

print("\n4️⃣ Análise de colunas críticas:")
print("-" * 80)

colunas_criticas = [
    'codigo_ibge', 'municipio', 'ano', 'populacao', 'area_ha',
    'total_atividades', 'total_pois_excel', 'total_devolutivas',
    'total_hectares_mapeados'
]

for col in colunas_criticas:
    if col in df.columns:
        nulos = df[col].isnull().sum()
        if df[col].dtype in ['int64', 'float64']:
            zeros = (df[col] == 0).sum()
            media = df[col].mean()
            print(f"\n  {col}:")
            print(f"    Nulos: {nulos:,}")
            print(f"    Zeros: {zeros:,}")
            print(f"    Média: {media:,.2f}")
        else:
            print(f"\n  {col}:")
            print(f"    Nulos: {nulos:,}")

# ============================================================================
# 5. VERIFICAR DADOS FONTE (SILVER)
# ============================================================================

print("\n5️⃣ Verificando dados fonte (SILVER):")
print("-" * 80)

# Atividades
atividades_path = SILVER_DIR / "fato_atividades.parquet"
if atividades_path.exists():
    df_ativ = pd.read_parquet(atividades_path)
    print(f"\n📊 fato_atividades:")
    print(f"  • Total de registros: {len(df_ativ):,}")
    print(f"  • Municípios únicos: {df_ativ['CODIGO_IBGE'].nunique()}")
    print(f"  • Total de POIs: {df_ativ['POIS'].sum():,}")
    print(f"  • Total de hectares: {df_ativ['HECTARES_MAPEADOS'].sum():,.2f}")
    
    # Verificar se há anos
    if 'ANO' in df_ativ.columns:
        print(f"  • Anos: {sorted(df_ativ['ANO'].unique())}")
    else:
        print(f"  ⚠️  Coluna ANO não encontrada!")

# Municípios
municipios_path = SILVER_DIR / "dim_municipios.parquet"
if municipios_path.exists():
    df_mun = pd.read_parquet(municipios_path)
    print(f"\n🏙️  dim_municipios:")
    print(f"  • Total de municípios: {len(df_mun):,}")
    print(f"  • Com população: {df_mun['populacao'].notna().sum():,}")
    print(f"  • Com área: {df_mun['area_ha'].notna().sum():,}")

# ============================================================================
# 6. SALVAR RELATÓRIO
# ============================================================================

print("\n6️⃣ Salvando relatório...")

# Salvar completude
completude_path = BASE_DIR / "data_lake" / "metadata" / "diagnostico_completude.csv"
df_completude.to_csv(completude_path, index=False)
print(f"✅ Relatório de completude salvo: {completude_path}")

# ============================================================================
# 7. RECOMENDAÇÕES
# ============================================================================

print("\n" + "="*80)
print("💡 RECOMENDAÇÕES")
print("="*80)

problemas_criticos = df_completude[df_completude['pct_preenchido'] < 50]

if len(problemas_criticos) > 0:
    print("\n⚠️  PROBLEMAS CRÍTICOS ENCONTRADOS:")
    print(f"  • {len(problemas_criticos)} colunas com < 50% de preenchimento")
    print("\n  Ações recomendadas:")
    print("  1. Verificar se as colunas são realmente necessárias")
    print("  2. Investigar por que os dados estão vazios")
    print("  3. Corrigir o pipeline de agregação")
    print("  4. Considerar remover colunas não utilizadas")
else:
    print("\n✅ Nenhum problema crítico encontrado!")

print("\n" + "="*80)
