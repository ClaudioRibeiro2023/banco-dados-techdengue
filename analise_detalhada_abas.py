"""
Análise detalhada da divergência entre abas
"""

import pandas as pd

excel_file = 'base_dados/dados_techdengue/Atividades Techdengue.xlsx'

print("="*80)
print("🔍 ANÁLISE COMPARATIVA ENTRE ABAS")
print("="*80)

# ABA 1: Atividades (com sub) - 108 registros CISARP
df_com_sub = pd.read_excel(excel_file, sheet_name='Atividades (com sub)')
df_cisarp_com_sub = df_com_sub[df_com_sub['CONTRATANTE'] == 'CISARP'].copy()

# ABA 2: Atividades Techdengue - 71 registros CISARP
df_techdengue = pd.read_excel(excel_file, sheet_name='Atividades Techdengue')
df_cisarp_techdengue = df_techdengue[df_techdengue['CONTRATANTE'] == 'CISARP'].copy()

print(f"\n📊 ABA 'Atividades (com sub)':")
print(f"   Total CISARP: {len(df_cisarp_com_sub)} registros")
print(f"   Colunas: {df_cisarp_com_sub.columns.tolist()}")

print(f"\n📊 ABA 'Atividades Techdengue':")
print(f"   Total CISARP: {len(df_cisarp_techdengue)} registros")
print(f"   Colunas: {df_cisarp_techdengue.columns.tolist()}")

print(f"\n🔍 DIFERENÇA: {len(df_cisarp_com_sub) - len(df_cisarp_techdengue)} registros a mais na aba 'com sub'")

# Análise da coluna SUB_ATIVIDADE
if 'SUB_ATIVIDADE' in df_cisarp_com_sub.columns:
    print(f"\n📊 Análise da coluna SUB_ATIVIDADE:")
    print(f"   Valores únicos: {df_cisarp_com_sub['SUB_ATIVIDADE'].nunique()}")
    print(f"   Valores nulos: {df_cisarp_com_sub['SUB_ATIVIDADE'].isna().sum()}")
    print(f"   Valores não-nulos: {df_cisarp_com_sub['SUB_ATIVIDADE'].notna().sum()}")
    
    print(f"\n   Exemplos de SUB_ATIVIDADE:")
    sub_values = df_cisarp_com_sub['SUB_ATIVIDADE'].value_counts().head(10)
    for val, count in sub_values.items():
        print(f"      {val}: {count} ocorrências")

# Análise por NOMENCLATURA_ATIVIDADE
if 'NOMENCLATURA_ATIVIDADE' in df_cisarp_com_sub.columns:
    print(f"\n📊 Análise por NOMENCLATURA_ATIVIDADE (aba com sub):")
    print(f"   Nomenclaturas únicas: {df_cisarp_com_sub['NOMENCLATURA_ATIVIDADE'].nunique()}")
    
    # Contar quantas linhas tem cada nomenclatura
    by_nomenclatura = df_cisarp_com_sub.groupby('NOMENCLATURA_ATIVIDADE').size()
    print(f"   Média de registros por nomenclatura: {by_nomenclatura.mean():.2f}")
    print(f"   Mediana: {by_nomenclatura.median():.1f}")
    
    # Nomenclaturas com mais de 1 registro (sub-atividades)
    com_subs = by_nomenclatura[by_nomenclatura > 1]
    print(f"\n   Nomenclaturas com sub-atividades: {len(com_subs)}")
    print(f"   Nomenclaturas sem sub-atividades: {len(by_nomenclatura) - len(com_subs)}")
    
    if len(com_subs) > 0:
        print(f"\n   Top 10 com mais sub-atividades:")
        for nom, count in com_subs.nlargest(10).items():
            print(f"      {nom}: {count} sub-atividades")

# Análise por município
if 'Municipio' in df_cisarp_com_sub.columns:
    print(f"\n📊 Distribuição por Município:")
    
    print(f"\n   ABA 'com sub':")
    mun_com_sub = df_cisarp_com_sub['Municipio'].value_counts()
    print(f"      Municípios únicos: {len(mun_com_sub)}")
    print(f"      Top 10:")
    for mun, count in mun_com_sub.head(10).items():
        print(f"         {mun}: {count} registros")

