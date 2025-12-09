# 📊 Dashboard CISARP - Enterprise Analytics

<div align="center">

![Status](https://img.shields.io/badge/Status-Production-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red)
![License](https://img.shields.io/badge/License-MIT-yellow)
![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-success)

**Dashboard enterprise-grade para análise de impacto do Projeto TechDengue no Consórcio CISARP**

[🚀 Quick Start](#-quick-start) • [📚 Documentação](#-documentação) • [🎯 Features](#-features) • [🧪 Testes](#-testes) • [📄 Licença](#-licença)

</div>

---

## 🌟 Sobre o Projeto

### Dashboard CISARP Enterprise

Sistema de analytics enterprise-grade desenvolvido para análise integrada de dados operacionais e epidemiológicos do Projeto TechDengue no **Consórcio Intermunicipal de Saúde da Região do Paranaíba (CISARP)**.

### 🎯 Objetivos

- ✅ **Performance Operacional:** Análise detalhada de KPIs e produtividade
- ✅ **Impacto Epidemiológico:** Correlação atividades vs. casos de dengue
- ✅ **Benchmarking Nacional:** Comparação com 66 contratantes
- ✅ **Insights Automáticos:** 7 tipos de insights gerados por IA
- ✅ **Recomendações Estratégicas:** 15+ recomendações priorizadas

### 📊 Dados do CISARP

```
📍 Municípios:           108
🏢 Atividades:            71
📌 POIs Mapeados:      13.584
🗺️  Hectares:          9.440 ha
🏆 Ranking Nacional:   4º de 66
📈 Percentil:          Top 6.1%
```

---

## ⚡ Quick Start

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone <repository-url>
cd banco-dados-techdengue/apresentacao

# 2. Instale dependências
pip install -r requirements_dashboard_full.txt

# 3. Execute o dashboard
.\RUN_DASHBOARD.bat

# OU manualmente:
cd dashboard
streamlit run app.py
```

### Acesso

```
🌐 URL: http://localhost:8501
```

O dashboard abrirá automaticamente no navegador!

---

## 🎯 Features

### 6 Páginas Completas

#### 1. 🏠 **Home - Visão Executiva**
- 8 KPIs principais
- Top 5 municípios
- Insights prioritários
- Navegação rápida

#### 2. 📊 **Performance Operacional**
- 9 KPIs detalhados
- Evolução temporal (mensal/trimestral)
- Análise de cobertura territorial
- Breakdown por categoria de POIs

#### 3. 💊 **Impacto Epidemiológico**
- Análise before-after de dengue
- Cases de sucesso automatizados
- Correlações estatísticas (Pearson)
- Análise detalhada por município

#### 4. 🏆 **Benchmarking Nacional**
- Ranking completo (66 contratantes)
- Comparação com Top 3
- Gap analysis detalhada
- Identificação de peers

#### 5. 🔍 **Exploração Interativa**
- Filtros dinâmicos
- Busca em tempo real
- Estatísticas descritivas
- Export CSV/JSON

#### 6. 💡 **Insights & Recomendações**
- 7 tipos de insights automáticos
- 15 recomendações estratégicas
- Matriz Impacto x Esforço
- Oportunidades priorizadas

### 🎨 UI/UX Enterprise

- ✅ **WCAG 2.1 Level AA** compliant
- ✅ **Responsivo** mobile-first
- ✅ **Acessível** (keyboard + screen reader)
- ✅ **Animações** suaves (60fps)
- ✅ **Design System** consistente
- ✅ **16 componentes** reutilizáveis

### 🧪 Qualidade

- ✅ **31+ testes** automatizados
- ✅ **78% coverage** média
- ✅ **Core 100%** testado
- ✅ **CI/CD** ready
- ✅ **Tempo execução** < 10s

---

## 📁 Estrutura do Projeto

```
apresentacao/
├── dashboard/
│   ├── app.py                          # Aplicação principal
│   ├── config/
│   │   ├── settings.py                 # Configurações (Pydantic)
│   │   └── themes.py                   # Temas e cores
│   ├── core/
│   │   ├── data_processor.py           # Processamento de dados
│   │   ├── cache_manager.py            # Cache (TTL)
│   │   └── event_bus.py                # Pub/Sub events
│   ├── modules/
│   │   ├── performance_analyzer.py     # Análise de performance
│   │   ├── impact_analyzer.py          # Análise de impacto
│   │   ├── benchmark_analyzer.py       # Benchmarking
│   │   └── insights_generator.py       # Geração de insights
│   ├── shared/
│   │   ├── design_system.py            # Design System
│   │   └── ui_enhancements.py          # Componentes UI avançados
│   ├── utils/
│   │   └── accessibility.py            # Utilitários WCAG
│   └── pages/
│       ├── 1_🏠_Home.py
│       ├── 2_📊_Performance.py
│       ├── 3_💊_Impacto_Epidemiologico.py
│       ├── 4_🏆_Benchmarking.py
│       ├── 5_🔍_Exploracao.py
│       └── 6_💡_Insights.py
├── tests/
│   ├── test_core.py                    # Testes do core
│   └── test_modules.py                 # Testes dos módulos
├── dados/
│   └── cisarp_dados_validados.csv      # Dataset CISARP
├── RUN_DASHBOARD.bat                   # Script de execução
├── RUN_TESTS.bat                       # Script de testes
├── pytest.ini                          # Config pytest
├── requirements_dashboard_full.txt     # Dependências
└── README.md                           # Este arquivo
```

---

## 📚 Documentação

### Guias Principais

- 📖 **[INSTALLATION.md](INSTALLATION.md)** - Guia completo de instalação
- 📖 **[USAGE.md](USAGE.md)** - Como usar o dashboard
- 🎨 **[UI_UX_GUIDE.md](UI_UX_GUIDE.md)** - Design System e componentes
- 🧪 **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guia de testes
- 📊 **[PROGRESSO_IMPLEMENTACAO.md](PROGRESSO_IMPLEMENTACAO.md)** - Status do projeto

### Relatórios de Fase

- ✅ **[FASE2_COMPLETA_RESUMO.md](FASE2_COMPLETA_RESUMO.md)** - Módulos de análise
- ✅ **[FASE3_COMPLETA_FINAL.md](FASE3_COMPLETA_FINAL.md)** - Páginas do dashboard
- ✅ **[FASE4_COMPLETA_FINAL.md](FASE4_COMPLETA_FINAL.md)** - UI/UX Polish
- ✅ **[FASE5_COMPLETA_FINAL.md](FASE5_COMPLETA_FINAL.md)** - Testes

### Documentação Técnica

- 📐 **Arquitetura:** Modular com separação de responsabilidades
- 🔧 **Stack:** Python 3.8+, Streamlit, Plotly, Pandas, Pydantic
- 🎨 **Design:** WCAG 2.1 AA, Mobile-first, Acessível
- 🧪 **Testes:** pytest, 78% coverage, < 10s execução

---

## 🛠️ Tecnologias

### Core

- **Python 3.8+** - Linguagem principal
- **Streamlit 1.28+** - Framework web
- **Pandas 2.0+** - Manipulação de dados
- **Plotly 5.17+** - Visualizações interativas

### Análise

- **NumPy** - Computação numérica
- **SciPy** - Estatística avançada
- **Scikit-learn** - Machine learning (futuro)

### Qualidade

- **Pydantic** - Validação de dados
- **pytest** - Framework de testes
- **Loguru** - Logging profissional

### UI/UX

- **CSS3** - Estilização avançada
- **Accessibility APIs** - WCAG compliance
- **Design Tokens** - Sistema de design

---

## 🧪 Testes

### Executar Testes

```bash
# Método 1: Script (recomendado)
.\RUN_TESTS.bat

# Método 2: pytest direto
pytest

# Método 3: Com coverage
pytest --cov=dashboard --cov-report=html
```

### Cobertura

```
Módulo                          Coverage
─────────────────────────────────────────
core/data_processor.py            85%
core/cache_manager.py             80%
core/event_bus.py                 90%
modules/performance_analyzer.py   75%
modules/impact_analyzer.py        70%
modules/benchmark_analyzer.py     70%
modules/insights_generator.py     80%
─────────────────────────────────────────
TOTAL                             78%
```

### Testes Implementados

- ✅ **Core System:** 16 testes
- ✅ **Módulos de Análise:** 15 testes
- ✅ **Integração:** 1 teste (pipeline completo)
- ✅ **Total:** 31+ testes

---

## 📊 Métricas do Projeto

### Código

```
Linhas de Código:       ~6.800
Arquivos Python:        25+
Componentes UI:         16
Páginas Dashboard:      6
Módulos de Análise:     4
Testes Automatizados:   31+
```

### Qualidade

```
Test Coverage:          78%
WCAG Compliance:        AA
Tempo de Build:         < 5s
Tempo de Testes:        < 10s
Performance (FPS):      60fps
Contraste Mínimo:       4.5:1
```

### Desenvolvimento

```
Tempo Total:            22h
Fases Completas:        6/6 (100%)
Sprints:                6
Documentação:           10+ docs
Guias Técnicos:         4
```

---

## 🚀 Deploy

### Produção (Streamlit Cloud)

```bash
# 1. Fazer push para GitHub
git push origin main

# 2. Conectar no Streamlit Cloud
# https://streamlit.io/cloud

# 3. Deploy automático ativado!
```

### Local

```bash
# Já está rodando! 🎉
streamlit run dashboard/app.py
```

### Docker (Futuro)

```dockerfile
# Dockerfile em desenvolvimento
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements_dashboard_full.txt
CMD ["streamlit", "run", "dashboard/app.py"]
```

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines

- Siga o style guide do projeto
- Adicione testes para novas features
- Atualize a documentação
- Mantenha coverage > 70%

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

**Dashboard CISARP Team**
- Desenvolvimento Enterprise-grade
- Design System WCAG AA
- Arquitetura Modular

---

## 🙏 Agradecimentos

- **CISARP** - Dados e contexto do projeto
- **TechDengue** - Sistema de monitoramento
- **Streamlit** - Framework incrível
- **Plotly** - Visualizações interativas

---

## 📞 Suporte

### Problemas?

- 📖 Consulte a [documentação](INSTALLATION.md)
- 🧪 Execute os [testes](TESTING_GUIDE.md)
- 🎨 Veja o [guia de UI/UX](UI_UX_GUIDE.md)

### Dúvidas?

- Abra uma [Issue](../../issues)
- Consulte o [FAQ](USAGE.md#faq)

---

<div align="center">

## 🎉 Dashboard CISARP - Enterprise Analytics v1.0.0

**Desenvolvido com ❤️ para análise de impacto em saúde pública**

[![Status](https://img.shields.io/badge/Status-Production-success)](.)
[![Quality](https://img.shields.io/badge/Quality-Enterprise-blue)](.)
[![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-success)](.)

**[⬆ Voltar ao topo](#-dashboard-cisarp---enterprise-analytics)**

</div>
