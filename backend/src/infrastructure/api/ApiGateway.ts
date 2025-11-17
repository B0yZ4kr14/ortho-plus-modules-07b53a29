/**
 * API Gateway - Ponto único de entrada para todos os módulos
 * 
 * Responsabilidades:
 * - Roteamento para módulos
 * - Autenticação/Autorização
 * - Rate limiting
 * - Logging
 * - Error handling
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { IAuthService } from '@/infrastructure/auth/IAuthService';
import { logger } from '@/infrastructure/logger';

export interface ModuleRouter {
  moduleName: string;
  basePath: string;
  router: Router;
  requiresAuth?: boolean;
}

export class ApiGateway {
  private app: express.Application;
  private authService: IAuthService;
  private moduleRouters: Map<string, ModuleRouter> = new Map();

  constructor(authService: IAuthService) {
    this.app = express();
    this.authService = authService;
    this.setupMiddlewares();
  }

  private setupMiddlewares(): void {
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
        });
      });
      next();
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        modules: Array.from(this.moduleRouters.keys()),
      });
    });
  }

  /**
   * Registra roteador de módulo
   */
  registerModule(moduleRouter: ModuleRouter): void {
    const { moduleName, basePath, router, requiresAuth = true } = moduleRouter;

    // Middleware de autenticação (se necessário)
    if (requiresAuth) {
      this.app.use(basePath, this.authMiddleware.bind(this));
    }

    // Registrar router
    this.app.use(basePath, router);

    this.moduleRouters.set(moduleName, moduleRouter);

    logger.info('Module router registered', {
      moduleName,
      basePath,
      requiresAuth,
    });
  }

  /**
   * Middleware de autenticação JWT
   */
  private async authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);

      // Adicionar usuário ao request
      (req as any).user = user;

      next();
    } catch (error) {
      logger.warn('Authentication failed', { error, path: req.path });
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  /**
   * Error handler global
   */
  setupErrorHandler(): void {
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error('Unhandled error', {
          error: err,
          method: req.method,
          path: req.path,
        });

        res.status(500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
      }
    );
  }

  /**
   * Retorna app Express
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Inicia servidor
   */
  listen(port: number): void {
    this.setupErrorHandler();

    this.app.listen(port, () => {
      logger.info('API Gateway started', {
        port,
        modules: Array.from(this.moduleRouters.keys()),
      });
    });
  }
}
