import pandas as pd

print("Verificando colunas dos arquivos de dengue:\n")

df_2024 = pd.read_excel('base_dados/dados_dengue/base.dengue.2024.xlsx')
print("Primeiras 10 colunas do arquivo de dengue 2024:")
for i, col in enumerate(df_2024.columns[:10], 1):
    print(f"  {i}. {col}")

print(f"\nTotal de colunas: {len(df_2024.columns)}")
print(f"Total de linhas: {len(df_2024)}")
print(f"\nPrimeiras 2 linhas:")
print(df_2024.head(2))
