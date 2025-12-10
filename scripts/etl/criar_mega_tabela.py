"""
Criação da MEGA TABELA - Tabela Analítica Completa
Granularidade: MUNICÍPIO × ANO
Todas as métricas consolidadas em uma única tabela
"""
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import hashlib

BASE_DIR = Path(__file__).parent
SILVER_DIR = BASE_DIR / "data_lake" / "silver"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

GOLD_DIR.mkdir(exist_ok=True, parents=True)

print("="*80)
print("🥇 CRIANDO MEGA TABELA ANALÍTICA COMPLETA")
print("="*80)

# ============================================================================
# 1. CARREGAR DADOS DA CAMADA SILVER
# ============================================================================

print("\n1️⃣ Carregando dados da camada SILVER...")

# Dimensões
df_municipios = pd.read_parquet(SILVER_DIR / 'dim_municipios.parquet')
print(f"✓ dim_municipios: {len(df_municipios):,} registros")

# Fatos
df_pois_servidor = pd.read_parquet(SILVER_DIR / 'fato_pois_servidor.parquet')
print(f"✓ fato_pois_servidor: {len(df_pois_servidor):,} registros")

df_atividades = pd.read_parquet(SILVER_DIR / 'fato_atividades.parquet')
print(f"✓ fato_atividades: {len(df_atividades):,} registros")

df_dengue = pd.read_parquet(SILVER_DIR / 'fato_dengue.parquet')
print(f"✓ fato_dengue: {len(df_dengue):,} registros")

# ============================================================================
# 2. AGREGAR POIS DO SERVIDOR POR MUNICÍPIO
# ============================================================================

print("\n2️⃣ Agregando POIs do servidor por município...")

# Extrair código IBGE das coordenadas (aproximação)
# Como não temos código IBGE direto nos POIs, vamos criar uma agregação espacial

agg_pois_servidor = df_pois_servidor.groupby('sistema_id').agg({
    'poi_id': 'count',
    'latitude': 'mean',
    'longitude': 'mean',
    'analista': lambda x: x.mode()[0] if len(x.mode()) > 0 else None
}).reset_index()

agg_pois_servidor.columns = [
    'sistema_id',
    'total_pois_servidor',
    'lat_media_sistema',
    'long_media_sistema',
    'analista_principal'
]

print(f"✓ Agregado por sistema: {len(agg_pois_servidor):,} sistemas")

# Agregação geral (sem município por enquanto)
total_pois_geral = len(df_pois_servidor)
print(f"✓ Total de POIs no servidor: {total_pois_geral:,}")

# ============================================================================
# 3. AGREGAR ATIVIDADES POR MUNICÍPIO E ANO
# ============================================================================

print("\n3️⃣ Agregando atividades por município...")

# Extrair ano da data
df_atividades['ANO'] = pd.to_datetime(df_atividades['DATA_MAP']).dt.year

# Identificar colunas de categorias
colunas_categorias = [col for col in df_atividades.columns 
                      if col.startswith(('A -', 'B -', 'C -', 'D -', 'O -'))]

# Colunas de tratamento
colunas_tratamento = [
    'removido_solucionado', 'descaracterizado', 'Tratado',
    'morador_ausente', 'nao_Autorizado', 'tratamento_via_drones', 'monitorado'
]

# Agregar por município e ano
agg_dict = {
    'NOMENCLATURA_ATIVIDADE': 'count',
    'POIS': 'sum',
    'devolutivas': 'sum',
    'HECTARES_MAPEADOS': 'sum',
    'DATA_MAP': ['min', 'max']
}

# Adicionar categorias
for col in colunas_categorias:
    if col in df_atividades.columns:
        agg_dict[col] = 'sum'

# Adicionar tratamentos
for col in colunas_tratamento:
    if col in df_atividades.columns:
        agg_dict[col] = 'sum'

agg_atividades = df_atividades.groupby(['CODIGO_IBGE', 'ANO']).agg(agg_dict).reset_index()

