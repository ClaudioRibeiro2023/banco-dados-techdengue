# 🚀 GUIA COMPLETO - FASES F, G.1 e H

**Implementação das Opções 1, 2 e 3**

---

## 📋 ÍNDICE

1. [Fase F - API Integration](#fase-f)
2. [Fase G.1 - Command Palette](#fase-g1)
3. [Fase H - E2E Tests](#fase-h)
4. [Checklist de Implementação](#checklist)

---

## FASE F - API INTEGRATION

### 📦 Arquivos Criados

#### 1. `src/lib/api-client.ts` ✅ CRIADO
**Descrição:** Cliente axios configurado com interceptors

**Features:**
- Base URL configurável (env variable)
- Timeout 30s
- Auth token injection
- Request/Response logging (dev only)
- Retry logic (3x para network errors)
- Error handling (401, 403, 500)

**Endpoints:**
```typescript
api.monitor.getData()
api.monitor.getLogs(limit)
api.quality.getReport()
api.quality.getValidations(filters)
api.dataTable.getData(params)
api.dataTable.export(format, filters)
api.system.getHealth()
```

#### 2. `src/lib/queries.ts` ✅ CRIADO (precisa ajustes)
**Descrição:** React Query hooks

**Hooks disponíveis:**
```typescript
useMonitorData()           // Auto-refetch 60s
useQualityReport()
useQualityValidations(filters)
useDataTable(params)
useExportData()            // Mutation
usePrefetchQuality()
```

**Ajustes necessários (React Query v5):**
```typescript
// Remover onError → usar onError no componente
// Trocar keepPreviousData por placeholderData
// Usar throwOnError para error boundaries
```

#### 3. `.env` - Criar na raiz do frontend
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

#### 4. Atualizar `src/main.tsx`
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: 2,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
```

#### 5. Atualizar páginas para usar API

**Monitor Page:**
```typescript
import { useMonitorData } from '@/lib/queries'

export function MonitorPage() {
  const { data, isLoading, error } = useMonitorData()

  if (isLoading) return <SkeletonLoader />
  if (error) return <ErrorState error={error} />
  if (!data) return <EmptyState />

  return (
    // Usar data ao invés de mockMonitorData
  )
}
```

**Quality Page:**
```typescript
import { useQualityValidations } from '@/lib/queries'

export function QualityPage() {
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all')
  const { data: validations, isLoading } = useQualityValidations({
    status: filter === 'all' ? undefined : filter
  })

  // Render com validations
}
```

**Data Table Page:**
```typescript
import { useDataTable, useExportData } from '@/lib/queries'

export function DataTablePage() {
  const [params, setParams] = useState({ page: 1, pageSize: 10 })
  const { data, isLoading } = useDataTable(params)
  const exportMutation = useExportData()

  const handleExport = (format: 'csv' | 'json') => {
    exportMutation.mutate({ format, filters: params.filters })
  }

  // Usar data.rows e data.total
}
```

### 🐍 Backend Python API (Exemplo)

**FastAPI mínimo para testar:**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MonitorData(BaseModel):
    database: dict
    qualityScore: float
    validations: dict
    layers: dict
    lastUpdate: str

# Endpoints
@app.get("/api/monitor")
async def get_monitor():
    return {
        "database": {"status": "online", "message": "Conectado"},
        "qualityScore": 94.5,
        "validations": {"passed": 18, "total": 20},
        "layers": {"bronze": 5, "silver": 4, "gold": 3},
        "lastUpdate": "2025-10-31T15:00:00"
    }

@app.get("/api/quality/validations")
async def get_validations(status: Optional[str] = None):
    # Retornar lista de validações
    pass

@app.get("/api/data")
async def get_data(
    page: int = 1,
    pageSize: int = 10,
    search: Optional[str] = None
):
    # Retornar { rows: [], total: 100 }
    pass

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Run: uvicorn main:app --reload --port 8000
```

### ✅ Checklist Fase F

- [x] api-client.ts criado
- [x] queries.ts criado
- [ ] Ajustar queries para React Query v5
- [ ] Criar .env
- [ ] Atualizar main.tsx com QueryClientProvider
- [ ] Atualizar MonitorPage para usar useMonitorData
- [ ] Atualizar QualityPage para usar useQualityValidations
- [ ] Atualizar DataTablePage para usar useDataTable
- [ ] Criar backend Python (FastAPI ou Flask)
- [ ] Testar integração end-to-end

---

## FASE G.1 - COMMAND PALETTE

### 📦 Arquivos a Criar

#### 1. `src/components/command-palette.tsx`

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Home, BarChart3, Table2, Settings, Search } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  // Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Monitor</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/quality'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Qualidade</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/data-table'))}>
            <Table2 className="mr-2 h-4 w-4" />
            <span>Dados</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => runCommand(() => console.log('Export'))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Exportar Dados</span>
            <kbd className="ml-auto">⌘E</kbd>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

#### 2. `src/components/ui/command.tsx`

Instalar dependência:
```bash
npm install cmdk
```

Adicionar componente (via shadcn):
```bash
npx shadcn-ui@latest add command
```

#### 3. Integrar no App

```typescript
// src/App.tsx
import { CommandPalette } from '@/components/command-palette'

function App() {
  return (
    <BrowserRouter>
      <CommandPalette />
      <AppShell>
        <Routes>
          {/* ... */}
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
```

### ✨ Features Avançadas

**Busca Fuzzy:**
```typescript
import Fuse from 'fuse.js'

const fuse = new Fuse(commands, {
  keys: ['title', 'keywords'],
  threshold: 0.3,
})
```

**Histórico:**
```typescript
const [history, setHistory] = useState<string[]>([])

// Salvar comando executado
const runCommand = (id: string, command: () => void) => {
  setHistory([id, ...history.slice(0, 9)])
  localStorage.setItem('command-history', JSON.stringify(history))
  command()
}
```

**Shortcuts Customizáveis:**
```typescript
const shortcuts = {
  'go-home': { keys: 'g h', action: () => navigate('/') },
  'go-quality': { keys: 'g q', action: () => navigate('/quality') },
  'search': { keys: '/', action: () => setOpen(true) },
}
```

### ✅ Checklist Fase G.1

- [ ] Instalar cmdk
- [ ] Adicionar command component (shadcn)
- [ ] Criar CommandPalette component
- [ ] Integrar no App.tsx
- [ ] Adicionar comandos de navegação
- [ ] Adicionar comandos de ações
- [ ] Implementar keyboard shortcuts
- [ ] Adicionar busca fuzzy (opcional)
- [ ] Adicionar histórico (opcional)
- [ ] Testar Ctrl+K / Cmd+K

---

## FASE H - E2E TESTS

### 📦 Setup Playwright

#### 1. Instalar e Configurar

```bash
npm install -D @playwright/test
npx playwright install
```

#### 2. `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 🧪 Testes Críticos

#### 1. `e2e/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')

    // Check home page
    await expect(page).toHaveTitle(/TechDengue/)
    await expect(page.getByRole('heading', { name: 'Monitor de Qualidade' })).toBeVisible()

    // Navigate to Quality
    await page.getByRole('link', { name: 'Qualidade' }).click()
    await expect(page).toHaveURL('/quality')
    await expect(page.getByRole('heading', { name: 'Qualidade de Dados' })).toBeVisible()

    // Navigate to Data Table
    await page.getByRole('link', { name: 'Dados' }).click()
    await expect(page).toHaveURL('/data-table')
    await expect(page.getByRole('heading', { name: 'Tabela de Dados' })).toBeVisible()
  })

  test('should show active link in sidebar', async ({ page }) => {
    await page.goto('/')
    
    const homeLink = page.getByRole('link', { name: 'Monitor' })
    await expect(homeLink).toHaveClass(/bg-accent/)
  })
})
```

#### 2. `e2e/monitor.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Monitor Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display status cards', async ({ page }) => {
    await expect(page.getByText('Database')).toBeVisible()
    await expect(page.getByText('ONLINE')).toBeVisible()
    await expect(page.getByText('94.5%')).toBeVisible()
  })

  test('should display charts', async ({ page }) => {
    // Check for recharts canvas
    await expect(page.locator('.recharts-wrapper')).toBeVisible()
  })

  test('should display activity log', async ({ page }) => {
    await expect(page.getByText('Log de Atividades')).toBeVisible()
    await expect(page.getByText(/Sincronização concluída/)).toBeVisible()
  })
})
```

#### 3. `e2e/quality.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Quality Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quality')
  })

  test('should filter validations', async ({ page }) => {
    // Click "Aprovadas" filter
    await page.getByRole('button', { name: 'Aprovadas' }).click()
    
    // Should show only passed validations
    const rows = page.getByRole('row')
    await expect(rows).toHaveCount(6) // Header + 5 passed
  })

  test('should display validation details', async ({ page }) => {
    await expect(page.getByText('Completude de POIs')).toBeVisible()
    await expect(page.getByText('98.5%')).toBeVisible()
  })
})
```

#### 4. `e2e/data-table.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Data Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data-table')
  })

  test('should sort table', async ({ page }) => {
    // Click sort on Município column
    await page.getByRole('button', { name: /Município/ }).click()
    
    // First row should be alphabetically first
    const firstCell = page.getByRole('cell').first()
    await expect(firstCell).toHaveText(/Araguari/)
  })

  test('should search table', async ({ page }) => {
    await page.getByPlaceholder('Buscar em todas as colunas').fill('Uber')
    
    // Should filter results
    await expect(page.getByText('Uberlândia')).toBeVisible()
    await expect(page.getByText('Uberaba')).toBeVisible()
  })

  test('should paginate', async ({ page }) => {
    await page.getByRole('button', { name: 'Próxima' }).click()
    
    // URL or state should change
    await expect(page.getByText('Página 2')).toBeVisible()
  })

  test('should export CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'CSV' }).click()
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toBe('dados.csv')
  })
})
```

#### 5. `e2e/theme.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test('should toggle dark/light mode', async ({ page }) => {
    await page.goto('/')

    // Click theme toggle
    await page.getByRole('button', { name: /Toggle theme/ }).click()
    await page.getByRole('menuitem', { name: 'Dark' }).click()

    // Check dark class
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)

    // Toggle to light
    await page.getByRole('button', { name: /Toggle theme/ }).click()
    await page.getByRole('menuitem', { name: 'Light' }).click()

    await expect(html).not.toHaveClass(/dark/)
  })

  test('should persist theme preference', async ({ page }) => {
    await page.goto('/')

    // Set dark mode
    await page.getByRole('button', { name: /Toggle theme/ }).click()
    await page.getByRole('menuitem', { name: 'Dark' }).click()

    // Reload page
    await page.reload()

    // Should still be dark
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })
})
```

### 🎯 Executar Testes

```bash
# Run all tests
npm run test:e2e

