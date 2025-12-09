import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import app

client = TestClient(app)


def test_datasets_catalog():
    r = client.get("/datasets")
    assert r.status_code == 200
    data = r.json()
    assert "datasets" in data
    ds = data["datasets"]
    assert isinstance(ds, dict)
    assert "fato_atividades_techdengue.parquet" in ds
    assert "fato_dengue_historico.parquet" in ds
    assert "dim_municipios.parquet" in ds
    assert "analise_integrada.parquet" in ds


def test_dengue_basic():
    r = client.get("/dengue", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert "total" in data and "items" in data
    assert isinstance(data.get("items"), list)
    assert len(data.get("items", [])) <= 5


def test_municipios_search_and_pagination():
    r = client.get("/municipios", params={"q": "a", "limit": 10})
    assert r.status_code == 200
    data = r.json()
    assert "total" in data and "items" in data
    assert len(data.get("items", [])) <= 10


def test_facts_sorting_pois():
    r = client.get("/facts", params={"limit": 50, "sort_by": "pois", "order": "desc"})
    assert r.status_code == 200
    items = r.json().get("items", [])
    values = [it.get("pois") for it in items if it.get("pois") is not None]
    if len(values) >= 2:
        assert all(values[i] >= values[i+1] for i in range(len(values)-1))


def test_gold_analise_sorting_total_pois():
    r = client.get("/gold/analise", params={"limit": 50, "sort_by": "total_pois", "order": "asc"})
    assert r.status_code == 200
    items = r.json().get("items", [])
    values = [it.get("total_pois") for it in items if it.get("total_pois") is not None]
    if len(values) >= 2:
        assert all(values[i] <= values[i+1] for i in range(len(values)-1))
