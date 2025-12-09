# TechDengue SDK Python

SDK oficial para integração com a API TechDengue - Dados epidemiológicos de dengue de Minas Gerais.

## Instalação

```bash
pip install techdengue
```

Ou diretamente do repositório:

```bash
pip install git+https://github.com/techdengue/techdengue-sdk-python.git
```

## Quick Start

```python
from techdengue import TechDengueClient

# Inicializar cliente
client = TechDengueClient(
    base_url="http://localhost:4010",  # ou URL de produção
    api_key="sua_api_key"  # opcional para endpoints públicos
)

# Obter clima de uma cidade
weather = client.get_weather("Belo Horizonte")
print(f"Temperatura: {weather.temperatura}°C")
print(f"Umidade: {weather.umidade}%")
print(f"Índice de favorabilidade dengue: {weather.indice_favorabilidade_dengue}")

# Análise de risco com IA
risk = client.analyze_risk(
    municipio="Uberlândia",
    casos_recentes=150,
    casos_ano_anterior=80,
    temperatura_media=28.5,
    umidade_media=75,
    populacao=700000
)
print(f"Nível de risco: {risk.nivel_risco}")
print(f"Tendência: {risk.tendencia}")
print(f"Recomendações: {risk.recomendacoes}")

# Dashboard de risco regional
dashboard = client.get_risk_dashboard()
print(f"Cidades em risco crítico: {dashboard['resumo']['critico']}")
```

## Cliente Assíncrono

```python
import asyncio
from techdengue.client import AsyncTechDengueClient

async def main():
    async with AsyncTechDengueClient(api_key="...") as client:
        weather = await client.get_weather("Belo Horizonte")
        risk = await client.analyze_risk(municipio="BH", casos_recentes=100)
        print(f"Risco: {risk.nivel_risco}")

asyncio.run(main())
```

## Endpoints Disponíveis

### Clima
- `get_weather(cidade)` - Clima atual de uma cidade
- `get_weather_all()` - Clima de todas as principais cidades de MG
- `get_weather_risk(cidade)` - Análise de risco climático

### Análise de Risco
- `analyze_risk(**kwargs)` - Análise completa com IA
- `get_municipio_risk(codigo_ibge)` - Risco de um município específico
- `get_risk_dashboard()` - Dashboard consolidado regional

### Dados
- `get_facts(limit, offset, municipio)` - Atividades TechDengue
- `get_dengue_cases(limit, offset, ano, municipio)` - Casos de dengue
- `get_municipalities(limit, offset, search)` - Municípios de MG

### Admin (requer API Key)
- `get_cache_stats()` - Estatísticas do cache
- `clear_cache(pattern)` - Limpar cache
- `get_audit_stats()` - Estatísticas de uso

## Variáveis de Ambiente

```bash
export TECHDENGUE_API_URL="http://localhost:4010"
export TECHDENGUE_API_KEY="sua_api_key"
```

## Tratamento de Erros

```python
from techdengue import TechDengueClient
from techdengue.client import TechDengueError

client = TechDengueClient()

try:
    weather = client.get_weather("CidadeInexistente")
except TechDengueError as e:
    print(f"Erro: {e.error.error}")
    print(f"Mensagem: {e.error.message}")
    print(f"Status: {e.error.status_code}")
```

## Licença

MIT License