# Run in UI mode
npx playwright test --ui

# Run specific file
npx playwright test e2e/navigation.spec.ts

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

### ✅ Checklist Fase H

- [ ] Instalar Playwright
- [ ] Criar playwright.config.ts
- [ ] Criar e2e/navigation.spec.ts
- [ ] Criar e2e/monitor.spec.ts
- [ ] Criar e2e/quality.spec.ts
- [ ] Criar e2e/data-table.spec.ts
- [ ] Criar e2e/theme.spec.ts
- [ ] Rodar testes localmente
- [ ] Verificar coverage
- [ ] Configurar CI/CD (opcional)

---

## 📊 CHECKLIST GERAL

### Fase F - API Integration
- [x] api-client.ts criado (básico)
- [x] queries.ts criado (precisa ajustes)
- [ ] .env configurado
- [ ] main.tsx com QueryClientProvider
- [ ] Páginas usando hooks da API
- [ ] Backend Python funcionando
- [ ] Teste end-to-end API ↔ Frontend

### Fase G.1 - Command Palette
- [ ] cmdk instalado
- [ ] command.tsx component (shadcn)
- [ ] CommandPalette component
- [ ] Integrado no App
- [ ] Ctrl+K funcionando
- [ ] Comandos de navegação
- [ ] Comandos de ações

### Fase H - E2E Tests
- [ ] Playwright instalado
- [ ] playwright.config.ts
- [ ] 5 test suites criados
- [ ] Testes passando
- [ ] HTML report gerado

---

## 🎯 PRÓXIMOS PASSOS

1. **Ajustar queries.ts** para React Query v5
2. **Criar .env** e configurar API_BASE_URL
3. **Atualizar main.tsx** com QueryClientProvider
4. **Criar backend Python** mínimo (FastAPI)
5. **Testar integração** API ↔ Frontend
6. **Instalar cmdk** e adicionar Command component
7. **Criar CommandPalette** e testar Ctrl+K
8. **Instalar Playwright** e criar testes
9. **Rodar testes E2E** e verificar coverage

---

## 📚 Recursos

### Documentação
- [React Query v5](https://tanstack.com/query/latest)
- [cmdk](https://cmdk.paco.me/)
- [Playwright](https://playwright.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)

### Exemplos
- [shadcn/ui command](https://ui.shadcn.com/docs/components/command)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

**Criado em:** 31/10/2025  
**Revisão:** v1.0

**Este guia contém tudo necessário para implementar as 3 fases!** 🚀
