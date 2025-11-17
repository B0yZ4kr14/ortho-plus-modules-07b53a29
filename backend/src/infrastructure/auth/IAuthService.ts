/**
 * IAuthService - Abstração de autenticação
 * 
 * Permite trocar implementação (Supabase Auth <-> JWT local)
 * sem alterar lógica de negócio dos módulos.
 */

export interface User {
  id: string;
  email: string;
  clinicId: string;
  role: 'ADMIN' | 'MEMBER' | 'ROOT';
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  clinicId: string;
  role?: 'ADMIN' | 'MEMBER';
  metadata?: Record<string, any>;
}

export interface IAuthService {
  /**
   * Realiza login e retorna tokens
   */
  login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }>;

  /**
   * Cria novo usuário
   */
  signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }>;

  /**
   * Valida token de acesso e retorna usuário
   */
  verifyToken(accessToken: string): Promise<User>;

  /**
   * Renova token usando refresh token
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Realiza logout (invalida tokens)
   */
  logout(accessToken: string): Promise<void>;

  /**
   * Obtém usuário pelo ID
   */
  getUserById(userId: string): Promise<User | null>;

  /**
   * Atualiza metadados do usuário
   */
  updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<void>;

  /**
   * Verifica saúde do serviço de auth
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Tipo de implementação de autenticação
 */
export enum AuthType {
  SUPABASE_CLOUD = 'supabase_cloud',
  SUPABASE_SELF_HOSTED = 'supabase_self_hosted',
  JWT_LOCAL = 'jwt_local',
}
