'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService, { UserDto, LoginDto, AuthResponse } from '@/services/auth.service';
import { ROUTES } from '@/lib/constants';

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      
      if (!token || !authService.isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Intentar obtener el usuario actual
      const currentUser = await authService.getCurrentUser(token);
      setUser(currentUser);
    } catch (error: any) {
      // Si es un 404 o 401, es normal cuando no hay usuario autenticado
      if (error.response?.status === 404 || error.response?.status === 401) {
        // No mostrar error en consola para estos casos
        authService.clearAuth();
      } else {
        console.error('Error al verificar autenticación:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      authService.saveAuth(response);
      setUser(response.user);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return authService.hasPermission(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return authService.hasRole(role);
  };

  const isSuperAdmin = (): boolean => {
    return authService.isSuperAdmin();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}