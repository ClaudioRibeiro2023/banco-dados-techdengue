import techdengueClient from '@/lib/api/client';
import type { Atividade, PaginatedResponse } from '@/types/api.types';

export interface AtividadeParams {
  page?: number;
  limit?: number;
  municipio_id?: string;
  contrato_id?: string;
  piloto_id?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const atividadeService = {
  async list(params?: AtividadeParams): Promise<PaginatedResponse<Atividade>> {
    const { data } = await techdengueClient.get<PaginatedResponse<Atividade>>('/atividade', {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Atividade> {
    const { data } = await techdengueClient.get<Atividade>(`/atividade/${id}`);
    return data;
  },

  async getPoligono(id: string) {
    const { data } = await techdengueClient.get(`/atividade/${id}/poligono`);
    return data;
  },

  async getCalendario(params?: { mes?: number; ano?: number; municipio_id?: string }) {
    const { data } = await techdengueClient.get('/atividade/calendario', { params });
    return data;
  },
};
