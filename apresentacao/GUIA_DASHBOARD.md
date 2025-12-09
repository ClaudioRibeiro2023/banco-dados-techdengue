# 🚀 GUIA RÁPIDO - DASHBOARD CISARP

**Dashboard interativo de alto impacto para análise e construção da apresentação**

---

## ⚡ EXECUÇÃO EM 2 PASSOS

### Passo 1: Preparar Dados (1x apenas)

```bash
cd apresentacao

# Preparar dados necessários
python 02_analise_cisarp.py
python 04_analise_impacto_epidemiologico.py
```

### Passo 2: Executar Dashboard

```bash
# Opção 1: Automática (Windows)
EXECUTAR_DASHBOARD.bat

# Opção 2: Manual
streamlit run dashboard_cisarp.py
```

**Dashboard abre em:** `http://localhost:8501`

---

## 📊 ESTRUTURA DO DASHBOARD

### 6 Páginas Interativas

```
🏠 HOME
├─ KPIs principais (4 cards)
├─ Timeline de operação
├─ Cobertura (52 municípios)
└─ Navegação rápida

📊 PERFORMANCE
├─ Indicadores detalhados
├─ Top 15 municípios
├─ Evolução temporal
└─ Análise por categoria

💊 IMPACTO EPIDEMIOLÓGICO
├─ Before-After geral
├─ Top 5 com maior redução
├─ Cases de sucesso
└─ Correlações

🏆 BENCHMARKING
├─ Ranking nacional
├─ Comparação com Top 3
└─ Análise de pares

🔍 EXPLORAÇÃO
├─ Filtros customizados
├─ Tabela interativa
└─ Exportação de dados

💡 INSIGHTS
├─ Top 5 insights
├─ Oportunidades
└─ Recomendações (curto/médio/longo)
```

---

## 💡 COMO USAR

### Para Construir Sua Apresentação

**1. Exploração (30 min)**
- Navegue por todas as páginas
- Entenda os dados
- Identifique visualizações impactantes

**2. Seleção (1h)**
- Marque gráficos para usar
- Exporte em PNG (Plotly permite)
- Copie números-chave
- Identifique cases

**3. Construção (1h)**
- Monte narrativa
- Organize storyline
- Prepare materiais

### Durante a Apresentação

**Opção A:** Usar gráficos exportados em PPT  
**Opção B:** Demonstrar dashboard ao vivo (💥 IMPACTO!)

**Vantagens do dashboard ao vivo:**
- ✅ Interatividade com audiência
- ✅ Responder perguntas em tempo real
- ✅ Filtrar dados conforme interesse
- ✅ Demonstrar transparência
- ✅ Maior engajamento

---

## 🎯 PRINCIPAIS RECURSOS

### Navegação Intuitiva
- Sidebar com menu de navegação
- Breadcrumbs em cada página
- Links rápidos entre seções

### Visualizações Interativas
- 30+ gráficos Plotly
- Hover para detalhes
- Zoom e pan
- Exportação de imagens

### Filtros e Exploração
- Filtro por município
- Filtro por período
- Filtro por métricas
- Drill-down interativo

### Exportação de Dados
- CSV com dados filtrados
- PNG de gráficos
- Relatórios customizados

---

## 📱 DICAS DE USO

### Atalhos do Streamlit

```
R - Recarregar dashboard
C - Limpar cache
? - Ajuda
```

### Performance

- Dashboard usa cache para velocidade
- Primeira carga: 5-10 segundos
- Navegação subsequente: instantânea

### Customização

Edite `dashboard_cisarp.py` para:
- Adicionar novos gráficos
- Modificar cores
- Incluir análises específicas
- Ajustar layout

---

## 🎨 EXPORTAR GRÁFICOS

### Para PowerPoint

1. Hover sobre gráfico
2. Clique no ícone 📷 (camera)
3. Salvar como PNG
4. Importar no PPT

### Alta Resolução

```python
# No código, adicione:
fig.write_image("grafico.png", width=1920, height=1080, scale=2)
```

---

## ⚠️ RESOLUÇÃO DE PROBLEMAS

### Dashboard não abre

```bash
# Verificar se Streamlit está instalado
pip install streamlit

# Verificar porta
# Streamlit usa porta 8501 por padrão
```

### Dados não aparecem

```bash
# Verificar se dados existem
ls dados/cisarp_dados_validados.csv

# Reexecutar preparação
python 02_analise_cisarp.py
```

### Gráficos não carregam

```bash
# Reinstalar Plotly
pip install --upgrade plotly
```

---

## 🌟 PRÓXIMOS PASSOS

### Após Criar Dashboard

1. ✅ Explore todas as 6 páginas
2. ✅ Identifique insights principais
3. ✅ Exporte gráficos para apresentação
4. ✅ Prepare narrativa
5. ✅ Teste demonstração ao vivo (opcional)

### Melhorias Futuras

- [ ] Adicionar mais filtros
- [ ] Incluir mapas geográficos
- [ ] Comparação temporal avançada
- [ ] Análises preditivas
- [ ] Integração com banco GIS

---

## 📊 MÉTRICAS DO DASHBOARD

```
30+ Visualizações interativas
6  Páginas de análise
50+ Métricas calculadas
∞  Possibilidades de filtros
```

---

## 🎯 DIFERENCIAL

| Aspecto | PPT Estático | Dashboard Interativo |
|---------|-------------|---------------------|
| Interatividade | ❌ | ✅ |
| Exploração | ❌ | ✅ |
| Atualização | Manual | Automática |
| Engajamento | Baixo | Alto |
| Transparência | Média | Alta |
| Impacto | Médio | **ALTO** 💥 |

---

**DASHBOARD PRONTO PARA USO!**

Execute `streamlit run dashboard_cisarp.py` e explore! 🚀
