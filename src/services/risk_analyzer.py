"""
Serviço de Análise de Risco de Dengue com IA.
Utiliza Groq (Llama 3.3) para análises preditivas.
"""

import os
import json
from datetime import datetime, timezone
from typing import Optional, Any

import httpx
from pydantic import BaseModel, Field
from loguru import logger

from src.core.cache import get_cache


class RiskAnalysisRequest(BaseModel):
    """Requisição de análise de risco."""
    municipio: str
    codigo_ibge: Optional[str] = None
    casos_recentes: int = Field(default=0, description="Casos nos últimos 30 dias")
    casos_ano_anterior: int = Field(default=0, description="Casos no mesmo período ano anterior")
    temperatura_media: float = Field(default=25.0)
    umidade_media: float = Field(default=70.0)
    precipitacao_mm: float = Field(default=0.0)
    populacao: int = Field(default=100000)
    area_km2: float = Field(default=100.0)
    cobertura_saneamento: float = Field(default=80.0, description="% de cobertura")
    acoes_recentes: list[str] = Field(default_factory=list)


class RiskAnalysisResponse(BaseModel):
    """Resposta da análise de risco."""
    municipio: str
    nivel_risco: str = Field(..., description="baixo/moderado/alto/critico")
    score_risco: float = Field(..., description="Score de 0-100")
    tendencia: str = Field(..., description="estavel/aumentando/diminuindo")
    fatores_principais: list[str]
    recomendacoes: list[str]
    analise_detalhada: str
    confianca: float = Field(default=0.8, description="Confiança da análise 0-1")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    modelo_usado: str = "llama-3.3-70b-versatile"


