"""
FASE 2: ANÁLISE EXPLORATÓRIA DE DADOS (EDA) - CISARP
Análise detalhada das atividades TechDengue no consórcio CISARP
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json
from pathlib import Path
from collections import Counter

# Configurações
BASE_DIR = Path(__file__).parent.parent
DADOS_DIR = BASE_DIR / 'base_dados'
INPUT_DIR = Path(__file__).parent / 'dados'
OUTPUT_DIR = Path(__file__).parent / 'dados'
OUTPUT_DIR.mkdir(exist_ok=True)

print("=" * 80)
print("🔍 FASE 2: ANÁLISE EXPLORATÓRIA DE DADOS - CISARP")
print("=" * 80)

# ==================== 1. CARREGAR DADOS ====================

print("\n📊 1. CARREGANDO DADOS")
print("-" * 80)

# 1.1 Carregar dados validados do CISARP
try:
    df_cisarp = pd.read_csv(INPUT_DIR / 'cisarp_dados_validados.csv')
    print(f"   ✅ Dados CISARP carregados: {len(df_cisarp)} registros")
except FileNotFoundError:
    print("   ⚠️ Dados validados não encontrados. Executando validação...")
    import subprocess
    subprocess.run(['python', '01_validacao_dados.py'], cwd=Path(__file__).parent)
    df_cisarp = pd.read_csv(INPUT_DIR / 'cisarp_dados_validados.csv')

# Converter colunas numéricas
for col in ['POIS', 'DEVOLUTIVAS', 'HECTARES_MAPEADOS']:
    if col in df_cisarp.columns:
        df_cisarp[col] = pd.to_numeric(df_cisarp[col], errors='coerce')

# 1.2 Carregar base completa de atividades para comparação (COM SUB-ATIVIDADES)
df_atividades = pd.read_excel(
    DADOS_DIR / 'dados_techdengue' / 'Atividades Techdengue.xlsx',
    sheet_name='Atividades (com sub)'  # ✅ ABA CORRETA - Inclui sub-atividades detalhadas
)
print(f"   ✅ Base completa carregada: {len(df_atividades)} registros (com sub-atividades)")

# 1.3 Carregar base IBGE
df_ibge = pd.read_excel(
    DADOS_DIR / 'dados_techdengue' / 'Atividades Techdengue.xlsx',
    sheet_name='IBGE'
)
print(f"   ✅ Base IBGE carregada: {len(df_ibge)} municípios")

# 1.4 Carregar dados de dengue
bases_dengue = {}
for ano in [2024, 2025]:
    try:
        df = pd.read_excel(DADOS_DIR / 'dados_dengue' / f'base.dengue.{ano}.xlsx')
        bases_dengue[ano] = df
        print(f"   ✅ Dengue {ano} carregada: {len(df)} municípios")
    except:
        print(f"   ⚠️ Dengue {ano} não disponível")

# ==================== 2. ESTATÍSTICAS DESCRITIVAS ====================

print("\n\n📈 2. ESTATÍSTICAS DESCRITIVAS")
print("-" * 80)

# 2.1 Variáveis contínuas principais
print("\n📊 2.1 Variáveis Contínuas")

variaveis_continuas = ['POIS', 'HECTARES_MAPEADOS', 'DEVOLUTIVAS']
estatisticas = {}

for var in variaveis_continuas:
    if var in df_cisarp.columns:
        dados = df_cisarp[var].dropna()
        if len(dados) > 0:
            stats = {
                'count': int(len(dados)),
                'mean': float(dados.mean()),
                'median': float(dados.median()),
                'std': float(dados.std()),
                'min': float(dados.min()),
                'max': float(dados.max()),
                'q25': float(dados.quantile(0.25)),
                'q75': float(dados.quantile(0.75)),
                'cv': float(dados.std() / dados.mean() * 100) if dados.mean() > 0 else 0
            }
            estatisticas[var] = stats
            
            print(f"\n   {var}:")
            print(f"      N:        {stats['count']}")
            print(f"      Média:    {stats['mean']:.1f}")
            print(f"      Mediana:  {stats['median']:.1f}")
            print(f"      Desvio:   {stats['std']:.1f}")
            print(f"      Min/Max:  {stats['min']:.0f} / {stats['max']:.0f}")
            print(f"      Q1/Q3:    {stats['q25']:.1f} / {stats['q75']:.1f}")
            print(f"      CV:       {stats['cv']:.1f}%")

# 2.2 Identificar outliers (método IQR)
print("\n\n📊 2.2 Detecção de Outliers (Método IQR)")

outliers_info = {}
for var in variaveis_continuas:
    if var in df_cisarp.columns:
        dados = df_cisarp[var].dropna()
        if len(dados) > 0:
            Q1 = dados.quantile(0.25)
            Q3 = dados.quantile(0.75)
            IQR = Q3 - Q1
            limite_inferior = Q1 - 1.5 * IQR
            limite_superior = Q3 + 1.5 * IQR
            
            outliers = dados[(dados < limite_inferior) | (dados > limite_superior)]
            outliers_info[var] = {
                'count': len(outliers),
                'percent': len(outliers) / len(dados) * 100,
                'limite_inf': float(limite_inferior),
                'limite_sup': float(limite_superior)
            }
            
            print(f"\n   {var}:")
            print(f"      Outliers: {len(outliers)} ({len(outliers)/len(dados)*100:.1f}%)")
            print(f"      Limites: [{limite_inferior:.1f}, {limite_superior:.1f}]")

# ==================== 3. ANÁLISE TEMPORAL ====================

print("\n\n📅 3. ANÁLISE TEMPORAL")
print("-" * 80)

# Converter datas
df_cisarp['DATA_MAP'] = pd.to_datetime(df_cisarp['DATA_MAP'], errors='coerce')
datas_validas = df_cisarp['DATA_MAP'].dropna()

if len(datas_validas) > 0:
    primeira_data = datas_validas.min()
    ultima_data = datas_validas.max()
    dias_operacao = (ultima_data - primeira_data).days
    
    print(f"\n📆 Período de Operação:")
    print(f"   Início:  {primeira_data.strftime('%d/%m/%Y')}")
    print(f"   Fim:     {ultima_data.strftime('%d/%m/%Y')}")
    print(f"   Duração: {dias_operacao} dias")
    
    # Análise por mês
    df_cisarp['ano_mes'] = df_cisarp['DATA_MAP'].dt.to_period('M')
    atividades_por_mes = df_cisarp.groupby('ano_mes').size()
    
    print(f"\n📊 Distribuição Mensal:")
    print(f"   Meses ativos: {len(atividades_por_mes)}")
    print(f"   Média/mês:    {atividades_por_mes.mean():.1f} atividades")
    print(f"   Pico:         {atividades_por_mes.max()} atividades ({atividades_por_mes.idxmax()})")
    print(f"   Mínimo:       {atividades_por_mes.min()} atividades ({atividades_por_mes.idxmin()})")
    
    # Sazonalidade
    df_cisarp['trimestre'] = df_cisarp['DATA_MAP'].dt.quarter
    atividades_por_trim = df_cisarp.groupby('trimestre').size()
    
    print(f"\n📊 Distribuição Trimestral:")
    for trim, count in atividades_por_trim.items():
        print(f"   Q{trim}: {count} atividades ({count/len(df_cisarp)*100:.1f}%)")

# ==================== 4. ANÁLISE GEOGRÁFICA ====================

print("\n\n🗺️ 4. ANÁLISE GEOGRÁFICA")
print("-" * 80)

# Identificar coluna de código IBGE
col_codigo = None
for possivel in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge']:
    if possivel in df_cisarp.columns:
        col_codigo = possivel
        break

if col_codigo:
    # Municípios únicos
    municipios_unicos = df_cisarp[col_codigo].dropna().nunique()
    print(f"\n📍 Municípios:")
    print(f"   Total único: {municipios_unicos}")
    print(f"   Atividades/município (média): {len(df_cisarp)/municipios_unicos:.1f}")
    
    # Top municípios por atividades
    top_municipios = df_cisarp[col_codigo].value_counts().head(10)
    print(f"\n🏆 Top 10 Municípios (por número de atividades):")
    for i, (codigo, count) in enumerate(top_municipios.items(), 1):
        pct = count / len(df_cisarp) * 100
        print(f"   {i:2}. Código {codigo}: {count} atividades ({pct:.1f}%)")
    
    # Agregar por município
    municipios_agg = df_cisarp.groupby(col_codigo).agg({
        'POIS': 'sum',
        'HECTARES_MAPEADOS': 'sum',
        'DEVOLUTIVAS': 'sum'
    }).reset_index()
    
    print(f"\n📊 Performance por Município (agregado):")
    print(f"   Média POIs/município:     {municipios_agg['POIS'].mean():.1f}")
    print(f"   Média hectares/município: {municipios_agg['HECTARES_MAPEADOS'].mean():.1f}")
    print(f"   Média devolutivas/mun:    {municipios_agg['DEVOLUTIVAS'].mean():.1f}")

# ==================== 5. ANÁLISE DE CATEGORIAS DE POIs ====================

print("\n\n🏷️ 5. ANÁLISE DE CATEGORIAS DE POIs")
print("-" * 80)

# Identificar colunas de categorias (começam com letra maiúscula ou contêm padrões específicos)
categorias_cols = [col for col in df_cisarp.columns 
                   if any(keyword in col.upper() for keyword in 
                         ['TERRENO', 'CAIXA', 'EDIFICACAO', 'PISCINA', 'ENTULHO', 
                          'LIXAO', 'BUEIRO', 'RESIDENCIA', 'CEMITERIO', 'BORRACHARIA'])]

if categorias_cols:
    print(f"\n📊 Categorias de POIs encontradas: {len(categorias_cols)}")
    
    # Somar todas as categorias
    categorias_totais = {}
    for col in categorias_cols:
        total = df_cisarp[col].sum() if df_cisarp[col].notna().any() else 0
        if total > 0:
            categorias_totais[col] = int(total)
    
    # Top 10 categorias
    if categorias_totais:
        top_categorias = sorted(categorias_totais.items(), key=lambda x: x[1], reverse=True)[:10]
        
        print(f"\n🏆 Top 10 Categorias de POIs:")
        total_pois_cat = sum(categorias_totais.values())
        for i, (cat, count) in enumerate(top_categorias, 1):
            pct = count / total_pois_cat * 100 if total_pois_cat > 0 else 0
            print(f"   {i:2}. {cat[:30]:30} {count:6,} ({pct:5.1f}%)")

# ==================== 6. INDICADORES CALCULADOS ====================

print("\n\n⚙️ 6. INDICADORES CALCULADOS")
print("-" * 80)

# 6.1 Taxa de conversão devolutivas
if 'POIS' in df_cisarp.columns and 'DEVOLUTIVAS' in df_cisarp.columns:
    df_cisarp['taxa_conversao'] = df_cisarp['DEVOLUTIVAS'] / df_cisarp['POIS'] * 100
    df_cisarp['taxa_conversao'] = df_cisarp['taxa_conversao'].replace([np.inf, -np.inf], np.nan)
    
    taxa_media = df_cisarp['taxa_conversao'].mean()
    print(f"\n📊 Taxa de Conversão (Devolutivas/POIs):")
    print(f"   Média: {taxa_media:.1f}%")
    print(f"   Mediana: {df_cisarp['taxa_conversao'].median():.1f}%")
    print(f"   Min/Max: {df_cisarp['taxa_conversao'].min():.1f}% / {df_cisarp['taxa_conversao'].max():.1f}%")

# 6.2 Densidade de POIs por hectare
if 'POIS' in df_cisarp.columns and 'HECTARES_MAPEADOS' in df_cisarp.columns:
    df_cisarp['densidade_pois'] = df_cisarp['POIS'] / df_cisarp['HECTARES_MAPEADOS']
    df_cisarp['densidade_pois'] = df_cisarp['densidade_pois'].replace([np.inf, -np.inf], np.nan)
    
    densidade_media = df_cisarp['densidade_pois'].mean()
    print(f"\n📊 Densidade de POIs (POIs/hectare):")
    print(f"   Média: {densidade_media:.2f} POIs/ha")
    print(f"   Mediana: {df_cisarp['densidade_pois'].median():.2f} POIs/ha")

# 6.3 Eficiência temporal
if len(datas_validas) > 0 and 'POIS' in df_cisarp.columns:
    pois_totais = df_cisarp['POIS'].sum()
    pois_por_dia = pois_totais / dias_operacao if dias_operacao > 0 else 0
    
    print(f"\n📊 Eficiência Temporal:")
    print(f"   POIs totais: {pois_totais:,.0f}")
    print(f"   POIs/dia: {pois_por_dia:.1f}")

# ==================== 7. BENCHMARKING ====================

print("\n\n🏆 7. BENCHMARKING COM OUTROS CONSÓRCIOS")
print("-" * 80)

# Agregar por contratante
benchmarking = df_atividades.groupby('CONTRATANTE').agg({
    'POIS': ['count', 'sum', 'mean'],
    'HECTARES_MAPEADOS': 'sum',
    'DEVOLUTIVAS': 'sum'
}).round(2)

benchmarking.columns = ['atividades', 'pois_total', 'pois_medio', 'hectares_total', 'devolutivas_total']
benchmarking = benchmarking.sort_values('atividades', ascending=False)

# Top 10 contratantes
print(f"\n📊 Top 10 Contratantes:")
print(f"\n{'Rank':<5}{'Contratante':<30}{'Ativ':>6}{'POIs':>10}{'Hectares':>10}{'Devol':>8}")
print("-" * 79)

for i, (contratante, row) in enumerate(benchmarking.head(10).iterrows(), 1):
    destaque = " ⭐" if contratante == 'CISARP' else ""
    print(f"{i:<5}{contratante[:28]:<30}{row['atividades']:>6.0f}{row['pois_total']:>10,.0f}"
          f"{row['hectares_total']:>10,.0f}{row['devolutivas_total']:>8,.0f}{destaque}")

# Posição do CISARP
if 'CISARP' in benchmarking.index:
    posicao_cisarp = list(benchmarking.index).index('CISARP') + 1
    total_contratantes = len(benchmarking)
    
    print(f"\n📍 Posição do CISARP:")
    print(f"   Ranking: {posicao_cisarp}º de {total_contratantes} contratantes")
    print(f"   Percentil: Top {posicao_cisarp/total_contratantes*100:.1f}%")

# ==================== 8. SALVAR RESULTADOS ====================

print("\n\n💾 8. SALVANDO RESULTADOS")
print("-" * 80)

# 8.1 Dataset completo enriquecido
df_cisarp_enriquecido = df_cisarp.copy()
output_file = OUTPUT_DIR / 'cisarp_completo.csv'
df_cisarp_enriquecido.to_csv(output_file, index=False, encoding='utf-8-sig')
print(f"   ✅ Dataset completo: {output_file}")

# 8.2 Métricas em JSON
metricas = {
    'data_analise': datetime.now().isoformat(),
    'total_atividades': len(df_cisarp),
    'municipios_unicos': int(municipios_unicos) if col_codigo else 0,
    'periodo': {
        'inicio': primeira_data.strftime('%Y-%m-%d') if len(datas_validas) > 0 else None,
        'fim': ultima_data.strftime('%Y-%m-%d') if len(datas_validas) > 0 else None,
        'dias_operacao': int(dias_operacao) if len(datas_validas) > 0 else 0
    },
    'totais': {
        'pois': int(df_cisarp['POIS'].sum()) if 'POIS' in df_cisarp.columns else 0,
        'hectares': float(df_cisarp['HECTARES_MAPEADOS'].sum()) if 'HECTARES_MAPEADOS' in df_cisarp.columns else 0,
        'devolutivas': int(df_cisarp['DEVOLUTIVAS'].sum()) if 'DEVOLUTIVAS' in df_cisarp.columns else 0
    },
    'estatisticas': estatisticas,
    'indicadores': {
        'taxa_conversao_media': float(taxa_media) if 'taxa_media' in locals() else 0,
        'densidade_pois_media': float(densidade_media) if 'densidade_media' in locals() else 0,
        'pois_por_dia': float(pois_por_dia) if 'pois_por_dia' in locals() else 0
    },
    'benchmarking': {
        'posicao_ranking': int(posicao_cisarp) if 'posicao_cisarp' in locals() else 0,
        'total_contratantes': int(total_contratantes) if 'total_contratantes' in locals() else 0
    },
    'outliers': outliers_info
}

metricas_file = OUTPUT_DIR / 'cisarp_metricas.json'
with open(metricas_file, 'w', encoding='utf-8') as f:
    json.dump(metricas, f, indent=2, ensure_ascii=False)
print(f"   ✅ Métricas JSON: {metricas_file}")

# 8.3 Sumário executivo
sumario_file = OUTPUT_DIR / 'cisarp_sumario.txt'
with open(sumario_file, 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("SUMÁRIO EXECUTIVO - ANÁLISE CISARP\n")
    f.write("="*80 + "\n\n")
    f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
    
    f.write("PRINCIPAIS INDICADORES:\n")
    f.write(f"  • Total de atividades: {len(df_cisarp)}\n")
    f.write(f"  • Municípios atendidos: {municipios_unicos if col_codigo else 'N/A'}\n")
    f.write(f"  • POIs identificados: {df_cisarp['POIS'].sum():,.0f}\n" if 'POIS' in df_cisarp.columns else "")
    f.write(f"  • Hectares mapeados: {df_cisarp['HECTARES_MAPEADOS'].sum():,.1f}\n" if 'HECTARES_MAPEADOS' in df_cisarp.columns else "")
    f.write(f"  • Devolutivas realizadas: {df_cisarp['DEVOLUTIVAS'].sum():,.0f}\n" if 'DEVOLUTIVAS' in df_cisarp.columns else "")
    
    if 'posicao_cisarp' in locals():
        f.write(f"\n  • Ranking: {posicao_cisarp}º de {total_contratantes} contratantes\n")
    
    f.write("\n" + "="*80 + "\n")
print(f"   ✅ Sumário executivo: {sumario_file}")

print("\n" + "="*80)
print("✅ FASE 2 CONCLUÍDA COM SUCESSO")
print("="*80)
print(f"\n📁 Arquivos gerados em: {OUTPUT_DIR}")
print("   - cisarp_completo.csv")
print("   - cisarp_metricas.json")
print("   - cisarp_sumario.txt")
print("\n👉 Próximo passo: Execute 03_visualizacoes.py")
print("="*80)
