/**
 * API Client - Cliente HTTP para comunicação com backend Node.js
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token JWT
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - tratamento global de erros
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        console.error(
          `[API Error]: ${error.response?.status} on ${error.config?.method?.toUpperCase()} ${error.config?.baseURL || ""}${error.config?.url}`,
        );
        // console.error("Data:", error.response?.data);
        const errorMessage = this.handleError(error);
        toast.error(errorMessage);
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: AxiosError): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { error?: string };

      switch (status) {
        case 400:
          return data.error || "Dados inválidos";
        case 401:
          localStorage.removeItem("access_token");
          return "Sessão expirada. Faça login novamente.";
        case 403:
          return "Acesso negado";
        case 404:
          return "Recurso não encontrado";
        case 412:
          return data.error || "Pré-condições não atendidas";
        case 429:
          return "Muitas requisições. Aguarde alguns instantes.";
        case 500:
          return "Erro interno do servidor";
        default:
          return data.error || "Erro desconhecido";
      }
    } else if (error.request) {
      return "Erro de conexão. Verifique sua internet.";
    } else {
      return error.message || "Erro desconhecido";
    }
  }

  // Métodos HTTP públicos
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  setAuthToken(token: string) {
    localStorage.setItem("access_token", token);
  }

  clearAuthToken() {
    localStorage.removeItem("access_token");
  }
}

export const apiClient = new ApiClient();
