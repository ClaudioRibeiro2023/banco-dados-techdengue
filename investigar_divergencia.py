"""
Investigação da divergência de dados CISARP
71 vs 108 atividades
"""

import pandas as pd
import numpy as np

print("="*80)
print("🔍 INVESTIGAÇÃO: DIVERGÊNCIA DE DADOS CISARP")
print("="*80)

# Carregar TODAS as abas do arquivo
excel_file = 'base_dados/dados_techdengue/Atividades Techdengue.xlsx'

# Listar abas
xl = pd.ExcelFile(excel_file)
print(f"\n📋 Abas disponíveis no arquivo:")
for i, sheet in enumerate(xl.sheet_names, 1):
    print(f"   {i}. {sheet}")

print("\n" + "="*80)
print("ANÁLISE ABA POR ABA")
print("="*80)

# Analisar cada aba
for sheet_name in xl.sheet_names:
    print(f"\n📊 ABA: {sheet_name}")
    print("-"*80)
    
    try:
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        print(f"   Dimensões: {df.shape[0]} linhas × {df.shape[1]} colunas")
        print(f"   Colunas: {df.columns.tolist()[:10]}...")  # Primeiras 10
        
        # Procurar colunas relacionadas a CISARP/CONSORCIO/CONTRATANTE
        colunas_relevantes = [col for col in df.columns 
                            if any(keyword in str(col).upper() 
                                  for keyword in ['CISARP', 'CONSORCIO', 'CONTRATANTE', 'MUNICIPIO'])]
        
        if colunas_relevantes:
            print(f"\n   Colunas relevantes: {colunas_relevantes}")
            
            # Verificar cada coluna relevante
            for col in colunas_relevantes:
                if 'CONSORCIO' in col.upper() or 'CONTRATANTE' in col.upper():
                    valores_unicos = df[col].value_counts()
                    if 'CISARP' in valores_unicos.index:
                        count = valores_unicos['CISARP']
                        print(f"\n   ⭐ ENCONTRADO em '{col}':")
                        print(f"      CISARP: {count} registros")
                    
                    # Mostrar todos os valores que contêm CISARP
                    valores_cisarp = [v for v in valores_unicos.index if 'CISARP' in str(v).upper()]
                    if valores_cisarp:
                        print(f"\n   🔍 Valores contendo 'CISARP' em '{col}':")
                        for v in valores_cisarp:
                            print(f"      - {v}: {valores_unicos[v]} registros")
        
    except Exception as e:
        print(f"   ⚠️ Erro ao processar: {e}")

# Análise detalhada da Aba 1 (principal)
print("\n\n" + "="*80)
print("ANÁLISE DETALHADA - ABA PRINCIPAL")
print("="*80)

df_atividades = pd.read_excel(excel_file, sheet_name='Atividades Techdengue')
print(f"\nTotal de registros: {len(df_atividades)}")

# Verificar CONTRATANTE
if 'CONTRATANTE' in df_atividades.columns:
    print(f"\n📊 Distribuição por CONTRATANTE:")
    contratantes = df_atividades['CONTRATANTE'].value_counts().head(15)
    for cont, count in contratantes.items():
        print(f"   {cont:30} {count:4} atividades")
    
    # CISARP especificamente
    cisarp_count = len(df_atividades[df_atividades['CONTRATANTE'] == 'CISARP'])
    print(f"\n   ⭐ CISARP (filtro exato): {cisarp_count} atividades")
    
    # Variações de CISARP
    cisarp_like = df_atividades[df_atividades['CONTRATANTE'].str.contains('CISARP', case=False, na=False)]
    print(f"   🔍 CISARP (contém): {len(cisarp_like)} atividades")

# Verificar se existe coluna CONSORCIO
colunas_consorcio = [col for col in df_atividades.columns if 'CONSORCIO' in col.upper()]
if colunas_consorcio:
    print(f"\n📊 COLUNAS DE CONSÓRCIO ENCONTRADAS: {colunas_consorcio}")
    for col in colunas_consorcio:
        print(f"\n   Coluna: {col}")
        valores = df_atividades[col].value_counts().head(10)
        for v, c in valores.items():
            print(f"      {v}: {c}")

# Verificar se há duplicatas de atividades
if 'NOMENCLATURA_ATIVIDADE' in df_atividades.columns:
    print(f"\n📊 Análise de NOMENCLATURA_ATIVIDADE:")
    duplicatas = df_atividades['NOMENCLATURA_ATIVIDADE'].duplicated().sum()
    print(f"   Atividades duplicadas: {duplicatas}")
    
    # Verificar CISARP especificamente
    df_cisarp = df_atividades[df_atividades['CONTRATANTE'] == 'CISARP']
    if len(df_cisarp) > 0:
        print(f"\n   CISARP:")
        print(f"      Total de registros: {len(df_cisarp)}")
        print(f"      Nomenclaturas únicas: {df_cisarp['NOMENCLATURA_ATIVIDADE'].nunique()}")
        
        # Ver exemplos
        print(f"\n   Primeiros 10 registros CISARP:")
        for i, (idx, row) in enumerate(df_cisarp.head(10).iterrows(), 1):
            nomenclatura = row.get('NOMENCLATURA_ATIVIDADE', 'N/A')
            municipio = row.get('MUNICIPIO', 'N/A')
            print(f"      {i}. {municipio} - {nomenclatura}")

# Análise da 3ª aba (consolidada)
print("\n\n" + "="*80)
print("ANÁLISE ABA 3 - DADOS CONSOLIDADOS")
print("="*80)

try:
    df_aba3 = pd.read_excel(excel_file, sheet_name=xl.sheet_names[2])
    print(f"\nDimensões: {df_aba3.shape}")
    print(f"Colunas: {df_aba3.columns.tolist()}")
    
    # Procurar CISARP
    for col in df_aba3.columns:
        if df_aba3[col].dtype == 'object':
            valores_cisarp = df_aba3[df_aba3[col].astype(str).str.contains('CISARP', case=False, na=False)]
            if len(valores_cisarp) > 0:
                print(f"\n   ⭐ CISARP encontrado na coluna '{col}':")
                print(f"      Registros: {len(valores_cisarp)}")
                print(valores_cisarp.head())
except Exception as e:
    print(f"⚠️ Erro ao analisar aba 3: {e}")

print("\n" + "="*80)
print("✅ INVESTIGAÇÃO CONCLUÍDA")
print("="*80)
