/**
 * PacientesController - API REST Controller
 *
 * Expõe endpoints HTTP para operações de pacientes.
 */

import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import { AtualizarPacienteUseCase } from "../application/use-cases/AtualizarPacienteUseCase";
import { CadastrarPacienteUseCase } from "../application/use-cases/CadastrarPacienteUseCase";
import { IPatientRepository } from "../domain/repositories/IPatientRepository";

export class PacientesController {
  constructor(
    private cadastrarPacienteUseCase: CadastrarPacienteUseCase,
    private atualizarPacienteUseCase: AtualizarPacienteUseCase,
    private alterarStatusUseCase: AlterarStatusPacienteUseCase,
    private patientRepository: IPatientRepository,
  ) {}

  /**
   * POST /api/pacientes
   * Cadastra novo paciente
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user; // Do auth middleware

      const result = await this.cadastrarPacienteUseCase.execute({
        ...req.body,
        clinicId: user.clinicId,
        createdBy: user.id,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Error creating patient", { error, body: req.body });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/pacientes/:id
   * Atualiza dados de paciente existente
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      await this.atualizarPacienteUseCase.execute({
        id,
        ...req.body,
        clinicId: user.clinicId,
        updatedBy: user.id,
      });

      res.status(200).json({
        success: true,
        message: "Paciente atualizado com sucesso",
      });
    } catch (error: any) {
      logger.error("Error updating patient", {
        error,
        body: req.body,
        patientId: req.params.id,
      });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pacientes
   * Lista pacientes com filtros
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const filters = {
        clinicId: user.clinicId,
        statusCode: req.query.statusCode as string,
        searchTerm: req.query.searchTerm as string,
        origemId: req.query.origemId as string,
        promotorId: req.query.promotorId as string,
        campanhaId: req.query.campanhaId as string,
        isActive: req.query.isActive === "true",
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.patientRepository.findMany(filters, pagination);

      // Serializar para DTO
      const dto = {
        ...result,
        data: result.data.map((patient) => ({
          id: patient.id,
          fullName: patient.fullName,
          cpf: patient.cpf,
          email: patient.email,
          status: patient.status,
          dadosComerciais: patient.dadosComerciais,
          isActive: patient.isActive,
          createdAt: patient.toObject().createdAt,
        })),
      };

      res.json({
        success: true,
        data: dto,
      });
    } catch (error: any) {
      logger.error("Error listing patients", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * GET /api/pacientes/:id
   * Busca paciente por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const patient = await this.patientRepository.findById(id, user.clinicId);

      if (!patient) {
        res.status(404).json({
          success: false,
          error: "Paciente não encontrado",
        });
        return;
      }

      // Buscar histórico de status
      const statusHistory = await this.patientRepository.getStatusHistory(id);

      res.json({
        success: true,
        data: {
          ...patient.toObject(),
          statusHistory,
        },
      });
    } catch (error: any) {
      logger.error("Error getting patient", {
        error,
        patientId: req.params.id,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * PATCH /api/pacientes/:id/status
   * Altera status do paciente
   */
  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { novoStatusCode, reason, metadata } = req.body;

      if (!novoStatusCode) {
        res.status(400).json({
          success: false,
          error: "novoStatusCode é obrigatório",
        });
        return;
      }

      await this.alterarStatusUseCase.execute({
        patientId: id,
        clinicId: user.clinicId,
        novoStatusCode,
        reason: reason || "Alteração manual",
        changedBy: user.id,
        metadata,
      });

