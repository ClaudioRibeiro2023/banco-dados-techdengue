"""
Investigar relação entre categorias de POIs
Objetivo: Entender se categorias agregadas = soma de subcategorias
"""
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent
DADOS_DIR = BASE_DIR / "dados_integrados"

print("="*80)
print("🔍 INVESTIGAÇÃO: ESTRUTURA DAS CATEGORIAS DE POIs")
print("="*80)

# Carregar dados
df = pd.read_parquet(DADOS_DIR / "fato_atividades_techdengue.parquet")

# Identificar todas as colunas de categorias
categorias_pois = [col for col in df.columns if col.startswith(('A -', 'B -', 'C -', 'D -', 'O -'))]

print(f"\n📊 {len(categorias_pois)} categorias identificadas:")
for cat in sorted(categorias_pois):
    print(f"  - {cat}")

# Separar categorias detalhadas vs agregadas
print("\n" + "="*80)
print("📊 ANÁLISE: CATEGORIAS DETALHADAS VS AGREGADAS")
print("="*80)

# Categorias que parecem agregadas (nomes genéricos)
categorias_agregadas = [
    'A - Armazenamento de água',
    'B - Pequenos depósitos móveis',
    'C - Depósitos fixos',
    'D - Depósitos passíveis de remoção',
    'Outros'
]

categorias_detalhadas = [col for col in categorias_pois if col not in categorias_agregadas]

print(f"\nCategorias AGREGADAS ({len(categorias_agregadas)}):")
for cat in categorias_agregadas:
    if cat in df.columns:
        total = df[cat].sum()
        print(f"  - {cat}: {total:,}")

print(f"\nCategorias DETALHADAS ({len(categorias_detalhadas)}):")
for cat in sorted(categorias_detalhadas):
    total = df[cat].sum()
    print(f"  - {cat}: {total:,}")

# Verificar se agregadas = soma de detalhadas
print("\n" + "="*80)
print("🔍 VERIFICAÇÃO: AGREGADAS = SOMA DE DETALHADAS?")
print("="*80)

# Tipo A
if 'A - Armazenamento de água' in df.columns:
    tipo_a_detalhadas = [
        'A - Caixa de água elevada',
        'A - Tonel, Barril, Tambor',
        'A - Poço / Cacimba'
    ]
    
    soma_a_detalhadas = sum([df[col].sum() for col in tipo_a_detalhadas if col in df.columns])
    total_a_agregada = df['A - Armazenamento de água'].sum()
    
    print(f"\nTIPO A:")
    print(f"  Soma detalhadas: {soma_a_detalhadas:,}")
    print(f"  Agregada: {total_a_agregada:,}")
    print(f"  Diferença: {abs(soma_a_detalhadas - total_a_agregada):,}")
    
    if abs(soma_a_detalhadas - total_a_agregada) < 1:
        print(f"  ✅ Agregada = Soma de detalhadas (DUPLICAÇÃO!)")
    else:
        print(f"  ❌ Agregada ≠ Soma de detalhadas")

# Tipo C
if 'C - Depósitos fixos' in df.columns:
    tipo_c_detalhadas = [
        'C - Tanques (pátios construção e mecanicas)',
        'C - Máquinas/Equip em pátios',
        'C - Piscinas e fontes'
    ]
    
    soma_c_detalhadas = sum([df[col].sum() for col in tipo_c_detalhadas if col in df.columns])
    total_c_agregada = df['C - Depósitos fixos'].sum()
    
    print(f"\nTIPO C:")
    print(f"  Soma detalhadas: {soma_c_detalhadas:,}")
    print(f"  Agregada: {total_c_agregada:,}")
    print(f"  Diferença: {abs(soma_c_detalhadas - total_c_agregada):,}")
    
    if abs(soma_c_detalhadas - total_c_agregada) < 1:
        print(f"  ✅ Agregada = Soma de detalhadas (DUPLICAÇÃO!)")
    else:
        print(f"  ❌ Agregada ≠ Soma de detalhadas")

# Tipo D
if 'D - Depósitos passíveis de remoção' in df.columns:
    tipo_d_detalhadas = [
        'D - Pneus',
        'D - Lixo (plásticos, latas, sucatas e entulhos)'
    ]
    
    soma_d_detalhadas = sum([df[col].sum() for col in tipo_d_detalhadas if col in df.columns])
    total_d_agregada = df['D - Depósitos passíveis de remoção'].sum()
    
    print(f"\nTIPO D:")
    print(f"  Soma detalhadas: {soma_d_detalhadas:,}")
    print(f"  Agregada: {total_d_agregada:,}")
    print(f"  Diferença: {abs(soma_d_detalhadas - total_d_agregada):,}")
    
    if abs(soma_d_detalhadas - total_d_agregada) < 1:
        print(f"  ✅ Agregada = Soma de detalhadas (DUPLICAÇÃO!)")
    else:
        print(f"  ❌ Agregada ≠ Soma de detalhadas")

# Calcular total correto (apenas detalhadas)
print("\n" + "="*80)
print("📊 TOTAL CORRETO DE POIs")
print("="*80)

# Somar apenas categorias detalhadas
total_detalhadas = sum([df[col].sum() for col in categorias_detalhadas])
total_pois_coluna = df['POIS'].sum()

print(f"\nSoma apenas categorias DETALHADAS: {total_detalhadas:,}")
print(f"Total na coluna POIS: {total_pois_coluna:,}")
print(f"Diferença: {abs(total_detalhadas - total_pois_coluna):,}")

if abs(total_detalhadas - total_pois_coluna) < 100:
    print(f"\n✅ CONFIRMADO: Coluna POIS = Soma de categorias DETALHADAS")
    print(f"✅ Categorias AGREGADAS são duplicações (soma das detalhadas)")
else:
    print(f"\n⚠️  Ainda há diferença. Investigar mais.")

# Recomendação
print("\n" + "="*80)
print("💡 RECOMENDAÇÃO")
print("="*80)

print(f"""
PROBLEMA IDENTIFICADO:
- Categorias agregadas (A, B, C, D, Outros) são SOMAS das categorias detalhadas
- Ao somar TODAS as categorias, estamos contando POIs 2x

SOLUÇÃO:
- Usar APENAS categorias detalhadas para análises
- OU usar APENAS categorias agregadas
- NUNCA somar ambas

PARA ANÁLISES:
- Total de POIs: {total_pois_coluna:,} (usar coluna POIS)
- Distribuição por categoria: usar categorias DETALHADAS
- Distribuição por TIPO (A, B, C, D, O): usar categorias AGREGADAS
""")

print("="*80)
