# ⚡ GUIA RÁPIDO - Análise CISARP

## 🚀 Execução em 3 Minutos

### Opção 1: Automática (Recomendado)
```bash
# Duplo-clique ou execute:
EXECUTAR_ANALISE.bat
```
Este script executa todas as 3 fases automaticamente e abre os resultados no navegador.

### Opção 2: Manual (Passo a Passo)

#### Passo 1: Instalar Dependências
```bash
pip install -r requirements.txt
```

#### Passo 2: Executar Análises
```bash
# Fase 1: Validação (2-3 min)
python 01_validacao_dados.py

# Fase 2: Análise Exploratória (3-5 min)
python 02_analise_cisarp.py

# Fase 3: Visualizações (2-4 min)
python 03_visualizacoes.py
```

#### Passo 3: Ver Resultados
Abra o arquivo `visualizacoes/index.html` no navegador

---

## 📂 Arquivos Gerados

### Pasta `dados/`
- **cisarp_dados_validados.csv** - Dados brutos validados
- **cisarp_completo.csv** - Dataset enriquecido com indicadores
- **cisarp_metricas.json** - KPIs e estatísticas em JSON
- **validacao_relatorio.json** - Relatório de qualidade
- **validacao_log.txt** - Log detalhado da validação
- **cisarp_sumario.txt** - Sumário executivo

### Pasta `visualizacoes/`
- **index.html** - Índice navegável de todas as visualizações
- **01_kpis_principais.html** - Cards de KPIs
- **02_evolucao_temporal.html/png** - Gráfico temporal
- **03_top_municipios.html/png** - Ranking de municípios
- **04_distribuicao_pois.html** - Histograma de POIs
- **05_boxplots_variaveis.html** - Boxplots comparativos
- **06_benchmarking_contratantes.html/png** - Comparação CISARP vs outros
- **07_taxa_conversao.html** - Análise de eficiência
- **08_pois_vs_devolutivas.html** - Scatter plot com correlação
- **09_dashboard_executivo.html** - Dashboard integrado

---

## 🎯 Para a Apresentação

### Arquivos Essenciais
1. **visualizacoes/index.html** - Abrir durante a apresentação
2. **dados/cisarp_sumario.txt** - Números-chave para slides
3. **dados/cisarp_metricas.json** - Dados para infográficos

### Gráficos PNG para Slides
- `02_evolucao_temporal.png`
- `03_top_municipios.png`
- `06_benchmarking_contratantes.png`

### Dados para Análises Adicionais
- `cisarp_completo.csv` - Abrir no Excel/Power BI

---

## ✅ Checklist Pré-Apresentação

- [ ] Executar análise completa
- [ ] Verificar score de qualidade ≥ 85%
- [ ] Revisar todos os números no sumário
- [ ] Testar abertura de visualizações no navegador
- [ ] Preparar backup dos arquivos
- [ ] Testar conexão de internet (se usar visualizações online)

---

## 🔧 Resolução de Problemas

### Erro: "Python não encontrado"
**Solução:** Instale Python 3.8+ de python.org

### Erro: "Módulo não encontrado"
**Solução:** Execute `pip install -r requirements.txt`

### Erro: "Arquivo não encontrado"
**Solução:** Verifique se está na pasta `apresentacao/` e se as bases estão em `../base_dados/`

### Erro: "Dados inválidos"
**Solução:** Verifique o relatório de validação em `dados/validacao_log.txt`

---

## 📊 Interpretação Rápida dos Resultados

### Score de Qualidade
- **≥ 95%**: Excelente, dados prontos
- **85-95%**: Bom, utilizável com ressalvas
- **< 85%**: Revisar dados antes de usar

### Taxa de Conversão
- **> 50%**: Alta efetividade
- **30-50%**: Efetividade moderada
- **< 30%**: Baixa efetividade

### Benchmarking
- **Top 5**: Performance excelente
- **Top 10**: Performance boa
- **Fora do Top 10**: Oportunidades de melhoria

---

## 📞 Suporte

Em caso de dúvidas:
1. Consulte `METODOLOGIA_ANALISE.md` para detalhes técnicos
2. Verifique `../docs/BASES_DE_DADOS_DETALHADO.md` para estrutura das bases
3. Leia logs de erro em `dados/validacao_log.txt`

---

**Tempo estimado total:** 8-12 minutos  
**Última atualização:** Novembro 2025
