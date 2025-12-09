from __future__ import annotations
from pathlib import Path
from typing import Dict, Tuple
import os
import pandas as pd
from loguru import logger

from src.config import Config
from src.core.cache_manager import ParquetCache

def read_parquet_cached(filename: str) -> pd.DataFrame:
    """
    Reads a Parquet from dados_integrados with a simple mtime-based cache.
    Normalizes column names to lowercase for internal consistency.
    """
    base_path = Config.PATHS.output_dir
    resource = None
    # HTTP(s) base
    if getattr(Config, "DATASETS_REMOTE_URL", ""):
        base = str(Config.DATASETS_REMOTE_URL).rstrip("/")
        resource = f"{base}/{filename}"
    # S3 base
    elif getattr(Config, "DATASETS_S3_URI", ""):
        base = str(Config.DATASETS_S3_URI).rstrip("/")
        resource = f"{base}/{filename}"
    else:
        resource = base_path / filename

    df = ParquetCache.get_parquet(resource)
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df
