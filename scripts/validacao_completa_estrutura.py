"""
Validação Completa da Estrutura de Base de Dados
Garante que todas as tabelas necessárias foram criadas
"""
import pandas as pd
from pathlib import Path
import json

BASE_DIR = Path(__file__).parent
BRONZE_DIR = BASE_DIR / "data_lake" / "bronze"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

print("="*80)
print("🔍 VALIDAÇÃO COMPLETA DA ESTRUTURA DE BASE DE DADOS")
print("="*80)

# ============================================================================
# 1. VERIFICAR ESTRUTURA DE DIRETÓRIOS
# ============================================================================

print("\n1️⃣ Verificando estrutura de diretórios...")

diretorios_necessarios = {
    'Bronze': BRONZE_DIR,
    'Silver': SILVER_DIR,
    'Gold': GOLD_DIR,
    'Metadata': METADATA_DIR
}

todos_existem = True
for nome, caminho in diretorios_necessarios.items():
    existe = caminho.exists()
    status = "✅" if existe else "❌"
    print(f"  {status} {nome}: {caminho}")
    if not existe:
        todos_existem = False

if not todos_existem:
    print("\n❌ ERRO: Alguns diretórios não existem!")
    exit(1)

# ============================================================================
# 2. VERIFICAR TABELAS BRONZE
# ============================================================================

print("\n2️⃣ Verificando tabelas BRONZE (dados brutos)...")

tabelas_bronze = {
    'banco_techdengue': 'POIs do servidor PostgreSQL',
    'planilha_campo': 'Registros de campo do servidor',
    'atividades_excel': 'Atividades do Excel',
    'ibge_referencia': 'Referência de municípios IBGE',
    'dengue_historico': 'Histórico de casos de dengue'
}

bronze_ok = True
bronze_stats = {}

for tabela, descricao in tabelas_bronze.items():
    arquivo = BRONZE_DIR / f"{tabela}.parquet"
    existe = arquivo.exists()
    
    if existe:
        df = pd.read_parquet(arquivo)
        bronze_stats[tabela] = {
            'registros': len(df),
            'colunas': len(df.columns),
            'tamanho_mb': arquivo.stat().st_size / 1024 / 1024
        }
        print(f"  ✅ {tabela}: {len(df):,} registros, {len(df.columns)} colunas")
    else:
        print(f"  ❌ {tabela}: ARQUIVO NÃO ENCONTRADO")
        bronze_ok = False

if not bronze_ok:
    print("\n❌ ERRO: Algumas tabelas Bronze não existem!")
    exit(1)

# ============================================================================
# 3. VERIFICAR TABELAS SILVER
# ============================================================================

print("\n3️⃣ Verificando tabelas SILVER (dados limpos)...")

tabelas_silver = {
    'dim_municipios': 'Dimensão de municípios',
    'fato_pois_servidor': 'Fato de POIs do servidor',
    'fato_atividades': 'Fato de atividades',
    'fato_dengue': 'Fato de casos de dengue'
}

silver_ok = True
silver_stats = {}

for tabela, descricao in tabelas_silver.items():
    arquivo = SILVER_DIR / f"{tabela}.parquet"
    existe = arquivo.exists()
    
    if existe:
        df = pd.read_parquet(arquivo)
        silver_stats[tabela] = {
            'registros': len(df),
            'colunas': len(df.columns),
            'tamanho_mb': arquivo.stat().st_size / 1024 / 1024
        }
        print(f"  ✅ {tabela}: {len(df):,} registros, {len(df.columns)} colunas")
    else:
        print(f"  ❌ {tabela}: ARQUIVO NÃO ENCONTRADO")
        silver_ok = False

if not silver_ok:
    print("\n❌ ERRO: Algumas tabelas Silver não existem!")
    exit(1)

# ============================================================================
# 4. VERIFICAR TABELAS GOLD
# ============================================================================

print("\n4️⃣ Verificando tabelas GOLD (dados analíticos)...")

tabelas_gold = {
    'mega_tabela_analitica': 'MEGA TABELA analítica completa'
}

gold_ok = True
gold_stats = {}

for tabela, descricao in tabelas_gold.items():
    arquivo_parquet = GOLD_DIR / f"{tabela}.parquet"
    arquivo_csv = GOLD_DIR / f"{tabela}.csv"
    
    existe_parquet = arquivo_parquet.exists()
    existe_csv = arquivo_csv.exists()
    
    if existe_parquet:
        df = pd.read_parquet(arquivo_parquet)
        gold_stats[tabela] = {
            'registros': len(df),
            'colunas': len(df.columns),
            'tamanho_mb': arquivo_parquet.stat().st_size / 1024 / 1024
        }
        print(f"  ✅ {tabela}.parquet: {len(df):,} registros, {len(df.columns)} colunas")
        
        if existe_csv:
            print(f"  ✅ {tabela}.csv: disponível")
        else:
            print(f"  ⚠️  {tabela}.csv: não encontrado")
    else:
        print(f"  ❌ {tabela}: ARQUIVO NÃO ENCONTRADO")
        gold_ok = False

if not gold_ok:
    print("\n❌ ERRO: Algumas tabelas Gold não existem!")
    exit(1)

