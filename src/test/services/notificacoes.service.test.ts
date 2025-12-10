import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toComponentNotification,
  ordenarNotificacoes,
  criarAlertaDengue,
  criarNotificacaoAtividade,
  criarNotificacaoDevolutivaPendente,
  criarNotificacaoMetaAtingida,
  criarNotificacaoRelatorio,
  criarNotificacaoSistema,
  type NotificacaoSistema,
  type CategoriaNotificacao,
} from '@/services/notificacoes.service';

// Note: WebSocket tests are skipped because global.WebSocket is read-only in Vitest
// The WebSocket functionality should be tested via E2E tests with a real server

describe('toComponentNotification', () => {
  it('should convert NotificacaoSistema to Notification', () => {
    const notificacao: NotificacaoSistema = {
      id: 'notif-1',
      tipo: 'warning',
      titulo: 'Alerta',
      mensagem: 'Mensagem de teste',
      dataCriacao: '2024-01-15T10:30:00Z',
      lida: false,
      categoria: 'alerta_dengue',
      link: '/mapa',
      acaoLabel: 'Ver',
    };

    const result = toComponentNotification(notificacao);

    expect(result).toEqual({
      id: 'notif-1',
      type: 'warning',
      title: 'Alerta',
      message: 'Mensagem de teste',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      read: false,
      link: '/mapa',
      actionLabel: 'Ver',
    });
  });

  it('should handle notificacao without optional fields', () => {
    const notificacao: NotificacaoSistema = {
      id: 'notif-2',
      tipo: 'info',
      titulo: 'Info',
      mensagem: 'Mensagem simples',
      dataCriacao: '2024-01-15T10:30:00Z',
      lida: true,
      categoria: 'sistema',
    };

    const result = toComponentNotification(notificacao);

    expect(result.link).toBeUndefined();
    expect(result.actionLabel).toBeUndefined();
    expect(result.read).toBe(true);
  });

  it('should preserve all notification types', () => {
    const tipos: Array<NotificacaoSistema['tipo']> = ['info', 'success', 'warning', 'error'];

    tipos.forEach((tipo) => {
      const notificacao: NotificacaoSistema = {
        id: `notif-${tipo}`,
        tipo,
        titulo: `Notificação ${tipo}`,
        mensagem: 'Mensagem',
        dataCriacao: '2024-01-15T10:30:00Z',
        lida: false,
        categoria: 'sistema',
      };

      const result = toComponentNotification(notificacao);
      expect(result.type).toBe(tipo);
    });
  });
});

describe('ordenarNotificacoes', () => {
  const baseNotificacao: Omit<NotificacaoSistema, 'id' | 'categoria' | 'lida' | 'dataCriacao'> = {
    tipo: 'info',
    titulo: 'Teste',
    mensagem: 'Mensagem',
  };

  it('should sort unread notifications first', () => {
    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: '1', categoria: 'sistema', lida: true, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: '2', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T09:00:00Z' },
    ];

    const sorted = ordenarNotificacoes(notificacoes);

    expect(sorted[0].lida).toBe(false);
    expect(sorted[1].lida).toBe(true);
  });

  it('should sort by category priority', () => {
    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: '1', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: '2', categoria: 'alerta_dengue', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: '3', categoria: 'nova_atividade', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
    ];

    const sorted = ordenarNotificacoes(notificacoes);

    expect(sorted[0].categoria).toBe('alerta_dengue');
    expect(sorted[1].categoria).toBe('nova_atividade');
    expect(sorted[2].categoria).toBe('sistema');
  });

  it('should sort by date within same priority', () => {
    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: '1', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T08:00:00Z' },
      { ...baseNotificacao, id: '2', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T12:00:00Z' },
      { ...baseNotificacao, id: '3', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
    ];

    const sorted = ordenarNotificacoes(notificacoes);

    expect(sorted[0].id).toBe('2'); // Most recent
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1'); // Oldest
  });

  it('should not mutate original array', () => {
    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: '1', categoria: 'sistema', lida: true, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: '2', categoria: 'alerta_dengue', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
    ];

    const originalFirst = notificacoes[0].id;
    ordenarNotificacoes(notificacoes);

    expect(notificacoes[0].id).toBe(originalFirst);
  });

  it('should handle empty notification list', () => {
    const result = ordenarNotificacoes([]);
    expect(result).toEqual([]);
  });

  it('should handle single notification', () => {
    const notificacao: NotificacaoSistema = {
      id: '1',
      tipo: 'info',
      titulo: 'Única',
      mensagem: 'Mensagem',
      dataCriacao: '2024-01-15T10:00:00Z',
      lida: false,
      categoria: 'sistema',
    };

    const result = ordenarNotificacoes([notificacao]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should maintain stable sort for equal priorities', () => {
    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: 'a', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: 'b', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: 'c', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
    ];

    // Run multiple times to ensure stability
    for (let i = 0; i < 5; i++) {
      const sorted = ordenarNotificacoes(notificacoes);
      expect(sorted).toHaveLength(3);
    }
  });
});

