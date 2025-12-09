from __future__ import annotations
from pathlib import Path
from typing import Dict, Tuple, Optional, Union
import time
import os
import pandas as pd
import io
import httpx
from loguru import logger

from src.config import Config


class ParquetCache:
    _cache: Dict[str, Tuple[float, pd.DataFrame]] = {}

    @classmethod
    def get_parquet(cls, resource: Union[Path, str]) -> pd.DataFrame:
        ttl = int(getattr(Config, "CACHE_TTL_SECONDS", 0) or 0)
        now = time.time()

        key = str(resource)
        entry = cls._cache.get(key)

        # Helper to return cached value if valid by TTL (and mtime when available)
        def _try_cached(version: Optional[float] = None) -> Optional[pd.DataFrame]:
            if not entry:
                return None
            exp, df_cached = entry
            if (ttl <= 0 or now < exp) and df_cached is not None:
                # If version provided (local file), ensure same mtime
                if version is None or cls._is_same_file(key, version):
                    return df_cached.copy()
            return None

        # Local file path handling
        is_http = isinstance(resource, str) and (resource.startswith("http://") or resource.startswith("https://"))
        is_s3 = isinstance(resource, str) and resource.startswith("s3://")

        if not is_http and not is_s3:
            path = resource if isinstance(resource, Path) else Path(str(resource))
            if not path.exists():
                raise FileNotFoundError(f"Parquet não encontrado: {path}")

            mtime = os.path.getmtime(path)
            cached = _try_cached(version=mtime)
            if cached is not None:
                return cached

            df = pd.read_parquet(path)
            exp_at = now + ttl if ttl > 0 else now + 10**12
            cls._cache[key] = (exp_at, df)
            cls._set_mtime(key, mtime)
            logger.debug(f"Cache atualizado (local) para {path}")
            return df.copy()

        # Remote over HTTP/HTTPS
        if is_http:
            cached = _try_cached(version=None)
            if cached is not None:
                return cached
            resp = httpx.get(str(resource), timeout=30.0)
            resp.raise_for_status()
            b = io.BytesIO(resp.content)
            df = pd.read_parquet(b)
            exp_at = now + ttl if ttl > 0 else now + 10**12
            cls._cache[key] = (exp_at, df)
            logger.debug(f"Cache atualizado (http) para {resource}")
            return df.copy()

        # Remote over S3 (requires s3fs)
        if is_s3:
            cached = _try_cached(version=None)
            if cached is not None:
                return cached
            try:
                df = pd.read_parquet(str(resource))
            except Exception as e:
                raise RuntimeError(f"Falha ao ler parquet S3 '{resource}': {e}")
            exp_at = now + ttl if ttl > 0 else now + 10**12
            cls._cache[key] = (exp_at, df)
            logger.debug(f"Cache atualizado (s3) para {resource}")
            return df.copy()

    _mtimes: Dict[str, float] = {}

    @classmethod
    def _is_same_file(cls, key: str, mtime: float) -> bool:
        prev = cls._mtimes.get(key)
        return prev == mtime

    @classmethod
    def _set_mtime(cls, key: str, mtime: float) -> None:
        cls._mtimes[key] = mtime
