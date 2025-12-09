"""
Análise de hectares por contratante
"""
import pandas as pd

excel_path = r"c:\Users\claud\CascadeProjects\banco-dados-techdengue\base_dados\dados_techdengue\Atividades Techdengue.xlsx"

print("=" * 90)
print("HECTARES MAPEADOS POR CONTRATANTE")
print("=" * 90)
print()

# Carregar aba 1 (mais completa)
df = pd.read_excel(excel_path, sheet_name=0)

print(f"Total de atividades: {len(df):,}")
print(f"Total de hectares: {df['HECTARES_MAPEADOS'].sum():,.2f} ha")
print(f"Total de POIs: {df['POIS'].sum():,.0f}")
print()

# Agrupar por contratante
print("=" * 90)
print("HECTARES POR CONTRATANTE")
print("=" * 90)

contratantes = df.groupby('CONTRATANTE').agg({
    'HECTARES_MAPEADOS': 'sum',
    'POIS': 'sum',
    'CODIGO IBGE': 'nunique',
    'CÓDIGO ATIVIDADE': 'count'
}).reset_index()

contratantes.columns = ['Contratante', 'Hectares', 'POIs', 'Municípios', 'Atividades']
contratantes = contratantes.sort_values('Hectares', ascending=False)

print(f"{'#':>3s} {'Contratante':45s} {'Hectares':>12s} {'POIs':>8s} {'Mun':>5s} {'Ativ':>5s} {'Ha/POI':>8s}")
print("-" * 90)

for i, row in contratantes.iterrows():
    ha_poi = row['Hectares'] / row['POIs'] if row['POIs'] > 0 else 0
    print(f"{i+1:3d} {row['Contratante']:45s} {row['Hectares']:12,.0f} {row['POIs']:8,.0f} {row['Municípios']:5.0f} {row['Atividades']:5.0f} {ha_poi:8.2f}")

print("-" * 90)
print(f"{'TOTAL':48s} {contratantes['Hectares'].sum():12,.0f} {contratantes['POIs'].sum():8,.0f} {'':<5s} {contratantes['Atividades'].sum():5.0f}")

print()
print("=" * 90)

# Buscar CISARP
cisarp = contratantes[contratantes['Contratante'].str.contains('CISARP', case=False, na=False)]
if not cisarp.empty:
    print("CISARP ENCONTRADO:")
    for idx, row in cisarp.iterrows():
        print(f"  {row['Contratante']}")
        print(f"    - Hectares: {row['Hectares']:,.2f} ha")
        print(f"    - POIs: {row['POIs']:,.0f}")
        print(f"    - Municípios: {row['Municípios']:.0f}")
        print(f"    - Atividades: {row['Atividades']:.0f}")
        print(f"    - Densidade: {row['Hectares']/row['POIs']:.2f} ha/POI")

print()
print("Analise concluida!")
