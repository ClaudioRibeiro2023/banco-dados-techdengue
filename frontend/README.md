# TechDengue Dashboard

Dashboard de monitoramento e qualidade de dados para o projeto TechDengue.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.1-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Visão Geral

Dashboard moderno e responsivo construído com React, TypeScript e Tailwind CSS para monitoramento em tempo real da qualidade de dados do projeto TechDengue.

### Funcionalidades Principais

- 📊 **Monitor de Qualidade** - Dashboard principal com métricas em tempo real
- 📈 **Gráficos Interativos** - Line charts, pie charts e bar charts com Recharts
- 📋 **Tabela Analítica** - Tabela sortable, searchable com @tanstack/react-table
- 🎨 **Design System** - Componentes consistentes com shadcn/ui
- 🌗 **Dark/Light Mode** - Tema alternável com persistência
- 📱 **Responsivo** - Mobile-first design
- ♿ **Acessível** - WCAG 2.2 AA compliant
- ⚡ **Performance** - Code splitting e lazy loading

## 📦 Stack Tecnológico

### Core
- **React 18.3** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.1** - Build tool
- **React Router 6** - Routing

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Headless components
- **Framer Motion** - Animations
- **lucide-react** - Icons

### Data & State
- **@tanstack/react-table 8** - Table management
- **@tanstack/react-query 5** - Data fetching
- **Zustand 4** - State management
- **Recharts 2** - Charts library

### Testing
- **Vitest** - Unit testing
- **Testing Library** - Component testing
- **Playwright** - E2E testing

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── empty-state.tsx
│   └── page-transition.tsx
├── pages/
│   ├── monitor.tsx      # Dashboard principal
│   ├── quality.tsx      # Relatório de qualidade
│   └── data-table.tsx   # Tabela analítica
├── lib/
│   ├── utils.ts         # Utility functions
│   └── mock-data.ts     # Mock data
├── styles/
│   └── tokens.css       # Design tokens
├── test/
│   └── setup.ts         # Test configuration
├── App.tsx              # Router setup
└── main.tsx             # Entry point
```

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/your-org/techdengue-dashboard.git

# Entre na pasta do frontend
cd techdengue-dashboard/frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia dev server

# Build
npm run build        # Build para produção
npm run preview      # Preview do build

# Testes
npm run test         # Roda testes unitários
npm run test:ui      # Testes com UI
npm run test:e2e     # Testes E2E com Playwright

# Linting
npm run lint         # Roda ESLint
```

## 🎨 Design System

O projeto utiliza um Design System completo baseado em tokens CSS e componentes reutilizáveis.

### Tokens

- **Cores** - Paleta semântica com suporte a dark mode
- **Tipografia** - Escalas de texto e line heights
- **Espaçamento** - Sistema de 10 steps (2px - 64px)
- **Shadows** - 5 níveis de elevação
- **Radius** - sm, md, lg
- **Animations** - Durations e easings

### Componentes

Todos os componentes seguem padrões de acessibilidade (WCAG 2.2 AA) e são totalmente tipados com TypeScript.

## 🧪 Testes

### Unitários (Vitest)

```bash
npm run test
```

Testa utils, hooks e lógica de negócio.

### Componentes (Testing Library)

```bash
npm run test
```

Testa rendering e interações de componentes.

### E2E (Playwright)

```bash
npm run test:e2e
```

Testa fluxos completos do usuário.

## 🚀 Deploy

### Build

```bash
npm run build
```

Gera arquivos otimizados em `dist/`.

### Preview

```bash
npm run preview
```

Testa o build localmente.

## 📊 Páginas

### 1. Monitor (`/`)

Dashboard principal com:
- 4 status cards
- Gráfico de tendência de qualidade
- Gráfico de distribuição por camada
- Log de atividades em tempo real

### 2. Qualidade (`/quality`)

Relatório detalhado com:
- Summary cards
- Gráfico de validações por categoria
- Tabela interativa com filtros
- Export de dados

### 3. Dados (`/data-table`)

Tabela analítica com:
- 100+ registros
- Sorting e filtering
- Global search
- Pagination
- Export CSV/JSON

## 🎯 Performance

- **LCP** < 2.5s
- **FID** < 100ms
- **CLS** < 0.1
- **Bundle size** < 180KB (gzip) por rota

## ♿ Acessibilidade

- Navegação completa por teclado
- Screen reader support
- ARIA labels e roles
- Contraste WCAG 2.2 AA
- Focus visible
- Reduced motion support

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar PRs.

## 📧 Contato

TechDengue Team - techdengue@example.com

---

**Desenvolvido com ❤️ usando React + TypeScript**
