# Requisitos Funcionais - TechDengue Dashboard React

**Data:** 31/10/2025  
**Extraído de:** Streamlit atual  
**Versão Target:** React 18 + TypeScript

---

## 🎯 Funcionalidades Core

### F1 - Monitor de Qualidade de Dados

**Descrição:** Dashboard principal mostrando saúde dos dados em tempo real.

**Requisitos:**
- RF1.1: Exibir 5 status cards (Database, Quality Score, Validações, Gold Layer, Last Update)
- RF1.2: Indicador "Live" pulsante no header
- RF1.3: Gauge de qualidade (0-100%) com zonas coloridas
- RF1.4: Gráfico de barras das camadas (Bronze, Silver, Gold)
- RF1.5: Tabela de validações com status PASS/FAIL
- RF1.6: Log de atividades (últimas 5)
- RF1.7: Auto-refresh a cada 60 segundos
- RF1.8: Timestamp de última atualização

**Dados Necessários:**
```typescript
interface MonitorData {
  database: {
    status: 'online' | 'offline' | 'error';
    message: string;
  };
  qualityScore: number; // 0-100
  validations: {
    passed: number;
    total: number;
    checks: ValidationCheck[];
  };
  layers: {
    bronze: number;
    silver: number;
    gold: number;
  };
  lastUpdate: string; // ISO 8601
  activityLog: ActivityEntry[];
}
```

---

### F2 - Qualidade de Dados (Detalhada)

**Descrição:** Página com relatórios detalhados de qualidade.

**Requisitos:**
- RF2.1: Score geral com breakdown por categoria
- RF2.2: Lista completa de validações (paginada)
- RF2.3: Filtros por status (Pass/Fail/Warning)
- RF2.4: Busca por nome de validação
- RF2.5: Drill-down em validação individual
- RF2.6: Histórico de scores (gráfico temporal)
- RF2.7: Recomendações de melhoria
- RF2.8: Export de relatório (PDF/Excel)

**Dados Necessários:**
```typescript
interface QualityReport {
  score: number;
  breakdown: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
  };
  validations: ValidationCheck[];
  history: ScoreHistory[];
  recommendations: Recommendation[];
}
```

---

### F3 - Mega Tabela Analítica

**Descrição:** Visualização tabular de dados com filtros avançados.

**Requisitos:**
- RF3.1: Tabela virtualizada (performance com 10k+ linhas)
- RF3.2: Paginação (50/100/200 por página)
- RF3.3: Ordenação por coluna (asc/desc)
- RF3.4: Filtros múltiplos (AND/OR)
- RF3.5: Busca global (full-text)
- RF3.6: Seleção de colunas visíveis
- RF3.7: Export (CSV, Excel, JSON)
- RF3.8: Resumo de estatísticas (count, sum, avg)
- RF3.9: Highlight de células (condicional)
- RF3.10: Resize de colunas

**Dados Necessários:**
```typescript
interface TableData {
  columns: Column[];
  rows: Row[];
  totalCount: number;
  page: number;
  pageSize: number;
  filters: Filter[];
  sort: Sort[];
}
```

---

### F4 - Configurações

**Descrição:** Página de configurações do sistema.

**Requisitos:**
- RF4.1: Preferências de usuário (tema, idioma)
- RF4.2: Configuração de notificações
- RF4.3: Gerenciamento de API keys
- RF4.4: Configuração de refresh rate
- RF4.5: Thresholds de alertas
- RF4.6: Export/Import de configurações

---

## 🔔 Notificações e Alertas

### F5 - Sistema de Notificações

**Requisitos:**
- RF5.1: Toast notifications (success, warning, error, info)
- RF5.2: Posicionamento configurável (top-right padrão)
- RF5.3: Auto-dismiss (3s padrão, configurável)
- RF5.4: Ações inline (Retry, Undo, etc)
- RF5.5: Queue de notificações (max 3 simultâneas)
- RF5.6: Persistência de notificações críticas

