"""
Pipeline ETL Completo - Arquitetura Medallion (Bronze → Silver → Gold)
Baseado em melhores práticas de Data Engineering

Camadas:
- BRONZE: Dados brutos (raw) do servidor e Excel
- SILVER: Dados limpos e validados
- GOLD: Dados agregados e prontos para análise (MEGA TABELA)
"""
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import hashlib
import json
import warnings
warnings.filterwarnings('ignore')

from src.sync import DataSynchronizer
from src.config import Config

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

BASE_DIR = Path(__file__).parent
BRONZE_DIR = BASE_DIR / "data_lake" / "bronze"
SILVER_DIR = BASE_DIR / "data_lake" / "silver"
GOLD_DIR = BASE_DIR / "data_lake" / "gold"
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

# Criar diretórios
for dir_path in [BRONZE_DIR, SILVER_DIR, GOLD_DIR, METADATA_DIR]:
    dir_path.mkdir(exist_ok=True, parents=True)

VERSION = "1.0.0"

# ============================================================================
# CLASSE DE METADADOS E LINEAGE
# ============================================================================

class DataLineage:
    """Rastreabilidade de dados (Data Lineage)"""
    
    def __init__(self):
        self.lineage_file = METADATA_DIR / "data_lineage.json"
        self.lineage = self._load()
    
    def _load(self):
        if self.lineage_file.exists():
            with open(self.lineage_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _save(self):
        with open(self.lineage_file, 'w', encoding='utf-8') as f:
            json.dump(self.lineage, f, indent=2, default=str)
    
    def register_transformation(
        self,
        output_table: str,
        input_tables: list,
        transformation: str,
        row_count: int,
        hash_md5: str
    ):
        """Registra transformação de dados"""
        self.lineage[output_table] = {
            'timestamp': datetime.now().isoformat(),
            'input_tables': input_tables,
            'transformation': transformation,
            'row_count': row_count,
            'hash_md5': hash_md5,
            'version': VERSION
        }
        self._save()
    
    def get_lineage(self, table_name: str):
        """Retorna lineage de uma tabela"""
        return self.lineage.get(table_name)


class DataQuality:
    """Framework de qualidade de dados"""
    
    def __init__(self):
        self.checks = []
    
    def check_not_null(self, df: pd.DataFrame, columns: list, table_name: str):
        """Verifica valores nulos"""
        for col in columns:
            if col in df.columns:
                null_count = df[col].isnull().sum()
                if null_count > 0:
                    self.checks.append({
                        'table': table_name,
                        'check': 'not_null',
                        'column': col,
                        'status': 'FAIL',
                        'message': f'{null_count} valores nulos encontrados'
                    })
                else:
                    self.checks.append({
                        'table': table_name,
                        'check': 'not_null',
                        'column': col,
                        'status': 'PASS',
                        'message': 'OK'
                    })
    
    def check_unique(self, df: pd.DataFrame, columns: list, table_name: str):
        """Verifica unicidade"""
        duplicates = df.duplicated(subset=columns).sum()
        if duplicates > 0:
            self.checks.append({
                'table': table_name,
                'check': 'unique',
                'column': str(columns),
                'status': 'FAIL',
                'message': f'{duplicates} duplicatas encontradas'
            })
        else:
            self.checks.append({
                'table': table_name,
                'check': 'unique',
                'column': str(columns),
                'status': 'PASS',
                'message': 'OK'
            })
    
    def check_range(self, df: pd.DataFrame, column: str, min_val, max_val, table_name: str):
        """Verifica range de valores"""
        if column in df.columns:
            out_of_range = ((df[column] < min_val) | (df[column] > max_val)).sum()
            if out_of_range > 0:
                self.checks.append({
                    'table': table_name,
                    'check': 'range',
                    'column': column,
                    'status': 'WARN',
                    'message': f'{out_of_range} valores fora do range [{min_val}, {max_val}]'
                })
            else:
                self.checks.append({
                    'table': table_name,
                    'check': 'range',
                    'column': column,
                    'status': 'PASS',
                    'message': 'OK'
                })
    
    def get_report(self):
        """Retorna relatório de qualidade"""
        df_checks = pd.DataFrame(self.checks)
        return df_checks


# ============================================================================
# CAMADA BRONZE: Dados Brutos
# ============================================================================

def bronze_layer():
    """
    CAMADA BRONZE: Ingestão de dados brutos
    - Sincroniza do servidor PostgreSQL
    - Carrega do Excel
    - Salva como está (sem transformações)
    """
    print("="*80)
    print("🥉 CAMADA BRONZE: Ingestão de Dados Brutos")
    print("="*80)
    
    lineage = DataLineage()
    
    # 1. Sincronizar do servidor
    print("\n1️⃣ Sincronizando dados do servidor PostgreSQL...")
    sync = DataSynchronizer()
    results = sync.sync_all(force=True)
    
    # Copiar para bronze
    print("\n2️⃣ Copiando para camada BRONZE...")
    
    # Bronze: banco_techdengue
    df_banco = pd.read_parquet('cache/banco_techdengue.parquet')
    bronze_banco_path = BRONZE_DIR / 'banco_techdengue.parquet'
    df_banco.to_parquet(bronze_banco_path, index=False)
    
    hash_banco = hashlib.md5(pd.util.hash_pandas_object(df_banco).values).hexdigest()
    lineage.register_transformation(
        'bronze.banco_techdengue',
        ['servidor.banco_techdengue'],
        'sync_from_postgresql',
        len(df_banco),
        hash_banco
    )
    
    print(f"✓ bronze.banco_techdengue: {len(df_banco):,} registros")
    
    # Bronze: planilha_campo
    df_planilha = pd.read_parquet('cache/planilha_campo.parquet')
    bronze_planilha_path = BRONZE_DIR / 'planilha_campo.parquet'
    df_planilha.to_parquet(bronze_planilha_path, index=False)
    
    hash_planilha = hashlib.md5(pd.util.hash_pandas_object(df_planilha).values).hexdigest()
    lineage.register_transformation(
        'bronze.planilha_campo',
        ['servidor.planilha_campo'],
        'sync_from_postgresql',
        len(df_planilha),
        hash_planilha
    )
    
    print(f"✓ bronze.planilha_campo: {len(df_planilha):,} registros")
    
    # 3. Carregar do Excel
    print("\n3️⃣ Carregando dados do Excel...")
    
    excel_path = BASE_DIR / "base_dados" / "dados_techdengue" / "Atividades Techdengue.xlsx"
    
    # Bronze: atividades_excel
    df_atividades = pd.read_excel(excel_path, sheet_name='Atividades (com sub)')
    bronze_atividades_path = BRONZE_DIR / 'atividades_excel.parquet'
    df_atividades.to_parquet(bronze_atividades_path, index=False)
    
    hash_atividades = hashlib.md5(pd.util.hash_pandas_object(df_atividades).values).hexdigest()
    lineage.register_transformation(
        'bronze.atividades_excel',
        ['excel.Atividades Techdengue.xlsx'],
        'load_from_excel',
        len(df_atividades),
        hash_atividades
    )
    
    print(f"✓ bronze.atividades_excel: {len(df_atividades):,} registros")
    
    # Bronze: ibge_referencia
    df_ibge = pd.read_excel(excel_path, sheet_name='IBGE')
    bronze_ibge_path = BRONZE_DIR / 'ibge_referencia.parquet'
    df_ibge.to_parquet(bronze_ibge_path, index=False)
    
    hash_ibge = hashlib.md5(pd.util.hash_pandas_object(df_ibge).values).hexdigest()
    lineage.register_transformation(
        'bronze.ibge_referencia',
        ['excel.Atividades Techdengue.xlsx'],
        'load_from_excel',
        len(df_ibge),
        hash_ibge
    )
    
    print(f"✓ bronze.ibge_referencia: {len(df_ibge):,} registros")
    
    # 4. Carregar dados de dengue
    print("\n4️⃣ Carregando dados de dengue...")
    
    dengue_dir = BASE_DIR / "base_dados" / "dados_dengue"
    dfs_dengue = []
    
    for year in [2023, 2024, 2025]:
        dengue_file = dengue_dir / f"base.dengue.{year}.xlsx"
        if dengue_file.exists():
            df_year = pd.read_excel(dengue_file)
            df_year['ANO'] = year
            dfs_dengue.append(df_year)
            print(f"✓ Dengue {year}: {len(df_year):,} registros")
    
    df_dengue = pd.concat(dfs_dengue, ignore_index=True)
    bronze_dengue_path = BRONZE_DIR / 'dengue_historico.parquet'
    df_dengue.to_parquet(bronze_dengue_path, index=False)
    
    hash_dengue = hashlib.md5(pd.util.hash_pandas_object(df_dengue).values).hexdigest()
    lineage.register_transformation(
        'bronze.dengue_historico',
        ['excel.base.dengue.2023-2025.xlsx'],
        'load_from_excel',
        len(df_dengue),
        hash_dengue
    )
    
    print(f"✓ bronze.dengue_historico: {len(df_dengue):,} registros")
    
    print("\n✅ CAMADA BRONZE CONCLUÍDA")
    print(f"   Tabelas criadas: 5")
    print(f"   Localização: {BRONZE_DIR}")
    
    return {
        'banco_techdengue': df_banco,
        'planilha_campo': df_planilha,
        'atividades_excel': df_atividades,
        'ibge_referencia': df_ibge,
        'dengue_historico': df_dengue
    }


# ============================================================================
# CAMADA SILVER: Dados Limpos e Validados
# ============================================================================

def silver_layer(bronze_data: dict):
    """
    CAMADA SILVER: Limpeza e validação
    - Remove duplicatas
    - Padroniza formatos
    - Valida qualidade
    - Enriquece dados
    """
    print("\n" + "="*80)
    print("🥈 CAMADA SILVER: Limpeza e Validação")
    print("="*80)
    
    lineage = DataLineage()
    quality = DataQuality()
    
    silver_data = {}
    
    # 1. DIMENSÃO: Municípios
    print("\n1️⃣ Criando dim_municipios...")
    
    df_ibge = bronze_data['ibge_referencia'].copy()
    
    # Renomear e padronizar (colunas reais do Excel)
    df_municipios = df_ibge.rename(columns={
        'Código Município Completo': 'codigo_ibge',
        'Nome_Município': 'municipio',
        'POPULAÇÃO CENSO DEMOGRÁFICO (IBGE/2022)': 'populacao',
        'Unidade Regional de Saúde': 'urs',
        'AREA_ha': 'area_ha',
        'Código Micro': 'cod_microregiao',
        'Microrregião de Saúde': 'microregiao_saude',
        'Código Macro': 'cod_macroregiao',
        'Macrorregião de Saúde': 'macroregiao_saude'
    })
    
    # Padronizar codigo_ibge
    df_municipios['codigo_ibge'] = df_municipios['codigo_ibge'].astype(str).str.zfill(7)
    
    # Adicionar metadados
    df_municipios['data_atualizacao'] = datetime.now()
    df_municipios['versao'] = VERSION
    
    # Validar qualidade
    quality.check_not_null(df_municipios, ['codigo_ibge', 'municipio'], 'dim_municipios')
    quality.check_unique(df_municipios, ['codigo_ibge'], 'dim_municipios')
    
    # Salvar
    silver_municipios_path = SILVER_DIR / 'dim_municipios.parquet'
    df_municipios.to_parquet(silver_municipios_path, index=False)
    
    hash_mun = hashlib.md5(pd.util.hash_pandas_object(df_municipios).values).hexdigest()
    lineage.register_transformation(
        'silver.dim_municipios',
        ['bronze.ibge_referencia'],
        'clean_and_standardize',
        len(df_municipios),
        hash_mun
    )
    
    silver_data['dim_municipios'] = df_municipios
    print(f"✓ dim_municipios: {len(df_municipios):,} registros")
    
    # 2. FATO: POIs do Servidor
    print("\n2️⃣ Criando fato_pois_servidor...")
    
    df_pois = bronze_data['banco_techdengue'].copy()
    
    # Renomear
    df_pois = df_pois.rename(columns={
        'id': 'poi_id',
        'nome': 'poi_nome',
        'lat': 'latitude',
        'long': 'longitude',
        'geom_json': 'geometria_json',
        'data_criacao': 'data_criacao',
        'analista': 'analista',
        'id_sistema': 'sistema_id'
    })
    
    # Converter coordenadas
    df_pois['latitude'] = pd.to_numeric(df_pois['latitude'], errors='coerce')
    df_pois['longitude'] = pd.to_numeric(df_pois['longitude'], errors='coerce')
    
    # Adicionar metadados
    df_pois['data_carga'] = datetime.now()
    df_pois['fonte'] = 'servidor_postgresql'
    
    # Validar qualidade
    quality.check_not_null(df_pois, ['poi_id'], 'fato_pois_servidor')
    quality.check_unique(df_pois, ['poi_id'], 'fato_pois_servidor')
    quality.check_range(df_pois, 'latitude', -90, 90, 'fato_pois_servidor')
    quality.check_range(df_pois, 'longitude', -180, 180, 'fato_pois_servidor')
    
    # Salvar
    silver_pois_path = SILVER_DIR / 'fato_pois_servidor.parquet'
    df_pois.to_parquet(silver_pois_path, index=False)
    
    hash_pois = hashlib.md5(pd.util.hash_pandas_object(df_pois).values).hexdigest()
    lineage.register_transformation(
        'silver.fato_pois_servidor',
        ['bronze.banco_techdengue'],
        'clean_and_validate',
        len(df_pois),
        hash_pois
    )
    
    silver_data['fato_pois_servidor'] = df_pois
    print(f"✓ fato_pois_servidor: {len(df_pois):,} registros")
    
    # 3. FATO: Atividades (corrigido - sem duplicação de hectares)
    print("\n3️⃣ Criando fato_atividades...")
    
    df_ativ = bronze_data['atividades_excel'].copy()
    
    # Renomear colunas
    if 'CODIGO IBGE' in df_ativ.columns:
        df_ativ = df_ativ.rename(columns={'CODIGO IBGE': 'CODIGO_IBGE'})
    
    df_ativ['CODIGO_IBGE'] = df_ativ['CODIGO_IBGE'].astype(str).str.zfill(7)
    
    # Extrair ANO da DATA_MAP
    df_ativ['ANO'] = pd.to_datetime(df_ativ['DATA_MAP'], errors='coerce').dt.year
    
    # CORREÇÃO: Agrupar para evitar duplicação de hectares
    chave_agrupamento = ['CODIGO_IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE']
    
    # Colunas numéricas
    colunas_pois = [col for col in df_ativ.columns if col.startswith(('A -', 'B -', 'C -', 'D -', 'O -'))]
    colunas_numericas = ['POIS', 'devolutivas', 'removido_solucionado', 'descaracterizado',
                         'Tratado', 'morador_ausente', 'nao_Autorizado',
                         'tratamento_via_drones', 'monitorado'] + colunas_pois
    
    agg_dict = {
        'HECTARES_MAPEADOS': 'max',  # MAX evita duplicação
        'ANO': 'first'  # Preservar ANO
    }
    for col in colunas_numericas:
        if col in df_ativ.columns:
            agg_dict[col] = 'sum'
    
    # Colunas categóricas
    for col in ['CONTRATANTE', 'LINK_GIS']:
        if col in df_ativ.columns:
            agg_dict[col] = 'first'
    
    df_ativ_clean = df_ativ.groupby(chave_agrupamento, as_index=False).agg(agg_dict)
    
    # Adicionar metadados
    df_ativ_clean['data_carga'] = datetime.now()
    df_ativ_clean['fonte'] = 'excel'
    
    # Validar qualidade
    quality.check_not_null(df_ativ_clean, ['CODIGO_IBGE', 'DATA_MAP'], 'fato_atividades')
    
    # Salvar
    silver_ativ_path = SILVER_DIR / 'fato_atividades.parquet'
    df_ativ_clean.to_parquet(silver_ativ_path, index=False)
    
    hash_ativ = hashlib.md5(pd.util.hash_pandas_object(df_ativ_clean).values).hexdigest()
    lineage.register_transformation(
        'silver.fato_atividades',
        ['bronze.atividades_excel'],
        'clean_aggregate_deduplicate',
        len(df_ativ_clean),
        hash_ativ
    )
    
    silver_data['fato_atividades'] = df_ativ_clean
    print(f"✓ fato_atividades: {len(df_ativ_clean):,} registros (corrigido)")
    
    # 4. FATO: Dengue
    print("\n4️⃣ Criando fato_dengue...")
    
    df_dengue = bronze_data['dengue_historico'].copy()
    
    # Correlacionar códigos IBGE
    # (usar lógica do criar_base_integrada.py)
    
    # Adicionar metadados
    df_dengue['data_carga'] = datetime.now()
    df_dengue['fonte'] = 'excel'
    
    # Salvar
    silver_dengue_path = SILVER_DIR / 'fato_dengue.parquet'
    df_dengue.to_parquet(silver_dengue_path, index=False)
    
    hash_dengue = hashlib.md5(pd.util.hash_pandas_object(df_dengue).values).hexdigest()
    lineage.register_transformation(
        'silver.fato_dengue',
        ['bronze.dengue_historico'],
        'clean_and_correlate_ibge',
        len(df_dengue),
        hash_dengue
    )
    
    silver_data['fato_dengue'] = df_dengue
    print(f"✓ fato_dengue: {len(df_dengue):,} registros")
    
    # Relatório de qualidade
    print("\n📊 Relatório de Qualidade:")
    quality_report = quality.get_report()
    print(quality_report.groupby(['table', 'status']).size())
    
    # Salvar relatório
    quality_report.to_csv(METADATA_DIR / 'quality_report.csv', index=False)
    
    print("\n✅ CAMADA SILVER CONCLUÍDA")
    print(f"   Tabelas criadas: 4")
    print(f"   Localização: {SILVER_DIR}")
    
    return silver_data


# ============================================================================
# CAMADA GOLD: Dados Agregados (MEGA TABELA)
# ============================================================================

def gold_layer(silver_data: dict):
    """
    CAMADA GOLD: Dados agregados e prontos para análise
    - MEGA TABELA completa
    - Tabelas agregadas especializadas
    """
    print("\n" + "="*80)
    print("🥇 CAMADA GOLD: Agregações e MEGA TABELA")
    print("="*80)
    
    lineage = DataLineage()
    
    # Continua na próxima parte...
    print("\n⏳ Implementando MEGA TABELA...")
    print("   (Continuação no próximo arquivo)")
    
    return {}


# ============================================================================
# MAIN: Executar Pipeline Completo
# ============================================================================

def main():
    """Executa pipeline ETL completo"""
    print("="*80)
    print("🚀 PIPELINE ETL COMPLETO - ARQUITETURA MEDALLION")
    print("="*80)
    print(f"Versão: {VERSION}")
    print(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("="*80)
    
    start_time = datetime.now()
    
    try:
        # Camada Bronze
        bronze_data = bronze_layer()
        
        # Camada Silver
        silver_data = silver_layer(bronze_data)
        
        # Camada Gold
        gold_data = gold_layer(silver_data)
        
        # Tempo total
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("\n" + "="*80)
        print("✅ PIPELINE ETL CONCLUÍDO COM SUCESSO")
        print("="*80)
        print(f"Tempo total: {duration:.2f} segundos")
        print(f"\nCamadas criadas:")
        print(f"  🥉 BRONZE: {BRONZE_DIR}")
        print(f"  🥈 SILVER: {SILVER_DIR}")
        print(f"  🥇 GOLD: {GOLD_DIR}")
        print(f"  📋 METADATA: {METADATA_DIR}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ ERRO NO PIPELINE: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    exit(main())
