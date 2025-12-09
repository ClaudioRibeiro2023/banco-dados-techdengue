"""
Análise Profunda dos Dados para Melhorias na Home
"""
import pandas as pd
import numpy as np
from pathlib import Path
import json

BASE_DIR = Path(__file__).parent
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"

print("="*80)
print("🔍 ANÁLISE PROFUNDA DOS DADOS")
print("="*80)

# Carregar MEGA TABELA
df = pd.read_parquet(GOLD_DIR / "mega_tabela_analitica.parquet")

print(f"\n📊 Dataset: {len(df):,} registros, {len(df.columns)} colunas")

# ============================================================================
# ANÁLISE 1: DISTRIBUIÇÃO TEMPORAL
# ============================================================================

print("\n" + "="*80)
print("📅 ANÁLISE TEMPORAL")
print("="*80)

temporal = df.groupby('ano').agg({
    'codigo_ibge': 'count',
    'total_atividades': ['sum', lambda x: (x > 0).sum()],
    'total_pois_excel': 'sum',
    'total_hectares_mapeados': 'sum',
    'total_devolutivas': 'sum',
    'taxa_conversao_devolutivas': 'mean'
}).round(2)

print("\nPor Ano:")
print(temporal)

# ============================================================================
# ANÁLISE 2: DISTRIBUIÇÃO GEOGRÁFICA
# ============================================================================

print("\n" + "="*80)
print("🗺️ ANÁLISE GEOGRÁFICA")
print("="*80)

if 'urs' in df.columns:
    geo = df[df['total_atividades'] > 0].groupby('urs').agg({
        'codigo_ibge': 'count',
        'total_pois_excel': 'sum',
        'total_hectares_mapeados': 'sum',
        'populacao': 'sum'
    }).sort_values('total_pois_excel', ascending=False)
    
    print("\nTop 10 URS por POIs:")
    print(geo.head(10))

# ============================================================================
# ANÁLISE 3: TIPOS DE DEPÓSITOS
# ============================================================================

print("\n" + "="*80)
print("🪣 ANÁLISE DE TIPOS DE DEPÓSITOS")
print("="*80)

# Colunas de grupos
grupos = ['A - Armazenamento de água', 'B - Pequenos depósitos móveis', 
          'C - Depósitos fixos', 'D - Depósitos passíveis de remoção']

depositos_grupos = {}
for grupo in grupos:
    if grupo in df.columns:
        total = df[grupo].sum()
        depositos_grupos[grupo] = total

print("\nDistribuição por Grupo:")
for grupo, total in sorted(depositos_grupos.items(), key=lambda x: x[1], reverse=True):
    pct = (total / sum(depositos_grupos.values()) * 100) if sum(depositos_grupos.values()) > 0 else 0
    print(f"  {grupo}: {total:,.0f} ({pct:.1f}%)")

# ============================================================================
# ANÁLISE 4: EFETIVIDADE DAS AÇÕES
# ============================================================================

print("\n" + "="*80)
print("✅ ANÁLISE DE EFETIVIDADE")
print("="*80)

acoes = ['removido_solucionado', 'descaracterizado', 'Tratado', 
         'morador_ausente', 'nao_Autorizado']

acoes_totais = {}
for acao in acoes:
    if acao in df.columns:
        total = df[acao].sum()
        acoes_totais[acao] = total

print("\nAções Realizadas:")
for acao, total in sorted(acoes_totais.items(), key=lambda x: x[1], reverse=True):
    print(f"  {acao}: {total:,.0f}")

# Taxa de conversão média
if 'taxa_conversao_devolutivas' in df.columns:
    taxa_media = df[df['total_atividades'] > 0]['taxa_conversao_devolutivas'].mean()
    print(f"\nTaxa de Conversão Média: {taxa_media:.1f}%")

# ============================================================================
# ANÁLISE 5: TOP MUNICÍPIOS
# ============================================================================

