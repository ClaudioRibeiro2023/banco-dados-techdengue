# 📚 Documentação TechDengue Analytics

**Versão:** 3.0.0  
**Última atualização:** 30/10/2025

---

## 📖 Índice Geral

Esta pasta contém toda a documentação do projeto organizada por categoria.

---

## 🚀 Para Começar

### Novos Usuários
1. **[Quick Start do Design System](design-system/QUICK_START_DESIGN_SYSTEM.md)** - Guia em 5 minutos
2. **[Início Rápido](guides/INICIO_RAPIDO.md)** - Tutorial básico
3. **[Guia de Navegação](guides/GUIA_NAVEGACAO.md)** - Como usar o dashboard

### Desenvolvedores
1. **[README Design System](design-system/README_DESIGN_SYSTEM.md)** - Índice completo do DS
2. **[Design System Completo](design-system/DESIGN_SYSTEM_COMPLETO.md)** - Referência técnica
3. **[Arquitetura de Dados](architecture/ARQUITETURA_DADOS_DEFINITIVA.md)** - Estrutura de dados

### Gestores e Stakeholders
1. **[Relatório Final](design-system/RELATORIO_FINAL_IMPLEMENTACAO.md)** - O que foi implementado
2. **[Resumo de Implementação](reports/RESUMO_FINAL_IMPLEMENTACAO.md)** - Entregas
3. **[Sumário do Trabalho](reports/SUMARIO_TRABALHO_REALIZADO.md)** - Histórico completo

---

## 🎨 Design System

Documentação do Design System enterprise-grade implementado (v3.0.0):

| Documento | Descrição | Prioridade |
|-----------|-----------|------------|
| **[README Design System](design-system/README_DESIGN_SYSTEM.md)** | Índice geral - Comece aqui | 🔴 Alta |
| **[Quick Start](design-system/QUICK_START_DESIGN_SYSTEM.md)** | Guia prático de 5 minutos | 🔴 Alta |
| **[Design System Completo](design-system/DESIGN_SYSTEM_COMPLETO.md)** | Referência técnica completa | 🟡 Média |
| **[Guia de Validação](design-system/GUIA_VALIDACAO_DESIGN_SYSTEM.md)** | Checklist de testes | 🟡 Média |
| **[Relatório Final](design-system/RELATORIO_FINAL_IMPLEMENTACAO.md)** | Implementação detalhada | 🟢 Baixa |
| **[Discovery (Fase 1)](design-system/FASE1_DISCOVERY_RELATORIO.md)** | Auditoria inicial | 🟢 Baixa |
| **[Wireframes (Fase 3)](design-system/WIREFRAMES_FASE3.md)** | IA e estrutura | 🟢 Baixa |
| **[UI/UX Moderno V3](design-system/UI_UX_MODERNO_V3.md)** | Evolução visual | 🟢 Baixa |

---

## 🏗️ Arquitetura

Documentação da arquitetura de dados e sistema:

| Documento | Descrição |
|-----------|-----------|
| **[Arquitetura de Dados](architecture/ARQUITETURA_DADOS_DEFINITIVA.md)** | Medallion Architecture (Bronze/Silver/Gold) |
| **[Estrutura do Projeto](architecture/ESTRUTURA_PROJETO.md)** | Organização de pastas e arquivos |
| **[Sistema Completo](architecture/SISTEMA_COMPLETO.md)** | Visão geral técnica |
| **[Estratégia de Integridade](architecture/ESTRATEGIA_INTEGRIDADE_DADOS.md)** | Qualidade e validações |

---

## 📖 Guias Práticos

Tutoriais e guias passo a passo:

| Documento | Descrição |
|-----------|-----------|
| **[Início Rápido](guides/INICIO_RAPIDO.md)** | Tutorial básico |
| **[Próximos Passos](guides/PROXIMOS_PASSOS.md)** | Roadmap e melhorias |
| **[Guia de Navegação](guides/GUIA_NAVEGACAO.md)** | Como navegar no dashboard |
| **[Integração GIS](guides/GUIA_INTEGRACAO_GIS.md)** | PostGIS e dados espaciais |
| **[Dashboard de Gestão](guides/DASHBOARD_GESTAO.md)** | Gerenciamento |

