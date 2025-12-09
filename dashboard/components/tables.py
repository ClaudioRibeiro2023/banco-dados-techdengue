"""
Componentes de tabelas
"""
import streamlit as st
import pandas as pd

def render_data_table(df, title=None, height=400, show_download=True):
    """
    Renderiza tabela de dados com opções
    
    Args:
        df: DataFrame
        title: Título da tabela
        height: Altura da tabela
        show_download: Mostrar botão de download
    """
    if title:
        st.markdown(f"### {title}")
    
    # Exibir tabela
    st.dataframe(df, height=height, use_container_width=True)
    
    # Botão de download
    if show_download:
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download CSV",
            data=csv,
            file_name=f"{title.lower().replace(' ', '_')}.csv" if title else "data.csv",
            mime="text/csv"
        )
