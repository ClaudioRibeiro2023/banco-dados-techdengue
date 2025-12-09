# ✅ Guia de Validação - Design System TechDengue

**Objetivo:** Validar que todas as implementações do Design System estão funcionando corretamente.

---

## 🚀 Passo 1: Instalação de Dependências

```bash
cd C:\Users\claud\CascadeProjects\banco-dados-techdengue
pip install -r dashboard/requirements.txt
```

**Validação:**
- ✅ Todas as dependências instaladas sem erro
- ✅ `openpyxl>=3.1.2` presente (para export Excel)

---

## 🎯 Passo 2: Executar o Dashboard

```bash
python -m streamlit run dashboard/app.py
```

**Validação:**
- ✅ Dashboard inicia sem erros
- ✅ Abre em http://localhost:8501
- ✅ Não há mensagens de erro no console

---

## 🎨 Passo 3: Validação Visual - Home

### 3.1 Header Principal
**O que validar:**
- ✅ Header com gradiente azul profundo
- ✅ Título "TechDengue Analytics"
- ✅ Elemento decorativo circular
- ✅ Sombra e animação fade-in

### 3.2 Skip Link (Acessibilidade)
**Como validar:**
- Pressione **Tab** uma vez ao carregar a página
- ✅ Deve aparecer link "Pular para o conteúdo" no topo esquerdo
- Pressione **Enter** para ativar
- ✅ Foco deve ir direto para o conteúdo principal

### 3.3 Seções com Headers Padronizados
**Verifique cada seção:**
- ✅ "📊 Visão Geral do Sistema" - borda azul à esquerda
- ✅ "📈 Evolução Temporal das Operações" - borda verde
- ✅ "🏆 Top Performers" - borda amarela/laranja
- ✅ "🪣 Análise de Tipos de Depósitos" - borda azul claro
- ✅ "🏗️ Status das Camadas" - borda azul
- ✅ "✅ Validações de Qualidade" - borda verde
- ✅ "📊 MEGA TABELA Analítica" - borda azul
- ✅ "⚡ Ações Rápidas" - borda azul

**Características:**
- Background branco
- Borda colorida à esquerda (4-6px)
- Ícone grande (2rem)
- Título (h2) e subtítulo (p)
- Sombra sutil

### 3.4 KPI Cards (Mega Tabela)
**O que validar:**
- ✅ 4 cards: "Total de Registros", "Colunas", "Municípios", "Com Atividades"
- ✅ Cada card com:
  - Ícone no topo
  - Valor grande
  - Label descritivo
  - Tooltip ao passar o mouse (title)
  - Borda colorida no topo
- ✅ Hover effect: card sobe levemente

### 3.5 Cards de Status (Bronze/Silver/Gold)
**O que validar:**
- ✅ 3 cards em linha
- ✅ Ícones: 🥉 Bronze, 🥈 Silver, 🥇 Gold
- ✅ Cores semânticas:
  - Se operacional: borda verde + texto "✅ Operacional"
  - Se não disponível: borda vermelha + texto "❌ Não disponível"

### 3.6 Gráficos com Tema
**O que validar:**
- ✅ **Evolução Temporal:** 
  - Linha azul (POIs)
  - Linha verde (Municípios, eixo direito)
  - Legenda horizontal no topo
  - Caption descritiva abaixo
- ✅ **Top Municípios:** 
  - Barras horizontais
  - Cores do tema global
  - Caption descritiva
- ✅ **Top URS:** 
  - Barras horizontais
  - Cores do tema global
  - Caption descritiva
- ✅ **Depósitos (Donut):**
  - Gráfico circular com buraco
  - Labels e percentuais
  - Caption descritiva

### 3.7 Filtros da Mega Tabela
**O que validar:**
- ✅ Badge "Filtro" visível
- ✅ 4 filtros em linha:
  - 📅 Ano (com indicadores ✅/⚠️)
  - 🏥 URS
  - 🎯 Atividades
  - 📄 Registros/Página
- ✅ Filtros funcionam e atualizam a tabela

### 3.8 Alertas e Estados
**O que validar:**
- ✅ **Alert "Exibindo X de Y registros":** 
  - Background azul claro
  - Ícone ℹ️
