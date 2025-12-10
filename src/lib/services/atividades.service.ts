import techdengueClient from '@/lib/api/client';
import type { Atividade, PaginatedResponse } from '@/types/api.types';

export interface AtividadesParams {
  municipio_id?: string;
  contrato_id?: string;
  piloto_id?: string;
  status?: Atividade['status'];
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

export interface AtividadeCreateData {
  municipio_id: string;
  contrato_id: string;
  piloto_id: string;
  data_atividade: string;
  turno: 'manha' | 'tarde';
  hectares_mapeados?: number;
  hectares_efetivos?: number;
  status?: Atividade['status'];
  observacoes?: string;
}

export interface AtividadeUpdateData extends Partial<AtividadeCreateData> {
  id: string;
}

export interface PerformancePiloto {
  piloto_id: string;
  piloto_nome: string;
  total_atividades: number;
  total_hectares: number;
  hectares_efetivos: number;
  taxa_efetividade: number;
  media_hectares_dia: number;
}

export interface ResumoAtividades {
  total_atividades: number;
  atividades_concluidas: number;
  atividades_em_andamento: number;
  atividades_planejadas: number;
  atividades_canceladas: number;
  total_hectares: number;
  hectares_efetivos: number;
  taxa_conclusao: number;
}

export const atividadesService = {
  async getAtividades(params?: AtividadesParams): Promise<PaginatedResponse<Atividade>> {
    const { data } = await techdengueClient.get<PaginatedResponse<Atividade>>('/atividades', {
      params,
    });
    return data;
  },

  async getAtividadeById(id: string): Promise<Atividade> {
    const { data } = await techdengueClient.get<Atividade>(`/atividades/${id}`);
    return data;
  },

  async createAtividade(atividade: AtividadeCreateData): Promise<Atividade> {
    const { data } = await techdengueClient.post<Atividade>('/atividades', atividade);
    return data;
  },

  async updateAtividade({ id, ...atividade }: AtividadeUpdateData): Promise<Atividade> {
    const { data } = await techdengueClient.patch<Atividade>(`/atividades/${id}`, atividade);
    return data;
  },

  async deleteAtividade(id: string): Promise<void> {
    await techdengueClient.delete(`/atividades/${id}`);
  },

  async getResumo(params?: AtividadesParams): Promise<ResumoAtividades> {
    const { data } = await techdengueClient.get<ResumoAtividades>('/atividades/resumo', {
      params,
    });
    return data;
  },

  async getPerformancePilotos(params?: AtividadesParams): Promise<PerformancePiloto[]> {
    const { data } = await techdengueClient.get<PerformancePiloto[]>(
      '/atividades/performance-pilotos',
      { params }
    );
    return data;
  },
};
