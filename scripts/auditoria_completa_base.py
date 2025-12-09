"""
Auditoria Completa da Base TechDengue
Objetivo: Identificar anomalias e inconsistências em todas as métricas
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).parent
ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = BASE_DIR
DADOS_DIR = (ROOT_DIR / "dados_integrados") if (ROOT_DIR / "dados_integrados").exists() else (SCRIPTS_DIR / "dados_integrados")

print("="*80)
print("🔍 AUDITORIA COMPLETA - BASE TECHDENGUE")
print("="*80)
print("\nObjetivo: Identificar anomalias e validar métricas contra servidor")
print("="*80)

# Carregar dados
print("\n📊 Carregando dados...")
df = pd.read_parquet(DADOS_DIR / "fato_atividades_techdengue.parquet")
df_integrado = pd.read_parquet(DADOS_DIR / "analise_integrada.parquet")

print(f"✓ fato_atividades_techdengue: {len(df):,} registros")
print(f"✓ analise_integrada: {len(df_integrado):,} registros")

# ============================================================================
# AUDITORIA 1: TOTAIS GERAIS
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 1: TOTAIS GERAIS")
print("="*80)

total_atividades = len(df)
total_municipios = df['CODIGO_IBGE'].nunique()
total_pois = df['POIS'].sum()
total_devolutivas = df['devolutivas'].sum()
total_hectares = df['HECTARES_MAPEADOS'].sum()

print(f"\n✓ Atividades: {total_atividades:,}")
print(f"✓ Municípios únicos: {total_municipios:,}")
print(f"✓ POIs identificados: {total_pois:,}")
print(f"✓ Devolutivas realizadas: {total_devolutivas:,}")
print(f"✓ Hectares mapeados: {total_hectares:,.2f} ha")

# Calcular métricas derivadas
taxa_conversao = (total_devolutivas / total_pois * 100) if total_pois > 0 else 0
densidade_pois = total_pois / total_hectares if total_hectares > 0 else 0

print(f"\n✓ Taxa de conversão: {taxa_conversao:.2f}%")
print(f"✓ Densidade de POIs: {densidade_pois:.2f} POIs/hectare")

# ============================================================================
# AUDITORIA 2: CATEGORIAS DE POIs
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 2: CATEGORIAS DE POIs")
print("="*80)

# Identificar colunas de categorias
categorias_pois = [col for col in df.columns if col.startswith(('A -', 'B -', 'C -', 'D -', 'O -'))]
print(f"\n✓ {len(categorias_pois)} categorias de POIs identificadas")

# Somar cada categoria
total_por_categoria = {}
for cat in categorias_pois:
    total = df[cat].sum()
    total_por_categoria[cat] = total

# Ordenar por total
categorias_ordenadas = sorted(total_por_categoria.items(), key=lambda x: x[1], reverse=True)

print(f"\nTop 10 categorias:")
for i, (cat, total) in enumerate(categorias_ordenadas[:10], 1):
    pct = (total / total_pois * 100) if total_pois > 0 else 0
    print(f"  {i:2d}. {cat}: {total:,} ({pct:.1f}%)")

# Verificar se soma das categorias = total de POIs
soma_categorias = sum(total_por_categoria.values())
print(f"\n🔍 VERIFICAÇÃO:")
print(f"  Soma das categorias: {soma_categorias:,}")
print(f"  Total de POIs: {total_pois:,}")
print(f"  Diferença: {abs(soma_categorias - total_pois):,}")

if abs(soma_categorias - total_pois) > 0:
    print(f"  ⚠️  ANOMALIA: Soma das categorias ≠ Total de POIs")
    print(f"  Diferença: {abs(soma_categorias - total_pois):,} POIs ({abs(soma_categorias - total_pois) / total_pois * 100:.2f}%)")
else:
    print(f"  ✅ OK: Soma das categorias = Total de POIs")

# ============================================================================
# AUDITORIA 3: DEVOLUTIVAS E TRATAMENTOS
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 3: DEVOLUTIVAS E TRATAMENTOS")
print("="*80)

# Colunas de tratamento
colunas_tratamento = [
    'devolutivas',
    'removido_solucionado',
    'descaracterizado',
    'Tratado',
    'morador_ausente',
    'nao_Autorizado',
    'tratamento_via_drones',
    'monitorado'
]

print(f"\nTotais por tipo de tratamento:")
totais_tratamento = {}
for col in colunas_tratamento:
    if col in df.columns:
        total = df[col].sum()
        totais_tratamento[col] = total
        pct = (total / total_pois * 100) if total_pois > 0 else 0
        print(f"  {col}: {total:,} ({pct:.1f}%)")

# Verificar se soma de tratamentos <= POIs
soma_tratamentos = sum(totais_tratamento.values())
print(f"\n🔍 VERIFICAÇÃO:")
print(f"  Soma de tratamentos: {soma_tratamentos:,}")
print(f"  Total de POIs: {total_pois:,}")

if soma_tratamentos > total_pois:
    print(f"  ⚠️  ANOMALIA: Soma de tratamentos > Total de POIs")
    print(f"  Diferença: {soma_tratamentos - total_pois:,} ({(soma_tratamentos - total_pois) / total_pois * 100:.2f}%)")
else:
    print(f"  ✅ OK: Soma de tratamentos <= Total de POIs")

# ============================================================================
# AUDITORIA 4: VALORES NULOS E ZEROS
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 4: VALORES NULOS E ZEROS")
print("="*80)

colunas_criticas = ['POIS', 'HECTARES_MAPEADOS', 'DATA_MAP', 'CODIGO_IBGE', 'NOMENCLATURA_ATIVIDADE']

print(f"\nValores nulos em colunas críticas:")
tem_nulos = False
for col in colunas_criticas:
    if col in df.columns:
        nulos = df[col].isna().sum()
        if nulos > 0:
            tem_nulos = True
            print(f"  ⚠️  {col}: {nulos:,} nulos ({nulos/len(df)*100:.2f}%)")

if not tem_nulos:
    print(f"  ✅ Nenhum valor nulo em colunas críticas")

# Verificar zeros em POIs e hectares
print(f"\nValores zero:")
pois_zero = (df['POIS'] == 0).sum()
hectares_zero = (df['HECTARES_MAPEADOS'] == 0).sum()

if pois_zero > 0:
    print(f"  ⚠️  POIs = 0: {pois_zero:,} registros ({pois_zero/len(df)*100:.2f}%)")
else:
    print(f"  ✅ Nenhum registro com POIs = 0")

if hectares_zero > 0:
    print(f"  ⚠️  Hectares = 0: {hectares_zero:,} registros ({hectares_zero/len(df)*100:.2f}%)")
else:
    print(f"  ✅ Nenhum registro com Hectares = 0")

# ============================================================================
# AUDITORIA 5: OUTLIERS E VALORES EXTREMOS
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 5: OUTLIERS E VALORES EXTREMOS")
print("="*80)

# Estatísticas de POIs
print(f"\nEstatísticas de POIs por atividade:")
print(f"  Média: {df['POIS'].mean():,.2f}")
print(f"  Mediana: {df['POIS'].median():,.2f}")
print(f"  Desvio padrão: {df['POIS'].std():,.2f}")
print(f"  Mínimo: {df['POIS'].min():,}")
print(f"  Máximo: {df['POIS'].max():,}")

# Identificar outliers (> 3 desvios padrão)
media_pois = df['POIS'].mean()
std_pois = df['POIS'].std()
outliers_pois = df[df['POIS'] > media_pois + 3*std_pois]

if len(outliers_pois) > 0:
    print(f"\n⚠️  {len(outliers_pois)} outliers identificados (POIs > média + 3σ):")
    for idx, row in outliers_pois.nlargest(5, 'POIS').iterrows():
        print(f"  - {row['CODIGO_IBGE']} | {row['DATA_MAP']} | POIs: {row['POIS']:,}")
else:
    print(f"\n✅ Nenhum outlier extremo identificado")

# Estatísticas de Hectares
print(f"\nEstatísticas de Hectares por atividade:")
print(f"  Média: {df['HECTARES_MAPEADOS'].mean():,.2f}")
print(f"  Mediana: {df['HECTARES_MAPEADOS'].median():,.2f}")
print(f"  Desvio padrão: {df['HECTARES_MAPEADOS'].std():,.2f}")
print(f"  Mínimo: {df['HECTARES_MAPEADOS'].min():,.2f}")
print(f"  Máximo: {df['HECTARES_MAPEADOS'].max():,.2f}")

# ============================================================================
# AUDITORIA 6: DENSIDADE DE POIs (POSSÍVEL ANOMALIA)
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 6: DENSIDADE DE POIs")
print("="*80)

# Calcular densidade por atividade
df['DENSIDADE_POIS'] = df['POIS'] / df['HECTARES_MAPEADOS']

print(f"\nEstatísticas de Densidade (POIs/hectare):")
print(f"  Média: {df['DENSIDADE_POIS'].mean():,.2f}")
print(f"  Mediana: {df['DENSIDADE_POIS'].median():,.2f}")
print(f"  Desvio padrão: {df['DENSIDADE_POIS'].std():,.2f}")
print(f"  Mínimo: {df['DENSIDADE_POIS'].min():,.2f}")
print(f"  Máximo: {df['DENSIDADE_POIS'].max():,.2f}")

# Identificar densidades extremas
densidade_alta = df[df['DENSIDADE_POIS'] > 10]
densidade_baixa = df[df['DENSIDADE_POIS'] < 0.1]

if len(densidade_alta) > 0:
    print(f"\n⚠️  {len(densidade_alta)} atividades com densidade muito alta (>10 POIs/ha):")
    for idx, row in densidade_alta.nlargest(5, 'DENSIDADE_POIS').iterrows():
        print(f"  - {row['CODIGO_IBGE']} | {row['DENSIDADE_POIS']:.2f} POIs/ha ({row['POIS']} POIs em {row['HECTARES_MAPEADOS']:.2f} ha)")

if len(densidade_baixa) > 0:
    print(f"\n⚠️  {len(densidade_baixa)} atividades com densidade muito baixa (<0.1 POIs/ha):")
    for idx, row in densidade_baixa.head(5).iterrows():
        print(f"  - {row['CODIGO_IBGE']} | {row['DENSIDADE_POIS']:.4f} POIs/ha ({row['POIS']} POIs em {row['HECTARES_MAPEADOS']:.2f} ha)")

# ============================================================================
# AUDITORIA 7: DUPLICATAS E INCONSISTÊNCIAS
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 7: DUPLICATAS E INCONSISTÊNCIAS")
print("="*80)

# Verificar duplicatas por chave
chave = ['CODIGO_IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE']
duplicatas = df.duplicated(subset=chave, keep=False)
n_duplicatas = duplicatas.sum()

if n_duplicatas > 0:
    print(f"\n⚠️  {n_duplicatas} registros duplicados encontrados!")
    print(f"  Chave: {chave}")
    print(f"\nExemplos:")
    df_dup = df[duplicatas].sort_values(chave)
    for idx, row in df_dup.head(6).iterrows():
        print(f"  - {row['CODIGO_IBGE']} | {row['DATA_MAP']} | {row['NOMENCLATURA_ATIVIDADE']} | POIs: {row['POIS']}")
else:
    print(f"\n✅ Nenhuma duplicata encontrada (chave: {chave})")

# ============================================================================
# AUDITORIA 8: CONSISTÊNCIA TEMPORAL
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 8: CONSISTÊNCIA TEMPORAL")
print("="*80)

df['DATA_MAP'] = pd.to_datetime(df['DATA_MAP'])
data_min = df['DATA_MAP'].min()
data_max = df['DATA_MAP'].max()

print(f"\nPeríodo das atividades:")
print(f"  Primeira atividade: {data_min.strftime('%d/%m/%Y')}")
print(f"  Última atividade: {data_max.strftime('%d/%m/%Y')}")
print(f"  Duração: {(data_max - data_min).days} dias")

# Atividades por mês
df['ANO_MES'] = df['DATA_MAP'].dt.to_period('M')
atividades_por_mes = df.groupby('ANO_MES').size()

print(f"\nAtividades por mês:")
print(f"  Média: {atividades_por_mes.mean():.1f} atividades/mês")
print(f"  Mínimo: {atividades_por_mes.min()} ({atividades_por_mes.idxmin()})")
print(f"  Máximo: {atividades_por_mes.max()} ({atividades_por_mes.idxmax()})")

# ============================================================================
# AUDITORIA 9: LINK GIS
# ============================================================================
print("\n" + "="*80)
print("📊 AUDITORIA 9: DISPONIBILIDADE DE LINK GIS")
print("="*80)

if 'LINK_GIS' in df.columns:
    links_disponiveis = df['LINK_GIS'].notna().sum()
    pct_links = (links_disponiveis / len(df) * 100)
    
    print(f"\nLinks GIS disponíveis: {links_disponiveis:,} ({pct_links:.1f}%)")
    
    if pct_links < 95:
        print(f"  ⚠️  Menos de 95% dos registros têm link GIS")
    else:
        print(f"  ✅ Boa cobertura de links GIS")
else:
    print(f"\n⚠️  Coluna LINK_GIS não encontrada")

# ============================================================================
# RESUMO DE ANOMALIAS
# ============================================================================
print("\n" + "="*80)
print("🚨 RESUMO DE ANOMALIAS IDENTIFICADAS")
print("="*80)

anomalias = []

# Verificar cada anomalia
if abs(soma_categorias - total_pois) > 0:
    anomalias.append(f"Soma categorias ≠ Total POIs (diferença: {abs(soma_categorias - total_pois):,})")

if soma_tratamentos > total_pois:
    anomalias.append(f"Soma tratamentos > Total POIs (diferença: {soma_tratamentos - total_pois:,})")

if pois_zero > 0:
    anomalias.append(f"{pois_zero:,} registros com POIs = 0")

if hectares_zero > 0:
    anomalias.append(f"{hectares_zero:,} registros com Hectares = 0")

if len(outliers_pois) > 0:
    anomalias.append(f"{len(outliers_pois)} outliers em POIs (>3σ)")

if n_duplicatas > 0:
    anomalias.append(f"{n_duplicatas} registros duplicados")

if 'LINK_GIS' in df.columns and pct_links < 95:
    anomalias.append(f"Apenas {pct_links:.1f}% com link GIS")

if len(anomalias) > 0:
    print(f"\n⚠️  {len(anomalias)} ANOMALIA(S) IDENTIFICADA(S):\n")
    for i, anomalia in enumerate(anomalias, 1):
        print(f"  {i}. {anomalia}")
else:
    print(f"\n✅ NENHUMA ANOMALIA CRÍTICA IDENTIFICADA")

# ============================================================================
# RECOMENDAÇÕES
# ============================================================================
print("\n" + "="*80)
print("💡 RECOMENDAÇÕES")
print("="*80)

print(f"""
1. VALIDAÇÃO COM SERVIDOR:
   - Comparar total de POIs ({total_pois:,}) com base do servidor
   - Verificar se agrupamento está correto
   - Confirmar se categorias estão completas

2. INVESTIGAR ANOMALIAS:
   - Revisar registros com valores extremos
   - Validar cálculos de tratamentos
   - Verificar registros com zeros

3. PRÓXIMOS PASSOS:
   - Acessar base de pontos do servidor
   - Comparar métricas agregadas
   - Documentar diferenças encontradas
   - Ajustar processo de ETL se necessário
""")

print("="*80)
print("✅ AUDITORIA CONCLUÍDA")
print("="*80)