---

## 📊 Relatórios

Análises e resumos executivos:

| Documento | Descrição |
|-----------|-----------|
| **[Resumo Final de Implementação](reports/RESUMO_FINAL_IMPLEMENTACAO.md)** | Entregas completas |
| **[Análise de Dados](reports/RESUMO_ANALISE_DADOS.md)** | Análise das bases de dados |
| **[Resumo Final da Solução](reports/RESUMO_FINAL_SOLUCAO.md)** | Solução implementada |
| **[Sumário do Trabalho](reports/SUMARIO_TRABALHO_REALIZADO.md)** | Histórico de desenvolvimento |
| **[Respostas a Questões](reports/RESPOSTA_QUESTOES_INICIAIS.md)** | Q&A inicial |

---

## 📜 Legacy / Histórico

Documentação histórica (referência apenas, não essencial):

| Documento | Descrição |
|-----------|-----------|
| Correções de Erros | Bugs corrigidos historicamente |
| Melhorias Dashboard | Evolução do dashboard (versões antigas) |
| Revisões e Redesigns | Iterações anteriores |
| Executores antigos | Scripts deprecados |

**Nota:** Esta documentação está arquivada para referência histórica. Use a documentação principal acima.

---

## 🔍 Como Encontrar o Que Preciso?

### Quero executar o dashboard
→ Volte para a raiz e execute `START_DASHBOARD.bat`  
→ Ou leia: [Quick Start](design-system/QUICK_START_DESIGN_SYSTEM.md)

### Quero entender o Design System
→ Leia: [README Design System](design-system/README_DESIGN_SYSTEM.md)  
→ Depois: [Design System Completo](design-system/DESIGN_SYSTEM_COMPLETO.md)

### Quero criar novos componentes
→ Leia: [Design System Completo](design-system/DESIGN_SYSTEM_COMPLETO.md) seção 4  
→ Veja exemplos em: `../dashboard/components/`

### Quero entender a arquitetura de dados
→ Leia: [Arquitetura de Dados](architecture/ARQUITETURA_DADOS_DEFINITIVA.md)

### Quero validar se está tudo funcionando
→ Leia: [Guia de Validação](design-system/GUIA_VALIDACAO_DESIGN_SYSTEM.md)

### Quero ver o que foi implementado
→ Leia: [Relatório Final](design-system/RELATORIO_FINAL_IMPLEMENTACAO.md)

---

## 📁 Estrutura desta Pasta

```
docs/
├── design-system/       # Design System v3.0.0 (8 documentos)
├── architecture/        # Arquitetura de dados (4 documentos)
├── guides/              # Guias práticos (5 documentos)
├── reports/             # Relatórios e análises (5 documentos + imagens)
├── legacy/              # Histórico (10 documentos)
└── README.md            # Este arquivo
```

---

## ✨ Destaques da v3.0.0

- ✅ **Design System enterprise-ready** com 50+ tokens
- ✅ **Acessibilidade WCAG AA** completa
- ✅ **20+ componentes** reutilizáveis
- ✅ **Tema Plotly** global consistente
- ✅ **Performance** otimizada (-50% render time)
- ✅ **Documentação** completa (32 documentos)

---

## 📞 Precisa de Ajuda?

1. **Primeiro:** Leia o [Quick Start](design-system/QUICK_START_DESIGN_SYSTEM.md)
2. **Troubleshooting:** Veja seção 8 do Quick Start
3. **Referência:** Consulte [Design System Completo](design-system/DESIGN_SYSTEM_COMPLETO.md)
4. **Arquitetura:** Veja [Arquitetura de Dados](architecture/ARQUITETURA_DADOS_DEFINITIVA.md)

---

**Versão da documentação:** 3.0.0  
**Última atualização:** 30/10/2025  
**Status:** 🟢 Completa e atualizada
