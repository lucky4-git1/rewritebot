import { apiClient } from './api';
import { User } from '@rewritebot/shared';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Store tokens
    apiClient.setAccessToken(response.accessToken);
    apiClient.setRefreshToken(response.refreshToken);
    this.storeTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store tokens
    apiClient.setAccessToken(response.accessToken);
    apiClient.setRefreshToken(response.refreshToken);
    this.storeTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Logout on client even if server request fails
        console.error('Logout error:', error);
      }
    }
    
    // Clear tokens
    apiClient.clearTokens();
    this.clearStoredTokens();
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    
    apiClient.setAccessToken(response.accessToken);
    this.storeAccessToken(response.accessToken);
    
    return response.accessToken;
  }

  // Token storage helpers
  private storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private storeAccessToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private clearStoredTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Initialize tokens on app startup
  initializeTokens() {
    const accessToken = this.getStoredAccessToken();
    const refreshToken = this.getStoredRefreshToken();
    
    if (accessToken) {
      apiClient.setAccessToken(accessToken);
    }
    if (refreshToken) {
      apiClient.setRefreshToken(refreshToken);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getStoredAccessToken();
  }
}

export const authService = new AuthService();
