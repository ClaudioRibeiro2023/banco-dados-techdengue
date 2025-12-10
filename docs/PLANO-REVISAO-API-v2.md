# 📋 Plano de Revisão - Integração API TechDengue v2.0

**Data:** Dezembro 2025  
**Objetivo:** Garantir uso de dados reais da API em todo o dashboard  
**API Base:** `https://banco-dados-techdengue-production.up.railway.app`

---

## 📊 Status Atual da API

| Endpoint | Total Registros | Status |
|----------|-----------------|--------|
| `/facts` | 1.281 atividades | ✅ Online |
| `/dengue` | 124.684 casos | ✅ Online |
| `/municipios` | 853 municípios | ✅ Online |
| `/api/v1/weather/{cidade}` | Tempo real | ✅ Online |
| `/api/v1/risk/dashboard` | 10 cidades | ✅ Online |
| `/api/v1/risk/analyze` | IA (Llama 3.3) | ✅ Online |

---

## 🎯 Fases do Plano

### FASE 1: Mapeamento de Tipos (Prioridade Alta)
**Objetivo:** Alinhar tipos do frontend com estrutura real da API

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| 1.1 Atualizar `Municipio` com campos reais | `src/types/api.types.ts` | ⬜ Pendente |
| 1.2 Atualizar `AtividadeFact` com campos reais | `src/types/api.types.ts` | ⬜ Pendente |
| 1.3 Atualizar `CasoDengue` com campos reais | `src/types/api.types.ts` | ⬜ Pendente |
| 1.4 Criar tipos para `/gold` endpoint | `src/types/api.types.ts` | ⬜ Pendente |

**Campos reais da API:**

```typescript
// /municipios - Campos reais
interface MunicipioAPI {
  codigo_ibge: string;
  municipio: string;         // Nome em uppercase
  populacao: string;         // Ex: "6.272"
  urs: string;               // Unidade Regional de Saúde
  cod_microregiao: number;
  microregiao_saude: string;
  cod_macroregiao: number;
  macroregiao_saude: string;
  area_ha: number;
  data_carga: string;
  versao: string;
}

// /facts - Campos reais
interface AtividadeFactAPI {
  codigo_ibge: string;
  municipio: string;
  data_map: string;          // "2025-02-26"
  nomenclatura_atividade: string;
  pois: number;
  devolutivas: number;
  hectares_mapeados: number;
}

// /dengue - Campos reais
interface CasoDengueAPI {
  codigo_ibge: string;
  municipio: string;
  casos: number;
  semana_epidemiologica: number;
  ano: number;
  data_carga: string;
  versao: string;
}
```

---

### FASE 2: Serviços de Dados (Prioridade Alta)
**Objetivo:** Garantir que serviços usem API real e façam mapeamento correto

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| 2.1 Revisar `banco-techdengue.service.ts` | `/lib/services/` | ⬜ Pendente |
| 2.2 Revisar `dados-geograficos.service.ts` | `/lib/services/` | ⬜ Pendente |
| 2.3 Revisar `dados-gerenciais.service.ts` | `/lib/services/` | ⬜ Pendente |
| 2.4 Revisar `weather.service.ts` | `/lib/services/` | ⬜ Pendente |
| 2.5 Revisar `risk.service.ts` | `/lib/services/` | ⬜ Pendente |

**Checklist por serviço:**
- [ ] `USE_MOCK` controlado por env var `NEXT_PUBLIC_MOCK_API`
- [ ] Endpoint correto da API v2.0
- [ ] Mapeamento de campos da API para tipos do frontend
- [ ] Tratamento de erros com fallback apropriado
- [ ] Logging adequado

---

### FASE 3: Hooks de Features (Prioridade Média)
**Objetivo:** Garantir que hooks consumam dados corretamente

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| 3.1 Revisar `use-dashboard-kpis.ts` | `/features/dashboard/hooks/` | ⬜ Pendente |
| 3.2 Revisar `use-criadouros-analytics.ts` | `/features/analise/hooks/` | ⬜ Pendente |
| 3.3 Revisar `use-devolutivas-analytics.ts` | `/features/analise/hooks/` | ⬜ Pendente |
| 3.4 Revisar `use-comparativo-municipios.ts` | `/features/analise/hooks/` | ⬜ Pendente |
| 3.5 Revisar `use-pois-geojson.ts` | `/features/mapa/hooks/` | ⬜ Pendente |
| 3.6 Revisar `use-atividades.ts` | `/features/atividades/hooks/` | ⬜ Pendente |
| 3.7 Revisar `dashboard-filters.tsx` | `/features/dashboard/components/` | ⬜ Pendente |