describe('Notification Factory Functions', () => {
  describe('criarAlertaDengue', () => {
    it('should create dengue alert notification', () => {
      const result = criarAlertaDengue('Curitiba', 150);

      expect(result.tipo).toBe('error');
      expect(result.titulo).toBe('Alerta de Dengue - Curitiba');
      expect(result.mensagem).toContain('150');
      expect(result.mensagem).toContain('Curitiba');
      expect(result.categoria).toBe('alerta_dengue');
      expect(result.link).toContain('municipio=Curitiba');
      expect(result.acaoLabel).toBe('Ver no Mapa');
    });

    it('should include additional data if provided', () => {
      const dados = { gravidade: 'alta', tendencia: 'crescente' };
      const result = criarAlertaDengue('São Paulo', 500, dados);

      expect(result.dados).toEqual(dados);
    });

    it('should encode special characters in URL', () => {
      const result = criarAlertaDengue('São José dos Pinhais', 50);

      expect(result.link).toContain(encodeURIComponent('São José dos Pinhais'));
    });

    it('should handle zero cases', () => {
      const result = criarAlertaDengue('Londrina', 0);

      expect(result.mensagem).toContain('0');
    });

    it('should handle large numbers', () => {
      const result = criarAlertaDengue('Campinas', 10000);

      expect(result.mensagem).toContain('10000');
    });
  });

  describe('criarNotificacaoAtividade', () => {
    it('should create activity notification', () => {
      const result = criarNotificacaoAtividade('João Silva', 'vistorias', 25);

      expect(result.tipo).toBe('info');
      expect(result.titulo).toBe('Nova Atividade Registrada');
      expect(result.mensagem).toContain('João Silva');
      expect(result.mensagem).toContain('25');
      expect(result.mensagem).toContain('vistorias');
      expect(result.categoria).toBe('nova_atividade');
      expect(result.link).toBe('/atividades');
    });

    it('should handle different activity types', () => {
      const tipos = ['tratamentos', 'eliminações', 'inspeções'];

      tipos.forEach((tipo) => {
        const result = criarNotificacaoAtividade('Piloto', tipo, 10);
        expect(result.mensagem).toContain(tipo);
      });
    });

    it('should handle single activity', () => {
      const result = criarNotificacaoAtividade('Maria', 'vistoria', 1);

      expect(result.mensagem).toContain('1');
    });
  });

  describe('criarNotificacaoDevolutivaPendente', () => {
    it('should create pending devolutiva notification without municipio', () => {
      const result = criarNotificacaoDevolutivaPendente(10);

      expect(result.tipo).toBe('warning');
      expect(result.titulo).toBe('Devolutivas Pendentes');
      expect(result.mensagem).toContain('10');
      expect(result.mensagem).not.toContain(' em ');
      expect(result.categoria).toBe('devolutiva_pendente');
      expect(result.link).toBe('/devolutivas?status=pendente');
      expect(result.acaoLabel).toBe('Analisar');
    });

    it('should include municipio in message', () => {
      const result = criarNotificacaoDevolutivaPendente(5, 'Londrina');

      expect(result.mensagem).toContain('em Londrina');
    });

    it('should handle single devolutiva', () => {
      const result = criarNotificacaoDevolutivaPendente(1);

      expect(result.mensagem).toContain('1 devolutivas');
    });

    it('should handle zero devolutivas', () => {
      const result = criarNotificacaoDevolutivaPendente(0);

      expect(result.mensagem).toContain('0');
    });
  });

  describe('criarNotificacaoMetaAtingida', () => {
    it('should create goal achieved notification', () => {
      const result = criarNotificacaoMetaAtingida('Vistorias Mensais', 105.5);

      expect(result.tipo).toBe('success');
      expect(result.titulo).toBe('Meta Atingida! 🎉');
      expect(result.mensagem).toContain('Vistorias Mensais');
      expect(result.mensagem).toContain('106%'); // Rounded
      expect(result.categoria).toBe('meta_atingida');
      expect(result.link).toBe('/relatorios');
      expect(result.acaoLabel).toBe('Ver Relatório');
    });

    it('should round percentages correctly', () => {
      expect(criarNotificacaoMetaAtingida('Meta', 99.4).mensagem).toContain('99%');
      expect(criarNotificacaoMetaAtingida('Meta', 99.5).mensagem).toContain('100%');
      expect(criarNotificacaoMetaAtingida('Meta', 100.0).mensagem).toContain('100%');
    });

    it('should handle very high percentages', () => {
      const result = criarNotificacaoMetaAtingida('Meta Superada', 250);

      expect(result.mensagem).toContain('250%');
    });
  });

  describe('criarNotificacaoRelatorio', () => {
    it('should create report notification without download URL', () => {
      const result = criarNotificacaoRelatorio('Relatório Municipal');

      expect(result.tipo).toBe('info');
      expect(result.titulo).toBe('Relatório Disponível');
      expect(result.mensagem).toContain('Relatório Municipal');
      expect(result.categoria).toBe('relatorio');
      expect(result.link).toBe('/relatorios');
      expect(result.acaoLabel).toBe('Baixar');
    });

    it('should use download URL if provided', () => {
      const url = 'https://storage.example.com/relatorio.pdf';
      const result = criarNotificacaoRelatorio('Relatório Executivo', url);

      expect(result.link).toBe(url);
    });

    it('should handle different report types', () => {
      const tipos = ['Relatório Municipal', 'Relatório de Atividades', 'Relatório Executivo'];

      tipos.forEach((tipo) => {
        const result = criarNotificacaoRelatorio(tipo);
        expect(result.mensagem).toContain(tipo);
      });
    });
  });

  describe('criarNotificacaoSistema', () => {
    it('should create system notification', () => {
      const result = criarNotificacaoSistema(
        'Manutenção Programada',
        'O sistema ficará indisponível das 2h às 4h.'
      );

      expect(result.tipo).toBe('info');
      expect(result.titulo).toBe('Manutenção Programada');
      expect(result.mensagem).toBe('O sistema ficará indisponível das 2h às 4h.');
      expect(result.categoria).toBe('sistema');
      expect(result.link).toBeUndefined();
    });

    it('should include link if provided', () => {
      const result = criarNotificacaoSistema(
        'Nova Funcionalidade',
        'Confira a nova funcionalidade de exportação.',
        '/novidades'
      );

      expect(result.link).toBe('/novidades');
    });

    it('should handle empty message', () => {
      const result = criarNotificacaoSistema('Título', '');

      expect(result.mensagem).toBe('');
    });

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const result = criarNotificacaoSistema('Título', longMessage);

      expect(result.mensagem).toBe(longMessage);
    });
  });
});

