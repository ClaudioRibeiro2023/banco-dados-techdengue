import pandas as pd

# Carregar o arquivo
df = pd.read_excel('base_dados/dados_techdengue/Atividades Techdengue.xlsx', sheet_name='Atividades Techdengue')

print('Colunas disponíveis:')
print(df.columns.tolist())

print('\n=== Verificando coluna relacionada a CONSORCIO ===')
# Buscar colunas que contenham 'CONSORCIO' ou 'CONTRATANTE'
colunas_interesse = [col for col in df.columns if 'CONSORCIO' in str(col).upper() or 'CONTRATANTE' in str(col).upper()]
print(f'Colunas encontradas: {colunas_interesse}')

for col in colunas_interesse:
    print(f'\n--- {col} ---')
    print(df[col].value_counts())
