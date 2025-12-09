"""
Componentes de gráficos
"""
import plotly.graph_objects as go
import plotly.express as px

def create_gauge_chart(value, title="Score", max_value=100):
    """
    Cria gráfico gauge (velocímetro)
    
    Args:
        value: Valor atual
        title: Título do gráfico
        max_value: Valor máximo
        
    Returns:
        Figura Plotly
    """
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=value,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': title, 'font': {'size': 24}},
        delta={'reference': 90},
        gauge={
            'axis': {'range': [None, max_value]},
            'bar': {'color': "#1f77b4"},
            'steps': [
                {'range': [0, 50], 'color': "#ffcccc"},
                {'range': [50, 75], 'color': "#fff3cd"},
                {'range': [75, 90], 'color': "#d4edda"},
                {'range': [90, 100], 'color': "#28a745"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 90
            }
        }
    ))
    
    fig.update_layout(
        height=300,
        margin=dict(l=20, r=20, t=50, b=20)
    )
    
    return fig


def create_timeline_chart(df, x_col, y_col, title="Timeline"):
    """
    Cria gráfico de linha temporal
    
    Args:
        df: DataFrame
        x_col: Coluna do eixo X (tempo)
        y_col: Coluna do eixo Y (valores)
        title: Título do gráfico
        
    Returns:
        Figura Plotly
    """
    fig = px.line(
        df,
        x=x_col,
        y=y_col,
        title=title,
        markers=True
    )
    
    fig.update_layout(
        hovermode='x unified',
        height=400,
        margin=dict(l=20, r=20, t=50, b=20)
    )
    
    fig.update_traces(
        line_color='#1f77b4',
        line_width=3
    )
    
    return fig


def create_bar_chart(df, x_col, y_col, title="Bar Chart", orientation='v'):
    """
    Cria gráfico de barras
    
    Args:
        df: DataFrame
        x_col: Coluna do eixo X
        y_col: Coluna do eixo Y
        title: Título do gráfico
        orientation: 'v' (vertical) ou 'h' (horizontal)
        
    Returns:
        Figura Plotly
    """
    fig = px.bar(
        df,
        x=x_col if orientation == 'v' else y_col,
        y=y_col if orientation == 'v' else x_col,
        title=title,
        orientation=orientation
    )
    
    fig.update_layout(
        height=400,
        margin=dict(l=20, r=20, t=50, b=20)
    )
    
    fig.update_traces(marker_color='#1f77b4')
    
    return fig


def create_heatmap(df, title="Heatmap"):
    """
    Cria heatmap
    
    Args:
        df: DataFrame (matriz)
        title: Título do gráfico
        
    Returns:
        Figura Plotly
    """
    fig = px.imshow(
        df,
        title=title,
        color_continuous_scale='RdYlGn',
        aspect='auto'
    )
    
    fig.update_layout(
        height=400,
        margin=dict(l=20, r=20, t=50, b=20)
    )
    
    return fig