# Análise de CÓDIGO ATIVIDADE
if 'CÓDIGO ATIVIDADE' in df_cisarp_com_sub.columns:
    print(f"\n📊 Análise de CÓDIGO ATIVIDADE:")
    cod_unicos = df_cisarp_com_sub['CÓDIGO ATIVIDADE'].nunique()
    print(f"   Códigos únicos: {cod_unicos}")
    print(f"   Total de registros: {len(df_cisarp_com_sub)}")
    
    if cod_unicos < len(df_cisarp_com_sub):
        print(f"\n   ⚠️ HÁ MÚLTIPLOS REGISTROS POR CÓDIGO DE ATIVIDADE!")
        print(f"   Isso sugere que cada atividade tem sub-atividades")
        
        # Mostrar exemplo
        by_codigo = df_cisarp_com_sub.groupby('CÓDIGO ATIVIDADE').size()
        exemplos_com_subs = by_codigo[by_codigo > 1].head(3)
        
        print(f"\n   Exemplos de atividades com sub-atividades:")
        for codigo, count in exemplos_com_subs.items():
            print(f"\n      Código: {codigo} ({count} sub-atividades)")
            exemplo = df_cisarp_com_sub[df_cisarp_com_sub['CÓDIGO ATIVIDADE'] == codigo]
            for idx, row in exemplo.iterrows():
                sub = row.get('SUB_ATIVIDADE', 'N/A')
                nom = row.get('NOMENCLATURA_ATIVIDADE', 'N/A')
                mun = row.get('Municipio', 'N/A')
                print(f"         - {mun} | {nom} | Sub: {sub}")

# Comparação de nomenclaturas entre abas
print(f"\n\n📊 COMPARAÇÃO DE NOMENCLATURAS ENTRE ABAS:")

if 'NOMENCLATURA_ATIVIDADE' in df_cisarp_com_sub.columns and 'NOMENCLATURA_ATIVIDADE' in df_cisarp_techdengue.columns:
    noms_com_sub = set(df_cisarp_com_sub['NOMENCLATURA_ATIVIDADE'].unique())
    noms_techdengue = set(df_cisarp_techdengue['NOMENCLATURA_ATIVIDADE'].unique())
    
    print(f"   Nomenclaturas únicas na aba 'com sub': {len(noms_com_sub)}")
    print(f"   Nomenclaturas únicas na aba 'Techdengue': {len(noms_techdengue)}")
    
    # Verificar se são as mesmas
    if noms_com_sub == noms_techdengue:
        print(f"\n   ✅ AS NOMENCLATURAS SÃO IGUAIS!")
        print(f"   Conclusão: A aba 'com sub' explode cada atividade em sub-atividades")
    else:
        em_com_sub_nao_tech = noms_com_sub - noms_techdengue
        em_tech_nao_com_sub = noms_techdengue - noms_com_sub
        
        if em_com_sub_nao_tech:
            print(f"\n   ⚠️ Nomenclaturas APENAS na 'com sub': {len(em_com_sub_nao_tech)}")
            for nom in list(em_com_sub_nao_tech)[:5]:
                print(f"      - {nom}")
        
        if em_tech_nao_com_sub:
            print(f"\n   ⚠️ Nomenclaturas APENAS na 'Techdengue': {len(em_tech_nao_com_sub)}")
            for nom in list(em_tech_nao_com_sub)[:5]:
                print(f"      - {nom}")

print("\n" + "="*80)
print("📋 RECOMENDAÇÃO:")
print("="*80)

print(f"""
A aba 'Atividades (com sub)' tem {len(df_cisarp_com_sub)} registros porque inclui 
SUB-ATIVIDADES. Cada atividade principal pode ter múltiplas sub-atividades.

A aba 'Atividades Techdengue' tem {len(df_cisarp_techdengue)} registros porque 
consolida por atividade principal.

QUAL USAR PARA A APRESENTAÇÃO?
""")

if 'CÓDIGO ATIVIDADE' in df_cisarp_com_sub.columns:
    cod_unicos = df_cisarp_com_sub['CÓDIGO ATIVIDADE'].nunique()
    print(f"   Códigos de atividade únicos na 'com sub': {cod_unicos}")
    
    if cod_unicos == len(df_cisarp_techdengue):
        print(f"\n   ✅ RECOMENDAÇÃO: Use a aba 'Atividades (com sub)' para a análise")
        print(f"      - Tem visão detalhada de {len(df_cisarp_com_sub)} sub-atividades")
        print(f"      - Corresponde aos {cod_unicos} municípios/códigos únicos")
        print(f"      - É a fonte consolidada que você mostrou na imagem")
    else:
        print(f"\n   ⚠️ ATENÇÃO: Há discrepância entre códigos únicos e atividades")

print("\n" + "="*80)
