import pandas as pd
import psycopg2
from typing import Optional, Sequence, Any

from dashboard.config.settings import settings


def get_connection() -> Optional[psycopg2.extensions.connection]:
    if not settings.USE_DB:
        return None
    if not all([settings.DB_HOST, settings.DB_NAME, settings.DB_USER, settings.DB_PASSWORD]):
        return None
    return psycopg2.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        sslmode=settings.DB_SSLMODE,
    )


def read_sql(sql: str, params: Optional[Sequence[Any]] = None) -> pd.DataFrame:
    conn = get_connection()
    if conn is None:
        return pd.DataFrame()
    try:
        df = pd.read_sql_query(sql, conn, params=params)
        return df
    finally:
        conn.close()


def table_exists(table_name: str) -> bool:
    """Verifica existência de tabela (qualquer schema)."""
    conn = get_connection()
    if conn is None:
        return False
    try:
        q = """
            SELECT 1
            FROM information_schema.tables 
            WHERE LOWER(table_name) = LOWER(%s)
            LIMIT 1
        """
        df = pd.read_sql_query(q, conn, params=[table_name])
        return not df.empty
    finally:
        conn.close()


def list_columns(table_name: str) -> pd.DataFrame:
    """Lista colunas e tipos de uma tabela (qualquer schema)."""
    conn = get_connection()
    if conn is None:
        return pd.DataFrame(columns=["column_name", "data_type"])  # vazio
    try:
        q = """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE LOWER(table_name) = LOWER(%s)
            ORDER BY ordinal_position
        """
        return pd.read_sql_query(q, conn, params=[table_name])
    finally:
        conn.close()
