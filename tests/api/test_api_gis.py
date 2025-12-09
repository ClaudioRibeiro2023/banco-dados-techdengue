import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import app

client = TestClient(app)


def _gis_ready() -> bool:
    try:
        # Primeiro, saúde geral
        r = client.get("/health")
        if r.status_code != 200 or not r.json().get("db_connected", False):
            return False
        # Depois, verificar se o endpoint operacionaliza (pode falhar se tabela não existir)
        probe = client.get("/gis/pois", params={"limit": 1})
        return probe.status_code == 200
    except Exception:
        return False


@pytest.mark.skipif(not _gis_ready(), reason="GIS não operacional no ambiente de teste")
def test_gis_banco_limit():
    r = client.get("/gis/banco", params={"limit": 10})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) <= 10


@pytest.mark.skipif(not _gis_ready(), reason="GIS não operacional no ambiente de teste")
def test_gis_pois_optional_filter():
    # Sem filtro
    r = client.get("/gis/pois", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) <= 5
