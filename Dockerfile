# TechDengue API - Dockerfile Otimizado
# Multi-stage build para imagem menor e builds mais rápidos

# ==================== Stage 1: Builder ====================
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Dependências de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependências em virtualenv
COPY requirements.txt ./
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# ==================== Stage 2: Runtime ====================
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Dependências mínimas de runtime (apenas curl para healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copiar virtualenv do builder
COPY --from=builder /opt/venv /opt/venv

# Código-fonte
COPY src ./src
COPY run.py ./
COPY README.md ./

# Diretório de dados (parquet) - copiar arquivos locais
RUN mkdir -p /app/dados_integrados
COPY dados_integrados/*.parquet /app/dados_integrados/

# Usuário não-root para segurança
RUN useradd -m -u 10001 -s /usr/sbin/nologin appuser && \
    chown -R appuser:appuser /app
USER appuser

# Variáveis de ambiente padrão
ENV LOG_LEVEL=INFO \
    CACHE_TTL_SECONDS=3600

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Railway usa startCommand do railway.json
# Fallback para execução local
CMD ["uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