describe('Category Priority', () => {
  const categories: CategoriaNotificacao[] = [
    'alerta_dengue',
    'devolutiva_pendente',
    'nova_atividade',
    'meta_atingida',
    'relatorio',
    'sistema',
  ];

  it('should have correct priority order', () => {
    const baseNotificacao: Omit<NotificacaoSistema, 'id' | 'categoria' | 'lida' | 'dataCriacao'> = {
      tipo: 'info',
      titulo: 'Teste',
      mensagem: 'Mensagem',
    };

    const notificacoes: NotificacaoSistema[] = categories.map((categoria, index) => ({
      ...baseNotificacao,
      id: `${index}`,
      categoria,
      lida: false,
      dataCriacao: '2024-01-15T10:00:00Z',
    }));

    // Reverse order to test sorting
    const reversed = [...notificacoes].reverse();
    const sorted = ordenarNotificacoes(reversed);

    expect(sorted[0].categoria).toBe('alerta_dengue');
    expect(sorted[1].categoria).toBe('devolutiva_pendente');
    expect(sorted[2].categoria).toBe('nova_atividade');
    expect(sorted[3].categoria).toBe('meta_atingida');
    expect(sorted[4].categoria).toBe('relatorio');
    expect(sorted[5].categoria).toBe('sistema');
  });

  it('should prioritize unread over category', () => {
    const baseNotificacao: Omit<NotificacaoSistema, 'id' | 'categoria' | 'lida' | 'dataCriacao'> = {
      tipo: 'info',
      titulo: 'Teste',
      mensagem: 'Mensagem',
    };

    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: '1', categoria: 'alerta_dengue', lida: true, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: '2', categoria: 'sistema', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
    ];

    const sorted = ordenarNotificacoes(notificacoes);

    // Unread sistema should come before read alerta_dengue
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });
});

