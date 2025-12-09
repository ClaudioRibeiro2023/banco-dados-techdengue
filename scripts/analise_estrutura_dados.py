"""
Script de análise das estruturas de dados do projeto TechDengue
Analisa os arquivos Excel e gera um relatório detalhado sobre cada base de dados
"""

import pandas as pd
import os
from pathlib import Path
from datetime import datetime

# Caminhos dos arquivos
BASE_DIR = Path(r"C:\Users\claud\CascadeProjects\banco-dados-techdengue\base_dados")

DENGUE_FILES = [
    BASE_DIR / "dados_dengue" / "base.dengue.2023.xlsx",
    BASE_DIR / "dados_dengue" / "base.dengue.2024.xlsx",
    BASE_DIR / "dados_dengue" / "base.dengue.2025.xlsx",
]

TECHDENGUE_FILE = BASE_DIR / "dados_techdengue" / "Atividades Techdengue.xlsx"

def analisar_arquivo_excel(arquivo_path, nome_arquivo):
    """Analisa um arquivo Excel e retorna informações detalhadas"""
    print(f"\n{'='*80}")
    print(f"ANÁLISE: {nome_arquivo}")
    print(f"Caminho: {arquivo_path}")
    print(f"{'='*80}\n")
    
    try:
        # Verificar se arquivo existe
        if not os.path.exists(arquivo_path):
            print(f"❌ Arquivo não encontrado: {arquivo_path}")
            return
        
        # Obter informações do arquivo
        file_stats = os.stat(arquivo_path)
        print(f"📊 Tamanho do arquivo: {file_stats.st_size / 1024:.2f} KB")
        print(f"📅 Última modificação: {datetime.fromtimestamp(file_stats.st_mtime)}\n")
        
        # Ler todas as abas
        excel_file = pd.ExcelFile(arquivo_path)
        print(f"📑 Número de abas: {len(excel_file.sheet_names)}")
        print(f"📋 Nomes das abas: {', '.join(excel_file.sheet_names)}\n")
        
        # Analisar cada aba
        for sheet_name in excel_file.sheet_names:
            print(f"\n{'─'*80}")
            print(f"ABA: {sheet_name}")
            print(f"{'─'*80}")
            
            df = pd.read_excel(arquivo_path, sheet_name=sheet_name)
            
            print(f"📏 Dimensões: {df.shape[0]} linhas x {df.shape[1]} colunas")
            print(f"\n📋 Colunas ({len(df.columns)}):")
            for i, col in enumerate(df.columns, 1):
                dtype = df[col].dtype
                non_null = df[col].count()
                null_count = df[col].isna().sum()
                print(f"  {i:2d}. {col:40s} | Tipo: {str(dtype):10s} | Não-nulos: {non_null:6d} | Nulos: {null_count:6d}")
            
            # Estatísticas básicas para colunas numéricas
            numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
            if len(numeric_cols) > 0:
                print(f"\n📊 Estatísticas de colunas numéricas:")
                print(df[numeric_cols].describe().to_string())
            
            # Primeiras linhas
            print(f"\n👁️ Primeiras 3 linhas:")
            print(df.head(3).to_string())
            
            # Verificar colunas com código IBGE
            ibge_cols = [col for col in df.columns if 'ibge' in col.lower() or 'cod' in col.lower()]
            if ibge_cols:
                print(f"\n🏙️ Colunas relacionadas ao código IBGE: {', '.join(ibge_cols)}")
                for col in ibge_cols:
                    unique_count = df[col].nunique()
                    print(f"  - {col}: {unique_count} valores únicos")
            
            # Verificar colunas de data
            date_cols = [col for col in df.columns if any(term in col.lower() for term in ['data', 'date', 'semana', 'ano'])]
            if date_cols:
                print(f"\n📅 Colunas relacionadas a datas: {', '.join(date_cols)}")
            
    except Exception as e:
        print(f"❌ Erro ao analisar {arquivo_path}: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    print("╔═══════════════════════════════════════════════════════════════════════════════╗")
    print("║          ANÁLISE DETALHADA DAS BASES DE DADOS - PROJETO TECHDENGUE           ║")
    print("╚═══════════════════════════════════════════════════════════════════════════════╝")
    
    # Analisar arquivos de dengue
    print("\n\n🦟 BASES DE DADOS DE DENGUE (Histórico por Semana Epidemiológica)")
    print("="*80)
    for arquivo in DENGUE_FILES:
        ano = arquivo.stem.split('.')[-1]
        analisar_arquivo_excel(arquivo, f"Base Dengue {ano}")
    
    # Analisar arquivo do TechDengue
    print("\n\n🔬 BASE DE DADOS TECHDENGUE (Atividades do Projeto)")
    print("="*80)
    analisar_arquivo_excel(TECHDENGUE_FILE, "Atividades TechDengue")
    
    print("\n\n" + "="*80)
    print("✅ ANÁLISE CONCLUÍDA!")
    print("="*80)
    
    # Salvar relatório em arquivo
    print("\n💾 Relatório salvo em: analise_bases_dados.txt")

if __name__ == "__main__":
    main()