# Renomear colunas
agg_atividades.columns = [
    'codigo_ibge', 'ano',
    'total_atividades',
    'total_pois_excel',
    'total_devolutivas',
    'total_hectares_mapeados',
    'data_primeira_atividade',
    'data_ultima_atividade'
] + colunas_categorias + colunas_tratamento

# Calcular métricas derivadas
agg_atividades['taxa_conversao_devolutivas'] = (
    agg_atividades['total_devolutivas'] / agg_atividades['total_pois_excel'] * 100
).fillna(0)

agg_atividades['dias_operacao'] = (
    pd.to_datetime(agg_atividades['data_ultima_atividade']) - 
    pd.to_datetime(agg_atividades['data_primeira_atividade'])
).dt.days

print(f"✓ Agregado: {len(agg_atividades):,} registros (município × ano)")

# ============================================================================
# 4. AGREGAR DENGUE POR MUNICÍPIO E ANO
# ============================================================================

print("\n4️⃣ Agregando casos de dengue por município e ano...")

# Verificar se tem coluna de casos
if 'CASOS' in df_dengue.columns:
    agg_dengue = df_dengue.groupby(['MUNICIPIO', 'ANO']).agg({
        'CASOS': 'sum'
    }).reset_index()
    
    agg_dengue.columns = ['municipio', 'ano', 'total_casos_dengue']
    
    print(f"✓ Agregado: {len(agg_dengue):,} registros (município × ano)")
else:
    print("⚠️  Coluna CASOS não encontrada em dengue")
    agg_dengue = pd.DataFrame(columns=['municipio', 'ano', 'total_casos_dengue'])

# ============================================================================
# 5. CRIAR MEGA TABELA (MUNICÍPIO × ANO)
# ============================================================================

print("\n5️⃣ Criando MEGA TABELA...")

# Base: todos os municípios × todos os anos
anos = [2023, 2024, 2025]
base = []

for ano in anos:
    df_ano = df_municipios.copy()
    df_ano['ano'] = ano
    base.append(df_ano)

mega_tabela = pd.concat(base, ignore_index=True)

print(f"✓ Base criada: {len(mega_tabela):,} registros ({len(df_municipios)} municípios × {len(anos)} anos)")

# Merge com atividades
mega_tabela = mega_tabela.merge(
    agg_atividades,
    on=['codigo_ibge', 'ano'],
    how='left'
)

print(f"✓ Após merge com atividades: {len(mega_tabela):,} registros")

# Merge com dengue (por município)
mega_tabela = mega_tabela.merge(
    agg_dengue,
    left_on=['municipio', 'ano'],
    right_on=['municipio', 'ano'],
    how='left'
)

print(f"✓ Após merge com dengue: {len(mega_tabela):,} registros")

# ============================================================================
# 6. PREENCHER VALORES NULOS E CRIAR INDICADORES
# ============================================================================

print("\n6️⃣ Criando indicadores e preenchendo valores...")

# Preencher nulos numéricos com 0
colunas_numericas = mega_tabela.select_dtypes(include=[np.number]).columns
for col in colunas_numericas:
    mega_tabela[col] = mega_tabela[col].fillna(0)

# Converter colunas para numérico
mega_tabela['populacao'] = pd.to_numeric(mega_tabela['populacao'], errors='coerce').fillna(0)
mega_tabela['area_ha'] = pd.to_numeric(mega_tabela['area_ha'], errors='coerce').fillna(0)
mega_tabela['total_casos_dengue'] = pd.to_numeric(mega_tabela['total_casos_dengue'], errors='coerce').fillna(0)
mega_tabela['total_pois_excel'] = pd.to_numeric(mega_tabela['total_pois_excel'], errors='coerce').fillna(0)
mega_tabela['total_hectares_mapeados'] = pd.to_numeric(mega_tabela['total_hectares_mapeados'], errors='coerce').fillna(0)

