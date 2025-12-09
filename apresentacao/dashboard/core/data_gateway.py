import pandas as pd
from typing import Optional
from loguru import logger

from dashboard.config.settings import settings
from dashboard.core.db import read_sql, list_columns


def _detect_db_columns() -> dict:
    """Detecta colunas relevantes no banco para montar consultas."""
    cols = list_columns(settings.DB_MAIN_TABLE)
    if cols.empty:
        return {
            'date': settings.DB_DATE_COLUMN,
            'mun_code': settings.DB_MUN_CODE_COLUMN,
            'mun_name': settings.DB_MUN_NAME_COLUMN,
            'contractor': settings.DB_CONTRACTOR_COLUMN,
            'hectares': None,
            'devolutivas': None,
            'territorial_area': settings.DB_TERRITORIAL_AREA_COLUMN if settings.ALLOW_TERRITORIAL_AREA_AS_HECTARES else None,
        }
    names = set(c.lower() for c in cols['column_name'].tolist())
    def find_candidate(cands):
        for c in cands:
            if c.lower() in names:
                return c
        return None
    # Overrides têm prioridade se existirem e estiverem presentes
    hec_override = settings.DB_HECTARES_COLUMN if (settings.DB_HECTARES_COLUMN and settings.DB_HECTARES_COLUMN.lower() in names) else None
    dev_override = settings.DB_DEVOLUTIVAS_COLUMN if (settings.DB_DEVOLUTIVAS_COLUMN and settings.DB_DEVOLUTIVAS_COLUMN.lower() in names) else None
    return {
        'date': settings.DB_DATE_COLUMN if settings.DB_DATE_COLUMN.lower() in names else 'data_criacao',
        'mun_code': settings.DB_MUN_CODE_COLUMN if settings.DB_MUN_CODE_COLUMN.lower() in names else 'cd_mun',
        'mun_name': settings.DB_MUN_NAME_COLUMN if settings.DB_MUN_NAME_COLUMN.lower() in names else 'nm_mun',
        'contractor': settings.DB_CONTRACTOR_COLUMN if settings.DB_CONTRACTOR_COLUMN.lower() in names else 'contratante',
        'hectares': hec_override or find_candidate(settings.DB_HECTARES_CANDIDATES),
        'devolutivas': dev_override or find_candidate(settings.DB_DEVOLUTIVAS_CANDIDATES),
        'territorial_area': settings.DB_TERRITORIAL_AREA_COLUMN if (settings.ALLOW_TERRITORIAL_AREA_AS_HECTARES and settings.DB_TERRITORIAL_AREA_COLUMN.lower() in names) else None,
    }


def _load_cisarp_from_db() -> pd.DataFrame:
    """
    Tenta carregar dados do CISARP diretamente do banco (POIs agregados por município e dia).
    Observações:
    - Coluna equivalente a HECTARES_MAPEADOS não está definida no banco padrão (área_km2 é territorial).
    - Devolutivas também não estão padronizadas no banco. 
    Portanto, se essas colunas forem necessárias para métricas, o caller deve aplicar fallback ao CSV.
    """
    if not settings.USE_DB:
        return pd.DataFrame()

    meta = _detect_db_columns()
    date_col = meta['date']
    mun_code = meta['mun_code']
    mun_name = meta['mun_name']
    contractor_col = meta['contractor']
    hectares_col = meta['hectares']
    devoi_col = meta['devolutivas']
    territorial_area_col = meta['territorial_area']

    select_extra = []
    if hectares_col:
        select_extra.append(f"SUM({hectares_col}) AS \"HECTARES_MAPEADOS\"")
    elif territorial_area_col:
        # Proxy opcional (área do município em km² -> hectares); somar distinta por município/dia não faz sentido; deixamos desligado por padrão
        pass
    if devoi_col:
        # Contar devolutivas preenchidas (texto ou numérico)
        select_extra.append(
            f"SUM(CASE WHEN {devoi_col} IS NOT NULL AND {devoi_col}::text <> '' THEN 1 ELSE 0 END)::BIGINT AS \"DEVOLUTIVAS\""
        )

    select_extra_sql = (",\n            " + ",\n            ".join(select_extra)) if select_extra else ""

    sql = f"""
        SELECT 
            CAST({mun_code} AS VARCHAR)                  AS "CODIGO IBGE",
            {mun_name}                                   AS "Municipio",
            date_trunc('day', {date_col})                AS "DATA_MAP",
            COUNT(*)::BIGINT                              AS "POIS"{select_extra_sql}
        FROM {settings.DB_MAIN_TABLE}
        WHERE {contractor_col} ILIKE '%' || %(contractor)s || '%'
          AND {date_col} >= %(start)s
          AND {date_col} <  %(end)s
        GROUP BY 1,2,3
        ORDER BY 3,2
    """
    try:
        df = read_sql(sql, params={
            'contractor': settings.AERO_CONTRACTOR_FILTER,
            'start': settings.DEFAULT_START_DATE,
            'end': settings.DEFAULT_END_DATE
        })
        if not df.empty:
            # Tipos
            df['DATA_MAP'] = pd.to_datetime(df['DATA_MAP'], errors='coerce')
        return df
    except Exception as e:
        logger.error(f"Erro ao carregar CISARP do banco: {e}")
        return pd.DataFrame()


