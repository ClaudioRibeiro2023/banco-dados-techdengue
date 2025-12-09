"""
Plotly Theme Utilities for TechDengue
Aplica tema global consistente com tokens do Design System
"""
from typing import Dict, Any
import plotly.io as pio

DEFAULT_COLORS = [
    "#3b82f6",  # primary-500
    "#22c55e",  # success-500
    "#f59e0b",  # warning-500
    "#ef4444",  # error-500
    "#6b7280",  # gray-500
    "#1e40af",  # primary-800
]

def get_template() -> Dict[str, Any]:
    return {
        "layout": {
            "font": {"family": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial", "size": 14, "color": "#111827"},
            "paper_bgcolor": "rgba(0,0,0,0)",
            "plot_bgcolor": "rgba(0,0,0,0)",
            "xaxis": {
                "gridcolor": "rgba(17,24,39,0.08)",
                "zerolinecolor": "rgba(17,24,39,0.12)",
                "linecolor": "rgba(17,24,39,0.2)",
                "ticks": "outside",
            },
            "yaxis": {
                "gridcolor": "rgba(17,24,39,0.08)",
                "zerolinecolor": "rgba(17,24,39,0.12)",
                "linecolor": "rgba(17,24,39,0.2)",
                "ticks": "outside",
            },
            "legend": {"orientation": "h", "yanchor": "bottom", "y": 1.02, "xanchor": "left", "x": 0},
            "hovermode": "x unified",
            "colorway": DEFAULT_COLORS,
            "margin": {"l": 50, "r": 20, "t": 40, "b": 50},
        }
    }


def apply_theme() -> None:
    """Aplica o template global como 'techdengue' e define como default."""
    template = get_template()
    pio.templates["techdengue"] = template
    pio.templates.default = "techdengue"