print("\n" + "="*80)
print("🏆 TOP MUNICÍPIOS")
print("="*80)

top_municipios = df[df['total_atividades'] > 0].nlargest(10, 'total_pois_excel')[
    ['municipio', 'ano', 'total_pois_excel', 'total_hectares_mapeados', 'total_devolutivas']
]

print("\nTop 10 Municípios por POIs:")
print(top_municipios.to_string(index=False))

# ============================================================================
# ANÁLISE 6: CORRELAÇÕES
# ============================================================================

print("\n" + "="*80)
print("📈 ANÁLISE DE CORRELAÇÕES")
print("="*80)

df_corr = df[df['total_atividades'] > 0].copy()

if 'total_casos_dengue' in df_corr.columns and df_corr['total_casos_dengue'].sum() > 0:
    corr_dengue_pois = df_corr[['total_casos_dengue', 'total_pois_excel']].corr().iloc[0, 1]
    print(f"\nCorrelação Dengue × POIs: {corr_dengue_pois:.3f}")

if 'populacao' in df_corr.columns:
    corr_pop_pois = df_corr[['populacao', 'total_pois_excel']].corr().iloc[0, 1]
    print(f"Correlação População × POIs: {corr_pop_pois:.3f}")

# ============================================================================
# ANÁLISE 7: INSIGHTS PARA VISUALIZAÇÃO
# ============================================================================

print("\n" + "="*80)
print("💡 INSIGHTS PARA VISUALIZAÇÃO")
print("="*80)

insights = {
    'total_municipios': int(df['codigo_ibge'].nunique()),
    'municipios_com_atividades': int((df['total_atividades'] > 0).sum()),
    'cobertura_percentual': float((df['total_atividades'] > 0).sum() / len(df) * 100),
    'total_pois': int(df['total_pois_excel'].sum()),
    'total_hectares': float(df['total_hectares_mapeados'].sum()),
    'total_devolutivas': int(df['total_devolutivas'].sum()),
    'taxa_conversao_media': float(df[df['total_atividades'] > 0]['taxa_conversao_devolutivas'].mean()),
    'anos_operacao': sorted([int(x) for x in df['ano'].unique()]),
    'crescimento_2024_2025': None
}

# Calcular crescimento
ativ_2024 = df[df['ano'] == 2024]['total_atividades'].sum()
ativ_2025 = df[df['ano'] == 2025]['total_atividades'].sum()
if ativ_2024 > 0:
    crescimento = ((ativ_2025 - ativ_2024) / ativ_2024) * 100
    insights['crescimento_2024_2025'] = float(crescimento)

print("\n📊 Métricas Principais:")
for key, value in insights.items():
    print(f"  {key}: {value}")

# Salvar insights
with open(BASE_DIR / "data_lake" / "metadata" / "insights_home.json", 'w') as f:
    json.dump(insights, f, indent=2)

print("\n✅ Insights salvos em: data_lake/metadata/insights_home.json")

# ============================================================================
# RECOMENDAÇÕES
# ============================================================================

print("\n" + "="*80)
print("🎯 RECOMENDAÇÕES PARA HOME")
print("="*80)

print("""
1. HERO SECTION
   - KPIs principais em destaque
   - Gráfico de evolução temporal
   - Mapa de calor de cobertura

2. ANÁLISE TEMPORAL
   - Timeline interativo 2023-2025
   - Crescimento mês a mês
   - Projeções

3. ANÁLISE GEOGRÁFICA
   - Top 10 URS
   - Mapa de cobertura
   - Ranking de municípios

4. EFETIVIDADE
   - Taxa de conversão
   - Tipos de depósitos
   - Ações realizadas

5. COMPARAÇÕES
   - Ano a ano
   - URS vs URS
   - Município vs Município

6. ALERTAS E INSIGHTS
   - Municípios sem cobertura
   - Tendências
   - Recomendações
""")

print("="*80)
