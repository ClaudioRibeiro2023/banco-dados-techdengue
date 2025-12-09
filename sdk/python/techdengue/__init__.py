"""
TechDengue SDK Python
Cliente oficial para a API TechDengue.
"""

from techdengue.client import TechDengueClient
from techdengue.models import (
    WeatherData,
    RiskAnalysis,
    DengueCase,
    Municipality,
    Activity,
)

__version__ = "1.0.0"
__all__ = [
    "TechDengueClient",
    "WeatherData",
    "RiskAnalysis",
    "DengueCase",
    "Municipality",
    "Activity",
]
