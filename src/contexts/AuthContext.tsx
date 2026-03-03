import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { tokenStorage } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const userData = tokenStorage.getUserData();
    
    if (token && userData) {
      setUser({ ...userData, token });
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    tokenStorage.setToken(userData.token);
    tokenStorage.setUserData({
      roles: userData.roles,
      modules: userData.modules,
    });
  };

  const logout = () => {
    setUser(null);
    tokenStorage.removeToken();
    tokenStorage.removeUserData();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};