**Checklist por hook:**
- [ ] Parâmetros compatíveis com API v2.0 (`q`, `limit`, `offset`)
- [ ] Processamento de dados adaptado à estrutura real
- [ ] Tratamento de loading/error states
- [ ] Fallback para dados mock quando API offline

---

### FASE 4: Componentes de UI (Prioridade Média)
**Objetivo:** Garantir que componentes renderizem dados reais corretamente

| Tarefa | Componente | Status |
|--------|------------|--------|
| 4.1 Dashboard KPI Cards | Exibir totais reais | ⬜ Pendente |
| 4.2 Mapa de POIs | Renderizar coordenadas reais | ⬜ Pendente |
| 4.3 Gráficos de Análise | Dados de criadouros/devolutivas | ⬜ Pendente |
| 4.4 Filtros de Município | Lista de 853 municípios | ⬜ Pendente |
| 4.5 Widget de Clima | Dados em tempo real | ⬜ Pendente |
| 4.6 Widget de Risco | Dashboard de alertas | ⬜ Pendente |

---

### FASE 5: Testes e Validação (Prioridade Alta)
**Objetivo:** Garantir funcionamento end-to-end

| Tarefa | Tipo | Status |
|--------|------|--------|
| 5.1 Testar carregamento de municípios | Integração | ⬜ Pendente |
| 5.2 Testar carregamento de atividades | Integração | ⬜ Pendente |
| 5.3 Testar dados de dengue | Integração | ⬜ Pendente |
| 5.4 Testar clima por cidade | Integração | ⬜ Pendente |
| 5.5 Testar dashboard de risco | Integração | ⬜ Pendente |
| 5.6 Testar análise de risco com IA | Integração | ⬜ Pendente |
| 5.7 Validar build de produção | Build | ⬜ Pendente |

---

### FASE 6: Otimização e Deploy (Prioridade Baixa)
**Objetivo:** Performance e produção

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| 6.1 Configurar cache apropriado | `staleTime` por endpoint | ⬜ Pendente |
| 6.2 Remover dados mock não utilizados | Limpeza de código | ⬜ Pendente |
| 6.3 Atualizar variáveis de ambiente | Produção | ⬜ Pendente |
| 6.4 Deploy no Netlify | Frontend | ⬜ Pendente |

---

## 📁 Arquivos Chave

### Configuração
```
.env                           # Variáveis de ambiente
src/lib/config/env.ts          # Configuração da API
src/lib/api/client.ts          # Cliente Axios
```

### Serviços (camada de dados)
```
src/lib/services/banco-techdengue.service.ts   # /facts
src/lib/services/dados-geograficos.service.ts  # /municipios
src/lib/services/dados-gerenciais.service.ts   # Agregações
src/lib/services/weather.service.ts            # /api/v1/weather
src/lib/services/risk.service.ts               # /api/v1/risk
```

### Hooks (camada de lógica)
```
src/features/dashboard/hooks/use-dashboard-kpis.ts
src/features/analise/hooks/use-criadouros-analytics.ts
src/features/analise/hooks/use-devolutivas-analytics.ts
src/features/analise/hooks/use-comparativo-municipios.ts
src/features/mapa/hooks/use-pois-geojson.ts
src/features/atividades/hooks/use-atividades.ts
```

### Tipos
```
src/types/api.types.ts         # Interfaces TypeScript
```

---

## 🔄 Fluxo de Dados

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   API v2.0   │────▶│   Services   │────▶│    Hooks     │────▶│  Components  │
│  (Railway)   │     │ (Mapeamento) │     │ (useQuery)   │     │    (UI)      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
      │                     │                    │                    │
      │                     │                    │                    │
      ▼                     ▼                    ▼                    ▼
  Dados Brutos         Tipos TS            React State          Renderização
```

---

## ✅ Critérios de Conclusão

- [ ] Todos os endpoints da API funcionando
- [ ] Tipos TypeScript alinhados com API real
- [ ] Serviços fazendo mapeamento correto
- [ ] Hooks processando dados adequadamente
- [ ] Componentes renderizando dados reais
- [ ] Build de produção sem erros
- [ ] Testes de integração passando
- [ ] Deploy em produção

---

## 📝 Notas

1. **Mock API**: Controlado por `NEXT_PUBLIC_MOCK_API=true`. Default: usar API real.
2. **Fallback**: Se API falhar, usar dados mock como fallback gracioso.
3. **Cache**: Usar `staleTime` apropriado por tipo de dado (clima: 30min, municípios: 24h).
4. **API Key**: `tk_live_K08Z_4pCr9NiUYmbUmeFjgpy87PMEVPM` (tier: free, 60 req/min).

---

*Última atualização: Dezembro 2025*
