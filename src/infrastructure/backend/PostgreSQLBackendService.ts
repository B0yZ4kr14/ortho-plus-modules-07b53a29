/**
 * PostgreSQL Backend Service Implementation
 * Connects to self-hosted PostgreSQL on Ubuntu Server LTS
 */

import type { 
  IBackendService, 
  IAuthService, 
  IDataService, 
  IStorageService, 
  IFunctionsService,
  QueryOptions 
} from './IBackendService';
import type { DatabaseRecord, PaginatedResponse, FileUploadResult, StorageConfig } from '@/types/common';
import type { User, Session } from '@supabase/supabase-js';

export class PostgreSQLBackendService implements IBackendService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' 
      ? localStorage.getItem('ubuntu_server_url') || 'http://localhost:8000'
      : 'http://localhost:8000';
  }

  getBackendType(): 'supabase' | 'postgresql' {
    return 'postgresql';
  }

  async isReady(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ==================== Auth Service ====================
  
  auth: IAuthService = {
    signUp: async (email, password, metadata) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, metadata }),
        });

        if (!response.ok) {
          const error = await response.json();
          return { user: null, session: null, error: new Error(error.message) };
        }

        const data = await response.json();
        this.token = data.session?.access_token;
        return { user: data.user, session: data.session, error: null };
      } catch (err) {
        return { 
          user: null, 
          session: null, 
          error: err instanceof Error ? err : new Error('Unknown error') 
        };
      }
    },

    signIn: async (email, password) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          return { user: null, session: null, error: new Error(error.message) };
        }

        const data = await response.json();
        this.token = data.session?.access_token;
        if (this.token) {
          localStorage.setItem('pg_auth_token', this.token);
        }
        return { user: data.user, session: data.session, error: null };
      } catch (err) {
        return { 
          user: null, 
          session: null, 
          error: err instanceof Error ? err : new Error('Unknown error') 
        };
      }
    },

    signOut: async () => {
      try {
        await fetch(`${this.baseUrl}/auth/signout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
        this.token = null;
        localStorage.removeItem('pg_auth_token');
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    getSession: async () => {
      try {
        const token = localStorage.getItem('pg_auth_token');
        if (!token) {
          return { session: null, error: null };
        }

        const response = await fetch(`${this.baseUrl}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          return { session: null, error: new Error('Invalid session') };
        }

        const session = await response.json();
        return { session, error: null };
      } catch (err) {
        return { session: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    getUser: async () => {
      try {
        const token = localStorage.getItem('pg_auth_token');
        if (!token) {
          return { user: null, error: null };
        }

        const response = await fetch(`${this.baseUrl}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          return { user: null, error: new Error('User not found') };
        }

        const user = await response.json();
        return { user, error: null };
      } catch (err) {
        return { user: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    resetPassword: async (email) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          return { error: new Error('Password reset failed') };
        }

        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    updatePassword: async (newPassword) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/update-password`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ password: newPassword }),
        });

        if (!response.ok) {
          return { error: new Error('Password update failed') };
        }

        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    onAuthStateChange: (callback) => {
      // Implementation for WebSocket or polling
      console.warn('onAuthStateChange not fully implemented for PostgreSQL backend');
      return () => {};
    },
  };

  // ==================== Data Service ====================
  
  data: IDataService = {
    query: async <T extends DatabaseRecord>(table: string, options?: QueryOptions) => {
      try {
        const params = new URLSearchParams();
        if (options?.filters) {
          params.append('filters', JSON.stringify(options.filters));
        }
        if (options?.sort) {
          params.append('sort', JSON.stringify(options.sort));
        }
        if (options?.limit) {
          params.append('limit', options.limit.toString());
        }
        if (options?.offset) {
          params.append('offset', options.offset.toString());
        }

        const response = await fetch(
          `${this.baseUrl}/data/${table}?${params.toString()}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          return { data: [], error: new Error('Query failed') };
        }

        const data = await response.json();
        return { data: data as T[], error: null };
      } catch (err) {
        return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    queryPaginated: async <T extends DatabaseRecord>(table: string, options?: QueryOptions) => {
      try {
        const result = await this.data.query<T>(table, options);
        if (result.error) {
          return { 
            data: { data: [], total: 0, page: 1, limit: 10, hasMore: false }, 
            error: result.error 
          };
        }

        const total = result.data.length;
        const page = Math.floor((options?.offset || 0) / (options?.limit || 10)) + 1;
        const limit = options?.limit || 10;
        const hasMore = (page * limit) < total;

        return {
          data: {
            data: result.data,
            total,
            page,
            limit,
            hasMore,
          },
          error: null,
        };
      } catch (err) {
        return {
          data: { data: [], total: 0, page: 1, limit: 10, hasMore: false },
          error: err instanceof Error ? err : new Error('Unknown error'),
        };
      }
    },

    getById: async <T extends DatabaseRecord>(table: string, id: string) => {
      try {
        const response = await fetch(`${this.baseUrl}/data/${table}/${id}`, {
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          return { data: null, error: new Error('Record not found') };
        }

        const data = await response.json();
        return { data: data as T, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    create: async <T extends DatabaseRecord>(table: string, data: Partial<T>) => {
      try {
        const response = await fetch(`${this.baseUrl}/data/${table}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          return { data: null, error: new Error('Create failed') };
        }

        const result = await response.json();
        return { data: result as T, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    update: async <T extends DatabaseRecord>(table: string, id: string, data: Partial<T>) => {
      try {
        const response = await fetch(`${this.baseUrl}/data/${table}/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          return { data: null, error: new Error('Update failed') };
        }

        const result = await response.json();
        return { data: result as T, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    delete: async (table: string, id: string) => {
      try {
        const response = await fetch(`${this.baseUrl}/data/${table}/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          return { error: new Error('Delete failed') };
        }

        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    executeQuery: async <T = unknown>(query: string, params?: unknown[]) => {
      try {
        const response = await fetch(`${this.baseUrl}/data/query`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ query, params }),
        });

        if (!response.ok) {
          return { data: null, error: new Error('Query execution failed') };
        }

        const data = await response.json();
        return { data: data as T, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    subscribe: <T extends DatabaseRecord>(table: string, callback: (payload: any) => void) => {
      console.warn('Real-time subscriptions not implemented for PostgreSQL backend');
      return () => {};
    },
  };

  // ==================== Storage Service ====================
  
  storage: IStorageService = {
    upload: async (file, config) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', config.bucket);
        formData.append('path', config.path);

        const response = await fetch(`${this.baseUrl}/storage/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
          body: formData,
        });

        if (!response.ok) {
          return { data: null, error: new Error('Upload failed') };
        }

        const data = await response.json();
        return { data: data as FileUploadResult, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    download: async (bucket, path) => {
      try {
        const response = await fetch(
          `${this.baseUrl}/storage/${bucket}/${path}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          return { data: null, error: new Error('Download failed') };
        }

        const blob = await response.blob();
        return { data: blob, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    delete: async (bucket, path) => {
      try {
        const response = await fetch(
          `${this.baseUrl}/storage/${bucket}/${path}`,
          {
            method: 'DELETE',
            headers: this.getHeaders(),
          }
        );

        if (!response.ok) {
          return { error: new Error('Delete failed') };
        }

        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    getPublicUrl: (bucket, path) => {
      return `${this.baseUrl}/storage/public/${bucket}/${path}`;
    },

    getSignedUrl: async (bucket, path, expiresIn = 3600) => {
      try {
        const response = await fetch(`${this.baseUrl}/storage/signed-url`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ bucket, path, expiresIn }),
        });

        if (!response.ok) {
          return { data: null, error: new Error('Failed to get signed URL') };
        }

        const data = await response.json();
        return { data: { signedUrl: data.url }, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },

    list: async (bucket, path = '') => {
      try {
        const response = await fetch(
          `${this.baseUrl}/storage/${bucket}?path=${encodeURIComponent(path)}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          return { data: null, error: new Error('List failed') };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },
  };

  // ==================== Functions Service ====================
  
  functions: IFunctionsService = {
    invoke: async <TRequest = unknown, TResponse = unknown>(
      functionName: string,
      options?: { body?: TRequest; headers?: Record<string, string> }
    ) => {
      try {
        const response = await fetch(`${this.baseUrl}/functions/${functionName}`, {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          return { data: null, error: new Error('Function invocation failed') };
        }

        const data = await response.json();
        return { data: data as TResponse, error: null };
      } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },
  };

  // ==================== Helper Methods ====================
  
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.token || localStorage.getItem('pg_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}
