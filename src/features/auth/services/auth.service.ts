import techdengueClient from '@/lib/api/client';
import type { User } from '@/stores/auth.store';
import { authService as coreAuthService } from '@/lib/services/auth.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthError {
  message: string;
  statusCode: number;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Usa o serviço central de autenticação, que já possui fallback/mock
    const result = await coreAuthService.login(credentials as any);

    if (!result.success || !result.data) {
      const error: AuthError = {
        message: result.error?.message || 'Erro ao fazer login',
        statusCode: result.error?.status || 500,
      };

      const axiosLikeError = Object.assign(new Error(error.message), {
        response: { status: error.statusCode, data: { message: error.message } },
      });

      throw axiosLikeError;
    }

    const { user, access_token } = result.data;

    const mappedUser: User = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      municipio_id: user.municipio_id,
      contrato_id: user.contrato_id,
      avatar_url: user.avatar_url,
    };

    return {
      access_token,
      user: mappedUser,
    };
  },

  async logout(): Promise<void> {
    try {
      await techdengueClient.post('/auth/logout');
    } catch {
      // Ignora erros no logout - limpar local é o importante
    }
  },

  async getProfile(): Promise<User> {
    const { data } = await techdengueClient.get<User>('/auth/profile');
    return data;
  },

  async refreshToken(): Promise<{ access_token: string }> {
    const { data } = await techdengueClient.post<{ access_token: string }>('/auth/refresh');
    return data;
  },

  async forgotPassword(email: string): Promise<void> {
    await techdengueClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await techdengueClient.post('/auth/reset-password', { token, password });
  },
};
