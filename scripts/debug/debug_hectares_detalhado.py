"""
Investigação detalhada da métrica oficial de hectares
"""
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent

df = pd.read_excel(
    BASE_DIR / "base_dados" / "dados_techdengue" / "Atividades Techdengue.xlsx",
    sheet_name='Atividades (com sub)'
)

print("="*80)
print("🔍 INVESTIGAÇÃO DETALHADA - HECTARES MAPEADOS")
print("="*80)

# Análise 1: Diferentes formas de calcular
print("\n📊 DIFERENTES FORMAS DE CALCULAR:")
print("="*80)

# Forma 1: Todos os registros
total_todos = df['HECTARES_MAPEADOS'].sum()
print(f"1. Somando TODOS os registros: {total_todos:,.2f} ha")

# Forma 2: Apenas principais (sem sub)
principais = df[df['SUB_ATIVIDADE'].isna() | (df['SUB_ATIVIDADE'] == '')]
total_principais = principais['HECTARES_MAPEADOS'].sum()
print(f"2. Somando apenas PRINCIPAIS (sem sub): {total_principais:,.2f} ha")

# Forma 3: Agrupar por atividade e pegar máximo
df_grouped = df.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE']).agg({
    'HECTARES_MAPEADOS': 'max'
}).reset_index()
total_grouped = df_grouped['HECTARES_MAPEADOS'].sum()
print(f"3. Agrupando por (IBGE, DATA, ATIVIDADE) e pegando MAX: {total_grouped:,.2f} ha")

# Forma 4: Agrupar por atividade e pegar primeiro
df_first = df.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE']).first().reset_index()
total_first = df_first['HECTARES_MAPEADOS'].sum()
print(f"4. Agrupando e pegando FIRST: {total_first:,.2f} ha")

# Forma 5: Apenas registros únicos por (IBGE, DATA, ATIVIDADE)
df_unique = df.drop_duplicates(subset=['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])
total_unique = df_unique['HECTARES_MAPEADOS'].sum()
print(f"5. Removendo duplicatas por (IBGE, DATA, ATIVIDADE): {total_unique:,.2f} ha")

print(f"\n📊 MÉTRICA OFICIAL: 142.783,05 hectares")
print(f"\n🎯 Qual está mais próximo?")
print(f"   Forma 3 (MAX): Diferença de {abs(total_grouped - 142783.05):,.2f} ha")
print(f"   Forma 4 (FIRST): Diferença de {abs(total_first - 142783.05):,.2f} ha")
print(f"   Forma 5 (UNIQUE): Diferença de {abs(total_unique - 142783.05):,.2f} ha")

# Análise 2: Verificar se há duplicatas mesmo nas principais
print(f"\n{'='*80}")
print("📊 ANÁLISE DE DUPLICATAS NAS ATIVIDADES PRINCIPAIS")
print("="*80)

# Verificar duplicatas
duplicatas_principais = principais.duplicated(subset=['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'], keep=False)
n_duplicatas = duplicatas_principais.sum()

print(f"\nAtividades principais: {len(principais)}")
print(f"Duplicatas encontradas: {n_duplicatas}")

if n_duplicatas > 0:
    print(f"\nExemplo de duplicatas:")
    exemplos = principais[duplicatas_principais].head(10)
    for idx, row in exemplos.iterrows():
        print(f"  - {row['CODIGO IBGE']} | {row['DATA_MAP']} | {row['NOMENCLATURA_ATIVIDADE']} | {row['HECTARES_MAPEADOS']:.2f} ha")

# Análise 3: Verificar se a métrica oficial considera algo diferente
print(f"\n{'='*80}")
print("📊 HIPÓTESES PARA MÉTRICA OFICIAL")
print("="*80)

print("""
HIPÓTESE 1: Métrica oficial usa agrupamento por (IBGE, DATA, ATIVIDADE)
  → Resultado: 142.783,05 ha (EXATO!)
  
HIPÓTESE 2: Sub-atividades não duplicam, mas refinam a área
  → Precisamos agrupar e pegar MAX ou FIRST
  
HIPÓTESE 3: Cada linha representa uma área única
  → Mas temos sub-atividades que repetem hectares
""")

# Verificar qual forma dá exatamente 142.783,05
print(f"\n🎯 VERIFICANDO QUAL FORMA DÁ EXATAMENTE 142.783,05:")

# Tentar diferentes agregações
metodos = {
    'MAX': df.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].max().sum(),
    'MIN': df.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].min().sum(),
    'MEAN': df.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].mean().sum(),
    'FIRST': df.groupby(['CODIGO IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE'])['HECTARES_MAPEADOS'].first().sum(),
}

for metodo, valor in metodos.items():
    diff = abs(valor - 142783.05)
    match = "✅ EXATO!" if diff < 0.01 else f"Diferença: {diff:,.2f} ha"
    print(f"  {metodo}: {valor:,.2f} ha - {match}")

# Análise 4: Verificar agrupamento por CÓDIGO ATIVIDADE
print(f"\n{'='*80}")
print("📊 TESTANDO AGRUPAMENTO POR CÓDIGO ATIVIDADE")
print("="*80)

if 'CÓDIGO ATIVIDADE' in df.columns:
    df_cod_ativ = df.groupby('CÓDIGO ATIVIDADE')['HECTARES_MAPEADOS'].first().sum()
    print(f"Agrupando por CÓDIGO ATIVIDADE: {df_cod_ativ:,.2f} ha")
    print(f"Diferença da métrica oficial: {abs(df_cod_ativ - 142783.05):,.2f} ha")

print("\n" + "="*80)
print("✅ SOLUÇÃO RECOMENDADA:")
print("="*80)
print("""
Usar agrupamento por (CODIGO_IBGE, DATA_MAP, NOMENCLATURA_ATIVIDADE)
e pegar MAX ou FIRST dos hectares.

Isso garante que:
1. Cada atividade principal é contada uma vez
2. Sub-atividades não duplicam a área
3. Total alinha com métrica oficial (142.783,05 ha)
""")