- ✅ **Estado vazio (quando filtro retorna 0):**
  - Warning "⚠️ Nenhum registro encontrado"
  - Skeletons cinza animados (3 barras)
- ✅ **Estado sem Mega Tabela:**
  - Error "❌ MEGA TABELA não disponível"
  - Skeletons cinza animados

### 3.9 Botões
**O que validar:**
- ✅ Botões de ação ("🔄 Sincronizar", "✅ Validar", "📊 Gerar"):
  - Gradiente azul
  - Texto branco
  - Sombra
  - Hover: sobe levemente
- ✅ Botões de download (CSV, Excel):
  - Mesmo estilo dos botões de ação
  - Funcionam ao clicar

### 3.10 Sidebar
**O que validar:**
- ✅ Header "🦟 TechDengue" com gradiente
- ✅ Navegação com ícones
- ✅ "Status do Sistema":
  - Card com ícone 🟢/🟡/🔴
  - Status "Online/Warning/Offline"
- ✅ "Última Atualização" com data/hora
- ✅ "Informações" com versão

---

## 📊 Passo 4: Validação Visual - Qualidade de Dados

**Navegue para:** Sidebar > "📊 Qualidade de Dados"

### 4.1 Header da Página
**O que validar:**
- ✅ "📊 Qualidade de Dados" com borda azul
- ✅ Subtítulo descritivo

### 4.2 Seções com Headers Padronizados
**Verifique:**
- ✅ "🎯 Score de Qualidade Geral" - borda verde
- ✅ "✅ Validações por Categoria" - borda azul
- ✅ "🔗 Integridade Referencial" - borda azul
- ✅ "📏 Validação contra Métricas Oficiais" - borda azul
- ✅ "🗄️ Validação do Servidor PostgreSQL" - borda azul
- ✅ "📋 Detalhamento de Checks" - borda azul

### 4.3 Tabela de Checks
**O que validar:**
- ✅ Tabela HTML estilizada (não dataframe padrão)
- ✅ Cabeçalhos em cinza claro
- ✅ Linhas com hover (background cinza ao passar mouse)
- ✅ Coluna "status" com badges:
  - **PASS:** badge verde
  - **WARN:** badge amarelo
  - **FAIL:** badge vermelho
- ✅ Paginação:
  - Seletor "📄 Registros/Página" (20/50/100/200)
  - Slider "Página" funcional
  - Contador "Exibindo linhas X–Y de Z"

### 4.4 Resumo por Status
**O que validar:**
- ✅ 3 badges com contadores
- ✅ Cores semânticas (verde/amarelo/vermelho)
- ✅ Valores corretos

---

## ⌨️ Passo 5: Validação de Acessibilidade

### 5.1 Navegação por Teclado
**Como testar:**
1. Carregue a Home
2. Pressione **Tab** repetidamente
3. ✅ Foco visível em cada elemento (outline azul)
4. ✅ Ordem lógica (header → filtros → botões → footer)
5. ✅ Todos os botões alcançáveis

### 5.2 Skip Link
**Como testar:**
1. Recarregue a página
2. Pressione **Tab** uma vez
3. ✅ Link "Pular para o conteúdo" aparece
4. Pressione **Enter**
5. ✅ Foco vai para #main-content

### 5.3 Reduced Motion
**Como testar:**
1. Ative "Reduzir movimento" nas configurações do sistema:
   - **Windows:** Configurações > Acessibilidade > Efeitos visuais > Efeitos de animação: Desativar
2. Recarregue a página
3. ✅ Animações devem ser instantâneas (sem fade-in lento)

### 5.4 Tooltips
**Como testar:**
1. Passe o mouse sobre KPI cards na Mega Tabela
2. ✅ Tooltip aparece com descrição
3. ✅ Texto legível e relevante

### 5.5 Captions nos Gráficos
**O que validar:**
- ✅ Cada gráfico tem um texto descritivo abaixo
- ✅ Caption explica o que o gráfico mostra

---

## 🎨 Passo 6: Validação de Tokens CSS

