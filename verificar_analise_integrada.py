import pandas as pd

df = pd.read_parquet('dados_integrados/analise_integrada.parquet')

print("Colunas disponíveis:")
for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

print(f"\nPrimeiras 3 linhas:")
print(df.head(3))

print(f"\nColunas com 'DENGUE' no nome:")
dengue_cols = [col for col in df.columns if 'DENGUE' in col.upper()]
print(dengue_cols)

for col in dengue_cols:
    print(f"\n{col}: Total = {df[col].sum():,}")
