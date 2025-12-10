# TechDengue API - Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Dependências básicas; curl para healthcheck no compose
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependências
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Código-fonte
COPY src ./src
COPY README.md ./

# Diretório de dados (parquet) será montado por volume
RUN mkdir -p /app/dados_integrados

# Usuário não-root
RUN useradd -m -u 10001 -s /usr/sbin/nologin appuser && \
    chown -R appuser:appuser /app
USER appuser

# Variáveis de ambiente padrão
ENV PORT=8000 \
    LOG_LEVEL=INFO \
    CACHE_TTL_SECONDS=3600

EXPOSE 8000

# Railway usa startCommand do railway.json
# Fallback para execução local
CMD ["sh", "-c", "uvicorn src.api.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
