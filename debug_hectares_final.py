"""
Investigação final - encontrar exatamente 142.783,05 ha
"""
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent

df = pd.read_excel(
    BASE_DIR / "base_dados" / "dados_techdengue" / "Atividades Techdengue.xlsx",
    sheet_name='Atividades (com sub)'
)

print("="*80)
print("🔍 ENCONTRANDO EXATAMENTE 142.783,05 HECTARES")
print("="*80)

# Tentar diferentes combinações de agrupamento
print("\n📊 TESTANDO DIFERENTES AGRUPAMENTOS:")
print("="*80)

# 1. Por CODIGO IBGE + DATA_MAP (ignorando atividade)
total_1 = df.groupby(['CODIGO IBGE', 'DATA_MAP'])['HECTARES_MAPEADOS'].max().sum()
print(f"1. Agrupar por (IBGE, DATA): {total_1:,.2f} ha | Diff: {abs(total_1 - 142783.05):,.2f}")

# 2. Por CODIGO IBGE + NOMENCLATURA_ATIVIDADE (ignorando data)
total_2 = df.groupby(['CODIGO IBGE', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].max().sum()
print(f"2. Agrupar por (IBGE, ATIVIDADE): {total_2:,.2f} ha | Diff: {abs(total_2 - 142783.05):,.2f}")

# 3. Por DATA_MAP + NOMENCLATURA_ATIVIDADE (ignorando IBGE)
total_3 = df.groupby(['DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].max().sum()
print(f"3. Agrupar por (DATA, ATIVIDADE): {total_3:,.2f} ha | Diff: {abs(total_3 - 142783.05):,.2f}")

# 4. Apenas por CODIGO IBGE
total_4 = df.groupby('CODIGO IBGE')['HECTARES_MAPEADOS'].sum()
print(f"4. Agrupar por IBGE (soma): {total_4.sum():,.2f} ha | Diff: {abs(total_4.sum() - 142783.05):,.2f}")

# 5. Apenas por DATA_MAP
total_5 = df.groupby('DATA_MAP')['HECTARES_MAPEADOS'].max().sum()
print(f"5. Agrupar por DATA (max): {total_5:,.2f} ha | Diff: {abs(total_5 - 142783.05):,.2f}")

# 6. Verificar se há coluna ID única
if 'ID_MINICRM' in df.columns:
    total_6 = df.groupby('ID_MINICRM')['HECTARES_MAPEADOS'].first().sum()
    print(f"6. Agrupar por ID_MINICRM: {total_6:,.2f} ha | Diff: {abs(total_6 - 142783.05):,.2f}")

# 7. Tentar com CÓDIGO ATIVIDADE
if 'CÓDIGO ATIVIDADE' in df.columns:
    # Verificar se CÓDIGO ATIVIDADE é único
    n_cod_ativ = df['CÓDIGO ATIVIDADE'].nunique()
    print(f"\n📊 CÓDIGO ATIVIDADE: {n_cod_ativ} valores únicos")
    
    # Agrupar por CÓDIGO ATIVIDADE
    total_7 = df.groupby('CÓDIGO ATIVIDADE')['HECTARES_MAPEADOS'].max().sum()
    print(f"7. Agrupar por CÓDIGO ATIVIDADE (max): {total_7:,.2f} ha | Diff: {abs(total_7 - 142783.05):,.2f}")
    
    total_7b = df.groupby('CÓDIGO ATIVIDADE')['HECTARES_MAPEADOS'].sum().sum()
    print(f"8. Agrupar por CÓDIGO ATIVIDADE (sum): {total_7b:,.2f} ha | Diff: {abs(total_7b - 142783.05):,.2f}")

# 8. Verificar se considerando apenas primeira ocorrência de cada grupo
print(f"\n📊 TESTANDO PRIMEIRA OCORRÊNCIA:")
print("="*80)

# Por diferentes chaves
chaves = [
    ['CODIGO IBGE', 'DATA_MAP'],
    ['CODIGO IBGE', 'NOMENCLATURA_ATIVIDADE'],
    ['DATA_MAP', 'NOMENCLATURA_ATIVIDADE'],
]

for chave in chaves:
    df_first = df.sort_values(chave).groupby(chave).first().reset_index()
    total = df_first['HECTARES_MAPEADOS'].sum()
    print(f"Primeira por {chave}: {total:,.2f} ha | Diff: {abs(total - 142783.05):,.2f}")

# 9. Verificar se há filtro por alguma coluna
print(f"\n📊 VERIFICANDO POSSÍVEIS FILTROS:")
print("="*80)

# Verificar valores únicos de colunas categóricas
print(f"\nCONTRATANTE: {df['CONTRATANTE'].nunique()} únicos")
print(f"Valores: {df['CONTRATANTE'].unique()[:5]}")

# Tentar filtrar por contratante específico
for contratante in df['CONTRATANTE'].unique():
    df_filt = df[df['CONTRATANTE'] == contratante]
    total_filt = df_filt.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].max().sum()
    if abs(total_filt - 142783.05) < 1:
        print(f"\n✅ ENCONTRADO! Contratante '{contratante}': {total_filt:,.2f} ha")

# 10. Verificar se métrica oficial soma tudo SEM agrupar mas com algum filtro
print(f"\n📊 VERIFICANDO SOMA DIRETA COM FILTROS:")
print("="*80)

# Filtrar apenas registros sem sub-atividade E somar
principais = df[df['SUB_ATIVIDADE'].isna() | (df['SUB_ATIVIDADE'] == '')]
total_principais = principais['HECTARES_MAPEADOS'].sum()
print(f"Soma de principais: {total_principais:,.2f} ha | Diff: {abs(total_principais - 142783.05):,.2f}")

# Filtrar registros onde SUB_ATIVIDADE contém algo específico
if df['SUB_ATIVIDADE'].notna().any():
    # Pegar apenas primeira sub de cada atividade
    df_com_sub = df[df['SUB_ATIVIDADE'].notna() & (df['SUB_ATIVIDADE'] != '')]
    df_primeira_sub = df_com_sub.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE']).first().reset_index()
    
    # Combinar principais + primeira sub
    total_combinado = principais['HECTARES_MAPEADOS'].sum() + df_primeira_sub['HECTARES_MAPEADOS'].sum()
    print(f"Principais + Primeira sub: {total_combinado:,.2f} ha | Diff: {abs(total_combinado - 142783.05):,.2f}")

print("\n" + "="*80)
print("💡 ANÁLISE FINAL")
print("="*80)

# Mostrar qual está mais próximo
resultados = {
    'Agrupar (IBGE, DATA)': total_1,
    'Agrupar (IBGE, ATIVIDADE)': total_2,
    'Agrupar (DATA, ATIVIDADE)': total_3,
}

mais_proximo = min(resultados.items(), key=lambda x: abs(x[1] - 142783.05))
print(f"\n🎯 Mais próximo: {mais_proximo[0]}")
print(f"   Valor: {mais_proximo[1]:,.2f} ha")
print(f"   Diferença: {abs(mais_proximo[1] - 142783.05):,.2f} ha ({abs(mais_proximo[1] - 142783.05) / 142783.05 * 100:.2f}%)")

if abs(mais_proximo[1] - 142783.05) < 100:
    print(f"\n✅ SOLUÇÃO ACEITÁVEL (diferença < 100 ha)")
else:
    print(f"\n⚠️  Diferença ainda significativa. Pode haver outro critério não identificado.")
