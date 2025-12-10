"""
Sistema de Criação de Base de Dados Integrada - Projeto TechDengue

OBJETIVO: Criar tabelas cruzadas, validadas e com garantia de integridade
para análises robustas e auditáveis.

PRINCÍPIOS:
1. Integridade: Validação em cada etapa
2. Imutabilidade: Versionamento e hashes
3. Rastreabilidade: Logs completos de transformação
4. Validação: Testes automatizados em cada dataset
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import hashlib
import json
import unicodedata
import warnings
warnings.filterwarnings('ignore')
from src.config import Config

# ============================================================================
# CONFIGURAÇÕES E CONSTANTES
# ============================================================================

BASE_DIR = Config.PATHS.data_dir
OUTPUT_DIR = Config.PATHS.output_dir
OUTPUT_DIR.mkdir(exist_ok=True)

# Versão da base integrada (incrementar quando houver mudanças)
VERSAO_BASE = "1.0.0"

# ============================================================================
# CLASSE PARA VALIDAÇÃO E INTEGRIDADE
# ============================================================================

class ValidadorDados:
    """Valida integridade dos dados e registra logs"""
    
    def __init__(self):
        self.erros = []
        self.avisos = []
        self.validacoes = []
        
    def validar_codigo_ibge(self, df, coluna='CODIGO_IBGE'):
        """Valida formato e consistência dos códigos IBGE"""
        print(f"  ✓ Validando códigos IBGE na coluna '{coluna}'...")
        
        # Verificar se coluna existe
        if coluna not in df.columns:
            self.erros.append(f"Coluna '{coluna}' não encontrada")
            return False
        
        # Converter para string e remover espaços
        df[coluna] = df[coluna].astype(str).str.strip()
        
        # Validar formato (7 dígitos, começando com 31)
        invalidos = df[~df[coluna].str.match(r'^31\d{5}$', na=False)]
        
        if len(invalidos) > 0:
            self.avisos.append(f"{len(invalidos)} códigos IBGE inválidos encontrados")
            print(f"    ⚠️  {len(invalidos)} códigos inválidos")
        else:
            print(f"    ✓ Todos os {len(df)} códigos são válidos")
            
        self.validacoes.append({
            'validacao': 'codigo_ibge',
            'tabela': 'desconhecida',
            'total': len(df),
            'invalidos': len(invalidos),
            'timestamp': datetime.now().isoformat()
        })
        
        return len(invalidos) == 0
    
    def validar_duplicatas(self, df, colunas_chave, nome_tabela=''):
        """Verifica duplicatas nas colunas-chave"""
        print(f"  ✓ Verificando duplicatas em {nome_tabela}...")
        
        duplicatas = df.duplicated(subset=colunas_chave, keep=False)
        n_duplicatas = duplicatas.sum()
        
        if n_duplicatas > 0:
            self.avisos.append(f"{nome_tabela}: {n_duplicatas} linhas duplicadas")
            print(f"    ⚠️  {n_duplicatas} duplicatas encontradas")
        else:
            print(f"    ✓ Nenhuma duplicata")
            
        return n_duplicatas == 0
    
    def validar_valores_nulos(self, df, colunas_obrigatorias, nome_tabela=''):
        """Verifica valores nulos em colunas obrigatórias"""
        print(f"  ✓ Verificando valores nulos em {nome_tabela}...")
        
        problemas = {}
        for col in colunas_obrigatorias:
            if col in df.columns:
                nulos = df[col].isna().sum()
                if nulos > 0:
                    problemas[col] = nulos
        
        if problemas:
            for col, qtd in problemas.items():
                self.avisos.append(f"{nome_tabela}.{col}: {qtd} valores nulos")
                print(f"    ⚠️  {col}: {qtd} nulos")
        else:
            print(f"    ✓ Sem valores nulos críticos")
            
        return len(problemas) == 0
    
    def gerar_relatorio(self):
        """Gera relatório de validação"""
        relatorio = {
            'versao_base': VERSAO_BASE,
            'timestamp': datetime.now().isoformat(),
            'total_erros': len(self.erros),
            'total_avisos': len(self.avisos),
            'erros': self.erros,
            'avisos': self.avisos,
            'validacoes': self.validacoes
        }
        return relatorio

# ============================================================================
# CLASSE PARA CÁLCULO DE HASH (INTEGRIDADE)
# ============================================================================

class GerenciadorIntegridade:
    """Garante integridade através de hashes e checksums"""
    
    @staticmethod
    def calcular_hash_dataframe(df):
        """Calcula hash MD5 de um DataFrame"""
        # Converter para string e calcular hash
        conteudo = pd.util.hash_pandas_object(df, index=True).values
        hash_obj = hashlib.md5(str(conteudo).encode())
        return hash_obj.hexdigest()
    
    @staticmethod
    def salvar_metadados(arquivo_path, df, hash_value, validador):
        """Salva metadados junto com o arquivo"""
        metadados = {
            'arquivo': arquivo_path.name,
            'versao': VERSAO_BASE,
            'timestamp_criacao': datetime.now().isoformat(),
            'linhas': len(df),
            'colunas': len(df.columns),
            'nomes_colunas': df.columns.tolist(),
            'hash_md5': hash_value,
            'validacao': validador.gerar_relatorio()
        }
        
        # Salvar JSON de metadados
        meta_path = arquivo_path.with_suffix('.json')
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(metadados, f, indent=2, ensure_ascii=False)
        
        return meta_path

# ============================================================================
# FUNÇÕES DE CRIAÇÃO DAS TABELAS INTEGRADAS
# ============================================================================

def criar_tabela_municipios():
    """
    Tabela Dimensão: dim_municipios
    Contém informações cadastrais únicas de cada município
    """
    print("\n" + "="*80)
    print("📋 CRIANDO TABELA: dim_municipios")
    print("="*80)
    
    validador = ValidadorDados()
    
    # Carregar dados IBGE
    print("\n1. Carregando dados IBGE...")
    df_ibge = pd.read_excel(
        BASE_DIR / "dados_techdengue" / "Atividades Techdengue.xlsx",
        sheet_name='IBGE'
    )
    
    # Padronizar nomes de colunas
    df_ibge = df_ibge.rename(columns={
        'Código Município Completo': 'CODIGO_IBGE',
        'Nome_Município': 'MUNICIPIO',
        'POPULAÇÃO CENSO DEMOGRÁFICO (IBGE/2022)': 'POPULACAO',
        'Unidade Regional de Saúde': 'URS',
        'Código Micro': 'COD_MICROREGIAO',
        'Microrregião de Saúde': 'MICROREGIAO_SAUDE',
        'Código Macro': 'COD_MACROREGIAO',
        'Macrorregião de Saúde': 'MACROREGIAO_SAUDE',
        'AREA_ha': 'AREA_HA'
    })
    
    # Converter CODIGO_IBGE para string
    df_ibge['CODIGO_IBGE'] = df_ibge['CODIGO_IBGE'].astype(str)
    
    # Validações
    print("\n2. Validando dados...")
    validador.validar_codigo_ibge(df_ibge, 'CODIGO_IBGE')
    validador.validar_duplicatas(df_ibge, ['CODIGO_IBGE'], 'dim_municipios')
    validador.validar_valores_nulos(df_ibge, ['CODIGO_IBGE', 'MUNICIPIO'], 'dim_municipios')
    
    # Adicionar metadados
    df_ibge['DATA_CARGA'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df_ibge['VERSAO'] = VERSAO_BASE
    
    # Salvar
    print("\n3. Salvando tabela...")
    output_path = OUTPUT_DIR / 'dim_municipios.parquet'
    df_ibge.to_parquet(output_path, index=False)
    
    # Calcular hash e salvar metadados
    hash_value = GerenciadorIntegridade.calcular_hash_dataframe(df_ibge)
    meta_path = GerenciadorIntegridade.salvar_metadados(output_path, df_ibge, hash_value, validador)
    
    print(f"\n✅ Tabela criada: {output_path}")
    print(f"   Linhas: {len(df_ibge):,}")
    print(f"   Hash MD5: {hash_value}")
    print(f"   Metadados: {meta_path}")
    
    return df_ibge, validador

def carregar_mapa_ibge_referencia():
    """
    Carrega tabela de referência IBGE (fonte de verdade)
    Retorna dicionário: {nome_normalizado: codigo_ibge}
    """
    print("\n📚 Carregando tabela de referência IBGE (fonte de verdade)...")
    
    df_ibge = pd.read_excel(
        BASE_DIR / "dados_techdengue" / "Atividades Techdengue.xlsx",
        sheet_name='IBGE'
    )
    
    # Padronizar colunas
    df_ibge = df_ibge.rename(columns={
        'Código Município Completo': 'CODIGO_IBGE',
        'Nome_Município': 'MUNICIPIO'
    })
    
    # Normalizar nomes para matching
    def normalizar_texto(texto):
        if pd.isna(texto):
            return ''
        texto = unicodedata.normalize('NFKD', str(texto))
        texto = texto.encode('ascii', errors='ignore').decode('ascii')
        return texto.upper().strip()
    
    df_ibge['MUNICIPIO_NORM'] = df_ibge['MUNICIPIO'].apply(normalizar_texto)
    
    # Criar dicionário de referência
    mapa_ibge = dict(zip(df_ibge['MUNICIPIO_NORM'], df_ibge['CODIGO_IBGE'].astype(str)))
    
    print(f"   ✓ {len(mapa_ibge)} municípios na tabela de referência")
    
    return mapa_ibge, df_ibge

def normalizar_nome_municipio(nome):
    """
    Normaliza nome do município para matching consistente
    Remove acentos, converte para maiúsculas, remove espaços extras
    """
    if pd.isna(nome):
        return ''
    texto = unicodedata.normalize('NFKD', str(nome))
    texto = texto.encode('ascii', errors='ignore').decode('ascii')
    return texto.upper().strip()

def correlacionar_codigo_ibge(df, mapa_ibge, nome_arquivo=''):
    """
    Correlaciona código IBGE correto pelo nome do município
    
    Args:
        df: DataFrame com coluna MUNICIPIO
        mapa_ibge: Dicionário {nome_normalizado: codigo_ibge}
        nome_arquivo: Nome do arquivo para logging
    
    Returns:
        DataFrame com CODIGO_IBGE corrigido
    """
    print(f"\n  🔗 Correlacionando códigos IBGE para {nome_arquivo}...")
    
    # Normalizar nomes
    df['MUNICIPIO_NORM'] = df['MUNICIPIO'].apply(normalizar_nome_municipio)
    
    # Mapear códigos IBGE
    df['CODIGO_IBGE_NOVO'] = df['MUNICIPIO_NORM'].map(mapa_ibge)
    
    # Validar correlação
    total = len(df['MUNICIPIO'].unique())
    matched = df['CODIGO_IBGE_NOVO'].notna().sum()
    not_matched = df['CODIGO_IBGE_NOVO'].isna().sum()
    
    taxa_match = (matched / len(df)) * 100 if len(df) > 0 else 0
    
    print(f"     ✓ Taxa de correlação: {taxa_match:.1f}%")
    print(f"     ✓ Registros correlacionados: {matched:,}")
    
    if not_matched > 0:
        print(f"     ⚠️  Registros NÃO correlacionados: {not_matched:,}")
        municipios_sem_match = df[df['CODIGO_IBGE_NOVO'].isna()]['MUNICIPIO'].unique()
        print(f"     ⚠️  Exemplos (primeiros 5):")
        for mun in municipios_sem_match[:5]:
            print(f"        - {mun}")
    
    # Substituir código antigo pelo novo
    df['CODIGO_IBGE'] = df['CODIGO_IBGE_NOVO']
    df = df.drop(columns=['MUNICIPIO_NORM', 'CODIGO_IBGE_NOVO'])
    
    # VALIDAÇÃO CRÍTICA: Taxa de match deve ser >= 95%
    if taxa_match < 95.0:
        raise ValueError(
            f"❌ FALHA NA CORRELAÇÃO!\n"
            f"  Taxa de match: {taxa_match:.1f}% (esperado >= 95%)\n"
            f"  Verifique os nomes dos municípios que não foram correlacionados."
        )
    
    return df

def criar_tabela_dengue_historico():
    """
    Tabela Fato: fato_dengue_historico
    Contém todos os casos de dengue por município e semana epidemiológica
    CORRELAÇÃO: Usa nome do município + tabela IBGE de referência
    """
    print("\n" + "="*80)
    print("📋 CRIANDO TABELA: fato_dengue_historico")
    print("="*80)
    
    validador = ValidadorDados()
    
    # Carregar mapa de referência IBGE
    mapa_ibge, df_ibge_ref = carregar_mapa_ibge_referencia()
    
    # Lista para armazenar DataFrames
    dfs = []
    
    # Processar cada ano
    for ano in [2023, 2024, 2025]:
        print(f"\n1. Processando dados de {ano}...")
        
        arquivo = BASE_DIR / "dados_dengue" / f"base.dengue.{ano}.xlsx"
        # Ler SEM especificar dtype - vamos ignorar o código corrompido
        df = pd.read_excel(arquivo)
        
        # Padronizar nomes (IGNORAR coluna Cod IBGE corrompida)
        df = df.rename(columns={
            'Municipio': 'MUNICIPIO'
        })
        
        # CORRELACIONAR código IBGE correto pelo nome
        df = correlacionar_codigo_ibge(df, mapa_ibge, f"Dengue {ano}")
        
        # Transformar de wide para long (cada linha = município + semana)
        colunas_semanas = [col for col in df.columns if col.startswith('Semana')]
        
        df_long = df.melt(
            id_vars=['CODIGO_IBGE', 'MUNICIPIO'],
            value_vars=colunas_semanas,
            var_name='SEMANA_STR',
            value_name='CASOS'
        )
        
        # Extrair número da semana
        df_long['SEMANA_EPIDEMIOLOGICA'] = df_long['SEMANA_STR'].str.extract(r'(\d+)').astype(int)
        df_long['ANO'] = ano
        
        # Remover coluna temporária
        df_long = df_long.drop(columns=['SEMANA_STR'])
        
        # Adicionar ao DataFrame consolidado
        dfs.append(df_long)
        
        print(f"   ✓ {len(df_long):,} registros processados")
    
    # Consolidar todos os anos
    print("\n2. Consolidando dados...")
    df_consolidado = pd.concat(dfs, ignore_index=True)
    
    # Validações
    print("\n3. Validando dados...")
    validador.validar_codigo_ibge(df_consolidado, 'CODIGO_IBGE')
    validador.validar_duplicatas(df_consolidado, ['CODIGO_IBGE', 'ANO', 'SEMANA_EPIDEMIOLOGICA'], 'fato_dengue_historico')
    
    # Adicionar metadados
    df_consolidado['DATA_CARGA'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df_consolidado['VERSAO'] = VERSAO_BASE
    
    # Salvar
    print("\n4. Salvando tabela...")
    output_path = OUTPUT_DIR / 'fato_dengue_historico.parquet'
    df_consolidado.to_parquet(output_path, index=False)
    
    # Hash e metadados
    hash_value = GerenciadorIntegridade.calcular_hash_dataframe(df_consolidado)
    meta_path = GerenciadorIntegridade.salvar_metadados(output_path, df_consolidado, hash_value, validador)
    
    print(f"\n✅ Tabela criada: {output_path}")
    print(f"   Linhas: {len(df_consolidado):,}")
    print(f"   Período: {df_consolidado['ANO'].min()}-{df_consolidado['ANO'].max()}")
    print(f"   Hash MD5: {hash_value}")
    print(f"   Metadados: {meta_path}")
    
    return df_consolidado, validador

def criar_tabela_atividades():
    """
    Tabela Fato: fato_atividades_techdengue
    Carrega atividades TechDengue com todas as categorias de POIs
    
    IMPORTANTE: Agrupa por (CODIGO_IBGE, DATA_MAP, NOMENCLATURA_ATIVIDADE)
    para evitar duplicação de hectares por sub-atividades.
    """
    print("\n" + "="*80)
    print("📋 CRIANDO TABELA: fato_atividades_techdengue")
    print("="*80)
    
    validador = ValidadorDados()
    
    # Carregar atividades completas
    print("\n1. Carregando atividades...")
    df = pd.read_excel(
        BASE_DIR / "dados_techdengue" / "Atividades Techdengue.xlsx",
        sheet_name='Atividades (com sub)'
    )
    
    # Renomear coluna se necessário (com espaço → sem espaço)
    if 'CODIGO IBGE' in df.columns:
        df = df.rename(columns={'CODIGO IBGE': 'CODIGO_IBGE'})
    
    # Padronizar CODIGO_IBGE
    df['CODIGO_IBGE'] = df['CODIGO_IBGE'].astype(str)
    
    # CORREÇÃO: Agrupar para evitar duplicação de hectares por sub-atividades
    print("\n2. Corrigindo duplicação de hectares (sub-atividades)...")
    print(f"   Registros originais: {len(df)}")
    
    # Identificar colunas numéricas para agregar
    colunas_pois = [col for col in df.columns if col.startswith(('A -', 'B -', 'C -', 'D -', 'O -'))]
    colunas_numericas = ['POIS', 'devolutivas', 'removido_solucionado', 'descaracterizado', 
                         'Tratado', 'morador_ausente', 'nao_Autorizado', 
                         'tratamento_via_drones', 'monitorado'] + colunas_pois
    
    # Colunas para agrupar
    chave_agrupamento = ['CODIGO_IBGE', 'DATA_MAP', 'NOMENCLATURA_ATIVIDADE']
    
    # Agregar: MAX para hectares (evita duplicação), SUM para POIs e devolutivas
    agg_dict = {'HECTARES_MAPEADOS': 'max'}  # MAX evita duplicação de sub-atividades
    
    for col in colunas_numericas:
        if col in df.columns:
            agg_dict[col] = 'sum'  # POIs e devolutivas devem ser somados
    
    # Colunas categóricas: pegar primeiro valor
    colunas_categoricas = ['CONTRATANTE', 'LINK_GIS', 'SUB_ATIVIDADE']
    for col in colunas_categoricas:
        if col in df.columns:
            agg_dict[col] = 'first'
    
    # Agrupar
    df_agrupado = df.groupby(chave_agrupamento, as_index=False).agg(agg_dict)
    
    print(f"   Registros após agrupamento: {len(df_agrupado)}")
    print(f"   ✓ Hectares corrigidos (evitando duplicação de sub-atividades)")
    
    # Calcular total de hectares
    total_hectares = df_agrupado['HECTARES_MAPEADOS'].sum()
    print(f"   ✓ Total de hectares: {total_hectares:,.2f} ha")
    print(f"   ✓ Métrica oficial: 142.783,05 ha")
    print(f"   ✓ Diferença: {abs(total_hectares - 142783.05):,.2f} ha ({abs(total_hectares - 142783.05) / 142783.05 * 100:.2f}%)")
    
    # Usar dataframe agrupado
    df = df_agrupado
    
    # Validações
    print("\n3. Validando dados...")
    validador.validar_codigo_ibge(df, 'CODIGO_IBGE')
    validador.validar_valores_nulos(df, ['CODIGO_IBGE', 'NOMENCLATURA_ATIVIDADE', 'DATA_MAP'], 'fato_atividades')
    
    # Adicionar metadados
    df['DATA_CARGA'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df['VERSAO'] = VERSAO_BASE
    
    # Salvar
    print("\n4. Salvando tabela...")
    output_path = OUTPUT_DIR / 'fato_atividades_techdengue.parquet'
    df.to_parquet(output_path, index=False)
    
    # Hash e metadados
    hash_value = GerenciadorIntegridade.calcular_hash_dataframe(df)
    meta_path = GerenciadorIntegridade.salvar_metadados(output_path, df, hash_value, validador)
    
    print(f"\n✅ Tabela criada: {output_path}")
    print(f"   Linhas: {len(df):,}")
    print(f"   Hash MD5: {hash_value}")
    print(f"   Metadados: {meta_path}")
    
    return df, validador

def criar_tabela_cruzada_analise():
    """
    Tabela Agregada: analise_integrada
    Cruza dengue + atividades + municípios para análises rápidas
    """
    print("\n" + "="*80)
    print("📋 CRIANDO TABELA CRUZADA: analise_integrada")
    print("="*80)
    
    validador = ValidadorDados()
    
    # Carregar tabelas já criadas
    print("\n1. Carregando tabelas base...")
    dim_municipios = pd.read_parquet(OUTPUT_DIR / 'dim_municipios.parquet')
    fato_dengue = pd.read_parquet(OUTPUT_DIR / 'fato_dengue_historico.parquet')
    fato_atividades = pd.read_parquet(OUTPUT_DIR / 'fato_atividades_techdengue.parquet')
    
    # Agregar dengue por município e ano
    print("\n2. Agregando casos de dengue...")
    dengue_agg = fato_dengue.groupby(['CODIGO_IBGE', 'ANO']).agg({
        'CASOS': 'sum'
    }).reset_index()
    dengue_agg = dengue_agg.rename(columns={'CASOS': 'TOTAL_CASOS_DENGUE'})
    
    # Agregar atividades por município
    print("\n3. Agregando atividades TechDengue...")
    atividades_agg = fato_atividades.groupby('CODIGO_IBGE').agg({
        'NOMENCLATURA_ATIVIDADE': 'count',
        'POIS': 'sum',
        'devolutivas': 'sum',
        'HECTARES_MAPEADOS': 'sum',  # Já corrigido na tabela fato_atividades
        'DATA_MAP': ['min', 'max']
    }).reset_index()
    
    atividades_agg.columns = ['CODIGO_IBGE', 'QTD_ATIVIDADES', 'TOTAL_POIS', 
                               'TOTAL_DEVOLUTIVAS', 'TOTAL_HECTARES',
                               'DATA_PRIMEIRA_ATIVIDADE', 'DATA_ULTIMA_ATIVIDADE']
    
    # Calcular taxa de conversão
    atividades_agg['TAXA_CONVERSAO_DEVOLUTIVAS'] = (
        atividades_agg['TOTAL_DEVOLUTIVAS'] / atividades_agg['TOTAL_POIS'] * 100
    ).round(2)
    
    # Juntar tudo
    print("\n4. Cruzando todas as tabelas...")
    df_integrado = dim_municipios.copy()
    
    # Join com dengue (pivotando anos)
    for ano in [2023, 2024, 2025]:
        dengue_ano = dengue_agg[dengue_agg['ANO'] == ano][['CODIGO_IBGE', 'TOTAL_CASOS_DENGUE']]
        dengue_ano = dengue_ano.rename(columns={'TOTAL_CASOS_DENGUE': f'CASOS_DENGUE_{ano}'})
        df_integrado = df_integrado.merge(dengue_ano, on='CODIGO_IBGE', how='left')
    
    # Join com atividades
    df_integrado = df_integrado.merge(atividades_agg, on='CODIGO_IBGE', how='left')
    
    # Preencher NaN com 0 para municípios sem atividades
    colunas_numericas = ['QTD_ATIVIDADES', 'TOTAL_POIS', 'TOTAL_DEVOLUTIVAS', 
                         'TOTAL_HECTARES', 'TAXA_CONVERSAO_DEVOLUTIVAS']
    df_integrado[colunas_numericas] = df_integrado[colunas_numericas].fillna(0)
    
    # Adicionar flag se tem atividade TechDengue
    df_integrado['TEM_ATIVIDADE_TECHDENGUE'] = (df_integrado['QTD_ATIVIDADES'] > 0).astype(int)
    
    # Validações
    print("\n5. Validando tabela integrada...")
    validador.validar_codigo_ibge(df_integrado, 'CODIGO_IBGE')
    validador.validar_duplicatas(df_integrado, ['CODIGO_IBGE'], 'analise_integrada')
    
    # Metadados
    df_integrado['DATA_CARGA'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df_integrado['VERSAO'] = VERSAO_BASE
    
    # Salvar
    print("\n6. Salvando tabela...")
    output_path = OUTPUT_DIR / 'analise_integrada.parquet'
    df_integrado.to_parquet(output_path, index=False)
    
    # Hash e metadados
    hash_value = GerenciadorIntegridade.calcular_hash_dataframe(df_integrado)
    meta_path = GerenciadorIntegridade.salvar_metadados(output_path, df_integrado, hash_value, validador)
    
    print(f"\n✅ Tabela criada: {output_path}")
    print(f"   Linhas: {len(df_integrado):,}")
    print(f"   Municípios com atividades: {df_integrado['TEM_ATIVIDADE_TECHDENGUE'].sum():,}")
    print(f"   Hash MD5: {hash_value}")
    print(f"   Metadados: {meta_path}")
    
    return df_integrado, validador

# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

def main():
    """Executa criação completa da base integrada"""
    
    print("╔═══════════════════════════════════════════════════════════════════════════════╗")
    print("║           CRIAÇÃO DE BASE DE DADOS INTEGRADA - PROJETO TECHDENGUE            ║")
    print("╚═══════════════════════════════════════════════════════════════════════════════╝")
    print(f"\nVersão: {VERSAO_BASE}")
    print(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"Diretório de saída: {OUTPUT_DIR}")
    
    inicio = datetime.now()
    
    try:
        # Criar tabelas
        dim_municipios, val1 = criar_tabela_municipios()
        fato_dengue, val2 = criar_tabela_dengue_historico()
        fato_atividades, val3 = criar_tabela_atividades()
        analise_integrada, val4 = criar_tabela_cruzada_analise()
        
        # Relatório final
        print("\n" + "="*80)
        print("📊 RELATÓRIO FINAL")
        print("="*80)
        
        print("\n✅ TABELAS CRIADAS:")
        print(f"  1. dim_municipios.parquet ({len(dim_municipios):,} linhas)")
        print(f"  2. fato_dengue_historico.parquet ({len(fato_dengue):,} linhas)")
        print(f"  3. fato_atividades_techdengue.parquet ({len(fato_atividades):,} linhas)")
        print(f"  4. analise_integrada.parquet ({len(analise_integrada):,} linhas)")
        
        # Consolidar validações
        total_avisos = (len(val1.avisos) + len(val2.avisos) + 
                       len(val3.avisos) + len(val4.avisos))
        total_erros = (len(val1.erros) + len(val2.erros) + 
                      len(val3.erros) + len(val4.erros))
        
        print(f"\n📋 VALIDAÇÕES:")
        print(f"  • Avisos: {total_avisos}")
        print(f"  • Erros: {total_erros}")
        
        if total_erros > 0:
            print("\n⚠️  ATENÇÃO: Erros encontrados durante a validação!")
        
        duracao = (datetime.now() - inicio).total_seconds()
        print(f"\n⏱️  Tempo de processamento: {duracao:.2f} segundos")
        
        print("\n✅ BASE INTEGRADA CRIADA COM SUCESSO!")
        print(f"\nTodas as tabelas estão em: {OUTPUT_DIR}")
        print("Cada tabela possui um arquivo .json com metadados e hash MD5")
        
    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