**Tipos:**
```typescript
type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 🔍 Busca e Filtros

### F6 - Command Palette

**Requisitos:**
- RF6.1: Atalho global (Ctrl+K / Cmd+K)
- RF6.2: Busca fuzzy de comandos
- RF6.3: Navegação rápida entre páginas
- RF6.4: Ações contextuais
- RF6.5: Histórico de comandos
- RF6.6: Keyboard navigation (↑↓ Enter Esc)

**Comandos:**
```typescript
interface Command {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'action' | 'search';
}
```

---

## 📊 Visualizações de Dados

### F7 - Gráficos

**Requisitos:**
- RF7.1: Gauge chart (Recharts)
- RF7.2: Bar chart (Recharts)
- RF7.3: Line chart para histórico
- RF7.4: Tooltip interativo
- RF7.5: Zoom e pan (quando aplicável)
- RF7.6: Export de gráfico (PNG, SVG)
- RF7.7: Responsivo (adapta a container)
- RF7.8: Dark/Light mode support

---

## 🔐 Autenticação e Autorização

### F8 - Auth (Futuro)

**Requisitos:**
- RF8.1: Login com email/senha
- RF8.2: OAuth (Google, GitHub)
- RF8.3: JWT tokens
- RF8.4: Refresh token automático
- RF8.5: Logout
- RF8.6: Proteção de rotas por role
- RF8.7: Session timeout (30 min)

---

## 🌐 Internacionalização

### F9 - i18n

**Requisitos:**
- RF9.1: Suporte PT-BR (inicial)
- RF9.2: Preparado para EN, ES
- RF9.3: Detecção automática de idioma
- RF9.4: Seletor de idioma no header
- RF9.5: Formatação de datas/números por locale
- RF9.6: Pluralização correta

**Estrutura:**
```typescript
// pt-BR.json
{
  "monitor": {
    "title": "Monitor de Qualidade",
    "statusCards": {
      "database": "Banco de Dados",
      "qualityScore": "Score de Qualidade"
    }
  }
}
```

---

## ♿ Acessibilidade

### F10 - A11y

**Requisitos:**
- RF10.1: Navegação completa por teclado
- RF10.2: Focus visível (outline)
- RF10.3: ARIA labels em todos os elementos interativos
- RF10.4: Roles semânticos (button, navigation, main, etc)
- RF10.5: Skip links (pular para conteúdo)
- RF10.6: Anúncios para screen readers
- RF10.7: Contraste WCAG 2.2 AA
- RF10.8: Suporte a prefers-reduced-motion
- RF10.9: Zoom até 200% sem quebra
- RF10.10: Textos alternativos em imagens

---

## ⚡ Performance

### F11 - Otimizações

**Requisitos:**
- RF11.1: Code splitting por rota
- RF11.2: Lazy loading de componentes pesados
- RF11.3: Virtualização de listas longas
- RF11.4: Debounce em inputs de busca (300ms)
- RF11.5: Throttle em scroll handlers (100ms)
- RF11.6: Memoização de componentes caros
- RF11.7: Prefetch de rotas prováveis
- RF11.8: Service Worker (cache de assets)
- RF11.9: Imagens otimizadas (WebP, lazy load)
- RF11.10: Bundle size < 180KB (gzip) por rota

**Targets:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TBT < 200ms

---

## 📡 Integração com API

### F12 - API Client

**Requisitos:**
- RF12.1: Cliente HTTP (axios ou fetch)
- RF12.2: Interceptors (auth, error handling)
- RF12.3: Retry automático (3x com backoff)
- RF12.4: Timeout configurável (30s padrão)
- RF12.5: Cache de requisições (React Query)
- RF12.6: Optimistic updates
- RF12.7: Error boundary global
- RF12.8: Offline detection

**Endpoints Necessários:**
```typescript
// GET /api/monitor
interface MonitorEndpoint {
  response: MonitorData;
}

// GET /api/quality
interface QualityEndpoint {
  response: QualityReport;
}

// GET /api/data-table
interface DataTableEndpoint {
  params: {
    page: number;
    pageSize: number;
    filters?: Filter[];
    sort?: Sort[];
  };
  response: TableData;
}

