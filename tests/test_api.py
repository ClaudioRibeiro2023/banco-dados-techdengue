from __future__ import annotations
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from src.api.app import app
from src.materialize import materialize_gold_analise
from src.config import Config


client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("ok"), bool)


def test_facts_list_basic():
    facts_path = Config.PATHS.output_dir / "fato_atividades_techdengue.parquet"
    if not facts_path.exists():
        pytest.skip("facts parquet not present; skip")
    r = client.get("/facts", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert data["limit"] == 5
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) <= 5


def test_gold_analise_endpoint():
    # Ensure GOLD is materialized
    gold = materialize_gold_analise()
    assert gold.get("ok") is True
    r = client.get("/gold/analise", params={"limit": 3})
    assert r.status_code == 200
    data = r.json()
    assert data["limit"] == 3
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) <= 3
