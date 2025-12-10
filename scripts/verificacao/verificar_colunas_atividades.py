import pandas as pd

df = pd.read_excel('base_dados/dados_techdengue/Atividades Techdengue.xlsx', sheet_name='Atividades (com sub)')

print("Colunas da aba 'Atividades (com sub)':\n")
for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

print(f"\nTotal de colunas: {len(df.columns)}")
print(f"Total de linhas: {len(df)}")