// POST /api/export
interface ExportEndpoint {
  body: {
    format: 'csv' | 'excel' | 'json';
    data: any[];
  };
  response: Blob;
}
```

---

## 🧪 Testabilidade

### F13 - Testes

**Requisitos:**
- RF13.1: Unit tests (Vitest) - cobertura > 70%
- RF13.2: Component tests (Testing Library)
- RF13.3: E2E tests (Playwright) - fluxos críticos
- RF13.4: A11y tests (axe-core)
- RF13.5: Visual regression (Storybook + Chromatic)
- RF13.6: Performance tests (Lighthouse CI)

**Fluxos Críticos para E2E:**
1. Abrir dashboard → Ver status cards → Verificar dados
2. Navegar para Quality → Filtrar validações → Ver detalhes
3. Abrir Data Table → Aplicar filtros → Exportar CSV
4. Usar Command Palette → Navegar para Settings

---

## 📊 Telemetria

### F14 - Analytics

**Requisitos:**
- RF14.1: Page views
- RF14.2: User actions (click, filter, export)
- RF14.3: Performance metrics (LCP, FID, CLS)
- RF14.4: Error tracking
- RF14.5: User flows
- RF14.6: Feature usage
- RF14.7: GDPR compliant (opt-in)

**Eventos Padrão:**
```typescript
// Page view
trackEvent('page_view', {
  page: '/quality',
  referrer: '/',
  timestamp: Date.now()
});

// Action
trackEvent('action', {
  type: 'export',
  format: 'csv',
  rowCount: 150
});

// Error
trackEvent('error', {
  message: 'Failed to load data',
  stack: error.stack,
  context: { page: '/quality' }
});
```

---

## 🎨 Temas

### F15 - Theming

**Requisitos:**
- RF15.1: Dark mode (padrão)
- RF15.2: Light mode
- RF15.3: Auto (system preference)
- RF15.4: Toggle no header
- RF15.5: Persistência da escolha (localStorage)
- RF15.6: Transição suave (200ms)
- RF15.7: Todos os componentes suportam ambos

---

## 📱 Responsividade

### F16 - Mobile Support

**Requisitos:**
- RF16.1: Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- RF16.2: Sidebar colapsável em mobile
- RF16.3: Bottom navigation em mobile
- RF16.4: Touch gestures (swipe, pinch)
- RF16.5: Tabelas com scroll horizontal
- RF16.6: Formulários otimizados (input types corretos)
- RF16.7: Modais full-screen em mobile

---

## 🔄 Estados de Carregamento

### F17 - Loading States

**Requisitos:**
- RF17.1: Skeleton loaders (não spinners)
- RF17.2: Progressive loading (mostrar dados parciais)
- RF17.3: Suspense boundaries
- RF17.4: Loading indicators contextuais
- RF17.5: Timeout handling (> 30s = erro)

---

## ❌ Tratamento de Erros

### F18 - Error Handling

**Requisitos:**
- RF18.1: Error boundary global
- RF18.2: Error boundaries por rota
- RF18.3: Mensagens amigáveis (não stack traces)
- RF18.4: Ações de recuperação (Retry, Go Home)
- RF18.5: Logging de erros (Sentry ou similar)
- RF18.6: Fallback UI consistente

---

## 📝 Validação de Formulários

### F19 - Forms (Futuro)

**Requisitos:**
- RF19.1: Validação em tempo real
- RF19.2: Mensagens de erro inline
- RF19.3: Indicadores de campo obrigatório
- RF19.4: Dirty state tracking
- RF19.5: Confirmação antes de sair (unsaved changes)

---

## 🎯 Priorização

### P0 - MVP (Semana 1-4)
- F1: Monitor de Qualidade
- F3: Mega Tabela (básica)
- F5: Notificações
- F10: Acessibilidade básica
- F11: Performance básica
- F12: API Client

### P1 - V1.0 (Semana 5-6)
- F2: Qualidade Detalhada
- F4: Configurações
- F6: Command Palette
- F7: Gráficos avançados
- F13: Testes completos
- F15: Temas
- F16: Responsividade

### P2 - V1.1+ (Futuro)
- F8: Autenticação
- F9: i18n completo
- F14: Telemetria avançada
- F19: Formulários

---

## ✅ Critérios de Aceitação

Cada funcionalidade deve:
- ✅ Ter testes unitários (> 70% cobertura)
- ✅ Ter Storybook story
- ✅ Passar em audit a11y (axe)
- ✅ Ser responsiva (mobile/tablet/desktop)
- ✅ Suportar dark/light mode
- ✅ Ter documentação (JSDoc)
- ✅ Seguir Design System (tokens)

---

**Próximo:** Setup do projeto React