class EpidemicAlert(BaseModel):
    """Alerta epidemiológico."""
    tipo: str = Field(..., description="surto/epidemia/endemia")
    severidade: str = Field(..., description="baixa/media/alta/critica")
    municipios_afetados: list[str]
    mensagem: str
    acoes_recomendadas: list[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RiskAnalyzer:
    """
    Analisador de risco de dengue usando IA (Groq/Llama).
    
    Combina:
    - Dados epidemiológicos históricos
    - Condições climáticas
    - Informações demográficas
    - Ações de controle realizadas
    """
    
    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self._client = httpx.AsyncClient(timeout=30.0)
        
        if not self.api_key:
            logger.warning("Groq API key não configurada, usando análise rule-based")
    
    async def close(self):
        await self._client.aclose()
    
    @property
    def is_ai_enabled(self) -> bool:
        return bool(self.api_key)
    
    async def analyze_risk(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        """
        Analisa risco de dengue para um município.
        """
        # Verificar cache
        cache = get_cache()
        cache_key = f"risk:{request.municipio}:{request.codigo_ibge}"
        cached = cache.get(cache_key)
        if cached:
            return RiskAnalysisResponse(**cached)
        
        if self.is_ai_enabled:
            try:
                result = await self._analyze_with_ai(request)
            except Exception as e:
                logger.error(f"Erro na análise com IA: {e}")
                result = self._analyze_rule_based(request)
        else:
            result = self._analyze_rule_based(request)
        
        # Cachear por 1 hora
        cache.set(cache_key, result.model_dump(), ttl=3600)
        
        return result
    
    async def _analyze_with_ai(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        """Análise usando Groq/Llama."""
        
        prompt = f"""Você é um epidemiologista especialista em arboviroses, especialmente dengue.
        
Analise os seguintes dados do município e forneça uma avaliação de risco:

## Dados do Município: {request.municipio}
- Código IBGE: {request.codigo_ibge or 'N/A'}
- População: {request.populacao:,}
- Área: {request.area_km2} km²
- Cobertura de saneamento: {request.cobertura_saneamento}%

## Dados Epidemiológicos
- Casos últimos 30 dias: {request.casos_recentes}
- Casos mesmo período ano anterior: {request.casos_ano_anterior}
- Incidência atual: {(request.casos_recentes / request.populacao * 100000):.1f} por 100 mil hab

## Condições Climáticas
- Temperatura média: {request.temperatura_media}°C
- Umidade média: {request.umidade_media}%
- Precipitação: {request.precipitacao_mm} mm

## Ações de Controle Recentes
{chr(10).join(f'- {a}' for a in request.acoes_recentes) if request.acoes_recentes else '- Nenhuma registrada'}

Responda APENAS com um JSON válido no seguinte formato (sem markdown):
{{
    "nivel_risco": "baixo|moderado|alto|critico",
    "score_risco": <número de 0 a 100>,
    "tendencia": "estavel|aumentando|diminuindo",
    "fatores_principais": ["fator1", "fator2", "fator3"],
    "recomendacoes": ["recomendacao1", "recomendacao2", "recomendacao3"],
    "analise_detalhada": "Análise epidemiológica em 2-3 frases"
}}
"""

        response = await self._client.post(
            self.GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um epidemiologista brasileiro especializado em dengue. Responda APENAS com JSON válido, sem markdown."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 1000,
            }
        )
        response.raise_for_status()
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse JSON da resposta
        # Remove possíveis backticks de markdown
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        result = json.loads(content)
        
        return RiskAnalysisResponse(
            municipio=request.municipio,
            nivel_risco=result["nivel_risco"],
            score_risco=result["score_risco"],
            tendencia=result["tendencia"],
            fatores_principais=result["fatores_principais"],
            recomendacoes=result["recomendacoes"],
            analise_detalhada=result["analise_detalhada"],
            confianca=0.85,
            modelo_usado="llama-3.3-70b-versatile",
        )
    
    def _analyze_rule_based(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        """
        Análise baseada em regras quando IA não está disponível.
        """
        score = 0
        fatores = []
        recomendacoes = []
        
        # Fator 1: Incidência atual (peso 30%)
        incidencia = (request.casos_recentes / request.populacao * 100000) if request.populacao > 0 else 0
        if incidencia > 300:
            score += 30
            fatores.append(f"Incidência muito alta: {incidencia:.1f}/100mil")
        elif incidencia > 100:
            score += 22
            fatores.append(f"Incidência alta: {incidencia:.1f}/100mil")
        elif incidencia > 50:
            score += 15
            fatores.append(f"Incidência moderada: {incidencia:.1f}/100mil")
        else:
            score += 5
        
        # Fator 2: Tendência comparada ao ano anterior (peso 25%)
        if request.casos_ano_anterior > 0:
            variacao = (request.casos_recentes - request.casos_ano_anterior) / request.casos_ano_anterior * 100
            if variacao > 50:
                score += 25
                fatores.append(f"Aumento de {variacao:.0f}% vs ano anterior")
                tendencia = "aumentando"
            elif variacao > 10:
                score += 15
                tendencia = "aumentando"
            elif variacao < -20:
                score += 5
                tendencia = "diminuindo"
            else:
                score += 10
                tendencia = "estavel"
        else:
            tendencia = "estavel"
            score += 10
        
        # Fator 3: Condições climáticas (peso 25%)
        # Temperatura ideal: 25-30°C
        if 25 <= request.temperatura_media <= 30:
            score += 15
            fatores.append("Temperatura ideal para o vetor (25-30°C)")
        elif 22 <= request.temperatura_media < 25 or 30 < request.temperatura_media <= 33:
            score += 10
        else:
            score += 5
        
        # Umidade >70% favorece
        if request.umidade_media >= 70:
            score += 10
            fatores.append(f"Umidade elevada ({request.umidade_media}%)")
        elif request.umidade_media >= 60:
            score += 7
        else:
            score += 3
        
        # Fator 4: Saneamento (peso 20%)
        if request.cobertura_saneamento < 50:
            score += 20
            fatores.append(f"Baixa cobertura de saneamento ({request.cobertura_saneamento}%)")
            recomendacoes.append("Priorizar ações em áreas sem saneamento")
        elif request.cobertura_saneamento < 70:
            score += 12
        elif request.cobertura_saneamento < 90:
            score += 7
        else:
            score += 3
        
        # Classificar nível de risco
        if score >= 75:
            nivel = "critico"
            recomendacoes.extend([
                "Declarar estado de alerta",
                "Mobilizar equipes extras de combate ao vetor",
                "Instalar centros de hidratação",
            ])
        elif score >= 50:
            nivel = "alto"
            recomendacoes.extend([
                "Intensificar ações de controle vetorial",
                "Realizar mutirões de limpeza",
                "Ampliar campanhas de conscientização",
            ])
        elif score >= 25:
            nivel = "moderado"
            recomendacoes.extend([
                "Manter vigilância epidemiológica ativa",
                "Continuar ações preventivas rotineiras",
            ])
        else:
            nivel = "baixo"
            recomendacoes.append("Manter ações básicas de prevenção")
        
        # Gerar análise
        analise = f"O município de {request.municipio} apresenta risco {nivel} para dengue "
        analise += f"com score de {score}/100. "
        if fatores:
            analise += f"Principais fatores: {'; '.join(fatores[:2])}."
        
        return RiskAnalysisResponse(
            municipio=request.municipio,
            nivel_risco=nivel,
            score_risco=score,
            tendencia=tendencia,
            fatores_principais=fatores[:5],
            recomendacoes=recomendacoes[:5],
            analise_detalhada=analise,
            confianca=0.7,
            modelo_usado="rule-based",
        )
    
    async def generate_epidemic_alert(
        self,
        municipios_risco: list[RiskAnalysisResponse],
    ) -> Optional[EpidemicAlert]:
        """
        Gera alerta epidemiológico baseado em múltiplos municípios.
        """
        criticos = [m for m in municipios_risco if m.nivel_risco == "critico"]
        altos = [m for m in municipios_risco if m.nivel_risco == "alto"]
        
        if len(criticos) >= 3:
            return EpidemicAlert(
                tipo="epidemia",
                severidade="critica",
                municipios_afetados=[m.municipio for m in criticos],
                mensagem=f"ALERTA: {len(criticos)} municípios em situação crítica de dengue",
                acoes_recomendadas=[
                    "Acionar plano de contingência estadual",
                    "Solicitar apoio federal",
                    "Mobilizar forças armadas para combate ao vetor",
                ],
            )
        elif len(criticos) >= 1 or len(altos) >= 5:
            return EpidemicAlert(
                tipo="surto",
                severidade="alta",
                municipios_afetados=[m.municipio for m in (criticos + altos)],
                mensagem=f"ATENÇÃO: Surto de dengue detectado em {len(criticos) + len(altos)} municípios",
                acoes_recomendadas=[
                    "Reforçar equipes de vigilância",
                    "Intensificar nebulização",
                    "Ampliar capacidade de atendimento",
                ],
            )
        
        return None


# Singleton
_risk_analyzer: Optional[RiskAnalyzer] = None


def get_risk_analyzer() -> RiskAnalyzer:
    """Retorna instância singleton do analisador de risco."""
    global _risk_analyzer
    if _risk_analyzer is None:
        _risk_analyzer = RiskAnalyzer()
    return _risk_analyzer
