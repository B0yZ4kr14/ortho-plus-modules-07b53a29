/**
 * Supabase Implementation of Backend Service
 */

import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import type {
  IBackendService,
  IAuthService,
  IDataService,
  IStorageService,
  IFunctionsService,
  QueryOptions,
} from './IBackendService';
import type {
  DatabaseRecord,
  PaginatedResponse,
  FileUploadResult,
  StorageConfig,
} from '@/types/common';

// ==================== Supabase Auth Service ====================

class SupabaseAuthService implements IAuthService {
  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      return {
        user: data.user,
        session: data.session,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('Sign up failed', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('Sign in failed', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Sign out failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Get session failed', error);
      return { session: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { user: data.user, error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Get user failed', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Reset password failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Update password failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => subscription.unsubscribe();
  }
}

// ==================== Supabase Data Service ====================

class SupabaseDataService implements IDataService {
  async query<T extends DatabaseRecord>(
    table: string,
    options?: QueryOptions
  ): Promise<{ data: T[]; error: Error | null }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = (supabase as any).from(table).select('*');
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query = (query as any).eq(key, value);
          }
        });
      }
      
      if (options?.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        logger.error('Query failed', { table, error });
        return { data: [], error: new Error(error.message) };
      }
      
      return { data: (data as unknown as T[]) || [], error: null };
    } catch (err) {
      logger.error('Query exception', { table, error: err });
      return { 
        data: [], 
        error: err instanceof Error ? err : new Error('Unknown error occurred')
      };
    }
  }

  async queryPaginated<T extends DatabaseRecord>(
    table: string,
    options?: QueryOptions
  ): Promise<{ data: PaginatedResponse<T>; error: Error | null }> {
    try {
      const page = Math.floor((options?.offset || 0) / (options?.limit || 10)) + 1;
      const limit = options?.limit || 10;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let countQuery: any = (supabase as any).from(table).select('*', { count: 'exact', head: true });
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            countQuery = (countQuery as any).eq(key, value);
          }
        });
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        logger.error('Count query failed', { table, error: countError });
        return {
          data: { data: [], total: 0, page: 1, limit: 10, hasMore: false },
          error: new Error(countError.message),
        };
      }

      const result = await this.query<T>(table, options);
      if (result.error) {
        return {
          data: { data: [], total: 0, page: 1, limit: 10, hasMore: false },
          error: result.error,
        };
      }

      const total = count || 0;
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
      logger.error('Paginated query exception', { table, error: err });
      return {
        data: { data: [], total: 0, page: 1, limit: 10, hasMore: false },
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async getById<T extends DatabaseRecord>(
    table: string,
    id: string
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        logger.error('Get by ID failed', { table, id, error });
        return { data: null, error: new Error(error.message) };
      }
      
      return { data: data as unknown as T, error: null };
    } catch (err) {
      logger.error('Get by ID exception', { table, id, error: err });
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Unknown error occurred')
      };
    }
  }

  async create<T extends DatabaseRecord>(
    table: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase as any)
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        logger.error('Create failed', { table, error });
        return { data: null, error: new Error(error.message) };
      }
      
      return { data: result as unknown as T, error: null };
    } catch (err) {
      logger.error('Create exception', { table, error: err });
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Unknown error occurred')
      };
    }
  }

  async update<T extends DatabaseRecord>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase as any)
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Update failed', { table, id, error });
        return { data: null, error: new Error(error.message) };
      }
      
      return { data: result as unknown as T, error: null };
    } catch (err) {
      logger.error('Update exception', { table, id, error: err });
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Unknown error occurred')
      };
    }
  }

  async delete(
    table: string,
    id: string
  ): Promise<{ error: Error | null }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Delete failed', { table, id, error });
        return { error: new Error(error.message) };
      }
      
      return { error: null };
    } catch (err) {
      logger.error('Delete exception', { table, id, error: err });
      return { 
        error: err instanceof Error ? err : new Error('Unknown error occurred')
      };
    }
  }

  async executeQuery<T = unknown>(
    query: string,
    params?: unknown[]
  ): Promise<{ data: T | null; error: Error | null }> {
    logger.warn('executeQuery not implemented for Supabase - use RPC instead');
    return {
      data: null,
      error: new Error('Raw SQL execution not supported. Use Supabase RPC instead.'),
    };
  }

  subscribe<T extends DatabaseRecord>(
    table: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: T; old: T }) => void
  ) {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// ==================== Supabase Storage Service ====================

class SupabaseStorageService implements IStorageService {
  async upload(
    file: File,
    config: StorageConfig
  ): Promise<{ data: FileUploadResult | null; error: Error | null }> {
    try {
      const filePath = `${config.path}/${file.name}`;
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, file, { upsert: config.upsert });

      if (error) {
        logger.error('Upload failed', { bucket: config.bucket, path: filePath, error });
        return { data: null, error: new Error(error.message) };
      }

      const publicUrl = this.getPublicUrl(config.bucket, data.path);

      return {
        data: {
          url: publicUrl,
          path: data.path,
          filename: file.name,
          size: file.size,
          mime_type: file.type,
          bucket: config.bucket,
        },
        error: null,
      };
    } catch (err) {
      logger.error('Upload exception', { config, error: err });
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async download(
    bucket: string,
    path: string
  ): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).download(path);

      if (error) {
        logger.error('Download failed', { bucket, path, error });
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      logger.error('Download exception', { bucket, path, error: err });
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async delete(
    bucket: string,
    path: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        logger.error('Delete file failed', { bucket, path, error });
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      logger.error('Delete file exception', { bucket, path, error: err });
      return {
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        logger.error('Get signed URL failed', { bucket, path, error });
        return { data: null, error: new Error(error.message) };
      }

      return { data: { signedUrl: data.signedUrl }, error: null };
    } catch (err) {
      logger.error('Get signed URL exception', { bucket, path, error: err });
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async list(
    bucket: string,
    path = ''
  ): Promise<{ data: Array<{ name: string; size: number }> | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path);

      if (error) {
        logger.error('List files failed', { bucket, path, error });
        return { data: null, error: new Error(error.message) };
      }

      return {
        data: data.map((file) => ({
          name: file.name,
          size: file.metadata?.size || 0,
        })),
        error: null,
      };
    } catch (err) {
      logger.error('List files exception', { bucket, path, error: err });
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }
}

// ==================== Supabase Functions Service ====================

class SupabaseFunctionsService implements IFunctionsService {
  async invoke<TRequest = unknown, TResponse = unknown>(
    functionName: string,
    options?: {
      body?: TRequest;
      headers?: Record<string, string>;
    }
  ): Promise<{ data: TResponse | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: options?.body,
        headers: options?.headers,
      });

      if (error) {
        logger.error('Function invocation failed', { functionName, error });
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TResponse, error: null };
    } catch (err) {
      logger.error('Function invocation exception', { functionName, error: err });
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }
}

// ==================== Complete Supabase Backend Service ====================

export class SupabaseBackendService implements IBackendService {
  auth: IAuthService;
  data: IDataService;
  storage: IStorageService;
  functions: IFunctionsService;

  constructor() {
    this.auth = new SupabaseAuthService();
    this.data = new SupabaseDataService();
    this.storage = new SupabaseStorageService();
    this.functions = new SupabaseFunctionsService();
  }

  getBackendType(): 'supabase' | 'postgresql' {
    return 'supabase';
  }

  async isReady(): Promise<boolean> {
    try {
      const { error } = await supabase.from('clinics').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}
