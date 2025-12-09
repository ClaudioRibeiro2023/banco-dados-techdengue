"""
Modelos de Dados (ORM)
Mapeamento das tabelas do banco GIS para classes Python
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any
import json


@dataclass
class BancoTechdengue:
    """
    Modelo para tabela banco_techdengue
    Representa dados operacionais com informações geoespaciais
    """
    id: int
    nome: Optional[str] = None
    lat: Optional[float] = None
    long: Optional[float] = None
    geom: Optional[str] = None  # PostGIS geometry (WKT ou GeoJSON)
    data_criacao: Optional[datetime] = None
    analista: Optional[str] = None
    id_sistema: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BancoTechdengue':
        """Cria instância a partir de dicionário"""
        return cls(**{k: v for k, v in data.items() if k in cls.__annotations__})
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'nome': self.nome,
            'lat': self.lat,
            'long': self.long,
            'geom': self.geom,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'analista': self.analista,
            'id_sistema': self.id_sistema
        }
    
    def to_geojson_feature(self) -> Dict[str, Any]:
        """Converte para GeoJSON Feature"""
        if not self.geom:
            return None
        
        try:
            geometry = json.loads(self.geom) if isinstance(self.geom, str) else self.geom
        except:
            geometry = None
        
        return {
            'type': 'Feature',
            'id': self.id,
            'geometry': geometry,
            'properties': {
                'nome': self.nome,
                'lat': self.lat,
                'long': self.long,
                'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
                'analista': self.analista,
                'id_sistema': self.id_sistema
            }
        }


@dataclass
class PlanilhaCampo:
    """
    Modelo para tabela planilha_campo
    Representa registros de campo (POIs)
    """
    id: int
    id_atividade: Optional[str] = None
    poi: Optional[str] = None
    descricao: Optional[str] = None
    bairro: Optional[str] = None
    lat: Optional[float] = None
    longi: Optional[float] = None  # Nota: coluna é 'longi' no banco
    data_upload: Optional[datetime] = None
    categoria: Optional[str] = None
    tratamento: Optional[str] = None
    observacoes: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'PlanilhaCampo':
        """Cria instância a partir de dicionário"""
        return cls(**{k: v for k, v in data.items() if k in cls.__annotations__})
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'id_atividade': self.id_atividade,
            'poi': self.poi,
            'descricao': self.descricao,
            'bairro': self.bairro,
            'lat': self.lat,
            'longi': self.longi,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'categoria': self.categoria,
            'tratamento': self.tratamento,
            'observacoes': self.observacoes
        }
    
    def to_geojson_feature(self) -> Dict[str, Any]:
        """Converte para GeoJSON Feature (Point)"""
        if self.lat is None or self.longi is None:
            return None
        
        return {
            'type': 'Feature',
            'id': self.id,
            'geometry': {
                'type': 'Point',
                'coordinates': [self.longi, self.lat]  # GeoJSON usa [lon, lat]
            },
            'properties': {
                'id_atividade': self.id_atividade,
                'poi': self.poi,
                'descricao': self.descricao,
                'bairro': self.bairro,
                'data_upload': self.data_upload.isoformat() if self.data_upload else None,
                'categoria': self.categoria,
                'tratamento': self.tratamento,
                'observacoes': self.observacoes
            }
        }


@dataclass
class AtividadeAgregada:
    """
    Modelo para dados agregados de atividades
    Usado para análises e relatórios
    """
    codigo_ibge: str
    municipio: str
    total_atividades: int
    total_pois: int
    total_devolutivas: int
    hectares_mapeados: float
    data_primeira_atividade: Optional[datetime] = None
    data_ultima_atividade: Optional[datetime] = None
    taxa_conversao: Optional[float] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AtividadeAgregada':
        """Cria instância a partir de dicionário"""
        return cls(**{k: v for k, v in data.items() if k in cls.__annotations__})
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            'codigo_ibge': self.codigo_ibge,
            'municipio': self.municipio,
            'total_atividades': self.total_atividades,
            'total_pois': self.total_pois,
            'total_devolutivas': self.total_devolutivas,
            'hectares_mapeados': self.hectares_mapeados,
            'data_primeira_atividade': self.data_primeira_atividade.isoformat() if self.data_primeira_atividade else None,
            'data_ultima_atividade': self.data_ultima_atividade.isoformat() if self.data_ultima_atividade else None,
            'taxa_conversao': self.taxa_conversao
        }
