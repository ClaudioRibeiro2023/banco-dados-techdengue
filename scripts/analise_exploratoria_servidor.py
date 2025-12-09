"""
Análise Exploratória Completa - Dados do Servidor GIS
310.838 registros de banco_techdengue
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configurar estilo
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

print("="*80)
print("🔍 ANÁLISE EXPLORATÓRIA - DADOS DO SERVIDOR GIS")
print("="*80)

# Carregar dados
print("\n📊 Carregando dados do servidor...")
df = pd.read_parquet('cache/banco_techdengue.parquet')

print(f"✓ {len(df):,} registros carregados")
print(f"✓ {len(df.columns)} colunas")

# ============================================================================
# 1. VISÃO GERAL DOS DADOS
# ============================================================================
print("\n" + "="*80)
print("📋 1. VISÃO GERAL DOS DADOS")
print("="*80)

print(f"\nShape: {df.shape}")
print(f"\nColunas:")
for col in df.columns:
    print(f"  - {col}: {df[col].dtype}")

print(f"\nMemória utilizada: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

# Valores nulos
print(f"\nValores nulos:")
nulos = df.isnull().sum()
for col, count in nulos[nulos > 0].items():
    pct = count / len(df) * 100
    print(f"  - {col}: {count:,} ({pct:.1f}%)")

# ============================================================================
# 2. ANÁLISE POR ANALISTA
# ============================================================================
print("\n" + "="*80)
print("📊 2. ANÁLISE POR ANALISTA")
print("="*80)

analistas = df['analista'].value_counts()
print(f"\nTotal de analistas: {df['analista'].nunique()}")
print(f"\nTop 10 analistas:")
for i, (analista, count) in enumerate(analistas.head(10).items(), 1):
    pct = count / len(df) * 100
    print(f"  {i:2d}. {analista}: {count:,} registros ({pct:.1f}%)")

# Gráfico
plt.figure(figsize=(12, 6))
analistas.head(10).plot(kind='barh')
plt.title('Top 10 Analistas por Número de Registros', fontsize=14, fontweight='bold')
plt.xlabel('Número de Registros')
plt.ylabel('Analista')
plt.tight_layout()
plt.savefig('analise_por_analista.png', dpi=300, bbox_inches='tight')
print("\n✓ Gráfico salvo: analise_por_analista.png")
plt.close()

# ============================================================================
# 3. ANÁLISE GEOGRÁFICA
# ============================================================================
print("\n" + "="*80)
print("🗺️  3. ANÁLISE GEOGRÁFICA")
print("="*80)

# Converter coordenadas para numérico
df['lat'] = pd.to_numeric(df['lat'], errors='coerce')
df['long'] = pd.to_numeric(df['long'], errors='coerce')

# Estatísticas de coordenadas
print(f"\nCoordenadas válidas: {((df['lat'].notna()) & (df['long'].notna())).sum():,}")

if df['lat'].notna().any():
    print(f"\nLatitude:")
    print(f"  Mínimo: {df['lat'].min():.6f}")
    print(f"  Máximo: {df['lat'].max():.6f}")
    print(f"  Média: {df['lat'].mean():.6f}")
    
    print(f"\nLongitude:")
    print(f"  Mínimo: {df['long'].min():.6f}")
    print(f"  Máximo: {df['long'].max():.6f}")
    print(f"  Média: {df['long'].mean():.6f}")
    
    # Identificar região
    lat_media = df['lat'].mean()
    long_media = df['long'].mean()
    
    print(f"\n📍 Centro geográfico aproximado:")
    print(f"   Latitude: {lat_media:.6f}")
    print(f"   Longitude: {long_media:.6f}")
    
    # Mapa de dispersão
    plt.figure(figsize=(12, 8))
    
    # Amostra para visualização (10.000 pontos)
    sample_size = min(10000, len(df))
    df_sample = df.sample(n=sample_size, random_state=42)
    
    plt.scatter(df_sample['long'], df_sample['lat'], 
                alpha=0.3, s=1, c='blue')
    plt.title(f'Distribuição Geográfica dos Pontos (amostra de {sample_size:,})', 
              fontsize=14, fontweight='bold')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('distribuicao_geografica.png', dpi=300, bbox_inches='tight')
    print("\n✓ Gráfico salvo: distribuicao_geografica.png")
    plt.close()
    
    # Densidade por região (grid)
    print("\n📊 Análise de densidade espacial...")
    
    # Criar grid
    lat_bins = 20
    long_bins = 20
    
    df_coords = df[['lat', 'long']].dropna()
    
    plt.figure(figsize=(12, 8))
    plt.hist2d(df_coords['long'], df_coords['lat'], 
               bins=[long_bins, lat_bins], 
               cmap='YlOrRd')
    plt.colorbar(label='Número de Pontos')
    plt.title('Mapa de Calor - Densidade de Pontos', fontsize=14, fontweight='bold')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.tight_layout()
    plt.savefig('mapa_calor_densidade.png', dpi=300, bbox_inches='tight')
    print("✓ Gráfico salvo: mapa_calor_densidade.png")
    plt.close()

# ============================================================================
# 4. ANÁLISE POR ID_SISTEMA
# ============================================================================
print("\n" + "="*80)
print("🔢 4. ANÁLISE POR ID_SISTEMA")
print("="*80)

if 'id_sistema' in df.columns:
    sistemas = df['id_sistema'].value_counts()
    print(f"\nTotal de sistemas: {df['id_sistema'].nunique()}")
    print(f"\nTop 10 sistemas:")
    for i, (sistema, count) in enumerate(sistemas.head(10).items(), 1):
        pct = count / len(df) * 100
        print(f"  {i:2d}. Sistema {sistema}: {count:,} registros ({pct:.1f}%)")
    
    # Gráfico
    plt.figure(figsize=(12, 6))
    sistemas.head(15).plot(kind='bar')
    plt.title('Top 15 Sistemas por Número de Registros', fontsize=14, fontweight='bold')
    plt.xlabel('ID Sistema')
    plt.ylabel('Número de Registros')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('analise_por_sistema.png', dpi=300, bbox_inches='tight')
    print("\n✓ Gráfico salvo: analise_por_sistema.png")
    plt.close()

# ============================================================================
# 5. ANÁLISE DE NOMES/IDENTIFICADORES
# ============================================================================
print("\n" + "="*80)
print("🏷️  5. ANÁLISE DE NOMES/IDENTIFICADORES")
print("="*80)

if 'nome' in df.columns:
    print(f"\nTotal de nomes únicos: {df['nome'].nunique():,}")
    
    # Padrões de nomenclatura
    print(f"\nExemplos de nomes:")
    for nome in df['nome'].dropna().head(20):
        print(f"  - {nome}")
    
    # Análise de prefixos
    df['prefixo'] = df['nome'].astype(str).str.extract(r'^([A-Z]+)', expand=False)
    prefixos = df['prefixo'].value_counts()
    
    print(f"\nTop 10 prefixos mais comuns:")
    for i, (prefixo, count) in enumerate(prefixos.head(10).items(), 1):
        pct = count / len(df) * 100
        print(f"  {i:2d}. {prefixo}: {count:,} ({pct:.1f}%)")

# ============================================================================
# 6. ANÁLISE TEMPORAL (se houver data_criacao)
# ============================================================================
print("\n" + "="*80)
print("📅 6. ANÁLISE TEMPORAL")
print("="*80)

if 'data_criacao' in df.columns:
    df['data_criacao'] = pd.to_datetime(df['data_criacao'], errors='coerce')
    
    dados_com_data = df['data_criacao'].notna().sum()
    print(f"\nRegistros com data: {dados_com_data:,} ({dados_com_data/len(df)*100:.1f}%)")
    
    if dados_com_data > 0:
        df_com_data = df[df['data_criacao'].notna()].copy()
        
        print(f"\nPeríodo:")
        print(f"  Data mais antiga: {df_com_data['data_criacao'].min()}")
        print(f"  Data mais recente: {df_com_data['data_criacao'].max()}")
        print(f"  Duração: {(df_com_data['data_criacao'].max() - df_com_data['data_criacao'].min()).days} dias")
        
        # Evolução temporal
        df_com_data['ano_mes'] = df_com_data['data_criacao'].dt.to_period('M')
        evolucao = df_com_data.groupby('ano_mes').size()
        
        print(f"\nEvolução mensal (últimos 12 meses):")
        for periodo, count in evolucao.tail(12).items():
            print(f"  {periodo}: {count:,} registros")
        
        # Gráfico
        plt.figure(figsize=(14, 6))
        evolucao.plot(kind='line', marker='o')
        plt.title('Evolução Temporal de Registros', fontsize=14, fontweight='bold')
        plt.xlabel('Período')
        plt.ylabel('Número de Registros')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig('evolucao_temporal.png', dpi=300, bbox_inches='tight')
        print("\n✓ Gráfico salvo: evolucao_temporal.png")
        plt.close()
    else:
        print("\n⚠️  Nenhum registro com data válida")
else:
    print("\n⚠️  Coluna data_criacao não encontrada")

# ============================================================================
# 7. ANÁLISE DE GEOMETRIA
# ============================================================================
print("\n" + "="*80)
print("🌐 7. ANÁLISE DE GEOMETRIA (PostGIS)")
print("="*80)

if 'geom_json' in df.columns:
    com_geom = df['geom_json'].notna().sum()
    print(f"\nRegistros com geometria: {com_geom:,} ({com_geom/len(df)*100:.1f}%)")
    
    # Exemplos de geometria
    print(f"\nExemplos de geometria (primeiros 3):")
    for i, geom in enumerate(df['geom_json'].dropna().head(3), 1):
        geom_str = str(geom)[:100] + "..." if len(str(geom)) > 100 else str(geom)
        print(f"  {i}. {geom_str}")

# ============================================================================
# 8. ESTATÍSTICAS GERAIS
# ============================================================================
print("\n" + "="*80)
print("📊 8. ESTATÍSTICAS GERAIS")
print("="*80)

print(f"\nResumo estatístico:")
print(f"  Total de registros: {len(df):,}")
print(f"  Total de colunas: {len(df.columns)}")
print(f"  Memória utilizada: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
print(f"  Registros únicos por ID: {df['id'].nunique():,}")
print(f"  Duplicatas: {df.duplicated().sum():,}")

# Completude dos dados
print(f"\nCompletude dos dados:")
for col in df.columns:
    completude = (1 - df[col].isnull().sum() / len(df)) * 100
    print(f"  {col}: {completude:.1f}%")

# ============================================================================
# 9. ANÁLISE CRUZADA: ANALISTA × SISTEMA
# ============================================================================
print("\n" + "="*80)
print("🔀 9. ANÁLISE CRUZADA: ANALISTA × SISTEMA")
print("="*80)

if 'analista' in df.columns and 'id_sistema' in df.columns:
    crosstab = pd.crosstab(df['analista'], df['id_sistema'])
    
    print(f"\nTop 5 analistas × Top 5 sistemas:")
    top_analistas = df['analista'].value_counts().head(5).index
    top_sistemas = df['id_sistema'].value_counts().head(5).index
    
    crosstab_top = crosstab.loc[top_analistas, top_sistemas]
    print(crosstab_top)
    
    # Heatmap
    plt.figure(figsize=(10, 6))
    sns.heatmap(crosstab_top, annot=True, fmt='d', cmap='YlOrRd')
    plt.title('Heatmap: Analista × Sistema (Top 5)', fontsize=14, fontweight='bold')
    plt.xlabel('ID Sistema')
    plt.ylabel('Analista')
    plt.tight_layout()
    plt.savefig('heatmap_analista_sistema.png', dpi=300, bbox_inches='tight')
    print("\n✓ Gráfico salvo: heatmap_analista_sistema.png")
    plt.close()

# ============================================================================
# 10. RESUMO EXECUTIVO
# ============================================================================
print("\n" + "="*80)
print("📋 10. RESUMO EXECUTIVO")
print("="*80)

print(f"""
DADOS DO SERVIDOR GIS (banco_techdengue)
{'='*80}

