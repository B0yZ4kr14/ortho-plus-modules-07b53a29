/**
 * PacientesController - API REST Controller
 * 
 * Expõe endpoints HTTP para operações de pacientes.
 */

import { Request, Response } from 'express';
import { CadastrarPacienteUseCase } from '../application/use-cases/CadastrarPacienteUseCase';
import { AlterarStatusPacienteUseCase } from '../application/use-cases/AlterarStatusPacienteUseCase';
import { IPatientRepository } from '../domain/repositories/IPatientRepository';
import { logger } from '@/infrastructure/logger';

export class PacientesController {
  constructor(
    private cadastrarPacienteUseCase: CadastrarPacienteUseCase,
    private alterarStatusUseCase: AlterarStatusPacienteUseCase,
    private patientRepository: IPatientRepository
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
      logger.error('Error creating patient', { error, body: req.body });
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
        isActive: req.query.isActive === 'true',
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
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
      logger.error('Error listing patients', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
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
          error: 'Paciente não encontrado',
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
      logger.error('Error getting patient', { error, patientId: req.params.id });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
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
          error: 'novoStatusCode é obrigatório',
        });
        return;
      }

      await this.alterarStatusUseCase.execute({
        patientId: id,
        clinicId: user.clinicId,
        novoStatusCode,
        reason: reason || 'Alteração manual',
        changedBy: user.id,
        metadata,
      });

      res.json({
        success: true,
        message: 'Status alterado com sucesso',
      });
    } catch (error: any) {
      logger.error('Error changing patient status', { error, patientId: req.params.id });
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
      logger.error('Error getting stats by status', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
