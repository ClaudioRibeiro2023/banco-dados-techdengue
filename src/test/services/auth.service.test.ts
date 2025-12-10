import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { authService } from '@/lib/services/auth.service';

// Mock axios
vi.mock('axios');

// Mock the API client module - use vi.hoisted to ensure mock is available during hoisting
const mockTokenManager = vi.hoisted(() => ({
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  getAccessToken: vi.fn(),
  isTokenExpired: vi.fn(),
  getTokenExpiration: vi.fn(),
}));

const mockTechdengueClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  tokenManager: mockTokenManager,
  techdengueClient: mockTechdengueClient,
  parseApiError: (error: { response?: { data?: { message?: string; error?: string }; status?: number } }) => ({
    error: error?.response?.data?.error || 'UNKNOWN_ERROR',
    message: error?.response?.data?.message || 'Unknown error',
    status: error?.response?.status || 500,
  }),
}));

// Mock config
vi.mock('@/lib/config', () => ({
  API_CONFIG: {
    baseUrl: 'https://api.test.com',
    timeout: 30000,
  },
  FEATURE_FLAGS: {
    mockApi: false, // Usar API real nos testes
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset sessionStorage mock
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    const mockAuthResponse = {
      user: {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@example.com',
        perfil: 'admin',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    it('should login successfully with email and password', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/login',
        { email: 'test@example.com', password: 'password123' },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
    });

    it('should set tokens on successful login', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockAuthResponse });

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockTokenManager.setTokens).toHaveBeenCalledWith(
        'test-access-token',
        'test-refresh-token'
      );
    });

    it('should login with remember option', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockAuthResponse });

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
        remember: true,
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/login',
        { email: 'test@example.com', password: 'password123', remember: true },
        expect.any(Object)
      );
    });

    it('should return error on failed login', async () => {
      const error = {
        response: { status: 401, data: { message: 'Invalid credentials' } },
      };
      vi.mocked(axios.post).mockRejectedValue(error);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('register', () => {
    const mockAuthResponse = {
      user: {
        id: 'new-user-123',
        nome: 'New User',
        email: 'new@example.com',
        perfil: 'user',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      },
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    it('should register successfully', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await authService.register({
        nome: 'New User',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/register',
        expect.objectContaining({
          nome: 'New User',
          email: 'new@example.com',
        }),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
    });

    it('should set tokens on successful registration', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockAuthResponse });

      await authService.register({
        nome: 'New User',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      });

      expect(mockTokenManager.setTokens).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token'
      );
    });

    it('should register with optional fields', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockAuthResponse });

      await authService.register({
        nome: 'New User',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        cpf: '12345678900',
        telefone: '11999999999',
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/register',
        expect.objectContaining({
          cpf: '12345678900',
          telefone: '11999999999',
        }),
        expect.any(Object)
      );
    });

    it('should return error on failed registration', async () => {
      const error = {
        response: { status: 422, data: { message: 'Email already taken' } },
      };
      vi.mocked(axios.post).mockRejectedValue(error);

      const result = await authService.register({
        nome: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockTechdengueClient.post.mockResolvedValue({});

      const result = await authService.logout();

      expect(mockTechdengueClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should clear tokens even on API error', async () => {
      mockTechdengueClient.post.mockRejectedValue(new Error('Network error'));

      const result = await authService.logout();

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: 'user-123',
      nome: 'Test User',
      email: 'test@example.com',
      perfil: 'admin',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('should get current user successfully', async () => {
      mockTechdengueClient.get.mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(mockTechdengueClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('should return error on failure', async () => {
      mockTechdengueClient.get.mockRejectedValue({ response: { status: 401 } });

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Password reset email sent' },
      });

      const result = await authService.requestPasswordReset({
        email: 'test@example.com',
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/forgot-password',
        { email: 'test@example.com' },
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Password reset email sent');
    });

    it('should return error on failure', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: { status: 404, data: { message: 'User not found' } },
      });

      const result = await authService.requestPasswordReset({
        email: 'nonexistent@example.com',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Password reset successfully' },
      });

      const result = await authService.resetPassword({
        token: 'reset-token',
        email: 'test@example.com',
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/reset-password',
        expect.objectContaining({
          token: 'reset-token',
          email: 'test@example.com',
        }),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    it('should return error on invalid token', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: { status: 400, data: { message: 'Invalid token' } },
      });

      const result = await authService.resetPassword({
        token: 'invalid-token',
        email: 'test@example.com',
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockTechdengueClient.post.mockResolvedValue({
        data: { message: 'Password changed successfully' },
      });

      const result = await authService.changePassword({
        current_password: 'oldpassword',
        new_password: 'newpassword123',
        new_password_confirmation: 'newpassword123',
      });

      expect(mockTechdengueClient.post).toHaveBeenCalledWith(
        '/auth/change-password',
        expect.objectContaining({
          current_password: 'oldpassword',
          new_password: 'newpassword123',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error on wrong current password', async () => {
      mockTechdengueClient.post.mockRejectedValue({
        response: { status: 400, data: { message: 'Current password is incorrect' } },
      });

      const result = await authService.changePassword({
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
        new_password_confirmation: 'newpassword123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Email verified successfully' },
      });

      const result = await authService.verifyEmail('verification-token');

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test.com/auth/verify-email',
        { token: 'verification-token' },
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    it('should return error on invalid token', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: { status: 400, data: { message: 'Invalid verification token' } },
      });

      const result = await authService.verifyEmail('invalid-token');

      expect(result.success).toBe(false);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      mockTechdengueClient.post.mockResolvedValue({
        data: { message: 'Verification email sent' },
      });

      const result = await authService.resendVerificationEmail();

      expect(mockTechdengueClient.post).toHaveBeenCalledWith('/auth/resend-verification');
      expect(result.success).toBe(true);
    });

    it('should return error on failure', async () => {
      mockTechdengueClient.post.mockRejectedValue({
        response: { status: 429, data: { message: 'Too many requests' } },
      });

      const result = await authService.resendVerificationEmail();

      expect(result.success).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists and is valid', () => {
      mockTokenManager.getAccessToken.mockReturnValue('valid-token');
      mockTokenManager.isTokenExpired.mockReturnValue(false);

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      mockTokenManager.getAccessToken.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when token is expired', () => {
      mockTokenManager.getAccessToken.mockReturnValue('expired-token');
      mockTokenManager.isTokenExpired.mockReturnValue(true);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', () => {
      mockTokenManager.getAccessToken.mockReturnValue('test-token');

      const result = authService.getAccessToken();

      expect(result).toBe('test-token');
    });

    it('should return null when no token', () => {
      mockTokenManager.getAccessToken.mockReturnValue(null);

      const result = authService.getAccessToken();

      expect(result).toBeNull();
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date', () => {
      const expirationDate = new Date('2024-12-31');
      mockTokenManager.getAccessToken.mockReturnValue('test-token');
      mockTokenManager.getTokenExpiration.mockReturnValue(expirationDate);

      const result = authService.getTokenExpiration();

      expect(result).toEqual(expirationDate);
    });

    it('should return null when no token', () => {
      mockTokenManager.getAccessToken.mockReturnValue(null);

      const result = authService.getTokenExpiration();

      expect(result).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should clear tokens', () => {
      authService.clearAuth();

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
    });
  });

  describe('getRedirectPath', () => {
    it('should return stored redirect path', () => {
      vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue('/custom-path');
      vi.spyOn(window.sessionStorage, 'removeItem');

      const result = authService.getRedirectPath();

      expect(result).toBe('/custom-path');
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('redirect_after_login');
    });

    it('should return default path when no stored redirect', () => {
      vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue(null);

      const result = authService.getRedirectPath();

      expect(result).toBe('/dashboard');
    });
  });
});
