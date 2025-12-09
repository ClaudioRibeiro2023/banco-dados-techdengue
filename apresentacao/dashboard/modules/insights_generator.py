"""
Insights Generator - Geração Automática de Insights
Baseado em padrões SIVEPI

Responsável por:
- Geração automática de insights baseados em dados
- Recomendações estratégicas
- Identificação de oportunidades
- Priorização de ações
"""

import pandas as pd
from typing import Dict, List, Optional
from loguru import logger
import streamlit as st

from dashboard.config.settings import settings

class InsightsGenerator:
    """
    Gerador automático de insights e recomendações
    """
    
    def __init__(self):
        logger.info("InsightsGenerator inicializado")
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def generate_insights(
        _self,
        kpis: Dict,
        temporal: Dict,
        ranking: Dict,
        impact: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Gera insights automáticos baseados em múltiplas análises
        
        Args:
            kpis: KPIs de performance
            temporal: Análise temporal
            ranking: Ranking e benchmarking
            impact: Análise de impacto (opcional)
        
        Returns:
            Lista de insights priorizados
        """
        insights = []
        
        # Insight 1: Performance/Ranking
        if ranking.get('cisarp_position'):
            pos = ranking['cisarp_position']
            total = ranking['total_contractors']
            pct = ranking.get('cisarp_percentile', 0)
            
            severity = 'success' if pos <= 5 else 'info' if pos <= 10 else 'warning'
            
            insights.append({
                'category': 'ranking',
                'title': f"🏆 {pos}º Lugar Nacional",
                'description': f"CISARP alcançou {pos}º lugar entre {total} contratantes, posicionando-se no Top {pct:.0f}%",
                'metric': f"{pos}º/{total}",
                'severity': severity,
                'priority': 1 if pos <= 3 else 2,
                'action': None
            })
        
        # Insight 2: Cobertura
        if kpis.get('hectares_total', 0) > 0:
            hectares = kpis['hectares_total']
            municipios = kpis.get('municipios_unicos', 0)
            
            insights.append({
                'category': 'coverage',
                'title': "📊 Cobertura Territorial Abrangente",
                'description': f"{hectares:,.0f} hectares mapeados em {municipios} municípios, demonstrando alcance significativo",
                'metric': f"{hectares:,.0f} ha",
                'severity': 'success' if hectares > 5000 else 'info',
                'priority': 2,
                'action': "Expandir para municípios prioritários vizinhos"
            })
        
        # Insight 3: Densidade
        if kpis.get('densidade', 0) > 0:
            densidade = kpis['densidade']
            
            severity = 'success' if densidade > 1.5 else 'warning' if densidade < 1.0 else 'info'
            
            insights.append({
                'category': 'efficiency',
                'title': f"🔍 Densidade Operacional: {densidade:.2f} POIs/ha",
                'description': _self._interpret_density(densidade),
                'metric': f"{densidade:.2f} POIs/ha",
                'severity': severity,
                'priority': 3,
                'action': "Otimizar cobertura em áreas de baixa densidade" if densidade < 1.0 else None
            })
        
        # Insight 4: Impacto Epidemiológico
        if impact and impact.get('aggregate'):
            agg = impact['aggregate']
            var_media = agg.get('variacao_media', 0)
            reducao = agg.get('municipios_com_reducao', 0)
            
            if var_media < 0:
                insights.append({
                    'category': 'impact',
                    'title': "💊 Impacto Epidemiológico Positivo",
                    'description': f"Redução média de {abs(var_media):.1f}% nos casos de dengue em {reducao} municípios com intervenções",
                    'metric': f"{var_media:.1f}%",
                    'severity': 'success',
                    'priority': 1,
                    'action': "Documentar cases de sucesso para replicação"
                })
        
        # Insight 5: Tendência Temporal
        if temporal.get('trend'):
            trend = temporal['trend']
            dias = temporal.get('dias_operacao', 0)
            
            trend_map = {
                'crescente': ('📈 Operação em Crescimento', 'success', None),
                'estável': ('➡️ Operação Estável', 'info', 'Avaliar oportunidades de expansão'),
                'decrescente': ('📉 Operação em Declínio', 'warning', 'Revisar estratégia operacional'),
                'insuficiente': ('⏸️ Dados Insuficientes', 'info', 'Aguardar mais dados')
            }
            
            title, severity, action = trend_map.get(trend, ('', 'info', None))
            
            insights.append({
                'category': 'temporal',
                'title': title,
                'description': f"{dias} dias de operação contínua com tendência {trend}",
                'metric': f"{dias} dias",
                'severity': severity,
                'priority': 4,
                'action': action
            })
        
        # Insight 6: Potencial de Crescimento
        if ranking.get('gaps') and ranking['gaps'].get('to_top3'):
            gap = ranking['gaps']['to_top3']
            
            if gap and gap < 0:  # CISARP está abaixo do top 3
                insights.append({
                    'category': 'potential',
                    'title': "📈 Potencial de Crescimento",
                    'description': f"Gap de apenas {abs(gap)} atividades para alcançar o Top 3 nacional",
                    'metric': f"+{abs(gap)} atividades",
                    'severity': 'warning',
                    'priority': 2,
                    'action': "Planejar expansão estratégica para alcançar Top 3"
                })
        
        # Insight 7: Taxa de Conversão
        if kpis.get('taxa_conversao', 0) > 0:
            taxa = kpis['taxa_conversao']
            
            severity = 'success' if taxa > 40 else 'warning' if taxa < 20 else 'info'
            
            insights.append({
                'category': 'conversion',
                'title': f"🎯 Taxa de Conversão: {taxa:.1f}%",
                'description': _self._interpret_conversion_rate(taxa),
                'metric': f"{taxa:.1f}%",
                'severity': severity,
                'priority': 3,
                'action': "Aumentar taxa de devolutivas" if taxa < 30 else None
            })
        
        # Ordenar por prioridade
        insights.sort(key=lambda x: x['priority'])
        
        logger.info(f"{len(insights)} insights gerados")
        
        return insights
    
    def _interpret_density(self, densidade: float) -> str:
        """Interpreta densidade operacional"""
        if densidade > 1.5:
            return "Alta densidade de POIs, indicando cobertura intensiva e detalhada"
        elif densidade > 1.0:
            return "Densidade adequada, equilibrando cobertura e eficiência"
        elif densidade > 0.5:
            return "Densidade moderada, há oportunidade de intensificar mapeamento"
        else:
            return "Densidade baixa, recomenda-se aumentar cobertura de POIs"
    
    def _interpret_conversion_rate(self, taxa: float) -> str:
        """Interpreta taxa de conversão"""
        if taxa > 50:
            return "Excelente taxa de devolutivas, demonstrando alto engajamento"
        elif taxa > 30:
            return "Boa taxa de conversão, mantendo qualidade do processo"
        elif taxa > 15:
            return "Taxa moderada, há espaço para melhorias no processo de devolutivas"
        else:
            return "Taxa baixa, recomenda-se revisão do processo de devolutivas"
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def generate_recommendations(
        _self,
        insights: List[Dict],
        kpis: Dict,
        ranking: Dict
    ) -> Dict[str, List[str]]:
        """
        Gera recomendações baseadas em insights
        
        Args:
            insights: Lista de insights gerados
            kpis: KPIs de performance
            ranking: Dados de ranking
        
        Returns:
            Dict com recomendações por horizonte temporal
        """
        recommendations = {
            'curto_prazo': [],
            'medio_prazo': [],
            'longo_prazo': []
        }
        
        # Recomendações baseadas em insights com ações
        for insight in insights:
            if insight.get('action'):
                if insight['priority'] == 1:
                    recommendations['curto_prazo'].append(insight['action'])
                elif insight['priority'] <= 3:
                    recommendations['medio_prazo'].append(insight['action'])
                else:
                    recommendations['longo_prazo'].append(insight['action'])
        
        # Recomendações padrão curto prazo
        if len(recommendations['curto_prazo']) < 3:
            default_curto = [
                "Aumentar taxa de conversão de devolutivas",
                "Campanhas de conscientização em áreas de alto risco",
                "Revisita em municípios com reincidência"
            ]
            for rec in default_curto:
                if rec not in recommendations['curto_prazo']:
                    recommendations['curto_prazo'].append(rec)
        
        # Recomendações padrão médio prazo
        if len(recommendations['medio_prazo']) < 3:
            default_medio = [
                "Implementar monitoramento contínuo a cada 3 meses",
                "Integrar dados com vigilância epidemiológica",
                "Capacitação avançada de equipes de campo",
                "Digitalização completa de processos"
            ]
            for rec in default_medio:
                if rec not in recommendations['medio_prazo']:
                    recommendations['medio_prazo'].append(rec)
        
        # Recomendações padrão longo prazo
        if len(recommendations['longo_prazo']) < 3:
            default_longo = [
                "Estabelecer CISARP como modelo de referência nacional",
                "Desenvolver estudo de impacto longitudinal",
                "Programa de intercâmbio de boas práticas",
                "Captação de recursos para inovação tecnológica"
            ]
            for rec in default_longo:
                if rec not in recommendations['longo_prazo']:
                    recommendations['longo_prazo'].append(rec)
        
        # Limitar a 5 recomendações por horizonte
        for horizon in recommendations:
            recommendations[horizon] = recommendations[horizon][:5]
        
        return recommendations
    
    @st.cache_data(ttl=settings.CACHE_TTL)
    def identify_opportunities(_self, kpis: Dict, temporal: Dict) -> List[Dict]:
        """
        Identifica oportunidades de melhoria
        
        Args:
            kpis: KPIs de performance
            temporal: Análise temporal
        
        Returns:
            Lista de oportunidades identificadas
        """
        opportunities = []
        
        # Oportunidade 1: Expansão territorial
        if kpis.get('municipios_unicos', 0) < 100:
            opportunities.append({
                'titulo': 'Expansão Territorial',
                'descricao': 'Potencial para expandir cobertura para municípios vizinhos',
                'potencial': 'Alto',
                'esforco': 'Médio',
                'impacto_esperado': 'Aumento de 20-30% na cobertura'
            })
        
        # Oportunidade 2: Otimização de densidade
        if kpis.get('densidade', 0) < 1.0:
            opportunities.append({
                'titulo': 'Otimização de Densidade',
                'descricao': 'Intensificar identificação de POIs em áreas já mapeadas',
                'potencial': 'Médio',
                'esforco': 'Baixo',
                'impacto_esperado': 'Aumento de 15-25% na detecção de focos'
            })
        
        # Oportunidade 3: Melhoria de conversão
        if kpis.get('taxa_conversao', 0) < 30:
            opportunities.append({
                'titulo': 'Aumento de Devolutivas',
                'descricao': 'Implementar processo sistemático de devolutivas',
                'potencial': 'Alto',
                'esforco': 'Médio',
                'impacto_esperado': 'Dobrar taxa de conversão (target: 50%)'
            })
        
        # Oportunidade 4: Crescimento sustentado
        if temporal.get('trend') == 'estável':
            opportunities.append({
                'titulo': 'Retomada de Crescimento',
                'descricao': 'Planejar nova fase de expansão para retomar crescimento',
                'potencial': 'Alto',
                'esforco': 'Alto',
                'impacto_esperado': 'Crescimento de 25% em 6 meses'
            })
        
        return opportunities
    
    def get_summary(self, insights: List[Dict], recommendations: Dict) -> str:
        """
        Resumo textual de insights e recomendações
        
        Args:
            insights: Lista de insights
            recommendations: Dict de recomendações
        
        Returns:
            String com resumo
        """
        # Contar insights por severidade
        success_count = len([i for i in insights if i['severity'] == 'success'])
        warning_count = len([i for i in insights if i['severity'] == 'warning'])
        
        summary = f"""
        **Resumo de Insights**
        
        - **{len(insights)}** insights identificados
        - **{success_count}** pontos positivos
        - **{warning_count}** áreas de atenção
        
        **Top 3 Insights:**
        """
        
        for i, insight in enumerate(insights[:3], 1):
            summary += f"\n{i}. {insight['title']}: {insight['description']}"
        
        summary += f"\n\n**Recomendações:**"
        summary += f"\n- Curto prazo: {len(recommendations['curto_prazo'])} ações"
        summary += f"\n- Médio prazo: {len(recommendations['medio_prazo'])} ações"
        summary += f"\n- Longo prazo: {len(recommendations['longo_prazo'])} ações"
        
        return summary.strip()

# Instância global
insights_generator = InsightsGenerator()