### 6.1 Verificar Cores
**Abra DevTools (F12) > Inspect element:**
1. Selecione um card
2. ✅ Background usa `var(--gradient-primary)` ou cores do token
3. ✅ Nenhum código hex hardcoded (#1f77b4 inline)

### 6.2 Verificar Espaçamentos
**Inspecione:**
- ✅ Padding usa `var(--space-X)` onde X = 1-16
- ✅ Margin usa tokens

### 6.3 Verificar Sombras
**Inspecione cards:**
- ✅ `box-shadow: var(--shadow-md)` ou similar

---

## 🚀 Passo 7: Validação de Performance

### 7.1 Tempo de Carregamento
**Como medir:**
1. Abra DevTools (F12) > Network
2. Recarregue a página (Ctrl+R)
3. ✅ Carregamento inicial < 3s (depende dos dados)
4. ✅ CSS carregado de uma vez

### 7.2 Re-renders
**Como testar:**
1. Mude um filtro (ex: Ano)
2. ✅ Apenas a tabela/gráficos afetados re-renderizam
3. ✅ Header e sidebar não piscam

### 7.3 Cache
**Como validar:**
1. Mude filtros
2. Volte para filtro anterior
3. ✅ Dados carregam instantaneamente (cache hit)

---

## 📱 Passo 8: Validação de Responsividade

### 8.1 Desktop (>1024px)
**O que validar:**
- ✅ 4 KPI cards em linha
- ✅ Sidebar expandido
- ✅ Gráficos largos

### 8.2 Tablet (768-1024px)
**Como testar:**
1. Redimensione janela para ~900px
2. ✅ 2 KPI cards por linha
3. ✅ Sidebar funcional

### 8.3 Mobile (<768px)
**Como testar:**
1. Redimensione janela para ~600px
2. ✅ 1 KPI card por linha
3. ✅ Sidebar colapsável
4. ✅ Textos legíveis

---

## 🐛 Passo 9: Validação de Erros

### 9.1 Console do Navegador
**O que validar:**
- ✅ Nenhum erro JavaScript
- ✅ Nenhum aviso de CSS
- ✅ Recursos carregados (200 OK)

### 9.2 Terminal Python
**O que validar:**
- ✅ Nenhuma exceção Python
- ✅ Imports bem-sucedidos
- ✅ Cache funcionando

---

## ✅ Checklist Final

### Funcionalidade
- [ ] Dashboard inicia sem erros
- [ ] Todas as páginas navegáveis
- [ ] Filtros funcionam
- [ ] Gráficos renderizam
- [ ] Downloads funcionam
- [ ] Botões responsivos

### Visual
- [ ] Headers com bordas coloridas
- [ ] Cards com gradientes e sombras
- [ ] Hover effects funcionam
- [ ] Cores consistentes (tema)
- [ ] Tipografia legível

### Acessibilidade
- [ ] Skip-link funciona
- [ ] Navegação por teclado completa
- [ ] Foco visível
- [ ] Tooltips informativos
- [ ] Captions em gráficos
- [ ] Reduced-motion funciona

### Performance
- [ ] Carregamento < 3s
- [ ] Cache ativo
- [ ] Re-renders otimizados

### Documentação
- [ ] README_DESIGN_SYSTEM.md lido
- [ ] QUICK_START_DESIGN_SYSTEM.md seguido
- [ ] Exemplos funcionam

---

## 🎯 Resultado Esperado

### ✅ Sucesso Total
- Todos os itens acima validados
- Nenhum erro no console
- Dashboard profissional e acessível

### ⚠️ Sucesso Parcial
- Maioria dos itens validados
- Pequenos ajustes necessários
- Funcionalidade core OK

### ❌ Falha
- Múltiplos erros
- Visual inconsistente
- Acessibilidade comprometida

---

## 📞 Suporte

### Se algo não funcionar:
1. Verifique instalação de dependências
2. Limpe cache do Streamlit: `streamlit cache clear`
3. Verifique console para erros
4. Consulte `QUICK_START_DESIGN_SYSTEM.md` seção 8 (Troubleshooting)

### Recursos:
- `DESIGN_SYSTEM_COMPLETO.md` - Referência completa
- `RELATORIO_FINAL_IMPLEMENTACAO.md` - Detalhes técnicos
- Exemplos: `dashboard/app.py`, `dashboard/pages/1_📊_Qualidade_Dados.py`

---

**Status esperado:** 🟢 **TODOS OS TESTES PASSAM**  
**Tempo estimado:** 15-20 minutos  
**Versão:** 3.0.0
