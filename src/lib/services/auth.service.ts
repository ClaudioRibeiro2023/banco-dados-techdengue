import axios from 'axios';
import { API_CONFIG, FEATURE_FLAGS } from '@/lib/config';
import { tokenManager, techdengueClient, parseApiError, ApiError } from '@/lib/api/client';

// Mock data for development/testing when API is unavailable
const MOCK_USER: AuthUser = {
  id: 'mock-user-001',
  nome: 'Usuário Demo',
  email: 'admin@techdengue.com',
  perfil: 'admin',
  municipio_id: 'mun-001',
  contrato_id: 'cont-001',
  avatar_url: undefined,
  email_verified_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: MOCK_USER,
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItMDAxIiwiZW1haWwiOiJhZG1pbkB0ZWNoZGVuZ3VlLmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.mock-signature',
  refresh_token: 'mock-refresh-token-001',
  token_type: 'Bearer',
  expires_in: 86400,
};

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  nome: string;
  email: string;
  password: string;
  password_confirmation: string;
  cpf?: string;
  telefone?: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  municipio_id?: string;
  contrato_id?: string;
  avatar_url?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  /**
   * Login with email and password
   * Falls back to mock data when MOCK_API is enabled or API is unavailable
   */
  async login(credentials: LoginCredentials): Promise<AuthResult<AuthResponse>> {
    // Use mock if enabled
    if (FEATURE_FLAGS.mockApi) {
      return this.mockLogin(credentials);
    }

    try {
      const response = await axios.post<AuthResponse>(
        `${this.baseUrl}/auth/login`,
        credentials,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.timeout,
        }
      );

      const { access_token, refresh_token } = response.data;
      tokenManager.setTokens(access_token, refresh_token);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = parseApiError(error as import('axios').AxiosError);
      
      // Fallback to mock if API returns 404 (endpoint not found)
      if (apiError.status === 404 || apiError.status === 0) {
        console.warn('[Auth] API unavailable, using mock login');
        return this.mockLogin(credentials);
      }

      return {
        success: false,
        error: apiError,
      };
    }
  }

  /**
   * Mock login for development/testing
   */
  private mockLogin(credentials: LoginCredentials): AuthResult<AuthResponse> {
    // Validate mock credentials
    if (credentials.email === 'admin@techdengue.com' && credentials.password === 'admin123') {
      const mockResponse = { ...MOCK_AUTH_RESPONSE };
      tokenManager.setTokens(mockResponse.access_token, mockResponse.refresh_token);
      
      return {
        success: true,
        data: mockResponse,
      };
    }

    // Invalid credentials
    return {
      success: false,
      error: {
        message: 'Credenciais inválidas. Use: admin@techdengue.com / admin123',
        error: 'INVALID_CREDENTIALS',
        status: 401,
      },
    };
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResult<AuthResponse>> {
    try {
      const response = await axios.post<AuthResponse>(
        `${this.baseUrl}/auth/register`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.timeout,
        }
      );

      const { access_token, refresh_token } = response.data;
      tokenManager.setTokens(access_token, refresh_token);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<AuthResult<void>> {
    try {
      await techdengueClient.post('/auth/logout');
      tokenManager.clearTokens();

      return { success: true };
    } catch (error) {
      // Clear tokens even if API call fails
      tokenManager.clearTokens();

      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResult<AuthUser>> {
    try {
      const response = await techdengueClient.get<AuthUser>('/auth/me');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<AuthResult<{ message: string }>> {
    try {
      const response = await axios.post<{ message: string }>(
        `${this.baseUrl}/auth/forgot-password`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.timeout,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: PasswordResetConfirm): Promise<AuthResult<{ message: string }>> {
    try {
      const response = await axios.post<{ message: string }>(
        `${this.baseUrl}/auth/reset-password`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.timeout,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordData): Promise<AuthResult<{ message: string }>> {
    try {
      const response = await techdengueClient.post<{ message: string }>(
        '/auth/change-password',
        data
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<AuthResult<{ message: string }>> {
    try {
      const response = await axios.post<{ message: string }>(
        `${this.baseUrl}/auth/verify-email`,
        { token },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.timeout,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(): Promise<AuthResult<{ message: string }>> {
    try {
      const response = await techdengueClient.post<{ message: string }>(
        '/auth/resend-verification'
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error as import('axios').AxiosError),
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = tokenManager.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    return !tokenManager.isTokenExpired(token);
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  }

  /**
   * Get token expiration date
   */
  getTokenExpiration(): Date | null {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    return tokenManager.getTokenExpiration(token);
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    tokenManager.clearTokens();
  }

  /**
   * Get redirect path after login
   */
  getRedirectPath(): string {
    if (typeof window === 'undefined') return '/dashboard';

    const redirect = sessionStorage.getItem('redirect_after_login');
    if (redirect) {
      sessionStorage.removeItem('redirect_after_login');
      return redirect;
    }

    return '/dashboard';
  }
}

export const authService = new AuthService();
