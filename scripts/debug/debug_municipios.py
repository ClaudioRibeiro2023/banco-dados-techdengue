import pandas as pd

dim_mun = pd.read_parquet('dados_integrados/dim_municipios.parquet')
fato_dengue = pd.read_parquet('dados_integrados/fato_dengue_historico.parquet')

print("Comparando nomes de municípios:\n")

nomes_dim = set(dim_mun['MUNICIPIO'].str.upper().str.strip())
nomes_dengue = set(fato_dengue['MUNICIPIO'].str.upper().str.strip().unique())

print(f"Municípios em dim: {len(nomes_dim)}")
print(f"Municípios em dengue: {len(nomes_dengue)}")
print(f"Em comum: {len(nomes_dim & nomes_dengue)}")
print(f"\nExemplos dim (primeiros 5):")
print(sorted(list(nomes_dim))[:5])
print(f"\nExemplos dengue (primeiros 5):")
print(sorted(list(nomes_dengue))[:5])

# Exemplos de nomes só em dim
so_dim = nomes_dim - nomes_dengue
if len(so_dim) > 0:
    print(f"\nExemplos só em dim (primeiros 5):")
    print(sorted(list(so_dim))[:5])

# Exemplos de nomes só em dengue
so_dengue = nomes_dengue - nomes_dim
if len(so_dengue) > 0:
    print(f"\nExemplos só em dengue (primeiros 5):")
    print(sorted(list(so_dengue))[:5])