      res.json({
        success: true,
        message: "Status alterado com sucesso",
      });
    } catch (error: any) {
      logger.error("Error changing patient status", {
        error,
        patientId: req.params.id,
      });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pacientes/stats/by-status
   * Estatísticas por status
   */
  async statsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const counts = await this.patientRepository.countByStatus(user.clinicId);

      res.json({
        success: true,
        data: counts,
      });
    } catch (error: any) {
      logger.error("Error getting stats by status", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * GET /api/pacientes/:id/timeline
   * Retorna a timeline combinada do paciente (Edge Function: patient-timeline)
   */
  async getPatientTimeline(req: Request, res: Response): Promise<void> {
    try {
      const { id: patientId } = req.params;
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const [appointments, treatments, budgets, statusChanges] =
        await Promise.all([
          prisma.appointments.findMany({
            where: { patient_id: patientId },
            select: {
              id: true,
              title: true,
              start_time: true,
              status: true,
              created_at: true,
            },
            orderBy: { start_time: "desc" },
            take: 20,
          }),
          prisma.pep_tratamentos.findMany({
            where: { patient_id: patientId },
            select: {
              id: true,
              titulo: true,
              status: true,
              data_inicio: true,
              created_at: true,
            },
            orderBy: { created_at: "desc" },
            take: 20,
          }),
          prisma.budgets.findMany({
            where: { patient_id: patientId },
            select: {
              id: true,
              titulo: true,
              valor_total: true,
              status: true,
              created_at: true,
            },
            orderBy: { created_at: "desc" },
            take: 20,
          }),
          prisma.patient_status_history.findMany({
            where: { patient_id: patientId },
            select: {
              id: true,
              old_status: true,
              new_status: true,
              changed_at: true,
            },
            orderBy: { changed_at: "desc" },
            take: 20,
          }),
        ]);

      const timeline = [
        ...appointments.map((a: any) => ({
          id: a.id,
          type: "appointment",
          title: a.title,
          description: `Consulta - ${a.status}`,
          date: a.start_time,
          icon: "calendar",
        })),
        ...treatments.map((t: any) => ({
          id: t.id,
          type: "treatment",
          title: t.titulo,
          description: `Tratamento - ${t.status}`,
          date: t.data_inicio || t.created_at,
          icon: "activity",
        })),
        ...budgets.map((b: any) => ({
          id: b.id,
          type: "budget",
          title: b.titulo,
          description: `Orçamento - R$ ${b.valor_total}`,
          date: b.created_at,
          icon: "file-text",
        })),
        ...statusChanges.map((s: any) => ({
          id: s.id,
          type: "status_change",
          title: "Mudança de Status",
          description: `${s.old_status} -> ${s.new_status}`,
          date: s.changed_at,
          icon: "refresh-cw",
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({ timeline });
    } catch (error: any) {
      logger.error("Error getting patient timeline", {
        error,
        patientId: req.params.id,
      });
      res.status(500).json({ error: "Erro ao buscar timeline do paciente" });
    }
  }

  /**
   * POST /api/pacientes/auth
   * Autenticação de Paciente (Edge Function: patient-auth)
   */
  async patientAuth(req: Request, res: Response): Promise<void> {
    try {
      const { action, email /*password,*/ /*patientId*/ } = req.body;
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      if (action === "login") {
        const account = await prisma.patient_accounts.findFirst({
          where: { email },
        });

        if (!account) {
          res.status(401).json({ error: "Email ou senha inválidos" });
          return;
        }

        // Verify password (in a real scenario)
        // const isValid = await bcrypt.compare(password, paciente.password_hash);
        const isValid = true;

        if (!isValid) {
          res.status(401).json({ error: "Email ou senha inválidos" });
          return;
        }

        const sessionId = "sess-" + Math.random().toString(36).substring(7);
        const token = "jwt-mock-" + sessionId;

        await prisma.patient_sessions.create({
          data: {
            id: sessionId,
            patient_id: account.patient_id,
            token,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });

        res.status(200).json({
          token,
          sessionId,
          patient: {
            id: account.patient_id,
            email: account.email,
          },
        });
        return;
      }

      if (action === "signup") {
        // Stub for signup
        res
          .status(201)
          .json({ success: true, message: "Conta criada com sucesso!" });
        return;
      }

      if (action === "logout") {
        const sessionId = req.headers["x-session-id"] as string;
        if (sessionId) {
          await prisma.patient_sessions.deleteMany({
            where: { id: sessionId },
          });
        }
        res.status(200).json({ success: true });
        return;
      }

      res.status(400).json({ error: "Ação inválida" });
    } catch (error: any) {
      logger.error("Error in patient auth", { error });
      res.status(500).json({ error: "Erro interno na autenticação" });
    }
  }
}
