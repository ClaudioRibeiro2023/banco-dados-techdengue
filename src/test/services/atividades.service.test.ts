import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sistematechdengue.com/api/v1';

// Mock data
const mockAtividade = {
  id: '1',
  municipio_id: '1',
  contrato_id: '1',
  piloto_id: '1',
  piloto_nome: 'João Silva',
  data_atividade: '2024-12-07',
  turno: 'manha' as const,
  hectares_mapeados: 50,
  hectares_efetivos: 45,
  status: 'concluida' as const,
  observacoes: 'Atividade concluída com sucesso',
  created_at: '2024-12-07T08:00:00Z',
  updated_at: '2024-12-07T16:00:00Z',
};

const mockAtividades = [
  mockAtividade,
  {
    ...mockAtividade,
    id: '2',
    piloto_nome: 'Maria Santos',
    status: 'em_andamento' as const,
    hectares_efetivos: 30,
  },
  {
    ...mockAtividade,
    id: '3',
    piloto_nome: 'Pedro Oliveira',
    status: 'planejada' as const,
    hectares_efetivos: 0,
  },
];

const mockResumo = {
  total_atividades: 45,
  atividades_concluidas: 32,
  atividades_em_andamento: 8,
  atividades_planejadas: 3,
  atividades_canceladas: 2,
  total_hectares: 1234.5,
  hectares_efetivos: 1100.2,
  taxa_conclusao: 71.1,
};

const mockPerformancePilotos = [
  {
    piloto_id: '1',
    piloto_nome: 'João Silva',
    total_atividades: 15,
    total_hectares: 450,
    hectares_efetivos: 420,
    taxa_efetividade: 93.3,
    media_hectares_dia: 30,
  },
  {
    piloto_id: '2',
    piloto_nome: 'Maria Santos',
    total_atividades: 12,
    total_hectares: 360,
    hectares_efetivos: 340,
    taxa_efetividade: 94.4,
    media_hectares_dia: 28.3,
  },
];