def _load_cisarp_from_csv() -> pd.DataFrame:
    data_path = settings.DADOS_DIR / "cisarp_dados_validados.csv"
    alt_path = settings.DADOS_DIR / "cisarp_completo.csv"
    try:
        if data_path.exists():
            df = pd.read_csv(data_path)
        elif alt_path.exists():
            df = pd.read_csv(alt_path)
        else:
            return pd.DataFrame()
        if 'DATA_MAP' in df.columns:
            df['DATA_MAP'] = pd.to_datetime(df['DATA_MAP'], errors='coerce')
        return df
    except Exception as e:
        logger.error(f"Erro ao carregar CSV CISARP: {e}")
        return pd.DataFrame()


def load_cisarp_data() -> pd.DataFrame:
    """
    Carrega dados do CISARP priorizando banco. 
    Fallback para CSV quando colunas críticas (HECTARES_MAPEADOS/DEVOLUTIVAS) não estiverem disponíveis.
    """
    # 1) Tentar DB
    df_db = _load_cisarp_from_db()
    # Verificar se DB cobre colunas mínimas operacionais
    has_hectares = 'HECTARES_MAPEADOS' in df_db.columns and df_db['HECTARES_MAPEADOS'].sum() > 0 if not df_db.empty else False
    has_devol = 'DEVOLUTIVAS' in df_db.columns and df_db['DEVOLUTIVAS'].sum() > 0 if not df_db.empty else False

    if not df_db.empty and has_hectares and has_devol:
        logger.info("Usando CISARP do banco (com hectares e devolutivas)")
        return df_db

    # 2) Fallback CSV (mantém métricas completas)
    df_csv = _load_cisarp_from_csv()
    if not df_csv.empty:
        if df_db.empty:
            logger.info("Usando CISARP do CSV (DB indisponível ou incompleto)")
            return df_csv
        else:
            # DB disponível porém sem colunas completas; optar por CSV para consistência de métricas
            logger.warning("DB sem colunas completas (hectares/devolutivas). Mantendo CSV para consistência.")
            return df_csv

    # 3) Último recurso: retornar o que vier do DB
    if not df_db.empty:
        logger.warning("Retornando dados do DB sem hectares/devolutivas (métricas parciais)")
        return df_db

    return pd.DataFrame()


def load_benchmark_from_db() -> pd.DataFrame:
    """
    Carrega benchmark por contratante a partir do banco (contagem de POIs por contratante).
    Retorna colunas: CONTRATANTE, POIS
    """
    if not settings.USE_DB:
        return pd.DataFrame()

    sql = """
        SELECT contratante AS "CONTRATANTE", COUNT(*)::BIGINT AS "POIS"
        FROM banco_techdengue
        WHERE contratante IS NOT NULL
        GROUP BY contratante
        ORDER BY 2 DESC
    """
    try:
        df = read_sql(sql)
        return df
    except Exception as e:
        logger.error(f"Erro ao carregar benchmark do banco: {e}")
        return pd.DataFrame()
