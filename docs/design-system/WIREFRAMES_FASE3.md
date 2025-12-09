# Fase 3 — IA e Wireframes (Home, Qualidade, Mega Tabela)

Data: 30/10/2025
Status: Concluída

---

## 1) Arquitetura de Navegação (IA)

Fonte: dashboard/utils/navigation.yaml

Seções
- 🏠 Home → / (Visão executiva e KPIs)
- 📊 Qualidade de Dados → /qualidade (Score, checks e conformidade)
- 🗄️ Mega Tabela → /mega (Exploração, filtros e tabela)
- 📈 Análises → /analises/* (Evolução, Top Performers, Depósitos)
- ⚙️ Sistema → /sistema/* (Status, Configurações)

---

## 2) Wireframe — Home (/)

Hero/Header
- SectionHeader (primary): título + subtítulo
- Cards KPI (KPIGrid): POIs, Hectares, Municípios Ativos, Taxa de Conversão

Evolução Temporal
- SectionHeader (success)
- YearCards (3 colunas)
- ChartContainer (Linha dupla: POIs vs Municípios Ativos, y/y2)

Top Performers
- SectionHeader (warning)
- Grid 2 colunas: Top Municípios (bar h), Top URS (bar h)

Depósitos
- SectionHeader (info)
- Grid 2 colunas: Donut por tipo, Cards de ações (removidos, tratados, etc.)

Rodapé
- Metadata (versão, atualização)

---

## 3) Wireframe — Qualidade (/qualidade)

Header
- SectionHeader (primary): Score de Qualidade Geral

KPIs de Qualidade
- KPIGrid: Score, Checks Aprovados, Divergência Oficial, Cobertura

Gauge & Indicadores
- Grid 2 colunas: Gauge Score (gauge chart), Indicadores (aprovados/total, delta, progresso)

Detalhamento de Checks
- Table estilizada (table)
- Filtros (FilterBar): Tipo de check, severidade, status

Alertas & Conclusões
- Alert/Badges para status geral

---

## 4) Wireframe — Mega Tabela (/mega)

Header
- SectionHeader (primary): Explorador Analítico

Estatísticas iniciais
- KPIGrid: Total Registros, Colunas, Municípios, % com atividade

Filtros (FilterBar)
- Ano (com indicação de anos sem atividade)
- URS (todas/seleção)
- Atividades (com, sem, todos)
- Registros por página

Tabela
- DataFrame paginado com colunas essenciais
- Empty/Loading states padronizados

Resumo por Ano (quando Todos)
- YearCards ou barra empilhada (agregações)

---

## 5) Componentes e Templates

Layout Helpers
- PageContainer: controla margens, largura e seção padrão
- Grid: construções de grids responsivos
- FilterBar: agrupador de filtros com rótulo e descrição

Templates
- PageTemplate.Home(data)
- PageTemplate.Qualidade(data)
- PageTemplate.Mega(data)

---

## 6) Regras de Conteúdo

- Títulos curtos e sem jargões
- Subtítulos descritivos e objetivos
- Unidades e percentuais sempre explícitos
- Tooltips para termos técnicos
- Cores semânticas alinhadas aos tokens

---

## 7) Próximos Passos

- Implementar templates e substituir seções legadas gradualmente
- Garantir estados de loading/empty/error em todas as seções
- Revisar acessibilidade (contraste, foco, teclado)
