"""
Validador de Qualidade de Dados - TechDengue
Garante aderência das informações à realidade do projeto.
"""
from datetime import date, datetime
from typing import Any
from pydantic import BaseModel, field_validator, ValidationError
from loguru import logger


# ============================================================
# CONSTANTES DO PROJETO
# ============================================================

# Data de início do projeto TechDengue
PROJECT_START_DATE = date(2023, 1, 1)

# Anos válidos para atividades
VALID_YEARS = [2023, 2024, 2025, 2026]  # Atualizar conforme projeto avança

# Consórcios/Contratantes válidos
VALID_CONTRATANTES = [
    "CISARP",
    "ICISMEP", 
    "CISAJE",
    "CISMEP",
    "CISNOP",
    # Adicionar outros conforme necessário
]


# ============================================================
# MODELOS DE VALIDAÇÃO (Pydantic)
# ============================================================

class AtividadeValidator(BaseModel):
    """Validador para registros de atividades."""
    
    codigo_ibge: str
    data_map: date | str
    nomenclatura_atividade: str
    pois: int
    hectares_mapeados: float
    contratante: str | None = None
    
    @field_validator('data_map', mode='before')
    @classmethod
    def validate_data_map(cls, v: Any) -> date:
        """Valida que a data está dentro do período válido do projeto."""
        if isinstance(v, str):
            try:
                v = datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                try:
                    v = datetime.strptime(v, "%d/%m/%Y").date()
                except ValueError:
                    raise ValueError(f"Formato de data inválido: {v}")
        
        if isinstance(v, datetime):
            v = v.date()
            
        if v < PROJECT_START_DATE:
            raise ValueError(
                f"Data {v} é anterior ao início do projeto ({PROJECT_START_DATE}). "
                f"O projeto TechDengue iniciou em 2023."
            )
        
        return v
    
    @field_validator('pois')
    @classmethod
    def validate_pois(cls, v: int) -> int:
        """Valida que POIs é um número positivo."""
        if v < 0:
            raise ValueError(f"POIs não pode ser negativo: {v}")
        return v
    
    @field_validator('hectares_mapeados')
    @classmethod
    def validate_hectares(cls, v: float) -> float:
        """Valida que hectares é um número positivo."""
        if v < 0:
            raise ValueError(f"Hectares não pode ser negativo: {v}")
        return v
    
    @field_validator('contratante')
    @classmethod
    def validate_contratante(cls, v: str | None) -> str | None:
        """Valida que o contratante é conhecido (warning, não bloqueia)."""
        if v and v.upper() not in [c.upper() for c in VALID_CONTRATANTES]:
            logger.warning(f"Contratante não reconhecido: {v}")
        return v


class DengueHistoricoValidator(BaseModel):
    """Validador para dados históricos de dengue."""
    
    codigo_ibge: str
    ano: int
    casos: int
    
    @field_validator('ano')
    @classmethod
    def validate_ano(cls, v: int) -> int:
        """Valida que o ano está no range válido."""
        if v < 2023:
            raise ValueError(
                f"Ano {v} é anterior ao início do projeto (2023). "
                f"Dados de dengue devem ser de 2023 em diante."
            )
        if v > date.today().year + 1:
            raise ValueError(f"Ano {v} está no futuro distante")
        return v
    
    @field_validator('casos')
    @classmethod
    def validate_casos(cls, v: int) -> int:
        """Valida que casos é um número não negativo."""
        if v < 0:
            raise ValueError(f"Número de casos não pode ser negativo: {v}")
        return v


# ============================================================
# FUNÇÕES DE VALIDAÇÃO
# ============================================================

def validate_atividade(data: dict) -> tuple[bool, list[str]]:
    """
    Valida um registro de atividade.
    
    Returns:
        tuple: (is_valid, list_of_errors)
    """
    errors = []
    try:
        AtividadeValidator(**data)
        return True, []
    except ValidationError as e:
        for error in e.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            msg = error["msg"]
            errors.append(f"{field}: {msg}")
        return False, errors


