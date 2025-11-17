/**
 * Ortho+ Backend - API Gateway Entry Point
 */

import dotenv from 'dotenv';
import { ApiGateway } from '@/infrastructure/api/ApiGateway';
import { PostgresDatabaseConnection } from '@/infrastructure/database/PostgresDatabaseConnection';
import { JWTAuthService } from '@/infrastructure/auth/JWTAuthService';
import { eventBus } from '@/shared/events/EventBus';
import { logger } from '@/infrastructure/logger';

// Import module routers
import { pacientesRouter } from '@/modules/pacientes/api/router';

// Load environment variables
dotenv.config();

// Configuração de banco de dados por módulo (exemplo: Pacientes)
const dbPacientesConfig = {
  host: process.env.DB_PACIENTES_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_PACIENTES_NAME || 'pacientes',
  user: process.env.DB_USER || 'orthoplus',
  password: process.env.DB_PACIENTES_PASSWORD || '',
  schema: 'pacientes',
  ssl: process.env.DB_SSL === 'true',
};

// Inicializar serviços de infraestrutura
const dbPacientes = new PostgresDatabaseConnection(dbPacientesConfig);
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const authService = new JWTAuthService(dbPacientes, jwtSecret);

// Inicializar API Gateway
const apiGateway = new ApiGateway(authService);

// ========== REGISTRAR MÓDULOS ==========

// Módulo PACIENTES (Golden Pattern DDD)
apiGateway.registerModule({
  moduleName: 'pacientes',
  basePath: '/api/pacientes',
  router: pacientesRouter,
  requiresAuth: true,
});

logger.info('All modules registered successfully', {
  modules: ['pacientes'],
});

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
