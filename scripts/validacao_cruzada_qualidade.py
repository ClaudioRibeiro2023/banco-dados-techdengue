"""
Validação Cruzada de Qualidade de Dados
Garante indicadores de qualidade confiáveis através de validação cruzada
"""
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import json

BASE_DIR = Path(__file__).parent
BRONZE_DIR = BASE_DIR / "data_lake" / "bronze"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

print("="*80)
print("🔍 VALIDAÇÃO CRUZADA DE QUALIDADE DE DADOS")
print("="*80)
print(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
print("="*80)

# ============================================================================
# 1. VALIDAÇÃO: BRONZE → SILVER (Transformação)
# ============================================================================

print("\n1️⃣ Validando transformação BRONZE → SILVER...")

# Carregar dados
bronze_atividades = pd.read_parquet(BRONZE_DIR / 'atividades_excel.parquet')
silver_atividades = pd.read_parquet(SILVER_DIR / 'fato_atividades.parquet')

print(f"\n📊 Atividades:")
print(f"  Bronze: {len(bronze_atividades):,} registros")
print(f"  Silver: {len(silver_atividades):,} registros")
print(f"  Redução: {len(bronze_atividades) - len(silver_atividades):,} registros (agrupamento)")

# Validar total de POIs
total_pois_bronze = bronze_atividades['POIS'].sum()
total_pois_silver = silver_atividades['POIS'].sum()

print(f"\n📊 Total de POIs:")
print(f"  Bronze: {total_pois_bronze:,}")
print(f"  Silver: {total_pois_silver:,}")
print(f"  Diferença: {abs(total_pois_bronze - total_pois_silver):,}")

if abs(total_pois_bronze - total_pois_silver) < 100:
    print(f"  ✅ POIs preservados na transformação")
else:
    print(f"  ⚠️  Diferença significativa em POIs")

# Validar hectares (deve ser MENOR no Silver devido à correção)
total_hectares_bronze = bronze_atividades['HECTARES_MAPEADOS'].sum()
total_hectares_silver = silver_atividades['HECTARES_MAPEADOS'].sum()

print(f"\n📊 Total de Hectares:")
print(f"  Bronze: {total_hectares_bronze:,.2f} ha")
print(f"  Silver: {total_hectares_silver:,.2f} ha")
print(f"  Redução: {total_hectares_bronze - total_hectares_silver:,.2f} ha")

if total_hectares_silver < total_hectares_bronze:
    print(f"  ✅ Correção de duplicação aplicada com sucesso")
else:
    print(f"  ⚠️  Hectares não foram corrigidos")

# ============================================================================
# 2. VALIDAÇÃO: SILVER → GOLD (Agregação)
# ============================================================================

print("\n2️⃣ Validando agregação SILVER → GOLD...")

mega_tabela = pd.read_parquet(GOLD_DIR / 'mega_tabela_analitica.parquet')

# Validar total de atividades
total_atividades_silver = len(silver_atividades)
total_atividades_gold = mega_tabela['total_atividades'].sum()

print(f"\n📊 Total de Atividades:")
print(f"  Silver: {total_atividades_silver:,}")
print(f"  Gold (agregado): {total_atividades_gold:,.0f}")
print(f"  Diferença: {abs(total_atividades_silver - total_atividades_gold):,.0f}")

if abs(total_atividades_silver - total_atividades_gold) < 10:
    print(f"  ✅ Atividades preservadas na agregação")
else:
    print(f"  ⚠️  Diferença em atividades")

# Validar total de POIs
total_pois_gold = mega_tabela['total_pois_excel'].sum()

print(f"\n📊 Total de POIs:")
print(f"  Silver: {total_pois_silver:,}")
print(f"  Gold (agregado): {total_pois_gold:,.0f}")
print(f"  Diferença: {abs(total_pois_silver - total_pois_gold):,.0f}")

if abs(total_pois_silver - total_pois_gold) < 100:
    print(f"  ✅ POIs preservados na agregação")
else:
    print(f"  ⚠️  Diferença em POIs")

# Validar total de hectares
total_hectares_gold = mega_tabela['total_hectares_mapeados'].sum()

print(f"\n📊 Total de Hectares:")
print(f"  Silver: {total_hectares_silver:,.2f} ha")
print(f"  Gold (agregado): {total_hectares_gold:,.2f} ha")
print(f"  Diferença: {abs(total_hectares_silver - total_hectares_gold):,.2f} ha")

if abs(total_hectares_silver - total_hectares_gold) < 1:
    print(f"  ✅ Hectares preservados na agregação")
else:
    print(f"  ⚠️  Diferença em hectares")

# ============================================================================
# 3. VALIDAÇÃO: INTEGRIDADE REFERENCIAL
# ============================================================================

print("\n3️⃣ Validando integridade referencial...")

dim_municipios = pd.read_parquet(SILVER_DIR / 'dim_municipios.parquet')

# Verificar códigos IBGE
codigos_dim = set(dim_municipios['codigo_ibge'])
codigos_atividades = set(silver_atividades['CODIGO_IBGE'])
codigos_mega = set(mega_tabela['codigo_ibge'])

print(f"\n📊 Códigos IBGE:")
print(f"  dim_municipios: {len(codigos_dim)} únicos")
print(f"  fato_atividades: {len(codigos_atividades)} únicos")
print(f"  mega_tabela: {len(codigos_mega)} únicos")

# Órfãos
orfaos_atividades = codigos_atividades - codigos_dim
if orfaos_atividades:
    print(f"  ⚠️  {len(orfaos_atividades)} códigos em atividades sem município")
else:
    print(f"  ✅ Todos os códigos em atividades têm município")

# Verificar se mega_tabela tem todos os municípios
if codigos_mega == codigos_dim:
    print(f"  ✅ mega_tabela contém todos os municípios")
else:
    faltando = codigos_dim - codigos_mega
    print(f"  ⚠️  {len(faltando)} municípios faltando na mega_tabela")

# ============================================================================
# 4. VALIDAÇÃO: COMPLETUDE DOS DADOS
# ============================================================================

print("\n4️⃣ Validando completude dos dados...")

# Completude da MEGA TABELA
print(f"\n📊 Completude da MEGA TABELA:")

colunas_criticas = [
    'codigo_ibge', 'municipio', 'ano', 'populacao', 'area_ha',
    'total_atividades', 'total_pois_excel', 'total_hectares_mapeados'
]

for col in colunas_criticas:
    if col in mega_tabela.columns:
        nulos = mega_tabela[col].isnull().sum()
        completude = (1 - nulos / len(mega_tabela)) * 100
        status = "✅" if completude == 100 else "⚠️"
        print(f"  {status} {col}: {completude:.1f}% completo")

# ============================================================================
# 5. VALIDAÇÃO: CONSISTÊNCIA DE VALORES
# ============================================================================

print("\n5️⃣ Validando consistência de valores...")

# Verificar valores negativos
print(f"\n📊 Valores negativos (não devem existir):")

colunas_positivas = ['total_atividades', 'total_pois_excel', 'total_devolutivas', 
                     'total_hectares_mapeados', 'populacao', 'area_ha']

tem_negativos = False
for col in colunas_positivas:
    if col in mega_tabela.columns:
        negativos = (mega_tabela[col] < 0).sum()
        if negativos > 0:
            print(f"  ⚠️  {col}: {negativos} valores negativos")
            tem_negativos = True

if not tem_negativos:
    print(f"  ✅ Nenhum valor negativo encontrado")

# Verificar outliers
print(f"\n📊 Outliers (valores extremos):")

# Taxa de conversão deve estar entre 0-100%
if 'taxa_conversao_devolutivas' in mega_tabela.columns:
    outliers_taxa = ((mega_tabela['taxa_conversao_devolutivas'] < 0) | 
                     (mega_tabela['taxa_conversao_devolutivas'] > 100)).sum()
    if outliers_taxa > 0:
        print(f"  ⚠️  taxa_conversao_devolutivas: {outliers_taxa} valores fora de 0-100%")
    else:
        print(f"  ✅ taxa_conversao_devolutivas: todos os valores entre 0-100%")

# ============================================================================
# 6. VALIDAÇÃO: MÉTRICAS OFICIAIS
# ============================================================================

print("\n6️⃣ Validando contra métricas oficiais...")

# Métrica oficial de hectares
metrica_oficial_hectares = 142783.05
total_hectares_calculado = mega_tabela['total_hectares_mapeados'].sum()
diferenca_hectares = abs(total_hectares_calculado - metrica_oficial_hectares)
percentual_diferenca = (diferenca_hectares / metrica_oficial_hectares) * 100

print(f"\n📊 Hectares Mapeados:")
print(f"  Métrica oficial: {metrica_oficial_hectares:,.2f} ha")
print(f"  Calculado: {total_hectares_calculado:,.2f} ha")
print(f"  Diferença: {diferenca_hectares:,.2f} ha ({percentual_diferenca:.2f}%)")

if percentual_diferenca < 5:
    print(f"  ✅ Diferença aceitável (< 5%)")
else:
    print(f"  ⚠️  Diferença significativa (> 5%)")

# ============================================================================
# 7. VALIDAÇÃO: DADOS DO SERVIDOR
# ============================================================================

print("\n7️⃣ Validando dados do servidor PostgreSQL...")

fato_pois_servidor = pd.read_parquet(SILVER_DIR / 'fato_pois_servidor.parquet')

print(f"\n📊 POIs do Servidor:")
print(f"  Total de POIs: {len(fato_pois_servidor):,}")
print(f"  Com coordenadas: {((fato_pois_servidor['latitude'].notna()) & (fato_pois_servidor['longitude'].notna())).sum():,}")
print(f"  Com geometria: {fato_pois_servidor['geometria_json'].notna().sum():,}")

# Validar coordenadas
coords_validas = (
    (fato_pois_servidor['latitude'] >= -90) & 
    (fato_pois_servidor['latitude'] <= 90) &
    (fato_pois_servidor['longitude'] >= -180) & 
    (fato_pois_servidor['longitude'] <= 180)
).sum()

print(f"  Coordenadas válidas: {coords_validas:,} ({coords_validas/len(fato_pois_servidor)*100:.1f}%)")

if coords_validas == len(fato_pois_servidor):
    print(f"  ✅ Todas as coordenadas são válidas")
else:
    print(f"  ⚠️  Algumas coordenadas inválidas")

# ============================================================================
# 8. GERAR RELATÓRIO DE QUALIDADE
# ============================================================================

print("\n8️⃣ Gerando relatório de qualidade...")

relatorio_qualidade = {
    'data_validacao': datetime.now().isoformat(),
    'versao': '1.0.0',
    
    'transformacao_bronze_silver': {
        'atividades_bronze': len(bronze_atividades),
        'atividades_silver': len(silver_atividades),
        'reducao_registros': len(bronze_atividades) - len(silver_atividades),
        'pois_preservados': abs(total_pois_bronze - total_pois_silver) < 100,
        'hectares_corrigidos': total_hectares_silver < total_hectares_bronze
    },
    
    'agregacao_silver_gold': {
        'atividades_preservadas': abs(total_atividades_silver - total_atividades_gold) < 10,
        'pois_preservados': abs(total_pois_silver - total_pois_gold) < 100,
        'hectares_preservados': abs(total_hectares_silver - total_hectares_gold) < 1
    },
    
    'integridade_referencial': {
        'municipios_dim': len(codigos_dim),
        'municipios_atividades': len(codigos_atividades),
        'municipios_mega_tabela': len(codigos_mega),
        'orfaos_atividades': len(orfaos_atividades),
        'todos_municipios_presentes': codigos_mega == codigos_dim
    },
    
    'metricas_oficiais': {
        'hectares_oficial': metrica_oficial_hectares,
        'hectares_calculado': float(total_hectares_calculado),
        'diferenca_percentual': float(percentual_diferenca),
        'dentro_tolerancia': percentual_diferenca < 5
    },
    
    'servidor_postgresql': {
        'total_pois': len(fato_pois_servidor),
        'com_coordenadas': int(((fato_pois_servidor['latitude'].notna()) & (fato_pois_servidor['longitude'].notna())).sum()),
        'coordenadas_validas': int(coords_validas),
        'percentual_valido': float(coords_validas/len(fato_pois_servidor)*100)
    },
    
    'score_qualidade_geral': 0  # Será calculado
}

# Calcular score de qualidade (0-100)
checks_passed = 0
checks_total = 0

# Transformação
checks_total += 3
if relatorio_qualidade['transformacao_bronze_silver']['pois_preservados']:
    checks_passed += 1
if relatorio_qualidade['transformacao_bronze_silver']['hectares_corrigidos']:
    checks_passed += 1
if relatorio_qualidade['transformacao_bronze_silver']['reducao_registros'] > 0:
    checks_passed += 1

# Agregação
checks_total += 3
if relatorio_qualidade['agregacao_silver_gold']['atividades_preservadas']:
    checks_passed += 1
if relatorio_qualidade['agregacao_silver_gold']['pois_preservados']:
    checks_passed += 1
if relatorio_qualidade['agregacao_silver_gold']['hectares_preservados']:
    checks_passed += 1

# Integridade
checks_total += 2
if relatorio_qualidade['integridade_referencial']['orfaos_atividades'] == 0:
    checks_passed += 1
if relatorio_qualidade['integridade_referencial']['todos_municipios_presentes']:
    checks_passed += 1

# Métricas oficiais
checks_total += 1
if relatorio_qualidade['metricas_oficiais']['dentro_tolerancia']:
    checks_passed += 1

# Servidor
checks_total += 1
if relatorio_qualidade['servidor_postgresql']['percentual_valido'] > 99:
    checks_passed += 1

score_qualidade = (checks_passed / checks_total) * 100
relatorio_qualidade['score_qualidade_geral'] = round(score_qualidade, 2)
relatorio_qualidade['checks_passed'] = checks_passed
relatorio_qualidade['checks_total'] = checks_total

# Salvar relatório
relatorio_path = METADATA_DIR / 'relatorio_qualidade_completo.json'
with open(relatorio_path, 'w', encoding='utf-8') as f:
    json.dump(relatorio_qualidade, f, indent=2, default=str)

print(f"✅ Relatório salvo em: {relatorio_path}")

# ============================================================================
# 9. RESULTADO FINAL
# ============================================================================

print("\n" + "="*80)
print("📊 RESULTADO DA VALIDAÇÃO CRUZADA")
print("="*80)

print(f"\n🎯 SCORE DE QUALIDADE GERAL: {score_qualidade:.1f}%")
print(f"   Checks aprovados: {checks_passed}/{checks_total}")

if score_qualidade >= 90:
    print(f"\n✅ QUALIDADE EXCELENTE - Dados confiáveis para análises")
elif score_qualidade >= 75:
    print(f"\n⚠️  QUALIDADE BOA - Alguns ajustes recomendados")
else:
    print(f"\n❌ QUALIDADE INSUFICIENTE - Revisão necessária")

print("\n" + "="*80)
print("✅ VALIDAÇÃO CRUZADA CONCLUÍDA")
print("="*80)