def validate_dengue_historico(data: dict) -> tuple[bool, list[str]]:
    """
    Valida um registro de histórico de dengue.
    
    Returns:
        tuple: (is_valid, list_of_errors)
    """
    errors = []
    try:
        DengueHistoricoValidator(**data)
        return True, []
    except ValidationError as e:
        for error in e.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            msg = error["msg"]
            errors.append(f"{field}: {msg}")
        return False, errors


def run_quality_checks(df, validator_type: str = "atividade") -> dict:
    """
    Executa validações de qualidade em um DataFrame.
    
    Args:
        df: pandas DataFrame
        validator_type: "atividade" ou "dengue"
    
    Returns:
        dict com estatísticas de validação
    """
    import pandas as pd
    
    validator = validate_atividade if validator_type == "atividade" else validate_dengue_historico
    
    total = len(df)
    valid_count = 0
    invalid_count = 0
    all_errors = []
    
    for idx, row in df.iterrows():
        is_valid, errors = validator(row.to_dict())
        if is_valid:
            valid_count += 1
        else:
            invalid_count += 1
            all_errors.extend([(idx, e) for e in errors])
    
    # Agrupar erros por tipo
    error_summary = {}
    for idx, error in all_errors:
        error_type = error.split(":")[0]
        if error_type not in error_summary:
            error_summary[error_type] = 0
        error_summary[error_type] += 1
    
    return {
        "total_records": total,
        "valid_records": valid_count,
        "invalid_records": invalid_count,
        "validity_rate": round(valid_count / total * 100, 2) if total > 0 else 0,
        "error_summary": error_summary,
        "sample_errors": all_errors[:10],  # Primeiros 10 erros
    }


# ============================================================
# REGRAS DE NEGÓCIO
# ============================================================

BUSINESS_RULES = {
    "project_start": {
        "rule": "Dados devem ser >= 2023-01-01",
        "reason": "Projeto TechDengue iniciou em 2023",
    },
    "valid_years": {
        "rule": f"Anos válidos: {VALID_YEARS}",
        "reason": "Período de operação do projeto",
    },
    "positive_metrics": {
        "rule": "POIs e Hectares devem ser >= 0",
        "reason": "Métricas físicas não podem ser negativas",
    },
    "known_contratantes": {
        "rule": f"Contratantes esperados: {VALID_CONTRATANTES}",
        "reason": "Lista de consórcios parceiros conhecidos",
    },
}


def get_business_rules() -> dict:
    """Retorna as regras de negócio documentadas."""
    return BUSINESS_RULES


if __name__ == "__main__":
    # Teste do validador
    print("=" * 60)
    print("TESTE DO VALIDADOR DE QUALIDADE")
    print("=" * 60)
    
    # Teste válido
    valid_data = {
        "codigo_ibge": "3170206",
        "data_map": "2024-06-15",
        "nomenclatura_atividade": "Mapeamento",
        "pois": 150,
        "hectares_mapeados": 1200.5,
        "contratante": "CISARP",
    }
    is_valid, errors = validate_atividade(valid_data)
    print(f"\nDado válido: {is_valid}, Erros: {errors}")
    
    # Teste inválido (ano antes de 2023)
    invalid_data = {
        "codigo_ibge": "3170206",
        "data_map": "2020-06-15",  # Ano inválido!
        "nomenclatura_atividade": "Mapeamento",
        "pois": 150,
        "hectares_mapeados": 1200.5,
    }
    is_valid, errors = validate_atividade(invalid_data)
    print(f"\nDado inválido (ano 2020): {is_valid}")
    print(f"Erros: {errors}")
    
    print("\n" + "=" * 60)
    print("REGRAS DE NEGÓCIO")
    print("=" * 60)
    for key, rule in BUSINESS_RULES.items():
        print(f"\n{key}:")
        print(f"  Regra: {rule['rule']}")
        print(f"  Razão: {rule['reason']}")