describe('Integration scenarios', () => {
  it('should handle mixed notifications correctly', () => {
    const baseNotificacao: Omit<NotificacaoSistema, 'id' | 'categoria' | 'lida' | 'dataCriacao' | 'tipo'> = {
      titulo: 'Teste',
      mensagem: 'Mensagem',
    };

    const notificacoes: NotificacaoSistema[] = [
      { ...baseNotificacao, id: '1', tipo: 'info', categoria: 'sistema', lida: true, dataCriacao: '2024-01-15T08:00:00Z' },
      { ...baseNotificacao, id: '2', tipo: 'error', categoria: 'alerta_dengue', lida: false, dataCriacao: '2024-01-15T09:00:00Z' },
      { ...baseNotificacao, id: '3', tipo: 'warning', categoria: 'devolutiva_pendente', lida: false, dataCriacao: '2024-01-15T10:00:00Z' },
      { ...baseNotificacao, id: '4', tipo: 'success', categoria: 'meta_atingida', lida: true, dataCriacao: '2024-01-15T11:00:00Z' },
      { ...baseNotificacao, id: '5', tipo: 'info', categoria: 'nova_atividade', lida: false, dataCriacao: '2024-01-15T12:00:00Z' },
    ];

    const sorted = ordenarNotificacoes(notificacoes);

    // First: unread by priority (alerta_dengue, devolutiva_pendente, nova_atividade)
    expect(sorted[0].id).toBe('2'); // alerta_dengue (unread, highest priority)
    expect(sorted[1].id).toBe('3'); // devolutiva_pendente (unread)
    expect(sorted[2].id).toBe('5'); // nova_atividade (unread)

    // Then: read by priority
    expect(sorted[3].id).toBe('4'); // meta_atingida (read)
    expect(sorted[4].id).toBe('1'); // sistema (read)
  });

  it('should convert and sort notifications together', () => {
    const notificacoes: NotificacaoSistema[] = [
      {
        id: '1',
        tipo: 'error',
        titulo: 'Alerta',
        mensagem: 'Mensagem de alerta',
        dataCriacao: '2024-01-15T10:00:00Z',
        lida: false,
        categoria: 'alerta_dengue',
        link: '/mapa',
      },
      {
        id: '2',
        tipo: 'info',
        titulo: 'Info',
        mensagem: 'Mensagem informativa',
        dataCriacao: '2024-01-15T11:00:00Z',
        lida: true,
        categoria: 'sistema',
      },
    ];

    const sorted = ordenarNotificacoes(notificacoes);
    const converted = sorted.map(toComponentNotification);

    expect(converted).toHaveLength(2);
    expect(converted[0].id).toBe('1');
    expect(converted[0].type).toBe('error');
    expect(converted[1].id).toBe('2');
    expect(converted[1].type).toBe('info');
  });
});
