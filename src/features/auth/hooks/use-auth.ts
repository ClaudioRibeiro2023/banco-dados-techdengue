'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService, type LoginCredentials } from '../services/auth.service';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login: setAuth, logout: clearAuth, setLoading } = useAuthStore();

  // Query para verificar autenticação atual
  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation de login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      router.push('/dashboard');
    },
    onError: () => {
      clearAuth();
    },
  });

  // Mutation de logout
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      await loginMutation.mutateAsync(credentials);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user,
    isAuthenticated,
    isLoading: isCheckingAuth || loginMutation.isPending || logoutMutation.isPending,
    isLoginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    login,
    logout,
  };
}