# ============================================================================
# 5. VERIFICAR METADADOS
# ============================================================================

print("\n5️⃣ Verificando metadados...")

metadados_necessarios = {
    'data_lineage.json': 'Rastreabilidade de dados',
    'quality_report.csv': 'Relatório de qualidade',
    'dicionario_mega_tabela.csv': 'Dicionário de dados'
}

metadata_ok = True

for arquivo, descricao in metadados_necessarios.items():
    caminho = METADATA_DIR / arquivo
    existe = caminho.exists()
    status = "✅" if existe else "❌"
    print(f"  {status} {arquivo}: {descricao}")
    if not existe:
        metadata_ok = False

if not metadata_ok:
    print("\n⚠️  AVISO: Alguns metadados não existem (não crítico)")

# ============================================================================
# 6. RESUMO DA VALIDAÇÃO
# ============================================================================

print("\n" + "="*80)
print("📊 RESUMO DA VALIDAÇÃO")
print("="*80)

print(f"\n🥉 BRONZE (Dados Brutos):")
for tabela, stats in bronze_stats.items():
    print(f"  • {tabela}: {stats['registros']:,} registros, {stats['tamanho_mb']:.2f} MB")

print(f"\n🥈 SILVER (Dados Limpos):")
for tabela, stats in silver_stats.items():
    print(f"  • {tabela}: {stats['registros']:,} registros, {stats['tamanho_mb']:.2f} MB")

print(f"\n🥇 GOLD (Dados Analíticos):")
for tabela, stats in gold_stats.items():
    print(f"  • {tabela}: {stats['registros']:,} registros, {stats['tamanho_mb']:.2f} MB")

# Totais
total_registros_bronze = sum(s['registros'] for s in bronze_stats.values())
total_registros_silver = sum(s['registros'] for s in silver_stats.values())
total_registros_gold = sum(s['registros'] for s in gold_stats.values())

total_tamanho = (
    sum(s['tamanho_mb'] for s in bronze_stats.values()) +
    sum(s['tamanho_mb'] for s in silver_stats.values()) +
    sum(s['tamanho_mb'] for s in gold_stats.values())
)

print(f"\n📈 TOTAIS:")
print(f"  • Total de registros (Bronze): {total_registros_bronze:,}")
print(f"  • Total de registros (Silver): {total_registros_silver:,}")
print(f"  • Total de registros (Gold): {total_registros_gold:,}")
print(f"  • Tamanho total: {total_tamanho:.2f} MB")

# ============================================================================
# 7. VERIFICAR INTEGRIDADE REFERENCIAL
# ============================================================================

print("\n" + "="*80)
print("🔗 VERIFICANDO INTEGRIDADE REFERENCIAL")
print("="*80)

# Carregar tabelas
dim_municipios = pd.read_parquet(SILVER_DIR / 'dim_municipios.parquet')
fato_atividades = pd.read_parquet(SILVER_DIR / 'fato_atividades.parquet')
mega_tabela = pd.read_parquet(GOLD_DIR / 'mega_tabela_analitica.parquet')

# Verificar códigos IBGE
print(f"\n1. Códigos IBGE:")
print(f"  • dim_municipios: {dim_municipios['codigo_ibge'].nunique()} únicos")
print(f"  • fato_atividades: {fato_atividades['CODIGO_IBGE'].nunique()} únicos")
print(f"  • mega_tabela: {mega_tabela['codigo_ibge'].nunique()} únicos")

# Verificar órfãos
atividades_sem_municipio = set(fato_atividades['CODIGO_IBGE']) - set(dim_municipios['codigo_ibge'])
if atividades_sem_municipio:
    print(f"  ⚠️  {len(atividades_sem_municipio)} códigos IBGE em atividades sem município correspondente")
else:
    print(f"  ✅ Todos os códigos IBGE em atividades têm município correspondente")

# ============================================================================
# 8. RESULTADO FINAL
# ============================================================================

print("\n" + "="*80)
print("✅ VALIDAÇÃO COMPLETA CONCLUÍDA")
print("="*80)

resultado = {
    'diretorios': todos_existem,
    'bronze': bronze_ok,
    'silver': silver_ok,
    'gold': gold_ok,
    'metadata': metadata_ok,
    'total_tabelas': len(bronze_stats) + len(silver_stats) + len(gold_stats),
    'total_registros': total_registros_bronze + total_registros_silver + total_registros_gold,
    'total_tamanho_mb': total_tamanho
}

# Salvar resultado
resultado_path = METADATA_DIR / 'validacao_estrutura.json'
with open(resultado_path, 'w', encoding='utf-8') as f:
    json.dump(resultado, f, indent=2, default=str)

print(f"\n✅ Estrutura completa e validada!")
print(f"📄 Resultado salvo em: {resultado_path}")

if todos_existem and bronze_ok and silver_ok and gold_ok:
    print("\n🎉 TODAS AS TABELAS NECESSÁRIAS FORAM CRIADAS COM SUCESSO!")
    exit(0)
else:
    print("\n❌ ALGUMAS TABELAS ESTÃO FALTANDO!")
    exit(1)
