import { Module } from '@/domain/entities/Module';
import { IModuleRepository } from '@/domain/repositories/IModuleRepository';
import { NotFoundError, ValidationError, UnauthorizedError } from '@/infrastructure/errors';

interface ToggleModuleStateDTO {
  moduleKey: string;
  clinicId: string;
  requestingUserRole: string;
}

/**
 * Toggle Module State Use Case
 * 
 * Implementa a lógica de ativação/desativação de módulos.
 * 
 * REGRAS DE NEGÓCIO:
 * 1. Apenas ADMINs podem ativar/desativar módulos
 * 2. Deve verificar dependências antes de ativar
 * 3. Deve verificar dependentes antes de desativar
 * 
 * NOTA: A verificação de dependências será implementada na FASE 2
 * quando criarmos a tabela module_dependencies e a edge function completa.
 */
export class ToggleModuleStateUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(dto: ToggleModuleStateDTO): Promise<Module> {
    // Verificar permissão
    if (dto.requestingUserRole !== 'ADMIN') {
      throw new UnauthorizedError('Apenas administradores podem gerenciar módulos');
    }

    // Buscar módulo
    const module = await this.moduleRepository.findByKey(dto.moduleKey);

    if (!module) {
      throw new NotFoundError('Módulo', dto.moduleKey);
    }

    // Toggle state usando métodos de domínio
    if (module.isActive) {
      // TODO: Verificar dependências reversas antes de desativar (FASE 2)
      module.deactivate();
      await this.moduleRepository.deactivate(module.id, dto.clinicId);
    } else {
      // TODO: Verificar dependências antes de ativar (FASE 2)
      module.activate();
      await this.moduleRepository.activate(module.id, dto.clinicId);
    }

    // Retornar módulo atualizado
    return this.moduleRepository.findByKey(dto.moduleKey) as Promise<Module>;
  }
}
