# 🦟 TechDengue - Sistema de Dados e Analytics

[![CI](https://github.com/ClaudioRibeiro2023/banco-dados-techdengue/actions/workflows/deploy.yml/badge.svg)](https://github.com/ClaudioRibeiro2023/banco-dados-techdengue/actions)
[![Coverage](https://img.shields.io/badge/Coverage-82%25-brightgreen)](https://github.com/ClaudioRibeiro2023/banco-dados-techdengue)
[![Tests](https://img.shields.io/badge/Tests-59%20passed-success)](https://github.com/ClaudioRibeiro2023/banco-dados-techdengue)
[![Deploy Frontend](https://img.shields.io/badge/Frontend-Netlify-00C7B7?logo=netlify)](https://banco-dados-techdengue.netlify.app)
[![Deploy API](https://img.shields.io/badge/API-Railway-0B0D0E?logo=railway)](https://banco-dados-techdengue-production.up.railway.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)

> Sistema completo de dados integrados do Projeto TechDengue para monitoramento e análise de atividades de controle de dengue em Minas Gerais.

**🌐 Frontend:** https://banco-dados-techdengue.netlify.app  
**🔌 API:** https://banco-dados-techdengue-production.up.railway.app

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Como Executar](#-como-executar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API](#-api)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Documentação](#-documentação)

---

## 🎯 Visão Geral

O TechDengue é uma plataforma de dados para:

- **Monitoramento** de atividades de mapeamento e controle de dengue
- **Análise** de dados epidemiológicos e operacionais
- **Integração** com sistemas GIS (PostgreSQL/PostGIS)
- **Visualização** através de dashboard moderno

### Principais Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Dashboard Analytics** | Interface React moderna com gráficos e tabelas |
| **API REST** | Endpoints para consulta de dados |
| **Data Lake** | Arquitetura Medallion (Bronze/Silver/Gold) |
| **Qualidade de Dados** | Validações automáticas e monitoramento |

---

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.14** + **FastAPI** - API REST
- **PostgreSQL/PostGIS** - Banco de dados GIS
- **Redis (Upstash)** - Cache e rate limiting
- **Pydantic** - Validação de dados

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **React Query** - Gerenciamento de estado
- **Radix UI** - Componentes acessíveis

### Infraestrutura
- **Netlify** - Deploy do frontend
- **Railway** - Deploy da API (https://banco-dados-techdengue-production.up.railway.app)
- **GitHub Actions** - CI/CD

---

## 🚀 Como Executar

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Git

### 1. Clonar o Repositório

```bash
git clone https://github.com/ClaudioRibeiro2023/banco-dados-techdengue.git
cd banco-dados-techdengue
```

### 2. Backend (API)

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar API
uvicorn src.api.app:app --reload
```

API disponível em: http://localhost:8000

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Frontend disponível em: http://localhost:5173

### 4. Dashboard Streamlit (Legacy)

```bash
# Na raiz do projeto
streamlit run dashboard/app.py
```

Dashboard disponível em: http://localhost:8501

---

## 📂 Estrutura do Projeto

```
banco-dados-techdengue/
├── src/                    # 🐍 Backend Python
│   ├── api/               # Endpoints FastAPI
│   ├── core/              # Lógica de negócio
│   ├── services/          # Serviços
│   └── config.py          # Configurações
│
├── frontend/              # ⚛️ React/TypeScript
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── pages/         # Páginas
│   │   └── lib/           # Utilitários
│   └── package.json
│
├── dashboard/             # 📊 Streamlit (Legacy)
│
├── data_lake/             # 💾 Data Lake Medallion
│   ├── bronze/            # Dados brutos
│   ├── silver/            # Dados limpos
│   └── gold/              # Dados agregados
│
├── scripts/               # 🔧 Scripts utilitários
│   ├── debug/             # Scripts de debug
│   └── verificacao/       # Scripts de verificação
│
├── tests/                 # 🧪 Testes
│   ├── api/               # Testes de API
│   ├── components/        # Testes de componentes
│   └── accessibility/     # Testes de acessibilidade
│
├── docs/                  # 📚 Documentação
│   ├── architecture/      # Arquitetura
│   ├── guides/            # Guias práticos
│   └── archive/           # Docs históricos
│
├── .github/workflows/     # 🔄 CI/CD
├── requirements.txt       # Deps Python
├── Dockerfile            # Container
└── docker-compose.yml    # Orquestração
```

---

## 🔌 API

### Base URL

- **Produção:** `https://banco-dados-techdengue-production.up.railway.app`
- **Local:** `http://localhost:8000`
- **Documentação:** `https://banco-dados-techdengue-production.up.railway.app/docs` (Swagger UI)

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/api/v1/atividades` | Lista atividades |
| GET | `/api/v1/municipios` | Lista municípios |
| GET | `/api/v1/dengue` | Dados epidemiológicos |
| GET | `/api/v1/analytics/summary` | Resumo analítico |
| GET | `/api/v1/export/csv` | Export em CSV |

### Exemplo de Uso

```bash
# Health check
curl http://localhost:8000/health

# Lista atividades (paginado)
curl "http://localhost:8000/api/v1/atividades?page=1&limit=10"
```

---

## 🧪 Testes

### Backend (Pytest)

```bash
# Rodar todos os testes
python -m pytest tests/ -v

# Com coverage
python -m pytest tests/ --cov=src
```

### Frontend (Vitest)

```bash
cd frontend

# Rodar testes
npm run test

# Watch mode
npm run test -- --watch
```

### Status dos Testes

| Suite | Passando | Total |
|-------|----------|-------|
| Backend | 68 | 70 |
| Frontend | 18 | 18 |

---

## 🚀 Deploy

### Frontend (Netlify)

O deploy é automático via GitHub:
- Branch `main` → Produção
- Pull Requests → Preview

**URL:** https://banco-dados-techdengue.netlify.app

### Backend (Railway)

Configurado em `railway.json`. Para deploy manual:

```bash
railway up
```

### Docker

```bash
# Build
docker-compose build

# Executar
docker-compose up
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) | Guia completo de deploy |
| [GUIA_INTEGRACAO.md](GUIA_INTEGRACAO.md) | Integração com a API |
| [docs/BOOK_DE_TESTES.md](docs/BOOK_DE_TESTES.md) | Book de testes |
| [docs/architecture/](docs/architecture/) | Documentação de arquitetura |
| [docs/guides/](docs/guides/) | Guias práticos |

---

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Banco de Dados
GIS_DB_HOST=localhost
GIS_DB_PORT=5432
GIS_DB_NAME=postgres
GIS_DB_USER=seu_usuario
GIS_DB_PASSWORD=sua_senha

# Redis (opcional para dev)
REDIS_URL=redis://localhost:6379

# API
API_SECRET_KEY=sua_chave_secreta
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Convenções

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
- **Código Python:** PEP 8, type hints
- **Código TypeScript:** ESLint, Prettier

---

## 📄 Licença

Este projeto é proprietário da equipe TechDengue.

---

## 📞 Contato

Para dúvidas técnicas ou acesso aos dados, entre em contato com a equipe TechDengue.

---

**Última atualização:** Dezembro 2025