# Criar indicadores booleanos
mega_tabela['tem_atividade_techdengue'] = (mega_tabela['total_atividades'] > 0).astype(int)
mega_tabela['tem_casos_dengue'] = (mega_tabela['total_casos_dengue'] > 0).astype(int)

# Calcular densidade
mega_tabela['densidade_populacional'] = (
    mega_tabela['populacao'] / mega_tabela['area_ha']
).replace([np.inf, -np.inf], 0).fillna(0)

mega_tabela['densidade_pois_por_hectare'] = (
    mega_tabela['total_pois_excel'] / mega_tabela['total_hectares_mapeados']
).replace([np.inf, -np.inf], 0).fillna(0)

# Taxa de incidência de dengue (por 100 mil habitantes)
mega_tabela['taxa_incidencia_dengue_100k'] = np.where(
    mega_tabela['populacao'] > 0,
    mega_tabela['total_casos_dengue'] / mega_tabela['populacao'] * 100000,
    0
)

# POIs por caso de dengue
mega_tabela['pois_por_caso_dengue'] = (
    mega_tabela['total_pois_excel'] / mega_tabela['total_casos_dengue']
).replace([np.inf, -np.inf], 0).fillna(0)

# Score de efetividade (0-100)
# Baseado em: atividades, devolutivas, redução de casos
mega_tabela['efetividade_score'] = 0  # Placeholder para cálculo futuro

# Score de risco de dengue (0-100)
# Baseado em: incidência, tendência, densidade populacional
mega_tabela['risco_dengue_score'] = np.clip(
    mega_tabela['taxa_incidencia_dengue_100k'] / 100,
    0, 100
)

# Adicionar metadados
mega_tabela['data_atualizacao'] = datetime.now()
mega_tabela['versao'] = '1.0.0'

print(f"✓ Indicadores criados")

# ============================================================================
# 7. SALVAR MEGA TABELA
# ============================================================================

print("\n7️⃣ Salvando MEGA TABELA...")

# Ordenar colunas
colunas_ordem = [
    # Identificação
    'codigo_ibge', 'municipio', 'ano',
    'urs', 'microregiao_saude', 'macroregiao_saude',
    
    # Demografia
    'populacao', 'area_ha', 'densidade_populacional',
    
    # Dengue
    'total_casos_dengue', 'taxa_incidencia_dengue_100k',
    
    # Atividades TechDengue
    'total_atividades', 'total_pois_excel', 'total_devolutivas',
    'total_hectares_mapeados', 'taxa_conversao_devolutivas',
    'data_primeira_atividade', 'data_ultima_atividade', 'dias_operacao',
    
    # Indicadores
    'tem_atividade_techdengue', 'tem_casos_dengue',
    'densidade_pois_por_hectare', 'pois_por_caso_dengue',
    'efetividade_score', 'risco_dengue_score',
    
    # Metadados
    'data_atualizacao', 'versao'
]

# Adicionar colunas de categorias e tratamentos que existem
colunas_existentes = [col for col in colunas_ordem if col in mega_tabela.columns]
colunas_extras = [col for col in mega_tabela.columns if col not in colunas_existentes]

colunas_final = colunas_existentes + colunas_extras

mega_tabela = mega_tabela[colunas_final]

# Salvar
mega_tabela_path = GOLD_DIR / 'mega_tabela_analitica.parquet'
mega_tabela.to_parquet(mega_tabela_path, index=False)

print(f"✓ MEGA TABELA salva: {mega_tabela_path}")
print(f"   Registros: {len(mega_tabela):,}")
print(f"   Colunas: {len(mega_tabela.columns)}")
print(f"   Tamanho: {mega_tabela_path.stat().st_size / 1024 / 1024:.2f} MB")

# Salvar também em CSV para fácil visualização
mega_tabela_csv = GOLD_DIR / 'mega_tabela_analitica.csv'
mega_tabela.to_csv(mega_tabela_csv, index=False)
print(f"✓ CSV salvo: {mega_tabela_csv}")

