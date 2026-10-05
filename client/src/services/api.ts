import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@rewritebot/shared';

export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }

    const timeoutMs = Number(import.meta.env?.VITE_PARAPHRASE_TIMEOUT_MS) || 180000;

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: timeoutMs,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & {
          _retry?: boolean;
        }) | undefined;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || '';
        const isAuthEndpoint =
          requestUrl.includes('/auth/login') ||
          requestUrl.includes('/auth/register') ||
          requestUrl.includes('/auth/refresh');

        // If 401 on a non-auth endpoint and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && this.refreshToken) {
          originalRequest._retry = true;

          try {
            const response = await axios.post<ApiResponse<{ accessToken: string }>>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken: this.refreshToken }
            );

            if (response.data.success && response.data.data) {
              const newAccessToken = response.data.data.accessToken;
              this.setAccessToken(newAccessToken);
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', newAccessToken);
              }

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed: completely purge tokens from memory and localStorage
            this.clearTokens();

            // ONLY redirect if the user is currently on a protected route!
            // NEVER redirect if they are on the landing page ('/') or already on auth routes ('/login', '/register')!
            if (typeof window !== 'undefined') {
              const pathname = window.location.pathname;
              const isProtected =
                pathname.startsWith('/app') ||
                pathname.startsWith('/studio') ||
                pathname.startsWith('/providers');

              if (isProtected) {
                window.location.href = '/login';
              }
            }
            return Promise.reject(refreshError);
          }
        }

        // If 401 occurs on a protected request without refresh capability, clear stale tokens
        if (error.response?.status === 401 && !isAuthEndpoint) {
          this.clearTokens();
        }

        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch {
        // Ignore storage errors
      }
    }
  }

  // Generic request methods
  async get<T>(url: string, config = {}): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  }

  async post<T>(url: string, data?: unknown, config = {}): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  }

  async patch<T>(url: string, data?: unknown, config = {}): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  }

  async delete<T>(url: string, config = {}): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  }

  // Error handling helper
  handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
        return 'The paraphrasing provider took too long to respond. Please try again.';
      }
      if (error.code === 'ERR_CANCELED') {
        return 'The paraphrasing request was cancelled.';
      }
      const apiError = error.response?.data as ApiResponse;
      if (apiError?.error) {
        return apiError.error.message;
      }
      return error.message || 'An unexpected error occurred';
    }
    if (error instanceof Error) {
      if (error.message && error.message.toLowerCase().includes('timeout')) {
        return 'The paraphrasing provider took too long to respond. Please try again.';
      }
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

export const apiClient = new ApiClient();
