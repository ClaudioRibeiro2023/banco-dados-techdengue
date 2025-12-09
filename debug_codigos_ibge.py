import pandas as pd

# Carregar as tabelas
dim_mun = pd.read_parquet('dados_integrados/dim_municipios.parquet')
fato_dengue = pd.read_parquet('dados_integrados/fato_dengue_historico.parquet')

print("=" * 80)
print("ANÁLISE DOS CÓDIGOS IBGE")
print("=" * 80)

print("\n1. dim_municipios:")
print(f"   Total de registros: {len(dim_mun)}")
print(f"   Tipo CODIGO_IBGE: {dim_mun['CODIGO_IBGE'].dtype}")
print(f"   Exemplo de códigos:")
print(dim_mun['CODIGO_IBGE'].head(5).tolist())

print("\n2. fato_dengue_historico:")
print(f"   Total de registros: {len(fato_dengue)}")
print(f"   Tipo CODIGO_IBGE: {fato_dengue['CODIGO_IBGE'].dtype}")
print(f"   Exemplo de códigos:")
print(fato_dengue['CODIGO_IBGE'].head(5).tolist())

print("\n3. Total de casos em fato_dengue:")
print(f"   Total geral: {fato_dengue['CASOS'].sum():,}")
print(f"   Ano 2024: {fato_dengue[fato_dengue['ANO'] == 2024]['CASOS'].sum():,}")

print("\n4. Comparando códigos:")
codigos_dim = set(dim_mun['CODIGO_IBGE'].astype(str))
codigos_dengue = set(fato_dengue['CODIGO_IBGE'].astype(str).unique())

print(f"   Códigos únicos em dim_municipios: {len(codigos_dim)}")
print(f"   Códigos únicos em fato_dengue: {len(codigos_dengue)}")
print(f"   Códigos em comum: {len(codigos_dim & codigos_dengue)}")
print(f"   Só em dim: {len(codigos_dim - codigos_dengue)}")
print(f"   Só em dengue: {len(codigos_dengue - codigos_dim)}")

if len(codigos_dim - codigos_dengue) > 0:
    print(f"\n   Exemplos de códigos só em dim (primeiros 5):")
    print(list(codigos_dim - codigos_dengue)[:5])

if len(codigos_dengue - codigos_dim) > 0:
    print(f"\n   Exemplos de códigos só em dengue (primeiros 5):")
    print(list(codigos_dengue - codigos_dim)[:5])
