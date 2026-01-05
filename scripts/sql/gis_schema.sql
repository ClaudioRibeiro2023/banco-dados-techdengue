-- Schema minimo para suportar endpoints GIS da API TechDengue
-- Tabelas-alvo:
-- - banco_techdengue (usada por /gis/banco)
-- - planilha_campo (usada por /gis/pois)

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS public.banco_techdengue (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT,
  lat DOUBLE PRECISION,
  long DOUBLE PRECISION,
  geom geometry,
  data_criacao TIMESTAMPTZ,
  analista TEXT,
  id_sistema TEXT
);

CREATE INDEX IF NOT EXISTS idx_banco_techdengue_data_criacao_desc
  ON public.banco_techdengue (data_criacao DESC);

CREATE TABLE IF NOT EXISTS public.planilha_campo (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  id_atividade TEXT,
  id_sub_atividade TEXT,
  nome_sub_atividade TEXT,

  quadra TEXT,
  bairro TEXT,
  logradouro TEXT,

  poi TEXT,
  descricao TEXT,

  vol_estimado DOUBLE PRECISION,
  pastilhas INTEGER,
  granulado DOUBLE PRECISION,

  data_visita DATE,

  removido_solucionado BOOLEAN,
  descaracterizado BOOLEAN,
  tratado BOOLEAN,
  morador_ausente BOOLEAN,
  nao_autorizado BOOLEAN,

  observacao TEXT,
  tratamento_via_drone BOOLEAN,
  monitorado BOOLEAN,

  lat DOUBLE PRECISION,
  longi DOUBLE PRECISION,
  foto TEXT
);

CREATE INDEX IF NOT EXISTS idx_planilha_campo_deleted_at
  ON public.planilha_campo (deleted_at);

CREATE INDEX IF NOT EXISTS idx_planilha_campo_created_at_desc
  ON public.planilha_campo (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_planilha_campo_id_atividade
  ON public.planilha_campo (id_atividade);