VOLUME:
  • Total de registros: {len(df):,}
  • Período de dados: {'Com datas' if df['data_criacao'].notna().any() else 'Sem datas'}
  • Cobertura geográfica: {((df['lat'].notna()) & (df['long'].notna())).sum():,} pontos com coordenadas

QUALIDADE:
  • Completude média: {(1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100:.1f}%
  • Geometria PostGIS: {df['geom_json'].notna().sum():,} registros ({df['geom_json'].notna().sum()/len(df)*100:.1f}%)
  • Duplicatas: {df.duplicated().sum():,}

OPERACIONAL:
  • Analistas ativos: {df['analista'].nunique()}
  • Sistemas identificados: {df['id_sistema'].nunique() if 'id_sistema' in df.columns else 'N/A'}
  • Registros por analista (média): {len(df) / df['analista'].nunique():.0f}

GRÁFICOS GERADOS:
  ✓ analise_por_analista.png
  ✓ distribuicao_geografica.png
  ✓ mapa_calor_densidade.png
  ✓ analise_por_sistema.png
  ✓ evolucao_temporal.png (se houver datas)
  ✓ heatmap_analista_sistema.png
""")

print("="*80)
print("✅ ANÁLISE EXPLORATÓRIA CONCLUÍDA")
print("="*80)