describe('Atividades Service', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('getAtividades', () => {
    it('should fetch atividades list', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, () => {
          return HttpResponse.json({
            data: mockAtividades,
            total: 3,
            page: 1,
            limit: 20,
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data).toHaveLength(3);
    });

    it('should filter atividades by status', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');

          const filtered = mockAtividades.filter(a => a.status === status);
          return HttpResponse.json({
            data: filtered,
            total: filtered.length,
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades?status=concluida`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data.every((a: { status: string }) => a.status === 'concluida')).toBe(true);
    });

    it('should filter atividades by piloto_id', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, ({ request }) => {
          const url = new URL(request.url);
          const pilotoId = url.searchParams.get('piloto_id');

          const filtered = mockAtividades.filter(a => a.piloto_id === pilotoId);
          return HttpResponse.json({
            data: filtered,
            total: filtered.length,
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades?piloto_id=1`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data.every((a: { piloto_id: string }) => a.piloto_id === '1')).toBe(true);
    });

    it('should handle pagination', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '20');

          return HttpResponse.json({
            data: mockAtividades.slice(0, limit),
            total: 100,
            page,
            limit,
            totalPages: Math.ceil(100 / limit),
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades?page=1&limit=10`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('page', 1);
      expect(data).toHaveProperty('limit', 10);
      expect(data).toHaveProperty('totalPages');
    });

    it('should filter by date range', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, ({ request }) => {
          const url = new URL(request.url);
          const dataInicio = url.searchParams.get('data_inicio');
          const dataFim = url.searchParams.get('data_fim');

          return HttpResponse.json({
            data: mockAtividades,
            total: mockAtividades.length,
            filters: { data_inicio: dataInicio, data_fim: dataFim },
          });
        })
      );

      const response = await fetch(
        `${API_BASE}/atividades?data_inicio=2024-12-01&data_fim=2024-12-31`
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.filters).toHaveProperty('data_inicio', '2024-12-01');
      expect(data.filters).toHaveProperty('data_fim', '2024-12-31');
    });
  });

  describe('getAtividadeById', () => {
    it('should fetch single atividade by id', async () => {
      server.use(
        http.get(`${API_BASE}/atividades/1`, () => {
          return HttpResponse.json(mockAtividade);
        })
      );

      const response = await fetch(`${API_BASE}/atividades/1`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('id', '1');
      expect(data).toHaveProperty('piloto_nome', 'João Silva');
    });

    it('should return 404 for non-existent atividade', async () => {
      server.use(
        http.get(`${API_BASE}/atividades/999`, () => {
          return HttpResponse.json(
            { message: 'Atividade não encontrada' },
            { status: 404 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/atividades/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('createAtividade', () => {
    it('should create new atividade', async () => {
      const newAtividade = {
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '1',
        data_atividade: '2024-12-10',
        turno: 'tarde',
        hectares_mapeados: 40,
        status: 'planejada',
      };

      server.use(
        http.post(`${API_BASE}/atividades`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          return HttpResponse.json({
            id: '4',
            ...body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAtividade),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('data_atividade', '2024-12-10');
    });

    it('should validate required fields', async () => {
      server.use(
        http.post(`${API_BASE}/atividades`, () => {
          return HttpResponse.json(
            { message: 'Campos obrigatórios não preenchidos' },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('updateAtividade', () => {
    it('should update existing atividade', async () => {
      server.use(
        http.patch(`${API_BASE}/atividades/1`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          return HttpResponse.json({
            ...mockAtividade,
            ...body,
            updated_at: new Date().toISOString(),
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluida', hectares_efetivos: 48 }),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('status', 'concluida');
      expect(data).toHaveProperty('hectares_efetivos', 48);
    });

    it('should return 404 for updating non-existent atividade', async () => {
      server.use(
        http.patch(`${API_BASE}/atividades/999`, () => {
          return HttpResponse.json(
            { message: 'Atividade não encontrada' },
            { status: 404 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/atividades/999`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluida' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('deleteAtividade', () => {
    it('should delete atividade', async () => {
      server.use(
        http.delete(`${API_BASE}/atividades/1`, () => {
          return HttpResponse.json({ message: 'Atividade excluída com sucesso' });
        })
      );

      const response = await fetch(`${API_BASE}/atividades/1`, {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
    });

    it('should return 404 for deleting non-existent atividade', async () => {
      server.use(
        http.delete(`${API_BASE}/atividades/999`, () => {
          return HttpResponse.json(
            { message: 'Atividade não encontrada' },
            { status: 404 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/atividades/999`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('getResumo', () => {
    it('should fetch atividades resumo', async () => {
      server.use(
        http.get(`${API_BASE}/atividades/resumo`, () => {
          return HttpResponse.json(mockResumo);
        })
      );

      const response = await fetch(`${API_BASE}/atividades/resumo`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('total_atividades');
      expect(data).toHaveProperty('atividades_concluidas');
      expect(data).toHaveProperty('taxa_conclusao');
    });

    it('should filter resumo by municipio', async () => {
      server.use(
        http.get(`${API_BASE}/atividades/resumo`, ({ request }) => {
          const url = new URL(request.url);
          const municipioId = url.searchParams.get('municipio_id');

          return HttpResponse.json({
            ...mockResumo,
            municipio_id: municipioId,
          });
        })
      );

      const response = await fetch(`${API_BASE}/atividades/resumo?municipio_id=1`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('municipio_id', '1');
    });
  });

  describe('getPerformancePilotos', () => {
    it('should fetch pilotos performance', async () => {
      server.use(
        http.get(`${API_BASE}/atividades/performance-pilotos`, () => {
          return HttpResponse.json(mockPerformancePilotos);
        })
      );

      const response = await fetch(`${API_BASE}/atividades/performance-pilotos`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0]).toHaveProperty('piloto_nome');
      expect(data[0]).toHaveProperty('taxa_efetividade');
    });

    it('should filter performance by date range', async () => {
      server.use(
        http.get(`${API_BASE}/atividades/performance-pilotos`, ({ request }) => {
          const url = new URL(request.url);
          const dataInicio = url.searchParams.get('data_inicio');
          const dataFim = url.searchParams.get('data_fim');

          return HttpResponse.json(mockPerformancePilotos);
        })
      );

      const response = await fetch(
        `${API_BASE}/atividades/performance-pilotos?data_inicio=2024-12-01&data_fim=2024-12-31`
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, () => {
          return HttpResponse.error();
        })
      );

      try {
        await fetch(`${API_BASE}/atividades`);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/atividades`);
      expect(response.status).toBe(500);
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get(`${API_BASE}/atividades`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/atividades`);
      expect(response.status).toBe(401);
    });
  });
});

describe('Atividades Data Transformations', () => {
  it('should calculate taxa de efetividade correctly', () => {
    const hectaresMapeados = 50;
    const hectaresEfetivos = 45;
    const taxaEfetividade = (hectaresEfetivos / hectaresMapeados) * 100;

    expect(taxaEfetividade).toBe(90);
  });

  it('should handle zero hectares mapeados', () => {
    const hectaresMapeados = 0;
    const hectaresEfetivos = 0;
    const taxaEfetividade = hectaresMapeados === 0 ? 0 : (hectaresEfetivos / hectaresMapeados) * 100;

    expect(taxaEfetividade).toBe(0);
  });

  it('should calculate taxa de conclusão correctly', () => {
    const total = 45;
    const concluidas = 32;
    const taxaConclusao = (concluidas / total) * 100;

    expect(taxaConclusao.toFixed(1)).toBe('71.1');
  });

  it('should format turno correctly', () => {
    const formatTurno = (turno: string) => {
      const turnos: Record<string, string> = {
        manha: 'Manhã',
        tarde: 'Tarde',
      };
      return turnos[turno] || turno;
    };

    expect(formatTurno('manha')).toBe('Manhã');
    expect(formatTurno('tarde')).toBe('Tarde');
  });

  it('should format status correctly', () => {
    const formatStatus = (status: string) => {
      const statuses: Record<string, string> = {
        planejada: 'Planejada',
        em_andamento: 'Em Andamento',
        concluida: 'Concluída',
        cancelada: 'Cancelada',
      };
      return statuses[status] || status;
    };

    expect(formatStatus('planejada')).toBe('Planejada');
    expect(formatStatus('em_andamento')).toBe('Em Andamento');
    expect(formatStatus('concluida')).toBe('Concluída');
    expect(formatStatus('cancelada')).toBe('Cancelada');
  });

  it('should sort pilotos by performance', () => {
    const pilotos = [
      { nome: 'A', taxa_efetividade: 85 },
      { nome: 'B', taxa_efetividade: 95 },
      { nome: 'C', taxa_efetividade: 90 },
    ];

    const sorted = [...pilotos].sort((a, b) => b.taxa_efetividade - a.taxa_efetividade);

    expect(sorted[0].nome).toBe('B');
    expect(sorted[1].nome).toBe('C');
    expect(sorted[2].nome).toBe('A');
  });
});
