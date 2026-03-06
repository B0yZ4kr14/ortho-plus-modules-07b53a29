/**
 * Pacientes Router - Rotas do módulo PACIENTES
 *
 * Define rotas HTTP e integra com controller.
 */

import { PostgresDatabaseConnection } from "@/infrastructure/database/PostgresDatabaseConnection";
import { Router } from "express";
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import { AtualizarPacienteUseCase } from "../application/use-cases/AtualizarPacienteUseCase";
import { CadastrarPacienteUseCase } from "../application/use-cases/CadastrarPacienteUseCase";
import { PatientRepositoryPostgres } from "../infrastructure/repositories/PatientRepositoryPostgres";
import { PacientesController } from "./PacientesController";

// Configuração de banco de dados do módulo PACIENTES
const dbConfig = {
  host: process.env.DB_PACIENTES_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_PACIENTES_NAME || "pacientes",
  user: process.env.DB_USER || "orthoplus",
  password: process.env.DB_PACIENTES_PASSWORD || "",
  schema: "pacientes",
  ssl: process.env.DB_SSL === "true",
};

// Injeção de dependências
const db = new PostgresDatabaseConnection(dbConfig);
const patientRepository = new PatientRepositoryPostgres(db);
const cadastrarUseCase = new CadastrarPacienteUseCase(patientRepository);
const atualizarUseCase = new AtualizarPacienteUseCase(patientRepository);
const alterarStatusUseCase = new AlterarStatusPacienteUseCase(
  patientRepository,
);

const controller = new PacientesController(
  cadastrarUseCase,
  atualizarUseCase,
  alterarStatusUseCase,
  patientRepository,
);

// Router
const router = Router();

// POST /api/pacientes - Cadastrar paciente
router.post("/", (req, res) => controller.create(req, res));

// PUT /api/pacientes/:id - Atualizar paciente
router.put("/:id", (req, res) => controller.update(req, res));

// GET /api/pacientes - Listar pacientes
router.get("/", (req, res) => controller.list(req, res));

// GET /api/pacientes/:id - Buscar paciente
router.get("/:id", (req, res) => controller.getById(req, res));

// PATCH /api/pacientes/:id/status - Alterar status
router.patch("/:id/status", (req, res) => controller.changeStatus(req, res));

// GET /api/pacientes/stats/by-status - Estatísticas por status
router.get("/stats/by-status", (req, res) =>
  controller.statsByStatus(req, res),
);

// POST /api/pacientes/auth - Auth de pacientes
router.post("/auth", (req, res) => controller.patientAuth(req, res));

// GET /api/pacientes/:id/timeline - Timeline de paciente
router.get("/:id/timeline", (req, res) =>
  controller.getPatientTimeline(req, res),
);

export { router as pacientesRouter };
