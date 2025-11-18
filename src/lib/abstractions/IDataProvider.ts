/**
 * ABSTRAÇÃO DE PORTABILIDADE - Interface para Data Providers
 * Permite alternar entre Supabase Cloud e Backend REST (Ubuntu on-premises) de forma transparente
 */

export interface IDataProvider {
  readonly name: string;
  readonly isConnected: boolean;

  // Auth
  signIn(email: string, password: string): Promise<{ user: any; session: any }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<any>;
  
  // CRUD Operations
  query<T>(table: string, filters?: Record<string, any>): Promise<T[]>;
  getById<T>(table: string, id: string): Promise<T | null>;
  create<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  
  // Realtime (se suportado)
  subscribe?(table: string, callback: (payload: any) => void): () => void;
  
  // Storage
  uploadFile?(bucket: string, path: string, file: File): Promise<string>;
  downloadFile?(bucket: string, path: string): Promise<Blob>;
  deleteFile?(bucket: string, path: string): Promise<void>;
}

/**
 * Factory para criar provider baseado na configuração
 */
export class DataProviderFactory {
  private static provider: IDataProvider | null = null;

  static getProvider(): IDataProvider {
    if (!this.provider) {
      const providerType = import.meta.env.VITE_DATA_PROVIDER || 'rest-api';
      
      switch (providerType) {
        case 'supabase':
          this.provider = new SupabaseDataProvider();
          break;
        case 'rest-api':
        default:
          this.provider = new RestAPIDataProvider();
          break;
      }
    }
    
    return this.provider;
  }

  static setProvider(provider: IDataProvider): void {
    this.provider = provider;
  }
}

/**
 * REST API Implementation (Ubuntu on-premises)
 */
class RestAPIDataProvider implements IDataProvider {
  name = 'REST API (Ubuntu)';
  isConnected = true;

  async signIn(email: string, password: string) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async signOut() {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`);
    return response.json();
  }

  async query<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}?${params}`);
    return response.json();
  }

  async getById<T>(table: string, id: string): Promise<T | null> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}/${id}`);
    return response.json();
  }

  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(table: string, id: string): Promise<void> {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Supabase Implementation (Cloud)
 */
class SupabaseDataProvider implements IDataProvider {
  name = 'Supabase Cloud';
  isConnected = false;
  private supabase: any;

  constructor() {
    // Lazy load Supabase apenas se necessário
    import('@/integrations/supabase/client').then(({ supabase }) => {
      this.supabase = supabase;
      this.isConnected = true;
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async query<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    let query = this.supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  subscribe(table: string, callback: (payload: any) => void): () => void {
    const channel = this.supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
    
    return () => channel.unsubscribe();
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data.path;
  }

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
}
