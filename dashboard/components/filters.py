"""
Filter components using Streamlit widgets with standardized layout
"""
from typing import Tuple, List
import streamlit as st
import pandas as pd


def filter_bar_mega(df: pd.DataFrame) -> Tuple[object, str, str, int]:
    """
    Renders a standardized filter bar for the Mega Tabela explorer.

    Returns: (ano_selecionado | 'Todos', urs_selecionada | 'Todas', filtro_atividades, registros_por_pagina)
    """
    st.markdown(
        """
        <div class="section" style="padding: 1rem; margin-bottom: 1rem;">
          <div class="badge primary">Filtro</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        anos_com_dados = df[df['total_atividades'] > 0]['ano'].unique() if 'total_atividades' in df.columns else []
        anos_disponiveis_raw = sorted(df['ano'].unique().tolist()) if 'ano' in df.columns else []
        anos_labels: List[str] = ['Todos']
        anos_valores: List[object] = ['Todos']
        for ano in anos_disponiveis_raw:
            if ano in anos_com_dados:
                municipios_com_ativ = len(df[(df['ano'] == ano) & (df['total_atividades'] > 0)]) if 'total_atividades' in df.columns else 0
                anos_labels.append(f"{ano} ✅ ({municipios_com_ativ} registros com atividade)")
            else:
                anos_labels.append(f"{ano} ⚠️ (sem atividades)")
            anos_valores.append(ano)
        ano_index = st.selectbox("📅 Ano", range(len(anos_labels)), format_func=lambda x: anos_labels[x])
        ano_selecionado = anos_valores[ano_index]

    with col2:
        if 'urs' in df.columns:
            urs_disponiveis = ['Todas'] + sorted(df['urs'].dropna().unique().tolist())
            urs_selecionada = st.selectbox("🏥 URS", urs_disponiveis)
        else:
            urs_selecionada = 'Todas'

    with col3:
        filtro_atividades = st.selectbox(
            "🎯 Atividades",
            ['Todos', 'Com Atividades', 'Sem Atividades']
        )

    with col4:
        registros_por_pagina = st.selectbox(
            "📄 Registros/Página",
            [10, 25, 50, 100, 500],
            index=2
        )

    return ano_selecionado, urs_selecionada, filtro_atividades, registros_por_pagina
