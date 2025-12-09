import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import app

client = TestClient(app)


def test_facts_export_csv_with_fields():
    r = client.get("/facts", params={"format": "csv", "limit": 3, "fields": "codigo_ibge,municipio"})
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    text = r.text
    header_line = text.splitlines()[0] if text else ""
    assert header_line.strip() in ("codigo_ibge,municipio", "municipio,codigo_ibge")


def test_dengue_export_parquet_bytes():
    r = client.get("/dengue", params={"format": "parquet", "limit": 2})
    assert r.status_code == 200
    assert "application/x-parquet" in r.headers.get("content-type", "")
    assert len(r.content) > 0


def test_municipios_json_fields_single_column():
    r = client.get("/municipios", params={"fields": "municipio", "limit": 1})
    assert r.status_code == 200
    data = r.json()
    if data.get("total", 0) == 0 or len(data.get("items", [])) == 0:
        pytest.skip("Sem municipios para validar campos")
    item = data["items"][0]
    assert set(item.keys()) == {"municipio"}