# ============================================================================
# 8. ESTATÍSTICAS DA MEGA TABELA
# ============================================================================

print("\n8️⃣ Estatísticas da MEGA TABELA:")
print("="*80)

print(f"\nDimensões:")
print(f"  Registros: {len(mega_tabela):,}")
print(f"  Colunas: {len(mega_tabela.columns)}")
print(f"  Municípios únicos: {mega_tabela['codigo_ibge'].nunique()}")
print(f"  Anos: {sorted(mega_tabela['ano'].unique())}")

print(f"\nCobertura:")
print(f"  Municípios com atividades: {mega_tabela['tem_atividade_techdengue'].sum():,}")
print(f"  Municípios com casos de dengue: {mega_tabela['tem_casos_dengue'].sum():,}")

print(f"\nTotais:")
print(f"  Total de atividades: {mega_tabela['total_atividades'].sum():,.0f}")
print(f"  Total de POIs: {mega_tabela['total_pois_excel'].sum():,.0f}")
print(f"  Total de devolutivas: {mega_tabela['total_devolutivas'].sum():,.0f}")
print(f"  Total de hectares: {mega_tabela['total_hectares_mapeados'].sum():,.2f}")
print(f"  Total de casos dengue: {mega_tabela['total_casos_dengue'].sum():,.0f}")

print(f"\nMétricas médias:")
print(f"  Taxa de conversão: {mega_tabela[mega_tabela['total_pois_excel'] > 0]['taxa_conversao_devolutivas'].mean():.2f}%")
print(f"  Densidade POIs/ha: {mega_tabela[mega_tabela['total_hectares_mapeados'] > 0]['densidade_pois_por_hectare'].mean():.2f}")
print(f"  Taxa incidência dengue: {mega_tabela[mega_tabela['populacao'] > 0]['taxa_incidencia_dengue_100k'].mean():.2f} por 100k hab")

# ============================================================================
# 9. CRIAR DICIONÁRIO DE DADOS
# ============================================================================

print("\n9️⃣ Criando dicionário de dados...")

dicionario = []

for col in mega_tabela.columns:
    dicionario.append({
        'coluna': col,
        'tipo': str(mega_tabela[col].dtype),
        'nulos': mega_tabela[col].isnull().sum(),
        'nulos_pct': f"{mega_tabela[col].isnull().sum() / len(mega_tabela) * 100:.1f}%",
        'unicos': mega_tabela[col].nunique(),
        'exemplo': str(mega_tabela[col].iloc[0]) if len(mega_tabela) > 0 else None
    })

df_dicionario = pd.DataFrame(dicionario)
dicionario_path = METADATA_DIR / 'dicionario_mega_tabela.csv'
df_dicionario.to_csv(dicionario_path, index=False)

print(f"✓ Dicionário salvo: {dicionario_path}")

# ============================================================================
# 10. RESUMO FINAL
# ============================================================================

print("\n" + "="*80)
print("✅ MEGA TABELA CRIADA COM SUCESSO!")
print("="*80)

print(f"""
MEGA TABELA ANALÍTICA COMPLETA
{'='*80}

📊 ESTRUTURA:
  • Granularidade: MUNICÍPIO × ANO
  • Registros: {len(mega_tabela):,}
  • Colunas: {len(mega_tabela.columns)}
  • Tamanho: {mega_tabela_path.stat().st_size / 1024 / 1024:.2f} MB

📁 ARQUIVOS GERADOS:
  • {mega_tabela_path.name}
  • {mega_tabela_csv.name}
  • {dicionario_path.name}

🎯 CASOS DE USO:
  • Análises de correlação (POIs × Dengue)
  • Dashboards executivos
  • Modelos preditivos
  • Relatórios gerenciais
  • Análises de efetividade

💡 PRÓXIMOS PASSOS:
  1. Explorar dados: pd.read_parquet('{mega_tabela_path}')
  2. Criar visualizações
  3. Análises estatísticas
  4. Machine Learning
""")

print("="*80)
