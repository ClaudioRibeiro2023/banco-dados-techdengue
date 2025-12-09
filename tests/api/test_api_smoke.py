import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

# Garantir import do pacote src a partir da raiz do projeto
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import app

client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("ok"), bool)
    assert isinstance(data.get("version"), str)
    assert isinstance(data.get("datasets"), dict)
    assert "db_connected" in data


def test_facts_basic_pagination():
    r = client.get("/facts", params={"limit": 5, "offset": 0})
    assert r.status_code == 200
    data = r.json()
    assert "total" in data and "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) <= 5


def test_facts_filters_roundtrip():
    # Obter um registro para usar como filtro
    r = client.get("/facts", params={"limit": 1})
    assert r.status_code == 200
    data = r.json()
    if data.get("total", 0) == 0 or len(data.get("items", [])) == 0:
        pytest.skip("Nenhum fato disponível no Parquet para validar filtro")
    rec = data["items"][0]
    codigo_ibge = rec.get("codigo_ibge")

    r2 = client.get("/facts", params={"codigo_ibge": codigo_ibge, "limit": 100})
    assert r2.status_code == 200
    data2 = r2.json()
    for it in data2.get("items", []):
        assert str(it.get("codigo_ibge")) == str(codigo_ibge)


def test_facts_summary_no_group():
    r = client.get("/facts/summary")
    assert r.status_code == 200
    data = r.json()
    assert "generated_at" in data
    assert isinstance(data.get("summary"), list)


def test_facts_summary_invalid_group_by():
    r = client.get("/facts/summary", params={"group_by": "invalid"})
    assert r.status_code == 422


def test_gold_analise_basic():
    r = client.get("/gold/analise", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert "total" in data and "items" in data
    assert isinstance(data.get("items"), list)
    assert len(data.get("items", [])) <= 5


def test_facts_limit_upper_bound():
    # Request a very large limit and ensure API caps it at <= 1000
    r = client.get("/facts", params={"limit": 50000})
    assert r.status_code == 200
    data = r.json()
    assert len(data.get("items", [])) <= 1000
