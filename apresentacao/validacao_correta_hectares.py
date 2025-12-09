"""
Validação correta de hectares - removendo duplicação de subatividades
"""
import pandas as pd

excel_path = r"c:\Users\claud\CascadeProjects\banco-dados-techdengue\base_dados\dados_techdengue\Atividades Techdengue.xlsx"

print("=" * 90)
print("VALIDAÇÃO CORRETA DE HECTARES - SEM DUPLICAÇÃO")
print("=" * 90)
print()

# Carregar aba 2 (sem subatividades duplicadas)
print("Analisando Aba 2 'Atividades Techdengue' (sem duplicação)...")
df_aba2 = pd.read_excel(excel_path, sheet_name=1)

print(f"Total de linhas Aba 2: {len(df_aba2):,}")
print(f"Colunas: {list(df_aba2.columns)}")
print()

# Verificar coluna de hectares
if 'HECTARES_MAPEADOS' in df_aba2.columns:
    # Converter para numérico (estava como object)
    df_aba2['HECTARES_MAPEADOS_NUM'] = pd.to_numeric(df_aba2['HECTARES_MAPEADOS'], errors='coerce')
    
    total_hectares = df_aba2['HECTARES_MAPEADOS_NUM'].sum()
    print(f"TOTAL HECTARES (Aba 2 - sem duplicação): {total_hectares:,.2f} ha")
    print()
    
    # Por contratante
    print("=" * 90)
    print("HECTARES POR CONTRATANTE (SEM DUPLICAÇÃO)")
    print("=" * 90)
    
    contratantes = df_aba2.groupby('CONTRATANTE').agg({
        'HECTARES_MAPEADOS_NUM': 'sum',
        'POIS': 'sum',
        'NOMENCLATURA_ATIVIDADE': 'count'
    }).reset_index()
    
    contratantes.columns = ['Contratante', 'Hectares', 'POIs', 'Atividades']
    contratantes = contratantes.sort_values('Hectares', ascending=False)
    
    print(f"{'#':>3s} {'Contratante':35s} {'Hectares':>12s} {'POIs':>8s} {'Ativ':>5s} {'Ha/POI':>8s}")
    print("-" * 90)
    
    for i, row in contratantes.head(20).iterrows():
        ha_poi = row['Hectares'] / row['POIs'] if row['POIs'] > 0 else 0
        print(f"{i+1:3d} {row['Contratante']:35s} {row['Hectares']:12,.2f} {row['POIs']:8,.0f} {row['Atividades']:5.0f} {ha_poi:8.2f}")
    
    print("-" * 90)
    print(f"{'TOTAL':38s} {contratantes['Hectares'].sum():12,.2f} {contratantes['POIs'].sum():8,.0f}")
    print()
    
    # Buscar CISARP
    print("=" * 90)
    print("CISARP - VALORES CORRETOS")
    print("=" * 90)
    cisarp = contratantes[contratantes['Contratante'].str.contains('CISARP', case=False, na=False)]
    if not cisarp.empty:
        for idx, row in cisarp.iterrows():
            print(f"Contratante: {row['Contratante']}")
            print(f"  Hectares: {row['Hectares']:,.2f} ha")
            print(f"  POIs: {row['POIs']:,.0f}")
            print(f"  Atividades: {row['Atividades']:.0f}")
            print(f"  Densidade: {row['Hectares']/row['POIs']:.2f} ha/POI")
    print()
    
    # Comparação com valores reais
    print("=" * 90)
    print("COMPARAÇÃO COM VALORES REAIS FORNECIDOS")
    print("=" * 90)
    print()
    print("VALORES REAIS (fornecidos pelo usuário):")
    print("  Total MG até 30 set:     125.864,04 ha")
    print("  Total MG até 31 out:     142.783,05 ha")
    print("  CISARP até 30 set:         4.868,00 ha")
    print("  CISARP até 31 out:         5.976,00 ha")
    print()
    print("VALORES NO EXCEL (Aba 2 - sem duplicação):")
    print(f"  Total MG:                {total_hectares:,.2f} ha")
    
    if not cisarp.empty:
        cisarp_ha = cisarp.iloc[0]['Hectares']
        print(f"  CISARP:                  {cisarp_ha:,.2f} ha")
        print()
        
        # Verificar qual período está mais próximo
        diff_set = abs(total_hectares - 125864.04)
        diff_out = abs(total_hectares - 142783.05)
        
        print("DIFERENÇAS:")
        print(f"  vs 30 set: {diff_set:+,.2f} ha")
        print(f"  vs 31 out: {diff_out:+,.2f} ha")
        print()
        
        if diff_set < diff_out:
            print("  -> Excel parece estar mais próximo dos dados de 30 SET")
            ref_total = 125864.04
            ref_cisarp = 4868.00
        else:
            print("  -> Excel parece estar mais próximo dos dados de 31 OUT")
            ref_total = 142783.05
            ref_cisarp = 5976.00
        
        print()
        print("VALIDAÇÃO FINAL:")
        print(f"  Total MG Excel:     {total_hectares:12,.2f} ha")
        print(f"  Total MG Real:      {ref_total:12,.2f} ha")
        print(f"  Diferença:          {total_hectares - ref_total:+12,.2f} ha ({((total_hectares/ref_total - 1) * 100):+.1f}%)")
        print()
        print(f"  CISARP Excel:       {cisarp_ha:12,.2f} ha")
        print(f"  CISARP Real:        {ref_cisarp:12,.2f} ha")
        print(f"  Diferença:          {cisarp_ha - ref_cisarp:+12,.2f} ha ({((cisarp_ha/ref_cisarp - 1) * 100):+.1f}%)")

print()
print("Analise concluida!")
