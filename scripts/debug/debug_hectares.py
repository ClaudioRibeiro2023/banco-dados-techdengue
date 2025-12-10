"""
Script para investigar anomalia nos hectares mapeados
"""
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent

# Carregar dados
print("="*80)
print("🔍 INVESTIGANDO ANOMALIA - HECTARES MAPEADOS")
print("="*80)

df = pd.read_excel(
    BASE_DIR / "base_dados" / "dados_techdengue" / "Atividades Techdengue.xlsx",
    sheet_name='Atividades (com sub)'
)

print(f"\n📊 Total de registros: {len(df)}")
print(f"📊 Colunas disponíveis: {list(df.columns)}")

# Verificar coluna de hectares
col_hectares = None
for col in df.columns:
    if 'HECTARE' in col.upper() or 'AREA' in col.upper():
        print(f"\n✓ Coluna encontrada: {col}")
        col_hectares = col

if col_hectares:
    # Análise 1: Separador decimal
    print(f"\n{'='*80}")
    print("ANÁLISE 1: SEPARADOR DECIMAL")
    print("="*80)
    
    print(f"\nPrimeiros 10 valores de {col_hectares}:")
    print(df[col_hectares].head(10))
    
    print(f"\nTipo da coluna: {df[col_hectares].dtype}")
    
    # Tentar converter com vírgula
    if df[col_hectares].dtype == 'object':
        print("\n⚠️  Coluna é texto! Tentando converter...")
        
        # Substituir vírgula por ponto
        df['HECTARES_CORRIGIDO'] = df[col_hectares].astype(str).str.replace(',', '.', regex=False)
        df['HECTARES_CORRIGIDO'] = pd.to_numeric(df['HECTARES_CORRIGIDO'], errors='coerce')
        
        print(f"Valores após conversão (primeiros 10):")
        print(df['HECTARES_CORRIGIDO'].head(10))
    else:
        df['HECTARES_CORRIGIDO'] = pd.to_numeric(df[col_hectares], errors='coerce')
    
    # Análise 2: Atividades vs Sub-atividades
    print(f"\n{'='*80}")
    print("ANÁLISE 2: ATIVIDADES PRINCIPAIS VS SUB-ATIVIDADES")
    print("="*80)
    
    # Verificar se existe coluna de sub-atividade
    col_sub = None
    for col in df.columns:
        if 'SUB' in col.upper():
            col_sub = col
            break
    
    if col_sub:
        print(f"\n✓ Coluna de sub-atividade: {col_sub}")
        
        # Contar atividades principais (sem sub)
        principais = df[df[col_sub].isna() | (df[col_sub] == '')]
        com_sub = df[df[col_sub].notna() & (df[col_sub] != '')]
        
        print(f"\nAtividades PRINCIPAIS (sem sub): {len(principais)}")
        print(f"Atividades COM SUB: {len(com_sub)}")
        
        # Calcular total de hectares
        print(f"\n{'='*80}")
        print("ANÁLISE 3: TOTAL DE HECTARES")
        print("="*80)
        
        total_todos = df['HECTARES_CORRIGIDO'].sum()
        total_principais = principais['HECTARES_CORRIGIDO'].sum()
        total_com_sub = com_sub['HECTARES_CORRIGIDO'].sum()
        
        print(f"\n❌ INCORRETO - Somando TODOS os registros: {total_todos:,.2f} hectares")
        print(f"✅ CORRETO - Somando apenas PRINCIPAIS: {total_principais:,.2f} hectares")
        print(f"   (Sub-atividades): {total_com_sub:,.2f} hectares")
        
        print(f"\n📊 MÉTRICA OFICIAL: 142.783,05 hectares")
        print(f"📊 Diferença (principais): {abs(total_principais - 142783.05):,.2f} hectares")
        
        # Análise 4: Verificar duplicação
        print(f"\n{'='*80}")
        print("ANÁLISE 4: EXEMPLO DE DUPLICAÇÃO")
        print("="*80)
        
        # Pegar primeira atividade com sub
        if len(com_sub) > 0:
            primeiro_cod = com_sub.iloc[0]['CODIGO_IBGE'] if 'CODIGO_IBGE' in com_sub.columns else com_sub.iloc[0]['CODIGO IBGE']
            primeira_data = com_sub.iloc[0]['DATA_MAP']
            
            exemplo = df[
                (df['CODIGO_IBGE' if 'CODIGO_IBGE' in df.columns else 'CODIGO IBGE'] == primeiro_cod) &
                (df['DATA_MAP'] == primeira_data)
            ]
            
            print(f"\nExemplo - Município {primeiro_cod}, Data {primeira_data}:")
            print(f"Total de registros: {len(exemplo)}")
            
            if 'NOMENCLATURA_ATIVIDADE' in exemplo.columns:
                print(f"\nAtividades:")
                for idx, row in exemplo.iterrows():
                    sub = row[col_sub] if pd.notna(row[col_sub]) else '(principal)'
                    hectares = row['HECTARES_CORRIGIDO']
                    print(f"  - {row['NOMENCLATURA_ATIVIDADE']} / {sub}: {hectares:.2f} ha")
            
            print(f"\n⚠️  Se somarmos todos: {exemplo['HECTARES_CORRIGIDO'].sum():.2f} ha")
            print(f"✅  Deveria ser apenas: {principais[principais['DATA_MAP'] == primeira_data]['HECTARES_CORRIGIDO'].iloc[0] if len(principais[principais['DATA_MAP'] == primeira_data]) > 0 else 0:.2f} ha")
    
    # Análise 5: Solução proposta
    print(f"\n{'='*80}")
    print("ANÁLISE 5: SOLUÇÃO PROPOSTA")
    print("="*80)
    
    print("""
PROBLEMA IDENTIFICADO:
1. ✓ Separador decimal: vírgula → ponto (resolvido)
2. ✓ Duplicação: Sub-atividades repetem hectares da atividade principal

SOLUÇÃO:
- Considerar apenas atividades PRINCIPAIS (sem sub-atividade)
- OU agrupar por (CODIGO_IBGE, DATA_MAP, NOMENCLATURA_ATIVIDADE) e pegar MAX(hectares)

IMPACTOS:
- TOTAL_HECTARES na tabela analise_integrada
- Densidade de POIs (POIs/hectare)
- Produtividade
- Todas as análises que usam hectares
    """)

else:
    print("\n❌ Coluna de hectares não encontrada!")

print("\n" + "="*80)
