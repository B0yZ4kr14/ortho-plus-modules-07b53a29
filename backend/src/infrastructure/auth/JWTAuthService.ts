/**
 * JWTAuthService - Implementação JWT local
 * 
 * Para uso on-premises sem Supabase Auth
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  IAuthService,
  User,
  AuthTokens,
  LoginCredentials,
  SignupData,
} from './IAuthService';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { logger } from '@/infrastructure/logger';

interface JWTPayload {
  userId: string;
  email: string;
  clinicId: string;
  role: string;
}

export class JWTAuthService implements IAuthService {
  private db: IDatabaseConnection;
  private jwtSecret: string;
  private jwtExpiresIn: string = '8h';
  private refreshExpiresIn: string = '7d';

  constructor(db: IDatabaseConnection, jwtSecret: string) {
    this.db = db;
    this.jwtSecret = jwtSecret;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Buscar usuário
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, p.clinic_id, p.app_role, u.encrypted_password
       FROM auth.users u
       INNER JOIN profiles p ON p.id = u.id
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verificar senha
    const isValid = await bcrypt.compare(password, user.encrypted_password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Gerar tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      clinicId: user.clinic_id,
      role: user.app_role,
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        clinicId: user.clinic_id,
        role: user.app_role,
      },
      tokens,
    };
  }

  async signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, clinicId, role = 'MEMBER', metadata } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Iniciar transação
    const tx = await this.db.beginTransaction();

    try {
      // Criar usuário em auth.users
      const userResult = await tx.query<any>(
        `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW(), NOW())
         RETURNING id, email`,
        [email, hashedPassword]
      );

      const userId = userResult.rows[0].id;

      // Criar perfil
      await tx.query(
        `INSERT INTO profiles (id, clinic_id, app_role, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [userId, clinicId, role]
      );

      await tx.commit();

      // Gerar tokens
      const tokens = this.generateTokens({
        userId,
        email,
        clinicId,
        role,
      });

      logger.info('User signed up', { userId, email, clinicId, role });

      return {
        user: {
          id: userId,
          email,
          clinicId,
          role,
          metadata,
        },
        tokens,
      };
    } catch (error) {
      await tx.rollback();
      logger.error('Signup failed', { error, email });
      throw error;
    }
  }

  async verifyToken(accessToken: string): Promise<User> {
    try {
      const payload = jwt.verify(accessToken, this.jwtSecret) as JWTPayload;

      return {
        id: payload.userId,
        email: payload.email,
        clinicId: payload.clinicId,
        role: payload.role as any,
      };
    } catch (error) {
      logger.warn('Token verification failed', { error });
      throw new Error('Invalid or expired token');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as JWTPayload;

      return this.generateTokens({
        userId: payload.userId,
        email: payload.email,
        clinicId: payload.clinicId,
        role: payload.role,
      });
    } catch (error) {
      logger.warn('Refresh token verification failed', { error });
      throw new Error('Invalid or expired refresh token');
    }
  }

  async logout(accessToken: string): Promise<void> {
    // Em implementação JWT stateless, logout é feito no client
    // Aqui poderíamos adicionar token à blacklist em Redis
    logger.info('User logged out');
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, p.clinic_id, p.app_role
       FROM auth.users u
       INNER JOIN profiles p ON p.id = u.id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      clinicId: user.clinic_id,
      role: user.app_role,
    };
  }

  async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<void> {
    await this.db.query(
      `UPDATE auth.users 
       SET raw_user_meta_data = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(metadata), userId]
    );

    logger.info('User metadata updated', { userId });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.db.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Auth health check failed', { error });
      return false;
    }
  }

  private generateTokens(payload: JWTPayload): AuthTokens {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 8 * 60 * 60, // 8 hours in seconds
    };
  }
}
