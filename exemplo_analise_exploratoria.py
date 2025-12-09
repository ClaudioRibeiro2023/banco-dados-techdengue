"""
Exemplo de Análise Exploratória de Dados (EDA) - Projeto TechDengue
Integra dados de dengue, atividades do projeto e informações municipais

Autor: Sistema de Análise TechDengue
Data: Outubro 2025
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Configurar estilo dos gráficos
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

# Caminhos das bases de dados
BASE_DIR = Path(r"C:\Users\claud\CascadeProjects\banco-dados-techdengue\base_dados")

class AnaliseTechDengue:
    """Classe para análises integradas do projeto TechDengue"""
    
    def __init__(self):
        self.df_dengue_2024 = None
        self.df_dengue_2025 = None
        self.df_atividades = None
        self.df_ibge = None
        self.df_mapa_consorcio = None
        
    def carregar_dados(self):
        """Carrega todas as bases de dados necessárias"""
        print("📂 Carregando bases de dados...")
        
        # Carregar dados de dengue
        print("  - Carregando dados de dengue 2024...")
        self.df_dengue_2024 = pd.read_excel(
            BASE_DIR / "dados_dengue" / "base.dengue.2024.xlsx"
        )
        
        print("  - Carregando dados de dengue 2025...")
        self.df_dengue_2025 = pd.read_excel(
            BASE_DIR / "dados_dengue" / "base.dengue.2025.xlsx"
        )
        
        # Carregar dados do TechDengue
        arquivo_techdengue = BASE_DIR / "dados_techdengue" / "Atividades Techdengue.xlsx"
        
        print("  - Carregando atividades TechDengue...")
        self.df_atividades = pd.read_excel(
            arquivo_techdengue,
            sheet_name='Atividades Techdengue'
        )
        
        print("  - Carregando dados IBGE...")
        self.df_ibge = pd.read_excel(
            arquivo_techdengue,
            sheet_name='IBGE'
        )
        
        print("  - Carregando dados consolidados...")
        self.df_mapa_consorcio = pd.read_excel(
            arquivo_techdengue,
            sheet_name='Atividades (com sub)'
        )
        
        print("✅ Todas as bases carregadas com sucesso!\n")
        
    def preprocessar_dados(self):
        """Preprocessa os dados para análises"""
        print("🔧 Preprocessando dados...")
        
        # Usar coluna Total que já existe nos arquivos (ou recalcular se não existir)
        if 'Total' in self.df_dengue_2024.columns:
            self.df_dengue_2024['total_casos_2024'] = self.df_dengue_2024['Total']
        else:
            colunas_se_2024 = [col for col in self.df_dengue_2024.columns if col.startswith('Semana')]
            self.df_dengue_2024['total_casos_2024'] = self.df_dengue_2024[colunas_se_2024].sum(axis=1)
        
        # Calcular total de casos de dengue 2025 (parcial)
        if 'Total' in self.df_dengue_2025.columns:
            self.df_dengue_2025['total_casos_2025'] = self.df_dengue_2025['Total']
        else:
            colunas_se_2025 = [col for col in self.df_dengue_2025.columns if col.startswith('Semana')]
            self.df_dengue_2025['total_casos_2025'] = self.df_dengue_2025[colunas_se_2025].sum(axis=1)
        
        # Converter datas
        if 'DATA_MAP' in self.df_atividades.columns:
            self.df_atividades['DATA_MAP'] = pd.to_datetime(self.df_atividades['DATA_MAP'], errors='coerce')
        
        print("✅ Preprocessamento concluído!\n")
        
    def estatisticas_gerais(self):
        """Exibe estatísticas gerais das bases"""
        print("=" * 80)
        print("📊 ESTATÍSTICAS GERAIS")
        print("=" * 80)
        
        # Dengue 2024
        print("\n🦟 DENGUE 2024:")
        print(f"  • Total de municípios: {len(self.df_dengue_2024):,}")
        print(f"  • Total de casos: {self.df_dengue_2024['total_casos_2024'].sum():,}")
        print(f"  • Média de casos por município: {self.df_dengue_2024['total_casos_2024'].mean():.1f}")
        print(f"  • Município com mais casos: {self.df_dengue_2024.loc[self.df_dengue_2024['total_casos_2024'].idxmax(), 'Municipio']} ({self.df_dengue_2024['total_casos_2024'].max():,} casos)")
        
        # Dengue 2025
        print("\n🦟 DENGUE 2025 (parcial):")
        print(f"  • Total de municípios: {len(self.df_dengue_2025):,}")
        print(f"  • Total de casos: {self.df_dengue_2025['total_casos_2025'].sum():,}")
        print(f"  • Média de casos por município: {self.df_dengue_2025['total_casos_2025'].mean():.1f}")
        
        # Atividades
        print("\n🔬 ATIVIDADES TECHDENGUE:")
        print(f"  • Total de atividades: {len(self.df_atividades):,}")
        print(f"  • Total de POIs identificados: {self.df_atividades['POIS'].sum():,}")
        print(f"  • Média de POIs por atividade: {self.df_atividades['POIS'].mean():.1f}")
        print(f"  • Total de devolutivas: {self.df_atividades['DEVOLUTIVAS'].sum():,}")
        print(f"  • Taxa de conversão (devolutivas/POIs): {(self.df_atividades['DEVOLUTIVAS'].sum() / self.df_atividades['POIS'].sum() * 100):.1f}%")
        
        # Contratantes
        print("\n🏛️ CONTRATANTES:")
        top_contratantes = self.df_atividades.groupby('CONTRATANTE').size().nlargest(5)
        for i, (contratante, qtd) in enumerate(top_contratantes.items(), 1):
            print(f"  {i}. {contratante}: {qtd} atividades")
            
    def top_municipios_dengue(self, ano=2024, top_n=10):
        """Exibe os municípios com mais casos de dengue"""
        print(f"\n{'=' * 80}")
        print(f"🏙️ TOP {top_n} MUNICÍPIOS COM MAIS CASOS DE DENGUE - {ano}")
        print("=" * 80)
        
        if ano == 2024:
            df = self.df_dengue_2024
            coluna = 'total_casos_2024'
        else:
            df = self.df_dengue_2025
            coluna = 'total_casos_2025'
        
        top = df.nlargest(top_n, coluna)[['Municipio', coluna]]
        
        for i, row in enumerate(top.itertuples(), 1):
            casos = getattr(row, coluna)
            print(f"  {i:2d}. {row.Municipio:30s} - {casos:6,} casos")
            
    def analise_por_regiao(self):
        """Análise de atividades por macrorregião"""
        print("\n" + "=" * 80)
        print("🗺️ ANÁLISE POR MACRORREGIÃO")
        print("=" * 80)
        
        # Agrupar por macrorregião
        analise = self.df_mapa_consorcio.groupby('Macrorregião de Saúde').agg({
            'CODIGO IBGE': 'count',
            'POIS': 'sum',
            'devolutivas': 'sum',
            'HECTARES_MAPEADOS': lambda x: pd.to_numeric(x, errors='coerce').sum()
        }).round(2)
        
        analise.columns = ['Municípios', 'Total POIs', 'Total Devolutivas', 'Hectares Mapeados']
        analise = analise.sort_values('Total POIs', ascending=False)
        
        print("\n📊 Resumo por Macrorregião:")
        print(analise.to_string())
        
    def analise_temporal(self):
        """Análise temporal das atividades"""
        print("\n" + "=" * 80)
        print("📅 ANÁLISE TEMPORAL DAS ATIVIDADES")
        print("=" * 80)
        
        # Filtrar dados válidos
        df_temp = self.df_atividades[self.df_atividades['DATA_MAP'].notna()].copy()
        
        # Extrair mês e ano
        df_temp['ano_mes'] = df_temp['DATA_MAP'].dt.to_period('M')
        
        # Agrupar por mês
        atividades_mes = df_temp.groupby('ano_mes').agg({
            'NOMENCLATURA_ATIVIDADE': 'count',
            'POIS': 'sum',
            'DEVOLUTIVAS': 'sum'
        }).tail(12)  # Últimos 12 meses
        
        atividades_mes.columns = ['Atividades', 'POIs', 'Devolutivas']
        
        print("\n📊 Últimos 12 meses:")
        print(atividades_mes.to_string())
        
    def analise_produtividade(self):
        """Análise de produtividade (POIs por hectare)"""
        print("\n" + "=" * 80)
        print("⚡ ANÁLISE DE PRODUTIVIDADE")
        print("=" * 80)
        
        # Converter hectares para numérico
        df_prod = self.df_mapa_consorcio.copy()
        df_prod['HECTARES_NUM'] = pd.to_numeric(df_prod['HECTARES_MAPEADOS'], errors='coerce')
        
        # Calcular POIs por hectare
        df_prod['pois_por_hectare'] = df_prod['POIS'] / df_prod['HECTARES_NUM']
        
        # Filtrar valores válidos
        df_prod = df_prod[df_prod['pois_por_hectare'].notna() & (df_prod['pois_por_hectare'] > 0)]
        
        print(f"\n📊 Estatísticas de POIs por Hectare:")
        print(f"  • Média: {df_prod['pois_por_hectare'].mean():.2f} POIs/ha")
        print(f"  • Mediana: {df_prod['pois_por_hectare'].median():.2f} POIs/ha")
        print(f"  • Desvio padrão: {df_prod['pois_por_hectare'].std():.2f} POIs/ha")
        print(f"  • Mínimo: {df_prod['pois_por_hectare'].min():.2f} POIs/ha")
        print(f"  • Máximo: {df_prod['pois_por_hectare'].max():.2f} POIs/ha")
        
        # Top 5 mais produtivos
        print("\n🏆 Top 5 municípios mais produtivos (POIs/hectare):")
        top_prod = df_prod.nlargest(5, 'pois_por_hectare')[['Municipio', 'pois_por_hectare', 'POIS', 'HECTARES_NUM']]
        for i, row in enumerate(top_prod.itertuples(), 1):
            print(f"  {i}. {row.Municipio}: {row.pois_por_hectare:.2f} POIs/ha ({row.POIS} POIs em {row.HECTARES_NUM:.1f} ha)")
            
    def criar_visualizacoes(self):
        """Cria visualizações básicas"""
        print("\n" + "=" * 80)
        print("📈 GERANDO VISUALIZAÇÕES")
        print("=" * 80)
        
        # Criar diretório para gráficos
        output_dir = Path("visualizacoes")
        output_dir.mkdir(exist_ok=True)
        
        # 1. Top 10 municípios com dengue
        plt.figure(figsize=(12, 6))
        top10 = self.df_dengue_2024.nlargest(10, 'total_casos_2024')
        plt.barh(range(len(top10)), top10['total_casos_2024'].values)
        plt.yticks(range(len(top10)), top10['Municipio'].values)
        plt.xlabel('Total de Casos')
        plt.title('Top 10 Municípios com Mais Casos de Dengue - 2024')
        plt.tight_layout()
        plt.savefig(output_dir / 'top10_dengue_2024.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("  ✓ Gráfico 'top10_dengue_2024.png' salvo")
        
        # 2. Distribuição de POIs
        plt.figure(figsize=(10, 6))
        plt.hist(self.df_atividades['POIS'], bins=50, edgecolor='black')
        plt.xlabel('Número de POIs')
        plt.ylabel('Frequência')
        plt.title('Distribuição de POIs por Atividade')
        plt.tight_layout()
        plt.savefig(output_dir / 'distribuicao_pois.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("  ✓ Gráfico 'distribuicao_pois.png' salvo")
        
        # 3. Atividades por contratante
        plt.figure(figsize=(12, 6))
        contratantes = self.df_atividades.groupby('CONTRATANTE').size().nlargest(10)
        contratantes.plot(kind='bar')
        plt.xlabel('Contratante')
        plt.ylabel('Número de Atividades')
        plt.title('Top 10 Contratantes por Número de Atividades')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(output_dir / 'atividades_por_contratante.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("  ✓ Gráfico 'atividades_por_contratante.png' salvo")
        
        print(f"\n✅ Visualizações salvas em: {output_dir.absolute()}")
        
    def gerar_relatorio_executivo(self):
        """Gera relatório executivo em texto"""
        print("\n" + "=" * 80)
        print("📄 GERANDO RELATÓRIO EXECUTIVO")
        print("=" * 80)
        
        relatorio = f"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    RELATÓRIO EXECUTIVO - PROJETO TECHDENGUE                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}

1. RESUMO DE DADOS EPIDEMIOLÓGICOS
───────────────────────────────────

Dengue 2024:
  • Total de casos: {self.df_dengue_2024['total_casos_2024'].sum():,}
  • Municípios afetados: {len(self.df_dengue_2024[self.df_dengue_2024['total_casos_2024'] > 0]):,}
  • Média por município: {self.df_dengue_2024['total_casos_2024'].mean():.1f} casos

Dengue 2025 (parcial):
  • Total de casos: {self.df_dengue_2025['total_casos_2025'].sum():,}
  • Variação em relação a 2024: {((self.df_dengue_2025['total_casos_2025'].sum() / self.df_dengue_2024['total_casos_2024'].sum() - 1) * 100):.1f}%

2. RESUMO OPERACIONAL TECHDENGUE
─────────────────────────────────

Atividades:
  • Total de atividades realizadas: {len(self.df_atividades):,}
  • Municípios atendidos: {self.df_atividades['CONTRATANTE'].nunique():,}
  • Período de atuação: {self.df_atividades['DATA_MAP'].min().strftime('%m/%Y')} a {self.df_atividades['DATA_MAP'].max().strftime('%m/%Y')}

Pontos de Interesse (POIs):
  • Total identificado: {self.df_atividades['POIS'].sum():,}
  • Média por atividade: {self.df_atividades['POIS'].mean():.1f}
  • Mediana: {self.df_atividades['POIS'].median():.1f}

Devolutivas:
  • Total de devolutivas: {self.df_atividades['DEVOLUTIVAS'].sum():,}
  • Taxa de conversão: {(self.df_atividades['DEVOLUTIVAS'].sum() / self.df_atividades['POIS'].sum() * 100):.1f}%

3. PRINCIPAIS INSIGHTS
───────────────────────

✓ O projeto TechDengue está ativo em {self.df_atividades['CONTRATANTE'].nunique()} municípios
✓ Foram identificados {self.df_atividades['POIS'].sum():,} pontos de interesse potenciais
✓ A taxa de conversão POIs → Devolutivas é de {(self.df_atividades['DEVOLUTIVAS'].sum() / self.df_atividades['POIS'].sum() * 100):.1f}%
✓ Principais contratantes: {', '.join(self.df_atividades.groupby('CONTRATANTE').size().nlargest(3).index.tolist())}

4. PRÓXIMOS PASSOS SUGERIDOS
─────────────────────────────

□ Análise de correlação: Casos de dengue vs. atividades TechDengue
□ Análise espacial: Mapeamento de hotspots
□ Análise de efetividade: Impacto das devolutivas nos indicadores
□ Dashboard interativo: Visualização em tempo real
□ Modelo preditivo: Previsão de surtos

═══════════════════════════════════════════════════════════════════════════════
        """
        
        # Salvar relatório
        with open('relatorio_executivo.txt', 'w', encoding='utf-8') as f:
            f.write(relatorio)
        
        print(relatorio)
        print(f"✅ Relatório salvo em: relatorio_executivo.txt")

def main():
    """Função principal"""
    print("╔═══════════════════════════════════════════════════════════════════════════════╗")
    print("║              ANÁLISE EXPLORATÓRIA DE DADOS - PROJETO TECHDENGUE              ║")
    print("╚═══════════════════════════════════════════════════════════════════════════════╝\n")
    
    # Inicializar análise
    analise = AnaliseTechDengue()
    
    # Executar análises
    analise.carregar_dados()
    analise.preprocessar_dados()
    analise.estatisticas_gerais()
    analise.top_municipios_dengue(ano=2024, top_n=10)
    analise.analise_por_regiao()
    analise.analise_temporal()
    analise.analise_produtividade()
    analise.criar_visualizacoes()
    analise.gerar_relatorio_executivo()
    
    print("\n" + "=" * 80)
    print("✅ ANÁLISE CONCLUÍDA COM SUCESSO!")
    print("=" * 80)
    print("\nArquivos gerados:")
    print("  • relatorio_executivo.txt")
    print("  • visualizacoes/top10_dengue_2024.png")
    print("  • visualizacoes/distribuicao_pois.png")
    print("  • visualizacoes/atividades_por_contratante.png")
    print("\n")

if __name__ == "__main__":
    main()
