/**
 * IStorageService - Abstração de armazenamento de arquivos
 * 
 * Permite trocar implementação (Supabase Storage <-> MinIO local)
 * sem alterar lógica de negócio dos módulos.
 */

export interface UploadOptions {
  bucket: string;
  path: string;
  file: Buffer | ReadableStream;
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  publicUrl?: string;
}

export interface DownloadResult {
  data: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface ListOptions {
  bucket: string;
  prefix?: string;
  limit?: number;
  offset?: number;
}

export interface FileObject {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  metadata?: Record<string, string>;
}

export interface IStorageService {
  /**
   * Upload de arquivo
   */
  upload(options: UploadOptions): Promise<UploadResult>;

  /**
   * Download de arquivo
   */
  download(bucket: string, path: string): Promise<DownloadResult>;

  /**
   * Deleta arquivo
   */
  delete(bucket: string, path: string): Promise<void>;

  /**
   * Lista arquivos em bucket
   */
  list(options: ListOptions): Promise<FileObject[]>;

  /**
   * Obtém URL pública (se bucket for público)
   */
  getPublicUrl(bucket: string, path: string): string;

  /**
   * Gera URL assinada temporária
   */
  getSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string>;

  /**
   * Move/renomeia arquivo
   */
  move(bucket: string, fromPath: string, toPath: string): Promise<void>;

  /**
   * Copia arquivo
   */
  copy(bucket: string, fromPath: string, toPath: string): Promise<void>;

  /**
   * Cria bucket
   */
  createBucket(name: string, isPublic: boolean): Promise<void>;

  /**
   * Deleta bucket
   */
  deleteBucket(name: string): Promise<void>;

  /**
   * Verifica saúde do serviço de storage
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Tipo de implementação de storage
 */
export enum StorageType {
  SUPABASE_CLOUD = 'supabase_cloud',
  SUPABASE_SELF_HOSTED = 'supabase_self_hosted',
  MINIO_LOCAL = 'minio_local',
  S3_COMPATIBLE = 's3_compatible',
}
