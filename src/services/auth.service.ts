import { api } from '@/lib/api';
import { API_URL } from '@/lib/constants';
import { safeLocalStorage } from '@/lib/localStorage';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatarUrl?: string;
  companyId?: number;
  companyName?: string;
  roles?: string[];
  permissions?: string[];
}

class AuthService {
  private readonly baseUrl = `${API_URL}/auth`;

  async login(credentials: LoginDto): Promise<AuthResponse> {
    console.log('Intentando login con URL:', `${this.baseUrl}/login`);
    console.log('Credenciales:', credentials);
    
    try {
      const response = await api.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
      console.log('Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error en login:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(data: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${this.baseUrl}/register`, data);
    return response.data;
  }

  async getCurrentUser(token: string): Promise<UserDto> {
    const response = await api.get<UserDto>(`${this.baseUrl}/me`);
    return response.data;
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await api.post(`${this.baseUrl}/logout`, null);
    }
    this.clearAuth();
  }

  // Métodos de utilidad para manejar el token
  saveAuth(authResponse: AuthResponse): void {
    safeLocalStorage.setItem('token', authResponse.token);
    safeLocalStorage.setItem('user', JSON.stringify(authResponse.user));
    safeLocalStorage.setItem('expiresAt', authResponse.expiresAt);
  }

  getToken(): string | null {
    return safeLocalStorage.getItem('token');
  }

  getUser(): UserDto | null {
    const userStr = safeLocalStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = safeLocalStorage.getItem('expiresAt');
    
    if (!token || !expiresAt) return false;
    
    // Verificar si el token ha expirado
    const expirationDate = new Date(expiresAt);
    return expirationDate > new Date();
  }

  clearAuth(): void {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
    safeLocalStorage.removeItem('expiresAt');
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }
}

export default new AuthService();