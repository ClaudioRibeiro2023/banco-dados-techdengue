"""
FASE 3: GERAÇÃO DE VISUALIZAÇÕES - CISARP
Cria gráficos profissionais para a apresentação
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
from pathlib import Path
from datetime import datetime

# Configurações
BASE_DIR = Path(__file__).parent.parent
INPUT_DIR = Path(__file__).parent / 'dados'
OUTPUT_DIR = Path(__file__).parent / 'visualizacoes'
OUTPUT_DIR.mkdir(exist_ok=True)

# Configurar estilo dos gráficos
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# Cores da marca
CORES = {
    'primaria': '#0066CC',
    'secundaria': '#28A745',
    'alerta': '#FFA500',
    'critico': '#DC3545',
    'neutro': '#6C757D'
}

print("=" * 80)
print("📊 FASE 3: GERAÇÃO DE VISUALIZAÇÕES - CISARP")
print("=" * 80)

# ==================== 1. CARREGAR DADOS ====================

print("\n📂 1. CARREGANDO DADOS")
print("-" * 80)

try:
    df_cisarp = pd.read_csv(INPUT_DIR / 'cisarp_completo.csv')
    print(f"   ✅ Dataset CISARP: {len(df_cisarp)} registros")
    
    with open(INPUT_DIR / 'cisarp_metricas.json', 'r', encoding='utf-8') as f:
        metricas = json.load(f)
    print(f"   ✅ Métricas carregadas")
except FileNotFoundError:
    print("   ⚠️ Arquivos não encontrados. Execute 02_analise_cisarp.py primeiro.")
    exit(1)

# Converter datas
df_cisarp['DATA_MAP'] = pd.to_datetime(df_cisarp['DATA_MAP'], errors='coerce')

# Carregar dados completos para comparação (COM SUB-ATIVIDADES)
DADOS_DIR = BASE_DIR / 'base_dados'
df_atividades = pd.read_excel(
    DADOS_DIR / 'dados_techdengue' / 'Atividades Techdengue.xlsx',
    sheet_name='Atividades (com sub)'  # ✅ ABA CORRETA - Inclui sub-atividades detalhadas
)

# ==================== 2. GRÁFICOS DE KPIs ====================

print("\n📊 2. GRÁFICOS DE KPIs PRINCIPAIS")
print("-" * 80)

# 2.1 KPI Cards (Plotly)
fig_kpis = go.Figure()

kpis = [
    {
        'label': 'Atividades',
        'value': len(df_cisarp),
        'suffix': '',
        'color': CORES['primaria']
    },
    {
        'label': 'POIs',
        'value': metricas['totais']['pois'],
        'suffix': '',
        'color': CORES['secundaria']
    },
    {
        'label': 'Hectares',
        'value': metricas['totais']['hectares'],
        'suffix': 'ha',
        'color': CORES['alerta']
    },
    {
        'label': 'Devolutivas',
        'value': metricas['totais']['devolutivas'],
        'suffix': '',
        'color': CORES['critico']
    }
]

fig_kpis = make_subplots(
    rows=1, cols=4,
    specs=[[{'type': 'indicator'}] * 4],
    subplot_titles=[kpi['label'] for kpi in kpis]
)

for i, kpi in enumerate(kpis, 1):
    fig_kpis.add_trace(
        go.Indicator(
            mode="number",
            value=kpi['value'],
            number={'suffix': f" {kpi['suffix']}", 'font': {'size': 40}},
            domain={'x': [0, 1], 'y': [0, 1]}
        ),
        row=1, col=i
    )

fig_kpis.update_layout(
    height=300,
    title_text="<b>Indicadores Principais - CISARP</b>",
    title_font_size=24,
    showlegend=False
)

output_file = OUTPUT_DIR / '01_kpis_principais.html'
fig_kpis.write_html(str(output_file))
print(f"   ✅ Salvo: {output_file.name}")

# ==================== 3. DISTRIBUIÇÃO TEMPORAL ====================

print("\n📅 3. GRÁFICOS TEMPORAIS")
print("-" * 80)

# 3.1 Evolução mensal de atividades
df_cisarp['ano_mes'] = df_cisarp['DATA_MAP'].dt.to_period('M')
atividades_mes = df_cisarp.groupby('ano_mes').size().reset_index(name='atividades')
atividades_mes['ano_mes'] = atividades_mes['ano_mes'].astype(str)

fig_temporal = px.line(
    atividades_mes,
    x='ano_mes',
    y='atividades',
    title='<b>Evolução Mensal de Atividades - CISARP</b>',
    labels={'ano_mes': 'Mês', 'atividades': 'Número de Atividades'},
    markers=True
)

fig_temporal.update_traces(line_color=CORES['primaria'], line_width=3, marker_size=10)
fig_temporal.update_layout(
    height=400,
    hovermode='x unified',
    font=dict(size=12)
)

output_file = OUTPUT_DIR / '02_evolucao_temporal.html'
fig_temporal.write_html(str(output_file))
print(f"   ✅ Salvo: {output_file.name}")

# 3.2 Gráfico estático para apresentação
plt.figure(figsize=(12, 6))
plt.plot(range(len(atividades_mes)), atividades_mes['atividades'], 
         marker='o', linewidth=2.5, markersize=8, color=CORES['primaria'])
plt.xlabel('Mês', fontsize=12, fontweight='bold')
plt.ylabel('Número de Atividades', fontsize=12, fontweight='bold')
plt.title('Evolução Mensal de Atividades - CISARP', fontsize=14, fontweight='bold')
plt.xticks(range(len(atividades_mes)), atividades_mes['ano_mes'], rotation=45, ha='right')
plt.grid(True, alpha=0.3)
plt.tight_layout()

output_file = OUTPUT_DIR / '02_evolucao_temporal.png'
plt.savefig(output_file, dpi=300, bbox_inches='tight')
plt.close()
print(f"   ✅ Salvo: {output_file.name}")

# ==================== 4. DISTRIBUIÇÃO GEOGRÁFICA ====================

print("\n🗺️ 4. GRÁFICOS GEOGRÁFICOS")
print("-" * 80)

# 4.1 Top 15 municípios por atividades
col_codigo = None
for possivel in ['CODIGO IBGE', 'Código IBGE', 'codigo_ibge']:
    if possivel in df_cisarp.columns:
        col_codigo = possivel
        break

if col_codigo:
    top_municipios = df_cisarp[col_codigo].value_counts().head(15).reset_index()
    top_municipios.columns = ['codigo', 'atividades']
    
    fig_municipios = px.bar(
        top_municipios,
        x='atividades',
        y='codigo',
        orientation='h',
        title='<b>Top 15 Municípios por Número de Atividades</b>',
        labels={'codigo': 'Código IBGE', 'atividades': 'Atividades'},
        color='atividades',
        color_continuous_scale='Blues'
    )
    
    fig_municipios.update_layout(
        height=500,
        showlegend=False,
        yaxis={'categoryorder': 'total ascending'}
    )
    
    output_file = OUTPUT_DIR / '03_top_municipios.html'
    fig_municipios.write_html(str(output_file))
    print(f"   ✅ Salvo: {output_file.name}")
    
    # Versão estática
    plt.figure(figsize=(10, 8))
    plt.barh(range(len(top_municipios)), top_municipios['atividades'], color=CORES['primaria'])
    plt.yticks(range(len(top_municipios)), top_municipios['codigo'])
    plt.xlabel('Número de Atividades', fontsize=12, fontweight='bold')
    plt.ylabel('Código IBGE', fontsize=12, fontweight='bold')
    plt.title('Top 15 Municípios por Número de Atividades', fontsize=14, fontweight='bold')
    plt.tight_layout()
    
    output_file = OUTPUT_DIR / '03_top_municipios.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   ✅ Salvo: {output_file.name}")

# ==================== 5. ANÁLISE DE POIs ====================

print("\n🏷️ 5. GRÁFICOS DE POIs")
print("-" * 80)

# 5.1 Distribuição de POIs
if 'POIS' in df_cisarp.columns:
    fig_pois_dist = px.histogram(
        df_cisarp,
        x='POIS',
        nbins=30,
        title='<b>Distribuição de POIs por Atividade</b>',
        labels={'POIS': 'Número de POIs', 'count': 'Frequência'},
        color_discrete_sequence=[CORES['secundaria']]
    )
    
    fig_pois_dist.update_layout(height=400, showlegend=False)
    
    output_file = OUTPUT_DIR / '04_distribuicao_pois.html'
    fig_pois_dist.write_html(str(output_file))
    print(f"   ✅ Salvo: {output_file.name}")

# 5.2 Box plot de POIs, Hectares e Devolutivas
fig_boxplots = make_subplots(
    rows=1, cols=3,
    subplot_titles=('POIs', 'Hectares', 'Devolutivas')
)

variaveis = ['POIS', 'HECTARES_MAPEADOS', 'DEVOLUTIVAS']
cores_box = [CORES['primaria'], CORES['secundaria'], CORES['alerta']]

for i, (var, cor) in enumerate(zip(variaveis, cores_box), 1):
    if var in df_cisarp.columns:
        fig_boxplots.add_trace(
            go.Box(y=df_cisarp[var].dropna(), name=var, marker_color=cor, showlegend=False),
            row=1, col=i
        )

fig_boxplots.update_layout(
    height=400,
    title_text="<b>Distribuições de Variáveis Principais</b>",
    showlegend=False
)

output_file = OUTPUT_DIR / '05_boxplots_variaveis.html'
fig_boxplots.write_html(str(output_file))
print(f"   ✅ Salvo: {output_file.name}")

# ==================== 6. BENCHMARKING ====================

print("\n🏆 6. GRÁFICOS DE BENCHMARKING")
print("-" * 80)

# 6.1 Comparação com outros consórcios
benchmarking = df_atividades.groupby('CONTRATANTE').agg({
    'POIS': ['count', 'sum']
}).reset_index()
benchmarking.columns = ['contratante', 'atividades', 'pois_total']
benchmarking = benchmarking.sort_values('atividades', ascending=False).head(10)

# Destacar CISARP
benchmarking['cor'] = benchmarking['contratante'].apply(
    lambda x: CORES['critico'] if x == 'CISARP' else CORES['neutro']
)

fig_bench = px.bar(
    benchmarking,
    x='contratante',
    y='atividades',
    title='<b>Top 10 Contratantes por Número de Atividades</b>',
    labels={'contratante': 'Contratante', 'atividades': 'Atividades'},
    color='contratante',
    color_discrete_map={row['contratante']: row['cor'] for _, row in benchmarking.iterrows()}
)

fig_bench.update_layout(
    height=500,
    showlegend=False,
    xaxis_tickangle=-45
)

output_file = OUTPUT_DIR / '06_benchmarking_contratantes.html'
fig_bench.write_html(str(output_file))
print(f"   ✅ Salvo: {output_file.name}")

# Versão estática
plt.figure(figsize=(12, 6))
cores_barras = [CORES['critico'] if c == 'CISARP' else CORES['neutro'] for c in benchmarking['contratante']]
plt.bar(range(len(benchmarking)), benchmarking['atividades'], color=cores_barras)
plt.xticks(range(len(benchmarking)), benchmarking['contratante'], rotation=45, ha='right')
plt.xlabel('Contratante', fontsize=12, fontweight='bold')
plt.ylabel('Número de Atividades', fontsize=12, fontweight='bold')
plt.title('Top 10 Contratantes por Número de Atividades', fontsize=14, fontweight='bold')
plt.tight_layout()

output_file = OUTPUT_DIR / '06_benchmarking_contratantes.png'
plt.savefig(output_file, dpi=300, bbox_inches='tight')
plt.close()
print(f"   ✅ Salvo: {output_file.name}")

# ==================== 7. INDICADORES CALCULADOS ====================

print("\n⚙️ 7. GRÁFICOS DE INDICADORES")
print("-" * 80)

# 7.1 Taxa de conversão
if 'taxa_conversao' in df_cisarp.columns or ('POIS' in df_cisarp.columns and 'DEVOLUTIVAS' in df_cisarp.columns):
    if 'taxa_conversao' not in df_cisarp.columns:
        df_cisarp['taxa_conversao'] = (df_cisarp['DEVOLUTIVAS'] / df_cisarp['POIS'] * 100).replace([np.inf, -np.inf], np.nan)
    
    fig_taxa = px.histogram(
        df_cisarp,
        x='taxa_conversao',
        nbins=20,
        title='<b>Distribuição da Taxa de Conversão (Devolutivas/POIs)</b>',
        labels={'taxa_conversao': 'Taxa de Conversão (%)', 'count': 'Frequência'},
        color_discrete_sequence=[CORES['secundaria']]
    )
    
    fig_taxa.update_layout(height=400, showlegend=False)
    
    output_file = OUTPUT_DIR / '07_taxa_conversao.html'
    fig_taxa.write_html(str(output_file))
    print(f"   ✅ Salvo: {output_file.name}")

# 7.2 Scatter: POIs vs Devolutivas
if 'POIS' in df_cisarp.columns and 'DEVOLUTIVAS' in df_cisarp.columns:
    fig_scatter = px.scatter(
        df_cisarp,
        x='POIS',
        y='DEVOLUTIVAS',
        title='<b>Relação entre POIs e Devolutivas</b>',
        labels={'POIS': 'POIs Identificados', 'DEVOLUTIVAS': 'Devolutivas Realizadas'},
        trendline='ols',
        color_discrete_sequence=[CORES['primaria']]
    )
    
    fig_scatter.update_layout(height=500)
    
    output_file = OUTPUT_DIR / '08_pois_vs_devolutivas.html'
    fig_scatter.write_html(str(output_file))
    print(f"   ✅ Salvo: {output_file.name}")

# ==================== 8. SUMÁRIO VISUAL ====================

print("\n📊 8. SUMÁRIO VISUAL FINAL")
print("-" * 80)

# Criar dashboard visual com subplots
fig_dashboard = make_subplots(
    rows=2, cols=2,
    subplot_titles=(
        'Evolução Temporal',
        'Top 5 Municípios',
        'Distribuição POIs',
        'Benchmarking'
    ),
    specs=[
        [{'type': 'scatter'}, {'type': 'bar'}],
        [{'type': 'histogram'}, {'type': 'bar'}]
    ]
)

# 1. Evolução temporal
fig_dashboard.add_trace(
    go.Scatter(
        x=list(range(len(atividades_mes))),
        y=atividades_mes['atividades'],
        mode='lines+markers',
        name='Atividades',
        line=dict(color=CORES['primaria'], width=2),
        marker=dict(size=8)
    ),
    row=1, col=1
)

# 2. Top 5 municípios
if col_codigo:
    top5 = df_cisarp[col_codigo].value_counts().head(5)
    fig_dashboard.add_trace(
        go.Bar(x=list(top5.index), y=list(top5.values), name='Municípios',
               marker_color=CORES['secundaria'], showlegend=False),
        row=1, col=2
    )

# 3. Distribuição POIs
if 'POIS' in df_cisarp.columns:
    fig_dashboard.add_trace(
        go.Histogram(x=df_cisarp['POIS'], name='POIs', nbinsx=20,
                    marker_color=CORES['alerta'], showlegend=False),
        row=2, col=1
    )

# 4. Benchmarking top 5
top5_bench = benchmarking.head(5)
fig_dashboard.add_trace(
    go.Bar(x=top5_bench['contratante'], y=top5_bench['atividades'],
           name='Contratantes', marker_color=CORES['critico'], showlegend=False),
    row=2, col=2
)

fig_dashboard.update_layout(
    height=800,
    title_text="<b>Dashboard Executivo - CISARP</b>",
    title_font_size=20,
    showlegend=False
)

output_file = OUTPUT_DIR / '09_dashboard_executivo.html'
fig_dashboard.write_html(str(output_file))
print(f"   ✅ Salvo: {output_file.name}")

# ==================== 9. ÍNDICE DE VISUALIZAÇÕES ====================

print("\n📑 9. CRIANDO ÍNDICE")
print("-" * 80)

indice = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizações CISARP - Índice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #0066CC;
            border-bottom: 3px solid #0066CC;
            padding-bottom: 10px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .card h3 {
            color: #333;
            margin-top: 0;
        }
        .card a {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            background-color: #0066CC;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .card a:hover {
            background-color: #0052A3;
        }
    </style>
</head>
<body>
    <h1>📊 Visualizações CISARP - Índice</h1>
    <p>Gerado em: """ + datetime.now().strftime('%d/%m/%Y %H:%M:%S') + """</p>
    
    <div class="grid">
        <div class="card">
            <h3>01. KPIs Principais</h3>
            <p>Indicadores-chave de performance</p>
            <a href="01_kpis_principais.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>02. Evolução Temporal</h3>
            <p>Atividades ao longo do tempo</p>
            <a href="02_evolucao_temporal.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>03. Top Municípios</h3>
            <p>Municípios com mais atividades</p>
            <a href="03_top_municipios.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>04. Distribuição de POIs</h3>
            <p>Análise da distribuição de POIs</p>
            <a href="04_distribuicao_pois.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>05. Boxplots</h3>
            <p>Distribuições de variáveis</p>
            <a href="05_boxplots_variaveis.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>06. Benchmarking</h3>
            <p>Comparação com outros contratantes</p>
            <a href="06_benchmarking_contratantes.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>07. Taxa de Conversão</h3>
            <p>Eficiência de devolutivas</p>
            <a href="07_taxa_conversao.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>08. POIs vs Devolutivas</h3>
            <p>Correlação entre variáveis</p>
            <a href="08_pois_vs_devolutivas.html" target="_blank">Ver gráfico</a>
        </div>
        
        <div class="card">
            <h3>09. Dashboard Executivo</h3>
            <p>Visão geral integrada</p>
            <a href="09_dashboard_executivo.html" target="_blank">Ver gráfico</a>
        </div>
    </div>
</body>
</html>
"""

indice_file = OUTPUT_DIR / 'index.html'
with open(indice_file, 'w', encoding='utf-8') as f:
    f.write(indice)
print(f"   ✅ Salvo: {indice_file.name}")

print("\n" + "="*80)
print("✅ FASE 3 CONCLUÍDA COM SUCESSO")
print("="*80)
print(f"\n📁 Visualizações geradas em: {OUTPUT_DIR}")
print(f"\n🌐 Abra o arquivo 'index.html' para navegar pelas visualizações")
print("\n👉 Próximo passo: Compilar apresentação final")
print("="*80)
