# Contribuindo para o TechDengue

Obrigado pelo interesse em contribuir! Este documento descreve como configurar o ambiente de desenvolvimento e as diretrizes para contribuição.

## Setup Local

### Pré-requisitos

- Python 3.11+
- Node.js 18+ (para frontend)
- Docker (opcional, para desenvolvimento com containers)
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/ClaudioRibeiro2023/banco-dados-techdengue.git
cd banco-dados-techdengue
```

### 2. Configurar ambiente Python

```bash
# Criar virtualenv
python -m venv .venv

# Ativar (Windows)
.venv\Scripts\activate

# Ativar (Linux/Mac)
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Instalar pre-commit hooks
pip install pre-commit
pre-commit install
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais (opcional para desenvolvimento)
```

### 4. Executar a API

```bash
# Usando Makefile
make dev

# Ou diretamente
uvicorn src.api.app:app --reload --port 8000
```

A API estará disponível em http://localhost:8000

### 5. Executar testes

```bash
# Todos os testes
make test

# Com cobertura
make test-cov

# Apenas testes de serviços
pytest tests/services/ -v
```

## Estrutura do Projeto

```
banco-dados-techdengue/
├── src/
│   ├── api/           # FastAPI application
│   │   ├── routers/   # Endpoints organizados por domínio
│   │   ├── app.py     # Aplicação principal
│   │   └── schemas.py # Modelos Pydantic
│   ├── core/          # Rate limiting, cache, auth
│   ├── services/      # Lógica de negócio
│   └── config.py      # Configurações
├── tests/
│   ├── api/           # Testes de integração
│   └── services/      # Testes unitários
├── frontend/          # React + Vite + TypeScript
├── scripts/           # Scripts utilitários
└── docs/              # Documentação
```

## Padrões de Código

### Python

- **Formatter**: Ruff (`ruff format`)
- **Linter**: Ruff (`ruff check`)
- **Type Hints**: Obrigatórios para funções públicas
- **Docstrings**: Google style

```python
def calcular_risco(temperatura: float, umidade: float) -> float:
    """
    Calcula o índice de risco de dengue.

    Args:
        temperatura: Temperatura em Celsius.
        umidade: Umidade relativa em percentual.

    Returns:
        Score de risco entre 0 e 100.
    """
    ...
```

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `test:` Testes
- `refactor:` Refatoração
- `chore:` Manutenção

Exemplos:
```
feat: adicionar endpoint de análise de risco
fix: corrigir normalização de nomes de cidades
docs: atualizar README com instruções de deploy
test: adicionar testes para WeatherService
```

### Branches

- `main` - Branch de produção (protegida)
- `feat/*` - Novas funcionalidades
- `fix/*` - Correções
- `docs/*` - Documentação

## Processo de Pull Request

1. **Fork** o repositório
2. **Crie uma branch** a partir de `main`
3. **Faça suas alterações** seguindo os padrões
4. **Execute os testes** (`make test`)
5. **Execute o linter** (`make lint`)
6. **Commit** com mensagem clara
7. **Push** para seu fork
8. **Abra um PR** com descrição detalhada

### Checklist do PR

- [ ] Testes passando
- [ ] Linter sem erros
- [ ] Documentação atualizada (se necessário)
- [ ] Changelog atualizado (se necessário)

## Arquitetura

### API (FastAPI)

A API segue o padrão de **routers modulares**:

- `/health` - Health checks e monitoramento
- `/facts` - Dados de atividades TechDengue
- `/dengue` - Dados epidemiológicos
- `/municipios` - Dados de municípios
- `/api/v1/weather/*` - Integração com OpenWeather
- `/api/v1/risk/*` - Análise de risco com IA

### Dados (Medallion Architecture)

- **Bronze**: Dados brutos (Parquet)
- **Silver**: Dados limpos e normalizados
- **Gold**: Dados agregados para análise

### Deploy

- **API**: Railway.app
- **Frontend**: Netlify
- **Banco GIS**: PostgreSQL/PostGIS (AWS RDS)

## Reportando Bugs

Use o [GitHub Issues](https://github.com/ClaudioRibeiro2023/banco-dados-techdengue/issues) com:

1. Descrição clara do problema
2. Passos para reproduzir
3. Comportamento esperado vs atual
4. Ambiente (OS, Python version, etc.)
5. Logs relevantes

## Sugestões de Features

Abra uma issue com a tag `enhancement` descrevendo:

1. O problema que a feature resolve
2. Proposta de solução
3. Alternativas consideradas

## Contato

- **Autor**: Claudio Ribeiro
- **GitHub**: [@ClaudioRibeiro2023](https://github.com/ClaudioRibeiro2023)

---

Obrigado por contribuir! 🦟
