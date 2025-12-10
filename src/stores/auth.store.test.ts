import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });
    localStorage.clear();
  });

  const mockUser = {
    id: '1',
    nome: 'Test User',
    email: 'test@example.com',
    perfil: 'admin',
    municipio_id: 'mun-1',
    contrato_id: 'cont-1',
  };

  describe('login', () => {
    it('should set user and token on login', () => {
      const { login } = useAuthStore.getState();

      login(mockUser, 'test-token');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should store token in localStorage', () => {
      const { login } = useAuthStore.getState();

      login(mockUser, 'test-token');

      expect(localStorage.getItem('auth_token')).toBe('test-token');
    });
  });

  describe('logout', () => {
    it('should clear user and token on logout', () => {
      const { login, logout } = useAuthStore.getState();

      login(mockUser, 'test-token');
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remove token from localStorage', () => {
      const { login, logout } = useAuthStore.getState();

      login(mockUser, 'test-token');
      expect(localStorage.getItem('auth_token')).toBe('test-token');

      logout();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should update user and set isAuthenticated to true', () => {
      const { setUser } = useAuthStore.getState();

      setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setToken', () => {
    it('should update token and store in localStorage', () => {
      const { setToken } = useAuthStore.getState();

      setToken('new-token');

      const state = useAuthStore.getState();
      expect(state.token).toBe('new-token');
      expect(localStorage.getItem('auth_token')).toBe('new-token');
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);

      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });
});
