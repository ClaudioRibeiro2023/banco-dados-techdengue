# Fase 1 — Discovery e Auditoria UI/UX e Engenharia

Data: 30/10/2025
Status: Concluída

---

## 1. Sumário Executivo
- A plataforma possui bom avanço funcional, mas carece de padronização visual, arquitetura de UI consistente e governança de código.
- Há mistura de HTML inline, CSS externo (assets/style.css, assets/modern.css) e estilos nativos do Streamlit, gerando inconsistência.
- Componentização foi iniciada (dashboard/components/*), porém ainda há trechos legados no app principal.
- Há oportunidades claras de performance (cache, memoização de gráficos, lazy rendering) e acessibilidade (foco, contraste, navegação por teclado).

---

## 2. Auditoria UX (Heurísticas)
- Consistência e padrões: inconsistências entre páginas em cabeçalhos, cards e botões.
- Hierarquia visual: melhora com section headers modernos, porém coexistem headers legados.
- Feedback e estados: poucos estados visuais (loading, vazio, erro) padronizados.
- Prevenção de erros: filtros podem re-renderizar excessivamente; falta debounce.
- Estética e minimalismo: excesso de HTML inline em app.py; CSS duplicado.
- Acessibilidade: foco pouco evidente, contraste não verificado, aria/descrições para gráficos ausentes.

---

## 3. Auditoria de Código/Arquitetura
- app.py: mistura render + dados + estilo; presença de HTML inline e CSS adicional.
- assets/modern.css: design system robusto, mas não aplicado de forma uniforme.
- components/ui_components.py: boa base de componentes (MetricCard, SectionHeader, YearCard, etc.).
- components/__init__.py: exportações corrigidas, porém ainda há componentes não utilizados em todas as páginas.
- pages/1_📊_Qualidade_Dados.py: página extensa; oportunidade de extrair componentes.
- app_forced.py: versão paralela para forçar CSS inline (útil para testes, não ideal para produção).

---

## 4. Inventário de Dados
- Fonte principal: data_lake/gold/mega_tabela_analitica.parquet
- Metadados/insights: data_lake/metadata/* (insights_home.json, validações, relatórios)
- Carregamento: funções com @st.cache_data (carregar_insights, carregar_mega_tabela, etc.)
- Oportunidades: normalizar chaves de cache, validações de existência, mensagens de empty state, amostragem para pré-visualizações.

---

## 5. Perfil de Performance (suposições e evidências)
- Renderização inicial pesada por gráficos Plotly sem memoização e por leitura do parquet (pyarrow) sem fingerprint de cache específico por filtro.
- CSS e HTML inline elevam custo de manutenção, não performance, mas dificultam minificação/otimização.
- Falta de debounce em filtros pode causar re-renders desnecessários.
- Tabelas grandes: uso de st.dataframe sem paginação/virtualização personalizada.

### Recomendações de Performance
- Cache: chaves determinísticas por filtros (tuple de parâmetros); TTL coerente com SLAs de atualização.
- Charts: funções fábricas memoizadas; reduzir pontos/traços; usar agregações por período (mensal/trimestral).
- Dados: carregamento sob demanda (lazy) de seções abaixo da dobra; skeletons padronizados.
- Assets: unificar CSS, minificar para produção, remover HTML inline.

---

## 6. Acessibilidade (Quick Audit)
- Contraste: revisar paleta e verificar WCAG AA.
- Foco: estilos visíveis em botões/links (outline + offset).
- Teclado: garantir navegação completa sem mouse; ordem lógica de tabulação.
- Gráficos: descrever com texto/aria-label; fornecer resumo numérico alternativo.

---

## 7. Riscos e Dependências
- Mudança visual sem governança pode causar regressões.
- Mistura de duas abordagens (app.py vs app_forced.py) pode confundir manutenção.
- Falta de testes visuais/regressão dificulta rollout seguro.

---

## 8. Backlog Priorizado (P0/P1/P2)

### P0 (crítico)
- Unificar carga de CSS: aplicar apenas assets/modern.css + tokens; remover HTML inline.
- Consolidar biblioteca de componentes (components/*) e substituir blocos legados em app.py/pages.
- Otimizar carregamento da mega tabela com cache determinístico e feedback de loading.
- Implementar fábrica de gráficos Plotly com tema único e memoização.

### P1 (alto)
- Implementar estados padrão (loading skeleton, empty, error, offline).
- Debounce e memoização em filtros; normalizar chaves de sessão.
- IA/Wireframes: Home, Qualidade, Mega Tabela com hierarquia clara.
- Acessibilidade: foco visível, contraste mínimo e labels para gráficos.

### P2 (médio)
- Dark mode toggle; high-contrast mode.
- Microinterações e transições padronizadas (reduced-motion friendly).
- Observabilidade de UX: instrumentar tempos de render, erros e uso de componentes.

---

## 9. Métricas de Sucesso (baseline → meta)
- TTFB + render inicial: reduzir 40-60%.
- Tamanho de payload de dados por gráfico: reduzir 30-50% via agregação.
- Re-renders por interação: reduzir 50% com memoização/debounce.
- Acessibilidade: atingir AA (contrast, foco, teclado).
- Consistência visual: >95% de componentes usando tokens.

---

## 10. Plano imediato para Fase 2 (Fundação)
- Criar tokens design (tokens.css + tokens.json) e mapear modern.css para tokens.
- Definir arquitetura de estilos em camadas (tokens → base → components → overrides mínimos).
- Criar UI Kit mínimo: Header, SectionHeader, KPIGrid, Card, Button, Alert, Badge, Table, FilterBar.
- Especificar tema Plotly global com paleta semântica.

---

## 11. Anexos
- Estrutura auditada: dashboard/app.py, assets/modern.css, components/ui_components.py, pages/1_📊_Qualidade_Dados.py, app_forced.py.
- Dependências: requirements.txt atualizado; versões compatíveis.
