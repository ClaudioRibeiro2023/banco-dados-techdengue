"""
Layout helpers for TechDengue Dashboard
Built on top of tokens.css and components.css
"""
from typing import Optional


def page_container(content: str) -> str:
    return f'<div class="container">{content}</div>'


def page_section(title: str, subtitle: str = "", icon: str = "📊", color: str = "primary") -> str:
    return f"""
    <div class="section-header {color}" role="region" aria-label="{title}">
      <div style="display:flex;align-items:center;gap:1rem;">
        <span style="font-size:2rem;">{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
    """


def section(content: str) -> str:
    return f'<div class="section">{content}</div>'


def spacer(height: str = "1rem") -> str:
    return f'<div style="height:{height};"></div>'
