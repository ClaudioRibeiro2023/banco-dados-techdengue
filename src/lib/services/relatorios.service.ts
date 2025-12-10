import techdengueClient from '@/lib/api/client';

export interface RelatorioParams {
  municipio_id?: string;
  contrato_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface RelatorioMunicipal {
  municipio: {
    id: string;
    nome: string;
    cod_ibge: string;
  };
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    hectares_mapeados: number;
    hectares_efetivos: number;
    total_criadouros: number;
    total_devolutivas: number;
    taxa_efetividade: number;
    taxa_devolutivas: number;
  };
  criadouros_por_tipo: Array<{
    tipo: string;
    quantidade: number;
    percentual: number;
  }>;
  devolutivas_por_status: Array<{
    status: string;
    quantidade: number;
    percentual: number;
  }>;
  atividades: Array<{
    data: string;
    piloto: string;
    turno: string;
    hectares: number;
    status: string;
  }>;
}

export interface RelatorioAtividades {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    total_atividades: number;
    atividades_concluidas: number;
    atividades_canceladas: number;
    taxa_conclusao: number;
    total_hectares: number;
    hectares_efetivos: number;
  };
  por_piloto: Array<{
    piloto_id: string;
    piloto_nome: string;
    atividades: number;
    hectares: number;
    efetividade: number;
  }>;
  por_municipio: Array<{
    municipio_id: string;
    municipio_nome: string;
    atividades: number;
    hectares: number;
  }>;
  detalhes: Array<{
    id: string;
    data: string;
    municipio: string;
    piloto: string;
    turno: string;
    hectares_mapeados: number;
    hectares_efetivos: number;
    status: string;
  }>;
}

export interface RelatorioDevolutivas {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    total_criadouros: number;
    devolutivas_pendentes: number;
    devolutivas_em_analise: number;
    devolutivas_tratadas: number;
    devolutivas_descartadas: number;
    taxa_conclusao: number;
    tempo_medio_resposta: number;
  };
  por_tipo: Array<{
    tipo: string;
    total: number;
    tratados: number;
    pendentes: number;
    taxa: number;
  }>;
  por_municipio: Array<{
    municipio: string;
    total: number;
    tratados: number;
    taxa: number;
  }>;
}

export interface RelatorioExecutivo {
  periodo: {
    inicio: string;
    fim: string;
  };
  kpis: {
    hectares_mapeados: number;
    variacao_hectares: number;
    criadouros_identificados: number;
    variacao_criadouros: number;
    taxa_devolutivas: number;
    variacao_devolutivas: number;
    atividades_realizadas: number;
    variacao_atividades: number;
  };
  ranking_municipios: Array<{
    posicao: number;
    municipio: string;
    hectares: number;
    eficiencia: number;
  }>;
  tendencias: {
    hectares: Array<{ mes: string; valor: number }>;
    criadouros: Array<{ mes: string; valor: number }>;
    devolutivas: Array<{ mes: string; valor: number }>;
  };
}

export type TipoRelatorio = 'municipal' | 'atividades' | 'devolutivas' | 'executivo';

export const relatoriosService = {
  async getRelatorioMunicipal(params: RelatorioParams): Promise<RelatorioMunicipal> {
    const { data } = await techdengueClient.get<RelatorioMunicipal>(
      '/relatorios/municipal',
      { params }
    );
    return data;
  },

  async getRelatorioAtividades(params: RelatorioParams): Promise<RelatorioAtividades> {
    const { data } = await techdengueClient.get<RelatorioAtividades>(
      '/relatorios/atividades',
      { params }
    );
    return data;
  },

  async getRelatorioDevolutivas(params: RelatorioParams): Promise<RelatorioDevolutivas> {
    const { data } = await techdengueClient.get<RelatorioDevolutivas>(
      '/relatorios/devolutivas',
      { params }
    );
    return data;
  },

  async getRelatorioExecutivo(params: RelatorioParams): Promise<RelatorioExecutivo> {
    const { data } = await techdengueClient.get<RelatorioExecutivo>(
      '/relatorios/executivo',
      { params }
    );
    return data;
  },
};
