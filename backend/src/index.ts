/**
 * Ortho+ Backend - API Gateway Entry Point
 */

import dotenv from 'dotenv';
dotenv.config();

import { PostgresDatabaseConnection } from '@/infrastructure/database/PostgresDatabaseConnection';
import { JWTAuthService } from '@/infrastructure/auth/JWTAuthService';
import { ApiGateway } from '@/infrastructure/api/ApiGateway';
import { eventBus } from '@/shared/events/EventBus';
import { logger } from '@/infrastructure/logger';
import { DatabaseType } from '@/infrastructure/database/IDatabaseConnection';
import { AuthType } from '@/infrastructure/auth/IAuthService';

// Import modular routers
import { createPacientesRouter } from '@/modules/pacientes/api/router';
import { createInventarioRouter } from '@/modules/inventario/api/router';
import { createConfiguracoesRouter } from '@/modules/configuracoes/api/router';
import { createPdvRouter } from '@/modules/pdv/api/router';
import { createFinanceiroRouter } from '@/modules/financeiro/api/router';
import { createPepRouter } from '@/modules/pep/api/router';
import { createFaturamentoRouter } from '@/modules/faturamento/api/router';
import { createDatabaseAdminRouter } from '@/modules/database_admin/api/router';
import { createBackupsRouter } from '@/modules/backups/api/router';
import { createCryptoConfigRouter } from '@/modules/crypto_config/api/router';
import { createGitHubToolsRouter } from '@/modules/github_tools/api/router';
import { createTerminalRouter } from '@/modules/terminal/api/router';

async function bootstrap() {
  try {
    logger.info('🚀 Ortho+ Backend starting...');

    // ===================================
    // 1. Initialize Database Connections (Schema-per-Module)
    // ===================================
    const dbConnections: Record<string, PostgresDatabaseConnection> = {};

    const schemas = [
      'public',
      'pacientes',
      'inventario',
      'pdv',
      'financeiro',
      'pep',
      'faturamento',
      'configuracoes',
      'database_admin',
      'backups',
      'crypto_config',
      'github_tools',
      'terminal',
    ];

    for (const schema of schemas) {
      const envPrefix = schema.toUpperCase().replace(/-/g, '_');
      dbConnections[schema] = new PostgresDatabaseConnection({
        type: DatabaseType.POSTGRES,
        config: {
          host: process.env[`${envPrefix}_DB_HOST`] || process.env.DB_HOST || 'localhost',
          port: parseInt(process.env[`${envPrefix}_DB_PORT`] || process.env.DB_PORT || '5432'),
          database: process.env[`${envPrefix}_DB_NAME`] || process.env.DB_NAME || 'orthoplus',
          user: process.env[`${envPrefix}_DB_USER`] || process.env.DB_USER || 'postgres',
          password: process.env[`${envPrefix}_DB_PASSWORD`] || process.env.DB_PASSWORD || '',
          schema,
        },
      });

      await dbConnections[schema].connect();
      logger.info(`Database connected for schema: ${schema}`);
    }

    // ===================================
    // 2. Initialize Auth Service
    // ===================================
    const authService = new JWTAuthService(
      {
        type: AuthType.JWT,
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        jwtExpiresIn: '24h',
      },
      dbConnections.public
    );
    logger.info('Auth service initialized');

    // ===================================
    // 3. Initialize API Gateway
    // ===================================
    const apiGateway = new ApiGateway(authService);

    // Register public auth routes
    const authRouter = authService.createAuthRouter();
    apiGateway.registerModule({
      moduleName: 'auth',
      basePath: '/api/auth',
      router: authRouter,
      requiresAuth: false,
    });

    // Register protected modular routes
    apiGateway.registerModule({
      moduleName: 'pacientes',
      basePath: '/api/pacientes',
      router: createPacientesRouter(dbConnections.pacientes),
      requiresAuth: true,
    });

    apiGateway.registerModule({
      moduleName: 'inventario',
      basePath: '/api/inventario',
      router: createInventarioRouter(dbConnections.inventario),
      requiresAuth: true,
    });

    apiGateway.registerModule({
      moduleName: 'configuracoes',
      basePath: '/api/configuracoes',
      router: createConfiguracoesRouter(dbConnections.configuracoes),
      requiresAuth: true,
    });

    apiGateway.registerModule({
      moduleName: 'pdv',
      basePath: '/api/pdv',
      router: createPdvRouter(),
      requiresAuth: true,
    });

    apiGateway.registerModule({
      moduleName: 'financeiro',
      basePath: '/api/financeiro',
      router: createFinanceiroRouter(),
      requiresAuth: true,
    });

    apiGateway.registerModule({
      moduleName: 'pep',
      basePath: '/api/pep',
      router: createPepRouter(),
      requiresAuth: true,
    });

    apiGateway.registerModule({
      moduleName: 'faturamento',
      basePath: '/api/faturamento',
      router: createFaturamentoRouter(),
      requiresAuth: true,
    });

    logger.info('All modules registered successfully');

// ========== EVENT BUS SUBSCRIBERS ==========

// Subscribe to domain events
eventBus.subscribe('Pacientes.PacienteCadastrado', (event) => {
  logger.info('Domain Event: Paciente cadastrado', {
    patientId: event.payload.patientId,
    patientName: event.payload.patientName,
  });
  
  // Aqui outros módulos podem reagir ao evento
  // Ex: Módulo FINANCEIRO cria conta a receber inicial
  // Ex: Módulo CRM atualiza funil de vendas
});

eventBus.subscribe('Pacientes.StatusAlterado', (event) => {
  logger.info('Domain Event: Status do paciente alterado', {
    patientId: event.payload.patientId,
    fromStatus: event.payload.fromStatus,
    toStatus: event.payload.toStatus,
  });
  
  // Outros módulos podem reagir à mudança de status
});

// System started event
eventBus.publish({
  eventId: crypto.randomUUID(),
  eventType: 'System.Started',
  aggregateId: 'system',
  aggregateType: 'System',
  payload: {
    modules: ['pacientes'],
    environment: process.env.NODE_ENV,
  },
  metadata: {
    timestamp: new Date().toISOString(),
  },
});

// Iniciar servidor
const PORT = parseInt(process.env.PORT || '3001');
apiGateway.listen(PORT);

logger.info('Ortho+ Backend started successfully', {
  port: PORT,
  environment: process.env.NODE_ENV,
  registeredModules: ['pacientes'],
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await dbPacientes.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await dbPacientes.close();
  process.exit(0);
});
