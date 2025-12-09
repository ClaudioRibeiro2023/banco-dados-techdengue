"""
MÓDULO COMPLEMENTAR: Análise de Impacto Epidemiológico
Analisa correlação entre atividades TechDengue e casos de dengue
Identifica cases de sucesso específicos
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json

# Configurações
BASE_DIR = Path(__file__).parent.parent
DADOS_DIR = BASE_DIR / 'base_dados'
INPUT_DIR = Path(__file__).parent / 'dados'
OUTPUT_DIR = Path(__file__).parent / 'impacto'
OUTPUT_DIR.mkdir(exist_ok=True)

print("="*80)
print("📊 ANÁLISE DE IMPACTO EPIDEMIOLÓGICO - CISARP")
print("="*80)

# ==================== 1. CARREGAR DADOS ====================

print("\n📂 1. CARREGANDO DADOS")

# Atividades CISARP
df_cisarp = pd.read_csv(INPUT_DIR / 'cisarp_dados_validados.csv')
print(f"   ✅ Atividades CISARP: {len(df_cisarp)} registros")

# Dados de dengue
df_dengue_2024 = pd.read_excel(DADOS_DIR / 'dados_dengue' / 'base.dengue.2024.xlsx')
df_dengue_2025 = pd.read_excel(DADOS_DIR / 'dados_dengue' / 'base.dengue.2025.xlsx')
print(f"   ✅ Dengue 2024: {len(df_dengue_2024)} municípios")
print(f"   ✅ Dengue 2025: {len(df_dengue_2025)} municípios")

# Identificar códigos IBGE
col_codigo = None
for col in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge', 'Municipio']:
    if col in df_cisarp.columns:
        col_codigo = col
        break

if col_codigo:
    codigos_cisarp = set(df_cisarp[col_codigo].dropna().astype(str))
    print(f"   ✅ Municípios CISARP únicos: {len(codigos_cisarp)}")
else:
    print(f"   ⚠️ Coluna de código não encontrada. Usando outra estratégia...")
    # Tentar extrair da coluna Municipio
    codigos_cisarp = set()

# ==================== 2. ANÁLISE BEFORE-AFTER ====================

print("\n\n📊 2. ANÁLISE BEFORE-AFTER")
print("-"*80)

# Padronizar códigos
df_dengue_2024['codmun'] = df_dengue_2024['codmun'].astype(str)
df_dengue_2025['codmun'] = df_dengue_2025['codmun'].astype(str)

# Filtrar municípios CISARP
dengue_cisarp_2024 = df_dengue_2024[df_dengue_2024['codmun'].isin(codigos_cisarp)]
dengue_cisarp_2025 = df_dengue_2025[df_dengue_2025['codmun'].isin(codigos_cisarp)]

print(f"Municípios CISARP com dados de dengue:")
print(f"   2024: {len(dengue_cisarp_2024)} municípios")
print(f"   2025: {len(dengue_cisarp_2025)} municípios")

# Calcular totais
resultados = []

for codigo in codigos_cisarp:
    mun_2024 = dengue_cisarp_2024[dengue_cisarp_2024['codmun'] == codigo]
    mun_2025 = dengue_cisarp_2025[dengue_cisarp_2025['codmun'] == codigo]
    
    if len(mun_2024) > 0 and len(mun_2025) > 0:
        # ANTES: Semanas 1-48 de 2024
        cols_antes = [f'Semana {i}' for i in range(1, 49) if f'Semana {i}' in mun_2024.columns]
        casos_antes = mun_2024[cols_antes].sum(axis=1).values[0] if cols_antes else 0
        
        # DEPOIS: Semanas 49-52 de 2024 + Semanas 1-35 de 2025
        cols_depois_2024 = [f'Semana {i}' for i in range(49, 53) if f'Semana {i}' in mun_2024.columns]
        cols_depois_2025 = [f'Semana {i}' for i in range(1, 36) if f'Semana {i}' in mun_2025.columns]
        
        casos_depois = (
            mun_2024[cols_depois_2024].sum(axis=1).values[0] if cols_depois_2024 else 0
        ) + (
            mun_2025[cols_depois_2025].sum(axis=1).values[0] if cols_depois_2025 else 0
        )
        
        # Calcular variação
        if casos_antes > 0:
            variacao_pct = ((casos_depois - casos_antes) / casos_antes) * 100
        else:
            variacao_pct = np.nan
        
        nome_mun = mun_2024['Municipio'].values[0] if 'Municipio' in mun_2024.columns else codigo
        
        # Buscar intervenções
        intervencoes = df_cisarp[df_cisarp[col_codigo].astype(str) == codigo] if col_codigo else pd.DataFrame()
        num_intervencoes = len(intervencoes)
        pois_total = intervencoes['POIS'].sum() if 'POIS' in intervencoes.columns else 0
        
        resultados.append({
            'codigo_ibge': codigo,
            'municipio': nome_mun,
            'casos_antes': int(casos_antes),
            'casos_depois': int(casos_depois),
            'variacao_absoluta': int(casos_depois - casos_antes),
            'variacao_percentual': float(variacao_pct),
            'num_intervencoes': int(num_intervencoes),
            'pois_total': int(pois_total)
        })

df_resultados = pd.DataFrame(resultados)

if len(df_resultados) > 0:
    # Estatísticas gerais
    print(f"\n📊 Estatísticas Gerais (CISARP):")
    print(f"   Municípios analisados: {len(df_resultados)}")
    print(f"   Casos ANTES: {df_resultados['casos_antes'].sum():,}")
    print(f"   Casos DEPOIS: {df_resultados['casos_depois'].sum():,}")
    print(f"   Variação total: {df_resultados['variacao_absoluta'].sum():,} casos")
    print(f"   Variação média: {df_resultados['variacao_percentual'].mean():.1f}%")
    
    # Top 10 reduções
    print(f"\n🏆 TOP 10 Municípios com Maior Redução:")
    top10 = df_resultados.nsmallest(10, 'variacao_percentual')
    for i, (idx, row) in enumerate(top10.iterrows(), 1):
        print(f"   {i}. {row['municipio']}: {row['variacao_percentual']:.1f}% "
              f"({row['casos_antes']} → {row['casos_depois']} casos)")
    
    # Cases de sucesso
    cases_sucesso = df_resultados[
        (df_resultados['variacao_percentual'] < -15) &
        (df_resultados['num_intervencoes'] >= 2) &
        (df_resultados['pois_total'] >= 100)
    ]
    
    print(f"\n⭐ CASES DE SUCESSO: {len(cases_sucesso)} municípios")
    
    # Salvar
    df_resultados.to_csv(OUTPUT_DIR / 'analise_impacto.csv', index=False, encoding='utf-8-sig')
    cases_sucesso.to_csv(OUTPUT_DIR / 'cases_sucesso.csv', index=False, encoding='utf-8-sig')
    
    sumario = {
        'municipios_analisados': len(df_resultados),
        'casos_antes': int(df_resultados['casos_antes'].sum()),
        'casos_depois': int(df_resultados['casos_depois'].sum()),
        'variacao_media': float(df_resultados['variacao_percentual'].mean()),
        'cases_sucesso': len(cases_sucesso),
        'top_5': top10.head(5)[['municipio', 'variacao_percentual']].to_dict('records')
    }
    
    with open(OUTPUT_DIR / 'sumario_impacto.json', 'w', encoding='utf-8') as f:
        json.dump(sumario, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Arquivos salvos em: {OUTPUT_DIR}/")
else:
    print("\n⚠️ Nenhum município com dados completos encontrado")
    print("   Verifique correspondência de códigos IBGE")

print("\n" + "="*80)
print("✅ ANÁLISE DE IMPACTO CONCLUÍDA")
print("="*80)
