import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { LoginRequest, LoginResponse } from '@/types/api';

export function useAuth() {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      warehouseApi.setToken(token);
      // You might want to validate the token here
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseApi.login(credentials);
      setUser(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    warehouseApi.logout();
    setUser(null);
  };

  return { user, loading, error, login, logout, isAuthenticated: !!user };
}
