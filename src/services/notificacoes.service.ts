'use client';

import { Notification, NotificationType } from '@/components/notifications/notification-center';

// Tipos específicos para notificações do sistema
export interface NotificacaoSistema {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  dataCriacao: string;
  lida: boolean;
  categoria: CategoriaNotificacao;
  dados?: Record<string, unknown>;
  link?: string;
  acaoLabel?: string;
}

export type CategoriaNotificacao =
  | 'alerta_dengue'
  | 'nova_atividade'
  | 'devolutiva_pendente'
  | 'meta_atingida'
  | 'sistema'
  | 'relatorio';

// Configuração de prioridade por categoria
const PRIORIDADE_CATEGORIA: Record<CategoriaNotificacao, number> = {
  alerta_dengue: 1,
  devolutiva_pendente: 2,
  nova_atividade: 3,
  meta_atingida: 4,
  relatorio: 5,
  sistema: 6,
};

// Mapeamento de categoria para tipo de notificação
const TIPO_POR_CATEGORIA: Record<CategoriaNotificacao, NotificationType> = {
  alerta_dengue: 'error',
  devolutiva_pendente: 'warning',
  nova_atividade: 'info',
  meta_atingida: 'success',
  relatorio: 'info',
  sistema: 'info',
};

// Classe para gerenciar conexão WebSocket de notificações
export class NotificacoesService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Set<(notificacao: NotificacaoSistema) => void> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private isConnected = false;

  constructor(private baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_WS_URL || 'wss://api.sistematechdengue.com/ws';
  }

  // Conectar ao WebSocket
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`${this.baseUrl}/notificacoes?token=${token}`);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners(true);
        console.log('[NotificacoesService] Conectado ao WebSocket');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            const notificacao = this.parseNotificacao(data.payload);
            this.notifyListeners(notificacao);
          }
        } catch (error) {
          console.error('[NotificacoesService] Erro ao processar mensagem:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyConnectionListeners(false);
        console.log('[NotificacoesService] Desconectado do WebSocket');
        this.attemptReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('[NotificacoesService] Erro no WebSocket:', error);
      };
    } catch (error) {
      console.error('[NotificacoesService] Erro ao criar conexão:', error);
    }
  }

  // Tentar reconectar
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[NotificacoesService] Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[NotificacoesService] Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  // Desconectar
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexão automática
  }

  // Parser de notificação do servidor
  private parseNotificacao(payload: Record<string, unknown>): NotificacaoSistema {
    const categoria = (payload.categoria as CategoriaNotificacao) || 'sistema';
    return {
      id: (payload.id as string) || `notif-${Date.now()}`,
      tipo: TIPO_POR_CATEGORIA[categoria],
      titulo: (payload.titulo as string) || 'Notificação',
      mensagem: (payload.mensagem as string) || '',
      dataCriacao: (payload.dataCriacao as string) || new Date().toISOString(),
      lida: false,
      categoria,
      dados: payload.dados as Record<string, unknown>,
      link: payload.link as string | undefined,
      acaoLabel: payload.acaoLabel as string | undefined,
    };
  }

  // Adicionar listener de notificações
  onNotification(callback: (notificacao: NotificacaoSistema) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Adicionar listener de status de conexão
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    // Notificar estado atual
    callback(this.isConnected);
    return () => this.connectionListeners.delete(callback);
  }

  // Notificar listeners
  private notifyListeners(notificacao: NotificacaoSistema): void {
    this.listeners.forEach((callback) => {
      try {
        callback(notificacao);
      } catch (error) {
        console.error('[NotificacoesService] Erro no listener:', error);
      }
    });
  }

  // Notificar listeners de conexão
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('[NotificacoesService] Erro no connection listener:', error);
      }
    });
  }

  // Verificar se está conectado
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Instância singleton do serviço
let notificacoesServiceInstance: NotificacoesService | null = null;

export function getNotificacoesService(): NotificacoesService {
  if (!notificacoesServiceInstance) {
    notificacoesServiceInstance = new NotificacoesService();
  }
  return notificacoesServiceInstance;
}

// API REST para notificações (fallback e histórico)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sistematechdengue.com/api/v1';

export interface NotificacoesListResponse {
  data: NotificacaoSistema[];
  total: number;
  naoLidas: number;
}

export interface NotificacoesParams {
  page?: number;
  limit?: number;
  categoria?: CategoriaNotificacao;
  apenasNaoLidas?: boolean;
}

// Buscar notificações via API REST
export async function getNotificacoes(
  params: NotificacoesParams = {},
  token: string
): Promise<NotificacoesListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.categoria) queryParams.set('categoria', params.categoria);
  if (params.apenasNaoLidas) queryParams.set('apenasNaoLidas', 'true');

  const response = await fetch(`${API_BASE}/notificacoes?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar notificações: ${response.status}`);
  }

  return response.json();
}

