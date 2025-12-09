from __future__ import annotations
import re
from typing import List, Dict, Any, Optional, Literal
import pandas as pd
from pydantic import BaseModel, Field
from loguru import logger
from .config import Config


class ValidationIssue(BaseModel):
    level: Literal["INFO", "WARN", "ERROR"]
    message: str
    count: Optional[int] = None


class ValidationReport(BaseModel):
    ok: bool
    rows: int = 0
    columns: int = 0
    issues: List[ValidationIssue] = Field(default_factory=list)
    summary: Dict[str, Any] = Field(default_factory=dict)


REQUIRED_COLUMNS = [
    "CODIGO_IBGE",
    "MUNICIPIO",
    "DATA_MAP",
    "NOMENCLATURA_ATIVIDADE",
]

NUMERIC_COLUMNS = [
    "POIS",
    "devolutivas",
    "removido_solucionado",
    "descaracterizado",
    "Tratado",
    "morador_ausente",
    "nao_Autorizado",
    "tratamento_via_drones",
    "monitorado",
    "HECTARES_MAPEADOS",
]

OPTIONAL_COLUMNS = [
    "CONTRATANTE",
    "LINK_GIS",
    "SUB_ATIVIDADE",
]

IBGE_PATTERN = re.compile(r"^31\d{5}$")


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    cols = {c: c.strip() for c in df.columns}
    df = df.rename(columns=cols)
    if "CODIGO IBGE" in df.columns and "CODIGO_IBGE" not in df.columns:
        df = df.rename(columns={"CODIGO IBGE": "CODIGO_IBGE"})
    # Normalizar variações de município
    if "Municipio" in df.columns and "MUNICIPIO" not in df.columns:
        df = df.rename(columns={"Municipio": "MUNICIPIO"})
    if "Município" in df.columns and "MUNICIPIO" not in df.columns:
        df = df.rename(columns={"Município": "MUNICIPIO"})
    return df


def validate_mega_planilha(path: Optional[str] = None, sheet: str = "Atividades (com sub)") -> ValidationReport:
    path = path or str(Config.PATHS.data_dir / "dados_techdengue" / "Atividades Techdengue.xlsx")
    issues: List[ValidationIssue] = []

    try:
        df = pd.read_excel(path, sheet_name=sheet)
    except Exception as e:
        return ValidationReport(ok=False, issues=[ValidationIssue(level="ERROR", message=f"Falha ao ler arquivo: {e}")])

    df = _normalize_columns(df)

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        issues.append(ValidationIssue(level="ERROR", message=f"Colunas obrigatórias ausentes: {missing}"))

    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "DATA_MAP" in df.columns:
        df["DATA_MAP"] = pd.to_datetime(df["DATA_MAP"], errors="coerce").dt.date

    if "CODIGO_IBGE" in df.columns:
        df["CODIGO_IBGE"] = df["CODIGO_IBGE"].astype(str).str.strip()
        invalid_ibge = (~df["CODIGO_IBGE"].fillna("").str.match(IBGE_PATTERN)).sum()
        if invalid_ibge > 0:
            issues.append(ValidationIssue(level="WARN", message="Códigos IBGE fora do padrão 31xxxxx", count=int(invalid_ibge)))

    key_cols = [c for c in ["CODIGO_IBGE", "DATA_MAP", "NOMENCLATURA_ATIVIDADE"] if c in df.columns]
    if len(key_cols) == 3:
        dup = df.duplicated(subset=key_cols).sum()
        if dup > 0:
            issues.append(ValidationIssue(level="WARN", message=f"Registros duplicados pela chave {key_cols}", count=int(dup)))

    hectares_total = float(df["HECTARES_MAPEADOS"].sum()) if "HECTARES_MAPEADOS" in df.columns else 0.0
    pois_total = int(df["POIS"].sum()) if "POIS" in df.columns else 0

    summary = {
        "hectares_total": hectares_total,
        "pois_total": pois_total,
        "path": path,
        "sheet": sheet,
        "row_count": int(len(df)),
        "columns": df.columns.tolist(),
    }

    has_errors = any(i.level == "ERROR" for i in issues)
    ok = not has_errors

    logger.info(f"Mega planilha validada: ok={ok}, rows={len(df)}, hectares_total={hectares_total:.2f}, pois_total={pois_total}")

    return ValidationReport(
        ok=ok,
        rows=int(len(df)),
        columns=int(len(df.columns)),
        issues=issues,
        summary=summary,
    )
