"""
FASE 1: VALIDAÇÃO E QUALIDADE DOS DADOS
Valida integridade das bases antes da análise do CISARP
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json
from pathlib import Path

# Configurações
BASE_DIR = Path(__file__).parent.parent
DADOS_DIR = BASE_DIR / 'base_dados'
OUTPUT_DIR = Path(__file__).parent / 'dados'
OUTPUT_DIR.mkdir(exist_ok=True)

print("=" * 80)
print("🔍 FASE 1: VALIDAÇÃO E QUALIDADE DOS DADOS - CISARP")
print("=" * 80)

# ==================== 1. VALIDAÇÃO DAS BASES EXCEL ====================

print("\n📊 1. VALIDANDO BASES EXCEL")
print("-" * 80)

# 1.1 Base de Atividades TechDengue (COM SUB-ATIVIDADES)
print("\n📁 1.1 Base de Atividades TechDengue (versão detalhada)")
try:
    df_atividades = pd.read_excel(
        DADOS_DIR / 'dados_techdengue' / 'Atividades Techdengue.xlsx',
        sheet_name='Atividades (com sub)'  # ✅ ABA CORRETA - Inclui sub-atividades
    )
    print(f"   ✅ Carregado: {len(df_atividades):,} registros")
    print(f"   ✅ Colunas: {len(df_atividades.columns)}")
    print(f"   ✅ Memória: {df_atividades.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    # Verificar colunas críticas
    colunas_criticas = ['CONTRATANTE', 'POIS', 'DEVOLUTIVAS', 'HECTARES_MAPEADOS', 'DATA_MAP']
    for col in colunas_criticas:
        if col in df_atividades.columns:
            missing_pct = (df_atividades[col].isna().sum() / len(df_atividades)) * 100
            print(f"   {'✅' if missing_pct < 5 else '⚠️'} {col}: {missing_pct:.1f}% missing")
        else:
            print(f"   ❌ {col}: COLUNA NÃO ENCONTRADA")
    
except Exception as e:
    print(f"   ❌ ERRO: {e}")
    exit(1)

# 1.2 Base IBGE
print("\n📁 1.2 Base IBGE (Aba 2)")
try:
    df_ibge = pd.read_excel(
        DADOS_DIR / 'dados_techdengue' / 'Atividades Techdengue.xlsx',
        sheet_name='IBGE'
    )
    print(f"   ✅ Carregado: {len(df_ibge):,} municípios")
    print(f"   ✅ Colunas: {len(df_ibge.columns)}")
    
except Exception as e:
    print(f"   ❌ ERRO: {e}")
    exit(1)

# 1.3 Bases de Dengue
print("\n📁 1.3 Bases de Dengue")
bases_dengue = {}
for ano in [2023, 2024, 2025]:
    try:
        df = pd.read_excel(DADOS_DIR / 'dados_dengue' / f'base.dengue.{ano}.xlsx')
        bases_dengue[ano] = df
        print(f"   ✅ {ano}: {len(df):,} municípios")
    except Exception as e:
        print(f"   ⚠️ {ano}: Não disponível ({e})")

# ==================== 2. VALIDAÇÃO ESPECÍFICA CISARP ====================

print("\n\n🎯 2. VALIDAÇÃO ESPECÍFICA CISARP")
print("-" * 80)

# Filtrar dados do CISARP
df_cisarp = df_atividades[df_atividades['CONTRATANTE'] == 'CISARP'].copy()

# Converter colunas numéricas
for col in ['POIS', 'DEVOLUTIVAS', 'HECTARES_MAPEADOS']:
    if col in df_cisarp.columns:
        df_cisarp[col] = pd.to_numeric(df_cisarp[col], errors='coerce')

print(f"\n📊 Total de atividades CISARP: {len(df_cisarp)}")

# 2.1 Completude de dados críticos
print("\n📋 2.1 Completude de Dados Críticos")
for col in ['POIS', 'DEVOLUTIVAS', 'HECTARES_MAPEADOS', 'DATA_MAP']:
    if col in df_cisarp.columns:
        total = len(df_cisarp)
        validos = df_cisarp[col].notna().sum()
        pct = (validos / total) * 100
        print(f"   {col:25} {validos:3}/{total:3} ({pct:5.1f}%)")

# 2.2 Estatísticas descritivas rápidas
print("\n📈 2.2 Estatísticas Rápidas (CISARP)")
if 'POIS' in df_cisarp.columns:
    print(f"   POIs totais: {df_cisarp['POIS'].sum():,}")
    print(f"   POIs médios: {df_cisarp['POIS'].mean():.1f}")
    print(f"   POIs mediana: {df_cisarp['POIS'].median():.1f}")

if 'HECTARES_MAPEADOS' in df_cisarp.columns:
    print(f"   Hectares totais: {df_cisarp['HECTARES_MAPEADOS'].sum():,.1f}")
    print(f"   Hectares médios: {df_cisarp['HECTARES_MAPEADOS'].mean():.1f}")

if 'DEVOLUTIVAS' in df_cisarp.columns:
    print(f"   Devolutivas totais: {df_cisarp['DEVOLUTIVAS'].sum():,}")

# 2.3 Análise temporal
print("\n📅 2.3 Período de Atividades")
if 'DATA_MAP' in df_cisarp.columns:
    df_cisarp['DATA_MAP'] = pd.to_datetime(df_cisarp['DATA_MAP'], errors='coerce')
    datas_validas = df_cisarp['DATA_MAP'].dropna()
    if len(datas_validas) > 0:
        print(f"   Primeira atividade: {datas_validas.min().strftime('%d/%m/%Y')}")
        print(f"   Última atividade: {datas_validas.max().strftime('%d/%m/%Y')}")
        dias_operacao = (datas_validas.max() - datas_validas.min()).days
        print(f"   Dias de operação: {dias_operacao}")

# ==================== 3. VALIDAÇÃO DE RELACIONAMENTOS ====================

print("\n\n🔗 3. VALIDAÇÃO DE RELACIONAMENTOS")
print("-" * 80)

# 3.1 Verificar códigos IBGE
print("\n📍 3.1 Códigos IBGE")

# Extrair códigos únicos de cada base
codigos_atividades = set()
codigos_ibge = set()
codigos_dengue = set()

# Da base de atividades
if 'CODIGO IBGE' in df_atividades.columns:
    codigos_atividades = set(df_atividades['CODIGO IBGE'].dropna().astype(str))
elif 'Código IBGE' in df_atividades.columns:
    codigos_atividades = set(df_atividades['Código IBGE'].dropna().astype(str))

# Da base IBGE
if 'CODIGO IBGE' in df_ibge.columns:
    codigos_ibge = set(df_ibge['CODIGO IBGE'].dropna().astype(str))
elif 'Código IBGE' in df_ibge.columns:
    codigos_ibge = set(df_ibge['Código IBGE'].dropna().astype(str))

# Da base de dengue (2024 como referência)
if 2024 in bases_dengue:
    if 'codmun' in bases_dengue[2024].columns:
        codigos_dengue = set(bases_dengue[2024]['codmun'].dropna().astype(str))

print(f"   Códigos únicos em Atividades: {len(codigos_atividades)}")
print(f"   Códigos únicos em IBGE: {len(codigos_ibge)}")
print(f"   Códigos únicos em Dengue 2024: {len(codigos_dengue)}")

# Taxa de correlação
if codigos_atividades and codigos_ibge:
    correlacao_ativ_ibge = len(codigos_atividades & codigos_ibge) / len(codigos_atividades) * 100
    print(f"   Taxa correlação Atividades-IBGE: {correlacao_ativ_ibge:.1f}%")

if codigos_atividades and codigos_dengue:
    correlacao_ativ_dengue = len(codigos_atividades & codigos_dengue) / len(codigos_atividades) * 100
    print(f"   Taxa correlação Atividades-Dengue: {correlacao_ativ_dengue:.1f}%")

# 3.2 Municípios CISARP específicos
print("\n📍 3.2 Municípios do CISARP")
# Identificar coluna de código IBGE no CISARP
col_codigo = None
for possivel in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge']:
    if possivel in df_cisarp.columns:
        col_codigo = possivel
        break

if col_codigo:
    municipios_cisarp = df_cisarp[col_codigo].dropna().astype(str).unique()
    print(f"   Municípios únicos no CISARP: {len(municipios_cisarp)}")
    
    # Verificar se todos têm correspondência no IBGE
    municipios_cisarp_set = set(municipios_cisarp)
    if codigos_ibge:
        com_ibge = len(municipios_cisarp_set & codigos_ibge)
        print(f"   Com dados IBGE: {com_ibge}/{len(municipios_cisarp)}")
    
    if codigos_dengue:
        com_dengue = len(municipios_cisarp_set & codigos_dengue)
        print(f"   Com dados Dengue: {com_dengue}/{len(municipios_cisarp)}")

# ==================== 4. SCORE DE QUALIDADE ====================

print("\n\n⭐ 4. SCORE DE QUALIDADE DOS DADOS")
print("-" * 80)

scores = []

# 4.1 Completude (peso 40%)
completude_pois = (df_cisarp['POIS'].notna().sum() / len(df_cisarp)) * 100 if 'POIS' in df_cisarp.columns else 0
completude_hectares = (df_cisarp['HECTARES_MAPEADOS'].notna().sum() / len(df_cisarp)) * 100 if 'HECTARES_MAPEADOS' in df_cisarp.columns else 0
completude_devolutivas = (df_cisarp['DEVOLUTIVAS'].notna().sum() / len(df_cisarp)) * 100 if 'DEVOLUTIVAS' in df_cisarp.columns else 0
completude_data = (df_cisarp['DATA_MAP'].notna().sum() / len(df_cisarp)) * 100 if 'DATA_MAP' in df_cisarp.columns else 0

score_completude = np.mean([completude_pois, completude_hectares, completude_devolutivas, completude_data])
scores.append(('Completude', score_completude, 0.40))
print(f"   Completude: {score_completude:.1f}%")

# 4.2 Correlação (peso 30%)
score_correlacao = correlacao_ativ_ibge if 'correlacao_ativ_ibge' in locals() else 0
scores.append(('Correlação IBGE', score_correlacao, 0.30))
print(f"   Correlação IBGE: {score_correlacao:.1f}%")

# 4.3 Consistência (peso 20%)
# Verificar se valores fazem sentido
consistencia_checks = []
if 'POIS' in df_cisarp.columns:
    pois_validos = ((df_cisarp['POIS'] >= 0) & (df_cisarp['POIS'] <= 10000)).sum()
    consistencia_checks.append(pois_validos / len(df_cisarp) * 100)

if 'HECTARES_MAPEADOS' in df_cisarp.columns:
    hectares_validos = ((df_cisarp['HECTARES_MAPEADOS'] >= 0) & (df_cisarp['HECTARES_MAPEADOS'] <= 10000)).sum()
    consistencia_checks.append(hectares_validos / len(df_cisarp) * 100)

score_consistencia = np.mean(consistencia_checks) if consistencia_checks else 0
scores.append(('Consistência', score_consistencia, 0.20))
print(f"   Consistência: {score_consistencia:.1f}%")

# 4.4 Unicidade (peso 10%)
# Verificar duplicatas
duplicatas = df_cisarp.duplicated().sum()
score_unicidade = ((len(df_cisarp) - duplicatas) / len(df_cisarp)) * 100
scores.append(('Unicidade', score_unicidade, 0.10))
print(f"   Unicidade: {score_unicidade:.1f}%")

# Score final
score_final = sum([score * peso for _, score, peso in scores])
print(f"\n{'='*80}")
print(f"   🎯 SCORE FINAL DE QUALIDADE: {score_final:.1f}%")
print(f"{'='*80}")

# ==================== 5. DECISÃO GO/NO-GO ====================

print("\n\n🚦 5. DECISÃO GO/NO-GO")
print("-" * 80)

criterios = {
    'Score de qualidade ≥ 85%': score_final >= 85,
    'Missing em campos críticos < 5%': score_completude >= 95,
    'Correlação IBGE ≥ 95%': score_correlacao >= 95,
    'Registros CISARP > 0': len(df_cisarp) > 0
}

print("\n📋 Critérios de Aceitação:")
for criterio, passou in criterios.items():
    status = "✅ PASSOU" if passou else "❌ FALHOU"
    print(f"   {status} - {criterio}")

decisao = all(criterios.values())
print("\n" + "="*80)
if decisao:
    print("   ✅ DECISÃO: GO - Dados aprovados para análise")
else:
    print("   ⚠️ DECISÃO: GO COM RESSALVAS - Dados utilizáveis mas com limitações")
print("="*80)

# ==================== 6. SALVAR RESULTADOS ====================

print("\n\n💾 6. SALVANDO RESULTADOS")
print("-" * 80)

# 6.1 Salvar dados do CISARP limpos
df_cisarp_output = df_cisarp.copy()
output_file = OUTPUT_DIR / 'cisarp_dados_validados.csv'
df_cisarp_output.to_csv(output_file, index=False, encoding='utf-8-sig')
print(f"   ✅ Dados CISARP salvos: {output_file}")

# 6.2 Salvar relatório de validação em JSON
relatorio = {
    'data_validacao': datetime.now().isoformat(),
    'total_atividades_cisarp': len(df_cisarp),
    'score_qualidade': {
        'final': round(score_final, 2),
        'completude': round(score_completude, 2),
        'correlacao': round(score_correlacao, 2),
        'consistencia': round(score_consistencia, 2),
        'unicidade': round(score_unicidade, 2)
    },
    'estatisticas': {
        'pois_totais': int(df_cisarp['POIS'].sum()) if 'POIS' in df_cisarp.columns else 0,
        'hectares_totais': float(df_cisarp['HECTARES_MAPEADOS'].sum()) if 'HECTARES_MAPEADOS' in df_cisarp.columns else 0,
        'devolutivas_totais': int(df_cisarp['DEVOLUTIVAS'].sum()) if 'DEVOLUTIVAS' in df_cisarp.columns else 0
    },
    'decisao_go_no_go': bool(decisao),
    'criterios': {k: bool(v) for k, v in criterios.items()}
}

relatorio_file = OUTPUT_DIR / 'validacao_relatorio.json'
with open(relatorio_file, 'w', encoding='utf-8') as f:
    json.dump(relatorio, f, indent=2, ensure_ascii=False)
print(f"   ✅ Relatório JSON salvo: {relatorio_file}")

# 6.3 Salvar log detalhado
log_file = OUTPUT_DIR / 'validacao_log.txt'
with open(log_file, 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("RELATÓRIO DE VALIDAÇÃO - CISARP\n")
    f.write("="*80 + "\n\n")
    f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
    f.write(f"Total de atividades CISARP: {len(df_cisarp)}\n\n")
    f.write(f"SCORE FINAL DE QUALIDADE: {score_final:.1f}%\n\n")
    f.write("Detalhamento:\n")
    for nome, score, peso in scores:
        f.write(f"  - {nome}: {score:.1f}% (peso {peso*100:.0f}%)\n")
    f.write(f"\nDecisão: {'GO' if decisao else 'GO COM RESSALVAS'}\n")
print(f"   ✅ Log detalhado salvo: {log_file}")

print("\n" + "="*80)
print("✅ FASE 1 CONCLUÍDA COM SUCESSO")
print("="*80)
print(f"\n📁 Arquivos gerados em: {OUTPUT_DIR}")
print("   - cisarp_dados_validados.csv")
print("   - validacao_relatorio.json")
print("   - validacao_log.txt")
print("\n👉 Próximo passo: Execute 02_analise_cisarp.py")
print("="*80)
