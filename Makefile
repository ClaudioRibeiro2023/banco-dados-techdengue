# Makefile para TechDengue
# Uso: make <target>

.PHONY: help dev test lint format build docker-build docker-up docker-down clean install

# Cores para output
CYAN := \033[36m
GREEN := \033[32m
RESET := \033[0m

help: ## Mostra esta ajuda
	@echo "$(CYAN)TechDengue - Comandos disponíveis:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'

# ==================== Desenvolvimento ====================

install: ## Instala dependências
	pip install -r requirements.txt
	pip install pre-commit pytest pytest-cov pytest-asyncio
	pre-commit install

dev: ## Inicia servidor de desenvolvimento
	uvicorn src.api.app:app --reload --port 8000

dev-frontend: ## Inicia frontend em desenvolvimento
	cd frontend && npm run dev

# ==================== Testes ====================

test: ## Roda todos os testes
	pytest tests/ -v

test-cov: ## Roda testes com cobertura
	pytest tests/ -v --cov=src --cov-report=html --cov-report=term

test-api: ## Roda apenas testes de API
	pytest tests/api/ -v

test-watch: ## Roda testes em modo watch
	pytest tests/ -v --tb=short -x

# ==================== Qualidade de Código ====================

lint: ## Verifica código com ruff
	ruff check src/ tests/ scripts/

format: ## Formata código com ruff
	ruff format src/ tests/ scripts/
	ruff check --fix src/ tests/ scripts/

lint-fix: ## Corrige problemas automaticamente
	ruff check --fix src/ tests/ scripts/
	ruff format src/ tests/ scripts/

# ==================== Docker ====================

docker-build: ## Builda imagem Docker
	docker build -t techdengue-api:latest .

docker-up: ## Sobe todos os containers
	docker-compose up -d

docker-down: ## Para todos os containers
	docker-compose down

docker-logs: ## Mostra logs dos containers
	docker-compose logs -f

# ==================== Utilitários ====================

clean: ## Limpa arquivos temporários
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

validate: ## Valida API em produção
	python scripts/validate_api_routes.py https://banco-dados-techdengue-production.up.railway.app

health: ## Verifica saúde da API
	curl -s https://banco-dados-techdengue-production.up.railway.app/health | python -m json.tool
