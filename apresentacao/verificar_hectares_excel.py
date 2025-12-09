"""
Script para verificar hectares no Excel de Atividades
"""
import pandas as pd
import openpyxl

# Caminho do arquivo
excel_path = r"c:\Users\claud\CascadeProjects\banco-dados-techdengue\base_dados\dados_techdengue\Atividades Techdengue.xlsx"

print("=" * 80)
print("ANÁLISE DE HECTARES - EXCEL ATIVIDADES TECHDENGUE")
print("=" * 80)
print()

try:
    # Carregar arquivo Excel
    print("Carregando arquivo Excel...")
    xls = pd.ExcelFile(excel_path)
    print(f"Abas disponíveis: {xls.sheet_names}")
    print()
    
    # Analisar cada aba
    for sheet_name in xls.sheet_names:
        print("=" * 80)
        print(f"ABA: {sheet_name}")
        print("=" * 80)
        
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        print(f"Dimensões: {df.shape[0]:,} linhas x {df.shape[1]} colunas")
        print()
        
        # Listar colunas
        print("Colunas:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i:2d}. {col}")
        print()
        
        # Procurar colunas relacionadas a hectares/área
        cols_area = [col for col in df.columns if any(
            keyword in str(col).lower() 
            for keyword in ['hectare', 'área', 'area', 'ha', 'km2', 'km²']
        )]
        
        if cols_area:
            print(f"COLUNAS RELACIONADAS A ÁREA ENCONTRADAS: {cols_area}")
            print()
            
            for col in cols_area:
                print(f"Análise de '{col}':")
                print(f"  - Tipo: {df[col].dtype}")
                print(f"  - Não-nulos: {df[col].notna().sum():,} de {len(df):,}")
                print(f"  - Valores únicos: {df[col].nunique():,}")
                
                if pd.api.types.is_numeric_dtype(df[col]):
                    print(f"  - Soma: {df[col].sum():,.2f}")
                    print(f"  - Média: {df[col].mean():,.2f}")
                    print(f"  - Min: {df[col].min():,.2f}")
                    print(f"  - Max: {df[col].max():,.2f}")
                    
                    # Amostra de valores
                    print(f"  - Amostra (primeiros 10 não-nulos):")
                    sample = df[df[col].notna()][col].head(10)
                    for idx, val in sample.items():
                        print(f"      Linha {idx}: {val:,.2f}")
                else:
                    # Mostrar valores únicos se não for numérico
                    print(f"  - Valores únicos (amostra):")
                    for val in df[col].unique()[:10]:
                        print(f"      {val}")
                print()
        else:
            print("Nenhuma coluna relacionada a área/hectares encontrada nesta aba.")
            print()
    
    # Análise específica da Aba 1 (Atividades)
    print("=" * 80)
    print("ANÁLISE DETALHADA - ABA 1 (ATIVIDADES)")
    print("=" * 80)
    
    df_ativ = pd.read_excel(excel_path, sheet_name=0)
    
    # Procurar todas as colunas numéricas
    print("COLUNAS NUMÉRICAS:")
    for col in df_ativ.select_dtypes(include=['number']).columns:
        print(f"\n{col}:")
        print(f"  Soma: {df_ativ[col].sum():,.2f}")
        print(f"  Média: {df_ativ[col].mean():,.2f}")
        print(f"  Valores únicos: {df_ativ[col].nunique()}")
    
    print()
    print("=" * 80)
    print("RESUMO FINAL")
    print("=" * 80)
    
    # Verificar se existe coluna específica de hectares
    hectare_cols = [col for col in df_ativ.columns if 'hectare' in str(col).lower() or 'ha' in str(col).lower()]
    
    if hectare_cols:
        print(f"TOTAL DE HECTARES (somando colunas encontradas):")
        for col in hectare_cols:
            if pd.api.types.is_numeric_dtype(df_ativ[col]):
                total = df_ativ[col].sum()
                print(f"  {col}: {total:,.2f} ha")
    else:
        print("Nenhuma coluna específica de hectares encontrada.")
        print("Os hectares podem estar calculados a partir de outras métricas.")
    
    print()
    print("Analise do Excel concluida!")
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
