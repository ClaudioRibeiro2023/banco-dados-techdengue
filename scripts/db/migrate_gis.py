import argparse
import os
import sys
import getpass
from pathlib import Path
from datetime import datetime

import psycopg2


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name, default) or "").strip()


def _read_sql(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _ensure_migrations_table(conn) -> None:
    sql = """
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """
    with conn.cursor() as cur:
        cur.execute(sql)


def _is_applied(conn, version: str) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM public.schema_migrations WHERE version = %s", (version,))
        return cur.fetchone() is not None


def _mark_applied(conn, version: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO public.schema_migrations(version, applied_at) VALUES (%s, %s)",
            (version, datetime.utcnow()),
        )


def _apply_sql(conn, sql_text: str) -> None:
    with conn.cursor() as cur:
        cur.execute(sql_text)


def main() -> int:
    parser = argparse.ArgumentParser(add_help=True)
    parser.add_argument("--host", default=_env("GIS_DB_HOST", "localhost"))
    parser.add_argument("--port", type=int, default=int(_env("GIS_DB_PORT", "5432")))
    parser.add_argument("--db", default=_env("GIS_DB_NAME", "postgres"))
    parser.add_argument("--user", default=_env("GIS_DB_USERNAME", "postgres"))
    parser.add_argument("--password", default=_env("GIS_DB_PASSWORD", ""))
    parser.add_argument("--sslmode", default=_env("GIS_DB_SSL_MODE", "require"))
    args = parser.parse_args()

    password = args.password
    if not password:
        password = getpass.getpass("Senha do banco GIS (GIS_DB_PASSWORD): ")

    root = Path(__file__).resolve().parents[2]
    sql_dir = root / "scripts" / "sql"

    migrations = [
        ("001_init_gis", sql_dir / "init_gis.sql"),
        ("002_gis_schema", sql_dir / "gis_schema.sql"),
    ]

    try:
        conn = psycopg2.connect(
            host=args.host,
            port=args.port,
            database=args.db,
            user=args.user,
            password=password,
            sslmode=args.sslmode,
        )
        conn.autocommit = False
    except Exception as e:
        sys.stderr.write(f"Falha ao conectar no GIS DB: {e}\n")
        return 1

    try:
        _ensure_migrations_table(conn)
        conn.commit()

        for version, path in migrations:
            if not path.exists():
                raise FileNotFoundError(f"Arquivo SQL não encontrado: {path}")

            if _is_applied(conn, version):
                continue

            sql_text = _read_sql(path)
            if "<SENHA_FORTE>" in sql_text:
                raise ValueError(
                    f"{path.name} contém placeholder <SENHA_FORTE>. Substitua por uma senha robusta antes de aplicar."
                )

            _apply_sql(conn, sql_text)
            _mark_applied(conn, version)
            conn.commit()

        return 0
    except Exception as e:
        conn.rollback()
        sys.stderr.write(f"Falha ao aplicar migrações GIS: {e}\n")
        return 2
    finally:
        try:
            conn.close()
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
