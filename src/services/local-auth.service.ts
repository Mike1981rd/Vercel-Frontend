import { api } from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    avatarUrl?: string;
    companyId?: number;
    companyName?: string;
    roles: string[];
    permissions: string[];
  };
}

class LocalAuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const authData = response.data as AuthResponse;
      
      // Guardar token y usuario en localStorage
      localStorage.setItem(this.TOKEN_KEY, authData.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
      
      // Configurar el token en el header de axios para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
      
      return authData;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  async logout(): Promise<void> {
    // Limpiar localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Remover el header de autorización
    delete api.defaults.headers.common['Authorization'];
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Inicializar el token si existe
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export const localAuthService = new LocalAuthService();