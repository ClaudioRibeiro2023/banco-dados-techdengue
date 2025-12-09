"""
Revisão Completa de Dados - Validação Total
Garante fidelidade e integridade de todos os dados
"""
import pandas as pd
import numpy as np
from pathlib import Path
import json

BASE_DIR = Path(__file__).parent
BRONZE_DIR = BASE_DIR / "data_lake" / "bronze"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

print("="*80)
print("🔍 REVISÃO COMPLETA DE DADOS - VALIDAÇÃO TOTAL")
print("="*80)

relatorio = {
    'bronze': {},
    'silver': {},
    'gold': {},
    'problemas': [],
    'validacoes': []
}

# ============================================================================
# BRONZE
# ============================================================================

print("\n🥉 CAMADA BRONZE")
print("-" * 80)

bronze_files = {
    'banco_techdengue': BRONZE_DIR / 'banco_techdengue.parquet',
    'planilha_campo': BRONZE_DIR / 'planilha_campo.parquet',
    'atividades_excel': BRONZE_DIR / 'atividades_excel.parquet',
    'ibge_referencia': BRONZE_DIR / 'ibge_referencia.parquet',
    'dengue_historico': BRONZE_DIR / 'dengue_historico.parquet'
}

for nome, arquivo in bronze_files.items():
    if arquivo.exists():
        df = pd.read_parquet(arquivo)
        info = {
            'registros': len(df),
            'colunas': len(df.columns),
            'tamanho_mb': arquivo.stat().st_size / (1024*1024),
            'colunas_lista': list(df.columns)
        }
        relatorio['bronze'][nome] = info
        print(f"✅ {nome}: {len(df):,} registros, {len(df.columns)} colunas")
    else:
        print(f"❌ {nome}: ARQUIVO NÃO ENCONTRADO")
        relatorio['problemas'].append(f"Bronze: {nome} não encontrado")

# ============================================================================
# SILVER
# ============================================================================

print("\n🥈 CAMADA SILVER")
print("-" * 80)

silver_files = {
    'dim_municipios': SILVER_DIR / 'dim_municipios.parquet',
    'fato_pois_servidor': SILVER_DIR / 'fato_pois_servidor.parquet',
    'fato_atividades': SILVER_DIR / 'fato_atividades.parquet',
    'fato_dengue': SILVER_DIR / 'fato_dengue.parquet'
}

for nome, arquivo in silver_files.items():
    if arquivo.exists():
        df = pd.read_parquet(arquivo)
        info = {
            'registros': len(df),
            'colunas': len(df.columns),
            'tamanho_mb': arquivo.stat().st_size / (1024*1024),
            'colunas_lista': list(df.columns)
        }
        relatorio['silver'][nome] = info
        print(f"✅ {nome}: {len(df):,} registros, {len(df.columns)} colunas")
        
        # Validações específicas
        if nome == 'fato_atividades':
            if 'ANO' in df.columns:
                anos = sorted(df['ANO'].unique())
                print(f"   Anos: {anos}")
                relatorio['validacoes'].append(f"fato_atividades tem coluna ANO: {anos}")
            else:
                print(f"   ⚠️  Coluna ANO não encontrada!")
                relatorio['problemas'].append("fato_atividades sem coluna ANO")
    else:
        print(f"❌ {nome}: ARQUIVO NÃO ENCONTRADO")
        relatorio['problemas'].append(f"Silver: {nome} não encontrado")

# ============================================================================
# GOLD
# ============================================================================

print("\n🥇 CAMADA GOLD")
print("-" * 80)