// Marcar notificação como lida
export async function marcarComoLida(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/notificacoes/${id}/lida`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao marcar notificação como lida: ${response.status}`);
  }
}

// Marcar todas as notificações como lidas
export async function marcarTodasComoLidas(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/notificacoes/marcar-todas-lidas`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao marcar todas notificações como lidas: ${response.status}`);
  }
}

// Excluir notificação
export async function excluirNotificacao(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/notificacoes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao excluir notificação: ${response.status}`);
  }
}

// Limpar todas as notificações
export async function limparTodasNotificacoes(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/notificacoes`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao limpar notificações: ${response.status}`);
  }
}

// Converter NotificacaoSistema para Notification do componente
export function toComponentNotification(notificacao: NotificacaoSistema): Notification {
  return {
    id: notificacao.id,
    type: notificacao.tipo,
    title: notificacao.titulo,
    message: notificacao.mensagem,
    timestamp: new Date(notificacao.dataCriacao),
    read: notificacao.lida,
    link: notificacao.link,
    actionLabel: notificacao.acaoLabel,
  };
}

// Ordenar notificações por prioridade e data
export function ordenarNotificacoes(notificacoes: NotificacaoSistema[]): NotificacaoSistema[] {
  return [...notificacoes].sort((a, b) => {
    // Primeiro por não lidas
    if (a.lida !== b.lida) {
      return a.lida ? 1 : -1;
    }
    // Depois por prioridade da categoria
    const prioridadeA = PRIORIDADE_CATEGORIA[a.categoria];
    const prioridadeB = PRIORIDADE_CATEGORIA[b.categoria];
    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB;
    }
    // Por fim, por data (mais recentes primeiro)
    return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
  });
}

// Criar notificação de alerta de dengue
export function criarAlertaDengue(
  municipio: string,
  casos: number,
  dados?: Record<string, unknown>
): Omit<NotificacaoSistema, 'id' | 'dataCriacao' | 'lida'> {
  return {
    tipo: 'error',
    titulo: `Alerta de Dengue - ${municipio}`,
    mensagem: `Registrados ${casos} novos casos de dengue em ${municipio}. Atenção redobrada necessária.`,
    categoria: 'alerta_dengue',
    dados,
    link: `/mapa?municipio=${encodeURIComponent(municipio)}`,
    acaoLabel: 'Ver no Mapa',
  };
}

// Criar notificação de nova atividade
export function criarNotificacaoAtividade(
  piloto: string,
  tipo: string,
  quantidade: number
): Omit<NotificacaoSistema, 'id' | 'dataCriacao' | 'lida'> {
  return {
    tipo: 'info',
    titulo: 'Nova Atividade Registrada',
    mensagem: `${piloto} registrou ${quantidade} ${tipo} hoje.`,
    categoria: 'nova_atividade',
    link: '/atividades',
    acaoLabel: 'Ver Atividades',
  };
}

// Criar notificação de devolutiva pendente
export function criarNotificacaoDevolutivaPendente(
  quantidade: number,
  municipio?: string
): Omit<NotificacaoSistema, 'id' | 'dataCriacao' | 'lida'> {
  const local = municipio ? ` em ${municipio}` : '';
  return {
    tipo: 'warning',
    titulo: 'Devolutivas Pendentes',
    mensagem: `Existem ${quantidade} devolutivas pendentes${local} aguardando análise.`,
    categoria: 'devolutiva_pendente',
    link: '/devolutivas?status=pendente',
    acaoLabel: 'Analisar',
  };
}

// Criar notificação de meta atingida
export function criarNotificacaoMetaAtingida(
  meta: string,
  percentual: number
): Omit<NotificacaoSistema, 'id' | 'dataCriacao' | 'lida'> {
  return {
    tipo: 'success',
    titulo: 'Meta Atingida! 🎉',
    mensagem: `A meta "${meta}" foi atingida com ${percentual.toFixed(0)}% de conclusão.`,
    categoria: 'meta_atingida',
    link: '/relatorios',
    acaoLabel: 'Ver Relatório',
  };
}

// Criar notificação de relatório gerado
export function criarNotificacaoRelatorio(
  tipoRelatorio: string,
  downloadUrl?: string
): Omit<NotificacaoSistema, 'id' | 'dataCriacao' | 'lida'> {
  return {
    tipo: 'info',
    titulo: 'Relatório Disponível',
    mensagem: `O ${tipoRelatorio} foi gerado com sucesso e está disponível para download.`,
    categoria: 'relatorio',
    link: downloadUrl || '/relatorios',
    acaoLabel: 'Baixar',
  };
}

// Criar notificação de sistema
export function criarNotificacaoSistema(
  titulo: string,
  mensagem: string,
  link?: string
): Omit<NotificacaoSistema, 'id' | 'dataCriacao' | 'lida'> {
  return {
    tipo: 'info',
    titulo,
    mensagem,
    categoria: 'sistema',
    link,
  };
}
