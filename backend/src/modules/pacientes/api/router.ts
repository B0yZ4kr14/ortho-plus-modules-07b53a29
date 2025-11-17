/**
 * Pacientes Router - Rotas do módulo PACIENTES
 * 
 * Define rotas HTTP e integra com controller.
 */

import { Router } from 'express';
import { PacientesController } from './PacientesController';
import { CadastrarPacienteUseCase } from '../application/use-cases/CadastrarPacienteUseCase';
import { AlterarStatusPacienteUseCase } from '../application/use-cases/AlterarStatusPacienteUseCase';
import { PatientRepositoryPostgres } from '../infrastructure/repositories/PatientRepositoryPostgres';
import { PostgresDatabaseConnection } from '@/infrastructure/database/PostgresDatabaseConnection';

// Configuração de banco de dados do módulo PACIENTES
const dbConfig = {
  host: process.env.DB_PACIENTES_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_PACIENTES_NAME || 'pacientes',
  user: process.env.DB_USER || 'orthoplus',
  password: process.env.DB_PACIENTES_PASSWORD || '',
  schema: 'pacientes',
  ssl: process.env.DB_SSL === 'true',
};

// Injeção de dependências
const db = new PostgresDatabaseConnection(dbConfig);
const patientRepository = new PatientRepositoryPostgres(db);
const cadastrarUseCase = new CadastrarPacienteUseCase(patientRepository);
const alterarStatusUseCase = new AlterarStatusPacienteUseCase(patientRepository);

const controller = new PacientesController(
  cadastrarUseCase,
  alterarStatusUseCase,
  patientRepository
);

// Router
const router = Router();

// POST /api/pacientes - Cadastrar paciente
router.post('/', (req, res) => controller.create(req, res));

// GET /api/pacientes - Listar pacientes
router.get('/', (req, res) => controller.list(req, res));

// GET /api/pacientes/:id - Buscar paciente
router.get('/:id', (req, res) => controller.getById(req, res));

// PATCH /api/pacientes/:id/status - Alterar status
router.patch('/:id/status', (req, res) => controller.changeStatus(req, res));

// GET /api/pacientes/stats/by-status - Estatísticas por status
router.get('/stats/by-status', (req, res) => controller.statsByStatus(req, res));

export { router as pacientesRouter };
