# 🚀 Quick Start - Design System TechDengue

## 1. Executar o Dashboard

```bash
cd C:\Users\claud\CascadeProjects\banco-dados-techdengue
python -m streamlit run dashboard/app.py
```

Acesse: **http://localhost:8501**

---

## 2. O que você verá

### ✅ Visual moderno
- Headers com bordas coloridas e ícones
- Cards com gradientes e sombras
- Gráficos com tema unificado
- Hover effects em cards e botões

### ✅ UX otimizada
- Filtros padronizados
- Estados de loading (skeletons)
- Alertas semânticos (success/warning/error)
- Tooltips informativos

### ✅ Acessibilidade
- Navegação por teclado (Tab)
- Skip-link (Pular para conteúdo)
- Contraste WCAG AA
- Reduced-motion support

---

## 3. Usar componentes

### KPI Card

```python
from components.ui_components import create_metric_card_modern
import streamlit as st

st.markdown(create_metric_card_modern(
    icon="📊",
    title="Total de POIs",
    value="1,234",
    change=5.2,  # % crescimento
    color="primary",
    tooltip="Pontos de interesse identificados"
), unsafe_allow_html=True)
```

### Section Header

```python
from components.layout import page_section

st.markdown(page_section(
    title="📈 Análises",
    subtitle="Evolução e tendências",
    icon="📈",
    color="success"
), unsafe_allow_html=True)
```

### Alert

```python
from components.ui_components import create_modern_alert

st.markdown(create_modern_alert(
    message="Dados atualizados com sucesso!",
    type="success",
    icon="✅"
), unsafe_allow_html=True)
```

### Filtros (Mega Tabela)

```python
from components.filters import filter_bar_mega

ano, urs, atividades, por_pagina = filter_bar_mega(mega_tabela)
# Retorna os valores selecionados
```

---

## 4. Estrutura de uma página

```python
import streamlit as st
from pathlib import Path
from components.layout import page_section
from components.ui_components import create_metric_card_modern
from utils.plotly_theme import apply_theme

# Config
st.set_page_config(page_title="Minha Página", layout="wide")

# Tema Plotly
apply_theme()

# Carregar CSS do Design System
ASSETS_DIR = Path(__file__).parent / "assets"
for css_name in ("tokens.css", "base.css", "components.css"):
    css_path = ASSETS_DIR / css_name
    if css_path.exists():
        with open(css_path, 'r', encoding='utf-8') as f:
            st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# Skip-link (acessibilidade)
st.markdown('<a class="skip-link" href="#main-content">Pular para o conteúdo</a>', unsafe_allow_html=True)

# Header
st.markdown(page_section("📊 Título", "Descrição", "📊", "primary"), unsafe_allow_html=True)

# Container principal
st.markdown('<div class="container" id="main-content">', unsafe_allow_html=True)

# Seu conteúdo aqui
col1, col2 = st.columns(2)
with col1:
    st.markdown(create_metric_card_modern("📈", "KPI 1", "100", None, "success"), unsafe_allow_html=True)
with col2:
    st.markdown(create_metric_card_modern("📉", "KPI 2", "50", -2.5, "warning"), unsafe_allow_html=True)

# Fechar container
st.markdown('</div>', unsafe_allow_html=True)
```

---

## 5. Tokens disponíveis

### Cores
```css
var(--color-primary-500)
var(--color-success-500)
var(--color-warning-500)
var(--color-error-500)
var(--gray-500)
```

### Gradientes
```css
var(--gradient-primary)
var(--gradient-success)
var(--gradient-warning)
var(--gradient-error)
```

### Espaçamentos
```css
var(--space-1)  /* 0.25rem */
var(--space-4)  /* 1rem */
var(--space-8)  /* 2rem */
```

### Sombras
```css
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
var(--shadow-xl)
```

### Raios (border-radius)
```css
var(--radius-sm)   /* 0.25rem */
var(--radius-lg)   /* 0.5rem */
var(--radius-xl)   /* 0.75rem */
var(--radius-2xl)  /* 1rem */
```

### Transições
```css
var(--transition-fast)  /* 0.15s */
var(--transition-base)  /* 0.3s */
```

---

## 6. Componentes disponíveis

| Componente | Arquivo | Função |
|------------|---------|--------|
| Metric Card | `ui_components.py` | `create_metric_card_modern()` |
| Section Header | `layout.py` | `page_section()` |
| Status Card | `ui_components.py` | `create_status_card()` |
| Year Card | `ui_components.py` | `create_year_card()` |
| Alert | `ui_components.py` | `create_modern_alert()` |
| Badge | `ui_components.py` | `create_badge()` |
| Progress Bar | `ui_components.py` | `create_progress_bar()` |
| Filter Bar | `filters.py` | `filter_bar_mega()` |

---

## 7. Testes rápidos

### Testar tema Plotly
```python
import plotly.express as px
from utils.plotly_theme import apply_theme

apply_theme()
fig = px.bar(x=[1,2,3], y=[4,5,6])
st.plotly_chart(fig)
# Deve aparecer com cores e layout do tema
```

### Testar responsividade
- Redimensione a janela do navegador
- Cards devem reorganizar em colunas menores
- Fonte e espaçamentos devem ajustar

### Testar acessibilidade
- Pressione **Tab** para navegar
- Foco deve ser visível (outline azul)
- Skip-link deve aparecer ao focar
- Gráficos devem ter captions

---

## 8. Troubleshooting

### CSS não aparece
- Verifique se os arquivos CSS existem em `dashboard/assets/`
- Certifique-se de carregar na ordem: tokens → base → components

### Tema Plotly não aplica
- Verifique se `apply_theme()` é chamado **antes** de criar gráficos
- Reinicie o dashboard após mudanças

### Componentes não renderizam
- Verifique imports: `from components.ui_components import ...`
- Certifique-se de usar `unsafe_allow_html=True` no `st.markdown()`

### Filtros não funcionam
- Verifique se a mega tabela tem as colunas esperadas ('ano', 'urs', 'total_atividades')

---

## 9. Recursos

- **Documentação completa:** `DESIGN_SYSTEM_COMPLETO.md`
- **Discovery:** `FASE1_DISCOVERY_RELATORIO.md`
- **Wireframes:** `WIREFRAMES_FASE3.md`
- **Guia de estilos:** `dashboard/assets/README_STYLES.md`

---

## 10. Próximos passos

1. ✅ Execute o dashboard e veja as mudanças
2. ✅ Explore a Home e a página de Qualidade
3. ✅ Teste filtros, gráficos e navegação
4. ✅ Crie uma nova página usando os componentes
5. ✅ Customize tokens para sua necessidade

---

**Status:** 🟢 Pronto para uso | v3.0.0  
**Suporte:** Design System enterprise-ready  
**Acessibilidade:** WCAG AA compliant