mega_tabela_path = GOLD_DIR / 'mega_tabela_analitica.parquet'
if mega_tabela_path.exists():
    df_mega = pd.read_parquet(mega_tabela_path)
    
    print(f"✅ MEGA TABELA: {len(df_mega):,} registros, {len(df_mega.columns)} colunas")
    print(f"\nColunas ({len(df_mega.columns)}):")
    for i, col in enumerate(df_mega.columns, 1):
        print(f"  {i:2d}. {col}")
    
    # Análise detalhada
    print(f"\n📊 Análise Detalhada:")
    print(f"  • Municípios únicos: {df_mega['codigo_ibge'].nunique()}")
    print(f"  • Anos únicos: {sorted(df_mega['ano'].unique())}")
    print(f"  • Registros com atividades: {(df_mega['total_atividades'] > 0).sum():,}")
    print(f"  • Registros sem atividades: {(df_mega['total_atividades'] == 0).sum():,}")
    
    # Estatísticas por coluna
    print(f"\n📈 Estatísticas das Colunas Principais:")
    
    colunas_numericas = [
        'total_atividades', 'total_pois_excel', 'total_devolutivas',
        'total_hectares_mapeados', 'populacao', 'area_ha'
    ]
    
    for col in colunas_numericas:
        if col in df_mega.columns:
            nao_zero = (df_mega[col] > 0).sum()
            total = len(df_mega)
            pct = (nao_zero / total) * 100
            soma = df_mega[col].sum()
            media = df_mega[col].mean()
            print(f"  • {col}:")
            print(f"    - Não-zero: {nao_zero:,} ({pct:.1f}%)")
            print(f"    - Soma: {soma:,.2f}")
            print(f"    - Média: {media:,.2f}")
    
    # Salvar amostra
    print(f"\n💾 Salvando amostra da MEGA TABELA...")
    amostra_path = METADATA_DIR / 'amostra_mega_tabela.csv'
    df_mega.head(100).to_csv(amostra_path, index=False)
    print(f"✅ Amostra salva: {amostra_path}")
    
    relatorio['gold']['mega_tabela'] = {
        'registros': len(df_mega),
        'colunas': len(df_mega.columns),
        'tamanho_mb': mega_tabela_path.stat().st_size / (1024*1024),
        'colunas_lista': list(df_mega.columns),
        'municipios_unicos': int(df_mega['codigo_ibge'].nunique()),
        'anos': [int(x) for x in sorted(df_mega['ano'].unique())],
        'com_atividades': int((df_mega['total_atividades'] > 0).sum()),
        'sem_atividades': int((df_mega['total_atividades'] == 0).sum())
    }
else:
    print(f"❌ MEGA TABELA não encontrada!")
    relatorio['problemas'].append("MEGA TABELA não encontrada")

# ============================================================================
# VALIDAÇÕES CRUZADAS
# ============================================================================

print("\n" + "="*80)
print("🔍 VALIDAÇÕES CRUZADAS")
print("="*80)

# 1. Comparar totais
if 'fato_atividades' in relatorio['silver'] and 'mega_tabela' in relatorio['gold']:
    df_ativ = pd.read_parquet(SILVER_DIR / 'fato_atividades.parquet')
    
    total_pois_ativ = df_ativ['POIS'].sum()
    total_pois_mega = df_mega['total_pois_excel'].sum()
    
    print(f"\n1️⃣ Validação de POIs:")
    print(f"  • fato_atividades: {total_pois_ativ:,} POIs")
    print(f"  • MEGA TABELA: {total_pois_mega:,} POIs")
    
    if total_pois_ativ == total_pois_mega:
        print(f"  ✅ TOTAIS COINCIDEM!")
        relatorio['validacoes'].append("POIs: totais coincidem")
    else:
        diferenca = abs(total_pois_ativ - total_pois_mega)
        print(f"  ⚠️  Diferença: {diferenca:,} POIs")
        relatorio['problemas'].append(f"POIs: diferença de {diferenca}")
    
    # Hectares
    total_hect_ativ = df_ativ['HECTARES_MAPEADOS'].sum()
    total_hect_mega = df_mega['total_hectares_mapeados'].sum()
    
    print(f"\n2️⃣ Validação de Hectares:")
    print(f"  • fato_atividades: {total_hect_ativ:,.2f} ha")
    print(f"  • MEGA TABELA: {total_hect_mega:,.2f} ha")
    
    if abs(total_hect_ativ - total_hect_mega) < 0.01:
        print(f"  ✅ TOTAIS COINCIDEM!")
        relatorio['validacoes'].append("Hectares: totais coincidem")
    else:
        diferenca = abs(total_hect_ativ - total_hect_mega)
        print(f"  ⚠️  Diferença: {diferenca:,.2f} ha")
        relatorio['problemas'].append(f"Hectares: diferença de {diferenca:.2f}")

# ============================================================================
# SALVAR RELATÓRIO
# ============================================================================

print("\n" + "="*80)
print("💾 SALVANDO RELATÓRIO")
print("="*80)

relatorio_path = METADATA_DIR / 'revisao_completa_dados.json'
with open(relatorio_path, 'w', encoding='utf-8') as f:
    json.dump(relatorio, f, indent=2, ensure_ascii=False)

print(f"✅ Relatório salvo: {relatorio_path}")

# ============================================================================
# RESUMO FINAL
# ============================================================================

print("\n" + "="*80)
print("📊 RESUMO FINAL")
print("="*80)

print(f"\n✅ Validações Aprovadas: {len(relatorio['validacoes'])}")
for v in relatorio['validacoes']:
    print(f"  • {v}")

if relatorio['problemas']:
    print(f"\n⚠️  Problemas Encontrados: {len(relatorio['problemas'])}")
    for p in relatorio['problemas']:
        print(f"  • {p}")
else:
    print(f"\n✅ NENHUM PROBLEMA ENCONTRADO!")

print("\n" + "="*80)
print("🎉 REVISÃO COMPLETA FINALIZADA")
print("="*80)
