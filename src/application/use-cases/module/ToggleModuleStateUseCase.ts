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

    // Toggle state usando métodos de domínio com verificações de dependência
    if (module.isActive) {
      // DESATIVAÇÃO: Verificar se há módulos ativos que dependem deste
      await this.validateDeactivation(dto.moduleKey, dto.clinicId);
      module.deactivate();
      await this.moduleRepository.deactivate(module.id, dto.clinicId);
    } else {
      // ATIVAÇÃO: Verificar se todas as dependências estão ativas
      await this.validateActivation(dto.moduleKey, dto.clinicId);
      module.activate();
      await this.moduleRepository.activate(module.id, dto.clinicId);
    }

    // Retornar módulo atualizado
    return this.moduleRepository.findByKey(dto.moduleKey) as Promise<Module>;
  }

  /**
   * Valida se um módulo pode ser ativado (todas as dependências devem estar ativas)
   */
  private async validateActivation(moduleKey: string, clinicId: string): Promise<void> {
    // Buscar dependências requeridas
    const dependencies = await this.moduleRepository.findDependencies(moduleKey);

    if (dependencies.length === 0) {
      return; // Módulo não tem dependências
    }

    // Buscar módulos ativos da clínica
    const activeModules = await this.moduleRepository.findActiveByClinicId(clinicId);
    const activeModuleKeys = activeModules.map(m => m.moduleKey.getValue());

    // Verificar se todas as dependências estão ativas
    const missingDeps = dependencies.filter(
      dep => !activeModuleKeys.includes(dep.depends_on_module_key)
    );

    if (missingDeps.length > 0) {
      const missingNames = missingDeps.map(d => d.depends_on_module_name).join(', ');
      throw new ValidationError(
        `Não é possível ativar este módulo. Requer o(s) módulo(s): ${missingNames}`
      );
    }
  }

  /**
   * Valida se um módulo pode ser desativado (nenhum módulo ativo deve depender dele)
   */
  private async validateDeactivation(moduleKey: string, clinicId: string): Promise<void> {
    // Buscar módulos ativos que dependem deste
    const activeDependents = await this.moduleRepository.findDependentsActive(moduleKey, clinicId);

    if (activeDependents.length > 0) {
      const dependentNames = activeDependents.map(d => d.name).join(', ');
      throw new ValidationError(
        `Não é possível desativar este módulo. O(s) módulo(s) ativo(s) ${dependentNames} depende(m) dele. Desative-os primeiro.`
      );
    }
  }
}
