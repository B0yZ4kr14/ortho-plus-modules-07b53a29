/**
 * Ortho+ Backend - API Gateway Entry Point
 */

import dotenv from 'dotenv';
import { ApiGateway } from '@/infrastructure/api/ApiGateway';
import { PostgresDatabaseConnection } from '@/infrastructure/database/PostgresDatabaseConnection';
import { JWTAuthService } from '@/infrastructure/auth/JWTAuthService';
import { eventBus } from '@/shared/events/EventBus';
import { logger } from '@/infrastructure/logger';

// Load environment variables
dotenv.config();

// Configuração de banco de dados por módulo (exemplo: Pacientes)
const dbPacientesConfig = {
  host: process.env.DB_PACIENTES_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_PACIENTES_NAME || 'pacientes',
  user: process.env.DB_USER || 'orthoplus',
  password: process.env.DB_PACIENTES_PASSWORD || '',
  schema: 'public',
  ssl: process.env.DB_SSL === 'true',
};

// Inicializar serviços de infraestrutura
const dbPacientes = new PostgresDatabaseConnection(dbPacientesConfig);
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const authService = new JWTAuthService(dbPacientes, jwtSecret);

// Inicializar API Gateway
const apiGateway = new ApiGateway(authService);

// TODO: Registrar módulos aqui
// Exemplo:
// import { inventarioRouter } from '@/modules/inventario/api/router';
// apiGateway.registerModule({
//   moduleName: 'inventario',
//   basePath: '/api/inventario',
//   router: inventarioRouter,
//   requiresAuth: true,
// });

// Testar EventBus
eventBus.subscribe('System.Started', (event) => {
  logger.info('System started event received', { event });
});

eventBus.publish({
  eventId: crypto.randomUUID(),
  eventType: 'System.Started',
  aggregateId: 'system',
  aggregateType: 'System',
  payload: {},
  metadata: {
    timestamp: new Date().toISOString(),
  },
});

// Iniciar servidor
const PORT = parseInt(process.env.PORT || '3001');
apiGateway.listen(PORT);

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
