# ADR 001: Decisão de Stack - Migração vs. Melhoria

**Data:** 31/10/2025  
**Status:** 🟡 PENDENTE DECISÃO  
**Decisores:** Equipe Técnica + Product Owner

---

## Contexto

Recebemos requisito de implementar redesign completo com stack:
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion + Recharts
- Zustand + React Router

**Porém, o projeto atual usa:**
- Python + Streamlit
- Pandas + Plotly
- CSS customizado

---

## Opções Avaliadas

### OPÇÃO 1: Migração Completa para React

**Descrição:** Reescrever aplicação do zero em React + TypeScript.

**Prós:**
- ✅ Stack moderna e escalável
- ✅ Performance superior (Core Web Vitals)
- ✅ Componentização real e reutilizável
- ✅ Melhor testabilidade (Vitest + Playwright)
- ✅ Controle total sobre UI/UX
- ✅ Acessibilidade nativa (ARIA, keyboard nav)
- ✅ Code splitting e lazy loading
- ✅ Design System robusto (shadcn/ui)

**Contras:**
- ❌ Esforço: 4-6 semanas (1 dev full-time)
- ❌ Reescrever toda lógica de negócio
- ❌ Perda temporária de funcionalidades
- ❌ Risco de regressão
- ❌ Curva de aprendizado (se equipe é Python)
- ❌ Infraestrutura de build/deploy nova

**Esforço Estimado:**
| Fase | Duração | Descrição |
|------|---------|-----------|
| Setup | 2 dias | Vite + TS + Tailwind + shadcn/ui |
| Design System | 3 dias | Tokens + componentes base |
| Páginas | 15 dias | Dashboard, Monitor, Tabelas |
| Integração API | 5 dias | Endpoints + estado |
| Testes | 5 dias | Unit + E2E + A11y |
| Deploy | 2 dias | CI/CD + infra |
| **TOTAL** | **32 dias** | ~6.5 semanas |

---

### OPÇÃO 2: Melhorar Streamlit Atual

**Descrição:** Aplicar princípios de UX/A11y ao Streamlit existente.

**Prós:**
- ✅ Código funcionando mantido
- ✅ Melhorias incrementais
- ✅ Sem breaking changes
- ✅ Esforço reduzido: 1-2 semanas
- ✅ Equipe já conhece stack
- ✅ Deploy simples

**Contras:**
- ❌ Limitações do Streamlit (customização)
- ❌ Performance inferior ao React
- ❌ Não atende stack solicitada
- ❌ Acessibilidade limitada
- ❌ Sem componentização real
- ❌ Testes limitados

**Melhorias Possíveis:**
- Design System via CSS variables
- Componentes customizados (st.markdown + HTML)
- Acessibilidade básica (ARIA labels)
- Performance (cache, lazy load)
- Dark mode
- Microanimações (CSS)

**Esforço Estimado:**
| Fase | Duração | Descrição |
|------|---------|-----------|
| Design Tokens | 1 dia | CSS variables |
| Componentes | 3 dias | Cards, badges, alerts |
| Páginas | 5 dias | Refatorar UI |
| A11y | 2 dias | ARIA, contraste |
| Performance | 1 dia | Cache, otimizações |
| **TOTAL** | **12 dias** | ~2.5 semanas |

---

### OPÇÃO 3: Arquitetura Híbrida

**Descrição:** Frontend React + Backend Python (FastAPI).

**Prós:**
- ✅ Melhor de ambos mundos
- ✅ Separação clara (frontend/backend)
- ✅ Escalável
- ✅ Python para lógica de dados
- ✅ React para UI moderna

**Contras:**
- ❌ Complexidade arquitetural
- ❌ Esforço: 6-8 semanas
- ❌ Infraestrutura mais complexa
- ❌ Dois deploys separados
- ❌ CORS, autenticação, etc.

**Esforço Estimado:**
| Fase | Duração | Descrição |
|------|---------|-----------|
| API Backend | 10 dias | FastAPI + endpoints |
| Frontend React | 20 dias | Igual Opção 1 |
| Integração | 5 dias | Auth + CORS |
| Testes | 5 dias | Backend + Frontend |
| Deploy | 3 dias | Dois ambientes |
| **TOTAL** | **43 dias** | ~8.5 semanas |

---

## Critérios de Decisão

| Critério | Peso | Opção 1 | Opção 2 | Opção 3 |
|----------|------|---------|---------|---------|
| **Time-to-market** | 🔥🔥🔥 | 2/5 | 5/5 | 1/5 |
| **Performance** | 🔥🔥 | 5/5 | 3/5 | 5/5 |
| **Escalabilidade** | 🔥🔥 | 5/5 | 2/5 | 5/5 |
| **Manutenibilidade** | 🔥🔥 | 5/5 | 3/5 | 4/5 |
| **Custo (dev)** | 🔥🔥🔥 | 2/5 | 5/5 | 1/5 |
| **Risco** | 🔥🔥 | 2/5 | 5/5 | 2/5 |
| **A11y** | 🔥 | 5/5 | 3/5 | 5/5 |
| **Testabilidade** | 🔥 | 5/5 | 2/5 | 5/5 |
| **SCORE TOTAL** | | **31/40** | **28/40** | **28/40** |

---

## Recomendação

### Se PRAZO é crítico (< 3 semanas):
→ **OPÇÃO 2** (Melhorar Streamlit)

### Se QUALIDADE/ESCALABILIDADE é prioridade:
→ **OPÇÃO 1** (Migração React)

### Se é projeto LONGO PRAZO (> 1 ano):
→ **OPÇÃO 3** (Híbrida)

---

## Decisão

**[ ] OPÇÃO 1 - Migração Completa React**  
**[ ] OPÇÃO 2 - Melhorar Streamlit**  
**[ ] OPÇÃO 3 - Arquitetura Híbrida**

**Justificativa:**
_[A ser preenchido pelo decisor]_

**Assinado por:**
- [ ] Tech Lead
- [ ] Product Owner
- [ ] Stakeholder

---

## Consequências

### Se OPÇÃO 1:
- Iniciar setup Vite + React + TypeScript
- Criar Design System do zero
- Planejar migração de dados/lógica
- Definir estratégia de deploy

### Se OPÇÃO 2:
- Criar tokens CSS para Streamlit
- Refatorar componentes existentes
- Melhorar acessibilidade
- Otimizar performance

### Se OPÇÃO 3:
- Desenhar arquitetura API
- Definir contratos (OpenAPI)
- Setup infra (frontend + backend)
- Planejar autenticação

---

## Próximos Passos

1. **Decisão:** Escolher opção (reunião com stakeholders)
2. **Auditoria:** Executar auditoria específica para opção escolhida
3. **Plano:** Criar roadmap detalhado
4. **Kickoff:** Iniciar implementação

---

**Criado em:** 31/10/2025  
**Atualizado em:** 31/10/2025  
**Revisão:** Pendente
