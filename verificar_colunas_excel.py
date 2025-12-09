import pandas as pd

df = pd.read_excel('base_dados/dados_techdengue/Atividades Techdengue.xlsx', sheet_name='IBGE')
print("Colunas da aba IBGE:")
for col in df.columns:
    print(f"  - {col}")
