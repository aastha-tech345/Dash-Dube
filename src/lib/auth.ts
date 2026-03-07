import { LoginRequest, LoginResponse } from '@/types/auth';

const API_BASE_URL = 'https://thegtrgroup.com/api';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },
};

export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },
  
  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
  
  setUserData: (userData: any): void => {
    localStorage.setItem('user_data', JSON.stringify(userData));
  },
  
  removeUserData: (): void => {
    localStorage.removeItem('user_data');
  },
};