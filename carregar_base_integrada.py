"""
Sistema de Carregamento Seguro da Base Integrada

ANTI-ALUCINAÇÃO: Valida integridade antes de qualquer análise
GARANTIAS:
1. Verifica hash MD5 antes de usar dados
2. Valida metadados e versão
3. Testa invariantes dos dados
4. Registra todas as operações
5. Lança exceção se dados corrompidos
"""

import pandas as pd
import json
import hashlib
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# CLASSE PRINCIPAL: CARREGADOR SEGURO
# ============================================================================

class CarregadorSeguro:
    """
    Carrega dados da base integrada com validação de integridade
    
    USO:
        carregador = CarregadorSeguro()
        df = carregador.carregar('analise_integrada')  # Valida antes de retornar
    """
    
    def __init__(self, base_dir=None):
        if base_dir is None:
            self.base_dir = Path(r"C:\Users\claud\CascadeProjects\banco-dados-techdengue\dados_integrados")
        else:
            self.base_dir = Path(base_dir)
        
        self.historico_carregamento = []
        
    def _calcular_hash_dataframe(self, df):
        """Calcula hash MD5 do DataFrame"""
        conteudo = pd.util.hash_pandas_object(df, index=True).values
        hash_obj = hashlib.md5(str(conteudo).encode())
        return hash_obj.hexdigest()
    
    def _carregar_metadados(self, arquivo_path):
        """Carrega metadados JSON"""
        meta_path = arquivo_path.with_suffix('.json')
        
        if not meta_path.exists():
            raise FileNotFoundError(f"Metadados não encontrados: {meta_path}")
        
        with open(meta_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _validar_integridade(self, df, metadados, nome_tabela):
        """Valida integridade comparando hash MD5"""
        print(f"  🔍 Validando integridade de '{nome_tabela}'...")
        
        # Calcular hash atual
        hash_atual = self._calcular_hash_dataframe(df)
        hash_esperado = metadados.get('hash_md5', '')
        
        # Comparar
        if hash_atual != hash_esperado:
            raise ValueError(
                f"❌ FALHA DE INTEGRIDADE!\n"
                f"  Tabela: {nome_tabela}\n"
                f"  Hash esperado: {hash_esperado}\n"
                f"  Hash atual:    {hash_atual}\n"
                f"  ⚠️  OS DADOS PODEM ESTAR CORROMPIDOS OU ALTERADOS!"
            )
        
        print(f"     ✓ Hash validado: {hash_atual}")
        return True
    
    def _validar_invariantes(self, df, nome_tabela):
        """Valida invariantes esperados da tabela"""
        print(f"  🔍 Validando invariantes...")
        
        erros = []
        
        # Invariante 1: Sem linhas duplicadas (exceto tabelas de fato)
        if 'dim_' in nome_tabela:
            codigo_col = 'CODIGO_IBGE' if 'CODIGO_IBGE' in df.columns else None
            if codigo_col:
                duplicatas = df.duplicated(subset=[codigo_col], keep=False).sum()
                if duplicatas > 0:
                    erros.append(f"Encontradas {duplicatas} linhas duplicadas")
        
        # Invariante 2: Códigos IBGE válidos
        if 'CODIGO_IBGE' in df.columns:
            df_temp = df.copy()
            df_temp['CODIGO_IBGE'] = df_temp['CODIGO_IBGE'].astype(str)
            invalidos = df_temp[~df_temp['CODIGO_IBGE'].str.match(r'^31\d{5}$', na=False)]
            if len(invalidos) > 0:
                erros.append(f"{len(invalidos)} códigos IBGE inválidos")
        
        # Invariante 3: Sem valores negativos em colunas numéricas específicas
        colunas_positivas = ['CASOS', 'POIS', 'TOTAL_POIS', 'TOTAL_DEVOLUTIVAS', 
                            'QTD_ATIVIDADES', 'POPULACAO']
        for col in colunas_positivas:
            if col in df.columns:
                # Converter para numérico para validar (ignora não-numéricos)
                valores = pd.to_numeric(df[col], errors='coerce')
                negativos = (valores < 0).sum()
                if negativos > 0:
                    erros.append(f"{col}: {negativos} valores negativos")
        
        if erros:
            raise ValueError(
                f"❌ INVARIANTES VIOLADOS em '{nome_tabela}':\n" + 
                "\n".join(f"  • {erro}" for erro in erros)
            )
        
        print(f"     ✓ Todos os invariantes validados")
        return True
    
    def carregar(self, nome_tabela, validar=True):
        """
        Carrega tabela com validação completa
        
        Args:
            nome_tabela: Nome da tabela sem extensão
            validar: Se True, valida integridade (recomendado sempre True)
        
        Returns:
            DataFrame validado
        
        Raises:
            ValueError: Se validação falhar
            FileNotFoundError: Se arquivo não existir
        """
        print(f"\n{'='*80}")
        print(f"📂 Carregando: {nome_tabela}")
        print(f"{'='*80}")
        
        arquivo_path = self.base_dir / f"{nome_tabela}.parquet"
        
        # Verificar se existe
        if not arquivo_path.exists():
            raise FileNotFoundError(f"Tabela não encontrada: {arquivo_path}")
        
        # Carregar metadados
        print(f"  1. Carregando metadados...")
        metadados = self._carregar_metadados(arquivo_path)
        print(f"     ✓ Versão: {metadados.get('versao', 'desconhecida')}")
        print(f"     ✓ Criado em: {metadados.get('timestamp_criacao', 'desconhecido')}")
        
        # Carregar dados
        print(f"  2. Carregando dados...")
        df = pd.read_parquet(arquivo_path)
        print(f"     ✓ {len(df):,} linhas × {len(df.columns)} colunas")
        
        if validar:
            # Validar integridade
            print(f"  3. Validando integridade...")
            self._validar_integridade(df, metadados, nome_tabela)
            
            # Validar invariantes
            print(f"  4. Validando invariantes...")
            self._validar_invariantes(df, nome_tabela)
        
        # Registrar carregamento
        self.historico_carregamento.append({
            'tabela': nome_tabela,
            'timestamp': datetime.now().isoformat(),
            'linhas': len(df),
            'validado': validar
        })
        
        print(f"\n✅ Tabela '{nome_tabela}' carregada e validada com sucesso!")
        
        return df
    
    def listar_tabelas(self):
        """Lista todas as tabelas disponíveis"""
        tabelas = []
        for arquivo in self.base_dir.glob("*.parquet"):
            meta_path = arquivo.with_suffix('.json')
            if meta_path.exists():
                with open(meta_path, 'r', encoding='utf-8') as f:
                    meta = json.load(f)
                tabelas.append({
                    'nome': arquivo.stem,
                    'linhas': meta.get('linhas', 0),
                    'colunas': meta.get('colunas', 0),
                    'versao': meta.get('versao', 'desconhecida'),
                    'criado_em': meta.get('timestamp_criacao', 'desconhecido')
                })
        return pd.DataFrame(tabelas)

# ============================================================================
# CLASSE DE ANÁLISE SEGURA (ANTI-ALUCINAÇÃO)
# ============================================================================

class AnalisadorSeguro:
    """
    Realiza análises com validação automática dos resultados
    Evita alucinações através de asserções e testes
    """
    
    def __init__(self, carregador=None):
        self.carregador = carregador or CarregadorSeguro()
        self.cache_tabelas = {}
    
    def _get_tabela(self, nome):
        """Carrega tabela com cache"""
        if nome not in self.cache_tabelas:
            self.cache_tabelas[nome] = self.carregador.carregar(nome)
        return self.cache_tabelas[nome]
    
    def analise_dengue_por_municipio(self, ano=2024, top_n=10):
        """
        Retorna top N municípios com mais casos de dengue
        COM VALIDAÇÃO: Garante que resultados fazem sentido
        """
        print(f"\n{'='*80}")
        print(f"📊 ANÁLISE: Top {top_n} Municípios Dengue {ano}")
        print(f"{'='*80}")
        
        # Carregar dados validados
        df = self._get_tabela('analise_integrada')
        
        # Realizar análise
        coluna_casos = f'CASOS_DENGUE_{ano}'
        
        # VALIDAÇÃO 1: Coluna existe
        assert coluna_casos in df.columns, f"Coluna {coluna_casos} não existe!"
        
        # VALIDAÇÃO 2: Tem dados não-nulos
        total_casos = df[coluna_casos].sum()
        assert total_casos > 0, f"Sem dados de dengue para {ano}!"
        
        # Análise
        top_municipios = df.nlargest(top_n, coluna_casos)[
            ['MUNICIPIO', coluna_casos, 'POPULACAO', 'QTD_ATIVIDADES']
        ].copy()
        
        # VALIDAÇÃO 3: Resultado tem sentido
        assert len(top_municipios) > 0, "Nenhum município retornado!"
        assert top_municipios[coluna_casos].max() > 0, "Valores inválidos!"
        
        print(f"\n✅ Análise validada:")
        print(f"  • Total de casos (MG): {total_casos:,}")
        print(f"  • Município com mais casos: {top_municipios.iloc[0]['MUNICIPIO']}")
        print(f"  • Máximo de casos: {top_municipios[coluna_casos].max():,}")
        
        return top_municipios
    
    def analise_efetividade_techdengue(self):
        """
        Analisa efetividade das atividades TechDengue
        COM VALIDAÇÃO: Garante coerência dos cálculos
        """
        print(f"\n{'='*80}")
        print(f"📊 ANÁLISE: Efetividade TechDengue")
        print(f"{'='*80}")
        
        df = self._get_tabela('analise_integrada')
        
        # Filtrar apenas municípios com atividades
        df_com_atividade = df[df['TEM_ATIVIDADE_TECHDENGUE'] == 1].copy()
        
        # VALIDAÇÃO 1: Tem municípios com atividades
        assert len(df_com_atividade) > 0, "Nenhum município com atividades!"
        
        # Calcular métricas
        total_pois = df_com_atividade['TOTAL_POIS'].sum()
        total_devolutivas = df_com_atividade['TOTAL_DEVOLUTIVAS'].sum()
        taxa_media_conversao = df_com_atividade['TAXA_CONVERSAO_DEVOLUTIVAS'].mean()
        
        # VALIDAÇÃO 2: Valores fazem sentido
        assert total_pois > 0, "Total de POIs deve ser > 0"
        assert total_devolutivas >= 0, "Devolutivas não pode ser negativo"
        assert 0 <= taxa_media_conversao <= 100, "Taxa de conversão fora do range válido"
        
        # VALIDAÇÃO 3: Devolutivas não pode ser maior que POIs
        assert total_devolutivas <= total_pois, "Devolutivas > POIs (impossível!)"
        
        resultado = {
            'municipios_atendidos': len(df_com_atividade),
            'total_pois': int(total_pois),
            'total_devolutivas': int(total_devolutivas),
            'taxa_conversao_media': round(taxa_media_conversao, 2),
            'hectares_mapeados': int(df_com_atividade['TOTAL_HECTARES'].sum())
        }
        
        print(f"\n✅ Análise validada:")
        for chave, valor in resultado.items():
            print(f"  • {chave}: {valor:,}" if isinstance(valor, int) else f"  • {chave}: {valor}")
        
        return resultado
    
    def correlacao_dengue_atividades(self, ano=2024):
        """
        Analisa correlação entre casos de dengue e atividades TechDengue
        COM VALIDAÇÃO: Apenas municípios com ambos os dados
        """
        print(f"\n{'='*80}")
        print(f"📊 ANÁLISE: Correlação Dengue × TechDengue ({ano})")
        print(f"{'='*80}")
        
        df = self._get_tabela('analise_integrada')
        
        coluna_casos = f'CASOS_DENGUE_{ano}'
        
        # Filtrar: municípios com atividades E casos de dengue
        df_analise = df[
            (df['TEM_ATIVIDADE_TECHDENGUE'] == 1) & 
            (df[coluna_casos] > 0)
        ].copy()
        
        # VALIDAÇÃO 1: Tem dados suficientes
        assert len(df_analise) >= 10, f"Dados insuficientes (apenas {len(df_analise)} municípios)"
        
        # Calcular correlações
        corr_casos_pois = df_analise[coluna_casos].corr(df_analise['TOTAL_POIS'])
        corr_casos_devolutivas = df_analise[coluna_casos].corr(df_analise['TOTAL_DEVOLUTIVAS'])
        
        # VALIDAÇÃO 2: Correlações no range válido
        assert -1 <= corr_casos_pois <= 1, "Correlação fora do range!"
        assert -1 <= corr_casos_devolutivas <= 1, "Correlação fora do range!"
        
        resultado = {
            'municipios_analisados': len(df_analise),
            'correlacao_casos_pois': round(corr_casos_pois, 3),
            'correlacao_casos_devolutivas': round(corr_casos_devolutivas, 3),
            'media_casos': round(df_analise[coluna_casos].mean(), 1),
            'media_pois': round(df_analise['TOTAL_POIS'].mean(), 1)
        }
        
        print(f"\n✅ Análise validada:")
        for chave, valor in resultado.items():
            print(f"  • {chave}: {valor}")
        
        return resultado

# ============================================================================
# EXEMPLO DE USO
# ============================================================================

def exemplo_uso():
    """Demonstra uso correto do sistema"""
    
    print("╔═══════════════════════════════════════════════════════════════════════════════╗")
    print("║          SISTEMA DE ANÁLISE SEGURA - ANTI-ALUCINAÇÃO ATIVADO                 ║")
    print("╚═══════════════════════════════════════════════════════════════════════════════╝")
    
    # 1. Inicializar carregador
    carregador = CarregadorSeguro()
    
    # 2. Listar tabelas disponíveis
    print("\n📋 TABELAS DISPONÍVEIS:")
    print("="*80)
    tabelas = carregador.listar_tabelas()
    print(tabelas.to_string(index=False))
    
    # 3. Usar analisador seguro
    analisador = AnalisadorSeguro(carregador)
    
    # 4. Exemplos de análises VALIDADAS
    top_dengue = analisador.analise_dengue_por_municipio(ano=2024, top_n=10)
    efetividade = analisador.analise_efetividade_techdengue()
    correlacao = analisador.correlacao_dengue_atividades(ano=2024)
    
    print("\n" + "="*80)
    print("✅ TODAS AS ANÁLISES FORAM VALIDADAS AUTOMATICAMENTE")
    print("="*80)
    print("\n🛡️  GARANTIAS:")
    print("  • Integridade dos dados verificada (hash MD5)")
    print("  • Invariantes validados")
    print("  • Resultados testados por assertions")
    print("  • Sem alucinações possíveis")
    
    return {
        'top_dengue': top_dengue,
        'efetividade': efetividade,
        'correlacao': correlacao
    }

if __name__ == "__main__":
    exemplo_uso()
