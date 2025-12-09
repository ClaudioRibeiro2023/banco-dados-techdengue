# TechDengue API

Este site documenta a API TechDengue e como consumi-la em produção.

- Endpoints principais: `/facts`, `/facts/summary`, `/gold/analise`, `/dengue`, `/municipios`, `/datasets`, `/gis/*`.
- Recursos: exportação (`format=json|csv|parquet`), seleção de colunas (`fields`), paginação e ordenação.
- Dicionário de dados: consulte Guias > Dicionário de Dados.

## Como acessar a documentação interativa

A UI Swagger da API fica em `/docs` (se a API estiver ativa). Exemplo:

```
https://sua-api.exemplo.com/docs
```

## Exemplos rápidos

- CSV de atividades: `/facts?format=csv&fields=codigo_ibge,municipio,pois&limit=100`
- Parquet de gold: `/gold/analise?format=parquet&fields=codigo_ibge,municipio,total_pois&limit=100`
- Autocomplete de municípios: `/municipios?q=bel&limit=20`

## Contato

Para dúvidas e melhorias, abra uma issue no repositório.
